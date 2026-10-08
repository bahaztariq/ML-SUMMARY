export default {
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
  prerequisites: ["what-is-ml"],
  related: ["feature-scaling", "encoding-categorical", "feature-selection", "feature-store"],
  diagram: `flowchart LR
    A[("Raw columns")] --> B["Handle missing values (impute)"]
    B --> C{"Column type?"}
    C -->|"numeric"| D["Scale, log-transform, bin"]
    C -->|"categorical"| E["One-hot / target encoding"]
    C -->|"datetime"| F["Extract day, hour, recency"]
    C -->|"text"| G["TF-IDF / embeddings"]
    D --> H["Create interactions & aggregates"]
    E --> H
    F --> H
    G --> H
    H --> I["Feature selection"]
    I --> J["Model-ready matrix X"]`,
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
};
