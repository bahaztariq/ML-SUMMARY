export default {
  id: "curse-of-dimensionality",
  name: "Curse of Dimensionality",
  track: "ml-core",
  category: "ML Theory & Diagnostics",
  task: ["Definition", "Preprocessing"],
  difficulty: "Intermediate",
  summary: "The collection of problems that appear as the number of features grows: data becomes exponentially sparse, distances lose meaning, and models need vastly more samples to generalize.",
  intuition: "Finding a Friend: In a 100 m corridor (1D) you find your friend quickly. On a 100 m × 100 m field (2D) it takes much longer, and in a 100 m cube of a building (3D) it is harder still. Every new dimension multiplies the space to search, so the same number of people (samples) end up spread hopelessly thin, and 'nearest' neighbors are not actually near.",
  whenToUse: "As a diagnostic lens whenever you have many features relative to samples (genomics, text, wide one-hot encodings), when k-NN / k-Means / SVM-RBF degrade as features are added, or when deciding whether to reduce dimensions.",
  whenToAvoid: "N/A as a concept, but do not over-apply it: real data often lies on a low-dimensional manifold, which is why deep learning still works on million-pixel images.",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: false,
    hurtsDistanceBasedModels: true
  },
  parameters: [
    {
      name: "d (number of features)",
      type: "int",
      default: "dataset dependent",
      impact: "Volume of the feature space grows exponentially with d; samples needed for the same density grow as kᵈ.",
      tuningTip: "Watch the ratio n_samples / n_features; below ~10 for simple models, consider selection or reduction."
    },
    {
      name: "distance metric",
      type: "str",
      default: "'euclidean'",
      impact: "L2 distances concentrate (all pairs look equally far) in high dimensions.",
      tuningTip: "Try cosine similarity for sparse text-like data, or L1 (Manhattan), which degrades more slowly."
    },
    {
      name: "reduction method",
      type: "concept",
      default: "none",
      impact: "PCA, feature selection, embeddings or UMAP compress the space to its informative directions.",
      tuningTip: "Keep enough PCA components for 90 to 95% explained variance as a first try."
    },
    {
      name: "regularization strength",
      type: "float",
      default: "model dependent",
      impact: "Constrains models so they cannot exploit the many spurious directions available in high-d space.",
      tuningTip: "With p much larger than n, L1/L2-regularized linear models are often the strongest baseline."
    }
  ],
  math: {
    formula: "(d_max − d_min) / d_min → 0  as  d → ∞",
    loss: "Distance concentration",
    explanation: "For random points in d dimensions, the gap between the farthest and nearest neighbor shrinks relative to the nearest distance as d grows, so 'nearest' stops being meaningful. Relatedly, the fraction of a unit hypercube's volume within a thin shell near its surface is 1 − (1 − 2ε)ᵈ, which tends to 1: almost all points are near the edges."
  },
  pros: [
    "Explains why k-NN, k-Means and RBF kernels fail on wide raw data",
    "Motivates feature selection, PCA, embeddings and regularization",
    "Guides how much data you need before adding more features",
    "Helps diagnose overfitting caused by many spurious features"
  ],
  cons: [
    "Hard to visualize or reason about beyond 3 dimensions",
    "Effect size depends on intrinsic (not nominal) dimensionality, which is hard to measure",
    "Rules of thumb on sample counts are rough and model dependent"
  ],
  prerequisites: ["overfitting-underfitting", "linear-algebra"],
  related: ["what-is-dimensionality-reduction", "feature-selection", "pca", "knn"],
  diagram: `flowchart TD
    A["Add more features (d ↑)"] --> B["Space volume grows exponentially"]
    B --> C["Fixed samples become sparse"]
    C --> D["Distances concentrate: all points look equally far"]
    C --> E["More spurious patterns fit by chance"]
    D --> F["k-NN, k-Means, RBF kernels degrade"]
    E --> G["Overfitting / high variance"]
    F --> H{"Remedies"}
    G --> H
    H --> I["Feature selection"]
    H --> J["PCA / embeddings / UMAP"]
    H --> K["Regularization or more data"]`,
  codeSnippet: `import numpy as np
from sklearn.metrics import pairwise_distances

rng = np.random.default_rng(42)
n = 500

# Distance concentration: contrast between nearest and farthest neighbor
for d in [2, 10, 100, 1000, 10000]:
    X = rng.random((n, d))
    D = pairwise_distances(X[:1], X[1:])[0]
    contrast = (D.max() - D.min()) / D.min()
    print(f"d={d:>6}  relative contrast={contrast:6.3f}")
# Contrast collapses toward 0: every point is ~equally far away.

# Remedy: compress to the informative directions before k-NN
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score

raw = make_pipeline(StandardScaler(), KNeighborsClassifier())
reduced = make_pipeline(StandardScaler(), PCA(n_components=0.95),
                        KNeighborsClassifier())
print("raw     :", cross_val_score(raw, X_wide, y, cv=5).mean())
print("PCA 95% :", cross_val_score(reduced, X_wide, y, cv=5).mean())`
};
