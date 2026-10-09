export default {
  name: "Mise à l’échelle des variables (standardisation vs min-max)",
  category: "Prétraitement et ingénierie des variables",
  task: ["Prétraitement des données", "Ingénierie des variables"],
  summary: "Des techniques qui ramènent les variables numériques sur une échelle commune, pour éviter que les variables de grande amplitude ne dominent les calculs de distance et de gradient.",
  intuition: "Comparer des pommes et des éléphants : si la variable A est l’« âge » (20 à 80) et la variable B le « salaire » (30 000 $ à 200 000 $), les algorithmes à base de distances considéreront le salaire comme 3 000 fois plus important, sauf si on met les variables à l’échelle.",
  whenToUse: "Obligatoire pour les modèles entraînés par descente de gradient (régression logistique/linéaire, réseaux de neurones) et les modèles à base de distances (k-NN, SVM, K-Means, PCA).",
  whenToAvoid: "Les algorithmes à base d’arbres (arbres de décision, forêt aléatoire, XGBoost) sont invariants aux transformations monotones et n’ont pas besoin de mise à l’échelle.",
  parameters: [
    {
      impact: "Transformation en score z.",
      tuningTip: "Le meilleur choix par défaut pour des variables de distribution normale et les modèles entraînés par descente de gradient."
    },
    {
      impact: "Borne les variables entre un minimum et un maximum fixés.",
      tuningTip: "Idéal pour les pixels d’images ou les algorithmes qui exigent des valeurs strictement positives."
    },
    {
      impact: "Utilise la médiane et l’écart interquartile.",
      tuningTip: "À utiliser quand les données contiennent des valeurs aberrantes importantes qui fausseraient la moyenne et la variance."
    }
  ],
  math: {
    loss: "Transformation à moyenne nulle et variance unitaire",
    explanation: "Centre les données autour de 0 avec un écart-type unitaire. Les courbes de niveau de la perte deviennent sphériques, ce qui empêche la descente de gradient d’osciller violemment d’un côté à l’autre."
  },
  pros: [
    "Accélère la convergence de la descente de gradient de plusieurs ordres de grandeur",
    "Garantit que les pénalités de régularisation (L1/L2) pénalisent toutes les variables équitablement"
  ],
  cons: [
    "Fait perdre les unités physiques d’origine ($, kg, miles)",
    "Ajuster le scaler sur tout le jeu de données avant le découpage entraînement/test provoque une grave fuite de données"
  ],
  diagram: `flowchart TD
    A["Variables numériques brutes"] --> B{"Le modèle utilise-t-il des distances ou des gradients ?"}
    B -->|"non (arbres)"| C(["Pas de mise à l’échelle"])
    B -->|"oui"| D{"Valeurs aberrantes ou plage bornée requise ?"}
    D -->|"plage 0..1 requise"| E["Min-max : (x − min) / (max − min)"]
    D -->|"à peu près gaussienne"| F["Standard : (x − μ) / σ"]
    D -->|"fortes valeurs aberrantes"| G["Robuste : (x − médiane) / IQR"]
    E --> H["Ajuster sur l’ensemble d’entraînement seulement"]
    F --> H
    G --> H
    H --> I["Transformer entraînement, validation et test"]`
};
