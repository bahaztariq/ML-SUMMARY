/**
 * GMM explainer state: the current mixture, which components the responsibilities were
 * computed from (so E and M can be shown as separate moves), and the likelihood history.
 */
import * as km from '../kmeans/kmeans';
import { memo1, memoMap, type Pt } from '../_clustering/data';
import { bicCurve, eStep, initComps, logLikelihood, makeData, mStep, type Comp, type Dataset } from './gmm';

export type Phase = 'init' | 'e' | 'm';

export interface GmmState {
	dataset: Dataset;
	k: number;
	seed: number;
	comps: Comp[];
	/** Components the current responsibilities come from (null = no E-step yet). */
	eComps: Comp[] | null;
	phase: Phase;
	iteration: number;
	/** Log-likelihood at each E-step. */
	ll: number[];
	converged: boolean;
	selected: number;
	view: 'gmm' | 'kmeans';
	show: { ellipses: boolean; heat: boolean; soft: boolean; gamma: boolean; llChart: boolean; bic: boolean };
	ui: { em: boolean; restart: boolean; k: boolean; select: boolean; dataset: boolean; view: boolean; colour: boolean };
	did: { picked: number[] };
}

/** Start that converges to the three true groups in about 20 iterations. */
export const GOOD_SEED = 5;

export const pointsOf = memoMap((d: Dataset) => makeData(d).points, (d) => d);
export const points = (s: GmmState): Pt[] => pointsOf(s.dataset);

const respMemo = memo1(
	(d: Dataset, comps: Comp[]) => eStep(pointsOf(d), comps),
	(d, comps) => d + JSON.stringify(comps)
);

/** Responsibilities γ (n × K) from the last E-step, or null. */
export function resp(s: GmmState): number[][] | null {
	if (!s.eComps) return null;
	return respMemo(s.dataset, plain(s.eComps));
}

export const bicOf = memoMap((d: Dataset) => bicCurve(pointsOf(d), 6), (d) => d);

export const kmeansFor = memoMap(
	(d: Dataset, k: number) => {
		const pts = pointsOf(d);
		return km.run(pts, km.plusPlusInit(pts, k, 1));
	},
	(d, k) => `${d}|${k}`
);

/** Works for plain objects and Svelte proxies alike. */
function plain<T>(v: T): T {
	return JSON.parse(JSON.stringify(v));
}

export const currentLL = (s: GmmState) => logLikelihood(points(s), plain(s.comps));

export function place(s: GmmState) {
	s.comps = initComps(points(s), s.k, s.seed);
	s.eComps = null;
	s.phase = 'init';
	s.iteration = 0;
	s.ll = [];
	s.converged = false;
}

export function doE(s: GmmState) {
	s.eComps = plain(s.comps);
	const ll = currentLL(s);
	if (s.ll.length && ll - s.ll[s.ll.length - 1] < 1e-4) s.converged = true;
	s.ll.push(ll);
	s.phase = 'e';
}

export function doM(s: GmmState) {
	const r = resp(s);
	if (!r) return;
	s.comps = mStep(points(s), r);
	s.iteration++;
	s.phase = 'm';
}

/** One half-step (E or M). Returns false once converged. */
export function stepOnce(s: GmmState): boolean {
	if (s.converged) return false;
	if (s.phase === 'e') doM(s);
	else doE(s);
	return !s.converged;
}

export function runAll(s: GmmState) {
	for (let i = 0; i < 1000 && stepOnce(s); i++);
}

export function setK(s: GmmState, k: number) {
	s.k = k;
	place(s);
	runAll(s);
}

export function setData(s: GmmState, d: Dataset) {
	s.dataset = d;
	s.selected = -1;
	place(s);
}

/** Point whose responsibilities are most evenly split between its top two components. */
export function mostAmbiguous(s: GmmState): number {
	const r = resp(s);
	if (!r) return -1;
	let best = -1;
	let bd = Infinity;
	r.forEach((g, i) => {
		const sorted = [...g].sort((a, b) => b - a);
		const d = sorted[0] - (sorted[1] ?? 0);
		if (d < bd) {
			bd = d;
			best = i;
		}
	});
	return best;
}

export const maxGamma = (s: GmmState, i = s.selected) => {
	const r = resp(s);
	return r && i >= 0 ? Math.max(...r[i]) : 1;
};

export const off = { em: false, restart: false, k: false, select: false, dataset: false, view: false, colour: false };

export function init(): GmmState {
	const s: GmmState = {
		dataset: 'stretched',
		k: 3,
		seed: GOOD_SEED,
		comps: [],
		eComps: null,
		phase: 'init',
		iteration: 0,
		ll: [],
		converged: false,
		selected: -1,
		view: 'gmm',
		show: { ellipses: false, heat: false, soft: true, gamma: false, llChart: false, bic: false },
		ui: { ...off },
		did: { picked: [] }
	};
	place(s);
	return s;
}
