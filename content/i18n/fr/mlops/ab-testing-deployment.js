export default {
  name: "Tests A/B, déploiement canary et shadow",
  category: "Déploiement & mise en service",
  task: ["Déploiement", "Évaluation"],
  summary: "Des stratégies de mise en production sûres qui exposent un nouveau modèle au trafic réel progressivement ou de façon invisible : shadow (trafic dupliqué, aucun impact sur les utilisateurs), canary (petit pourcentage d’utilisateurs, surveillance des régressions) et tests A/B (répartition aléatoire avec comparaison statistique des indicateurs métier).",
  intuition: "Tester une nouvelle recette : un restaurant cuisine d’abord la nouvelle recette en cuisine sans la servir (shadow), puis la propose à une table sur dix (canary), et enfin organise une vraie dégustation où des tables tirées au hasard reçoivent l’ancienne ou la nouvelle version, avant de comparer les notes de satisfaction (test A/B).",
  whenToUse: "Pour remplacer un modèle en production dont les métriques hors ligne ne reflètent peut-être pas l’impact réel, pour les modèles qui touchent au chiffre d’affaires ou à l’expérience utilisateur, et chaque fois qu’une mauvaise mise en production coûterait cher.",
  whenToAvoid: "Avec un trafic très faible (un test A/B mettrait des mois à devenir significatif), ou pour des décisions où la randomisation serait contraire à l’éthique ou illégale ; utilisez plutôt l’évaluation hors ligne ou l’entrelacement (interleaving).",
  parameters: [
    {
      impact: "La part des requêtes envoyées au nouveau modèle.",
      tuningTip: "Montez progressivement le canary 1 % → 5 % → 25 % → 100 %, en vérifiant les métriques à chaque palier."
    },
    {
      impact: "Le nombre d’utilisateurs nécessaire pour détecter l’effet minimal avec une puissance statistique suffisante.",
      tuningTip: "Couvrez au moins un cycle hebdomadaire complet et n’arrêtez pas le test dès que les résultats « semblent » significatifs (peeking)."
    },
    {
      impact: "Contrôlent les faux positifs et les faux négatifs de la décision.",
      tuningTip: "Fixez-les AVANT le début du test et déclarez à l’avance la métrique principale."
    },
    {
      impact: "Garantit que chaque utilisateur voit toujours la même variante.",
      tuningTip: "Hachez user_id avec un sel propre à l’expérience ; évitez une randomisation par requête pour les modèles visibles par l’utilisateur."
    }
  ],
  math: {
    loss: "Test z de deux proportions et analyse de puissance",
    explanation: "La statistique z compare les taux de conversion du groupe témoin (A) et du groupe traité (B) à l’aide de la proportion commune p̂. La règle empirique n ≈ 16σ²/Δ² donne la taille d’échantillon par groupe pour une puissance de 80 % à α = 0.05 afin de détecter une différence Δ."
  },
  pros: [
    "Mesure l’impact métier réel (chiffre d’affaires, clics), pas seulement l’exactitude hors ligne",
    "Les déploiements shadow et canary limitent les dégâts d’un mauvais modèle",
    "La rigueur statistique évite de livrer des changements qui ne paraissent meilleurs que par hasard"
  ],
  cons: [
    "Nécessite une infrastructure de routage du trafic et une journalisation par variante",
    "Les tests A/B demandent beaucoup de trafic et de temps pour atteindre la significativité",
    "Pièges : consultation prématurée des résultats (peeking), effets de nouveauté, interférences entre utilisateurs, pêche aux métriques multiples"
  ],
  diagram: `flowchart TD
    U(["Requêtes utilisateurs entrantes"]) --> R{"Routeur : hash(user_id)"}
    R -->|"shadow : copie miroir"| S["Le modèle B prédit en silence"]
    S --> SL[("Journaliser seulement, comparer hors ligne")]
    R -->|"95 % du trafic"| A["Modèle A (champion)"]
    R -->|"5 % canary / 50 % A-B"| B["Modèle B (challenger)"]
    A --> M[("Métriques par variante : erreurs, latence, conversions")]
    B --> M
    M --> T["Test statistique après la durée prévue"]
    T --> D{"B nettement meilleur et en bonne santé ?"}
    D -->|"oui"| P["Passer B à 100 %"]
    D -->|"non"| K["Revenir en arrière, garder A"]`
};
