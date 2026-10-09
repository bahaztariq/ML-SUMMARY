export default {
  name: "Clustering K-Means",
  category: "Clustering non supervisé",
  task: ["Clustering", "Segmentation de clientèle"],
  summary: "Partitionne n observations en k clusters définis à l'avance, chaque point appartenant au cluster dont la moyenne (le centroïde) est la plus proche.",
  intuition: "L'expansion territoriale : plantez k drapeaux au hasard sur une carte. Chacun rejoint le drapeau le plus proche. Les drapeaux se déplacent au centre géométrique de leur nouveau groupe. On recommence jusqu'à ce que les drapeaux ne bougent plus.",
  whenToUse: "Segmentation de clientèle, regroupement de documents, quantification des couleurs d'une image, et création de variables de distance aux clusters pour des modèles supervisés en aval.",
  whenToAvoid: "Quand les clusters ont des formes courbes arbitraires (anneaux, lunes), des densités très variables, ou quand le nombre de clusters k est totalement imprévisible.",
  parameters: [
    {
      impact: "Nombre de clusters à former, et donc de centroïdes à générer.",
      tuningTip: "Utilisez la méthode du coude (inertie en fonction de k) ou l'analyse de silhouette pour trouver le k optimal."
    },
    {
      impact: "Méthode d'initialisation des centroïdes de départ.",
      tuningTip: "Gardez « k-means++ » pour éviter de converger vers des minima locaux sous-optimaux."
    },
    {
      impact: "Nombre d'exécutions de l'algorithme k-means avec des graines de centroïdes différentes.",
      tuningTip: "Des valeurs plus élevées garantissent une meilleure convergence, au prix d'un léger surcoût de calcul."
    }
  ],
  math: {
    loss: "Somme des carrés intra-cluster (WCSS)",
    explanation: "Alterne entre une étape d'espérance (affecter chaque point au centroïde $\\mu_j$ le plus proche) et une étape de maximisation (recalculer le centroïde $\\mu_j$ comme moyenne arithmétique de tous les membres affectés)."
  },
  pros: [
    "Algorithme rapide et évolutif, de complexité linéaire $O(n \\cdot k \\cdot d)$",
    "Frontières de clusters faciles à interpréter grâce aux cellules de Voronoï",
    "Classe facilement de nouveaux points en mesurant leur distance aux centroïdes appris"
  ],
  cons: [
    "L'utilisateur doit deviner k ou le régler expérimentalement à l'avance",
    "Suppose des clusters sphériques et isotropes (échoue sur des clusters allongés ou concentriques)",
    "Les valeurs aberrantes éloignent les centroïdes des vrais centres de densité"
  ],
  diagram: `flowchart TD
    A[("Données mises à l'échelle")] --> B["Initialiser k centroïdes (k-means++)"]
    B --> C["Affecter chaque point au centroïde le plus proche"]
    C --> D["Recalculer centroïde = moyenne des points affectés"]
    D --> E{"Les centroïdes ont-ils bougé ?"}
    E -->|"oui"| C
    E -->|"non"| F["Convergence : calculer l'inertie (WCSS)"]
    F --> G["Répéter pour plusieurs k : coude / silhouette"]
    G --> H(["Étiquettes finales des k clusters"])`
};
