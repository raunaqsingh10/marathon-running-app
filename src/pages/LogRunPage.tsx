import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeftIcon, CheckIcon } from '@phosphor-icons/react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { usePlan, useRunMutations, useRuns } from '../hooks/useAppData'
import { todayISO } from '../lib/date'
import { formatDuration, formatPace, paceSeconds, parseDuration } from '../lib/format'
import { runInputSchema } from '../lib/validation'
import type { Effort } from '../types'

const effortOptions: { value: Effort; label: string }[] = [{ value: 'easy', label: 'Easy' }, { value: 'moderate', label: 'Moderate' }, { value: 'hard', label: 'Hard' }, { value: 'max', label: 'Max' }]

export function LogRunPage() {
  const [params] = useSearchParams(), navigate = useNavigate()
  const plan = usePlan(), runs = useRuns(), mutations = useRunMutations()
  const existing = runs.data?.find((run) => run.id === params.get('run'))
  const workout = plan.data?.find((item) => item.id === (existing?.plannedWorkoutId ?? params.get('workout')))
  const draftKey = `run-together:draft:${existing?.id ?? workout?.id ?? params.get('date') ?? 'extra'}`
  const savedDraft = useMemo(() => { try { return JSON.parse(sessionStorage.getItem(draftKey) ?? 'null') as Record<string, string> | null } catch { return null } }, [draftKey])
  const [date, setDate] = useState(savedDraft?.date ?? existing?.runDate ?? workout?.date ?? params.get('date') ?? todayISO())
  const [distance, setDistance] = useState(savedDraft?.distance ?? (existing ? String(existing.distanceKm) : workout ? String(workout.plannedKm) : ''))
  const [duration, setDuration] = useState(savedDraft?.duration ?? (existing ? formatDuration(existing.durationSeconds) : ''))
  const [effort, setEffort] = useState<Effort | null>((savedDraft?.effort as Effort) ?? existing?.effort ?? null)
  const [notes, setNotes] = useState(savedDraft?.notes ?? existing?.notes ?? '')
  const [error, setError] = useState('')
  const parsedDuration = parseDuration(duration)
  const numericDistance = Number(distance)
  const pace = parsedDuration && numericDistance > 0 ? formatPace(paceSeconds(parsedDuration, numericDistance)) : null

  useEffect(() => { sessionStorage.setItem(draftKey, JSON.stringify({ date, distance, duration, effort: effort ?? '', notes })) }, [date, distance, duration, effort, notes, draftKey])

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('')
    const result = runInputSchema.safeParse({ plannedWorkoutId: workout?.id ?? null, runDate: date, distanceKm: numericDistance, durationSeconds: parsedDuration, effort, notes })
    if (!result.success) { setError(result.error.issues[0]?.message ?? 'Check your run details'); return }
    try { await mutations.save.mutateAsync({ id: existing?.id, ...result.data }); sessionStorage.removeItem(draftKey); navigate(existing ? '/history' : '/') } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save your run. Your entries are still here.') }
  }

  return <div className="min-h-[calc(100dvh-4.5rem)] bg-[#ebe7de]">
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-10 md:py-14">
      <Link to={existing ? '/history' : '/'} className="focus-ring pressable inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-muted hover:text-ink"><ArrowLeftIcon size={19} />Back</Link>
      <div className="mt-8 grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-24">
        <header><p className="eyebrow">{existing ? 'Edit run' : 'Log run'}</p><h1 className="mt-5 text-4xl font-semibold tracking-[-.055em] md:text-6xl">{workout?.session ?? 'Extra run'}</h1>{workout && <div className="mt-8 border-t border-line pt-5"><p className="number text-2xl">{workout.plannedKm.toFixed(1)} KM</p><p className="mt-2 text-sm leading-6 text-muted">{workout.targetPace}<br />{workout.workoutDetail}</p></div>}</header>
        <form onSubmit={submit} className="space-y-8" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <label><span className="mb-2 block text-sm font-semibold">Distance <span className="text-accent">*</span></span><div className="relative"><input className="focus-ring number min-h-16 w-full border border-line bg-canvas px-4 pr-14 text-2xl outline-none focus:border-ink" inputMode="decimal" placeholder="8.2" value={distance} onChange={(e) => setDistance(e.target.value)} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">KM</span></div></label>
            <label><span className="mb-2 block text-sm font-semibold">Time <span className="text-accent">*</span></span><input className="focus-ring number min-h-16 w-full border border-line bg-canvas px-4 text-2xl outline-none placeholder:text-line focus:border-ink" inputMode="numeric" placeholder="44:32" value={duration} onChange={(e) => setDuration(e.target.value)} /><span className="mt-2 block text-xs text-muted">MM:SS or H:MM:SS</span></label>
          </div>
          <div className="border-y border-line py-6"><p className="eyebrow">Average pace</p><p className={`number mt-3 text-4xl ${pace ? 'text-ink' : 'text-line'}`}>{pace ?? '–:––'} <span className="font-sans text-sm tracking-normal">/KM</span></p></div>
          {!workout && <label className="block"><span className="mb-2 block text-sm font-semibold">Run date</span><input type="date" className="focus-ring min-h-14 w-full border border-line bg-canvas px-4 text-base outline-none focus:border-ink" value={date} onChange={(e) => setDate(e.target.value)} /></label>}
          <fieldset><legend className="mb-3 text-sm font-semibold">Effort <span className="font-normal text-muted">· optional</span></legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{effortOptions.map((option) => <button type="button" key={option.value} aria-pressed={effort === option.value} onClick={() => setEffort(effort === option.value ? null : option.value)} className={`focus-ring pressable min-h-12 border px-3 text-sm font-medium ${effort === option.value ? 'border-ink bg-ink text-canvas' : 'border-line bg-canvas hover:border-ink'}`}>{option.label}</button>)}</div></fieldset>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Notes <span className="font-normal text-muted">· optional</span></span><textarea className="focus-ring min-h-28 w-full resize-y border border-line bg-canvas p-4 text-base leading-6 outline-none focus:border-ink" maxLength={280} placeholder="How did it feel?" value={notes} onChange={(e) => setNotes(e.target.value)} /><span className="mt-2 block text-right text-xs text-muted">{notes.length}/280</span></label>
          {error && <p role="alert" className="border-l-2 border-accent pl-3 text-sm text-accent-dark">{error}</p>}
          <button disabled={mutations.save.isPending} className="focus-ring pressable flex min-h-14 w-full items-center justify-between bg-accent px-6 font-semibold text-white hover:bg-accent-dark disabled:opacity-50"><span>{mutations.save.isPending ? 'Saving…' : existing ? 'Save changes' : 'Save run'}</span><CheckIcon size={19} weight="bold" /></button>
        </form>
      </div>
    </div>
  </div>
}
