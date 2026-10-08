export default {
  id: "activation-functions",
  name: "Activation Functions (ReLU, Sigmoid, Tanh, GELU, Softmax)",
  track: "deep-learning",
  category: "Neural Building Blocks",
  task: ["Definition", "Architecture"],
  difficulty: "Beginner",
  summary: "Non-linear functions applied to each neuron's weighted sum so that stacked layers can model curved, complex relationships instead of collapsing into one linear model.",
  intuition: "The Bouncer at the Door: Each neuron computes a score, and the activation function is the bouncer deciding how much of that signal gets through. ReLU lets positive scores in unchanged and blocks negatives, Sigmoid squeezes everything into a 0–1 'probability', and Softmax turns a row of scores into a fair share of 100%.",
  whenToUse: "Every hidden layer of every neural network. ReLU / GELU for hidden layers by default, Sigmoid for binary outputs, Softmax for multi-class outputs, Tanh inside RNN/LSTM cells, and no activation (linear) for regression outputs.",
  whenToAvoid: "Do not put Sigmoid/Tanh in the hidden layers of very deep feedforward networks (they saturate and cause vanishing gradients). Do not apply Softmax before nn.CrossEntropyLoss in PyTorch (the loss already includes log-softmax).",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: false,
    differentiable: true
  },
  parameters: [
    {
      name: "ReLU",
      type: "function",
      default: "max(0, z)",
      impact: "Cheap, non-saturating for positive inputs, produces sparse activations.",
      tuningTip: "Safe default for CNNs and MLPs. Pair with He (Kaiming) weight initialization."
    },
    {
      name: "LeakyReLU negative_slope",
      type: "float",
      default: "0.01",
      impact: "Gives negative inputs a small gradient so neurons cannot 'die' permanently at zero.",
      tuningTip: "Switch to LeakyReLU (0.01–0.2) if many ReLU units output zero for every input (dead neurons). Common in GAN discriminators."
    },
    {
      name: "GELU / SiLU (Swish)",
      type: "function",
      default: "z · Φ(z)",
      impact: "Smooth ReLU-like curves that slightly improve optimization in very deep models.",
      tuningTip: "Standard inside Transformers (BERT, GPT use GELU; LLaMA uses SiLU/SwiGLU)."
    },
    {
      name: "Output activation",
      type: "function",
      default: "Task dependent",
      impact: "Maps the final layer to the correct output range.",
      tuningTip: "Sigmoid → binary / multi-label, Softmax → single-label multi-class, Identity → regression."
    }
  ],
  math: {
    formula: "ReLU(z) = max(0, z)  |  σ(z) = 1 / (1 + e⁻ᶻ)  |  tanh(z) = (eᶻ − e⁻ᶻ)/(eᶻ + e⁻ᶻ)  |  softmax(zᵢ) = eᶻⁱ / Σⱼ eᶻʲ",
    loss: "Shapes the gradient flowing through backpropagation",
    explanation: "Without a non-linearity, W₂·(W₁·x) = (W₂·W₁)·x is still just one linear layer, no matter how deep. The derivative of the activation multiplies every backpropagated gradient: Sigmoid's derivative is at most 0.25, so chaining many layers shrinks gradients toward zero, while ReLU's derivative is exactly 1 for positive inputs."
  },
  pros: [
    "Gives neural networks their universal function approximation power",
    "ReLU-family functions are extremely cheap to compute and keep gradients healthy",
    "Output activations map raw scores to interpretable probabilities",
    "Easy to swap and experiment with (one line of code)"
  ],
  cons: [
    "Sigmoid and Tanh saturate, causing vanishing gradients in deep stacks",
    "ReLU can produce 'dead neurons' that never activate again after a bad update",
    "The wrong output activation silently breaks training (e.g. Softmax for multi-label)"
  ],
  prerequisites: ["what-is-deep-learning", "linear-algebra"],
  related: ["mlp-neural-network", "dl-optimizers", "logistic-regression", "what-is-gradient-descent"],
  diagram: `flowchart LR
  X["Inputs x₁ … xₙ"] --> W["Weighted sum z = W·x + b"]
  W --> Q{"Which layer?"}
  Q -->|"hidden"| H["ReLU / GELU: max(0, z)"]
  Q -->|"binary output"| S["Sigmoid → 0..1"]
  Q -->|"multi-class output"| M["Softmax → probabilities sum to 1"]
  Q -->|"regression output"| I["Identity: z unchanged"]
  H --> N["Next layer learns non-linear patterns"]
  N --> B["Backprop: gradient × activation derivative"]
  B -.->|"Sigmoid derivative ≤ 0.25 shrinks gradients"| V["Vanishing gradient risk"]
  B -.->|"ReLU derivative = 1 when z ≥ 0"| G["Healthy gradient flow"]`,
  codeSnippet: `import torch
import torch.nn as nn

z = torch.linspace(-4, 4, 9)

# Compare common activation functions on the same inputs
activations = {
    "relu": nn.ReLU(),
    "leaky_relu": nn.LeakyReLU(0.1),
    "sigmoid": nn.Sigmoid(),
    "tanh": nn.Tanh(),
    "gelu": nn.GELU(),
}
for name, fn in activations.items():
    print(f"{name:>10}: {fn(z).round(decimals=2).tolist()}")

# Typical placement inside a classifier
model = nn.Sequential(
    nn.Linear(20, 64),
    nn.ReLU(),            # hidden layer non-linearity
    nn.Linear(64, 64),
    nn.GELU(),
    nn.Linear(64, 3),     # raw logits: NO softmax here...
)
loss_fn = nn.CrossEntropyLoss()  # ...because this applies log-softmax internally

# At inference time, convert logits into class probabilities
logits = model(torch.randn(5, 20))
probs = torch.softmax(logits, dim=1)
print(probs.sum(dim=1))  # each row sums to 1.0`
};
