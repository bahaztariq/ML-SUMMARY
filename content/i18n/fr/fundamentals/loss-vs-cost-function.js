export default {
  name: "Fonction de perte vs fonction de coût",
  category: "Mathématiques & optimisation",
  task: ["Définition", "Fondamentaux", "Optimisation"],
  summary: "Les mesures d’erreur mathématiques qui quantifient à quel point les prédictions d’un modèle s’écartent de la vérité terrain. La perte mesure un seul exemple ; le coût mesure l’ensemble du jeu de données.",
  intuition: "La boussole du Machine Learning : entraîner un modèle, c’est comme piloter un navire dans un épais brouillard. On ne voit pas directement la destination. La fonction de coût est l’aiguille de la boussole : elle indique si le navire se rapproche ou s’éloigne du port.",
  whenToUse: "Indispensable pour tout algorithme de Machine Learning ou d’apprentissage profond qui apprend ses paramètres par optimisation.",
  whenToAvoid: "Sans objet (sans fonction d’erreur, un algorithme n’a aucun objectif mathématique à améliorer).",
  parameters: [
    {
      impact: "Calcule l’erreur d’une prédiction individuelle : par exemple L(ŷ_i, y_i).",
      tuningTip: "Entropie croisée binaire pour 1 exemple : -[y·log(ŷ) + (1-y)·log(1-ŷ)]."
    },
    {
      impact: "La moyenne arithmétique (ou la somme) des pertes individuelles sur les N exemples d’entraînement.",
      tuningTip: "J(θ) = (1/N) ∑ L(ŷ_i, y_i) + pénalité de régularisation."
    }
  ],
  math: {
    loss: "Formulation du risque empirique",
    explanation: "Les algorithmes d’optimisation (comme la descente de gradient) calculent le gradient de la fonction de coût J(θ) pour ajuster les poids dans la direction qui réduit l’erreur totale."
  },
  pros: [
    "Traduit des objectifs métier qualitatifs (« faire moins d’erreurs ») en calcul différentiel rigoureux",
    "Des fonctions de perte sur mesure permettent de pénaliser des risques métier précis (par ex. une pénalité 10 fois plus forte pour les faux négatifs)"
  ],
  cons: [
    "Pour les méthodes à base de gradient, la fonction de perte doit être lisse et dérivable (l’exactitude ne peut pas servir directement de perte, car sa dérivée est nulle presque partout !)"
  ],
  diagram: `flowchart TD
    A["Exemple 1 : y₁ vs ŷ₁"] --> L1["Perte L₁"]
    B["Exemple 2 : y₂ vs ŷ₂"] --> L2["Perte L₂"]
    C["Exemple n : yₙ vs ŷₙ"] --> L3["Perte Lₙ"]
    L1 --> J["Coût J(θ) = moyenne de toutes les pertes"]
    L2 --> J
    L3 --> J
    R["Pénalité de régularisation (optionnelle)"] --> J
    J --> G["Gradient ∇J(θ)"]
    G --> U["Mettre à jour les paramètres θ"]
    U -.->|"nouvelles prédictions"| A`
};
