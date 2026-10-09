import { describe, expect, it } from 'vitest';
import { conceptById } from '#lib/content.ts';
import { explainerIds, loadExplainer } from './registry.ts';

describe('explainer registry', () => {
	it('every lesson folder maps to a real concept', () => {
		for (const id of explainerIds) expect(conceptById.has(id), `no concept "${id}"`).toBe(true);
	});

	it('every lesson loads and has steps', async () => {
		for (const id of explainerIds) {
			const mod = await loadExplainer(id);
			expect(mod?.steps.length, id).toBeGreaterThan(0);
			expect(typeof mod?.init, id).toBe('function');
		}
	}, 120_000); // loads every lesson (Svelte compile included), well past the default 5 s
});
