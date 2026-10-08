export default {
  id: "docker-ml",
  name: "Docker & Containers for ML",
  track: "mlops",
  category: "Deployment & Serving",
  task: ["Deployment", "Architecture"],
  difficulty: "Beginner",
  summary: "Packaging a model, its code, Python dependencies and system libraries into a portable, immutable container image that runs identically on a laptop, CI server, or Kubernetes cluster.",
  intuition: "The Shipping Container: Before standard shipping containers, every cargo needed custom handling at each port. A container has a fixed shape, so any ship, crane or truck can move it without knowing what is inside. A Docker image does the same for software — 'it works on my machine' becomes 'it works on every machine'.",
  whenToUse: "Deploying model APIs or batch jobs, running training on cloud/Kubernetes, guaranteeing identical environments across team members and CI, and pinning CUDA/library versions for GPU workloads.",
  whenToAvoid: "Pure exploratory notebooks on your own machine, or fully managed serverless platforms that package code for you (though many still use containers underneath).",
  requirements: {
    scalingRequired: false,
    handlesMissing: false,
    outlierSensitive: false,
    pinnedDependencies: true,
    gpuSupport: "Requires NVIDIA Container Toolkit + CUDA base image"
  },
  parameters: [
    {
      name: "Base Image",
      type: "str",
      default: "python:3.11-slim",
      impact: "Determines OS, Python version and image size; GPU work needs an nvidia/cuda or pytorch base.",
      tuningTip: "Prefer slim images; avoid 'latest' tags — pin exact versions for reproducibility."
    },
    {
      name: "Layer Ordering",
      type: "concept",
      default: "deps before code",
      impact: "Docker caches layers; copying requirements.txt before source code avoids reinstalling packages on every code change.",
      tuningTip: "Put rarely-changing steps first, frequently-changing ones last."
    },
    {
      name: "Multi-stage Build",
      type: "bool",
      default: "False",
      impact: "Builds/compiles in one stage and copies only the results into a small runtime image.",
      tuningTip: "Can shrink images from several GB to a few hundred MB."
    },
    {
      name: "Model Artifact Location",
      type: "str",
      default: "Baked into image",
      impact: "Baking gives immutability; downloading from a registry at startup gives smaller images and faster model swaps.",
      tuningTip: "Bake small models; fetch large ones (multi-GB LLMs) from object storage at startup."
    }
  ],
  math: {
    formula: "Image = Base OS ⊕ System libs ⊕ Python deps ⊕ Code ⊕ Model;   Container = running instance of Image",
    loss: "Layered, Immutable Packaging",
    explanation: "An image is a stack of read-only, content-hashed layers; identical layers are cached and shared. Each container started from the same image has an identical environment, eliminating dependency drift between development and production."
  },
  pros: [
    "Reproducible environments across laptops, CI and production",
    "Isolates conflicting dependency versions between projects",
    "Standard unit for orchestration with Kubernetes, ECS, Cloud Run, etc."
  ],
  cons: [
    "ML images (CUDA, PyTorch) can be very large and slow to build/pull",
    "GPU access requires extra host drivers and runtime configuration",
    "Adds a learning curve (networking, volumes, image registries, security scanning)"
  ],
  prerequisites: ["ml-lifecycle"],
  related: ["model-serving", "ml-cicd", "airflow"],
  diagram: `flowchart LR
    A["requirements.txt"] --> D["Dockerfile"]
    B["serve.py code"] --> D
    C["model.joblib"] --> D
    D --> E["docker build"]
    E --> F["Layered image (cached layers)"]
    F --> G[("Image registry")]
    G --> H["Laptop container"]
    G --> I["CI test container"]
    G --> J["Kubernetes pods (replicas)"]
    J --> K["Same environment everywhere"]`,
  codeSnippet: `# Dockerfile — serve a scikit-learn model with FastAPI
# ---------- build stage ----------
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
# Install dependencies into a separate prefix (cached unless requirements change)
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---------- runtime stage ----------
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /install /usr/local

# Copy code and the trained pipeline last (changes most often)
COPY serve.py .
COPY churn_pipeline.joblib .

# Run as non-root for security
RUN useradd --create-home appuser
USER appuser

EXPOSE 8000
HEALTHCHECK CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"
CMD ["uvicorn", "serve:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

# Build & run:
#   docker build -t churn-api:1.0.0 .
#   docker run -p 8000:8000 churn-api:1.0.0
#   curl -X POST localhost:8000/predict -H "Content-Type: application/json" \\
#        -d '{"age": 42, "monthly_spend": 79.9, "plan": "pro", "country": "MA"}'`
};
