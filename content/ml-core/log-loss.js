export default {
  id: "log-loss",
  name: "Log-Loss (Binary Cross-Entropy)",
  track: "ml-core",
  category: "Evaluation Metrics",
  task: ["Classification", "Metrics", "Evaluation", "Optimization"],
  difficulty: "Intermediate",
  summary: "A loss function that measures the performance of a classification model whose output is a probability between 0 and 1. It penalizes confident wrong predictions exponentially more than uncertain ones.",
  intuition: "The Confidence Punisher: If your model says '99% positive' and the truth is negative, Log-Loss gives a catastrophic penalty. If it says '55% positive' and is wrong, the penalty is mild. It rewards well-calibrated humility.",
  whenToUse: "Training and evaluating probabilistic classifiers (Logistic Regression, Neural Networks). When you care about the quality of probability calibration, not just hard label accuracy.",
  whenToAvoid: "When only hard class labels matter and probability quality is irrelevant.",
  requirements: {
    classificationMetric: true,
    probabilisticOutput: true,
    differentiable: true,
    usedAsLossFunction: true
  },
  parameters: [
    {
      name: "Perfect Score",
      type: "value",
      default: "0.0",
      impact: "Log-Loss = 0 when model predicts 100% probability for the correct class every time.",
      tuningTip: "Lower is better. Typical good values range from 0.2 to 0.5."
    },
    {
      name: "Clipping",
      type: "technique",
      default: "clip(ŷ, 1e-15, 1-1e-15)",
      impact: "Prevents log(0) = -∞ numerical explosion.",
      tuningTip: "Sklearn and PyTorch handle this automatically, but be careful in custom implementations."
    }
  ],
  math: {
    formula: "LogLoss = -(1/n) ∑ [ yᵢ · log(ŷᵢ) + (1-yᵢ) · log(1-ŷᵢ) ]",
    loss: "Negative Log-Likelihood / Binary Cross-Entropy",
    explanation: "When y=1, only the term -log(ŷ) activates: high predicted probability gives low loss. When y=0, only -log(1-ŷ) activates. The log function creates an asymptotic penalty curve: confident wrong predictions are punished infinitely more than uncertain ones."
  },
  pros: [
    "Differentiable everywhere, making it perfect as a training loss for gradient descent",
    "Heavily penalizes overconfident incorrect predictions, encouraging calibration",
    "The standard loss function for logistic regression and classification neural networks"
  ],
  cons: [
    "Sensitive to class imbalance (can be mitigated with class weights)",
    "Requires probability outputs, not just hard class labels"
  ],
  prerequisites: ["loss-vs-cost-function", "what-is-classification", "probability-statistics"],
  related: ["logistic-regression", "roc-auc", "precision-recall-f1"],
  diagram: `flowchart TD
    A["Predicted probability p for each sample"] --> B{"True label?"}
    B -->|"y = 1"| C["Penalty = −log(p)"]
    B -->|"y = 0"| D["Penalty = −log(1 − p)"]
    C --> E{"Confident and wrong?"}
    D --> E
    E -->|"yes"| F["Huge penalty (→ ∞)"]
    E -->|"no"| G["Small penalty"]
    F --> H["Average over all samples"]
    G --> H
    H --> I(["Log-loss: lower is better"])`,
  codeSnippet: `from sklearn.metrics import log_loss
import numpy as np

y_true = [1, 0, 1, 1, 0]

# Well-calibrated model
y_pred_good = [0.9, 0.1, 0.8, 0.95, 0.05]
# Overconfident wrong model
y_pred_bad =  [0.9, 0.9, 0.8, 0.2, 0.1]

print(f"Good Model Log-Loss: {log_loss(y_true, y_pred_good):.4f}")
print(f"Bad Model Log-Loss:  {log_loss(y_true, y_pred_bad):.4f}")
# Lower is better!`
};
