/**
 * Guided explainer: the ROC curve (traced threshold by threshold) and AUC as a ranking probability.
 */
import type { ExplainerModule } from '../types.ts';
import { pct } from '../_classification/metrics.ts';
import Scene from './Scene.svelte';
import { ar, fr } from './i18n.ts';
import { N_NEG, N_POS, PERFECT_SEP, SEP, aucOf, init, off, ratesOf, startTrace, traced, wins, type ROCState } from './state.ts';

const t2 = (v: number) => v.toFixed(2);
const a3 = (v: number) => v.toFixed(3);

const explainer: ExplainerModule<ROCState> = {
	title: 'ROC curves and AUC',
	init,
	Scene,
	i18n: { fr, ar },
	steps: [
		{
			title: 'Two rates, one per lane',
			body: (s) => {
				const { c, tpr, fpr } = ratesOf(s);
				return `A model scores **${N_POS + N_NEG} loan applications**: ${N_POS} that later defaulted (positive, top lane) and ${N_NEG} that were repaid. Applications at or above the threshold get flagged.

ROC analysis tracks two rates, each measured **within its own lane**:

- **True positive rate** \`TPR = TP / (TP + FN)\`: share of defaulters flagged. ${c.tp} / ${N_POS} = **${pct(tpr)}**. (Same thing as recall.)
- **False positive rate** \`FPR = FP / (FP + TN)\`: share of good applicants wrongly flagged. ${c.fp} / ${N_NEG} = **${pct(fpr)}**.`;
			},
			enter: (s) => {
				s.ui.drag = true;
			}
		},
		{
			title: 'One threshold, one point',
			body: (s) => {
				const { tpr, fpr } = ratesOf(s);
				return `Plot the pair as a point: FPR across, TPR up. At threshold **${t2(s.thr)}** the point sits at (${fpr.toFixed(2)}, ${tpr.toFixed(2)}).

A good operating point is **high and to the left**: catches many positives while bothering few negatives.`;
			},
			enter: (s) => {
				s.show.roc = true;
			},
			task: {
				prompt: 'Drag the threshold and watch the point move. Which way does it go when you **lower** the threshold?',
				done: (s) => s.did.drag
			}
		},
		{
			title: 'Sweep the threshold: trace the curve',
			body: (s) => {
				const { c } = ratesOf(s);
				return `Now sweep the threshold from 1 down to 0 and leave a trail. Every time it passes a **defaulter** the trail steps **up** (TPR + 1/${N_POS}); every time it passes a **good applicant** it steps **right** (FPR + 1/${N_NEG}).

That trail is the **ROC curve** (Receiver Operating Characteristic): every operating point the model can offer. Passed so far: ${c.tp} defaulters, ${c.fp} good applicants.`;
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
			title: 'Reading the plot',
			body: `Every ROC curve runs from **(0, 0)**, a threshold above every score (nothing flagged), to **(1, 1)**, a threshold below every score (everything flagged).

The dashed **diagonal** is a model that guesses at random: it flags positives and negatives at the same rate. The further the curve bows toward the **top-left corner**, the better the model separates the classes.`,
			enter: (s) => {
				s.show.curve = 'full';
				s.show.corners = true;
				s.ui.trace = false;
				s.thr = 0.5;
			},
			quiz: {
				question: 'What does the ROC curve of a perfect model look like?',
				options: [
					'The diagonal from (0, 0) to (1, 1)',
					'Straight up the left edge to (0, 1), then along the top',
					'Along the bottom to (1, 0), then up the right edge',
					'A single point at (0.5, 0.5)'
				],
				answer: 1,
				explain: `When every positive scores above every negative, sweeping the threshold down passes **all positives first**: the curve shoots straight up to TPR = 1 before FPR moves at all, then runs along the top. Some threshold gives 100% TPR at 0% FPR.`,
				reveal: (s) => {
					s.sep = PERFECT_SEP;
				}
			}
		},
		{
			title: 'AUC: area under the curve',
			body: (s) => {
				const a = aucOf(s);
				return `To summarize the whole curve in one number, take the **area under it**: the **AUC**. A perfect model scores 1.0, random guessing 0.5 (the triangle under the diagonal).

This model: **AUC = ${a3(a)}**. A common rule of thumb: above 0.9 excellent, 0.8–0.9 good, 0.7–0.8 fair, below 0.7 poor. Note that AUC judges the model **across all thresholds**: it doesn't tell you which one to deploy.`;
			},
			enter: (s) => {
				s.sep = SEP;
				s.show.corners = false;
				s.show.area = true;
			}
		},
		{
			title: 'AUC is a ranking probability',
			body: (s) => {
				const w = wins(s);
				return `AUC has a surprisingly concrete meaning: pick one **random defaulter** and one **random good applicant**. AUC is the probability that the model gives the defaulter the **higher score** (ties count half).

Each draw links the pair in the strip: green if ranked correctly, pink if not. ${s.pairs ? `So far **${w} of ${s.pairs}** pairs ranked correctly = **${pct(w / s.pairs)}**, versus AUC **${pct(aucOf(s))}**.` : 'Draw some pairs.'}

Checking all ${N_POS} × ${N_NEG} = ${N_POS * N_NEG} pairs gives the AUC exactly (it is the Mann–Whitney U statistic, rescaled).`;
			},
			enter: (s) => {
				s.show.pairs = true;
				s.ui.pairs = true;
			},
			task: {
				prompt: 'Draw at least **500 pairs** and watch the running estimate settle on the AUC.',
				done: (s) => s.pairs >= 500
			}
		},
		{
			title: 'Separability drives AUC',
			body: (s) => {
				const a = aucOf(s);
				return `AUC only depends on how much the two score distributions **overlap**. Use the **separation** slider: at 0 the model's scores carry no information about the class, the curve hugs the diagonal and AUC ≈ 0.5; pull the classes apart and the curve bows toward the corner.

Separation **${s.sep.toFixed(1)} σ** → AUC **${a3(a)}**.`;
			},
			enter: (s) => {
				s.show.pairs = false;
				s.ui.pairs = false;
				s.pairs = 0;
				s.ui.sep = true;
			},
			task: {
				prompt: 'Find a separation with **AUC ≤ 0.55** (coin flip) and one with **AUC ≥ 0.99** (near perfect).',
				done: (s) => s.did.low && s.did.high
			}
		},
		{
			title: 'Only the ranking matters',
			body: `Let's tamper with the scores: replace every score by its **cube** (0.8 → 0.51, 0.5 → 0.13). The probabilities change a lot, and threshold 0.5 now means something completely different.`,
			enter: (s) => {
				s.sep = SEP;
				s.ui.sep = false;
				s.thr = 0.5;
			},
			quiz: {
				question: 'What happens to the ROC curve and AUC after cubing every score?',
				options: ['AUC drops: the scores got smaller', 'Nothing: same curve, same AUC', 'AUC rises: the classes look further apart'],
				answer: 1,
				explain: (s) =>
					`Cubing never changes which of two scores is larger, so every pair is ranked the same way and the sweep passes the points in the same order: identical curve, AUC still **${a3(aucOf(s))}**. Only the threshold *labels* along the curve moved. So AUC says nothing about whether the probabilities are trustworthy; [log-loss](concept:log-loss) does.`,
				reveal: (s) => {
					s.warp = 3;
				}
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap:

1. **TPR** = TP / all positives, **FPR** = FP / all negatives. One threshold gives one (FPR, TPR) point.
2. Sweeping the threshold traces the **ROC curve** from (0, 0) to (1, 1).
3. **AUC** = area under it = the chance a random positive outranks a random negative. 0.5 is random, 1.0 perfect.
4. AUC only cares about **ranking**, not calibrated probabilities, and not which threshold you deploy.

Because both rates are normalized within each class, ROC can look rosy when positives are very rare. The [precision-recall curve](concept:pr-curve) exposes that.`,
			enter: (s) => {
				s.warp = 1;
				s.sep = SEP;
				s.thr = 0.5;
				s.reached = 0;
				s.show = { roc: true, curve: 'full', area: true, corners: false, pairs: true };
				s.ui = { ...off, drag: true, trace: true, pairs: true, sep: true, warp: true };
			}
		}
	]
};

export default explainer;
