import type { Component } from 'svelte';

/**
 * A guided explainer: narration on one side, a live scene on the other.
 *
 * State is plain data owned by the player and made deeply reactive. Each step's
 * `enter` mutates it to set the scene up. Moving to step i replays init() and
 * enter() for steps 0..i, so every step looks the same whichever way you arrive.
 */
export interface ExplainerModule<S extends object = any> {
	/** Short heading shown above the player, e.g. "How K-Means finds clusters". */
	title: string;
	init: () => S;
	steps: Step<S>[];
	Scene: Component<SceneProps<S>>;
}

export interface SceneProps<S> {
	/** Shared, deeply reactive state — scenes read and write it directly. */
	s: S;
	/** Index of the active step. */
	step: number;
}

/** Narration text. Supports **bold**, *em*, `code` and [label](concept:id) links. */
export type Text<S> = string | ((s: S) => string);

export interface Step<S> {
	title: string;
	body: Text<S>;
	/** Set the scene up for this step. */
	enter?: (s: S) => void;
	/** An interactive goal. Next stays available, but the step shows as done once `done(s)` holds. */
	task?: { prompt: Text<S>; done: (s: S) => boolean };
	/** Predict-then-reveal question. The scene changes (`reveal`) only after the learner answers. */
	quiz?: {
		question: string;
		options: string[];
		answer: number;
		explain: Text<S>;
		reveal?: (s: S) => void;
	};
}
