create extension if not exists pgcrypto;

  create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    nickname text not null check (char_length(nickname) between 1 and 40),
    class_name text not null check (char_length(class_name) between 1 and 30),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create table public.tasks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null check (char_length(title) between 1 and 160),
    subject_name text,
    subject_color text check (subject_color is null or subject_color ~ '^#[0-9A-Fa-f]{6}$'),
    due_at timestamptz,
    is_completed boolean not null default false,
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create table public.semester_goals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    goal_text text not null check (char_length(goal_text) between 1 and 240),
    progress_percent integer not null default 0 check (progress_percent between 0 and 100),
    badge_awarded boolean generated always as (progress_percent = 100) stored,
    semester_label text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create table public.schedule_entries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    day_of_week smallint not null check (day_of_week between 1 and 5),
    start_time time not null,
    end_time time,
    subject_name text not null check (char_length(subject_name) between 1 and 80),
    subject_color text check (subject_color is null or subject_color ~ '^#[0-9A-Fa-f]{6}$'),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (end_time is null or end_time > start_time)
  );

  create table public.calendar_events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    event_date date not null,
    title text not null check (char_length(title) between 1 and 160),
    event_type text not null default 'other'
      check (event_type in ('exam', 'assignment', 'birthday', 'holiday', 'group', 'other')),
    sticker_key text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create table public.mood_entries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    entry_date date not null default current_date,
    mood text not null check (mood in ('semangat', 'lelah', 'senang', 'bingung')),
    recommended_quote text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, entry_date)
  );

  create table public.custom_quotes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    quote_text text not null check (char_length(quote_text) between 1 and 280),
    is_active boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create table public.focus_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    focus_minutes integer not null check (focus_minutes between 1 and 180),
    break_minutes integer not null check (break_minutes between 1 and 60),
    started_at timestamptz not null,
    ended_at timestamptz,
    status text not null check (status in ('completed', 'cancelled')),
    created_at timestamptz not null default now()
  );

  create table public.user_settings (
    user_id uuid primary key references auth.users(id) on delete cascade,
    alarm_sound text not null default 'school_bell'
      check (alarm_sound in ('school_bell', 'cheerful', 'nature')),
    background_audio text not null default 'none'
      check (background_audio in ('none', 'instrumental', 'soft_rain')),
  reduced_motion boolean not null default false,
  sound_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_user_due_idx on public.tasks (user_id, due_at);
create index goals_user_idx on public.semester_goals (user_id);
create index schedule_user_day_time_idx on public.schedule_entries (user_id, day_of_week, start_time);
create index events_user_date_idx on public.calendar_events (user_id, event_date);
create index focus_user_started_idx on public.focus_sessions (user_id, started_at desc);
create unique index one_active_quote_per_user_idx
  on public.custom_quotes (user_id)
  where is_active = true;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_tasks_updated_at before update on public.tasks
  for each row execute procedure public.set_updated_at();
create trigger set_goals_updated_at before update on public.semester_goals
  for each row execute procedure public.set_updated_at();
create trigger set_schedule_updated_at before update on public.schedule_entries
  for each row execute procedure public.set_updated_at();
create trigger set_events_updated_at before update on public.calendar_events
  for each row execute procedure public.set_updated_at();
create trigger set_moods_updated_at before update on public.mood_entries
  for each row execute procedure public.set_updated_at();
create trigger set_quotes_updated_at before update on public.custom_quotes
  for each row execute procedure public.set_updated_at();
create trigger set_settings_updated_at before update on public.user_settings
  for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, nickname, class_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nickname', 'Pelajar'),
    coalesce(new.raw_user_meta_data ->> 'class_name', 'Belum diatur')
  );

  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.semester_goals enable row level security;
alter table public.schedule_entries enable row level security;
alter table public.calendar_events enable row level security;
alter table public.mood_entries enable row level security;
alter table public.custom_quotes enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.user_settings enable row level security;

revoke all on public.profiles from anon;
revoke all on public.tasks from anon;
revoke all on public.semester_goals from anon;
revoke all on public.schedule_entries from anon;
revoke all on public.calendar_events from anon;
revoke all on public.mood_entries from anon;
revoke all on public.custom_quotes from anon;
revoke all on public.focus_sessions from anon;
revoke all on public.user_settings from anon;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.semester_goals to authenticated;
grant select, insert, update, delete on public.schedule_entries to authenticated;
grant select, insert, update, delete on public.calendar_events to authenticated;
grant select, insert, update, delete on public.mood_entries to authenticated;
grant select, insert, update, delete on public.custom_quotes to authenticated;
grant select, insert, update, delete on public.focus_sessions to authenticated;
grant select, insert, update, delete on public.user_settings to authenticated;

create policy "Users manage own profile"
on public.profiles for all to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users manage own tasks"
on public.tasks for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage own semester goals"
on public.semester_goals for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage own schedule entries"
on public.schedule_entries for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage own calendar events"
on public.calendar_events for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage own mood entries"
on public.mood_entries for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage own custom quotes"
on public.custom_quotes for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage own focus sessions"
on public.focus_sessions for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage own settings"
on public.user_settings for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);