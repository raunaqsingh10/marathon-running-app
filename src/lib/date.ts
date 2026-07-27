import { endOfMonth, endOfWeek, format, isWithinInterval, parseISO, startOfMonth, startOfWeek } from 'date-fns'

export const APP_TIME_ZONE = 'Asia/Kolkata'

export function todayISO() {
  const demoDate = import.meta.env.VITE_DEMO_DATE
  if (demoDate) return demoDate
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function formatPlanDate(date: string, pattern = 'd MMM') {
  return format(parseISO(date), pattern)
}

export function isInCurrentWeek(date: string, reference = todayISO()) {
  const ref = parseISO(reference)
  return isWithinInterval(parseISO(date), {
    start: startOfWeek(ref, { weekStartsOn: 1 }),
    end: endOfWeek(ref, { weekStartsOn: 1 }),
  })
}

export function isInCurrentMonth(date: string, reference = todayISO()) {
  const ref = parseISO(reference)
  return isWithinInterval(parseISO(date), { start: startOfMonth(ref), end: endOfMonth(ref) })
}

export function greetingForNow() {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: APP_TIME_ZONE, hour: '2-digit', hour12: false }).format(new Date()))
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
