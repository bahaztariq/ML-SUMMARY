/**
 * Narration helpers shared by the English steps (index.ts) and their translations (i18n.ts).
 */
import { fmt } from '#lib/viz/canvas.ts';
import * as gd from './gd.ts';
import { FIT_START, info, iterations, num, problem, stepsToMin, type GDState } from './state.ts';

export const FIT = gd.PROBLEMS.fit;
export const BUMPY = gd.PROBLEMS.bumpy;
/** How many steps the fit loss needs from the start at a given η (for narration). */
const stepsAt = (lr: number) => gd.stepsToMin(FIT, gd.descend(FIT, [FIT_START], lr, 1000));
export const STEPS_GOOD = stepsAt(0.25);
export const STEPS_SLOW = stepsAt(0.02);

/** "w = 1.23" etc. for the current position. */
export const now = (s: GDState) => {
	const i = info(s);
	return { w: num(i.w[0]), loss: num(i.loss, 3), g: num(i.grad[0]), move: num(i.move[0], 3), raw: i };
};

/** Words for each outcome of a run; `{…}` placeholders are filled in by `reachedIn`. */
export interface ReachedWords {
	diverged: string;
	reachedOne: string;
	reachedMany: string;
	away: string;
	notYet: string;
}

export const REACHED_EN: ReachedWords = {
	diverged: '**diverged** after {n} steps (loss {loss})',
	reachedOne: 'reached the minimum in **{k} step**',
	reachedMany: 'reached the minimum in **{k} steps**',
	away: 'moving **away** from the minimum ({n} steps so far)',
	notYet: 'still **not at the minimum** after {n} steps'
};

const fill = (t: string, p: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k) => String(p[k]));

export const reachedIn = (words: ReachedWords) => (s: GDState, budget?: number) => {
	const k = stepsToMin(s);
	if (s.diverged) return fill(words.diverged, { n: iterations(s), loss: fmt(info(s).loss, 1) });
	if (k >= 0) return fill(k === 1 ? words.reachedOne : words.reachedMany, { k });
	if (info(s).loss > problem(s).loss(s.start)) return fill(words.away, { n: iterations(s) });
	return fill(words.notYet, { n: budget ?? iterations(s) });
};
