<script lang="ts">
	import { t } from '#lib/i18n/index.svelte.ts';
	let { code, lang }: { code: string; lang?: string } = $props();
	let copied = $state(false);

	const language = $derived(
		lang ??
			(/^\s*(SELECT|WITH|CREATE|INSERT|MERGE)\b/im.test(code)
				? 'SQL'
				: /^\s*FROM\s+\S+:\S+|^\s*RUN\s/m.test(code)
					? 'Dockerfile'
					: /^\s*[\w-]+:\s*(\n|$)/m.test(code) && !/\bimport\b|\bdef\b/.test(code)
						? 'YAML'
						: 'Python')
	);

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			setTimeout(() => (copied = false), 1600);
		} catch {}
	}
</script>

<div class="code">
	<div class="head">
		<span class="lang">{language}</span>
		<button class="btn btn-sm btn-ghost" onclick={copy}>{copied ? t('common.copied') : t('common.copy')}</button>
	</div>
	<pre dir="ltr"><code>{code}</code></pre>
</div>

<style>
	.code {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface-2);
		overflow: hidden;
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-block: 4px;
		padding-inline: 14px 6px;
		border-bottom: 1px solid var(--border);
	}
	.lang {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-3);
	}
	pre {
		margin: 0;
		padding: 14px 16px;
		overflow-x: auto;
		font-size: 0.8125rem;
		line-height: 1.6;
		tab-size: 4;
		text-align: left;
	}
</style>
