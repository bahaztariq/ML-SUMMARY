export default {
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
  Z -.->|"VAE: sample z ~ N(μ, σ)"| G["Generate new samples"]`,
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
print(f"Flagged {is_anomaly.sum().item()} anomalies")`
};
