export default {
  id: "what-is-de",
  name: "What is Data Engineering (DE)?",
  track: "fundamentals",
  category: "Foundations & Overview",
  task: ["Definition", "Data Engineering", "Architecture"],
  difficulty: "Beginner",
  summary: "The engineering discipline responsible for designing, building, orchestrating, and maintaining the scalable data pipelines, storage systems, and platforms that deliver clean, timely, and reliable data to analysts, data scientists, and ML models.",
  intuition: "The Plumbing and Water Filtration of AI: Data Scientists and ML models are like chefs preparing fine meals. If the kitchen pipes leak, the water is contaminated with mud, or water only flows once a week, no chef can cook. Data Engineers build the water purification plant and high-pressure pipes.",
  whenToUse: "Whenever data exists across disparate systems (databases, APIs, logs) and must be reliably ingested, cleaned, deduplicated, formatted, and made queryable for downstream consumers.",
  whenToAvoid: "When you have a simple static CSV file that easily fits on your laptop and never updates (ad-hoc spreadsheet analysis).",
  requirements: {
    dataInfrastructure: true,
    pipelineOrchestration: true,
    dataQualityEnforcement: true,
    schemaGovernance: true
  },
  parameters: [
    {
      name: "Data Ingestion",
      type: "phase",
      default: "Batch or Streaming",
      impact: "Extracting raw data from operational systems (databases, webhooks, IoT sensors).",
      tuningTip: "Batch for daily reports (Airflow); Streaming for sub-second alerts (Kafka)."
    },
    {
      name: "Data Storage",
      type: "architecture",
      default: "Lakehouse",
      impact: "Organizing data into Raw (Bronze), Cleaned (Silver), and Aggregated (Gold) tiers.",
      tuningTip: "Use columnar Parquet on object storage (S3/GCS) with Delta/Iceberg metadata."
    },
    {
      name: "Data Transformation",
      type: "phase",
      default: "SQL / dbt / Spark",
      impact: "Cleaning nulls, casting types, calculating joins, and producing business metrics.",
      tuningTip: "Prefer ELT over ETL on modern cloud data warehouses."
    }
  ],
  math: {
    formula: "Data Pipeline = Extraction -> Validation -> Transformation -> Loading -> Monitoring",
    loss: "Data Lineage & SLA (Service Level Agreement) Adherence",
    explanation: "Data Engineering focuses on throughput (gigabytes/sec), latency (time-to-insight), data quality (zero corrupted rows), and pipeline idempotency (running twice produces identical results)."
  },
  pros: [
    "Provides the essential, battle-tested foundation for all analytics and ML systems",
    "Prevents catastrophic model failures caused by silent schema changes and dirty data",
    "Scales corporate data access securely across thousands of simultaneous queries"
  ],
  cons: [
    "High infrastructure complexity (Kafka, Spark, Airflow, Kubernetes, cloud billing)",
    "Frequent unexpected schema breaks from upstream third-party APIs"
  ],
  prerequisites: [],
  related: ["etl-vs-elt", "what-is-ml", "airflow", "warehouse-vs-lake"],
  diagram: `flowchart LR
    A[("App databases (OLTP)")] --> D["Ingestion: batch or CDC"]
    B["Event streams / Kafka"] --> D
    C["3rd-party APIs & files"] --> D
    D --> E[("Raw zone: data lake")]
    E --> F["Transform: clean, join, aggregate (Spark / dbt)"]
    F --> G[("Curated warehouse / lakehouse")]
    G --> H["BI dashboards"]
    G --> I["ML feature pipelines"]
    O["Orchestrator (Airflow)"] -.-> D
    O -.-> F`,
  codeSnippet: `# Minimal End-to-End Data Pipeline Blueprint
import pandas as pd
import sqlite3

def run_data_pipeline():
    # 1. EXTRACT: Ingest raw dirty transactions
    raw_data = pd.DataFrame({
        'user_id': [101, 102, 103, None],
        'amount': ["$150.00", "$45.50", "$99.99", "$12.00"]
    })
    
    # 2. TRANSFORM: Clean, validate, and type-cast
    clean_data = raw_data.dropna(subset=['user_id']).copy()
    clean_data['user_id'] = clean_data['user_id'].astype(int)
    clean_data['amount'] = clean_data['amount'].str.replace('$', '').astype(float)
    
    # 3. LOAD: Persist into analytical storage
    conn = sqlite3.connect(':memory:')
    clean_data.to_sql('fact_orders', conn, index=False)
    print("✅ Pipeline succeeded: Clean data loaded into analytical table!")

run_data_pipeline()`
};
