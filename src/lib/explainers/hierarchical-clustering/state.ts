/**
 * Hierarchical clustering explainer state. The merge tree is memoized on (dataset, linkage);
 * the reactive state only holds the dataset name, how many merges are shown and the cut.
 */
import { memoMap, type Pt } from '../_clustering/data';
import { cutK, heightForK, kAtHeight, linkage, makeData, members, type Dataset, type Linkage, type Merge } from './hclust';

export interface HcState {
	dataset: Dataset;
	linkage: Linkage;
	/** Merges applied so far (0 … n−1). */
	merged: number;
	/** Is the dendrogram cut active? Then colours come from the cut. */
	cut: boolean;
	cutH: number;
	show: {
		/** Outline the latest merge and draw the linkage distance it used. */
		pair: boolean;
		hulls: boolean;
	};
	ui: { merge: boolean; linkage: boolean; cut: boolean; dataset: boolean };
	did: { linkages: Linkage[]; cutDrag: boolean };
}

export const pointsOf = memoMap((d: Dataset) => makeData(d).points, (d) => d);
export const treeOf = memoMap((d: Dataset, l: Linkage) => linkage(pointsOf(d), l), (d, l) => `${d}|${l}`);
const membersOf = memoMap((d: Dataset, l: Linkage) => members(treeOf(d, l), pointsOf(d).length), (d, l) => `${d}|${l}`);

export const points = (s: HcState): Pt[] => pointsOf(s.dataset);
export const tree = (s: HcState): Merge[] => treeOf(s.dataset, s.linkage);
export const n = (s: HcState) => pointsOf(s.dataset).length;
export const groups = (s: HcState) => membersOf(s.dataset, s.linkage);

/** Clusters currently in play. */
export const k = (s: HcState) => (s.cut ? kAtHeight(tree(s), n(s), s.cutH) : n(s) - s.merged);

/** How many clusters the colours follow while merging step by step. */
const COLOR_K = 3;

export interface View {
	/** Colour index per point (-1 = still alone, drawn grey). */
	pointColor: number[];
	/** Colour index per cluster id (-1 = grey). */
	nodeColor: number[];
	/** Cluster ids currently in play. */
	current: number[];
}

/**
 * Colours stay stable while merging: each point is coloured by the cluster it ends up in when
 * the tree is cut into 3 (or by the actual cut once one is active).
 */
export function view(s: HcState): View {
	const merges = tree(s);
	const N = n(s);
	const colorK = s.cut ? k(s) : Math.min(COLOR_K, N);
	const base = cutK(merges, N, colorK).labels;
	const current = cutK(merges, N, s.cut ? k(s) : N - s.merged).nodes;
	const mem = groups(s);
	const pointColor = new Array(N).fill(-1);
	for (const id of current) if (s.cut || mem[id].length > 1) for (const i of mem[id]) pointColor[i] = base[i];
	const nodeColor = mem.map((leaves, id) => {
		if (id < N) return pointColor[id];
		const t = id - N;
		const inside = s.cut ? merges[t].height <= s.cutH : t < N - colorK;
		return inside ? base[leaves[0]] : -1;
	});
	return { pointColor, nodeColor, current };
}

export function setData(s: HcState, d: Dataset) {
	const full = s.merged >= n(s) - 1;
	s.dataset = d;
	s.merged = full ? n(s) - 1 : Math.min(s.merged, n(s) - 1);
	if (s.cut) s.cutH = heightForK(tree(s), n(s), 3);
}

export function setLinkage(s: HcState, l: Linkage) {
	const keep = k(s);
	s.linkage = l;
	if (s.cut) s.cutH = heightForK(tree(s), n(s), keep);
	if (!s.did.linkages.includes(l)) s.did.linkages.push(l);
}

export function mergeNext(s: HcState): boolean {
	if (s.merged < n(s) - 1) s.merged++;
	return s.merged < n(s) - 1;
}

export function finish(s: HcState) {
	s.merged = n(s) - 1;
}

export function setCutK(s: HcState, kk: number) {
	finish(s);
	s.cut = true;
	s.cutH = heightForK(tree(s), n(s), kk);
}

export const off = { merge: false, linkage: false, cut: false, dataset: false };

export function init(): HcState {
	return {
		dataset: 'blobs',
		linkage: 'average',
		merged: 0,
		cut: false,
		cutH: 0,
		show: { pair: false, hulls: true },
		ui: { ...off },
		did: { linkages: ['average'], cutDrag: false }
	};
}
