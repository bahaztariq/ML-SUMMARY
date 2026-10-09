/**
 * Guided explainer: precision, recall, the trade-off between them, and why F1 uses the harmonic mean.
 */
import type { ExplainerModule } from '../types.ts';
import { arithmeticMean, fbeta, harmonicMean, pct, precision, recall } from '../_classification/metrics.ts';
import Scene from './Scene.svelte';
import { ar, fr } from './i18n.ts';
import { N_NEG, N_POS, TARGET_RECALL, TOP_SCORE, bestAtTarget, bestF, countsOf, init, off, setThr, type PRState } from './state.ts';

const t2 = (v: number) => v.toFixed(2);

const explainer: ExplainerModule<PRState> = {
	title: 'Precision, recall and the F1 balance',
	init,
	Scene,
	i18n: { fr, ar },
	steps: [
		{
			title: 'Two questions about a "yes"',
			body: (s) => {
				const c = countsOf(s);
				return `A camera on an assembly line scores **${N_POS + N_NEG} parts**; **${N_POS}** of them are actually defective (top lane). Parts scoring at or above the threshold get pulled off the line.

At threshold **${t2(s.thr)}** the model pulls **${c.tp + c.fp}** parts. Two different questions judge that decision:

- Of the parts we pulled, how many were really defective? That is **precision**.
- Of the defective parts, how many did we pull? That is **recall**.`;
			},
			enter: (s) => {
				s.ui.drag = true;
			}
		},
		{
			title: 'Precision: can you trust a flag?',
			body: (s) => {
				const c = countsOf(s);
				return `Precision only looks at the **predicted-positive** column, the parts right of the line:

\`precision = TP / (TP + FP)\` = ${c.tp} / (${c.tp} + ${c.fp}) = **${pct(precision(c))}**

Low precision means many **false alarms**: workers waste time inspecting good parts. Precision ignores the defective parts that slipped through.`;
			},
			enter: (s) => {
				s.focus = 'precision';
			}
		},
		{
			title: 'Recall: how many did you catch?',
			body: (s) => {
				const c = countsOf(s);
				return `Recall only looks at the **actually-positive** row, the top lane:

\`recall = TP / (TP + FN)\` = ${c.tp} / (${c.tp} + ${c.fn}) = **${pct(recall(c))}**

Low recall means **missed cases**: defective parts shipped to customers. Recall ignores how many good parts we pulled by mistake. It's also called *sensitivity* or the *true positive rate*.`;
			},
			enter: (s) => {
				s.focus = 'recall';
			}
		},
		{
			title: 'The trade-off',
			body: (s) => {
				const c = countsOf(s);
				return `Lowering the threshold pulls more parts: recall can only go **up**, but more good parts get caught too, so precision usually goes **down**. Raising it does the opposite. The chart tracks both as the threshold moves.

Now: precision **${pct(precision(c))}**, recall **${pct(recall(c))}**. Precision's line is jagged: each good part that crosses the line knocks it down a little.`;
			},
			enter: (s) => {
				s.focus = null;
				s.show.curves = true;
			},
			task: {
				prompt: 'Drag the threshold to both ends: **below 0.10** and **above 0.90**. Which metric suffers at each end?',
				done: (s) => s.did.low && s.did.high
			}
		},
		{
			title: 'Flag almost everything',
			body: `A nervous manager says: "Never ship a defect. Pull every part that scores above 0.02." Recall will be close to 100%.`,
			enter: (s) => {
				s.thr = 0.5;
			},
			quiz: {
				question: 'What happens to precision at threshold 0.02?',
				options: [
					'It stays high, because the model is still the same',
					`It drops to about ${Math.round((N_POS / (N_POS + N_NEG)) * 100)}%, the share of parts that are defective`,
					'It drops to 0%',
					'It is undefined'
				],
				answer: 1,
				explain: (s) => {
					const c = countsOf(s);
					return `Pulling almost every part catches all ${c.tp} defective ones (recall **${pct(recall(c))}**), but also ${c.fp} good ones. Precision is ${c.tp} / ${c.tp + c.fp} = **${pct(precision(c))}**: barely better than picking parts at random, which would score the defect rate, ${pct(N_POS / (N_POS + N_NEG))}. Either metric alone is easy to game.`;
				},
				reveal: (s) => {
					s.thr = 0.02;
				}
			}
		},
		{
			title: 'One number: why not just average?',
			body: (s) => {
				const c = countsOf(s);
				const p = precision(c);
				const r = recall(c);
				return `To rank models we want one score that is high only when **both** are high. The obvious choice, the average (P + R) / 2, fails that test.

**F1** uses the **harmonic mean** instead: \`F1 = 2·P·R / (P + R)\`. It is dragged toward the *smaller* of the two. Here: arithmetic mean **${pct(arithmeticMean(p, r))}**, F1 **${pct(harmonicMean(p, r))}**.`;
			},
			enter: (s) => {
				s.show.means = true;
				s.thr = 0.5;
			},
			quiz: {
				question: 'A lazy model pulls only the single most suspicious part, and it is defective: precision 100%, recall 2.5%. What is its F1?',
				options: ['About 51%, the average', 'About 5%', 'Exactly 2.5%', '100%'],
				answer: 1,
				explain: (s) => {
					const c = countsOf(s);
					const p = precision(c);
					const r = recall(c);
					return `F1 = 2 × ${p.toFixed(2)} × ${r.toFixed(3)} / (${p.toFixed(2)} + ${r.toFixed(3)}) = **${pct(harmonicMean(p, r))}**. The average would say **${pct(arithmeticMean(p, r))}**, as if this model were half-decent. The harmonic mean stays near the weaker score (a bit above it), so neither metric can carry the other.`;
				},
				reveal: (s) => {
					s.thr = TOP_SCORE;
				}
			}
		},
		{
			title: 'F1 across thresholds',
			body: (s) => {
				const c = countsOf(s);
				const b = bestF(1);
				const at = fbeta(c, 1);
				return `The green line is F1 at every threshold. It is low at both ends, where one of precision or recall collapses, and peaks where they are balanced.

Now: F1 **${pct(at)}** at threshold ${t2(s.thr)}. ${at >= b.f - 0.005 ? `That's the peak: **${pct(b.f)}**.` : ''}`;
			},
			enter: (s) => {
				s.show.means = false;
				s.show.f = true;
				s.thr = 0.2;
			},
			task: {
				prompt: 'Find the threshold that **maximizes F1** (drag the line, or click the chart).',
				done: (s) => fbeta(countsOf(s), 1) >= bestF(1).f - 0.005
			}
		},
		{
			title: 'Hit a recall target',
			body: (s) => {
				const c = countsOf(s);
				const r = recall(c);
				const ok = r >= TARGET_RECALL;
				const b = bestAtTarget();
				return `Real projects rarely maximize F1. They set a **requirement**: "catch at least ${pct(TARGET_RECALL, 0)} of defects" (the dashed line), then want the **best precision** that still meets it.

Recall **${pct(r)}** ${ok ? '✓' : `(below ${pct(TARGET_RECALL, 0)})`}, precision **${pct(precision(c))}**.${ok && precision(c) >= b.precision - 1e-9 ? ` That's the best possible here: lower the threshold any further and you only add false alarms.` : ''}

Tune this on a validation set, never the test set.`;
			},
			enter: (s) => {
				s.show.f = false;
				s.show.target = true;
				s.thr = 0.7;
			},
			task: {
				prompt: `Reach **recall ≥ ${pct(TARGET_RECALL, 0)}** with the **highest precision** you can.`,
				done: (s) => {
					const c = countsOf(s);
					return recall(c) >= TARGET_RECALL && precision(c) >= bestAtTarget().precision - 1e-9;
				}
			}
		},
		{
			title: 'F-beta: when one error matters more',
			body: (s) => {
				const b = bestF(s.beta);
				return `F1 treats precision and recall as equally important. **F-beta** lets recall count **β times** as much:

\`Fβ = (1 + β²)·P·R / (β²·P + R)\`

β = 2 suits screening, where a miss is worse; β = 0.5 suits a spam filter, where a false alarm is worse. With β = **${s.beta}** the best threshold is **${t2(b.thr)}** (Fβ = ${pct(b.f)}).`;
			},
			enter: (s) => {
				s.show.target = false;
				s.show.f = true;
				s.ui.beta = true;
				s.thr = bestF(1).thr;
			},
			task: {
				prompt: 'Switch **β** to 2 and then 0.5. Which way does the best threshold move each time?',
				done: (s) => s.beta === 0.5
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap:

1. **Precision** = TP / (TP + FP): how trustworthy a positive prediction is.
2. **Recall** = TP / (TP + FN): how many real positives you catch.
3. Moving the threshold trades one for the other; a better model shifts the whole trade-off.
4. **F1** is their harmonic mean, so it is only high when both are; **Fβ** tilts it toward recall (β > 1) or precision (β < 1).

Neither metric uses true negatives. To compare models over *all* thresholds, see the [PR curve](concept:pr-curve) and [ROC-AUC](concept:roc-auc). The Metrics Lab (under Tools) computes all of these from any four counts.`,
			enter: (s) => {
				s.show = { curves: true, f: true, means: true, target: true };
				s.ui = { ...off, drag: true, beta: true };
				s.beta = 1;
				setThr(s, 0.5);
			}
		}
	]
};

export default explainer;
