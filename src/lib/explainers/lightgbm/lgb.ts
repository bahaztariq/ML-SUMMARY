/**
 * LightGBM's main ideas on a small 2-D binary problem: histogram binning of features, split finding
 * from per-bin gradient sums, leaf-wise (best-first) vs level-wise tree growth under the same leaf
 * budget, and Gradient-based One-Side Sampling (GOSS).
 */
import { mulberry32 } from '#lib/viz/canvas.ts';
import { leafWeight, logisticGH, logit, predictTree, splitGain, type BNode } from '../_ensembles/boost.ts';

export type Pt = [number, number];

export interface Data {
	X: Pt[];
	y: number[];
}

/** True rule: class 1 in the top-right block, or inside a small disc at the bottom left. */
export function truth([a, b]: Pt): number {
	return (a > 0.15 && b > -0.35) || (a + 0.5) ** 2 + (b + 0.5) ** 2 < 0.1 ? 1 : 0;
}

export function makeData(seed: number, n: number, flip: number): Data {
	const rand = mulberry32(seed);
	const X: Pt[] = [];
	const y: number[] = [];
	for (let i = 0; i < n; i++) {
		const p: Pt = [rand() * 1.9 - 0.95, rand() * 1.9 - 0.95];
		let c = truth(p);
		if (rand() < flip) c = 1 - c;
		X.push(p);
		y.push(c);
	}
	return { X, y };
}

/* ---------------- histogram binning ---------------- */

/**
 * Bin upper edges for one feature, placed at quantiles so each bin holds roughly the same number of
 * rows (LightGBM's binning is similar in spirit: it groups distinct values so bins are balanced).
 * Edges sit halfway between neighbouring distinct values. At most maxBin bins.
 */
export function binEdges(values: readonly number[], maxBin: number): number[] {
	const v = [...values].sort((a, b) => a - b);
	const edges: number[] = [];
	for (let k = 1; k < maxBin; k++) {
		const pos = Math.round((k * v.length) / maxBin);
		if (pos <= 0 || pos >= v.length) continue;
		if (v[pos] === v[pos - 1]) continue;
		const e = (v[pos - 1] + v[pos]) / 2;
		if (!edges.length || e > edges[edges.length - 1]) edges.push(e);
	}
	return edges;
}

/** Bin index of a value: the number of edges strictly below it. */
export function binOf(edges: readonly number[], x: number): number {
	let lo = 0;
	let hi = edges.length;
	while (lo < hi) {
		const mid = (lo + hi) >> 1;
		if (edges[mid] < x) lo = mid + 1;
		else hi = mid;
	}
	return lo;
}

export interface Binned {
	edges: number[][];
	/** bins[f][i] = bin of row i on feature f. */
	bins: Uint16Array[];
}

export function binData(X: readonly Pt[], maxBin: number): Binned {
	const edges = [0, 1].map((f) => binEdges(X.map((p) => p[f]), maxBin));
	const bins = edges.map((e, f) => Uint16Array.from(X, (p) => binOf(e, p[f])));
	return { edges, bins };
}

/* ---------------- histogram split finding ---------------- */

export interface Histogram {
	G: Float64Array;
	H: Float64Array;
	n: Uint32Array;
}

/** One pass over the rows: per-bin sums of (weighted) gradients, hessians and counts. */
export function histogram(b: Binned, f: number, g: readonly number[], h: readonly number[], rows: readonly number[], w?: readonly number[]): Histogram {
	const k = b.edges[f].length + 1;
	const out = { G: new Float64Array(k), H: new Float64Array(k), n: new Uint32Array(k) };
	for (const i of rows) {
		const bin = b.bins[f][i];
		const wi = w ? w[i] : 1;
		out.G[bin] += g[i] * wi;
		out.H[bin] += h[i] * wi;
		out.n[bin]++;
	}
	return out;
}

export interface HSplit {
	f: number;
	/** Split after this bin: rows with bin <= b go left. */
	bin: number;
	/** Feature value of that bin edge. */
	thr: number;
	gain: number;
	GL: number;
	HL: number;
	nL: number;
	GR: number;
	HR: number;
	nR: number;
}

/** Scan a histogram's bin edges left to right; returns the gain after every bin edge. */
export function scan(hist: Histogram, edges: readonly number[], f: number, lambda: number): HSplit[] {
	let G = 0,
		H = 0,
		n = 0;
	for (let k = 0; k < hist.G.length; k++) {
		G += hist.G[k];
		H += hist.H[k];
		n += hist.n[k];
	}
	const out: HSplit[] = [];
	let GL = 0,
		HL = 0,
		nL = 0;
	for (let k = 0; k < edges.length; k++) {
		GL += hist.G[k];
		HL += hist.H[k];
		nL += hist.n[k];
		out.push({ f, bin: k, thr: edges[k], gain: splitGain(GL, HL, G - GL, H - HL, lambda), GL, HL, nL, GR: G - GL, HR: H - HL, nR: n - nL });
	}
	return out;
}

export interface GrowOpts {
	numLeaves: number;
	/** Depth limit (Infinity = none, LightGBM's max_depth = -1). */
	maxDepth: number;
	minDataInLeaf: number;
	lambda: number;
	policy: 'leaf' | 'level';
}

export function bestHistSplit(
	b: Binned,
	g: readonly number[],
	h: readonly number[],
	rows: readonly number[],
	o: Pick<GrowOpts, 'minDataInLeaf' | 'lambda'>,
	w?: readonly number[]
): HSplit | null {
	// same as scanning with `scan`, without allocating a candidate per bin edge
	let best: HSplit | null = null;
	for (const f of [0, 1]) {
		const hist = histogram(b, f, g, h, rows, w);
		const edges = b.edges[f];
		let G = 0,
			H = 0,
			n = 0;
		for (let k = 0; k < hist.G.length; k++) {
			G += hist.G[k];
			H += hist.H[k];
			n += hist.n[k];
		}
		let GL = 0,
			HL = 0,
			nL = 0;
		for (let k = 0; k < edges.length; k++) {
			GL += hist.G[k];
			HL += hist.H[k];
			nL += hist.n[k];
			if (nL < o.minDataInLeaf || n - nL < o.minDataInLeaf) continue;
			const gain = splitGain(GL, HL, G - GL, H - HL, o.lambda);
			if (gain <= 1e-12 || (best && gain <= best.gain + 1e-12)) continue;
			best = { f, bin: k, thr: edges[k], gain, GL, HL, nL, GR: G - GL, HR: H - HL, nR: n - nL };
		}
	}
	return best;
}

export interface LNode extends BNode {
	/** Order in which this node was split (1 = first), if it was. */
	order?: number;
	left?: LNode;
	right?: LNode;
}

/**
 * Grow one tree with at most numLeaves leaves. 'leaf' = best-first (LightGBM): always split the leaf
 * whose best split has the largest gain. 'level' = depth-wise (XGBoost's default): split leaves level
 * by level, left to right, until the leaf budget runs out.
 */
export function growHist(
	b: Binned,
	g: readonly number[],
	h: readonly number[],
	rows: readonly number[],
	o: GrowOpts,
	w?: readonly number[]
): LNode {
	let nextId = 0;
	interface Open {
		node: LNode;
		rows: number[];
		split: HSplit | null;
	}
	const make = (r: number[], depth: number): Open => {
		let G = 0,
			H = 0;
		for (const i of r) {
			const wi = w ? w[i] : 1;
			G += g[i] * wi;
			H += h[i] * wi;
		}
		const node: LNode = { id: nextId++, depth, n: r.length, G, H, w: leafWeight(G, H, o.lambda) };
		const split = depth < o.maxDepth && r.length >= 2 * o.minDataInLeaf ? bestHistSplit(b, g, h, r, o, w) : null;
		return { node, rows: r, split };
	};
	const root = make([...rows], 0);
	let open: Open[] = [root];
	let leaves = 1;
	let order = 0;
	while (leaves < o.numLeaves) {
		const candidates = open.filter((x) => x.split);
		if (!candidates.length) break;
		let pick: Open;
		if (o.policy === 'leaf') pick = candidates.reduce((a, x) => (x.split!.gain > a.split!.gain ? x : a));
		else {
			const minDepth = Math.min(...candidates.map((x) => x.node.depth));
			pick = candidates.find((x) => x.node.depth === minDepth)!;
		}
		const s = pick.split!;
		const L: number[] = [];
		const R: number[] = [];
		for (const i of pick.rows) (b.bins[s.f][i] <= s.bin ? L : R).push(i);
		const l = make(L, pick.node.depth + 1);
		const r = make(R, pick.node.depth + 1);
		pick.node.split = { f: s.f, thr: s.thr, gain: s.gain, missLeft: true };
		pick.node.left = l.node;
		pick.node.right = r.node;
		pick.node.order = ++order;
		open = open.filter((x) => x !== pick).concat([l, r]);
		leaves++;
	}
	return root.node;
}

/** Sum of the gains of all splits in a tree = how much it lowers the (second-order) training loss. */
export function totalGain(t: LNode): number {
	return t.split && t.left && t.right ? t.split.gain + totalGain(t.left) + totalGain(t.right) : 0;
}

/* ---------------- GOSS ---------------- */

/**
 * Gradient-based One-Side Sampling: keep the top `a` fraction of rows by |g|, randomly sample a `b`
 * fraction of all rows from the rest, and up-weight those by (1 − a)/b so gradient sums stay unbiased.
 */
export function goss(g: readonly number[], a: number, b: number, rand: () => number) {
	const n = g.length;
	const order = g.map((_, i) => i).sort((p, q) => Math.abs(g[q]) - Math.abs(g[p]));
	const topN = Math.round(a * n);
	const otherN = Math.min(n - topN, Math.round(b * n));
	const top = order.slice(0, topN);
	const rest = order.slice(topN);
	for (let i = rest.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[rest[i], rest[j]] = [rest[j], rest[i]];
	}
	const sampled = rest.slice(0, otherN);
	const weights = new Array(n).fill(0);
	for (const i of top) weights[i] = 1;
	const amp = otherN ? (1 - a) / b : 0;
	for (const i of sampled) weights[i] = amp;
	return { top, sampled, rows: [...top, ...sampled].sort((p, q) => p - q), weights, amp };
}

/* ---------------- boosting ---------------- */

export interface LGBOpts extends GrowOpts {
	rounds: number;
	lr: number;
	maxBin: number;
	/** GOSS rates, or null for all rows. */
	goss: { top: number; other: number } | null;
	seed: number;
}

export interface LGBModel {
	base: number;
	trees: LNode[];
	lr: number;
}

export function fitLGB(d: Data, o: LGBOpts): LGBModel {
	const binned = binData(d.X, o.maxBin);
	const m = d.y.reduce((a, c) => a + c, 0) / d.y.length;
	const base = logit(Math.min(0.99, Math.max(0.01, m)));
	const F = d.y.map(() => base);
	const all = d.y.map((_, i) => i);
	const rand = mulberry32(o.seed);
	const trees: LNode[] = [];
	for (let t = 0; t < o.rounds; t++) {
		const { g, h } = logisticGH(F, d.y);
		let rows = all;
		let w: number[] | undefined;
		if (o.goss) {
			const s = goss(g, o.goss.top, o.goss.other, rand);
			rows = s.rows;
			w = s.weights;
		}
		const tree = growHist(binned, g, h, rows, o, w);
		trees.push(tree);
		for (let i = 0; i < F.length; i++) F[i] += o.lr * predictTree(tree, d.X[i]);
	}
	return { base, trees, lr: o.lr };
}

export function stagedLogit(m: LGBModel, X: readonly Pt[], M = m.trees.length): Float64Array[] {
	const cur = new Float64Array(X.length).fill(m.base);
	const out = [Float64Array.from(cur)];
	for (let t = 0; t < M; t++) {
		for (let i = 0; i < X.length; i++) cur[i] += m.lr * predictTree(m.trees[t], X[i]);
		out.push(Float64Array.from(cur));
	}
	return out;
}
