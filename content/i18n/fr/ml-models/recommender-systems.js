export default {
  name: "Systèmes de recommandation",
  category: "Recommandation",
  task: ["Recommandation", "Classement (ranking)"],
  summary: "Prédit les articles qu'un utilisateur est susceptible de vouloir en apprenant à partir des interactions passées (filtrage collaboratif), des attributs des articles (filtrage basé sur le contenu), ou des deux (hybride).",
  intuition: "Le libraire bienveillant : un bon libraire se souvient que les personnes qui ont adoré les mêmes livres que vous ont aussi adoré un titre que vous n'avez pas encore lu (filtrage collaboratif), et que vous choisissez toujours de la science-fiction avec une héroïne forte (filtrage basé sur le contenu). La factorisation de matrices, c'est ce libraire qui résume chaque lecteur et chaque livre en quelques dimensions de « goût » cachées.",
  whenToUse: "Suggestions de produits en e-commerce, contenus de streaming, fils d'actualité, mise en relation d'offres d'emploi, ou tout contexte disposant d'un historique d'interactions utilisateur-article (notes, clics, achats) où la personnalisation stimule l'engagement.",
  whenToAvoid: "Produits tout nouveaux sans historique d'interactions ni métadonnées (démarrage à froid pur), petits catalogues où un simple classement par popularité suffit, ou décisions à fort enjeu où les boucles de rétroaction et les bulles de filtres seraient néfastes.",
  parameters: [
    {
      impact: "Taille des vecteurs d'embedding des utilisateurs et des articles.",
      tuningTip: "Plus de facteurs capturent des goûts plus fins mais surapprennent sur des données creuses ; réglez entre 16 et 256 en suivant des métriques de classement."
    },
    {
      impact: "Pénalité L2 sur les facteurs utilisateurs/articles.",
      tuningTip: "Augmentez-la pour les matrices très creuses afin d'éviter de mémoriser quelques notes."
    },
    {
      impact: "Un retour explicite (notes en étoiles) ou implicite (clics, vues) change la fonction de perte.",
      tuningTip: "La plupart des systèmes réels sont implicites — utilisez ALS avec des poids de confiance ou la perte de classement BPR plutôt qu'une simple MSE."
    },
    {
      impact: "Nombre d'articles renvoyés et évalués par utilisateur.",
      tuningTip: "Évaluez avec Precision@K, Recall@K, NDCG@K ou MAP@K sur un jeu de test découpé dans le temps, pas uniquement avec la RMSE."
    }
  ],
  math: {
    loss: "Erreur quadratique régularisée (explicite) / BPR ou ALS pondéré (implicite)",
    explanation: "La factorisation de matrices approche la matrice creuse des notes utilisateur-article par le produit des facteurs utilisateurs p_u et des facteurs articles q_i, plus une moyenne globale μ et des biais propres aux utilisateurs et aux articles. Le produit scalaire mesure à quel point les goûts cachés d'un utilisateur s'accordent avec les caractéristiques cachées d'un article. Seules les notes observées (ensemble K) contribuent à la perte ; λ évite le surapprentissage."
  },
  pros: [
    "Découvre des dimensions de goût cachées sans variables construites à la main",
    "Le filtrage collaboratif exploite la sagesse des utilisateurs similaires",
    "Les embeddings appris sont réutilisables pour la recherche, la similarité et le clustering",
    "Les systèmes hybrides combinent comportement et contenu pour atténuer le démarrage à froid"
  ],
  cons: [
    "Démarrage à froid pour les nouveaux utilisateurs et articles sans interactions",
    "Biais de popularité et bulles de filtres dus aux boucles de rétroaction",
    "Les matrices extrêmement creuses compliquent l'entraînement et l'évaluation",
    "Les métriques hors ligne sont souvent mal corrélées aux résultats des tests A/B en ligne"
  ],
  diagram: `flowchart LR
    A[("Historique d'interactions : utilisateur, article, note/clic")] --> B["Matrice creuse utilisateurs × articles"]
    B --> C["Factoriser en facteurs utilisateurs P et facteurs articles Q"]
    C --> D["Minimiser l'erreur sur les cases observées + pénalité L2"]
    D --> E["Scorer les articles non vus : p_u · q_i + biais"]
    F[("Métadonnées des articles")] --> G["Similarité basée sur le contenu"]
    G --> H["Mélange hybride / reclassement"]
    E --> H
    H --> I["Filtrer les articles déjà vus"]
    I --> J(["Top-K recommandations"])
    J -.->|"nouveaux clics"| A`
};
