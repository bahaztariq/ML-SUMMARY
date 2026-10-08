export default {
  id: "confusion-matrix-concept",
  name: "Confusion Matrix (Complete Guide)",
  track: "ml-core",
  category: "Evaluation Metrics",
  task: ["Classification", "Metrics", "Evaluation", "Definition"],
  difficulty: "Beginner",
  summary: "A 2×2 (binary) or N×N (multiclass) table that cross-tabulates every prediction against the true label, revealing exactly where and how a classifier makes mistakes.",
  intuition: "The Detective's Evidence Board: Instead of just saying 'the model is 90% accurate', the Confusion Matrix shows the full crime scene: How many sick patients were missed? How many healthy patients were wrongly alarmed? Every type of mistake is exposed.",
  whenToUse: "Mandatory diagnostic for every classification task. Essential when different types of errors have vastly different real-world costs (e.g., missing cancer vs false alarm).",
  whenToAvoid: "Never avoid it — always inspect the confusion matrix before trusting accuracy alone.",
  requirements: {
    classificationDiagnostic: true,
    revealsMistakeTypes: true,
    foundationForAllMetrics: true
  },
  parameters: [
    {
      name: "True Positive (TP)",
      type: "quadrant",
      default: "Correct detection",
      impact: "Model predicted positive AND the truth is positive. The hit.",
      tuningTip: "Maximize TP to increase both Precision and Recall."
    },
    {
      name: "True Negative (TN)",
      type: "quadrant",
      default: "Correct rejection",
      impact: "Model predicted negative AND the truth is negative. The correct pass.",
      tuningTip: "Contributes to Accuracy and Specificity."
    },
    {
      name: "False Positive (FP) — Type I Error",
      type: "quadrant",
      default: "False alarm",
      impact: "Model predicted positive BUT the truth is negative. Crying wolf.",
      tuningTip: "Hurts Precision. Critical in spam filters (legitimate email sent to junk)."
    },
    {
      name: "False Negative (FN) — Type II Error",
      type: "quadrant",
      default: "Missed detection",
      impact: "Model predicted negative BUT the truth is positive. The silent killer.",
      tuningTip: "Hurts Recall. Critical in medical screening (sending a sick patient home)."
    }
  ],
  math: {
    formula: "Accuracy = (TP+TN)/(TP+TN+FP+FN) | Precision = TP/(TP+FP) | Recall = TP/(TP+FN)",
    loss: "Foundation of All Classification Metrics",
    explanation: "Every classification metric (Accuracy, Precision, Recall, F1, Specificity, FPR) is computed directly from the four quadrants of the Confusion Matrix. It's the single most important diagnostic tool."
  },
  pros: [
    "Exposes exactly WHERE the model fails (false positives vs false negatives)",
    "Reveals class imbalance problems that accuracy alone completely hides",
    "Foundation for computing Precision, Recall, F1, Specificity, and ROC curves"
  ],
  cons: [
    "Only shows results at a single threshold (use ROC curve for all thresholds)",
    "N×N multiclass matrices become hard to read visually for many classes"
  ],
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
    J --> K(["Derive accuracy, precision, recall, specificity"])`,
  codeSnippet: `from sklearn.metrics import confusion_matrix, classification_report
import numpy as np

y_true = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0]
y_pred = [1, 0, 0, 1, 0, 1, 1, 0, 1, 0]

cm = confusion_matrix(y_true, y_pred)
tn, fp, fn, tp = cm.ravel()

print(f"Confusion Matrix:")
print(f"  TP={tp}  FP={fp}")
print(f"  FN={fn}  TN={tn}")
print(f"\\nPrecision: {tp/(tp+fp):.2f}")
print(f"Recall:    {tp/(tp+fn):.2f}")
print(f"\\n{classification_report(y_true, y_pred)}")`
};
