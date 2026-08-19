-- Allow real admins to read student planner data for the admin dashboard.
drop policy if exists "Admins can view all tasks" on public.tasks;
create policy "Admins can view all tasks"
on public.tasks for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can view all semester goals" on public.semester_goals;
create policy "Admins can view all semester goals"
on public.semester_goals for select to authenticated
using (public.is_admin());