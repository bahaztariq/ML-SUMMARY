export default {
  id: "what-is-clustering",
  name: "What is Clustering?",
  track: "fundamentals",
  category: "Core Tasks",
  task: ["Definition", "Clustering", "Unsupervised"],
  difficulty: "Beginner",
  summary: "An unsupervised learning task that groups a collection of unlabeled data points into clusters so that objects in the same cluster are much more similar to each other than to objects in other clusters.",
  intuition: "Sorting Socks Without Labels: Imagine dumping a mountain of clean socks on a bed. Nobody labeled them 'black dress sock' or 'white sports sock'. You naturally pair similar colors, lengths, and textures together purely by looking at their physical similarities.",
  whenToUse: "Customer segmentation (grouping users by buying habits), anomaly/fraud detection (points that don't belong to any cluster), document topic discovery, and image compression.",
  whenToAvoid: "When you already have explicit target labels you want to predict (use Supervised Classification instead).",
  requirements: {
    unlabeledDataOnly: true,
    requiresDistanceMetric: true,
    featureScalingCritical: true,
    noGroundTruthLabels: true
  },
  parameters: [
    {
      name: "Centroid-Based (K-Means)",
      type: "algorithm type",
      default: "Spherical clusters",
      impact: "Represents clusters by their central mean point.",
      tuningTip: "Fastest and most popular, but assumes clusters are round and equal sized."
    },
    {
      name: "Density-Based (DBSCAN)",
      type: "algorithm type",
      default: "Arbitrary shapes",
      impact: "Connects dense regions separated by sparse noise.",
      tuningTip: "Does not require specifying cluster count k in advance; filters outliers automatically."
    },
    {
      name: "Hierarchical Clustering",
      type: "algorithm type",
      default: "Dendrogram tree",
      impact: "Builds a nested tree of clusters from bottom-up (agglomerative) or top-down.",
      tuningTip: "Great for evolutionary biology or small datasets where visual trees add value."
    }
  ],
  math: {
    formula: "Objective: Minimize Intra-Cluster Distance & Maximize Inter-Cluster Distance",
    loss: "Within-Cluster Sum of Squares (Inertia) = ∑_k ∑_i ||x_i - μ_k||²",
    explanation: "Clustering algorithms mathematically minimize the spread within each group (intra-cluster variance) while pushing the centers of distinct groups as far apart as possible in vector space."
  },
  pros: [
    "Requires zero human labeling effort or expensive annotation budgets",
    "Reveals natural, previously unsuspected patterns and customer archetypes",
    "Can engineer rich cluster-distance features for downstream supervised models"
  ],
  cons: [
    "No objective mathematical 'ground truth' to prove which clustering is definitively correct",
    "Heavily sensitive to unscaled features and the chosen distance metric"
  ],
  prerequisites: ["supervised-vs-unsupervised"],
  related: ["kmeans", "dbscan", "hierarchical-clustering", "silhouette-score"],
  diagram: `flowchart TD
    A[("Unlabeled data")] --> B["Scale features"]
    B --> C["Define similarity: distance or density"]
    C --> D{"Expected cluster shape?"}
    D -->|"round, known k"| E["K-Means / GMM"]
    D -->|"arbitrary shapes + noise"| F["DBSCAN"]
    D -->|"nested groups"| G["Hierarchical clustering"]
    E --> H["Assign each point a cluster id"]
    F --> H
    G --> H
    H --> I["Validate: silhouette score + domain review"]
    I --> J["Name & act on segments"]`,
  codeSnippet: `from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import numpy as np

# Unlabeled customer features: [Annual Spend ($k), Website Visits]
X = np.array([
    [15, 2], [18, 3], [12, 1],       # Cluster A: Low spend, low visits
    [90, 25], [85, 22], [95, 28],    # Cluster B: High spend, high visits
    [20, 30], [22, 28], [18, 35]     # Cluster C: Bargain hunters (low spend, high visits)
])

# Scale and cluster
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

kmeans = KMeans(n_clusters=3, random_state=42)
cluster_ids = kmeans.fit_predict(X_scaled)
print(f"Assigned Customer Segments: {cluster_ids}")`
};
