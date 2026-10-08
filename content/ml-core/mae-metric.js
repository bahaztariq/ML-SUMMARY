export default {
  id: "mae-metric",
  name: "Mean Absolute Error (MAE)",
  track: "ml-core",
  category: "Evaluation Metrics",
  task: ["Regression", "Metrics", "Evaluation"],
  difficulty: "Beginner",
  summary: "The arithmetic mean of all absolute differences between predicted and actual values. Each error contributes proportionally, regardless of magnitude.",
  intuition: "The Fair Judge: Unlike RMSE which goes crazy over one big mistake, MAE treats every error equally. If 100 predictions are off by $5 and one is off by $500, MAE won't let that single outlier dominate.",
  whenToUse: "When all errors should be weighted equally. When your dataset contains extreme outliers that should not disproportionately influence model evaluation.",
  whenToAvoid: "When large errors are truly catastrophic and must be penalized more heavily (use RMSE or custom weighted loss).",
  requirements: {
    regressionMetric: true,
    outlierRobust: true,
    linearPenalty: true
  },
  parameters: [
    {
      name: "Robustness to Outliers",
      type: "property",
      default: "Linear penalty",
      impact: "An error of 100 contributes exactly 100 (not 10,000 like in MSE).",
      tuningTip: "Preferred metric for real estate, financial, and IoT time-series models with spike noise."
    },
    {
      name: "Median Absolute Error",
      type: "variant",
      default: "Even more robust",
      impact: "Uses the median instead of mean, completely immune to any number of extreme outliers.",
      tuningTip: "Use sklearn's median_absolute_error for extremely noisy datasets."
    }
  ],
  math: {
    formula: "MAE = (1/n) ∑ᵢ |yᵢ - ŷᵢ|",
    loss: "L1 Loss / Mean Absolute Deviation",
    explanation: "Takes absolute value of each residual (removing sign), then averages. No squaring means outliers have proportional influence rather than exponential."
  },
  pros: [
    "Highly robust to extreme outlier errors in the dataset",
    "Easy to interpret: 'On average, predictions are off by X units'",
    "Same units as the target variable"
  ],
  cons: [
    "The absolute value function is not differentiable at zero (requires subgradients)",
    "Treats all errors equally, which may not reflect real-world cost asymmetries"
  ],
  prerequisites: ["what-is-regression", "loss-vs-cost-function"],
  related: ["rmse-metric", "r2-score", "time-series-cv"],
  diagram: `flowchart LR
    A["Actual values y"] --> C["Residual = y − ŷ"]
    B["Predictions ŷ"] --> C
    C --> D["Take absolute value abs(y − ŷ)"]
    D --> E["Sum over n samples"]
    E --> F["Divide by n"]
    F --> G(["MAE in target units"])`,
  codeSnippet: `from sklearn.metrics import mean_absolute_error, median_absolute_error

y_actual =    [100, 200, 300, 400, 500]
y_predicted = [110, 190, 310, 380, 520]

mae = mean_absolute_error(y_actual, y_predicted)
med_ae = median_absolute_error(y_actual, y_predicted)

print(f"MAE: {mae:.2f}")
print(f"Median AE: {med_ae:.2f} (even more robust to outliers)")`
};
