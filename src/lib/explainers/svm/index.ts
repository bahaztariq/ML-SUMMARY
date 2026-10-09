/**
 * Guided explainer: support vector machines — maximum margin, support vectors, soft margin, kernels.
 */
import type { ExplainerModule } from '../types.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import { marginWidth } from './svm.ts';
import {
	CANDIDATES,
	DATA,
	fit,
	init,
	lineMargin,
	off,
	roleCounts,
	setC,
	setData,
	setGamma,
	testAcc,
	trainAcc,
	type SvmState
} from './state.ts';

const f3 = (v: number) => v.toFixed(3);
const pct = (v: number) => `${Math.round(v * 100)}%`;
const width = (s: SvmState) => marginWidth(fit(s));
const nsv = (s: SvmState) => fit(s).sv.length;
const at = (s: SvmState, C: number) => fit({ ...s, C } as SvmState);
const TEST_TARGET = 0.95;

const explainer: ExplainerModule<SvmState> = {
	title: 'How a support vector machine draws the widest street',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Many lines, zero mistakes',
			body: (s) => `These ${s.points.length} points, class **A** (circles) and class **B** (squares), can be separated by a straight line. In fact by infinitely many.

All three lines drawn here classify every training point correctly. A model that only counts training errors can't tell them apart.`,
			enter: (s) => {
				s.show.candidates = true;
			},
			quiz: {
				question: 'Which line would you trust most on new points?',
				options: ['Line 1', 'Line 2', 'Line 3', 'Any of them: all three make zero training errors'],
				answer: 1,
				explain: () => {
					const m = CANDIDATES.map((l) => f3(lineMargin(l, DATA.separable)));
					return `Line 2 leaves the most room: its nearest point is **${m[1]}** away, against ${m[0]} for line 1 and ${m[2]} for line 3. A new point that strays a little from its class's cloud is less likely to end up on the wrong side. That room is the **margin**, and an SVM picks the line that makes it as large as possible.`;
				},
				reveal: (s) => {
					s.show.candidateMargins = true;
				}
			}
		},
		{
			title: 'The widest street',
			body: (s) => `An SVM looks for the **widest street** that separates the classes. The boundary \`f(x) = w·x + b = 0\` runs down the middle. The two edges are where f(x) = +1 and f(x) = −1.

The street's width is \`2 / ‖w‖\` = **${f3(width(s))}**, so making it wide means making ‖w‖ small. Training solves:

\`minimize ½‖w‖²  subject to  yᵢ·f(xᵢ) ≥ 1 for every point\`

(yᵢ = +1 for B, −1 for A). The ringed points touch the edges. They are the **support vectors**: just **${nsv(s)}** of ${s.points.length} points.`,
			enter: (s) => {
				s.show.candidates = false;
				s.show.candidateMargins = false;
				s.show.model = true;
				s.show.street = true;
				s.show.sv = true;
			}
		},
		{
			title: 'Only the support vectors matter',
			body: (s) => `The solution is a weighted sum of training points, \`w = Σ αᵢyᵢxᵢ\`, and the weight αᵢ is **zero for every point that isn't a support vector**.

So you can move any other point anywhere outside the street and the boundary won't move. Move a support vector, or push any point into the street, and the street is re-solved around the new closest points. Compare [logistic regression](concept:logistic-regression), where every point pulls on the line.

Support vectors: **${nsv(s)}**, width **${f3(width(s))}**.`,
			enter: (s) => {
				s.ui.drag = true;
				s.ui.reset = true;
			},
			task: {
				prompt: 'Drag a point that **isn\'t** ringed (keep it out of the street) and see that nothing moves. Then drag a **ringed** support vector.',
				done: (s) => s.did.dragOther && s.did.dragSV
			}
		},
		{
			title: 'Overlap: the soft margin',
			body: (s) => {
				const r = roleCounts(s);
				return `Real classes overlap, so no street can stay empty. The **soft margin** lets points break the rule, at a price. A point's violation is its **hinge loss**:

\`ξᵢ = max(0, 1 − yᵢ·f(xᵢ))\`

It is 0 outside the street, between 0 and 1 inside it, and above 1 on the wrong side (the dashed lines show it). The SVM now minimizes

\`½‖w‖² + C·Σ ξᵢ\`

With C = ${s.C}: **${r.inside}** points inside the street, **${r.wrong}** on the wrong side, width ${f3(width(s))}. Every violator becomes a support vector too (dashed rings): **${nsv(s)}** in total.`;
			},
			enter: (s) => {
				s.ui = { ...off };
				setData(s, 'overlap');
				setC(s, 1);
				s.show.slack = true;
			},
			quiz: {
				question: 'Raise C from 1 to 100. What happens to the street?',
				options: [
					'It gets wider and holds more points',
					'It gets narrower: each violation now costs more',
					'Nothing: C only matters when the classes don’t overlap'
				],
				answer: 1,
				explain: (s) => {
					const a = at(s, 1);
					return `With C = 100, each unit of slack costs 100× more, so the SVM narrows the street to push points out of it: width ${f3(marginWidth(a))} → **${f3(width(s))}**, support vectors ${a.sv.length} → **${nsv(s)}**. Large C fits the training data harder. Small C prefers a wide, calm street and tolerates violations, which is stronger [regularization](concept:regularization-l1-l2).`;
				},
				reveal: (s) => setC(s, 100)
			}
		},
		{
			title: 'Tuning C',
			body: (s) => {
				const r = roleCounts(s);
				return `C is the knob between a **wide street with many violations** (small C, many support vectors) and a **narrow street that bends to every point** (large C, few support vectors).

C = **${s.C}**: width ${f3(width(s))}, ${nsv(s)} support vectors, ${r.inside + r.wrong} violations. Training accuracy ${pct(trainAcc(s))}, accuracy on 200 new points **${pct(testAcc(s))}**.

Notice that training accuracy barely tells you which C is best. You pick C with [cross-validation](concept:cross-validation).`;
			},
			enter: (s) => {
				setC(s, 1);
				s.did.cLow = false;
				s.did.cHigh = false;
				s.ui.C = true;
			},
			task: {
				prompt: 'Slide C all the way down and all the way up, and watch the street and the ring count.',
				done: (s) => s.did.cLow && s.did.cHigh
			}
		},
		{
			title: 'When no straight line will do',
			body: (s) => `Here class B sits in the middle and class A surrounds it. The best straight line gets only **${pct(trainAcc(s))}** right.

One fix is to **add a feature**. With \`x₃ = x₁² + x₂²\` (squared distance from the center), B points have small x₃ and A points large x₃, so a single threshold on x₃ separates them (strip below).

In 3-D, with axes (x₁, x₂, x₃), that threshold is a flat plane: a linear separator. Projected back onto the original 2-D plot, it becomes a circle.`,
			enter: (s) => {
				s.ui = { ...off };
				s.show.slack = false;
				setData(s, 'circles');
				setC(s, 1);
				s.show.lift = true;
				s.show.street = false;
				s.show.sv = false;
			}
		},
		{
			title: 'The kernel trick',
			body: (s) => `Inventing features by hand doesn't scale. But the SVM's training problem only uses the points through **inner products** \`xᵢ·xⱼ\`. Replace them with a **kernel** \`K(xᵢ, xⱼ)\` and you get a linear SVM in a richer feature space without ever computing those features.

The **RBF kernel** \`K(x, x′) = exp(−γ‖x − x′‖²)\` scores similarity: 1 for identical points, falling to 0 with distance. Its feature space is infinite-dimensional. The decision function becomes a sum of bumps centered on the support vectors:

\`f(x) = Σ αᵢyᵢ·K(xᵢ, x) + b\`

RBF with γ = ${s.gamma}: **${pct(trainAcc(s))}** correct using **${nsv(s)}** support vectors.`,
			enter: (s) => {
				s.show.lift = false;
				s.show.street = true;
				s.show.sv = true;
				s.show.regions = true;
				s.kernel = 'rbf';
				setGamma(s, 1);
				s.ui.kernel = true;
				s.ui.drag = true;
				s.ui.reset = true;
			}
		},
		{
			title: 'γ: how far each point reaches',
			body: (s) => `**γ** sets the width of each bump. With a small γ every support vector influences a wide area and the boundary is smooth, almost straight. With a large γ the bumps are tiny and the boundary wraps around individual points, islands included.

That's [overfitting](concept:overfitting-underfitting): perfect on training points, worse on new ones. These moons are noisy, so the two classes mix where they meet.

γ = **${s.gamma}**, C = ${s.C}: training accuracy **${pct(trainAcc(s))}**, accuracy on 400 new points **${pct(testAcc(s))}**, ${nsv(s)} support vectors.`,
			enter: (s) => {
				s.ui = { ...off, gamma: true, view: true };
				setData(s, 'moons');
				setC(s, 10);
				setGamma(s, 1);
			},
			task: {
				prompt: `Push γ to the maximum and look for islands. Then find a γ that gets at least **${pct(TEST_TARGET)}** on new points.`,
				done: (s) => s.did.gammaHigh && testAcc(s) >= TEST_TARGET
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked: drag points, switch kernels and datasets, tune C and γ.

Recap:

1. An SVM picks the boundary with the **widest margin**, \`2/‖w‖\`.
2. Only the **support vectors** define it; every other point has α = 0.
3. **C** trades a wide street against margin violations (hinge loss).
4. **Kernels** give curved boundaries without computing new features. RBF's **γ** sets each point's reach: too large overfits.
5. [Scale your features](concept:feature-scaling) first, since margins are distances, and tune C and γ together with [cross-validation](concept:cross-validation).

Training time grows quickly with the number of points, and SVMs don't output probabilities by default. [Logistic regression](concept:logistic-regression) does.`,
			enter: (s) => {
				s.ui = { drag: true, C: true, gamma: true, kernel: true, dataset: true, reset: true, view: true };
				s.show = { candidates: false, candidateMargins: false, model: true, street: true, sv: true, slack: true, lift: false, regions: true, test: false };
				setData(s, 'moons');
				s.kernel = 'rbf';
				setC(s, 1);
				setGamma(s, 3);
			}
		}
	]
};

export default explainer;
