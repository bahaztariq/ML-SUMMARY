export default {
  name: "ETL vs ELT en ingénierie des données",
  category: "Pipelines de données",
  task: ["Définition", "Ingénierie des données", "Architecture"],
  summary: "Les deux grands paradigmes des pipelines d’intégration de données. Ils se distinguent par le moment où les données brutes sont transformées : avant ou après leur chargement dans le stockage analytique cible.",
  intuition: "Plats surgelés ou buffet en cuisine ouverte : en ETL, les ingrédients sont découpés et cuisinés avant d’entrer au congélateur (impossible de changer d’avis ensuite). En ELT, tous les ingrédients bruts arrivent directement dans une cuisine moderne où les chefs préparent à la demande n’importe quel plat commandé.",
  whenToUse: "L’ELT est la norme actuelle pour les entrepôts de données cloud (Snowflake, BigQuery, Databricks). L’ETL reste utilisé sur du matériel on-premise historique ou sous des réglementations strictes, lorsque les données personnelles (PII) doivent être nettoyées avant d’être stockées.",
  whenToAvoid: "N’utilisez pas un ETL classique si vous disposez d’un entrepôt de données cloud moderne doté d’une puissance de calcul SQL massive et élastique.",
  parameters: [
    {
      impact: "Les données sont transformées sur un serveur de calcul séparé avant d’arriver dans l’entrepôt.",
      tuningTip: "À privilégier lorsque la source contient des mots de passe ou des données personnelles brutes qu’il est légalement interdit de stocker."
    },
    {
      impact: "Les données brutes sont chargées directement dans le stockage, puis transformées dans l’entrepôt via SQL/dbt.",
      tuningTip: "Conserve tout l’historique brut, ce qui permet de réécrire les transformations après coup."
    }
  ],
  math: {
    loss: "Séparation du stockage et du calcul",
    explanation: "Les entrepôts cloud découplent un stockage objet bon marché et quasi illimité de clusters de calcul à la demande. L’ELT devient ainsi plus rapide, moins cher et bien plus flexible que des serveurs ETL qui forment un goulot d’étranglement."
  },
  pros: [
    "L’ELT ne jette jamais les données brutes : on peut retransformer des années d’historique à tout moment",
    "L’ELT exploite la puissance de traitement SQL distribuée des entrepôts cloud modernes",
    "L’ETL protège la vie privée en ne stockant jamais de données personnelles sensibles non masquées dans les cibles analytiques"
  ],
  cons: [
    "L’ELT stocke davantage de données brutes, ce qui augmente légèrement l’empreinte de stockage",
    "Modifier un pipeline ETL oblige à changer et redéployer tout le code du pipeline"
  ],
  diagram: `flowchart TD
    S[("Systèmes sources")] --> Q{"Où se fait le calcul de transformation ?"}
    Q -->|"ETL"| E1["Extraire"]
    E1 --> T1["Transformer sur un moteur séparé (Spark / Python)"]
    T1 --> L1[("Charger les données propres dans l’entrepôt")]
    Q -->|"ELT"| E2["Extraire"]
    E2 --> L2[("Charger les données brutes dans l’entrepôt / le lac cloud")]
    L2 --> T2["Transformer dans l’entrepôt en SQL (dbt)"]
    T2 --> M[("Modèles prêts pour l’analyse")]
    L1 --> BI["Consommateurs BI & ML"]
    M --> BI`
};
