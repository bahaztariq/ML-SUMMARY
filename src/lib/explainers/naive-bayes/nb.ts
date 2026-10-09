/**
 * Naive Bayes building blocks: a word-presence spam filter with Laplace smoothing, and Gaussian NB
 * (plus a full-covariance Gaussian classifier for contrast) on 2-D points.
 */
import type { Data, Pt } from '../_classifiers/data.ts';

/* ------------------------------------------------------------------ */
/* Spam filter                                                        */
/* ------------------------------------------------------------------ */

export interface Word {
	id: string;
	label: string;
	/** Number of training spam / ham emails that contain the word. */
	spam: number;
	ham: number;
}

export const N_SPAM = 40;
export const N_HAM = 60;

export const WORDS: Word[] = [
	{ id: 'free', label: 'free', spam: 24, ham: 6 },
	{ id: 'click', label: 'click', spam: 20, ham: 9 },
	{ id: 'meeting', label: 'meeting', spam: 2, ham: 24 },
	{ id: 'report', label: 'report', spam: 4, ham: 18 },
	{ id: 'winner', label: 'winner', spam: 12, ham: 0 },
	/** An exact copy of "free" (same emails), used to show double counting. */
	{ id: 'FREE', label: 'FREE!!', spam: 24, ham: 6 }
];
export const wordById = new Map(WORDS.map((w) => [w.id, w]));

/** P(word present | class) with additive (Laplace) smoothing over the two outcomes present/absent. */
export function likelihood(count: number, n: number, alpha: number): number {
	return (count + alpha) / (n + 2 * alpha);
}

export interface Posterior {
	prior: [number, number];
	/** Per word: [P(w | spam), P(w | ham)]. */
	lik: [number, number][];
	/** Unnormalised P(spam)·ΠP(w|spam) and P(ham)·ΠP(w|ham). */
	joint: [number, number];
	/** [P(spam | words), P(ham | words)]. */
	post: [number, number];
	/** ln(P(spam)/P(ham)) and ln(P(w|spam)/P(w|ham)) per word; ±Infinity for a zero likelihood. */
	priorLogOdds: number;
	wordLogOdds: number[];
	logOdds: number;
}

/**
 * Posterior over {spam, ham} given that the email contains `words` (the words not listed are
 * simply not used as evidence). Naive assumption: words are independent given the class.
 */
export function posterior(words: readonly Word[], alpha: number, nSpam = N_SPAM, nHam = N_HAM): Posterior {
	const prior: [number, number] = [nSpam / (nSpam + nHam), nHam / (nSpam + nHam)];
	const lik = words.map((w) => [likelihood(w.spam, nSpam, alpha), likelihood(w.ham, nHam, alpha)] as [number, number]);
	const joint: [number, number] = [prior[0], prior[1]];
	for (const [ls, lh] of lik) {
		joint[0] *= ls;
		joint[1] *= lh;
	}
	const z = joint[0] + joint[1];
	const post: [number, number] = z > 0 ? [joint[0] / z, joint[1] / z] : [0.5, 0.5];
	const priorLogOdds = Math.log(prior[0] / prior[1]);
	const wordLogOdds = lik.map(([ls, lh]) => Math.log(ls) - Math.log(lh));
	const logOdds = wordLogOdds.reduce((a, b) => a + b, priorLogOdds);
	return { prior, lik, joint, post, priorLogOdds, wordLogOdds, logOdds };
}

/* ------------------------------------------------------------------ */
/* Gaussian naive Bayes on 2-D points                                 */
/* ------------------------------------------------------------------ */

export interface GNB {
	prior: [number, number];
	mean: [Pt, Pt];
	/** Per-class, per-feature variance. */
	var: [Pt, Pt];
}

/** Maximum-likelihood fit (population variance, plus scikit-learn's tiny var_smoothing). */
export function fitGNB(d: Data): GNB {
	const n = [0, 0];
	const sum: Pt[] = [
		[0, 0],
		[0, 0]
	];
	d.X.forEach((p, i) => {
		const c = d.y[i];
		n[c]++;
		sum[c][0] += p[0];
		sum[c][1] += p[1];
	});
	const mean: [Pt, Pt] = [
		[sum[0][0] / n[0], sum[0][1] / n[0]],
		[sum[1][0] / n[1], sum[1][1] / n[1]]
	];
	const ss: Pt[] = [
		[0, 0],
		[0, 0]
	];
	d.X.forEach((p, i) => {
		const c = d.y[i];
		ss[c][0] += (p[0] - mean[c][0]) ** 2;
		ss[c][1] += (p[1] - mean[c][1]) ** 2;
	});
	const all = d.X.length;
	const mx = [0, 1].map((f) => d.X.reduce((a, p) => a + p[f], 0) / all);
	const eps = 1e-9 * Math.max(...[0, 1].map((f) => d.X.reduce((a, p) => a + (p[f] - mx[f]) ** 2, 0) / all));
	return {
		prior: [n[0] / all, n[1] / all],
		mean,
		var: [
			[ss[0][0] / n[0] + eps, ss[0][1] / n[0] + eps],
			[ss[1][0] / n[1] + eps, ss[1][1] / n[1] + eps]
		]
	};
}

const LOG2PI = Math.log(2 * Math.PI);

/** log N(x; μ, σ²) for one feature. */
export const logNormal = (x: number, mu: number, v: number) => -0.5 * (LOG2PI + Math.log(v)) - ((x - mu) ** 2) / (2 * v);
export const normalPdf = (x: number, mu: number, v: number) => Math.exp(logNormal(x, mu, v));

/** log P(x | class) under the naive assumption: sum of per-feature log densities. */
export const gnbLogLik = (m: GNB, c: number, p: readonly number[]) => logNormal(p[0], m.mean[c][0], m.var[c][0]) + logNormal(p[1], m.mean[c][1], m.var[c][1]);

/** P(class B | x) via log-sum-exp. */
export function gnbProbB(m: GNB, p: readonly number[]): number {
	const a = Math.log(m.prior[0]) + gnbLogLik(m, 0, p);
	const b = Math.log(m.prior[1]) + gnbLogLik(m, 1, p);
	return 1 / (1 + Math.exp(a - b));
}

/* ---- full-covariance Gaussian classifier (QDA), for contrast ---- */

export interface QDA {
	prior: [number, number];
	mean: [Pt, Pt];
	/** Covariance [[a, b], [b, c]] per class stored as [a, b, c]. */
	cov: [[number, number, number], [number, number, number]];
}

export function fitQDA(d: Data): QDA {
	const g = fitGNB(d);
	const cov: [[number, number, number], [number, number, number]] = [
		[0, 0, 0],
		[0, 0, 0]
	];
	const n = [0, 0];
	d.X.forEach((p, i) => {
		const c = d.y[i];
		const dx = p[0] - g.mean[c][0];
		const dy = p[1] - g.mean[c][1];
		cov[c][0] += dx * dx;
		cov[c][1] += dx * dy;
		cov[c][2] += dy * dy;
		n[c]++;
	});
	for (const c of [0, 1]) for (const k of [0, 1, 2]) cov[c][k] /= n[c];
	return { prior: g.prior, mean: g.mean, cov };
}

export function qdaLogLik(m: QDA, c: number, p: readonly number[]) {
	const [a, b, cc] = m.cov[c];
	const det = a * cc - b * b;
	const dx = p[0] - m.mean[c][0];
	const dy = p[1] - m.mean[c][1];
	const q = (cc * dx * dx - 2 * b * dx * dy + a * dy * dy) / det;
	return -LOG2PI - 0.5 * Math.log(det) - 0.5 * q;
}

export function qdaProbB(m: QDA, p: readonly number[]): number {
	const a = Math.log(m.prior[0]) + qdaLogLik(m, 0, p);
	const b = Math.log(m.prior[1]) + qdaLogLik(m, 1, p);
	return 1 / (1 + Math.exp(a - b));
}
