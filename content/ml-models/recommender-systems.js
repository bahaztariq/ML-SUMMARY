export default {
  id: "recommender-systems",
  name: "Recommender Systems",
  track: "ml-models",
  category: "Recommendation",
  task: ["Recommendation", "Ranking"],
  difficulty: "Advanced",
  summary: "Predicts which items a user is likely to want by learning from past interactions (collaborative filtering), item attributes (content-based), or both (hybrid).",
  intuition: "The Friendly Bookseller: A good bookseller remembers that people who loved the same books as you also loved a title you haven't read yet (collaborative filtering), and that you always pick sci-fi with strong female leads (content-based). Matrix factorization is that bookseller compressing every reader and every book into a few hidden 'taste' dimensions.",
  whenToUse: "E-commerce product suggestions, streaming content, news feeds, job matching, or any setting with a user-item interaction log (ratings, clicks, purchases) where personalization drives engagement.",
  whenToAvoid: "Brand-new products with no interaction history and no metadata (pure cold start), tiny catalogs where simple popularity rankings work, or high-stakes decisions where feedback loops and filter bubbles would cause harm.",
  requirements: {
    scalingRequired: false,
    handlesMissing: true,
    outlierSensitive: false,
    coldStartProblem: true
  },
  parameters: [
    {
      name: "n_factors (latent dimensions)",
      type: "int",
      default: "50–100",
      impact: "Size of the user and item embedding vectors.",
      tuningTip: "More factors capture finer tastes but overfit sparse data; tune 16–256 against ranking metrics."
    },
    {
      name: "regularization (λ)",
      type: "float",
      default: "0.02",
      impact: "L2 penalty on user/item factors.",
      tuningTip: "Increase for very sparse matrices to avoid memorizing a few ratings."
    },
    {
      name: "feedback type",
      type: "concept",
      default: "explicit",
      impact: "Explicit (star ratings) vs implicit (clicks, views) feedback changes the loss.",
      tuningTip: "Most real systems are implicit — use ALS with confidence weights or BPR ranking loss instead of plain MSE."
    },
    {
      name: "k (top-K recommendations)",
      type: "int",
      default: "10",
      impact: "Number of items returned and evaluated per user.",
      tuningTip: "Evaluate with Precision@K, Recall@K, NDCG@K or MAP@K on a time-based holdout, not RMSE alone."
    }
  ],
  math: {
    formula: "r̂_ui = μ + b_u + b_i + p_uᵀ·q_i,    min Σ_(u,i)∈K (r_ui − r̂_ui)² + λ(‖p_u‖² + ‖q_i‖² + b_u² + b_i²)",
    loss: "Regularized squared error (explicit) / BPR or weighted ALS (implicit)",
    explanation: "Matrix factorization approximates the sparse user-item rating matrix as the product of user factors p_u and item factors q_i, plus a global mean μ and user/item biases. The dot product measures how well a user's hidden tastes align with an item's hidden traits. Only observed ratings (set K) contribute to the loss; λ prevents overfitting."
  },
  pros: [
    "Discovers hidden taste dimensions without hand-crafted features",
    "Collaborative filtering exploits the wisdom of similar users",
    "Learned embeddings are reusable for search, similarity and clustering",
    "Hybrid systems combine behavior and content to soften cold start"
  ],
  cons: [
    "Cold start for new users and items with no interactions",
    "Popularity bias and filter bubbles from feedback loops",
    "Extremely sparse matrices make training and evaluation tricky",
    "Offline metrics often correlate poorly with online A/B test results"
  ],
  prerequisites: ["knn", "linear-algebra"],
  related: ["embeddings", "ab-testing-deployment", "feature-store", "pca"],
  diagram: `flowchart LR
    A[("Interaction log: user, item, rating/click")] --> B["Sparse user × item matrix"]
    B --> C["Factorize into user factors P and item factors Q"]
    C --> D["Minimize error on observed cells + L2 penalty"]
    D --> E["Score unseen items: p_u · q_i + biases"]
    F[("Item metadata")] --> G["Content-based similarity"]
    G --> H["Hybrid blend / re-ranking"]
    E --> H
    H --> I["Filter already-seen items"]
    I --> J(["Top-K recommendations"])
    J -.->|"new clicks"| A`,
  codeSnippet: `import pandas as pd
from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split
from surprise import accuracy
from collections import defaultdict

# ratings: columns ['user_id', 'item_id', 'rating'] on a 1-5 scale
reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(ratings[['user_id', 'item_id', 'rating']], reader)
trainset, testset = train_test_split(data, test_size=0.2, random_state=42)

# Matrix factorization (Funk SVD) with biases
algo = SVD(n_factors=64, reg_all=0.05, lr_all=0.005, n_epochs=30, random_state=42)
algo.fit(trainset)
predictions = algo.test(testset)
accuracy.rmse(predictions)

# Top-10 recommendations for one user among unseen items
user = 'u_42'
seen = set(ratings.loc[ratings.user_id == user, 'item_id'])
candidates = [i for i in ratings.item_id.unique() if i not in seen]
scored = [(i, algo.predict(user, i).est) for i in candidates]
top10 = sorted(scored, key=lambda t: t[1], reverse=True)[:10]
print(top10)`
};
