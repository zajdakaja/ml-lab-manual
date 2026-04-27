# ML Lab Manual

Interactive step-by-step simulator for learning core ML algorithms by hand. Each module lets you manipulate data, walk through calculations, and see results update in real time.

**Live demo:** https://zajdakaja.github.io/ml-lab-manual/

## Modules

### Linear Regression
Edit data points directly in the calculation table. Step through or animate each row to see how mean, slope (b₁), intercept (b₀), and SSE are derived. The scatter plot highlights the active point and shows the trend line with x̄/ȳ reference lines.

### Decision Tree
Click the 2D scatter plot to place a split line (vertical or horizontal). Gini impurity is computed instantly for both leaves, with an information gain breakdown and a simple tree diagram. An "Apply best split" button finds the optimal split automatically.

### K-Means
Choose k (2–5), then step through or animate the assignment→update cycle. The chart draws lines from each point to its nearest centroid during assignment and shows centroid movement during update. Stops automatically when converged.

### KNN
Click anywhere on the 2D plane to classify a test point. The k nearest neighbors are highlighted with connecting lines, a vote table shows the class breakdown, and the predicted class is displayed on the chart.

## Stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for bundling
- [Tailwind CSS](https://tailwindcss.com/) for styling
- SVG for all interactive charts (no chart library)
- [Geist](https://vercel.com/font) font

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Deploy

Pushes to `main` automatically deploy to GitHub Pages via the included Actions workflow. To trigger a manual deploy:

```bash
npm run deploy
```

## License

MIT
