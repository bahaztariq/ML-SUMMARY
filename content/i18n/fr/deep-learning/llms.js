export default {
  name: "Grands modèles de langage (LLM)",
  category: "IA générative",
  task: ["TAL", "Architecture"],
  summary: "De très grands Transformers de type décodeur seul, pré-entraînés à prédire le token suivant sur des milliers de milliards de mots, puis alignés pour suivre des instructions, ce qui en fait des moteurs polyvalents de raisonnement et de génération de texte.",
  intuition: "L’autocomplétion ultime : le clavier de votre téléphone suggère le mot suivant à partir de quelques phrases de contexte. Un LLM, c’est cette autocomplétion poussée à des milliards de paramètres et à la majeure partie de l’internet public, si bien que « prédire le mot suivant » finit par exiger à la fois grammaire, connaissances, raisonnement et style.",
  whenToUse: "Génération de texte, résumé, questions-réponses, classification et extraction avec peu ou pas d’exemples étiquetés (prompting), génération de code, assistants conversationnels et agents qui appellent des outils.",
  whenToAvoid: "Logique strictement déterministe ou calcul exact, tâches à fort volume et faible latence qu’un petit classifieur résout à moindre coût, questions nécessitant des faits récents ou privés sans récupération (utilisez le RAG), et décisions à fort enjeu sans relecture humaine.",
  parameters: [
    { impact: "Met à l’échelle les logits avant l’échantillonnage ; basse = ciblé et reproductible, haute = créatif et aléatoire.", tuningTip: "Utilisez 0–0,2 pour l’extraction, la classification et le code ; 0,7–1,0 pour le brainstorming et l’écriture créative." },
    { impact: "N’échantillonne que parmi le plus petit ensemble de tokens dont les probabilités cumulées atteignent p.", tuningTip: "Réglez soit la température, soit top_p, mais pas les deux de façon agressive en même temps." },
    { impact: "Limite la quantité de texte que le modèle peut lire (prompt) et écrire (complétion).", tuningTip: "Le coût et la latence augmentent avec le nombre de tokens ; raccourcissez les prompts et ne récupérez que les passages pertinents." },
    { impact: "Ingénierie de prompt → exemples few-shot → RAG → fine-tuning (LoRA) → pré-entraînement complet.", tuningTip: "Ne montez cette échelle qu’en cas de besoin : la plupart des problèmes se règlent avec de bons prompts et du RAG." }
  ],
  math: {
    loss: "Entropie croisée sur le token suivant (puis instruction tuning + RLHF / optimisation des préférences)",
    explanation: "Le modèle décompose le texte en une chaîne de prédictions du token suivant ; un masque d’attention causal garantit que chaque position ne voit que les tokens précédents. Le pré-entraînement minimise l’entropie croisée sur des milliers de milliards de tokens. L’instruction tuning et l’optimisation des préférences (RLHF / DPO) transforment ensuite ce prédicteur brut en un assistant utile et inoffensif. À l’inférence, les tokens sont échantillonnés un par un et ajoutés au contexte."
  },
  pros: [
    "Un seul modèle traite de nombreuses tâches avec zéro ou quelques exemples étiquetés",
    "Fortes capacités de compréhension, de génération de langage et de programmation",
    "Se personnalise facilement par le prompting, le RAG ou un fine-tuning économe en paramètres",
    "Disponibles via des API, sans aucune infrastructure d’entraînement"
  ],
  cons: [
    "Hallucinations : des affirmations fausses énoncées avec assurance",
    "Inférence coûteuse et latence élevée pour les grands modèles",
    "Connaissances figées à la date de fin d’entraînement ; fenêtre de contexte limitée",
    "Les risques de confidentialité, d’injection de prompt et de biais exigent des garde-fous et des évaluations"
  ],
  diagram: `flowchart TD
  W[("Des milliers de milliards de tokens web / code")] --> PT["Pré-entraînement : prédiction du token suivant"]
  PT --> BASE["Modèle de base (autocomplétion)"]
  BASE --> SFT["Instruction tuning sur des paires prompt-réponse"]
  SFT --> RL["Alignement sur les préférences (RLHF / DPO)"]
  RL --> CHAT["Modèle assistant"]
  U["Prompt de l’utilisateur"] --> TOK["Tokenisation → embeddings"]
  TOK --> CHAT
  CHAT --> DEC["Décodeur Transformer → probabilités du token suivant"]
  DEC --> SAMP["Échantillonner avec température / top_p"]
  SAMP -->|"ajouter le token, répéter"| DEC
  SAMP --> ANS(["Réponse générée"])`
};
