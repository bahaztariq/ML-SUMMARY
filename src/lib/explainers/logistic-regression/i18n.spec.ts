import { describe } from 'vitest';
import { checkLessonI18n } from '../_classifiers/i18n-check.ts';
import { train } from './state.ts';
import type { LogState } from './state.ts';

describe('logistic-regression translations', () =>
	checkLessonI18n<LogState>(() => import('./index.ts'), {
		5: [(s) => train(s, 5), (s) => train(s, 5000)],
		6: [(s) => (s.threshold = 0.1)]
	}));
