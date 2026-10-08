export default {
  id: "what-is-ai",
  name: "What is Artificial Intelligence (AI)?",
  track: "fundamentals",
  category: "Foundations & Overview",
  task: ["Definition", "Foundations", "Overview"],
  difficulty: "Beginner",
  summary: "The overarching scientific and engineering discipline dedicated to creating systems capable of performing tasks that typically require human cognitive intelligence.",
  intuition: "The Broadest Umbrella: Think of AI as the entire field of transportation. Cars, planes, trains, and bicycles are all transportation. Similarly, rule-based expert systems, machine learning algorithms, and deep neural networks are all subfields of AI.",
  whenToUse: "When building software that must perceive its environment, reason through uncertain problems, recognize patterns, or make autonomous decisions at scale.",
  whenToAvoid: "When simple deterministic logic (e.g. standard SQL queries, arithmetic formulas, or if-else statements) solves the problem with 100% precision and zero uncertainty.",
  requirements: {
    umbrellaField: true,
    subsumesMLandDL: true,
    includesRuleBasedSystems: true,
    requiresDataOrHeuristics: true
  },
  parameters: [
    {
      name: "Narrow AI (ANI)",
      type: "concept",
      default: "Current Reality",
      impact: "AI specialized in one single task (e.g. playing chess, recommending movies, detecting tumors).",
      tuningTip: "All existing commercial AI today is Narrow AI."
    },
    {
      name: "General AI (AGI)",
      type: "concept",
      default: "Theoretical",
      impact: "Hypothetical AI possessing human-level cognitive adaptability across any intellectual domain.",
      tuningTip: "Active area of long-term academic and industrial research."
    },
    {
      name: "Symbolic vs Statistical AI",
      type: "paradigm",
      default: "Statistical Dominant",
      impact: "Symbolic AI uses handcrafted logic rules; Statistical AI (ML) learns probabilistic patterns from empirical data.",
      tuningTip: "Modern AI combines statistical learning with symbolic constraints."
    }
  ],
  math: {
    formula: "AI ⊃ Machine Learning (ML) ⊃ Deep Learning (DL)",
    loss: "Hierarchy of Artificial Intelligence",
    explanation: "AI is the parent superset. Machine Learning is the statistical engine within AI that learns from data. Deep Learning is the specialized multi-layered neural network branch inside Machine Learning."
  },
  pros: [
    "Automates high-complexity cognitive tasks previously restricted to humans",
    "Processes massive multi-modal streams (vision, audio, text, sensor data) at scale",
    "Can discover non-intuitive solutions and patterns in high-dimensional domains"
  ],
  cons: [
    "Can behave as unpredictable black boxes without strict verification safeguards",
    "Subject to hallucinations, data bias, and safety alignment challenges"
  ],
  prerequisites: [],
  related: ["what-is-ml", "what-is-deep-learning", "supervised-vs-unsupervised"],
  diagram: `flowchart TD
    A(["Problem needing intelligent behavior"]) --> B{"Can explicit rules solve it?"}
    B -->|"yes"| C["Symbolic AI: hand-written rules / expert system"]
    B -->|"no, patterns hidden in data"| D["Machine Learning: learn rules from examples"]
    D --> E{"Unstructured data at large scale? (images, text, audio)"}
    E -->|"no, tabular"| F["Classical ML: trees, linear models, SVM"]
    E -->|"yes"| G["Deep Learning: multi-layer neural networks"]
    G --> H["Foundation models / LLMs"]
    C --> I["AI system makes decisions"]
    F --> I
    H --> I`,
  codeSnippet: `# Conceptual Hierarchy in Python
class ArtificialIntelligence:
    def __init__(self, name="Broad AI"):
        self.scope = "Any machine exhibiting intelligent behavior"

class MachineLearning(ArtificialIntelligence):
    def __init__(self):
        super().__init__("Machine Learning")
        self.mechanism = "Learns statistical patterns from data without explicit rules"

class DeepLearning(MachineLearning):
    def __init__(self):
        super().__init__()
        self.architecture = "Multi-layer artificial neural networks (ANNs)"

ai_stack = DeepLearning()
print(f"Parent: {issubclass(DeepLearning, ArtificialIntelligence)}") # True`
};
