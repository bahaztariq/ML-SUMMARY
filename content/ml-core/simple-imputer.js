export default {
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
  prerequisites: ["what-is-feature-engineering"],
  related: ["knn-imputer", "data-quality", "train-test-split"],
  diagram: `flowchart TD
    A["Column with missing values"] --> B{"Column type"}
    B -->|"numeric, skewed"| C["Median"]
    B -->|"numeric, symmetric"| D["Mean"]
    B -->|"categorical"| E["Most frequent / constant"]
    C --> F["Learn fill value on train split"]
    D --> F
    E --> F
    F --> G["Optionally add missing-indicator column"]
    G --> H["Transform train and test"]
    H --> I(["No NaNs left"])`,
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
};
