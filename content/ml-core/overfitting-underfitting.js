export default {
  id: "overfitting-underfitting",
  name: "Overfitting vs Underfitting",
  track: "ml-core",
  category: "ML Theory & Diagnostics",
  task: ["Definition", "Diagnostics", "Model Tuning"],
  difficulty: "Beginner",
  summary: "The two fundamental failure modes of machine learning models. Overfitting: the model memorizes training noise and fails on new data. Underfitting: the model is too simple to capture the underlying pattern.",
  intuition: "The Student Analogy: Underfitting = A student who barely studied and fails both homework AND the exam. Overfitting = A student who memorized every homework answer verbatim but can't solve any new exam problem because they never understood the underlying concepts.",
  whenToUse: "Diagnosing model performance gaps. Deciding whether to increase or decrease model complexity.",
  whenToAvoid: "N/A — these are fundamental diagnostic concepts applicable to every ML model.",
  requirements: {
    diagnosticFramework: true,
    comparesTrainVsValError: true,
    guidesModelComplexity: true
  },
  parameters: [
    {
      name: "Overfitting Symptoms",
      type: "diagnostic",
      default: "Train ≫ Val",
      impact: "Training accuracy is very high (e.g., 99%) but validation accuracy is significantly lower (e.g., 75%).",
      tuningTip: "Remedies: Add more training data, increase regularization (L1/L2), reduce model complexity (fewer layers/trees/features), use Dropout, or apply early stopping."
    },
    {
      name: "Underfitting Symptoms",
      type: "diagnostic",
      default: "Train ≈ Val ≈ Low",
      impact: "Both training and validation accuracy are low (e.g., 60% each).",
      tuningTip: "Remedies: Use a more complex model, add more informative features, decrease regularization, train longer, or engineer interaction features."
    },
    {
      name: "Good Fit",
      type: "diagnostic",
      default: "Train ≈ Val ≈ High",
      impact: "Both training and validation accuracy are high and close to each other.",
      tuningTip: "The sweet spot! Model generalizes well to unseen data."
    }
  ],
  math: {
    formula: "Total Error = Bias² + Variance + Irreducible Noise",
    loss: "Bias-Variance Decomposition",
    explanation: "Underfitting = High Bias (model too rigid, wrong assumptions). Overfitting = High Variance (model too flexible, captures noise). The optimal model minimizes Total Error by balancing both."
  },
  pros: [
    "The most fundamental diagnostic framework in all of machine learning",
    "Directly informs whether to add/remove complexity, data, or regularization"
  ],
  cons: ["The optimal balance point depends heavily on dataset size, noise level, and problem domain"],
  prerequisites: ["train-test-split"],
  related: ["bias-variance-tradeoff", "regularization-l1-l2", "cross-validation", "dl-regularization"],
  diagram: `flowchart TD
    A["Train model"] --> B["Measure train error"]
    A --> C["Measure validation error"]
    B --> D{"Compare errors"}
    C --> D
    D -->|"both high"| E["Underfitting"]
    D -->|"train low, val high"| F["Overfitting"]
    D -->|"both low and close"| G(["Good fit"])
    E --> H["More features, more complex model, less regularization"]
    F --> I["More data, regularization, simpler model, early stopping"]
    H --> A
    I --> A`,
  codeSnippet: `from sklearn.model_selection import learning_curve
import numpy as np

# Learning Curve: The best visual diagnostic for overfitting vs underfitting
train_sizes, train_scores, val_scores = learning_curve(
    model, X, y, cv=5,
    train_sizes=np.linspace(0.1, 1.0, 10),
    scoring='accuracy'
)

print("Training Accuracy:  ", train_scores.mean(axis=1).round(3))
print("Validation Accuracy:", val_scores.mean(axis=1).round(3))
print()

gap = train_scores.mean(axis=1)[-1] - val_scores.mean(axis=1)[-1]
if gap > 0.1:
    print("⚠️ OVERFITTING: Large gap between train and validation scores")
elif train_scores.mean(axis=1)[-1] < 0.7:
    print("⚠️ UNDERFITTING: Both scores are low")
else:
    print("✅ GOOD FIT: Scores are high and close together")`
};
