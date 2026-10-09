/**
 * Narration helpers shared by the English steps (index.ts) and their translations (i18n.ts).
 */
import { init, metrics } from './state.ts';

export const big = (v: number) => Math.round(v).toLocaleString('en-US');
export const signed = (v: number) => `${v < 0 ? '−' : '+'}€${Math.abs(Math.round(v))}`;

/** Clean numbers for the narration. */
export const BASE = init();
export const B = metrics(BASE);
export const WORST = B.r.indexOf(Math.min(...B.r));
/** Outlier used in the quiz. */
export const QUIZ_OUT = 800;
/** Equal-size errors used in the last quiz. */
export const EQUAL = 80;
/** Task: one flat should carry this share of the total squared error. */
export const SHARE_TARGET = 2 / 3;
/** Task: RMSE at least this many times MAE. */
export const RATIO_TARGET = 1.5;
