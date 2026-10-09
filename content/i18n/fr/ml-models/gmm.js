export default {
  name: "Modèles de mélange gaussien (GMM)",
  category: "Clustering",
  task: ["Clustering", "Estimation de densité", "Non supervisé"],
  summary: "Modélise les données comme un mélange de plusieurs lois gaussiennes et attribue à chaque point une probabilité d'appartenance à chaque cluster ; l'ajustement se fait par l'algorithme Espérance-Maximisation (EM).",
  intuition: "Les projecteurs qui se chevauchent : imaginez une scène sombre éclairée par plusieurs projecteurs elliptiques de tailles et d'angles différents. Chaque point de la scène est éclairé en partie par plusieurs projecteurs. Le GMM détermine où se trouve chaque projecteur, quelle est sa largeur, son inclinaison et combien il contribue à chaque point — ce qui donne des appartenances souples et probabilistes au lieu de frontières nettes.",
  whenToUse: "Quand les clusters sont elliptiques, de tailles ou d'orientations différentes, ou se chevauchent ; quand vous avez besoin de probabilités d'appartenance (clustering souple) ; pour l'estimation de densité et la génération d'échantillons ; ou pour la détection d'anomalies fondée sur la vraisemblance.",
  whenToAvoid: "Clusters non convexes ou de forme arbitraire (utilisez DBSCAN), données en très grande dimension où les matrices de covariance complètes deviennent instables, ou très petits jeux de données où les estimations de covariance ne sont pas fiables.",
  parameters: [
    {
      impact: "Nombre de composantes gaussiennes (clusters).",
      tuningTip: "Choisissez-le en minimisant le BIC ou l'AIC sur une plage de valeurs plutôt qu'en devinant."
    },
    {
      impact: "Liberté de forme de chaque gaussienne : « full », « tied », « diag », « spherical ».",
      tuningTip: "« full » est le plus flexible ; passez à « diag » en grande dimension pour réduire le nombre de paramètres et éviter les matrices singulières. « spherical » ≈ K-Means souple."
    },
    {
      impact: "Nombre de redémarrages de l'EM à partir d'initialisations différentes ; le meilleur est conservé.",
      tuningTip: "L'EM converge vers des optima locaux — utilisez 5 à 10 pour des résultats plus stables."
    },
    {
      impact: "Petite valeur ajoutée à la diagonale des covariances pour la stabilité numérique.",
      tuningTip: "Augmentez-la (de 1e-4 à 1e-3) si vous obtenez des erreurs de covariance singulière."
    }
  ],
  math: {
    loss: "Log-vraisemblance négative (vraisemblance maximisée par EM)",
    explanation: "L'étape E calcule les responsabilités γ_ik — la probabilité que le point i provienne de la composante k. L'étape M réestime le poids π_k, la moyenne μ_k et la covariance Σ_k de chaque composante sous forme de moyennes pondérées par les responsabilités. Chaque itération de l'EM garantit que la vraisemblance ne diminue pas."
  },
  pros: [
    "Affectations souples et probabilistes aux clusters",
    "Capture des clusters elliptiques de tailles et d'orientations différentes",
    "Sert aussi d'estimateur de densité et de modèle génératif (peut échantillonner de nouveaux points)",
    "Sélection de modèle rigoureuse avec le BIC / l'AIC"
  ],
  cons: [
    "Il faut choisir le nombre de composantes",
    "L'EM peut converger vers de mauvais optima locaux — sensible à l'initialisation",
    "Suppose des clusters de forme gaussienne",
    "La covariance complète passe mal à l'échelle avec la dimension (d² paramètres par composante)"
  ],
  diagram: `flowchart TD
    A[("Données mises à l'échelle X")] --> B["Initialiser k gaussiennes (μ, Σ, π), p. ex. à partir de K-Means"]
    B --> C["Étape E : calculer les responsabilités γ_ik de chaque point"]
    C --> D["Étape M : mettre à jour π_k, μ_k, Σ_k par moyennes pondérées"]
    D --> E["Calculer la log-vraisemblance"]
    E --> F{"Convergence ?"}
    F -->|"non"| C
    F -->|"oui"| G["Modèle de mélange ajusté"]
    G --> H(["Probabilités d'appartenance souples"])
    G --> I(["Scores de densité pour la détection d'anomalies"])
    G --> J(["Générer des données synthétiques"])`
};
