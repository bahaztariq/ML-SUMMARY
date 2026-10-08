export default {
  id: "gradient-boosting",
  name: "Gradient Boosting (GBM & AdaBoost)",
  track: "ml-models",
  category: "Ensemble / Boosting",
  task: ["Classification", "Regression"],
  difficulty: "Intermediate",
  summary: "Builds a strong model by sequentially adding weak learners (usually shallow trees), each one correcting the errors of the ensemble built so far.",
  intuition: "The Golf Putt: Your first swing gets the ball roughly towards the hole. Every following putt is aimed only at the remaining distance, getting a little closer each time. AdaBoost does this by re-weighting the balls you missed; GBM does it by aiming directly at the leftover error (the residual).",
  whenToUse: "Medium-sized tabular datasets where you want higher accuracy than a Random Forest and can afford some tuning. Also the conceptual foundation for understanding XGBoost, LightGBM and CatBoost.",
  whenToAvoid: "Very large datasets (classic sklearn GBM is single-threaded and slow — prefer HistGradientBoosting, LightGBM or XGBoost), heavily noisy labels (AdaBoost chases mislabeled points), or when you need fully parallel training.",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: true,
    linearRelationship: false
  },
  parameters: [
    {
      name: "n_estimators",
      type: "int",
      default: "100",
      impact: "Number of sequential boosting stages (trees).",
      tuningTip: "Unlike Random Forest, too many stages DOES overfit. Pair a large value with early stopping (n_iter_no_change) on a validation split."
    },
    {
      name: "learning_rate",
      type: "float",
      default: "0.1",
      impact: "Shrinks each tree's contribution before it is added to the ensemble.",
      tuningTip: "Lower values (0.01–0.05) generalize better but need proportionally more trees. Tune together with n_estimators."
    },
    {
      name: "max_depth",
      type: "int",
      default: "3",
      impact: "Depth of each weak learner; controls the order of feature interactions captured.",
      tuningTip: "Keep shallow (2–6). Depth 1 (stumps) is classic AdaBoost and captures no interactions."
    },
    {
      name: "subsample",
      type: "float",
      default: "1.0",
      impact: "Fraction of rows used to fit each tree (Stochastic Gradient Boosting).",
      tuningTip: "0.6–0.9 adds randomness that reduces variance and speeds up training."
    }
  ],
  math: {
    formula: "F_m(x) = F_{m-1}(x) + η · h_m(x),  where h_m ≈ argmin_h Σ (r_im − h(x_i))²,  r_im = −∂L(y_i, F(x_i)) / ∂F",
    loss: "Any differentiable loss (MSE, Log-Loss, Huber); AdaBoost ≈ Exponential Loss",
    explanation: "Each stage fits a new tree h_m to the pseudo-residuals r_im — the negative gradient of the loss with respect to the current prediction. This is gradient descent performed in function space rather than parameter space. The learning rate η shrinks each step so no single tree dominates."
  },
  pros: [
    "Typically more accurate than Random Forest on structured/tabular data",
    "Flexible: works with any differentiable loss function",
    "Shallow trees keep each stage simple and interpretable via feature importance",
    "Strong theoretical grounding as functional gradient descent"
  ],
  cons: [
    "Sequential training cannot be parallelized across trees",
    "More hyperparameter-sensitive and easier to overfit than bagging",
    "AdaBoost is very sensitive to label noise and outliers",
    "Classic sklearn implementation is slow on large datasets"
  ],
  prerequisites: ["decision-tree", "ensemble-methods", "what-is-gradient-descent"],
  related: ["xgboost", "lightgbm", "catboost", "random-forest"],
  diagram: `flowchart TD
    A[("Training data X, y")] --> B["F0 = constant baseline (mean / log-odds)"]
    B --> C["Compute residuals r = −gradient of loss"]
    C --> D["Fit shallow tree h_m to residuals"]
    D --> E["Update F_m = F_m-1 + η · h_m"]
    E --> F{"Validation loss still improving?"}
    F -->|"yes"| C
    F -->|"no"| G(["Final model = sum of all trees"])
    G --> H["Prediction for new x"]`,
  codeSnippet: `from sklearn.ensemble import GradientBoostingClassifier, AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Gradient Boosting: each tree fits the negative gradient of the loss
gbm = GradientBoostingClassifier(
    n_estimators=1000,
    learning_rate=0.05,
    max_depth=3,
    subsample=0.8,
    validation_fraction=0.1,
    n_iter_no_change=20,    # early stopping
    random_state=42
)
gbm.fit(X_train, y_train)
print("GBM stages used:", gbm.n_estimators_)
print("GBM AUC:", roc_auc_score(y_test, gbm.predict_proba(X_test)[:, 1]))

# AdaBoost: re-weights misclassified samples, uses decision stumps
ada = AdaBoostClassifier(
    estimator=DecisionTreeClassifier(max_depth=1),
    n_estimators=300,
    learning_rate=0.5,
    random_state=42
)
ada.fit(X_train, y_train)
print("AdaBoost AUC:", roc_auc_score(y_test, ada.predict_proba(X_test)[:, 1]))`
};
