export default {
  name: "Régularisation (L1 Lasso et L2 Ridge)",
  category: "Théorie du ML et optimisation",
  task: ["Régularisation", "Prévention du surapprentissage", "Sélection de variables"],
  summary: "Des termes de pénalité ajoutés à la fonction de coût du modèle, qui limitent l’amplitude des poids appris et préviennent le surapprentissage en décourageant une complexité inutile.",
  intuition: "La limitation de vitesse sur l’autoroute : sans régularisation, un modèle est une voiture de course sans limite de vitesse (les poids peuvent devenir astronomiques pour ajuster le bruit). La régularisation installe des ralentisseurs (pénalités sur l’amplitude des poids) qui freinent le modèle et empêchent un surapprentissage imprudent.",
  whenToUse: "Quand votre modèle surapprend (exactitude d’entraînement >> exactitude de validation). Quand vous avez plus de variables que d’échantillons. Quand vous soupçonnez que beaucoup de variables sont inutiles.",
  whenToAvoid: "Quand votre modèle sous-apprend (exactitudes d’entraînement et de validation toutes deux faibles). La régularisation aggraverait le sous-apprentissage en contraignant encore plus le modèle.",
  parameters: [
    {
      impact: "Ramène exactement à zéro les poids des variables non informatives, ce qui réalise une sélection de variables automatique.",
      tuningTip: "Utilisez L1 quand vous soupçonnez que la plupart des variables sont inutiles et que vous voulez trouver les quelques-unes qui comptent."
    },
    {
      impact: "Réduit tous les poids proportionnellement vers zéro, sans jamais les annuler exactement.",
      tuningTip: "Utilisez L2 quand toutes les variables sont potentiellement pertinentes et que vous voulez répartir l’influence entre elles."
    },
    {
      impact: "Combine la parcimonie de L1 et la stabilité de L2. Le mélange est contrôlé par le paramètre α.",
      tuningTip: "À utiliser quand vous avez des groupes de variables corrélées et que vous voulez à la fois sélection et stabilité."
    },
    {
      impact: "Contrôle l’intensité de la pénalité. λ=0 signifie aucune régularisation. λ→∞ ramène tous les poids à zéro.",
      tuningTip: "Réglez-le par validation croisée. Cherchez sur une échelle logarithmique : [0.0001, 0.001, 0.01, 0.1, 1, 10, 100]."
    }
  ],
  math: {
    loss: "Optimisation sous contrainte",
    explanation: "La pénalité ajoutée R(w) crée un arbitrage : le modèle doit à la fois minimiser l’erreur de prédiction ET garder des poids petits. Cela empêche la mémorisation du bruit d’entraînement en restreignant l’espace d’hypothèses."
  },
  pros: [
    "Réduit fortement le surapprentissage sur les jeux de données de grande dimension ou bruités",
    "L1 réalise une sélection de variables automatique en annulant les poids inutiles",
    "L2 garantit une solution unique même quand les variables sont corrélées (corrige la multicolinéarité)"
  ],
  cons: [
    "Ajoute un hyperparamètre (λ) à régler par validation croisée",
    "Les solutions L1 ne sont pas uniques quand des variables sont parfaitement corrélées",
    "Peut provoquer du sous-apprentissage si λ est trop élevé"
  ],
  diagram: `flowchart TD
    A["Perte d’origine (par ex. MSE)"] --> B["Ajouter pénalité × λ"]
    B --> C{"Type de pénalité"}
    C -->|"L1 : λ·Σ abs(w)"| D["Attraction constante vers zéro"]
    C -->|"L2 : λ·Σ w²"| E["Attraction proportionnelle à la taille du poids"]
    D --> F["Beaucoup de poids exactement à 0 → sélection de variables"]
    E --> G["Tous les poids diminuent en douceur"]
    F --> H["Variance plus faible, biais légèrement plus élevé"]
    G --> H
    H --> I(["Régler λ par validation croisée"])`
};
