/**
 * Typed access to content/ plus graph helpers, built on the lightweight concept index.
 * Full concepts (code, math, diagrams…) live in content-full.ts and are only loaded where needed.
 */
import index from 'virtual:concept-index';
import { tracks as rawTracks } from '#content/tracks.js';
import { learningPaths as rawPaths } from '#content/paths.js';
import type { ConceptMeta, LearningPath, Track, TrackId } from './types.ts';

export const concepts: ConceptMeta[] = index;
export const conceptById = new Map(concepts.map((c) => [c.id, c]));
export const tracks = rawTracks as Track[];
export const trackById = Object.fromEntries(tracks.map((t) => [t.id, t])) as Record<TrackId, Track>;
export const learningPaths = rawPaths as LearningPath[];
export const pathById = new Map(learningPaths.map((p) => [p.id, p]));

const dependents = new Map<string, ConceptMeta[]>();
for (const c of concepts) {
	for (const p of c.prerequisites) {
		if (!dependents.has(p)) dependents.set(p, []);
		dependents.get(p)!.push(c);
	}
}

/** Concepts that list `id` as a prerequisite ("what this unlocks"). */
export function getDependents(id: string): ConceptMeta[] {
	return dependents.get(id) ?? [];
}

export function getConcepts(ids: string[]): ConceptMeta[] {
	return ids.map((id) => conceptById.get(id)).filter((c): c is ConceptMeta => !!c);
}

export function conceptsInTrack(track: TrackId): ConceptMeta[] {
	return concepts.filter((c) => c.track === track);
}

/** Learning paths that include this concept, with its position. */
export function pathsContaining(id: string) {
	return learningPaths
		.map((path) => ({ path, index: path.steps.indexOf(id) }))
		.filter((x) => x.index !== -1);
}

/** Mermaid flowchart: prerequisites (2 levels up) → concept → what it unlocks. */
export function learningChain(concept: ConceptMeta, isLearned: (id: string) => boolean) {
	const lines = ['flowchart LR'];
	const links: Record<string, string> = {};
	const edges = new Set<string>();
	const key = (id: string) => 'c_' + id.replace(/[^a-zA-Z0-9]/g, '_');
	const declare = (id: string) => {
		const k = key(id);
		if (!links[k]) {
			links[k] = id;
			const c = conceptById.get(id)!;
			lines.push(`  ${k}["${mermaidLabel(c.name)}${isLearned(id) ? ' ✓' : ''}"]`);
		}
		return k;
	};
	const edge = (from: string, to: string) => edges.add(`  ${declare(from)} --> ${declare(to)}`);

	declare(concept.id);
	const walkUp = (id: string, depth: number) => {
		if (depth === 0) return;
		for (const pre of conceptById.get(id)!.prerequisites) {
			if (!conceptById.has(pre) || pre === concept.id) continue;
			edge(pre, id);
			walkUp(pre, depth - 1);
		}
	};
	walkUp(concept.id, 2);
	for (const dep of getDependents(concept.id)) edge(concept.id, dep.id);

	const current = key(concept.id);
	delete links[current];
	return { source: [...lines, ...edges].join('\n'), links, current };
}

/** Quote text for use inside a Mermaid ["label"]. */
export function mermaidLabel(text: string) {
	return String(text).replace(/"/g, '#quot;').replace(/</g, '‹').replace(/>/g, '›');
}

/** Readable label for a camelCase requirements key. */
export function formatKey(str: string) {
	return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}
