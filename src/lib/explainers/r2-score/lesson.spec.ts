import { describe, expect, it } from 'vitest';
import { at, before, checkLesson } from '../_regression/lesson-check.ts';
import lesson, { _internals } from './index.ts';
import { NOISE_RANGE, SCORES, fit, setK, setNoise, stats } from './state.ts';

describe('R² lesson', () => {
	it('is well-formed', () => checkLesson(lesson));

	it('the least-squares line explains most of the variation', () => {
		const r = stats(at(lesson, 2)).r2;
		expect(r).toBeGreaterThan(0.75);
		expect(r).toBeLessThan(0.95);
	});

	it('the flat line at the mean scores R² = 0 and the bad line goes negative', () => {
		const s = before(lesson, 3);
		s.line = { w: 0, b: stats(s).ybar };
		expect(lesson.steps[3].task!.done(s)).toBe(true);
		expect(stats(at(lesson, 4)).r2).toBeLessThan(-0.5);
	});

	it('more noise lowers R² below the task target', () => {
		const s = before(lesson, 5);
		setNoise(s, NOISE_RANGE[1]);
		expect(lesson.steps[5].task!.done(s)).toBe(true);
		fit(s);
		expect(s.line.w).toBeGreaterThan(9);
		expect(s.line.w).toBeLessThan(11.5);
	});

	it('junk features raise training R² and the adjusted-R² task is reachable', () => {
		expect(SCORES[at(lesson, 6).k].r2Train).toBeGreaterThan(SCORES[0].r2Train + 0.1);
		const s = before(lesson, 7);
		setK(s, _internals.BEST_ADJ_K);
		expect(lesson.steps[7].task!.done(s)).toBe(true);
	});
});
