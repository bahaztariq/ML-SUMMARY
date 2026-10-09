export default {
  name: "Entrepôt de données vs data lake",
  category: "Architecture et gestion des données",
  task: ["Stockage", "Architecture", "Définition"],
  summary: "Compare les deux paradigmes classiques de stockage analytique : les entrepôts soigneusement préparés, à schéma à l’écriture (schema-on-write), et les lacs bon marché, bruts, à schéma à la lecture (schema-on-read).",
  intuition: "Le supermarché et la ferme : un entrepôt est un supermarché où chaque produit est lavé, étiqueté et mis en rayon avant votre arrivée, si bien que les courses sont rapides. Un lac est la ferme : tout y est, à l’état brut et très peu cher à stocker, mais c’est à vous de nettoyer et de préparer ce que vous cueillez.",
  whenToUse: "L’entrepôt (Snowflake, BigQuery, Redshift) pour des tableaux de bord BI gouvernés et du reporting SQL sur des données structurées. Le lac (S3/GCS/ADLS + Parquet) pour d’énormes volumes bruts, des logs semi-structurés, des images et des données d’entraînement de ML qui exigent une exploration flexible.",
  whenToAvoid: "Ne déversez pas tout dans un lac sans catalogue ni gouvernance (il devient un « marécage de données »). Ne forcez pas des images, de l’audio ou des logs JSON bruts dans un entrepôt facturé cher au To ; envisagez un lakehouse quand vous avez besoin des deux.",
  requirements: {
    schemaOnWrite: "Entrepôt : oui / Lac : non (schéma à la lecture)",
    supportsUnstructured: "Lac uniquement"
  },
  parameters: [
    { impact: "Détermine si les données sont validées et typées au chargement ou seulement à la requête.", tuningTip: "Utilisez le schéma à l’écriture pour les tables finance/BI qui doivent être fiables ; le schéma à la lecture pour les zones d’atterrissage brutes qui changent souvent." },
    { impact: "Classe de stockage objet dans un lac (standard, accès peu fréquent, archive).", tuningTip: "Appliquez des règles de cycle de vie : déplacez les données brutes de plus de 90 jours vers des niveaux froids/d’archive pour réduire le coût de stockage de 60 à 80 %." },
    { impact: "Indique si le stockage et le calcul évoluent indépendamment.", tuningTip: "Les entrepôts et les lacs modernes découplent tous deux stockage et calcul ; dimensionnez les entrepôts virtuels/clusters par charge de travail, pas par jeu de données." },
    { impact: "Format sur disque des données du lac ; détermine la vitesse de lecture et la compression.", tuningTip: "Déposez les données brutes telles quelles (JSON/CSV), mais convertissez toujours les zones préparées en tables Parquet ou Delta/Iceberg." }
  ],
  math: {
    loss: "Compromis coût vs performances des requêtes",
    explanation: "Les lacs minimisent le terme de stockage (le stockage objet coûte ~20 $/To·mois) mais reportent le travail au moment de la requête. Les entrepôts dépensent davantage à l’ingestion et au stockage pour pré-organiser les données, ce qui minimise le temps de requête et le calcul pour des charges BI répétées."
  },
  pros: [
    "Entrepôt : performances SQL rapides et régulières, avec une gouvernance et un contrôle d’accès solides",
    "Lac : stockage extrêmement bon marché pour tout type de données (structurées, semi-structurées, non structurées)",
    "Lac : les data scientists accèdent à l’historique brut, non agrégé, pour l’ingénierie des features de ML",
    "Les deux évoluent de façon élastique dans le cloud, avec stockage et calcul découplés"
  ],
  cons: [
    "Entrepôt : coûteux à l’échelle du pétaoctet et peu adapté aux images, à l’audio ou aux logs bruts",
    "Lac : pas de transactions ACID ni d’application de schéma par défaut, ce qui mène aux marécages de données",
    "Faire tourner les deux implique souvent des copies en double et des pipelines ETL à double saut",
    "Les requêtes sur un lac exigent un partitionnement et un dimensionnement des fichiers soignés pour être performantes"
  ],
  diagram: `flowchart LR
  src["Sources : applications, logs, API"] --> choice{"Où déposer les données ?"}
  choice -->|"préparées, structurées"| etl["Transformer + valider d’abord"]
  etl --> wh[("Entrepôt de données")]
  wh --> bi["Tableaux de bord BI / rapports SQL"]
  choice -->|"brutes, tout format"| lake[("Data lake sur S3 / GCS")]
  lake --> sor["Schéma appliqué à la lecture"]
  sor --> ml["Entraînement de ML / exploration"]
  sor --> etl2["Préparer un sous-ensemble"]
  etl2 --> wh
  lake -.->|"ajouter un journal ACID"| lh["Lakehouse"]`
};
