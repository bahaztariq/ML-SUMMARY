export default {
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
  quar --> docs["Data Docs report for triage"]`,
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
    raise ValueError(f"Data quality gate failed: {failed}")  # stop the DAG`
};
