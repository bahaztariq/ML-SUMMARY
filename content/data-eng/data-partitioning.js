export default {
  id: "data-partitioning",
  name: "Partitioning, Bucketing & Z-Ordering",
  track: "data-eng",
  category: "Storage & File Formats",
  task: ["Storage", "Optimization"],
  difficulty: "Advanced",
  summary: "Physically organizes large tables on disk so queries can skip irrelevant files (partition pruning, data skipping) and joins avoid expensive shuffles (bucketing).",
  intuition: "The Filing Cabinet: Partitioning puts each month in its own drawer, so 'show me March' opens one drawer. Bucketing splits each drawer into 32 folders by customer ID hash, so two cabinets organized the same way can be matched folder-to-folder. Z-ordering sorts papers inside each folder by several labels at once, so you can skip most pages by reading only the index tab.",
  whenToUse: "Tables of hundreds of GB or more in Spark, Delta Lake, Iceberg, Hive, BigQuery or Snowflake where queries consistently filter by date/region or join on the same high-cardinality key.",
  whenToAvoid: "Small tables (under ~1 GB) or partitioning on high-cardinality columns like user_id, which creates millions of tiny files (the small file problem) and slows everything down.",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: true,
    skewSensitive: true,
    targetFileSize: "128 MB - 1 GB"
  },
  parameters: [
    {
      name: "partition_by",
      type: "list[str]",
      default: "[]",
      impact: "Columns that define the directory layout (e.g. date=2026-10-03/).",
      tuningTip: "Choose low-cardinality columns that appear in most WHERE clauses; aim for at least ~1 GB per partition."
    },
    {
      name: "num_buckets",
      type: "int",
      default: "None",
      impact: "Number of hash buckets per table on the bucket column.",
      tuningTip: "Bucket both join sides on the same key with the same count (e.g. 64) to get shuffle-free sort-merge joins."
    },
    {
      name: "zorder_by",
      type: "list[str]",
      default: "[]",
      impact: "Multi-column clustering (Delta OPTIMIZE ZORDER / Iceberg sort order) that tightens min/max stats per file.",
      tuningTip: "Z-order on 1-4 high-cardinality filter columns not used for partitioning; re-run after big writes."
    },
    {
      name: "spark.sql.files.maxPartitionBytes",
      type: "int (bytes)",
      default: "128 MB",
      impact: "Max bytes per input split when reading files.",
      tuningTip: "Combine with compaction so files are near the split size and tasks are evenly loaded."
    }
  ],
  math: {
    formula: "Data Scanned = Σ files f where [min_f, max_f] ∩ predicate ≠ ∅   (pruning ratio = 1 − scanned / total)",
    loss: "Bytes scanned / shuffle volume",
    explanation: "The engine reads only partitions whose key matches the filter, then uses per-file min/max statistics to skip files whose value range cannot satisfy the predicate. Z-ordering interleaves the bits of several columns so nearby values cluster in the same files, keeping those ranges narrow for multiple columns at once."
  },
  pros: [
    "Queries filtered on partition columns can scan 100x less data",
    "Bucketing removes the shuffle step from repeated large joins and aggregations",
    "Z-ordering speeds up multi-column filters without exploding directory counts",
    "Directly lowers cloud costs on scan-priced engines (BigQuery, Athena)"
  ],
  cons: [
    "Bad partition keys create tiny files and metadata overhead",
    "Skewed keys (one huge partition) cause straggler tasks",
    "Layout must match query patterns; changing it requires rewriting data",
    "Z-ordering and compaction are extra maintenance jobs that cost compute"
  ],
  prerequisites: ["parquet-format", "warehouse-vs-lake"],
  related: ["apache-spark", "lakehouse-architecture", "oltp-vs-olap"],
  diagram: `flowchart TD
  q["Query: WHERE date = Oct 3 AND country = MA"] --> part{"Partition pruning on date"}
  part -->|"skip"| other["Other date folders never read"]
  part -->|"keep"| folder["date=2026-10-03 folder"]
  folder --> stats{"Per-file min/max on country (Z-ordered)"}
  stats -->|"range excludes MA"| skip["Skip file"]
  stats -->|"range includes MA"| read["Read file row groups"]
  read --> res["Result with fraction of bytes scanned"]
  bk["Bucketed tables: same key, same bucket count"] --> join["Bucket i joins bucket i"]
  join --> noshuf["No shuffle across cluster"]`,
  codeSnippet: `from pyspark.sql import SparkSession
from pyspark.sql.functions import to_date, col

spark = (SparkSession.builder.appName("Layout")
         .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
         .config("spark.sql.catalog.spark_catalog",
                 "org.apache.spark.sql.delta.catalog.DeltaCatalog")
         .getOrCreate())

events = (spark.read.json("s3a://lake/raw/events/")
          .withColumn("event_date", to_date(col("event_ts"))))

# 1) PARTITIONING: one directory per day -> date filters prune whole folders
(events.write.format("delta")
    .partitionBy("event_date")
    .mode("overwrite")
    .save("s3a://lake/silver/events"))

# 2) BUCKETING: hash user_id into 64 buckets -> shuffle-free joins on user_id
(events.write.format("parquet")
    .bucketBy(64, "user_id").sortBy("user_id")
    .mode("overwrite")
    .saveAsTable("silver.events_bucketed"))

# 3) Z-ORDERING: cluster files by two filter columns inside each partition
spark.sql("""
    OPTIMIZE delta.\`s3a://lake/silver/events\`
    WHERE event_date >= '2026-09-01'
    ZORDER BY (user_id, country)
""")

# Query benefits from partition pruning + min/max data skipping
spark.sql("""
    SELECT COUNT(*) FROM delta.\`s3a://lake/silver/events\`
    WHERE event_date = '2026-10-03' AND country = 'MA'
""").explain()   # look for PartitionFilters and skipped files`
};
