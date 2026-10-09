/**
 * XGBoost explainer state. Most steps zoom in on one boosting round: the model after HISTORY
 * earlier rounds is fixed, and we look at how XGBoost builds the next tree from the rows'
 * gradients and hessians. The last steps run the whole booster.
 */
import { memo } from '../_ensembles/memo.ts';
import * as b from '../_ensembles/boost.ts';
import * as x from './xgb.ts';

export interface XGBState {
	/** 'round' = inspect one round; 'full' = whole booster over many rounds. */
	mode: 'round' | 'full';
	/** Candidate threshold on x₁ for the root split. */
	thr: number;
	lambda: number;
	gamma: number;
	/** Depth of the inspected tree in the γ step (0 = just the root split). */
	treeDepth: number;
	/** Row picked for the g/h readout. */
	picked: number;
	/* booster settings */
	rounds: number;
	lr: number;
	maxDepth: number;
	subsample: number;
	/** Columns each tree may use, out of 3 (colsample_bytree = colsample / 3). */
	colsample: number;
	/** Which tree's row/column sample is shown in the sampling step. */
	sampleTree: number;
	show: {
		grad: boolean;
		hess: boolean;
		split: boolean;
		weights: boolean;
		formula: boolean;
		curve: boolean;
		tree: boolean;
		missing: boolean;
		sample: boolean;
		loss: boolean;
	};
	ui: { drag: boolean; pick: boolean; lambda: boolean; gamma: boolean; rounds: boolean; lr: boolean; depth: boolean; subsample: boolean; colsample: boolean; resample: boolean };
	did: { pick: boolean; drag: boolean; resample: number };
}

export const HISTORY = 3;
const HISTORY_OPTS: x.XGBOpts = { rounds: HISTORY, lr: 0.3, maxDepth: 2, lambda: 1, gamma: 0, minChildWeight: 1, subsample: 1, colsample: 1, features: [0], seed: 1 };
export const MIN_CHILD_WEIGHT = 1;
export const MAX_ROUNDS = 100;
const SEED = 8;
export const N_TRAIN = 90;

const cached = memo(400);

export const train = () => cached('train', () => x.makeData(SEED, N_TRAIN));
export const valid = () => cached('valid', () => x.makeData(SEED + 500, 600));
const all = () => cached('idx', () => train().y.map((_, i) => i));
export const missingRows = () => cached('miss', () => all().filter((i) => Number.isNaN(train().X[i][0])));

/* ---------------- one round under the microscope ---------------- */

const history = () => cached('hist', () => x.fitXGB(train(), HISTORY_OPTS));
/** Current log-odds of every training row (after HISTORY rounds). */
export const F = () => cached('F', () => Array.from(x.stagedLogit(history(), train().X)[HISTORY]));
export const P = () => cached('P', () => F().map(b.sigmoid));
export const GH = () => cached('GH', () => b.logisticGH(F(), train().y));

/** Current probability curve p(x₁) for present x₁ (and the value for missing x₁). */
export const CURVE_X = Array.from({ length: 201 }, (_, i) => x.X_MIN + ((x.X_MAX - x.X_MIN) * i) / 200);
export const curveP = () => cached('curveP', () => CURVE_X.map((v) => b.sigmoid(x.stagedLogit(history(), [[v, 0, 0]])[HISTORY][0])));
export const missingP = () => cached('missP', () => b.sigmoid(x.stagedLogit(history(), [[NaN, 0, 0]])[HISTORY][0]));

export const totals = () => cached('tot', () => b.sums(GH().g, GH().h, all()));

/** The root split at the learner's threshold. */
export const split = (s: Pick<XGBState, 'thr' | 'lambda'>) => {
	const { g, h } = GH();
	return b.evalSplit(train().X, g, h, all(), 0, s.thr, s.lambda);
};

/** Every root threshold on x₁ with its gain. */
export const curve = (s: Pick<XGBState, 'lambda'>) => cached(`curve|${s.lambda}`, () => b.candidates(train().X, GH().g, GH().h, all(), 0, s.lambda));

export const bestRoot = (s: Pick<XGBState, 'lambda'>) => curve(s).reduce((a, c) => (c.gain > a.gain ? c : a));

/** The full next tree (x₁ only), grown to `treeDepth` levels and pruned with γ. */
export const roundTree = (s: Pick<XGBState, 'lambda' | 'gamma' | 'treeDepth'>) =>
	cached(`rt|${s.lambda}|${s.gamma}|${s.treeDepth}`, () =>
		b.growTree(train().X, GH().g, GH().h, all(), { maxDepth: s.treeDepth, lambda: s.lambda, gamma: s.gamma, minChildWeight: MIN_CHILD_WEIGHT, features: [0] })
	);

/** Leaf intervals of a tree that only splits on x₁, plus the leaf missing values fall into. */
export function intervals(t: b.BNode) {
	const out: { x0: number; x1: number; leaf: b.BNode }[] = [];
	const walk = (n: b.BNode, lo: number, hi: number) => {
		if (!n.split || !n.left || !n.right) {
			out.push({ x0: lo, x1: hi, leaf: n });
			return;
		}
		walk(n.left, lo, Math.min(hi, n.split.thr));
		walk(n.right, Math.max(lo, n.split.thr), hi);
	};
	walk(t, x.X_MIN, x.X_MAX);
	return { parts: out.filter((p) => p.x1 > p.x0), missing: b.leafOf(t, [NaN, 0, 0]) };
}

/** Plain gradient boosting's leaf value for the same rows: the mean pseudo-residual −G/n. */
export const gbmWeight = (G: number, n: number) => (n ? -G / n : 0);

/* ---------------- sampling ---------------- */

export function sampleOf(s: Pick<XGBState, 'subsample' | 'colsample' | 'sampleTree'>) {
	return x.treeSample(N_TRAIN, { subsample: s.subsample, colsample: s.colsample / 3, features: [0, 1, 2], seed: 3 }, s.sampleTree);
}

/** Best root split per feature on the sampled rows (null for features the tree may not use). */
export function sampleSplits(s: Pick<XGBState, 'subsample' | 'colsample' | 'sampleTree' | 'lambda'>) {
	const { rows, cols } = sampleOf(s);
	const { g, h } = GH();
	return [0, 1, 2].map((f) => {
		if (!cols.includes(f)) return null;
		const c = b.candidates(train().X, g, h, rows, f, s.lambda).filter((q) => q.HL >= MIN_CHILD_WEIGHT && q.HR >= MIN_CHILD_WEIGHT);
		return c.length ? c.reduce((a, q) => (q.gain > a.gain ? q : a)) : null;
	});
}

/* ---------------- the whole booster (x₁ only, so it can be drawn as a curve) ---------------- */

type Full = Pick<XGBState, 'lr' | 'maxDepth' | 'lambda' | 'gamma' | 'subsample'>;
const fullKey = (s: Full) => `${s.lr}|${s.maxDepth}|${s.lambda}|${s.gamma}|${s.subsample}`;

export const model = (s: Full) =>
	cached(`model|${fullKey(s)}`, () =>
		x.fitXGB(train(), {
			rounds: MAX_ROUNDS,
			lr: s.lr,
			maxDepth: s.maxDepth,
			lambda: s.lambda,
			gamma: s.gamma,
			minChildWeight: MIN_CHILD_WEIGHT,
			subsample: s.subsample,
			colsample: 1,
			features: [0],
			seed: 11
		})
	);

const losses = (s: Full, d: x.XData) =>
	x.stagedLogit(model(s), d.X).map((f) =>
		b.logLoss(
			Array.from(f, (v) => b.sigmoid(v)),
			d.y
		)
	);
export const trainLoss = (s: Full) => cached(`tl|${fullKey(s)}`, () => losses(s, train()));
export const validLoss = (s: Full) => cached(`vl|${fullKey(s)}`, () => losses(s, valid()));
export const fullCurve = (s: Full & Pick<XGBState, 'rounds'>) =>
	cached(`fc|${fullKey(s)}|${s.rounds}`, () => {
		const m = model(s);
		const pts = [...CURVE_X.map((v) => [v, 0, 0]), [NaN, 0, 0]];
		const z = x.stagedLogit(m, pts, s.rounds)[s.rounds];
		return { p: Array.from(z.slice(0, CURVE_X.length), b.sigmoid), missing: b.sigmoid(z[CURVE_X.length]) };
	});

export function bestRound(s: Full) {
	const v = validLoss(s);
	let k = 0;
	for (let i = 1; i < v.length; i++) if (v[i] < v[k]) k = i;
	return k;
}

/* ---------------- actions ---------------- */

export function setThr(s: XGBState, v: number) {
	s.thr = Math.round(Math.min(x.X_MAX - 0.05, Math.max(x.X_MIN + 0.05, v)) * 20) / 20;
	s.did.drag = true;
}

export function resampleTree(s: XGBState) {
	s.sampleTree++;
	s.did.resample++;
}

export const off: XGBState['ui'] = {
	drag: false,
	pick: false,
	lambda: false,
	gamma: false,
	rounds: false,
	lr: false,
	depth: false,
	subsample: false,
	colsample: false,
	resample: false
};
export const hidden: XGBState['show'] = {
	grad: false,
	hess: false,
	split: false,
	weights: false,
	formula: false,
	curve: false,
	tree: false,
	missing: false,
	sample: false,
	loss: false
};

export function init(): XGBState {
	return {
		mode: 'round',
		thr: 6.5,
		lambda: 1,
		gamma: 0,
		treeDepth: 1,
		picked: -1,
		rounds: 20,
		lr: 0.3,
		maxDepth: 3,
		subsample: 1,
		colsample: 3,
		sampleTree: 0,
		show: { ...hidden },
		ui: { ...off },
		did: { pick: false, drag: false, resample: 0 }
	};
}
