/**
 * Guided explainer: how a decision tree (CART, classification) learns its splits.
 */
import type { ExplainerModule } from '../types';
import Scene from './Scene.svelte';
import i18n from './i18n';
import {
	TARGET,
	UNLIMITED,
	accuracies,
	fitted,
	init,
	manualScore,
	off,
	pct,
	rootBest,
	rootCounts,
	rootCurve,
	rootGini,
	rule,
	setDepth,
	setSplit,
	type TreeState
} from './state';

const START = { f: 0, thr: 0.55 } as const;
const f3 = (v: number) => v.toFixed(3);

const explainer: ExplainerModule<TreeState> = {
	title: 'How a decision tree learns its splits',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Sorting points with yes/no questions',
			body: (s) => {
				const [a, b] = rootCounts(s);
				return `Here are **${a + b} training points** with two features, \`x₁\` and \`x₂\`, and two classes: **A** (circles) and **B** (squares). About 1 in 10 labels is deliberately wrong, as in real data.

A decision tree classifies by asking a chain of **yes/no questions**, each about a single feature. Right now it has asked nothing: one **root node** holds all ${a + b} points (${a} A, ${b} B), shown below the plot.`;
			}
		},
		{
			title: 'A split is one threshold on one feature',
			body: (s) => {
				const sc = manualScore(s);
				return `Each question has the form **"is feature ≤ threshold?"**. On a plot that is a straight line parallel to an axis: \`x₁ ≤ t\` is a vertical line, \`x₂ ≤ t\` a horizontal one. Points on the *yes* side go to the left child, the rest to the right child.

The split **${rule(s.split)}** sends ${sc.left[0] + sc.left[1]} points left (${sc.left[0]} A, ${sc.left[1]} B) and ${sc.right[0] + sc.right[1]} right (${sc.right[0]} A, ${sc.right[1]} B). The tree diagram shows the two children it would create.`;
			},
			enter: (s) => {
				setSplit(s, START);
				s.show.counts = true;
				s.ui.drag = true;
				s.ui.axis = true;
			},
			task: {
				prompt: 'Drag on the plot to move the line, then switch to an **x₂** (horizontal) split.',
				done: (s) => s.did.drag && s.split.f === 1
			}
		},
		{
			title: 'Gini impurity: how mixed is a node?',
			body: (s) => {
				const [a, b] = rootCounts(s);
				const n = a + b;
				const sc = manualScore(s);
				return `To compare splits we need a score for how **mixed** a node is. CART uses **Gini impurity**:

\`G = 1 − p_A² − p_B²\`

where \`p_A\`, \`p_B\` are the class fractions in the node. A pure node has G = 0; a 50/50 node has the worst value, G = 0.5. It is the chance that two points drawn at random from the node have different classes.

Root: 1 − (${a}/${n})² − (${b}/${n})² = **${f3(rootGini(s))}**. With **${rule(s.split)}**, the yes side has G = **${f3(sc.giniLeft)}** and the no side G = **${f3(sc.giniRight)}**.`;
			},
			enter: (s) => {
				setSplit(s, START);
				s.show.gini = true;
			}
		},
		{
			title: 'Scoring a split',
			body: (s) => {
				const sc = manualScore(s);
				const nL = sc.left[0] + sc.left[1];
				const nR = sc.right[0] + sc.right[1];
				const n = nL + nR;
				return `A split is scored by the **weighted average** of its children's impurity, weighted by how many points each child gets:

\`weighted = (n_yes/n)·G_yes + (n_no/n)·G_no\`

The drop from the parent's impurity is the **gain**. Bigger gain means a more useful question.

Now: (${nL}/${n})·${f3(sc.giniLeft)} + (${nR}/${n})·${f3(sc.giniRight)} = **${f3(sc.weighted)}**, so gain = ${f3(rootGini(s))} − ${f3(sc.weighted)} = **${f3(sc.gain)}**.`;
			},
			enter: (s) => {
				setSplit(s, START);
			},
			task: {
				prompt: 'Move the line (either axis) until the **gain** pill lights up: within 10% of the best possible split.',
				done: (s) => manualScore(s).gain >= 0.9 * rootBest(s).gain
			}
		},
		{
			title: 'Greedy search: try every threshold',
			body: (s) => {
				const n = rootCurve(s, 0).length + rootCurve(s, 1).length;
				return `The algorithm does what you just did, but exhaustively. For each feature it sorts the points and tries a threshold **halfway between every pair of neighbours**: ${n} candidates here. Only those can change which points go where.

The chart plots the weighted child Gini for every threshold on the current feature (the faint curve is the other feature). The dashed line is the parent's impurity; the gap below it is the gain.`;
			},
			enter: (s) => {
				setSplit(s, START);
				s.show.curve = true;
			},
			quiz: {
				question: 'Look at both curves. Which feature will the best split use?',
				options: ['x₁ (a vertical line)', 'x₂ (a horizontal line)', 'Both give exactly the same best score'],
				answer: 1,
				explain: (s) => {
					const b = rootBest(s);
					return `The lowest point over both curves is **${rule(b)}**: weighted Gini ${f3(b.weighted)}, gain **${f3(b.gain)}**. It cuts off the top band, which is almost all A. The split line has jumped there.`;
				},
				reveal: (s) => {
					const b = rootBest(s);
					setSplit(s, b);
					s.show.best = true;
				}
			}
		},
		{
			title: 'Then recurse on each side',
			body: (s) => {
				const t = fitted(s);
				const a = accuracies(s);
				return `The best split becomes the root. Then each child is treated as a **new, smaller dataset** and gets its own best split, found the same way, and so on down the tree. That's why it's called *greedy*: each split is the best one right now, with no look-ahead.

Branches stop growing when a node is **pure**, when no split helps, or when a limit such as \`max_depth\` is hit. A leaf predicts its **majority class**.

Depth **${a.depth}**: ${a.leaves} leaves${t.split ? `, root ${rule(t.split)}` : ''}, training accuracy **${pct(a.train)}**.`;
			},
			enter: (s) => {
				s.ui = { ...off, grow: true };
				s.show.curve = false;
				s.show.best = false;
				s.show.regions = true;
				setDepth(s, 1);
			},
			task: { prompt: 'Press **Grow one level** until the tree is 3 levels deep.', done: (s) => s.mode === 'tree' && s.maxDepth >= 3 }
		},
		{
			title: 'Leaves are rectangles',
			body: (s) => {
				const a = accuracies(s);
				return `Every split cuts a box in two along one axis, so the tree divides the plane into **axis-aligned rectangles**, one per leaf. Hover a leaf in the diagram (or a region on the plot) to see which box it owns.

To check that the boxes describe the *pattern* and not just these 150 points, we score the tree on **${500} held-out test points** it never saw. At depth ${a.depth}: train **${pct(a.train)}**, test **${pct(a.test)}**. With 10% of labels flipped, about 90% is the best any model can do here.`;
			},
			enter: (s) => {
				s.ui = { ...off, view: true };
				s.show.acc = true;
				setDepth(s, 3);
			},
			task: { prompt: 'Switch **Show points** to **Test** to see the held-out data on the same boxes.', done: (s) => s.view === 'test' }
		},
		{
			title: 'What if we never stop?',
			body: (s) => {
				const a = accuracies(s);
				return `Nothing forces a tree to stop at depth 3. By default (\`max_depth=None\` in scikit-learn) it keeps splitting until every leaf is pure.

Current tree: depth **${a.depth}**, **${a.leaves}** leaves, train ${pct(a.train)}, test ${pct(a.test)}.`;
			},
			enter: (s) => {
				s.ui = { ...off };
				s.view = 'train';
				setDepth(s, 3);
			},
			quiz: {
				question: 'With no depth limit on this noisy data, what happens?',
				options: [
					'Train and test accuracy both climb towards 100%',
					'Train accuracy hits 100%, test accuracy gets worse',
					'The tree stops after a few more levels because splits stop helping'
				],
				answer: 1,
				explain: (s) => {
					const a = accuracies(s);
					const d3 = accuracies(s, 3);
					return `The tree grows to depth **${a.depth}** with **${a.leaves} leaves** and fits every training point: train **${pct(a.train)}**. But many of those tiny boxes exist only to wrap a single mislabelled point, and they misclassify the test points around them: test drops from ${pct(d3.test)} to **${pct(a.test)}**. That is [overfitting](concept:overfitting-underfitting).`;
				},
				reveal: (s) => setDepth(s, UNLIMITED)
			}
		},
		{
			title: 'Reining it in',
			body: (s) => {
				const a = accuracies(s);
				return `Two common brakes:

- \`max_depth\`: never ask more than this many questions in a row.
- \`min_samples_leaf\`: every leaf must keep at least this many training points, so the tree can't carve out a box for one noisy point.

The chart shows train and test accuracy for every \`max_depth\`. Train only goes up; test peaks and then falls. Now: depth ${a.depth}, ${a.leaves} leaves, train **${pct(a.train)}**, test **${pct(a.test)}**.`;
			},
			enter: (s) => {
				s.ui = { ...off, depth: true, minLeaf: true, view: true };
				s.show.depthChart = true;
				setDepth(s, UNLIMITED);
			},
			task: {
				prompt: `Use **max_depth** and/or **min_samples_leaf** to get test accuracy to at least **${pct(TARGET)}**.`,
				done: (s) => s.mode === 'tree' && accuracies(s).test >= TARGET
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap:

1. Score every axis-aligned split by the weighted Gini of its children.
2. Keep the best one, split the data, and repeat on each side.
3. Stop at pure leaves or at a limit (\`max_depth\`, \`min_samples_leaf\`).
4. Each leaf predicts its majority class, so the regions are rectangles.

Press **New training sample** with no depth limit: a slightly different sample gives a very different tree. Single deep trees have **high variance**. A [Random Forest](concept:random-forest) fixes that by averaging many trees, each grown on a random resample of the data. Trees need no [feature scaling](concept:feature-scaling), since a split only compares one feature with a threshold.`,
			enter: (s) => {
				s.ui = { ...off, grow: true, depth: true, minLeaf: true, view: true, dataset: true, resample: true };
				s.show = { counts: false, gini: false, curve: false, best: false, regions: true, acc: true, depthChart: true };
				s.view = 'train';
				s.minLeaf = 1;
				setDepth(s, UNLIMITED);
			},
			task: {
				prompt: 'Press **New training sample** a few times, first with `max_depth` = none, then with 2. Which tree changes more?',
				done: (s) => s.did.resample >= 3
			}
		}
	]
};

export default explainer;
