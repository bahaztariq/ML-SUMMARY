import { describe, expect, it } from 'vitest';
import { conceptById } from '#lib/content.ts';
import { penalty } from '../_classification/metrics.ts';
import { checkLesson } from '../_classification/lessonChecks.ts';
import lesson from './index.ts';
import { OVER, accOf, bestConf, binsOf, init, lossAt } from './state.ts';

describe('log-loss lesson', () => {
	it('passes the shared lesson checks', () => checkLesson(lesson, new Set(conceptById.keys())));

	it('penalty values quoted in the narration', () => {
		expect(penalty(1)).toBeCloseTo(0, 12);
		expect(penalty(0.5)).toBeCloseTo(0.693, 3);
		expect(penalty(0.1)).toBeCloseTo(2.303, 3);
		expect(penalty(0.01) / penalty(0.4)).toBeCloseTo(5.03, 1);
		expect(penalty(0.0001)).toBeCloseTo(9.21, 2);
	});

	it('confidence never changes accuracy, and log-loss is lowest near x1 (calibrated)', () => {
		const s = init();
		const acc = accOf(s);
		for (const k of [0.2, 0.4, 2, OVER]) {
			s.conf = k;
			expect(accOf(s)).toBe(acc);
		}
		expect(Math.abs(bestConf()[0] - 1)).toBeLessThanOrEqual(0.2);
		expect(lossAt(OVER)).toBeGreaterThan(1.8 * lossAt(1));
	});

	it('the over-confident model is visibly mis-calibrated at the top bin', () => {
		const s = init();
		const cal = binsOf(s)[9];
		s.conf = OVER;
		const over = binsOf(s)[9];
		expect(Math.abs(cal.freq - cal.meanP)).toBeLessThan(0.05);
		expect(over.meanP - over.freq).toBeGreaterThan(0.08);
	});
});
