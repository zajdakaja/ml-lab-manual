export interface LabeledPoint { x: number; y: number; label: string }

export interface Split {
  axis: 'x' | 'y'
  value: number
}

export interface SplitResult {
  split: Split
  leftLabels: string[]
  rightLabels: string[]
  leftGini: number
  rightGini: number
  weightedGini: number
  leftCount: number
  rightCount: number
}

export function giniImpurity(labels: string[]): number {
  if (labels.length === 0) return 0
  const counts: Record<string, number> = {}
  for (const l of labels) counts[l] = (counts[l] ?? 0) + 1
  const n = labels.length
  return 1 - Object.values(counts).reduce((s, c) => s + (c / n) ** 2, 0)
}

export function evaluateSplit(points: LabeledPoint[], split: Split): SplitResult {
  const left = points.filter(p => (split.axis === 'x' ? p.x : p.y) <= split.value)
  const right = points.filter(p => (split.axis === 'x' ? p.x : p.y) > split.value)
  const leftLabels = left.map(p => p.label)
  const rightLabels = right.map(p => p.label)
  const n = points.length
  const leftGini = giniImpurity(leftLabels)
  const rightGini = giniImpurity(rightLabels)
  const weightedGini = n === 0 ? 0 :
    (left.length / n) * leftGini + (right.length / n) * rightGini
  return {
    split,
    leftLabels,
    rightLabels,
    leftGini,
    rightGini,
    weightedGini,
    leftCount: left.length,
    rightCount: right.length,
  }
}

export function findBestSplit(points: LabeledPoint[]): SplitResult | null {
  if (points.length < 2) return null
  let best: SplitResult | null = null
  const axes: Array<'x' | 'y'> = ['x', 'y']
  for (const axis of axes) {
    const vals = [...new Set(points.map(p => axis === 'x' ? p.x : p.y))].sort((a, b) => a - b)
    for (let i = 0; i < vals.length - 1; i++) {
      const value = (vals[i] + vals[i + 1]) / 2
      const res = evaluateSplit(points, { axis, value })
      if (!best || res.weightedGini < best.weightedGini) best = res
    }
  }
  return best
}

export function classCounts(labels: string[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const l of labels) counts[l] = (counts[l] ?? 0) + 1
  return counts
}

export function majorityLabel(labels: string[]): string {
  const counts = classCounts(labels)
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '?'
}
