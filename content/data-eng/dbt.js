export default {
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
  test -->|"no"| fail["Build fails, alert in CI"]`,
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

-- $ dbt build --select fct_orders+`
};
