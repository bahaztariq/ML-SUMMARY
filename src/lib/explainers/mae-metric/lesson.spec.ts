import { describe, expect, it } from 'vitest';
import * as rg from '../_regression/regression.ts';
import { at, before, checkLesson } from '../_regression/lesson-check.ts';
import lesson, { _internals } from './index.ts';
import { mean, median, metrics, moveRent, setC } from './state.ts';

describe('MAE lesson', () => {
	it('is well-formed', () => checkLesson(lesson));

	it('the outlier takes ~80% of squared error but under half of absolute error', () => {
		const m = metrics(at(lesson, 3));
		expect(m.outShareSq).toBeGreaterThan(0.75);
		expect(m.outShareSq).toBeLessThan(0.85);
		expect(m.outShareAb).toBeLessThan(0.5);
	});

	it('constant-model tasks are achievable', () => {
		const s = before(lesson, 5);
		setC(s, Math.round(median(s)));
		setC(s, Math.round(mean(s)));
		expect(lesson.steps[5].task!.done(s)).toBe(true);
		// the median minimizes MAE, the mean minimizes RMSE
		expect(rg.constMae(s.ys, median(s))).toBeLessThan(rg.constMae(s.ys, mean(s)));
		expect(rg.constRmse(s.ys, mean(s))).toBeLessThan(rg.constRmse(s.ys, median(s)));
	});

	it('dragging the priciest flat moves the mean but not the median', () => {
		const s = before(lesson, 6);
		const md = median(s);
		const mu = mean(s);
		moveRent(s, _internals.TOP, _internals.TOP_TARGET);
		expect(lesson.steps[6].task!.done(s)).toBe(true);
		expect(median(s)).toBe(md);
		expect(mean(s) - mu).toBeGreaterThan(40);
	});

	it('the big-miss task is achievable', () => {
		const s = before(lesson, 2);
		moveRent(s, 0, 2000);
		expect(lesson.steps[2].task!.done(s)).toBe(true);
	});
});
