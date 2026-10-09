import { describe, expect, it } from 'vitest';
import { answer, drawQuiz, pointsFor, summarize, validateBank, type AnswerRecord, type Question } from './engine.ts';

const mk = (i: number, group: string, difficulty: 1 | 2 | 3 = 1): Question => ({
	id: `q${i}`,
	concept: `${group}-c${i % 3}`,
	difficulty,
	q: { en: `Q${i}` },
	options: { en: ['a', 'b', 'c', 'd'] },
	answer: i % 4,
	explain: { en: 'x' }
});
const bank = [...Array.from({ length: 60 }, (_, i) => mk(i, 'A')), ...Array.from({ length: 30 }, (_, i) => mk(100 + i, 'B'))];
const groupOf = (c: string) => c.split('-')[0];

describe('drawQuiz', () => {
	it('draws 30 unique questions, deterministic per seed', () => {
		const a = drawQuiz(bank, { seed: 1, groupOf });
		expect(a).toHaveLength(30);
		expect(new Set(a.map((d) => d.id)).size).toBe(30);
		expect(drawQuiz(bank, { seed: 1, groupOf })).toEqual(a);
		expect(drawQuiz(bank, { seed: 2, groupOf })).not.toEqual(a);
	});

	it('spreads questions across groups in proportion to the bank', () => {
		const a = drawQuiz(bank, { seed: 3, groupOf });
		const fromB = a.filter((d) => Number(d.id.slice(1)) >= 100).length;
		expect(fromB).toBe(10); // 30 of 90 are group B → 10 of 30
	});

	it('shuffles option order as a permutation', () => {
		for (const d of drawQuiz(bank, { seed: 4, groupOf })) expect([...d.order].sort()).toEqual([0, 1, 2, 3]);
	});

	it('honours "only" (retry mistakes) and small pools', () => {
		const only = new Set(['q1', 'q2', 'q3']);
		const a = drawQuiz(bank, { seed: 5, groupOf, only });
		expect(a.map((d) => d.id).sort()).toEqual(['q1', 'q2', 'q3']);
	});

	it('prefers unseen and previously wrong questions', () => {
		const stats = Object.fromEntries(bank.slice(0, 80).map((q) => [q.id, { seen: 3, correct: 3, lastWrong: false }]));
		let fresh = 0;
		for (let s = 0; s < 20; s++) fresh += drawQuiz(bank, { seed: s, groupOf, stats }).filter((d) => !stats[d.id]).length;
		// Unweighted, 10 of 90 unseen gives ~11% of draws; weighting should pull in clearly more.
		expect(fresh / (20 * 30)).toBeGreaterThan(0.14);
	});
});

describe('scoring', () => {
	it('gives difficulty points plus a capped streak bonus', () => {
		expect(pointsFor(1, false, 0)).toBe(0);
		expect(pointsFor(2, true, 1)).toBe(20);
		expect(pointsFor(1, true, 3)).toBe(15);
		expect(pointsFor(3, true, 50)).toBe(30 + 25);
	});

	it('tracks streaks and summarizes', () => {
		const qs = [mk(0, 'A', 1), mk(1, 'A', 2), mk(2, 'B', 3), mk(3, 'B', 1)];
		const recs: AnswerRecord[] = [];
		for (const [i, q] of qs.entries()) recs.push(answer(q, i === 2 ? (q.answer + 1) % 4 : q.answer, recs));
		expect(recs.map((r) => r.streak)).toEqual([1, 2, 0, 1]);
		const s = summarize(recs, new Map(qs.map((q) => [q.id, q])), groupOf);
		expect(s.correct).toBe(3);
		expect(s.points).toBe(10 + 20 + 0 + 10);
		expect(s.maxPoints).toBe(10 + 20 + 35 + 20);
		expect(s.byGroup.B).toEqual({ correct: 1, total: 2 });
		expect(s.wrongIds).toEqual(['q2']);
	});
});

describe('validateBank', () => {
	it('flags bad questions', () => {
		const bad = { ...mk(1, 'A'), answer: 7, options: { en: ['a', 'b'], fr: ['a'] } };
		const errs = validateBank([mk(0, 'A'), mk(0, 'A'), bad], new Set(['A-c0', 'A-c1']));
		expect(errs.join('\n')).toMatch(/duplicate/);
		expect(errs.join('\n')).toMatch(/out of range/);
		expect(errs.join('\n')).toMatch(/fr has 1 options/);
	});
});
