/**
 * PCA explainer state. It only holds small settings; data and fits come from memoized pure
 * functions so heavy arrays never become reactive proxies.
 */
import * as la from '../_dimred/linalg.ts';
import type { View3 } from '../_dimred/view3d.ts';
import * as P from './pca.ts';

export type Dataset = 'corr' | 'pancake' | 'body';

export interface PCAState {
	dataset: Dataset;
	/** 2-D cloud: subtract the mean? */
	centered: boolean;
	/** Projection direction in degrees (2-D cloud). */
	angle: number;
	/** Components kept for the reconstruction (3-D cloud). */
	k: number;
	units: P.Units;
	view: View3;
	show: {
		mean: boolean;
		proj: boolean;
		pc1: boolean;
		pc2: boolean;
		curve: boolean;
		scree: boolean;
		recon: boolean;
		shadow: boolean;
	};
	ui: { angle: boolean; k: boolean; units: boolean; dataset: boolean; rotate: boolean; center: boolean };
	did: { angle: boolean; rotate: boolean; units: P.Units[] };
}

const memo = new Map<string, unknown>();
function cached<T>(key: string, make: () => T): T {
	if (!memo.has(key)) memo.set(key, make());
	return memo.get(key) as T;
}

export const corrData = () => cached('corr', () => P.makeCorr());
export const corrCentered = () => cached('corrC', () => la.center(corrData()));
export const corrFit = () => cached('corrFit', () => la.pca(corrData()));

export const pancake = () => cached('pancake', () => P.makePancake());
export const pancakeFit = () => cached('pancakeFit', () => la.pca(pancake().X));
export const pancakeShadow = () => cached('shadow', () => la.project(pancake().X, pancakeFit(), 2));
export const pancakeRecon = (k: number) =>
	cached(`recon${k}`, () => la.reconstruct(la.project(pancake().X, pancakeFit(), k), pancakeFit()));
export const reconError = (k: number) => cached(`err${k}`, () => la.reconstructionError(pancake().X, pancakeRecon(k)));

export const bodyRaw = () => cached('body', () => P.makeBody());
export const bodyData = (u: P.Units) => cached(`body${u}`, () => la.center(P.inUnits(bodyRaw(), u)));
export const bodyFit = (u: P.Units) => cached(`bodyFit${u}`, () => la.pca(bodyData(u)));

/** Variance of the centred 2-D cloud along the current direction. */
export const projVar = (s: PCAState) => la.varianceAlong(corrFit().cov, P.unit(s.angle));
export const totalVar2 = () => corrFit().values[0] + corrFit().values[1];
export const pc1Angle = () => P.angleOf(corrFit().vectors[0]);
export const pc2Angle = () => P.angleOf(corrFit().vectors[1]);

/** Camera directions in data coordinates for the 3-D view. */
export function cameraAxes(v: View3) {
	const cy = Math.cos(v.yaw);
	const sy = Math.sin(v.yaw);
	const cp = Math.cos(v.pitch);
	const sp = Math.sin(v.pitch);
	return {
		right: [cy, -sy, 0],
		up: [sp * sy, sp * cy, cp],
		toward: [-cp * sy, -cp * cy, sp]
	};
}

/** Share of the total variance that is visible on screen (the rest is along the line of sight). */
export function screenShare(v: View3) {
	const f = pancakeFit();
	const total = f.values.reduce((a, b) => a + b, 0);
	return 1 - la.varianceAlong(f.cov, cameraAxes(v).toward) / total;
}
/** Best possible on-screen share: looking straight down PC3 (= PC1 + PC2 ratio). */
export const bestShare = () => pancakeFit().ratio[0] + pancakeFit().ratio[1];

/** The view looking straight down PC3, i.e. straight onto the PC1–PC2 plane. */
export function faceOn(): View3 {
	const v = pancakeFit().vectors[2];
	const sign = v[2] >= 0 ? 1 : -1;
	return { yaw: Math.atan2(-v[0] * sign, -v[1] * sign), pitch: Math.asin(Math.min(1, Math.abs(v[2]))) };
}

export const pct = (v: number, d = 0) => (Number.isFinite(v) ? `${(v * 100).toFixed(d)}%` : '—');
export const deg = (v: number) => `${Math.round(v)}°`;

export function setDataset(s: PCAState, d: Dataset) {
	s.dataset = d;
	if (d === 'corr') s.centered = true;
}

export function setAngle(s: PCAState, a: number) {
	s.angle = ((a % 180) + 180) % 180;
	s.did.angle = true;
}

export function setUnits(s: PCAState, u: P.Units) {
	s.units = u;
	if (!s.did.units.includes(u)) s.did.units.push(u);
}

export const off = { angle: false, k: false, units: false, dataset: false, rotate: false, center: false };
export const hidden = { mean: false, proj: false, pc1: false, pc2: false, curve: false, scree: false, recon: false, shadow: false };
export const START_VIEW: View3 = { yaw: 0.35, pitch: 0.12 };

export function init(): PCAState {
	return {
		dataset: 'corr',
		centered: false,
		angle: 120,
		k: 3,
		units: 'mm',
		view: { ...START_VIEW },
		show: { ...hidden, mean: true },
		ui: { ...off },
		did: { angle: false, rotate: false, units: [] }
	};
}
