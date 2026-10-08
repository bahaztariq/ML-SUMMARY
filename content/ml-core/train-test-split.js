export default {
  id: "train-test-split",
  name: "Train-Test Split & Data Leakage Prevention",
  track: "ml-core",
  category: "Preprocessing & Validation",
  task: ["Preprocessing", "Validation", "Data Leakage"],
  difficulty: "Beginner",
  summary: "The fundamental practice of splitting your dataset into separate training and testing sets BEFORE any preprocessing, to honestly evaluate how well a model generalizes to truly unseen data.",
  intuition: "The Final Exam Analogy: You study (train) from chapters 1-8. The final exam (test set) contains questions from chapter 9 that you've NEVER seen. If you peek at the exam beforehand (data leakage), your grade is meaningless.",
  whenToUse: "Absolutely mandatory for every supervised machine learning workflow. No exceptions.",
  whenToAvoid: "Never skip this step. The only variation is HOW to split (random, stratified, temporal).",
  requirements: {
    preventDataLeakage: true,
    honestEvaluation: true,
    splitBeforePreprocessing: true
  },
  parameters: [
    {
      name: "test_size",
      type: "float",
      default: "0.2 (20%)",
      impact: "Fraction of data held out for testing.",
      tuningTip: "Use 0.2 for large datasets (>10K). Use 0.3 for smaller datasets. For very small datasets, use cross-validation instead."
    },
    {
      name: "stratify",
      type: "array-like",
      default: "None",
      impact: "Ensures both train and test sets preserve the same class distribution as the original data.",
      tuningTip: "ALWAYS use stratify=y for classification to prevent all minority class samples ending up in one set."
    },
    {
      name: "random_state",
      type: "int",
      default: "None",
      impact: "Seed for reproducible splitting.",
      tuningTip: "Always set a fixed seed (e.g., 42) for reproducible experiments."
    },
    {
      name: "shuffle",
      type: "bool",
      default: "True",
      impact: "Whether to shuffle data before splitting.",
      tuningTip: "Set to False for time-series data where temporal order must be preserved."
    }
  ],
  math: {
    formula: "Dataset D → D_train (1-α) + D_test (α)  where α = test_size",
    loss: "Generalization Error Estimation",
    explanation: "The test set serves as a proxy for the infinite real-world data distribution the model will face in production. Leaking any test information into training inflates performance estimates and leads to catastrophic production failures."
  },
  pros: [
    "Provides an honest, unbiased estimate of real-world model performance",
    "Detects overfitting: large gap between train and test scores = overfitting",
    "Simple to implement and universally understood"
  ],
  cons: [
    "A single random split can be unlucky (use cross-validation for more robust estimates)",
    "Reduces available training data (20% fewer samples for learning)"
  ],
  prerequisites: ["what-is-ml"],
  related: ["cross-validation", "time-series-cv", "ml-workflow", "overfitting-underfitting"],
  diagram: `flowchart TD
    A["Full dataset"] --> B{"Time ordered?"}
    B -->|"yes"| C["Split by date: past → train, future → test"]
    B -->|"no"| D["Random stratified split"]
    C --> E["Train set"]
    C --> F["Test set (locked away)"]
    D --> E
    D --> F
    E --> G["Fit scaler / imputer / encoder on train"]
    G --> H["Train model"]
    G --> I["Transform test with fitted objects"]
    F --> I
    H --> J(["Evaluate once on test"])
    I --> J`,
  codeSnippet: `from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# CORRECT ORDER: Split FIRST, then preprocess
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# CRITICAL: Fit scaler ONLY on training data!
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)  # fit + transform
X_test_scaled = scaler.transform(X_test)         # transform ONLY (no fit!)

# ❌ WRONG: scaler.fit_transform(X) BEFORE splitting → DATA LEAKAGE!
# ✅ CORRECT: split → fit on train → transform both`
};
