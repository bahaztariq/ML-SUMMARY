/**
 * Narration helpers shared by the English steps (index.ts) and their translations (i18n.ts).
 */
import { init, metrics, setOutlier } from './state.ts';

export const signed = (v: number) => `${v < 0 ? '−' : '+'}€${Math.abs(Math.round(v))}`;
export const pct = (v: number) => `${Math.round(v * 100)}%`;

export const BASE = init();
export const B = metrics(BASE);
export const WORST = B.r.indexOf(Math.min(...B.r));
/** Outlier used for the share quiz. */
export const SHARE_OUT = 700;
/** Task: one flat's absolute error above this. */
export const BIG_MISS = 600;
/** The priciest flat, dragged up in the mean-vs-median task. */
export const TOP = BASE.ys.indexOf(Math.max(...BASE.ys));
export const TOP_TARGET = 1950;
/** Where the constant prediction starts (well away from both minima). */
export const START_C = 1400;
/** The outlier's share of the total absolute error. */
export const SHARE_AB = (() => {
	const s = init();
	setOutlier(s, SHARE_OUT);
	return metrics(s).outShareAb;
})();
