export default {
  id: "time-series-cv",
  name: "Time-Series Cross-Validation (Walk-Forward Validation)",
  track: "ml-core",
  category: "ML Theory & Validation",
  task: ["Evaluation", "Regression"],
  difficulty: "Intermediate",
  summary: "Validation schemes for temporally ordered data that always train on the past and test on the future, so performance estimates reflect real forecasting conditions without look-ahead leakage.",
  intuition: "The Weather Forecaster's Exam: You cannot grade a forecaster by letting them peek at next week's newspaper. Walk-forward validation hands them data up to Monday, asks for Tuesday, then reveals Tuesday and asks for Wednesday, and so on. Shuffled k-Fold is like giving them random pages from the future, which makes anyone look like a genius.",
  whenToUse: "Forecasting, any model with lag/rolling features, financial and sensor data, demand planning, or any dataset where rows close in time are correlated and the model will be deployed on future data.",
  whenToAvoid: "Genuinely i.i.d. data with no temporal ordering or drift (standard stratified k-Fold uses data more efficiently), or when you have too little history for several meaningful folds.",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: false,
    noShuffling: true,
    sortedByTime: true
  },
  parameters: [
    {
      name: "n_splits",
      type: "int",
      default: "5",
      impact: "Number of successive train/test windows.",
      tuningTip: "Choose so each test window covers a meaningful horizon (e.g. one full week or season)."
    },
    {
      name: "test_size",
      type: "int",
      default: "n_samples // (n_splits + 1)",
      impact: "Length of each validation window.",
      tuningTip: "Match it to the production forecast horizon (forecasting 7 days → test_size = 7 days of rows)."
    },
    {
      name: "gap",
      type: "int",
      default: "0",
      impact: "Number of samples dropped between train and test to avoid leakage via lag features or autocorrelation.",
      tuningTip: "Set it at least as large as your longest lag/rolling window or label-delay period."
    },
    {
      name: "max_train_size",
      type: "int or None",
      default: "None (expanding window)",
      impact: "None = expanding window (all history); an int = sliding window of fixed length.",
      tuningTip: "Use a sliding window when old data is stale due to drift or regime changes."
    }
  ],
  math: {
    formula: "CV = (1/K) Σₖ Score( f_{[1, tₖ]} , [tₖ + g + 1, tₖ + g + h] )",
    loss: "Average out-of-time validation error",
    explanation: "For each fold k, the model is trained only on data up to time tₖ, skips a gap of g steps, and is scored on the next h steps. Because the test window always lies strictly in the future, the average score estimates true forecasting error rather than interpolation error."
  },
  pros: [
    "Prevents look-ahead leakage that makes shuffled CV wildly optimistic",
    "Mimics how the model is actually retrained and used in production",
    "Reveals performance degradation over time (concept drift) fold by fold",
    "Gap parameter handles lag features and delayed labels cleanly"
  ],
  cons: [
    "Early folds train on little data and can be pessimistic",
    "Uses data less efficiently than k-Fold (later points are never in training for early folds)",
    "Requires enough history for several realistic windows",
    "Feature engineering (lags, rolling stats) must also be fold-aware to avoid leakage"
  ],
  prerequisites: ["cross-validation", "train-test-split"],
  related: ["time-series-forecasting", "rnn-lstm", "model-data-drift", "mae-metric"],
  diagram: `flowchart LR
    A["Data sorted by time"] --> B["Fold 1: train on t1..t3"]
    B --> C["Gap (skip lag window)"]
    C --> D["Test on t4"]
    D --> E["Fold 2: train on t1..t4"]
    E --> F["Test on t5"]
    F --> G["Fold 3: train on t1..t5"]
    G --> H["Test on t6"]
    D --> I["Collect fold scores"]
    F --> I
    H --> I
    I --> J(["Mean ± std forecast error"])`,
  codeSnippet: `import numpy as np
import pandas as pd
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from lightgbm import LGBMRegressor

df = df.sort_values("date").reset_index(drop=True)   # order matters!

# Lag features built from the PAST only
for lag in [1, 7, 14]:
    df[f"sales_lag_{lag}"] = df["sales"].shift(lag)
df["sales_roll_7"] = df["sales"].shift(1).rolling(7).mean()
df = df.dropna()

X = df.drop(columns=["date", "sales"])
y = df["sales"]

# Expanding-window walk-forward CV with a 14-row gap (≥ longest lag)
tscv = TimeSeriesSplit(n_splits=5, test_size=28, gap=14)
for fold, (tr, te) in enumerate(tscv.split(X)):
    print(f"Fold {fold}: train {df.date.iloc[tr[0]].date()}→{df.date.iloc[tr[-1]].date()}"
          f" | test {df.date.iloc[te[0]].date()}→{df.date.iloc[te[-1]].date()}")

model = LGBMRegressor(n_estimators=500, learning_rate=0.03)
mae = -cross_val_score(model, X, y, cv=tscv,
                       scoring="neg_mean_absolute_error")
print(f"Walk-forward MAE per fold: {np.round(mae, 1)}")
print(f"Mean MAE: {mae.mean():.1f} ± {mae.std():.1f}")`
};
