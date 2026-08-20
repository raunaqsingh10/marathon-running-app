-- Allow a run to fulfill any planned workout in the same Monday-Sunday plan week.
create or replace function private.validate_run_workout_assignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  scheduled_date date;
  week_start date;
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

  week_start := scheduled_date - (extract(isodow from scheduled_date)::integer - 1);
  week_end := scheduled_date + (7 - extract(isodow from scheduled_date)::integer);
  if new.run_date < week_start or new.run_date > week_end then
    raise exception 'A planned workout can only be assigned to a run within its Monday-Sunday plan week.';
  end if;

  return new;
end;
$$;
