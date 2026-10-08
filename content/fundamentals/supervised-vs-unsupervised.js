export default {
  id: "supervised-vs-unsupervised",
  name: "Supervised vs Unsupervised vs Reinforcement Learning",
  track: "fundamentals",
  category: "Learning Paradigms",
  task: ["Definition", "Foundations", "Comparison"],
  difficulty: "Beginner",
  summary: "The three primary learning paradigms of machine learning, categorized by the presence, absence, or reward-based nature of feedback signals during training.",
  intuition: "Three Ways to Learn Guitar: 1) Supervised: A teacher sits next to you, corrects every wrong note immediately. 2) Unsupervised: You listen to 1,000 songs with no teacher and notice that certain chords naturally sound good together. 3) Reinforcement: You play on stage blindfolded; every time the crowd cheers you keep playing that riff, every time they boo you change it.",
  whenToUse: "Supervised: When historical labels exist. Unsupervised: When exploring raw unlabeled data. Reinforcement: When an agent must learn optimal sequential strategies through environment interaction.",
  whenToAvoid: "Trying to force supervised learning when annotating data is too expensive (use unsupervised or self-supervised instead).",
  requirements: {
    foundationalTaxonomy: true,
    determinesDataCollection: true
  },
  parameters: [
    {
      name: "Supervised Learning",
      type: "data setup",
      default: "Features (X) + Labels (y)",
      impact: "Direct error feedback between predicted ŷ and true label y.",
      tuningTip: "Regression and Classification."
    },
    {
      name: "Unsupervised Learning",
      type: "data setup",
      default: "Features (X) only",
      impact: "No labels; discovers clusters, hidden manifolds, and density distributions.",
      tuningTip: "Clustering and Dimensionality Reduction."
    },
    {
      name: "Reinforcement Learning",
      type: "data setup",
      default: "State, Action, Reward",
      impact: "Trial and error exploration in an interactive environment.",
      tuningTip: "Game agents, autonomous robots, trading algorithms."
    }
  ],
  math: {
    formula: "Supervised: min ∑ L(f(x_i), y_i)  |  Unsupervised: P(X) density  |  RL: max E[∑ γᵗ · r_t]",
    loss: "Comparison of Optimization Objectives",
    explanation: "Supervised minimizes label error; Unsupervised maximizes likelihood or minimizes reconstruction error; Reinforcement maximizes expected discounted future rewards."
  },
  pros: [
    "Provides the fundamental taxonomy to immediately frame any real-world problem",
    "Guides proper dataset collection and annotation budgets before writing code"
  ],
  cons: [
    "Boundaries can blur in modern AI (e.g. Self-Supervised Learning in LLMs generates its own labels from text)"
  ],
  prerequisites: ["what-is-ml"],
  related: ["what-is-classification", "what-is-regression", "what-is-clustering", "q-learning"],
  diagram: `flowchart TD
    A(["What does your data / signal look like?"]) --> B{"Labeled target y available?"}
    B -->|"yes"| C["Supervised learning"]
    C --> D{"Target type?"}
    D -->|"category"| E["Classification"]
    D -->|"number"| F["Regression"]
    B -->|"no labels"| G["Unsupervised learning"]
    G --> H["Clustering"]
    G --> I["Dimensionality reduction"]
    B -->|"only rewards from actions"| J["Reinforcement learning"]
    J --> K["Agent acts → environment → reward → update policy"]
    K --> J`,
  codeSnippet: `# Paradigm Decision Tree in Code
def select_ml_paradigm(has_labels, is_interactive_env):
    if is_interactive_env:
        return "Reinforcement Learning (Agent learns via environmental rewards)"
    elif has_labels:
        return "Supervised Learning (Model learns from X -> y pairs)"
    else:
        return "Unsupervised Learning (Model discovers hidden patterns in X)"`
};
