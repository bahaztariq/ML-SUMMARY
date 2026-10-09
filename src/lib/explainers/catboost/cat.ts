/**
 * CatBoost's two signature ideas on toy data: target statistics for a high-cardinality categorical
 * feature (naive, smoothed and ordered), and symmetric (oblivious) trees.
 */
import { mulberry32 } from '#lib/viz/canvas.ts';

/* ---------------- categorical data ---------------- */

/** A few big cities with genuinely different churn rates... */
export const BIG_CITIES = [
	{ name: 'Casablanca', share: 0.17, rate: 0.18 },
	{ name: 'Rabat', share: 0.12, rate: 0.5 },
	{ name: 'Marrakesh', share: 0.1, rate: 0.28 },
	{ name: 'Fes', share: 0.08, rate: 0.6 },
	{ name: 'Tangier', share: 0.07, rate: 0.22 },
	{ name: 'Agadir', share: 0.06, rate: 0.42 }
];
/** ...and a long tail of small towns whose churn rate is just the overall base rate. */
export const N_TOWNS = 120;
export const TOWN_RATE = 0.35;

export interface CatData {
	/** Category index per row: 0..5 big cities, 6.. towns. */
	cat: number[];
	y: number[];
}

export const catName = (c: number) => (c < BIG_CITIES.length ? BIG_CITIES[c].name : `town-${String(c - BIG_CITIES.length + 1).padStart(3, '0')}`);

export function makeChurn(seed: number, n: number): CatData {
	const rand = mulberry32(seed);
	const cat: number[] = [];
	const y: number[] = [];
	const bigShare = BIG_CITIES.reduce((a, c) => a + c.share, 0);
	for (let i = 0; i < n; i++) {
		let u = rand();
		let c = -1;
		for (let k = 0; k < BIG_CITIES.length; k++) {
			if (u < BIG_CITIES[k].share) {
				c = k;
				break;
			}
			u -= BIG_CITIES[k].share;
		}
		if (c < 0) c = BIG_CITIES.length + Math.floor(((u / (1 - bigShare)) * N_TOWNS) % N_TOWNS);
		const rate = c < BIG_CITIES.length ? BIG_CITIES[c].rate : TOWN_RATE;
		cat.push(c);
		y.push(rand() < rate ? 1 : 0);
	}
	return { cat, y };
}

export const mean = (v: readonly number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0);

/** Per-category totals over the given rows. */
export function totals(d: CatData, rows: readonly number[] = d.y.map((_, i) => i)) {
	const sum = new Map<number, number>();
	const cnt = new Map<number, number>();
	for (const i of rows) {
		sum.set(d.cat[i], (sum.get(d.cat[i]) ?? 0) + d.y[i]);
		cnt.set(d.cat[i], (cnt.get(d.cat[i]) ?? 0) + 1);
	}
	return { sum, cnt };
}

/**
 * Greedy target encoding on the training rows: each row gets its category's smoothed mean target
 * computed over *all* training rows, its own label included. a = 0 is the plain category mean.
 */
export function encodeGreedy(d: CatData, a: number, prior = mean(d.y)): number[] {
	const { sum, cnt } = totals(d);
	return d.cat.map((c) => (sum.get(c)! + a * prior) / (cnt.get(c)! + a));
}

/**
 * Ordered target statistics: walk the rows in the order `perm`; each row is encoded using only the
 * rows before it with the same category, (Σ y_j + a·p) / (n_j + a).
 */
export function encodeOrdered(d: CatData, perm: readonly number[], a: number, prior = mean(d.y)): number[] {
	const out = new Array(d.y.length).fill(0);
	const sum = new Map<number, number>();
	const cnt = new Map<number, number>();
	for (const i of perm) {
		const c = d.cat[i];
		const s = sum.get(c) ?? 0;
		const k = cnt.get(c) ?? 0;
		out[i] = (s + a * prior) / (k + a);
		sum.set(c, s + d.y[i]);
		cnt.set(c, k + 1);
	}
	return out;
}

/** Test-time encoding: statistics from the whole training set (prior for unseen categories). */
export function encodeTest(train: CatData, test: CatData, a: number, prior = mean(train.y)): number[] {
	const { sum, cnt } = totals(train);
	return test.cat.map((c) => {
		const k = cnt.get(c) ?? 0;
		const s = sum.get(c) ?? 0;
		return k + a > 0 ? (s + a * prior) / (k + a) : prior;
	});
}

export function permutation(n: number, seed: number): number[] {
	const rand = mulberry32(seed);
	const p = Array.from({ length: n }, (_, i) => i);
	for (let i = n - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[p[i], p[j]] = [p[j], p[i]];
	}
	return p;
}

/** ROC AUC of a score for 0/1 labels (probability a random positive outranks a random negative; ties count ½). */
export function auc(score: readonly number[], y: readonly number[]): number {
	const idx = score.map((_, i) => i).sort((a, b) => score[a] - score[b]);
	let rankSumPos = 0;
	let nPos = 0;
	let i = 0;
	while (i < idx.length) {
		let j = i;
		while (j + 1 < idx.length && score[idx[j + 1]] === score[idx[i]]) j++;
		const avgRank = (i + j) / 2 + 1;
		for (let k = i; k <= j; k++) if (y[idx[k]]) {
			rankSumPos += avgRank;
			nPos++;
		}
		i = j + 1;
	}
	const nNeg = y.length - nPos;
	if (!nPos || !nNeg) return NaN;
	return (rankSumPos - (nPos * (nPos + 1)) / 2) / (nPos * nNeg);
}

/* ---------------- symmetric (oblivious) trees ---------------- */

export type Pt = [number, number];

export interface Level {
	f: 0 | 1;
	thr: number;
}

export interface Oblivious {
	levels: Level[];
	/** Leaf values (mean label) indexed by the binary code of the comparisons, first level = highest bit. */
	values: number[];
	counts: number[];
}

/** Leaf index: bit k is 1 when the point is on the right (x[f] > thr) of level k. */
export function leafIndex(levels: readonly Level[], p: Pt): number {
	let idx = 0;
	for (const l of levels) idx = idx * 2 + (p[l.f] > l.thr ? 1 : 0);
	return idx;
}

/**
 * Grow an oblivious tree: at each level pick the single (feature, threshold) that most reduces the
 * total squared error summed over *all* current leaves, and apply it to every node of that level.
 */
export function fitOblivious(X: readonly Pt[], y: readonly number[], depth: number): Oblivious {
	const levels: Level[] = [];
	for (let d = 0; d < depth; d++) {
		const codes = X.map((p) => leafIndex(levels, p));
		const nLeaves = 2 ** d;
		let best: { f: 0 | 1; thr: number; sse: number } | null = null;
		for (const f of [0, 1] as const) {
			const order = X.map((_, i) => i).sort((a, b) => X[a][f] - X[b][f]);
			// running left sums per current leaf; right = total − left
			const tS = new Array(nLeaves).fill(0);
			const tN = new Array(nLeaves).fill(0);
			for (let i = 0; i < y.length; i++) {
				tS[codes[i]] += y[i];
				tN[codes[i]]++;
			}
			const lS = new Array(nLeaves).fill(0);
			const lN = new Array(nLeaves).fill(0);
			// SSE of 0/1 labels in a group = n·p(1−p) = S − S²/n
			const sseOf = (S: number, N: number) => (N ? S - (S * S) / N : 0);
			let sse = 0;
			for (let k = 0; k < nLeaves; k++) sse += sseOf(tS[k], tN[k]);
			for (let r = 0; r < order.length - 1; r++) {
				const i = order[r];
				const c = codes[i];
				sse -= sseOf(lS[c], lN[c]) + sseOf(tS[c] - lS[c], tN[c] - lN[c]);
				lS[c] += y[i];
				lN[c]++;
				sse += sseOf(lS[c], lN[c]) + sseOf(tS[c] - lS[c], tN[c] - lN[c]);
				const v = X[i][f];
				const next = X[order[r + 1]][f];
				if (next === v) continue;
				if (!best || sse < best.sse - 1e-12) best = { f, thr: (v + next) / 2, sse };
			}
		}
		if (!best) break;
		levels.push({ f: best.f, thr: best.thr });
	}
	const n = 2 ** levels.length;
	const sums = new Array(n).fill(0);
	const counts = new Array(n).fill(0);
	X.forEach((p, i) => {
		const k = leafIndex(levels, p);
		sums[k] += y[i];
		counts[k]++;
	});
	const prior = mean(y);
	return { levels, values: sums.map((s, k) => (counts[k] ? s / counts[k] : prior)), counts };
}

export const predictOblivious = (t: Oblivious, p: Pt) => (t.values[leafIndex(t.levels, p)] > 0.5 ? 1 : 0);
