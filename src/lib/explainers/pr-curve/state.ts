/**
 * PR-curve explainer state and helpers shared by the steps and the scene.
 */
import {
	averagePrecision,
	confusion,
	precision,
	recall,
	rocAuc,
	samplesFor,
	sweep,
	type Sample,
	type SweepPt
} from '../_classification/metrics.ts';

export type Curve = 'none' | 'trace' | 'full';

export interface PCState {
	thr: number;
	/** Index into PREVALENCES. */
	prev: number;
	sep: number;
	/** Lowest threshold visited since the trace started. */
	reached: number;
	show: { pr: boolean; curve: Curve; baseline: boolean; ap: boolean; roc: boolean; matrix: boolean; target: boolean };
	ui: { drag: boolean; trace: boolean; prev: boolean; sep: boolean };
	did: { drag: boolean };
}

/** Share of positives the class-ratio slider steps through. The 40 positives stay; negatives are added. */
export const PREVALENCES = [0.5, 0.2, 0.1, 0.05, 0.02, 0.01];
export const N_POS = 40;
export const SEP = 2.4;
export const TARGET_PRECISION = 0.9;

export const prevalenceOf = (s: PCState) => PREVALENCES[s.prev];
export const nNegOf = (s: PCState) => Math.round((N_POS * (1 - prevalenceOf(s))) / prevalenceOf(s));

export const samplesOf = (s: PCState): Sample[] => samplesFor({ nPos: N_POS, nNeg: nNegOf(s), sep: s.sep, seed: 1 });
export const sweepOf = (s: PCState): SweepPt[] => sweep(samplesOf(s));
export const apOf = (s: PCState) => averagePrecision(sweepOf(s));
export const aucOf = (s: PCState) => rocAuc(sweepOf(s));
export const countsOf = (s: PCState, thr = s.thr) => confusion(samplesOf(s), thr);

export const traced = (s: PCState) => s.reached <= Math.min(...samplesOf(s).map((x) => x.score));

/** Highest recall with precision ≥ target, over the slider's thresholds (0.00 … 1.00). */
export function bestAtPrecision(s: PCState): { thr: number; precision: number; recall: number } {
	let b = { thr: 1, precision: NaN, recall: -1 };
	for (let i = 0; i <= 100; i++) {
		const c = countsOf(s, i / 100);
		const p = precision(c);
		const r = recall(c);
		if (p >= TARGET_PRECISION && r > b.recall) b = { thr: i / 100, precision: p, recall: r };
	}
	return b;
}

/** Highest slider threshold that still catches at least `target` of the positives. */
export function thrForRecall(s: PCState, target: number): number {
	for (let i = 100; i >= 0; i--) if (recall(countsOf(s, i / 100)) >= target) return i / 100;
	return 0;
}

export function setThr(s: PCState, v: number) {
	s.thr = v;
	s.reached = Math.min(s.reached, v);
	s.did.drag = true;
}

export function startTrace(s: PCState) {
	s.thr = 1;
	s.reached = 1;
}

export const off = { drag: false, trace: false, prev: false, sep: false };

export function init(): PCState {
	return {
		thr: 0.5,
		prev: 1,
		sep: SEP,
		reached: 0,
		show: { pr: true, curve: 'none', baseline: false, ap: false, roc: false, matrix: true, target: false },
		ui: { ...off },
		did: { drag: false }
	};
}
