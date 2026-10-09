/**
 * Vite plugin: `virtual:concept-index` is a lightweight list of every concept (names, summaries,
 * graph links and a search string) built from content/ at build time. Pages that only list or
 * search concepts import this instead of the full knowledge base, which stays server-side.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin, ViteDevServer } from 'vite';

const ID = 'virtual:concept-index';
const RESOLVED = '\0' + ID;
const CONTENT_DIR = path.resolve('content');

type Raw = Record<string, any>;

export function toMeta(c: Raw) {
	return {
		id: c.id,
		name: c.name,
		track: c.track,
		category: c.category,
		task: c.task ?? [],
		difficulty: c.difficulty,
		summary: c.summary,
		prerequisites: c.prerequisites ?? [],
		related: c.related ?? [],
		searchText: [c.intuition, ...(c.parameters ?? []).map((p: Raw) => p.name)].filter(Boolean).join(' ')
	};
}

const TRANSLATED_LANGS = ['fr', 'ar'];

/** The translatable fields of the index, from content/i18n/<lang>/<track>/<id>.js. */
function toMetaText(t: Raw) {
	const out: Raw = {};
	for (const k of ['name', 'category', 'task', 'summary'] as const) if (t[k] !== undefined) out[k] = t[k];
	const search = [t.intuition, ...(t.parameters ?? []).map((p: Raw) => p?.name)].filter(Boolean).join(' ');
	if (search) out.searchText = search;
	return out;
}

export function conceptIndex(): Plugin {
	let server: ViteDevServer | undefined;
	return {
		name: 'concept-index',
		configureServer(s) {
			server = s;
		},
		resolveId(id) {
			if (id === ID) return RESOLVED;
		},
		async load(id) {
			if (id !== RESOLVED) return;
			const entry = path.join(CONTENT_DIR, 'index.js');
			// In dev, load through Vite so edits to any concept file are picked up.
			const load = (file: string) => (server ? server.ssrLoadModule(file) : import(pathToFileURL(file).href));
			const mod = await load(entry);
			const translations: Record<string, Record<string, Raw>> = {};
			for (const lang of TRANSLATED_LANGS) {
				translations[lang] = {};
				for (const c of mod.concepts as Raw[]) {
					const file = path.join(CONTENT_DIR, 'i18n', lang, c.track, `${c.id}.js`);
					if (existsSync(file)) translations[lang][c.id] = toMetaText((await load(file)).default);
				}
			}
			return `export default ${JSON.stringify(mod.concepts.map(toMeta))};\nexport const translations = ${JSON.stringify(translations)};`;
		},
		hotUpdate({ file }) {
			if (!file.startsWith(CONTENT_DIR + path.sep)) return;
			const mod = this.environment.moduleGraph.getModuleById(RESOLVED);
			if (mod) this.environment.moduleGraph.invalidateModule(mod);
		}
	};
}
