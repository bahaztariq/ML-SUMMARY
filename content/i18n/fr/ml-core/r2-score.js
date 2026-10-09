export default {
  name: "Score R² (coefficient de détermination)",
  category: "Métriques d’évaluation",
  task: ["Régression", "Métriques", "Évaluation"],
  summary: "Mesure la proportion de la variance de la variable dépendante qui peut être prédite à partir des variables indépendantes. Varie de -∞ à 1.0, où 1.0 signifie des prédictions parfaites.",
  intuition: "La note du bulletin : R² = 0.85 signifie que votre modèle explique 85 % des raisons pour lesquelles la cible varie. Les 15 % restants sont du bruit inexpliqué, des variables manquantes ou un aléa que votre modèle ne peut pas capturer.",
  whenToUse: "Comparer des modèles sur le même jeu de données. Comprendre quelle part du comportement de la cible vos variables capturent.",
  whenToAvoid: "Comparer des modèles sur des jeux de données différents (le R² dépend du jeu de données). Trompeur aussi pour des modèles non linéaires évalués sur de très petits échantillons.",
  parameters: [
    {
      impact: "Les prédictions du modèle correspondent exactement à toutes les valeurs réelles, avec un résidu nul.",
      tuningTip: "Un R² suspicieusement parfait (0.99+) signale souvent une fuite de données ou du surapprentissage."
    },
    {
      impact: "Le modèle ne fait pas mieux que de prédire simplement la moyenne de y pour chaque observation.",
      tuningTip: "Vos variables n’apportent aucune information prédictive au-delà de la moyenne."
    },
    {
      impact: "Le modèle fait PIRE que la référence triviale de la moyenne. Ses prédictions sont carrément nuisibles.",
      tuningTip: "Signale un modèle fondamentalement cassé, de mauvaises variables ou un surapprentissage sévère."
    },
    {
      impact: "Ajuste le R² à la baisse quand on ajoute des variables qui n’améliorent pas réellement les prédictions.",
      tuningTip: "Utilisez le R² ajusté pour comparer des modèles ayant des nombres de variables différents, afin de ne pas récompenser la complexité."
    }
  ],
  math: {
    loss: "Proportion de variance expliquée",
    explanation: "SS_tot est la variance totale de y (à quel point les valeurs réelles sont dispersées). SS_res est l’erreur qui reste après la modélisation. Le R² calcule la fraction de la dispersion totale que votre modèle parvient à expliquer."
  },
  pros: [
    "Indépendant de l’échelle : permet de comparer des performances sur des cibles d’unités différentes",
    "Interprétation intuitive comme pourcentage de variance expliquée",
    "Intégré à pratiquement toutes les bibliothèques d’évaluation de régression"
  ],
  cons: [
    "Augmente toujours (ou reste stable) quand on ajoute des variables, même inutiles (utilisez le R² ajusté)",
    "Peut être trompeur quand la vraie relation est non linéaire mais que le score paraît élevé à cause de l’échelle"
  ],
  diagram: `flowchart TD
    A["Valeurs réelles y"] --> B["Référence : prédire la moyenne ȳ"]
    B --> C["SS_tot = Σ(y − ȳ)²"]
    A --> D["Prédictions du modèle ŷ"]
    D --> E["SS_res = Σ(y − ŷ)²"]
    C --> F["R² = 1 − SS_res / SS_tot"]
    E --> F
    F --> G{"Valeur ?"}
    G -->|"1"| H["Ajustement parfait"]
    G -->|"0"| I["Pas mieux que la moyenne"]
    G -->|"inférieur à 0"| J["Pire que la moyenne"]`
};
