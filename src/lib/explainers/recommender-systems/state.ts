/**
 * Recommender explainer state plus memoised models derived from the (editable) ratings.
 */
import * as rc from './rec.ts';

const _ = null;

export const USERS = ['Ana', 'Ben', 'Cara', 'Dev', 'Eli', 'Fay', 'Gus'];
export const ITEMS = ['Alien Dawn', 'Star Drift', 'Robot Riot', 'Paris Kiss', 'Love Letters', 'Moonlit Orbit', 'Nebula Run'];
export const TAGS = ['sci-fi', 'romance', 'action'];
/** Item tags (sci-fi, romance, action) used by the content-based scorer. */
export const FEATS = [
	[1, 0, 1],
	[1, 0, 0],
	[1, 0, 1],
	[0, 1, 0],
	[0, 1, 0],
	[1, 1, 0],
	[1, 0, 1]
];
/** 7 users × 7 items. Gus (row 6) and Nebula Run (column 6) start empty: they arrive later. */
export const START: (number | null)[][] = [
	[5, 4, 5, 1, _, _, _],
	[5, 5, _, 2, 1, 3, _],
	[1, _, 1, 5, 5, 4, _],
	[2, 1, _, 4, 5, _, _],
	[4, _, 4, _, 2, 4, _],
	[_, 2, 1, 5, _, 4, _],
	[_, _, _, _, _, _, _]
];

export const EPOCHS = 150;
export const K = 2;
export const LR = 0.03;
export const SEED = 1;
export const NEIGHBOURS = 2;

export type Fill = 'none' | 'cf' | 'mf';

export interface RecState {
	ratings: (number | null)[][];
	nUsers: number;
	nItems: number;
	/** Target user for similarities and recommendations. */
	user: number;
	cell: { u: number; i: number } | null;
	fill: Fill;
	/** Training epoch currently shown. */
	epoch: number;
	lambda: number;
	/** Item highlighted in the embedding (−1 = none). */
	focus: number;
	show: { sim: boolean; formula: boolean; factors: boolean; train: boolean; content: boolean };
	ui: { edit: boolean; pickUser: boolean; pickCell: boolean; fill: boolean; train: boolean; lambda: boolean; focus: boolean };
	did: { edit: boolean; user: boolean; focus: boolean };
}

/** The part of the matrix currently in play. */
export function visible(s: RecState): rc.Ratings {
	return s.ratings.slice(0, s.nUsers).map((row) => row.slice(0, s.nItems));
}

const memo = new Map<string, unknown>();
function cached<T>(key: string, f: () => T): T {
	if (!memo.has(key)) {
		if (memo.size > 200) memo.clear();
		memo.set(key, f());
	}
	return memo.get(key) as T;
}

/** All MF snapshots for the current ratings and λ (training is fast, so recompute on edits). */
export function mfRun(s: RecState): rc.MFModel[] {
	const r = visible(s);
	return cached(`mf${JSON.stringify(r)}|${s.lambda}`, () => rc.trainMF(r, { k: K, lr: LR, lambda: s.lambda, epochs: EPOCHS, seed: SEED, every: 1 }));
}

export function mfAt(s: RecState): rc.MFModel {
	const run = mfRun(s);
	return run[Math.max(0, Math.min(run.length - 1, s.epoch))];
}

export const ratingsOf = (r: rc.Ratings, u: number) => r[u].filter(rc.has).length;
export const itemCount = (r: rc.Ratings, i: number) => r.filter((row) => rc.has(row[i])).length;

/**
 * MF prediction with the usual fallbacks: a user with no ratings gets μ + b_i (popularity),
 * an item nobody rated can't be scored (NaN).
 */
export function mfPredict(s: RecState, u: number, i: number): { v: number; fallback: boolean } {
	const r = visible(s);
	if (itemCount(r, i) === 0) return { v: NaN, fallback: false };
	const m = mfAt(s);
	if (ratingsOf(r, u) === 0) return { v: rc.clampRating(m.mu + m.bi[i]), fallback: true };
	return { v: rc.clampRating(rc.mfPredict(m, u, i)), fallback: false };
}

export function cfPredict(s: RecState, u: number, i: number) {
	return rc.cfPredict(visible(s), u, i, NEIGHBOURS);
}

export function sims(s: RecState, u = s.user) {
	const r = visible(s);
	return r.map((_, v) => (v === u ? { sim: 1, shared: 0 } : rc.similarity(r, u, v)));
}

export function contentScore(s: RecState, u: number, i: number) {
	return rc.contentScore(visible(s), FEATS, u, i);
}

export function profile(s: RecState, u: number) {
	return rc.profile(visible(s), FEATS, u);
}

export const fmt1 = (v: number) => (Number.isFinite(v) ? v.toFixed(1) : '—');
export const fmt2 = (v: number) => (Number.isFinite(v) ? (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2)) : '—');
export const signed = (v: number) => (v >= 0 ? `+${fmt2(v)}` : `−${fmt2(-v)}`);

export function setRating(s: RecState, u: number, i: number, v: number | null) {
	s.ratings[u][i] = v;
	s.did.edit = true;
	if (s.show.train && s.epoch > 0) s.epoch = EPOCHS;
}

export const off = { edit: false, pickUser: false, pickCell: false, fill: false, train: false, lambda: false, focus: false };
export const noShow = { sim: false, formula: false, factors: false, train: false, content: false };

export function init(): RecState {
	return {
		ratings: START.map((row) => row.slice()),
		nUsers: 6,
		nItems: 6,
		user: 0,
		cell: null,
		fill: 'none',
		epoch: 0,
		lambda: 0.05,
		focus: -1,
		show: { ...noShow },
		ui: { ...off },
		did: { edit: false, user: false, focus: false }
	};
}
