/**
 * Logistic-regression explainer state and the actions shared by lesson steps and scene controls.
 */
import { blobs, moons, memo, type Data, type Pt } from '../_classifiers/data.ts';
import * as lr from './logistic.ts';

export type Dataset = 'overlap' | 'clear' | 'moons';

export const DATA: Record<Dataset, Data> = {
	overlap: blobs(5, 60, { c0: [-0.38, -0.25], c1: [0.38, 0.25], spread: [0.38, 0.38] }),
	clear: blobs(9, 60, { c0: [-0.42, -0.3], c1: [0.42, 0.3], spread: [0.2, 0.2] }),
	moons: moons(4, 80, 0.13)
};

/** A deliberately poor starting line (almost horizontal, wrong tilt). */
export const START: lr.Model = { w: [-1, 2.5], b: 0.6 };
/** A reasonable hand-picked line for the opening steps. */
export const HAND: lr.Model = { w: [3, 2.4], b: 0 };
export const LR = 2;
/** Stop training once the gradient is this small. */
export const TOL = 2e-3;

export interface LogState {
	dataset: Dataset;
	model: lr.Model;
	/** Inverse regularisation strength; Infinity = no penalty. */
	C: number;
	threshold: number;
	probe: Pt;
	iter: number;
	history: number[];
	show: {
		probe: boolean;
		line: boolean;
		normal: boolean;
		sides: boolean;
		sigmoid: boolean;
		regions: boolean;
		contours: boolean;
		rings: boolean;
		loss: boolean;
		confusion: boolean;
	};
	ui: { probe: boolean; weights: boolean; train: boolean; threshold: boolean; C: boolean; dataset: boolean };
	did: { flip: boolean; weights: boolean; cLow: boolean; cHigh: boolean };
}

export const data = (s: LogState) => DATA[s.dataset];

const fits = memo<lr.Model>(80);
export const best = (dataset: Dataset, C: number) => fits(`${dataset}|${C}`, () => lr.fit(DATA[dataset], C));

/** Plain copy of the model (safe to hand to pure math without proxies). */
export const model = (s: LogState): lr.Model => ({ w: [s.model.w[0], s.model.w[1]], b: s.model.b });

export function lossOf(s: LogState) {
	return lr.loss(model(s), data(s), s.C);
}

export function accuracyOf(s: LogState, threshold = s.threshold) {
	const c = lr.confusion(model(s), data(s), threshold);
	return (c.tp + c.tn) / data(s).X.length;
}

export const confusionOf = (s: LogState) => lr.confusion(model(s), data(s), s.threshold);
export const gradNormOf = (s: LogState) => lr.gradNorm(lr.gradient(model(s), data(s), s.C));
export const converged = (s: LogState) => gradNormOf(s) < TOL;

export function setModel(s: LogState, m: lr.Model) {
	s.model = { w: [m.w[0], m.w[1]], b: m.b };
}

export function resetTraining(s: LogState, from: lr.Model = START) {
	setModel(s, from);
	s.iter = 0;
	s.history = [lossOf(s)];
}

/** `n` gradient-descent steps. Returns false once converged. */
export function train(s: LogState, n = 1): boolean {
	const d = data(s);
	let m = model(s);
	for (let i = 0; i < n; i++) {
		if (lr.gradNorm(lr.gradient(m, d, s.C)) < TOL) break;
		m = lr.gdStep(m, d, s.C, LR);
		s.iter++;
		s.history.push(lr.loss(m, d, s.C));
	}
	setModel(s, m);
	return !converged(s);
}

export function fitNow(s: LogState) {
	setModel(s, best(s.dataset, s.C));
}

export function setDataset(s: LogState, d: Dataset) {
	s.dataset = d;
	fitNow(s);
	s.iter = 0;
	s.history = [lossOf(s)];
}

/** Move the probe onto the line z = level (closest point). */
export function probeOnLine(s: LogState, level = 0) {
	const m = model(s);
	const z = lr.score(m, s.probe);
	const n2 = m.w[0] ** 2 + m.w[1] ** 2;
	if (n2 < 1e-12) return;
	const k = (z - level) / n2;
	s.probe = [s.probe[0] - k * m.w[0], s.probe[1] - k * m.w[1]];
}

/** The slider for C runs over 0.001 … 100 on a log scale. */
export const C_STEPS = [0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30, 100];
export const cLabel = (C: number) => (Number.isFinite(C) ? String(C) : '∞ (no penalty)');

export const off = { probe: false, weights: false, train: false, threshold: false, C: false, dataset: false };
const hidden = {
	probe: false,
	line: true,
	normal: false,
	sides: false,
	sigmoid: false,
	regions: false,
	contours: false,
	rings: false,
	loss: false,
	confusion: false
};

export function init(): LogState {
	const s: LogState = {
		dataset: 'overlap',
		model: { w: [HAND.w[0], HAND.w[1]], b: HAND.b },
		C: Infinity,
		threshold: 0.5,
		probe: [-0.55, 0.55],
		iter: 0,
		history: [],
		show: { ...hidden },
		ui: { ...off },
		did: { flip: false, weights: false, cLow: false, cHigh: false }
	};
	return s;
}

export function setC(s: LogState, C: number) {
	s.C = C;
	if (C <= 0.01) s.did.cLow = true;
	if (C >= 30) s.did.cHigh = true;
	fitNow(s);
	s.iter = 0;
	s.history = [lossOf(s)];
}

/** Training point with the largest log-loss under the current model. */
export function worstPoint(s: LogState) {
	const d = data(s);
	const m = model(s);
	let i = 0;
	let worst = -1;
	d.X.forEach((p, j) => {
		const l = lr.pointLoss(m, p, d.y[j]);
		if (l > worst) {
			worst = l;
			i = j;
		}
	});
	return { i, loss: worst, p: Math.exp(-worst) };
}
