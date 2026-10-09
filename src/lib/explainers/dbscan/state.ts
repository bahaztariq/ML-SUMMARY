/**
 * DBSCAN explainer state. Points are derived from the dataset name (never stored in the
 * reactive state) and the clustering is memoized on (dataset, ε, minPts).
 */
import * as km from '../kmeans/kmeans';
import { closest, memoMap, type Pt } from '../_clustering/data';
import { dbscan, kDistances, makeData, type Dataset, type DbscanResult } from './dbscan';

export interface DbscanState {
	dataset: Dataset;
	eps: number;
	minPts: number;
	/** Inspected point (-1 = none). */
	selected: number;
	/** Growth animation: how many claim events are visible. */
	grow: number;
	view: 'dbscan' | 'kmeans';
	show: {
		/** ε circle + neighbour links around the selected point. */
		circle: boolean;
		/** Colour by core / border / noise. */
		kinds: boolean;
		/** Colour by cluster. */
		clusters: boolean;
		/** Animate cluster growth (only the first `grow` claims are shown). */
		growth: boolean;
		kdist: boolean;
		/** Hide the selected point's kind behind a "?" (quiz). */
		mystery: boolean;
	};
	ui: { eps: boolean; minPts: boolean; select: boolean; grow: boolean; dataset: boolean; view: boolean };
	did: { inspected: number[]; datasets: Dataset[] };
}

export const pointsOf = memoMap((d: Dataset) => makeData(d).points, (d) => d);

export const fit = memoMap(
	(d: Dataset, eps: number, minPts: number): DbscanResult => dbscan(pointsOf(d), eps, minPts),
	(d, eps, minPts) => `${d}|${eps.toFixed(3)}|${minPts}`
);

export const result = (s: DbscanState) => fit(s.dataset, s.eps, s.minPts);
export const points = (s: DbscanState) => pointsOf(s.dataset);

export const kdist = memoMap(
	(d: Dataset, minPts: number) => kDistances(pointsOf(d), minPts - 1),
	(d, minPts) => `${d}|${minPts}`
);

/** K-Means with K = number of generating groups, for comparison. */
export const kmeansFor = memoMap(
	(d: Dataset, k: number) => {
		const pts = pointsOf(d);
		return km.run(pts, km.plusPlusInit(pts, k, 1));
	},
	(d, k) => `${d}|${k}`
);
export const naturalK = (d: Dataset) => (d === 'blobs' || d === 'density' ? 3 : 2);

export function setData(s: DbscanState, d: Dataset) {
	s.dataset = d;
	s.selected = -1;
	s.grow = 0;
	if (!s.did.datasets.includes(d)) s.did.datasets.push(d);
}

export function select(s: DbscanState, i: number) {
	s.selected = i;
	if (i >= 0 && !s.did.inspected.includes(i)) s.did.inspected.push(i);
}

/** Select the point nearest to a location (used to pick deterministic examples). */
export function selectNear(s: DbscanState, p: Pt) {
	s.selected = closest(points(s), p);
}

/** First point of the given kind whose neighbourhood count is exactly `count` (if any). */
export function findPoint(s: DbscanState, pred: (i: number, r: DbscanResult) => boolean): number {
	const r = result(s);
	for (let i = 0; i < r.kind.length; i++) if (pred(i, r)) return i;
	return -1;
}

export function growStep(s: DbscanState, n = 1): boolean {
	const total = result(s).order.length;
	s.grow = Math.min(total, s.grow + n);
	return s.grow < total;
}

/** Claim the next batch: everything reached from the same core point (or the next seed). */
export function growNext(s: DbscanState): boolean {
	const order = result(s).order;
	if (s.grow >= order.length) return false;
	const from = order[s.grow].from;
	s.grow++;
	if (from >= 0) while (s.grow < order.length && order[s.grow].from === from) s.grow++;
	return s.grow < order.length;
}

export const growDone = (s: DbscanState) => s.grow >= result(s).order.length;

export const off = { eps: false, minPts: false, select: false, grow: false, dataset: false, view: false };

export function init(): DbscanState {
	return {
		dataset: 'moons',
		eps: 0.1,
		minPts: 5,
		selected: -1,
		grow: 0,
		view: 'dbscan',
		show: { circle: false, kinds: false, clusters: false, growth: false, kdist: false, mystery: false },
		ui: { ...off },
		did: { inspected: [], datasets: ['moons'] }
	};
}
