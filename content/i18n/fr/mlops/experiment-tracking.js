export default {
  name: "Suivi d’expériences et registre de modèles (MLflow)",
  category: "Gestion des expériences",
  task: ["Évaluation", "Déploiement"],
  summary: "Enregistrer systématiquement les paramètres, la version du code, la version des données, les métriques et les artefacts de chaque entraînement, puis promouvoir les meilleurs modèles obtenus via un registre versionné (Staging → Production).",
  intuition: "Le cahier de laboratoire : un chimiste note chaque réactif, chaque quantité et chaque température pour chaque expérience, afin de pouvoir reproduire un bon résultat et expliquer un mauvais. Le suivi d’expériences, c’est ce cahier rempli automatiquement ; le registre de modèles, c’est l’étagère où seuls les lots validés et étiquetés sont rangés avant expédition.",
  whenToUse: "Dès que vous lancez plus d’une poignée d’expériences (recherches d’hyperparamètres, variantes de variables), que vous travaillez en équipe, ou que vous avez besoin d’une piste d’audit indiquant quelle version du modèle est en production et comment elle a été entraînée.",
  whenToAvoid: "Pour de minuscules scripts jetables ; et même là, journaliser dans un stockage MLflow local ne coûte presque rien.",
  requirements: {
    trackingServer: "Fichiers locaux ou serveur distant (MLflow, W&B, Neptune)"
  },
  parameters: [
    {
      impact: "L’endroit où sont stockés runs, métriques et artefacts ; un serveur partagé permet à toute l’équipe de comparer les runs.",
      tuningTip: "En équipe, utilisez une base de données + un stockage objet (S3/GCS)."
    },
    {
      impact: "Regroupe des runs liés pour pouvoir les comparer côte à côte.",
      tuningTip: "Une expérience par problème métier, par ex. « churn-prediction »."
    },
    {
      impact: "Journalise automatiquement paramètres, métriques et modèle pour sklearn, XGBoost, PyTorch, etc.",
      tuningTip: "Activez-le, puis journalisez à la main les métriques métier supplémentaires et la version des données."
    },
    {
      impact: "Indique quelle version enregistrée du modèle l’infrastructure de mise en service doit charger.",
      tuningTip: "Servez par alias (models:/churn@champion) pour que les promotions ne nécessitent aucune modification du code."
    }
  ],
  math: {
    loss: "Traçabilité reproductible des runs",
    explanation: "Chaque run est une fonction déterministe de son code, de ses données et de ses hyperparamètres (à graines aléatoires fixées). Journaliser toutes les entrées rend n’importe quel résultat reproductible, et comparer les métriques de validation entre runs permet de choisir le candidat à enregistrer."
  },
  pros: [
    "Reproductibilité et traçabilité complètes pour chaque modèle en production",
    "Comparaison visuelle facile de centaines de runs et de balayages d’hyperparamètres",
    "Le registre offre une source de vérité unique pour le déploiement, avec validations et retour arrière"
  ],
  cons: [
    "Exige de la discipline pour journaliser les versions des données, pas seulement les paramètres",
    "Héberger soi-même un serveur de suivi ajoute de l’infrastructure à maintenir",
    "Le stockage des artefacts peut vite grossir avec de gros modèles"
  ],
  diagram: `flowchart TD
    A["Script d’entraînement"] --> B["Démarrer un run"]
    B --> C["Journaliser paramètres + commit du code + version des données"]
    C --> D["Entraîner le modèle"]
    D --> E["Journaliser métriques & artefacts"]
    E --> F[("Serveur de suivi")]
    F --> G["Comparer les runs dans l’interface"]
    G --> H{"Le meilleur run bat-il le champion ?"}
    H -->|"oui"| I["Enregistrer une nouvelle version du modèle"]
    H -->|"non"| A
    I --> J["Définir l’alias : challenger → champion"]
    J --> K["La mise en service charge models:/name@champion"]`
};
