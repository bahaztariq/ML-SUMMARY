/**
 * Core ML Theory — additional concepts and relationship/diagram enrichments.
 */

export const newConcepts = [
  {
    id: "precision-recall-f1",
    name: "Precision, Recall & F1-Score",
    track: "ml-core",
    category: "Evaluation Metrics",
    task: ["Evaluation", "Classification"],
    difficulty: "Beginner",
    summary: "Threshold-dependent classification metrics that measure how trustworthy positive predictions are (precision), how many real positives are caught (recall), and their harmonic balance (F1).",
    intuition: "The Fishing Net: Precision asks 'of everything in my net, how much is actually fish (not boots and seaweed)?'. Recall asks 'of all the fish in the lake, how many did my net catch?'. A huge net catches every fish (high recall) but also tons of junk (low precision); F1 rewards a net that does both well.",
    whenToUse: "Any classification task where accuracy is misleading, especially imbalanced problems (fraud, disease, spam). Use precision when false positives are costly, recall when false negatives are costly, F1 when both matter.",
    whenToAvoid: "When you need a threshold-independent ranking metric (use ROC-AUC or PR-AUC), or when classes are balanced and errors cost the same (plain accuracy is simpler to communicate).",
    requirements: {
      scalingRequired: false,
      handlesMissing: false,
      outlierSensitive: false,
      thresholdDependent: true,
      needsPositiveClassDefined: true
    },
    parameters: [
      {
        name: "average",
        type: "str",
        default: "'binary'",
        impact: "How per-class scores are combined for multiclass: 'macro' (unweighted mean), 'weighted' (by support), 'micro' (global counts).",
        tuningTip: "Use 'macro' when every class matters equally (rare classes count as much as common ones); 'weighted' to reflect class frequencies."
      },
      {
        name: "pos_label",
        type: "int or str",
        default: "1",
        impact: "Which class is treated as the 'positive' event of interest.",
        tuningTip: "Always set it to the RARE, important class (fraud = 1, disease = 1). Swapping it changes every number."
      },
      {
        name: "beta (F-beta)",
        type: "float",
        default: "1.0",
        impact: "Weights recall β times as important as precision in the F-beta score.",
        tuningTip: "β=2 for medical screening (missing a sick patient is worse); β=0.5 for spam filters (blocking real email is worse)."
      },
      {
        name: "decision threshold",
        type: "float",
        default: "0.5",
        impact: "Probability cutoff above which a sample is labeled positive. Raising it increases precision and lowers recall.",
        tuningTip: "Tune the threshold on a validation set to hit a business target (e.g. 'recall ≥ 0.95'), never on the test set."
      }
    ],
    math: {
      formula: "P = TP/(TP+FP) · R = TP/(TP+FN) · F1 = 2·P·R/(P+R)",
      loss: "Harmonic mean of Precision and Recall",
      explanation: "Precision divides true positives by everything predicted positive; recall divides true positives by everything actually positive. F1 uses the harmonic mean, which collapses toward the smaller value, so a model cannot score well by maximizing only one of the two."
    },
    pros: [
      "Directly interpretable in business terms (false alarms vs missed cases)",
      "Robust to class imbalance, unlike plain accuracy",
      "F-beta lets you encode the relative cost of FP vs FN in a single number",
      "Per-class reports expose which classes a multiclass model struggles with"
    ],
    cons: [
      "Depends on a single decision threshold (one point on the PR curve)",
      "Ignores true negatives entirely, so it says nothing about specificity",
      "Macro/micro/weighted averages can tell very different stories for multiclass",
      "F1 assumes precision and recall are equally important, which is rarely true"
    ],
    codeSnippet: `from sklearn.metrics import (precision_score, recall_score, f1_score,
                             fbeta_score, classification_report)
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42)

clf = LogisticRegression(max_iter=1000).fit(X_train, y_train)

# Default threshold = 0.5
y_pred = clf.predict(X_test)
print(f"Precision: {precision_score(y_test, y_pred):.3f}")
print(f"Recall:    {recall_score(y_test, y_pred):.3f}")
print(f"F1:        {f1_score(y_test, y_pred):.3f}")
print(f"F2 (recall-heavy): {fbeta_score(y_test, y_pred, beta=2):.3f}")

# Custom threshold: trade precision for recall
proba = clf.predict_proba(X_test)[:, 1]
y_pred_low = (proba >= 0.3).astype(int)
print(f"Recall @0.3: {recall_score(y_test, y_pred_low):.3f}")

# Full per-class breakdown (macro + weighted averages included)
print(classification_report(y_test, y_pred, digits=3))`,
    prerequisites: ["confusion-matrix-concept", "what-is-classification"],
    related: ["roc-auc", "pr-curve", "class-imbalance", "log-loss"],
    diagram: `flowchart TD
    A["Predicted probabilities"] --> B{"proba ≥ threshold?"}
    B -->|"yes"| C["Predicted positive"]
    B -->|"no"| D["Predicted negative"]
    C --> E["TP: actually positive"]
    C --> F["FP: actually negative"]
    D --> G["FN: actually positive"]
    E --> H["Precision = TP / (TP + FP)"]
    F --> H
    E --> I["Recall = TP / (TP + FN)"]
    G --> I
    H --> J["F1 = harmonic mean of P and R"]
    I --> J`
  },

  {
    id: "pr-curve",
    name: "Precision-Recall Curve & Average Precision",
    track: "ml-core",
    category: "Evaluation Metrics",
    task: ["Evaluation", "Classification"],
    difficulty: "Intermediate",
    summary: "Plots precision against recall at every possible decision threshold and summarizes the curve with Average Precision (PR-AUC), the go-to ranking metric for rare-event classification.",
    intuition: "The Metal Detector Dial: Turn the sensitivity dial down and you only beep on gold (high precision) but walk past most coins (low recall). Turn it up and you find every coin but dig up bottle caps too. The PR curve records every dial position; a detector whose curve hugs the top-right corner is simply a better detector.",
    whenToUse: "Highly imbalanced binary problems (fraud, anomaly detection, rare disease, information retrieval) where you care about the positive class and true negatives are plentiful and uninteresting.",
    whenToAvoid: "Balanced problems where both classes matter equally (ROC-AUC is easier to interpret), or when you need calibrated probabilities rather than a ranking (use log-loss / Brier score).",
    requirements: {
      scalingRequired: false,
      handlesMissing: false,
      outlierSensitive: false,
      needsScoresNotLabels: true,
      thresholdIndependent: true
    },
    parameters: [
      {
        name: "y_score",
        type: "array",
        default: "predict_proba[:, 1]",
        impact: "Continuous scores used to rank samples. Hard 0/1 labels collapse the curve into a single point.",
        tuningTip: "Pass probabilities or decision_function outputs, never predict() labels."
      },
      {
        name: "pos_label",
        type: "int or str",
        default: "1",
        impact: "Defines which class the curve is computed for.",
        tuningTip: "Always the minority / event class; the curve for the majority class is usually near-perfect and meaningless."
      },
      {
        name: "baseline (prevalence)",
        type: "float",
        default: "P / (P + N)",
        impact: "A random classifier's PR-AUC equals the positive class rate, not 0.5.",
        tuningTip: "Always report AP next to prevalence: AP=0.30 is excellent when positives are 0.5% of data."
      },
      {
        name: "operating point",
        type: "float",
        default: "chosen threshold",
        impact: "The single threshold you deploy, picked from the curve.",
        tuningTip: "Pick the threshold that meets a business constraint (e.g. precision ≥ 0.9) using the thresholds array returned by precision_recall_curve."
      }
    ],
    math: {
      formula: "AP = Σₙ (Rₙ − Rₙ₋₁) · Pₙ",
      loss: "Area under the Precision-Recall curve",
      explanation: "Samples are sorted by score; at each threshold n we record precision Pₙ and recall Rₙ. Average Precision sums the precision at each recall step weighted by how much recall increased, approximating the area under the curve without optimistic linear interpolation."
    },
    pros: [
      "Focuses entirely on the positive class, so huge numbers of easy negatives cannot inflate it",
      "Much more sensitive than ROC-AUC to improvements on rare-event problems",
      "Threshold-independent summary plus a visual tool for choosing an operating point",
      "Standard metric in information retrieval and object detection (mAP)"
    ],
    cons: [
      "Baseline depends on prevalence, so scores are not comparable across datasets",
      "Curve is jagged and noisy when there are few positives",
      "Ignores true negatives, which matter in some applications",
      "Harder to explain to stakeholders than a single precision/recall pair"
    ],
    codeSnippet: `import matplotlib.pyplot as plt
from sklearn.metrics import (precision_recall_curve, average_precision_score,
                             PrecisionRecallDisplay)

# Scores, not labels!
proba = model.predict_proba(X_test)[:, 1]

precision, recall, thresholds = precision_recall_curve(y_test, proba)
ap = average_precision_score(y_test, proba)
baseline = y_test.mean()  # random classifier = prevalence
print(f"Average Precision: {ap:.3f} (baseline {baseline:.3f})")

# Choose the lowest threshold that still gives precision >= 0.90
target = 0.90
ok = precision[:-1] >= target
best_idx = ok.nonzero()[0][0]
print(f"Threshold {thresholds[best_idx]:.3f} -> "
      f"P={precision[best_idx]:.2f}, R={recall[best_idx]:.2f}")

# Plot
disp = PrecisionRecallDisplay(precision=precision, recall=recall,
                              average_precision=ap)
disp.plot()
plt.axhline(baseline, ls="--", c="grey", label="random baseline")
plt.legend()
plt.show()`,
    prerequisites: ["precision-recall-f1", "roc-auc"],
    related: ["class-imbalance", "confusion-matrix-concept", "isolation-forest"],
    diagram: `flowchart TD
    A["Model scores for test set"] --> B["Sort samples by score, high → low"]
    B --> C["Sweep threshold down one sample at a time"]
    C --> D["Compute precision at this cutoff"]
    C --> E["Compute recall at this cutoff"]
    D --> F["Plot point (recall, precision)"]
    E --> F
    F --> G{"More thresholds?"}
    G -->|"yes"| C
    G -->|"no"| H["Average Precision = area under curve"]
    H --> I["Compare with prevalence baseline"]
    F --> J["Pick deployment threshold"]`
  },

  {
    id: "class-imbalance",
    name: "Handling Class Imbalance (Class Weights, SMOTE, Threshold Tuning)",
    track: "ml-core",
    category: "Preprocessing & Validation",
    task: ["Classification", "Preprocessing", "Evaluation"],
    difficulty: "Intermediate",
    summary: "A toolbox of techniques (reweighting, resampling, threshold moving and proper metrics) that stops a classifier from ignoring a rare but important class.",
    intuition: "The Quiet Student: In a class of 99 loud students and 1 quiet one, a lazy teacher who only listens to the majority scores 99% 'accuracy' while never hearing the quiet student. Class weights make the teacher listen harder to the quiet student, SMOTE adds a few more quiet voices, and threshold tuning lowers the volume needed to be heard.",
    whenToUse: "Fraud detection, churn, rare disease, defect detection, or any target where the minority class is below roughly 10% and missing it is expensive.",
    whenToAvoid: "When the imbalance is mild (e.g. 40/60) and the model already performs well, or when you would resample BEFORE splitting (that leaks synthetic copies into the test set).",
    requirements: {
      scalingRequired: false,
      handlesMissing: false,
      outlierSensitive: true,
      resampleTrainOnly: true,
      needsStratifiedSplit: true
    },
    parameters: [
      {
        name: "class_weight",
        type: "str or dict",
        default: "None",
        impact: "Multiplies each sample's loss by the weight of its class, so errors on the minority class cost more.",
        tuningTip: "Start with 'balanced' (weight ∝ 1 / class frequency). For XGBoost use scale_pos_weight = n_negative / n_positive."
      },
      {
        name: "sampling_strategy (SMOTE)",
        type: "float or str",
        default: "'auto' (1:1)",
        impact: "Target minority:majority ratio after oversampling.",
        tuningTip: "Full 1:1 balancing often over-corrects; try 0.3 to 0.5 and validate with PR-AUC."
      },
      {
        name: "k_neighbors (SMOTE)",
        type: "int",
        default: "5",
        impact: "Number of minority neighbors used to interpolate synthetic samples.",
        tuningTip: "Lower it (3) when the minority class is tiny; it must be smaller than the minority sample count per fold."
      },
      {
        name: "decision threshold",
        type: "float",
        default: "0.5",
        impact: "Probability cutoff for predicting the minority class.",
        tuningTip: "Often the single most effective fix: lower it on a validation set until recall meets the business target."
      }
    ],
    math: {
      formula: "L = −(1/n) Σᵢ w_{yᵢ} · log p̂(yᵢ | xᵢ),  w_c = n / (K · n_c)",
      loss: "Class-weighted cross-entropy",
      explanation: "Each sample's loss is scaled by its class weight w_c, which is inversely proportional to the class count n_c. SMOTE instead creates synthetic minority points x_new = xᵢ + λ·(x_nn − xᵢ) with λ ∈ [0,1] along lines to neighbors. Both shift the decision boundary toward the majority class."
    },
    pros: [
      "Class weights are free: no extra data, one parameter, supported by most sklearn models",
      "Threshold tuning works with any probabilistic model after training",
      "SMOTE can help models that otherwise never see enough minority examples",
      "Combined with PR-AUC, reveals the true performance on the class that matters"
    ],
    cons: [
      "Resampling before the train/test split causes severe data leakage",
      "SMOTE can create unrealistic samples in noisy or high-dimensional data",
      "Reweighting and oversampling distort predicted probabilities (recalibrate if needed)",
      "Undersampling throws away potentially useful majority data"
    ],
    codeSnippet: `from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from imblearn.pipeline import Pipeline          # NOT sklearn's Pipeline
from imblearn.over_sampling import SMOTE

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42)
print(f"Positive rate: {y_train.mean():.2%}")

# Option 1: class weights (no resampling)
rf_weighted = RandomForestClassifier(class_weight="balanced", random_state=42)

# Option 2: SMOTE inside the pipeline -> applied to training folds ONLY
pipe = Pipeline([
    ("smote", SMOTE(sampling_strategy=0.5, k_neighbors=5, random_state=42)),
    ("rf", RandomForestClassifier(n_estimators=300, random_state=42)),
])

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
for name, model in [("weighted", rf_weighted), ("smote", pipe)]:
    ap = cross_val_score(model, X_train, y_train, cv=cv, scoring="average_precision")
    print(f"{name}: PR-AUC {ap.mean():.3f} ± {ap.std():.3f}")

# Option 3: threshold tuning on the chosen model
pipe.fit(X_train, y_train)
proba = pipe.predict_proba(X_test)[:, 1]
y_pred = (proba >= 0.3).astype(int)  # lower threshold -> higher recall`,
    prerequisites: ["precision-recall-f1", "train-test-split"],
    related: ["pr-curve", "cross-validation", "isolation-forest", "roc-auc"],
    diagram: `flowchart TD
    A["Imbalanced dataset (e.g. 1% fraud)"] --> B["Stratified train/test split"]
    B --> C{"Choose a strategy"}
    C -->|"reweight"| D["class_weight = balanced"]
    C -->|"resample"| E["SMOTE / undersample TRAIN folds only"]
    C -->|"post-hoc"| F["Train normally"]
    D --> G["Fit model"]
    E --> G
    F --> G
    G --> H["Predict probabilities on validation"]
    H --> I["Tune decision threshold"]
    I --> J["Evaluate with PR-AUC, recall, F1"]
    J --> K(["Final check on untouched test set"])`
  },

  {
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
print("Optimal #features:", rfecv.n_features_)`,
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
    G --> J["Final model on selected features"]`
  },

  {
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
print(row.base_values + row.values.sum())`,
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
    J --> K(["Reason codes / waterfall plot"])`
  },

  {
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
    print(f"{name:<9} AUC {s.mean():.3f} ± {s.std():.3f}")`,
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
    K --> L["Meta-learner blends predictions"]`
  },

  {
    id: "curse-of-dimensionality",
    name: "Curse of Dimensionality",
    track: "ml-core",
    category: "ML Theory & Diagnostics",
    task: ["Definition", "Preprocessing"],
    difficulty: "Intermediate",
    summary: "The collection of problems that appear as the number of features grows: data becomes exponentially sparse, distances lose meaning, and models need vastly more samples to generalize.",
    intuition: "Finding a Friend: In a 100 m corridor (1D) you find your friend quickly. On a 100 m × 100 m field (2D) it takes much longer, and in a 100 m cube of a building (3D) it is harder still. Every new dimension multiplies the space to search, so the same number of people (samples) end up spread hopelessly thin, and 'nearest' neighbors are not actually near.",
    whenToUse: "As a diagnostic lens whenever you have many features relative to samples (genomics, text, wide one-hot encodings), when k-NN / k-Means / SVM-RBF degrade as features are added, or when deciding whether to reduce dimensions.",
    whenToAvoid: "N/A as a concept, but do not over-apply it: real data often lies on a low-dimensional manifold, which is why deep learning still works on million-pixel images.",
    requirements: {
      scalingRequired: true,
      handlesMissing: false,
      outlierSensitive: false,
      hurtsDistanceBasedModels: true
    },
    parameters: [
      {
        name: "d (number of features)",
        type: "int",
        default: "dataset dependent",
        impact: "Volume of the feature space grows exponentially with d; samples needed for the same density grow as kᵈ.",
        tuningTip: "Watch the ratio n_samples / n_features; below ~10 for simple models, consider selection or reduction."
      },
      {
        name: "distance metric",
        type: "str",
        default: "'euclidean'",
        impact: "L2 distances concentrate (all pairs look equally far) in high dimensions.",
        tuningTip: "Try cosine similarity for sparse text-like data, or L1 (Manhattan), which degrades more slowly."
      },
      {
        name: "reduction method",
        type: "concept",
        default: "none",
        impact: "PCA, feature selection, embeddings or UMAP compress the space to its informative directions.",
        tuningTip: "Keep enough PCA components for 90 to 95% explained variance as a first try."
      },
      {
        name: "regularization strength",
        type: "float",
        default: "model dependent",
        impact: "Constrains models so they cannot exploit the many spurious directions available in high-d space.",
        tuningTip: "With p much larger than n, L1/L2-regularized linear models are often the strongest baseline."
      }
    ],
    math: {
      formula: "(d_max − d_min) / d_min → 0  as  d → ∞",
      loss: "Distance concentration",
      explanation: "For random points in d dimensions, the gap between the farthest and nearest neighbor shrinks relative to the nearest distance as d grows, so 'nearest' stops being meaningful. Relatedly, the fraction of a unit hypercube's volume within a thin shell near its surface is 1 − (1 − 2ε)ᵈ, which tends to 1: almost all points are near the edges."
    },
    pros: [
      "Explains why k-NN, k-Means and RBF kernels fail on wide raw data",
      "Motivates feature selection, PCA, embeddings and regularization",
      "Guides how much data you need before adding more features",
      "Helps diagnose overfitting caused by many spurious features"
    ],
    cons: [
      "Hard to visualize or reason about beyond 3 dimensions",
      "Effect size depends on intrinsic (not nominal) dimensionality, which is hard to measure",
      "Rules of thumb on sample counts are rough and model dependent"
    ],
    codeSnippet: `import numpy as np
from sklearn.metrics import pairwise_distances

rng = np.random.default_rng(42)
n = 500

# Distance concentration: contrast between nearest and farthest neighbor
for d in [2, 10, 100, 1000, 10000]:
    X = rng.random((n, d))
    D = pairwise_distances(X[:1], X[1:])[0]
    contrast = (D.max() - D.min()) / D.min()
    print(f"d={d:>6}  relative contrast={contrast:6.3f}")
# Contrast collapses toward 0: every point is ~equally far away.

# Remedy: compress to the informative directions before k-NN
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score

raw = make_pipeline(StandardScaler(), KNeighborsClassifier())
reduced = make_pipeline(StandardScaler(), PCA(n_components=0.95),
                        KNeighborsClassifier())
print("raw     :", cross_val_score(raw, X_wide, y, cv=5).mean())
print("PCA 95% :", cross_val_score(reduced, X_wide, y, cv=5).mean())`,
    prerequisites: ["overfitting-underfitting", "linear-algebra"],
    related: ["what-is-dimensionality-reduction", "feature-selection", "pca", "knn"],
    diagram: `flowchart TD
    A["Add more features (d ↑)"] --> B["Space volume grows exponentially"]
    B --> C["Fixed samples become sparse"]
    C --> D["Distances concentrate: all points look equally far"]
    C --> E["More spurious patterns fit by chance"]
    D --> F["k-NN, k-Means, RBF kernels degrade"]
    E --> G["Overfitting / high variance"]
    F --> H{"Remedies"}
    G --> H
    H --> I["Feature selection"]
    H --> J["PCA / embeddings / UMAP"]
    H --> K["Regularization or more data"]`
  },

  {
    id: "time-series-cv",
    name: "Time-Series Cross-Validation (Walk-Forward Validation)",
    track: "ml-core",
    category: "ML Theory & Validation",
    task: ["Evaluation", "Regression"],
    difficulty: "Intermediate",
    summary: "Validation schemes for temporally ordered data that always train on the past and test on the future, so performance estimates reflect real forecasting conditions without look-ahead leakage.",
    intuition: "The Weather Forecaster's Exam: You cannot grade a forecaster by letting them peek at next week's newspaper. Walk-forward validation hands them data up to Monday, asks for Tuesday, then reveals Tuesday and asks for Wednesday, and so on. Shuffled k-Fold is like giving them random pages from the future, which makes anyone look like a genius.",
    whenToUse: "Forecasting, any model with lag/rolling features, financial and sensor data, demand planning, or any dataset where rows close in time are correlated and the model will be deployed on future data.",
    whenToAvoid: "Genuinely i.i.d. data with no temporal ordering or drift (standard stratified k-Fold uses data more efficiently), or when you have too little history for several meaningful folds.",
    requirements: {
      scalingRequired: false,
      handlesMissing: false,
      outlierSensitive: false,
      noShuffling: true,
      sortedByTime: true
    },
    parameters: [
      {
        name: "n_splits",
        type: "int",
        default: "5",
        impact: "Number of successive train/test windows.",
        tuningTip: "Choose so each test window covers a meaningful horizon (e.g. one full week or season)."
      },
      {
        name: "test_size",
        type: "int",
        default: "n_samples // (n_splits + 1)",
        impact: "Length of each validation window.",
        tuningTip: "Match it to the production forecast horizon (forecasting 7 days → test_size = 7 days of rows)."
      },
      {
        name: "gap",
        type: "int",
        default: "0",
        impact: "Number of samples dropped between train and test to avoid leakage via lag features or autocorrelation.",
        tuningTip: "Set it at least as large as your longest lag/rolling window or label-delay period."
      },
      {
        name: "max_train_size",
        type: "int or None",
        default: "None (expanding window)",
        impact: "None = expanding window (all history); an int = sliding window of fixed length.",
        tuningTip: "Use a sliding window when old data is stale due to drift or regime changes."
      }
    ],
    math: {
      formula: "CV = (1/K) Σₖ Score( f_{[1, tₖ]} , [tₖ + g + 1, tₖ + g + h] )",
      loss: "Average out-of-time validation error",
      explanation: "For each fold k, the model is trained only on data up to time tₖ, skips a gap of g steps, and is scored on the next h steps. Because the test window always lies strictly in the future, the average score estimates true forecasting error rather than interpolation error."
    },
    pros: [
      "Prevents look-ahead leakage that makes shuffled CV wildly optimistic",
      "Mimics how the model is actually retrained and used in production",
      "Reveals performance degradation over time (concept drift) fold by fold",
      "Gap parameter handles lag features and delayed labels cleanly"
    ],
    cons: [
      "Early folds train on little data and can be pessimistic",
      "Uses data less efficiently than k-Fold (later points are never in training for early folds)",
      "Requires enough history for several realistic windows",
      "Feature engineering (lags, rolling stats) must also be fold-aware to avoid leakage"
    ],
    codeSnippet: `import numpy as np
import pandas as pd
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from lightgbm import LGBMRegressor

df = df.sort_values("date").reset_index(drop=True)   # order matters!

# Lag features built from the PAST only
for lag in [1, 7, 14]:
    df[f"sales_lag_{lag}"] = df["sales"].shift(lag)
df["sales_roll_7"] = df["sales"].shift(1).rolling(7).mean()
df = df.dropna()

X = df.drop(columns=["date", "sales"])
y = df["sales"]

# Expanding-window walk-forward CV with a 14-row gap (≥ longest lag)
tscv = TimeSeriesSplit(n_splits=5, test_size=28, gap=14)
for fold, (tr, te) in enumerate(tscv.split(X)):
    print(f"Fold {fold}: train {df.date.iloc[tr[0]].date()}→{df.date.iloc[tr[-1]].date()}"
          f" | test {df.date.iloc[te[0]].date()}→{df.date.iloc[te[-1]].date()}")

model = LGBMRegressor(n_estimators=500, learning_rate=0.03)
mae = -cross_val_score(model, X, y, cv=tscv,
                       scoring="neg_mean_absolute_error")
print(f"Walk-forward MAE per fold: {np.round(mae, 1)}")
print(f"Mean MAE: {mae.mean():.1f} ± {mae.std():.1f}")`,
    prerequisites: ["cross-validation", "train-test-split"],
    related: ["time-series-forecasting", "rnn-lstm", "model-data-drift", "mae-metric"],
    diagram: `flowchart LR
    A["Data sorted by time"] --> B["Fold 1: train on t1..t3"]
    B --> C["Gap (skip lag window)"]
    C --> D["Test on t4"]
    D --> E["Fold 2: train on t1..t4"]
    E --> F["Test on t5"]
    F --> G["Fold 3: train on t1..t5"]
    G --> H["Test on t6"]
    D --> I["Collect fold scores"]
    F --> I
    H --> I
    I --> J(["Mean ± std forecast error"])`
  }
];

// Adds graph links + diagrams to EXISTING concepts (keyed by existing id).
export const enrichments = {
  "bias-variance-tradeoff": {
    prerequisites: ["overfitting-underfitting", "probability-statistics"],
    related: ["regularization-l1-l2", "ensemble-methods", "cross-validation", "hyperparameter-tuning"],
    diagram: `flowchart TD
    A["Model complexity knob"] --> B{"Too simple or too complex?"}
    B -->|"too simple"| C["High bias: misses true pattern"]
    B -->|"too complex"| D["High variance: memorizes noise"]
    C --> E["Underfitting: high train and test error"]
    D --> F["Overfitting: low train, high test error"]
    E --> G["Total error = Bias² + Variance + Noise"]
    F --> G
    G --> H["Tune complexity with validation curve"]
    H --> I(["Sweet spot: minimum test error"])`
  },

  "confusion-matrix-concept": {
    prerequisites: ["what-is-classification"],
    related: ["precision-recall-f1", "roc-auc", "class-imbalance"],
    diagram: `flowchart TD
    A["Test samples"] --> B["Model predicts a label"]
    B --> C{"Predicted positive?"}
    C -->|"yes"| D{"Actually positive?"}
    C -->|"no"| E{"Actually positive?"}
    D -->|"yes"| F["True Positive"]
    D -->|"no"| G["False Positive (Type I)"]
    E -->|"yes"| H["False Negative (Type II)"]
    E -->|"no"| I["True Negative"]
    F --> J["Fill 2×2 matrix"]
    G --> J
    H --> J
    I --> J
    J --> K(["Derive accuracy, precision, recall, specificity"])`
  },

  "cross-validation": {
    prerequisites: ["train-test-split"],
    related: ["hyperparameter-tuning", "time-series-cv", "bias-variance-tradeoff", "overfitting-underfitting"],
    diagram: `flowchart TD
    A["Training data"] --> B["Split into k folds"]
    B --> C["Round i: hold out fold i"]
    C --> D["Fit model on other k-1 folds"]
    D --> E["Score on held-out fold i"]
    E --> F{"All k folds used?"}
    F -->|"no"| C
    F -->|"yes"| G["Average k scores"]
    G --> H(["Mean ± std performance estimate"])`
  },

  "encoding-categorical": {
    prerequisites: ["what-is-feature-engineering"],
    related: ["feature-scaling", "curse-of-dimensionality", "catboost", "embeddings"],
    diagram: `flowchart TD
    A["Categorical column"] --> B{"Is there a natural order?"}
    B -->|"yes (low/med/high)"| C["Ordinal / Label encoding"]
    B -->|"no"| D{"Many unique values?"}
    D -->|"few"| E["One-hot encoding"]
    D -->|"many"| F["Target / frequency encoding or embeddings"]
    C --> G["Fit encoder on train only"]
    E --> G
    F --> G
    G --> H["Transform train and test"]
    H --> I(["Numeric matrix for the model"])`
  },

  "feature-scaling": {
    prerequisites: ["what-is-feature-engineering"],
    related: ["knn", "svm", "what-is-gradient-descent", "train-test-split"],
    diagram: `flowchart TD
    A["Raw numeric features"] --> B{"Model uses distances or gradients?"}
    B -->|"no (trees)"| C(["Skip scaling"])
    B -->|"yes"| D{"Outliers or bounded range needed?"}
    D -->|"need 0..1 range"| E["Min-Max: (x − min) / (max − min)"]
    D -->|"roughly Gaussian"| F["Standard: (x − μ) / σ"]
    D -->|"heavy outliers"| G["Robust: (x − median) / IQR"]
    E --> H["Fit on train split only"]
    F --> H
    G --> H
    H --> I["Transform train, val and test"]`
  },

  "hyperparameter-tuning": {
    prerequisites: ["cross-validation", "overfitting-underfitting"],
    related: ["experiment-tracking", "bias-variance-tradeoff", "regularization-l1-l2"],
    diagram: `flowchart TD
    A["Define search space"] --> B{"Search strategy"}
    B -->|"grid"| C["Every combination"]
    B -->|"random"| D["Sample N combinations"]
    B -->|"Bayesian"| E["Pick next config from surrogate model"]
    C --> F["Evaluate config with k-fold CV"]
    D --> F
    E --> F
    F --> G["Record mean CV score"]
    G --> H{"Budget left?"}
    H -->|"yes"| B
    H -->|"no"| I["Refit best config on full train set"]
    I --> J(["Final evaluation on test set"])`
  },

  "knn-imputer": {
    prerequisites: ["simple-imputer", "knn", "feature-scaling"],
    related: ["data-quality", "encoding-categorical", "curse-of-dimensionality"],
    diagram: `flowchart TD
    A["Row with a missing value"] --> B["Scale features"]
    B --> C["Distance to other rows using non-missing features"]
    C --> D["Pick k nearest neighbors"]
    D --> E{"Neighbors have that feature?"}
    E -->|"yes"| F["Average (or distance-weight) their values"]
    E -->|"no"| G["Use next nearest donors"]
    G --> F
    F --> H["Fill the gap"]
    H --> I(["Complete dataset"])`
  },

  "log-loss": {
    prerequisites: ["loss-vs-cost-function", "what-is-classification", "probability-statistics"],
    related: ["logistic-regression", "roc-auc", "precision-recall-f1"],
    diagram: `flowchart TD
    A["Predicted probability p for each sample"] --> B{"True label?"}
    B -->|"y = 1"| C["Penalty = −log(p)"]
    B -->|"y = 0"| D["Penalty = −log(1 − p)"]
    C --> E{"Confident and wrong?"}
    D --> E
    E -->|"yes"| F["Huge penalty (→ ∞)"]
    E -->|"no"| G["Small penalty"]
    F --> H["Average over all samples"]
    G --> H
    H --> I(["Log-loss: lower is better"])`
  },

  "mae-metric": {
    prerequisites: ["what-is-regression", "loss-vs-cost-function"],
    related: ["rmse-metric", "r2-score", "time-series-cv"],
    diagram: `flowchart LR
    A["Actual values y"] --> C["Residual = y − ŷ"]
    B["Predictions ŷ"] --> C
    C --> D["Take absolute value abs(y − ŷ)"]
    D --> E["Sum over n samples"]
    E --> F["Divide by n"]
    F --> G(["MAE in target units"])`
  },

  "overfitting-underfitting": {
    prerequisites: ["train-test-split"],
    related: ["bias-variance-tradeoff", "regularization-l1-l2", "cross-validation", "dl-regularization"],
    diagram: `flowchart TD
    A["Train model"] --> B["Measure train error"]
    A --> C["Measure validation error"]
    B --> D{"Compare errors"}
    C --> D
    D -->|"both high"| E["Underfitting"]
    D -->|"train low, val high"| F["Overfitting"]
    D -->|"both low and close"| G(["Good fit"])
    E --> H["More features, more complex model, less regularization"]
    F --> I["More data, regularization, simpler model, early stopping"]
    H --> A
    I --> A`
  },

  "r2-score": {
    prerequisites: ["what-is-regression", "rmse-metric"],
    related: ["mae-metric", "linear-regression"],
    diagram: `flowchart TD
    A["Actual values y"] --> B["Baseline: predict the mean ȳ"]
    B --> C["SS_tot = Σ(y − ȳ)²"]
    A --> D["Model predictions ŷ"]
    D --> E["SS_res = Σ(y − ŷ)²"]
    C --> F["R² = 1 − SS_res / SS_tot"]
    E --> F
    F --> G{"Value?"}
    G -->|"1"| H["Perfect fit"]
    G -->|"0"| I["No better than the mean"]
    G -->|"below 0"| J["Worse than the mean"]`
  },

  "regularization-l1-l2": {
    prerequisites: ["overfitting-underfitting", "loss-vs-cost-function"],
    related: ["feature-selection", "bias-variance-tradeoff", "linear-regression", "dl-regularization"],
    diagram: `flowchart TD
    A["Original loss (e.g. MSE)"] --> B["Add penalty × λ"]
    B --> C{"Penalty type"}
    C -->|"L1: λ·Σ abs(w)"| D["Constant pull toward zero"]
    C -->|"L2: λ·Σ w²"| E["Pull proportional to weight size"]
    D --> F["Many weights exactly 0 → feature selection"]
    E --> G["All weights shrink smoothly"]
    F --> H["Lower variance, slightly higher bias"]
    G --> H
    H --> I(["Tune λ with cross-validation"])`
  },

  "rmse-metric": {
    prerequisites: ["what-is-regression", "mae-metric"],
    related: ["r2-score", "loss-vs-cost-function", "linear-regression"],
    diagram: `flowchart LR
    A["Actual y and predicted ŷ"] --> B["Residual y − ŷ"]
    B --> C["Square it (big errors amplified)"]
    C --> D["Mean over n samples = MSE"]
    D --> E["Square root"]
    E --> F(["RMSE in target units"])
    C --> G["Outliers dominate the score"]`
  },

  "roc-auc": {
    prerequisites: ["confusion-matrix-concept", "precision-recall-f1"],
    related: ["pr-curve", "log-loss", "class-imbalance"],
    diagram: `flowchart TD
    A["Model scores for test set"] --> B["Choose a threshold"]
    B --> C["Compute TPR = TP / (TP + FN)"]
    B --> D["Compute FPR = FP / (FP + TN)"]
    C --> E["Plot point (FPR, TPR)"]
    D --> E
    E --> F{"More thresholds?"}
    F -->|"yes"| B
    F -->|"no"| G["Area under the curve"]
    G --> H(["AUC: 0.5 random, 1.0 perfect ranking"])`
  },

  "silhouette-score": {
    prerequisites: ["what-is-clustering"],
    related: ["kmeans", "dbscan", "hierarchical-clustering", "gmm"],
    diagram: `flowchart TD
    A["Clustered point i"] --> B["a = mean distance to own cluster"]
    A --> C["b = mean distance to nearest other cluster"]
    B --> D["s = (b − a) / max(a, b)"]
    C --> D
    D --> E["Repeat for every point"]
    E --> F["Average silhouette"]
    F --> G{"Compare across k"}
    G --> H(["Pick k with highest score"])`
  },

  "simple-imputer": {
    prerequisites: ["what-is-feature-engineering"],
    related: ["knn-imputer", "data-quality", "train-test-split"],
    diagram: `flowchart TD
    A["Column with missing values"] --> B{"Column type"}
    B -->|"numeric, skewed"| C["Median"]
    B -->|"numeric, symmetric"| D["Mean"]
    B -->|"categorical"| E["Most frequent / constant"]
    C --> F["Learn fill value on train split"]
    D --> F
    E --> F
    F --> G["Optionally add missing-indicator column"]
    G --> H["Transform train and test"]
    H --> I(["No NaNs left"])`
  },

  "train-test-split": {
    prerequisites: ["what-is-ml"],
    related: ["cross-validation", "time-series-cv", "ml-workflow", "overfitting-underfitting"],
    diagram: `flowchart TD
    A["Full dataset"] --> B{"Time ordered?"}
    B -->|"yes"| C["Split by date: past → train, future → test"]
    B -->|"no"| D["Random stratified split"]
    C --> E["Train set"]
    C --> F["Test set (locked away)"]
    D --> E
    D --> F
    E --> G["Fit scaler / imputer / encoder on train"]
    G --> H["Train model"]
    G --> I["Transform test with fitted objects"]
    F --> I
    H --> J(["Evaluate once on test"])
    I --> J`
  }
};
