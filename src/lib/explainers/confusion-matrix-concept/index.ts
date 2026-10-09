/**
 * Guided explainer: reading a confusion matrix (threshold → four outcomes → metrics → costs).
 */
import type { ExplainerModule } from '../types.ts';
import { accuracy, pct, precision, recall, specificity } from '../_classification/metrics.ts';
import Scene from './Scene.svelte';
import { ar, fr } from './i18n.ts';
import { SEP, cheapest, costOf, countsOf, init, off, words, type CMState } from './state.ts';

const t2 = (v: number) => v.toFixed(2);

const explainer: ExplainerModule<CMState> = {
	title: 'Reading a confusion matrix',
	init,
	Scene,
	i18n: { fr, ar },
	steps: [
		{
			title: 'A classifier outputs scores',
			body: `Here are **120 patients** from a screening test. Each dot is one patient. The top lane holds the 60 who are **actually sick**, the bottom lane the 60 who are **healthy**.

A dot's horizontal position is the **score** the model gave that patient: its estimate of the probability they are sick. Most sick patients score high and most healthy ones score low, but the two bells **overlap**: some healthy patients look sick to the model, and some sick ones look healthy.

The model never says "sick" on its own. Turning scores into decisions is our job.`
		},
		{
			title: 'A threshold turns scores into decisions',
			body: (s) => {
				const c = countsOf(s);
				return `Pick a **threshold**: every patient whose score is at or above it is flagged *sick* (predicted positive), everyone below is sent home *healthy* (predicted negative).

At threshold **${t2(s.thr)}** the model flags **${c.tp + c.fp}** patients and clears **${c.fn + c.tn}**. Drag the line, or use the slider, and watch those numbers move. The model hasn't changed at all; only the decision rule has.`;
			},
			enter: (s) => {
				s.show.threshold = true;
				s.ui.drag = true;
			}
		},
		{
			title: 'Four kinds of outcome',
			body: (s) => {
				const c = countsOf(s);
				return `Cross each decision with the truth and every patient lands in exactly one of four boxes. That 2×2 table is the **confusion matrix**:

- **True positive (TP)**, ${c.tp}: sick and flagged. A correct detection.
- **False negative (FN)**, ${c.fn}: sick but sent home. A *missed* case (Type II error).
- **False positive (FP)**, ${c.fp}: healthy but flagged. A *false alarm* (Type I error).
- **True negative (TN)**, ${c.tn}: healthy and cleared.

Rows are the truth, columns the prediction. The dots now wear the color of their box.`;
			},
			enter: (s) => {
				s.show.outcomes = true;
				s.show.matrix = true;
			}
		},
		{
			title: 'Watch the matrix fill',
			body: (s) => {
				const c = countsOf(s);
				return `Each dot that crosses the line moves between two cells of the same **row**: a sick patient flips between TP and FN, a healthy one between FP and TN. Row totals never change (60 sick, 60 healthy), only how each row is split.

Right now: **${c.tp} of 60** sick patients caught, **${c.fp} of 60** healthy patients alarmed.`;
			},
			task: {
				prompt: 'Move the threshold until **no sick patient is missed** (FN = 0). What did it cost in false alarms?',
				done: (s) => countsOf(s).fn === 0
			}
		},
		{
			title: 'Raise the bar',
			body: (s) => {
				const c = countsOf(s, 0.5);
				return `Back at threshold 0.50 the model misses **${c.fn}** sick patients and raises **${c.fp}** false alarms. Suppose the hospital wants fewer unnecessary follow-ups and raises the threshold.`;
			},
			enter: (s) => {
				s.thr = 0.5;
			},
			quiz: {
				question: 'The threshold goes from 0.50 up to 0.75. What happens to the errors?',
				options: [
					'False positives go down, false negatives go up',
					'Both kinds of error go down: the test is stricter',
					'False positives go up, false negatives go down',
					'Nothing changes: it is still the same model'
				],
				answer: 0,
				explain: (s) => {
					const a = countsOf(s, 0.5);
					const b = countsOf(s, 0.75);
					return `A stricter threshold flags fewer patients. False alarms drop from **${a.fp} to ${b.fp}**, but missed cases climb from **${a.fn} to ${b.fn}**. With overlapping scores, any threshold trades one error for the other. Only a better model (less overlap) reduces both.`;
				},
				reveal: (s) => {
					s.thr = 0.75;
				}
			}
		},
		{
			title: 'Every metric comes from four cells',
			body: (s) => {
				const c = countsOf(s);
				return `The usual scores are just ratios of the cells:

- **Accuracy** = (TP + TN) / all = (${c.tp} + ${c.tn}) / 120 = **${pct(accuracy(c))}**
- **Precision** = TP / (TP + FP): of the flagged, how many are sick? **${pct(precision(c))}**
- **Recall** = TP / (TP + FN): of the sick, how many were caught? **${pct(recall(c))}**
- **Specificity** = TN / (TN + FP): of the healthy, how many were cleared? **${pct(specificity(c))}**

Move the threshold and watch them pull in different directions. [Precision, recall and F1](concept:precision-recall-f1) gets its own lesson, and the Metrics Lab (under Tools) lets you type in any four counts.`;
			},
			enter: (s) => {
				s.show.metrics = true;
				s.thr = 0.4;
			}
		},
		{
			title: 'When accuracy lies',
			body: `Real screening data is rarely balanced. In this group only **6 of 120 patients** are sick (5%). The same model at threshold 0.50 catches all six, at the price of 16 false alarms.

Now imagine a lazy "model" that skips the scores and calls *everyone* healthy.`,
			enter: (s) => {
				s.data = 'rare';
				s.thr = 0.5;
			},
			quiz: {
				question: 'What accuracy does "everyone is healthy" score on this group?',
				options: ['5%', '50%', '95%', 'It cannot be computed'],
				answer: 2,
				explain: (s) => {
					const c = countsOf(s);
					return `It is right about all ${c.tn} healthy patients and wrong about the ${c.fn} sick ones: accuracy **${pct(accuracy(c))}**, recall **${pct(recall(c))}**. The matrix shows the problem instantly: an empty TP cell. This is why accuracy alone is dangerous on [imbalanced data](concept:class-imbalance).`;
				},
				reveal: (s) => {
					s.thr = 1;
				}
			}
		},
		{
			title: 'Mistakes have prices',
			body: (s) => {
				const w = words(s);
				const c = countsOf(s);
				const best = cheapest(s);
				return `Errors are not equally bad. In screening, a false positive means ${w.fpMeans}; a false negative means ${w.fnMeans}. Say a miss is **${w.costs.fn}× worse** than a false alarm.

Total cost = ${w.costs.fp} × FP + ${w.costs.fn} × FN = ${w.costs.fp} × ${c.fp} + ${w.costs.fn} × ${c.fn} = **${costOf(s)}**. The curve below shows the cost at every threshold. ${costOf(s) <= best.cost ? '**That is the cheapest possible.**' : ''}`;
			},
			enter: (s) => {
				s.data = 'balanced';
				s.thr = 0.5;
				s.show.metrics = false;
				s.show.cost = true;
			},
			task: {
				prompt: 'Find the threshold with the **lowest total cost** (drag the line, or click the cost curve).',
				done: (s) => costOf(s) <= cheapest(s).cost + Math.max(2, 0.05 * cheapest(s).cost)
			}
		},
		{
			title: 'Flip the costs: a spam filter',
			body: (s) => {
				const w = words(s);
				return `Same idea, different job: the model scores **120 emails**, and positive now means *spam*. Here a false positive means ${w.fpMeans}, while a false negative means ${w.fnMeans}. A lost real email is **${w.costs.fp}× worse**.

Threshold **${t2(s.thr)}**, total cost **${costOf(s)}**.`;
			},
			enter: (s) => {
				s.scenario = 'spam';
				s.thr = 0.5;
			},
			quiz: {
				question: 'Compared with the screening test, where should the spam filter put its threshold?',
				options: ['Much lower: flag more emails as spam', 'About the same, near 0.5', 'Much higher: only flag emails it is very sure about'],
				answer: 2,
				explain: (s) => {
					const best = cheapest(s);
					return `False positives are now the expensive error, so the filter should only act when it is very sure. The cheapest threshold is about **${t2(best.thr)}** (cost ${best.cost}), versus about **${t2(cheapest({ ...s, scenario: 'medical' }).thr)}** for screening. Same matrix, same metrics: the *costs* decide where to stand.`;
				},
				reveal: (s) => {
					s.thr = cheapest(s).thr;
				}
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked: switch scenario, make the classes rare, or make the model better or worse with **model quality**. Recap:

1. A classifier gives **scores**; a **threshold** turns them into decisions.
2. Each sample lands in one cell: **TP, FN, FP or TN**. Moving the threshold shifts samples within a row.
3. Accuracy, precision, recall and specificity are all ratios of those four counts.
4. Choose the threshold from what each error **costs**, not from a default 0.5.

Careful with code: scikit-learn's \`confusion_matrix\` sorts labels, so the negative class comes first: \`[[TN, FP], [FN, TP]]\`. To see every threshold at once, continue with [ROC curves](concept:roc-auc).`,
			enter: (s) => {
				s.scenario = 'medical';
				s.data = 'balanced';
				s.sep = SEP;
				s.thr = 0.4;
				s.show = { threshold: true, outcomes: true, matrix: true, metrics: true, cost: true };
				s.ui = { ...off, drag: true, scenario: true, data: true, sep: true };
			}
		}
	]
};

export default explainer;
