export default {
  name: "Analyse en composantes principales (ACP / PCA)",
  category: "Réduction de dimension",
  task: ["Réduction de dimension", "Extraction de variables", "Visualisation de données"],
  summary: "Une transformation linéaire orthogonale qui projette les données dans un nouveau système de coordonnées où la plus grande variance se trouve sur la première coordonnée (PC1).",
  intuition: "Projeter l'ombre la plus informative : imaginez un objet en 3D. L'ACP trouve l'angle de caméra exact qui conserve le maximum de détails de la silhouette une fois aplatie en image 2D.",
  whenToUse: "Compresser des données de grande dimension (p. ex. 500 variables $\\to$ 20), accélérer les modèles en aval, éliminer la multicolinéarité, ou visualiser en 2D/3D.",
  whenToAvoid: "Quand des relations non linéaires de type variété dominent (utilisez plutôt t-SNE ou UMAP) ou quand les variables d'origine doivent rester interprétables individuellement.",
  parameters: [
    {
      impact: "Nombre de composantes à conserver, ou part de variance à expliquer.",
      tuningTip: "Passez un réel entre 0.0 et 1.0 (p. ex. 0.95) pour conserver automatiquement assez de composantes pour préserver 95 % de la variance totale."
    },
    {
      impact: "Indique s'il faut ramener les vecteurs de composantes à une variance unitaire.",
      tuningTip: "Mettez True si les composantes alimentent des modèles sensibles à l'échelle des variables (comme le SVM)."
    }
  ],
  math: {
    loss: "Erreur de reconstruction : ||X - X_reconstructed||²",
    explanation: "Calcule la matrice de covariance des données centrées. Les vecteurs propres (colonnes de V) définissent les directions des axes principaux, tandis que les valeurs propres ($\\Lambda$) mesurent la variance expliquée le long de chaque axe."
  },
  pros: [
    "Supprime totalement la multicolinéarité entre variables (les composantes sont strictement orthogonales)",
    "Réduit fortement les besoins en mémoire et la durée d'entraînement des modèles en aval",
    "Préserve efficacement la structure globale des données"
  ],
  cons: [
    "Les composantes principales sont des combinaisons linéaires de toutes les variables d'origine, ce qui détruit l'interprétabilité",
    "Ne capture que des relations linéaires ; aveugle aux variétés non linéaires complexes"
  ],
  diagram: `flowchart TD
    A[("Matrice de données X : n × d")] --> B["Centrer (et standardiser) chaque variable"]
    B --> C["Matrice de covariance ou SVD de X"]
    C --> D["Vecteurs propres = directions principales"]
    C --> E["Valeurs propres = variance expliquée"]
    E --> F["Trier et garder les k premières (p. ex. 95 % de variance cumulée)"]
    D --> G["Matrice de projection W_k"]
    F --> G
    G --> H(["Données réduites Z = X · W_k (n × k)"])`
};
