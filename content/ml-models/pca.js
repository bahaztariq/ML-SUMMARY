export default {
  id: "pca",
  name: "Principal Component Analysis (PCA)",
  track: "ml-models",
  category: "Dimensionality Reduction",
  task: ["Dimensionality Reduction", "Feature Extraction", "Data Visualization"],
  difficulty: "Intermediate",
  summary: "An orthogonal linear transformation that transforms data to a new coordinate system such that the greatest variance lies on the first coordinate (PC1).",
  intuition: "Casting the Most Informative Shadow: Imagine a 3D object. PCA finds the exact camera angle that captures the maximum silhouette detail when flattened into a 2D picture.",
  whenToUse: "Compressing high-dimensional data (e.g. 500 features $\\to$ 20), speeding up downstream models, eliminating multicollinearity, or 2D/3D visualization.",
  whenToAvoid: "When non-linear manifold relationships dominate (use t-SNE or UMAP instead) or when original feature names must remain individually interpretable.",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: true,
    linearRelationship: true
  },
  parameters: [
    {
      name: "n_components",
      type: "int or float",
      default: "None",
      impact: "Number of components to retain or percentage of variance to explain.",
      tuningTip: "Pass a float between 0.0 and 1.0 (e.g. 0.95) to automatically retain enough components to preserve 95% of total variance."
    },
    {
      name: "whiten",
      type: "bool",
      default: "False",
      impact: "Whether to scale component vectors to unit variance.",
      tuningTip: "Set to True if feeding components into models sensitive to feature scales (like SVM)."
    }
  ],
  math: {
    formula: "Cov(X) = (1/n) · XᵀX = V · Λ · Vᵀ (Eigenvalue Decomposition)",
    loss: "Reconstruction Error: ||X - X_reconstructed||²",
    explanation: "Computes the covariance matrix of mean-centered data. The eigenvectors (columns of V) define the principal axes directions, while the eigenvalues ($\\Lambda$) measure the variance explained along each axis."
  },
  pros: [
    "Completely removes multicollinearity between features (components are strictly orthogonal)",
    "Dramatically reduces memory requirements and downstream training durations",
    "Preserves global data structure effectively"
  ],
  cons: [
    "Principal components are linear combinations of all original features, destroying interpretability",
    "Only captures linear relationships; blind to complex non-linear manifolds"
  ],
  prerequisites: ["what-is-dimensionality-reduction", "linear-algebra", "feature-scaling"],
  related: ["tsne-umap", "autoencoders", "curse-of-dimensionality", "feature-selection"],
  diagram: `flowchart TD
    A[("Data matrix X: n × d")] --> B["Center (and standardize) each feature"]
    B --> C["Covariance matrix or SVD of X"]
    C --> D["Eigenvectors = principal directions"]
    C --> E["Eigenvalues = variance explained"]
    E --> F["Sort and keep top k (e.g. 95% cumulative variance)"]
    D --> G["Projection matrix W_k"]
    F --> G
    G --> H(["Reduced data Z = X · W_k (n × k)"])`,
  codeSnippet: `from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Retain 95% of cumulative explained variance
pca = PCA(n_components=0.95)
X_reduced = pca.fit_transform(X_scaled)
print(f"Original shape: {X.shape[1]} features -> Reduced: {X_reduced.shape[1]} components")`
};
