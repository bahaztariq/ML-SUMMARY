export default {
  name: "KNNImputer (imputation par les k plus proches voisins)",
  category: "Prétraitement et imputation",
  task: ["Prétraitement", "Données manquantes", "Imputation"],
  summary: "Remplit les valeurs manquantes d’un jeu de données avec la moyenne pondérée (ou la valeur la plus fréquente) des k échantillons voisins les plus proches qui, EUX, possèdent une valeur pour cette variable.",
  intuition: "Demandez à vos voisins : imaginez que la note de maths d’un élève manque. Au lieu de la remplacer par la moyenne de la classe (SimpleImputer), KNNImputer regarde les 5 élèves les plus semblables (même note en sciences, même note en anglais) et fait la moyenne de LEURS notes de maths.",
  whenToUse: "Quand les valeurs manquantes ne sont PAS aléatoires et que les échantillons proches dans l’espace des variables apportent un fort signal prédictif. Quand les relations entre variables sont importantes.",
  whenToAvoid: "Très grands jeux de données (KNNImputer est en O(n²) par requête). Quand les données manquent de façon complètement aléatoire (SimpleImputer avec la moyenne ou la médiane suffit et est 100 fois plus rapide).",
  parameters: [
    {
      impact: "Nombre de plus proches voisins utilisés pour l’imputation.",
      tuningTip: "Un petit k (1-3) capte les motifs locaux mais est bruité. Un k plus grand (10-20) lisse davantage mais peut perdre le signal local."
    },
    {
      impact: "Fonction de pondération : 'uniform' (poids égaux) ou 'distance' (les voisins les plus proches comptent davantage).",
      tuningTip: "Utilisez 'distance' pour de meilleurs résultats quand la densité des données varie."
    },
    {
      impact: "Métrique de distance qui gère les NaN en calculant des distances partielles.",
      tuningTip: "nan_euclidean ignore automatiquement les dimensions manquantes lors du calcul des distances."
    }
  ],
  math: {
    loss: "Imputation par voisinage pondérée par la distance",
    explanation: "Pour chaque valeur manquante, KNNImputer trouve les k échantillons les plus proches (à partir des variables non manquantes) et impute la valeur manquante par la moyenne (éventuellement pondérée) des valeurs correspondantes de ces voisins."
  },
  pros: [
    "Exploite les corrélations entre variables pour produire des imputations plus intelligentes",
    "Aucune hypothèse sur la distribution des données (non paramétrique)",
    "Gère plusieurs variables manquantes sur une même ligne"
  ],
  cons: [
    "Complexité de calcul en O(n²) sur les grands jeux de données (lent au-delà de 50K échantillons)",
    "Exige une mise à l’échelle des variables (StandardScaler) au préalable, sinon les distances n’ont pas de sens",
    "Sensible au fléau de la dimension dans les espaces de grande dimension"
  ],
  diagram: `flowchart TD
    A["Ligne avec une valeur manquante"] --> B["Mettre les variables à l’échelle"]
    B --> C["Distance aux autres lignes sur les variables non manquantes"]
    C --> D["Choisir les k plus proches voisins"]
    D --> E{"Les voisins ont-ils cette variable ?"}
    E -->|"oui"| F["Moyenne (ou pondération par la distance) de leurs valeurs"]
    E -->|"non"| G["Utiliser les donneurs suivants les plus proches"]
    G --> F
    F --> H["Combler le trou"]
    H --> I(["Jeu de données complet"])`
};
