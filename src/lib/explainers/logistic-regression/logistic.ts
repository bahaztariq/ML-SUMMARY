/**
 * Binary logistic regression on 2-D points. Pure functions so they can be unit-tested and replayed.
 *
 * Objective (same as scikit-learn's LogisticRegression with an L2 penalty, divided by C·n):
 *   J(w, b) = (1/n) Σ logloss_i + ‖w‖² / (2·C·n)        (the bias b is not penalised)
 */
import type { Data, Pt } from '../_classifiers/data.ts';

export interface Model {
	w: [number, number];
	b: number;
}

export const sigmoid = (z: number) => (z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)));
/** log(1 + e^z) without overflow. */
const softplus = (z: number) => (z > 30 ? z : z < -30 ? Math.exp(z) : Math.log1p(Math.exp(z)));

export const score = (m: Model, p: readonly number[]) => m.w[0] * p[0] + m.w[1] * p[1] + m.b;
export const prob = (m: Model, p: readonly number[]) => sigmoid(score(m, p));

/** −log P(true class): log(1 + e^−z) for class 1, log(1 + e^z) for class 0. */
export const pointLoss = (m: Model, p: readonly number[], y: number) => softplus(y ? -score(m, p) : score(m, p));

/** Mean log-loss plus the L2 penalty (C = Infinity → no penalty). */
export function loss(m: Model, d: Data, C = Infinity): number {
	const n = d.X.length;
	let total = 0;
	d.X.forEach((p, i) => (total += pointLoss(m, p, d.y[i])));
	const pen = Number.isFinite(C) ? (m.w[0] ** 2 + m.w[1] ** 2) / (2 * C * n) : 0;
	return total / n + pen;
}

/** ∂J/∂w = (1/n) Σ (p_i − y_i) x_i + w/(C·n),  ∂J/∂b = (1/n) Σ (p_i − y_i). */
export function gradient(m: Model, d: Data, C = Infinity): Model {
	const n = d.X.length;
	let g0 = 0;
	let g1 = 0;
	let gb = 0;
	d.X.forEach((p, i) => {
		const r = prob(m, p) - d.y[i];
		g0 += r * p[0];
		g1 += r * p[1];
		gb += r;
	});
	const reg = Number.isFinite(C) ? 1 / (C * n) : 0;
	return { w: [g0 / n + reg * m.w[0], g1 / n + reg * m.w[1]], b: gb / n };
}

export function gdStep(m: Model, d: Data, C: number, lr: number): Model {
	const g = gradient(m, d, C);
	return { w: [m.w[0] - lr * g.w[0], m.w[1] - lr * g.w[1]], b: m.b - lr * g.b };
}

export const gradNorm = (g: Model) => Math.hypot(g.w[0], g.w[1], g.b);

/** Solve a 3×3 linear system (Gaussian elimination with partial pivoting). */
function solve3(A: number[][], v: number[]): number[] {
	const M = A.map((r, i) => [...r, v[i]]);
	for (let c = 0; c < 3; c++) {
		let piv = c;
		for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
		[M[c], M[piv]] = [M[piv], M[c]];
		for (let r = c + 1; r < 3; r++) {
			const f = M[r][c] / M[c][c];
			for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k];
		}
	}
	const x = [0, 0, 0];
	for (let r = 2; r >= 0; r--) {
		let s = M[r][3];
		for (let k = r + 1; k < 3; k++) s -= M[r][k] * x[k];
		x[r] = s / M[r][r];
	}
	return x;
}

/** Exact minimiser of J by Newton's method (with step halving). Needs finite C or overlapping classes. */
export function fit(d: Data, C: number, start: Model = { w: [0, 0], b: 0 }, maxIter = 60): Model {
	let m: Model = { w: [start.w[0], start.w[1]], b: start.b };
	const n = d.X.length;
	const reg = Number.isFinite(C) ? 1 / (C * n) : 0;
	for (let it = 0; it < maxIter; it++) {
		const g = gradient(m, d, C);
		if (gradNorm(g) < 1e-10) break;
		const H = [
			[reg, 0, 0],
			[0, reg, 0],
			[0, 0, 0]
		];
		d.X.forEach((p) => {
			const q = prob(m, p);
			const s = (q * (1 - q)) / n;
			const x = [p[0], p[1], 1];
			for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) H[a][b] += s * x[a] * x[b];
		});
		const step = solve3(H, [g.w[0], g.w[1], g.b]);
		if (!step.every(Number.isFinite)) break;
		const before = loss(m, d, C);
		let t = 1;
		let next: Model = m;
		for (let k = 0; k < 30; k++) {
			next = { w: [m.w[0] - t * step[0], m.w[1] - t * step[1]], b: m.b - t * step[2] };
			if (loss(next, d, C) <= before + 1e-12) break;
			t /= 2;
		}
		m = next;
	}
	return m;
}

/** Predicted class at a probability threshold. */
export const predict = (m: Model, p: Pt, threshold = 0.5) => (prob(m, p) >= threshold ? 1 : 0);

/** z where σ(z) = t: the score the decision line sits on for threshold t. */
export const logit = (t: number) => Math.log(t / (1 - t));

export function confusion(m: Model, d: Data, threshold = 0.5) {
	const c = { tp: 0, fp: 0, fn: 0, tn: 0 };
	d.X.forEach((p, i) => {
		const yhat = predict(m, p, threshold);
		if (yhat && d.y[i]) c.tp++;
		else if (yhat) c.fp++;
		else if (d.y[i]) c.fn++;
		else c.tn++;
	});
	return c;
}
