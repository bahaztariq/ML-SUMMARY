export default {
  name: "Qu’est-ce que le Deep Learning (DL) ?",
  category: "Fondamentaux & vue d’ensemble",
  task: ["Définition", "Apprentissage profond", "Réseaux de neurones"],
  summary: "Un sous-domaine du Machine Learning fondé sur des réseaux de neurones artificiels comportant plusieurs couches de représentation (d’où le terme « profond »), qui découvrent et extraient automatiquement des caractéristiques hiérarchiques directement à partir des données brutes.",
  intuition: "Une chaîne de montage de l’abstraction : en reconnaissance faciale, la couche 1 détecte des contours bruts. La couche 2 combine ces contours en formes (nez, yeux). La couche 3 assemble ces formes en visages complets. Le réseau construit sa propre compréhension sans qu’aucun humain n’ait défini à la main à quoi ressemble un œil.",
  whenToUse: "Pour les données non structurées (images, audio, vidéo, texte en langage naturel, parole) ou d’immenses jeux de données tabulaires de plusieurs millions de lignes, où les modèles classiques atteignent un plafond de performance.",
  whenToAvoid: "Sur de petits jeux de données tabulaires (moins de 20 000 exemples), où les ensembles d’arbres (XGBoost, forêt aléatoire) battent régulièrement les réseaux de neurones avec 100 fois moins de calcul.",
  parameters: [
    {
      impact: "Nombre de couches cachées de représentation entre l’entrée et la sortie.",
      tuningTip: "Des réseaux plus profonds représentent des concepts plus abstraits, mais risquent la disparition du gradient."
    },
    {
      impact: "Introduit de la non-linéarité ; permet au réseau d’apprendre des relations complexes et courbes.",
      tuningTip: "Utilisez ReLU pour les CNN/MLP, GELU pour les Transformers modernes."
    },
    {
      impact: "Le ML traditionnel exige des variables conçues à la main ; le Deep Learning apprend ses représentations de bout en bout.",
      tuningTip: "Épargne des milliers d’heures d’extraction manuelle de variables métier."
    }
  ],
  math: {
    loss: "Rétropropagation par la règle de dérivation en chaîne : ∂L / ∂W",
    explanation: "Chaque couche applique une transformation affine suivie d’une activation non linéaire $\\sigma$ élément par élément. Les gradients remontent à travers les L couches grâce à la règle de dérivation en chaîne pour mettre à jour les poids synaptiques."
  },
  pros: [
    "Est au cœur de l’IA générative de pointe, de la vision par ordinateur, de la reconnaissance vocale et des LLM",
    "Les performances continuent de progresser à mesure qu’on ajoute des données et du calcul (pas de plafond)",
    "Aucun feature engineering manuel n’est nécessaire sur des images ou du texte bruts"
  ],
  cons: [
    "Extrêmement gourmand en calcul (GPU/TPU spécialisés et forte consommation électrique)",
    "Vorace en données : surapprend facilement et donne de très mauvais résultats sur de petits jeux de données",
    "Interprétabilité interne quasi nulle (boîte noire complexe)"
  ],
  diagram: `flowchart LR
    A["Entrée brute : pixels, tokens, audio"] --> B["Couche 1 : caractéristiques simples (contours, caractères)"]
    B --> C["Couches cachées : combinaisons (formes, mots)"]
    C --> D["Couches profondes : concepts abstraits (visages, sens)"]
    D --> E["Sortie : prédiction"]
    E --> F["Perte vs vraie étiquette"]
    F --> G["La rétropropagation calcule les gradients"]
    G --> H["L’optimiseur met à jour tous les poids"]
    H -.->|"répéter sur de nombreux lots"| B`
};
