import { describe, expect, it } from 'vitest'
import { totalPlannedKm, trainingPlan } from './training-plan'

describe('workbook training plan seed', () => {
  it('contains all 32 sessions over eight weeks', () => {
    expect(trainingPlan).toHaveLength(32)
    expect(new Set(trainingPlan.map((workout) => workout.week))).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8]))
    expect(trainingPlan.filter((workout) => workout.week === 1)).toHaveLength(4)
    expect(trainingPlan.filter((workout) => workout.week === 8)).toHaveLength(4)
  })

  it('preserves the workbook boundaries and total distance', () => {
    expect(trainingPlan[0]).toMatchObject({ date: '2026-07-28', session: 'Quality', plannedKm: 5.5 })
    expect(trainingPlan.at(-1)).toMatchObject({ date: '2026-09-20', session: 'Long', plannedKm: 16 })
    expect(totalPlannedKm).toBe(245.5)
  })

  it('has one workout per date and exact target text', () => {
    expect(new Set(trainingPlan.map((workout) => workout.date)).size).toBe(32)
    expect(trainingPlan.find((workout) => workout.id === 'w8-long')?.targetPace).toBe('Finish strong, not exhausted')
  })
})
