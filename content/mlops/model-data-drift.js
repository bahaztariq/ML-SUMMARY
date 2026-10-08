export default {
  id: "model-data-drift",
  name: "Model & Data Drift Monitoring",
  track: "mlops",
  category: "Monitoring & Governance",
  task: ["Production Monitoring", "Drift Detection", "Reliability"],
  difficulty: "Intermediate",
  summary: "Methods to detect when the statistical distribution of input data changes (Data Drift) or when the relationship between inputs and targets shifts over time (Concept Drift).",
  intuition: "Silent Model Rot: A fraud detection model trained in 2019 works brilliantly until 2020 lockdowns completely change consumer shopping behavior overnight without any code crashing.",
  whenToUse: "Mandatory for every production machine learning model deployed to real users.",
  whenToAvoid: "Static closed systems with immutable data distributions (e.g. physics simulations).",
  requirements: {
    continuousTelemetry: true,
    baselineReferenceData: true,
    statisticalTesting: true
  },
  parameters: [
    {
      name: "PSI (Population Stability Index)",
      type: "metric",
      default: "< 0.1",
      impact: "Measures shift between reference and current distribution.",
      tuningTip: "PSI < 0.1: No shift; 0.1 - 0.2: Moderate shift; > 0.2: Significant drift detected, trigger retraining."
    },
    {
      name: "KS Test (Kolmogorov-Smirnov)",
      type: "statistical test",
      default: "p-value < 0.05",
      impact: "Detects if continuous feature distribution has diverged.",
      tuningTip: "Compare production streaming window against baseline training distribution."
    }
  ],
  math: {
    formula: "PSI = ∑ [ (Actual% - Expected%) × ln(Actual% / Expected%) ]",
    loss: "Kullback-Leibler (KL) Divergence / PSI",
    explanation: "Compares current production feature distributions against the golden reference baseline. When distance metrics cross a designated threshold, alerts notify engineers to retrain."
  },
  pros: [
    "Prevents models from silently making disastrous predictions in production",
    "Enables automated continuous retraining triggers based on empirical statistical alerts"
  ],
  cons: [
    "Ground truth labels may be delayed by weeks (e.g. loan defaults take months to observe), forcing reliance on proxy metrics"
  ],
  prerequisites: ["model-serving", "probability-statistics"],
  related: ["ml-cicd", "ab-testing-deployment", "ml-lifecycle", "data-quality"],
  diagram: `flowchart TD
    A[("Training data = reference distribution")] --> C["Compare distributions per feature"]
    B["Live production inputs & predictions"] --> C
    C --> D["Statistics: PSI, KS test, KL divergence"]
    D --> E{"Drift above threshold?"}
    E -->|"no"| F["Keep monitoring"]
    F -.-> B
    E -->|"yes"| G["Alert team"]
    B --> H["Delayed ground-truth labels"]
    H --> I{"Accuracy dropped? (concept drift)"}
    I -->|"yes"| G
    G --> J["Trigger retraining pipeline"]
    J --> K["Validate & redeploy new model"]`,
  codeSnippet: `from scipy.stats import ks_2samp

# Compare reference training feature vs live production data
stat, p_value = ks_2samp(train_features['age'], live_prod_features['age'])

if p_value < 0.05:
    print(f"⚠️ DATA DRIFT DETECTED (p={p_value:.5f})! Triggering Airflow Retraining DAG.")
else:
    print("✅ Distribution stable.")`
};
