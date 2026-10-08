export default {
  id: "experiment-tracking",
  name: "Experiment Tracking & Model Registry (MLflow)",
  track: "mlops",
  category: "Experiment Management",
  task: ["Evaluation", "Deployment"],
  difficulty: "Intermediate",
  summary: "Systematically recording the parameters, code version, data version, metrics and artifacts of every training run, and promoting the best resulting models through a versioned registry (Staging → Production).",
  intuition: "The Lab Notebook: A chemist writes down every reagent, quantity and temperature for each experiment so a great result can be reproduced and a bad one explained. Experiment tracking is that notebook, filled in automatically; the model registry is the shelf where only approved, labeled batches are stored for shipping.",
  whenToUse: "Any time you run more than a handful of experiments (hyperparameter searches, feature variations), work in a team, or need an audit trail of which model version is in production and how it was trained.",
  whenToAvoid: "Tiny throwaway scripts; but even then, logging to a local MLflow file store costs almost nothing.",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: false,
    trackingServer: "Local files or remote server (MLflow, W&B, Neptune)",
    reproducibleSeeds: true
  },
  parameters: [
    {
      name: "tracking_uri",
      type: "str",
      default: "./mlruns (local)",
      impact: "Where runs, metrics and artifacts are stored; a shared server lets the whole team compare runs.",
      tuningTip: "Use a database backend + object storage (S3/GCS) for team setups."
    },
    {
      name: "experiment_name",
      type: "str",
      default: "Default",
      impact: "Groups related runs so they can be compared side by side.",
      tuningTip: "One experiment per business problem, e.g. 'churn-prediction'."
    },
    {
      name: "autolog",
      type: "bool",
      default: "False",
      impact: "Automatically logs params, metrics and the model for sklearn, XGBoost, PyTorch, etc.",
      tuningTip: "Enable it, then log extra business metrics and the data version manually."
    },
    {
      name: "Registry alias / stage",
      type: "str",
      default: "None → 'champion' / 'challenger'",
      impact: "Marks which registered model version serving infrastructure should load.",
      tuningTip: "Serve by alias (models:/churn@champion) so promotions need no code changes."
    }
  ],
  math: {
    formula: "Run = (code_commit, data_hash, θ_hyper) → (metrics, artifacts);   best = argmax_runs metric_val",
    loss: "Reproducible Run Lineage",
    explanation: "Each run is a deterministic function of its code, data and hyperparameters (given fixed seeds). Logging all inputs makes any output reproducible, and comparing validation metrics across runs selects the candidate to register."
  },
  pros: [
    "Full reproducibility and lineage for every model in production",
    "Easy visual comparison of hundreds of runs and hyperparameter sweeps",
    "Registry gives a single source of truth for deployment with approvals and rollback"
  ],
  cons: [
    "Requires discipline to log data versions, not just parameters",
    "Self-hosting a tracking server adds infrastructure to maintain",
    "Artifact storage can grow large quickly with big models"
  ],
  prerequisites: ["ml-lifecycle"],
  related: ["hyperparameter-tuning", "model-serving", "ml-cicd", "cross-validation"],
  diagram: `flowchart TD
    A["Training script"] --> B["Start run"]
    B --> C["Log params + code commit + data version"]
    C --> D["Train model"]
    D --> E["Log metrics & artifacts"]
    E --> F[("Tracking server")]
    F --> G["Compare runs in UI"]
    G --> H{"Best run beats champion?"}
    H -->|"yes"| I["Register new model version"]
    H -->|"no"| A
    I --> J["Set alias: challenger → champion"]
    J --> K["Serving loads models:/name@champion"]`,
  codeSnippet: `import mlflow
import mlflow.sklearn
from mlflow import MlflowClient
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score

mlflow.set_tracking_uri("http://mlflow.internal:5000")
mlflow.set_experiment("breast-cancer-rf")

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, random_state=42)

# Log one run per hyperparameter setting
for n_trees in [50, 200, 500]:
    with mlflow.start_run(run_name=f"rf-{n_trees}"):
        mlflow.log_params({"n_estimators": n_trees, "data_version": "v2024-06-01"})
        model = RandomForestClassifier(n_estimators=n_trees, random_state=42).fit(X_tr, y_tr)
        f1 = f1_score(y_te, model.predict(X_te))
        mlflow.log_metric("f1", f1)
        mlflow.sklearn.log_model(model, "model", registered_model_name="cancer-rf")

# Promote the best version to 'champion'
client = MlflowClient()
runs = mlflow.search_runs(order_by=["metrics.f1 DESC"], max_results=1)
best_run_id = runs.iloc[0]["run_id"]
version = next(v for v in client.search_model_versions("name='cancer-rf'")
               if v.run_id == best_run_id)
client.set_registered_model_alias("cancer-rf", "champion", version.version)

# Serving code loads by alias, never by hard-coded path
champion = mlflow.sklearn.load_model("models:/cancer-rf@champion")`
};
