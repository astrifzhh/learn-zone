import type { CalendarEvent, NotificationItem, ScheduleEntry, SemesterGoal, Task } from '../types/planner'

const dayKey = (date: Date) => date.toISOString().split('T')[0]

const dateDiff = (target: string, today: Date) => {
  const targetDate = new Date(`${target}T12:00:00`)
  const todayDate = new Date(`${dayKey(today)}T12:00:00`)
  return Math.round((targetDate.getTime() - todayDate.getTime()) / 86400000)
}

const reminderMessage = (label: string, difference: number) =>
  `${label} ${difference === 0 ? 'hari ini' : 'besok'}.`

export const buildActiveNotifications = (
  tasks: Task[],
  goals: SemesterGoal[],
  schedule: ScheduleEntry[],
  events: CalendarEvent[],
  hasMood: boolean,
  now = new Date(),
): NotificationItem[] => {
  const createdAt = now.toISOString()
  const items: NotificationItem[] = []
  const add = (id: string, kind: NotificationItem['kind'], title: string, message: string, dueDate: string) => {
    items.push({ id, kind, title, message, dueDate, createdAt, read: false })
  }

  tasks.filter(task => !task.is_completed && task.due_at).forEach(task => {
    const dueDate = dayKey(new Date(task.due_at as string))
    const difference = dateDiff(dueDate, now)
    if (difference === 0 || difference === 1) {
      add(`task-${task.id}-${dueDate}`, 'task', 'Deadline tugas', `${task.title} jatuh tempo ${reminderMessage('', difference)}`, dueDate)
    }
  })

  goals.filter(goal => goal.progress_percent < 100 && goal.deadline_date).forEach(goal => {
    const difference = dateDiff(goal.deadline_date as string, now)
    if (difference === 0 || difference === 1) {
      add(`goal-${goal.id}-${goal.deadline_date}`, 'goal', 'Deadline target semester', `${goal.goal_text} berakhir ${difference === 0 ? 'hari ini' : 'besok'}.`, goal.deadline_date as string)
    }
  })

  const javascriptDay = now.getDay()
  const todayDay = javascriptDay === 0 ? 7 : javascriptDay
  const scheduleDays = todayDay === 7 ? [{ day: 1, difference: 1 }] : [{ day: todayDay, difference: 0 }, ...(todayDay < 6 ? [{ day: todayDay + 1, difference: 1 }] : [])]
  schedule.filter(entry => scheduleDays.some(item => item.day === entry.day_of_week)).forEach(entry => {
    const difference = scheduleDays.find(item => item.day === entry.day_of_week)?.difference || 0
    const dueDate = new Date(now)
    dueDate.setDate(now.getDate() + difference)
    const dueDateKey = dayKey(dueDate)
    add(`schedule-${entry.id}-${dueDateKey}`, 'schedule', 'Jadwal pelajaran', `${entry.subject_name} dimulai pukul ${entry.start_time.replace(':', '.')}, ${difference === 0 ? 'hari ini' : 'besok'}.`, dueDateKey)
  })

  events.forEach(event => {
    const difference = dateDiff(event.event_date, now)
    if (difference === 0 || difference === 1) {
      add(`event-${event.id}-${event.event_date}`, 'event', 'Agenda kalender', `${event.title} ${difference === 0 ? 'hari ini' : 'besok'}.`, event.event_date)
    }
  })

  if (!hasMood) {
    add(`mood-${dayKey(now)}`, 'mood', 'Reminder mood harian', 'Isi mood harianmu untuk mencatat perasaan hari ini.', dayKey(now))
  }

  return items
}
