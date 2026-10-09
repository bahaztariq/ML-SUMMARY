/**
 * Every lesson must be fully translated into French and Arabic: same number of steps, every
 * text field present, quiz options complete, and live-number narration that renders cleanly
 * against the state the Player builds for that step.
 */
import { describe, expect, it } from 'vitest';
import { explainerIds, loadExplainer } from './registry.ts';
import type { ExplainerModule, Text } from './types.ts';

function stateFor(mod: ExplainerModule, i: number) {
	const s = mod.init();
	for (let j = 0; j <= i; j++) {
		mod.steps[j].enter?.(s);
		if (j < i) mod.steps[j].quiz?.reveal?.(s);
	}
	return s;
}

const render = (t: Text<any> | undefined, s: unknown) => (typeof t === 'function' ? t(s) : t);

describe('lesson translations', () => {
	for (const id of explainerIds) {
		for (const lang of ['fr', 'ar'] as const) {
			it(`${id} (${lang})`, async () => {
				const mod = (await loadExplainer(id))!;
				const tr = mod.i18n?.[lang];
				expect(tr, 'module.i18n not set').toBeTruthy();
				expect(tr!.title, 'lesson title').toBeTruthy();
				expect(tr!.steps?.length, 'step count').toBe(mod.steps.length);
				mod.steps.forEach((st, i) => {
					const t = tr!.steps![i];
					const where = `step ${i + 1}`;
					expect(t?.title, `${where} title`).toBeTruthy();
					expect(t?.body, `${where} body`).toBeTruthy();
					if (st.task) expect(t?.task?.prompt, `${where} task`).toBeTruthy();
					if (st.quiz) {
						expect(t?.quiz?.question, `${where} quiz question`).toBeTruthy();
						expect(t?.quiz?.options?.length, `${where} quiz options`).toBe(st.quiz.options.length);
						expect(t?.quiz?.explain, `${where} quiz explanation`).toBeTruthy();
					}
					// Leaked values look like a bare NaN/undefined; `NaN` written as code is intentional.
					const check = (text: Text<any> | undefined, s: unknown, what: string) => {
						const out = render(text, s);
						if (out !== undefined) expect(out.replace(/`[^`]*`/g, ''), `${where} ${what}`).not.toMatch(/NaN|undefined/);
					};
					const s = stateFor(mod, i);
					check(t?.body, s, 'body');
					check(t?.task?.prompt, s, 'task');
					// The explanation is shown after answering, i.e. with this quiz's reveal applied.
					st.quiz?.reveal?.(s);
					check(t?.quiz?.explain, s, 'quiz explanation');
				});
			}, 60_000);
		}
	}
});
