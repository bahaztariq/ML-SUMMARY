import { describe } from 'vitest';
import { checkLessonI18n } from '../_clustering/i18n-check';

// Replaying every step builds several forests and score maps, so allow more than the default 5 s.
describe('isolation-forest translations', { timeout: 30_000 }, () => checkLessonI18n(() => import('./index')));
