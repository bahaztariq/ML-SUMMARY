/**
 * CatBoost explainer state and derived quantities (memoized, computed on plain data).
 */
import * as dt from '../decision-tree/tree.ts';
import { memo } from '../_ensembles/memo.ts';
import * as c from './cat.ts';

export type View = 'table' | 'onehot' | 'encode' | 'ordered' | 'trees';

export interface CatState {
	view: View;
	method: 'greedy' | 'ordered';
	/** Prior strength a in (Σy + a·p)/(n + a). */
	prior: number;
	permSeed: number;
	/** Rows of the permutation encoded so far in the ordered walk-through. */
	cursor: number;
	showTest: boolean;
	depth: number;
	show: { table: boolean; formula: boolean };
	ui: { prior: boolean; method: boolean; walk: boolean; shuffle: boolean; depth: boolean; view: boolean };
	did: { walk: number; shuffle: number };
}

const SEED = 6;
export const N_TRAIN = 300;
export const N_TEST = 1000;
export const WALK = 12;
export const MAX_DEPTH = 6;

const cached = memo(300);

export const train = () => cached('train', () => c.makeChurn(SEED, N_TRAIN));
export const test = () => cached('test', () => c.makeChurn(SEED + 1000, N_TEST));
export const prior = () => cached('prior', () => c.mean(train().y));
export const counts = () => cached('counts', () => c.totals(train()));

/** Categories sorted by training frequency (most common first). */
export const byFreq = () => cached('byFreq', () => [...counts().cnt.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]));

export const perm = (s: Pick<CatState, 'permSeed'>) => cached(`perm|${s.permSeed}`, () => c.permutation(N_TRAIN, s.permSeed));

type Enc = Pick<CatState, 'method' | 'prior' | 'permSeed'>;
export const encTrain = (s: Enc) =>
	cached(`et|${s.method}|${s.prior}|${s.permSeed}`, () =>
		s.method === 'greedy' ? c.encodeGreedy(train(), s.prior) : c.encodeOrdered(train(), perm(s), s.prior)
	);
export const encTest = (s: Pick<CatState, 'prior'>) => cached(`ete|${s.prior}`, () => c.encodeTest(train(), test(), s.prior));

export const aucTrain = (s: Enc) => cached(`at|${s.method}|${s.prior}|${s.permSeed}`, () => c.auc(encTrain(s), train().y));
export const aucTest = (s: Pick<CatState, 'prior'>) => cached(`ate|${s.prior}`, () => c.auc(encTest(s), test().y));

/** Training rows whose category appears exactly once. */
export const singletons = () => cached('single', () => train().cat.filter((k) => counts().cnt.get(k) === 1).length);

/** One step of the ordered walk-through: what row `k` of the permutation sees. */
export function walkRow(s: Pick<CatState, 'permSeed' | 'prior'>, k: number) {
	const p = perm(s);
	const d = train();
	const i = p[k];
	const cat = d.cat[i];
	const before = p.slice(0, k).filter((j) => d.cat[j] === cat);
	const pos = before.filter((j) => d.y[j]).length;
	const a = s.prior;
	return { i, cat, y: d.y[i], before, pos, n: before.length, value: (pos + a * prior()) / (before.length + a) };
}

/* ---------------- symmetric trees ---------------- */

export const treeTrain = () => cached('tt', () => dt.makeData(21, 200, 0.05));
export const treeTest = () => cached('tte', () => dt.makeData(921, 600, 0.05));
export const oblivious = (depth: number) => cached(`ob|${depth}`, () => c.fitOblivious(treeTrain().X, treeTrain().y, depth));
export const cart = (depth: number) => cached(`cart|${depth}`, () => dt.fit(treeTrain(), { maxDepth: depth }));

const acc = (pred: (p: dt.Pt) => number, d: dt.Data) => d.X.filter((p, i) => pred(p) === d.y[i]).length / d.y.length;
export const oblAcc = (depth: number) =>
	cached(`oa|${depth}`, () => ({
		train: acc((p) => c.predictOblivious(oblivious(depth), p), treeTrain()),
		test: acc((p) => c.predictOblivious(oblivious(depth), p), treeTest())
	}));
export const cartStats = (depth: number) =>
	cached(`cs|${depth}`, () => {
		const t = cart(depth);
		let rules = 0;
		const walk = (n: dt.Node) => {
			if (n.split && n.left && n.right) {
				rules++;
				walk(n.left);
				walk(n.right);
			}
		};
		walk(t);
		return { rules, leaves: dt.stats(t).leaves, test: dt.accuracy(t, treeTest()) };
	});

/* ---------------- actions ---------------- */

export function walkStep(s: CatState, k = 1) {
	s.cursor = Math.min(WALK, s.cursor + k);
	s.did.walk += k;
}

export function shuffle(s: CatState) {
	s.permSeed++;
	s.cursor = 0;
	s.did.shuffle++;
}

export const off: CatState['ui'] = { prior: false, method: false, walk: false, shuffle: false, depth: false, view: false };

export function init(): CatState {
	return {
		view: 'table',
		method: 'greedy',
		prior: 0,
		permSeed: 1,
		cursor: 0,
		showTest: false,
		depth: 2,
		show: { table: false, formula: false },
		ui: { ...off },
		did: { walk: 0, shuffle: 0 }
	};
}
