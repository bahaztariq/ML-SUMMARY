export default {
  name: "DBSCAN (clustering spatial fondé sur la densité)",
  category: "Clustering non supervisé",
  task: ["Clustering", "Détection d'anomalies", "Non supervisé"],
  summary: "Un algorithme de clustering fondé sur la densité, qui regroupe les points serrés dans des régions denses et marque comme bruit (valeurs aberrantes) les points situés dans des régions peu denses. Il n'est pas nécessaire de fixer à l'avance le nombre de clusters k.",
  intuition: "Les lumières des villes vues de l'espace : les amas denses de lampadaires forment naturellement des villes. Les fermes isolées au milieu des champs vides sont du bruit, des valeurs aberrantes. DBSCAN trouve les villes sans que vous ayez à lui dire combien il y en a.",
  whenToUse: "Quand les clusters ont des formes arbitraires (anneaux, spirales, amas irréguliers). Quand vous ne connaissez pas k à l'avance. Quand repérer les valeurs aberrantes est aussi important que trouver les clusters.",
  whenToAvoid: "Quand les clusters ont des densités très différentes (un cluster lâche et un cluster très serré). Quand les données sont en très grande dimension (les métriques de distance deviennent peu fiables).",
  parameters: [
    {
      impact: "Distance maximale entre deux échantillons pour qu'ils soient considérés comme voisins.",
      tuningTip: "Tracez un graphique des k-distances (distances aux k plus proches voisins, triées) et repérez le « coude » : c'est votre eps optimal."
    },
    {
      impact: "Nombre minimal de points dans le rayon eps pour former un point central (core point) dense.",
      tuningTip: "Règle empirique : min_samples ≥ nombre_de_variables + 1. Des valeurs plus élevées donnent des clusters plus stricts et moins nombreux."
    }
  ],
  math: {
    loss: "Connectivité par accessibilité en densité (density-reachability)",
    explanation: "Un point p est un point central (core point) si au moins min_samples points se trouvent dans son ε-voisinage. Les points frontières sont à moins de ε d'un point central sans être eux-mêmes centraux. Les points de bruit ne sont ni centraux ni frontières. Les clusters sont les composantes connexes des points accessibles depuis les points centraux."
  },
  pros: [
    "Découvre des clusters de forme arbitraire (contrairement à K-Means, qui suppose des clusters sphériques)",
    "Détermine automatiquement le nombre de clusters à partir de la densité des données",
    "Détection intégrée du bruit et des valeurs aberrantes : les points étiquetés -1 sont des anomalies",
    "Pas besoin de fixer k à l'avance"
  ],
  cons: [
    "Peine quand les clusters ont des densités très différentes (un seul eps ne convient pas à tous)",
    "Les performances se dégradent fortement dans les espaces de grande dimension",
    "Sensible aux hyperparamètres eps et min_samples"
  ],
  diagram: `flowchart TD
    A[("Données mises à l'échelle")] --> B["Pour chaque point, compter les voisins à moins de ε"]
    B --> C{"Voisins ≥ min_samples ?"}
    C -->|"oui"| D["Point central"]
    C -->|"non"| E{"À moins de ε d'un point central ?"}
    E -->|"oui"| F["Point frontière"]
    E -->|"non"| G(["Bruit / valeur aberrante : étiquette −1"])
    D --> H["Étendre le cluster via les points centraux accessibles en densité"]
    F --> H
    H --> I(["Clusters de forme arbitraire"])`
};
