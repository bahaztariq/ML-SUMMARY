/**
 * Guided explainer: how PCA finds the most informative directions.
 */
import { fmt } from '#lib/viz/canvas.ts';
import type { ExplainerModule } from '../types.ts';
import Scene from './Scene.svelte';
import i18n from './i18n';
import { angleGap, angleOf } from './pca.ts';
import {
	START_VIEW,
	bestShare,
	bodyFit,
	corrFit,
	deg,
	faceOn,
	hidden,
	init,
	off,
	pancakeFit,
	pc1Angle,
	pct,
	projVar,
	reconError,
	screenShare,
	setUnits,
	totalVar2,
	type PCAState
} from './state.ts';

const C = () => corrFit().cov;
const covText = () => `[[${fmt(C()[0][0])}, ${fmt(C()[0][1])}], [${fmt(C()[1][0])}, ${fmt(C()[1][1])}]]`;
const lam = (k: number) => fmt(corrFit().values[k]);
const r3 = (k: number) => pct(pancakeFit().ratio[k], 1);
const UNIT_TEXT = { mm: 'height in millimetres', m: 'height in metres', z: 'both features standardized' } as const;

const explainer: ExplainerModule<PCAState> = {
	title: 'How PCA finds the most informative directions',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Two features, one cloud',
			body: `Each dot is one sample measured on two features, **x₁** and **x₂**. They're correlated: when x₁ is high, x₂ tends to be high too, so the cloud is a tilted ellipse.

That means the two columns partly repeat each other. [PCA](concept:what-is-dimensionality-reduction) looks for **new axes** lined up with the cloud, so that most of the information lands on the first one or two and the rest can be dropped.

The ✕ marks the **mean** of the cloud.`
		},
		{
			title: 'First, center the data',
			body: `PCA measures how points spread **around their mean**, so the first move is to subtract each feature's mean: x₁ − x̄₁ and x₂ − x̄₂.

The cloud slides until the ✕ sits on the origin. Its shape and spread don't change at all. Only its position does.

Every direction we try next is a line **through the origin**, so without centering we'd be measuring distance from (0, 0) instead of spread.`,
			enter: (s) => {
				s.centered = true;
			}
		},
		{
			title: 'Project onto a direction',
			body: (s) => `Pick a direction through the origin (the purple line) and drop every point straight onto it. Each point becomes **one number**, its position along the line: z = x · u. That's what squeezing 2 features into 1 means.

The thick bar spans ±2 standard deviations of those numbers. At **${deg(s.angle)}** their variance is **${fmt(projVar(s))}**, which is **${pct(projVar(s) / totalVar2())}** of the total variance (${fmt(totalVar2())}).

More variance kept means more of the differences between points survive the squeeze.`,
			enter: (s) => {
				s.show = { ...hidden, mean: true, proj: true };
				s.ui = { ...off, angle: true };
			},
			task: {
				prompt: 'Rotate the line (drag on the plot or use the slider) until the projections are **as spread out as possible**.',
				done: (s) => s.did.angle && angleGap(s.angle, pc1Angle()) <= 2
			}
		},
		{
			title: 'The winner is an eigenvector',
			body: (s) => `The chart below plots the variance for every angle (you're at ${deg(s.angle)}). It peaks at **${deg(pc1Angle())}**: that direction is **PC1**, the first principal component.

You don't have to search for it. PC1 is the top **eigenvector** of the covariance matrix C = ${covText()}, meaning C·v = λ·v. Its eigenvalue **λ₁ = ${lam(0)}** is exactly the variance along PC1. See [linear algebra](concept:linear-algebra) for a refresher.`,
			enter: (s) => {
				s.angle = Math.round(pc1Angle());
				s.show.curve = true;
				s.show.pc1 = true;
			},
			quiz: {
				question: 'PC2 is the direction of greatest remaining variance. Where is it?',
				options: ['At 45° to PC1', 'At 90° to PC1 (perpendicular)', 'Anywhere: once PC1 is chosen, PC2 is random'],
				answer: 1,
				explain: () =>
					`Principal components are **orthogonal**. In 2-D that leaves one choice, at ${deg(angleOf(corrFit().vectors[1]))}, which is also the **lowest** point of the curve: λ₂ = ${lam(1)}. Together λ₁ + λ₂ = ${fmt(totalVar2())}, the total variance, so PC1 alone explains **${pct(corrFit().ratio[0])}**. Because the new axes are perpendicular, the new features are **uncorrelated**.`,
				reveal: (s) => {
					s.show.pc2 = true;
				}
			}
		},
		{
			title: 'Three features: find the best camera angle',
			body: (s) => `Now there are three features. These 210 points form three groups lying close to a tilted plane.

A 2-D picture of 3-D data is a **shadow**: any spread along your line of sight is lost. Right now **${pct(screenShare(s.view))}** of the total variance is visible on screen.

Finding the camera angle that keeps the most spread is exactly what PCA does in any number of dimensions.`,
			enter: (s) => {
				s.dataset = 'pancake';
				s.view = { ...START_VIEW };
				s.show = { ...hidden };
				s.ui = { ...off, rotate: true };
			},
			task: {
				prompt: `Drag to rotate the cloud until at least **${pct(bestShare() - 0.02)}** of the variance is visible.`,
				done: (s) => s.did.rotate && screenShare(s.view) >= bestShare() - 0.02
			}
		},
		{
			title: 'Explained variance and the scree plot',
			body: `PCA computes that angle directly: the eigenvectors of the 3×3 covariance matrix are **PC1, PC2, PC3**, all at right angles. You're now looking straight down PC3.

The **scree plot** shows each component's share of the variance: PC1 ${r3(0)}, PC2 ${r3(1)}, PC3 only **${r3(2)}**. Keeping two components keeps **${pct(pancakeFit().ratio[0] + pancakeFit().ratio[1], 1)}**.

On the right is each point's position along PC1 and PC2: the new two-feature dataset **Z = X·W₂** you'd hand to the next model. The three groups survive intact.

In practice you keep the smallest number of components whose cumulative share passes a target, e.g. \`PCA(n_components=0.95)\`.`,
			enter: (s) => {
				s.view = faceOn();
				s.show = { ...hidden, pc1: true, scree: true, shadow: true };
			}
		},
		{
			title: 'What dropping a component costs',
			body: (s) => `Compressing means throwing components away. To see what's lost, map each point's code back into 3-D: **x̂ = mean + z₁·PC1 + z₂·PC2**.

${
	s.show.recon && s.k < 3
		? `Keeping **${s.k}** component${s.k > 1 ? 's' : ''}: the pink lines join each point to its reconstruction, and their mean squared length is the **reconstruction error ${fmt(reconError(s.k), 3)}**.`
		: 'With all 3 components kept, every point is reconstructed perfectly: error 0.'
}`,
			enter: (s) => {
				s.view = { yaw: faceOn().yaw + 0.9, pitch: 0.25 };
				s.k = 3;
			},
			quiz: {
				question: 'Keep only PC1 and PC2. What will the reconstruction error be?',
				options: [
					'Zero: two components describe every point exactly',
					'Exactly the variance along PC3 (λ₃)',
					'Half of the total variance'
				],
				answer: 1,
				explain: () =>
					`Every point lands on the PC1–PC2 plane, and what's lost is its offset along PC3. The error is **${fmt(reconError(2), 3)} = λ₃**. Drop PC2 too and it grows to λ₂ + λ₃ = **${fmt(reconError(1), 3)}**. Explained variance and reconstruction error are two sides of the same coin: PCA keeps the most variance *and* loses the least, in squared error, for a given number of components.`,
				reveal: (s) => {
					s.k = 2;
					s.show.recon = true;
					s.ui.k = true;
				}
			}
		},
		{
			title: 'Scale your features first',
			body: (s) => {
				const f = bodyFit(s.units);
				return `Real features come in different units. Here are 200 adults, **height** and **weight**, correlation ≈ 0.7, plotted on equal axes in the current units (${UNIT_TEXT[s.units]}).

${s.show.pc1 ? `PC1 = **${fmt(f.vectors[0][0])}·height + ${fmt(f.vectors[0][1])}·weight** and it explains ${pct(f.ratio[0], 1)} of the variance.` : 'PCA only sees the numbers, not what they mean.'}

The fix is [feature scaling](concept:feature-scaling): standardize every feature to mean 0 and standard deviation 1 before PCA.`;
			},
			enter: (s) => {
				s.dataset = 'body';
				s.k = 3; // undo the previous quiz's reveal
				setUnits(s, 'mm');
				s.show = { ...hidden };
				s.ui = { ...off, units: true };
			},
			quiz: {
				question: 'Height is in millimetres (std ≈ 90), weight in kilograms (std ≈ 12). Without scaling, where will PC1 point?',
				options: ['Almost straight along height', 'Almost straight along weight', 'Diagonally, since the two are correlated'],
				answer: 0,
				explain: () =>
					`PCA chases raw variance, and height in mm has about 56× the variance of weight in kg (90² vs 12²). PC1 is simply height. Switch to metres and PC1 flips to weight, though nothing about the people changed. Standardized, PC1 is the diagonal ${fmt(bodyFit('z').vectors[0][0])}·height + ${fmt(bodyFit('z').vectors[0][1])}·weight: a genuine "overall size" axis.`,
				reveal: (s) => {
					s.show.pc1 = true;
				}
			},
			task: {
				prompt: 'Try all three unit choices and watch PC1 jump.',
				done: (s) => s.did.units.length >= 3
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Switch datasets, aim the line, rotate the 3-D cloud and change how many components you keep. Recap:

1. **Center** each feature (and usually **standardize** it).
2. Compute the **covariance matrix**. Its eigenvectors are the principal directions; its eigenvalues are the variance along each.
3. Sort by eigenvalue and keep the top k (scree plot, or a target like 95% cumulative).
4. Project: **Z = X·W_k**. The reconstruction error equals the sum of the dropped eigenvalues.

PCA only finds **flat** (linear) structure. For curved manifolds and cluster maps see [t-SNE & UMAP](concept:tsne-umap); for a learned non-linear version see [autoencoders](concept:autoencoders).`,
			enter: (s) => {
				s.dataset = 'corr';
				s.centered = true;
				s.angle = 120;
				s.k = 2;
				s.units = 'z';
				s.view = faceOn();
				s.view.yaw += 0.6;
				s.show = { mean: true, proj: true, pc1: true, pc2: true, curve: true, scree: true, recon: true, shadow: true };
				s.ui = { angle: true, k: true, units: true, dataset: true, rotate: true, center: false };
			}
		}
	]
};

export default explainer;
