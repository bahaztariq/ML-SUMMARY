/**
 * Time-series explainer state plus memoised, derived data the steps and the scene share.
 * All data is generated from fixed seeds, so every replay of a step looks identical.
 */
import { fmt } from '#lib/viz/canvas.ts';
import * as ts from './ts.ts';

export type View = 'sales' | 'diff' | 'process' | 'ar' | 'forecast' | 'prophet' | 'backtest';
export type Diff = 'none' | 'lag1' | 'lag12' | 'both';
export type Proc = 'ar' | 'ma';
export type CV = 'shuffled' | 'walk';

export interface TSState {
	view: View;
	comp: { trend: boolean; season: boolean; noise: boolean };
	diff: Diff;
	proc: Proc;
	/** AR order used for the fit and the forecast. */
	p: number;
	horizon: number;
	/** Fourier pairs in the Prophet-style seasonality. */
	K: number;
	changepoints: boolean;
	cv: CV;
	show: { components: boolean; rolling: boolean; acf: boolean; perr: boolean; folds: boolean; test: boolean };
	ui: { comp: boolean; diff: boolean; proc: boolean; p: boolean; horizon: boolean; K: boolean; cps: boolean; cv: boolean; view: boolean };
	did: { trend: boolean; season: boolean; noise: boolean; ma: boolean };
}

/* ---- fixed data ---- */
export const SALES = ts.makeSales(11, 120);
export const N = SALES.y.length;
export const AR_PHI = [0.35, 0.5];
export const MA_THETA = 0.8;
export const PROC_N = 200;
/** Seed whose samples show the textbook ACF shapes cleanly. */
export const PROC_SEED = 28;
export const PROC: Record<Proc, number[]> = {
	ar: ts.simulateARMA(AR_PHI, [], PROC_N, PROC_SEED),
	ma: ts.simulateARMA([], [MA_THETA], PROC_N, PROC_SEED)
};
export const P_MAX = 6;
export const TRAIN_END = 96;
export const HORIZON_MAX = 40;
export const ORIGINS = [60, 72, 84, 96, 108];
export const FOLD_H = 12;
export const CV_SEED = 1;

const memo = new Map<string, unknown>();
function cached<T>(key: string, f: () => T): T {
	if (!memo.has(key)) memo.set(key, f());
	return memo.get(key) as T;
}

/** The sales series with only the switched-on components. */
export function composed(s: TSState): number[] {
	const { trend, season, noise } = s.comp;
	return cached(`comp${+trend}${+season}${+noise}`, () =>
		SALES.y.map((_, t) => (trend ? SALES.trend[t] : 0) + (season ? SALES.season[t] : 0) + (noise ? SALES.noise[t] : 0))
	);
}

export const DIFF_LABEL: Record<Diff, string> = {
	none: 'original y',
	lag1: 'yₜ − yₜ₋₁',
	lag12: 'yₜ − yₜ₋₁₂',
	both: 'both'
};

/** Differenced sales; `t0` is the month of the first value. */
export function differenced(d: Diff): { t0: number; y: number[] } {
	return cached(`diff${d}`, () => {
		if (d === 'none') return { t0: 0, y: SALES.y };
		if (d === 'lag1') return { t0: 1, y: ts.difference(SALES.y, 1) };
		if (d === 'lag12') return { t0: 12, y: ts.difference(SALES.y, 12) };
		return { t0: 13, y: ts.difference(ts.difference(SALES.y, 1), 12) };
	});
}

export const WINDOW = 24;
export function rollingOf(d: Diff) {
	return cached(`roll${d}`, () => ts.rolling(differenced(d).y, WINDOW));
}

/** How far the 2-year averages drift: last window minus first. */
export function drift(d: Diff) {
	const r = rollingOf(d);
	return r[r.length - 1].mean - r[0].mean;
}

/** Series whose ACF is shown in the current view. */
export function acfSeries(s: TSState): number[] {
	if (s.view === 'process' || s.view === 'ar' || s.view === 'forecast') return PROC[s.view === 'process' ? s.proc : 'ar'];
	return differenced(s.view === 'diff' ? s.diff : 'none').y;
}

export const ACF_LAGS = 24;
/** ACF of the (differenced) sales series. */
export function acfDiff(d: Diff): number[] {
	return cached(`acfd${d}`, () => ts.acf(differenced(d).y, ACF_LAGS));
}
export function acfOf(s: TSState): number[] {
	const key = s.view === 'process' ? `p${s.proc}` : s.view === 'diff' ? `d${s.diff}` : s.view;
	return cached(`acf${key}`, () => ts.acf(acfSeries(s), ACF_LAGS));
}

export function arFit(p: number): ts.ARFit {
	return cached(`ar${p}`, () => ts.fitAR(PROC.ar, p, P_MAX));
}

export function arErrors(): number[] {
	return cached('arErr', () => Array.from({ length: P_MAX }, (_, i) => arFit(i + 1).sigma));
}

export function arForecast(p: number) {
	return cached(`fc${p}`, () => ts.forecastAR(PROC.ar, ts.fitAR(PROC.ar, p), HORIZON_MAX));
}

/** Prophet-style fit on the first 96 months, evaluated on the last 24. */
export function prophet(K: number, cps: boolean) {
	return cached(`ph${K}${cps}`, () => {
		const train = Array.from({ length: TRAIN_END }, (_, i) => i);
		const fit = ts.fitProphet(
			train,
			train.map((t) => SALES.y[t]),
			{ K, changepoints: cps }
		);
		const pred = Array.from({ length: N }, (_, t) => ts.predictProphet(fit, t));
		const test = pred.slice(TRAIN_END);
		return {
			fit,
			pred,
			mae: ts.mae(
				test.map((p) => p.y),
				SALES.y.slice(TRAIN_END)
			)
		};
	});
}

export function backtestOf(cv: CV) {
	return cached(`cv${cv}`, () => {
		const folds = cv === 'shuffled' ? ts.shuffledFolds(N, 5, CV_SEED) : ts.walkForwardFolds(N, ORIGINS, FOLD_H);
		return { folds, ...ts.backtest(SALES.y, folds, { K: 4, changepoints: true }) };
	});
}

export const num = (v: number, d = 2) => (Math.abs(v) < 0.5 * 10 ** -d ? (0).toFixed(d) : fmt(v, d));

export const off = { comp: false, diff: false, proc: false, p: false, horizon: false, K: false, cps: false, cv: false, view: false };
export const noShow = { components: false, rolling: false, acf: false, perr: false, folds: false, test: false };

export function init(): TSState {
	return {
		view: 'sales',
		comp: { trend: true, season: true, noise: true },
		diff: 'none',
		proc: 'ar',
		p: 1,
		horizon: 12,
		K: 1,
		changepoints: false,
		cv: 'shuffled',
		show: { ...noShow },
		ui: { ...off },
		did: { trend: false, season: false, noise: false, ma: false }
	};
}
