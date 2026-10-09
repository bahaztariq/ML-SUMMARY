export default {
  name: "Traitement par lots vs en flux (Lambda vs Kappa)",
  category: "Streaming et messagerie",
  task: ["Streaming", "Architecture", "Définition"],
  summary: "Met en regard le traitement de blocs de données bornés selon un calendrier (batch) et le traitement continu d’événements non bornés au fil de leur arrivée (stream), ainsi que les architectures Lambda et Kappa qui les combinent.",
  intuition: "Le jour de lessive contre le lave-vaisselle à convoyeur : le batch, c’est le jour de lessive, on attend que le panier soit plein et on lave tout d’un coup, c’est efficace mais différé. Le streaming, c’est le lave-vaisselle à convoyeur d’un restaurant : chaque assiette est lavée quelques secondes après son arrivée. Lambda fait tourner les deux machines côte à côte ; Kappa n’utilise que le convoyeur et y repasse les anciennes assiettes quand il faut les relaver.",
  whenToUse: "Le batch pour les rapports quotidiens, le réentraînement de modèles, les rattrapages (backfills) et les grosses jointures, quand des heures de latence sont acceptables. Le streaming pour la détection de fraude, les recommandations en temps réel, les tableaux de bord en direct, les alertes et le calcul de features en ligne.",
  whenToAvoid: "Ne construisez pas une pile de streaming quand le métier ne regarde les données qu’une fois par jour (cela coûte plus cher et c’est plus difficile à exploiter). Évitez Lambda si vous ne pouvez pas vous permettre de maintenir deux bases de code qui calculent la même logique.",
  requirements: {
    latency: "Batch : minutes-heures / Stream : ms-secondes",
    needsReplayableLog: "Kappa : oui (par ex. Kafka)"
  },
  parameters: [
    { impact: "Regroupe un flux non borné en blocs finis pour l’agrégation (fenêtres fixes, glissantes, de session).", tuningTip: "Utilisez des fenêtres fixes (tumbling) pour des comptages par minute, glissantes pour des moyennes mobiles, et de session pour les rafales d’activité des utilisateurs." },
    { impact: "Le temps pendant lequel le moteur attend les événements en retard ou désordonnés avant de clôturer une fenêtre.", tuningTip: "Fixez-le à partir du retard p99 observé des événements ; trop court, on perd des données, trop long, l’état et la latence augmentent." },
    { impact: "Fréquence de déclenchement des micro-lots dans Spark Structured Streaming.", tuningTip: "Des déclenchements plus courts réduisent la latence mais créent plus de petits fichiers ; utilisez availableNow pour des exécutions incrémentales de type batch." },
    { impact: "Indique si des événements peuvent être dupliqués ou perdus en cas de panne.", tuningTip: "Obtenez un exactly-once effectif avec des checkpoints et des destinations idempotentes ou transactionnelles (Delta, transactions Kafka)." }
  ],
  math: {
    loss: "Latence vs débit vs coût",
    explanation: "Le batch amortit un surcoût fixe sur de nombreux enregistrements (débit élevé, latence élevée). Le streaming traite de petits incréments en continu (faible latence), mais doit conserver un état et gérer les événements en retard ou désordonnés grâce à des fenêtres en temps d’événement et des watermarks."
  },
  pros: [
    "Batch : simple, peu coûteux, facile à retraiter et à déboguer avec des entrées déterministes",
    "Stream : une fraîcheur à la seconde permet des décisions et des alertes en temps réel",
    "Kappa : une seule base de code ; retraiter revient simplement à rejouer le journal depuis un offset antérieur",
    "Les moteurs modernes (Spark, Flink) partagent leurs API entre batch et streaming"
  ],
  cons: [
    "Batch : données périmées entre deux exécutions ; les gros jobs peuvent manquer leurs SLA",
    "Stream : plus difficile à exploiter (stockage d’état, checkpoints, données en retard, contre-pression)",
    "Lambda : logique dupliquée entre la couche batch et la couche vitesse, qui peuvent diverger sans bruit",
    "Les garanties exactly-once exigent une conception soignée des destinations"
  ],
  diagram: `flowchart LR
  ev["Sources d’événements"] --> log[("Journal Kafka")]
  subgraph lambda["Architecture Lambda"]
    log --> batch["Couche batch : recalcul Spark nocturne"]
    log --> speed["Couche vitesse : incréments en streaming"]
    batch --> serve["La couche de service fusionne les deux vues"]
    speed --> serve
  end
  subgraph kappa["Architecture Kappa"]
    log --> stream["Un seul job de streaming : fenêtres + watermarks"]
    stream --> sink[("Delta / feature store")]
    log -.->|"rejouer depuis un ancien offset pour retraiter"| stream
  end
  serve --> apps["Tableaux de bord et ML"]
  sink --> apps`
};
