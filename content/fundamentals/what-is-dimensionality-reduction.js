export default {
  id: "what-is-dimensionality-reduction",
  name: "What is Dimensionality Reduction?",
  track: "fundamentals",
  category: "Core Tasks",
  task: ["Definition", "Dimensionality Reduction", "Unsupervised"],
  difficulty: "Beginner",
  summary: "The process of transforming data from a high-dimensional space into a lower-dimensional space while preserving as much meaningful variance, geometric structure, or information as possible.",
  intuition: "Photographing a 3D Statue: A statue lives in 3D space. When you snap a high-quality photograph, you project it onto a flat 2D photograph. You lost one dimension of depth, but almost all the recognizable details and shapes are preserved.",
  whenToUse: "When you have too many features (Curse of Dimensionality), when features are heavily correlated (multicollinearity), when downstream models train too slowly, or to visualize 100-dimensional data on a 2D/3D screen.",
  whenToAvoid: "When individual feature names and exact physical units must remain strictly interpretable to business stakeholders (compressed components lose their original names).",
  requirements: {
    highDimensionalData: true,
    preservesVarianceOrDistances: true,
    featureScalingRequired: true
  },
  parameters: [
    {
      name: "Linear (PCA)",
      type: "technique",
      default: "Global variance",
      impact: "Rotates axes to project data onto directions of maximum orthogonal variance.",
      tuningTip: "Fast, deterministic, and excellent for tabular preprocessing and compression."
    },
    {
      name: "Non-Linear (t-SNE & UMAP)",
      type: "technique",
      default: "Local neighborhood",
      impact: "Preserves local pairwise neighbor distances in 2D/3D embeddings.",
      tuningTip: "The gold standard for visualizing single-cell genomics, word embeddings, and image clusters."
    }
  ],
  math: {
    formula: "Projection: X_reduced = X_high · W  (where W contains top k eigenvectors)",
    loss: "Information Preservation: Maximize Tr(Wᵀ · Cov(X) · W)",
    explanation: "Transforms d-dimensional vectors into k-dimensional vectors (k << d) by finding an optimal projection matrix that minimizes reconstruction error."
  },
  pros: [
    "Defeats the Curse of Dimensionality (where distance metrics become equidistant)",
    "Speeds up training and inference times of downstream ML models by 10x-50x",
    "Enables humans to visually inspect high-dimensional clusters on a screen"
  ],
  cons: [
    "Transformed components become abstract mathematical mixtures, destroying feature interpretability",
    "Irreversible information loss: dropped dimensions can never be 100% recovered"
  ],
  prerequisites: ["supervised-vs-unsupervised", "linear-algebra"],
  related: ["pca", "tsne-umap", "curse-of-dimensionality", "feature-selection"],
  diagram: `flowchart TD
    A[("High-dimensional data: many features")] --> B{"Goal?"}
    B -->|"keep original features"| C["Feature selection: drop weak columns"]
    B -->|"compress into new axes"| D["Feature extraction"]
    D --> E{"Linear structure?"}
    E -->|"yes"| F["PCA: project onto top variance directions"]
    E -->|"no, curved manifold"| G["t-SNE / UMAP / autoencoder"]
    C --> H["Fewer dimensions"]
    F --> H
    G --> H
    H --> I["Faster training, less noise, 2D plots"]`,
  codeSnippet: `from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import numpy as np

# 100 samples with 10 features each
X = np.random.randn(100, 10)

# Scale first (mandatory for PCA)
X_scaled = StandardScaler().fit_transform(X)

# Compress 10 features down to the 2 most informative dimensions
pca = PCA(n_components=2)
X_2d = pca.fit_transform(X_scaled)

print(f"Compressed from {X.shape[1]}D down to {X_2d.shape[1]}D!")
print(f"Variance Preserved: {sum(pca.explained_variance_ratio_):.1%}")`
};
