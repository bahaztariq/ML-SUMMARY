export default {
  id: "ab-testing-deployment",
  name: "A/B Testing, Canary & Shadow Deployment",
  track: "mlops",
  category: "Deployment & Serving",
  task: ["Deployment", "Evaluation"],
  difficulty: "Advanced",
  summary: "Safe release strategies that expose a new model to real traffic gradually or invisibly — shadow (mirror traffic, no user impact), canary (small % of users, watch for regressions) and A/B tests (randomized split with statistical comparison of business metrics).",
  intuition: "The New Recipe Test: A restaurant first cooks the new recipe in the back without serving it (shadow), then offers it to one table in ten (canary), and finally runs a proper taste test where randomly chosen tables get old vs new and compares satisfaction scores (A/B test).",
  whenToUse: "Replacing a production model where offline metrics may not reflect real-world impact, models affecting revenue or user experience, and whenever a bad release would be costly.",
  whenToAvoid: "Very low traffic (A/B tests would take months to reach significance), or decisions where randomization is unethical or illegal; use offline evaluation or interleaving instead.",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: true,
    trafficRouting: true,
    randomizedAssignment: true
  },
  parameters: [
    {
      name: "Traffic Split",
      type: "float",
      default: "0.05 (canary) / 0.5 (A/B)",
      impact: "Share of requests routed to the new model.",
      tuningTip: "Ramp canaries 1% → 5% → 25% → 100%, checking metrics at each step."
    },
    {
      name: "Sample Size / Duration",
      type: "int",
      default: "Computed by power analysis",
      impact: "Number of users needed to detect the minimum effect with enough statistical power.",
      tuningTip: "Run at least one full weekly cycle and do not stop early when results 'look' significant (peeking)."
    },
    {
      name: "Significance Level (α) & Power",
      type: "float",
      default: "α = 0.05, power = 0.8",
      impact: "Control false positives and false negatives of the decision.",
      tuningTip: "Fix them BEFORE the test starts and pre-register the primary metric."
    },
    {
      name: "Assignment Unit",
      type: "str",
      default: "user_id (sticky hashing)",
      impact: "Ensures each user consistently sees the same variant.",
      tuningTip: "Hash user_id with an experiment salt; avoid per-request randomization for user-facing models."
    }
  ],
  math: {
    formula: "z = (p̂_B − p̂_A) / √( p̂(1−p̂)(1/n_A + 1/n_B) ),   n ≈ 16·σ² / Δ² per group",
    loss: "Two-Proportion z-Test & Power Analysis",
    explanation: "The z-statistic compares conversion rates of control (A) and treatment (B) using the pooled proportion p̂. The rule of thumb n ≈ 16σ²/Δ² gives the per-group sample size for 80% power at α = 0.05 to detect a difference Δ."
  },
  pros: [
    "Measures true business impact (revenue, clicks), not just offline accuracy",
    "Shadow and canary releases limit the blast radius of bad models",
    "Statistical rigor prevents shipping changes that only look better by chance"
  ],
  cons: [
    "Requires traffic routing infrastructure and per-variant logging",
    "A/B tests need large traffic and time to reach significance",
    "Pitfalls: peeking, novelty effects, interference between users, multiple-metric fishing"
  ],
  prerequisites: ["model-serving", "probability-statistics"],
  related: ["ml-cicd", "model-data-drift", "experiment-tracking"],
  diagram: `flowchart TD
    U(["Incoming user requests"]) --> R{"Router: hash(user_id)"}
    R -->|"shadow: mirror copy"| S["Model B scores silently"]
    S --> SL[("Log only, compare offline")]
    R -->|"95% traffic"| A["Model A (champion)"]
    R -->|"5% canary / 50% A-B"| B["Model B (challenger)"]
    A --> M[("Per-variant metrics: errors, latency, conversions")]
    B --> M
    M --> T["Statistical test after planned duration"]
    T --> D{"B significantly better and healthy?"}
    D -->|"yes"| P["Promote B to 100%"]
    D -->|"no"| K["Roll back, keep A"]`,
  codeSnippet: `import hashlib
import numpy as np
from statsmodels.stats.proportion import proportions_ztest
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize

# 1. Sticky assignment: same user always gets same variant
def assign_variant(user_id: str, experiment: str = "ranker-v2", treatment_share: float = 0.5) -> str:
    h = int(hashlib.md5(f"{experiment}:{user_id}".encode()).hexdigest(), 16)
    return "B" if (h % 10_000) / 10_000 < treatment_share else "A"

# 2. Shadow mode: new model scores but its output is only logged
def handle_request(features, prod_model, shadow_model, log):
    y_prod = prod_model.predict(features)
    log.append({"prod": y_prod, "shadow": shadow_model.predict(features)})
    return y_prod                                   # users only see production output

# 3. Power analysis BEFORE the test: detect 10.0% -> 10.5% conversion
effect = proportion_effectsize(0.105, 0.100)
n_per_group = NormalIndPower().solve_power(effect, alpha=0.05, power=0.8)
print(f"Need ~{int(np.ceil(n_per_group)):,} users per variant")

# 4. Analyse results AFTER the planned duration
conversions = np.array([5_210, 5_480])   # A, B
users = np.array([50_000, 50_000])
z, p = proportions_ztest(conversions, users)
lift = conversions[1] / users[1] - conversions[0] / users[0]
print(f"lift={lift:.4f}  z={z:.2f}  p={p:.4f}")
print("Ship model B" if p < 0.05 and lift > 0 else "Keep model A")`
};
