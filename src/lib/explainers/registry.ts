/**
 * Which concepts have a guided explainer (step-by-step lesson) and which only have a free playground.
 * Explainer modules are loaded lazily so the scene code only ships with the pages that use it.
 */
import type { ExplainerModule } from './types';

const explainers: Record<string, () => Promise<ExplainerModule>> = {
	kmeans: () => import('./kmeans/index.ts').then((m) => m.default),
	'decision-tree': () => import('./decision-tree/index.ts').then((m) => m.default)
};

/** Concepts with a guided lesson, in the order they are featured. */
export const explainerIds = Object.keys(explainers);

export function hasExplainer(id: string) {
	return id in explainers;
}

export function loadExplainer(id: string) {
	return explainers[id]?.();
}

/** Concepts with an older free-form playground but no guided explainer yet. */
export function hasPlayground(id: string) {
	return playgroundSet.has(id) && !hasExplainer(id);
}

/**
 * Concepts still served by a legacy playground in #lib/viz/legacy/visualizers.js (loaded lazily).
 * Remove an id here once it has a guided explainer.
 */
const playgroundSet = new Set([
	'dl-optimizers',
	'bias-variance-tradeoff',
	'overfitting-underfitting',
	'knn',
	'roc-auc',
	'precision-recall-f1',
	'pr-curve',
	'activation-functions',
	'pca'
]);

/** Any interactive content at all — used for "Interactive" badges. */
export function isInteractive(id: string) {
	return hasExplainer(id) || playgroundSet.has(id);
}
