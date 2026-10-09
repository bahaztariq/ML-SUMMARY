export default {
  name: "Modélisation dimensionnelle (schéma en étoile et SCD)",
  category: "Architecture et gestion des données",
  task: ["Stockage", "Architecture"],
  summary: "Organise les données analytiques en tables de faits (des événements mesurables) entourées de tables de dimensions (le contexte descriptif), avec des dimensions à évolution lente (SCD) pour suivre l’historique.",
  intuition: "Le ticket de caisse et le carnet d’adresses : chaque ticket (fait) enregistre ce qui s’est passé : montant, quantité, date. Il ne stocke que de courtes références vers qui a acheté, où et quel produit, informations qui vivent dans des carnets d’adresses (les dimensions). Quand un client déménage, la SCD de type 2 garde l’ancienne page d’adresse et en ajoute une nouvelle, si bien que les anciens tickets affichent toujours la ville au moment de l’achat.",
  whenToUse: "Concevoir la couche gold/mart d’un entrepôt ou d’un lakehouse pour les outils de BI, le SQL en libre-service et des indicateurs métier cohérents (chiffre d’affaires, attrition, conversion) d’une équipe à l’autre.",
  whenToAvoid: "Bases de données transactionnelles d’applications (gardez-les normalisées), ou tout petits jeux de données pour lesquels une seule table à plat est plus simple. Évitez la SCD de type 2 sur des attributs qui changent en permanence (le nombre de lignes explose).",
  parameters: [
    { impact: "Le sens exact d’une ligne de fait ; il détermine chaque indicateur en aval.", tuningTip: "Déclarez d’abord le grain et choisissez le niveau le plus fin possible en pratique : on peut toujours agréger vers le haut, jamais vers le bas." },
    { impact: "La façon de gérer les changements de dimension : le type 1 écrase, le type 2 ajoute une nouvelle ligne versionnée, le type 3 garde une colonne « valeur précédente ».", tuningTip: "Utilisez le type 2 pour les attributs selon lesquels les analystes découpent l’historique (région, niveau d’abonnement) ; le type 1 pour corriger des fautes de frappe." },
    { impact: "Le schéma en étoile garde les dimensions dénormalisées ; le schéma en flocon les normalise en sous-tables.", tuningTip: "Préférez les schémas en étoile dans les entrepôts en colonnes : moins de jointures et un SQL plus simple pour les analystes." },
    { impact: "Clé propre à l’entrepôt qui découple les dimensions des identifiants des systèmes sources et permet les versions SCD2.", tuningTip: "Générez des clés de hachage déterministes (par ex. md5 de la clé naturelle + valid_from) pour que les reconstructions soient idempotentes." }
  ],
  math: {
    loss: "Exactitude à un instant donné (point-in-time)",
    explanation: "Chaque version d’une dimension porte un intervalle de validité. Les faits sont joints à la version active à l’horodatage de l’événement, si bien que les rapports historiques restent stables même après le changement des attributs. Cette même jointure point-in-time évite les fuites de données lors de la construction de jeux d’entraînement pour le ML."
  },
  pros: [
    "Intuitif pour les utilisateurs métier : les faits sont des verbes (ventes), les dimensions des noms (client, produit)",
    "Des jointures peu nombreuses et prévisibles, très performantes dans les moteurs en colonnes",
    "La SCD de type 2 conserve tout l’historique pour des rapports temporels exacts",
    "Les dimensions conformes donnent une définition unique et cohérente du « client » dans tous les marts"
  ],
  cons: [
    "Exige une conception préalable et un accord sur le grain et les définitions métier",
    "La logique de merge SCD2 complexifie le pipeline et fait grossir les tables",
    "Les dimensions dénormalisées dupliquent des données et demandent des mises à jour soigneuses",
    "Moins souple que les tables brutes pour la data science exploratoire"
  ],
  diagram: `flowchart TD
  src[("Tables sources OLTP")] --> stg["Staging : copies nettoyées"]
  stg --> grain{"Déclarer le grain : une ligne par ligne de commande"}
  grain --> fact[("fact_orders : montants, clés étrangères")]
  stg --> dimchk{"Attribut modifié ?"}
  dimchk -->|"non"| keep["Garder la ligne actuelle"]
  dimchk -->|"oui, SCD2"| close["Clore l’ancienne ligne : valid_to = maintenant"]
  close --> newrow["Insérer la nouvelle version : is_current = true"]
  keep --> dim[("dim_customer / dim_product")]
  newrow --> dim
  fact --> star["Jointure en étoile sur les clés de substitution"]
  dim --> star
  star --> bi["Indicateurs BI et features de ML"]`
};
