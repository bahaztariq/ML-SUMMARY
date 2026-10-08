export default {
  id: "model-interpretability",
  name: "Model Interpretability (SHAP & Permutation Importance)",
  track: "ml-core",
  category: "ML Theory & Diagnostics",
  task: ["Evaluation", "Definition"],
  difficulty: "Advanced",
  summary: "Techniques that explain which features drive a model's predictions, globally across the dataset and locally for a single prediction, so models can be debugged, trusted and audited.",
  intuition: "The Group Project Grade: The team got 90/100, but who contributed what? SHAP fairly splits the credit by imagining every possible combination of teammates and measuring how much the score changes when each person joins. Permutation importance asks a simpler question: if we swapped one teammate for a random stranger, how much would the grade drop?",
  whenToUse: "Regulated domains (credit, insurance, healthcare) that require explanations, debugging suspicious models (leakage, spurious correlations), communicating drivers to stakeholders, and per-customer reason codes.",
  whenToAvoid: "As proof of causation (explanations describe the model, not the world), or with strongly correlated features without care, where importance gets split or misattributed between correlated twins.",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: false,
    modelAgnostic: true,
    needsHeldOutData: true
  },
  parameters: [
    {
      name: "explainer type",
      type: "concept",
      default: "shap.Explainer (auto)",
      impact: "TreeExplainer is exact and fast for tree ensembles; LinearExplainer for linear models; KernelExplainer is model-agnostic but slow.",
      tuningTip: "For XGBoost/LightGBM/Random Forest always use TreeExplainer; it computes exact SHAP values in polynomial time."
    },
    {
      name: "background data",
      type: "DataFrame",
      default: "training sample",
      impact: "Reference distribution that defines the 'average' prediction features are compared against.",
      tuningTip: "A representative sample of 100 to 1,000 rows (or shap.kmeans summary) keeps KernelExplainer tractable."
    },
    {
      name: "n_repeats (permutation)",
      type: "int",
      default: "5",
      impact: "How many times each feature is shuffled; averages out randomness.",
      tuningTip: "Use 10+ and report the std; compute on a validation set, not training data, to measure real predictive value."
    },
    {
      name: "scoring (permutation)",
      type: "str",
      default: "model.score",
      impact: "Metric whose drop defines importance.",
      tuningTip: "Use the same metric you optimize in production (e.g. 'roc_auc' or 'neg_mean_absolute_error')."
    }
  ],
  math: {
    formula: "φⱼ = Σ_{S ⊆ F∖{j}} [ |S|!·(|F|−|S|−1)! / |F|! ] · [ f(S ∪ {j}) − f(S) ]",
    loss: "Shapley value attribution",
    explanation: "The SHAP value φⱼ of feature j is its average marginal contribution to the prediction over every possible ordering of features. The attributions are additive: base value + Σφⱼ equals the model's output for that sample exactly. Permutation importance is simpler: Score(original) − Score(feature j shuffled)."
  },
  pros: [
    "SHAP gives both global importance and local, per-prediction explanations",
    "Additive and theoretically grounded (consistency, local accuracy)",
    "Permutation importance is model-agnostic and measured on held-out data",
    "Exposes data leakage and spurious shortcuts before deployment"
  ],
  cons: [
    "KernelSHAP is very slow on large datasets and many features",
    "Correlated features split or distort importance in both methods",
    "Explanations describe the model's behavior, not causal effects",
    "Impurity-based (MDI) tree importances are biased toward high-cardinality features"
  ],
  prerequisites: ["train-test-split", "decision-tree"],
  related: ["feature-selection", "xgboost", "random-forest", "model-data-drift"],
  diagram: `flowchart TD
    A["Trained model + validation data"] --> B{"Question to answer"}
    B -->|"global: which features matter?"| C["Shuffle one feature column"]
    C --> D["Re-score model on validation"]
    D --> E["Importance = score drop"]
    E --> F{"More features?"}
    F -->|"yes"| C
    F -->|"no"| G["Ranked feature importance"]
    B -->|"local: why this prediction?"| H["Compare feature coalitions vs background"]
    H --> I["SHAP value per feature"]
    I --> J["Base value + Σ SHAP = prediction"]
    J --> K(["Reason codes / waterfall plot"])`,
  codeSnippet: `import shap
from sklearn.inspection import permutation_importance
from xgboost import XGBClassifier

model = XGBClassifier(n_estimators=400, max_depth=4, learning_rate=0.05)
model.fit(X_train, y_train)

# 1) Permutation importance on HELD-OUT data (global)
perm = permutation_importance(model, X_val, y_val, n_repeats=10,
                              scoring="roc_auc", random_state=42, n_jobs=-1)
for idx in perm.importances_mean.argsort()[::-1][:10]:
    print(f"{X_val.columns[idx]:<25} {perm.importances_mean[idx]:.4f}"
          f" ± {perm.importances_std[idx]:.4f}")

# 2) SHAP values (exact + fast for trees)
explainer = shap.TreeExplainer(model)
shap_values = explainer(X_val)

shap.plots.beeswarm(shap_values)        # global: direction + magnitude
shap.plots.waterfall(shap_values[0])    # local: why THIS customer?

# Additivity check: base value + sum of contributions = model output (log-odds)
row = shap_values[0]
print(row.base_values + row.values.sum())`
};
