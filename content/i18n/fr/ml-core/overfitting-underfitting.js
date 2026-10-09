export default {
  name: "Surapprentissage vs sous-apprentissage",
  category: "Théorie du ML et diagnostic",
  task: ["Définition", "Diagnostic", "Réglage du modèle"],
  summary: "Les deux modes d’échec fondamentaux des modèles d’apprentissage automatique. Surapprentissage : le modèle mémorise le bruit d’entraînement et échoue sur de nouvelles données. Sous-apprentissage : le modèle est trop simple pour capturer le motif sous-jacent.",
  intuition: "L’analogie de l’élève : le sous-apprentissage, c’est l’élève qui a à peine révisé et qui rate à la fois les devoirs ET l’examen. Le surapprentissage, c’est l’élève qui a appris par cœur chaque réponse des devoirs mais ne sait résoudre aucun nouveau problème d’examen, car il n’a jamais compris les notions sous-jacentes.",
  whenToUse: "Diagnostiquer les écarts de performance d’un modèle. Décider s’il faut augmenter ou réduire la complexité du modèle.",
  whenToAvoid: "Sans objet : ce sont des concepts de diagnostic fondamentaux qui s’appliquent à tout modèle de ML.",
  parameters: [
    {
      impact: "L’exactitude d’entraînement est très élevée (par ex. 99 %) mais l’exactitude de validation est nettement plus basse (par ex. 75 %).",
      tuningTip: "Remèdes : ajouter des données d’entraînement, augmenter la régularisation (L1/L2), réduire la complexité du modèle (moins de couches, d’arbres ou de variables), utiliser le dropout ou l’arrêt précoce."
    },
    {
      impact: "Les exactitudes d’entraînement et de validation sont toutes deux faibles (par ex. 60 % chacune).",
      tuningTip: "Remèdes : utiliser un modèle plus complexe, ajouter des variables plus informatives, diminuer la régularisation, entraîner plus longtemps ou construire des variables d’interaction."
    },
    {
      impact: "Les exactitudes d’entraînement et de validation sont toutes deux élevées et proches l’une de l’autre.",
      tuningTip: "Le point optimal ! Le modèle généralise bien aux données jamais vues."
    }
  ],
  math: {
    loss: "Décomposition biais-variance",
    explanation: "Sous-apprentissage = biais élevé (modèle trop rigide, hypothèses erronées). Surapprentissage = variance élevée (modèle trop flexible, qui capture le bruit). Le modèle optimal minimise l’erreur totale en équilibrant les deux."
  },
  pros: [
    "Le cadre de diagnostic le plus fondamental de tout l’apprentissage automatique",
    "Indique directement s’il faut ajouter ou retirer de la complexité, des données ou de la régularisation"
  ],
  cons: [
    "Le point d’équilibre optimal dépend fortement de la taille du jeu de données, du niveau de bruit et du domaine"
  ],
  diagram: `flowchart TD
    A["Entraîner le modèle"] --> B["Mesurer l’erreur d’entraînement"]
    A --> C["Mesurer l’erreur de validation"]
    B --> D{"Comparer les erreurs"}
    C --> D
    D -->|"les deux élevées"| E["Sous-apprentissage"]
    D -->|"entraînement faible, validation élevée"| F["Surapprentissage"]
    D -->|"les deux faibles et proches"| G(["Bon ajustement"])
    E --> H["Plus de variables, modèle plus complexe, moins de régularisation"]
    F --> I["Plus de données, régularisation, modèle plus simple, arrêt précoce"]
    H --> A
    I --> A`
};
