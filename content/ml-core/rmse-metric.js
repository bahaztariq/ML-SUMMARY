export default {
  id: "rmse-metric",
  name: "Root Mean Squared Error (RMSE)",
  track: "ml-core",
  category: "Evaluation Metrics",
  task: ["Regression", "Metrics", "Evaluation"],
  difficulty: "Beginner",
  summary: "The square root of the average of squared differences between predicted and actual values. Expressed in the same units as the target variable, making it directly interpretable.",
  intuition: "The Average Mistake Ruler: MSE squares errors, making them hard to interpret (e.g., 'dollars squared'). RMSE takes the square root to convert back to the original unit: '$45.20 average prediction error'.",
  whenToUse: "The most popular regression metric. Use when large errors are disproportionately costly (e.g., predicting house prices where a $100K error is much worse than two $50K errors).",
  whenToAvoid: "When outlier errors should NOT be penalized more than small errors (use MAE instead).",
  requirements: {
    regressionMetric: true,
    penalizesLargeErrors: true,
    sameUnitsAsTarget: true
  },
  parameters: [
    {
      name: "Squaring Effect",
      type: "property",
      default: "Quadratic penalty",
      impact: "Errors of 10 contribute 100 to MSE; errors of 1 contribute only 1. Large outliers dominate.",
      tuningTip: "If your data has extreme outliers, consider MAE or Huber Loss instead."
    },
    {
      name: "Comparison with MAE",
      type: "diagnostic",
      default: "RMSE ≥ MAE always",
      impact: "When RMSE >> MAE, it signals the presence of large outlier prediction errors.",
      tuningTip: "Track both RMSE and MAE together to diagnose whether errors are uniformly distributed."
    }
  ],
  math: {
    formula: "RMSE = √( (1/n) ∑ᵢ (yᵢ - ŷᵢ)² )",
    loss: "Root of Mean Squared Error",
    explanation: "First computes the mean of squared residuals (MSE), then takes the square root to restore the original measurement unit. This makes RMSE directly comparable to the target variable scale."
  },
  pros: [
    "Same physical units as the target variable (dollars, kg, minutes)",
    "Heavily penalizes large prediction mistakes, which is desirable in safety-critical applications",
    "The most widely reported regression metric in academic papers and Kaggle competitions"
  ],
  cons: [
    "Extremely sensitive to outlier observations (a single huge error can inflate RMSE dramatically)",
    "Not robust for skewed error distributions"
  ],
  prerequisites: ["what-is-regression", "mae-metric"],
  related: ["r2-score", "loss-vs-cost-function", "linear-regression"],
  diagram: `flowchart LR
    A["Actual y and predicted ŷ"] --> B["Residual y − ŷ"]
    B --> C["Square it (big errors amplified)"]
    C --> D["Mean over n samples = MSE"]
    D --> E["Square root"]
    E --> F(["RMSE in target units"])
    C --> G["Outliers dominate the score"]`,
  codeSnippet: `from sklearn.metrics import mean_squared_error
import numpy as np

y_actual = np.array([100, 200, 300, 400, 500])
y_predicted = np.array([110, 190, 310, 380, 520])

mse = mean_squared_error(y_actual, y_predicted)
rmse = np.sqrt(mse)
# Or in sklearn >= 1.4:
# rmse = mean_squared_error(y_actual, y_predicted, squared=False)

print(f"MSE:  {mse:.2f}")
print(f"RMSE: {rmse:.2f} (same units as target!)")`
};
