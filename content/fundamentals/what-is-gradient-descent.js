export default {
  id: "what-is-gradient-descent",
  name: "What is Gradient Descent?",
  track: "fundamentals",
  category: "Math & Optimization",
  task: ["Definition", "Optimization", "Foundations"],
  difficulty: "Beginner",
  summary: "The workhorse iterative optimization algorithm used to train machine learning and neural network models by repeatedly stepping in the direction of steepest downward descent of the cost function.",
  intuition: "Walking Down a Foggy Mountain Blindfolded: You are on top of a mountain in thick fog. You cannot see the valley floor. To find the bottom, you feel the slope of the ground with your boots and take a step in the direction that slopes downwards the steepest. Repeat until the ground is flat.",
  whenToUse: "Training models with parameters that cannot be solved with closed-form matrix inversion: Logistic Regression, Multi-Layer Perceptrons, CNNs, Transformers, Deep Reinforcement Learning.",
  whenToAvoid: "When exact analytical closed-form formulas exist for small datasets (e.g. OLS Linear Regression $(X^TX)^{-1}X^Ty$).",
  requirements: {
    differentiableCostFunction: true,
    requiresLearningRateTuning: true,
    iterativeConvergence: true
  },
  parameters: [
    {
      name: "Learning Rate (α / lr)",
      type: "hyperparameter",
      default: "0.001 - 0.01",
      impact: "Step size taken in the direction of the negative gradient.",
      tuningTip: "Too high: overshoots and diverges to infinity. Too low: takes millions of iterations to converge."
    },
    {
      name: "Batch Gradient Descent",
      type: "variant",
      default: "Full dataset",
      impact: "Calculates gradient using all N samples before every step. Very stable, but slow on big data.",
      tuningTip: "Great for small convex problems."
    },
    {
      name: "Stochastic Gradient Descent (SGD)",
      type: "variant",
      default: "1 sample per step",
      impact: "Calculates gradient on 1 random sample. Very fast, but noisy trajectory.",
      tuningTip: "Can escape local minima easily."
    },
    {
      name: "Mini-Batch SGD (Standard)",
      type: "variant",
      default: "32 to 512 samples",
      impact: "Calculates gradient on small batches. Combines hardware vectorization speed with stability.",
      tuningTip: "The universal industry standard for training modern deep learning."
    }
  ],
  math: {
    formula: "θ_new = θ_old - α · ∇_θ J(θ)",
    loss: "First-Order Iterative Optimization",
    explanation: "The gradient vector $\\nabla J(\\theta)$ points in the direction of steepest ascent (fastest increase in cost). Subtracting the gradient multiplied by step size $\\alpha$ moves parameters toward the minimum cost."
  },
  pros: [
    "Scales effortlessly to models with billions of parameters (like GPT-4)",
    "Universal optimizer applicable to almost any differentiable loss landscape"
  ],
  cons: [
    "Can get trapped in sub-optimal local minima or flat saddle points",
    "Sensitive to learning rate choice (mitigated by adaptive optimizers like Adam)"
  ],
  prerequisites: ["loss-vs-cost-function", "linear-algebra"],
  related: ["dl-optimizers", "linear-regression", "feature-scaling", "hyperparameter-tuning"],
  diagram: `flowchart TD
    A(["Initialize parameters θ randomly"]) --> B["Sample a mini-batch"]
    B --> C["Forward pass: compute predictions"]
    C --> D["Compute cost J(θ)"]
    D --> E["Compute gradient ∇J(θ)"]
    E --> F["Update: θ ← θ − α·∇J(θ)"]
    F --> G{"Converged or max epochs?"}
    G -->|"no"| B
    G -->|"yes"| H(["Final trained parameters"])`,
  codeSnippet: `# Vanilla Gradient Descent from Scratch in 10 lines
import numpy as np

# Find minimum of J(w) = w^2 (True minimum is at w = 0)
w = 10.0          # Initial starting weight
learning_rate = 0.1

for step in range(25):
    gradient = 2 * w                 # dJ/dw = 2w
    w = w - (learning_rate * gradient) # Gradient update rule
    cost = w ** 2
    if step % 5 == 0:
        print(f"Step {step}: Weight = {w:.4f}, Cost = {cost:.4f}")`
};
