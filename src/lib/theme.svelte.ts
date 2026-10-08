/**
 * Theme preference: 'system' follows the OS; 'light'/'dark' are pinned via data-theme on <html>.
 * `version` bumps whenever the effective colors may have changed, so canvas scenes can redraw.
 */
import { browser } from '$app/env';

export type ThemePref = 'system' | 'light' | 'dark';
const KEY = 'ml-hub-theme';

class Theme {
	pref = $state<ThemePref>('system');
	version = $state(0);

	load() {
		try {
			const t = localStorage.getItem(KEY);
			if (t === 'light' || t === 'dark') this.pref = t;
		} catch {}
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
			if (this.pref === 'system') this.version++;
		});
	}

	get isDark() {
		this.version;
		if (!browser) return false;
		if (this.pref !== 'system') return this.pref === 'dark';
		return window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	set(pref: ThemePref) {
		this.pref = pref;
		if (pref === 'system') delete document.documentElement.dataset.theme;
		else document.documentElement.dataset.theme = pref;
		try {
			if (pref === 'system') localStorage.removeItem(KEY);
			else localStorage.setItem(KEY, pref);
		} catch {}
		this.version++;
	}

	cycle() {
		this.set(this.isDark ? 'light' : 'dark');
	}
}

export const theme = new Theme();
