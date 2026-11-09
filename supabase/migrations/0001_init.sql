-- InvestKea v1 schema (Supabase / Postgres 17).
--
-- Access model
--   * Roles: 'user' (end customer), 'advisor' (consultant), 'admin'.
--   * Signed-out visitors (anon) get no table access at all.
--   * A user owns their goals, ledger entries and holdings.
--   * An advisor can READ a user's data only while (a) an admin has verified the
--     advisor and (b) the user has an active, revocable data-sharing consent with
--     that advisor (DPDP: explicit, purpose-bound, withdrawable).
--   * Privileged fields (role, advisor status) are never writable by end users;
--     admins change them with the service key / dashboard.
--
-- Security notes
--   * Privileges are granted explicitly per table and column (least privilege).
--   * SECURITY DEFINER helpers live in the non-exposed `private` schema with an
--     empty search_path, and EXECUTE is granted only to `authenticated`.
--   * Policies use (select auth.uid()) so the value is computed once per query.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('user', 'advisor', 'admin');
create type public.advisor_status as enum ('pending', 'verified', 'rejected', 'suspended');
create type public.booking_status as enum ('requested', 'confirmed', 'completed', 'cancelled');
create type public.entry_kind as enum ('income', 'expense');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 200),
  role public.app_role not null default 'user',
  is_adult_confirmed boolean not null default false,
  privacy_consent_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.advisors (
  id uuid primary key references public.profiles (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 200),
  credential_type text not null check (char_length(credential_type) between 1 and 100),
  registration_number text not null check (char_length(registration_number) between 1 and 100),
  bio text check (char_length(bio) <= 2000),
  languages text[] not null default '{}',
  status public.advisor_status not null default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.advisor_availability (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references public.advisors (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  check (ends_at > starts_at)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  advisor_id uuid not null references public.advisors (id) on delete cascade,
  status public.booking_status not null default 'requested',
  starts_at timestamptz,
  topic text check (char_length(topic) <= 200),
  user_note text check (char_length(user_note) <= 2000),
  created_at timestamptz not null default now(),
  check (user_id <> advisor_id)
);

create table public.data_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  advisor_id uuid not null references public.advisors (id) on delete cascade,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, advisor_id),
  check (user_id <> advisor_id)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  present_cost numeric(14, 2) not null check (present_cost > 0),
  target_year int not null check (target_year between 2000 and 2200),
  inflation_rate numeric(5, 4) not null check (inflation_rate between 0 and 0.3),
  expected_return numeric(5, 4) not null check (expected_return between 0 and 0.3),
  current_savings numeric(14, 2) not null default 0 check (current_savings >= 0),
  created_at timestamptz not null default now()
);

create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  kind public.entry_kind not null,
  category text not null check (char_length(category) between 1 and 60),
  amount numeric(14, 2) not null check (amount > 0),
  occurred_on date not null,
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);

-- User-entered holdings by asset class. No product names, no live prices in v1.
create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  asset_class text not null check (char_length(asset_class) between 1 and 40),
  label text not null check (char_length(label) between 1 and 120),
  current_value numeric(14, 2) not null check (current_value >= 0),
  updated_at timestamptz not null default now()
);

-- Foreign-key indexes (RLS predicates and joins filter on these).
create index on public.advisor_availability (advisor_id);
create index on public.bookings (user_id);
create index on public.bookings (advisor_id);
create index on public.data_shares (advisor_id);
create index on public.goals (user_id);
create index on public.ledger_entries (user_id, occurred_on desc);
create index on public.holdings (user_id);

-- ---------------------------------------------------------------------------
-- Private helpers (not exposed through the Data API)
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create function private.my_role() returns public.app_role
language sql stable security definer set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid())
$$;

create function private.advisor_can_view(target_user uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.data_shares s
    join public.advisors a on a.id = s.advisor_id
    where s.user_id = target_user
      and s.advisor_id = (select auth.uid())
      and s.revoked_at is null
      and a.status = 'verified'
  )
$$;

create function private.is_verified_advisor(advisor uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.advisors where id = advisor and status = 'verified')
$$;

revoke execute on all functions in schema private from public, anon;
grant execute on function private.my_role(), private.advisor_can_view(uuid), private.is_verified_advisor(uuid)
  to authenticated;

-- New auth user -> profile row. full_name is display-only (user metadata is user-editable,
-- so it is never used for authorization).
create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, left(new.raw_user_meta_data ->> 'full_name', 200));
  return new;
end;
$$;
revoke execute on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Becoming an advisor: mark the profile role. Runs as definer because users cannot
-- update their own role.
create function private.handle_new_advisor() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.profiles set role = 'advisor' where id = new.id and role = 'user';
  return new;
end;
$$;
revoke execute on function private.handle_new_advisor() from public, anon, authenticated;

create trigger on_advisor_created
  after insert on public.advisors
  for each row execute function private.handle_new_advisor();

-- Changing credentials sends the advisor back for re-verification.
create function private.advisor_reverify_on_credential_change() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if (select auth.uid()) is not null
     and (new.registration_number is distinct from old.registration_number
          or new.credential_type is distinct from old.credential_type) then
    new.status := 'pending';
    new.verified_at := null;
  end if;
  return new;
end;
$$;

create trigger advisors_reverify
  before update on public.advisors
  for each row execute function private.advisor_reverify_on_credential_change();

-- Booking state machine. Service-role / dashboard updates (auth.uid() is null) are not limited.
--   user:    requested|confirmed -> cancelled; may edit topic/note while requested
--   advisor: requested -> confirmed|cancelled; confirmed -> completed|cancelled; may set starts_at
create function private.enforce_booking_update() returns trigger
language plpgsql set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
begin
  if actor is null then
    return new;
  end if;

  if new.status is distinct from old.status then
    if actor = old.user_id then
      if not (new.status = 'cancelled' and old.status in ('requested', 'confirmed')) then
        raise exception 'You can only cancel a requested or confirmed booking.' using errcode = '42501';
      end if;
    elsif actor = old.advisor_id then
      if not (
        (old.status = 'requested' and new.status in ('confirmed', 'cancelled'))
        or (old.status = 'confirmed' and new.status in ('completed', 'cancelled'))
      ) then
        raise exception 'That booking status change is not allowed.' using errcode = '42501';
      end if;
    end if;
  end if;

  if actor = old.user_id and actor <> old.advisor_id then
    if new.starts_at is distinct from old.starts_at then
      raise exception 'Only the advisor can set the session time.' using errcode = '42501';
    end if;
    if (new.topic is distinct from old.topic or new.user_note is distinct from old.user_note)
       and old.status <> 'requested' then
      raise exception 'Details can only be changed while the booking is requested.' using errcode = '42501';
    end if;
  elsif actor = old.advisor_id then
    if new.topic is distinct from old.topic or new.user_note is distinct from old.user_note then
      raise exception 'Only the client can change the topic or note.' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

create trigger bookings_enforce_update
  before update on public.bookings
  for each row execute function private.enforce_booking_update();

-- ---------------------------------------------------------------------------
-- Privileges: nothing for anon; explicit, column-scoped grants for authenticated.
-- ---------------------------------------------------------------------------
revoke all on public.profiles, public.advisors, public.advisor_availability, public.bookings,
  public.data_shares, public.goals, public.ledger_entries, public.holdings
  from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, is_adult_confirmed, privacy_consent_at) on public.profiles to authenticated;

grant select on public.advisors to authenticated;
grant insert (id, display_name, credential_type, registration_number, bio, languages)
  on public.advisors to authenticated;
grant update (display_name, credential_type, registration_number, bio, languages)
  on public.advisors to authenticated;

grant select, delete on public.advisor_availability to authenticated;
grant insert (advisor_id, starts_at, ends_at), update (starts_at, ends_at)
  on public.advisor_availability to authenticated;

grant select on public.bookings to authenticated;
grant insert (advisor_id, topic, user_note, user_id) on public.bookings to authenticated;
grant update (status, starts_at, topic, user_note) on public.bookings to authenticated;

grant select, delete on public.data_shares to authenticated;
grant insert (user_id, advisor_id) on public.data_shares to authenticated;
grant update (revoked_at) on public.data_shares to authenticated;

grant select, insert, update, delete on public.goals, public.ledger_entries, public.holdings
  to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.advisors enable row level security;
alter table public.advisor_availability enable row level security;
alter table public.bookings enable row level security;
alter table public.data_shares enable row level security;
alter table public.goals enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.holdings enable row level security;

-- profiles: own row; a consented verified advisor; the other party of a booking; admins.
create policy profiles_select on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or (select private.advisor_can_view(id))
    or exists (
      select 1 from public.bookings b
      where (b.user_id = profiles.id and b.advisor_id = (select auth.uid()))
         or (b.advisor_id = profiles.id and b.user_id = (select auth.uid()))
    )
    or (select private.my_role()) = 'admin'
  );
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- advisors: verified ones are listed to everyone signed in; advisor sees own row; admins all.
create policy advisors_select on public.advisors for select to authenticated
  using (status = 'verified' or id = (select auth.uid()) or (select private.my_role()) = 'admin');
create policy advisors_insert on public.advisors for insert to authenticated
  with check (id = (select auth.uid()));
create policy advisors_update on public.advisors for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- availability: readable for verified advisors; managed by the advisor.
create policy availability_select on public.advisor_availability for select to authenticated
  using (advisor_id = (select auth.uid()) or (select private.is_verified_advisor(advisor_id)));
create policy availability_insert on public.advisor_availability for insert to authenticated
  with check (advisor_id = (select auth.uid()));
create policy availability_update on public.advisor_availability for update to authenticated
  using (advisor_id = (select auth.uid()))
  with check (advisor_id = (select auth.uid()));
create policy availability_delete on public.advisor_availability for delete to authenticated
  using (advisor_id = (select auth.uid()));

-- bookings: visible to both parties; users book verified advisors; updates go through the trigger.
create policy bookings_select on public.bookings for select to authenticated
  using (user_id = (select auth.uid()) or advisor_id = (select auth.uid()));
create policy bookings_insert on public.bookings for insert to authenticated
  with check (user_id = (select auth.uid()) and (select private.is_verified_advisor(advisor_id)));
create policy bookings_update on public.bookings for update to authenticated
  using (user_id = (select auth.uid()) or advisor_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) or advisor_id = (select auth.uid()));

-- data_shares: only the user grants, revokes or deletes; the advisor can see it exists.
create policy shares_select on public.data_shares for select to authenticated
  using (user_id = (select auth.uid()) or advisor_id = (select auth.uid()));
create policy shares_insert on public.data_shares for insert to authenticated
  with check (user_id = (select auth.uid()) and (select private.is_verified_advisor(advisor_id)));
create policy shares_update on public.data_shares for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy shares_delete on public.data_shares for delete to authenticated
  using (user_id = (select auth.uid()));

-- personal finance data: owner full access; consented verified advisor read-only.
create policy goals_owner_all on public.goals for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy goals_advisor_select on public.goals for select to authenticated
  using ((select private.advisor_can_view(user_id)));

create policy ledger_owner_all on public.ledger_entries for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy ledger_advisor_select on public.ledger_entries for select to authenticated
  using ((select private.advisor_can_view(user_id)));

create policy holdings_owner_all on public.holdings for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy holdings_advisor_select on public.holdings for select to authenticated
  using ((select private.advisor_can_view(user_id)));
