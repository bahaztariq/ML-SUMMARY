export default {
  id: "random-forest",
  name: "Random Forest",
  track: "ml-models",
  category: "Ensemble / Bagging",
  task: ["Classification", "Regression"],
  difficulty: "Intermediate",
  summary: "An ensemble of decorrelated decision trees trained on bootstrap samples with random feature subsets.",
  intuition: "The Wisdom of the Crowd: Instead of asking one easily biased expert (a single decision tree), you ask a diverse committee of hundreds of trees and take the majority vote or average.",
  whenToUse: "Excellent first-choice baseline for tabular data. When you need high accuracy, low tuning effort, and robust protection against overfitting.",
  whenToAvoid: "Ultra-low-latency real-time inference requirements (evaluating 500 trees takes time) or high-dimensional sparse text data (where linear models excel).",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: false,
    linearRelationship: false
  },
  parameters: [
    {
      name: "n_estimators",
      type: "int",
      default: "100",
      impact: "Controls number of trees built.",
      tuningTip: "More is almost always better and will not cause overfitting, but increases memory and inference time. 100 to 500 is typical."
    },
    {
      name: "max_depth",
      type: "int or None",
      default: "None",
      impact: "Limits the maximum depth of each tree.",
      tuningTip: "Leave as None or tune between 10-30 to prevent excessively deep individual trees and reduce model file size."
    },
    {
      name: "min_samples_split",
      type: "int or float",
      default: "2",
      impact: "Minimum number of samples required to split an internal node.",
      tuningTip: "Increase to 5-10 to combat overfitting on noisy datasets."
    },
    {
      name: "max_features",
      type: "string or int",
      default: "'sqrt' (clf), 1.0 (reg)",
      impact: "Number of features randomly sampled at each candidate split.",
      tuningTip: "Using 'sqrt' decorrelates the trees so one dominant feature does not take over every single tree."
    }
  ],
  math: {
    formula: "Var(Ensemble) = ρ·σ² + ((1 - ρ) / B)·σ²",
    loss: "Gini Impurity / Entropy (Classification) or MSE / MAE (Regression)",
    explanation: "By averaging B bootstrap trees with correlation ρ, the second term approaches zero as B grows large. The random feature subsampling directly shrinks correlation ρ, dramatically reducing overall variance without increasing bias."
  },
  pros: [
    "Extremely resistant to overfitting compared to standalone decision trees",
    "Requires virtually zero feature scaling (works seamlessly on raw tabular numbers)",
    "Handles non-linear feature interactions and categorical splits naturally",
    "Provides reliable built-in feature importance rankings (MDI / Permutation)"
  ],
  cons: [
    "Can result in large model file sizes (hundreds of megabytes for deep forests)",
    "Cannot extrapolate numerical trends beyond the min/max values seen during training",
    "Slower prediction throughput compared to lightweight linear models"
  ],
  prerequisites: ["decision-tree", "ensemble-methods"],
  related: ["xgboost", "gradient-boosting", "isolation-forest", "bias-variance-tradeoff"],
  diagram: `flowchart TD
    A[("Training data")] --> B1["Bootstrap sample 1"]
    A --> B2["Bootstrap sample 2"]
    A --> B3["Bootstrap sample B"]
    B1 --> T1["Tree 1: random feature subset per split"]
    B2 --> T2["Tree 2: random feature subset per split"]
    B3 --> T3["Tree B: random feature subset per split"]
    T1 --> V["Aggregate predictions"]
    T2 --> V
    T3 --> V
    V --> R(["Majority vote (clf) or average (reg)"])
    A -.->|"rows left out"| O["Out-of-bag error estimate"]`,
  codeSnippet: `from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Instantiate and fit
rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    max_features='sqrt',
    min_samples_split=5,
    random_state=42,
    n_jobs=-1
)
rf.fit(X_train, y_train)

# Inference & Feature Importance
preds = rf.predict(X_test)
print(classification_report(y_test, preds))`
};
