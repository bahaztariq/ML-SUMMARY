export default {
  name: "Courbe ROC et score AUC",
  category: "Métriques d’évaluation",
  task: ["Classification", "Métriques", "Évaluation"],
  summary: "La courbe ROC (Receiver Operating Characteristic) trace le taux de vrais positifs en fonction du taux de faux positifs pour chaque seuil de classification possible. L’AUC (aire sous la courbe) résume la capacité de discrimination globale en un seul nombre entre 0 et 1.",
  intuition: "Le test du bouton universel : au lieu d’évaluer votre modèle à un seul seuil (0.5), la ROC-AUC le teste à TOUS les seuils possibles de 0.0 à 1.0 et résume sa qualité globale. AUC = 0.5 équivaut à un pile ou face ; AUC = 1.0 signifie une séparation parfaite.",
  whenToUse: "Évaluation de classification binaire, en particulier quand la distribution des classes est déséquilibrée. Comparer des modèles indépendamment du choix du seuil.",
  whenToAvoid: "Problèmes multiclasses (nécessite une adaptation un-contre-tous). Quand la précision à des seuils précis compte plus que le classement global (utilisez plutôt les courbes précision-rappel).",
  parameters: [
    {
      impact: "TP / (TP + FN) — proportion des positifs réels correctement identifiés.",
      tuningTip: "TPR élevé = la plupart des positifs sont détectés (mais peut-être au prix de plus de fausses alertes)."
    },
    {
      impact: "FP / (FP + TN) — proportion des négatifs réels signalés à tort comme positifs.",
      tuningTip: "FPR faible = moins de fausses alertes (mais peut-être des vrais positifs manqués)."
    },
    {
      impact: "Probabilité que le modèle classe un positif tiré au hasard au-dessus d’un négatif tiré au hasard.",
      tuningTip: "AUC > 0.9 : excellente | 0.8-0.9 : bonne | 0.7-0.8 : passable | < 0.7 : discrimination médiocre."
    }
  ],
  math: {
    loss: "Aire sous la courbe ROC",
    explanation: "La ROC-AUC mesure la capacité du modèle à classer les exemples positifs au-dessus des exemples négatifs sur tous les seuils de décision possibles. Elle est égale à la probabilité qu’un échantillon positif tiré au hasard obtienne un score supérieur à celui d’un échantillon négatif tiré au hasard."
  },
  pros: [
    "Indépendante du seuil : évalue la qualité du modèle sur tous les points de fonctionnement possibles",
    "Plus robuste au déséquilibre des classes que l’exactitude brute",
    "Un seul nombre (l’AUC) rend la comparaison de modèles simple"
  ],
  cons: [
    "Peut être trop optimiste sur des jeux de données très déséquilibrés (utilisez plutôt la PR-AUC)",
    "N’indique pas quel seuil précis déployer en production"
  ],
  diagram: `flowchart TD
    A["Scores du modèle sur l’ensemble de test"] --> B["Choisir un seuil"]
    B --> C["Calculer TPR = TP / (TP + FN)"]
    B --> D["Calculer FPR = FP / (FP + TN)"]
    C --> E["Placer le point (FPR, TPR)"]
    D --> E
    E --> F{"D’autres seuils ?"}
    F -->|"oui"| B
    F -->|"non"| G["Aire sous la courbe"]
    G --> H(["AUC : 0.5 aléatoire, 1.0 classement parfait"])`
};
