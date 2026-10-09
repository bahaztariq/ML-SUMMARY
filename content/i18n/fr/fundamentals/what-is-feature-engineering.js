export default {
  name: "Qu’est-ce que le feature engineering ?",
  category: "Données & prétraitement",
  task: ["Définition", "Feature engineering", "Prétraitement"],
  summary: "Le fait de s’appuyer sur la connaissance du domaine pour extraire, sélectionner, combiner et transformer des données brutes en variables d’entrée numériques informatives (features) qui permettent aux algorithmes de Machine Learning d’apprendre plus efficacement.",
  intuition: "Raffiner du pétrole brut en kérosène : les données brutes issues des bases de données ressemblent au pétrole tout juste extrait du sol, plein de boues, de formats irréguliers et de bruit. Le feature engineering est la raffinerie qui le distille en carburant aviation à haut indice d’octane pour que votre moteur (le modèle) puisse voler.",
  whenToUse: "Indispensable dans tout workflow de Machine Learning classique sur données tabulaires (XGBoost, forêt aléatoire, scikit-learn). De bonnes variables battent régulièrement les algorithmes sophistiqués.",
  whenToAvoid: "Pour des pixels d’image ou des formes d’onde audio brutes fournis à des CNN profonds ou à des Transformers (les modèles d’apprentissage profond apprennent automatiquement les caractéristiques spatiales et acoustiques).",
  parameters: [
    {
      impact: "Convertit des catégories textuelles (« Paris », « Londres ») en représentations numériques.",
      tuningTip: "Utilisez le one-hot pour une faible cardinalité (< 10) ; un encodage par la cible ou par fréquence pour une forte cardinalité."
    },
    {
      impact: "Extrait day_of_week, hour, is_weekend, is_holiday ainsi que des signaux cycliques sinus/cosinus.",
      tuningTip: "Un horodatage brut sous forme de chaîne est inutile ; ses composantes décomposées apportent un fort pouvoir prédictif."
    },
    {
      impact: "Combiner des variables : par ex. Prix / Surface = Prix au m².",
      tuningTip: "Les ratios révèlent souvent le véritable moteur physique ou économique de la cible."
    }
  ],
  math: {
    loss: "Transformation de la représentation",
    explanation: "Applique des transformations non linéaires $\\Phi$ qui projettent des variables brutes non séparables dans un nouvel espace de variables où des frontières linéaires ou des arbres peuvent facilement séparer les classes."
  },
  pros: [
    "Le principal facteur qui distingue les modèles gagnants en compétition de data science",
    "Permet à de simples modèles linéaires de capter des dynamiques métier complexes et non linéaires",
    "Injecte directement l’expertise humaine du domaine dans le système de Machine Learning"
  ],
  cons: [
    "Chronophage et exige une compréhension approfondie du domaine métier",
    "Fort risque de fuite de données si des variables incluent par erreur des informations du futur"
  ],
  diagram: `flowchart LR
    A[("Colonnes brutes")] --> B["Traiter les valeurs manquantes (imputation)"]
    B --> C{"Type de colonne ?"}
    C -->|"numérique"| D["Mise à l’échelle, transformation log, discrétisation"]
    C -->|"catégorielle"| E["Encodage one-hot / par la cible"]
    C -->|"date-heure"| F["Extraire jour, heure, ancienneté"]
    C -->|"texte"| G["TF-IDF / embeddings"]
    D --> H["Créer interactions & agrégats"]
    E --> H
    F --> H
    G --> H
    H --> I["Sélection de variables"]
    I --> J["Matrice X prête pour le modèle"]`
};
