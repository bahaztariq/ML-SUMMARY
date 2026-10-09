/**
 * Test helper shared by the clustering / dimensionality-reduction lessons: checks a lesson's
 * fr / ar narration against the English steps (counts, quiz options) and evaluates every
 * narration function against the state the Player would build for that step.
 */
import { expect, it } from 'vitest';
import type { ExplainerModule, Text } from '../types';

/** Replay like the Player: init(), then every enter() up to i, with earlier quiz reveals applied. */
export function stateFor<S extends object>(mod: ExplainerModule<S>, i: number, revealed = false): S {
	const s = mod.init();
	for (let j = 0; j <= i; j++) {
		mod.steps[j].enter?.(s);
		if (j < i || (j === i && revealed)) mod.steps[j].quiz?.reveal?.(s);
	}
	return s;
}

/** The first test cold-imports the lesson (Svelte compile included), well past the default 5 s. */
const TIMEOUT = 60_000;

const evalText = <S>(t: Text<S> | undefined, s: S) => (typeof t === 'function' ? t(s) : t);

function checkString(v: unknown, where: string) {
	expect(typeof v, where).toBe('string');
	expect((v as string).length, where).toBeGreaterThan(0);
	expect(v as string, where).not.toMatch(/NaN|undefined|\[object Object\]/);
}

export function checkLessonI18n<S extends object>(load: () => Promise<{ default: ExplainerModule<S> }>) {
	for (const lang of ['fr', 'ar'] as const) {
		it(`${lang}: narration matches the English steps`, async () => {
			const mod = (await load()).default;
			const tr = mod.i18n?.[lang];
			expect(tr, `missing ${lang}`).toBeTruthy();
			expect(tr!.title, 'title').toBeTruthy();
			expect(tr!.steps?.length).toBe(mod.steps.length);
			mod.steps.forEach((st, i) => {
				const t = tr!.steps![i];
				expect(t, `step ${i}`).toBeTruthy();
				expect(t!.title, `step ${i} title`).toBeTruthy();
				expect(t!.body, `step ${i} body`).toBeTruthy();
				expect(!!t!.task?.prompt, `step ${i} task`).toBe(!!st.task);
				expect(!!t!.quiz, `step ${i} quiz`).toBe(!!st.quiz);
				if (st.quiz) {
					expect(t!.quiz!.question, `step ${i} question`).toBeTruthy();
					expect(t!.quiz!.options?.length, `step ${i} options`).toBe(st.quiz.options.length);
					expect(t!.quiz!.explain, `step ${i} explain`).toBeTruthy();
				}
			});
		}, TIMEOUT);

		it(`${lang}: narration functions render against each step's state`, async () => {
			const mod = (await load()).default;
			const tr = mod.i18n![lang]!;
			mod.steps.forEach((st, i) => {
				const t = tr.steps![i]!;
				for (const revealed of st.quiz?.reveal ? [false, true] : [false]) {
					const s = stateFor(mod, i, revealed);
					const at = `${lang} step ${i}${revealed ? ' (revealed)' : ''}`;
					checkString(evalText(t.body, s), `${at} body`);
					if (t.task) checkString(evalText(t.task.prompt, s), `${at} task`);
					if (t.quiz) checkString(evalText(t.quiz.explain, s), `${at} explain`);
				}
			});
		}, TIMEOUT);
	}
}
