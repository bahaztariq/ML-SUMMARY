export default {
  name: "Découpage entraînement/test et prévention des fuites de données",
  category: "Prétraitement et validation",
  task: ["Prétraitement", "Validation", "Fuite de données"],
  summary: "La pratique fondamentale qui consiste à séparer le jeu de données en ensembles d’entraînement et de test distincts AVANT tout prétraitement, afin d’évaluer honnêtement la capacité d’un modèle à généraliser à des données vraiment inédites.",
  intuition: "L’analogie de l’examen final : vous révisez (entraînement) les chapitres 1 à 8. L’examen final (ensemble de test) contient des questions du chapitre 9 que vous n’avez JAMAIS vues. Si vous jetez un œil au sujet à l’avance (fuite de données), votre note ne veut plus rien dire.",
  whenToUse: "Absolument obligatoire dans tout flux de travail d’apprentissage supervisé. Sans exception.",
  whenToAvoid: "Ne sautez jamais cette étape. La seule variante, c’est la MANIÈRE de découper (aléatoire, stratifiée, temporelle).",
  parameters: [
    {
      impact: "Fraction des données mise de côté pour le test.",
      tuningTip: "Utilisez 0.2 pour les grands jeux de données (> 10K) et 0.3 pour les plus petits. Pour les très petits jeux de données, utilisez plutôt la validation croisée."
    },
    {
      impact: "Garantit que les ensembles d’entraînement et de test conservent la même distribution des classes que les données d’origine.",
      tuningTip: "Utilisez TOUJOURS stratify=y en classification, pour éviter que tous les échantillons de la classe minoritaire se retrouvent dans un seul ensemble."
    },
    {
      impact: "Graine pour un découpage reproductible.",
      tuningTip: "Fixez toujours une graine (par ex. 42) pour des expériences reproductibles."
    },
    {
      impact: "Indique s’il faut mélanger les données avant le découpage.",
      tuningTip: "Mettez-le à False pour les séries temporelles, où l’ordre chronologique doit être conservé."
    }
  ],
  math: {
    loss: "Estimation de l’erreur de généralisation",
    explanation: "L’ensemble de test sert de substitut à la distribution infinie des données réelles que le modèle rencontrera en production. Laisser fuir la moindre information du test dans l’entraînement gonfle les estimations de performance et mène à des échecs catastrophiques en production."
  },
  pros: [
    "Fournit une estimation honnête et non biaisée de la performance réelle du modèle",
    "Détecte le surapprentissage : un grand écart entre scores d’entraînement et de test = surapprentissage",
    "Simple à mettre en œuvre et universellement compris"
  ],
  cons: [
    "Un découpage aléatoire unique peut tomber mal (utilisez la validation croisée pour des estimations plus robustes)",
    "Réduit les données disponibles pour l’entraînement (20 % d’échantillons en moins pour apprendre)"
  ],
  diagram: `flowchart TD
    A["Jeu de données complet"] --> B{"Ordonné dans le temps ?"}
    B -->|"oui"| C["Découper par date : passé → entraînement, futur → test"]
    B -->|"non"| D["Découpage aléatoire stratifié"]
    C --> E["Ensemble d’entraînement"]
    C --> F["Ensemble de test (mis sous clé)"]
    D --> E
    D --> F
    E --> G["Ajuster scaler / imputer / encodeur sur l’entraînement"]
    G --> H["Entraîner le modèle"]
    G --> I["Transformer le test avec les objets ajustés"]
    F --> I
    H --> J(["Évaluer une seule fois sur le test"])
    I --> J`
};
