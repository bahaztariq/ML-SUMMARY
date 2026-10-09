/**
 * Gradient boosting for 1-D regression with squared loss, plus discrete AdaBoost with stumps.
 * Pure functions over plain arrays so the lesson can replay them deterministically.
 */
import { gaussian, mulberry32 } from '#lib/viz/canvas.ts';
import { growTree, predictTree, squaredGH, type BNode } from '../_ensembles/boost.ts';

/* ---------------- regression data ---------------- */

export const X_MIN = 0;
export const X_MAX = 10;

/** The smooth curve the data is drawn from. */
export const truth = (x: number) => 1.4 * Math.sin(0.95 * x) + 0.22 * x - 1;

export interface Data1D {
	x: number[];
	y: number[];
}

export function makeData(seed: number, n: number, noise: number): Data1D {
	const rand = mulberry32(seed);
	const gauss = gaussian(rand);
	const x: number[] = [];
	for (let i = 0; i < n; i++) x.push(X_MIN + 0.2 + rand() * (X_MAX - X_MIN - 0.4));
	x.sort((a, b) => a - b);
	return { x, y: x.map((v) => truth(v) + noise * gauss()) };
}

/* ---------------- gradient boosting ---------------- */

export interface BoostOpts {
	rounds: number;
	lr: number;
	maxDepth: number;
	minLeaf?: number;
}

export interface Booster {
	F0: number;
	/** Trees fitted to the residuals; each contributes lr · tree(x). */
	trees: BNode[];
	lr: number;
}

const col = (x: readonly number[]) => x.map((v) => [v]);

/**
 * Squared-loss gradient boosting: start from the mean, then at every stage fit a regression tree to
 * the residuals y − F and add it shrunk by the learning rate.
 */
export function boost(d: Data1D, o: BoostOpts): Booster {
	const X = col(d.x);
	const F0 = d.y.reduce((a, b) => a + b, 0) / d.y.length;
	const F = d.y.map(() => F0);
	const idx = d.x.map((_, i) => i);
	const trees: BNode[] = [];
	for (let m = 0; m < o.rounds; m++) {
		const { g, h } = squaredGH(F, d.y);
		const t = growTree(X, g, h, idx, { maxDepth: o.maxDepth, minLeaf: o.minLeaf ?? 1 });
		trees.push(t);
		for (let i = 0; i < F.length; i++) F[i] += o.lr * predictTree(t, X[i]);
	}
	return { F0, trees, lr: o.lr };
}

/** Predictions after 0..M stages for each x: out[m][i]. */
export function staged(b: Booster, x: readonly number[], M = b.trees.length): Float64Array[] {
	const cur = new Float64Array(x.length).fill(b.F0);
	const out = [Float64Array.from(cur)];
	for (let m = 0; m < M; m++) {
		const t = b.trees[m];
		for (let i = 0; i < x.length; i++) cur[i] += b.lr * predictTree(t, [x[i]]);
		out.push(Float64Array.from(cur));
	}
	return out;
}

export function mse(pred: ArrayLike<number>, y: readonly number[]) {
	let s = 0;
	for (let i = 0; i < y.length; i++) s += (pred[i] - y[i]) ** 2;
	return s / y.length;
}

/** The pieces of a 1-D tree: [x0, x1) intervals with their leaf value. */
export function pieces(t: BNode, lo = X_MIN, hi = X_MAX): { x0: number; x1: number; w: number; n: number }[] {
	if (!t.split || !t.left || !t.right) return [{ x0: lo, x1: hi, w: t.w, n: t.n }];
	const thr = t.split.thr;
	return [...pieces(t.left, lo, Math.min(hi, thr)), ...pieces(t.right, Math.max(lo, thr), hi)].filter((p) => p.x1 > p.x0);
}

/* ---------------- AdaBoost (discrete, two classes, decision stumps) ---------------- */

export type Pt = [number, number];

export interface Stump {
	f: 0 | 1;
	thr: number;
	/** Class (+1 / −1) predicted for x[f] <= thr; the other side gets the opposite. */
	left: 1 | -1;
}

export const stumpPredict = (s: Stump, p: Pt): 1 | -1 => (p[s.f] <= s.thr ? s.left : (-s.left as 1 | -1));

/** Stump with the lowest weighted error. y in {−1, +1}. */
export function bestStump(X: readonly Pt[], y: readonly number[], w: readonly number[]): { stump: Stump; err: number } {
	let best = { stump: { f: 0, thr: 0, left: 1 } as Stump, err: Infinity };
	const total = w.reduce((a, b) => a + b, 0);
	for (const f of [0, 1] as const) {
		const order = X.map((_, i) => i).sort((a, b) => X[a][f] - X[b][f]);
		// weight of +1 and −1 points on the left so far
		let posL = 0;
		let negL = 0;
		const pos = order.reduce((a, i) => a + (y[i] > 0 ? w[i] : 0), 0);
		const neg = total - pos;
		const consider = (thr: number) => {
			// left = +1: errors are left negatives + right positives
			const e1 = negL + (pos - posL);
			const e2 = posL + (neg - negL);
			if (e1 < best.err - 1e-12) best = { stump: { f, thr, left: 1 }, err: e1 };
			if (e2 < best.err - 1e-12) best = { stump: { f, thr, left: -1 }, err: e2 };
		};
		consider(X[order[0]][f] - 0.01);
		for (let k = 0; k < order.length; k++) {
			const i = order[k];
			if (y[i] > 0) posL += w[i];
			else negL += w[i];
			const v = X[i][f];
			const next = k + 1 < order.length ? X[order[k + 1]][f] : v + 0.02;
			if (next === v) continue;
			consider((v + next) / 2);
		}
	}
	return { stump: best.stump, err: best.err / total };
}

export interface AdaRound {
	stump: Stump;
	/** Weighted error of the stump. */
	err: number;
	/** Its say in the final vote, ½·ln((1−ε)/ε). */
	alpha: number;
	/** Sample weights *used to fit* this round (sum to 1). */
	weights: number[];
}

/** Run discrete AdaBoost for `rounds` rounds. Labels 0/1 are mapped to −1/+1. */
export function adaboost(X: readonly Pt[], labels: readonly number[], rounds: number): AdaRound[] {
	const y = labels.map((c) => (c ? 1 : -1));
	let w = y.map(() => 1 / y.length);
	const out: AdaRound[] = [];
	for (let m = 0; m < rounds; m++) {
		const { stump, err } = bestStump(X, y, w);
		const e = Math.min(1 - 1e-6, Math.max(1e-6, err));
		const alpha = 0.5 * Math.log((1 - e) / e);
		out.push({ stump, err, alpha, weights: w });
		const next = w.map((wi, i) => wi * Math.exp(-alpha * y[i] * stumpPredict(stump, X[i])));
		const z = next.reduce((a, b) => a + b, 0);
		w = next.map((v) => v / z);
	}
	return out;
}

/** Weighted vote Σ α·h(x) of the first M rounds (> 0 means class 1). */
export function adaScore(rounds: readonly AdaRound[], p: Pt, M = rounds.length) {
	let s = 0;
	for (let m = 0; m < M; m++) s += rounds[m].alpha * stumpPredict(rounds[m].stump, p);
	return s;
}
