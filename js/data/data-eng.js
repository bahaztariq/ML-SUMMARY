/**
 * Data Engineering — additional concepts and relationship/diagram enrichments.
 */

export const newConcepts = [
  {
    id: "warehouse-vs-lake",
    name: "Data Warehouse vs Data Lake",
    track: "data-eng",
    category: "Architecture & Data Management",
    task: ["Storage", "Architecture", "Definition"],
    difficulty: "Beginner",
    summary: "Compares the two classic analytical storage paradigms: curated, schema-on-write warehouses versus cheap, raw, schema-on-read lakes.",
    intuition: "The Supermarket vs The Farm: A warehouse is a supermarket where every product is cleaned, labeled, and shelved before you arrive, so shopping is fast. A lake is the farm: everything is there in raw form and very cheap to store, but you must clean and prepare what you pick yourself.",
    whenToUse: "Warehouse (Snowflake, BigQuery, Redshift) for governed BI dashboards and SQL reporting on structured data. Lake (S3/GCS/ADLS + Parquet) for massive raw volumes, semi-structured logs, images, and ML training data that need flexible exploration.",
    whenToAvoid: "Do not dump everything into a lake without a catalog or governance (it becomes a 'data swamp'). Do not force images, audio, or raw JSON logs into a warehouse at high per-TB cost; consider a Lakehouse when you need both.",
    requirements: {
      scalingRequired: false,
      handlesMissing: true,
      outlierSensitive: false,
      schemaOnWrite: "Warehouse: yes / Lake: no (schema-on-read)",
      supportsUnstructured: "Lake only"
    },
    parameters: [
      {
        name: "schema_strategy",
        type: "str",
        default: "'schema-on-write' (warehouse)",
        impact: "Decides whether data is validated and typed when loaded or only when queried.",
        tuningTip: "Use schema-on-write for finance/BI tables that must be trusted; schema-on-read for raw landing zones that change often."
      },
      {
        name: "storage_tier",
        type: "str",
        default: "'standard'",
        impact: "Object storage class in a lake (standard, infrequent access, archive).",
        tuningTip: "Apply lifecycle rules: move raw data older than 90 days to cold/archive tiers to cut storage cost by 60-80%."
      },
      {
        name: "compute_coupling",
        type: "str",
        default: "'decoupled'",
        impact: "Whether storage and compute scale independently.",
        tuningTip: "Modern warehouses and lakes both decouple storage and compute; size virtual warehouses/clusters per workload, not per dataset."
      },
      {
        name: "file_format",
        type: "str",
        default: "'parquet'",
        impact: "On-disk format of lake data; determines scan speed and compression.",
        tuningTip: "Land raw data as-is (JSON/CSV), but always convert curated zones to Parquet or Delta/Iceberg tables."
      }
    ],
    math: {
      formula: "Total Cost = Storage ($/TB·month) × TB + Compute ($/sec) × Query Time",
      loss: "Cost vs Query Performance trade-off",
      explanation: "Lakes minimize the storage term (object storage is ~$20/TB·month) but push work into query time. Warehouses spend more on ingestion and storage to pre-organize data, minimizing query time and compute for repeated BI workloads."
    },
    pros: [
      "Warehouse: fast, consistent SQL performance with strong governance and access control",
      "Lake: extremely cheap storage for any data type (structured, semi-structured, unstructured)",
      "Lake: data scientists can access raw, unaggregated history for ML feature engineering",
      "Both scale elastically in the cloud with decoupled storage and compute"
    ],
    cons: [
      "Warehouse: expensive at petabyte scale and poor fit for images, audio, or raw logs",
      "Lake: no ACID transactions or schema enforcement by default, leading to data swamps",
      "Running both often means duplicate copies and two-hop ETL pipelines",
      "Lake queries need careful partitioning and file sizing to perform well"
    ],
    codeSnippet: `-- WAREHOUSE (Snowflake): schema-on-write, data is typed when loaded
CREATE TABLE analytics.orders (
    order_id     BIGINT PRIMARY KEY,
    customer_id  BIGINT NOT NULL,
    amount       NUMBER(10, 2),
    created_at   TIMESTAMP_NTZ
);

COPY INTO analytics.orders
FROM @raw_stage/orders/
FILE_FORMAT = (TYPE = PARQUET)
MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

-- LAKE (Athena / Trino over S3): schema-on-read, files stay where they are
CREATE EXTERNAL TABLE lake.raw_events (
    event_id    STRING,
    user_id     STRING,
    payload     STRING        -- raw JSON, parsed only at query time
)
PARTITIONED BY (event_date STRING)
STORED AS PARQUET
LOCATION 's3://company-lake/raw/events/';

-- Query the lake: only scans the partition we ask for
SELECT json_extract_scalar(payload, '$.page') AS page, COUNT(*) AS views
FROM lake.raw_events
WHERE event_date = '2026-10-01'
GROUP BY 1
ORDER BY views DESC;`,
    prerequisites: ["what-is-de", "parquet-format"],
    related: ["lakehouse-architecture", "oltp-vs-olap", "etl-vs-elt", "data-partitioning"],
    diagram: `flowchart LR
  src["Sources: apps, logs, APIs"] --> choice{"Where to land data?"}
  choice -->|"curated, structured"| etl["Transform + validate first"]
  etl --> wh[("Data Warehouse")]
  wh --> bi["BI dashboards / SQL reports"]
  choice -->|"raw, any format"| lake[("Data Lake on S3 / GCS")]
  lake --> sor["Schema applied at read time"]
  sor --> ml["ML training / exploration"]
  sor --> etl2["Curate subset"]
  etl2 --> wh
  lake -.->|"add ACID log"| lh["Lakehouse"]`
  },

  {
    id: "oltp-vs-olap",
    name: "OLTP vs OLAP",
    track: "data-eng",
    category: "Storage & File Formats",
    task: ["Storage", "Definition", "Architecture"],
    difficulty: "Beginner",
    summary: "Distinguishes transactional databases optimized for many small reads/writes (OLTP) from analytical systems optimized for large scans and aggregations (OLAP).",
    intuition: "The Cashier vs The Accountant: The cashier (OLTP) handles thousands of tiny transactions per minute, one customer at a time, and must never make a mistake. The accountant (OLAP) reads the entire year's receipts at once to answer big questions like 'which product sold best per region?'.",
    whenToUse: "OLTP (PostgreSQL, MySQL) for application backends: user accounts, orders, payments, inventory. OLAP (Snowflake, BigQuery, ClickHouse, DuckDB) for dashboards, reporting, ad-hoc analytics and ML feature aggregation over millions of rows.",
    whenToAvoid: "Do not run heavy analytical GROUP BY queries on your production OLTP database (it locks rows and slows the app). Do not use an OLAP warehouse as an application backend for single-row updates.",
    requirements: {
      scalingRequired: false,
      handlesMissing: true,
      outlierSensitive: false,
      storageLayout: "OLTP: row-oriented / OLAP: column-oriented",
      normalized: "OLTP: 3NF / OLAP: denormalized star schema"
    },
    parameters: [
      {
        name: "storage_orientation",
        type: "str",
        default: "'row' (OLTP)",
        impact: "Row stores keep a full record together; column stores keep each column together.",
        tuningTip: "Row layout wins for 'fetch user 42'; columnar layout wins for 'average amount across 1B rows'."
      },
      {
        name: "isolation_level",
        type: "str",
        default: "'READ COMMITTED'",
        impact: "Concurrency guarantees for simultaneous transactions in OLTP.",
        tuningTip: "Use SERIALIZABLE only for critical money flows; it reduces throughput."
      },
      {
        name: "indexes",
        type: "concept",
        default: "B-tree on primary key",
        impact: "Speeds up point lookups in OLTP; OLAP relies on zone maps/min-max stats instead.",
        tuningTip: "Index foreign keys and frequent WHERE columns in OLTP; in OLAP, sort/cluster by the most-filtered column."
      },
      {
        name: "normalization",
        type: "str",
        default: "'3NF' (OLTP)",
        impact: "Degree to which data is split into many related tables.",
        tuningTip: "Normalize for write integrity in OLTP; denormalize into facts/dimensions in OLAP to avoid expensive joins."
      }
    ],
    math: {
      formula: "Bytes Read (row store) = N × Σ all columns   vs   Bytes Read (column store) = N × Σ queried columns",
      loss: "I/O per query",
      explanation: "An analytical query touching 3 of 100 columns reads ~3% of the data in a column store but 100% in a row store. Conversely, inserting one record touches 1 page in a row store but 100 separate column files in a column store."
    },
    pros: [
      "OLTP: ACID transactions with millisecond single-row latency",
      "OLTP: normalization prevents update anomalies and duplicate data",
      "OLAP: scans billions of rows in seconds thanks to columnar compression and vectorized execution",
      "Separating the two protects production apps from analytical load"
    ],
    cons: [
      "OLTP: slow and risky for wide aggregations over the full history",
      "OLAP: poor for frequent single-row updates/deletes and high-concurrency writes",
      "Requires a pipeline (batch ETL or CDC) to move data from OLTP to OLAP",
      "Data in OLAP is usually minutes to hours behind the source"
    ],
    codeSnippet: `-- OLTP (PostgreSQL): tiny, indexed, transactional writes
BEGIN;
UPDATE accounts SET balance = balance - 49.99 WHERE account_id = 1042;
INSERT INTO orders (order_id, account_id, amount, status, created_at)
VALUES (987654, 1042, 49.99, 'PAID', NOW());
COMMIT;

-- Point lookup served by a B-tree index in under 1 ms
SELECT status FROM orders WHERE order_id = 987654;

-- OLAP (BigQuery / Snowflake / DuckDB): huge scan, few columns, aggregation
SELECT
    d.region,
    DATE_TRUNC('month', f.order_date) AS month,
    SUM(f.amount)                     AS revenue,
    COUNT(DISTINCT f.customer_key)    AS active_customers
FROM fact_orders f
JOIN dim_customer d ON f.customer_key = d.customer_key
WHERE f.order_date >= '2026-01-01'
GROUP BY 1, 2
ORDER BY month, revenue DESC;`,
    prerequisites: ["what-is-de"],
    related: ["warehouse-vs-lake", "dimensional-modeling", "parquet-format", "cdc"],
    diagram: `flowchart LR
  app["Web / mobile app"] -->|"single-row INSERT / UPDATE"| oltp[("OLTP DB: row store, 3NF")]
  oltp -->|"ms point lookups"| app
  oltp -->|"batch ETL or CDC"| pipe["Pipeline"]
  pipe --> olap[("OLAP warehouse: column store")]
  olap --> scan["Scan only needed columns"]
  scan --> agg["Vectorized GROUP BY / SUM"]
  agg --> dash["Dashboards & ML features"]`
  },

  {
    id: "dimensional-modeling",
    name: "Dimensional Modeling (Star Schema & SCD)",
    track: "data-eng",
    category: "Architecture & Data Management",
    task: ["Storage", "Architecture"],
    difficulty: "Intermediate",
    summary: "Organizes analytical data into fact tables (measurable events) surrounded by dimension tables (descriptive context), with Slowly Changing Dimensions to track history.",
    intuition: "The Receipt and the Address Book: Each receipt (fact) records what happened: amount, quantity, date. It only stores short references to who bought it, where, and what product, which live in address books (dimensions). When a customer moves city, SCD Type 2 keeps the old address page and adds a new one, so old receipts still show the city at the time of purchase.",
    whenToUse: "Designing the gold/mart layer of a warehouse or lakehouse for BI tools, self-service SQL, and consistent business metrics (revenue, churn, conversion) across teams.",
    whenToAvoid: "Transactional application databases (keep them normalized), or tiny datasets where one flat table is simpler. Avoid SCD Type 2 on attributes that change constantly (it explodes row counts).",
    requirements: {
      scalingRequired: false,
      handlesMissing: false,
      outlierSensitive: false,
      surrogateKeys: true,
      grainDefined: true
    },
    parameters: [
      {
        name: "grain",
        type: "str",
        default: "'one row per order line'",
        impact: "The exact meaning of a single fact row; drives every downstream metric.",
        tuningTip: "Declare the grain first and choose the lowest practical level; you can always aggregate up, never down."
      },
      {
        name: "scd_type",
        type: "int",
        default: "1",
        impact: "How dimension changes are handled: Type 1 overwrites, Type 2 adds a new versioned row, Type 3 keeps a 'previous value' column.",
        tuningTip: "Use Type 2 for attributes analysts slice history by (region, plan tier); Type 1 for typo fixes."
      },
      {
        name: "schema_shape",
        type: "str",
        default: "'star'",
        impact: "Star keeps dimensions denormalized; snowflake normalizes them into sub-tables.",
        tuningTip: "Prefer star schemas in columnar warehouses: fewer joins and simpler SQL for analysts."
      },
      {
        name: "surrogate_key",
        type: "concept",
        default: "hash or sequence",
        impact: "Warehouse-owned key that decouples dimensions from source system IDs and enables SCD2 versions.",
        tuningTip: "Generate deterministic hash keys (e.g. md5 of natural key + valid_from) so rebuilds are idempotent."
      }
    ],
    math: {
      formula: "SCD2 lookup: dim_row where natural_key = k AND valid_from ≤ event_ts AND event_ts < valid_to",
      loss: "Point-in-time correctness",
      explanation: "Each dimension version holds a validity interval. Facts join to the version active at the event timestamp, so historical reports remain stable even after attributes change. This same point-in-time join prevents leakage when building ML training sets."
    },
    pros: [
      "Intuitive for business users: facts are verbs (sales), dimensions are nouns (customer, product)",
      "Few, predictable joins perform very well in columnar engines",
      "SCD Type 2 preserves full history for accurate time-based reporting",
      "Conformed dimensions give one consistent definition of 'customer' across all marts"
    ],
    cons: [
      "Requires up-front design and agreement on grain and business definitions",
      "SCD2 merge logic adds pipeline complexity and table growth",
      "Denormalized dimensions duplicate data and need careful updates",
      "Less flexible than raw tables for exploratory data science"
    ],
    codeSnippet: `-- SCD Type 2 merge: close changed rows, then insert new versions
MERGE INTO dim_customer AS tgt
USING stg_customers AS src
  ON tgt.customer_id = src.customer_id AND tgt.is_current = TRUE
WHEN MATCHED AND (tgt.city <> src.city OR tgt.plan_tier <> src.plan_tier) THEN
  UPDATE SET is_current = FALSE, valid_to = CURRENT_TIMESTAMP;

INSERT INTO dim_customer (customer_key, customer_id, city, plan_tier,
                          valid_from, valid_to, is_current)
SELECT MD5(src.customer_id || CAST(CURRENT_TIMESTAMP AS VARCHAR)),
       src.customer_id, src.city, src.plan_tier,
       CURRENT_TIMESTAMP, TIMESTAMP '9999-12-31', TRUE
FROM stg_customers src
LEFT JOIN dim_customer cur
  ON cur.customer_id = src.customer_id AND cur.is_current = TRUE
WHERE cur.customer_id IS NULL;   -- new customers + those we just closed

-- Star-schema query: facts joined to the dimension version valid at order time
SELECT c.city, p.category, SUM(f.amount) AS revenue
FROM fact_order_lines f
JOIN dim_customer c
  ON f.customer_id = c.customer_id
 AND f.order_ts >= c.valid_from AND f.order_ts < c.valid_to
JOIN dim_product p ON f.product_key = p.product_key
GROUP BY c.city, p.category;`,
    prerequisites: ["oltp-vs-olap", "warehouse-vs-lake"],
    related: ["dbt", "cdc", "data-quality", "feature-store"],
    diagram: `flowchart TD
  src[("OLTP source tables")] --> stg["Staging: cleaned copies"]
  stg --> grain{"Declare grain: one row per order line"}
  grain --> fact[("fact_orders: amounts, FKs")]
  stg --> dimchk{"Attribute changed?"}
  dimchk -->|"no"| keep["Keep current row"]
  dimchk -->|"yes, SCD2"| close["Close old row: valid_to = now"]
  close --> newrow["Insert new version: is_current = true"]
  keep --> dim[("dim_customer / dim_product")]
  newrow --> dim
  fact --> star["Star join on surrogate keys"]
  dim --> star
  star --> bi["BI metrics & ML features"]`
  },

  {
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
    .start("s3a://lake/gold/spend_1m"))`,
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
  sink --> apps`
  },

  {
    id: "cdc",
    name: "Change Data Capture (CDC)",
    track: "data-eng",
    category: "Streaming & Messaging",
    task: ["Streaming", "Storage", "Architecture"],
    difficulty: "Advanced",
    summary: "Captures every insert, update and delete from a source database's transaction log and streams those changes downstream in near real-time.",
    intuition: "The Security Camera: Instead of photographing the whole warehouse every night (full snapshot) and comparing pictures, CDC watches the door and records every item that comes in, goes out, or is moved, the moment it happens. Downstream, you replay the recording to keep an exact live copy.",
    whenToUse: "Keeping a warehouse/lakehouse in sync with OLTP databases with minute-level freshness, feeding real-time features, event-driven microservices, cache invalidation, and zero-downtime database migrations.",
    whenToAvoid: "Small tables that are cheap to fully reload nightly, sources where you lack access to the transaction log (WAL/binlog), or when consumers only need daily snapshots.",
    requirements: {
      scalingRequired: false,
      handlesMissing: false,
      outlierSensitive: false,
      needsTransactionLog: true,
      orderedPerKey: true
    },
    parameters: [
      {
        name: "capture_method",
        type: "str",
        default: "'log-based'",
        impact: "Log-based (WAL/binlog) vs query-based (polling an updated_at column) vs trigger-based.",
        tuningTip: "Prefer log-based CDC (Debezium): it captures deletes, adds no load to source tables, and preserves order."
      },
      {
        name: "snapshot.mode",
        type: "str",
        default: "'initial'",
        impact: "Whether the connector first takes a consistent full snapshot before streaming changes.",
        tuningTip: "Use 'initial' for new pipelines; use incremental snapshots to backfill large tables without locking."
      },
      {
        name: "message_key",
        type: "concept",
        default: "table primary key",
        impact: "Kafka partition key; guarantees all changes to one row stay ordered.",
        tuningTip: "Never re-key CDC topics by a non-unique column, or updates for the same row may apply out of order."
      },
      {
        name: "tombstones.on.delete",
        type: "bool",
        default: "true",
        impact: "Emits a null-value record after a delete so compacted topics drop the key.",
        tuningTip: "Keep enabled with log-compacted topics; make sure sinks treat op='d' as a hard or soft delete."
      }
    ],
    math: {
      formula: "Target(t) = Snapshot(t₀) + Σ ordered changes Δ(t₀ → t)   applied via MERGE on primary key",
      loss: "Replication lag & consistency",
      explanation: "The target state equals an initial snapshot plus every change event applied in log order. Because each event carries before/after images and a log sequence number (LSN), the sink can deduplicate and apply them idempotently with a MERGE, keeping replication lag to seconds."
    },
    pros: [
      "Near real-time replication with minimal load on the production database",
      "Captures hard deletes and every intermediate update (full audit history)",
      "Decouples source systems from many downstream consumers via Kafka",
      "Replaces fragile nightly full-table dumps"
    ],
    cons: [
      "Requires database-level configuration (logical replication, binlog retention, permissions)",
      "Schema changes in the source must be propagated and handled downstream",
      "Operational complexity: connectors, offsets, Kafka, and merge jobs to monitor",
      "Sinks must handle out-of-order, duplicate, and delete events correctly"
    ],
    codeSnippet: `# Debezium PostgreSQL connector (Kafka Connect), registered via REST API
name: orders-postgres-cdc
config:
  connector.class: io.debezium.connector.postgresql.PostgresConnector
  database.hostname: orders-db.internal
  database.port: "5432"
  database.user: cdc_reader
  database.password: \${file:/secrets/db.properties:password}
  database.dbname: shop
  plugin.name: pgoutput              # native logical decoding
  slot.name: debezium_orders
  publication.autocreate.mode: filtered
  table.include.list: public.orders,public.customers
  topic.prefix: shop                 # topics: shop.public.orders ...
  snapshot.mode: initial             # full snapshot, then stream WAL
  tombstones.on.delete: "true"
  key.converter: org.apache.kafka.connect.json.JsonConverter
  value.converter: org.apache.kafka.connect.json.JsonConverter

# Example change event value (op: c=create, u=update, d=delete)
# {
#   "before": {"order_id": 42, "status": "PENDING"},
#   "after":  {"order_id": 42, "status": "PAID"},
#   "op": "u",
#   "source": {"lsn": 23874650, "table": "orders"},
#   "ts_ms": 1759500000000
# }
# Downstream: MERGE INTO silver.orders USING changes ON order_id
#   WHEN MATCHED AND op = 'd' THEN DELETE
#   WHEN MATCHED THEN UPDATE ...  WHEN NOT MATCHED THEN INSERT ...`,
    prerequisites: ["oltp-vs-olap", "apache-kafka"],
    related: ["batch-vs-stream", "dimensional-modeling", "lakehouse-architecture"],
    diagram: `flowchart LR
  app["Application writes"] --> db[("PostgreSQL")]
  db --> wal["Write-ahead log (WAL)"]
  wal --> dbz["Debezium connector reads log"]
  dbz -->|"before / after / op / LSN"| topic[("Kafka topic keyed by PK")]
  topic --> merge{"op type?"}
  merge -->|"c / u"| upsert["MERGE upsert"]
  merge -->|"d"| del["Delete or soft-delete"]
  upsert --> lh[("Lakehouse silver table")]
  del --> lh
  topic --> svc["Other consumers: cache, search, features"]`
  },

  {
    id: "dbt",
    name: "dbt (data build tool)",
    track: "data-eng",
    category: "Orchestration & Workflow",
    task: ["Preprocessing", "Architecture", "Evaluation"],
    difficulty: "Intermediate",
    summary: "A SQL-first transformation framework that turns SELECT statements into tested, documented, version-controlled tables and views inside your warehouse (the T in ELT).",
    intuition: "The Recipe Book with a Head Chef: Each recipe (model) is a single SELECT that says which ingredients (other models) it uses via ref(). dbt reads every recipe, works out the cooking order automatically, cooks them in the warehouse kitchen, and tastes each dish (tests) before serving.",
    whenToUse: "ELT pipelines on Snowflake, BigQuery, Redshift, Databricks, DuckDB or Postgres where analysts and engineers want software practices (Git, code review, CI, tests, docs) for SQL transformations and dimensional models.",
    whenToAvoid: "Ingestion/extraction work (use Fivetran, Airbyte, CDC), heavy non-SQL processing like ML training or image processing, or sub-minute streaming transformations.",
    requirements: {
      scalingRequired: false,
      handlesMissing: true,
      outlierSensitive: false,
      needsWarehouse: true,
      sqlFirst: true
    },
    parameters: [
      {
        name: "materialized",
        type: "str",
        default: "'view'",
        impact: "How a model is persisted: view, table, incremental, ephemeral, or snapshot.",
        tuningTip: "Views for light staging, tables for marts, incremental for large append-heavy facts."
      },
      {
        name: "unique_key",
        type: "str",
        default: "None",
        impact: "Key used by incremental models to MERGE new rows instead of duplicating them.",
        tuningTip: "Always set it on incremental models fed by CDC or late-arriving data."
      },
      {
        name: "tests",
        type: "list",
        default: "[]",
        impact: "Assertions (unique, not_null, accepted_values, relationships) run by 'dbt test' or 'dbt build'.",
        tuningTip: "At minimum test primary keys for unique + not_null on every model."
      },
      {
        name: "--select",
        type: "str",
        default: "all models",
        impact: "Graph selector to run a subset of the DAG.",
        tuningTip: "In CI use 'state:modified+' to build only changed models and their children."
      }
    ],
    math: {
      formula: "DAG = { models as nodes, ref() calls as edges } → topological build order",
      loss: "Dependency resolution",
      explanation: "dbt parses every ref() and source() to build a DAG of models. It compiles Jinja into plain SQL, then executes models in topological order so each table is built only after its parents, and runs tests on each node."
    },
    pros: [
      "Transformations are plain SQL + Jinja, accessible to analysts",
      "Automatic dependency graph and lineage from ref()",
      "Built-in testing and auto-generated documentation site",
      "Incremental models and snapshots (SCD2) out of the box"
    ],
    cons: [
      "Only transforms data already in the warehouse; no extraction or loading",
      "Heavy Jinja macros can become hard to read and debug",
      "Warehouse compute costs can grow if models are rebuilt as full tables unnecessarily",
      "Not designed for real-time streaming workloads"
    ],
    codeSnippet: `-- models/marts/fct_orders.sql
{{ config(
    materialized='incremental',
    unique_key='order_id',
    on_schema_change='append_new_columns'
) }}

SELECT
    o.order_id,
    o.customer_id,
    c.customer_key,
    o.amount_usd,
    o.status,
    o.updated_at
FROM {{ ref('stg_orders') }} AS o
LEFT JOIN {{ ref('dim_customer') }} AS c
  ON o.customer_id = c.customer_id AND c.is_current

{% if is_incremental() %}
  -- only process rows newer than what is already in the table
  WHERE o.updated_at > (SELECT MAX(updated_at) FROM {{ this }})
{% endif %}

-- models/marts/schema.yml
-- version: 2
-- models:
--   - name: fct_orders
--     columns:
--       - name: order_id
--         tests: [unique, not_null]
--       - name: status
--         tests:
--           - accepted_values: {values: ['PENDING', 'PAID', 'REFUNDED']}
--       - name: customer_key
--         tests:
--           - relationships: {to: ref('dim_customer'), field: customer_key}

-- $ dbt build --select fct_orders+`,
    prerequisites: ["etl-vs-elt", "dimensional-modeling"],
    related: ["data-quality", "airflow", "warehouse-vs-lake"],
    diagram: `flowchart LR
  raw[("Raw tables loaded by EL tool")] --> src["source() definitions"]
  src --> stg["Staging models: rename, cast"]
  stg --> int["Intermediate models: joins"]
  int --> marts["Marts: facts & dimensions"]
  marts --> compile["dbt compiles Jinja → SQL"]
  compile --> order["Topological order from ref() graph"]
  order --> wh[("Warehouse executes SQL")]
  wh --> test{"dbt tests pass?"}
  test -->|"yes"| docs["Docs + lineage, BI consumes"]
  test -->|"no"| fail["Build fails, alert in CI"]`
  },

  {
    id: "data-quality",
    name: "Data Quality & Great Expectations",
    track: "data-eng",
    category: "Architecture & Data Management",
    task: ["Evaluation", "Preprocessing"],
    difficulty: "Intermediate",
    summary: "Systematically validates data against explicit expectations (completeness, uniqueness, validity, freshness, consistency) so bad data is caught before it reaches dashboards or models.",
    intuition: "The Airport Security Checkpoint: Every batch of data is a passenger. Before boarding (being published), it passes scanners: is the passport present (not null), is it the only one (unique), is the bag a legal size (range check), is the flight today (freshness)? Suspicious passengers are stopped and flagged, not allowed onto the plane.",
    whenToUse: "At pipeline boundaries: after ingestion, before publishing gold tables, and before training or serving ML models. Essential when many teams rely on shared data and silent errors are costly.",
    whenToAvoid: "One-off exploratory notebooks on static data. Avoid hundreds of noisy, low-value checks that people learn to ignore (alert fatigue).",
    requirements: {
      scalingRequired: false,
      handlesMissing: true,
      outlierSensitive: true,
      blocksPipelineOnFailure: "configurable",
      needsBaseline: "for distribution checks"
    },
    parameters: [
      {
        name: "expectation_suite",
        type: "concept",
        default: "None",
        impact: "Named collection of expectations for one dataset.",
        tuningTip: "Version suites in Git next to the pipeline code and review them like code."
      },
      {
        name: "mostly",
        type: "float",
        default: "1.0",
        impact: "Fraction of rows that must satisfy an expectation for it to pass.",
        tuningTip: "Use 0.99 for noisy real-world fields to tolerate rare glitches without disabling the check."
      },
      {
        name: "severity",
        type: "str",
        default: "'error'",
        impact: "Whether a failure blocks the pipeline (error) or only alerts (warn).",
        tuningTip: "Block on primary-key and schema violations; warn on distribution shifts."
      },
      {
        name: "freshness_threshold",
        type: "str",
        default: "'24h'",
        impact: "Maximum allowed age of the newest record.",
        tuningTip: "Set it slightly above the pipeline SLA so delays surface before stakeholders notice."
      }
    ],
    math: {
      formula: "Quality Score = (1/K) · Σₖ passₖ   where passₖ = 1 if (rows satisfying checkₖ / N) ≥ mostlyₖ",
      loss: "Expectation pass rate",
      explanation: "Each expectation computes the fraction of rows meeting a rule and compares it to its 'mostly' threshold. The suite result aggregates pass/fail across K checks; critical failures stop the pipeline (circuit breaker), others raise alerts and are logged to Data Docs."
    },
    pros: [
      "Catches schema breaks, nulls, duplicates and out-of-range values before they spread",
      "Expectations double as living documentation of what 'good data' means",
      "Protects ML models from training or predicting on corrupted inputs",
      "Integrates with Airflow, dbt, Spark and CI pipelines"
    ],
    cons: [
      "Requires domain knowledge to write meaningful expectations",
      "Checks add compute time on very large tables (use sampling or partition-level runs)",
      "Too many strict checks cause alert fatigue and pipeline flakiness",
      "Static rules miss subtle drift (combine with statistical drift monitoring)"
    ],
    codeSnippet: `import great_expectations as gx
import pandas as pd

df = pd.read_parquet("s3://lake/silver/orders/date=2026-10-03/")

context = gx.get_context()
batch = (context.data_sources.add_pandas("orders_src")
         .add_dataframe_asset("orders")
         .add_batch_definition_whole_dataframe("daily")
         .get_batch(batch_parameters={"dataframe": df}))

suite = context.suites.add(gx.ExpectationSuite(name="orders_suite"))

# Completeness & uniqueness
suite.add_expectation(gx.expectations.ExpectColumnValuesToNotBeNull(column="order_id"))
suite.add_expectation(gx.expectations.ExpectColumnValuesToBeUnique(column="order_id"))

# Validity
suite.add_expectation(gx.expectations.ExpectColumnValuesToBeBetween(
    column="amount", min_value=0, max_value=50_000, mostly=0.99))
suite.add_expectation(gx.expectations.ExpectColumnValuesToBeInSet(
    column="status", value_set=["PENDING", "PAID", "REFUNDED"]))

# Volume sanity check
suite.add_expectation(gx.expectations.ExpectTableRowCountToBeBetween(
    min_value=10_000, max_value=2_000_000))

result = batch.validate(suite)
if not result.success:
    failed = [r.expectation_config.type for r in result.results if not r.success]
    raise ValueError(f"Data quality gate failed: {failed}")  # stop the DAG`,
    prerequisites: ["what-is-de", "etl-vs-elt"],
    related: ["dbt", "model-data-drift", "airflow"],
    diagram: `flowchart TD
  ing["New batch lands (bronze)"] --> suite["Load expectation suite"]
  suite --> c1["Schema & types"]
  suite --> c2["Nulls & uniqueness"]
  suite --> c3["Ranges & allowed values"]
  suite --> c4["Row count & freshness"]
  c1 --> agg{"All critical checks pass?"}
  c2 --> agg
  c3 --> agg
  c4 --> agg
  agg -->|"yes"| pub["Publish to silver / gold"]
  agg -->|"no"| quar["Quarantine batch + alert"]
  pub --> use["Dashboards & ML models"]
  quar --> docs["Data Docs report for triage"]`
  },

  {
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
""").explain()   # look for PartitionFilters and skipped files`,
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
  join --> noshuf["No shuffle across cluster"]`
  }
];

// Adds graph links + diagrams to EXISTING concepts (keyed by existing id).
export const enrichments = {
  "parquet-format": {
    prerequisites: ["what-is-de"],
    related: ["data-partitioning", "warehouse-vs-lake", "lakehouse-architecture", "oltp-vs-olap"],
    diagram: `flowchart LR
  df["Table: rows × columns"] --> rg["Split into row groups (~128 MB)"]
  rg --> cc["Store each column as a column chunk"]
  cc --> enc["Dictionary + RLE encoding"]
  enc --> comp["Snappy / ZSTD compression"]
  comp --> foot["Footer: schema + min/max stats"]
  q["Query: SELECT revenue WHERE age ≥ 65"] --> foot
  foot --> skip{"Row group stats match?"}
  skip -->|"no"| sk["Skip row group"]
  skip -->|"yes"| proj["Read only revenue + age chunks"]`
  },

  "apache-kafka": {
    prerequisites: ["what-is-de", "batch-vs-stream"],
    related: ["cdc", "apache-spark", "feature-store", "lakehouse-architecture"],
    diagram: `flowchart LR
  subgraph topic["Topic: user-events"]
    t0[("Partition 0: append-only log")]
    t1[("Partition 1: append-only log")]
  end
  p1["Producer A"] -->|"key hash"| t0
  p2["Producer B"] -->|"key hash"| t1
  t0 -->|"replicated to followers"| rep["Broker replicas (RF=3)"]
  t0 --> c1["Consumer 1 (group: fraud)"]
  t1 --> c2["Consumer 2 (group: fraud)"]
  t0 --> c3["Consumer (group: analytics)"]
  t1 --> c3
  c1 --> off["Commit offsets"]
  c3 -.->|"rewind offset to replay"| t0`
  },

  "apache-spark": {
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
  e2 -.->|"node fails: recompute lost partition from lineage"| drv`
  },

  "lakehouse-architecture": {
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
  gold --> ml["Data science / ML"]`
  },

  "airflow": {
    prerequisites: ["etl-vs-elt", "batch-vs-stream"],
    related: ["dbt", "data-quality", "apache-spark", "ml-cicd"],
    diagram: `flowchart TD
  dag["DAG file in Python"] --> sched["Scheduler parses DAGs"]
  sched --> due{"Schedule interval reached?"}
  due -->|"yes"| run["Create DAG run"]
  run --> ready{"All upstream tasks SUCCESS?"}
  ready -->|"yes"| queue["Queue task to executor"]
  queue --> worker["Worker runs operator (Spark, SQL, Python)"]
  worker --> ok{"Task succeeded?"}
  ok -->|"yes"| next["Unlock downstream tasks"]
  ok -->|"no"| retry["Retry after delay, then alert"]
  next --> ready
  retry --> queue`
  }
};
