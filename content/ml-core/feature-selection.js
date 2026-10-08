export default {
  id: "feature-selection",
  name: "Feature Selection (Filter, Wrapper & Embedded Methods)",
  track: "ml-core",
  category: "Preprocessing & Feature Engineering",
  task: ["Preprocessing", "Optimization"],
  difficulty: "Intermediate",
  summary: "Choosing the subset of input features that carries real signal, to reduce overfitting, speed up training and make models easier to explain.",
  intuition: "Packing a Suitcase: You cannot take your whole wardrobe on a trip. Filter methods throw out anything obviously useless (winter coat for the beach), wrapper methods try outfits on and keep what works together, and embedded methods let the airline's weight limit (L1 penalty) force you to drop the heavy, low-value items.",
  whenToUse: "Wide datasets with many weak, redundant or noisy features; when inference latency or data-collection cost per feature matters; when stakeholders need a short list of drivers.",
  whenToAvoid: "Deep learning on raw images/audio/text (the network learns its own features), or tiny gains on already-small feature sets where selection mostly adds variance and leakage risk.",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: true,
    fitInsideCV: true
  },
  parameters: [
    {
      name: "method family",
      type: "concept",
      default: "filter",
      impact: "Filter (statistics like mutual information, chi², variance) is fast and model-agnostic; wrapper (RFE, sequential selection) is accurate but expensive; embedded (L1, tree importance) selects during training.",
      tuningTip: "Start with a cheap filter to drop junk, then an embedded method; reserve wrappers for under ~100 features."
    },
    {
      name: "k / n_features_to_select",
      type: "int",
      default: "10 (SelectKBest)",
      impact: "How many features survive.",
      tuningTip: "Treat it as a hyperparameter and tune it with cross-validation instead of guessing."
    },
    {
      name: "score_func",
      type: "callable",
      default: "f_classif",
      impact: "Statistic used to rank features in filter methods.",
      tuningTip: "f_classif / f_regression only catch linear relationships; mutual_info_classif catches non-linear ones."
    },
    {
      name: "threshold (SelectFromModel)",
      type: "str or float",
      default: "'mean'",
      impact: "Importance cutoff below which features are dropped.",
      tuningTip: "'median' keeps half the features; with Lasso, any non-zero coefficient survives so tune alpha instead."
    }
  ],
  math: {
    formula: "I(X; Y) = Σₓ Σᵧ p(x,y) · log[ p(x,y) / (p(x)·p(y)) ]",
    loss: "Mutual information (filter) / validation score (wrapper) / L1 penalty λ·Σ|wⱼ| (embedded)",
    explanation: "Mutual information measures how much knowing feature X reduces uncertainty about target Y, and is zero only if they are independent. Wrapper methods instead search feature subsets by retraining and scoring the model; embedded methods like Lasso push useless weights exactly to zero during optimization."
  },
  pros: [
    "Reduces overfitting and variance, especially when features outnumber samples",
    "Faster training and inference, cheaper data pipelines",
    "Produces simpler, more explainable models",
    "Removes redundant and noisy columns that confuse distance-based models"
  ],
  cons: [
    "Selecting on the full dataset before CV leaks information and inflates scores",
    "Univariate filters miss features that only matter in interaction",
    "Wrapper methods are computationally expensive (many model refits)",
    "Selected sets can be unstable across folds when features are correlated"
  ],
  prerequisites: ["what-is-feature-engineering", "overfitting-underfitting"],
  related: ["regularization-l1-l2", "curse-of-dimensionality", "pca", "model-interpretability"],
  diagram: `flowchart TD
    A["All candidate features"] --> B["Filter: drop constant and low-MI features"]
    B --> C{"Method family"}
    C -->|"wrapper"| D["Train model on a subset"]
    D --> E["Score subset with cross-validation"]
    E --> F{"Removing a feature helps?"}
    F -->|"yes"| D
    F -->|"no"| G["Selected subset"]
    C -->|"embedded"| H["Train with L1 or tree importances"]
    H --> I["Keep features above threshold"]
    I --> G
    G --> J["Final model on selected features"]`,
  codeSnippet: `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import (VarianceThreshold, SelectKBest,
                                       mutual_info_classif, SelectFromModel, RFECV)
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV

# Filter + embedded selection INSIDE a pipeline (no leakage)
pipe = Pipeline([
    ("var", VarianceThreshold(threshold=0.0)),          # drop constant columns
    ("filter", SelectKBest(mutual_info_classif, k=30)),  # non-linear filter
    ("scale", StandardScaler()),
    ("l1", SelectFromModel(LogisticRegression(penalty="l1", C=0.1,
                                              solver="liblinear"))),
    ("clf", RandomForestClassifier(n_estimators=300, random_state=42)),
])

# Tune how many features to keep like any other hyperparameter
grid = GridSearchCV(pipe, {"filter__k": [10, 20, 30, 50]},
                    cv=5, scoring="roc_auc", n_jobs=-1)
grid.fit(X_train, y_train)
print("Best k:", grid.best_params_)

# Wrapper: recursive feature elimination with built-in CV
rfecv = RFECV(RandomForestClassifier(n_estimators=200, random_state=42),
              step=1, cv=5, scoring="roc_auc").fit(X_train, y_train)
print("Optimal #features:", rfecv.n_features_)`
};
