export default {
  id: "decision-tree",
  name: "Decision Tree (CART)",
  track: "ml-models",
  category: "Tree-Based Models",
  task: ["Classification", "Regression"],
  difficulty: "Beginner",
  summary: "A non-parametric supervised model that learns hierarchical if-then-else decision rules from data, forming a tree structure that recursively splits the feature space into rectangular regions.",
  intuition: "The 20-Questions Game: 'Is the customer's age > 30?' → Yes → 'Is their income > $80K?' → Yes → 'Predict: Will buy premium product.' Each question creates a split, and the answers create branches until a final decision is reached at the leaf.",
  whenToUse: "When complete model interpretability is required (medical, legal, financial compliance). As the building block for understanding Random Forest and Gradient Boosting.",
  whenToAvoid: "When you need high accuracy on complex datasets (single trees overfit easily). Use ensemble methods (Random Forest, XGBoost) instead.",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: false,
    linearRelationship: false
  },
  parameters: [
    {
      name: "max_depth",
      type: "int or None",
      default: "None (fully grown)",
      impact: "Maximum depth of the tree.",
      tuningTip: "Unrestricted trees overfit catastrophically. Set to 3-10 for interpretability and generalization."
    },
    {
      name: "criterion",
      type: "string",
      default: "'gini' (clf) / 'squared_error' (reg)",
      impact: "Function to measure split quality.",
      tuningTip: "'gini' and 'entropy' produce nearly identical trees. Gini is slightly faster to compute."
    },
    {
      name: "min_samples_leaf",
      type: "int",
      default: "1",
      impact: "Minimum number of samples required at a leaf node.",
      tuningTip: "Increase to 5-20 to prevent leaves with a single sample (extreme overfitting)."
    },
    {
      name: "max_features",
      type: "string or int",
      default: "None (all features)",
      impact: "Number of features considered at each split.",
      tuningTip: "In Random Forest, this is set to 'sqrt' to decorrelate trees."
    }
  ],
  math: {
    formula: "Gini Impurity: G = 1 - ∑ pᵢ²  |  Entropy: H = -∑ pᵢ · log₂(pᵢ)",
    loss: "Information Gain = Parent Impurity - Weighted Average of Children Impurity",
    explanation: "At each node, the algorithm finds the feature and threshold that maximizes Information Gain (or equivalently, maximally reduces impurity). This greedy recursive process builds the tree from root to leaves."
  },
  pros: [
    "Crystal clear interpretability: can be printed as human-readable if-then rules",
    "Requires zero feature scaling or normalization",
    "Naturally handles both numerical and categorical features",
    "The foundational building block of all ensemble tree methods"
  ],
  cons: [
    "Extremely prone to overfitting (high variance) without pruning or depth limits",
    "Unstable: small data changes can produce completely different tree structures",
    "Cannot extrapolate beyond the training data range (step-function predictions)"
  ],
  prerequisites: ["what-is-classification", "what-is-regression"],
  related: ["random-forest", "gradient-boosting", "isolation-forest", "overfitting-underfitting"],
  diagram: `flowchart TD
    A[("Node with training samples")] --> B["Try every feature and threshold"]
    B --> C["Compute impurity drop (Gini / Entropy / MSE)"]
    C --> D["Choose best split"]
    D --> E["Left child: feature ≤ threshold"]
    D --> F["Right child: feature greater than threshold"]
    E --> G{"Stopping rule hit? (max_depth, min_samples, pure)"}
    F --> G
    G -->|"no"| B
    G -->|"yes"| H(["Leaf: majority class or mean value"])`,
  codeSnippet: `from sklearn.tree import DecisionTreeClassifier, export_text

dt = DecisionTreeClassifier(max_depth=4, min_samples_leaf=5, random_state=42)
dt.fit(X_train, y_train)

# Print human-readable decision rules
rules = export_text(dt, feature_names=['age', 'income', 'credit_score'])
print(rules)

# Predict
pred = dt.predict(X_test)
print(f"Test Accuracy: {dt.score(X_test, y_test):.4f}")`
};
