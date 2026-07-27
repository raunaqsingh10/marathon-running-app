export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label="Run Together">
      <span className="grid size-8 grid-cols-2 gap-[3px]" aria-hidden="true">
        <i className="block bg-ink" /><i className="block bg-accent" />
        <i className="block bg-accent" /><i className="block bg-ink" />
      </span>
      {!compact && <span className="text-sm font-semibold tracking-[-.02em]">RUN TOGETHER</span>}
    </div>
  )
}
