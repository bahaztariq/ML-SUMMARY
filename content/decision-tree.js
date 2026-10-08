/**
 * "Which model should I use?" decision tree.
 *
 * Every node is either
 *   - a question: { q, options: [{ label, next }] } where `next` is another node key, or
 *   - a result:   { result: [conceptId, ...], note } listing recommended concepts (best first).
 *
 * The wizard starts at `decisionTreeStart`. Concept ids are checked by tools/validate.js.
 */

export const decisionTreeStart = 'start';

export const decisionTree = {
  start: {
    q: 'Do you have labeled data (a known target column to predict)?',
    options: [
      { label: 'Yes, every row has a label', next: 'supervised' },
      { label: 'No labels, I want to discover structure', next: 'unsupervised' },
      { label: 'An agent learns from rewards over time', next: 'rl' }
    ]
  },
  supervised: {
    q: 'What are you predicting?',
    options: [
      { label: 'A category (spam / not spam, which species…)', next: 'clsData' },
      { label: 'A number (price, temperature…)', next: 'regGoal' },
      { label: 'Future values of a series over time', next: 'timeseries' }
    ]
  },
  clsData: {
    q: 'What does your input data look like?',
    options: [
      { label: 'Tables / spreadsheets', next: 'clsGoal' },
      { label: 'Free text', next: 'text' },
      { label: 'Images', next: 'images' }
    ]
  },
  clsGoal: {
    q: 'What matters most?',
    options: [
      { label: 'Interpretability: I must explain decisions', next: 'clsExplain' },
      { label: 'Best accuracy on a large table', next: 'boosting' },
      { label: 'A fast baseline on a small dataset', next: 'clsBaseline' },
      { label: 'Rare positive class (fraud, disease)', next: 'imbalanced' }
    ]
  },
  regGoal: {
    q: 'What matters most?',
    options: [
      { label: 'Interpretability & coefficients', next: 'regExplain' },
      { label: 'Best accuracy on a large table', next: 'boosting' },
      { label: 'A fast baseline on a small dataset', next: 'regBaseline' }
    ]
  },
  unsupervised: {
    q: 'What is your goal?',
    options: [
      { label: 'Group similar rows together', next: 'clusterK' },
      { label: 'Reduce or visualise many features', next: 'dimred' },
      { label: 'Find rare / abnormal rows', next: 'anomaly' },
      { label: 'Recommend items to users', next: 'recsys' }
    ]
  },
  clusterK: {
    q: 'Do you roughly know how many clusters there are?',
    options: [
      { label: 'Yes, and clusters are blob-shaped', next: 'clusterKnown' },
      { label: 'No, or clusters have odd shapes and noise', next: 'clusterUnknown' }
    ]
  },
  dimred: {
    q: 'Why reduce dimensions?',
    options: [
      { label: 'As preprocessing for another model', next: 'dimredPre' },
      { label: 'To plot the data in 2D / 3D', next: 'dimredViz' }
    ]
  },

  clsExplain: {
    result: ['logistic-regression', 'decision-tree', 'model-interpretability'],
    note: 'Start simple; coefficients and tree splits can be read directly.'
  },
  clsBaseline: {
    result: ['naive-bayes', 'knn', 'logistic-regression', 'svm'],
    note: 'Quick to train; good yardsticks before trying ensembles.'
  },
  regExplain: {
    result: ['linear-regression', 'regularization-l1-l2', 'decision-tree'],
    note: 'Regularized linear models stay readable and robust.'
  },
  regBaseline: {
    result: ['linear-regression', 'knn', 'svm'],
    note: 'Establish a baseline RMSE before anything fancier.'
  },
  boosting: {
    result: ['xgboost', 'lightgbm', 'catboost', 'random-forest'],
    note: 'Gradient-boosted trees dominate tabular data. CatBoost shines with many categorical columns; LightGBM with millions of rows.'
  },
  imbalanced: {
    result: ['class-imbalance', 'precision-recall-f1', 'pr-curve', 'xgboost'],
    note: 'Fix the evaluation first (PR-AUC, recall), then the model.'
  },
  text: {
    result: ['transformer-architecture', 'transfer-learning', 'embeddings', 'naive-bayes'],
    note: 'Fine-tune a pretrained transformer; Naive Bayes is a strong cheap baseline.'
  },
  images: {
    result: ['cnn', 'transfer-learning'],
    note: 'Start from a pretrained CNN and fine-tune it.'
  },
  timeseries: {
    result: ['time-series-forecasting', 'time-series-cv', 'rnn-lstm', 'lightgbm'],
    note: 'Never shuffle time: validate with forward-chaining splits.'
  },
  clusterKnown: {
    result: ['kmeans', 'gmm', 'silhouette-score'],
    note: 'Use the silhouette score to confirm k.'
  },
  clusterUnknown: {
    result: ['dbscan', 'hierarchical-clustering'],
    note: 'DBSCAN finds arbitrary shapes and flags noise; a dendrogram helps choose k.'
  },
  dimredPre: {
    result: ['pca', 'feature-selection'],
    note: 'PCA for correlated features; feature selection when you need the original columns.'
  },
  dimredViz: {
    result: ['tsne-umap', 'pca'],
    note: 'UMAP / t-SNE for visual clusters; distances between clusters are not meaningful.'
  },
  anomaly: {
    result: ['isolation-forest', 'dbscan', 'autoencoders'],
    note: 'Isolation Forest is the go-to for tabular anomalies.'
  },
  recsys: {
    result: ['recommender-systems', 'embeddings'],
    note: 'Collaborative filtering or learned embeddings of users and items.'
  },
  rl: {
    result: ['q-learning', 'mlp-neural-network'],
    note: 'Q-learning for small action spaces; Deep Q-Networks (a neural network approximating Q) when states are large.'
  }
};
