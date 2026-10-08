import { error } from '@sveltejs/kit';
import { fullConceptById, fullConcepts } from '#lib/content-full.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => fullConcepts.map((c) => ({ id: c.id }));

// Server-only so the full knowledge base never ships to the browser; prerendering
// writes each concept's data next to its page.
export const load = (({ params }) => {
	const concept = fullConceptById.get(params.id);
	if (!concept) error(404, 'Concept not found');
	return { concept };
}) satisfies PageServerLoad;
