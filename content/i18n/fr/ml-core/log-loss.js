export default {
  name: "Log-loss (entropie croisée binaire)",
  category: "Métriques d’évaluation",
  task: ["Classification", "Métriques", "Évaluation", "Optimisation"],
  summary: "Une fonction de perte qui mesure la performance d’un modèle de classification dont la sortie est une probabilité entre 0 et 1. Elle pénalise les prédictions fausses et sûres d’elles exponentiellement plus que les prédictions incertaines.",
  intuition: "Le punisseur de l’excès de confiance : si votre modèle annonce « 99 % positif » alors que la vérité est négative, la log-loss inflige une pénalité catastrophique. S’il annonce « 55 % positif » et se trompe, la pénalité est légère. Elle récompense une humilité bien calibrée.",
  whenToUse: "Entraînement et évaluation de classifieurs probabilistes (régression logistique, réseaux de neurones). Quand la qualité de calibration des probabilités compte, et pas seulement l’exactitude des étiquettes.",
  whenToAvoid: "Quand seules les étiquettes de classe comptent et que la qualité des probabilités est sans importance.",
  parameters: [
    {
      impact: "Log-loss = 0 quand le modèle prédit à chaque fois une probabilité de 100 % pour la bonne classe.",
      tuningTip: "Plus c’est bas, mieux c’est. Les bonnes valeurs typiques vont de 0.2 à 0.5."
    },
    {
      impact: "Évite l’explosion numérique log(0) = -∞.",
      tuningTip: "Sklearn et PyTorch s’en chargent automatiquement, mais soyez prudent dans vos implémentations maison."
    }
  ],
  math: {
    loss: "Log-vraisemblance négative / entropie croisée binaire",
    explanation: "Quand y=1, seul le terme -log(ŷ) intervient : une probabilité prédite élevée donne une perte faible. Quand y=0, seul -log(1-ŷ) intervient. La fonction log crée une courbe de pénalité asymptotique : les prédictions fausses et sûres d’elles sont infiniment plus punies que les prédictions incertaines."
  },
  pros: [
    "Dérivable partout, ce qui en fait une perte d’entraînement idéale pour la descente de gradient",
    "Pénalise fortement les prédictions fausses trop confiantes, ce qui encourage la calibration",
    "La fonction de perte standard de la régression logistique et des réseaux de neurones de classification"
  ],
  cons: [
    "Sensible au déséquilibre des classes (atténuable avec des poids de classe)",
    "Exige des probabilités en sortie, pas seulement des étiquettes de classe"
  ],
  diagram: `flowchart TD
    A["Probabilité prédite p pour chaque échantillon"] --> B{"Vraie étiquette ?"}
    B -->|"y = 1"| C["Pénalité = −log(p)"]
    B -->|"y = 0"| D["Pénalité = −log(1 − p)"]
    C --> E{"Sûr de lui et faux ?"}
    D --> E
    E -->|"oui"| F["Pénalité énorme (→ ∞)"]
    E -->|"non"| G["Petite pénalité"]
    F --> H["Moyenne sur tous les échantillons"]
    G --> H
    H --> I(["Log-loss : plus c’est bas, mieux c’est"])`
};
