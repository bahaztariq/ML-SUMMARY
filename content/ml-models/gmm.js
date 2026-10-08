export default {
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
    G --> J(["Sample synthetic data"])`,
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
X_new, comp = gmm.sample(100)`
};
