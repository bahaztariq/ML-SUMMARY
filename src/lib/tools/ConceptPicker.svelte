<!--
  Search-as-you-type concept picker (combobox). Calls `onpick(id)` with the chosen concept id.
-->
<script lang="ts">
	import { trackById } from '#lib/content.ts';
	import { search } from '#lib/search.ts';
	import { local } from '#lib/i18n/index.svelte.ts';

	// English is the source; its keys type the other languages.
	const en = { placeholder: 'Search a concept…', label: 'Search a concept', none: 'No matching concepts' };
	const L = local({
		en,
		fr: { placeholder: 'Rechercher un concept…', label: 'Rechercher un concept', none: 'Aucun concept correspondant' },
		ar: { placeholder: 'ابحث عن مفهوم…', label: 'ابحث عن مفهوم', none: 'لا توجد مفاهيم مطابقة' }
	});

	interface Props {
		exclude?: string[];
		placeholder?: string;
		label?: string;
		onpick: (id: string) => void;
	}
	let { exclude = [], placeholder, label, onpick }: Props = $props();

	const uid = $props.id();
	let query = $state('');
	let open = $state(false);
	let active = $state(0);

	const results = $derived(query.trim() ? search(query, 20).filter((c) => !exclude.includes(c.id)).slice(0, 8) : []);

	function pick(id: string) {
		onpick(id);
		query = '';
		open = false;
		active = 0;
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			if (!results.length) return;
			e.preventDefault();
			open = true;
			const d = e.key === 'ArrowDown' ? 1 : -1;
			active = (active + d + results.length) % results.length;
		} else if (e.key === 'Enter') {
			const c = results[active];
			if (c) {
				e.preventDefault();
				pick(c.id);
			}
		} else if (e.key === 'Escape') {
			if (open && query) e.stopPropagation();
			query = '';
			open = false;
		}
	}
</script>

<div class="picker">
	<label class="field">
		<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"
			><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" /><path
				d="m20 20-3.5-3.5"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
			/></svg
		>
		<input
			bind:value={query}
			placeholder={placeholder ?? L('placeholder')}
			aria-label={label ?? L('label')}
			role="combobox"
			aria-expanded={open && results.length > 0}
			aria-controls="{uid}-list"
			aria-autocomplete="list"
			aria-activedescendant={open && results[active] ? `${uid}-${active}` : undefined}
			autocomplete="off"
			spellcheck="false"
			oninput={() => {
				open = true;
				active = 0;
			}}
			onfocus={() => (open = true)}
			onblur={() => setTimeout(() => (open = false), 120)}
			{onkeydown}
		/>
	</label>
	{#if open && query.trim()}
		<ul class="list card" id="{uid}-list" role="listbox">
			{#each results as c, i (c.id)}
				<li
					id="{uid}-{i}"
					role="option"
					aria-selected={i === active}
					class:active={i === active}
					style:--tc={trackById[c.track].color}
					onmousedown={(e) => {
						e.preventDefault();
						pick(c.id);
					}}
					onmousemove={() => (active = i)}
				>
					<span class="dot"></span>
					<span class="name">{c.name}</span>
					<span class="cat">{c.category}</span>
				</li>
			{:else}
				<li class="none">{L('none')}</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.picker {
		position: relative;
		width: 100%;
	}
	.field {
		display: flex;
		align-items: center;
		gap: 8px;
		height: 40px;
		padding: 0 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--text-3);
	}
	.field:focus-within {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	input {
		flex: 1;
		min-width: 0;
		border: 0;
		outline: 0;
		background: transparent;
		color: var(--text);
		font: inherit;
		font-size: 0.9rem;
	}
	.list {
		position: absolute;
		z-index: 20;
		top: calc(100% + 4px);
		inset-inline-start: 0;
		inset-inline-end: 0;
		margin: 0;
		padding: 4px;
		list-style: none;
		box-shadow: var(--shadow-lg);
		max-height: 320px;
		overflow-y: auto;
	}
	li {
		display: grid;
		grid-template-columns: 8px 1fr;
		align-items: center;
		column-gap: 10px;
		padding: 7px 10px;
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-size: 0.875rem;
	}
	li.active {
		background: var(--surface-2);
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--tc);
	}
	.name {
		font-weight: 550;
	}
	.cat {
		grid-column: 2;
		font-size: 0.75rem;
		color: var(--text-3);
	}
	.none {
		display: block;
		color: var(--text-3);
		cursor: default;
	}
</style>
