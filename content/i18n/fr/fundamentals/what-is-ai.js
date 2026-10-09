export default {
  name: "Qu’est-ce que l’intelligence artificielle (IA) ?",
  category: "Fondamentaux & vue d’ensemble",
  task: ["Définition", "Fondamentaux", "Vue d’ensemble"],
  summary: "La discipline scientifique et technique globale qui vise à créer des systèmes capables d’accomplir des tâches nécessitant habituellement l’intelligence cognitive humaine.",
  intuition: "Le parapluie le plus large : voyez l’IA comme l’ensemble du domaine des transports. Voitures, avions, trains et vélos sont tous des moyens de transport. De même, les systèmes experts à base de règles, les algorithmes de Machine Learning et les réseaux de neurones profonds sont tous des sous-domaines de l’IA.",
  whenToUse: "Pour concevoir des logiciels qui doivent percevoir leur environnement, raisonner face à l’incertitude, reconnaître des motifs ou prendre des décisions autonomes à grande échelle.",
  whenToAvoid: "Lorsqu’une logique déterministe simple (requêtes SQL classiques, formules arithmétiques, instructions if-else) résout le problème avec une précision de 100 % et sans aucune incertitude.",
  parameters: [
    {
      impact: "IA spécialisée dans une seule tâche (jouer aux échecs, recommander des films, détecter des tumeurs…).",
      tuningTip: "Toute l’IA commerciale existante aujourd’hui est de l’IA faible."
    },
    {
      impact: "IA hypothétique dotée d’une capacité d’adaptation cognitive de niveau humain dans n’importe quel domaine intellectuel.",
      tuningTip: "Un sujet de recherche actif à long terme, dans le monde académique comme dans l’industrie."
    },
    {
      impact: "L’IA symbolique utilise des règles logiques écrites à la main ; l’IA statistique (le ML) apprend des motifs probabilistes à partir de données empiriques.",
      tuningTip: "L’IA moderne combine apprentissage statistique et contraintes symboliques."
    }
  ],
  math: {
    loss: "Hiérarchie de l’intelligence artificielle",
    explanation: "L’IA est l’ensemble englobant. Le Machine Learning est le moteur statistique de l’IA qui apprend à partir des données. Le Deep Learning est la branche spécialisée du Machine Learning fondée sur des réseaux de neurones à plusieurs couches."
  },
  pros: [
    "Automatise des tâches cognitives très complexes autrefois réservées aux humains",
    "Traite à grande échelle des flux massifs et multimodaux (image, audio, texte, capteurs)",
    "Peut découvrir des solutions et des motifs non intuitifs dans des domaines de grande dimension"
  ],
  cons: [
    "Peut se comporter comme une boîte noire imprévisible sans garde-fous de vérification stricts",
    "Sujette aux hallucinations, aux biais des données et aux défis d’alignement et de sécurité"
  ],
  diagram: `flowchart TD
    A(["Problème nécessitant un comportement intelligent"]) --> B{"Des règles explicites suffisent-elles ?"}
    B -->|"oui"| C["IA symbolique : règles écrites à la main / système expert"]
    B -->|"non, motifs cachés dans les données"| D["Machine Learning : apprendre les règles à partir d’exemples"]
    D --> E{"Données non structurées à grande échelle ? (images, texte, audio)"}
    E -->|"non, tabulaires"| F["ML classique : arbres, modèles linéaires, SVM"]
    E -->|"oui"| G["Deep Learning : réseaux de neurones multicouches"]
    G --> H["Modèles de fondation / LLM"]
    C --> I["Le système d’IA prend des décisions"]
    F --> I
    H --> I`
};
