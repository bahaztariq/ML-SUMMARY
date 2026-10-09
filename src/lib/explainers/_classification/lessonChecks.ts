/**
 * Shared test helpers for the classification lessons: replay steps exactly like Player.svelte
 * and run the structural checks every lesson must pass. Imported only from *.spec.ts files.
 */
import { expect } from 'vitest';
import type { ExplainerModule, Text } from '../types.ts';

/** State at step i, replaying init + enter (and reveals of answered quizzes) like the player. */
export function replay<S extends object>(mod: ExplainerModule<S>, i: number, answered = true): S {
	const s = mod.init();
	for (let j = 0; j <= i; j++) {
		mod.steps[j].enter?.(s);
		if ((j < i || answered) && mod.steps[j].quiz?.reveal) mod.steps[j].quiz!.reveal!(s);
	}
	return s;
}

const render = <S>(t: Text<S> | undefined, s: S) => (t === undefined ? '' : typeof t === 'function' ? t(s) : t);

export function checkLesson<S extends object>(mod: ExplainerModule<S>, conceptIds: Set<string>) {
	expect(mod.steps.length).toBeGreaterThanOrEqual(7);
	expect(mod.steps.length).toBeLessThanOrEqual(10);
	expect(mod.steps.some((st) => st.task)).toBe(true);
	expect(mod.steps.some((st) => st.quiz?.reveal)).toBe(true);
	expect(mod.steps.at(-1)!.title.toLowerCase()).toContain('playground');

	mod.steps.forEach((st, i) => {
		for (const answered of [false, true]) {
			const a = replay(mod, i, answered);
			const b = replay(mod, i, answered);
			// deterministic: replaying a step always gives the same state
			expect(JSON.stringify(a), `step ${i} replay`).toBe(JSON.stringify(b));
			const texts = [render(st.body, a), render(st.task?.prompt, a), answered ? render(st.quiz?.explain, a) : ''];
			for (const txt of texts) {
				expect(txt, `step ${i}: ${txt}`).not.toMatch(/NaN|undefined|Infinity|\[object/);
				for (const [, id] of txt.matchAll(/\]\(concept:([a-z0-9-]+)\)/g)) expect(conceptIds.has(id), `unknown concept ${id}`).toBe(true);
			}
		}
		if (st.quiz) expect(st.quiz.answer).toBeLessThan(st.quiz.options.length);
	});
}

/** Every translation lines up with the English steps and renders cleanly on the replayed state. */
export function checkTranslations<S extends object>(mod: ExplainerModule<S>, conceptIds: Set<string>) {
	for (const lang of ['fr', 'ar'] as const) {
		const tr = mod.i18n?.[lang];
		expect(tr, `${lang} translation`).toBeDefined();
		expect(tr!.title, `${lang} title`).toBeTruthy();
		expect(tr!.steps?.length, `${lang} step count`).toBe(mod.steps.length);
		mod.steps.forEach((st, i) => {
			const t = tr!.steps![i]!;
			const where = `${lang} step ${i}`;
			expect(t, where).toBeDefined();
			expect(t.title, `${where} title`).toBeTruthy();
			expect(t.body, `${where} body`).toBeTruthy();
			expect(Boolean(t.task?.prompt), `${where} task`).toBe(Boolean(st.task));
			expect(Boolean(t.quiz), `${where} quiz`).toBe(Boolean(st.quiz));
			if (st.quiz) {
				expect(t.quiz!.question, `${where} question`).toBeTruthy();
				expect(t.quiz!.options?.length, `${where} options`).toBe(st.quiz.options.length);
				expect(t.quiz!.explain, `${where} explain`).toBeTruthy();
			}
			for (const answered of [false, true]) {
				const s = replay(mod, i, answered);
				const texts = [render(t.body, s), render(t.task?.prompt, s), answered ? render(t.quiz?.explain, s) : ''];
				for (const txt of texts) {
					expect(txt, `${where}: ${txt}`).not.toMatch(/NaN|undefined|Infinity|\[object/);
					for (const [, id] of txt.matchAll(/\]\(concept:([a-z0-9-]+)\)/g)) expect(conceptIds.has(id), `unknown concept ${id}`).toBe(true);
				}
				// same live numbers as the English: every bold number in English appears in the translation
				const en = [render(st.body, s), render(st.task?.prompt, s), answered ? render(st.quiz?.explain, s) : ''];
				en.forEach((e, k) => {
					for (const [, n] of e.matchAll(/\*\*(\d+(?:\.\d+)?%?)\*\*/g)) expect(texts[k], `${where}: missing ${n}`).toContain(n);
				});
			}
		});
	}
}
