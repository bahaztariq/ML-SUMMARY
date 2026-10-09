import { describe, expect, it } from 'vitest';
import type { Pt } from '../_clustering/data';
import { kmeansLabels, makeData, silhouette, silhouetteCurve } from './silhouette';
import explainer from './index';
import { sil } from './state';

describe('silhouette', () => {
	it('matches a hand-computed example', () => {
		// Cluster 0 at x = 0, 1; cluster 1 at x = 4, 6 (all on a line).
		const pts: Pt[] = [
			[0, 0],
			[1, 0],
			[4, 0],
			[6, 0]
		];
		const r = silhouette(pts, [0, 0, 1, 1]);
		// point 0: a = 1, b = (4 + 6) / 2 = 5 → s = 4/5
		expect(r.a[0]).toBeCloseTo(1);
		expect(r.b[0]).toBeCloseTo(5);
		expect(r.s[0]).toBeCloseTo(0.8);
		// point 1: a = 1, b = (3 + 5) / 2 = 4 → s = 3/4
		expect(r.s[1]).toBeCloseTo(0.75);
		// point 2: a = 2, b = (4 + 3) / 2 = 3.5 → s = 1.5/3.5
		expect(r.s[2]).toBeCloseTo(1.5 / 3.5);
		// point 3: a = 2, b = (6 + 5) / 2 = 5.5 → s = 3.5/5.5
		expect(r.s[3]).toBeCloseTo(3.5 / 5.5);
		expect(r.mean).toBeCloseTo((0.8 + 0.75 + 1.5 / 3.5 + 3.5 / 5.5) / 4);
	});

	it('gives singletons s = 0 and misassigned points a negative score', () => {
		const pts: Pt[] = [
			[0, 0],
			[1, 0],
			[10, 0],
			[11, 0],
			[20, 0]
		];
		const r = silhouette(pts, [0, 0, 1, 1, 2]);
		expect(r.s[4]).toBe(0);
		const wrong = silhouette(pts, [0, 1, 1, 1, 2]); // point 1 put with the far cluster
		expect(wrong.s[1]).toBeLessThan(0);
	});

	it('picks K = 4 on the four blobs', () => {
		const pts = makeData('blobs').points;
		const c = silhouetteCurve(pts, 7);
		expect(c.indexOf(Math.max(...c)) + 2).toBe(4);
	});

	it('scores the K-Means split of the moons above the true moons', () => {
		const { points, truth } = makeData('moons');
		expect(silhouette(points, kmeansLabels(points, 2)).mean).toBeGreaterThan(silhouette(points, truth).mean);
	});
});

describe('silhouette lesson', () => {
	it('every step replays; the misassignment quiz makes s(i) negative', () => {
		const s = explainer.init();
		explainer.steps.forEach((st, i) => {
			st.enter?.(s);
			const text = typeof st.body === 'function' ? st.body(s) : st.body;
			expect(text.length, `step ${i}`).toBeGreaterThan(20);
			st.quiz?.reveal?.(s);
			if (i === 4) expect(sil(s).s[s.selected]).toBeLessThan(0);
		});
	});
});
