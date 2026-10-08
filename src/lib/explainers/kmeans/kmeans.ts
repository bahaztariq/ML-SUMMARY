/**
 * K-Means building blocks. Pure functions over plain arrays so they can be unit-tested
 * and replayed deterministically by the explainer.
 */
import { gaussian, mulberry32 } from '#lib/viz/canvas.ts';

export type Pt = [number, number];
export type Dataset = 'blobs' | 'uneven' | 'moons';

const BLOB_CENTERS: Pt[] = [
	[-0.55, 0.5],
	[0.55, 0.55],
	[-0.45, -0.5],
	[0.5, -0.45]
];

/** Points live roughly in [-1, 1]². */
export function makeData(kind: Dataset, seed: number, n = 280): Pt[] {
	const rand = mulberry32(seed);
	const g = gaussian(rand);
	const pts: Pt[] = [];
	if (kind === 'moons') {
		for (let i = 0; i < n; i++) {
			const upper = i % 2 === 0;
			const t = Math.PI * rand();
			const x = upper ? Math.cos(t) : 1 - Math.cos(t);
			const y = upper ? Math.sin(t) : 0.5 - Math.sin(t);
			pts.push([(x - 0.5) * 0.9 + g() * 0.07, (y - 0.25) * 1.1 + g() * 0.07]);
		}
		return pts;
	}
	// 'uneven': one big wide cluster and three small tight ones
	const spreads = kind === 'uneven' ? [0.3, 0.07, 0.07, 0.07] : [0.16, 0.16, 0.16, 0.16];
	const weights = kind === 'uneven' ? [0.7, 0.1, 0.1, 0.1] : [0.25, 0.25, 0.25, 0.25];
	for (let c = 0; c < 4; c++) {
		const m = Math.round(n * weights[c]);
		const [cx, cy] = BLOB_CENTERS[c];
		for (let i = 0; i < m; i++) pts.push([cx + g() * spreads[c], cy + g() * spreads[c]]);
	}
	return pts;
}

export const dist2 = (a: Pt, b: Pt) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

export function nearest(p: Pt, centroids: Pt[]): number {
	let best = 0;
	let bd = Infinity;
	for (let j = 0; j < centroids.length; j++) {
		const d = dist2(p, centroids[j]);
		if (d < bd) {
			bd = d;
			best = j;
		}
	}
	return best;
}

/** Move 1: every point joins its nearest centroid. */
export function assign(points: Pt[], centroids: Pt[]): number[] {
	return points.map((p) => nearest(p, centroids));
}

/** Move 2: every centroid jumps to the mean of its points (stays put if it has none). */
export function update(points: Pt[], labels: number[], centroids: Pt[]): Pt[] {
	const sum = centroids.map(() => [0, 0, 0]);
	points.forEach((p, i) => {
		const s = sum[labels[i]];
		if (!s) return;
		s[0] += p[0];
		s[1] += p[1];
		s[2]++;
	});
	return centroids.map((c, j) => (sum[j][2] ? [sum[j][0] / sum[j][2], sum[j][1] / sum[j][2]] : [c[0], c[1]]));
}

/** Sum of squared distances from each point to its centroid (what K-Means minimizes). */
export function inertia(points: Pt[], labels: number[], centroids: Pt[]): number {
	let total = 0;
	points.forEach((p, i) => {
		if (labels[i] >= 0 && centroids[labels[i]]) total += dist2(p, centroids[labels[i]]);
	});
	return total;
}

/** K random points from the data. */
export function randomInit(points: Pt[], k: number, seed: number): Pt[] {
	const rand = mulberry32(seed);
	const picked = new Set<number>();
	while (picked.size < Math.min(k, points.length)) picked.add(Math.floor(rand() * points.length));
	return [...picked].map((i) => [points[i][0], points[i][1]]);
}

/** k-means++: each new centroid is drawn with probability ∝ squared distance to the nearest one so far. */
export function plusPlusInit(points: Pt[], k: number, seed: number): Pt[] {
	const rand = mulberry32(seed);
	const first = points[Math.floor(rand() * points.length)];
	const cs: Pt[] = [[first[0], first[1]]];
	while (cs.length < k) {
		const d = points.map((p) => dist2(p, cs[nearest(p, cs)]));
		const total = d.reduce((a, b) => a + b, 0);
		let r = rand() * total;
		let i = 0;
		while (i < d.length - 1 && (r -= d[i]) > 0) i++;
		cs.push([points[i][0], points[i][1]]);
	}
	return cs;
}

export interface RunResult {
	centroids: Pt[];
	labels: number[];
	inertia: number;
	iterations: number;
}

/** Full Lloyd's algorithm until labels stop changing. */
export function run(points: Pt[], init: Pt[], maxIter = 100): RunResult {
	let centroids = init.map((c) => [c[0], c[1]] as Pt);
	let labels = assign(points, centroids);
	let it = 0;
	while (it++ < maxIter) {
		centroids = update(points, labels, centroids);
		const next = assign(points, centroids);
		if (next.every((l, i) => l === labels[i])) break;
		labels = next;
	}
	return { centroids, labels, inertia: inertia(points, labels, centroids), iterations: it };
}

/** Best-of-n k-means++ inertia for each K — the data behind the elbow plot. */
export function elbow(points: Pt[], kMax = 8, nInit = 4): number[] {
	const out: number[] = [];
	for (let k = 1; k <= kMax; k++) {
		let best = Infinity;
		for (let r = 0; r < nInit; r++) best = Math.min(best, run(points, plusPlusInit(points, k, 1000 * k + r)).inertia);
		out.push(best);
	}
	return out;
}
