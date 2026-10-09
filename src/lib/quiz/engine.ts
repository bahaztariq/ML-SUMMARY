/**
 * Quiz engine: drawing a balanced random quiz, shuffling options, and scoring.
 * Pure functions over plain data so they are easy to test and to persist.
 */
import { mulberry32 } from '#lib/viz/canvas.ts';

export interface Text {
	en: string;
	fr?: string;
	ar?: string;
}

export interface Question {
	id: string;
	concept: string;
	difficulty: 1 | 2 | 3;
	q: Text;
	options: { en: string[]; fr?: string[]; ar?: string[] };
	answer: number;
	explain: Text;
}

/** One drawn question: which bank question, and the order its options are shown in. */
export interface Drawn {
	id: string;
	/** order[k] = index in question.options of the option shown at position k. */
	order: number[];
}

export interface QuestionStats {
	seen: number;
	correct: number;
	/** Was the most recent answer wrong? Drives "retry mistakes". */
	lastWrong: boolean;
}

export const QUIZ_LENGTH = 30;
export const POINTS = { 1: 10, 2: 20, 3: 30 } as const;
/** Bonus per correct answer once the streak reaches 3, capped. */
export const STREAK_BONUS = 5;
export const STREAK_BONUS_CAP = 25;

function shuffle<T>(arr: T[], rand: () => number): T[] {
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

/** Weighted sample without replacement (Efraimidis–Spirakis). */
function weightedSample<T>(items: T[], weight: (t: T) => number, n: number, rand: () => number): T[] {
	return items
		.map((t) => ({ t, key: Math.pow(rand(), 1 / Math.max(weight(t), 1e-6)) }))
		.sort((a, b) => b.key - a.key)
		.slice(0, n)
		.map((x) => x.t);
}

export interface DrawOptions {
	n?: number;
	seed: number;
	/** Maps a concept id to its group (track); questions are spread across groups. */
	groupOf: (conceptId: string) => string;
	stats?: Record<string, QuestionStats>;
	/** Only these question ids (e.g. retry mistakes). */
	only?: Set<string>;
	/** Only questions whose group is in this set. */
	groups?: Set<string>;
}

/**
 * Draw a quiz: spread across groups in proportion to their share of the bank, preferring
 * questions the learner hasn't seen or got wrong last time; options shuffled per question.
 */
export function drawQuiz(bank: Question[], opts: DrawOptions): Drawn[] {
	const rand = mulberry32(opts.seed);
	const n = opts.n ?? QUIZ_LENGTH;
	const pool = bank.filter(
		(q) => (!opts.only || opts.only.has(q.id)) && (!opts.groups || opts.groups.has(opts.groupOf(q.concept)))
	);
	const weight = (q: Question) => {
		const st = opts.stats?.[q.id];
		if (!st) return 3; // unseen
		return st.lastWrong ? 4 : 1;
	};

	// Proportional allocation per group (largest remainder), then weighted sampling inside each.
	const byGroup = new Map<string, Question[]>();
	for (const q of pool) {
		const g = opts.groupOf(q.concept);
		if (!byGroup.has(g)) byGroup.set(g, []);
		byGroup.get(g)!.push(q);
	}
	const total = Math.min(n, pool.length);
	const groups = [...byGroup.entries()];
	const quotas = groups.map(([, qs]) => (qs.length / pool.length) * total);
	const alloc = quotas.map(Math.floor);
	let left = total - alloc.reduce((a, b) => a + b, 0);
	quotas
		.map((q, i) => ({ i, r: q - Math.floor(q) }))
		.sort((a, b) => b.r - a.r)
		.forEach(({ i }) => {
			if (left > 0 && alloc[i] < groups[i][1].length) {
				alloc[i]++;
				left--;
			}
		});

	const picked = groups.flatMap(([, qs], i) => weightedSample(qs, weight, alloc[i], rand));
	return shuffle(picked, rand).map((q) => ({ id: q.id, order: shuffle([...q.options.en.keys()], rand) }));
}

export interface AnswerRecord {
	id: string;
	/** Option index in the original question (not display position); -1 = skipped. */
	chosen: number;
	correct: boolean;
	points: number;
	streak: number;
}

/** Points for one answer given the streak *including* this answer. */
export function pointsFor(difficulty: 1 | 2 | 3, correct: boolean, streak: number): number {
	if (!correct) return 0;
	const bonus = streak >= 3 ? Math.min(STREAK_BONUS * (streak - 2), STREAK_BONUS_CAP) : 0;
	return POINTS[difficulty] + bonus;
}

/** Score one answer, continuing from the previous records. */
export function answer(q: Question, chosen: number, previous: AnswerRecord[]): AnswerRecord {
	const correct = chosen === q.answer;
	const prevStreak = previous.at(-1)?.streak ?? 0;
	const streak = correct ? prevStreak + 1 : 0;
	return { id: q.id, chosen, correct, streak, points: pointsFor(q.difficulty, correct, streak) };
}

export interface Summary {
	correct: number;
	total: number;
	points: number;
	maxPoints: number;
	bestStreak: number;
	byGroup: Record<string, { correct: number; total: number }>;
	wrongIds: string[];
}

export function summarize(records: AnswerRecord[], bankById: Map<string, Question>, groupOf: (c: string) => string): Summary {
	const byGroup: Summary['byGroup'] = {};
	let maxPoints = 0;
	for (const r of records) {
		const q = bankById.get(r.id);
		if (!q) continue;
		const g = groupOf(q.concept);
		byGroup[g] ??= { correct: 0, total: 0 };
		byGroup[g].total++;
		if (r.correct) byGroup[g].correct++;
	}
	// Best possible score: every answer right, so the streak grows by one each question.
	records.forEach((r, i) => {
		const q = bankById.get(r.id);
		if (q) maxPoints += pointsFor(q.difficulty, true, i + 1);
	});
	return {
		correct: records.filter((r) => r.correct).length,
		total: records.length,
		points: records.reduce((a, r) => a + r.points, 0),
		maxPoints,
		bestStreak: records.reduce((m, r) => Math.max(m, r.streak), 0),
		byGroup,
		wrongIds: records.filter((r) => !r.correct).map((r) => r.id)
	};
}

/** Validate a bank: unique ids, answer in range, every language has the same number of options. */
export function validateBank(bank: Question[], conceptIds: Set<string>): string[] {
	const errors: string[] = [];
	const seen = new Set<string>();
	for (const q of bank) {
		if (seen.has(q.id)) errors.push(`duplicate question id "${q.id}"`);
		seen.add(q.id);
		if (!conceptIds.has(q.concept)) errors.push(`[${q.id}] unknown concept "${q.concept}"`);
		if (![1, 2, 3].includes(q.difficulty)) errors.push(`[${q.id}] bad difficulty`);
		const n = q.options.en.length;
		if (n < 2 || n > 4) errors.push(`[${q.id}] needs 2–4 options`);
		if (q.answer < 0 || q.answer >= n) errors.push(`[${q.id}] answer out of range`);
		for (const lang of ['fr', 'ar'] as const) {
			const o = q.options[lang];
			if (o && o.length !== n) errors.push(`[${q.id}] ${lang} has ${o.length} options, en has ${n}`);
		}
		if (!q.q.en || !q.explain.en) errors.push(`[${q.id}] missing English question or explanation`);
	}
	return errors;
}
