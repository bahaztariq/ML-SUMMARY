/**
 * Guided explainer: gradient boosting, stage by stage, plus a short look at AdaBoost.
 */
import type { ExplainerModule } from '../types.ts';
import { f2, f3, pct } from '../_ensembles/memo.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import * as gb from './gb.ts';
import {
	ADA_ROUNDS,
	DEFAULT_DEPTH,
	DEFAULT_LR,
	MAX_STAGES,
	adaAccuracy,
	adaRounds,
	bestStage,
	booster,
	hidden,
	init,
	nextTree,
	off,
	residuals,
	setStage,
	stagesTo,
	train,
	trainLoss,
	validLoss,
	type GBState
} from './state.ts';

const meanY = () => booster({ lr: DEFAULT_LR, depth: DEFAULT_DEPTH }).F0;

const explainer: ExplainerModule<GBState> = {
	title: 'How gradient boosting corrects its own mistakes',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Start with a constant guess',
			body: (s) => `Here are ${train().x.length} noisy measurements of some smooth curve, and we want to predict \`y\` from \`x\`.

Gradient boosting starts with the dullest model possible: **one constant** for every \`x\`. For squared error the best constant is the mean, **F₀ = ${f2(meanY())}**. Its training error (mean squared error) is **${f3(trainLoss(s)[0])}**.

Everything from here on is about improving this guess one small step at a time.`,
			enter: (s) => {
				s.view = 'boost';
				setStage(s, 0);
			}
		},
		{
			title: "Residuals: what's left to explain",
			body: (s) => {
				const r = residuals(s, s.stage);
				const big = r.reduce((a, v) => (Math.abs(v) > Math.abs(a) ? v : a), 0);
				return `The **residual** of each point is how far the model missed it: \`r = y − F(x)\`. The vertical lines on the plot are the residuals, and the lower panel plots them on their own. The biggest one is ${f2(big)}.

Why "gradient"? With squared loss \`L = ½(y − F)²\`, the derivative with respect to the prediction is \`∂L/∂F = −(y − F)\`. So the residual *is* the **negative gradient**: the direction each prediction should move to reduce the loss. For other losses (log-loss, Huber) the recipe is the same, with these *pseudo-residuals* in place of y − F.`;
			},
			enter: (s) => {
				s.show = { ...hidden, residuals: true, resPanel: true };
			}
		},
		{
			title: 'Fit a small tree to the residuals',
			body: (s) => {
				const t = nextTree(s, s.stage);
				const p = gb.pieces(t);
				return `Next, fit a **shallow regression tree** to the residuals, not to \`y\`. Here \`max_depth = ${s.depth}\`, so it can cut the x-axis into at most ${2 ** s.depth} pieces; this one uses **${p.length}**. Each split is chosen to reduce the squared error of the residuals as much as possible, the regression version of the [decision tree](concept:decision-tree)'s Gini search.

The tree (orange steps in the lower panel) is a crude sketch of where the model is too low (positive residuals) and too high (negative ones).`;
			},
			enter: (s) => {
				s.show.next = true;
			},
			quiz: {
				question: 'What value does each leaf of this tree output?',
				options: ['The average y of the points in the leaf', 'The average residual of the points in the leaf', 'The largest residual in the leaf'],
				answer: 1,
				explain: (s) => {
					const p = gb.pieces(nextTree(s, s.stage));
					return `It was trained on residuals, so each leaf predicts the **mean residual** of its points: ${p.map((q) => f2(q.w)).join(', ')}. That is the least-squares fix for that stretch of x. In general (for any loss), a leaf outputs the step that minimises the loss for its points.`;
				},
				reveal: (s) => {
					s.show.leafValues = true;
				}
			}
		},
		{
			title: 'Add it, shrunk by the learning rate',
			body: (s) => {
				const l = trainLoss(s);
				return `The new model is the old one plus the tree, scaled down by the **learning rate** η:

\`F₁(x) = F₀(x) + η · h₁(x)\`  with η = ${s.lr}

Then repeat: new residuals, new tree, add it. Stage **${s.stage}**: training MSE **${f3(l[s.stage])}** (from ${f3(l[0])}). Each tree only moves the curve ${Math.round(s.lr * 100)}% of the way it suggests, so no single tree can dominate.`;
			},
			enter: (s) => {
				s.show = { ...hidden, residuals: true, resPanel: true, next: true, loss: true };
				s.ui = { ...off, add: true };
				setStage(s, 1);
			},
			task: {
				prompt: 'Add trees until the ensemble has **20** stages. Watch the residuals shrink.',
				done: (s) => s.stage >= 20
			}
		},
		{
			title: 'Learning rate × number of trees',
			body: (s) => {
				const target = 0.3;
				return `η and the number of trees trade off against each other. To get the training MSE down to ${target}: η = 0.1 needs **${stagesTo({ lr: 0.1, depth: s.depth }, target)}** trees; the current η = ${s.lr} needs **${fmtStages(stagesTo(s, target))}**.

The dashed curve in the chart is η = 0.1 for reference.`;
			},
			enter: (s) => {
				s.show = { ...hidden, loss: true };
				s.ui = { ...off, lr: true, stage: true };
				s.lrRef = 0.1;
				setStage(s, 60);
			},
			quiz: {
				question: 'If we halve η from 0.1 to 0.05, how many trees do we need to reach the same training error?',
				options: ['The same number', 'About twice as many', 'About half as many'],
				answer: 1,
				explain: (s) =>
					`About **twice as many**: ${stagesTo({ lr: 0.1, depth: s.depth }, 0.3)} → ${stagesTo({ lr: 0.05, depth: s.depth }, 0.3)} trees to reach MSE 0.3. Each tree's step is half as big. In practice a smaller η with more trees usually generalises a little better, at the cost of training time. That's why the two are always tuned together.`,
				reveal: (s) => {
					s.lr = 0.05;
					setStage(s, 120);
				}
			}
		},
		{
			title: 'Too many stages overfit',
			body: (s) => {
				const v = validLoss(s);
				return `Unlike a [random forest](concept:random-forest), boosting **can** overfit by adding trees: every stage chases whatever residual is left, and eventually that is just noise.

The faint points are **${300} validation points** the model never trains on. Stage **${s.stage}**: train MSE ${f3(trainLoss(s)[s.stage])}, validation MSE **${f3(v[s.stage])}**.`;
			},
			enter: (s) => {
				s.lr = DEFAULT_LR;
				s.lrRef = 0;
				s.show = { ...hidden, loss: true, valid: true };
				s.ui = { ...off };
				setStage(s, 30);
			},
			quiz: {
				question: `What happens to the validation error if we keep going to ${MAX_STAGES} stages?`,
				options: ['It keeps falling, like the training error', 'It flattens out and stays put', 'It goes back up as the curve starts fitting the noise'],
				answer: 2,
				explain: (s) => {
					const v = validLoss(s);
					const b = bestStage(s);
					return `Training MSE heads to ${f3(trainLoss(s)[MAX_STAGES])}, but validation MSE bottoms out at **${f3(v[b])}** around stage ${b} and climbs to **${f3(v[MAX_STAGES])}** by stage ${MAX_STAGES}. The curve now bends to pass through individual noisy points: classic [overfitting](concept:overfitting-underfitting).`;
				},
				reveal: (s) => {
					setStage(s, MAX_STAGES);
				}
			}
		},
		{
			title: 'Early stopping',
			body: (s) => {
				const v = validLoss(s);
				const b = bestStage(s);
				return `The fix is to watch the validation error while training and **stop when it stops improving**. In scikit-learn: \`validation_fraction=0.1, n_iter_no_change=20\` holds out 10% of the training data and stops after 20 stages without improvement. XGBoost, LightGBM and CatBoost call it \`early_stopping_rounds\`.

Best validation MSE: **${f3(v[b])}** at stage **${b}**. Current stage ${s.stage}: ${f3(v[s.stage])}.`;
			},
			enter: (s) => {
				s.show = { ...hidden, loss: true, valid: true };
				s.ui = { ...off, stage: true };
				setStage(s, MAX_STAGES);
			},
			task: {
				prompt: 'Drag the **stages** slider (or click the chart) to the stage where validation error is lowest.',
				done: (s) => {
					const v = validLoss(s);
					return v[s.stage] <= v[bestStage(s)] * 1.02;
				}
			}
		},
		{
			title: 'AdaBoost: re-weight the misses',
			body: (s) => {
				const r = adaRounds();
				const cur = s.round > 0 ? r[s.round - 1] : null;
				const last = cur
					? `Round **${s.round}**: the stump's weighted error ε = ${f3(cur.err)}, so its say is α = ½·ln((1 − ε)/ε) = **${f2(cur.alpha)}**. The combined vote now classifies **${pct(adaAccuracy(s.round))}** of the points correctly.`
					: 'Press **Next round** to fit the first stump.';
				return `**AdaBoost**, the original boosting algorithm, gets the same "focus on what's still wrong" effect differently. Instead of fitting residuals, it trains each weak learner (here a one-split *stump*) on **re-weighted data**: after every round, misclassified points get heavier (bigger markers) and correct ones lighter, so the next stump concentrates on the hard cases. The final model is a weighted vote, each stump weighted by how accurate it was.

${last}

It turns out AdaBoost is gradient boosting with the *exponential loss*, which is also why noisy labels hurt it: a mislabelled point keeps getting heavier.`;
			},
			enter: (s) => {
				s.view = 'ada';
				s.round = 0;
				s.show = { ...hidden };
				s.ui = { ...off, ada: true };
			},
			task: {
				prompt: `Press **Next round** until the stumps classify every point correctly (or ${ADA_ROUNDS} rounds).`,
				done: (s) => adaAccuracy(s.round) === 1 || s.round >= ADA_ROUNDS
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap:

1. Start from a constant (the mean for squared error).
2. Compute residuals, the negative gradient of the loss.
3. Fit a shallow tree to them and add it, shrunk by η.
4. Repeat, and stop when validation error stops improving.

Try \`max_depth = 1\` (stumps: slow but smooth) against 4 (fast but quick to overfit), or a large η. Modern libraries build on exactly this loop: [XGBoost](concept:xgboost) adds regularisation and second-order steps, [LightGBM](concept:lightgbm) makes it fast on big data, and [CatBoost](concept:catboost) handles categorical features safely.`,
			enter: (s) => {
				s.view = 'boost';
				s.lr = DEFAULT_LR;
				s.depth = DEFAULT_DEPTH;
				s.lrRef = 0;
				s.show = { ...hidden, residuals: true, resPanel: true, next: true, loss: true, valid: true };
				s.ui = { add: true, stage: true, lr: true, depth: true, valid: true, stop: true, ada: false };
				setStage(s, 40);
			}
		}
	]
};

function fmtStages(n: number) {
	return Number.isFinite(n) ? String(n) : `more than ${MAX_STAGES}`;
}

export default explainer;
