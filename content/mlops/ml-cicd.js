export default {
  id: "ml-cicd",
  name: "CI/CD & Continuous Training for ML",
  track: "mlops",
  category: "Orchestration & Workflow",
  task: ["Deployment", "Evaluation"],
  difficulty: "Advanced",
  summary: "Automating the testing, validation, packaging and release of ML code, data and models (CI/CD), plus automatically retraining models when new data or drift appears (Continuous Training, CT).",
  intuition: "The Automated Factory Inspector: In a modern factory every product passes automatic checks on the line; defects are rejected before shipping, and when raw materials change, the machines recalibrate themselves. ML CI/CD is that inspection line for models, and continuous training is the self-recalibration.",
  whenToUse: "Teams shipping models regularly, models that must be retrained on fresh data, regulated settings needing an auditable release process, or whenever manual deployments have caused incidents.",
  whenToAvoid: "Early prototypes whose requirements change daily, or models retrained once a year — a documented manual checklist may be enough.",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: false,
    automatedTests: true,
    evaluationGate: "New model must beat production model on a fixed holdout"
  },
  parameters: [
    {
      name: "CI Checks",
      type: "concept",
      default: "lint + unit tests + data tests",
      impact: "Catch broken feature code, schema changes and bad data before training.",
      tuningTip: "Include a fast 'smoke train' on a small sample to catch pipeline errors in minutes."
    },
    {
      name: "Evaluation Gate",
      type: "float",
      default: "Δmetric ≥ 0 vs champion",
      impact: "Blocks promotion of models that are worse than the current production model.",
      tuningTip: "Also gate on fairness slices, latency and model size, not only the headline metric."
    },
    {
      name: "CT Trigger",
      type: "str",
      default: "cron schedule",
      impact: "Starts retraining: on schedule, on drift alert, or when enough new labels arrive.",
      tuningTip: "Combine a schedule with a drift alert so retraining is both regular and reactive."
    },
    {
      name: "Deployment Strategy",
      type: "str",
      default: "canary",
      impact: "How the new model receives traffic after passing CI: all-at-once, canary, shadow or A/B.",
      tuningTip: "Use canary or shadow releases with automatic rollback on metric regressions."
    }
  ],
  math: {
    formula: "promote(m_new) ⇔ metric(m_new, D_holdout) − metric(m_prod, D_holdout) ≥ δ  ∧  tests pass",
    loss: "Automated Promotion Gate",
    explanation: "A candidate model is promoted only if every automated test passes and it outperforms the production model by at least a margin δ on the same fixed holdout set, making releases objective and repeatable."
  },
  pros: [
    "Faster, safer and more frequent model releases",
    "Models stay fresh automatically as data changes",
    "Every release is tested, versioned and auditable with easy rollback"
  ],
  cons: [
    "Complex to build: pipelines must test code, data AND models",
    "Training jobs are slow and expensive compared to normal CI builds",
    "Bad automated gates can silently promote flawed models or block good ones"
  ],
  prerequisites: ["experiment-tracking", "docker-ml"],
  related: ["model-data-drift", "ab-testing-deployment", "data-quality", "airflow"],
  diagram: `flowchart TD
    A(["Code push"]) --> C["CI: lint + unit tests"]
    B(["Schedule or drift alert"]) --> E
    C --> D["Data validation tests"]
    D --> E["Training pipeline"]
    E --> F["Evaluate on fixed holdout"]
    F --> G{"Beats champion and passes checks?"}
    G -->|"no"| H["Reject & notify team"]
    G -->|"yes"| I["Register model + build Docker image"]
    I --> J["Canary deploy"]
    J --> K{"Live metrics healthy?"}
    K -->|"yes"| L["Full rollout"]
    K -->|"no"| M["Automatic rollback"]`,
  codeSnippet: `# .github/workflows/ml-pipeline.yml — CI/CD + continuous training
name: ml-pipeline
on:
  push:
    branches: [main]
  schedule:
    - cron: "0 3 * * 1"        # Continuous training: every Monday 03:00

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -r requirements.txt
      - run: ruff check . && pytest tests/            # code + feature unit tests
      - run: python pipelines/validate_data.py        # schema & data quality checks

  train-and-gate:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r requirements.txt
      - run: python pipelines/train.py --log-to-mlflow
      # Exit code != 0 if the candidate does not beat the champion
      - run: python pipelines/compare_to_champion.py --metric auc --min-delta 0.002

  deploy:
    needs: train-and-gate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t registry.example.com/churn-api:latest .
      - run: docker push registry.example.com/churn-api:latest
      - run: kubectl apply -f k8s/canary.yaml          # 10% canary traffic`
};
