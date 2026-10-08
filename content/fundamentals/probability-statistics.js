export default {
  id: "probability-statistics",
  name: "Probability & Statistics Primer",
  track: "fundamentals",
  category: "Math & Optimization",
  task: ["Definition", "Evaluation"],
  difficulty: "Beginner",
  summary: "The mathematical language of uncertainty — distributions, expectation, variance, conditional probability, Bayes' theorem and hypothesis testing — that underpins how ML models learn from noisy data and how we judge their results.",
  intuition: "The Weather Forecaster: A forecaster never says 'it will rain' — they say '70% chance of rain', based on how often similar conditions led to rain before (probability), and they check whether their 70% days really rain about 70% of the time (statistics). ML models are forecasters for any kind of outcome.",
  whenToUse: "Understanding loss functions (log-loss is negative log-likelihood), probabilistic models (Naive Bayes, GMM), evaluating whether a model improvement is real (confidence intervals, A/B tests), and detecting drift (KS test, PSI).",
  whenToAvoid: "Never skip it — but avoid relying on p-values alone when samples are huge (everything becomes 'significant'); look at effect sizes too.",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: true,
    assumesIndependentSamples: true
  },
  parameters: [
    {
      name: "Mean / Variance",
      type: "concept",
      default: "μ = E[X], σ² = E[(X−μ)²]",
      impact: "Summarize the center and spread of a distribution; basis of standardization and many losses.",
      tuningTip: "With heavy outliers, prefer median and IQR as robust alternatives."
    },
    {
      name: "Probability Distribution",
      type: "concept",
      default: "Normal, Bernoulli, Poisson",
      impact: "Describes how likely each value is; models assume one (e.g. linear regression assumes Gaussian noise).",
      tuningTip: "Plot histograms first — skewed data often needs a log transform."
    },
    {
      name: "Bayes' Theorem",
      type: "concept",
      default: "P(A|B) = P(B|A)·P(A)/P(B)",
      impact: "Updates a prior belief with evidence; the core of Naive Bayes and Bayesian methods.",
      tuningTip: "Remember base rates: a 99%-accurate test on a 1% prevalence disease still yields many false positives."
    },
    {
      name: "Significance Level (α)",
      type: "float",
      default: "0.05",
      impact: "Threshold for rejecting the null hypothesis in a statistical test.",
      tuningTip: "Correct for multiple comparisons (Bonferroni) when testing many features or variants."
    }
  ],
  math: {
    formula: "P(θ | D) = P(D | θ) · P(θ) / P(D)      θ̂_MLE = argmax_θ Σ log P(xᵢ | θ)",
    loss: "Bayes' Rule & Maximum Likelihood",
    explanation: "Bayes' rule combines prior belief P(θ) with the likelihood of observed data to get the posterior. Maximum Likelihood Estimation picks parameters that make the observed data most probable — minimizing MSE is MLE under Gaussian noise, and minimizing log-loss is MLE for Bernoulli labels."
  },
  pros: [
    "Explains WHY common losses (MSE, cross-entropy) are the right choice",
    "Lets you quantify uncertainty with confidence intervals instead of single numbers",
    "Provides rigorous tools (hypothesis tests) to decide if model A is really better than B"
  ],
  cons: [
    "Many tests assume independence and normality, often violated in real data",
    "p-values are frequently misinterpreted as 'probability the hypothesis is true'",
    "Correlation found in data does not imply causation"
  ],
  prerequisites: [],
  related: ["linear-algebra", "naive-bayes", "log-loss", "ab-testing-deployment"],
  diagram: `flowchart TD
    A[("Observed sample data")] --> B["Descriptive stats: mean, variance, histogram"]
    B --> C{"Which distribution fits?"}
    C -->|"continuous"| D["Normal / Exponential"]
    C -->|"binary or counts"| E["Bernoulli / Poisson"]
    D --> F["Estimate parameters via MLE"]
    E --> F
    P["Prior belief P(θ)"] --> G["Bayes' rule → posterior P(θ | data)"]
    F --> G
    F --> H["Hypothesis test / confidence interval"]
    H --> I{"p-value ≤ α ?"}
    I -->|"yes"| J["Effect is likely real"]
    I -->|"no"| K["Could be random noise"]`,
  codeSnippet: `import numpy as np
from scipy import stats

rng = np.random.default_rng(42)

# 1. Descriptive statistics
x = rng.normal(loc=50, scale=10, size=1_000)
print(f"mean={x.mean():.2f}  std={x.std(ddof=1):.2f}  median={np.median(x):.2f}")

# 2. Bayes' theorem: disease test example
p_disease = 0.01          # prior (base rate)
p_pos_given_d = 0.99      # sensitivity
p_pos_given_not_d = 0.05  # false positive rate
p_pos = p_pos_given_d * p_disease + p_pos_given_not_d * (1 - p_disease)
print(f"P(disease | positive) = {p_pos_given_d * p_disease / p_pos:.3f}")  # ~0.167!

# 3. 95% confidence interval for the mean
ci = stats.t.interval(0.95, df=len(x) - 1, loc=x.mean(), scale=stats.sem(x))
print("95% CI:", np.round(ci, 2))

# 4. Hypothesis test: are model A's errors lower than model B's?
errors_a = rng.normal(4.8, 1.0, 200)
errors_b = rng.normal(5.0, 1.0, 200)
t_stat, p_value = stats.ttest_ind(errors_a, errors_b)
print(f"t={t_stat:.2f}, p={p_value:.4f} ->", "significant" if p_value < 0.05 else "not significant")`
};
