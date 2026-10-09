export default {
  name: "Forêt aléatoire (Random Forest)",
  category: "Ensemble / Bagging",
  task: ["Classification", "Régression"],
  summary: "Un ensemble d'arbres de décision décorrélés, entraînés sur des échantillons bootstrap avec des sous-ensembles aléatoires de variables.",
  intuition: "La sagesse des foules : au lieu de consulter un seul expert facilement biaisé (un arbre de décision isolé), vous interrogez un comité varié de centaines d'arbres et retenez le vote majoritaire ou la moyenne.",
  whenToUse: "Excellent modèle de référence de premier choix pour les données tabulaires. Quand vous avez besoin d'une bonne précision, d'un effort de réglage limité et d'une protection solide contre le surapprentissage.",
  whenToAvoid: "Exigences d'inférence en temps réel à très faible latence (évaluer 500 arbres prend du temps) ou données textuelles creuses de grande dimension (où les modèles linéaires excellent).",
  parameters: [
    {
      impact: "Détermine le nombre d'arbres construits.",
      tuningTip: "Plus, c'est presque toujours mieux et cela ne provoque pas de surapprentissage, mais la mémoire et le temps d'inférence augmentent. 100 à 500 est une valeur typique."
    },
    {
      impact: "Limite la profondeur maximale de chaque arbre.",
      tuningTip: "Laissez None ou réglez entre 10 et 30 pour éviter des arbres individuels trop profonds et réduire la taille du fichier du modèle."
    },
    {
      impact: "Nombre minimal d'échantillons requis pour découper un nœud interne.",
      tuningTip: "Augmentez-le à 5–10 pour lutter contre le surapprentissage sur des données bruitées."
    },
    {
      impact: "Nombre de variables tirées au hasard pour chaque découpage candidat.",
      tuningTip: "« sqrt » décorrèle les arbres, de sorte qu'une variable dominante ne s'impose pas dans chacun d'eux."
    }
  ],
  math: {
    loss: "Impureté de Gini / entropie (classification) ou MSE / MAE (régression)",
    explanation: "En moyennant B arbres bootstrap de corrélation ρ, le second terme tend vers zéro lorsque B devient grand. Le sous-échantillonnage aléatoire des variables réduit directement la corrélation ρ, ce qui diminue fortement la variance globale sans augmenter le biais."
  },
  pros: [
    "Extrêmement résistante au surapprentissage comparée à un arbre de décision seul",
    "Ne nécessite pratiquement aucune mise à l'échelle des variables (fonctionne directement sur les nombres tabulaires bruts)",
    "Gère naturellement les interactions non linéaires entre variables et les découpages catégoriels",
    "Fournit des classements fiables d'importance des variables intégrés (MDI / permutation)"
  ],
  cons: [
    "Peut produire des fichiers de modèle volumineux (des centaines de mégaoctets pour des forêts profondes)",
    "Ne peut pas extrapoler les tendances numériques au-delà des valeurs min/max vues à l'entraînement",
    "Débit de prédiction plus lent que celui des modèles linéaires légers"
  ],
  diagram: `flowchart TD
    A[("Données d'entraînement")] --> B1["Échantillon bootstrap 1"]
    A --> B2["Échantillon bootstrap 2"]
    A --> B3["Échantillon bootstrap B"]
    B1 --> T1["Arbre 1 : sous-ensemble aléatoire de variables à chaque découpage"]
    B2 --> T2["Arbre 2 : sous-ensemble aléatoire de variables à chaque découpage"]
    B3 --> T3["Arbre B : sous-ensemble aléatoire de variables à chaque découpage"]
    T1 --> V["Agréger les prédictions"]
    T2 --> V
    T3 --> V
    V --> R(["Vote majoritaire (classif.) ou moyenne (régr.)"])
    A -.->|"lignes laissées de côté"| O["Estimation de l'erreur out-of-bag"]`
};
