import { describe } from 'vitest';
import { checkLessonI18n } from '../_classifiers/i18n-check.ts';
import { walkTo, nextChange, type QState } from './state.ts';

describe('q-learning translations', () =>
	checkLessonI18n<QState>(() => import('./index.ts'), {
		0: [(s) => walkTo(s, 0), (s) => [1, 1, 1, 1, 1, 1, 0, 0, 0, 0].forEach((a) => walkTo(s, a))],
		2: [(s) => (s.t = 1), (s) => nextChange(s)],
		6: [(s) => (s.env.walls = [...s.env.walls, s.env.goal - 1, s.env.goal + 7])]
	}));
