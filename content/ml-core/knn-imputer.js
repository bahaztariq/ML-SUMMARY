export default {
  id: "knn-imputer",
  name: "KNNImputer (k-Nearest Neighbors Imputation)",
  track: "ml-core",
  category: "Preprocessing & Imputation",
  task: ["Preprocessing", "Missing Data", "Imputation"],
  difficulty: "Intermediate",
  summary: "Fills missing values in a dataset by computing the weighted average (or most frequent value) of the k-nearest neighboring samples that DO have non-missing values for that feature.",
  intuition: "Ask Your Neighbors: Imagine a student's Math exam score is missing. Instead of filling it with the class average (SimpleImputer), KNNImputer looks at the 5 most similar students (same Science score, same English score) and averages THEIR Math scores.",
  whenToUse: "When missing values are NOT random and nearby samples in feature space provide strong predictive signal. When relationships between features are important.",
  whenToAvoid: "Very large datasets (KNNImputer is O(n²) per query). When missingness is completely random (SimpleImputer with mean/median is sufficient and 100x faster).",
  requirements: {
    scalingRequired: true,
    handlesNumerical: true,
    computationallyExpensive: true
  },
  parameters: [
    {
      name: "n_neighbors",
      type: "int",
      default: "5",
      impact: "Number of nearest neighbors to use for imputation.",
      tuningTip: "Small k (1-3) captures local patterns but is noisy. Larger k (10-20) smooths more but may lose local signal."
    },
    {
      name: "weights",
      type: "string",
      default: "'uniform'",
      impact: "Weight function: 'uniform' (equal weight) or 'distance' (closer neighbors contribute more).",
      tuningTip: "Use 'distance' for better results when feature distributions have variable density."
    },
    {
      name: "metric",
      type: "string",
      default: "'nan_euclidean'",
      impact: "Distance metric that handles NaN values by computing partial distances.",
      tuningTip: "nan_euclidean automatically ignores missing dimensions when computing distances."
    }
  ],
  math: {
    formula: "x_missing = (1/k) ∑ⱼ wⱼ · x_neighbor_j  (weighted average of k nearest non-missing values)",
    loss: "Distance-Weighted Neighborhood Imputation",
    explanation: "For each missing value, KNNImputer finds the k nearest samples (using non-missing features) and imputes the missing value as the (optionally weighted) average of those neighbors' corresponding feature values."
  },
  pros: [
    "Leverages correlations between features to produce smarter imputations",
    "No assumption about data distribution (non-parametric)",
    "Handles multiple missing features per row"
  ],
  cons: [
    "O(n²) computational complexity for large datasets (slow on >50K samples)",
    "Requires feature scaling (StandardScaler) before use or distances become meaningless",
    "Sensitive to the curse of dimensionality in high-dimensional feature spaces"
  ],
  prerequisites: ["simple-imputer", "knn", "feature-scaling"],
  related: ["data-quality", "encoding-categorical", "curse-of-dimensionality"],
  diagram: `flowchart TD
    A["Row with a missing value"] --> B["Scale features"]
    B --> C["Distance to other rows using non-missing features"]
    C --> D["Pick k nearest neighbors"]
    D --> E{"Neighbors have that feature?"}
    E -->|"yes"| F["Average (or distance-weight) their values"]
    E -->|"no"| G["Use next nearest donors"]
    G --> F
    F --> H["Fill the gap"]
    H --> I(["Complete dataset"])`,
  codeSnippet: `from sklearn.impute import KNNImputer
from sklearn.preprocessing import StandardScaler
import numpy as np

# Dataset with missing values (NaN)
X = np.array([
    [1.0, 2.0, np.nan],
    [3.0, np.nan, 6.0],
    [7.0, 8.0, 9.0],
    [4.0, 5.0, 6.0],
    [np.nan, 3.0, 5.0]
])

# KNNImputer fills NaNs using k nearest neighbors
imputer = KNNImputer(n_neighbors=2, weights='distance')
X_imputed = imputer.fit_transform(X)

print("Original (with NaNs):")
print(X)
print("\\nImputed (NaNs filled via KNN):")
print(X_imputed)`
};
