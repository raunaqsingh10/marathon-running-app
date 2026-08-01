import { trainingPlan } from '../data/training-plan'
import { buildWeeklyComparison, metricsForRunner } from '../lib/metrics'
import { isDemoMode, supabase } from '../lib/supabase'
import { workoutAssignmentError } from '../lib/workouts'
import type { Effort, PlannedWorkout, Profile, RunInput, RunLog, RunnerMetrics, WeeklyComparison } from '../types'

export const demoProfiles: Profile[] = [
  { id: 'demo-raunaq', displayName: 'Raunaq', email: 'raunaq@runtogether.local' },
  { id: 'demo-vipul', displayName: 'Vipul', email: 'vipul@runtogether.local' },
]

const DEMO_RUNS_KEY = 'run-together:demo-runs'

function readDemoRuns(): RunLog[] {
  try { return JSON.parse(localStorage.getItem(DEMO_RUNS_KEY) ?? '[]') as RunLog[] } catch { return [] }
}

function writeDemoRuns(runs: RunLog[]) {
  localStorage.setItem(DEMO_RUNS_KEY, JSON.stringify(runs))
}

function mapWorkout(row: Record<string, unknown>): PlannedWorkout {
  return {
    id: String(row.id), week: Number(row.week_number), date: String(row.workout_date), day: String(row.day_name),
    session: String(row.session_type), plannedKm: Number(row.planned_km), targetPace: String(row.target_pace), workoutDetail: String(row.workout_detail),
  }
}

function mapRun(row: Record<string, unknown>): RunLog {
  return {
    id: String(row.id), userId: String(row.user_id), plannedWorkoutId: row.planned_workout_id ? String(row.planned_workout_id) : null,
    runDate: String(row.run_date), distanceKm: Number(row.distance_km), durationSeconds: Number(row.duration_seconds),
    averagePaceSeconds: Number(row.average_pace_seconds), effort: row.effort as Effort | null, notes: String(row.notes ?? ''),
    createdAt: String(row.created_at), updatedAt: String(row.updated_at), deletedAt: row.deleted_at ? String(row.deleted_at) : null,
  }
}

function assertDemoAssignment(input: RunInput, editingRunId?: string) {
  if (!input.plannedWorkoutId) return
  const issue = workoutAssignmentError(trainingPlan.find((workout) => workout.id === input.plannedWorkoutId), input.runDate, readDemoRuns(), editingRunId)
  if (issue) throw new Error(issue)
}

function runMutationError(error: { code?: string; message?: string }) {
  if (error.code === '23505' || error.message?.includes('one_active_log_per_workout')) return new Error('This planned workout is already linked to another run. Choose another workout or leave it extra.')
  return error
}

export async function getProfile(userId: string): Promise<Profile> {
  if (isDemoMode) return demoProfiles.find((profile) => profile.id === userId) ?? demoProfiles[0]
  const { data, error } = await supabase!.from('profiles').select('id, display_name, email').eq('id', userId).single()
  if (error) throw error
  return { id: data.id, displayName: data.display_name, email: data.email }
}

export async function getPlan(): Promise<PlannedWorkout[]> {
  if (isDemoMode) return trainingPlan
  const { data, error } = await supabase!.from('planned_workouts').select('*').order('workout_date')
  if (error) throw error
  return (data ?? []).map(mapWorkout)
}

export async function getRuns(userId: string): Promise<RunLog[]> {
  if (isDemoMode) return readDemoRuns().filter((run) => run.userId === userId)
  const { data, error } = await supabase!.from('run_logs').select('*').eq('user_id', userId).is('deleted_at', null).order('run_date', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapRun)
}

export async function createRun(userId: string, input: RunInput): Promise<RunLog> {
  if (isDemoMode) {
    assertDemoAssignment(input)
    const now = new Date().toISOString()
    const run: RunLog = {
      id: crypto.randomUUID(), userId, plannedWorkoutId: input.plannedWorkoutId, runDate: input.runDate,
      distanceKm: input.distanceKm, durationSeconds: input.durationSeconds, effort: input.effort, notes: input.notes,
      averagePaceSeconds: Math.round(input.durationSeconds / input.distanceKm), createdAt: now, updatedAt: now, deletedAt: null,
    }
    writeDemoRuns([...readDemoRuns(), run])
    return run
  }
  const { data, error } = await supabase!.from('run_logs').insert({
    user_id: userId, planned_workout_id: input.plannedWorkoutId, run_date: input.runDate, distance_km: input.distanceKm,
    duration_seconds: input.durationSeconds, effort: input.effort, notes: input.notes,
  }).select().single()
  if (error) throw runMutationError(error)
  return mapRun(data)
}

export async function updateRun(userId: string, input: RunInput): Promise<RunLog> {
  if (!input.id) throw new Error('Run id is required')
  if (isDemoMode) {
    assertDemoAssignment(input, input.id)
    let updated: RunLog | undefined
    writeDemoRuns(readDemoRuns().map((run) => {
      if (run.id !== input.id || run.userId !== userId) return run
      updated = { ...run, ...input, averagePaceSeconds: Math.round(input.durationSeconds / input.distanceKm), updatedAt: new Date().toISOString() }
      return updated
    }))
    if (!updated) throw new Error('Run not found')
    return updated
  }
  const { data, error } = await supabase!.from('run_logs').update({
    planned_workout_id: input.plannedWorkoutId, run_date: input.runDate, distance_km: input.distanceKm,
    duration_seconds: input.durationSeconds, effort: input.effort, notes: input.notes,
  }).eq('id', input.id).eq('user_id', userId).select().single()
  if (error) throw runMutationError(error)
  return mapRun(data)
}

export async function deleteRun(userId: string, runId: string) {
  const deletedAt = new Date().toISOString()
  if (isDemoMode) {
    writeDemoRuns(readDemoRuns().map((run) => run.id === runId && run.userId === userId ? { ...run, deletedAt } : run))
    return
  }
  const { error } = await supabase!.from('run_logs').update({ deleted_at: deletedAt }).eq('id', runId).eq('user_id', userId)
  if (error) throw error
}

export async function restoreRun(userId: string, runId: string) {
  if (isDemoMode) {
    writeDemoRuns(readDemoRuns().map((run) => run.id === runId && run.userId === userId ? { ...run, deletedAt: null } : run))
    return
  }
  const { error } = await supabase!.from('run_logs').update({ deleted_at: null }).eq('id', runId).eq('user_id', userId)
  if (error) throw error
}

export async function getComparison(referenceDate: string): Promise<{ metrics: RunnerMetrics[]; weekly: WeeklyComparison[] }> {
  if (isDemoMode) {
    const runs = readDemoRuns()
    return { metrics: demoProfiles.map((profile) => metricsForRunner(profile, runs, referenceDate)), weekly: buildWeeklyComparison(runs, demoProfiles) }
  }
  const [metricsResult, weeklyResult] = await Promise.all([
    supabase!.rpc('get_runner_comparison', { reference_date: referenceDate }),
    supabase!.rpc('get_weekly_comparison'),
  ])
  if (metricsResult.error) throw metricsResult.error
  if (weeklyResult.error) throw weeklyResult.error
  return {
    metrics: (metricsResult.data ?? []).map((row: Record<string, unknown>) => ({
      runnerId: String(row.runner_id), runnerName: String(row.runner_name), weeklyKm: Number(row.weekly_km), monthlyKm: Number(row.monthly_km),
      completedDue: Number(row.completed_due), plannedDue: Number(row.planned_due), completionRate: Number(row.completion_rate),
      consistencyStreak: Number(row.consistency_streak), longestRunKm: Number(row.longest_run_km),
    })),
    weekly: (weeklyResult.data ?? []).map((row: Record<string, unknown>) => ({ week: Number(row.week_number), weekStart: String(row.week_start), raunaqKm: Number(row.raunaq_km), vipulKm: Number(row.vipul_km) })),
  }
}
