/**
 * Quiz progress in localStorage: the attempt in progress (so a refresh resumes it), the
 * history of finished attempts, per-question stats and the best score.
 * Every access is guarded: storage can be unavailable (private mode, blocked site data).
 */
import { browser } from '$app/env';
import type { AnswerRecord, Drawn, QuestionStats, Summary } from './engine.ts';

const DATA_KEY = 'ml-hub-quiz';
const CURRENT_KEY = 'ml-hub-quiz-current';
const HISTORY_LIMIT = 50;

export type Mode = 'random' | 'mistakes';

export interface Attempt {
	mode: Mode;
	startedAt: number;
	drawn: Drawn[];
	records: AnswerRecord[];
}

export interface HistoryEntry extends Omit<Summary, 'wrongIds'> {
	date: number;
	mode: Mode;
}

interface QuizData {
	history: HistoryEntry[];
	stats: Record<string, QuestionStats>;
	best: { points: number; correct: number; total: number } | null;
}

const empty = (): QuizData => ({ history: [], stats: {}, best: null });

function read<T>(key: string, fallback: T): T {
	if (!browser) return fallback;
	try {
		const v = localStorage.getItem(key);
		return v ? (JSON.parse(v) as T) : fallback;
	} catch {
		return fallback;
	}
}

function write(key: string, value: unknown) {
	try {
		if (value === null) localStorage.removeItem(key);
		else localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Progress just won't survive a reload.
	}
}

class QuizStore {
	data = $state<QuizData>(empty());
	current = $state<Attempt | null>(null);
	ready = $state(false);

	load() {
		this.data = { ...empty(), ...read<Partial<QuizData>>(DATA_KEY, {}) };
		this.current = read<Attempt | null>(CURRENT_KEY, null);
		this.ready = true;
	}

	/** Question ids whose most recent answer was wrong. */
	get mistakes(): string[] {
		return Object.entries(this.data.stats)
			.filter(([, s]) => s.lastWrong)
			.map(([id]) => id);
	}

	get answeredCount() {
		return Object.values(this.data.stats).reduce((n, s) => n + s.seen, 0);
	}

	get accuracy() {
		const s = Object.values(this.data.stats);
		const seen = s.reduce((n, x) => n + x.seen, 0);
		return seen ? s.reduce((n, x) => n + x.correct, 0) / seen : 0;
	}

	start(drawn: Drawn[], mode: Mode) {
		this.current = { mode, startedAt: Date.now(), drawn, records: [] };
		write(CURRENT_KEY, this.current);
	}

	record(rec: AnswerRecord) {
		if (!this.current) return;
		this.current.records.push(rec);
		const st = (this.data.stats[rec.id] ??= { seen: 0, correct: 0, lastWrong: false });
		st.seen++;
		if (rec.correct) st.correct++;
		st.lastWrong = !rec.correct;
		write(CURRENT_KEY, this.current);
		write(DATA_KEY, this.data);
	}

	/** Store the finished attempt; returns whether it set a new best score. */
	finish(summary: Summary): boolean {
		if (!this.current) return false;
		const { wrongIds: _, ...rest } = summary;
		this.data.history = [{ ...rest, date: Date.now(), mode: this.current.mode }, ...this.data.history].slice(0, HISTORY_LIMIT);
		const isBest = !this.data.best || summary.points > this.data.best.points;
		if (isBest) this.data.best = { points: summary.points, correct: summary.correct, total: summary.total };
		this.current = null;
		write(DATA_KEY, this.data);
		write(CURRENT_KEY, null);
		return isBest;
	}

	abandon() {
		this.current = null;
		write(CURRENT_KEY, null);
	}

	reset() {
		this.data = empty();
		this.current = null;
		write(DATA_KEY, null);
		write(CURRENT_KEY, null);
	}
}

export const quiz = new QuizStore();
