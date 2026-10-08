export default {
  id: "linear-algebra",
  name: "Linear Algebra for ML",
  track: "fundamentals",
  category: "Math & Optimization",
  task: ["Definition", "Optimization"],
  difficulty: "Beginner",
  summary: "The mathematics of vectors, matrices and their transformations — the format in which every dataset, model weight and neural network computation is actually stored and executed.",
  intuition: "The Spreadsheet That Moves: A dataset is a spreadsheet (matrix) where each row is a point (vector) in space. Multiplying by a weight matrix is like stretching, rotating and squashing that whole cloud of points at once. Training a model means finding the transformation that moves the points to where the answers are.",
  whenToUse: "Understanding how models compute predictions (X·w), why feature scaling matters (dot products), how PCA finds directions of variance (eigenvectors / SVD), how embeddings measure similarity (cosine), and why GPUs speed up deep learning (batched matrix multiplication).",
  whenToAvoid: "N/A — but you do not need to hand-derive matrix calculus to use scikit-learn productively; learn it progressively as models get deeper.",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: false,
    numericInputsOnly: true
  },
  parameters: [
    {
      name: "Dot Product",
      type: "concept",
      default: "a · b = Σ aᵢbᵢ",
      impact: "Measures alignment between vectors; every neuron and linear model computes one.",
      tuningTip: "Normalize vectors (cosine similarity) when only direction, not magnitude, matters."
    },
    {
      name: "Matrix Multiplication",
      type: "concept",
      default: "(n×d)·(d×k) → (n×k)",
      impact: "Applies a linear transformation to all samples at once — the core op of neural networks.",
      tuningTip: "Inner dimensions must match; most shape bugs in PyTorch are here."
    },
    {
      name: "Eigenvectors / SVD",
      type: "concept",
      default: "X = U Σ Vᵀ",
      impact: "Decompose a matrix into principal directions and strengths; powers PCA and recommenders.",
      tuningTip: "Use numpy.linalg.svd on centered data instead of computing the covariance matrix explicitly."
    },
    {
      name: "Norms (L1 / L2)",
      type: "concept",
      default: "‖x‖₂ = √(Σ xᵢ²)",
      impact: "Measure vector length; used in distances (k-NN) and regularization penalties.",
      tuningTip: "L1 encourages sparsity, L2 encourages small, spread-out weights."
    }
  ],
  math: {
    formula: "ŷ = X · w + b      w* = (XᵀX)⁻¹ Xᵀ y      X = U Σ Vᵀ",
    loss: "Linear Maps, Normal Equation & SVD",
    explanation: "Predictions of a linear model are one matrix-vector product. The normal equation solves least squares in closed form using transposes and inverses. SVD factorizes any data matrix into rotations (U, V) and scaling (Σ), revealing the directions that carry the most variance."
  },
  pros: [
    "Turns loops over millions of samples into single vectorized operations (huge speedups)",
    "Gives geometric intuition for distances, projections and similarity",
    "Directly maps to GPU hardware, enabling modern deep learning"
  ],
  cons: [
    "Abstract notation can be intimidating at first",
    "Matrix inversion is numerically unstable for ill-conditioned or collinear features",
    "High-dimensional geometry is counter-intuitive (curse of dimensionality)"
  ],
  prerequisites: [],
  related: ["probability-statistics", "pca", "what-is-gradient-descent", "embeddings"],
  diagram: `flowchart LR
    A[("Raw table: n rows × d columns")] --> B["Matrix X (n × d)"]
    B --> C["Each row = vector in d-dim space"]
    B --> D["Multiply by weights W (d × k)"]
    D --> E["Transformed data X·W (n × k)"]
    E --> F["Predictions / next layer"]
    B --> G["Center data"]
    G --> H["SVD: U Σ Vᵀ"]
    H --> I["Top components → PCA projection"]
    C --> J["Dot product / norm"]
    J --> K["Similarity & distances (k-NN, embeddings)"]`,
  codeSnippet: `import numpy as np

# Dataset: 4 samples x 2 features (a matrix), target vector y
X = np.array([[1.0, 2.0],
              [2.0, 1.0],
              [3.0, 4.0],
              [4.0, 3.0]])
y = np.array([5.0, 4.0, 11.0, 10.0])

# 1. Dot product & cosine similarity between two samples
a, b = X[0], X[2]
cos_sim = a @ b / (np.linalg.norm(a) * np.linalg.norm(b))
print(f"dot={a @ b:.1f}  cosine={cos_sim:.3f}")

# 2. Linear model prediction for ALL rows in one matrix product
w = np.array([1.0, 2.0])
print("predictions:", X @ w)

# 3. Normal equation (closed-form least squares) — prefer lstsq for stability
Xb = np.c_[np.ones(len(X)), X]                # add bias column
w_star, *_ = np.linalg.lstsq(Xb, y, rcond=None)
print("fitted [b, w1, w2]:", np.round(w_star, 3))

# 4. SVD on centered data = PCA directions
Xc = X - X.mean(axis=0)
U, S, Vt = np.linalg.svd(Xc, full_matrices=False)
print("principal directions:\\n", np.round(Vt, 3))
print("explained variance ratio:", np.round(S**2 / (S**2).sum(), 3))`
};
