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
import { pipelines } from '../content/pipelines.js';
import { taxonomy, taxonomyConceptIds } from '../content/taxonomy.js';
import { roadmap, roadmapOrder } from '../content/roadmap.js';
import { questions } from '../content/quiz/index.js';
import { validateBank } from '../src/lib/quiz/engine.ts';

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

// Roadmap: every concept exactly once, and never before one of its prerequisites
{
  const order = roadmapOrder();
  const pos = new Map();
  order.forEach((id, i) => {
    if (!conceptById.has(id)) errors.push(`roadmap -> unknown concept id "${id}"`);
    if (pos.has(id)) errors.push(`roadmap lists "${id}" more than once`);
    pos.set(id, i);
  });
  for (const c of concepts) {
    if (!pos.has(c.id)) errors.push(`roadmap is missing "${c.id}"`);
    for (const p of c.prerequisites) {
      if (pos.get(p) > pos.get(c.id)) errors.push(`roadmap puts "${c.id}" before its prerequisite "${p}"`);
    }
  }
  const ids = roadmap.map((s) => s.id);
  if (new Set(ids).size !== ids.length) errors.push('roadmap has duplicate stage ids');
}

// Map: taxonomy and pipeline diagrams link to real concepts (and pipeline links name real Mermaid nodes)
for (const id of taxonomyConceptIds()) if (!conceptById.has(id)) errors.push(`taxonomy -> unknown concept id "${id}"`);
for (const p of pipelines) {
  for (const [node, id] of Object.entries(p.links)) {
    if (!conceptById.has(id)) errors.push(`pipeline "${p.id}" node ${node} -> unknown concept id "${id}"`);
    if (!new RegExp(`\\b${node}\\s*[[({]`).test(p.source)) errors.push(`pipeline "${p.id}" links unknown node "${node}"`);
  }
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

// Translations of the map and "Which model?" data (content/i18n/<lang>/{decision-tree,pipelines,taxonomy}.js)
{
  const { existsSync } = await import('node:fs');
  const load = async (lang, file) => {
    const url = new URL(`../content/i18n/${lang}/${file}.js`, import.meta.url);
    return existsSync(url) ? (await import(url.href)).default : undefined;
  };
  // Mermaid with every quoted label emptied: ids, arrows and links must match the English source.
  const skeleton = (src) => src.replace(/"[^"]*"/g, '""').replace(/[ \t]+/g, ' ').trim();
  const groupLabels = new Set();
  const collect = (n) => { if (typeof n !== 'string') { groupLabels.add(n.label); n.children?.forEach(collect); } };
  collect(taxonomy);
  for (const lang of ['fr', 'ar']) {
    const tree = await load(lang, 'decision-tree');
    if (!tree) warnings.push(`${lang}: no decision-tree translation`);
    else {
      for (const [key, tr] of Object.entries(tree)) {
        const node = decisionTree[key];
        if (!node) { errors.push(`${lang} decision tree: unknown node "${key}"`); continue; }
        if (node.q && tr.options && tr.options.length !== node.options.length)
          errors.push(`${lang} decision tree "${key}": ${tr.options.length} option labels for ${node.options.length} options`);
        if (node.result && (tr.q || tr.options)) errors.push(`${lang} decision tree "${key}": result node has question texts`);
      }
      for (const [key, node] of Object.entries(decisionTree)) {
        const tr = tree[key];
        if (!tr || (node.q ? !tr.q || !tr.options : !tr.note)) warnings.push(`${lang} decision tree "${key}" is not translated`);
      }
    }
    const pipes = await load(lang, 'pipelines');
    if (!pipes) warnings.push(`${lang}: no pipelines translation`);
    else {
      for (const id of Object.keys(pipes)) if (!pipelines.some((p) => p.id === id)) errors.push(`${lang} pipelines: unknown pipeline "${id}"`);
      for (const p of pipelines) {
        const tr = pipes[p.id];
        if (!tr?.title || !tr.description || !tr.source) warnings.push(`${lang} pipeline "${p.id}" is not fully translated`);
        if (tr?.source && skeleton(tr.source) !== skeleton(p.source))
          errors.push(`${lang} pipeline "${p.id}": translated Mermaid source changes node ids, arrows or links (only quoted labels may differ)`);
      }
    }
    const tax = await load(lang, 'taxonomy');
    if (!tax) warnings.push(`${lang}: no taxonomy translation`);
    else {
      for (const label of Object.keys(tax)) if (!groupLabels.has(label)) errors.push(`${lang} taxonomy: unknown label "${label}"`);
      for (const label of groupLabels) if (!tax[label]) warnings.push(`${lang} taxonomy label "${label}" is not translated`);
    }
  }
}

// Quiz bank
for (const e of validateBank(questions, new Set(concepts.map((c) => c.id)))) errors.push(`quiz ${e}`);
for (const q of questions) {
  for (const lang of ['fr', 'ar']) {
    if (!q.q[lang] || !q.explain[lang] || !q.options[lang]) { warnings.push(`quiz [${q.id}] missing ${lang} translation`); break; }
  }
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`\n${concepts.length} concepts, ${learningPaths.length} paths, ${Object.keys(decisionTree).length} decision-tree nodes, ${questions.length} quiz questions: ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
