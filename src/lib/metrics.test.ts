import { describe, expect, it } from 'vitest'
import type { Profile, RunLog } from '../types'
import { buildWeeklyComparison, metricsForRunner } from './metrics'

const profile: Profile = { id: 'runner', displayName: 'Raunaq', email: 'r@example.com' }
const run = (plannedWorkoutId: string | null, runDate: string, distanceKm: number): RunLog => ({
  id: `${plannedWorkoutId}-${runDate}`, userId: profile.id, plannedWorkoutId, runDate, distanceKm, durationSeconds: 1800,
  averagePaceSeconds: Math.round(1800 / distanceKm), effort: null, notes: '', createdAt: '', updatedAt: '', deletedAt: null,
})

describe('runner metrics', () => {
  it('counts due completion and consecutive scheduled workouts', () => {
    const metrics = metricsForRunner(profile, [run('w1-quality', '2026-07-28', 5.7), run('w1-easy', '2026-07-29', 5)], '2026-07-30')
    expect(metrics.completedDue).toBe(2)
    expect(metrics.plannedDue).toBe(2)
    expect(metrics.completionRate).toBe(100)
    expect(metrics.consistencyStreak).toBe(2)
  })

  it('includes extras in distance but not scheduled completion', () => {
    const metrics = metricsForRunner(profile, [run(null, '2026-07-30', 4.2)], '2026-07-30')
    expect(metrics.weeklyKm).toBe(4.2)
    expect(metrics.completedDue).toBe(0)
    expect(metrics.longestRunKm).toBe(4.2)
  })

  it('counts a late run against the planned workout it fulfills', () => {
    const metrics = metricsForRunner(profile, [run('w1-strides', '2026-08-01', 4.5)], '2026-08-01')
    expect(metrics.weeklyKm).toBe(4.5)
    expect(metrics.completedDue).toBe(1)
    expect(metrics.plannedDue).toBe(3)
  })

  it('counts an early run against a future workout once that workout is due', () => {
    const metrics = metricsForRunner(profile, [run('w1-long', '2026-07-28', 9)], '2026-08-02')
    expect(metrics.weeklyKm).toBe(9)
    expect(metrics.completedDue).toBe(1)
    expect(metrics.plannedDue).toBe(4)
  })

  it('includes extra and make-up runs in the weekly distance comparison', () => {
    const weekly = buildWeeklyComparison([
      run(null, '2026-07-30', 4.2),
      run('w1-strides', '2026-08-01', 4.5),
    ], [profile, { id: 'vipul', displayName: 'Vipul', email: 'v@example.com' }])
    expect(weekly[0]?.raunaqKm).toBe(8.7)
  })
})
