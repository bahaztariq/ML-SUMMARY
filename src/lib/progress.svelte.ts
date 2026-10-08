/**
 * Learning progress, persisted per browser in localStorage.
 * Storage can be unavailable (private mode, blocked site data), so every access is guarded.
 * Keeps the legacy key so progress from the old app carries over.
 */
import { browser } from '$app/env';
import { SvelteSet } from 'svelte/reactivity';

const LEARNED_KEY = 'ml-hub-learned';
const RECENT_KEY = 'ml-hub-recent';

function read<T>(key: string, fallback: T): T {
	if (!browser) return fallback;
	try {
		const v = localStorage.getItem(key);
		return v ? (JSON.parse(v) as T) : fallback;
	} catch {
		return fallback;
	}
}

function write(key: string, value: unknown) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Progress just won't survive a reload.
	}
}

class Progress {
	learned = new SvelteSet<string>();
	/** Most recently opened concept ids, newest first. */
	recent = $state<string[]>([]);
	/** False during SSR/prerender and until localStorage has been read. */
	ready = $state(false);

	load() {
		for (const id of read<string[]>(LEARNED_KEY, [])) this.learned.add(id);
		this.recent = read<string[]>(RECENT_KEY, []);
		this.ready = true;
	}

	isLearned = (id: string) => this.learned.has(id);

	toggle(id: string) {
		if (this.learned.has(id)) this.learned.delete(id);
		else this.learned.add(id);
		write(LEARNED_KEY, [...this.learned]);
	}

	visit(id: string) {
		this.recent = [id, ...this.recent.filter((x) => x !== id)].slice(0, 12);
		write(RECENT_KEY, this.recent);
	}

	countIn(ids: string[]) {
		return ids.reduce((n, id) => n + (this.learned.has(id) ? 1 : 0), 0);
	}
}

export const progress = new Progress();
