export default {
  name: "Matrice de confusion (guide complet)",
  category: "Métriques d’évaluation",
  task: ["Classification", "Métriques", "Évaluation", "Définition"],
  summary: "Un tableau 2×2 (binaire) ou N×N (multiclasse) qui croise chaque prédiction avec la vraie étiquette, et montre exactement où et comment un classifieur se trompe.",
  intuition: "Le tableau d’enquête du détective : au lieu de dire simplement « le modèle a 90 % d’exactitude », la matrice de confusion montre toute la scène de crime : combien de patients malades ont été manqués ? Combien de patients sains ont reçu une fausse alerte ? Chaque type d’erreur est mis au jour.",
  whenToUse: "Diagnostic obligatoire pour toute tâche de classification. Indispensable quand les différents types d’erreurs ont des coûts réels très différents (par ex. manquer un cancer vs fausse alerte).",
  whenToAvoid: "Ne vous en passez jamais : examinez toujours la matrice de confusion avant de faire confiance à la seule exactitude.",
  parameters: [
    {
      impact: "Le modèle a prédit positif ET la vérité est positive. Le coup juste.",
      tuningTip: "Maximisez les TP pour augmenter à la fois la précision et le rappel."
    },
    {
      impact: "Le modèle a prédit négatif ET la vérité est négative. Le rejet correct.",
      tuningTip: "Contribue à l’exactitude et à la spécificité."
    },
    {
      impact: "Le modèle a prédit positif MAIS la vérité est négative. Crier au loup.",
      tuningTip: "Fait baisser la précision. Critique pour les filtres anti-spam (un e-mail légitime envoyé dans les indésirables)."
    },
    {
      impact: "Le modèle a prédit négatif MAIS la vérité est positive. Le tueur silencieux.",
      tuningTip: "Fait baisser le rappel. Critique en dépistage médical (renvoyer chez lui un patient malade)."
    }
  ],
  math: {
    loss: "Fondement de toutes les métriques de classification",
    explanation: "Toutes les métriques de classification (exactitude, précision, rappel, F1, spécificité, FPR) se calculent directement à partir des quatre cases de la matrice de confusion. C’est l’outil de diagnostic le plus important."
  },
  pros: [
    "Montre exactement OÙ le modèle échoue (faux positifs vs faux négatifs)",
    "Révèle les problèmes de déséquilibre des classes que l’exactitude seule masque complètement",
    "Base du calcul de la précision, du rappel, du F1, de la spécificité et des courbes ROC"
  ],
  cons: [
    "Ne montre les résultats que pour un seul seuil (utilisez la courbe ROC pour tous les seuils)",
    "Les matrices multiclasses N×N deviennent difficiles à lire quand les classes sont nombreuses"
  ],
  diagram: `flowchart TD
    A["Échantillons de test"] --> B["Le modèle prédit une étiquette"]
    B --> C{"Prédit positif ?"}
    C -->|"oui"| D{"Réellement positif ?"}
    C -->|"non"| E{"Réellement positif ?"}
    D -->|"oui"| F["Vrai positif"]
    D -->|"non"| G["Faux positif (type I)"]
    E -->|"oui"| H["Faux négatif (type II)"]
    E -->|"non"| I["Vrai négatif"]
    F --> J["Remplir la matrice 2×2"]
    G --> J
    H --> J
    I --> J
    J --> K(["En déduire exactitude, précision, rappel, spécificité"])`
};
