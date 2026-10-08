<!--
  HiDPI canvas that redraws whenever reactive state read inside `draw` changes,
  when it is resized, or when the theme changes.
-->
<script lang="ts">
	import { theme } from '#lib/theme.svelte.ts';
	import { clamp, readTheme, type VizTheme } from './canvas';

	interface Props {
		draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) => void;
		aspect?: number;
		minHeight?: number;
		maxHeight?: number;
		label?: string;
		cursor?: string;
		onpointerdown?: (p: { x: number; y: number }, e: PointerEvent) => void;
		onpointermove?: (p: { x: number; y: number }, e: PointerEvent) => void;
		onpointerup?: (p: { x: number; y: number }, e: PointerEvent) => void;
	}

	let {
		draw,
		aspect = 0.62,
		minHeight = 240,
		maxHeight = 520,
		label = 'Interactive visualization',
		cursor = 'default',
		onpointerdown,
		onpointermove,
		onpointerup
	}: Props = $props();

	let canvas = $state<HTMLCanvasElement>();
	let width = $state(0);
	const height = $derived(Math.round(clamp(width * aspect, minHeight, maxHeight)));

	$effect(() => {
		if (!canvas || !width) return;
		theme.version; // redraw on theme change
		const dpr = clamp(window.devicePixelRatio || 1, 1, 3);
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(height * dpr);
		const ctx = canvas.getContext('2d')!;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, width, height);
		draw(ctx, width, height, readTheme(canvas));
	});

	function point(e: PointerEvent) {
		const r = canvas!.getBoundingClientRect();
		return { x: e.clientX - r.left, y: e.clientY - r.top };
	}
</script>

<div class="wrap" bind:clientWidth={width}>
	<canvas
		bind:this={canvas}
		style:height="{height}px"
		style:cursor
		style:touch-action={onpointerdown ? 'none' : 'auto'}
		aria-label={label}
		onpointerdown={(e) => {
			if (!onpointerdown) return;
			canvas!.setPointerCapture(e.pointerId);
			onpointerdown(point(e), e);
		}}
		onpointermove={(e) => onpointermove?.(point(e), e)}
		onpointerup={(e) => onpointerup?.(point(e), e)}
		onpointercancel={(e) => onpointerup?.(point(e), e)}
	></canvas>
</div>

<style>
	.wrap {
		width: 100%;
	}
	canvas {
		display: block;
		width: 100%;
		border-radius: var(--radius);
		background: var(--viz-bg);
	}
</style>
