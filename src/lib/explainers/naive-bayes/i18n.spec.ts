import { describe, expect, it } from 'vitest';
import { checkLessonI18n } from '../_classifiers/i18n-check.ts';
import { setWords, type NBState } from './state.ts';
import { WORD_LABELS, wordLabel } from './words.ts';
import { WORDS } from './nb.ts';

describe('naive-bayes translations', () => {
	checkLessonI18n<NBState>(() => import('./index.ts'), {
		2: [(s) => setWords(s, [])],
		3: [(s) => setWords(s, ['meeting', 'report'])],
		5: [(s) => (s.alpha = 1)]
	});
	it('every spam-filter word has a French and an Arabic label', () => {
		for (const w of WORDS) {
			expect(WORD_LABELS.fr[w.id], w.id).toBeTruthy();
			expect(WORD_LABELS.ar[w.id], w.id).toBeTruthy();
			expect(wordLabel(w.id, 'en')).toBe(w.label);
		}
	});
});
