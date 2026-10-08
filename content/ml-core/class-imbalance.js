export default {
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
    J --> K(["Final check on untouched test set"])`,
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
y_pred = (proba >= 0.3).astype(int)  # lower threshold -> higher recall`
};
