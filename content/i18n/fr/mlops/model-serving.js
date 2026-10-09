export default {
  name: "Mise en service des modèles : par lots vs en ligne (FastAPI)",
  category: "Déploiement & mise en service",
  task: ["Déploiement", "Architecture"],
  summary: "Mettre les prédictions d’un modèle entraîné à la disposition de ceux qui les utilisent — soit en évaluant de grands jeux de données selon un planning (par lots), soit en répondant à des requêtes individuelles en quelques millisecondes via une API (en ligne / temps réel).",
  intuition: "Boulangerie ou préparation à la commande : une boulangerie cuit tout le pain à 4 h du matin et il attend sur les étagères (par lots : peu coûteux, prédictions prêtes mais parfois périmées). Une sandwicherie prépare chaque commande à l’arrivée du client (en ligne : frais, personnalisé, mais il faut être rapide et toujours avoir du personnel).",
  whenToUse: "Par lots : scores d’attrition nocturnes, prévisions de demande hebdomadaires, segments marketing — quand les prédictions peuvent être précalculées. En ligne : contrôle de fraude au moment du paiement, classement des résultats de recherche, recommandations — quand l’entrée n’existe qu’au moment de la requête.",
  whenToAvoid: "Évitez la mise en service en ligne quand le traitement par lots suffit (elle ajoute des SLO de latence, de l’autoscaling et des astreintes). Évitez le traitement par lots quand les entrées changent à la seconde ou que l’espace des entrées est trop vaste pour être précalculé.",
  requirements: {
    latencyBudget: "Par lots : des heures · En ligne : généralement moins de 100 ms"
  },
  parameters: [
    {
      impact: "Par lots, on écrit les prédictions dans une table ; en ligne, on expose un endpoint HTTP/gRPC ; en streaming, on évalue des événements venant de Kafka.",
      tuningTip: "Commencez par le traitement par lots ; passez en ligne seulement quand un besoin produit exige des prédictions fraîches."
    },
    {
      impact: "Le nombre de processus serveur ou de pods qui traitent les requêtes en parallèle.",
      tuningTip: "Faites de l’autoscaling sur le CPU ou les requêtes par seconde ; faites des tests de charge pour trouver la limite de latence p99."
    },
    {
      impact: "Regroupe des requêtes en ligne simultanées en un seul appel au modèle pour tirer parti de la vectorisation et du GPU.",
      tuningTip: "Indispensable pour les modèles d’apprentissage profond servis sur GPU (Triton, TorchServe, BentoML)."
    },
    {
      impact: "Rejette les requêtes mal formées avant qu’elles n’atteignent le modèle.",
      tuningTip: "Reproduisez exactement le schéma des variables d’entraînement, types et plages autorisées compris."
    }
  ],
  math: {
    loss: "Compromis latence / débit",
    explanation: "La mise en service en ligne se juge sur la latence de queue (p99), qui additionne le temps réseau, la récupération des variables et l’inférence du modèle. Le débit augmente avec le nombre de répliques et la taille des lots, mais des lots plus gros allongent la latence de chaque requête."
  },
  pros: [
    "Par lots : simple, peu coûteux, facile à relancer, s’appuie sur des outils big data comme Spark",
    "En ligne : des prédictions fraîches et contextuelles pour les produits interactifs",
    "Une API stable découple les mises à jour du modèle des applications qui l’utilisent"
  ],
  cons: [
    "Les prédictions par lots se périment et gaspillent du calcul pour des utilisateurs qui ne viennent jamais",
    "La mise en service en ligne exige haute disponibilité, autoscaling et surveillance de la latence",
    "Écart entraînement-production si les variables en ligne sont calculées autrement qu’à l’entraînement"
  ],
  diagram: `flowchart TD
    R[("Registre de modèles")] --> Q{"Les entrées sont-elles connues à l’avance ?"}
    Q -->|"oui"| B1["Tâche par lots (Airflow / Spark)"]
    B1 --> B2[("Lire toutes les lignes de l’entrepôt")]
    B2 --> B3["Évaluer en masse"]
    B3 --> B4[("Écrire la table des prédictions")]
    B4 --> B5["Les applications lisent les scores précalculés"]
    Q -->|"non, au moment de la requête"| O1["Le client envoie une requête HTTP"]
    O1 --> O2["L’API valide le schéma d’entrée"]
    O2 --> O3["Récupérer les variables en ligne"]
    O3 --> O4["Inférence du modèle en mémoire"]
    O4 --> O5["Renvoyer la prédiction en quelques ms"]`
};
