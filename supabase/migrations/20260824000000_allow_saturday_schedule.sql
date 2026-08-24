alter table public.schedule_entries
  drop constraint if exists schedule_entries_day_of_week_check;

alter table public.schedule_entries
  add constraint schedule_entries_day_of_week_check check (day_of_week between 1 and 6);
