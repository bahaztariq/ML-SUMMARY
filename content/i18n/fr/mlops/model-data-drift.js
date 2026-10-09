export default {
  name: "Surveillance de la dérive des données et du modèle",
  category: "Surveillance & gouvernance",
  task: ["Surveillance en production", "Détection de dérive", "Fiabilité"],
  summary: "Des méthodes pour détecter quand la distribution statistique des données d’entrée change (dérive des données) ou quand la relation entre les entrées et la cible évolue au fil du temps (dérive de concept).",
  intuition: "La lente pourriture silencieuse d’un modèle : un modèle de détection de fraude entraîné en 2019 fonctionne à merveille jusqu’à ce que les confinements de 2020 bouleversent du jour au lendemain les habitudes d’achat des consommateurs, sans qu’aucun code ne plante.",
  whenToUse: "Indispensable pour tout modèle de Machine Learning déployé en production auprès de vrais utilisateurs.",
  whenToAvoid: "Pour des systèmes fermés et statiques dont la distribution des données ne change jamais (par ex. des simulations physiques).",
  parameters: [
    {
      impact: "Mesure le décalage entre la distribution de référence et la distribution actuelle.",
      tuningTip: "PSI < 0.1 : pas de décalage ; 0.1 - 0.2 : décalage modéré ; > 0.2 : dérive significative, déclenchez un réentraînement."
    },
    {
      impact: "Détecte si la distribution d’une variable continue s’est écartée de la référence.",
      tuningTip: "Comparez une fenêtre glissante de production à la distribution d’entraînement de référence."
    }
  ],
  math: {
    loss: "Divergence de Kullback-Leibler (KL) / PSI",
    explanation: "Compare les distributions actuelles des variables en production à la référence de base. Lorsque les mesures de distance franchissent un seuil défini, des alertes préviennent les ingénieurs qu’il faut réentraîner."
  },
  pros: [
    "Empêche les modèles de produire en silence des prédictions désastreuses en production",
    "Permet de déclencher automatiquement un réentraînement continu à partir d’alertes statistiques empiriques"
  ],
  cons: [
    "Les vraies étiquettes peuvent arriver avec des semaines de retard (par ex. un défaut de remboursement met des mois à être constaté), ce qui oblige à s’appuyer sur des métriques indirectes"
  ],
  diagram: `flowchart TD
    A[("Données d’entraînement = distribution de référence")] --> C["Comparer les distributions variable par variable"]
    B["Entrées & prédictions en production"] --> C
    C --> D["Statistiques : PSI, test KS, divergence KL"]
    D --> E{"Dérive au-dessus du seuil ?"}
    E -->|"non"| F["Continuer la surveillance"]
    F -.-> B
    E -->|"oui"| G["Alerter l’équipe"]
    B --> H["Vraies étiquettes reçues avec retard"]
    H --> I{"Baisse de l’exactitude ? (dérive de concept)"}
    I -->|"oui"| G
    G --> J["Déclencher le pipeline de réentraînement"]
    J --> K["Valider & redéployer le nouveau modèle"]`
};
