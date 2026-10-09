export default {
  name: "Transformer et auto-attention",
  category: "Architectures neuronales",
  task: ["TAL", "Vision par ordinateur", "LLM", "IA générative"],
  summary: "Une architecture de réseau de neurones qui se passe de récurrence et repose entièrement sur des mécanismes d’auto-attention pour traiter tous les tokens d’une séquence simultanément, en parallèle.",
  intuition: "Un surlignage dynamique selon le contexte : dans la phrase « L’animal n’a pas traversé la rue parce qu’il était trop fatigué », le mot « il » braque une lampe torche d’attention sur « animal ». Si la phrase se terminait par « trop large », la lampe se braquerait sur « rue ».",
  whenToUse: "Grands modèles de langage modernes (GPT, BERT, LLaMA), transduction de séquences, traduction de documents, transcription audio (Whisper) et Vision Transformers (ViT).",
  whenToAvoid: "Petits jeux de données tabulaires de moins de 50 000 exemples (où XGBoost bat les Transformers avec 100 fois moins de calcul).",
  parameters: [
    { impact: "Dimension des vecteurs d’embedding des tokens.", tuningTip: "Des dimensions plus grandes permettent des représentations conceptuelles plus riches." },
    { impact: "Nombre de têtes d’attention en parallèle.", tuningTip: "Permet au modèle de se concentrer simultanément sur la syntaxe, le temps verbal, les références aux entités et la sémantique." }
  ],
  math: {
    loss: "Attention par produit scalaire mis à l’échelle",
    explanation: "Le produit scalaire des requêtes (Q) et des clés (K) calcule des scores de pertinence pour chaque paire de mots. Diviser par $\\sqrt{d_k}$ évite que les gradients du softmax ne s’évanouissent. La multiplication par les valeurs (V) produit des embeddings enrichis par le contexte."
  },
  pros: [
    "Parallélisme complet à l’entraînement (supprime le goulot séquentiel des RNN/LSTM)",
    "Capture des dépendances à longue portée sur des milliers de tokens sans évanouissement du gradient",
    "Fondement des avancées modernes de l’IA générative"
  ],
  cons: [
    "Complexité quadratique en calcul et en mémoire $O(N^2)$ par rapport à la longueur de séquence $N$",
    "Exige un matériel de calcul massif (grappes de GPU) pour un entraînement à partir de zéro"
  ],
  diagram: `flowchart TD
  T["Tokens d’entrée"] --> E["Embeddings des tokens + encodage positionnel"]
  E --> QKV["Projection en requêtes Q, clés K, valeurs V"]
  QKV --> S["Scores = Q·Kᵀ / √d_k"]
  S --> SM["Softmax → poids d’attention"]
  SM --> MIX["Somme pondérée de V (multi-têtes)"]
  MIX --> AN1["Add & LayerNorm (résiduel)"]
  AN1 --> FF["MLP feed-forward avec GELU"]
  FF --> AN2["Add & LayerNorm"]
  AN2 -->|"répéter N blocs"| QKV
  AN2 --> OUT(["Représentations contextuelles des tokens → tête de la tâche"])`
};
