import { Point } from './math'

const W = 420
const H = 420
const PAD = 44
const RANGE = 10

const sx = (x: number) => PAD + (x / RANGE) * (W - 2 * PAD)
const sy = (y: number) => H - PAD - (y / RANGE) * (H - 2 * PAD)

const CLUSTER_COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ec4899']
const ticks = [0, 2, 4, 6, 8, 10]

interface Props {
  points: Point[]
  centroids: Point[]
  assignments: number[]
  phase: 'init' | 'assignment' | 'update'
}

export default function KMeansChart({ points, centroids, assignments, phase }: Props) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      {/* Voronoi-ish background: color tiles */}
      {/* Grid */}
      {ticks.map(t => (
        <g key={t}>
          <line x1={sx(t)} y1={sy(0)} x2={sx(t)} y2={sy(RANGE)} stroke="currentColor" strokeOpacity={0.08} />
          <line x1={sx(0)} y1={sy(t)} x2={sx(RANGE)} y2={sy(t)} stroke="currentColor" strokeOpacity={0.08} />
        </g>
      ))}

      {/* Lines from points to centroids (assignment phase) */}
      {phase === 'assignment' && points.map((p, i) => (
        <line
          key={i}
          x1={sx(p.x)} y1={sy(p.y)}
          x2={sx(centroids[assignments[i]]?.x ?? p.x)}
          y2={sy(centroids[assignments[i]]?.y ?? p.y)}
          stroke={CLUSTER_COLORS[assignments[i] % CLUSTER_COLORS.length]}
          strokeWidth={1} strokeOpacity={0.3}
        />
      ))}

      {/* Axes */}
      <line x1={sx(0)} y1={sy(0)} x2={sx(RANGE)} y2={sy(0)} stroke="currentColor" strokeOpacity={0.4} strokeWidth={1.5} />
      <line x1={sx(0)} y1={sy(0)} x2={sx(0)} y2={sy(RANGE)} stroke="currentColor" strokeOpacity={0.4} strokeWidth={1.5} />

      {ticks.map(t => (
        <g key={t}>
          <text x={sx(t)} y={sy(0) + 16} textAnchor="middle" fontSize={11} fill="currentColor" fillOpacity={0.5}>{t}</text>
          {t > 0 && <text x={sx(0) - 8} y={sy(t) + 4} textAnchor="end" fontSize={11} fill="currentColor" fillOpacity={0.5}>{t}</text>}
        </g>
      ))}

      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={12} fill="currentColor" fillOpacity={0.6}>x</text>
      <text x={10} y={H / 2} textAnchor="middle" fontSize={12} fill="currentColor" fillOpacity={0.6} transform={`rotate(-90, 10, ${H / 2})`}>y</text>

      {/* Data points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={sx(p.x)} cy={sy(p.y)}
          r={5}
          fill={CLUSTER_COLORS[assignments[i] % CLUSTER_COLORS.length]}
          stroke="white" strokeWidth={1.5}
          opacity={phase === 'init' ? 0.5 : 1}
        />
      ))}

      {/* Centroids */}
      {centroids.map((c, i) => (
        <g key={i}>
          {/* Outer ring */}
          <circle cx={sx(c.x)} cy={sy(c.y)} r={13} fill="none" stroke={CLUSTER_COLORS[i % CLUSTER_COLORS.length]} strokeWidth={2} opacity={0.4} />
          <circle
            cx={sx(c.x)} cy={sy(c.y)}
            r={8}
            fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]}
            stroke="white" strokeWidth={2}
          />
          <text x={sx(c.x)} y={sy(c.y) + 4} textAnchor="middle" fontSize={9} fill="white" fontWeight="bold">
            {i + 1}
          </text>
        </g>
      ))}

      {/* Legend */}
      {centroids.map((_, i) => (
        <g key={i} transform={`translate(${PAD + i * 60}, 12)`}>
          <circle cx={6} cy={6} r={5} fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]} stroke="white" strokeWidth={1} />
          <text x={15} y={10} fontSize={11} fill="currentColor" fillOpacity={0.8}>C{i + 1}</text>
        </g>
      ))}
    </svg>
  )
}
