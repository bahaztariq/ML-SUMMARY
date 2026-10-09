/**
 * Log-loss explainer state and helpers shared by the steps and the scene.
 *
 * The forecasts come from two overlapping classes; with confidence ×1 the probabilities are
 * calibrated (scale = sep). Changing the confidence stretches every logit by the same factor,
 * which never moves a forecast across 50%: accuracy stays fixed while log-loss changes.
 */
import { accuracy, confusion, logLoss, penalty, pTrue, reliability, samplesFor, type Sample } from '../_classification/metrics.ts';

export interface LLState {
	/** Probability the probe forecast gave to what actually happened. */
	p: number;
	/** Second probe used for comparison in the quiz (null = hidden). */
	p2: number | null;
	/** Confidence multiplier on every logit: 1 = calibrated, > 1 over-confident, < 1 timid. */
	conf: number;
	show: { strip: boolean; curve: boolean; probe: boolean; penalties: boolean; confCurve: boolean; reliability: boolean };
	ui: { p: boolean; conf: boolean };
	did: { p: boolean; conf: boolean; over: boolean; timid: boolean };
}

export const N = 100;
export const SEP = 2;
export const OVER = 4;
export const TIMID = 0.4;

export const samplesAt = (conf: number): Sample[] => samplesFor({ nPos: N, nNeg: N, sep: SEP, scale: conf * SEP, seed: 1 });
export const samplesOf = (s: LLState) => samplesAt(s.conf);
export const lossAt = (conf: number) => logLoss(samplesAt(conf));
export const lossOf = (s: LLState) => lossAt(s.conf);
export const accOf = (s: LLState) => accuracy(confusion(samplesOf(s), 0.5));
export const binsOf = (s: LLState) => reliability(samplesOf(s), 10);

/** Each forecast's penalty, worst first. */
export function penaltiesOf(s: LLState) {
	return samplesOf(s)
		.map((x) => penalty(pTrue(x)))
		.sort((a, b) => b - a);
}

/** Share of the total loss caused by the `k` worst forecasts. */
export function worstShare(s: LLState, k = 10) {
	const pen = penaltiesOf(s);
	const tot = pen.reduce((a, b) => a + b, 0);
	return pen.slice(0, k).reduce((a, b) => a + b, 0) / tot;
}

/** Confidence values the slider can take, and the loss curve over them. */
export const CONFS = Array.from({ length: 48 }, (_, i) => Math.round((0.2 + i * 0.1) * 10) / 10);
export const confCurve = (): [number, number][] => CONFS.map((k) => [k, lossAt(k)]);
export const bestConf = () => confCurve().reduce((b, c) => (c[1] < b[1] ? c : b));

export function setP(s: LLState, v: number) {
	s.p = Math.min(1, Math.max(0.001, v));
	s.did.p = true;
}

export function setConf(s: LLState, v: number) {
	s.conf = v;
	s.did.conf = true;
	if (v >= 3) s.did.over = true;
	if (v <= 0.5) s.did.timid = true;
}

export const off = { p: false, conf: false };

export function init(): LLState {
	return {
		p: 0.8,
		p2: null,
		conf: 1,
		show: { strip: true, curve: false, probe: false, penalties: false, confCurve: false, reliability: false },
		ui: { ...off },
		did: { p: false, conf: false, over: false, timid: false }
	};
}
