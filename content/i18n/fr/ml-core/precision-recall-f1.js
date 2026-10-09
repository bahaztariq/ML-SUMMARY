export default {
  name: "Précision, rappel et score F1",
  category: "Métriques d’évaluation",
  task: ["Évaluation", "Classification"],
  summary: "Des métriques de classification dépendantes du seuil qui mesurent la fiabilité des prédictions positives (précision), la part des vrais positifs détectés (rappel) et leur équilibre harmonique (F1).",
  intuition: "Le filet de pêche : la précision demande « de tout ce qui est dans mon filet, quelle part est vraiment du poisson (et pas des bottes ou des algues) ? ». Le rappel demande « de tous les poissons du lac, combien mon filet en a-t-il attrapé ? ». Un filet immense attrape tous les poissons (rappel élevé) mais aussi des tonnes de déchets (précision faible) ; le F1 récompense un filet qui réussit les deux.",
  whenToUse: "Toute tâche de classification où l’exactitude est trompeuse, en particulier les problèmes déséquilibrés (fraude, maladie, spam). Privilégiez la précision quand les faux positifs coûtent cher, le rappel quand les faux négatifs coûtent cher, et le F1 quand les deux comptent.",
  whenToAvoid: "Quand il vous faut une métrique de classement indépendante du seuil (utilisez la ROC-AUC ou la PR-AUC), ou quand les classes sont équilibrées et que les erreurs coûtent autant (l’exactitude simple est plus facile à communiquer).",
  parameters: [
    {
      impact: "Comment combiner les scores par classe en multiclasse : 'macro' (moyenne non pondérée), 'weighted' (pondérée par l’effectif), 'micro' (comptes globaux).",
      tuningTip: "Utilisez 'macro' quand chaque classe compte autant (les classes rares pèsent autant que les fréquentes) ; 'weighted' pour refléter la fréquence des classes."
    },
    {
      impact: "Quelle classe est considérée comme l’événement « positif » qui nous intéresse.",
      tuningTip: "Choisissez toujours la classe RARE et importante (fraude = 1, maladie = 1). L’inverser change tous les chiffres."
    },
    {
      impact: "Dans le score F-bêta, donne au rappel β fois plus d’importance qu’à la précision.",
      tuningTip: "β=2 pour le dépistage médical (manquer un patient malade est pire) ; β=0.5 pour les filtres anti-spam (bloquer un vrai e-mail est pire)."
    },
    {
      impact: "Seuil de probabilité au-delà duquel un échantillon est étiqueté positif. L’augmenter accroît la précision et diminue le rappel.",
      tuningTip: "Réglez le seuil sur un jeu de validation pour atteindre un objectif métier (par ex. « rappel ≥ 0.95 »), jamais sur l’ensemble de test."
    }
  ],
  math: {
    loss: "Moyenne harmonique de la précision et du rappel",
    explanation: "La précision divise les vrais positifs par tout ce qui est prédit positif ; le rappel divise les vrais positifs par tout ce qui est réellement positif. Le F1 utilise la moyenne harmonique, qui tire vers la plus petite des deux valeurs : un modèle ne peut donc pas obtenir un bon score en maximisant une seule des deux."
  },
  pros: [
    "Directement interprétable en termes métier (fausses alertes vs cas manqués)",
    "Robuste au déséquilibre des classes, contrairement à l’exactitude simple",
    "Le F-bêta permet d’encoder en un seul nombre le coût relatif des FP et des FN",
    "Les rapports par classe montrent sur quelles classes un modèle multiclasse a du mal"
  ],
  cons: [
    "Dépend d’un seul seuil de décision (un seul point de la courbe PR)",
    "Ignore complètement les vrais négatifs, et ne dit donc rien de la spécificité",
    "Les moyennes macro/micro/pondérée peuvent raconter des histoires très différentes en multiclasse",
    "Le F1 suppose que précision et rappel ont la même importance, ce qui est rarement vrai"
  ],
  diagram: `flowchart TD
    A["Probabilités prédites"] --> B{"proba ≥ seuil ?"}
    B -->|"oui"| C["Prédit positif"]
    B -->|"non"| D["Prédit négatif"]
    C --> E["TP : réellement positif"]
    C --> F["FP : réellement négatif"]
    D --> G["FN : réellement positif"]
    E --> H["Précision = TP / (TP + FP)"]
    F --> H
    E --> I["Rappel = TP / (TP + FN)"]
    G --> I
    H --> J["F1 = moyenne harmonique de P et R"]
    I --> J`
};
