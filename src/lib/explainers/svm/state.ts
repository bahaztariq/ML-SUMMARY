/**
 * SVM explainer state and the actions shared by lesson steps and scene controls.
 * Points are editable (draggable), so the fitted model is memoized on the point coordinates.
 */
import { accuracy, blobs, circles, clonePts, memo, moons, ptsKey, type Data, type Pt } from '../_classifiers/data.ts';
import * as svm from './svm.ts';

export type Dataset = 'separable' | 'overlap' | 'circles' | 'moons';
export type KernelName = 'linear' | 'rbf';

export const DATA: Record<Dataset, Data> = {
	separable: blobs(12, 26, { c0: [-0.45, -0.3], c1: [0.45, 0.3], spread: [0.2, 0.2] }),
	overlap: blobs(5, 50, { c0: [-0.35, -0.25], c1: [0.35, 0.25], spread: [0.3, 0.3] }),
	circles: circles(3, 120, 0.07),
	moons: moons(8, 100, 0.2)
};
/** Held-out points drawn from the same distributions (for train vs test accuracy). */
export const TEST: Record<Dataset, Data> = {
	separable: blobs(112, 200, { c0: [-0.45, -0.3], c1: [0.45, 0.3], spread: [0.2, 0.2] }),
	overlap: blobs(105, 200, { c0: [-0.35, -0.25], c1: [0.35, 0.25], spread: [0.3, 0.3] }),
	circles: circles(103, 300, 0.07),
	moons: moons(108, 400, 0.2)
};

export const C_STEPS = [0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30, 100, 1000];
export const GAMMA_STEPS = [0.1, 0.3, 1, 3, 10, 30, 100, 300];
/** "Hard margin": a C so large that no violation is worth it on separable data. */
export const HARD_C = 1000;

export interface SvmState {
	dataset: Dataset;
	points: Pt[];
	labels: number[];
	kernel: KernelName;
	C: number;
	gamma: number;
	show: {
		candidates: boolean;
		candidateMargins: boolean;
		model: boolean;
		street: boolean;
		sv: boolean;
		slack: boolean;
		lift: boolean;
		regions: boolean;
		test: boolean;
	};
	ui: { drag: boolean; C: boolean; gamma: boolean; kernel: boolean; dataset: boolean; reset: boolean; view: boolean };
	did: { dragSV: boolean; dragOther: boolean; cLow: boolean; cHigh: boolean; gammaHigh: boolean };
}

const fits = memo<svm.SvmModel>(120);

export const kernelOf = (s: SvmState): svm.Kernel => (s.kernel === 'linear' ? { type: 'linear' } : { type: 'rbf', gamma: s.gamma });

/** The trained SVM for the current points and settings. */
export function fit(s: SvmState): svm.SvmModel {
	const k = kernelOf(s);
	return fits(`${ptsKey(s.points, s.labels)}|${s.kernel}|${s.C}|${s.kernel === 'rbf' ? s.gamma : ''}`, () =>
		svm.train(clonePts(s.points), [...s.labels], s.C, k)
	);
}

export const trainData = (s: SvmState): Data => ({ X: s.points, y: s.labels });
export const trainAcc = (s: SvmState) => {
	const m = fit(s);
	return accuracy(trainData(s), (p) => svm.predict(m, p));
};
export const testAcc = (s: SvmState) => {
	const m = fit(s);
	return accuracy(TEST[s.dataset], (p) => svm.predict(m, p));
};

export function roleCounts(s: SvmState) {
	const m = fit(s);
	const c = { outside: 0, margin: 0, inside: 0, wrong: 0 };
	m.X.forEach((_, i) => c[svm.role(m, i)]++);
	return c;
}

export function setData(s: SvmState, d: Dataset) {
	s.dataset = d;
	s.points = clonePts(DATA[d].X);
	s.labels = [...DATA[d].y];
}

export function setC(s: SvmState, C: number) {
	s.C = C;
	if (C <= 0.03) s.did.cLow = true;
	if (C >= 100) s.did.cHigh = true;
}

export function setGamma(s: SvmState, g: number) {
	s.gamma = g;
	if (g >= GAMMA_STEPS[GAMMA_STEPS.length - 1]) s.did.gammaHigh = true;
}

/* ---- candidate separating lines for the opening question ---- */
export interface Line {
	w: [number, number];
	b: number;
}

/** Smallest distance from any point to the line (its "margin" on one side). */
export function lineMargin(l: Line, d: Data) {
	const n = Math.hypot(l.w[0], l.w[1]);
	let best = Infinity;
	d.X.forEach((p, i) => {
		const signed = ((l.w[0] * p[0] + l.w[1] * p[1] + l.b) / n) * (d.y[i] ? 1 : -1);
		best = Math.min(best, signed);
	});
	return best;
}

/** Three lines that all separate the training set perfectly; #2 is the maximum-margin one. */
export const CANDIDATES: Line[] = (() => {
	const d = DATA.separable;
	const m = svm.train(d.X, d.y, HARD_C, { type: 'linear' }, { tol: 1e-6 });
	const w = m.w!;
	const best: Line = { w: [w[0], w[1]], b: m.b };
	// 1: same direction, shifted most of the way toward class A
	const hugA: Line = { w: [w[0], w[1]], b: m.b + 0.8 };
	// 3: tilted around the midpoint of the support vectors, as far as stays separating (×0.75)
	const sv = m.sv.map((i) => d.X[i]);
	const cx = sv.reduce((a, p) => a + p[0], 0) / sv.length;
	const cy = sv.reduce((a, p) => a + p[1], 0) / sv.length;
	const rot = (a: number): Line => {
		const c = Math.cos(a);
		const s = Math.sin(a);
		const r: [number, number] = [w[0] * c - w[1] * s, w[0] * s + w[1] * c];
		return { w: r, b: -(r[0] * cx + r[1] * cy) };
	};
	let ang = 0;
	while (ang < 1.2 && lineMargin(rot(ang + 0.01), d) > 0) ang += 0.01;
	return [hugA, best, rot(ang * 0.75)];
})();

export const off = { drag: false, C: false, gamma: false, kernel: false, dataset: false, reset: false, view: false };
const hidden = {
	candidates: false,
	candidateMargins: false,
	model: false,
	street: false,
	sv: false,
	slack: false,
	lift: false,
	regions: false,
	test: false
};

export function init(): SvmState {
	const s: SvmState = {
		dataset: 'separable',
		points: [],
		labels: [],
		kernel: 'linear',
		C: HARD_C,
		gamma: 1,
		show: { ...hidden },
		ui: { ...off },
		did: { dragSV: false, dragOther: false, cLow: false, cHigh: false, gammaHigh: false }
	};
	setData(s, 'separable');
	return s;
}
