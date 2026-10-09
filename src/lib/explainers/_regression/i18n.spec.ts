import { describe, it } from 'vitest';
import { checkI18n } from './lesson-check.ts';
import type { ExplainerModule } from '../types.ts';
import kmeans from '../kmeans/index.ts';
import decisionTree from '../decision-tree/index.ts';
import gradientDescent from '../gradient-descent/index.ts';
import linearRegression from '../linear-regression/index.ts';
import rmse from '../rmse-metric/index.ts';
import mae from '../mae-metric/index.ts';
import r2 from '../r2-score/index.ts';

const lessons: Record<string, ExplainerModule<any>> = { kmeans, decisionTree, gradientDescent, linearRegression, rmse, mae, r2 };

describe('lesson translations (fr, ar)', () => {
	for (const [name, lesson] of Object.entries(lessons)) it(name, () => checkI18n(lesson));
});
