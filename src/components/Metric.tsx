export function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="border-t border-line pt-4"><p className="eyebrow">{label}</p><p className="number mt-4 text-3xl font-medium tracking-[-.06em] md:text-4xl">{value}</p>{detail && <p className="mt-2 text-sm text-muted">{detail}</p>}</div>
}
