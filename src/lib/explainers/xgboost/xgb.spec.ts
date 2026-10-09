import { describe, expect, it } from 'vitest';
import * as b from '../_ensembles/boost.ts';
import * as x from './xgb.ts';

describe('second-order trees', () => {
	// 4 rows on one feature, the last one missing
	const X = [[1], [2], [3], [NaN]];
	const g = [-0.5, -0.4, 0.6, 0.7];
	const h = [0.25, 0.24, 0.24, 0.21];

	it('computes the regularised gain and leaf weights from G and H', () => {
		const lambda = 1;
		const c = b.evalSplit(X, g, h, [0, 1, 2, 3], 0, 2.5, lambda);
		// missing row goes right (with the other positive gradient) because that scores higher
		expect(c.missLeft).toBe(false);
		const GL = -0.9,
			HL = 0.49,
			GR = 1.3,
			HR = 0.45;
		const expected = 0.5 * (GL ** 2 / (HL + lambda) + GR ** 2 / (HR + lambda) - (GL + GR) ** 2 / (HL + HR + lambda));
		expect(c.GL).toBeCloseTo(GL);
		expect(c.HR).toBeCloseTo(HR);
		expect(c.gain).toBeCloseTo(expected);
		expect(c.gainMissRight).toBeCloseTo(expected);
		expect(c.gainMissLeft).toBeLessThan(c.gainMissRight);
		expect(b.leafWeight(GL, HL, lambda)).toBeCloseTo(0.9 / 1.49);
	});

	it('larger λ shrinks leaf weights and gains', () => {
		const w = (l: number) => Math.abs(b.leafWeight(-0.9, 0.49, l));
		expect(w(10)).toBeLessThan(w(1));
		expect(w(1)).toBeLessThan(w(0));
		const gain = (l: number) => b.evalSplit(X, g, h, [0, 1, 2, 3], 0, 2.5, l).gain;
		expect(gain(10)).toBeLessThan(gain(0));
	});

	it('γ prunes splits whose gain is below it, bottom-up', () => {
		const d = x.makeData(8, 90);
		const { g: gg, h: hh } = b.logisticGH(
			d.y.map(() => 0),
			d.y
		);
		const idx = d.y.map((_, i) => i);
		const full = b.growTree(d.X, gg, hh, idx, { maxDepth: 3, lambda: 1, features: [0] });
		const gains: number[] = [];
		const walk = (n: b.BNode) => {
			if (n.split) gains.push(n.split.gain);
			if (n.left) walk(n.left);
			if (n.right) walk(n.right);
		};
		walk(full);
		const root = full.split!.gain;
		const pruned = b.growTree(d.X, gg, hh, idx, { maxDepth: 3, lambda: 1, features: [0], gamma: root + 1e-9 });
		// root has the largest gain here, so γ just above it removes everything
		if (Math.max(...gains) === root) expect(b.leaves(pruned).length).toBe(1);
		const none = b.growTree(d.X, gg, hh, idx, { maxDepth: 3, lambda: 1, features: [0], gamma: 0 });
		expect(b.leaves(none).length).toBe(b.leaves(full).length);
		for (const gm of [0.5, 1, 2])
			expect(b.leaves(b.growTree(d.X, gg, hh, idx, { maxDepth: 3, lambda: 1, features: [0], gamma: gm })).length).toBeLessThanOrEqual(b.leaves(full).length);
	});

	it('with squared loss and λ = 0 a leaf is the mean residual (plain gradient boosting)', () => {
		const y = [1, 2, 4, 7];
		const { g: sg, h: sh } = b.squaredGH([0, 0, 0, 0], y);
		const t = b.growTree([[0], [1], [2], [3]], sg, sh, [0, 1, 2, 3], { maxDepth: 1 });
		const ws = b.leaves(t).map((l) => l.w);
		// best split is {1, 2, 4} | {7}; each leaf is the mean of its targets
		expect(ws[0]).toBeCloseTo(7 / 3);
		expect(ws[1]).toBeCloseTo(7);
	});
});

describe('xgboost booster', () => {
	const d = x.makeData(8, 90);
	const opts: x.XGBOpts = { rounds: 30, lr: 0.3, maxDepth: 3, lambda: 1, gamma: 0, minChildWeight: 1, subsample: 1, colsample: 1, features: [0], seed: 1 };

	it('training log-loss decreases every round', () => {
		const m = x.fitXGB(d, opts);
		const loss = x.stagedLogit(m, d.X).map((f) =>
			b.logLoss(
				Array.from(f, (v) => b.sigmoid(v)),
				d.y
			)
		);
		for (let i = 1; i < loss.length; i++) expect(loss[i]).toBeLessThan(loss[i - 1] + 1e-9);
	});

	it('row and column subsampling respect their rates', () => {
		const m = x.fitXGB(d, { ...opts, rounds: 10, subsample: 0.5, colsample: 2 / 3, features: [0, 1, 2] });
		for (const r of m.rows) expect(r.length).toBe(45);
		for (const c of m.cols) expect(c.length).toBe(2);
		expect(new Set(m.rows.map((r) => r.join())).size).toBeGreaterThan(1);
	});

	it('learns a default direction for missing values', () => {
		const m = x.fitXGB(d, { ...opts, rounds: 1, maxDepth: 1 });
		expect(m.trees[0].split).toBeDefined();
		const missing = b.leafOf(m.trees[0], [NaN, 0, 0]);
		// missing rows here are mostly positive, so they go to the leaf with the positive weight
		expect(missing.w).toBeGreaterThan(0);
	});
});
