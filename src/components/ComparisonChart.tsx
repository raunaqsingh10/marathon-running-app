import type { WeeklyComparison } from '../types'

const WIDTH = 680
const HEIGHT = 220
const PADDING = 28

function linePoints(values: number[], max: number) {
  let cumulative = 0
  const totals = values.map((value) => (cumulative += value))
  return totals.map((value, index) => `${PADDING + (index * (WIDTH - PADDING * 2)) / 7},${HEIGHT - PADDING - (value / max) * (HEIGHT - PADDING * 2)}`).join(' ')
}

export function ComparisonChart({ data }: { data: WeeklyComparison[] }) {
  const raunaq = data.map((item) => item.raunaqKm)
  const vipul = data.map((item) => item.vipulKm)
  const max = Math.max(1, raunaq.reduce((a, b) => a + b, 0), vipul.reduce((a, b) => a + b, 0))
  return <div className="mt-8 overflow-x-auto" aria-label="Cumulative distance by training week">
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="min-w-[620px]" role="img">
      {[0, .5, 1].map((position) => <line key={position} x1={PADDING} x2={WIDTH - PADDING} y1={PADDING + position * (HEIGHT - PADDING * 2)} y2={PADDING + position * (HEIGHT - PADDING * 2)} stroke="#d8d4ca" strokeWidth="1" />)}
      <polyline points={linePoints(raunaq, max)} fill="none" stroke="#191918" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      <polyline points={linePoints(vipul, max)} fill="none" stroke="#c94f37" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      {data.map((item, index) => <text key={item.week} x={PADDING + (index * (WIDTH - PADDING * 2)) / 7} y={HEIGHT - 4} textAnchor="middle" fontSize="11" fill="#74736e">W{item.week}</text>)}
    </svg>
  </div>
}
