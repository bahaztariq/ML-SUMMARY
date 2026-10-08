/**
 * Gradient descent building blocks. Pure functions over plain arrays so they can be
 * unit-tested and replayed deterministically by the explainer.
 *
 * Every loss is a `Problem` over a parameter vector `w` (length 1 or 2).
 */
import { gaussian, mulberry32 } from '#lib/viz/canvas.ts';

export type Vec = number[];
export type ProblemId = 'fit' | 'bumpy' | 'stretched' | 'round';

export interface Problem {
	id: ProblemId;
	dim: 1 | 2;
	loss: (w: Vec) => number;
	grad: (w: Vec) => Vec;
	/** Lowest loss value (the global minimum). */
	minLoss: number;
	/** Stationary points worth labelling (all minima). */
	minima: { w: Vec; global: boolean }[];
	/** Plot window for each parameter, and for the loss axis in 1-D. */
	domain: [number, number];
	range: [number, number];
}

/* ------------------------------------------------------------------ */
/* 1-D convex: mean squared error of a line y = w·x through the origin */
/* ------------------------------------------------------------------ */

export interface FitData {
	xs: number[];
	ys: number[];
}

/** 12 points around y = 1.5·x. x is rescaled so mean(x²) = 1, which makes the loss curvature exactly 2. */
export function makeFitData(seed = 4, n = 12): FitData {
	const g = gaussian(mulberry32(seed));
	const raw = Array.from({ length: n }, (_, i) => (i + 1) / n);
	const scale = Math.sqrt(raw.reduce((a, x) => a + x * x, 0) / n);
	const xs = raw.map((x) => x / scale);
	const ys = xs.map((x) => 1.5 * x + 0.28 * g());
	return { xs, ys };
}

export const FIT_DATA = makeFitData();

/** MSE(w) = mean((y − w·x)²) = A·w² − 2B·w + C. */
export function fitCoefficients({ xs, ys }: FitData) {
	const n = xs.length;
	const A = xs.reduce((a, x) => a + x * x, 0) / n;
	const B = xs.reduce((a, x, i) => a + x * ys[i], 0) / n;
	const C = ys.reduce((a, y) => a + y * y, 0) / n;
	return { A, B, C, wStar: B / A, minLoss: C - (B * B) / A };
}

export function mse({ xs, ys }: FitData, w: number) {
	return xs.reduce((a, x, i) => a + (ys[i] - w * x) ** 2, 0) / xs.length;
}

function makeFit(): Problem {
	const { A, B, C, wStar, minLoss } = fitCoefficients(FIT_DATA);
	return {
		id: 'fit',
		dim: 1,
		loss: ([w]) => A * w * w - 2 * B * w + C,
		grad: ([w]) => [2 * A * w - 2 * B],
		minLoss,
		minima: [{ w: [wStar], global: true }],
		domain: [wStar - 4, wStar + 4],
		range: [-1.6, 17.5]
	};
}

/* ------------------------------------------------------------------ */
/* 1-D non-convex: two valleys of different depth                     */
/* ------------------------------------------------------------------ */

const bumpyF = (x: number) => 0.25 * x ** 4 + 0.2 * x ** 3 - x * x + 1;
const bumpyDF = (x: number) => x ** 3 + 0.6 * x * x - 2 * x;
const bumpyDDF = (x: number) => 3 * x * x + 1.2 * x - 2;

/** Newton's method on the derivative, used to place the minima exactly. */
export function newtonRoot(df: (x: number) => number, ddf: (x: number) => number, x: number) {
	for (let i = 0; i < 50; i++) x -= df(x) / ddf(x);
	return x;
}

function makeBumpy(): Problem {
	const gMin = newtonRoot(bumpyDF, bumpyDDF, -1.7);
	const lMin = newtonRoot(bumpyDF, bumpyDDF, 1.1);
	return {
		id: 'bumpy',
		dim: 1,
		loss: ([w]) => bumpyF(w),
		grad: ([w]) => [bumpyDF(w)],
		minLoss: bumpyF(gMin),
		minima: [
			{ w: [gMin], global: true },
			{ w: [lMin], global: false }
		],
		domain: [-3, 2.6],
		range: [-1.4, 5.2]
	};
}

/* ------------------------------------------------------------------ */
/* 2-D quadratic bowl: L(w) = ½ (w − c)ᵀ H (w − c)                     */
/* ------------------------------------------------------------------ */

export interface Bowl {
	/** Curvatures along the two principal axes (eigenvalues of H). */
	lambda: [number, number];
	/** Angle of the first (shallow) axis, radians. */
	angle: number;
	center: Vec;
}

export const STRETCHED: Bowl = { lambda: [1, 12], angle: 0.42, center: [0.6, -0.3] };
export const ROUND: Bowl = { lambda: [1, 1.25], angle: 0.42, center: [0.6, -0.3] };

/** Hessian H = R·diag(λ)·Rᵀ as [[a, b], [b, d]]. */
export function hessian({ lambda: [l1, l2], angle }: Bowl) {
	const c = Math.cos(angle);
	const s = Math.sin(angle);
	return { a: l1 * c * c + l2 * s * s, b: (l1 - l2) * c * s, d: l1 * s * s + l2 * c * c };
}

export function makeBowl(id: 'stretched' | 'round', bowl: Bowl): Problem {
	const { a, b, d } = hessian(bowl);
	const [cx, cy] = bowl.center;
	return {
		id,
		dim: 2,
		loss: ([x, y]) => {
			const u = x - cx;
			const v = y - cy;
			return 0.5 * (a * u * u + 2 * b * u * v + d * v * v);
		},
		grad: ([x, y]) => {
			const u = x - cx;
			const v = y - cy;
			return [a * u + b * v, b * u + d * v];
		},
		minLoss: 0,
		minima: [{ w: [cx, cy], global: true }],
		domain: [-3, 3],
		range: [0, 1]
	};
}

export const PROBLEMS: Record<ProblemId, Problem> = {
	fit: makeFit(),
	bumpy: makeBumpy(),
	stretched: makeBowl('stretched', STRETCHED),
	round: makeBowl('round', ROUND)
};

/* ------------------------------------------------------------------ */
/* The algorithm                                                       */
/* ------------------------------------------------------------------ */

export const norm = (v: Vec) => Math.sqrt(v.reduce((a, x) => a + x * x, 0));

/** One update: w ← w − η·∇L(w). */
export function gdStep(p: Problem, w: Vec, lr: number): Vec {
	const g = p.grad(w);
	return w.map((wi, i) => wi - lr * g[i]);
}

/** Loss blew up or left any sensible range. */
export const isDiverged = (p: Problem, w: Vec) =>
	!w.every(Number.isFinite) || norm(w) > 1e6 || !Number.isFinite(p.loss(w));

/** Gradient is (numerically) zero: we have arrived at a stationary point. */
export const isConverged = (p: Problem, w: Vec, tol = 1e-4) => norm(p.grad(w)) < tol;

/** Full path [w0, w1, …] for up to `steps` updates, stopping early on convergence or divergence. */
export function descend(p: Problem, w0: Vec, lr: number, steps: number): Vec[] {
	const path = [w0.slice()];
	let w = w0.slice();
	for (let i = 0; i < steps; i++) {
		if (isConverged(p, w) || isDiverged(p, w)) break;
		w = gdStep(p, w, lr);
		path.push(w);
	}
	return path;
}

/** First step index whose loss is within `tol` of the global minimum, or -1. */
export function stepsToMin(p: Problem, path: Vec[], tol = 0.01): number {
	return path.findIndex((w) => p.loss(w) - p.minLoss < tol);
}

/** Central finite-difference gradient, for checking `grad`. */
export function numericGrad(p: Problem, w: Vec, h = 1e-5): Vec {
	return w.map((_, i) => {
		const up = w.slice();
		const dn = w.slice();
		up[i] += h;
		dn[i] -= h;
		return (p.loss(up) - p.loss(dn)) / (2 * h);
	});
}

/** Largest learning rate that still converges on a quadratic with top curvature λmax. */
export const maxStableLr = (lambdaMax: number) => 2 / lambdaMax;
