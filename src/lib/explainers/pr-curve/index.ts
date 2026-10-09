/**
 * Guided explainer: the precision-recall curve, average precision, and why it beats ROC on rare positives.
 */
import type { ExplainerModule } from '../types.ts';
import { fpr, pct, precision, recall } from '../_classification/metrics.ts';
import Scene from './Scene.svelte';
import { ar, fr } from './i18n.ts';
import {
	N_POS,
	PREVALENCES,
	SEP,
	TARGET_PRECISION,
	apOf,
	aucOf,
	bestAtPrecision,
	countsOf,
	init,
	nNegOf,
	off,
	prevalenceOf,
	startTrace,
	thrForRecall,
	traced,
	type PCState
} from './state.ts';

const t2 = (v: number) => v.toFixed(2);
const a3 = (v: number) => v.toFixed(3);
const RARE = PREVALENCES.length - 1;

const explainer: ExplainerModule<PCState> = {
	title: 'Precision-recall curves and average precision',
	init,
	Scene,
	i18n: { fr, ar },
	steps: [
		{
			title: 'One threshold, one point',
			body: (s) => {
				const c = countsOf(s);
				return `A fraud model scores **${N_POS + nNegOf(s)} card transactions**: ${N_POS} fraudulent (top lane) and ${nNegOf(s)} legitimate. That is ${pct(prevalenceOf(s), 0)} fraud, far more than real life; we'll make it rarer later.

At threshold **${t2(s.thr)}** the model flags ${c.tp + c.fp} transactions: [precision](concept:precision-recall-f1) **${pct(precision(c))}** (flags that are real fraud), recall **${pct(recall(c))}** (fraud caught). The chart plots that pair as one point: recall across, precision up.`;
			},
			enter: (s) => {
				s.ui.drag = true;
			}
		},
		{
			title: 'Trace the PR curve',
			body: (s) => {
				const c = countsOf(s);
				return `Sweep the threshold from 1 down to 0. The curve starts at the **top left**: a strict threshold flags only the most suspicious transactions, which are nearly all fraud. As it loosens, recall climbs toward 1 and precision sinks, because ever more legitimate transactions get flagged.

The line is a **sawtooth**: each fraud passed nudges it up and right, each legitimate transaction knocks precision down. Passed so far: ${c.tp} fraud, ${c.fp} legitimate.`;
			},
			enter: (s) => {
				s.show.curve = 'trace';
				s.ui.trace = true;
				startTrace(s);
			},
			task: {
				prompt: 'Press **▶ Trace** (or drag the threshold down to 0) to draw the whole curve.',
				done: (s) => traced(s)
			}
		},
		{
			title: 'The baseline is not 0.5',
			body: (s) =>
				`At threshold 0 everything is flagged: recall is 100% and precision equals the share of fraud, **${pct(prevalenceOf(s), 0)}**. So the curve always ends at (1, ${prevalenceOf(s)}). The dashed line marks that level.`,
			enter: (s) => {
				s.show.curve = 'full';
				s.show.baseline = true;
				s.ui.trace = false;
				s.thr = 0.5;
			},
			quiz: {
				question: 'A useless model gives every transaction a random score. Where does its PR curve sit?',
				options: [
					'On the diagonal, like a random ROC curve',
					'Flat at precision 0.5',
					'Roughly flat at the fraud rate (20%)',
					'Flat at precision 0'
				],
				answer: 2,
				explain: (s) =>
					`Random scores flag fraud and legitimate transactions in proportion, so at **any** threshold about ${pct(prevalenceOf(s), 0)} of the flags are fraud. The curve wobbles around the baseline (it's noisy at the strict end, where only a handful of transactions are flagged), and its average precision is **${a3(apOf(s))}**, about the prevalence. A random ROC curve gives AUC 0.5 no matter the class ratio; a random PR curve gives the prevalence. Always report AP next to the prevalence.`,
				reveal: (s) => {
					s.sep = 0;
				}
			}
		},
		{
			title: 'Average precision',
			body: (s) => {
				const ap = apOf(s);
				return `To summarize the curve in one number, add up the precision at each step, weighted by how much **recall** grew at that step:

\`AP = Σₙ (Rₙ − Rₙ₋₁) · Pₙ\`

Each shaded bar is one term; together they approximate the area under the curve without the optimistic straight-line interpolation. This model: **AP = ${a3(ap)}**, against a baseline of ${a3(prevalenceOf(s))}. scikit-learn's \`average_precision_score\` computes exactly this.`;
			},
			enter: (s) => {
				s.sep = SEP;
				s.show.ap = true;
			}
		},
		{
			title: 'Pick an operating point',
			body: (s) => {
				const c = countsOf(s);
				const b = bestAtPrecision(s);
				const p = precision(c);
				const ok = p >= TARGET_PRECISION;
				return `The curve is also a menu. Suppose the fraud team can only handle alerts that are at least **${pct(TARGET_PRECISION, 0)} correct** (the dashed line), and within that wants to catch as much fraud as possible.

Precision **${pct(p)}** ${ok ? '✓' : `(below ${pct(TARGET_PRECISION, 0)})`}, recall **${pct(recall(c))}**.${ok && recall(c) >= b.recall ? ' That is the most fraud you can catch at that precision.' : ''}`;
			},
			enter: (s) => {
				s.show.ap = false;
				s.show.baseline = false;
				s.show.target = true;
				s.thr = 0.5;
			},
			task: {
				prompt: `Get **precision ≥ ${pct(TARGET_PRECISION, 0)}** with the **highest recall** possible.`,
				done: (s) => {
					const c = countsOf(s);
					return precision(c) >= TARGET_PRECISION && recall(c) >= bestAtPrecision(s).recall;
				}
			}
		},
		{
			title: 'Make fraud rare',
			body: (s) => {
				const c = countsOf(s);
				return `Real fraud is far rarer. The **fraud rate** slider keeps the same ${N_POS} frauds and the same model, and adds legitimate transactions. Watch both curves.

Fraud rate **${pct(prevalenceOf(s), 0)}** (${nNegOf(s)} legitimate): ROC AUC **${a3(aucOf(s))}**, AP **${a3(apOf(s))}**. At this threshold the model raises **${c.fp}** false alarms.

The ROC curve barely moves: it divides false alarms by the number of negatives, so ${c.fp} false alarms out of ${nNegOf(s)} is an FPR of only ${pct(fpr(c))}. Precision divides by the number of *alerts*, so it feels every extra false alarm.`;
			},
			enter: (s) => {
				s.show.target = false;
				s.show.roc = true;
				s.show.matrix = false;
				s.ui.prev = true;
				s.thr = 0.5;
			},
			task: {
				prompt: 'Drag the **fraud rate** down to **2% or less**.',
				done: (s) => prevalenceOf(s) <= 0.02
			}
		},
		{
			title: 'The rosy ROC',
			body: (s) =>
				`Now fraud is **1%** of ${N_POS + nNegOf(s)} transactions and the ROC AUC is still **${a3(aucOf(s))}**, an "excellent" model by the usual rule of thumb. The team sets the threshold to catch **80% of fraud**.`,
			enter: (s) => {
				s.prev = RARE;
				s.ui.prev = false;
				s.show.matrix = true;
				s.thr = 0.5;
			},
			quiz: {
				question: 'At the threshold that catches 80% of fraud, roughly what share of the flagged transactions are actually fraud?',
				options: ['About 95%, matching the AUC', 'About 80%, matching the recall', 'Well under half'],
				answer: 2,
				explain: (s) => {
					const c = countsOf(s);
					return `It catches ${c.tp} of ${N_POS} frauds, but also flags **${c.fp}** legitimate transactions: an FPR of just ${pct(fpr(c))}, which looks great on the ROC plot. Precision is ${c.tp} / ${c.tp + c.fp} = **${pct(precision(c))}**: about ${Math.round((c.tp + c.fp) / Math.max(1, c.tp))} alerts per real fraud. AP (**${a3(apOf(s))}**) exposes this; ROC AUC hides it. On heavily [imbalanced data](concept:class-imbalance), look at the PR curve.`;
				},
				reveal: (s) => {
					s.thr = thrForRecall(s, 0.8);
				}
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap:

1. Each threshold gives one (recall, precision) point; sweeping it traces the **PR curve** from top-left to (1, prevalence).
2. A random model sits at the **prevalence**, not at 0.5. Report AP next to it.
3. **Average precision** = Σ (Rₙ − Rₙ₋₁) · Pₙ summarizes the curve.
4. On rare positives ROC stays rosy while PR shows the flood of false alarms. Use PR for fraud, anomaly detection ([Isolation Forest](concept:isolation-forest)), rare disease and search.

Pass scores to \`precision_recall_curve\`, never hard 0/1 predictions: those collapse the curve to a single point.`,
			enter: (s) => {
				s.prev = 1;
				s.sep = SEP;
				s.thr = 0.5;
				s.reached = 0;
				s.show = { pr: true, curve: 'full', baseline: true, ap: true, roc: true, matrix: true, target: false };
				s.ui = { ...off, drag: true, trace: true, prev: true, sep: true };
			}
		}
	]
};

export default explainer;
