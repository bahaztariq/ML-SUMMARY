export default {
  id: "svm",
  name: "Support Vector Machines (SVM)",
  track: "ml-models",
  category: "Kernel Methods",
  task: ["Classification", "Regression"],
  difficulty: "Intermediate",
  summary: "Finds the optimal separating hyperplane that maximizes the margin (distance) between distinct classes, utilizing kernel tricks for non-linear spaces.",
  intuition: "Street Sweeper with Maximum Safety Margin: Instead of just any line separating two groups, SVM builds the widest possible highway between them, supported only by the critical borderline points (support vectors).",
  whenToUse: "Medium-sized datasets with clear margins of separation, image classification benchmarks, bioinformatics, or high-dimensional gene expression arrays.",
  whenToAvoid: "Massive datasets with >100,000 samples (quadratic/cubic training time complexity $O(n^2)$ to $O(n^3)$), or heavily overlapping classes.",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: true,
    linearRelationship: false
  },
  parameters: [
    {
      name: "C",
      type: "float",
      default: "1.0",
      impact: "Regularization parameter (slack penalty tradeoff).",
      tuningTip: "Large C allows fewer misclassifications (narrow margin, risks overfitting); small C creates a wider margin (more tolerant to margin violations)."
    },
    {
      name: "kernel",
      type: "string",
      default: "'rbf'",
      impact: "Kernel type ('linear', 'poly', 'rbf', 'sigmoid').",
      tuningTip: "Use 'rbf' (Radial Basis Function) as default for non-linear data; 'linear' for text classification."
    },
    {
      name: "gamma",
      type: "string or float",
      default: "'scale'",
      impact: "Kernel coefficient for 'rbf', 'poly', and 'sigmoid'.",
      tuningTip: "High gamma leads to high variance (tight curvature around individual training samples); low gamma creates smoother boundaries."
    }
  ],
  math: {
    formula: "K(x, x') = exp(-γ · ||x - x'||²)",
    loss: "Hinge Loss: L = max(0, 1 - y · (wᵀx + b)) + (1/2C) · ||w||²",
    explanation: "The Kernel Trick projects input vectors into an infinite-dimensional Hilbert space where previously non-separable classes become linearly separable, without ever explicitly computing the high-dimensional coordinates."
  },
  pros: [
    "Effective in high-dimensional spaces (e.g. number of features > samples)",
    "Memory efficient: decision boundary depends strictly on a small subset of support vectors",
    "Versatile thanks to customizable kernel functions"
  ],
  cons: [
    "Extremely slow to train on datasets larger than tens of thousands of samples",
    "Does not directly provide probability estimates (requires expensive Platt scaling)",
    "Hyperparameters (C and gamma) require intensive search"
  ],
  prerequisites: ["logistic-regression", "feature-scaling", "linear-algebra"],
  related: ["knn", "regularization-l1-l2", "naive-bayes", "roc-auc"],
  diagram: `flowchart TD
    A[("Scaled features + labels")] --> B{"Linearly separable?"}
    B -->|"yes"| C["Linear kernel"]
    B -->|"no"| D["Kernel trick: RBF / polynomial maps to higher dims"]
    C --> E["Find hyperplane with maximum margin"]
    D --> E
    E --> F["Hinge loss + C trades margin width vs violations"]
    F --> G["Support vectors: only points on or inside margin"]
    G --> H["Decision: sign(Σ α_i y_i K(x_i, x) + b)"]
    H --> I(["Class prediction"])`,
  codeSnippet: `from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

svm = make_pipeline(
    StandardScaler(),
    SVC(kernel='rbf', C=10.0, gamma='scale', probability=True)
)
svm.fit(X_train, y_train)`
};
