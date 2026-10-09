/**
 * Guided explainer: recommender systems (user-based CF, matrix factorisation, cold start, content-based).
 */
import type { ExplainerModule } from '../types.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import {
	EPOCHS,
	ITEMS,
	NEIGHBOURS,
	TAGS,
	USERS,
	cfPredict,
	contentScore,
	fmt1,
	fmt2,
	init,
	mfAt,
	noShow,
	off,
	profile,
	ratingsOf,
	sims,
	visible,
	type RecState
} from './state.ts';

function simSummary(s: RecState) {
	const list = sims(s)
		.map((x, v) => ({ v, sim: x.sim }))
		.filter((x) => x.v !== s.user && Number.isFinite(x.sim))
		.sort((a, b) => b.sim - a.sim);
	if (!list.length) return `**${USERS[s.user]}** shares no rated films with anyone, so no similarity can be computed.`;
	const best = list[0];
	const worst = list[list.length - 1];
	return `**${USERS[s.user]}** agrees most with **${USERS[best.v]}** (${fmt2(best.sim)}) and least with **${USERS[worst.v]}** (${fmt2(worst.sim)}).`;
}

function nearestItems(s: RecState, i: number) {
	const m = mfAt(s);
	return m.Q.map((q, j) => ({ j, d: Math.hypot(q[0] - m.Q[i][0], q[1] - m.Q[i][1]) }))
		.filter((x) => x.j !== i)
		.sort((a, b) => a.d - b.d);
}

const explainer: ExplainerModule<RecState> = {
	title: 'How recommender systems fill in the blanks',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'A sparse ratings matrix',
			body: (s) => {
				const r = visible(s);
				const filled = r.flat().filter((v) => v !== null).length;
				return `Six people rated six films from 1 to 5 stars. A **?** means they haven't seen that film. Here **${filled} of ${r.flat().length}** cells are filled; on a real site it's often under 1%.

A recommender's job is to **predict the blanks**, then show each person the unseen films with the highest predicted rating.

Look at the pattern: Ana, Ben and Eli love the first three films (sci-fi), while Cara, Dev and Fay prefer *Paris Kiss* and *Love Letters* (romance).`;
			},
			enter: (s) => {
				s.ui = { ...off, edit: true, pickCell: true };
			},
			task: {
				prompt: 'Click any cell and give it a different rating (or clear it).',
				done: (s) => s.did.edit
			}
		},
		{
			title: 'Who has similar taste?',
			body: (s) => `**Collaborative filtering** builds on one idea: *people who agreed in the past will agree again*.

To measure agreement, first subtract each user's own average, so a 3 from someone who usually gives 5s counts as "meh". Then take the **cosine similarity** over the films both rated: **+1** means the same taste, **−1** means opposite taste.

${simSummary(s)}`,
			enter: (s) => {
				s.ui = { ...off, pickUser: true };
				s.show = { ...noShow, sim: true };
				s.user = 0;
			},
			task: {
				prompt: "Click another user's name to see whose taste *they* share.",
				done: (s) => s.did.user
			}
		},
		{
			title: 'Predict a blank from neighbours',
			body: `To predict Ana's rating for *Love Letters*, find the **${NEIGHBOURS} users most similar to her who have rated it** (her nearest neighbours, as in [KNN](concept:knn)).

Then start from Ana's average and add the neighbours' opinions, weighted by similarity:

r̂ = mean(Ana) + Σ sim·(r − mean(neighbour)) / Σ |sim|

Using the neighbour's rating *relative to their own average* means a harsh rater's 3 counts as a strong like.`,
			enter: (s) => {
				s.user = 0;
				s.cell = { u: 0, i: 4 };
				s.show = { ...noShow, sim: true };
				s.ui = { ...off, pickCell: true };
			},
			quiz: {
				question: "Ana hasn't seen Love Letters. What will user-based CF predict?",
				options: ['About 2 or less', 'About 3', 'About 4 or more'],
				answer: 0,
				explain: (s) => {
					const p = cfPredict(s, 0, 4);
					const parts = p.neighbours.map((n) => `${USERS[n.v]} (sim ${fmt2(n.sim)}, gave ${n.rating}, ${n.dev >= 0 ? '+' : '−'}${fmt2(Math.abs(n.dev))} vs. their average)`);
					return `Ana averages **${fmt2(p.mean)}**. Her neighbours who rated it: ${parts.join(' and ')}. Both disliked it relative to their usual ratings, so the prediction is **${fmt1(p.pred)}**. Every blank now shows its CF prediction; click one to see its breakdown.`;
				},
				reveal: (s) => {
					s.show.formula = true;
					s.fill = 'cf';
				}
			}
		},
		{
			title: 'Matrix factorization: taste in a few numbers',
			body: (s) => {
				const m = mfAt(s);
				return `Comparing every pair of users gets slow with millions of them. **Matrix factorization** compresses instead: every user gets a short vector **pᵤ** and every film a vector **qᵢ** (here just *k* = 2 numbers each), plus a bias for each:

r̂ = μ + bᵤ + bᵢ + pᵤ · qᵢ

The dot product is large when a user's hidden tastes line up with a film's hidden traits. Nobody labels these traits. They start **random**, so every prediction is near the global average μ = **${fmt2(m.mu)}**. Click a cell to see its sum.`;
			},
			enter: (s) => {
				s.fill = 'mf';
				s.epoch = 0;
				s.cell = { u: 0, i: 4 };
				s.show = { ...noShow, factors: true };
				s.ui = { ...off, pickCell: true };
			}
		},
		{
			title: 'Learning the factors with SGD',
			body: (s) => {
				const m = mfAt(s);
				return `Training loops over the **observed** ratings only. For each one, it computes the error e = r − r̂ and nudges the two vectors toward each other (that's [gradient descent](concept:what-is-gradient-descent), one rating at a time):

pᵤ ← pᵤ + η·(e·qᵢ − λ·pᵤ)

qᵢ ← qᵢ + η·(e·pᵤ − λ·qᵢ)

λ is an L2 penalty that keeps the vectors small so they don't just memorise the few ratings.

Epoch **${m.epoch}** of ${EPOCHS}, RMSE on known ratings **${fmt2(m.rmse)}**. The blanks are never trained on, yet they fill in.`;
			},
			enter: (s) => {
				s.fill = 'mf';
				s.epoch = 0;
				s.cell = null;
				s.show = { ...noShow, train: true };
				s.ui = { ...off, train: true };
			},
			task: {
				prompt: 'Press **Train** and watch the error fall, the blanks fill in and the films arrange themselves on the map.',
				done: (s) => s.epoch >= EPOCHS
			}
		},
		{
			title: 'Reading the item map',
			body: (s) => {
				const base = `With *k* = 2 each film's vector qᵢ is a point on the map. Nobody told the model about genres, yet films **loved by the same people end up close**. The axes themselves have no fixed meaning: only directions and closeness matter.

Users are points too (squares): a user sits on the side of the films they like, since that makes pᵤ·qᵢ large.`;
				if (s.focus < 0) return base;
				const near = nearestItems(s, s.focus);
				return `${base}

Closest to **${ITEMS[s.focus]}**: ${near
					.slice(0, 2)
					.map((x) => `${ITEMS[x.j]} (distance ${fmt2(x.d)})`)
					.join(', ')}. That's a "because you watched…" list.`;
			},
			enter: (s) => {
				s.fill = 'mf';
				s.epoch = EPOCHS;
				s.show = { ...noShow, train: true };
				s.ui = { ...off, focus: true };
			},
			task: {
				prompt: 'Click a film on the map to see its nearest neighbours. Where did *Moonlit Orbit* (a sci-fi romance) land?',
				done: (s) => s.did.focus
			}
		},
		{
			title: 'The cold start problem',
			body: (s) => {
				const n = ratingsOf(visible(s), 6);
				if (n === 0)
					return `**Gus** just signed up and hasn't rated anything.

- **CF**: no shared films means no similarity, so no neighbours and no predictions.
- **MF**: no ratings means his vector p was never trained. The best fallback is **μ + bᵢ**, the same "most popular" list for every newcomer (shown in his row).

Items have the same problem: a film nobody has rated can't be recommended.`;
				return `Gus has **${n}** rating${n > 1 ? 's' : ''}. ${n >= 2 ? (sims(s, 6).some((x, v) => v !== 6 && Number.isFinite(x.sim)) ? `Now similarities exist, his vector p is trained, and his row turns personal.` : 'His vector p is trained now, but CF still has no similarity: all his ratings are equal, so relative to his average they are all 0. Make them differ.') : 'One rating is not enough for CF: with one value, his mean-centred rating is 0 and cosine similarity is undefined.'}

That's why sign-up flows ask you to pick a few favourites, and why new items are promoted using their metadata.`;
			},
			enter: (s) => {
				s.nUsers = 7;
				s.user = 6;
				s.fill = 'mf';
				s.epoch = EPOCHS;
				s.cell = { u: 6, i: 0 };
				s.show = { ...noShow, sim: true };
				s.ui = { ...off, edit: true, pickCell: true, fill: true };
			},
			task: {
				prompt: "Give Gus **two** ratings (click his cells) and watch his predictions change. Toggle CF / MF to compare.",
				done: (s) => ratingsOf(visible(s), 6) >= 2
			}
		},
		{
			title: 'Content-based vs. collaborative',
			body: (s) => {
				const p = profile(s, s.user);
				return `**Content-based** filtering ignores other users. It describes each film by its tags and builds a taste profile from the user's own ratings: each tag gets the sum of (rating − their average) over the films that have it.

${USERS[s.user]}'s profile: ${TAGS.map((t, j) => `${t} ${fmt2(p[j])}`).join(', ')}. A film's score is the cosine between its tags and that profile.

Notice *Moonlit Orbit*: content says ${fmt2(contentScore(s, s.user, 5))} (its sci-fi and romance tags cancel out), while CF sees that people with ${USERS[s.user]}'s taste rated it highly.`;
			},
			enter: (s) => {
				s.nUsers = 6;
				s.user = 0;
				s.fill = 'cf';
				s.cell = null;
				s.show = { ...noShow, content: true };
				s.ui = { ...off, pickUser: true };
			},
			quiz: {
				question: 'A new film, Nebula Run (sci-fi, action), is released with zero ratings. Which approach can recommend it to Ana?',
				options: ['Collaborative filtering', 'Content-based', 'Neither, until someone rates it'],
				answer: 1,
				explain: (s) =>
					`Its tags alone give a content score of **${fmt2(contentScore(s, 0, 6))}** for Ana, her best match. CF and MF have nothing to go on until people rate it. Each approach covers the other's blind spot, so production systems are **hybrids**: content (or [embeddings](concept:embeddings) of text and images) for new items, collaborative signals once data arrives. Then they're judged by [A/B tests](concept:ab-testing-deployment), not offline error alone.`,
				reveal: (s) => {
					s.nItems = 7;
				}
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked: edit ratings, pick users, switch the blanks between CF and MF predictions, retrain, and change λ.

1. **User-based CF**: similar users (mean-centred cosine), weighted average of their deviations.
2. **Matrix factorization**: r̂ = μ + bᵤ + bᵢ + pᵤ·qᵢ, trained by SGD on observed cells with an L2 penalty.
3. **Cold start**: new users and items have no signal. Fall back to popularity or content.
4. **Content-based** uses item features; **hybrids** combine both.

Real systems are evaluated on held-out interactions split by time, with ranking metrics like Precision@K or NDCG@K.`,
			enter: (s) => {
				s.nUsers = 7;
				s.nItems = 7;
				s.user = 0;
				s.fill = 'mf';
				s.epoch = EPOCHS;
				s.cell = null;
				s.show = { sim: true, formula: true, factors: false, train: true, content: true };
				s.ui = { edit: true, pickUser: true, pickCell: true, fill: true, train: true, lambda: true, focus: true };
			}
		}
	]
};

export default explainer;
