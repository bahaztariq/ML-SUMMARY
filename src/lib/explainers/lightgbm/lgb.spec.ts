import { describe, expect, it } from 'vitest';
import { mulberry32 } from '#lib/viz/canvas.ts';
import * as b from '../_ensembles/boost.ts';
import * as l from './lgb.ts';

const d = l.makeData(9, 300, 0.08);
const all = d.y.map((_, i) => i);
const m0 = d.y.reduce((a, c) => a + c, 0) / d.y.length;
const { g, h } = b.logisticGH(
	d.y.map(() => b.logit(m0)),
	d.y
);

describe('histogram binning', () => {
	it('makes at most max_bin roughly equal-count bins', () => {
		const x = d.X.map((p) => p[0]);
		for (const maxBin of [2, 4, 16, 64]) {
			const e = l.binEdges(x, maxBin);
			expect(e.length).toBeLessThanOrEqual(maxBin - 1);
			const counts = new Array(e.length + 1).fill(0);
			for (const v of x) counts[l.binOf(e, v)]++;
			const target = x.length / (e.length + 1);
			for (const c of counts) expect(Math.abs(c - target)).toBeLessThanOrEqual(target * 0.1 + 1);
		}
	});

	it('bin index agrees with the threshold test x <= edge', () => {
		const e = l.binEdges(
			d.X.map((p) => p[1]),
			16
		);
		for (const p of d.X) for (let k = 0; k < e.length; k++) expect(l.binOf(e, p[1]) <= k).toBe(p[1] <= e[k]);
	});

	it('the histogram scan with one bin per value equals the exact split search', () => {
		const exactBins = l.binData(d.X, 100000);
		const hs = l.bestHistSplit(exactBins, g, h, all, { minDataInLeaf: 1, lambda: 0 })!;
		const ex = b.bestSplit(d.X, g, h, all, { maxDepth: 1, lambda: 0 })!;
		expect(hs.gain).toBeCloseTo(ex.gain, 9);
		expect(hs.thr).toBeCloseTo(ex.thr, 9);
	});

	it('fewer bins can only lose gain, and lose little at moderate bin counts', () => {
		const best = (maxBin: number) => l.bestHistSplit(l.binData(d.X, maxBin), g, h, all, { minDataInLeaf: 5, lambda: 0 })!.gain;
		const exact = best(100000);
		for (const k of [4, 8, 16, 64]) expect(best(k)).toBeLessThanOrEqual(exact + 1e-9);
		expect(best(64)).toBeGreaterThan(0.97 * exact);
	});
});

describe('tree growth', () => {
	const bins = l.binData(d.X, 64);
	const opts = { numLeaves: 8, maxDepth: Infinity, minDataInLeaf: 5, lambda: 0 };
	const leafwise = l.growHist(bins, g, h, all, { ...opts, policy: 'leaf' });
	const levelwise = l.growHist(bins, g, h, all, { ...opts, policy: 'level' });
	const depth = (t: l.LNode): number => (t.left && t.right ? 1 + Math.max(depth(t.left), depth(t.right)) : 0);
	const leafN = (t: l.LNode): number => (t.left && t.right ? leafN(t.left) + leafN(t.right) : 1);

	it('both policies use the same leaf budget', () => {
		expect(leafN(leafwise)).toBe(8);
		expect(leafN(levelwise)).toBe(8);
	});

	it('level-wise is balanced, leaf-wise goes deeper and reduces the loss more', () => {
		expect(depth(levelwise)).toBe(3);
		expect(depth(leafwise)).toBeGreaterThan(3);
		expect(l.totalGain(leafwise)).toBeGreaterThan(l.totalGain(levelwise));
	});

	it('max_depth caps leaf-wise growth', () => {
		const capped = l.growHist(bins, g, h, all, { ...opts, numLeaves: 64, maxDepth: 3, policy: 'leaf' });
		expect(depth(capped)).toBeLessThanOrEqual(3);
		expect(leafN(capped)).toBeLessThanOrEqual(8);
	});
});

describe('GOSS', () => {
	it('keeps the top rows by |g|, samples the rest and up-weights them by (1 − a)/b', () => {
		const s = l.goss(g, 0.2, 0.1, mulberry32(1));
		expect(s.top.length).toBe(60);
		expect(s.sampled.length).toBe(30);
		const minTop = Math.min(...s.top.map((i) => Math.abs(g[i])));
		const others = all.filter((i) => !s.top.includes(i));
		expect(Math.max(...others.map((i) => Math.abs(g[i])))).toBeLessThanOrEqual(minTop);
		for (const i of s.sampled) expect(s.weights[i]).toBeCloseTo(8);
		expect(s.weights.filter((w) => w === 0).length).toBe(300 - 90);
	});

	it('the weighted gradient sum is an unbiased estimate of the full sum', () => {
		const full = g.reduce((a, c) => a + c, 0);
		let est = 0;
		const T = 400;
		for (let k = 0; k < T; k++) {
			const s = l.goss(g, 0.2, 0.1, mulberry32(k + 1));
			est += s.rows.reduce((a, i) => a + g[i] * s.weights[i], 0);
		}
		expect(est / T).toBeCloseTo(full, 0);
	});
});

describe('boosting', () => {
	it('training log-loss decreases every round', () => {
		const m = l.fitLGB(d, { rounds: 30, lr: 0.1, maxBin: 64, numLeaves: 8, maxDepth: Infinity, minDataInLeaf: 5, lambda: 0, policy: 'leaf', goss: null, seed: 1 });
		const loss = l.stagedLogit(m, d.X).map((z) =>
			b.logLoss(
				Array.from(z, (v) => b.sigmoid(v)),
				d.y
			)
		);
		for (let i = 1; i < loss.length; i++) expect(loss[i]).toBeLessThan(loss[i - 1] + 1e-9);
	});
});
