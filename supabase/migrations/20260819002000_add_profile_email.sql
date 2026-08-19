-- Store the authentication email on each profile.
alter table public.profiles add column if not exists email text;

update public.profiles as profiles
set email = users.email
from auth.users as users
where users.id = profiles.id and profiles.email is null;

alter table public.profiles alter column email set not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, nickname, class_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nickname', 'Pelajar'),
    coalesce(new.raw_user_meta_data ->> 'class_name', 'Belum diatur'),
    coalesce(new.raw_user_meta_data ->> 'role', 'student')
  );

  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$;