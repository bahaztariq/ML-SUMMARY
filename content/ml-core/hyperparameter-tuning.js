export default {
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
  prerequisites: ["cross-validation", "overfitting-underfitting"],
  related: ["experiment-tracking", "bias-variance-tradeoff", "regularization-l1-l2"],
  diagram: `flowchart TD
    A["Define search space"] --> B{"Search strategy"}
    B -->|"grid"| C["Every combination"]
    B -->|"random"| D["Sample N combinations"]
    B -->|"Bayesian"| E["Pick next config from surrogate model"]
    C --> F["Evaluate config with k-fold CV"]
    D --> F
    E --> F
    F --> G["Record mean CV score"]
    G --> H{"Budget left?"}
    H -->|"yes"| B
    H -->|"no"| I["Refit best config on full train set"]
    I --> J(["Final evaluation on test set"])`,
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
};
