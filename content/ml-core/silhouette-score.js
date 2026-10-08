export default {
  id: "silhouette-score",
  name: "Silhouette Score (Clustering Evaluation)",
  track: "ml-core",
  category: "Evaluation Metrics",
  task: ["Clustering", "Metrics", "Evaluation", "Unsupervised"],
  difficulty: "Intermediate",
  summary: "Measures how similar an object is to its own cluster (cohesion) compared to other clusters (separation). Ranges from -1 to +1, where higher values indicate well-defined, separated clusters.",
  intuition: "Friendship Quality Score: For each person, measure: 'How close am I to my friend group?' minus 'How close am I to the nearest rival group?' If you're way closer to your friends than to strangers, your silhouette is high.",
  whenToUse: "Evaluating clustering quality when no ground truth labels exist. Finding optimal k in K-Means using Silhouette Analysis.",
  whenToAvoid: "Density-based clusters with arbitrary shapes (DBSCAN clusters may get unfairly low scores because silhouette assumes convex shapes).",
  requirements: {
    unsupervisedMetric: true,
    noLabelsRequired: true,
    distanceBased: true
  },
  parameters: [
    {
      name: "Score ≈ +1",
      type: "interpretation",
      default: "Excellent",
      impact: "Points are very close to their own cluster and very far from neighboring clusters.",
      tuningTip: "Well-separated, tight clusters."
    },
    {
      name: "Score ≈ 0",
      type: "interpretation",
      default: "Ambiguous",
      impact: "Points are on or near the boundary between two clusters.",
      tuningTip: "Overlapping clusters or wrong k value."
    },
    {
      name: "Score < 0",
      type: "interpretation",
      default: "Misassigned",
      impact: "Points are closer to a different cluster than their assigned cluster.",
      tuningTip: "Points may have been assigned to the wrong cluster."
    }
  ],
  math: {
    formula: "s(i) = (b(i) - a(i)) / max(a(i), b(i))",
    loss: "Cohesion vs Separation Ratio",
    explanation: "a(i) = average distance from point i to all other points in its own cluster (intra-cluster). b(i) = minimum average distance from point i to all points in any other cluster (nearest-cluster). The formula normalizes the difference to [-1, +1]."
  },
  pros: [
    "No ground truth labels needed — works purely on geometric cluster quality",
    "Provides per-sample scores allowing identification of individual misassigned points",
    "Intuitive interpretation: higher is always better"
  ],
  cons: [
    "Computationally expensive: O(n²) pairwise distance calculations",
    "Biased toward convex (spherical) clusters; penalizes arbitrary-shaped clusters unfairly"
  ],
  prerequisites: ["what-is-clustering"],
  related: ["kmeans", "dbscan", "hierarchical-clustering", "gmm"],
  diagram: `flowchart TD
    A["Clustered point i"] --> B["a = mean distance to own cluster"]
    A --> C["b = mean distance to nearest other cluster"]
    B --> D["s = (b − a) / max(a, b)"]
    C --> D
    D --> E["Repeat for every point"]
    E --> F["Average silhouette"]
    F --> G{"Compare across k"}
    G --> H(["Pick k with highest score"])`,
  codeSnippet: `from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, silhouette_samples

# Try different k values and find the best
best_k, best_score = 2, -1
for k in range(2, 8):
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)
    score = silhouette_score(X_scaled, labels)
    print(f"k={k}: Silhouette = {score:.3f}")
    if score > best_score:
        best_k, best_score = k, score

print(f"\\nOptimal k = {best_k} with Silhouette = {best_score:.3f}")`
};
