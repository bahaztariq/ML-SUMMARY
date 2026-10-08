import { describe, expect, it } from 'vitest';
import { assign, elbow, inertia, makeData, plusPlusInit, randomInit, run, update, type Pt } from './kmeans';

describe('kmeans', () => {
	const pts = makeData('blobs', 7);

	it('generates deterministic data', () => {
		expect(makeData('blobs', 7)).toEqual(pts);
		expect(pts.length).toBe(280);
	});

	it('never increases inertia across an assign/update round', () => {
		let cs = randomInit(pts, 4, 3);
		let labels = assign(pts, cs);
		let prev = inertia(pts, labels, cs);
		for (let i = 0; i < 10; i++) {
			cs = update(pts, labels, cs);
			expect(inertia(pts, labels, cs)).toBeLessThanOrEqual(prev + 1e-9);
			labels = assign(pts, cs);
			const now = inertia(pts, labels, cs);
			expect(now).toBeLessThanOrEqual(prev + 1e-9);
			prev = now;
		}
	});

	it('update moves centroids to the mean of their points', () => {
		const p: Pt[] = [
			[0, 0],
			[2, 0],
			[10, 10]
		];
		expect(update(p, [0, 0, 1], [[5, 5], [0, 0]])).toEqual([
			[1, 0],
			[10, 10]
		]);
	});

	it('k-means++ finds the four blobs', () => {
		const r = run(pts, plusPlusInit(pts, 4, 1));
		expect(new Set(r.labels).size).toBe(4);
		expect(r.inertia).toBeLessThan(15);
	});

	it('elbow curve is non-increasing with a bend at K=4', () => {
		const e = elbow(pts, 6);
		for (let i = 1; i < e.length; i++) expect(e[i]).toBeLessThanOrEqual(e[i - 1] + 1e-9);
		const drop = (k: number) => e[k - 2] - e[k - 1];
		expect(drop(4)).toBeGreaterThan(3 * drop(5));
	});
});
