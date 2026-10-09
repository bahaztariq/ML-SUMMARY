export default {
  name: "Feature store",
  category: "Architecture & gestion des données",
  task: ["Stockage", "Prétraitement", "Déploiement"],
  summary: "Un système central qui définit, calcule, stocke et sert les variables de ML de manière cohérente, aussi bien pour l’entraînement (hors ligne, historique, correct à date) que pour l’inférence (en ligne, faible latence), ce qui élimine l’écart entraînement-production et la duplication du code des variables.",
  intuition: "Le garde-manger central d’une cuisine : au lieu que chaque chef prépare ses sauces un peu différemment, un garde-manger central prépare chaque sauce une seule fois à partir d’une recette unique, garde une archive datée pour tester les recettes (offline store) et un pot prêt à l’emploi à chaque poste pour le service (online store).",
  whenToUse: "Lorsque plusieurs modèles réutilisent les mêmes variables, que des modèles temps réel ont besoin d’agrégats frais (par ex. « transactions des 10 dernières minutes »), que l’écart entraînement-production a déjà causé des bugs, ou que les jeux d’entraînement corrects à date sont difficiles à construire.",
  whenToAvoid: "Pour un unique modèle par lots dont les variables sont calculées en une seule requête SQL ; un feature store y ajouterait beaucoup d’infrastructure pour peu de bénéfice.",
  requirements: {
    onlineStore: "Stockage clé-valeur à faible latence (Redis, DynamoDB)"
  },
  parameters: [
    {
      impact: "La clé à laquelle les variables sont rattachées et par laquelle on les recherche.",
      tuningTip: "Choisissez des entités qui correspondent aux requêtes de prédiction (utilisateur, article, commerçant)."
    },
    {
      impact: "La durée pendant laquelle une valeur de variable reste valide ; au-delà du TTL, les valeurs périmées sont traitées comme manquantes.",
      tuningTip: "Alignez le TTL sur la vitesse à laquelle le signal sous-jacent évolue."
    },
    {
      impact: "L’offline store conserve tout l’historique pour l’entraînement ; l’online store conserve les dernières valeurs pour une mise en service en quelques millisecondes.",
      tuningTip: "Matérialisez vers l’online store selon un planning ou en streaming pour avoir des variables fraîches."
    },
    {
      impact: "Associe chaque étiquette d’entraînement uniquement aux valeurs de variables connues AVANT l’horodatage de cette étiquette.",
      tuningTip: "Ne construisez jamais un jeu d’entraînement avec une simple jointure sur la dernière valeur : elle fait fuiter des informations du futur."
    }
  ],
  math: {
    loss: "Jointure correcte à date (point-in-time)",
    explanation: "Pour chaque entité e et chaque horodatage d’étiquette t, le store récupère la dernière valeur de la variable calculée à t ou avant. On reproduit ainsi exactement ce que le modèle aurait vu au moment de la prédiction, ce qui empêche la fuite temporelle."
  },
  pros: [
    "Élimine l’écart entraînement-production : une seule définition utilisée hors ligne et en ligne",
    "Réutilisation des variables entre équipes et modèles ; catalogue de variables consultable",
    "Les jointures correctes à date évitent des fuites subtiles dans les jeux d’entraînement"
  ],
  cons: [
    "Infrastructure lourde (offline store, online store, tâches de matérialisation)",
    "Courbe d’apprentissage et coût d’exploitation ; démesuré pour des cas d’usage simples par lots",
    "Les variables en streaming ajoutent de la complexité (fraîcheur, recalcul de l’historique)"
  ],
  diagram: `flowchart LR
    S1[("Sources par lots : entrepôt / lac")] --> T["Définitions des variables (une seule base de code)"]
    S2[("Événements en streaming : Kafka")] --> T
    T --> OFF[("Offline store : historique complet")]
    T --> ON[("Online store : dernières valeurs")]
    OFF --> PIT["Jointure à date avec les étiquettes"]
    PIT --> TR["Jeu de données d’entraînement"]
    TR --> M["Entraîner le modèle"]
    ON --> API["L’API de service recherche par id d’entité"]
    M --> API
    API --> P["Prédiction avec des variables identiques"]`
};
