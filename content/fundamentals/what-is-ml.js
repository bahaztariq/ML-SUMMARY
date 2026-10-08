export default {
  id: "what-is-ml",
  name: "What is Machine Learning (ML)?",
  track: "fundamentals",
  category: "Foundations & Overview",
  task: ["Definition", "Foundations", "Overview"],
  difficulty: "Beginner",
  summary: "A subfield of Artificial Intelligence where algorithms learn mathematical mappings and statistical patterns directly from historical data to make accurate predictions on new data, without being explicitly programmed.",
  intuition: "Learning from Experience: In traditional software programming, humans write explicit rules: (Data + Rules = Answers). In Machine Learning, you feed the computer data and observed outcomes, and the algorithm calculates the underlying rules: (Data + Answers = Rules).",
  whenToUse: "When the rules connecting inputs to outputs are too complex, dynamic, or high-dimensional for human programmers to write by hand (e.g. spam detection, fraud alerts, recommendation engines).",
  whenToAvoid: "When the problem can be solved with a simple static formula, strict legal compliance rules that forbid probabilistic uncertainty, or when you have zero historical data to learn from.",
  requirements: {
    requiresQualityData: true,
    probabilisticOutput: true,
    generalizationGoal: true,
    avoidsHardcodedRules: true
  },
  parameters: [
    {
      name: "Supervised Learning",
      type: "paradigm",
      default: "Most common",
      impact: "Learning with labels: mapping inputs X to known ground truth targets y.",
      tuningTip: "Use when you have clear historical answers (e.g. customer churn: yes/no)."
    },
    {
      name: "Unsupervised Learning",
      type: "paradigm",
      default: "Exploratory",
      impact: "Learning without labels: finding natural clusters, distributions, or low-dimensional projections.",
      tuningTip: "Use for customer segmentation or anomaly detection."
    },
    {
      name: "Reinforcement Learning",
      type: "paradigm",
      default: "Sequential",
      impact: "Learning via trial-and-error rewards and penalties inside dynamic environments.",
      tuningTip: "Use for robotics, autonomous driving, and game playing (e.g. AlphaGo)."
    }
  ],
  math: {
    formula: "Traditional: Data + Rules -> Answers  |  ML: Data + Answers -> Rules (Model: ŷ = f(X; θ))",
    loss: "Empirical Risk Minimization (ERM)",
    explanation: "A machine learning model parameterizes a function f with adjustable weights θ. The goal of training is finding the optimal weights θ* that minimize empirical prediction error over training examples."
  },
  pros: [
    "Adapts dynamically to changing patterns when retrained on fresh data",
    "Solves complex problems that cannot be described with rigid if-else logic",
    "Scales automated decision-making across millions of transactions per second"
  ],
  cons: [
    "Garbage In, Garbage Out: Model quality is strictly bottlenecked by training data quality",
    "Predictions are probabilistic approximations, not mathematical certainties",
    "Vulnerable to distribution drift when the real world changes"
  ],
  prerequisites: ["what-is-ai"],
  related: ["supervised-vs-unsupervised", "ml-workflow", "what-is-deep-learning", "loss-vs-cost-function"],
  diagram: `flowchart LR
    subgraph trad["Traditional programming"]
      R1["Rules"] --> P1["Program"]
      D1["Data"] --> P1
      P1 --> O1["Answers"]
    end
    subgraph ml["Machine learning"]
      D2[("Historical data")] --> L["Learning algorithm"]
      Y2["Known answers (labels)"] --> L
      L --> M["Learned model = rules"]
    end
    M --> N["New unseen data"]
    N --> Q["Predictions"]`,
  codeSnippet: `from sklearn.linear_model import LogisticRegression

# 1. Provide Data (Features X) and Observed Answers (Labels y)
X_features = [[25, 50000], [45, 120000], [22, 25000], [55, 180000]] # [Age, Income]
y_answers  = [0, 1, 0, 1]                                            # [Did Buy Luxury Car: 0=No, 1=Yes]

# 2. Machine Learning: The model learns the rules automatically!
model = LogisticRegression()
model.fit(X_features, y_answers)

# 3. Predict on unseen new data
new_customer = [[38, 95000]]
prediction = model.predict(new_customer)
print(f"Prediction for new customer: {'Will Buy (1)' if prediction[0] == 1 else 'Will Not Buy (0)'}")`
};
