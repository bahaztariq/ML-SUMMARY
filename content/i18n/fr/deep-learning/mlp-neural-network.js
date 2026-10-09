export default {
  name: "Perceptron multicouche (MLP)",
  category: "Architectures neuronales",
  task: ["Classification", "Régression", "Données tabulaires"],
  summary: "La forme la plus simple de réseau de neurones profond à propagation avant, composée d’une couche d’entrée, d’une ou plusieurs couches cachées de neurones entièrement connectés, et d’une couche de sortie. Chaque neurone calcule une somme pondérée suivie d’une fonction d’activation non linéaire.",
  intuition: "Le cerveau en chaîne de montage : chaque rangée d’ouvriers (les neurones) reçoit les entrées de la couche précédente, effectue des calculs (sommes pondérées + activation) et transmet les résultats à la couche suivante. La dernière couche produit la prédiction.",
  whenToUse: "Données tabulaires complexes de plusieurs millions de lignes, avec des interactions non linéaires entre variables. Comme réseau de neurones de référence avant d’essayer des architectures plus spécialisées.",
  whenToAvoid: "Données structurées comme les images (utilisez un CNN), les séquences (utilisez un RNN/Transformer), ou les petits jeux de données tabulaires (moins de 10 000 lignes, où les ensembles d’arbres dominent).",
  parameters: [
    { impact: "Nombre et taille des couches cachées.", tuningTip: "Commencez par (128, 64). Plus profond n’est pas toujours mieux pour les données tabulaires." },
    { impact: "Fonction d’activation des couches cachées.", tuningTip: "ReLU est le choix sûr par défaut. Utilisez 'tanh' pour des données centrées autour de zéro." },
    { impact: "Taille de pas initiale des mises à jour des poids.", tuningTip: "0,001 avec l’optimiseur Adam est le point de départ universel." },
    { impact: "Désactive des neurones au hasard pendant l’entraînement pour éviter qu’ils ne s’adaptent trop les uns aux autres (co-adaptation).", tuningTip: "Utilisez 0,2–0,5 pour régulariser. En PyTorch : nn.Dropout(0.3)." }
  ],
  math: {
    loss: "Entropie croisée (classification) ou MSE (régression) + rétropropagation",
    explanation: "Chaque couche cachée calcule une transformation affine suivie d’une activation non linéaire. La rétropropagation calcule le gradient de la perte par rapport à chaque poids grâce à la règle de dérivation en chaîne, ce qui permet à la descente de gradient de mettre à jour tous les paramètres simultanément."
  },
  pros: [
    "Approximateur universel de fonctions (peut en théorie modéliser toute fonction continue)",
    "Capture automatiquement des interactions non linéaires complexes entre variables",
    "Passe bien à l’échelle avec de grands jeux de données et l’accélération GPU"
  ],
  cons: [
    "Demande un réglage soigneux des hyperparamètres (couches, neurones, taux d’apprentissage, régularisation)",
    "Boîte noire : les poids des neurones pris individuellement ne sont pas interprétables",
    "Sujet au surapprentissage sans dropout, arrêt précoce ou weight decay"
  ],
  diagram: `flowchart LR
  X["Variables d’entrée (mises à l’échelle)"] --> H1["Couche cachée 1 : W₁·x + b₁"]
  H1 --> A1["ReLU"]
  A1 --> H2["Couche cachée 2 : W₂·h₁ + b₂"]
  H2 --> A2["ReLU + Dropout"]
  A2 --> O["Couche de sortie → softmax / linéaire"]
  O --> L["Perte par rapport à l’étiquette réelle"]
  L --> BP["Rétropropagation : gradients par la règle de la chaîne"]
  BP --> OPT["L’optimiseur (Adam) met à jour tous les W, b"]
  OPT -.->|"mini-lot suivant"| H1`
};
