import { describe, expect, it } from 'vitest';
import { conceptById } from '#lib/content.ts';
import { pairwiseAuc } from '../_classification/metrics.ts';
import { checkLesson, replay } from '../_classification/lessonChecks.ts';
import lesson from './index.ts';
import { aucOf, drawPairs, init, samplesOf, setSep, setThr, traced, wins } from './state.ts';

describe('ROC-AUC lesson', () => {
	it('passes the shared lesson checks', () => checkLesson(lesson, new Set(conceptById.keys())));

	it('AUC equals the pairwise-ranking probability', () => {
		for (const sep of [0, 0.8, 1.6, 3]) {
			const s = init();
			s.sep = sep;
			expect(aucOf(s)).toBeCloseTo(pairwiseAuc(samplesOf(s)), 12);
		}
	});

	it('random pairs converge to the AUC', () => {
		const s = init();
		drawPairs(s, 5000);
		expect(Math.abs(wins(s) / s.pairs - aucOf(s))).toBeLessThan(0.02);
	});

	it('the separation task can reach both AUC <= 0.55 and >= 0.99', () => {
		const s = init();
		setSep(s, 0);
		setSep(s, 4);
		expect(s.did.low && s.did.high).toBe(true);
	});

	it('the perfect-model reveal gives AUC 1, and the cube reveal leaves AUC unchanged', () => {
		expect(aucOf(replay(lesson, 3))).toBe(1);
		const before = replay(lesson, 7, false);
		const after = replay(lesson, 7, true);
		expect(after.warp).toBe(3);
		expect(aucOf(after)).toBeCloseTo(aucOf(before), 12);
	});

	it('sweeping the threshold to 0 completes the trace', () => {
		const s = replay(lesson, 2);
		expect(traced(s)).toBe(false);
		for (let t = 100; t >= 0; t--) setThr(s, t / 100);
		expect(traced(s)).toBe(true);
	});
});
