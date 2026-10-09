export type TrackId = 'fundamentals' | 'data-eng' | 'ml-core' | 'ml-models' | 'deep-learning' | 'mlops';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Parameter {
	name: string;
	type?: string;
	default?: string;
	impact?: string;
	tuningTip?: string;
}

/** The lightweight fields every page can use (see tools/concept-index-plugin.ts). */
export interface ConceptMeta {
	id: string;
	name: string;
	track: TrackId;
	category: string;
	task?: string[];
	difficulty: Difficulty;
	summary: string;
	prerequisites: string[];
	related: string[];
	/** Intuition and parameter names, for search only. */
	searchText?: string;
}

/** A full concept as written in content/<track>/<id>.js. */
export interface Concept extends ConceptMeta {
	intuition?: string;
	whenToUse?: string;
	whenToAvoid?: string;
	requirements?: Record<string, boolean | string>;
	parameters?: Parameter[];
	math?: { formula?: string; loss?: string; explanation?: string };
	pros?: string[];
	cons?: string[];
	diagram?: string;
	codeSnippet?: string;
}

export interface Track {
	id: TrackId;
	label: string;
	icon: string;
	color: string;
}

export interface LearningPath {
	id: string;
	icon: string;
	title: string;
	goal: string;
	steps: string[];
}

export interface Milestone {
	title: string;
	steps: string[];
}

export interface RoadmapStage {
	id: string;
	title: string;
	icon: string;
	goal: string;
	kind: 'core' | 'specialization';
	milestones: Milestone[];
}
