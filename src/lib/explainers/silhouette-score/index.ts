/**
 * Guided explainer: the silhouette score for judging a clustering without labels.
 */
import type { ExplainerModule } from '../types';
import Scene from './Scene.svelte';
import i18n from './i18n';
import { bestK, init, labels, nClusters, off, points, selectNear, setData, setK, sil, weakest, type SilState } from './state';

const f2 = (v: number) => (Number.isFinite(v) ? v.toFixed(2) : '—');
const at = (s: SilState) => {
	const r = sil(s);
	const i = s.selected;
	return { a: r.a[i], b: r.b[i], s: r.s[i], own: labels(s)[i] + 1, nb: r.nearest[i] + 1 };
};

const explainer: ExplainerModule<SilState> = {
	title: 'How the silhouette score grades clusters',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Grading a clustering without answers',
			body: (s) => `[K-Means](concept:kmeans) has split these **${points(s).length} points** into **${s.k} clusters**. Is that a good clustering?

In classification you'd compare with the true labels. In clustering there usually are none. The **silhouette score** grades the result using only distances, by asking every point one question: *am I much closer to my own cluster than to the next-best one?*`,
			enter: (s) => {
				setData(s, 'blobs');
				setK(s, 4);
			}
		},
		{
			title: 'a(i): how close is my own cluster?',
			body: (s) => {
				const v = at(s);
				return `Pick a point *i*. **a(i)** is its average distance to every *other* point in its own cluster. It measures **cohesion**: small a(i) means the point sits snugly among its own cluster-mates.

For the selected point (cluster ${v.own}): the lines show all ${labels(s).filter((l) => l === v.own - 1).length - 1} distances, and **a(i) = ${f2(v.a)}**.`;
			},
			enter: (s) => {
				s.show.a = true;
				s.ui.select = true;
				selectNear(s, [-0.3, 0.38]);
			},
			task: {
				prompt: 'Click a few points. Where is a(i) small, and where is it large?',
				done: (s) => s.did.picked.length >= 2
			}
		},
		{
			title: 'b(i): how close is the next-best cluster?',
			body: (s) => {
				const v = at(s);
				return `Now measure the average distance from *i* to the points of **each other cluster** (written at each cluster's centre). The smallest of these is **b(i)**: the distance to the *nearest neighbouring* cluster, the one *i* would join if its own cluster didn't exist.

It measures **separation**. For the selected point, the nearest other cluster is ${v.nb}, so **b(i) = ${f2(v.b)}** (dashed lines).`;
			},
			enter: (s) => {
				s.show.b = true;
				s.show.means = true;
			}
		},
		{
			title: 's(i): one number per point',
			body: (s) => {
				const v = at(s);
				return `Combine the two:

\`s(i) = (b(i) − a(i)) / max(a(i), b(i))\`

Here: (${f2(v.b)} − ${f2(v.a)}) / ${f2(Math.max(v.a, v.b))} = **${f2(v.s)}**.

- **Near +1**: much closer to its own cluster than to any other. Well placed.
- **Near 0**: about as close to the neighbouring cluster. On a boundary.
- **Negative**: closer to another cluster than to its own. Probably misassigned.`;
			},
			enter: (s) => {
				s.show.means = false;
			},
			task: {
				prompt: 'Find a point with **s(i) below 0.6**. Look where two clusters face each other.',
				done: (s) => s.did.picked.includes(s.selected) && sil(s).s[s.selected] < 0.6
			}
		},
		{
			title: 'A misassigned point goes negative',
			body: (s) => {
				const v = at(s);
				return s.override
					? `The point now belongs to cluster ${v.own}, but cluster ${v.nb} is closer: a(i) = ${f2(v.a)} is **larger** than b(i) = ${f2(v.b)}, so **s(i) = ${f2(v.s)}**. A negative silhouette flags a point that is probably in the wrong cluster.`
					: `The ringed point has the lowest silhouette in the dataset, **s(i) = ${f2(v.s)}**: it sits between cluster ${v.own} and cluster ${v.nb}. What if it had been put in cluster ${v.nb} instead?`;
			},
			enter: (s) => {
				s.ui = { ...off };
				s.selected = weakest(s);
			},
			quiz: {
				question: 'If this point is moved into its neighbouring cluster, what happens to s(i)?',
				options: ['It rises toward +1', 'It stays about the same', 'It becomes negative'],
				answer: 2,
				explain: `It's actually a bit closer to its original cluster, so after the move its *own* cluster is the farther one: a(i) > b(i), which makes b − a negative. Silhouette values below 0 are how you spot misassigned points.`,
				reveal: (s) => {
					const i = s.selected;
					s.override = { i, to: sil(s).nearest[i] };
				}
			}
		},
		{
			title: 'The silhouette plot',
			body: (s) => {
				const r = sil(s);
				return `Compute s(i) for **every** point and draw one bar each, grouped by cluster and sorted. This is the **silhouette plot**. The dashed line is the mean: the **silhouette score** of the whole clustering, here **${f2(r.mean)}**.

What to look for: clusters whose bars are mostly long and of similar thickness, and few bars below zero. Click a bar to find its point.`;
			},
			enter: (s) => {
				s.override = null;
				s.show.plot = true;
				s.show.a = false;
				s.show.b = false;
				s.ui = { ...off, select: true };
				s.selected = weakest(s);
			}
		},
		{
			title: 'Choose K with the mean silhouette',
			body: (s) => {
				const r = sil(s);
				return `Run K-Means for several K and compare the mean silhouette (right chart). Unlike inertia, it **doesn't** improve automatically with more clusters: splitting a real cluster creates two halves that are close to each other, so b(i) shrinks.

K = **${s.k}**: mean silhouette **${f2(r.mean)}**. ${s.k < bestK(s) ? 'One cluster is really two blobs: its bars are short.' : s.k > bestK(s) ? 'A real blob has been split: those bars collapse toward 0.' : 'This is the best K: every cluster has long bars.'}`;
			},
			enter: (s) => {
				s.show.curve = true;
				s.ui = { ...off, select: true, k: true };
				s.selected = -1;
				setK(s, 2);
			},
			task: {
				prompt: 'Use the K slider (or click the chart) to find the K with the highest mean silhouette.',
				done: (s) => s.mode === 'kmeans' && s.k === bestK(s)
			}
		},
		{
			title: 'Silhouette favours round blobs',
			body: (s) =>
				s.mode === 'truth'
					? `Scoring the **true moons** gives **${f2(sil(s).mean)}**: lower than K-Means' wrong split. Points at the tip of one moon are closer, *on average*, to the other moon than to the far end of their own. The score assumes compact, convex clusters, so it can't reward curved or chained shapes, like the ones [DBSCAN](concept:dbscan) finds.`
					: `On two moons, [K-Means](concept:kmeans) with K = 2 cuts straight across both shapes. Its silhouette score is **${f2(sil(s).mean)}**.`,
			enter: (s) => {
				setData(s, 'moons');
				setK(s, 2);
				s.ui = { ...off };
				s.show.curve = false;
			},
			quiz: {
				question: 'Now score the true clustering, one cluster per moon. Its silhouette score will be…',
				options: ['Higher: it is the correct answer', 'Lower than the K-Means split', 'Exactly 1'],
				answer: 1,
				explain: `The silhouette score measures compactness and separation by average distance, not "correctness". Long curved clusters have large a(i), so even the right answer can score worse than a tidy wrong one. Use it to compare similar, blob-like clusterings, not as ground truth.`,
				reveal: (s) => {
					s.mode = 'truth';
					s.ui.mode = true;
				}
			}
		},
		{
			title: 'Your turn: playground',
			body: (s) => `Everything is unlocked. Recap:

1. **a(i)**: mean distance to my own cluster (cohesion).
2. **b(i)**: mean distance to the nearest other cluster (separation).
3. **s(i) = (b − a) / max(a, b)**, from −1 to +1.
4. Mean of s(i) over all points = the silhouette score. Compare it across K.

Current: ${nClusters(s)} clusters, score **${f2(sil(s).mean)}**. It needs all pairwise distances (O(n²)), so on big datasets use \`sample_size\` in scikit-learn. Works for [hierarchical clustering](concept:hierarchical-clustering) and [GMM](concept:gmm) labels too.`,
			enter: (s) => {
				setData(s, 'blobs');
				setK(s, 4);
				s.ui = { select: true, k: true, dataset: true, mode: true };
				s.show = { a: true, b: true, means: false, plot: true, curve: true };
				selectNear(s, [-0.3, 0.38]);
			}
		}
	]
};

export default explainer;
