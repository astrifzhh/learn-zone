alter table public.semester_goals
  add column if not exists deadline_date date;
