-- Allow unauthenticated consultation inserts while keeping authenticated own-record policy.

drop policy if exists "consultations_insert_own" on public.consultation_submissions;

create policy "consultations_insert_authenticated"
  on public.consultation_submissions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "consultations_insert_guest"
  on public.consultation_submissions for insert
  to anon
  with check (user_id is null);
