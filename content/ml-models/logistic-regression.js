export default {
  id: "logistic-regression",
  name: "Logistic Regression",
  track: "ml-models",
  category: "Generalized Linear Models",
  task: ["Classification"],
  difficulty: "Beginner",
  summary: "A linear model for binary or multiclass classification that models log-odds using the sigmoid / softmax function.",
  intuition: "Draws a straight linear decision boundary through feature space and converts the distance to that line into a calibrated probability between 0% and 100%.",
  whenToUse: "When you need well-calibrated probabilities, instant inference speed, full interpretability (odds ratios), or have high-dimensional text data.",
  whenToAvoid: "When the true relationship between input features and output labels is heavily non-linear and you cannot engineer manual interaction features.",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: true,
    linearRelationship: true
  },
  parameters: [
    {
      name: "C",
      type: "float",
      default: "1.0",
      impact: "Inverse of regularization strength (1 / λ).",
      tuningTip: "Smaller values specify stronger regularization. Test log-scale: [0.001, 0.01, 0.1, 1, 10, 100]."
    },
    {
      name: "penalty",
      type: "string",
      default: "'l2'",
      impact: "Specifies norm used in penalization ('l1', 'l2', 'elasticnet', 'none').",
      tuningTip: "Use 'l1' for automated feature selection (driving uninformative weights strictly to 0)."
    },
    {
      name: "solver",
      type: "string",
      default: "'lbfgs'",
      impact: "Algorithm used in the optimization problem.",
      tuningTip: "Use 'lbfgs' for multiclass/small data; 'saga' for large datasets or L1 penalty."
    }
  ],
  math: {
    formula: "P(Y=1|X) = σ(wᵀx + b) = 1 / (1 + e^{-(wᵀx + b)})",
    loss: "Binary Cross-Entropy (Log-Loss): L = -∑ [y·log(p) + (1-y)·log(1-p)]",
    explanation: "Computes the dot product of weights and input features to obtain log-odds, then applies the non-linear Sigmoid activation to squeeze output strictly into the [0, 1] probability range."
  },
  pros: [
    "Blazing fast inference and low memory footprint (ideal for edge or high-QPS APIs)",
    "Coefficients provide direct interpretability as multiplicative changes in log-odds",
    "Provides well-calibrated confidence probabilities out of the box",
    "Less prone to overfitting in low-sample high-feature environments when regularized"
  ],
  cons: [
    "Strict assumption of linear decision boundaries in log-odds space",
    "Extremely sensitive to unscaled features and extreme outliers",
    "Cannot capture feature interactions unless explicitly engineered"
  ],
  prerequisites: ["linear-regression", "what-is-classification"],
  related: ["log-loss", "svm", "naive-bayes", "roc-auc"],
  diagram: `flowchart LR
    A[("Features x")] --> B["Linear score z = wᵀx + b"]
    B --> C["Sigmoid σ(z) = 1 / (1 + e^−z)"]
    C --> D["Probability P(y = 1 | x)"]
    D --> E{"P ≥ threshold (e.g. 0.5)?"}
    E -->|"yes"| F(["Predict class 1"])
    E -->|"no"| G(["Predict class 0"])
    D --> H["Log-Loss vs true label"]
    H --> I["Gradient step updates w, b"]
    I -.-> B`,
  codeSnippet: `from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

# Pipelines guarantee feature scaling without data leakage
clf = make_pipeline(
    StandardScaler(),
    LogisticRegression(C=0.5, penalty='l2', solver='lbfgs', max_iter=1000)
)
clf.fit(X_train, y_train)

# Probabilistic output
probs = clf.predict_proba(X_test)[:, 1]`
};
