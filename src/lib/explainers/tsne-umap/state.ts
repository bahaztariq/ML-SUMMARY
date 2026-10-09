/**
 * t-SNE & UMAP explainer state. The state holds settings plus a few live numbers the scene writes
 * back (iteration, KL); data, affinities and graphs come from memoized pure functions.
 */
import * as la from '../_dimred/linalg.ts';
import type { View3 } from '../_dimred/view3d.ts';
import * as T from './tsne.ts';

export type Method = 'tsne' | 'umap';
export type Right = 'none' | 'pca' | 'embed';

export interface TSState {
	method: Method;
	perplexity: number;
	nNeighbors: number;
	seed: number;
	/** Iterations (t-SNE) or epochs (UMAP) the scene should run to; 0 shows the random start. */
	target: number;
	/** Bumped by the Replay button to restart the same run. */
	replay: number;
	/** What the right-hand panel shows. */
	right: Right;
	view: View3;
	/** Point whose neighbourhood is highlighted (−1 = none). */
	sel: number;
	show: { neigh: boolean; sizes: boolean; graph: boolean };
	ui: { rotate: boolean; pick: boolean; perplexity: boolean; run: boolean; seed: boolean; method: boolean; neighbors: boolean };
	did: { rotate: boolean; pick: number; perps: number[]; seeds: number; methods: Method[]; neighbors: number[] };
	/** Written by the scene while the optimisation runs. */
	live: { iter: number; kl: number; ratio: number; kept: number };
}

const memo = new Map<string, unknown>();
function cached<T>(key: string, make: () => T): T {
	if (!memo.has(key)) {
		if (memo.size > 60) memo.clear();
		memo.set(key, make());
	}
	return memo.get(key) as T;
}

export const data = () => cached('data', () => T.makeClusters());
export const N = 200;
export const dist = () => cached('D', () => T.sqDist(data().X));
export const affinities = (perp: number) => cached(`P${perp}`, () => T.jointP(dist(), N, perp));
export const graph = (k: number) => cached(`G${k}`, () => T.fuzzyGraph(dist(), N, k));
export const neighbourRow = (i: number, perp: number) => cached(`row${i}|${perp}`, () => T.rowP(dist(), N, i, perp));
export const pcaMap = () => cached('pca', () => la.project(data().X, la.pca(data().X), 2).flat());
export const pcaShare = () => cached('pcaShare', () => {
	const r = la.pca(data().X).ratio;
	return r[0] + r[1];
});
export const members = (k: number) => cached(`m${k}`, () => data().y.map((c, i) => (c === k ? i : -1)).filter((i) => i >= 0));
export const inputRatio = () =>
	cached('ratioIn', () => T.spread(data().X.flat(), 3, members(T.WIDE)) / T.spread(data().X.flat(), 3, members(T.TIGHT)));

export const maxIter = (s: TSState) => (s.method === 'tsne' ? T.TSNE_ITERS : T.UMAP_EPOCHS);
export const finished = (s: TSState) => s.live.iter >= maxIter(s);
export const runKey = (s: TSState) =>
	s.method === 'tsne' ? `tsne|${s.perplexity}|${s.seed}` : `umap|${s.nNeighbors}|${s.seed}`;

/** How many of point i's neighbours hold 90% of its p(j|i). */
export function effectiveNeighbours(i: number, perp: number) {
	const p = Array.from(neighbourRow(i, perp).p).sort((a, b) => b - a);
	let acc = 0;
	let k = 0;
	while (acc < 0.9 && k < p.length) acc += p[k++];
	return k;
}

/** Map-space ratio of the wide cluster's spread to the tight one's (written into live by the scene). */
export function mapRatio(Y: ArrayLike<number>) {
	return T.spread(Y, 2, members(T.WIDE)) / T.spread(Y, 2, members(T.TIGHT));
}

export function resetLive(s: TSState) {
	s.live = { iter: 0, kl: NaN, ratio: NaN, kept: NaN };
}

export function run(s: TSState) {
	s.target = maxIter(s);
}

export function setPerplexity(s: TSState, p: number) {
	s.perplexity = p;
	if (!s.did.perps.includes(p)) s.did.perps.push(p);
}

export function setNeighbors(s: TSState, k: number) {
	s.nNeighbors = k;
	if (!s.did.neighbors.includes(k)) s.did.neighbors.push(k);
}

export function setMethod(s: TSState, m: Method) {
	s.method = m;
	if (!s.did.methods.includes(m)) s.did.methods.push(m);
	if (s.target > 0) s.target = maxIter(s);
}

export function reseed(s: TSState) {
	s.seed++;
	s.did.seeds++;
	s.target = maxIter(s);
}

export const off = { rotate: false, pick: false, perplexity: false, run: false, seed: false, method: false, neighbors: false };
export const START_VIEW: View3 = { yaw: 0.25, pitch: 0.18 };
/** A point near the middle of the wide cluster. */
export const START_SEL = 85;

export function init(): TSState {
	return {
		method: 'tsne',
		perplexity: 30,
		nNeighbors: 15,
		seed: 1,
		target: 0,
		replay: 0,
		right: 'none',
		view: { ...START_VIEW },
		sel: -1,
		show: { neigh: false, sizes: false, graph: false },
		ui: { ...off, rotate: true },
		did: { rotate: false, pick: 0, perps: [], seeds: 0, methods: [], neighbors: [] },
		live: { iter: 0, kl: NaN, ratio: NaN, kept: NaN }
	};
}
