import { useState, useEffect, useRef } from 'react'
import { Point, computeLR, fmt } from './math'
import LRChart from './Chart'

const DEFAULT_POINTS: Point[] = [
  { x: 1, y: 2 }, { x: 2, y: 2.8 }, { x: 3, y: 3.1 },
  { x: 4, y: 4.6 }, { x: 6, y: 5.2 }, { x: 7, y: 7.1 }, { x: 8.5, y: 8.4 },
]

export default function LinearRegression() {
  const [points, setPoints] = useState<Point[]>(DEFAULT_POINTS)
  const [activeRow, setActiveRow] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const result = computeLR(points)

  // Animate steps
  useEffect(() => {
    if (!animating) return
    let step = 0
    function tick() {
      setActiveRow(step)
      step++
      if (step < points.length) {
        animRef.current = setTimeout(tick, 700)
      } else {
        animRef.current = setTimeout(() => {
          setActiveRow(null)
          setAnimating(false)
        }, 700)
      }
    }
    tick()
    return () => { if (animRef.current) clearTimeout(animRef.current) }
  }, [animating, points.length])

  function updatePoint(i: number, field: 'x' | 'y', raw: string) {
    const val = parseFloat(raw)
    if (isNaN(val) || val < 0 || val > 10) return
    setPoints(pts => pts.map((p, j) => j === i ? { ...p, [field]: val } : p))
  }

  function addPoint() {
    if (points.length >= 12) return
    setPoints(pts => [...pts, { x: 5, y: 5 }])
  }

  function removePoint(i: number) {
    if (points.length <= 2) return
    setPoints(pts => pts.filter((_, j) => j !== i))
  }

  function startAnimate() {
    setActiveRow(null)
    setAnimating(true)
  }

  function stopAnimate() {
    if (animRef.current) clearTimeout(animRef.current)
    setAnimating(false)
    setActiveRow(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Chart */}
      <div className="card flex flex-col gap-4">
        <h2 className="font-semibold text-base">Scatter Plot & Trend Line</h2>
        <LRChart
          points={points}
          result={result}
          activeRow={activeRow}
        />
        <p className="text-xs text-slate-400">Axis range: 0 – 10. Edit point values in the table on the right.</p>
      </div>

      {/* Right: Controls + Table */}
      <div className="flex flex-col gap-4">
        {/* Formula summary */}
        <div className="card font-mono text-sm space-y-1">
          <p className="label mb-2">Result</p>
          <p>x̄ = <span className="text-blue-600 dark:text-blue-400">{fmt(result.meanX)}</span>, ȳ = <span className="text-blue-600 dark:text-blue-400">{fmt(result.meanY)}</span></p>
          <p>b₁ (slope) = <span className="text-blue-600 dark:text-blue-400">{fmt(result.slope)}</span></p>
          <p>b₀ (intercept) = <span className="text-blue-600 dark:text-blue-400">{fmt(result.intercept)}</span></p>
          <p>ŷ = <span className="text-emerald-600 dark:text-emerald-400">{fmt(result.slope)}x + {fmt(result.intercept)}</span></p>
          <p className="pt-1 border-t border-slate-200 dark:border-slate-700">SSE = <span className="text-orange-500">{fmt(result.sse)}</span></p>
        </div>

        {/* Animation controls */}
        <div className="flex items-center gap-2">
          <button
            className="btn-primary"
            onClick={animating ? stopAnimate : startAnimate}
          >
            {animating ? 'Stop' : '▶ Animate steps'}
          </button>
          <button
            className="btn-secondary"
            onClick={() => setActiveRow(null)}
            disabled={activeRow === null}
          >
            Clear
          </button>
        </div>
        <p className="text-xs text-slate-400 -mt-2">Highlighted row corresponds to the active point on the chart.</p>

        {/* Calculation table */}
        <div className="card overflow-x-auto">
          <p className="label mb-3">Manual Calculation Table</p>
          <table className="calc-table">
            <thead>
              <tr>
                <th>x</th>
                <th>y</th>
                <th>(x−x̄)</th>
                <th>(y−ȳ)</th>
                <th>(x−x̄)(y−ȳ)</th>
                <th>(x−x̄)²</th>
                <th>ŷ</th>
                <th>(y−ŷ)²</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((r, i) => (
                <tr
                  key={i}
                  className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 ${activeRow === i ? 'highlighted' : ''}`}
                  onClick={() => setActiveRow(activeRow === i ? null : i)}
                >
                  <td>
                    <input
                      type="number" min={0} max={10} step={0.1}
                      value={points[i].x}
                      onChange={e => updatePoint(i, 'x', e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="w-14 bg-transparent border-b border-slate-200 dark:border-slate-600 focus:outline-none focus:border-blue-500 text-right"
                    />
                  </td>
                  <td>
                    <input
                      type="number" min={0} max={10} step={0.1}
                      value={points[i].y}
                      onChange={e => updatePoint(i, 'y', e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="w-14 bg-transparent border-b border-slate-200 dark:border-slate-600 focus:outline-none focus:border-blue-500 text-right"
                    />
                  </td>
                  <td>{fmt(r.xDiff)}</td>
                  <td>{fmt(r.yDiff)}</td>
                  <td>{fmt(r.product)}</td>
                  <td>{fmt(r.xDiffSq)}</td>
                  <td>{fmt(r.yHat)}</td>
                  <td>{fmt(r.residualSq)}</td>
                  <td>
                    <button
                      onClick={e => { e.stopPropagation(); removePoint(i) }}
                      className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 ml-1"
                      disabled={points.length <= 2}
                    >✕</button>
                  </td>
                </tr>
              ))}
              {/* Sum row */}
              <tr className="font-semibold text-slate-600 dark:text-slate-300">
                <td colSpan={4} className="text-left">Σ</td>
                <td>{fmt(result.numerator)}</td>
                <td>{fmt(result.denominator)}</td>
                <td></td>
                <td className="text-orange-500">{fmt(result.sse)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <button onClick={addPoint} className="mt-3 btn-outline text-xs" disabled={points.length >= 12}>
            + Add point
          </button>
        </div>

        {/* Formula derivation */}
        <div className="card font-mono text-xs space-y-1 text-slate-500 dark:text-slate-400">
          <p className="label mb-1">Derivation</p>
          <p>b₁ = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)² = {fmt(result.numerator)} / {fmt(result.denominator)} = {fmt(result.slope)}</p>
          <p>b₀ = ȳ − b₁·x̄ = {fmt(result.meanY)} − {fmt(result.slope)}·{fmt(result.meanX)} = {fmt(result.intercept)}</p>
          <p>SSE = Σ(y − ŷ)² = {fmt(result.sse)}</p>
        </div>
      </div>
    </div>
  )
}
