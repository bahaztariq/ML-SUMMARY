export default {
  name: "Arbre de décision (CART)",
  category: "Modèles à base d'arbres",
  task: ["Classification", "Régression"],
  summary: "Un modèle supervisé non paramétrique qui apprend à partir des données des règles de décision hiérarchiques de type si-alors-sinon, formant une structure en arbre qui découpe récursivement l'espace des variables en régions rectangulaires.",
  intuition: "Le jeu des 20 questions : « L'âge du client est-il > 30 ans ? » → Oui → « Son revenu est-il > 80 000 $ ? » → Oui → « Prédiction : il achètera le produit premium. » Chaque question crée un découpage, et les réponses créent des branches jusqu'à ce qu'une décision finale soit atteinte dans une feuille.",
  whenToUse: "Quand une interprétabilité totale du modèle est exigée (conformité médicale, juridique, financière). Comme brique de base pour comprendre la forêt aléatoire et le gradient boosting.",
  whenToAvoid: "Quand vous avez besoin d'une grande précision sur des jeux de données complexes (un arbre seul surapprend facilement). Utilisez plutôt des méthodes d'ensemble (forêt aléatoire, XGBoost).",
  parameters: [
    {
      impact: "Profondeur maximale de l'arbre.",
      tuningTip: "Un arbre sans limite surapprend de façon catastrophique. Choisissez entre 3 et 10 pour l'interprétabilité et la généralisation."
    },
    {
      impact: "Fonction qui mesure la qualité d'un découpage.",
      tuningTip: "« gini » et « entropy » produisent des arbres presque identiques. Gini est légèrement plus rapide à calculer."
    },
    {
      impact: "Nombre minimal d'échantillons requis dans une feuille.",
      tuningTip: "Augmentez-le à 5–20 pour éviter les feuilles contenant un seul échantillon (surapprentissage extrême)."
    },
    {
      impact: "Nombre de variables considérées à chaque découpage.",
      tuningTip: "Dans une forêt aléatoire, on le fixe à « sqrt » pour décorréler les arbres."
    }
  ],
  math: {
    loss: "Gain d'information = impureté du parent − moyenne pondérée des impuretés des enfants",
    explanation: "À chaque nœud, l'algorithme cherche la variable et le seuil qui maximisent le gain d'information (autrement dit, qui réduisent le plus l'impureté). Ce processus glouton et récursif construit l'arbre de la racine jusqu'aux feuilles."
  },
  pros: [
    "Interprétabilité limpide : l'arbre peut s'afficher sous forme de règles si-alors lisibles par un humain",
    "Ne nécessite aucune mise à l'échelle ni normalisation des variables",
    "Gère naturellement les variables numériques comme catégorielles",
    "La brique de base de toutes les méthodes d'ensemble à base d'arbres"
  ],
  cons: [
    "Extrêmement sujet au surapprentissage (forte variance) sans élagage ni limite de profondeur",
    "Instable : de petites modifications des données peuvent produire des arbres complètement différents",
    "Incapable d'extrapoler au-delà de la plage des données d'entraînement (prédictions en escalier)"
  ],
  diagram: `flowchart TD
    A[("Nœud contenant des échantillons d'entraînement")] --> B["Essayer chaque variable et chaque seuil"]
    B --> C["Calculer la baisse d'impureté (Gini / entropie / MSE)"]
    C --> D["Choisir le meilleur découpage"]
    D --> E["Enfant gauche : variable ≤ seuil"]
    D --> F["Enfant droit : variable supérieure au seuil"]
    E --> G{"Critère d'arrêt atteint ? (max_depth, min_samples, pur)"}
    F --> G
    G -->|"non"| B
    G -->|"oui"| H(["Feuille : classe majoritaire ou valeur moyenne"])`
};
