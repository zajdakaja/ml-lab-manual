export interface Point { x: number; y: number }

export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export function assignPoints(points: Point[], centroids: Point[]): number[] {
  return points.map(p => {
    let minDist = Infinity
    let best = 0
    centroids.forEach((c, i) => {
      const d = distance(p, c)
      if (d < minDist) { minDist = d; best = i }
    })
    return best
  })
}

export function updateCentroids(points: Point[], assignments: number[], k: number): Point[] {
  return Array.from({ length: k }, (_, i) => {
    const cluster = points.filter((_, j) => assignments[j] === i)
    if (cluster.length === 0) return { x: 5, y: 5 }
    return {
      x: cluster.reduce((s, p) => s + p.x, 0) / cluster.length,
      y: cluster.reduce((s, p) => s + p.y, 0) / cluster.length,
    }
  })
}

export function computeInertia(points: Point[], assignments: number[], centroids: Point[]): number {
  return points.reduce((s, p, i) => {
    const c = centroids[assignments[i]]
    return s + distance(p, c) ** 2
  }, 0)
}

export function converged(oldCentroids: Point[], newCentroids: Point[]): boolean {
  return oldCentroids.every((c, i) => distance(c, newCentroids[i]) < 0.0001)
}

export function randomCentroids(k: number): Point[] {
  const seeds: Point[] = [
    { x: 2, y: 2 }, { x: 5, y: 5 }, { x: 8, y: 2 }, { x: 2, y: 8 }, { x: 8, y: 8 },
  ]
  return seeds.slice(0, k)
}
