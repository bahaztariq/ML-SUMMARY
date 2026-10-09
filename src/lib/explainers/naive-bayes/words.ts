/**
 * Display labels of the spam-filter words per language. Ids (and the counts in nb.ts) stay the same;
 * the narration (i18n.ts) uses the same labels so text and chips match.
 */
import { i18n } from '#lib/i18n/index.svelte.ts';
import { wordById } from './nb.ts';

export const WORD_LABELS: Record<'fr' | 'ar', Record<string, string>> = {
	fr: { free: 'gratuit', click: 'cliquez', meeting: 'réunion', report: 'rapport', winner: 'gagnant', FREE: 'GRATUIT!!' },
	ar: { free: 'مجاني', click: 'انقر', meeting: 'اجتماع', report: 'تقرير', winner: 'فائز', FREE: 'مجاني!!' }
};

/** Label of a word in the given language (English falls back to the word's own label). */
export function wordLabel(id: string, lang: 'en' | 'fr' | 'ar' = i18n.current): string {
	return (lang !== 'en' ? WORD_LABELS[lang][id] : undefined) ?? wordById.get(id)?.label ?? id;
}
