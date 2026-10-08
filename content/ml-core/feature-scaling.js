export default {
  id: "feature-scaling",
  name: "Feature Scaling (Standard vs Min-Max)",
  track: "ml-core",
  category: "Preprocessing & Feature Engineering",
  task: ["Data Preprocessing", "Feature Engineering"],
  difficulty: "Beginner",
  summary: "Techniques to transform numerical features onto a common scale to prevent features with large magnitudes from dominating distance and gradient computations.",
  intuition: "Comparing Apples to Elephants: If feature A is 'Age' (20 to 80) and feature B is 'Salary' ($30,000 to $200,000), distance algorithms will treat Salary as 3,000x more important unless scaled.",
  whenToUse: "Mandatory for gradient descent models (Logistic/Linear, Neural Nets) and distance-based models (k-NN, SVM, K-Means, PCA).",
  whenToAvoid: "Tree-based algorithms (Decision Trees, Random Forest, XGBoost) are invariant to monotonic transformations and do not need scaling.",
  requirements: {
    mustFitOnTrainOnly: true,
    preservesOutliersWithRobust: true
  },
  parameters: [
    {
      name: "StandardScaler",
      type: "method",
      default: "μ=0, σ=1",
      impact: "Z-score transformation.",
      tuningTip: "Best default for normally distributed features and models with gradient descent."
    },
    {
      name: "MinMaxScaler",
      type: "method",
      default: "[0, 1]",
      impact: "Bounds features between fixed min and max.",
      tuningTip: "Best for image pixels or algorithms that require strictly positive values."
    },
    {
      name: "RobustScaler",
      type: "method",
      default: "Median, IQR",
      impact: "Uses median and interquartile range.",
      tuningTip: "Use when data contains severe outliers that would distort standard mean/variance."
    }
  ],
  math: {
    formula: "Standard: z = (x - μ) / σ   |   Min-Max: x_norm = (x - x_min) / (x_max - x_min)",
    loss: "Zero Mean & Unit Variance Transformation",
    explanation: "Centers data around 0 with unit standard deviation. This transforms spherical loss contours, preventing gradient descent from oscillating wildly back and forth."
  },
  pros: [
    "Accelerates gradient descent convergence by orders of magnitude",
    "Ensures regularized penalties (L1/L2) penalize all features equitably"
  ],
  cons: [
    "Destroys original physical units of measurement ($ dollars, kg, miles)",
    "Fitting scalers on the entire dataset before train/test splitting causes severe Data Leakage"
  ],
  prerequisites: ["what-is-feature-engineering"],
  related: ["knn", "svm", "what-is-gradient-descent", "train-test-split"],
  diagram: `flowchart TD
    A["Raw numeric features"] --> B{"Model uses distances or gradients?"}
    B -->|"no (trees)"| C(["Skip scaling"])
    B -->|"yes"| D{"Outliers or bounded range needed?"}
    D -->|"need 0..1 range"| E["Min-Max: (x − min) / (max − min)"]
    D -->|"roughly Gaussian"| F["Standard: (x − μ) / σ"]
    D -->|"heavy outliers"| G["Robust: (x − median) / IQR"]
    E --> H["Fit on train split only"]
    F --> H
    G --> H
    H --> I["Transform train, val and test"]`,
  codeSnippet: `from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# CRITICAL: fit ONLY on training data, then transform both!
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)`
};
