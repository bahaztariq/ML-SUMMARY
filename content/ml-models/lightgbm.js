export default {
  id: "lightgbm",
  name: "LightGBM",
  track: "ml-models",
  category: "Ensemble / Boosting",
  task: ["Classification", "Regression", "Ranking"],
  difficulty: "Advanced",
  summary: "A gradient boosting framework by Microsoft that uses histogram-based split finding and leaf-wise tree growth for drastically faster training on large datasets compared to XGBoost.",
  intuition: "The Speed Demon of Boosting: XGBoost considers every possible split point. LightGBM buckets continuous features into ~255 histogram bins and only evaluates bin edges, making it 10-20x faster on large data with negligible accuracy loss.",
  whenToUse: "Large tabular datasets (>100K rows). Kaggle competitions. When training speed matters. When you have high-cardinality categorical features.",
  whenToAvoid: "Very small datasets (<2000 samples) where it may overfit aggressively due to leaf-wise growth.",
  requirements: {
    scalingRequired: false,
    handlesMissing: true,
    outlierSensitive: true,
    linearRelationship: false
  },
  parameters: [
    {
      name: "num_leaves",
      type: "int",
      default: "31",
      impact: "Maximum number of leaves per tree. Controls model complexity.",
      tuningTip: "num_leaves < 2^max_depth to avoid overfitting. Start with 31 and tune between 20-100."
    },
    {
      name: "learning_rate",
      type: "float",
      default: "0.1",
      impact: "Step size shrinkage to prevent overfitting.",
      tuningTip: "Lower values (0.01-0.05) require more boosting rounds but generalize better."
    },
    {
      name: "feature_fraction (colsample_bytree)",
      type: "float",
      default: "1.0",
      impact: "Fraction of features randomly selected for each tree.",
      tuningTip: "Set to 0.6-0.9 to add randomness and reduce overfitting (like Random Forest does)."
    },
    {
      name: "categorical_feature",
      type: "list",
      default: "auto",
      impact: "Specify which features are categorical for native optimal split handling.",
      tuningTip: "LightGBM handles categoricals natively (no One-Hot needed!) using optimal split algorithms."
    }
  ],
  math: {
    formula: "Histogram Split: O(#bins) instead of O(#data × #features)",
    loss: "Gradient One-Side Sampling (GOSS) + Exclusive Feature Bundling (EFB)",
    explanation: "GOSS keeps all instances with large gradients and randomly samples small-gradient instances, focusing computation where the model is most wrong. EFB bundles mutually exclusive sparse features to reduce dimensionality."
  },
  pros: [
    "10-20x faster training than XGBoost on large datasets due to histogram-based splits",
    "Native optimal categorical feature handling (no manual encoding needed)",
    "Lower memory consumption through histogram binning",
    "State-of-the-art accuracy competitive with XGBoost"
  ],
  cons: [
    "Leaf-wise growth can overfit on small datasets (use max_depth limiter)",
    "Less community documentation compared to XGBoost",
    "Sensitive to num_leaves hyperparameter"
  ],
  prerequisites: ["gradient-boosting"],
  related: ["xgboost", "catboost", "random-forest", "time-series-forecasting"],
  diagram: `flowchart TD
    A[("Large tabular data")] --> B["Bucket features into histograms (max_bin)"]
    B --> C["GOSS: keep large-gradient rows, sample small-gradient rows"]
    C --> D["EFB: bundle mutually exclusive sparse features"]
    D --> E["Leaf-wise growth: split the leaf with max gain"]
    E --> F{"num_leaves or min_data_in_leaf reached?"}
    F -->|"no"| E
    F -->|"yes"| G["Add tree × learning_rate to ensemble"]
    G --> H{"Early stopping?"}
    H -->|"continue"| C
    H -->|"stop"| I(["Final boosted model"])`,
  codeSnippet: `import lightgbm as lgb
from sklearn.model_selection import train_test_split

X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2)

train_data = lgb.Dataset(X_train, label=y_train)
val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)

params = {
    'objective': 'binary',
    'metric': 'auc',
    'num_leaves': 31,
    'learning_rate': 0.05,
    'feature_fraction': 0.8,
    'verbose': -1
}

model = lgb.train(
    params, train_data,
    num_boost_round=1000,
    valid_sets=[val_data],
    callbacks=[lgb.early_stopping(30)]
)

print(f"Best AUC: {model.best_score['valid_0']['auc']:.4f}")`
};
