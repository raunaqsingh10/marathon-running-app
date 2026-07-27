export type Effort = 'easy' | 'moderate' | 'hard' | 'max'

export interface Profile {
  id: string
  displayName: string
  email: string
}

export interface PlannedWorkout {
  id: string
  week: number
  date: string
  day: string
  session: string
  plannedKm: number
  targetPace: string
  workoutDetail: string
}

export interface RunLog {
  id: string
  userId: string
  plannedWorkoutId: string | null
  runDate: string
  distanceKm: number
  durationSeconds: number
  averagePaceSeconds: number
  effort: Effort | null
  notes: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface RunInput {
  id?: string
  plannedWorkoutId: string | null
  runDate: string
  distanceKm: number
  durationSeconds: number
  effort: Effort | null
  notes: string
}

export interface RunnerMetrics {
  runnerId: string
  runnerName: string
  weeklyKm: number
  monthlyKm: number
  completedDue: number
  plannedDue: number
  completionRate: number
  consistencyStreak: number
  longestRunKm: number
}

export interface WeeklyComparison {
  week: number
  weekStart: string
  raunaqKm: number
  vipulKm: number
}
