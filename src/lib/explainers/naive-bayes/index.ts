/**
 * Guided explainer: naive Bayes — Bayes' theorem on a spam filter, the independence assumption,
 * Laplace smoothing, and Gaussian NB on 2-D data.
 */
import type { ExplainerModule } from '../types.ts';
import Scene from './Scene.svelte';
import i18n from './i18n.ts';
import { N_HAM, N_SPAM, likelihood, posterior, wordById } from './nb.ts';
import { BASE_VOCAB, accuracyOf, activeWords, gnb, init, off, pSpam, post, probeB, setWords, type NBState } from './state.ts';

const f2 = (v: number) => v.toFixed(2);
const f3 = (v: number) => v.toFixed(3);
const pct = (v: number, d = 0) => `${(v * 100).toFixed(d)}%`;
const sd = (v: number) => Math.sqrt(v).toFixed(2);

const explainer: ExplainerModule<NBState> = {
	title: 'How naive Bayes weighs the evidence',
	init,
	Scene,
	i18n,
	steps: [
		{
			title: 'Before reading a word: the prior',
			body: `We'll build a spam filter. In our training set of **${N_SPAM + N_HAM} emails**, ${N_SPAM} are spam and ${N_HAM} are ham (normal mail). Before looking at a new email at all, the best guess is the **prior**:

\`P(spam) = ${N_SPAM}/${N_SPAM + N_HAM} = ${f2(N_SPAM / (N_SPAM + N_HAM))}\`

Reading the email should update that belief. **Bayes' theorem** says how:

\`P(spam | words) = P(words | spam) · P(spam) / P(words)\`

P(words | spam) is the **likelihood**: how typical these words are of spam. That we can count from the training emails.`
		},
		{
			title: 'One word of evidence',
			body: (s) => {
				const w = wordById.get('free')!;
				const ls = w.spam / N_SPAM;
				const lh = w.ham / N_HAM;
				const ps = N_SPAM / (N_SPAM + N_HAM);
				return `The email contains **"free"**. It appears in ${w.spam} of the ${N_SPAM} spam emails and ${w.ham} of the ${N_HAM} ham emails:

\`P(free | spam) = ${f2(ls)}\`, \`P(free | ham) = ${f2(lh)}\`

Multiply each by its prior: spam ${f2(ls)} × ${f2(ps)} = **${f2(ls * ps)}**, ham ${f2(lh)} × ${f2(1 - ps)} = **${f2(lh * (1 - ps))}**. Dividing by their sum (that's P(words)) makes them add up to 1:

\`P(spam | free) = ${f2(ls * ps)} / ${f2(ls * ps + lh * (1 - ps))} = ${f2((ls * ps) / (ls * ps + lh * (1 - ps)))}\`

With the words currently on, the filter says **P(spam) = ${pct(pSpam(s))}**.`;
			},
			enter: (s) => {
				s.vocab = ['free', 'meeting'];
				setWords(s, ['free']);
				s.ui.words = true;
			},
			task: {
				prompt: 'Turn **meeting** on and off. Which way does it push the posterior?',
				done: (s) => s.did.meeting
			}
		},
		{
			title: 'Many words: the naive assumption',
			body: (s) => {
				const ws = activeWords(s);
				return `With several words we need P(free, click, … | spam), the probability of seeing that exact **combination**. Estimating every combination would need astronomically many emails.

Naive Bayes makes one bold simplification: **words are independent once you know the class**. Then the likelihood is just a product:

\`P(spam | words) ∝ P(spam) · P(w₁ | spam) · P(w₂ | spam) · …\`

That's the "naive" part. It's rarely true ("free" and "click" tend to come together), but it makes training a matter of counting, one number per word per class.

Words on: ${ws.length ? ws.map((w) => `**${w.label}**`).join(', ') : 'none'}. P(spam) = **${pct(pSpam(s), 1)}**.`;
			},
			enter: (s) => {
				s.vocab = [...BASE_VOCAB];
				setWords(s, ['free', 'click']);
			},
			quiz: {
				question: 'We add a feature "FREE!!" that is really "free" in capitals, so it appears in exactly the same emails. An email contains both. What does naive Bayes do?',
				options: ['Notices the duplicate and counts it once', 'Counts the same evidence twice and becomes overconfident', 'Averages the two likelihoods'],
				answer: 1,
				explain: (s) => {
					const once = posterior([wordById.get('free')!], s.alpha).post[0];
					const twice = posterior([wordById.get('free')!, wordById.get('FREE')!], s.alpha).post[0];
					return `Independence means each feature is treated as **new** evidence, so the copy multiplies in the same factor again: "free" alone gives ${pct(once)}, "free" + "FREE!!" gives **${pct(twice)}**, though nothing new was learned. Correlated features make naive Bayes **overconfident**. Its rankings are often good, but its probabilities are poorly calibrated.`;
				},
				reveal: (s) => {
					s.vocab = [...BASE_VOCAB, 'FREE'];
					setWords(s, ['free', 'FREE']);
				}
			}
		},
		{
			title: 'Evidence adds up in log space',
			body: (s) => {
				const p = post(s);
				return `Multiplying hundreds of small probabilities underflows to 0, so real implementations add **logarithms** instead. In log-odds form every word adds a fixed push:

\`log-odds = ln(P(spam)/P(ham)) + Σ ln(P(wᵢ | spam) / P(wᵢ | ham))\`

The bars show each term: right pushes toward spam, left toward ham. The prior starts at ${f2(p.priorLogOdds)}; the total is **${f2(p.logOdds)}**, which is P(spam) = ${pct(pSpam(s), 1)}.

Adding up per-feature weights makes naive Bayes a **linear** classifier in log space, a close cousin of [logistic regression](concept:logistic-regression).`;
			},
			enter: (s) => {
				s.vocab = [...BASE_VOCAB];
				setWords(s, ['free']);
				s.show.logs = true;
			},
			task: {
				prompt: 'Make the email look like ham: get **P(spam) below 5%**.',
				done: (s) => pSpam(s) < 0.05
			}
		},
		{
			title: 'One zero wipes out everything',
			body: `A new word: **"winner"**. It appeared in 12 of the ${N_SPAM} spam emails and in **none** of the ${N_HAM} ham emails. So, counting directly:

\`P(winner | ham) = 0 / ${N_HAM} = 0\`

That doesn't mean ham can never say "winner". We just haven't seen it in 60 emails.`,
			enter: (s) => {
				s.vocab = [...BASE_VOCAB, 'winner'];
				setWords(s, []);
			},
			quiz: {
				question: 'An email contains "meeting", "report" and "winner". What does the filter say?',
				options: ['Low P(spam): two hammy words outweigh one spammy word', 'P(spam) = 100%: the single zero erases all evidence for ham', 'About 50%: the evidence cancels out'],
				answer: 1,
				explain: `The ham score is a product, and one factor is 0, so P(ham | words) = 0 however strongly "meeting" and "report" point to ham. In log space that word pushes **infinitely** far. One unseen word decides the whole email.`,
				reveal: (s) => setWords(s, ['meeting', 'report', 'winner'])
			}
		},
		{
			title: 'Laplace smoothing',
			body: (s) => {
				const w = wordById.get('winner')!;
				return `The fix is to pretend every count is a little bigger. **Laplace (additive) smoothing** adds α to each count:

\`P(w | class) = (count + α) / (n_class + 2α)\`

(2α in the denominator because a word can be present or absent.) With α = ${s.alpha}: P(winner | ham) = (0 + ${s.alpha}) / (${N_HAM} + ${2 * s.alpha}) = **${f3(likelihood(w.ham, N_HAM, s.alpha))}**, small but no longer zero.

P(spam) for this email: **${pct(pSpam(s), 1)}**. Smoothing also pulls every likelihood slightly toward 50%, which matters most for rare words.`;
			},
			enter: (s) => {
				s.vocab = [...BASE_VOCAB, 'winner'];
				setWords(s, ['meeting', 'report', 'winner']);
				s.alpha = 0;
				s.ui.alpha = true;
			},
			task: {
				prompt: 'Set **α = 1** (scikit-learn’s default) and watch the other words get their say back.',
				done: (s) => s.alpha === 1
			}
		},
		{
			title: 'Continuous features: Gaussian naive Bayes',
			body: (s) => {
				const m = gnb(s);
				return `Words are yes/no features. For numbers, **Gaussian NB** models each feature within each class as a **bell curve** with its own mean and standard deviation. The curves along the edges are those fitted bell curves:

- class A: x₁ ~ mean ${f2(m.mean[0][0])}, sd ${sd(m.var[0][0])}; x₂ ~ mean ${f2(m.mean[0][1])}, sd ${sd(m.var[0][1])}
- class B: x₁ ~ mean ${f2(m.mean[1][0])}, sd ${sd(m.var[1][0])}; x₂ ~ mean ${f2(m.mean[1][1])}, sd ${sd(m.var[1][1])}

Under the naive assumption the 2-D likelihood is the product \`P(x | c) = N(x₁; μ, σ²) · N(x₂; μ, σ²)\`. Its contours (the ellipses) are always **lined up with the axes**. Training is just 8 averages plus the class priors.`;
			},
			enter: (s) => {
				s.ui = { ...off };
				s.show.logs = false;
				s.mode = 'gauss';
				s.dataset = 'blobs';
				s.show.gaussians = true;
				s.show.marginals = true;
			}
		},
		{
			title: 'From bell curves to a boundary',
			body: (s) => {
				const pb = probeB(s);
				return `For any point, Bayes' theorem turns the two likelihoods and the priors into a posterior. The shading shows P(B | x); the solid curve is where both classes are equally likely.

The boundary is **curved**: class A is wide in x₁ and narrow in x₂, class B the other way round, and unequal variances give a quadratic boundary.

The ◆ probe has P(B) = **${pct(pb)}**, P(A) = ${pct(1 - pb)}. Training accuracy: ${pct(accuracyOf(s))}.`;
			},
			enter: (s) => {
				s.show.regions = true;
				s.show.probe = true;
				s.ui.probe = true;
			},
			task: {
				prompt: 'Drag the ◆ probe to a spot where the model is torn: **P(B) between 35% and 65%**.',
				done: (s) => s.did.probeEven
			}
		},
		{
			title: 'When the naive assumption hurts',
			body: `New data: in both classes x₁ and x₂ are strongly **correlated**, so each cloud is a diagonal streak. The classes sit side by side, separated across the diagonal.`,
			enter: (s) => {
				s.ui = { ...off };
				s.show.probe = false;
				s.show.regions = false;
				s.show.gaussians = false;
				s.show.marginals = false;
				s.dataset = 'tilted';
			},
			quiz: {
				question: 'What will Gaussian NB’s fitted ellipses look like on this data?',
				options: ['Tilted along the diagonal, matching each streak', 'Lined up with the axes: NB cannot represent correlation', 'Perfect circles'],
				answer: 1,
				explain: (s) =>
					`NB fits each feature separately, so it never sees that x₁ and x₂ move together. Its ellipses are axis-aligned and much fatter than the streaks, and the two classes overlap heavily in its eyes. Accuracy: **${pct(accuracyOf(s))}**. A Gaussian with a full covariance matrix (dashed boundary) gets ${pct(accuracyOf(s, 'qda'))}. That's the model behind [Gaussian mixtures](concept:gmm).`,
				reveal: (s) => {
					s.show.gaussians = true;
					s.show.regions = true;
					s.show.full = true;
				}
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked: switch between the spam filter and the 2-D view, toggle words, change α, drag the probe.

Recap:

1. **Bayes' theorem**: posterior ∝ likelihood × prior, then normalize so it sums to 1.
2. **Naive**: features are assumed independent given the class, so likelihoods multiply (log-likelihoods add).
3. Training is **counting** (or averaging for Gaussian NB): very fast, and it works with little data.
4. A zero count vetoes everything. **Laplace smoothing** (α = 1) prevents it.
5. Correlated features get double-counted. Rankings stay useful, but probabilities come out overconfident.

Naive Bayes is a strong, fast baseline for text. Compare it with [logistic regression](concept:logistic-regression), and check it with [precision and recall](concept:precision-recall-f1).`,
			enter: (s) => {
				s.ui = { words: true, alpha: true, mode: true, dataset: true, probe: true };
				s.show = { logs: true, gaussians: true, marginals: true, regions: true, full: false, probe: true };
				s.mode = 'text';
				s.dataset = 'blobs';
				s.vocab = [...BASE_VOCAB, 'winner', 'FREE'];
				setWords(s, ['free', 'click']);
				s.alpha = 1;
			}
		}
	]
};

export default explainer;
