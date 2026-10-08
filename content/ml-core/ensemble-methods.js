export default {
  id: "ensemble-methods",
  name: "Ensemble Methods (Bagging vs Boosting vs Stacking)",
  track: "ml-core",
  category: "ML Theory & Optimization",
  task: ["Classification", "Regression", "Architecture"],
  difficulty: "Intermediate",
  summary: "Combining many models into one stronger predictor: bagging averages independent models to cut variance, boosting chains models that fix each other's errors to cut bias, and stacking learns how to blend different model types.",
  intuition: "Three Ways to Run a Quiz Team: Bagging asks 100 students who each studied a random chunk of the textbook and takes a vote. Boosting has students answer in sequence, each one drilling specifically on the questions the previous student got wrong. Stacking hires a captain who has learned which teammate to trust on which kind of question.",
  whenToUse: "Almost any tabular prediction problem where accuracy matters: bagging (Random Forest) for a robust low-tuning baseline, boosting (XGBoost/LightGBM) for top accuracy, stacking for the last few points in competitions.",
  whenToAvoid: "Strict latency or memory budgets, when a single interpretable model is legally required, or when base models are all highly correlated (ensembling identical errors does not help).",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: false,
    needsDiverseBaseModels: true
  },
  parameters: [
    {
      name: "strategy",
      type: "concept",
      default: "bagging",
      impact: "Bagging = parallel, reduces variance; Boosting = sequential, reduces bias; Stacking = meta-learner over heterogeneous models.",
      tuningTip: "Deep, overfitting base learners → bag them. Shallow, underfitting learners (stumps) → boost them."
    },
    {
      name: "n_estimators",
      type: "int",
      default: "100",
      impact: "Number of base models. More bagged models never hurts accuracy; more boosting rounds can overfit.",
      tuningTip: "For boosting, set it high and use early stopping on a validation set."
    },
    {
      name: "learning_rate (boosting)",
      type: "float",
      default: "0.1",
      impact: "Shrinks each new model's contribution.",
      tuningTip: "Lower (0.01 to 0.05) with more estimators generalizes better at the cost of training time."
    },
    {
      name: "final_estimator (stacking)",
      type: "estimator",
      default: "LogisticRegression / RidgeCV",
      impact: "Meta-model trained on out-of-fold predictions of the base models.",
      tuningTip: "Keep it simple and regularized; a complex meta-model overfits the base predictions."
    },
    {
      name: "voting",
      type: "str",
      default: "'hard'",
      impact: "Hard voting counts labels; soft voting averages probabilities.",
      tuningTip: "Prefer 'soft' when base models produce reasonably calibrated probabilities."
    }
  ],
  math: {
    formula: "Bagging: f̂ = (1/B) Σ_b f_b(x)  ·  Boosting: F_m(x) = F_{m−1}(x) + η · h_m(x)",
    loss: "Variance reduction (bagging) / stage-wise loss minimization (boosting)",
    explanation: "Averaging B models with pairwise correlation ρ gives variance ρσ² + (1−ρ)σ²/B, so diverse models reduce variance. Boosting adds a new weak learner h_m fitted to the residuals (negative gradient) of the current ensemble, scaled by learning rate η, steadily reducing bias."
  },
  pros: [
    "Consistently among the most accurate methods on tabular data",
    "Bagging is highly parallel and resistant to overfitting",
    "Boosting can turn very weak learners into a strong model",
    "Stacking exploits complementary strengths of different algorithm families"
  ],
  cons: [
    "Larger, slower models than a single learner",
    "Harder to interpret than one tree or one linear model",
    "Boosting is sensitive to noisy labels and requires careful tuning",
    "Stacking needs out-of-fold predictions to avoid leakage, adding complexity"
  ],
  prerequisites: ["decision-tree", "bias-variance-tradeoff"],
  related: ["random-forest", "gradient-boosting", "xgboost", "lightgbm"],
  diagram: `flowchart TD
    A["Training data"] --> B{"Ensemble strategy"}
    B -->|"bagging"| C["Bootstrap samples in parallel"]
    C --> D["Independent deep models"]
    D --> E["Average / majority vote → lower variance"]
    B -->|"boosting"| F["Fit weak model"]
    F --> G["Compute residuals / reweight errors"]
    G --> H["Fit next model on the errors"]
    H -->|"repeat m times"| G
    H --> I["Weighted sum → lower bias"]
    B -->|"stacking"| J["Diverse base models"]
    J --> K["Out-of-fold predictions"]
    K --> L["Meta-learner blends predictions"]`,
  codeSnippet: `from sklearn.ensemble import (BaggingClassifier, GradientBoostingClassifier,
                              RandomForestClassifier, StackingClassifier,
                              VotingClassifier)
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.model_selection import cross_val_score

# Bagging: deep (high-variance) trees on bootstrap samples, in parallel
bagging = BaggingClassifier(DecisionTreeClassifier(max_depth=None),
                            n_estimators=200, n_jobs=-1, random_state=42)

# Boosting: shallow (high-bias) trees, sequentially fixing residuals
boosting = GradientBoostingClassifier(n_estimators=300, learning_rate=0.05,
                                      max_depth=3, random_state=42)

# Stacking: meta-learner trained on 5-fold out-of-fold predictions
stacking = StackingClassifier(
    estimators=[("rf", RandomForestClassifier(n_estimators=200)),
                ("gb", boosting),
                ("svm", SVC(probability=True))],
    final_estimator=LogisticRegression(),
    cv=5, n_jobs=-1)

soft_vote = VotingClassifier([("bag", bagging), ("gb", boosting)], voting="soft")

for name, m in [("bagging", bagging), ("boosting", boosting),
                ("stacking", stacking), ("voting", soft_vote)]:
    s = cross_val_score(m, X, y, cv=5, scoring="roc_auc")
    print(f"{name:<9} AUC {s.mean():.3f} ± {s.std():.3f}")`
};
