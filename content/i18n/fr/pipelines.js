/**
 * French translation of content/pipelines.js, keyed by pipeline id.
 * `source` must keep every Mermaid node id, arrow and link of the English source;
 * only the quoted labels are translated (checked by tools/validate.js).
 */
export default {
  'ml-lifecycle': {
    title: 'Le cycle de vie du ML',
    description: 'D’une question métier à un modèle surveillé en production, et retour au début quand les données dérivent.',
    source: `flowchart TB
  subgraph data["1 · Données"]
    direction LR
    P(["Problème métier"]) --> D["Collecter et ingérer les données"]
    D --> Q["Valider la qualité des données"]
    Q --> F["Ingénierie des variables"]
  end
  subgraph model["2 · Modélisation"]
    direction LR
    S["Découpage entraînement / validation / test"] --> T["Entraîner et régler les modèles"]
    T --> E["Évaluer sur des données mises de côté"]
    E --> R["Enregistrer le meilleur modèle"]
    T -.-> X["Journaliser les essais : suivi d’expériences"]
  end
  subgraph prod["3 · Production"]
    direction LR
    C["Pipeline CI/CD"] --> Dp["Déployer et servir"]
    Dp --> AB["Déploiement A/B ou canari"]
    AB --> M["Surveiller la dérive et les performances"]
    M -.->|"dérive détectée"| RT(["Réentraîner : retour à 2 · Modélisation"])
  end
  data --> model
  model --> prod`
  },
  'data-platform': {
    title: 'Plateforme de données moderne',
    description: 'Comment les événements bruts et les modifications de bases de données deviennent des tables propres pour les tableaux de bord et des variables pour les modèles.',
    source: `flowchart TB
  subgraph src["Sources"]
    direction LR
    OLTP[("Base de l’application : OLTP")]
    EV["Événements de navigation"]
    FILES["Fichiers et API"]
  end
  OLTP --> CD["Capture des modifications (CDC)"]
  CD --> K["Topics Kafka"]
  EV --> K
  K --> SS["Traitement en flux"]
  subgraph lh["Lakehouse"]
    direction LR
    RAW["Bronze : Parquet brut"] --> SIL["Silver : nettoyé et harmonisé"]
    SIL --> GOLD["Gold : schéma en étoile"]
  end
  FILES -->|"ingestion par lots"| RAW
  SS --> RAW
  PT["Partitionnement et organisation des fichiers"] -.-> RAW
  SP["Jobs Spark"] -.-> SIL
  DQ["Contrôles de qualité des données"] -.-> SIL
  DBT["Modèles dbt"] -.-> GOLD
  AF["Orchestration Airflow"] -.-> SP
  AF -.-> DBT
  GOLD --> BI["Tableaux de bord BI : OLAP"]
  GOLD --> FS["Feature store"]
  FS --> ML["Entraînement et service des modèles"]`
  },
  preprocessing: {
    title: 'Prétraitement sans fuite de données',
    description: 'Découpez d’abord, puis ajustez chaque transformation sur le seul jeu d’entraînement. C’est cet ordre qui évite la fuite de données.',
    source: `flowchart TB
  RAW["Table brute"] --> SPLIT{"Découper d’abord"}
  SPLIT -->|"entraînement"| IMP["Imputer les valeurs manquantes"]
  IMP --> ENC["Encoder les variables catégorielles"]
  ENC --> SCL["Mettre à l’échelle les variables numériques"]
  SCL --> SEL["Sélectionner les variables"]
  SEL --> BAL["Rééquilibrer les classes : entraînement seulement"]
  BAL --> MOD["Ajuster le modèle avec validation croisée"]
  SPLIT -->|"test : mis sous clé"| TEST["Évaluation finale"]
  MOD -->|"appliquer les transformations ajustées"| TEST`
  },
  'training-loop': {
    title: 'Boucle d’entraînement d’un réseau de neurones',
    description: 'Ce qui se passe à chaque mini-lot pendant qu’un réseau profond apprend, et quand s’arrêter.',
    source: `flowchart TB
  X["Mini-lot d’entrées"] --> FW["Propagation avant : sommes pondérées"]
  FW --> A["Fonctions d’activation"]
  A --> L["Calculer la perte par rapport aux étiquettes"]
  L --> BP["Rétropropagation : gradients"]
  BP --> O["Pas de l’optimiseur : SGD / Adam"]
  R["Dropout, BatchNorm, weight decay"] -.-> FW
  O -->|"lot suivant"| X
  O --> V{"La perte de validation baisse encore ?"}
  V -->|"non : arrêt précoce"| STOP(["Garder le meilleur checkpoint"])`
  }
};
