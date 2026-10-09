/**
 * Linear regression explainer state and the actions both the lesson steps and the scene use.
 */
import * as rg from '../_regression/regression.ts';

export type View = 'line' | 'poly';

export interface LRState {
	view: View;
	/** Apartment sizes (m²) and rents (€); the outlier, when present, is the last point. */
	xs: number[];
	ys: number[];
	outlier: boolean;
	/** The line being drawn. */
	line: rg.Line;
	/** Refit by least squares whenever the data changes. */
	autoFit: boolean;
	/** A faded earlier line, for before/after comparisons. */
	ghost: rg.Line | null;
	/** Polynomial part: noisy samples of a curve. */
	px: number[];
	py: number[];
	degree: number;
	penalty: rg.Penalty;
	/** log10 of the regularization strength α. */
	logAlpha: number;
	/** Show x beyond the data (extrapolation). */
	wide: boolean;
	show: { residuals: boolean; landscape: boolean; truth: boolean };
	ui: {
		handles: boolean;
		landscape: boolean;
		fit: boolean;
		dragPoints: boolean;
		outlier: boolean;
		degree: boolean;
		penalty: boolean;
		alpha: boolean;
		range: boolean;
		view: boolean;
	};
	/** Interaction flags used by tasks. */
	did: { handles: boolean; landscape: boolean; dragPoint: boolean };
}

export const DATA_SEED = 3;
export const N = 30;
export const CURVE_SEED = 7;
export const CURVE_N = 12;
/** A data-entry error: a big flat whose rent was typed as €150 instead of €1,500. */
export const OUTLIER = { x: 115, y: 150 };
/** A line that is clearly too flat, to start from. */
export const START_LINE: rg.Line = { w: 4, b: 700 };
/** x positions (m²) of the two line handles. */
export const HANDLE_X: [number, number] = [35, 110];

/** Domains of the plots. */
export const X_DOM: [number, number] = [15, 130];
export const Y_DOM: [number, number] = [0, 1900];
/** The landscape task: get within this factor of the lowest MSE. */
export const LANDSCAPE_TOL = 1.1;
export const W_DOM: [number, number] = [0, 20];
export const B_DOM: [number, number] = [-600, 1200];

export const preds = (s: LRState) => rg.predict(s.line, s.xs);
export const currentMse = (s: LRState) => rg.mse(s.ys, preds(s));
export const best = (s: LRState) => rg.ols(s.xs, s.ys);
export const bestMse = (s: LRState) => rg.mse(s.ys, rg.predict(best(s), s.xs));
/** MSE of the current line relative to the best possible (1 = optimal). */
export const mseRatio = (s: LRState) => currentMse(s) / bestMse(s);

export const alphaOf = (s: LRState) => 10 ** s.logAlpha;

/** α for display: 0.003, 0.25, 1e-5 … */
export function fmtAlpha(lg: number) {
	const a = 10 ** lg;
	if (a >= 1) return a.toFixed(1);
	if (a >= 0.01) return String(+a.toPrecision(2));
	return a.toExponential(0);
}

export function polyFit(s: LRState): rg.LinearFit {
	return rg.fitPoly(s.px.slice(), s.py.slice(), s.degree, s.penalty, alphaOf(s));
}

export function polyTrainMse(s: LRState, f = polyFit(s)) {
	return rg.mse(
		s.py,
		s.px.map((x) => rg.evalPoly(f, x))
	);
}

export const maxCoef = (f: rg.LinearFit) => Math.max(0, ...f.coef.map(Math.abs));
export const zeros = (f: rg.LinearFit) => f.coef.filter((c) => c === 0).length;

export function resetData(s: LRState) {
	const d = rg.rentData(DATA_SEED, N);
	s.xs = d.xs;
	s.ys = d.ys;
	s.outlier = false;
	if (s.autoFit) fit(s);
}

/** Jump to the least-squares line. */
export function fit(s: LRState) {
	s.line = best(s);
}

export function setOutlier(s: LRState, on: boolean) {
	if (on === s.outlier) return;
	if (on) {
		s.xs.push(OUTLIER.x);
		s.ys.push(OUTLIER.y);
	} else {
		s.xs.pop();
		s.ys.pop();
	}
	s.outlier = on;
	if (s.autoFit) fit(s);
}

export function movePoint(s: LRState, i: number, x: number, y: number) {
	s.xs[i] = x;
	s.ys[i] = y;
	if (s.autoFit) fit(s);
}

export function setView(s: LRState, v: View) {
	s.view = v;
}

export const off = {
	handles: false,
	landscape: false,
	fit: false,
	dragPoints: false,
	outlier: false,
	degree: false,
	penalty: false,
	alpha: false,
	range: false,
	view: false
};

export function init(): LRState {
	const c = rg.curveData(CURVE_SEED, CURVE_N);
	const s: LRState = {
		view: 'line',
		xs: [],
		ys: [],
		outlier: false,
		line: { ...START_LINE },
		autoFit: false,
		ghost: null,
		px: c.xs,
		py: c.ys,
		degree: 1,
		penalty: 'none',
		logAlpha: -6,
		wide: false,
		show: { residuals: false, landscape: false, truth: false },
		ui: { ...off },
		did: { handles: false, landscape: false, dragPoint: false }
	};
	resetData(s);
	return s;
}
