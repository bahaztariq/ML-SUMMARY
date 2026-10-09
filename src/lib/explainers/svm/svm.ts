/**
 * Soft-margin SVM trained by SMO (Sequential Minimal Optimization) with libsvm's
 * maximal-violating-pair working-set selection. Deterministic, pure, small-data friendly.
 *
 * Dual problem:  min ½ αᵀQα − Σα   s.t.  0 ≤ αᵢ ≤ C,  Σ yᵢαᵢ = 0,   Qᵢⱼ = yᵢyⱼK(xᵢ, xⱼ)
 * Decision:      f(x) = Σ αᵢyᵢK(xᵢ, x) + b
 */
import type { Pt } from '../_classifiers/data.ts';

export type Kernel = { type: 'linear' } | { type: 'rbf'; gamma: number };

export const kernelFn = (k: Kernel) =>
	k.type === 'linear'
		? (a: readonly number[], b: readonly number[]) => a[0] * b[0] + a[1] * b[1]
		: (a: readonly number[], b: readonly number[]) => Math.exp(-k.gamma * ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2));

export interface SvmModel {
	X: Pt[];
	/** Labels as ±1. */
	y: number[];
	alpha: number[];
	b: number;
	C: number;
	kernel: Kernel;
	/** Primal weights, linear kernel only. */
	w: [number, number] | null;
	/** Indices with α > 0. */
	sv: number[];
	iterations: number;
	/** Final KKT gap (m(α) − M(α)); below `tol` means converged. */
	gap: number;
}

export interface TrainOpts {
	tol?: number;
	maxIter?: number;
}

/** Train on labels 0/1 (class 1 → +1, class 0 → −1). */
export function train(X: readonly (readonly number[])[], labels: readonly number[], C: number, kernel: Kernel, opts: TrainOpts = {}): SvmModel {
	const { tol = 1e-3, maxIter = 200000 } = opts;
	const n = X.length;
	const pts: Pt[] = X.map((p) => [p[0], p[1]]);
	const y = labels.map((c) => (c ? 1 : -1));
	const K = kernelFn(kernel);
	// precomputed Q
	const Q = new Float64Array(n * n);
	for (let i = 0; i < n; i++)
		for (let j = i; j < n; j++) {
			const q = y[i] * y[j] * K(pts[i], pts[j]);
			Q[i * n + j] = q;
			Q[j * n + i] = q;
		}
	const alpha = new Float64Array(n);
	const G = new Float64Array(n).fill(-1); // gradient of the dual: Qα − e
	let it = 0;
	let gap = Infinity;
	const TAU = 1e-12;

	while (it < maxIter) {
		// select the maximal violating pair
		let Gmax = -Infinity;
		let Gmax2 = -Infinity;
		let i = -1;
		let j = -1;
		for (let t = 0; t < n; t++) {
			if (y[t] === 1) {
				if (alpha[t] < C && -G[t] >= Gmax) {
					Gmax = -G[t];
					i = t;
				}
				if (alpha[t] > 0 && G[t] >= Gmax2) {
					Gmax2 = G[t];
					j = t;
				}
			} else {
				if (alpha[t] > 0 && G[t] >= Gmax) {
					Gmax = G[t];
					i = t;
				}
				if (alpha[t] < C && -G[t] >= Gmax2) {
					Gmax2 = -G[t];
					j = t;
				}
			}
		}
		gap = Gmax + Gmax2;
		if (i < 0 || j < 0 || gap < tol) break;
		it++;

		const oldAi = alpha[i];
		const oldAj = alpha[j];
		const Qii = Q[i * n + i];
		const Qjj = Q[j * n + j];
		const Qij = Q[i * n + j];
		if (y[i] !== y[j]) {
			let quad = Qii + Qjj + 2 * Qij;
			if (quad <= 0) quad = TAU;
			const delta = (-G[i] - G[j]) / quad;
			const diff = alpha[i] - alpha[j];
			alpha[i] += delta;
			alpha[j] += delta;
			if (diff > 0) {
				if (alpha[j] < 0) {
					alpha[j] = 0;
					alpha[i] = diff;
				}
			} else if (alpha[i] < 0) {
				alpha[i] = 0;
				alpha[j] = -diff;
			}
			if (diff > 0) {
				if (alpha[i] > C) {
					alpha[i] = C;
					alpha[j] = C - diff;
				}
			} else if (alpha[j] > C) {
				alpha[j] = C;
				alpha[i] = C + diff;
			}
		} else {
			let quad = Qii + Qjj - 2 * Qij;
			if (quad <= 0) quad = TAU;
			const delta = (G[i] - G[j]) / quad;
			const sum = alpha[i] + alpha[j];
			alpha[i] -= delta;
			alpha[j] += delta;
			if (sum > C) {
				if (alpha[i] > C) {
					alpha[i] = C;
					alpha[j] = sum - C;
				}
			} else if (alpha[j] < 0) {
				alpha[j] = 0;
				alpha[i] = sum;
			}
			if (sum > C) {
				if (alpha[j] > C) {
					alpha[j] = C;
					alpha[i] = sum - C;
				}
			} else if (alpha[i] < 0) {
				alpha[i] = 0;
				alpha[j] = sum;
			}
		}
		const dAi = alpha[i] - oldAi;
		const dAj = alpha[j] - oldAj;
		for (let t = 0; t < n; t++) G[t] += Q[t * n + i] * dAi + Q[t * n + j] * dAj;
	}

	// bias: average over free support vectors, else midpoint of the feasible interval (libsvm)
	let ub = Infinity;
	let lb = -Infinity;
	let nFree = 0;
	let sumFree = 0;
	for (let t = 0; t < n; t++) {
		const yG = y[t] * G[t];
		if (alpha[t] >= C) {
			if (y[t] === -1) ub = Math.min(ub, yG);
			else lb = Math.max(lb, yG);
		} else if (alpha[t] <= 0) {
			if (y[t] === 1) ub = Math.min(ub, yG);
			else lb = Math.max(lb, yG);
		} else {
			nFree++;
			sumFree += yG;
		}
	}
	const rho = nFree > 0 ? sumFree / nFree : (ub + lb) / 2;

	const a = Array.from(alpha);
	let w: [number, number] | null = null;
	if (kernel.type === 'linear') {
		w = [0, 0];
		for (let t = 0; t < n; t++) {
			w[0] += a[t] * y[t] * pts[t][0];
			w[1] += a[t] * y[t] * pts[t][1];
		}
	}
	const sv = a.map((v, t) => (v > 1e-9 ? t : -1)).filter((t) => t >= 0);
	return { X: pts, y, alpha: a, b: -rho, C, kernel, w, sv, iterations: it, gap };
}

/** f(x) = Σ αᵢyᵢK(xᵢ, x) + b. Positive → class 1 (B). */
export function decision(m: SvmModel, p: readonly number[]): number {
	if (m.w) return m.w[0] * p[0] + m.w[1] * p[1] + m.b;
	const K = kernelFn(m.kernel);
	let f = m.b;
	for (const i of m.sv) f += m.alpha[i] * m.y[i] * K(m.X[i], p);
	return f;
}

export const predict = (m: SvmModel, p: readonly number[]) => (decision(m, p) >= 0 ? 1 : 0);

/** Width of the street, 2/‖w‖ (linear kernel). */
export const marginWidth = (m: SvmModel) => (m.w ? 2 / Math.hypot(m.w[0], m.w[1]) : NaN);

export type PointRole = 'outside' | 'margin' | 'inside' | 'wrong';

/**
 * outside: not a support vector (α = 0, y·f ≥ 1)
 * margin:  free support vector sitting on the street's edge (0 < α < C, y·f = 1)
 * inside:  bounded support vector inside the street but on the right side (α = C, 0 ≤ y·f < 1)
 * wrong:   bounded support vector on the wrong side of the boundary (y·f < 0)
 */
export function role(m: SvmModel, i: number): PointRole {
	const a = m.alpha[i];
	if (a <= 1e-9) return 'outside';
	const yf = m.y[i] * decision(m, m.X[i]);
	if (yf < 0) return 'wrong';
	if (a < m.C - 1e-9 * Math.max(1, m.C) || yf >= 1 - 1e-3) return 'margin';
	return 'inside';
}

/** Primal soft-margin objective for a linear model: ½‖w‖² + C Σ max(0, 1 − yᵢf(xᵢ)). */
export function primal(m: SvmModel): number {
	if (!m.w) return NaN;
	let hinge = 0;
	m.X.forEach((p, i) => (hinge += Math.max(0, 1 - m.y[i] * decision(m, p))));
	return 0.5 * (m.w[0] ** 2 + m.w[1] ** 2) + m.C * hinge;
}
