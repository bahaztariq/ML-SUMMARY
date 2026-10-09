/**
 * Named colors for the classification scenes, always resolved from the live theme so light
 * and dark both work. Outcome colors match the matrix cells (see Matrix.svelte).
 */
import type { VizTheme } from '#lib/viz/canvas.ts';
import type { Outcome } from './metrics.ts';

export type Ink = 'accent' | 'text' | 'text2' | 'text3' | 'axis' | 'pos' | 'neg' | Outcome | 0 | 1 | 2 | 3 | 4 | 5;

export function ink(t: VizTheme, c: Ink): string {
	switch (c) {
		case 'accent':
			return t.accent;
		case 'text':
			return t.text;
		case 'text2':
			return t.text2;
		case 'text3':
			return t.text3;
		case 'axis':
			return t.axis;
		case 'pos':
			return t.series[0];
		case 'neg':
			return t.text3;
		case 'tp':
			return t.series[1];
		case 'fp':
			return t.series[2];
		case 'fn':
			return t.series[3];
		case 'tn':
			return t.series[4];
		default:
			return t.series[c % t.series.length];
	}
}

/** CSS variable for an outcome, for HTML elements. */
export const outcomeVar: Record<Outcome, string> = {
	tp: 'var(--viz-2)',
	fp: 'var(--viz-3)',
	fn: 'var(--viz-4)',
	tn: 'var(--viz-5)'
};

/* ---- Plot.svelte inputs ---- */

export type Pt = [number, number];

export interface Series {
	pts: Pt[];
	ink: Ink;
	width?: number;
	dash?: number[];
	/** Fill the area between the line and y = yDomain[0]. */
	fill?: number;
	/** Draw as a step function (horizontal then vertical). */
	step?: boolean;
	/** Draw a dot at every point. */
	dots?: boolean;
	/** Dot radius when `dots` is set. */
	dotR?: number;
	/** Set false to draw only the dots. */
	line?: boolean;
	/** Label drawn at the last point. */
	label?: string;
	opacity?: number;
}

export interface Marker {
	x: number;
	y: number;
	ink: Ink;
	r?: number;
	label?: string;
	/** Label side relative to the marker. */
	side?: 'left' | 'right';
	ring?: boolean;
}

export interface Rule {
	at: number;
	ink: Ink;
	dash?: number[];
	label?: string;
}

export interface Rect {
	x0: number;
	x1: number;
	y0: number;
	y1: number;
	ink: Ink;
	a?: number;
}

