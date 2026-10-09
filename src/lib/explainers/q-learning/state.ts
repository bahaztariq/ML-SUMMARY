/**
 * Q-learning explainer state. Training runs are precomputed (memoised by world + hyperparameters)
 * and the scene only moves a cursor `t` through the recorded transitions.
 */
import * as q from './qlearn.ts';

export const COLS = 7;
export const ROWS = 5;
const c = (x: number, y: number) => y * COLS + x;
export const START_ENV: q.Env = {
	cols: COLS,
	rows: ROWS,
	start: c(0, 4),
	goal: c(6, 0),
	pit: c(5, 2),
	walls: [c(1, 1), c(2, 1), c(4, 1), c(4, 2), c(1, 3), c(3, 4)]
};
export const EPISODES = 200;
export const MAX_STEPS = 100;
export const EPS_MIN = 0.05;
export const DECAY = 0.6;
export const SEED = 1;

export type Mode = 'walk' | 'learn';

export interface QState {
	env: q.Env;
	alpha: number;
	gamma: number;
	/** ε at the first episode (decays to 0.05). */
	eps: number;
	/** Number of recorded transitions applied so far. */
	t: number;
	mode: Mode;
	walk: { pos: number; steps: number; outcome: q.Outcome | null };
	show: { q: boolean; nums: boolean; arrows: boolean; update: boolean; chart: boolean; path: boolean; values: boolean; dqn: boolean; tableSize: boolean };
	ui: { walk: boolean; step: boolean; run: boolean; alpha: boolean; gamma: boolean; eps: boolean; edit: boolean };
	did: { goalMoved: boolean };
}

const memo = new Map<string, q.Run>();
export function runOf(s: Pick<QState, 'env' | 'alpha' | 'gamma' | 'eps'>): q.Run {
	const key = JSON.stringify([s.env.start, s.env.goal, s.env.pit, [...s.env.walls].sort((a, b) => a - b), s.alpha, s.gamma, s.eps]);
	let r = memo.get(key);
	if (!r) {
		if (memo.size > 60) memo.clear();
		r = q.train(plainEnv(s.env), opts(s));
		memo.set(key, r);
	}
	return r;
}

export const plainEnv = (e: q.Env): q.Env => ({ ...e, walls: [...e.walls] });

export function opts(s: Pick<QState, 'alpha' | 'gamma' | 'eps'>): q.QOpts {
	return { alpha: s.alpha, gamma: s.gamma, eps: s.eps, epsMin: EPS_MIN, decay: DECAY, episodes: EPISODES, seed: SEED, maxSteps: MAX_STEPS };
}

export const total = (s: QState) => runOf(s).transitions.length;
export const qNow = (s: QState) => q.qAt(runOf(s), s.t);
/** The transition just applied (the one that produced the current Q), if any. */
export const lastTr = (s: QState): q.Transition | null => (s.t > 0 ? runOf(s).transitions[Math.min(s.t, total(s)) - 1] : null);
/** Episode the cursor is in (number of finished episodes when between episodes). */
export function episodeNow(s: QState) {
	const run = runOf(s);
	if (s.t >= run.transitions.length) return EPISODES;
	return s.t <= 0 ? 0 : q.episodeOf(run, s.t - 1) + (run.epStart.includes(s.t) ? 1 : 0);
}

export const greedy = (s: QState) => q.greedyPath(plainEnv(s.env), qNow(s));

/** Advance to the first transition (from `t`) that changes a Q value. */
export function nextChange(s: QState) {
	const tr = runOf(s).transitions;
	let k = s.t;
	while (k < tr.length && tr[k].next === tr[k].old) k++;
	s.t = Math.min(tr.length, k + 1);
}

export function finishEpisode(s: QState) {
	const run = runOf(s);
	if (s.t >= run.transitions.length) return;
	const ep = q.episodeOf(run, s.t);
	s.t = run.epStart[ep + 1];
}

export function trainAll(s: QState) {
	s.t = total(s);
}

export function walkTo(s: QState, a: number) {
	if (s.walk.outcome) return;
	const n = q.move(plainEnv(s.env), s.walk.pos, a);
	s.walk.pos = n;
	s.walk.steps++;
	s.walk.outcome = q.outcomeAt(plainEnv(s.env), n);
}

export function resetWalk(s: QState) {
	s.walk = { pos: s.env.start, steps: 0, outcome: null };
}

export const cellName = (s: QState, cell: number) => {
	const [x, y] = q.xy(s.env, cell);
	return `(${x},${y})`;
};

export const f2 = (v: number) => (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2));

export const off = { walk: false, step: false, run: false, alpha: false, gamma: false, eps: false, edit: false };
export const noShow = { q: false, nums: false, arrows: false, update: false, chart: false, path: false, values: false, dqn: false, tableSize: false };

export function init(): QState {
	return {
		env: plainEnv(START_ENV),
		alpha: 0.5,
		gamma: 0.9,
		eps: 1,
		t: 0,
		mode: 'walk',
		walk: { pos: START_ENV.start, steps: 0, outcome: null },
		show: { ...noShow },
		ui: { ...off },
		did: { goalMoved: false }
	};
}
