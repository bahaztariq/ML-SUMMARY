export default {
  id: "model-serving",
  name: "Model Serving: Batch vs Online (FastAPI)",
  track: "mlops",
  category: "Deployment & Serving",
  task: ["Deployment", "Architecture"],
  difficulty: "Intermediate",
  summary: "Making a trained model's predictions available to consumers — either by scoring large datasets on a schedule (batch) or by answering individual requests in milliseconds through an API (online / real-time).",
  intuition: "Bakery vs Made-to-Order: A bakery bakes all the bread at 4 a.m. and it waits on shelves (batch: cheap, predictions ready but possibly stale). A made-to-order sandwich shop prepares each order when the customer arrives (online: fresh, personalized, but must be fast and always staffed).",
  whenToUse: "Batch: nightly churn scores, weekly demand forecasts, marketing segments — when predictions can be precomputed. Online: fraud checks at payment time, search ranking, recommendations — when the input only exists at request time.",
  whenToAvoid: "Avoid online serving when batch suffices (it adds latency SLOs, autoscaling and on-call burden). Avoid batch when inputs change by the second or the space of inputs is too large to precompute.",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: false,
    latencyBudget: "Batch: hours · Online: typically under 100 ms",
    trainingServingConsistency: true
  },
  parameters: [
    {
      name: "Serving Mode",
      type: "str",
      default: "batch",
      impact: "Batch writes predictions to a table; online exposes an HTTP/gRPC endpoint; streaming scores events from Kafka.",
      tuningTip: "Start with batch; move to online only when a product requirement demands fresh predictions."
    },
    {
      name: "workers / replicas",
      type: "int",
      default: "2",
      impact: "Number of server processes/pods handling requests in parallel.",
      tuningTip: "Autoscale on CPU or requests-per-second; load-test to find the p99 latency limit."
    },
    {
      name: "Request Batching",
      type: "bool",
      default: "False",
      impact: "Groups concurrent online requests into one model call to use vectorization/GPU efficiently.",
      tuningTip: "Essential for GPU-served deep learning models (Triton, TorchServe, BentoML)."
    },
    {
      name: "Input Schema Validation",
      type: "concept",
      default: "Pydantic model",
      impact: "Rejects malformed requests before they reach the model.",
      tuningTip: "Mirror the training feature schema exactly, including types and allowed ranges."
    }
  ],
  math: {
    formula: "Latency_p99 ≈ t_network + t_feature_lookup + t_inference;   Throughput ≈ replicas × batch_size / t_inference",
    loss: "Latency vs Throughput Trade-off",
    explanation: "Online serving is judged by tail latency (p99), which sums network, feature retrieval and model inference time. Throughput scales with replicas and batch size, but larger batches increase per-request latency."
  },
  pros: [
    "Batch: simple, cheap, easy to retry, uses big-data tools like Spark",
    "Online: fresh, context-aware predictions for interactive products",
    "A stable API decouples model updates from consuming applications"
  ],
  cons: [
    "Batch predictions go stale and waste compute on users who never show up",
    "Online serving needs high availability, autoscaling and latency monitoring",
    "Training-serving skew if online features are computed differently from training features"
  ],
  prerequisites: ["experiment-tracking", "docker-ml"],
  related: ["feature-store", "ab-testing-deployment", "model-data-drift", "batch-vs-stream"],
  diagram: `flowchart TD
    R[("Model registry")] --> Q{"Are inputs known in advance?"}
    Q -->|"yes"| B1["Batch job (Airflow / Spark)"]
    B1 --> B2[("Read all rows from warehouse")]
    B2 --> B3["Score in bulk"]
    B3 --> B4[("Write predictions table")]
    B4 --> B5["Apps read precomputed scores"]
    Q -->|"no, request-time"| O1["Client sends HTTP request"]
    O1 --> O2["API validates input schema"]
    O2 --> O3["Fetch online features"]
    O3 --> O4["Model inference in memory"]
    O4 --> O5["Return prediction in ms"]`,
  codeSnippet: `# ---- Online serving with FastAPI (serve.py) ----
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Churn model API")
pipeline = joblib.load("churn_pipeline.joblib")   # loaded ONCE at startup

class Customer(BaseModel):
    age: int = Field(ge=18, le=100)
    monthly_spend: float = Field(ge=0)
    plan: str
    country: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(customer: Customer):
    X = pd.DataFrame([customer.model_dump()])
    proba = float(pipeline.predict_proba(X)[0, 1])
    return {"churn_probability": round(proba, 4), "model_version": "v3"}

# Run: uvicorn serve:app --host 0.0.0.0 --port 8000 --workers 4

# ---- Batch scoring (nightly job) ----
def score_batch(input_path: str, output_path: str):
    df = pd.read_parquet(input_path)
    df["churn_probability"] = pipeline.predict_proba(df)[:, 1]
    df[["customer_id", "churn_probability"]].to_parquet(output_path)`
};
