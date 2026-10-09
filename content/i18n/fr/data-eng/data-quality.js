export default {
  name: "Qualité des données et Great Expectations",
  category: "Architecture et gestion des données",
  task: ["Évaluation", "Prétraitement"],
  summary: "Valide systématiquement les données par rapport à des attentes explicites (complétude, unicité, validité, fraîcheur, cohérence) pour intercepter les mauvaises données avant qu’elles n’atteignent les tableaux de bord ou les modèles.",
  intuition: "Le contrôle de sécurité à l’aéroport : chaque lot de données est un passager. Avant l’embarquement (la publication), il passe aux scanners : le passeport est-il présent (non nul), est-il le seul (unique), le bagage a-t-il une taille autorisée (contrôle de plage), le vol est-il aujourd’hui (fraîcheur) ? Les passagers suspects sont arrêtés et signalés, pas autorisés à monter dans l’avion.",
  whenToUse: "Aux frontières du pipeline : après l’ingestion, avant de publier les tables gold, et avant d’entraîner ou de servir des modèles de ML. Indispensable quand de nombreuses équipes s’appuient sur des données partagées et que les erreurs silencieuses coûtent cher.",
  whenToAvoid: "Notebooks d’exploration ponctuels sur des données statiques. Évitez des centaines de contrôles bruyants et peu utiles que les gens finissent par ignorer (lassitude face aux alertes).",
  requirements: {
    blocksPipelineOnFailure: "configurable",
    needsBaseline: "pour les contrôles de distribution"
  },
  parameters: [
    { impact: "Collection nommée d’attentes pour un jeu de données.", tuningTip: "Versionnez les suites dans Git à côté du code du pipeline et relisez-les comme du code." },
    { impact: "Proportion de lignes qui doivent satisfaire une attente pour qu’elle soit validée.", tuningTip: "Utilisez 0,99 pour des champs réels bruités, afin de tolérer de rares anomalies sans désactiver le contrôle." },
    { impact: "Indique si un échec bloque le pipeline (error) ou se contente d’alerter (warn).", tuningTip: "Bloquez sur les violations de clé primaire et de schéma ; alertez sur les dérives de distribution." },
    { impact: "Âge maximal autorisé de l’enregistrement le plus récent.", tuningTip: "Réglez-le légèrement au-dessus du SLA du pipeline pour que les retards apparaissent avant que les parties prenantes ne les remarquent." }
  ],
  math: {
    loss: "Taux de réussite des attentes",
    explanation: "Chaque attente calcule la proportion de lignes qui respectent une règle et la compare à son seuil 'mostly'. Le résultat de la suite agrège les réussites/échecs sur K contrôles ; les échecs critiques arrêtent le pipeline (disjoncteur), les autres déclenchent des alertes et sont consignés dans les Data Docs."
  },
  pros: [
    "Intercepte ruptures de schéma, valeurs nulles, doublons et valeurs hors plage avant qu’ils ne se propagent",
    "Les attentes servent aussi de documentation vivante de ce que sont de « bonnes données »",
    "Protège les modèles de ML d’un entraînement ou de prédictions sur des entrées corrompues",
    "S’intègre avec Airflow, dbt, Spark et les pipelines de CI"
  ],
  cons: [
    "Exige une connaissance du métier pour écrire des attentes pertinentes",
    "Les contrôles ajoutent du temps de calcul sur les très grandes tables (utilisez l’échantillonnage ou des exécutions par partition)",
    "Trop de contrôles stricts provoquent une lassitude face aux alertes et des pipelines instables",
    "Les règles statiques ratent les dérives subtiles (à combiner avec une surveillance statistique de la dérive)"
  ],
  diagram: `flowchart TD
  ing["Un nouveau lot arrive (bronze)"] --> suite["Charger la suite d’attentes"]
  suite --> c1["Schéma et types"]
  suite --> c2["Valeurs nulles et unicité"]
  suite --> c3["Plages et valeurs autorisées"]
  suite --> c4["Nombre de lignes et fraîcheur"]
  c1 --> agg{"Tous les contrôles critiques réussis ?"}
  c2 --> agg
  c3 --> agg
  c4 --> agg
  agg -->|"oui"| pub["Publier en silver / gold"]
  agg -->|"non"| quar["Mettre le lot en quarantaine + alerter"]
  pub --> use["Tableaux de bord et modèles de ML"]
  quar --> docs["Rapport Data Docs pour le tri"]`
};
