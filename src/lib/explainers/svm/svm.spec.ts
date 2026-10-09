import { describe, expect, it } from 'vitest';
import { kernelFn, marginWidth, predict, primal, role, train, decision, type SvmModel } from './svm.ts';
import { DATA, TEST, GAMMA_STEPS } from './state.ts';
import { accuracy } from '../_classifiers/data.ts';

/** Dual objective Σα − ½ Σᵢⱼ αᵢαⱼyᵢyⱼK(xᵢ,xⱼ). */
function dual(m: SvmModel) {
	const K = kernelFn(m.kernel);
	let s = 0;
	let q = 0;
	m.X.forEach((a, i) => {
		s += m.alpha[i];
		m.X.forEach((b, j) => (q += m.alpha[i] * m.alpha[j] * m.y[i] * m.y[j] * K(a, b)));
	});
	return s - 0.5 * q;
}

describe('svm (SMO)', () => {
	it('finds the known maximum-margin line on a symmetric toy set', () => {
		const X = [
			[1, 0],
			[2, 1],
			[2, -1],
			[3, 0],
			[-1, 0],
			[-2, 1],
			[-2, -1],
			[-3, 0]
		];
		const y = [1, 1, 1, 1, 0, 0, 0, 0];
		const m = train(X, y, 1e4, { type: 'linear' }, { tol: 1e-6 });
		expect(m.w![0]).toBeCloseTo(1, 4);
		expect(m.w![1]).toBeCloseTo(0, 4);
		expect(m.b).toBeCloseTo(0, 4);
		expect(marginWidth(m)).toBeCloseTo(2, 4);
		expect(m.sv.sort()).toEqual([0, 4]);
		expect(role(m, 0)).toBe('margin');
		expect(role(m, 3)).toBe('outside');
	});

	it('margin is set by the closest pair on an asymmetric separable set', () => {
		// closest points (0,1) and (0,-1): street of width 2, boundary x₂ = 0
		const X = [
			[0, 1],
			[1, 2],
			[-2, 3],
			[0, -1],
			[2, -2],
			[-1, -3]
		];
		const y = [1, 1, 1, 0, 0, 0];
		const m = train(X, y, 1e4, { type: 'linear' }, { tol: 1e-6 });
		expect(marginWidth(m)).toBeCloseTo(2, 3);
		expect(decision(m, [5, 0])).toBeCloseTo(0, 3);
	});

	it('satisfies KKT and has (near) zero duality gap on soft-margin data', () => {
		const d = DATA.overlap;
		for (const C of [0.1, 1, 10]) {
			const m = train(d.X, d.y, C, { type: 'linear' });
			expect(m.gap).toBeLessThan(1e-3);
			const P = primal(m);
			const D = dual(m);
			expect(Math.abs(P - D) / Math.max(1, Math.abs(P))).toBeLessThan(5e-3);
			m.X.forEach((p, i) => {
				const yf = m.y[i] * decision(m, p);
				if (m.alpha[i] <= 1e-9) expect(yf).toBeGreaterThan(1 - 2e-3);
				else if (m.alpha[i] >= C - 1e-9) expect(yf).toBeLessThan(1 + 2e-3);
				else expect(yf).toBeCloseTo(1, 2);
			});
		}
	});

	it('larger C narrows the street and uses fewer support vectors', () => {
		const d = DATA.overlap;
		const lo = train(d.X, d.y, 0.1, { type: 'linear' });
		const hi = train(d.X, d.y, 100, { type: 'linear' });
		expect(marginWidth(hi)).toBeLessThan(marginWidth(lo));
		expect(hi.sv.length).toBeLessThan(lo.sv.length);
	});

	it('only support vectors matter: removing a non-support point leaves the model unchanged', () => {
		const d = DATA.separable;
		const m = train(d.X, d.y, 1000, { type: 'linear' }, { tol: 1e-6 });
		const drop = d.X.findIndex((_, i) => !m.sv.includes(i));
		const X2 = d.X.filter((_, i) => i !== drop);
		const y2 = d.y.filter((_, i) => i !== drop);
		const m2 = train(X2, y2, 1000, { type: 'linear' }, { tol: 1e-6 });
		expect(m2.w![0]).toBeCloseTo(m.w![0], 3);
		expect(m2.w![1]).toBeCloseTo(m.w![1], 3);
		expect(m2.b).toBeCloseTo(m.b, 3);
	});

	it('linear kernel fails on circles, RBF separates them', () => {
		const d = DATA.circles;
		const lin = train(d.X, d.y, 1, { type: 'linear' });
		const rbf = train(d.X, d.y, 1, { type: 'rbf', gamma: 2 });
		expect(accuracy(d, (p) => predict(lin, p))).toBeLessThan(0.7);
		expect(accuracy(d, (p) => predict(rbf, p))).toBeGreaterThan(0.97);
	});

	it('gamma trades smoothness for fit on moons', () => {
		const d = DATA.moons;
		const fitAt = (g: number) => {
			const m = train(d.X, d.y, 10, { type: 'rbf', gamma: g });
			return { train: accuracy(d, (p) => predict(m, p)), test: accuracy(TEST.moons, (p) => predict(m, p)) };
		};
		const hi = fitAt(GAMMA_STEPS[GAMMA_STEPS.length - 1]);
		expect(hi.train).toBe(1);
		const best = Math.max(...GAMMA_STEPS.map((g) => fitAt(g).test));
		expect(best).toBeGreaterThan(hi.test + 0.03);
		expect(best).toBeGreaterThanOrEqual(0.9);
	});
});
