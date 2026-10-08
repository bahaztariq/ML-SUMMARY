export default {
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
  lake -.->|"add ACID log"| lh["Lakehouse"]`,
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
ORDER BY views DESC;`
};
