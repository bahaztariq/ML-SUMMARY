export default {
  name: "t-SNE et UMAP",
  category: "Réduction de dimension",
  task: ["Réduction de dimension", "Visualisation de données", "Non supervisé"],
  summary: "Méthodes non linéaires de réduction de dimension qui préservent les voisinages locaux, utilisées principalement pour visualiser des données de grande dimension en 2D ou en 3D.",
  intuition: "Le plan de table d'une soirée : vous avez 1 000 invités décrits par des centaines de traits et seulement une salle en 2D. Impossible de respecter toutes les distances exactement, alors vous vous concentrez sur une règle : les amis doivent s'asseoir près de leurs amis. t-SNE et UMAP déplacent les invités dans la salle jusqu'à ce que les amis les plus proches de chacun soient assis à côté de lui — les inconnus lointains peuvent se retrouver n'importe où.",
  whenToUse: "Explorer et visualiser des embeddings, des caractéristiques d'images, des données de génomique unicellulaire ou toute donnée de grande dimension afin de repérer des clusters, des valeurs aberrantes et du bruit d'étiquetage. UMAP peut aussi servir d'étape de prétraitement avant un clustering.",
  whenToAvoid: "Comme étape d'ingénierie des variables pour des modèles supervisés (t-SNE n'a pas de transform pour de nouvelles données), lorsque vous devez interpréter les distances ou les tailles de clusters entre groupes (elles n'ont pas de sens), ou lorsqu'une structure linéaire suffit (utilisez l'ACP).",
  parameters: [
    {
      impact: "Nombre effectif de voisins pris en compte par chaque point.",
      tuningTip: "Essayez de 5 à 50. Les petites valeurs mettent l'accent sur la structure très locale ; la valeur doit être inférieure au nombre de points."
    },
    {
      impact: "Taille du voisinage local utilisé pour construire le graphe.",
      tuningTip: "Une petite valeur (5–15) révèle de fins clusters locaux ; une grande valeur (50–200) préserve davantage la structure globale."
    },
    {
      impact: "À quel point les points peuvent être serrés dans l'embedding.",
      tuningTip: "Plus bas (0,0–0,05) pour des clusters plus compacts avant un clustering ; plus haut (0,5) pour une répartition visuelle plus homogène."
    },
    {
      impact: "Dimension de sortie.",
      tuningTip: "2 ou 3 pour la visualisation ; UMAP peut aller jusqu'à 10–50 en entrée d'un clustering en aval."
    }
  ],
  math: {
    loss: "Divergence KL (t-SNE) / entropie croisée floue (UMAP)",
    explanation: "t-SNE convertit les distances en grande dimension en probabilités de voisinage p_ij (gaussiennes) et celles en faible dimension en q_ij (loi de Student à queue lourde), puis déplace les points par descente de gradient pour minimiser la divergence KL. La queue lourde permet aux points dissemblables de s'éloigner fortement, ce qui évite l'entassement. UMAP construit un graphe k-NN flou et optimise une entropie croisée entre graphes, ce qui est plus rapide et conserve davantage la structure globale."
  },
  pros: [
    "Révèle une structure de clusters non linéaire que l'ACP ne voit pas",
    "Produit des cartes 2D visuellement frappantes et interprétables",
    "UMAP est rapide, passe à l'échelle sur des millions de points et propose transform() pour de nouvelles données",
    "Utile pour vérifier la cohérence d'embeddings et repérer des erreurs d'étiquetage"
  ],
  cons: [
    "Les distances entre clusters et la taille des clusters n'ont pas de sens",
    "Les résultats dépendent fortement des hyperparamètres et de la graine aléatoire",
    "t-SNE est lent (au mieux O(n log n)) et ne peut pas projeter de nouveaux points",
    "Facile à surinterpréter — des clusters apparents peuvent être des artefacts"
  ],
  diagram: `flowchart TD
    A[("Données de grande dimension")] --> B["Mettre à l'échelle, ACP facultative vers ~50 dimensions"]
    B --> C["Trouver les plus proches voisins de chaque point"]
    C --> D["Similarités en grande dimension p_ij / graphe k-NN flou"]
    D --> E["Initialisation 2D aléatoire ou spectrale"]
    E --> F["Similarités en faible dimension q_ij (courbe de Student)"]
    F --> G["Pas de gradient : minimiser KL / entropie croisée"]
    G --> H{"Convergence ?"}
    H -->|"non"| F
    H -->|"oui"| I(["Carte 2D : les voisins restent proches"])`
};
