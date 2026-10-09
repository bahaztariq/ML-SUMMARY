/**
 * Seeded 2-D toy datasets shared by the classifier lessons (logistic regression, SVM,
 * naive Bayes, k-NN). Points live roughly in [-1, 1]², labels are 0 (class A) or 1 (class B).
 */
import { gaussian, mulberry32 } from '#lib/viz/canvas.ts';

export type Pt = [number, number];

export interface Data {
	X: Pt[];
	/** 0 = class A, 1 = class B. */
	y: number[];
}

export interface BlobOpts {
	/** Centres of class A and class B. */
	c0?: Pt;
	c1?: Pt;
	/** Standard deviation along x₁ and x₂ (shared by both classes unless spread1 is set). */
	spread?: Pt;
	spread1?: Pt;
	/** Correlation between x₁ and x₂ inside each class (−1…1). */
	corr?: number;
	/** Number of class-A points (rest are B). */
	n0?: number;
}

/** Two Gaussian blobs. Points alternate A, B, A, B… until one class is full. */
export function blobs(seed: number, n: number, o: BlobOpts = {}): Data {
	const { c0 = [-0.4, -0.35], c1 = [0.4, 0.35], spread = [0.22, 0.22], corr = 0 } = o;
	const spread1 = o.spread1 ?? spread;
	const n0 = o.n0 ?? Math.round(n / 2);
	const g = gaussian(mulberry32(seed));
	const X: Pt[] = [];
	const y: number[] = [];
	let a = 0;
	let b = 0;
	while (a + b < n) {
		const c = (a < n0 && (a <= b || b >= n - n0)) ? 0 : 1;
		const [cx, cy] = c ? c1 : c0;
		const [sx, sy] = c ? spread1 : spread;
		const u = g();
		const v = corr * u + Math.sqrt(1 - corr * corr) * g();
		X.push([cx + u * sx, cy + v * sy]);
		y.push(c);
		if (c) b++;
		else a++;
	}
	return { X, y };
}

/** Two interleaving half-moons (A on top, B below). */
export function moons(seed: number, n: number, noise = 0.12, n0 = Math.round(n / 2)): Data {
	const rand = mulberry32(seed);
	const g = gaussian(rand);
	const X: Pt[] = [];
	const y: number[] = [];
	for (let i = 0; i < n; i++) {
		const c = i < n0 ? 0 : 1;
		const t = Math.PI * rand();
		const x = c === 0 ? Math.cos(t) : 1 - Math.cos(t);
		const yy = c === 0 ? Math.sin(t) : 0.5 - Math.sin(t);
		X.push([(x - 0.5) * 0.95 + g() * noise, (yy - 0.25) * 1.15 + g() * noise]);
		y.push(c);
	}
	return interleave({ X, y });
}

/** Class B in a central blob, class A in a ring around it. */
export function circles(seed: number, n: number, noise = 0.07): Data {
	const rand = mulberry32(seed);
	const g = gaussian(rand);
	const X: Pt[] = [];
	const y: number[] = [];
	for (let i = 0; i < n; i++) {
		const c = i % 2;
		const t = 2 * Math.PI * rand();
		const r = c ? 0.32 * Math.sqrt(rand()) : 0.82;
		X.push([r * Math.cos(t) + g() * noise, r * Math.sin(t) + g() * noise]);
		y.push(c === 1 ? 1 : 0);
	}
	return { X, y };
}

/** Flip the label of a fraction of the points (deterministic). */
export function flipLabels(d: Data, frac: number, seed: number): Data {
	const rand = mulberry32(seed);
	return { X: d.X, y: d.y.map((c) => (rand() < frac ? 1 - c : c)) };
}

/** Mix the classes so that index order carries no information (A/B alternate where possible). */
function interleave(d: Data): Data {
	const a = d.X.map((p, i) => i).filter((i) => d.y[i] === 0);
	const b = d.X.map((p, i) => i).filter((i) => d.y[i] === 1);
	const order: number[] = [];
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		if (i < a.length) order.push(a[i]);
		if (i < b.length) order.push(b[i]);
	}
	return { X: order.map((i) => d.X[i]), y: order.map((i) => d.y[i]) };
}

export const clonePts = (X: readonly (readonly number[])[]): Pt[] => X.map((p) => [p[0], p[1]]);

export function counts(y: readonly number[]): [number, number] {
	let b = 0;
	for (const c of y) b += c;
	return [y.length - b, b];
}

/** Fraction of points whose predicted class matches the label. */
export function accuracy(d: Data, predict: (p: Pt) => number): number {
	if (!d.X.length) return NaN;
	let ok = 0;
	d.X.forEach((p, i) => {
		if (predict(p) === d.y[i]) ok++;
	});
	return ok / d.X.length;
}

/** Tiny memo with a size cap (fits, rasters…) so heavy work runs once per setting. */
export function memo<T>(cap = 200) {
	const m = new Map<string, T>();
	return (key: string, make: () => T): T => {
		let v = m.get(key);
		if (v === undefined) {
			if (m.size >= cap) m.clear();
			v = make();
			m.set(key, v);
		}
		return v;
	};
}

/** Short stable key for a point set (used to memoize fits on draggable data). */
export function ptsKey(X: readonly (readonly number[])[], y?: readonly number[]): string {
	let s = '';
	for (let i = 0; i < X.length; i++) s += `${X[i][0].toFixed(4)},${X[i][1].toFixed(4)}${y ? ':' + y[i] : ''};`;
	return s;
}
