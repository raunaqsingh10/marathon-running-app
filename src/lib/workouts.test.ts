import { describe, expect, it } from 'vitest'
import { trainingPlan } from '../data/training-plan'
import type { RunLog } from '../types'
import { completedWorkoutIds, eligibleMakeUpWorkouts, isWorkoutEligibleForRunDate, workoutAssignmentError } from './workouts'

const run = (id: string, plannedWorkoutId: string | null, runDate: string, deletedAt: string | null = null): RunLog => ({
  id,
  userId: 'runner',
  plannedWorkoutId,
  runDate,
  distanceKm: 4.5,
  durationSeconds: 1800,
  averagePaceSeconds: 400,
  effort: null,
  notes: '',
  createdAt: '',
  updatedAt: '',
  deletedAt,
})

const friday = trainingPlan.find((workout) => workout.id === 'w1-strides')!

describe('planned workout make-up rules', () => {
  it('allows a run from the scheduled date through Sunday only', () => {
    expect(isWorkoutEligibleForRunDate(friday, '2026-07-31')).toBe(true)
    expect(isWorkoutEligibleForRunDate(friday, '2026-08-01')).toBe(true)
    expect(isWorkoutEligibleForRunDate(friday, '2026-08-02')).toBe(true)
    expect(isWorkoutEligibleForRunDate(friday, '2026-07-30')).toBe(false)
    expect(isWorkoutEligibleForRunDate(friday, '2026-08-03')).toBe(false)
  })

  it('offers only unassigned workouts and allows the current edit assignment', () => {
    const runs = [run('existing', 'w1-strides', '2026-08-01')]
    const eligible = eligibleMakeUpWorkouts(trainingPlan, runs, '2026-08-01')
    expect(eligible.map((workout) => workout.id)).not.toContain('w1-strides')
    expect(eligible.map((workout) => workout.id)).toContain('w1-quality')
    expect(eligibleMakeUpWorkouts(trainingPlan, runs, '2026-08-01', 'existing').map((workout) => workout.id)).toContain('w1-strides')
  })

  it('returns clear errors for invalid or duplicate assignments', () => {
    expect(workoutAssignmentError(friday, '2026-08-01', [])).toBeNull()
    expect(workoutAssignmentError(friday, '2026-07-30', [])).toContain('before')
    expect(workoutAssignmentError(friday, '2026-08-03', [])).toContain('Sunday')
    expect(workoutAssignmentError(friday, '2026-08-01', [run('existing', friday.id, '2026-08-01')])).toContain('already linked')
  })

  it('does not count deleted assignments and makes them available again', () => {
    const deleted = run('deleted', friday.id, '2026-08-01', '2026-08-02T00:00:00.000Z')
    expect(completedWorkoutIds([deleted]).has(friday.id)).toBe(false)
    expect(eligibleMakeUpWorkouts(trainingPlan, [deleted], '2026-08-01').map((workout) => workout.id)).toContain(friday.id)
  })
})
