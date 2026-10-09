import { describe } from 'vitest';
import { checkLessonI18n } from '../_classifiers/i18n-check.ts';
import type { TSState } from './state.ts';

describe('time-series-forecasting translations', () =>
	checkLessonI18n<TSState>(() => import('./index.ts'), {
		0: [(s) => (s.comp = { trend: false, season: false, noise: false })],
		2: [(s) => (s.diff = 'both'), (s) => (s.diff = 'none')],
		4: [(s) => (s.proc = 'ma')],
		5: [(s) => (s.p = 6)],
		7: [(s) => ((s.K = 6), (s.changepoints = true))]
	}));
