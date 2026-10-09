/**
 * Precision / recall / F1 explainer state and helpers shared by the steps and the scene.
 */
import {
	confusion,
	fbeta,
	precision,
	recall,
	samplesFor,
	type Counts,
	type Outcome,
	type Sample
} from '../_classification/metrics.ts';

export type Beta = 0.5 | 1 | 2;

export interface PRState {
	thr: number;
	beta: Beta;
	/** Which cells to highlight while explaining precision or recall. */
	focus: 'precision' | 'recall' | null;
	show: { curves: boolean; f: boolean; means: boolean; target: boolean };
	ui: { drag: boolean; beta: boolean };
	did: { low: boolean; high: boolean; drag: boolean };
}

export const N_POS = 40;
export const N_NEG = 80;
export const TARGET_RECALL = 0.9;

export const samplesOf = (): Sample[] => samplesFor({ nPos: N_POS, nNeg: N_NEG, sep: 2, seed: 1 });

export const countsOf = (s: PRState, thr = s.thr): Counts => confusion(samplesOf(), thr);

export const focusCells = (s: PRState): Outcome[] | null =>
	s.focus === 'precision' ? ['tp', 'fp'] : s.focus === 'recall' ? ['tp', 'fn'] : null;

/** Score of the single most suspicious item: a threshold here flags just one. */
export const TOP_SCORE = Math.max(...samplesOf().map((x) => x.score));

/** Precision, recall and F-beta along the threshold axis. */
export function curves(beta: number) {
	const P: [number, number][] = [];
	const R: [number, number][] = [];
	const F: [number, number][] = [];
	for (let i = 0; i <= 200; i++) {
		const t = i / 200;
		const c = confusion(samplesOf(), t);
		const p = precision(c);
		if (Number.isFinite(p)) P.push([t, p]);
		R.push([t, recall(c)]);
		const f = fbeta(c, beta);
		if (Number.isFinite(f)) F.push([t, f]);
	}
	return { P, R, F };
}

/** Best F-beta over the slider's thresholds (0.00 … 1.00) and where it is reached. */
export function bestF(beta: number): { thr: number; f: number } {
	let b = { thr: 0.5, f: -1 };
	for (let i = 0; i <= 100; i++) {
		const f = fbeta(confusion(samplesOf(), i / 100), beta);
		if (f > b.f) b = { thr: i / 100, f };
	}
	return b;
}

/** Best precision with recall ≥ the target, over the slider's thresholds (0.00 … 1.00). */
export function bestAtTarget(): { thr: number; precision: number; recall: number } {
	let b = { thr: 0, precision: -1, recall: 0 };
	for (let i = 0; i <= 100; i++) {
		const c = confusion(samplesOf(), i / 100);
		const p = precision(c);
		if (recall(c) >= TARGET_RECALL && p >= b.precision) b = { thr: i / 100, precision: p, recall: recall(c) };
	}
	return b;
}

export function setThr(s: PRState, v: number) {
	s.thr = v;
	s.did.drag = true;
	if (v <= 0.1) s.did.low = true;
	if (v >= 0.9) s.did.high = true;
}

export const off = { drag: false, beta: false };

export function init(): PRState {
	return {
		thr: 0.5,
		beta: 1,
		focus: null,
		show: { curves: false, f: false, means: false, target: false },
		ui: { ...off },
		did: { low: false, high: false, drag: false }
	};
}
