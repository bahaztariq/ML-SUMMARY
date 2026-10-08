/**
 * Gradient descent explainer state and the actions both the lesson steps and the scene controls use.
 */
import { fmt } from '#lib/viz/canvas.ts';
import * as gd from './gd.ts';

export type View = 'fit' | 'bumpy' | 'bowl';
export type BowlShape = 'stretched' | 'round';

export interface GDState {
	view: View;
	bowl: BowlShape;
	/** Learning rate η. */
	lr: number;
	/** Where descent starts. */
	start: gd.Vec;
	/** Every position visited so far: path[0] = start, path.at(-1) = current w. */
	path: gd.Vec[];
	converged: boolean;
	diverged: boolean;
	/** When > 0, changing the start or η immediately replays this many steps from the start. */
	autoRun: number;
	show: { tangent: boolean; arrow: boolean; fit: boolean; minima: boolean };
	ui: { drag: boolean; step: boolean; run: boolean; reset: boolean; lr: boolean; view: boolean; bowl: boolean };
	/** Interaction flags used by tasks. */
	did: { drag: boolean };
}

export const FIT_MIN = gd.PROBLEMS.fit.minima[0].w[0];
export const FIT_START = Math.round((FIT_MIN - 3) * 100) / 100;
export const GLOBAL_MIN = gd.PROBLEMS.bumpy.minima.find((m) => m.global)!.w[0];
export const LOCAL_MIN = gd.PROBLEMS.bumpy.minima.find((m) => !m.global)!.w[0];
export const BUMPY_START = 2.2;
export const BOWL_START: gd.Vec = [-2.7, -0.7];

export const DEFAULT_START: Record<View, gd.Vec> = { fit: [FIT_START], bumpy: [BUMPY_START], bowl: BOWL_START };
export const LR_MAX: Record<View, number> = { fit: 1.2, bumpy: 0.5, bowl: 1 };

export function problem(s: GDState): gd.Problem {
	return gd.PROBLEMS[s.view === 'bowl' ? s.bowl : s.view];
}

export function current(s: GDState): gd.Vec {
	return s.path[s.path.length - 1];
}

/** Numbers the narration and readouts show for a position `w`. */
export function info(s: GDState, w: gd.Vec = current(s)) {
	const p = problem(s);
	const g = p.grad(w);
	return {
		w,
		loss: p.loss(w),
		grad: g,
		gradNorm: gd.norm(g),
		/** The next move, −η·∇L (one entry per parameter). */
		move: g.map((gi) => -s.lr * gi)
	};
}

/** Number of updates taken so far. */
export const iterations = (s: GDState) => s.path.length - 1;

/** Steps needed to get within 0.01 of the lowest possible loss, or -1. */
export const stepsToMin = (s: GDState) => gd.stepsToMin(problem(s), s.path);

/** Loss is higher than where we started: overshooting outward (divergence in progress). */
export const escaping = (s: GDState) =>
	s.diverged || (!s.converged && iterations(s) > 1 && problem(s).loss(current(s)) > problem(s).loss(s.start));

/** fmt() that never prints "-0.00". */
export const num = (v: number, d = 2) => (Math.abs(v) < 0.5 * 10 ** -d ? (0).toFixed(d) : fmt(v, d));

/** Wipe the path back to the start (and replay `autoRun` steps if set). */
export function reset(s: GDState) {
	s.path = [s.start.slice()];
	s.converged = false;
	s.diverged = false;
	if (s.autoRun > 0) run(s, s.autoRun);
}

/** One update w ← w − η·∇L(w). Returns false once converged or diverged. */
export function stepOnce(s: GDState): boolean {
	const p = problem(s);
	const w = current(s);
	if (s.converged || s.diverged) return false;
	if (gd.isConverged(p, w)) {
		s.converged = true;
		return false;
	}
	const next = gd.gdStep(p, w, s.lr);
	s.path.push(next);
	if (gd.isDiverged(p, next) || Math.abs(next[0]) > 1e4) s.diverged = true;
	else if (gd.isConverged(p, next)) s.converged = true;
	return !s.converged && !s.diverged;
}

export function run(s: GDState, n: number) {
	for (let i = 0; i < n && stepOnce(s); i++);
}

export function setStart(s: GDState, w: gd.Vec) {
	s.start = w.slice();
	reset(s);
}

export function setLr(s: GDState, lr: number) {
	s.lr = lr;
	reset(s);
}

export function setView(s: GDState, view: View, bowl: BowlShape = s.bowl) {
	s.view = view;
	s.bowl = bowl;
	s.lr = Math.min(s.lr, LR_MAX[view]);
	s.start = DEFAULT_START[view].slice();
	reset(s);
}

export const off = { drag: false, step: false, run: false, reset: false, lr: false, view: false, bowl: false };

export function init(): GDState {
	const s: GDState = {
		view: 'fit',
		bowl: 'stretched',
		lr: 0.25,
		start: [FIT_START],
		path: [],
		converged: false,
		diverged: false,
		autoRun: 0,
		show: { tangent: false, arrow: false, fit: true, minima: false },
		// step 0 starts with dragging on (the player calls init() without step 0's enter on first load)
		ui: { ...off, drag: true },
		did: { drag: false }
	};
	reset(s);
	return s;
}
