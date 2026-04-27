import { useState } from 'react'
import { LabeledPoint, Split, evaluateSplit, findBestSplit, classCounts, majorityLabel, giniImpurity } from './math'
import DTChart from './Chart'

const DEFAULT_POINTS: LabeledPoint[] = [
  { x: 1.0, y: 8.0, label: 'A' }, { x: 2.0, y: 7.0, label: 'A' }, { x: 1.5, y: 9.0, label: 'A' },
  { x: 2.5, y: 8.5, label: 'A' }, { x: 3.0, y: 7.5, label: 'A' },
  { x: 6.0, y: 2.0, label: 'B' }, { x: 7.0, y: 3.0, label: 'B' }, { x: 8.0, y: 2.5, label: 'B' },
  { x: 7.5, y: 1.5, label: 'B' }, { x: 6.5, y: 3.5, label: 'B' },
  { x: 4.0, y: 5.0, label: 'A' }, { x: 5.0, y: 4.0, label: 'B' }, { x: 3.5, y: 4.5, label: 'A' },
]

export default function DecisionTree() {
  const [points] = useState<LabeledPoint[]>(DEFAULT_POINTS)
  const [split, setSplit] = useState<Split | null>(null)
  const [splitAxis, setSplitAxis] = useState<'x' | 'y'>('x')

  const allLabels = points.map(p => p.label)
  const rootGini = giniImpurity(allLabels)
  const rootCounts = classCounts(allLabels)

  const splitResult = split ? evaluateSplit(points, split) : null
  const bestSplit = findBestSplit(points)

  function handleChartClick(x: number, y: number) {
    const value = splitAxis === 'x' ? parseFloat(x.toFixed(1)) : parseFloat(y.toFixed(1))
    setSplit({ axis: splitAxis, value })
  }

  function applyBest() {
    if (bestSplit) {
      setSplit(bestSplit.split)
      setSplitAxis(bestSplit.split.axis)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Chart */}
      <div className="card flex flex-col gap-4">
        <h2 className="font-semibold text-base">Decision Boundary</h2>
        <DTChart
          points={points}
          split={split}
          splitAxis={splitAxis}
          onChartClick={handleChartClick}
        />
        <div className="flex items-center gap-2 flex-wrap">
          <span className="label">Split axis:</span>
          <button
            className={splitAxis === 'x' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setSplitAxis('x')}
          >
            x (vertical line)
          </button>
          <button
            className={splitAxis === 'y' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setSplitAxis('y')}
          >
            y (horizontal line)
          </button>
          <button className="btn-outline" onClick={() => setSplit(null)}>
            Clear
          </button>
        </div>
        <p className="text-xs text-slate-400">Click the chart to place a split line. Toggle axis above.</p>
      </div>

      {/* Right: Gini info */}
      <div className="flex flex-col gap-4">
        {/* Root node */}
        <div className="card space-y-2">
          <p className="label">Root Node</p>
          <div className="font-mono text-sm space-y-1">
            <p>Samples: <span className="font-semibold">{points.length}</span></p>
            <p>
              Distribution:{' '}
              {Object.entries(rootCounts).map(([cls, n]) => (
                <span key={cls} className="mr-2">{cls}: {n}</span>
              ))}
            </p>
            <p>Gini impurity: <span className="text-orange-500 font-semibold">{rootGini.toFixed(4)}</span></p>
            <p>Majority class: <span className="text-blue-600 dark:text-blue-400 font-semibold">{majorityLabel(allLabels)}</span></p>
          </div>
        </div>

        {/* Best split hint */}
        {bestSplit && (
          <div className="card space-y-2">
            <p className="label">Best Possible Split</p>
            <p className="font-mono text-sm">
              {bestSplit.split.axis} ≤ {bestSplit.split.value.toFixed(2)}{' '}
              → weighted Gini = <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{bestSplit.weightedGini.toFixed(4)}</span>
            </p>
            <button className="btn-primary text-sm" onClick={applyBest}>
              Apply best split
            </button>
          </div>
        )}

        {/* Current split result */}
        {splitResult ? (
          <div className="card space-y-3">
            <p className="label">Current Split: {splitResult.split.axis} ≤ {splitResult.split.value.toFixed(2)}</p>

            <div className="grid grid-cols-2 gap-3">
              {/* Left leaf */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm font-mono space-y-1">
                <p className="font-semibold text-blue-700 dark:text-blue-300">Left leaf</p>
                <p>{splitResult.split.axis} ≤ {splitResult.split.value.toFixed(2)}</p>
                <p>n = {splitResult.leftCount}</p>
                <p>
                  {Object.entries(classCounts(splitResult.leftLabels)).map(([cls, n]) => (
                    <span key={cls} className="mr-2">{cls}: {n}</span>
                  ))}
                </p>
                <p>Gini: <span className="text-orange-500 font-semibold">{splitResult.leftGini.toFixed(4)}</span></p>
                <p>→ <span className="font-semibold">{majorityLabel(splitResult.leftLabels.length ? splitResult.leftLabels : ['?'])}</span></p>
              </div>

              {/* Right leaf */}
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-sm font-mono space-y-1">
                <p className="font-semibold text-orange-700 dark:text-orange-300">Right leaf</p>
                <p>{splitResult.split.axis} &gt; {splitResult.split.value.toFixed(2)}</p>
                <p>n = {splitResult.rightCount}</p>
                <p>
                  {Object.entries(classCounts(splitResult.rightLabels)).map(([cls, n]) => (
                    <span key={cls} className="mr-2">{cls}: {n}</span>
                  ))}
                </p>
                <p>Gini: <span className="text-orange-500 font-semibold">{splitResult.rightGini.toFixed(4)}</span></p>
                <p>→ <span className="font-semibold">{majorityLabel(splitResult.rightLabels.length ? splitResult.rightLabels : ['?'])}</span></p>
              </div>
            </div>

            <div className="font-mono text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
              <p>Weighted Gini = ({splitResult.leftCount}/{points.length})·{splitResult.leftGini.toFixed(4)} + ({splitResult.rightCount}/{points.length})·{splitResult.rightGini.toFixed(4)}</p>
              <p>= <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{splitResult.weightedGini.toFixed(4)}</span>
                {bestSplit && splitResult.weightedGini <= bestSplit.weightedGini + 0.001 && (
                  <span className="ml-2 text-emerald-600 dark:text-emerald-400 text-xs">✓ optimal</span>
                )}
              </p>
              <p className="mt-1 text-slate-500">Information gain = {(rootGini - splitResult.weightedGini).toFixed(4)}</p>
            </div>
          </div>
        ) : (
          <div className="card text-sm text-slate-400 text-center py-8">
            Click the chart to place a split and see Gini calculations
          </div>
        )}

        {/* Tree diagram */}
        {splitResult && (
          <div className="card">
            <p className="label mb-3">Tree Structure</p>
            <div className="flex flex-col items-center gap-1 font-mono text-xs">
              <div className="border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-slate-50 dark:bg-slate-700 text-center">
                <div className="font-semibold">Root</div>
                <div className="text-slate-500">{splitResult.split.axis} ≤ {splitResult.split.value.toFixed(2)}?</div>
                <div className="text-slate-400">Gini = {rootGini.toFixed(3)}, n = {points.length}</div>
              </div>
              <div className="flex gap-16 text-slate-400">
                <span>Yes ↙</span>
                <span>↘ No</span>
              </div>
              <div className="flex gap-4">
                <div className="border border-blue-300 dark:border-blue-700 rounded px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-center">
                  <div className="font-semibold text-blue-700 dark:text-blue-300">{majorityLabel(splitResult.leftLabels.length ? splitResult.leftLabels : ['?'])}</div>
                  <div className="text-slate-500">Gini={splitResult.leftGini.toFixed(3)}</div>
                  <div className="text-slate-400">n={splitResult.leftCount}</div>
                </div>
                <div className="border border-orange-300 dark:border-orange-700 rounded px-3 py-2 bg-orange-50 dark:bg-orange-900/20 text-center">
                  <div className="font-semibold text-orange-700 dark:text-orange-300">{majorityLabel(splitResult.rightLabels.length ? splitResult.rightLabels : ['?'])}</div>
                  <div className="text-slate-500">Gini={splitResult.rightGini.toFixed(3)}</div>
                  <div className="text-slate-400">n={splitResult.rightCount}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
