import { describe } from 'vitest';
import { checkLessonI18n } from '../_classifiers/i18n-check.ts';
import type { KnnState } from './state.ts';

describe('knn translations', () =>
	checkLessonI18n<KnnState>(() => import('./index.ts'), {
		0: [(s) => (s.weights = 'distance')],
		1: [(s) => (s.k = 4)],
		6: [(s) => (s.metric = 'manhattan'), (s) => (s.metric = 'chebyshev')],
		7: [(s) => (s.scaleY = 1)]
	}));
