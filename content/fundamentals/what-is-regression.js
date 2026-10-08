export default {
  id: "what-is-regression",
  name: "What is Regression?",
  track: "fundamentals",
  category: "Core Tasks",
  task: ["Definition", "Regression", "Supervised"],
  difficulty: "Beginner",
  summary: "A supervised learning task where an algorithm learns to predict a continuous, quantity-based real number (scalar) based on one or more explanatory input features.",
  intuition: "Reading a Speedometer: Unlike a light switch that is either strictly ON or OFF (Classification), regression is like a dimmer dial or car speedometer that can measure any value: 45.2 mph, 68.0 mph, or 104.7 mph.",
  whenToUse: "When the prediction target is a quantitative amount: estimating property valuations ($), product demand counts, patient blood pressure, delivery times in minutes, or stock prices.",
  whenToAvoid: "When the target is a category or discrete choice (e.g. pass/fail or product brand — use Classification!).",
  requirements: {
    labeledContinuousTarget: true,
    evaluatesWithResiduals: true,
    sensitiveToScaleInLinear: true,
    unboundedNumericOutput: true
  },
  parameters: [
    {
      name: "Mean Squared Error (MSE)",
      type: "metric / loss",
      default: "(y - ŷ)²",
      impact: "Penalizes large prediction mistakes aggressively due to squaring.",
      tuningTip: "Use when big errors are catastrophic to your business."
    },
    {
      name: "Mean Absolute Error (MAE)",
      type: "metric / loss",
      default: "|y - ŷ|",
      impact: "Linear error penalty; much more robust to extreme outlier records.",
      tuningTip: "Use when data has anomalous spikes that shouldn't derail the model."
    },
    {
      name: "R-Squared (R²)",
      type: "metric",
      default: "[0.0 to 1.0]",
      impact: "The proportion of variance in the target variable explained by the model.",
      tuningTip: "1.0 means perfect predictions; 0.0 means no better than predicting the mean."
    }
  ],
  math: {
    formula: "ŷ = f(X) ∈ ℝ  (Continuous Real Number)   |   Residual: e_i = y_i - ŷ_i",
    loss: "MSE = (1/n) ∑ (y_i - ŷ_i)²   |   MAE = (1/n) ∑ |y_i - ŷ_i|",
    explanation: "Regression fits a curve through the training points such that the average distance (residual) between actual values and predicted values is minimized."
  },
  pros: [
    "Provides exact numerical forecasts that directly drive financial and logistical planning",
    "Model residuals can be easily plotted to diagnose non-linear patterns or heteroskedasticity",
    "Linear regression coefficients provide direct dollar-for-dollar interpretability"
  ],
  cons: [
    "Highly vulnerable to extreme outliers skewing the regression curve",
    "Cannot extrapolate trends accurately outside the min/max range seen in training data"
  ],
  prerequisites: ["supervised-vs-unsupervised"],
  related: ["what-is-classification", "linear-regression", "rmse-metric", "r2-score"],
  diagram: `flowchart LR
    A[("Features X + numeric target y")] --> B["Choose model family"]
    B --> C["Fit: minimize squared / absolute error"]
    C --> D["Learned function f(x)"]
    N["New sample x"] --> E["Predict continuous ŷ = f(x)"]
    D --> E
    E --> F["Residuals y − ŷ on test set"]
    F --> G["Metrics: MAE, RMSE, R²"]
    G --> H{"Error acceptable?"}
    H -->|"no"| B`,
  codeSnippet: `from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# House features: [Square Footage, Bedrooms] -> Target: Price ($)
X = [[1200, 2], [1800, 3], [2400, 4], [3000, 5]]
y = [250000, 340000, 430000, 520000]

reg = LinearRegression()
reg.fit(X, y)

new_house = [[2100, 3]]
predicted_price = reg.predict(new_house)[0]
print(f"Predicted Price: \${predicted_price:,.2f}")`
};
