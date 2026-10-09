/**
 * Guided explainer: how t-SNE and UMAP draw neighbourhood-preserving maps.
 */
import { fmt } from '#lib/viz/canvas.ts';
import type { ExplainerModule } from '../types.ts';
import Scene from './Scene.svelte';
import i18n from './i18n';
import { EXAG_ITERS, TSNE_ITERS } from './tsne.ts';
import {
	START_SEL,
	START_VIEW,
	effectiveNeighbours,
	finished,
	init,
	inputRatio,
	maxIter,
	neighbourRow,
	off,
	pcaShare,
	resetLive,
	setMethod,
	setNeighbors,
	setPerplexity,
	type TSState
} from './state.ts';

const pct = (v: number) => (Number.isFinite(v) ? `${Math.round(v * 100)}%` : '—');

function progress(s: TSState) {
	if (s.target === 0) return 'The map is still a random scatter. Press **Run**.';
	if (finished(s)) return `**Done:** ${TSNE_ITERS} iterations, KL = **${fmt(s.live.kl, 3)}**. ${pct(s.live.kept)} of each point's 10 nearest 3-D neighbours are also among its 10 nearest on the map.`;
	if (s.live.iter < EXAG_ITERS) return `Iteration **${s.live.iter}**: early exaggeration, KL = ${fmt(s.live.kl, 3)}.`;
	return `Iteration **${s.live.iter}**, KL = **${fmt(s.live.kl, 3)}** and falling.`;
}

function perplexityNote(p: number) {
	if (p <= 5) return 'Very low: each point only trusts a handful of nearest neighbours, so clusters crack into small fragments.';
	if (p >= 50) return 'High: each neighbourhood spans a whole cluster and spills into others, so detail inside clusters flattens out and more of the big picture shapes the layout.';
	return 'A typical value (5–50): clusters come out clean.';
}

const explainer: ExplainerModule<TSState> = {
	title: 'How t-SNE and UMAP draw neighbourhood maps',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Clusters hiding in 3-D',
			body: `Each of these 200 points has three features. Real inputs to t-SNE usually have dozens to thousands (image embeddings, word vectors, gene counts). Three lets us look at the raw data and check the map against it.

The goal: draw a **2-D map** where points that are neighbours in the original space are still neighbours on paper.

The colors mark the true groups. t-SNE never sees them; they're only there so you can check its work.`,
			task: {
				prompt: 'Drag to rotate the cloud and find all five clusters. Two of them are easy to miss from some angles.',
				done: (s) => s.did.rotate
			}
		},
		{
			title: 'A linear shadow: PCA',
			body: `The classic way to get to 2-D is [PCA](concept:pca): project onto the flat plane that keeps the most variance. It's fast, gives the same answer every time, and preserves large-scale geometry.

Here the two directions with the most variance are basically x₁ and x₂. The **indigo** and **green** clusters differ only in height, x₃.`,
			enter: (s) => {
				s.ui = { ...off, rotate: true };
			},
			quiz: {
				question: 'What happens to the indigo and green clusters in the PCA picture?',
				options: [
					'They stay separate: PCA keeps almost all the variance',
					'They land on top of each other',
					'They disappear from the plot'
				],
				answer: 1,
				explain: () =>
					`PCA keeps **${pct(pcaShare())}** of the variance and still merges two clusters. The 1.8-unit gap along x₃ is only a small slice of the total variance, so the best *flat* shadow throws it away. Variance is a global measure: it doesn't care which neighbours get mixed up.`,
				reveal: (s) => {
					s.right = 'pca';
				}
			}
		},
		{
			title: 'Neighbours, not distances',
			body: (s) => {
				const r = neighbourRow(s.sel, s.perplexity);
				return `t-SNE starts by asking every point **who its neighbours are**. It centres a Gaussian on point i and turns distances into probabilities **p(j|i)**: close points get most of the weight and far points almost none. Darker lines mean more weight.

The Gaussian's width σᵢ is tuned separately for each point so that it has a fixed **perplexity**, roughly "the effective number of neighbours". In dense regions σ shrinks; in sparse ones it grows.

Selected point: σ = **${fmt(r.sigma)}**, and **${effectiveNeighbours(s.sel, s.perplexity)}** neighbours hold 90% of its probability.`;
			},
			enter: (s) => {
				s.right = 'none';
				s.show.neigh = true;
				s.sel = START_SEL;
				s.ui = { ...off, rotate: true, pick: true, perplexity: true };
			},
			task: {
				prompt: 'Click a point in a **tight** cluster, then one in the wide **amber** cluster. Compare their σ.',
				done: (s) => s.did.pick >= 2
			}
		},
		{
			title: 'Start random, then pull and push',
			body: (s) => `Next, t-SNE drops the points at random on a 2-D map and measures similarity there too, as **q_ij**. This time it uses a heavy-tailed **Student-t** curve, (1 + d²)⁻¹, so dissimilar points can sit far apart without much penalty. That stops everything piling up in the middle (the *crowding problem*).

Each iteration is one step of [gradient descent](concept:what-is-gradient-descent) on **KL(P‖Q)**. Pairs that are neighbours in 3-D but far apart on the map **attract**. Pairs that are closer on the map than in 3-D **repel**. For the first ${EXAG_ITERS} iterations the attractions are multiplied by 12 so clusters clump early.

${progress(s)}`,
			enter: (s) => {
				s.show.neigh = false;
				s.perplexity = 30;
				s.right = 'embed';
				s.target = 0;
				resetLive(s);
				s.ui = { ...off, run: true };
			},
			task: {
				prompt: 'Press **Run** and watch the clusters form.',
				done: (s) => s.target > 0 && finished(s)
			}
		},
		{
			title: 'Perplexity sets the scale',
			body: (s) => `Perplexity = **${s.perplexity}**. ${perplexityNote(s.perplexity)}

Each change rebuilds the neighbour probabilities and re-runs the map from the same random start. ${finished(s) ? `Right now ${pct(s.live.kept)} of each point's 10 nearest neighbours survive onto the map.` : 'Running…'}

There's no single correct value. Try a few and trust structure that shows up across all of them. Perplexity must stay well below the number of points.`,
			enter: (s) => {
				s.target = maxIter(s);
				s.ui = { ...off, perplexity: true };
			},
			task: {
				prompt: 'Try a perplexity of **5 or less**, then **50 or more**.',
				done: (s) => s.did.perps.some((p) => p <= 5) && s.did.perps.some((p) => p >= 50)
			}
		},
		{
			title: "Don't read sizes or gaps",
			body: (s) => `A finished map at perplexity 30: five clean clusters, with indigo and green kept apart, which PCA couldn't do.

It's tempting to read more into the picture than that. ${finished(s) ? '' : 'Running…'}`,
			enter: (s) => {
				s.perplexity = 30;
				s.target = maxIter(s);
				s.ui = { ...off };
			},
			quiz: {
				question: 'In 3-D the amber cluster is about 4× wider than the pink one. How do they compare on the map?',
				options: ['Amber is still about 4× wider', 'They come out roughly the same size', 'Amber is split into four pieces'],
				answer: 1,
				explain: (s) =>
					`Because σ adapts to local density, every point gets about the same number of neighbours however spread out its cluster is, and t-SNE expands dense clusters and shrinks sparse ones. Width ratio: **${fmt(inputRatio(), 1)}×** in 3-D, **${fmt(s.live.ratio, 1)}×** on the map (dashed rings). Gaps lie too: indigo and green are 1.8 apart in 3-D, amber and cyan about 5.3, yet the map spaces clusters by its own logic. Read t-SNE for **who is near whom**, not how big or how far.`,
				reveal: (s) => {
					s.show.sizes = true;
				}
			}
		},
		{
			title: 'Every run is different',
			body: (s) => `t-SNE's loss has many local minima, so a different random start gives a different map: clusters swap places, rotate or mirror. Neighbourhoods stay stable; the overall layout doesn't. This is run #${s.seed}.

In practice: fix \`random_state\` for reproducible figures, use \`init='pca'\` for steadier layouts, and **don't** use the coordinates as model features. t-SNE has no \`transform()\` to place new points.`,
			enter: (s) => {
				s.show.sizes = false;
				s.ui = { ...off, seed: true };
			},
			task: {
				prompt: 'Press **New random start** a couple of times and compare the maps.',
				done: (s) => s.did.seeds >= 2
			}
		},
		{
			title: 'UMAP: same goal, faster',
			body: (s) => `UMAP keeps neighbourhoods too, but builds them differently:

1. Connect each point to its **k nearest neighbours** (grey lines, n_neighbors = **${s.nNeighbors}**). Each edge gets a fuzzy weight: 1 for the closest neighbour, decaying for the rest.
2. Lay the graph out with stochastic gradient descent on a **cross-entropy**: edges pull their endpoints together, and a few randomly sampled non-neighbours get pushed away (*negative sampling*).

Only k edges per point instead of all n² pairs, so it scales to millions of rows. It often keeps more of the global layout, and it can \`transform()\` new data. \`min_dist\` (0.1 here) sets how tightly points may pack.`,
			enter: (s) => {
				s.seed = 1;
				s.show.graph = true;
				setMethod(s, 'umap');
				setNeighbors(s, 15);
				s.target = maxIter(s);
				s.ui = { ...off, rotate: true, neighbors: true, method: true };
			},
			task: {
				prompt: 'Raise **n_neighbors** to 50 or more. The graph starts bridging clusters, so their placement on the map depends more on the global structure.',
				done: (s) => s.did.neighbors.some((k) => k >= 50)
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap:

- Both methods turn high-dimensional distances into **neighbour similarities** and arrange a 2-D map that preserves them.
- **t-SNE**: Gaussian p_ij tuned by perplexity, Student-t q_ij on the map, gradient descent on KL. **UMAP**: fuzzy k-NN graph, cross-entropy, SGD with negative sampling.
- Cluster **sizes and gaps** aren't meaningful, and runs change with the seed.
- Scale features first, and on wide data reduce to ~50 dims with PCA. Use the maps for exploration; UMAP output can also feed clustering such as [DBSCAN](concept:dbscan).`,
			enter: (s) => {
				s.show = { neigh: false, sizes: false, graph: true };
				s.method = 'tsne';
				s.perplexity = 30;
				s.view = { ...START_VIEW };
				s.target = maxIter(s);
				s.ui = { rotate: true, pick: false, perplexity: true, run: true, seed: true, method: true, neighbors: true };
				setPerplexity(s, 30);
			}
		}
	]
};

export default explainer;
