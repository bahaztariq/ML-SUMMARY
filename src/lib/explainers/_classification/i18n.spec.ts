import { describe, it } from 'vitest';
import { conceptById } from '#lib/content.ts';
import type { ExplainerModule } from '../types.ts';
import { checkTranslations } from './lessonChecks.ts';
import cm from '../confusion-matrix-concept/index.ts';
import prf from '../precision-recall-f1/index.ts';
import roc from '../roc-auc/index.ts';
import pr from '../pr-curve/index.ts';
import ll from '../log-loss/index.ts';

const ids = new Set(conceptById.keys());

describe('classification lesson translations', () => {
	for (const [name, mod] of Object.entries<ExplainerModule>({ cm, prf, roc, pr, ll })) {
		it(`${name}: fr and ar line up with the English steps`, () => checkTranslations(mod, ids));
	}
});
