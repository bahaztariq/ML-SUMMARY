export default {
  name: "SimpleImputer (imputation par moyenne / médiane / mode)",
  category: "Prétraitement et imputation",
  task: ["Prétraitement", "Données manquantes", "Imputation"],
  summary: "Remplit les valeurs manquantes avec un résumé statistique simple des valeurs présentes : moyenne, médiane, valeur la plus fréquente ou constante. La stratégie d’imputation de premier recours la plus rapide et la plus courante.",
  intuition: "Le remplissage par défaut : vous ne connaissez pas le salaire de quelqu’un ? Mettez le salaire moyen. Vous ne connaissez pas sa ville ? Mettez la ville la plus fréquente. Simple, rapide, mais pas toujours malin.",
  whenToUse: "Imputation de premier recours pour les données tabulaires. Quand les données manquent au hasard (MCAR), quand la vitesse compte, ou comme référence avant d’essayer des méthodes plus sophistiquées.",
  whenToAvoid: "Quand les valeurs manquantes sont systématiquement liées à d’autres variables (utilisez plutôt KNNImputer ou IterativeImputer).",
  parameters: [
    {
      impact: "Remplace les NaN par la moyenne de la colonne. Uniquement pour les variables numériques.",
      tuningTip: "Sensible aux valeurs aberrantes. Utilisez 'median' si les données sont asymétriques."
    },
    {
      impact: "Remplace les NaN par la médiane de la colonne. Robuste aux valeurs aberrantes.",
      tuningTip: "Le meilleur choix par défaut pour les variables numériques asymétriques."
    },
    {
      impact: "Remplace les NaN par la valeur la plus fréquente. Fonctionne pour les variables numériques comme catégorielles.",
      tuningTip: "La seule stratégie qui fonctionne pour les variables catégorielles de type texte."
    },
    {
      impact: "Remplace les NaN par une valeur constante choisie par l’utilisateur.",
      tuningTip: "Utilisez fill_value=0 ou fill_value='MISSING' pour marquer explicitement les valeurs imputées."
    }
  ],
  math: {
    loss: "Remplacement par un résumé statistique",
    explanation: "Calcule la statistique choisie (moyenne/médiane/mode) à partir des valeurs présentes dans chaque colonne, puis remplace toutes les entrées NaN par cette unique valeur calculée."
  },
  pros: [
    "Extrêmement rapide : calcul en O(n) par colonne",
    "Conserve la forme du jeu de données (aucune ligne ni colonne supprimée)",
    "S’intègre parfaitement dans les Pipelines sklearn"
  ],
  cons: [
    "Fausse la vraie variance des variables et la structure des corrélations",
    "L’imputation par la moyenne introduit un biais vers le centre et réduit la dispersion naturelle",
    "Ignore les relations entre variables (chaque colonne est imputée indépendamment)"
  ],
  diagram: `flowchart TD
    A["Colonne avec des valeurs manquantes"] --> B{"Type de colonne"}
    B -->|"numérique, asymétrique"| C["Médiane"]
    B -->|"numérique, symétrique"| D["Moyenne"]
    B -->|"catégorielle"| E["Plus fréquente / constante"]
    C --> F["Apprendre la valeur de remplissage sur l’entraînement"]
    D --> F
    E --> F
    F --> G["Ajouter éventuellement une colonne indicatrice de valeur manquante"]
    G --> H["Transformer l’entraînement et le test"]
    H --> I(["Plus aucun NaN"])`
};
