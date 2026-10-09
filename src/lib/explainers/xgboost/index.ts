/**
 * Guided explainer: what XGBoost adds on top of plain gradient boosting.
 */
import type { ExplainerModule } from '../types.ts';
import { f2, f3, sgn } from '../_ensembles/memo.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import { FEATURES } from './xgb.ts';
import {
	HISTORY,
	N_TRAIN,
	P,
	bestRoot,
	bestRound,
	gbmWeight,
	hidden,
	init,
	missingRows,
	off,
	roundTree,
	sampleOf,
	sampleSplits,
	split,
	totals,
	train,
	validLoss,
	type XGBState
} from './state.ts';
import { leafWeight, leaves } from '../_ensembles/boost.ts';

const TARGET = 0.48;

const explainer: ExplainerModule<XGBState> = {
	title: 'What XGBoost adds to gradient boosting',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Same recipe, sharper math',
			body: () => {
				const pos = train().y.filter((v) => v).length;
				return `XGBoost is [gradient boosting](concept:gradient-boosting): trees added one at a time, each correcting the ensemble so far. What it adds is a **regularised objective**, **second-order (Newton) steps**, **row and column sampling**, and **built-in handling of missing values**, plus a lot of engineering for speed.

Our task: predict a yes/no label (squares = 1, circles = 0) from \`x₁\`, using **log-loss**. ${N_TRAIN} training rows, ${pos} positives. ${missingRows().length} rows have no \`x₁\` at all (the *missing* strip on the left). The curve is the model's probability after ${HISTORY} rounds. We'll watch XGBoost build round ${HISTORY + 1}.`;
			},
			enter: (s) => {
				s.mode = 'round';
			}
		},
		{
			title: 'Gradients and hessians',
			body: (s) => {
				const t = totals();
				let pick = '';
				if (s.picked >= 0) {
					const p = P()[s.picked];
					const y = train().y[s.picked];
					pick = `\n\nPicked row: label ${y}, p = ${f3(p)}, so g = ${f3(p)} − ${y} = **${sgn(p - y, 3)}** and h = ${f3(p)}·${f3(1 - p)} = **${f3(p * (1 - p))}**.`;
				}
				return `For every row, XGBoost takes the first **and second** derivative of the loss with respect to the current prediction (in log-odds). For log-loss they're simple:

- gradient \`g = p − y\`: the vertical gap between the curve and the label (the stems)
- hessian \`h = p·(1 − p)\`: the loss's curvature, largest when the model is unsure (p near 0.5), small when it's confident (marker size)

Summed over all rows: G = ${f2(t.G)}, H = ${f2(t.H)}. A tree is built from nothing but these two numbers per row.${pick}`;
			},
			enter: (s) => {
				s.show = { ...hidden, grad: true, hess: true };
				s.ui = { ...off, pick: true };
			},
			task: {
				prompt: 'Click a point to see its g and h. Compare one near p ≈ 0.5 with one the model is confident about.',
				done: (s) => s.did.pick
			}
		},
		{
			title: 'Leaf weights are Newton steps',
			body: (s) => {
				const c = split(s);
				const wl = leafWeight(c.GL, c.HL, s.lambda);
				const wr = leafWeight(c.GR, c.HR, s.lambda);
				return `Take a candidate split, \`x₁ ≤ ${s.thr.toFixed(2)}\`. Each leaf's output (its **weight**, in log-odds) has a closed form:

\`w = −G / (H + λ)\`

where G and H are the sums of g and h over the leaf's rows. This is one **Newton step** on the loss, rather than plain gradient boosting's gradient step (the mean pseudo-residual, −G/n). λ (\`reg_lambda\`, default 1) is an **L2 penalty** on leaf weights.

Now (λ = ${s.lambda}): left w = −(${f2(c.GL)})/(${f2(c.HL)} + ${s.lambda}) = **${sgn(wl)}**, right w = **${sgn(wr)}**. Plain GBM would use ${sgn(gbmWeight(c.GL, c.nL))} and ${sgn(gbmWeight(c.GR, c.nR))}.`;
			},
			enter: (s) => {
				s.show = { ...hidden, grad: true, split: true, weights: true };
				s.ui = { ...off, lambda: true };
				s.lambda = 1;
			},
			quiz: {
				question: 'What happens to the leaf weights if we raise λ from 1 to 10?',
				options: ['They grow: stronger regularisation means bolder steps', 'They shrink towards 0, small leaves the most', 'Nothing: λ only matters for choosing splits'],
				answer: 1,
				explain: (s) => {
					const c = split(s);
					return `λ is added to H in the denominator, so every weight shrinks towards 0: now **${sgn(leafWeight(c.GL, c.HL, 10))}** and **${sgn(leafWeight(c.GR, c.HR, 10))}**. A leaf with few rows has a small H, so λ dominates and pulls it hardest. That's exactly what we want: leaves backed by little data shouldn't make big claims. (\`reg_alpha\` adds an L1 penalty that can push small weights to exactly 0.)`;
				},
				reveal: (s) => {
					s.lambda = 10;
				}
			}
		},
		{
			title: 'Scoring a split: the gain formula',
			body: (s) => {
				const c = split(s);
				return `Plugging the optimal weights back into the loss gives each node a **score** G²/(H + λ). A split's **gain** is how much the children improve on the parent:

\`gain = ½ [ G_L²/(H_L+λ) + G_R²/(H_R+λ) − G²/(H+λ) ] − γ\`

The panel computes it live for **x₁ ≤ ${s.thr.toFixed(2)}**: gain = **${f3(c.gain - s.gamma)}**. The chart below runs the same formula over every threshold, which is exactly how XGBoost searches (its default \`tree_method="hist"\` only tries histogram bin edges, to go faster).`;
			},
			enter: (s) => {
				s.lambda = 1;
				s.gamma = 0;
				s.show = { ...hidden, grad: true, split: true, weights: true, formula: true, curve: true };
				s.ui = { ...off, drag: true, lambda: true };
			},
			task: {
				prompt: 'Drag the split line to a threshold whose gain is within 5% of the best one.',
				done: (s) => split(s).gain >= 0.95 * bestRoot(s).gain
			}
		},
		{
			title: 'γ: every split must pay its way',
			body: (s) => {
				const t = roundTree(s);
				const n = leaves(t).length;
				return `γ (\`gamma\` or \`min_split_loss\`, default 0) is a fixed price per leaf. XGBoost grows the tree to \`max_depth\`, then **prunes bottom-up** every split whose gain doesn't exceed γ. So a weak split survives only if a strong split below it makes the branch worth keeping.

Here is the whole tree for round ${HISTORY + 1} at \`max_depth = 3\` (bands along the bottom, with each leaf's weight). At γ = **${s.gamma.toFixed(2)}** it keeps **${n} leaf${n === 1 ? '' : 'ves'}**.`;
			},
			enter: (s) => {
				s.lambda = 1;
				s.gamma = 0;
				s.treeDepth = 3;
				s.show = { ...hidden, tree: true };
				s.ui = { ...off, gamma: true, lambda: true };
			},
			task: {
				prompt: "Raise **γ** until the tree is pruned to a single leaf. That γ is the root split's gain.",
				done: (s) => leaves(roundTree(s)).length === 1
			}
		},
		{
			title: 'Missing values pick a side',
			body: (s) => {
				const miss = missingRows();
				const pos = miss.filter((i) => train().y[i]).length;
				return `XGBoost doesn't need missing values filled in. At every split it tries sending **all** rows with a missing value left, then right, scores both with the gain formula, and remembers the better one as that node's **default direction**. At prediction time, missing values follow it.

Here ${miss.length} rows have no x₁, and ${pos} of them are positive. The split is set to the best root split, **x₁ ≤ ${s.thr.toFixed(2)}**.`;
			},
			enter: (s) => {
				s.lambda = 1;
				s.gamma = 0;
				s.treeDepth = 1;
				s.thr = Math.round(bestRoot(s).thr * 20) / 20;
				s.show = { ...hidden, grad: true, split: true, weights: true, formula: true };
				s.ui = { ...off };
			},
			quiz: {
				question: 'The missing-x₁ rows are mostly positive. Where will XGBoost send them at this split?',
				options: ['Always left: missing values are treated as very small numbers', 'To whichever side gives the higher gain', 'Nowhere: rows with missing values are dropped'],
				answer: 1,
				explain: (s) => {
					const c = split(s);
					return `Missing → left scores ${f3(c.gainMissLeft)}; missing → right scores **${f3(c.gainMissRight)}**. So the default direction is **${c.missLeft ? 'left' : 'right'}**, where the other positives are. The rows' missingness itself turned out to be informative, and the tree used it without any imputation.`;
				},
				reveal: (s) => {
					s.show.missing = true;
				}
			}
		},
		{
			title: 'Row and column subsampling',
			body: (s) => {
				const { rows, cols } = sampleOf(s);
				const sp = sampleSplits(s);
				const best = sp.reduce<number>((a, c, f) => (c && (a < 0 || c.gain > sp[a]!.gain) ? f : a), -1);
				return `Two knobs borrowed from [random forests](concept:random-forest) make each tree see a little less, so trees are less alike and less prone to fit noise:

- \`subsample\`: each tree trains on a random fraction of the rows (drawn without replacement)
- \`colsample_bytree\`: each tree may only use a random fraction of the columns (also \`colsample_bylevel\`, \`colsample_bynode\`)

Our data actually has three features: x₁, a noisy proxy x₂ and pure noise x₃. Tree ${s.sampleTree + 1} sees **${rows.length}** rows and may use **${cols.map((f) => FEATURES[f]).join(', ')}**, so its root splits on **${best >= 0 ? FEATURES[best] : '—'}**.`;
			},
			enter: (s) => {
				s.lambda = 1;
				s.subsample = 0.7;
				s.colsample = 2;
				s.sampleTree = 0;
				s.show = { ...hidden, sample: true };
				s.ui = { ...off, subsample: true, colsample: true, resample: true };
			},
			task: {
				prompt: "Press **Next tree's sample** until you get a tree that isn't allowed to use x₁. What does it split on instead?",
				done: (s) => s.did.resample > 0 && !sampleOf(s).cols.includes(0)
			}
		},
		{
			title: 'Regularisation against overfitting',
			body: (s) => {
				const start = { lr: 0.3, maxDepth: 4, lambda: 0, gamma: 0, subsample: 1 };
				const v0 = validLoss(start);
				const b0 = bestRound(start);
				const v = validLoss(s);
				const b = bestRound(s);
				return `Now the whole booster: ${s.rounds} rounds on x₁. With \`max_depth = 4\`, η = 0.3 and no regularisation (λ = γ = 0), validation log-loss bottoms out at round ${b0} (${f3(v0[b0])}) and then climbs to ${f3(v0[s.rounds])} as the curve chases noise.

λ shrinks leaf weights, γ prunes weak splits, a smaller \`max_depth\` or η slows the fit. With early stopping (\`early_stopping_rounds\`) you'd also keep only the best round.

Current settings: validation log-loss **${f3(v[s.rounds])}** after ${s.rounds} rounds (best ${f3(v[b])} at round ${b}).`;
			},
			enter: (s) => {
				s.mode = 'full';
				s.rounds = 100;
				s.lr = 0.3;
				s.maxDepth = 4;
				s.lambda = 0;
				s.gamma = 0;
				s.subsample = 1;
				s.show = { ...hidden, loss: true };
				s.ui = { ...off, lambda: true, gamma: true, depth: true, lr: true };
			},
			task: {
				prompt: `Using λ, γ, max_depth or η (rounds stay at 100), get the validation log-loss at round 100 down to **${TARGET}** or less.`,
				done: (s) => validLoss(s)[s.rounds] <= TARGET
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap of what XGBoost adds to gradient boosting:

1. Second-order steps: leaf weight \`w = −G/(H + λ)\` from gradients *and* hessians.
2. A regularised objective: λ shrinks weights, γ prices every leaf, both inside the gain formula.
3. Row and column subsampling for more diverse trees.
4. A learned default direction for missing values.

Under the hood it also bins features into histograms and builds trees in parallel. [LightGBM](concept:lightgbm) pushes the histogram idea further and grows trees leaf-wise; [CatBoost](concept:catboost) focuses on categorical features. Tune η, depth and the regularisation together ([hyperparameter tuning](concept:hyperparameter-tuning)), with early stopping on a validation set.`,
			enter: (s) => {
				s.mode = 'full';
				s.rounds = 40;
				s.lr = 0.3;
				s.maxDepth = 3;
				s.lambda = 1;
				s.gamma = 0;
				s.subsample = 1;
				s.show = { ...hidden, loss: true };
				s.ui = { ...off, rounds: true, lambda: true, gamma: true, depth: true, lr: true, subsample: true };
			}
		}
	]
};

export default explainer;
