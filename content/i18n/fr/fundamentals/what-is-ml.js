export default {
  name: "Qu’est-ce que le Machine Learning (ML) ?",
  category: "Fondamentaux & vue d’ensemble",
  task: ["Définition", "Fondamentaux", "Vue d’ensemble"],
  summary: "Un sous-domaine de l’intelligence artificielle dans lequel les algorithmes apprennent des relations mathématiques et des régularités statistiques directement à partir de données historiques, afin de faire des prédictions fiables sur de nouvelles données sans être explicitement programmés.",
  intuition: "Apprendre par l’expérience : en programmation classique, des humains écrivent des règles explicites (Données + Règles = Réponses). En Machine Learning, on fournit à l’ordinateur des données et les résultats observés, et l’algorithme calcule les règles sous-jacentes (Données + Réponses = Règles).",
  whenToUse: "Lorsque les règles qui relient les entrées aux sorties sont trop complexes, changeantes ou de trop grande dimension pour être écrites à la main (par ex. détection de spam, alertes de fraude, moteurs de recommandation).",
  whenToAvoid: "Lorsque le problème se résout avec une simple formule fixe, lorsque des règles de conformité légale strictes interdisent toute incertitude probabiliste, ou lorsque vous n’avez aucune donnée historique dont apprendre.",
  parameters: [
    {
      impact: "Apprendre avec des étiquettes : relier les entrées X à des cibles y connues (la vérité terrain).",
      tuningTip: "À utiliser quand vous disposez de réponses historiques claires (par ex. départ d’un client : oui/non)."
    },
    {
      impact: "Apprendre sans étiquettes : trouver des groupes naturels, des distributions ou des projections en faible dimension.",
      tuningTip: "À utiliser pour la segmentation de clientèle ou la détection d’anomalies."
    },
    {
      impact: "Apprendre par essais et erreurs, à l’aide de récompenses et de pénalités, dans un environnement dynamique.",
      tuningTip: "À utiliser en robotique, en conduite autonome et pour les jeux (par ex. AlphaGo)."
    }
  ],
  math: {
    loss: "Minimisation du risque empirique (ERM)",
    explanation: "Un modèle de Machine Learning paramètre une fonction f par des poids ajustables θ. Le but de l’entraînement est de trouver les poids optimaux θ* qui minimisent l’erreur de prédiction empirique sur les exemples d’entraînement."
  },
  pros: [
    "S’adapte aux évolutions des tendances lorsqu’on le réentraîne sur des données fraîches",
    "Résout des problèmes complexes impossibles à décrire avec une logique if-else rigide",
    "Automatise la prise de décision à grande échelle, sur des millions de transactions par seconde"
  ],
  cons: [
    "« Garbage in, garbage out » : la qualité du modèle est strictement limitée par celle des données d’entraînement",
    "Les prédictions sont des approximations probabilistes, pas des certitudes mathématiques",
    "Vulnérable à la dérive de distribution lorsque le monde réel change"
  ],
  diagram: `flowchart LR
    subgraph trad["Programmation traditionnelle"]
      R1["Règles"] --> P1["Programme"]
      D1["Données"] --> P1
      P1 --> O1["Réponses"]
    end
    subgraph ml["Machine Learning"]
      D2[("Données historiques")] --> L["Algorithme d’apprentissage"]
      Y2["Réponses connues (étiquettes)"] --> L
      L --> M["Modèle appris = règles"]
    end
    M --> N["Nouvelles données inédites"]
    N --> Q["Prédictions"]`
};
