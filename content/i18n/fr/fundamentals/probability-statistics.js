export default {
  name: "Initiation aux probabilités et statistiques",
  category: "Mathématiques & optimisation",
  task: ["Définition", "Évaluation"],
  summary: "Le langage mathématique de l’incertitude — distributions, espérance, variance, probabilité conditionnelle, théorème de Bayes et tests d’hypothèse — sur lequel reposent l’apprentissage des modèles de ML à partir de données bruitées et la manière dont on juge leurs résultats.",
  intuition: "Le prévisionniste météo : un prévisionniste ne dit jamais « il va pleuvoir » ; il dit « 70 % de risque de pluie », en se fondant sur la fréquence à laquelle des conditions semblables ont mené à la pluie par le passé (probabilités). Il vérifie ensuite que ses jours à 70 % sont bien pluvieux environ 70 % du temps (statistiques). Les modèles de ML sont des prévisionnistes pour n’importe quel type de résultat.",
  whenToUse: "Pour comprendre les fonctions de perte (la log-loss est une log-vraisemblance négative), les modèles probabilistes (Naive Bayes, GMM), pour juger si l’amélioration d’un modèle est réelle (intervalles de confiance, tests A/B) et pour détecter la dérive (test KS, PSI).",
  whenToAvoid: "À ne jamais négliger — mais évitez de vous fier uniquement aux p-valeurs quand les échantillons sont énormes (tout devient « significatif ») ; regardez aussi la taille de l’effet.",
  parameters: [
    {
      impact: "Résument le centre et la dispersion d’une distribution ; à la base de la standardisation et de nombreuses pertes.",
      tuningTip: "En présence de nombreuses valeurs aberrantes, préférez la médiane et l’écart interquartile, plus robustes."
    },
    {
      impact: "Décrit la probabilité de chaque valeur ; les modèles en supposent une (par ex. la régression linéaire suppose un bruit gaussien).",
      tuningTip: "Tracez d’abord des histogrammes — des données asymétriques demandent souvent une transformation logarithmique."
    },
    {
      impact: "Met à jour une croyance a priori à l’aide d’observations ; c’est le cœur de Naive Bayes et des méthodes bayésiennes.",
      tuningTip: "Pensez aux taux de base : un test fiable à 99 % sur une maladie touchant 1 % de la population produit malgré tout beaucoup de faux positifs."
    },
    {
      impact: "Seuil à partir duquel on rejette l’hypothèse nulle dans un test statistique.",
      tuningTip: "Corrigez pour les comparaisons multiples (Bonferroni) lorsque vous testez de nombreuses variables ou variantes."
    }
  ],
  math: {
    loss: "Règle de Bayes et maximum de vraisemblance",
    explanation: "La règle de Bayes combine la croyance a priori P(θ) avec la vraisemblance des données observées pour obtenir la loi a posteriori. L’estimation du maximum de vraisemblance choisit les paramètres qui rendent les données observées les plus probables : minimiser la MSE revient au maximum de vraisemblance sous bruit gaussien, et minimiser la log-loss revient au maximum de vraisemblance pour des étiquettes de Bernoulli."
  },
  pros: [
    "Explique POURQUOI les pertes courantes (MSE, entropie croisée) sont le bon choix",
    "Permet de quantifier l’incertitude avec des intervalles de confiance plutôt qu’avec un seul chiffre",
    "Fournit des outils rigoureux (tests d’hypothèse) pour décider si le modèle A est vraiment meilleur que B"
  ],
  cons: [
    "Beaucoup de tests supposent l’indépendance et la normalité, souvent violées sur des données réelles",
    "Les p-valeurs sont souvent interprétées à tort comme « la probabilité que l’hypothèse soit vraie »",
    "Une corrélation observée dans les données n’implique pas une causalité"
  ],
  diagram: `flowchart TD
    A[("Échantillon de données observées")] --> B["Statistiques descriptives : moyenne, variance, histogramme"]
    B --> C{"Quelle distribution convient ?"}
    C -->|"continue"| D["Normale / exponentielle"]
    C -->|"binaire ou comptages"| E["Bernoulli / Poisson"]
    D --> F["Estimer les paramètres par maximum de vraisemblance"]
    E --> F
    P["Croyance a priori P(θ)"] --> G["Règle de Bayes → a posteriori P(θ | données)"]
    F --> G
    F --> H["Test d’hypothèse / intervalle de confiance"]
    H --> I{"p-valeur ≤ α ?"}
    I -->|"oui"| J["L’effet est probablement réel"]
    I -->|"non"| K["Peut-être du simple bruit aléatoire"]`
};
