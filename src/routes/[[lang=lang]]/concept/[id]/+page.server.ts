import { error } from '@sveltejs/kit';
import { fullConceptById, fullConcepts, localizeConcept } from '#lib/content-full.ts';
import { isLang } from '#lib/i18n/index.svelte.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// Every concept in every language (English has no prefix).
export const entries: EntryGenerator = () =>
	fullConcepts.flatMap((c) => [{ id: c.id }, { lang: 'fr', id: c.id }, { lang: 'ar', id: c.id }]);

// Server-only so the full knowledge base never ships to the browser; prerendering
// writes each concept's data next to its page.
export const load = (({ params }) => {
	const concept = fullConceptById.get(params.id);
	if (!concept) error(404, 'Concept not found');
	return { concept: localizeConcept(concept, isLang(params.lang) ? params.lang : 'en') };
}) satisfies PageServerLoad;
