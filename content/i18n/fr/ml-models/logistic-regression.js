export default {
  name: "Régression logistique",
  category: "Modèles linéaires généralisés",
  task: ["Classification"],
  summary: "Un modèle linéaire de classification binaire ou multiclasse qui modélise le logarithme des cotes (log-odds) à l'aide de la fonction sigmoïde / softmax.",
  intuition: "Trace une frontière de décision linéaire dans l'espace des variables, puis convertit la distance à cette frontière en une probabilité calibrée comprise entre 0 % et 100 %.",
  whenToUse: "Quand vous avez besoin de probabilités bien calibrées, d'une inférence instantanée, d'une interprétabilité totale (rapports de cotes) ou que vous travaillez sur des données textuelles de grande dimension.",
  whenToAvoid: "Quand la vraie relation entre les variables d'entrée et les étiquettes est fortement non linéaire et que vous ne pouvez pas construire manuellement des variables d'interaction.",
  parameters: [
    {
      impact: "Inverse de la force de régularisation (1 / λ).",
      tuningTip: "Plus la valeur est petite, plus la régularisation est forte. Testez sur une échelle logarithmique : [0.001, 0.01, 0.1, 1, 10, 100]."
    },
    {
      impact: "Norme utilisée pour la pénalisation (« l1 », « l2 », « elasticnet », « none »).",
      tuningTip: "Utilisez « l1 » pour une sélection automatique des variables (les poids non informatifs sont ramenés exactement à 0)."
    },
    {
      impact: "Algorithme utilisé pour résoudre le problème d'optimisation.",
      tuningTip: "Utilisez « lbfgs » en multiclasse ou sur de petites données ; « saga » pour les grands jeux de données ou la pénalité L1."
    }
  ],
  math: {
    loss: "Entropie croisée binaire (log-loss) : L = -∑ [y·log(p) + (1-y)·log(1-p)]",
    explanation: "Calcule le produit scalaire des poids et des variables d'entrée pour obtenir le log-odds, puis applique la fonction d'activation sigmoïde, non linéaire, pour ramener la sortie strictement dans l'intervalle de probabilité [0, 1]."
  },
  pros: [
    "Inférence ultra-rapide et faible empreinte mémoire (idéal pour l'embarqué ou les API à fort trafic)",
    "Les coefficients s'interprètent directement comme des variations multiplicatives des cotes",
    "Fournit d'emblée des probabilités de confiance bien calibrées",
    "Moins sujette au surapprentissage avec peu d'échantillons et beaucoup de variables, lorsqu'elle est régularisée"
  ],
  cons: [
    "Hypothèse stricte d'une frontière de décision linéaire dans l'espace des log-odds",
    "Extrêmement sensible aux variables non mises à l'échelle et aux valeurs aberrantes extrêmes",
    "Ne capture pas les interactions entre variables, sauf si on les construit explicitement"
  ],
  diagram: `flowchart LR
    A[("Variables x")] --> B["Score linéaire z = wᵀx + b"]
    B --> C["Sigmoïde σ(z) = 1 / (1 + e^−z)"]
    C --> D["Probabilité P(y = 1 | x)"]
    D --> E{"P ≥ seuil (p. ex. 0,5) ?"}
    E -->|"oui"| F(["Prédire la classe 1"])
    E -->|"non"| G(["Prédire la classe 0"])
    D --> H["Log-loss par rapport à la vraie étiquette"]
    H --> I["Un pas de gradient met à jour w, b"]
    I -.-> B`
};
