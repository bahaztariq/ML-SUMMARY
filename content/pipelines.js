/**
 * End-to-end flow diagrams for the Map › Pipelines view.
 * `source` is Mermaid; `links` maps Mermaid node ids to the concept each step explains.
 */

/** @type {{ id: string, icon: string, title: string, description: string, links: Record<string, string>, source: string }[]} */
export const pipelines = [
  {
    id: 'ml-lifecycle',
    icon: '🔁',
    title: 'The ML lifecycle',
    description: 'From a business question to a monitored model in production, and back again when the data drifts.',
    links: { P: 'ml-workflow', D: 'what-is-de', Q: 'data-quality', F: 'what-is-feature-engineering', S: 'train-test-split', T: 'hyperparameter-tuning', E: 'precision-recall-f1', X: 'experiment-tracking', R: 'experiment-tracking', C: 'ml-cicd', Dp: 'model-serving', AB: 'ab-testing-deployment', M: 'model-data-drift', RT: 'ml-cicd' },
    source: `flowchart TB
  subgraph data["1 · Data"]
    direction LR
    P(["Business problem"]) --> D["Collect & ingest data"]
    D --> Q["Validate data quality"]
    Q --> F["Feature engineering"]
  end
  subgraph model["2 · Modeling"]
    direction LR
    S["Train / validation / test split"] --> T["Train & tune models"]
    T --> E["Evaluate on held-out data"]
    E --> R["Register best model"]
    T -.-> X["Log runs: experiment tracking"]
  end
  subgraph prod["3 · Production"]
    direction LR
    C["CI/CD pipeline"] --> Dp["Deploy & serve"]
    Dp --> AB["A/B or canary rollout"]
    AB --> M["Monitor drift & performance"]
    M -.->|"drift detected"| RT(["Retrain: back to 2 · Modeling"])
  end
  data --> model
  model --> prod`
  },
  {
    id: 'data-platform',
    icon: '🏗️',
    title: 'Modern data platform',
    description: 'How raw events and database changes become clean tables for dashboards and features for models.',
    links: { OLTP: 'oltp-vs-olap', K: 'apache-kafka', CD: 'cdc', SS: 'batch-vs-stream', RAW: 'parquet-format', SIL: 'lakehouse-architecture', GOLD: 'dimensional-modeling', SP: 'apache-spark', DBT: 'dbt', DQ: 'data-quality', BI: 'warehouse-vs-lake', FS: 'feature-store', ML: 'model-serving', AF: 'airflow', PT: 'data-partitioning' },
    source: `flowchart TB
  subgraph src["Sources"]
    direction LR
    OLTP[("App database: OLTP")]
    EV["Clickstream events"]
    FILES["Files & APIs"]
  end
  OLTP --> CD["Change Data Capture"]
  CD --> K["Kafka topics"]
  EV --> K
  K --> SS["Stream processing"]
  subgraph lh["Lakehouse"]
    direction LR
    RAW["Bronze: raw Parquet"] --> SIL["Silver: cleaned & conformed"]
    SIL --> GOLD["Gold: star schema"]
  end
  FILES -->|"batch ingest"| RAW
  SS --> RAW
  PT["Partitioning & file layout"] -.-> RAW
  SP["Spark jobs"] -.-> SIL
  DQ["Data quality checks"] -.-> SIL
  DBT["dbt models"] -.-> GOLD
  AF["Airflow orchestration"] -.-> SP
  AF -.-> DBT
  GOLD --> BI["BI dashboards: OLAP"]
  GOLD --> FS["Feature store"]
  FS --> ML["Model training & serving"]`
  },
  {
    id: 'preprocessing',
    icon: '🧹',
    title: 'Preprocessing without leakage',
    description: 'Split first, then fit every transformer on the training set only. The order is what prevents data leakage.',
    links: { RAW: 'what-is-feature-engineering', SPLIT: 'train-test-split', IMP: 'simple-imputer', ENC: 'encoding-categorical', SCL: 'feature-scaling', SEL: 'feature-selection', BAL: 'class-imbalance', MOD: 'cross-validation', TEST: 'precision-recall-f1' },
    source: `flowchart TB
  RAW["Raw table"] --> SPLIT{"Split first"}
  SPLIT -->|"train"| IMP["Impute missing values"]
  IMP --> ENC["Encode categoricals"]
  ENC --> SCL["Scale numeric features"]
  SCL --> SEL["Select features"]
  SEL --> BAL["Rebalance classes: train only"]
  BAL --> MOD["Fit model with cross-validation"]
  SPLIT -->|"test: locked away"| TEST["Final evaluation"]
  MOD -->|"apply fitted transforms"| TEST`
  },
  {
    id: 'training-loop',
    icon: '🧠',
    title: 'Neural network training loop',
    description: 'What happens on every mini-batch while a deep network learns, and when to stop.',
    links: { X: 'what-is-gradient-descent', FW: 'mlp-neural-network', A: 'activation-functions', L: 'loss-vs-cost-function', BP: 'mlp-neural-network', O: 'dl-optimizers', R: 'dl-regularization', V: 'overfitting-underfitting' },
    source: `flowchart TB
  X["Mini-batch of inputs"] --> FW["Forward pass: weighted sums"]
  FW --> A["Activation functions"]
  A --> L["Compute loss vs labels"]
  L --> BP["Backpropagation: gradients"]
  BP --> O["Optimizer step: SGD / Adam"]
  R["Dropout, BatchNorm, weight decay"] -.-> FW
  O -->|"next batch"| X
  O --> V{"Val loss still falling?"}
  V -->|"no: early stop"| STOP(["Keep best checkpoint"])`
  }
];
