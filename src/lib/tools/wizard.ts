/**
 * "Which model?" wizard: typed access to content/decision-tree.js plus pure traversal helpers.
 * A wizard position is the list of option indexes chosen so far, starting at the tree's start node.
 */
import { decisionTree as rawTree, decisionTreeStart } from '#content/decision-tree.js';

export interface QuestionNode {
	q: string;
	options: { label: string; next: string }[];
}
export interface ResultNode {
	result: string[];
	note: string;
}
export type DecisionNode = QuestionNode | ResultNode;
export type DecisionTree = Record<string, DecisionNode>;

export const tree = rawTree as DecisionTree;
export const startKey: string = decisionTreeStart;

export const isQuestion = (n: DecisionNode): n is QuestionNode => 'q' in n;

export interface Crumb {
	/** Question node the answer was given at. */
	key: string;
	question: string;
	answer: string;
}

export interface Position {
	key: string;
	node: DecisionNode;
	crumbs: Crumb[];
}

/**
 * Follow `choices` (option indexes) from the start node. Invalid indexes are dropped,
 * and walking stops at the first result node.
 */
export function walk(choices: number[], t: DecisionTree = tree, start = startKey): Position {
	let key = start;
	const crumbs: Crumb[] = [];
	for (const i of choices) {
		const node = t[key];
		if (!isQuestion(node)) break;
		const opt = node.options[i];
		if (!opt || !t[opt.next]) break;
		crumbs.push({ key, question: node.q, answer: opt.label });
		key = opt.next;
	}
	return { key, node: t[key], crumbs };
}

/** Normalize choices to only the steps that `walk` actually takes. */
export function validChoices(choices: number[], t: DecisionTree = tree, start = startKey): number[] {
	return choices.slice(0, walk(choices, t, start).crumbs.length);
}

/** Total number of questions on the longest route below `key` (for a progress hint). */
export function depthBelow(key: string, t: DecisionTree = tree): number {
	const node = t[key];
	if (!node || !isQuestion(node)) return 0;
	return 1 + Math.max(...node.options.map((o) => depthBelow(o.next, t)));
}

/** Concept ids referenced by result nodes that are not in `has`. */
export function unknownConceptIds(has: (id: string) => boolean, t: DecisionTree = tree): string[] {
	const out = new Set<string>();
	for (const node of Object.values(t)) if (!isQuestion(node)) for (const id of node.result) if (!has(id)) out.add(id);
	return [...out];
}

const label = (text: string) => String(text).replace(/"/g, '#quot;').replace(/</g, '‹').replace(/>/g, '›');

/**
 * The whole tree as a Mermaid flowchart. Result nodes list their concepts by name and link to the first.
 * Node ids are prefixed so they never clash with Mermaid keywords (e.g. "end").
 */
export function treeToMermaid(nameOf: (id: string) => string | undefined, t: DecisionTree = tree) {
	const lines = ['flowchart LR'];
	const links: Record<string, string> = {};
	const nid = (key: string) => 'n_' + key.replace(/[^a-zA-Z0-9]/g, '_');
	for (const [key, node] of Object.entries(t)) {
		if (isQuestion(node)) {
			lines.push(`  ${nid(key)}(["${label(node.q)}"])`);
			for (const o of node.options) lines.push(`  ${nid(key)} -->|"${label(o.label)}"| ${nid(o.next)}`);
		} else {
			const ids = node.result.filter((id) => nameOf(id));
			const names = ids.map((id) => nameOf(id)!.replace(/\s*\(.*\)$/, ''));
			lines.push(`  ${nid(key)}["${label(names.join(' · '))}"]`);
			if (ids[0]) links[nid(key)] = ids[0];
		}
	}
	return { source: lines.join('\n'), links, nodeId: nid };
}
