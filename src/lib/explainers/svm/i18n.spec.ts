import { describe } from 'vitest';
import { checkLessonI18n } from '../_classifiers/i18n-check.ts';
import { setC, setGamma, type SvmState } from './state.ts';

describe('svm translations', () =>
	checkLessonI18n<SvmState>(() => import('./index.ts'), {
		4: [(s) => setC(s, 0.01), (s) => setC(s, 1000)],
		7: [(s) => setGamma(s, 100)]
	}));
