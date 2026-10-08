export default {
  id: "apache-spark",
  name: "Apache Spark",
  track: "data-eng",
  category: "Distributed Compute",
  task: ["Distributed ETL", "Batch Processing", "Big Data ML"],
  difficulty: "Advanced",
  summary: "A unified analytics engine for large-scale distributed data processing using in-memory Resilient Distributed Datasets (RDDs) and DataFrames.",
  intuition: "Orchestra of Supercomputers: Instead of one machine crashing on a 2-terabyte dataset, Spark breaks the data into chunks, assigns them to 100 worker machines in parallel, and coordinates the computation.",
  whenToUse: "Petabyte-scale ETL pipelines, complex distributed join operations, batch feature engineering for ML, and large-scale data cleansing.",
  whenToAvoid: "Datasets that comfortably fit in single-node machine memory (<16 GB). For smaller data, use DuckDB or Polars which are 10x faster and simpler.",
  requirements: {
    distributed: true,
    inMemoryCompute: true,
    lazyEvaluation: true,
    faultTolerant: true
  },
  parameters: [
    {
      name: "spark.executor.memory",
      type: "string",
      default: "1g",
      impact: "Amount of memory to allocate for each executor process.",
      tuningTip: "Typically 16G-32G per executor to prevent heavy Java Garbage Collection pauses."
    },
    {
      name: "spark.sql.shuffle.partitions",
      type: "int",
      default: "200",
      impact: "Default number of partitions used when shuffling data for joins or aggregations.",
      tuningTip: "Enable Adaptive Query Execution (AQE) in Spark 3+ (`spark.sql.adaptive.enabled=true`) to let Spark tune this automatically."
    }
  ],
  math: {
    formula: "Transformation -> Directed Acyclic Graph (DAG) -> Stages -> Tasks",
    loss: "Catalyst Optimizer & Tungsten Engine",
    explanation: "Transformations (.filter, .select, .groupBy) are completely lazy and build an execution plan. Catalyst optimizes the logical plan (pushing filters down) before execution begins."
  },
  pros: [
    "Processes massive data volumes that exceed single-machine memory capacity",
    "Unified API supporting SQL, DataFrames, Streaming, GraphX, and MLlib",
    "Automatic failover: if one worker node crashes, Spark recalculates only the lost chunk"
  ],
  cons: [
    "High cluster infrastructure costs and cluster tuning complexity",
    "Significant latency overhead for small queries (startup time of Spark JVMs)"
  ],
  prerequisites: ["parquet-format", "batch-vs-stream"],
  related: ["data-partitioning", "lakehouse-architecture", "airflow", "apache-kafka"],
  diagram: `flowchart TD
  code["DataFrame code: filter, groupBy"] --> lazy["Lazy logical plan"]
  lazy --> cat["Catalyst optimizer: pushdown, pruning"]
  cat --> phys["Physical plan split into stages at shuffles"]
  phys --> drv["Driver schedules tasks"]
  drv --> e1["Executor 1: tasks on partitions"]
  drv --> e2["Executor 2: tasks on partitions"]
  drv --> e3["Executor N: tasks on partitions"]
  e1 --> shuf["Shuffle by key"]
  e2 --> shuf
  e3 --> shuf
  shuf --> out[("Write Parquet / Delta")]
  e2 -.->|"node fails: recompute lost partition from lineage"| drv`,
  codeSnippet: `from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg

spark = SparkSession.builder \\
    .appName("FeatureEngineering") \\
    .config("spark.sql.adaptive.enabled", "true") \\
    .getOrCreate()

# Read distributed parquet
df = spark.read.parquet("s3a://data-lake/raw_transactions/")

# Transformation: Group by merchant and compute aggregation
features = df.filter(col("status") == "SUCCESS") \\
             .groupBy("merchant_id") \\
             .agg(avg("amount").alias("avg_transaction_amt"))

features.write.mode("overwrite").parquet("s3a://data-lake/features/merchant_agg/")`
};
