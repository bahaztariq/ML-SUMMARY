export default {
  name: "Qu’est-ce que la descente de gradient ?",
  category: "Mathématiques & optimisation",
  task: ["Définition", "Optimisation", "Fondamentaux"],
  summary: "L’algorithme d’optimisation itératif de référence pour entraîner les modèles de Machine Learning et les réseaux de neurones : il avance pas à pas dans la direction de plus forte pente descendante de la fonction de coût.",
  intuition: "Descendre une montagne dans le brouillard, les yeux bandés : vous êtes au sommet d’une montagne noyée dans un épais brouillard et vous ne voyez pas le fond de la vallée. Pour l’atteindre, vous tâtez la pente du sol avec vos chaussures et faites un pas dans la direction qui descend le plus fort. Vous recommencez jusqu’à ce que le sol soit plat.",
  whenToUse: "Pour entraîner des modèles dont les paramètres ne peuvent pas être obtenus par une inversion de matrice sous forme close : régression logistique, perceptrons multicouches, CNN, Transformers, apprentissage par renforcement profond.",
  whenToAvoid: "Lorsqu’une formule analytique exacte existe pour de petits jeux de données (par ex. la régression linéaire par moindres carrés $(X^TX)^{-1}X^Ty$).",
  parameters: [
    {
      impact: "La taille du pas effectué dans la direction opposée au gradient.",
      tuningTip: "Trop élevé : dépasse le minimum et diverge vers l’infini. Trop faible : il faut des millions d’itérations pour converger."
    },
    {
      impact: "Calcule le gradient sur les N exemples avant chaque pas. Très stable, mais lent sur de gros volumes de données.",
      tuningTip: "Idéal pour les petits problèmes convexes."
    },
    {
      impact: "Calcule le gradient sur 1 exemple tiré au hasard. Très rapide, mais trajectoire bruitée.",
      tuningTip: "Peut facilement s’échapper des minima locaux."
    },
    {
      impact: "Calcule le gradient sur de petits lots. Combine la vitesse de la vectorisation matérielle et la stabilité.",
      tuningTip: "La norme universelle de l’industrie pour entraîner les modèles modernes d’apprentissage profond."
    }
  ],
  math: {
    loss: "Optimisation itérative du premier ordre",
    explanation: "Le vecteur gradient $\\nabla J(\\theta)$ pointe dans la direction de plus forte montée (augmentation la plus rapide du coût). Soustraire le gradient multiplié par le pas $\\alpha$ rapproche les paramètres du coût minimal."
  },
  pros: [
    "Passe sans effort à l’échelle de modèles à des milliards de paramètres (comme GPT-4)",
    "Optimiseur universel, applicable à presque toute surface de perte dérivable"
  ],
  cons: [
    "Peut rester piégée dans des minima locaux sous-optimaux ou des points-selles plats",
    "Sensible au choix du taux d’apprentissage (atténué par des optimiseurs adaptatifs comme Adam)"
  ],
  diagram: `flowchart TD
    A(["Initialiser les paramètres θ au hasard"]) --> B["Tirer un mini-lot"]
    B --> C["Propagation avant : calculer les prédictions"]
    C --> D["Calculer le coût J(θ)"]
    D --> E["Calculer le gradient ∇J(θ)"]
    E --> F["Mise à jour : θ ← θ − α·∇J(θ)"]
    F --> G{"Convergence ou nombre max d’époques ?"}
    G -->|"non"| B
    G -->|"oui"| H(["Paramètres finaux entraînés"])`
};
