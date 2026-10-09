export default {
  name: "Qu’est-ce que la classification ?",
  category: "Tâches fondamentales",
  task: ["Définition", "Classification", "Supervisé"],
  summary: "Une tâche d’apprentissage supervisé dans laquelle un algorithme apprend à ranger des données d’entrée dans une ou plusieurs classes (catégories) discrètes prédéfinies.",
  intuition: "Trier le courrier dans des casiers : quand une enveloppe arrive, vous lisez la ville du destinataire et la déposez dans le casier prévu : « New York », « Londres » ou « Tokyo ». Elle ne peut aller que dans des casiers distincts — jamais « à mi-chemin entre New York et Londres ».",
  whenToUse: "Lorsque le résultat visé est catégoriel : Oui/Non, Fraude/Légitime, Chien/Chat/Oiseau, Maligne/Bénigne, Départ/Fidélisation.",
  whenToAvoid: "Lorsque la cible est un nombre continu (par ex. le prix d’une maison en euros ou une température en degrés — utilisez plutôt la régression !).",
  parameters: [
    {
      impact: "Choisit entre deux issues mutuellement exclusives : Vrai/Faux, 0/1.",
      tuningTip: "Évaluez avec la ROC-AUC, la précision et le rappel plutôt qu’avec l’exactitude brute."
    },
    {
      impact: "Prédit une seule étiquette parmi trois classes mutuellement exclusives ou plus (par ex. Rouge, Vert, Bleu).",
      tuningTip: "Utilisez la perte d’entropie croisée catégorielle et une couche de sortie Softmax."
    },
    {
      impact: "Une observation peut appartenir à plusieurs catégories à la fois (par ex. un film étiqueté à la fois « Action » et « Science-fiction »).",
      tuningTip: "Utilisez une activation Sigmoïde indépendante sur chaque neurone de sortie."
    }
  ],
  math: {
    loss: "Perte d’entropie croisée (log-loss) : L = -∑ y_c · log(p_c)",
    explanation: "Les modèles de classification calculent une probabilité de confiance pour chaque classe candidate c, puis choisissent la classe dont la probabilité a posteriori est maximale."
  },
  pros: [
    "Se traduit directement en décisions métier binaires ou discrètes exploitables (accepter / refuser un prêt)",
    "Dispose d’un cadre d’évaluation riche (matrice de confusion, précision, rappel, F1-score, courbes ROC)",
    "Produit des scores de confiance calibrés pour fixer un seuil sur les cas limites risqués"
  ],
  cons: [
    "Fortement perturbée par le déséquilibre des classes (par ex. 99,9 % de transactions légitimes contre 0,1 % de fraudes)",
    "Le choix du seuil (0,5 par défaut) doit être ajusté selon la tolérance au risque du métier"
  ],
  diagram: `flowchart TD
    A[("Exemples étiquetés : variables + classe")] --> B["Entraîner le classifieur"]
    B --> C["Apprendre la frontière de décision"]
    N["Nouvel exemple"] --> D["Le modèle renvoie des probabilités par classe"]
    C --> D
    D --> E{"Probabilité ≥ seuil ?"}
    E -->|"oui"| F["Prédire la classe positive"]
    E -->|"non"| G["Prédire la classe négative"]
    F --> H["Évaluer : matrice de confusion, F1, ROC-AUC"]
    G --> H`
};
