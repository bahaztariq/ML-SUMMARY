/**
 * Silhouette analysis: per-point cohesion a(i), separation b(i) and s(i) = (b − a) / max(a, b).
 * Matches scikit-learn: points alone in their cluster get s = 0.
 */
import * as km from '../kmeans/kmeans';
import { blobs, dist, moons, type Labelled, type Pt } from '../_clustering/data';

export type Dataset = 'blobs' | 'moons';

/** Mean distance from point i to the members of every cluster (i itself excluded). */
export function meanDistances(points: Pt[], labels: number[], i: number, k: number): number[] {
	const sum = new Array(k).fill(0);
	const cnt = new Array(k).fill(0);
	points.forEach((q, j) => {
		if (j === i || labels[j] < 0) return;
		sum[labels[j]] += dist(points[i], q);
		cnt[labels[j]]++;
	});
	return sum.map((v, c) => (cnt[c] ? v / cnt[c] : NaN));
}

export interface Silhouette {
	a: number[];
	b: number[];
	s: number[];
	/** The neighbouring cluster that gives b(i). */
	nearest: number[];
	mean: number;
	/** Mean s per cluster. */
	perCluster: number[];
}

export function silhouette(points: Pt[], labels: number[]): Silhouette {
	const k = Math.max(...labels) + 1;
	const size = new Array(k).fill(0);
	labels.forEach((l) => size[l]++);
	const a: number[] = [];
	const b: number[] = [];
	const s: number[] = [];
	const nearest: number[] = [];
	points.forEach((_, i) => {
		const md = meanDistances(points, labels, i, k);
		const own = labels[i];
		let bi = Infinity;
		let nb = -1;
		md.forEach((d, c) => {
			if (c !== own && Number.isFinite(d) && d < bi) {
				bi = d;
				nb = c;
			}
		});
		const ai = size[own] > 1 ? md[own] : 0;
		a.push(ai);
		b.push(bi);
		nearest.push(nb);
		s.push(size[own] > 1 && nb >= 0 ? (bi - ai) / Math.max(ai, bi) : 0);
	});
	const perCluster = new Array(k).fill(0);
	s.forEach((v, i) => (perCluster[labels[i]] += v / size[labels[i]]));
	return { a, b, s, nearest, mean: s.reduce((x, y) => x + y, 0) / s.length, perCluster };
}

/** K-Means (best of a few k-means++ starts) for a given K. */
export function kmeansLabels(points: Pt[], k: number): number[] {
	let best: km.RunResult | null = null;
	for (let r = 0; r < 4; r++) {
		const res = km.run(points, km.plusPlusInit(points, k, 50 * k + r));
		if (!best || res.inertia < best.inertia) best = res;
	}
	return best!.labels;
}

/** Mean silhouette of the K-Means clustering for K = 2..kMax. */
export function silhouetteCurve(points: Pt[], kMax = 8): number[] {
	const out: number[] = [];
	for (let k = 2; k <= kMax; k++) out.push(silhouette(points, kmeansLabels(points, k)).mean);
	return out;
}

export function makeData(kind: Dataset): Labelled {
	if (kind === 'moons') return moons(160, 7, 0.05);
	return blobs(
		[
			{ c: [-0.55, 0.5], sx: 0.15, n: 30 },
			{ c: [0.55, 0.55], sx: 0.15, n: 30 },
			{ c: [-0.45, -0.5], sx: 0.15, n: 30 },
			{ c: [0.35, -0.35], sx: 0.15, n: 30 }
		],
		7
	);
}
