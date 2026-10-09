import { describe, expect, it } from 'vitest';
import { conceptById } from '#lib/content.ts';
import { arithmeticMean, f1, fbeta, harmonicMean, precision, recall } from '../_classification/metrics.ts';
import { checkLesson, replay } from '../_classification/lessonChecks.ts';
import lesson from './index.ts';
import { N_NEG, N_POS, TARGET_RECALL, bestAtTarget, bestF, countsOf, init } from './state.ts';

describe('precision/recall/F1 lesson', () => {
	it('passes the shared lesson checks', () => checkLesson(lesson, new Set(conceptById.keys())));

	it('F1 equals 2PR/(P+R) at every threshold', () => {
		const s = init();
		for (let i = 1; i < 100; i += 7) {
			const c = countsOf(s, i / 100);
			const p = precision(c);
			const r = recall(c);
			if (Number.isFinite(p)) expect(f1(c)).toBeCloseTo((2 * p * r) / (p + r), 12);
		}
	});

	it('flagging almost everything drives precision to about the defect rate', () => {
		const c = countsOf(replay(lesson, 4));
		expect(recall(c)).toBe(1);
		expect(Math.abs(precision(c) - N_POS / (N_POS + N_NEG))).toBeLessThan(0.05);
	});

	it('the lazy model: P = 1, R = 1/40, F1 near 5% while the average is near 51%', () => {
		const c = countsOf(replay(lesson, 5));
		expect(c.tp + c.fp).toBe(1);
		expect(precision(c)).toBe(1);
		expect(harmonicMean(1, recall(c))).toBeCloseTo(0.0488, 3);
		expect(arithmeticMean(1, recall(c))).toBeCloseTo(0.5125, 4);
	});

	it('the best precision at the recall target is reachable and beats nearby thresholds', () => {
		const b = bestAtTarget();
		const s = init();
		expect(recall(countsOf(s, b.thr))).toBeGreaterThanOrEqual(TARGET_RECALL);
		for (let i = 0; i <= 100; i++) {
			const c = countsOf(s, i / 100);
			if (recall(c) >= TARGET_RECALL) expect(precision(c)).toBeLessThanOrEqual(b.precision + 1e-12);
		}
	});

	it('beta > 1 moves the best threshold down, beta < 1 moves it up', () => {
		expect(bestF(2).thr).toBeLessThan(bestF(1).thr);
		expect(bestF(0.5).thr).toBeGreaterThan(bestF(1).thr);
		expect(fbeta({ tp: 1, fp: 0, fn: 0, tn: 0 }, 2)).toBe(1);
	});
});
