export default {
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
  prerequisites: ["what-is-de"],
  related: ["warehouse-vs-lake", "dimensional-modeling", "parquet-format", "cdc"],
  diagram: `flowchart LR
  app["Web / mobile app"] -->|"single-row INSERT / UPDATE"| oltp[("OLTP DB: row store, 3NF")]
  oltp -->|"ms point lookups"| app
  oltp -->|"batch ETL or CDC"| pipe["Pipeline"]
  pipe --> olap[("OLAP warehouse: column store")]
  olap --> scan["Scan only needed columns"]
  scan --> agg["Vectorized GROUP BY / SUM"]
  agg --> dash["Dashboards & ML features"]`,
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
ORDER BY month, revenue DESC;`
};
