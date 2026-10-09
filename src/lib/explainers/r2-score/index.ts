/**
 * Guided explainer: R² as the fraction of variance a model explains beyond the mean baseline.
 */
import { fmt } from '#lib/viz/canvas.ts';
import type { ExplainerModule } from '../types.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import { BAD_LINE, BASE_FIT, BEST_ADJ_K, JUNK, R2_TASK, big, r3 } from './narration.ts';
import { euro } from '../_regression/plot.ts';
import { K_MAX, NOISE, N_TRAIN, SCORES, fit, init, off, setK, setNoise, stats, type R2State } from './state.ts';

const explainer: ExplainerModule<R2State> = {
	title: 'How R² compares a model to the mean',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'The lazy baseline',
			body: (s) => `Fourteen flats: size and monthly rent. Before building any model, what's the best you could do **knowing nothing about size**?

Predict the **average rent** for every flat: ȳ = **${euro(stats(s).ybar)}** (dashed line). It's a lazy model, but a useful yardstick. The amber segments show how far each flat is from that average.

R² will answer one question: *how much better than this baseline is my model?*`,
			enter: (s) => {
				s.show = { meanLine: true, totRes: true, totSquares: false, model: false, resSquares: false, bars: false };
			}
		},
		{
			title: 'SS_tot: the total spread',
			body: (s) => `Square each distance to the mean (the amber squares) and add them up:

\`SS_tot = Σ(y − ȳ)²\` = **${big(stats(s).tot)}**

This is the **total variation** in rents, the error of the baseline. Divide it by n and you get the variance of y. It's what there is to explain.`,
			enter: (s) => {
				s.show.totSquares = true;
				s.show.bars = true;
			}
		},
		{
			title: 'SS_res: what the model leaves',
			body: (s) => {
				const st = stats(s);
				return `Now a real model: a least-squares [linear regression](concept:linear-regression) on size (blue line). Its squared residuals are the blue squares:

\`SS_res = Σ(y − ŷ)²\` = **${big(st.res)}**

Compare the two bars. The model's leftover error is ${Math.round((st.res / st.tot) * 100)}% of the baseline's, so:

\`R² = 1 − SS_res / SS_tot\` = **${r3(st.r2)}**

The model **explains ${Math.round(st.r2 * 100)}% of the variation** in rent; the rest is noise or things size doesn't capture.`;
			},
			enter: (s) => {
				s.show.model = true;
				s.show.resSquares = true;
				s.show.totRes = false;
				s.autoFit = true;
				fit(s);
			}
		},
		{
			title: 'Drag the line',
			body: (s) => {
				const st = stats(s);
				return `R² is just a comparison of two areas: blue (model) against amber (baseline).

- R² = 1: no blue at all, a perfect fit.
- R² = 0: as much blue as amber, no better than ȳ.

Now: SS_res ${big(st.res)} vs SS_tot ${big(st.tot)}, **R² = ${r3(st.r2)}**.`;
			},
			enter: (s) => {
				s.ui = { ...off, handles: true };
			},
			task: {
				prompt: 'Drag the handles until R² is **0** (between −0.02 and 0.02). What does such a line look like?',
				done: (s) => Math.abs(stats(s).r2) <= 0.02
			}
		},
		{
			title: 'Below zero?',
			body: `R² = 0 means "as good as the mean". The name sounds like a square, so it can't be negative… or can it?`,
			enter: (s) => {
				s.ui = { ...off };
				s.autoFit = true;
				fit(s);
			},
			quiz: {
				question: 'Can a model score an R² below 0?',
				options: [
					'No: 0 is the floor, that is the baseline',
					'Yes: when its predictions are worse than always predicting the mean',
					'Only when the target has negative values'
				],
				answer: 1,
				explain: (s) => {
					const st = stats(s);
					return `This line slopes the wrong way. Its blue area is **${fmt(st.res / st.tot, 1)}×** the amber one, so R² = 1 − ${fmt(st.res / st.tot, 2)} = **${r3(st.r2)}**. The "²" is just a name: R² has no lower limit. A least-squares fit scored on its own training data can't go below 0 (it could always fall back to the flat line), but on **new data**, or for a broken model, negative R² happens and is a loud warning.`;
				},
				reveal: (s) => {
					s.autoFit = false;
					s.line = { ...BAD_LINE };
				}
			}
		},
		{
			title: 'Same model, noisier world',
			body: (s) => {
				const st = stats(s);
				return `Back to the least-squares line. The slider adds more random noise to the rents, while the real relationship (€10 per m²) stays the same.

Noise σ = **${euro(s.noise)}**: slope ${fmt(s.line.w)} €/m², **R² = ${r3(st.r2)}**.

The line still finds roughly the right slope, but a smaller share of the spread is explainable. R² describes the model **and the data together**: a "low" R² can be a fine model on a noisy problem, so only compare R² values on the **same data set**.`;
			},
			enter: (s) => {
				s.ui = { ...off, noise: true };
				s.autoFit = true;
				setNoise(s, NOISE);
				s.show.resSquares = true;
				s.show.totSquares = true;
			},
			task: {
				prompt: `Raise the noise until R² drops below **${R2_TASK}**. Does the slope change much?`,
				done: (s) => stats(s).r2 < R2_TASK
			}
		},
		{
			title: 'Adding useless features',
			body: `A new experiment: ${N_TRAIN} training flats, a regression on size alone. Left: predicted vs actual rent (points on the dashed line would be perfect). Right: scores as we add more features.

The "features" we add are **pure random numbers**, with no link to rent at all.`,
			enter: (s) => {
				s.ui = { ...off };
				s.view = 'features';
				s.k = 0;
			},
			quiz: {
				question: `We add ${JUNK} columns of random noise and refit. What happens to the training R²?`,
				options: ['It drops: noise confuses the model', 'It stays the same: the noise is useless', 'It goes up'],
				answer: 2,
				explain: `Training R² climbs from **${r3(SCORES[0].r2Train)}** to **${r3(SCORES[JUNK].r2Train)}**. Least squares could always give a junk column weight 0, so adding a feature can **never lower** training R². Instead it uses the random numbers to chase the noise in these ${N_TRAIN} flats. On new flats (amber) R² falls from ${r3(SCORES[0].r2Test)} to **${r3(SCORES[JUNK].r2Test)}**: classic [overfitting](concept:overfitting-underfitting).`,
				reveal: (s) => setK(s, JUNK, false)
			}
		},
		{
			title: 'Adjusted R²',
			body: (s) => {
				const sc = SCORES[s.k];
				return `**Adjusted R²** charges a fee for every feature p, given n samples:

\`adj R² = 1 − (1 − R²)·(n − 1)/(n − p − 1)\`

With n = ${N_TRAIN}, p = ${sc.p}: R² ${r3(sc.r2Train)} → adjusted **${r3(sc.adjR2)}**. A new feature only raises it if it improves the fit more than chance would. Better still, score on held-out data with a [train/test split](concept:train-test-split) or [cross-validation](concept:cross-validation).`;
			},
			enter: (s) => {
				s.ui = { ...off, k: true };
				s.view = 'features';
				setK(s, JUNK, false);
				s.did.k = false;
			},
			task: {
				prompt: 'Use the slider (or click the chart) to find the number of junk features where **adjusted R²** is highest.',
				done: (s) => s.did.k && s.k === BEST_ADJ_K
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap:

1. Baseline: predict the mean ȳ. Its error is **SS_tot** = Σ(y − ȳ)².
2. The model's error is **SS_res** = Σ(y − ŷ)².
3. **R² = 1 − SS_res/SS_tot**: the share of variation explained. 1 is perfect, 0 is "no better than the mean", below 0 is worse.
4. R² depends on how noisy the data is; compare it only on the same data.
5. Extra features always raise training R²; use **adjusted R²** or held-out data.

R² has no units, so pair it with an error in the target's unit like [RMSE](concept:rmse-metric) or [MAE](concept:mae-metric). In scikit-learn: \`r2_score(y, y_pred)\`.`,
			enter: (s) => {
				s.ui = { handles: true, noise: true, k: true, view: true, fit: true };
				s.view = 'line';
				setK(s, 0, false);
				s.kSeen = K_MAX;
				s.autoFit = true;
				setNoise(s, NOISE);
				s.show = { meanLine: true, totRes: false, totSquares: true, model: true, resSquares: true, bars: true };
				s.did.handles = true;
			}
		}
	]
};

export default explainer;

export const _internals = { BASE_FIT, BAD_LINE, BEST_ADJ_K, R2_TASK };
