export interface LabeledPoint { x: number; y: number; label: string }

export interface Neighbor {
  index: number
  label: string
  distance: number
}

export interface KNNResult {
  neighbors: Neighbor[]
  votes: Record<string, number>
  predicted: string
}

export function knnClassify(
  query: { x: number; y: number },
  points: LabeledPoint[],
  k: number,
): KNNResult {
  const neighbors: Neighbor[] = points
    .map((p, i) => ({
      index: i,
      label: p.label,
      distance: Math.sqrt((p.x - query.x) ** 2 + (p.y - query.y) ** 2),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k)

  const votes: Record<string, number> = {}
  for (const n of neighbors) votes[n.label] = (votes[n.label] ?? 0) + 1

  const predicted = Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0]

  return { neighbors, votes, predicted }
}
