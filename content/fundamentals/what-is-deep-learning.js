export default {
  id: "what-is-deep-learning",
  name: "What is Deep Learning (DL)?",
  track: "fundamentals",
  category: "Foundations & Overview",
  task: ["Definition", "Deep Learning", "Neural Networks"],
  difficulty: "Beginner",
  summary: "A subfield of Machine Learning based on Artificial Neural Networks with multiple representation layers (hence 'deep') that automatically discover and extract hierarchical features directly from raw data.",
  intuition: "Factory Assembly Line of Abstraction: In facial recognition, Layer 1 detects raw edges. Layer 2 combines edges into shapes (noses, eyes). Layer 3 combines shapes into full faces. The network builds its own understanding without any human manually defining what an eye looks like.",
  whenToUse: "Unstructured data (images, audio, video, natural language text, speech) or vast tabular datasets with millions of rows where classical models hit a performance plateau.",
  whenToAvoid: "Small tabular datasets (<20,000 samples) where tree ensembles (XGBoost, Random Forest) consistently outperform neural networks with 100x less compute.",
  requirements: {
    multiLayeredANNs: true,
    automaticFeatureExtraction: true,
    computationalIntensityGPU: true,
    dataHungry: true
  },
  parameters: [
    {
      name: "Depth (Layers)",
      type: "hyperparameter",
      default: "3 to 100+ layers",
      impact: "Number of hidden representation layers between input and output.",
      tuningTip: "Deeper networks can represent more abstract concepts, but risk vanishing gradients."
    },
    {
      name: "Activation Function",
      type: "component",
      default: "ReLU / GELU",
      impact: "Introduces non-linearity; allows network to learn complex curved relationships.",
      tuningTip: "Use ReLU for CNNs/MLPs, GELU for modern Transformers."
    },
    {
      name: "Feature Engineering vs Feature Learning",
      type: "paradigm",
      default: "Automated",
      impact: "Traditional ML requires hand-crafted features; Deep Learning learns representations end-to-end.",
      tuningTip: "Saves thousands of hours of manual domain feature extraction."
    }
  ],
  math: {
    formula: "h^(l) = σ( W^(l) · h^(l-1) + b^(l) )  where l = 1, 2, ..., L",
    loss: "Backpropagation via Multivariable Chain Rule: ∂L / ∂W",
    explanation: "Each layer performs an affine linear transformation followed by an element-wise non-linear activation $\\sigma$. Gradients flow backwards through all L layers via the chain rule to update synaptic weights."
  },
  pros: [
    "Powers cutting-edge generative AI, computer vision, speech recognition, and LLMs",
    "Performance keeps scaling higher as you feed more data and compute (no plateau)",
    "Zero requirement for manual feature engineering on raw images or text"
  ],
  cons: [
    "Extremely hungry for compute (requires specialized GPUs/TPUs and high electricity costs)",
    "Data voracious: easily overfits and performs terribly on small datasets",
    "Almost zero internal interpretability (complex black box)"
  ],
  prerequisites: ["what-is-ml", "what-is-gradient-descent"],
  related: ["mlp-neural-network", "cnn", "transformer-architecture", "activation-functions"],
  diagram: `flowchart LR
    A["Raw input: pixels, tokens, audio"] --> B["Layer 1: simple features (edges, characters)"]
    B --> C["Hidden layers: combinations (shapes, words)"]
    C --> D["Deep layers: abstract concepts (faces, meaning)"]
    D --> E["Output: prediction"]
    E --> F["Loss vs true label"]
    F --> G["Backpropagation computes gradients"]
    G --> H["Optimizer updates all weights"]
    H -.->|"repeat over many batches"| B`,
  codeSnippet: `import torch
import torch.nn as nn

# A "Deep" Neural Network has multiple hidden layers
class DeepNeuralNetwork(nn.Module):
    def __init__(self, input_dim=784, hidden_dim=128, output_dim=10):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),   # Layer 1: Detects low-level patterns
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),  # Layer 2: Detects mid-level patterns
            nn.ReLU(),
            nn.Linear(hidden_dim, output_dim)   # Layer 3: Output decision classes
        )
    def forward(self, x):
        return self.net(x)`
};
