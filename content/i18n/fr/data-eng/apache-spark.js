export default {
  name: "Apache Spark",
  category: "Calcul distribué",
  task: ["ETL distribué", "Traitement par lots", "ML sur le big data"],
  summary: "Un moteur d’analyse unifié pour le traitement distribué de données à grande échelle, qui s’appuie sur des Resilient Distributed Datasets (RDD) et des DataFrames en mémoire.",
  intuition: "Un orchestre de superordinateurs : au lieu qu’une seule machine s’effondre sur un jeu de données de 2 téraoctets, Spark découpe les données en morceaux, les confie en parallèle à 100 machines de travail et coordonne le calcul.",
  whenToUse: "Pipelines ETL à l’échelle du pétaoctet, jointures distribuées complexes, ingénierie des caractéristiques en batch pour le ML et nettoyage de données à grande échelle.",
  whenToAvoid: "Jeux de données qui tiennent largement dans la mémoire d’une seule machine (< 16 Go). Pour des données plus petites, utilisez DuckDB ou Polars, 10 fois plus rapides et plus simples.",
  parameters: [
    { impact: "Quantité de mémoire allouée à chaque processus exécuteur.", tuningTip: "Généralement 16G–32G par exécuteur pour éviter de longues pauses du ramasse-miettes Java." },
    { impact: "Nombre de partitions utilisé par défaut lors du shuffle des données pour les jointures ou les agrégations.", tuningTip: "Activez l’Adaptive Query Execution (AQE) dans Spark 3+ (`spark.sql.adaptive.enabled=true`) pour que Spark règle cette valeur automatiquement." }
  ],
  math: {
    loss: "Optimiseur Catalyst et moteur Tungsten",
    explanation: "Les transformations (.filter, .select, .groupBy) sont entièrement paresseuses et construisent un plan d’exécution. Catalyst optimise le plan logique (en poussant les filtres au plus près des données) avant le début de l’exécution."
  },
  pros: [
    "Traite des volumes de données massifs qui dépassent la capacité mémoire d’une seule machine",
    "API unifiée pour SQL, DataFrames, Streaming, GraphX et MLlib",
    "Reprise automatique : si un nœud de travail tombe, Spark ne recalcule que le morceau perdu"
  ],
  cons: [
    "Coûts d’infrastructure de cluster élevés et réglage du cluster complexe",
    "Latence de démarrage importante pour les petites requêtes (temps de lancement des JVM Spark)"
  ],
  diagram: `flowchart TD
  code["Code DataFrame : filter, groupBy"] --> lazy["Plan logique paresseux"]
  lazy --> cat["Optimiseur Catalyst : pushdown, élagage"]
  cat --> phys["Plan physique découpé en étapes aux shuffles"]
  phys --> drv["Le driver planifie les tâches"]
  drv --> e1["Exécuteur 1 : tâches sur des partitions"]
  drv --> e2["Exécuteur 2 : tâches sur des partitions"]
  drv --> e3["Exécuteur N : tâches sur des partitions"]
  e1 --> shuf["Shuffle par clé"]
  e2 --> shuf
  e3 --> shuf
  shuf --> out[("Écrire en Parquet / Delta")]
  e2 -.->|"le nœud tombe : recalcul de la partition perdue à partir du lignage"| drv`
};
