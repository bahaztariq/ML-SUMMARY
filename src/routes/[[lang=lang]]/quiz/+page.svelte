<script lang="ts">
	import { onMount } from 'svelte';
	import { conceptById, trackById, tracks } from '#lib/content.ts';
	import { i18n, lhref, num, pick, t } from '#lib/i18n/index.svelte.ts';
	import { answer, drawQuiz, QUIZ_LENGTH, summarize, type AnswerRecord, type Question, type Summary } from '#lib/quiz/engine.ts';
	import { quiz, type Mode } from '#lib/quiz/store.svelte.ts';
	import QuestionCard from '#lib/quiz/QuestionCard.svelte';
	import type { TrackId } from '#lib/types.ts';

	/* The bank is loaded on demand so it never weighs on other pages. */
	let bank = $state<Question[]>([]);
	const bankById = $derived(new Map(bank.map((q) => [q.id, q])));
	onMount(async () => {
		quiz.load();
		bank = (await import('#content/quiz/index.js')).questions as Question[];
	});

	const groupOf = (conceptId: string) => conceptById.get(conceptId)?.track ?? 'fundamentals';

	/* Topic filter: empty = every track. */
	let focus = $state<TrackId[]>([]);
	const toggleFocus = (id: TrackId) => (focus = focus.includes(id) ? focus.filter((x) => x !== id) : [...focus, id]);
	const countIn = (id: TrackId) => bank.filter((q) => groupOf(q.concept) === id).length;

	let result = $state<{ summary: Summary; isBest: boolean; records: AnswerRecord[] } | null>(null);
	const optionsOf = (q: Question) => q.options[i18n.current] ?? q.options.en;

	function start(mode: Mode) {
		result = null;
		const drawn = drawQuiz(bank, {
			seed: Date.now() % 2147483647,
			groupOf,
			stats: quiz.data.stats,
			only: mode === 'mistakes' ? new Set(quiz.mistakes) : undefined,
			groups: mode === 'random' && focus.length ? new Set(focus) : undefined
		});
		if (drawn.length) quiz.start(drawn, mode);
		window.scrollTo({ top: 0 });
	}

	const cur = $derived(quiz.current);
	const index = $derived(cur ? Math.min(cur.records.length, cur.drawn.length - 1) : 0);
	/** Answered the current question but not moved on yet. */
	let pending = $state(false);
	const shownIndex = $derived(cur ? (pending ? cur.records.length - 1 : cur.records.length) : 0);
	const drawnNow = $derived(cur?.drawn[shownIndex]);
	const questionNow = $derived(drawnNow ? bankById.get(drawnNow.id) : undefined);
	const recordNow = $derived(pending && cur ? cur.records.at(-1) : undefined);
	const pointsSoFar = $derived(cur ? cur.records.reduce((a, r) => a + r.points, 0) : 0);
	const streak = $derived(cur?.records.at(-1)?.streak ?? 0);

	function onanswer(chosen: number) {
		if (!cur || !questionNow || pending) return;
		quiz.record(answer(questionNow, chosen, cur.records));
		pending = true;
	}

	function onnext() {
		if (!cur) return;
		pending = false;
		if (cur.records.length >= cur.drawn.length) {
			const records = cur.records.slice();
			const summary = summarize(records, bankById, groupOf);
			const isBest = quiz.finish(summary);
			result = { summary, isBest, records };
		}
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function quit() {
		if (confirm(t('quiz.quitConfirm'))) {
			pending = false;
			quiz.abandon();
		}
	}

	function resetAll() {
		if (confirm(t('quiz.resetConfirm'))) quiz.reset();
	}

	const DATE_LOCALE = { en: 'en-US', fr: 'fr-FR', ar: 'ar-u-nu-latn' } as const;
	const fmtDate = (ms: number) => new Date(ms).toLocaleDateString(DATE_LOCALE[i18n.current], { day: 'numeric', month: 'short' });
	const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
</script>

<svelte:head>
	<title>{t('quiz.title')} · {t('site.name')}</title>
	<meta name="description" content={t('quiz.description', { bank: bank.length || 300 })} />
</svelte:head>

<div class="container page">
	{#if !quiz.ready || !bank.length}
		<div class="loading card">{t('quiz.loading')}</div>
	{:else if result}
		<!-- ===================== Results ===================== -->
		{@const s = result.summary}
		<section class="results">
			<div class="card score">
				<div class="ring" style:--p={pct(s.correct, s.total)}>
					<strong>{pct(s.correct, s.total)}%</strong>
				</div>
				<div class="score-text">
					<span class="eyebrow">{t('quiz.resultsTitle')}</span>
					<h1>{t('quiz.scoreLine', { correct: s.correct, total: s.total })}</h1>
					<p class="points-line">{t('quiz.pointsOf', { points: num(s.points), max: num(s.maxPoints) })}</p>
					{#if result.isBest}<span class="best-badge">★ {t('quiz.newBest')}</span>{/if}
				</div>
				<dl class="mini-stats">
					<div><dt>{t('quiz.bestStreak')}</dt><dd>🔥 {s.bestStreak}</dd></div>
				</dl>
			</div>

			<div class="results-grid">
				<section class="card panel">
					<h2>{t('quiz.byTrack')}</h2>
					<ul class="bars">
						{#each Object.entries(s.byGroup) as [g, v] (g)}
							<li style:--tc={trackById[g as TrackId]?.color}>
								<span class="bar-label">{trackById[g as TrackId]?.label ?? g}</span>
								<span class="bar"><span style:width="{pct(v.correct, v.total)}%"></span></span>
								<span class="bar-n">{v.correct}/{v.total}</span>
							</li>
						{/each}
					</ul>
				</section>

				<section class="card panel">
					<h2>{t('quiz.review')}</h2>
					{#if s.wrongIds.length === 0}
						<p class="muted">{t('quiz.perfect')}</p>
					{:else}
						<ol class="review-list">
							{#each result.records.filter((r) => !r.correct) as r (r.id)}
								{@const q = bankById.get(r.id)}
								{#if q}
									<li>
										<p class="rq">{pick(q.q)}</p>
										<p class="ra wrong-a">
											<span>{t('quiz.yourAnswer')}{t('common.colon')}</span>
											{r.chosen >= 0 ? optionsOf(q)[r.chosen] : '—'}
										</p>
										<p class="ra right-a">
											<span>{t('quiz.rightAnswer')}{t('common.colon')}</span>
											{optionsOf(q)[q.answer]}
										</p>
										<p class="rx">{pick(q.explain)}</p>
										<a class="review-link" href={lhref(`/concept/${q.concept}`)}>
											{t('quiz.learnMore', { name: conceptById.get(q.concept)?.name ?? q.concept })}
											{t('common.arrowForward')}
										</a>
									</li>
								{/if}
							{/each}
						</ol>
					{/if}
				</section>
			</div>

			<div class="result-actions">
				<button class="btn btn-primary" onclick={() => start('random')}>{t('quiz.again')}</button>
				{#if quiz.mistakes.length}
					<button class="btn" onclick={() => start('mistakes')}>{t('quiz.retryMistakes', { n: quiz.mistakes.length })}</button>
				{/if}
				<button class="btn btn-ghost" onclick={() => (result = null)}>{t('quiz.backHome')}</button>
			</div>
		</section>
	{:else if cur && questionNow && drawnNow}
		<!-- ===================== Playing ===================== -->
		<section class="play">
			<div class="hud">
				<div class="progress" role="progressbar" aria-valuenow={cur.records.length} aria-valuemin={0} aria-valuemax={cur.drawn.length}>
					<span style:width="{(cur.records.length / cur.drawn.length) * 100}%"></span>
				</div>
				<span class="hud-item pts">{t('quiz.pts', { n: num(pointsSoFar) })}</span>
				<span class="hud-item streak" class:hot={streak >= 3}>🔥 {streak}</span>
				<button class="btn btn-sm btn-ghost" onclick={quit}>{t('quiz.quit')}</button>
			</div>
			{#key drawnNow.id}
				<QuestionCard
					question={questionNow}
					drawn={drawnNow}
					index={shownIndex}
					total={cur.drawn.length}
					record={recordNow}
					last={shownIndex === cur.drawn.length - 1}
					{onanswer}
					{onnext}
				/>
			{/key}
		</section>
	{:else}
		<!-- ===================== Home ===================== -->
		<header class="head">
			<span class="eyebrow">{t('quiz.title')}</span>
			<h1>{t('quiz.pageTitle')}</h1>
			<p class="muted lead">{t('quiz.lead', { n: QUIZ_LENGTH, bank: bank.length })}</p>
		</header>

		<dl class="stats">
			<div class="card stat"><dt>{t('quiz.statAttempts')}</dt><dd>{quiz.data.history.length}</dd></div>
			<div class="card stat">
				<dt>{t('quiz.statBest')}</dt>
				<dd>{quiz.data.best ? num(quiz.data.best.points) : '—'}<small>{quiz.data.best ? ` ${t('quiz.points')}` : ''}</small></dd>
			</div>
			<div class="card stat"><dt>{t('quiz.statAnswered')}</dt><dd>{num(quiz.answeredCount)}</dd></div>
			<div class="card stat"><dt>{t('quiz.statAccuracy')}</dt><dd>{quiz.answeredCount ? `${Math.round(quiz.accuracy * 100)}%` : '—'}</dd></div>
		</dl>

		<section class="card start">
			<div class="focus">
				<span class="focus-label">{t('quiz.focus')}</span>
				<div class="chips">
					<button class:active={focus.length === 0} onclick={() => (focus = [])}>{t('quiz.allTracks')}</button>
					{#each tracks as tr (tr.id)}
						{#if countIn(tr.id)}
							<button class:active={focus.includes(tr.id)} style:--tc={tr.color} onclick={() => toggleFocus(tr.id)}>
								<span class="dot"></span>{tr.label}<span class="n">{countIn(tr.id)}</span>
							</button>
						{/if}
					{/each}
				</div>
			</div>
			<div class="start-actions">
				{#if cur}
					<button class="btn btn-primary btn-lg" onclick={() => (pending = false)}>
						{t('quiz.resume', { i: cur.records.length + 1, n: cur.drawn.length })}
					</button>
				{/if}
				<button class="btn btn-lg" class:btn-primary={!cur} onclick={() => start('random')}>
					{t('quiz.startN', { n: QUIZ_LENGTH })}
				</button>
				{#if quiz.mistakes.length}
					<button class="btn btn-lg" onclick={() => start('mistakes')}>{t('quiz.retryMistakes', { n: quiz.mistakes.length })}</button>
				{/if}
			</div>
			<p class="how muted">{t('quiz.howPoints')}</p>
		</section>

		<section class="history">
			<h2>{t('quiz.history')}</h2>
			{#if quiz.data.history.length === 0}
				<p class="muted">{t('quiz.noHistory')}</p>
			{:else}
				<ol class="hist">
					{#each quiz.data.history.slice(0, 10) as h (h.date)}
						<li class="card">
							<span class="h-date">{fmtDate(h.date)}</span>
							<span class="h-score">{h.correct}/{h.total}</span>
							<span class="h-bar"><span style:width="{pct(h.correct, h.total)}%"></span></span>
							<span class="h-pts">{t('quiz.pts', { n: num(h.points) })}</span>
							{#if h.mode === 'mistakes'}<span class="h-mode">{t('quiz.modeMistakes')}</span>{/if}
						</li>
					{/each}
				</ol>
				<button class="btn btn-sm btn-ghost reset" onclick={resetAll}>{t('quiz.resetProgress')}</button>
			{/if}
		</section>
	{/if}
</div>

<style>
	.page {
		padding-top: 36px;
		max-width: 920px;
	}
	.loading {
		padding: 80px 0;
		text-align: center;
		color: var(--text-3);
	}
	.head {
		display: grid;
		gap: 8px;
		margin-bottom: 24px;
	}
	.head .eyebrow {
		color: var(--accent);
	}
	.lead {
		max-width: 62ch;
		font-size: 1.0625rem;
	}

	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin: 0 0 16px;
	}
	.stat {
		flex: 1 1 160px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 14px 16px;
	}
	.stat dt {
		font-size: 0.8125rem;
		color: var(--text-3);
	}
	.stat dd {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 650;
		font-variant-numeric: tabular-nums;
	}
	.stat small {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-3);
	}

	.start {
		display: grid;
		gap: 18px;
		padding: 20px 22px;
		margin-bottom: 36px;
	}
	.focus {
		display: grid;
		gap: 8px;
	}
	.focus-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-3);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.chips button {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 32px;
		padding: 0 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		background: var(--surface);
		color: var(--text-2);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
	}
	.chips button.active {
		background: var(--text);
		border-color: var(--text);
		color: var(--bg);
	}
	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--tc);
	}
	.n {
		font-size: 0.75rem;
		opacity: 0.7;
	}
	.start-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
	.btn-lg {
		height: 44px;
		padding: 0 18px;
		font-size: 0.9375rem;
	}
	.how {
		font-size: 0.8125rem;
	}

	.history h2 {
		margin-bottom: 12px;
	}
	.hist {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.hist li {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 10px 14px;
		font-size: 0.875rem;
	}
	.h-date {
		color: var(--text-3);
	}
	.h-score {
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	.h-bar,
	.bar {
		flex: 1;
		min-width: 40px;
		height: 6px;
		border-radius: 3px;
		background: var(--surface-3);
		overflow: hidden;
	}
	.h-bar span,
	.bar span {
		display: block;
		height: 100%;
		background: var(--success);
		border-radius: 3px;
	}
	.h-pts {
		font-weight: 600;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
	}
	.h-mode {
		font-size: 0.75rem;
		padding: 1px 8px;
		border-radius: var(--radius-full);
		background: var(--surface-2);
		color: var(--text-2);
	}
	.reset {
		margin-top: 12px;
		color: var(--text-3);
	}

	/* Playing */
	.play {
		display: grid;
		gap: 14px;
	}
	.hud {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto auto auto;
		align-items: center;
		gap: 14px;
	}
	.progress {
		height: 8px;
		border-radius: 4px;
		background: var(--surface-3);
		overflow: hidden;
	}
	.progress span {
		display: block;
		height: 100%;
		background: var(--accent);
		transition: width 0.3s var(--ease);
	}
	.hud-item {
		font-weight: 650;
		font-variant-numeric: tabular-nums;
	}
	.pts {
		color: var(--accent);
	}
	.streak {
		color: var(--text-3);
	}
	.streak.hot {
		color: var(--warning);
	}

	/* Results */
	.results {
		display: grid;
		gap: 16px;
	}
	.score {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 24px;
		padding: 24px;
	}
	.ring {
		--p: 0;
		display: grid;
		place-items: center;
		width: 112px;
		height: 112px;
		border-radius: 50%;
		background:
			radial-gradient(closest-side, var(--surface) 78%, transparent 79%),
			conic-gradient(var(--success) calc(var(--p) * 1%), var(--surface-3) 0);
	}
	.ring strong {
		font-size: 1.5rem;
	}
	.score-text {
		display: grid;
		gap: 4px;
		justify-items: start;
	}
	.score-text .eyebrow {
		color: var(--accent);
	}
	.points-line {
		font-size: 1.0625rem;
		color: var(--text-2);
	}
	.best-badge {
		margin-top: 4px;
		padding: 3px 10px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--warning) 15%, transparent);
		color: var(--warning);
		font-size: 0.8125rem;
		font-weight: 700;
	}
	.mini-stats {
		margin: 0;
	}
	.mini-stats dt {
		font-size: 0.75rem;
		color: var(--text-3);
	}
	.mini-stats dd {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 650;
	}
	.results-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
		gap: 16px;
		align-items: start;
	}
	.panel {
		display: grid;
		gap: 12px;
		padding: 18px 20px;
	}
	.panel h2 {
		font-size: 1.0625rem;
	}
	.bars {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.bars li {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 0.875rem;
	}
	.bars .bar span {
		background: var(--tc, var(--success));
	}
	.bar-n {
		font-variant-numeric: tabular-nums;
		color: var(--text-3);
	}
	.review-list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 12px;
	}
	.review-list li {
		display: grid;
		gap: 4px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--border);
		font-size: 0.9rem;
	}
	.rq {
		font-weight: 600;
	}
	.ra span {
		color: var(--text-3);
		margin-inline-end: 4px;
	}
	.wrong-a {
		color: var(--danger);
	}
	.right-a {
		color: var(--success);
	}
	.rx {
		color: var(--text-2);
	}
	.review-link {
		justify-self: start;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--accent);
	}
	.result-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	@media (max-width: 720px) {
		.score {
			grid-template-columns: auto minmax(0, 1fr);
		}
		.mini-stats {
			grid-column: 1 / -1;
		}
		.results-grid {
			grid-template-columns: 1fr;
		}
		.h-mode {
			display: none;
		}
	}
</style>
