export default {
  name: "Clustering hiérarchique (agglomératif)",
  category: "Clustering",
  task: ["Clustering"],
  summary: "Construit un arbre (dendrogramme) de clusters imbriqués en fusionnant à répétition les deux groupes les plus proches, ce qui permet de choisir le nombre de clusters après coup.",
  intuition: "L'arbre généalogique : au départ, chaque personne forme sa propre famille. On réunit les deux personnes les plus semblables en un foyer, puis les foyers les plus proches en familles élargies, et ainsi de suite jusqu'à ce que tout le monde forme un seul clan. Couper l'arbre à la hauteur choisie donne le niveau de regroupement souhaité.",
  whenToUse: "Jeux de données petits à moyens (moins de ~10 000 points) lorsque vous ne connaissez pas le nombre de clusters à l'avance, voulez visualiser une structure imbriquée (taxonomies, expression génique, segments de clientèle) ou avez besoin d'un résultat déterministe.",
  whenToAvoid: "Grands jeux de données — la mémoire est en O(n²) et le temps en O(n² log n), voire pire. Aussi lorsque les clusters sont définis par la densité avec du bruit (DBSCAN fait mieux) ou que vous devez affecter de nouveaux points à des clusters à moindre coût.",
  parameters: [
    {
      impact: "Manière de mesurer la distance entre deux clusters (ward, complete, average, single).",
      tuningTip: "« ward » donne des clusters compacts et équilibrés (distance euclidienne uniquement). « single » trouve des chaînes allongées mais souffre de l'effet de chaînage ; « average » est un compromis robuste."
    },
    {
      impact: "Nombre de clusters auquel couper le dendrogramme.",
      tuningTip: "Mettez-le à None et utilisez distance_threshold, ou repérez dans le dendrogramme le plus grand écart vertical."
    },
    {
      impact: "Hauteur de coupe : les clusters plus éloignés que ce seuil ne sont pas fusionnés.",
      tuningTip: "À utiliser à la place de n_clusters lorsqu'une échelle de distance naturelle existe dans votre domaine."
    },
    {
      impact: "Métrique de distance entre points individuels.",
      tuningTip: "Utilisez « cosine » pour des embeddings de texte (avec un lien average ou complete)."
    }
  ],
  math: {
    loss: "Critère de fusion glouton (augmentation de la variance intra-cluster pour Ward)",
    explanation: "À chaque étape, l'algorithme fusionne la paire de clusters dont la distance de lien est la plus faible. Le critère de Ward choisit la fusion qui augmente le moins la somme totale des carrés intra-cluster, à l'image de l'objectif de K-Means. Les hauteurs de fusion forment l'axe vertical du dendrogramme."
  },
  pros: [
    "Pas besoin de choisir k à l'avance — le dendrogramme montre toutes les granularités",
    "Déterministe : les mêmes données produisent toujours le même arbre",
    "Le dendrogramme est une visualisation très interprétable",
    "Fonctionne avec n'importe quelle métrique de distance (avec les liens autres que Ward)"
  ],
  cons: [
    "Une mémoire en O(n²) le rend inutilisable au-delà de quelques dizaines de milliers de points",
    "Les fusions gloutonnes ne peuvent jamais être annulées : les erreurs précoces se propagent",
    "Sensible à la mise à l'échelle des variables et aux valeurs aberrantes",
    "Pas de predict() natif pour de nouveaux points jamais vus"
  ],
  diagram: `flowchart TD
    A[("n points de données mis à l'échelle")] --> B["Départ : chaque point forme son propre cluster"]
    B --> C["Calculer les distances entre clusters deux à deux (lien)"]
    C --> D["Fusionner les deux clusters les plus proches"]
    D --> E["Noter la hauteur de fusion dans le dendrogramme"]
    E --> F{"Ne reste-t-il qu'un seul cluster ?"}
    F -->|"non"| C
    F -->|"oui"| G["Dendrogramme complet"]
    G --> H["Couper à une hauteur ou à n_clusters"]
    H --> I(["Étiquettes de clusters finales"])`
};
