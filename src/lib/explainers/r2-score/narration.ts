/**
 * Narration helpers shared by the English steps (index.ts) and their translations (i18n.ts).
 */
import * as rg from '../_regression/regression.ts';
import { K_MAX, SCORES, init, num } from './state.ts';

export const big = (v: number) => Math.round(v).toLocaleString('en-US');
export const r3 = (v: number) => num(v, 2);

export const BASE = init();
export const BASE_FIT = rg.ols(BASE.xs, BASE.ys);
/** A line sloping the wrong way, for the negative-R² reveal. */
export const BAD_LINE: rg.Line = { w: -6, b: 1450 };
/** Number of junk features in the quiz. */
export const JUNK = K_MAX;
/** Feature count with the best adjusted R². */
export const BEST_ADJ_K = SCORES.reduce((b, sc, k) => (sc.adjR2 > SCORES[b].adjR2 ? k : b), 0);
export const R2_TASK = 0.5;
