export default {
  name: "Qu’est-ce que la régression ?",
  category: "Tâches fondamentales",
  task: ["Définition", "Régression", "Supervisé"],
  summary: "Une tâche d’apprentissage supervisé dans laquelle un algorithme apprend à prédire un nombre réel continu (une quantité) à partir d’une ou plusieurs variables explicatives.",
  intuition: "Lire un compteur de vitesse : contrairement à un interrupteur qui est soit ALLUMÉ soit ÉTEINT (classification), la régression ressemble à un variateur de lumière ou au compteur d’une voiture, capable d’afficher n’importe quelle valeur : 72,7 km/h, 109,4 km/h ou 168,5 km/h.",
  whenToUse: "Lorsque la cible à prédire est une quantité : estimer la valeur d’un bien immobilier (€), une demande en nombre de produits, la tension artérielle d’un patient, un délai de livraison en minutes ou un cours de bourse.",
  whenToAvoid: "Lorsque la cible est une catégorie ou un choix discret (par ex. réussite/échec ou marque d’un produit — utilisez la classification !).",
  parameters: [
    {
      impact: "Pénalise fortement les grosses erreurs de prédiction à cause de l’élévation au carré.",
      tuningTip: "À utiliser quand les grosses erreurs sont catastrophiques pour votre activité."
    },
    {
      impact: "Pénalité linéaire de l’erreur ; bien plus robuste aux enregistrements aberrants extrêmes.",
      tuningTip: "À utiliser quand les données comportent des pics anormaux qui ne doivent pas faire dérailler le modèle."
    },
    {
      impact: "La part de la variance de la variable cible expliquée par le modèle.",
      tuningTip: "1,0 signifie des prédictions parfaites ; 0,0 signifie pas mieux que de prédire la moyenne."
    }
  ],
  math: {
    loss: "MSE = (1/n) ∑ (y_i - ŷ_i)²   |   MAE = (1/n) ∑ |y_i - ŷ_i|",
    explanation: "La régression ajuste une courbe à travers les points d’entraînement de manière à minimiser la distance moyenne (le résidu) entre les valeurs réelles et les valeurs prédites."
  },
  pros: [
    "Fournit des prévisions numériques précises qui pilotent directement la planification financière et logistique",
    "Les résidus du modèle se tracent facilement pour diagnostiquer des structures non linéaires ou de l’hétéroscédasticité",
    "Les coefficients de la régression linéaire s’interprètent directement, euro pour euro"
  ],
  cons: [
    "Très vulnérable aux valeurs aberrantes extrêmes qui déforment la courbe de régression",
    "Ne peut pas extrapoler correctement les tendances au-delà de la plage min/max vue à l’entraînement"
  ],
  diagram: `flowchart LR
    A[("Variables X + cible numérique y")] --> B["Choisir une famille de modèles"]
    B --> C["Ajuster : minimiser l’erreur quadratique / absolue"]
    C --> D["Fonction apprise f(x)"]
    N["Nouvel exemple x"] --> E["Prédire une valeur continue ŷ = f(x)"]
    D --> E
    E --> F["Résidus y − ŷ sur le jeu de test"]
    F --> G["Métriques : MAE, RMSE, R²"]
    G --> H{"Erreur acceptable ?"}
    H -->|"non"| B`
};
