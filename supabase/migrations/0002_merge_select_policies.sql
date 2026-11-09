-- One SELECT policy per table (Supabase lint 0006: multiple permissive policies are
-- evaluated for every row). Owner write policies are split out per action.

-- goals
drop policy goals_owner_all on public.goals;
drop policy goals_advisor_select on public.goals;
create policy goals_select on public.goals for select to authenticated
  using (user_id = (select auth.uid()) or (select private.advisor_can_view(user_id)));
create policy goals_insert on public.goals for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy goals_update on public.goals for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy goals_delete on public.goals for delete to authenticated
  using (user_id = (select auth.uid()));

-- ledger_entries
drop policy ledger_owner_all on public.ledger_entries;
drop policy ledger_advisor_select on public.ledger_entries;
create policy ledger_select on public.ledger_entries for select to authenticated
  using (user_id = (select auth.uid()) or (select private.advisor_can_view(user_id)));
create policy ledger_insert on public.ledger_entries for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy ledger_update on public.ledger_entries for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy ledger_delete on public.ledger_entries for delete to authenticated
  using (user_id = (select auth.uid()));

-- holdings
drop policy holdings_owner_all on public.holdings;
drop policy holdings_advisor_select on public.holdings;
create policy holdings_select on public.holdings for select to authenticated
  using (user_id = (select auth.uid()) or (select private.advisor_can_view(user_id)));
create policy holdings_insert on public.holdings for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy holdings_update on public.holdings for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy holdings_delete on public.holdings for delete to authenticated
  using (user_id = (select auth.uid()));
