export default {
  id: "rnn-lstm",
  name: "RNN & LSTM (Recurrent Neural Networks)",
  track: "deep-learning",
  category: "Neural Architectures",
  task: ["NLP", "Time Series", "Sequence Modeling"],
  difficulty: "Advanced",
  summary: "Neural networks designed to process sequential data by maintaining a hidden state (memory) that carries information from previous time steps. LSTM adds gating mechanisms to selectively remember or forget information over long sequences.",
  intuition: "Reading a Book with Memory: A regular neural network reads each word in isolation. An RNN reads word-by-word while maintaining a running summary in its head (hidden state). LSTM adds a notebook (cell state) where it can write down important facts and erase irrelevant ones using gates.",
  whenToUse: "Sequential data: time series forecasting, speech recognition, language modeling (before Transformers), music generation, and stock price prediction.",
  whenToAvoid: "Tasks where Transformers are available and practical (NLP, long sequences). CNNs for spatial data. Tabular data without temporal ordering.",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: true,
    linearRelationship: false
  },
  parameters: [
    {
      name: "hidden_size",
      type: "int",
      default: "128-512",
      impact: "Dimensionality of the hidden state vector.",
      tuningTip: "Larger hidden sizes capture more complex temporal patterns but increase computation and overfitting risk."
    },
    {
      name: "num_layers",
      type: "int",
      default: "1-3",
      impact: "Number of stacked recurrent layers.",
      tuningTip: "2 layers is common. Beyond 3 layers, gradient flow becomes problematic even for LSTMs."
    },
    {
      name: "bidirectional",
      type: "bool",
      default: "False",
      impact: "Process sequence in both forward and backward directions.",
      tuningTip: "Use bidirectional=True for tasks where future context helps (text classification). Not for time series forecasting."
    },
    {
      name: "LSTM Gates",
      type: "architecture",
      default: "Forget, Input, Output",
      impact: "Three gates control information flow: what to forget, what to remember, and what to output.",
      tuningTip: "LSTM solves the vanishing gradient problem that plagues vanilla RNNs on long sequences."
    }
  ],
  math: {
    formula: "RNN: hₜ = σ(W_hh · hₜ₋₁ + W_xh · xₜ + b)  |  LSTM: fₜ = σ(Wf · [hₜ₋₁, xₜ] + bf)",
    loss: "Backpropagation Through Time (BPTT)",
    explanation: "RNNs unfold through time: each time step's hidden state depends on the previous hidden state and current input. LSTM replaces the simple hidden state update with gated operations: Forget gate (what to erase), Input gate (what to write), Output gate (what to reveal)."
  },
  pros: [
    "Designed specifically for sequential/temporal data with variable-length inputs",
    "LSTM effectively captures long-range dependencies (hundreds of time steps)",
    "Natural fit for streaming data (processes one token at a time)"
  ],
  cons: [
    "Inherently sequential processing: cannot parallelize across time steps (slow training)",
    "Largely superseded by Transformers for NLP tasks since 2018",
    "Vanishing gradients in vanilla RNNs (use LSTM/GRU to mitigate)"
  ],
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
  GRU["GRU: lighter variant, update + reset gates, no separate cell state"] -.->|"alternative"| C2`,
  codeSnippet: `import torch
import torch.nn as nn

class LSTMPredictor(nn.Module):
    def __init__(self, input_dim=1, hidden_dim=64, output_dim=1, num_layers=2):
        super().__init__()
        self.lstm = nn.LSTM(
            input_dim, hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.2
        )
        self.fc = nn.Linear(hidden_dim, output_dim)
    
    def forward(self, x):
        # x shape: [batch, sequence_length, features]
        lstm_out, (h_n, c_n) = self.lstm(x)
        # Use last hidden state for prediction
        last_hidden = lstm_out[:, -1, :]
        return self.fc(last_hidden)

# For time series: input = [batch, 30 days, 1 feature]
model = LSTMPredictor(input_dim=1, hidden_dim=64, output_dim=1)
print(f"LSTM Parameters: {sum(p.numel() for p in model.parameters()):,}")`
};
