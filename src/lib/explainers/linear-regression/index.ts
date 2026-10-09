/**
 * Guided explainer: fitting a line by least squares, then regularizing a polynomial fit.
 */
import { fmt } from '#lib/viz/canvas.ts';
import type { ExplainerModule } from '../types.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import { CLEAN_FIT, CLEAN_MSE, COEF_TARGET, HAND_TARGET, MEAN_X, MEAN_Y, big, lineEq } from './narration.ts';
import * as rg from '../_regression/regression.ts';
import { euro } from '../_regression/plot.ts';
import {
	LANDSCAPE_TOL,
	OUTLIER,
	START_LINE,
	best,
	bestMse,
	currentMse,
	fit,
	fmtAlpha,
	init,
	maxCoef,
	mseRatio,
	off,
	polyFit,
	polyTrainMse,
	resetData,
	setOutlier,
	zeros,
	type LRState
} from './state.ts';

const explainer: ExplainerModule<LRState> = {
	title: 'How linear regression fits a line',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'A line through a cloud',
			body: `Each dot is an apartment: its **size** in m² and its monthly **rent** in €. Bigger flats cost more, roughly along a straight line.

Linear regression predicts with exactly such a line:

\`ŷ = w·x + b\`

The **slope** \`w\` is the extra rent per extra m². The **intercept** \`b\` is where the line crosses size 0. The blue line, \`${lineEq(START_LINE)}\`, is a first guess, and it's clearly too flat. How do we measure *how* wrong it is, and find the best line?`,
			enter: (s) => {
				s.line = { ...START_LINE };
			}
		},
		{
			title: 'Residuals and the MSE',
			body: (s) => `The red segments are **residuals**: actual rent minus predicted rent, \`y − ŷ\`, for each flat.

To score the whole line we **square** each residual (so misses above and below both count, and big misses count a lot) and **average** them. That's the **mean squared error**:

\`MSE = (1/n)·Σ(y − ŷ)²\`

Right now **MSE = ${big(currentMse(s))}** (in €², so its square root, the [RMSE](concept:rmse-metric) of **${euro(Math.sqrt(currentMse(s)))}**, is easier to read).`,
			enter: (s) => {
				s.show.residuals = true;
				s.ui.handles = true;
			},
			task: {
				prompt: `Drag the two round handles on the line until the MSE drops below **${big(HAND_TARGET)}**.`,
				done: (s) => currentMse(s) < HAND_TARGET
			}
		},
		{
			title: 'The MSE landscape',
			body: (s) => `Every line is just a pair of numbers (w, b), so we can draw **all possible lines at once**. In the landscape chart, each spot is one line, shaded by its MSE: the deeper the colour, the lower the error. The pink dot is your current line.

For a line, MSE is a smooth **bowl** with exactly one bottom, so there is a single best line and no traps. The valley is a long tilted diagonal: a steeper slope with a lower intercept fits almost as well.

${mseRatio(s) < LANDSCAPE_TOL ? `**Near the bottom:** MSE ${big(currentMse(s))}, the lowest possible is ${big(bestMse(s))}.` : `Your line's MSE is **${fmt((mseRatio(s) - 1) * 100, 0)}%** above the lowest possible.`}`,
			enter: (s) => {
				s.show.landscape = true;
				s.ui.landscape = true;
			},
			task: {
				prompt: 'Click or drag on the landscape to get within **10%** of the lowest MSE. Aim for the deepest-coloured band.',
				done: (s) => mseRatio(s) < LANDSCAPE_TOL
			}
		},
		{
			title: 'Least squares, solved exactly',
			body: (s) => {
				const f = best(s);
				return `No searching needed: for a line, the bottom of the bowl has a formula. **Ordinary least squares** (OLS) sets the slope of the bowl to zero and solves:

\`w = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²\`, \`b = ȳ − w·x̄\`

On this data that gives \`${lineEq(f)}\`: each extra m² adds about **€${fmt(f.w)}** a month. The best line always passes through the average point (x̄ = ${fmt(rg.mean(s.xs), 1)} m², ȳ = ${euro(rg.mean(s.ys))}).

With many features the same idea becomes the normal equation \`w = (XᵀX)⁻¹Xᵀy\`, or [gradient descent](concept:what-is-gradient-descent) when the data is huge. Now **drag the data**: the fit recomputes instantly.`;
			},
			enter: (s) => {
				s.show.landscape = false;
				s.ui = { ...off, dragPoints: true };
				s.autoFit = true;
				fit(s);
			},
			task: {
				prompt: `Drag a single point to pull the slope below **€9 per m²**. Try a flat near the middle (${fmt(MEAN_X, 0)} m²) first, then one at either end.`,
				done: (s) => s.line.w < 9
			}
		},
		{
			title: 'One bad row',
			body: `Least squares squares every residual, so the biggest misses dominate the score. That makes it very sensitive to **outliers**.

Suppose one more flat sneaks in: **${OUTLIER.x} m²** with its rent typed as **€${OUTLIER.y}** instead of €1,500.`,
			enter: (s) => {
				s.ui = { ...off };
				s.autoFit = true;
				resetData(s);
			},
			quiz: {
				question: `That's 1 row out of 31. What happens to the fitted slope (now €${fmt(CLEAN_FIT.w)} per m²)?`,
				options: [
					'Barely changes: one row is only about 3% of the data',
					'Drops noticeably, to around €8 per m²',
					'Turns negative: bigger flats now look cheaper'
				],
				answer: 1,
				explain: (s) => {
					const f = best(s);
					const miss = rg.lineAt(f, OUTLIER.x) - OUTLIER.y;
					return `The slope falls from **€${fmt(CLEAN_FIT.w)}** to **€${fmt(f.w)}** per m² (dashed line = before). The typo's residual is about ${euro(miss)}, and squared that is **${big(miss ** 2)}**, more than the other 30 squared residuals put together. Tilting the line toward it is the cheapest way to cut the total. Fix bad rows, or use a loss that grows more slowly, like [MAE](concept:mae-metric) or Huber. Toggle the typo with the button below.`;
				},
				reveal: (s) => {
					s.ghost = { ...s.line };
					setOutlier(s, true);
					s.ui.outlier = true;
				}
			}
		},
		{
			title: 'Curves: add polynomial features',
			body: (s) => {
				const f = polyFit(s);
				return `A new data set: 12 noisy samples of a curved relationship. A straight line can't follow it.

The trick: add **x², x³, …** as extra features. The model \`ŷ = b + w₁x + w₂x² + … + w_d·x^d\` is still *linear regression*: it's linear in the weights, and least squares solves it the same way.

Degree **${s.degree}**: training MSE **${fmt(polyTrainMse(s, f), 4)}**, largest weight **${fmt(maxCoef(f), 1)}**. The bars below show every weight.`;
			},
			enter: (s) => {
				s.ui = { ...off, degree: true };
				s.ghost = null;
				setOutlier(s, false);
				s.view = 'poly';
				s.degree = 1;
				s.penalty = 'none';
			},
			task: {
				prompt: 'Raise the degree to **9**. The curve hugs the points, but look at the size of the weights.',
				done: (s) => s.degree >= 9
			}
		},
		{
			title: 'Ridge: a price on big weights',
			body: (s) => {
				const f = polyFit(s);
				return `Huge weights that cancel each other out are a sign of [overfitting](concept:overfitting-underfitting): the curve bends to chase noise (compare it with the dashed **true curve**).

**Ridge** regression adds a penalty on the size of the weights:

\`minimize Σ(y − ŷ)² + α·Σwⱼ²\`

A bigger **α** pulls every weight toward zero. Now α = **${fmtAlpha(s.logAlpha)}**, largest |w| = **${fmt(maxCoef(f), 2)}**, training MSE = **${fmt(polyTrainMse(s, f), 4)}**. Training error rises a little, but the curve gets calmer. (The penalty depends on feature size, so [scale your features](concept:feature-scaling) first; here x already lies in [−1, 1].)`;
			},
			enter: (s) => {
				s.ui = { ...off, alpha: true };
				s.degree = 9;
				s.penalty = 'ridge';
				s.logAlpha = -8;
				s.show.truth = true;
			},
			task: {
				prompt: `Raise α until every weight is smaller than **${COEF_TARGET}** in size.`,
				done: (s) => s.view === 'poly' && s.penalty === 'ridge' && maxCoef(polyFit(s)) < COEF_TARGET
			}
		},
		{
			title: 'Lasso: some weights hit zero',
			body: (s) => `Ridge at α = ${fmtAlpha(s.logAlpha)} keeps all ${s.degree} weights, just smaller. **Lasso** changes the penalty from squares to absolute values:

\`minimize (1/2n)·Σ(y − ŷ)² + α·Σ|wⱼ|\``,
			enter: (s) => {
				s.ui = { ...off };
				s.degree = 9;
				s.penalty = 'ridge';
				s.logAlpha = -2.5;
				s.show.truth = true;
			},
			quiz: {
				question: 'What does the L1 penalty do to the 9 weights?',
				options: [
					'Shrinks them all by the same factor, like Ridge',
					'Sets several of them to exactly zero and shrinks the rest',
					'Makes them larger, since |w| is smaller than w² for big weights'
				],
				answer: 1,
				explain: (s) => {
					const f = polyFit(s);
					return `With Lasso, **${zeros(f)} of ${s.degree}** weights are now exactly 0 (shown as "0" in the chart). The |w| penalty keeps pulling with the same force even when a weight is tiny, so weak features get switched off completely: built-in [feature selection](concept:feature-selection). Ridge's w² penalty fades near zero, so it only shrinks. More in [L1 vs L2 regularization](concept:regularization-l1-l2). Try the α slider.`;
				},
				reveal: (s) => {
					s.penalty = 'lasso';
					s.ui.alpha = true;
				}
			}
		},
		{
			title: 'Beyond the data',
			body: `Back to plain least squares at degree 9. Every training point lies between x = −0.95 and 0.95, and the fit looks fine there.

But a model only knows the range it was trained on. Predicting outside it is called **extrapolation**.`,
			enter: (s) => {
				s.ui = { ...off };
				s.degree = 9;
				s.penalty = 'none';
				s.wide = false;
				s.show.truth = true;
			},
			quiz: {
				question: 'What does this degree-9 fit predict at x = 1.3, just past the data? (The true curve gives about −0.8.)',
				options: ['Something near −0.8: it follows the curve closely', 'A wild value far off the chart', 'Exactly 0, since there is no data there'],
				answer: 1,
				explain: (s) => {
					const v = rg.evalPoly(polyFit(s), 1.3);
					const cubic = rg.evalPoly(rg.fitPoly(s.px.slice(), s.py.slice(), 3), 1.3);
					return `It predicts **${fmt(v, 0)}**. High powers like x⁹ explode as soon as |x| > 1, and nothing in the training data held them back. Even a sensible cubic predicts **${fmt(cubic, 1)}** there. Straight lines extrapolate more gently but still blindly: our rent line would happily price a 400 m² penthouse at ${euro(rg.lineAt(CLEAN_FIT, 400))}. Trust a regression only inside the range of its data.`;
				},
				reveal: (s) => {
					s.wide = true;
					s.ui.range = true;
				}
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap:

1. Linear regression predicts \`ŷ = w·x + b\` (plus more weights for more features).
2. It picks the weights that minimize the **MSE**, the average squared residual. For lines that's a bowl with one bottom, solved exactly by least squares.
3. Squaring makes it **sensitive to outliers**: check your data.
4. Polynomial features bend the fit; **Ridge** shrinks weights, **Lasso** zeroes some, both fight overfitting.
5. Don't **extrapolate** far beyond the data.

Next: judge a fit with [RMSE](concept:rmse-metric), [MAE](concept:mae-metric) and [R²](concept:r2-score).`,
			enter: (s) => {
				s.ui = { handles: true, landscape: true, fit: true, dragPoints: true, outlier: true, degree: true, penalty: true, alpha: true, range: true, view: true };
				s.view = 'line';
				s.show = { residuals: true, landscape: true, truth: true };
				s.wide = false;
				s.penalty = 'ridge';
				s.logAlpha = -4;
				s.degree = 9;
				s.ghost = null;
				s.autoFit = true;
				resetData(s);
				s.did = { handles: true, landscape: true, dragPoint: true };
			}
		}
	]
};

export default explainer;

/** Exposed for the spec. */
export const _internals = { HAND_TARGET, COEF_TARGET, CLEAN_MSE, MEAN_Y };
