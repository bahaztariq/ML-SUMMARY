export default {
  id: "encoding-categorical",
  name: "Label Encoding vs One-Hot Encoding",
  track: "ml-core",
  category: "Preprocessing & Feature Engineering",
  task: ["Preprocessing", "Feature Engineering", "Encoding"],
  difficulty: "Beginner",
  summary: "Techniques to convert categorical text features (like 'Red', 'Blue', 'Green') into numerical representations that machine learning algorithms can mathematically process.",
  intuition: "Translation for Machines: ML models speak numbers, not words. 'Paris', 'London', 'Tokyo' mean nothing to a neural network. We must translate them into numbers — but HOW we translate matters enormously.",
  whenToUse: "Mandatory for any dataset with categorical (text) features before feeding into ML models. Choice depends on the algorithm and the feature's nature.",
  whenToAvoid: "When using models that natively handle categoricals (CatBoost, LightGBM with categorical feature declaration).",
  requirements: {
    categoricalToNumerical: true,
    preventsFalseOrdering: true,
    matchesAlgorithmExpectation: true
  },
  parameters: [
    {
      name: "LabelEncoder",
      type: "method",
      default: "Integer mapping",
      impact: "Maps each unique category to an integer: Red=0, Blue=1, Green=2.",
      tuningTip: "ONLY use for ordinal features (Low<Medium<High) or tree-based models. Linear models will interpret Blue(1) as 'between' Red(0) and Green(2)!"
    },
    {
      name: "OneHotEncoder (pd.get_dummies)",
      type: "method",
      default: "Binary columns",
      impact: "Creates a separate binary column for each category: is_Red, is_Blue, is_Green.",
      tuningTip: "Use for nominal (unordered) categories with <10 unique values. Drop one column (drop='first') to avoid multicollinearity."
    },
    {
      name: "OrdinalEncoder",
      type: "method",
      default: "Ordered mapping",
      impact: "Like LabelEncoder but explicitly respects a user-defined ordering.",
      tuningTip: "Use for truly ordinal features: ['low', 'medium', 'high'] → [0, 1, 2]."
    },
    {
      name: "Target Encoding",
      type: "method",
      default: "Mean of target",
      impact: "Replaces each category with the mean target value for that category.",
      tuningTip: "Best for high-cardinality features (1000+ cities). Beware of target leakage — always use cross-validated target encoding."
    }
  ],
  math: {
    formula: "OneHot: x_cat → [0,0,...,1,...,0] (sparse binary vector of length |C|)",
    loss: "Representation Transformation",
    explanation: "Label encoding imposes an implicit ordinal relationship (0 < 1 < 2) which is incorrect for nominal categories. One-Hot encoding creates orthogonal binary dimensions, treating all categories as equidistant."
  },
  pros: [
    "Converts categorical features into algorithm-compatible numerical representations",
    "One-Hot encoding prevents false ordinal relationships between unordered categories",
    "Target encoding handles high-cardinality categoricals without dimensionality explosion"
  ],
  cons: [
    "One-Hot encoding causes dimensionality explosion with high-cardinality features (1000+ unique values)",
    "Label encoding introduces false ordinal relationships for linear and distance-based models",
    "Target encoding risks overfitting via target leakage if not cross-validated"
  ],
  prerequisites: ["what-is-feature-engineering"],
  related: ["feature-scaling", "curse-of-dimensionality", "catboost", "embeddings"],
  diagram: `flowchart TD
    A["Categorical column"] --> B{"Is there a natural order?"}
    B -->|"yes (low/med/high)"| C["Ordinal / Label encoding"]
    B -->|"no"| D{"Many unique values?"}
    D -->|"few"| E["One-hot encoding"]
    D -->|"many"| F["Target / frequency encoding or embeddings"]
    C --> G["Fit encoder on train only"]
    E --> G
    F --> G
    G --> H["Transform train and test"]
    H --> I(["Numeric matrix for the model"])`,
  codeSnippet: `from sklearn.preprocessing import LabelEncoder, OneHotEncoder, OrdinalEncoder
import pandas as pd

df = pd.DataFrame({'color': ['Red', 'Blue', 'Green', 'Blue', 'Red']})

# 1. Label Encoding (for tree models or ordinal features)
le = LabelEncoder()
df['color_label'] = le.fit_transform(df['color'])

# 2. One-Hot Encoding (for linear/distance-based models)
df_onehot = pd.get_dummies(df['color'], prefix='color', drop_first=True)

# 3. Ordinal Encoding (explicit order: Small < Medium < Large)
oe = OrdinalEncoder(categories=[['Small', 'Medium', 'Large']])
sizes = oe.fit_transform([['Medium'], ['Large'], ['Small']])

print(f"Label Encoded: {df['color_label'].tolist()}")
print(f"One-Hot:\\n{df_onehot}")
print(f"Ordinal: {sizes.ravel()}")`
};
