/**
 * Gaussian mixture model in 2-D, fitted with Expectation–Maximization.
 * Pure functions over plain arrays so EM can be unit-tested and replayed step by step.
 */
import { mulberry32 } from '#lib/viz/canvas.ts';
import * as km from '../kmeans/kmeans';
import { blobs, moons, type Labelled, type Pt } from '../_clustering/data';

export type Dataset = 'stretched' | 'blobs' | 'moons';

/** Covariance [σxx, σxy, σyy]. */
export type Cov = [number, number, number];

export interface Comp {
	/** Mixing weight π. */
	w: number;
	mu: Pt;
	cov: Cov;
}

const TWO_PI = 2 * Math.PI;

export function density(p: Pt, c: Comp): number {
	const [a, b, d] = c.cov;
	const det = a * d - b * b;
	const dx = p[0] - c.mu[0];
	const dy = p[1] - c.mu[1];
	const q = (d * dx * dx - 2 * b * dx * dy + a * dy * dy) / det;
	return Math.exp(-0.5 * q) / (TWO_PI * Math.sqrt(det));
}

/** Mixture density p(x) = Σ π_k N(x | μ_k, Σ_k). */
export function mixture(p: Pt, comps: Comp[]): number {
	return comps.reduce((sum, c) => sum + c.w * density(p, c), 0);
}

export function logLikelihood(points: Pt[], comps: Comp[]): number {
	return points.reduce((sum, p) => sum + Math.log(Math.max(mixture(p, comps), 1e-300)), 0);
}

/** E-step: responsibility γ_ik that component k generated point i (rows sum to 1). */
export function eStep(points: Pt[], comps: Comp[]): number[][] {
	return points.map((p) => {
		const r = comps.map((c) => c.w * density(p, c));
		const s = r.reduce((a, b) => a + b, 0);
		return s > 0 ? r.map((v) => v / s) : r.map(() => 1 / comps.length);
	});
}

/** M-step: responsibility-weighted weights, means and covariances. `reg` keeps covariances invertible. */
export function mStep(points: Pt[], resp: number[][], reg = 1e-6): Comp[] {
	const k = resp[0]?.length ?? 0;
	const n = points.length;
	const out: Comp[] = [];
	for (let j = 0; j < k; j++) {
		let nk = 0;
		let mx = 0;
		let my = 0;
		points.forEach((p, i) => {
			const g = resp[i][j];
			nk += g;
			mx += g * p[0];
			my += g * p[1];
		});
		nk = Math.max(nk, 1e-10);
		mx /= nk;
		my /= nk;
		let a = 0;
		let b = 0;
		let d = 0;
		points.forEach((p, i) => {
			const g = resp[i][j];
			const dx = p[0] - mx;
			const dy = p[1] - my;
			a += g * dx * dx;
			b += g * dx * dy;
			d += g * dy * dy;
		});
		out.push({ w: nk / n, mu: [mx, my], cov: [a / nk + reg, b / nk, d / nk + reg] });
	}
	return out;
}

/** K components centred on K distinct random points, round and equally weighted. */
export function initComps(points: Pt[], k: number, seed: number, spread = 0.06): Comp[] {
	const rand = mulberry32(seed);
	const picked = new Set<number>();
	while (picked.size < Math.min(k, points.length)) picked.add(Math.floor(rand() * points.length));
	return [...picked].map((i) => ({ w: 1 / k, mu: [points[i][0], points[i][1]], cov: [spread, 0, spread] }));
}

export interface FitResult {
	comps: Comp[];
	/** Log-likelihood before each M-step (index 0 = initial guess). */
	ll: number[];
	iterations: number;
}

export function fit(points: Pt[], init: Comp[], maxIter = 300, tol = 1e-5): FitResult {
	let comps = init;
	const ll = [logLikelihood(points, comps)];
	let it = 0;
	while (it++ < maxIter) {
		comps = mStep(points, eStep(points, comps));
		ll.push(logLikelihood(points, comps));
		if (ll[ll.length - 1] - ll[ll.length - 2] < tol) break;
	}
	return { comps, ll, iterations: it };
}

/** Free parameters of a full-covariance 2-D mixture: 2 (mean) + 3 (covariance) per component, plus K−1 weights. */
export const nParams = (k: number) => 6 * k - 1;

/** Bayesian Information Criterion: lower is better. */
export function bic(points: Pt[], comps: Comp[]): number {
	return -2 * logLikelihood(points, comps) + nParams(comps.length) * Math.log(points.length);
}

/** Components fitted to hard K-Means clusters: scikit-learn's default GMM initialisation. */
export function initFromKMeans(points: Pt[], k: number, seed = 1): Comp[] {
	const labels = km.run(points, km.plusPlusInit(points, k, seed)).labels;
	return mStep(
		points,
		labels.map((l) => Array.from({ length: k }, (_, j) => (j === l ? 1 : 0))),
		1e-4
	);
}

/** BIC for K = 1..kMax, each fit started from K-Means (best of `starts` seeds). */
export function bicCurve(points: Pt[], kMax = 6, starts = 2): number[] {
	const out: number[] = [];
	for (let k = 1; k <= kMax; k++) {
		let best = Infinity;
		for (let r = 0; r < starts; r++) best = Math.min(best, bic(points, fit(points, initFromKMeans(points, k, 1 + r), 200, 1e-4).comps));
		out.push(best);
	}
	return out;
}

/** Semi-axes (1σ) and rotation of a covariance ellipse. */
export function ellipse(cov: Cov): { rx: number; ry: number; angle: number } {
	const [a, b, d] = cov;
	const tr = (a + d) / 2;
	const disc = Math.sqrt(((a - d) / 2) ** 2 + b * b);
	const l1 = tr + disc;
	const l2 = Math.max(tr - disc, 1e-12);
	const angle = Math.abs(b) < 1e-12 ? (a >= d ? 0 : Math.PI / 2) : Math.atan2(l1 - a, b);
	return { rx: Math.sqrt(l1), ry: Math.sqrt(l2), angle };
}

export const hardLabels = (resp: number[][]) => resp.map((r) => r.indexOf(Math.max(...r)));

export function makeData(kind: Dataset): Labelled {
	if (kind === 'moons') return moons(240, 11, 0.06);
	if (kind === 'blobs')
		return blobs(
			[
				{ c: [-0.5, 0.45], sx: 0.14, n: 80 },
				{ c: [0.5, 0.4], sx: 0.12, n: 70 },
				{ c: [0.0, -0.5], sx: 0.16, n: 90 }
			],
			21
		);
	// Two long parallel stripes side by side and a round blob: K-Means cuts across the stripes.
	return blobs(
		[
			{ c: [-0.42, 0.1], sx: 0.42, sy: 0.06, rot: 62, n: 110 },
			{ c: [0.0, -0.05], sx: 0.42, sy: 0.06, rot: 62, n: 110 },
			{ c: [0.7, 0.45], sx: 0.11, n: 60 }
		],
		4
	);
}
