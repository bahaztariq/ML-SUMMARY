/**
 * French translations of site-wide texts (see SiteText in src/lib/content.ts).
 * Anything missing falls back to English.
 */
export default {
  tracks: {
    fundamentals: 'Notions de base',
    'data-eng': 'Ingénierie des données',
    'ml-core': 'Théorie du ML',
    'ml-models': 'Modèles de ML',
    'deep-learning': 'Deep learning',
    mlops: 'MLOps et production'
  },
  paths: {
    'ml-beginner': {
      title: 'Débuter en ML',
      goal: 'De « qu’est-ce que l’IA ? » à l’entraînement et l’évaluation de vos premiers modèles.'
    },
    'tabular-ml': {
      title: 'Praticien du ML tabulaire',
      goal: 'Préparer des tableaux réels et l’emporter avec les ensembles d’arbres.'
    },
    unsupervised: {
      title: 'Apprentissage non supervisé',
      goal: 'Trouver de la structure dans des données non étiquetées : clusters, embeddings et anomalies.'
    },
    'deep-learning': {
      title: 'Deep learning et LLM',
      goal: 'Les réseaux de neurones, du perceptron aux applications de LLM augmentées par la recherche (RAG).'
    },
    'data-engineer': {
      title: 'Ingénieur des données',
      goal: 'Concevoir le stockage, des pipelines batch et streaming, et un lakehouse gouverné.'
    },
    mlops: {
      title: 'Ingénieur MLOps',
      goal: 'Faire passer un modèle du notebook à un service en production supervisé.'
    }
  },
  roadmap: {
    foundations: {
      title: 'Fondamentaux',
      goal: 'Ce qu’est l’apprentissage automatique, les problèmes qu’il résout et les mathématiques sur lesquelles il repose.',
      milestones: ['Vue d’ensemble', 'Les tâches de base', 'La boîte à outils mathématique', 'Un premier regard plus loin']
    },
    'data-prep': {
      title: 'Préparer les données',
      goal: 'Découper les données honnêtement et transformer les colonnes brutes en variables qu’un modèle peut apprendre.',
      milestones: ['Une évaluation honnête', 'Ingénierie des variables', 'Valeurs manquantes']
    },
    'first-models': {
      title: 'Premiers modèles',
      goal: 'Entraîner et comprendre les modèles supervisés classiques et interprétables.',
      milestones: ['Modèles linéaires', 'Classifieurs intuitifs']
    },
    evaluation: {
      title: 'Évaluer les modèles',
      goal: 'Mesurer ce qu’un modèle réussit et rate, et choisir la métrique adaptée au problème.',
      milestones: ['Métriques de régression', 'Métriques de classification']
    },
    generalization: {
      title: 'Généralisation et réglage',
      goal: 'Diagnostiquer le surapprentissage, maîtriser la complexité, gérer les données difficiles, puis régler et expliquer les modèles.',
      milestones: ['Sur- et sous-apprentissage', 'Données plus difficiles', 'Régler et expliquer']
    },
    'advanced-supervised': {
      title: 'Modèles supervisés puissants',
      goal: 'Marges, noyaux et les ensembles d’arbres qui dominent sur les données tabulaires.',
      milestones: ['Méthodes à noyau', 'Ensembles d’arbres']
    },
    unsupervised: {
      title: 'Apprentissage non supervisé',
      goal: 'Trouver de la structure sans étiquettes : clusters, représentations compactes et anomalies.',
      milestones: ['Clustering', 'Dimensions et anomalies']
    },
    'beyond-tables': {
      title: 'Au-delà des tableaux',
      goal: 'Des problèmes à la forme particulière : données ordonnées dans le temps, et prédire ce que les utilisateurs vont aimer.',
      milestones: ['Types de problèmes particuliers']
    },
    'deep-learning': {
      title: 'Deep learning et LLM',
      goal: 'Les réseaux de neurones, du perceptron aux transformers, modèles génératifs, RAG et apprentissage par renforcement profond.',
      milestones: ['Bases des réseaux de neurones', 'Architectures', 'L’IA moderne', 'Apprendre par essais et erreurs']
    },
    'data-engineering': {
      title: 'Ingénierie des données',
      goal: 'Stocker, modéliser, déplacer et gouverner les données dont dépend le ML.',
      milestones: ['Bases du stockage', 'Modélisation et qualité', 'Pipelines à grande échelle']
    },
    mlops: {
      title: 'MLOps et production',
      goal: 'Livrer des modèles de façon fiable : suivi, empaquetage, service, déploiement et supervision.',
      milestones: ['Du notebook au service', 'Exploitation en production']
    }
  }
};
