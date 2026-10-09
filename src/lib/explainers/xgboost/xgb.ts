/**
 * A small XGBoost-style booster for binary classification (log-loss): second-order trees with
 * λ / γ regularisation, missing-value default directions, row and column subsampling.
 */
import { gaussian, mulberry32 } from '#lib/viz/canvas.ts';
import { growTree, logisticGH, logit, predictTree, sigmoid, type BNode, type TreeOpts } from '../_ensembles/boost.ts';

export const X_MIN = 0;
export const X_MAX = 10;
/** Fraction of rows whose x₁ is missing. */
export const MISSING = 0.15;
export const FEATURES = ['x₁', 'x₂', 'x₃'] as const;

/** True log-odds of class 1 given x₁: positives cluster in the middle of the range. */
export const trueLogit = (x1: number) => 2.4 - 0.5 * (x1 - 5.4) ** 2;
/** Rows with x₁ missing are mostly positive (missingness carries information). */
const MISSING_LOGIT = 1.6;

export interface XData {
	/** Rows of [x₁ (NaN = missing), x₂ (a noisy proxy), x₃ (pure noise)]. */
	X: number[][];
	y: number[];
}

export function makeData(seed: number, n: number): XData {
	const rand = mulberry32(seed);
	const gauss = gaussian(rand);
	const X: number[][] = [];
	const y: number[] = [];
	for (let i = 0; i < n; i++) {
		const x1 = X_MIN + 0.2 + rand() * (X_MAX - X_MIN - 0.4);
		const miss = rand() < MISSING;
		const p = sigmoid(miss ? MISSING_LOGIT : trueLogit(x1));
		const c = rand() < p ? 1 : 0;
		const x2 = Math.abs(x1 - 5.4) + 1.6 * gauss();
		const x3 = rand() * 10;
		X.push([miss ? NaN : x1, x2, x3]);
		y.push(c);
	}
	return { X, y };
}

export interface XGBOpts {
	rounds: number;
	/** η (eta). */
	lr: number;
	maxDepth: number;
	lambda: number;
	gamma: number;
	minChildWeight: number;
	/** Fraction of rows sampled (without replacement) for each tree. */
	subsample: number;
	/** Fraction of features sampled for each tree (colsample_bytree). */
	colsample: number;
	/** Features the model may use at all. */
	features: readonly number[];
	seed: number;
}

export interface XGBModel {
	base: number;
	trees: BNode[];
	lr: number;
	/** Rows and features each tree was allowed to see. */
	rows: number[][];
	cols: number[][];
}

/** Draw ⌈rate·n⌉ distinct items (in original order) from `items`. */
export function sampleWithout<T>(items: readonly T[], rate: number, rand: () => number): T[] {
	const k = Math.max(1, Math.round(rate * items.length));
	if (k >= items.length) return [...items];
	const idx = items.map((_, i) => i);
	for (let i = idx.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[idx[i], idx[j]] = [idx[j], idx[i]];
	}
	return idx
		.slice(0, k)
		.sort((a, b) => a - b)
		.map((i) => items[i]);
}

/** The per-tree row and column samples for tree number `t` (deterministic in seed and t). */
export function treeSample(n: number, o: Pick<XGBOpts, 'subsample' | 'colsample' | 'features' | 'seed'>, t: number) {
	const rand = mulberry32(o.seed * 7919 + t * 104729 + 1);
	const rows = sampleWithout(
		Array.from({ length: n }, (_, i) => i),
		o.subsample,
		rand
	);
	const cols = sampleWithout(o.features, o.colsample, rand);
	return { rows, cols };
}

export function baseScore(y: readonly number[]) {
	const m = y.reduce((a, b) => a + b, 0) / y.length;
	return logit(Math.min(0.99, Math.max(0.01, m)));
}

export function fitXGB(d: XData, o: XGBOpts): XGBModel {
	const base = baseScore(d.y);
	const F = d.y.map(() => base);
	const model: XGBModel = { base, trees: [], lr: o.lr, rows: [], cols: [] };
	for (let t = 0; t < o.rounds; t++) {
		const { g, h } = logisticGH(F, d.y);
		const { rows, cols } = treeSample(d.y.length, o, t);
		const opts: TreeOpts = { maxDepth: o.maxDepth, lambda: o.lambda, gamma: o.gamma, minChildWeight: o.minChildWeight, features: cols };
		const tree = growTree(d.X, g, h, rows, opts);
		model.trees.push(tree);
		model.rows.push(rows);
		model.cols.push(cols);
		for (let i = 0; i < F.length; i++) F[i] += o.lr * predictTree(tree, d.X[i]);
	}
	return model;
}

/** Log-odds after 0..M trees for each row: out[m][i]. */
export function stagedLogit(m: XGBModel, X: readonly (readonly number[])[], M = m.trees.length): Float64Array[] {
	const cur = new Float64Array(X.length).fill(m.base);
	const out = [Float64Array.from(cur)];
	for (let t = 0; t < M; t++) {
		for (let i = 0; i < X.length; i++) cur[i] += m.lr * predictTree(m.trees[t], X[i]);
		out.push(Float64Array.from(cur));
	}
	return out;
}
