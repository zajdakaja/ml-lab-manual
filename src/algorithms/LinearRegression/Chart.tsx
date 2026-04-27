import { Point, LRResult } from './math'

const W = 420
const H = 420
const PAD = 44
const RANGE = 10

const sx = (x: number) => PAD + (x / RANGE) * (W - 2 * PAD)
const sy = (y: number) => H - PAD - (y / RANGE) * (H - 2 * PAD)

const ticks = [0, 2, 4, 6, 8, 10]

interface Props {
  points: Point[]
  result: LRResult
  activeRow: number | null
}

export default function LRChart({ points, result, activeRow }: Props) {
  const { slope, intercept } = result

  // trend line endpoints clamped to [0,10]
  const x0 = 0
  const x1 = RANGE
  const y0 = slope * x0 + intercept
  const y1 = slope * x1 + intercept

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
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

      {/* Axis labels */}
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={12} fill="currentColor" fillOpacity={0.6}>x</text>
      <text x={10} y={H / 2} textAnchor="middle" fontSize={12} fill="currentColor" fillOpacity={0.6} transform={`rotate(-90, 10, ${H / 2})`}>y</text>

      {/* Trend line */}
      {denomIsOk(result) && (
        <line
          x1={sx(x0)} y1={sy(y0)}
          x2={sx(x1)} y2={sy(y1)}
          stroke="#3b82f6" strokeWidth={2} strokeDasharray="5,3" opacity={0.8}
        />
      )}

      {/* Residual lines for active row */}
      {activeRow !== null && (() => {
        const r = result.rows[activeRow]
        return (
          <line
            x1={sx(r.x)} y1={sy(r.y)}
            x2={sx(r.x)} y2={sy(r.yHat)}
            stroke="#f97316" strokeWidth={1.5} strokeDasharray="3,2"
          />
        )
      })()}

      {/* Data points */}
      {points.map((p, i) => {
        const isActive = activeRow === i
        return (
          <g key={i}>
            <circle
              cx={sx(p.x)} cy={sy(p.y)}
              r={isActive ? 7 : 5}
              fill={isActive ? '#f97316' : '#3b82f6'}
              stroke="white" strokeWidth={1.5}
              opacity={activeRow !== null && !isActive ? 0.35 : 1}
            />
          </g>
        )
      })}

      {/* Mean lines */}
      <line x1={sx(result.meanX)} y1={sy(0)} x2={sx(result.meanX)} y2={sy(RANGE)} stroke="#10b981" strokeWidth={1} strokeDasharray="4,3" opacity={0.6} />
      <line x1={sx(0)} y1={sy(result.meanY)} x2={sx(RANGE)} y2={sy(result.meanY)} stroke="#10b981" strokeWidth={1} strokeDasharray="4,3" opacity={0.6} />

      {/* Legend */}
      <g transform="translate(8, 8)">
        <line x1={0} y1={8} x2={18} y2={8} stroke="#3b82f6" strokeWidth={2} strokeDasharray="5,3" />
        <text x={22} y={12} fontSize={10} fill="currentColor" fillOpacity={0.7}>trend line</text>
        <line x1={0} y1={24} x2={18} y2={24} stroke="#10b981" strokeWidth={1} strokeDasharray="4,3" />
        <text x={22} y={28} fontSize={10} fill="currentColor" fillOpacity={0.7}>x̄ / ȳ</text>
      </g>
    </svg>
  )
}

function denomIsOk(r: LRResult) {
  return r.denominator !== 0
}
