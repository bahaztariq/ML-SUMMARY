export default {
  name: "RNN et LSTM (réseaux de neurones récurrents)",
  category: "Architectures neuronales",
  task: ["TAL", "Séries temporelles", "Modélisation de séquences"],
  summary: "Des réseaux de neurones conçus pour traiter des données séquentielles en maintenant un état caché (une mémoire) qui transporte l’information des pas de temps précédents. Le LSTM ajoute des mécanismes de portes pour retenir ou oublier sélectivement l’information sur de longues séquences.",
  intuition: "Lire un livre en gardant la mémoire : un réseau de neurones classique lit chaque mot isolément. Un RNN lit mot après mot en tenant dans sa tête un résumé courant (l’état caché). Le LSTM ajoute un carnet (l’état de cellule) où il peut noter les faits importants et effacer ceux qui ne servent à rien, grâce à des portes.",
  whenToUse: "Données séquentielles : prévision de séries temporelles, reconnaissance vocale, modélisation du langage (avant les Transformers), génération de musique et prédiction de cours boursiers.",
  whenToAvoid: "Tâches pour lesquelles les Transformers sont disponibles et praticables (TAL, longues séquences). Les CNN pour les données spatiales. Les données tabulaires sans ordre temporel.",
  parameters: [
    { impact: "Dimension du vecteur d’état caché.", tuningTip: "Un état caché plus grand capture des motifs temporels plus complexes, mais augmente le calcul et le risque de surapprentissage." },
    { impact: "Nombre de couches récurrentes empilées.", tuningTip: "2 couches est un choix courant. Au-delà de 3 couches, le gradient circule mal, même pour les LSTM." },
    { impact: "Traite la séquence dans les deux sens, vers l’avant et vers l’arrière.", tuningTip: "Utilisez bidirectional=True quand le contexte futur aide (classification de texte). Pas pour la prévision de séries temporelles." },
    { impact: "Trois portes contrôlent le flux d’information : quoi oublier, quoi retenir et quoi produire en sortie.", tuningTip: "Le LSTM résout le problème d’évanouissement du gradient qui handicape les RNN simples sur les longues séquences." }
  ],
  math: {
    loss: "Rétropropagation dans le temps (BPTT)",
    explanation: "Les RNN se déroulent dans le temps : l’état caché de chaque pas de temps dépend de l’état caché précédent et de l’entrée courante. Le LSTM remplace la mise à jour simple de l’état caché par des opérations à portes : la porte d’oubli (quoi effacer), la porte d’entrée (quoi écrire) et la porte de sortie (quoi révéler)."
  },
  pros: [
    "Conçus spécifiquement pour les données séquentielles/temporelles avec des entrées de longueur variable",
    "Le LSTM capture efficacement les dépendances à longue portée (des centaines de pas de temps)",
    "Adaptés naturellement aux données en flux (traitent un token à la fois)"
  ],
  cons: [
    "Traitement intrinsèquement séquentiel : impossible de paralléliser sur les pas de temps (entraînement lent)",
    "Largement supplantés par les Transformers pour les tâches de TAL depuis 2018",
    "Évanouissement du gradient dans les RNN simples (utilisez LSTM/GRU pour l’atténuer)"
  ],
  diagram: `flowchart LR
  X1["x₁"] --> C1["Cellule t=1"]
  C1 -->|"état caché h₁"| C2["Cellule t=2"]
  X2["x₂"] --> C2
  C2 -->|"état caché h₂"| C3["Cellule t=3"]
  X3["x₃"] --> C3
  C3 --> Y(["Sortie ŷ"])
  subgraph lstm["À l’intérieur d’une cellule LSTM"]
    FG["Porte d’oubli : quoi effacer"] --> CS["État de cellule c (mémoire à long terme)"]
    IG["Porte d’entrée : quoi écrire"] --> CS
    CS --> OG["Porte de sortie : quoi révéler comme h"]
  end
  C2 -.-> FG
  GRU["GRU : variante plus légère, portes de mise à jour et de réinitialisation, sans état de cellule séparé"] -.->|"alternative"| C2`
};
