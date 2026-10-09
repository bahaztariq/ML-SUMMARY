/**
 * Small helpers shared by the ensemble lessons' French and Arabic narration and scenes.
 */

/**
 * Arabic noun with a count, following Arabic number agreement:
 * 1 → singular + «واحد(ة)», 2 → dual, 3–10 → plural, 11+ (and 0) → singular after the number.
 */
export function arCount(n: number, one: string, two: string, few: string, many = one): string {
	if (n === 1) return one;
	if (n === 2) return two;
	if (n >= 3 && n <= 10) return `${n} ${few}`;
	return `${n} ${many}`;
}

export const arTrees = (n: number) => arCount(n, 'شجرة واحدة', 'شجرتان', 'أشجار', 'شجرة');
export const arStages = (n: number) => arCount(n, 'مرحلة واحدة', 'مرحلتان', 'مراحل', 'مرحلة');
export const arRounds = (n: number) => arCount(n, 'جولة واحدة', 'جولتان', 'جولات', 'جولة');
export const arLeaves = (n: number) => arCount(n, 'ورقة واحدة', 'ورقتان', 'أوراق', 'ورقة');
