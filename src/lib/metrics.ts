import { addDays, format, startOfWeek } from 'date-fns'
import { trainingPlan } from '../data/training-plan'
import type { Profile, RunLog, RunnerMetrics, WeeklyComparison } from '../types'
import { isInCurrentMonth, isInCurrentWeek, todayISO } from './date'

export function metricsForRunner(profile: Profile, runs: RunLog[], reference = todayISO()): RunnerMetrics {
  const active = runs.filter((run) => run.userId === profile.id && !run.deletedAt)
  const completedIds = new Set(active.map((run) => run.plannedWorkoutId).filter(Boolean))
  const due = trainingPlan.filter((workout) => workout.date <= reference)
  let streak = 0
  for (const workout of [...due].reverse()) {
    if (completedIds.has(workout.id)) streak += 1
    else break
  }
  const completedDue = due.filter((workout) => completedIds.has(workout.id)).length
  return {
    runnerId: profile.id,
    runnerName: profile.displayName,
    weeklyKm: active.filter((run) => isInCurrentWeek(run.runDate, reference)).reduce((sum, run) => sum + run.distanceKm, 0),
    monthlyKm: active.filter((run) => isInCurrentMonth(run.runDate, reference)).reduce((sum, run) => sum + run.distanceKm, 0),
    completedDue,
    plannedDue: due.length,
    completionRate: due.length ? Math.round((completedDue / due.length) * 100) : 0,
    consistencyStreak: streak,
    longestRunKm: active.reduce((longest, run) => Math.max(longest, run.distanceKm), 0),
  }
}

export function buildWeeklyComparison(runs: RunLog[], profiles: Profile[]): WeeklyComparison[] {
  return Array.from({ length: 8 }, (_, index) => {
    const workout = trainingPlan.find((item) => item.week === index + 1)!
    const weekStartDate = startOfWeek(new Date(`${workout.date}T12:00:00`), { weekStartsOn: 1 })
    const weekStart = format(weekStartDate, 'yyyy-MM-dd')
    const weekEnd = format(addDays(weekStartDate, 6), 'yyyy-MM-dd')
    const totals = (profile?: Profile) => runs
      .filter((run) => !run.deletedAt && run.userId === profile?.id && run.runDate >= weekStart && run.runDate <= weekEnd)
      .reduce((sum, run) => sum + run.distanceKm, 0)
    return { week: index + 1, weekStart, raunaqKm: totals(profiles.find((p) => p.displayName.toLowerCase() === 'raunaq')), vipulKm: totals(profiles.find((p) => p.displayName.toLowerCase() === 'vipul')) }
  })
}
