import { describe, expect, it } from 'vitest';
import { cFactor, finalBox, fitForest, flagged, isolate, makeData, meanPath, score, type Pt } from './iforest.ts';

const blobs = makeData('blobs');
const OUT = blobs.truth.indexOf(true);
/** The point nearest the first cluster's centre. */
const NORMAL = blobs.X.reduce((b, p, i) => (Math.hypot(p[0] + 0.42, p[1] - 0.3) < Math.hypot(blobs.X[b][0] + 0.42, blobs.X[b][1] - 0.3) ? i : b), 0);

const avgCuts = (target: number) => {
	let s = 0;
	for (let seed = 1; seed <= 200; seed++) s += isolate(blobs.X, target, seed).length;
	return s / 200;
};

describe('isolation forest', () => {
	it('generates deterministic data', () => {
		expect(makeData('blobs')).toEqual(blobs);
		expect(blobs.truth.filter(Boolean).length).toBe(8);
	});

	it('c(n) matches the paper', () => {
		expect(cFactor(1)).toBe(0);
		expect(cFactor(2)).toBe(1);
		expect(cFactor(256)).toBeCloseTo(10.24, 1);
	});

	it('isolates an obvious outlier in far fewer cuts than a central point', () => {
		const out = avgCuts(OUT);
		const normal = avgCuts(NORMAL);
		expect(out).toBeLessThan(normal / 2);
		// the final cell contains the target and nothing else
		const cuts = isolate(blobs.X, NORMAL, 3);
		expect(cuts[cuts.length - 1].left).toBe(1);
		const b = finalBox(cuts, blobs.X, NORMAL);
		const inside = blobs.X.filter((p) => p[0] >= b.x0 && p[0] <= b.x1 && p[1] >= b.y0 && p[1] <= b.y1);
		expect(inside).toEqual([blobs.X[NORMAL]]);
	});

	it('scores planted outliers high and cluster cores low', () => {
		const F = fitForest(blobs.X, 100, 256, 1);
		expect(score(F, blobs.X[OUT])).toBeGreaterThan(0.6);
		expect(score(F, blobs.X[NORMAL])).toBeLessThan(0.45);
		expect(meanPath(F, blobs.X[OUT])).toBeLessThan(meanPath(F, blobs.X[NORMAL]));
		const scores = blobs.X.map((p) => score(F, p));
		const { idx } = flagged(scores, 10 / blobs.X.length);
		const caught = [...idx].filter((i) => blobs.truth[i]).length;
		expect(caught).toBe(8);
	});

	it('masking: a tight clump of anomalies scores higher with small subsamples', () => {
		const d = makeData('clump');
		const clump = d.X.map((_, i) => i).filter((i) => d.truth[i]).slice(0, 25);
		const mean = (psi: number) => {
			const F = fitForest(d.X, 100, psi, 1);
			return clump.reduce((a, i) => a + score(F, d.X[i]), 0) / clump.length;
		};
		const lone = (psi: number) => score(fitForest(d.X, 100, psi, 1), d.X[d.X.length - 2]);
		expect(mean(256)).toBeLessThan(lone(256));
		expect(mean(16)).toBeGreaterThan(mean(256) + 0.08);
	});

	it('local anomalies next to a dense cluster score below sparse-cluster edges', () => {
		const d = makeData('local');
		const F = fitForest(d.X, 100, 256, 1);
		const scores = d.X.map((p: Pt) => score(F, p));
		const local = d.X.map((_, i) => i).filter((i) => d.truth[i]);
		const normalAbove = scores.filter((s, i) => !d.truth[i] && s > Math.max(...local.map((j) => scores[j]))).length;
		expect(normalAbove).toBeGreaterThan(3);
	});
});
