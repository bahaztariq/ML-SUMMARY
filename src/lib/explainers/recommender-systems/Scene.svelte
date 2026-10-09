<script lang="ts">
	import { onDestroy } from 'svelte';
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import { alpha, dot, label, mapper, ticks, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types.ts';
	import { local } from '#lib/i18n/index.svelte.ts';
	import { has } from './rec.ts';
	import {
		EPOCHS,
		FEATS,
		ITEMS,
		K,
		TAGS,
		USERS,
		cfPredict,
		contentScore,
		fmt1,
		fmt2,
		itemCount,
		mfAt,
		mfPredict,
		mfRun,
		profile,
		ratingsOf,
		setRating,
		signed,
		sims,
		visible,
		type Fill,
		type RecState
	} from './state.ts';

	const L = local({
		en: {
			tagSci: 'sci-fi',
			tagRom: 'romance',
			tagAct: 'action',
			rmseTitle: 'RMSE on known ratings',
			epoch: 'epoch',
			randomStart: 'random start',
			epochN: 'epoch {n}',
			clickFilm: 'click a film',
			simTo: 'sim to {name}',
			cellRated: '{name}, {item}: rated {v}',
			cellNone: '{name}, {item}: not rated',
			cellPred: '{name}, {item}: predicted {v}',
			rated: 'rated',
			cfPred: 'CF prediction',
			mfPred: 'MF prediction',
			fallback: 'popularity fallback',
			newFilm: 'Nebula Run: new, 0 ratings',
			rating: 'Rating',
			cfFor: 'CF prediction for {name} × {item}',
			avgOf: '{name}\'s average',
			nbrLine: '{name}: sim {sim}, rated {r} ({dev} vs. own avg)',
			noCF: 'No positively-similar user has rated this film, so CF can\'t predict it.',
			lossLabel: 'Training error by epoch',
			mapLabel: '2-D map of learned item and user vectors',
			contentFor: 'Content scores for {name}\'s unseen films',
			profile: 'profile:',
			film: 'film',
			tags: 'tags',
			content: 'content',
			noData: 'no data',
			pause: '❚❚ Pause',
			trainAgain: '↺ Train again',
			train: '▶ Train',
			plusEpoch: '+1 epoch',
			reset: 'Reset',
			fillWith: 'Fill blanks with',
			nothing: 'Nothing',
			lambda: 'L2 penalty λ'
		},
		fr: {
			tagSci: 'SF',
			tagRom: 'romance',
			tagAct: 'action',
			rmseTitle: 'RMSE sur les notes connues',
			epoch: 'époque',
			randomStart: 'départ aléatoire',
			epochN: 'époque {n}',
			clickFilm: 'cliquez sur un film',
			simTo: 'sim. avec {name}',
			cellRated: '{name}, {item} : noté {v}',
			cellNone: '{name}, {item} : non noté',
			cellPred: '{name}, {item} : prédit {v}',
			rated: 'noté',
			cfPred: 'prédiction CF',
			mfPred: 'prédiction MF',
			fallback: 'repli sur la popularité',
			newFilm: 'Nebula Run : nouveau, 0 note',
			rating: 'Note',
			cfFor: 'Prédiction CF pour {name} × {item}',
			avgOf: 'moyenne de {name}',
			nbrLine: '{name} : sim {sim}, a noté {r} ({dev} par rapport à sa moyenne)',
			noCF: 'Aucun utilisateur de similarité positive n’a noté ce film : CF ne peut pas le prédire.',
			lossLabel: 'Erreur d’entraînement par époque',
			mapLabel: 'Carte 2D des vecteurs appris des films et des utilisateurs',
			contentFor: 'Scores de contenu des films non vus par {name}',
			profile: 'profil :',
			film: 'film',
			tags: 'étiquettes',
			content: 'contenu',
			noData: 'aucune donnée',
			pause: '❚❚ Pause',
			trainAgain: '↺ Réentraîner',
			train: '▶ Entraîner',
			plusEpoch: '+1 époque',
			reset: 'Réinitialiser',
			fillWith: 'Remplir les blancs avec',
			nothing: 'Rien',
			lambda: 'pénalité L2 λ'
		},
		ar: {
			tagSci: 'خيال علمي',
			tagRom: 'رومانسية',
			tagAct: 'أكشن',
			rmseTitle: 'RMSE على التقييمات المعروفة',
			epoch: 'الحقبة',
			randomStart: 'بداية عشوائية',
			epochN: 'الحقبة {n}',
			clickFilm: 'انقر على فيلم',
			simTo: 'التشابه مع {name}',
			cellRated: '{name}، {item}: التقييم {v}',
			cellNone: '{name}، {item}: بلا تقييم',
			cellPred: '{name}، {item}: التنبؤ {v}',
			rated: 'مُقيَّم',
			cfPred: 'تنبؤ CF',
			mfPred: 'تنبؤ MF',
			fallback: 'الرجوع إلى الشعبية',
			newFilm: 'Nebula Run: جديد، 0 تقييمات',
			rating: 'التقييم',
			cfFor: 'تنبؤ CF لـ {name} × {item}',
			avgOf: 'متوسط {name}',
			nbrLine: '{name}: التشابه {sim}، قيّم {r} ({dev} مقارنة بمتوسطه)',
			noCF: 'لم يقيّم هذا الفيلم أي مستخدم ذو تشابه موجب، لذا لا يستطيع CF التنبؤ به.',
			lossLabel: 'خطأ التدريب حسب الحقبة',
			mapLabel: 'خريطة ثنائية الأبعاد لمتجهات الأفلام والمستخدمين المتعلَّمة',
			contentFor: 'درجات المحتوى للأفلام التي لم يشاهدها {name}',
			profile: 'الملف:',
			film: 'الفيلم',
			tags: 'الوسوم',
			content: 'المحتوى',
			noData: 'لا بيانات',
			pause: '❚❚ إيقاف مؤقت',
			trainAgain: '↺ درّب مجددًا',
			train: '▶ درّب',
			plusEpoch: '+1 حقبة',
			reset: 'إعادة الضبط',
			fillWith: 'املأ الفراغات بـ',
			nothing: 'لا شيء',
			lambda: 'عقوبة L2 λ'
		}
	});

	let { s = $bindable(), step }: SceneProps<RecState> = $props();

	const TAG_KEYS = ['tagSci', 'tagRom', 'tagAct'] as const;
	const tagName = (j: number) => L(TAG_KEYS[j]);
	const tagsOf = (i: number) => TAGS.map((_, j) => j).filter((j) => FEATS[i][j]).map(tagName).join(', ');

	const r = $derived(visible(s));
	const users = $derived(USERS.slice(0, s.nUsers));
	const items = $derived(ITEMS.slice(0, s.nItems));
	const simList = $derived(s.show.sim ? sims(s) : []);
	const model = $derived(s.fill === 'mf' || s.show.train || s.show.factors ? mfAt(s) : null);

	/* ---- training playback ---- */
	let playing = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;
	function play() {
		if (playing) return stop();
		if (s.epoch >= EPOCHS) s.epoch = 0;
		playing = true;
		timer = setInterval(() => {
			s.epoch = Math.min(EPOCHS, s.epoch + 1);
			if (s.epoch >= EPOCHS) stop();
		}, 45);
	}
	function stop() {
		playing = false;
		clearInterval(timer);
	}
	$effect(() => {
		step;
		return stop;
	});
	onDestroy(stop);

	/* ---- cells ---- */
	function cellValue(u: number, i: number): { text: string; v: number; kind: 'obs' | 'pred' | 'fallback' | 'none' } {
		const v = r[u][i];
		if (has(v)) return { text: String(v), v, kind: 'obs' };
		if (s.fill === 'cf') {
			const p = cfPredict(s, u, i).pred;
			return Number.isFinite(p) ? { text: fmt1(p), v: p, kind: 'pred' } : { text: '?', v: NaN, kind: 'none' };
		}
		if (s.fill === 'mf') {
			const p = mfPredict(s, u, i);
			return Number.isFinite(p.v) ? { text: fmt1(p.v), v: p.v, kind: p.fallback ? 'fallback' : 'pred' } : { text: '?', v: NaN, kind: 'none' };
		}
		return { text: '?', v: NaN, kind: 'none' };
	}

	function pickCell(u: number, i: number) {
		if (!s.ui.pickCell && !s.ui.edit) return;
		s.cell = { u, i };
	}
	function pickUser(u: number) {
		if (!s.ui.pickUser) return;
		if (u !== s.user) s.did.user = true;
		s.user = u;
	}

	const tint = (v: number, strength = 1) => `color-mix(in srgb, var(--viz-1) ${Math.round((12 + ((v - 1) / 4) * 38) * strength)}%, var(--surface))`;
	const simColor = (v: number) => (!Number.isFinite(v) ? 'var(--text-3)' : v >= 0 ? 'var(--viz-2)' : 'var(--viz-4)');

	const sel = $derived(s.cell && s.cell.u < s.nUsers && s.cell.i < s.nItems ? s.cell : null);
	const selCF = $derived(sel && s.show.formula && s.fill === 'cf' && !has(r[sel.u][sel.i]) ? cfPredict(s, sel.u, sel.i) : null);

	/* ---- loss curve ---- */
	function drawLoss(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const run = mfRun(s);
		const box = { x: 36, y: 22, w: w - 46, h: h - 42 };
		const ymax = Math.max(...run.map((m) => m.rmse)) * 1.05;
		const m = mapper(box, [0, EPOCHS], [0, ymax]);
		for (const v of ticks(0, ymax, 3)) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, v.toFixed(1), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		for (const v of ticks(0, EPOCHS, 3)) label(ctx, t, String(v), m.x(v), box.y + box.h + 11, { align: 'center', color: t.text3, size: 10 });
		ctx.strokeStyle = alpha(t.text3, 0.35);
		ctx.lineWidth = 1.2;
		ctx.setLineDash([3, 3]);
		ctx.beginPath();
		run.forEach((mm, i) => (i ? ctx.lineTo(m.x(mm.epoch), m.y(mm.rmse)) : ctx.moveTo(m.x(mm.epoch), m.y(mm.rmse))));
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.strokeStyle = t.series[0];
		ctx.lineWidth = 2;
		ctx.beginPath();
		run.slice(0, s.epoch + 1).forEach((mm, i) => (i ? ctx.lineTo(m.x(mm.epoch), m.y(mm.rmse)) : ctx.moveTo(m.x(mm.epoch), m.y(mm.rmse))));
		ctx.stroke();
		const cur = run[Math.min(s.epoch, run.length - 1)];
		dot(ctx, m.x(cur.epoch), m.y(cur.rmse), 4, t.series[0], t.bg, 1.5);
		label(ctx, t, L('rmseTitle'), box.x, 4, { color: t.text2, size: 11, weight: 600, base: 'top' });
		label(ctx, t, L('epoch'), box.x + box.w, 4, { align: 'right', color: t.text3, size: 10, base: 'top' });
	}

	/* ---- embedding ---- */
	const genreColor = (t: VizTheme, i: number) => {
		const f = FEATS[i];
		return f[0] && f[1] ? t.series[2] : f[1] ? t.series[3] : t.series[0];
	};
	let embMap: ReturnType<typeof mapper> | null = null;
	let hoverItem = $state(-1);

	function drawEmbed(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const run = mfRun(s);
		const mm = mfAt(s);
		const r0 = r;
		let lim = 0.5;
		for (const snap of [run[run.length - 1], mm]) {
			snap.Q.forEach((q, i) => itemCount(r0, i) && (lim = Math.max(lim, Math.abs(q[0]), Math.abs(q[1]))));
			snap.P.forEach((p, u) => ratingsOf(r0, u) && (lim = Math.max(lim, Math.abs(p[0]), Math.abs(p[1]))));
		}
		lim *= 1.25;
		const size = Math.min(w, h) - 16;
		const box = { x: (w - size) / 2, y: (h - size) / 2, w: size, h: size };
		const m = mapper(box, [-lim, lim], [-lim, lim]);
		embMap = m;
		ctx.strokeStyle = t.axis;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(m.x(-lim), m.y(0));
		ctx.lineTo(m.x(lim), m.y(0));
		ctx.moveTo(m.x(0), m.y(-lim));
		ctx.lineTo(m.x(0), m.y(lim));
		ctx.stroke();
		// users
		mm.P.forEach((p, u) => {
			if (!ratingsOf(r0, u)) return;
			const x = m.x(p[0]);
			const y = m.y(p[1]);
			ctx.fillStyle = alpha(t.text3, 0.7);
			ctx.fillRect(x - 3.5, y - 3.5, 7, 7);
			label(ctx, t, USERS[u], x + 6, y + 7, { color: t.text3, size: 9 });
		});
		const focus = s.focus >= 0 && s.focus < s.nItems ? s.focus : -1;
		if (focus >= 0) {
			const near = mm.Q.map((q, j) => ({ j, d: Math.hypot(q[0] - mm.Q[focus][0], q[1] - mm.Q[focus][1]) }))
				.filter((x) => x.j !== focus && itemCount(r0, x.j))
				.sort((a, b) => a.d - b.d)
				.slice(0, 2);
			for (const n of near) {
				ctx.strokeStyle = alpha(genreColor(t, focus), 0.6);
				ctx.setLineDash([4, 3]);
				ctx.lineWidth = 1.5;
				ctx.beginPath();
				ctx.moveTo(m.x(mm.Q[focus][0]), m.y(mm.Q[focus][1]));
				ctx.lineTo(m.x(mm.Q[n.j][0]), m.y(mm.Q[n.j][1]));
				ctx.stroke();
				ctx.setLineDash([]);
			}
		}
		mm.Q.forEach((q, i) => {
			if (i >= s.nItems || !itemCount(r0, i)) return;
			const x = m.x(q[0]);
			const y = m.y(q[1]);
			const big = i === focus || i === hoverItem;
			dot(ctx, x, y, big ? 8 : 6, genreColor(t, i), t.bg, 2);
			const right = x > w * 0.68;
			label(ctx, t, ITEMS[i], right ? x - 10 : x + 10, y - 1, { align: right ? 'right' : 'left', color: big ? t.text : t.text2, size: 11, weight: big ? 700 : 600 });
		});
		label(ctx, t, s.epoch === 0 ? L('randomStart') : L('epochN', { n: s.epoch }), 6, 10, { color: t.text3, size: 10 });
		if (s.ui.focus && focus < 0) label(ctx, t, L('clickFilm'), w - 6, h - 10, { align: 'right', color: t.text3, size: 10 });
	}

	function hitItem(p: { x: number; y: number }) {
		if (!embMap) return -1;
		const mm = mfAt(s);
		let best = -1;
		let bd = 16 * 16;
		mm.Q.forEach((q, i) => {
			if (i >= s.nItems || !itemCount(r, i)) return;
			const d = (embMap!.x(q[0]) - p.x) ** 2 + (embMap!.y(q[1]) - p.y) ** 2;
			if (d < bd) (bd = d), (best = i);
		});
		return best;
	}
	function embDown(p: { x: number; y: number }) {
		if (!s.ui.focus) return;
		const i = hitItem(p);
		if (i >= 0) {
			s.focus = i;
			s.did.focus = true;
		}
	}
	function embMove(p: { x: number; y: number }) {
		hoverItem = s.ui.focus ? hitItem(p) : -1;
	}

	/* ---- content ---- */
	const prof = $derived(s.show.content ? profile(s, s.user) : []);
	const unseen = $derived(items.map((_, i) => i).filter((i) => !has(r[s.user]?.[i])));
</script>

<div class="scene">
	<div class="matrix-wrap">
		<table class="matrix">
			<thead>
				<tr>
					<th class="corner"></th>
					{#each items as it, i (it)}
						<th class="item" class:new={i === 6} title={`${it} (${tagsOf(i)})`}>
							<span>{it}</span>
						</th>
					{/each}
					{#if s.show.sim}<th class="simh">{L('simTo', { name: USERS[s.user] })}</th>{/if}
				</tr>
			</thead>
			<tbody>
				{#each users as name, u (name)}
					<tr class:target={u === s.user && (s.show.sim || s.ui.pickUser)}>
						<th class="user">
							<button class="uname" disabled={!s.ui.pickUser} onclick={() => pickUser(u)} aria-pressed={u === s.user}>{name}</button>
						</th>
						{#each items as it, i (it)}
							{@const c = cellValue(u, i)}
							<td>
								<button
									class="cell {c.kind}"
									class:sel={sel?.u === u && sel?.i === i}
									style:background={c.kind === 'obs' ? tint(c.v) : c.kind === 'pred' || c.kind === 'fallback' ? tint(c.v, 0.55) : undefined}
									disabled={!s.ui.pickCell && !s.ui.edit}
									onclick={() => pickCell(u, i)}
									aria-label={L(c.kind === 'obs' ? 'cellRated' : c.kind === 'none' ? 'cellNone' : 'cellPred', { name, item: it, v: c.text })}
								>
									{c.text}
								</button>
							</td>
						{/each}
						{#if s.show.sim}
							{@const sm = simList[u]}
							<td class="sim" style:color={u === s.user ? 'var(--text-3)' : simColor(sm?.sim ?? NaN)}>
								{u === s.user ? '·' : fmt2(sm?.sim ?? NaN)}
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="legend">
		<span><i class="sw obs"></i>{L('rated')}</span>
		{#if s.fill !== 'none'}<span><i class="sw pred"></i>{s.fill === 'cf' ? L('cfPred') : L('mfPred')}</span>{/if}
		{#if s.fill === 'mf' && s.nUsers > 6 && ratingsOf(r, 6) === 0}<span><i class="sw fb"></i>{L('fallback')}</span>{/if}
		{#if s.nItems > 6}<span class="newtag">{L('newFilm')}</span>{/if}
	</div>

	{#if s.ui.edit && sel}
		<div class="editor">
			<span class="elabel"><strong>{USERS[sel.u]}</strong> × <strong>{ITEMS[sel.i]}</strong></span>
			<div class="stars" role="radiogroup" aria-label={L('rating')}>
				{#each [null, 1, 2, 3, 4, 5] as v (v)}
					<button
						class="star"
						class:on={r[sel.u][sel.i] === v}
						role="radio"
						aria-checked={r[sel.u][sel.i] === v}
						onclick={() => setRating(s, sel.u, sel.i, v)}>{v ?? '?'}</button
					>
				{/each}
			</div>
		</div>
	{/if}

	{#if selCF}
		<div class="panel formula">
			<div class="ftitle">{L('cfFor', { name: USERS[sel!.u], item: ITEMS[sel!.i] })}</div>
			{#if selCF.neighbours.length}
				<div class="frow"><span>{L('avgOf', { name: USERS[sel!.u] })}</span><b>{fmt2(selCF.mean)}</b></div>
				{#each selCF.neighbours as n (n.v)}
					<div class="frow">
						<span>{L('nbrLine', { name: USERS[n.v], sim: fmt2(n.sim), r: n.rating, dev: signed(n.dev) })}</span>
						<b>{signed(n.sim * n.dev)}</b>
					</div>
				{/each}
				<div class="frow total">
					<span class="ltr">{fmt2(selCF.mean)} + ({selCF.neighbours.map((n) => signed(n.sim * n.dev)).join(' ')}) / {fmt2(selCF.neighbours.reduce((a, n) => a + Math.abs(n.sim), 0))}</span>
					<b>= {fmt1(selCF.pred)}</b>
				</div>
			{:else}
				<div class="frow"><span>{L('noCF')}</span></div>
			{/if}
		</div>
	{/if}

	{#if s.show.factors && model}
		<div class="panel factors">
			<div class="ftables">
				<table class="ft">
					<thead><tr><th></th><th colspan={K}>pᵤ</th><th>bᵤ</th></tr></thead>
					<tbody>
						{#each users as name, u (name)}
							<tr class:hl={sel?.u === u}>
								<th>{name}</th>
								{#each model.P[u] as v, f (f)}<td>{fmt2(v)}</td>{/each}
								<td>{fmt2(model.bu[u])}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<table class="ft">
					<thead><tr><th></th><th colspan={K}>qᵢ</th><th>bᵢ</th></tr></thead>
					<tbody>
						{#each items as name, i (name)}
							<tr class:hl={sel?.i === i}>
								<th>{name}</th>
								{#each model.Q[i] as v, f (f)}<td>{fmt2(v)}</td>{/each}
								<td>{fmt2(model.bi[i])}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			{#if sel}
				{@const pu = model.P[sel.u]}
				{@const qi = model.Q[sel.i]}
				<div class="frow total">
					<span class="ltr"
						>{USERS[sel.u]} × {ITEMS[sel.i]}: μ {fmt2(model.mu)} + bᵤ {fmt2(model.bu[sel.u])} + bᵢ {fmt2(model.bi[sel.i])} + ({pu
							.map((v, f) => `${fmt2(v)}×${fmt2(qi[f])}`)
							.join(' + ')})</span
					>
					<b>= {fmt2(model.mu + model.bu[sel.u] + model.bi[sel.i] + pu.reduce((a, v, f) => a + v * qi[f], 0))}</b>
				</div>
			{/if}
		</div>
	{/if}

	{#if s.show.train}
		<div class="train">
			<div class="panel">
				<Canvas draw={drawLoss} aspect={0.62} minHeight={170} maxHeight={240} label={L('lossLabel')} />
			</div>
			<div class="panel">
				<Canvas
					draw={drawEmbed}
					aspect={0.86}
					minHeight={220}
					maxHeight={300}
					label={L('mapLabel')}
					onpointerdown={embDown}
					onpointermove={embMove}
					cursor={s.ui.focus && hoverItem >= 0 ? 'pointer' : 'default'}
				/>
			</div>
		</div>
	{/if}

	{#if s.show.content}
		<div class="panel content">
			<div class="ftitle">{L('contentFor', { name: USERS[s.user] })}</div>
			<div class="profile">
				{L('profile')}
				{#each TAGS as tg, j (tg)}
					<span class="tag" style:color={prof[j] > 0 ? 'var(--viz-2)' : prof[j] < 0 ? 'var(--viz-4)' : 'var(--text-3)'}>{tagName(j)} {signed(prof[j] ?? 0)}</span>
				{/each}
			</div>
			<table class="ct">
				<thead><tr><th>{L('film')}</th><th>{L('tags')}</th><th>{L('content')}</th><th>CF</th></tr></thead>
				<tbody>
					{#each unseen as i (i)}
						{@const cs = contentScore(s, s.user, i)}
						{@const cf = cfPredict(s, s.user, i).pred}
						<tr class:new={i === 6}>
							<th>{ITEMS[i]}</th>
							<td class="tags">{tagsOf(i)}</td>
							<td style:color={simColor(cs)}>{fmt2(cs)}</td>
							<td>{Number.isFinite(cf) ? fmt1(cf) : L('noData')}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if s.ui.train || s.ui.fill || s.ui.lambda}
		<div class="controls">
			{#if s.ui.train}
				<div class="buttons">
					<button class="btn btn-sm btn-primary" onclick={play}>{playing ? L('pause') : s.epoch >= EPOCHS ? L('trainAgain') : L('train')}</button>
					<button class="btn btn-sm" onclick={() => (stop(), (s.epoch = Math.min(EPOCHS, s.epoch + 1)))} disabled={s.epoch >= EPOCHS}>{L('plusEpoch')}</button>
					<button class="btn btn-sm" onclick={() => (stop(), (s.epoch = 0))}>{L('reset')}</button>
				</div>
			{/if}
			{#if s.ui.fill}
				<Segmented
					label={L('fillWith')}
					bind:value={s.fill}
					options={[
						{ value: 'none' as Fill, label: L('nothing') },
						{ value: 'cf' as Fill, label: 'CF' },
						{ value: 'mf' as Fill, label: 'MF' }
					]}
				/>
			{/if}
			{#if s.ui.lambda}
				<Slider label={L('lambda')} bind:value={s.lambda} min={0} max={0.5} step={0.01} format={(v) => v.toFixed(2)} />
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
	.matrix-wrap {
		overflow-x: auto;
	}
	.matrix {
		border-collapse: separate;
		border-spacing: 3px;
		margin: 0 auto;
		font-variant-numeric: tabular-nums;
	}
	.matrix th.item {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-2);
		vertical-align: bottom;
		width: 52px;
		max-width: 60px;
		line-height: 1.15;
		padding: 0 1px 2px;
	}
	.matrix th.item.new {
		color: var(--viz-3);
	}
	.simh {
		font-size: 0.6875rem;
		color: var(--text-3);
		font-weight: 500;
		vertical-align: bottom;
		padding-inline-start: 6px;
		line-height: 1.15;
		max-width: 60px;
	}
	.user {
		text-align: end;
		padding-inline-end: 2px;
	}
	.uname {
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-2);
		font: inherit;
		font-size: 0.8125rem;
		font-weight: 600;
		padding: 3px 7px;
		border-radius: var(--radius-full);
		cursor: pointer;
	}
	.uname:disabled {
		cursor: default;
	}
	.uname:not(:disabled):hover {
		border-color: var(--border-strong);
	}
	tr.target .uname {
		background: color-mix(in srgb, var(--acc, var(--accent)) 14%, transparent);
		color: var(--text);
	}
	.cell {
		width: 100%;
		min-width: 40px;
		height: 34px;
		border-radius: 7px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		font-family: var(--font-mono);
		font-size: 0.875rem;
		cursor: pointer;
		padding: 0;
	}
	.cell:disabled {
		cursor: default;
	}
	.cell.obs {
		font-weight: 700;
		border-color: transparent;
	}
	.cell.pred,
	.cell.fallback {
		font-style: italic;
		border-style: dashed;
		border-color: color-mix(in srgb, var(--viz-1) 50%, transparent);
		color: var(--text-2);
	}
	.cell.fallback {
		border-color: var(--viz-3);
	}
	.cell.none {
		color: var(--text-3);
	}
	.cell.sel {
		outline: 2px solid var(--acc, var(--accent));
		outline-offset: 1px;
	}
	td.sim {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 600;
		text-align: center;
		padding-inline-start: 6px;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 14px;
		font-size: 0.75rem;
		color: var(--text-3);
		justify-content: center;
		margin-top: -4px;
	}
	.legend span {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}
	.sw {
		width: 12px;
		height: 10px;
		border-radius: 3px;
		display: inline-block;
	}
	.sw.obs {
		background: color-mix(in srgb, var(--viz-1) 40%, var(--surface));
	}
	.sw.pred {
		border: 1px dashed var(--viz-1);
	}
	.sw.fb {
		border: 1px dashed var(--viz-3);
	}
	.newtag {
		color: var(--viz-3);
	}
	.editor {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 8px 12px;
		font-size: 0.8125rem;
		color: var(--text-2);
	}
	.stars {
		display: inline-flex;
		gap: 4px;
	}
	.star {
		width: 32px;
		height: 30px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		font-family: var(--font-mono);
		font-weight: 600;
		cursor: pointer;
	}
	.star:hover {
		border-color: var(--border-strong);
	}
	.star.on {
		background: var(--acc, var(--accent));
		border-color: var(--acc, var(--accent));
		color: var(--text-on-accent);
	}
	.panel {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 8px 10px;
		min-width: 0;
	}
	.ftitle {
		font-size: 0.8125rem;
		font-weight: 600;
		margin-bottom: 6px;
	}
	.frow {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		font-size: 0.8125rem;
		color: var(--text-2);
		padding: 2px 0;
		font-variant-numeric: tabular-nums;
	}
	.frow b {
		font-family: var(--font-mono);
		color: var(--text);
		white-space: nowrap;
	}
	.frow.total {
		border-top: 1px solid var(--border);
		margin-top: 4px;
		padding-top: 6px;
	}
	.ftables {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 24px;
		justify-content: center;
	}
	.ft,
	.ct {
		border-collapse: collapse;
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
	}
	.ft th,
	.ft td,
	.ct th,
	.ct td {
		padding: 2px 6px;
		text-align: end;
	}
	.ft thead th,
	.ct thead th {
		color: var(--text-3);
		font-weight: 500;
	}
	.ft tbody th,
	.ct tbody th {
		text-align: start;
		font-weight: 600;
		color: var(--text-2);
	}
	.ft td,
	.ct td {
		font-family: var(--font-mono);
	}
	.ft tr.hl {
		background: color-mix(in srgb, var(--acc, var(--accent)) 12%, transparent);
	}
	.ct {
		width: 100%;
	}
	.ct thead th:nth-child(-n + 2) {
		text-align: start;
	}
	.ct td.tags {
		font-family: var(--font-sans);
		color: var(--text-3);
		text-align: start;
	}
	.ct tr.new th {
		color: var(--viz-3);
	}
	.profile {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 12px;
		font-size: 0.75rem;
		color: var(--text-3);
		margin-bottom: 6px;
	}
	.tag {
		font-family: var(--font-mono);
		font-weight: 600;
	}
	.train {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 10px;
	}
	.train .panel {
		padding: 4px;
	}
	@media (max-width: 560px) {
		.train {
			grid-template-columns: minmax(0, 1fr);
		}
		.matrix th.item {
			font-size: 0.625rem;
			width: 40px;
		}
		.cell {
			min-width: 32px;
			height: 30px;
			font-size: 0.8125rem;
		}
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
</style>
