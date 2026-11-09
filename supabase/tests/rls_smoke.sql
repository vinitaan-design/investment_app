-- Row-level security smoke test. Safe to run on any environment: it creates throwaway
-- users and data, checks the access rules, then raises an exception so EVERYTHING rolls
-- back. Success = the error text "ALL TESTS PASSED (rolled back)".
-- Run as the postgres role (Supabase SQL editor or `psql`).
do $$
declare
  u uuid := gen_random_uuid(); a uuid := gen_random_uuid(); o uuid := gen_random_uuid();
  b uuid; n int; r text; log text[] := '{}'; failed boolean;
begin
  insert into auth.users (id, email, raw_user_meta_data, aud, role, instance_id)
  values (u, 'u@test.invalid', '{"full_name":"Uma Client"}', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
         (a, 'a@test.invalid', '{"full_name":"Asha Advisor"}', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
         (o, 'o@test.invalid', '{"full_name":"Omar Other"}', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000');
  select count(*) into n from public.profiles where id in (u, a, o);
  if n <> 3 then raise exception 'T1 signup trigger: expected 3 profiles, got %', n; end if;
  log := array_append(log, 'T1 signup creates profiles');

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  insert into public.advisors (id, display_name, credential_type, registration_number) values (a, 'Asha Menon', 'SEBI RIA', 'INA000000001');
  reset role;
  select role::text into r from public.profiles where id = a;
  if r <> 'advisor' then raise exception 'T2 advisor role: got %', r; end if;
  log := array_append(log, 'T2 applying sets role=advisor');

  perform set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.advisors;
  if n <> 0 then raise exception 'T3 pending advisor visible to user'; end if;
  failed := false;
  begin insert into public.bookings (user_id, advisor_id, topic) values (u, a, 'Retirement');
  exception when others then failed := true; end;
  if not failed then raise exception 'T4 booked an unverified advisor'; end if;
  reset role;
  log := array_append(log, 'T3/T4 pending advisor hidden + unbookable');

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  failed := false;
  begin update public.advisors set status = 'verified' where id = a;
  exception when insufficient_privilege then failed := true; end;
  if not failed then raise exception 'T5 advisor self-verified'; end if;
  reset role;
  log := array_append(log, 'T5 no self-verify');

  update public.advisors set status = 'verified', verified_at = now() where id = a;

  perform set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.advisors;
  if n <> 1 then raise exception 'T6 verified advisor not listed'; end if;
  insert into public.bookings (user_id, advisor_id, topic) values (u, a, 'Retirement') returning id into b;
  insert into public.goals (name, present_cost, target_year, inflation_rate, expected_return) values ('House', 5000000, 2035, 0.06, 0.07);
  insert into public.ledger_entries (kind, category, amount, occurred_on) values ('expense', 'Rent', 20000, current_date);
  insert into public.holdings (asset_class, label, current_value) values ('cash', 'Savings', 100000);
  insert into public.data_shares (user_id, advisor_id) values (u, a);
  failed := false;
  begin update public.profiles set role = 'admin' where id = u;
  exception when insufficient_privilege then failed := true; end;
  if not failed then raise exception 'T7 user changed own role'; end if;
  reset role;
  log := array_append(log, 'T6/T7 book verified advisor; role locked');

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select (select count(*) from public.goals where user_id = u) + (select count(*) from public.ledger_entries where user_id = u)
       + (select count(*) from public.holdings where user_id = u) into n;
  if n <> 3 then raise exception 'T8 consented advisor should read 3 rows, got %', n; end if;
  select count(*) into n from public.profiles where id = u;
  if n <> 1 then raise exception 'T8b advisor cannot see client profile'; end if;
  update public.goals set name = 'Hacked'; get diagnostics n = row_count;
  if n <> 0 then raise exception 'T8c advisor updated a client goal'; end if;
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', o, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select (select count(*) from public.goals) + (select count(*) from public.ledger_entries) + (select count(*) from public.holdings) into n;
  if n <> 0 then raise exception 'T9 other user reads % rows', n; end if;
  select count(*) into n from public.profiles where id <> o;
  if n <> 0 then raise exception 'T9b other user sees other profiles'; end if;
  failed := false;
  begin insert into public.goals (user_id, name, present_cost, target_year, inflation_rate, expected_return) values (u, 'Hijack', 1, 2030, 0, 0);
  exception when others then failed := true; end;
  if not failed then raise exception 'T10 wrote a goal for another user'; end if;
  reset role;
  log := array_append(log, 'T8-T10 consent-based read-only; others blocked');

  perform set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, true);
  set local role authenticated;
  failed := false;
  begin update public.bookings set status = 'confirmed' where id = b;
  exception when insufficient_privilege then failed := true; end;
  if not failed then raise exception 'T11 user confirmed own booking'; end if;
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  update public.bookings set status = 'confirmed', starts_at = now() + interval '2 days' where id = b;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'T12a advisor could not confirm'; end if;
  failed := false;
  begin update public.bookings set status = 'requested' where id = b;
  exception when insufficient_privilege then failed := true; end;
  if not failed then raise exception 'T12 advisor moved booking backwards'; end if;
  failed := false;
  begin update public.bookings set user_note = 'edited by advisor' where id = b;
  exception when insufficient_privilege then failed := true; end;
  if not failed then raise exception 'T13 advisor edited client note'; end if;
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, true);
  set local role authenticated;
  update public.bookings set status = 'cancelled' where id = b;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'T13b user could not cancel'; end if;
  update public.data_shares set revoked_at = now() where user_id = u and advisor_id = a;
  reset role;
  log := array_append(log, 'T11-T13 booking state machine');

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.goals where user_id = u;
  if n <> 0 then raise exception 'T14 advisor still sees data after revoke'; end if;
  update public.advisors set registration_number = 'INA000000002' where id = a;
  reset role;
  select status::text into r from public.advisors where id = a;
  if r <> 'pending' then raise exception 'T15 credential change kept status %', r; end if;
  log := array_append(log, 'T14 revoke hides data; T15 re-verify on credential change');

  set local role anon;
  failed := false;
  begin select count(*) into n from public.profiles;
  exception when insufficient_privilege then failed := true; end;
  if not failed then raise exception 'T16 anon can read profiles'; end if;
  failed := false;
  begin perform private.my_role();
  exception when insufficient_privilege then failed := true; end;
  if not failed then raise exception 'T17 anon can call private helper'; end if;
  reset role;
  log := array_append(log, 'T16/T17 anon blocked');

  raise exception 'ALL TESTS PASSED (rolled back): %', array_to_string(log, ' | ');
end
$$;
