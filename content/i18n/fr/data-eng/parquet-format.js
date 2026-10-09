export default {
  name: "Apache Parquet vs CSV / JSON",
  category: "Stockage et formats de fichiers",
  task: ["Stockage de données", "OLAP", "Big data"],
  summary: "Un format de stockage en colonnes open source, optimisé pour les requêtes analytiques (OLAP), avec compression intégrée et statistiques dans les métadonnées.",
  intuition: "Découper le tableur par colonnes : le CSV stocke ligne par ligne (lire 1 colonne oblige à parcourir chaque octet sur le disque). Parquet stocke colonne par colonne, si bien que les requêtes ne lisent que les colonnes demandées.",
  whenToUse: "Le format de stockage de référence pour les data lakes (AWS S3, GCP Cloud Storage), Spark, DuckDB, Snowflake, BigQuery et les jeux d’entraînement de ML.",
  whenToAvoid: "Charges transactionnelles OLTP où des lignes individuelles sont fréquemment insérées, mises à jour ou supprimées une à une (utilisez PostgreSQL ou MySQL).",
  parameters: [
    { impact: "Algorithme de compression au niveau des blocs.", tuningTip: "'SNAPPY' offre une décompression ultrarapide pour les requêtes interactives ; 'ZSTD' donne un meilleur taux de compression pour l’archivage." },
    { impact: "Taille des blocs de lignes écrits ensemble.", tuningTip: "128 Mo à 512 Mo est la norme pour les systèmes distribués comme Spark, afin de correspondre à la taille des blocs HDFS/cloud." }
  ],
  math: {
    loss: "Projection de colonnes et pushdown des prédicats",
    explanation: "Le pied de fichier contient des métadonnées avec les valeurs min/max de chaque bloc de colonne. Quand une requête contient `WHERE age > 65`, elle ignore instantanément des row groups entiers de 128 Mo sans les lire."
  },
  pros: [
    "Réduit les coûts de stockage cloud jusqu’à 75–90 % par rapport au CSV/JSON brut",
    "Exécution des requêtes 10 à 100 fois plus rapide grâce à la projection de colonnes et à l’encodage par dictionnaire",
    "L’application stricte du schéma empêche la corruption silencieuse des données"
  ],
  cons: [
    "Format binaire (impossible à ouvrir directement dans un éditeur de texte classique)",
    "Ajout seul ; modifier des lignes existantes oblige à réécrire tout le fichier"
  ],
  diagram: `flowchart LR
  df["Table : lignes × colonnes"] --> rg["Découper en row groups (~128 Mo)"]
  rg --> cc["Stocker chaque colonne comme un bloc de colonne"]
  cc --> enc["Encodage par dictionnaire + RLE"]
  enc --> comp["Compression Snappy / ZSTD"]
  comp --> foot["Pied de fichier : schéma + stats min/max"]
  q["Requête : SELECT revenue WHERE age ≥ 65"] --> foot
  foot --> skip{"Les stats du row group correspondent ?"}
  skip -->|"non"| sk["Ignorer le row group"]
  skip -->|"oui"| proj["Lire uniquement les blocs revenue + age"]`
};
