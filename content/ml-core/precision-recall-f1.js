export default {
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
    I --> J`,
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
print(classification_report(y_test, y_pred, digits=3))`
};
