export default {
  name: "Réseau de neurones convolutif (CNN)",
  category: "Architectures neuronales",
  task: ["Vision par ordinateur", "Classification d’images", "Détection d’objets"],
  summary: "Une architecture de réseau de neurones spécialisée qui utilise des filtres convolutifs appris pour détecter automatiquement des motifs spatiaux (bords, textures, formes, objets) dans des données structurées en grille comme les images.",
  intuition: "Le scanner à loupe : une petite fenêtre glissante (filtre/noyau) parcourt l’image de façon systématique. Les premières couches détectent des bords et des coins simples. Les couches intermédiaires combinent ces bords en yeux, nez et roues. Les couches profondes reconnaissent des visages, des voitures et des chiens entiers.",
  whenToUse: "Toute tâche portant sur des images, des trames vidéo, des spectrogrammes ou des données spatiales 2D. Classification d’images, détection d’objets, imagerie médicale, analyse d’images satellite.",
  whenToAvoid: "Données tabulaires (les ensembles d’arbres sont supérieurs), ou données séquentielles 1D sans localité spatiale (utilisez des Transformers ou des RNN).",
  parameters: [
    { impact: "Petites matrices de poids qui glissent sur l’entrée pour détecter des motifs locaux.", tuningTip: "Empiler de nombreux noyaux 3×3 (à la VGG) est plus efficace qu’utiliser un seul grand noyau." },
    { impact: "Sous-échantillonne les cartes de caractéristiques en prenant la valeur maximale de chaque région 2×2.", tuningTip: "Réduit les dimensions spatiales de 50 % tout en conservant les activations les plus fortes." },
    { impact: "Nombre de motifs distincts que chaque couche peut détecter.", tuningTip: "Doublez le nombre de filtres quand vous divisez les dimensions spatiales par deux (schéma d’architecture courant)." }
  ],
  math: {
    loss: "Entropie croisée + rétropropagation à travers les couches convolutives",
    explanation: "L’opération de convolution fait glisser des noyaux appris sur l’entrée, en calculant des produits terme à terme puis en les sommant. On obtient ainsi un partage des paramètres (le même noyau détecte le même motif n’importe où dans l’image) et une équivariance par translation."
  },
  pros: [
    "Extraction hiérarchique et automatique de caractéristiques à partir des pixels bruts (pas d’ingénierie manuelle des caractéristiques)",
    "Le partage des paramètres via les noyaux convolutifs rend les CNN extrêmement économes en paramètres",
    "Invariant par translation : détecte un chat qu’il soit en haut à gauche ou en bas à droite de l’image",
    "Socle de la vision par ordinateur moderne (ResNet, EfficientNet, YOLO)"
  ],
  cons: [
    "Nécessite de grands jeux d’images étiquetées (ou un apprentissage par transfert depuis des modèles pré-entraînés)",
    "Coûteux en calcul : une accélération GPU est nécessaire pour des temps d’entraînement raisonnables",
    "Inadapté aux données non spatiales (tabulaires, texte sans structure spatiale)"
  ],
  diagram: `flowchart LR
  I["Image 32×32×3"] --> C1["Conv 3×3, 32 filtres"]
  C1 --> R1["ReLU → cartes de bords"]
  R1 --> P1["MaxPool 2×2 → 16×16"]
  P1 --> C2["Conv 3×3, 64 filtres"]
  C2 --> R2["ReLU → textures et parties"]
  R2 --> P2["MaxPool 2×2 → 8×8"]
  P2 --> F["Aplatir les cartes de caractéristiques"]
  F --> D["Couche dense + Dropout"]
  D --> S["Softmax sur les classes"]
  S --> Y(["Prédiction : chat 0,92"])`
};
