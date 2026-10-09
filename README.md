# ML Hub: an interactive machine learning knowledge hub

A learning app covering **96 concepts** across **Machine Learning**, **Deep Learning**, **Data Engineering** and **MLOps**, in **English, French and Arabic**. Every concept has an intuition, a diagram, the math, hyperparameters, pros & cons and code, and concepts are linked as a prerequisite graph. Every model and evaluation metric comes with a **guided interactive lesson**: narration on one side and a live visualization you drag, tweak and make predictions about on the other.

Built with **SvelteKit 3 (Svelte 5)** and TypeScript, prerendered to a static site.

---

## Features

- **31 interactive lessons**: step-by-step explainers for every model and metric, with tasks ("drag a centroid…"), predict-then-reveal questions and live numbers in the narration.
- **Concept pages**: one page per concept with the lesson (or playground) first, then intuition, when to use it, how it works, math, hyperparameters, trade-offs, code and where it fits in the prerequisite graph.
- **Roadmap**: one learning order for all 96 concepts — eight core stages, then three specializations — with progress per stage. Six goal-based paths are focus views of it.
- **Quiz**: 30 random questions per attempt from a bank of 300+, points by difficulty, streak bonuses, history, best score and "retry my mistakes".
- **Learn**: browse every concept by track, difficulty and interactivity.
- **Map**: the concept taxonomy, prerequisite graphs, a knowledge tree and pipeline diagrams.
- **Tools**: the "Which model?" wizard, a confusion-matrix metrics lab and side-by-side concept comparison.
- **Search**: press `⌘K` / `Ctrl+K` (or `/`) anywhere.
- **English, French and Arabic** (right-to-left), at `/`, `/fr` and `/ar`.
- Light (default) and dark themes. Progress and quiz history are saved in your browser (localStorage); there is no backend.

---

## Coverage

| Track | Concepts |
|---|---|
| 🌱 **Core Definitions** (16) | AI, ML, Deep Learning, Data Engineering, Classification, Regression, Clustering, Dimensionality Reduction, Supervised vs Unsupervised vs RL, Loss vs Cost, Gradient Descent, Feature Engineering, ETL vs ELT, End-to-End ML Workflow, Probability & Statistics, Linear Algebra |
| 📊 **Data Engineering** (13) | Parquet, Kafka, Spark, Lakehouse (Delta/Iceberg), Airflow, Warehouse vs Lake, OLTP vs OLAP, Dimensional Modeling (Star Schema & SCD), Batch vs Stream (Lambda/Kappa), CDC, dbt, Data Quality (Great Expectations), Partitioning & Z-Ordering |
| 🧠 **Core ML Theory** (25) | Bias-Variance, Over/Underfitting, Train-Test Split, Cross-Validation, Time-Series CV, Regularization, Hyperparameter Tuning, Feature Scaling, Encoding, Imputation (Simple/KNN), Feature Selection, Class Imbalance, Curse of Dimensionality, Ensembles (Bagging/Boosting/Stacking), Interpretability (SHAP); metrics: Confusion Matrix, Precision/Recall/F1, ROC-AUC, PR Curve, Log-Loss, RMSE, MAE, R², Silhouette |
| 🤖 **ML Models** (21) | Linear & Logistic Regression, Decision Tree, Random Forest, Gradient Boosting/AdaBoost, XGBoost, LightGBM, CatBoost, SVM, k-NN, Naive Bayes, K-Means, DBSCAN, Hierarchical Clustering, GMM, PCA, t-SNE & UMAP, Isolation Forest, ARIMA & Prophet, Recommender Systems, Q-Learning & DQN |
| ⚡ **Deep Learning** (13) | MLP, Activation Functions, Optimizers (Momentum/RMSProp/Adam), Regularization (Dropout/BatchNorm/Early Stopping), CNN, RNN/LSTM/GRU, Embeddings, Transformers, Transfer Learning, Autoencoders/VAE, GANs & Diffusion, LLMs, RAG & Vector DBs |
| 🚀 **MLOps** (8) | ML Lifecycle, Experiment Tracking & Model Registry, Model Serving, Docker, CI/CD & Continuous Training, Feature Store, A/B / Canary / Shadow Deployment, Drift Monitoring |

---

## Running locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # static site in build/
npm run preview      # serve the production build
npm test             # unit tests (explainer math, tools)
npm run check        # type-check
npm run validate     # content checks
```

The original vanilla-JS app is kept in `legacy/` for reference. Run `npm run legacy` and open http://localhost:4173/legacy/.

### Deploying to GitHub Pages

`.github/workflows/deploy.yml` validates, tests, builds and publishes the site on every push to `main`. In the repository settings, set **Pages → Source** to **GitHub Actions** once. The workflow builds with `BASE_PATH=/<repo-name>`, so the site is served from `https://<user>.github.io/<repo-name>/`.

---

## Project structure

```
ML-SUMMARY/
├── content/                    # All learning content, plain JS data (no UI code)
│   ├── index.js                # Concept registry: imports every concept
│   ├── tracks.js · paths.js    # Tracks and goal paths
│   ├── roadmap.js              # The unified roadmap (every concept once, in order)
│   ├── quiz/                   # Quiz question bank (en/fr/ar side by side)
│   ├── i18n/<lang>/            # French and Arabic translations of the content
│   └── <track>/<id>.js         # One file per concept
├── src/
│   ├── app.css                 # Design tokens (light/dark) and shared primitives
│   ├── routes/[[lang=lang]]/   # Pages, optionally under /fr or /ar: / · /learn · /concept/[id] · /roadmap · /quiz · /map · /tools
│   └── lib/
│       ├── content.ts          # Typed, localized access to content/ plus graph helpers
│       ├── i18n/               # Current language, t(), lhref(), UI dictionaries (en/fr/ar)
│       ├── quiz/               # Quiz engine (drawing, scoring), localStorage store, UI
│       ├── progress.svelte.ts  # Learned/recent state (localStorage)
│       ├── components/         # Nav, ⌘K palette, cards, Mermaid diagram, code block
│       ├── explainers/         # Guided lessons
│       │   ├── Player.svelte   # Generic step player (narration, tasks, quizzes)
│       │   ├── registry.ts     # Which concepts have a lesson / playground
│       │   └── kmeans/ …       # One folder per lesson
│       └── viz/                # Canvas toolkit, controls, legacy playgrounds
├── docs/TRANSLATING.md         # How translations are organised and written
├── tools/validate.js           # Content checks: ids, links, cycles, roadmap order, quiz bank
└── legacy/                     # Original app (to be removed)
```

---

## Adding a concept

Create `content/<track>/<id>.js` with a default export, then import it in `content/index.js`:

```javascript
export default {
  id: "lightgbm",                       // unique kebab-case id
  name: "LightGBM",
  track: "ml-models",                   // fundamentals | data-eng | ml-core | ml-models | deep-learning | mlops
  category: "Ensemble / Boosting",
  task: ["Classification", "Regression"],
  difficulty: "Advanced",               // Beginner | Intermediate | Advanced
  summary: "…", intuition: "…", whenToUse: "…", whenToAvoid: "…",
  requirements: { scalingRequired: false, handlesMissing: true, outlierSensitive: true },
  parameters: [{ name: "num_leaves", type: "int", default: "31", impact: "…", tuningTip: "…" }],
  math: { formula: "…", loss: "…", explanation: "…" },
  pros: ["…"], cons: ["…"],
  codeSnippet: `import lightgbm as lgb …`,

  // Graph links: these power the learning chain, prerequisite graph and "Unlocks"
  prerequisites: ["decision-tree", "gradient-boosting"],
  related: ["xgboost", "catboost"],

  // Mermaid flowchart showing how it works (quote every label)
  diagram: `flowchart LR
    A["Histogram-binned features"] --> B["Grow leaf with max loss reduction"]
    B --> C["Add tree to ensemble"]`
}
```

Run `npm run validate` to check for duplicate ids, broken prerequisite/related links, prerequisite cycles and unknown ids in learning paths.

Cards, search, learning chains and graphs update automatically. To add the concept to a learning path, list its id in `content/paths.js`.

---

## Adding an interactive lesson

Each lesson is a folder in `src/lib/explainers/`, following `kmeans/`:

| File | Role |
|---|---|
| `kmeans.ts` + `kmeans.spec.ts` | Pure algorithm, unit-tested |
| `state.ts` | Lesson state and the actions both steps and scene controls call |
| `Scene.svelte` | The live visualization (canvas + controls) bound to the state |
| `index.ts` | The steps |

A step has a `title`, a `body` (narration, a string or `(state) => string` for live values; supports `**bold**`, `` `code` ``, lists and `[label](concept:id)` links), an `enter(state)` that sets the scene up, and optionally a `task` (an interactive goal) or a `quiz` whose `reveal` changes the scene after the learner answers. Moving to step *i* replays `init()` and every `enter()` up to *i*, so each step looks the same however you reach it. Use seeded randomness (`mulberry32`) to keep it deterministic.

Register the lesson in `src/lib/explainers/registry.ts` under the concept's id.

---

## Translations

See [docs/TRANSLATING.md](docs/TRANSLATING.md). Anything without a translation falls back to English, so partial work never breaks a page.
