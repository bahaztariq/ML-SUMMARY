export default {
  name: "Sélection de variables (méthodes de filtre, wrapper et embarquées)",
  category: "Prétraitement et ingénierie des variables",
  task: ["Prétraitement", "Optimisation"],
  summary: "Choisir le sous-ensemble de variables d’entrée qui porte un vrai signal, afin de réduire le surapprentissage, d’accélérer l’entraînement et de rendre les modèles plus faciles à expliquer.",
  intuition: "Faire sa valise : impossible d’emporter toute sa garde-robe en voyage. Les méthodes de filtre écartent ce qui est manifestement inutile (le manteau d’hiver pour la plage), les méthodes wrapper essaient des tenues et gardent ce qui va bien ensemble, et les méthodes embarquées laissent la limite de poids de la compagnie aérienne (pénalité L1) vous forcer à abandonner les objets lourds et peu utiles.",
  whenToUse: "Jeux de données larges avec beaucoup de variables faibles, redondantes ou bruitées ; quand la latence d’inférence ou le coût de collecte de chaque variable compte ; quand les parties prenantes veulent une courte liste de facteurs explicatifs.",
  whenToAvoid: "Deep learning sur des images, de l’audio ou du texte bruts (le réseau apprend ses propres représentations), ou gains minimes sur des ensembles de variables déjà petits, où la sélection ajoute surtout de la variance et un risque de fuite.",
  parameters: [
    {
      impact: "Filtre (statistiques comme l’information mutuelle, le chi², la variance) : rapide et indépendant du modèle ; wrapper (RFE, sélection séquentielle) : précis mais coûteux ; embarquée (L1, importance des arbres) : sélectionne pendant l’entraînement.",
      tuningTip: "Commencez par un filtre peu coûteux pour éliminer le superflu, puis une méthode embarquée ; réservez les wrappers aux cas de moins de ~100 variables."
    },
    {
      impact: "Nombre de variables conservées.",
      tuningTip: "Traitez-le comme un hyperparamètre et réglez-le par validation croisée au lieu de le deviner."
    },
    {
      impact: "Statistique utilisée pour classer les variables dans les méthodes de filtre.",
      tuningTip: "f_classif / f_regression ne détectent que les relations linéaires ; mutual_info_classif détecte aussi les relations non linéaires."
    },
    {
      impact: "Seuil d’importance en dessous duquel les variables sont écartées.",
      tuningTip: "'median' conserve la moitié des variables ; avec Lasso, tout coefficient non nul est conservé, réglez donc plutôt alpha."
    }
  ],
  math: {
    loss: "Information mutuelle (filtre) / score de validation (wrapper) / pénalité L1 λ·Σ|wⱼ| (embarquée)",
    explanation: "L’information mutuelle mesure de combien la connaissance de la variable X réduit l’incertitude sur la cible Y ; elle n’est nulle que si les deux sont indépendantes. Les méthodes wrapper explorent plutôt des sous-ensembles de variables en réentraînant et en évaluant le modèle ; les méthodes embarquées comme Lasso ramènent exactement à zéro les poids inutiles pendant l’optimisation."
  },
  pros: [
    "Réduit le surapprentissage et la variance, surtout quand il y a plus de variables que d’échantillons",
    "Entraînement et inférence plus rapides, pipelines de données moins coûteux",
    "Produit des modèles plus simples et plus explicables",
    "Supprime les colonnes redondantes et bruitées qui perturbent les modèles à base de distances"
  ],
  cons: [
    "Sélectionner sur le jeu de données complet avant la validation croisée provoque une fuite et gonfle les scores",
    "Les filtres univariés ratent les variables qui ne comptent qu’en interaction",
    "Les méthodes wrapper sont coûteuses en calcul (nombreux réentraînements du modèle)",
    "Les sous-ensembles sélectionnés peuvent être instables d’un pli à l’autre quand les variables sont corrélées"
  ],
  diagram: `flowchart TD
    A["Toutes les variables candidates"] --> B["Filtre : écarter les variables constantes et à faible IM"]
    B --> C{"Famille de méthodes"}
    C -->|"wrapper"| D["Entraîner le modèle sur un sous-ensemble"]
    D --> E["Évaluer le sous-ensemble par validation croisée"]
    E --> F{"Retirer une variable aide-t-il ?"}
    F -->|"oui"| D
    F -->|"non"| G["Sous-ensemble sélectionné"]
    C -->|"embarquée"| H["Entraîner avec L1 ou importances des arbres"]
    H --> I["Garder les variables au-dessus du seuil"]
    I --> G
    G --> J["Modèle final sur les variables sélectionnées"]`
};
