/**
 * Internationalisation core: the current language, localized links and UI strings.
 *
 * English is the default and lives at the site root; French and Arabic live under /fr and /ar.
 * The root layout sets `i18n.current` from the route, so everything that reads it — `t()`,
 * `lhref()`, localized content getters — re-renders when the language changes.
 */
import { resolve } from '$app/paths';
import { en, type UiKey } from './ui/en.ts';
import { fr } from './ui/fr.ts';
import { ar } from './ui/ar.ts';

export const LANGS = ['en', 'fr', 'ar'] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_INFO: Record<Lang, { label: string; native: string; dir: 'ltr' | 'rtl' }> = {
	en: { label: 'English', native: 'English', dir: 'ltr' },
	fr: { label: 'French', native: 'Français', dir: 'ltr' },
	ar: { label: 'Arabic', native: 'العربية', dir: 'rtl' }
};

export const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v);

class I18n {
	current = $state<Lang>('en');
	get dir() {
		return LANG_INFO[this.current].dir;
	}
	get rtl() {
		return this.dir === 'rtl';
	}
}

export const i18n = new I18n();

/* ---------------------------------------------------------------- links */

/** `/learn?track=x` → `<base>/fr/learn?track=x` for the current (or given) language. */
export function lhref(path: string, lang: Lang = i18n.current): string {
	const p = path.startsWith('/') ? path : `/${path}`;
	const prefixed = lang === 'en' ? p : p === '/' ? `/${lang}` : `/${lang}${p}`;
	return (resolve as (path: string) => string)(prefixed);
}

/** Strip the base path and any language prefix: `<base>/fr/concept/x` → `/concept/x`. */
export function unlocalizedPath(pathname: string): string {
	const base = (resolve as (path: string) => string)('/').replace(/\/$/, '');
	let p = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
	const m = /^\/(fr|ar)(?=\/|$)/.exec(p);
	if (m) p = p.slice(m[0].length);
	return p || '/';
}

/* ---------------------------------------------------------------- UI strings */

const dictionaries: Record<Lang, Partial<Record<UiKey, string>>> = { en, fr, ar };

/**
 * Look up a UI string in the current language (falling back to English) and fill `{name}` params.
 */
export function t(key: UiKey, params?: Record<string, string | number>): string {
	let s = dictionaries[i18n.current][key] ?? en[key] ?? key;
	if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v));
	return s;
}

/**
 * Per-component dictionaries (lesson scenes, tools): `const L = local({ en: {...}, fr: {...}, ar: {...} })`
 * then `L('run')`. Falls back to English for missing keys.
 */
export function local<K extends string>(dict: { en: Record<K, string> } & Partial<Record<Lang, Partial<Record<K, string>>>>) {
	// Only the keys are inferred (from `en`); values are plain strings, so translations type-check.
	return (key: K, params?: Record<string, string | number>): string => {
		let s: string = dict[i18n.current]?.[key] ?? dict.en[key] ?? key;
		if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v));
		return s;
	};
}

/** Pick the current language's value from an inline `{ en, fr?, ar? }` record. */
export function pick<T>(v: { en: T } & Partial<Record<Lang, T>>): T {
	return v[i18n.current] ?? v.en;
}

/** Locale-aware number formatting (Western digits for every language, matching code and formulas). */
export function num(v: number, digits = 0): string {
	return v.toLocaleString(i18n.current === 'fr' ? 'fr-FR' : 'en-US', {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	});
}
