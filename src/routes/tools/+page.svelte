<script lang="ts">
	import { resolve } from '$app/paths';

	const tools = [
		{
			href: resolve('/tools/which-model'),
			icon: '🧭',
			title: 'Which model?',
			desc: 'Answer a few questions about your data and goal, and get the algorithms and concepts that fit your problem.',
			cta: 'Start the wizard'
		},
		{
			href: resolve('/tools/metrics-lab'),
			icon: '🎯',
			title: 'Metrics lab',
			desc: 'Drag the four cells of a confusion matrix and watch accuracy, precision, recall, F1 and MCC react in real time.',
			cta: 'Open the lab'
		},
		{
			href: resolve('/tools/compare'),
			icon: '⚖️',
			title: 'Compare concepts',
			desc: 'Put two or three concepts side by side: when to use them, requirements, hyperparameters, pros and cons.',
			cta: 'Compare'
		}
	];
</script>

<svelte:head><title>Tools · ML Hub</title></svelte:head>

<div class="container page">
	<header class="head">
		<h1>Tools</h1>
		<p class="muted">Small interactive helpers for choosing, evaluating and comparing models.</p>
	</header>

	<div class="grid">
		{#each tools as t (t.href)}
			<a class="card tool" href={t.href}>
				<span class="icon" aria-hidden="true">{t.icon}</span>
				<h2>{t.title}</h2>
				<p class="muted">{t.desc}</p>
				<span class="cta">{t.cta} →</span>
			</a>
		{/each}
	</div>
</div>

<style>
	.page {
		padding-top: 36px;
	}
	.head {
		display: grid;
		gap: 8px;
		margin-bottom: 28px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 14px;
	}
	.tool {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 22px;
		transition:
			border-color 0.15s var(--ease),
			box-shadow 0.15s var(--ease),
			transform 0.15s var(--ease);
	}
	.tool:hover {
		border-color: var(--border-strong);
		box-shadow: var(--shadow);
		transform: translateY(-1px);
	}
	.icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: var(--surface-2);
		font-size: 1.35rem;
	}
	h2 {
		font-size: 1.125rem;
		margin-top: 4px;
	}
	p {
		font-size: 0.9rem;
	}
	.cta {
		margin-top: auto;
		padding-top: 6px;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--accent);
	}
</style>
