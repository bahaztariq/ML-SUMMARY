import { describe, expect, it } from 'vitest';
import { blobs } from '../_classifiers/data.ts';
import { N_HAM, N_SPAM, fitGNB, fitQDA, gnbLogLik, gnbProbB, likelihood, normalPdf, posterior, qdaProbB, wordById } from './nb.ts';
import { DATA } from './state.ts';

const W = (...ids: string[]) => ids.map((id) => wordById.get(id)!);

describe('naive bayes: spam filter', () => {
	it('with no words the posterior is the prior', () => {
		const p = posterior([], 1);
		expect(p.post[0]).toBeCloseTo(N_SPAM / (N_SPAM + N_HAM), 12);
	});

	it('matches Bayes’ theorem by hand for one word', () => {
		// P(spam|free) = 0.6·0.4 / (0.6·0.4 + 0.1·0.6) = 0.8
		expect(posterior(W('free'), 0).post[0]).toBeCloseTo(0.8, 12);
	});

	it('posterior sums to 1 and agrees with the log-odds', () => {
		for (const alpha of [0.5, 1, 2]) {
			for (const ids of [['free'], ['free', 'click', 'meeting'], ['report', 'winner'], ['free', 'click', 'meeting', 'report', 'winner']]) {
				const p = posterior(W(...ids), alpha);
				expect(p.post[0] + p.post[1]).toBeCloseTo(1, 12);
				expect(p.post[0]).toBeCloseTo(1 / (1 + Math.exp(-p.logOdds)), 10);
			}
		}
	});

	it('a duplicated feature is counted twice (overconfidence)', () => {
		const once = posterior(W('free'), 0);
		const twice = posterior(W('free', 'FREE'), 0);
		expect(twice.logOdds - once.logOdds).toBeCloseTo(once.wordLogOdds[0], 12);
		expect(twice.post[0]).toBeGreaterThan(once.post[0]);
	});

	it('a zero count forces the posterior to 1 without smoothing, and smoothing fixes it', () => {
		const raw = posterior(W('meeting', 'report', 'winner'), 0);
		expect(raw.post[0]).toBe(1);
		const smooth = posterior(W('meeting', 'report', 'winner'), 1);
		expect(smooth.post[0]).toBeGreaterThan(0.3);
		expect(smooth.post[0]).toBeLessThan(0.6);
		expect(likelihood(0, 60, 1)).toBeCloseTo(1 / 62, 12);
	});
});

describe('naive bayes: Gaussian', () => {
	it('normal density integrates to 1', () => {
		let s = 0;
		for (let x = -5; x <= 5; x += 0.001) s += normalPdf(x, 0.3, 0.4) * 0.001;
		expect(s).toBeCloseTo(1, 4);
	});

	it('recovers means and variances of the generating blobs', () => {
		const d = blobs(1, 4000, { c0: [-0.5, 0.2], c1: [0.4, -0.1], spread: [0.3, 0.1], spread1: [0.1, 0.25] });
		const m = fitGNB(d);
		expect(m.mean[0][0]).toBeCloseTo(-0.5, 1);
		expect(m.mean[1][1]).toBeCloseTo(-0.1, 1);
		expect(Math.sqrt(m.var[0][0])).toBeCloseTo(0.3, 1);
		expect(Math.sqrt(m.var[1][1])).toBeCloseTo(0.25, 1);
		expect(m.prior[0] + m.prior[1]).toBeCloseTo(1, 12);
	});

	it('class posteriors sum to 1 and follow Bayes’ rule', () => {
		const m = fitGNB(DATA.blobs);
		const p = [0.1, -0.2];
		const a = m.prior[0] * Math.exp(gnbLogLik(m, 0, p));
		const b = m.prior[1] * Math.exp(gnbLogLik(m, 1, p));
		expect(gnbProbB(m, p)).toBeCloseTo(b / (a + b), 12);
	});

	it('full covariance beats the naive model on correlated (tilted) data', () => {
		const d = DATA.tilted;
		const g = fitGNB(d);
		const q = fitQDA(d);
		const acc = (f: (p: number[]) => number) => d.X.filter((p, i) => (f(p) >= 0.5 ? 1 : 0) === d.y[i]).length / d.X.length;
		expect(acc((p) => qdaProbB(q, p))).toBeGreaterThan(acc((p) => gnbProbB(g, p)) + 0.1);
	});
});
