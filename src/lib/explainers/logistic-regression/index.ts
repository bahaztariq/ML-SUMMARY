/**
 * Guided explainer: logistic regression, from a linear score to a trained probabilistic classifier.
 */
import type { ExplainerModule } from '../types.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import * as lr from './logistic.ts';
import {
	HAND,
	LR,
	START,
	accuracyOf,
	best,
	confusionOf,
	converged,
	data,
	init,
	lossOf,
	model,
	off,
	probeOnLine,
	resetTraining,
	setC,
	setModel,
	worstPoint,
	type LogState
} from './state.ts';

const f2 = (v: number) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);
const sgn = (v: number) => (v < 0 ? `− ${f2(-v)}` : `+ ${f2(v)}`);
const pct = (v: number) => `${Math.round(v * 100)}%`;
const eq = (s: LogState) => `z = ${f2(s.model.w[0])}·x₁ ${sgn(s.model.w[1])}·x₂ ${sgn(s.model.b)}`;
const z = (s: LogState) => lr.score(model(s), s.probe);
const norm = (s: LogState) => Math.hypot(s.model.w[0], s.model.w[1]);
/** Accuracy the learner must reach with the weight sliders. */
const TARGET = 0.8;

const explainer: ExplainerModule<LogState> = {
	title: 'How logistic regression turns a line into probabilities',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'A score from a straight line',
			body: (s) => `Here are **${data(s).X.length} points** with two features, \`x₁\` and \`x₂\`, from two classes: **A** (circles) and **B** (squares). We want a model that says how likely a new point is to be **B**.

Logistic regression starts like [linear regression](concept:linear-regression): it computes a **score** that is a weighted sum of the features:

\`${eq(s)}\`

The solid line is where **z = 0**. On the side the arrow \`w\` points to, z is positive (leaning B); on the other side it is negative (leaning A). The ◆ probe at (${f2(s.probe[0])}, ${f2(s.probe[1])}) has **z = ${f2(z(s))}**.`,
			enter: (s) => {
				s.show.normal = true;
				s.show.sides = true;
				s.show.probe = true;
				s.ui.probe = true;
			},
			task: {
				prompt: 'Drag the ◆ probe across the line and watch the sign of **z** flip.',
				done: (s) => s.did.flip
			}
		},
		{
			title: 'Squashing the score: the sigmoid',
			body: (s) => {
				const zz = z(s);
				return `A score can be any number, but a probability must sit between 0 and 1. The **sigmoid** function does the squashing:

\`p = σ(z) = 1 / (1 + e^−z)\`

Large positive z gives p close to 1, large negative z gives p close to 0. The chart below places every training point on the curve by its score. B squares should end up high, A circles low.

The probe has z = ${f2(zz)}, so **P(B) = σ(${f2(zz)}) = ${f2(lr.sigmoid(zz))}**.`;
			},
			enter: (s) => {
				s.show.sigmoid = true;
			},
			quiz: {
				question: 'What probability does a point lying exactly on the line get?',
				options: ['0', '0.5', '1', 'It depends on the weights'],
				answer: 1,
				explain: `On the line z = 0, and σ(0) = 1 / (1 + e⁰) = 1/2, whatever the weights are. That's why this line is called the **decision boundary**: it's where the model is exactly undecided. The probe now sits on it.`,
				reveal: (s) => probeOnLine(s)
			}
		},
		{
			title: 'A probability for every spot on the plane',
			body: (s) => `The shading now shows P(B) everywhere: stronger color, more confident. The solid line is **p = 0.5**; the dashed lines are p = 0.1, 0.25, 0.75 and 0.9.

They are all **parallel straight lines**. p depends only on z, and z stays the same along any line parallel to the boundary. So the model's confidence grows with the distance from the boundary, and only that.

The probe is at P(B) = **${f2(lr.sigmoid(z(s)))}**. With this line, ${pct(accuracyOf(s))} of the training points land on the correct side.`,
			enter: (s) => {
				s.show.sides = false;
				s.show.regions = true;
				s.show.contours = true;
			}
		},
		{
			title: 'Weights rotate, the bias shifts',
			body: (s) => `Now you're the training algorithm. Three numbers define the model:

- **w₁, w₂** set the line's angle: the line is always perpendicular to the arrow \`w = (w₁, w₂)\`.
- **b** slides the line without turning it.
- The **length** ‖w‖ = ${f2(norm(s))} sets how steep the sigmoid is. Bigger weights squeeze the dashed lines together, so the model becomes more confident.

\`${eq(s)}\`. Accuracy: **${pct(accuracyOf(s))}**.`,
			enter: (s) => {
				setModel(s, START);
				s.show.probe = false;
				s.ui.probe = false;
				s.ui.weights = true;
			},
			task: {
				prompt: `Use the sliders to get at least **${pct(TARGET)}** of the points on the correct side.`,
				done: (s) => s.did.weights && accuracyOf(s) >= TARGET
			}
		},
		{
			title: 'Scoring a fit: log-loss',
			body: (s) => `Accuracy only counts right and wrong. To train, we need a score that also cares about **confidence**. Logistic regression uses [log-loss](concept:log-loss): each point costs **−log(probability the model gave to its true class)**.

\`loss = −[ y·log p + (1 − y)·log(1 − p) ]\`

A B point with p = 0.9 costs 0.11; one with p = 0.5 costs 0.69. The training objective is the average over all points. For this line it is **${f2(lossOf(s))}**.`,
			enter: (s) => {
				setModel(s, HAND);
				s.show.normal = false;
				s.ui.weights = false;
			},
			quiz: {
				question: 'A class-B point gets p(B) = 0.02. Compared with a B point at p(B) = 0.9, how much does it add to the log-loss?',
				options: ['About the same: each point counts once', 'About 2× as much', 'About 37× as much'],
				answer: 2,
				explain: (s) => {
					const w = worstPoint(s);
					return `−ln 0.02 ≈ 3.9, while −ln 0.9 ≈ 0.105. Log-loss punishes **confident mistakes** very hard, and the cost has no upper limit as p → 0. The rings now show each point's loss. The worst point gets only p = ${f2(w.p)} for its true class and costs **${f2(w.loss)}**, ${pct(w.loss / (lossOf(s) * data(s).X.length))} of the total on its own.`;
				},
				reveal: (s) => {
					s.show.rings = true;
				}
			}
		},
		{
			title: 'Training: gradient descent on log-loss',
			body: (s) => {
				const state = converged(s)
					? `**Converged after ${s.iter} steps**: log-loss ${f2(lossOf(s))}, accuracy ${pct(accuracyOf(s))}.`
					: s.iter
						? `Step **${s.iter}**: log-loss **${f2(lossOf(s))}**.`
						: `We start from a poor line, log-loss **${f2(lossOf(s))}**.`;
				return `Log-loss has a remarkably simple gradient. Each point pulls on the weights by its **error** \`p − y\`:

\`∂L/∂w = mean((p − y)·x)\`, \`∂L/∂b = mean(p − y)\`

[Gradient descent](concept:what-is-gradient-descent) repeats \`w ← w − η·∂L/∂w\` (here η = ${LR}). The loss is convex (bowl-shaped), so there is one best line and descent finds it.

${state}`;
			},
			enter: (s) => {
				s.show.rings = false;
				s.show.loss = true;
				s.ui.train = true;
				resetTraining(s, START);
			},
			task: {
				prompt: 'Press **Run** (or **Step** a few times) and watch the line swing into place as the loss falls.',
				done: (s) => converged(s)
			}
		},
		{
			title: 'The threshold is not the boundary',
			body: (s) => {
				const c = confusionOf(s);
				return `The model outputs a probability. To get a yes/no answer you pick a **threshold** t: predict B when p ≥ t. That is the same as z ≥ ln(t / (1 − t)) = **${f2(lr.logit(s.threshold))}**, so moving t slides the decision line parallel to itself. The **weights don't change**; only the rule that reads the probabilities does.

At t = ${f2(s.threshold)}: **${c.tp}** B caught, **${c.fn}** B missed, **${c.fp}** false alarms, **${c.tn}** A correctly cleared. This trade-off is what [precision and recall](concept:precision-recall-f1) and the [ROC curve](concept:roc-auc) measure.`;
			},
			enter: (s) => {
				s.ui = { ...off, threshold: true };
				s.show.loss = false;
				s.show.confusion = true;
				setModel(s, best(s.dataset, s.C));
			},
			task: {
				prompt: 'Say class B is a disease, so a missed B is costly. Lower the threshold until **no B point is missed**. How many false alarms does that cost?',
				done: (s) => confusionOf(s).fn === 0
			}
		},
		{
			title: 'Regularization: the C knob',
			body: (s) => `So far training only minimized log-loss. Real implementations add a penalty on large weights. scikit-learn minimizes

\`C · Σ log-loss + ½‖w‖²\`

**C** is the *inverse* strength of the [regularization](concept:regularization-l1-l2): small C means a strong penalty and small weights. Large C trusts the data more; on perfectly separable data, C → ∞ lets the weights grow without limit.

C = **${s.C}** gives ‖w‖ = **${f2(norm(s))}**, accuracy ${pct(accuracyOf(s))}, log-loss ${f2(lossOf(s))}.`,
			enter: (s) => {
				s.ui = { ...off, C: true };
				s.show.confusion = false;
				s.threshold = 0.5;
				setC(s, 1);
			},
			quiz: {
				question: 'Drop C from 1 to 0.01. What happens to the model?',
				options: [
					'The boundary swings to a very different angle',
					'Predictions flatten toward 50%: the dashed lines spread far apart',
					'Accuracy collapses to about 50%'
				],
				answer: 1,
				explain: (s) =>
					`At C = 0.01 the weights shrink to ‖w‖ = ${f2(norm(s))}, so every score is near 0 and every probability is near 0.5. The boundary barely moves and accuracy is still ${pct(accuracyOf(s))}, but the probabilities are now far too timid. C controls **confidence** first, and you tune it with [cross-validation](concept:cross-validation).`,
				reveal: (s) => setC(s, 0.01)
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Try **Moons**: a straight line can't follow the curve. For that you need [an SVM with a kernel](concept:svm) or [k-NN](concept:knn).

Recap:

1. Score: \`z = w·x + b\`, a straight line where z = 0.
2. Probability: \`p = σ(z)\`, confident far from the line, 50/50 on it.
3. Training: minimize average **log-loss** by gradient descent. Each point pulls with its error p − y.
4. Decide: predict B when p ≥ t. The threshold trades misses for false alarms without retraining.
5. Regularize: small C shrinks the weights and flattens the probabilities.

[Scale your features](concept:feature-scaling) first: the penalty and gradient descent both treat every weight alike.`,
			enter: (s) => {
				s.ui = { probe: true, weights: true, train: true, threshold: true, C: true, dataset: true };
				s.show = { probe: true, line: true, normal: true, sides: false, sigmoid: true, regions: true, contours: true, rings: false, loss: true, confusion: true };
				setC(s, 1);
				s.threshold = 0.5;
				s.probe = [0.3, -0.5];
			}
		}
	]
};

export default explainer;
