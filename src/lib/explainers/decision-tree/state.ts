/**
 * Decision-tree explainer state and the actions both the lesson steps and the scene controls use.
 *
 * The state only holds small settings (dataset, split, max_depth, ...). Data and fitted trees are
 * derived from them through memoized pure functions, so heavy work never touches reactive proxies.
 */
import * as dt from './tree';

export type Dataset = 'noisy' | 'clean';
export type Mode = 'manual' | 'tree';

/** Slider value meaning "no depth limit". */
export const UNLIMITED = 11;

export interface TreeState {
	dataset: Dataset;
	/** Seed of the training sample (resampling shows how much a tree depends on its data). */
	seed: number;
	/** 'manual' = one draggable split at the root; 'tree' = the fitted tree. */
	mode: Mode;
	split: dt.Split;
	maxDepth: number;
	minLeaf: number;
	/** Which points to plot. */
	view: 'train' | 'test';
	show: { counts: boolean; gini: boolean; curve: boolean; best: boolean; regions: boolean; acc: boolean; depthChart: boolean };
	ui: { drag: boolean; axis: boolean; grow: boolean; depth: boolean; minLeaf: boolean; view: boolean; dataset: boolean; resample: boolean };
	did: { drag: boolean; resample: number };
}

export const DATA_SEED = 21;
/** Test accuracy the learner has to reach on the overfitting step. */
export const TARGET = 0.86;
const N_TRAIN = 150;
const N_TEST = 500;
const FLIP: Record<Dataset, number> = { noisy: 0.1, clean: 0 };

const memo = new Map<string, unknown>();
function cached<T>(key: string, make: () => T): T {
	if (!memo.has(key)) {
		if (memo.size > 400) memo.clear();
		memo.set(key, make());
	}
	return memo.get(key) as T;
}

export const train = (s: TreeState): dt.Data =>
	cached(`train|${s.dataset}|${s.seed}`, () => dt.makeData(s.seed, N_TRAIN, FLIP[s.dataset]));
export const test = (s: TreeState): dt.Data =>
	cached(`test|${s.dataset}`, () => dt.makeData(DATA_SEED + 900, N_TEST, FLIP[s.dataset]));

export const depthLimit = (d: number) => (d >= UNLIMITED ? Infinity : d);
export const depthLabel = (d: number) => (d >= UNLIMITED ? 'none' : String(d));

export function fitted(s: TreeState, maxDepth = s.maxDepth, minLeaf = s.minLeaf): dt.Node {
	return cached(`fit|${s.dataset}|${s.seed}|${maxDepth}|${minLeaf}`, () =>
		dt.fit(train(s), { maxDepth: depthLimit(maxDepth), minLeaf })
	);
}

export function accuracies(s: TreeState, maxDepth = s.maxDepth, minLeaf = s.minLeaf) {
	return cached(`acc|${s.dataset}|${s.seed}|${maxDepth}|${minLeaf}`, () => {
		const t = fitted(s, maxDepth, minLeaf);
		return { train: dt.accuracy(t, train(s)), test: dt.accuracy(t, test(s)), ...dt.stats(t) };
	});
}

/** Train/test accuracy for every max_depth slider value (the overfitting chart). */
export function depthCurve(s: TreeState) {
	return Array.from({ length: UNLIMITED + 1 }, (_, d) => accuracies(s, d));
}

export const rootCounts = (s: TreeState) => dt.countsOf(train(s).y);
export const rootGini = (s: TreeState) => dt.gini(rootCounts(s));
export const manualScore = (s: TreeState) => dt.scoreSplit(train(s), s.split);
export const rootBest = (s: TreeState) => cached(`best|${s.dataset}|${s.seed}`, () => dt.bestSplit(train(s))!);
export const rootCurve = (s: TreeState, f: dt.Feature) =>
	cached(`curve|${s.dataset}|${s.seed}|${f}`, () => dt.impurityCurve(train(s), f));

/** The tree shown in the diagram: the fitted tree, or in manual mode the root with the learner's split. */
export function shownTree(s: TreeState): dt.Node {
	if (s.mode === 'tree') return fitted(s);
	const c = rootCounts(s);
	const root: dt.Node = { id: 0, depth: 0, n: c[0] + c[1], counts: c, gini: dt.gini(c), pred: c[1] > c[0] ? 1 : 0 };
	if (!s.show.counts) return root;
	const sc = manualScore(s);
	const leaf = (id: number, k: dt.Counts): dt.Node => ({
		id,
		depth: 1,
		n: k[0] + k[1],
		counts: k,
		gini: dt.gini(k),
		pred: k[1] > k[0] ? 1 : 0
	});
	return { ...root, split: { f: s.split.f, thr: s.split.thr, gain: sc.gain }, left: leaf(1, sc.left), right: leaf(2, sc.right) };
}

export const featName = (f: dt.Feature) => (f === 0 ? 'x₁' : 'x₂');
export const rule = (sp: dt.Split) => `${featName(sp.f)} ≤ ${sp.thr.toFixed(2)}`;
export const pct = (v: number) => (Number.isFinite(v) ? `${(v * 100).toFixed(0)}%` : '—');
export const CLASS = ['A', 'B'] as const;

export function setSplit(s: TreeState, split: dt.Split) {
	s.mode = 'manual';
	s.split = { f: split.f, thr: split.thr };
}

export function setDepth(s: TreeState, d: number) {
	s.mode = 'tree';
	s.maxDepth = Math.max(0, Math.min(UNLIMITED, d));
}

/** Grow one more level (if the tree can still grow). */
export function grow(s: TreeState) {
	setDepth(s, s.maxDepth + 1);
}

export function canGrow(s: TreeState) {
	return s.maxDepth < UNLIMITED && accuracies(s).depth >= s.maxDepth;
}

export function resample(s: TreeState) {
	s.seed = s.seed === DATA_SEED ? 1 : s.seed + 1;
	if (s.seed === DATA_SEED) s.seed++;
	s.did.resample++;
}

export const off = { drag: false, axis: false, grow: false, depth: false, minLeaf: false, view: false, dataset: false, resample: false };
const hidden = { counts: false, gini: false, curve: false, best: false, regions: false, acc: false, depthChart: false };

export function init(): TreeState {
	return {
		dataset: 'noisy',
		seed: DATA_SEED,
		mode: 'manual',
		split: { f: 0, thr: 0.55 },
		maxDepth: 0,
		minLeaf: 1,
		view: 'train',
		show: { ...hidden },
		ui: { ...off },
		did: { drag: false, resample: 0 }
	};
}
