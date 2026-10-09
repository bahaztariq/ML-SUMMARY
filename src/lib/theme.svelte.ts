/**
 * Theme: light by default; dark only when the user picks it (data-theme="dark" on <html>).
 * `version` bumps whenever the colors change, so canvas scenes and diagrams can redraw.
 */
export type ThemePref = 'light' | 'dark';
const KEY = 'ml-hub-theme';

class Theme {
	pref = $state<ThemePref>('light');
	version = $state(0);

	load() {
		try {
			if (localStorage.getItem(KEY) === 'dark') this.pref = 'dark';
		} catch {}
	}

	get isDark() {
		return this.pref === 'dark';
	}

	set(pref: ThemePref) {
		this.pref = pref;
		if (pref === 'dark') document.documentElement.dataset.theme = 'dark';
		else delete document.documentElement.dataset.theme;
		try {
			if (pref === 'dark') localStorage.setItem(KEY, 'dark');
			else localStorage.removeItem(KEY);
		} catch {}
		this.version++;
	}

	cycle() {
		this.set(this.isDark ? 'light' : 'dark');
	}
}

export const theme = new Theme();
