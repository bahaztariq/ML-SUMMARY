export default {
  name: "Fléau de la dimension",
  category: "Théorie du ML et diagnostic",
  task: ["Définition", "Prétraitement"],
  summary: "L’ensemble des problèmes qui apparaissent quand le nombre de variables augmente : les données deviennent exponentiellement clairsemées, les distances perdent leur sens et les modèles ont besoin de beaucoup plus d’échantillons pour généraliser.",
  intuition: "Retrouver un ami : dans un couloir de 100 m (1D), vous trouvez vite votre ami. Sur un terrain de 100 m × 100 m (2D), cela prend bien plus longtemps, et dans un bâtiment cubique de 100 m de côté (3D), c’est encore plus difficile. Chaque nouvelle dimension multiplie l’espace à explorer : le même nombre de personnes (échantillons) se retrouve dispersé sans espoir, et les « plus proches » voisins ne sont pas vraiment proches.",
  whenToUse: "Comme grille de diagnostic dès que vous avez beaucoup de variables par rapport au nombre d’échantillons (génomique, texte, encodages one-hot très larges), quand k-NN / k-Means / SVM-RBF se dégradent à mesure qu’on ajoute des variables, ou pour décider s’il faut réduire la dimension.",
  whenToAvoid: "Sans objet en tant que concept, mais ne l’appliquez pas à outrance : les données réelles vivent souvent sur une variété de faible dimension, ce qui explique que le deep learning fonctionne quand même sur des images d’un million de pixels.",
  parameters: [
    {
      impact: "Le volume de l’espace des variables croît exponentiellement avec d ; le nombre d’échantillons nécessaires pour garder la même densité croît comme kᵈ.",
      tuningTip: "Surveillez le ratio n_samples / n_features ; en dessous de ~10 pour des modèles simples, envisagez une sélection ou une réduction."
    },
    {
      impact: "Les distances L2 se concentrent (toutes les paires semblent aussi éloignées) en grande dimension.",
      tuningTip: "Essayez la similarité cosinus pour des données creuses de type texte, ou la distance L1 (Manhattan), qui se dégrade plus lentement."
    },
    {
      impact: "PCA, sélection de variables, embeddings ou UMAP compressent l’espace vers ses directions informatives.",
      tuningTip: "En premier essai, gardez assez de composantes PCA pour expliquer 90 à 95 % de la variance."
    },
    {
      impact: "Contraint les modèles pour qu’ils ne puissent pas exploiter les nombreuses directions fallacieuses disponibles en grande dimension.",
      tuningTip: "Quand p est bien plus grand que n, les modèles linéaires régularisés L1/L2 sont souvent la référence la plus solide."
    }
  ],
  math: {
    loss: "Concentration des distances",
    explanation: "Pour des points aléatoires en dimension d, l’écart entre le voisin le plus éloigné et le plus proche diminue par rapport à la distance au plus proche quand d augmente : la notion de « plus proche » perd son sens. De même, la fraction du volume d’un hypercube unité située dans une fine couche près de sa surface vaut 1 − (1 − 2ε)ᵈ, qui tend vers 1 : presque tous les points sont près des bords."
  },
  pros: [
    "Explique pourquoi k-NN, k-Means et les noyaux RBF échouent sur des données brutes très larges",
    "Justifie la sélection de variables, la PCA, les embeddings et la régularisation",
    "Indique combien de données il faut avant d’ajouter des variables",
    "Aide à diagnostiquer le surapprentissage causé par de nombreuses variables fallacieuses"
  ],
  cons: [
    "Difficile à visualiser ou à raisonner au-delà de 3 dimensions",
    "L’ampleur de l’effet dépend de la dimension intrinsèque (et non nominale), difficile à mesurer",
    "Les règles empiriques sur le nombre d’échantillons sont approximatives et dépendent du modèle"
  ],
  diagram: `flowchart TD
    A["Ajouter des variables (d ↑)"] --> B["Le volume de l’espace croît exponentiellement"]
    B --> C["Un nombre fixe d’échantillons devient clairsemé"]
    C --> D["Les distances se concentrent : tous les points semblent aussi éloignés"]
    C --> E["Plus de motifs fallacieux ajustés par hasard"]
    D --> F["k-NN, k-Means, noyaux RBF se dégradent"]
    E --> G["Surapprentissage / variance élevée"]
    F --> H{"Remèdes"}
    G --> H
    H --> I["Sélection de variables"]
    H --> J["PCA / embeddings / UMAP"]
    H --> K["Régularisation ou plus de données"]`
};
