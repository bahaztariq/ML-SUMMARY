export default {
  name: "CatBoost",
  category: "Ensemble / Boosting",
  task: ["Classification", "Régression", "Classement (ranking)"],
  summary: "Une bibliothèque de gradient boosting développée par Yandex, qui gère nativement les variables catégorielles grâce aux statistiques de cible ordonnées et utilise des arbres symétriques pour des prédictions rapides et robustes.",
  intuition: "Le correcteur d'examen honnête : quand on encode une catégorie (comme « ville ») par la moyenne de la cible, un correcteur naïf jette un œil à la réponse de l'élève lui-même et la laisse fuiter. CatBoost range les élèves dans un ordre aléatoire et note chacun uniquement à partir des élèves passés avant lui — ainsi, aucune ligne ne voit jamais sa propre étiquette.",
  whenToUse: "Données tabulaires comportant de nombreuses colonnes catégorielles à forte cardinalité (identifiants d'utilisateurs, villes, codes produits). Excellentes performances dès le départ avec les hyperparamètres par défaut et un prétraitement minimal.",
  whenToAvoid: "Jeux de données purement numériques, où LightGBM est généralement plus rapide à entraîner ; très grands jeux de données sur des machines sans GPU avec un budget de temps serré ; ou lorsque le modèle doit être très léger.",
  parameters: [
    {
      impact: "Nombre maximal d'itérations de boosting (arbres).",
      tuningTip: "Choisissez une valeur élevée et appuyez-vous sur early_stopping_rounds avec un eval_set."
    },
    {
      impact: "Taille du pas appliquée à la contribution de chaque arbre.",
      tuningTip: "CatBoost choisit automatiquement une valeur raisonnable selon la taille des données ; baissez-la si la perte de validation est bruitée."
    },
    {
      impact: "Profondeur des arbres symétriques (oblivious trees).",
      tuningTip: "Entre 4 et 10. Un arbre symétrique a 2^depth feuilles : chaque niveau supplémentaire double la complexité."
    },
    {
      impact: "Colonnes à traiter comme catégorielles via les statistiques de cible ordonnées.",
      tuningTip: "Passez directement les colonnes de texte brutes — ne les encodez PAS en one-hot ni en label encoding au préalable."
    },
    {
      impact: "Régularisation L2 sur les valeurs des feuilles.",
      tuningTip: "Augmentez-la (5–10) sur les petits jeux de données ou les données bruitées pour réduire le surapprentissage."
    }
  ],
  math: {
    loss: "Log-loss / RMSE / perte personnalisée, optimisée par Ordered Boosting",
    explanation: "Chaque valeur catégorielle est remplacée par une moyenne lissée de la cible, calculée uniquement sur les lignes qui la précèdent dans une permutation aléatoire (j < k), avec un a priori p pondéré par a. Cela évite la fuite de la cible (target leakage). L'Ordered Boosting applique la même astuce aux résidus, ce qui réduit le biais de décalage des prédictions (prediction shift) fréquent dans les autres GBM."
  },
  pros: [
    "Prise en charge native des variables catégorielles, sans encodage manuel ni fuite de la cible",
    "Excellente précision avec les hyperparamètres par défaut",
    "Les arbres symétriques rendent l'inférence extrêmement rapide et limitent le surapprentissage",
    "Entraînement sur GPU, valeurs SHAP et gestion des valeurs manquantes intégrés"
  ],
  cons: [
    "Plus lent à entraîner que LightGBM sur des données purement numériques",
    "Empreinte mémoire plus importante pendant l'entraînement lorsqu'il y a beaucoup de combinaisons catégorielles",
    "Moins d'exemples dans la communauté que XGBoost",
    "Les arbres symétriques peuvent être moins expressifs sur certains jeux de données"
  ],
  diagram: `flowchart TD
    A[("Données tabulaires brutes avec catégories textuelles")] --> B["Permutation aléatoire des lignes"]
    B --> C["Statistiques de cible ordonnées : encoder chaque ligne à partir des lignes précédentes uniquement"]
    C --> D["Variables numériques + catégorielles encodées"]
    D --> E["Construire un arbre symétrique : même split à chaque niveau"]
    E --> F["Ordered boosting : résidus calculés sans l'étiquette de la ligne elle-même"]
    F --> G{"Arrêt anticipé sur l'ensemble d'évaluation ?"}
    G -->|"continuer"| E
    G -->|"arrêter"| H(["Ensemble final d'arbres symétriques"])
    H --> I["Inférence rapide par recherche de feuille indexée par bits"]`
};
