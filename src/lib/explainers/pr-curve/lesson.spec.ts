import { describe, expect, it } from 'vitest';
import { conceptById } from '#lib/content.ts';
import { precision, recall } from '../_classification/metrics.ts';
import { checkLesson, replay } from '../_classification/lessonChecks.ts';
import lesson from './index.ts';
import { PREVALENCES, apOf, aucOf, bestAtPrecision, countsOf, init, prevalenceOf } from './state.ts';

describe('PR-curve lesson', () => {
	it('passes the shared lesson checks', () => checkLesson(lesson, new Set(conceptById.keys())));

	it('a random model has AP close to the prevalence', () => {
		const s = replay(lesson, 2);
		expect(s.sep).toBe(0);
		expect(Math.abs(apOf(s) - prevalenceOf(s))).toBeLessThan(0.05);
	});

	it('rarer positives: ROC AUC barely moves while AP collapses', () => {
		const s = init();
		s.prev = 0;
		const auc0 = aucOf(s);
		const ap0 = apOf(s);
		s.prev = PREVALENCES.length - 1;
		expect(Math.abs(aucOf(s) - auc0)).toBeLessThan(0.02);
		expect(apOf(s)).toBeLessThan(ap0 - 0.4);
	});

	it('at 1% positives and 80% recall, under half the alerts are real (quiz)', () => {
		const c = countsOf(replay(lesson, 6));
		expect(recall(c)).toBeGreaterThanOrEqual(0.8);
		expect(precision(c)).toBeLessThan(0.5);
	});

	it('the precision-target task is reachable', () => {
		const s = init();
		const b = bestAtPrecision(s);
		expect(b.recall).toBeGreaterThan(0);
		expect(precision(countsOf(s, b.thr))).toBeGreaterThanOrEqual(0.9);
	});
});
