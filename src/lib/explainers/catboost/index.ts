/**
 * Guided explainer: how CatBoost encodes categorical features without leaking the target,
 * and what symmetric (oblivious) trees are.
 */
import type { ExplainerModule } from '../types.ts';
import { f2, f3, pct } from '../_ensembles/memo.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import { catName } from './cat.ts';
import {
	MAX_DEPTH,
	N_TEST,
	N_TRAIN,
	WALK,
	aucTest,
	aucTrain,
	byFreq,
	cartStats,
	counts,
	init,
	oblAcc,
	oblivious,
	off,
	prior,
	singletons,
	walkRow,
	type CatState
} from './state.ts';

const featName = (f: number) => (f === 0 ? 'x₁' : 'x₂');

const explainer: ExplainerModule<CatState> = {
	title: 'How CatBoost handles categorical features',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Categories are not numbers',
			body: () => {
				const cats = byFreq();
				const rare = cats.filter(([, n]) => n <= 2).length;
				return `We want to predict whether a customer **churns** from the **city** they live in. ${N_TRAIN} training customers live in **${cats.length} different cities**: a few big ones and a long tail of small towns. ${rare} cities have only one or two customers.

Trees split on numbers (\`x ≤ t\`), so a text column has to be [encoded](concept:encoding-categorical) first. How we do it matters a lot when there are many rare values, as with user IDs, product codes or zip codes.`;
			},
			enter: (s) => {
				s.view = 'table';
			}
		},
		{
			title: 'One-hot: a column per city',
			body: () => {
				const k = counts().cnt.size;
				return `One-hot encoding adds a 0/1 column per city: **${k} columns**, each row has a single 1, so ${pct(1 - 1 / k, 1)} of the matrix is zeros (each dot is a 1).

That's awkward for trees. A split on one column separates **one city from all the others**, so grouping similar cities takes many splits, and a column for a town with one customer is a perfect way to memorise that customer. CatBoost only one-hot encodes features with very few distinct values (\`one_hot_max_size\`, small by default). For everything else it uses *target statistics*.`;
			},
			enter: (s) => {
				s.view = 'onehot';
			}
		},
		{
			title: "Target encoding: a city's churn rate",
			body: (s) => `A much more compact idea: replace each city with **the churn rate of its customers** in the training data. One numeric column, and similar cities get similar numbers. And the big cities really do differ: their true churn rates range from 18% to 60%.

Each dot is a training customer, placed at its encoded value (top lane: churned). We can measure how well the encoding alone separates the lanes with [AUC](concept:roc-auc): 0.5 is a coin flip, 1.0 is perfect. On the training data: **${f2(aucTrain(s))}**. Impressive for one column.`,
			enter: (s) => {
				s.view = 'encode';
				s.method = 'greedy';
				s.prior = 0;
				s.showTest = false;
				s.show = { table: true, formula: false };
				s.ui = { ...off };
			}
		},
		{
			title: 'Spot the leak',
			body: () => `Look at the table: a town with **one** customer gets encoded as that customer's own label, exactly 0 or 1. There are ${singletons()} such customers here. The encoding doesn't describe the city, it *contains the answer*.`,
			enter: (s) => {
				s.view = 'encode';
				s.show = { table: true, formula: false };
			},
			quiz: {
				question: 'How well will this encoding separate churners among new customers?',
				options: ['About as well as on the training data', 'Much worse, not far above a coin flip', 'Better, since there is more test data'],
				answer: 1,
				explain: (s) =>
					`On ${N_TEST} new customers it scores only **${f2(aucTest(s))}** (train: ${f2(aucTrain(s))}). For new customers, a small town's encoding is some other person's label, which says nothing. This is **target leakage**: a model trained on the leaky column would lean on it heavily and then disappoint in production.`,
				reveal: (s) => {
					s.showTest = true;
				}
			}
		},
		{
			title: 'Smoothing helps, but the leak stays',
			body: (s) => `A common patch is to pull rare categories towards the overall churn rate p = ${f2(prior())}:

\`encoding = (Σ y + a·p) / (n + a)\`

where n is the city's customer count and a the prior strength. With a = **${s.prior}**: train AUC **${f2(aucTrain(s))}**, test AUC **${f2(aucTest(s))}**.

Smoothing compresses the small towns towards p, but every row still counts **its own label**, so a churner's encoding is always nudged up and a stayer's down.`,
			enter: (s) => {
				s.view = 'encode';
				s.method = 'greedy';
				s.prior = 0;
				s.showTest = true;
				s.show = { table: false, formula: false };
				s.ui = { ...off, prior: true };
			},
			task: {
				prompt: 'Push the prior strength **a** to 50 or more. Does the train AUC come down to the test AUC?',
				done: (s) => s.prior >= 50
			}
		},
		{
			title: 'Ordered target statistics',
			body: (s) => {
				if (s.cursor === 0) return `CatBoost's fix: put the training rows in a **random order** and encode each row using **only the rows before it** with the same city, plus the prior:

\`TS = (Σ_{earlier, same city} y + a·p) / (n_earlier + a)\`

A row never sees its own label, just like a real future customer. Press **Next row** to walk through the first rows of the permutation.`;
				const r = walkRow(s, s.cursor - 1);
				return `Rows are encoded one by one in a random order, each using only the **earlier rows with the same city** (highlighted), plus the prior (a = ${s.prior}, p = ${f2(prior())}):

\`TS = (Σ_{earlier, same city} y + a·p) / (n_earlier + a)\`

Row ${s.cursor} (**${catName(r.cat)}**): ${r.n} earlier customer${r.n === 1 ? '' : 's'} from there, ${r.pos} of whom churned → (${r.pos} + ${s.prior}·${f2(prior())}) / (${r.n} + ${s.prior}) = **${f3(r.value)}**. Its own label (${r.y}) played no part.`;
			},
			enter: (s) => {
				s.view = 'ordered';
				s.method = 'ordered';
				s.prior = 1;
				s.cursor = 0;
				s.show = { table: false, formula: true };
				s.ui = { ...off, walk: true };
			},
			task: {
				prompt: `Press **Next row** until ${WALK} rows are encoded. Watch a city's value change as more of its customers appear.`,
				done: (s) => s.cursor >= WALK
			}
		},
		{
			title: 'No leak: train looks like test',
			body: (s) => `Now every training row is encoded with ordered statistics. Train AUC **${f2(aucTrain(s))}**, test AUC **${f2(aucTest(s))}**: the training column is now as informative as it will really be, no more.

Two details make this work in practice. Rows early in the order have few predecessors, so their encodings are noisy; CatBoost uses **several random permutations** for different trees to average that out. At prediction time, new rows are encoded with statistics from the **whole** training set. CatBoost applies the same "only use earlier rows" idea to the boosting residuals themselves (**ordered boosting**), which avoids a similar, subtler leak.`,
			enter: (s) => {
				s.view = 'encode';
				s.method = 'ordered';
				s.prior = 1;
				s.showTest = true;
				s.show = { table: false, formula: false };
				s.ui = { ...off, shuffle: true, prior: true };
			}
		},
		{
			title: 'Symmetric (oblivious) trees',
			body: (s) => {
				const t = oblivious(s.depth);
				const a = oblAcc(s.depth);
				const cs = cartStats(s.depth);
				return `CatBoost's trees are also unusual. In a **symmetric (oblivious) tree**, every node at the same depth asks the **same question**. Each level is one cut across the *whole* plane, so the leaves form a grid, and a leaf's index is just the yes/no answers read as a binary number.

Depth ${s.depth}: ${t.levels.map((l) => `${featName(l.f)} ≤ ${f2(l.thr)}`).join(', ')}. ${2 ** s.depth} leaves from **${t.levels.length} rules** (a regular tree of the same depth here uses ${cs.rules} rules). Test accuracy: symmetric ${pct(a.test)}, regular ${pct(cs.test)}.`;
			},
			enter: (s) => {
				s.view = 'trees';
				s.depth = 2;
				s.ui = { ...off, depth: true };
			},
			quiz: {
				question: 'A symmetric tree of depth 6 has 64 leaves. How many different split rules does it store?',
				options: ['63, one per internal node', '6, one per level', '64, one per leaf'],
				answer: 1,
				explain: () =>
					`Just **6**: one (feature, threshold) per level. That makes the tree a strong regulariser (it can't carve out one odd corner without cutting everywhere) and makes prediction very fast: 6 comparisons give the 6 bits of the leaf index, with no branching. It's one reason CatBoost does well with default settings. The cost: some patterns need a deeper symmetric tree than a regular one.`,
				reveal: (s) => {
					s.depth = MAX_DEPTH;
				}
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap:

1. One-hot is wasteful for many categories; greedy target encoding leaks each row's own label.
2. Smoothing with a prior reduces, but doesn't remove, the leak.
3. **Ordered target statistics** encode each row from earlier rows only, over several random permutations.
4. **Symmetric trees** use one split per level: fast, regularised, grid-shaped.

In code, you just pass the raw string columns as \`cat_features\` and CatBoost does the rest. Compare with [XGBoost](concept:xgboost) and [LightGBM](concept:lightgbm), which expect numeric (or specially marked) categorical input.`,
			enter: (s) => {
				s.view = 'encode';
				s.method = 'ordered';
				s.prior = 1;
				s.showTest = true;
				s.depth = 3;
				s.show = { table: false, formula: false };
				s.ui = { prior: true, method: true, walk: false, shuffle: true, depth: true, view: true };
			}
		}
	]
};

export default explainer;
