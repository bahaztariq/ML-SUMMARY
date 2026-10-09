<!--
  Mermaid diagram, loaded lazily and themed from the current CSS tokens.
  `links` maps Mermaid node ids to concept ids; those nodes navigate to the concept.
-->
<script module lang="ts">
	import { i18n, lhref, t } from '#lib/i18n/index.svelte.ts';
	let mermaidPromise: Promise<typeof import('mermaid').default> | null = null;
	let counter = 0;
	/** Mermaid keeps global state (config, ids) while rendering, so renders run one at a time. */
	let queue: Promise<unknown> = Promise.resolve();
	function serial<T>(job: () => Promise<T>): Promise<T> {
		const run = queue.then(job, job);
		queue = run.catch(() => {});
		return run;
	}

	function loadMermaid() {
		mermaidPromise ??= import('mermaid').then((m) => m.default);
		return mermaidPromise;
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { theme } from '#lib/theme.svelte.ts';

	interface Props {
		source: string;
		links?: Record<string, string>;
		highlight?: string;
		label?: string;
	}
	let { source, links = {}, highlight, label = t('common.diagram') }: Props = $props();

	let host = $state<HTMLDivElement>();
	let status = $state<'loading' | 'ok' | 'error'>('loading');

	function tokens(el: Element) {
		const cs = getComputedStyle(el);
		const v = (n: string) => cs.getPropertyValue(n).trim();
		return {
			darkMode: theme.isDark,
			background: v('--surface'),
			primaryColor: v('--surface-2'),
			primaryTextColor: v('--text'),
			primaryBorderColor: v('--border-strong'),
			secondaryColor: v('--surface-2'),
			tertiaryColor: v('--surface'),
			lineColor: v('--text-3'),
			textColor: v('--text-2'),
			clusterBkg: v('--surface-2'),
			clusterBorder: v('--border'),
			edgeLabelBackground: v('--surface'),
			fontFamily: v('--font-sans'),
			fontSize: '14px'
		};
	}

	$effect(() => {
		const el = host;
		// Right-to-left pages read flowcharts right-to-left too.
		const src = i18n.rtl ? source.replace(/^(\s*(?:flowchart|graph)\s+)LR\b/m, '$1RL') : source;
		theme.version;
		if (!el) return;
		let cancelled = false;
		status = 'loading';
		(async () => {
			try {
				console.log('DBG start');const mermaid = await loadMermaid();console.log('DBG loaded');
				// Mermaid sizes labels by measuring text, so measure with the final web font.
				await document.fonts.ready;console.log('DBG fonts');
				const svg = await serial(async () => {
					if (cancelled) return '';
					mermaid.initialize({
						startOnLoad: false,
						securityLevel: 'strict',
						suppressErrorRendering: true,
						theme: 'base',
						flowchart: { curve: 'basis', htmlLabels: true, useMaxWidth: true },
						themeVariables: tokens(el)
					});
					console.log('DBG render');return (await mermaid.render(`mmd-${++counter}`, src)).svg;
				});
				if (cancelled) return;
				el.innerHTML = svg;
				wire(el);
				status = 'ok';
			} catch (err) {
				if (cancelled) return;
				console.warn('Mermaid render failed:', err);
				status = 'error';
			}
		})();
		return () => (cancelled = true);
	});

	// Mermaid renders node "A" as <g id="…flowchart-A-12"> (and data-id="A" in newer versions).
	function nodeId(n: Element) {
		const ds = (n as HTMLElement).dataset?.id;
		if (ds) return ds;
		return /flowchart-(.+)-\d+$/.exec(n.id || '')?.[1] ?? null;
	}

	function wire(el: HTMLElement) {
		const svg = el.querySelector('svg');
		if (svg) {
			// Keep wide diagrams legible: never shrink below ~75% of natural size; the panel scrolls instead.
			const natural = parseFloat(svg.style.maxWidth) || svg.viewBox?.baseVal?.width || 0;
			svg.removeAttribute('height');
			if (natural) svg.style.minWidth = `${Math.round(natural * 0.75)}px`;
		}
		for (const n of el.querySelectorAll('g.node')) {
			const id = nodeId(n);
			if (id && id === highlight) n.classList.add('current');
			const concept = id ? links[id] : undefined;
			if (!concept) continue;
			const href = lhref(`/concept/${concept}`);
			n.classList.add('link');
			n.setAttribute('tabindex', '0');
			n.setAttribute('role', 'link');
			n.addEventListener('click', () => goto(href));
			n.addEventListener('keydown', (e) => {
				const k = (e as KeyboardEvent).key;
				if (k === 'Enter' || k === ' ') {
					e.preventDefault();
					goto(href);
				}
			});
		}
	}
</script>

<figure class="diagram" aria-label={label}>
	<div class="host" bind:this={host} class:hidden={status !== 'ok'}></div>
	{#if status === 'loading'}
		<div class="placeholder">{t('common.renderingDiagram')}</div>
	{:else if status === 'error'}
		<div class="placeholder error">
			{t('common.diagramError')}
			<pre>{source}</pre>
		</div>
	{/if}
</figure>

<style>
	.diagram {
		margin: 0;
		padding: 16px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		overflow-x: auto;
	}
	.host {
		display: flex;
		/* safe: wide diagrams start at the left edge instead of being clipped */
		justify-content: safe center;
	}
	.hidden {
		display: none;
	}
	.placeholder {
		padding: 32px 0;
		text-align: center;
		color: var(--text-3);
		font-size: 0.875rem;
	}
	.error pre {
		text-align: start;
		margin-top: 12px;
		font-size: 0.75rem;
		white-space: pre-wrap;
	}
	.host :global(g.node.link) {
		cursor: pointer;
	}
	.host :global(g.node.link:hover rect),
	.host :global(g.node.link:hover polygon),
	.host :global(g.node.link:focus-visible rect) {
		stroke: var(--accent) !important;
		stroke-width: 2px !important;
	}
	.host :global(g.node.current rect),
	.host :global(g.node.current polygon) {
		fill: color-mix(in srgb, var(--accent) 16%, var(--surface)) !important;
		stroke: var(--accent) !important;
		stroke-width: 2px !important;
	}
</style>
