export default {
  name: "Optimiseurs du deep learning (Momentum, RMSProp, Adam)",
  category: "Optimisation",
  task: ["Optimisation"],
  summary: "Des améliorations de la descente de gradient classique qui utilisent des moyennes glissantes des gradients passés pour accélérer et stabiliser l’entraînement des réseaux de neurones profonds.",
  intuition: "Le randonneur malin : la SGD simple fait chaque fois un pas tout droit vers le bas et zigzague d’une paroi à l’autre dans les ravins étroits. Le momentum est une boule lourde qui prend de la vitesse dans une direction constante. RMSProp donne à chaque paramètre sa propre pointure : petits pas là où la pente est raide, grands pas là où le terrain est plat. Adam fait les deux à la fois.",
  whenToUse: "Pour entraîner n’importe quel réseau de neurones. AdamW est le choix par défaut pour les Transformers, le fine-tuning de LLM et la plupart des nouveaux projets ; la SGD avec momentum reste privilégiée pour l’entraînement de grands CNN sur images, où elle généralise souvent un peu mieux.",
  whenToAvoid: "Modèles convexes classiques disposant de solveurs en forme close ou du second ordre (moindres carrés ordinaires, L-BFGS pour une petite régression logistique). Évitez la SGD sans momentum sur les réseaux profonds (convergence très lente).",
  requirements: {
    learningRateSchedule: "recommandé"
  },
  parameters: [
    { impact: "La taille de pas globale ; l’hyperparamètre le plus important de tous.", tuningTip: "Utilisez un LR finder ou essayez 3e-4 pour Adam. Combinez avec un warmup + une décroissance cosinus pour les Transformers." },
    { impact: "La part de la direction de mise à jour précédente qui est conservée (premier moment).", tuningTip: "0,9 convient presque toujours. Descendez vers 0,5 si l’entraînement oscille fortement." },
    { impact: "Taux de décroissance de la moyenne glissante des gradients au carré (second moment, échelle propre à chaque paramètre).", tuningTip: "Utilisez 0,95–0,98 pour l’entraînement de grands Transformers / LLM afin de réagir plus vite aux pics de gradient." },
    { impact: "Rapproche les poids de zéro à chaque pas (régularisation de type L2).", tuningTip: "Utilisez AdamW (décroissance découplée), pas Adam + perte L2. Excluez les biais et les poids de LayerNorm." }
  ],
  math: {
    loss: "N’importe quelle perte différentiable (entropie croisée, MSE…)",
    explanation: "Le momentum (m) est une moyenne exponentielle des gradients qui lisse les directions bruitées des mini-lots. Le second moment (v) suit les gradients au carré, si bien que le pas de chaque paramètre est divisé par la taille typique de son gradient (RMSProp). Adam combine les deux et applique les corrections de biais m̂ et v̂ pendant les premiers pas, quand les moyennes partent de zéro."
  },
  pros: [
    "Converge bien plus vite que la SGD simple sur des surfaces de perte profondes et mal conditionnées",
    "Les taux d’apprentissage adaptatifs par paramètre gèrent bien les caractéristiques creuses et les embeddings",
    "Adam/AdamW fonctionnent bien avec les hyperparamètres par défaut sur de nombreuses tâches",
    "Le momentum aide à sortir des plateaux et des points-selles peu marqués"
  ],
  cons: [
    "Adam stocke deux tenseurs supplémentaires par paramètre (3 fois la mémoire des poids du modèle)",
    "Les méthodes adaptatives peuvent généraliser un peu moins bien qu’une SGD bien réglée sur certaines tâches de vision",
    "Restent sensibles au taux d’apprentissage et à son ordonnancement",
    "Adam avec une régularisation L2 naïve ne se comporte pas comme prévu (utilisez AdamW)"
  ],
  diagram: `flowchart TD
  A["Mini-lot de données"] --> B["Passe avant → perte"]
  B --> C["Passe arrière → gradient g"]
  C --> D["Momentum : m = β₁·m + (1−β₁)·g"]
  C --> E["RMSProp : v = β₂·v + (1−β₂)·g²"]
  D --> F["Correction de biais m̂, v̂"]
  E --> F
  F --> G["Pas d’Adam : θ ← θ − η·m̂ / (√v̂ + ε)"]
  G --> H["AdamW : réduit aussi θ par weight decay"]
  H --> I["Le scheduler de LR ajuste η"]
  I --> J{"Convergé ?"}
  J -->|"non"| A
  J -->|"oui"| K(["Poids entraînés"])`
};
