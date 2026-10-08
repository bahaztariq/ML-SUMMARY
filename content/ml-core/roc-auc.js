export default {
  id: "roc-auc",
  name: "ROC Curve & AUC Score",
  track: "ml-core",
  category: "Evaluation Metrics",
  task: ["Classification", "Metrics", "Evaluation"],
  difficulty: "Intermediate",
  summary: "The Receiver Operating Characteristic (ROC) curve plots True Positive Rate vs False Positive Rate at every possible classification threshold. AUC (Area Under Curve) summarizes overall discriminative ability as a single number from 0 to 1.",
  intuition: "The Universal Dial Test: Instead of evaluating your model at just one threshold (0.5), ROC-AUC tests it at EVERY possible threshold from 0.0 to 1.0 and summarizes overall quality. AUC = 0.5 means random coin flip; AUC = 1.0 means perfect separation.",
  whenToUse: "Binary classification evaluation, especially when class distributions are imbalanced. Comparing models independently of threshold choice.",
  whenToAvoid: "Multiclass problems (requires one-vs-rest adaptation). When precision at specific thresholds matters more than overall ranking (use Precision-Recall curves instead).",
  requirements: {
    classificationMetric: true,
    thresholdIndependent: true,
    requiresProbabilityOutput: true
  },
  parameters: [
    {
      name: "TPR (True Positive Rate / Recall)",
      type: "axis",
      default: "Y-axis",
      impact: "TP / (TP + FN) — Proportion of actual positives correctly identified.",
      tuningTip: "High TPR = catching most positives (but possibly at the cost of more false alarms)."
    },
    {
      name: "FPR (False Positive Rate)",
      type: "axis",
      default: "X-axis",
      impact: "FP / (FP + TN) — Proportion of actual negatives incorrectly flagged as positive.",
      tuningTip: "Low FPR = fewer false alarms (but possibly missing true positives)."
    },
    {
      name: "AUC Interpretation",
      type: "metric",
      default: "[0.5 - 1.0]",
      impact: "Probability that the model ranks a randomly chosen positive higher than a randomly chosen negative.",
      tuningTip: "AUC > 0.9: Excellent | 0.8-0.9: Good | 0.7-0.8: Fair | < 0.7: Poor discrimination."
    }
  ],
  math: {
    formula: "AUC = ∫₀¹ TPR(FPR) d(FPR)  =  P(score(positive) > score(negative))",
    loss: "Area Under ROC Curve",
    explanation: "ROC-AUC measures the model's ability to rank positive examples above negative examples across all possible decision thresholds. It equals the probability that a randomly chosen positive sample scores higher than a randomly chosen negative sample."
  },
  pros: [
    "Threshold-independent: evaluates model quality across all possible operating points",
    "Robust to class imbalance compared to raw accuracy",
    "Single scalar number (AUC) makes model comparison straightforward"
  ],
  cons: [
    "Can be overly optimistic on severely imbalanced datasets (use PR-AUC instead)",
    "Does not tell you which specific threshold to deploy in production"
  ],
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
    G --> H(["AUC: 0.5 random, 1.0 perfect ranking"])`,
  codeSnippet: `from sklearn.metrics import roc_auc_score, roc_curve
import matplotlib.pyplot as plt

# Model probability outputs (not hard labels!)
y_true = [0, 0, 1, 1, 0, 1, 0, 1]
y_scores = [0.1, 0.4, 0.35, 0.8, 0.2, 0.9, 0.3, 0.85]

auc = roc_auc_score(y_true, y_scores)
fpr, tpr, thresholds = roc_curve(y_true, y_scores)

print(f"AUC Score: {auc:.3f}")

# Plot ROC Curve
plt.plot(fpr, tpr, label=f'Model (AUC = {auc:.3f})')
plt.plot([0, 1], [0, 1], 'k--', label='Random (AUC = 0.5)')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve')
plt.legend()
plt.show()`
};
