export default {
  name: "Score de silhouette (évaluation du clustering)",
  category: "Métriques d’évaluation",
  task: ["Clustering", "Métriques", "Évaluation", "Non supervisé"],
  summary: "Mesure à quel point un objet ressemble à son propre cluster (cohésion) par rapport aux autres clusters (séparation). Varie de -1 à +1 : plus la valeur est élevée, plus les clusters sont bien définis et séparés.",
  intuition: "Le score de qualité d’amitié : pour chaque personne, on mesure « à quel point suis-je proche de mon groupe d’amis ? » moins « à quel point suis-je proche du groupe rival le plus proche ? ». Si vous êtes bien plus proche de vos amis que des inconnus, votre silhouette est élevée.",
  whenToUse: "Évaluer la qualité d’un clustering quand on ne dispose d’aucune étiquette de référence. Trouver le k optimal de K-Means par analyse de silhouette.",
  whenToAvoid: "Clusters de densité aux formes arbitraires (les clusters de DBSCAN peuvent obtenir des scores injustement bas, car la silhouette suppose des formes convexes).",
  parameters: [
    {
      impact: "Les points sont très proches de leur propre cluster et très éloignés des clusters voisins.",
      tuningTip: "Clusters compacts et bien séparés."
    },
    {
      impact: "Les points sont sur la frontière entre deux clusters, ou tout près.",
      tuningTip: "Clusters qui se chevauchent ou mauvaise valeur de k."
    },
    {
      impact: "Les points sont plus proches d’un autre cluster que de celui auquel ils sont affectés.",
      tuningTip: "Les points ont peut-être été affectés au mauvais cluster."
    }
  ],
  math: {
    loss: "Rapport cohésion / séparation",
    explanation: "a(i) = distance moyenne du point i à tous les autres points de son propre cluster (intra-cluster). b(i) = plus petite distance moyenne du point i à tous les points d’un autre cluster (cluster le plus proche). La formule normalise la différence dans [-1, +1]."
  },
  pros: [
    "Aucune étiquette de référence nécessaire : repose uniquement sur la qualité géométrique des clusters",
    "Fournit un score par échantillon, ce qui permet de repérer individuellement les points mal affectés",
    "Interprétation intuitive : plus c’est élevé, mieux c’est"
  ],
  cons: [
    "Coûteux en calcul : O(n²) calculs de distances par paires",
    "Biaisé en faveur des clusters convexes (sphériques) ; pénalise injustement les clusters de forme arbitraire"
  ],
  diagram: `flowchart TD
    A["Point i d’un cluster"] --> B["a = distance moyenne à son propre cluster"]
    A --> C["b = distance moyenne au cluster voisin le plus proche"]
    B --> D["s = (b − a) / max(a, b)"]
    C --> D
    D --> E["Répéter pour chaque point"]
    E --> F["Silhouette moyenne"]
    F --> G{"Comparer selon k"}
    G --> H(["Choisir le k au score le plus élevé"])`
};
