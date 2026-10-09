/**
 * Random forest explainer state and the actions the lesson steps and scene controls share.
 * The state only holds settings; data, trees and votes are derived through memoized pure functions
 * and the forest grows lazily (tree t only depends on trees 0..t−1 through the shared RNG).
 */
import { mulberry32 } from '#lib/viz/canvas.ts';
import * as dt from '../decision-tree/tree.ts';
import { memo } from '../_ensembles/memo.ts';
import * as rf from './forest.ts';

export type Mode = 'single' | 'tree' | 'gallery' | 'forest' | 'compare';

export interface RFState {
	mode: Mode;
	/** Seed of the training sample. */
	seed: number;
	nTrees: number;
	maxFeatures: 1 | 2;
	bootstrap: boolean;
	/** UNLIMITED = no depth limit. */
	maxDepth: number;
	/** Tree being inspected in 'tree' mode. */
	focus: number;
	view: 'train' | 'test';
	/** The accuracy-vs-trees chart is drawn up to this many trees. */
	curveTo: number;
	/** Training row picked for the out-of-bag readout (-1 = none). */
	picked: number;
	/** Seed before the last resample (for "how much changed"). */
	prevSeed: number;
	show: { bag: boolean; oob: boolean; curve: boolean; oobCurve: boolean; corr: boolean };
	ui: { browse: boolean; maxFeatures: boolean; nTrees: boolean; bootstrap: boolean; depth: boolean; view: boolean; resample: boolean; pick: boolean };
	did: { browse: number; resample: number; pick: boolean };
}

export const DATA_SEED = 33;
const FOREST_SEED = 5;
export const N_TRAIN = 200;
const N_TEST = 600;
const FLIP = 0.12;
export const MAX_TREES = 200;
export const COMPARE_TREES = 100;
export const UNLIMITED = 12;
export const GALLERY = 6;

const cached = memo(800);

export const train = (s: Pick<RFState, 'seed'>) => cached(`train|${s.seed}`, () => rf.makeData(s.seed, N_TRAIN, FLIP));
export const test = () => cached('test', () => rf.makeData(DATA_SEED + 977, N_TEST, FLIP));

export const depthLimit = (d: number) => (d >= UNLIMITED ? Infinity : d);
export const depthLabel = (d: number) => (d >= UNLIMITED ? 'none' : String(d));

type Settings = Pick<RFState, 'seed' | 'maxFeatures' | 'bootstrap' | 'maxDepth'>;
const key = (s: Settings) => `${s.seed}|${s.maxFeatures}|${s.bootstrap}|${s.maxDepth}`;

interface Grower {
	rand: () => number;
	trees: dt.Node[];
	inBag: number[][];
}

/** The forest's first B trees (grown on demand and kept). */
export function forest(s: Settings, B: number): Grower {
	const g = cached<Grower>(`forest|${key(s)}`, () => ({ rand: mulberry32(FOREST_SEED), trees: [], inBag: [] }));
	if (g.trees.length >= B) return g;
	const data = train(s);
	const n = data.y.length;
	const all = Array.from({ length: n }, (_, i) => i);
	while (g.trees.length < B) {
		const idx = s.bootstrap ? rf.bootstrap(n, g.rand) : all;
		g.inBag.push(rf.multiplicity(n, idx));
		g.trees.push(rf.fitTree(data, idx, { maxFeatures: s.maxFeatures, maxDepth: depthLimit(s.maxDepth) }, g.rand));
	}
	return g;
}

export const tree = (s: Settings, t: number) => forest(s, t + 1).trees[t];
export const inBag = (s: Settings, t: number) => forest(s, t + 1).inBag[t];

/** A single CART tree on the full training set (no bootstrap, all features). */
export const single = (s: Pick<RFState, 'seed' | 'maxDepth'>) =>
	cached(`single|${s.seed}|${s.maxDepth}`, () => dt.fit(train(s), { maxDepth: depthLimit(s.maxDepth) }));

export const singleAcc = (s: Pick<RFState, 'seed' | 'maxDepth'>) =>
	cached(`singleAcc|${s.seed}|${s.maxDepth}`, () => ({ train: dt.accuracy(single(s), train(s)), test: dt.accuracy(single(s), test()) }));

/** Tree t's predictions on the test set. */
const treeTest = (s: Settings, t: number) =>
	cached(`tt|${key(s)}|${t}`, () => {
		const node = tree(s, t);
		return Uint8Array.from(test().X, (p) => dt.predict(node, p));
	});

export const treeAcc = (s: Settings, t: number) => rf.accuracyOf(Array.from(treeTest(s, t)), test().y);

/** Test accuracy of the forest after 1..B trees (index b-1). */
export function testCurve(s: Settings, B: number): number[] {
	return cached(`tc|${key(s)}|${B}`, () => {
		const y = test().y;
		const votes = new Array(y.length).fill(0);
		const out: number[] = [];
		for (let t = 0; t < B; t++) {
			const p = treeTest(s, t);
			let ok = 0;
			for (let i = 0; i < y.length; i++) {
				votes[i] += p[i];
				if (rf.vote(votes[i] / (t + 1)) === y[i]) ok++;
			}
			out.push(ok / y.length);
		}
		return out;
	});
}

export const forestAcc = (s: Settings, B: number) => testCurve(s, B)[B - 1];

/** Out-of-bag accuracy after 1..B trees. */
export function oobCurve(s: Settings, B: number): number[] {
	return cached(`oc|${key(s)}|${B}`, () => {
		const data = train(s);
		const f = forest(s, B);
		const n = data.y.length;
		const votes = new Array(n).fill(0);
		const counts = new Array(n).fill(0);
		const out: number[] = [];
		for (let t = 0; t < B; t++) {
			data.X.forEach((p, i) => {
				if (f.inBag[t][i]) return;
				votes[i] += dt.predict(f.trees[t], p);
				counts[i]++;
			});
			let ok = 0;
			let k = 0;
			for (let i = 0; i < n; i++) {
				if (!counts[i]) continue;
				k++;
				if (rf.vote(votes[i] / counts[i]) === data.y[i]) ok++;
			}
			out.push(k ? ok / k : NaN);
		}
		return out;
	});
}

/** Out-of-bag vote for one training row using the first B trees. */
export function oobVote(s: Settings, B: number, i: number) {
	const f = forest(s, B);
	const p = train(s).X[i];
	let out = 0;
	let b = 0;
	for (let t = 0; t < B; t++) {
		if (f.inBag[t][i]) continue;
		out++;
		b += dt.predict(f.trees[t], p);
	}
	return { out, a: out - b, b, pred: out ? rf.vote(b / out) : -1 };
}

/** Mean pairwise correlation of the first 25 trees' test predictions. */
export const correlation = (s: Settings) =>
	cached(`rho|${key(s)}`, () => rf.meanCorrelation(Array.from({ length: 25 }, (_, t) => Array.from(treeTest(s, t)))));

/** Average single-tree test accuracy over the first 25 trees. */
export const meanTreeAcc = (s: Settings) =>
	cached(`mta|${key(s)}`, () => Array.from({ length: 25 }, (_, t) => treeAcc(s, t)).reduce((a, b) => a + b, 0) / 25);

/** Fraction of test points on which two trees in the first `k` disagree with the forest's majority. */
export function disagreement(s: Settings, k: number) {
	return cached(`dis|${key(s)}|${k}`, () => {
		const y = test().y;
		let split = 0;
		for (let i = 0; i < y.length; i++) {
			let v = 0;
			for (let t = 0; t < k; t++) v += treeTest(s, t)[i];
			if (v > 0 && v < k) split++;
		}
		return split / y.length;
	});
}

/* ---------------- grids for drawing vote shares ---------------- */

export const GRID = { x0: -2, x1: 2, y0: -1.12, y1: 1.12, nx: 128, ny: 72 };
const cellCenter = (ix: number, iy: number): dt.Pt => [
	GRID.x0 + ((ix + 0.5) / GRID.nx) * (GRID.x1 - GRID.x0),
	GRID.y0 + ((iy + 0.5) / GRID.ny) * (GRID.y1 - GRID.y0)
];

/** Rasterise a tree's class-1 leaf boxes onto the grid (much cheaper than predicting every cell). */
function gridOf(node: dt.Node) {
	const out = new Uint8Array(GRID.nx * GRID.ny);
	const cw = (GRID.x1 - GRID.x0) / GRID.nx;
	const ch = (GRID.y1 - GRID.y0) / GRID.ny;
	// cell (ix, iy) belongs to a box when its centre does: x0 < cx <= x1 (splits send x <= thr left)
	const first = (lo: number, o: number, step: number) => Math.max(0, Math.floor((lo - o) / step - 0.5) + 1);
	const last = (hi: number, o: number, step: number, n: number) => Math.min(n - 1, Math.floor((hi - o) / step - 0.5));
	const fill = (n: dt.Node, x0: number, x1: number, y0: number, y1: number) => {
		if (n.split && n.left && n.right) {
			const { f, thr } = n.split;
			if (f === 0) {
				fill(n.left, x0, Math.min(x1, thr), y0, y1);
				fill(n.right, Math.max(x0, thr), x1, y0, y1);
			} else {
				fill(n.left, x0, x1, y0, Math.min(y1, thr));
				fill(n.right, x0, x1, Math.max(y0, thr), y1);
			}
			return;
		}
		if (!n.pred) return;
		const ia = first(x0, GRID.x0, cw);
		const ib = last(x1, GRID.x0, cw, GRID.nx);
		const ja = first(y0, GRID.y0, ch);
		const jb = last(y1, GRID.y0, ch, GRID.ny);
		if (ib < ia) return;
		for (let iy = ja; iy <= jb; iy++) out.fill(1, iy * GRID.nx + ia, iy * GRID.nx + ib + 1);
	};
	fill(node, -Infinity, Infinity, -Infinity, Infinity);
	return out;
}

/** Reference implementation used by the tests. */
export function gridOfSlow(node: dt.Node) {
	const out = new Uint8Array(GRID.nx * GRID.ny);
	for (let iy = 0; iy < GRID.ny; iy++) for (let ix = 0; ix < GRID.nx; ix++) out[iy * GRID.nx + ix] = dt.predict(node, cellCenter(ix, iy));
	return out;
}
export { gridOf };

const treeGrid = (s: Settings, t: number) => cached(`tg|${key(s)}|${t}`, () => gridOf(tree(s, t)));
export const singleGrid = (s: Pick<RFState, 'seed' | 'maxDepth'>) => cached(`sg|${s.seed}|${s.maxDepth}`, () => gridOf(single(s)));

/** Share of the first B trees voting class 1 in each grid cell. */
export function voteGrid(s: Settings, B: number): Float32Array {
	return cached(`vg|${key(s)}|${B}`, () => {
		const out = new Float32Array(GRID.nx * GRID.ny);
		for (let t = 0; t < B; t++) {
			const g = treeGrid(s, t);
			for (let i = 0; i < out.length; i++) out[i] += g[i];
		}
		for (let i = 0; i < out.length; i++) out[i] /= B;
		return out;
	});
}

/** Fraction of grid cells whose predicted class differs between two training samples. */
export function changed(s: RFState) {
	if (s.prevSeed === s.seed) return null;
	const a = { seed: s.prevSeed, maxFeatures: s.maxFeatures, bootstrap: s.bootstrap, maxDepth: s.maxDepth };
	// only count cells inside the data's square, where there are training points
	const diff = (p: ArrayLike<number>, q: ArrayLike<number>) => {
		let d = 0;
		let k = 0;
		for (let iy = 0; iy < GRID.ny; iy++)
			for (let ix = 0; ix < GRID.nx; ix++) {
				const [x, y] = cellCenter(ix, iy);
				if (Math.abs(x) > 0.95 || Math.abs(y) > 0.95) continue;
				k++;
				const i = iy * GRID.nx + ix;
				if (rf.vote(p[i]) !== rf.vote(q[i])) d++;
			}
		return d / k;
	};
	return {
		single: diff(singleGrid(a), singleGrid(s)),
		forest: diff(voteGrid(a, COMPARE_TREES), voteGrid(s, COMPARE_TREES))
	};
}

/* ---------------- bootstrap facts for the focused tree ---------------- */

export function bagStats(s: RFState, t = s.focus) {
	const m = inBag(s, t);
	let unique = 0,
		twice = 0,
		out = 0;
	for (const k of m) {
		if (k > 0) unique++;
		if (k > 1) twice++;
		if (k === 0) out++;
	}
	return { unique, twice, out, n: m.length };
}

/* ---------------- actions ---------------- */

export function resample(s: RFState) {
	s.prevSeed = s.seed;
	s.seed = s.seed + 1 === DATA_SEED + 977 ? s.seed + 2 : s.seed + 1;
	s.did.resample++;
	s.picked = -1;
}

export function browse(s: RFState, d: number) {
	s.focus = (s.focus + d + MAX_TREES) % MAX_TREES;
	s.did.browse++;
}

export function setTrees(s: RFState, n: number) {
	s.nTrees = Math.max(1, Math.min(MAX_TREES, Math.round(n)));
	if (s.curveTo < s.nTrees) s.curveTo = s.nTrees;
}

export const featLabel = (m: 1 | 2) => (m === 2 ? 'all (2)' : "1 ('sqrt')");

export const off: RFState['ui'] = {
	browse: false,
	maxFeatures: false,
	nTrees: false,
	bootstrap: false,
	depth: false,
	view: false,
	resample: false,
	pick: false
};
export const hidden: RFState['show'] = { bag: false, oob: false, curve: false, oobCurve: false, corr: false };

export function init(): RFState {
	return {
		mode: 'single',
		seed: DATA_SEED,
		nTrees: 1,
		maxFeatures: 1,
		bootstrap: true,
		maxDepth: UNLIMITED,
		focus: 0,
		view: 'train',
		curveTo: 1,
		picked: -1,
		prevSeed: DATA_SEED,
		show: { ...hidden },
		ui: { ...off },
		did: { browse: 0, resample: 0, pick: false }
	};
}
