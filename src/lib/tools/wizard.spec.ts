import { describe, expect, it } from 'vitest';
import { conceptById } from '#lib/content.ts';
import { depthBelow, isQuestion, startKey, tree, treeToMermaid, unknownConceptIds, validChoices, walk, type DecisionTree } from './wizard';

const mini: DecisionTree = {
	s: { q: 'Q1?', options: [{ label: 'left', next: 'l' }, { label: 'right', next: 'r' }] },
	l: { q: 'Q2?', options: [{ label: 'deep', next: 'end' }] },
	r: { result: ['x'], note: 'right note' },
	end: { result: ['y', 'z'], note: 'end note' }
};

describe('wizard traversal', () => {
	it('starts at the start node with no crumbs', () => {
		const p = walk([], mini, 's');
		expect(p.key).toBe('s');
		expect(p.crumbs).toEqual([]);
	});

	it('follows options and records crumbs', () => {
		const p = walk([0, 0], mini, 's');
		expect(p.key).toBe('end');
		expect(p.crumbs.map((c) => c.answer)).toEqual(['left', 'deep']);
		expect(p.crumbs[1].key).toBe('l');
		expect(isQuestion(p.node)).toBe(false);
	});

	it('stops at results and drops invalid steps', () => {
		expect(walk([1, 0, 0], mini, 's').key).toBe('r');
		expect(walk([5], mini, 's').key).toBe('s');
		expect(validChoices([1, 0, 0], mini, 's')).toEqual([1]);
		expect(validChoices([0, 9], mini, 's')).toEqual([0]);
	});

	it('measures remaining depth', () => {
		expect(depthBelow('s', mini)).toBe(2);
		expect(depthBelow('r', mini)).toBe(0);
	});

	it('renders the tree as Mermaid with links to the first concept of each result', () => {
		const names: Record<string, string> = { x: 'Ex (X)', y: 'Why', z: 'Zed' };
		const m = treeToMermaid((id) => names[id], mini);
		expect(m.source).toContain('n_s(["Q1?"])');
		expect(m.source).toContain('n_s -->|"left"| n_l');
		expect(m.source).toContain('n_end["Why · Zed"]');
		expect(m.source).toContain('n_r["Ex"]');
		expect(m.links).toEqual({ n_r: 'x', n_end: 'y' });
	});
});

describe('real decision tree', () => {
	it('references only existing concepts', () => {
		expect(unknownConceptIds((id) => conceptById.has(id))).toEqual([]);
	});

	it('every option leads to an existing node and every leaf is reachable', () => {
		const reached = new Set<string>();
		const visit = (k: string) => {
			reached.add(k);
			const n = tree[k];
			expect(n).toBeDefined();
			if (isQuestion(n)) n.options.forEach((o) => visit(o.next));
		};
		visit(startKey);
		expect([...reached].sort()).toEqual(Object.keys(tree).sort());
	});
});
