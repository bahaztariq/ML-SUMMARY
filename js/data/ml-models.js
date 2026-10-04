/**
 * ML Models — additional concepts and relationship/diagram enrichments.
 */

export const newConcepts = [
  {
    id: "gradient-boosting",
    name: "Gradient Boosting (GBM & AdaBoost)",
    track: "ml-models",
    category: "Ensemble / Boosting",
    task: ["Classification", "Regression"],
    difficulty: "Intermediate",
    summary: "Builds a strong model by sequentially adding weak learners (usually shallow trees), each one correcting the errors of the ensemble built so far.",
    intuition: "The Golf Putt: Your first swing gets the ball roughly towards the hole. Every following putt is aimed only at the remaining distance, getting a little closer each time. AdaBoost does this by re-weighting the balls you missed; GBM does it by aiming directly at the leftover error (the residual).",
    whenToUse: "Medium-sized tabular datasets where you want higher accuracy than a Random Forest and can afford some tuning. Also the conceptual foundation for understanding XGBoost, LightGBM and CatBoost.",
    whenToAvoid: "Very large datasets (classic sklearn GBM is single-threaded and slow — prefer HistGradientBoosting, LightGBM or XGBoost), heavily noisy labels (AdaBoost chases mislabeled points), or when you need fully parallel training.",
    requirements: {
      scalingRequired: false,
      handlesMissing: false,
      outlierSensitive: true,
      linearRelationship: false
    },
    parameters: [
      {
        name: "n_estimators",
        type: "int",
        default: "100",
        impact: "Number of sequential boosting stages (trees).",
        tuningTip: "Unlike Random Forest, too many stages DOES overfit. Pair a large value with early stopping (n_iter_no_change) on a validation split."
      },
      {
        name: "learning_rate",
        type: "float",
        default: "0.1",
        impact: "Shrinks each tree's contribution before it is added to the ensemble.",
        tuningTip: "Lower values (0.01–0.05) generalize better but need proportionally more trees. Tune together with n_estimators."
      },
      {
        name: "max_depth",
        type: "int",
        default: "3",
        impact: "Depth of each weak learner; controls the order of feature interactions captured.",
        tuningTip: "Keep shallow (2–6). Depth 1 (stumps) is classic AdaBoost and captures no interactions."
      },
      {
        name: "subsample",
        type: "float",
        default: "1.0",
        impact: "Fraction of rows used to fit each tree (Stochastic Gradient Boosting).",
        tuningTip: "0.6–0.9 adds randomness that reduces variance and speeds up training."
      }
    ],
    math: {
      formula: "F_m(x) = F_{m-1}(x) + η · h_m(x),  where h_m ≈ argmin_h Σ (r_im − h(x_i))²,  r_im = −∂L(y_i, F(x_i)) / ∂F",
      loss: "Any differentiable loss (MSE, Log-Loss, Huber); AdaBoost ≈ Exponential Loss",
      explanation: "Each stage fits a new tree h_m to the pseudo-residuals r_im — the negative gradient of the loss with respect to the current prediction. This is gradient descent performed in function space rather than parameter space. The learning rate η shrinks each step so no single tree dominates."
    },
    pros: [
      "Typically more accurate than Random Forest on structured/tabular data",
      "Flexible: works with any differentiable loss function",
      "Shallow trees keep each stage simple and interpretable via feature importance",
      "Strong theoretical grounding as functional gradient descent"
    ],
    cons: [
      "Sequential training cannot be parallelized across trees",
      "More hyperparameter-sensitive and easier to overfit than bagging",
      "AdaBoost is very sensitive to label noise and outliers",
      "Classic sklearn implementation is slow on large datasets"
    ],
    codeSnippet: `from sklearn.ensemble import GradientBoostingClassifier, AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Gradient Boosting: each tree fits the negative gradient of the loss
gbm = GradientBoostingClassifier(
    n_estimators=1000,
    learning_rate=0.05,
    max_depth=3,
    subsample=0.8,
    validation_fraction=0.1,
    n_iter_no_change=20,    # early stopping
    random_state=42
)
gbm.fit(X_train, y_train)
print("GBM stages used:", gbm.n_estimators_)
print("GBM AUC:", roc_auc_score(y_test, gbm.predict_proba(X_test)[:, 1]))

# AdaBoost: re-weights misclassified samples, uses decision stumps
ada = AdaBoostClassifier(
    estimator=DecisionTreeClassifier(max_depth=1),
    n_estimators=300,
    learning_rate=0.5,
    random_state=42
)
ada.fit(X_train, y_train)
print("AdaBoost AUC:", roc_auc_score(y_test, ada.predict_proba(X_test)[:, 1]))`,
    prerequisites: ["decision-tree", "ensemble-methods", "what-is-gradient-descent"],
    related: ["xgboost", "lightgbm", "catboost", "random-forest"],
    diagram: `flowchart TD
    A[("Training data X, y")] --> B["F0 = constant baseline (mean / log-odds)"]
    B --> C["Compute residuals r = −gradient of loss"]
    C --> D["Fit shallow tree h_m to residuals"]
    D --> E["Update F_m = F_m-1 + η · h_m"]
    E --> F{"Validation loss still improving?"}
    F -->|"yes"| C
    F -->|"no"| G(["Final model = sum of all trees"])
    G --> H["Prediction for new x"]`
  },

  {
    id: "catboost",
    name: "CatBoost",
    track: "ml-models",
    category: "Ensemble / Boosting",
    task: ["Classification", "Regression", "Ranking"],
    difficulty: "Advanced",
    summary: "A gradient boosting library from Yandex that natively handles categorical features with ordered target statistics and uses symmetric trees for fast, robust predictions.",
    intuition: "The Honest Exam Grader: When encoding a category (like 'city') by its average target, a naive grader peeks at the student's own answer and leaks it. CatBoost lines the students up in a random order and grades each one using only the students who came before — so no row ever sees its own label.",
    whenToUse: "Tabular data with many high-cardinality categorical columns (user IDs, cities, product codes). Great out-of-the-box performance with default hyperparameters and minimal preprocessing.",
    whenToAvoid: "Purely numeric datasets where LightGBM is usually faster to train, extremely large datasets on CPU-only machines with tight time budgets, or when model size must be tiny.",
    requirements: {
      scalingRequired: false,
      handlesMissing: true,
      outlierSensitive: false,
      handlesCategorical: true
    },
    parameters: [
      {
        name: "iterations",
        type: "int",
        default: "1000",
        impact: "Maximum number of boosting rounds (trees).",
        tuningTip: "Set high and rely on early_stopping_rounds with an eval_set."
      },
      {
        name: "learning_rate",
        type: "float",
        default: "auto (≈0.03)",
        impact: "Step size for each tree's contribution.",
        tuningTip: "CatBoost picks a sensible value automatically based on data size; lower it if validation loss is noisy."
      },
      {
        name: "depth",
        type: "int",
        default: "6",
        impact: "Depth of the symmetric (oblivious) trees.",
        tuningTip: "4–10. Symmetric trees grow 2^depth leaves, so each extra level doubles complexity."
      },
      {
        name: "cat_features",
        type: "list",
        default: "None",
        impact: "Columns to treat as categorical using ordered target statistics.",
        tuningTip: "Pass raw string columns directly — do NOT one-hot or label-encode them first."
      },
      {
        name: "l2_leaf_reg",
        type: "float",
        default: "3",
        impact: "L2 regularization on leaf values.",
        tuningTip: "Increase (5–10) on small or noisy datasets to reduce overfitting."
      }
    ],
    math: {
      formula: "TS(x_k) = ( Σ_{j<k, x_j = x_k} y_j + a · p ) / ( Σ_{j<k, x_j = x_k} 1 + a )",
      loss: "Log-Loss / RMSE / custom, optimized with Ordered Boosting",
      explanation: "Each categorical value is replaced by a smoothed average of the target computed only over rows that precede it in a random permutation (j < k), with a prior p weighted by a. This prevents target leakage. Ordered Boosting applies the same trick to residuals, reducing prediction shift bias common in other GBMs."
    },
    pros: [
      "Native categorical support without manual encoding or target leakage",
      "Excellent accuracy with default hyperparameters",
      "Symmetric trees make inference extremely fast and less prone to overfitting",
      "Built-in GPU training, SHAP values and missing value handling"
    ],
    cons: [
      "Slower to train than LightGBM on purely numeric data",
      "Larger memory footprint during training with many categorical combinations",
      "Fewer community examples than XGBoost",
      "Symmetric trees can be less expressive on some datasets"
    ],
    codeSnippet: `from catboost import CatBoostClassifier, Pool
from sklearn.model_selection import train_test_split

# df contains raw string columns like 'city', 'device', 'plan'
cat_cols = ['city', 'device', 'plan']
X = df.drop(columns=['churn'])
y = df['churn']

X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

train_pool = Pool(X_train, y_train, cat_features=cat_cols)
val_pool = Pool(X_val, y_val, cat_features=cat_cols)

model = CatBoostClassifier(
    iterations=2000,
    depth=6,
    l2_leaf_reg=3,
    eval_metric='AUC',
    early_stopping_rounds=100,
    random_seed=42,
    verbose=200
)
model.fit(train_pool, eval_set=val_pool, use_best_model=True)

# Feature importance (handles categorical columns natively)
importances = model.get_feature_importance(prettified=True)
print(importances.head(10))`,
    prerequisites: ["gradient-boosting", "encoding-categorical"],
    related: ["xgboost", "lightgbm", "class-imbalance"],
    diagram: `flowchart TD
    A[("Raw tabular data with string categories")] --> B["Random permutation of rows"]
    B --> C["Ordered target statistics: encode each row using only previous rows"]
    C --> D["Numeric + encoded categorical features"]
    D --> E["Build symmetric tree: same split at every level"]
    E --> F["Ordered boosting: residuals computed without the row's own label"]
    F --> G{"Early stopping on eval set?"}
    G -->|"continue"| E
    G -->|"stop"| H(["Final ensemble of oblivious trees"])
    H --> I["Fast inference via bit-indexed leaf lookup"]`
  },

  {
    id: "hierarchical-clustering",
    name: "Hierarchical Clustering (Agglomerative)",
    track: "ml-models",
    category: "Clustering",
    task: ["Clustering"],
    difficulty: "Intermediate",
    summary: "Builds a tree (dendrogram) of nested clusters by repeatedly merging the two closest groups, letting you choose the number of clusters after the fact.",
    intuition: "The Family Tree: Start with every person as their own family. Merge the two most similar people into a household, then the closest households into extended families, and so on until everyone is one clan. Cutting the tree at a chosen height gives you the grouping level you want.",
    whenToUse: "Small-to-medium datasets (under ~10k points) when you don't know the number of clusters in advance, want to visualize nested structure (taxonomies, gene expression, customer segments), or need a deterministic result.",
    whenToAvoid: "Large datasets — memory is O(n²) and time is O(n² log n) or worse. Also when clusters are density-shaped with noise (DBSCAN is better) or you need to assign new points to clusters cheaply.",
    requirements: {
      scalingRequired: true,
      handlesMissing: false,
      outlierSensitive: true,
      needsK: false
    },
    parameters: [
      {
        name: "linkage",
        type: "str",
        default: "'ward'",
        impact: "How the distance between two clusters is measured (ward, complete, average, single).",
        tuningTip: "'ward' gives compact, balanced clusters (Euclidean only). 'single' finds elongated chains but suffers from chaining; 'average' is a robust middle ground."
      },
      {
        name: "n_clusters",
        type: "int or None",
        default: "2",
        impact: "Number of clusters at which to cut the dendrogram.",
        tuningTip: "Set to None and use distance_threshold, or inspect the dendrogram for the largest vertical gap."
      },
      {
        name: "distance_threshold",
        type: "float or None",
        default: "None",
        impact: "Cut height: clusters further apart than this are not merged.",
        tuningTip: "Use instead of n_clusters when a natural distance scale exists in your domain."
      },
      {
        name: "metric",
        type: "str",
        default: "'euclidean'",
        impact: "Distance metric between individual points.",
        tuningTip: "Use 'cosine' for text embeddings (with average/complete linkage)."
      }
    ],
    math: {
      formula: "Ward: Δ(A, B) = (|A|·|B| / (|A| + |B|)) · ‖μ_A − μ_B‖²",
      loss: "Greedy merge criterion (increase in within-cluster variance for Ward)",
      explanation: "At each step the algorithm merges the pair of clusters with the smallest linkage distance. Ward's criterion picks the merge that increases total within-cluster sum of squares the least, mirroring the K-Means objective. The merge heights form the dendrogram's y-axis."
    },
    pros: [
      "No need to choose k up front — the dendrogram shows all granularities",
      "Deterministic: same data always yields the same tree",
      "Dendrogram is a highly interpretable visualization",
      "Works with any distance metric (with non-Ward linkages)"
    ],
    cons: [
      "O(n²) memory makes it impractical beyond tens of thousands of points",
      "Greedy merges can never be undone, so early mistakes propagate",
      "Sensitive to feature scaling and outliers",
      "No native predict() for new, unseen points"
    ],
    codeSnippet: `import matplotlib.pyplot as plt
from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import silhouette_score

X_scaled = StandardScaler().fit_transform(X)

# 1. Build the full merge tree with SciPy and plot the dendrogram
Z = linkage(X_scaled, method='ward')
plt.figure(figsize=(10, 4))
dendrogram(Z, truncate_mode='lastp', p=30)
plt.title('Dendrogram (look for the largest vertical gap)')
plt.show()

# 2. Cut the tree at a chosen height
labels_cut = fcluster(Z, t=8.0, criterion='distance')

# 3. Or let sklearn cut at a fixed number of clusters
agg = AgglomerativeClustering(n_clusters=4, linkage='ward')
labels = agg.fit_predict(X_scaled)
print("Silhouette:", silhouette_score(X_scaled, labels))`,
    prerequisites: ["what-is-clustering", "feature-scaling"],
    related: ["kmeans", "dbscan", "gmm", "silhouette-score"],
    diagram: `flowchart TD
    A[("n scaled data points")] --> B["Start: each point is its own cluster"]
    B --> C["Compute pairwise cluster distances (linkage)"]
    C --> D["Merge the two closest clusters"]
    D --> E["Record merge height in dendrogram"]
    E --> F{"Only one cluster left?"}
    F -->|"no"| C
    F -->|"yes"| G["Full dendrogram"]
    G --> H["Cut at height or n_clusters"]
    H --> I(["Final cluster labels"])`
  },

  {
    id: "gmm",
    name: "Gaussian Mixture Models (GMM)",
    track: "ml-models",
    category: "Clustering",
    task: ["Clustering", "Density Estimation", "Unsupervised"],
    difficulty: "Advanced",
    summary: "Models data as a mixture of several Gaussian distributions and assigns each point a probability of belonging to each cluster, fitted via Expectation-Maximization.",
    intuition: "The Overlapping Spotlights: Imagine a dark stage lit by several elliptical spotlights of different sizes and angles. Each point on the stage is lit partly by multiple lights. GMM figures out where each spotlight is, how wide and tilted it is, and how much each one contributes to every point — giving soft, probabilistic memberships instead of hard borders.",
    whenToUse: "When clusters are elliptical, have different sizes/orientations, or overlap; when you need membership probabilities (soft clustering); for density estimation and generative sampling; or for likelihood-based anomaly detection.",
    whenToAvoid: "Non-convex or arbitrarily shaped clusters (use DBSCAN), very high-dimensional data where full covariance matrices become unstable, or tiny datasets where covariance estimates are unreliable.",
    requirements: {
      scalingRequired: true,
      handlesMissing: false,
      outlierSensitive: true,
      needsK: true
    },
    parameters: [
      {
        name: "n_components",
        type: "int",
        default: "1",
        impact: "Number of Gaussian components (clusters).",
        tuningTip: "Choose by minimizing BIC or AIC across a range of values rather than guessing."
      },
      {
        name: "covariance_type",
        type: "str",
        default: "'full'",
        impact: "Shape freedom of each Gaussian: 'full', 'tied', 'diag', 'spherical'.",
        tuningTip: "'full' is most flexible; switch to 'diag' in high dimensions to cut parameters and avoid singular matrices. 'spherical' ≈ soft K-Means."
      },
      {
        name: "n_init",
        type: "int",
        default: "1",
        impact: "Number of EM restarts from different initializations; best is kept.",
        tuningTip: "EM converges to local optima — use 5–10 for more stable results."
      },
      {
        name: "reg_covar",
        type: "float",
        default: "1e-6",
        impact: "Small value added to covariance diagonals for numerical stability.",
        tuningTip: "Increase (1e-4 to 1e-3) if you hit singular covariance errors."
      }
    ],
    math: {
      formula: "p(x) = Σ_k π_k · N(x | μ_k, Σ_k),   E-step: γ_ik = π_k·N(x_i|μ_k,Σ_k) / Σ_j π_j·N(x_i|μ_j,Σ_j)",
      loss: "Negative Log-Likelihood (maximized via EM)",
      explanation: "The E-step computes responsibilities γ_ik — the probability that point i came from component k. The M-step re-estimates each component's weight π_k, mean μ_k and covariance Σ_k as responsibility-weighted averages. Each EM iteration is guaranteed not to decrease the likelihood."
    },
    pros: [
      "Soft probabilistic cluster assignments",
      "Captures elliptical clusters of different sizes and orientations",
      "Doubles as a density estimator and generative model (can sample new points)",
      "Principled model selection with BIC / AIC"
    ],
    cons: [
      "Must choose the number of components",
      "EM can converge to poor local optima — sensitive to initialization",
      "Assumes Gaussian-shaped clusters",
      "Full covariance scales poorly with dimensionality (d² parameters per component)"
    ],
    codeSnippet: `import numpy as np
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler

X_scaled = StandardScaler().fit_transform(X)

# Select number of components using BIC
bics = []
for k in range(1, 11):
    gmm = GaussianMixture(n_components=k, covariance_type='full', n_init=5, random_state=42)
    gmm.fit(X_scaled)
    bics.append(gmm.bic(X_scaled))
best_k = int(np.argmin(bics)) + 1
print("Best k by BIC:", best_k)

gmm = GaussianMixture(n_components=best_k, covariance_type='full', n_init=5, random_state=42)
gmm.fit(X_scaled)

hard_labels = gmm.predict(X_scaled)          # most likely component
soft_probs = gmm.predict_proba(X_scaled)     # membership probabilities

# Anomaly detection: flag the lowest-likelihood 1% of points
log_density = gmm.score_samples(X_scaled)
threshold = np.percentile(log_density, 1)
anomalies = X_scaled[log_density < threshold]

# Generate synthetic samples from the learned distribution
X_new, comp = gmm.sample(100)`,
    prerequisites: ["kmeans", "probability-statistics"],
    related: ["hierarchical-clustering", "dbscan", "naive-bayes", "silhouette-score"],
    diagram: `flowchart TD
    A[("Scaled data X")] --> B["Initialize k Gaussians (μ, Σ, π) e.g. from K-Means"]
    B --> C["E-step: compute responsibilities γ_ik for every point"]
    C --> D["M-step: update π_k, μ_k, Σ_k as weighted averages"]
    D --> E["Compute log-likelihood"]
    E --> F{"Converged?"}
    F -->|"no"| C
    F -->|"yes"| G["Fitted mixture model"]
    G --> H(["Soft cluster probabilities"])
    G --> I(["Density scores for anomaly detection"])
    G --> J(["Sample synthetic data"])`
  },

  {
    id: "tsne-umap",
    name: "t-SNE & UMAP",
    track: "ml-models",
    category: "Dimensionality Reduction",
    task: ["Dimensionality Reduction", "Data Visualization", "Unsupervised"],
    difficulty: "Advanced",
    summary: "Non-linear dimensionality reduction methods that preserve local neighborhoods, used mainly to visualize high-dimensional data in 2D or 3D.",
    intuition: "The Party Seating Plan: You have 1,000 guests described by hundreds of traits and only a 2D floor. You can't keep every distance exact, so you focus on one rule: friends must sit near their friends. t-SNE and UMAP shuffle the guests around the floor until each person's closest friends are sitting next to them — distant strangers can end up anywhere.",
    whenToUse: "Exploring and visualizing embeddings, image features, single-cell genomics, or any high-dimensional data to spot clusters, outliers and label noise. UMAP is also usable as a preprocessing step before clustering.",
    whenToAvoid: "As a feature-engineering step for supervised models (t-SNE has no transform for new data), when you need to interpret distances or cluster sizes between groups (they are not meaningful), or when linear structure suffices (use PCA).",
    requirements: {
      scalingRequired: true,
      handlesMissing: false,
      outlierSensitive: false,
      deterministic: false
    },
    parameters: [
      {
        name: "perplexity (t-SNE)",
        type: "float",
        default: "30",
        impact: "Effective number of neighbors each point considers.",
        tuningTip: "Try 5–50. Low values emphasize very local structure; must be smaller than the number of points."
      },
      {
        name: "n_neighbors (UMAP)",
        type: "int",
        default: "15",
        impact: "Size of the local neighborhood used to build the graph.",
        tuningTip: "Small (5–15) reveals fine local clusters; large (50–200) preserves more global structure."
      },
      {
        name: "min_dist (UMAP)",
        type: "float",
        default: "0.1",
        impact: "How tightly points can be packed in the embedding.",
        tuningTip: "Lower (0.0–0.05) for tighter clusters before clustering; higher (0.5) for a more even visual spread."
      },
      {
        name: "n_components",
        type: "int",
        default: "2",
        impact: "Output dimensionality.",
        tuningTip: "2 or 3 for visualization; UMAP can go to 10–50 as input for downstream clustering."
      }
    ],
    math: {
      formula: "KL(P ‖ Q) = Σ_i Σ_j p_ij · log(p_ij / q_ij),   q_ij ∝ (1 + ‖y_i − y_j‖²)⁻¹",
      loss: "KL divergence (t-SNE) / Fuzzy cross-entropy (UMAP)",
      explanation: "t-SNE converts high-dimensional distances into neighbor probabilities p_ij (Gaussian) and low-dimensional ones into q_ij (heavy-tailed Student-t), then moves points by gradient descent to minimize the KL divergence. The heavy tail lets dissimilar points spread far apart, avoiding crowding. UMAP builds a fuzzy k-NN graph and optimizes a cross-entropy between graphs, which is faster and keeps more global structure."
    },
    pros: [
      "Reveals non-linear cluster structure that PCA cannot",
      "Produces visually striking, interpretable 2D maps",
      "UMAP is fast, scales to millions of points and supports transform() on new data",
      "Useful to sanity-check embeddings and spot label errors"
    ],
    cons: [
      "Distances between clusters and cluster sizes are not meaningful",
      "Results depend heavily on hyperparameters and random seed",
      "t-SNE is slow (O(n log n) at best) and cannot embed new points",
      "Easy to over-interpret — apparent clusters can be artifacts"
    ],
    codeSnippet: `import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import umap  # pip install umap-learn

X_scaled = StandardScaler().fit_transform(X)

# Common trick: denoise with PCA to ~50 dims first (faster, more stable)
X_pca = PCA(n_components=50, random_state=42).fit_transform(X_scaled)

# t-SNE: visualization only
X_tsne = TSNE(n_components=2, perplexity=30, init='pca',
              learning_rate='auto', random_state=42).fit_transform(X_pca)

# UMAP: faster, keeps more global structure, supports transform()
reducer = umap.UMAP(n_neighbors=15, min_dist=0.1, n_components=2, random_state=42)
X_umap = reducer.fit_transform(X_pca)

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
axes[0].scatter(X_tsne[:, 0], X_tsne[:, 1], c=y, s=3, cmap='tab10')
axes[0].set_title('t-SNE')
axes[1].scatter(X_umap[:, 0], X_umap[:, 1], c=y, s=3, cmap='tab10')
axes[1].set_title('UMAP')
plt.show()`,
    prerequisites: ["pca", "what-is-dimensionality-reduction"],
    related: ["curse-of-dimensionality", "embeddings", "autoencoders", "kmeans"],
    diagram: `flowchart TD
    A[("High-dimensional data")] --> B["Scale features, optional PCA to ~50 dims"]
    B --> C["Find nearest neighbors of each point"]
    C --> D["High-dim similarities p_ij / fuzzy k-NN graph"]
    D --> E["Random or spectral 2D initialization"]
    E --> F["Low-dim similarities q_ij (Student-t curve)"]
    F --> G["Gradient step: minimize KL / cross-entropy"]
    G --> H{"Converged?"}
    H -->|"no"| F
    H -->|"yes"| I(["2D map: neighbors stay close"])`
  },

  {
    id: "isolation-forest",
    name: "Isolation Forest",
    track: "ml-models",
    category: "Anomaly Detection",
    task: ["Anomaly Detection", "Unsupervised"],
    difficulty: "Intermediate",
    summary: "Detects anomalies by randomly partitioning the data with trees: outliers are isolated in far fewer splits than normal points.",
    intuition: "The Game of 20 Questions: Guessing an ordinary person in a crowd takes many questions because many people share their traits. Guessing someone wearing a bright purple astronaut suit takes just one or two. Isolation Forest asks random yes/no questions about features — points that are singled out in very few questions are anomalies.",
    whenToUse: "Unsupervised fraud detection, intrusion detection, sensor fault detection, or data-quality checks on tabular data when you have few or no labeled anomalies. Scales well to large, moderately high-dimensional datasets.",
    whenToAvoid: "When anomalies are defined by local density in tight clusters (consider LOF), when you have plenty of labeled fraud examples (use supervised classifiers), or when anomalies only appear in feature combinations parallel splits can't capture.",
    requirements: {
      scalingRequired: false,
      handlesMissing: false,
      outlierSensitive: false,
      needsLabels: false
    },
    parameters: [
      {
        name: "n_estimators",
        type: "int",
        default: "100",
        impact: "Number of isolation trees.",
        tuningTip: "100–300 is usually enough; path lengths stabilize quickly."
      },
      {
        name: "max_samples",
        type: "int or float",
        default: "'auto' (min(256, n))",
        impact: "Number of rows sampled to build each tree.",
        tuningTip: "Small subsamples (256) actually help — they reduce swamping and masking of anomalies."
      },
      {
        name: "contamination",
        type: "float or 'auto'",
        default: "'auto'",
        impact: "Expected proportion of anomalies; sets the decision threshold.",
        tuningTip: "Set to your domain's known anomaly rate (e.g. 0.01) or keep 'auto' and threshold score_samples yourself."
      },
      {
        name: "max_features",
        type: "int or float",
        default: "1.0",
        impact: "Fraction of features drawn to train each tree.",
        tuningTip: "Lower it (0.5–0.8) on wide datasets with many irrelevant columns."
      }
    ],
    math: {
      formula: "s(x, n) = 2^( −E[h(x)] / c(n) ),   c(n) = 2·H(n−1) − 2(n−1)/n",
      loss: "None (unsupervised path-length score)",
      explanation: "h(x) is the number of splits needed to isolate x in a tree, averaged over the forest. c(n) is the average path length of an unsuccessful search in a binary search tree, used to normalize. Scores close to 1 indicate anomalies (short paths); scores well below 0.5 indicate normal points."
    },
    pros: [
      "Linear time complexity and low memory — scales to millions of rows",
      "No distance computations, so no feature scaling needed",
      "Works without any labels",
      "Few hyperparameters and robust defaults"
    ],
    cons: [
      "Axis-parallel splits can miss anomalies in rotated/correlated feature spaces",
      "Choosing contamination requires domain knowledge",
      "Struggles with local anomalies inside dense clusters",
      "Scores are hard to explain without SHAP or similar tools"
    ],
    codeSnippet: `import numpy as np
from sklearn.ensemble import IsolationForest

# X: transactions with features like amount, hour, n_tx_last_24h, distance_from_home
iso = IsolationForest(
    n_estimators=200,
    max_samples=256,
    contamination=0.01,   # expect ~1% anomalies
    random_state=42,
    n_jobs=-1
)
iso.fit(X_train)

# -1 = anomaly, 1 = normal
pred = iso.predict(X_test)

# Lower score = more anomalous (sklearn negates the paper's score)
scores = iso.score_samples(X_test)
top_suspicious = np.argsort(scores)[:20]
print("Flagged:", (pred == -1).sum(), "of", len(pred))

# If a few labels exist, evaluate ranking quality
from sklearn.metrics import average_precision_score
print("AP:", average_precision_score(y_test == 1, -scores))`,
    prerequisites: ["decision-tree", "random-forest"],
    related: ["dbscan", "gmm", "class-imbalance", "model-data-drift"],
    diagram: `flowchart TD
    A[("Unlabeled data")] --> B["Draw small random subsample (e.g. 256 rows)"]
    B --> C["Pick random feature and random split value"]
    C --> D{"Point isolated in its own leaf?"}
    D -->|"no"| C
    D -->|"yes"| E["Record path length h(x)"]
    E --> F["Repeat for many isolation trees"]
    F --> G["Average path length E[h(x)]"]
    G --> H{"Short path?"}
    H -->|"yes"| I(["Anomaly: score near 1"])
    H -->|"no"| J(["Normal point"])`
  },

  {
    id: "time-series-forecasting",
    name: "Time Series Forecasting (ARIMA & Prophet)",
    track: "ml-models",
    category: "Time Series",
    task: ["Regression", "Time Series", "Forecasting"],
    difficulty: "Intermediate",
    summary: "Predicts future values of a sequence by modeling its trend, seasonality and autocorrelation, using statistical models like ARIMA or decomposable models like Prophet.",
    intuition: "The Weather Almanac: To predict tomorrow's ice cream sales you look at three things — the long-term direction (business is growing), the repeating rhythm (weekends and summers are busier), and yesterday's momentum (a hot streak tends to continue). ARIMA models the momentum mathematically; Prophet adds up trend + seasonality + holidays like Lego blocks.",
    whenToUse: "Demand forecasting, sales, traffic, energy load, or any metric observed at regular intervals with clear trends and seasonal cycles. ARIMA for single, stationary-ish series; Prophet for business data with multiple seasonalities, holidays and missing days.",
    whenToAvoid: "Thousands of related series with rich covariates (global ML models like LightGBM with lag features or deep learning often win), very short histories (under ~2 seasonal cycles), or when shocks are driven by unobserved external events.",
    requirements: {
      scalingRequired: false,
      handlesMissing: true,
      outlierSensitive: true,
      stationarityRequired: "ARIMA: yes (via differencing); Prophet: no"
    },
    parameters: [
      {
        name: "order (p, d, q)",
        type: "tuple",
        default: "(1, 0, 0)",
        impact: "ARIMA: p = autoregressive lags, d = differencing steps, q = moving-average error lags.",
        tuningTip: "Choose d with an ADF test, p from the PACF plot, q from the ACF plot — or use auto_arima to search by AIC."
      },
      {
        name: "seasonal_order (P, D, Q, s)",
        type: "tuple",
        default: "(0, 0, 0, 0)",
        impact: "SARIMA: seasonal AR/differencing/MA terms with period s.",
        tuningTip: "Set s to the cycle length (7 for daily data with weekly cycle, 12 for monthly)."
      },
      {
        name: "changepoint_prior_scale (Prophet)",
        type: "float",
        default: "0.05",
        impact: "Flexibility of the trend to bend at changepoints.",
        tuningTip: "Increase (0.1–0.5) if the trend underfits; decrease (0.001–0.01) if it chases noise."
      },
      {
        name: "seasonality_mode (Prophet)",
        type: "str",
        default: "'additive'",
        impact: "Whether seasonal effects add to or multiply the trend.",
        tuningTip: "Use 'multiplicative' when seasonal swings grow as the series grows."
      }
    ],
    math: {
      formula: "ARIMA: y′_t = c + Σ_{i=1..p} φ_i·y′_{t−i} + Σ_{j=1..q} θ_j·ε_{t−j} + ε_t     Prophet: y(t) = g(t) + s(t) + h(t) + ε_t",
      loss: "Maximum likelihood (ARIMA) / MAP via Stan (Prophet); evaluated with MAE, RMSE, MAPE",
      explanation: "ARIMA differences the series d times (y′) to make it stationary, then regresses it on its own p past values and q past forecast errors. Prophet is a curve-fitting model: a piecewise-linear or logistic trend g(t), Fourier-series seasonality s(t), and holiday effects h(t) are summed, which makes each component easy to inspect."
    },
    pros: [
      "Strong, interpretable baselines with confidence intervals out of the box",
      "Prophet handles missing data, outliers, holidays and multiple seasonalities easily",
      "ARIMA is statistically rigorous and works well on short, clean series",
      "Components (trend, seasonality) can be plotted and explained to stakeholders"
    ],
    cons: [
      "ARIMA requires stationarity checks and careful order selection",
      "Classic models handle one series at a time and few exogenous features",
      "Prophet can be outperformed by simple baselines on non-business data",
      "Standard random K-fold CV leaks the future — needs time-aware validation"
    ],
    codeSnippet: `import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
from prophet import Prophet
from sklearn.metrics import mean_absolute_error

# df: columns ['ds' (date), 'y' (daily sales)]
df = df.sort_values('ds')
train, test = df.iloc[:-30], df.iloc[-30:]   # hold out last 30 days, never shuffle

# --- SARIMA: AR(1), first difference, MA(1), weekly seasonality ---
sarima = SARIMAX(train['y'], order=(1, 1, 1), seasonal_order=(1, 1, 1, 7))
sarima_fit = sarima.fit(disp=False)
sarima_pred = sarima_fit.forecast(steps=30)
print("SARIMA MAE:", mean_absolute_error(test['y'], sarima_pred))

# --- Prophet: trend + weekly/yearly seasonality + holidays ---
m = Prophet(seasonality_mode='multiplicative', changepoint_prior_scale=0.1)
m.add_country_holidays(country_name='US')
m.fit(train)
future = m.make_future_dataframe(periods=30)
forecast = m.predict(future)
prophet_pred = forecast['yhat'].iloc[-30:].values
print("Prophet MAE:", mean_absolute_error(test['y'], prophet_pred))

m.plot_components(forecast)   # inspect trend and seasonality`,
    prerequisites: ["linear-regression", "time-series-cv"],
    related: ["rnn-lstm", "lightgbm", "mae-metric", "rmse-metric"],
    diagram: `flowchart TD
    A[("Ordered time series y_t")] --> B["Plot and decompose: trend, seasonality, residual"]
    B --> C{"Which model?"}
    C -->|"ARIMA"| D["ADF test, difference d times until stationary"]
    D --> E["Pick p from PACF, q from ACF (or auto_arima)"]
    E --> F["Fit by maximum likelihood"]
    C -->|"Prophet"| G["Fit trend g(t) + seasonality s(t) + holidays h(t)"]
    F --> H["Forecast horizon with confidence intervals"]
    G --> H
    H --> I["Evaluate with time-ordered backtest (MAE, MAPE)"]
    I --> J(["Production forecast"])`
  },

  {
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
print(top10)`,
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
    J -.->|"new clicks"| A`
  },

  {
    id: "q-learning",
    name: "Q-Learning & Deep Q-Networks (DQN)",
    track: "ml-models",
    category: "Reinforcement Learning",
    task: ["Reinforcement Learning", "Optimization"],
    difficulty: "Advanced",
    summary: "A model-free reinforcement learning algorithm that learns the expected long-term reward Q(s, a) of each action in each state, so an agent can act optimally by picking the highest-valued action.",
    intuition: "The Maze Mouse: A mouse wanders a maze and slowly writes on a mental scoreboard how good each turn at each junction is, based on the cheese it eventually finds. Each time it moves, it nudges the score toward 'the reward I just got + the best score I see from where I landed'. DQN replaces the scoreboard with a neural network so it can handle mazes too big to tabulate, like raw video game pixels.",
    whenToUse: "Sequential decision problems with discrete actions and a clear reward signal: games, robotics in simulation, inventory control, ad bidding policies, or resource scheduling — ideally where a simulator lets the agent fail cheaply millions of times.",
    whenToAvoid: "Continuous action spaces (use policy-gradient / actor-critic methods like PPO or SAC), problems with no simulator where exploration is costly or dangerous, or when a supervised dataset of correct decisions already exists.",
    requirements: {
      scalingRequired: true,
      handlesMissing: false,
      outlierSensitive: true,
      needsEnvironment: true
    },
    parameters: [
      {
        name: "learning_rate (α)",
        type: "float",
        default: "0.1 (tabular) / 1e-4 (DQN)",
        impact: "How strongly each new experience overwrites the old Q estimate.",
        tuningTip: "Too high causes oscillation; decay it over time for tabular convergence."
      },
      {
        name: "discount factor (γ)",
        type: "float",
        default: "0.99",
        impact: "How much future rewards count compared to immediate ones.",
        tuningTip: "0.9–0.99. Lower values make the agent short-sighted but training more stable."
      },
      {
        name: "epsilon (ε) schedule",
        type: "float",
        default: "1.0 → 0.05",
        impact: "Probability of taking a random exploratory action.",
        tuningTip: "Start fully random and decay linearly or exponentially over the first 10–20% of training."
      },
      {
        name: "replay buffer & target update (DQN)",
        type: "architecture",
        default: "100k transitions / every 1k steps",
        impact: "Experience replay breaks sample correlation; a frozen target network stabilizes the bootstrap target.",
        tuningTip: "Use a soft update (τ ≈ 0.005) or hard copy every 1k–10k steps; larger buffers improve stability."
      }
    ],
    math: {
      formula: "Q(s, a) ← Q(s, a) + α · [ r + γ · max_a′ Q(s′, a′) − Q(s, a) ]",
      loss: "TD error / Huber loss: L(θ) = ( r + γ·max_a′ Q_θ⁻(s′, a′) − Q_θ(s, a) )²",
      explanation: "The update moves Q(s, a) toward the Bellman target: the immediate reward plus the discounted value of the best next action. The bracketed term is the temporal-difference (TD) error. DQN approximates Q with a neural network θ and computes the target with a slowly updated copy θ⁻ to avoid chasing a moving target."
    },
    pros: [
      "Model-free: learns directly from experience without knowing environment dynamics",
      "Off-policy: can learn from replayed or logged experience",
      "Tabular Q-learning provably converges to the optimal policy under mild conditions",
      "DQN scales to high-dimensional inputs like images"
    ],
    cons: [
      "Very sample-inefficient — often needs millions of interactions",
      "Only handles discrete actions directly",
      "Max operator overestimates Q-values (mitigated by Double DQN)",
      "Training is unstable and highly sensitive to hyperparameters and reward design"
    ],
    codeSnippet: `import numpy as np
import gymnasium as gym

# Tabular Q-learning on a small discrete environment
env = gym.make('FrozenLake-v1', is_slippery=True)
n_states, n_actions = env.observation_space.n, env.action_space.n
Q = np.zeros((n_states, n_actions))

alpha, gamma = 0.1, 0.99
epsilon, eps_min, eps_decay = 1.0, 0.05, 0.9995

for episode in range(20000):
    state, _ = env.reset()
    done = False
    while not done:
        # epsilon-greedy exploration
        if np.random.rand() < epsilon:
            action = env.action_space.sample()
        else:
            action = int(np.argmax(Q[state]))

        next_state, reward, terminated, truncated, _ = env.step(action)
        done = terminated or truncated

        # Bellman / TD update (no bootstrap from terminal states)
        target = reward + gamma * np.max(Q[next_state]) * (not terminated)
        Q[state, action] += alpha * (target - Q[state, action])
        state = next_state

    epsilon = max(eps_min, epsilon * eps_decay)

policy = np.argmax(Q, axis=1)
print("Learned policy:", policy.reshape(4, 4))
# For large/continuous state spaces: stable_baselines3.DQN('MlpPolicy', env)`,
    prerequisites: ["supervised-vs-unsupervised", "mlp-neural-network"],
    related: ["dl-optimizers", "what-is-gradient-descent", "llms"],
    diagram: `flowchart TD
    A(["Agent observes state s"]) --> B{"Random number less than ε?"}
    B -->|"yes: explore"| C["Random action a"]
    B -->|"no: exploit"| D["a = argmax Q(s, ·)"]
    C --> E["Environment returns reward r and next state s′"]
    D --> E
    E --> F[("Store (s, a, r, s′) in replay buffer")]
    F --> G["TD target = r + γ · max Q_target(s′, a′)"]
    G --> H["Update Q(s, a) toward target (gradient step for DQN)"]
    H --> I["Decay ε, periodically sync target network"]
    I --> A`
  }
];

// Adds graph links + diagrams to EXISTING concepts (keyed by existing id).
export const enrichments = {
  "linear-regression": {
    prerequisites: ["what-is-regression", "what-is-gradient-descent", "linear-algebra"],
    related: ["logistic-regression", "regularization-l1-l2", "r2-score", "time-series-forecasting"],
    diagram: `flowchart TD
    A[("Features X, numeric target y")] --> B["Add bias column, optional scaling"]
    B --> C{"Solver?"}
    C -->|"closed form"| D["Normal equation: θ = (XᵀX)⁻¹Xᵀy"]
    C -->|"iterative"| E["Gradient descent on MSE"]
    E --> F["Update θ ← θ − α · ∇MSE"]
    F --> G{"Converged?"}
    G -->|"no"| E
    G -->|"yes"| H["Fitted coefficients θ"]
    D --> H
    H --> I["Prediction ŷ = Xθ"]
    I --> J(["Evaluate with RMSE / R², check residuals"])`
  },

  "logistic-regression": {
    prerequisites: ["linear-regression", "what-is-classification"],
    related: ["log-loss", "svm", "naive-bayes", "roc-auc"],
    diagram: `flowchart LR
    A[("Features x")] --> B["Linear score z = wᵀx + b"]
    B --> C["Sigmoid σ(z) = 1 / (1 + e^−z)"]
    C --> D["Probability P(y = 1 | x)"]
    D --> E{"P ≥ threshold (e.g. 0.5)?"}
    E -->|"yes"| F(["Predict class 1"])
    E -->|"no"| G(["Predict class 0"])
    D --> H["Log-Loss vs true label"]
    H --> I["Gradient step updates w, b"]
    I -.-> B`
  },

  "decision-tree": {
    prerequisites: ["what-is-classification", "what-is-regression"],
    related: ["random-forest", "gradient-boosting", "isolation-forest", "overfitting-underfitting"],
    diagram: `flowchart TD
    A[("Node with training samples")] --> B["Try every feature and threshold"]
    B --> C["Compute impurity drop (Gini / Entropy / MSE)"]
    C --> D["Choose best split"]
    D --> E["Left child: feature ≤ threshold"]
    D --> F["Right child: feature greater than threshold"]
    E --> G{"Stopping rule hit? (max_depth, min_samples, pure)"}
    F --> G
    G -->|"no"| B
    G -->|"yes"| H(["Leaf: majority class or mean value"])`
  },

  "random-forest": {
    prerequisites: ["decision-tree", "ensemble-methods"],
    related: ["xgboost", "gradient-boosting", "isolation-forest", "bias-variance-tradeoff"],
    diagram: `flowchart TD
    A[("Training data")] --> B1["Bootstrap sample 1"]
    A --> B2["Bootstrap sample 2"]
    A --> B3["Bootstrap sample B"]
    B1 --> T1["Tree 1: random feature subset per split"]
    B2 --> T2["Tree 2: random feature subset per split"]
    B3 --> T3["Tree B: random feature subset per split"]
    T1 --> V["Aggregate predictions"]
    T2 --> V
    T3 --> V
    V --> R(["Majority vote (clf) or average (reg)"])
    A -.->|"rows left out"| O["Out-of-bag error estimate"]`
  },

  "xgboost": {
    prerequisites: ["gradient-boosting", "regularization-l1-l2"],
    related: ["lightgbm", "catboost", "random-forest", "hyperparameter-tuning"],
    diagram: `flowchart TD
    A[("DMatrix: data + labels")] --> B["Current prediction F_t-1"]
    B --> C["Compute gradients g_i and Hessians h_i"]
    C --> D["Sparsity-aware split search: missing values get a default direction"]
    D --> E["Gain = score(left) + score(right) − score(parent) − γ"]
    E --> F["Optimal leaf weight w = −Σg / (Σh + λ)"]
    F --> G["F_t = F_t-1 + η · f_t"]
    G --> H{"Eval metric improved in last N rounds?"}
    H -->|"yes"| B
    H -->|"no"| I(["Early stop: keep best iteration"])`
  },

  "lightgbm": {
    prerequisites: ["gradient-boosting"],
    related: ["xgboost", "catboost", "random-forest", "time-series-forecasting"],
    diagram: `flowchart TD
    A[("Large tabular data")] --> B["Bucket features into histograms (max_bin)"]
    B --> C["GOSS: keep large-gradient rows, sample small-gradient rows"]
    C --> D["EFB: bundle mutually exclusive sparse features"]
    D --> E["Leaf-wise growth: split the leaf with max gain"]
    E --> F{"num_leaves or min_data_in_leaf reached?"}
    F -->|"no"| E
    F -->|"yes"| G["Add tree × learning_rate to ensemble"]
    G --> H{"Early stopping?"}
    H -->|"continue"| C
    H -->|"stop"| I(["Final boosted model"])`
  },

  "svm": {
    prerequisites: ["logistic-regression", "feature-scaling", "linear-algebra"],
    related: ["knn", "regularization-l1-l2", "naive-bayes", "roc-auc"],
    diagram: `flowchart TD
    A[("Scaled features + labels")] --> B{"Linearly separable?"}
    B -->|"yes"| C["Linear kernel"]
    B -->|"no"| D["Kernel trick: RBF / polynomial maps to higher dims"]
    C --> E["Find hyperplane with maximum margin"]
    D --> E
    E --> F["Hinge loss + C trades margin width vs violations"]
    F --> G["Support vectors: only points on or inside margin"]
    G --> H["Decision: sign(Σ α_i y_i K(x_i, x) + b)"]
    H --> I(["Class prediction"])`
  },

  "knn": {
    prerequisites: ["what-is-classification", "feature-scaling"],
    related: ["knn-imputer", "recommender-systems", "curse-of-dimensionality", "svm"],
    diagram: `flowchart LR
    A(["New query point x"]) --> B["Scale with training statistics"]
    B --> C["Compute distance to every stored training point"]
    T[("Stored training set")] --> C
    C --> D["Sort and keep the k nearest neighbors"]
    D --> E{"Task?"}
    E -->|"classification"| F["Majority (or distance-weighted) vote"]
    E -->|"regression"| G["Average of neighbor targets"]
    F --> H(["Prediction"])
    G --> H`
  },

  "naive-bayes": {
    prerequisites: ["probability-statistics", "what-is-classification"],
    related: ["logistic-regression", "gmm", "precision-recall-f1"],
    diagram: `flowchart TD
    A[("Labeled training data")] --> B["Estimate priors P(class)"]
    A --> C["Estimate per-feature likelihoods P(x_j | class)"]
    C --> D["Add Laplace smoothing for unseen values"]
    E(["New sample x"]) --> F["For each class: log P(class) + Σ log P(x_j | class)"]
    B --> F
    D --> F
    F --> G["Naive assumption: features independent given class"]
    G --> H["Pick class with highest posterior"]
    H --> I(["Predicted class + probabilities"])`
  },

  "kmeans": {
    prerequisites: ["what-is-clustering", "feature-scaling"],
    related: ["dbscan", "gmm", "hierarchical-clustering", "silhouette-score"],
    diagram: `flowchart TD
    A[("Scaled data")] --> B["Initialize k centroids (k-means++)"]
    B --> C["Assign each point to nearest centroid"]
    C --> D["Recompute centroid = mean of assigned points"]
    D --> E{"Centroids moved?"}
    E -->|"yes"| C
    E -->|"no"| F["Converged: compute inertia (WCSS)"]
    F --> G["Repeat for several k: elbow / silhouette"]
    G --> H(["Final k cluster labels"])`
  },

  "dbscan": {
    prerequisites: ["what-is-clustering", "kmeans"],
    related: ["hierarchical-clustering", "isolation-forest", "gmm", "silhouette-score"],
    diagram: `flowchart TD
    A[("Scaled data")] --> B["For each point count neighbors within ε"]
    B --> C{"Neighbors ≥ min_samples?"}
    C -->|"yes"| D["Core point"]
    C -->|"no"| E{"Within ε of a core point?"}
    E -->|"yes"| F["Border point"]
    E -->|"no"| G(["Noise / outlier: label −1"])
    D --> H["Expand cluster through density-reachable cores"]
    F --> H
    H --> I(["Arbitrary-shaped clusters"])`
  },

  "pca": {
    prerequisites: ["what-is-dimensionality-reduction", "linear-algebra", "feature-scaling"],
    related: ["tsne-umap", "autoencoders", "curse-of-dimensionality", "feature-selection"],
    diagram: `flowchart TD
    A[("Data matrix X: n × d")] --> B["Center (and standardize) each feature"]
    B --> C["Covariance matrix or SVD of X"]
    C --> D["Eigenvectors = principal directions"]
    C --> E["Eigenvalues = variance explained"]
    E --> F["Sort and keep top k (e.g. 95% cumulative variance)"]
    D --> G["Projection matrix W_k"]
    F --> G
    G --> H(["Reduced data Z = X · W_k (n × k)"])`
  }
};
