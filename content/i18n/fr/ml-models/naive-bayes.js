export default {
  name: "Classifieur bayésien naïf (Naive Bayes)",
  category: "Modèles probabilistes",
  task: ["Classification", "TALN (NLP)", "Classification de texte"],
  summary: "Un classifieur probabiliste fondé sur le théorème de Bayes, qui suppose que toutes les variables sont conditionnellement indépendantes sachant la classe (l'hypothèse « naïve »).",
  intuition: "Le détective anti-spam : sachant que l'e-mail contient « GRATUIT », « GAGNANT » et « CLIQUEZ », quelle est la probabilité qu'il s'agisse de spam ? Naive Bayes multiplie P(GRATUIT|spam) × P(GAGNANT|spam) × P(CLIQUEZ|spam) × P(spam) — en supposant que chaque mot contribue indépendamment.",
  whenToUse: "Classification de texte (détection de spam, analyse de sentiment), prédiction en temps réel avec une latence extrêmement faible, et modèle de référence probabiliste rapide.",
  whenToAvoid: "Quand les variables sont fortement corrélées (l'hypothèse d'indépendance est gravement violée). Quand vous avez besoin de la meilleure précision possible sur des données tabulaires structurées.",
  parameters: [
    {
      impact: "Suppose que les variables suivent une loi gaussienne (normale) au sein de chaque classe.",
      tuningTip: "À utiliser pour des variables continues à valeurs réelles."
    },
    {
      impact: "Conçu pour des comptages de mots et des matrices documents-termes.",
      tuningTip: "La référence pour la classification de texte avec TF-IDF ou CountVectorizer."
    },
    {
      impact: "Conçu pour des variables binaires/booléennes (mot présent ou non).",
      tuningTip: "À utiliser pour des représentations sac de mots binaires."
    },
    {
      impact: "Paramètre de lissage additif qui évite les événements de probabilité nulle.",
      tuningTip: "alpha=1 (Laplace). Mettez alpha=0 pour ne pas lisser (risqué : les mots jamais vus obtiennent P=0)."
    }
  ],
  math: {
    loss: "Probabilité a posteriori via le théorème de Bayes",
    explanation: "Applique la règle de Bayes avec l'hypothèse naïve d'indépendance conditionnelle : P(x₁, x₂, ..., xₙ | C) = ∏ P(xᵢ | C). Bien que cette simplification soit théoriquement fausse, elle fonctionne remarquablement bien en pratique."
  },
  pros: [
    "Entraînement et prédiction ultra-rapides (complexité linéaire O(n·d))",
    "Étonnamment performant en classification de texte malgré l'hypothèse naïve d'indépendance",
    "Nécessite très peu de données d'entraînement pour estimer les paramètres",
    "Gère naturellement la classification multiclasse"
  ],
  cons: [
    "L'hypothèse d'indépendance est presque toujours violée sur des données réelles",
    "Ne peut pas apprendre les interactions entre variables (contrairement aux modèles à base d'arbres ou aux réseaux de neurones)",
    "Les probabilités estimées sont souvent mal calibrées (excès de confiance)"
  ],
  diagram: `flowchart TD
    A[("Données d'entraînement étiquetées")] --> B["Estimer les probabilités a priori P(classe)"]
    A --> C["Estimer les vraisemblances par variable P(x_j | classe)"]
    C --> D["Ajouter un lissage de Laplace pour les valeurs jamais vues"]
    E(["Nouvel échantillon x"]) --> F["Pour chaque classe : log P(classe) + Σ log P(x_j | classe)"]
    B --> F
    D --> F
    F --> G["Hypothèse naïve : variables indépendantes sachant la classe"]
    G --> H["Choisir la classe de plus forte probabilité a posteriori"]
    H --> I(["Classe prédite + probabilités"])`
};
