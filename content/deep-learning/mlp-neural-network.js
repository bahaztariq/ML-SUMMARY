export default {
  id: "mlp-neural-network",
  name: "Multi-Layer Perceptron (MLP)",
  track: "deep-learning",
  category: "Neural Architectures",
  task: ["Classification", "Regression", "Tabular"],
  difficulty: "Intermediate",
  summary: "The simplest form of a feedforward deep neural network, consisting of an input layer, one or more hidden layers of fully connected neurons, and an output layer. Each neuron applies a weighted sum followed by a non-linear activation function.",
  intuition: "The Assembly Line Brain: Each layer of workers (neurons) receives inputs from the previous layer, performs calculations (weighted sums + activation), and passes results to the next layer. The final layer produces the prediction.",
  whenToUse: "Complex tabular data with millions of rows where non-linear feature interactions exist. As a baseline neural network before trying more specialized architectures.",
  whenToAvoid: "Structured data like images (use CNN), sequences (use RNN/Transformer), or small tabular datasets (<10K rows where tree ensembles dominate).",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: true,
    linearRelationship: false
  },
  parameters: [
    {
      name: "hidden_layer_sizes",
      type: "tuple",
      default: "(100,)",
      impact: "Number and size of hidden layers.",
      tuningTip: "Start with (128, 64). Deeper is not always better for tabular data."
    },
    {
      name: "activation",
      type: "string",
      default: "'relu'",
      impact: "Activation function for hidden layers.",
      tuningTip: "ReLU is the safe default. Use 'tanh' for data centered around zero."
    },
    {
      name: "learning_rate_init",
      type: "float",
      default: "0.001",
      impact: "Initial step size for weight updates.",
      tuningTip: "0.001 with Adam optimizer is the universal starting point."
    },
    {
      name: "Dropout",
      type: "float",
      default: "0.0 - 0.5",
      impact: "Randomly deactivates neurons during training to prevent co-adaptation.",
      tuningTip: "Use 0.2-0.5 for regularization. PyTorch: nn.Dropout(0.3)."
    }
  ],
  math: {
    formula: "h = σ(W · x + b)  |  ŷ = softmax(W_out · h_L + b_out)",
    loss: "Cross-Entropy (Classification) or MSE (Regression) + Backpropagation",
    explanation: "Each hidden layer computes an affine transformation followed by a non-linear activation. Backpropagation computes gradients of the loss with respect to every weight via the chain rule, enabling gradient descent to update all parameters simultaneously."
  },
  pros: [
    "Universal function approximator (can theoretically model any continuous function)",
    "Captures complex non-linear feature interactions automatically",
    "Scales well with large datasets and GPU acceleration"
  ],
  cons: [
    "Requires careful hyperparameter tuning (layers, neurons, learning rate, regularization)",
    "Black box: individual neuron weights are not interpretable",
    "Prone to overfitting without Dropout, early stopping, or weight decay"
  ],
  prerequisites: ["what-is-deep-learning", "what-is-gradient-descent", "activation-functions"],
  related: ["dl-optimizers", "dl-regularization", "cnn", "logistic-regression"],
  diagram: `flowchart LR
  X["Input features (scaled)"] --> H1["Hidden layer 1: W₁·x + b₁"]
  H1 --> A1["ReLU"]
  A1 --> H2["Hidden layer 2: W₂·h₁ + b₂"]
  H2 --> A2["ReLU + Dropout"]
  A2 --> O["Output layer → softmax / linear"]
  O --> L["Loss vs true label"]
  L --> BP["Backpropagation: chain rule gradients"]
  BP --> OPT["Optimizer (Adam) updates all W, b"]
  OPT -.->|"next mini-batch"| H1`,
  codeSnippet: `from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

# Sklearn MLP (quick prototyping)
mlp = make_pipeline(
    StandardScaler(),
    MLPClassifier(
        hidden_layer_sizes=(128, 64, 32),
        activation='relu',
        solver='adam',
        max_iter=500,
        early_stopping=True,
        random_state=42
    )
)
mlp.fit(X_train, y_train)
print(f"MLP Test Accuracy: {mlp.score(X_test, y_test):.4f}")`
};
