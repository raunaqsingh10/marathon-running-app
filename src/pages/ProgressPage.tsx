import { ComparisonChart } from '../components/ComparisonChart'
import { Metric } from '../components/Metric'
import { ErrorState, PageSkeleton } from '../components/States'
import { useComparison } from '../hooks/useAppData'

export function ProgressPage() {
  const comparison = useComparison()
  if (comparison.isLoading) return <PageSkeleton />
  if (comparison.error || !comparison.data) return <ErrorState retry={() => void comparison.refetch()} />
  const [first, second] = comparison.data.metrics
  const leaders = [...comparison.data.metrics].sort((a, b) => b.weeklyKm - a.weeklyKm)
  const gap = Math.abs((leaders[0]?.weeklyKm ?? 0) - (leaders[1]?.weeklyKm ?? 0))
  const insight = gap === 0 ? 'You’re level this week.' : `${leaders[0]?.runnerName} is ${gap.toFixed(1)} km ahead this week.`

  return <div className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-16">
    <p className="eyebrow">Shared progress</p>
    <div className="mt-5 flex flex-wrap items-end justify-between gap-6"><h1 className="text-5xl font-semibold tracking-[-.065em] md:text-7xl">Raunaq <span className="text-muted">vs</span> Vipul</h1><p className="border-l-2 border-accent pl-4 text-sm font-medium">{insight}</p></div>
    <section className="mt-14 border-t border-line pt-7 md:mt-20"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Cumulative distance</h2><div className="flex gap-5 text-xs font-medium"><span className="flex items-center gap-2"><i className="size-2 bg-ink" />Raunaq</span><span className="flex items-center gap-2"><i className="size-2 bg-accent" />Vipul</span></div></div><ComparisonChart data={comparison.data.weekly} /></section>
    <section className="mt-14"><div className="grid grid-cols-[1fr_1fr] border-y border-line py-4 text-sm font-semibold"><span>Raunaq</span><span>Vipul</span></div>
      <div className="divide-y divide-line">{[
        ['This week', first?.weeklyKm ?? 0, second?.weeklyKm ?? 0, 'KM'],
        ['This month', first?.monthlyKm ?? 0, second?.monthlyKm ?? 0, 'KM'],
        ['Plan completion', first?.completionRate ?? 0, second?.completionRate ?? 0, '%'],
        ['Current streak', first?.consistencyStreak ?? 0, second?.consistencyStreak ?? 0, 'workouts'],
        ['Longest run', first?.longestRunKm ?? 0, second?.longestRunKm ?? 0, 'KM'],
      ].map(([label, a, b, unit]) => <div key={String(label)} className="grid grid-cols-[1fr_1fr] gap-5 py-7"><div><p className="eyebrow">{label}</p><p className="number mt-3 text-3xl">{Number(a).toFixed(unit === '%' || unit === 'workouts' ? 0 : 1)} <span className="font-sans text-xs tracking-normal text-muted">{unit}</span></p></div><div><p className="eyebrow">{label}</p><p className="number mt-3 text-3xl">{Number(b).toFixed(unit === '%' || unit === 'workouts' ? 0 : 1)} <span className="font-sans text-xs tracking-normal text-muted">{unit}</span></p></div></div>)}</div>
    </section>
    <div className="mt-14 grid gap-5 sm:grid-cols-2"><Metric label={`${first?.runnerName ?? 'Raunaq'} due runs`} value={`${first?.completedDue ?? 0}/${first?.plannedDue ?? 0}`} detail="Scheduled workouts through today" /><Metric label={`${second?.runnerName ?? 'Vipul'} due runs`} value={`${second?.completedDue ?? 0}/${second?.plannedDue ?? 0}`} detail="Scheduled workouts through today" /></div>
  </div>
}
