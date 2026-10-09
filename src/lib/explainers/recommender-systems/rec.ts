/**
 * Pure recommender helpers: user-based collaborative filtering with (mean-centred) cosine
 * similarity, matrix factorisation trained by SGD, and a content-based scorer.
 */
import { gaussian, mulberry32 } from '#lib/viz/canvas.ts';

/** users × items; null = not rated. */
export type Ratings = (number | null)[][];

export const has = (v: number | null | undefined): v is number => v !== null && v !== undefined;

export function userMean(r: Ratings, u: number): number {
	const vals = r[u].filter(has);
	return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : NaN;
}

export function globalMean(r: Ratings): number {
	const vals = r.flat().filter(has);
	return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 3;
}

/**
 * Cosine similarity of two users' mean-centred ratings over the items both rated.
 * Centring turns "4 stars from a generous rater" and "4 stars from a harsh one" into likes vs. dislikes.
 * NaN when they share no items or either user has no spread on them.
 */
export function similarity(r: Ratings, u: number, v: number): { sim: number; shared: number } {
	const mu = userMean(r, u);
	const mv = userMean(r, v);
	let dot = 0;
	let nu = 0;
	let nv = 0;
	let shared = 0;
	r[u].forEach((a, i) => {
		const b = r[v][i];
		if (!has(a) || !has(b)) return;
		shared++;
		dot += (a - mu) * (b - mv);
		nu += (a - mu) ** 2;
		nv += (b - mv) ** 2;
	});
	if (!shared || nu < 1e-12 || nv < 1e-12) return { sim: NaN, shared };
	return { sim: dot / Math.sqrt(nu * nv), shared };
}

export interface Neighbour {
	v: number;
	sim: number;
	rating: number;
	/** The neighbour's rating relative to their own average. */
	dev: number;
}

/**
 * User-based CF: r̂_ui = mean_u + Σ sim(u,v)·(r_vi − mean_v) / Σ|sim(u,v)|
 * over the k most similar users (positive similarity) who rated item i.
 */
export function cfPredict(r: Ratings, u: number, i: number, k = 2): { pred: number; mean: number; neighbours: Neighbour[] } {
	const mean = userMean(r, u);
	const cands: Neighbour[] = [];
	r.forEach((row, v) => {
		if (v === u || !has(row[i])) return;
		const { sim } = similarity(r, u, v);
		if (!(sim > 0)) return;
		cands.push({ v, sim, rating: row[i] as number, dev: (row[i] as number) - userMean(r, v) });
	});
	cands.sort((a, b) => b.sim - a.sim || a.v - b.v);
	const neighbours = cands.slice(0, k);
	if (!neighbours.length || !Number.isFinite(mean)) return { pred: NaN, mean, neighbours };
	const num = neighbours.reduce((s, n) => s + n.sim * n.dev, 0);
	const den = neighbours.reduce((s, n) => s + Math.abs(n.sim), 0);
	return { pred: clampRating(mean + num / den), mean, neighbours };
}

export const clampRating = (v: number) => Math.max(1, Math.min(5, v));

/* ------------------------------------------------------------------ matrix factorisation */

export interface MFOpts {
	k: number;
	lr: number;
	lambda: number;
	epochs: number;
	seed: number;
	/** Keep a snapshot every this many epochs (always keeps epoch 0 and the last). */
	every: number;
}

export interface MFModel {
	epoch: number;
	mu: number;
	bu: number[];
	bi: number[];
	P: number[][];
	Q: number[][];
	/** RMSE on the observed ratings. */
	rmse: number;
}

export function mfPredict(m: MFModel, u: number, i: number): number {
	let v = m.mu + m.bu[u] + m.bi[i];
	for (let f = 0; f < m.P[u].length; f++) v += m.P[u][f] * m.Q[i][f];
	return v;
}

export function mfRmse(r: Ratings, m: MFModel): number {
	let s = 0;
	let n = 0;
	r.forEach((row, u) =>
		row.forEach((v, i) => {
			if (!has(v)) return;
			s += (v - mfPredict(m, u, i)) ** 2;
			n++;
		})
	);
	return n ? Math.sqrt(s / n) : 0;
}

const copy = (m: Omit<MFModel, 'rmse'>, r: Ratings): MFModel => {
	const c = { ...m, bu: m.bu.slice(), bi: m.bi.slice(), P: m.P.map((p) => p.slice()), Q: m.Q.map((q) => q.slice()), rmse: 0 };
	c.rmse = mfRmse(r, c);
	return c;
};

/**
 * r̂_ui = μ + b_u + b_i + p_u·q_i, trained by SGD on observed cells only with an L2 penalty λ.
 * Returns snapshots so the training can be replayed.
 */
export function trainMF(r: Ratings, o: MFOpts): MFModel[] {
	const rand = mulberry32(o.seed);
	const g = gaussian(rand);
	const nu = r.length;
	const ni = r[0]?.length ?? 0;
	const m = {
		epoch: 0,
		mu: globalMean(r),
		bu: new Array(nu).fill(0),
		bi: new Array(ni).fill(0),
		P: Array.from({ length: nu }, () => Array.from({ length: o.k }, () => 0.3 * g())),
		Q: Array.from({ length: ni }, () => Array.from({ length: o.k }, () => 0.3 * g()))
	};
	const obs: [number, number, number][] = [];
	r.forEach((row, u) => row.forEach((v, i) => has(v) && obs.push([u, i, v])));
	const snaps = [copy(m, r)];
	for (let ep = 1; ep <= o.epochs; ep++) {
		for (let a = obs.length - 1; a > 0; a--) {
			const b = Math.floor(rand() * (a + 1));
			[obs[a], obs[b]] = [obs[b], obs[a]];
		}
		for (const [u, i, v] of obs) {
			const e = v - mfPredict(m as MFModel, u, i);
			m.bu[u] += o.lr * (e - o.lambda * m.bu[u]);
			m.bi[i] += o.lr * (e - o.lambda * m.bi[i]);
			for (let f = 0; f < o.k; f++) {
				const pu = m.P[u][f];
				const qi = m.Q[i][f];
				m.P[u][f] += o.lr * (e * qi - o.lambda * pu);
				m.Q[i][f] += o.lr * (e * pu - o.lambda * qi);
			}
		}
		m.epoch = ep;
		if (ep % o.every === 0 || ep === o.epochs) snaps.push(copy(m, r));
	}
	return snaps;
}

/* ------------------------------------------------------------------ content-based */

/** Taste profile: the user's rating deviations times each item's tags, summed. */
export function profile(r: Ratings, feats: number[][], u: number): number[] {
	const mean = userMean(r, u);
	const p = new Array(feats[0].length).fill(0);
	r[u].forEach((v, i) => {
		if (!has(v) || !feats[i]) return;
		feats[i].forEach((f, j) => (p[j] += (v - mean) * f));
	});
	return p;
}

export function cosine(a: number[], b: number[]): number {
	const d = a.reduce((s, v, i) => s + v * b[i], 0);
	const na = Math.hypot(...a);
	const nb = Math.hypot(...b);
	return na < 1e-12 || nb < 1e-12 ? NaN : d / (na * nb);
}

/** Content score in [−1, 1]: how well an item's tags match the user's profile. */
export function contentScore(r: Ratings, feats: number[][], u: number, item: number): number {
	return cosine(profile(r, feats, u), feats[item]);
}
