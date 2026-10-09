export default {
  name: "Label encoding vs encodage one-hot",
  category: "Prétraitement et ingénierie des variables",
  task: ["Prétraitement", "Ingénierie des variables", "Encodage"],
  summary: "Des techniques pour convertir les variables catégorielles textuelles (comme 'Red', 'Blue', 'Green') en représentations numériques que les algorithmes d’apprentissage automatique peuvent traiter mathématiquement.",
  intuition: "Une traduction pour les machines : les modèles de ML parlent en nombres, pas en mots. 'Paris', 'London', 'Tokyo' ne signifient rien pour un réseau de neurones. Il faut les traduire en nombres — mais la MANIÈRE de traduire compte énormément.",
  whenToUse: "Obligatoire pour tout jeu de données contenant des variables catégorielles (textuelles) avant de les fournir à un modèle de ML. Le choix dépend de l’algorithme et de la nature de la variable.",
  whenToAvoid: "Avec des modèles qui gèrent nativement les variables catégorielles (CatBoost, LightGBM avec déclaration des variables catégorielles).",
  parameters: [
    {
      impact: "Associe à chaque catégorie unique un entier : Red=0, Blue=1, Green=2.",
      tuningTip: "À utiliser UNIQUEMENT pour des variables ordinales (Low<Medium<High) ou des modèles à base d’arbres. Un modèle linéaire interprétera Blue(1) comme étant « entre » Red(0) et Green(2) !"
    },
    {
      impact: "Crée une colonne binaire distincte pour chaque catégorie : is_Red, is_Blue, is_Green.",
      tuningTip: "À utiliser pour des catégories nominales (non ordonnées) avec moins de 10 valeurs uniques. Supprimez une colonne (drop='first') pour éviter la multicolinéarité."
    },
    {
      impact: "Comme LabelEncoder, mais respecte explicitement un ordre défini par l’utilisateur.",
      tuningTip: "À utiliser pour des variables réellement ordinales : ['low', 'medium', 'high'] → [0, 1, 2]."
    },
    {
      impact: "Remplace chaque catégorie par la valeur moyenne de la cible pour cette catégorie.",
      tuningTip: "Idéal pour les variables à forte cardinalité (plus de 1000 villes). Attention à la fuite de la cible : utilisez toujours un target encoding avec validation croisée."
    }
  ],
  math: {
    loss: "Transformation de représentation",
    explanation: "Le label encoding impose une relation d’ordre implicite (0 < 1 < 2), incorrecte pour des catégories nominales. L’encodage one-hot crée des dimensions binaires orthogonales et traite toutes les catégories comme équidistantes."
  },
  pros: [
    "Convertit les variables catégorielles en représentations numériques compatibles avec les algorithmes",
    "L’encodage one-hot évite de fausses relations d’ordre entre des catégories non ordonnées",
    "Le target encoding gère les variables catégorielles à forte cardinalité sans explosion de la dimension"
  ],
  cons: [
    "L’encodage one-hot provoque une explosion de la dimension avec les variables à forte cardinalité (plus de 1000 valeurs uniques)",
    "Le label encoding introduit de fausses relations d’ordre pour les modèles linéaires et à base de distances",
    "Le target encoding risque le surapprentissage par fuite de la cible s’il n’est pas fait en validation croisée"
  ],
  diagram: `flowchart TD
    A["Colonne catégorielle"] --> B{"Existe-t-il un ordre naturel ?"}
    B -->|"oui (faible/moyen/élevé)"| C["Encodage ordinal / label encoding"]
    B -->|"non"| D{"Beaucoup de valeurs uniques ?"}
    D -->|"peu"| E["Encodage one-hot"]
    D -->|"beaucoup"| F["Encodage par la cible / par fréquence, ou embeddings"]
    C --> G["Ajuster l’encodeur sur l’entraînement seulement"]
    E --> G
    F --> G
    G --> H["Transformer l’entraînement et le test"]
    H --> I(["Matrice numérique pour le modèle"])`
};
