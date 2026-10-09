/**
 * Tiny memo cache shared by the ensemble lessons. Fitting forests and boosted models is pure and
 * deterministic, so results are keyed by the settings that produced them and reused on replay.
 */
export function memo(limit = 600) {
	const store = new Map<string, unknown>();
	return function cached<T>(key: string, make: () => T): T {
		if (!store.has(key)) {
			if (store.size > limit) store.clear();
			store.set(key, make());
		}
		return store.get(key) as T;
	};
}

export const pct = (v: number, d = 0) => (Number.isFinite(v) ? `${(v * 100).toFixed(d)}%` : '—');
export const f2 = (v: number) => (Number.isFinite(v) ? v.toFixed(2) : '—');
export const f3 = (v: number) => (Number.isFinite(v) ? v.toFixed(3) : '—');
/** Signed number with an explicit + for positives, e.g. "+0.21" / "−0.40". */
export const sgn = (v: number, d = 2) => (v >= 0 ? `+${v.toFixed(d)}` : `−${Math.abs(v).toFixed(d)}`);
