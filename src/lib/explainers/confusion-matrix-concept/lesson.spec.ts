import { describe, expect, it } from 'vitest';
import { conceptById } from '#lib/content.ts';
import { accuracy, recall } from '../_classification/metrics.ts';
import { checkLesson, replay } from '../_classification/lessonChecks.ts';
import lesson from './index.ts';
import { cheapest, costOf, countsOf, init } from './state.ts';

describe('confusion-matrix lesson', () => {
	it('passes the shared lesson checks', () => checkLesson(lesson, new Set(conceptById.keys())));

	it('row totals stay fixed while the threshold moves', () => {
		const s = init();
		for (const t of [0, 0.2, 0.5, 0.8, 1]) {
			const c = countsOf(s, t);
			expect(c.tp + c.fn).toBe(60);
			expect(c.fp + c.tn).toBe(60);
		}
	});

	it('raising the threshold trades false positives for false negatives (quiz)', () => {
		const s = init();
		const a = countsOf(s, 0.5);
		const b = countsOf(s, 0.75);
		expect(b.fp).toBeLessThan(a.fp);
		expect(b.fn).toBeGreaterThan(a.fn);
	});

	it('"everyone healthy" scores 95% accuracy and 0 recall on the rare data', () => {
		const s = replay(lesson, 6);
		const c = countsOf(s);
		expect(accuracy(c)).toBeCloseTo(0.95, 10);
		expect(recall(c)).toBe(0);
	});

	it('the spam filter wants a much higher threshold than screening', () => {
		const med = replay(lesson, 7);
		const spam = replay(lesson, 8);
		expect(cheapest(spam).thr).toBeGreaterThan(cheapest(med).thr + 0.3);
		expect(costOf(spam)).toBe(cheapest(spam).cost); // the reveal lands on the optimum
	});

	it('the FN = 0 task is reachable with the slider', () => {
		const s = init();
		expect([...Array(101).keys()].some((i) => countsOf(s, i / 100).fn === 0)).toBe(true);
	});
});
