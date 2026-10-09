import { describe } from 'vitest';
import { checkLessonI18n } from '../_clustering/i18n-check';

describe('gmm translations', () => checkLessonI18n(() => import('./index')));
