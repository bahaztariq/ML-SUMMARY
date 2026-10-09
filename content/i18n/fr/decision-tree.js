/**
 * French translation of content/decision-tree.js, keyed by node id.
 * Questions: { q, options: [labels in the same order] }. Results: { note }.
 * Ids, `next` links and concept ids stay in the English file.
 */
export default {
  start: {
    q: 'Avez-vous des données étiquetées (une colonne cible connue à prédire) ?',
    options: [
      'Oui, chaque ligne a une étiquette',
      'Pas d’étiquettes, je veux découvrir une structure',
      'Un agent apprend à partir de récompenses au fil du temps'
    ]
  },
  supervised: {
    q: 'Que cherchez-vous à prédire ?',
    options: [
      'Une catégorie (spam / non-spam, quelle espèce…)',
      'Un nombre (prix, température…)',
      'Les valeurs futures d’une série temporelle'
    ]
  },
  clsData: {
    q: 'À quoi ressemblent vos données d’entrée ?',
    options: ['Des tableaux / feuilles de calcul', 'Du texte libre', 'Des images']
  },
  clsGoal: {
    q: 'Qu’est-ce qui compte le plus ?',
    options: [
      'L’interprétabilité : je dois expliquer les décisions',
      'La meilleure précision sur un grand tableau',
      'Une référence rapide sur un petit jeu de données',
      'Une classe positive rare (fraude, maladie)'
    ]
  },
  regGoal: {
    q: 'Qu’est-ce qui compte le plus ?',
    options: [
      'L’interprétabilité et les coefficients',
      'La meilleure précision sur un grand tableau',
      'Une référence rapide sur un petit jeu de données'
    ]
  },
  unsupervised: {
    q: 'Quel est votre objectif ?',
    options: [
      'Regrouper les lignes similaires',
      'Réduire ou visualiser de nombreuses variables',
      'Trouver les lignes rares / anormales',
      'Recommander des articles aux utilisateurs'
    ]
  },
  clusterK: {
    q: 'Savez-vous à peu près combien il y a de clusters ?',
    options: [
      'Oui, et les clusters ont une forme de « nuage » compact',
      'Non, ou les clusters ont des formes irrégulières et du bruit'
    ]
  },
  dimred: {
    q: 'Pourquoi réduire la dimension ?',
    options: ['Comme prétraitement pour un autre modèle', 'Pour afficher les données en 2D / 3D']
  },

  clsExplain: { note: 'Commencez simple : les coefficients et les découpages d’un arbre se lisent directement.' },
  clsBaseline: { note: 'Rapides à entraîner ; de bons étalons avant d’essayer les méthodes d’ensemble.' },
  regExplain: { note: 'Les modèles linéaires régularisés restent lisibles et robustes.' },
  regBaseline: { note: 'Établissez un RMSE de référence avant toute chose plus sophistiquée.' },
  boosting: {
    note: 'Les arbres à gradient boosting dominent les données tabulaires. CatBoost brille avec de nombreuses colonnes catégorielles ; LightGBM avec des millions de lignes.'
  },
  imbalanced: { note: 'Corrigez d’abord l’évaluation (PR-AUC, rappel), puis le modèle.' },
  text: { note: 'Affinez un transformer pré-entraîné ; Naive Bayes est une référence solide et peu coûteuse.' },
  images: { note: 'Partez d’un CNN pré-entraîné et affinez-le.' },
  timeseries: { note: 'Ne mélangez jamais le temps : validez avec des découpages chronologiques glissants.' },
  clusterKnown: { note: 'Utilisez le score de silhouette pour confirmer k.' },
  clusterUnknown: {
    note: 'DBSCAN trouve des formes arbitraires et signale le bruit ; un dendrogramme aide à choisir k.'
  },
  dimredPre: {
    note: 'L’ACP pour des variables corrélées ; la sélection de variables quand vous avez besoin des colonnes d’origine.'
  },
  dimredViz: {
    note: 'UMAP / t-SNE pour visualiser des clusters ; les distances entre clusters n’ont pas de sens.'
  },
  anomaly: { note: 'Isolation Forest est la référence pour les anomalies dans des données tabulaires.' },
  recsys: { note: 'Filtrage collaboratif ou embeddings appris des utilisateurs et des articles.' },
  rl: {
    note: 'Le Q-learning pour de petits espaces d’actions ; les Deep Q-Networks (un réseau de neurones qui approxime Q) quand les états sont nombreux.'
  }
};
