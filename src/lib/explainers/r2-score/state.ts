/**
 * R² explainer state and the actions both the lesson steps and the scene use.
 */
import * as rg from '../_regression/regression.ts';

export type View = 'line' | 'features';

export interface R2State {
	view: View;
	/** Apartment sizes (m²), noise draws and current rents (€). */
	xs: number[];
	zs: number[];
	ys: number[];
	/** Noise level σ (€) used to build the rents. */
	noise: number;
	line: rg.Line;
	/** Refit by least squares when the data changes. */
	autoFit: boolean;
	/** Number of pure-noise features added (features view). */
	k: number;
	/** Largest k explored so far: the score chart only reveals curves up to here. */
	kSeen: number;
	show: { meanLine: boolean; totRes: boolean; totSquares: boolean; model: boolean; resSquares: boolean; bars: boolean };
	ui: { handles: boolean; noise: boolean; k: boolean; view: boolean; fit: boolean };
	/** Interaction flags used by tasks. */
	did: { handles: boolean; k: boolean };
}

export const SEED = 9;
export const N = 14;
export const NOISE = 150;
export const NOISE_RANGE: [number, number] = [40, 400];
export const FEATURE_SEED = 17;
export const N_TRAIN = 18;
export const K_MAX = 10;
export const HANDLE_X: [number, number] = [35, 110];
export const X_DOM: [number, number] = [15, 130];
export const Y_DOM: [number, number] = [-100, 2200];

/** The useless-features data set never changes, so build it once. */
export const FEATURES = rg.featureData(FEATURE_SEED, N_TRAIN, 300, K_MAX);
export const SCORES = Array.from({ length: K_MAX + 1 }, (_, k) => rg.scoreWithJunk(FEATURES, k));

/** Fixed decimals that never print "-0.00". */
export const num = (v: number, d = 2) => (Math.abs(v) < 0.5 * 10 ** -d ? (0).toFixed(d) : v.toFixed(d));

export const preds = (s: R2State) => rg.predict(s.line, s.xs);

export function stats(s: R2State) {
	const ybar = rg.mean(s.ys);
	const tot = rg.ssTot(s.ys);
	const res = rg.sse(s.ys, preds(s));
	return { ybar, tot, res, r2: 1 - res / tot };
}

export function fit(s: R2State) {
	s.line = rg.ols(s.xs, s.ys);
}

export function setNoise(s: R2State, sigma: number) {
	s.noise = sigma;
	s.ys = s.xs.map((x, i) => rg.lineAt(rg.RENT_TRUTH, x) + sigma * s.zs[i]);
	if (s.autoFit) fit(s);
}

export function setK(s: R2State, k: number, byUser = true) {
	s.k = k;
	s.kSeen = Math.max(s.kSeen, k);
	if (byUser) s.did.k = true;
}

export const off = { handles: false, noise: false, k: false, view: false, fit: false };

export function init(): R2State {
	const d = rg.rentData(SEED, N);
	const s: R2State = {
		view: 'line',
		xs: d.xs,
		zs: d.zs,
		ys: [],
		noise: NOISE,
		line: { w: 0, b: 0 },
		autoFit: true,
		k: 0,
		kSeen: 0,
		show: { meanLine: true, totRes: true, totSquares: false, model: false, resSquares: false, bars: false },
		ui: { ...off },
		did: { handles: false, k: false }
	};
	setNoise(s, NOISE);
	return s;
}
