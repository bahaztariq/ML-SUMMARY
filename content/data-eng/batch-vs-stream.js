export default {
  id: "batch-vs-stream",
  name: "Batch vs Stream Processing (Lambda vs Kappa)",
  track: "data-eng",
  category: "Streaming & Messaging",
  task: ["Streaming", "Architecture", "Definition"],
  difficulty: "Intermediate",
  summary: "Contrasts processing bounded chunks of data on a schedule (batch) with processing unbounded events continuously as they arrive (stream), and the Lambda/Kappa architectures that combine them.",
  intuition: "Laundry Day vs The Dishwasher Conveyor: Batch is laundry day, you wait until the basket is full and wash everything at once, efficient but delayed. Streaming is a restaurant conveyor dishwasher, each plate is cleaned seconds after it arrives. Lambda runs both machines side by side; Kappa uses only the conveyor and replays old plates when you need to rewash.",
  whenToUse: "Batch for daily reporting, model retraining, backfills and heavy joins where hours of latency are fine. Streaming for fraud detection, real-time recommendations, live dashboards, alerting and online feature computation.",
  whenToAvoid: "Do not build a streaming stack when the business only looks at the data once a day (it costs more and is harder to operate). Avoid Lambda if you cannot afford to maintain two codebases computing the same logic.",
  requirements: {
    scalingRequired: false,
    handlesMissing: true,
    outlierSensitive: false,
    latency: "Batch: minutes-hours / Stream: ms-seconds",
    needsReplayableLog: "Kappa: yes (e.g. Kafka)"
  },
  parameters: [
    {
      name: "window",
      type: "str",
      default: "'tumbling 1 min'",
      impact: "Groups an unbounded stream into finite chunks for aggregation (tumbling, sliding, session).",
      tuningTip: "Use tumbling windows for per-minute counts, sliding for moving averages, session windows for user activity bursts."
    },
    {
      name: "watermark",
      type: "str",
      default: "'10 minutes'",
      impact: "How long the engine waits for late, out-of-order events before finalizing a window.",
      tuningTip: "Set from the observed p99 event lateness; too short drops data, too long increases state and latency."
    },
    {
      name: "trigger_interval",
      type: "str",
      default: "'processingTime=1 minute'",
      impact: "How often micro-batches fire in Spark Structured Streaming.",
      tuningTip: "Shorter triggers lower latency but create more small files; use availableNow for incremental batch-like runs."
    },
    {
      name: "delivery_semantics",
      type: "str",
      default: "'at-least-once'",
      impact: "Whether events can be duplicated or lost on failure.",
      tuningTip: "Achieve effectively exactly-once with checkpoints plus idempotent or transactional sinks (Delta, Kafka transactions)."
    }
  ],
  math: {
    formula: "Latency_end-to-end = Wait for batch/window + Processing time + Commit time",
    loss: "Latency vs Throughput vs Cost",
    explanation: "Batch amortizes fixed overhead over many records (high throughput, high latency). Streaming processes small increments continuously (low latency) but must hold state and handle late, out-of-order events using event-time windows and watermarks."
  },
  pros: [
    "Batch: simple, cheap, easy to reprocess and debug with deterministic inputs",
    "Stream: second-level freshness enables real-time decisions and alerts",
    "Kappa: one codebase; reprocessing is just replaying the log from an earlier offset",
    "Modern engines (Spark, Flink) share APIs between batch and streaming"
  ],
  cons: [
    "Batch: stale data between runs; large jobs can miss SLAs",
    "Stream: harder to operate (state stores, checkpoints, late data, backpressure)",
    "Lambda: duplicate logic in batch and speed layers that can silently diverge",
    "Exactly-once guarantees require careful sink design"
  ],
  prerequisites: ["what-is-de", "etl-vs-elt"],
  related: ["apache-kafka", "apache-spark", "airflow", "cdc"],
  diagram: `flowchart LR
  ev["Event sources"] --> log[("Kafka log")]
  subgraph lambda["Lambda architecture"]
    log --> batch["Batch layer: nightly Spark recompute"]
    log --> speed["Speed layer: streaming increments"]
    batch --> serve["Serving layer merges both views"]
    speed --> serve
  end
  subgraph kappa["Kappa architecture"]
    log --> stream["Single stream job: windows + watermarks"]
    stream --> sink[("Delta / feature store")]
    log -.->|"replay from old offset to reprocess"| stream
  end
  serve --> apps["Dashboards & ML"]
  sink --> apps`,
  codeSnippet: `from pyspark.sql import SparkSession
from pyspark.sql.functions import col, from_json, window, sum as _sum
from pyspark.sql.types import StructType, StringType, DoubleType, TimestampType

spark = SparkSession.builder.appName("BatchVsStream").getOrCreate()
schema = (StructType()
          .add("user_id", StringType())
          .add("amount", DoubleType())
          .add("event_ts", TimestampType()))

# --- BATCH: bounded input, run once per day by Airflow ---
daily = (spark.read.parquet("s3a://lake/payments/date=2026-10-03/")
         .groupBy("user_id").agg(_sum("amount").alias("daily_spend")))
daily.write.mode("overwrite").parquet("s3a://lake/gold/daily_spend/")

# --- STREAM: unbounded Kafka topic, same logic, continuous ---
events = (spark.readStream.format("kafka")
          .option("kafka.bootstrap.servers", "broker:9092")
          .option("subscribe", "payments")
          .load()
          .select(from_json(col("value").cast("string"), schema).alias("e"))
          .select("e.*"))

per_minute = (events
              .withWatermark("event_ts", "10 minutes")      # tolerate late events
              .groupBy(window("event_ts", "1 minute"), "user_id")
              .agg(_sum("amount").alias("spend_1m")))

(per_minute.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "s3a://lake/_chk/spend_1m")
    .trigger(processingTime="1 minute")
    .start("s3a://lake/gold/spend_1m"))`
};
