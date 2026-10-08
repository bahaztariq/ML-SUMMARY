/**
 * Concept registry. One file per concept under content/<track>/<id>.js.
 * Order here is the default display order.
 */

import whatIsAi from './fundamentals/what-is-ai.js';
import whatIsMl from './fundamentals/what-is-ml.js';
import whatIsDe from './fundamentals/what-is-de.js';
import whatIsClustering from './fundamentals/what-is-clustering.js';
import whatIsClassification from './fundamentals/what-is-classification.js';
import whatIsRegression from './fundamentals/what-is-regression.js';
import whatIsDimensionalityReduction from './fundamentals/what-is-dimensionality-reduction.js';
import supervisedVsUnsupervised from './fundamentals/supervised-vs-unsupervised.js';
import whatIsDeepLearning from './fundamentals/what-is-deep-learning.js';
import lossVsCostFunction from './fundamentals/loss-vs-cost-function.js';
import whatIsGradientDescent from './fundamentals/what-is-gradient-descent.js';
import whatIsFeatureEngineering from './fundamentals/what-is-feature-engineering.js';
import etlVsElt from './fundamentals/etl-vs-elt.js';
import randomForest from './ml-models/random-forest.js';
import xgboost from './ml-models/xgboost.js';
import logisticRegression from './ml-models/logistic-regression.js';
import linearRegression from './ml-models/linear-regression.js';
import svm from './ml-models/svm.js';
import knn from './ml-models/knn.js';
import kmeans from './ml-models/kmeans.js';
import pca from './ml-models/pca.js';
import parquetFormat from './data-eng/parquet-format.js';
import apacheKafka from './data-eng/apache-kafka.js';
import apacheSpark from './data-eng/apache-spark.js';
import lakehouseArchitecture from './data-eng/lakehouse-architecture.js';
import airflow from './data-eng/airflow.js';
import biasVarianceTradeoff from './ml-core/bias-variance-tradeoff.js';
import featureScaling from './ml-core/feature-scaling.js';
import transformerArchitecture from './deep-learning/transformer-architecture.js';
import modelDataDrift from './mlops/model-data-drift.js';
import rmseMetric from './ml-core/rmse-metric.js';
import r2Score from './ml-core/r2-score.js';
import maeMetric from './ml-core/mae-metric.js';
import rocAuc from './ml-core/roc-auc.js';
import logLoss from './ml-core/log-loss.js';
import silhouetteScore from './ml-core/silhouette-score.js';
import confusionMatrixConcept from './ml-core/confusion-matrix-concept.js';
import knnImputer from './ml-core/knn-imputer.js';
import simpleImputer from './ml-core/simple-imputer.js';
import encodingCategorical from './ml-core/encoding-categorical.js';
import trainTestSplit from './ml-core/train-test-split.js';
import crossValidation from './ml-core/cross-validation.js';
import regularizationL1L2 from './ml-core/regularization-l1-l2.js';
import hyperparameterTuning from './ml-core/hyperparameter-tuning.js';
import overfittingUnderfitting from './ml-core/overfitting-underfitting.js';
import decisionTree from './ml-models/decision-tree.js';
import naiveBayes from './ml-models/naive-bayes.js';
import dbscan from './ml-models/dbscan.js';
import lightgbm from './ml-models/lightgbm.js';
import mlpNeuralNetwork from './deep-learning/mlp-neural-network.js';
import cnn from './deep-learning/cnn.js';
import rnnLstm from './deep-learning/rnn-lstm.js';
import mlWorkflow from './fundamentals/ml-workflow.js';
import probabilityStatistics from './fundamentals/probability-statistics.js';
import linearAlgebra from './fundamentals/linear-algebra.js';
import mlLifecycle from './mlops/ml-lifecycle.js';
import experimentTracking from './mlops/experiment-tracking.js';
import modelServing from './mlops/model-serving.js';
import dockerMl from './mlops/docker-ml.js';
import mlCicd from './mlops/ml-cicd.js';
import featureStore from './mlops/feature-store.js';
import abTestingDeployment from './mlops/ab-testing-deployment.js';
import warehouseVsLake from './data-eng/warehouse-vs-lake.js';
import oltpVsOlap from './data-eng/oltp-vs-olap.js';
import dimensionalModeling from './data-eng/dimensional-modeling.js';
import batchVsStream from './data-eng/batch-vs-stream.js';
import cdc from './data-eng/cdc.js';
import dbt from './data-eng/dbt.js';
import dataQuality from './data-eng/data-quality.js';
import dataPartitioning from './data-eng/data-partitioning.js';
import precisionRecallF1 from './ml-core/precision-recall-f1.js';
import prCurve from './ml-core/pr-curve.js';
import classImbalance from './ml-core/class-imbalance.js';
import featureSelection from './ml-core/feature-selection.js';
import modelInterpretability from './ml-core/model-interpretability.js';
import ensembleMethods from './ml-core/ensemble-methods.js';
import curseOfDimensionality from './ml-core/curse-of-dimensionality.js';
import timeSeriesCv from './ml-core/time-series-cv.js';
import gradientBoosting from './ml-models/gradient-boosting.js';
import catboost from './ml-models/catboost.js';
import hierarchicalClustering from './ml-models/hierarchical-clustering.js';
import gmm from './ml-models/gmm.js';
import tsneUmap from './ml-models/tsne-umap.js';
import isolationForest from './ml-models/isolation-forest.js';
import timeSeriesForecasting from './ml-models/time-series-forecasting.js';
import recommenderSystems from './ml-models/recommender-systems.js';
import qLearning from './ml-models/q-learning.js';
import activationFunctions from './deep-learning/activation-functions.js';
import dlOptimizers from './deep-learning/dl-optimizers.js';
import dlRegularization from './deep-learning/dl-regularization.js';
import embeddings from './deep-learning/embeddings.js';
import transferLearning from './deep-learning/transfer-learning.js';
import autoencoders from './deep-learning/autoencoders.js';
import generativeModels from './deep-learning/generative-models.js';
import llms from './deep-learning/llms.js';
import rag from './deep-learning/rag.js';

/** @type {Array<{ id: string, prerequisites: string[], related: string[] } & Record<string, any>>} */
export const concepts = [
  whatIsAi,
  whatIsMl,
  whatIsDe,
  whatIsClustering,
  whatIsClassification,
  whatIsRegression,
  whatIsDimensionalityReduction,
  supervisedVsUnsupervised,
  whatIsDeepLearning,
  lossVsCostFunction,
  whatIsGradientDescent,
  whatIsFeatureEngineering,
  etlVsElt,
  randomForest,
  xgboost,
  logisticRegression,
  linearRegression,
  svm,
  knn,
  kmeans,
  pca,
  parquetFormat,
  apacheKafka,
  apacheSpark,
  lakehouseArchitecture,
  airflow,
  biasVarianceTradeoff,
  featureScaling,
  transformerArchitecture,
  modelDataDrift,
  rmseMetric,
  r2Score,
  maeMetric,
  rocAuc,
  logLoss,
  silhouetteScore,
  confusionMatrixConcept,
  knnImputer,
  simpleImputer,
  encodingCategorical,
  trainTestSplit,
  crossValidation,
  regularizationL1L2,
  hyperparameterTuning,
  overfittingUnderfitting,
  decisionTree,
  naiveBayes,
  dbscan,
  lightgbm,
  mlpNeuralNetwork,
  cnn,
  rnnLstm,
  mlWorkflow,
  probabilityStatistics,
  linearAlgebra,
  mlLifecycle,
  experimentTracking,
  modelServing,
  dockerMl,
  mlCicd,
  featureStore,
  abTestingDeployment,
  warehouseVsLake,
  oltpVsOlap,
  dimensionalModeling,
  batchVsStream,
  cdc,
  dbt,
  dataQuality,
  dataPartitioning,
  precisionRecallF1,
  prCurve,
  classImbalance,
  featureSelection,
  modelInterpretability,
  ensembleMethods,
  curseOfDimensionality,
  timeSeriesCv,
  gradientBoosting,
  catboost,
  hierarchicalClustering,
  gmm,
  tsneUmap,
  isolationForest,
  timeSeriesForecasting,
  recommenderSystems,
  qLearning,
  activationFunctions,
  dlOptimizers,
  dlRegularization,
  embeddings,
  transferLearning,
  autoencoders,
  generativeModels,
  llms,
  rag
].map(c => Object.assign({ prerequisites: [], related: [] }, c));

export const conceptById = new Map(concepts.map(c => [c.id, c]));

/**
 * Concepts that list `id` as a prerequisite ("what this unlocks").
 * @param {string} id
 */
export function getDependents(id) {
  return concepts.filter(c => c.prerequisites.includes(id));
}
