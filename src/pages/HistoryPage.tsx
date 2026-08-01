import { useEffect, useMemo, useState } from 'react'
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, PageSkeleton } from '../components/States'
import { usePlan, useRunMutations, useRuns } from '../hooks/useAppData'
import { formatPlanDate } from '../lib/date'
import { formatDuration, formatPace } from '../lib/format'
import { workoutStatusLabel } from '../lib/workouts'

export function HistoryPage() {
  const runs = useRuns(), plan = usePlan(), mutations = useRunMutations()
  const runData = runs.data
  const [lastDeleted, setLastDeleted] = useState<string | null>(null)
  useEffect(() => { if (!lastDeleted) return; const timer = window.setTimeout(() => setLastDeleted(null), 7000); return () => window.clearTimeout(timer) }, [lastDeleted])
  const grouped = useMemo(() => {
    const groups = new Map<string, NonNullable<typeof runData>>()
    for (const run of (runData ?? []).filter((item) => !item.deletedAt)) {
      const key = formatPlanDate(run.runDate, 'MMMM yyyy')
      groups.set(key, [...(groups.get(key) ?? []), run])
    }
    return groups
  }, [runData])
  if (runs.isLoading || plan.isLoading) return <PageSkeleton />
  if (runs.error || plan.error) return <ErrorState retry={() => { void runs.refetch(); void plan.refetch() }} />

  return <div className="mx-auto max-w-5xl px-5 py-10 md:px-10 md:py-16">
    <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="eyebrow">Your training record</p><h1 className="mt-5 text-5xl font-semibold tracking-[-.065em] md:text-7xl">Run history.</h1></div><Link to="/log" className="focus-ring pressable flex min-h-12 items-center border border-ink px-5 text-sm font-semibold hover:bg-ink hover:text-canvas">Log an extra run</Link></div>
    {lastDeleted && <div className="sticky top-4 z-10 mt-8 flex items-center justify-between bg-ink px-5 py-4 text-sm text-canvas"><span>Run removed.</span><button className="focus-ring min-h-10 font-semibold underline underline-offset-4" onClick={async () => { await mutations.restore.mutateAsync(lastDeleted); setLastDeleted(null) }}>Undo</button></div>}
    {grouped.size === 0 ? <div className="mt-16"><EmptyState title="No runs logged yet" body="Your completed sessions will collect here. Today’s run is the best place to start." /></div> : <div className="mt-16 space-y-14">{[...grouped.entries()].map(([month, monthRuns]) => <section key={month}><h2 className="eyebrow">{month}</h2><div className="mt-5 border-t border-line">{monthRuns.map((run) => {
      const workout = plan.data?.find((item) => item.id === run.plannedWorkoutId)
      return <article key={run.id ?? `${run.runDate}-${run.createdAt}`} className="grid grid-cols-[4rem_1fr_auto] gap-4 border-b border-line py-6 md:grid-cols-[6rem_1fr_1fr_auto]"><div><p className="number text-2xl">{formatPlanDate(run.runDate, 'dd')}</p><p className="text-xs uppercase tracking-[.12em] text-muted">{formatPlanDate(run.runDate, 'MMM')}</p></div><div><h3 className="font-semibold">{workout?.session ?? 'Extra run'}</h3><p className="mt-1 text-xs leading-5 text-muted">{workout ? `${workoutStatusLabel(workout, run)} · scheduled ${formatPlanDate(workout.date, 'EEE, d MMM')}` : 'Not assigned to the plan'}</p><p className="number mt-2 text-lg">{run.distanceKm.toFixed(1)} KM</p><p className="number mt-1 text-xs text-muted md:hidden">{formatDuration(run.durationSeconds)} · {formatPace(run.averagePaceSeconds)} /KM</p>{run.notes && <p className="mt-3 max-w-md text-sm leading-6 text-muted">{run.notes}</p>}</div><div className="hidden md:block"><p className="number text-lg">{formatDuration(run.durationSeconds)}</p><p className="number mt-2 text-sm text-muted">{formatPace(run.averagePaceSeconds)} /KM</p>{run.effort && <p className="mt-2 text-xs capitalize text-muted">{run.effort} effort</p>}</div><div className="flex items-start gap-1"><Link to={`/log?run=${run.id}`} aria-label="Edit run" className="focus-ring pressable grid size-12 place-items-center text-muted hover:text-ink"><PencilSimpleIcon size={20} /></Link><button aria-label="Delete run" className="focus-ring pressable grid size-12 place-items-center text-muted hover:text-accent" onClick={async () => { await mutations.remove.mutateAsync(run.id); setLastDeleted(run.id) }}><TrashIcon size={20} /></button></div></article>
    })}</div></section>)}</div>}
  </div>
}
