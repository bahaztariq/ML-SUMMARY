/**
 * Fundamentals & MLOps — additional concepts and relationship/diagram enrichments.
 */

export const newConcepts = [
  // ==========================================
  // TRACK: FUNDAMENTALS
  // ==========================================
  {
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
joblib.dump(pipe, "churn_pipeline.joblib")`,
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
    K -.->|"drift or new data"| C`
  },

  {
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
print(f"t={t_stat:.2f}, p={p_value:.4f} ->", "significant" if p_value < 0.05 else "not significant")`,
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
    I -->|"no"| K["Could be random noise"]`
  },

  {
    id: "linear-algebra",
    name: "Linear Algebra for ML",
    track: "fundamentals",
    category: "Math & Optimization",
    task: ["Definition", "Optimization"],
    difficulty: "Beginner",
    summary: "The mathematics of vectors, matrices and their transformations — the format in which every dataset, model weight and neural network computation is actually stored and executed.",
    intuition: "The Spreadsheet That Moves: A dataset is a spreadsheet (matrix) where each row is a point (vector) in space. Multiplying by a weight matrix is like stretching, rotating and squashing that whole cloud of points at once. Training a model means finding the transformation that moves the points to where the answers are.",
    whenToUse: "Understanding how models compute predictions (X·w), why feature scaling matters (dot products), how PCA finds directions of variance (eigenvectors / SVD), how embeddings measure similarity (cosine), and why GPUs speed up deep learning (batched matrix multiplication).",
    whenToAvoid: "N/A — but you do not need to hand-derive matrix calculus to use scikit-learn productively; learn it progressively as models get deeper.",
    requirements: {
      scalingRequired: false,
      handlesMissing: false,
      outlierSensitive: false,
      numericInputsOnly: true
    },
    parameters: [
      {
        name: "Dot Product",
        type: "concept",
        default: "a · b = Σ aᵢbᵢ",
        impact: "Measures alignment between vectors; every neuron and linear model computes one.",
        tuningTip: "Normalize vectors (cosine similarity) when only direction, not magnitude, matters."
      },
      {
        name: "Matrix Multiplication",
        type: "concept",
        default: "(n×d)·(d×k) → (n×k)",
        impact: "Applies a linear transformation to all samples at once — the core op of neural networks.",
        tuningTip: "Inner dimensions must match; most shape bugs in PyTorch are here."
      },
      {
        name: "Eigenvectors / SVD",
        type: "concept",
        default: "X = U Σ Vᵀ",
        impact: "Decompose a matrix into principal directions and strengths; powers PCA and recommenders.",
        tuningTip: "Use numpy.linalg.svd on centered data instead of computing the covariance matrix explicitly."
      },
      {
        name: "Norms (L1 / L2)",
        type: "concept",
        default: "‖x‖₂ = √(Σ xᵢ²)",
        impact: "Measure vector length; used in distances (k-NN) and regularization penalties.",
        tuningTip: "L1 encourages sparsity, L2 encourages small, spread-out weights."
      }
    ],
    math: {
      formula: "ŷ = X · w + b      w* = (XᵀX)⁻¹ Xᵀ y      X = U Σ Vᵀ",
      loss: "Linear Maps, Normal Equation & SVD",
      explanation: "Predictions of a linear model are one matrix-vector product. The normal equation solves least squares in closed form using transposes and inverses. SVD factorizes any data matrix into rotations (U, V) and scaling (Σ), revealing the directions that carry the most variance."
    },
    pros: [
      "Turns loops over millions of samples into single vectorized operations (huge speedups)",
      "Gives geometric intuition for distances, projections and similarity",
      "Directly maps to GPU hardware, enabling modern deep learning"
    ],
    cons: [
      "Abstract notation can be intimidating at first",
      "Matrix inversion is numerically unstable for ill-conditioned or collinear features",
      "High-dimensional geometry is counter-intuitive (curse of dimensionality)"
    ],
    codeSnippet: `import numpy as np

# Dataset: 4 samples x 2 features (a matrix), target vector y
X = np.array([[1.0, 2.0],
              [2.0, 1.0],
              [3.0, 4.0],
              [4.0, 3.0]])
y = np.array([5.0, 4.0, 11.0, 10.0])

# 1. Dot product & cosine similarity between two samples
a, b = X[0], X[2]
cos_sim = a @ b / (np.linalg.norm(a) * np.linalg.norm(b))
print(f"dot={a @ b:.1f}  cosine={cos_sim:.3f}")

# 2. Linear model prediction for ALL rows in one matrix product
w = np.array([1.0, 2.0])
print("predictions:", X @ w)

# 3. Normal equation (closed-form least squares) — prefer lstsq for stability
Xb = np.c_[np.ones(len(X)), X]                # add bias column
w_star, *_ = np.linalg.lstsq(Xb, y, rcond=None)
print("fitted [b, w1, w2]:", np.round(w_star, 3))

# 4. SVD on centered data = PCA directions
Xc = X - X.mean(axis=0)
U, S, Vt = np.linalg.svd(Xc, full_matrices=False)
print("principal directions:\\n", np.round(Vt, 3))
print("explained variance ratio:", np.round(S**2 / (S**2).sum(), 3))`,
    prerequisites: [],
    related: ["probability-statistics", "pca", "what-is-gradient-descent", "embeddings"],
    diagram: `flowchart LR
    A[("Raw table: n rows × d columns")] --> B["Matrix X (n × d)"]
    B --> C["Each row = vector in d-dim space"]
    B --> D["Multiply by weights W (d × k)"]
    D --> E["Transformed data X·W (n × k)"]
    E --> F["Predictions / next layer"]
    B --> G["Center data"]
    G --> H["SVD: U Σ Vᵀ"]
    H --> I["Top components → PCA projection"]
    C --> J["Dot product / norm"]
    J --> K["Similarity & distances (k-NN, embeddings)"]`
  },

  // ==========================================
  // TRACK: MLOPS & PRODUCTION
  // ==========================================
  {
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
    print("PROMOTE" if auc >= min_auc else "REJECT", f"auc={auc:.3f}")`,
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
    I -.->|"retraining trigger"| A`
  },

  {
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
champion = mlflow.sklearn.load_model("models:/cancer-rf@champion")`,
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
    J --> K["Serving loads models:/name@champion"]`
  },

  {
    id: "model-serving",
    name: "Model Serving: Batch vs Online (FastAPI)",
    track: "mlops",
    category: "Deployment & Serving",
    task: ["Deployment", "Architecture"],
    difficulty: "Intermediate",
    summary: "Making a trained model's predictions available to consumers — either by scoring large datasets on a schedule (batch) or by answering individual requests in milliseconds through an API (online / real-time).",
    intuition: "Bakery vs Made-to-Order: A bakery bakes all the bread at 4 a.m. and it waits on shelves (batch: cheap, predictions ready but possibly stale). A made-to-order sandwich shop prepares each order when the customer arrives (online: fresh, personalized, but must be fast and always staffed).",
    whenToUse: "Batch: nightly churn scores, weekly demand forecasts, marketing segments — when predictions can be precomputed. Online: fraud checks at payment time, search ranking, recommendations — when the input only exists at request time.",
    whenToAvoid: "Avoid online serving when batch suffices (it adds latency SLOs, autoscaling and on-call burden). Avoid batch when inputs change by the second or the space of inputs is too large to precompute.",
    requirements: {
      scalingRequired: false,
      handlesMissing: false,
      outlierSensitive: false,
      latencyBudget: "Batch: hours · Online: typically under 100 ms",
      trainingServingConsistency: true
    },
    parameters: [
      {
        name: "Serving Mode",
        type: "str",
        default: "batch",
        impact: "Batch writes predictions to a table; online exposes an HTTP/gRPC endpoint; streaming scores events from Kafka.",
        tuningTip: "Start with batch; move to online only when a product requirement demands fresh predictions."
      },
      {
        name: "workers / replicas",
        type: "int",
        default: "2",
        impact: "Number of server processes/pods handling requests in parallel.",
        tuningTip: "Autoscale on CPU or requests-per-second; load-test to find the p99 latency limit."
      },
      {
        name: "Request Batching",
        type: "bool",
        default: "False",
        impact: "Groups concurrent online requests into one model call to use vectorization/GPU efficiently.",
        tuningTip: "Essential for GPU-served deep learning models (Triton, TorchServe, BentoML)."
      },
      {
        name: "Input Schema Validation",
        type: "concept",
        default: "Pydantic model",
        impact: "Rejects malformed requests before they reach the model.",
        tuningTip: "Mirror the training feature schema exactly, including types and allowed ranges."
      }
    ],
    math: {
      formula: "Latency_p99 ≈ t_network + t_feature_lookup + t_inference;   Throughput ≈ replicas × batch_size / t_inference",
      loss: "Latency vs Throughput Trade-off",
      explanation: "Online serving is judged by tail latency (p99), which sums network, feature retrieval and model inference time. Throughput scales with replicas and batch size, but larger batches increase per-request latency."
    },
    pros: [
      "Batch: simple, cheap, easy to retry, uses big-data tools like Spark",
      "Online: fresh, context-aware predictions for interactive products",
      "A stable API decouples model updates from consuming applications"
    ],
    cons: [
      "Batch predictions go stale and waste compute on users who never show up",
      "Online serving needs high availability, autoscaling and latency monitoring",
      "Training-serving skew if online features are computed differently from training features"
    ],
    codeSnippet: `# ---- Online serving with FastAPI (serve.py) ----
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Churn model API")
pipeline = joblib.load("churn_pipeline.joblib")   # loaded ONCE at startup

class Customer(BaseModel):
    age: int = Field(ge=18, le=100)
    monthly_spend: float = Field(ge=0)
    plan: str
    country: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(customer: Customer):
    X = pd.DataFrame([customer.model_dump()])
    proba = float(pipeline.predict_proba(X)[0, 1])
    return {"churn_probability": round(proba, 4), "model_version": "v3"}

# Run: uvicorn serve:app --host 0.0.0.0 --port 8000 --workers 4

# ---- Batch scoring (nightly job) ----
def score_batch(input_path: str, output_path: str):
    df = pd.read_parquet(input_path)
    df["churn_probability"] = pipeline.predict_proba(df)[:, 1]
    df[["customer_id", "churn_probability"]].to_parquet(output_path)`,
    prerequisites: ["experiment-tracking", "docker-ml"],
    related: ["feature-store", "ab-testing-deployment", "model-data-drift", "batch-vs-stream"],
    diagram: `flowchart TD
    R[("Model registry")] --> Q{"Are inputs known in advance?"}
    Q -->|"yes"| B1["Batch job (Airflow / Spark)"]
    B1 --> B2[("Read all rows from warehouse")]
    B2 --> B3["Score in bulk"]
    B3 --> B4[("Write predictions table")]
    B4 --> B5["Apps read precomputed scores"]
    Q -->|"no, request-time"| O1["Client sends HTTP request"]
    O1 --> O2["API validates input schema"]
    O2 --> O3["Fetch online features"]
    O3 --> O4["Model inference in memory"]
    O4 --> O5["Return prediction in ms"]`
  },

  {
    id: "docker-ml",
    name: "Docker & Containers for ML",
    track: "mlops",
    category: "Deployment & Serving",
    task: ["Deployment", "Architecture"],
    difficulty: "Beginner",
    summary: "Packaging a model, its code, Python dependencies and system libraries into a portable, immutable container image that runs identically on a laptop, CI server, or Kubernetes cluster.",
    intuition: "The Shipping Container: Before standard shipping containers, every cargo needed custom handling at each port. A container has a fixed shape, so any ship, crane or truck can move it without knowing what is inside. A Docker image does the same for software — 'it works on my machine' becomes 'it works on every machine'.",
    whenToUse: "Deploying model APIs or batch jobs, running training on cloud/Kubernetes, guaranteeing identical environments across team members and CI, and pinning CUDA/library versions for GPU workloads.",
    whenToAvoid: "Pure exploratory notebooks on your own machine, or fully managed serverless platforms that package code for you (though many still use containers underneath).",
    requirements: {
      scalingRequired: false,
      handlesMissing: false,
      outlierSensitive: false,
      pinnedDependencies: true,
      gpuSupport: "Requires NVIDIA Container Toolkit + CUDA base image"
    },
    parameters: [
      {
        name: "Base Image",
        type: "str",
        default: "python:3.11-slim",
        impact: "Determines OS, Python version and image size; GPU work needs an nvidia/cuda or pytorch base.",
        tuningTip: "Prefer slim images; avoid 'latest' tags — pin exact versions for reproducibility."
      },
      {
        name: "Layer Ordering",
        type: "concept",
        default: "deps before code",
        impact: "Docker caches layers; copying requirements.txt before source code avoids reinstalling packages on every code change.",
        tuningTip: "Put rarely-changing steps first, frequently-changing ones last."
      },
      {
        name: "Multi-stage Build",
        type: "bool",
        default: "False",
        impact: "Builds/compiles in one stage and copies only the results into a small runtime image.",
        tuningTip: "Can shrink images from several GB to a few hundred MB."
      },
      {
        name: "Model Artifact Location",
        type: "str",
        default: "Baked into image",
        impact: "Baking gives immutability; downloading from a registry at startup gives smaller images and faster model swaps.",
        tuningTip: "Bake small models; fetch large ones (multi-GB LLMs) from object storage at startup."
      }
    ],
    math: {
      formula: "Image = Base OS ⊕ System libs ⊕ Python deps ⊕ Code ⊕ Model;   Container = running instance of Image",
      loss: "Layered, Immutable Packaging",
      explanation: "An image is a stack of read-only, content-hashed layers; identical layers are cached and shared. Each container started from the same image has an identical environment, eliminating dependency drift between development and production."
    },
    pros: [
      "Reproducible environments across laptops, CI and production",
      "Isolates conflicting dependency versions between projects",
      "Standard unit for orchestration with Kubernetes, ECS, Cloud Run, etc."
    ],
    cons: [
      "ML images (CUDA, PyTorch) can be very large and slow to build/pull",
      "GPU access requires extra host drivers and runtime configuration",
      "Adds a learning curve (networking, volumes, image registries, security scanning)"
    ],
    codeSnippet: `# Dockerfile — serve a scikit-learn model with FastAPI
# ---------- build stage ----------
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
# Install dependencies into a separate prefix (cached unless requirements change)
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---------- runtime stage ----------
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /install /usr/local

# Copy code and the trained pipeline last (changes most often)
COPY serve.py .
COPY churn_pipeline.joblib .

# Run as non-root for security
RUN useradd --create-home appuser
USER appuser

EXPOSE 8000
HEALTHCHECK CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"
CMD ["uvicorn", "serve:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

# Build & run:
#   docker build -t churn-api:1.0.0 .
#   docker run -p 8000:8000 churn-api:1.0.0
#   curl -X POST localhost:8000/predict -H "Content-Type: application/json" \\
#        -d '{"age": 42, "monthly_spend": 79.9, "plan": "pro", "country": "MA"}'`,
    prerequisites: ["ml-lifecycle"],
    related: ["model-serving", "ml-cicd", "airflow"],
    diagram: `flowchart LR
    A["requirements.txt"] --> D["Dockerfile"]
    B["serve.py code"] --> D
    C["model.joblib"] --> D
    D --> E["docker build"]
    E --> F["Layered image (cached layers)"]
    F --> G[("Image registry")]
    G --> H["Laptop container"]
    G --> I["CI test container"]
    G --> J["Kubernetes pods (replicas)"]
    J --> K["Same environment everywhere"]`
  },

  {
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
      - run: kubectl apply -f k8s/canary.yaml          # 10% canary traffic`,
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
    K -->|"no"| M["Automatic rollback"]`
  },

  {
    id: "feature-store",
    name: "Feature Store",
    track: "mlops",
    category: "Architecture & Data Management",
    task: ["Storage", "Preprocessing", "Deployment"],
    difficulty: "Advanced",
    summary: "A central system that defines, computes, stores and serves ML features consistently for both training (offline, historical, point-in-time correct) and inference (online, low-latency), eliminating training-serving skew and duplicated feature code.",
    intuition: "The Central Kitchen Pantry: Instead of every chef preparing their own sauces slightly differently, a central pantry prepares each sauce once from a single recipe, keeps a dated archive for recipe testing (offline store), and a ready-to-use jar at every station for service (online store).",
    whenToUse: "Multiple models reuse the same features, real-time models need fresh aggregates (e.g. 'transactions in the last 10 minutes'), training-serving skew has caused bugs, or point-in-time correct training sets are hard to build.",
    whenToAvoid: "A single batch model with features computed in one SQL query; a feature store adds significant infrastructure for little benefit there.",
    requirements: {
      scalingRequired: false,
      handlesMissing: false,
      outlierSensitive: false,
      pointInTimeCorrectness: true,
      onlineStore: "Low-latency KV store (Redis, DynamoDB)"
    },
    parameters: [
      {
        name: "Entity",
        type: "concept",
        default: "customer_id",
        impact: "The key features are attached to and looked up by.",
        tuningTip: "Choose entities matching prediction requests (user, item, merchant)."
      },
      {
        name: "Feature View TTL",
        type: "duration",
        default: "1 day",
        impact: "How long a feature value stays valid for lookups; stale values beyond TTL are treated as missing.",
        tuningTip: "Match TTL to how quickly the underlying signal changes."
      },
      {
        name: "Offline / Online Store",
        type: "architecture",
        default: "Parquet/warehouse + Redis",
        impact: "Offline store holds full history for training; online store holds latest values for millisecond serving.",
        tuningTip: "Materialize to the online store on a schedule or via streaming for fresh features."
      },
      {
        name: "Point-in-time Join",
        type: "concept",
        default: "Enabled",
        impact: "Joins each training label only with feature values known BEFORE the label's timestamp.",
        tuningTip: "Never build training sets with a plain latest-value join — it leaks future information."
      }
    ],
    math: {
      formula: "x_train(e, t) = f(e, t′) where t′ = max{ t_f ≤ t }   (no future values)",
      loss: "Point-in-Time Correct Join",
      explanation: "For each entity e and label timestamp t, the store retrieves the latest feature value computed at or before t. This reproduces exactly what the model would have seen at prediction time, preventing temporal leakage."
    },
    pros: [
      "Eliminates training-serving skew: one definition used offline and online",
      "Feature reuse across teams and models; discoverable feature catalog",
      "Point-in-time joins prevent subtle leakage in training sets"
    ],
    cons: [
      "Heavy infrastructure (offline store, online store, materialization jobs)",
      "Learning curve and operational cost; overkill for simple batch use cases",
      "Streaming features add complexity in freshness and backfills"
    ],
    codeSnippet: `# Feast feature store: define once, use for training AND serving
from datetime import timedelta
import pandas as pd
from feast import Entity, FeatureView, Field, FileSource, FeatureStore
from feast.types import Float32, Int64

# ---- feature_repo/definitions.py ----
customer = Entity(name="customer", join_keys=["customer_id"])

stats_source = FileSource(
    path="data/customer_stats.parquet",
    timestamp_field="event_timestamp",
)

customer_stats = FeatureView(
    name="customer_stats",
    entities=[customer],
    ttl=timedelta(days=1),
    schema=[Field(name="orders_30d", dtype=Int64),
            Field(name="avg_basket_30d", dtype=Float32)],
    source=stats_source,
)

# ---- Training: point-in-time correct historical features ----
store = FeatureStore(repo_path="feature_repo")
labels = pd.read_parquet("data/churn_labels.parquet")  # customer_id, event_timestamp, churned
train_df = store.get_historical_features(
    entity_df=labels,
    features=["customer_stats:orders_30d", "customer_stats:avg_basket_30d"],
).to_df()

# ---- Serving: latest values from the online store in milliseconds ----
# (after: feast materialize-incremental <now>)
online = store.get_online_features(
    features=["customer_stats:orders_30d", "customer_stats:avg_basket_30d"],
    entity_rows=[{"customer_id": 1042}],
).to_dict()
print(online)`,
    prerequisites: ["what-is-feature-engineering", "ml-lifecycle"],
    related: ["model-serving", "train-test-split", "lakehouse-architecture", "batch-vs-stream"],
    diagram: `flowchart LR
    S1[("Batch sources: warehouse / lake")] --> T["Feature definitions (one codebase)"]
    S2[("Streaming events: Kafka")] --> T
    T --> OFF[("Offline store: full history")]
    T --> ON[("Online store: latest values")]
    OFF --> PIT["Point-in-time join with labels"]
    PIT --> TR["Training dataset"]
    TR --> M["Train model"]
    ON --> API["Serving API lookup by entity id"]
    M --> API
    API --> P["Prediction with identical features"]`
  },

  {
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
print("Ship model B" if p < 0.05 and lift > 0 else "Keep model A")`,
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
    D -->|"no"| K["Roll back, keep A"]`
  }
];

// Adds graph links + diagrams to EXISTING concepts (keyed by existing id).
export const enrichments = {
  "what-is-ai": {
    prerequisites: [],
    related: ["what-is-ml", "what-is-deep-learning", "supervised-vs-unsupervised"],
    diagram: `flowchart TD
    A(["Problem needing intelligent behavior"]) --> B{"Can explicit rules solve it?"}
    B -->|"yes"| C["Symbolic AI: hand-written rules / expert system"]
    B -->|"no, patterns hidden in data"| D["Machine Learning: learn rules from examples"]
    D --> E{"Unstructured data at large scale? (images, text, audio)"}
    E -->|"no, tabular"| F["Classical ML: trees, linear models, SVM"]
    E -->|"yes"| G["Deep Learning: multi-layer neural networks"]
    G --> H["Foundation models / LLMs"]
    C --> I["AI system makes decisions"]
    F --> I
    H --> I`
  },

  "what-is-ml": {
    prerequisites: ["what-is-ai"],
    related: ["supervised-vs-unsupervised", "ml-workflow", "what-is-deep-learning", "loss-vs-cost-function"],
    diagram: `flowchart LR
    subgraph trad["Traditional programming"]
      R1["Rules"] --> P1["Program"]
      D1["Data"] --> P1
      P1 --> O1["Answers"]
    end
    subgraph ml["Machine learning"]
      D2[("Historical data")] --> L["Learning algorithm"]
      Y2["Known answers (labels)"] --> L
      L --> M["Learned model = rules"]
    end
    M --> N["New unseen data"]
    N --> Q["Predictions"]`
  },

  "what-is-de": {
    prerequisites: [],
    related: ["etl-vs-elt", "what-is-ml", "airflow", "warehouse-vs-lake"],
    diagram: `flowchart LR
    A[("App databases (OLTP)")] --> D["Ingestion: batch or CDC"]
    B["Event streams / Kafka"] --> D
    C["3rd-party APIs & files"] --> D
    D --> E[("Raw zone: data lake")]
    E --> F["Transform: clean, join, aggregate (Spark / dbt)"]
    F --> G[("Curated warehouse / lakehouse")]
    G --> H["BI dashboards"]
    G --> I["ML feature pipelines"]
    O["Orchestrator (Airflow)"] -.-> D
    O -.-> F`
  },

  "supervised-vs-unsupervised": {
    prerequisites: ["what-is-ml"],
    related: ["what-is-classification", "what-is-regression", "what-is-clustering", "q-learning"],
    diagram: `flowchart TD
    A(["What does your data / signal look like?"]) --> B{"Labeled target y available?"}
    B -->|"yes"| C["Supervised learning"]
    C --> D{"Target type?"}
    D -->|"category"| E["Classification"]
    D -->|"number"| F["Regression"]
    B -->|"no labels"| G["Unsupervised learning"]
    G --> H["Clustering"]
    G --> I["Dimensionality reduction"]
    B -->|"only rewards from actions"| J["Reinforcement learning"]
    J --> K["Agent acts → environment → reward → update policy"]
    K --> J`
  },

  "what-is-classification": {
    prerequisites: ["supervised-vs-unsupervised"],
    related: ["what-is-regression", "logistic-regression", "confusion-matrix-concept", "precision-recall-f1"],
    diagram: `flowchart TD
    A[("Labeled examples: features + class")] --> B["Train classifier"]
    B --> C["Learn decision boundary"]
    N["New sample"] --> D["Model outputs class probabilities"]
    C --> D
    D --> E{"Probability ≥ threshold?"}
    E -->|"yes"| F["Predict positive class"]
    E -->|"no"| G["Predict negative class"]
    F --> H["Evaluate: confusion matrix, F1, ROC-AUC"]
    G --> H`
  },

  "what-is-regression": {
    prerequisites: ["supervised-vs-unsupervised"],
    related: ["what-is-classification", "linear-regression", "rmse-metric", "r2-score"],
    diagram: `flowchart LR
    A[("Features X + numeric target y")] --> B["Choose model family"]
    B --> C["Fit: minimize squared / absolute error"]
    C --> D["Learned function f(x)"]
    N["New sample x"] --> E["Predict continuous ŷ = f(x)"]
    D --> E
    E --> F["Residuals y − ŷ on test set"]
    F --> G["Metrics: MAE, RMSE, R²"]
    G --> H{"Error acceptable?"}
    H -->|"no"| B`
  },

  "what-is-clustering": {
    prerequisites: ["supervised-vs-unsupervised"],
    related: ["kmeans", "dbscan", "hierarchical-clustering", "silhouette-score"],
    diagram: `flowchart TD
    A[("Unlabeled data")] --> B["Scale features"]
    B --> C["Define similarity: distance or density"]
    C --> D{"Expected cluster shape?"}
    D -->|"round, known k"| E["K-Means / GMM"]
    D -->|"arbitrary shapes + noise"| F["DBSCAN"]
    D -->|"nested groups"| G["Hierarchical clustering"]
    E --> H["Assign each point a cluster id"]
    F --> H
    G --> H
    H --> I["Validate: silhouette score + domain review"]
    I --> J["Name & act on segments"]`
  },

  "what-is-dimensionality-reduction": {
    prerequisites: ["supervised-vs-unsupervised", "linear-algebra"],
    related: ["pca", "tsne-umap", "curse-of-dimensionality", "feature-selection"],
    diagram: `flowchart TD
    A[("High-dimensional data: many features")] --> B{"Goal?"}
    B -->|"keep original features"| C["Feature selection: drop weak columns"]
    B -->|"compress into new axes"| D["Feature extraction"]
    D --> E{"Linear structure?"}
    E -->|"yes"| F["PCA: project onto top variance directions"]
    E -->|"no, curved manifold"| G["t-SNE / UMAP / autoencoder"]
    C --> H["Fewer dimensions"]
    F --> H
    G --> H
    H --> I["Faster training, less noise, 2D plots"]`
  },

  "what-is-deep-learning": {
    prerequisites: ["what-is-ml", "what-is-gradient-descent"],
    related: ["mlp-neural-network", "cnn", "transformer-architecture", "activation-functions"],
    diagram: `flowchart LR
    A["Raw input: pixels, tokens, audio"] --> B["Layer 1: simple features (edges, characters)"]
    B --> C["Hidden layers: combinations (shapes, words)"]
    C --> D["Deep layers: abstract concepts (faces, meaning)"]
    D --> E["Output: prediction"]
    E --> F["Loss vs true label"]
    F --> G["Backpropagation computes gradients"]
    G --> H["Optimizer updates all weights"]
    H -.->|"repeat over many batches"| B`
  },

  "loss-vs-cost-function": {
    prerequisites: ["what-is-ml"],
    related: ["what-is-gradient-descent", "log-loss", "rmse-metric", "regularization-l1-l2"],
    diagram: `flowchart TD
    A["Sample 1: y₁ vs ŷ₁"] --> L1["Loss L₁"]
    B["Sample 2: y₂ vs ŷ₂"] --> L2["Loss L₂"]
    C["Sample n: yₙ vs ŷₙ"] --> L3["Loss Lₙ"]
    L1 --> J["Cost J(θ) = average of all losses"]
    L2 --> J
    L3 --> J
    R["Optional regularization penalty"] --> J
    J --> G["Gradient ∇J(θ)"]
    G --> U["Update parameters θ"]
    U -.->|"new predictions"| A`
  },

  "what-is-gradient-descent": {
    prerequisites: ["loss-vs-cost-function", "linear-algebra"],
    related: ["dl-optimizers", "linear-regression", "feature-scaling", "hyperparameter-tuning"],
    diagram: `flowchart TD
    A(["Initialize parameters θ randomly"]) --> B["Sample a mini-batch"]
    B --> C["Forward pass: compute predictions"]
    C --> D["Compute cost J(θ)"]
    D --> E["Compute gradient ∇J(θ)"]
    E --> F["Update: θ ← θ − α·∇J(θ)"]
    F --> G{"Converged or max epochs?"}
    G -->|"no"| B
    G -->|"yes"| H(["Final trained parameters"])`
  },

  "what-is-feature-engineering": {
    prerequisites: ["what-is-ml"],
    related: ["feature-scaling", "encoding-categorical", "feature-selection", "feature-store"],
    diagram: `flowchart LR
    A[("Raw columns")] --> B["Handle missing values (impute)"]
    B --> C{"Column type?"}
    C -->|"numeric"| D["Scale, log-transform, bin"]
    C -->|"categorical"| E["One-hot / target encoding"]
    C -->|"datetime"| F["Extract day, hour, recency"]
    C -->|"text"| G["TF-IDF / embeddings"]
    D --> H["Create interactions & aggregates"]
    E --> H
    F --> H
    G --> H
    H --> I["Feature selection"]
    I --> J["Model-ready matrix X"]`
  },

  "etl-vs-elt": {
    prerequisites: ["what-is-de"],
    related: ["dbt", "lakehouse-architecture", "warehouse-vs-lake", "airflow"],
    diagram: `flowchart TD
    S[("Source systems")] --> Q{"Where is the transform compute?"}
    Q -->|"ETL"| E1["Extract"]
    E1 --> T1["Transform on separate engine (Spark / Python)"]
    T1 --> L1[("Load clean data into warehouse")]
    Q -->|"ELT"| E2["Extract"]
    E2 --> L2[("Load raw data into cloud warehouse / lake")]
    L2 --> T2["Transform in-warehouse with SQL (dbt)"]
    T2 --> M[("Analytics-ready models")]
    L1 --> BI["BI & ML consumers"]
    M --> BI`
  },

  "model-data-drift": {
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
    J --> K["Validate & redeploy new model"]`
  }
};
