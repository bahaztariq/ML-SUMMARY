#!/usr/bin/env node
/**
 * Structural checks for concept translations (content/i18n/<lang>/<track>/<id>.js):
 * every concept translated, list lengths match English, and Mermaid diagrams keep the
 * same node ids and edge count. Run: node tools/check-translations.js
 */
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { concepts } from '../content/index.js';

const LANGS = ['fr', 'ar'];
const errors = [];
const warnings = [];

/** Mermaid source without label text (quoted labels and |edge labels|), so only syntax remains. */
const skeleton = (src) => src.replace(/"[^"]*"/g, '""').replace(/\|[^|\n]*\|/g, '||');
const nodeIds = (raw) => new Set([...skeleton(raw).matchAll(/(?:^|[\s;>&|-])([A-Za-z_][\w]*)\s*(?:\[|\(|\{|>)/gm)].map((m) => m[1]).filter((id) => !['flowchart', 'graph', 'subgraph', 'end', 'style', 'classDef', 'class', 'click', 'direction'].includes(id)));
const edgeCount = (raw) => (skeleton(raw).match(/--+>|==+>|-\.+->|--+-|--\s*\|/g) ?? []).length;

for (const c of concepts) {
  for (const lang of LANGS) {
    const file = new URL(`../content/i18n/${lang}/${c.track}/${c.id}.js`, import.meta.url);
    const where = `${lang}/${c.track}/${c.id}`;
    if (!existsSync(file)) { errors.push(`${where}: missing`); continue; }
    const t = (await import(pathToFileURL(file.pathname).href)).default;
    for (const k of ['name', 'summary']) if (!t[k]) errors.push(`${where}: no ${k}`);
    for (const k of ['intuition', 'whenToUse', 'whenToAvoid', 'category']) if (c[k] && !t[k]) warnings.push(`${where}: no ${k}`);
    for (const k of ['task', 'pros', 'cons', 'parameters']) {
      if (c[k]?.length && (t[k]?.length ?? 0) !== c[k].length) errors.push(`${where}: ${k} has ${t[k]?.length ?? 0} items, English has ${c[k].length}`);
    }
    if (c.math?.explanation && !t.math?.explanation) warnings.push(`${where}: no math.explanation`);
    if (c.diagram) {
      if (!t.diagram) warnings.push(`${where}: diagram not translated`);
      else {
        const a = nodeIds(c.diagram), b = nodeIds(t.diagram);
        const missing = [...a].filter((x) => !b.has(x));
        if (missing.length) errors.push(`${where}: diagram lost node ids ${missing.join(', ')}`);
        if (edgeCount(c.diagram) !== edgeCount(t.diagram)) errors.push(`${where}: diagram has ${edgeCount(t.diagram)} edges, English has ${edgeCount(c.diagram)}`);
      }
    }
  }
}
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`\n${concepts.length} concepts × ${LANGS.length} languages: ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
