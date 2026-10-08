export default {
  id: "dbscan",
  name: "DBSCAN (Density-Based Spatial Clustering)",
  track: "ml-models",
  category: "Unsupervised Clustering",
  task: ["Clustering", "Anomaly Detection", "Unsupervised"],
  difficulty: "Intermediate",
  summary: "A density-based clustering algorithm that groups together points packed closely in dense regions and marks points in low-density regions as noise/outliers. Does not require specifying the number of clusters k in advance.",
  intuition: "City Lights from Space: Dense clusters of street lights form natural cities. Isolated farmhouses in empty fields are noise/outliers. DBSCAN finds the cities without you telling it how many exist.",
  whenToUse: "When clusters have arbitrary shapes (rings, spirals, blobs). When you don't know k in advance. When identifying outliers is as important as finding clusters.",
  whenToAvoid: "When clusters have vastly different densities (one loose cluster + one tight cluster). When data lives in very high dimensions (distance metrics become unreliable).",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: false,
    linearRelationship: false
  },
  parameters: [
    {
      name: "eps (ε)",
      type: "float",
      default: "0.5",
      impact: "Maximum distance between two samples to be considered neighbors.",
      tuningTip: "Use a k-distance plot (sorted k-NN distances) to find the 'elbow' — that's your optimal eps."
    },
    {
      name: "min_samples",
      type: "int",
      default: "5",
      impact: "Minimum number of points required within eps radius to form a dense core point.",
      tuningTip: "Rule of thumb: min_samples ≥ number_of_features + 1. Higher values create stricter, fewer clusters."
    }
  ],
  math: {
    formula: "Core Point: |N_ε(p)| ≥ min_samples  where N_ε(p) = {q : d(p,q) ≤ ε}",
    loss: "Density-Reachability Connectivity",
    explanation: "A point p is a Core Point if at least min_samples points lie within its ε-neighborhood. Border points are within ε of a core point but are not core themselves. Noise points are neither core nor border. Clusters are connected components of core-reachable points."
  },
  pros: [
    "Discovers clusters of arbitrary shape (unlike K-Means which assumes spherical clusters)",
    "Automatically determines the number of clusters from data density",
    "Built-in noise/outlier detection: points labeled as -1 are anomalies",
    "Does not require specifying k in advance"
  ],
  cons: [
    "Struggles when clusters have vastly different densities (one eps cannot fit all)",
    "Performance degrades significantly in high-dimensional spaces",
    "Sensitive to eps and min_samples hyperparameters"
  ],
  prerequisites: ["what-is-clustering", "kmeans"],
  related: ["hierarchical-clustering", "isolation-forest", "gmm", "silhouette-score"],
  diagram: `flowchart TD
    A[("Scaled data")] --> B["For each point count neighbors within ε"]
    B --> C{"Neighbors ≥ min_samples?"}
    C -->|"yes"| D["Core point"]
    C -->|"no"| E{"Within ε of a core point?"}
    E -->|"yes"| F["Border point"]
    E -->|"no"| G(["Noise / outlier: label −1"])
    D --> H["Expand cluster through density-reachable cores"]
    F --> H
    H --> I(["Arbitrary-shaped clusters"])`,
  codeSnippet: `from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import numpy as np

# DBSCAN finds arbitrary-shape clusters AND outliers
X_scaled = StandardScaler().fit_transform(X)

dbscan = DBSCAN(eps=0.5, min_samples=5)
labels = dbscan.fit_predict(X_scaled)

n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
n_outliers = list(labels).count(-1)

print(f"Clusters found: {n_clusters}")
print(f"Outliers detected: {n_outliers}")
print(f"Labels: {labels}")`
};
