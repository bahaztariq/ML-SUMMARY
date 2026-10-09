/**
 * Guided explainer: Gaussian mixture models as soft clustering, fitted with EM.
 */
import type { ExplainerModule } from '../types';
import Scene from './Scene.svelte';
import i18n from './i18n';
import { nParams } from './gmm';
import {
	GOOD_SEED,
	bicOf,
	currentLL,
	doE,
	doM,
	init,
	maxGamma,
	mostAmbiguous,
	off,
	place,
	points,
	resp,
	runAll,
	setData,
	setK,
	type GmmState
} from './state';

const f1 = (v: number) => v.toFixed(1);
const pct = (v: number) => `${Math.round(v * 100)}%`;
const gammaText = (s: GmmState) => {
	const r = resp(s);
	if (!r || s.selected < 0) return '';
	return r[s.selected].map((g, j) => `γ${j + 1} = ${pct(g)}`).join(', ');
};
const bestK = (s: GmmState) => {
	const b = bicOf(s.dataset);
	return b.indexOf(Math.min(...b)) + 1;
};

const explainer: ExplainerModule<GmmState> = {
	title: 'How Gaussian mixtures cluster softly',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Stretched, overlapping groups',
			body: (s) => `Here are **${points(s).length} points** in three groups: two long, thin diagonal stripes lying side by side, and a small round blob on the right.

The stripes are close together and elongated. Clusters like this are common in real data whenever two features are correlated, for example height and weight.`,
			enter: (s) => {
				setData(s, 'stretched');
			}
		},
		{
			title: 'What K-Means does here',
			body: (s) =>
				s.view === 'kmeans'
					? `[K-Means](concept:kmeans) assigns every point to the **nearest centroid**, so its clusters are always round-ish regions split by straight lines. A long stripe is far from its own centre at both ends, so its ends get claimed by other centroids.

We need a model where each cluster can have its own **shape**: wide or narrow, stretched, tilted.`
					: `Before looking at a new method, predict what [K-Means](concept:kmeans) with K = 3 does with these stripes.`,
			enter: (s) => {
				s.view = 'gmm';
			},
			quiz: {
				question: 'What will K-Means with K = 3 do on these points?',
				options: [
					'Find the two stripes and the blob',
					'Cut across the stripes, mixing pieces of both',
					'Merge the two stripes and split the blob in two'
				],
				answer: 1,
				explain: `K-Means measures plain distance to a centre, which treats every direction the same. A long stripe doesn't fit in one round region, so it gets chopped into pieces that are shared with the neighbouring stripe.`,
				reveal: (s) => {
					s.view = 'kmeans';
				}
			}
		},
		{
			title: 'A cluster as a Gaussian',
			body: (s) => `A **Gaussian mixture** describes the data as K overlapping bell-shaped "spotlights". Each component k has three things:

- a **weight** π_k: what share of the points it explains (they sum to 1),
- a **mean** μ_k: its centre (the marker),
- a **covariance** Σ_k: its shape. Ellipses show 1 and 2 standard deviations. A full covariance can be wide, narrow, stretched or tilted.

The density is \`p(x) = Σ π_k · N(x | μ_k, Σ_k)\`, shaded in the background. We start from a rough guess: ${s.k} round components at random points.`,
			enter: (s) => {
				s.view = 'gmm';
				s.seed = GOOD_SEED;
				place(s);
				s.show.ellipses = true;
				s.show.heat = true;
			}
		},
		{
			title: 'E-step: who is responsible for each point?',
			body: (s) => `**Expectation step.** For every point, ask each component how likely it is to have produced it, weighted by π, then normalise so the answers sum to 1:

\`γ_ik = π_k N(x_i | k) / Σ_j π_j N(x_i | j)\`

These **responsibilities** are soft: each point's colour is a blend of the component colours by γ. ${s.selected >= 0 ? `Selected point: **${gammaText(s)}**.` : ''}`,
			enter: (s) => {
				doE(s);
				s.ui.select = true;
				s.show.gamma = true;
			},
			task: {
				prompt: 'Click a point with a **blended colour**: one where no component claims more than 90%.',
				done: (s) => s.did.picked.length > 0 && maxGamma(s) < 0.9
			}
		},
		{
			title: 'M-step: refit each Gaussian',
			body: (s) => `**Maximisation step.** Each component is refitted to the points, counting each point only by its responsibility γ:

- **π_k** = average γ for component k,
- **μ_k** = γ-weighted mean of the points,
- **Σ_k** = γ-weighted spread around that mean.

The ellipses jump toward the points they're responsible for and start to stretch. Log-likelihood (how probable the data is under the model, higher is better): **${f1(currentLL(s))}**.`,
			enter: (s) => {
				s.ui.select = false;
				s.show.gamma = false;
				s.selected = -1;
				doM(s);
			}
		},
		{
			title: 'Repeat: EM climbs the likelihood',
			body: (s) => `Alternate E and M. Each round can only **raise** the log-likelihood (or keep it the same), just as K-Means can only lower its inertia, so EM always settles down.

${s.converged ? `**Converged after ${s.iteration} iterations**, log-likelihood ${f1(s.ll[s.ll.length - 1])}. The ellipses now trace the two stripes and the blob.` : `Iteration **${s.iteration}**, log-likelihood **${s.ll.length ? f1(s.ll[s.ll.length - 1]) : '—'}**.`}`,
			enter: (s) => {
				s.ui = { ...off, em: true };
				s.show.llChart = true;
			},
			task: {
				prompt: 'Press **Run** (or **Step** repeatedly) until EM converges.',
				done: (s) => s.converged
			}
		},
		{
			title: 'Soft vs. hard assignments',
			body: `After fitting, \`predict()\` gives each point its most likely component, like K-Means. But GMM also gives **probabilities** with \`predict_proba()\`: a point deep inside a stripe is ~100% that stripe; a point where components overlap gets split.

Because the model is a full density, \`score_samples()\` also tells you how *unusual* a point is. Very low density points are anomalies.`,
			enter: (s) => {
				s.ui = { ...off };
				runAll(s);
				s.selected = mostAmbiguous(s);
				s.show.gamma = false;
			},
			quiz: {
				question: 'The ringed point sits where two fitted components overlap. What does GMM report for it?',
				options: [
					'A single label, exactly like K-Means would',
					'A probability for each component that sums to 1',
					'Nothing: points between clusters are marked as noise'
				],
				answer: 1,
				explain: (s) =>
					`It reports a responsibility for every component: here **${gammaText(s)}**. You can use these probabilities directly (e.g. flag uncertain points for review) or take the largest one as a hard label.`,
				reveal: (s) => {
					s.show.gamma = true;
				}
			}
		},
		{
			title: 'How many components? BIC',
			body: (s) => `More components always fit the data at least as well, so likelihood alone would pick the largest K. The **Bayesian Information Criterion** adds a penalty for every parameter:

\`BIC = −2·log L + p·ln n\`, with p = 6K − 1 here (2 for each mean, 3 per covariance, K − 1 weights).

**Lower is better.** K = ${s.k} has ${nParams(s.k)} parameters. The minimum is at **K = ${bestK(s)}**.`,
			enter: (s) => {
				s.selected = -1;
				s.show.gamma = false;
				s.show.llChart = false;
				s.show.bic = true;
				s.ui = { ...off, k: true };
				setK(s, 1);
			},
			task: {
				prompt: 'Use the K slider (or click the BIC chart) to pick the K with the lowest BIC.',
				done: (s) => s.k === bestK(s) && s.converged
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap:

1. Pick K (by BIC) and initialise K Gaussians (scikit-learn uses K-Means).
2. **E-step**: responsibilities γ for every point.
3. **M-step**: refit π, μ, Σ as γ-weighted averages.
4. Repeat until the log-likelihood stops rising.

Try **New start** with K = 3: EM can get stuck in worse local optima, which is why \`n_init\` restarts help. On the **Moons**, Gaussians can't follow the curves; use [DBSCAN](concept:dbscan) there.`,
			enter: (s) => {
				s.ui = { em: true, restart: true, k: true, select: true, dataset: true, view: true, colour: true };
				s.show = { ellipses: true, heat: true, soft: true, gamma: true, llChart: true, bic: true };
				s.view = 'gmm';
				s.seed = GOOD_SEED;
				setK(s, 3);
			}
		}
	]
};

export default explainer;
