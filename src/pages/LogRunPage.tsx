import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeftIcon, CheckIcon } from '@phosphor-icons/react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ErrorState, PageSkeleton } from '../components/States'
import { usePlan, useRunMutations, useRuns } from '../hooks/useAppData'
import { formatPlanDate, todayISO } from '../lib/date'
import { durationFieldsFromSeconds, durationFieldsFromValue, durationValueFromFields, formatPace, paceSeconds, parseDuration, type DurationFields } from '../lib/format'
import { eligibleMakeUpWorkouts, isWorkoutEligibleForRunDate, workoutAssignmentError } from '../lib/workouts'
import { runInputSchema } from '../lib/validation'
import type { Effort, PlannedWorkout, RunLog } from '../types'

const effortOptions: { value: Effort; label: string }[] = [{ value: 'easy', label: 'Easy' }, { value: 'moderate', label: 'Moderate' }, { value: 'hard', label: 'Hard' }, { value: 'max', label: 'Max' }]

function numericDurationValue(value: string, maxLength = 2) {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

function defaultRunDate(workout: PlannedWorkout | undefined, requestedDate: string | null, existingDate?: string) {
  if (existingDate) return existingDate
  if (requestedDate) return requestedDate
  const today = todayISO()
  return workout && isWorkoutEligibleForRunDate(workout, today) ? today : workout?.date ?? today
}

export function LogRunPage() {
  const [params] = useSearchParams()
  const plan = usePlan()
  const runs = useRuns()

  if (plan.isLoading || runs.isLoading) return <PageSkeleton />
  if (plan.error || runs.error) return <ErrorState retry={() => { void plan.refetch(); void runs.refetch() }} />

  const planData = plan.data ?? []
  const runData = runs.data ?? []
  const existing = runData.find((run) => run.id === params.get('run'))
  const requestedWorkout = planData.find((item) => item.id === (existing?.plannedWorkoutId ?? params.get('workout')))
  const initialDate = defaultRunDate(requestedWorkout, params.get('date'), existing?.runDate)
  const initialWorkoutId = existing?.plannedWorkoutId ?? requestedWorkout?.id ?? null
  const formKey = existing?.id ?? initialWorkoutId ?? params.get('date') ?? 'extra'

  return <LogRunForm
    key={formKey}
    plan={planData}
    runs={runData}
    existing={existing}
    initialDate={initialDate}
    initialWorkoutId={initialWorkoutId}
  />
}

function LogRunForm({ plan, runs, existing, initialDate, initialWorkoutId }: { plan: PlannedWorkout[]; runs: RunLog[]; existing?: RunLog; initialDate: string; initialWorkoutId: string | null }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const mutations = useRunMutations()
  const draftKey = `run-together:draft:${existing?.id ?? initialWorkoutId ?? params.get('date') ?? 'extra'}`
  const savedDraft = useMemo(() => { try { return JSON.parse(sessionStorage.getItem(draftKey) ?? 'null') as Record<string, string> | null } catch { return null } }, [draftKey])
  const initialDurationFields: DurationFields = savedDraft?.hours !== undefined || savedDraft?.minutes !== undefined || savedDraft?.seconds !== undefined
    ? { hours: savedDraft?.hours ?? '', minutes: savedDraft?.minutes ?? '', seconds: savedDraft?.seconds ?? '' }
    : savedDraft?.duration
      ? durationFieldsFromValue(savedDraft.duration)
      : existing
        ? durationFieldsFromSeconds(existing.durationSeconds)
        : { hours: '', minutes: '', seconds: '' }
  const [date, setDate] = useState(savedDraft?.date ?? initialDate)
  const [plannedWorkoutId, setPlannedWorkoutId] = useState<string | null>(savedDraft?.plannedWorkoutId || initialWorkoutId)
  const [distance, setDistance] = useState(savedDraft?.distance ?? (existing ? String(existing.distanceKm) : plan.find((item) => item.id === initialWorkoutId)?.plannedKm.toString() ?? ''))
  const [hours, setHours] = useState(initialDurationFields.hours)
  const [minutes, setMinutes] = useState(initialDurationFields.minutes)
  const [seconds, setSeconds] = useState(initialDurationFields.seconds)
  const [effort, setEffort] = useState<Effort | null>((savedDraft?.effort as Effort) ?? existing?.effort ?? null)
  const [notes, setNotes] = useState(savedDraft?.notes ?? existing?.notes ?? '')
  const [error, setError] = useState('')
  const duration = durationValueFromFields({ hours, minutes, seconds })
  const parsedDuration = parseDuration(duration)
  const durationError = (hours || minutes || seconds) && !parsedDuration ? 'Use MM:SS or H:MM:SS with minutes and seconds between 00 and 59.' : null
  const numericDistance = Number(distance)
  const selectedWorkout = plan.find((item) => item.id === plannedWorkoutId)
  const eligibleWorkouts = eligibleMakeUpWorkouts(plan, runs, date, existing?.id)
  const assignmentOptions = selectedWorkout && !eligibleWorkouts.some((workout) => workout.id === selectedWorkout.id)
    ? [selectedWorkout, ...eligibleWorkouts]
    : eligibleWorkouts
  const assignmentError = plannedWorkoutId ? workoutAssignmentError(selectedWorkout, date, runs, existing?.id) : null
  const pace = parsedDuration && numericDistance > 0 ? formatPace(paceSeconds(parsedDuration, numericDistance)) : null
  const assignmentSummary = selectedWorkout
    ? date === selectedWorkout.date
      ? 'This run will complete the scheduled workout.'
      : date < selectedWorkout.date
        ? `This run will complete the ${formatPlanDate(selectedWorkout.date, 'EEEE')} workout early.`
        : `This run will make up the ${formatPlanDate(selectedWorkout.date, 'EEEE')} workout.`
    : null

  useEffect(() => {
    sessionStorage.setItem(draftKey, JSON.stringify({ date, plannedWorkoutId: plannedWorkoutId ?? '', distance, duration, hours, minutes, seconds, effort: effort ?? '', notes }))
  }, [date, plannedWorkoutId, distance, duration, hours, minutes, seconds, effort, notes, draftKey])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    const result = runInputSchema.safeParse({ plannedWorkoutId, runDate: date, distanceKm: numericDistance, durationSeconds: parsedDuration, effort, notes })
    if (!result.success) { setError(result.error.issues[0]?.message ?? 'Check your run details'); return }
    if (assignmentError) { setError(assignmentError); return }
    try {
      await mutations.save.mutateAsync({ id: existing?.id, ...result.data })
      sessionStorage.removeItem(draftKey)
      navigate(existing ? '/history' : '/')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save your run. Your entries are still here.')
    }
  }

  return <div className="min-h-[calc(100dvh-4.5rem)] bg-[#ebe7de]">
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-10 md:py-14">
      <Link to={existing ? '/history' : '/'} className="focus-ring pressable inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-muted hover:text-ink"><ArrowLeftIcon size={19} />Back</Link>
      <div className="mt-8 grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-24">
        <header>
          <p className="eyebrow">{existing ? 'Edit run' : 'Log run'}</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-.055em] md:text-6xl">{selectedWorkout?.session ?? 'Extra run'}</h1>
          {selectedWorkout && <div className="mt-8 border-t border-line pt-5"><p className="number text-2xl">{selectedWorkout.plannedKm.toFixed(1)} KM</p><p className="mt-2 text-sm leading-6 text-muted">{selectedWorkout.targetPace}<br />{selectedWorkout.workoutDetail}</p><p className="mt-4 text-sm font-medium text-accent">{assignmentSummary}</p></div>}
        </header>
        <form onSubmit={submit} className="space-y-8" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <label><span className="mb-2 block text-sm font-semibold">Distance <span className="text-accent">*</span></span><div className="relative"><input className="focus-ring number min-h-16 w-full border border-line bg-canvas px-4 pr-14 text-2xl outline-none focus:border-ink" inputMode="decimal" placeholder="8.2" value={distance} onChange={(e) => setDistance(e.target.value)} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">KM</span></div></label>
            <fieldset>
              <legend id="run-time-label" className="mb-2 block text-sm font-semibold">Time <span className="text-accent">*</span></legend>
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1.25fr)_auto_minmax(0,1.25fr)] items-end gap-2" aria-labelledby="run-time-label">
                <label className="min-w-0"><span className="mb-2 block text-xs font-semibold text-muted">Hours</span><input aria-label="Hours" className="focus-ring number min-h-16 w-full border border-line bg-canvas px-3 text-2xl outline-none placeholder:text-line focus:border-ink" type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off" maxLength={2} placeholder="0" value={hours} onChange={(e) => setHours(numericDurationValue(e.target.value))} aria-invalid={Boolean(durationError)} /></label>
                <span className="pb-4 number text-xl text-muted" aria-hidden="true">:</span>
                <label className="min-w-0"><span className="mb-2 block text-xs font-semibold text-muted">Minutes</span><input aria-label="Minutes" className="focus-ring number min-h-16 w-full border border-line bg-canvas px-3 text-2xl outline-none placeholder:text-line focus:border-ink" type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off" maxLength={2} placeholder="44" value={minutes} onChange={(e) => setMinutes(numericDurationValue(e.target.value))} aria-invalid={Boolean(durationError)} /></label>
                <span className="pb-4 number text-xl text-muted" aria-hidden="true">:</span>
                <label className="min-w-0"><span className="mb-2 block text-xs font-semibold text-muted">Seconds</span><input aria-label="Seconds" className="focus-ring number min-h-16 w-full border border-line bg-canvas px-3 text-2xl outline-none placeholder:text-line focus:border-ink" type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off" maxLength={2} placeholder="32" value={seconds} onChange={(e) => setSeconds(numericDurationValue(e.target.value))} aria-invalid={Boolean(durationError)} /></label>
              </div>
              <span id="time-hint" className="mt-2 block text-xs leading-5 text-muted">Enter minutes and seconds; add hours for longer runs. Example: 44:32 or 1:08:42.</span>
              {durationError && <p role="alert" className="mt-3 border-l-2 border-accent pl-3 text-sm text-accent-dark">{durationError}</p>}
            </fieldset>
          </div>
          <div className="border-y border-line py-6"><p className="eyebrow">Average pace</p><p className={`number mt-3 text-4xl ${pace ? 'text-ink' : 'text-line'}`}>{pace ?? '–:––'} <span className="font-sans text-sm tracking-normal">/KM</span></p></div>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Run date <span className="text-accent">*</span></span><input type="date" className="focus-ring min-h-14 w-full border border-line bg-canvas px-4 text-base outline-none focus:border-ink" value={date} onChange={(e) => { setDate(e.target.value); setError('') }} /><span className="mt-2 block text-xs text-muted">When you actually ran.</span></label>
          <fieldset>
            <legend className="mb-3 text-sm font-semibold">Counts toward <span className="font-normal text-muted">· choose one</span></legend>
            <div className="space-y-2">
              <label className={`focus-within:border-ink flex cursor-pointer items-start gap-3 border bg-canvas px-4 py-4 ${plannedWorkoutId === null ? 'border-ink' : 'border-line'}`}><input className="mt-1 size-4 accent-accent" type="radio" name="planned-workout" checked={plannedWorkoutId === null} onChange={() => { setPlannedWorkoutId(null); setError('') }} /><span><span className="block text-sm font-semibold">Extra run</span><span className="mt-1 block text-xs leading-5 text-muted">Adds distance without checking off a planned workout.</span></span></label>
              {assignmentOptions.map((workout) => <label key={workout.id} className={`focus-within:border-ink flex cursor-pointer items-start gap-3 border bg-canvas px-4 py-4 ${plannedWorkoutId === workout.id ? 'border-ink' : 'border-line'}`}><input className="mt-1 size-4 accent-accent" type="radio" name="planned-workout" value={workout.id} checked={plannedWorkoutId === workout.id} onChange={() => { setPlannedWorkoutId(workout.id); setError('') }} /><span className="min-w-0"><span className="block text-sm font-semibold">{formatPlanDate(workout.date, 'EEE, d MMM')} · {workout.session}</span><span className="mt-1 block text-xs leading-5 text-muted">{workout.plannedKm.toFixed(1)} KM planned{workout.id === initialWorkoutId && existing ? ' · current assignment' : ''}</span></span></label>)}
            </div>
            {!plannedWorkoutId && <p className="mt-3 text-xs leading-5 text-muted">{eligibleWorkouts.length ? 'Workouts from this week appear here when you choose what this run counts toward.' : 'No planned workout is eligible for this run date, so it will remain extra.'}</p>}
            {assignmentError && <p role="alert" className="mt-3 border-l-2 border-accent pl-3 text-sm text-accent-dark">{assignmentError}</p>}
          </fieldset>
          <fieldset><legend className="mb-3 text-sm font-semibold">Effort <span className="font-normal text-muted">· optional</span></legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{effortOptions.map((option) => <button type="button" key={option.value} aria-pressed={effort === option.value} onClick={() => setEffort(effort === option.value ? null : option.value)} className={`focus-ring pressable min-h-12 border px-3 text-sm font-medium ${effort === option.value ? 'border-ink bg-ink text-canvas' : 'border-line bg-canvas hover:border-ink'}`}>{option.label}</button>)}</div></fieldset>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Notes <span className="font-normal text-muted">· optional</span></span><textarea className="focus-ring min-h-28 w-full resize-y border border-line bg-canvas p-4 text-base leading-6 outline-none focus:border-ink" maxLength={280} placeholder="How did it feel?" value={notes} onChange={(e) => setNotes(e.target.value)} /><span className="mt-2 block text-right text-xs text-muted">{notes.length}/280</span></label>
          {(error && !assignmentError) && <p role="alert" className="border-l-2 border-accent pl-3 text-sm text-accent-dark">{error}</p>}
          <button disabled={mutations.save.isPending} className="focus-ring pressable flex min-h-14 w-full items-center justify-between bg-accent px-6 font-semibold text-white hover:bg-accent-dark disabled:opacity-50"><span>{mutations.save.isPending ? 'Saving…' : existing ? 'Save changes' : 'Save run'}</span><CheckIcon size={19} weight="bold" /></button>
        </form>
      </div>
    </div>
  </div>
}
