export default {
  name: "Forêt d'isolement (Isolation Forest)",
  category: "Détection d'anomalies",
  task: ["Détection d'anomalies", "Non supervisé"],
  summary: "Détecte les anomalies en partitionnant aléatoirement les données à l'aide d'arbres : les valeurs aberrantes sont isolées en beaucoup moins de découpages que les points normaux.",
  intuition: "Le jeu des 20 questions : deviner une personne ordinaire dans une foule demande beaucoup de questions, car beaucoup de gens partagent ses caractéristiques. Deviner quelqu'un qui porte une combinaison d'astronaute violet vif n'en demande qu'une ou deux. Isolation Forest pose des questions oui/non aléatoires sur les variables — les points isolés en très peu de questions sont des anomalies.",
  whenToUse: "Détection de fraude non supervisée, détection d'intrusions, détection de pannes de capteurs ou contrôles de qualité des données tabulaires, lorsque vous disposez de peu ou pas d'anomalies étiquetées. Passe bien à l'échelle sur de grands jeux de données de dimension moyennement élevée.",
  whenToAvoid: "Lorsque les anomalies sont définies par la densité locale au sein de clusters serrés (envisagez LOF), lorsque vous disposez de nombreux exemples de fraude étiquetés (utilisez des classifieurs supervisés), ou lorsque les anomalies n'apparaissent que dans des combinaisons de variables que des découpages parallèles aux axes ne peuvent pas saisir.",
  parameters: [
    {
      impact: "Nombre d'arbres d'isolement.",
      tuningTip: "100 à 300 suffisent généralement ; les longueurs de chemin se stabilisent rapidement."
    },
    {
      impact: "Nombre de lignes échantillonnées pour construire chaque arbre.",
      tuningTip: "De petits sous-échantillons (256) aident réellement — ils réduisent les effets de submersion (swamping) et de masquage (masking) des anomalies."
    },
    {
      impact: "Proportion attendue d'anomalies ; fixe le seuil de décision.",
      tuningTip: "Indiquez le taux d'anomalies connu dans votre domaine (p. ex. 0,01) ou gardez « auto » et seuillez vous-même score_samples."
    },
    {
      impact: "Fraction des variables tirées pour entraîner chaque arbre.",
      tuningTip: "Baissez-la (0,5–0,8) sur des jeux de données larges comportant beaucoup de colonnes non pertinentes."
    }
  ],
  math: {
    loss: "Aucune (score non supervisé fondé sur la longueur de chemin)",
    explanation: "h(x) est le nombre de découpages nécessaires pour isoler x dans un arbre, moyenné sur la forêt. c(n) est la longueur moyenne d'une recherche infructueuse dans un arbre binaire de recherche ; elle sert à normaliser. Des scores proches de 1 signalent des anomalies (chemins courts) ; des scores nettement inférieurs à 0,5 signalent des points normaux."
  },
  pros: [
    "Complexité en temps linéaire et faible consommation mémoire — passe à l'échelle sur des millions de lignes",
    "Aucun calcul de distance, donc aucune mise à l'échelle des variables nécessaire",
    "Fonctionne sans aucune étiquette",
    "Peu d'hyperparamètres et des valeurs par défaut robustes"
  ],
  cons: [
    "Les découpages parallèles aux axes peuvent manquer des anomalies dans des espaces de variables pivotés ou corrélés",
    "Choisir contamination exige une connaissance du domaine",
    "Peine à détecter les anomalies locales au sein de clusters denses",
    "Les scores sont difficiles à expliquer sans SHAP ou des outils similaires"
  ],
  diagram: `flowchart TD
    A[("Données non étiquetées")] --> B["Tirer un petit sous-échantillon aléatoire (p. ex. 256 lignes)"]
    B --> C["Choisir une variable et une valeur de découpage aléatoires"]
    C --> D{"Point isolé dans sa propre feuille ?"}
    D -->|"non"| C
    D -->|"oui"| E["Noter la longueur de chemin h(x)"]
    E --> F["Répéter pour de nombreux arbres d'isolement"]
    F --> G["Longueur de chemin moyenne E[h(x)]"]
    G --> H{"Chemin court ?"}
    H -->|"oui"| I(["Anomalie : score proche de 1"])
    H -->|"non"| J(["Point normal"])`
};
