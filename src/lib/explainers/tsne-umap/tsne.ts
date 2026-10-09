/**
 * Exact (small-n) t-SNE and a simplified UMAP. Pure functions over typed arrays, deterministic
 * for a given seed, so the explainer can replay a run frame by frame.
 */
import { gaussian, mulberry32 } from '#lib/viz/canvas.ts';

export type Mat = number[][];

/* ---------------- data ---------------- */

export const CLUSTERS = [
	{ c: [-4, 0, -0.9], sd: 0.3 },
	{ c: [-4, 0, 0.9], sd: 0.3 },
	{ c: [4, 0, 0], sd: 1.2 },
	{ c: [0, 3.5, 0], sd: 0.3 },
	{ c: [0, -3.5, 0], sd: 0.6 }
];
/** Clusters 0 and 1 differ only along x₃, the lowest-variance axis: PCA stacks them. */
export const STACKED = [0, 1] as const;
/** Cluster 2 is 4× wider than cluster 3. */
export const WIDE = 2;
export const TIGHT = 3;

export function makeClusters(seed = 4, per = 40): { X: Mat; y: number[] } {
	const g = gaussian(mulberry32(seed));
	const X: Mat = [];
	const y: number[] = [];
	CLUSTERS.forEach(({ c, sd }, k) => {
		for (let i = 0; i < per; i++) {
			X.push(c.map((v) => v + g() * sd));
			y.push(k);
		}
	});
	return { X, y };
}

/** Squared Euclidean distances, n×n row-major. */
export function sqDist(X: Mat): Float64Array {
	const n = X.length;
	const D = new Float64Array(n * n);
	for (let i = 0; i < n; i++)
		for (let j = i + 1; j < n; j++) {
			let d = 0;
			for (let k = 0; k < X[i].length; k++) d += (X[i][k] - X[j][k]) ** 2;
			D[i * n + j] = d;
			D[j * n + i] = d;
		}
	return D;
}

/* ---------------- t-SNE affinities ---------------- */

/**
 * Conditional probabilities p(j|i) for one point: a Gaussian around i whose width (σᵢ) is tuned
 * by binary search so the distribution's perplexity 2^H equals the target.
 */
export function rowP(D: Float64Array, n: number, i: number, perplexity: number) {
	const target = Math.log(perplexity);
	const p = new Float64Array(n);
	let beta = 1;
	let lo = 0;
	let hi = Infinity;
	for (let it = 0; it < 64; it++) {
		let sum = 0;
		for (let j = 0; j < n; j++) {
			p[j] = j === i ? 0 : Math.exp(-D[i * n + j] * beta);
			sum += p[j];
		}
		if (sum === 0) sum = 1e-300;
		let H = 0;
		for (let j = 0; j < n; j++) {
			p[j] /= sum;
			if (p[j] > 1e-12) H -= p[j] * Math.log(p[j]);
		}
		if (Math.abs(H - target) < 1e-5) break;
		if (H > target) {
			lo = beta;
			beta = hi === Infinity ? beta * 2 : (beta + hi) / 2;
		} else {
			hi = beta;
			beta = (beta + lo) / 2;
		}
	}
	return { p, sigma: Math.sqrt(1 / (2 * beta)) };
}

/** Symmetric joint probabilities p_ij = (p(j|i) + p(i|j)) / 2n. */
export function jointP(D: Float64Array, n: number, perplexity: number): Float64Array {
	const P = new Float64Array(n * n);
	for (let i = 0; i < n; i++) {
		const { p } = rowP(D, n, i, perplexity);
		for (let j = 0; j < n; j++) P[i * n + j] = p[j];
	}
	for (let i = 0; i < n; i++)
		for (let j = i + 1; j < n; j++) {
			const v = Math.max((P[i * n + j] + P[j * n + i]) / (2 * n), 1e-12);
			P[i * n + j] = v;
			P[j * n + i] = v;
		}
	for (let i = 0; i < n; i++) P[i * n + i] = 0;
	return P;
}

/* ---------------- t-SNE optimisation ---------------- */

export interface Run {
	n: number;
	Y: Float64Array;
	iter: number;
	/** t-SNE: momentum buffer and per-parameter gains. */
	upd: Float64Array;
	gains: Float64Array;
}

export const TSNE_ITERS = 400;
export const EXAG_ITERS = 100;
const EXAG = 12;
const LR = 100;

export function initRun(n: number, seed: number, scale = 1e-2): Run {
	const g = gaussian(mulberry32(seed));
	const Y = new Float64Array(2 * n);
	for (let k = 0; k < 2 * n; k++) Y[k] = g() * scale;
	return { n, Y, iter: 0, upd: new Float64Array(2 * n), gains: new Float64Array(2 * n).fill(1) };
}

/** One gradient-descent step on KL(P‖Q) with Student-t similarities q_ij ∝ (1 + ‖yᵢ − yⱼ‖²)⁻¹. */
export function tsneStep(r: Run, P: Float64Array) {
	const { n, Y, upd, gains } = r;
	const exag = r.iter < EXAG_ITERS ? EXAG : 1;
	const mom = r.iter < EXAG_ITERS ? 0.5 : 0.8;
	const W = new Float64Array(n * n);
	let Z = 0;
	for (let i = 0; i < n; i++)
		for (let j = i + 1; j < n; j++) {
			const dx = Y[2 * i] - Y[2 * j];
			const dy = Y[2 * i + 1] - Y[2 * j + 1];
			const w = 1 / (1 + dx * dx + dy * dy);
			W[i * n + j] = w;
			W[j * n + i] = w;
			Z += 2 * w;
		}
	const G = new Float64Array(2 * n);
	for (let i = 0; i < n; i++) {
		let gx = 0;
		let gy = 0;
		for (let j = 0; j < n; j++) {
			if (i === j) continue;
			const w = W[i * n + j];
			const f = (exag * P[i * n + j] - w / Z) * w;
			gx += f * (Y[2 * i] - Y[2 * j]);
			gy += f * (Y[2 * i + 1] - Y[2 * j + 1]);
		}
		G[2 * i] = 4 * gx;
		G[2 * i + 1] = 4 * gy;
	}
	for (let k = 0; k < 2 * n; k++) {
		gains[k] = Math.sign(G[k]) !== Math.sign(upd[k]) ? gains[k] + 0.2 : Math.max(0.01, gains[k] * 0.8);
		upd[k] = mom * upd[k] - LR * gains[k] * G[k];
		Y[k] += upd[k];
	}
	// keep the map centred
	let mx = 0;
	let my = 0;
	for (let i = 0; i < n; i++) {
		mx += Y[2 * i];
		my += Y[2 * i + 1];
	}
	for (let i = 0; i < n; i++) {
		Y[2 * i] -= mx / n;
		Y[2 * i + 1] -= my / n;
	}
	r.iter++;
}

/** KL(P‖Q): how badly the map's neighbour probabilities match the input's. */
export function kl(P: Float64Array, Y: Float64Array, n: number): number {
	let Z = 0;
	for (let i = 0; i < n; i++)
		for (let j = i + 1; j < n; j++) Z += 2 / (1 + (Y[2 * i] - Y[2 * j]) ** 2 + (Y[2 * i + 1] - Y[2 * j + 1]) ** 2);
	let s = 0;
	for (let i = 0; i < n; i++)
		for (let j = 0; j < n; j++) {
			if (i === j) continue;
			const p = P[i * n + j];
			const q = 1 / (1 + (Y[2 * i] - Y[2 * j]) ** 2 + (Y[2 * i + 1] - Y[2 * j + 1]) ** 2) / Z;
			if (p > 1e-12) s += p * Math.log(p / Math.max(q, 1e-12));
		}
	return s;
}

/* ---------------- UMAP (simplified) ---------------- */

export interface Graph {
	n: number;
	/** Edges i → j with fuzzy membership weight w (symmetrized). */
	edges: { i: number; j: number; w: number }[];
	/** Each point's k nearest neighbours (for drawing the graph). */
	knn: number[][];
}

/** Fuzzy k-NN graph: wᵢⱼ = exp(−(dᵢⱼ − ρᵢ)/σᵢ), symmetrized with a + b − a·b. */
export function fuzzyGraph(D: Float64Array, n: number, k: number): Graph {
	const knn: number[][] = [];
	const W = new Map<number, number>();
	for (let i = 0; i < n; i++) {
		const order = Array.from({ length: n }, (_, j) => j)
			.filter((j) => j !== i)
			.sort((a, b) => D[i * n + a] - D[i * n + b])
			.slice(0, k);
		knn.push(order);
		const d = order.map((j) => Math.sqrt(D[i * n + j]));
		const rho = d[0];
		const target = Math.log2(k);
		let lo = 0;
		let hi = Infinity;
		let sigma = 1;
		for (let it = 0; it < 64; it++) {
			const sum = d.reduce((acc, dj) => acc + Math.exp(-Math.max(0, dj - rho) / sigma), 0);
			if (Math.abs(sum - target) < 1e-5) break;
			if (sum > target) {
				hi = sigma;
				sigma = (lo + hi) / 2;
			} else {
				lo = sigma;
				sigma = hi === Infinity ? sigma * 2 : (lo + hi) / 2;
			}
		}
		order.forEach((j, m) => W.set(i * n + j, Math.exp(-Math.max(0, d[m] - rho) / sigma)));
	}
	const edges: Graph['edges'] = [];
	for (let i = 0; i < n; i++)
		for (let j = i + 1; j < n; j++) {
			const a = W.get(i * n + j) ?? 0;
			const b = W.get(j * n + i) ?? 0;
			const w = a + b - a * b;
			if (w > 1e-4) edges.push({ i, j, w });
		}
	return { n, edges, knn };
}

/** Curve parameters for min_dist = 0.1, spread = 1 (as fitted by umap-learn). */
const A = 1.577;
const B = 0.8951;
export const UMAP_EPOCHS = 200;
const NEG = 5;

export function initUmap(n: number, seed: number): Run {
	const rand = mulberry32(seed);
	const Y = new Float64Array(2 * n);
	for (let k = 0; k < 2 * n; k++) Y[k] = rand() * 20 - 10;
	return { n, Y, iter: 0, upd: new Float64Array(0), gains: new Float64Array(0) };
}

const clip = (v: number) => Math.max(-4, Math.min(4, v));

/**
 * One epoch of UMAP's SGD on the fuzzy cross-entropy: each edge pulls its endpoints together
 * (sampled in proportion to its weight), and a few random "negative" points are pushed away.
 */
export function umapEpoch(r: Run, G: Graph, seed: number) {
	const { n, Y } = r;
	const rand = mulberry32(seed * 7919 + r.iter * 104729 + 1);
	const alphaLr = 1 - r.iter / UMAP_EPOCHS;
	const wmax = G.edges.reduce((m, e) => Math.max(m, e.w), 0) || 1;
	for (const e of G.edges) {
		if (rand() > e.w / wmax) continue;
		for (const [a, b] of [
			[e.i, e.j],
			[e.j, e.i]
		]) {
			let dx = Y[2 * a] - Y[2 * b];
			let dy = Y[2 * a + 1] - Y[2 * b + 1];
			let d2 = dx * dx + dy * dy;
			if (d2 > 0) {
				const c = (-2 * A * B * Math.pow(d2, B - 1)) / (1 + A * Math.pow(d2, B));
				Y[2 * a] += clip(c * dx) * alphaLr;
				Y[2 * a + 1] += clip(c * dy) * alphaLr;
			}
			for (let s = 0; s < NEG; s++) {
				const o = Math.floor(rand() * n);
				if (o === a) continue;
				dx = Y[2 * a] - Y[2 * o];
				dy = Y[2 * a + 1] - Y[2 * o + 1];
				d2 = dx * dx + dy * dy;
				const c = (2 * B) / ((0.001 + d2) * (1 + A * Math.pow(d2, B)));
				Y[2 * a] += (d2 > 0 ? clip(c * dx) : 4) * alphaLr;
				Y[2 * a + 1] += (d2 > 0 ? clip(c * dy) : 4) * alphaLr;
			}
		}
	}
	r.iter++;
}

/* ---------------- measuring the map ---------------- */

/** RMS distance of a group's points from their centroid, in a flat 2-D (or k-D) array. */
export function spread(Y: ArrayLike<number>, dim: number, idx: number[]): number {
	const c = new Array(dim).fill(0);
	for (const i of idx) for (let d = 0; d < dim; d++) c[d] += Y[i * dim + d] / idx.length;
	let s = 0;
	for (const i of idx) for (let d = 0; d < dim; d++) s += (Y[i * dim + d] - c[d]) ** 2;
	return Math.sqrt(s / idx.length);
}

/** Share of each point's k nearest input neighbours that are also among its k nearest in the map. */
export function neighbourKept(D: Float64Array, Y: ArrayLike<number>, n: number, k = 10): number {
	let hit = 0;
	for (let i = 0; i < n; i++) {
		const idx = Array.from({ length: n }, (_, j) => j).filter((j) => j !== i);
		const hi = idx
			.slice()
			.sort((a, b) => D[i * n + a] - D[i * n + b])
			.slice(0, k);
		const d2 = (j: number) => (Y[2 * i] - Y[2 * j]) ** 2 + (Y[2 * i + 1] - Y[2 * j + 1]) ** 2;
		const lo = new Set(idx.sort((a, b) => d2(a) - d2(b)).slice(0, k));
		for (const j of hi) if (lo.has(j)) hit++;
	}
	return hit / (n * k);
}
