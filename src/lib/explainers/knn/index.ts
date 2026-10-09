/**
 * Guided explainer: k-nearest neighbours — voting, choosing k, decision boundaries, distance
 * metrics and feature scaling.
 */
import type { ExplainerModule } from '../types.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import { N, QUERY_START, TEST, TRAIN, bestK, init, off, setScale, testAcc, tieSpot, trainAcc, voteAt, type KnnState } from './state.ts';

const pct = (v: number) => `${Math.round(v * 100)}%`;
const name = (c: number) => (c ? 'B' : 'A');
const voteText = (s: KnnState) => {
	const v = voteAt(s);
	const [a, b] = v.votes;
	return s.weights === 'distance'
		? `weighted votes A ${a.toFixed(1)} vs B ${b.toFixed(1)}`
		: `**${a} A** vs **${b} B**`;
};
const nA = TRAIN.y.filter((c) => c === 0).length;

const explainer: ExplainerModule<KnnState> = {
	title: 'How k-nearest neighbours classifies by asking around',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Ask the neighbours',
			body: (s) => {
				const v = voteAt(s);
				return `Here are **${N} training points** from two classes. To classify a new point (the ◆ query), k-NN does the simplest thing imaginable: it finds the **k training points closest to it** and lets them **vote**.

Here k = ${s.k}. The lines connect the query to its ${s.k} nearest neighbours, and the circle reaches out to the farthest of them. The vote is ${voteText(s)}, so the query is predicted **${name(v.pred)}**.`;
			},
			enter: (s) => {
				s.ui.query = true;
			},
			task: {
				prompt: 'Drag the ◆ query until its predicted class **flips**.',
				done: (s) => s.did.flip
			}
		},
		{
			title: 'k is the only real knob',
			body: (s) => {
				const v = voteAt(s);
				return `The same query can get different answers depending on how many neighbours you ask. With k = 1 the single closest point decides. Larger k asks more of the neighbourhood.

k = **${s.k}**: ${voteText(s)}${v.tie ? ', a **tie**' : ''} → **${name(v.pred)}**.`;
			},
			enter: (s) => {
				s.query = [QUERY_START[0], QUERY_START[1]];
				s.ui.query = false;
				s.ui.k = true;
			},
			quiz: {
				question: 'With two classes, why do people usually pick an odd k?',
				options: ['Odd k makes prediction faster', 'So the vote can never end in a tie', 'Even values of k overfit'],
				answer: 1,
				explain: `With an even k the vote can split evenly. We moved the query to a spot where k = 4 gives **2 A vs 2 B**. scikit-learn then picks the class that comes first in its label order (here A), which is arbitrary. An odd k avoids this for two classes; weighting votes by distance is another way out.`,
				reveal: (s) => {
					s.k = 4;
					s.query = tieSpot(4);
				}
			}
		},
		{
			title: 'No training, just memory',
			body: (s) => `What does \`fit()\` do for k-NN? It **stores the training set**, nothing more. That's why k-NN is called a **lazy** learner.

All the work happens at prediction time. For each query: compute the distance to **all ${N}** stored points (the faint lines), sort them, keep the ${s.k} smallest. The cost grows with the number of stored points × the number of features, for every single prediction. Large datasets need KD-trees or approximate nearest-neighbour indexes.`,
			enter: (s) => {
				s.ui = { ...off, query: true };
				s.k = 5;
				s.query = [QUERY_START[0], QUERY_START[1]];
				s.show.allDist = true;
			}
		},
		{
			title: 'The decision boundary for k = 1',
			body: (s) => `Now color every spot on the plane by what k-NN would predict there. With **k = 1** each training point claims the area closest to it.

The boundary is jagged, and every mislabeled point gets its own island. Training accuracy is **${pct(trainAcc(s))}** by construction: each training point is its own nearest neighbour. On ${TEST.X.length} new points, accuracy is **${pct(testAcc(s))}**.

That's low bias and high variance: the boundary chases noise.`,
			enter: (s) => {
				s.ui = { ...off };
				s.show.allDist = false;
				s.show.links = false;
				s.show.ball = false;
				s.show.regions = true;
				s.k = 1;
			}
		},
		{
			title: 'Larger k smooths the boundary',
			body: (s) =>
				s.k === N
					? `Now **k = ${N}**: the whole training set votes on every query, so every query gets the same answer and there is no boundary left. Training accuracy ${pct(trainAcc(s))}, accuracy on new points **${pct(testAcc(s))}**.`
					: `With **k = ${s.k}**, each prediction averages over more neighbours. Isolated noisy points get outvoted and the boundary becomes smoother.

Training accuracy ${pct(trainAcc(s))}, accuracy on new points **${pct(testAcc(s))}**.`,
			enter: (s) => {
				s.k = 15;
			},
			quiz: {
				question: `What does k-NN predict with k = ${N}, every training point?`,
				options: ['The majority class everywhere', 'The same boundary as k = 1', 'A straight-line boundary'],
				answer: 0,
				explain: (s) =>
					`Every query now has the same ${N} neighbours: ${nA} A against ${N - nA} B, so **A wins everywhere**. Accuracy on new points drops to ${pct(testAcc(s))}, no better than always guessing the most common class. Too large a k **underfits**.`,
				reveal: (s) => {
					s.k = N;
				}
			}
		},
		{
			title: 'Finding the sweet spot',
			body: (s) => {
				const b = bestK(s);
				return `The chart shows training and test accuracy for every k. Small k overfits (training accuracy high, test lower); large k underfits (both drop). This is the [bias-variance trade-off](concept:bias-variance-tradeoff) in one slider.

k = **${s.k}**: training ${pct(trainAcc(s))}, test **${pct(testAcc(s))}**. The best test score here is ${pct(b.acc)} at k = ${b.k}. On real data you don't have the test labels, so you choose k with [cross-validation](concept:cross-validation).`;
			},
			enter: (s) => {
				s.ui = { ...off, k: true };
				s.show.curve = true;
				s.k = 1;
			},
			task: {
				prompt: 'Move k (slider or click the chart) to a value within **1 point** of the best test accuracy.',
				done: (s) => testAcc(s) >= bestK(s).acc - 0.01
			}
		},
		{
			title: 'What does "nearest" mean?',
			body: (s) => {
				const f: Record<string, string> = {
					euclidean: '`√(Δx₁² + Δx₂²)`: straight-line distance; equal distance forms a **circle**',
					manhattan: '`|Δx₁| + |Δx₂|`: distance walking along a grid; equal distance forms a **diamond**',
					chebyshev: '`max(|Δx₁|, |Δx₂|)`: the largest single difference; equal distance forms a **square**'
				};
				return `"Nearest" depends on how you measure distance. The shape around the query shows all points at the same distance as the k-th neighbour:

**${s.metric[0].toUpperCase() + s.metric.slice(1)}**: ${f[s.metric]}.

Different metrics can pick different neighbours, but on low-dimensional data the predictions are usually similar. Here, test accuracy at k = ${s.k} is **${pct(testAcc(s))}**. Cosine distance is common for text and [embeddings](concept:embeddings).`;
			},
			enter: (s) => {
				s.ui = { ...off, metric: true, query: true };
				s.show.curve = false;
				s.show.regions = false;
				s.show.links = true;
				s.show.ball = true;
				s.k = 5;
				s.query = [QUERY_START[0], QUERY_START[1]];
			},
			task: {
				prompt: 'Try **Manhattan** and **Chebyshev** and watch the neighbourhood change shape.',
				done: (s) => s.did.metric
			}
		},
		{
			title: 'Why feature scaling matters',
			body: (s) => {
				const v = voteAt(s);
				const now =
					s.scaleY === 1
						? `Right now both features count equally (x₂ × 1).`
						: `x₂ is now multiplied by **${s.scaleY}** before measuring distance. The plot keeps the original units so you can still see the shape, which is why the neighbourhood looks squashed: a small vertical gap now costs as much as a large horizontal one.`;
				return `k-NN adds up raw differences, so a feature with **bigger numbers counts for more**. Units are arbitrary: the same x₂ measured in centimetres instead of metres would have numbers 100× larger.

${now}

Vote: ${voteText(s)} → **${name(v.pred)}**. Accuracy on new points **${pct(testAcc(s))}**.`;
			},
			enter: (s) => {
				s.ui = { ...off, query: true };
				s.show.regions = true;
				s.k = 5;
				s.query = [QUERY_START[0], QUERY_START[1]];
			},
			quiz: {
				question: 'Multiply x₂ by 10 (a unit change). What happens to the neighbours?',
				options: ['Nothing: same points, same neighbours', 'x₂ dominates: neighbours are picked almost only by x₂', 'x₁ dominates, because it is now relatively smaller'],
				answer: 1,
				explain: (s) =>
					`Vertical differences are now 10× larger, so the "nearest" points are simply those at a similar height. The boundary turns into horizontal bands and accuracy on new points falls from ${pct(testAcc({ ...s, scaleY: 1 }))} to **${pct(testAcc({ ...s, scaleY: 10 }))}**. The fix is to [scale the features](concept:feature-scaling) (for example StandardScaler) so each has a comparable spread.`,
				reveal: (s) => {
					setScale(s, 10);
					s.ui.scale = true;
				}
			},
			task: {
				prompt: 'After answering, press **Standardize** to give both features the same scale again.',
				done: (s) => s.did.standardized
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked: drag the query, change k, the metric, the vote weighting and the scale of x₂.

Recap:

1. **Training = storing the data.** Prediction measures the distance to every stored point.
2. The **k nearest** neighbours vote (optionally weighted by 1/distance).
3. **Small k** gives a jagged, overfit boundary; **large k** a smooth one that eventually ignores the data. Tune k with cross-validation; use an odd k for two classes.
4. **Scale your features**: k-NN uses raw distances.
5. In many dimensions every point is roughly equally far from every other, and "nearest" stops meaning much: the [curse of dimensionality](concept:curse-of-dimensionality).

The same neighbour idea also fills in missing values: see [KNN imputer](concept:knn-imputer).`,
			enter: (s) => {
				s.ui = { query: true, k: true, metric: true, weights: true, scale: true, view: true };
				s.show = { links: true, ball: true, allDist: false, regions: true, curve: true, test: false };
				s.k = 5;
				s.scaleY = 1;
				s.metric = 'euclidean';
				s.query = [QUERY_START[0], QUERY_START[1]];
			}
		}
	]
};

export default explainer;
