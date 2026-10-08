export default {
  id: "lakehouse-architecture",
  name: "Data Lakehouse (Delta Lake / Iceberg)",
  track: "data-eng",
  category: "Architecture & Data Management",
  task: ["Architecture", "Data Governance", "ACID Transactions"],
  difficulty: "Intermediate",
  summary: "A modern architecture that combines the low storage cost of Data Lakes with the ACID transactional integrity and schema enforcement of Data Warehouses.",
  intuition: "Best of Both Worlds: Keeps raw data cheaply on object storage (like AWS S3) formatted as Parquet, but layers a transaction commit log on top to guarantee database-like reliability.",
  whenToUse: "Building modern scalable enterprise data platforms where both BI analysts (SQL) and Data Scientists (ML) query the exact same single source of truth.",
  whenToAvoid: "When you have a small startup application with only a couple hundred megabytes of data in a standard Postgres database.",
  requirements: {
    acidTransactions: true,
    timeTravel: true,
    schemaEvolution: true,
    lowCostStorage: true
  },
  parameters: [
    {
      name: "target-file-size",
      type: "string",
      default: "128MB - 512MB",
      impact: "Target size when compacting small files.",
      tuningTip: "Run `OPTIMIZE / VACUUM` commands regularly to solve the dreaded 'small file problem'."
    }
  ],
  math: {
    formula: "Lakehouse = Cheap Object Store (S3/GCS) + Parquet Data + ACID Metadata Log",
    loss: "Multi-Version Concurrency Control (MVCC)",
    explanation: "Readers never block writers. New transactions write new immutable Parquet files and commit an atomic entry to the transaction log, enabling instant Time Travel to past timestamps."
  },
  pros: [
    "Eliminates dual-hop ETL architecture (no need to copy data from Lake to Warehouse)",
    "Time Travel allows querying historical data versions for exact ML model reproducibility",
    "Full ACID transactions prevent corrupted partial writes from pipeline failures"
  ],
  cons: [
    "Requires routine maintenance (compaction and vacuuming of expired files)",
    "Slightly higher query latency than dedicated in-memory data warehouses for simple queries"
  ],
  prerequisites: ["warehouse-vs-lake", "parquet-format"],
  related: ["data-partitioning", "cdc", "apache-spark", "dbt"],
  diagram: `flowchart LR
  src["Batch files, CDC, streams"] --> bronze[("Bronze: raw")]
  bronze --> silver[("Silver: cleaned, deduped")]
  silver --> gold[("Gold: business aggregates")]
  subgraph storage["Object storage (S3 / GCS)"]
    pq["Immutable Parquet files"]
    log["Transaction log: _delta_log / Iceberg metadata"]
  end
  silver --> pq
  pq --> log
  log --> acid["Atomic commits + time travel"]
  gold --> bi["SQL / BI"]
  gold --> ml["Data science / ML"]`,
  codeSnippet: `from delta import configure_spark_with_delta_pip
from pyspark.sql import SparkSession

builder = SparkSession.builder.appName("LakehouseDemo") \\
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
spark = configure_spark_with_delta_pip(builder).getOrCreate()

# Time Travel: Query data exactly as it existed yesterday!
df_historical = spark.read.format("delta") \\
    .option("timestampAsOf", "2026-10-02 00:00:00") \\
    .load("/mnt/lakehouse/silver_customers")`
};
