import { useState } from 'react'
import LinearRegression from './algorithms/LinearRegression'
import DecisionTree from './algorithms/DecisionTree'
import KMeans from './algorithms/KMeans'
import KNN from './algorithms/KNN'

const TABS = [
  { label: 'Linear Regression', desc: 'Slope, intercept & SSE step by step' },
  { label: 'Decision Tree', desc: 'Click-to-split with Gini impurity' },
  { label: 'K-Means', desc: 'Assignment–update animation' },
  { label: 'KNN', desc: 'Neighbor voting on a 2D plane' },
]

export default function App() {
  const [tab, setTab] = useState(0)
  const [dark, setDark] = useState(false)

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">ML Lab Manual</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Interactive algorithm simulator</p>
            </div>
            <button
              onClick={() => setDark(d => !d)}
              className="btn-outline text-sm"
              aria-label="Toggle theme"
            >
              {dark ? '☀ Light' : '☾ Dark'}
            </button>
          </div>
        </header>

        {/* Tab nav */}
        <nav className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
            {TABS.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setTab(i)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === i
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Subtitle bar */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-6xl mx-auto px-4 py-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">{TABS[tab].desc}</p>
          </div>
        </div>

        {/* Main content */}
        <main className="max-w-6xl mx-auto px-4 py-6">
          {tab === 0 && <LinearRegression />}
          {tab === 1 && <DecisionTree />}
          {tab === 2 && <KMeans />}
          {tab === 3 && <KNN />}
        </main>

        <footer className="mt-12 border-t border-slate-200 dark:border-slate-700 py-4 text-center text-xs text-slate-400">
          ML Lab Manual — learn algorithms through manual calculations
        </footer>
      </div>
    </div>
  )
}
