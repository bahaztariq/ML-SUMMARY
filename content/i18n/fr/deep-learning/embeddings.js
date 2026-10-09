export default {
  name: "Embeddings (vecteurs de mots, d’entités et de phrases)",
  category: "Apprentissage de représentations",
  task: ["TAL", "Prétraitement", "Architecture"],
  summary: "Des vecteurs denses appris qui représentent des éléments discrets (mots, tokens, utilisateurs, produits, phrases) de sorte que les éléments similaires se retrouvent proches les uns des autres dans un espace continu.",
  intuition: "Le plan de la ville du sens : au lieu de donner à chaque mot sa propre carte d’identité isolée (one-hot), on place chaque mot à une coordonnée GPS sur une carte. « Paris » habite près de « Londres », « chat » près de « chien », et aller de « homme » à « roi » revient à suivre la même direction que de « femme » à « reine ».",
  whenToUse: "Variables catégorielles à forte cardinalité (identifiants d’utilisateurs, de produits, codes postaux) dans les réseaux de neurones, couche d’entrée de tout modèle de TAL, recherche sémantique et récupération pour le RAG, systèmes de recommandation, clustering ou dédoublonnage de textes et d’images.",
  whenToAvoid: "Catégories à faible cardinalité, avec seulement quelques valeurs (le one-hot est plus simple et entièrement interprétable), ou modèles à base d’arbres sur données tabulaires, pour lesquels un encodage par la cible ou ordinal fonctionne très bien.",
  parameters: [
    { impact: "Longueur de chaque vecteur ; contrôle la quantité de nuances qui peut être stockée.", tuningTip: "Règle empirique pour les variables catégorielles : min(600, round(1.6 · n_categories^0.56)). Les modèles de phrases utilisent généralement 384–1024." },
    { impact: "Nombre de lignes de la table de correspondance ; la mémoire croît linéairement avec lui.", tuningTip: "Réservez un indice pour les éléments inconnus / rares (catégorie OOV) et pour le padding." },
    { impact: "Les embeddings pré-entraînés (word2vec, GloVe, sentence-transformers) apportent des connaissances issues d’immenses corpus.", tuningTip: "Utilisez des embeddings de texte pré-entraînés ; apprenez les embeddings d’identifiants (utilisateurs, produits) de bout en bout sur votre tâche." },
    { impact: "La façon de mesurer la proximité entre deux vecteurs.", tuningTip: "Normalisez les vecteurs à une longueur unitaire pour que la similarité cosinus devienne un produit scalaire rapide." }
  ],
  math: {
    loss: "Appris via la perte de la tâche en aval, perte skip-gram / contrastive",
    explanation: "Une couche d’embedding est une matrice de poids V × d ; lire la ligne i revient mathématiquement à multiplier un vecteur one-hot par la matrice, mais coûte bien moins cher. Les vecteurs sont entraînés par rétropropagation pour que les éléments apparaissant dans des contextes similaires (word2vec) ou formant des paires correspondantes (apprentissage contrastif) obtiennent une forte similarité cosinus."
  },
  pros: [
    "Compresse des millions de catégories en vecteurs denses compacts",
    "Capture une similarité sémantique que l’encodage one-hot ne peut pas exprimer",
    "Réutilisable : les mêmes embeddings alimentent recherche, clustering, recommandations et classifieurs",
    "Les embeddings pré-entraînés transfèrent des connaissances vers de petits jeux de données"
  ],
  cons: [
    "Les dimensions prises une à une ne sont pas interprétables par un humain",
    "Les grands vocabulaires consomment beaucoup de mémoire",
    "Les éléments nouveaux / jamais vus n’ont pas de vecteur appris (problème du démarrage à froid)",
    "Peuvent encoder les biais sociaux présents dans le corpus d’entraînement"
  ],
  diagram: `flowchart LR
  T["Texte brut : the cat sat"] --> K["Tokenizer → ids 17, 942, 305"]
  K --> L["Table d’embeddings E (V lignes × d colonnes)"]
  L --> V["Lecture des lignes → vecteurs denses"]
  V --> M["Couches de réseau de neurones / Transformer"]
  M --> O["Perte de la tâche"]
  O -.->|"la rétropropagation met à jour les lignes de E"| L
  V --> S["Espace vectoriel : sens proche = points voisins"]
  S --> U1["Recherche sémantique / RAG"]
  S --> U2["Recommandations"]
  S --> U3["Clustering et dédoublonnage"]`
};
