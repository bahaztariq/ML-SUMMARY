import { describe, expect, it } from 'vitest';
import * as rg from '../_regression/regression.ts';
import lesson, { _internals } from './index.ts';
import { OUTLIER, best, currentMse, fit, maxCoef, polyFit, setOutlier, zeros, type LRState } from './state.ts';

/** Replay the lesson up to step i the way the player does (quizzes answered). */
function at(i: number): LRState {
	const s = lesson.init();
	for (let j = 0; j <= i; j++) {
		lesson.steps[j].enter?.(s);
		lesson.steps[j].quiz?.reveal?.(s);
	}
	return s;
}

const text = (t: unknown, s: LRState) => (typeof t === 'function' ? t(s) : t) as string;

describe('linear regression lesson', () => {
	it('has 7–10 steps, a task and a quiz, and every step renders', () => {
		expect(lesson.steps.length).toBeGreaterThanOrEqual(7);
		expect(lesson.steps.length).toBeLessThanOrEqual(10);
		expect(lesson.steps.some((st) => st.task)).toBe(true);
		expect(lesson.steps.some((st) => st.quiz?.reveal)).toBe(true);
		lesson.steps.forEach((st, i) => {
			const s = at(i);
			expect(text(st.body, s)).not.toMatch(/NaN|undefined|Infinity/);
			if (st.quiz) expect(text(st.quiz.explain, s)).not.toMatch(/NaN|undefined/);
			if (st.task) expect(text(st.task.prompt, s)).toBeTruthy();
		});
	});

	it('replays identically', () => {
		expect(JSON.stringify(at(5))).toBe(JSON.stringify(at(5)));
	});

	it('tasks are not already done on entry but are achievable', () => {
		lesson.steps.forEach((st, i) => {
			if (!st.task) return;
			const s = at(i);
			expect(st.task.done(s), `step ${i} done on entry`).toBe(false);
		});
		// hand-fit target is reachable and fitting reaches it
		const s1 = at(1);
		fit(s1);
		expect(currentMse(s1)).toBeLessThan(_internals.HAND_TARGET);
		// ridge task reachable within the slider range
		const s6 = at(6);
		s6.logAlpha = -3;
		expect(maxCoef(polyFit(s6))).toBeLessThan(_internals.COEF_TARGET);
		// dragging one end point far enough changes the slope past the threshold
		const s3 = at(3);
		const i = s3.xs.indexOf(Math.max(...s3.xs));
		s3.ys[i] = 20;
		fit(s3);
		expect(lesson.steps[3].task!.done(s3)).toBe(true);
	});

	it('the outlier claim in the narration holds', () => {
		const s = at(4);
		expect(s.outlier).toBe(true);
		const f = best(s);
		expect(f.w).toBeGreaterThan(7.5);
		expect(f.w).toBeLessThan(8.5);
		const miss = (rg.lineAt(f, OUTLIER.x) - OUTLIER.y) ** 2;
		const all = rg.sse(s.ys, rg.predict(f, s.xs));
		expect(miss).toBeGreaterThan(all - miss);
		setOutlier(s, false);
		expect(s.xs.length).toBe(30);
	});

	it('lasso zeroes several weights in the quiz reveal', () => {
		const s = at(7);
		expect(s.penalty).toBe('lasso');
		expect(zeros(polyFit(s))).toBeGreaterThanOrEqual(3);
	});
});
