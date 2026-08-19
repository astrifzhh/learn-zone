-- Add admin role support to profiles table
alter table public.profiles add column if not exists role text default 'student' check (role in ('student', 'admin'));
update public.profiles set role = 'student' where role is null;
alter table public.profiles alter column role set not null;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Update RLS policies to support admin access
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
on public.profiles for select to authenticated
using (
  (select auth.uid()) = id or 
  public.is_admin()
);

-- Update trigger to set avatar_key if provided in metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, nickname, class_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nickname', 'Pelajar'),
    coalesce(new.raw_user_meta_data ->> 'class_name', 'Belum diatur'),
    coalesce(new.raw_user_meta_data ->> 'role', 'student')
  );

  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$;
