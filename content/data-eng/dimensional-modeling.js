export default {
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
  star --> bi["BI metrics & ML features"]`,
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
GROUP BY c.city, p.category;`
};
