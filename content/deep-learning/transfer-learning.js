export default {
  id: "transfer-learning",
  name: "Transfer Learning & Fine-Tuning",
  track: "deep-learning",
  category: "Training Strategies",
  task: ["Computer Vision", "NLP", "Optimization"],
  difficulty: "Intermediate",
  summary: "Reusing a model pretrained on a huge dataset as the starting point for a new task, then adapting it with a small amount of task-specific data.",
  intuition: "The Experienced Chef: A chef trained for years in French cuisine does not relearn how to hold a knife when opening a sushi bar. They keep their core skills (the pretrained backbone) and only learn the new recipes (the new head), occasionally refining technique (fine-tuning) along the way.",
  whenToUse: "Small or medium labeled datasets (hundreds to tens of thousands of examples) in vision, NLP or audio; any time a strong pretrained model exists for a similar domain; tight compute or time budgets.",
  whenToAvoid: "When the target domain is radically different from the pretraining data (e.g. ImageNet weights for radar spectrograms may help little), when you have massive in-domain data and compute, or for classic tabular problems.",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: false,
    pretrainedModelRequired: true
  },
  parameters: [
    {
      name: "Frozen layers",
      type: "concept",
      default: "Freeze backbone first",
      impact: "Frozen layers keep pretrained weights; unfrozen layers adapt to the new data.",
      tuningTip: "Tiny dataset: train only the head. Medium dataset: unfreeze top blocks. Large dataset: fine-tune everything."
    },
    {
      name: "Fine-tuning learning rate",
      type: "float",
      default: "1e-5 – 1e-4",
      impact: "Too high destroys pretrained knowledge (catastrophic forgetting).",
      tuningTip: "Use 10–100x smaller LR for the backbone than for the new head (discriminative learning rates)."
    },
    {
      name: "LoRA rank r",
      type: "int",
      default: "8 – 64",
      impact: "Size of low-rank adapter matrices in parameter-efficient fine-tuning (PEFT).",
      tuningTip: "LoRA trains under 1% of weights; standard choice for fine-tuning LLMs on a single GPU."
    },
    {
      name: "New head",
      type: "architecture",
      default: "Linear(features, n_classes)",
      impact: "Replaces the original output layer to match the new label set.",
      tuningTip: "Always re-initialize the head; reuse the pretrained input preprocessing (normalization, tokenizer)."
    }
  ],
  math: {
    formula: "θ* = argmin_θ L_target(f(x; θ)),  θ₀ = θ_pretrained  |  LoRA: W' = W + B·A,  rank(B·A) = r",
    loss: "Task loss (Cross-Entropy, MSE) on the target dataset",
    explanation: "Instead of starting from random weights, optimization begins at θ_pretrained, which already encodes general features (edges and shapes for images, grammar and facts for text). Only a short, low-learning-rate trip is needed to reach a good solution for the new task. LoRA keeps W frozen and learns a small low-rank update B·A instead."
  },
  pros: [
    "Achieves high accuracy with very little labeled data",
    "Cuts training time and cost by orders of magnitude",
    "Pretrained features are robust and generalize well",
    "Parameter-efficient methods (LoRA, adapters) make LLM customization affordable"
  ],
  cons: [
    "Catastrophic forgetting if the learning rate is too high",
    "Inherits biases and licensing restrictions of the pretrained model",
    "Domain mismatch can limit (or even hurt) the benefit",
    "Large pretrained models can be heavy to deploy"
  ],
  prerequisites: ["cnn", "transformer-architecture"],
  related: ["llms", "embeddings", "dl-regularization", "dl-optimizers"],
  diagram: `flowchart TD
  P[("Huge dataset: ImageNet / web text")] --> PT["Pretrain large model"]
  PT --> BB["Pretrained backbone (general features)"]
  BB --> H["Replace output head for new labels"]
  D[("Small task dataset")] --> F1
  H --> F1["Phase 1: freeze backbone, train head"]
  F1 --> Q{"Enough data and accuracy gap?"}
  Q -->|"no"| DONE(["Deploy feature-extraction model"])
  Q -->|"yes"| F2["Phase 2: unfreeze top layers, tiny LR"]
  F2 --> L["Optional: LoRA adapters instead of full unfreeze"]
  L --> E["Evaluate on validation set"]
  E --> DONE2(["Deploy fine-tuned model"])`,
  codeSnippet: `import torch
import torch.nn as nn
from torchvision import models

# 1) Load an ImageNet-pretrained backbone
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)

# 2) Freeze all pretrained layers (feature extraction phase)
for param in model.parameters():
    param.requires_grad = False

# 3) Replace the 1000-class head with our own (e.g. 5 plant diseases)
model.fc = nn.Linear(model.fc.in_features, 5)   # new head is trainable

optimizer = torch.optim.AdamW(model.fc.parameters(), lr=1e-3)
# ... train a few epochs on the head only ...

# 4) Fine-tuning phase: unfreeze the last block with a much smaller LR
for param in model.layer4.parameters():
    param.requires_grad = True

optimizer = torch.optim.AdamW([
    {"params": model.layer4.parameters(), "lr": 1e-5},   # gentle on pretrained weights
    {"params": model.fc.parameters(),     "lr": 1e-4},
], weight_decay=0.01)

trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f"Trainable parameters: {trainable:,}")`
};
