import { describe, expect, it } from 'vitest';
import * as r from './regression.ts';

describe('regression math', () => {
	it('generates deterministic data', () => {
		expect(r.rentData(3, 30)).toEqual(r.rentData(3, 30));
		expect(r.curveData(7, 12)).toEqual(r.curveData(7, 12));
		const d = r.rentData(2, 10);
		expect(d.xs.length).toBe(10);
		expect(d.ys.every((y) => y % 5 === 0)).toBe(true);
	});

	it('ols matches the closed form and minimizes MSE', () => {
		const { xs, ys } = r.rentData(3, 30);
		const f = r.ols(xs, ys);
		const best = r.mse(ys, r.predict(f, xs));
		for (const [dw, db] of [
			[0.1, 0],
			[-0.1, 0],
			[0, 5],
			[0, -5]
		]) {
			expect(r.mse(ys, r.predict({ w: f.w + dw, b: f.b + db }, xs))).toBeGreaterThan(best);
		}
		// same answer as the general solver
		const g = r.fitLinear(
			xs.map((x) => [x]),
			ys
		);
		expect(g.coef[0]).toBeCloseTo(f.w, 8);
		expect(g.intercept).toBeCloseTo(f.b, 6);
		// residuals of a least-squares line average to zero
		expect(r.mean(r.residuals(ys, r.predict(f, xs)))).toBeCloseTo(0, 8);
	});

	it('metrics on a known example', () => {
		const y = [100, 200, 300, 400, 500];
		const p = [110, 190, 310, 380, 520];
		expect(r.mae(y, p)).toBe(14);
		expect(r.mse(y, p)).toBe(220);
		expect(r.rmse(y, p)).toBeCloseTo(Math.sqrt(220), 10);
		expect(r.r2(y, p)).toBeCloseTo(1 - 1100 / 100000, 10);
		expect(r.rmse(y, p)).toBeGreaterThanOrEqual(r.mae(y, p));
		expect(r.r2(y, y.map(() => 300))).toBeCloseTo(0, 12);
		expect(r.r2(y, [500, 400, 300, 200, 100])).toBeLessThan(0);
		expect(r.adjustedR2(0.9, 20, 3)).toBeCloseTo(1 - (0.1 * 19) / 16, 12);
	});

	it('median minimizes MAE and mean minimizes RMSE for a constant prediction', () => {
		const ys = [3, 7, 8, 12, 40];
		const med = r.median(ys);
		const mu = r.mean(ys);
		expect(med).toBe(8);
		for (const c of [med - 1, med + 1, mu]) expect(r.constMae(ys, c)).toBeGreaterThan(r.constMae(ys, med));
		for (const c of [mu - 1, mu + 1, med]) expect(r.constRmse(ys, c)).toBeGreaterThan(r.constRmse(ys, mu));
		expect(r.median([1, 2, 3, 4])).toBe(2.5);
	});

	it('ridge shrinks and lasso zeroes polynomial coefficients', () => {
		const { xs, ys } = r.curveData(7, 12);
		const maxAbs = (f: r.LinearFit) => Math.max(...f.coef.map(Math.abs));
		const plain = r.fitPoly(xs, ys, 9);
		const ridge = r.fitPoly(xs, ys, 9, 'ridge', 1e-3);
		expect(maxAbs(plain)).toBeGreaterThan(50);
		expect(maxAbs(ridge)).toBeLessThan(5);
		const lasso = r.fitPoly(xs, ys, 9, 'lasso', 3e-3);
		expect(lasso.coef.filter((c) => c === 0).length).toBeGreaterThanOrEqual(3);
		expect(r.fitPoly(xs, ys, 9, 'lasso', 10).coef.every((c) => c === 0)).toBe(true);
		// the plain degree-9 fit explodes just outside the data
		expect(Math.abs(r.evalPoly(plain, 1.3))).toBeGreaterThan(50);
	});

	it('useless features raise training R² but not adjusted or test R²', () => {
		const data = r.featureData(17, 18, 300, 10);
		const s = Array.from({ length: 11 }, (_, k) => r.scoreWithJunk(data, k));
		for (let k = 1; k <= 10; k++) {
			expect(s[k].r2Train).toBeGreaterThanOrEqual(s[k - 1].r2Train - 1e-9);
			expect(s[k].adjR2).toBeLessThan(s[0].adjR2);
		}
		expect(s[10].r2Test).toBeLessThan(s[0].r2Test - 0.2);
	});
});
