/**
 * Guided explainer: how gradient descent finds the bottom of a loss.
 */
import { fmt } from '#lib/viz/canvas.ts';
import type { ExplainerModule } from '../types.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import { BUMPY, FIT, REACHED_EN, STEPS_GOOD, STEPS_SLOW, now, reachedIn } from './narration.ts';
import {
	BUMPY_START,
	FIT_MIN,
	FIT_START,
	GLOBAL_MIN,
	LOCAL_MIN,
	current,
	info,
	init,
	iterations,
	off,
	problem,
	reset,
	run,
	setView,
	stepsToMin,
	type GDState
} from './state.ts';

const reached = reachedIn(REACHED_EN);

const explainer: ExplainerModule<GDState> = {
	title: 'How gradient descent walks downhill',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Loss is a landscape',
			body: (s) => {
				const n = now(s);
				return `We want a line **y = w·x** through the points in the inset. Each slope **w** misses the points by some amount (pink lines), and the average squared miss is the [loss](concept:loss-vs-cost-function) (here, mean squared error).

Try every w and plot its loss: you get a **landscape**. Training a model means finding the w at the bottom.

Right now w = **${n.w}** and the loss is **${n.loss}**.`;
			},
			task: {
				prompt: 'Drag the ball to the w with the **lowest loss**. Watch the line in the inset as you go.',
				done: (s) => s.did.drag && Math.abs(current(s)[0] - FIT_MIN) < 0.1
			}
		},
		{
			title: 'The gradient is the slope',
			body: (s) => {
				const n = now(s);
				return `A model with millions of weights can't try every value. What it can compute cheaply (with calculus, or [backpropagation](concept:mlp-neural-network) in a neural net) is the **gradient** ∇L: the slope of the loss right where we stand.

The amber line is the tangent at w = **${n.w}**. Its slope is ∇L = **${n.g}**: nudge w up by 0.1 and the loss changes by about ${fmt(n.raw.grad[0] * 0.1)}.

The sign tells you which way is uphill. The size tells you how steep it is.`;
			},
			enter: (s) => {
				s.start = [3.9];
				reset(s);
				s.show.tangent = true;
			},
			quiz: {
				question: 'The slope here is positive: the loss rises as w increases. Which way should w move to lower the loss?',
				options: ['Right: increase w', 'Left: decrease w', "Either way: the slope doesn't say"],
				answer: 1,
				explain: `Downhill is **opposite** the gradient. A positive slope means *decrease* w, a negative slope means *increase* it. The green arrow is that move, **−η·∇L**. Drag the ball to the other side of the valley and watch the arrow flip.`,
				reveal: (s) => {
					s.show.arrow = true;
				}
			}
		},
		{
			title: 'The update rule',
			body: (s) => {
				const n = now(s);
				const k = iterations(s);
				return `Gradient descent is one line, repeated:

\`w ← w − η · ∇L(w)\`

**η** (eta) is the **learning rate**: how big a step to take per unit of slope. Here η = **${s.lr}**.

Step ${k}: w = **${n.w}**, ∇L = **${n.g}**, so the move is −${s.lr} × ${n.g} = **${n.move}**.

The steps **shrink on their own** as the ground flattens. Near the bottom the slope is close to 0, so the move is too.`;
			},
			enter: (s) => {
				s.ui = { ...off, step: true, run: true, reset: true };
				s.start = [FIT_START];
				s.lr = 0.25;
				s.show.arrow = true;
				s.show.tangent = true;
				reset(s);
			},
			task: {
				prompt: 'Press **Step** a few times until the loss is within 0.01 of its minimum.',
				done: (s) => s.view === 'fit' && stepsToMin(s) >= 0
			}
		},
		{
			title: 'Learning rate too small',
			body: (s) => `Same start, but η = **${s.lr}**. Every step is careful and every step is tiny.

After **${iterations(s)} steps** we're at w = **${now(s).w}** with loss **${now(s).loss}**. The minimum is ${fmt(FIT.minLoss, 3)}, so we're still far off. At η = 0.25 it took **${STEPS_GOOD} steps** to get there; at this rate it takes **${STEPS_SLOW}**.

Too small a learning rate never breaks anything. It just burns compute, and training that should take an hour takes a day.`,
			enter: (s) => {
				s.show.tangent = false;
				s.lr = 0.02;
				reset(s);
				run(s, 20);
			}
		},
		{
			title: 'Learning rate too large',
			body: (s) => {
				const f = 1 - 2 * s.lr;
				return `Now η = **${s.lr}**. The step is so big that the ball **overshoots** the bottom and lands on the other side, then overshoots back.

On this loss the slope is ∇L = 2·(w − ŵ), where ŵ = ${fmt(FIT_MIN)} is the best slope. So one update multiplies the distance to ŵ by **(1 − 2η) = ${fmt(f)}**. A negative factor is a bounce; its size, ${fmt(Math.abs(f))}, decides whether the bounces shrink.

Current state: ${reached(s)}, loss **${now(s).loss}**.`;
			},
			enter: (s) => {
				s.lr = 0.8;
				reset(s);
				run(s, 12);
			},
			quiz: {
				question: 'What happens if we raise η from 0.8 to 1.1?',
				options: [
					'It bounces, but settles even faster',
					'It bounces back and forth at the same height forever',
					'Each bounce lands higher than the last: the loss explodes'
				],
				answer: 2,
				explain: (s) =>
					`(1 − 2·1.1) = −1.2: every step overshoots by 20% more than the gap it started from. After ${iterations(s)} steps the loss is **${fmt(info(s).loss, 1)}**, up from ${fmt(FIT.loss([FIT_START]), 2)}. This is **divergence**. In a real training run it shows up as a loss that climbs, then turns into \`NaN\`.`,
				reveal: (s) => {
					s.lr = 1.1;
					reset(s);
					run(s, 12);
				}
			}
		},
		{
			title: 'Find the sweet spot',
			body: (s) => `Because each step multiplies the error by (1 − 2η):

- η < 0.5: it creeps in from one side
- 0.5 < η < 1: it overshoots and bounces, but still converges
- η > 1: the bounces grow and it diverges

In general the limit is **η < 2 / curvature**: the steeper the valley, the smaller the safe step. Real losses aren't perfect bowls, so in practice you try values on a log scale (0.001, 0.01, 0.1) and watch the loss curve. See [hyperparameter tuning](concept:hyperparameter-tuning).

η = **${s.lr.toFixed(2)}** → factor ${fmt(1 - 2 * s.lr)} → ${reached(s, 20)}.`,
			enter: (s) => {
				s.ui = { ...off, lr: true };
				s.show.arrow = false;
				s.autoRun = 20;
				s.lr = 0.1;
				reset(s);
			},
			task: {
				prompt: 'Use the **η slider** to reach the minimum in **3 steps or fewer**.',
				done: (s) => s.view === 'fit' && stepsToMin(s) > 0 && stepsToMin(s) <= 3
			}
		},
		{
			title: 'Two valleys: local vs global',
			body: (s) => {
				const local = fmt(BUMPY.loss([LOCAL_MIN]), 2);
				const global = fmt(BUMPY.loss([GLOBAL_MIN]), 2);
				return `Real losses are rarely one neat bowl. This one has **two valleys**: a shallow one on the right (loss ${local}) and a deeper one on the left (loss ${global}), the **global minimum**.

Gradient descent only ever feels the slope under its feet. It has no map.

w = **${now(s).w}**, loss **${now(s).loss}**, ∇L = **${now(s).g}**.`;
			},
			enter: (s) => {
				s.ui = { ...off };
				s.autoRun = 0;
				setView(s, 'bumpy');
				s.lr = 0.1;
				s.start = [BUMPY_START];
				s.show.fit = false;
				s.show.minima = true;
				s.show.tangent = false;
				reset(s);
			},
			quiz: {
				question: `We start at w = ${BUMPY_START} with η = 0.1. Where does gradient descent end up?`,
				options: [
					'In the deeper valley on the left: it finds the best answer',
					'In the nearer, shallower valley on the right',
					'On top of the hump in between'
				],
				answer: 1,
				explain: (s) =>
					`It rolls into the nearest dip and stops at w = **${fmt(current(s)[0])}** after ${iterations(s)} steps. There the slope is 0, so the update is 0, and it can't tell that a deeper valley exists. That's a **local minimum**.`,
				reveal: (s) => {
					run(s, 500);
				}
			}
		},
		{
			title: 'Where you start matters',
			body: (s) => {
				const end = current(s)[0];
				const where = s.diverged
					? 'diverges'
					: Math.abs(end - GLOBAL_MIN) < 0.01
						? 'ends in the **global** minimum'
						: Math.abs(end - LOCAL_MIN) < 0.01
							? 'gets stuck in the **local** minimum'
							: `is still moving at w = ${fmt(end)}`;
				return `Now the run replays whenever you move the start. Start = **${fmt(s.start[0])}**, η = **${s.lr.toFixed(2)}** → it ${where}.

Anything left of the hump at w = 0 rolls left. A bigger η can sometimes *jump* the hump (try 0.3 from 2.2), but that's luck, not a strategy.

In practice people use random restarts, the noise of mini-batch SGD, and momentum ([optimizers](concept:dl-optimizers)). In big neural nets most local minima turn out nearly as good as the global one; flat plateaus and saddle points cause more trouble.`;
			},
			enter: (s) => {
				s.ui = { ...off, drag: true, lr: true };
				s.autoRun = 500;
				s.did.drag = false;
				reset(s);
			},
			task: {
				prompt: 'Drag the starting point so gradient descent ends in the **global** minimum.',
				done: (s) => s.view === 'bumpy' && !s.diverged && Math.abs(current(s)[0] - GLOBAL_MIN) < 0.01
			}
		},
		{
			title: 'Two weights: zig-zag in a narrow valley',
			body: (s) => {
				const shape = s.bowl === 'round' ? 'round' : 'stretched';
				return `With two weights the loss is a surface. Seen from above it's a **contour map**: each ring is one loss level, like a hiking map. The gradient is now a vector (∂L/∂w₁, ∂L/∂w₂) and always points **perpendicular to the rings**.

This bowl is **stretched**: steep across the valley, shallow along it. The gradient points mostly *across*, so GD **zig-zags** and crawls along the floor. A bigger η doesn't help: past 2/12 ≈ 0.17 the steep direction diverges.

The usual cause is features on very different scales (age in years vs. income in dollars). [Feature scaling](concept:feature-scaling) makes the bowl round.

Now: **${shape}** bowl, η = **${s.lr.toFixed(2)}** → ${reached(s)}.`;
			},
			enter: (s) => {
				s.ui = { ...off, lr: true, bowl: true, drag: true };
				s.show.minima = false;
				s.show.arrow = false;
				setView(s, 'bowl', 'stretched');
				s.lr = 0.15;
				s.autoRun = 150;
				reset(s);
			},
			task: {
				prompt: 'Switch the bowl to **Round (scaled)**, then raise η until it reaches the minimum in **5 steps or fewer**.',
				done: (s) => s.view === 'bowl' && s.bowl === 'round' && stepsToMin(s) > 0 && stepsToMin(s) <= 5
			}
		},
		{
			title: 'Your turn: playground',
			body: (s) => `Everything is unlocked. Recap:

1. Start somewhere and compute the gradient ∇L, the local slope.
2. Step against it: \`w ← w − η·∇L\`.
3. Repeat until the gradient is about 0.

**η** is the knob that matters: too small is slow, too big bounces or diverges, and the safe limit depends on how steep the loss is. GD finds *a* minimum, not necessarily *the* minimum, and narrow valleys make it zig-zag. Momentum and Adam ([optimizers](concept:dl-optimizers)) are built to fix exactly that.

${problem(s).dim === 1 ? `w = **${now(s).w}**, loss **${now(s).loss}**` : `loss **${fmt(info(s).loss, 3)}**`}, step ${iterations(s)}.`,
			enter: (s) => {
				s.ui = { drag: true, step: true, run: true, reset: true, lr: true, view: true, bowl: true };
				s.show = { tangent: true, arrow: true, fit: true, minima: true };
				s.autoRun = 0;
				setView(s, 'fit');
				s.lr = 0.25;
				reset(s);
			}
		}
	]
};

export default explainer;
