export default {
  id: "dl-optimizers",
  name: "Deep Learning Optimizers (Momentum, RMSProp, Adam)",
  track: "deep-learning",
  category: "Optimization",
  task: ["Optimization"],
  difficulty: "Intermediate",
  summary: "Upgrades to plain gradient descent that use running averages of past gradients to speed up and stabilize the training of deep neural networks.",
  intuition: "The Smart Hiker: Plain SGD takes a step straight downhill every time, zig-zagging across narrow ravines. Momentum is a heavy ball that builds speed in a consistent direction. RMSProp gives each parameter its own shoe size, taking small steps where the ground is steep and big ones where it is flat. Adam does both at once.",
  whenToUse: "Training any neural network. AdamW is the default for Transformers, LLM fine-tuning and most new projects; SGD with momentum is still favored for large CNN image training where it often generalizes slightly better.",
  whenToAvoid: "Classic convex models with closed-form or second-order solvers (OLS, L-BFGS for small logistic regression). Avoid plain SGD without momentum on deep networks (very slow convergence).",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: true,
    learningRateSchedule: "recommended"
  },
  parameters: [
    {
      name: "lr (learning rate)",
      type: "float",
      default: "1e-3 (Adam), 0.1 (SGD)",
      impact: "The global step size; the single most important hyperparameter.",
      tuningTip: "Use an LR finder or try 3e-4 for Adam. Combine with warmup + cosine decay for Transformers."
    },
    {
      name: "momentum / beta1",
      type: "float",
      default: "0.9",
      impact: "How much of the previous update direction is carried forward (first moment).",
      tuningTip: "0.9 is almost always fine. Lower toward 0.5 if training oscillates wildly."
    },
    {
      name: "beta2",
      type: "float",
      default: "0.999",
      impact: "Decay rate of the running average of squared gradients (second moment, per-parameter scale).",
      tuningTip: "Use 0.95–0.98 for large Transformer / LLM training to react faster to gradient spikes."
    },
    {
      name: "weight_decay",
      type: "float",
      default: "0.01 (AdamW)",
      impact: "Shrinks weights toward zero each step (L2-style regularization).",
      tuningTip: "Use AdamW (decoupled decay), not Adam + L2 loss. Exclude biases and LayerNorm weights."
    }
  ],
  math: {
    formula: "mₜ = β₁·mₜ₋₁ + (1−β₁)·gₜ  |  vₜ = β₂·vₜ₋₁ + (1−β₂)·gₜ²  |  θₜ = θₜ₋₁ − η·m̂ₜ / (√v̂ₜ + ε)",
    loss: "Any differentiable loss (Cross-Entropy, MSE …)",
    explanation: "Momentum (m) is an exponential average of gradients that smooths noisy mini-batch directions. The second moment (v) tracks squared gradients so each parameter's step is divided by its typical gradient size (RMSProp). Adam combines both and applies bias corrections m̂ and v̂ for the first few steps when the averages start at zero."
  },
  pros: [
    "Converges much faster than plain SGD on deep, ill-conditioned loss surfaces",
    "Adaptive per-parameter learning rates handle sparse features and embeddings well",
    "Adam/AdamW work well with default hyperparameters across many tasks",
    "Momentum helps escape plateaus and shallow saddle points"
  ],
  cons: [
    "Adam stores two extra tensors per parameter (3x the memory of the model weights)",
    "Adaptive methods can generalize slightly worse than tuned SGD on some vision tasks",
    "Still sensitive to the learning rate and its schedule",
    "Adam with naive L2 regularization behaves differently than intended (use AdamW)"
  ],
  prerequisites: ["what-is-gradient-descent", "mlp-neural-network"],
  related: ["dl-regularization", "activation-functions", "hyperparameter-tuning", "loss-vs-cost-function"],
  diagram: `flowchart TD
  A["Mini-batch of data"] --> B["Forward pass → loss"]
  B --> C["Backward pass → gradient g"]
  C --> D["Momentum: m = β₁·m + (1−β₁)·g"]
  C --> E["RMSProp: v = β₂·v + (1−β₂)·g²"]
  D --> F["Bias correction m̂, v̂"]
  E --> F
  F --> G["Adam step: θ ← θ − η·m̂ / (√v̂ + ε)"]
  G --> H["AdamW: also shrink θ by weight decay"]
  H --> I["LR scheduler adjusts η"]
  I --> J{"Converged?"}
  J -->|"no"| A
  J -->|"yes"| K(["Trained weights"])`,
  codeSnippet: `import torch
import torch.nn as nn
from torch.optim import SGD, AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

model = nn.Sequential(nn.Linear(100, 256), nn.ReLU(), nn.Linear(256, 10))
loss_fn = nn.CrossEntropyLoss()

# Option 1: SGD + momentum (classic CNN recipe)
sgd = SGD(model.parameters(), lr=0.1, momentum=0.9, nesterov=True, weight_decay=5e-4)

# Option 2: AdamW (default for Transformers / most new projects)
optimizer = AdamW(model.parameters(), lr=3e-4, betas=(0.9, 0.999), weight_decay=0.01)
scheduler = CosineAnnealingLR(optimizer, T_max=50)  # decay lr over 50 epochs

for epoch in range(50):
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()                 # 1. clear old gradients
        loss = loss_fn(model(X_batch), y_batch)
        loss.backward()                       # 2. compute gradients g
        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)  # guard against spikes
        optimizer.step()                      # 3. update m, v and the weights
    scheduler.step()                          # 4. shrink lr once per epoch
    print(f"epoch {epoch} lr={scheduler.get_last_lr()[0]:.5f} loss={loss.item():.4f}")`
};
