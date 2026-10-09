/**
 * Tabular Q-learning on a small deterministic grid world. Training is recorded transition by
 * transition so the lesson can replay it, show the Bellman update for any step, and rebuild Q.
 */
import { mulberry32 } from '#lib/viz/canvas.ts';

export interface Env {
	cols: number;
	rows: number;
	start: number;
	goal: number;
	pit: number;
	walls: number[];
}

export const ACTIONS = ['up', 'right', 'down', 'left'] as const;
export const ARROWS = ['↑', '→', '↓', '←'];
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

export const REWARD = { goal: 10, pit: -10, step: 0 };

export type Outcome = 'goal' | 'pit' | 'timeout';

export const cellOf = (env: Env, x: number, y: number) => y * env.cols + x;
export const xy = (env: Env, c: number) => [c % env.cols, Math.floor(c / env.cols)] as const;

export function isTerminal(env: Env, c: number) {
	return c === env.goal || c === env.pit;
}

export function rewardAt(env: Env, c: number) {
	return c === env.goal ? REWARD.goal : c === env.pit ? REWARD.pit : REWARD.step;
}

export function outcomeAt(env: Env, c: number): Outcome | null {
	return c === env.goal ? 'goal' : c === env.pit ? 'pit' : null;
}

/** Deterministic move; bumping into a wall or the edge leaves the agent where it is. */
export function move(env: Env, c: number, a: number): number {
	const [x, y] = xy(env, c);
	const nx = x + DX[a];
	const ny = y + DY[a];
	if (nx < 0 || ny < 0 || nx >= env.cols || ny >= env.rows) return c;
	const n = cellOf(env, nx, ny);
	return env.walls.includes(n) ? c : n;
}

export interface QOpts {
	alpha: number;
	gamma: number;
	/** Exploration rate at the first episode; it decays linearly to `epsMin` over `decay` × episodes. */
	eps: number;
	epsMin: number;
	decay: number;
	episodes: number;
	seed: number;
	maxSteps: number;
}

export interface Transition {
	s: number;
	a: number;
	r: number;
	s2: number;
	done: boolean;
	explore: boolean;
	/** Q(s,a) before the update. */
	old: number;
	/** max_a′ Q(s′,a′) (0 at a terminal state). */
	maxNext: number;
	target: number;
	/** Q(s,a) after the update. */
	next: number;
}

export interface Run {
	n: number;
	transitions: Transition[];
	/** Index of the first transition of each episode (plus a final sentinel). */
	epStart: number[];
	outcomes: Outcome[];
	/** Q after each episode. */
	snaps: Float64Array[];
}

export function maxQ(Q: ArrayLike<number>, c: number) {
	return Math.max(Q[c * 4], Q[c * 4 + 1], Q[c * 4 + 2], Q[c * 4 + 3]);
}

/** Greedy action; ties go to the lowest index (or to `rand` when given). */
export function argmaxQ(Q: ArrayLike<number>, c: number, rand?: () => number) {
	const m = maxQ(Q, c);
	const best = [0, 1, 2, 3].filter((a) => Q[c * 4 + a] >= m - 1e-12);
	return rand ? best[Math.floor(rand() * best.length)] : best[0];
}

/** ε for a given episode: linear decay from `eps` to min(eps, epsMin). */
export function epsilonAt(o: Pick<QOpts, 'eps' | 'epsMin' | 'decay' | 'episodes'>, ep: number) {
	const lo = Math.min(o.eps, o.epsMin);
	const span = Math.max(1, o.decay * o.episodes);
	return Math.max(lo, o.eps - ((o.eps - lo) * ep) / span);
}

export function train(env: Env, o: QOpts): Run {
	const n = env.cols * env.rows;
	const Q = new Float64Array(n * 4);
	const rand = mulberry32(o.seed);
	const transitions: Transition[] = [];
	const epStart: number[] = [];
	const outcomes: Outcome[] = [];
	const snaps: Float64Array[] = [];
	for (let ep = 0; ep < o.episodes; ep++) {
		epStart.push(transitions.length);
		const eps = epsilonAt(o, ep);
		let c = env.start;
		let outcome: Outcome = 'timeout';
		for (let k = 0; k < o.maxSteps; k++) {
			// ε-greedy: explore with probability ε, otherwise the best known action (ties: lowest index, like np.argmax)
			const explore = rand() < eps;
			const a = explore ? Math.floor(rand() * 4) : argmaxQ(Q, c);
			const s2 = move(env, c, a);
			const r = rewardAt(env, s2);
			const done = isTerminal(env, s2);
			const old = Q[c * 4 + a];
			const maxNext = done ? 0 : maxQ(Q, s2);
			const target = r + o.gamma * maxNext;
			const next = old + o.alpha * (target - old);
			Q[c * 4 + a] = next;
			transitions.push({ s: c, a, r, s2, done, explore, old, maxNext, target, next });
			c = s2;
			if (done) {
				outcome = outcomeAt(env, s2)!;
				break;
			}
		}
		outcomes.push(outcome);
		snaps.push(Q.slice());
	}
	epStart.push(transitions.length);
	return { n, transitions, epStart, outcomes, snaps };
}

/** Episode that transition index t (0-based, the t-th applied update) belongs to. */
export function episodeOf(run: Run, t: number) {
	let lo = 0;
	let hi = run.outcomes.length - 1;
	while (lo < hi) {
		const mid = (lo + hi + 1) >> 1;
		if (run.epStart[mid] <= t) lo = mid;
		else hi = mid - 1;
	}
	return lo;
}

/** Q after the first `t` transitions. */
export function qAt(run: Run, t: number): Float64Array {
	if (t <= 0) return new Float64Array(run.n * 4);
	t = Math.min(t, run.transitions.length);
	if (t === run.transitions.length) return run.snaps[run.snaps.length - 1];
	const ep = episodeOf(run, t - 1);
	const Q = ep > 0 ? run.snaps[ep - 1].slice() : new Float64Array(run.n * 4);
	for (let k = run.epStart[ep]; k < t; k++) {
		const tr = run.transitions[k];
		Q[tr.s * 4 + tr.a] = tr.next;
	}
	return Q;
}

/** Follow the greedy policy from the start; stops at a terminal, a loop or `max` steps. */
export function greedyPath(env: Env, Q: ArrayLike<number>, max = 60): { cells: number[]; outcome: Outcome } {
	const cells = [env.start];
	const seen = new Set(cells);
	let c = env.start;
	for (let k = 0; k < max; k++) {
		const a = argmaxQ(Q, c);
		if (maxQ(Q, c) === 0 && [0, 1, 2, 3].every((b) => Q[c * 4 + b] === 0)) break;
		const n = move(env, c, a);
		cells.push(n);
		const out = outcomeAt(env, n);
		if (out) return { cells, outcome: out };
		if (seen.has(n)) break;
		seen.add(n);
		c = n;
	}
	return { cells, outcome: 'timeout' };
}

/** Shortest number of moves from start to a cell (BFS), avoiding other terminals; −1 if unreachable. */
export function shortest(env: Env, to: number): number {
	const dist = new Map<number, number>([[env.start, 0]]);
	const queue = [env.start];
	while (queue.length) {
		const c = queue.shift()!;
		if (c === to) return dist.get(c)!;
		if (c !== env.start && isTerminal(env, c)) continue;
		for (let a = 0; a < 4; a++) {
			const n = move(env, c, a);
			if (!dist.has(n)) {
				dist.set(n, dist.get(c)! + 1);
				queue.push(n);
			}
		}
	}
	return -1;
}
