/**
 * Second-order regression trees, the building block shared by the boosting lessons.
 *
 * Every row carries a gradient g and a hessian h of the loss with respect to the current
 * prediction. A leaf holding rows with sums G, H gets the weight w* = −G / (H + λ), and a split's
 * gain is ½·[G_L²/(H_L+λ) + G_R²/(H_R+λ) − G²/(H+λ)] (the XGBoost paper's formula; γ is
 * subtracted when pruning).
 *
 * With squared loss g = F − y and h = 1, so with λ = 0 the leaf weight is the mean residual and the
 * gain is half the drop in squared error: exactly a classic CART regression tree on the residuals.
 *
 * Missing values (NaN) are handled XGBoost-style: each candidate split tries sending all missing
 * rows left and right and keeps the better direction.
 */

export type Row = readonly number[];

export interface BSplit {
	f: number;
	thr: number;
	/** Gain before subtracting γ. */
	gain: number;
	/** Where rows with a missing value of feature f go. */
	missLeft: boolean;
}

export interface BNode {
	id: number;
	depth: number;
	n: number;
	G: number;
	H: number;
	/** Optimal leaf weight −G/(H+λ) (also stored on internal nodes). */
	w: number;
	split?: BSplit;
	left?: BNode;
	right?: BNode;
}

export interface TreeOpts {
	maxDepth: number;
	lambda?: number;
	/** Minimum gain a split must reach to survive pruning (XGBoost's γ / min_split_loss). */
	gamma?: number;
	/** Minimum hessian sum in each child. */
	minChildWeight?: number;
	/** Minimum number of rows in each child. */
	minLeaf?: number;
	/** Features the tree may use (default: all). */
	features?: readonly number[];
}

export const score = (G: number, H: number, lambda: number) => (H + lambda > 0 ? (G * G) / (H + lambda) : 0);

export function splitGain(GL: number, HL: number, GR: number, HR: number, lambda: number) {
	return 0.5 * (score(GL, HL, lambda) + score(GR, HR, lambda) - score(GL + GR, HL + HR, lambda));
}

export const leafWeight = (G: number, H: number, lambda: number) => (H + lambda > 0 ? -G / (H + lambda) : 0);

export interface Candidate extends BSplit {
	GL: number;
	HL: number;
	GR: number;
	HR: number;
	nL: number;
	nR: number;
	/** Gains with missing rows sent left / right (equal when nothing is missing). */
	gainMissLeft: number;
	gainMissRight: number;
}

const isMissing = (v: number) => Number.isNaN(v);

/** Sums of g and h (and the count) for the rows in `idx`. */
export function sums(g: readonly number[], h: readonly number[], idx: readonly number[]) {
	let G = 0;
	let H = 0;
	for (const i of idx) {
		G += g[i];
		H += h[i];
	}
	return { G, H, n: idx.length };
}

/**
 * Score one split `x[f] <= thr` on the rows in `idx`, trying missing rows on both sides.
 */
export function evalSplit(
	X: readonly Row[],
	g: readonly number[],
	h: readonly number[],
	idx: readonly number[],
	f: number,
	thr: number,
	lambda: number
): Candidate {
	let GL = 0,
		HL = 0,
		nL = 0,
		GR = 0,
		HR = 0,
		nR = 0,
		GM = 0,
		HM = 0,
		nM = 0;
	for (const i of idx) {
		const v = X[i][f];
		if (isMissing(v)) {
			GM += g[i];
			HM += h[i];
			nM++;
		} else if (v <= thr) {
			GL += g[i];
			HL += h[i];
			nL++;
		} else {
			GR += g[i];
			HR += h[i];
			nR++;
		}
	}
	return pack(f, thr, GL, HL, nL, GR, HR, nR, GM, HM, nM, lambda);
}

function pack(
	f: number,
	thr: number,
	GL: number,
	HL: number,
	nL: number,
	GR: number,
	HR: number,
	nR: number,
	GM: number,
	HM: number,
	nM: number,
	lambda: number
): Candidate {
	const gl = splitGain(GL + GM, HL + HM, GR, HR, lambda);
	const gr = splitGain(GL, HL, GR + GM, HR + HM, lambda);
	const missLeft = nM === 0 || gl >= gr;
	return missLeft
		? { f, thr, gain: gl, missLeft, GL: GL + GM, HL: HL + HM, GR, HR, nL: nL + nM, nR, gainMissLeft: gl, gainMissRight: gr }
		: { f, thr, gain: gr, missLeft, GL, HL, GR: GR + GM, HR: HR + HM, nL, nR: nR + nM, gainMissLeft: gl, gainMissRight: gr };
}

/**
 * Every threshold on feature f (midpoints between consecutive distinct present values), scored.
 */
export function candidates(
	X: readonly Row[],
	g: readonly number[],
	h: readonly number[],
	idx: readonly number[],
	f: number,
	lambda: number
): Candidate[] {
	const present: number[] = [];
	let GM = 0,
		HM = 0,
		nM = 0;
	for (const i of idx) {
		if (isMissing(X[i][f])) {
			GM += g[i];
			HM += h[i];
			nM++;
		} else present.push(i);
	}
	present.sort((a, b) => X[a][f] - X[b][f]);
	let GT = 0,
		HT = 0;
	for (const i of present) {
		GT += g[i];
		HT += h[i];
	}
	const out: Candidate[] = [];
	let GL = 0,
		HL = 0;
	for (let k = 0; k < present.length - 1; k++) {
		const i = present[k];
		GL += g[i];
		HL += h[i];
		const v = X[i][f];
		const next = X[present[k + 1]][f];
		if (next === v) continue;
		out.push(pack(f, (v + next) / 2, GL, HL, k + 1, GT - GL, HT - HL, present.length - k - 1, GM, HM, nM, lambda));
	}
	return out;
}

/** Best split over the allowed features, respecting the child constraints. Null if nothing has positive gain. */
export function bestSplit(
	X: readonly Row[],
	g: readonly number[],
	h: readonly number[],
	idx: readonly number[],
	opts: TreeOpts
): Candidate | null {
	const lambda = opts.lambda ?? 0;
	const mcw = opts.minChildWeight ?? 0;
	const minLeaf = opts.minLeaf ?? 1;
	const feats = opts.features ?? X[0].map((_, f) => f);
	let best: Candidate | null = null;
	for (const f of feats) {
		for (const c of candidates(X, g, h, idx, f, lambda)) {
			if (c.nL < minLeaf || c.nR < minLeaf || c.HL < mcw || c.HR < mcw) continue;
			if (c.gain <= 1e-12) continue;
			if (!best || c.gain > best.gain + 1e-12) best = c;
		}
	}
	return best;
}

export const goesLeft = (s: BSplit, x: Row) => (isMissing(x[s.f]) ? s.missLeft : x[s.f] <= s.thr);

/**
 * Grow depth-first to max_depth, then prune bottom-up every split whose gain is below γ
 * (as described in the XGBoost paper).
 */
export function growTree(
	X: readonly Row[],
	g: readonly number[],
	h: readonly number[],
	idx: readonly number[],
	opts: TreeOpts
): BNode {
	const lambda = opts.lambda ?? 0;
	const gamma = opts.gamma ?? 0;
	let nextId = 0;
	const grow = (rows: number[], depth: number): BNode => {
		const { G, H, n } = sums(g, h, rows);
		const node: BNode = { id: nextId++, depth, n, G, H, w: leafWeight(G, H, lambda) };
		if (depth >= opts.maxDepth || rows.length < 2) return node;
		const c = bestSplit(X, g, h, rows, opts);
		if (!c) return node;
		node.split = { f: c.f, thr: c.thr, gain: c.gain, missLeft: c.missLeft };
		const L: number[] = [];
		const R: number[] = [];
		for (const i of rows) (goesLeft(node.split, X[i]) ? L : R).push(i);
		node.left = grow(L, depth + 1);
		node.right = grow(R, depth + 1);
		return node;
	};
	const prune = (n: BNode): BNode => {
		if (!n.left || !n.right || !n.split) return n;
		n.left = prune(n.left);
		n.right = prune(n.right);
		if (isLeaf(n.left) && isLeaf(n.right) && n.split.gain < gamma) {
			delete n.left;
			delete n.right;
			delete n.split;
		}
		return n;
	};
	return prune(grow([...idx], 0));
}

export const isLeaf = (n: BNode) => !n.left || !n.right;

export function leafOf(node: BNode, x: Row): BNode {
	while (node.split && node.left && node.right) node = goesLeft(node.split, x) ? node.left : node.right;
	return node;
}

export const predictTree = (node: BNode, x: Row) => leafOf(node, x).w;

export function leaves(node: BNode): BNode[] {
	return node.left && node.right ? [...leaves(node.left), ...leaves(node.right)] : [node];
}

export function depthOf(node: BNode): number {
	return node.left && node.right ? Math.max(depthOf(node.left), depthOf(node.right)) : node.depth;
}

/* ---------------- losses ---------------- */

export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
export const logit = (p: number) => Math.log(p / (1 - p));

/** Mean log-loss of probabilities p for labels y. */
export function logLoss(p: readonly number[], y: readonly number[]) {
	let s = 0;
	for (let i = 0; i < y.length; i++) {
		const q = Math.min(1 - 1e-12, Math.max(1e-12, p[i]));
		s -= y[i] ? Math.log(q) : Math.log(1 - q);
	}
	return s / y.length;
}

export function mse(pred: readonly number[], y: readonly number[]) {
	let s = 0;
	for (let i = 0; i < y.length; i++) s += (pred[i] - y[i]) ** 2;
	return s / y.length;
}

/** Logistic-loss gradient and hessian with respect to the log-odds F. */
export function logisticGH(F: readonly number[], y: readonly number[]) {
	const g: number[] = [];
	const h: number[] = [];
	for (let i = 0; i < y.length; i++) {
		const p = sigmoid(F[i]);
		g.push(p - y[i]);
		h.push(Math.max(p * (1 - p), 1e-16));
	}
	return { g, h };
}

/** Squared-loss (½(F−y)²) gradient and hessian. */
export function squaredGH(F: readonly number[], y: readonly number[]) {
	return { g: F.map((f, i) => f - y[i]), h: F.map(() => 1) };
}
