import { useState } from 'react'
import { LabeledPoint, knnClassify, KNNResult } from './math'
import KNNChart from './Chart'

const KNN_POINTS: LabeledPoint[] = [
  { x: 2.0, y: 7.0, label: 'A' }, { x: 2.5, y: 8.0, label: 'A' }, { x: 1.5, y: 6.5, label: 'A' },
  { x: 3.0, y: 7.5, label: 'A' }, { x: 1.0, y: 8.0, label: 'A' }, { x: 2.0, y: 9.0, label: 'A' },
  { x: 7.0, y: 7.0, label: 'B' }, { x: 8.0, y: 6.5, label: 'B' }, { x: 7.5, y: 8.0, label: 'B' },
  { x: 6.5, y: 7.5, label: 'B' }, { x: 8.5, y: 7.5, label: 'B' }, { x: 7.0, y: 9.0, label: 'B' },
  { x: 4.5, y: 2.0, label: 'C' }, { x: 5.0, y: 3.0, label: 'C' }, { x: 4.0, y: 2.5, label: 'C' },
  { x: 5.5, y: 2.5, label: 'C' }, { x: 4.5, y: 1.5, label: 'C' }, { x: 6.0, y: 2.0, label: 'C' },
]

const CLASS_COLORS: Record<string, string> = {
  A: 'text-blue-600 dark:text-blue-400',
  B: 'text-orange-500 dark:text-orange-400',
  C: 'text-emerald-600 dark:text-emerald-400',
}

export default function KNN() {
  const [k, setK] = useState(3)
  const [testPoint, setTestPoint] = useState<{ x: number; y: number } | null>(null)
  const [result, setResult] = useState<KNNResult | null>(null)

  function handleChartClick(x: number, y: number) {
    const pt = { x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) }
    setTestPoint(pt)
    setResult(knnClassify(pt, KNN_POINTS, k))
  }

  function changeK(newK: number) {
    setK(newK)
    if (testPoint) setResult(knnClassify(testPoint, KNN_POINTS, newK))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Chart */}
      <div className="card flex flex-col gap-4">
        <h2 className="font-semibold text-base">2D Classification Plane</h2>
        <KNNChart
          points={KNN_POINTS}
          testPoint={testPoint}
          neighbors={result?.neighbors ?? []}
          predicted={result?.predicted ?? null}
          onChartClick={handleChartClick}
        />
        <p className="text-xs text-slate-400">Click anywhere on the chart to classify a test point.</p>
      </div>

      {/* Right: Controls + Results */}
      <div className="flex flex-col gap-4">
        {/* k selector */}
        <div className="card">
          <p className="label mb-3">k (number of neighbors)</p>
          <div className="flex gap-2 flex-wrap">
            {[1, 3, 5, 7, 9].map(v => (
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

        {/* Test point info */}
        {testPoint ? (
          <>
            <div className="card space-y-1 font-mono text-sm">
              <p className="label mb-1">Test Point</p>
              <p>x = {testPoint.x}, y = {testPoint.y}</p>
              {result && (
                <p className="mt-1">
                  Predicted class:{' '}
                  <span className={`text-lg font-bold ${CLASS_COLORS[result.predicted] ?? ''}`}>
                    {result.predicted}
                  </span>
                </p>
              )}
            </div>

            {result && (
              <>
                {/* Vote count */}
                <div className="card">
                  <p className="label mb-3">Votes (k = {k})</p>
                  <div className="flex gap-3">
                    {Object.entries(result.votes).sort((a, b) => b[1] - a[1]).map(([cls, count]) => (
                      <div key={cls} className="flex-1 text-center">
                        <div className={`text-2xl font-bold ${CLASS_COLORS[cls] ?? ''}`}>{count}</div>
                        <div className={`text-sm font-medium ${CLASS_COLORS[cls] ?? ''}`}>{cls}</div>
                        <div className="text-xs text-slate-400">{((count / k) * 100).toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Neighbor table */}
                <div className="card overflow-x-auto">
                  <p className="label mb-3">k Nearest Neighbors</p>
                  <table className="calc-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Label</th>
                        <th>x</th>
                        <th>y</th>
                        <th>Distance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.neighbors.map((n, rank) => {
                        const p = KNN_POINTS[n.index]
                        return (
                          <tr key={n.index} className={rank === 0 ? 'highlighted' : ''}>
                            <td className="text-left text-slate-400">{rank + 1}</td>
                            <td className={`text-center font-bold ${CLASS_COLORS[n.label] ?? ''}`}>{n.label}</td>
                            <td>{p.x.toFixed(1)}</td>
                            <td>{p.y.toFixed(1)}</td>
                            <td>{n.distance.toFixed(4)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="card text-sm text-slate-400 text-center py-10">
            Click the chart to place a test point
          </div>
        )}

        {/* Algorithm */}
        <div className="card text-sm space-y-1 text-slate-500 dark:text-slate-400 font-mono">
          <p className="label mb-1">Algorithm</p>
          <p>1. Compute d(query, xᵢ) = √((x−xᵢ)² + (y−yᵢ)²) for all i</p>
          <p>2. Sort by distance, take k smallest</p>
          <p>3. Majority vote among k neighbors → predicted class</p>
        </div>
      </div>
    </div>
  )
}
