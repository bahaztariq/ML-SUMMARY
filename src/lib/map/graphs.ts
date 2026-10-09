/**
 * Mermaid sources for the Map section: taxonomy, per-track prerequisite graph and pipelines.
 * Each builder returns `{ source, links }` where `links` maps Mermaid node ids → concept ids
 * (the shape `Diagram.svelte` expects).
 */
import { conceptById, concepts, mermaidLabel, tracks } from '#lib/content.ts';
import { taxonomy as rawTaxonomy } from '#content/taxonomy.js';
import { pipelines as rawPipelines } from '#content/pipelines.js';
import { i18n, type Lang } from '#lib/i18n/index.svelte.ts';
import type { ConceptMeta, Track, TrackId } from '#lib/types.ts';

export interface TaxonomyGroup {
	label: string;
	concept?: string;
	children: TaxonomyNode[];
}
export type TaxonomyNode = string | TaxonomyGroup;

export interface Pipeline {
	id: string;
	icon: string;
	title: string;
	description: string;
	source: string;
	links: Record<string, string>;
}

export interface Graph {
	source: string;
	links: Record<string, string>;
}

export const taxonomy = rawTaxonomy as TaxonomyGroup;
export const pipelines = rawPipelines as Pipeline[];

/* ------------------------------------------------ translations: content/i18n/<lang>/… */

type PipelineText = Partial<Pick<Pipeline, 'title' | 'description' | 'source'>>;
const taxonomyTexts = import.meta.glob<Record<string, string>>('/content/i18n/*/taxonomy.js', { eager: true, import: 'default' });
const pipelineTexts = import.meta.glob<Record<string, PipelineText>>('/content/i18n/*/pipelines.js', {
	eager: true,
	import: 'default'
});

/** A taxonomy grouping label in the given language (English when untranslated). */
export function taxonomyLabel(label: string, lang: Lang = i18n.current): string {
	return (lang === 'en' ? undefined : taxonomyTexts[`/content/i18n/${lang}/taxonomy.js`]?.[label]) ?? label;
}

/** A Mermaid source with every quoted label emptied: what must not change in a translation (ids, arrows, links). */
export function mermaidSkeleton(source: string): string {
	return source
		.replace(/"[^"]*"/g, '""')
		.replace(/[ \t]+/g, ' ')
		.trim();
}

/** A pipeline with its title, description and diagram in the given language. */
export function localizePipeline(p: Pipeline, lang: Lang = i18n.current): Pipeline {
	const tr = lang === 'en' ? undefined : pipelineTexts[`/content/i18n/${lang}/pipelines.js`]?.[p.id];
	if (!tr) return p;
	// A translated diagram must declare the same nodes, or its concept links would break.
	const sameNodes = !!tr.source && mermaidSkeleton(tr.source) === mermaidSkeleton(p.source);
	return {
		...p,
		title: tr.title ?? p.title,
		description: tr.description ?? p.description,
		source: sameNodes ? tr.source! : p.source
	};
}

/** Stable Mermaid node id for a concept. */
export const nodeKey = (id: string) => 'c_' + id.replace(/[^a-zA-Z0-9]/g, '_');

const learnedMark = (learned: boolean) => (learned ? ' ✓' : '');

/** AI → ML → families → models. Grouping nodes are stadium-shaped; concepts are boxes. */
export function taxonomyGraph(
	root: TaxonomyGroup = taxonomy,
	isLearned: (id: string) => boolean = () => false,
	labelOf: (label: string) => string = taxonomyLabel
): Graph {
	// ~45 leaves stacked vertically: tighten sibling spacing and let labels run wider so it stays compact.
	const lines = [`%%{init: {"flowchart": {"nodeSpacing": 12, "rankSpacing": 56, "wrappingWidth": 280}}}%%`, 'flowchart LR'];
	const edges: string[] = [];
	const links: Record<string, string> = {};
	const groups: string[] = [];
	const learned: string[] = [];
	let counter = 0;

	const declare = (node: TaxonomyNode): string | null => {
		if (typeof node === 'string') {
			const c = conceptById.get(node);
			if (!c) return null;
			const key = nodeKey(node);
			if (!links[key]) {
				links[key] = node;
				lines.push(`  ${key}["${mermaidLabel(c.name)}${learnedMark(isLearned(node))}"]`);
				if (isLearned(node)) learned.push(key);
			}
			return key;
		}
		const key = `g${counter++}`;
		lines.push(`  ${key}(["${mermaidLabel(labelOf(node.label))}"])`);
		groups.push(key);
		if (node.concept && conceptById.has(node.concept)) links[key] = node.concept;
		for (const child of node.children ?? []) {
			const childKey = declare(child);
			if (childKey) edges.push(`  ${key} --> ${childKey}`);
		}
		return key;
	};

	declare(root);
	edges.push(`  class ${groups.join(',')} group`);
	if (learned.length) edges.push(`  class ${learned.join(',')} learned`);
	return { source: [...lines, ...edges].join('\n'), links };
}

export interface PrereqOptions {
	/** Also draw prerequisites that live in other tracks (as rounded, dashed nodes). */
	external?: boolean;
	/** Wrap each category in a Mermaid subgraph. Dagre lays dense cross-category graphs out poorly, so off by default. */
	groupByCategory?: boolean;
	/** Drop arrows already implied by a longer chain (a → c when a → b → c). On by default to cut clutter. */
	reduce?: boolean;
}

const ancestorMemo = new Map<string, Set<string>>();
/** Every transitive prerequisite of a concept. Content is validated to be acyclic. */
export function ancestors(id: string): Set<string> {
	let set = ancestorMemo.get(id);
	if (set) return set;
	set = new Set();
	for (const p of conceptById.get(id)?.prerequisites ?? []) {
		if (!conceptById.has(p)) continue;
		set.add(p);
		for (const a of ancestors(p)) set.add(a);
	}
	ancestorMemo.set(id, set);
	return set;
}

/** Prerequisites of `c` that are not already reachable through another of its prerequisites. */
export function directPrerequisites(c: ConceptMeta): string[] {
	const pres = c.prerequisites.filter((p) => conceptById.has(p));
	return pres.filter((p) => !pres.some((q) => q !== p && ancestors(q).has(p)));
}

/**
 * Prerequisite flowchart for one track: arrows from prerequisite → concept, optionally grouped by category.
 */
export function prerequisiteGraph(
	trackId: TrackId,
	isLearned: (id: string) => boolean = () => false,
	{ external = true, groupByCategory = false, reduce = true }: PrereqOptions = {}
): Graph {
	const inTrack = concepts.filter((c) => c.track === trackId);
	const ids = new Set(inTrack.map((c) => c.id));
	const lines = ['flowchart LR'];
	const edges: string[] = [];
	const links: Record<string, string> = {};

	const externals: string[] = [];
	const learned: string[] = [];
	const node = (c: ConceptMeta, ext: boolean) => {
		const k = nodeKey(c.id);
		links[k] = c.id;
		if (ext) externals.push(k);
		if (isLearned(c.id)) learned.push(k);
		const label = `${mermaidLabel(c.name)}${learnedMark(isLearned(c.id))}`;
		return ext ? `${k}(["${label}"])` : `${k}["${label}"]`;
	};

	if (groupByCategory) {
		categoriesOf(inTrack).forEach(({ name, items }, i) => {
			lines.push(`  subgraph cat${i}["${mermaidLabel(name)}"]`);
			for (const c of items) lines.push(`    ${node(c, false)}`);
			lines.push('  end');
		});
	} else {
		for (const c of inTrack) lines.push(`  ${node(c, false)}`);
	}

	for (const c of inTrack) {
		for (const pre of reduce ? directPrerequisites(c) : c.prerequisites) {
			const p = conceptById.get(pre);
			if (!p) continue;
			if (!ids.has(pre)) {
				if (!external) continue;
				if (!links[nodeKey(pre)]) lines.push(`  ${node(p, true)}`);
			}
			edges.push(`  ${nodeKey(pre)} --> ${nodeKey(c.id)}`);
		}
	}
	// Class names land on the <g class="node …"> element; Map styles them with design tokens.
	if (externals.length) edges.push(`  class ${externals.join(',')} external`);
	if (learned.length) edges.push(`  class ${learned.join(',')} learned`);
	return { source: [...lines, ...edges].join('\n'), links };
}

/** Pipeline links restricted to concepts that exist (content may be renamed). */
export function pipelineGraph(p: Pipeline): Graph {
	return { source: p.source, links: Object.fromEntries(Object.entries(p.links).filter(([, id]) => conceptById.has(id))) };
}

function categoriesOf(items: ConceptMeta[]) {
	const byCat = new Map<string, ConceptMeta[]>();
	for (const c of items) {
		if (!byCat.has(c.category)) byCat.set(c.category, []);
		byCat.get(c.category)!.push(c);
	}
	return [...byCat].map(([name, items]) => ({ name, items }));
}

export interface TreeTrack {
	track: Track;
	concepts: ConceptMeta[];
	categories: { name: string; items: ConceptMeta[] }[];
}

/** Track → category → concepts, in content order. */
export function knowledgeTree(): TreeTrack[] {
	return tracks.map((track) => {
		const inTrack = concepts.filter((c) => c.track === track.id);
		return { track, concepts: inTrack, categories: categoriesOf(inTrack) };
	});
}
