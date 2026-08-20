import { ArrowRightIcon, CheckCircleIcon, PlusIcon } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { ErrorState, PageSkeleton } from '../components/States'
import { usePlan, useProfile, useRuns } from '../hooks/useAppData'
import { greetingForNow, isInCurrentWeek, todayISO } from '../lib/date'
import { formatDuration, formatKm, formatPace } from '../lib/format'
import { workoutStatusLabel } from '../lib/workouts'

export function TodayPage() {
  const profile = useProfile(), plan = usePlan(), runs = useRuns()
  if (profile.isLoading || plan.isLoading || runs.isLoading) return <PageSkeleton />
  if (profile.error || plan.error || runs.error) return <ErrorState retry={() => { void profile.refetch(); void plan.refetch(); void runs.refetch() }} />
  const today = todayISO()
  const workout = plan.data?.find((item) => item.date === today)
  const activeRuns = runs.data?.filter((run) => !run.deletedAt) ?? []
  const scheduledRun = workout ? activeRuns.find((run) => run.plannedWorkoutId === workout.id) : undefined
  const todayRun = activeRuns.find((run) => run.runDate === today)
  const loggedRun = scheduledRun ?? (workout ? undefined : todayRun)
  const loggedWorkout = loggedRun?.plannedWorkoutId ? plan.data?.find((item) => item.id === loggedRun.plannedWorkoutId) : undefined
  const otherTodayRun = workout && !scheduledRun ? todayRun : undefined
  const otherTodayWorkout = otherTodayRun?.plannedWorkoutId ? plan.data?.find((item) => item.id === otherTodayRun.plannedWorkoutId) : undefined
  const upcoming = plan.data?.find((item) => item.date > today)
  const week = workout?.week ?? upcoming?.week ?? 8
  const weekWorkouts = plan.data?.filter((item) => item.week === week) ?? []
  const plannedWeek = weekWorkouts.reduce((sum, item) => sum + item.plannedKm, 0)
  const actualWeek = runs.data?.filter((run) => !run.deletedAt && isInCurrentWeek(run.runDate, today)).reduce((sum, run) => sum + run.distanceKm, 0) ?? 0

  return <div className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-16">
    <p className="eyebrow">{greetingForNow()}, {profile.data?.displayName}</p>
    <div className="mt-10 grid items-end gap-12 border-b border-line pb-12 md:mt-14 md:grid-cols-[1.4fr_.6fr] md:pb-16">
      <section>
        <p className="eyebrow text-accent">Today’s run</p>
        {workout ? <>
          <h1 className="mt-6 text-5xl font-semibold leading-[.92] tracking-[-.065em] sm:text-6xl lg:text-8xl">{workout.session}</h1>
          <p className="number mt-7 text-5xl font-medium sm:text-6xl">{workout.plannedKm.toFixed(1)} <span className="font-sans text-xl tracking-normal text-muted sm:text-2xl">KM</span></p>
          <p className="mt-5 text-base font-medium">Target pace <span className="text-muted">· {workout.targetPace}</span></p>
        </> : <><h1 className="mt-6 text-5xl font-semibold leading-[.92] tracking-[-.065em] sm:text-6xl lg:text-8xl">Rest day</h1><p className="mt-6 max-w-md text-lg leading-7 text-muted">Recovery is part of the plan. Take the day easy and arrive fresh for what’s next.</p></>}
      </section>
      <div className="md:justify-self-end">
        {loggedRun ? <div><div className="flex items-center gap-2 text-accent"><CheckCircleIcon size={24} weight="fill" /><span className="text-sm font-semibold">{workout ? 'Completed' : loggedWorkout ? workoutStatusLabel(loggedWorkout, loggedRun) : 'Extra run logged'}</span></div><p className="number mt-5 text-3xl">{formatKm(loggedRun.distanceKm)}</p><p className="mt-2 text-sm text-muted">{formatDuration(loggedRun.durationSeconds)} · {formatPace(loggedRun.averagePaceSeconds)} /km</p><div className="mt-4 flex flex-wrap gap-5"><Link to={`/log?run=${loggedRun.id}`} className="focus-ring inline-flex min-h-12 items-center text-sm font-semibold underline decoration-line underline-offset-4 hover:decoration-ink">Edit run</Link>{!workout && <Link to={`/log?date=${today}`} className="focus-ring inline-flex min-h-12 items-center text-sm font-semibold text-muted hover:text-ink">Log another</Link>}</div></div> : <Link to={workout ? `/log?workout=${workout.id}` : `/log?date=${today}`} className="focus-ring pressable inline-flex min-h-14 min-w-48 items-center justify-between bg-ink px-6 font-semibold text-canvas hover:bg-accent"><span>{workout ? 'Log run' : 'Log an extra run'}</span>{workout ? <ArrowRightIcon size={19} /> : <PlusIcon size={19} />}</Link>}
        {otherTodayRun && <div className="mt-8 border-t border-line pt-5"><p className="eyebrow">Logged today</p><p className="mt-3 font-semibold">{otherTodayWorkout?.session ?? 'Extra run'}</p><p className="mt-1 text-sm text-muted">{otherTodayWorkout ? workoutStatusLabel(otherTodayWorkout, otherTodayRun) : 'Extra run logged'}</p><Link to={`/log?run=${otherTodayRun.id}`} className="focus-ring mt-3 inline-flex min-h-10 items-center text-sm font-semibold underline underline-offset-4">Edit run</Link></div>}
      </div>
    </div>
    {workout && <div className="grid gap-10 border-b border-line py-10 md:grid-cols-[.8fr_1.2fr] md:py-12"><div><p className="eyebrow">Workout detail</p><p className="mt-4 max-w-xl text-lg leading-8">{workout.workoutDetail}</p></div><div className="grid grid-cols-3 gap-4 md:justify-self-end md:gap-12"><div><p className="eyebrow">Week</p><p className="number mt-4 text-2xl">{week}/8</p></div><div><p className="eyebrow">Planned</p><p className="number mt-4 text-2xl">{plannedWeek.toFixed(1)}</p><p className="mt-1 text-xs text-muted">KM</p></div><div><p className="eyebrow">Complete</p><p className="number mt-4 text-2xl">{actualWeek.toFixed(1)}</p><p className="mt-1 text-xs text-muted">KM</p></div></div></div>}
    {!workout && upcoming && <div className="grid gap-5 py-9 md:grid-cols-[1fr_2fr]"><p className="eyebrow">Up next · {upcoming.day}</p><div><p className="text-xl font-semibold">{upcoming.session} · <span className="number">{upcoming.plannedKm.toFixed(1)} KM</span></p><p className="mt-2 text-sm text-muted">{upcoming.targetPace}</p></div></div>}
  </div>
}
