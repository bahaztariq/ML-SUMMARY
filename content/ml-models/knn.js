export default {
  id: "knn",
  name: "k-Nearest Neighbors (k-NN)",
  track: "ml-models",
  category: "Instance-Based / Lazy Learning",
  task: ["Classification", "Regression"],
  difficulty: "Beginner",
  summary: "A non-parametric, lazy learning algorithm that predicts the target based on the majority label or mean of the k closest data points in feature space.",
  intuition: "Birds of a Feather Flock Together: Tell me who your 5 closest neighbors are, and I'll tell you what you are.",
  whenToUse: "Simple baseline, recommendation systems (item-to-item similarity), anomaly detection, or imputation of missing feature values.",
  whenToAvoid: "High-dimensional data (Curse of Dimensionality renders distances meaningless) or high-throughput production environments with millions of records.",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: true,
    linearRelationship: false
  },
  parameters: [
    {
      name: "n_neighbors (k)",
      type: "int",
      default: "5",
      impact: "Number of nearest neighbors to consult.",
      tuningTip: "Small k (e.g. 1) captures noise (overfitting); large k creates oversmoothed boundaries (underfitting). Pick odd numbers to avoid ties."
    },
    {
      name: "weights",
      type: "string",
      default: "'uniform'",
      impact: "Weight function used in prediction ('uniform' or 'distance').",
      tuningTip: "Use 'distance' to give closer neighbors more voting influence than distant ones."
    },
    {
      name: "metric",
      type: "string",
      default: "'minkowski' (p=2 Euclidean)",
      impact: "Distance metric used ('euclidean', 'manhattan', 'cosine').",
      tuningTip: "Use 'cosine' for sparse text/embeddings, 'manhattan' for grid-like or high-dimensional features."
    }
  ],
  math: {
    formula: "d(p, q) = √[ ∑ (p_i - q_i)² ] (Euclidean Metric)",
    loss: "Non-parametric (No explicit loss minimization phase during training)",
    explanation: "Training is $O(1)$ because it merely memorizes the dataset. Prediction is $O(N \\cdot D)$ because calculating pairwise distances across $N$ stored samples of dimension $D$ is required for every query."
  },
  pros: [
    "Zero training time (lazy evaluation)",
    "Intuitively simple to explain and inspect predictions",
    "Naturally adapts to multi-modal class clusters"
  ],
  cons: [
    "Extremely slow inference time during production querying",
    "High memory storage footprint (must keep entire training dataset in RAM)",
    "Severely degraded by the Curse of Dimensionality"
  ],
  prerequisites: ["what-is-classification", "feature-scaling"],
  related: ["knn-imputer", "recommender-systems", "curse-of-dimensionality", "svm"],
  diagram: `flowchart LR
    A(["New query point x"]) --> B["Scale with training statistics"]
    B --> C["Compute distance to every stored training point"]
    T[("Stored training set")] --> C
    C --> D["Sort and keep the k nearest neighbors"]
    D --> E{"Task?"}
    E -->|"classification"| F["Majority (or distance-weighted) vote"]
    E -->|"regression"| G["Average of neighbor targets"]
    F --> H(["Prediction"])
    G --> H`,
  codeSnippet: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

knn = make_pipeline(
    StandardScaler(),
    KNeighborsClassifier(n_neighbors=7, weights='distance', metric='euclidean')
)
knn.fit(X_train, y_train)`
};
