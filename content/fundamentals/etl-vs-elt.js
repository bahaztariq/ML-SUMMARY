export default {
  id: "etl-vs-elt",
  name: "ETL vs ELT in Data Engineering",
  track: "fundamentals",
  category: "Data Pipelines",
  task: ["Definition", "Data Engineering", "Architecture"],
  difficulty: "Beginner",
  summary: "The two foundational paradigms for data integration pipelines, differing in whether raw data is transformed before or after being loaded into the target analytical data storage.",
  intuition: "Pre-cooked TV Dinners vs Open-Kitchen Buffet: In ETL, ingredients are chopped and cooked before entering the freezer (inflexible if you change your mind). In ELT, all raw ingredients are delivered straight into a state-of-the-art kitchen where chefs can cook whatever dish is requested on demand.",
  whenToUse: "ELT is the modern standard for cloud data warehouses (Snowflake, BigQuery, Databricks). ETL is used for legacy on-premise hardware or strict data privacy regulations where PII must be scrubbed before hitting storage.",
  whenToAvoid: "Do not use legacy ETL if you have modern cloud data warehouses with massive elastic SQL compute.",
  requirements: {
    dataMovementPattern: true,
    determinesStorageStrategy: true
  },
  parameters: [
    {
      name: "ETL (Extract -> Transform -> Load)",
      type: "paradigm",
      default: "Legacy / On-Prem",
      impact: "Data transformed on a separate compute server before arriving in the warehouse.",
      tuningTip: "Use when source data contains raw passwords/PII that cannot legally be stored."
    },
    {
      name: "ELT (Extract -> Load -> Transform)",
      type: "paradigm",
      default: "Modern Standard",
      impact: "Raw data loaded directly into storage; transformed inside the warehouse via SQL/dbt.",
      tuningTip: "Retains full historical raw data so transformations can be rewritten retroactively."
    }
  ],
  math: {
    formula: "ETL: Source -> ETL Server (Compute) -> Target  |  ELT: Source -> Target Storage -> SQL Engine (dbt)",
    loss: "Separation of Storage and Compute",
    explanation: "Cloud warehouses decouple cheap infinite object storage from on-demand compute clusters, making ELT faster, cheaper, and vastly more flexible than bottlenecked ETL servers."
  },
  pros: [
    "ELT never throws away raw data: you can re-transform past years of history at any time",
    "ELT leverages the massive distributed SQL processing power of modern cloud warehouses",
    "ETL protects privacy by never storing unmasked sensitive PII in analytical targets"
  ],
  cons: [
    "ELT stores larger volumes of raw data, increasing storage footprint slightly",
    "ETL pipeline changes require modifying and redeploying entire pipeline codebases"
  ],
  prerequisites: ["what-is-de"],
  related: ["dbt", "lakehouse-architecture", "warehouse-vs-lake", "airflow"],
  diagram: `flowchart TD
    S[("Source systems")] --> Q{"Where is the transform compute?"}
    Q -->|"ETL"| E1["Extract"]
    E1 --> T1["Transform on separate engine (Spark / Python)"]
    T1 --> L1[("Load clean data into warehouse")]
    Q -->|"ELT"| E2["Extract"]
    E2 --> L2[("Load raw data into cloud warehouse / lake")]
    L2 --> T2["Transform in-warehouse with SQL (dbt)"]
    T2 --> M[("Analytics-ready models")]
    L1 --> BI["BI & ML consumers"]
    M --> BI`,
  codeSnippet: `# Modern ELT Workflow Pattern with dbt & SQL
# Step 1: Extract & Load (e.g. Fivetran / Airbyte loads raw JSON into Snowflake)
# Step 2: Transform (Executed directly inside warehouse via SQL model):

"""
-- models/marts/fct_daily_revenue.sql
WITH raw_orders AS (
    SELECT * FROM {{ source('raw_store', 'orders') }}
)
SELECT 
    DATE_TRUNC('day', order_date) AS order_day,
    COUNT(DISTINCT order_id)     AS total_orders,
    SUM(amount)                  AS daily_gross_revenue
FROM raw_orders
WHERE status = 'COMPLETED'
GROUP BY 1
"""`
};
