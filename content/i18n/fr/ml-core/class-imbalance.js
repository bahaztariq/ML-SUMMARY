export default {
  name: "Gérer le déséquilibre des classes (poids de classe, SMOTE, réglage du seuil)",
  category: "Prétraitement et validation",
  task: ["Classification", "Prétraitement", "Évaluation"],
  summary: "Une boîte à outils de techniques (repondération, rééchantillonnage, déplacement du seuil et métriques adaptées) qui empêche un classifieur d’ignorer une classe rare mais importante.",
  intuition: "L’élève discret : dans une classe de 99 élèves bruyants et 1 élève discret, un professeur paresseux qui n’écoute que la majorité obtient 99 % d’« exactitude » sans jamais entendre l’élève discret. Les poids de classe obligent le professeur à mieux écouter l’élève discret, SMOTE ajoute quelques voix discrètes supplémentaires, et le réglage du seuil baisse le volume nécessaire pour être entendu.",
  whenToUse: "Détection de fraude, attrition (churn), maladies rares, détection de défauts, ou toute cible dont la classe minoritaire représente moins d’environ 10 % et dont l’oubli coûte cher.",
  whenToAvoid: "Quand le déséquilibre est léger (par ex. 40/60) et que le modèle fonctionne déjà bien, ou si vous rééchantillonnez AVANT le découpage (des copies synthétiques fuient alors dans l’ensemble de test).",
  parameters: [
    {
      impact: "Multiplie la perte de chaque échantillon par le poids de sa classe, pour que les erreurs sur la classe minoritaire coûtent plus cher.",
      tuningTip: "Commencez par 'balanced' (poids ∝ 1 / fréquence de la classe). Avec XGBoost, utilisez scale_pos_weight = n_negative / n_positive."
    },
    {
      impact: "Ratio minorité:majorité visé après sur-échantillonnage.",
      tuningTip: "Un équilibrage complet 1:1 surcorrige souvent ; essayez 0.3 à 0.5 et validez avec la PR-AUC."
    },
    {
      impact: "Nombre de voisins minoritaires utilisés pour interpoler les échantillons synthétiques.",
      tuningTip: "Baissez-le (3) quand la classe minoritaire est minuscule ; il doit rester inférieur au nombre d’échantillons minoritaires par pli."
    },
    {
      impact: "Seuil de probabilité au-delà duquel on prédit la classe minoritaire.",
      tuningTip: "Souvent la correction la plus efficace à elle seule : baissez-le sur un jeu de validation jusqu’à ce que le rappel atteigne l’objectif métier."
    }
  ],
  math: {
    loss: "Entropie croisée pondérée par classe",
    explanation: "La perte de chaque échantillon est multipliée par le poids de sa classe w_c, inversement proportionnel à l’effectif n_c de la classe. SMOTE crée plutôt des points minoritaires synthétiques x_new = xᵢ + λ·(x_nn − xᵢ) avec λ ∈ [0,1], le long des segments vers les voisins. Les deux approches déplacent la frontière de décision vers la classe majoritaire."
  },
  pros: [
    "Les poids de classe sont gratuits : aucune donnée en plus, un seul paramètre, pris en charge par la plupart des modèles sklearn",
    "Le réglage du seuil fonctionne avec n’importe quel modèle probabiliste après l’entraînement",
    "SMOTE peut aider les modèles qui, sinon, ne verraient jamais assez d’exemples minoritaires",
    "Combiné à la PR-AUC, il révèle la vraie performance sur la classe qui compte"
  ],
  cons: [
    "Rééchantillonner avant le découpage entraînement/test provoque une grave fuite de données",
    "SMOTE peut créer des échantillons irréalistes sur des données bruitées ou de grande dimension",
    "La repondération et le sur-échantillonnage faussent les probabilités prédites (recalibrez si besoin)",
    "Le sous-échantillonnage jette des données majoritaires potentiellement utiles"
  ],
  diagram: `flowchart TD
    A["Jeu de données déséquilibré (par ex. 1 % de fraude)"] --> B["Découpage entraînement/test stratifié"]
    B --> C{"Choisir une stratégie"}
    C -->|"repondérer"| D["class_weight = balanced"]
    C -->|"rééchantillonner"| E["SMOTE / sous-échantillonnage des plis d’ENTRAÎNEMENT seulement"]
    C -->|"a posteriori"| F["Entraîner normalement"]
    D --> G["Ajuster le modèle"]
    E --> G
    F --> G
    G --> H["Prédire les probabilités sur la validation"]
    H --> I["Régler le seuil de décision"]
    I --> J["Évaluer avec PR-AUC, rappel, F1"]
    J --> K(["Vérification finale sur l’ensemble de test intact"])`
};
