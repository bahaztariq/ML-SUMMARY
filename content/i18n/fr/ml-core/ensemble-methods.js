export default {
  name: "Méthodes d’ensemble (bagging vs boosting vs stacking)",
  category: "Théorie du ML et optimisation",
  task: ["Classification", "Régression", "Architecture"],
  summary: "Combiner de nombreux modèles en un prédicteur plus fort : le bagging fait la moyenne de modèles indépendants pour réduire la variance, le boosting enchaîne des modèles qui corrigent les erreurs des précédents pour réduire le biais, et le stacking apprend à mélanger différents types de modèles.",
  intuition: "Trois façons de diriger une équipe de quiz : le bagging interroge 100 élèves qui ont chacun révisé un morceau tiré au hasard du manuel, puis fait voter. Le boosting fait répondre les élèves à la suite, chacun s’entraînant spécifiquement sur les questions ratées par le précédent. Le stacking embauche un capitaine qui a appris à quel coéquipier se fier selon le type de question.",
  whenToUse: "Presque tout problème de prédiction sur données tabulaires où la précision compte : le bagging (Random Forest) comme référence robuste et peu exigeante en réglages, le boosting (XGBoost/LightGBM) pour la meilleure précision, le stacking pour gagner les derniers points en compétition.",
  whenToAvoid: "Contraintes strictes de latence ou de mémoire, obligation légale d’un modèle unique interprétable, ou modèles de base tous fortement corrélés (combiner des erreurs identiques n’aide pas).",
  parameters: [
    {
      impact: "Bagging = en parallèle, réduit la variance ; boosting = séquentiel, réduit le biais ; stacking = méta-apprenant au-dessus de modèles hétérogènes.",
      tuningTip: "Apprenants de base profonds qui surapprennent → bagging. Apprenants peu profonds qui sous-apprennent (souches) → boosting."
    },
    {
      impact: "Nombre de modèles de base. Ajouter des modèles en bagging ne nuit jamais à la précision ; trop de tours de boosting peuvent surapprendre.",
      tuningTip: "En boosting, choisissez une valeur élevée et utilisez l’arrêt précoce (early stopping) sur un jeu de validation."
    },
    {
      impact: "Réduit la contribution de chaque nouveau modèle.",
      tuningTip: "Une valeur plus faible (0.01 à 0.05) avec plus d’estimateurs généralise mieux, au prix d’un entraînement plus long."
    },
    {
      impact: "Méta-modèle entraîné sur les prédictions hors pli (out-of-fold) des modèles de base.",
      tuningTip: "Gardez-le simple et régularisé ; un méta-modèle complexe surapprend les prédictions de base."
    },
    {
      impact: "Le vote dur compte les étiquettes ; le vote souple fait la moyenne des probabilités.",
      tuningTip: "Préférez 'soft' quand les modèles de base produisent des probabilités raisonnablement calibrées."
    }
  ],
  math: {
    loss: "Réduction de la variance (bagging) / minimisation de la perte étape par étape (boosting)",
    explanation: "La moyenne de B modèles de corrélation deux à deux ρ a une variance ρσ² + (1−ρ)σ²/B : des modèles diversifiés réduisent donc la variance. Le boosting ajoute un nouvel apprenant faible h_m ajusté sur les résidus (gradient négatif) de l’ensemble courant, multiplié par le taux d’apprentissage η, ce qui réduit progressivement le biais."
  },
  pros: [
    "Régulièrement parmi les méthodes les plus précises sur les données tabulaires",
    "Le bagging est hautement parallélisable et résiste au surapprentissage",
    "Le boosting peut transformer des apprenants très faibles en un modèle fort",
    "Le stacking exploite les forces complémentaires de différentes familles d’algorithmes"
  ],
  cons: [
    "Modèles plus gros et plus lents qu’un apprenant unique",
    "Plus difficiles à interpréter qu’un seul arbre ou un seul modèle linéaire",
    "Le boosting est sensible aux étiquettes bruitées et demande un réglage soigneux",
    "Le stacking exige des prédictions hors pli pour éviter les fuites, ce qui ajoute de la complexité"
  ],
  diagram: `flowchart TD
    A["Données d’entraînement"] --> B{"Stratégie d’ensemble"}
    B -->|"bagging"| C["Échantillons bootstrap en parallèle"]
    C --> D["Modèles profonds indépendants"]
    D --> E["Moyenne / vote majoritaire → variance plus faible"]
    B -->|"boosting"| F["Ajuster un modèle faible"]
    F --> G["Calculer les résidus / repondérer les erreurs"]
    G --> H["Ajuster le modèle suivant sur les erreurs"]
    H -->|"répéter m fois"| G
    H --> I["Somme pondérée → biais plus faible"]
    B -->|"stacking"| J["Modèles de base variés"]
    J --> K["Prédictions hors pli"]
    K --> L["Un méta-apprenant combine les prédictions"]`
};
