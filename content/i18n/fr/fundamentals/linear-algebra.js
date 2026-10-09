export default {
  name: "Algèbre linéaire pour le ML",
  category: "Mathématiques & optimisation",
  task: ["Définition", "Optimisation"],
  summary: "Les mathématiques des vecteurs, des matrices et de leurs transformations : c’est sous cette forme que chaque jeu de données, chaque poids de modèle et chaque calcul de réseau de neurones est réellement stocké et exécuté.",
  intuition: "Le tableur qui bouge : un jeu de données est un tableur (une matrice) dont chaque ligne est un point (un vecteur) de l’espace. Multiplier par une matrice de poids revient à étirer, faire tourner et écraser tout ce nuage de points d’un seul coup. Entraîner un modèle, c’est trouver la transformation qui amène les points là où se trouvent les réponses.",
  whenToUse: "Pour comprendre comment les modèles calculent leurs prédictions (X·w), pourquoi la mise à l’échelle des variables compte (produits scalaires), comment l’ACP trouve les directions de variance (vecteurs propres / SVD), comment les embeddings mesurent la similarité (cosinus) et pourquoi les GPU accélèrent l’apprentissage profond (multiplications matricielles par lots).",
  whenToAvoid: "Sans objet — mais inutile de savoir dériver le calcul matriciel à la main pour utiliser scikit-learn efficacement ; apprenez-le progressivement à mesure que les modèles deviennent plus profonds.",
  parameters: [
    {
      impact: "Mesure l’alignement entre deux vecteurs ; chaque neurone et chaque modèle linéaire en calcule un.",
      tuningTip: "Normalisez les vecteurs (similarité cosinus) lorsque seule la direction compte, pas la norme."
    },
    {
      impact: "Applique une transformation linéaire à tous les échantillons à la fois : l’opération centrale des réseaux de neurones.",
      tuningTip: "Les dimensions intérieures doivent correspondre ; la plupart des bugs de forme dans PyTorch viennent de là."
    },
    {
      impact: "Décomposent une matrice en directions principales et en intensités ; c’est le moteur de l’ACP et des systèmes de recommandation.",
      tuningTip: "Utilisez numpy.linalg.svd sur des données centrées plutôt que de calculer explicitement la matrice de covariance."
    },
    {
      impact: "Mesurent la longueur d’un vecteur ; servent aux distances (k-NN) et aux pénalités de régularisation.",
      tuningTip: "L1 favorise la parcimonie, L2 favorise des poids petits et répartis."
    }
  ],
  math: {
    loss: "Applications linéaires, équation normale et SVD",
    explanation: "Les prédictions d’un modèle linéaire se résument à un produit matrice-vecteur. L’équation normale résout les moindres carrés sous forme close grâce aux transposées et aux inverses. La SVD factorise n’importe quelle matrice de données en rotations (U, V) et en mise à l’échelle (Σ), révélant les directions qui portent le plus de variance."
  },
  pros: [
    "Transforme des boucles sur des millions d’échantillons en une seule opération vectorisée (accélérations énormes)",
    "Donne une intuition géométrique des distances, des projections et de la similarité",
    "Correspond directement au matériel GPU, ce qui rend possible l’apprentissage profond moderne"
  ],
  cons: [
    "La notation abstraite peut intimider au début",
    "L’inversion de matrice est numériquement instable lorsque les variables sont mal conditionnées ou colinéaires",
    "La géométrie en grande dimension est contre-intuitive (fléau de la dimension)"
  ],
  diagram: `flowchart LR
    A[("Tableau brut : n lignes × d colonnes")] --> B["Matrice X (n × d)"]
    B --> C["Chaque ligne = vecteur dans un espace à d dimensions"]
    B --> D["Multiplier par les poids W (d × k)"]
    D --> E["Données transformées X·W (n × k)"]
    E --> F["Prédictions / couche suivante"]
    B --> G["Centrer les données"]
    G --> H["SVD : U Σ Vᵀ"]
    H --> I["Premières composantes → projection ACP"]
    C --> J["Produit scalaire / norme"]
    J --> K["Similarité & distances (k-NN, embeddings)"]`
};
