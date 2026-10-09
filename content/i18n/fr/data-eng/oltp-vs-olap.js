export default {
  name: "OLTP vs OLAP",
  category: "Stockage et formats de fichiers",
  task: ["Stockage", "Définition", "Architecture"],
  summary: "Distingue les bases de données transactionnelles optimisées pour de nombreuses petites lectures/écritures (OLTP) des systèmes analytiques optimisés pour les grands balayages et les agrégations (OLAP).",
  intuition: "Le caissier et le comptable : le caissier (OLTP) gère des milliers de minuscules transactions par minute, un client à la fois, et ne doit jamais se tromper. Le comptable (OLAP) lit d’un coup tous les tickets de l’année pour répondre à de grandes questions comme « quel produit s’est le mieux vendu dans chaque région ? ».",
  whenToUse: "L’OLTP (PostgreSQL, MySQL) pour le backend des applications : comptes utilisateurs, commandes, paiements, stocks. L’OLAP (Snowflake, BigQuery, ClickHouse, DuckDB) pour les tableaux de bord, le reporting, l’analyse ad hoc et l’agrégation de features de ML sur des millions de lignes.",
  whenToAvoid: "N’exécutez pas de lourdes requêtes analytiques GROUP BY sur votre base OLTP de production (cela verrouille des lignes et ralentit l’application). N’utilisez pas un entrepôt OLAP comme backend d’application pour des mises à jour ligne par ligne.",
  requirements: {
    storageLayout: "OLTP : orienté lignes / OLAP : orienté colonnes",
    normalized: "OLTP : 3FN / OLAP : schéma en étoile dénormalisé"
  },
  parameters: [
    { impact: "Les stockages en lignes gardent un enregistrement complet ensemble ; les stockages en colonnes gardent chaque colonne ensemble.", tuningTip: "Le format en lignes l’emporte pour « récupérer l’utilisateur 42 » ; le format en colonnes l’emporte pour « montant moyen sur 1 milliard de lignes »." },
    { impact: "Garanties de concurrence pour les transactions simultanées en OLTP.", tuningTip: "N’utilisez SERIALIZABLE que pour les flux d’argent critiques ; cela réduit le débit." },
    { impact: "Accélèrent les recherches ponctuelles en OLTP ; l’OLAP s’appuie plutôt sur des zone maps/statistiques min-max.", tuningTip: "Indexez les clés étrangères et les colonnes fréquentes des WHERE en OLTP ; en OLAP, triez/regroupez selon la colonne la plus filtrée." },
    { impact: "Degré de découpage des données en de nombreuses tables liées.", tuningTip: "Normalisez pour l’intégrité des écritures en OLTP ; dénormalisez en faits/dimensions en OLAP pour éviter des jointures coûteuses." }
  ],
  math: {
    loss: "E/S par requête",
    explanation: "Une requête analytique qui touche 3 colonnes sur 100 lit ~3 % des données dans un stockage en colonnes, mais 100 % dans un stockage en lignes. À l’inverse, insérer un enregistrement touche 1 page dans un stockage en lignes, mais 100 fichiers de colonnes distincts dans un stockage en colonnes."
  },
  pros: [
    "OLTP : transactions ACID avec une latence de l’ordre de la milliseconde pour une ligne",
    "OLTP : la normalisation évite les anomalies de mise à jour et les données dupliquées",
    "OLAP : balaie des milliards de lignes en quelques secondes grâce à la compression en colonnes et à l’exécution vectorisée",
    "Séparer les deux protège les applications de production de la charge analytique"
  ],
  cons: [
    "OLTP : lent et risqué pour de larges agrégations sur tout l’historique",
    "OLAP : mal adapté aux mises à jour/suppressions fréquentes ligne par ligne et aux écritures très concurrentes",
    "Nécessite un pipeline (ETL batch ou CDC) pour déplacer les données de l’OLTP vers l’OLAP",
    "Les données en OLAP ont généralement de quelques minutes à quelques heures de retard sur la source"
  ],
  diagram: `flowchart LR
  app["Application web / mobile"] -->|"INSERT / UPDATE d’une seule ligne"| oltp[("Base OLTP : stockage en lignes, 3FN")]
  oltp -->|"recherches ponctuelles en ms"| app
  oltp -->|"ETL batch ou CDC"| pipe["Pipeline"]
  pipe --> olap[("Entrepôt OLAP : stockage en colonnes")]
  olap --> scan["Ne lire que les colonnes nécessaires"]
  scan --> agg["GROUP BY / SUM vectorisés"]
  agg --> dash["Tableaux de bord et features de ML"]`
};
