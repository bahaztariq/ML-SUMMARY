export default {
  name: "Fonctions d’activation (ReLU, Sigmoïde, Tanh, GELU, Softmax)",
  category: "Briques des réseaux de neurones",
  task: ["Définition", "Architecture"],
  summary: "Fonctions non linéaires appliquées à la somme pondérée de chaque neurone, pour que des couches empilées puissent modéliser des relations courbes et complexes au lieu de se réduire à un seul modèle linéaire.",
  intuition: "Le videur à l’entrée : chaque neurone calcule un score, et la fonction d’activation est le videur qui décide quelle part de ce signal passe. ReLU laisse entrer les scores positifs tels quels et bloque les négatifs, la sigmoïde comprime tout dans une « probabilité » entre 0 et 1, et Softmax transforme une rangée de scores en parts équitables d’un total de 100 %.",
  whenToUse: "Dans chaque couche cachée de tout réseau de neurones. ReLU / GELU par défaut dans les couches cachées, sigmoïde pour les sorties binaires, Softmax pour les sorties multiclasses, Tanh dans les cellules RNN/LSTM, et aucune activation (linéaire) pour les sorties de régression.",
  whenToAvoid: "Ne mettez pas de sigmoïde/Tanh dans les couches cachées de réseaux à propagation avant très profonds (elles saturent et provoquent l’évanouissement du gradient). N’appliquez pas Softmax avant nn.CrossEntropyLoss dans PyTorch (la perte inclut déjà le log-softmax).",
  parameters: [
    { impact: "Peu coûteuse, ne sature pas pour les entrées positives, produit des activations creuses.", tuningTip: "Choix sûr par défaut pour les CNN et les MLP. À associer à l’initialisation des poids de He (Kaiming)." },
    { impact: "Donne aux entrées négatives un petit gradient pour que les neurones ne puissent pas « mourir » définitivement à zéro.", tuningTip: "Passez à LeakyReLU (0,01–0,2) si de nombreuses unités ReLU sortent zéro pour toutes les entrées (neurones morts). Courant dans les discriminateurs de GAN." },
    { impact: "Courbes lisses proches de ReLU qui améliorent légèrement l’optimisation des modèles très profonds.", tuningTip: "Standard dans les Transformers (BERT et GPT utilisent GELU ; LLaMA utilise SiLU/SwiGLU)." },
    { impact: "Ramène la dernière couche dans la bonne plage de sortie.", tuningTip: "Sigmoïde → binaire / multi-étiquette, Softmax → multiclasse à étiquette unique, identité → régression." }
  ],
  math: {
    loss: "Façonne le gradient qui circule pendant la rétropropagation",
    explanation: "Sans non-linéarité, W₂·(W₁·x) = (W₂·W₁)·x reste une seule couche linéaire, quelle que soit la profondeur. La dérivée de l’activation multiplie chaque gradient rétropropagé : la dérivée de la sigmoïde vaut au plus 0,25, donc enchaîner de nombreuses couches écrase les gradients vers zéro, alors que la dérivée de ReLU vaut exactement 1 pour les entrées positives."
  },
  pros: [
    "Donne aux réseaux de neurones leur pouvoir d’approximation universelle de fonctions",
    "Les fonctions de la famille ReLU sont très peu coûteuses à calculer et préservent de bons gradients",
    "Les activations de sortie transforment des scores bruts en probabilités interprétables",
    "Faciles à remplacer pour expérimenter (une seule ligne de code)"
  ],
  cons: [
    "La sigmoïde et Tanh saturent et provoquent l’évanouissement du gradient dans les réseaux profonds",
    "ReLU peut produire des « neurones morts » qui ne s’activent plus jamais après une mauvaise mise à jour",
    "Une mauvaise activation de sortie casse l’entraînement sans prévenir (par ex. Softmax pour du multi-étiquette)"
  ],
  diagram: `flowchart LR
  X["Entrées x₁ … xₙ"] --> W["Somme pondérée z = W·x + b"]
  W --> Q{"Quelle couche ?"}
  Q -->|"cachée"| H["ReLU / GELU : max(0, z)"]
  Q -->|"sortie binaire"| S["Sigmoïde → 0..1"]
  Q -->|"sortie multiclasse"| M["Softmax → probabilités de somme 1"]
  Q -->|"sortie de régression"| I["Identité : z inchangé"]
  H --> N["La couche suivante apprend des motifs non linéaires"]
  N --> B["Rétropropagation : gradient × dérivée de l’activation"]
  B -.->|"Dérivée de la sigmoïde ≤ 0,25 : les gradients rétrécissent"| V["Risque d’évanouissement du gradient"]
  B -.->|"Dérivée de ReLU = 1 quand z ≥ 0"| G["Gradient qui circule bien"]`
};
