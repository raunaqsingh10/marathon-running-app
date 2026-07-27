import { ArrowClockwiseIcon, WarningCircleIcon } from '@phosphor-icons/react'

export function PageSkeleton() {
  return <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-10" aria-label="Loading"><div className="h-3 w-28 animate-pulse bg-line" /><div className="mt-8 h-20 w-3/4 animate-pulse bg-line/70" /><div className="mt-14 h-px bg-line" /><div className="mt-8 grid gap-4 md:grid-cols-2"><div className="h-32 animate-pulse bg-line/60" /><div className="h-32 animate-pulse bg-line/40" /></div></div>
}

export function ErrorState({ message = 'Something went wrong.', retry }: { message?: string; retry?: () => void }) {
  return <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-start justify-center px-5"><WarningCircleIcon size={30} weight="light" /><h2 className="mt-5 text-2xl font-semibold tracking-tight">Couldn’t load this page</h2><p className="mt-2 text-muted">{message}</p>{retry && <button className="focus-ring pressable mt-7 flex min-h-12 items-center gap-2 border border-ink px-5 text-sm font-semibold" onClick={retry}><ArrowClockwiseIcon size={18} />Try again</button>}</div>
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="border-t border-line py-14"><p className="text-lg font-medium">{title}</p><p className="mt-2 max-w-sm text-sm leading-6 text-muted">{body}</p></div>
}
