export default {
  name: "dbt (data build tool)",
  category: "Orchestration et workflows",
  task: ["Prétraitement", "Architecture", "Évaluation"],
  summary: "Un framework de transformation centré sur SQL qui transforme des requêtes SELECT en tables et vues testées, documentées et versionnées à l’intérieur de votre entrepôt de données (le T de ELT).",
  intuition: "Le livre de recettes avec un chef de cuisine : chaque recette (modèle) est un unique SELECT qui indique, via ref(), quels ingrédients (autres modèles) il utilise. dbt lit toutes les recettes, détermine automatiquement l’ordre de préparation, les cuisine dans la cuisine de l’entrepôt et goûte chaque plat (tests) avant de le servir.",
  whenToUse: "Pipelines ELT sur Snowflake, BigQuery, Redshift, Databricks, DuckDB ou Postgres, quand analystes et ingénieurs veulent appliquer les pratiques du logiciel (Git, revue de code, CI, tests, documentation) à leurs transformations SQL et à leurs modèles dimensionnels.",
  whenToAvoid: "Travail d’ingestion/d’extraction (utilisez Fivetran, Airbyte, le CDC), traitements lourds hors SQL comme l’entraînement de modèles de ML ou le traitement d’images, ou transformations en streaming à la sous-minute.",
  parameters: [
    { impact: "La façon dont un modèle est persisté : view, table, incremental, ephemeral ou snapshot.", tuningTip: "Des vues pour le staging léger, des tables pour les marts, de l’incrémental pour les grandes tables de faits alimentées surtout par ajout." },
    { impact: "Clé utilisée par les modèles incrémentaux pour faire un MERGE des nouvelles lignes au lieu de les dupliquer.", tuningTip: "Définissez-la toujours sur les modèles incrémentaux alimentés par du CDC ou des données arrivant en retard." },
    { impact: "Assertions (unique, not_null, accepted_values, relationships) exécutées par 'dbt test' ou 'dbt build'.", tuningTip: "Au minimum, testez unique + not_null sur les clés primaires de chaque modèle." },
    { impact: "Sélecteur de graphe pour exécuter un sous-ensemble du DAG.", tuningTip: "En CI, utilisez 'state:modified+' pour ne construire que les modèles modifiés et leurs descendants." }
  ],
  math: {
    loss: "Résolution des dépendances",
    explanation: "dbt analyse chaque ref() et source() pour construire un DAG de modèles. Il compile le Jinja en SQL pur, puis exécute les modèles dans l’ordre topologique pour que chaque table ne soit construite qu’après ses parents, et lance les tests sur chaque nœud."
  },
  pros: [
    "Les transformations sont du simple SQL + Jinja, accessible aux analystes",
    "Graphe de dépendances et lignage automatiques grâce à ref()",
    "Tests intégrés et site de documentation généré automatiquement",
    "Modèles incrémentaux et snapshots (SCD2) disponibles d’emblée"
  ],
  cons: [
    "Ne transforme que les données déjà présentes dans l’entrepôt ; ni extraction ni chargement",
    "Les macros Jinja complexes peuvent devenir difficiles à lire et à déboguer",
    "Les coûts de calcul de l’entrepôt peuvent grimper si des modèles sont reconstruits inutilement en tables complètes",
    "Pas conçu pour les charges de travail en streaming temps réel"
  ],
  diagram: `flowchart LR
  raw[("Tables brutes chargées par l’outil d’EL")] --> src["Définitions source()"]
  src --> stg["Modèles de staging : renommer, convertir les types"]
  stg --> int["Modèles intermédiaires : jointures"]
  int --> marts["Marts : faits et dimensions"]
  marts --> compile["dbt compile Jinja → SQL"]
  compile --> order["Ordre topologique issu du graphe de ref()"]
  order --> wh[("L’entrepôt exécute le SQL")]
  wh --> test{"Les tests dbt passent ?"}
  test -->|"oui"| docs["Docs + lignage, la BI consomme"]
  test -->|"non"| fail["Le build échoue, alerte en CI"]`
};
