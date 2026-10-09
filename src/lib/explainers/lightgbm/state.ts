/**
 * LightGBM explainer state. Settings live in the state; binned data, trees and boosted models are
 * derived through memoized pure functions.
 */
import { mulberry32 } from '#lib/viz/canvas.ts';
import { memo } from '../_ensembles/memo.ts';
import * as b from '../_ensembles/boost.ts';
import * as l from './lgb.ts';

export type Mode = 'data' | 'hist' | 'pair' | 'model' | 'goss';

export interface LGBState {
	mode: Mode;
	maxBin: number;
	/** Feature whose histogram is shown. */
	feat: 0 | 1;
	/** Bin edge picked on the histogram (-1 = none). */
	pickBin: number;
	numLeaves: number;
	/** UNLIMITED = no depth limit (max_depth = -1). */
	maxDepth: number;
	minData: number;
	policy: 'leaf' | 'level';
	rounds: number;
	useGoss: boolean;
	top: number;
	other: number;
	gossDraw: number;
	show: { edges: boolean; compare: boolean; gains: boolean; leafCurve: boolean; loss: boolean };
	ui: { bins: boolean; feat: boolean; pickBin: boolean; leaves: boolean; depth: boolean; minData: boolean; policy: boolean; rounds: boolean; goss: boolean; redraw: boolean };
	did: { pick: boolean; redraw: number };
}

export const UNLIMITED = 9;
export const MAX_ROUNDS = 60;
export const LR = 0.1;
const SEED = 9;
export const N_TRAIN = 300;
const FLIP = 0.08;
export const LEAF_STEPS = [2, 4, 8, 16, 32, 64];
export const BIG_N = 4000;
export const GOSS_ROUNDS = 10;
export const GOSS_DRAWS = 20;

const cached = memo(500);

export const train = () => cached('train', () => l.makeData(SEED, N_TRAIN, FLIP));
export const valid = () => cached('valid', () => l.makeData(SEED + 300, 800, FLIP));
const all = () => cached('all', () => train().y.map((_, i) => i));

export const depthLimit = (d: number) => (d >= UNLIMITED ? Infinity : d);
export const depthLabel = (d: number) => (d >= UNLIMITED ? '-1 (none)' : String(d));

export const binned = (maxBin: number) => cached(`bins|${maxBin}`, () => l.binData(train().X, maxBin));
/** Every distinct value its own bin: the exact (pre-sorted) split search. */
export const exact = () => binned(100000);

/** First-round gradients: model = base rate. */
export const GH0 = () =>
	cached('gh0', () => {
		const y = train().y;
		const m = y.reduce((a, c) => a + c, 0) / y.length;
		return b.logisticGH(
			y.map(() => b.logit(m)),
			y
		);
	});

const SPLIT_OPTS = { minDataInLeaf: 5, lambda: 0 };
export const bestBinned = (maxBin: number) => cached(`bb|${maxBin}`, () => l.bestHistSplit(binned(maxBin), GH0().g, GH0().h, all(), SPLIT_OPTS)!);
export const bestExact = () => cached('be', () => l.bestHistSplit(exact(), GH0().g, GH0().h, all(), SPLIT_OPTS)!);

export const hist = (maxBin: number, f: number) => cached(`h|${maxBin}|${f}`, () => l.histogram(binned(maxBin), f, GH0().g, GH0().h, all()));
export const scanOf = (maxBin: number, f: number) => cached(`sc|${maxBin}|${f}`, () => l.scan(hist(maxBin, f), binned(maxBin).edges[f], f, 0));

/** First-round tree with the given policy and leaf budget (exact bins so only the policy differs). */
export const firstTree = (s: Pick<LGBState, 'numLeaves' | 'maxDepth' | 'minData'>, policy: 'leaf' | 'level') =>
	cached(`ft|${policy}|${s.numLeaves}|${s.maxDepth}|${s.minData}`, () =>
		l.growHist(binned(64), GH0().g, GH0().h, all(), { numLeaves: s.numLeaves, maxDepth: depthLimit(s.maxDepth), minDataInLeaf: s.minData, lambda: 0, policy })
	);

export function treeDepth(t: l.LNode): number {
	return t.left && t.right ? 1 + Math.max(treeDepth(t.left), treeDepth(t.right)) : 0;
}
export function leafCount(t: l.LNode): number {
	return t.left && t.right ? leafCount(t.left) + leafCount(t.right) : 1;
}

/* ---------------- boosted model ---------------- */

type Full = Pick<LGBState, 'maxBin' | 'numLeaves' | 'maxDepth' | 'minData' | 'policy' | 'useGoss' | 'top' | 'other'>;
const fullKey = (s: Full) => `${s.maxBin}|${s.numLeaves}|${s.maxDepth}|${s.minData}|${s.policy}|${s.useGoss ? `${s.top}|${s.other}` : 'all'}`;

export const model = (s: Full) =>
	cached(`m|${fullKey(s)}`, () =>
		l.fitLGB(train(), {
			rounds: MAX_ROUNDS,
			lr: LR,
			maxBin: s.maxBin,
			numLeaves: s.numLeaves,
			maxDepth: depthLimit(s.maxDepth),
			minDataInLeaf: s.minData,
			lambda: 0,
			policy: s.policy,
			goss: s.useGoss ? { top: s.top, other: s.other } : null,
			seed: 1
		})
	);

const loss = (s: Full, d: l.Data) =>
	l.stagedLogit(model(s), d.X).map((z) =>
		b.logLoss(
			Array.from(z, (v) => b.sigmoid(v)),
			d.y
		)
	);
export const trainLoss = (s: Full) => cached(`tl|${fullKey(s)}`, () => loss(s, train()));
export const validLoss = (s: Full) => cached(`vl|${fullKey(s)}`, () => loss(s, valid()));

/** Validation loss after MAX_ROUNDS for every num_leaves step, with no depth limit (the reference curve). */
export const leafCurve = (s: Pick<LGBState, 'minData' | 'maxBin'>) =>
	cached(`lc|${s.minData}|${s.maxBin}`, () =>
		LEAF_STEPS.map((nl) => validLoss({ maxBin: s.maxBin, numLeaves: nl, maxDepth: UNLIMITED, minData: s.minData, policy: 'leaf', useGoss: false, top: 0.2, other: 0.1 })[MAX_ROUNDS])
	);

export const GRID = { nx: 84, ny: 60, lo: -1.05, hi: 1.05 };
/** Predicted probability on a grid of cell centres after `rounds` rounds. */
export const probGrid = (s: Full & Pick<LGBState, 'rounds'>) =>
	cached(`pg|${fullKey(s)}|${s.rounds}`, () => {
		const pts: l.Pt[] = [];
		for (let iy = 0; iy < GRID.ny; iy++)
			for (let ix = 0; ix < GRID.nx; ix++)
				pts.push([GRID.lo + ((ix + 0.5) / GRID.nx) * (GRID.hi - GRID.lo), GRID.lo + ((iy + 0.5) / GRID.ny) * (GRID.hi - GRID.lo)]);
		const z = l.stagedLogit(model(s), pts, s.rounds)[s.rounds];
		return Float32Array.from(z, (v) => b.sigmoid(v));
	});

/* ---------------- GOSS on a bigger sample ---------------- */

export const big = () => cached('big', () => l.makeData(77, BIG_N, 0.04));
const bigAll = () => cached('bigAll', () => big().y.map((_, i) => i));
const bigBins = () => cached('bigBins', () => l.binData(big().X, 64));
export const bigGH = () =>
	cached('bigGH', () => {
		const m = l.fitLGB(big(), { rounds: GOSS_ROUNDS, lr: 0.3, maxBin: 64, numLeaves: 8, maxDepth: Infinity, minDataInLeaf: 20, lambda: 0, policy: 'leaf', goss: null, seed: 1 });
		return b.logisticGH(Array.from(l.stagedLogit(m, big().X)[GOSS_ROUNDS]), big().y);
	});
const BIG_OPTS = { minDataInLeaf: 20, lambda: 0 };
export const bigFull = () => cached('bigFull', () => l.bestHistSplit(bigBins(), bigGH().g, bigGH().h, bigAll(), BIG_OPTS)!);

export function gossSample(s: Pick<LGBState, 'top' | 'other'>, draw: number) {
	return cached(`gs|${s.top}|${s.other}|${draw}`, () => l.goss(bigGH().g, s.top, s.other, mulberry32(draw * 31 + 7)));
}

/** A uniform random sample of the same size (weights n/k), for comparison. */
function randomSample(k: number, draw: number) {
	return cached(`rs|${k}|${draw}`, () => {
		const rand = mulberry32(draw * 131 + 1000);
		const idx = bigAll().slice();
		for (let i = idx.length - 1; i > 0; i--) {
			const j = Math.floor(rand() * (i + 1));
			[idx[i], idx[j]] = [idx[j], idx[i]];
		}
		const rows = idx.slice(0, k).sort((a, c) => a - c);
		const w = new Array(BIG_N).fill(BIG_N / k);
		return { rows, w };
	});
}

export function gossSplit(s: Pick<LGBState, 'top' | 'other'>, draw: number) {
	const g = gossSample(s, draw);
	return l.bestHistSplit(bigBins(), bigGH().g, bigGH().h, g.rows, BIG_OPTS, g.weights);
}

export function randomSplit(s: Pick<LGBState, 'top' | 'other'>, draw: number) {
	const k = gossSample(s, draw).rows.length;
	const r = randomSample(k, draw);
	return l.bestHistSplit(bigBins(), bigGH().g, bigGH().h, r.rows, BIG_OPTS, r.w);
}

const sameSplit = (a: l.HSplit | null, c: l.HSplit) => !!a && a.f === c.f && Math.abs(a.thr - c.thr) < 0.05;

/** Over GOSS_DRAWS draws: how often each sampler finds the full-data split, and its mean gain error. */
export function samplerStats(s: Pick<LGBState, 'top' | 'other'>) {
	return cached(`ss|${s.top}|${s.other}`, () => {
		const full = bigFull();
		let gSame = 0,
			rSame = 0,
			gErr = 0,
			rErr = 0;
		for (let k = 0; k < GOSS_DRAWS; k++) {
			const gs = gossSplit(s, k);
			const rs = randomSplit(s, k);
			if (sameSplit(gs, full)) gSame++;
			if (sameSplit(rs, full)) rSame++;
			gErr += gs ? Math.abs(gs.gain - full.gain) / full.gain : 1;
			rErr += rs ? Math.abs(rs.gain - full.gain) / full.gain : 1;
		}
		return { gSame, rSame, gErr: gErr / GOSS_DRAWS, rErr: rErr / GOSS_DRAWS };
	});
}

export const featName = (f: number) => (f === 0 ? 'x₁' : 'x₂');

/* ---------------- actions ---------------- */

export const off: LGBState['ui'] = {
	bins: false,
	feat: false,
	pickBin: false,
	leaves: false,
	depth: false,
	minData: false,
	policy: false,
	rounds: false,
	goss: false,
	redraw: false
};
export const hidden: LGBState['show'] = { edges: false, compare: false, gains: false, leafCurve: false, loss: false };

export function init(): LGBState {
	return {
		mode: 'data',
		maxBin: 255,
		feat: 0,
		pickBin: -1,
		numLeaves: 8,
		maxDepth: UNLIMITED,
		minData: 5,
		policy: 'leaf',
		rounds: MAX_ROUNDS,
		useGoss: false,
		top: 0.2,
		other: 0.1,
		gossDraw: 0,
		show: { ...hidden },
		ui: { ...off },
		did: { pick: false, redraw: 0 }
	};
}
