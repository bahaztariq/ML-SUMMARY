/**
 * The full knowledge base. Import only from server code (e.g. +page.server.ts) or pages that
 * genuinely need every field client-side, since it pulls all 96 concept files into the bundle.
 */
import * as raw from '#content';
import type { Concept } from './types';

export const fullConcepts = raw.concepts as Concept[];
export const fullConceptById = raw.conceptById as Map<string, Concept>;
