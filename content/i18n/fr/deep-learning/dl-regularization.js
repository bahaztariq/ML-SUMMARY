export default {
  name: "Régularisation en deep learning (Dropout, BatchNorm, arrêt précoce)",
  category: "Optimisation",
  task: ["Optimisation", "Évaluation"],
  summary: "Une boîte à outils de techniques qui empêchent les grands réseaux de neurones de mémoriser les données d’entraînement, et qui les aident à s’entraîner de façon stable et à généraliser à des exemples jamais vus.",
  intuition: "Entraîner une équipe de sport : le dropout met des joueurs au hasard sur le banc pendant l’entraînement pour que personne ne devienne un point de défaillance unique. BatchNorm est un arbitre qui maintient l’énergie de chaque joueur à la même échelle. L’arrêt précoce, c’est l’entraîneur qui arrête la séance quand le score du match d’entraînement ne progresse plus, au lieu de faire travailler tout le monde jusqu’à l’épuisement.",
  whenToUse: "Dès que la perte de validation remonte alors que la perte d’entraînement continue de baisser, quand le modèle a bien plus de paramètres que d’exemples d’entraînement, ou quand des réseaux profonds s’entraînent de façon instable. L’arrêt précoce vaut la peine d’être utilisé dans pratiquement tous les entraînements.",
  whenToAvoid: "Un dropout fort sur de tout petits modèles qui sont déjà en sous-apprentissage. BatchNorm avec de très petits lots (moins de ~8) ou dans les RNN/Transformers, où LayerNorm est le meilleur choix.",
  parameters: [
    { impact: "Probabilité de mettre à zéro chaque activation pendant l’entraînement (désactivé à l’inférence).", tuningTip: "0,5 pour les grandes couches entièrement connectées, 0,1–0,2 pour les blocs convolutifs et Transformer." },
    { impact: "Normalise les activations (moyenne nulle, variance unité), puis les remet à l’échelle avec γ et β appris.", tuningTip: "BatchNorm pour les CNN avec un lot ≥ 16 ; LayerNorm pour les Transformers, les RNN et les petits lots." },
    { impact: "Nombre d’époques à attendre sans amélioration en validation avant d’arrêter et de restaurer les meilleurs poids.", tuningTip: "Prévoyez une patience plus longue si les courbes de validation sont bruitées ou si l’ordonnancement du LR comporte des redémarrages à chaud." },
    { impact: "Crée des variations réalistes des exemples d’entraînement, ce qui agrandit le jeu de données effectif.", tuningTip: "C’est souvent le régularisateur le plus efficace pour les images et l’audio." }
  ],
  math: {
    loss: "Perte d’entraînement + régularisation implicite / explicite (weight decay λ·‖w‖²)",
    explanation: "Le dropout entraîne un ensemble implicite de sous-réseaux amincis ; diviser par (1−p) garde la même activation moyenne à l’entraînement et au test. BatchNorm standardise chaque caractéristique à l’aide des statistiques du mini-lot μ_B et σ²_B, ce qui lisse la surface de perte et permet des taux d’apprentissage plus élevés. À l’inférence, il utilise les moyennes glissantes collectées pendant l’entraînement."
  },
  pros: [
    "Réduit fortement le surapprentissage avec très peu de changements de code",
    "BatchNorm accélère la convergence et rend l’entraînement moins sensible à l’initialisation",
    "L’arrêt précoce économise du calcul et ne demande aucune modification du modèle",
    "Les techniques se combinent bien (dropout + weight decay + augmentation)"
  ],
  cons: [
    "Oublier model.eval() à l’inférence laisse le dropout actif et utilise les statistiques du lot (un bug classique)",
    "BatchNorm se comporte mal avec des lots minuscules ou non i.i.d.",
    "Trop de régularisation provoque du sous-apprentissage et ralentit l’entraînement",
    "Ajoute des hyperparamètres qui interagissent entre eux et avec le taux d’apprentissage"
  ],
  diagram: `flowchart TD
  A["Lot d’entraînement"] --> B["Augmentation de données : retournements, recadrages, bruit"]
  B --> C["Couche Conv / Linear"]
  C --> D["BatchNorm : soustraire μ_B, diviser par σ_B, remettre à l’échelle γ β"]
  D --> E["Activation (ReLU)"]
  E --> F["Dropout : mettre à zéro des unités au hasard avec probabilité p"]
  F --> G["Perte + weight decay λ·‖w‖²"]
  G --> H["Évaluer sur le jeu de validation à chaque époque"]
  H --> I{"Perte de validation améliorée ?"}
  I -->|"oui"| J["Sauvegarder le meilleur checkpoint, réinitialiser la patience"]
  I -->|"non"| K{"Patience épuisée ?"}
  J --> A
  K -->|"non"| A
  K -->|"oui"| L(["Arrêter et restaurer les meilleurs poids"])`
};
