export default {
  id: "loss-vs-cost-function",
  name: "Loss Function vs Cost Function",
  track: "fundamentals",
  category: "Math & Optimization",
  task: ["Definition", "Foundations", "Optimization"],
  difficulty: "Beginner",
  summary: "The mathematical error metrics that quantify how wrong a model's predictions are compared to actual ground truth. Loss measures a single sample; Cost measures the entire dataset.",
  intuition: "The Compass of Machine Learning: Training a model is like steering a ship in thick fog. You cannot see the destination directly. The Cost Function is your compass needle: it tells you whether your ship is currently drifting closer to or farther away from port.",
  whenToUse: "Mandatory for every single machine learning and deep learning algorithm that uses optimization to learn its parameters.",
  whenToAvoid: "N/A (Without an error function, an algorithm has no mathematical objective to improve).",
  requirements: {
    differentiableForGradients: true,
    lowerIsBetter: true,
    guidesParameterUpdates: true
  },
  parameters: [
    {
      name: "Loss Function L(ŷ, y)",
      type: "scope",
      default: "Single Example",
      impact: "Computes the error for an individual prediction: e.g. L(ŷ_i, y_i).",
      tuningTip: "Binary Cross-Entropy for 1 sample: -[y·log(ŷ) + (1-y)·log(1-ŷ)]."
    },
    {
      name: "Cost Function J(θ)",
      type: "scope",
      default: "Full Dataset",
      impact: "The arithmetic mean (or sum) of the individual losses across all N training samples.",
      tuningTip: "J(θ) = (1/N) ∑ L(ŷ_i, y_i) + Regularization Penalty."
    }
  ],
  math: {
    formula: "Cost J(θ) = (1/N) ∑_{i=1}^N Loss( f(x_i; θ), y_i )",
    loss: "Empirical Risk Formulation",
    explanation: "Optimization algorithms (like Gradient Descent) compute the gradient with respect to the Cost Function J(θ) to nudge weights in the direction that lowers total error."
  },
  pros: [
    "Translates qualitative business goals ('make fewer mistakes') into rigorous calculus",
    "Custom loss functions allow penalizing specific business risks (e.g. 10x penalty for false negatives)"
  ],
  cons: [
    "Loss function must be mathematically smooth and differentiable for gradient-based methods (accuracy cannot be used directly as a loss because its derivative is zero everywhere!)"
  ],
  prerequisites: ["what-is-ml"],
  related: ["what-is-gradient-descent", "log-loss", "rmse-metric", "regularization-l1-l2"],
  diagram: `flowchart TD
    A["Sample 1: y₁ vs ŷ₁"] --> L1["Loss L₁"]
    B["Sample 2: y₂ vs ŷ₂"] --> L2["Loss L₂"]
    C["Sample n: yₙ vs ŷₙ"] --> L3["Loss Lₙ"]
    L1 --> J["Cost J(θ) = average of all losses"]
    L2 --> J
    L3 --> J
    R["Optional regularization penalty"] --> J
    J --> G["Gradient ∇J(θ)"]
    G --> U["Update parameters θ"]
    U -.->|"new predictions"| A`,
  codeSnippet: `import numpy as np

# 1. Loss Function (Calculated on 1 single sample)
def single_sample_squared_loss(y_true, y_pred):
    return (y_true - y_pred) ** 2

# 2. Cost Function (Average loss across entire dataset)
def mean_squared_cost(y_true_array, y_pred_array):
    losses = (y_true_array - y_pred_array) ** 2
    return np.mean(losses)

y_actual = np.array([10.0, 20.0, 30.0])
y_predicted = np.array([12.0, 18.0, 35.0])
print(f"Total Cost J(theta): {mean_squared_cost(y_actual, y_predicted):.2f}")`
};
