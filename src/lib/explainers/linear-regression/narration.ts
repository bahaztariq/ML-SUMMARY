/**
 * Narration helpers shared by the English steps (index.ts) and their translations (i18n.ts).
 */
import { fmt } from '#lib/viz/canvas.ts';
import * as rg from '../_regression/regression.ts';
import { best, bestMse, init } from './state.ts';

export const big = (v: number) => Math.round(v).toLocaleString('en-US');

/** Figures for the clean data set, computed once for the narration. */
const CLEAN = init();
export const CLEAN_FIT = best(CLEAN);
export const CLEAN_MSE = bestMse(CLEAN);
/** MSE the learner has to reach by hand (15% above the best possible). */
export const HAND_TARGET = Math.ceil((CLEAN_MSE * 1.15) / 500) * 500;
export const MEAN_X = rg.mean(CLEAN.xs);
export const MEAN_Y = rg.mean(CLEAN.ys);
/** Ridge task: every coefficient smaller than this in size. */
export const COEF_TARGET = 5;

/** The fitted line as a formula (kept in code form, so not translated). */
export const lineEq = (l: rg.Line) => `ŷ = ${fmt(l.w)}·size ${l.b < 0 ? '−' : '+'} ${big(Math.abs(l.b))}`;
