export default {
  id: "regularization-l1-l2",
  name: "Regularization (L1 Lasso & L2 Ridge)",
  track: "ml-core",
  category: "ML Theory & Optimization",
  task: ["Regularization", "Overfitting Prevention", "Feature Selection"],
  difficulty: "Intermediate",
  summary: "Penalty terms added to the model's cost function that constrain the magnitude of learned weights, preventing overfitting by discouraging unnecessary model complexity.",
  intuition: "Speed Limit on a Highway: Without regularization, a model is a race car with no speed limits (weights can grow astronomically large to fit noise). Regularization installs speed bumps (penalties on weight magnitude) that slow down the model and prevent reckless overfitting.",
  whenToUse: "When your model overfits (training accuracy >> validation accuracy). When you have more features than samples. When you suspect many features are irrelevant.",
  whenToAvoid: "When your model underfits (both training and validation accuracy are low). Regularization would make underfitting worse by restricting the model further.",
  requirements: {
    preventsOverfitting: true,
    addsToLossFunction: true,
    controlledByHyperparameter: true
  },
  parameters: [
    {
      name: "L1 (Lasso) Penalty: λ · ∑|wⱼ|",
      type: "regularizer",
      default: "Sparsity inducing",
      impact: "Drives uninformative feature weights exactly to zero, performing automatic feature selection.",
      tuningTip: "Use L1 when you suspect most features are irrelevant and want to find the vital few."
    },
    {
      name: "L2 (Ridge) Penalty: λ · ∑wⱼ²",
      type: "regularizer",
      default: "Weight shrinkage",
      impact: "Shrinks all weights toward zero proportionally, but never exactly to zero.",
      tuningTip: "Use L2 when all features are potentially relevant and you want to spread influence across them."
    },
    {
      name: "Elastic Net: α·L1 + (1-α)·L2",
      type: "combination",
      default: "Best of both",
      impact: "Combines L1 sparsity with L2 stability. Controls the mix with parameter α.",
      tuningTip: "Use when you have groups of correlated features and want both selection and stability."
    },
    {
      name: "λ (alpha) — Regularization Strength",
      type: "hyperparameter",
      default: "1.0",
      impact: "Controls penalty intensity. λ=0 means no regularization. λ→∞ drives all weights to zero.",
      tuningTip: "Tune via cross-validation. Search log-scale: [0.0001, 0.001, 0.01, 0.1, 1, 10, 100]."
    }
  ],
  math: {
    formula: "J_regularized(θ) = (1/n)∑ Loss(ŷᵢ, yᵢ) + λ · R(w)  where R = ||w||₁ (L1) or ||w||₂² (L2)",
    loss: "Constrained Optimization",
    explanation: "The added penalty R(w) creates a tradeoff: the model must simultaneously minimize prediction error AND keep weights small. This prevents memorization of training noise by restricting the hypothesis space."
  },
  pros: [
    "Dramatically reduces overfitting on high-dimensional or noisy datasets",
    "L1 provides automatic feature selection by zeroing out useless weights",
    "L2 guarantees unique solutions even when features are correlated (fixes multicollinearity)"
  ],
  cons: [
    "Introduces an additional hyperparameter (λ) that must be tuned via cross-validation",
    "L1 solutions are non-unique when features are perfectly correlated",
    "Can cause underfitting if λ is set too high"
  ],
  prerequisites: ["overfitting-underfitting", "loss-vs-cost-function"],
  related: ["feature-selection", "bias-variance-tradeoff", "linear-regression", "dl-regularization"],
  diagram: `flowchart TD
    A["Original loss (e.g. MSE)"] --> B["Add penalty × λ"]
    B --> C{"Penalty type"}
    C -->|"L1: λ·Σ abs(w)"| D["Constant pull toward zero"]
    C -->|"L2: λ·Σ w²"| E["Pull proportional to weight size"]
    D --> F["Many weights exactly 0 → feature selection"]
    E --> G["All weights shrink smoothly"]
    F --> H["Lower variance, slightly higher bias"]
    G --> H
    H --> I(["Tune λ with cross-validation"])`,
  codeSnippet: `from sklearn.linear_model import Lasso, Ridge, ElasticNet
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

# L1: Lasso (Feature Selection via Sparsity)
lasso = make_pipeline(StandardScaler(), Lasso(alpha=0.1))
lasso.fit(X_train, y_train)
print(f"Lasso Non-Zero Coefficients: {sum(lasso[-1].coef_ != 0)} / {len(lasso[-1].coef_)}")

# L2: Ridge (Weight Shrinkage)
ridge = make_pipeline(StandardScaler(), Ridge(alpha=1.0))
ridge.fit(X_train, y_train)

# Elastic Net (Combined L1 + L2)
enet = make_pipeline(StandardScaler(), ElasticNet(alpha=0.1, l1_ratio=0.5))
enet.fit(X_train, y_train)`
};
