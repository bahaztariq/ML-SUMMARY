export default {
  name: "Le workflow ML de bout en bout",
  category: "Fondamentaux & vue d’ensemble",
  task: ["Définition", "Prétraitement", "Évaluation", "Déploiement"],
  summary: "La suite d’étapes standard qui transforme une question métier et des données brutes en un modèle validé et déployé : cadrer le problème, collecter et nettoyer les données, construire les variables, entraîner, évaluer, déployer et surveiller.",
  intuition: "La cuisine d’un restaurant : avant qu’un plat n’arrive à table, quelqu’un choisit le menu (cadrage du problème), achète les ingrédients (collecte des données), les lave et les découpe (nettoyage et feature engineering), cuisine (entraînement), goûte (évaluation) et enfin sert le plat et recueille l’avis des clients (déploiement et surveillance). Sauter l’étape de dégustation, c’est ainsi que les mauvais plats arrivent chez le client.",
  whenToUse: "Dans tout projet de Machine Learning, du notebook Kaggle au système de détection de fraude en production. Servez-vous-en comme d’une check-list pour ne jamais oublier les contrôles de fuite de données, les modèles de référence (baselines) et l’évaluation.",
  whenToAvoid: "Sans objet en tant que façon de penser — mais évitez de sur-industrialiser chaque étape (feature store, CI/CD, tests A/B) pour une analyse exploratoire ponctuelle qui ne sera jamais déployée.",
  parameters: [
    {
      impact: "Fixe la variable cible, le type de tâche (classification, régression, clustering) et la métrique de succès.",
      tuningTip: "Notez la référence (par ex. « prédire la classe majoritaire » ou « la valeur du mois dernier ») avant d’entraîner quoi que ce soit."
    },
    {
      impact: "Détermine à quel point votre estimation de la performance sur des données inédites est honnête.",
      tuningTip: "Découpez AVANT tout ajustement des scalers/imputers ; utilisez un découpage chronologique pour les données temporelles."
    },
    {
      impact: "Regroupe prétraitement et modèle pour que les mêmes transformations exactes s’exécutent à l’entraînement et en production.",
      tuningTip: "Sérialisez toujours le pipeline complet, jamais le modèle seul."
    },
    {
      impact: "Guide la sélection du modèle ; une mauvaise métrique sélectionne le mauvais modèle.",
      tuningTip: "Pour des classes déséquilibrées, préférez la précision/le rappel ou la PR-AUC à l’exactitude."
    }
  ],
  math: {
    loss: "Minimisation du risque empirique",
    explanation: "L’entraînement choisit, dans la famille de modèles F, la fonction qui minimise la perte moyenne sur les données d’entraînement. Comme cette estimation est optimiste, le workflow réserve toujours des données inédites pour estimer la vraie perte attendue avant le déploiement."
  },
  pros: [
    "Fournit une structure reproductible qui évite les erreurs courantes comme la fuite de données",
    "Rend les projets plus faciles à expliquer aux parties prenantes et aux collègues",
    "Chaque étape a des entrées/sorties claires, ce qui se transpose directement en pipelines automatisés par la suite"
  ],
  cons: [
    "Les vrais projets reviennent de nombreuses fois en arrière — la vision linéaire masque leur caractère itératif",
    "La collecte et le nettoyage des données prennent souvent 60 à 80 % du temps, ce qui est fréquemment sous-estimé",
    "Sans surveillance, le workflow « s’arrête » au déploiement pendant que le modèle se dégrade en silence"
  ],
  diagram: `flowchart TD
    A(["Question métier"]) --> B["Cadrer le problème : cible + métrique"]
    B --> C[("Collecter les données brutes")]
    C --> D["Nettoyer & imputer"]
    D --> E["Découpage entraînement / test"]
    E --> F["Pipeline de feature engineering"]
    F --> G["Entraîner les modèles candidats"]
    G --> H{"Bat la référence en validation ?"}
    H -->|"non"| F
    H -->|"oui"| I["Évaluation finale sur le jeu de test"]
    I --> J["Déployer le pipeline"]
    J --> K["Surveiller & recueillir les retours"]
    K -.->|"dérive ou nouvelles données"| C`
};
