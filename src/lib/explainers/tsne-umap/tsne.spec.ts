import { describe, expect, it } from 'vitest';
import * as la from '../_dimred/linalg.ts';
import {
	STACKED,
	TIGHT,
	TSNE_ITERS,
	UMAP_EPOCHS,
	WIDE,
	fuzzyGraph,
	initRun,
	initUmap,
	jointP,
	kl,
	makeClusters,
	neighbourKept,
	rowP,
	spread,
	sqDist,
	tsneStep,
	umapEpoch
} from './tsne.ts';

const { X, y } = makeClusters();
const n = X.length;
const D = sqDist(X);
const members = (k: number) => y.map((c, i) => (c === k ? i : -1)).filter((i) => i >= 0);

/** Leave-one-out 1-NN accuracy of the cluster labels in a 2-D layout. */
function nnAccuracy(Y: ArrayLike<number>) {
	let ok = 0;
	for (let i = 0; i < n; i++) {
		let best = -1;
		let bd = Infinity;
		for (let j = 0; j < n; j++) {
			if (j === i) continue;
			const d = (Y[2 * i] - Y[2 * j]) ** 2 + (Y[2 * i + 1] - Y[2 * j + 1]) ** 2;
			if (d < bd) {
				bd = d;
				best = j;
			}
		}
		if (y[best] === y[i]) ok++;
	}
	return ok / n;
}

describe('t-SNE', () => {
	it('generates deterministic data', () => {
		expect(makeClusters()).toEqual({ X, y });
		expect(n).toBe(200);
	});

	it('calibrates each Gaussian to the requested perplexity', () => {
		for (const perp of [5, 30]) {
			const { p } = rowP(D, n, 7, perp);
			let H = 0;
			for (const v of p) if (v > 0) H -= v * Math.log(v);
			expect(Math.exp(H)).toBeCloseTo(perp, 2);
		}
		const P = jointP(D, n, 30);
		expect(P.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
	});

	it('PCA stacks the two clusters that differ only along x₃', () => {
		const Z = la.project(X, la.pca(X), 2).flat();
		const [a, b] = STACKED;
		const ca = [0, 1].map((d) => members(a).reduce((s, i) => s + Z[2 * i + d], 0) / 40);
		const cb = [0, 1].map((d) => members(b).reduce((s, i) => s + Z[2 * i + d], 0) / 40);
		expect(Math.hypot(ca[0] - cb[0], ca[1] - cb[1])).toBeLessThan(0.3);
		expect(nnAccuracy(Z)).toBeLessThan(0.85);
	});

	it('KL divergence decreases and the clusters separate', () => {
		const P = jointP(D, n, 30);
		const r = initRun(n, 1);
		const k0 = kl(P, r.Y, n);
		let prev = Infinity;
		const trace: number[] = [];
		while (r.iter < TSNE_ITERS) {
			tsneStep(r, P);
			if (r.iter >= 150 && r.iter % 50 === 0) {
				const k = kl(P, r.Y, n);
				trace.push(k);
				expect(k).toBeLessThanOrEqual(prev + 1e-3);
				prev = k;
			}
		}
		expect(prev).toBeLessThan(k0 * 0.5);
		expect(nnAccuracy(r.Y)).toBeGreaterThan(0.97);
		expect(neighbourKept(D, r.Y, n)).toBeGreaterThan(0.5);
		// the 4× wider cluster is not 4× wider in the map
		const ratioIn = spread(X.flat(), 3, members(WIDE)) / spread(X.flat(), 3, members(TIGHT));
		const ratioOut = spread(r.Y, 2, members(WIDE)) / spread(r.Y, 2, members(TIGHT));
		expect(ratioIn).toBeGreaterThan(3.5);
		expect(ratioOut).toBeLessThan(2.2);
	});

	it('is deterministic for a seed', () => {
		const P = jointP(D, n, 30);
		const a = initRun(n, 3);
		const b = initRun(n, 3);
		for (let i = 0; i < 30; i++) {
			tsneStep(a, P);
			tsneStep(b, P);
		}
		expect(Array.from(a.Y)).toEqual(Array.from(b.Y));
	});
});

describe('UMAP', () => {
	it('builds a symmetric fuzzy k-NN graph and separates the clusters', () => {
		const G = fuzzyGraph(D, n, 15);
		expect(G.knn[0].length).toBe(15);
		expect(G.edges.every((e) => e.w > 0 && e.w <= 1)).toBe(true);
		const r = initUmap(n, 1);
		while (r.iter < UMAP_EPOCHS) umapEpoch(r, G, 1);
		expect(nnAccuracy(r.Y)).toBeGreaterThan(0.95);
	});
});
