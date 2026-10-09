/**
 * The full knowledge base. Import only from server code (e.g. +page.server.ts) or pages that
 * genuinely need every field client-side, since it pulls all 96 concept files into the bundle.
 */
import * as raw from '#content';
import type { Lang } from './i18n/index.svelte.ts';
import type { Concept, Parameter } from './types.ts';

export const fullConcepts = raw.concepts as Concept[];
export const fullConceptById = raw.conceptById as Map<string, Concept>;

/**
 * Translations: content/i18n/<lang>/<track>/<id>.js default-export a partial concept with the
 * same shape. Text fields replace the English ones; `parameters` merge by index (names stay as
 * in code); `math` merges by key. Ids, links, code and formulas are never translated.
 */
const translationFiles = import.meta.glob<Partial<Concept>>('/content/i18n/*/*/*.js', { eager: true, import: 'default' });

export function localizeConcept(c: Concept, lang: Lang): Concept {
	if (lang === 'en') return c;
	const tr = translationFiles[`/content/i18n/${lang}/${c.track}/${c.id}.js`];
	if (!tr) return c;
	const parameters = c.parameters?.map((p, i): Parameter => ({ ...p, ...(tr.parameters?.[i] ?? {}), name: p.name }));
	return {
		...c,
		...tr,
		id: c.id,
		track: c.track,
		difficulty: c.difficulty,
		prerequisites: c.prerequisites,
		related: c.related,
		codeSnippet: c.codeSnippet,
		parameters,
		math: c.math ? { ...c.math, ...(tr.math ?? {}), formula: c.math.formula } : undefined,
		requirements: c.requirements ? { ...c.requirements, ...(tr.requirements ?? {}) } : undefined
	};
}
