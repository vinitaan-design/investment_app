-- InvestKea v1 schema (Supabase / Postgres).
-- Roles: 'user' (end customer), 'advisor' (verified consultant), 'admin'.
-- Principle: an advisor sees a user's data ONLY while that user has an active,
-- explicit data-sharing consent with that advisor (DPDP: purpose-bound, revocable).

create extension if not exists "pgcrypto";

create type public.app_role as enum ('user', 'advisor', 'admin');
create type public.advisor_status as enum ('pending', 'verified', 'rejected', 'suspended');
create type public.booking_status as enum ('requested', 'confirmed', 'completed', 'cancelled');
create type public.entry_kind as enum ('income', 'expense');

-- One row per auth user. Created by trigger on signup.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.app_role not null default 'user',
  is_adult_confirmed boolean not null default false,
  privacy_consent_at timestamptz,
  created_at timestamptz not null default now()
);

-- Advisor details. Registration is checked by an admin before status = 'verified'.
create table public.advisors (
  id uuid primary key references public.profiles (id) on delete cascade,
  display_name text not null,
  credential_type text not null,          -- e.g. 'SEBI RIA', 'CFP', 'IRDAI agent'
  registration_number text not null,      -- shown publicly on the profile
  bio text,
  languages text[] not null default '{}',
  status public.advisor_status not null default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- Weekly availability slots set by the advisor.
create table public.advisor_availability (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references public.advisors (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  check (ends_at > starts_at)
);

-- A user's request to meet an advisor. This is the advisor's "requests" inbox.
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  advisor_id uuid not null references public.advisors (id) on delete cascade,
  status public.booking_status not null default 'requested',
  starts_at timestamptz,
  topic text,
  user_note text,
  created_at timestamptz not null default now()
);

-- Explicit, revocable consent for an advisor to view a user's data.
create table public.data_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  advisor_id uuid not null references public.advisors (id) on delete cascade,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, advisor_id)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  present_cost numeric(14, 2) not null check (present_cost > 0),
  target_year int not null,
  inflation_rate numeric(5, 4) not null,
  expected_return numeric(5, 4) not null,
  current_savings numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.entry_kind not null,
  category text not null,
  amount numeric(14, 2) not null check (amount > 0),
  occurred_on date not null,
  note text,
  created_at timestamptz not null default now()
);

-- User-entered holdings (no product links, no live prices in v1).
create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  asset_class text not null,              -- e.g. 'equity', 'debt', 'gold', 'cash', 'real estate'
  label text not null,
  current_value numeric(14, 2) not null check (current_value >= 0),
  updated_at timestamptz not null default now()
);

-- ---------- helpers ----------
create or replace function public.my_role() returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.advisor_can_view(target_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.data_shares s
    join public.advisors a on a.id = s.advisor_id
    where s.user_id = target_user
      and s.advisor_id = auth.uid()
      and s.revoked_at is null
      and a.status = 'verified'
  )
$$;

-- New auth user -> profile row.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- row level security ----------
alter table public.profiles enable row level security;
alter table public.advisors enable row level security;
alter table public.advisor_availability enable row level security;
alter table public.bookings enable row level security;
alter table public.data_shares enable row level security;
alter table public.goals enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.holdings enable row level security;

-- profiles: own row; advisors see profiles of users who share with them; admins see all.
create policy profiles_self_read on public.profiles for select
  using (id = auth.uid() or public.advisor_can_view(id) or public.my_role() = 'admin');
-- Role changes are admin-only: users may update their row but not their role.
create policy profiles_self_update on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));

-- advisors: anyone signed in can see verified advisors; advisor manages own row; admin all.
create policy advisors_public_read on public.advisors for select
  using (status = 'verified' or id = auth.uid() or public.my_role() = 'admin');
create policy advisors_self_insert on public.advisors for insert
  with check (id = auth.uid() and status = 'pending');
create policy advisors_self_update on public.advisors for update
  using (id = auth.uid())
  with check (id = auth.uid() and status = (select a.status from public.advisors a where a.id = auth.uid()));
create policy advisors_admin_update on public.advisors for update
  using (public.my_role() = 'admin');

create policy availability_read on public.advisor_availability for select using (true);
create policy availability_own on public.advisor_availability for all
  using (advisor_id = auth.uid()) with check (advisor_id = auth.uid());

-- bookings: the user and the advisor involved.
create policy bookings_read on public.bookings for select
  using (user_id = auth.uid() or advisor_id = auth.uid());
create policy bookings_user_create on public.bookings for insert
  with check (user_id = auth.uid() and status = 'requested');
create policy bookings_update on public.bookings for update
  using (user_id = auth.uid() or advisor_id = auth.uid());

-- data_shares: only the user grants or revokes; the advisor can see that it exists.
create policy shares_read on public.data_shares for select
  using (user_id = auth.uid() or advisor_id = auth.uid());
create policy shares_user_write on public.data_shares for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- personal finance data: owner full access; consented verified advisor read-only.
create policy goals_owner on public.goals for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy goals_advisor_read on public.goals for select
  using (public.advisor_can_view(user_id));

create policy ledger_owner on public.ledger_entries for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy ledger_advisor_read on public.ledger_entries for select
  using (public.advisor_can_view(user_id));

create policy holdings_owner on public.holdings for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy holdings_advisor_read on public.holdings for select
  using (public.advisor_can_view(user_id));
