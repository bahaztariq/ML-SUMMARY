import { describe, expect, it } from 'vitest';
import { conceptById, concepts, tracks } from '#lib/content.ts';
import {
	directPrerequisites,
	knowledgeTree,
	localizePipeline,
	mermaidSkeleton,
	nodeKey,
	pipelineGraph,
	pipelines,
	prerequisiteGraph,
	taxonomy,
	taxonomyGraph,
	taxonomyLabel
} from './graphs.ts';

/** Node ids declared in a flowchart source (id followed by a shape opener). */
const declared = (source: string) =>
	new Set([...source.matchAll(/^\s*([A-Za-z0-9_]+)\s*(?:\[|\(|\{)/gm)].map((m) => m[1]));
const edges = (source: string) => [...source.matchAll(/^\s*([A-Za-z0-9_]+) -->\s*([A-Za-z0-9_]+)$/gm)].map((m) => [m[1], m[2]]);

describe('prerequisiteGraph', () => {
	for (const t of tracks) {
		it(`contains every ${t.id} concept and only valid edges`, () => {
			const g = prerequisiteGraph(t.id, () => false, { reduce: false });
			const nodes = declared(g.source);
			const inTrack = concepts.filter((c) => c.track === t.id);
			for (const c of inTrack) {
				expect(nodes.has(nodeKey(c.id))).toBe(true);
				expect(g.links[nodeKey(c.id)]).toBe(c.id);
			}
			const es = edges(g.source);
			const expected = inTrack.reduce((n, c) => n + c.prerequisites.filter((p) => conceptById.has(p)).length, 0);
			expect(es.length).toBe(expected);
			for (const [from, to] of es) {
				expect(nodes.has(from)).toBe(true);
				const target = conceptById.get(g.links[to])!;
				expect(target.track).toBe(t.id);
				expect(target.prerequisites).toContain(g.links[from]);
			}
		});
	}

	it('reduced graph keeps exactly the direct (non-implied) prerequisite edges', () => {
		for (const t of tracks) {
			const g = prerequisiteGraph(t.id);
			const es = edges(g.source).map(([a, b]) => `${g.links[a]}>${g.links[b]}`).sort();
			const expected = concepts
				.filter((c) => c.track === t.id)
				.flatMap((c) => directPrerequisites(c).map((p) => `${p}>${c.id}`))
				.sort();
			expect(es).toEqual(expected);
		}
		const full = tracks.reduce((n, t) => n + edges(prerequisiteGraph(t.id, () => false, { reduce: false }).source).length, 0);
		const reduced = tracks.reduce((n, t) => n + edges(prerequisiteGraph(t.id).source).length, 0);
		expect(reduced).toBeLessThan(full);
	});

	it('wraps categories in subgraphs on request', () => {
		const g = prerequisiteGraph('ml-core', () => false, { groupByCategory: true });
		expect(g.source).toMatch(/subgraph cat0\["/);
	});

	it('can hide prerequisites from other tracks', () => {
		const g = prerequisiteGraph('ml-models', () => false, { external: false });
		for (const id of Object.values(g.links)) expect(conceptById.get(id)!.track).toBe('ml-models');
		for (const [from] of edges(g.source)) expect(conceptById.get(g.links[from])!.track).toBe('ml-models');
		expect(g.source).not.toContain('external');
	});

	it('marks learned concepts', () => {
		const g = prerequisiteGraph('ml-core', (id) => id === 'feature-scaling');
		expect(g.source).toContain(`${nodeKey('feature-scaling')}["${conceptById.get('feature-scaling')!.name} ✓"]`);
		expect(g.source).toMatch(new RegExp(`class ${nodeKey('feature-scaling')} learned`));
	});
});

describe('taxonomyGraph', () => {
	it('links only to existing concepts, declaring shared leaves once', () => {
		const g = taxonomyGraph(taxonomy);
		for (const id of Object.values(g.links)) expect(conceptById.has(id)).toBe(true);
		const svmDecls = g.source.split('\n').filter((l) => l.trim().startsWith(`${nodeKey('svm')}[`));
		expect(svmDecls.length).toBe(1);
		const nodes = declared(g.source);
		for (const [a, b] of edges(g.source)) expect(nodes.has(a) && nodes.has(b)).toBe(true);
	});

	it('skips unknown ids', () => {
		const g = taxonomyGraph({ label: 'Root', children: ['kmeans', 'does-not-exist'] });
		expect(Object.values(g.links)).toEqual(['kmeans']);
		expect(edges(g.source).length).toBe(1);
	});
});

describe('pipelines', () => {
	it('every link points at a node in the source and an existing concept', () => {
		for (const p of pipelines) {
			const g = pipelineGraph(p);
			expect(Object.keys(g.links).length).toBe(Object.keys(p.links).length);
			for (const key of Object.keys(p.links)) expect(p.source).toMatch(new RegExp(`\\b${key}\\s*[[({]`));
		}
	});

	it('are translated with the same Mermaid skeleton, and fall back to English otherwise', () => {
		for (const lang of ['fr', 'ar'] as const) {
			for (const p of pipelines) {
				const tr = localizePipeline(p, lang);
				expect(tr.title).not.toBe(p.title);
				expect(tr.source).not.toBe(p.source);
				expect(mermaidSkeleton(tr.source)).toBe(mermaidSkeleton(p.source));
			}
		}
		const broken = { ...pipelines[0], id: 'nope' };
		expect(localizePipeline(broken, 'fr')).toBe(broken);
	});
});

describe('taxonomy labels', () => {
	it('translate grouping nodes', () => {
		expect(taxonomyLabel('Machine Learning', 'fr')).toBe('Apprentissage automatique');
		expect(taxonomyLabel('Machine Learning', 'en')).toBe('Machine Learning');
		expect(taxonomyGraph(taxonomy, undefined, (l) => `<${l}>`).source).toContain('(["‹Machine Learning›"])');
	});
});

describe('knowledgeTree', () => {
	it('contains every concept exactly once', () => {
		const ids = knowledgeTree().flatMap((t) => t.categories.flatMap((c) => c.items.map((x) => x.id)));
		expect(ids.length).toBe(concepts.length);
		expect(new Set(ids).size).toBe(concepts.length);
	});
});
