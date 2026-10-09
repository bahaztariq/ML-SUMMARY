import { redirect } from '@sveltejs/kit';
import { isLang, lhref } from '#lib/i18n/index.svelte.ts';
import type { PageLoad } from './$types';

// The six goal paths are now focus views of the unified roadmap.
export const load = (({ params }) => {
	redirect(308, lhref('/roadmap', isLang(params.lang) ? params.lang : 'en'));
}) satisfies PageLoad;
