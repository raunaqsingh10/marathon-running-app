import { CheckCircleIcon } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { ErrorState, PageSkeleton } from '../components/States'
import { usePlan, useRuns } from '../hooks/useAppData'
import { formatPlanDate, todayISO } from '../lib/date'

export function PlanPage() {
  const plan = usePlan(), runs = useRuns()
  if (plan.isLoading || runs.isLoading) return <PageSkeleton />
  if (plan.error || runs.error) return <ErrorState retry={() => { void plan.refetch(); void runs.refetch() }} />
  const today = todayISO()
  const currentWeek = plan.data?.find((workout) => workout.date >= today)?.week ?? 8
  const completed = new Set(runs.data?.filter((run) => !run.deletedAt).map((run) => run.plannedWorkoutId))

  return <div className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-16">
    <div className="grid gap-6 md:grid-cols-[1fr_1fr]"><div><p className="eyebrow">Eight-week programme</p><h1 className="mt-5 text-5xl font-semibold tracking-[-.065em] md:text-7xl">The plan.</h1></div><p className="max-w-md self-end text-base leading-7 text-muted md:justify-self-end">Four purposeful runs each week. Build patiently, stay conversational on easy days, and finish stronger than you started.</p></div>
    <div className="mt-14 border-t border-line md:mt-20">{Array.from({ length: 8 }, (_, index) => index + 1).map((week) => {
      const workouts = plan.data?.filter((item) => item.week === week) ?? []
      const completedCount = workouts.filter((item) => completed.has(item.id)).length
      const plannedKm = workouts.reduce((sum, item) => sum + item.plannedKm, 0)
      return <details key={week} open={week === currentWeek} className="group border-b border-line">
        <summary className="focus-ring pressable grid min-h-24 cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-4 py-5 marker:hidden md:grid-cols-[.35fr_1fr_auto]"><span className="eyebrow text-ink">Week {String(week).padStart(2, '0')}</span><span className="hidden text-sm text-muted md:block">{completedCount}/{workouts.length} complete</span><span className="number text-lg">{plannedKm.toFixed(1)} KM <span className="ml-4 inline-block font-sans text-xl tracking-normal transition-transform group-open:rotate-45">+</span></span></summary>
        <div className="pb-8 md:pl-[35%]">{workouts.map((workout) => {
          const isToday = workout.date === today, isComplete = completed.has(workout.id), isFuture = workout.date > today
          return <div key={workout.id} className={`grid grid-cols-[4rem_1fr_auto] gap-3 border-t py-5 ${isToday ? 'border-accent' : 'border-line'} ${isFuture ? 'text-muted' : ''}`}><div><p className="text-xs font-semibold uppercase tracking-[.1em]">{formatPlanDate(workout.date, 'EEE')}</p><p className="number mt-1 text-sm">{formatPlanDate(workout.date, 'd MMM')}</p></div><div><div className="flex items-center gap-2"><p className="font-semibold">{workout.session}</p>{isToday && <span className="text-[.65rem] font-bold uppercase tracking-[.12em] text-accent">Today</span>}</div><p className="mt-1 text-sm text-muted">{workout.targetPace}</p><p className="mt-2 hidden max-w-lg text-sm leading-6 text-muted sm:block">{workout.workoutDetail}</p></div><div className="text-right"><p className="number font-medium">{workout.plannedKm.toFixed(1)} KM</p>{isComplete ? <CheckCircleIcon className="ml-auto mt-2 text-accent" size={20} weight="fill" /> : !isFuture && <Link to={`/log?workout=${workout.id}`} className="focus-ring mt-2 inline-block text-xs font-semibold underline underline-offset-4">Log</Link>}</div></div>
        })}</div>
      </details>
    })}</div>
  </div>
}
