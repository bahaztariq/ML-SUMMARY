export default {
  name: "Erreur absolue moyenne (MAE)",
  category: "Métriques d’évaluation",
  task: ["Régression", "Métriques", "Évaluation"],
  summary: "La moyenne arithmétique de tous les écarts absolus entre valeurs prédites et valeurs réelles. Chaque erreur contribue proportionnellement, quelle que soit sa taille.",
  intuition: "Le juge équitable : contrairement à la RMSE, qui s’emballe pour une seule grosse erreur, la MAE traite toutes les erreurs de la même façon. Si 100 prédictions se trompent de 5 $ et une seule de 500 $, la MAE ne laisse pas cette valeur aberrante dominer.",
  whenToUse: "Quand toutes les erreurs doivent avoir le même poids. Quand votre jeu de données contient des valeurs aberrantes extrêmes qui ne doivent pas influencer de façon disproportionnée l’évaluation du modèle.",
  whenToAvoid: "Quand les grosses erreurs sont réellement catastrophiques et doivent être plus lourdement pénalisées (utilisez la RMSE ou une perte pondérée sur mesure).",
  parameters: [
    {
      impact: "Une erreur de 100 contribue exactement pour 100 (et non 10 000 comme dans la MSE).",
      tuningTip: "Métrique privilégiée pour les modèles immobiliers, financiers et de séries temporelles IoT présentant des pics de bruit."
    },
    {
      impact: "Utilise la médiane au lieu de la moyenne : totalement insensible à n’importe quel nombre de valeurs aberrantes extrêmes.",
      tuningTip: "Utilisez median_absolute_error de sklearn pour les jeux de données extrêmement bruités."
    }
  ],
  math: {
    loss: "Perte L1 / écart absolu moyen",
    explanation: "Prend la valeur absolue de chaque résidu (ce qui supprime le signe), puis en fait la moyenne. Sans mise au carré, les valeurs aberrantes ont une influence proportionnelle plutôt qu’amplifiée."
  },
  pros: [
    "Très robuste aux erreurs aberrantes extrêmes du jeu de données",
    "Facile à interpréter : « en moyenne, les prédictions se trompent de X unités »",
    "Même unité que la variable cible"
  ],
  cons: [
    "La fonction valeur absolue n’est pas dérivable en zéro (il faut des sous-gradients)",
    "Traite toutes les erreurs de la même façon, ce qui peut ne pas refléter l’asymétrie des coûts réels"
  ],
  diagram: `flowchart LR
    A["Valeurs réelles y"] --> C["Résidu = y − ŷ"]
    B["Prédictions ŷ"] --> C
    C --> D["Prendre la valeur absolue abs(y − ŷ)"]
    D --> E["Somme sur n échantillons"]
    E --> F["Diviser par n"]
    F --> G(["MAE dans l’unité de la cible"])`
};
