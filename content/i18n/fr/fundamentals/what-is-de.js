export default {
  name: "Qu’est-ce que l’ingénierie des données (DE) ?",
  category: "Fondamentaux & vue d’ensemble",
  task: ["Définition", "Ingénierie des données", "Architecture"],
  summary: "La discipline d’ingénierie chargée de concevoir, construire, orchestrer et maintenir les pipelines de données, les systèmes de stockage et les plateformes évolutives qui fournissent des données propres, à jour et fiables aux analystes, aux data scientists et aux modèles de ML.",
  intuition: "La plomberie et la station d’épuration de l’IA : les data scientists et les modèles de ML sont des chefs qui préparent des plats raffinés. Si les tuyaux de la cuisine fuient, si l’eau est boueuse ou ne coule qu’une fois par semaine, aucun chef ne peut cuisiner. Les data engineers construisent la station de traitement de l’eau et les canalisations haute pression.",
  whenToUse: "Dès que les données sont réparties entre des systèmes hétérogènes (bases de données, API, logs) et doivent être ingérées de façon fiable, nettoyées, dédupliquées, formatées et rendues interrogeables pour les utilisateurs en aval.",
  whenToAvoid: "Lorsque vous avez un simple fichier CSV statique qui tient sans peine sur votre ordinateur portable et n’est jamais mis à jour (analyse ponctuelle sur tableur).",
  parameters: [
    {
      impact: "Extraire les données brutes des systèmes opérationnels (bases de données, webhooks, capteurs IoT).",
      tuningTip: "Traitement par lots pour les rapports quotidiens (Airflow) ; streaming pour les alertes en moins d’une seconde (Kafka)."
    },
    {
      impact: "Organiser les données en niveaux brut (Bronze), nettoyé (Silver) et agrégé (Gold).",
      tuningTip: "Utilisez le format colonnaire Parquet sur du stockage objet (S3/GCS) avec des métadonnées Delta/Iceberg."
    },
    {
      impact: "Traiter les valeurs nulles, convertir les types, calculer les jointures et produire les indicateurs métier.",
      tuningTip: "Préférez l’ELT à l’ETL sur les entrepôts de données cloud modernes."
    }
  ],
  math: {
    loss: "Traçabilité des données (lineage) et respect des SLA (accords de niveau de service)",
    explanation: "L’ingénierie des données se concentre sur le débit (gigaoctets/s), la latence (délai avant l’information exploitable), la qualité des données (zéro ligne corrompue) et l’idempotence des pipelines (deux exécutions produisent des résultats identiques)."
  },
  pros: [
    "Fournit le socle indispensable et éprouvé de tous les systèmes d’analyse et de ML",
    "Évite des pannes de modèles catastrophiques dues à des changements de schéma silencieux et à des données sales",
    "Permet d’ouvrir l’accès aux données de l’entreprise de façon sécurisée à des milliers de requêtes simultanées"
  ],
  cons: [
    "Infrastructure très complexe (Kafka, Spark, Airflow, Kubernetes, facturation cloud)",
    "Ruptures de schéma fréquentes et inattendues venant d’API tierces en amont"
  ],
  diagram: `flowchart LR
    A[("Bases de données applicatives (OLTP)")] --> D["Ingestion : par lots ou CDC"]
    B["Flux d’événements / Kafka"] --> D
    C["API tierces & fichiers"] --> D
    D --> E[("Zone brute : data lake")]
    E --> F["Transformer : nettoyer, joindre, agréger (Spark / dbt)"]
    F --> G[("Entrepôt / lakehouse organisé")]
    G --> H["Tableaux de bord BI"]
    G --> I["Pipelines de variables pour le ML"]
    O["Orchestrateur (Airflow)"] -.-> D
    O -.-> F`
};
