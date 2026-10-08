/**
 * K-Means explainer state and the actions both the lesson steps and the scene controls use.
 */
import * as km from './kmeans';

export type Phase = 'data' | 'placed' | 'assigned' | 'updated';

export interface KMeansState {
	dataset: km.Dataset;
	points: km.Pt[];
	k: number;
	initMethod: 'random' | 'plusplus';
	initSeed: number;
	centroids: km.Pt[];
	/** -1 = not assigned yet. */
	labels: number[];
	/** Path each centroid has travelled. */
	trails: km.Pt[][];
	iteration: number;
	phase: Phase;
	converged: boolean;
	/** Inertia after each update. */
	history: number[];
	show: { regions: boolean; links: boolean; trails: boolean; elbow: boolean };
	ui: { drag: boolean; step: boolean; run: boolean; restart: boolean; k: boolean; init: boolean; dataset: boolean };
	/** Interaction flags used by tasks. */
	did: { drag: boolean; elbowK?: number };
}

const DATA_SEED = 7;
/** Random start that converges to the right answer in 7 iterations. */
export const GOOD_SEED = 3;
/** Random start that gets stuck in a local minimum (two centroids share a blob). */
export const BAD_SEED = 13;

export function setData(s: KMeansState, dataset: km.Dataset) {
	s.dataset = dataset;
	s.points = km.makeData(dataset, DATA_SEED);
	s.centroids = [];
	s.labels = s.points.map(() => -1);
	s.trails = [];
	s.phase = 'data';
	s.iteration = 0;
	s.converged = false;
	s.history = [];
}

export function place(s: KMeansState) {
	s.centroids =
		s.initMethod === 'plusplus' ? km.plusPlusInit(s.points, s.k, s.initSeed) : km.randomInit(s.points, s.k, s.initSeed);
	s.labels = s.points.map(() => -1);
	s.trails = s.centroids.map((c) => [[c[0], c[1]]]);
	s.iteration = 0;
	s.phase = 'placed';
	s.converged = false;
	s.history = [];
}

export function doAssign(s: KMeansState) {
	const next = km.assign(s.points, s.centroids);
	if (s.phase === 'updated' && next.every((l, i) => l === s.labels[i])) s.converged = true;
	s.labels = next;
	s.phase = 'assigned';
}

export function doUpdate(s: KMeansState) {
	s.centroids = km.update(s.points, s.labels, s.centroids);
	s.centroids.forEach((c, j) => s.trails[j]?.push([c[0], c[1]]));
	s.iteration++;
	s.phase = 'updated';
	s.history.push(currentInertia(s));
}

/** Advance one half-step (assign or update). Returns false once converged. */
export function stepOnce(s: KMeansState): boolean {
	if (s.converged) return false;
	if (s.phase === 'data') place(s);
	else if (s.phase === 'assigned') doUpdate(s);
	else doAssign(s);
	return !s.converged;
}

export function runAll(s: KMeansState) {
	for (let i = 0; i < 400 && stepOnce(s); i++);
}

export function restart(s: KMeansState, seed = s.initSeed + 1) {
	s.initSeed = seed;
	place(s);
}

export function currentInertia(s: KMeansState) {
	return s.labels[0] === -1 ? NaN : km.inertia(s.points, s.labels, s.centroids);
}

export const off = { drag: false, step: false, run: false, restart: false, k: false, init: false, dataset: false };

export function init(): KMeansState {
	const s: KMeansState = {
		dataset: 'blobs',
		points: [],
		k: 4,
		initMethod: 'random',
		initSeed: GOOD_SEED,
		centroids: [],
		labels: [],
		trails: [],
		iteration: 0,
		phase: 'data',
		converged: false,
		history: [],
		show: { regions: false, links: false, trails: false, elbow: false },
		ui: { ...off },
		did: { drag: false }
	};
	setData(s, 'blobs');
	return s;
}
