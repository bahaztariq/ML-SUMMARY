import { describe, expect, it } from 'vitest';
import type { Pt } from '../_clustering/data';
import { cutK, dendroLayout, heightForK, kAtHeight, largestGapK, linkage, makeData } from './hclust';
import explainer from './index';
import { k } from './state';

// Points on a line at 0, 1, 3, 7: gaps 1, 2, 4.
const line: Pt[] = [
	[0, 0],
	[1, 0],
	[3, 0],
	[7, 0]
];

describe('hierarchical clustering', () => {
	it('single linkage merges in order of nearest gaps', () => {
		const m = linkage(line, 'single');
		expect(m.map((x) => [x.a, x.b, x.height])).toEqual([
			[0, 1, 1],
			[2, 4, 2], // point 2 joins cluster {0,1} (id 4) at distance 2
			[3, 5, 4]
		]);
	});

	it('complete and average linkage use farthest / mean distances', () => {
		expect(linkage(line, 'complete').map((x) => x.height)).toEqual([1, 3, 7]);
		const avg = linkage(line, 'average').map((x) => x.height);
		expect(avg[1]).toBeCloseTo(2.5); // mean of |3−0|, |3−1|
		expect(avg[2]).toBeCloseTo((7 + 6 + 4) / 3);
	});

	it('ward heights match SciPy', () => {
		// SciPy's Ward height is sqrt(2·|A||B|/(|A|+|B|))·‖μA − μB‖:
		// {0}+{1} → 1; {0,1}+{3} → sqrt(4/3)·2.5; {0,1,3}+{7} → sqrt(6/4)·(7 − 4/3)
		const h = linkage(line, 'ward').map((x) => x.height);
		expect(h[0]).toBeCloseTo(1, 9);
		expect(h[1]).toBeCloseTo(Math.sqrt(4 / 3) * 2.5, 9);
		expect(h[2]).toBeCloseTo(Math.sqrt(6 / 4) * (7 - 4 / 3), 9);
	});

	it('merge heights never decrease', () => {
		const { points } = makeData('blobs');
		for (const l of ['single', 'complete', 'average', 'ward'] as const) {
			const m = linkage(points, l);
			for (let i = 1; i < m.length; i++) expect(m[i].height).toBeGreaterThanOrEqual(m[i - 1].height - 1e-12);
		}
	});

	it('cutting gives K clusters with stable labels', () => {
		const { points, truth } = makeData('blobs');
		const m = linkage(points, 'ward');
		const n = points.length;
		const c3 = cutK(m, n, 3).labels;
		expect(new Set(c3).size).toBe(3);
		// matches the generating blobs up to relabelling
		const map = new Map<number, number>();
		truth.forEach((t, i) => map.set(t, c3[i]));
		truth.forEach((t, i) => expect(c3[i]).toBe(map.get(t)));
		// cutting into 4 only splits one of the 3 clusters
		const c4 = cutK(m, n, 4).labels;
		c4.forEach((l, i) => l < 3 && expect(l).toBe(c3[i]));
		expect(kAtHeight(m, n, heightForK(m, n, 3))).toBe(3);
		expect(largestGapK(m, n)).toBe(3);
	});

	it('single linkage chains across the bridge; Ward does not', () => {
		const { points, truth } = makeData('chain');
		const n = points.length;
		const single = cutK(linkage(points, 'single'), n, 2).labels;
		const outlier = truth.indexOf(3);
		expect(single.filter((l) => l === single[outlier]).length).toBe(1);
		const ward = cutK(linkage(points, 'ward'), n, 2).labels;
		expect(ward[truth.indexOf(0)]).not.toBe(ward[truth.indexOf(1)]);
	});

	it('dendrogram layout places every leaf once', () => {
		const { points } = makeData('blobs');
		const { order } = dendroLayout(linkage(points, 'average'), points.length);
		expect([...order].sort((a, b) => a - b)).toEqual(points.map((_, i) => i));
	});
});

describe('hierarchical lesson', () => {
	it('every step replays and its tasks are reachable', () => {
		const s = explainer.init();
		explainer.steps.forEach((st, i) => {
			st.enter?.(s);
			const text = typeof st.body === 'function' ? st.body(s) : st.body;
			expect(text.length, `step ${i}`).toBeGreaterThan(20);
			st.quiz?.reveal?.(s);
		});
		expect(k(s)).toBe(3);
	});
});
