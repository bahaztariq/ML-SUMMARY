<script lang="ts">
	import { local } from '#lib/i18n/index.svelte.ts';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import type { SceneProps } from '../types.ts';
	import ScoreStrip from '../_classification/ScoreStrip.svelte';
	import Plot from '../_classification/Plot.svelte';
	import { ink, type Marker, type Pt, type Series } from '../_classification/ink.ts';
	import { penalty, pTrue, pct } from '../_classification/metrics.ts';
	import { N, OVER, TIMID, accOf, bestConf, binsOf, confCurve, lossOf, samplesOf, setConf, setP, type LLState } from './state.ts';

	let { s = $bindable() }: SceneProps<LLState> = $props();

	/** English source strings (typed as plain strings so fr/ar can differ). */
	const EN = {
		cut: 'accuracy cut',
		callsDry: '← calls "dry"',
		callsRain: 'calls "rain" →',
		rained: 'rained ({n})',
		dry: 'dry ({n})',
		x: 'forecast: P(rain)',
		pAxis: 'p = probability given to what happened',
		penaltyCapped: 'penalty −log(p), capped at 6',
		penalty: 'penalty −log(p)',
		mean: 'mean = {v}',
		penaltyAria: 'Penalty minus log p against the probability given to the true outcome',
		relX: 'forecast probability of rain',
		relY: 'how often it rained',
		relAria: 'Reliability diagram: observed frequency of rain against forecast probability',
		confAxis: 'confidence multiplier',
		logLoss: 'log-loss',
		calibrated: 'calibrated',
		confAria: 'Log-loss as forecasts are made more or less confident',
		accuracy: 'accuracy',
		confidence: 'confidence',
		probePenalty: 'probe penalty',
		probe: 'Probe p',
		Confidence: 'Confidence',
		presets: 'Presets',
		timid: 'Timid',
		Calibrated: 'Calibrated',
		over: 'Over-confident'
	};
	const L = local({
		en: EN,
		fr: {
			cut: 'seuil d’exactitude',
			callsDry: '← prévoit « sec »',
			callsRain: 'prévoit « pluie » →',
			rained: 'pluie ({n})',
			dry: 'sec ({n})',
			x: 'prévision : P(pluie)',
			pAxis: 'p = probabilité donnée à ce qui s’est produit',
			penaltyCapped: 'pénalité −log(p), plafonnée à 6',
			penalty: 'pénalité −log(p)',
			mean: 'moyenne = {v}',
			penaltyAria: 'Pénalité moins log p en fonction de la probabilité donnée au vrai résultat',
			relX: 'probabilité de pluie prévue',
			relY: 'fréquence réelle de la pluie',
			relAria: 'Diagramme de fiabilité : fréquence observée de la pluie en fonction de la probabilité prévue',
			confAxis: 'multiplicateur de confiance',
			logLoss: 'log-loss',
			calibrated: 'calibré',
			confAria: 'Log-loss selon que les prévisions sont plus ou moins confiantes',
			accuracy: 'exactitude',
			confidence: 'confiance',
			probePenalty: 'pénalité de la sonde',
			probe: 'Sonde p',
			Confidence: 'Confiance',
			presets: 'Préréglages',
			timid: 'Timide',
			Calibrated: 'Calibré',
			over: 'Trop confiant'
		},
		ar: {
			cut: 'حدّ الدقة',
			callsDry: '← يتوقع «جاف»',
			callsRain: 'يتوقع «مطر» →',
			rained: 'أمطرت ({n})',
			dry: 'جافة ({n})',
			x: 'التوقع: P(مطر)',
			pAxis: 'p = الاحتمال المعطى لما حدث فعلاً',
			penaltyCapped: 'العقوبة −log(p)، بحد أقصى 6',
			penalty: 'العقوبة −log(p)',
			mean: 'المتوسط = {v}',
			penaltyAria: 'العقوبة سالب لوغاريتم p مقابل الاحتمال المعطى للنتيجة الحقيقية',
			relX: 'الاحتمال المتوقع للمطر',
			relY: 'كم مرة أمطرت فعلاً',
			relAria: 'مخطط الموثوقية: التكرار الملاحظ للمطر مقابل الاحتمال المتوقع',
			confAxis: 'مُضاعِف الثقة',
			logLoss: 'log-loss',
			calibrated: 'معايَر',
			confAria: 'الخسارة اللوغاريتمية حين تصبح التوقعات أكثر أو أقل ثقة',
			accuracy: 'الدقة',
			confidence: 'الثقة',
			probePenalty: 'عقوبة المِسبار',
			probe: 'المِسبار p',
			Confidence: 'الثقة',
			presets: 'إعدادات جاهزة',
			timid: 'متردد',
			Calibrated: 'معايَر',
			over: 'مفرط الثقة'
		}
	});

	const Y_MAX = 6;
	const samples = $derived(samplesOf(s));
	const loss = $derived(lossOf(s));

	/* ---- the −log(p) curve, with the probe and (optionally) every day on it ---- */
	const penaltyCurve: Pt[] = Array.from({ length: 300 }, (_, i) => {
		const p = 0.0015 + (i / 299) * (1 - 0.0015);
		return [p, -Math.log(p)];
	});
	const curveSeries = $derived.by(() => {
		const out: Series[] = [{ pts: penaltyCurve, ink: 'text2', width: 2 }];
		if (s.show.penalties) {
			const right: Pt[] = [];
			const wrong: Pt[] = [];
			for (const x of samples) {
				const p = pTrue(x);
				(p >= 0.5 ? right : wrong).push([p, Math.min(Y_MAX, penalty(p))]);
			}
			out.push({ pts: right, ink: 'tp', line: false, dots: true, dotR: 3, opacity: 0.7 });
			out.push({ pts: wrong, ink: 'fn', line: false, dots: true, dotR: 3, opacity: 0.8 });
		}
		return out;
	});
	const probeMarkers = $derived.by(() => {
		const m: Marker[] = [];
		if (s.show.probe) {
			if (s.p2 !== null) m.push({ x: s.p2, y: penalty(s.p2), ink: 2, r: 5.5, label: `p = ${s.p2.toFixed(2)} → ${penalty(s.p2).toFixed(2)}`, side: 'right' });
			m.push({ x: s.p, y: Math.min(Y_MAX, penalty(s.p)), ink: 'accent', r: 6, ring: true, label: `p = ${s.p.toFixed(3)} → ${penalty(s.p).toFixed(2)}` });
		}
		return m;
	});

	/* ---- loss against confidence ---- */
	const lossCurve = confCurve();
	const best = bestConf();
	const lossMax = Math.max(...lossCurve.map((c) => c[1]));

	/* ---- reliability diagram ---- */
	const relPts = $derived<Pt[]>(
		binsOf(s)
			.filter((b) => b.n > 0)
			.map((b) => [b.meanP, b.freq])
	);
</script>

<div class="scene">
	<ScoreStrip
		{samples}
		thr={0.5}
		thrLabel={L('cut')}
		sideLabels={[L('callsDry'), L('callsRain')]}
		posLabel={L('rained', { n: N })}
		negLabel={L('dry', { n: N })}
		xLabel={L('x')}
		radius={s.show.penalties ? (x) => 1.8 + Math.min(Y_MAX, penalty(pTrue(x))) * 1.15 : null}
		color={s.show.penalties ? (x, _, t) => ink(t, pTrue(x) >= 0.5 ? 'tp' : 'fn') : null}
		density={!s.show.penalties}
	/>

	{#if s.show.curve || s.show.confCurve || s.show.reliability}
		<div class="row">
			{#if s.show.curve}
				<div class="panel">
					<Plot
						xLabel={L('pAxis')}
						yLabel={s.show.penalties ? L('penaltyCapped') : L('penalty')}
						yDomain={[0, Y_MAX]}
						yFormat={(v) => v.toFixed(0)}
						series={curveSeries}
						markers={probeMarkers}
						note={s.show.penalties ? L('mean', { v: loss.toFixed(3) }) : ''}
						noteAt="top"
						onpick={s.ui.p ? (x) => setP(s, Math.round(x * 1000) / 1000) : undefined}
						aspect={0.75}
						minHeight={220}
						maxHeight={280}
						ariaLabel={L('penaltyAria')}
					/>
				</div>
			{/if}
			{#if s.show.reliability}
				<div class="panel">
					<Plot
						xLabel={L('relX')}
						yLabel={L('relY')}
						square
						diagonal
						series={[{ pts: relPts, ink: 'accent', width: 2, dots: true, dotR: 4 }]}
						note={`×${s.conf.toFixed(1)}`}
						aspect={0.75}
						minHeight={220}
						maxHeight={280}
						ariaLabel={L('relAria')}
					/>
				</div>
			{/if}
			{#if s.show.confCurve}
				<div class="panel">
					<Plot
						xLabel={L('confAxis')}
						yLabel={L('logLoss')}
						xDomain={[0, 5]}
						yDomain={[0, lossMax * 1.05]}
						xFormat={(v) => `×${v}`}
						yFormat={(v) => v.toFixed(1)}
						series={[{ pts: lossCurve, ink: 'accent', width: 2 }]}
						vlines={[{ at: 1, ink: 'text3', label: L('calibrated') }]}
						markers={[
							{ x: best[0], y: best[1], ink: 'tp', r: 3.5 },
							{ x: s.conf, y: loss, ink: 'accent', r: 6, ring: true, label: `${loss.toFixed(3)}` }
						]}
						onpick={s.ui.conf ? (x) => setConf(s, Math.min(4.9, Math.max(0.2, Math.round(x * 10) / 10))) : undefined}
						aspect={0.75}
						minHeight={220}
						maxHeight={280}
						ariaLabel={L('confAria')}
					/>
				</div>
			{/if}
		</div>
	{/if}

	<Readouts
		items={[
			{ label: L('accuracy'), value: pct(accOf(s), 0) },
			...(s.show.penalties || s.show.confCurve ? [{ label: L('logLoss'), value: loss.toFixed(3), highlight: true }] : []),
			...(s.show.confCurve || s.show.reliability ? [{ label: L('confidence'), value: `×${s.conf.toFixed(1)}` }] : []),
			...(s.show.probe ? [{ label: L('probePenalty'), value: penalty(s.p).toFixed(2) }] : [])
		]}
	/>

	{#if s.ui.p || s.ui.conf}
		<div class="controls">
			{#if s.ui.p}
				<Slider label={L('probe')} bind:value={s.p} min={0.001} max={1} step={0.001} format={(v) => v.toFixed(3)} oninput={(v) => setP(s, v)} />
			{/if}
			{#if s.ui.conf}
				<Slider label={L('Confidence')} bind:value={s.conf} min={0.2} max={4.9} step={0.1} format={(v) => `×${v.toFixed(1)}`} oninput={(v) => setConf(s, v)} />
				<Segmented
					label={L('presets')}
					bind:value={s.conf}
					options={[
						{ value: TIMID, label: L('timid') },
						{ value: 1, label: L('Calibrated') },
						{ value: OVER, label: L('over') }
					]}
					onchange={(v) => setConf(s, v)}
				/>
			{/if}
		</div>
	{/if}
</div>

<style>
	.scene {
		display: grid;
		gap: 12px;
	}
	.row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 12px;
		align-items: start;
	}
	.panel {
		min-width: 0;
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 14px 20px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
	}
</style>
