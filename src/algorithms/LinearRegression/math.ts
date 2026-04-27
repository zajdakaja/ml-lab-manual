export interface Point { x: number; y: number }

export interface LRRow {
  x: number
  y: number
  xDiff: number
  yDiff: number
  product: number
  xDiffSq: number
  yHat: number
  residual: number
  residualSq: number
}

export interface LRResult {
  meanX: number
  meanY: number
  numerator: number
  denominator: number
  slope: number
  intercept: number
  rows: LRRow[]
  sse: number
}

export function computeLR(points: Point[]): LRResult {
  const n = points.length
  const meanX = points.reduce((s, p) => s + p.x, 0) / n
  const meanY = points.reduce((s, p) => s + p.y, 0) / n

  const numerator = points.reduce((s, p) => s + (p.x - meanX) * (p.y - meanY), 0)
  const denominator = points.reduce((s, p) => s + (p.x - meanX) ** 2, 0)

  const slope = denominator === 0 ? 0 : numerator / denominator
  const intercept = meanY - slope * meanX

  const rows: LRRow[] = points.map(p => {
    const xDiff = p.x - meanX
    const yDiff = p.y - meanY
    const yHat = slope * p.x + intercept
    const residual = p.y - yHat
    return {
      x: p.x,
      y: p.y,
      xDiff,
      yDiff,
      product: xDiff * yDiff,
      xDiffSq: xDiff ** 2,
      yHat,
      residual,
      residualSq: residual ** 2,
    }
  })

  const sse = rows.reduce((s, r) => s + r.residualSq, 0)

  return { meanX, meanY, numerator, denominator, slope, intercept, rows, sse }
}

export const fmt = (n: number, d = 3) => n.toFixed(d)
