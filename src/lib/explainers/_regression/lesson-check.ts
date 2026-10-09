/**
 * Test helpers shared by the regression lesson specs: replay a lesson the way the Player does.
 */
import { expect } from 'vitest';
import type { ExplainerModule, Text } from '../types.ts';

/** State at step i, with every quiz up to and including i answered. */
export function at<S extends object>(lesson: ExplainerModule<S>, i: number): S {
	const s = lesson.init();
	for (let j = 0; j <= i; j++) {
		lesson.steps[j].enter?.(s);
		lesson.steps[j].quiz?.reveal?.(s);
	}
	return s;
}

/** State at step i before its own quiz is answered. */
export function before<S extends object>(lesson: ExplainerModule<S>, i: number): S {
	const s = lesson.init();
	for (let j = 0; j <= i; j++) {
		lesson.steps[j].enter?.(s);
		if (j < i) lesson.steps[j].quiz?.reveal?.(s);
	}
	return s;
}

const text = <S>(t: Text<S>, s: S) => (typeof t === 'function' ? t(s) : t);

/** Structural checks every lesson must pass. */
export function checkLesson<S extends object>(lesson: ExplainerModule<S>) {
	expect(lesson.steps.length).toBeGreaterThanOrEqual(7);
	expect(lesson.steps.length).toBeLessThanOrEqual(10);
	expect(lesson.steps.some((st) => st.task)).toBe(true);
	expect(lesson.steps.some((st) => st.quiz?.reveal)).toBe(true);
	lesson.steps.forEach((st, i) => {
		const pre = before(lesson, i);
		const post = at(lesson, i);
		for (const s of [pre, post]) expect(text(st.body, s), `step ${i} body`).not.toMatch(/NaN|undefined|Infinity|\[object/);
		if (st.quiz) {
			expect(text(st.quiz.explain, post), `step ${i} explain`).not.toMatch(/NaN|undefined|Infinity/);
			expect(st.quiz.answer).toBeLessThan(st.quiz.options.length);
		}
		if (st.task) {
			expect(text(st.task.prompt, pre)).toBeTruthy();
			expect(st.task.done(pre), `step ${i} task already done on entry`).toBe(false);
		}
		// concept links only point at known ids (checked loosely: lowercase-kebab)
		for (const m of String(text(st.body, post)).matchAll(/\(concept:([^)]+)\)/g)) expect(m[1]).toMatch(/^[a-z0-9-]+$/);
	});
	// deterministic replay
	const last = lesson.steps.length - 1;
	expect(JSON.stringify(at(lesson, last))).toBe(JSON.stringify(at(lesson, last)));
}

/** Rendered narration with inline code removed (code may legitimately mention `NaN`). */
const prose = <S>(t: Text<S>, s: S) => text(t, s).replace(/`[^`]*`/g, '');

/** Translation checks: fr/ar narration lines up with the English steps and renders cleanly. */
export function checkI18n<S extends object>(lesson: ExplainerModule<S>) {
	for (const lang of ['fr', 'ar'] as const) {
		const tr = lesson.i18n?.[lang];
		expect(tr, `${lang} translation`).toBeTruthy();
		expect(tr!.title, `${lang} title`).toBeTruthy();
		expect(tr!.steps?.length, `${lang} step count`).toBe(lesson.steps.length);
		lesson.steps.forEach((st, i) => {
			const t = tr!.steps![i];
			const where = `${lang} step ${i}`;
			expect(t, where).toBeTruthy();
			expect(t!.title, `${where} title`).toBeTruthy();
			expect(t!.body, `${where} body`).toBeTruthy();
			const pre = before(lesson, i);
			const post = at(lesson, i);
			for (const s of [pre, post]) expect(prose(t!.body!, s), `${where} body`).not.toMatch(/NaN|undefined|Infinity|\[object/);
			if (st.task) {
				expect(t!.task?.prompt, `${where} task`).toBeTruthy();
				expect(prose(t!.task!.prompt!, pre), `${where} task`).not.toMatch(/NaN|undefined|Infinity|\[object/);
			} else expect(t!.task, `${where} has a task the English step lacks`).toBeUndefined();
			if (st.quiz) {
				expect(t!.quiz?.question, `${where} question`).toBeTruthy();
				expect(t!.quiz?.options?.length, `${where} options`).toBe(st.quiz.options.length);
				expect(prose(t!.quiz!.explain!, post), `${where} explain`).not.toMatch(/NaN|undefined|Infinity|\[object/);
				for (const o of t!.quiz!.options!) expect(o, `${where} option`).not.toMatch(/NaN|undefined|Infinity/);
			} else expect(t!.quiz, `${where} has a quiz the English step lacks`).toBeUndefined();
			// links keep their targets
			const ids = (v: string) => [...v.matchAll(/\(concept:([^)]+)\)/g)].map((m) => m[1]).sort();
			expect(ids(text(t!.body!, post)), `${where} concept links`).toEqual(ids(text(st.body, post)));
		});
	}
}
