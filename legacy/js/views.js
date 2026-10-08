/**
 * Alternate views beside the card grid:
 * 1. Concept Map   — ML taxonomy graph, prerequisite graph per track, full knowledge tree
 * 2. Which Model?  — interactive decision tree that recommends concepts
 * 3. Pipelines     — clickable end-to-end flow diagrams
 * 4. Learning Paths — ordered curricula with progress tracking
 */

import { concepts, conceptById } from '../../content/index.js';
import { tracks, trackById } from '../../content/tracks.js';
import { learningPaths } from '../../content/paths.js';
import { renderDiagram, mermaidLabel } from './diagrams.js';
import { openConceptModal } from './modal.js';
import { isLearned, toggleLearned, onProgressChange } from './progress.js';

const rendered = new Set();
let activeView = 'cards';

export function initViews() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  onProgressChange(() => {
    // Re-render progress-aware views the next time (or now, if visible).
    rendered.delete('paths');
    rendered.delete('map');
    if (activeView === 'paths' || activeView === 'map') renderView(activeView);
  });
}

function switchView(view) {
  activeView = view;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('.view-pane').forEach(p => { p.hidden = p.id !== `view-${view}`; });
  document.getElementById('cardsControls').hidden = view !== 'cards';
  document.getElementById('comparisonDock')?.classList.toggle('dock-hidden', view !== 'cards');
  renderView(view);
}

function renderView(view) {
  if (rendered.has(view)) return;
  rendered.add(view);
  if (view === 'map') renderMapView();
  if (view === 'wizard') renderWizardView();
  if (view === 'pipelines') renderPipelinesView();
  if (view === 'paths') renderPathsView();
}

const has = id => conceptById.has(id);
const nodeKey = id => 'c_' + id.replace(/[^a-zA-Z0-9]/g, '_');

/* =========================================================================
   1. Concept Map
   ========================================================================= */

// Hand-curated taxonomy. Leaves are concept ids; inner nodes may also link to a concept.
const taxonomy = {
  label: 'Artificial Intelligence', concept: 'what-is-ai', children: [
    { label: 'Machine Learning', concept: 'what-is-ml', children: [
      { label: 'Supervised', concept: 'supervised-vs-unsupervised', children: [
        { label: 'Classification', concept: 'what-is-classification', children: ['logistic-regression', 'naive-bayes', 'svm', 'knn', 'decision-tree'] },
        { label: 'Regression', concept: 'what-is-regression', children: ['linear-regression', 'svm', 'knn', 'decision-tree'] },
        { label: 'Tree Ensembles', concept: 'ensemble-methods', children: ['random-forest', 'gradient-boosting', 'xgboost', 'lightgbm', 'catboost'] },
        { label: 'Forecasting', children: ['time-series-forecasting'] }
      ] },
      { label: 'Unsupervised', children: [
        { label: 'Clustering', concept: 'what-is-clustering', children: ['kmeans', 'dbscan', 'hierarchical-clustering', 'gmm'] },
        { label: 'Dimensionality Reduction', concept: 'what-is-dimensionality-reduction', children: ['pca', 'tsne-umap'] },
        { label: 'Anomaly Detection', children: ['isolation-forest'] },
        { label: 'Recommendation', children: ['recommender-systems'] }
      ] },
      { label: 'Reinforcement', children: ['q-learning'] },
      { label: 'Deep Learning', concept: 'what-is-deep-learning', children: [
        'mlp-neural-network', 'cnn', 'rnn-lstm',
        { label: 'Transformers', concept: 'transformer-architecture', children: ['llms', 'rag'] },
        'autoencoders', 'generative-models'
      ] }
    ] }
  ]
};

function taxonomyToMermaid(root) {
  const lines = ['flowchart LR'];
  const links = {};
  let counter = 0;

  const declare = (node) => {
    if (typeof node === 'string') {
      if (!has(node)) return null;
      const key = nodeKey(node);
      if (!links[key]) {
        lines.push(`  ${key}["${mermaidLabel(conceptById.get(node).name)}"]`);
        links[key] = node;
      }
      return key;
    }
    const key = `g${counter++}`;
    lines.push(`  ${key}(["${mermaidLabel(node.label)}"])`);
    if (node.concept && has(node.concept)) links[key] = node.concept;
    for (const child of node.children || []) {
      const childKey = declare(child);
      if (childKey) lines.push(`  ${key} --> ${childKey}`);
    }
    return key;
  };

  declare(root);
  return { source: lines.join('\n'), links };
}

function prerequisiteGraph(trackId) {
  const inTrack = concepts.filter(c => c.track === trackId);
  const ids = new Set(inTrack.map(c => c.id));
  const lines = ['flowchart LR'];
  const links = {};
  const declare = (c, external) => {
    const key = nodeKey(c.id);
    if (links[key]) return key;
    links[key] = c.id;
    const label = mermaidLabel(c.name) + (isLearned(c.id) ? ' ✓' : '');
    lines.push(external ? `  ${key}(["${label}"])` : `  ${key}["${label}"]`);
    return key;
  };

  // Concepts from other tracks appear as rounded "external" nodes.
  for (const c of inTrack) declare(c, false);
  for (const c of inTrack) {
    for (const pre of c.prerequisites) {
      if (!has(pre)) continue;
      const preKey = declare(conceptById.get(pre), !ids.has(pre));
      lines.push(`  ${preKey} --> ${nodeKey(c.id)}`);
    }
  }
  return { source: lines.join('\n'), links };
}

function renderMapView() {
  const pane = document.getElementById('view-map');
  pane.innerHTML = `
    <section class="view-section">
      <div class="view-section-head">
        <h2>🗺️ The Big Picture</h2>
        <p>How the major families of machine learning nest inside each other. Click any box to open that concept.</p>
      </div>
      <div class="diagram-panel" id="taxonomyDiagram"></div>
    </section>

    <section class="view-section">
      <div class="view-section-head">
        <h2>🕸️ Prerequisite Graph</h2>
        <p>Arrows point from what you should learn first to what it unlocks. Rounded boxes come from other tracks; ✓ marks concepts you've learned.</p>
      </div>
      <div class="chip-row" id="graphTrackChips">
        ${tracks.map(t => `<button class="tag-pill" data-track="${t.id}">${t.icon} ${t.label}</button>`).join('')}
      </div>
      <div class="diagram-panel" id="prereqDiagram"></div>
    </section>

    <section class="view-section">
      <div class="view-section-head">
        <h2>🌳 Knowledge Tree</h2>
        <p>Every concept, organised by track and category.</p>
      </div>
      <div class="knowledge-tree">${renderKnowledgeTree()}</div>
    </section>
  `;

  const taxo = taxonomyToMermaid(taxonomy);
  renderDiagram(pane.querySelector('#taxonomyDiagram'), taxo.source, { links: taxo.links, onNodeClick: openConceptModal });

  const chips = pane.querySelectorAll('#graphTrackChips .tag-pill');
  const showGraph = (trackId) => {
    chips.forEach(c => c.classList.toggle('active', c.dataset.track === trackId));
    const g = prerequisiteGraph(trackId);
    renderDiagram(pane.querySelector('#prereqDiagram'), g.source, { links: g.links, onNodeClick: openConceptModal });
  };
  chips.forEach(chip => chip.addEventListener('click', () => showGraph(chip.dataset.track)));
  showGraph('ml-core');

  pane.querySelectorAll('.tree-leaf').forEach(leaf => {
    leaf.addEventListener('click', () => openConceptModal(leaf.dataset.id));
  });
}

function renderKnowledgeTree() {
  return `<ul class="tree-root">${tracks.map(track => {
    const items = concepts.filter(c => c.track === track.id);
    const categories = [...new Set(items.map(c => c.category))];
    return `
      <li>
        <details open>
          <summary class="tree-track" style="--track-color: ${track.color}">${track.icon} ${track.label} <span class="tree-count">${items.length}</span></summary>
          <ul>${categories.map(cat => {
            const inCat = items.filter(c => c.category === cat);
            return `
              <li>
                <details open>
                  <summary class="tree-category">${cat} <span class="tree-count">${inCat.length}</span></summary>
                  <ul>${inCat.map(c => `
                    <li><button class="tree-leaf ${isLearned(c.id) ? 'is-learned' : ''}" data-id="${c.id}">
                      <span>${c.name}</span>
                      <span class="card-difficulty difficulty-${c.difficulty.toLowerCase()}">${c.difficulty}</span>
                    </button></li>`).join('')}
                  </ul>
                </details>
              </li>`;
          }).join('')}</ul>
        </details>
      </li>`;
  }).join('')}</ul>`;
}

/* =========================================================================
   2. "Which model should I use?" decision tree
   ========================================================================= */

// Each node is either a question with options, or a result listing concept ids.
const decisionTree = {
  start: { q: 'Do you have labeled data (a known target column to predict)?', options: [
    ['Yes, every row has a label', 'supervised'],
    ['No labels, I want to discover structure', 'unsupervised'],
    ['An agent learns from rewards over time', 'rl']
  ] },
  supervised: { q: 'What are you predicting?', options: [
    ['A category (spam / not spam, which species…)', 'clsData'],
    ['A number (price, temperature…)', 'regGoal'],
    ['Future values of a series over time', 'timeseries']
  ] },
  clsData: { q: 'What does your input data look like?', options: [
    ['Tables / spreadsheets', 'clsGoal'],
    ['Free text', 'text'],
    ['Images', 'images']
  ] },
  clsGoal: { q: 'What matters most?', options: [
    ['Interpretability: I must explain decisions', 'clsExplain'],
    ['Best accuracy on a large table', 'boosting'],
    ['A fast baseline on a small dataset', 'clsBaseline'],
    ['Rare positive class (fraud, disease)', 'imbalanced']
  ] },
  regGoal: { q: 'What matters most?', options: [
    ['Interpretability & coefficients', 'regExplain'],
    ['Best accuracy on a large table', 'boosting'],
    ['A fast baseline on a small dataset', 'regBaseline']
  ] },
  unsupervised: { q: 'What is your goal?', options: [
    ['Group similar rows together', 'clusterK'],
    ['Reduce or visualise many features', 'dimred'],
    ['Find rare / abnormal rows', 'anomaly'],
    ['Recommend items to users', 'recsys']
  ] },
  clusterK: { q: 'Do you roughly know how many clusters there are?', options: [
    ['Yes, and clusters are blob-shaped', 'clusterKnown'],
    ['No, or clusters have odd shapes and noise', 'clusterUnknown']
  ] },
  dimred: { q: 'Why reduce dimensions?', options: [
    ['As preprocessing for another model', 'dimredPre'],
    ['To plot the data in 2D / 3D', 'dimredViz']
  ] },
  clsExplain: { result: ['logistic-regression', 'decision-tree', 'model-interpretability'], note: 'Start simple; coefficients and tree splits can be read directly.' },
  clsBaseline: { result: ['naive-bayes', 'knn', 'logistic-regression', 'svm'], note: 'Quick to train; good yardsticks before trying ensembles.' },
  regExplain: { result: ['linear-regression', 'regularization-l1-l2', 'decision-tree'], note: 'Regularized linear models stay readable and robust.' },
  regBaseline: { result: ['linear-regression', 'knn', 'svm'], note: 'Establish a baseline RMSE before anything fancier.' },
  boosting: { result: ['xgboost', 'lightgbm', 'catboost', 'random-forest'], note: 'Gradient-boosted trees dominate tabular data. CatBoost shines with many categorical columns; LightGBM with millions of rows.' },
  imbalanced: { result: ['class-imbalance', 'precision-recall-f1', 'pr-curve', 'xgboost'], note: 'Fix the evaluation first (PR-AUC, recall), then the model.' },
  text: { result: ['transformer-architecture', 'transfer-learning', 'embeddings', 'naive-bayes'], note: 'Fine-tune a pretrained transformer; Naive Bayes is a strong cheap baseline.' },
  images: { result: ['cnn', 'transfer-learning'], note: 'Start from a pretrained CNN and fine-tune it.' },
  timeseries: { result: ['time-series-forecasting', 'time-series-cv', 'rnn-lstm', 'lightgbm'], note: 'Never shuffle time: validate with forward-chaining splits.' },
  clusterKnown: { result: ['kmeans', 'gmm', 'silhouette-score'], note: 'Use the silhouette score to confirm k.' },
  clusterUnknown: { result: ['dbscan', 'hierarchical-clustering'], note: 'DBSCAN finds arbitrary shapes and flags noise; a dendrogram helps choose k.' },
  dimredPre: { result: ['pca', 'feature-selection'], note: 'PCA for correlated features; feature selection when you need original columns.' },
  dimredViz: { result: ['tsne-umap', 'pca'], note: 'UMAP / t-SNE for visual clusters; distances between clusters are not meaningful.' },
  anomaly: { result: ['isolation-forest', 'dbscan', 'autoencoders'], note: 'Isolation Forest is the go-to for tabular anomalies.' },
  recsys: { result: ['recommender-systems', 'embeddings'], note: 'Collaborative filtering or learned embeddings of users and items.' },
  rl: { result: ['q-learning', 'supervised-vs-unsupervised'], note: 'Q-learning for small action spaces; Deep Q-Networks when states are large.' }
};

function decisionTreeToMermaid() {
  const lines = ['flowchart TD'];
  const links = {};
  for (const [key, node] of Object.entries(decisionTree)) {
    if (node.q) {
      lines.push(`  ${key}{"${mermaidLabel(node.q)}"}`);
      for (const [label, next] of node.options) {
        lines.push(`  ${key} -->|"${mermaidLabel(label)}"| ${next}`);
      }
    } else {
      const ids = node.result.filter(has);
      const names = ids.map(id => conceptById.get(id).name.replace(/\s*\(.*\)$/, ''));
      lines.push(`  ${key}["${mermaidLabel(names.join(' · '))}"]`);
      if (ids[0]) links[key] = ids[0];
    }
  }
  return { source: lines.join('\n'), links };
}

function renderWizardView() {
  const pane = document.getElementById('view-wizard');
  pane.innerHTML = `
    <section class="view-section">
      <div class="view-section-head">
        <h2>🧭 Which model should I use?</h2>
        <p>Answer a few questions and get the concepts that fit your problem.</p>
      </div>
      <div class="wizard" id="wizard"></div>
    </section>
    <section class="view-section">
      <div class="view-section-head">
        <h2>🌲 The Whole Decision Tree</h2>
        <p>Every question and answer at once. Click an answer box to open its first recommended concept.</p>
      </div>
      <button class="btn btn-secondary" id="showFullTreeBtn">Show full decision tree</button>
      <div class="diagram-panel" id="fullDecisionTree" hidden></div>
    </section>
  `;

  const history = [];
  const wizard = pane.querySelector('#wizard');

  const show = (key) => {
    const node = decisionTree[key];
    const crumbs = history.map((h, i) => `<button class="wizard-crumb" data-step="${i}">${h.answer}</button>`).join('<span class="wizard-crumb-sep">→</span>');

    if (node.q) {
      wizard.innerHTML = `
        ${crumbs ? `<div class="wizard-crumbs">${crumbs}</div>` : ''}
        <div class="wizard-question">${node.q}</div>
        <div class="wizard-options">
          ${node.options.map(([label, next], i) => `<button class="wizard-option" data-next="${next}" data-i="${i}">${label}</button>`).join('')}
        </div>
      `;
      wizard.querySelectorAll('.wizard-option').forEach(btn => {
        btn.addEventListener('click', () => {
          history.push({ key, answer: node.options[btn.dataset.i][0] });
          show(btn.dataset.next);
        });
      });
    } else {
      const ids = node.result.filter(has);
      wizard.innerHTML = `
        <div class="wizard-crumbs">${crumbs}</div>
        <div class="wizard-question">✨ Recommended for you</div>
        <p class="wizard-note">${node.note}</p>
        <div class="wizard-results">
          ${ids.map((id, i) => {
            const c = conceptById.get(id);
            return `
              <button class="wizard-result" data-id="${id}" style="--track-color: ${trackById[c.track].color}">
                ${i === 0 ? '<span class="wizard-top-pick">Top pick</span>' : ''}
                <strong>${c.name}</strong>
                <span>${c.summary}</span>
              </button>`;
          }).join('')}
        </div>
        <button class="btn btn-secondary" id="wizardRestart">↺ Start over</button>
      `;
      wizard.querySelectorAll('.wizard-result').forEach(btn => btn.addEventListener('click', () => openConceptModal(btn.dataset.id)));
      wizard.querySelector('#wizardRestart').addEventListener('click', () => { history.length = 0; show('start'); });
    }

    wizard.querySelectorAll('.wizard-crumb').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = Number(btn.dataset.step);
        const target = history[step].key;
        history.length = step;
        show(target);
      });
    });
  };
  show('start');

  const fullBtn = pane.querySelector('#showFullTreeBtn');
  const fullHost = pane.querySelector('#fullDecisionTree');
  fullBtn.addEventListener('click', () => {
    fullHost.hidden = !fullHost.hidden;
    fullBtn.textContent = fullHost.hidden ? 'Show full decision tree' : 'Hide full decision tree';
    if (!fullHost.hidden && !fullHost.dataset.rendered) {
      fullHost.dataset.rendered = '1';
      const tree = decisionTreeToMermaid();
      renderDiagram(fullHost, tree.source, { links: tree.links, onNodeClick: openConceptModal });
    }
  });
}

/* =========================================================================
   3. Pipelines
   ========================================================================= */

const pipelines = [
  {
    title: '🔁 The ML Lifecycle',
    description: 'From a business question to a monitored model in production — and back again when the data drifts.',
    links: { P: 'ml-workflow', D: 'what-is-de', Q: 'data-quality', F: 'what-is-feature-engineering', S: 'train-test-split', T: 'hyperparameter-tuning', E: 'precision-recall-f1', X: 'experiment-tracking', R: 'experiment-tracking', C: 'ml-cicd', Dp: 'model-serving', AB: 'ab-testing-deployment', M: 'model-data-drift' },
    source: `flowchart LR
  subgraph data["1 · Data"]
    direction TB
    P(["Business problem"]) --> D["Collect & ingest data"]
    D --> Q["Validate data quality"]
    Q --> F["Feature engineering"]
  end
  subgraph model["2 · Modeling"]
    direction TB
    S["Train / validation / test split"] --> T["Train & tune models"]
    T --> E["Evaluate on held-out data"]
    E --> R["Register best model"]
    T -.-> X["Log runs: experiment tracking"]
  end
  subgraph prod["3 · Production"]
    direction TB
    C["CI/CD pipeline"] --> Dp["Deploy & serve"]
    Dp --> AB["A/B or canary rollout"]
    AB --> M["Monitor drift & performance"]
  end
  data --> model
  model --> prod
  prod -.->|"drift detected: retrain"| model`
  },
  {
    title: '🏗️ Modern Data Platform',
    description: 'How raw events and database changes become clean tables for dashboards and features for models.',
    links: { OLTP: 'oltp-vs-olap', K: 'apache-kafka', CD: 'cdc', SS: 'batch-vs-stream', RAW: 'parquet-format', SIL: 'lakehouse-architecture', GOLD: 'dimensional-modeling', SP: 'apache-spark', DBT: 'dbt', DQ: 'data-quality', BI: 'warehouse-vs-lake', FS: 'feature-store', ML: 'model-serving', AF: 'airflow', PT: 'data-partitioning' },
    source: `flowchart LR
  subgraph src["Sources"]
    OLTP[("App database: OLTP")]
    EV["Clickstream events"]
    FILES["Files & APIs"]
  end
  OLTP --> CD["Change Data Capture"]
  CD --> K["Kafka topics"]
  EV --> K
  K --> SS["Stream processing"]
  subgraph lh["Lakehouse"]
    RAW["Bronze: raw Parquet"] --> SIL["Silver: cleaned & conformed"]
    SIL --> GOLD["Gold: star schema"]
  end
  FILES -->|"batch ingest"| RAW
  SS --> RAW
  PT["Partitioning & file layout"] -.-> RAW
  SP["Spark jobs"] -.-> SIL
  DQ["Data quality checks"] -.-> SIL
  DBT["dbt models"] -.-> GOLD
  AF["Airflow orchestration"] -.-> SP
  AF -.-> DBT
  GOLD --> BI["BI dashboards: OLAP"]
  GOLD --> FS["Feature store"]
  FS --> ML["Model training & serving"]`
  },
  {
    title: '🧹 Preprocessing Without Leakage',
    description: 'Split first, then fit every transformer on the training set only — the order is what prevents data leakage.',
    links: { RAW: 'what-is-feature-engineering', SPLIT: 'train-test-split', IMP: 'simple-imputer', ENC: 'encoding-categorical', SCL: 'feature-scaling', SEL: 'feature-selection', BAL: 'class-imbalance', MOD: 'cross-validation', TEST: 'precision-recall-f1' },
    source: `flowchart LR
  RAW["Raw table"] --> SPLIT{"Split first"}
  SPLIT -->|"train"| IMP["Impute missing values"]
  IMP --> ENC["Encode categoricals"]
  ENC --> SCL["Scale numeric features"]
  SCL --> SEL["Select features"]
  SEL --> BAL["Rebalance classes: train only"]
  BAL --> MOD["Fit model with cross-validation"]
  SPLIT -->|"test: locked away"| TEST["Final evaluation"]
  MOD -->|"apply fitted transforms"| TEST`
  },
  {
    title: '🧠 Neural Network Training Loop',
    description: 'What happens on every mini-batch while a deep network learns.',
    links: { X: 'what-is-gradient-descent', FW: 'mlp-neural-network', A: 'activation-functions', L: 'loss-vs-cost-function', BP: 'mlp-neural-network', O: 'dl-optimizers', R: 'dl-regularization', V: 'overfitting-underfitting' },
    source: `flowchart LR
  X["Mini-batch of inputs"] --> FW["Forward pass: weighted sums"]
  FW --> A["Activation functions"]
  A --> L["Compute loss vs labels"]
  L --> BP["Backpropagation: gradients"]
  BP --> O["Optimizer step: SGD / Adam"]
  R["Dropout, BatchNorm, weight decay"] -.-> FW
  O -->|"next batch"| X
  O --> V{"Validation loss still falling?"}
  V -->|"no: early stop"| STOP(["Keep best checkpoint"])`
  }
];

function renderPipelinesView() {
  const pane = document.getElementById('view-pipelines');
  pane.innerHTML = pipelines.map((p, i) => `
    <section class="view-section">
      <div class="view-section-head">
        <h2>${p.title}</h2>
        <p>${p.description} <span class="muted">Click a highlighted step to open its concept.</span></p>
      </div>
      <div class="diagram-panel" id="pipeline-${i}"></div>
    </section>
  `).join('');

  pipelines.forEach((p, i) => {
    const links = Object.fromEntries(Object.entries(p.links).filter(([, id]) => has(id)));
    renderDiagram(pane.querySelector(`#pipeline-${i}`), p.source, { links, onNodeClick: openConceptModal });
  });
}

/* =========================================================================
   4. Learning Paths
   ========================================================================= */

function renderPathsView() {
  const pane = document.getElementById('view-paths');
  pane.innerHTML = `
    <div class="view-section-head">
      <h2>🎓 Learning Paths</h2>
      <p>Follow a path in order. Tick a step once you understand it; progress is saved in this browser.</p>
    </div>
    <div class="paths-grid">
      ${learningPaths.map(path => {
        const steps = path.steps.filter(has);
        const done = steps.filter(isLearned).length;
        const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
        const nextId = steps.find(id => !isLearned(id));
        return `
          <article class="path-card">
            <header class="path-head">
              <h3>${path.icon} ${path.title}</h3>
              <p>${path.goal}</p>
              <div class="path-progress">
                <div class="metric-bar-bg"><div class="metric-bar-fill" style="width: ${pct}%"></div></div>
                <span>${done}/${steps.length}</span>
              </div>
            </header>
            <ol class="path-steps">
              ${steps.map(id => {
                const c = conceptById.get(id);
                const learned = isLearned(id);
                return `
                  <li class="path-step ${learned ? 'is-learned' : ''} ${id === nextId ? 'is-next' : ''}">
                    <button class="path-check" data-id="${id}" aria-pressed="${learned}" title="${learned ? 'Mark as not learned' : 'Mark as learned'}">${learned ? '✓' : ''}</button>
                    <button class="path-step-link" data-id="${id}" style="--track-color: ${trackById[c.track].color}">
                      ${c.name}
                      ${id === nextId ? '<span class="path-next-tag">Up next</span>' : ''}
                    </button>
                  </li>`;
              }).join('')}
            </ol>
          </article>`;
      }).join('')}
    </div>
  `;

  pane.querySelectorAll('.path-check').forEach(btn => btn.addEventListener('click', () => toggleLearned(btn.dataset.id)));
  pane.querySelectorAll('.path-step-link').forEach(btn => btn.addEventListener('click', () => openConceptModal(btn.dataset.id)));
}
