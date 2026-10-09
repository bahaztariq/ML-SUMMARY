/**
 * Shared math for the classification-metric lessons (confusion matrix, precision/recall/F1,
 * ROC-AUC, PR curve, log-loss). Pure functions over plain arrays so they can be unit-tested
 * and replayed deterministically.
 *
 * Convention everywhere: a sample is predicted positive when `score >= threshold`.
 */
import { mulberry32 } from '#lib/viz/canvas.ts';

export interface Sample {
	/** Model score / predicted probability of the positive class, in [0, 1]. */
	score: number;
	/** True label: 1 = positive, 0 = negative. */
	y: 0 | 1;
	/** Vertical jitter in [0, 1) used only for drawing. */
	jit: number;
}

export interface DataOpts {
	nPos: number;
	nNeg: number;
	/** Distance between the two class means on the latent axis (in standard deviations). */
	sep: number;
	/** Logit scale: score = sigmoid(scale · latent). With scale = sep the scores are calibrated (for balanced classes). */
	scale?: number;
	/** Optional monotone warp: score ← score^warp. Changes the scores, never their order. */
	warp?: number;
	seed?: number;
}

export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

/** Inverse standard-normal CDF (Acklam's rational approximation, |error| < 1.2e-9). */
export function probit(p: number): number {
	const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
	const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
	const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
	const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
	const lo = 0.02425;
	if (p <= 0) return -Infinity;
	if (p >= 1) return Infinity;
	if (p < lo) {
		const q = Math.sqrt(-2 * Math.log(p));
		return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
	}
	if (p > 1 - lo) return -probit(1 - p);
	const q = p - 0.5;
	const r = q * q;
	return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/**
 * n standard-normal draws, stratified: one per quantile slice, so even small classes have a
 * clean bell shape and two classes with the same mean really do look (and score) alike.
 */
function stratifiedNormal(n: number, rand: () => number): number[] {
	return Array.from({ length: n }, (_, i) => probit((i + 0.05 + 0.9 * rand()) / n));
}

/**
 * Two overlapping classes on a latent axis (positives centred at +sep/2, negatives at −sep/2,
 * unit variance), turned into scores with a sigmoid. Deterministic for a given `seed`.
 * Positives come first in the returned array.
 */
export function makeSamples({ nPos, nNeg, sep, scale = 1.6, warp = 1, seed = 1 }: DataOpts): Sample[] {
	const rp = mulberry32(seed * 7919 + 11);
	const rn = mulberry32(seed * 104729 + 23);
	const rj = mulberry32(seed * 31 + 5);
	const zp = stratifiedNormal(nPos, rp);
	const zn = stratifiedNormal(nNeg, rn);
	const score = (z: number) => {
		const s = sigmoid(scale * z);
		return warp === 1 ? s : s ** warp;
	};
	const out: Sample[] = [];
	for (const z of zp) out.push({ score: score(z + sep / 2), y: 1, jit: rj() });
	for (const z of zn) out.push({ score: score(z - sep / 2), y: 0, jit: rj() });
	return out;
}

const cache = new Map<string, Sample[]>();
/** Memoized makeSamples: lessons call this from narration and scene alike. */
export function samplesFor(opts: DataOpts): Sample[] {
	const key = JSON.stringify([opts.nPos, opts.nNeg, opts.sep, opts.scale ?? 1.6, opts.warp ?? 1, opts.seed ?? 1]);
	let v = cache.get(key);
	if (!v) {
		v = makeSamples(opts);
		if (cache.size > 64) cache.delete(cache.keys().next().value!);
		cache.set(key, v);
	}
	return v;
}

/* ------------------------------------------------------------------ */
/* Confusion matrix and the metrics built from it                      */
/* ------------------------------------------------------------------ */

export interface Counts {
	tp: number;
	fp: number;
	fn: number;
	tn: number;
}

export type Outcome = 'tp' | 'fp' | 'fn' | 'tn';

export function outcome(s: Sample, thr: number): Outcome {
	const pred = s.score >= thr;
	return s.y ? (pred ? 'tp' : 'fn') : pred ? 'fp' : 'tn';
}

export function confusion(samples: Sample[], thr: number): Counts {
	const c: Counts = { tp: 0, fp: 0, fn: 0, tn: 0 };
	for (const s of samples) c[outcome(s, thr)]++;
	return c;
}

/** a / b, or NaN when b is 0 (the metric is undefined, not zero). */
const div = (a: number, b: number) => (b > 0 ? a / b : NaN);

export const precision = (c: Counts) => div(c.tp, c.tp + c.fp);
export const recall = (c: Counts) => div(c.tp, c.tp + c.fn);
/** True positive rate = recall. */
export const tpr = recall;
export const fpr = (c: Counts) => div(c.fp, c.fp + c.tn);
export const specificity = (c: Counts) => div(c.tn, c.tn + c.fp);
export const accuracy = (c: Counts) => div(c.tp + c.tn, c.tp + c.tn + c.fp + c.fn);
export const prevalence = (c: Counts) => div(c.tp + c.fn, c.tp + c.tn + c.fp + c.fn);

export const arithmeticMean = (a: number, b: number) => (a + b) / 2;
/** Harmonic mean 2ab/(a+b); 0 when both are 0. */
export const harmonicMean = (a: number, b: number) => (a + b > 0 ? (2 * a * b) / (a + b) : 0);

/** F-beta from precision and recall: recall counts beta times as much as precision. */
export function fbetaPR(p: number, r: number, beta = 1): number {
	if (!Number.isFinite(p) || !Number.isFinite(r)) return NaN;
	const b2 = beta * beta;
	const den = b2 * p + r;
	return den > 0 ? ((1 + b2) * p * r) / den : 0;
}

/** F-beta straight from counts (defined whenever there is any actual or predicted positive). */
export function fbeta(c: Counts, beta = 1): number {
	const b2 = beta * beta;
	return div((1 + b2) * c.tp, (1 + b2) * c.tp + b2 * c.fn + c.fp);
}

export const f1 = (c: Counts) => fbeta(c, 1);

/** Total cost of the mistakes at given per-error prices. */
export const cost = (c: Counts, costFP: number, costFN: number) => c.fp * costFP + c.fn * costFN;

/* ------------------------------------------------------------------ */
/* Threshold sweeps: ROC and PR curves                                  */
/* ------------------------------------------------------------------ */

export interface SweepPt extends Counts {
	/** Threshold that produces this point (`Infinity` = nothing predicted positive). */
	thr: number;
	tpr: number;
	fpr: number;
	precision: number;
	recall: number;
}

/**
 * Every distinct operating point, from the strictest threshold (nothing positive) down to the
 * loosest (everything positive). Ties move together, as in scikit-learn.
 */
export function sweep(samples: Sample[]): SweepPt[] {
	const sorted = [...samples].sort((a, b) => b.score - a.score);
	const P = samples.filter((s) => s.y === 1).length;
	const N = samples.length - P;
	const pt = (thr: number, tp: number, fp: number): SweepPt => {
		const c = { tp, fp, fn: P - tp, tn: N - fp };
		return { thr, ...c, tpr: div(tp, P), fpr: div(fp, N), precision: precision(c), recall: div(tp, P) };
	};
	const out: SweepPt[] = [pt(Infinity, 0, 0)];
	let tp = 0;
	let fp = 0;
	for (let i = 0; i < sorted.length; i++) {
		if (sorted[i].y) tp++;
		else fp++;
		if (i === sorted.length - 1 || sorted[i + 1].score !== sorted[i].score) out.push(pt(sorted[i].score, tp, fp));
	}
	return out;
}

/** The operating point used at threshold `thr` (the sweep point with the smallest threshold ≥ thr). */
export function pointAt(pts: SweepPt[], thr: number): SweepPt {
	let best = pts[0];
	for (const p of pts) if (p.thr >= thr) best = p;
	return best;
}

/** Area under the ROC curve by the trapezoid rule. */
export function rocAuc(pts: SweepPt[]): number {
	let a = 0;
	for (let i = 1; i < pts.length; i++) a += (pts[i].fpr - pts[i - 1].fpr) * (pts[i].tpr + pts[i - 1].tpr) * 0.5;
	return a;
}

/** P(score of a random positive > score of a random negative), ties count half. */
export function pairwiseAuc(samples: Sample[]): number {
	const pos = samples.filter((s) => s.y === 1).map((s) => s.score);
	const neg = samples.filter((s) => s.y === 0).map((s) => s.score);
	let wins = 0;
	for (const p of pos) for (const n of neg) wins += p > n ? 1 : p === n ? 0.5 : 0;
	return div(wins, pos.length * neg.length);
}

/** Average precision, AP = Σₙ (Rₙ − Rₙ₋₁) · Pₙ (scikit-learn's definition, no interpolation). */
export function averagePrecision(pts: SweepPt[]): number {
	let ap = 0;
	for (let i = 1; i < pts.length; i++) ap += (pts[i].recall - pts[i - 1].recall) * pts[i].precision;
	return ap;
}

/** The threshold (and its point) that maximises `score` over all operating points. */
export function best(pts: SweepPt[], score: (p: SweepPt) => number): SweepPt {
	let b = pts[0];
	let bv = -Infinity;
	for (const p of pts) {
		const v = score(p);
		if (Number.isFinite(v) && v > bv) {
			bv = v;
			b = p;
		}
	}
	return b;
}

/** Highest-precision operating point whose recall reaches `target` (ties → higher recall). */
export function bestPrecisionAtRecall(pts: SweepPt[], target: number): SweepPt {
	return best(pts, (p) => (p.recall >= target - 1e-12 ? p.precision + p.recall * 1e-9 : -Infinity));
}

/** Highest-recall operating point whose precision reaches `target`. */
export function bestRecallAtPrecision(pts: SweepPt[], target: number): SweepPt {
	return best(pts, (p) => (p.precision >= target - 1e-12 ? p.recall + p.precision * 1e-9 : -Infinity));
}

/** A threshold half-way between the scores that bound operating point `p` (nicer than sitting on a sample). */
export function midThreshold(pts: SweepPt[], p: SweepPt): number {
	const i = pts.indexOf(p);
	const next = pts[i + 1];
	if (!Number.isFinite(p.thr)) return 1;
	return next ? (p.thr + next.thr) / 2 : p.thr / 2;
}

/* ------------------------------------------------------------------ */
/* Random pairs (AUC as a ranking probability)                          */
/* ------------------------------------------------------------------ */

/** The k-th random (positive, negative) pair, as indices into `samples` (positives first). */
export function pairAt(k: number, nPos: number, nNeg: number, seed = 1): [number, number] {
	const r = mulberry32(seed * 2654435761 + k * 40503 + 1);
	r();
	return [Math.floor(r() * nPos), nPos + Math.floor(r() * nNeg)];
}

/** How many of the first `n` random pairs rank the positive higher (ties count half). */
export function pairWins(samples: Sample[], n: number, nPos: number, nNeg: number, seed = 1): number {
	let w = 0;
	for (let k = 0; k < n; k++) {
		const [i, j] = pairAt(k, nPos, nNeg, seed);
		const a = samples[i].score;
		const b = samples[j].score;
		w += a > b ? 1 : a === b ? 0.5 : 0;
	}
	return w;
}

/* ------------------------------------------------------------------ */
/* Log-loss and calibration                                             */
/* ------------------------------------------------------------------ */

export const EPS = 1e-15;

/** Probability the model gave to the true class. */
export const pTrue = (s: Sample) => (s.y ? s.score : 1 - s.score);

/** −log of the probability given to the true class (clipped like scikit-learn). */
export const penalty = (p: number) => -Math.log(Math.min(1 - EPS, Math.max(EPS, p)));

export function logLoss(samples: Sample[]): number {
	let sum = 0;
	for (const s of samples) sum += penalty(pTrue(s));
	return div(sum, samples.length);
}

export interface Bin {
	lo: number;
	hi: number;
	n: number;
	/** Mean predicted probability in the bin. */
	meanP: number;
	/** Fraction of the bin that is actually positive. */
	freq: number;
}

/** Reliability diagram: bin by predicted probability, compare with how often the event happened. */
export function reliability(samples: Sample[], bins = 10): Bin[] {
	const out: Bin[] = Array.from({ length: bins }, (_, i) => ({ lo: i / bins, hi: (i + 1) / bins, n: 0, meanP: 0, freq: 0 }));
	for (const s of samples) {
		const b = out[Math.min(bins - 1, Math.floor(s.score * bins))];
		b.n++;
		b.meanP += s.score;
		b.freq += s.y;
	}
	for (const b of out) {
		b.meanP = div(b.meanP, b.n);
		b.freq = div(b.freq, b.n);
	}
	return out;
}

/** Percent with one decimal, or an em dash when undefined. */
export const pct = (v: number, d = 1) => (Number.isFinite(v) ? `${(v * 100).toFixed(d)}%` : '—');
