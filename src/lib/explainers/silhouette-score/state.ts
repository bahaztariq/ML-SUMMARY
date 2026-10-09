/**
 * Silhouette explainer state. Labels come from K-Means (memoized per dataset and K) or from the
 * generating groups, with an optional single-point override to show a misassigned point.
 */
import { closest, memoMap, type Pt } from '../_clustering/data';
import { kmeansLabels, makeData, silhouette, silhouetteCurve, type Dataset, type Silhouette } from './silhouette';

export interface SilState {
	dataset: Dataset;
	k: number;
	/** Score K-Means' clusters or the true generating groups. */
	mode: 'kmeans' | 'truth';
	/** Force one point into another cluster. */
	override: { i: number; to: number } | null;
	selected: number;
	show: {
		/** Lines to the own cluster (a). */
		a: boolean;
		/** Lines to the nearest other cluster (b). */
		b: boolean;
		/** Mean distance to every cluster, written at its centre. */
		means: boolean;
		plot: boolean;
		curve: boolean;
	};
	ui: { select: boolean; k: boolean; dataset: boolean; mode: boolean };
	did: { picked: number[]; ks: number[] };
}

const data = memoMap((d: Dataset) => makeData(d), (d) => d);
export const points = (s: SilState): Pt[] => data(s.dataset).points;

const kmLabels = memoMap((d: Dataset, k: number) => kmeansLabels(data(d).points, k), (d, k) => `${d}|${k}`);

export function labels(s: SilState): number[] {
	const base = s.mode === 'truth' ? data(s.dataset).truth : kmLabels(s.dataset, s.k);
	if (!s.override) return base;
	const out = [...base];
	out[s.override.i] = s.override.to;
	return out;
}

const silMemo = memoMap(
	(d: Dataset, mode: string, k: number, ov: string, lab: number[]) => silhouette(data(d).points, lab),
	(d, mode, k, ov) => `${d}|${mode}|${k}|${ov}`
);

export function sil(s: SilState): Silhouette {
	const ov = s.override ? `${s.override.i}>${s.override.to}` : '';
	return silMemo(s.dataset, s.mode, s.mode === 'truth' ? 0 : s.k, ov, labels(s));
}

export const curveOf = memoMap((d: Dataset) => silhouetteCurve(data(d).points, 8), (d) => d);
export const bestK = (s: SilState) => {
	const c = curveOf(s.dataset);
	return c.indexOf(Math.max(...c)) + 2;
};

export const nClusters = (s: SilState) => Math.max(...labels(s)) + 1;

export function select(s: SilState, i: number) {
	s.selected = i;
	if (i >= 0 && !s.did.picked.includes(i)) s.did.picked.push(i);
}

export function selectNear(s: SilState, p: Pt) {
	s.selected = closest(points(s), p);
}

export function setK(s: SilState, k: number) {
	s.k = k;
	s.mode = 'kmeans';
	s.override = null;
	if (!s.did.ks.includes(k)) s.did.ks.push(k);
}

export function setData(s: SilState, d: Dataset) {
	s.dataset = d;
	s.override = null;
	s.selected = -1;
	if (d === 'blobs') s.mode = 'kmeans';
}

/** Lowest-scoring point: the one closest to switching cluster. */
export function weakest(s: SilState): number {
	const v = sil(s).s;
	return v.indexOf(Math.min(...v));
}

export const off = { select: false, k: false, dataset: false, mode: false };

export function init(): SilState {
	return {
		dataset: 'blobs',
		k: 4,
		mode: 'kmeans',
		override: null,
		selected: -1,
		show: { a: false, b: false, means: false, plot: false, curve: false },
		ui: { ...off },
		did: { picked: [], ks: [] }
	};
}
