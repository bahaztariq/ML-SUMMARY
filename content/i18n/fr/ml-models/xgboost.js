export default {
  name: "XGBoost",
  category: "Ensemble / Boosting",
  task: ["Classification", "Régression", "Classement (ranking)"],
  summary: "Une implémentation optimisée et hautement évolutive des arbres de décision à gradient boosting, qui utilise un développement de Taylor exact au second ordre.",
  intuition: "Apprendre de ses erreurs, itération après itération : chaque nouvel arbre est explicitement construit pour prédire les erreurs résiduelles (les gradients) laissées par tous les arbres précédents, pas à pas.",
  whenToUse: "La référence absolue pour l'apprentissage automatique compétitif sur données tabulaires. À utiliser lorsque vous avez besoin d'une précision prédictive de premier ordre et disposez de variables propres.",
  whenToAvoid: "Jeux de données très sales, non nettoyés et très bruités, ou lorsque la loi impose une interprétabilité totale du modèle et des coefficients simples.",
  parameters: [
    {
      impact: "Facteur de réduction appliqué aux poids après chaque étape de boosting.",
      tuningTip: "Des valeurs plus faibles (0,01 à 0,1) évitent le surapprentissage mais exigent un n_estimators plus élevé."
    },
    {
      impact: "Profondeur maximale d'un arbre.",
      tuningTip: "Contrairement à la forêt aléatoire, gardez-la faible (3 à 8). Des arbres boostés profonds surapprennent vite le bruit."
    },
    {
      impact: "Proportion des instances d'entraînement sous-échantillonnées.",
      tuningTip: "Fixez-la entre 0,7 et 0,85 pour ajouter une réduction de variance stochastique."
    },
    {
      impact: "Pénalité de régularisation sur les poids des feuilles.",
      tuningTip: "Augmentez reg_lambda pour lisser les prédictions extrêmes ; augmentez reg_alpha pour rendre l'usage des variables plus parcimonieux."
    }
  ],
  math: {
    loss: "Objectif personnalisé + régularisation Ω(f) = γ·T + ½·λ·∑w_j²",
    explanation: "Utilise les gradients d'ordre 1 (g_i) et les hessiennes d'ordre 2 (h_i) de la fonction de perte via une approximation de Taylor, ce qui donne des poids de feuilles optimaux sous forme analytique exacte et une convergence rapide."
  },
  pros: [
    "Précision à l'état de l'art sur presque tous les jeux de données tabulaires de référence",
    "La recherche de découpages tenant compte de la parcimonie gère automatiquement les valeurs manquantes",
    "Régularisation L1 et L2 intégrée directement dans la fonction objectif",
    "Accélération matérielle (entraînement sur GPU CUDA, traitement des données hors mémoire)"
  ],
  cons: [
    "Nombre important d'hyperparamètres sensibles qui demandent un réglage soigneux",
    "Plus sujet au surapprentissage que la forêt aléatoire si learning_rate est trop élevé",
    "Coûteux en calcul lors d'une recherche par grille sans GPU"
  ],
  diagram: `flowchart TD
    A[("DMatrix : données + étiquettes")] --> B["Prédiction courante F_t-1"]
    B --> C["Calculer les gradients g_i et les hessiennes h_i"]
    C --> D["Recherche de découpage tenant compte de la parcimonie : les valeurs manquantes prennent une direction par défaut"]
    D --> E["Gain = score(gauche) + score(droite) − score(parent) − γ"]
    E --> F["Poids de feuille optimal w = −Σg / (Σh + λ)"]
    F --> G["F_t = F_t-1 + η · f_t"]
    G --> H{"La métrique d'évaluation s'est-elle améliorée sur les N derniers tours ?"}
    H -->|"oui"| B
    H -->|"non"| I(["Arrêt anticipé : garder la meilleure itération"])`
};
