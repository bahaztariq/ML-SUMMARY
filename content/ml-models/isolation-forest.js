export default {
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
    H -->|"no"| J(["Normal point"])`,
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
print("AP:", average_precision_score(y_test == 1, -scores))`
};
