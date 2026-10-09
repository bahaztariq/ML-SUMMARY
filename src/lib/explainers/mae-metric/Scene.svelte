<script lang="ts">
	import ErrorScene from '../_regression/ErrorScene.svelte';
	import type { SceneProps } from '../types.ts';
	import type { ErrState } from './state.ts';

	let { s = $bindable() }: SceneProps<ErrState> = $props();
</script>

<ErrorScene bind:s />
