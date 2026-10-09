/**
 * Gradient boosting explainer state and shared actions. Boosted models are fitted on plain data and
 * memoized by (learning rate, depth); the state only holds settings and the current stage.
 */
import * as dt from '../decision-tree/tree.ts';
import { memo } from '../_ensembles/memo.ts';
import { growTree, squaredGH } from '../_ensembles/boost.ts';
import * as gb from './gb.ts';

export interface GBState {
	view: 'boost' | 'ada';
	/** Trees in the ensemble so far. */
	stage: number;
	lr: number;
	depth: number;
	/** Learning rate of the dashed comparison curve (0 = none). */
	lrRef: number;
	/** AdaBoost rounds done. */
	round: number;
	show: { residuals: boolean; resPanel: boolean; next: boolean; leafValues: boolean; loss: boolean; valid: boolean; best: boolean };
	ui: { add: boolean; stage: boolean; lr: boolean; depth: boolean; valid: boolean; stop: boolean; ada: boolean };
	did: { add: number; ada: number };
}

export const MAX_STAGES = 300;
export const DEFAULT_LR = 0.1;
export const DEFAULT_DEPTH = 2;
export const MIN_LEAF = 2;
export const ADA_ROUNDS = 30;

const SEED = 4;
const N_TRAIN = 40;
const NOISE = 0.5;

const cached = memo(300);

export const train = () => cached('train', () => gb.makeData(SEED, N_TRAIN, NOISE));
export const valid = () => cached('valid', () => gb.makeData(SEED + 100, 300, NOISE));
/** x positions where the ensemble curve is drawn. */
export const GRID_X = Array.from({ length: 241 }, (_, i) => gb.X_MIN + ((gb.X_MAX - gb.X_MIN) * i) / 240);

type Settings = Pick<GBState, 'lr' | 'depth'>;
const key = (s: Settings) => `${s.lr}|${s.depth}`;

export const booster = (s: Settings) =>
	cached(`boost|${key(s)}`, () => gb.boost(train(), { rounds: MAX_STAGES, lr: s.lr, maxDepth: s.depth, minLeaf: MIN_LEAF }));

const stagedTrain = (s: Settings) => cached(`st|${key(s)}`, () => gb.staged(booster(s), train().x));
const stagedValid = (s: Settings) => cached(`sv|${key(s)}`, () => gb.staged(booster(s), valid().x));
const stagedGrid = (s: Settings) => cached(`sg|${key(s)}`, () => gb.staged(booster(s), GRID_X));

/** Ensemble prediction at the training points / on the drawing grid after `m` stages. */
export const predTrain = (s: Settings, m: number) => stagedTrain(s)[m];
export const curve = (s: Settings, m: number) => stagedGrid(s)[m];

export const trainLoss = (s: Settings) => cached(`tl|${key(s)}`, () => stagedTrain(s).map((p) => gb.mse(p, train().y)));
export const validLoss = (s: Settings) => cached(`vl|${key(s)}`, () => stagedValid(s).map((p) => gb.mse(p, valid().y)));

export function bestStage(s: Settings) {
	const v = validLoss(s);
	let b = 0;
	for (let m = 1; m < v.length; m++) if (v[m] < v[b]) b = m;
	return b;
}

/** Residuals y − F after m stages. */
export function residuals(s: Settings, m: number) {
	const p = predTrain(s, m);
	return train().y.map((y, i) => y - p[i]);
}

/** The tree that stage m+1 fits to the current residuals (= booster's tree m). */
export function nextTree(s: Settings, m: number) {
	if (m < MAX_STAGES) return booster(s).trees[m];
	const d = train();
	const { g, h } = squaredGH(Array.from(predTrain(s, m)), d.y);
	return growTree(
		d.x.map((v) => [v]),
		g,
		h,
		d.x.map((_, i) => i),
		{ maxDepth: s.depth, minLeaf: MIN_LEAF }
	);
}

/** First stage at which training loss drops to `target` or below (Infinity if never). */
export function stagesTo(s: Settings, target: number) {
	const l = trainLoss(s);
	const i = l.findIndex((v) => v <= target);
	return i < 0 ? Infinity : i;
}

/* ---------------- AdaBoost ---------------- */

export const adaData = () => cached('ada', () => dt.makeData(12, 40, 0));
export const adaRounds = () => cached('adaRounds', () => gb.adaboost(adaData().X, adaData().y, ADA_ROUNDS));

export function adaAccuracy(M: number) {
	const d = adaData();
	const r = adaRounds();
	let ok = 0;
	d.X.forEach((p, i) => {
		if ((gb.adaScore(r, p, M) > 0 ? 1 : 0) === d.y[i]) ok++;
	});
	return ok / d.y.length;
}

/* ---------------- actions ---------------- */

export function setStage(s: GBState, m: number) {
	s.stage = Math.max(0, Math.min(MAX_STAGES, Math.round(m)));
}

export function addTrees(s: GBState, k: number) {
	setStage(s, s.stage + k);
	s.did.add += k;
}

export function adaStep(s: GBState, k = 1) {
	s.round = Math.max(0, Math.min(ADA_ROUNDS, s.round + k));
	s.did.ada += k;
}

export const off: GBState['ui'] = { add: false, stage: false, lr: false, depth: false, valid: false, stop: false, ada: false };
export const hidden: GBState['show'] = { residuals: false, resPanel: false, next: false, leafValues: false, loss: false, valid: false, best: false };

export function init(): GBState {
	return {
		view: 'boost',
		stage: 0,
		lr: DEFAULT_LR,
		depth: DEFAULT_DEPTH,
		lrRef: 0,
		round: 0,
		show: { ...hidden },
		ui: { ...off },
		did: { add: 0, ada: 0 }
	};
}
