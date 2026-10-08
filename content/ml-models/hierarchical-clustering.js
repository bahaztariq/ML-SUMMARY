export default {
  id: "hierarchical-clustering",
  name: "Hierarchical Clustering (Agglomerative)",
  track: "ml-models",
  category: "Clustering",
  task: ["Clustering"],
  difficulty: "Intermediate",
  summary: "Builds a tree (dendrogram) of nested clusters by repeatedly merging the two closest groups, letting you choose the number of clusters after the fact.",
  intuition: "The Family Tree: Start with every person as their own family. Merge the two most similar people into a household, then the closest households into extended families, and so on until everyone is one clan. Cutting the tree at a chosen height gives you the grouping level you want.",
  whenToUse: "Small-to-medium datasets (under ~10k points) when you don't know the number of clusters in advance, want to visualize nested structure (taxonomies, gene expression, customer segments), or need a deterministic result.",
  whenToAvoid: "Large datasets — memory is O(n²) and time is O(n² log n) or worse. Also when clusters are density-shaped with noise (DBSCAN is better) or you need to assign new points to clusters cheaply.",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: true,
    needsK: false
  },
  parameters: [
    {
      name: "linkage",
      type: "str",
      default: "'ward'",
      impact: "How the distance between two clusters is measured (ward, complete, average, single).",
      tuningTip: "'ward' gives compact, balanced clusters (Euclidean only). 'single' finds elongated chains but suffers from chaining; 'average' is a robust middle ground."
    },
    {
      name: "n_clusters",
      type: "int or None",
      default: "2",
      impact: "Number of clusters at which to cut the dendrogram.",
      tuningTip: "Set to None and use distance_threshold, or inspect the dendrogram for the largest vertical gap."
    },
    {
      name: "distance_threshold",
      type: "float or None",
      default: "None",
      impact: "Cut height: clusters further apart than this are not merged.",
      tuningTip: "Use instead of n_clusters when a natural distance scale exists in your domain."
    },
    {
      name: "metric",
      type: "str",
      default: "'euclidean'",
      impact: "Distance metric between individual points.",
      tuningTip: "Use 'cosine' for text embeddings (with average/complete linkage)."
    }
  ],
  math: {
    formula: "Ward: Δ(A, B) = (|A|·|B| / (|A| + |B|)) · ‖μ_A − μ_B‖²",
    loss: "Greedy merge criterion (increase in within-cluster variance for Ward)",
    explanation: "At each step the algorithm merges the pair of clusters with the smallest linkage distance. Ward's criterion picks the merge that increases total within-cluster sum of squares the least, mirroring the K-Means objective. The merge heights form the dendrogram's y-axis."
  },
  pros: [
    "No need to choose k up front — the dendrogram shows all granularities",
    "Deterministic: same data always yields the same tree",
    "Dendrogram is a highly interpretable visualization",
    "Works with any distance metric (with non-Ward linkages)"
  ],
  cons: [
    "O(n²) memory makes it impractical beyond tens of thousands of points",
    "Greedy merges can never be undone, so early mistakes propagate",
    "Sensitive to feature scaling and outliers",
    "No native predict() for new, unseen points"
  ],
  prerequisites: ["what-is-clustering", "feature-scaling"],
  related: ["kmeans", "dbscan", "gmm", "silhouette-score"],
  diagram: `flowchart TD
    A[("n scaled data points")] --> B["Start: each point is its own cluster"]
    B --> C["Compute pairwise cluster distances (linkage)"]
    C --> D["Merge the two closest clusters"]
    D --> E["Record merge height in dendrogram"]
    E --> F{"Only one cluster left?"}
    F -->|"no"| C
    F -->|"yes"| G["Full dendrogram"]
    G --> H["Cut at height or n_clusters"]
    H --> I(["Final cluster labels"])`,
  codeSnippet: `import matplotlib.pyplot as plt
from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import silhouette_score

X_scaled = StandardScaler().fit_transform(X)

# 1. Build the full merge tree with SciPy and plot the dendrogram
Z = linkage(X_scaled, method='ward')
plt.figure(figsize=(10, 4))
dendrogram(Z, truncate_mode='lastp', p=30)
plt.title('Dendrogram (look for the largest vertical gap)')
plt.show()

# 2. Cut the tree at a chosen height
labels_cut = fcluster(Z, t=8.0, criterion='distance')

# 3. Or let sklearn cut at a fixed number of clusters
agg = AgglomerativeClustering(n_clusters=4, linkage='ward')
labels = agg.fit_predict(X_scaled)
print("Silhouette:", silhouette_score(X_scaled, labels))`
};
