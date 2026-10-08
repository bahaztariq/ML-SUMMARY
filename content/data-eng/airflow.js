export default {
  id: "airflow",
  name: "Apache Airflow (DAGs)",
  track: "data-eng",
  category: "Orchestration & Workflow",
  task: ["Orchestration", "Scheduling", "ETL Pipelines"],
  difficulty: "Intermediate",
  summary: "A programmatic platform to author, schedule, and monitor workflows as Directed Acyclic Graphs (DAGs) in pure Python.",
  intuition: "The Master Conductor: Ensures Task B (cleaning data) only runs after Task A (downloading data) succeeds. If Task A fails, it retries, sends an alert, and pauses the pipeline.",
  whenToUse: "Orchestrating complex enterprise batch pipelines, scheduled model retraining jobs, database syncs, and multi-system dependencies.",
  whenToAvoid: "Streaming or sub-second event-driven triggers (Airflow is designed for scheduled batch orchestration, not real-time event routing).",
  requirements: {
    pythonCodeAsConfiguration: true,
    dependencyTracking: true,
    backfillingSupport: true,
    retryLogic: true
  },
  parameters: [
    {
      name: "schedule_interval",
      type: "cron or timedelta",
      default: "'@daily'",
      impact: "Defines when and how often the pipeline executes.",
      tuningTip: "Use standard 5-part cron syntax for precise scheduling."
    },
    {
      name: "retries",
      type: "int",
      default: "0",
      impact: "Number of automated retries before marking task failed.",
      tuningTip: "Set to 2 or 3 with `retry_delay=timedelta(minutes=5)` to withstand transient network spikes."
    }
  ],
  math: {
    formula: "DAG = G(V, E) where Vertices = Tasks, Edges = Dependencies (No cycles allowed)",
    loss: "Topological Sort Execution",
    explanation: "Airflow computes the topological order of tasks. A task only shifts from SCHEDULED to QUEUED once all upstream parent vertices finish in the SUCCESS state."
  },
  pros: [
    "Workflows defined as standard Python code (version controlled with Git, modular, testable)",
    "Extensive ecosystem of pre-built operators (Snowflake, AWS, GCP, Slack, Spark)",
    "Robust web UI for inspecting task logs, Gantt charts, and backfilling history"
  ],
  cons: [
    "Scheduler overhead makes running sub-minute micro-tasks inefficient",
    "Airflow is an orchestrator, NOT an execution engine (heavy data should be computed in Spark/Snowflake, not Airflow workers)"
  ],
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
  retry --> queue`,
  codeSnippet: `from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data_team',
    'retries': 2,
    'retry_delay': timedelta(minutes=5)
}

with DAG(
    dag_id='ml_feature_pipeline',
    default_args=default_args,
    start_date=datetime(2026, 1, 1),
    schedule='@daily',
    catchup=False
) as dag:
    
    extract_task = PythonOperator(task_id='extract_raw_data', python_callable=extract_fn)
    transform_task = PythonOperator(task_id='transform_features', python_callable=transform_fn)
    train_task = PythonOperator(task_id='retrain_model', python_callable=train_fn)

    # Clean dependency syntax
    extract_task >> transform_task >> train_task`
};
