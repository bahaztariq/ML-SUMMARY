export default {
  name: "Machines à vecteurs de support (SVM)",
  category: "Méthodes à noyau",
  task: ["Classification", "Régression"],
  summary: "Trouve l'hyperplan séparateur optimal qui maximise la marge (la distance) entre les classes, en s'appuyant sur l'astuce du noyau pour les espaces non linéaires.",
  intuition: "La route avec la plus grande marge de sécurité : au lieu de tracer n'importe quelle ligne séparant deux groupes, le SVM construit l'autoroute la plus large possible entre eux, soutenue uniquement par les points critiques situés à la frontière (les vecteurs de support).",
  whenToUse: "Jeux de données de taille moyenne avec des marges de séparation nettes, bancs d'essai de classification d'images, bio-informatique ou puces d'expression génique de grande dimension.",
  whenToAvoid: "Très grands jeux de données de plus de 100 000 échantillons (complexité d'entraînement quadratique à cubique, de $O(n^2)$ à $O(n^3)$), ou classes qui se chevauchent fortement.",
  parameters: [
    {
      impact: "Paramètre de régularisation (compromis de pénalité sur les variables d'écart).",
      tuningTip: "Un grand C tolère moins d'erreurs de classification (marge étroite, risque de surapprentissage) ; un petit C crée une marge plus large (plus tolérante aux violations de marge)."
    },
    {
      impact: "Type de noyau (« linear », « poly », « rbf », « sigmoid »).",
      tuningTip: "Utilisez « rbf » (fonction de base radiale) par défaut pour des données non linéaires ; « linear » pour la classification de texte."
    },
    {
      impact: "Coefficient du noyau pour « rbf », « poly » et « sigmoid ».",
      tuningTip: "Un gamma élevé entraîne une forte variance (frontière très courbée autour de chaque échantillon d'entraînement) ; un gamma faible donne des frontières plus lisses."
    }
  ],
  math: {
    loss: "Perte charnière (hinge loss) : L = max(0, 1 - y · (wᵀx + b)) + (1/2C) · ||w||²",
    explanation: "L'astuce du noyau projette les vecteurs d'entrée dans un espace de Hilbert de dimension infinie où des classes auparavant non séparables deviennent linéairement séparables, sans jamais calculer explicitement les coordonnées en grande dimension."
  },
  pros: [
    "Efficace dans les espaces de grande dimension (p. ex. plus de variables que d'échantillons)",
    "Économe en mémoire : la frontière de décision ne dépend que d'un petit sous-ensemble de vecteurs de support",
    "Polyvalent grâce à des fonctions noyau personnalisables"
  ],
  cons: [
    "Extrêmement lent à entraîner au-delà de quelques dizaines de milliers d'échantillons",
    "Ne fournit pas directement d'estimations de probabilité (nécessite un coûteux calibrage de Platt)",
    "Les hyperparamètres (C et gamma) exigent une recherche intensive"
  ],
  diagram: `flowchart TD
    A[("Variables mises à l'échelle + étiquettes")] --> B{"Linéairement séparable ?"}
    B -->|"oui"| C["Noyau linéaire"]
    B -->|"non"| D["Astuce du noyau : RBF / polynomial projette en plus grande dimension"]
    C --> E["Trouver l'hyperplan de marge maximale"]
    D --> E
    E --> F["Perte charnière + C arbitre entre largeur de marge et violations"]
    F --> G["Vecteurs de support : seuls les points sur ou dans la marge"]
    G --> H["Décision : sign(Σ α_i y_i K(x_i, x) + b)"]
    H --> I(["Classe prédite"])`
};
