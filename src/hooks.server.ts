import type { Handle } from '@sveltejs/kit/hooks';
import { LANG_INFO, isLang } from '#lib/i18n/index.svelte.ts';

/** Set <html lang> and <html dir> for the language in the URL (prerendered per language). */
export const handle: Handle = ({ event, resolve }) => {
	const lang = isLang(event.params.lang) ? event.params.lang : 'en';
	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('<html lang="en" dir="ltr">', `<html lang="${lang}" dir="${LANG_INFO[lang].dir}">`)
	});
};
