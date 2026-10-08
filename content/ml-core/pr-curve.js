export default {
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
    F --> J["Pick deployment threshold"]`,
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
plt.show()`
};
