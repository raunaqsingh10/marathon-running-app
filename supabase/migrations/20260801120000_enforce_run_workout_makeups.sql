-- Keep planned workout assignments explicit and enforce the make-up window in the database.
create or replace function private.validate_run_workout_assignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  scheduled_date date;
  week_end date;
begin
  if new.planned_workout_id is null then
    return new;
  end if;

  select pw.workout_date
    into scheduled_date
    from public.planned_workouts pw
   where pw.id = new.planned_workout_id;

  if scheduled_date is null then
    raise exception 'The selected planned workout does not exist.';
  end if;

  week_end := scheduled_date + (7 - extract(isodow from scheduled_date)::integer);
  if new.run_date < scheduled_date or new.run_date > week_end then
    raise exception 'A planned workout can only be completed from its scheduled date through that Sunday.';
  end if;

  return new;
end;
$$;

drop trigger if exists run_logs_validate_workout_assignment on public.run_logs;
create trigger run_logs_validate_workout_assignment
before insert or update of planned_workout_id, run_date on public.run_logs
for each row execute function private.validate_run_workout_assignment();

drop policy if exists "update own runs" on public.run_logs;
create policy "update own runs" on public.run_logs
for update to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
      from public.plan_assignments pa
      join public.planned_workouts pw on pw.plan_id = pa.plan_id
     where pa.user_id = (select auth.uid())
       and (public.run_logs.planned_workout_id is null or pw.id = public.run_logs.planned_workout_id)
  )
);
