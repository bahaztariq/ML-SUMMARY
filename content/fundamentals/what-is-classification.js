export default {
  id: "what-is-classification",
  name: "What is Classification?",
  track: "fundamentals",
  category: "Core Tasks",
  task: ["Definition", "Classification", "Supervised"],
  difficulty: "Beginner",
  summary: "A supervised learning task where an algorithm learns to categorize input data points into one or more predefined discrete classes or categories.",
  intuition: "Sorting Mail into Pigeonholes: When an envelope arrives, you read the recipient city and drop it into the designated box: 'New York', 'London', or 'Tokyo'. It can only go into distinct buckets — never 'halfway between New York and London'.",
  whenToUse: "When the target outcome is categorical: Yes/No, Fraud/Legitimate, Dog/Cat/Bird, Malignant/Benign, Churn/Retain.",
  whenToAvoid: "When the target is a continuous numeric number (e.g. house price in dollars or temperature in degrees — use Regression instead!).",
  requirements: {
    labeledTrainingData: true,
    discreteTargetClasses: true,
    evaluatesWithConfusionMatrix: true,
    calibratesProbabilities: true
  },
  parameters: [
    {
      name: "Binary Classification",
      type: "subtype",
      default: "2 classes",
      impact: "Predicts between two mutually exclusive outcomes: True/False, 0/1.",
      tuningTip: "Evaluate using ROC-AUC, Precision, and Recall rather than raw Accuracy."
    },
    {
      name: "Multiclass Classification",
      type: "subtype",
      default: ">2 classes",
      impact: "Predicts one single label out of three or more mutually exclusive classes (e.g. Red, Green, Blue).",
      tuningTip: "Use Categorical Cross-Entropy loss and Softmax output layer."
    },
    {
      name: "Multilabel Classification",
      type: "subtype",
      default: "Multiple labels",
      impact: "An instance can possess multiple categories simultaneously (e.g. a movie labeled both 'Action' and 'Sci-Fi').",
      tuningTip: "Use independent Sigmoid activations on each output neuron."
    }
  ],
  math: {
    formula: "ŷ = argmax_c P(Y = c | X)  where ∑ P(Y = c | X) = 1",
    loss: "Cross-Entropy Loss (Log-Loss): L = -∑ y_c · log(p_c)",
    explanation: "Classification models calculate confidence probabilities for each candidate class c, then choose the class with the maximum posterior probability."
  },
  pros: [
    "Directly maps to actionable binary or discrete business decisions (Approve / Reject Loan)",
    "Rich evaluation framework (Confusion Matrix, Precision, Recall, F1-Score, ROC curves)",
    "Outputs calibrated confidence scores to threshold risky edge cases"
  ],
  cons: [
    "Severely thrown off by class imbalance (e.g. 99.9% legit transactions vs 0.1% fraud)",
    "Threshold selection (default 0.5) must be custom-tuned to business risk tolerance"
  ],
  prerequisites: ["supervised-vs-unsupervised"],
  related: ["what-is-regression", "logistic-regression", "confusion-matrix-concept", "precision-recall-f1"],
  diagram: `flowchart TD
    A[("Labeled examples: features + class")] --> B["Train classifier"]
    B --> C["Learn decision boundary"]
    N["New sample"] --> D["Model outputs class probabilities"]
    C --> D
    D --> E{"Probability ≥ threshold?"}
    E -->|"yes"| F["Predict positive class"]
    E -->|"no"| G["Predict negative class"]
    F --> H["Evaluate: confusion matrix, F1, ROC-AUC"]
    G --> H`,
  codeSnippet: `from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

# Labeled binary dataset: Email features [word_count, has_free_in_title] -> 1=Spam, 0=Ham
X = [[200, 0], [45, 1], [350, 0], [15, 1]]
y = [0, 1, 0, 1]

clf = LogisticRegression()
clf.fit(X, y)

new_email = [[30, 1]]
pred_class = clf.predict(new_email)
pred_prob = clf.predict_proba(new_email)[0]
print(f"Predicted: {'SPAM' if pred_class[0] == 1 else 'HAM'} (Confidence: {max(pred_prob):.1%})")`
};
