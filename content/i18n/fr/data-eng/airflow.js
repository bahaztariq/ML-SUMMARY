export default {
  name: "Apache Airflow (DAG)",
  category: "Orchestration et workflows",
  task: ["Orchestration", "Planification", "Pipelines ETL"],
  summary: "Une plateforme programmable pour écrire, planifier et superviser des workflows sous forme de graphes orientés acycliques (DAG), en pur Python.",
  intuition: "Le chef d’orchestre : il s’assure que la tâche B (nettoyer les données) ne s’exécute qu’après la réussite de la tâche A (télécharger les données). Si la tâche A échoue, il réessaie, envoie une alerte et met le pipeline en pause.",
  whenToUse: "Orchestration de pipelines batch d’entreprise complexes, tâches planifiées de réentraînement de modèles, synchronisations de bases de données et dépendances entre plusieurs systèmes.",
  whenToAvoid: "Déclencheurs en streaming ou événementiels à la sous-seconde (Airflow est conçu pour l’orchestration de batchs planifiés, pas pour le routage d’événements en temps réel).",
  parameters: [
    { impact: "Définit quand et à quelle fréquence le pipeline s’exécute.", tuningTip: "Utilisez la syntaxe cron standard à 5 champs pour une planification précise." },
    { impact: "Nombre de nouvelles tentatives automatiques avant de marquer la tâche comme échouée.", tuningTip: "Réglez-le à 2 ou 3 avec `retry_delay=timedelta(minutes=5)` pour résister aux pics réseau passagers." }
  ],
  math: {
    loss: "Exécution selon un tri topologique",
    explanation: "Airflow calcule l’ordre topologique des tâches. Une tâche ne passe de l’état SCHEDULED à QUEUED que lorsque tous ses sommets parents en amont se sont terminés dans l’état SUCCESS."
  },
  pros: [
    "Workflows définis en code Python standard (versionné avec Git, modulaire, testable)",
    "Vaste écosystème d’opérateurs prêts à l’emploi (Snowflake, AWS, GCP, Slack, Spark)",
    "Interface web solide pour consulter les logs des tâches, les diagrammes de Gantt et rattraper l’historique (backfill)"
  ],
  cons: [
    "Le surcoût du scheduler rend inefficace l’exécution de micro-tâches de moins d’une minute",
    "Airflow est un orchestrateur, PAS un moteur d’exécution (les gros calculs sur les données doivent se faire dans Spark/Snowflake, pas sur les workers Airflow)"
  ],
  diagram: `flowchart TD
  dag["Fichier DAG en Python"] --> sched["Le scheduler analyse les DAG"]
  sched --> due{"Intervalle de planification atteint ?"}
  due -->|"oui"| run["Créer une exécution du DAG"]
  run --> ready{"Toutes les tâches en amont en SUCCESS ?"}
  ready -->|"oui"| queue["Mettre la tâche en file pour l’exécuteur"]
  queue --> worker["Le worker exécute l’opérateur (Spark, SQL, Python)"]
  worker --> ok{"Tâche réussie ?"}
  ok -->|"oui"| next["Débloquer les tâches en aval"]
  ok -->|"non"| retry["Réessayer après un délai, puis alerter"]
  next --> ready
  retry --> queue`
};
