/**
 * Typed access to content/ plus graph helpers, built on the lightweight concept index.
 * Full concepts (code, math, diagrams…) live in content-full.ts and are only loaded where needed.
 *
 * Text fields (concept names and summaries, track labels, path and stage titles) are getters
 * that read the current language, so components re-render when the language changes without
 * having to localize anything themselves. Translations live in content/i18n/<lang>/.
 */
import index, { translations } from 'virtual:concept-index';
import { tracks as rawTracks } from '#content/tracks.js';
import { learningPaths as rawPaths } from '#content/paths.js';
import { roadmap as rawRoadmap } from '#content/roadmap.js';
import { i18n } from './i18n/index.svelte.ts';
import type { ConceptMeta, LearningPath, RoadmapStage, Track, TrackId } from './types.ts';

/** Translations of site-wide texts: content/i18n/<lang>/site.js. */
export interface SiteText {
	tracks?: Partial<Record<TrackId, string>>;
	paths?: Record<string, { title?: string; goal?: string }>;
	roadmap?: Record<string, { title?: string; goal?: string; milestones?: string[] }>;
	[section: string]: unknown;
}
const siteTexts = import.meta.glob<SiteText>('/content/i18n/*/site.js', { eager: true, import: 'default' });

/** The current language's site texts, or undefined for English / missing translations. */
export function siteText(): SiteText | undefined {
	return i18n.current === 'en' ? undefined : siteTexts[`/content/i18n/${i18n.current}/site.js`];
}

function localizeMeta(raw: ConceptMeta): ConceptMeta {
	const tr = () => (i18n.current === 'en' ? undefined : translations[i18n.current]?.[raw.id]);
	return {
		id: raw.id,
		track: raw.track,
		difficulty: raw.difficulty,
		prerequisites: raw.prerequisites,
		related: raw.related,
		get name() {
			return tr()?.name ?? raw.name;
		},
		get category() {
			return tr()?.category ?? raw.category;
		},
		get task() {
			return tr()?.task ?? raw.task;
		},
		get summary() {
			return tr()?.summary ?? raw.summary;
		},
		get searchText() {
			return tr()?.searchText ?? raw.searchText;
		}
	};
}

export const concepts: ConceptMeta[] = index.map(localizeMeta);
export const conceptById = new Map(concepts.map((c) => [c.id, c]));

export const tracks: Track[] = (rawTracks as Track[]).map((t) => ({
	id: t.id,
	icon: t.icon,
	color: t.color,
	get label() {
		return siteText()?.tracks?.[t.id] ?? t.label;
	}
}));
export const trackById = Object.fromEntries(tracks.map((t) => [t.id, t])) as Record<TrackId, Track>;

export const learningPaths: LearningPath[] = (rawPaths as LearningPath[]).map((p) => ({
	id: p.id,
	icon: p.icon,
	steps: p.steps,
	get title() {
		return siteText()?.paths?.[p.id]?.title ?? p.title;
	},
	get goal() {
		return siteText()?.paths?.[p.id]?.goal ?? p.goal;
	}
}));
export const pathById = new Map(learningPaths.map((p) => [p.id, p]));

export const roadmap: RoadmapStage[] = (rawRoadmap as RoadmapStage[]).map((st) => ({
	id: st.id,
	icon: st.icon,
	kind: st.kind,
	get title() {
		return siteText()?.roadmap?.[st.id]?.title ?? st.title;
	},
	get goal() {
		return siteText()?.roadmap?.[st.id]?.goal ?? st.goal;
	},
	milestones: st.milestones.map((m, i) => ({
		steps: m.steps,
		get title() {
			return siteText()?.roadmap?.[st.id]?.milestones?.[i] ?? m.title;
		}
	}))
}));
/** Every concept id in roadmap order (core stages, then specializations). */
export const roadmapOrder = roadmap.flatMap((s) => s.milestones.flatMap((m) => m.steps));
export const stageConceptIds = (stage: RoadmapStage) => stage.milestones.flatMap((m) => m.steps);

/** Where a concept sits in the roadmap, with its neighbours inside the same stage. */
export function roadmapPosition(id: string) {
	const stageIndex = roadmap.findIndex((s) => stageConceptIds(s).includes(id));
	if (stageIndex === -1) return null;
	const stage = roadmap[stageIndex];
	const ids = stageConceptIds(stage);
	const i = ids.indexOf(id);
	const milestone = stage.milestones.find((m) => m.steps.includes(id))!;
	return {
		stage,
		stageIndex,
		milestone,
		index: i,
		size: ids.length,
		prev: i > 0 ? conceptById.get(ids[i - 1]) : undefined,
		next: i < ids.length - 1 ? conceptById.get(ids[i + 1]) : undefined
	};
}

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
