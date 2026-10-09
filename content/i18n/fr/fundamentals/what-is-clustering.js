export default {
  name: "Qu’est-ce que le clustering ?",
  category: "Tâches fondamentales",
  task: ["Définition", "Clustering", "Non supervisé"],
  summary: "Une tâche d’apprentissage non supervisé qui regroupe des données non étiquetées en clusters, de sorte que les objets d’un même cluster se ressemblent bien plus entre eux qu’avec ceux des autres clusters.",
  intuition: "Trier des chaussettes sans étiquettes : imaginez une montagne de chaussettes propres déversée sur un lit. Personne ne les a étiquetées « chaussette de ville noire » ou « chaussette de sport blanche ». Vous assemblez naturellement les couleurs, longueurs et textures semblables, simplement en observant leurs ressemblances.",
  whenToUse: "Segmentation de clientèle (regrouper les utilisateurs selon leurs habitudes d’achat), détection d’anomalies ou de fraude (les points qui n’appartiennent à aucun cluster), découverte de thèmes dans des documents et compression d’images.",
  whenToAvoid: "Lorsque vous disposez déjà d’étiquettes cibles explicites que vous voulez prédire (utilisez plutôt la classification supervisée).",
  parameters: [
    {
      impact: "Représente chaque cluster par son point moyen central.",
      tuningTip: "Le plus rapide et le plus populaire, mais suppose des clusters ronds et de tailles égales."
    },
    {
      impact: "Relie les régions denses séparées par du bruit clairsemé.",
      tuningTip: "Inutile de fixer le nombre de clusters k à l’avance ; écarte automatiquement les valeurs aberrantes."
    },
    {
      impact: "Construit un arbre de clusters imbriqués, de bas en haut (agglomératif) ou de haut en bas.",
      tuningTip: "Idéal en biologie évolutive ou pour de petits jeux de données où un arbre visuel apporte de la valeur."
    }
  ],
  math: {
    loss: "Somme des carrés intra-cluster (inertie) = ∑_k ∑_i ||x_i - μ_k||²",
    explanation: "Les algorithmes de clustering minimisent mathématiquement la dispersion au sein de chaque groupe (variance intra-cluster) tout en éloignant le plus possible les centres des différents groupes dans l’espace vectoriel."
  },
  pros: [
    "Ne demande aucun effort d’étiquetage humain ni de budget d’annotation coûteux",
    "Révèle des structures naturelles insoupçonnées et des profils types de clients",
    "Permet de construire des variables riches (distances aux clusters) pour des modèles supervisés en aval"
  ],
  cons: [
    "Aucune « vérité terrain » mathématique objective ne prouve quel clustering est le bon",
    "Très sensible aux variables non mises à l’échelle et à la métrique de distance choisie"
  ],
  diagram: `flowchart TD
    A[("Données non étiquetées")] --> B["Mettre les variables à l’échelle"]
    B --> C["Définir la similarité : distance ou densité"]
    C --> D{"Forme de cluster attendue ?"}
    D -->|"ronde, k connu"| E["K-Means / GMM"]
    D -->|"formes arbitraires + bruit"| F["DBSCAN"]
    D -->|"groupes imbriqués"| G["Clustering hiérarchique"]
    E --> H["Attribuer un identifiant de cluster à chaque point"]
    F --> H
    G --> H
    H --> I["Valider : score de silhouette + revue métier"]
    I --> J["Nommer les segments & agir"]`
};
