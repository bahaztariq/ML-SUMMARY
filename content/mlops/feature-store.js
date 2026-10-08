export default {
  id: "feature-store",
  name: "Feature Store",
  track: "mlops",
  category: "Architecture & Data Management",
  task: ["Storage", "Preprocessing", "Deployment"],
  difficulty: "Advanced",
  summary: "A central system that defines, computes, stores and serves ML features consistently for both training (offline, historical, point-in-time correct) and inference (online, low-latency), eliminating training-serving skew and duplicated feature code.",
  intuition: "The Central Kitchen Pantry: Instead of every chef preparing their own sauces slightly differently, a central pantry prepares each sauce once from a single recipe, keeps a dated archive for recipe testing (offline store), and a ready-to-use jar at every station for service (online store).",
  whenToUse: "Multiple models reuse the same features, real-time models need fresh aggregates (e.g. 'transactions in the last 10 minutes'), training-serving skew has caused bugs, or point-in-time correct training sets are hard to build.",
  whenToAvoid: "A single batch model with features computed in one SQL query; a feature store adds significant infrastructure for little benefit there.",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: false,
    pointInTimeCorrectness: true,
    onlineStore: "Low-latency KV store (Redis, DynamoDB)"
  },
  parameters: [
    {
      name: "Entity",
      type: "concept",
      default: "customer_id",
      impact: "The key features are attached to and looked up by.",
      tuningTip: "Choose entities matching prediction requests (user, item, merchant)."
    },
    {
      name: "Feature View TTL",
      type: "duration",
      default: "1 day",
      impact: "How long a feature value stays valid for lookups; stale values beyond TTL are treated as missing.",
      tuningTip: "Match TTL to how quickly the underlying signal changes."
    },
    {
      name: "Offline / Online Store",
      type: "architecture",
      default: "Parquet/warehouse + Redis",
      impact: "Offline store holds full history for training; online store holds latest values for millisecond serving.",
      tuningTip: "Materialize to the online store on a schedule or via streaming for fresh features."
    },
    {
      name: "Point-in-time Join",
      type: "concept",
      default: "Enabled",
      impact: "Joins each training label only with feature values known BEFORE the label's timestamp.",
      tuningTip: "Never build training sets with a plain latest-value join — it leaks future information."
    }
  ],
  math: {
    formula: "x_train(e, t) = f(e, t′) where t′ = max{ t_f ≤ t }   (no future values)",
    loss: "Point-in-Time Correct Join",
    explanation: "For each entity e and label timestamp t, the store retrieves the latest feature value computed at or before t. This reproduces exactly what the model would have seen at prediction time, preventing temporal leakage."
  },
  pros: [
    "Eliminates training-serving skew: one definition used offline and online",
    "Feature reuse across teams and models; discoverable feature catalog",
    "Point-in-time joins prevent subtle leakage in training sets"
  ],
  cons: [
    "Heavy infrastructure (offline store, online store, materialization jobs)",
    "Learning curve and operational cost; overkill for simple batch use cases",
    "Streaming features add complexity in freshness and backfills"
  ],
  prerequisites: ["what-is-feature-engineering", "ml-lifecycle"],
  related: ["model-serving", "train-test-split", "lakehouse-architecture", "batch-vs-stream"],
  diagram: `flowchart LR
    S1[("Batch sources: warehouse / lake")] --> T["Feature definitions (one codebase)"]
    S2[("Streaming events: Kafka")] --> T
    T --> OFF[("Offline store: full history")]
    T --> ON[("Online store: latest values")]
    OFF --> PIT["Point-in-time join with labels"]
    PIT --> TR["Training dataset"]
    TR --> M["Train model"]
    ON --> API["Serving API lookup by entity id"]
    M --> API
    API --> P["Prediction with identical features"]`,
  codeSnippet: `# Feast feature store: define once, use for training AND serving
from datetime import timedelta
import pandas as pd
from feast import Entity, FeatureView, Field, FileSource, FeatureStore
from feast.types import Float32, Int64

# ---- feature_repo/definitions.py ----
customer = Entity(name="customer", join_keys=["customer_id"])

stats_source = FileSource(
    path="data/customer_stats.parquet",
    timestamp_field="event_timestamp",
)

customer_stats = FeatureView(
    name="customer_stats",
    entities=[customer],
    ttl=timedelta(days=1),
    schema=[Field(name="orders_30d", dtype=Int64),
            Field(name="avg_basket_30d", dtype=Float32)],
    source=stats_source,
)

# ---- Training: point-in-time correct historical features ----
store = FeatureStore(repo_path="feature_repo")
labels = pd.read_parquet("data/churn_labels.parquet")  # customer_id, event_timestamp, churned
train_df = store.get_historical_features(
    entity_df=labels,
    features=["customer_stats:orders_30d", "customer_stats:avg_basket_30d"],
).to_df()

# ---- Serving: latest values from the online store in milliseconds ----
# (after: feast materialize-incremental <now>)
online = store.get_online_features(
    features=["customer_stats:orders_30d", "customer_stats:avg_basket_30d"],
    entity_rows=[{"customer_id": 1042}],
).to_dict()
print(online)`
};
