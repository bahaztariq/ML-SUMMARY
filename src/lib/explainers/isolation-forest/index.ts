/**
 * Guided explainer: how Isolation Forest spots anomalies by isolating them.
 */
import { fmt } from '#lib/viz/canvas.ts';
import type { ExplainerModule } from '../types.ts';
import Scene from './Scene.svelte';
import i18n from './i18n';
import { cFactor } from './iforest.ts';
import {
	CLUMP,
	LOCAL,
	LONE,
	NORMAL,
	NORMAL_SEED,
	OUT,
	OUT_SEED,
	clumpCaught,
	clumpScore,
	data,
	detection,
	forest,
	hidden,
	init,
	isolateAll,
	isolated,
	mean,
	newTree,
	off,
	pathLen,
	pct,
	scores,
	setDataset,
	type IFState
} from './state.ts';

/** The same state with ψ = 256, for numbers that shouldn't move when the learner changes ψ. */
const at256 = (s: IFState): IFState => ({ ...s, psi: 256 });

const explainer: ExplainerModule<IFState> = {
	title: 'How Isolation Forest spots anomalies',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Anomalies are few and different',
			body: `Here are ${data('blobs').X.length} unlabelled points, say card transactions plotted by two features. Most fall into two clusters, and a few sit off on their own.

Most anomaly detectors first model what *normal* looks like (a density, or distances to neighbours) and flag whatever doesn't fit. **Isolation Forest** flips this around: anomalies are **few and different**, so they're **easy to isolate**.

Think of 20 Questions: picking out one ordinary person in a crowd takes many questions. Picking out the one in a purple astronaut suit takes one or two.`
		},
		{
			title: 'Random cuts isolate a point',
			body: (s) => `An **isolation tree** asks random yes/no questions:

1. Pick a feature at random (x₁ or x₂).
2. Pick a split value uniformly between the min and max of the points still in play.
3. Keep the side that contains our point, and repeat until it sits **alone**.

The number of cuts is the point's **path length h(x)**: the depth of its leaf in the tree. ${isolated(s) ? `The outlier was alone after just **${pathLen(s)} cuts**.` : `So far: **${s.cuts}** cut${s.cuts === 1 ? '' : 's'}.`}`,
			enter: (s) => {
				s.target = OUT;
				s.treeSeed = OUT_SEED;
				s.cuts = 0;
				s.show = { ...hidden, cuts: true };
				s.ui = { ...off, cut: true };
			},
			task: {
				prompt: 'Press **Next cut** (or **Isolate**) until the outlier sits alone in its cell.',
				done: (s) => isolated(s)
			}
		},
		{
			title: 'Now a normal point',
			body: (s) =>
				`Same procedure, same kind of random tree, but now for the point in the middle of the left cluster. ${isolated(s) ? `It took **${pathLen(s)} cuts**.` : s.cuts ? `**${s.cuts}** cuts so far.` : ''}`,
			enter: (s) => {
				s.target = NORMAL;
				s.treeSeed = NORMAL_SEED;
				s.cuts = 0;
			},
			quiz: {
				question: 'The outlier needed 3 cuts. How many will the point in the middle of a cluster need?',
				options: [
					'Fewer: it has so many neighbours that cuts land near it all the time',
					'About the same: the cuts are random either way',
					'Many more: its neighbours keep sharing its cell'
				],
				answer: 2,
				explain: (s) =>
					`This tree needed **${pathLen(s)}** cuts. Most random cuts land in empty space or shave off a few neighbours, so a point inside a dense cluster is only separated once its cell is tiny. The outlier sits in empty space, so almost any cut that falls between it and the clusters separates it.`,
				reveal: (s) => isolateAll(s)
			}
		},
		{
			title: 'One tree is a noisy judge',
			body: (s) => `Each tree is random, so a single path length is partly luck: sometimes the first cut happens to fall right beside the normal point, and sometimes the outlier survives a few cuts.

Average over many trees and the luck cancels out. After **${s.history.out.length}** tree${s.history.out.length === 1 ? '' : 's'}: the outlier averages **${fmt(mean(s.history.out), 1)}** cuts, the normal point **${fmt(mean(s.history.normal), 1)}**.`,
			enter: (s) => {
				s.history = { out: [], normal: [] };
				newTree(s, NORMAL_SEED);
				s.show = { ...hidden, cuts: true, history: true };
				s.ui = { ...off, newTree: true, grow: true };
			},
			task: {
				prompt: 'Grow at least **20 trees** (use **+10 trees**) and watch the two averages settle.',
				done: (s) => s.history.out.length >= 20
			}
		},
		{
			title: 'From path length to anomaly score',
			body: (s) => {
				const f = forest(s);
				const c = cFactor(f.psi);
				return `An Isolation Forest grows **${s.nTrees} trees** (n_estimators). Each one sees a random subsample of ψ = min(256, n) = **${f.psi}** rows (max_samples), and its depth is capped at ⌈log₂ ψ⌉ = ${Math.ceil(Math.log2(f.psi))}, because only short paths matter.

The average path length E[h(x)] is divided by **c(ψ) = ${fmt(c)}**, the average path length of a random point in a random tree of ψ points:

**s(x) = 2^(−E[h(x)] / c(ψ))**

A score near **1** means an anomaly. Around **0.5** or below means normal. The background shades every location by its score.`;
			},
			enter: (s) => {
				s.show = { ...hidden, heat: true };
				s.ui = { ...off, inspect: true };
				s.sel = OUT;
			},
			task: {
				prompt: 'Click points deep inside a cluster, at a cluster edge, and out on their own. Compare the scores.',
				done: (s) => s.did.inspected.length >= 3
			}
		},
		{
			title: 'Contamination sets the threshold',
			body: (s) => {
				const d = detection(s);
				return `The forest only **ranks** points. To get yes/no labels, scikit-learn's \`contamination\` says what fraction to flag: here the top **${pct(s.contamination, 1)}** by score, with the pink outline as the cut-off.

Pink dots are the 8 anomalies we planted. The forest never saw those labels; we only use them to check its work. Flagged **${d.flagged}**: caught **${d.caught} of ${d.planted}**, with **${d.falseAlarms}** false alarm${d.falseAlarms === 1 ? '' : 's'}.

In real life you don't know the true rate, so you set contamination from domain knowledge (e.g. "about 1% of transactions are fraud"), or rank by \`score_samples\` and review the top of the list.`;
			},
			enter: (s) => {
				s.sel = -1;
				s.contamination = 0.1;
				s.show = { ...hidden, heat: true, flags: true, truth: true };
				s.ui = { ...off, contamination: true };
			},
			task: {
				prompt: 'Set contamination so that **all 8** planted anomalies are caught with **at most 1** false alarm.',
				done: (s) => {
					const d = detection(s);
					return d.caught === d.planted && d.falseAlarms <= 1;
				}
			}
		},
		{
			title: 'Where it struggles: masking',
			body: (s) =>
				`A different dataset: one normal cluster, two lone anomalies, and a tight **clump of 25 anomalies** at the top right (all pink).${
					s.show.heat
						? `

With ψ = **${s.psi}**: the clump's average score is **${fmt(clumpScore(s))}**, the lone bottom-left anomaly scores **${fmt(scores(s)[LONE])}**, and **${clumpCaught(s)} of ${CLUMP.length}** clump points are flagged.${s.psi < 256 ? ' Small subsamples have a cost too: scores get noisier, and the lone anomaly now scores lower than it did with ψ = 256.' : ''}`
						: ''
				}`,
			enter: (s) => {
				setDataset(s, 'clump');
				s.psi = 256;
				s.show = { ...hidden, truth: true };
				s.ui = { ...off };
			},
			quiz: {
				question: 'With ψ = 256 (every tree sees all the data), how will the clump score compared with a lone anomaly?',
				options: [
					'Higher: there are more of them',
					'Lower: they shield each other, so isolating one takes many cuts',
					'Exactly the same: all anomalies get the same score'
				],
				answer: 1,
				explain: (s) =>
					`Clump members are each other's neighbours, so isolating one takes almost as many cuts as a normal point. Average score **${fmt(clumpScore(at256(s)))}** against **${fmt(scores(at256(s))[LONE])}** for the lone anomaly. This is called **masking**. The fix is smaller subsamples: a tree grown on 16 rows usually contains just one or two clump members, and those are quick to isolate.`,
				reveal: (s) => {
					s.show = { ...hidden, truth: true, heat: true, flags: true };
					s.ui = { ...off, psi: true };
				}
			},
			task: {
				prompt: 'Lower **max_samples ψ** until the whole clump is flagged.',
				done: (s) => clumpCaught(s) === CLUMP.length
			}
		},
		{
			title: 'Where it struggles: local anomalies',
			body: (s) => {
				const d = detection(s);
				const sc = scores(s);
				return `Left: a **dense** cluster. Right: a **sparse** one. The two pink points sit just outside the dense cluster. *Relative to their neighbourhood* they're clearly odd, but in absolute terms they're less isolated than the sparse cluster's edge points.

Isolation Forest judges **global** isolation. Their scores are ${LOCAL.map((i) => `**${fmt(sc[i])}**`).join(' and ')}, and with contamination ${pct(s.contamination)} it catches **${d.caught} of ${d.planted}**, flagging sparse-cluster edge points instead.

Notice the **cross-shaped stripes** in the background, too: axis-aligned cuts give rectangular score regions. For density-relative outliers, model the density with a [Gaussian mixture](concept:gmm) or use [DBSCAN](concept:dbscan)'s noise points.`;
			},
			enter: (s) => {
				setDataset(s, 'local');
				s.psi = 256;
				s.show = { ...hidden, heat: true, flags: true, truth: true };
				s.ui = { ...off, inspect: true };
			},
			task: {
				prompt: 'Click both pink points, then a point on the outer edge of the sparse cluster. Compare their scores.',
				done: (s) => LOCAL.every((i) => s.did.inspected.includes(i)) && s.did.inspected.length >= 3
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Try a single tree (n_estimators = 1) to see how blocky one tree's scores are. Recap:

1. Grow many **isolation trees** on small random subsamples (ψ ≈ 256), each splitting on a random feature at a random value.
2. A point's **path length** h(x) is how many cuts it takes to isolate it. Anomalies have short paths.
3. **Score** s = 2^(−E[h] / c(ψ)): near 1 means anomaly.
4. **contamination** turns the ranking into labels.

There are no distances, so no feature scaling, and training is fast and linear in n. Watch out for clumps of anomalies (lower ψ) and for local anomalies next to dense clusters. It's the same random-split idea as a [random forest](concept:random-forest), only with no labels.`,
			enter: (s) => {
				setDataset(s, 'blobs');
				s.psi = 256;
				s.nTrees = 100;
				s.show = { ...hidden, heat: true, flags: true, truth: true };
				s.ui = { cut: false, newTree: false, grow: false, inspect: true, nTrees: true, psi: true, contamination: true, dataset: true };
			}
		}
	]
};

export default explainer;
