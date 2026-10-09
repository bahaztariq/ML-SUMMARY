/**
 * ROC-AUC explainer state and helpers shared by the steps and the scene.
 */
import { confusion, fpr, pairWins, rocAuc, samplesFor, sweep, tpr, type Sample, type SweepPt } from '../_classification/metrics.ts';

export type Curve = 'none' | 'trace' | 'full';

export interface ROCState {
	thr: number;
	/** Class separation: 0 = scores carry no information, 6 = perfectly separated. */
	sep: number;
	/** Monotone warp applied to every score (1 = none). */
	warp: number;
	/** Lowest threshold visited since the trace started: the curve is drawn down to here. */
	reached: number;
	/** Random (positive, negative) pairs drawn so far. */
	pairs: number;
	show: { roc: boolean; curve: Curve; area: boolean; corners: boolean; pairs: boolean };
	ui: { drag: boolean; trace: boolean; pairs: boolean; sep: boolean; warp: boolean };
	did: { drag: boolean; low: boolean; high: boolean };
}

export const N_POS = 50;
export const N_NEG = 50;
export const SEP = 1.6;
export const PERFECT_SEP = 6;
export const MAX_PAIRS = 5000;

export const samplesOf = (s: ROCState): Sample[] => samplesFor({ nPos: N_POS, nNeg: N_NEG, sep: s.sep, warp: s.warp, seed: 1 });
export const sweepOf = (s: ROCState): SweepPt[] => sweep(samplesOf(s));
export const aucOf = (s: ROCState) => rocAuc(sweepOf(s));
export const countsOf = (s: ROCState, thr = s.thr) => confusion(samplesOf(s), thr);
export const ratesOf = (s: ROCState) => {
	const c = countsOf(s);
	return { c, tpr: tpr(c), fpr: fpr(c) };
};

/** True once the trace has reached below every score (the curve is complete). */
export const traced = (s: ROCState) => s.reached <= Math.min(...samplesOf(s).map((x) => x.score));

export const wins = (s: ROCState) => pairWins(samplesOf(s), s.pairs, N_POS, N_NEG);

export function setThr(s: ROCState, v: number) {
	s.thr = v;
	s.reached = Math.min(s.reached, v);
	s.did.drag = true;
}

export function setSep(s: ROCState, v: number) {
	s.sep = v;
	const a = aucOf(s);
	if (a <= 0.55) s.did.low = true;
	if (a >= 0.99) s.did.high = true;
}

export function startTrace(s: ROCState) {
	s.thr = 1;
	s.reached = 1;
}

export function drawPairs(s: ROCState, n: number) {
	s.pairs = Math.min(MAX_PAIRS, s.pairs + n);
}

export const off = { drag: false, trace: false, pairs: false, sep: false, warp: false };

export function init(): ROCState {
	return {
		thr: 0.5,
		sep: SEP,
		warp: 1,
		reached: 0,
		pairs: 0,
		show: { roc: false, curve: 'none', area: false, corners: false, pairs: false },
		ui: { ...off },
		did: { drag: false, low: false, high: false }
	};
}
