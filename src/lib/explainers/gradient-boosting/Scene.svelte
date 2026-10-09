<script lang="ts">
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, dot, label, mapper, squareMapper, ticks, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types.ts';
	import { classColor, grid, lineChart, marker, pill } from '../_ensembles/draw.ts';
	import { f2, f3, pct } from '../_ensembles/memo.ts';
	import { arCount, arTrees } from '../_ensembles/i18n.ts';
	import { i18n, local } from '#lib/i18n/index.svelte.ts';
	import * as gb from './gb.ts';
	import {
		ADA_ROUNDS,
		GRID_X,
		MAX_STAGES,
		adaAccuracy,
		adaData,
		adaRounds,
		adaStep,
		addTrees,
		bestStage,
		curve,
		nextTree,
		residuals,
		setStage,
		train,
		trainLoss,
		valid,
		validLoss,
		type GBState
	} from './state.ts';

	let { s = $bindable(), step }: SceneProps<GBState> = $props();

	const en = {
		fMean: 'F₀ = mean',
		fAfter: 'F after {trees}',
		resTitle: 'residuals y − F  (after {trees})',
		nextTree: 'next tree {h}',
		lossTitle: 'mean squared error vs number of trees',
		train: 'train',
		valid: 'valid',
		best: 'best {n}',
		equalWeights: 'equal weights',
		stumpsVoting: '{stumps} voting',
		round: 'round',
		stumpErr: 'stump error ε',
		say: 'its say α',
		accuracy: 'accuracy',
		trees: 'trees',
		trainMse: 'train MSE',
		validMse: 'valid MSE',
		ariaMain: 'Training points and the boosted model\'s prediction curve',
		ariaRes: 'Residuals of the current model and the next tree fitted to them',
		ariaAda: 'AdaBoost: points sized by weight, decision stumps and the combined vote',
		ariaLoss: 'Training and validation error as trees are added',
		trainPoint: 'training point',
		ensemble: 'ensemble F(x)',
		residual: 'residual (above / below)',
		validPoint: 'validation point',
		classA: 'class A',
		classB: 'class B',
		noteAda: 'marker size = weight for the next stump · outlined = currently misclassified',
		add1: '+ 1 tree',
		add10: '+ 10 trees',
		reset: 'Reset',
		stages: 'trees (stages)',
		validData: 'Validation data',
		hidden: 'hidden',
		shown: 'shown',
		earlyStop: 'Early stop (best valid)',
		nextRound: 'Next round',
		add5: '+ 5 rounds',
		nTrees: '{n} trees',
		oneTree: '1 tree',
		nStumps: '{n} stumps',
		oneStump: '1 stump'
	};
	const L = local({
		en,
		fr: {
			fMean: 'F₀ = moyenne',
			fAfter: 'F après {trees}',
			resTitle: 'résidus y − F  (après {trees})',
			nextTree: 'arbre suivant {h}',
			lossTitle: 'erreur quadratique moyenne selon le nombre d’arbres',
			train: 'entr.',
			valid: 'valid.',
			best: 'meilleur {n}',
			equalWeights: 'poids égaux',
			stumpsVoting: '{stumps} votent',
			round: 'tour',
			stumpErr: 'erreur de la souche ε',
			say: 'son poids α',
			accuracy: 'exactitude',
			trees: 'arbres',
			trainMse: 'MSE entr.',
			validMse: 'MSE valid.',
			ariaMain: 'Points d’entraînement et courbe de prédiction du modèle boosté',
			ariaRes: 'Résidus du modèle actuel et arbre suivant ajusté sur eux',
			ariaAda: 'AdaBoost : points dimensionnés selon leur poids, souches de décision et vote combiné',
			ariaLoss: 'Erreur d’entraînement et de validation à mesure qu’on ajoute des arbres',
			trainPoint: 'point d’entraînement',
			ensemble: 'ensemble F(x)',
			residual: 'résidu (au-dessus / en dessous)',
			validPoint: 'point de validation',
			classA: 'classe A',
			classB: 'classe B',
			noteAda: 'taille du marqueur = poids pour la souche suivante · contour = actuellement mal classé',
			add1: '+ 1 arbre',
			add10: '+ 10 arbres',
			reset: 'Réinitialiser',
			stages: 'arbres (étapes)',
			validData: 'Données de validation',
			hidden: 'masquées',
			shown: 'affichées',
			earlyStop: 'Arrêt précoce (meilleure valid.)',
			nextRound: 'Tour suivant',
			add5: '+ 5 tours',
			nTrees: '{n} arbres',
			oneTree: '1 arbre',
			nStumps: '{n} souches',
			oneStump: '1 souche'
		},
		ar: {
			fMean: 'F₀ = المتوسط',
			fAfter: 'F بعد {trees}',
			resTitle: 'البواقي y − F  (بعد {trees})',
			nextTree: 'الشجرة التالية {h}',
			lossTitle: 'متوسط مربع الخطأ مقابل عدد الأشجار',
			train: 'تدريب',
			valid: 'تحقق',
			best: 'الأفضل {n}',
			equalWeights: 'أوزان متساوية',
			stumpsVoting: '{stumps} تصوّت',
			round: 'الجولة',
			stumpErr: 'خطأ الجذع ε',
			say: 'وزنه α',
			accuracy: 'الدقة',
			trees: 'الأشجار',
			trainMse: 'MSE التدريب',
			validMse: 'MSE التحقق',
			ariaMain: 'نقاط التدريب ومنحنى تنبؤ النموذج المعزَّز',
			ariaRes: 'بواقي النموذج الحالي والشجرة التالية المطابَقة عليها',
			ariaAda: 'AdaBoost: نقاط بحجم أوزانها، وجذوع القرار، والتصويت المجمّع',
			ariaLoss: 'خطأ التدريب والتحقق مع إضافة الأشجار',
			trainPoint: 'نقطة تدريب',
			ensemble: 'المجموعة F(x)',
			residual: 'الباقي (فوق / تحت)',
			validPoint: 'نقطة تحقق',
			classA: 'الفئة A',
			classB: 'الفئة B',
			noteAda: 'حجم العلامة = الوزن للجذع التالي · المحاطة بخط = مصنّفة خطأ حاليًا',
			add1: '+ شجرة',
			add10: '+ 10 أشجار',
			reset: 'إعادة تعيين',
			stages: 'الأشجار (المراحل)',
			validData: 'بيانات التحقق',
			hidden: 'مخفية',
			shown: 'ظاهرة',
			earlyStop: 'إيقاف مبكر (أفضل تحقق)',
			nextRound: 'الجولة التالية',
			add5: '+ 5 جولات',
			nTrees: '{n} شجرة',
			oneTree: 'شجرة واحدة',
			nStumps: '{n} جذوع',
			oneStump: 'جذع واحد'
		}
	});
	const treesText = (n: number) => (i18n.current === 'ar' ? arTrees(n) : n === 1 ? L('oneTree') : L('nTrees', { n }));
	const stumpsText = (n: number) =>
		i18n.current === 'ar' ? arCount(n, 'جذع واحد', 'جذعان', 'جذوع', 'جذعًا') : n === 1 ? L('oneStump') : L('nStumps', { n });

	const d = train();
	const allY = [...d.y, ...valid().y];
	const Y_RANGE: [number, number] = [Math.floor(Math.min(...allY) - 0.3), Math.ceil(Math.max(...allY) + 0.3)];
	const r0 = d.y.map((y) => y - d.y.reduce((a, b) => a + b, 0) / d.y.length);
	const R_MAX = Math.ceil(Math.max(...r0.map(Math.abs)) * 2 + 0.2) / 2;

	const fit = $derived(curve(s, s.stage));
	const res = $derived(residuals(s, s.stage));
	const tree = $derived(s.show.next ? nextTree(s, s.stage) : null);

	function box(w: number, h: number, top = 14, bottom = 22) {
		return { x: 34, y: top, w: w - 46, h: h - top - bottom };
	}
	function xAxis(ctx: CanvasRenderingContext2D, t: VizTheme, m: ReturnType<typeof mapper>, y: number) {
		for (const v of [0, 2, 4, 6, 8, 10]) label(ctx, t, String(v), m.x(v), y, { align: 'center', color: t.text3, size: 10 });
	}

	/* ---- main plot: data, ensemble curve, residual sticks ---- */
	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const b = box(w, h);
		const m = mapper(b, [gb.X_MIN, gb.X_MAX], Y_RANGE);
		ctx.lineWidth = 1;
		for (const v of ticks(Y_RANGE[0], Y_RANGE[1], 5)) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(b.x, m.y(v));
			ctx.lineTo(b.x + b.w, m.y(v));
			ctx.stroke();
			label(ctx, t, String(v), b.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		xAxis(ctx, t, m, b.y + b.h + 12);
		label(ctx, t, 'x →', b.x + b.w, 2, { align: 'right', color: t.text3, size: 10, base: 'top' });
		label(ctx, t, 'y', 8, 8, { color: t.text3, size: 10, base: 'top' });

		if (s.show.valid) {
			const v = valid();
			v.x.forEach((x, i) => dot(ctx, m.x(x), m.y(v.y[i]), 1.8, alpha(t.text3, 0.45)));
		}
		if (s.show.residuals) {
			ctx.lineWidth = 1.25;
			d.x.forEach((x, i) => {
				const yhat = d.y[i] - res[i];
				ctx.strokeStyle = alpha(res[i] > 0 ? t.series[1] : t.series[3], 0.75);
				ctx.beginPath();
				ctx.moveTo(m.x(x), m.y(d.y[i]));
				ctx.lineTo(m.x(x), m.y(yhat));
				ctx.stroke();
			});
		}
		// ensemble curve
		ctx.strokeStyle = t.series[0];
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		GRID_X.forEach((x, i) => (i ? ctx.lineTo(m.x(x), m.y(fit[i])) : ctx.moveTo(m.x(x), m.y(fit[i]))));
		ctx.stroke();
		d.x.forEach((x, i) => dot(ctx, m.x(x), m.y(d.y[i]), 4, t.text, t.bg, 1.5));
		const text = s.stage === 0 ? L('fMean') : L('fAfter', { trees: treesText(s.stage) });
		pill(ctx, t, text, b.x + 8, b.y + 12, t.series[0]);
	}

	/* ---- residual panel with the next tree ---- */
	function drawRes(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const b = box(w, h, 22, 20);
		const m = mapper(b, [gb.X_MIN, gb.X_MAX], [-R_MAX, R_MAX]);
		label(ctx, t, L('resTitle', { trees: treesText(s.stage) }), 6, 4, { color: t.text3, size: 10, base: 'top' });
		ctx.strokeStyle = t.axis;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(b.x, m.y(0));
		ctx.lineTo(b.x + b.w, m.y(0));
		ctx.stroke();
		label(ctx, t, '0', b.x - 6, m.y(0), { align: 'right', color: t.text3, size: 10 });
		label(ctx, t, `+${R_MAX}`, b.x - 6, m.y(R_MAX) + 4, { align: 'right', color: t.text3, size: 10 });
		label(ctx, t, `−${R_MAX}`, b.x - 6, m.y(-R_MAX) - 4, { align: 'right', color: t.text3, size: 10 });
		xAxis(ctx, t, m, b.y + b.h + 11);
		d.x.forEach((x, i) => {
			const r = clamp(res[i], -R_MAX, R_MAX);
			ctx.strokeStyle = alpha(r > 0 ? t.series[1] : t.series[3], 0.5);
			ctx.beginPath();
			ctx.moveTo(m.x(x), m.y(0));
			ctx.lineTo(m.x(x), m.y(r));
			ctx.stroke();
			dot(ctx, m.x(x), m.y(r), 3.2, r > 0 ? t.series[1] : t.series[3], t.bg, 1);
		});
		if (tree) {
			const parts = gb.pieces(tree);
			ctx.strokeStyle = t.series[2];
			ctx.lineWidth = 2.5;
			ctx.beginPath();
			parts.forEach((p, i) => {
				const y = m.y(clamp(p.w, -R_MAX, R_MAX));
				if (i) ctx.lineTo(m.x(p.x0), y);
				else ctx.moveTo(m.x(p.x0), y);
				ctx.lineTo(m.x(p.x1), y);
			});
			ctx.stroke();
			if (s.show.leafValues)
				for (const p of parts) {
					const cx = m.x((p.x0 + p.x1) / 2);
					const y = m.y(clamp(p.w, -R_MAX, R_MAX));
					label(ctx, t, f2(p.w), cx, y + (p.w >= 0 ? -9 : 10), { align: 'center', color: t.series[2], size: 10, weight: 700 });
				}
			label(ctx, t, L('nextTree', { h: `h${sub(s.stage + 1)}(x)` }), w - 8, 4, { align: 'right', color: t.series[2], size: 10, base: 'top', weight: 700 });
		}
	}
	const SUBS = '₀₁₂₃₄₅₆₇₈₉';
	const sub = (n: number) => String(n).replace(/\d/g, (c) => SUBS[+c]);

	/* ---- loss vs stages ---- */
	let lossMap: ReturnType<typeof lineChart> | null = null;
	function drawLoss(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const tl = trainLoss(s);
		const vl = validLoss(s);
		const ref = s.lrRef ? trainLoss({ lr: s.lrRef, depth: s.depth }) : null;
		const best = bestStage(s);
		// with validation shown, zoom in so the U-shape of the validation curve is visible
		const top = s.show.valid ? Math.ceil(vl[best] * 2.6 * 5) / 5 : Math.ceil(Math.max(tl[0], ref ? ref[0] : 0) * 5) / 5;
		const pts = (a: number[]) => a.map((v, i) => [i, v] as [number, number]);
		lossMap = lineChart(ctx, w, h, t, {
			title: L('lossTitle'),
			x: [0, MAX_STAGES],
			y: [0, top],
			lines: [
				...(ref ? [{ pts: pts(ref), color: t.text3, width: 1.5, dash: [4, 4], label: `η ${s.lrRef}` }] : []),
				{ pts: pts(tl), color: t.text2, label: L('train') },
				...(s.show.valid ? [{ pts: pts(vl), color: t.series[4], label: L('valid') }] : [])
			],
			marker: s.stage,
			markerLabel: `${s.stage}`,
			points: s.show.valid ? [[best, vl[best], t.series[4], L('best', { n: best })]] : [],
			right: 52
		});
	}
	let lossDrag = false;
	function lossPick(p: { x: number }) {
		if (!lossMap || !s.ui.stage) return;
		setStage(s, clamp(lossMap.invX(p.x), 0, MAX_STAGES));
	}

	/* ---- AdaBoost view ---- */
	const ADA_DOMAIN: [number, number] = [-1.05, 1.05];
	function drawAda(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const m = squareMapper({ x: 8, y: 8, w: w - 16, h: h - 16 }, ADA_DOMAIN);
		const data = adaData();
		const rounds = adaRounds();
		const M = s.round;
		grid(ctx, t, m, w, h);
		if (M > 0) {
			// regions of the weighted vote
			const nx = 90;
			const ny = 64;
			const x0 = m.invX(0);
			const x1 = m.invX(w);
			const y0 = m.invY(h);
			const y1 = m.invY(0);
			for (let iy = 0; iy < ny; iy++)
				for (let ix = 0; ix < nx; ix++) {
					const px = x0 + ((ix + 0.5) / nx) * (x1 - x0);
					const py = y0 + ((iy + 0.5) / ny) * (y1 - y0);
					const score = gb.adaScore(rounds, [px, py], M);
					const a = Math.round((ix / nx) * w);
					const b2 = Math.round(((ix + 1) / nx) * w);
					const c = Math.round(h - ((iy + 1) / ny) * h);
					const e = Math.round(h - (iy / ny) * h);
					ctx.fillStyle = alpha(classColor(t, score > 0 ? 1 : 0), 0.06 + 0.16 * Math.min(1, Math.abs(score)));
					ctx.fillRect(a, c, b2 - a, e - c);
				}
			// earlier stumps faint, current one bold
			for (let k = 0; k < M; k++) {
				const st = rounds[k].stump;
				const cur = k === M - 1;
				ctx.strokeStyle = cur ? t.text : alpha(t.text, 0.18);
				ctx.lineWidth = cur ? 2 : 1;
				ctx.setLineDash(cur ? [] : [3, 3]);
				ctx.beginPath();
				if (st.f === 0) {
					ctx.moveTo(m.x(st.thr), 0);
					ctx.lineTo(m.x(st.thr), h);
				} else {
					ctx.moveTo(0, m.y(st.thr));
					ctx.lineTo(w, m.y(st.thr));
				}
				ctx.stroke();
				ctx.setLineDash([]);
			}
		}
		// weights the *next* stump will train on
		const wts = M < ADA_ROUNDS ? rounds[M].weights : rounds[M - 1].weights;
		const n = data.y.length;
		data.X.forEach((p, i) => {
			const c = data.y[i];
			const r = clamp(2.2 + 3.2 * Math.sqrt(wts[i] * n), 2.2, 13);
			const wrong = M > 0 && (gb.adaScore(rounds, p, M) > 0 ? 1 : 0) !== c;
			marker(ctx, m.x(p[0]), m.y(p[1]), c, r, alpha(classColor(t, c), 0.85), wrong ? t.text : t.bg, wrong ? 2 : 1);
		});
		pill(ctx, t, M === 0 ? L('equalWeights') : L('stumpsVoting', { stumps: stumpsText(M) }), 12, h - 22);
		label(ctx, t, 'x₁ →', w - 10, h - 8, { align: 'right', color: t.text3, size: 10, base: 'bottom' });
		label(ctx, t, '↑ x₂', 6, 8, { color: t.text3, size: 10, base: 'top' });
	}

	const readouts = $derived.by(() => {
		if (s.view === 'ada') {
			const r = adaRounds();
			const cur = s.round > 0 ? r[s.round - 1] : null;
			return [
				{ label: L('round'), value: `${s.round}` },
				{ label: L('stumpErr'), value: cur ? f3(cur.err) : '—' },
				{ label: L('say'), value: cur ? f2(cur.alpha) : '—' },
				{ label: L('accuracy'), value: s.round ? pct(adaAccuracy(s.round)) : '—', highlight: s.round > 0 && adaAccuracy(s.round) === 1 }
			];
		}
		const items: { label: string; value: string; highlight?: boolean }[] = [
			{ label: L('trees'), value: String(s.stage) },
			{ label: L('trainMse'), value: f3(trainLoss(s)[s.stage]) }
		];
		if (s.show.valid) items.push({ label: L('validMse'), value: f3(validLoss(s)[s.stage]), highlight: s.stage === bestStage(s) });
		items.push({ label: 'η', value: String(s.lr) }, { label: 'max_depth', value: String(s.depth) });
		return items;
	});
	const anyUi = $derived(Object.values(s.ui).some(Boolean));
</script>

<div class="scene">
	{#if s.view === 'boost'}
		<Canvas {draw} aspect={0.5} minHeight={230} maxHeight={330} label={L('ariaMain')} />
		<div class="legend">
			<span class="key"><i class="dot pt"></i>{L('trainPoint')}</span>
			<span class="key"><i class="line"></i>{L('ensemble')}</span>
			{#if s.show.residuals}<span class="key"><i class="bar pos"></i><i class="bar neg"></i>{L('residual')}</span>{/if}
			{#if s.show.valid}<span class="key"><i class="dot val"></i>{L('validPoint')}</span>{/if}
		</div>
		{#if s.show.resPanel}
			<div class="chart">
				<Canvas draw={drawRes} aspect={0.3} minHeight={140} maxHeight={180} label={L('ariaRes')} />
			</div>
		{/if}
	{:else}
		<Canvas draw={drawAda} aspect={0.72} minHeight={260} maxHeight={420} label={L('ariaAda')} />
		<div class="legend">
			<span class="key"><i class="dot a"></i>{L('classA')}</span>
			<span class="key"><i class="sq b"></i>{L('classB')}</span>
			<span class="key note">{L('noteAda')}</span>
		</div>
	{/if}

	<Readouts items={readouts} />

	{#if s.show.loss && s.view === 'boost'}
		<div class="chart">
			<Canvas
				draw={drawLoss}
				aspect={0.3}
				minHeight={150}
				maxHeight={180}
				label={L('ariaLoss')}
				cursor={s.ui.stage ? 'ew-resize' : 'default'}
				onpointerdown={(p) => {
					lossDrag = true;
					lossPick(p);
				}}
				onpointermove={(p) => lossDrag && lossPick(p)}
				onpointerup={() => (lossDrag = false)}
			/>
		</div>
	{/if}

	{#if anyUi}
		<div class="controls">
			{#if s.ui.add}
				<div class="buttons">
					<button class="btn btn-sm btn-primary" onclick={() => addTrees(s, 1)} disabled={s.stage >= MAX_STAGES}>{L('add1')}</button>
					<button class="btn btn-sm" onclick={() => addTrees(s, 10)} disabled={s.stage >= MAX_STAGES}>{L('add10')}</button>
					<button class="btn btn-sm btn-ghost" onclick={() => setStage(s, 0)} disabled={s.stage === 0}>{L('reset')}</button>
				</div>
			{/if}
			{#if s.ui.stage}
				<Slider label={L('stages')} bind:value={s.stage} min={0} max={MAX_STAGES} />
			{/if}
			{#if s.ui.lr}
				<Slider label="learning_rate η" bind:value={s.lr} min={0.01} max={1} step={0.01} />
			{/if}
			{#if s.ui.depth}
				<Slider label="max_depth" bind:value={s.depth} min={1} max={5} />
			{/if}
			{#if s.ui.valid}
				<Segmented
					label={L('validData')}
					value={s.show.valid ? 'on' : 'off'}
					onchange={(v) => (s.show.valid = v === 'on')}
					options={[
						{ value: 'off', label: L('hidden') },
						{ value: 'on', label: L('shown') }
					]}
				/>
			{/if}
			{#if s.ui.stop}
				<div class="buttons">
					<button class="btn btn-sm" onclick={() => setStage(s, bestStage(s))}>{L('earlyStop')}</button>
				</div>
			{/if}
			{#if s.ui.ada}
				<div class="buttons">
					<button class="btn btn-sm btn-primary" onclick={() => adaStep(s, 1)} disabled={s.round >= ADA_ROUNDS}>{L('nextRound')} <span class="flip-rtl" aria-hidden="true">→</span></button>
					<button class="btn btn-sm" onclick={() => adaStep(s, 5)} disabled={s.round >= ADA_ROUNDS}>{L('add5')}</button>
					<button class="btn btn-sm btn-ghost" onclick={() => (s.round = 0)} disabled={s.round === 0}>{L('reset')}</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.scene {
		display: grid;
		gap: 12px;
		min-width: 0;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 14px;
		font-size: 0.75rem;
		color: var(--text-3);
		margin-top: -4px;
	}
	.key {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}
	.key i {
		display: inline-block;
		width: 9px;
		height: 9px;
	}
	.dot {
		border-radius: 50%;
	}
	.dot.pt {
		background: var(--text);
	}
	.dot.val {
		background: var(--text-3);
		opacity: 0.6;
		width: 6px;
		height: 6px;
	}
	.dot.a {
		background: var(--viz-1);
	}
	.sq.b {
		background: var(--viz-3);
	}
	.key i.line {
		width: 16px;
		height: 3px;
		border-radius: 2px;
		background: var(--viz-1);
	}
	.key i.bar {
		width: 3px;
		height: 11px;
	}
	.bar.pos {
		background: var(--viz-2);
	}
	.bar.neg {
		background: var(--viz-4);
	}
	.chart {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 4px;
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 14px 20px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
	}
	.buttons {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
	.flip-rtl {
		display: inline-block;
	}
</style>
