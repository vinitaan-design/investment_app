-- Access paths the app's screens depend on. Rolls back; success = "APP ACCESS PATHS PASSED".
do $$
declare
  u uuid := gen_random_uuid(); a uuid := gen_random_uuid(); n int; r text;
begin
  insert into auth.users (id, email, raw_user_meta_data, aud, role, instance_id)
  values (u, 'u@test.invalid', '{"full_name":"Uma Client"}', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
         (a, 'a@test.invalid', '{"full_name":"Asha Advisor"}', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000');
  insert into public.advisors (id, display_name, credential_type, registration_number, status)
  values (a, 'Asha Menon', 'SEBI RIA', 'INA1', 'verified');

  perform set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, true);
  set local role authenticated;
  insert into public.bookings (user_id, advisor_id, topic) values (u, a, 'Retirement');
  select count(*) into n from public.bookings b join public.advisors ad on ad.id = b.advisor_id where b.user_id = u;
  if n <> 1 then raise exception 'A1 user cannot see advisor on own booking'; end if;
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select full_name into r from public.profiles where id = u;
  if r is distinct from 'Uma Client' then raise exception 'A2 advisor cannot see booking client name'; end if;
  select count(*) into n from public.goals where user_id = u;
  if n <> 0 then raise exception 'A3 advisor sees goals without consent'; end if;
  reset role;

  raise exception 'APP ACCESS PATHS PASSED (rolled back)';
end
$$;
