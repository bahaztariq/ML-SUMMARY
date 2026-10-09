import { describe, expect, it } from 'vitest';
import * as dt from '../decision-tree/tree.ts';
import * as c from './cat.ts';

describe('target statistics', () => {
	// rows: city A twice, city B once
	const d: c.CatData = { cat: [0, 1, 0, 2], y: [1, 0, 0, 1] };

	it('greedy target encoding includes the row’s own label (a singleton is encoded as its label)', () => {
		const e = c.encodeGreedy(d, 0);
		expect(e[0]).toBeCloseTo(0.5);
		expect(e[2]).toBeCloseTo(0.5);
		expect(e[1]).toBe(0);
		expect(e[3]).toBe(1);
	});

	it('ordered target statistics only use earlier rows of the permutation', () => {
		const p = 0.5;
		const a = 1;
		const e = c.encodeOrdered(d, [0, 1, 2, 3], a, p);
		expect(e[0]).toBeCloseTo((0 + a * p) / (0 + a)); // nothing before it
		expect(e[1]).toBeCloseTo(p);
		expect(e[2]).toBeCloseTo((1 + a * p) / (1 + a)); // sees row 0 only
		expect(e[3]).toBeCloseTo(p);
		// changing a row's own label never changes its own encoding
		for (let i = 0; i < d.y.length; i++) {
			const flipped = { cat: d.cat, y: d.y.map((v, j) => (j === i ? 1 - v : v)) };
			expect(c.encodeOrdered(flipped, [0, 1, 2, 3], a, p)[i]).toBeCloseTo(e[i]);
		}
	});

	it('ordered statistics depend only on rows earlier in the given order', () => {
		const big = c.makeChurn(6, 300);
		const perm = c.permutation(300, 1);
		const e = c.encodeOrdered(big, perm, 1, 0.35);
		const k = 150;
		const i = perm[k];
		const before = perm.slice(0, k).filter((j) => big.cat[j] === big.cat[i]);
		const s = before.reduce((acc, j) => acc + big.y[j], 0);
		expect(e[i]).toBeCloseTo((s + 0.35) / (before.length + 1));
	});

	it('greedy encoding leaks: great on train, much worse on test; ordered does not', () => {
		const train = c.makeChurn(6, 300);
		const test = c.makeChurn(1006, 1000);
		const greedyTrain = c.auc(c.encodeGreedy(train, 0), train.y);
		const testAuc = c.auc(c.encodeTest(train, test, 1), test.y);
		const orderedTrain = c.auc(c.encodeOrdered(train, c.permutation(300, 1), 1), train.y);
		expect(greedyTrain - testAuc).toBeGreaterThan(0.15);
		expect(Math.abs(orderedTrain - testAuc)).toBeLessThan(0.06);
	});

	it('computes AUC with ties', () => {
		expect(c.auc([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1])).toBeCloseTo(0.75);
		expect(c.auc([1, 1, 1, 1], [0, 1, 0, 1])).toBeCloseTo(0.5);
	});
});

describe('oblivious trees', () => {
	const d = dt.makeData(21, 200, 0.05);

	it('uses one rule per level and has 2^depth leaves', () => {
		for (const depth of [1, 2, 3, 4]) {
			const t = c.fitOblivious(d.X, d.y, depth);
			expect(t.levels.length).toBe(depth);
			expect(t.values.length).toBe(2 ** depth);
			expect(t.counts.reduce((a, b) => a + b, 0)).toBe(200);
		}
	});

	it('leaf index is the binary code of the comparisons', () => {
		const levels: c.Level[] = [
			{ f: 0, thr: 0 },
			{ f: 1, thr: 0 }
		];
		expect(c.leafIndex(levels, [-1, -1])).toBe(0);
		expect(c.leafIndex(levels, [-1, 1])).toBe(1);
		expect(c.leafIndex(levels, [1, -1])).toBe(2);
		expect(c.leafIndex(levels, [1, 1])).toBe(3);
	});

	it('fits the data comparably to a regular tree of the same depth', () => {
		const test = dt.makeData(921, 600, 0.05);
		const t = c.fitOblivious(d.X, d.y, 3);
		const acc = test.X.filter((p, i) => c.predictOblivious(t, p) === test.y[i]).length / test.y.length;
		expect(acc).toBeGreaterThan(dt.accuracy(dt.fit(d, { maxDepth: 3 }), test) - 0.03);
	});
});
