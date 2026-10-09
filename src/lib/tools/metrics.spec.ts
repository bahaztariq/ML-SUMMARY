import { describe, expect, it } from 'vitest';
import { computeMetrics, formatMetric, metricInfo, metricInfoFor, presets, presetsFor } from './metrics';

describe('computeMetrics', () => {
	it('matches hand-computed values', () => {
		const m = computeMetrics({ tp: 100, fp: 20, fn: 15, tn: 365 });
		expect(m.total).toBe(500);
		expect(m.accuracy).toBeCloseTo(465 / 500);
		expect(m.precision).toBeCloseTo(100 / 120);
		expect(m.recall).toBeCloseTo(100 / 115);
		expect(m.specificity).toBeCloseTo(365 / 385);
		const p = 100 / 120, r = 100 / 115;
		expect(m.f1).toBeCloseTo((2 * p * r) / (p + r));
		expect(m.mcc).toBeCloseTo((100 * 365 - 20 * 15) / Math.sqrt(120 * 115 * 385 * 380));
		expect(m.prevalence).toBeCloseTo(115 / 500);
	});

	it('returns null for undefined metrics instead of 0', () => {
		const m = computeMetrics({ tp: 0, fp: 0, fn: 10, tn: 990 });
		expect(m.accuracy).toBeCloseTo(0.99);
		expect(m.precision).toBeNull();
		expect(m.recall).toBe(0);
		expect(m.f1).toBe(0);
		expect(m.mcc).toBeNull();
		const empty = computeMetrics({ tp: 0, fp: 0, fn: 0, tn: 0 });
		expect(empty.accuracy).toBeNull();
		expect(empty.f1).toBeNull();
	});

	it('gives MCC 1 for perfect and -1 for inverted predictions', () => {
		expect(computeMetrics({ tp: 5, fp: 0, fn: 0, tn: 5 }).mcc).toBeCloseTo(1);
		expect(computeMetrics({ tp: 0, fp: 5, fn: 5, tn: 0 }).mcc).toBeCloseTo(-1);
	});

	it('presets make their focus metric point', () => {
		const med = computeMetrics(presets.find((p) => p.id === 'medical')!.counts);
		expect(med.recall!).toBeGreaterThan(med.precision!);
		const spam = computeMetrics(presets.find((p) => p.id === 'spam')!.counts);
		expect(spam.precision!).toBeGreaterThan(spam.recall!);
	});
});

describe('formatMetric', () => {
	it('formats percentages, signed values and undefined', () => {
		expect(formatMetric(0.1234)).toBe('12.3%');
		expect(formatMetric(-0.5, true)).toBe('-0.50');
		expect(formatMetric(null)).toBe('—');
		expect(formatMetric(0.1234, false, 'fr')).toBe('12,3\u202f%');
		expect(formatMetric(0.1234, false, 'ar')).toBe('12.3%');
	});

	it('has translated texts for every metric and preset', () => {
		for (const lang of ['fr', 'ar'] as const) {
			metricInfoFor(lang).forEach((m, i) => expect(m.question).not.toBe(metricInfo[i].question));
			presetsFor(lang).forEach((p, i) => {
				expect(p.why).not.toBe(presets[i].why);
				expect(p.counts).toEqual(presets[i].counts);
			});
		}
	});
});
