export default {
  id: "dl-regularization",
  name: "DL Regularization (Dropout, BatchNorm, Early Stopping)",
  track: "deep-learning",
  category: "Optimization",
  task: ["Optimization", "Evaluation"],
  difficulty: "Intermediate",
  summary: "A toolkit of techniques that keep large neural networks from memorizing the training data and help them train stably and generalize to unseen examples.",
  intuition: "Training a Sports Team: Dropout randomly benches players during practice so no one becomes a single point of failure. BatchNorm is a referee who keeps every player's energy on the same scale. Early Stopping is the coach who ends practice when the scrimmage score stops improving instead of drilling until everyone is exhausted.",
  whenToUse: "Whenever validation loss starts rising while training loss keeps falling, when the model has far more parameters than training samples, or when deep networks train unstably. Early stopping is worth using on virtually every training run.",
  whenToAvoid: "Heavy dropout on tiny models that are already underfitting. BatchNorm with very small batch sizes (under ~8) or in RNNs/Transformers, where LayerNorm is the better choice.",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: false,
    validationSetRequired: true
  },
  parameters: [
    {
      name: "Dropout p",
      type: "float",
      default: "0.1 – 0.5",
      impact: "Probability of zeroing each activation during training (disabled at inference).",
      tuningTip: "0.5 for large fully connected layers, 0.1–0.2 for convolutional and Transformer blocks."
    },
    {
      name: "BatchNorm / LayerNorm",
      type: "layer",
      default: "BatchNorm2d after Conv",
      impact: "Normalizes activations to zero mean, unit variance, then rescales with learnable γ and β.",
      tuningTip: "BatchNorm for CNNs with batch ≥ 16; LayerNorm for Transformers, RNNs and small batches."
    },
    {
      name: "Early stopping patience",
      type: "int",
      default: "5 – 10 epochs",
      impact: "Epochs to wait without validation improvement before stopping and restoring the best weights.",
      tuningTip: "Use longer patience with noisy validation curves or LR schedules that have warm restarts."
    },
    {
      name: "Data augmentation",
      type: "concept",
      default: "Flips, crops, color jitter",
      impact: "Creates realistic variations of training samples, enlarging the effective dataset.",
      tuningTip: "Often the single most effective regularizer for images and audio."
    }
  ],
  math: {
    formula: "Dropout: h̃ = (m ⊙ h) / (1−p), m ~ Bernoulli(1−p)  |  BatchNorm: ŷ = γ·(x − μ_B)/√(σ²_B + ε) + β",
    loss: "Training loss + implicit / explicit regularization (weight decay λ·‖w‖²)",
    explanation: "Dropout trains an implicit ensemble of thinned sub-networks; dividing by (1−p) keeps the expected activation the same at train and test time. BatchNorm standardizes each feature using mini-batch statistics μ_B and σ²_B, smoothing the loss surface and allowing larger learning rates. At inference it uses running averages collected during training."
  },
  pros: [
    "Dramatically reduces overfitting with minimal code changes",
    "BatchNorm speeds up convergence and makes training less sensitive to initialization",
    "Early stopping saves compute and needs no extra model changes",
    "Techniques combine well (dropout + weight decay + augmentation)"
  ],
  cons: [
    "Forgetting model.eval() at inference leaves dropout on and uses batch stats (a classic bug)",
    "BatchNorm behaves poorly with tiny or non-i.i.d. batches",
    "Too much regularization causes underfitting and slower training",
    "Adds hyperparameters that interact with each other and with the learning rate"
  ],
  prerequisites: ["overfitting-underfitting", "mlp-neural-network"],
  related: ["regularization-l1-l2", "dl-optimizers", "bias-variance-tradeoff", "cnn"],
  diagram: `flowchart TD
  A["Training batch"] --> B["Data augmentation: flips, crops, noise"]
  B --> C["Conv / Linear layer"]
  C --> D["BatchNorm: subtract μ_B, divide by σ_B, rescale γ β"]
  D --> E["Activation (ReLU)"]
  E --> F["Dropout: zero random units with prob p"]
  F --> G["Loss + weight decay λ·‖w‖²"]
  G --> H["Evaluate on validation set each epoch"]
  H --> I{"Val loss improved?"}
  I -->|"yes"| J["Save best checkpoint, reset patience"]
  I -->|"no"| K{"Patience exhausted?"}
  J --> A
  K -->|"no"| A
  K -->|"yes"| L(["Stop and restore best weights"])`,
  codeSnippet: `import copy
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Conv2d(3, 32, 3, padding=1),
    nn.BatchNorm2d(32),        # normalize activations per channel
    nn.ReLU(),
    nn.MaxPool2d(2),
    nn.Flatten(),
    nn.Dropout(0.5),           # randomly zero 50% of features (train only)
    nn.Linear(32 * 16 * 16, 10),
)
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)
loss_fn = nn.CrossEntropyLoss()

best_val, best_state, patience, bad_epochs = float("inf"), None, 5, 0
for epoch in range(100):
    model.train()                              # dropout ON, BatchNorm uses batch stats
    for X, y in train_loader:
        optimizer.zero_grad()
        loss_fn(model(X), y).backward()
        optimizer.step()

    model.eval()                               # dropout OFF, BatchNorm uses running stats
    with torch.no_grad():
        val_loss = sum(loss_fn(model(X), y).item() for X, y in val_loader) / len(val_loader)

    if val_loss < best_val:                    # early stopping bookkeeping
        best_val, best_state, bad_epochs = val_loss, copy.deepcopy(model.state_dict()), 0
    else:
        bad_epochs += 1
        if bad_epochs >= patience:
            print(f"Early stop at epoch {epoch}")
            break

model.load_state_dict(best_state)              # restore best checkpoint`
};
