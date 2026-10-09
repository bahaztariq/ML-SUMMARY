export default {
  name: "Réglage des hyperparamètres (GridSearch et RandomSearch)",
  category: "Théorie du ML et optimisation",
  task: ["Réglage des hyperparamètres", "Sélection de modèle", "Optimisation"],
  summary: "Le processus systématique de recherche de la configuration optimale des hyperparamètres (réglages qui ne sont pas appris à partir des données) qui maximise la performance du modèle sur des données de validation mises de côté.",
  intuition: "Accorder une guitare : les paramètres du modèle (poids) sont les cordes qui vibrent. Les hyperparamètres (learning_rate, max_depth, régularisation) sont les chevilles que l’on tourne à la main avant de jouer. Une guitare parfaitement accordée sonne radicalement différemment d’une guitare désaccordée.",
  whenToUse: "Après avoir choisi l’algorithme et établi une référence (baseline). Quand les hyperparamètres par défaut ne donnent pas une performance satisfaisante.",
  whenToAvoid: "Avant d’avoir des données propres et une stratégie de validation correcte. Régler des variables médiocres ne produit que des modèles médiocres, plus vite.",
  parameters: [
    {
      impact: "Essaie TOUTES les combinaisons des valeurs d’hyperparamètres indiquées.",
      tuningTip: "Garantit de trouver la meilleure combinaison de la grille, mais le coût est exponentiel (10 valeurs × 10 valeurs = 100 ajustements × 5 plis de CV = 500 entraînements)."
    },
    {
      impact: "Tire au hasard n_iter combinaisons dans l’espace des paramètres.",
      tuningTip: "Trouve souvent 95 % de la solution optimale en 10 % du temps. Supérieur quand l’espace des paramètres est grand."
    },
    {
      impact: "Utilise les résultats des évaluations passées pour choisir intelligemment les prochains hyperparamètres à essayer.",
      tuningTip: "L’approche de pointe quand l’entraînement est coûteux (deep learning, XGBoost sur de gros volumes)."
    }
  ],
  math: {
    loss: "Optimisation sur l’espace des hyperparamètres",
    explanation: "Pour chaque configuration candidate θ, la validation croisée k-Fold calcule le score moyen. La configuration ayant le meilleur score moyen en CV est retenue comme optimale."
  },
  pros: [
    "Trouve systématiquement des configurations nettement meilleures que les essais manuels",
    "L’intégration de la validation croisée évite de surapprendre les particularités du jeu de validation",
    "GridSearchCV et RandomizedSearchCV de sklearn gèrent automatiquement le parallélisme"
  ],
  cons: [
    "Coûteux en calcul : chaque combinaison exige un entraînement complet × k plis de CV",
    "Risque de surapprendre le jeu de validation si l’on explore trop de combinaisons d’hyperparamètres"
  ],
  diagram: `flowchart TD
    A["Définir l’espace de recherche"] --> B{"Stratégie de recherche"}
    B -->|"grille"| C["Toutes les combinaisons"]
    B -->|"aléatoire"| D["Tirer N combinaisons"]
    B -->|"bayésienne"| E["Choisir la config suivante via un modèle de substitution"]
    C --> F["Évaluer la config par CV k-fold"]
    D --> F
    E --> F
    F --> G["Noter le score moyen en CV"]
    G --> H{"Reste-t-il du budget ?"}
    H -->|"oui"| B
    H -->|"non"| I["Réentraîner la meilleure config sur tout l’entraînement"]
    I --> J(["Évaluation finale sur l’ensemble de test"])`
};
