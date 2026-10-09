import { describe, expect, it } from 'vitest';
import {
	accuracy,
	averagePrecision,
	bestPrecisionAtRecall,
	confusion,
	f1,
	fbeta,
	fbetaPR,
	harmonicMean,
	logLoss,
	makeSamples,
	pairWins,
	pairwiseAuc,
	pointAt,
	precision,
	probit,
	recall,
	reliability,
	rocAuc,
	sweep,
	type Sample
} from './metrics.ts';

const S = (scores: number[], ys: number[]): Sample[] => scores.map((score, i) => ({ score, y: ys[i] as 0 | 1, jit: 0 }));

describe('confusion matrix metrics', () => {
	const xs = S([0.9, 0.8, 0.6, 0.55, 0.4, 0.3, 0.2, 0.1], [1, 1, 0, 1, 1, 0, 0, 0]);

	it('counts with score >= threshold as positive', () => {
		expect(confusion(xs, 0.5)).toEqual({ tp: 3, fp: 1, fn: 1, tn: 3 });
		expect(confusion(xs, 0.55)).toEqual({ tp: 3, fp: 1, fn: 1, tn: 3 });
		expect(confusion(xs, 0.56)).toEqual({ tp: 2, fp: 1, fn: 2, tn: 3 });
	});

	it('computes precision, recall, accuracy and F1', () => {
		const c = { tp: 85, fp: 40, fn: 2, tn: 873 };
		expect(precision(c)).toBeCloseTo(85 / 125);
		expect(recall(c)).toBeCloseTo(85 / 87);
		expect(accuracy(c)).toBeCloseTo(958 / 1000);
		const p = precision(c);
		const r = recall(c);
		expect(f1(c)).toBeCloseTo((2 * p * r) / (p + r), 12);
		expect(fbeta(c, 2)).toBeCloseTo(fbetaPR(p, r, 2), 12);
	});

	it('treats undefined metrics as NaN, not zero', () => {
		expect(precision({ tp: 0, fp: 0, fn: 5, tn: 5 })).toBeNaN();
	});

	it('harmonic mean collapses toward the smaller value', () => {
		expect(harmonicMean(1, 0.02)).toBeCloseTo(0.0392, 4);
		expect(harmonicMean(0.5, 0.5)).toBe(0.5);
		expect(harmonicMean(0, 0)).toBe(0);
	});
});

describe('ROC and AUC', () => {
	it('matches the textbook example (AUC = 15/16)', () => {
		const xs = S([0.1, 0.4, 0.35, 0.8, 0.2, 0.9, 0.3, 0.85], [0, 0, 1, 1, 0, 1, 0, 1]);
		expect(rocAuc(sweep(xs))).toBeCloseTo(0.9375, 12);
		expect(pairwiseAuc(xs)).toBeCloseTo(0.9375, 12);
	});

	it('trapezoid AUC equals the pairwise ranking probability, ties included', () => {
		for (const sep of [0, 0.7, 1.5, 3]) {
			const xs = makeSamples({ nPos: 40, nNeg: 70, sep, seed: 4 }).map((s) => ({ ...s, score: Math.round(s.score * 20) / 20 }));
			expect(rocAuc(sweep(xs))).toBeCloseTo(pairwiseAuc(xs), 10);
		}
	});

	it('sweep runs from (0,0) to (1,1) and pointAt agrees with confusion()', () => {
		const xs = makeSamples({ nPos: 30, nNeg: 50, sep: 1.5, seed: 2 });
		const pts = sweep(xs);
		expect(pts[0]).toMatchObject({ tpr: 0, fpr: 0 });
		expect(pts.at(-1)).toMatchObject({ tpr: 1, fpr: 1 });
		for (const thr of [0.1, 0.33, 0.5, 0.71, 0.95]) {
			const { tp, fp, fn, tn } = pointAt(pts, thr);
			expect({ tp, fp, fn, tn }).toEqual(confusion(xs, thr));
		}
	});

	it('AUC grows with separation and is ~0.5 at zero separation', () => {
		const auc = (sep: number) => rocAuc(sweep(makeSamples({ nPos: 50, nNeg: 50, sep, seed: 1 })));
		expect(Math.abs(auc(0) - 0.5)).toBeLessThan(0.03);
		expect(auc(1)).toBeLessThan(auc(2));
		expect(auc(5)).toBeGreaterThan(0.99);
	});

	it('random pairs converge to the AUC', () => {
		const xs = makeSamples({ nPos: 50, nNeg: 50, sep: 1.5, seed: 1 });
		const n = 4000;
		expect(pairWins(xs, n, 50, 50) / n).toBeCloseTo(pairwiseAuc(xs), 1);
	});

	it('AUC ignores any monotone change of the scores', () => {
		const a = makeSamples({ nPos: 40, nNeg: 40, sep: 1.2 });
		const b = makeSamples({ nPos: 40, nNeg: 40, sep: 1.2, warp: 4 });
		expect(rocAuc(sweep(b))).toBeCloseTo(rocAuc(sweep(a)), 12);
	});
});

describe('PR curve and average precision', () => {
	it('matches scikit-learn on the docs example (AP = 0.8333)', () => {
		const xs = S([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1]);
		expect(averagePrecision(sweep(xs))).toBeCloseTo(0.83333, 4);
	});

	it('AP of a random ranking is about the prevalence', () => {
		const xs = makeSamples({ nPos: 40, nNeg: 360, sep: 0, seed: 3 });
		expect(averagePrecision(sweep(xs))).toBeLessThan(0.2);
	});

	it('finds the best precision that still reaches a recall target', () => {
		const pts = sweep(makeSamples({ nPos: 40, nNeg: 80, sep: 2, seed: 1 }));
		const b = bestPrecisionAtRecall(pts, 0.9);
		expect(b.recall).toBeGreaterThanOrEqual(0.9);
		for (const p of pts) if (p.recall >= 0.9) expect(p.precision).toBeLessThanOrEqual(b.precision + 1e-12);
	});
});

describe('log-loss and calibration', () => {
	it('matches the content example', () => {
		const good = S([0.9, 0.1, 0.8, 0.95, 0.05], [1, 0, 1, 1, 0]);
		const bad = S([0.9, 0.9, 0.8, 0.2, 0.1], [1, 0, 1, 1, 0]);
		expect(logLoss(good)).toBeCloseTo(0.1073, 4);
		expect(logLoss(bad)).toBeCloseTo((-Math.log(0.9) - Math.log(0.1) - Math.log(0.8) - Math.log(0.2) - Math.log(0.9)) / 5, 12);
	});

	it('clips so a certain mistake is huge but finite', () => {
		const xs = S([0], [1]);
		expect(logLoss(xs)).toBeCloseTo(-Math.log(1e-15), 6);
	});

	it('calibrated scores (scale = sep) beat over-confident ones at the same accuracy', () => {
		const cal = makeSamples({ nPos: 150, nNeg: 150, sep: 1.6, scale: 1.6 });
		const over = makeSamples({ nPos: 150, nNeg: 150, sep: 1.6, scale: 1.6 * 5 });
		expect(accuracy(confusion(cal, 0.5))).toBe(accuracy(confusion(over, 0.5)));
		expect(logLoss(over)).toBeGreaterThan(2 * logLoss(cal));
		// observed frequency tracks the predicted probability for the calibrated model
		for (const b of reliability(cal, 5)) if (b.n > 20) expect(Math.abs(b.freq - b.meanP)).toBeLessThan(0.12);
	});

	it('probit inverts the normal CDF', () => {
		expect(probit(0.5)).toBeCloseTo(0, 9);
		expect(probit(0.975)).toBeCloseTo(1.959964, 5);
		expect(probit(0.001)).toBeCloseTo(-3.090232, 5);
	});
});
