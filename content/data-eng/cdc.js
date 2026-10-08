export default {
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
  topic --> svc["Other consumers: cache, search, features"]`,
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
#   WHEN MATCHED THEN UPDATE ...  WHEN NOT MATCHED THEN INSERT ...`
};
