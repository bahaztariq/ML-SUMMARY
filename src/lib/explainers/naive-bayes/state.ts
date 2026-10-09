/**
 * Naive Bayes explainer state: a spam-filter half (word toggles, Laplace smoothing) and a
 * Gaussian NB half (2-D points, per-class bell curves, curved boundary).
 */
import { blobs, memo, type Data, type Pt } from '../_classifiers/data.ts';
import * as nb from './nb.ts';

export type Mode = 'text' | 'gauss';
export type Dataset = 'blobs' | 'tilted';

export const DATA: Record<Dataset, Data> = {
	blobs: blobs(4, 80, { c0: [-0.35, 0.15], c1: [0.3, -0.15], spread: [0.34, 0.15], spread1: [0.15, 0.34] }),
	tilted: blobs(3, 80, { c0: [-0.13, 0.13], c1: [0.13, -0.13], spread: [0.4, 0.4], corr: 0.92 })
};

export interface NBState {
	mode: Mode;
	/** Words currently present in the email. */
	on: Record<string, boolean>;
	/** Which word chips are offered. */
	vocab: string[];
	alpha: number;
	dataset: Dataset;
	probe: Pt;
	show: { logs: boolean; gaussians: boolean; marginals: boolean; regions: boolean; full: boolean; probe: boolean };
	ui: { words: boolean; alpha: boolean; mode: boolean; dataset: boolean; probe: boolean };
	did: { meeting: boolean; probeEven: boolean };
}

export const BASE_VOCAB = ['free', 'click', 'meeting', 'report'];

export const activeWords = (s: NBState) => s.vocab.filter((id) => s.on[id]).map((id) => nb.wordById.get(id)!);
export const post = (s: NBState) => nb.posterior(activeWords(s), s.alpha);
export const pSpam = (s: NBState) => post(s).post[0];

const gnbs = memo<nb.GNB>(8);
const qdas = memo<nb.QDA>(8);
export const gnb = (s: NBState) => gnbs(s.dataset, () => nb.fitGNB(DATA[s.dataset]));
export const qda = (s: NBState) => qdas(s.dataset, () => nb.fitQDA(DATA[s.dataset]));
export const probeB = (s: NBState) => nb.gnbProbB(gnb(s), s.probe);

export function accuracyOf(s: NBState, which: 'gnb' | 'qda' = 'gnb') {
	const d = DATA[s.dataset];
	const f = which === 'gnb' ? (p: Pt) => nb.gnbProbB(gnb(s), p) : (p: Pt) => nb.qdaProbB(qda(s), p);
	let ok = 0;
	d.X.forEach((p, i) => {
		if ((f(p) >= 0.5 ? 1 : 0) === d.y[i]) ok++;
	});
	return ok / d.X.length;
}

export function setWords(s: NBState, ids: string[]) {
	s.on = Object.fromEntries(ids.map((id) => [id, true]));
}

export function toggle(s: NBState, id: string) {
	s.on[id] = !s.on[id];
	if (id === 'meeting') s.did.meeting = true;
}

export const off = { words: false, alpha: false, mode: false, dataset: false, probe: false };

export function init(): NBState {
	return {
		mode: 'text',
		on: {},
		vocab: [...BASE_VOCAB],
		alpha: 0,
		dataset: 'blobs',
		probe: [0.05, 0.35],
		show: { logs: false, gaussians: false, marginals: false, regions: false, full: false, probe: false },
		ui: { ...off },
		did: { meeting: false, probeEven: false }
	};
}
