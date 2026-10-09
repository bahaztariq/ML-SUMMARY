export default {
  name: "Génération augmentée par récupération (RAG) et bases de données vectorielles",
  category: "IA générative",
  task: ["TAL", "Stockage", "Architecture", "Déploiement"],
  summary: "Une architecture qui récupère des passages pertinents dans vos propres documents par recherche d’embeddings, puis les insère dans le prompt du LLM pour que les réponses soient fondées, à jour et sourcées.",
  intuition: "L’examen à livre ouvert : un LLM seul répond de mémoire et bluffe parfois. Le RAG lui permet de passer d’abord à la bibliothèque : un bibliothécaire (le retriever) trouve les trois pages les plus pertinentes, et l’étudiant (le LLM) rédige la réponse en citant ces pages.",
  whenToUse: "Chatbots sur la documentation, les politiques ou les bases de connaissances d’une entreprise ; questions sur des données privées ou qui changent souvent ; tout contexte où les réponses doivent citer leurs sources et où les hallucinations coûtent cher.",
  whenToAvoid: "Quand la tâche demande une nouvelle compétence ou un nouveau style plutôt que de nouveaux faits (faites plutôt du fine-tuning), quand tout le corpus tient largement dans la fenêtre de contexte, ou pour des analyses structurées auxquelles une requête SQL répond exactement.",
  parameters: [
    { impact: "La façon dont les documents sont découpés avant l’embedding ; détermine la précision de la récupération.", tuningTip: "Découpez selon les titres/paragraphes, pas au milieu d’une phrase. Morceaux plus petits = plus précis mais moins de contexte." },
    { impact: "Nombre de morceaux récupérés insérés dans le prompt.", tuningTip: "Récupérez ~20 candidats, puis réordonnez-les avec un cross-encoder et gardez les 3–5 meilleurs." },
    { impact: "Détermine dans quelle mesure la similarité sémantique correspond à la pertinence réelle.", tuningTip: "Utilisez le même modèle pour l’indexation et les requêtes ; évaluez-le sur votre propre jeu de questions." },
    { impact: "Arbitre entre vitesse de recherche et rappel dans la base vectorielle (FAISS, Chroma, pgvector, Qdrant).", tuningTip: "Combinez la recherche vectorielle avec une recherche par mots-clés BM25 (recherche hybride) pour les noms, codes et identifiants." }
  ],
  math: {
    loss: "Évalué avec le rappel de récupération recall@k, la fidélité et la pertinence des réponses",
    explanation: "Les documents et la requête sont projetés dans le même espace vectoriel par l’encodeur E. Un index de plus proches voisins approximatif (HNSW, IVF) trouve rapidement les morceaux ayant la plus forte similarité cosinus. Ces morceaux sont concaténés dans le prompt comme contexte, si bien que le LLM conditionne ses prédictions du token suivant sur les éléments récupérés plutôt que sur ses seuls paramètres."
  },
  pros: [
    "Fonde les réponses sur vos propres données à jour et permet de citer les sources",
    "Mettre à jour les connaissances demande seulement de réindexer les documents, pas de réentraîner",
    "Réduit nettement les hallucinations sur les questions factuelles",
    "Le contrôle d’accès peut être appliqué au moment de la récupération"
  ],
  cons: [
    "La qualité dépend fortement du découpage, des embeddings et du réglage de la récupération",
    "Si la récupération rate le bon passage, le LLM répond quand même mal",
    "Ajoute de la latence et de l’infrastructure (base vectorielle, pipelines d’ingestion)",
    "Vulnérable aux injections de prompt cachées dans les documents récupérés"
  ],
  diagram: `flowchart LR
  subgraph ingest["Indexation hors ligne"]
    DOC[("Documents : PDF, wiki, tickets")] --> CH["Découper en morceaux"]
    CH --> EM1["Modèle d’embedding"]
    EM1 --> VDB[("Base vectorielle / index HNSW")]
  end
  Q(["Question de l’utilisateur"]) --> EM2["Embedding de la question"]
  EM2 --> S["Recherche des plus proches voisins top_k"]
  VDB --> S
  S --> RR["Réordonner et filtrer"]
  RR --> P["Prompt = instructions + contexte + question"]
  P --> LLM["LLM"]
  LLM --> A(["Réponse fondée avec citations"])`
};
