/**
 * Shared state for the RMSE and MAE lessons: a fixed rent model evaluated on ten flats it has
 * never seen. Learners drag rents, add an outlier, or swap the model for a single constant.
 */
import * as rg from './regression.ts';

/** What the per-flat chart under the scatter shows. */
export type Bars = 'residual' | 'abs' | 'squared' | 'share' | 'curves' | 'none';

export interface ErrState {
	/** Apartment sizes (m²). */
	xs: number[];
	/** Original rents (€). */
	base: number[];
	/** Current rents (€), after any dragging or outlier. */
	ys: number[];
	/** The trained model under evaluation. */
	model: rg.Line;
	/** 'line' = evaluate the model; 'constant' = predict the same rent c for every flat. */
	mode: 'line' | 'constant';
	c: number;
	/** How far (€) the outlier flat's rent is pushed above its original value. */
	outlier: number;
	bars: Bars;
	show: {
		residuals: boolean;
		squares: boolean;
		/** ±RMSE band around the model. */
		band: boolean;
		/** Average line in the bar chart. */
		meanLine: boolean;
		/** Mean and median markers in the constant-model chart. */
		marks: boolean;
		/** Which numbers the readouts show. */
		meanRes: boolean;
		mae: boolean;
		mse: boolean;
		rmse: boolean;
		ratio: boolean;
		share: boolean;
	};
	ui: { drag: boolean; dragC: boolean; outlier: boolean; bars: boolean; mode: boolean; reset: boolean };
	/** Interaction flags used by tasks. */
	did: { drag: boolean; dragC: boolean; maeMin: boolean; rmseMin: boolean };
}

export const SEED = 2;
export const N = 10;
/** "Trained earlier": the model every flat is scored against. */
export const MODEL: rg.Line = { w: 10, b: 250 };
/** Index of the flat that becomes the outlier. */
export const OUT = 7;
export const OUTLIER_MAX = 800;
export const X_DOM: [number, number] = [20, 125];
export const Y_DOM: [number, number] = [300, 2100];

export const preds = (s: ErrState) => (s.mode === 'constant' ? s.xs.map(() => s.c) : rg.predict(s.model, s.xs));
export const resids = (s: ErrState) => rg.residuals(s.ys, preds(s));

export function metrics(s: ErrState) {
	const r = resids(s);
	const sq = r.map((v) => v * v);
	const ab = r.map(Math.abs);
	const mse = rg.mean(sq);
	const mae = rg.mean(ab);
	const rmse = Math.sqrt(mse);
	const sumSq = rg.sum(sq);
	const sumAb = rg.sum(ab);
	const top = sq.indexOf(Math.max(...sq));
	return {
		r,
		sq,
		ab,
		mse,
		mae,
		rmse,
		meanRes: rg.mean(r),
		ratio: rmse / mae,
		/** Index of the flat with the biggest error and its share of the total squared / absolute error. */
		top,
		topShareSq: sumSq ? sq[top] / sumSq : 0,
		topShareAb: sumAb ? ab[top] / sumAb : 0,
		outShareSq: sumSq ? sq[OUT] / sumSq : 0,
		outShareAb: sumAb ? ab[OUT] / sumAb : 0
	};
}

export function setOutlier(s: ErrState, amount: number) {
	s.outlier = amount;
	s.ys[OUT] = s.base[OUT] + amount;
}

export function moveRent(s: ErrState, i: number, y: number) {
	s.ys[i] = y;
	if (i === OUT) s.outlier = y - s.base[OUT];
}

export function resetRents(s: ErrState) {
	s.ys = s.base.slice();
	s.outlier = 0;
}

/** Make every residual exactly ±e (alternating signs). */
export function equalErrors(s: ErrState, e: number) {
	const p = rg.predict(s.model, s.xs);
	s.ys = p.map((v, i) => v + (i % 2 ? -e : e));
	s.outlier = 0;
}

export const mean = (s: ErrState) => rg.mean(s.ys);
export const median = (s: ErrState) => rg.median(s.ys);

export function setC(s: ErrState, c: number) {
	s.c = c;
	if (rg.constMae(s.ys, c) <= rg.constMae(s.ys, median(s)) + 0.5) s.did.maeMin = true;
	if (rg.constRmse(s.ys, c) <= rg.constRmse(s.ys, mean(s)) + 0.5) s.did.rmseMin = true;
}

export const off = { drag: false, dragC: false, outlier: false, bars: false, mode: false, reset: false };
export const noMetrics = { meanRes: false, mae: false, mse: false, rmse: false, ratio: false, share: false };

export function init(): ErrState {
	const d = rg.rentData(SEED, N);
	return {
		xs: d.xs,
		base: d.ys.slice(),
		ys: d.ys.slice(),
		model: { ...MODEL },
		mode: 'line',
		c: 900,
		outlier: 0,
		bars: 'none',
		show: { residuals: true, squares: false, band: false, meanLine: false, marks: false, ...noMetrics },
		ui: { ...off },
		did: { drag: false, dragC: false, maeMin: false, rmseMin: false }
	};
}
