/**
 * Curated learning paths: ordered concept sequences for a goal.
 */

export const learningPaths = [
  {
    id: 'ml-beginner',
    icon: '🌱',
    title: 'ML Beginner',
    goal: 'From "what is AI?" to training and evaluating your first models.',
    steps: [
      'what-is-ai', 'what-is-ml', 'supervised-vs-unsupervised', 'probability-statistics',
      'what-is-regression', 'what-is-classification', 'loss-vs-cost-function', 'what-is-gradient-descent',
      'train-test-split', 'linear-regression', 'logistic-regression', 'overfitting-underfitting',
      'confusion-matrix-concept', 'precision-recall-f1', 'ml-workflow'
    ]
  },
  {
    id: 'tabular-ml',
    icon: '🤖',
    title: 'Tabular ML Practitioner',
    goal: 'Prepare real-world tables and win with tree ensembles.',
    steps: [
      'what-is-feature-engineering', 'simple-imputer', 'knn-imputer', 'encoding-categorical', 'feature-scaling',
      'cross-validation', 'decision-tree', 'ensemble-methods', 'random-forest', 'gradient-boosting',
      'xgboost', 'lightgbm', 'catboost', 'hyperparameter-tuning', 'class-imbalance', 'feature-selection',
      'model-interpretability'
    ]
  },
  {
    id: 'unsupervised',
    icon: '🔍',
    title: 'Unsupervised Learning',
    goal: 'Find structure in unlabeled data: clusters, embeddings and anomalies.',
    steps: [
      'what-is-clustering', 'kmeans', 'silhouette-score', 'dbscan', 'hierarchical-clustering', 'gmm',
      'what-is-dimensionality-reduction', 'curse-of-dimensionality', 'linear-algebra', 'pca', 'tsne-umap',
      'isolation-forest'
    ]
  },
  {
    id: 'deep-learning',
    icon: '⚡',
    title: 'Deep Learning & LLMs',
    goal: 'Neural networks from the perceptron to retrieval-augmented LLM apps.',
    steps: [
      'what-is-deep-learning', 'linear-algebra', 'mlp-neural-network', 'activation-functions', 'dl-optimizers',
      'dl-regularization', 'cnn', 'rnn-lstm', 'embeddings', 'transformer-architecture', 'transfer-learning',
      'autoencoders', 'generative-models', 'llms', 'rag'
    ]
  },
  {
    id: 'data-engineer',
    icon: '📊',
    title: 'Data Engineer',
    goal: 'Design storage, batch & streaming pipelines and a governed lakehouse.',
    steps: [
      'what-is-de', 'etl-vs-elt', 'oltp-vs-olap', 'warehouse-vs-lake', 'parquet-format', 'data-partitioning',
      'dimensional-modeling', 'apache-spark', 'batch-vs-stream', 'apache-kafka', 'cdc', 'dbt', 'airflow',
      'lakehouse-architecture', 'data-quality'
    ]
  },
  {
    id: 'mlops',
    icon: '🚀',
    title: 'MLOps Engineer',
    goal: 'Take a model from notebook to monitored production service.',
    steps: [
      'ml-lifecycle', 'ml-workflow', 'experiment-tracking', 'docker-ml', 'model-serving', 'feature-store',
      'ml-cicd', 'ab-testing-deployment', 'model-data-drift'
    ]
  }
];
