export default {
  id: "catboost",
  name: "CatBoost",
  track: "ml-models",
  category: "Ensemble / Boosting",
  task: ["Classification", "Regression", "Ranking"],
  difficulty: "Advanced",
  summary: "A gradient boosting library from Yandex that natively handles categorical features with ordered target statistics and uses symmetric trees for fast, robust predictions.",
  intuition: "The Honest Exam Grader: When encoding a category (like 'city') by its average target, a naive grader peeks at the student's own answer and leaks it. CatBoost lines the students up in a random order and grades each one using only the students who came before — so no row ever sees its own label.",
  whenToUse: "Tabular data with many high-cardinality categorical columns (user IDs, cities, product codes). Great out-of-the-box performance with default hyperparameters and minimal preprocessing.",
  whenToAvoid: "Purely numeric datasets where LightGBM is usually faster to train, extremely large datasets on CPU-only machines with tight time budgets, or when model size must be tiny.",
  requirements: {
    scalingRequired: false,
    handlesMissing: true,
    outlierSensitive: false,
    handlesCategorical: true
  },
  parameters: [
    {
      name: "iterations",
      type: "int",
      default: "1000",
      impact: "Maximum number of boosting rounds (trees).",
      tuningTip: "Set high and rely on early_stopping_rounds with an eval_set."
    },
    {
      name: "learning_rate",
      type: "float",
      default: "auto (≈0.03)",
      impact: "Step size for each tree's contribution.",
      tuningTip: "CatBoost picks a sensible value automatically based on data size; lower it if validation loss is noisy."
    },
    {
      name: "depth",
      type: "int",
      default: "6",
      impact: "Depth of the symmetric (oblivious) trees.",
      tuningTip: "4–10. Symmetric trees grow 2^depth leaves, so each extra level doubles complexity."
    },
    {
      name: "cat_features",
      type: "list",
      default: "None",
      impact: "Columns to treat as categorical using ordered target statistics.",
      tuningTip: "Pass raw string columns directly — do NOT one-hot or label-encode them first."
    },
    {
      name: "l2_leaf_reg",
      type: "float",
      default: "3",
      impact: "L2 regularization on leaf values.",
      tuningTip: "Increase (5–10) on small or noisy datasets to reduce overfitting."
    }
  ],
  math: {
    formula: "TS(x_k) = ( Σ_{j<k, x_j = x_k} y_j + a · p ) / ( Σ_{j<k, x_j = x_k} 1 + a )",
    loss: "Log-Loss / RMSE / custom, optimized with Ordered Boosting",
    explanation: "Each categorical value is replaced by a smoothed average of the target computed only over rows that precede it in a random permutation (j < k), with a prior p weighted by a. This prevents target leakage. Ordered Boosting applies the same trick to residuals, reducing prediction shift bias common in other GBMs."
  },
  pros: [
    "Native categorical support without manual encoding or target leakage",
    "Excellent accuracy with default hyperparameters",
    "Symmetric trees make inference extremely fast and less prone to overfitting",
    "Built-in GPU training, SHAP values and missing value handling"
  ],
  cons: [
    "Slower to train than LightGBM on purely numeric data",
    "Larger memory footprint during training with many categorical combinations",
    "Fewer community examples than XGBoost",
    "Symmetric trees can be less expressive on some datasets"
  ],
  prerequisites: ["gradient-boosting", "encoding-categorical"],
  related: ["xgboost", "lightgbm", "class-imbalance"],
  diagram: `flowchart TD
    A[("Raw tabular data with string categories")] --> B["Random permutation of rows"]
    B --> C["Ordered target statistics: encode each row using only previous rows"]
    C --> D["Numeric + encoded categorical features"]
    D --> E["Build symmetric tree: same split at every level"]
    E --> F["Ordered boosting: residuals computed without the row's own label"]
    F --> G{"Early stopping on eval set?"}
    G -->|"continue"| E
    G -->|"stop"| H(["Final ensemble of oblivious trees"])
    H --> I["Fast inference via bit-indexed leaf lookup"]`,
  codeSnippet: `from catboost import CatBoostClassifier, Pool
from sklearn.model_selection import train_test_split

# df contains raw string columns like 'city', 'device', 'plan'
cat_cols = ['city', 'device', 'plan']
X = df.drop(columns=['churn'])
y = df['churn']

X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

train_pool = Pool(X_train, y_train, cat_features=cat_cols)
val_pool = Pool(X_val, y_val, cat_features=cat_cols)

model = CatBoostClassifier(
    iterations=2000,
    depth=6,
    l2_leaf_reg=3,
    eval_metric='AUC',
    early_stopping_rounds=100,
    random_seed=42,
    verbose=200
)
model.fit(train_pool, eval_set=val_pool, use_best_model=True)

# Feature importance (handles categorical columns natively)
importances = model.get_feature_importance(prettified=True)
print(importances.head(10))`
};
