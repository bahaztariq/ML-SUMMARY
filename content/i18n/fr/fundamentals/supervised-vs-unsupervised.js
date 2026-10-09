export default {
  name: "Apprentissage supervisé, non supervisé et par renforcement",
  category: "Paradigmes d’apprentissage",
  task: ["Définition", "Fondamentaux", "Comparaison"],
  summary: "Les trois grands paradigmes d’apprentissage du Machine Learning, distingués selon que le signal de retour pendant l’entraînement est présent, absent ou fondé sur des récompenses.",
  intuition: "Trois façons d’apprendre la guitare : 1) Supervisé : un professeur, assis à côté de vous, corrige immédiatement chaque fausse note. 2) Non supervisé : vous écoutez 1 000 chansons sans professeur et remarquez que certains accords sonnent naturellement bien ensemble. 3) Par renforcement : vous jouez sur scène les yeux bandés ; quand le public applaudit, vous gardez ce riff, quand il siffle, vous le changez.",
  whenToUse: "Supervisé : lorsque des étiquettes historiques existent. Non supervisé : pour explorer des données brutes non étiquetées. Par renforcement : lorsqu’un agent doit apprendre des stratégies séquentielles optimales en interagissant avec un environnement.",
  whenToAvoid: "Vouloir à tout prix faire du supervisé alors que l’annotation des données coûte trop cher (passez plutôt au non supervisé ou à l’auto-supervisé).",
  parameters: [
    {
      impact: "Retour d’erreur direct entre la prédiction ŷ et la vraie étiquette y.",
      tuningTip: "Régression et classification."
    },
    {
      impact: "Pas d’étiquettes ; découvre des clusters, des variétés cachées et des distributions de densité.",
      tuningTip: "Clustering et réduction de dimension."
    },
    {
      impact: "Exploration par essais et erreurs dans un environnement interactif.",
      tuningTip: "Agents de jeu, robots autonomes, algorithmes de trading."
    }
  ],
  math: {
    loss: "Comparaison des objectifs d’optimisation",
    explanation: "Le supervisé minimise l’erreur sur les étiquettes ; le non supervisé maximise la vraisemblance ou minimise l’erreur de reconstruction ; le renforcement maximise l’espérance des récompenses futures actualisées."
  },
  pros: [
    "Fournit la taxonomie de base pour cadrer immédiatement n’importe quel problème réel",
    "Oriente la collecte des données et le budget d’annotation avant d’écrire la moindre ligne de code"
  ],
  cons: [
    "Les frontières peuvent s’estomper dans l’IA moderne (par ex. l’apprentissage auto-supervisé des LLM génère ses propres étiquettes à partir du texte)"
  ],
  diagram: `flowchart TD
    A(["À quoi ressemblent vos données / votre signal ?"]) --> B{"Une cible étiquetée y est-elle disponible ?"}
    B -->|"oui"| C["Apprentissage supervisé"]
    C --> D{"Type de cible ?"}
    D -->|"catégorie"| E["Classification"]
    D -->|"nombre"| F["Régression"]
    B -->|"pas d’étiquettes"| G["Apprentissage non supervisé"]
    G --> H["Clustering"]
    G --> I["Réduction de dimension"]
    B -->|"seulement des récompenses liées aux actions"| J["Apprentissage par renforcement"]
    J --> K["L’agent agit → environnement → récompense → mise à jour de la politique"]
    K --> J`
};
