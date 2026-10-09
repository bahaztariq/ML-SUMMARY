export default {
  name: "k plus proches voisins (k-NN)",
  category: "Apprentissage à base d'instances / paresseux",
  task: ["Classification", "Régression"],
  summary: "Un algorithme d'apprentissage paresseux et non paramétrique qui prédit la cible à partir de l'étiquette majoritaire ou de la moyenne des k points les plus proches dans l'espace des variables.",
  intuition: "Qui se ressemble s'assemble : dis-moi qui sont tes 5 plus proches voisins, et je te dirai qui tu es.",
  whenToUse: "Modèle de référence simple, systèmes de recommandation (similarité entre articles), détection d'anomalies ou imputation de valeurs manquantes.",
  whenToAvoid: "Données en grande dimension (la malédiction de la dimensionnalité rend les distances insignifiantes) ou environnements de production à fort débit avec des millions d'enregistrements.",
  parameters: [
    {
      impact: "Nombre de plus proches voisins à consulter.",
      tuningTip: "Un petit k (p. ex. 1) capte le bruit (surapprentissage) ; un grand k produit des frontières trop lissées (sous-apprentissage). Choisissez un nombre impair pour éviter les égalités."
    },
    {
      impact: "Fonction de pondération utilisée pour la prédiction (« uniform » ou « distance »).",
      tuningTip: "Utilisez « distance » pour donner plus de poids au vote des voisins proches qu'à celui des voisins éloignés."
    },
    {
      impact: "Métrique de distance utilisée (« euclidean », « manhattan », « cosine »).",
      tuningTip: "Utilisez « cosine » pour du texte creux ou des embeddings, « manhattan » pour des variables en grille ou de grande dimension."
    }
  ],
  math: {
    loss: "Non paramétrique (aucune phase explicite de minimisation d'une perte pendant l'entraînement)",
    explanation: "L'entraînement est en $O(1)$ car il se contente de mémoriser le jeu de données. La prédiction est en $O(N \\cdot D)$, car chaque requête exige de calculer les distances aux $N$ échantillons stockés de dimension $D$."
  },
  pros: [
    "Aucun temps d'entraînement (évaluation paresseuse)",
    "Simple à expliquer intuitivement et prédictions faciles à inspecter",
    "S'adapte naturellement à des classes formant plusieurs groupes (multimodales)"
  ],
  cons: [
    "Inférence extrêmement lente lors des requêtes en production",
    "Forte empreinte mémoire (tout le jeu d'entraînement doit rester en RAM)",
    "Fortement dégradé par la malédiction de la dimensionnalité"
  ],
  diagram: `flowchart LR
    A(["Nouveau point à prédire x"]) --> B["Mettre à l'échelle avec les statistiques d'entraînement"]
    B --> C["Calculer la distance à chaque point d'entraînement stocké"]
    T[("Jeu d'entraînement stocké")] --> C
    C --> D["Trier et garder les k plus proches voisins"]
    D --> E{"Tâche ?"}
    E -->|"classification"| F["Vote majoritaire (ou pondéré par la distance)"]
    E -->|"régression"| G["Moyenne des cibles des voisins"]
    F --> H(["Prédiction"])
    G --> H`
};
