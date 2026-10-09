/**
 * The unified roadmap: every concept exactly once, in learning order.
 * Core stages form one trunk; specializations branch off after it and can be taken in any order.
 * Learning paths (content/paths.js) are goal-focused views over the same roadmap.
 */

/**
 * @typedef {{ title: string, steps: string[] }} Milestone
 * @typedef {{ id: string, title: string, icon: string, goal: string, kind: 'core' | 'specialization', milestones: Milestone[] }} Stage
 */

/** @type {Stage[]} */
export const roadmap = [
  {
    id: 'foundations',
    kind: 'core',
    icon: '🌱',
    title: 'Foundations',
    goal: 'What machine learning is, the problems it solves, and the math it runs on.',
    milestones: [
      { title: 'The big picture', steps: ['what-is-ai', 'what-is-ml', 'supervised-vs-unsupervised', 'ml-workflow'] },
      { title: 'The core tasks', steps: ['what-is-classification', 'what-is-regression', 'what-is-clustering'] },
      { title: 'The math toolkit', steps: ['probability-statistics', 'linear-algebra', 'loss-vs-cost-function', 'what-is-gradient-descent'] },
      { title: 'A first look further', steps: ['what-is-dimensionality-reduction', 'what-is-deep-learning'] }
    ]
  },
  {
    id: 'data-prep',
    kind: 'core',
    icon: '🧹',
    title: 'Preparing data',
    goal: 'Split data honestly and turn raw columns into features a model can learn from.',
    milestones: [
      { title: 'Honest evaluation', steps: ['train-test-split', 'cross-validation', 'time-series-cv'] },
      { title: 'Feature engineering', steps: ['what-is-feature-engineering', 'feature-scaling', 'encoding-categorical'] },
      { title: 'Missing values', steps: ['simple-imputer'] }
    ]
  },
  {
    id: 'first-models',
    kind: 'core',
    icon: '📈',
    title: 'First models',
    goal: 'Train and understand the classic, interpretable supervised models.',
    milestones: [
      { title: 'Linear models', steps: ['linear-regression', 'logistic-regression'] },
      { title: 'Intuitive classifiers', steps: ['knn', 'naive-bayes', 'decision-tree'] }
    ]
  },
  {
    id: 'evaluation',
    kind: 'core',
    icon: '🎯',
    title: 'Evaluating models',
    goal: 'Measure what a model gets right and wrong, and pick the metric that matches the problem.',
    milestones: [
      { title: 'Regression metrics', steps: ['mae-metric', 'rmse-metric', 'r2-score'] },
      { title: 'Classification metrics', steps: ['confusion-matrix-concept', 'precision-recall-f1', 'roc-auc', 'pr-curve', 'log-loss'] }
    ]
  },
  {
    id: 'generalization',
    kind: 'core',
    icon: '⚖️',
    title: 'Generalization & tuning',
    goal: 'Diagnose overfitting, control complexity, handle hard data, then tune and explain models.',
    milestones: [
      { title: 'Over- and underfitting', steps: ['overfitting-underfitting', 'bias-variance-tradeoff', 'regularization-l1-l2', 'curse-of-dimensionality'] },
      { title: 'Harder data problems', steps: ['feature-selection', 'knn-imputer', 'class-imbalance'] },
      { title: 'Tuning and explaining', steps: ['hyperparameter-tuning', 'model-interpretability'] }
    ]
  },
  {
    id: 'advanced-supervised',
    kind: 'core',
    icon: '🌲',
    title: 'Powerful supervised models',
    goal: 'Margins, kernels and the tree ensembles that win on tabular data.',
    milestones: [
      { title: 'Kernel methods', steps: ['svm'] },
      { title: 'Tree ensembles', steps: ['ensemble-methods', 'random-forest', 'gradient-boosting', 'xgboost', 'lightgbm', 'catboost'] }
    ]
  },
  {
    id: 'unsupervised',
    kind: 'core',
    icon: '🔍',
    title: 'Unsupervised learning',
    goal: 'Find structure without labels: clusters, compact representations and anomalies.',
    milestones: [
      { title: 'Clustering', steps: ['kmeans', 'hierarchical-clustering', 'dbscan', 'gmm', 'silhouette-score'] },
      { title: 'Dimensions and anomalies', steps: ['pca', 'tsne-umap', 'isolation-forest'] }
    ]
  },
  {
    id: 'beyond-tables',
    kind: 'core',
    icon: '🧭',
    title: 'Beyond tables',
    goal: 'Problems with their own shape: data ordered in time, and predicting what users will like.',
    milestones: [
      { title: 'Special problem types', steps: ['time-series-forecasting', 'recommender-systems'] }
    ]
  },
  {
    id: 'deep-learning',
    kind: 'specialization',
    icon: '⚡',
    title: 'Deep learning & LLMs',
    goal: 'Neural networks from the perceptron to transformers, generative models, RAG and deep reinforcement learning.',
    milestones: [
      { title: 'Neural network basics', steps: ['activation-functions', 'mlp-neural-network', 'dl-optimizers', 'dl-regularization'] },
      { title: 'Architectures', steps: ['cnn', 'rnn-lstm', 'embeddings', 'transformer-architecture'] },
      { title: 'Modern AI', steps: ['transfer-learning', 'autoencoders', 'generative-models', 'llms', 'rag'] },
      { title: 'Learning by trial and error', steps: ['q-learning'] }
    ]
  },
  {
    id: 'data-engineering',
    kind: 'specialization',
    icon: '📊',
    title: 'Data engineering',
    goal: 'Store, model, move and govern the data that ML depends on.',
    milestones: [
      { title: 'Storage fundamentals', steps: ['what-is-de', 'etl-vs-elt', 'oltp-vs-olap', 'parquet-format', 'warehouse-vs-lake', 'data-partitioning'] },
      { title: 'Modeling and quality', steps: ['dimensional-modeling', 'data-quality', 'dbt'] },
      { title: 'Pipelines at scale', steps: ['batch-vs-stream', 'airflow', 'apache-spark', 'apache-kafka', 'cdc', 'lakehouse-architecture'] }
    ]
  },
  {
    id: 'mlops',
    kind: 'specialization',
    icon: '🚀',
    title: 'MLOps & production',
    goal: 'Ship models reliably: tracking, packaging, serving, deploying and monitoring.',
    milestones: [
      { title: 'From notebook to service', steps: ['ml-lifecycle', 'experiment-tracking', 'docker-ml', 'model-serving'] },
      { title: 'Running in production', steps: ['ml-cicd', 'feature-store', 'ab-testing-deployment', 'model-data-drift'] }
    ]
  }
];

/** Every concept id in roadmap order. */
export function roadmapOrder() {
  return roadmap.flatMap((stage) => stage.milestones.flatMap((m) => m.steps));
}
