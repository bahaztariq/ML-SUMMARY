export default {
  name: "Data lakehouse (Delta Lake / Iceberg)",
  category: "Architecture et gestion des données",
  task: ["Architecture", "Gouvernance des données", "Transactions ACID"],
  summary: "Une architecture moderne qui combine le faible coût de stockage des data lakes avec l’intégrité transactionnelle ACID et l’application des schémas des entrepôts de données.",
  intuition: "Le meilleur des deux mondes : on garde les données brutes à moindre coût sur un stockage objet (comme AWS S3), au format Parquet, mais on y superpose un journal de transactions pour garantir une fiabilité digne d’une base de données.",
  whenToUse: "Construire des plateformes de données d’entreprise modernes et évolutives, où les analystes BI (SQL) et les data scientists (ML) interrogent exactement la même source unique de vérité.",
  whenToAvoid: "Quand vous avez une petite application de startup avec seulement quelques centaines de mégaoctets de données dans une base Postgres classique.",
  parameters: [
    { impact: "Taille cible lors du compactage des petits fichiers.", tuningTip: "Exécutez régulièrement les commandes `OPTIMIZE / VACUUM` pour résoudre le redouté « problème des petits fichiers »." }
  ],
  math: {
    loss: "Contrôle de concurrence multiversion (MVCC)",
    explanation: "Les lecteurs ne bloquent jamais les écrivains. Les nouvelles transactions écrivent de nouveaux fichiers Parquet immuables et valident une entrée atomique dans le journal de transactions, ce qui permet un voyage dans le temps (Time Travel) instantané vers des horodatages passés."
  },
  pros: [
    "Supprime l’architecture ETL à double saut (plus besoin de copier les données du lake vers l’entrepôt)",
    "Le Time Travel permet d’interroger des versions historiques des données pour une reproductibilité exacte des modèles de ML",
    "Les transactions ACID complètes empêchent les écritures partielles corrompues en cas d’échec du pipeline"
  ],
  cons: [
    "Demande une maintenance régulière (compactage et nettoyage des fichiers expirés)",
    "Latence de requête légèrement plus élevée que celle des entrepôts en mémoire dédiés pour les requêtes simples"
  ],
  diagram: `flowchart LR
  src["Fichiers batch, CDC, flux"] --> bronze[("Bronze : brut")]
  bronze --> silver[("Silver : nettoyé, dédoublonné")]
  silver --> gold[("Gold : agrégats métier")]
  subgraph storage["Stockage objet (S3 / GCS)"]
    pq["Fichiers Parquet immuables"]
    log["Journal de transactions : _delta_log / métadonnées Iceberg"]
  end
  silver --> pq
  pq --> log
  log --> acid["Commits atomiques + time travel"]
  gold --> bi["SQL / BI"]
  gold --> ml["Data science / ML"]`
};
