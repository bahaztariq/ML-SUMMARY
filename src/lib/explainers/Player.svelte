<script lang="ts">
	import { onMount, tick, untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { i18n, t } from '#lib/i18n/index.svelte.ts';
	import { rich } from './rich.ts';
	import { localizeStep, type ExplainerModule, type Text } from './types.ts';

	interface Props {
		module: ExplainerModule;
		accent?: string;
		onfinish?: () => void;
	}

	let { module, accent = 'var(--accent)', onfinish }: Props = $props();

	/** Steps with the current language's narration merged in (behaviour is shared). */
	const steps = $derived.by(() => {
		const tr = i18n.current === 'en' ? undefined : module.i18n?.[i18n.current];
		return module.steps.map((st, i) => localizeStep(st, tr?.steps?.[i]));
	});
	let index = $state(0);
	/** Quiz answers by step index. */
	let answers = $state<Record<number, number>>({});
	let s = $state(untrack(() => build(0)));
	const visited = new SvelteSet<number>([0]);
	const completed = new SvelteSet<number>();

	const step = $derived(steps[index]);
	const text = (v: Text<any>) => rich(typeof v === 'function' ? v(s) : v);
	/**
	 * Inactive steps are only laid out to reserve height. Their live-number text is taken from
	 * a snapshot rendered with that step's own state while measuring (see measureAll); before
	 * that exists they fall back to the current state, and render nothing if that fails.
	 */
	type Snapshot = { body: string; prompt?: string; explain?: string };
	let snapshots = $state<{ lang: string; steps: Record<number, Snapshot> }>({ lang: '', steps: {} });
	const textAt = (v: Text<any>, active: boolean, i: number, field: keyof Snapshot) => {
		if (active || typeof v !== 'function') return text(v);
		const snap = snapshots.lang === i18n.current ? snapshots.steps[i]?.[field] : undefined;
		if (snap !== undefined) return snap;
		try {
			return text(v);
		} catch {
			return '';
		}
	};
	function snapshot(i: number, state: any): Snapshot {
		const st = steps[i];
		const render = (v: Text<any> | undefined) => {
			if (v === undefined) return undefined;
			try {
				return rich(typeof v === 'function' ? v(state) : v);
			} catch {
				return '';
			}
		};
		return { body: render(st.body) ?? '', prompt: render(st.task?.prompt), explain: render(st.quiz?.explain) };
	}
	const taskDone = $derived(step.task ? step.task.done(s) : false);
	const answered = $derived(answers[index] !== undefined);

	$effect(() => {
		if (taskDone) completed.add(index);
	});

	/** Build state for step i by replaying init() and every step's setup up to it. */
	function build(i: number) {
		const fresh = module.init();
		for (let j = 0; j <= i; j++) {
			module.steps[j].enter?.(fresh);
			if ((j < i || answers[j] !== undefined) && module.steps[j].quiz?.reveal) module.steps[j].quiz!.reveal!(fresh);
		}
		return fresh;
	}

	function goTo(i: number) {
		i = Math.max(0, Math.min(steps.length - 1, i));
		s = build(i);
		index = i;
		visited.add(i);
	}

	function answer(option: number) {
		if (answered) return;
		answers[index] = option;
		step.quiz?.reveal?.(s);
		completed.add(index);
	}

	function onkeydown(e: KeyboardEvent) {
		const target = e.target as HTMLElement;
		if (target.closest('input, select, textarea')) return;
		// "Forward" is to the right in LTR and to the left in RTL.
		const fwd = i18n.rtl ? 'ArrowLeft' : 'ArrowRight';
		const back = i18n.rtl ? 'ArrowRight' : 'ArrowLeft';
		if (e.key === fwd) {
			e.preventDefault();
			goTo(index + 1);
		} else if (e.key === back) {
			e.preventDefault();
			goTo(index - 1);
		}
	}

	const Scene = $derived(module.Scene);
	const title = $derived((i18n.current !== 'en' && module.i18n?.[i18n.current]?.title) || module.title);

	/*
	 * Stable stage height. Scenes add panels on some steps, so after the first paint the player
	 * quietly renders every step's scene in an invisible copy (one per idle slot), measures it,
	 * and reserves the tallest height. Live changes can still only grow the reservation.
	 */
	let stageInner = $state<HTMLDivElement>();
	let stageMin = $state(0);
	const grow = (h: number) => {
		if (h > untrack(() => stageMin)) stageMin = h;
	};
	$effect(() => {
		const el = stageInner;
		if (!el) return;
		// Reserve only heights that persist: a step change can overlap old and new content for a
		// frame, and that momentary spike must not grow the panel for good.
		let settle: ReturnType<typeof setTimeout> | undefined;
		const ro = new ResizeObserver(() => {
			clearTimeout(settle);
			settle = setTimeout(() => grow(Math.ceil(el.getBoundingClientRect().height)), 250);
		});
		ro.observe(el);
		return () => {
			clearTimeout(settle);
			ro.disconnect();
		};
	});

	let measureStep = $state<number | null>(null);
	let measureState = $state<any>(null);
	let measureEl = $state<HTMLDivElement>();
	let measureRun = 0;
	const idle = () =>
		new Promise<void>((r) =>
			'requestIdleCallback' in window ? requestIdleCallback(() => r(), { timeout: 400 }) : setTimeout(r, 30)
		);
	const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

	async function measureAll() {
		const run = ++measureRun;
		// Each step as it first appears, plus quiz steps with their reveal applied.
		const variants = module.steps.flatMap((st, i) => (st.quiz?.reveal ? [[i, false], [i, true]] : [[i, false]])) as [number, boolean][];
		const lang = i18n.current;
		const snaps: Record<number, Snapshot> = {};
		for (const [i, revealed] of variants) {
			await idle();
			if (run !== measureRun) return;
			try {
				const st = build(i);
				if (revealed) module.steps[i].quiz!.reveal!(st);
				// Keep the longer of the two variants' narration (the reveal can change live numbers).
				const snap = snapshot(i, st);
				const prev = snaps[i];
				snaps[i] = !prev || snap.body.length + (snap.explain?.length ?? 0) > prev.body.length + (prev.explain?.length ?? 0) ? snap : prev;
				measureState = st;
			} catch {
				continue;
			}
			measureStep = i;
			await tick();
			await frame();
			await frame();
			if (run !== measureRun) return;
			if (measureEl) grow(Math.ceil(measureEl.getBoundingClientRect().height));
		}
		measureStep = null;
		measureState = null;
		snapshots = { lang, steps: snaps };
	}

	// A language change changes every text: measure again.
	let measuredLang = untrack(() => i18n.current);
	$effect(() => {
		const lang = i18n.current;
		if (lang !== measuredLang) {
			measuredLang = lang;
			stageMin = 0;
			measureAll();
		}
	});

	onMount(() => {
		measureAll();
		return () => measureRun++;
	});

	// Width changes (rotation, resizing) legitimately change heights: measure again.
	let lastWidth = 0;
	let resizeTimer: ReturnType<typeof setTimeout> | undefined;
	function onresize() {
		if (window.innerWidth === lastWidth) return;
		lastWidth = window.innerWidth;
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			stageMin = 0;
			measureAll();
		}, 250);
	}
</script>

<svelte:window {onresize} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section class="player" style:--acc={accent} {onkeydown} aria-label={title}>
	<div class="stage">
		<div class="stage-inner" style:min-height="{stageMin}px">
			<div bind:this={stageInner}>
				<Scene bind:s step={index} />
			</div>
			{#if measureStep !== null && measureState}
				<!-- Invisible copy used only to measure each step's height (see measureAll). -->
				<div class="measure" aria-hidden="true" inert>
					<div bind:this={measureEl}>
						{#key measureStep}
							<Scene bind:s={measureState} step={measureStep} />
						{/key}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<div class="narration">
		<div class="top">
			<span class="count">{t('player.stepOf', { i: index + 1 })} <span class="of">{t('player.ofN', { n: steps.length })}</span></span>
			<div class="dots" role="tablist" aria-label={t('player.steps')}>
				{#each steps as st, i (i)}
					<button
						role="tab"
						class="dot"
						class:current={i === index}
						class:seen={visited.has(i)}
						class:done={completed.has(i)}
						aria-selected={i === index}
						aria-label={t('player.stepAria', { i: i + 1, title: st.title })}
						title={st.title}
						onclick={() => goTo(i)}
					></button>
				{/each}
			</div>
		</div>

		<!--
			Every step's narration sits in the same grid cell; only the current one is visible.
			The cell is therefore as tall as the longest step, so the panel never resizes.
		-->
		<div class="contents">
			{#each steps as st, i (i)}
				{@const active = i === index}
				{@const isAnswered = answers[i] !== undefined}
				<div class="content" class:active aria-hidden={!active} inert={!active}>
					<h3>{st.title}</h3>
					<div class="body">{@html textAt(st.body, active, i, 'body')}</div>

					{#if st.task}
						{@const done = active ? taskDone : completed.has(i)}
						<div class="task" class:done>
							<span class="task-icon" aria-hidden="true">{done ? '✓' : t('common.arrowForward')}</span>
							<div>
								<span class="task-label">{done ? t('player.niceTask') : t('player.tryIt')}</span>
								<div class="task-text">{@html textAt(st.task.prompt, active, i, 'prompt')}</div>
							</div>
						</div>
					{/if}

					{#if st.quiz}
						{@const quiz = st.quiz}
						<div class="quiz">
							<p class="question">{quiz.question}</p>
							<div class="options">
								{#each quiz.options as opt, k (k)}
									<button
										class="option"
										class:correct={isAnswered && k === quiz.answer}
										class:wrong={isAnswered && answers[i] === k && k !== quiz.answer}
										disabled={isAnswered || !active}
										onclick={() => answer(k)}
									>
										<span class="letter">{[...t('common.optionLetters')][k] ?? String.fromCharCode(65 + k)}</span>
										<span>{opt}</span>
									</button>
								{/each}
							</div>
							<!-- Always laid out (hidden until answered) so answering never grows the panel. -->
							<div class="explain" class:right={answers[i] === quiz.answer} class:hidden={!isAnswered} aria-live="polite">
								<strong>{answers[i] === quiz.answer ? t('player.correct') : t('player.notQuite')}</strong>
								{@html textAt(quiz.explain, active, i, 'explain')}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<div class="nav">
			<button class="btn btn-ghost" onclick={() => goTo(index - 1)} disabled={index === 0}>{t('common.arrowBack')} {t('common.back')}</button>
			{#if index < steps.length - 1}
				<button class="btn btn-primary" onclick={() => goTo(index + 1)}>
					{step.quiz && !answered ? t('common.skip') : t('common.next')} {t('common.arrowForward')}
				</button>
			{:else}
				<button class="btn" onclick={() => goTo(0)}>↺ {t('common.restart')}</button>
				{#if onfinish}<button class="btn btn-primary" onclick={onfinish}>{t('common.finish')} ✓</button>{/if}
			{/if}
		</div>
	</div>
</section>

<style>
	.player {
		display: grid;
		grid-template-columns: minmax(0, 1.65fr) minmax(300px, 1fr);
		gap: 0;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow);
	}
	.stage {
		padding: 16px;
		border-inline-end: 1px solid var(--border);
		background: var(--viz-bg);
		min-width: 0;
	}
	.narration {
		display: flex;
		flex-direction: column;
		padding: 20px 22px;
		min-height: 420px;
	}
	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 18px;
	}
	.count {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--acc);
		white-space: nowrap;
	}
	.of {
		color: var(--text-3);
		font-weight: 500;
	}
	.dots {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 5px;
	}
	.dot {
		width: 8px;
		height: 8px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: var(--surface-3);
		cursor: pointer;
		transition:
			width 0.2s var(--ease),
			background 0.2s var(--ease);
	}
	.dot.seen {
		background: color-mix(in srgb, var(--acc) 40%, var(--surface-3));
	}
	.dot.done {
		background: var(--success);
	}
	.dot.current {
		width: 20px;
		border-radius: 4px;
		background: var(--acc);
	}
	.stage-inner {
		position: relative;
		min-width: 0;
	}
	.measure {
		position: absolute;
		inset-inline: 0;
		top: 0;
		visibility: hidden;
		pointer-events: none;
		overflow: hidden;
		height: 0;
	}
	.measure > div {
		height: auto;
	}
	.contents {
		flex: 1;
		display: grid;
	}
	.content {
		grid-area: 1 / 1;
		min-width: 0;
		visibility: hidden;
	}
	.content.active {
		visibility: visible;
		animation: in 0.25s var(--ease);
	}
	h3 {
		font-size: 1.125rem;
		margin-bottom: 10px;
	}
	.body {
		color: var(--text-2);
		display: grid;
		gap: 10px;
	}
	.body :global(ol),
	.body :global(ul) {
		margin: 0;
		padding-inline-start: 1.3em;
		display: grid;
		gap: 4px;
	}
	.body :global(strong) {
		color: var(--text);
		font-weight: 600;
	}
	.body :global(code),
	.task :global(code),
	.explain :global(code) {
		padding: 1px 5px;
		border-radius: 4px;
		background: var(--surface-2);
		color: var(--text);
		font-size: 0.85em;
	}
	:global(.concept-link) {
		color: var(--accent);
		font-weight: 500;
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--accent) 35%, transparent);
		text-underline-offset: 2px;
	}
	.task {
		display: flex;
		gap: 10px;
		margin-top: 16px;
		padding: 12px 14px;
		border-radius: var(--radius);
		border: 1px dashed color-mix(in srgb, var(--acc) 50%, var(--border));
		background: color-mix(in srgb, var(--acc) 6%, transparent);
		font-size: 0.9rem;
		transition:
			background 0.25s var(--ease),
			border-color 0.25s var(--ease);
	}
	.task.done {
		border-style: solid;
		border-color: color-mix(in srgb, var(--success) 50%, var(--border));
		background: color-mix(in srgb, var(--success) 8%, transparent);
	}
	.task-icon {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--acc);
		color: var(--surface);
		font-size: 0.75rem;
		font-weight: 700;
	}
	.task.done .task-icon {
		background: var(--success);
	}
	.task-label {
		display: block;
		font-weight: 600;
		font-size: 0.8125rem;
		color: var(--text);
	}
	.task-text {
		color: var(--text-2);
	}
	.task-text :global(p) {
		margin: 0;
	}
	.quiz {
		margin-top: 16px;
	}
	.question {
		font-weight: 600;
		margin-bottom: 10px;
	}
	.options {
		display: grid;
		gap: 6px;
	}
	.option {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		width: 100%;
		padding: 10px 12px;
		text-align: start;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--surface);
		font-size: 0.9rem;
		line-height: 1.45;
		cursor: pointer;
		transition:
			border-color 0.15s var(--ease),
			background 0.15s var(--ease);
	}
	.option:hover:not(:disabled) {
		border-color: var(--acc);
		background: color-mix(in srgb, var(--acc) 5%, transparent);
	}
	.option:disabled {
		cursor: default;
	}
	.option:disabled:not(.correct):not(.wrong) {
		opacity: 0.55;
	}
	.letter {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		border-radius: 5px;
		background: var(--surface-2);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-2);
	}
	.option.correct {
		border-color: var(--success);
		background: color-mix(in srgb, var(--success) 9%, transparent);
	}
	.option.correct .letter {
		background: var(--success);
		color: var(--surface);
	}
	.option.wrong {
		border-color: var(--danger);
		background: color-mix(in srgb, var(--danger) 8%, transparent);
	}
	.explain.hidden {
		visibility: hidden;
	}
	.explain {
		margin-top: 12px;
		padding: 12px 14px;
		border-radius: var(--radius);
		background: var(--surface-2);
		font-size: 0.9rem;
		color: var(--text-2);
		animation: in 0.25s var(--ease);
	}
	.explain strong {
		color: var(--danger);
	}
	.explain.right strong {
		color: var(--success);
	}
	.explain :global(p) {
		display: inline;
	}
	.nav {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		margin-top: 20px;
		padding-top: 16px;
		border-top: 1px solid var(--border);
	}
	@keyframes in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
	}

	@media (max-width: 920px) {
		.player {
			grid-template-columns: 1fr;
		}
		.stage {
			border-inline-end: 0;
			border-bottom: 1px solid var(--border);
			padding: 12px;
		}
		.narration {
			min-height: 0;
			padding: 18px 16px;
		}
	}
</style>
