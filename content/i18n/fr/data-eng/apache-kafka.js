export default {
  name: "Apache Kafka",
  category: "Streaming et messagerie",
  task: ["Streaming", "Architecture orientée événements", "Ingestion"],
  summary: "Une plateforme distribuée de streaming d’événements capable de traiter des milliers de milliards d’événements par jour grâce à des journaux de commit en ajout seul, à faible latence.",
  intuition: "Le système nerveux central : les producteurs publient des événements sur des tapis roulants partitionnés (les topics). Les consommateurs les lisent à leur propre rythme, sans supprimer les événements.",
  whenToUse: "Ingestion de données en temps réel, découplage de microservices, capture des changements de données (CDC) et alimentation de pipelines de features ML en temps réel.",
  whenToAvoid: "Simples appels RPC synchrones requête-réponse, ou quand il vous faut seulement une file de tâches légère avec acquittement des tâches (RabbitMQ ou Redis peuvent être plus simples).",
  parameters: [
    { impact: "Unité de parallélisme au sein d’un topic.", tuningTip: "Kafka ne garantit l’ordre strict des messages qu’au sein d’une même partition. Plus de partitions permettent plus de threads consommateurs en parallèle." },
    { impact: "Nombre de copies de la partition stockées sur des brokers.", tuningTip: "Réglez-le à 3 en production, réparti sur différentes zones de panne, pour ne perdre aucune donnée." },
    { impact: "Nombre d’acquittements exigés par le producteur avant de considérer une requête comme terminée.", tuningTip: "Utilisez 'all' (ou -1) avec min.insync.replicas=2 pour une durabilité stricte (finance, audit)." }
  ],
  math: {
    loss: "Transfert de données zero-copy (appel système sendfile)",
    explanation: "Évite de copier les données entre les tampons mémoire du noyau et de l’espace utilisateur, en les envoyant directement du cache de pages du système Linux vers les sockets réseau via `sendfile()`."
  },
  pros: [
    "Débit hors norme (des millions de messages par seconde) grâce aux E/S disque séquentielles et au regroupement en lots",
    "Les consommateurs sont totalement découplés et peuvent rejouer des événements passés en rembobinant leurs offsets",
    "Tolérance aux pannes intégrée et réplication multi-datacenters"
  ],
  cons: [
    "Charge d’exploitation (gestion des brokers, quorum ZooKeeper / KRaft)",
    "L’ordre strict des messages n’est garanti QU’AU sein d’une même partition, pas entre topics"
  ],
  diagram: `flowchart LR
  subgraph topic["Topic : user-events"]
    t0[("Partition 0 : journal en ajout seul")]
    t1[("Partition 1 : journal en ajout seul")]
  end
  p1["Producteur A"] -->|"hachage de la clé"| t0
  p2["Producteur B"] -->|"hachage de la clé"| t1
  t0 -->|"répliquée vers les followers"| rep["Répliques sur les brokers (RF=3)"]
  t0 --> c1["Consommateur 1 (groupe : fraud)"]
  t1 --> c2["Consommateur 2 (groupe : fraud)"]
  t0 --> c3["Consommateur (groupe : analytics)"]
  t1 --> c3
  c1 --> off["Valider les offsets"]
  c3 -.->|"rembobiner l’offset pour rejouer"| t0`
};
