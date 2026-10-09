export default {
  name: "Racine de l’erreur quadratique moyenne (RMSE)",
  category: "Métriques d’évaluation",
  task: ["Régression", "Métriques", "Évaluation"],
  summary: "La racine carrée de la moyenne des carrés des écarts entre valeurs prédites et valeurs réelles. Elle s’exprime dans la même unité que la variable cible, ce qui la rend directement interprétable.",
  intuition: "La règle de l’erreur moyenne : la MSE élève les erreurs au carré, ce qui les rend difficiles à interpréter (par ex. des « dollars au carré »). La RMSE prend la racine carrée pour revenir à l’unité d’origine : « erreur de prédiction moyenne de 45,20 $ ».",
  whenToUse: "La métrique de régression la plus populaire. À utiliser quand les grosses erreurs coûtent disproportionnellement cher (par ex. pour prédire des prix immobiliers, où une erreur de 100K $ est bien pire que deux erreurs de 50K $).",
  whenToAvoid: "Quand les erreurs aberrantes ne doivent PAS être plus pénalisées que les petites erreurs (utilisez plutôt la MAE).",
  parameters: [
    {
      impact: "Des erreurs de 10 apportent 100 à la MSE ; des erreurs de 1 n’apportent que 1. Les grosses valeurs aberrantes dominent.",
      tuningTip: "Si vos données ont des valeurs aberrantes extrêmes, envisagez plutôt la MAE ou la perte de Huber."
    },
    {
      impact: "Quand RMSE >> MAE, c’est le signe de grosses erreurs de prédiction aberrantes.",
      tuningTip: "Suivez la RMSE et la MAE ensemble pour savoir si les erreurs sont réparties uniformément."
    }
  ],
  math: {
    loss: "Racine de l’erreur quadratique moyenne",
    explanation: "Calcule d’abord la moyenne des carrés des résidus (MSE), puis en prend la racine carrée pour retrouver l’unité de mesure d’origine. La RMSE est ainsi directement comparable à l’échelle de la variable cible."
  },
  pros: [
    "Même unité physique que la variable cible (dollars, kg, minutes)",
    "Pénalise fortement les grosses erreurs de prédiction, ce qui est souhaitable dans les applications critiques pour la sécurité",
    "La métrique de régression la plus utilisée dans les articles scientifiques et les compétitions Kaggle"
  ],
  cons: [
    "Extrêmement sensible aux observations aberrantes (une seule énorme erreur peut gonfler fortement la RMSE)",
    "Peu robuste pour des distributions d’erreurs asymétriques"
  ],
  diagram: `flowchart LR
    A["y réel et ŷ prédit"] --> B["Résidu y − ŷ"]
    B --> C["L’élever au carré (les grosses erreurs sont amplifiées)"]
    C --> D["Moyenne sur n échantillons = MSE"]
    D --> E["Racine carrée"]
    E --> F(["RMSE dans l’unité de la cible"])
    C --> G["Les valeurs aberrantes dominent le score"]`
};
