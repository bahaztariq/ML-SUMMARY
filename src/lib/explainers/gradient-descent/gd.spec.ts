import { describe, expect, it } from 'vitest';
import {
	FIT_DATA,
	PROBLEMS,
	STRETCHED,
	descend,
	fitCoefficients,
	gdStep,
	hessian,
	isDiverged,
	makeFitData,
	maxStableLr,
	mse,
	numericGrad,
	stepsToMin,
	type ProblemId
} from './gd.ts';

const ids: ProblemId[] = ['fit', 'bumpy', 'stretched', 'round'];
const START_2D = [-2.7, -0.7];

describe('gradient descent', () => {
	it('generates deterministic data with mean(x²) = 1', () => {
		expect(makeFitData()).toEqual(FIT_DATA);
		const { A } = fitCoefficients(FIT_DATA);
		expect(A).toBeCloseTo(1, 12);
	});

	it('the fit loss is the MSE of the line y = w·x', () => {
		for (const w of [-2, 0, 1.3, 4]) expect(PROBLEMS.fit.loss([w])).toBeCloseTo(mse(FIT_DATA, w), 10);
	});

	it.each(ids)('analytic gradient matches finite differences (%s)', (id) => {
		const p = PROBLEMS[id];
		const pts = p.dim === 1 ? [[-2.2], [-0.4], [0.7], [2.1]] : [[-2, 1], [0.3, -1.4], [2.5, 2]];
		for (const w of pts) {
			const g = p.grad(w);
			numericGrad(p, w).forEach((ng, i) => expect(g[i]).toBeCloseTo(ng, 5));
		}
	});

	it('minima are stationary points', () => {
		for (const id of ids)
			for (const m of PROBLEMS[id].minima) PROBLEMS[id].grad(m.w).forEach((g) => expect(Math.abs(g)).toBeLessThan(1e-9));
	});

	it('on the fit loss (curvature 2) GD converges for η < 1 and diverges above', () => {
		const p = PROBLEMS.fit;
		const wStar = p.minima[0].w[0];
		const w0 = [wStar - 3];
		for (const lr of [0.02, 0.25, 0.5, 0.9, 0.98]) {
			const path = descend(p, w0, lr, 5000);
			expect(Math.abs(path.at(-1)![0] - wStar)).toBeLessThan(1e-3);
		}
		for (const lr of [1.02, 1.1, 1.5]) {
			const path = descend(p, w0, lr, 5000);
			expect(isDiverged(p, path.at(-1)!)).toBe(true);
		}
	});

	it('the error shrinks by exactly (1 − 2η) per step on the fit loss', () => {
		const p = PROBLEMS.fit;
		const wStar = p.minima[0].w[0];
		for (const lr of [0.1, 0.5, 0.8, 1.1]) {
			const w1 = gdStep(p, [wStar - 3], lr)[0];
			expect(w1 - wStar).toBeCloseTo(-3 * (1 - 2 * lr), 10);
		}
	});

	it('0.5 < η < 1 overshoots: the error flips sign every step', () => {
		const p = PROBLEMS.fit;
		const wStar = p.minima[0].w[0];
		const path = descend(p, [wStar - 3], 0.8, 6);
		for (let i = 1; i < path.length; i++) expect(Math.sign(path[i][0] - wStar)).toBe(-Math.sign(path[i - 1][0] - wStar));
	});

	it('η in [0.35, 0.65] reaches the fit minimum in ≤ 3 steps, η = 0.02 does not in 20', () => {
		const p = PROBLEMS.fit;
		const w0 = [p.minima[0].w[0] - 3];
		for (const lr of [0.35, 0.5, 0.65]) {
			const k = stepsToMin(p, descend(p, w0, lr, 20));
			expect(k).toBeGreaterThan(0);
			expect(k).toBeLessThanOrEqual(3);
		}
		expect(stepsToMin(p, descend(p, w0, 0.02, 20))).toBe(-1);
	});

	it('on the bumpy loss the start decides which valley wins', () => {
		const p = PROBLEMS.bumpy;
		const global = p.minima.find((m) => m.global)!.w[0];
		const local = p.minima.find((m) => !m.global)!.w[0];
		expect(p.loss([global])).toBeLessThan(p.loss([local]));
		expect(descend(p, [2.2], 0.1, 2000).at(-1)![0]).toBeCloseTo(local, 3);
		expect(descend(p, [-0.3], 0.1, 2000).at(-1)![0]).toBeCloseTo(global, 3);
		expect(descend(p, [0.3], 0.1, 2000).at(-1)![0]).toBeCloseTo(local, 3);
		// a big step can hop the hump (mentioned in the lesson as luck, not strategy)
		expect(descend(p, [2.2], 0.3, 2000).at(-1)![0]).toBeCloseTo(global, 3);
	});

	it('2-D bowl: the Hessian has the requested curvatures', () => {
		const { a, b, d } = hessian(STRETCHED);
		expect(a + d).toBeCloseTo(13, 10);
		expect(a * d - b * b).toBeCloseTo(12, 10);
	});

	it('stretched bowl: converges below 2/λmax, diverges above', () => {
		const p = PROBLEMS.stretched;
		const lim = maxStableLr(12);
		expect(stepsToMin(p, descend(p, START_2D, lim * 0.95, 5000))).toBeGreaterThan(0);
		expect(isDiverged(p, descend(p, START_2D, lim * 1.05, 5000).at(-1)!)).toBe(true);
	});

	it('stretched bowl zig-zags; scaling it round lets a big η finish in a few steps', () => {
		const s = PROBLEMS.stretched;
		const path = descend(s, START_2D, 0.15, 60);
		// consecutive moves point in opposite-ish directions: across the valley and back
		const turns = path.slice(2).filter((w, i) => {
			const d1 = [path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]];
			const d2 = [w[0] - path[i + 1][0], w[1] - path[i + 1][1]];
			return d1[0] * d2[0] + d1[1] * d2[1] < 0;
		}).length;
		expect(turns).toBeGreaterThan(5);
		const best = Math.min(...[0.05, 0.1, 0.15, 0.16].map((lr) => stepsToMin(s, descend(s, START_2D, lr, 200))));
		expect(best).toBeGreaterThan(12);
		const r = PROBLEMS.round;
		const k = stepsToMin(r, descend(r, START_2D, 0.9, 60));
		expect(k).toBeGreaterThan(0);
		expect(k).toBeLessThanOrEqual(5);
	});
});
