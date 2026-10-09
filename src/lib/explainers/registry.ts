/**
 * Which concepts have a guided explainer (step-by-step lesson) and which only have a free playground.
 *
 * Lessons are discovered automatically: every `./<concept-id>/index.ts` is the lesson for that
 * concept. Modules load lazily, so scene code only ships with the pages that use it.
 */
import type { ExplainerModule } from './types';

/** Lesson folders whose name differs from the concept id. */
const FOLDER_TO_CONCEPT: Record<string, string> = {
	'gradient-descent': 'what-is-gradient-descent'
};

const modules = import.meta.glob<{ default: ExplainerModule }>('./*/index.ts');

const explainers: Record<string, () => Promise<ExplainerModule>> = Object.fromEntries(
	Object.entries(modules).map(([path, load]) => {
		const folder = path.split('/')[1];
		return [FOLDER_TO_CONCEPT[folder] ?? folder, () => load().then((m) => m.default)];
	})
);

/** Concepts with a guided lesson. */
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
	'activation-functions'
]);

/** Any interactive content at all — used for "Interactive" badges. */
export function isInteractive(id: string) {
	return hasExplainer(id) || playgroundSet.has(id);
}
