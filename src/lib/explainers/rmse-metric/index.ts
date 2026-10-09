/**
 * Guided explainer: Root Mean Squared Error, step by step.
 */
import { fmt } from '#lib/viz/canvas.ts';
import type { ExplainerModule } from '../types.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import { B, BASE, EQUAL, QUIZ_OUT, RATIO_TARGET, SHARE_TARGET, WORST, big, signed } from './narration.ts';
import { euro } from '../_regression/plot.ts';
import { MODEL, OUT, equalErrors, init, metrics, noMetrics, off, resetRents, setOutlier, type ErrState } from './state.ts';

const explainer: ExplainerModule<ErrState> = {
	title: 'How RMSE measures prediction error',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Predictions vs reality',
			body: `A rent model trained earlier predicts \`ŷ = ${MODEL.w}·size + ${MODEL.b}\` (green line). Here it meets **10 flats it has never seen**.

For each flat the **residual** is actual minus predicted rent, \`y − ŷ\` (red segments, and the bars below). The ${BASE.xs[WORST]} m² flat rents for ${euro(BASE.ys[WORST])} but the model said ${euro(BASE.ys[WORST] - B.r[WORST])}: a residual of **${signed(B.r[WORST])}**.

We want **one number** that says how far off the model typically is.`,
			enter: (s) => {
				s.bars = 'residual';
			}
		},
		{
			title: 'Why not just average them?',
			body: `The simplest idea: average the ten residuals. Look at the bars: some point up (the model guessed too low), some down (too high).`,
			quiz: {
				question: `The residuals range from ${signed(Math.min(...B.r))} to ${signed(Math.max(...B.r))}. What is their average?`,
				options: ['About €85: the typical size of a miss', `About ${signed(B.meanRes)}: ups and downs cancel out`, 'Exactly €0, for any model'],
				answer: 1,
				explain: `The average residual is only **${signed(B.meanRes)}**, yet the model is often off by €100 or more. Positive and negative misses **cancel**. The average residual tells you about *bias* (guessing too high or too low on average), not about the size of the errors. We must get rid of the sign first: take absolute values ([MAE](concept:mae-metric)) or **square** them (next).`,
				reveal: (s) => {
					s.show.meanLine = true;
					s.show.meanRes = true;
				}
			}
		},
		{
			title: 'Square every residual',
			body: (s) => {
				const m = metrics(s);
				return `Squaring makes every error positive, and it makes **big errors count much more**: a miss of €30 becomes 900, but the ${signed(B.r[WORST])} miss becomes **${big(B.r[WORST] ** 2)}**. On the scatter, each square's area is that flat's squared error.

The average of the squares is the **mean squared error**: **MSE = ${big(m.mse)}**. But in what unit? Euros × euros, "€²". Nobody can picture ${big(m.mse)} square euros.`;
			},
			enter: (s) => {
				s.show = { ...s.show, ...noMetrics, mse: true, squares: true, meanLine: true };
				s.bars = 'squared';
			}
		},
		{
			title: 'Back to euros: the square root',
			body: (s) => {
				const m = metrics(s);
				return `Take the square root of the MSE and you're back in the target's unit:

\`RMSE = √( (1/n)·Σ(y − ŷ)² ) = √${big(m.mse)} ≈ ${euro(m.rmse)}\`

So the model's predictions are typically about **${euro(m.rmse)}** off. The shaded band is the model ± one RMSE: most flats land inside it.

It's the same unit as rent, so you can tell a stakeholder "about ${euro(m.rmse)} a month" and they know what it means.`;
			},
			enter: (s) => {
				s.show.rmse = true;
				s.show.band = true;
			}
		},
		{
			title: 'Big misses dominate',
			body: (s) => {
				const m = metrics(s);
				return `Because of the squaring, RMSE listens most to the **largest** errors. Right now the flat with the biggest miss accounts for **${Math.round(m.topShareSq * 100)}%** of all the squared error on its own; RMSE is **${euro(m.rmse)}**.`;
			},
			enter: (s) => {
				s.ui = { ...off, drag: true };
				s.show.share = true;
				s.show.band = false;
			},
			task: {
				prompt: `Drag one flat until it accounts for more than **two-thirds** of the total squared error. Watch its square grow.`,
				done: (s) => metrics(s).topShareSq > SHARE_TARGET
			}
		},
		{
			title: 'One outlier',
			body: `Back to the original rents. Now suppose one flat (the ${BASE.xs[OUT]} m² one) is actually a luxury penthouse renting for **€${QUIZ_OUT} more** than its neighbours. The model, which only sees size, can't know.`,
			enter: (s) => {
				s.ui = { ...off };
				resetRents(s);
				s.show = { ...s.show, share: false, band: true };
			},
			quiz: {
				question: `RMSE is ${euro(B.rmse)} now. Only 1 of the 10 flats changes. What will RMSE be?`,
				options: [`About ${euro(B.rmse + 15)}: it's only one flat in ten`, `About ${euro(B.rmse + 80)}`, 'About €270: more than double'],
				answer: 2,
				explain: (s) => {
					const m = metrics(s);
					return `RMSE jumps from ${euro(B.rmse)} to **${euro(m.rmse)}**. That one flat's squared error is ${big(m.sq[OUT])}, about **${Math.round(m.outShareSq * 100)}%** of the total. For comparison, the [MAE](concept:mae-metric) (average *absolute* error) only rises from ${euro(B.mae)} to **${euro(m.mae)}**.`;
				},
				reveal: (s) => {
					setOutlier(s, QUIZ_OUT);
					s.show.mae = true;
				}
			}
		},
		{
			title: 'RMSE vs MAE',
			body: (s) => {
				const m = metrics(s);
				return `Track both metrics together. **RMSE ≥ MAE** always, and the gap tells you something: when RMSE is much bigger than MAE, a few large errors dominate.

Outlier +€${s.outlier}: MAE **${euro(m.mae)}**, RMSE **${euro(m.rmse)}**, ratio **${fmt(m.ratio)}**.

Which one to report? RMSE when a big miss really is worse than several small ones (a €1,000 mistake hurts more than ten €100 ones). MAE when every euro of error costs the same, or the data has outliers you don't want to dominate.`;
			},
			enter: (s) => {
				s.ui = { ...off, outlier: true };
				resetRents(s);
				s.bars = 'share';
				s.show = { ...s.show, mae: true, rmse: true, mse: false, ratio: true, band: false };
			},
			task: {
				prompt: `Slide the outlier until RMSE is at least **${RATIO_TARGET}×** the MAE.`,
				done: (s) => metrics(s).ratio >= RATIO_TARGET
			}
		},
		{
			title: 'When are they equal?',
			body: `RMSE squares, averages, then takes the root. MAE just averages the sizes. On real data RMSE comes out larger. Can it ever match MAE exactly?`,
			enter: (s) => {
				s.ui = { ...off };
				resetRents(s);
				s.bars = 'squared';
				s.show = { ...s.show, mae: true, rmse: true, ratio: true, squares: true };
			},
			quiz: {
				question: 'When is RMSE exactly equal to MAE?',
				options: ['Only when every error is zero', 'Whenever every error has the same size', 'Never: RMSE is always strictly larger'],
				answer: 1,
				explain: (s) => {
					const m = metrics(s);
					return `If every flat is off by exactly €${EQUAL} (up or down), every square is the same and both metrics give **${euro(m.rmse)}** (ratio ${fmt(m.ratio)}). The more *uneven* the errors, the further RMSE rises above MAE.`;
				},
				reveal: (s) => equalErrors(s, EQUAL)
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked: drag flats, add the outlier, switch charts. Recap:

1. Residual = \`y − ŷ\`. Averaging residuals lets ups and downs cancel.
2. **Square** them (MSE): always positive, big misses weigh more.
3. **Square root** (RMSE): back to the target's unit.
4. RMSE ≥ MAE; a big gap means a few large errors dominate.
5. RMSE is what least squares (like [linear regression](concept:linear-regression)) minimizes. Use [R²](concept:r2-score) to compare against a do-nothing baseline.

In scikit-learn: \`root_mean_squared_error(y, y_pred)\` (or \`np.sqrt(mean_squared_error(...))\`).`,
			enter: (s) => {
				s.ui = { drag: true, dragC: false, outlier: true, bars: true, mode: false, reset: true };
				resetRents(s);
				s.bars = 'squared';
				s.show = { ...s.show, squares: true, meanLine: true, band: true, mae: true, mse: true, rmse: true, ratio: true, meanRes: false, share: false };
				s.did.drag = true;
			}
		}
	]
};

export default explainer;

export const _internals = { SHARE_TARGET, RATIO_TARGET, QUIZ_OUT, EQUAL };
