import type { Component } from 'svelte';

/**
 * A guided explainer: narration on one side, a live scene on the other.
 *
 * State is plain data owned by the player and made deeply reactive. Each step's
 * `enter` mutates it to set the scene up. Moving to step i replays init() and
 * enter() for steps 0..i, so every step looks the same whichever way you arrive.
 *
 * Quiz reveals are part of that replay: the reveal of every *earlier* quiz is
 * applied whether or not the learner answered it (the current step's reveal only
 * once answered). A later step must therefore reset anything an earlier reveal changed.
 */
export interface ExplainerModule<S extends object = any> {
	/** Short heading shown above the player, e.g. "How K-Means finds clusters". */
	title: string;
	init: () => S;
	steps: Step<S>[];
	Scene: Component<SceneProps<S>>;
	/**
	 * Translations of the narration, step by step (same indices as `steps`). Any field left out
	 * falls back to English; behaviour (`enter`, `done`, `reveal`) is never translated.
	 */
	i18n?: Partial<Record<'fr' | 'ar', LessonText<S>>>;
}

export interface StepText<S> {
	title?: string;
	body?: Text<S>;
	task?: { prompt?: Text<S> };
	quiz?: { question?: string; options?: string[]; explain?: Text<S> };
}

export interface LessonText<S> {
	title?: string;
	steps?: (StepText<S> | undefined)[];
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
	/**
	 * Predict-then-reveal question. On this step the scene changes (`reveal`) once the learner answers;
	 * on every later step the reveal is always replayed (see the note at the top).
	 */
	quiz?: {
		question: string;
		options: string[];
		answer: number;
		explain: Text<S>;
		reveal?: (s: S) => void;
	};
}

/** Merge a step's translation over the English step, keeping all behaviour. */
export function localizeStep<S>(step: Step<S>, tr: StepText<S> | undefined): Step<S> {
	if (!tr) return step;
	return {
		...step,
		title: tr.title ?? step.title,
		body: tr.body ?? step.body,
		task: step.task ? { ...step.task, prompt: tr.task?.prompt ?? step.task.prompt } : undefined,
		quiz: step.quiz
			? {
					...step.quiz,
					question: tr.quiz?.question ?? step.quiz.question,
					options: tr.quiz?.options?.length === step.quiz.options.length ? tr.quiz.options : step.quiz.options,
					explain: tr.quiz?.explain ?? step.quiz.explain
				}
			: undefined
	};
}
