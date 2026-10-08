/**
 * Concept comparison: URL <-> selection, plus row helpers.
 * Selection lives in the query string as ?a=<id>&b=<id>&c=<id>.
 */
import type { Concept } from '#lib/types.ts';

export const SLOT_KEYS = ['a', 'b', 'c'] as const;
export const MAX_SLOTS = SLOT_KEYS.length;

/** Read the selection from search params: known ids only, no duplicates, in slot order. */
export function parseSelection(params: Pick<URLSearchParams, 'get'>, has: (id: string) => boolean): string[] {
	const out: string[] = [];
	for (const k of SLOT_KEYS) {
		const id = params.get(k)?.trim();
		if (id && has(id) && !out.includes(id)) out.push(id);
	}
	return out;
}

/** Write the selection into `url` (mutates and returns it), keeping unrelated params. */
export function writeSelection(url: URL, ids: string[]): URL {
	for (const k of SLOT_KEYS) url.searchParams.delete(k);
	ids.slice(0, MAX_SLOTS).forEach((id, i) => url.searchParams.set(SLOT_KEYS[i], id));
	return url;
}

/** Union of requirement keys across concepts: keys shared by more concepts first, then alphabetical. */
export function requirementKeys(cs: Concept[]): string[] {
	const count = new Map<string, number>();
	for (const c of cs) for (const k of Object.keys(c.requirements ?? {})) count.set(k, (count.get(k) ?? 0) + 1);
	return [...count.keys()].sort((a, b) => count.get(b)! - count.get(a)! || a.localeCompare(b));
}

/** Concept-id pairs suggested when nothing is selected yet (filtered to ids that exist). */
export const suggestions: [string, string][] = [
	['random-forest', 'xgboost'],
	['kmeans', 'dbscan'],
	['logistic-regression', 'svm'],
	['pca', 'tsne-umap'],
	['lightgbm', 'catboost'],
	['cnn', 'transformer-architecture'],
	['etl-vs-elt', 'batch-vs-stream']
];
