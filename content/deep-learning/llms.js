export default {
  id: "llms",
  name: "Large Language Models (LLMs)",
  track: "deep-learning",
  category: "Generative AI",
  task: ["NLP", "Architecture"],
  difficulty: "Advanced",
  summary: "Very large decoder-only Transformers pretrained to predict the next token on trillions of words, then aligned to follow instructions, which makes them general-purpose text reasoning and generation engines.",
  intuition: "The Ultimate Autocomplete: Your phone keyboard suggests the next word from a few sentences of context. An LLM is that autocomplete scaled up to billions of parameters and most of the public internet, so 'predicting the next word' starts to require grammar, facts, reasoning and style all at once.",
  whenToUse: "Text generation, summarization, question answering, classification and extraction with few or zero labeled examples (prompting), code generation, chat assistants, and agents that call tools.",
  whenToAvoid: "Strict deterministic logic or exact arithmetic, high-volume low-latency tasks a small classifier solves cheaply, questions needing up-to-date or private facts without retrieval (use RAG), and high-stakes decisions without human review.",
  requirements: {
    scalingRequired: false,
    handlesMissing: true,
    outlierSensitive: false,
    gpuAcceleration: true,
    contextWindowLimited: true
  },
  parameters: [
    {
      name: "temperature",
      type: "float",
      default: "0.7 – 1.0",
      impact: "Scales logits before sampling; low = focused and repeatable, high = creative and random.",
      tuningTip: "Use 0–0.2 for extraction, classification and code; 0.7–1.0 for brainstorming and creative writing."
    },
    {
      name: "top_p (nucleus sampling)",
      type: "float",
      default: "0.9 – 1.0",
      impact: "Samples only from the smallest set of tokens whose probabilities add up to p.",
      tuningTip: "Tune either temperature or top_p, not both aggressively at the same time."
    },
    {
      name: "max_tokens / context window",
      type: "int",
      default: "Model dependent (8k – 1M tokens)",
      impact: "Limits how much text the model can read (prompt) and write (completion).",
      tuningTip: "Cost and latency grow with tokens; trim prompts and retrieve only relevant chunks."
    },
    {
      name: "Adaptation strategy",
      type: "concept",
      default: "Prompting",
      impact: "Prompt engineering → few-shot examples → RAG → fine-tuning (LoRA) → full pretraining.",
      tuningTip: "Climb this ladder only as needed: most problems are solved with good prompts plus RAG."
    }
  ],
  math: {
    formula: "P(x₁ … x_T) = Πₜ P(xₜ | x₁ … xₜ₋₁)  |  L = −Σₜ log P_θ(xₜ | x₁ … xₜ₋₁)",
    loss: "Next-token Cross-Entropy (then instruction tuning + RLHF / preference optimization)",
    explanation: "The model factorizes text into a chain of next-token predictions; a causal attention mask ensures each position only sees earlier tokens. Pretraining minimizes cross-entropy over trillions of tokens. Instruction tuning and preference optimization (RLHF / DPO) then shape the raw predictor into a helpful, harmless assistant. At inference, tokens are sampled one at a time and appended to the context."
  },
  pros: [
    "One model handles many tasks with zero or few labeled examples",
    "Strong language understanding, generation and coding abilities",
    "Easily customized via prompting, RAG or parameter-efficient fine-tuning",
    "Available through APIs without any training infrastructure"
  ],
  cons: [
    "Hallucinations: confident but false statements",
    "Expensive inference and high latency for large models",
    "Knowledge frozen at the training cutoff; limited context window",
    "Privacy, prompt-injection and bias risks need guardrails and evaluation"
  ],
  prerequisites: ["transformer-architecture", "embeddings"],
  related: ["rag", "transfer-learning", "generative-models"],
  diagram: `flowchart TD
  W[("Trillions of web / code tokens")] --> PT["Pretraining: next-token prediction"]
  PT --> BASE["Base model (autocomplete)"]
  BASE --> SFT["Instruction tuning on prompt-answer pairs"]
  SFT --> RL["Preference alignment (RLHF / DPO)"]
  RL --> CHAT["Assistant model"]
  U["User prompt"] --> TOK["Tokenize → embeddings"]
  TOK --> CHAT
  CHAT --> DEC["Transformer decoder → next-token probabilities"]
  DEC --> SAMP["Sample with temperature / top_p"]
  SAMP -->|"append token, repeat"| DEC
  SAMP --> ANS(["Generated answer"])`,
  codeSnippet: `from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

model_id = "Qwen/Qwen2.5-0.5B-Instruct"       # small open model for local testing
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.float16, device_map="auto")

messages = [
    {"role": "system", "content": "You are a concise data science tutor."},
    {"role": "user", "content": "Explain overfitting in two sentences."},
]

# Chat template converts messages into the exact token format the model was tuned on
inputs = tokenizer.apply_chat_template(
    messages, add_generation_prompt=True, return_tensors="pt"
).to(model.device)

# Autoregressive generation: predict a token, append it, repeat
output_ids = model.generate(
    inputs,
    max_new_tokens=120,
    do_sample=True,
    temperature=0.3,      # low temperature = focused answer
    top_p=0.9,
)
answer = tokenizer.decode(output_ids[0][inputs.shape[1]:], skip_special_tokens=True)
print(answer)`
};
