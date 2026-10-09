/**
 * Guided explainer: time series forecasting (decomposition, stationarity, ACF, AR/MA, forecasts,
 * Prophet-style models and honest backtesting).
 */
import type { ExplainerModule } from '../types.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import {
	AR_PHI,
	DIFF_LABEL,
	MA_THETA,
	TRAIN_END,
	WINDOW,
	acfDiff,
	acfOf,
	arFit,
	arForecast,
	backtestOf,
	drift,
	init,
	noShow,
	num,
	off,
	prophet,
	rollingOf,
	type TSState
} from './state.ts';
import { arMean } from './ts.ts';

const ACTIVE = (s: TSState) => [s.comp.trend && 'trend', s.comp.season && 'seasonality', s.comp.noise && 'noise'].filter(Boolean);

const explainer: ExplainerModule<TSState> = {
	title: 'How time series forecasting works',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Trend + seasonality + noise',
			body: (s) => `Ten years of monthly sales at an ice-cream shop. Unlike a normal table of rows, **order matters** here: each value depends on *when* it happened, and the goal is to predict values that haven't happened yet.

A classic first move is to split the series into three parts that add up:

- **Trend**: the slow long-term direction (the shop is growing).
- **Seasonality**: a pattern that repeats every 12 months (summer and December peaks).
- **Noise**: what's left. Here it has a little memory: a good month tends to be followed by another.

Showing: **${ACTIVE(s).join(' + ') || 'nothing'}**.`,
			enter: (s) => {
				s.view = 'sales';
				s.show = { ...noShow, components: true };
				s.ui = { ...off, comp: true };
			},
			task: {
				prompt: 'Switch off each component once (trend, seasonality and noise) and see what the others look like alone.',
				done: (s) => s.did.trend && s.did.season && s.did.noise
			}
		},
		{
			title: 'Is the series stationary?',
			body: `Many classic models, ARIMA included, assume the series is **stationary**: its average level, its spread and its correlations stay the same whenever you look.

That matters because a model learns "how the series usually behaves". If the usual behaviour keeps changing, what it learned from year 1 doesn't apply in year 10.`,
			enter: (s) => {
				s.comp = { trend: true, season: true, noise: true };
				s.show = { ...noShow };
				s.ui = { ...off };
			},
			quiz: {
				question: 'Is this sales series stationary?',
				options: ['Yes: it repeats the same yearly pattern', 'No: its average level keeps rising', "Can't tell without a statistical test"],
				answer: 1,
				explain: () => {
					const r = rollingOf('none');
					return `The bars show the average (and ±1 std) over each ${WINDOW}-month window. The average climbs from **${num(r[0].mean, 1)}** to **${num(r[r.length - 1].mean, 1)}**. A drifting mean is the clearest sign of a non-stationary series. Formal tests like ADF confirm it, but the plot already tells you.`;
				},
				reveal: (s) => {
					s.show.rolling = true;
				}
			}
		},
		{
			title: 'Differencing removes the trend',
			body: (s) => `Instead of modelling the level, model the **change**: y′ₜ = yₜ − yₜ₋₁. A straight-line trend becomes a constant (the slope), and the series stops climbing. This is the **I** (integrated, *d* = number of differences) in ARIMA.

A **seasonal difference** yₜ − yₜ₋₁₂ compares each month with the same month last year, which cancels the yearly pattern.

Showing **${DIFF_LABEL[s.diff]}**${s.diff === 'both' ? ' (seasonal difference of the first difference)' : ''}: the ${WINDOW}-month averages drift by **${num(drift(s.diff), 1)}** from first to last window.`,
			enter: (s) => {
				s.view = 'diff';
				s.show = { ...noShow, rolling: true };
				s.ui = { ...off, diff: true };
			},
			task: {
				prompt:
					'Find the differencing that leaves the averages flat. Try **Lag 12** alone first: the trend speeds up at year 7, so a jump remains. Then try **Both**.',
				done: (s) => s.diff === 'both'
			}
		},
		{
			title: 'Autocorrelation: the series vs. itself',
			body: () => {
				const r = acfDiff('none');
				return `**Autocorrelation** at lag *k* is the correlation between the series and a copy of itself shifted *k* months. The bars show lags 1–24; anything inside the dashed band could just be chance.

On the raw sales every bar is high and they fade only slowly (r₁ = **${num(r[1])}**, r₁₂ = **${num(r[12])}**). That slow fade is the fingerprint of a **trend**: any two months close in time are both "early" or both "late".`;
			},
			enter: (s) => {
				s.view = 'diff';
				s.diff = 'none';
				s.show = { ...noShow, acf: true };
				s.ui = { ...off };
			},
			quiz: {
				question: 'Now take first differences (yₜ − yₜ₋₁) to remove the trend. Which lag will stand out in the ACF?',
				options: ['Lag 1', 'Lag 6', 'Lag 12', 'None: differences are pure noise'],
				answer: 2,
				explain: () =>
					`With the trend gone, **lag 12** jumps out (r₁₂ = **${num(acfDiff('lag1')[12])}**): this month's change looks like the change in the same month a year ago. That's the yearly season. It tells you to use a seasonal model (SARIMA with s = 12, or seasonal features). Switch the differencing to compare.`,
				reveal: (s) => {
					s.diff = 'lag1';
					s.ui.diff = true;
				}
			}
		},
		{
			title: 'AR and MA: two kinds of memory',
			body: (s) =>
				s.proc === 'ar'
					? `Two small stationary series, each built from random shocks εₜ.

**AR(2)**, *autoregressive*: today is a weighted sum of the last two values, xₜ = ${AR_PHI[0]}·xₜ₋₁ + ${AR_PHI[1]}·xₜ₋₂ + εₜ. A shock never fully goes away; it fades step by step. So the ACF **decays gradually** (r₁ = ${num(acfOf(s)[1])}, r₃ = ${num(acfOf(s)[3])}, r₆ = ${num(acfOf(s)[6])}).`
					: `**MA(1)**, *moving average*: today is today's shock plus part of yesterday's shock, xₜ = εₜ + ${MA_THETA}·εₜ₋₁. Each shock lives for exactly two steps, so the ACF **cuts off** after lag 1 (r₁ = ${num(acfOf(s)[1])}, r₂ = ${num(acfOf(s)[2])}).

ARIMA(*p*, *d*, *q*) combines both on a series differenced *d* times: *p* past values plus *q* past shocks. The ACF shape is how people guess *q*. A related plot, the PACF, helps guess *p*.`,
			enter: (s) => {
				s.view = 'process';
				s.proc = 'ar';
				s.show = { ...noShow, acf: true };
				s.ui = { ...off, proc: true };
			},
			task: {
				prompt: 'Switch to **MA(1)** and watch the ACF bars drop to about zero after lag 1.',
				done: (s) => s.did.ma
			}
		},
		{
			title: 'Fitting AR(p) from data',
			body: (s) => {
				const f = arFit(s.p);
				const terms = f.phi.map((v, i) => `${num(v)}·xₜ₋${'₁₂₃₄₅₆₇₈₉'[i]}`).join(' + ');
				return `Fitting an AR(*p*) is just [linear regression](concept:linear-regression) of xₜ on its own last *p* values, solved by least squares.

The data came from the AR(2) above, but the model doesn't know that. With **p = ${s.p}**:

x̂ₜ = ${num(f.c)} + ${terms}

One-step-ahead error σ = **${num(f.sigma, 3)}**. The dashed line is the model's prediction for each month, made from the months before it.`;
			},
			enter: (s) => {
				s.view = 'ar';
				s.p = 1;
				s.show = { ...noShow, perr: true };
				s.ui = { ...off, p: true };
			},
			task: {
				prompt: 'Change *p* and find where adding more lags stops reducing the error (click a bar or use the slider).',
				done: (s) => s.p === 2
			}
		},
		{
			title: 'Forecasting: the cone of uncertainty',
			body: (s) => {
				const fc = arForecast(s.p);
				const h = s.horizon;
				return `To forecast, the model predicts the next month, then **feeds that prediction back in** as if it were real data, and repeats.

Each step adds a new unknown shock, so the errors pile up. The shaded bands are 80% and 95% **prediction intervals**: ±${num(1.96 * fc.se[0])} one month ahead, ±${num(1.96 * fc.se[h - 1])} at ${h} months.`;
			},
			enter: (s) => {
				s.view = 'forecast';
				s.p = 2;
				s.horizon = 6;
				s.show = { ...noShow };
				s.ui = { ...off, horizon: true };
			},
			quiz: {
				question: 'Forecast 30 months ahead with this AR(2). Where does the forecast line go?',
				options: ['It keeps following the latest direction', "It flattens out at the series' long-run mean", 'It repeats the last observed value'],
				answer: 1,
				explain: (s) => {
					const f = arFit(2);
					const fc = arForecast(2);
					return `The weights sum to less than 1 (${num(f.phi[0])} + ${num(f.phi[1])}), so each prediction is pulled toward the mean, and the line flattens at **${num(arMean(f))}**. Far ahead the model knows nothing beyond "a typical month". The band stops widening too: at 30 months it's ±${num(1.96 * fc.se[29])}, about the series' own spread.`;
				},
				reveal: (s) => {
					s.horizon = 30;
				}
			}
		},
		{
			title: 'Prophet-style: add up the blocks',
			body: (s) => {
				const r = prophet(s.K, s.changepoints);
				return `Prophet treats forecasting as **curve fitting**: y(t) = g(t) + s(t) (+ holiday effects).

- **Trend g(t)**: a line that can bend at **changepoints** ${s.changepoints ? '(on: the ticks show how much it bends at each)' : '(off: one straight line)'}.
- **Seasonality s(t)**: a sum of *K* sine/cosine pairs with a 12-month period. Larger *K* draws sharper shapes, like the December spike. Now **K = ${s.K}**.

Fitted on the first ${TRAIN_END / 12} years; the hollow dots are the last 2 years, kept hidden from the fit. Error on them: **MAE ${num(r.mae)}**.`;
			},
			enter: (s) => {
				s.view = 'prophet';
				s.K = 1;
				s.changepoints = false;
				s.show = { ...noShow, test: true };
				s.ui = { ...off, K: true, cps: true };
			},
			task: {
				prompt: 'Turn on **changepoints** and raise *K* until the held-out MAE drops below 3.5. Notice how the band widens once the trend is allowed to bend.',
				done: (s) => s.changepoints && prophet(s.K, s.changepoints).mae < 3.5
			}
		},
		{
			title: 'Backtesting without peeking',
			body: (s) => `To know how a forecaster will do, test it **the way you'll use it**: trained on the past and predicting the future.

Ordinary 5-fold cross-validation shuffles the months. Every grey row below is a training set and the coloured cells are its test months. With shuffling, many test months sit *between* training months, including later ones.

Shuffled CV (same Prophet-style model): **MAE ${num(backtestOf('shuffled').mae)}**.${s.cv === 'walk' ? ` Walk-forward: **MAE ${num(backtestOf('walk').mae)}**.` : ''}`,
			enter: (s) => {
				s.view = 'backtest';
				s.cv = 'shuffled';
				s.K = 4;
				s.changepoints = true;
				s.show = { ...noShow, folds: true };
				s.ui = { ...off };
			},
			quiz: {
				question: 'Now backtest walk-forward: train on everything before a date, predict the next 12 months, repeat for 5 dates. The MAE will be…',
				options: ['About the same', 'Noticeably higher', 'Lower: walk-forward trains on more data'],
				answer: 1,
				explain: () =>
					`Walk-forward MAE is **${num(backtestOf('walk').mae)}** vs **${num(backtestOf('shuffled').mae)}** shuffled. Shuffling let the model *interpolate* between known neighbours on both sides. Walk-forward has to *extrapolate*, exactly like in production. Never shuffle a time series: use [time-series CV](concept:time-series-cv) (expanding or sliding windows), and report [MAE](concept:mae-metric) or [RMSE](concept:rmse-metric) per fold.`,
				reveal: (s) => {
					s.cv = 'walk';
					s.ui.cv = true;
				}
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Pick a view below. Recap:

1. **Plot and decompose**: trend, seasonality, noise.
2. **Make it stationary** for ARIMA: difference (*d*), seasonally if needed.
3. **Read the ACF** to spot seasonality and choose AR/MA orders (or let auto_arima search).
4. **Forecast with intervals**: they widen with the horizon.
5. Prophet-style models add up a bendy trend and Fourier seasonality instead.
6. **Backtest walk-forward**, never shuffled.

For many related series with extra features, gradient-boosted trees on lag features ([LightGBM](concept:lightgbm)) or [LSTMs](concept:rnn-lstm) often win.`,
			enter: (s) => {
				s.view = 'sales';
				s.comp = { trend: true, season: true, noise: true };
				s.diff = 'lag1';
				s.p = 2;
				s.horizon = 24;
				s.K = 4;
				s.changepoints = true;
				s.cv = 'walk';
				s.show = { components: true, rolling: true, acf: true, perr: true, folds: true, test: true };
				s.ui = { comp: true, diff: true, proc: true, p: true, horizon: true, K: true, cps: true, cv: true, view: true };
			}
		}
	]
};

export default explainer;
