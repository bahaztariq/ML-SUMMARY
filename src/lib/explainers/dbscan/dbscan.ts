/**
 * DBSCAN building blocks: ε-neighbourhoods, core / border / noise, and cluster growth
 * by density-reachability (recorded in order so the lesson can animate it).
 */
import { blobs, concat, dist, moons, rings, scatterNoise, type Labelled, type Pt } from '../_clustering/data';

export type Kind = 'core' | 'border' | 'noise';
export type Dataset = 'moons' | 'rings' | 'blobs' | 'density';

/** Indices within ε of each point. The point itself is included, as in scikit-learn. */
export function neighbourhoods(points: Pt[], eps: number): number[][] {
	const out: number[][] = points.map((_, i) => [i]);
	for (let i = 0; i < points.length; i++)
		for (let j = i + 1; j < points.length; j++)
			if (dist(points[i], points[j]) <= eps) {
				out[i].push(j);
				out[j].push(i);
			}
	return out;
}

/** One event in the growth animation: point `i` joins cluster `c`, reached from core point `from` (-1 = seed). */
export interface Grow {
	i: number;
	from: number;
	c: number;
}

export interface DbscanResult {
	/** Cluster id per point, -1 = noise. */
	labels: number[];
	kind: Kind[];
	nClusters: number;
	/** Order in which points were claimed. */
	order: Grow[];
	nbrs: number[][];
	counts: Record<Kind, number>;
}

export function dbscan(points: Pt[], eps: number, minPts: number): DbscanResult {
	const nbrs = neighbourhoods(points, eps);
	const isCore = nbrs.map((n) => n.length >= minPts);
	const labels = points.map(() => -1);
	const order: Grow[] = [];
	let c = 0;
	for (let i = 0; i < points.length; i++) {
		if (labels[i] !== -1 || !isCore[i]) continue;
		labels[i] = c;
		order.push({ i, from: -1, c });
		const queue = [i];
		while (queue.length) {
			const p = queue.shift()!;
			for (const q of nbrs[p]) {
				if (labels[q] !== -1) continue;
				labels[q] = c;
				order.push({ i: q, from: p, c });
				// Only core points pass the cluster on; border points are reached but stop the chain.
				if (isCore[q]) queue.push(q);
			}
		}
		c++;
	}
	const kind: Kind[] = points.map((_, i) => (isCore[i] ? 'core' : labels[i] >= 0 ? 'border' : 'noise'));
	const counts = { core: 0, border: 0, noise: 0 };
	kind.forEach((k) => counts[k]++);
	return { labels, kind, nClusters: c, order, nbrs, counts };
}

/**
 * Distance from each point to its k-th nearest *other* point, sorted ascending.
 * With k = minPts − 1 a point is core exactly when this distance is ≤ ε.
 */
export function kDistances(points: Pt[], k: number): number[] {
	return points
		.map((p, i) => {
			const d = points.filter((_, j) => j !== i).map((q) => dist(p, q));
			d.sort((a, b) => a - b);
			return d[Math.min(k, d.length) - 1] ?? 0;
		})
		.sort((a, b) => a - b);
}

export function makeData(kind: Dataset): Labelled {
	switch (kind) {
		case 'moons':
			return concat(moons(220, 11, 0.055), scatterNoise(14, 5));
		case 'rings':
			return concat(rings(230, 4, [0.32, 0.82], 0.035), scatterNoise(10, 9));
		case 'blobs':
			return concat(
				blobs(
					[
						{ c: [-0.5, 0.45], sx: 0.13, n: 70 },
						{ c: [0.5, 0.4], sx: 0.11, n: 60 },
						{ c: [0.0, -0.5], sx: 0.15, n: 70 }
					],
					21
				),
				scatterNoise(18, 3)
			);
		case 'density':
			return blobs(
				[
					{ c: [-0.7, 0.45], sx: 0.05, n: 60 },
					{ c: [-0.25, 0.45], sx: 0.05, n: 60 },
					{ c: [0.38, -0.32], sx: 0.26, n: 70 }
				],
				8
			);
	}
}
