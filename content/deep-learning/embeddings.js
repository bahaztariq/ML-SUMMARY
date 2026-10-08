export default {
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
  S --> U3["Clustering & deduplication"]`,
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
print(scores)  # high similarity for the login question, low for the weather one`
};
