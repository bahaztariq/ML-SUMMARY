export default {
  name: "Capture des changements de données (CDC)",
  category: "Streaming et messagerie",
  task: ["Streaming", "Stockage", "Architecture"],
  summary: "Capture chaque insertion, mise à jour et suppression à partir du journal de transactions d’une base de données source, et diffuse ces changements en aval en quasi temps réel.",
  intuition: "La caméra de surveillance : au lieu de photographier tout l’entrepôt chaque nuit (snapshot complet) et de comparer les photos, le CDC surveille la porte et enregistre chaque article qui entre, sort ou est déplacé, au moment même où cela se produit. En aval, on rejoue l’enregistrement pour garder une copie exacte et à jour.",
  whenToUse: "Garder un entrepôt/lakehouse synchronisé avec des bases OLTP avec une fraîcheur de l’ordre de la minute, alimenter des features en temps réel, des microservices orientés événements, l’invalidation de caches et des migrations de bases de données sans interruption de service.",
  whenToAvoid: "Petites tables qu’il est peu coûteux de recharger entièrement chaque nuit, sources dont vous n’avez pas accès au journal de transactions (WAL/binlog), ou quand les consommateurs n’ont besoin que de snapshots quotidiens.",
  parameters: [
    { impact: "Basée sur le journal (WAL/binlog), sur des requêtes (interrogation périodique d’une colonne updated_at) ou sur des triggers.", tuningTip: "Préférez le CDC basé sur le journal (Debezium) : il capture les suppressions, n’ajoute aucune charge sur les tables sources et préserve l’ordre." },
    { impact: "Indique si le connecteur prend d’abord un snapshot complet cohérent avant de diffuser les changements.", tuningTip: "Utilisez 'initial' pour les nouveaux pipelines ; utilisez des snapshots incrémentaux pour rattraper les grandes tables sans verrouillage." },
    { impact: "Clé de partition Kafka ; garantit que tous les changements d’une même ligne restent ordonnés.", tuningTip: "Ne changez jamais la clé d’un topic CDC pour une colonne non unique, sinon les mises à jour d’une même ligne risquent d’être appliquées dans le désordre." },
    { impact: "Émet un enregistrement à valeur nulle après une suppression pour que les topics compactés abandonnent la clé.", tuningTip: "Laissez-le activé avec des topics compactés ; assurez-vous que les destinations traitent op='d' comme une suppression physique ou logique." }
  ],
  math: {
    loss: "Retard de réplication et cohérence",
    explanation: "L’état cible est égal à un snapshot initial auquel on applique chaque événement de changement dans l’ordre du journal. Comme chaque événement porte les images avant/après et un numéro de séquence de journal (LSN), la destination peut les dédoublonner et les appliquer de manière idempotente avec un MERGE, ce qui limite le retard de réplication à quelques secondes."
  },
  pros: [
    "Réplication en quasi temps réel avec une charge minimale sur la base de production",
    "Capture les suppressions physiques et chaque mise à jour intermédiaire (historique d’audit complet)",
    "Découple les systèmes sources de nombreux consommateurs en aval grâce à Kafka",
    "Remplace les exports complets nocturnes, fragiles"
  ],
  cons: [
    "Demande une configuration au niveau de la base (réplication logique, rétention du binlog, permissions)",
    "Les changements de schéma dans la source doivent être propagés et gérés en aval",
    "Complexité opérationnelle : connecteurs, offsets, Kafka et jobs de merge à surveiller",
    "Les destinations doivent gérer correctement les événements désordonnés, dupliqués et les suppressions"
  ],
  diagram: `flowchart LR
  app["Écritures de l’application"] --> db[("PostgreSQL")]
  db --> wal["Journal d’écriture anticipée (WAL)"]
  wal --> dbz["Le connecteur Debezium lit le journal"]
  dbz -->|"before / after / op / LSN"| topic[("Topic Kafka indexé par clé primaire")]
  topic --> merge{"Type d’opération ?"}
  merge -->|"c / u"| upsert["Upsert par MERGE"]
  merge -->|"d"| del["Suppression physique ou logique"]
  upsert --> lh[("Table silver du lakehouse")]
  del --> lh
  topic --> svc["Autres consommateurs : cache, recherche, features"]`
};
