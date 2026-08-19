-- Ensure every profile has an explicit student or admin role.
update public.profiles set role = 'student' where role is null;
alter table public.profiles alter column role set default 'student';
alter table public.profiles alter column role set not null;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('student', 'admin'));