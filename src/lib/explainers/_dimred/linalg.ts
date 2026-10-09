/**
 * Small dense linear-algebra helpers shared by the dimensionality-reduction lessons.
 * Pure functions over plain arrays (rows = samples).
 */

export type Vec = number[];
export type Mat = number[][];

export function mean(X: Mat): Vec {
	const d = X[0]?.length ?? 0;
	const m = new Array(d).fill(0);
	for (const r of X) for (let j = 0; j < d; j++) m[j] += r[j];
	return m.map((v) => v / Math.max(1, X.length));
}

export function center(X: Mat, m = mean(X)): Mat {
	return X.map((r) => r.map((v, j) => v - m[j]));
}

/** Covariance (1/n)·XcᵀXc of the rows of X, as in the PCA formula. */
export function covariance(X: Mat): Mat {
	const n = X.length;
	const d = X[0]?.length ?? 0;
	const m = mean(X);
	const C: Mat = Array.from({ length: d }, () => new Array(d).fill(0));
	for (const r of X)
		for (let a = 0; a < d; a++) {
			const da = r[a] - m[a];
			for (let b = a; b < d; b++) C[a][b] += da * (r[b] - m[b]);
		}
	for (let a = 0; a < d; a++)
		for (let b = a; b < d; b++) {
			C[a][b] /= Math.max(1, n);
			C[b][a] = C[a][b];
		}
	return C;
}

export const dot = (a: Vec, b: Vec) => a.reduce((acc, v, i) => acc + v * b[i], 0);
export const norm = (a: Vec) => Math.sqrt(dot(a, a));

/** Variance of the data along unit direction u: uᵀ C u. */
export function varianceAlong(C: Mat, u: Vec): number {
	let v = 0;
	for (let a = 0; a < u.length; a++) for (let b = 0; b < u.length; b++) v += u[a] * C[a][b] * u[b];
	return v;
}

export interface Eigen {
	/** Eigenvalues, largest first. */
	values: number[];
	/** Unit eigenvectors, vectors[k] goes with values[k]. */
	vectors: Vec[];
}

/** Eigen-decomposition of a symmetric matrix (cyclic Jacobi), sorted by decreasing eigenvalue. */
export function eigSym(A: Mat): Eigen {
	const n = A.length;
	const a = A.map((r) => r.slice());
	const V: Mat = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
	for (let sweep = 0; sweep < 60; sweep++) {
		let off = 0;
		for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p][q] ** 2;
		if (off < 1e-22) break;
		for (let p = 0; p < n; p++)
			for (let q = p + 1; q < n; q++) {
				if (Math.abs(a[p][q]) < 1e-300) continue;
				const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
				const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
				const c = 1 / Math.sqrt(t * t + 1);
				const s = t * c;
				for (let k = 0; k < n; k++) {
					const akp = a[k][p];
					const akq = a[k][q];
					a[k][p] = c * akp - s * akq;
					a[k][q] = s * akp + c * akq;
				}
				for (let k = 0; k < n; k++) {
					const apk = a[p][k];
					const aqk = a[q][k];
					a[p][k] = c * apk - s * aqk;
					a[q][k] = s * apk + c * aqk;
				}
				for (let k = 0; k < n; k++) {
					const vkp = V[k][p];
					const vkq = V[k][q];
					V[k][p] = c * vkp - s * vkq;
					V[k][q] = s * vkp + c * vkq;
				}
			}
	}
	const order = Array.from({ length: n }, (_, i) => i).sort((i, j) => a[j][j] - a[i][i]);
	return {
		values: order.map((i) => a[i][i]),
		vectors: order.map((i) => {
			const v = V.map((r) => r[i]);
			// sign convention: largest-magnitude entry positive, so arrows don't flip between runs
			const big = v.reduce((bi, x, k) => (Math.abs(x) > Math.abs(v[bi]) ? k : bi), 0);
			return v[big] < 0 ? v.map((x) => -x) : v;
		})
	};
}

export interface PCAFit {
	mean: Vec;
	cov: Mat;
	values: number[];
	vectors: Vec[];
	/** Share of total variance per component. */
	ratio: number[];
}

export function pca(X: Mat): PCAFit {
	const m = mean(X);
	const cov = covariance(X);
	const { values, vectors } = eigSym(cov);
	const clean = values.map((v) => Math.max(0, v));
	const total = clean.reduce((a, b) => a + b, 0) || 1;
	return { mean: m, cov, values: clean, vectors, ratio: clean.map((v) => v / total) };
}

/** Coordinates of each row along the first k components. */
export function project(X: Mat, fit: PCAFit, k: number): Mat {
	return X.map((r) => fit.vectors.slice(0, k).map((v) => dot(v, r.map((x, j) => x - fit.mean[j]))));
}

/** Map k-component coordinates back into the original space. */
export function reconstruct(Z: Mat, fit: PCAFit): Mat {
	return Z.map((z) =>
		fit.mean.map((m, j) => m + z.reduce((acc, zk, k) => acc + zk * fit.vectors[k][j], 0))
	);
}

/** Mean squared reconstruction error (sum over features, averaged over rows). Equals the sum of the dropped eigenvalues. */
export function reconstructionError(X: Mat, R: Mat): number {
	let e = 0;
	X.forEach((r, i) => r.forEach((v, j) => (e += (v - R[i][j]) ** 2)));
	return e / Math.max(1, X.length);
}
