create table private.allowed_runner_emails (
  email text primary key check (email = lower(email))
);

insert into private.allowed_runner_emails (email) values
  ('raunaqsingh10@gmail.com'),
  ('phuliavipul@gmail.com');

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from private.allowed_runner_emails
    where email = lower(new.email)
  ) then
    raise exception 'This is a private two-runner app.' using errcode = '42501';
  end if;

  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), initcap(split_part(new.email, '@', 1))),
    lower(new.email)
  );

  insert into public.plan_assignments (user_id, plan_id)
  values (new.id, '10000000-0000-4000-8000-000000000001');

  return new;
end;
$$;

revoke all on table private.allowed_runner_emails from public, anon, authenticated;
