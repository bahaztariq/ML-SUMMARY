export default {
  name: "Q-learning et Deep Q-Networks (DQN)",
  category: "Apprentissage par renforcement",
  task: ["Apprentissage par renforcement", "Optimisation"],
  summary: "Un algorithme d'apprentissage par renforcement sans modèle qui apprend la récompense attendue à long terme Q(s, a) de chaque action dans chaque état, afin que l'agent puisse agir de façon optimale en choisissant l'action de plus grande valeur.",
  intuition: "La souris dans le labyrinthe : une souris parcourt un labyrinthe et note peu à peu sur un tableau mental la qualité de chaque virage à chaque carrefour, d'après le fromage qu'elle finit par trouver. À chaque déplacement, elle rapproche le score de « la récompense que je viens d'obtenir + le meilleur score que je vois depuis l'endroit où j'arrive ». Le DQN remplace le tableau par un réseau de neurones, ce qui lui permet de gérer des labyrinthes trop grands pour être mis en tableau, comme les pixels bruts d'un jeu vidéo.",
  whenToUse: "Problèmes de décision séquentielle avec des actions discrètes et un signal de récompense clair : jeux, robotique en simulation, gestion de stocks, stratégies d'enchères publicitaires ou ordonnancement de ressources — idéalement quand un simulateur permet à l'agent d'échouer à moindre coût des millions de fois.",
  whenToAvoid: "Espaces d'actions continus (utilisez des méthodes de gradient de politique / acteur-critique comme PPO ou SAC), problèmes sans simulateur où l'exploration est coûteuse ou dangereuse, ou lorsqu'il existe déjà un jeu de données supervisé de décisions correctes.",
  parameters: [
    {
      impact: "À quel point chaque nouvelle expérience remplace l'ancienne estimation de Q.",
      tuningTip: "Une valeur trop élevée provoque des oscillations ; faites-la décroître au fil du temps pour la convergence en version tabulaire."
    },
    {
      impact: "Poids des récompenses futures par rapport aux récompenses immédiates.",
      tuningTip: "Entre 0,9 et 0,99. Des valeurs plus faibles rendent l'agent myope, mais l'entraînement plus stable."
    },
    {
      impact: "Probabilité de choisir une action aléatoire pour explorer.",
      tuningTip: "Commencez de façon totalement aléatoire et faites décroître linéairement ou exponentiellement sur les premiers 10–20 % de l'entraînement."
    },
    {
      impact: "La mémoire de rejeu (experience replay) casse la corrélation entre échantillons ; un réseau cible figé stabilise la cible de bootstrap.",
      tuningTip: "Utilisez une mise à jour douce (τ ≈ 0,005) ou une copie complète toutes les 1 000 à 10 000 étapes ; des mémoires plus grandes améliorent la stabilité."
    }
  ],
  math: {
    loss: "Erreur TD / perte de Huber : L(θ) = ( r + γ·max_a′ Q_θ⁻(s′, a′) − Q_θ(s, a) )²",
    explanation: "La mise à jour rapproche Q(s, a) de la cible de Bellman : la récompense immédiate plus la valeur actualisée de la meilleure action suivante. Le terme entre crochets est l'erreur de différence temporelle (TD). Le DQN approxime Q par un réseau de neurones θ et calcule la cible avec une copie θ⁻ mise à jour lentement, pour éviter de poursuivre une cible mouvante."
  },
  pros: [
    "Sans modèle : apprend directement de l'expérience, sans connaître la dynamique de l'environnement",
    "Hors politique (off-policy) : peut apprendre à partir d'expériences rejouées ou journalisées",
    "Le Q-learning tabulaire converge de façon prouvée vers la politique optimale sous des conditions peu restrictives",
    "Le DQN passe à l'échelle sur des entrées de grande dimension comme les images"
  ],
  cons: [
    "Très peu efficace en échantillons — nécessite souvent des millions d'interactions",
    "Ne gère directement que des actions discrètes",
    "L'opérateur max surestime les valeurs Q (atténué par le Double DQN)",
    "L'entraînement est instable et très sensible aux hyperparamètres et à la conception de la récompense"
  ],
  diagram: `flowchart TD
    A(["L'agent observe l'état s"]) --> B{"Nombre aléatoire inférieur à ε ?"}
    B -->|"oui : explorer"| C["Action aléatoire a"]
    B -->|"non : exploiter"| D["a = argmax Q(s, ·)"]
    C --> E["L'environnement renvoie la récompense r et l'état suivant s′"]
    D --> E
    E --> F[("Stocker (s, a, r, s′) dans la mémoire de rejeu")]
    F --> G["Cible TD = r + γ · max Q_target(s′, a′)"]
    G --> H["Rapprocher Q(s, a) de la cible (pas de gradient pour le DQN)"]
    H --> I["Faire décroître ε, synchroniser périodiquement le réseau cible"]
    I --> A`
};
