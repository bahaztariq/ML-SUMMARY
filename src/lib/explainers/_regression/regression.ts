/**
 * Regression building blocks shared by the linear-regression, RMSE, MAE and R² lessons.
 * Pure functions over plain arrays so they can be unit-tested and replayed deterministically.
 */
import { gaussian, mulberry32 } from '#lib/viz/canvas.ts';

export interface Line {
	/** Slope. */
	w: number;
	/** Intercept. */
	b: number;
}

/* ------------------------------------------------------------------ basics */

export const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);
export const mean = (a: number[]) => (a.length ? sum(a) / a.length : NaN);

export function median(a: number[]): number {
	if (!a.length) return NaN;
	const s = [...a].sort((p, q) => p - q);
	const m = s.length >> 1;
	return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export const lineAt = (l: Line, x: number) => l.w * x + l.b;
export const predict = (l: Line, xs: number[]) => xs.map((x) => lineAt(l, x));
export const residuals = (ys: number[], preds: number[]) => ys.map((y, i) => y - preds[i]);

/* ----------------------------------------------------------------- metrics */

/** Sum of squared errors, Σ(y − ŷ)². */
export const sse = (ys: number[], preds: number[]) => sum(ys.map((y, i) => (y - preds[i]) ** 2));
export const mse = (ys: number[], preds: number[]) => sse(ys, preds) / ys.length;
export const rmse = (ys: number[], preds: number[]) => Math.sqrt(mse(ys, preds));
export const mae = (ys: number[], preds: number[]) => mean(ys.map((y, i) => Math.abs(y - preds[i])));

/** Total sum of squares: the SSE of always predicting the mean. */
export const ssTot = (ys: number[]) => {
	const m = mean(ys);
	return sum(ys.map((y) => (y - m) ** 2));
};

/** R² = 1 − SS_res / SS_tot. */
export const r2 = (ys: number[], preds: number[]) => 1 - sse(ys, preds) / ssTot(ys);

/** Adjusted R² for n samples and p features (not counting the intercept). */
export const adjustedR2 = (r: number, n: number, p: number) => 1 - ((1 - r) * (n - 1)) / (n - p - 1);

/** Errors of a constant prediction c (the simplest possible model). */
export const constMae = (ys: number[], c: number) => mean(ys.map((y) => Math.abs(y - c)));
export const constRmse = (ys: number[], c: number) => Math.sqrt(mean(ys.map((y) => (y - c) ** 2)));

/* ------------------------------------------------------------------- fits */

/** Ordinary least squares for one feature: w = cov(x, y) / var(x), b = ȳ − w·x̄. */
export function ols(xs: number[], ys: number[]): Line {
	const mx = mean(xs);
	const my = mean(ys);
	let sxy = 0;
	let sxx = 0;
	xs.forEach((x, i) => {
		sxy += (x - mx) * (ys[i] - my);
		sxx += (x - mx) ** 2;
	});
	const w = sxx ? sxy / sxx : 0;
	return { w, b: my - w * mx };
}

/** Line through (x0, y0) and (x1, y1). */
export function lineThrough(x0: number, y0: number, x1: number, y1: number): Line {
	const w = (y1 - y0) / (x1 - x0);
	return { w, b: y0 - w * x0 };
}

/** Solve A·x = b with Gaussian elimination and partial pivoting (A is copied). */
export function solve(A: number[][], b: number[]): number[] {
	const n = b.length;
	const M = A.map((row, i) => [...row, b[i]]);
	for (let c = 0; c < n; c++) {
		let p = c;
		for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
		[M[c], M[p]] = [M[p], M[c]];
		const d = M[c][c] || 1e-300;
		for (let r = c + 1; r < n; r++) {
			const f = M[r][c] / d;
			if (!f) continue;
			for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
		}
	}
	const x = new Array(n).fill(0);
	for (let r = n - 1; r >= 0; r--) {
		let v = M[r][n];
		for (let k = r + 1; k < n; k++) v -= M[r][k] * x[k];
		x[r] = v / (M[r][r] || 1e-300);
	}
	return x;
}

export interface LinearFit {
	coef: number[];
	intercept: number;
}

/** Center the columns of X and y (the intercept is never penalized). */
function center(X: number[][], y: number[]) {
	const p = X[0]?.length ?? 0;
	const mx = Array.from({ length: p }, (_, j) => mean(X.map((r) => r[j])));
	const my = mean(y);
	return { Xc: X.map((r) => r.map((v, j) => v - mx[j])), yc: y.map((v) => v - my), mx, my };
}

/**
 * Least squares with an intercept, optionally with a Ridge (L2) penalty, minimizing
 * Σ(y − Xw − b)² + α·‖w‖² (scikit-learn's `Ridge` objective).
 */
export function fitLinear(X: number[][], y: number[], alpha = 0): LinearFit {
	const { Xc, yc, mx, my } = center(X, y);
	const p = mx.length;
	const A = Array.from({ length: p }, (_, i) =>
		Array.from({ length: p }, (_, j) => sum(Xc.map((r) => r[i] * r[j])) + (i === j ? alpha : 0))
	);
	const rhs = Array.from({ length: p }, (_, i) => sum(Xc.map((r, k) => r[i] * yc[k])));
	const coef = p ? solve(A, rhs) : [];
	return { coef, intercept: my - sum(coef.map((c, j) => c * mx[j])) };
}

/**
 * Lasso (L1) by coordinate descent, minimizing (1/2n)·Σ(y − Xw − b)² + α·‖w‖₁
 * (scikit-learn's `Lasso` objective). Many coefficients end up exactly 0.
 */
export function fitLasso(X: number[][], y: number[], alpha: number, sweeps = 4000, tol = 1e-9): LinearFit {
	const { Xc, yc, mx, my } = center(X, y);
	const n = y.length;
	const p = mx.length;
	const cols = Array.from({ length: p }, (_, j) => Xc.map((r) => r[j]));
	const z = cols.map((c) => sum(c.map((v) => v * v)) / n);
	const w = new Array(p).fill(0);
	const r = [...yc];
	for (let it = 0; it < sweeps; it++) {
		let change = 0;
		for (let j = 0; j < p; j++) {
			const c = cols[j];
			let rho = 0;
			for (let i = 0; i < n; i++) rho += c[i] * (r[i] + c[i] * w[j]);
			rho /= n;
			const next = Math.sign(rho) * Math.max(0, Math.abs(rho) - alpha) / z[j];
			const d = next - w[j];
			if (d) {
				for (let i = 0; i < n; i++) r[i] -= c[i] * d;
				w[j] = next;
				change = Math.max(change, Math.abs(d));
			}
		}
		if (change < tol) break;
	}
	return { coef: w, intercept: my - sum(w.map((c, j) => c * mx[j])) };
}

export const evalLinear = (f: LinearFit, row: number[]) => f.intercept + sum(row.map((v, j) => v * f.coef[j]));

/* ------------------------------------------------------------ polynomials */

export type Penalty = 'none' | 'ridge' | 'lasso';

/** [x, x², …, x^d] */
export const polyRow = (x: number, d: number) => Array.from({ length: d }, (_, j) => x ** (j + 1));

export function fitPoly(xs: number[], ys: number[], degree: number, penalty: Penalty = 'none', alpha = 0): LinearFit {
	const X = xs.map((x) => polyRow(x, degree));
	if (penalty === 'lasso') return fitLasso(X, ys, alpha);
	// A whisper of ridge keeps the plain fit numerically stable at high degree.
	return fitLinear(X, ys, penalty === 'ridge' ? alpha : 1e-10);
}

export const evalPoly = (f: LinearFit, x: number) => evalLinear(f, polyRow(x, f.coef.length));

/* ------------------------------------------------------------------ data */

export interface RentData {
	/** Apartment size in m². */
	xs: number[];
	/** Monthly rent in €. */
	ys: number[];
	/** Standard-normal noise draws behind each rent (for rescaling the noise). */
	zs: number[];
}

/** The "true" rent of an apartment: €250 plus €10 per m². */
export const RENT_TRUTH: Line = { w: 10, b: 250 };

/**
 * Apartments with sizes spread over [lo, hi] m² and rent = 250 + 10·size + noise, rounded to
 * whole m² and €5 so the numbers read naturally.
 */
export function rentData(seed: number, n: number, { lo = 25, hi = 120, noise = 110, truth = RENT_TRUTH } = {}): RentData {
	const rand = mulberry32(seed);
	const g = gaussian(rand);
	const xs: number[] = [];
	const ys: number[] = [];
	const zs: number[] = [];
	for (let i = 0; i < n; i++) {
		const x = Math.round(lo + ((hi - lo) * (i + 0.15 + 0.7 * rand())) / n);
		const z = g();
		xs.push(x);
		zs.push(z);
		ys.push(Math.round((lineAt(truth, x) + noise * z) / 5) * 5);
	}
	return { xs, ys, zs };
}

/** Noisy samples of sin(πx) on [-1, 1] for the polynomial part. */
export const curveTruth = (x: number) => Math.sin(Math.PI * x);

export function curveData(seed: number, n: number, noise = 0.18) {
	const rand = mulberry32(seed);
	const g = gaussian(rand);
	const xs: number[] = [];
	const ys: number[] = [];
	for (let i = 0; i < n; i++) {
		const x = -0.95 + (1.9 * (i + 0.2 + 0.6 * rand())) / n;
		xs.push(x);
		ys.push(curveTruth(x) + noise * g());
	}
	return { xs, ys };
}

/* ------------------------------------------------------- useless features */

export interface FeatureSet {
	/** Real feature (apartment size). */
	x: number[];
	/** k columns of pure noise per row. */
	junk: number[][];
	y: number[];
}

export interface FeatureData {
	train: FeatureSet;
	test: FeatureSet;
}

function featureSet(seed: number, n: number, kMax: number): FeatureSet {
	const rand = mulberry32(seed);
	const g = gaussian(rand);
	const x: number[] = [];
	const junk: number[][] = [];
	const y: number[] = [];
	for (let i = 0; i < n; i++) {
		const xi = 25 + 95 * rand();
		x.push(xi);
		y.push(lineAt(RENT_TRUTH, xi) + 160 * g());
		junk.push(Array.from({ length: kMax }, () => g()));
	}
	return { x, junk, y };
}

export function featureData(seed: number, nTrain: number, nTest: number, kMax: number): FeatureData {
	return { train: featureSet(seed, nTrain, kMax), test: featureSet(seed + 101, nTest, kMax) };
}

const rows = (d: FeatureSet, k: number) => d.x.map((x, i) => [x, ...d.junk[i].slice(0, k)]);

export interface FeatureScore {
	/** Number of features used (1 real + k junk). */
	p: number;
	r2Train: number;
	adjR2: number;
	r2Test: number;
	predTrain: number[];
	predTest: number[];
}

/** Fit OLS on size plus the first k junk columns; score on train and held-out data. */
export function scoreWithJunk(data: FeatureData, k: number): FeatureScore {
	const fit = fitLinear(rows(data.train, k), data.train.y);
	const predTrain = rows(data.train, k).map((r) => evalLinear(fit, r));
	const predTest = rows(data.test, k).map((r) => evalLinear(fit, r));
	const r2Train = r2(data.train.y, predTrain);
	const p = k + 1;
	return {
		p,
		r2Train,
		adjR2: adjustedR2(r2Train, data.train.y.length, p),
		r2Test: r2(data.test.y, predTest),
		predTrain,
		predTest
	};
}
