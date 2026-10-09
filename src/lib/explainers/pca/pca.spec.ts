import { describe, expect, it } from 'vitest';
import * as la from '../_dimred/linalg.ts';
import { angleGap, angleOf, inUnits, makeBody, makeCorr, makePancake, unit } from './pca.ts';

describe('pca', () => {
	const X3 = makePancake().X;
	const fit3 = la.pca(X3);

	it('generates deterministic data', () => {
		expect(makeCorr()).toEqual(makeCorr());
		expect(X3.length).toBe(210);
	});

	it('eigSym recovers a known decomposition', () => {
		const { values, vectors } = la.eigSym([
			[2, 1],
			[1, 2]
		]);
		expect(values[0]).toBeCloseTo(3);
		expect(values[1]).toBeCloseTo(1);
		expect(Math.abs(vectors[0][0])).toBeCloseTo(Math.SQRT1_2);
	});

	it('components are orthonormal and ordered by variance', () => {
		const V = fit3.vectors;
		for (let a = 0; a < 3; a++)
			for (let b = 0; b < 3; b++) expect(la.dot(V[a], V[b])).toBeCloseTo(a === b ? 1 : 0, 9);
		expect(fit3.values[0]).toBeGreaterThanOrEqual(fit3.values[1]);
		expect(fit3.values[1]).toBeGreaterThanOrEqual(fit3.values[2]);
		// each eigenvector satisfies C v = λ v
		V.forEach((v, k) => {
			const Cv = fit3.cov.map((r) => la.dot(r, v));
			Cv.forEach((x, j) => expect(x).toBeCloseTo(fit3.values[k] * v[j], 9));
		});
		expect(fit3.ratio.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
	});

	it('PC1 beats every other direction in 2-D', () => {
		const fit = la.pca(makeCorr());
		const best = la.varianceAlong(fit.cov, fit.vectors[0]);
		for (let d = 0; d < 180; d += 3) expect(la.varianceAlong(fit.cov, unit(d))).toBeLessThanOrEqual(best + 1e-9);
		expect(best).toBeCloseTo(fit.values[0]);
		expect(angleGap(angleOf(fit.vectors[0]), angleOf(fit.vectors[1]))).toBeCloseTo(90);
	});

	it('reconstruction error equals the sum of dropped eigenvalues', () => {
		for (const k of [0, 1, 2, 3]) {
			const R = la.reconstruct(la.project(X3, fit3, k), fit3);
			const dropped = fit3.values.slice(k).reduce((a, b) => a + b, 0);
			expect(la.reconstructionError(X3, R)).toBeCloseTo(dropped, 9);
		}
	});

	it('units decide PC1 unless features are standardized', () => {
		const B = makeBody();
		const pc1 = (u: 'mm' | 'm' | 'z') => la.pca(inUnits(B, u)).vectors[0];
		expect(Math.abs(pc1('mm')[0])).toBeGreaterThan(0.98); // height dominates
		expect(Math.abs(pc1('m')[1])).toBeGreaterThan(0.99); // weight dominates
		expect(Math.abs(pc1('z')[0])).toBeCloseTo(Math.SQRT1_2, 2); // diagonal
	});
});
