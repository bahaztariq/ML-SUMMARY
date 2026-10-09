export default {
  name: "Compromis biais-variance",
  category: "Théorie du ML et diagnostic",
  task: ["Diagnostic", "Généralisation", "Réglage du modèle"],
  summary: "Le conflit fondamental de l’apprentissage automatique entre la capacité d’un modèle à minimiser l’erreur sur l’ensemble d’entraînement (biais) et sa stabilité sur des ensembles de test jamais vus (variance).",
  intuition: "Le dilemme de l’archer : un biais élevé, c’est viser toujours la mauvaise cible (sous-apprentissage). Une variance élevée, c’est avoir la main qui tremble et toucher un peu partout (surapprentissage). On veut un biais faible et une variance faible.",
  whenToUse: "Pour diagnostiquer si votre modèle sous-apprend ou surapprend, en comparant l’erreur d’entraînement à l’erreur de validation.",
  whenToAvoid: "Sans objet (c’est une loi fondamentale de tous les algorithmes d’apprentissage statistique).",
  parameters: [
    {
      impact: "Détermine la flexibilité de l’espace d’hypothèses du modèle.",
      tuningTip: "Erreur d’entraînement élevée -> biais élevé (augmentez la complexité). Erreur d’entraînement faible mais erreur de validation élevée -> variance élevée (régularisez, ajoutez des données)."
    }
  ],
  math: {
    loss: "Décomposition de l’erreur de prédiction espérée",
    explanation: "L’erreur irréductible $\\sigma^2$ est le bruit intrinsèque des données. On ne peut qu’arbitrer entre le biais (hypothèses erronées du modèle) et la variance (sensibilité excessive aux petites fluctuations des données d’entraînement)."
  },
  pros: [
    "Fournit la feuille de route conceptuelle de référence pour diagnostiquer les échecs d’un modèle",
    "Indique directement s’il faut plus de données, plus de régularisation ou un modèle plus expressif"
  ],
  cons: [
    "Impossible à calculer analytiquement pour des modèles réels complexes (il faut l’estimer par validation croisée)"
  ],
  diagram: `flowchart TD
    A["Curseur de complexité du modèle"] --> B{"Trop simple ou trop complexe ?"}
    B -->|"trop simple"| C["Biais élevé : rate le vrai motif"]
    B -->|"trop complexe"| D["Variance élevée : mémorise le bruit"]
    C --> E["Sous-apprentissage : erreur élevée en entraînement et en test"]
    D --> F["Surapprentissage : erreur faible en entraînement, élevée en test"]
    E --> G["Erreur totale = Biais² + Variance + Bruit"]
    F --> G
    G --> H["Régler la complexité avec une courbe de validation"]
    H --> I(["Point optimal : erreur de test minimale"])`
};
