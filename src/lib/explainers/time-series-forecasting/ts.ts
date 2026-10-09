/**
 * Pure time-series helpers for the forecasting explainer: seeded series, differencing, ACF,
 * AR(p) least-squares fits with forecast intervals, a Prophet-style additive model and backtests.
 */
import { gaussian, mulberry32 } from '#lib/viz/canvas.ts';

export const PERIOD = 12;

/* ------------------------------------------------------------------ data */

export interface Sales {
	trend: number[];
	season: number[];
	noise: number[];
	y: number[];
}

/** Month where the trend speeds up. */
export const CHANGEPOINT = 72;

/**
 * Ten years of monthly sales: a trend that speeds up at month 72, a yearly pattern with a
 * December peak, and AR(1) noise (a good month tends to be followed by another one).
 */
export function makeSales(seed = 11, n = 120): Sales {
	const g = gaussian(mulberry32(seed));
	const trend: number[] = [];
	const season: number[] = [];
	const noise: number[] = [];
	const shape = Array.from({ length: PERIOD }, (_, m) => 9 * Math.sin((2 * Math.PI * (m - 3)) / PERIOD) + (m === 11 ? 12 : m === 10 ? 4 : 0));
	const mean = shape.reduce((a, b) => a + b, 0) / PERIOD;
	let e = 0;
	for (let t = 0; t < n; t++) {
		trend.push(t < CHANGEPOINT ? 100 + 0.5 * t : 100 + 0.5 * CHANGEPOINT + 1.3 * (t - CHANGEPOINT));
		season.push(shape[t % PERIOD] - mean);
		e = 0.55 * e + 2.6 * g();
		noise.push(e);
	}
	const y = trend.map((v, t) => v + season[t] + noise[t]);
	return { trend, season, noise, y };
}

/** Stationary ARMA sample: x_t = Σφ_i x_{t−i} + ε_t + Σθ_j ε_{t−j}. */
export function simulateARMA(phi: number[], theta: number[], n: number, seed: number, sigma = 1, burn = 200): number[] {
	const g = gaussian(mulberry32(seed));
	const x: number[] = [];
	const eps: number[] = [];
	for (let t = 0; t < n + burn; t++) {
		const e = sigma * g();
		let v = e;
		phi.forEach((p, i) => (v += p * (x[t - 1 - i] ?? 0)));
		theta.forEach((q, j) => (v += q * (eps[t - 1 - j] ?? 0)));
		x.push(v);
		eps.push(e);
	}
	return x.slice(burn);
}

/* ------------------------------------------------------------------ basics */

export const mean = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN);
export const std = (a: number[]) => {
	const m = mean(a);
	return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / Math.max(1, a.length - 1));
};
export const mae = (a: number[], b: number[]) => mean(a.map((v, i) => Math.abs(v - b[i])));

/** y_t − y_{t−lag}; the result is `lag` values shorter. */
export function difference(y: number[], lag = 1): number[] {
	return y.slice(lag).map((v, i) => v - y[i]);
}

/** Mean and std of consecutive windows. */
export function rolling(y: number[], size: number) {
	const out: { start: number; end: number; mean: number; std: number }[] = [];
	for (let i = 0; i + size <= y.length; i += size) {
		const w = y.slice(i, i + size);
		out.push({ start: i, end: i + size, mean: mean(w), std: std(w) });
	}
	return out;
}

/** Sample autocorrelation for lags 0..maxLag. */
export function acf(y: number[], maxLag: number): number[] {
	const m = mean(y);
	const d = y.map((v) => v - m);
	const c0 = d.reduce((s, v) => s + v * v, 0);
	const out: number[] = [];
	for (let k = 0; k <= maxLag; k++) {
		let c = 0;
		for (let t = k; t < d.length; t++) c += d[t] * d[t - k];
		out.push(c / c0);
	}
	return out;
}

/** Solve A·x = b by Gaussian elimination with partial pivoting (A is small and square). */
export function solve(A: number[][], b: number[]): number[] {
	const n = b.length;
	const M = A.map((row, i) => [...row, b[i]]);
	for (let c = 0; c < n; c++) {
		let p = c;
		for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
		[M[c], M[p]] = [M[p], M[c]];
		const piv = M[c][c] || 1e-12;
		for (let r = c + 1; r < n; r++) {
			const f = M[r][c] / piv;
			for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
		}
	}
	const x = new Array(n).fill(0);
	for (let r = n - 1; r >= 0; r--) {
		let v = M[r][n];
		for (let k = r + 1; k < n; k++) v -= M[r][k] * x[k];
		x[r] = v / (M[r][r] || 1e-12);
	}
	return x;
}

/** Ridge-regularised least squares: (XᵀX + diag(pen))β = Xᵀy. */
export function lstsq(X: number[][], y: number[], pen?: number[]): number[] {
	const p = X[0].length;
	const A = Array.from({ length: p }, () => new Array(p).fill(0));
	const b = new Array(p).fill(0);
	X.forEach((row, i) => {
		for (let a = 0; a < p; a++) {
			b[a] += row[a] * y[i];
			for (let c = 0; c < p; c++) A[a][c] += row[a] * row[c];
		}
	});
	for (let a = 0; a < p; a++) A[a][a] += pen?.[a] ?? 1e-9;
	return solve(A, b);
}

/* ------------------------------------------------------------------ AR(p) */

export interface ARFit {
	p: number;
	c: number;
	phi: number[];
	/** Residual standard deviation (one-step-ahead error). */
	sigma: number;
	/** One-step-ahead predictions (NaN where there isn't enough history). */
	fitted: number[];
}

/** Least-squares AR(p) with intercept, fitted on rows t ≥ start (use the same start to compare p fairly). */
export function fitAR(y: number[], p: number, start = p): ARFit {
	const X: number[][] = [];
	const target: number[] = [];
	for (let t = Math.max(start, p); t < y.length; t++) {
		X.push([1, ...Array.from({ length: p }, (_, i) => y[t - 1 - i])]);
		target.push(y[t]);
	}
	const beta = lstsq(X, target);
	const c = beta[0];
	const phi = beta.slice(1);
	const fitted = y.map((_, t) => (t < p ? NaN : c + phi.reduce((s, f, i) => s + f * y[t - 1 - i], 0)));
	let sse = 0;
	let n = 0;
	for (let t = Math.max(start, p); t < y.length; t++) {
		sse += (y[t] - fitted[t]) ** 2;
		n++;
	}
	return { p, c, phi, sigma: Math.sqrt(sse / Math.max(1, n - p - 1)), fitted };
}

/** The series' long-run mean implied by an AR fit. */
export const arMean = (f: ARFit) => f.c / (1 - f.phi.reduce((a, b) => a + b, 0));

/**
 * h-step forecasts from the end of y. The standard error grows with the horizon:
 * se_h = σ·√(Σ_{j<h} ψ_j²), where ψ are the model's impulse-response weights.
 */
export function forecastAR(y: number[], f: ARFit, h: number) {
	const hist = y.slice();
	const mean: number[] = [];
	for (let k = 0; k < h; k++) {
		const v = f.c + f.phi.reduce((s, ph, i) => s + ph * hist[hist.length - 1 - i], 0);
		hist.push(v);
		mean.push(v);
	}
	const psi = [1];
	for (let j = 1; j < h; j++) {
		let v = 0;
		for (let i = 1; i <= Math.min(j, f.p); i++) v += f.phi[i - 1] * psi[j - i];
		psi.push(v);
	}
	let acc = 0;
	const se = psi.map((p) => {
		acc += p * p;
		return f.sigma * Math.sqrt(acc);
	});
	return { mean, se };
}

/* ------------------------------------------------------------------ Prophet-style */

export interface ProphetOpts {
	/** Number of Fourier pairs for the yearly pattern. */
	K: number;
	/** Let the trend bend at candidate changepoints. */
	changepoints: boolean;
	/** Ridge penalty on trend bends (smaller = more flexible trend). */
	lambda?: number;
}

export interface ProphetFit {
	beta: number[];
	cps: number[];
	K: number;
	sigma: number;
	/** Average size of the fitted trend bends, used to widen future bands. */
	meanBend: number;
	nTrain: number;
}

const yr = (t: number) => t / PERIOD;

function features(t: number, cps: number[], K: number) {
	const row = [1, yr(t)];
	for (const c of cps) row.push(Math.max(0, yr(t) - yr(c)));
	for (let k = 1; k <= K; k++) {
		const a = (2 * Math.PI * k * t) / PERIOD;
		row.push(Math.sin(a), Math.cos(a));
	}
	return row;
}

/** y(t) = g(t) + s(t): piecewise-linear trend plus a Fourier yearly cycle, fitted to ts/ys. */
export function fitProphet(ts: number[], ys: number[], o: ProphetOpts): ProphetFit {
	const lo = Math.min(...ts);
	const hi = Math.max(...ts);
	// Prophet puts candidate changepoints in the first 80% of the history.
	const cps: number[] = [];
	if (o.changepoints) for (let c = lo + 6; c <= lo + 0.8 * (hi - lo); c += 6) cps.push(c);
	const X = ts.map((t) => features(t, cps, o.K));
	const lambda = o.lambda ?? 0.5;
	const pen = X[0].map((_, j) => (j >= 2 && j < 2 + cps.length ? lambda : 1e-9));
	const beta = lstsq(X, ys, pen);
	const res = ts.map((t, i) => ys[i] - dotp(beta, features(t, cps, o.K)));
	const bends = beta.slice(2, 2 + cps.length);
	return {
		beta,
		cps,
		K: o.K,
		sigma: Math.sqrt(res.reduce((s, v) => s + v * v, 0) / Math.max(1, ts.length - beta.length)),
		meanBend: bends.length ? bends.reduce((s, v) => s + Math.abs(v), 0) / bends.length : 0,
		nTrain: hi
	};
}

const dotp = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);

/** Prediction split into components, with an uncertainty band that widens past the training data. */
export function predictProphet(f: ProphetFit, t: number) {
	const row = features(t, f.cps, f.K);
	const nT = 2 + f.cps.length;
	const trend = dotp(f.beta.slice(0, nT), row.slice(0, nT));
	const season = dotp(f.beta.slice(nT), row.slice(nT));
	// Past the data, imagine future trend bends as large as the past ones (Prophet's trick).
	const ahead = Math.max(0, yr(t - f.nTrain));
	const se = Math.sqrt(f.sigma ** 2 + (f.meanBend * ahead) ** 2 * ahead * 2 + (0.15 * f.sigma * ahead) ** 2);
	return { y: trend + season, trend, season, se };
}

/* ------------------------------------------------------------------ backtests */

export interface Fold {
	train: number[];
	test: number[];
}

/** Random K-fold: every month is shuffled into one of k folds — the future leaks into training. */
export function shuffledFolds(n: number, k: number, seed: number): Fold[] {
	const r = mulberry32(seed);
	const idx = Array.from({ length: n }, (_, i) => i);
	for (let i = n - 1; i > 0; i--) {
		const j = Math.floor(r() * (i + 1));
		[idx[i], idx[j]] = [idx[j], idx[i]];
	}
	return Array.from({ length: k }, (_, f) => {
		const test = idx.filter((_, i) => i % k === f).sort((a, b) => a - b);
		const set = new Set(test);
		return { test, train: idx.filter((i) => !set.has(i)).sort((a, b) => a - b) };
	});
}

/** Walk-forward (expanding window): train on everything before each origin, test on the next `h` months. */
export function walkForwardFolds(n: number, origins: number[], h: number): Fold[] {
	return origins.map((o) => ({
		train: Array.from({ length: o }, (_, i) => i),
		test: Array.from({ length: Math.min(h, n - o) }, (_, i) => o + i)
	}));
}

/** Fit on each fold's training months, predict its test months; returns per-fold MAE and all predictions. */
export function backtest(y: number[], folds: Fold[], o: ProphetOpts) {
	const preds = new Array(y.length).fill(NaN);
	const maes = folds.map((f) => {
		const fit = fitProphet(
			f.train,
			f.train.map((t) => y[t]),
			o
		);
		const p = f.test.map((t) => predictProphet(fit, t).y);
		f.test.forEach((t, i) => (preds[t] = p[i]));
		return mae(
			p,
			f.test.map((t) => y[t])
		);
	});
	return { maes, mae: mean(maes), preds };
}
