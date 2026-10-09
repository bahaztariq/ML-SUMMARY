/**
 * Guided explainer: Mean Absolute Error, its robustness, and why the median minimizes it.
 */
import type { ExplainerModule } from '../types.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import { B, BASE, BIG_MISS, SHARE_AB, SHARE_OUT, START_C, TOP, TOP_TARGET, WORST, pct, signed } from './narration.ts';
import * as rg from '../_regression/regression.ts';
import { euro } from '../_regression/plot.ts';
import { MODEL, OUT, init, mean, median, metrics, noMetrics, off, resetRents, setOutlier, type ErrState } from './state.ts';

const explainer: ExplainerModule<ErrState> = {
	title: 'How MAE measures prediction error',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Absolute errors',
			body: `A rent model trained earlier predicts \`ŷ = ${MODEL.w}·size + ${MODEL.b}\` (green line). Here are **10 flats it has never seen**, with their residuals \`y − ŷ\` in red.

Some misses are too high, some too low. If we averaged them as they are, they would cancel out (the average residual is just ${signed(B.meanRes)}). The fix MAE uses is the simplest one: **drop the sign**. The bars show each flat's **absolute error** \`|y − ŷ|\`: the ${BASE.xs[WORST]} m² flat's ${signed(B.r[WORST])} becomes **€${Math.abs(B.r[WORST])}**.`,
			enter: (s) => {
				s.bars = 'abs';
			}
		},
		{
			title: 'Average them: MAE',
			body: (s) => {
				const m = metrics(s);
				return `Average the ten absolute errors and you get the **mean absolute error**:

\`MAE = (1/n)·Σ|y − ŷ|\` = **${euro(m.mae)}**

That's the dashed line. It reads exactly as it sounds: *on average, the model's rent is off by ${euro(m.mae)}*. Same unit as the target, no squaring, nothing to undo.

Each flat contributes **in proportion** to its error: a €200 miss counts twice as much as a €100 miss, not four times.`;
			},
			enter: (s) => {
				s.show.meanLine = true;
				s.show.mae = true;
			}
		},
		{
			title: 'Drag in an outlier',
			body: (s) => {
				const m = metrics(s);
				return `Now compare with [RMSE](concept:rmse-metric), which squares errors before averaging. With the original rents: MAE ${euro(B.mae)}, RMSE ${euro(B.rmse)}.

Now: **MAE ${euro(m.mae)}**, **RMSE ${euro(m.rmse)}**. Push one flat far from the line and watch: MAE grows by exactly 1/10 of the extra miss, RMSE grows faster and faster.`;
			},
			enter: (s) => {
				s.ui = { ...off, drag: true };
				s.show.rmse = true;
			},
			task: {
				prompt: `Drag one flat until its error is over **€${BIG_MISS}**.`,
				done: (s) => Math.max(...metrics(s).ab) > BIG_MISS
			}
		},
		{
			title: 'Who gets the blame?',
			body: `Here the ${BASE.xs[OUT]} m² flat rents for **€${SHARE_OUT} more** than the model expects (say it's a penthouse). It's one flat in ten.

The top bar shows each flat's slice of the total **absolute** error: the outlier's share is **${pct(SHARE_AB)}**.`,
			enter: (s) => {
				s.ui = { ...off };
				resetRents(s);
				setOutlier(s, SHARE_OUT);
				s.bars = 'share';
				s.show.meanLine = false;
			},
			quiz: {
				question: 'What share of the total squared error (what RMSE is built on) does that one flat take?',
				options: ['About the same, under half', 'About 80%', '100%: squared errors ignore the other flats'],
				answer: 1,
				explain: (s) => {
					const m = metrics(s);
					return `**${pct(m.outShareSq)}** of the squared error comes from that one flat, versus ${pct(m.outShareAb)} of the absolute error. That's why RMSE (**${euro(m.rmse)}**) is mostly a report on the outlier, while MAE (**${euro(m.mae)}**) still describes the typical flat. MAE is **robust** to outliers: no single point can take over.`;
				},
				reveal: (s) => {
					s.ui.bars = false;
					s.show.share = true;
				}
			}
		},
		{
			title: 'The simplest model: one number',
			body: `Forget size. Suppose the "model" must predict **the same rent c for every flat**. Which c is best?

The penthouse is still in the data: rents are usually skewed by a few pricey flats. The chart below plots MAE and RMSE for every possible c. The green line is c = ${euro(START_C)}.`,
			enter: (s) => {
				s.ui = { ...off, dragC: true };
				resetRents(s);
				setOutlier(s, SHARE_OUT);
				s.mode = 'constant';
				s.bars = 'curves';
				s.show = { ...s.show, ...noMetrics, mae: true, rmse: true, band: false, meanLine: false, marks: false };
				s.c = START_C;
			},
			quiz: {
				question: 'Which constant c gives the lowest MAE?',
				options: ['The mean rent', 'The median rent (the middle value)', 'Halfway between the cheapest and the priciest flat'],
				answer: 1,
				explain: (s) => `The **median**, ${euro(median(s))}. Picture moving c up by €1: every flat *below* c gets €1 more error, every flat *above* gets €1 less. While more flats are above, raising c helps. The balance point, with half the flats on each side, is the median. With an even count (10), any c between the two middle rents (${euro(s.ys.slice().sort((a, b) => a - b)[4])} and ${euro(s.ys.slice().sort((a, b) => a - b)[5])}) ties: the MAE curve has a flat bottom there. Squared error instead balances the *sizes* of the errors on each side, which happens at the **mean**, ${euro(mean(s))}.`,
				reveal: (s) => {
					s.show.marks = true;
				}
			}
		},
		{
			title: 'Find both bottoms',
			body: (s) => `MAE(c) is made of straight pieces with a kink at every flat's rent, because \`|y − c|\` has a sharp corner. That's also why MAE is awkward as a *training* loss: its slope jumps instead of changing smoothly, so optimizers need sub-gradients. RMSE(c) is a smooth bowl.

c = **${euro(s.c)}**: MAE ${euro(rg.constMae(s.ys, s.c))}, RMSE ${euro(rg.constRmse(s.ys, s.c))}.`,
			enter: (s) => {
				s.ui = { ...off, dragC: true };
				s.show.marks = true;
				s.did.maeMin = false;
				s.did.rmseMin = false;
			},
			task: {
				prompt: 'Drag the green line (or click the chart) to the **bottom of the MAE curve**, then to the **bottom of the RMSE curve**.',
				done: (s) => s.did.maeMin && s.did.rmseMin
			}
		},
		{
			title: 'Outliers pull the mean, not the median',
			body: (s) => `The penthouse is gone; the ten original rents are back.

Mean rent: **${euro(mean(s))}** (started at ${euro(rg.mean(BASE.ys))}). Median rent: **${euro(median(s))}** (started at ${euro(rg.median(BASE.ys))}).

Raising the priciest flat drags the mean, and the whole RMSE curve, along with it. The median only cares about which flats are above or below the middle, not by how much. The same holds for full models: a regression trained on absolute error (median regression) shrugs off outliers that would tilt a least-squares [linear regression](concept:linear-regression).`,
			enter: (s) => {
				s.ui = { ...off, drag: true };
				resetRents(s);
				s.c = Math.round(median(s));
			},
			task: {
				prompt: `Drag the priciest flat (${euro(BASE.ys[TOP])}) up to **${euro(TOP_TARGET)}** or more and watch the two markers.`,
				done: (s) => s.ys[TOP] >= TOP_TARGET
			}
		},
		{
			title: 'MAE or RMSE?',
			body: `Both are in the target's unit, both are "average error". They answer different questions.`,
			enter: (s) => {
				s.ui = { ...off };
				resetRents(s);
				s.mode = 'line';
				s.bars = 'abs';
				s.show = { ...s.show, ...noMetrics, mae: true, rmse: true, ratio: true, marks: false, meanLine: true };
			},
			quiz: {
				question: 'You predict delivery times. One delivery 60 minutes late is far worse for customers than six that are 10 minutes late. Which metric matches that?',
				options: ['MAE: it treats both cases the same (60 minutes of error each)', 'RMSE: the single 60-minute miss costs more', 'Either: they always rank models the same way'],
				answer: 1,
				explain: `MAE scores both situations as 60 minutes of total error. Squared error scores one 60-minute miss as 3,600 versus 6 × 100 = 600 for the small ones, so **RMSE** punishes the big miss. Use **MAE** when every unit of error costs the same, or when outliers in the data shouldn't steer your evaluation; use **RMSE** when big misses are disproportionately bad. The two can even rank models differently, so reporting both is common.`,
				reveal: (s) => {
					setOutlier(s, SHARE_OUT);
					s.ui.outlier = true;
				}
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked: switch between the model and a constant, drag flats, add the outlier. Recap:

1. MAE = average of \`|y − ŷ|\`: "off by this much on average", in the target's unit.
2. Every error counts in proportion, so MAE is **robust to outliers**.
3. The best constant under MAE is the **median**; under squared error it's the **mean**.
4. |x| has a kink at 0, so MAE is less convenient as a training loss.
5. MAE ≤ [RMSE](concept:rmse-metric) always. Report both to spot a few big errors.

In scikit-learn: \`mean_absolute_error(y, y_pred)\`; \`median_absolute_error\` is even more robust.`,
			enter: (s) => {
				s.ui = { drag: true, dragC: true, outlier: true, bars: true, mode: true, reset: true };
				resetRents(s);
				s.mode = 'line';
				s.bars = 'abs';
				s.show = { ...s.show, ...noMetrics, mae: true, rmse: true, ratio: true, marks: true, meanLine: true, squares: false };
				s.did.drag = true;
				s.did.dragC = true;
			}
		}
	]
};

export default explainer;

export const _internals = { SHARE_OUT, BIG_MISS, TOP, TOP_TARGET };
