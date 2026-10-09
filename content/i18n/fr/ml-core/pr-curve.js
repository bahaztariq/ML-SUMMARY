export default {
  name: "Courbe précision-rappel et précision moyenne",
  category: "Métriques d’évaluation",
  task: ["Évaluation", "Classification"],
  summary: "Trace la précision en fonction du rappel pour chaque seuil de décision possible et résume la courbe par la précision moyenne (PR-AUC), la métrique de classement de référence pour la classification d’événements rares.",
  intuition: "Le bouton du détecteur de métaux : baissez la sensibilité et il ne bipe que sur l’or (précision élevée), mais vous passez à côté de la plupart des pièces (rappel faible). Montez-la et vous trouvez toutes les pièces, mais vous déterrez aussi des capsules de bouteille. La courbe PR enregistre chaque position du bouton ; un détecteur dont la courbe épouse le coin supérieur droit est tout simplement un meilleur détecteur.",
  whenToUse: "Problèmes binaires très déséquilibrés (fraude, détection d’anomalies, maladies rares, recherche d’information) où la classe positive est celle qui compte et où les vrais négatifs sont nombreux et sans intérêt.",
  whenToAvoid: "Problèmes équilibrés où les deux classes comptent autant (la ROC-AUC est plus facile à interpréter), ou quand il vous faut des probabilités calibrées plutôt qu’un classement (utilisez la log-loss ou le score de Brier).",
  parameters: [
    {
      impact: "Scores continus servant à classer les échantillons. Des étiquettes 0/1 réduisent la courbe à un seul point.",
      tuningTip: "Passez des probabilités ou les sorties de decision_function, jamais les étiquettes de predict()."
    },
    {
      impact: "Définit la classe pour laquelle la courbe est calculée.",
      tuningTip: "Toujours la classe minoritaire / la classe événement ; la courbe de la classe majoritaire est en général quasi parfaite et dénuée de sens."
    },
    {
      impact: "La PR-AUC d’un classifieur aléatoire est égale au taux de la classe positive, et non à 0.5.",
      tuningTip: "Indiquez toujours l’AP à côté de la prévalence : une AP de 0.30 est excellente quand les positifs représentent 0.5 % des données."
    },
    {
      impact: "Le seuil unique que vous déployez, choisi sur la courbe.",
      tuningTip: "Choisissez le seuil qui respecte une contrainte métier (par ex. précision ≥ 0.9) à l’aide du tableau thresholds renvoyé par precision_recall_curve."
    }
  ],
  math: {
    loss: "Aire sous la courbe précision-rappel",
    explanation: "Les échantillons sont triés par score ; à chaque seuil n, on note la précision Pₙ et le rappel Rₙ. La précision moyenne additionne la précision à chaque palier de rappel, pondérée par l’augmentation du rappel, ce qui approche l’aire sous la courbe sans l’interpolation linéaire trop optimiste."
  },
  pros: [
    "Se concentre entièrement sur la classe positive : une foule de négatifs faciles ne peut pas la gonfler",
    "Bien plus sensible que la ROC-AUC aux améliorations sur les problèmes d’événements rares",
    "Résumé indépendant du seuil, et outil visuel pour choisir un point de fonctionnement",
    "Métrique standard en recherche d’information et en détection d’objets (mAP)"
  ],
  cons: [
    "La référence dépend de la prévalence : les scores ne sont pas comparables d’un jeu de données à l’autre",
    "La courbe est irrégulière et bruitée quand il y a peu de positifs",
    "Ignore les vrais négatifs, qui comptent dans certaines applications",
    "Plus difficile à expliquer aux parties prenantes qu’un simple couple précision/rappel"
  ],
  diagram: `flowchart TD
    A["Scores du modèle sur l’ensemble de test"] --> B["Trier les échantillons par score, du plus haut au plus bas"]
    B --> C["Abaisser le seuil un échantillon à la fois"]
    C --> D["Calculer la précision à ce seuil"]
    C --> E["Calculer le rappel à ce seuil"]
    D --> F["Placer le point (rappel, précision)"]
    E --> F
    F --> G{"D’autres seuils ?"}
    G -->|"oui"| C
    G -->|"non"| H["Précision moyenne = aire sous la courbe"]
    H --> I["Comparer à la référence de prévalence"]
    F --> J["Choisir le seuil de déploiement"]`
};
