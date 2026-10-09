/**
 * Guided explainer: log-loss (binary cross-entropy), confident mistakes, and calibration.
 */
import type { ExplainerModule } from '../types.ts';
import { pct, penalty } from '../_classification/metrics.ts';
import Scene from './Scene.svelte';
import { ar, fr } from './i18n.ts';
import { N, OVER, accOf, bestConf, binsOf, init, lossAt, lossOf, off, worstShare, type LLState } from './state.ts';

const f2 = (v: number) => v.toFixed(2);
const f3 = (v: number) => v.toFixed(3);

const explainer: ExplainerModule<LLState> = {
	title: 'Log-loss: the price of confident mistakes',
	init,
	Scene,
	i18n: { fr, ar },
	steps: [
		{
			title: 'Forecasts, not just labels',
			body: (s) =>
				`A weather model forecasts the **chance of rain** for ${2 * N} days. The top lane holds the ${N} days it actually rained, the bottom lane the ${N} dry days. Each dot sits at the probability the model gave to rain.

Call it "rain" whenever the forecast is at least 50% and the model is right on **${pct(accOf(s), 0)}** of days. But accuracy can't tell a confident 95% from a hesitant 51%. **Log-loss** scores the probability itself.`
		},
		{
			title: 'The penalty: −log(p)',
			body: (s) => `For each day, look at the probability the model gave to **what actually happened**, call it *p*: the forecast itself on a rainy day, 1 − forecast on a dry day. The penalty is

\`penalty = −log(p)\` (natural log)

- p = 1: penalty 0, a perfect, certain forecast.
- p = 0.5: penalty 0.69, a shrug.
- p = 0.1: penalty 2.30.
- p → 0: penalty → ∞.

Your probe: p = **${f3(s.p)}** → penalty **${f2(penalty(s.p))}**.`,
			enter: (s) => {
				s.show.curve = true;
				s.show.probe = true;
				s.ui.p = true;
			},
			task: {
				prompt: 'Drag the probe (or the slider) until the penalty is **above 4**. How sure of the wrong answer must the model be?',
				done: (s) => penalty(s.p) > 4
			}
		},
		{
			title: 'Confident and wrong',
			body: `Two forecasters both said rain, and it stayed dry. One said **60%**, so it gave 0.40 to what happened. The other said **99%**, giving just 0.01 to what happened.`,
			enter: (s) => {
				s.p = 0.4;
			},
			quiz: {
				question: 'How much bigger is the 99% forecaster\'s penalty?',
				options: ['About 1.6×', 'About 5×', 'About 50×'],
				answer: 1,
				explain: `−log(0.01) = **4.61** versus −log(0.40) = **0.92**: five times bigger. Logs grow slowly at first, then without limit: at p = 0.0001 the penalty is 9.2, and a forecast of exactly 0 would cost infinity. That's why libraries clip probabilities to [10⁻¹⁵, 1 − 10⁻¹⁵].`,
				reveal: (s) => {
					s.p2 = 0.4;
					s.p = 0.01;
				}
			}
		},
		{
			title: 'Log-loss is the average penalty',
			body: (s) => `Score every day and average:

\`LogLoss = −(1/n) Σ [ yᵢ·log(ŷᵢ) + (1 − yᵢ)·log(1 − ŷᵢ) ]\`

where ŷᵢ is the forecast and yᵢ is 1 on rainy days. Only one term is active per day, so this is the mean of −log(p). Lower is better; 0 is perfect.

Each day now sits on the penalty curve, and in the strip, **bigger dots cost more** (pink = forecast on the wrong side of 50%). This model: log-loss **${f3(lossOf(s))}**. The 10 worst days cause **${pct(worstShare(s), 0)}** of the total.`,
			enter: (s) => {
				s.p2 = null;
				s.show.probe = false;
				s.show.penalties = true;
				s.ui.p = false;
			}
		},
		{
			title: 'Turn up the confidence',
			body: (s) => {
				const best = bestConf();
				return `The **confidence** slider multiplies every forecast's log-odds by the same factor. Above ×1 forecasts are pushed toward 0% and 100%; below ×1 they're pulled toward 50%. No forecast ever crosses 50%, so **accuracy stays ${pct(accOf(s), 0)}** whatever you do.

Confidence **×${s.conf.toFixed(1)}** → log-loss **${f3(lossOf(s))}**.${Math.abs(lossOf(s) - best[1]) < 0.002 ? ` That's the minimum: the forecasts are as sure as the evidence allows.` : ''}`;
			},
			enter: (s) => {
				s.show.confCurve = true;
				s.ui.conf = true;
				s.conf = 2.5;
			},
			task: {
				prompt: 'Find the confidence with the **lowest log-loss** (use the slider or click the chart).',
				done: (s) => s.did.conf && lossOf(s) <= bestConf()[1] + 0.002
			}
		},
		{
			title: 'Same accuracy, different log-loss',
			body: (s) =>
				`Compare two models that make **exactly the same calls** (both ${pct(accOf(s), 0)} accurate). Model A forecasts like this one (confidence ×1). Model B stretches everything ×${OVER}: most of its forecasts are below 10% or above 90%.`,
			enter: (s) => {
				s.conf = 1;
				s.ui.conf = false;
			},
			quiz: {
				question: 'Which model has the lower log-loss?',
				options: ['Model A, the measured one', 'Model B, the confident one', 'They tie, since their accuracy is equal'],
				answer: 0,
				explain: () => {
					const a = lossAt(1);
					const b = lossAt(OVER);
					return `Model A: **${f3(a)}**. Model B: **${f3(b)}**, ${f2(b / a)}× worse. B's confident *right* answers save a little each, but its confident *wrong* answers cost a fortune (look at the huge pink dots, some at penalties above 10). Accuracy can't see the difference; log-loss can.`;
				},
				reveal: (s) => {
					s.conf = OVER;
				}
			}
		},
		{
			title: 'Calibration: does 70% mean 70%?',
			body: (s) => {
				const hi = binsOf(s)[9];
				return `A forecaster is **calibrated** if, among all the days it said "about 70%", it rains on about 70% of them. The **reliability diagram** groups forecasts into bins and plots how often it actually rained in each. Calibrated forecasts sit on the diagonal.

At ×${s.conf.toFixed(1)}: of the ${hi.n} days forecast 90–100%, it rained on **${pct(hi.freq, 0)}** (mean forecast ${pct(hi.meanP, 0)}). Over-confident models bend **flatter** than the diagonal, timid ones **steeper**.

Log-loss rewards calibration: it is lowest when the forecasts match reality.`;
			},
			enter: (s) => {
				s.show.reliability = true;
				s.show.curve = false;
				s.ui.conf = true;
			},
			task: {
				prompt: 'Try the **Over-confident** and **Timid** presets, then go back to **Calibrated**.',
				done: (s) => s.did.over && s.did.timid && s.conf === 1
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap:

1. Log-loss averages **−log(p)**, where p is the probability given to what actually happened.
2. The penalty is gentle near p = 1 and explodes as p → 0: **one confident mistake can dominate** the score.
3. Two models with the same accuracy can have very different log-loss; the **calibrated** one wins.
4. It's differentiable, which is why [logistic regression](concept:logistic-regression) and neural-network classifiers are *trained* by minimizing it.

[ROC-AUC](concept:roc-auc) only checks ranking and ignores calibration; log-loss checks both. Use \`sklearn.metrics.log_loss\` with probabilities from \`predict_proba\`, never hard labels.`,
			enter: (s) => {
				s.conf = 1;
				s.p = 0.8;
				s.show = { strip: true, curve: true, probe: true, penalties: true, confCurve: true, reliability: true };
				s.ui = { ...off, p: true, conf: true };
			}
		}
	]
};

export default explainer;
