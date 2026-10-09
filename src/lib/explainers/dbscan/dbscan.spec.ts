import { describe, expect, it } from 'vitest';
import type { Pt } from '../_clustering/data';
import { dbscan, kDistances, makeData, neighbourhoods } from './dbscan';
import explainer from './index';
import { findPoint, growDone, growNext } from './state';

describe('dbscan', () => {
	// A tight square of 5 points, one point just outside it, and one far away.
	const toy: Pt[] = [
		[0, 0],
		[0.1, 0],
		[0, 0.1],
		[0.1, 0.1],
		[0.05, 0.05],
		[0.25, 0.05],
		[2, 2]
	];

	it('neighbourhoods include the point itself', () => {
		const n = neighbourhoods(toy, 0.16);
		expect(n[6]).toEqual([6]);
		expect(n[4].length).toBe(5);
	});

	it('labels core, border and noise on a toy set', () => {
		const r = dbscan(toy, 0.16, 4);
		expect(r.kind.slice(0, 5)).toEqual(['core', 'core', 'core', 'core', 'core']);
		expect(r.kind[5]).toBe('border'); // within ε of [0.1, 0.1] and [0.1, 0] only
		expect(r.kind[6]).toBe('noise');
		expect(r.labels).toEqual([0, 0, 0, 0, 0, 0, -1]);
		expect(r.nClusters).toBe(1);
		expect(r.counts).toEqual({ core: 5, border: 1, noise: 1 });
	});

	it('growth order claims every clustered point exactly once, from a core point', () => {
		const { points } = makeData('moons');
		const r = dbscan(points, 0.18, 5);
		const claimed = r.order.map((e) => e.i);
		expect(new Set(claimed).size).toBe(claimed.length);
		expect(claimed.length).toBe(r.labels.filter((l) => l >= 0).length);
		for (const e of r.order) if (e.from >= 0) expect(r.kind[e.from]).toBe('core');
	});

	it('k-distance with k = minPts − 1 counts the core points', () => {
		const { points } = makeData('moons');
		const kd = kDistances(points, 4);
		for (const eps of [0.08, 0.12, 0.2]) {
			expect(kd.filter((d) => d <= eps).length).toBe(dbscan(points, eps, 5).counts.core);
		}
	});

	it('finds the two moons and the two rings with a suitable ε', () => {
		expect(dbscan(makeData('moons').points, 0.18, 5).nClusters).toBe(2);
		expect(dbscan(makeData('rings').points, 0.18, 5).nClusters).toBe(2);
	});

	it('uneven densities: small ε loses the sparse cluster, large ε merges the tight ones', () => {
		const { points, truth } = makeData('density');
		const small = dbscan(points, 0.08, 5);
		const sparseNoise = small.labels.filter((l, i) => truth[i] === 2 && l === -1).length;
		expect(sparseNoise).toBeGreaterThan(35);
		const big = dbscan(points, 0.22, 5);
		const tightA = big.labels[truth.indexOf(0)];
		const tightB = big.labels[truth.indexOf(1)];
		expect(tightA).toBe(tightB);
	});
});

describe('dbscan lesson', () => {
	it('every step replays without errors and the quiz point is a 3-neighbour border point', () => {
		const s = explainer.init();
		explainer.steps.forEach((st, i) => {
			st.enter?.(s);
			const text = typeof st.body === 'function' ? st.body(s) : st.body;
			expect(text.length, `step ${i}`).toBeGreaterThan(20);
			if (i === 3) {
				expect(s.selected).toBeGreaterThanOrEqual(0);
				expect(findPoint(s, (j, r) => j === s.selected && r.kind[j] === 'border' && r.nbrs[j].length === 3)).toBe(s.selected);
			}
			if (i === 4) {
				let guard = 0;
				while (!growDone(s) && guard++ < 1000) growNext(s);
				expect(st.task!.done(s)).toBe(true);
			}
			st.quiz?.reveal?.(s);
		});
	});
});
