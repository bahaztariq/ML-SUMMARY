export default {
  name: "Cycle de vie du ML et vue d’ensemble du MLOps",
  category: "Fondamentaux & vue d’ensemble",
  task: ["Définition", "Déploiement"],
  summary: "Le MLOps applique les principes du DevOps (automatisation, versionnage, tests, surveillance) à tout le cycle de vie du Machine Learning, afin de construire, déployer et améliorer les modèles de façon fiable et répétable.",
  intuition: "Du cuisinier amateur à la chaîne de restaurants : réussir un bon repas chez soi, c’est un modèle dans un notebook. Faire tourner une chaîne de restaurants qui sert le même plat avec la même qualité des milliers de fois par jour, avec des recettes suivies, des contrôles fournisseurs, des inspections sanitaires et des retours clients, c’est le MLOps.",
  whenToUse: "Dès qu’un modèle sera utilisé par de vrais utilisateurs ou dans des processus métier, qu’il doit être réentraîné périodiquement, ou que plus d’une personne travaille dessus.",
  whenToAvoid: "Pour des analyses de recherche ponctuelles ou des preuves de concept où un outillage lourd (registres, CI/CD, feature stores) ralentirait l’apprentissage ; adoptez les pratiques progressivement.",
  requirements: {
    maturityLevel: "Niveau 0 (manuel) → niveau 2 (CI/CD/CT complets)"
  },
  parameters: [
    {
      impact: "Niveau 0 : notebooks manuels ; niveau 1 : pipeline d’entraînement automatisé ; niveau 2 : CI/CD automatisée du pipeline lui-même.",
      tuningTip: "Passez d’abord au niveau 1 : un pipeline d’entraînement reproductible et planifié apporte le plus grand gain."
    },
    {
      impact: "La reproductibilité exige de versionner les trois (code, données, modèles), pas seulement le code.",
      tuningTip: "Utilisez Git pour le code, DVC/lakeFS ou des instantanés de tables pour les données, un registre de modèles pour les modèles."
    },
    {
      impact: "Décide quand le modèle est rafraîchi : selon un planning, sur alerte de dérive ou à l’arrivée de nouvelles données étiquetées.",
      tuningTip: "Commencez par un planning, puis ajoutez des déclencheurs sur dérive une fois la surveillance jugée fiable."
    },
    {
      impact: "Des passations claires entre data scientists, ML engineers et data engineers évitent les échecs du type « on jette par-dessus le mur ».",
      tuningTip: "Confiez à une seule équipe la responsabilité du modèle de bout en bout en production, alertes comprises."
    }
  ],
  math: {
    loss: "Boucle d’amélioration continue",
    explanation: "La valeur d’un modèle déployé se dégrade à mesure que le monde change. Le MLOps maintient une performance élevée grâce à la surveillance et au réentraînement, une haute disponibilité grâce à une mise en service robuste, et des coûts bas grâce à l’automatisation."
  },
  pros: [
    "Modèles reproductibles : chaque prédiction peut être rattachée au code, aux données et aux paramètres exacts",
    "Des mises en production plus rapides et plus sûres grâce à l’automatisation et aux tests",
    "Les modèles restent précis dans le temps grâce à la surveillance et à l’entraînement continu"
  ],
  cons: [
    "Investissement initial important en outils et en infrastructure",
    "L’écosystème d’outils est fragmenté et évolue vite",
    "Exige des compétences transverses (logiciel, données, ML, ops) difficiles à recruter"
  ],
  diagram: `flowchart LR
    A[("Données versionnées")] --> B["Validation des données"]
    B --> C["Feature engineering"]
    C --> D["Entraînement + suivi des expériences"]
    D --> E{"Passe la porte d’évaluation ?"}
    E -->|"non"| C
    E -->|"oui"| F["Registre de modèles"]
    F --> G["Empaquetage (Docker) & CI/CD"]
    G --> H["Mise en service : par lots ou en ligne"]
    H --> I["Surveillance : dérive, latence, KPI"]
    I -.->|"déclencheur de réentraînement"| A`
};
