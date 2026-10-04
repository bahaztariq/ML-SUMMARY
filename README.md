# 🚀 ML & Data Engineering Interactive Knowledge Hub

An interactive single-page knowledge platform and cheat sheet covering **96 concepts** across **Machine Learning**, **Deep Learning**, **Data Engineering** and **MLOps**. Every concept includes an intuition, a diagram, hyperparameters, math, pros & cons, and code. Concepts are linked to each other as a prerequisite graph.

Built with **HTML5, vanilla CSS and JavaScript (ES Modules)**. There is no build step. [Mermaid](https://mermaid.js.org/) is loaded from a CDN to draw the diagrams.

---

## 🌟 Features

### Five ways to explore

| View | What it shows |
|---|---|
| 🗂️ **Concept Cards** | Searchable, filterable grid. Filter by track, by tag (Classification, Streaming, NLP, Deployment…) and by model requirements (no scaling needed, handles missing values). |
| 🗺️ **Concept Map** | An ML taxonomy graph (AI → ML → Supervised → Classification → models…), a **prerequisite graph** for each track, and a collapsible **knowledge tree** of every concept. |
| 🧭 **Which Model?** | An interactive decision tree. Answer 2–4 questions and get recommended concepts. You can also view the whole tree as one diagram. |
| 🔁 **Pipelines** | Clickable flow diagrams: the ML lifecycle, a modern data platform, preprocessing without leakage, and the neural-network training loop. |
| 🎓 **Learning Paths** | Six ordered curricula (ML Beginner, Tabular ML, Unsupervised, Deep Learning & LLMs, Data Engineer, MLOps Engineer). Progress is saved in your browser. |

Every box in a diagram that is linked to a concept opens that concept when clicked.

### Every concept's deep-dive

- 📖 **Intuition & Overview**: an everyday analogy, the goal, when to use it and when to avoid it, and data requirements
- 🗺️ **Diagram & Links**: a diagram of how the concept works, an auto-generated **learning chain** (prerequisites → concept → what it unlocks), and *Learn first / Related / Unlocks* links
- 🎮 **Interactive**: live visualizers for selected concepts (gradient descent, bias-variance, k-means, k-NN, ROC/PR, activation functions, PCA…)
- ⚙️ **Hyperparameters**: name, type, default, impact and a tuning tip
- 📐 **Math & Loss**: the equation, explained
- ⚖️ **Pros, Cons & Gotchas**
- 💻 **Code Blueprint**: Python, SQL, YAML or a Dockerfile, ready to copy

Use **Mark as learned** to tick off concepts. Learned concepts get a ✓ on cards, in the tree, in the graphs and in the learning paths.

### Tools

- 🎯 **Confusion Matrix & Metrics Lab**: sliders for TP/FP/FN/TN with live Accuracy, Precision, Recall, Specificity and F1, plus scenario presets
- 🔄 **Side-by-side comparison**: pick any 2 concepts to compare them
- 🔍 **Search (`⌘K` / `Ctrl+K`)**: searches titles, categories, summaries, intuitions, tags and hyperparameter names

---

## 📚 Coverage

| Track | Concepts |
|---|---|
| 🌱 **Core Definitions** (16) | AI, ML, Deep Learning, Data Engineering, Classification, Regression, Clustering, Dimensionality Reduction, Supervised vs Unsupervised vs RL, Loss vs Cost, Gradient Descent, Feature Engineering, ETL vs ELT, End-to-End ML Workflow, Probability & Statistics, Linear Algebra |
| 📊 **Data Engineering** (13) | Parquet, Kafka, Spark, Lakehouse (Delta/Iceberg), Airflow, Warehouse vs Lake, OLTP vs OLAP, Dimensional Modeling (Star Schema & SCD), Batch vs Stream (Lambda/Kappa), CDC, dbt, Data Quality (Great Expectations), Partitioning & Z-Ordering |
| 🧠 **Core ML Theory** (25) | Bias-Variance, Over/Underfitting, Train-Test Split, Cross-Validation, Time-Series CV, Regularization, Hyperparameter Tuning, Feature Scaling, Encoding, Imputation (Simple/KNN), Feature Selection, Class Imbalance, Curse of Dimensionality, Ensembles (Bagging/Boosting/Stacking), Interpretability (SHAP); metrics: Confusion Matrix, Precision/Recall/F1, ROC-AUC, PR Curve, Log-Loss, RMSE, MAE, R², Silhouette |
| 🤖 **ML Models** (21) | Linear & Logistic Regression, Decision Tree, Random Forest, Gradient Boosting/AdaBoost, XGBoost, LightGBM, CatBoost, SVM, k-NN, Naive Bayes, K-Means, DBSCAN, Hierarchical Clustering, GMM, PCA, t-SNE & UMAP, Isolation Forest, ARIMA & Prophet, Recommender Systems, Q-Learning & DQN |
| ⚡ **Deep Learning** (13) | MLP, Activation Functions, Optimizers (Momentum/RMSProp/Adam), Regularization (Dropout/BatchNorm/Early Stopping), CNN, RNN/LSTM/GRU, Embeddings, Transformers, Transfer Learning, Autoencoders/VAE, GANs & Diffusion, LLMs, RAG & Vector DBs |
| 🚀 **MLOps** (8) | ML Lifecycle, Experiment Tracking & Model Registry, Model Serving, Docker, CI/CD & Continuous Training, Feature Store, A/B / Canary / Shadow Deployment, Drift Monitoring |

---

## 🏃 How to Run Locally

The project uses ES Modules, so serve it over HTTP instead of opening the file directly:

```bash
python3 -m http.server 4173
# or
npx serve .
```

Then open [http://localhost:4173](http://localhost:4173). Diagrams need an internet connection the first time, because Mermaid loads from jsDelivr.

---

## 📁 Project Structure

```
ML-SUMMARY/
├── index.html              # Page shell, view switcher, modals
├── css/
│   ├── variables.css       # Colors, track accents, radii
│   ├── base.css            # Background, typography, badges
│   ├── components.css      # Hero, search, tabs, concept cards
│   ├── modal.css           # Deep-dive modal
│   ├── widgets.css         # Metrics lab, comparison matrix
│   ├── views.css           # Map, wizard, pipelines, paths, diagrams
│   └── visualizers.css     # Interactive visualizers
├── js/
│   ├── data.js             # Base concepts + merge of js/data/* (exports concepts, conceptById, getDependents)
│   ├── data/               # Additional concepts & enrichments per track
│   │   ├── mlops-fundamentals.js
│   │   ├── data-eng.js
│   │   ├── ml-core.js
│   │   ├── ml-models.js
│   │   └── deep-learning.js
│   ├── tracks.js           # Track ids, labels, icons, colors
│   ├── paths.js            # Learning path definitions
│   ├── progress.js         # "Learned" state (localStorage)
│   ├── diagrams.js         # Lazy Mermaid loader + clickable nodes
│   ├── views.js            # Concept Map, Which Model?, Pipelines, Learning Paths
│   ├── visualizers.js      # Interactive canvas visualizers
│   ├── app.js              # State, search, filters, card grid
│   ├── modal.js            # Deep-dive modal, links tab, learning chain
│   └── widgets.js          # Metrics lab & comparison
└── README.md
```

---

## ➕ Adding a Concept

Add an object to `newConcepts` in the matching `js/data/<track>.js` file:

```javascript
{
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

To give an existing concept links or a diagram without editing it, add an entry to that file's `enrichments` object, keyed by the concept's id.

Cards, counts, search, the knowledge tree, prerequisite graphs and learning chains all update automatically. To add the concept to a learning path, list its id in `js/paths.js`. To add it to the decision tree, list its id in the `decisionTree` object in `js/views.js`.
