import { describe, expect, it } from 'vitest';
import * as q from './qlearn.ts';

const c = (x: number, y: number) => y * 7 + x;
const env: q.Env = { cols: 7, rows: 5, start: c(0, 4), goal: c(6, 0), pit: c(5, 2), walls: [c(1, 1), c(2, 1), c(4, 1), c(4, 2), c(1, 3), c(3, 4)] };
const opts: q.QOpts = { alpha: 0.5, gamma: 0.9, eps: 1, epsMin: 0.05, decay: 0.6, episodes: 200, seed: 1, maxSteps: 100 };

describe('grid world + Q-learning', () => {
	it('moves are blocked by walls and edges', () => {
		expect(q.move(env, env.start, 3)).toBe(env.start); // left edge
		expect(q.move(env, env.start, 1)).toBe(c(1, 4));
		expect(q.move(env, c(2, 4), 1)).toBe(c(2, 4)); // wall at (3,4)
		expect(q.shortest(env, env.goal)).toBe(10);
	});

	it('each transition applies the Bellman update', () => {
		const run = q.train(env, opts);
		for (const tr of run.transitions.slice(0, 2000)) {
			expect(tr.target).toBeCloseTo(tr.r + opts.gamma * tr.maxNext, 12);
			expect(tr.next).toBeCloseTo(tr.old + opts.alpha * (tr.target - tr.old), 12);
			if (tr.done) expect(tr.maxNext).toBe(0);
		}
	});

	it('converges to the optimal (shortest) path and is reproducible', () => {
		const run = q.train(env, opts);
		const path = q.greedyPath(env, run.snaps.at(-1)!);
		expect(path.outcome).toBe('goal');
		expect(path.cells.length - 1).toBe(q.shortest(env, env.goal));
		expect(q.train(env, opts).transitions.length).toBe(run.transitions.length);
	});

	it('values settle at the discounted reward γ^(d−1)·10', () => {
		const run = q.train(env, { ...opts, alpha: 1 });
		const Q = run.snaps.at(-1)!;
		expect(q.maxQ(Q, env.start)).toBeCloseTo(10 * 0.9 ** 9, 2);
		expect(q.maxQ(Q, c(6, 1))).toBeCloseTo(10, 6);
	});

	it('without exploration (ε = 0) a greedy agent never finds the goal', () => {
		const run = q.train(env, { ...opts, eps: 0 });
		expect(run.outcomes.every((o) => o === 'timeout')).toBe(true);
		expect(run.snaps.at(-1)!.every((v) => v === 0)).toBe(true);
	});

	it('qAt rebuilds Q at any transition', () => {
		const run = q.train(env, opts);
		const t = run.epStart[5] + 3;
		const Q = new Float64Array(run.n * 4);
		for (const tr of run.transitions.slice(0, t)) Q[tr.s * 4 + tr.a] = tr.next;
		expect(Array.from(q.qAt(run, t))).toEqual(Array.from(Q));
		expect(q.qAt(run, run.transitions.length)).toEqual(run.snaps.at(-1));
	});

	it('ε decays linearly to its floor', () => {
		expect(q.epsilonAt(opts, 0)).toBe(1);
		expect(q.epsilonAt(opts, 120)).toBeCloseTo(0.05, 12);
		expect(q.epsilonAt(opts, 199)).toBeCloseTo(0.05, 12);
		expect(q.epsilonAt({ ...opts, eps: 0 }, 50)).toBe(0);
	});
});
