export default {
  name: "Partitionnement, bucketing et Z-ordering",
  category: "Stockage et formats de fichiers",
  task: ["Stockage", "Optimisation"],
  summary: "Organise physiquement les grandes tables sur disque pour que les requêtes puissent ignorer les fichiers non pertinents (élagage de partitions, data skipping) et que les jointures évitent des shuffles coûteux (bucketing).",
  intuition: "Le classeur à tiroirs : le partitionnement range chaque mois dans son propre tiroir, si bien que « montre-moi mars » n’ouvre qu’un tiroir. Le bucketing divise chaque tiroir en 32 dossiers selon le hachage de l’identifiant client, si bien que deux classeurs organisés de la même façon peuvent être appariés dossier par dossier. Le Z-ordering trie les feuilles de chaque dossier selon plusieurs étiquettes à la fois, ce qui permet de sauter la plupart des pages en ne lisant que l’onglet d’index.",
  whenToUse: "Tables de plusieurs centaines de Go ou plus dans Spark, Delta Lake, Iceberg, Hive, BigQuery ou Snowflake, lorsque les requêtes filtrent systématiquement par date/région ou font des jointures sur la même clé à forte cardinalité.",
  whenToAvoid: "Petites tables (moins de ~1 Go) ou partitionnement sur des colonnes à forte cardinalité comme user_id, qui crée des millions de minuscules fichiers (le problème des petits fichiers) et ralentit tout.",
  requirements: {
    targetFileSize: "128 Mo - 1 Go"
  },
  parameters: [
    { impact: "Colonnes qui définissent l’arborescence des répertoires (par ex. date=2026-10-03/).", tuningTip: "Choisissez des colonnes à faible cardinalité présentes dans la plupart des clauses WHERE ; visez au moins ~1 Go par partition." },
    { impact: "Nombre de buckets de hachage par table sur la colonne de bucketing.", tuningTip: "Bucketez les deux côtés de la jointure sur la même clé avec le même nombre (par ex. 64) pour obtenir des sort-merge joins sans shuffle." },
    { impact: "Regroupement multicolonne (Delta OPTIMIZE ZORDER / ordre de tri Iceberg) qui resserre les statistiques min/max de chaque fichier.", tuningTip: "Appliquez le Z-order sur 1 à 4 colonnes de filtre à forte cardinalité non utilisées pour le partitionnement ; relancez-le après de grosses écritures." },
    { impact: "Nombre maximal d’octets par split d’entrée lors de la lecture des fichiers.", tuningTip: "Combinez-le avec du compactage pour que les fichiers aient une taille proche du split et que les tâches soient chargées de façon équilibrée." }
  ],
  math: {
    loss: "Octets lus / volume de shuffle",
    explanation: "Le moteur ne lit que les partitions dont la clé correspond au filtre, puis utilise les statistiques min/max de chaque fichier pour ignorer ceux dont la plage de valeurs ne peut pas satisfaire le prédicat. Le Z-ordering entrelace les bits de plusieurs colonnes pour que les valeurs proches se regroupent dans les mêmes fichiers, ce qui garde ces plages étroites pour plusieurs colonnes à la fois."
  },
  pros: [
    "Les requêtes filtrées sur les colonnes de partition peuvent lire 100 fois moins de données",
    "Le bucketing supprime l’étape de shuffle des grandes jointures et agrégations répétées",
    "Le Z-ordering accélère les filtres multicolonnes sans faire exploser le nombre de répertoires",
    "Réduit directement les coûts cloud sur les moteurs facturés au volume lu (BigQuery, Athena)"
  ],
  cons: [
    "De mauvaises clés de partition créent de minuscules fichiers et un surcoût de métadonnées",
    "Des clés déséquilibrées (une partition énorme) provoquent des tâches retardataires",
    "L’organisation doit correspondre aux schémas de requêtes ; la changer impose de réécrire les données",
    "Le Z-ordering et le compactage sont des jobs de maintenance supplémentaires qui consomment du calcul"
  ],
  diagram: `flowchart TD
  q["Requête : WHERE date = 3 oct. AND country = MA"] --> part{"Élagage des partitions sur date"}
  part -->|"ignorer"| other["Les autres dossiers de date ne sont jamais lus"]
  part -->|"garder"| folder["Dossier date=2026-10-03"]
  folder --> stats{"Min/max par fichier sur country (Z-ordonné)"}
  stats -->|"la plage exclut MA"| skip["Ignorer le fichier"]
  stats -->|"la plage inclut MA"| read["Lire les row groups du fichier"]
  read --> res["Résultat en ne lisant qu’une fraction des octets"]
  bk["Tables bucketées : même clé, même nombre de buckets"] --> join["Le bucket i est joint au bucket i"]
  join --> noshuf["Aucun shuffle dans le cluster"]`
};
