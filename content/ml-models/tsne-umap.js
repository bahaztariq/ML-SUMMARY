export default {
  id: "tsne-umap",
  name: "t-SNE & UMAP",
  track: "ml-models",
  category: "Dimensionality Reduction",
  task: ["Dimensionality Reduction", "Data Visualization", "Unsupervised"],
  difficulty: "Advanced",
  summary: "Non-linear dimensionality reduction methods that preserve local neighborhoods, used mainly to visualize high-dimensional data in 2D or 3D.",
  intuition: "The Party Seating Plan: You have 1,000 guests described by hundreds of traits and only a 2D floor. You can't keep every distance exact, so you focus on one rule: friends must sit near their friends. t-SNE and UMAP shuffle the guests around the floor until each person's closest friends are sitting next to them — distant strangers can end up anywhere.",
  whenToUse: "Exploring and visualizing embeddings, image features, single-cell genomics, or any high-dimensional data to spot clusters, outliers and label noise. UMAP is also usable as a preprocessing step before clustering.",
  whenToAvoid: "As a feature-engineering step for supervised models (t-SNE has no transform for new data), when you need to interpret distances or cluster sizes between groups (they are not meaningful), or when linear structure suffices (use PCA).",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: false,
    deterministic: false
  },
  parameters: [
    {
      name: "perplexity (t-SNE)",
      type: "float",
      default: "30",
      impact: "Effective number of neighbors each point considers.",
      tuningTip: "Try 5–50. Low values emphasize very local structure; must be smaller than the number of points."
    },
    {
      name: "n_neighbors (UMAP)",
      type: "int",
      default: "15",
      impact: "Size of the local neighborhood used to build the graph.",
      tuningTip: "Small (5–15) reveals fine local clusters; large (50–200) preserves more global structure."
    },
    {
      name: "min_dist (UMAP)",
      type: "float",
      default: "0.1",
      impact: "How tightly points can be packed in the embedding.",
      tuningTip: "Lower (0.0–0.05) for tighter clusters before clustering; higher (0.5) for a more even visual spread."
    },
    {
      name: "n_components",
      type: "int",
      default: "2",
      impact: "Output dimensionality.",
      tuningTip: "2 or 3 for visualization; UMAP can go to 10–50 as input for downstream clustering."
    }
  ],
  math: {
    formula: "KL(P ‖ Q) = Σ_i Σ_j p_ij · log(p_ij / q_ij),   q_ij ∝ (1 + ‖y_i − y_j‖²)⁻¹",
    loss: "KL divergence (t-SNE) / Fuzzy cross-entropy (UMAP)",
    explanation: "t-SNE converts high-dimensional distances into neighbor probabilities p_ij (Gaussian) and low-dimensional ones into q_ij (heavy-tailed Student-t), then moves points by gradient descent to minimize the KL divergence. The heavy tail lets dissimilar points spread far apart, avoiding crowding. UMAP builds a fuzzy k-NN graph and optimizes a cross-entropy between graphs, which is faster and keeps more global structure."
  },
  pros: [
    "Reveals non-linear cluster structure that PCA cannot",
    "Produces visually striking, interpretable 2D maps",
    "UMAP is fast, scales to millions of points and supports transform() on new data",
    "Useful to sanity-check embeddings and spot label errors"
  ],
  cons: [
    "Distances between clusters and cluster sizes are not meaningful",
    "Results depend heavily on hyperparameters and random seed",
    "t-SNE is slow (O(n log n) at best) and cannot embed new points",
    "Easy to over-interpret — apparent clusters can be artifacts"
  ],
  prerequisites: ["pca", "what-is-dimensionality-reduction"],
  related: ["curse-of-dimensionality", "embeddings", "autoencoders", "kmeans"],
  diagram: `flowchart TD
    A[("High-dimensional data")] --> B["Scale features, optional PCA to ~50 dims"]
    B --> C["Find nearest neighbors of each point"]
    C --> D["High-dim similarities p_ij / fuzzy k-NN graph"]
    D --> E["Random or spectral 2D initialization"]
    E --> F["Low-dim similarities q_ij (Student-t curve)"]
    F --> G["Gradient step: minimize KL / cross-entropy"]
    G --> H{"Converged?"}
    H -->|"no"| F
    H -->|"yes"| I(["2D map: neighbors stay close"])`,
  codeSnippet: `import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import umap  # pip install umap-learn

X_scaled = StandardScaler().fit_transform(X)

# Common trick: denoise with PCA to ~50 dims first (faster, more stable)
X_pca = PCA(n_components=50, random_state=42).fit_transform(X_scaled)

# t-SNE: visualization only
X_tsne = TSNE(n_components=2, perplexity=30, init='pca',
              learning_rate='auto', random_state=42).fit_transform(X_pca)

# UMAP: faster, keeps more global structure, supports transform()
reducer = umap.UMAP(n_neighbors=15, min_dist=0.1, n_components=2, random_state=42)
X_umap = reducer.fit_transform(X_pca)

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
axes[0].scatter(X_tsne[:, 0], X_tsne[:, 1], c=y, s=3, cmap='tab10')
axes[0].set_title('t-SNE')
axes[1].scatter(X_umap[:, 0], X_umap[:, 1], c=y, s=3, cmap='tab10')
axes[1].set_title('UMAP')
plt.show()`
};
