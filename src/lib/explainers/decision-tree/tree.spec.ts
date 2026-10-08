import { describe, expect, it } from 'vitest';
import { accuracy, bestSplit, fit, gini, impurityCurve, makeData, regions, scoreSplit, stats, type Data, type Node } from './tree';

describe('decision tree', () => {
	it('computes Gini impurity', () => {
		expect(gini([10, 0])).toBe(0);
		expect(gini([5, 5])).toBeCloseTo(0.5);
		expect(gini([3, 1])).toBeCloseTo(1 - 0.75 ** 2 - 0.25 ** 2);
		expect(gini([0, 0])).toBe(0);
	});

	it('scores a split by weighted child impurity', () => {
		const d: Data = { X: [[0, 0], [1, 0], [2, 0], [3, 0]], y: [0, 0, 1, 0] };
		const s = scoreSplit(d, { f: 0, thr: 1.5 });
		expect(s.left).toEqual([2, 0]);
		expect(s.right).toEqual([1, 1]);
		expect(s.weighted).toBeCloseTo(0.5 * 0 + 0.5 * 0.5);
		expect(s.gain).toBeCloseTo(gini([3, 1]) - 0.25);
	});

	it('best split finds the obvious threshold on separable data', () => {
		const X: [number, number][] = [];
		const y: number[] = [];
		for (let i = 0; i < 20; i++) {
			X.push([Math.sin(i * 7) * 3, i / 10]); // x₁ is noise, x₂ separates at 1.0
			y.push(i / 10 > 1 ? 1 : 0);
		}
		const b = bestSplit({ X, y })!;
		expect(b.f).toBe(1);
		expect(b.thr).toBeCloseTo(1.05);
		expect(b.weighted).toBe(0);
	});

	it('impurity curve has one candidate per gap between distinct values', () => {
		const d = makeData(21, 150, 0.1);
		const c = impurityCurve(d, 0);
		expect(c.length).toBe(149);
		for (let i = 1; i < c.length; i++) expect(c[i].thr).toBeGreaterThan(c[i - 1].thr);
	});

	it('respects max_depth and min_samples_leaf', () => {
		const d = makeData(21, 150, 0.1);
		for (const maxDepth of [0, 1, 2, 3, 5]) expect(stats(fit(d, { maxDepth })).depth).toBeLessThanOrEqual(maxDepth);
		expect(stats(fit(d, { maxDepth: 0 })).leaves).toBe(1);
		const leaves = (n: Node): Node[] => (n.left && n.right ? [...leaves(n.left), ...leaves(n.right)] : [n]);
		for (const l of leaves(fit(d, { minLeaf: 8 }))) expect(l.n).toBeGreaterThanOrEqual(8);
	});

	it('reaches 100% training accuracy at unlimited depth on distinct points, but overfits', () => {
		const train = makeData(21, 150, 0.1);
		const test = makeData(921, 500, 0.1);
		const full = fit(train);
		expect(accuracy(full, train)).toBe(1);
		expect(accuracy(fit(train, { maxDepth: 3 }), test)).toBeGreaterThan(accuracy(full, test));
	});

	it('leaf regions tile the plane and each leaf is a box', () => {
		const d = makeData(21, 150, 0.1);
		const t = fit(d, { maxDepth: 4 });
		const r = regions(t, { x0: -1, x1: 1, y0: -1, y1: 1 });
		let area = 0;
		for (const { node, rect } of r.values()) if (!node.left) area += (rect.x1 - rect.x0) * (rect.y1 - rect.y0);
		expect(area).toBeCloseTo(4);
	});
});
