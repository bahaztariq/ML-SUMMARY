export default {
  id: "xgboost",
  name: "XGBoost",
  track: "ml-models",
  category: "Ensemble / Boosting",
  task: ["Classification", "Regression", "Ranking"],
  difficulty: "Advanced",
  summary: "An optimized, highly scalable implementation of Gradient Boosted Decision Trees using exact second-order Taylor expansion.",
  intuition: "Iterative Learning from Mistakes: Each subsequent tree is explicitly constructed to predict the residual errors (gradients) left behind by all preceding trees, step by step.",
  whenToUse: "The gold standard for competitive tabular machine learning. Use when you need top-tier predictive accuracy and have clean feature sets.",
  whenToAvoid: "Extremely dirty uncleaned datasets with high noise, or when full model interpretability and simple coefficients are legally mandated.",
  requirements: {
    scalingRequired: false,
    handlesMissing: true,
    outlierSensitive: true,
    linearRelationship: false
  },
  parameters: [
    {
      name: "learning_rate (eta)",
      type: "float",
      default: "0.3",
      impact: "Shrinkage factor applied to feature weights after each boost step.",
      tuningTip: "Lower values (0.01 to 0.1) prevent overfitting but require higher n_estimators."
    },
    {
      name: "max_depth",
      type: "int",
      default: "6",
      impact: "Maximum depth of a tree.",
      tuningTip: "Unlike Random Forest, keep this shallow (3 to 8). Deep boosted trees quickly overfit noise."
    },
    {
      name: "subsample",
      type: "float",
      default: "1.0",
      impact: "Subsample ratio of the training instances.",
      tuningTip: "Set to 0.7 - 0.85 to add stochastic variance reduction."
    },
    {
      name: "reg_lambda (L2) & reg_alpha (L1)",
      type: "float",
      default: "lambda=1, alpha=0",
      impact: "Regularization penalty on leaf weights.",
      tuningTip: "Increase reg_lambda to smooth extreme predictions; increase reg_alpha to induce feature sparsity."
    }
  ],
  math: {
    formula: "Obj^(t) ≈ ∑ [ g_i · f_t(x_i) + ½ · h_i · f_t²(x_i) ] + Ω(f_t)",
    loss: "Custom Objective + Regularization Ω(f) = γ·T + ½·λ·∑w_j²",
    explanation: "Uses 1st order gradients (g_i) and 2nd order Hessians (h_i) of the loss function via Taylor approximation, allowing exact closed-form optimal leaf weights and rapid convergence."
  },
  pros: [
    "State-of-the-art accuracy on almost every tabular benchmark dataset",
    "Native sparsity-aware split finding handles missing values automatically",
    "Built-in L1 and L2 regularization directly inside the objective function",
    "Hardware acceleration (CUDA GPU training, out-of-core memory streaming)"
  ],
  cons: [
    "Significant number of sensitive hyperparameters requiring careful tuning",
    "More prone to overfitting than Random Forest if learning_rate is too high",
    "Computationally demanding when running grid search without GPU"
  ],
  prerequisites: ["gradient-boosting", "regularization-l1-l2"],
  related: ["lightgbm", "catboost", "random-forest", "hyperparameter-tuning"],
  diagram: `flowchart TD
    A[("DMatrix: data + labels")] --> B["Current prediction F_t-1"]
    B --> C["Compute gradients g_i and Hessians h_i"]
    C --> D["Sparsity-aware split search: missing values get a default direction"]
    D --> E["Gain = score(left) + score(right) − score(parent) − γ"]
    E --> F["Optimal leaf weight w = −Σg / (Σh + λ)"]
    F --> G["F_t = F_t-1 + η · f_t"]
    G --> H{"Eval metric improved in last N rounds?"}
    H -->|"yes"| B
    H -->|"no"| I(["Early stop: keep best iteration"])`,
  codeSnippet: `import xgboost as xgb
from sklearn.metrics import roc_auc_score

# Convert to DMatrix for optimal speed
dtrain = xgb.DMatrix(X_train, label=y_train)
dtest = xgb.DMatrix(X_test, label=y_test)

params = {
    'objective': 'binary:logistic',
    'eval_metric': 'auc',
    'learning_rate': 0.05,
    'max_depth': 5,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'reg_lambda': 2.0
}

# Early stopping prevents overfitting automatically
model = xgb.train(
    params,
    dtrain,
    num_boost_round=1000,
    evals=[(dtest, 'val')],
    early_stopping_rounds=30
)`
};
