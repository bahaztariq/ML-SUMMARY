export default {
  id: "cross-validation",
  name: "Cross-Validation (k-Fold CV)",
  track: "ml-core",
  category: "ML Theory & Validation",
  task: ["Validation", "Evaluation", "Hyperparameter Tuning"],
  difficulty: "Beginner",
  summary: "A resampling technique that splits the training data into k equal folds, trains the model k times using k-1 folds, and validates on the remaining fold each time. Reports the average performance across all k rounds.",
  intuition: "The Round-Robin Tournament: Instead of playing ONE match (single train/test split), you play k matches. Each player (fold) gets a turn being the test set while the rest train. The average score across all matches is far more reliable than any single game.",
  whenToUse: "Hyperparameter tuning, model selection, and getting robust performance estimates. Essential when your dataset is too small for a large held-out test set.",
  whenToAvoid: "Very large datasets (>1M samples) where a single 80/20 split already gives stable estimates and k-Fold would be computationally wasteful.",
  requirements: {
    multipleTrainTestRounds: true,
    robustPerformanceEstimate: true,
    standardForHyperparameterTuning: true
  },
  parameters: [
    {
      name: "n_splits (k)",
      type: "int",
      default: "5",
      impact: "Number of folds. Each fold serves as test set once.",
      tuningTip: "k=5 is the industry standard. k=10 for small datasets. k=n (Leave-One-Out) for extremely small datasets."
    },
    {
      name: "StratifiedKFold",
      type: "variant",
      default: "Preserves class ratios",
      impact: "Each fold maintains the same proportion of each class as the full dataset.",
      tuningTip: "ALWAYS use StratifiedKFold for classification to prevent class imbalance within individual folds."
    },
    {
      name: "TimeSeriesSplit",
      type: "variant",
      default: "Temporal order",
      impact: "Ensures training data always precedes test data chronologically.",
      tuningTip: "Mandatory for time-series forecasting to prevent future data leaking into training."
    }
  ],
  math: {
    formula: "CV Score = (1/k) ∑ᵢ₌₁ᵏ Score(Model_i, Fold_test_i)",
    loss: "Average of k Validation Scores",
    explanation: "Each of the k models is trained on (k-1)/k of the data and evaluated on the remaining 1/k. Averaging k scores provides a lower-variance estimate of generalization performance than any single random split."
  },
  pros: [
    "Every data point gets used for both training AND validation (maximizes data utilization)",
    "Provides mean AND standard deviation of performance (quantifies reliability)",
    "The gold standard for model selection and hyperparameter tuning"
  ],
  cons: [
    "k times more expensive computationally than a single train/test split",
    "Not suitable for time-series data without special temporal splitting (TimeSeriesSplit)"
  ],
  prerequisites: ["train-test-split"],
  related: ["hyperparameter-tuning", "time-series-cv", "bias-variance-tradeoff", "overfitting-underfitting"],
  diagram: `flowchart TD
    A["Training data"] --> B["Split into k folds"]
    B --> C["Round i: hold out fold i"]
    C --> D["Fit model on other k-1 folds"]
    D --> E["Score on held-out fold i"]
    E --> F{"All k folds used?"}
    F -->|"no"| C
    F -->|"yes"| G["Average k scores"]
    G --> H(["Mean ± std performance estimate"])`,
  codeSnippet: `from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=100, random_state=42)

# 5-Fold Stratified Cross-Validation
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv, scoring='accuracy')

print(f"CV Scores: {scores}")
print(f"Mean Accuracy: {scores.mean():.4f} ± {scores.std():.4f}")
# Mean ± Std tells you both performance AND reliability`
};
