/**
 * ML & Data Engineering Knowledge Base
 * Complete encyclopedia with goals, intuition, requirements, hyperparameters, math, pros/cons, and code blueprints.
 */

import * as fundamentalsMlops from './data/mlops-fundamentals.js';
import * as dataEng from './data/data-eng.js';
import * as mlCore from './data/ml-core.js';
import * as mlModels from './data/ml-models.js';
import * as deepLearning from './data/deep-learning.js';

const trackModules = [fundamentalsMlops, dataEng, mlCore, mlModels, deepLearning];

const baseConcepts = [
  // ==========================================
  // TRACK: FUNDAMENTALS & CORE DEFINITIONS
  // ==========================================
  {
    id: "what-is-ai",
    name: "What is Artificial Intelligence (AI)?",
    track: "fundamentals",
    category: "Foundations & Overview",
    task: ["Definition", "Foundations", "Overview"],
    difficulty: "Beginner",
    summary: "The overarching scientific and engineering discipline dedicated to creating systems capable of performing tasks that typically require human cognitive intelligence.",
    intuition: "The Broadest Umbrella: Think of AI as the entire field of transportation. Cars, planes, trains, and bicycles are all transportation. Similarly, rule-based expert systems, machine learning algorithms, and deep neural networks are all subfields of AI.",
    whenToUse: "When building software that must perceive its environment, reason through uncertain problems, recognize patterns, or make autonomous decisions at scale.",
    whenToAvoid: "When simple deterministic logic (e.g. standard SQL queries, arithmetic formulas, or if-else statements) solves the problem with 100% precision and zero uncertainty.",
    requirements: {
      umbrellaField: true,
      subsumesMLandDL: true,
      includesRuleBasedSystems: true,
      requiresDataOrHeuristics: true
    },
    parameters: [
      {
        name: "Narrow AI (ANI)",
        type: "concept",
        default: "Current Reality",
        impact: "AI specialized in one single task (e.g. playing chess, recommending movies, detecting tumors).",
        tuningTip: "All existing commercial AI today is Narrow AI."
      },
      {
        name: "General AI (AGI)",
        type: "concept",
        default: "Theoretical",
        impact: "Hypothetical AI possessing human-level cognitive adaptability across any intellectual domain.",
        tuningTip: "Active area of long-term academic and industrial research."
      },
      {
        name: "Symbolic vs Statistical AI",
        type: "paradigm",
        default: "Statistical Dominant",
        impact: "Symbolic AI uses handcrafted logic rules; Statistical AI (ML) learns probabilistic patterns from empirical data.",
        tuningTip: "Modern AI combines statistical learning with symbolic constraints."
      }
    ],
    math: {
      formula: "AI ⊃ Machine Learning (ML) ⊃ Deep Learning (DL)",
      loss: "Hierarchy of Artificial Intelligence",
      explanation: "AI is the parent superset. Machine Learning is the statistical engine within AI that learns from data. Deep Learning is the specialized multi-layered neural network branch inside Machine Learning."
    },
    pros: [
      "Automates high-complexity cognitive tasks previously restricted to humans",
      "Processes massive multi-modal streams (vision, audio, text, sensor data) at scale",
      "Can discover non-intuitive solutions and patterns in high-dimensional domains"
    ],
    cons: [
      "Can behave as unpredictable black boxes without strict verification safeguards",
      "Subject to hallucinations, data bias, and safety alignment challenges"
    ],
    codeSnippet: `# Conceptual Hierarchy in Python
class ArtificialIntelligence:
    def __init__(self, name="Broad AI"):
        self.scope = "Any machine exhibiting intelligent behavior"

class MachineLearning(ArtificialIntelligence):
    def __init__(self):
        super().__init__("Machine Learning")
        self.mechanism = "Learns statistical patterns from data without explicit rules"

class DeepLearning(MachineLearning):
    def __init__(self):
        super().__init__()
        self.architecture = "Multi-layer artificial neural networks (ANNs)"

ai_stack = DeepLearning()
print(f"Parent: {issubclass(DeepLearning, ArtificialIntelligence)}") # True`
  },

  {
    id: "what-is-ml",
    name: "What is Machine Learning (ML)?",
    track: "fundamentals",
    category: "Foundations & Overview",
    task: ["Definition", "Foundations", "Overview"],
    difficulty: "Beginner",
    summary: "A subfield of Artificial Intelligence where algorithms learn mathematical mappings and statistical patterns directly from historical data to make accurate predictions on new data, without being explicitly programmed.",
    intuition: "Learning from Experience: In traditional software programming, humans write explicit rules: (Data + Rules = Answers). In Machine Learning, you feed the computer data and observed outcomes, and the algorithm calculates the underlying rules: (Data + Answers = Rules).",
    whenToUse: "When the rules connecting inputs to outputs are too complex, dynamic, or high-dimensional for human programmers to write by hand (e.g. spam detection, fraud alerts, recommendation engines).",
    whenToAvoid: "When the problem can be solved with a simple static formula, strict legal compliance rules that forbid probabilistic uncertainty, or when you have zero historical data to learn from.",
    requirements: {
      requiresQualityData: true,
      probabilisticOutput: true,
      generalizationGoal: true,
      avoidsHardcodedRules: true
    },
    parameters: [
      {
        name: "Supervised Learning",
        type: "paradigm",
        default: "Most common",
        impact: "Learning with labels: mapping inputs X to known ground truth targets y.",
        tuningTip: "Use when you have clear historical answers (e.g. customer churn: yes/no)."
      },
      {
        name: "Unsupervised Learning",
        type: "paradigm",
        default: "Exploratory",
        impact: "Learning without labels: finding natural clusters, distributions, or low-dimensional projections.",
        tuningTip: "Use for customer segmentation or anomaly detection."
      },
      {
        name: "Reinforcement Learning",
        type: "paradigm",
        default: "Sequential",
        impact: "Learning via trial-and-error rewards and penalties inside dynamic environments.",
        tuningTip: "Use for robotics, autonomous driving, and game playing (e.g. AlphaGo)."
      }
    ],
    math: {
      formula: "Traditional: Data + Rules -> Answers  |  ML: Data + Answers -> Rules (Model: ŷ = f(X; θ))",
      loss: "Empirical Risk Minimization (ERM)",
      explanation: "A machine learning model parameterizes a function f with adjustable weights θ. The goal of training is finding the optimal weights θ* that minimize empirical prediction error over training examples."
    },
    pros: [
      "Adapts dynamically to changing patterns when retrained on fresh data",
      "Solves complex problems that cannot be described with rigid if-else logic",
      "Scales automated decision-making across millions of transactions per second"
    ],
    cons: [
      "Garbage In, Garbage Out: Model quality is strictly bottlenecked by training data quality",
      "Predictions are probabilistic approximations, not mathematical certainties",
      "Vulnerable to distribution drift when the real world changes"
    ],
    codeSnippet: `from sklearn.linear_model import LogisticRegression

# 1. Provide Data (Features X) and Observed Answers (Labels y)
X_features = [[25, 50000], [45, 120000], [22, 25000], [55, 180000]] # [Age, Income]
y_answers  = [0, 1, 0, 1]                                            # [Did Buy Luxury Car: 0=No, 1=Yes]

# 2. Machine Learning: The model learns the rules automatically!
model = LogisticRegression()
model.fit(X_features, y_answers)

# 3. Predict on unseen new data
new_customer = [[38, 95000]]
prediction = model.predict(new_customer)
print(f"Prediction for new customer: {'Will Buy (1)' if prediction[0] == 1 else 'Will Not Buy (0)'}")`
  },

  {
    id: "what-is-de",
    name: "What is Data Engineering (DE)?",
    track: "fundamentals",
    category: "Foundations & Overview",
    task: ["Definition", "Data Engineering", "Architecture"],
    difficulty: "Beginner",
    summary: "The engineering discipline responsible for designing, building, orchestrating, and maintaining the scalable data pipelines, storage systems, and platforms that deliver clean, timely, and reliable data to analysts, data scientists, and ML models.",
    intuition: "The Plumbing and Water Filtration of AI: Data Scientists and ML models are like chefs preparing fine meals. If the kitchen pipes leak, the water is contaminated with mud, or water only flows once a week, no chef can cook. Data Engineers build the water purification plant and high-pressure pipes.",
    whenToUse: "Whenever data exists across disparate systems (databases, APIs, logs) and must be reliably ingested, cleaned, deduplicated, formatted, and made queryable for downstream consumers.",
    whenToAvoid: "When you have a simple static CSV file that easily fits on your laptop and never updates (ad-hoc spreadsheet analysis).",
    requirements: {
      dataInfrastructure: true,
      pipelineOrchestration: true,
      dataQualityEnforcement: true,
      schemaGovernance: true
    },
    parameters: [
      {
        name: "Data Ingestion",
        type: "phase",
        default: "Batch or Streaming",
        impact: "Extracting raw data from operational systems (databases, webhooks, IoT sensors).",
        tuningTip: "Batch for daily reports (Airflow); Streaming for sub-second alerts (Kafka)."
      },
      {
        name: "Data Storage",
        type: "architecture",
        default: "Lakehouse",
        impact: "Organizing data into Raw (Bronze), Cleaned (Silver), and Aggregated (Gold) tiers.",
        tuningTip: "Use columnar Parquet on object storage (S3/GCS) with Delta/Iceberg metadata."
      },
      {
        name: "Data Transformation",
        type: "phase",
        default: "SQL / dbt / Spark",
        impact: "Cleaning nulls, casting types, calculating joins, and producing business metrics.",
        tuningTip: "Prefer ELT over ETL on modern cloud data warehouses."
      }
    ],
    math: {
      formula: "Data Pipeline = Extraction -> Validation -> Transformation -> Loading -> Monitoring",
      loss: "Data Lineage & SLA (Service Level Agreement) Adherence",
      explanation: "Data Engineering focuses on throughput (gigabytes/sec), latency (time-to-insight), data quality (zero corrupted rows), and pipeline idempotency (running twice produces identical results)."
    },
    pros: [
      "Provides the essential, battle-tested foundation for all analytics and ML systems",
      "Prevents catastrophic model failures caused by silent schema changes and dirty data",
      "Scales corporate data access securely across thousands of simultaneous queries"
    ],
    cons: [
      "High infrastructure complexity (Kafka, Spark, Airflow, Kubernetes, cloud billing)",
      "Frequent unexpected schema breaks from upstream third-party APIs"
    ],
    codeSnippet: `# Minimal End-to-End Data Pipeline Blueprint
import pandas as pd
import sqlite3

def run_data_pipeline():
    # 1. EXTRACT: Ingest raw dirty transactions
    raw_data = pd.DataFrame({
        'user_id': [101, 102, 103, None],
        'amount': ["$150.00", "$45.50", "$99.99", "$12.00"]
    })
    
    # 2. TRANSFORM: Clean, validate, and type-cast
    clean_data = raw_data.dropna(subset=['user_id']).copy()
    clean_data['user_id'] = clean_data['user_id'].astype(int)
    clean_data['amount'] = clean_data['amount'].str.replace('$', '').astype(float)
    
    # 3. LOAD: Persist into analytical storage
    conn = sqlite3.connect(':memory:')
    clean_data.to_sql('fact_orders', conn, index=False)
    print("✅ Pipeline succeeded: Clean data loaded into analytical table!")

run_data_pipeline()`
  },

  {
    id: "what-is-clustering",
    name: "What is Clustering?",
    track: "fundamentals",
    category: "Core Tasks",
    task: ["Definition", "Clustering", "Unsupervised"],
    difficulty: "Beginner",
    summary: "An unsupervised learning task that groups a collection of unlabeled data points into clusters so that objects in the same cluster are much more similar to each other than to objects in other clusters.",
    intuition: "Sorting Socks Without Labels: Imagine dumping a mountain of clean socks on a bed. Nobody labeled them 'black dress sock' or 'white sports sock'. You naturally pair similar colors, lengths, and textures together purely by looking at their physical similarities.",
    whenToUse: "Customer segmentation (grouping users by buying habits), anomaly/fraud detection (points that don't belong to any cluster), document topic discovery, and image compression.",
    whenToAvoid: "When you already have explicit target labels you want to predict (use Supervised Classification instead).",
    requirements: {
      unlabeledDataOnly: true,
      requiresDistanceMetric: true,
      featureScalingCritical: true,
      noGroundTruthLabels: true
    },
    parameters: [
      {
        name: "Centroid-Based (K-Means)",
        type: "algorithm type",
        default: "Spherical clusters",
        impact: "Represents clusters by their central mean point.",
        tuningTip: "Fastest and most popular, but assumes clusters are round and equal sized."
      },
      {
        name: "Density-Based (DBSCAN)",
        type: "algorithm type",
        default: "Arbitrary shapes",
        impact: "Connects dense regions separated by sparse noise.",
        tuningTip: "Does not require specifying cluster count k in advance; filters outliers automatically."
      },
      {
        name: "Hierarchical Clustering",
        type: "algorithm type",
        default: "Dendrogram tree",
        impact: "Builds a nested tree of clusters from bottom-up (agglomerative) or top-down.",
        tuningTip: "Great for evolutionary biology or small datasets where visual trees add value."
      }
    ],
    math: {
      formula: "Objective: Minimize Intra-Cluster Distance & Maximize Inter-Cluster Distance",
      loss: "Within-Cluster Sum of Squares (Inertia) = ∑_k ∑_i ||x_i - μ_k||²",
      explanation: "Clustering algorithms mathematically minimize the spread within each group (intra-cluster variance) while pushing the centers of distinct groups as far apart as possible in vector space."
    },
    pros: [
      "Requires zero human labeling effort or expensive annotation budgets",
      "Reveals natural, previously unsuspected patterns and customer archetypes",
      "Can engineer rich cluster-distance features for downstream supervised models"
    ],
    cons: [
      "No objective mathematical 'ground truth' to prove which clustering is definitively correct",
      "Heavily sensitive to unscaled features and the chosen distance metric"
    ],
    codeSnippet: `from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import numpy as np

# Unlabeled customer features: [Annual Spend ($k), Website Visits]
X = np.array([
    [15, 2], [18, 3], [12, 1],       # Cluster A: Low spend, low visits
    [90, 25], [85, 22], [95, 28],    # Cluster B: High spend, high visits
    [20, 30], [22, 28], [18, 35]     # Cluster C: Bargain hunters (low spend, high visits)
])

# Scale and cluster
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

kmeans = KMeans(n_clusters=3, random_state=42)
cluster_ids = kmeans.fit_predict(X_scaled)
print(f"Assigned Customer Segments: {cluster_ids}")`
  },

  {
    id: "what-is-classification",
    name: "What is Classification?",
    track: "fundamentals",
    category: "Core Tasks",
    task: ["Definition", "Classification", "Supervised"],
    difficulty: "Beginner",
    summary: "A supervised learning task where an algorithm learns to categorize input data points into one or more predefined discrete classes or categories.",
    intuition: "Sorting Mail into Pigeonholes: When an envelope arrives, you read the recipient city and drop it into the designated box: 'New York', 'London', or 'Tokyo'. It can only go into distinct buckets — never 'halfway between New York and London'.",
    whenToUse: "When the target outcome is categorical: Yes/No, Fraud/Legitimate, Dog/Cat/Bird, Malignant/Benign, Churn/Retain.",
    whenToAvoid: "When the target is a continuous numeric number (e.g. house price in dollars or temperature in degrees — use Regression instead!).",
    requirements: {
      labeledTrainingData: true,
      discreteTargetClasses: true,
      evaluatesWithConfusionMatrix: true,
      calibratesProbabilities: true
    },
    parameters: [
      {
        name: "Binary Classification",
        type: "subtype",
        default: "2 classes",
        impact: "Predicts between two mutually exclusive outcomes: True/False, 0/1.",
        tuningTip: "Evaluate using ROC-AUC, Precision, and Recall rather than raw Accuracy."
      },
      {
        name: "Multiclass Classification",
        type: "subtype",
        default: ">2 classes",
        impact: "Predicts one single label out of three or more mutually exclusive classes (e.g. Red, Green, Blue).",
        tuningTip: "Use Categorical Cross-Entropy loss and Softmax output layer."
      },
      {
        name: "Multilabel Classification",
        type: "subtype",
        default: "Multiple labels",
        impact: "An instance can possess multiple categories simultaneously (e.g. a movie labeled both 'Action' and 'Sci-Fi').",
        tuningTip: "Use independent Sigmoid activations on each output neuron."
      }
    ],
    math: {
      formula: "ŷ = argmax_c P(Y = c | X)  where ∑ P(Y = c | X) = 1",
      loss: "Cross-Entropy Loss (Log-Loss): L = -∑ y_c · log(p_c)",
      explanation: "Classification models calculate confidence probabilities for each candidate class c, then choose the class with the maximum posterior probability."
    },
    pros: [
      "Directly maps to actionable binary or discrete business decisions (Approve / Reject Loan)",
      "Rich evaluation framework (Confusion Matrix, Precision, Recall, F1-Score, ROC curves)",
      "Outputs calibrated confidence scores to threshold risky edge cases"
    ],
    cons: [
      "Severely thrown off by class imbalance (e.g. 99.9% legit transactions vs 0.1% fraud)",
      "Threshold selection (default 0.5) must be custom-tuned to business risk tolerance"
    ],
    codeSnippet: `from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

# Labeled binary dataset: Email features [word_count, has_free_in_title] -> 1=Spam, 0=Ham
X = [[200, 0], [45, 1], [350, 0], [15, 1]]
y = [0, 1, 0, 1]

clf = LogisticRegression()
clf.fit(X, y)

new_email = [[30, 1]]
pred_class = clf.predict(new_email)
pred_prob = clf.predict_proba(new_email)[0]
print(f"Predicted: {'SPAM' if pred_class[0] == 1 else 'HAM'} (Confidence: {max(pred_prob):.1%})")`
  },

  {
    id: "what-is-regression",
    name: "What is Regression?",
    track: "fundamentals",
    category: "Core Tasks",
    task: ["Definition", "Regression", "Supervised"],
    difficulty: "Beginner",
    summary: "A supervised learning task where an algorithm learns to predict a continuous, quantity-based real number (scalar) based on one or more explanatory input features.",
    intuition: "Reading a Speedometer: Unlike a light switch that is either strictly ON or OFF (Classification), regression is like a dimmer dial or car speedometer that can measure any value: 45.2 mph, 68.0 mph, or 104.7 mph.",
    whenToUse: "When the prediction target is a quantitative amount: estimating property valuations ($), product demand counts, patient blood pressure, delivery times in minutes, or stock prices.",
    whenToAvoid: "When the target is a category or discrete choice (e.g. pass/fail or product brand — use Classification!).",
    requirements: {
      labeledContinuousTarget: true,
      evaluatesWithResiduals: true,
      sensitiveToScaleInLinear: true,
      unboundedNumericOutput: true
    },
    parameters: [
      {
        name: "Mean Squared Error (MSE)",
        type: "metric / loss",
        default: "(y - ŷ)²",
        impact: "Penalizes large prediction mistakes aggressively due to squaring.",
        tuningTip: "Use when big errors are catastrophic to your business."
      },
      {
        name: "Mean Absolute Error (MAE)",
        type: "metric / loss",
        default: "|y - ŷ|",
        impact: "Linear error penalty; much more robust to extreme outlier records.",
        tuningTip: "Use when data has anomalous spikes that shouldn't derail the model."
      },
      {
        name: "R-Squared (R²)",
        type: "metric",
        default: "[0.0 to 1.0]",
        impact: "The proportion of variance in the target variable explained by the model.",
        tuningTip: "1.0 means perfect predictions; 0.0 means no better than predicting the mean."
      }
    ],
    math: {
      formula: "ŷ = f(X) ∈ ℝ  (Continuous Real Number)   |   Residual: e_i = y_i - ŷ_i",
      loss: "MSE = (1/n) ∑ (y_i - ŷ_i)²   |   MAE = (1/n) ∑ |y_i - ŷ_i|",
      explanation: "Regression fits a curve through the training points such that the average distance (residual) between actual values and predicted values is minimized."
    },
    pros: [
      "Provides exact numerical forecasts that directly drive financial and logistical planning",
      "Model residuals can be easily plotted to diagnose non-linear patterns or heteroskedasticity",
      "Linear regression coefficients provide direct dollar-for-dollar interpretability"
    ],
    cons: [
      "Highly vulnerable to extreme outliers skewing the regression curve",
      "Cannot extrapolate trends accurately outside the min/max range seen in training data"
    ],
    codeSnippet: `from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# House features: [Square Footage, Bedrooms] -> Target: Price ($)
X = [[1200, 2], [1800, 3], [2400, 4], [3000, 5]]
y = [250000, 340000, 430000, 520000]

reg = LinearRegression()
reg.fit(X, y)

new_house = [[2100, 3]]
predicted_price = reg.predict(new_house)[0]
print(f"Predicted Price: \${predicted_price:,.2f}")`
  },

  {
    id: "what-is-dimensionality-reduction",
    name: "What is Dimensionality Reduction?",
    track: "fundamentals",
    category: "Core Tasks",
    task: ["Definition", "Dimensionality Reduction", "Unsupervised"],
    difficulty: "Beginner",
    summary: "The process of transforming data from a high-dimensional space into a lower-dimensional space while preserving as much meaningful variance, geometric structure, or information as possible.",
    intuition: "Photographing a 3D Statue: A statue lives in 3D space. When you snap a high-quality photograph, you project it onto a flat 2D photograph. You lost one dimension of depth, but almost all the recognizable details and shapes are preserved.",
    whenToUse: "When you have too many features (Curse of Dimensionality), when features are heavily correlated (multicollinearity), when downstream models train too slowly, or to visualize 100-dimensional data on a 2D/3D screen.",
    whenToAvoid: "When individual feature names and exact physical units must remain strictly interpretable to business stakeholders (compressed components lose their original names).",
    requirements: {
      highDimensionalData: true,
      preservesVarianceOrDistances: true,
      featureScalingRequired: true
    },
    parameters: [
      {
        name: "Linear (PCA)",
        type: "technique",
        default: "Global variance",
        impact: "Rotates axes to project data onto directions of maximum orthogonal variance.",
        tuningTip: "Fast, deterministic, and excellent for tabular preprocessing and compression."
      },
      {
        name: "Non-Linear (t-SNE & UMAP)",
        type: "technique",
        default: "Local neighborhood",
        impact: "Preserves local pairwise neighbor distances in 2D/3D embeddings.",
        tuningTip: "The gold standard for visualizing single-cell genomics, word embeddings, and image clusters."
      }
    ],
    math: {
      formula: "Projection: X_reduced = X_high · W  (where W contains top k eigenvectors)",
      loss: "Information Preservation: Maximize Tr(Wᵀ · Cov(X) · W)",
      explanation: "Transforms d-dimensional vectors into k-dimensional vectors (k << d) by finding an optimal projection matrix that minimizes reconstruction error."
    },
    pros: [
      "Defeats the Curse of Dimensionality (where distance metrics become equidistant)",
      "Speeds up training and inference times of downstream ML models by 10x-50x",
      "Enables humans to visually inspect high-dimensional clusters on a screen"
    ],
    cons: [
      "Transformed components become abstract mathematical mixtures, destroying feature interpretability",
      "Irreversible information loss: dropped dimensions can never be 100% recovered"
    ],
    codeSnippet: `from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import numpy as np

# 100 samples with 10 features each
X = np.random.randn(100, 10)

# Scale first (mandatory for PCA)
X_scaled = StandardScaler().fit_transform(X)

# Compress 10 features down to the 2 most informative dimensions
pca = PCA(n_components=2)
X_2d = pca.fit_transform(X_scaled)

print(f"Compressed from {X.shape[1]}D down to {X_2d.shape[1]}D!")
print(f"Variance Preserved: {sum(pca.explained_variance_ratio_):.1%}")`
  },

  {
    id: "supervised-vs-unsupervised",
    name: "Supervised vs Unsupervised vs Reinforcement Learning",
    track: "fundamentals",
    category: "Learning Paradigms",
    task: ["Definition", "Foundations", "Comparison"],
    difficulty: "Beginner",
    summary: "The three primary learning paradigms of machine learning, categorized by the presence, absence, or reward-based nature of feedback signals during training.",
    intuition: "Three Ways to Learn Guitar: 1) Supervised: A teacher sits next to you, corrects every wrong note immediately. 2) Unsupervised: You listen to 1,000 songs with no teacher and notice that certain chords naturally sound good together. 3) Reinforcement: You play on stage blindfolded; every time the crowd cheers you keep playing that riff, every time they boo you change it.",
    whenToUse: "Supervised: When historical labels exist. Unsupervised: When exploring raw unlabeled data. Reinforcement: When an agent must learn optimal sequential strategies through environment interaction.",
    whenToAvoid: "Trying to force supervised learning when annotating data is too expensive (use unsupervised or self-supervised instead).",
    requirements: {
      foundationalTaxonomy: true,
      determinesDataCollection: true
    },
    parameters: [
      {
        name: "Supervised Learning",
        type: "data setup",
        default: "Features (X) + Labels (y)",
        impact: "Direct error feedback between predicted ŷ and true label y.",
        tuningTip: "Regression and Classification."
      },
      {
        name: "Unsupervised Learning",
        type: "data setup",
        default: "Features (X) only",
        impact: "No labels; discovers clusters, hidden manifolds, and density distributions.",
        tuningTip: "Clustering and Dimensionality Reduction."
      },
      {
        name: "Reinforcement Learning",
        type: "data setup",
        default: "State, Action, Reward",
        impact: "Trial and error exploration in an interactive environment.",
        tuningTip: "Game agents, autonomous robots, trading algorithms."
      }
    ],
    math: {
      formula: "Supervised: min ∑ L(f(x_i), y_i)  |  Unsupervised: P(X) density  |  RL: max E[∑ γᵗ · r_t]",
      loss: "Comparison of Optimization Objectives",
      explanation: "Supervised minimizes label error; Unsupervised maximizes likelihood or minimizes reconstruction error; Reinforcement maximizes expected discounted future rewards."
    },
    pros: [
      "Provides the fundamental taxonomy to immediately frame any real-world problem",
      "Guides proper dataset collection and annotation budgets before writing code"
    ],
    cons: [
      "Boundaries can blur in modern AI (e.g. Self-Supervised Learning in LLMs generates its own labels from text)"
    ],
    codeSnippet: `# Paradigm Decision Tree in Code
def select_ml_paradigm(has_labels, is_interactive_env):
    if is_interactive_env:
        return "Reinforcement Learning (Agent learns via environmental rewards)"
    elif has_labels:
        return "Supervised Learning (Model learns from X -> y pairs)"
    else:
        return "Unsupervised Learning (Model discovers hidden patterns in X)"`
  },

  {
    id: "what-is-deep-learning",
    name: "What is Deep Learning (DL)?",
    track: "fundamentals",
    category: "Foundations & Overview",
    task: ["Definition", "Deep Learning", "Neural Networks"],
    difficulty: "Beginner",
    summary: "A subfield of Machine Learning based on Artificial Neural Networks with multiple representation layers (hence 'deep') that automatically discover and extract hierarchical features directly from raw data.",
    intuition: "Factory Assembly Line of Abstraction: In facial recognition, Layer 1 detects raw edges. Layer 2 combines edges into shapes (noses, eyes). Layer 3 combines shapes into full faces. The network builds its own understanding without any human manually defining what an eye looks like.",
    whenToUse: "Unstructured data (images, audio, video, natural language text, speech) or vast tabular datasets with millions of rows where classical models hit a performance plateau.",
    whenToAvoid: "Small tabular datasets (<20,000 samples) where tree ensembles (XGBoost, Random Forest) consistently outperform neural networks with 100x less compute.",
    requirements: {
      multiLayeredANNs: true,
      automaticFeatureExtraction: true,
      computationalIntensityGPU: true,
      dataHungry: true
    },
    parameters: [
      {
        name: "Depth (Layers)",
        type: "hyperparameter",
        default: "3 to 100+ layers",
        impact: "Number of hidden representation layers between input and output.",
        tuningTip: "Deeper networks can represent more abstract concepts, but risk vanishing gradients."
      },
      {
        name: "Activation Function",
        type: "component",
        default: "ReLU / GELU",
        impact: "Introduces non-linearity; allows network to learn complex curved relationships.",
        tuningTip: "Use ReLU for CNNs/MLPs, GELU for modern Transformers."
      },
      {
        name: "Feature Engineering vs Feature Learning",
        type: "paradigm",
        default: "Automated",
        impact: "Traditional ML requires hand-crafted features; Deep Learning learns representations end-to-end.",
        tuningTip: "Saves thousands of hours of manual domain feature extraction."
      }
    ],
    math: {
      formula: "h^(l) = σ( W^(l) · h^(l-1) + b^(l) )  where l = 1, 2, ..., L",
      loss: "Backpropagation via Multivariable Chain Rule: ∂L / ∂W",
      explanation: "Each layer performs an affine linear transformation followed by an element-wise non-linear activation $\\sigma$. Gradients flow backwards through all L layers via the chain rule to update synaptic weights."
    },
    pros: [
      "Powers cutting-edge generative AI, computer vision, speech recognition, and LLMs",
      "Performance keeps scaling higher as you feed more data and compute (no plateau)",
      "Zero requirement for manual feature engineering on raw images or text"
    ],
    cons: [
      "Extremely hungry for compute (requires specialized GPUs/TPUs and high electricity costs)",
      "Data voracious: easily overfits and performs terribly on small datasets",
      "Almost zero internal interpretability (complex black box)"
    ],
    codeSnippet: `import torch
import torch.nn as nn

# A "Deep" Neural Network has multiple hidden layers
class DeepNeuralNetwork(nn.Module):
    def __init__(self, input_dim=784, hidden_dim=128, output_dim=10):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),   # Layer 1: Detects low-level patterns
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),  # Layer 2: Detects mid-level patterns
            nn.ReLU(),
            nn.Linear(hidden_dim, output_dim)   # Layer 3: Output decision classes
        )
    def forward(self, x):
        return self.net(x)`
  },

  {
    id: "loss-vs-cost-function",
    name: "Loss Function vs Cost Function",
    track: "fundamentals",
    category: "Math & Optimization",
    task: ["Definition", "Foundations", "Optimization"],
    difficulty: "Beginner",
    summary: "The mathematical error metrics that quantify how wrong a model's predictions are compared to actual ground truth. Loss measures a single sample; Cost measures the entire dataset.",
    intuition: "The Compass of Machine Learning: Training a model is like steering a ship in thick fog. You cannot see the destination directly. The Cost Function is your compass needle: it tells you whether your ship is currently drifting closer to or farther away from port.",
    whenToUse: "Mandatory for every single machine learning and deep learning algorithm that uses optimization to learn its parameters.",
    whenToAvoid: "N/A (Without an error function, an algorithm has no mathematical objective to improve).",
    requirements: {
      differentiableForGradients: true,
      lowerIsBetter: true,
      guidesParameterUpdates: true
    },
    parameters: [
      {
        name: "Loss Function L(ŷ, y)",
        type: "scope",
        default: "Single Example",
        impact: "Computes the error for an individual prediction: e.g. L(ŷ_i, y_i).",
        tuningTip: "Binary Cross-Entropy for 1 sample: -[y·log(ŷ) + (1-y)·log(1-ŷ)]."
      },
      {
        name: "Cost Function J(θ)",
        type: "scope",
        default: "Full Dataset",
        impact: "The arithmetic mean (or sum) of the individual losses across all N training samples.",
        tuningTip: "J(θ) = (1/N) ∑ L(ŷ_i, y_i) + Regularization Penalty."
      }
    ],
    math: {
      formula: "Cost J(θ) = (1/N) ∑_{i=1}^N Loss( f(x_i; θ), y_i )",
      loss: "Empirical Risk Formulation",
      explanation: "Optimization algorithms (like Gradient Descent) compute the gradient with respect to the Cost Function J(θ) to nudge weights in the direction that lowers total error."
    },
    pros: [
      "Translates qualitative business goals ('make fewer mistakes') into rigorous calculus",
      "Custom loss functions allow penalizing specific business risks (e.g. 10x penalty for false negatives)"
    ],
    cons: [
      "Loss function must be mathematically smooth and differentiable for gradient-based methods (accuracy cannot be used directly as a loss because its derivative is zero everywhere!)"
    ],
    codeSnippet: `import numpy as np

# 1. Loss Function (Calculated on 1 single sample)
def single_sample_squared_loss(y_true, y_pred):
    return (y_true - y_pred) ** 2

# 2. Cost Function (Average loss across entire dataset)
def mean_squared_cost(y_true_array, y_pred_array):
    losses = (y_true_array - y_pred_array) ** 2
    return np.mean(losses)

y_actual = np.array([10.0, 20.0, 30.0])
y_predicted = np.array([12.0, 18.0, 35.0])
print(f"Total Cost J(theta): {mean_squared_cost(y_actual, y_predicted):.2f}")`
  },

  {
    id: "what-is-gradient-descent",
    name: "What is Gradient Descent?",
    track: "fundamentals",
    category: "Math & Optimization",
    task: ["Definition", "Optimization", "Foundations"],
    difficulty: "Beginner",
    summary: "The workhorse iterative optimization algorithm used to train machine learning and neural network models by repeatedly stepping in the direction of steepest downward descent of the cost function.",
    intuition: "Walking Down a Foggy Mountain Blindfolded: You are on top of a mountain in thick fog. You cannot see the valley floor. To find the bottom, you feel the slope of the ground with your boots and take a step in the direction that slopes downwards the steepest. Repeat until the ground is flat.",
    whenToUse: "Training models with parameters that cannot be solved with closed-form matrix inversion: Logistic Regression, Multi-Layer Perceptrons, CNNs, Transformers, Deep Reinforcement Learning.",
    whenToAvoid: "When exact analytical closed-form formulas exist for small datasets (e.g. OLS Linear Regression $(X^TX)^{-1}X^Ty$).",
    requirements: {
      differentiableCostFunction: true,
      requiresLearningRateTuning: true,
      iterativeConvergence: true
    },
    parameters: [
      {
        name: "Learning Rate (α / lr)",
        type: "hyperparameter",
        default: "0.001 - 0.01",
        impact: "Step size taken in the direction of the negative gradient.",
        tuningTip: "Too high: overshoots and diverges to infinity. Too low: takes millions of iterations to converge."
      },
      {
        name: "Batch Gradient Descent",
        type: "variant",
        default: "Full dataset",
        impact: "Calculates gradient using all N samples before every step. Very stable, but slow on big data.",
        tuningTip: "Great for small convex problems."
      },
      {
        name: "Stochastic Gradient Descent (SGD)",
        type: "variant",
        default: "1 sample per step",
        impact: "Calculates gradient on 1 random sample. Very fast, but noisy trajectory.",
        tuningTip: "Can escape local minima easily."
      },
      {
        name: "Mini-Batch SGD (Standard)",
        type: "variant",
        default: "32 to 512 samples",
        impact: "Calculates gradient on small batches. Combines hardware vectorization speed with stability.",
        tuningTip: "The universal industry standard for training modern deep learning."
      }
    ],
    math: {
      formula: "θ_new = θ_old - α · ∇_θ J(θ)",
      loss: "First-Order Iterative Optimization",
      explanation: "The gradient vector $\\nabla J(\\theta)$ points in the direction of steepest ascent (fastest increase in cost). Subtracting the gradient multiplied by step size $\\alpha$ moves parameters toward the minimum cost."
    },
    pros: [
      "Scales effortlessly to models with billions of parameters (like GPT-4)",
      "Universal optimizer applicable to almost any differentiable loss landscape"
    ],
    cons: [
      "Can get trapped in sub-optimal local minima or flat saddle points",
      "Sensitive to learning rate choice (mitigated by adaptive optimizers like Adam)"
    ],
    codeSnippet: `# Vanilla Gradient Descent from Scratch in 10 lines
import numpy as np

# Find minimum of J(w) = w^2 (True minimum is at w = 0)
w = 10.0          # Initial starting weight
learning_rate = 0.1

for step in range(25):
    gradient = 2 * w                 # dJ/dw = 2w
    w = w - (learning_rate * gradient) # Gradient update rule
    cost = w ** 2
    if step % 5 == 0:
        print(f"Step {step}: Weight = {w:.4f}, Cost = {cost:.4f}")`
  },

  {
    id: "what-is-feature-engineering",
    name: "What is Feature Engineering?",
    track: "fundamentals",
    category: "Data & Preprocessing",
    task: ["Definition", "Feature Engineering", "Preprocessing"],
    difficulty: "Beginner",
    summary: "The process of using domain knowledge to extract, select, combine, and transform raw data into informative numerical input variables (features) that make machine learning algorithms learn more effectively.",
    intuition: "Refining Crude Oil into Jet Fuel: Raw data from databases is like crude oil straight from the ground: full of sludge, irregular formats, and noise. Feature engineering is the refinery that distills it into high-octane aviation fuel so your engine (model) can fly.",
    whenToUse: "Mandatory for all classical tabular machine learning workflows (XGBoost, Random Forest, Scikit-learn). Quality features consistently beat fancy algorithms.",
    whenToAvoid: "Raw image pixels or raw audio waveforms fed into Deep CNNs/Transformers (deep learning models learn spatial and acoustic features automatically).",
    requirements: {
      domainKnowledge: true,
      mustPreventDataLeakage: true,
      alignsWithModelAssumptions: true
    },
    parameters: [
      {
        name: "Categorical Encoding",
        type: "technique",
        default: "One-Hot / Target",
        impact: "Converts text categories ('Paris', 'London') into numerical representations.",
        tuningTip: "Use One-Hot for low cardinality (<10); Target or Frequency encoding for high cardinality."
      },
      {
        name: "Date & Time Deconstruction",
        type: "technique",
        default: "Periodic cyclical",
        impact: "Extracts day_of_week, hour, is_weekend, is_holiday, and sine/cosine cyclical signals.",
        tuningTip: "Raw timestamp strings are useless; decomposed parts provide huge predictive signal."
      },
      {
        name: "Interaction Features",
        type: "technique",
        default: "Ratios / Multiplications",
        impact: "Combining features: e.g. Price / SquareFootage = PricePerSqFt.",
        tuningTip: "Ratios often expose the true physical or economic driver of a target."
      }
    ],
    math: {
      formula: "X_engineered = Φ( X_raw )",
      loss: "Representational Mapping",
      explanation: "Applies non-linear transformations $\\Phi$ that project non-separable raw input features into a transformed feature space where linear or tree boundaries can easily separate classes."
    },
    pros: [
      "The single biggest differentiator of winning models in competitive data science",
      "Allows simple linear models to capture complex non-linear domain dynamics",
      "Injects human domain expertise directly into the machine learning system"
    ],
    cons: [
      "Time-consuming and requires deep understanding of the business domain",
      "High risk of Data Leakage if features accidentally include future information"
    ],
    codeSnippet: `import pandas as pd

df = pd.DataFrame({
    'timestamp': ['2026-10-03 08:30:00', '2026-10-04 19:45:00'],
    'distance_km': [12.5, 3.2],
    'duration_minutes': [25, 40]
})

# FEATURE ENGINEERING EXAMPLES:
# 1. Parse DateTime into actionable signals
dt = pd.to_datetime(df['timestamp'])
df['hour'] = dt.dt.hour
df['is_weekend'] = dt.dt.dayofweek.isin([5, 6]).astype(int)

# 2. Domain ratio feature: Average speed in km/h
df['avg_speed_kmh'] = df['distance_km'] / (df['duration_minutes'] / 60)
print(df[['hour', 'is_weekend', 'avg_speed_kmh']])`
  },

  {
    id: "etl-vs-elt",
    name: "ETL vs ELT in Data Engineering",
    track: "fundamentals",
    category: "Data Pipelines",
    task: ["Definition", "Data Engineering", "Architecture"],
    difficulty: "Beginner",
    summary: "The two foundational paradigms for data integration pipelines, differing in whether raw data is transformed before or after being loaded into the target analytical data storage.",
    intuition: "Pre-cooked TV Dinners vs Open-Kitchen Buffet: In ETL, ingredients are chopped and cooked before entering the freezer (inflexible if you change your mind). In ELT, all raw ingredients are delivered straight into a state-of-the-art kitchen where chefs can cook whatever dish is requested on demand.",
    whenToUse: "ELT is the modern standard for cloud data warehouses (Snowflake, BigQuery, Databricks). ETL is used for legacy on-premise hardware or strict data privacy regulations where PII must be scrubbed before hitting storage.",
    whenToAvoid: "Do not use legacy ETL if you have modern cloud data warehouses with massive elastic SQL compute.",
    requirements: {
      dataMovementPattern: true,
      determinesStorageStrategy: true
    },
    parameters: [
      {
        name: "ETL (Extract -> Transform -> Load)",
        type: "paradigm",
        default: "Legacy / On-Prem",
        impact: "Data transformed on a separate compute server before arriving in the warehouse.",
        tuningTip: "Use when source data contains raw passwords/PII that cannot legally be stored."
      },
      {
        name: "ELT (Extract -> Load -> Transform)",
        type: "paradigm",
        default: "Modern Standard",
        impact: "Raw data loaded directly into storage; transformed inside the warehouse via SQL/dbt.",
        tuningTip: "Retains full historical raw data so transformations can be rewritten retroactively."
      }
    ],
    math: {
      formula: "ETL: Source -> ETL Server (Compute) -> Target  |  ELT: Source -> Target Storage -> SQL Engine (dbt)",
      loss: "Separation of Storage and Compute",
      explanation: "Cloud warehouses decouple cheap infinite object storage from on-demand compute clusters, making ELT faster, cheaper, and vastly more flexible than bottlenecked ETL servers."
    },
    pros: [
      "ELT never throws away raw data: you can re-transform past years of history at any time",
      "ELT leverages the massive distributed SQL processing power of modern cloud warehouses",
      "ETL protects privacy by never storing unmasked sensitive PII in analytical targets"
    ],
    cons: [
      "ELT stores larger volumes of raw data, increasing storage footprint slightly",
      "ETL pipeline changes require modifying and redeploying entire pipeline codebases"
    ],
    codeSnippet: `# Modern ELT Workflow Pattern with dbt & SQL
# Step 1: Extract & Load (e.g. Fivetran / Airbyte loads raw JSON into Snowflake)
# Step 2: Transform (Executed directly inside warehouse via SQL model):

"""
-- models/marts/fct_daily_revenue.sql
WITH raw_orders AS (
    SELECT * FROM {{ source('raw_store', 'orders') }}
)
SELECT 
    DATE_TRUNC('day', order_date) AS order_day,
    COUNT(DISTINCT order_id)     AS total_orders,
    SUM(amount)                  AS daily_gross_revenue
FROM raw_orders
WHERE status = 'COMPLETED'
GROUP BY 1
"""`
  },

  // ==========================================
  // TRACK: ML MODELS (SUPERVISED & UNSUPERVISED)
  // ==========================================
  {
    id: "random-forest",
    name: "Random Forest",
    track: "ml-models",
    category: "Ensemble / Bagging",
    task: ["Classification", "Regression"],
    difficulty: "Intermediate",
    summary: "An ensemble of decorrelated decision trees trained on bootstrap samples with random feature subsets.",
    intuition: "The Wisdom of the Crowd: Instead of asking one easily biased expert (a single decision tree), you ask a diverse committee of hundreds of trees and take the majority vote or average.",
    whenToUse: "Excellent first-choice baseline for tabular data. When you need high accuracy, low tuning effort, and robust protection against overfitting.",
    whenToAvoid: "Ultra-low-latency real-time inference requirements (evaluating 500 trees takes time) or high-dimensional sparse text data (where linear models excel).",
    requirements: {
      scalingRequired: false,
      handlesMissing: false,
      outlierSensitive: false,
      linearRelationship: false
    },
    parameters: [
      {
        name: "n_estimators",
        type: "int",
        default: "100",
        impact: "Controls number of trees built.",
        tuningTip: "More is almost always better and will not cause overfitting, but increases memory and inference time. 100 to 500 is typical."
      },
      {
        name: "max_depth",
        type: "int or None",
        default: "None",
        impact: "Limits the maximum depth of each tree.",
        tuningTip: "Leave as None or tune between 10-30 to prevent excessively deep individual trees and reduce model file size."
      },
      {
        name: "min_samples_split",
        type: "int or float",
        default: "2",
        impact: "Minimum number of samples required to split an internal node.",
        tuningTip: "Increase to 5-10 to combat overfitting on noisy datasets."
      },
      {
        name: "max_features",
        type: "string or int",
        default: "'sqrt' (clf), 1.0 (reg)",
        impact: "Number of features randomly sampled at each candidate split.",
        tuningTip: "Using 'sqrt' decorrelates the trees so one dominant feature does not take over every single tree."
      }
    ],
    math: {
      formula: "Var(Ensemble) = ρ·σ² + ((1 - ρ) / B)·σ²",
      loss: "Gini Impurity / Entropy (Classification) or MSE / MAE (Regression)",
      explanation: "By averaging B bootstrap trees with correlation ρ, the second term approaches zero as B grows large. The random feature subsampling directly shrinks correlation ρ, dramatically reducing overall variance without increasing bias."
    },
    pros: [
      "Extremely resistant to overfitting compared to standalone decision trees",
      "Requires virtually zero feature scaling (works seamlessly on raw tabular numbers)",
      "Handles non-linear feature interactions and categorical splits naturally",
      "Provides reliable built-in feature importance rankings (MDI / Permutation)"
    ],
    cons: [
      "Can result in large model file sizes (hundreds of megabytes for deep forests)",
      "Cannot extrapolate numerical trends beyond the min/max values seen during training",
      "Slower prediction throughput compared to lightweight linear models"
    ],
    codeSnippet: `from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Instantiate and fit
rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    max_features='sqrt',
    min_samples_split=5,
    random_state=42,
    n_jobs=-1
)
rf.fit(X_train, y_train)

# Inference & Feature Importance
preds = rf.predict(X_test)
print(classification_report(y_test, preds))`
  },

  {
    id: "xgboost",
    name: "XGBoost",
    track: "ml-models",
    category: "Ensemble / Boosting",
    task: ["Classification", "Regression", "Ranking"],
    difficulty: "Advanced",
    summary: "An optimized, highly scalable implementation of Gradient Boosted Decision Trees using exact second-order Taylor expansion.",
    intuition: "Iterative Learning from Mistakes: Each subsequent tree is explicitly constructed to predict the residual errors (gradients) left behind by all preceding trees, step by step.",
    whenToUse: "The gold standard for competitive tabular machine learning. Use when you need top-tier predictive accuracy and have clean feature sets.",
    whenToAvoid: "Extremely dirty uncleaned datasets with high noise, or when full model interpretability and simple coefficients are legally mandated.",
    requirements: {
      scalingRequired: false,
      handlesMissing: true, // Has native sparsity-aware split finding!
      outlierSensitive: true,
      linearRelationship: false
    },
    parameters: [
      {
        name: "learning_rate (eta)",
        type: "float",
        default: "0.3",
        impact: "Shrinkage factor applied to feature weights after each boost step.",
        tuningTip: "Lower values (0.01 to 0.1) prevent overfitting but require higher n_estimators."
      },
      {
        name: "max_depth",
        type: "int",
        default: "6",
        impact: "Maximum depth of a tree.",
        tuningTip: "Unlike Random Forest, keep this shallow (3 to 8). Deep boosted trees quickly overfit noise."
      },
      {
        name: "subsample",
        type: "float",
        default: "1.0",
        impact: "Subsample ratio of the training instances.",
        tuningTip: "Set to 0.7 - 0.85 to add stochastic variance reduction."
      },
      {
        name: "reg_lambda (L2) & reg_alpha (L1)",
        type: "float",
        default: "lambda=1, alpha=0",
        impact: "Regularization penalty on leaf weights.",
        tuningTip: "Increase reg_lambda to smooth extreme predictions; increase reg_alpha to induce feature sparsity."
      }
    ],
    math: {
      formula: "Obj^(t) ≈ ∑ [ g_i · f_t(x_i) + ½ · h_i · f_t²(x_i) ] + Ω(f_t)",
      loss: "Custom Objective + Regularization Ω(f) = γ·T + ½·λ·∑w_j²",
      explanation: "Uses 1st order gradients (g_i) and 2nd order Hessians (h_i) of the loss function via Taylor approximation, allowing exact closed-form optimal leaf weights and rapid convergence."
    },
    pros: [
      "State-of-the-art accuracy on almost every tabular benchmark dataset",
      "Native sparsity-aware split finding handles missing values automatically",
      "Built-in L1 and L2 regularization directly inside the objective function",
      "Hardware acceleration (CUDA GPU training, out-of-core memory streaming)"
    ],
    cons: [
      "Significant number of sensitive hyperparameters requiring careful tuning",
      "More prone to overfitting than Random Forest if learning_rate is too high",
      "Computationally demanding when running grid search without GPU"
    ],
    codeSnippet: `import xgboost as xgb
from sklearn.metrics import roc_auc_score

# Convert to DMatrix for optimal speed
dtrain = xgb.DMatrix(X_train, label=y_train)
dtest = xgb.DMatrix(X_test, label=y_test)

params = {
    'objective': 'binary:logistic',
    'eval_metric': 'auc',
    'learning_rate': 0.05,
    'max_depth': 5,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'reg_lambda': 2.0
}

# Early stopping prevents overfitting automatically
model = xgb.train(
    params,
    dtrain,
    num_boost_round=1000,
    evals=[(dtest, 'val')],
    early_stopping_rounds=30
)`
  },

  {
    id: "logistic-regression",
    name: "Logistic Regression",
    track: "ml-models",
    category: "Generalized Linear Models",
    task: ["Classification"],
    difficulty: "Beginner",
    summary: "A linear model for binary or multiclass classification that models log-odds using the sigmoid / softmax function.",
    intuition: "Draws a straight linear decision boundary through feature space and converts the distance to that line into a calibrated probability between 0% and 100%.",
    whenToUse: "When you need well-calibrated probabilities, instant inference speed, full interpretability (odds ratios), or have high-dimensional text data.",
    whenToAvoid: "When the true relationship between input features and output labels is heavily non-linear and you cannot engineer manual interaction features.",
    requirements: {
      scalingRequired: true,
      handlesMissing: false,
      outlierSensitive: true,
      linearRelationship: true
    },
    parameters: [
      {
        name: "C",
        type: "float",
        default: "1.0",
        impact: "Inverse of regularization strength (1 / λ).",
        tuningTip: "Smaller values specify stronger regularization. Test log-scale: [0.001, 0.01, 0.1, 1, 10, 100]."
      },
      {
        name: "penalty",
        type: "string",
        default: "'l2'",
        impact: "Specifies norm used in penalization ('l1', 'l2', 'elasticnet', 'none').",
        tuningTip: "Use 'l1' for automated feature selection (driving uninformative weights strictly to 0)."
      },
      {
        name: "solver",
        type: "string",
        default: "'lbfgs'",
        impact: "Algorithm used in the optimization problem.",
        tuningTip: "Use 'lbfgs' for multiclass/small data; 'saga' for large datasets or L1 penalty."
      }
    ],
    math: {
      formula: "P(Y=1|X) = σ(wᵀx + b) = 1 / (1 + e^{-(wᵀx + b)})",
      loss: "Binary Cross-Entropy (Log-Loss): L = -∑ [y·log(p) + (1-y)·log(1-p)]",
      explanation: "Computes the dot product of weights and input features to obtain log-odds, then applies the non-linear Sigmoid activation to squeeze output strictly into the [0, 1] probability range."
    },
    pros: [
      "Blazing fast inference and low memory footprint (ideal for edge or high-QPS APIs)",
      "Coefficients provide direct interpretability as multiplicative changes in log-odds",
      "Provides well-calibrated confidence probabilities out of the box",
      "Less prone to overfitting in low-sample high-feature environments when regularized"
    ],
    cons: [
      "Strict assumption of linear decision boundaries in log-odds space",
      "Extremely sensitive to unscaled features and extreme outliers",
      "Cannot capture feature interactions unless explicitly engineered"
    ],
    codeSnippet: `from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

# Pipelines guarantee feature scaling without data leakage
clf = make_pipeline(
    StandardScaler(),
    LogisticRegression(C=0.5, penalty='l2', solver='lbfgs', max_iter=1000)
)
clf.fit(X_train, y_train)

# Probabilistic output
probs = clf.predict_proba(X_test)[:, 1]`
  },

  {
    id: "linear-regression",
    name: "Linear Regression (OLS & Regularized)",
    track: "ml-models",
    category: "Linear Models",
    task: ["Regression"],
    difficulty: "Beginner",
    summary: "Models the scalar relationship between continuous dependent target and one or more explanatory features using a linear equation.",
    intuition: "Finding the best-fitting straight line (or flat hyperplane) that minimizes the sum of squared vertical distances from all data points to the line.",
    whenToUse: "Baseline benchmark for continuous numerical targets; when business stakeholders require transparent impact coefficients per unit feature.",
    whenToAvoid: "When target variable has complex curved relationships, multi-modality, or heavy skewed anomalies.",
    requirements: {
      scalingRequired: true, // (Critical when using Ridge/Lasso regularization)
      handlesMissing: false,
      outlierSensitive: true,
      linearRelationship: true
    },
    parameters: [
      {
        name: "alpha (Ridge/Lasso)",
        type: "float",
        default: "1.0",
        impact: "Regularization strength multiplier.",
        tuningTip: "Higher alpha shrinks coefficients closer to zero to combat collinearity and overfitting."
      },
      {
        name: "fit_intercept",
        type: "bool",
        default: "True",
        impact: "Whether to calculate the intercept (bias term b) for this model.",
        tuningTip: "Keep True unless your data is already centered around zero."
      }
    ],
    math: {
      formula: "ŷ = w₁x₁ + w₂x₂ + ... + wₙxₙ + b = Xw",
      loss: "MSE: (1/n)∑(y - ŷ)² + λ||w||₂² (Ridge) or λ||w||₁ (Lasso)",
      explanation: "Ordinary Least Squares finds the closed-form analytical solution w = (XᵀX)⁻¹Xᵀy. Ridge adds a diagonal penalty to guarantee matrix invertibility even under severe multicollinearity."
    },
    pros: [
      "Simple to implement, interpret, and mathematically understand",
      "Analytical closed-form solution exists without iterative training loops",
      "Provides statistical significance tests (p-values, t-stats, R-squared)"
    ],
    cons: [
      "Severely thrown off by extreme outlier observations",
      "Prone to massive multicollinearity problems if features are correlated",
      "Underfits heavily when target behavior is non-linear"
    ],
    codeSnippet: `from sklearn.linear_model import RidgeCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

# RidgeCV automatically finds optimal alpha via efficient cross-validation
model = make_pipeline(
    StandardScaler(),
    RidgeCV(alphas=[0.01, 0.1, 1.0, 10.0, 100.0])
)
model.fit(X_train, y_train)
print(f"Optimal Alpha: {model.named_steps['ridgecv'].alpha_}")`
  },

  {
    id: "svm",
    name: "Support Vector Machines (SVM)",
    track: "ml-models",
    category: "Kernel Methods",
    task: ["Classification", "Regression"],
    difficulty: "Intermediate",
    summary: "Finds the optimal separating hyperplane that maximizes the margin (distance) between distinct classes, utilizing kernel tricks for non-linear spaces.",
    intuition: "Street Sweeper with Maximum Safety Margin: Instead of just any line separating two groups, SVM builds the widest possible highway between them, supported only by the critical borderline points (support vectors).",
    whenToUse: "Medium-sized datasets with clear margins of separation, image classification benchmarks, bioinformatics, or high-dimensional gene expression arrays.",
    whenToAvoid: "Massive datasets with >100,000 samples (quadratic/cubic training time complexity $O(n^2)$ to $O(n^3)$), or heavily overlapping classes.",
    requirements: {
      scalingRequired: true,
      handlesMissing: false,
      outlierSensitive: true,
      linearRelationship: false // When using non-linear kernels like RBF
    },
    parameters: [
      {
        name: "C",
        type: "float",
        default: "1.0",
        impact: "Regularization parameter (slack penalty tradeoff).",
        tuningTip: "Large C allows fewer misclassifications (narrow margin, risks overfitting); small C creates a wider margin (more tolerant to margin violations)."
      },
      {
        name: "kernel",
        type: "string",
        default: "'rbf'",
        impact: "Kernel type ('linear', 'poly', 'rbf', 'sigmoid').",
        tuningTip: "Use 'rbf' (Radial Basis Function) as default for non-linear data; 'linear' for text classification."
      },
      {
        name: "gamma",
        type: "string or float",
        default: "'scale'",
        impact: "Kernel coefficient for 'rbf', 'poly', and 'sigmoid'.",
        tuningTip: "High gamma leads to high variance (tight curvature around individual training samples); low gamma creates smoother boundaries."
      }
    ],
    math: {
      formula: "K(x, x') = exp(-γ · ||x - x'||²)",
      loss: "Hinge Loss: L = max(0, 1 - y · (wᵀx + b)) + (1/2C) · ||w||²",
      explanation: "The Kernel Trick projects input vectors into an infinite-dimensional Hilbert space where previously non-separable classes become linearly separable, without ever explicitly computing the high-dimensional coordinates."
    },
    pros: [
      "Effective in high-dimensional spaces (e.g. number of features > samples)",
      "Memory efficient: decision boundary depends strictly on a small subset of support vectors",
      "Versatile thanks to customizable kernel functions"
    ],
    cons: [
      "Extremely slow to train on datasets larger than tens of thousands of samples",
      "Does not directly provide probability estimates (requires expensive Platt scaling)",
      "Hyperparameters (C and gamma) require intensive search"
    ],
    codeSnippet: `from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

svm = make_pipeline(
    StandardScaler(),
    SVC(kernel='rbf', C=10.0, gamma='scale', probability=True)
)
svm.fit(X_train, y_train)`
  },

  {
    id: "knn",
    name: "k-Nearest Neighbors (k-NN)",
    track: "ml-models",
    category: "Instance-Based / Lazy Learning",
    task: ["Classification", "Regression"],
    difficulty: "Beginner",
    summary: "A non-parametric, lazy learning algorithm that predicts the target based on the majority label or mean of the k closest data points in feature space.",
    intuition: "Birds of a Feather Flock Together: Tell me who your 5 closest neighbors are, and I'll tell you what you are.",
    whenToUse: "Simple baseline, recommendation systems (item-to-item similarity), anomaly detection, or imputation of missing feature values.",
    whenToAvoid: "High-dimensional data (Curse of Dimensionality renders distances meaningless) or high-throughput production environments with millions of records.",
    requirements: {
      scalingRequired: true, // (Absolute must - unscaled features ruin distance metrics!)
      handlesMissing: false,
      outlierSensitive: true,
      linearRelationship: false
    },
    parameters: [
      {
        name: "n_neighbors (k)",
        type: "int",
        default: "5",
        impact: "Number of nearest neighbors to consult.",
        tuningTip: "Small k (e.g. 1) captures noise (overfitting); large k creates oversmoothed boundaries (underfitting). Pick odd numbers to avoid ties."
      },
      {
        name: "weights",
        type: "string",
        default: "'uniform'",
        impact: "Weight function used in prediction ('uniform' or 'distance').",
        tuningTip: "Use 'distance' to give closer neighbors more voting influence than distant ones."
      },
      {
        name: "metric",
        type: "string",
        default: "'minkowski' (p=2 Euclidean)",
        impact: "Distance metric used ('euclidean', 'manhattan', 'cosine').",
        tuningTip: "Use 'cosine' for sparse text/embeddings, 'manhattan' for grid-like or high-dimensional features."
      }
    ],
    math: {
      formula: "d(p, q) = √[ ∑ (p_i - q_i)² ] (Euclidean Metric)",
      loss: "Non-parametric (No explicit loss minimization phase during training)",
      explanation: "Training is $O(1)$ because it merely memorizes the dataset. Prediction is $O(N \\cdot D)$ because calculating pairwise distances across $N$ stored samples of dimension $D$ is required for every query."
    },
    pros: [
      "Zero training time (lazy evaluation)",
      "Intuitively simple to explain and inspect predictions",
      "Naturally adapts to multi-modal class clusters"
    ],
    cons: [
      "Extremely slow inference time during production querying",
      "High memory storage footprint (must keep entire training dataset in RAM)",
      "Severely degraded by the Curse of Dimensionality"
    ],
    codeSnippet: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

knn = make_pipeline(
    StandardScaler(),
    KNeighborsClassifier(n_neighbors=7, weights='distance', metric='euclidean')
)
knn.fit(X_train, y_train)`
  },

  {
    id: "kmeans",
    name: "K-Means Clustering",
    track: "ml-models",
    category: "Unsupervised Clustering",
    task: ["Clustering", "Customer Segmentation"],
    difficulty: "Beginner",
    summary: "Partitions n observations into k predefined clusters where each point belongs to the cluster with the nearest mean (centroid).",
    intuition: "Territorial Expansion: Place k flags randomly on a map. Everyone joins the nearest flag. Flags move to the physical center of their new group. Repeat until flags stop moving.",
    whenToUse: "Customer segmentation, document grouping, image color quantization, and creating cluster-distance features for downstream supervised models.",
    whenToAvoid: "When clusters have arbitrary curved shapes (rings/moons), wildly varying densities, or when the number of clusters k is completely unpredictable.",
    requirements: {
      scalingRequired: true,
      handlesMissing: false,
      outlierSensitive: true,
      linearRelationship: false
    },
    parameters: [
      {
        name: "n_clusters (k)",
        type: "int",
        default: "8",
        impact: "The number of clusters to form as well as the number of centroids to generate.",
        tuningTip: "Use the Elbow Method (inertia vs k) or Silhouette Analysis to find the optimal k."
      },
      {
        name: "init",
        type: "string",
        default: "'k-means++'",
        impact: "Method for initialization of starting centroids.",
        tuningTip: "Keep 'k-means++' to avoid sub-optimal local minima convergence."
      },
      {
        name: "n_init",
        type: "int",
        default: "10",
        impact: "Number of time the k-means algorithm will run with different centroid seeds.",
        tuningTip: "Higher values ensure best convergence at the cost of slight compute."
      }
    ],
    math: {
      formula: "Inertia (WCSS) = ∑_j=1^k ∑_x∈S_j ||x - μ_j||²",
      loss: "Within-Cluster Sum of Squares (WCSS)",
      explanation: "Alternates between Expectation step (assigning each point to closest centroid $\\mu_j$) and Maximization step (recomputing centroid $\\mu_j$ as arithmetic mean of all assigned members)."
    },
    pros: [
      "Fast and scalable algorithm with linear computational complexity $O(n \\cdot k \\cdot d)$",
      "Easy to interpret cluster boundaries via Voronoi cells",
      "Can easily classify new unseen data points by measuring distance to learned centroids"
    ],
    cons: [
      "User must guess or experimentally tune k in advance",
      "Assumes clusters are spherical and isotropic (fails on oblong or concentric clusters)",
      "Outliers drag centroids away from true density centers"
    ],
    codeSnippet: `from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

kmeans = KMeans(n_clusters=4, init='k-means++', n_init=10, random_state=42)
cluster_labels = kmeans.fit_predict(X_scaled)
score = silhouette_score(X_scaled, cluster_labels)
print(f"Silhouette Score: {score:.3f}")`
  },

  {
    id: "pca",
    name: "Principal Component Analysis (PCA)",
    track: "ml-models",
    category: "Dimensionality Reduction",
    task: ["Dimensionality Reduction", "Feature Extraction", "Data Visualization"],
    difficulty: "Intermediate",
    summary: "An orthogonal linear transformation that transforms data to a new coordinate system such that the greatest variance lies on the first coordinate (PC1).",
    intuition: "Casting the Most Informative Shadow: Imagine a 3D object. PCA finds the exact camera angle that captures the maximum silhouette detail when flattened into a 2D picture.",
    whenToUse: "Compressing high-dimensional data (e.g. 500 features $\\to$ 20), speeding up downstream models, eliminating multicollinearity, or 2D/3D visualization.",
    whenToAvoid: "When non-linear manifold relationships dominate (use t-SNE or UMAP instead) or when original feature names must remain individually interpretable.",
    requirements: {
      scalingRequired: true, // (Critical - high-variance unscaled features will dominate PC1!)
      handlesMissing: false,
      outlierSensitive: true,
      linearRelationship: true
    },
    parameters: [
      {
        name: "n_components",
        type: "int or float",
        default: "None",
        impact: "Number of components to retain or percentage of variance to explain.",
        tuningTip: "Pass a float between 0.0 and 1.0 (e.g. 0.95) to automatically retain enough components to preserve 95% of total variance."
      },
      {
        name: "whiten",
        type: "bool",
        default: "False",
        impact: "Whether to scale component vectors to unit variance.",
        tuningTip: "Set to True if feeding components into models sensitive to feature scales (like SVM)."
      }
    ],
    math: {
      formula: "Cov(X) = (1/n) · XᵀX = V · Λ · Vᵀ (Eigenvalue Decomposition)",
      loss: "Reconstruction Error: ||X - X_reconstructed||²",
      explanation: "Computes the covariance matrix of mean-centered data. The eigenvectors (columns of V) define the principal axes directions, while the eigenvalues ($\\Lambda$) measure the variance explained along each axis."
    },
    pros: [
      "Completely removes multicollinearity between features (components are strictly orthogonal)",
      "Dramatically reduces memory requirements and downstream training durations",
      "Preserves global data structure effectively"
    ],
    cons: [
      "Principal components are linear combinations of all original features, destroying interpretability",
      "Only captures linear relationships; blind to complex non-linear manifolds"
    ],
    codeSnippet: `from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Retain 95% of cumulative explained variance
pca = PCA(n_components=0.95)
X_reduced = pca.fit_transform(X_scaled)
print(f"Original shape: {X.shape[1]} features -> Reduced: {X_reduced.shape[1]} components")`
  },

  // ==========================================
  // TRACK: DATA ENGINEERING & STORAGE
  // ==========================================
  {
    id: "parquet-format",
    name: "Apache Parquet vs CSV / JSON",
    track: "data-eng",
    category: "Storage & File Formats",
    task: ["Data Storage", "OLAP", "Big Data"],
    difficulty: "Beginner",
    summary: "An open-source, columnar storage format optimized for analytical queries (OLAP) with built-in compression and metadata stats.",
    intuition: "Spreadsheet Slicing: CSV stores row-by-row (reading 1 column requires scanning every single byte on disk). Parquet stores column-by-column, so queries only read the exact columns requested.",
    whenToUse: "The absolute standard storage format for data lakes (AWS S3, GCP Cloud Storage), Spark, DuckDB, Snowflake, BigQuery, and ML training sets.",
    whenToAvoid: "Transactional OLTP workloads where individual rows are frequently inserted, updated, or deleted one at a time (use PostgreSQL or MySQL).",
    requirements: {
      readOptimized: true,
      writeOptimized: false,
      supportsCompression: true,
      schemaEvolution: true
    },
    parameters: [
      {
        name: "compression",
        type: "string",
        default: "'SNAPPY'",
        impact: "Block-level compression algorithm.",
        tuningTip: "'SNAPPY' provides ultra-fast decompression for interactive queries; 'ZSTD' gives higher compression ratio for archiving."
      },
      {
        name: "row_group_size",
        type: "int (bytes)",
        default: "128 MB",
        impact: "Size of chunked rows written together.",
        tuningTip: "128MB to 512MB is standard for distributed systems like Spark to match HDFS/cloud block sizes."
      }
    ],
    math: {
      formula: "I/O Reduction = ∑ (Query Columns Size) / ∑ (Total Table Columns Size)",
      loss: "Column Projection & Predicate Pushdown",
      explanation: "Includes footer metadata containing min/max values for every column chunk. When a query contains `WHERE age > 65`, queries instantly skip entire 128MB row groups without reading them."
    },
    pros: [
      "Reduces cloud storage costs by up to 75-90% compared to raw CSV/JSON",
      "10x to 100x faster query execution through column projection and dictionary encoding",
      "Strict schema enforcement prevents silent data corruption"
    ],
    cons: [
      "Binary format (cannot be opened directly in a regular text editor)",
      "Append-only; updating or mutating existing rows requires rewriting the entire file"
    ],
    codeSnippet: `import duckdb
import pandas as pd

# Write DataFrame to snappy compressed parquet
df = pd.DataFrame({'user_id': range(100000), 'revenue': [99.5] * 100000})
df.to_parquet('analytics.parquet', compression='snappy', index=False)

# Query column directly without loading full file into memory
con = duckdb.connect()
res = con.execute("SELECT AVG(revenue) FROM 'analytics.parquet' WHERE user_id > 50000").df()`
  },

  {
    id: "apache-kafka",
    name: "Apache Kafka",
    track: "data-eng",
    category: "Streaming & Messaging",
    task: ["Streaming", "Event-Driven Architecture", "Ingestion"],
    difficulty: "Advanced",
    summary: "A distributed event streaming platform capable of handling trillions of events a day with low-latency append-only commit logs.",
    intuition: "The Central Nervous System: Producers publish events into partitioned conveyor belts (topics). Consumers read at their own pace without deleting the events.",
    whenToUse: "Real-time data ingestion, microservices decoupling, Change Data Capture (CDC), and feeding real-time ML feature pipelines.",
    whenToAvoid: "Simple synchronous request-response RPC, or when you just need a lightweight job queue with task acking (RabbitMQ or Redis may be simpler).",
    requirements: {
      realTime: true,
      highThroughput: true,
      durableStorage: true,
      orderedPerPartition: true
    },
    parameters: [
      {
        name: "partitions",
        type: "int",
        default: "1",
        impact: "Unit of parallelism within a topic.",
        tuningTip: "Kafka only guarantees strict message ordering within a single partition. More partitions allow more parallel consumer threads."
      },
      {
        name: "replication_factor",
        type: "int",
        default: "1",
        impact: "Number of broker copies storing the partition.",
        tuningTip: "Set to 3 in production across different failure zones for zero data loss."
      },
      {
        name: "acks",
        type: "string",
        default: "'all'",
        impact: "Number of acknowledgments producer requires before considering request complete.",
        tuningTip: "Use 'all' (or -1) with min.insync.replicas=2 for strict financial/audit durability."
      }
    ],
    math: {
      formula: "Throughput = Partitions × (Sequential Disk Write Speed: ~600 MB/s)",
      loss: "Zero-Copy Data Transfer (sendfile system call)",
      explanation: "Avoids copying data between kernel and user-space memory buffers, streaming data straight from the Linux OS page cache to network sockets via `sendfile()`."
    },
    pros: [
      "Insane throughput (millions of messages/sec) through sequential disk I/O and batching",
      "Consumers are fully decoupled and can replay past historical events by rewinding offsets",
      "Built-in fault tolerance and multi-datacenter replication"
    ],
    cons: [
      "Operational overhead (broker management, ZooKeeper / KRaft quorum)",
      "Strict message ordering is ONLY guaranteed within the same partition, not across topics"
    ],
    codeSnippet: `from confluent_kafka import Producer, Consumer
import json

# Producer Setup
p = Producer({'bootstrap.servers': 'localhost:9092'})
event = {'user': 'alice', 'action': 'checkout', 'amount': 149.99}

p.produce('user-events', key='alice', value=json.dumps(event))
p.flush()

# Consumer reading streaming events
c = Consumer({
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'fraud-detection-service',
    'auto.offset.reset': 'earliest'
})
c.subscribe(['user-events'])`
  },

  {
    id: "apache-spark",
    name: "Apache Spark",
    track: "data-eng",
    category: "Distributed Compute",
    task: ["Distributed ETL", "Batch Processing", "Big Data ML"],
    difficulty: "Advanced",
    summary: "A unified analytics engine for large-scale distributed data processing using in-memory Resilient Distributed Datasets (RDDs) and DataFrames.",
    intuition: "Orchestra of Supercomputers: Instead of one machine crashing on a 2-terabyte dataset, Spark breaks the data into chunks, assigns them to 100 worker machines in parallel, and coordinates the computation.",
    whenToUse: "Petabyte-scale ETL pipelines, complex distributed join operations, batch feature engineering for ML, and large-scale data cleansing.",
    whenToAvoid: "Datasets that comfortably fit in single-node machine memory (<16 GB). For smaller data, use DuckDB or Polars which are 10x faster and simpler.",
    requirements: {
      distributed: true,
      inMemoryCompute: true,
      lazyEvaluation: true,
      faultTolerant: true
    },
    parameters: [
      {
        name: "spark.executor.memory",
        type: "string",
        default: "1g",
        impact: "Amount of memory to allocate for each executor process.",
        tuningTip: "Typically 16G-32G per executor to prevent heavy Java Garbage Collection pauses."
      },
      {
        name: "spark.sql.shuffle.partitions",
        type: "int",
        default: "200",
        impact: "Default number of partitions used when shuffling data for joins or aggregations.",
        tuningTip: "Enable Adaptive Query Execution (AQE) in Spark 3+ (`spark.sql.adaptive.enabled=true`) to let Spark tune this automatically."
      }
    ],
    math: {
      formula: "Transformation -> Directed Acyclic Graph (DAG) -> Stages -> Tasks",
      loss: "Catalyst Optimizer & Tungsten Engine",
      explanation: "Transformations (.filter, .select, .groupBy) are completely lazy and build an execution plan. Catalyst optimizes the logical plan (pushing filters down) before execution begins."
    },
    pros: [
      "Processes massive data volumes that exceed single-machine memory capacity",
      "Unified API supporting SQL, DataFrames, Streaming, GraphX, and MLlib",
      "Automatic failover: if one worker node crashes, Spark recalculates only the lost chunk"
    ],
    cons: [
      "High cluster infrastructure costs and cluster tuning complexity",
      "Significant latency overhead for small queries (startup time of Spark JVMs)"
    ],
    codeSnippet: `from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg

spark = SparkSession.builder \\
    .appName("FeatureEngineering") \\
    .config("spark.sql.adaptive.enabled", "true") \\
    .getOrCreate()

# Read distributed parquet
df = spark.read.parquet("s3a://data-lake/raw_transactions/")

# Transformation: Group by merchant and compute aggregation
features = df.filter(col("status") == "SUCCESS") \\
             .groupBy("merchant_id") \\
             .agg(avg("amount").alias("avg_transaction_amt"))

features.write.mode("overwrite").parquet("s3a://data-lake/features/merchant_agg/")`
  },

  {
    id: "lakehouse-architecture",
    name: "Data Lakehouse (Delta Lake / Iceberg)",
    track: "data-eng",
    category: "Architecture & Data Management",
    task: ["Architecture", "Data Governance", "ACID Transactions"],
    difficulty: "Intermediate",
    summary: "A modern architecture that combines the low storage cost of Data Lakes with the ACID transactional integrity and schema enforcement of Data Warehouses.",
    intuition: "Best of Both Worlds: Keeps raw data cheaply on object storage (like AWS S3) formatted as Parquet, but layers a transaction commit log on top to guarantee database-like reliability.",
    whenToUse: "Building modern scalable enterprise data platforms where both BI analysts (SQL) and Data Scientists (ML) query the exact same single source of truth.",
    whenToAvoid: "When you have a small startup application with only a couple hundred megabytes of data in a standard Postgres database.",
    requirements: {
      acidTransactions: true,
      timeTravel: true,
      schemaEvolution: true,
      lowCostStorage: true
    },
    parameters: [
      {
        name: "target-file-size",
        type: "string",
        default: "128MB - 512MB",
        impact: "Target size when compacting small files.",
        tuningTip: "Run `OPTIMIZE / VACUUM` commands regularly to solve the dreaded 'small file problem'."
      }
    ],
    math: {
      formula: "Lakehouse = Cheap Object Store (S3/GCS) + Parquet Data + ACID Metadata Log",
      loss: "Multi-Version Concurrency Control (MVCC)",
      explanation: "Readers never block writers. New transactions write new immutable Parquet files and commit an atomic entry to the transaction log, enabling instant Time Travel to past timestamps."
    },
    pros: [
      "Eliminates dual-hop ETL architecture (no need to copy data from Lake to Warehouse)",
      "Time Travel allows querying historical data versions for exact ML model reproducibility",
      "Full ACID transactions prevent corrupted partial writes from pipeline failures"
    ],
    cons: [
      "Requires routine maintenance (compaction and vacuuming of expired files)",
      "Slightly higher query latency than dedicated in-memory data warehouses for simple queries"
    ],
    codeSnippet: `from delta import configure_spark_with_delta_pip
from pyspark.sql import SparkSession

builder = SparkSession.builder.appName("LakehouseDemo") \\
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
spark = configure_spark_with_delta_pip(builder).getOrCreate()

# Time Travel: Query data exactly as it existed yesterday!
df_historical = spark.read.format("delta") \\
    .option("timestampAsOf", "2026-10-02 00:00:00") \\
    .load("/mnt/lakehouse/silver_customers")`
  },

  {
    id: "airflow",
    name: "Apache Airflow (DAGs)",
    track: "data-eng",
    category: "Orchestration & Workflow",
    task: ["Orchestration", "Scheduling", "ETL Pipelines"],
    difficulty: "Intermediate",
    summary: "A programmatic platform to author, schedule, and monitor workflows as Directed Acyclic Graphs (DAGs) in pure Python.",
    intuition: "The Master Conductor: Ensures Task B (cleaning data) only runs after Task A (downloading data) succeeds. If Task A fails, it retries, sends an alert, and pauses the pipeline.",
    whenToUse: "Orchestrating complex enterprise batch pipelines, scheduled model retraining jobs, database syncs, and multi-system dependencies.",
    whenToAvoid: "Streaming or sub-second event-driven triggers (Airflow is designed for scheduled batch orchestration, not real-time event routing).",
    requirements: {
      pythonCodeAsConfiguration: true,
      dependencyTracking: true,
      backfillingSupport: true,
      retryLogic: true
    },
    parameters: [
      {
        name: "schedule_interval",
        type: "cron or timedelta",
        default: "'@daily'",
        impact: "Defines when and how often the pipeline executes.",
        tuningTip: "Use standard 5-part cron syntax for precise scheduling."
      },
      {
        name: "retries",
        type: "int",
        default: "0",
        impact: "Number of automated retries before marking task failed.",
        tuningTip: "Set to 2 or 3 with `retry_delay=timedelta(minutes=5)` to withstand transient network spikes."
      }
    ],
    math: {
      formula: "DAG = G(V, E) where Vertices = Tasks, Edges = Dependencies (No cycles allowed)",
      loss: "Topological Sort Execution",
      explanation: "Airflow computes the topological order of tasks. A task only shifts from SCHEDULED to QUEUED once all upstream parent vertices finish in the SUCCESS state."
    },
    pros: [
      "Workflows defined as standard Python code (version controlled with Git, modular, testable)",
      "Extensive ecosystem of pre-built operators (Snowflake, AWS, GCP, Slack, Spark)",
      "Robust web UI for inspecting task logs, Gantt charts, and backfilling history"
    ],
    cons: [
      "Scheduler overhead makes running sub-minute micro-tasks inefficient",
      "Airflow is an orchestrator, NOT an execution engine (heavy data should be computed in Spark/Snowflake, not Airflow workers)"
    ],
    codeSnippet: `from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data_team',
    'retries': 2,
    'retry_delay': timedelta(minutes=5)
}

with DAG(
    dag_id='ml_feature_pipeline',
    default_args=default_args,
    start_date=datetime(2026, 1, 1),
    schedule='@daily',
    catchup=False
) as dag:
    
    extract_task = PythonOperator(task_id='extract_raw_data', python_callable=extract_fn)
    transform_task = PythonOperator(task_id='transform_features', python_callable=transform_fn)
    train_task = PythonOperator(task_id='retrain_model', python_callable=train_fn)

    # Clean dependency syntax
    extract_task >> transform_task >> train_task`
  },

  // ==========================================
  // TRACK: CORE ML FOUNDATIONS
  // ==========================================
  {
    id: "bias-variance-tradeoff",
    name: "Bias-Variance Tradeoff",
    track: "ml-core",
    category: "ML Theory & Diagnostics",
    task: ["Diagnostics", "Generalization", "Model Tuning"],
    difficulty: "Beginner",
    summary: "The fundamental conflict in machine learning between a model's ability to minimize error on the training set (bias) versus its stability across unseen test sets (variance).",
    intuition: "The Archer's Dilemma: High Bias is aiming consistently at the wrong target (underfitting). High Variance is shaking hands, hitting all over the place (overfitting). You want low bias and low variance.",
    whenToUse: "Diagnosing whether your model underfits or overfits by comparing Training Error vs Validation Error.",
    whenToAvoid: "N/A (This is a foundational law of all statistical learning algorithms).",
    requirements: {
      diagnosticPrinciple: true,
      guidesRegularization: true
    },
    parameters: [
      {
        name: "Model Complexity",
        type: "conceptual",
        default: "Balanced",
        impact: "Determines flexibility of the model hypothesis space.",
        tuningTip: "If Training Error is high -> High Bias (increase complexity). If Training Error is low but Validation Error is high -> High Variance (regularize, add data)."
      }
    ],
    math: {
      formula: "E[(y - ŷ)²] = [Bias(ŷ)]² + Var(ŷ) + σ² (Irreducible Error)",
      loss: "Decomposition of Expected Prediction Error",
      explanation: "Irreducible error $\\sigma^2$ is intrinsic noise in the data universe. You can only trade off between Bias (erroneous model assumptions) and Variance (excessive sensitivity to small fluctuations in training data)."
    },
    pros: [
      "Provides the ultimate conceptual roadmap for diagnosing model failure modes",
      "Directly informs whether you need more data, regularization, or a more expressive model"
    ],
    cons: [
      "Cannot be directly computed analytically for complex real-world models (must estimate via cross-validation)"
    ],
    codeSnippet: `# Diagnostic Heuristic in Code
def diagnose_model(train_score, val_score, threshold=0.08):
    if train_score < 0.70:
        return "HIGH BIAS (Underfitting): Model is too simple. Add features, decrease regularization."
    elif (train_score - val_score) > threshold:
        return "HIGH VARIANCE (Overfitting): Model memorized training noise. Add data, increase regularization."
    else:
        return "HEALTHY GENERALIZATION: Model is well balanced!"`
  },

  {
    id: "feature-scaling",
    name: "Feature Scaling (Standard vs Min-Max)",
    track: "ml-core",
    category: "Preprocessing & Feature Engineering",
    task: ["Data Preprocessing", "Feature Engineering"],
    difficulty: "Beginner",
    summary: "Techniques to transform numerical features onto a common scale to prevent features with large magnitudes from dominating distance and gradient computations.",
    intuition: "Comparing Apples to Elephants: If feature A is 'Age' (20 to 80) and feature B is 'Salary' ($30,000 to $200,000), distance algorithms will treat Salary as 3,000x more important unless scaled.",
    whenToUse: "Mandatory for gradient descent models (Logistic/Linear, Neural Nets) and distance-based models (k-NN, SVM, K-Means, PCA).",
    whenToAvoid: "Tree-based algorithms (Decision Trees, Random Forest, XGBoost) are invariant to monotonic transformations and do not need scaling.",
    requirements: {
      mustFitOnTrainOnly: true, // Prevents Data Leakage!
      preservesOutliersWithRobust: true
    },
    parameters: [
      {
        name: "StandardScaler",
        type: "method",
        default: "μ=0, σ=1",
        impact: "Z-score transformation.",
        tuningTip: "Best default for normally distributed features and models with gradient descent."
      },
      {
        name: "MinMaxScaler",
        type: "method",
        default: "[0, 1]",
        impact: "Bounds features between fixed min and max.",
        tuningTip: "Best for image pixels or algorithms that require strictly positive values."
      },
      {
        name: "RobustScaler",
        type: "method",
        default: "Median, IQR",
        impact: "Uses median and interquartile range.",
        tuningTip: "Use when data contains severe outliers that would distort standard mean/variance."
      }
    ],
    math: {
      formula: "Standard: z = (x - μ) / σ   |   Min-Max: x_norm = (x - x_min) / (x_max - x_min)",
      loss: "Zero Mean & Unit Variance Transformation",
      explanation: "Centers data around 0 with unit standard deviation. This transforms spherical loss contours, preventing gradient descent from oscillating wildly back and forth."
    },
    pros: [
      "Accelerates gradient descent convergence by orders of magnitude",
      "Ensures regularized penalties (L1/L2) penalize all features equitably"
    ],
    cons: [
      "Destroys original physical units of measurement ($ dollars, kg, miles)",
      "Fitting scalers on the entire dataset before train/test splitting causes severe Data Leakage"
    ],
    codeSnippet: `from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# CRITICAL: fit ONLY on training data, then transform both!
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)`
  },

  // ==========================================
  // TRACK: DEEP LEARNING
  // ==========================================
  {
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
  },

  // ==========================================
  // TRACK: MLOPS & PRODUCTION
  // ==========================================
  {
    id: "model-data-drift",
    name: "Model & Data Drift Monitoring",
    track: "mlops",
    category: "Monitoring & Governance",
    task: ["Production Monitoring", "Drift Detection", "Reliability"],
    difficulty: "Intermediate",
    summary: "Methods to detect when the statistical distribution of input data changes (Data Drift) or when the relationship between inputs and targets shifts over time (Concept Drift).",
    intuition: "Silent Model Rot: A fraud detection model trained in 2019 works brilliantly until 2020 lockdowns completely change consumer shopping behavior overnight without any code crashing.",
    whenToUse: "Mandatory for every production machine learning model deployed to real users.",
    whenToAvoid: "Static closed systems with immutable data distributions (e.g. physics simulations).",
    requirements: {
      continuousTelemetry: true,
      baselineReferenceData: true,
      statisticalTesting: true
    },
    parameters: [
      {
        name: "PSI (Population Stability Index)",
        type: "metric",
        default: "< 0.1",
        impact: "Measures shift between reference and current distribution.",
        tuningTip: "PSI < 0.1: No shift; 0.1 - 0.2: Moderate shift; > 0.2: Significant drift detected, trigger retraining."
      },
      {
        name: "KS Test (Kolmogorov-Smirnov)",
        type: "statistical test",
        default: "p-value < 0.05",
        impact: "Detects if continuous feature distribution has diverged.",
        tuningTip: "Compare production streaming window against baseline training distribution."
      }
    ],
    math: {
      formula: "PSI = ∑ [ (Actual% - Expected%) × ln(Actual% / Expected%) ]",
      loss: "Kullback-Leibler (KL) Divergence / PSI",
      explanation: "Compares current production feature distributions against the golden reference baseline. When distance metrics cross a designated threshold, alerts notify engineers to retrain."
    },
    pros: [
      "Prevents models from silently making disastrous predictions in production",
      "Enables automated continuous retraining triggers based on empirical statistical alerts"
    ],
    cons: [
      "Ground truth labels may be delayed by weeks (e.g. loan defaults take months to observe), forcing reliance on proxy metrics"
    ],
    codeSnippet: `from scipy.stats import ks_2samp

# Compare reference training feature vs live production data
stat, p_value = ks_2samp(train_features['age'], live_prod_features['age'])

if p_value < 0.05:
    print(f"⚠️ DATA DRIFT DETECTED (p={p_value:.5f})! Triggering Airflow Retraining DAG.")
else:
    print("✅ Distribution stable.")`
  },

  // ==========================================
  // TRACK: EVALUATION METRICS (Dedicated Entries)
  // ==========================================
  {
    id: "rmse-metric",
    name: "Root Mean Squared Error (RMSE)",
    track: "ml-core",
    category: "Evaluation Metrics",
    task: ["Regression", "Metrics", "Evaluation"],
    difficulty: "Beginner",
    summary: "The square root of the average of squared differences between predicted and actual values. Expressed in the same units as the target variable, making it directly interpretable.",
    intuition: "The Average Mistake Ruler: MSE squares errors, making them hard to interpret (e.g., 'dollars squared'). RMSE takes the square root to convert back to the original unit: '$45.20 average prediction error'.",
    whenToUse: "The most popular regression metric. Use when large errors are disproportionately costly (e.g., predicting house prices where a $100K error is much worse than two $50K errors).",
    whenToAvoid: "When outlier errors should NOT be penalized more than small errors (use MAE instead).",
    requirements: {
      regressionMetric: true,
      penalizesLargeErrors: true,
      sameUnitsAsTarget: true
    },
    parameters: [
      {
        name: "Squaring Effect",
        type: "property",
        default: "Quadratic penalty",
        impact: "Errors of 10 contribute 100 to MSE; errors of 1 contribute only 1. Large outliers dominate.",
        tuningTip: "If your data has extreme outliers, consider MAE or Huber Loss instead."
      },
      {
        name: "Comparison with MAE",
        type: "diagnostic",
        default: "RMSE ≥ MAE always",
        impact: "When RMSE >> MAE, it signals the presence of large outlier prediction errors.",
        tuningTip: "Track both RMSE and MAE together to diagnose whether errors are uniformly distributed."
      }
    ],
    math: {
      formula: "RMSE = √( (1/n) ∑ᵢ (yᵢ - ŷᵢ)² )",
      loss: "Root of Mean Squared Error",
      explanation: "First computes the mean of squared residuals (MSE), then takes the square root to restore the original measurement unit. This makes RMSE directly comparable to the target variable scale."
    },
    pros: [
      "Same physical units as the target variable (dollars, kg, minutes)",
      "Heavily penalizes large prediction mistakes, which is desirable in safety-critical applications",
      "The most widely reported regression metric in academic papers and Kaggle competitions"
    ],
    cons: [
      "Extremely sensitive to outlier observations (a single huge error can inflate RMSE dramatically)",
      "Not robust for skewed error distributions"
    ],
    codeSnippet: `from sklearn.metrics import mean_squared_error
import numpy as np

y_actual = np.array([100, 200, 300, 400, 500])
y_predicted = np.array([110, 190, 310, 380, 520])

mse = mean_squared_error(y_actual, y_predicted)
rmse = np.sqrt(mse)
# Or in sklearn >= 1.4:
# rmse = mean_squared_error(y_actual, y_predicted, squared=False)

print(f"MSE:  {mse:.2f}")
print(f"RMSE: {rmse:.2f} (same units as target!)")`
  },

  {
    id: "r2-score",
    name: "R² Score (Coefficient of Determination)",
    track: "ml-core",
    category: "Evaluation Metrics",
    task: ["Regression", "Metrics", "Evaluation"],
    difficulty: "Beginner",
    summary: "Measures the proportion of variance in the dependent variable that is predictable from the independent variables. Ranges from -∞ to 1.0, where 1.0 means perfect predictions.",
    intuition: "The Report Card Grade: R² = 0.85 means your model explains 85% of why the target varies. The remaining 15% is unexplained noise, missing features, or randomness your model cannot capture.",
    whenToUse: "Comparing models on the same dataset. Understanding how much of the target's behavior is captured by your features.",
    whenToAvoid: "Comparing models across different datasets (R² is dataset-dependent). Also misleading for non-linear models evaluated on tiny samples.",
    requirements: {
      regressionMetric: true,
      normalizedScore: true,
      comparedToMeanBaseline: true
    },
    parameters: [
      {
        name: "R² = 1.0",
        type: "interpretation",
        default: "Perfect",
        impact: "Model predictions exactly match all actual values with zero residual error.",
        tuningTip: "Suspiciously perfect R² (0.99+) often indicates data leakage or overfitting."
      },
      {
        name: "R² = 0.0",
        type: "interpretation",
        default: "Baseline",
        impact: "Model performs no better than simply predicting the mean of y for every single observation.",
        tuningTip: "Your features provide zero predictive information beyond the average."
      },
      {
        name: "R² < 0",
        type: "interpretation",
        default: "Worse than mean",
        impact: "Model performs WORSE than the trivial mean-baseline. Actively harmful predictions.",
        tuningTip: "Indicates a fundamentally broken model, wrong features, or severe overfitting."
      },
      {
        name: "Adjusted R²",
        type: "variant",
        default: "Penalizes extra features",
        impact: "Adjusts R² downward when adding features that do not genuinely improve predictions.",
        tuningTip: "Use Adjusted R² when comparing models with different numbers of features to avoid rewarding complexity."
      }
    ],
    math: {
      formula: "R² = 1 - ( SS_res / SS_tot )  where SS_res = ∑(yᵢ - ŷᵢ)²  and  SS_tot = ∑(yᵢ - ȳ)²",
      loss: "Proportion of Explained Variance",
      explanation: "SS_tot is the total variance of y (how spread out the actual values are). SS_res is the leftover error after modeling. R² computes what fraction of total spread your model successfully explains."
    },
    pros: [
      "Scale-independent: can compare performance across targets with different units",
      "Intuitive interpretation as percentage of variance explained",
      "Built into virtually every regression evaluation library"
    ],
    cons: [
      "Always increases (or stays same) when adding more features, even useless ones (use Adjusted R²)",
      "Can be misleading when the true relationship is non-linear but appears high due to scale"
    ],
    codeSnippet: `from sklearn.metrics import r2_score

y_actual =    [100, 200, 300, 400, 500]
y_predicted = [110, 190, 310, 380, 520]

r2 = r2_score(y_actual, y_predicted)
print(f"R² Score: {r2:.4f}")
print(f"Interpretation: Model explains {r2*100:.1f}% of target variance")`
  },

  {
    id: "mae-metric",
    name: "Mean Absolute Error (MAE)",
    track: "ml-core",
    category: "Evaluation Metrics",
    task: ["Regression", "Metrics", "Evaluation"],
    difficulty: "Beginner",
    summary: "The arithmetic mean of all absolute differences between predicted and actual values. Each error contributes proportionally, regardless of magnitude.",
    intuition: "The Fair Judge: Unlike RMSE which goes crazy over one big mistake, MAE treats every error equally. If 100 predictions are off by $5 and one is off by $500, MAE won't let that single outlier dominate.",
    whenToUse: "When all errors should be weighted equally. When your dataset contains extreme outliers that should not disproportionately influence model evaluation.",
    whenToAvoid: "When large errors are truly catastrophic and must be penalized more heavily (use RMSE or custom weighted loss).",
    requirements: {
      regressionMetric: true,
      outlierRobust: true,
      linearPenalty: true
    },
    parameters: [
      {
        name: "Robustness to Outliers",
        type: "property",
        default: "Linear penalty",
        impact: "An error of 100 contributes exactly 100 (not 10,000 like in MSE).",
        tuningTip: "Preferred metric for real estate, financial, and IoT time-series models with spike noise."
      },
      {
        name: "Median Absolute Error",
        type: "variant",
        default: "Even more robust",
        impact: "Uses the median instead of mean, completely immune to any number of extreme outliers.",
        tuningTip: "Use sklearn's median_absolute_error for extremely noisy datasets."
      }
    ],
    math: {
      formula: "MAE = (1/n) ∑ᵢ |yᵢ - ŷᵢ|",
      loss: "L1 Loss / Mean Absolute Deviation",
      explanation: "Takes absolute value of each residual (removing sign), then averages. No squaring means outliers have proportional influence rather than exponential."
    },
    pros: [
      "Highly robust to extreme outlier errors in the dataset",
      "Easy to interpret: 'On average, predictions are off by X units'",
      "Same units as the target variable"
    ],
    cons: [
      "The absolute value function is not differentiable at zero (requires subgradients)",
      "Treats all errors equally, which may not reflect real-world cost asymmetries"
    ],
    codeSnippet: `from sklearn.metrics import mean_absolute_error, median_absolute_error

y_actual =    [100, 200, 300, 400, 500]
y_predicted = [110, 190, 310, 380, 520]

mae = mean_absolute_error(y_actual, y_predicted)
med_ae = median_absolute_error(y_actual, y_predicted)

print(f"MAE: {mae:.2f}")
print(f"Median AE: {med_ae:.2f} (even more robust to outliers)")`
  },

  {
    id: "roc-auc",
    name: "ROC Curve & AUC Score",
    track: "ml-core",
    category: "Evaluation Metrics",
    task: ["Classification", "Metrics", "Evaluation"],
    difficulty: "Intermediate",
    summary: "The Receiver Operating Characteristic (ROC) curve plots True Positive Rate vs False Positive Rate at every possible classification threshold. AUC (Area Under Curve) summarizes overall discriminative ability as a single number from 0 to 1.",
    intuition: "The Universal Dial Test: Instead of evaluating your model at just one threshold (0.5), ROC-AUC tests it at EVERY possible threshold from 0.0 to 1.0 and summarizes overall quality. AUC = 0.5 means random coin flip; AUC = 1.0 means perfect separation.",
    whenToUse: "Binary classification evaluation, especially when class distributions are imbalanced. Comparing models independently of threshold choice.",
    whenToAvoid: "Multiclass problems (requires one-vs-rest adaptation). When precision at specific thresholds matters more than overall ranking (use Precision-Recall curves instead).",
    requirements: {
      classificationMetric: true,
      thresholdIndependent: true,
      requiresProbabilityOutput: true
    },
    parameters: [
      {
        name: "TPR (True Positive Rate / Recall)",
        type: "axis",
        default: "Y-axis",
        impact: "TP / (TP + FN) — Proportion of actual positives correctly identified.",
        tuningTip: "High TPR = catching most positives (but possibly at the cost of more false alarms)."
      },
      {
        name: "FPR (False Positive Rate)",
        type: "axis",
        default: "X-axis",
        impact: "FP / (FP + TN) — Proportion of actual negatives incorrectly flagged as positive.",
        tuningTip: "Low FPR = fewer false alarms (but possibly missing true positives)."
      },
      {
        name: "AUC Interpretation",
        type: "metric",
        default: "[0.5 - 1.0]",
        impact: "Probability that the model ranks a randomly chosen positive higher than a randomly chosen negative.",
        tuningTip: "AUC > 0.9: Excellent | 0.8-0.9: Good | 0.7-0.8: Fair | < 0.7: Poor discrimination."
      }
    ],
    math: {
      formula: "AUC = ∫₀¹ TPR(FPR) d(FPR)  =  P(score(positive) > score(negative))",
      loss: "Area Under ROC Curve",
      explanation: "ROC-AUC measures the model's ability to rank positive examples above negative examples across all possible decision thresholds. It equals the probability that a randomly chosen positive sample scores higher than a randomly chosen negative sample."
    },
    pros: [
      "Threshold-independent: evaluates model quality across all possible operating points",
      "Robust to class imbalance compared to raw accuracy",
      "Single scalar number (AUC) makes model comparison straightforward"
    ],
    cons: [
      "Can be overly optimistic on severely imbalanced datasets (use PR-AUC instead)",
      "Does not tell you which specific threshold to deploy in production"
    ],
    codeSnippet: `from sklearn.metrics import roc_auc_score, roc_curve
import matplotlib.pyplot as plt

# Model probability outputs (not hard labels!)
y_true = [0, 0, 1, 1, 0, 1, 0, 1]
y_scores = [0.1, 0.4, 0.35, 0.8, 0.2, 0.9, 0.3, 0.85]

auc = roc_auc_score(y_true, y_scores)
fpr, tpr, thresholds = roc_curve(y_true, y_scores)

print(f"AUC Score: {auc:.3f}")

# Plot ROC Curve
plt.plot(fpr, tpr, label=f'Model (AUC = {auc:.3f})')
plt.plot([0, 1], [0, 1], 'k--', label='Random (AUC = 0.5)')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve')
plt.legend()
plt.show()`
  },

  {
    id: "log-loss",
    name: "Log-Loss (Binary Cross-Entropy)",
    track: "ml-core",
    category: "Evaluation Metrics",
    task: ["Classification", "Metrics", "Evaluation", "Optimization"],
    difficulty: "Intermediate",
    summary: "A loss function that measures the performance of a classification model whose output is a probability between 0 and 1. It penalizes confident wrong predictions exponentially more than uncertain ones.",
    intuition: "The Confidence Punisher: If your model says '99% positive' and the truth is negative, Log-Loss gives a catastrophic penalty. If it says '55% positive' and is wrong, the penalty is mild. It rewards well-calibrated humility.",
    whenToUse: "Training and evaluating probabilistic classifiers (Logistic Regression, Neural Networks). When you care about the quality of probability calibration, not just hard label accuracy.",
    whenToAvoid: "When only hard class labels matter and probability quality is irrelevant.",
    requirements: {
      classificationMetric: true,
      probabilisticOutput: true,
      differentiable: true,
      usedAsLossFunction: true
    },
    parameters: [
      {
        name: "Perfect Score",
        type: "value",
        default: "0.0",
        impact: "Log-Loss = 0 when model predicts 100% probability for the correct class every time.",
        tuningTip: "Lower is better. Typical good values range from 0.2 to 0.5."
      },
      {
        name: "Clipping",
        type: "technique",
        default: "clip(ŷ, 1e-15, 1-1e-15)",
        impact: "Prevents log(0) = -∞ numerical explosion.",
        tuningTip: "Sklearn and PyTorch handle this automatically, but be careful in custom implementations."
      }
    ],
    math: {
      formula: "LogLoss = -(1/n) ∑ [ yᵢ · log(ŷᵢ) + (1-yᵢ) · log(1-ŷᵢ) ]",
      loss: "Negative Log-Likelihood / Binary Cross-Entropy",
      explanation: "When y=1, only the term -log(ŷ) activates: high predicted probability gives low loss. When y=0, only -log(1-ŷ) activates. The log function creates an asymptotic penalty curve: confident wrong predictions are punished infinitely more than uncertain ones."
    },
    pros: [
      "Differentiable everywhere, making it perfect as a training loss for gradient descent",
      "Heavily penalizes overconfident incorrect predictions, encouraging calibration",
      "The standard loss function for logistic regression and classification neural networks"
    ],
    cons: [
      "Sensitive to class imbalance (can be mitigated with class weights)",
      "Requires probability outputs, not just hard class labels"
    ],
    codeSnippet: `from sklearn.metrics import log_loss
import numpy as np

y_true = [1, 0, 1, 1, 0]

# Well-calibrated model
y_pred_good = [0.9, 0.1, 0.8, 0.95, 0.05]
# Overconfident wrong model
y_pred_bad =  [0.9, 0.9, 0.8, 0.2, 0.1]

print(f"Good Model Log-Loss: {log_loss(y_true, y_pred_good):.4f}")
print(f"Bad Model Log-Loss:  {log_loss(y_true, y_pred_bad):.4f}")
# Lower is better!`
  },

  {
    id: "silhouette-score",
    name: "Silhouette Score (Clustering Evaluation)",
    track: "ml-core",
    category: "Evaluation Metrics",
    task: ["Clustering", "Metrics", "Evaluation", "Unsupervised"],
    difficulty: "Intermediate",
    summary: "Measures how similar an object is to its own cluster (cohesion) compared to other clusters (separation). Ranges from -1 to +1, where higher values indicate well-defined, separated clusters.",
    intuition: "Friendship Quality Score: For each person, measure: 'How close am I to my friend group?' minus 'How close am I to the nearest rival group?' If you're way closer to your friends than to strangers, your silhouette is high.",
    whenToUse: "Evaluating clustering quality when no ground truth labels exist. Finding optimal k in K-Means using Silhouette Analysis.",
    whenToAvoid: "Density-based clusters with arbitrary shapes (DBSCAN clusters may get unfairly low scores because silhouette assumes convex shapes).",
    requirements: {
      unsupervisedMetric: true,
      noLabelsRequired: true,
      distanceBased: true
    },
    parameters: [
      {
        name: "Score ≈ +1",
        type: "interpretation",
        default: "Excellent",
        impact: "Points are very close to their own cluster and very far from neighboring clusters.",
        tuningTip: "Well-separated, tight clusters."
      },
      {
        name: "Score ≈ 0",
        type: "interpretation",
        default: "Ambiguous",
        impact: "Points are on or near the boundary between two clusters.",
        tuningTip: "Overlapping clusters or wrong k value."
      },
      {
        name: "Score < 0",
        type: "interpretation",
        default: "Misassigned",
        impact: "Points are closer to a different cluster than their assigned cluster.",
        tuningTip: "Points may have been assigned to the wrong cluster."
      }
    ],
    math: {
      formula: "s(i) = (b(i) - a(i)) / max(a(i), b(i))",
      loss: "Cohesion vs Separation Ratio",
      explanation: "a(i) = average distance from point i to all other points in its own cluster (intra-cluster). b(i) = minimum average distance from point i to all points in any other cluster (nearest-cluster). The formula normalizes the difference to [-1, +1]."
    },
    pros: [
      "No ground truth labels needed — works purely on geometric cluster quality",
      "Provides per-sample scores allowing identification of individual misassigned points",
      "Intuitive interpretation: higher is always better"
    ],
    cons: [
      "Computationally expensive: O(n²) pairwise distance calculations",
      "Biased toward convex (spherical) clusters; penalizes arbitrary-shaped clusters unfairly"
    ],
    codeSnippet: `from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, silhouette_samples

# Try different k values and find the best
best_k, best_score = 2, -1
for k in range(2, 8):
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)
    score = silhouette_score(X_scaled, labels)
    print(f"k={k}: Silhouette = {score:.3f}")
    if score > best_score:
        best_k, best_score = k, score

print(f"\\nOptimal k = {best_k} with Silhouette = {best_score:.3f}")`
  },

  {
    id: "confusion-matrix-concept",
    name: "Confusion Matrix (Complete Guide)",
    track: "ml-core",
    category: "Evaluation Metrics",
    task: ["Classification", "Metrics", "Evaluation", "Definition"],
    difficulty: "Beginner",
    summary: "A 2×2 (binary) or N×N (multiclass) table that cross-tabulates every prediction against the true label, revealing exactly where and how a classifier makes mistakes.",
    intuition: "The Detective's Evidence Board: Instead of just saying 'the model is 90% accurate', the Confusion Matrix shows the full crime scene: How many sick patients were missed? How many healthy patients were wrongly alarmed? Every type of mistake is exposed.",
    whenToUse: "Mandatory diagnostic for every classification task. Essential when different types of errors have vastly different real-world costs (e.g., missing cancer vs false alarm).",
    whenToAvoid: "Never avoid it — always inspect the confusion matrix before trusting accuracy alone.",
    requirements: {
      classificationDiagnostic: true,
      revealsMistakeTypes: true,
      foundationForAllMetrics: true
    },
    parameters: [
      {
        name: "True Positive (TP)",
        type: "quadrant",
        default: "Correct detection",
        impact: "Model predicted positive AND the truth is positive. The hit.",
        tuningTip: "Maximize TP to increase both Precision and Recall."
      },
      {
        name: "True Negative (TN)",
        type: "quadrant",
        default: "Correct rejection",
        impact: "Model predicted negative AND the truth is negative. The correct pass.",
        tuningTip: "Contributes to Accuracy and Specificity."
      },
      {
        name: "False Positive (FP) — Type I Error",
        type: "quadrant",
        default: "False alarm",
        impact: "Model predicted positive BUT the truth is negative. Crying wolf.",
        tuningTip: "Hurts Precision. Critical in spam filters (legitimate email sent to junk)."
      },
      {
        name: "False Negative (FN) — Type II Error",
        type: "quadrant",
        default: "Missed detection",
        impact: "Model predicted negative BUT the truth is positive. The silent killer.",
        tuningTip: "Hurts Recall. Critical in medical screening (sending a sick patient home)."
      }
    ],
    math: {
      formula: "Accuracy = (TP+TN)/(TP+TN+FP+FN) | Precision = TP/(TP+FP) | Recall = TP/(TP+FN)",
      loss: "Foundation of All Classification Metrics",
      explanation: "Every classification metric (Accuracy, Precision, Recall, F1, Specificity, FPR) is computed directly from the four quadrants of the Confusion Matrix. It's the single most important diagnostic tool."
    },
    pros: [
      "Exposes exactly WHERE the model fails (false positives vs false negatives)",
      "Reveals class imbalance problems that accuracy alone completely hides",
      "Foundation for computing Precision, Recall, F1, Specificity, and ROC curves"
    ],
    cons: [
      "Only shows results at a single threshold (use ROC curve for all thresholds)",
      "N×N multiclass matrices become hard to read visually for many classes"
    ],
    codeSnippet: `from sklearn.metrics import confusion_matrix, classification_report
import numpy as np

y_true = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0]
y_pred = [1, 0, 0, 1, 0, 1, 1, 0, 1, 0]

cm = confusion_matrix(y_true, y_pred)
tn, fp, fn, tp = cm.ravel()

print(f"Confusion Matrix:")
print(f"  TP={tp}  FP={fp}")
print(f"  FN={fn}  TN={tn}")
print(f"\\nPrecision: {tp/(tp+fp):.2f}")
print(f"Recall:    {tp/(tp+fn):.2f}")
print(f"\\n{classification_report(y_true, y_pred)}")`
  },

  // ==========================================
  // TRACK: PREPROCESSING & IMPUTATION
  // ==========================================
  {
    id: "knn-imputer",
    name: "KNNImputer (k-Nearest Neighbors Imputation)",
    track: "ml-core",
    category: "Preprocessing & Imputation",
    task: ["Preprocessing", "Missing Data", "Imputation"],
    difficulty: "Intermediate",
    summary: "Fills missing values in a dataset by computing the weighted average (or most frequent value) of the k-nearest neighboring samples that DO have non-missing values for that feature.",
    intuition: "Ask Your Neighbors: Imagine a student's Math exam score is missing. Instead of filling it with the class average (SimpleImputer), KNNImputer looks at the 5 most similar students (same Science score, same English score) and averages THEIR Math scores.",
    whenToUse: "When missing values are NOT random and nearby samples in feature space provide strong predictive signal. When relationships between features are important.",
    whenToAvoid: "Very large datasets (KNNImputer is O(n²) per query). When missingness is completely random (SimpleImputer with mean/median is sufficient and 100x faster).",
    requirements: {
      scalingRequired: true,
      handlesNumerical: true,
      computationallyExpensive: true
    },
    parameters: [
      {
        name: "n_neighbors",
        type: "int",
        default: "5",
        impact: "Number of nearest neighbors to use for imputation.",
        tuningTip: "Small k (1-3) captures local patterns but is noisy. Larger k (10-20) smooths more but may lose local signal."
      },
      {
        name: "weights",
        type: "string",
        default: "'uniform'",
        impact: "Weight function: 'uniform' (equal weight) or 'distance' (closer neighbors contribute more).",
        tuningTip: "Use 'distance' for better results when feature distributions have variable density."
      },
      {
        name: "metric",
        type: "string",
        default: "'nan_euclidean'",
        impact: "Distance metric that handles NaN values by computing partial distances.",
        tuningTip: "nan_euclidean automatically ignores missing dimensions when computing distances."
      }
    ],
    math: {
      formula: "x_missing = (1/k) ∑ⱼ wⱼ · x_neighbor_j  (weighted average of k nearest non-missing values)",
      loss: "Distance-Weighted Neighborhood Imputation",
      explanation: "For each missing value, KNNImputer finds the k nearest samples (using non-missing features) and imputes the missing value as the (optionally weighted) average of those neighbors' corresponding feature values."
    },
    pros: [
      "Leverages correlations between features to produce smarter imputations",
      "No assumption about data distribution (non-parametric)",
      "Handles multiple missing features per row"
    ],
    cons: [
      "O(n²) computational complexity for large datasets (slow on >50K samples)",
      "Requires feature scaling (StandardScaler) before use or distances become meaningless",
      "Sensitive to the curse of dimensionality in high-dimensional feature spaces"
    ],
    codeSnippet: `from sklearn.impute import KNNImputer
from sklearn.preprocessing import StandardScaler
import numpy as np

# Dataset with missing values (NaN)
X = np.array([
    [1.0, 2.0, np.nan],
    [3.0, np.nan, 6.0],
    [7.0, 8.0, 9.0],
    [4.0, 5.0, 6.0],
    [np.nan, 3.0, 5.0]
])

# KNNImputer fills NaNs using k nearest neighbors
imputer = KNNImputer(n_neighbors=2, weights='distance')
X_imputed = imputer.fit_transform(X)

print("Original (with NaNs):")
print(X)
print("\\nImputed (NaNs filled via KNN):")
print(X_imputed)`
  },

  {
    id: "simple-imputer",
    name: "SimpleImputer (Mean / Median / Mode Imputation)",
    track: "ml-core",
    category: "Preprocessing & Imputation",
    task: ["Preprocessing", "Missing Data", "Imputation"],
    difficulty: "Beginner",
    summary: "Fills missing values with a simple statistical summary of the non-missing values: mean, median, most frequent value, or a constant. The fastest and most common first-line imputation strategy.",
    intuition: "The Default Filler: Don't know someone's salary? Fill it with the average salary. Don't know someone's city? Fill it with the most common city. Simple, fast, but not always smart.",
    whenToUse: "First-line imputation for tabular data. When missingness is random (MCAR), when speed matters, or as a baseline before trying more sophisticated methods.",
    whenToAvoid: "When missing values are systematically related to other features (use KNNImputer or IterativeImputer instead).",
    requirements: {
      scalingRequired: false,
      universalStrategy: true,
      fastAndSimple: true
    },
    parameters: [
      {
        name: "strategy='mean'",
        type: "string",
        default: "mean",
        impact: "Replaces NaN with column mean. Only for numerical features.",
        tuningTip: "Sensitive to outliers. Use 'median' if data is skewed."
      },
      {
        name: "strategy='median'",
        type: "string",
        default: "Robust",
        impact: "Replaces NaN with column median. Robust to outliers.",
        tuningTip: "Best default for skewed numerical features."
      },
      {
        name: "strategy='most_frequent'",
        type: "string",
        default: "Mode",
        impact: "Replaces NaN with the most frequent value. Works for both numerical and categorical.",
        tuningTip: "The only strategy that works for categorical string features."
      },
      {
        name: "strategy='constant'",
        type: "string",
        default: "fill_value",
        impact: "Replaces NaN with a user-specified constant value.",
        tuningTip: "Use fill_value=0 or fill_value='MISSING' to explicitly mark imputed records."
      }
    ],
    math: {
      formula: "mean: x_missing = (1/n) ∑ xᵢ  |  median: x_missing = Q₂  |  mode: x_missing = argmax freq(x)",
      loss: "Statistical Summary Replacement",
      explanation: "Computes the chosen statistic (mean/median/mode) from non-missing values in each column, then substitutes all NaN entries with that single computed value."
    },
    pros: [
      "Extremely fast: O(n) per column computation",
      "Preserves dataset shape (no dropped rows or columns)",
      "Works seamlessly inside sklearn Pipelines"
    ],
    cons: [
      "Distorts true feature variance and correlation structure",
      "Mean imputation introduces bias toward the center, shrinking natural spread",
      "Ignores relationships between features (each column is imputed independently)"
    ],
    codeSnippet: `from sklearn.impute import SimpleImputer
import numpy as np

X = np.array([
    [25, 50000],
    [30, np.nan],
    [np.nan, 75000],
    [45, 120000]
])

# Numerical: Median strategy (robust to outliers)
imputer = SimpleImputer(strategy='median')
X_imputed = imputer.fit_transform(X)

print(f"Before: {X}")
print(f"After:  {X_imputed}")
# NaN in column 0 filled with median(25,30,45) = 30
# NaN in column 1 filled with median(50000,75000,120000) = 75000`
  },

  {
    id: "encoding-categorical",
    name: "Label Encoding vs One-Hot Encoding",
    track: "ml-core",
    category: "Preprocessing & Feature Engineering",
    task: ["Preprocessing", "Feature Engineering", "Encoding"],
    difficulty: "Beginner",
    summary: "Techniques to convert categorical text features (like 'Red', 'Blue', 'Green') into numerical representations that machine learning algorithms can mathematically process.",
    intuition: "Translation for Machines: ML models speak numbers, not words. 'Paris', 'London', 'Tokyo' mean nothing to a neural network. We must translate them into numbers — but HOW we translate matters enormously.",
    whenToUse: "Mandatory for any dataset with categorical (text) features before feeding into ML models. Choice depends on the algorithm and the feature's nature.",
    whenToAvoid: "When using models that natively handle categoricals (CatBoost, LightGBM with categorical feature declaration).",
    requirements: {
      categoricalToNumerical: true,
      preventsFalseOrdering: true,
      matchesAlgorithmExpectation: true
    },
    parameters: [
      {
        name: "LabelEncoder",
        type: "method",
        default: "Integer mapping",
        impact: "Maps each unique category to an integer: Red=0, Blue=1, Green=2.",
        tuningTip: "ONLY use for ordinal features (Low<Medium<High) or tree-based models. Linear models will interpret Blue(1) as 'between' Red(0) and Green(2)!"
      },
      {
        name: "OneHotEncoder (pd.get_dummies)",
        type: "method",
        default: "Binary columns",
        impact: "Creates a separate binary column for each category: is_Red, is_Blue, is_Green.",
        tuningTip: "Use for nominal (unordered) categories with <10 unique values. Drop one column (drop='first') to avoid multicollinearity."
      },
      {
        name: "OrdinalEncoder",
        type: "method",
        default: "Ordered mapping",
        impact: "Like LabelEncoder but explicitly respects a user-defined ordering.",
        tuningTip: "Use for truly ordinal features: ['low', 'medium', 'high'] → [0, 1, 2]."
      },
      {
        name: "Target Encoding",
        type: "method",
        default: "Mean of target",
        impact: "Replaces each category with the mean target value for that category.",
        tuningTip: "Best for high-cardinality features (1000+ cities). Beware of target leakage — always use cross-validated target encoding."
      }
    ],
    math: {
      formula: "OneHot: x_cat → [0,0,...,1,...,0] (sparse binary vector of length |C|)",
      loss: "Representation Transformation",
      explanation: "Label encoding imposes an implicit ordinal relationship (0 < 1 < 2) which is incorrect for nominal categories. One-Hot encoding creates orthogonal binary dimensions, treating all categories as equidistant."
    },
    pros: [
      "Converts categorical features into algorithm-compatible numerical representations",
      "One-Hot encoding prevents false ordinal relationships between unordered categories",
      "Target encoding handles high-cardinality categoricals without dimensionality explosion"
    ],
    cons: [
      "One-Hot encoding causes dimensionality explosion with high-cardinality features (1000+ unique values)",
      "Label encoding introduces false ordinal relationships for linear and distance-based models",
      "Target encoding risks overfitting via target leakage if not cross-validated"
    ],
    codeSnippet: `from sklearn.preprocessing import LabelEncoder, OneHotEncoder, OrdinalEncoder
import pandas as pd

df = pd.DataFrame({'color': ['Red', 'Blue', 'Green', 'Blue', 'Red']})

# 1. Label Encoding (for tree models or ordinal features)
le = LabelEncoder()
df['color_label'] = le.fit_transform(df['color'])

# 2. One-Hot Encoding (for linear/distance-based models)
df_onehot = pd.get_dummies(df['color'], prefix='color', drop_first=True)

# 3. Ordinal Encoding (explicit order: Small < Medium < Large)
oe = OrdinalEncoder(categories=[['Small', 'Medium', 'Large']])
sizes = oe.fit_transform([['Medium'], ['Large'], ['Small']])

print(f"Label Encoded: {df['color_label'].tolist()}")
print(f"One-Hot:\\n{df_onehot}")
print(f"Ordinal: {sizes.ravel()}")`
  },

  {
    id: "train-test-split",
    name: "Train-Test Split & Data Leakage Prevention",
    track: "ml-core",
    category: "Preprocessing & Validation",
    task: ["Preprocessing", "Validation", "Data Leakage"],
    difficulty: "Beginner",
    summary: "The fundamental practice of splitting your dataset into separate training and testing sets BEFORE any preprocessing, to honestly evaluate how well a model generalizes to truly unseen data.",
    intuition: "The Final Exam Analogy: You study (train) from chapters 1-8. The final exam (test set) contains questions from chapter 9 that you've NEVER seen. If you peek at the exam beforehand (data leakage), your grade is meaningless.",
    whenToUse: "Absolutely mandatory for every supervised machine learning workflow. No exceptions.",
    whenToAvoid: "Never skip this step. The only variation is HOW to split (random, stratified, temporal).",
    requirements: {
      preventDataLeakage: true,
      honestEvaluation: true,
      splitBeforePreprocessing: true
    },
    parameters: [
      {
        name: "test_size",
        type: "float",
        default: "0.2 (20%)",
        impact: "Fraction of data held out for testing.",
        tuningTip: "Use 0.2 for large datasets (>10K). Use 0.3 for smaller datasets. For very small datasets, use cross-validation instead."
      },
      {
        name: "stratify",
        type: "array-like",
        default: "None",
        impact: "Ensures both train and test sets preserve the same class distribution as the original data.",
        tuningTip: "ALWAYS use stratify=y for classification to prevent all minority class samples ending up in one set."
      },
      {
        name: "random_state",
        type: "int",
        default: "None",
        impact: "Seed for reproducible splitting.",
        tuningTip: "Always set a fixed seed (e.g., 42) for reproducible experiments."
      },
      {
        name: "shuffle",
        type: "bool",
        default: "True",
        impact: "Whether to shuffle data before splitting.",
        tuningTip: "Set to False for time-series data where temporal order must be preserved."
      }
    ],
    math: {
      formula: "Dataset D → D_train (1-α) + D_test (α)  where α = test_size",
      loss: "Generalization Error Estimation",
      explanation: "The test set serves as a proxy for the infinite real-world data distribution the model will face in production. Leaking any test information into training inflates performance estimates and leads to catastrophic production failures."
    },
    pros: [
      "Provides an honest, unbiased estimate of real-world model performance",
      "Detects overfitting: large gap between train and test scores = overfitting",
      "Simple to implement and universally understood"
    ],
    cons: [
      "A single random split can be unlucky (use cross-validation for more robust estimates)",
      "Reduces available training data (20% fewer samples for learning)"
    ],
    codeSnippet: `from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# CORRECT ORDER: Split FIRST, then preprocess
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# CRITICAL: Fit scaler ONLY on training data!
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)  # fit + transform
X_test_scaled = scaler.transform(X_test)         # transform ONLY (no fit!)

# ❌ WRONG: scaler.fit_transform(X) BEFORE splitting → DATA LEAKAGE!
# ✅ CORRECT: split → fit on train → transform both`
  },

  // ==========================================
  // TRACK: CORE ML THEORY (Additional Concepts)
  // ==========================================
  {
    id: "cross-validation",
    name: "Cross-Validation (k-Fold CV)",
    track: "ml-core",
    category: "ML Theory & Validation",
    task: ["Validation", "Evaluation", "Hyperparameter Tuning"],
    difficulty: "Beginner",
    summary: "A resampling technique that splits the training data into k equal folds, trains the model k times using k-1 folds, and validates on the remaining fold each time. Reports the average performance across all k rounds.",
    intuition: "The Round-Robin Tournament: Instead of playing ONE match (single train/test split), you play k matches. Each player (fold) gets a turn being the test set while the rest train. The average score across all matches is far more reliable than any single game.",
    whenToUse: "Hyperparameter tuning, model selection, and getting robust performance estimates. Essential when your dataset is too small for a large held-out test set.",
    whenToAvoid: "Very large datasets (>1M samples) where a single 80/20 split already gives stable estimates and k-Fold would be computationally wasteful.",
    requirements: {
      multipleTrainTestRounds: true,
      robustPerformanceEstimate: true,
      standardForHyperparameterTuning: true
    },
    parameters: [
      {
        name: "n_splits (k)",
        type: "int",
        default: "5",
        impact: "Number of folds. Each fold serves as test set once.",
        tuningTip: "k=5 is the industry standard. k=10 for small datasets. k=n (Leave-One-Out) for extremely small datasets."
      },
      {
        name: "StratifiedKFold",
        type: "variant",
        default: "Preserves class ratios",
        impact: "Each fold maintains the same proportion of each class as the full dataset.",
        tuningTip: "ALWAYS use StratifiedKFold for classification to prevent class imbalance within individual folds."
      },
      {
        name: "TimeSeriesSplit",
        type: "variant",
        default: "Temporal order",
        impact: "Ensures training data always precedes test data chronologically.",
        tuningTip: "Mandatory for time-series forecasting to prevent future data leaking into training."
      }
    ],
    math: {
      formula: "CV Score = (1/k) ∑ᵢ₌₁ᵏ Score(Model_i, Fold_test_i)",
      loss: "Average of k Validation Scores",
      explanation: "Each of the k models is trained on (k-1)/k of the data and evaluated on the remaining 1/k. Averaging k scores provides a lower-variance estimate of generalization performance than any single random split."
    },
    pros: [
      "Every data point gets used for both training AND validation (maximizes data utilization)",
      "Provides mean AND standard deviation of performance (quantifies reliability)",
      "The gold standard for model selection and hyperparameter tuning"
    ],
    cons: [
      "k times more expensive computationally than a single train/test split",
      "Not suitable for time-series data without special temporal splitting (TimeSeriesSplit)"
    ],
    codeSnippet: `from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=100, random_state=42)

# 5-Fold Stratified Cross-Validation
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv, scoring='accuracy')

print(f"CV Scores: {scores}")
print(f"Mean Accuracy: {scores.mean():.4f} ± {scores.std():.4f}")
# Mean ± Std tells you both performance AND reliability`
  },

  {
    id: "regularization-l1-l2",
    name: "Regularization (L1 Lasso & L2 Ridge)",
    track: "ml-core",
    category: "ML Theory & Optimization",
    task: ["Regularization", "Overfitting Prevention", "Feature Selection"],
    difficulty: "Intermediate",
    summary: "Penalty terms added to the model's cost function that constrain the magnitude of learned weights, preventing overfitting by discouraging unnecessary model complexity.",
    intuition: "Speed Limit on a Highway: Without regularization, a model is a race car with no speed limits (weights can grow astronomically large to fit noise). Regularization installs speed bumps (penalties on weight magnitude) that slow down the model and prevent reckless overfitting.",
    whenToUse: "When your model overfits (training accuracy >> validation accuracy). When you have more features than samples. When you suspect many features are irrelevant.",
    whenToAvoid: "When your model underfits (both training and validation accuracy are low). Regularization would make underfitting worse by restricting the model further.",
    requirements: {
      preventsOverfitting: true,
      addsToLossFunction: true,
      controlledByHyperparameter: true
    },
    parameters: [
      {
        name: "L1 (Lasso) Penalty: λ · ∑|wⱼ|",
        type: "regularizer",
        default: "Sparsity inducing",
        impact: "Drives uninformative feature weights exactly to zero, performing automatic feature selection.",
        tuningTip: "Use L1 when you suspect most features are irrelevant and want to find the vital few."
      },
      {
        name: "L2 (Ridge) Penalty: λ · ∑wⱼ²",
        type: "regularizer",
        default: "Weight shrinkage",
        impact: "Shrinks all weights toward zero proportionally, but never exactly to zero.",
        tuningTip: "Use L2 when all features are potentially relevant and you want to spread influence across them."
      },
      {
        name: "Elastic Net: α·L1 + (1-α)·L2",
        type: "combination",
        default: "Best of both",
        impact: "Combines L1 sparsity with L2 stability. Controls the mix with parameter α.",
        tuningTip: "Use when you have groups of correlated features and want both selection and stability."
      },
      {
        name: "λ (alpha) — Regularization Strength",
        type: "hyperparameter",
        default: "1.0",
        impact: "Controls penalty intensity. λ=0 means no regularization. λ→∞ drives all weights to zero.",
        tuningTip: "Tune via cross-validation. Search log-scale: [0.0001, 0.001, 0.01, 0.1, 1, 10, 100]."
      }
    ],
    math: {
      formula: "J_regularized(θ) = (1/n)∑ Loss(ŷᵢ, yᵢ) + λ · R(w)  where R = ||w||₁ (L1) or ||w||₂² (L2)",
      loss: "Constrained Optimization",
      explanation: "The added penalty R(w) creates a tradeoff: the model must simultaneously minimize prediction error AND keep weights small. This prevents memorization of training noise by restricting the hypothesis space."
    },
    pros: [
      "Dramatically reduces overfitting on high-dimensional or noisy datasets",
      "L1 provides automatic feature selection by zeroing out useless weights",
      "L2 guarantees unique solutions even when features are correlated (fixes multicollinearity)"
    ],
    cons: [
      "Introduces an additional hyperparameter (λ) that must be tuned via cross-validation",
      "L1 solutions are non-unique when features are perfectly correlated",
      "Can cause underfitting if λ is set too high"
    ],
    codeSnippet: `from sklearn.linear_model import Lasso, Ridge, ElasticNet
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

# L1: Lasso (Feature Selection via Sparsity)
lasso = make_pipeline(StandardScaler(), Lasso(alpha=0.1))
lasso.fit(X_train, y_train)
print(f"Lasso Non-Zero Coefficients: {sum(lasso[-1].coef_ != 0)} / {len(lasso[-1].coef_)}")

# L2: Ridge (Weight Shrinkage)
ridge = make_pipeline(StandardScaler(), Ridge(alpha=1.0))
ridge.fit(X_train, y_train)

# Elastic Net (Combined L1 + L2)
enet = make_pipeline(StandardScaler(), ElasticNet(alpha=0.1, l1_ratio=0.5))
enet.fit(X_train, y_train)`
  },

  {
    id: "hyperparameter-tuning",
    name: "Hyperparameter Tuning (GridSearch & RandomSearch)",
    track: "ml-core",
    category: "ML Theory & Optimization",
    task: ["Hyperparameter Tuning", "Model Selection", "Optimization"],
    difficulty: "Intermediate",
    summary: "The systematic process of finding the optimal configuration of hyperparameters (settings not learned from data) that maximize model performance on held-out validation data.",
    intuition: "Tuning a Guitar: Model parameters (weights) are the strings that vibrate. Hyperparameters (learning_rate, max_depth, regularization) are the tuning pegs that you twist by hand before playing. A perfectly tuned guitar sounds radically different from a mistuned one.",
    whenToUse: "After selecting your model algorithm and establishing a baseline. When default hyperparameters do not produce satisfactory performance.",
    whenToAvoid: "Before you have clean data and a proper validation strategy. Tuning garbage features produces garbage models faster.",
    requirements: {
      requiresCrossValidation: true,
      searchesParameterSpace: true,
      preventsTestSetContamination: true
    },
    parameters: [
      {
        name: "GridSearchCV",
        type: "strategy",
        default: "Exhaustive search",
        impact: "Tries EVERY combination of specified hyperparameter values.",
        tuningTip: "Guarantees finding the best combination in the grid, but exponentially expensive (10 values × 10 values = 100 fits × 5 CV folds = 500 model trainings)."
      },
      {
        name: "RandomizedSearchCV",
        type: "strategy",
        default: "Random sampling",
        impact: "Randomly samples n_iter combinations from the parameter space.",
        tuningTip: "Often finds 95% of the optimal solution in 10% of the time. Superior when parameter space is large."
      },
      {
        name: "Bayesian Optimization (Optuna)",
        type: "strategy",
        default: "Intelligent search",
        impact: "Uses past evaluation results to intelligently choose the next hyperparameters to try.",
        tuningTip: "The state-of-the-art approach for expensive model training (Deep Learning, XGBoost on large data)."
      }
    ],
    math: {
      formula: "θ* = argmax_θ (1/k) ∑ Score(Model(θ), Fold_i)  over parameter space Θ",
      loss: "Optimization over Hyperparameter Space",
      explanation: "For each candidate hyperparameter configuration θ, k-Fold cross-validation computes the average score. The configuration with the highest average CV score is selected as optimal."
    },
    pros: [
      "Systematically finds significantly better model configurations than manual guessing",
      "Cross-validation integration prevents overfitting to validation quirks",
      "Sklearn's GridSearchCV and RandomizedSearchCV handle parallelism automatically"
    ],
    cons: [
      "Computationally expensive: each combination requires full model training × k CV folds",
      "Risk of overfitting to the validation set if too many hyperparameter combinations are explored"
    ],
    codeSnippet: `from sklearn.model_selection import GridSearchCV, RandomizedSearchCV
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(random_state=42)

# Define search space
param_grid = {
    'n_estimators': [100, 200, 500],
    'max_depth': [5, 10, 20, None],
    'min_samples_split': [2, 5, 10],
    'max_features': ['sqrt', 'log2']
}

# GridSearchCV: Exhaustive (3×4×3×2 = 72 combos × 5 folds = 360 fits)
grid = GridSearchCV(model, param_grid, cv=5, scoring='f1', n_jobs=-1)
grid.fit(X_train, y_train)

print(f"Best Params: {grid.best_params_}")
print(f"Best CV F1:  {grid.best_score_:.4f}")`
  },

  {
    id: "overfitting-underfitting",
    name: "Overfitting vs Underfitting",
    track: "ml-core",
    category: "ML Theory & Diagnostics",
    task: ["Definition", "Diagnostics", "Model Tuning"],
    difficulty: "Beginner",
    summary: "The two fundamental failure modes of machine learning models. Overfitting: the model memorizes training noise and fails on new data. Underfitting: the model is too simple to capture the underlying pattern.",
    intuition: "The Student Analogy: Underfitting = A student who barely studied and fails both homework AND the exam. Overfitting = A student who memorized every homework answer verbatim but can't solve any new exam problem because they never understood the underlying concepts.",
    whenToUse: "Diagnosing model performance gaps. Deciding whether to increase or decrease model complexity.",
    whenToAvoid: "N/A — these are fundamental diagnostic concepts applicable to every ML model.",
    requirements: {
      diagnosticFramework: true,
      comparesTrainVsValError: true,
      guidesModelComplexity: true
    },
    parameters: [
      {
        name: "Overfitting Symptoms",
        type: "diagnostic",
        default: "Train ≫ Val",
        impact: "Training accuracy is very high (e.g., 99%) but validation accuracy is significantly lower (e.g., 75%).",
        tuningTip: "Remedies: Add more training data, increase regularization (L1/L2), reduce model complexity (fewer layers/trees/features), use Dropout, or apply early stopping."
      },
      {
        name: "Underfitting Symptoms",
        type: "diagnostic",
        default: "Train ≈ Val ≈ Low",
        impact: "Both training and validation accuracy are low (e.g., 60% each).",
        tuningTip: "Remedies: Use a more complex model, add more informative features, decrease regularization, train longer, or engineer interaction features."
      },
      {
        name: "Good Fit",
        type: "diagnostic",
        default: "Train ≈ Val ≈ High",
        impact: "Both training and validation accuracy are high and close to each other.",
        tuningTip: "The sweet spot! Model generalizes well to unseen data."
      }
    ],
    math: {
      formula: "Total Error = Bias² + Variance + Irreducible Noise",
      loss: "Bias-Variance Decomposition",
      explanation: "Underfitting = High Bias (model too rigid, wrong assumptions). Overfitting = High Variance (model too flexible, captures noise). The optimal model minimizes Total Error by balancing both."
    },
    pros: [
      "The most fundamental diagnostic framework in all of machine learning",
      "Directly informs whether to add/remove complexity, data, or regularization"
    ],
    cons: [
      "The optimal balance point depends heavily on dataset size, noise level, and problem domain"
    ],
    codeSnippet: `from sklearn.model_selection import learning_curve
import numpy as np

# Learning Curve: The best visual diagnostic for overfitting vs underfitting
train_sizes, train_scores, val_scores = learning_curve(
    model, X, y, cv=5,
    train_sizes=np.linspace(0.1, 1.0, 10),
    scoring='accuracy'
)

print("Training Accuracy:  ", train_scores.mean(axis=1).round(3))
print("Validation Accuracy:", val_scores.mean(axis=1).round(3))
print()

gap = train_scores.mean(axis=1)[-1] - val_scores.mean(axis=1)[-1]
if gap > 0.1:
    print("⚠️ OVERFITTING: Large gap between train and validation scores")
elif train_scores.mean(axis=1)[-1] < 0.7:
    print("⚠️ UNDERFITTING: Both scores are low")
else:
    print("✅ GOOD FIT: Scores are high and close together")`
  },

  // ==========================================
  // TRACK: ADDITIONAL ML MODELS
  // ==========================================
  {
    id: "decision-tree",
    name: "Decision Tree (CART)",
    track: "ml-models",
    category: "Tree-Based Models",
    task: ["Classification", "Regression"],
    difficulty: "Beginner",
    summary: "A non-parametric supervised model that learns hierarchical if-then-else decision rules from data, forming a tree structure that recursively splits the feature space into rectangular regions.",
    intuition: "The 20-Questions Game: 'Is the customer's age > 30?' → Yes → 'Is their income > $80K?' → Yes → 'Predict: Will buy premium product.' Each question creates a split, and the answers create branches until a final decision is reached at the leaf.",
    whenToUse: "When complete model interpretability is required (medical, legal, financial compliance). As the building block for understanding Random Forest and Gradient Boosting.",
    whenToAvoid: "When you need high accuracy on complex datasets (single trees overfit easily). Use ensemble methods (Random Forest, XGBoost) instead.",
    requirements: {
      scalingRequired: false,
      handlesMissing: false,
      outlierSensitive: false,
      linearRelationship: false
    },
    parameters: [
      {
        name: "max_depth",
        type: "int or None",
        default: "None (fully grown)",
        impact: "Maximum depth of the tree.",
        tuningTip: "Unrestricted trees overfit catastrophically. Set to 3-10 for interpretability and generalization."
      },
      {
        name: "criterion",
        type: "string",
        default: "'gini' (clf) / 'squared_error' (reg)",
        impact: "Function to measure split quality.",
        tuningTip: "'gini' and 'entropy' produce nearly identical trees. Gini is slightly faster to compute."
      },
      {
        name: "min_samples_leaf",
        type: "int",
        default: "1",
        impact: "Minimum number of samples required at a leaf node.",
        tuningTip: "Increase to 5-20 to prevent leaves with a single sample (extreme overfitting)."
      },
      {
        name: "max_features",
        type: "string or int",
        default: "None (all features)",
        impact: "Number of features considered at each split.",
        tuningTip: "In Random Forest, this is set to 'sqrt' to decorrelate trees."
      }
    ],
    math: {
      formula: "Gini Impurity: G = 1 - ∑ pᵢ²  |  Entropy: H = -∑ pᵢ · log₂(pᵢ)",
      loss: "Information Gain = Parent Impurity - Weighted Average of Children Impurity",
      explanation: "At each node, the algorithm finds the feature and threshold that maximizes Information Gain (or equivalently, maximally reduces impurity). This greedy recursive process builds the tree from root to leaves."
    },
    pros: [
      "Crystal clear interpretability: can be printed as human-readable if-then rules",
      "Requires zero feature scaling or normalization",
      "Naturally handles both numerical and categorical features",
      "The foundational building block of all ensemble tree methods"
    ],
    cons: [
      "Extremely prone to overfitting (high variance) without pruning or depth limits",
      "Unstable: small data changes can produce completely different tree structures",
      "Cannot extrapolate beyond the training data range (step-function predictions)"
    ],
    codeSnippet: `from sklearn.tree import DecisionTreeClassifier, export_text

dt = DecisionTreeClassifier(max_depth=4, min_samples_leaf=5, random_state=42)
dt.fit(X_train, y_train)

# Print human-readable decision rules
rules = export_text(dt, feature_names=['age', 'income', 'credit_score'])
print(rules)

# Predict
pred = dt.predict(X_test)
print(f"Test Accuracy: {dt.score(X_test, y_test):.4f}")`
  },

  {
    id: "naive-bayes",
    name: "Naive Bayes Classifier",
    track: "ml-models",
    category: "Probabilistic Models",
    task: ["Classification", "NLP", "Text Classification"],
    difficulty: "Beginner",
    summary: "A probabilistic classifier based on Bayes' Theorem that assumes all features are conditionally independent given the class label (the 'naive' assumption).",
    intuition: "The Spam Detective: Given the email contains 'FREE', 'WINNER', and 'CLICK', what's the probability it's spam? Naive Bayes multiplies P(FREE|spam) × P(WINNER|spam) × P(CLICK|spam) × P(spam) — assuming each word contributes independently.",
    whenToUse: "Text classification (spam detection, sentiment analysis), real-time prediction with extremely low latency, and as a fast probabilistic baseline.",
    whenToAvoid: "When features are highly correlated (the independence assumption is severely violated). When you need top-tier accuracy on structured tabular data.",
    requirements: {
      scalingRequired: false,
      handlesMissing: false,
      outlierSensitive: false,
      linearRelationship: false
    },
    parameters: [
      {
        name: "GaussianNB",
        type: "variant",
        default: "Continuous features",
        impact: "Assumes features follow a Gaussian (normal) distribution within each class.",
        tuningTip: "Use for real-valued continuous features."
      },
      {
        name: "MultinomialNB",
        type: "variant",
        default: "Count features",
        impact: "Designed for word counts and document-term matrices.",
        tuningTip: "The standard for text classification with TF-IDF or Count Vectorizer."
      },
      {
        name: "BernoulliNB",
        type: "variant",
        default: "Binary features",
        impact: "Designed for binary/boolean features (word present or not).",
        tuningTip: "Use for binary bag-of-words representations."
      },
      {
        name: "alpha (Laplace Smoothing)",
        type: "float",
        default: "1.0",
        impact: "Additive smoothing parameter to prevent zero-probability events.",
        tuningTip: "alpha=1 (Laplace). Set alpha=0 for no smoothing (risky: unseen words get P=0)."
      }
    ],
    math: {
      formula: "P(Class|Features) = P(Class) · ∏ P(Featureᵢ|Class) / P(Features)",
      loss: "Posterior Probability via Bayes' Theorem",
      explanation: "Applies Bayes' rule with the naive conditional independence assumption: P(x₁, x₂, ..., xₙ | C) = ∏ P(xᵢ | C). Despite this simplification being theoretically incorrect, it works remarkably well in practice."
    },
    pros: [
      "Blazing fast training and prediction (linear complexity O(n·d))",
      "Performs surprisingly well on text classification despite the naive independence assumption",
      "Requires very little training data to estimate parameters",
      "Naturally handles multiclass classification"
    ],
    cons: [
      "The independence assumption is almost always violated in real data",
      "Cannot learn feature interactions (unlike tree-based or neural models)",
      "Probability estimates are often poorly calibrated (over-confident)"
    ],
    codeSnippet: `from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import make_pipeline

# Text Classification Pipeline
emails = ["Free money click now!", "Meeting at 3pm tomorrow", "Winner! Claim prize", "Project update attached"]
labels = [1, 0, 1, 0]  # 1=spam, 0=ham

clf = make_pipeline(TfidfVectorizer(), MultinomialNB(alpha=1.0))
clf.fit(emails, labels)

test = ["You won a free lottery!"]
print(f"Prediction: {'SPAM' if clf.predict(test)[0] else 'HAM'}")
print(f"Confidence: {clf.predict_proba(test)[0].max():.1%}")`
  },

  {
    id: "dbscan",
    name: "DBSCAN (Density-Based Spatial Clustering)",
    track: "ml-models",
    category: "Unsupervised Clustering",
    task: ["Clustering", "Anomaly Detection", "Unsupervised"],
    difficulty: "Intermediate",
    summary: "A density-based clustering algorithm that groups together points packed closely in dense regions and marks points in low-density regions as noise/outliers. Does not require specifying the number of clusters k in advance.",
    intuition: "City Lights from Space: Dense clusters of street lights form natural cities. Isolated farmhouses in empty fields are noise/outliers. DBSCAN finds the cities without you telling it how many exist.",
    whenToUse: "When clusters have arbitrary shapes (rings, spirals, blobs). When you don't know k in advance. When identifying outliers is as important as finding clusters.",
    whenToAvoid: "When clusters have vastly different densities (one loose cluster + one tight cluster). When data lives in very high dimensions (distance metrics become unreliable).",
    requirements: {
      scalingRequired: true,
      handlesMissing: false,
      outlierSensitive: false,
      linearRelationship: false
    },
    parameters: [
      {
        name: "eps (ε)",
        type: "float",
        default: "0.5",
        impact: "Maximum distance between two samples to be considered neighbors.",
        tuningTip: "Use a k-distance plot (sorted k-NN distances) to find the 'elbow' — that's your optimal eps."
      },
      {
        name: "min_samples",
        type: "int",
        default: "5",
        impact: "Minimum number of points required within eps radius to form a dense core point.",
        tuningTip: "Rule of thumb: min_samples ≥ number_of_features + 1. Higher values create stricter, fewer clusters."
      }
    ],
    math: {
      formula: "Core Point: |N_ε(p)| ≥ min_samples  where N_ε(p) = {q : d(p,q) ≤ ε}",
      loss: "Density-Reachability Connectivity",
      explanation: "A point p is a Core Point if at least min_samples points lie within its ε-neighborhood. Border points are within ε of a core point but are not core themselves. Noise points are neither core nor border. Clusters are connected components of core-reachable points."
    },
    pros: [
      "Discovers clusters of arbitrary shape (unlike K-Means which assumes spherical clusters)",
      "Automatically determines the number of clusters from data density",
      "Built-in noise/outlier detection: points labeled as -1 are anomalies",
      "Does not require specifying k in advance"
    ],
    cons: [
      "Struggles when clusters have vastly different densities (one eps cannot fit all)",
      "Performance degrades significantly in high-dimensional spaces",
      "Sensitive to eps and min_samples hyperparameters"
    ],
    codeSnippet: `from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import numpy as np

# DBSCAN finds arbitrary-shape clusters AND outliers
X_scaled = StandardScaler().fit_transform(X)

dbscan = DBSCAN(eps=0.5, min_samples=5)
labels = dbscan.fit_predict(X_scaled)

n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
n_outliers = list(labels).count(-1)

print(f"Clusters found: {n_clusters}")
print(f"Outliers detected: {n_outliers}")
print(f"Labels: {labels}")`
  },

  {
    id: "lightgbm",
    name: "LightGBM",
    track: "ml-models",
    category: "Ensemble / Boosting",
    task: ["Classification", "Regression", "Ranking"],
    difficulty: "Advanced",
    summary: "A gradient boosting framework by Microsoft that uses histogram-based split finding and leaf-wise tree growth for drastically faster training on large datasets compared to XGBoost.",
    intuition: "The Speed Demon of Boosting: XGBoost considers every possible split point. LightGBM buckets continuous features into ~255 histogram bins and only evaluates bin edges, making it 10-20x faster on large data with negligible accuracy loss.",
    whenToUse: "Large tabular datasets (>100K rows). Kaggle competitions. When training speed matters. When you have high-cardinality categorical features.",
    whenToAvoid: "Very small datasets (<2000 samples) where it may overfit aggressively due to leaf-wise growth.",
    requirements: {
      scalingRequired: false,
      handlesMissing: true,
      outlierSensitive: true,
      linearRelationship: false
    },
    parameters: [
      {
        name: "num_leaves",
        type: "int",
        default: "31",
        impact: "Maximum number of leaves per tree. Controls model complexity.",
        tuningTip: "num_leaves < 2^max_depth to avoid overfitting. Start with 31 and tune between 20-100."
      },
      {
        name: "learning_rate",
        type: "float",
        default: "0.1",
        impact: "Step size shrinkage to prevent overfitting.",
        tuningTip: "Lower values (0.01-0.05) require more boosting rounds but generalize better."
      },
      {
        name: "feature_fraction (colsample_bytree)",
        type: "float",
        default: "1.0",
        impact: "Fraction of features randomly selected for each tree.",
        tuningTip: "Set to 0.6-0.9 to add randomness and reduce overfitting (like Random Forest does)."
      },
      {
        name: "categorical_feature",
        type: "list",
        default: "auto",
        impact: "Specify which features are categorical for native optimal split handling.",
        tuningTip: "LightGBM handles categoricals natively (no One-Hot needed!) using optimal split algorithms."
      }
    ],
    math: {
      formula: "Histogram Split: O(#bins) instead of O(#data × #features)",
      loss: "Gradient One-Side Sampling (GOSS) + Exclusive Feature Bundling (EFB)",
      explanation: "GOSS keeps all instances with large gradients and randomly samples small-gradient instances, focusing computation where the model is most wrong. EFB bundles mutually exclusive sparse features to reduce dimensionality."
    },
    pros: [
      "10-20x faster training than XGBoost on large datasets due to histogram-based splits",
      "Native optimal categorical feature handling (no manual encoding needed)",
      "Lower memory consumption through histogram binning",
      "State-of-the-art accuracy competitive with XGBoost"
    ],
    cons: [
      "Leaf-wise growth can overfit on small datasets (use max_depth limiter)",
      "Less community documentation compared to XGBoost",
      "Sensitive to num_leaves hyperparameter"
    ],
    codeSnippet: `import lightgbm as lgb
from sklearn.model_selection import train_test_split

X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2)

train_data = lgb.Dataset(X_train, label=y_train)
val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)

params = {
    'objective': 'binary',
    'metric': 'auc',
    'num_leaves': 31,
    'learning_rate': 0.05,
    'feature_fraction': 0.8,
    'verbose': -1
}

model = lgb.train(
    params, train_data,
    num_boost_round=1000,
    valid_sets=[val_data],
    callbacks=[lgb.early_stopping(30)]
)

print(f"Best AUC: {model.best_score['valid_0']['auc']:.4f}")`
  },

  // ==========================================
  // TRACK: DEEP LEARNING (Additional Architectures)
  // ==========================================
  {
    id: "mlp-neural-network",
    name: "Multi-Layer Perceptron (MLP)",
    track: "deep-learning",
    category: "Neural Architectures",
    task: ["Classification", "Regression", "Tabular"],
    difficulty: "Intermediate",
    summary: "The simplest form of a feedforward deep neural network, consisting of an input layer, one or more hidden layers of fully connected neurons, and an output layer. Each neuron applies a weighted sum followed by a non-linear activation function.",
    intuition: "The Assembly Line Brain: Each layer of workers (neurons) receives inputs from the previous layer, performs calculations (weighted sums + activation), and passes results to the next layer. The final layer produces the prediction.",
    whenToUse: "Complex tabular data with millions of rows where non-linear feature interactions exist. As a baseline neural network before trying more specialized architectures.",
    whenToAvoid: "Structured data like images (use CNN), sequences (use RNN/Transformer), or small tabular datasets (<10K rows where tree ensembles dominate).",
    requirements: {
      scalingRequired: true,
      handlesMissing: false,
      outlierSensitive: true,
      linearRelationship: false
    },
    parameters: [
      {
        name: "hidden_layer_sizes",
        type: "tuple",
        default: "(100,)",
        impact: "Number and size of hidden layers.",
        tuningTip: "Start with (128, 64). Deeper is not always better for tabular data."
      },
      {
        name: "activation",
        type: "string",
        default: "'relu'",
        impact: "Activation function for hidden layers.",
        tuningTip: "ReLU is the safe default. Use 'tanh' for data centered around zero."
      },
      {
        name: "learning_rate_init",
        type: "float",
        default: "0.001",
        impact: "Initial step size for weight updates.",
        tuningTip: "0.001 with Adam optimizer is the universal starting point."
      },
      {
        name: "Dropout",
        type: "float",
        default: "0.0 - 0.5",
        impact: "Randomly deactivates neurons during training to prevent co-adaptation.",
        tuningTip: "Use 0.2-0.5 for regularization. PyTorch: nn.Dropout(0.3)."
      }
    ],
    math: {
      formula: "h = σ(W · x + b)  |  ŷ = softmax(W_out · h_L + b_out)",
      loss: "Cross-Entropy (Classification) or MSE (Regression) + Backpropagation",
      explanation: "Each hidden layer computes an affine transformation followed by a non-linear activation. Backpropagation computes gradients of the loss with respect to every weight via the chain rule, enabling gradient descent to update all parameters simultaneously."
    },
    pros: [
      "Universal function approximator (can theoretically model any continuous function)",
      "Captures complex non-linear feature interactions automatically",
      "Scales well with large datasets and GPU acceleration"
    ],
    cons: [
      "Requires careful hyperparameter tuning (layers, neurons, learning rate, regularization)",
      "Black box: individual neuron weights are not interpretable",
      "Prone to overfitting without Dropout, early stopping, or weight decay"
    ],
    codeSnippet: `from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

# Sklearn MLP (quick prototyping)
mlp = make_pipeline(
    StandardScaler(),
    MLPClassifier(
        hidden_layer_sizes=(128, 64, 32),
        activation='relu',
        solver='adam',
        max_iter=500,
        early_stopping=True,
        random_state=42
    )
)
mlp.fit(X_train, y_train)
print(f"MLP Test Accuracy: {mlp.score(X_test, y_test):.4f}")`
  },

  {
    id: "cnn",
    name: "Convolutional Neural Network (CNN)",
    track: "deep-learning",
    category: "Neural Architectures",
    task: ["Computer Vision", "Image Classification", "Object Detection"],
    difficulty: "Advanced",
    summary: "A specialized neural network architecture that uses learnable convolutional filters to automatically detect spatial patterns (edges, textures, shapes, objects) in grid-structured data like images.",
    intuition: "The Magnifying Glass Scanner: A small sliding window (filter/kernel) scans across the image systematically. Early layers detect simple edges and corners. Middle layers combine edges into eyes, noses, and wheels. Deep layers recognize full faces, cars, and dogs.",
    whenToUse: "Any task involving images, video frames, spectrograms, or 2D spatial data. Image classification, object detection, medical imaging, satellite imagery analysis.",
    whenToAvoid: "Tabular data (tree ensembles are superior), or 1D sequential data without spatial locality (use Transformers or RNNs).",
    requirements: {
      scalingRequired: true,
      handlesMissing: false,
      outlierSensitive: false,
      linearRelationship: false
    },
    parameters: [
      {
        name: "Convolutional Filters (Kernels)",
        type: "tensor",
        default: "3×3 or 5×5",
        impact: "Small weight matrices that slide across the input to detect local patterns.",
        tuningTip: "3×3 kernels stacked deeply (VGG-style) are more efficient than single large kernels."
      },
      {
        name: "Pooling Layers (MaxPool)",
        type: "operation",
        default: "2×2 stride 2",
        impact: "Downsamples feature maps by taking the maximum value in each 2×2 region.",
        tuningTip: "Reduces spatial dimensions by 50% while retaining the strongest activations."
      },
      {
        name: "Number of Filters per Layer",
        type: "int",
        default: "32, 64, 128, 256...",
        impact: "Number of unique patterns each layer can detect.",
        tuningTip: "Double filters when halving spatial dimensions (common architecture pattern)."
      }
    ],
    math: {
      formula: "Feature Map = ReLU( Input ⊛ Kernel + Bias )  where ⊛ = 2D convolution",
      loss: "Cross-Entropy + Backpropagation through Convolutional Layers",
      explanation: "Convolution operation slides learnable kernels across the input, computing element-wise products and summing. This achieves parameter sharing (same kernel detects the same pattern anywhere in the image) and translation equivariance."
    },
    pros: [
      "Automatic hierarchical feature extraction from raw pixels (no manual feature engineering)",
      "Parameter sharing via convolutional kernels makes CNNs extremely parameter-efficient",
      "Translation-invariant: detects a cat whether it's in the top-left or bottom-right of the image",
      "Backbone of modern computer vision (ResNet, EfficientNet, YOLO)"
    ],
    cons: [
      "Requires large labeled image datasets (or transfer learning from pretrained models)",
      "Computationally expensive: needs GPU acceleration for practical training times",
      "Not suitable for non-spatial data (tabular, text without spatial structure)"
    ],
    codeSnippet: `import torch
import torch.nn as nn

class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),  # 3 RGB channels → 32 filters
            nn.ReLU(),
            nn.MaxPool2d(2, 2),                           # 32×32 → 16×16
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),                           # 16×16 → 8×8
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64 * 8 * 8, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )
    
    def forward(self, x):
        x = self.features(x)
        return self.classifier(x)`
  },

  {
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
  }
];

// Merge per-track additions, then attach graph links (prerequisites / related) and diagrams
// to the base concepts. Every concept ends up with prerequisites[] and related[].
const enrichments = Object.assign({}, ...trackModules.map(m => m.enrichments));

export const concepts = [...baseConcepts, ...trackModules.flatMap(m => m.newConcepts)].map(c => ({
  prerequisites: [],
  related: [],
  ...c,
  ...enrichments[c.id]
}));

export const conceptById = new Map(concepts.map(c => [c.id, c]));

// Concepts that list `id` as a prerequisite ("what this unlocks").
export function getDependents(id) {
  return concepts.filter(c => c.prerequisites.includes(id));
}
