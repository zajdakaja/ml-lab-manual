import { LabeledPoint, Split } from './math'

const W = 420
const H = 420
const PAD = 44
const RANGE = 10

const sx = (x: number) => PAD + (x / RANGE) * (W - 2 * PAD)
const sy = (y: number) => H - PAD - (y / RANGE) * (H - 2 * PAD)

const CLASS_COLORS: Record<string, string> = {
  A: '#3b82f6',
  B: '#f97316',
  C: '#10b981',
}

const ticks = [0, 2, 4, 6, 8, 10]

interface Props {
  points: LabeledPoint[]
  split: Split | null
  splitAxis: 'x' | 'y'
  onChartClick: (x: number, y: number) => void
}

export default function DTChart({ points, split, splitAxis, onChartClick }: Props) {
  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const svgX = ((e.clientX - rect.left) / rect.width) * W
    const svgY = ((e.clientY - rect.top) / rect.height) * H
    const dataX = Math.max(0, Math.min(RANGE, ((svgX - PAD) / (W - 2 * PAD)) * RANGE))
    const dataY = Math.max(0, Math.min(RANGE, ((H - PAD - svgY) / (H - 2 * PAD)) * RANGE))
    onChartClick(dataX, dataY)
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="chart-svg cursor-crosshair"
      onClick={handleClick}
    >
      {/* Shaded regions when split active */}
      {split && split.axis === 'x' && (
        <>
          <rect x={sx(0)} y={sy(RANGE)} width={sx(split.value) - sx(0)} height={sy(0) - sy(RANGE)} fill="#3b82f6" fillOpacity={0.06} />
          <rect x={sx(split.value)} y={sy(RANGE)} width={sx(RANGE) - sx(split.value)} height={sy(0) - sy(RANGE)} fill="#f97316" fillOpacity={0.06} />
        </>
      )}
      {split && split.axis === 'y' && (
        <>
          <rect x={sx(0)} y={sy(RANGE)} width={sx(RANGE) - sx(0)} height={sy(split.value) - sy(RANGE)} fill="#f97316" fillOpacity={0.06} />
          <rect x={sx(0)} y={sy(split.value)} width={sx(RANGE) - sx(0)} height={sy(0) - sy(split.value)} fill="#3b82f6" fillOpacity={0.06} />
        </>
      )}

      {/* Grid */}
      {ticks.map(t => (
        <g key={t}>
          <line x1={sx(t)} y1={sy(0)} x2={sx(t)} y2={sy(RANGE)} stroke="currentColor" strokeOpacity={0.08} />
          <line x1={sx(0)} y1={sy(t)} x2={sx(RANGE)} y2={sy(t)} stroke="currentColor" strokeOpacity={0.08} />
        </g>
      ))}

      {/* Axes */}
      <line x1={sx(0)} y1={sy(0)} x2={sx(RANGE)} y2={sy(0)} stroke="currentColor" strokeOpacity={0.4} strokeWidth={1.5} />
      <line x1={sx(0)} y1={sy(0)} x2={sx(0)} y2={sy(RANGE)} stroke="currentColor" strokeOpacity={0.4} strokeWidth={1.5} />

      {/* Tick labels */}
      {ticks.map(t => (
        <g key={t}>
          <text x={sx(t)} y={sy(0) + 16} textAnchor="middle" fontSize={11} fill="currentColor" fillOpacity={0.5}>{t}</text>
          {t > 0 && <text x={sx(0) - 8} y={sy(t) + 4} textAnchor="end" fontSize={11} fill="currentColor" fillOpacity={0.5}>{t}</text>}
        </g>
      ))}

      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={12} fill="currentColor" fillOpacity={0.6}>x</text>
      <text x={10} y={H / 2} textAnchor="middle" fontSize={12} fill="currentColor" fillOpacity={0.6} transform={`rotate(-90, 10, ${H / 2})`}>y</text>

      {/* Split line */}
      {split && split.axis === 'x' && (
        <line x1={sx(split.value)} y1={sy(0)} x2={sx(split.value)} y2={sy(RANGE)} stroke="#6366f1" strokeWidth={2} />
      )}
      {split && split.axis === 'y' && (
        <line x1={sx(0)} y1={sy(split.value)} x2={sx(RANGE)} y2={sy(split.value)} stroke="#6366f1" strokeWidth={2} />
      )}
      {split && (
        <text
          x={split.axis === 'x' ? sx(split.value) + 4 : sx(RANGE) - 4}
          y={split.axis === 'x' ? sy(RANGE) + 14 : sy(split.value) - 6}
          fontSize={11} fill="#6366f1" textAnchor={split.axis === 'y' ? 'end' : 'start'}
        >
          {split.axis === 'x' ? `x=${split.value.toFixed(1)}` : `y=${split.value.toFixed(1)}`}
        </text>
      )}

      {/* Preview line (where next click goes) */}
      {splitAxis === 'x'
        ? <text x={W - 8} y={sy(RANGE) + 14} textAnchor="end" fontSize={10} fill="currentColor" fillOpacity={0.3}>click → vertical split</text>
        : <text x={W - 8} y={sy(RANGE) + 14} textAnchor="end" fontSize={10} fill="currentColor" fillOpacity={0.3}>click → horizontal split</text>
      }

      {/* Data points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={sx(p.x)} cy={sy(p.y)}
          r={6}
          fill={CLASS_COLORS[p.label] ?? '#94a3b8'}
          stroke="white" strokeWidth={1.5}
        />
      ))}

      {/* Legend */}
      {Object.entries(CLASS_COLORS).map(([cls, color], i) => (
        <g key={cls} transform={`translate(${PAD + i * 60}, 12)`}>
          <circle cx={6} cy={6} r={5} fill={color} stroke="white" strokeWidth={1} />
          <text x={15} y={10} fontSize={11} fill="currentColor" fillOpacity={0.8}>{cls}</text>
        </g>
      ))}
    </svg>
  )
}
