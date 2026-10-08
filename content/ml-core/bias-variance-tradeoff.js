export default {
  id: "bias-variance-tradeoff",
  name: "Bias-Variance Tradeoff",
  track: "ml-core",
  category: "ML Theory & Diagnostics",
  task: ["Diagnostics", "Generalization", "Model Tuning"],
  difficulty: "Beginner",
  summary: "The fundamental conflict in machine learning between a model's ability to minimize error on the training set (bias) versus its stability across unseen test sets (variance).",
  intuition: "The Archer's Dilemma: High Bias is aiming consistently at the wrong target (underfitting). High Variance is shaking hands, hitting all over the place (overfitting). You want low bias and low variance.",
  whenToUse: "Diagnosing whether your model underfits or overfits by comparing Training Error vs Validation Error.",
  whenToAvoid: "N/A (This is a foundational law of all statistical learning algorithms).",
  requirements: {
    diagnosticPrinciple: true,
    guidesRegularization: true
  },
  parameters: [
    {
      name: "Model Complexity",
      type: "conceptual",
      default: "Balanced",
      impact: "Determines flexibility of the model hypothesis space.",
      tuningTip: "If Training Error is high -> High Bias (increase complexity). If Training Error is low but Validation Error is high -> High Variance (regularize, add data)."
    }
  ],
  math: {
    formula: "E[(y - ŷ)²] = [Bias(ŷ)]² + Var(ŷ) + σ² (Irreducible Error)",
    loss: "Decomposition of Expected Prediction Error",
    explanation: "Irreducible error $\\sigma^2$ is intrinsic noise in the data universe. You can only trade off between Bias (erroneous model assumptions) and Variance (excessive sensitivity to small fluctuations in training data)."
  },
  pros: [
    "Provides the ultimate conceptual roadmap for diagnosing model failure modes",
    "Directly informs whether you need more data, regularization, or a more expressive model"
  ],
  cons: [
    "Cannot be directly computed analytically for complex real-world models (must estimate via cross-validation)"
  ],
  prerequisites: ["overfitting-underfitting", "probability-statistics"],
  related: ["regularization-l1-l2", "ensemble-methods", "cross-validation", "hyperparameter-tuning"],
  diagram: `flowchart TD
    A["Model complexity knob"] --> B{"Too simple or too complex?"}
    B -->|"too simple"| C["High bias: misses true pattern"]
    B -->|"too complex"| D["High variance: memorizes noise"]
    C --> E["Underfitting: high train and test error"]
    D --> F["Overfitting: low train, high test error"]
    E --> G["Total error = Bias² + Variance + Noise"]
    F --> G
    G --> H["Tune complexity with validation curve"]
    H --> I(["Sweet spot: minimum test error"])`,
  codeSnippet: `# Diagnostic Heuristic in Code
def diagnose_model(train_score, val_score, threshold=0.08):
    if train_score < 0.70:
        return "HIGH BIAS (Underfitting): Model is too simple. Add features, decrease regularization."
    elif (train_score - val_score) > threshold:
        return "HIGH VARIANCE (Overfitting): Model memorized training noise. Add data, increase regularization."
    else:
        return "HEALTHY GENERALIZATION: Model is well balanced!"`
};
