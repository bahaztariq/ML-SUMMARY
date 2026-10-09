export default {
  name: "Apprentissage par transfert et fine-tuning",
  category: "Stratégies d’entraînement",
  task: ["Vision par ordinateur", "TAL", "Optimisation"],
  summary: "Réutiliser un modèle pré-entraîné sur un immense jeu de données comme point de départ d’une nouvelle tâche, puis l’adapter avec une petite quantité de données propres à cette tâche.",
  intuition: "Le chef expérimenté : un chef formé pendant des années à la cuisine française ne réapprend pas à tenir un couteau en ouvrant un bar à sushis. Il garde ses compétences de base (le backbone pré-entraîné) et n’apprend que les nouvelles recettes (la nouvelle tête), en affinant parfois sa technique (le fine-tuning) en chemin.",
  whenToUse: "Jeux de données étiquetés petits ou moyens (de quelques centaines à quelques dizaines de milliers d’exemples) en vision, TAL ou audio ; dès qu’un bon modèle pré-entraîné existe pour un domaine proche ; budgets de calcul ou de temps serrés.",
  whenToAvoid: "Quand le domaine cible est radicalement différent des données de pré-entraînement (par ex. des poids ImageNet pour des spectrogrammes radar aideront peu), quand vous disposez de données du domaine et de calcul en masse, ou pour les problèmes tabulaires classiques.",
  parameters: [
    { impact: "Les couches gelées gardent leurs poids pré-entraînés ; les couches dégelées s’adaptent aux nouvelles données.", tuningTip: "Tout petit jeu de données : n’entraînez que la tête. Jeu moyen : dégelez les blocs supérieurs. Grand jeu : faites le fine-tuning de tout le modèle." },
    { impact: "Trop élevé, il détruit les connaissances pré-entraînées (oubli catastrophique).", tuningTip: "Utilisez un LR 10 à 100 fois plus petit pour le backbone que pour la nouvelle tête (taux d’apprentissage discriminants)." },
    { impact: "Taille des matrices d’adaptateurs de rang faible dans le fine-tuning économe en paramètres (PEFT).", tuningTip: "LoRA entraîne moins de 1 % des poids ; c’est le choix standard pour le fine-tuning de LLM sur un seul GPU." },
    { impact: "Remplace la couche de sortie d’origine pour correspondre au nouvel ensemble d’étiquettes.", tuningTip: "Réinitialisez toujours la tête ; réutilisez le prétraitement des entrées du modèle pré-entraîné (normalisation, tokenizer)." }
  ],
  math: {
    loss: "Perte de la tâche (entropie croisée, MSE) sur le jeu de données cible",
    explanation: "Au lieu de partir de poids aléatoires, l’optimisation commence à θ_pretrained, qui encode déjà des caractéristiques générales (bords et formes pour les images, grammaire et faits pour le texte). Il suffit d’un court trajet, avec un faible taux d’apprentissage, pour atteindre une bonne solution sur la nouvelle tâche. LoRA garde W gelé et apprend à la place une petite mise à jour de rang faible B·A."
  },
  pros: [
    "Atteint une grande précision avec très peu de données étiquetées",
    "Réduit le temps et le coût d’entraînement de plusieurs ordres de grandeur",
    "Les caractéristiques pré-entraînées sont robustes et généralisent bien",
    "Les méthodes économes en paramètres (LoRA, adaptateurs) rendent la personnalisation de LLM abordable"
  ],
  cons: [
    "Oubli catastrophique si le taux d’apprentissage est trop élevé",
    "Hérite des biais et des restrictions de licence du modèle pré-entraîné",
    "Un écart de domaine peut limiter le bénéfice (voire nuire)",
    "Les grands modèles pré-entraînés peuvent être lourds à déployer"
  ],
  diagram: `flowchart TD
  P[("Immense jeu de données : ImageNet / texte du web")] --> PT["Pré-entraîner un grand modèle"]
  PT --> BB["Backbone pré-entraîné (caractéristiques générales)"]
  BB --> H["Remplacer la tête de sortie pour les nouvelles étiquettes"]
  D[("Petit jeu de données de la tâche")] --> F1
  H --> F1["Phase 1 : geler le backbone, entraîner la tête"]
  F1 --> Q{"Assez de données et écart de précision ?"}
  Q -->|"non"| DONE(["Déployer le modèle d’extraction de caractéristiques"])
  Q -->|"oui"| F2["Phase 2 : dégeler les couches supérieures, LR minuscule"]
  F2 --> L["Option : adaptateurs LoRA au lieu d’un dégel complet"]
  L --> E["Évaluer sur le jeu de validation"]
  E --> DONE2(["Déployer le modèle affiné"])`
};
