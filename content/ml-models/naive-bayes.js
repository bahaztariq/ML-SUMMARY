export default {
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
    H --> I(["Predicted class + probabilities"])`,
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
};
