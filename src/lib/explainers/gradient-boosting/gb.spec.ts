import { describe, expect, it } from 'vitest';
import * as dt from '../decision-tree/tree.ts';
import * as gb from './gb.ts';

const train = gb.makeData(4, 40, 0.5);
const valid = gb.makeData(104, 300, 0.5);

describe('gradient boosting', () => {
	it('starts from the mean and each tree fits the residuals (leaf = mean residual)', () => {
		const b = gb.boost(train, { rounds: 1, lr: 1, maxDepth: 2 });
		const mean = train.y.reduce((a, c) => a + c, 0) / train.y.length;
		expect(b.F0).toBeCloseTo(mean);
		for (const p of gb.pieces(b.trees[0])) {
			const inLeaf = train.x.map((x, i) => [x, train.y[i] - mean]).filter(([x]) => x >= p.x0 && x < p.x1);
			const avg = inLeaf.reduce((a, [, r]) => a + r, 0) / inLeaf.length;
			expect(p.w).toBeCloseTo(avg);
		}
	});

	it('training loss never increases from one stage to the next', () => {
		for (const lr of [0.05, 0.1, 0.5, 1]) {
			const b = gb.boost(train, { rounds: 120, lr, maxDepth: 2, minLeaf: 2 });
			const loss = gb.staged(b, train.x).map((p) => gb.mse(p, train.y));
			for (let m = 1; m < loss.length; m++) expect(loss[m]).toBeLessThanOrEqual(loss[m - 1] + 1e-12);
			expect(loss[loss.length - 1]).toBeLessThan(loss[0] * 0.2);
		}
	});

	it('a smaller learning rate needs proportionally more trees', () => {
		const loss = (lr: number) =>
			gb.staged(gb.boost(train, { rounds: 300, lr, maxDepth: 2, minLeaf: 2 }), train.x).map((p) => gb.mse(p, train.y));
		const first = (l: number[], t: number) => l.findIndex((v) => v <= t);
		const a = first(loss(0.1), 0.3);
		const b = first(loss(0.05), 0.3);
		expect(b / a).toBeGreaterThan(1.6);
		expect(b / a).toBeLessThan(2.4);
	});

	it('validation loss is U-shaped: too many stages overfit', () => {
		const b = gb.boost(train, { rounds: 300, lr: 0.1, maxDepth: 2, minLeaf: 2 });
		const v = gb.staged(b, valid.x).map((p) => gb.mse(p, valid.y));
		const best = v.indexOf(Math.min(...v));
		expect(best).toBeGreaterThan(10);
		expect(best).toBeLessThan(150);
		expect(v[300]).toBeGreaterThan(v[best] * 1.1);
	});
});

describe('AdaBoost', () => {
	const d = dt.makeData(12, 40, 0);
	const rounds = gb.adaboost(d.X, d.y, 30);

	it('each stump beats chance on its weighted data, and its say grows as its error shrinks', () => {
		for (const r of rounds) {
			expect(r.err).toBeLessThan(0.5);
			expect(r.alpha).toBeCloseTo(0.5 * Math.log((1 - r.err) / r.err));
			expect(r.weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
		}
	});

	it('misclassified points gain weight, correct ones lose it', () => {
		const r0 = rounds[0];
		const w1 = rounds[1].weights;
		d.X.forEach((p, i) => {
			const right = (gb.stumpPredict(r0.stump, p) > 0 ? 1 : 0) === d.y[i];
			if (right) expect(w1[i]).toBeLessThan(r0.weights[i]);
			else expect(w1[i]).toBeGreaterThan(r0.weights[i]);
		});
		// after re-weighting, the previous stump is exactly a coin flip
		const err = d.X.reduce((a, p, i) => a + ((gb.stumpPredict(r0.stump, p) > 0 ? 1 : 0) !== d.y[i] ? w1[i] : 0), 0);
		expect(err).toBeCloseTo(0.5);
	});

	it('the weighted vote of many stumps fits better than one stump', () => {
		const acc = (M: number) => d.X.filter((p, i) => (gb.adaScore(rounds, p, M) > 0 ? 1 : 0) === d.y[i]).length / d.y.length;
		expect(acc(30)).toBeGreaterThan(acc(1));
		expect(acc(30)).toBeGreaterThanOrEqual(0.95);
	});
});
