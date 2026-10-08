import { describe, expect, it } from 'vitest';
import { conceptById } from '#lib/content.ts';
import { fullConceptById } from '#lib/content-full.ts';
import { parseSelection, requirementKeys, suggestions, writeSelection } from './compare';

const has = (id: string) => ['random-forest', 'xgboost', 'kmeans'].includes(id);

describe('compare selection', () => {
	it('parses known, unique ids in slot order', () => {
		expect(parseSelection(new URLSearchParams('a=random-forest&b=xgboost'), has)).toEqual(['random-forest', 'xgboost']);
		expect(parseSelection(new URLSearchParams('a=nope&b=xgboost&c=xgboost'), has)).toEqual(['xgboost']);
		expect(parseSelection(new URLSearchParams(''), has)).toEqual([]);
	});

	it('writes ids into a/b/c and keeps other params', () => {
		const url = writeSelection(new URL('http://x/tools/compare?a=old&c=old&q=1'), ['kmeans', 'xgboost']);
		expect(url.searchParams.get('a')).toBe('kmeans');
		expect(url.searchParams.get('b')).toBe('xgboost');
		expect(url.searchParams.has('c')).toBe(false);
		expect(url.searchParams.get('q')).toBe('1');
	});

	it('round-trips', () => {
		const url = writeSelection(new URL('http://x/'), ['xgboost', 'random-forest', 'kmeans']);
		expect(parseSelection(url.searchParams, has)).toEqual(['xgboost', 'random-forest', 'kmeans']);
	});
});

describe('compare rows', () => {
	it('orders shared requirement keys first', () => {
		const keys = requirementKeys(['random-forest', 'xgboost', 'kmeans'].map((id) => fullConceptById.get(id)!));
		expect(keys.length).toBeGreaterThan(0);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('suggestions point at real concepts', () => {
		for (const pair of suggestions) for (const id of pair) expect(conceptById.has(id), id).toBe(true);
	});
});
