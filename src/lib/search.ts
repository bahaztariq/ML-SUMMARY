/**
 * ConceptMeta search over names, categories, tasks, summaries, intuitions and parameter names.
 * Every query word must match somewhere; matches in the name rank highest.
 */
import { concepts } from './content.ts';
import { i18n } from './i18n/index.svelte.ts';
import type { ConceptMeta } from './types.ts';

interface Entry {
	concept: ConceptMeta;
	name: string;
	meta: string;
	body: string;
}

/** Built lazily per language, since names and summaries are localized. */
const indexes = new Map<string, Entry[]>();
function getIndex(): Entry[] {
	let index = indexes.get(i18n.current);
	if (!index) {
		index = concepts.map((c) => ({
			concept: c,
			name: c.name.toLowerCase(),
			meta: [c.id, c.category, ...(c.task ?? [])].join(' ').toLowerCase(),
			body: [c.summary, c.searchText].join(' ').toLowerCase()
		}));
		indexes.set(i18n.current, index);
	}
	return index;
}

export function search(query: string, limit = 20): ConceptMeta[] {
	const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
	if (!words.length) return [];
	const scored: [number, Entry][] = [];
	for (const e of getIndex()) {
		let score = 0;
		let ok = true;
		for (const w of words) {
			if (e.name.startsWith(w)) score += 12;
			else if (e.name.includes(w)) score += 8;
			else if (e.meta.includes(w)) score += 4;
			else if (e.body.includes(w)) score += 1;
			else {
				ok = false;
				break;
			}
		}
		if (ok) scored.push([score, e]);
	}
	return scored
		.sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name))
		.slice(0, limit)
		.map(([, e]) => e.concept);
}
