export default {
  id: "linear-regression",
  name: "Linear Regression (OLS & Regularized)",
  track: "ml-models",
  category: "Linear Models",
  task: ["Regression"],
  difficulty: "Beginner",
  summary: "Models the scalar relationship between continuous dependent target and one or more explanatory features using a linear equation.",
  intuition: "Finding the best-fitting straight line (or flat hyperplane) that minimizes the sum of squared vertical distances from all data points to the line.",
  whenToUse: "Baseline benchmark for continuous numerical targets; when business stakeholders require transparent impact coefficients per unit feature.",
  whenToAvoid: "When target variable has complex curved relationships, multi-modality, or heavy skewed anomalies.",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: true,
    linearRelationship: true
  },
  parameters: [
    {
      name: "alpha (Ridge/Lasso)",
      type: "float",
      default: "1.0",
      impact: "Regularization strength multiplier.",
      tuningTip: "Higher alpha shrinks coefficients closer to zero to combat collinearity and overfitting."
    },
    {
      name: "fit_intercept",
      type: "bool",
      default: "True",
      impact: "Whether to calculate the intercept (bias term b) for this model.",
      tuningTip: "Keep True unless your data is already centered around zero."
    }
  ],
  math: {
    formula: "ŷ = w₁x₁ + w₂x₂ + ... + wₙxₙ + b = Xw",
    loss: "MSE: (1/n)∑(y - ŷ)² + λ||w||₂² (Ridge) or λ||w||₁ (Lasso)",
    explanation: "Ordinary Least Squares finds the closed-form analytical solution w = (XᵀX)⁻¹Xᵀy. Ridge adds a diagonal penalty to guarantee matrix invertibility even under severe multicollinearity."
  },
  pros: [
    "Simple to implement, interpret, and mathematically understand",
    "Analytical closed-form solution exists without iterative training loops",
    "Provides statistical significance tests (p-values, t-stats, R-squared)"
  ],
  cons: [
    "Severely thrown off by extreme outlier observations",
    "Prone to massive multicollinearity problems if features are correlated",
    "Underfits heavily when target behavior is non-linear"
  ],
  prerequisites: ["what-is-regression", "what-is-gradient-descent", "linear-algebra"],
  related: ["logistic-regression", "regularization-l1-l2", "r2-score", "time-series-forecasting"],
  diagram: `flowchart TD
    A[("Features X, numeric target y")] --> B["Add bias column, optional scaling"]
    B --> C{"Solver?"}
    C -->|"closed form"| D["Normal equation: θ = (XᵀX)⁻¹Xᵀy"]
    C -->|"iterative"| E["Gradient descent on MSE"]
    E --> F["Update θ ← θ − α · ∇MSE"]
    F --> G{"Converged?"}
    G -->|"no"| E
    G -->|"yes"| H["Fitted coefficients θ"]
    D --> H
    H --> I["Prediction ŷ = Xθ"]
    I --> J(["Evaluate with RMSE / R², check residuals"])`,
  codeSnippet: `from sklearn.linear_model import RidgeCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

# RidgeCV automatically finds optimal alpha via efficient cross-validation
model = make_pipeline(
    StandardScaler(),
    RidgeCV(alphas=[0.01, 0.1, 1.0, 10.0, 100.0])
)
model.fit(X_train, y_train)
print(f"Optimal Alpha: {model.named_steps['ridgecv'].alpha_}")`
};
