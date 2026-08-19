-- Repair Auth users whose profile trigger previously did not create a row.
insert into public.profiles (id, email, nickname, class_name, role)
select
  users.id,
  users.email,
  coalesce(users.raw_user_meta_data ->> 'nickname', 'Pelajar'),
  coalesce(users.raw_user_meta_data ->> 'class_name', 'Belum diatur'),
  coalesce(users.raw_user_meta_data ->> 'role', 'student')
from auth.users as users
left join public.profiles as profiles on profiles.id = users.id
where profiles.id is null
  and users.email is not null;

insert into public.user_settings (user_id)
select users.id
from auth.users as users
left join public.user_settings as settings on settings.user_id = users.id
where settings.user_id is null;