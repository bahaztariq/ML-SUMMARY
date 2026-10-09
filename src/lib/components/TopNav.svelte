<script lang="ts">
	import { i18n, LANG_INFO, LANGS, lhref, t, unlocalizedPath, type Lang } from '#lib/i18n/index.svelte.ts';
	import type { UiKey } from '#lib/i18n/ui/en.ts';
	import { page } from '$app/state';
	import { concepts } from '#lib/content.ts';
	import { progress } from '#lib/progress.svelte.ts';
	import { theme } from '#lib/theme.svelte.ts';
	import { palette } from '#lib/palette.svelte.ts';

	const links: { href: string; key: UiKey; also?: string }[] = [
		{ href: '/learn', key: 'nav.learn' },
		{ href: '/roadmap', key: 'nav.roadmap', also: '/paths' },
		{ href: '/quiz', key: 'nav.quiz' },
		{ href: '/map', key: 'nav.map' },
		{ href: '/tools', key: 'nav.tools' }
	];

	const path = $derived(unlocalizedPath(page.url.pathname));
	const isActive = (l: (typeof links)[number]) => path.startsWith(l.href) || (!!l.also && path.startsWith(l.also));
	const short: Record<Lang, string> = { en: 'EN', fr: 'FR', ar: 'ع' };

	const isMac = $derived(typeof navigator !== 'undefined' && /Mac|iP(hone|ad)/.test(navigator.platform));
	const pct = $derived(Math.round((progress.learned.size / concepts.length) * 100));
</script>

<header class="nav">
	<div class="container inner">
		<a href={lhref('/')} class="brand" aria-label={t('nav.home')}>
			<span class="logo" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="20" height="20"
					><circle cx="6" cy="7" r="2.5" /><circle cx="18" cy="7" r="2.5" /><circle cx="12" cy="17" r="2.5" /><path
						d="M7.8 8.6 10.6 15M16.2 8.6 13.4 15M8.5 7h7"
						fill="none"
						stroke="currentColor"
						stroke-width="1.6"
					/></svg
				>
			</span>
			<span class="brand-name">{t('site.name')}</span>
		</a>

		<nav class="links" aria-label={t('nav.main')}>
			{#each links as l (l.href)}
				<a href={lhref(l.href)} class:active={isActive(l)}>{t(l.key)}</a>
			{/each}
		</nav>

		<div class="actions">
			<button class="search" onclick={() => palette.open()} aria-label={t('nav.searchConcepts')}>
				<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"
					><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" /><path
						d="m20 20-3.5-3.5"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/></svg
				>
				<span class="search-label">{t('nav.search')}</span>
				<kbd>{isMac ? '⌘' : 'Ctrl'} K</kbd>
			</button>

			{#if progress.ready}
				<a href={lhref('/roadmap')} class="progress" title={t('nav.learnedOf', { n: progress.learned.size, total: concepts.length })}>
					<svg viewBox="0 0 36 36" width="22" height="22" aria-hidden="true">
						<circle cx="18" cy="18" r="15" fill="none" stroke="var(--surface-3)" stroke-width="4" />
						<circle
							cx="18"
							cy="18"
							r="15"
							fill="none"
							stroke="var(--accent)"
							stroke-width="4"
							stroke-linecap="round"
							stroke-opacity={pct > 0 ? 1 : 0}
							stroke-dasharray="{(pct / 100) * 94.25} 94.25"
							transform="rotate(-90 18 18)"
						/>
					</svg>
					<span>{progress.learned.size}</span>
				</a>
			{/if}

			<div class="langs" role="group" aria-label={t('nav.language')}>
				{#each LANGS as l (l)}
					<a
						href={lhref(path, l)}
						hreflang={l}
						lang={l}
						class:active={i18n.current === l}
						aria-current={i18n.current === l ? 'true' : undefined}
						title={LANG_INFO[l].native}
						data-sveltekit-reset="false">{short[l]}</a
					>
				{/each}
			</div>

			<button class="btn btn-ghost icon" onclick={() => theme.cycle()} aria-label={t('nav.toggleTheme')}>
				{#if theme.isDark}
					<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
						><circle cx="12" cy="12" r="4.5" fill="currentColor" /><g stroke="currentColor" stroke-width="2" stroke-linecap="round"
							><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></g
						></svg
					>
				{:else}
					<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
						><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" fill="currentColor" /></svg
					>
				{/if}
			</button>
		</div>
	</div>
</header>

<style>
	.nav {
		position: sticky;
		top: 0;
		z-index: 40;
		height: var(--nav-h);
		background: color-mix(in srgb, var(--bg) 85%, transparent);
		backdrop-filter: saturate(1.4) blur(12px);
		border-bottom: 1px solid var(--border);
	}
	.inner {
		height: 100%;
		display: flex;
		align-items: center;
		gap: 24px;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 650;
		letter-spacing: -0.01em;
	}
	.logo {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 8px;
		background: var(--accent);
		color: var(--text-on-accent);
		fill: currentColor;
	}
	.links {
		display: flex;
		gap: 2px;
	}
	.links a {
		padding: 6px 10px;
		border-radius: var(--radius-sm);
		color: var(--text-2);
		font-size: 0.875rem;
		font-weight: 500;
	}
	.links a:hover {
		color: var(--text);
		background: var(--surface-2);
	}
	.links a.active {
		color: var(--text);
		background: var(--surface-2);
	}
	.actions {
		margin-inline-start: auto;
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.search {
		display: flex;
		align-items: center;
		gap: 8px;
		height: 34px;
		width: 220px;
		padding-block: 0;
		padding-inline: 10px 8px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--text-3);
		font-size: 0.875rem;
		cursor: pointer;
	}
	.search:hover {
		border-color: var(--border-strong);
	}
	.search kbd {
		margin-inline-start: auto;
	}
	.progress {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		border-radius: var(--radius-full);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-2);
		font-variant-numeric: tabular-nums;
	}
	.progress:hover {
		background: var(--surface-2);
	}
	.icon {
		width: 34px;
		padding: 0;
	}
	.langs {
		display: inline-flex;
		padding: 2px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--surface);
	}
	.langs a {
		display: grid;
		place-items: center;
		min-width: 28px;
		height: 26px;
		padding: 0 6px;
		border-radius: 5px;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-3);
	}
	.langs a:hover {
		color: var(--text);
	}
	.langs a.active {
		background: var(--surface-2);
		color: var(--text);
	}

	@media (max-width: 760px) {
		.inner {
			gap: 12px;
		}
		.brand-name {
			display: none;
		}
		.search {
			width: 34px;
			padding: 0;
			justify-content: center;
		}
		.search-label,
		.search kbd {
			display: none;
		}
		.links a {
			padding: 6px 7px;
		}
	}
	/* Phones: brand and actions on the first row, the section links scroll on a second row. */
	@media (max-width: 640px) {
		.nav {
			height: auto;
		}
		.inner {
			flex-wrap: wrap;
			column-gap: 10px;
			row-gap: 0;
		}
		.brand {
			height: 52px;
		}
		.brand-name {
			display: inline;
		}
		.links {
			order: 3;
			flex: 0 0 calc(100% + 40px);
			margin-inline: -20px;
			padding-inline: 14px;
			height: 40px;
			align-items: center;
			overflow-x: auto;
			scrollbar-width: none;
			border-top: 1px solid var(--border);
		}
		.links a {
			white-space: nowrap;
			padding: 5px 9px;
		}
		.actions {
			gap: 6px;
		}
	}
	@media (max-width: 420px) {
		.progress {
			display: none;
		}
	}
</style>
