/**
 * PCA lesson data and helpers. Pure functions over plain arrays, deterministic for a seed.
 */
import { gaussian, mulberry32 } from '#lib/viz/canvas.ts';
import * as la from '../_dimred/linalg.ts';

export type Mat = la.Mat;

/** 2-D cloud stretched along ~32°, centred away from the origin. */
export function makeCorr(seed = 5, n = 200): Mat {
	const g = gaussian(mulberry32(seed));
	const th = (32 * Math.PI) / 180;
	const c = Math.cos(th);
	const s = Math.sin(th);
	return Array.from({ length: n }, () => {
		const a = g() * 1.25;
		const b = g() * 0.42;
		return [1.8 + c * a - s * b, 1.2 + s * a + c * b];
	});
}

export const CORR_MEAN = [1.8, 1.2];

/** Rotation that tilts the pancake's plane so it's not lined up with any axis. */
function tilt(): Mat {
	const ax = 0.9; // around x₁
	const az = 0.55; // around x₃
	const Rx = [
		[1, 0, 0],
		[0, Math.cos(ax), -Math.sin(ax)],
		[0, Math.sin(ax), Math.cos(ax)]
	];
	const Rz = [
		[Math.cos(az), -Math.sin(az), 0],
		[Math.sin(az), Math.cos(az), 0],
		[0, 0, 1]
	];
	return Rz.map((r) => [0, 1, 2].map((j) => r.reduce((acc, v, k) => acc + v * Rx[k][j], 0)));
}

export const PANCAKE_GROUPS = 3;

/** Three blobs lying in a tilted plane in 3-D, plus a little off-plane noise. Labels = blob. */
export function makePancake(seed = 11, perGroup = 70): { X: Mat; y: number[] } {
	const g = gaussian(mulberry32(seed));
	const centers = [
		[-1.6, -0.7],
		[1.5, -0.9],
		[0.1, 1.45]
	];
	const R = tilt();
	const X: Mat = [];
	const y: number[] = [];
	centers.forEach(([cu, cv], k) => {
		for (let i = 0; i < perGroup; i++) {
			const p = [cu + g() * 0.5, cv + g() * 0.5, g() * 0.3];
			X.push(R.map((r) => r[0] * p[0] + r[1] * p[1] + r[2] * p[2]));
			y.push(k);
		}
	});
	const m = la.mean(X);
	return { X: la.center(X, m), y };
}

export type Units = 'mm' | 'm' | 'z';

/** Height (mm) and weight (kg) of 200 adults, correlation ≈ 0.7. */
export function makeBody(seed = 3, n = 200): Mat {
	const g = gaussian(mulberry32(seed));
	return Array.from({ length: n }, () => {
		const a = g();
		const b = g();
		return [1700 + 90 * a, 72 + 12 * (0.7 * a + 0.714 * b)];
	});
}

/** Express body data in the chosen units: height in mm or m, or both features standardized. */
export function inUnits(X: Mat, units: Units): Mat {
	if (units === 'mm') return X.map((r) => [r[0], r[1]]);
	if (units === 'm') return X.map((r) => [r[0] / 1000, r[1]]);
	const m = la.mean(X);
	const sd = [0, 1].map((j) => Math.sqrt(X.reduce((acc, r) => acc + (r[j] - m[j]) ** 2, 0) / X.length));
	return X.map((r) => [(r[0] - m[0]) / sd[0], (r[1] - m[1]) / sd[1]]);
}

/** Direction angle in degrees, folded into [0, 180). */
export function angleOf(v: la.Vec): number {
	const a = (Math.atan2(v[1], v[0]) * 180) / Math.PI;
	return ((a % 180) + 180) % 180;
}

export const unit = (deg: number) => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];

/** Smallest difference between two undirected angles (degrees, period 180). */
export function angleGap(a: number, b: number): number {
	const d = Math.abs((((a - b) % 180) + 180) % 180);
	return Math.min(d, 180 - d);
}
