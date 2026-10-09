import { describe, expect, it } from 'vitest';
import * as ts from './ts.ts';

describe('time series helpers', () => {
	const S = ts.makeSales();

	it('generates a deterministic series that adds up its components', () => {
		expect(ts.makeSales()).toEqual(S);
		expect(S.y.length).toBe(120);
		S.y.forEach((v, t) => expect(v).toBeCloseTo(S.trend[t] + S.season[t] + S.noise[t], 9));
	});

	it('first differencing turns a linear trend into a constant', () => {
		const y = Array.from({ length: 50 }, (_, t) => 3 + 2 * t);
		const d = ts.difference(y, 1);
		expect(d.length).toBe(49);
		d.forEach((v) => expect(v).toBeCloseTo(2, 12));
	});

	it('seasonal + first differencing makes the sales series level', () => {
		const raw = ts.rolling(S.y, 24).map((r) => r.mean);
		expect(raw.at(-1)! - raw[0]).toBeGreaterThan(50);
		const both = ts.rolling(ts.difference(ts.difference(S.y, 1), 12), 24).map((r) => r.mean);
		both.forEach((m) => expect(Math.abs(m)).toBeLessThan(1));
	});

	it('ACF: trend gives slow decay, lag-1 differences spike at the season length', () => {
		const raw = ts.acf(S.y, 12);
		expect(raw[0]).toBeCloseTo(1, 12);
		expect(raw[6]).toBeGreaterThan(0.6);
		const d = ts.acf(ts.difference(S.y, 1), 13);
		const best = d.slice(2).reduce((b, v, i) => (v > d[b] ? i + 2 : b), 2);
		expect(best).toBe(12);
	});

	it('AR fit recovers known coefficients', () => {
		const x = ts.simulateARMA([0.35, 0.5], [], 5000, 3);
		const f = ts.fitAR(x, 2);
		expect(f.phi[0]).toBeCloseTo(0.35, 1);
		expect(f.phi[1]).toBeCloseTo(0.5, 1);
		expect(f.sigma).toBeCloseTo(1, 1);
	});

	it('MA(1) autocorrelation cuts off after lag 1', () => {
		const r = ts.acf(ts.simulateARMA([], [0.8], 5000, 4), 4);
		expect(r[1]).toBeCloseTo(0.8 / 1.64, 1);
		expect(Math.abs(r[2])).toBeLessThan(0.06);
	});

	it('AR forecasts decay to the mean while the interval widens', () => {
		const x = ts.simulateARMA([0.35, 0.5], [], 200, 5);
		const f = ts.fitAR(x, 2);
		const fc = ts.forecastAR(x, f, 60);
		for (let i = 1; i < fc.se.length; i++) expect(fc.se[i]).toBeGreaterThanOrEqual(fc.se[i - 1]);
		expect(fc.se[0]).toBeCloseTo(f.sigma, 9);
		expect(fc.mean.at(-1)!).toBeCloseTo(ts.arMean(f), 2);
	});

	it('Prophet-style model needs changepoints to follow the faster trend', () => {
		const tr = Array.from({ length: 96 }, (_, i) => i);
		const test = Array.from({ length: 24 }, (_, i) => 96 + i);
		const err = (o: ts.ProphetOpts) => {
			const f = ts.fitProphet(tr, tr.map((t) => S.y[t]), o);
			return ts.mae(test.map((t) => ts.predictProphet(f, t).y), test.map((t) => S.y[t]));
		};
		expect(err({ K: 4, changepoints: true })).toBeLessThan(err({ K: 4, changepoints: false }) / 3);
		expect(err({ K: 4, changepoints: true })).toBeLessThan(err({ K: 1, changepoints: true }));
	});

	it('shuffled CV is over-optimistic compared with walk-forward', () => {
		const o = { K: 4, changepoints: true };
		const shuffled = ts.backtest(S.y, ts.shuffledFolds(120, 5, 1), o).mae;
		const walk = ts.backtest(S.y, ts.walkForwardFolds(120, [60, 72, 84, 96, 108], 12), o).mae;
		expect(walk).toBeGreaterThan(1.4 * shuffled);
	});
});
