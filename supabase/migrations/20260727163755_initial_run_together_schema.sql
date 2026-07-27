-- Initial production schema and workbook-derived eight-week plan.
create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.run_effort as enum ('easy', 'moderate', 'hard', 'max');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  email text not null,
  created_at timestamptz not null default now()
);

create table public.training_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  timezone text not null default 'Asia/Kolkata',
  source_name text,
  created_at timestamptz not null default now()
);

create table public.plan_assignments (
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.training_plans(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  primary key (user_id, plan_id)
);

create table public.planned_workouts (
  id uuid primary key,
  plan_id uuid not null references public.training_plans(id) on delete restrict,
  week_number smallint not null check (week_number between 1 and 52),
  workout_date date not null,
  day_name text not null,
  session_type text not null,
  planned_km numeric(5,1) not null check (planned_km > 0 and planned_km <= 100),
  target_pace text not null,
  workout_detail text not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (plan_id, workout_date)
);

create table public.run_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  planned_workout_id uuid references public.planned_workouts(id) on delete restrict,
  run_date date not null,
  distance_km numeric(5,2) not null check (distance_km > 0 and distance_km <= 100),
  duration_seconds integer not null check (duration_seconds > 0 and duration_seconds <= 86400),
  average_pace_seconds integer generated always as (round(duration_seconds::numeric / distance_km)::integer) stored,
  effort public.run_effort,
  notes text not null default '' check (char_length(notes) <= 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index one_active_log_per_workout
  on public.run_logs (user_id, planned_workout_id)
  where planned_workout_id is not null and deleted_at is null;
create index run_logs_user_date on public.run_logs (user_id, run_date desc) where deleted_at is null;
create index planned_workouts_plan_date on public.planned_workouts (plan_id, workout_date);
create index plan_assignments_plan_id on public.plan_assignments (plan_id);

create function private.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger run_logs_touch_updated_at before update on public.run_logs for each row execute function private.touch_updated_at();

insert into public.training_plans (id, slug, name, start_date, end_date, timezone, source_name)
values ('10000000-0000-4000-8000-000000000001', 'half-marathon-8-week-2026', 'Half Marathon — 8 Week Plan', '2026-07-28', '2026-09-20', 'Asia/Kolkata', 'Half_Marathon_8_Week_Training_Tracker.xlsx');

insert into public.planned_workouts (id, plan_id, week_number, workout_date, day_name, session_type, planned_km, target_pace, workout_detail) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',1,'2026-07-28','Tuesday','Quality',5.5,'Reps: 5:05–5:15/km','1.5 km easy WU → 3 × 800 m @ 5:05–5:15/km with 400 m easy jog → cool down to 5.5 km'),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001',1,'2026-07-29','Wednesday','Easy',5.0,'6:15–6:45/km','5 km conversational'),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001',1,'2026-07-31','Friday','Easy + Strides',4.5,'6:15–6:45/km on easy running','4.5 km easy + 4 × 20 sec relaxed strides, full recovery'),
('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001',1,'2026-08-02','Sunday','Long',9.0,'6:05–6:30/km','9 km steady, fully conversational'),
('20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001',2,'2026-08-04','Tuesday','Quality',6.5,'Reps: 5:05–5:15/km','1.5 km easy WU → 3 × 1 km @ 5:05–5:15/km with 400 m easy jog → cool down to 6.5 km'),
('20000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000001',2,'2026-08-05','Wednesday','Easy',5.5,'6:15–6:45/km','5.5 km conversational'),
('20000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000001',2,'2026-08-07','Friday','Easy + Strides',5.0,'6:15–6:45/km on easy running','5 km easy + 4 × 20 sec relaxed strides, full recovery'),
('20000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000001',2,'2026-08-09','Sunday','Long',10.0,'6:05–6:30/km','10 km steady'),
('20000000-0000-4000-8000-000000000009','10000000-0000-4000-8000-000000000001',3,'2026-08-11','Tuesday','Quality',7.0,'Tempo: 5:20–5:25/km','2 km easy WU → 3 km continuous tempo @ 5:20–5:25/km → 2 km easy CD'),
('20000000-0000-4000-8000-000000000010','10000000-0000-4000-8000-000000000001',3,'2026-08-12','Wednesday','Easy',6.0,'6:15–6:45/km','6 km conversational'),
('20000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000001',3,'2026-08-14','Friday','Easy + Strides',5.5,'6:15–6:45/km on easy running','5.5 km easy + 5 × 20 sec relaxed strides'),
('20000000-0000-4000-8000-000000000012','10000000-0000-4000-8000-000000000001',3,'2026-08-16','Sunday','Long',11.0,'6:05–6:30/km','11 km steady'),
('20000000-0000-4000-8000-000000000013','10000000-0000-4000-8000-000000000001',4,'2026-08-18','Tuesday','Quality',5.5,'Fast reps: 5:15–5:20/km','1.5 km easy WU → 6 × 2 min @ ~5:15–5:20/km / 2 min easy → cool down to 5.5 km'),
('20000000-0000-4000-8000-000000000014','10000000-0000-4000-8000-000000000001',4,'2026-08-19','Wednesday','Easy',5.0,'6:20–6:50/km','5 km very easy'),
('20000000-0000-4000-8000-000000000015','10000000-0000-4000-8000-000000000001',4,'2026-08-21','Friday','Easy',4.5,'6:20–6:50/km','4.5 km easy; no strides required'),
('20000000-0000-4000-8000-000000000016','10000000-0000-4000-8000-000000000001',4,'2026-08-23','Sunday','Long',9.0,'6:10–6:35/km','9 km relaxed'),
('20000000-0000-4000-8000-000000000017','10000000-0000-4000-8000-000000000001',5,'2026-08-25','Tuesday','Quality',7.5,'Reps: 5:00–5:10/km','1.5 km easy WU → 4 × 1 km @ 5:00–5:10/km with 400 m easy jog → cool down to 7.5 km'),
('20000000-0000-4000-8000-000000000018','10000000-0000-4000-8000-000000000001',5,'2026-08-26','Wednesday','Easy',6.0,'6:10–6:40/km','6 km conversational'),
('20000000-0000-4000-8000-000000000019','10000000-0000-4000-8000-000000000001',5,'2026-08-28','Friday','Easy + Strides',6.0,'6:10–6:40/km on easy running','6 km easy + 5 × 20 sec relaxed strides'),
('20000000-0000-4000-8000-000000000020','10000000-0000-4000-8000-000000000001',5,'2026-08-30','Sunday','Long',12.0,'6:00–6:25/km','12 km steady'),
('20000000-0000-4000-8000-000000000021','10000000-0000-4000-8000-000000000001',6,'2026-09-01','Tuesday','Quality',8.0,'Tempo: 5:20–5:25/km','2 km easy WU → 4 km tempo @ 5:20–5:25/km → 2 km easy CD'),
('20000000-0000-4000-8000-000000000022','10000000-0000-4000-8000-000000000001',6,'2026-09-02','Wednesday','Easy',6.5,'6:10–6:40/km','6.5 km conversational'),
('20000000-0000-4000-8000-000000000023','10000000-0000-4000-8000-000000000001',6,'2026-09-04','Friday','Easy + Strides',6.5,'6:10–6:40/km on easy running','6.5 km easy + 5 × 20 sec relaxed strides'),
('20000000-0000-4000-8000-000000000024','10000000-0000-4000-8000-000000000001',6,'2026-09-06','Sunday','Long',14.0,'Easy section 6:00–6:25/km','12 km easy → optional final 2 km @ 5:45–5:50/km if legs feel good'),
('20000000-0000-4000-8000-000000000025','10000000-0000-4000-8000-000000000001',7,'2026-09-08','Tuesday','Quality',8.5,'Cruise reps: 5:15–5:20/km','2 km easy WU → 3 × 1.5 km @ 5:15–5:20/km with 500 m easy jog → 1 km easy CD'),
('20000000-0000-4000-8000-000000000026','10000000-0000-4000-8000-000000000001',7,'2026-09-09','Wednesday','Easy',7.0,'6:10–6:40/km','7 km conversational'),
('20000000-0000-4000-8000-000000000027','10000000-0000-4000-8000-000000000001',7,'2026-09-11','Friday','Easy + Strides',6.5,'6:10–6:40/km on easy running','6.5 km easy + 6 × 20 sec relaxed strides'),
('20000000-0000-4000-8000-000000000028','10000000-0000-4000-8000-000000000001',7,'2026-09-13','Sunday','Long',15.5,'Do not race the workout','12.5 km easy → final 3 km @ 5:40–5:50/km if controlled'),
('20000000-0000-4000-8000-000000000029','10000000-0000-4000-8000-000000000001',8,'2026-09-15','Tuesday','Quality',8.5,'HM pace: 5:30/km','1.5 km easy WU → 5 km @ goal HM pace 5:30/km → 2 km easy CD'),
('20000000-0000-4000-8000-000000000030','10000000-0000-4000-8000-000000000001',8,'2026-09-16','Wednesday','Easy',6.5,'6:15–6:45/km','6.5 km conversational'),
('20000000-0000-4000-8000-000000000031','10000000-0000-4000-8000-000000000001',8,'2026-09-18','Friday','Easy + Strides',6.0,'6:15–6:45/km on easy running','6 km easy + 4 × 20 sec relaxed strides'),
('20000000-0000-4000-8000-000000000032','10000000-0000-4000-8000-000000000001',8,'2026-09-20','Sunday','Long',16.0,'Finish strong, not exhausted','12 km easy → final 4 km gradual 5:55 → 5:40/km; never faster than 5:40');

create function private.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, email)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), initcap(split_part(new.email, '@', 1))), new.email);
  insert into public.plan_assignments (user_id, plan_id)
  values (new.id, '10000000-0000-4000-8000-000000000001');
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.training_plans enable row level security;
alter table public.plan_assignments enable row level security;
alter table public.planned_workouts enable row level security;
alter table public.run_logs enable row level security;

create policy "read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "read assigned plans" on public.training_plans for select to authenticated using (exists (select 1 from public.plan_assignments pa where pa.plan_id = id and pa.user_id = (select auth.uid())));
create policy "read own assignments" on public.plan_assignments for select to authenticated using (user_id = (select auth.uid()));
create policy "read assigned workouts" on public.planned_workouts for select to authenticated using (exists (select 1 from public.plan_assignments pa where pa.plan_id = plan_id and pa.user_id = (select auth.uid())));
create policy "read own runs" on public.run_logs for select to authenticated using (user_id = (select auth.uid()));
create policy "insert own runs" on public.run_logs for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.plan_assignments pa join public.planned_workouts pw on pw.plan_id = pa.plan_id where pa.user_id = (select auth.uid()) and (planned_workout_id is null or pw.id = planned_workout_id)));
create policy "update own runs" on public.run_logs for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Supabase no longer exposes new public objects to the Data API by default.
-- Grant only the operations used by the signed-in web client; RLS still controls rows.
grant select on table public.profiles, public.training_plans, public.plan_assignments, public.planned_workouts to authenticated;
grant select, insert, update on table public.run_logs to authenticated;
revoke all on table public.profiles, public.training_plans, public.plan_assignments, public.planned_workouts, public.run_logs from anon;

create function public.get_runner_comparison(reference_date date default (now() at time zone 'Asia/Kolkata')::date)
returns table (runner_id uuid, runner_name text, weekly_km numeric, monthly_km numeric, completed_due bigint, planned_due bigint, completion_rate integer, consistency_streak integer, longest_run_km numeric)
language plpgsql security definer set search_path = '' stable as $$
declare runner record; workout record; completed_count bigint; due_count bigint; streak integer;
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id = auth.uid()) then raise exception 'Not authorized'; end if;
  for runner in select p.id, p.display_name from public.profiles p where lower(p.display_name) in ('raunaq','vipul') order by p.display_name loop
    select count(*) into due_count from public.planned_workouts pw join public.plan_assignments pa on pa.plan_id = pw.plan_id where pa.user_id = runner.id and pw.workout_date <= reference_date;
    select count(distinct rl.planned_workout_id) into completed_count from public.run_logs rl join public.planned_workouts pw on pw.id = rl.planned_workout_id where rl.user_id = runner.id and rl.deleted_at is null and pw.workout_date <= reference_date;
    streak := 0;
    for workout in select pw.id from public.planned_workouts pw join public.plan_assignments pa on pa.plan_id = pw.plan_id where pa.user_id = runner.id and pw.workout_date <= reference_date order by pw.workout_date desc loop
      if exists (select 1 from public.run_logs rl where rl.user_id = runner.id and rl.planned_workout_id = workout.id and rl.deleted_at is null) then streak := streak + 1; else exit; end if;
    end loop;
    return query select runner.id, runner.display_name,
      coalesce((select sum(rl.distance_km) from public.run_logs rl where rl.user_id = runner.id and rl.deleted_at is null and rl.run_date between date_trunc('week', reference_date::timestamp)::date and (date_trunc('week', reference_date::timestamp)::date + 6)), 0),
      coalesce((select sum(rl.distance_km) from public.run_logs rl where rl.user_id = runner.id and rl.deleted_at is null and date_trunc('month', rl.run_date::timestamp) = date_trunc('month', reference_date::timestamp)), 0),
      completed_count, due_count, case when due_count = 0 then 0 else round(completed_count::numeric / due_count * 100)::integer end, streak,
      coalesce((select max(rl.distance_km) from public.run_logs rl where rl.user_id = runner.id and rl.deleted_at is null), 0);
  end loop;
end;
$$;

create function public.get_weekly_comparison()
returns table (week_number integer, week_start date, raunaq_km numeric, vipul_km numeric)
language sql security definer set search_path = '' stable as $$
  with weeks as (
    select pw.week_number::integer, min(date_trunc('week', pw.workout_date::timestamp)::date) as week_start
    from public.planned_workouts pw group by pw.week_number
  )
  select w.week_number, w.week_start,
    coalesce(sum(rl.distance_km) filter (where lower(p.display_name) = 'raunaq'), 0),
    coalesce(sum(rl.distance_km) filter (where lower(p.display_name) = 'vipul'), 0)
  from weeks w
  left join public.run_logs rl on rl.run_date between w.week_start and w.week_start + 6 and rl.deleted_at is null
  left join public.profiles p on p.id = rl.user_id
  where auth.uid() is not null and exists (select 1 from public.profiles viewer where viewer.id = auth.uid())
  group by w.week_number, w.week_start order by w.week_number;
$$;

revoke all on function public.get_runner_comparison(date) from public;
revoke all on function public.get_weekly_comparison() from public;
revoke all on function public.get_runner_comparison(date) from anon;
revoke all on function public.get_weekly_comparison() from anon;
grant execute on function public.get_runner_comparison(date) to authenticated;
grant execute on function public.get_weekly_comparison() to authenticated;
