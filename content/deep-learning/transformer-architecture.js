export default {
  id: "transformer-architecture",
  name: "Transformer & Self-Attention",
  track: "deep-learning",
  category: "Neural Architectures",
  task: ["NLP", "Computer Vision", "LLMs", "Generative AI"],
  difficulty: "Advanced",
  summary: "A neural network architecture that dispenses with recurrence, relying entirely on self-attention mechanisms to process all sequence tokens simultaneously in parallel.",
  intuition: "Dynamic Contextual Highlighting: In the sentence 'The animal didn't cross the street because it was too tired', the word 'it' shines an attention flashlight onto 'animal'. If the ending was 'too wide', it shines onto 'street'.",
  whenToUse: "Modern Large Language Models (GPT, BERT, LLaMA), sequence transduction, document translation, audio transcription (Whisper), and Vision Transformers (ViT).",
  whenToAvoid: "Small tabular datasets with <50,000 samples (where XGBoost beats Transformers with 100x less compute).",
  requirements: {
    gpuAcceleration: true,
    massivePretrainingData: true,
    positionalEncoding: true
  },
  parameters: [
    {
      name: "d_model",
      type: "int",
      default: "512 - 4096",
      impact: "Dimensionality of token vector embeddings.",
      tuningTip: "Larger dimensions enable richer conceptual representations."
    },
    {
      name: "n_heads",
      type: "int",
      default: "8 - 64",
      impact: "Number of parallel attention heads.",
      tuningTip: "Allows model to simultaneously focus on syntax, tense, entity reference, and semantics."
    }
  ],
  math: {
    formula: "Attention(Q, K, V) = softmax( (Q · Kᵀ) / √d_k ) · V",
    loss: "Scaled Dot-Product Attention",
    explanation: "Queries (Q) dot Keys (K) compute pairwise relevance scores across every word combination. Dividing by $\\sqrt{d_k}$ prevents vanishing softmax gradients. Multiplying by Values (V) produces context-enriched embeddings."
  },
  pros: [
    "Full parallelism during training (eliminates the sequential bottleneck of RNNs/LSTMs)",
    "Captures long-range dependencies across thousands of tokens without vanishing gradients",
    "Foundation of modern Generative AI breakthroughs"
  ],
  cons: [
    "Quadratic compute and memory complexity $O(N^2)$ with respect to sequence length $N$",
    "Requires massive computational hardware (GPU clusters) for training from scratch"
  ],
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
  AN2 --> OUT(["Contextual token representations → task head"])`,
  codeSnippet: `import torch
import torch.nn as nn

class SelfAttentionBlock(nn.Module):
    def __init__(self, embed_dim=256, num_heads=8):
        super().__init__()
        self.attn = nn.MultiheadAttention(embed_dim, num_heads, batch_first=True)
        self.norm = nn.LayerNorm(embed_dim)
        
    def forward(self, x):
        # x shape: [batch_size, seq_len, embed_dim]
        attn_out, _ = self.attn(x, x, x)
        return self.norm(x + attn_out) # Residual connection + LayerNorm`
};
