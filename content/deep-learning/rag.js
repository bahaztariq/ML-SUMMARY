export default {
  id: "rag",
  name: "Retrieval-Augmented Generation (RAG) & Vector Databases",
  track: "deep-learning",
  category: "Generative AI",
  task: ["NLP", "Storage", "Architecture", "Deployment"],
  difficulty: "Advanced",
  summary: "An architecture that retrieves relevant passages from your own documents with embedding search and inserts them into the LLM prompt so answers are grounded, current and citable.",
  intuition: "The Open-Book Exam: A plain LLM answers from memory and sometimes bluffs. RAG lets it run to the library first: a librarian (the retriever) finds the three most relevant pages, and the student (the LLM) writes the answer while quoting those pages.",
  whenToUse: "Chatbots over company documentation, policies or knowledge bases; questions about private or frequently changing data; any setting where answers must cite sources and hallucinations are costly.",
  whenToAvoid: "When the task needs a new skill or style rather than new facts (fine-tune instead), when the whole corpus fits comfortably in the context window, or for structured analytics that a SQL query answers exactly.",
  requirements: {
    scalingRequired: false,
    handlesMissing: true,
    outlierSensitive: false,
    vectorDatabase: true,
    embeddingModel: true
  },
  parameters: [
    {
      name: "chunk_size / chunk_overlap",
      type: "int",
      default: "500 – 1000 tokens, 10–20% overlap",
      impact: "How documents are split before embedding; drives retrieval precision.",
      tuningTip: "Split on headings/paragraphs, not mid-sentence. Smaller chunks = precise but less context."
    },
    {
      name: "top_k",
      type: "int",
      default: "3 – 10",
      impact: "Number of retrieved chunks inserted into the prompt.",
      tuningTip: "Retrieve ~20 candidates, then rerank with a cross-encoder and keep the best 3–5."
    },
    {
      name: "Embedding model",
      type: "str",
      default: "all-MiniLM-L6-v2 / bge / text-embedding models",
      impact: "Determines how well semantic similarity matches real relevance.",
      tuningTip: "Use the same model for indexing and querying; benchmark on your own question set."
    },
    {
      name: "Index type",
      type: "str",
      default: "HNSW (approximate NN)",
      impact: "Trades search speed vs recall in the vector database (FAISS, Chroma, pgvector, Qdrant).",
      tuningTip: "Combine vector search with BM25 keyword search (hybrid) for names, codes and IDs."
    }
  ],
  math: {
    formula: "score(q, dᵢ) = cos(E(q), E(dᵢ))  |  answer = LLM( prompt ⊕ top_k(dᵢ by score) )",
    loss: "Evaluated with retrieval recall@k, faithfulness and answer relevance",
    explanation: "Documents and the query are embedded into the same vector space by encoder E. An approximate nearest-neighbor index (HNSW, IVF) quickly finds the chunks with the highest cosine similarity. These chunks are concatenated into the prompt as context, so the LLM conditions its next-token predictions on retrieved evidence rather than only on its parameters."
  },
  pros: [
    "Grounds answers in your own up-to-date data and enables citations",
    "Updating knowledge only requires re-indexing documents, not retraining",
    "Significantly reduces hallucinations on factual questions",
    "Access control can be enforced at retrieval time"
  ],
  cons: [
    "Quality depends heavily on chunking, embeddings and retrieval tuning",
    "If retrieval misses the right passage, the LLM still answers poorly",
    "Adds latency and infrastructure (vector DB, ingestion pipelines)",
    "Vulnerable to prompt injection hidden inside retrieved documents"
  ],
  prerequisites: ["llms", "embeddings"],
  related: ["transformer-architecture", "knn", "model-serving", "transfer-learning"],
  diagram: `flowchart LR
  subgraph ingest["Offline indexing"]
    DOC[("Documents: PDFs, wiki, tickets")] --> CH["Split into chunks"]
    CH --> EM1["Embedding model"]
    EM1 --> VDB[("Vector DB / HNSW index")]
  end
  Q(["User question"]) --> EM2["Embed question"]
  EM2 --> S["Nearest-neighbor search top_k"]
  VDB --> S
  S --> RR["Rerank and filter"]
  RR --> P["Prompt = instructions + context + question"]
  P --> LLM["LLM"]
  LLM --> A(["Grounded answer with citations"])`,
  codeSnippet: `import chromadb
from sentence_transformers import SentenceTransformer

encoder = SentenceTransformer("all-MiniLM-L6-v2")
client = chromadb.Client()
collection = client.create_collection("handbook", metadata={"hnsw:space": "cosine"})

# 1) INGEST: chunk documents, embed, store in the vector DB
chunks = [
    "Employees get 25 days of paid vacation per year.",
    "Remote work is allowed up to 3 days per week.",
    "Expense reports must be submitted within 30 days.",
]
collection.add(
    ids=[f"chunk-{i}" for i in range(len(chunks))],
    documents=chunks,
    embeddings=encoder.encode(chunks, normalize_embeddings=True).tolist(),
)

# 2) RETRIEVE: embed the question and find the nearest chunks
question = "How many vacation days do I have?"
results = collection.query(
    query_embeddings=encoder.encode([question], normalize_embeddings=True).tolist(),
    n_results=2,
)
context = "\\n".join(results["documents"][0])

# 3) GENERATE: ground the LLM in the retrieved context
prompt = f"""Answer using ONLY the context below. If the answer is not there, say so.
Context:
{context}

Question: {question}"""
answer = llm.generate(prompt)   # any LLM client (OpenAI, Anthropic, local model)
print(answer)`
};
