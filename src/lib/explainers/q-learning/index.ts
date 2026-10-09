/**
 * Guided explainer: tabular Q-learning in a grid world, then the idea behind DQN.
 */
import type { ExplainerModule } from '../types.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import { ARROWS, ACTIONS, epsilonAt, maxQ, shortest } from './qlearn.ts';
import {
	COLS,
	DECAY,
	EPISODES,
	EPS_MIN,
	MAX_STEPS,
	ROWS,
	START_ENV,
	cellName,
	episodeNow,
	f2,
	greedy,
	init,
	lastTr,
	noShow,
	off,
	opts,
	plainEnv,
	qNow,
	resetWalk,
	runOf,
	total,
	trainAll,
	type QState
} from './state.ts';

function bellman(s: QState) {
	const tr = lastTr(s);
	if (!tr) return 'Press **Step** to make the first move.';
	const how = tr.explore ? 'a random move (exploring)' : 'its best-known move (exploiting)';
	return `Last move: from ${cellName(s, tr.s)} the agent took **${ACTIONS[tr.a]}** ${ARROWS[tr.a]}, ${how}, and landed on ${cellName(s, tr.s2)} with reward **${tr.r}**.

target = r + γ·max Q(s′) = ${tr.r} + ${s.gamma} × ${f2(tr.maxNext)} = **${f2(tr.target)}**${tr.done ? ' (episode over, so nothing comes after)' : ''}

Q ← ${f2(tr.old)} + ${s.alpha} × (${f2(tr.target)} − ${f2(tr.old)}) = **${f2(tr.next)}**`;
}

function outcomes(s: QState) {
	const run = runOf(s);
	const done = Math.min(EPISODES, episodeNow(s));
	const o = run.outcomes.slice(0, done);
	const goal = o.filter((x) => x === 'goal').length;
	const pit = o.filter((x) => x === 'pit').length;
	return { done, goal, pit, timeout: done - goal - pit };
}

function firstChange(s: QState) {
	return runOf(s).transitions.findIndex((tr) => tr.next !== tr.old);
}

const explainer: ExplainerModule<QState> = {
	title: 'How Q-learning learns by trial and error',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'An agent in a grid world',
			body: (s) => {
				const w = s.walk;
				const status = !w.outcome
					? `Moves so far: **${w.steps}**.`
					: w.outcome === 'goal'
						? `**Goal reached in ${w.steps} moves.** The shortest route takes ${shortest(plainEnv(s.env), s.env.goal)}.`
						: `**Fell in the pit** after ${w.steps} moves: −10. Press Reset and try again.`;
				return `In **reinforcement learning** nobody labels the right answer. An **agent** acts in an **environment** and only gets **rewards**.

Here the agent (the dot) starts at **S** in a ${COLS}×${ROWS} grid. Each turn it picks one of 4 actions: up, right, down, left. Walls and edges block it. Reaching **+10** or falling into the **−10** pit ends the *episode*. Ordinary moves give 0.

${status}`;
			},
			enter: (s) => {
				s.mode = 'walk';
				resetWalk(s);
				s.ui = { ...off, walk: true };
			},
			task: {
				prompt: 'Walk the agent to the **+10** with the arrow buttons. Now imagine learning this with no map, only rewards.',
				done: (s) => s.walk.outcome === 'goal'
			}
		},
		{
			title: 'The Q-table: a score for every move',
			body: `Q-learning keeps a table **Q(s, a)**: for each state *s* (cell) and action *a*, the total future reward it expects from taking *a* there and then playing well.

Each cell is split into 4 triangles, one per action, coloured by its Q value (green = good, pink = bad). That's ${COLS * ROWS} cells × 4 actions. All start at **0**: the agent knows nothing yet.

If the table were right, acting would be easy: in each cell, take the action with the highest Q. The whole job is **filling in the table** from experience.`,
			enter: (s) => {
				s.mode = 'learn';
				s.t = 0;
				s.show = { ...noShow, q: true };
				s.ui = { ...off };
			}
		},
		{
			title: 'One move, one Bellman update',
			body: (s) => `After every move the agent nudges one entry toward a **target**: the reward it just got plus the discounted value of the best move from where it landed.

Q(s,a) ← Q(s,a) + α·[r + γ·max Q(s′,·) − Q(s,a)]

The bracket is the **TD error**. Here α = ${s.alpha} (learning rate), γ = ${s.gamma} (discount).

${bellman(s)}`,
			enter: (s) => {
				s.mode = 'learn';
				s.t = 0;
				s.show = { ...noShow, q: true, nums: true, update: true };
				s.ui = { ...off, step: true };
			},
			task: {
				prompt:
					'Press **Step** a few times: with everything at 0 the target is 0 too, so nothing changes. Then press **Next change** until a reward finally lands in the table.',
				done: (s) => s.t > firstChange(s)
			}
		},
		{
			title: 'Many episodes: value flows backwards',
			body: (s) => {
				const o = outcomes(s);
				const ep = Math.min(EPISODES - 1, episodeNow(s));
				const g = greedy(s);
				return `Each episode is a run from S until the agent hits +10, −10 or ${MAX_STEPS} moves. A cell next to the goal learns its value first. The cell before that learns from *it* next time, and so on: value spreads **backwards** from the reward, one step per visit.

Episodes: **${o.done}** / ${EPISODES} (goal ${o.goal}, pit ${o.pit}, gave up ${o.timeout}). Exploration ε = ${f2(epsilonAt(opts(s), ep))}.

${g.outcome === 'goal' ? `The arrows (best action per cell) now lead from S to the goal in **${g.cells.length - 1}** moves.` : 'The arrows (best action per cell) don\'t reach the goal yet.'}`;
			},
			enter: (s) => {
				s.mode = 'learn';
				s.t = 0;
				s.show = { ...noShow, q: true, arrows: true, chart: true, path: true };
				s.ui = { ...off, run: true };
			},
			task: {
				prompt: 'Press **Train** and watch value flow back from the goal. Let all 200 episodes run (or skip to the end).',
				done: (s) => s.t >= total(s)
			}
		},
		{
			title: 'Explore or exploit? (ε-greedy)',
			body: (s) => {
				const o = outcomes(s);
				return `The agent picked moves **ε-greedily**: with probability ε a random move (**explore**), otherwise the move with the highest Q (**exploit**). Here ε started at **${s.eps}**${s.eps > EPS_MIN ? ` and decayed to ${EPS_MIN} by episode ${DECAY * EPISODES}: explore a lot early, then use what you've learned` : ''}.

With ε = ${s.eps}: goal reached in **${o.goal}** of ${o.done} episodes.`;
			},
			enter: (s) => {
				s.mode = 'learn';
				trainAll(s);
				s.show = { ...noShow, q: true, arrows: true, chart: true, path: true };
				s.ui = { ...off };
			},
			quiz: {
				question: 'What if ε = 0 from the very start, so the agent always takes its best-known move?',
				options: ['It learns the same path, only faster', 'It finds the goal but by a longer route', 'It never finds the goal at all'],
				answer: 2,
				explain: (s) =>
					`All Q values start equal, and \`np.argmax\` breaks ties by taking the first action: **up**. Moving up into the top edge gives reward 0 and target 0, so the table stays at 0 and the agent does the same thing again. That's ${EPISODES} episodes × ${MAX_STEPS} moves and the goal reached **${outcomes(s).goal}** times. Without exploration the agent can't learn what it never tries. Try the ε slider: even 0.1 often isn't enough here.`,
				reveal: (s) => {
					s.eps = 0;
					trainAll(s);
					s.ui.eps = true;
				}
			}
		},
		{
			title: 'Discount γ and learning rate α',
			body: (s) => {
				const v = maxQ(qNow(s), s.env.start);
				const d = shortest(plainEnv(s.env), s.env.goal);
				return `**γ (discount)** says how much a reward one step later is worth. The goal is ${d} moves from S, so the best value at S is 10 × γ^${d - 1} = **${f2(10 * s.gamma ** (d - 1))}**. The table has **${f2(v)}**. The cell shading shows max Q per cell. With no reward for ordinary moves, γ < 1 is what makes shorter routes worth more. A small γ makes the agent short-sighted: far from the goal, everything looks like ~0.

**α (learning rate)** is how far each update moves toward its target. This world is deterministic, so even α = 1 works. With random rewards or slippery moves, a smaller α (≈ 0.1) averages out the noise instead of chasing it.`;
			},
			enter: (s) => {
				s.mode = 'learn';
				s.eps = 1; // the previous quiz's reveal (ε = 0) is replayed before this step
				trainAll(s);
				s.show = { ...noShow, values: true, arrows: true, chart: true, nums: true };
				s.ui = { ...off, gamma: true, alpha: true };
			},
			task: {
				prompt: 'Drop **γ to 0.5 or lower** and watch the values far from the goal fade. Then try α to see how fast episodes get shorter in the chart.',
				done: (s) => s.gamma <= 0.5
			}
		},
		{
			title: 'Change the world',
			body: (s) => {
				const g = greedy(s);
				const d = shortest(plainEnv(s.env), s.env.goal);
				return `Q-learning is **model-free**: the agent never sees a map, only states, actions and rewards. Change the world and it simply learns again (each change retrains all ${EPISODES} episodes instantly).

${d < 0 ? '**The goal is unreachable** from S in this layout.' : g.outcome === 'goal' ? `Learned route: **${g.cells.length - 1}** moves (shortest possible: ${d}).` : `The greedy route doesn't reach the goal yet (shortest possible: ${d}). Some layouts need more exploration or episodes.`}`;
			},
			enter: (s) => {
				s.mode = 'learn';
				s.eps = 1;
				s.alpha = 0.5;
				s.gamma = 0.9;
				trainAll(s);
				s.show = { ...noShow, q: true, arrows: true, path: true };
				s.ui = { ...off, edit: true };
			},
			task: {
				prompt: 'Drag the **+10**, the **−10** or **S** to another cell, or click empty cells to add or remove walls.',
				done: (s) => s.did.goalMoved
			}
		},
		{
			title: 'From tables to Deep Q-Networks',
			body: `A table needs one row per state. That works for ${COLS * ROWS} cells but not for a robot's sensors or a game screen.

A **DQN** replaces the table with a neural network ([MLP](concept:mlp-neural-network) or CNN): the state goes in, one Q value per action comes out. It's trained by [gradient descent](concept:what-is-gradient-descent) on the squared TD error (r + γ·max Q⁻(s′,·) − Q(s,a))². Two tricks keep it stable:

- **Experience replay**: store transitions and train on random batches, so consecutive, highly correlated moves aren't learned in a row.
- **Target network** Q⁻: a slowly updated copy that computes the targets, so the network isn't chasing itself.`,
			enter: (s) => {
				s.mode = 'learn';
				s.env = plainEnv(START_ENV);
				s.eps = 1;
				s.alpha = 0.5;
				s.gamma = 0.9;
				trainAll(s);
				s.show = { ...noShow, q: true, arrows: true, dqn: true };
				s.ui = { ...off };
			},
			quiz: {
				question: 'An Atari agent sees 4 stacked 84×84 grayscale frames (256 shades). How many rows would a Q-table need?',
				options: ['About a million', 'About 10¹² (a trillion)', 'More than 10^60,000, one for every possible screen'],
				answer: 2,
				explain: `There are 256^(84·84·4) ≈ **10^67,970** possible inputs, far more than atoms in the universe (≈ 10^80). Almost every screen is seen at most once, so a table could never fill. A network **generalises**: similar screens give similar Q values. That's how DQN learned 49 Atari games from pixels in 2015.`,
				reveal: (s) => {
					s.show.tableSize = true;
				}
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked: step through updates, train, change α, γ and ε, and redesign the world.

1. **Q(s,a)** = expected discounted future reward of action *a* in state *s*.
2. After each move: Q ← Q + α·(r + γ·max Q(s′) − Q).
3. **ε-greedy** exploration, decayed over time.
4. **γ** sets how far ahead the agent looks; **α** how fast it updates.
5. Big state spaces: a network instead of a table (**DQN**), with replay and a target network.

For continuous actions, policy-gradient methods such as PPO or SAC are used instead.`,
			enter: (s) => {
				s.mode = 'learn';
				s.env = plainEnv(START_ENV);
				s.eps = 1;
				s.alpha = 0.5;
				s.gamma = 0.9;
				trainAll(s);
				s.show = { ...noShow, q: true, arrows: true, chart: true, path: true, update: true };
				s.ui = { walk: false, step: true, run: true, alpha: true, gamma: true, eps: true, edit: true };
			}
		}
	]
};

export default explainer;
