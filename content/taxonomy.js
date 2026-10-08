/**
 * Hand-curated ML taxonomy for the concept map.
 * A node is either a concept id (a leaf) or { label, concept?, children }.
 * `concept` makes a grouping node clickable; a concept may appear under several parents.
 */

/** @typedef {string | { label: string, concept?: string, children: TaxonomyNode[] }} TaxonomyNode */

/** @type {{ label: string, concept?: string, children: TaxonomyNode[] }} */
export const taxonomy = {
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

/**
 * Every concept id the taxonomy references (leaves and linked grouping nodes).
 * @param {TaxonomyNode} [node]
 * @returns {string[]}
 */
export function taxonomyConceptIds(node = taxonomy) {
  if (typeof node === 'string') return [node];
  return [...(node.concept ? [node.concept] : []), ...(node.children ?? []).flatMap((c) => taxonomyConceptIds(c))];
}
