/**
 * Guided explainer: how a random forest turns many overfitting trees into one stable model.
 */
import type { ExplainerModule } from '../types.ts';
import { pct } from '../_ensembles/memo.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import {
	COMPARE_TREES,
	DATA_SEED,
	GALLERY,
	MAX_TREES,
	N_TRAIN,
	UNLIMITED,
	bagStats,
	changed,
	correlation,
	disagreement,
	forestAcc,
	hidden,
	init,
	meanTreeAcc,
	oobCurve,
	oobVote,
	off,
	setTrees,
	single,
	singleAcc,
	testCurve,
	train,
	tree,
	treeAcc,
	type RFState
} from './state.ts';
import * as dt from '../decision-tree/tree.ts';

const CLASS = ['A', 'B'];

const explainer: ExplainerModule<RFState> = {
	title: 'How a random forest averages away overfitting',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'One deep tree, one jagged guess',
			body: (s) => {
				const a = singleAcc(s);
				const st = dt.stats(single(s));
				return `These ${N_TRAIN} points come from a **wavy boundary**: class **B** (squares) below the curve, class **A** (circles) above it, with 12% of labels flipped at random.

A single [decision tree](concept:decision-tree) grown with no depth limit splits until every leaf is pure: **${st.leaves} leaves**, depth ${st.depth}. It gets **${pct(a.train)}** of the training points right, but only **${pct(a.test)}** of 600 fresh test points. The little islands around mislabelled points are the tree memorising noise. That is *high variance*: a slightly different sample would give a very different tree.`;
			},
			enter: (s) => {
				s.mode = 'single';
				s.ui = { ...off, view: true };
			}
		},
		{
			title: 'Bootstrap: each tree gets its own sample',
			body: (s) => {
				const b = bagStats(s);
				return `A random forest grows many trees, and each one is trained on a **bootstrap sample**: ${N_TRAIN} rows drawn *with replacement* from the ${N_TRAIN} training rows. Some rows get picked twice or more (bigger markers), others not at all (faded).

Tree **${s.focus + 1}** saw **${b.unique}** distinct rows; ${b.twice} of them more than once.`;
			},
			enter: (s) => {
				s.mode = 'tree';
				s.focus = 0;
				s.view = 'train';
				s.ui = { ...off };
				s.show = { ...hidden, bag: true };
			},
			quiz: {
				question: `Drawing ${N_TRAIN} rows with replacement from ${N_TRAIN}: roughly how many rows does each tree never see?`,
				options: ['None: every row gets picked at least once', 'About 37%', 'About half'],
				answer: 1,
				explain: (s) => {
					const b = bagStats(s);
					return `Each draw misses a given row with probability (1 − 1/n), so all n draws miss it with probability (1 − 1/n)ⁿ ≈ 1/e ≈ **36.8%**. Tree ${s.focus + 1} never saw **${b.out}** rows (${pct(b.out / b.n)}), now ringed. These **out-of-bag** rows will come in handy later.`;
				},
				reveal: (s) => {
					s.show.oob = true;
				}
			}
		},
		{
			title: 'A random subset of features at every split',
			body: (s) => {
				const t = tree(s, s.focus);
				const st = dt.stats(t);
				return `The second source of randomness: at **every split**, the tree may only search a random subset of the features (\`max_features\`). Scikit-learn's default for classification is √(number of features); with our 2 features that means **one feature, picked at random, per split**. So even a split that would obviously be best on x₂ may have to be made on x₁.

Tree **${s.focus + 1}**: ${st.leaves} leaves, depth ${st.depth}, test accuracy **${pct(treeAcc(s, s.focus))}**. Each tree is still grown deep and still overfits, just to its own sample and its own random choices.`;
			},
			enter: (s) => {
				s.mode = 'tree';
				s.show = { ...hidden, bag: true, oob: true };
				s.ui = { ...off, browse: true, maxFeatures: true };
			},
			task: {
				prompt: 'Press **Next tree** to flip through at least three trees. Their boundaries all look different.',
				done: (s) => s.did.browse >= 3
			}
		},
		{
			title: 'Many trees, many different mistakes',
			body: (s) => {
				const accs = Array.from({ length: GALLERY }, (_, t) => treeAcc(s, t));
				const lo = Math.min(...accs);
				const hi = Math.max(...accs);
				return `Here are the first ${GALLERY} trees side by side, each drawn with the rows it was trained on. Every tree scores between **${pct(lo)}** and **${pct(hi)}** on the test set. None of them is good on its own.

But they are wrong in *different places*. On **${pct(disagreement(s, GALLERY))}** of the test points these ${GALLERY} trees don't all agree. Where one tree drew an island around a noisy point, most others didn't. That disagreement is what voting exploits.`;
			},
			enter: (s) => {
				s.mode = 'gallery';
				s.maxFeatures = 1;
				s.ui = { ...off };
				s.show = { ...hidden };
			}
		},
		{
			title: 'Majority vote',
			body: (s) => {
				const b = s.nTrees;
				return `The forest predicts by **majority vote**: each tree votes for a class and the most votes win (scikit-learn actually averages the trees' class probabilities, which with fully grown trees is nearly the same thing). The shading shows the share of trees voting B: strong where they agree, pale where they're split.

With **${b} tree${b > 1 ? 's' : ''}** the forest scores **${pct(forestAcc(s, b))}** on the test set, while an average single tree scores ${pct(meanTreeAcc(s))}. Islands that only a few trees drew get outvoted, and the jagged steps blur into a smoother boundary.`;
			},
			enter: (s) => {
				s.mode = 'forest';
				s.ui = { ...off, nTrees: true, view: true };
				setTrees(s, 1);
			},
			task: {
				prompt: 'Drag **n_estimators** to at least **50** trees and watch the boundary smooth out.',
				done: (s) => s.nTrees >= 50
			}
		},
		{
			title: 'Does adding trees ever overfit?',
			body: (s) => {
				const c = testCurve(s, s.curveTo);
				return `The chart tracks test accuracy as trees are added (dashed: the single deep tree, ${pct(singleAcc(s).test)}). From 1 to ${s.curveTo} trees, the forest went from ${pct(c[0])} to **${pct(c[c.length - 1])}**.`;
			},
			enter: (s) => {
				s.mode = 'forest';
				s.ui = { ...off, nTrees: true };
				s.show = { ...hidden, curve: true };
				setTrees(s, 20);
				s.curveTo = 20;
			},
			quiz: {
				question: `What happens if we keep adding trees, up to ${MAX_TREES}?`,
				options: ['Test accuracy keeps climbing towards 100%', 'It levels off: more trees stop helping but never hurt', 'It starts to fall: too many trees overfit'],
				answer: 1,
				explain: (s) => {
					const c = testCurve(s, MAX_TREES);
					return `Going from ${pct(c[19])} at 20 trees to **${pct(c[MAX_TREES - 1])}** at ${MAX_TREES}: the curve flattens and just wobbles. Each new tree is one more independent vote, so adding trees only makes the average *more stable*. It cannot add new overfitting. The ceiling is set by how good and how different the trees are, and by the noise (12% flipped labels caps this data at about 88%). So \`n_estimators\` is mostly a speed/memory trade-off.`;
				},
				reveal: (s) => {
					s.curveTo = MAX_TREES;
					setTrees(s, MAX_TREES);
				}
			}
		},
		{
			title: 'Out-of-bag error: a free test set',
			body: (s) => {
				const B = s.nTrees;
				const oob = oobCurve(s, B)[B - 1];
				let pick = '';
				if (s.picked >= 0) {
					const v = oobVote(s, B, s.picked);
					const y = train(s).y[s.picked];
					const verdict = v.pred < 0 ? '' : v.pred === y ? ' (correct)' : ` but its label is ${CLASS[y]} (wrong, possibly a noisy label)`;
					pick = `\n\nThe ringed point (class ${CLASS[y]}) was left out by **${v.out} of ${B}** trees. They vote ${v.a} A / ${v.b} B, so its out-of-bag prediction is **${v.pred >= 0 ? CLASS[v.pred] : '—'}**${verdict}.`;
				}
				return `Every training row is out-of-bag for about 37% of the trees. Let **only those trees** vote on it, and you get an honest prediction for a row the voters never trained on. Do that for every row and you have the **out-of-bag accuracy** (\`oob_score=True\` in scikit-learn), with no data set aside.

With ${B} trees: OOB accuracy **${pct(oob)}**, test accuracy **${pct(forestAcc(s, B))}**. The chart shows both curves track each other.${pick}`;
			},
			enter: (s) => {
				s.mode = 'forest';
				setTrees(s, 100);
				s.curveTo = MAX_TREES;
				s.view = 'train';
				s.ui = { ...off, pick: true };
				s.show = { ...hidden, curve: true, oobCurve: true };
			},
			task: {
				prompt: 'Click a training point to see how the trees that never saw it vote.',
				done: (s) => s.did.pick
			}
		},
		{
			title: 'Less variance than a single tree',
			body: (s) => {
				const c = changed(s);
				const tail = c
					? `After the last resample, the single tree changed its prediction on **${pct(c.single)}** of the area covered by the data; the forest on only **${pct(c.forest)}**.`
					: 'Press **New training sample** to draw a fresh training set from the same source.';
				return `Variance means: *how much does the model change if the training data changes?* Left, a single deep tree; right, a forest of ${COMPARE_TREES} trees, both trained on the same sample.

${tail}

Both are built from the same kind of overfitting trees. Averaging cancels out the part of each tree that is noise, and keeps the part they share: the real boundary. That is why a forest has roughly the *bias* of one deep tree but much lower *variance* (see the [bias–variance trade-off](concept:bias-variance-tradeoff)).`;
			},
			enter: (s) => {
				s.mode = 'compare';
				s.ui = { ...off, resample: true };
				s.show = { ...hidden };
			},
			task: {
				prompt: 'Press **New training sample** three times. Which model jumps around more?',
				done: (s) => s.did.resample >= 3
			}
		},
		{
			title: 'Why the randomness matters',
			body: (s) => {
				const rho = correlation(s);
				const B = 100;
				return `For B trees whose predictions each have variance σ² and pairwise correlation ρ, the average has variance

\`ρ·σ² + (1 − ρ)·σ²/B\`

The second term vanishes as B grows, but the first doesn't: **correlated trees can't average their errors away**. Bagging and random features are there to push ρ down.

Current settings (bootstrap **${s.bootstrap ? 'on' : 'off'}**, max_features **${s.maxFeatures === 2 ? 'all' : '1'}**): tree correlation ρ ≈ **${rho.toFixed(2)}**, average tree **${pct(meanTreeAcc(s))}**, forest of ${B} **${pct(forestAcc(s, B))}**.`;
			},
			enter: (s) => {
				s.mode = 'forest';
				s.seed = DATA_SEED;
				s.prevSeed = DATA_SEED;
				setTrees(s, 100);
				s.ui = { ...off, maxFeatures: true, bootstrap: true };
				s.show = { ...hidden, corr: true };
			},
			quiz: {
				question: 'Turn bootstrap off and let every split see all features. What does the forest become?',
				options: ['An even better forest, since every tree sees all the data', '100 copies of the same tree: no better than one tree', 'A shallower, underfitting model'],
				answer: 1,
				explain: (s) =>
					`Same data and same feature choices mean every tree makes the **same** greedy splits: ρ = **${correlation(s).toFixed(2)}**, and the forest scores **${pct(forestAcc(s, 100))}**, exactly the single deep tree. All the benefit comes from the trees being *different*. Try the toggles to see each source of randomness on its own.`,
				reveal: (s) => {
					s.bootstrap = false;
					s.maxFeatures = 2;
				}
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap:

1. Draw a bootstrap sample for each tree (about 63% distinct rows, the rest are out-of-bag).
2. Grow a deep tree, searching only a random subset of features at each split.
3. Predict by majority vote (or average, for regression).
4. More trees never overfit, they only stabilise; the OOB score estimates test accuracy for free.

Things to try: limit \`max_depth\` and see that a forest needs less pruning than a single tree. Set \`n_estimators\` to 1 to get back a single (bootstrapped) tree. Forests are a strong, low-tuning baseline; [gradient boosting](concept:gradient-boosting) takes the opposite approach, building shallow trees *in sequence*, each fixing the last one's errors.`,
			enter: (s) => {
				s.mode = 'forest';
				s.bootstrap = true;
				s.maxFeatures = 1;
				s.maxDepth = UNLIMITED;
				setTrees(s, 100);
				s.curveTo = MAX_TREES;
				s.ui = { browse: false, maxFeatures: true, nTrees: true, bootstrap: true, depth: true, view: true, resample: true, pick: true };
				s.show = { ...hidden, curve: true, oobCurve: true };
			}
		}
	]
};

export default explainer;
