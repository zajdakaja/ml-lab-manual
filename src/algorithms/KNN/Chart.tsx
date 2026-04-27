import { LabeledPoint, Neighbor } from './math'

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
  testPoint: { x: number; y: number } | null
  neighbors: Neighbor[]
  predicted: string | null
  onChartClick: (x: number, y: number) => void
}

export default function KNNChart({ points, testPoint, neighbors, predicted, onChartClick }: Props) {
  const neighborIndices = new Set(neighbors.map(n => n.index))

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const svgX = ((e.clientX - rect.left) / rect.width) * W
    const svgY = ((e.clientY - rect.top) / rect.height) * H
    const dataX = Math.max(0, Math.min(RANGE, ((svgX - PAD) / (W - 2 * PAD)) * RANGE))
    const dataY = Math.max(0, Math.min(RANGE, ((H - PAD - svgY) / (H - 2 * PAD)) * RANGE))
    onChartClick(dataX, dataY)
  }

  // Radius of circle enclosing kth neighbor
  const kRadius = testPoint && neighbors.length > 0
    ? neighbors[neighbors.length - 1].distance
    : 0

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg cursor-crosshair" onClick={handleClick}>
      {/* KNN radius circle */}
      {testPoint && kRadius > 0 && (
        <circle
          cx={sx(testPoint.x)} cy={sy(testPoint.y)}
          r={(kRadius / RANGE) * (W - 2 * PAD)}
          fill="none" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="5,3" opacity={0.5}
        />
      )}

      {/* Lines to neighbors */}
      {testPoint && neighbors.map(n => (
        <line
          key={n.index}
          x1={sx(testPoint.x)} y1={sy(testPoint.y)}
          x2={sx(points[n.index].x)} y2={sy(points[n.index].y)}
          stroke={CLASS_COLORS[n.label] ?? '#94a3b8'}
          strokeWidth={1.5} opacity={0.5}
        />
      ))}

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

      {ticks.map(t => (
        <g key={t}>
          <text x={sx(t)} y={sy(0) + 16} textAnchor="middle" fontSize={11} fill="currentColor" fillOpacity={0.5}>{t}</text>
          {t > 0 && <text x={sx(0) - 8} y={sy(t) + 4} textAnchor="end" fontSize={11} fill="currentColor" fillOpacity={0.5}>{t}</text>}
        </g>
      ))}

      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={12} fill="currentColor" fillOpacity={0.6}>x</text>
      <text x={10} y={H / 2} textAnchor="middle" fontSize={12} fill="currentColor" fillOpacity={0.6} transform={`rotate(-90, 10, ${H / 2})`}>y</text>

      {/* Training points */}
      {points.map((p, i) => {
        const isNeighbor = neighborIndices.has(i)
        return (
          <g key={i}>
            {isNeighbor && (
              <circle cx={sx(p.x)} cy={sy(p.y)} r={10} fill={CLASS_COLORS[p.label] ?? '#94a3b8'} opacity={0.2} />
            )}
            <circle
              cx={sx(p.x)} cy={sy(p.y)}
              r={isNeighbor ? 7 : 5}
              fill={CLASS_COLORS[p.label] ?? '#94a3b8'}
              stroke="white" strokeWidth={isNeighbor ? 2 : 1.5}
              opacity={testPoint && !isNeighbor ? 0.4 : 1}
            />
            <text x={sx(p.x)} y={sy(p.y) + 3} textAnchor="middle" fontSize={8} fill="white" fontWeight="bold">
              {p.label}
            </text>
          </g>
        )
      })}

      {/* Test point */}
      {testPoint && (
        <g>
          <circle cx={sx(testPoint.x)} cy={sy(testPoint.y)} r={9} fill="white" stroke="#6366f1" strokeWidth={2.5} />
          <text x={sx(testPoint.x)} y={sy(testPoint.y) + 4} textAnchor="middle" fontSize={10} fill="#6366f1" fontWeight="bold">?</text>
          {predicted && (
            <text x={sx(testPoint.x) + 12} y={sy(testPoint.y) - 10} fontSize={12} fill={CLASS_COLORS[predicted] ?? '#6366f1'} fontWeight="bold">
              → {predicted}
            </text>
          )}
        </g>
      )}

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
