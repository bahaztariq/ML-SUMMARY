import { beforeAll, describe } from 'vitest';
import { checkLessonI18n } from '../_clustering/i18n-check';

describe('tsne-umap translations', () => {
	// Warm the module (Svelte compile + tsne.ts) so the first check doesn't hit the 5 s default timeout.
	beforeAll(() => import('./index'), 60_000);
	checkLessonI18n(() => import('./index'));
});
