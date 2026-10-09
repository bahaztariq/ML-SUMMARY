/**
 * Guided explainer: agglomerative hierarchical clustering and the dendrogram.
 */
import type { ExplainerModule } from '../types';
import Scene from './Scene.svelte';
import i18n from './i18n';
import { heightForK, largestGapK } from './hclust';
import { finish, init, k, n, off, setCutK, setData, tree, type HcState } from './state';

const h2 = (v: number) => v.toFixed(2);
const lastH = (s: HcState) => (s.merged ? tree(s)[s.merged - 1].height : 0);

const LINKAGE_TEXT = {
	single: '**single**: the distance between their two *closest* points',
	complete: '**complete**: the distance between their two *farthest* points',
	average: '**average**: the mean distance over every pair of points, one from each cluster (dashed line joins the cluster centres)',
	ward: '**Ward**: how much the total within-cluster variance would grow if they merged'
} as const;

const explainer: ExplainerModule<HcState> = {
	title: 'How hierarchical clustering builds a tree',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Every point starts as its own cluster',
			body: (s) => `Here are **${n(s)} points**. Agglomerative (bottom-up) clustering starts with **${n(s)} clusters**: every point on its own, shown grey.

Then it repeats a single move: **merge the two closest clusters**. After ${n(s) - 1} merges everything is one cluster. The record of those merges is a tree, the **dendrogram**, drawn below the plot. For now it is just ${n(s)} leaves.`,
			enter: (s) => {
				setData(s, 'blobs');
				s.merged = 0;
			}
		},
		{
			title: 'Merge the two closest clusters',
			body: (s) => `The first merge joins the two points closest together (${h2(tree(s)[0].height)} apart). They now form one cluster (outlined).

Each merge leaves **one cluster fewer**: ${k(s)} left after ${s.merged} merge${s.merged === 1 ? '' : 's'}. Early merges join near-identical points; later ones join whole groups.`,
			enter: (s) => {
				s.merged = 1;
				s.show.pair = true;
				s.ui.merge = true;
			},
			task: {
				prompt: 'Press **Merge next** (or **Play**) until only **10 clusters** are left.',
				done: (s) => k(s) <= 10
			}
		},
		{
			title: 'The dendrogram records every merge',
			body: (s) => `Each merge draws a **∩** in the dendrogram that joins the two clusters at a **height** equal to the distance at which they merged. The latest merge is highlighted: height **${h2(lastH(s))}**.

Short links mean very similar points. Tall links mean two groups that were far apart when they finally joined. Notice how the heights jump near the end: those final merges glue the real groups together.`,
			enter: (s) => {
				s.merged = Math.max(s.merged, 20);
			},
			task: {
				prompt: 'Keep merging until the tree is complete (one cluster left).',
				done: (s) => s.merged >= n(s) - 1
			}
		},
		{
			title: 'Linkage: the distance between two groups',
			body: (s) => `Distance between two *points* is clear. Between two *clusters* you must choose a rule, the **linkage**. Currently ${LINKAGE_TEXT[s.linkage]}.

The highlighted pair is the final merge, joining the last two clusters at height **${h2(lastH(s))}**. Each linkage builds a different tree, and the heights change scale with it.`,
			enter: (s) => {
				finish(s);
				s.ui = { ...off, linkage: true };
			},
			task: {
				prompt: 'Try at least **three linkages** and compare the trees.',
				done: (s) => s.did.linkages.length >= 3
			}
		},
		{
			title: 'Single linkage chains',
			body: (s) => `New data: two blobs joined by a thin **bridge** of points, plus one lone **outlier** at the bottom. The tree is cut into **2 clusters** using **${s.linkage}** linkage.

${s.linkage === 'single' ? `Single linkage only looks at the *closest* pair, so the bridge works like stepping stones: each step is short, the blobs merge early, and the last merge to happen is the outlier joining. Cut into 2, you get "everything" vs. "one outlier". This is called **chaining**.` : `With ${s.linkage} linkage the cut separates the left blob from the right blob, as you'd expect.`}`,
			enter: (s) => {
				s.ui = { ...off };
				s.linkage = 'average';
				setData(s, 'chain');
				setCutK(s, 2);
			},
			quiz: {
				question: 'Switch to single linkage and cut into 2 clusters. What do you get?',
				options: [
					'The left blob and the right blob, split in the middle of the bridge',
					'One huge cluster with almost everything, and the outlier on its own',
					'Two clusters of exactly equal size'
				],
				answer: 1,
				explain: `Single linkage merges whatever has the closest pair of points. Every gap along the bridge is short, so both blobs merge through it long before the outlier joins. The outlier's merge is the highest in the tree, so a 2-cluster cut isolates just that one point.`,
				reveal: (s) => {
					s.linkage = 'single';
					setCutK(s, 2);
					s.ui.linkage = true;
					if (!s.did.linkages.includes('single')) s.did.linkages.push('single');
				}
			}
		},
		{
			title: "Ward linkage: K-Means' cousin",
			body: (s) => `**Ward** linkage (scikit-learn's default) merges the pair of clusters that increases the total **within-cluster variance** the least:

\`Δ(A, B) = |A|·|B| / (|A| + |B|) · ‖μ_A − μ_B‖²\`

(the dendrogram plots √(2Δ), as SciPy does). Total within-cluster variance is exactly what [K-Means](concept:kmeans) minimises, so Ward prefers compact, similar-sized clusters and ignores thin bridges. With ${s.linkage} linkage and K = ${k(s)}, ${s.linkage === 'ward' ? 'the two blobs come out as the two clusters.' : 'compare this with Ward.'}`,
			enter: (s) => {
				s.linkage = 'ward';
				setData(s, 'chain');
				setCutK(s, 2);
				s.ui = { ...off, linkage: true };
			}
		},
		{
			title: 'Cut the tree to get clusters',
			body: (s) => `The dendrogram holds *every* clustering from ${n(s)} clusters down to 1. To get flat labels, **cut** it with a horizontal line: merges below the line are kept, merges above it are undone. Each branch crossing the line is one cluster.

Cut height **${h2(s.cutH)}** → **K = ${k(s)}** clusters. That's scikit-learn's \`distance_threshold\`; asking for \`n_clusters\` places the cut for you.`,
			enter: (s) => {
				s.linkage = 'ward';
				setData(s, 'blobs');
				setCutK(s, 2);
				s.ui = { ...off, cut: true };
				s.did.cutDrag = false;
			},
			task: {
				prompt: 'Drag the dashed cut line in the dendrogram down until you get **5 or more** clusters.',
				done: (s) => s.did.cutDrag && k(s) >= 5
			}
		},
		{
			title: 'Where to cut: the biggest gap',
			body: (s) => `Unlike K-Means you choose K *after* building the tree, by reading it. Current cut: **K = ${k(s)}** at height ${h2(s.cutH)}.

You can also score each K with the [silhouette score](concept:silhouette-score).`,
			enter: (s) => {
				setCutK(s, 6);
			},
			quiz: {
				question: 'Where is the most natural place to cut this tree?',
				options: [
					'Just below the very top merge, which always gives K = 2',
					'Across the tallest stretch with no merges at all',
					'Low down, so every cluster is very tight'
				],
				answer: 1,
				explain: (s) =>
					`A long vertical gap means the clusters below it stayed apart over a wide range of distances: they are well separated. Here the tallest gap gives **K = ${largestGapK(tree(s), n(s))}**, the three blobs. Cutting low splits real groups; the top merge isn't special.`,
				reveal: (s) => {
					s.cutH = heightForK(tree(s), n(s), largestGapK(tree(s), n(s)));
				}
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap:

1. Start with every point as its own cluster.
2. Repeatedly merge the two closest clusters, by your **linkage** rule.
3. The merge heights form the **dendrogram**.
4. **Cut** it at a height (or at K) to get flat clusters.

The result is deterministic and you see every granularity at once. The costs: O(n²) memory, merges can never be undone, no \`predict()\` for new points, and distances need [scaled features](concept:feature-scaling). For noisy, oddly shaped data try [DBSCAN](concept:dbscan).`,
			enter: (s) => {
				s.ui = { merge: true, linkage: true, cut: true, dataset: true };
				s.show.pair = true;
				s.linkage = 'ward';
				setData(s, 'blobs');
				setCutK(s, 3);
			}
		}
	]
};

export default explainer;
