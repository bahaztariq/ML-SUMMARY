export default {
  id: "ml-workflow",
  name: "End-to-End ML Workflow",
  track: "fundamentals",
  category: "Foundations & Overview",
  task: ["Definition", "Preprocessing", "Evaluation", "Deployment"],
  difficulty: "Beginner",
  summary: "The standard sequence of steps that turns a business question and raw data into a validated, deployed model: frame the problem, collect and clean data, engineer features, train, evaluate, deploy and monitor.",
  intuition: "The Restaurant Kitchen: Before a dish reaches the table, someone decides the menu (problem framing), buys ingredients (data collection), washes and chops them (cleaning & feature engineering), cooks (training), tastes (evaluation) and finally serves and asks for feedback (deployment & monitoring). Skipping the tasting step is how bad dishes reach customers.",
  whenToUse: "Every machine learning project, from a Kaggle notebook to a production fraud system. Use it as a checklist so that leakage checks, baselines and evaluation are never forgotten.",
  whenToAvoid: "N/A as a mindset — but avoid over-engineering every stage (feature stores, CI/CD, A/B tests) for a one-off exploratory analysis that will never be deployed.",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: false,
    requiresClearBusinessMetric: true,
    iterative: true
  },
  parameters: [
    {
      name: "Problem Framing",
      type: "concept",
      default: "Business KPI → ML target",
      impact: "Decides the target variable, the task type (classification, regression, clustering) and the success metric.",
      tuningTip: "Write down the baseline (e.g. 'predict the majority class' or 'last month's value') before training anything."
    },
    {
      name: "Data Split Strategy",
      type: "str",
      default: "80/20 hold-out + k-fold CV",
      impact: "Determines how honestly you estimate performance on unseen data.",
      tuningTip: "Split BEFORE any fitting of scalers/imputers; use time-based splits for temporal data."
    },
    {
      name: "Pipeline Object",
      type: "architecture",
      default: "sklearn.pipeline.Pipeline",
      impact: "Bundles preprocessing + model so the exact same transforms run in training and in production.",
      tuningTip: "Always serialize the whole pipeline, never the bare model."
    },
    {
      name: "Evaluation Metric",
      type: "str",
      default: "Task dependent (F1, RMSE, AUC)",
      impact: "Drives model selection; the wrong metric selects the wrong model.",
      tuningTip: "Use precision/recall or PR-AUC for imbalanced classes rather than accuracy."
    }
  ],
  math: {
    formula: "f̂ = argmin_{f ∈ F} (1/n) Σ L(yᵢ, f(xᵢ))   then   evaluate E[L(y, f̂(x))] on held-out data",
    loss: "Empirical Risk Minimization",
    explanation: "Training picks the function from the model family F that minimizes average loss on the training data. Because that estimate is optimistic, the workflow always reserves unseen data to estimate the true expected loss before deployment."
  },
  pros: [
    "Gives a repeatable structure that prevents common mistakes like data leakage",
    "Makes projects easier to communicate to stakeholders and teammates",
    "Each stage has clear inputs/outputs, so it maps directly onto automated pipelines later"
  ],
  cons: [
    "Real projects loop back many times — the linear picture can hide how iterative it is",
    "Data collection and cleaning usually consume 60–80% of the time, often underestimated",
    "Without monitoring, the workflow 'ends' at deployment while the model silently decays"
  ],
  prerequisites: ["what-is-ml"],
  related: ["train-test-split", "what-is-feature-engineering", "cross-validation", "ml-lifecycle"],
  diagram: `flowchart TD
    A(["Business question"]) --> B["Frame problem: target + metric"]
    B --> C[("Collect raw data")]
    C --> D["Clean & impute"]
    D --> E["Train / test split"]
    E --> F["Feature engineering pipeline"]
    F --> G["Train candidate models"]
    G --> H{"Beats baseline on validation?"}
    H -->|"no"| F
    H -->|"yes"| I["Final test-set evaluation"]
    I --> J["Deploy pipeline"]
    J --> K["Monitor & collect feedback"]
    K -.->|"drift or new data"| C`,
  codeSnippet: `# A minimal end-to-end workflow with scikit-learn
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

# 1. Load data & frame the problem (target = churned)
df = pd.read_csv("customers.csv")
X, y = df.drop(columns=["churned"]), df["churned"]

# 2. Split FIRST to avoid leakage
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42)

# 3. Preprocessing + model in ONE pipeline
num = ["age", "monthly_spend"]
cat = ["plan", "country"]
prep = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")),
                      ("sc", StandardScaler())]), num),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat),
])
pipe = Pipeline([("prep", prep), ("clf", RandomForestClassifier(n_estimators=300))])

# 4. Validate, train, evaluate on untouched test set
print("CV F1:", cross_val_score(pipe, X_train, y_train, cv=5, scoring="f1").mean())
pipe.fit(X_train, y_train)
print(classification_report(y_test, pipe.predict(X_test)))

# 5. Ship the whole pipeline
joblib.dump(pipe, "churn_pipeline.joblib")`
};
