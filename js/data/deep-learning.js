/**
 * Deep Learning — additional concepts and relationship/diagram enrichments.
 */

export const newConcepts = [
  {
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
print(probs.sum(dim=1))  # each row sums to 1.0`,
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
  B -.->|"ReLU derivative = 1 when z ≥ 0"| G["Healthy gradient flow"]`
  },

  {
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
    print(f"epoch {epoch} lr={scheduler.get_last_lr()[0]:.5f} loss={loss.item():.4f}")`,
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
  J -->|"yes"| K(["Trained weights"])`
  },

  {
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

model.load_state_dict(best_state)              # restore best checkpoint`,
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
  K -->|"yes"| L(["Stop and restore best weights"])`
  },

  {
    id: "embeddings",
    name: "Embeddings (Word, Entity & Sentence Vectors)",
    track: "deep-learning",
    category: "Representation Learning",
    task: ["NLP", "Preprocessing", "Architecture"],
    difficulty: "Intermediate",
    summary: "Learned dense vectors that represent discrete items (words, tokens, users, products, sentences) so that similar items end up close together in a continuous space.",
    intuition: "The City Map of Meaning: Instead of giving every word its own isolated ID card (one-hot), you place every word at a GPS coordinate on a map. 'Paris' lives near 'London', 'cat' near 'dog', and walking from 'man' to 'king' is the same direction as walking from 'woman' to 'queen'.",
    whenToUse: "High-cardinality categorical features (user IDs, product IDs, zip codes) in neural nets, any NLP model input layer, semantic search and RAG retrieval, recommender systems, clustering or deduplicating text and images.",
    whenToAvoid: "Low-cardinality categories with a handful of values (one-hot is simpler and fully interpretable), or tree models on tabular data where target or ordinal encoding works fine.",
    requirements: {
      scalingRequired: false,
      handlesMissing: false,
      outlierSensitive: false,
      needsLargeCorpus: true
    },
    parameters: [
      {
        name: "embedding_dim",
        type: "int",
        default: "64 – 1536",
        impact: "Length of each vector; controls how much nuance can be stored.",
        tuningTip: "Rule of thumb for categorical features: min(600, round(1.6 · n_categories^0.56)). Sentence models typically use 384–1024."
      },
      {
        name: "num_embeddings (vocab size)",
        type: "int",
        default: "Number of unique tokens / IDs",
        impact: "Rows in the lookup table; memory grows linearly with it.",
        tuningTip: "Reserve an index for unknown / rare items (OOV bucket) and padding."
      },
      {
        name: "Pretrained vs trained from scratch",
        type: "concept",
        default: "Pretrained for text",
        impact: "Pretrained embeddings (word2vec, GloVe, sentence-transformers) bring knowledge from huge corpora.",
        tuningTip: "Use pretrained text embeddings; learn ID embeddings (users, products) end-to-end on your task."
      },
      {
        name: "Similarity metric",
        type: "str",
        default: "cosine",
        impact: "How closeness between two vectors is measured.",
        tuningTip: "Normalize vectors to unit length so cosine similarity equals a fast dot product."
      }
    ],
    math: {
      formula: "e = E[i] = one_hot(i) · E,  E ∈ ℝ^(V × d)  |  cos(a, b) = (a · b) / (‖a‖·‖b‖)",
      loss: "Learned via the downstream task loss, skip-gram / contrastive loss",
      explanation: "An embedding layer is a V × d weight matrix; looking up row i is mathematically the same as multiplying a one-hot vector by the matrix, but far cheaper. The vectors are trained by backpropagation so that items appearing in similar contexts (word2vec) or matching pairs (contrastive learning) get high cosine similarity."
    },
    pros: [
      "Compresses millions of categories into compact dense vectors",
      "Captures semantic similarity that one-hot encoding cannot express",
      "Reusable: the same embeddings power search, clustering, recommendations and classifiers",
      "Pretrained embeddings transfer knowledge to small datasets"
    ],
    cons: [
      "Individual dimensions are not human-interpretable",
      "Large vocabularies consume a lot of memory",
      "New / unseen items have no learned vector (cold-start problem)",
      "Can encode societal biases present in the training corpus"
    ],
    codeSnippet: `import torch
import torch.nn as nn
from sentence_transformers import SentenceTransformer, util

# 1) Learned ID embeddings inside a neural net (e.g. product recommender)
class ProductModel(nn.Module):
    def __init__(self, n_products=50_000, dim=32):
        super().__init__()
        self.product_emb = nn.Embedding(n_products, dim)   # 50k x 32 lookup table
        self.head = nn.Sequential(nn.Linear(dim, 64), nn.ReLU(), nn.Linear(64, 1))

    def forward(self, product_ids):
        return self.head(self.product_emb(product_ids))    # ids -> vectors -> score

model = ProductModel()
print(model(torch.tensor([3, 42, 999])).shape)            # torch.Size([3, 1])

# 2) Pretrained sentence embeddings for semantic similarity
encoder = SentenceTransformer("all-MiniLM-L6-v2")          # 384-dim vectors
sentences = ["How do I reset my password?",
             "I forgot my login credentials",
             "What is the weather in Paris?"]
vectors = encoder.encode(sentences, normalize_embeddings=True)

scores = util.cos_sim(vectors[0], vectors[1:])
print(scores)  # high similarity for the login question, low for the weather one`,
    prerequisites: ["encoding-categorical", "mlp-neural-network"],
    related: ["transformer-architecture", "rag", "recommender-systems", "llms"],
    diagram: `flowchart LR
  T["Raw text: the cat sat"] --> K["Tokenizer → ids 17, 942, 305"]
  K --> L["Embedding table E (V rows × d columns)"]
  L --> V["Row lookup → dense vectors"]
  V --> M["Neural network / Transformer layers"]
  M --> O["Task loss"]
  O -.->|"backprop updates rows of E"| L
  V --> S["Vector space: similar meaning = nearby points"]
  S --> U1["Semantic search / RAG"]
  S --> U2["Recommendations"]
  S --> U3["Clustering & deduplication"]`
  },

  {
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
print(f"Trainable parameters: {trainable:,}")`,
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
  E --> DONE2(["Deploy fine-tuned model"])`
  },

  {
    id: "autoencoders",
    name: "Autoencoders (AE & Variational AE)",
    track: "deep-learning",
    category: "Representation Learning",
    task: ["Clustering", "Preprocessing", "Architecture"],
    difficulty: "Advanced",
    summary: "Neural networks trained to compress their input into a small latent code and reconstruct it, learning useful representations without labels.",
    intuition: "The Telegraph Operator: You must send a detailed photo over a line that only allows 32 numbers. The encoder learns which 32 numbers capture the essence, and the decoder learns to redraw the photo from them. If a photo cannot be redrawn well, it probably looks like nothing seen before: an anomaly.",
    whenToUse: "Unsupervised anomaly detection (fraud, defective parts, sensor faults), non-linear dimensionality reduction, image denoising, pretraining features when labels are scarce, and as the latent space behind generative models (VAEs, Stable Diffusion's VAE).",
    whenToAvoid: "When a linear method like PCA already explains most variance, on small tabular datasets (Isolation Forest is simpler for anomalies), or when you need sharp high-quality generated samples (plain VAEs produce blurry outputs).",
    requirements: {
      scalingRequired: true,
      handlesMissing: false,
      outlierSensitive: true,
      labelsRequired: false
    },
    parameters: [
      {
        name: "latent_dim (bottleneck)",
        type: "int",
        default: "8 – 128",
        impact: "Size of the compressed code; controls how much information is forced through.",
        tuningTip: "Too large and the network learns the identity function; too small and reconstructions lose important detail."
      },
      {
        name: "Architecture",
        type: "architecture",
        default: "Mirrored encoder / decoder",
        impact: "Dense layers for tabular, Conv/ConvTranspose for images, LSTM for sequences.",
        tuningTip: "Keep the decoder symmetric to the encoder as a starting point."
      },
      {
        name: "Variant",
        type: "str",
        default: "'vanilla'",
        impact: "Denoising AE adds input noise; Sparse AE penalizes activations; VAE learns a probabilistic latent space.",
        tuningTip: "Use a VAE when you want to sample new data; denoising AE for robust features."
      },
      {
        name: "Anomaly threshold",
        type: "float",
        default: "95th–99th percentile of train error",
        impact: "Reconstruction error above this value flags an anomaly.",
        tuningTip: "Train only on normal data, then pick the threshold on a validation set with a few labeled anomalies."
      }
    ],
    math: {
      formula: "z = f_enc(x),  x̂ = f_dec(z),  L = ‖x − x̂‖²  |  VAE: L = E[‖x − x̂‖²] + KL( q(z|x) ‖ N(0, I) )",
      loss: "Reconstruction MSE (+ KL divergence for VAE)",
      explanation: "The bottleneck forces the network to keep only the most informative structure of the data. A linear autoencoder with MSE loss learns the same subspace as PCA; non-linear layers let it capture curved manifolds. A VAE encodes each input as a Gaussian (μ, σ) and the KL term keeps the latent space smooth so random samples decode into realistic data."
    },
    pros: [
      "Learns from unlabeled data",
      "Captures non-linear structure that PCA misses",
      "Reconstruction error is a natural anomaly score",
      "VAE latent spaces support generation and smooth interpolation"
    ],
    cons: [
      "Can memorize (learn identity) if the bottleneck is too wide",
      "Latent dimensions are hard to interpret",
      "Reconstruction-based anomaly detection can also reconstruct some anomalies well",
      "VAE samples are typically blurrier than GAN or diffusion outputs"
    ],
    codeSnippet: `import torch
import torch.nn as nn

class AutoEncoder(nn.Module):
    def __init__(self, n_features=30, latent_dim=8):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(n_features, 64), nn.ReLU(),
            nn.Linear(64, latent_dim),              # bottleneck
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 64), nn.ReLU(),
            nn.Linear(64, n_features),
        )

    def forward(self, x):
        return self.decoder(self.encoder(x))

model = AutoEncoder()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
loss_fn = nn.MSELoss()

# Train ONLY on normal transactions (scaled features)
for epoch in range(50):
    for X in normal_loader:
        optimizer.zero_grad()
        loss = loss_fn(model(X), X)                 # target = the input itself
        loss.backward()
        optimizer.step()

# Anomaly detection: high reconstruction error = suspicious
model.eval()
with torch.no_grad():
    train_err = ((model(X_train_normal) - X_train_normal) ** 2).mean(dim=1)
    threshold = torch.quantile(train_err, 0.99)
    test_err = ((model(X_test) - X_test) ** 2).mean(dim=1)
    is_anomaly = test_err > threshold
print(f"Flagged {is_anomaly.sum().item()} anomalies")`,
    prerequisites: ["mlp-neural-network", "pca"],
    related: ["generative-models", "isolation-forest", "what-is-dimensionality-reduction", "embeddings"],
    diagram: `flowchart LR
  X["Input x (e.g. 30 features)"] --> E1["Encoder layer 64"]
  E1 --> Z["Bottleneck z (8 dims)"]
  Z --> D1["Decoder layer 64"]
  D1 --> XH["Reconstruction x̂"]
  XH --> L["Loss = ‖x − x̂‖²"]
  L -.->|"backprop"| E1
  Z --> U1["Use z: compressed features / clustering"]
  XH --> R{"Error above threshold?"}
  R -->|"yes"| A1["Anomaly"]
  R -->|"no"| A2["Normal"]
  Z -.->|"VAE: sample z ~ N(μ, σ)"| G["Generate new samples"]`
  },

  {
    id: "generative-models",
    name: "Generative Models (GANs & Diffusion)",
    track: "deep-learning",
    category: "Generative AI",
    task: ["Computer Vision", "Architecture"],
    difficulty: "Advanced",
    summary: "Models that learn the probability distribution of the training data so they can create brand-new realistic samples, such as images, audio or synthetic tabular records.",
    intuition: "The Forger and the Restorer: A GAN is a forger (generator) and an art detective (discriminator) locked in a contest until the fakes are indistinguishable from real paintings. A diffusion model is a restorer who learned to remove a tiny bit of dust from a painting; starting from pure static and cleaning step by step, it reveals a brand-new picture.",
    whenToUse: "Image, video and audio generation (text-to-image), super-resolution and inpainting, data augmentation for rare classes, synthetic data for privacy, and style transfer.",
    whenToAvoid: "Ordinary prediction tasks (classification / regression), when you lack large GPU budgets and big datasets, or when generated content could create legal, consent or misinformation problems you cannot manage.",
    requirements: {
      scalingRequired: true,
      handlesMissing: false,
      outlierSensitive: false,
      gpuAcceleration: true
    },
    parameters: [
      {
        name: "Diffusion timesteps T",
        type: "int",
        default: "1000 (training), 20–50 (sampling)",
        impact: "Number of noise levels; more sampling steps give higher quality but slower generation.",
        tuningTip: "Use fast samplers (DDIM, DPM-Solver) to cut inference to 20–30 steps."
      },
      {
        name: "Guidance scale",
        type: "float",
        default: "7.5",
        impact: "Classifier-free guidance: how strongly the output follows the text prompt.",
        tuningTip: "5–9 is typical; very high values oversaturate images and reduce diversity."
      },
      {
        name: "GAN learning rates (G vs D)",
        type: "float",
        default: "2e-4, Adam β₁ = 0.5",
        impact: "Balance between generator and discriminator training speed.",
        tuningTip: "If D wins too easily, G gets no useful gradient: lower D's LR or add label smoothing / spectral norm."
      },
      {
        name: "Latent / noise dimension",
        type: "int",
        default: "100 (GAN z)",
        impact: "Size of the random input that seeds each new sample.",
        tuningTip: "Latent diffusion (Stable Diffusion) runs in a compressed autoencoder latent space for speed."
      }
    ],
    math: {
      formula: "GAN: min_G max_D E[log D(x)] + E[log(1 − D(G(z)))]  |  Diffusion: L = E‖ε − ε_θ(x_t, t)‖²",
      loss: "Adversarial minimax loss (GAN) / noise-prediction MSE (Diffusion)",
      explanation: "In a GAN, D maximizes its ability to tell real from fake while G minimizes it, pushing G's output distribution toward the real one. In diffusion, Gaussian noise ε is added to a real image x to produce x_t; the network ε_θ learns to predict that noise, so at generation time it can denoise pure random noise step by step into a new sample."
    },
    pros: [
      "Produces strikingly realistic images, audio and video",
      "Diffusion models train stably and cover diverse modes of the data",
      "GANs generate in a single fast forward pass",
      "Useful for data augmentation and privacy-preserving synthetic data"
    ],
    cons: [
      "GANs suffer from unstable training and mode collapse",
      "Diffusion sampling is slow (many denoising steps)",
      "Huge data and compute requirements; hard to evaluate (FID, human judgment)",
      "Serious risks: deepfakes, copyright and bias concerns"
    ],
    codeSnippet: `import torch
from diffusers import StableDiffusionPipeline

# Text-to-image with a pretrained latent diffusion model
pipe = StableDiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-1-base",
    torch_dtype=torch.float16,
).to("cuda")

image = pipe(
    prompt="watercolor illustration of a lighthouse at sunset",
    num_inference_steps=30,     # denoising steps
    guidance_scale=7.5,         # how strongly to follow the prompt
    generator=torch.Generator("cuda").manual_seed(42),
).images[0]
image.save("lighthouse.png")

# --- Core of one GAN training step (simplified) ---
# real: batch of real images, z: random noise
def gan_step(G, D, real, opt_G, opt_D, bce=torch.nn.BCEWithLogitsLoss()):
    z = torch.randn(real.size(0), 100, device=real.device)
    fake = G(z)
    ones, zeros = torch.ones(real.size(0), 1), torch.zeros(real.size(0), 1)
    # 1) Discriminator: real -> 1, fake -> 0
    opt_D.zero_grad()
    d_loss = bce(D(real), ones) + bce(D(fake.detach()), zeros)
    d_loss.backward(); opt_D.step()
    # 2) Generator: fool D into predicting 1 for fakes
    opt_G.zero_grad()
    g_loss = bce(D(fake), ones)
    g_loss.backward(); opt_G.step()
    return d_loss.item(), g_loss.item()`,
    prerequisites: ["autoencoders", "cnn"],
    related: ["llms", "transformer-architecture", "class-imbalance"],
    diagram: `flowchart TD
  subgraph gan["GAN"]
    Z["Random noise z"] --> G["Generator"]
    G --> FK["Fake sample"]
    RL[("Real samples")] --> D{"Discriminator: real or fake?"}
    FK --> D
    D -.->|"feedback: improve fakes"| G
  end
  subgraph diff["Diffusion"]
    X0["Real image x₀"] -->|"add noise over T steps"| XT["Pure noise x_T"]
    XT --> NN["Network predicts noise ε at step t"]
    NN -->|"subtract noise, repeat T → 0"| OUT["New generated image"]
    P["Text prompt embedding"] -.->|"guidance"| NN
  end`
  },

  {
    id: "llms",
    name: "Large Language Models (LLMs)",
    track: "deep-learning",
    category: "Generative AI",
    task: ["NLP", "Architecture"],
    difficulty: "Advanced",
    summary: "Very large decoder-only Transformers pretrained to predict the next token on trillions of words, then aligned to follow instructions, which makes them general-purpose text reasoning and generation engines.",
    intuition: "The Ultimate Autocomplete: Your phone keyboard suggests the next word from a few sentences of context. An LLM is that autocomplete scaled up to billions of parameters and most of the public internet, so 'predicting the next word' starts to require grammar, facts, reasoning and style all at once.",
    whenToUse: "Text generation, summarization, question answering, classification and extraction with few or zero labeled examples (prompting), code generation, chat assistants, and agents that call tools.",
    whenToAvoid: "Strict deterministic logic or exact arithmetic, high-volume low-latency tasks a small classifier solves cheaply, questions needing up-to-date or private facts without retrieval (use RAG), and high-stakes decisions without human review.",
    requirements: {
      scalingRequired: false,
      handlesMissing: true,
      outlierSensitive: false,
      gpuAcceleration: true,
      contextWindowLimited: true
    },
    parameters: [
      {
        name: "temperature",
        type: "float",
        default: "0.7 – 1.0",
        impact: "Scales logits before sampling; low = focused and repeatable, high = creative and random.",
        tuningTip: "Use 0–0.2 for extraction, classification and code; 0.7–1.0 for brainstorming and creative writing."
      },
      {
        name: "top_p (nucleus sampling)",
        type: "float",
        default: "0.9 – 1.0",
        impact: "Samples only from the smallest set of tokens whose probabilities add up to p.",
        tuningTip: "Tune either temperature or top_p, not both aggressively at the same time."
      },
      {
        name: "max_tokens / context window",
        type: "int",
        default: "Model dependent (8k – 1M tokens)",
        impact: "Limits how much text the model can read (prompt) and write (completion).",
        tuningTip: "Cost and latency grow with tokens; trim prompts and retrieve only relevant chunks."
      },
      {
        name: "Adaptation strategy",
        type: "concept",
        default: "Prompting",
        impact: "Prompt engineering → few-shot examples → RAG → fine-tuning (LoRA) → full pretraining.",
        tuningTip: "Climb this ladder only as needed: most problems are solved with good prompts plus RAG."
      }
    ],
    math: {
      formula: "P(x₁ … x_T) = Πₜ P(xₜ | x₁ … xₜ₋₁)  |  L = −Σₜ log P_θ(xₜ | x₁ … xₜ₋₁)",
      loss: "Next-token Cross-Entropy (then instruction tuning + RLHF / preference optimization)",
      explanation: "The model factorizes text into a chain of next-token predictions; a causal attention mask ensures each position only sees earlier tokens. Pretraining minimizes cross-entropy over trillions of tokens. Instruction tuning and preference optimization (RLHF / DPO) then shape the raw predictor into a helpful, harmless assistant. At inference, tokens are sampled one at a time and appended to the context."
    },
    pros: [
      "One model handles many tasks with zero or few labeled examples",
      "Strong language understanding, generation and coding abilities",
      "Easily customized via prompting, RAG or parameter-efficient fine-tuning",
      "Available through APIs without any training infrastructure"
    ],
    cons: [
      "Hallucinations: confident but false statements",
      "Expensive inference and high latency for large models",
      "Knowledge frozen at the training cutoff; limited context window",
      "Privacy, prompt-injection and bias risks need guardrails and evaluation"
    ],
    codeSnippet: `from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

model_id = "Qwen/Qwen2.5-0.5B-Instruct"       # small open model for local testing
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.float16, device_map="auto")

messages = [
    {"role": "system", "content": "You are a concise data science tutor."},
    {"role": "user", "content": "Explain overfitting in two sentences."},
]

# Chat template converts messages into the exact token format the model was tuned on
inputs = tokenizer.apply_chat_template(
    messages, add_generation_prompt=True, return_tensors="pt"
).to(model.device)

# Autoregressive generation: predict a token, append it, repeat
output_ids = model.generate(
    inputs,
    max_new_tokens=120,
    do_sample=True,
    temperature=0.3,      # low temperature = focused answer
    top_p=0.9,
)
answer = tokenizer.decode(output_ids[0][inputs.shape[1]:], skip_special_tokens=True)
print(answer)`,
    prerequisites: ["transformer-architecture", "embeddings"],
    related: ["rag", "transfer-learning", "generative-models"],
    diagram: `flowchart TD
  W[("Trillions of web / code tokens")] --> PT["Pretraining: next-token prediction"]
  PT --> BASE["Base model (autocomplete)"]
  BASE --> SFT["Instruction tuning on prompt-answer pairs"]
  SFT --> RL["Preference alignment (RLHF / DPO)"]
  RL --> CHAT["Assistant model"]
  U["User prompt"] --> TOK["Tokenize → embeddings"]
  TOK --> CHAT
  CHAT --> DEC["Transformer decoder → next-token probabilities"]
  DEC --> SAMP["Sample with temperature / top_p"]
  SAMP -->|"append token, repeat"| DEC
  SAMP --> ANS(["Generated answer"])`
  },

  {
    id: "rag",
    name: "Retrieval-Augmented Generation (RAG) & Vector Databases",
    track: "deep-learning",
    category: "Generative AI",
    task: ["NLP", "Storage", "Architecture", "Deployment"],
    difficulty: "Advanced",
    summary: "An architecture that retrieves relevant passages from your own documents with embedding search and inserts them into the LLM prompt so answers are grounded, current and citable.",
    intuition: "The Open-Book Exam: A plain LLM answers from memory and sometimes bluffs. RAG lets it run to the library first: a librarian (the retriever) finds the three most relevant pages, and the student (the LLM) writes the answer while quoting those pages.",
    whenToUse: "Chatbots over company documentation, policies or knowledge bases; questions about private or frequently changing data; any setting where answers must cite sources and hallucinations are costly.",
    whenToAvoid: "When the task needs a new skill or style rather than new facts (fine-tune instead), when the whole corpus fits comfortably in the context window, or for structured analytics that a SQL query answers exactly.",
    requirements: {
      scalingRequired: false,
      handlesMissing: true,
      outlierSensitive: false,
      vectorDatabase: true,
      embeddingModel: true
    },
    parameters: [
      {
        name: "chunk_size / chunk_overlap",
        type: "int",
        default: "500 – 1000 tokens, 10–20% overlap",
        impact: "How documents are split before embedding; drives retrieval precision.",
        tuningTip: "Split on headings/paragraphs, not mid-sentence. Smaller chunks = precise but less context."
      },
      {
        name: "top_k",
        type: "int",
        default: "3 – 10",
        impact: "Number of retrieved chunks inserted into the prompt.",
        tuningTip: "Retrieve ~20 candidates, then rerank with a cross-encoder and keep the best 3–5."
      },
      {
        name: "Embedding model",
        type: "str",
        default: "all-MiniLM-L6-v2 / bge / text-embedding models",
        impact: "Determines how well semantic similarity matches real relevance.",
        tuningTip: "Use the same model for indexing and querying; benchmark on your own question set."
      },
      {
        name: "Index type",
        type: "str",
        default: "HNSW (approximate NN)",
        impact: "Trades search speed vs recall in the vector database (FAISS, Chroma, pgvector, Qdrant).",
        tuningTip: "Combine vector search with BM25 keyword search (hybrid) for names, codes and IDs."
      }
    ],
    math: {
      formula: "score(q, dᵢ) = cos(E(q), E(dᵢ))  |  answer = LLM( prompt ⊕ top_k(dᵢ by score) )",
      loss: "Evaluated with retrieval recall@k, faithfulness and answer relevance",
      explanation: "Documents and the query are embedded into the same vector space by encoder E. An approximate nearest-neighbor index (HNSW, IVF) quickly finds the chunks with the highest cosine similarity. These chunks are concatenated into the prompt as context, so the LLM conditions its next-token predictions on retrieved evidence rather than only on its parameters."
    },
    pros: [
      "Grounds answers in your own up-to-date data and enables citations",
      "Updating knowledge only requires re-indexing documents, not retraining",
      "Significantly reduces hallucinations on factual questions",
      "Access control can be enforced at retrieval time"
    ],
    cons: [
      "Quality depends heavily on chunking, embeddings and retrieval tuning",
      "If retrieval misses the right passage, the LLM still answers poorly",
      "Adds latency and infrastructure (vector DB, ingestion pipelines)",
      "Vulnerable to prompt injection hidden inside retrieved documents"
    ],
    codeSnippet: `import chromadb
from sentence_transformers import SentenceTransformer

encoder = SentenceTransformer("all-MiniLM-L6-v2")
client = chromadb.Client()
collection = client.create_collection("handbook", metadata={"hnsw:space": "cosine"})

# 1) INGEST: chunk documents, embed, store in the vector DB
chunks = [
    "Employees get 25 days of paid vacation per year.",
    "Remote work is allowed up to 3 days per week.",
    "Expense reports must be submitted within 30 days.",
]
collection.add(
    ids=[f"chunk-{i}" for i in range(len(chunks))],
    documents=chunks,
    embeddings=encoder.encode(chunks, normalize_embeddings=True).tolist(),
)

# 2) RETRIEVE: embed the question and find the nearest chunks
question = "How many vacation days do I have?"
results = collection.query(
    query_embeddings=encoder.encode([question], normalize_embeddings=True).tolist(),
    n_results=2,
)
context = "\\n".join(results["documents"][0])

# 3) GENERATE: ground the LLM in the retrieved context
prompt = f"""Answer using ONLY the context below. If the answer is not there, say so.
Context:
{context}

Question: {question}"""
answer = llm.generate(prompt)   # any LLM client (OpenAI, Anthropic, local model)
print(answer)`,
    prerequisites: ["llms", "embeddings"],
    related: ["transformer-architecture", "knn", "model-serving", "transfer-learning"],
    diagram: `flowchart LR
  subgraph ingest["Offline indexing"]
    DOC[("Documents: PDFs, wiki, tickets")] --> CH["Split into chunks"]
    CH --> EM1["Embedding model"]
    EM1 --> VDB[("Vector DB / HNSW index")]
  end
  Q(["User question"]) --> EM2["Embed question"]
  EM2 --> S["Nearest-neighbor search top_k"]
  VDB --> S
  S --> RR["Rerank and filter"]
  RR --> P["Prompt = instructions + context + question"]
  P --> LLM["LLM"]
  LLM --> A(["Grounded answer with citations"])`
  }
];

// Adds graph links + diagrams to EXISTING concepts (keyed by existing id).
export const enrichments = {
  "mlp-neural-network": {
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
  OPT -.->|"next mini-batch"| H1`
  },
  "cnn": {
    prerequisites: ["mlp-neural-network", "activation-functions"],
    related: ["transfer-learning", "dl-regularization", "transformer-architecture", "autoencoders"],
    diagram: `flowchart LR
  I["Image 32×32×3"] --> C1["Conv 3×3, 32 filters"]
  C1 --> R1["ReLU → edge maps"]
  R1 --> P1["MaxPool 2×2 → 16×16"]
  P1 --> C2["Conv 3×3, 64 filters"]
  C2 --> R2["ReLU → textures and parts"]
  R2 --> P2["MaxPool 2×2 → 8×8"]
  P2 --> F["Flatten feature maps"]
  F --> D["Dense layer + Dropout"]
  D --> S["Softmax over classes"]
  S --> Y(["Prediction: cat 0.92"])`
  },
  "rnn-lstm": {
    prerequisites: ["mlp-neural-network", "activation-functions"],
    related: ["transformer-architecture", "time-series-forecasting", "embeddings"],
    diagram: `flowchart LR
  X1["x₁"] --> C1["Cell t=1"]
  C1 -->|"hidden state h₁"| C2["Cell t=2"]
  X2["x₂"] --> C2
  C2 -->|"hidden state h₂"| C3["Cell t=3"]
  X3["x₃"] --> C3
  C3 --> Y(["Output ŷ"])
  subgraph lstm["Inside an LSTM cell"]
    FG["Forget gate: what to erase"] --> CS["Cell state c (long-term memory)"]
    IG["Input gate: what to write"] --> CS
    CS --> OG["Output gate: what to reveal as h"]
  end
  C2 -.-> FG
  GRU["GRU: lighter variant, update + reset gates, no separate cell state"] -.->|"alternative"| C2`
  },
  "transformer-architecture": {
    prerequisites: ["embeddings", "rnn-lstm"],
    related: ["llms", "transfer-learning", "rag", "activation-functions"],
    diagram: `flowchart TD
  T["Input tokens"] --> E["Token embeddings + positional encoding"]
  E --> QKV["Project to Queries Q, Keys K, Values V"]
  QKV --> S["Scores = Q·Kᵀ / √d_k"]
  S --> SM["Softmax → attention weights"]
  SM --> MIX["Weighted sum of V (multi-head)"]
  MIX --> AN1["Add & LayerNorm (residual)"]
  AN1 --> FF["Feed-forward MLP with GELU"]
  FF --> AN2["Add & LayerNorm"]
  AN2 -->|"repeat N blocks"| QKV
  AN2 --> OUT(["Contextual token representations → task head"])`
  }
};
