#!/usr/bin/env node
/**
 * Content validator: node tools/validate.js
 * Checks concept ids, required fields, graph links, prerequisite cycles and learning paths.
 */

import { readdirSync } from 'node:fs';
import { concepts, conceptById } from '../content/index.js';
import { tracks } from '../content/tracks.js';
import { learningPaths } from '../content/paths.js';
import { decisionTree, decisionTreeStart } from '../content/decision-tree.js';

const errors = [];
const warnings = [];
const trackIds = new Set(tracks.map(t => t.id));
const REQUIRED = ['id', 'name', 'track', 'category', 'difficulty', 'summary'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

// Unique ids
const seen = new Set();
for (const c of concepts) {
  if (seen.has(c.id)) errors.push(`duplicate id "${c.id}"`);
  seen.add(c.id);
}

// Every file on disk is registered, and lives in its track folder under its own id
const registered = new Set(concepts.map(c => `${c.track}/${c.id}.js`));
for (const t of trackIds) {
  let files = [];
  try { files = readdirSync(new URL(`../content/${t}/`, import.meta.url)); } catch { continue; }
  for (const f of files) {
    if (f.endsWith('.js') && !registered.has(`${t}/${f}`)) errors.push(`content/${t}/${f} is not imported in content/index.js (or its id/track does not match its path)`);
  }
}

for (const c of concepts) {
  const where = `[${c.id}]`;
  for (const k of REQUIRED) if (!c[k]) errors.push(`${where} missing "${k}"`);
  if (c.track && !trackIds.has(c.track)) errors.push(`${where} unknown track "${c.track}"`);
  if (c.difficulty && !DIFFICULTIES.includes(c.difficulty)) errors.push(`${where} unknown difficulty "${c.difficulty}"`);
  for (const field of ['prerequisites', 'related']) {
    for (const ref of c[field]) {
      if (ref === c.id) errors.push(`${where} lists itself in ${field}`);
      else if (!conceptById.has(ref)) errors.push(`${where} ${field} -> unknown id "${ref}"`);
    }
  }
  if (!c.diagram) warnings.push(`${where} has no diagram`);
}

// Prerequisite cycles (DFS)
const state = new Map();
function visit(id, stack) {
  if (state.get(id) === 'done') return;
  if (state.get(id) === 'active') {
    errors.push(`prerequisite cycle: ${[...stack.slice(stack.indexOf(id)), id].join(' -> ')}`);
    return;
  }
  state.set(id, 'active');
  for (const p of conceptById.get(id)?.prerequisites ?? []) if (conceptById.has(p)) visit(p, [...stack, id]);
  state.set(id, 'done');
}
for (const c of concepts) visit(c.id, []);

// Learning paths reference real concepts
for (const p of learningPaths) {
  for (const step of p.steps) if (!conceptById.has(step)) errors.push(`path "${p.id}" -> unknown id "${step}"`);
}

// "Which model?" decision tree: links resolve, results name real concepts, every node is reachable, no loops
if (!decisionTree[decisionTreeStart]) errors.push(`decision tree: missing start node "${decisionTreeStart}"`);
for (const [key, node] of Object.entries(decisionTree)) {
  if (node.q) {
    if (!node.options?.length) errors.push(`decision tree "${key}": question has no options`);
    for (const o of node.options ?? []) if (!decisionTree[o.next]) errors.push(`decision tree "${key}" -> unknown node "${o.next}"`);
  } else if (node.result) {
    if (!node.result.length) errors.push(`decision tree "${key}": empty result`);
    for (const id of node.result) if (!conceptById.has(id)) errors.push(`decision tree "${key}" -> unknown concept id "${id}"`);
  } else errors.push(`decision tree "${key}": neither a question nor a result`);
}
{
  const reached = new Set();
  const walk = (key, stack) => {
    if (stack.includes(key)) { errors.push(`decision tree loop: ${[...stack, key].join(' -> ')}`); return; }
    reached.add(key);
    for (const o of decisionTree[key]?.options ?? []) if (decisionTree[o.next]) walk(o.next, [...stack, key]);
  };
  if (decisionTree[decisionTreeStart]) walk(decisionTreeStart, []);
  for (const key of Object.keys(decisionTree)) if (!reached.has(key)) warnings.push(`decision tree node "${key}" is unreachable`);
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`\n${concepts.length} concepts, ${learningPaths.length} paths, ${Object.keys(decisionTree).length} decision-tree nodes: ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
