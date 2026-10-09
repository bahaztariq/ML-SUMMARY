/**
 * Guided explainer: how DBSCAN finds clusters by following density.
 */
import type { ExplainerModule } from '../types';
import Scene from './Scene.svelte';
import i18n from './i18n';
import { findPoint, growDone, growNext, init, off, points, result, selectNear, setData, type DbscanState } from './state';

const e2 = (v: number) => v.toFixed(2);
const nb = (s: DbscanState) => (s.selected >= 0 ? result(s).nbrs[s.selected].length : 0);

const explainer: ExplainerModule<DbscanState> = {
	title: 'How DBSCAN finds clusters by density',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Clusters are crowded places',
			body: (s) => `Here are **${points(s).length} unlabelled points**: two curved, interlocking groups plus a few stray points scattered around.

[K-Means](concept:kmeans) would need you to say how many clusters there are, then draw straight boundaries between round blobs, so it would slice each moon in half.

DBSCAN asks a different question about every point: **is it in a crowded place?** Think of city lights seen from space. Dense patches of lights are cities, a lonely farmhouse is just noise. Clusters are wherever the crowd continues.`,
			enter: (s) => {
				setData(s, 'moons');
				s.eps = 0.1;
				s.minPts = 5;
			}
		},
		{
			title: 'Look around each point: the ε-neighbourhood',
			body: (s) => `DBSCAN has two settings. The first is a radius, **ε** (epsilon). The **ε-neighbourhood** of a point is everything within distance ε of it: the circle drawn on the plot.

The highlighted point has **${nb(s)} points** in its circle of radius ε = ${e2(s.eps)}, counting itself. Points in the middle of a moon have crowded circles; stray points have almost empty ones.`,
			enter: (s) => {
				s.show.circle = true;
				s.ui.select = true;
				s.ui.eps = true;
				// a point in the crowded middle of a moon
				s.selected = findPoint(s, (i, r) => r.nbrs[i].length === Math.max(...r.nbrs.map((nb) => nb.length)));
			},
			task: {
				prompt: 'Click at least **3 points**: some inside a moon, some stray ones far from everything. Try the ε slider too.',
				done: (s) => s.did.inspected.length >= 3
			}
		},
		{
			title: 'Core points: crowded enough',
			body: (s) => {
				const r = result(s);
				return `The second setting is **minPts**. A point is a **core point** if its ε-neighbourhood holds at least minPts points (itself included, as in scikit-learn's \`min_samples\`).

With ε = ${e2(s.eps)} and minPts = ${s.minPts}, **${r.counts.core} of ${r.kind.length}** points are core (filled). Core points sit in the dense interior of a cluster.`;
			},
			enter: (s) => {
				s.eps = 0.1;
				s.minPts = 5;
				s.show.kinds = true;
				s.ui.minPts = true;
			},
			task: {
				prompt: 'Raise **minPts** to 8 or more and watch core points vanish from the thinner parts of the moons.',
				done: (s) => s.minPts >= 8
			}
		},
		{
			title: 'Border points and noise',
			body: (s) => {
				const r = result(s);
				return `Every non-core point gets one of two labels:

- **Border** (hollow ring): not crowded itself, but inside the ε-circle of at least one core point. It sits on the edge of a cluster.
- **Noise** (×): not core, and no core point nearby. DBSCAN labels it \`-1\` and leaves it out of every cluster.

Right now: **${r.counts.core} core, ${r.counts.border} border, ${r.counts.noise} noise**. Built-in noise detection is why DBSCAN is also used for anomaly detection, alongside [Isolation Forest](concept:isolation-forest).`;
			},
			enter: (s) => {
				s.eps = 0.1;
				s.minPts = 5;
				s.ui = { ...off };
				s.show.circle = true;
				s.show.mystery = true;
				// A non-core point that still has a core point in its circle.
				s.selected = findPoint(s, (i, r) => r.kind[i] === 'border' && r.nbrs[i].length === 3);
				if (s.selected < 0) s.selected = findPoint(s, (i, r) => r.kind[i] === 'border');
			},
			quiz: {
				question: 'The point marked “?” has only 3 points in its circle (minPts = 5), but one of them is a core point. What is it?',
				options: ['A core point', 'A border point', 'Noise'],
				answer: 1,
				explain: `It is not core (3 < 5), but it lies within ε of a core point, so it is **reachable** from the cluster and joins it as a **border** point. Only points with no core point within ε are noise.`,
				reveal: (s) => {
					s.show.mystery = false;
					s.ui.select = true;
				}
			}
		},
		{
			title: 'Growing clusters through core points',
			body: (s) => {
				const r = result(s);
				const done = growDone(s);
				const shown = r.order.slice(0, s.grow);
				const c = shown.length ? shown[shown.length - 1].c + 1 : 0;
				return `Now ε = ${e2(s.eps)}. To build clusters DBSCAN takes an unvisited core point, starts a new cluster, and adds everything in its circle. Every **core** point it reaches passes the cluster on to its own neighbours; **border** points join but don't pass it on. When nothing new can be reached, the cluster is complete and DBSCAN moves to the next unvisited core point.

Points linked this way are **density-reachable**. That's why a cluster can bend into any shape: it only has to be crowded all along the way.

${done ? `**Done: ${r.nClusters} clusters**, ${r.counts.noise} points left as noise.` : `Cluster **${c || 1}** growing: ${s.grow} of ${r.order.length} points claimed.`}`;
			},
			enter: (s) => {
				s.ui = { ...off, grow: true };
				s.show.circle = false;
				s.show.kinds = false;
				s.show.mystery = false;
				s.show.clusters = true;
				s.show.growth = true;
				s.selected = -1;
				s.eps = 0.18;
				s.minPts = 5;
				s.grow = 0;
				growNext(s);
				growNext(s);
			},
			task: {
				prompt: 'Press **Expand** a few times to follow one core point at a time, then **Play** until every cluster is found.',
				done: (s) => growDone(s)
			}
		},
		{
			title: 'Tuning ε',
			body: (s) => {
				const r = result(s);
				return `ε is the knob that matters most. Too small and even real clusters look sparse: they shatter into fragments and many points become noise. Too large and circles reach across the gap, so separate clusters merge into one.

ε = **${e2(s.eps)}**, minPts = ${s.minPts}: **${r.nClusters} cluster${r.nClusters === 1 ? '' : 's'}**, ${r.counts.noise} noise points.`;
			},
			enter: (s) => {
				s.show.growth = false;
				s.show.circle = true;
				s.ui = { ...off, eps: true, minPts: true, select: true };
				s.eps = 0.08;
			},
			task: {
				prompt: 'Find an ε that gives exactly **2 clusters** (one per moon) with at most **10** noise points. Then push ε up until they merge.',
				done: (s) => s.dataset === 'moons' && result(s).nClusters === 2 && result(s).counts.noise <= 10
			}
		},
		{
			title: 'Shapes K-Means cannot follow',
			body: (s) => `Two rings, one inside the other. With ε = ${e2(s.eps)}, DBSCAN walks around each ring through its core points and finds **${result(s).nClusters} clusters**, without being told how many to look for.

${s.view === 'kmeans' ? `**K-Means with K = 2** puts a centroid on each side and splits the plane with a straight line, so each "cluster" is half of the inner ring plus half of the outer ring.` : `Each ring is one connected crowd, even though its centre is far from most of its points.`}`,
			enter: (s) => {
				setData(s, 'rings');
				s.ui = { ...off };
				s.eps = 0.18;
				s.minPts = 5;
				s.view = 'dbscan';
			},
			quiz: {
				question: 'What will K-Means with K = 2 do on these two rings?',
				options: [
					'Find the inner ring and the outer ring, just like DBSCAN',
					'Cut straight across both rings, mixing them',
					'Put every point in a single cluster'
				],
				answer: 1,
				explain: `K-Means assigns each point to the **nearest centroid**, so its clusters are always split by straight lines. Both centroids end up near the middle, each claiming one side of the plane. Use the toggle to compare the two.`,
				reveal: (s) => {
					s.view = 'kmeans';
					s.ui.view = true;
				}
			}
		},
		{
			title: 'Where DBSCAN struggles: uneven density',
			body: (s) => {
				const r = result(s);
				return `One ε has to fit the whole dataset. Here there are two **tight** clusters (top left) and one **spread-out** cluster (bottom right).

ε = ${e2(s.eps)}: **${r.nClusters} clusters**, ${r.counts.noise} noise points. ${s.eps < 0.15 ? 'The tight clusters are found, but much of the spread-out one is written off as noise.' : 'The spread-out cluster is found, but the two tight ones have merged into one.'}

When densities vary a lot, try HDBSCAN (which varies ε automatically), [Gaussian Mixtures](concept:gmm) or [hierarchical clustering](concept:hierarchical-clustering).`;
			},
			enter: (s) => {
				setData(s, 'density');
				s.view = 'dbscan';
				s.ui = { ...off };
				s.eps = 0.08;
				s.minPts = 5;
			},
			quiz: {
				question: 'Can a larger ε capture the spread-out cluster while keeping the two tight clusters apart?',
				options: [
					'Yes, there is an ε that gets all three right',
					'No: by the time ε is large enough for the sparse cluster, the tight ones merge',
					'Yes, but only if minPts is also raised'
				],
				answer: 1,
				explain: `The gap between the tight clusters is *smaller* than the spacing inside the sparse one. Any ε wide enough to connect the sparse cluster also bridges that gap: at ε = 0.22 the tight pair becomes a single cluster. Drag ε yourself to check.`,
				reveal: (s) => {
					s.eps = 0.22;
					s.ui.eps = true;
				}
			}
		},
		{
			title: 'Choosing ε: the k-distance plot',
			body: (s) => `A standard trick: for every point, measure the distance to its **${s.minPts - 1}th nearest neighbour** (minPts − 1), then sort those distances. That's the curve below.

A point is core exactly when its distance is **≤ ε**, so the line splits core points (below) from the rest. The curve stays low inside clusters, then shoots up for sparse points. Put ε near that **elbow**: here ε = ${e2(s.eps)} gives ${result(s).nClusters} clusters and ${result(s).counts.noise} noise points.`,
			enter: (s) => {
				setData(s, 'moons');
				s.view = 'dbscan';
				s.ui = { ...off, minPts: true };
				s.show.kdist = true;
				s.eps = 0.06;
				s.minPts = 5;
			},
			task: {
				prompt: 'Click or drag on the k-distance chart to put ε at the elbow (until the moons become 2 clusters).',
				done: (s) => s.dataset === 'moons' && result(s).nClusters === 2
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap:

1. Pick **ε** (radius) and **minPts** (scale your features first, since ε is a raw distance).
2. Points with ≥ minPts neighbours within ε are **core**.
3. Clusters grow from core to core; non-core points they reach are **border**.
4. Everything else is **noise** (label \`-1\`).

No K to choose, any shape, outliers flagged for free. The cost: one global density, and distances get unreliable in high dimensions. To score the result without labels, see the [silhouette score](concept:silhouette-score) (it favours round clusters, so use it with care here).`,
			enter: (s) => {
				setData(s, 'blobs');
				s.ui = { eps: true, minPts: true, select: true, grow: false, dataset: true, view: true };
				s.show = { circle: true, kinds: false, clusters: true, growth: false, kdist: true, mystery: false };
				s.view = 'dbscan';
				s.eps = 0.14;
				s.minPts = 5;
				selectNear(s, [-0.5, 0.45]);
			}
		}
	]
};

export default explainer;
