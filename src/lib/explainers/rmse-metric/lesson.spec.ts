import { describe, expect, it } from 'vitest';
import { at, before, checkLesson } from '../_regression/lesson-check.ts';
import lesson, { _internals } from './index.ts';
import { OUT, OUTLIER_MAX, metrics, moveRent, setOutlier } from './state.ts';

describe('RMSE lesson', () => {
	it('is well-formed', () => checkLesson(lesson));

	it('the average residual is small although errors are large', () => {
		const m = metrics(at(lesson, 1));
		expect(Math.abs(m.meanRes)).toBeLessThan(20);
		expect(m.mae).toBeGreaterThan(60);
	});

	it('the outlier quiz answer (about €270) is right', () => {
		const s = at(lesson, 5);
		expect(s.outlier).toBe(_internals.QUIZ_OUT);
		const m = metrics(s);
		expect(m.rmse).toBeGreaterThan(255);
		expect(m.rmse).toBeLessThan(285);
		expect(m.mae).toBeLessThan(m.rmse);
	});

	it('tasks are achievable', () => {
		const s4 = before(lesson, 4);
		const worst = metrics(s4).top;
		moveRent(s4, worst, s4.ys[worst] - 300);
		expect(lesson.steps[4].task!.done(s4)).toBe(true);
		const s6 = before(lesson, 6);
		setOutlier(s6, OUTLIER_MAX);
		expect(lesson.steps[6].task!.done(s6)).toBe(true);
		expect(OUT).toBeGreaterThanOrEqual(0);
	});

	it('equal-size errors make RMSE equal MAE', () => {
		const m = metrics(at(lesson, 7));
		expect(m.rmse).toBeCloseTo(_internals.EQUAL, 9);
		expect(m.mae).toBeCloseTo(_internals.EQUAL, 9);
	});
});
