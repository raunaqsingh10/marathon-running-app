import type { PlannedWorkout, RunLog } from '../types'
import { endOfPlanWeekISO, formatPlanDate, isValidISODate } from './date'

export function isWorkoutEligibleForRunDate(workout: PlannedWorkout, runDate: string) {
  return isValidISODate(runDate) && runDate >= workout.date && runDate <= endOfPlanWeekISO(workout.date)
}

export function activeRunForWorkout(runs: RunLog[], workoutId: string, editingRunId?: string) {
  return runs.find((run) => !run.deletedAt && run.id !== editingRunId && run.plannedWorkoutId === workoutId)
}

export function completedWorkoutIds(runs: RunLog[], editingRunId?: string) {
  return new Set(runs
    .filter((run) => !run.deletedAt && run.id !== editingRunId && run.plannedWorkoutId)
    .map((run) => run.plannedWorkoutId as string))
}

export function eligibleMakeUpWorkouts(plan: PlannedWorkout[], runs: RunLog[], runDate: string, editingRunId?: string) {
  return plan
    .filter((workout) => isWorkoutEligibleForRunDate(workout, runDate) && !activeRunForWorkout(runs, workout.id, editingRunId))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function workoutAssignmentError(workout: PlannedWorkout | undefined, runDate: string, runs: RunLog[], editingRunId?: string) {
  if (!workout) return 'Choose a planned workout or leave this as an extra run.'
  if (!isValidISODate(runDate)) return 'Enter a valid run date before assigning this workout.'
  if (runDate < workout.date) return `The run date cannot be before ${formatPlanDate(workout.date, 'd MMM yyyy')}.`
  const weekEnd = endOfPlanWeekISO(workout.date)
  if (runDate > weekEnd) return `A make-up run must be dated by ${formatPlanDate(weekEnd, 'EEEE, d MMM yyyy')}.`
  if (activeRunForWorkout(runs, workout.id, editingRunId)) return 'This planned workout is already linked to another run.'
  return null
}

export function workoutStatusLabel(workout: PlannedWorkout, run: RunLog) {
  return run.runDate === workout.date
    ? 'Completed as planned'
    : `Made up from ${formatPlanDate(workout.date, 'EEEE')}`
}
