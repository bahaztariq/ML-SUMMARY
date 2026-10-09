/**
 * Isolation Forest explainer state. Small settings only; data, isolation paths, forests and
 * score maps come from memoized pure functions.
 */
import * as F from './iforest.ts';

export interface IFState {
	dataset: F.Dataset;
	/** Point being isolated in the single-tree animation. */
	target: number;
	treeSeed: number;
	/** How many cuts of the current isolation path are shown. */
	cuts: number;
	/** Path lengths recorded over many random trees, for the outlier and the normal point. */
	history: { out: number[]; normal: number[] };
	nTrees: number;
	psi: number;
	contamination: number;
	forestSeed: number;
	/** Point inspected by clicking (−1 = none). */
	sel: number;
	show: { cuts: boolean; heat: boolean; flags: boolean; truth: boolean; history: boolean; pair: boolean };
	ui: {
		cut: boolean;
		newTree: boolean;
		grow: boolean;
		inspect: boolean;
		nTrees: boolean;
		psi: boolean;
		contamination: boolean;
		dataset: boolean;
	};
	did: { inspected: number[] };
}

const memo = new Map<string, unknown>();
function cached<T>(key: string, make: () => T): T {
	if (!memo.has(key)) {
		if (memo.size > 300) memo.clear();
		memo.set(key, make());
	}
	return memo.get(key) as T;
}

export const data = (d: F.Dataset): F.Data => cached(`data|${d}`, () => F.makeData(d));

/** The two points the lesson follows on the 'blobs' data. */
export const OUT = data('blobs').truth.indexOf(true);
export const NORMAL = (() => {
	const X = data('blobs').X;
	let best = 0;
	X.forEach((p, i) => {
		if (Math.hypot(p[0] + 0.42, p[1] - 0.3) < Math.hypot(X[best][0] + 0.42, X[best][1] - 0.3)) best = i;
	});
	return best;
})();

export const path = (s: IFState) => cached(`path|${s.dataset}|${s.target}|${s.treeSeed}`, () => F.isolate(data(s.dataset).X, s.target, s.treeSeed));
export const pathLen = (s: IFState) => path(s).length;
export const isolated = (s: IFState) => s.cuts >= pathLen(s);

export const forest = (s: IFState) =>
	cached(`forest|${s.dataset}|${s.nTrees}|${s.psi}|${s.forestSeed}`, () => F.fitForest(data(s.dataset).X, s.nTrees, s.psi, s.forestSeed));
const fkey = (s: IFState) => `${s.dataset}|${s.nTrees}|${s.psi}|${s.forestSeed}`;
export const scores = (s: IFState) => cached(`scores|${fkey(s)}`, () => data(s.dataset).X.map((p) => F.score(forest(s), p)));
export const meanPaths = (s: IFState) => cached(`paths|${fkey(s)}`, () => data(s.dataset).X.map((p) => F.meanPath(forest(s), p)));

export const GRID = { nx: 96, ny: 96, lo: -1.6, hi: 1.6 };
/** Score at the centre of every cell of a GRID.nx × GRID.ny raster (row 0 = bottom). */
export const heat = (s: IFState) =>
	cached(`heat|${fkey(s)}`, () => {
		const f = forest(s);
		const out = new Float64Array(GRID.nx * GRID.ny);
		const step = (GRID.hi - GRID.lo) / GRID.nx;
		for (let j = 0; j < GRID.ny; j++)
			for (let i = 0; i < GRID.nx; i++) out[j * GRID.nx + i] = F.score(f, [GRID.lo + (i + 0.5) * step, GRID.lo + (j + 0.5) * step]);
		return out;
	});

export const flags = (s: IFState) => cached(`flags|${fkey(s)}|${s.contamination}`, () => F.flagged(scores(s), s.contamination));

export function detection(s: IFState) {
	const { truth } = data(s.dataset);
	const { idx } = flags(s);
	let caught = 0;
	for (const i of idx) if (truth[i]) caught++;
	const planted = truth.filter(Boolean).length;
	return { flagged: idx.size, caught, planted, falseAlarms: idx.size - caught };
}

/** Indices of the tight clump in the 'clump' dataset. */
export const CLUMP = data('clump')
	.truth.map((t, i) => (t ? i : -1))
	.filter((i) => i >= 0)
	.slice(0, 25);
export const LONE = data('clump').X.length - 2;
export function clumpCaught(s: IFState) {
	if (s.dataset !== 'clump') return 0;
	const { idx } = flags(s);
	return CLUMP.filter((i) => idx.has(i)).length;
}
export const clumpScore = (s: IFState) => CLUMP.reduce((a, i) => a + scores(s)[i], 0) / CLUMP.length;
export const LOCAL = data('local')
	.truth.map((t, i) => (t ? i : -1))
	.filter((i) => i >= 0);

export const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
export const pct = (v: number, d = 0) => `${(v * 100).toFixed(d)}%`;

/* ---------------- actions ---------------- */

export function nextCut(s: IFState) {
	s.cuts = Math.min(s.cuts + 1, pathLen(s));
}

export function isolateAll(s: IFState) {
	s.cuts = pathLen(s);
}

/** A fresh random tree: record both points' path lengths in it, show the target's path. */
export function newTree(s: IFState, seed = s.treeSeed + 1) {
	s.treeSeed = seed;
	const X = data('blobs').X;
	s.history.out.push(F.isolate(X, OUT, seed).length);
	s.history.normal.push(F.isolate(X, NORMAL, seed).length);
	s.cuts = pathLen(s);
}

export function grow(s: IFState, k: number) {
	for (let i = 0; i < k; i++) newTree(s);
}

export function inspect(s: IFState, i: number) {
	s.sel = i;
	if (!s.did.inspected.includes(i)) s.did.inspected.push(i);
}

/** Fraction of planted anomalies in a dataset — the "right" contamination. */
export const trueRate = (d: F.Dataset) => data(d).truth.filter(Boolean).length / data(d).X.length;

export function setDataset(s: IFState, d: F.Dataset) {
	s.dataset = d;
	s.sel = -1;
	s.contamination = Math.round(trueRate(d) * 200) / 200;
}

export const off = {
	cut: false,
	newTree: false,
	grow: false,
	inspect: false,
	nTrees: false,
	psi: false,
	contamination: false,
	dataset: false
};
export const hidden = { cuts: false, heat: false, flags: false, truth: false, history: false, pair: false };

/** Tree seeds chosen so the first animated trees are typical (outlier: 3 cuts, normal point: 15). */
export const OUT_SEED = 5;
export const NORMAL_SEED = 5;

export function init(): IFState {
	return {
		dataset: 'blobs',
		target: OUT,
		treeSeed: OUT_SEED,
		cuts: 0,
		history: { out: [], normal: [] },
		nTrees: 100,
		psi: 256,
		contamination: 0.04,
		forestSeed: 1,
		sel: -1,
		show: { ...hidden, pair: true },
		ui: { ...off },
		did: { inspected: [] }
	};
}
