import { describe } from 'vitest';
import { checkLessonI18n } from '../_classifiers/i18n-check.ts';
import { EPOCHS, setRating, type RecState } from './state.ts';

describe('recommender-systems translations', () =>
	checkLessonI18n<RecState>(() => import('./index.ts'), {
		1: [(s) => (s.user = 3)],
		4: [(s) => (s.epoch = EPOCHS)],
		5: [(s) => (s.focus = 5)],
		6: [(s) => setRating(s, 6, 0, 5), (s) => (setRating(s, 6, 0, 5), setRating(s, 6, 1, 5)), (s) => (setRating(s, 6, 0, 5), setRating(s, 6, 3, 1))]
	}));
