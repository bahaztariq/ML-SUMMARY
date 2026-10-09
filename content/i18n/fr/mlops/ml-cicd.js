export default {
  name: "CI/CD et entraînement continu pour le ML",
  category: "Orchestration & workflow",
  task: ["Déploiement", "Évaluation"],
  summary: "Automatiser les tests, la validation, l’empaquetage et la mise en production du code, des données et des modèles de ML (CI/CD), et réentraîner automatiquement les modèles quand de nouvelles données ou une dérive apparaissent (entraînement continu, CT).",
  intuition: "L’inspecteur automatique d’une usine : dans une usine moderne, chaque produit passe des contrôles automatiques sur la chaîne ; les défauts sont rejetés avant l’expédition, et quand les matières premières changent, les machines se recalibrent d’elles-mêmes. La CI/CD pour le ML est cette chaîne d’inspection pour les modèles, et l’entraînement continu est le recalibrage automatique.",
  whenToUse: "Pour les équipes qui livrent régulièrement des modèles, les modèles qui doivent être réentraînés sur des données fraîches, les contextes réglementés qui exigent un processus de mise en production auditable, ou dès que des déploiements manuels ont provoqué des incidents.",
  whenToAvoid: "Pour les premiers prototypes dont les besoins changent tous les jours, ou les modèles réentraînés une fois par an — une check-list manuelle documentée peut suffire.",
  requirements: {
    evaluationGate: "Le nouveau modèle doit battre le modèle en production sur un jeu de validation fixe"
  },
  parameters: [
    {
      impact: "Détectent le code de variables cassé, les changements de schéma et les données défectueuses avant l’entraînement.",
      tuningTip: "Ajoutez un « smoke train » rapide sur un petit échantillon pour repérer les erreurs de pipeline en quelques minutes."
    },
    {
      impact: "Bloque la promotion des modèles moins bons que le modèle actuellement en production.",
      tuningTip: "Contrôlez aussi l’équité par sous-groupes, la latence et la taille du modèle, pas seulement la métrique principale."
    },
    {
      impact: "Déclenche le réentraînement : selon un planning, sur alerte de dérive ou quand suffisamment de nouvelles étiquettes sont arrivées.",
      tuningTip: "Combinez un planning et une alerte de dérive pour un réentraînement à la fois régulier et réactif."
    },
    {
      impact: "La façon dont le nouveau modèle reçoit le trafic après la CI : d’un seul coup, en canary, en shadow ou en A/B.",
      tuningTip: "Utilisez des déploiements canary ou shadow avec retour arrière automatique en cas de régression des métriques."
    }
  ],
  math: {
    loss: "Porte de promotion automatisée",
    explanation: "Un modèle candidat n’est promu que si tous les tests automatiques passent et qu’il dépasse le modèle en production d’au moins une marge δ sur le même jeu de validation fixe, ce qui rend les mises en production objectives et reproductibles."
  },
  pros: [
    "Des mises en production de modèles plus rapides, plus sûres et plus fréquentes",
    "Les modèles restent à jour automatiquement quand les données évoluent",
    "Chaque version est testée, versionnée et auditable, avec un retour arrière facile"
  ],
  cons: [
    "Complexe à construire : les pipelines doivent tester le code, les données ET les modèles",
    "Les tâches d’entraînement sont lentes et coûteuses comparées à des builds de CI classiques",
    "Des portes automatiques mal conçues peuvent promouvoir en silence des modèles défectueux ou bloquer les bons"
  ],
  diagram: `flowchart TD
    A(["Push de code"]) --> C["CI : lint + tests unitaires"]
    B(["Planning ou alerte de dérive"]) --> E
    C --> D["Tests de validation des données"]
    D --> E["Pipeline d’entraînement"]
    E --> F["Évaluer sur le jeu de validation fixe"]
    F --> G{"Bat le champion et passe les contrôles ?"}
    G -->|"non"| H["Rejeter & prévenir l’équipe"]
    G -->|"oui"| I["Enregistrer le modèle + construire l’image Docker"]
    I --> J["Déploiement canary"]
    J --> K{"Métriques en production saines ?"}
    K -->|"oui"| L["Déploiement complet"]
    K -->|"non"| M["Retour arrière automatique"]`
};
