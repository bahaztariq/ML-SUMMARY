/**
 * Guided explainer: the tricks that make LightGBM fast, and the overfitting knob that comes with them.
 */
import type { ExplainerModule } from '../types.ts';
import { f2, f3, pct } from '../_ensembles/memo.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import { totalGain } from './lgb.ts';
import {
	BIG_N,
	GOSS_DRAWS,
	MAX_ROUNDS,
	N_TRAIN,
	UNLIMITED,
	bestBinned,
	bestExact,
	binned,
	featName,
	firstTree,
	gossSample,
	hidden,
	init,
	leafCurve,
	off,
	samplerStats,
	scanOf,
	treeDepth,
	validLoss,
	type LGBState
} from './state.ts';

const TARGET = 0.4;

const explainer: ExplainerModule<LGBState> = {
	title: 'What makes LightGBM fast',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Boosting, built for big data',
			body: `LightGBM runs the same loop as any [gradient boosting](concept:gradient-boosting) library: compute each row's gradient and hessian, fit a tree to them, add it shrunk by the learning rate, repeat.

The expensive part is **finding splits**. The exact way sorts every feature and tries a threshold between every pair of neighbouring values. Here that's ${N_TRAIN - 1} candidates per feature per node, which is nothing. At 10 million rows × 200 features, it's the whole training bill.

LightGBM's answer: **histogram binning**, **leaf-wise growth**, **GOSS** (sampling rows by gradient) and **EFB** (bundling sparse features). We'll look at the first three on this two-class dataset.`,
			enter: (s) => {
				s.mode = 'data';
			}
		},
		{
			title: 'Histogram binning',
			body: (s) => {
				const e = binned(s.maxBin).edges;
				return `Before training starts, LightGBM buckets every feature into at most \`max_bin\` bins (default **255**), with edges placed so each bin holds roughly the same number of rows. From then on, a split can only fall on a **bin edge**, and each row is stored as a small bin number instead of a float.

With \`max_bin = ${s.maxBin}\`: x₁ has **${e[0].length}** candidate thresholds and x₂ **${e[1].length}** (grey lines), instead of ${N_TRAIN - 1} each.`;
			},
			enter: (s) => {
				s.mode = 'data';
				s.maxBin = 16;
				s.show = { ...hidden, edges: true };
				s.ui = { ...off, bins: true };
			},
			quiz: {
				question: 'With only 16 bins per feature, how good is the best first split compared with the exact search?',
				options: ['Much worse: most of the gain is lost', 'Close: within a few percent of the exact best split', 'Always exactly the same'],
				answer: 1,
				explain: (s) => {
					const bb = bestBinned(s.maxBin);
					const ex = bestExact();
					return `Exact best: **${featName(ex.f)} ≤ ${f2(ex.thr)}**, gain ${f2(ex.gain)}. Best on the ${s.maxBin}-bin grid: **${featName(bb.f)} ≤ ${f2(bb.thr)}**, gain ${f2(bb.gain)} (**${pct(bb.gain / ex.gain)}** of it). The optimum just snaps to the nearest bin edge (dashed vs solid line). Boosting adds hundreds of trees, so tiny per-split losses wash out, while the speed and memory savings are large. Fewer bins also act as mild regularisation. Try the slider.`;
				},
				reveal: (s) => {
					s.show.compare = true;
				}
			}
		},
		{
			title: 'Splits from gradient histograms',
			body: (s) => {
				const sc = scanOf(s.maxBin, s.feat);
				const pick = s.pickBin >= 0 && s.pickBin < sc.length ? sc[s.pickBin] : null;
				return `To split a node, LightGBM makes **one pass** over its rows and adds each row's gradient and hessian into its bin: a *gradient histogram* (bars: the sum of g per bin, above zero where the model currently predicts too high, i.e. mostly class 0). Then it scans the **bins**, not the rows: G and H on the left are running sums, so every edge's gain costs one formula.

A second trick: a child's histogram is the parent's minus its sibling's, so only the smaller child is ever built from rows.${pick ? `\n\nPicked edge **${featName(s.feat)} ≤ ${f2(pick.thr)}**: ${pick.nL} rows left, ${pick.nR} right, gain **${f2(pick.gain)}**.` : ''}`;
			},
			enter: (s) => {
				s.mode = 'hist';
				s.maxBin = 16;
				s.feat = 0;
				s.pickBin = -1;
				s.show = { ...hidden, edges: true };
				s.ui = { ...off, feat: true, pickBin: true };
			},
			task: {
				prompt: 'Click the histogram to try bin edges, on both features. Find the edge with the highest gain.',
				done: (s) => {
					const sc = scanOf(s.maxBin, s.feat);
					return s.pickBin >= 0 && s.pickBin < sc.length && sc[s.pickBin].gain >= bestBinned(s.maxBin).gain - 1e-9;
				}
			}
		},
		{
			title: 'Leaf-wise vs level-wise growth',
			body: (s) => {
				const L = firstTree(s, 'leaf');
				const V = firstTree(s, 'level');
				return `Both trees get the same budget of **${s.numLeaves} leaves**. The numbers show the order of the splits.

- **Level-wise** (XGBoost's default \`grow_policy\`): split every node of one level before moving to the next. Balanced, depth ${treeDepth(V)}.
- **Leaf-wise** (LightGBM): always split the one leaf, anywhere in the tree, whose best split has the largest gain. Lopsided, depth **${treeDepth(L)}**: it keeps refining the regions that are still most wrong.`;
			},
			enter: (s) => {
				s.mode = 'pair';
				s.numLeaves = 8;
				s.maxDepth = UNLIMITED;
				s.minData = 5;
				s.show = { ...hidden };
				s.ui = { ...off, leaves: true };
			},
			quiz: {
				question: 'Same number of leaves. Which tree lowers the training loss more?',
				options: ['Level-wise: balanced trees are always better', 'Leaf-wise: every split goes where it helps most', 'Both exactly the same'],
				answer: 1,
				explain: (s) => {
					const L = firstTree(s, 'leaf');
					const V = firstTree(s, 'level');
					return `Total gain: leaf-wise **${f2(totalGain(L))}** vs level-wise ${f2(totalGain(V))}. Level-wise spends splits on nodes that are already nearly pure; leaf-wise doesn't. That's why LightGBM tends to converge in fewer trees. The flip side: with the same \`num_leaves\` it grows **deeper**, more specific trees, and those can overfit.`;
				},
				reveal: (s) => {
					s.show.gains = true;
				}
			}
		},
		{
			title: 'num_leaves vs max_depth',
			body: (s) => {
				const v = validLoss(s)[MAX_ROUNDS];
				const c = leafCurve(s);
				return `In LightGBM the main complexity knob is \`num_leaves\` (default 31), not depth: \`max_depth\` defaults to **−1, no limit**. The chart shows validation log-loss after ${MAX_ROUNDS} rounds for each \`num_leaves\` with no depth limit: from ${f3(c[0])} at 2 leaves down to ${f3(Math.min(...c))}, then back up to ${f3(c[c.length - 1])} as trees start carving out single noisy points.

Guards: keep \`num_leaves\` below 2^\`max_depth\`, set \`max_depth\`, or raise \`min_data_in_leaf\` (default 20). Now: num_leaves ${s.numLeaves}, max_depth ${s.maxDepth >= UNLIMITED ? '−1' : s.maxDepth}, min_data_in_leaf ${s.minData}: validation log-loss **${f3(v)}**.`;
			},
			enter: (s) => {
				s.mode = 'model';
				s.policy = 'leaf';
				s.maxBin = 64;
				s.numLeaves = 64;
				s.maxDepth = UNLIMITED;
				s.minData = 5;
				s.rounds = MAX_ROUNDS;
				s.show = { ...hidden, leafCurve: true };
				s.ui = { ...off, leaves: true, depth: true, minData: true };
			},
			task: {
				prompt: `Keep **num_leaves ≥ 32**, but use **max_depth** or **min_data_in_leaf** to get validation log-loss to **${TARGET}** or below.`,
				done: (s) => s.numLeaves >= 32 && validLoss(s)[MAX_ROUNDS] <= TARGET
			}
		},
		{
			title: 'GOSS: keep the big gradients',
			body: (s) => {
				const g = gossSample(s, s.gossDraw);
				const st = samplerStats(s);
				return `Once a model is decent, most rows are already predicted well: their gradients are tiny and barely move any histogram. **Gradient-based One-Side Sampling** keeps the top \`top_rate\` (a) of rows by |g|, randomly samples \`other_rate\` (b) of the rows from the rest, and multiplies the sampled ones' g and h by (1 − a)/b so the sums stay unbiased (\`data_sample_strategy="goss"\` in LightGBM 4).

This is a bigger dataset (${BIG_N} rows) after a few rounds. GOSS uses **${g.rows.length}** rows (${pct(g.rows.length / BIG_N)}): ${g.top.length} large-gradient rows plus ${g.sampled.length} sampled ones weighted ×${f2(g.amp)}. Over ${GOSS_DRAWS} draws it found the full-data split **${st.gSame}** times; a plain random sample of the same size, only ${st.rSame}.`;
			},
			enter: (s) => {
				s.mode = 'goss';
				s.top = 0.2;
				s.other = 0.1;
				s.gossDraw = 0;
				s.show = { ...hidden };
				s.ui = { ...off, goss: true, redraw: true };
			},
			task: {
				prompt: 'Press **New sample** a few times and compare the GOSS split (solid) with the random-sample split (dotted).',
				done: (s) => s.did.redraw >= 3
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap:

1. **Histograms**: features are binned once (\`max_bin\`); splits are scanned over bins, not rows.
2. **Leaf-wise growth**: split the most useful leaf first; control it with \`num_leaves\`, \`max_depth\`, \`min_data_in_leaf\`.
3. **GOSS**: train each tree on the large-gradient rows plus a re-weighted sample of the rest.
4. **EFB** (not shown): bundle sparse features that are never non-zero together into one.

Shading = predicted probability. XGBoost now offers the same histogram method (\`tree_method="hist"\`) and a leaf-wise option (\`grow_policy="lossguide"\`), so the gap is smaller than it used to be. For many categorical columns, see [CatBoost](concept:catboost).`,
			enter: (s) => {
				s.mode = 'model';
				s.maxBin = 64;
				s.numLeaves = 16;
				s.maxDepth = UNLIMITED;
				s.minData = 5;
				s.policy = 'leaf';
				s.useGoss = false;
				s.top = 0.2;
				s.other = 0.1;
				s.rounds = MAX_ROUNDS;
				s.show = { ...hidden, loss: true };
				s.ui = { ...off, bins: true, leaves: true, depth: true, minData: true, policy: true, rounds: true, goss: true };
			}
		}
	]
};

export default explainer;
