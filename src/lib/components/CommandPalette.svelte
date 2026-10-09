<script lang="ts">
	import { lhref, t } from '#lib/i18n/index.svelte.ts';
	import { goto } from '$app/navigation';
	import { conceptById, concepts, trackById } from '#lib/content.ts';
	import { palette } from '#lib/palette.svelte.ts';
	import { progress } from '#lib/progress.svelte.ts';
	import { search } from '#lib/search.ts';
	import { hasExplainer } from '#lib/explainers/registry.ts';
	import type { ConceptMeta } from '#lib/types.ts';

	let query = $state('');
	let active = $state(0);
	let input = $state<HTMLInputElement>();
	let listEl = $state<HTMLElement>();

	const recent = $derived(
		progress.recent.map((id) => conceptById.get(id)).filter((c): c is ConceptMeta => !!c).slice(0, 6)
	);
	const results = $derived(query.trim() ? search(query, 12) : recent);

	$effect(() => {
		if (palette.isOpen) {
			query = '';
			active = 0;
			queueMicrotask(() => input?.focus());
		}
	});

	$effect(() => {
		query;
		active = 0;
	});

	function choose(c: ConceptMeta) {
		palette.close();
		goto(lhref(`/concept/${c.id}`));
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			active = Math.min(active + 1, results.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			active = Math.max(active - 1, 0);
		} else if (e.key === 'Enter' && results[active]) {
			e.preventDefault();
			choose(results[active]);
		} else if (e.key === 'Escape') {
			palette.close();
		}
		queueMicrotask(() => listEl?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }));
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			palette.toggle();
		} else if (e.key === '/' && !palette.isOpen && !(e.target as HTMLElement).closest('input, textarea, [contenteditable]')) {
			e.preventDefault();
			palette.open();
		}
	}}
/>

{#if palette.isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div class="backdrop" onclick={palette.close}>
		<div class="panel" role="dialog" tabindex="-1" aria-modal="true" aria-label={t('nav.searchConcepts')} onclick={(e) => e.stopPropagation()}>
			<div class="field">
				<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
					><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" /><path
						d="m20 20-3.5-3.5"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/></svg
				>
				<input
					bind:this={input}
					bind:value={query}
					onkeydown={onKey}
					placeholder={t('palette.placeholder', { n: concepts.length })}
					role="combobox"
					aria-expanded="true"
					aria-controls="palette-list"
					aria-activedescendant={results[active] ? `opt-${results[active].id}` : undefined}
				/>
				<kbd>Esc</kbd>
			</div>

			<div class="list" id="palette-list" role="listbox" bind:this={listEl}>
				{#if !query.trim() && recent.length}
					<div class="group">{t('palette.recent')}</div>
				{/if}
				{#each results as c, i (c.id)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div
						id="opt-{c.id}"
						class="item"
						role="option"
						tabindex="-1"
						aria-selected={i === active}
						onmouseenter={() => (active = i)}
						onclick={() => choose(c)}
					>
						<span class="dot" style:background={trackById[c.track].color}></span>
						<span class="name">{c.name}</span>
						{#if hasExplainer(c.id)}<span class="tag">{t('common.interactive')}</span>{/if}
						{#if progress.isLearned(c.id)}<span class="check" aria-label={t('common.learned')}>✓</span>{/if}
						<span class="meta">{trackById[c.track].label}</span>
					</div>
				{:else}
					<div class="empty">
						{query.trim() ? t('palette.noMatch', { q: query }) : t('palette.typeToSearch')}
					</div>
				{/each}
			</div>

			<div class="foot">
				<span><kbd>↑</kbd> <kbd>↓</kbd> {t('palette.navigate')}</span>
				<span><kbd>↵</kbd> {t('palette.open')}</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding: 12vh 16px 16px;
		background: color-mix(in srgb, var(--bg) 55%, rgba(0, 0, 0, 0.35));
		backdrop-filter: blur(3px);
		animation: fade 0.12s var(--ease);
	}
	.panel {
		width: 100%;
		max-width: 620px;
		overflow: hidden;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		animation: pop 0.16s var(--ease);
	}
	.field {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 0 14px;
		border-bottom: 1px solid var(--border);
		color: var(--text-3);
	}
	input {
		flex: 1;
		min-width: 0;
		height: 52px;
		border: 0;
		outline: 0;
		background: transparent;
		color: var(--text);
		font: inherit;
		font-size: 1rem;
	}
	input::placeholder {
		color: var(--text-3);
	}
	.list {
		max-height: min(420px, 55vh);
		overflow-y: auto;
		padding: 6px;
	}
	.group {
		padding: 8px 10px 4px;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-3);
	}
	.item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 10px;
		border-radius: var(--radius-sm);
		cursor: pointer;
	}
	.item[aria-selected='true'] {
		background: var(--surface-2);
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.name {
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.tag {
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 1px 6px;
		border-radius: var(--radius-full);
		background: var(--accent-soft);
		color: var(--accent);
		flex-shrink: 0;
	}
	.check {
		color: var(--success);
		font-weight: 700;
	}
	.meta {
		margin-inline-start: auto;
		font-size: 0.8125rem;
		color: var(--text-3);
		white-space: nowrap;
	}
	.empty {
		padding: 28px 12px;
		text-align: center;
		color: var(--text-3);
	}
	.foot {
		display: flex;
		gap: 16px;
		padding: 8px 14px;
		border-top: 1px solid var(--border);
		font-size: 0.75rem;
		color: var(--text-3);
	}
	@media (max-width: 560px) {
		.meta,
		.foot {
			display: none;
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(-6px) scale(0.99);
		}
	}
</style>
