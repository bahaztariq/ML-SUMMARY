export default {
  id: "ml-lifecycle",
  name: "ML Lifecycle & MLOps Overview",
  track: "mlops",
  category: "Foundations & Overview",
  task: ["Definition", "Deployment"],
  difficulty: "Beginner",
  summary: "MLOps applies DevOps principles (automation, versioning, testing, monitoring) to the full machine learning lifecycle so models can be built, deployed and improved reliably and repeatedly.",
  intuition: "From Home Cook to Restaurant Chain: Cooking one great meal at home is a notebook model. Running a restaurant chain that serves the same quality dish thousands of times a day, with tracked recipes, supplier checks, health inspections and customer feedback, is MLOps.",
  whenToUse: "As soon as a model will be used by real users or business processes, needs periodic retraining, or more than one person works on it.",
  whenToAvoid: "One-off research analyses or proofs-of-concept where heavy tooling (registries, CI/CD, feature stores) would slow learning down; adopt practices incrementally.",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: false,
    versionControl: true,
    maturityLevel: "Level 0 (manual) → Level 2 (full CI/CD/CT)"
  },
  parameters: [
    {
      name: "MLOps Maturity Level",
      type: "str",
      default: "Level 0 — manual",
      impact: "Level 0: manual notebooks; Level 1: automated training pipeline; Level 2: automated CI/CD of the pipeline itself.",
      tuningTip: "Move to Level 1 first: a reproducible, scheduled training pipeline gives the biggest win."
    },
    {
      name: "Versioned Artifacts",
      type: "concept",
      default: "Code + Data + Model",
      impact: "Reproducibility requires versioning all three, not just the code.",
      tuningTip: "Use Git for code, DVC/lakeFS or table snapshots for data, a model registry for models."
    },
    {
      name: "Retraining Trigger",
      type: "str",
      default: "Schedule (e.g. weekly)",
      impact: "Decides when the model is refreshed: on a schedule, on drift alerts, or on new labeled data.",
      tuningTip: "Start with a schedule, then add drift-based triggers once monitoring is trusted."
    },
    {
      name: "Ownership / Roles",
      type: "concept",
      default: "DS + ML Eng + Data Eng",
      impact: "Clear hand-offs between data scientists, ML engineers and data engineers avoid 'throw over the wall' failures.",
      tuningTip: "Make one team own the model end-to-end in production, including its alerts."
    }
  ],
  math: {
    formula: "Model value(t) = Performance(t) × Availability(t) − Cost(t),   Performance(t) ↓ as data drifts",
    loss: "Continuous Improvement Loop",
    explanation: "A deployed model's value decays as the world changes. MLOps keeps performance high through monitoring and retraining, availability high through robust serving, and cost low through automation."
  },
  pros: [
    "Reproducible models: any prediction can be traced to exact code, data and parameters",
    "Faster, safer releases through automation and testing",
    "Models stay accurate over time thanks to monitoring and continuous training"
  ],
  cons: [
    "Significant upfront investment in tooling and infrastructure",
    "Tool landscape is fragmented and changes quickly",
    "Requires cross-team skills (software, data, ML, ops) that are hard to hire"
  ],
  prerequisites: ["ml-workflow"],
  related: ["experiment-tracking", "model-serving", "ml-cicd", "model-data-drift"],
  diagram: `flowchart LR
    A[("Versioned data")] --> B["Data validation"]
    B --> C["Feature engineering"]
    C --> D["Training + experiment tracking"]
    D --> E{"Passes evaluation gate?"}
    E -->|"no"| C
    E -->|"yes"| F["Model registry"]
    F --> G["Package (Docker) & CI/CD"]
    G --> H["Serving: batch or online"]
    H --> I["Monitoring: drift, latency, KPIs"]
    I -.->|"retraining trigger"| A`,
  codeSnippet: `# Skeleton of an automated (MLOps Level 1) training pipeline
# Each step is a function an orchestrator (Airflow, Prefect, Kubeflow) can schedule.
import mlflow
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

def extract(snapshot_date: str) -> pd.DataFrame:
    # Versioned data: read an immutable snapshot, not "latest"
    return pd.read_parquet(f"s3://lake/features/date={snapshot_date}/")

def validate(df: pd.DataFrame) -> None:
    assert df["label"].isna().sum() == 0, "labels missing"
    assert len(df) > 10_000, "too few rows"

def train_and_evaluate(df: pd.DataFrame) -> float:
    X, y = df.drop(columns=["label"]), df["label"]
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0)
    with mlflow.start_run():
        model = GradientBoostingClassifier().fit(X_tr, y_tr)
        auc = roc_auc_score(y_te, model.predict_proba(X_te)[:, 1])
        mlflow.log_metric("auc", auc)
        mlflow.sklearn.log_model(model, "model", registered_model_name="churn")
    return auc

def run_pipeline(snapshot_date: str, min_auc: float = 0.80):
    df = extract(snapshot_date)
    validate(df)
    auc = train_and_evaluate(df)
    print("PROMOTE" if auc >= min_auc else "REJECT", f"auc={auc:.3f}")`
};
