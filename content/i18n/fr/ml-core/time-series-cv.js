export default {
  name: "Validation croisée pour séries temporelles (walk-forward)",
  category: "Théorie du ML et validation",
  task: ["Évaluation", "Régression"],
  summary: "Des schémas de validation pour des données ordonnées dans le temps qui entraînent toujours sur le passé et testent sur le futur, afin que l’estimation de la performance reflète de vraies conditions de prévision, sans fuite d’information venant du futur.",
  intuition: "L’examen du prévisionniste météo : on ne peut pas noter un prévisionniste en le laissant jeter un œil au journal de la semaine prochaine. La validation walk-forward lui donne les données jusqu’à lundi, lui demande mardi, puis révèle mardi et lui demande mercredi, et ainsi de suite. Un k-Fold mélangé revient à lui donner des pages au hasard tirées du futur : n’importe qui passerait pour un génie.",
  whenToUse: "Prévision, tout modèle avec des variables de décalage (lag) ou glissantes, données financières et de capteurs, planification de la demande, ou tout jeu de données dont les lignes proches dans le temps sont corrélées et dont le modèle sera déployé sur des données futures.",
  whenToAvoid: "Données réellement i.i.d., sans ordre temporel ni dérive (un k-Fold stratifié standard exploite mieux les données), ou quand l’historique est trop court pour plusieurs plis significatifs.",
  parameters: [
    {
      impact: "Nombre de fenêtres entraînement/test successives.",
      tuningTip: "Choisissez-le pour que chaque fenêtre de test couvre un horizon significatif (par ex. une semaine ou une saison complète)."
    },
    {
      impact: "Longueur de chaque fenêtre de validation.",
      tuningTip: "Alignez-la sur l’horizon de prévision en production (prévision à 7 jours → test_size = 7 jours de lignes)."
    },
    {
      impact: "Nombre d’échantillons écartés entre l’entraînement et le test pour éviter les fuites via les variables de décalage ou l’autocorrélation.",
      tuningTip: "Fixez-le au moins à la taille de votre plus longue fenêtre de décalage ou glissante, ou du délai d’obtention des étiquettes."
    },
    {
      impact: "None = fenêtre croissante (tout l’historique) ; un entier = fenêtre glissante de longueur fixe.",
      tuningTip: "Utilisez une fenêtre glissante quand les données anciennes sont périmées à cause d’une dérive ou de changements de régime."
    }
  ],
  math: {
    loss: "Erreur de validation hors période moyenne",
    explanation: "Pour chaque pli k, le modèle est entraîné uniquement sur les données jusqu’à l’instant tₖ, saute un écart de g pas, puis est évalué sur les h pas suivants. Comme la fenêtre de test est toujours strictement dans le futur, le score moyen estime la vraie erreur de prévision plutôt qu’une erreur d’interpolation."
  },
  pros: [
    "Empêche les fuites d’information du futur qui rendent la CV mélangée follement optimiste",
    "Reproduit la façon dont le modèle est réellement réentraîné et utilisé en production",
    "Révèle, pli après pli, la dégradation de la performance dans le temps (dérive de concept)",
    "Le paramètre gap gère proprement les variables de décalage et les étiquettes tardives"
  ],
  cons: [
    "Les premiers plis s’entraînent sur peu de données et peuvent être pessimistes",
    "Exploite moins bien les données que le k-Fold (les points récents ne servent jamais à l’entraînement des premiers plis)",
    "Exige assez d’historique pour plusieurs fenêtres réalistes",
    "L’ingénierie des variables (décalages, statistiques glissantes) doit elle aussi tenir compte des plis pour éviter les fuites"
  ],
  diagram: `flowchart LR
    A["Données triées par date"] --> B["Pli 1 : entraîner sur t1..t3"]
    B --> C["Écart (sauter la fenêtre de décalage)"]
    C --> D["Tester sur t4"]
    D --> E["Pli 2 : entraîner sur t1..t4"]
    E --> F["Tester sur t5"]
    F --> G["Pli 3 : entraîner sur t1..t5"]
    G --> H["Tester sur t6"]
    D --> I["Collecter les scores des plis"]
    F --> I
    H --> I
    I --> J(["Erreur de prévision moyenne ± écart-type"])`
};
