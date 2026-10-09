/**
 * The quiz question bank: one file per topic, each a default-exported array of questions.
 *
 * @typedef {{ en: string, fr?: string, ar?: string }} Text
 * @typedef {{ en: string[], fr?: string[], ar?: string[] }} Options
 * @typedef {{
 *   id: string,            // unique, kebab-case, e.g. "gd-learning-rate-too-high"
 *   concept: string,       // the concept id this tests (links to its page)
 *   difficulty: 1 | 2 | 3, // 1 = recall, 2 = understanding, 3 = application
 *   q: Text,               // the question
 *   options: Options,      // 2–4 options, same order in every language
 *   answer: number,        // index of the correct option
 *   explain: Text          // why the answer is right (shown after answering)
 * }} Question
 */
import fundamentals from './fundamentals.js';
import dataPrep from './data-prep.js';
import mlTheory from './ml-theory.js';
import models from './models.js';
import metrics from './metrics.js';
import deepLearning from './deep-learning.js';
import dataEng from './data-eng.js';
import mlops from './mlops.js';

/** @type {Question[]} */
export const questions = [...fundamentals, ...dataPrep, ...mlTheory, ...models, ...metrics, ...deepLearning, ...dataEng, ...mlops];
