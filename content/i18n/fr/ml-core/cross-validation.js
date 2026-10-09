export default {
  name: "Validation croisée (k-Fold CV)",
  category: "Théorie du ML et validation",
  task: ["Validation", "Évaluation", "Réglage des hyperparamètres"],
  summary: "Une technique de rééchantillonnage qui divise les données d’entraînement en k plis égaux, entraîne le modèle k fois sur k-1 plis et le valide à chaque fois sur le pli restant. Elle rapporte la performance moyenne sur les k tours.",
  intuition: "Le tournoi toutes rondes : au lieu de jouer UN seul match (un unique découpage entraînement/test), vous en jouez k. Chaque joueur (pli) sert à son tour d’ensemble de test pendant que les autres s’entraînent. Le score moyen sur tous les matchs est bien plus fiable que celui d’une seule partie.",
  whenToUse: "Réglage des hyperparamètres, sélection de modèle et estimation robuste de la performance. Indispensable quand le jeu de données est trop petit pour mettre de côté un grand ensemble de test.",
  whenToAvoid: "Très grands jeux de données (> 1M d’échantillons), où un simple découpage 80/20 donne déjà des estimations stables et où le k-Fold gaspillerait du calcul.",
  parameters: [
    {
      impact: "Nombre de plis. Chaque pli sert une fois d’ensemble de test.",
      tuningTip: "k=5 est le standard du secteur. k=10 pour les petits jeux de données. k=n (Leave-One-Out) pour les jeux extrêmement petits."
    },
    {
      impact: "Chaque pli conserve la même proportion de chaque classe que le jeu de données complet.",
      tuningTip: "Utilisez TOUJOURS StratifiedKFold en classification pour éviter un déséquilibre des classes à l’intérieur des plis."
    },
    {
      impact: "Garantit que les données d’entraînement précèdent toujours chronologiquement les données de test.",
      tuningTip: "Obligatoire en prévision de séries temporelles pour empêcher les données futures de fuir dans l’entraînement."
    }
  ],
  math: {
    loss: "Moyenne de k scores de validation",
    explanation: "Chacun des k modèles est entraîné sur (k-1)/k des données et évalué sur le 1/k restant. La moyenne des k scores donne une estimation de la performance en généralisation de plus faible variance que n’importe quel découpage aléatoire unique."
  },
  pros: [
    "Chaque point de données sert à la fois à l’entraînement ET à la validation (exploitation maximale des données)",
    "Fournit la moyenne ET l’écart-type de la performance (quantifie la fiabilité)",
    "La référence absolue pour la sélection de modèle et le réglage des hyperparamètres"
  ],
  cons: [
    "k fois plus coûteux en calcul qu’un unique découpage entraînement/test",
    "Inadaptée aux séries temporelles sans découpage temporel spécifique (TimeSeriesSplit)"
  ],
  diagram: `flowchart TD
    A["Données d’entraînement"] --> B["Diviser en k plis"]
    B --> C["Tour i : mettre de côté le pli i"]
    C --> D["Ajuster le modèle sur les k-1 autres plis"]
    D --> E["Évaluer sur le pli i mis de côté"]
    E --> F{"Les k plis ont-ils tous servi ?"}
    F -->|"non"| C
    F -->|"oui"| G["Moyenne des k scores"]
    G --> H(["Estimation de la performance : moyenne ± écart-type"])`
};
