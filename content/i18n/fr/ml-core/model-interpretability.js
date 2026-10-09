export default {
  name: "Interprétabilité des modèles (SHAP et importance par permutation)",
  category: "Théorie du ML et diagnostic",
  task: ["Évaluation", "Définition"],
  summary: "Des techniques qui expliquent quelles variables pilotent les prédictions d’un modèle, globalement sur tout le jeu de données et localement pour une prédiction donnée, afin de pouvoir déboguer, faire confiance aux modèles et les auditer.",
  intuition: "La note du projet de groupe : l’équipe a obtenu 90/100, mais qui a apporté quoi ? SHAP partage équitablement le mérite en imaginant toutes les combinaisons possibles de coéquipiers et en mesurant de combien la note change quand chaque personne rejoint le groupe. L’importance par permutation pose une question plus simple : si l’on remplaçait un coéquipier par un inconnu pris au hasard, de combien la note chuterait-elle ?",
  whenToUse: "Domaines réglementés (crédit, assurance, santé) qui exigent des explications, débogage de modèles suspects (fuite, corrélations fallacieuses), communication des facteurs explicatifs aux parties prenantes, et codes de motif par client.",
  whenToAvoid: "Comme preuve de causalité (les explications décrivent le modèle, pas le monde), ou sans précaution avec des variables fortement corrélées, où l’importance se partage ou s’attribue mal entre les variables jumelles.",
  parameters: [
    {
      impact: "TreeExplainer est exact et rapide pour les ensembles d’arbres ; LinearExplainer pour les modèles linéaires ; KernelExplainer est indépendant du modèle mais lent.",
      tuningTip: "Pour XGBoost/LightGBM/Random Forest, utilisez toujours TreeExplainer : il calcule les valeurs SHAP exactes en temps polynomial."
    },
    {
      impact: "Distribution de référence qui définit la prédiction « moyenne » à laquelle les variables sont comparées.",
      tuningTip: "Un échantillon représentatif de 100 à 1 000 lignes (ou un résumé shap.kmeans) garde KernelExplainer raisonnable en temps de calcul."
    },
    {
      impact: "Nombre de fois où chaque variable est mélangée ; la moyenne lisse le hasard.",
      tuningTip: "Utilisez 10 ou plus et indiquez l’écart-type ; calculez-la sur un jeu de validation, pas sur les données d’entraînement, pour mesurer la vraie valeur prédictive."
    },
    {
      impact: "Métrique dont la baisse définit l’importance.",
      tuningTip: "Utilisez la même métrique que celle que vous optimisez en production (par ex. 'roc_auc' ou 'neg_mean_absolute_error')."
    }
  ],
  math: {
    loss: "Attribution par valeurs de Shapley",
    explanation: "La valeur SHAP φⱼ de la variable j est sa contribution marginale moyenne à la prédiction sur tous les ordres possibles des variables. Les attributions sont additives : valeur de base + Σφⱼ est exactement égal à la sortie du modèle pour cet échantillon. L’importance par permutation est plus simple : Score(original) − Score(variable j mélangée)."
  },
  pros: [
    "SHAP donne à la fois une importance globale et des explications locales, prédiction par prédiction",
    "Additif et théoriquement fondé (cohérence, exactitude locale)",
    "L’importance par permutation est indépendante du modèle et mesurée sur des données mises de côté",
    "Met au jour les fuites de données et les raccourcis fallacieux avant le déploiement"
  ],
  cons: [
    "KernelSHAP est très lent sur les grands jeux de données et avec beaucoup de variables",
    "Les variables corrélées partagent ou faussent l’importance dans les deux méthodes",
    "Les explications décrivent le comportement du modèle, pas des effets causaux",
    "Les importances des arbres fondées sur l’impureté (MDI) sont biaisées en faveur des variables à forte cardinalité"
  ],
  diagram: `flowchart TD
    A["Modèle entraîné + données de validation"] --> B{"Question posée"}
    B -->|"globale : quelles variables comptent ?"| C["Mélanger une colonne de variable"]
    C --> D["Réévaluer le modèle sur la validation"]
    D --> E["Importance = baisse du score"]
    E --> F{"D’autres variables ?"}
    F -->|"oui"| C
    F -->|"non"| G["Classement d’importance des variables"]
    B -->|"locale : pourquoi cette prédiction ?"| H["Comparer des coalitions de variables à la référence"]
    H --> I["Valeur SHAP par variable"]
    I --> J["Valeur de base + Σ SHAP = prédiction"]
    J --> K(["Codes de motif / graphique en cascade"])`
};
