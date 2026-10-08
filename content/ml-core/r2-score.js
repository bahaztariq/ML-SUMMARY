export default {
  id: "r2-score",
  name: "R² Score (Coefficient of Determination)",
  track: "ml-core",
  category: "Evaluation Metrics",
  task: ["Regression", "Metrics", "Evaluation"],
  difficulty: "Beginner",
  summary: "Measures the proportion of variance in the dependent variable that is predictable from the independent variables. Ranges from -∞ to 1.0, where 1.0 means perfect predictions.",
  intuition: "The Report Card Grade: R² = 0.85 means your model explains 85% of why the target varies. The remaining 15% is unexplained noise, missing features, or randomness your model cannot capture.",
  whenToUse: "Comparing models on the same dataset. Understanding how much of the target's behavior is captured by your features.",
  whenToAvoid: "Comparing models across different datasets (R² is dataset-dependent). Also misleading for non-linear models evaluated on tiny samples.",
  requirements: {
    regressionMetric: true,
    normalizedScore: true,
    comparedToMeanBaseline: true
  },
  parameters: [
    {
      name: "R² = 1.0",
      type: "interpretation",
      default: "Perfect",
      impact: "Model predictions exactly match all actual values with zero residual error.",
      tuningTip: "Suspiciously perfect R² (0.99+) often indicates data leakage or overfitting."
    },
    {
      name: "R² = 0.0",
      type: "interpretation",
      default: "Baseline",
      impact: "Model performs no better than simply predicting the mean of y for every single observation.",
      tuningTip: "Your features provide zero predictive information beyond the average."
    },
    {
      name: "R² < 0",
      type: "interpretation",
      default: "Worse than mean",
      impact: "Model performs WORSE than the trivial mean-baseline. Actively harmful predictions.",
      tuningTip: "Indicates a fundamentally broken model, wrong features, or severe overfitting."
    },
    {
      name: "Adjusted R²",
      type: "variant",
      default: "Penalizes extra features",
      impact: "Adjusts R² downward when adding features that do not genuinely improve predictions.",
      tuningTip: "Use Adjusted R² when comparing models with different numbers of features to avoid rewarding complexity."
    }
  ],
  math: {
    formula: "R² = 1 - ( SS_res / SS_tot )  where SS_res = ∑(yᵢ - ŷᵢ)²  and  SS_tot = ∑(yᵢ - ȳ)²",
    loss: "Proportion of Explained Variance",
    explanation: "SS_tot is the total variance of y (how spread out the actual values are). SS_res is the leftover error after modeling. R² computes what fraction of total spread your model successfully explains."
  },
  pros: [
    "Scale-independent: can compare performance across targets with different units",
    "Intuitive interpretation as percentage of variance explained",
    "Built into virtually every regression evaluation library"
  ],
  cons: [
    "Always increases (or stays same) when adding more features, even useless ones (use Adjusted R²)",
    "Can be misleading when the true relationship is non-linear but appears high due to scale"
  ],
  prerequisites: ["what-is-regression", "rmse-metric"],
  related: ["mae-metric", "linear-regression"],
  diagram: `flowchart TD
    A["Actual values y"] --> B["Baseline: predict the mean ȳ"]
    B --> C["SS_tot = Σ(y − ȳ)²"]
    A --> D["Model predictions ŷ"]
    D --> E["SS_res = Σ(y − ŷ)²"]
    C --> F["R² = 1 − SS_res / SS_tot"]
    E --> F
    F --> G{"Value?"}
    G -->|"1"| H["Perfect fit"]
    G -->|"0"| I["No better than the mean"]
    G -->|"below 0"| J["Worse than the mean"]`,
  codeSnippet: `from sklearn.metrics import r2_score

y_actual =    [100, 200, 300, 400, 500]
y_predicted = [110, 190, 310, 380, 520]

r2 = r2_score(y_actual, y_predicted)
print(f"R² Score: {r2:.4f}")
print(f"Interpretation: Model explains {r2*100:.1f}% of target variance")`
};
