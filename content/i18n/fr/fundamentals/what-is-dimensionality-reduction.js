export default {
  name: "Qu’est-ce que la réduction de dimension ?",
  category: "Tâches fondamentales",
  task: ["Définition", "Réduction de dimension", "Non supervisé"],
  summary: "Le fait de transformer des données d’un espace de grande dimension vers un espace de dimension plus faible, en conservant autant que possible la variance utile, la structure géométrique ou l’information.",
  intuition: "Photographier une statue en 3D : une statue existe dans un espace à trois dimensions. Quand vous prenez une photo de qualité, vous la projetez sur une image plane en 2D. Vous perdez une dimension (la profondeur), mais presque tous les détails et formes reconnaissables sont préservés.",
  whenToUse: "Lorsque vous avez trop de variables (fléau de la dimension), lorsque les variables sont fortement corrélées (multicolinéarité), lorsque les modèles en aval s’entraînent trop lentement, ou pour visualiser des données à 100 dimensions sur un écran en 2D/3D.",
  whenToAvoid: "Lorsque chaque variable doit garder son nom et ses unités physiques exactes pour rester interprétable par les décideurs métier (les composantes compressées perdent leurs noms d’origine).",
  parameters: [
    {
      impact: "Fait pivoter les axes pour projeter les données sur les directions orthogonales de variance maximale.",
      tuningTip: "Rapide, déterministe et excellent pour le prétraitement et la compression de données tabulaires."
    },
    {
      impact: "Préserve les distances locales entre voisins dans des plongements en 2D/3D.",
      tuningTip: "La référence pour visualiser la génomique unicellulaire, les plongements de mots et les groupes d’images."
    }
  ],
  math: {
    loss: "Préservation de l’information : maximiser Tr(Wᵀ · Cov(X) · W)",
    explanation: "Transforme des vecteurs de dimension d en vecteurs de dimension k (k << d) en trouvant une matrice de projection optimale qui minimise l’erreur de reconstruction."
  },
  pros: [
    "Contre le fléau de la dimension (où toutes les distances finissent par se ressembler)",
    "Accélère de 10 à 50 fois l’entraînement et l’inférence des modèles de ML en aval",
    "Permet à un humain d’inspecter visuellement à l’écran des groupes en grande dimension"
  ],
  cons: [
    "Les composantes obtenues sont des mélanges mathématiques abstraits, ce qui détruit l’interprétabilité des variables",
    "Perte d’information irréversible : les dimensions écartées ne peuvent jamais être retrouvées à 100 %"
  ],
  diagram: `flowchart TD
    A[("Données de grande dimension : nombreuses variables")] --> B{"Objectif ?"}
    B -->|"garder les variables d’origine"| C["Sélection de variables : retirer les colonnes peu utiles"]
    B -->|"compresser sur de nouveaux axes"| D["Extraction de variables"]
    D --> E{"Structure linéaire ?"}
    E -->|"oui"| F["ACP : projeter sur les directions de plus forte variance"]
    E -->|"non, variété courbe"| G["t-SNE / UMAP / autoencodeur"]
    C --> H["Moins de dimensions"]
    F --> H
    G --> H
    H --> I["Entraînement plus rapide, moins de bruit, graphiques 2D"]`
};
