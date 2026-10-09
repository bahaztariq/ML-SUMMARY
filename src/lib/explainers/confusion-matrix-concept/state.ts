/**
 * Confusion-matrix explainer state and the helpers both the lesson steps and the scene use.
 */
import { confusion, cost, samplesFor, type Counts, type Sample } from '../_classification/metrics.ts';

export type Scenario = 'medical' | 'spam';
export type DataKind = 'balanced' | 'rare';

export interface CMState {
	thr: number;
	scenario: Scenario;
	data: DataKind;
	/** Class separation of the model (how good it is). */
	sep: number;
	show: { threshold: boolean; outcomes: boolean; matrix: boolean; metrics: boolean; cost: boolean };
	ui: { drag: boolean; scenario: boolean; data: boolean; sep: boolean };
	did: { drag: boolean };
}

export const SEP = 2.2;

/** Words and prices for each scenario. Costs are in "units of harm" per mistake. */
export const SCENARIOS: Record<
	Scenario,
	{ pos: string; neg: string; xLabel: string; costs: { fp: number; fn: number }; fpMeans: string; fnMeans: string; noun: string }
> = {
	medical: {
		pos: 'sick',
		neg: 'healthy',
		noun: 'patients',
		xLabel: 'model score: P(sick)',
		costs: { fp: 1, fn: 10 },
		fpMeans: 'a healthy patient gets an unnecessary follow-up test',
		fnMeans: 'a sick patient is sent home untreated'
	},
	spam: {
		pos: 'spam',
		neg: 'legit',
		noun: 'emails',
		xLabel: 'model score: P(spam)',
		costs: { fp: 5, fn: 1 },
		fpMeans: 'a real email disappears into the junk folder',
		fnMeans: 'one spam email lands in the inbox'
	}
};

export const sizes = (d: DataKind) => (d === 'rare' ? { nPos: 6, nNeg: 114 } : { nPos: 60, nNeg: 60 });

export function samplesOf(s: CMState): Sample[] {
	return samplesFor({ ...sizes(s.data), sep: s.sep, seed: s.scenario === 'medical' ? 3 : 8 });
}

export const countsOf = (s: CMState, thr = s.thr): Counts => confusion(samplesOf(s), thr);

export const words = (s: CMState) => SCENARIOS[s.scenario];

export const costOf = (s: CMState, thr = s.thr) => {
	const { fp, fn } = words(s).costs;
	return cost(countsOf(s, thr), fp, fn);
};

/** Total cost at every slider position (0.00 … 1.00). */
export function costCurve(s: CMState): [number, number][] {
	return Array.from({ length: 101 }, (_, i) => [i / 100, costOf(s, i / 100)]);
}

/** Cheapest slider position (the middle of the cheapest flat stretch). */
export function cheapest(s: CMState): { thr: number; cost: number } {
	const curve = costCurve(s);
	const min = Math.min(...curve.map((c) => c[1]));
	const at = curve.filter((c) => c[1] === min).map((c) => c[0]);
	return { thr: at[Math.floor(at.length / 2)], cost: min };
}

export function setThr(s: CMState, v: number) {
	s.thr = v;
	s.did.drag = true;
}

export const off = { drag: false, scenario: false, data: false, sep: false };

export function init(): CMState {
	return {
		thr: 0.5,
		scenario: 'medical',
		data: 'balanced',
		sep: SEP,
		show: { threshold: false, outcomes: false, matrix: false, metrics: false, cost: false },
		ui: { ...off },
		did: { drag: false }
	};
}
