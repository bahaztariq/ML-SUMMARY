import { error } from '@sveltejs/kit';
import { learningPaths, pathById } from '#lib/content.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => learningPaths.map((p) => ({ id: p.id }));

export const load = (({ params }) => {
	const path = pathById.get(params.id);
	if (!path) error(404, 'Learning path not found');
	return { path };
}) satisfies PageLoad;
