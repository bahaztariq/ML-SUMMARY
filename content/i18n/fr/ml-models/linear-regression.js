export default {
  name: "Régression linéaire (MCO et régularisée)",
  category: "Modèles linéaires",
  task: ["Régression"],
  summary: "Modélise la relation entre une cible continue (variable dépendante) et une ou plusieurs variables explicatives à l'aide d'une équation linéaire.",
  intuition: "Trouver la droite (ou l'hyperplan) qui s'ajuste le mieux aux données, c'est-à-dire celle qui minimise la somme des carrés des distances verticales entre tous les points et la droite.",
  whenToUse: "Modèle de référence pour des cibles numériques continues ; quand les parties prenantes métier exigent des coefficients transparents indiquant l'impact de chaque variable par unité.",
  whenToAvoid: "Quand la variable cible présente des relations courbes complexes, plusieurs modes ou de fortes anomalies asymétriques.",
  parameters: [
    {
      impact: "Coefficient multiplicateur de la force de régularisation.",
      tuningTip: "Un alpha plus élevé rapproche les coefficients de zéro pour lutter contre la colinéarité et le surapprentissage."
    },
    {
      impact: "Indique s'il faut calculer l'ordonnée à l'origine (terme de biais b) du modèle.",
      tuningTip: "Laissez True, sauf si vos données sont déjà centrées autour de zéro."
    }
  ],
  math: {
    loss: "MSE : (1/n)∑(y - ŷ)² + λ||w||₂² (Ridge) ou λ||w||₁ (Lasso)",
    explanation: "Les moindres carrés ordinaires (MCO) donnent la solution analytique exacte w = (XᵀX)⁻¹Xᵀy. Ridge ajoute une pénalité diagonale qui garantit l'inversibilité de la matrice, même en cas de forte multicolinéarité."
  },
  pros: [
    "Simple à implémenter, à interpréter et à comprendre mathématiquement",
    "Il existe une solution analytique exacte, sans boucle d'entraînement itérative",
    "Fournit des tests de significativité statistique (p-values, statistiques t, R²)"
  ],
  cons: [
    "Fortement perturbée par les observations aberrantes extrêmes",
    "Sujette à de graves problèmes de multicolinéarité si les variables sont corrélées",
    "Sous-apprend fortement lorsque le comportement de la cible est non linéaire"
  ],
  diagram: `flowchart TD
    A[("Variables X, cible numérique y")] --> B["Ajouter une colonne de biais, mise à l'échelle facultative"]
    B --> C{"Solveur ?"}
    C -->|"forme fermée"| D["Équation normale : θ = (XᵀX)⁻¹Xᵀy"]
    C -->|"itératif"| E["Descente de gradient sur la MSE"]
    E --> F["Mise à jour θ ← θ − α · ∇MSE"]
    F --> G{"Convergence ?"}
    G -->|"non"| E
    G -->|"oui"| H["Coefficients ajustés θ"]
    D --> H
    H --> I["Prédiction ŷ = Xθ"]
    I --> J(["Évaluer avec RMSE / R², examiner les résidus"])`
};
