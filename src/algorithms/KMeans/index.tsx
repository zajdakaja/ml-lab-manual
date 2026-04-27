import { useState, useEffect, useRef, useCallback } from 'react'
import { Point, assignPoints, updateCentroids, computeInertia, converged, randomCentroids } from './math'
import KMeansChart from './Chart'

const DEFAULT_POINTS: Point[] = [
  { x: 1.5, y: 1.2 }, { x: 2.0, y: 2.5 }, { x: 1.8, y: 1.8 }, { x: 2.5, y: 2.0 },
  { x: 5.0, y: 5.5 }, { x: 4.5, y: 4.8 }, { x: 5.5, y: 5.0 }, { x: 4.8, y: 5.2 },
  { x: 8.0, y: 1.5 }, { x: 7.5, y: 2.0 }, { x: 8.5, y: 2.5 }, { x: 7.8, y: 1.8 },
]

type Phase = 'init' | 'assignment' | 'update'

export default function KMeans() {
  const [k, setK] = useState(3)
  const [centroids, setCentroids] = useState<Point[]>(() => randomCentroids(3))
  const [assignments, setAssignments] = useState<number[]>(() => new Array(DEFAULT_POINTS.length).fill(0))
  const [phase, setPhase] = useState<Phase>('init')
  const [iteration, setIteration] = useState(0)
  const [done, setDone] = useState(false)
  const [animating, setAnimating] = useState(false)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const inertia = computeInertia(DEFAULT_POINTS, assignments, centroids)

  function reset(newK = k) {
    if (animRef.current) clearTimeout(animRef.current)
    setAnimating(false)
    setCentroids(randomCentroids(newK))
    setAssignments(new Array(DEFAULT_POINTS.length).fill(0))
    setPhase('init')
    setIteration(0)
    setDone(false)
  }

  const step = useCallback(() => {
    if (done) return

    if (phase === 'init' || phase === 'update') {
      // Assignment step
      const newAssignments = assignPoints(DEFAULT_POINTS, centroids)
      setAssignments(newAssignments)
      setPhase('assignment')
    } else {
      // Update step
      const newCentroids = updateCentroids(DEFAULT_POINTS, assignments, k)
      const isConverged = converged(centroids, newCentroids)
      setCentroids(newCentroids)
      setPhase('update')
      setIteration(i => i + 1)
      if (isConverged) setDone(true)
    }
  }, [phase, centroids, assignments, k, done])

  useEffect(() => {
    if (!animating || done) { setAnimating(false); return }
    animRef.current = setTimeout(() => { step() }, 800)
    return () => { if (animRef.current) clearTimeout(animRef.current) }
  }, [animating, step, done])

  function changeK(newK: number) {
    setK(newK)
    reset(newK)
  }

  const phaseLabel: Record<Phase, string> = {
    init: 'Ready — press Step to begin',
    assignment: 'Assignment: each point assigned to nearest centroid',
    update: 'Update: centroids moved to cluster means',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Chart */}
      <div className="card flex flex-col gap-4">
        <h2 className="font-semibold text-base">2D Scatter Plot</h2>
        <KMeansChart
          points={DEFAULT_POINTS}
          centroids={centroids}
          assignments={assignments}
          phase={phase}
        />
        <p className="text-xs text-slate-400">Numbered diamonds = centroids. Points colored by cluster assignment.</p>
      </div>

      {/* Right: Controls */}
      <div className="flex flex-col gap-4">
        {/* k selector */}
        <div className="card">
          <p className="label mb-3">Number of Clusters (k)</p>
          <div className="flex gap-2">
            {[2, 3, 4, 5].map(v => (
              <button
                key={v}
                className={v === k ? 'btn-primary' : 'btn-secondary'}
                onClick={() => changeK(v)}
              >
                k = {v}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="card">
          <p className="label mb-1">Phase</p>
          <p className={`text-sm font-medium ${done ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
            {done ? '✓ Converged' : phaseLabel[phase]}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-sm">
            <div>Iteration: <span className="font-semibold">{iteration}</span></div>
            <div>Inertia: <span className="font-semibold text-orange-500">{inertia.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
          <button className="btn-primary" onClick={step} disabled={done || animating}>
            Step
          </button>
          <button
            className="btn-primary"
            onClick={() => setAnimating(a => !a)}
            disabled={done}
          >
            {animating ? '⏸ Pause' : '▶ Animate'}
          </button>
          <button className="btn-secondary" onClick={() => reset()}>
            ↺ Reset
          </button>
        </div>

        {/* Centroid table */}
        <div className="card overflow-x-auto">
          <p className="label mb-3">Centroid Positions</p>
          <table className="calc-table">
            <thead>
              <tr>
                <th className="text-left">Centroid</th>
                <th>x</th>
                <th>y</th>
                <th>Points</th>
                <th>Inertia</th>
              </tr>
            </thead>
            <tbody>
              {centroids.map((c, i) => {
                const clusterPoints = DEFAULT_POINTS.filter((_, j) => assignments[j] === i)
                const clusterInertia = clusterPoints.reduce((s, p) => {
                  return s + (p.x - c.x) ** 2 + (p.y - c.y) ** 2
                }, 0)
                return (
                  <tr key={i}>
                    <td className="text-left">C{i + 1}</td>
                    <td>{c.x.toFixed(3)}</td>
                    <td>{c.y.toFixed(3)}</td>
                    <td>{clusterPoints.length}</td>
                    <td>{clusterInertia.toFixed(3)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Algorithm steps explanation */}
        <div className="card text-sm space-y-2 text-slate-600 dark:text-slate-300">
          <p className="label mb-1">Algorithm</p>
          <div className={`flex gap-2 ${phase === 'assignment' && !done ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}>
            <span>1.</span>
            <span>Assignment: cᵢ = argminⱼ ‖xᵢ − μⱼ‖²</span>
          </div>
          <div className={`flex gap-2 ${phase === 'update' && !done ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}>
            <span>2.</span>
            <span>Update: μⱼ = mean of all xᵢ where cᵢ = j</span>
          </div>
          <div className="flex gap-2 text-slate-400">
            <span>3.</span>
            <span>Repeat until centroids don't move</span>
          </div>
        </div>
      </div>
    </div>
  )
}
