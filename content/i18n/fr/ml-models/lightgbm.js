export default {
  name: "LightGBM",
  category: "Ensemble / Boosting",
  task: ["Classification", "Régression", "Classement (ranking)"],
  summary: "Un framework de gradient boosting de Microsoft qui recherche les découpages à partir d'histogrammes et fait croître les arbres feuille par feuille, pour un entraînement nettement plus rapide que XGBoost sur de grands jeux de données.",
  intuition: "Le bolide du boosting : au lieu d'essayer tous les points de découpage possibles, LightGBM répartit les variables continues dans environ 255 intervalles d'histogramme et n'évalue que leurs bornes ; il fait aussi croître les arbres feuille par feuille. Sur de gros volumes, l'entraînement devient plusieurs fois plus rapide qu'une recherche exacte de découpage, pour une perte de précision négligeable. (XGBoost a depuis adopté lui aussi les découpages par histogramme, via tree_method=\"hist\".)",
  whenToUse: "Grands jeux de données tabulaires (plus de 100 000 lignes). Compétitions Kaggle. Lorsque la vitesse d'entraînement compte. Lorsque vous avez des variables catégorielles à forte cardinalité.",
  whenToAvoid: "Très petits jeux de données (moins de 2 000 échantillons), où la croissance feuille par feuille peut entraîner un surapprentissage marqué.",
  parameters: [
    {
      impact: "Nombre maximal de feuilles par arbre. Contrôle la complexité du modèle.",
      tuningTip: "Gardez num_leaves < 2^max_depth pour éviter le surapprentissage. Commencez à 31 et réglez entre 20 et 100."
    },
    {
      impact: "Réduction de la taille du pas pour éviter le surapprentissage.",
      tuningTip: "Des valeurs plus faibles (0,01–0,05) exigent davantage d'itérations de boosting mais généralisent mieux."
    },
    {
      impact: "Fraction des variables tirées au hasard pour chaque arbre.",
      tuningTip: "Fixez-la entre 0,6 et 0,9 pour ajouter de l'aléa et réduire le surapprentissage (comme le fait la forêt aléatoire)."
    },
    {
      impact: "Indique quelles variables sont catégorielles, pour un traitement natif avec découpage optimal.",
      tuningTip: "LightGBM gère nativement les variables catégorielles (pas besoin de one-hot !) grâce à des algorithmes de découpage optimal."
    }
  ],
  math: {
    loss: "Gradient One-Side Sampling (GOSS) + Exclusive Feature Bundling (EFB)",
    explanation: "GOSS conserve toutes les instances à fort gradient et échantillonne au hasard celles à faible gradient, concentrant le calcul là où le modèle se trompe le plus. EFB regroupe les variables creuses mutuellement exclusives afin de réduire la dimension."
  },
  pros: [
    "Entraînement beaucoup plus rapide sur de grands jeux de données grâce aux découpages par histogramme, à GOSS et à la croissance feuille par feuille",
    "Traitement natif et optimal des variables catégorielles (aucun encodage manuel nécessaire)",
    "Consommation mémoire réduite grâce à la discrétisation en histogrammes",
    "Précision à l'état de l'art, comparable à XGBoost"
  ],
  cons: [
    "La croissance feuille par feuille peut surapprendre sur de petits jeux de données (limitez avec max_depth)",
    "Moins de documentation communautaire que XGBoost",
    "Sensible à l'hyperparamètre num_leaves"
  ],
  diagram: `flowchart TD
    A[("Grand jeu de données tabulaires")] --> B["Répartir les variables en histogrammes (max_bin)"]
    B --> C["GOSS : garder les lignes à fort gradient, échantillonner celles à faible gradient"]
    C --> D["EFB : regrouper les variables creuses mutuellement exclusives"]
    D --> E["Croissance feuille par feuille : découper la feuille au gain maximal"]
    E --> F{"num_leaves ou min_data_in_leaf atteint ?"}
    F -->|"non"| E
    F -->|"oui"| G["Ajouter l'arbre × learning_rate à l'ensemble"]
    G --> H{"Arrêt anticipé ?"}
    H -->|"continuer"| C
    H -->|"arrêter"| I(["Modèle boosté final"])`
};
