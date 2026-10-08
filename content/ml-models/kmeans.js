export default {
  id: "kmeans",
  name: "K-Means Clustering",
  track: "ml-models",
  category: "Unsupervised Clustering",
  task: ["Clustering", "Customer Segmentation"],
  difficulty: "Beginner",
  summary: "Partitions n observations into k predefined clusters where each point belongs to the cluster with the nearest mean (centroid).",
  intuition: "Territorial Expansion: Place k flags randomly on a map. Everyone joins the nearest flag. Flags move to the physical center of their new group. Repeat until flags stop moving.",
  whenToUse: "Customer segmentation, document grouping, image color quantization, and creating cluster-distance features for downstream supervised models.",
  whenToAvoid: "When clusters have arbitrary curved shapes (rings/moons), wildly varying densities, or when the number of clusters k is completely unpredictable.",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: true,
    linearRelationship: false
  },
  parameters: [
    {
      name: "n_clusters (k)",
      type: "int",
      default: "8",
      impact: "The number of clusters to form as well as the number of centroids to generate.",
      tuningTip: "Use the Elbow Method (inertia vs k) or Silhouette Analysis to find the optimal k."
    },
    {
      name: "init",
      type: "string",
      default: "'k-means++'",
      impact: "Method for initialization of starting centroids.",
      tuningTip: "Keep 'k-means++' to avoid sub-optimal local minima convergence."
    },
    {
      name: "n_init",
      type: "int",
      default: "10",
      impact: "Number of time the k-means algorithm will run with different centroid seeds.",
      tuningTip: "Higher values ensure best convergence at the cost of slight compute."
    }
  ],
  math: {
    formula: "Inertia (WCSS) = ∑_j=1^k ∑_x∈S_j ||x - μ_j||²",
    loss: "Within-Cluster Sum of Squares (WCSS)",
    explanation: "Alternates between Expectation step (assigning each point to closest centroid $\\mu_j$) and Maximization step (recomputing centroid $\\mu_j$ as arithmetic mean of all assigned members)."
  },
  pros: [
    "Fast and scalable algorithm with linear computational complexity $O(n \\cdot k \\cdot d)$",
    "Easy to interpret cluster boundaries via Voronoi cells",
    "Can easily classify new unseen data points by measuring distance to learned centroids"
  ],
  cons: [
    "User must guess or experimentally tune k in advance",
    "Assumes clusters are spherical and isotropic (fails on oblong or concentric clusters)",
    "Outliers drag centroids away from true density centers"
  ],
  prerequisites: ["what-is-clustering", "feature-scaling"],
  related: ["dbscan", "gmm", "hierarchical-clustering", "silhouette-score"],
  diagram: `flowchart TD
    A[("Scaled data")] --> B["Initialize k centroids (k-means++)"]
    B --> C["Assign each point to nearest centroid"]
    C --> D["Recompute centroid = mean of assigned points"]
    D --> E{"Centroids moved?"}
    E -->|"yes"| C
    E -->|"no"| F["Converged: compute inertia (WCSS)"]
    F --> G["Repeat for several k: elbow / silhouette"]
    G --> H(["Final k cluster labels"])`,
  codeSnippet: `from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

kmeans = KMeans(n_clusters=4, init='k-means++', n_init=10, random_state=42)
cluster_labels = kmeans.fit_predict(X_scaled)
score = silhouette_score(X_scaled, cluster_labels)
print(f"Silhouette Score: {score:.3f}")`
};
