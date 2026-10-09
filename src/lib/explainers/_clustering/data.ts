/**
 * Seeded 2-D datasets and distance helpers shared by the clustering lessons
 * (DBSCAN, hierarchical clustering, GMM, silhouette). Points live roughly in [-1, 1]².
 */
import { gaussian, mulberry32 } from '#lib/viz/canvas.ts';

export type Pt = [number, number];

export interface Labelled {
	points: Pt[];
	/** Generating group of each point (-1 = background noise). */
	truth: number[];
}

export const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export interface BlobSpec {
	c: Pt;
	/** Standard deviation along the blob's own x axis. */
	sx: number;
	/** Standard deviation along the blob's own y axis (defaults to sx). */
	sy?: number;
	/** Rotation in degrees. */
	rot?: number;
	n: number;
}

/** Gaussian blobs, optionally stretched and rotated. */
export function blobs(specs: BlobSpec[], seed: number): Labelled {
	const g = gaussian(mulberry32(seed));
	const points: Pt[] = [];
	const truth: number[] = [];
	specs.forEach((b, j) => {
		const a = ((b.rot ?? 0) * Math.PI) / 180;
		const cos = Math.cos(a);
		const sin = Math.sin(a);
		for (let i = 0; i < b.n; i++) {
			const u = g() * b.sx;
			const v = g() * (b.sy ?? b.sx);
			points.push([b.c[0] + u * cos - v * sin, b.c[1] + u * sin + v * cos]);
			truth.push(j);
		}
	});
	return { points, truth };
}

/** Two interlocking half-circles. */
export function moons(n: number, seed: number, noise = 0.06): Labelled {
	const rand = mulberry32(seed);
	const g = gaussian(rand);
	const points: Pt[] = [];
	const truth: number[] = [];
	for (let i = 0; i < n; i++) {
		const upper = i % 2 === 0;
		const t = Math.PI * rand();
		const x = upper ? Math.cos(t) : 1 - Math.cos(t);
		const y = upper ? Math.sin(t) : 0.5 - Math.sin(t);
		points.push([(x - 0.5) * 0.68 + g() * noise, (y - 0.25) * 0.95 + g() * noise]);
		truth.push(upper ? 0 : 1);
	}
	return { points, truth };
}

/** Concentric rings. */
export function rings(n: number, seed: number, radii: [number, number] = [0.32, 0.85], noise = 0.04): Labelled {
	const rand = mulberry32(seed);
	const g = gaussian(rand);
	const points: Pt[] = [];
	const truth: number[] = [];
	const nInner = Math.round((n * radii[0]) / (radii[0] + radii[1]));
	for (let i = 0; i < n; i++) {
		const inner = i < nInner;
		const r = (inner ? radii[0] : radii[1]) + g() * noise;
		const t = 2 * Math.PI * rand();
		points.push([r * Math.cos(t), r * Math.sin(t)]);
		truth.push(inner ? 0 : 1);
	}
	return { points, truth };
}

/** Uniform background points in the square [lo, hi]². */
export function scatterNoise(n: number, seed: number, lo = -1.05, hi = 1.05): Labelled {
	const rand = mulberry32(seed);
	const points: Pt[] = [];
	for (let i = 0; i < n; i++) points.push([lo + (hi - lo) * rand(), lo + (hi - lo) * rand()]);
	return { points, truth: points.map(() => -1) };
}

export function concat(...parts: Labelled[]): Labelled {
	return { points: parts.flatMap((p) => p.points), truth: parts.flatMap((p) => p.truth) };
}

/** Points evenly spaced on a segment (with a little seeded jitter). */
export function segment(a: Pt, b: Pt, n: number, seed: number, jitter = 0.01, label = 0): Labelled {
	const g = gaussian(mulberry32(seed));
	const points: Pt[] = [];
	for (let i = 1; i <= n; i++) {
		const t = i / (n + 1);
		points.push([a[0] + (b[0] - a[0]) * t + g() * jitter, a[1] + (b[1] - a[1]) * t + g() * jitter]);
	}
	return { points, truth: points.map(() => label) };
}

/** Index of the point closest to `p`. */
export function closest(points: Pt[], p: Pt): number {
	let best = -1;
	let bd = Infinity;
	points.forEach((q, i) => {
		const d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2;
		if (d < bd) {
			bd = d;
			best = i;
		}
	});
	return best;
}

/** One-entry memo: recompute only when the key changes. */
export function memo1<A extends unknown[], R>(fn: (...args: A) => R, key: (...args: A) => string) {
	let lastKey: string | null = null;
	let last: R;
	return (...args: A): R => {
		const k = key(...args);
		if (k !== lastKey) {
			last = fn(...args);
			lastKey = k;
		}
		return last;
	};
}

/** Keyed memo for a small, bounded set of keys (datasets × K, …). */
export function memoMap<A extends unknown[], R>(fn: (...args: A) => R, key: (...args: A) => string, max = 64) {
	const cache = new Map<string, R>();
	return (...args: A): R => {
		const k = key(...args);
		let v = cache.get(k);
		if (v === undefined) {
			v = fn(...args);
			if (cache.size >= max) cache.delete(cache.keys().next().value as string);
			cache.set(k, v);
		}
		return v;
	};
}
