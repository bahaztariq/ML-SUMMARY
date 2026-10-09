<script lang="ts">
	import { onDestroy } from 'svelte';
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha as fade, dot, label, mapper, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types.ts';
	import { local } from '#lib/i18n/index.svelte.ts';
	import { ACTIONS, ARROWS, argmaxQ, epsilonAt, episodeOf, maxQ, type Outcome } from './qlearn.ts';
	import {
		COLS,
		EPISODES,
		MAX_STEPS,
		ROWS,
		cellName,
		episodeNow,
		f2,
		finishEpisode,
		greedy,
		lastTr,
		nextChange,
		opts,
		qNow,
		resetWalk,
		runOf,
		total,
		trainAll,
		walkTo,
		type QState
	} from './state.ts';

	const L = local({
		en: {
			up: 'up',
			right: 'right',
			down: 'down',
			left: 'left',
			movesPerEp: 'moves per episode',
			lgGoal: '● goal',
			lgPit: '● pit',
			lgGaveUp: '● gave up',
			moves: 'moves',
			reward: 'reward',
			episode: 'episode',
			gridLabel: 'Grid world with the Q-value of each action shown as coloured triangles',
			explore: 'explore (random)',
			exploit: 'exploit (best Q)',
			target: 'target',
			tdError: 'TD error {v}',
			noMoves: 'No moves yet. Press Step.',
			chartLabel: 'Moves per episode, coloured by how the episode ended, with the ε schedule',
			netLabel: 'A small Q-network: cell coordinates in, four Q-values out',
			stateCap: 'state {cell}',
			hidden: 'hidden layer',
			dnote1: 'Hover a cell: a Q-network would',
			dnoteEm: 'compute',
			dnote2: 'these four numbers from the state instead of looking them up.',
			thisGrid: 'this grid',
			nNumbers: '{a} × 4 = {b} numbers',
			atari: 'Atari (4 × 84×84 frames)',
			states: 'states',
			movePad: 'Move the agent',
			reset: '↺ Reset',
			resetPlain: 'Reset',
			step: 'Step',
			nextChange: 'Next change',
			finishEp: 'Finish episode',
			pause: '❚❚ Pause',
			trainAgain: '↺ Train again',
			train: '▶ Train',
			skip: 'Skip to end',
			alpha: 'Learning rate α',
			gamma: 'Discount γ',
			eps: 'Starting ε',
			hint1: 'Drag',
			hintOr: 'or',
			hint2: '; click a cell to toggle a wall.'
		},
		fr: {
			up: 'haut',
			right: 'droite',
			down: 'bas',
			left: 'gauche',
			movesPerEp: 'coups par épisode',
			lgGoal: '● but',
			lgPit: '● piège',
			lgGaveUp: '● abandon',
			moves: 'coups',
			reward: 'récompense',
			episode: 'épisode',
			gridLabel: 'Monde en grille où la valeur Q de chaque action est représentée par un triangle coloré',
			explore: 'exploration (hasard)',
			exploit: 'exploitation (meilleur Q)',
			target: 'cible',
			tdError: 'erreur TD {v}',
			noMoves: 'Aucun coup pour l’instant. Appuyez sur Pas.',
			chartLabel: 'Coups par épisode, colorés selon la fin de l’épisode, avec le calendrier de ε',
			netLabel: 'Un petit réseau Q : coordonnées de la case en entrée, quatre valeurs Q en sortie',
			stateCap: 'état {cell}',
			hidden: 'couche cachée',
			dnote1: 'Survolez une case : un réseau Q',
			dnoteEm: 'calculerait',
			dnote2: 'ces quatre nombres à partir de l’état au lieu de les lire dans une table.',
			thisGrid: 'cette grille',
			nNumbers: '{a} × 4 = {b} nombres',
			atari: 'Atari (4 images 84×84)',
			states: 'états',
			movePad: 'Déplacer l’agent',
			reset: '↺ Réinitialiser',
			resetPlain: 'Réinitialiser',
			step: 'Pas',
			nextChange: 'Changement suivant',
			finishEp: 'Finir l’épisode',
			pause: '❚❚ Pause',
			trainAgain: '↺ Réentraîner',
			train: '▶ Entraîner',
			skip: 'Aller à la fin',
			alpha: 'Taux d’apprentissage α',
			gamma: 'Actualisation γ',
			eps: 'ε initial',
			hint1: 'Faites glisser',
			hintOr: 'ou',
			hint2: ' ; cliquez sur une case pour ajouter ou retirer un mur.'
		},
		ar: {
			up: 'أعلى',
			right: 'يمين',
			down: 'أسفل',
			left: 'يسار',
			movesPerEp: 'الحركات في كل حلقة',
			lgGoal: '● الهدف',
			lgPit: '● الحفرة',
			lgGaveUp: '● استسلام',
			moves: 'الحركات',
			reward: 'المكافأة',
			episode: 'الحلقة',
			gridLabel: 'عالم شبكي تظهر فيه قيمة Q لكل فعل على شكل مثلثات ملوّنة',
			explore: 'استكشاف (عشوائي)',
			exploit: 'استغلال (أفضل Q)',
			target: 'الهدف',
			tdError: 'خطأ TD {v}',
			noMoves: 'لا حركات بعد. اضغط خطوة.',
			chartLabel: 'الحركات في كل حلقة، ملوّنة حسب نهاية الحلقة، مع جدول ε',
			netLabel: 'شبكة Q صغيرة: إحداثيات الخانة مدخلات، وأربع قيم Q مخرجات',
			stateCap: 'الحالة {cell}',
			hidden: 'الطبقة المخفية',
			dnote1: 'مرّر المؤشر فوق خانة: شبكة Q',
			dnoteEm: 'ستحسب',
			dnote2: 'هذه الأعداد الأربعة من الحالة بدلًا من البحث عنها في جدول.',
			thisGrid: 'هذه الشبكة',
			nNumbers: '{a} × 4 = {b} عددًا',
			atari: 'Atari (4 إطارات 84×84)',
			states: 'حالة',
			movePad: 'حرّك الوكيل',
			reset: '↺ إعادة الضبط',
			resetPlain: 'إعادة الضبط',
			step: 'خطوة',
			nextChange: 'التغيير التالي',
			finishEp: 'أنهِ الحلقة',
			pause: '❚❚ إيقاف مؤقت',
			trainAgain: '↺ درّب مجددًا',
			train: '▶ درّب',
			skip: 'انتقل إلى النهاية',
			alpha: 'معدل التعلم α',
			gamma: 'معامل الخصم γ',
			eps: 'ε الابتدائية',
			hint1: 'اسحب',
			hintOr: 'أو',
			hint2: '؛ وانقر على خانة لإضافة جدار أو إزالته.'
		}
	});

	let { s = $bindable(), step }: SceneProps<QState> = $props();

	const CELL = 60;
	const W = COLS * CELL;
	const H = ROWS * CELL;

	const run = $derived(runOf(s));
	const Q = $derived(qNow(s));
	const tr = $derived(s.mode === 'learn' ? lastTr(s) : null);
	const path = $derived(s.show.path && s.mode === 'learn' ? greedy(s) : null);
	const nT = $derived(total(s));

	/** Where the agent dot is drawn. */
	const agent = $derived(s.mode === 'walk' ? s.walk.pos : tr && s.t < nT ? tr.s2 : s.env.start);

	const cells = Array.from({ length: COLS * ROWS }, (_, i) => i);
	const cx = (c: number) => (c % COLS) * CELL + CELL / 2;
	const cy = (c: number) => Math.floor(c / COLS) * CELL + CELL / 2;

	function tri(c: number, a: number) {
		const x = (c % COLS) * CELL;
		const y = Math.floor(c / COLS) * CELL;
		const m = `${x + CELL / 2},${y + CELL / 2}`;
		const corners = [
			[`${x},${y}`, `${x + CELL},${y}`],
			[`${x + CELL},${y}`, `${x + CELL},${y + CELL}`],
			[`${x + CELL},${y + CELL}`, `${x},${y + CELL}`],
			[`${x},${y + CELL}`, `${x},${y}`]
		][a];
		return `${corners[0]} ${corners[1]} ${m}`;
	}
	const numPos = (c: number, a: number) => {
		const x = cx(c);
		const y = cy(c);
		return [
			[x, y - CELL / 2 + 11],
			[x + CELL / 2 - 13, y + 1],
			[x, y + CELL / 2 - 8],
			[x - CELL / 2 + 13, y + 1]
		][a];
	};
	const qFill = (v: number) =>
		v === 0
			? 'transparent'
			: `color-mix(in srgb, var(${v > 0 ? '--viz-2' : '--viz-4'}) ${Math.round(Math.min(1, Math.abs(v) / 10) * 62 + 6)}%, transparent)`;
	const vFill = (v: number) => (v <= 0 ? 'transparent' : `color-mix(in srgb, var(--viz-1) ${Math.round(Math.min(1, v / 10) * 60 + 4)}%, transparent)`);
	const isWall = (c: number) => s.env.walls.includes(c);
	const special = (c: number) => (c === s.env.goal ? 'goal' : c === s.env.pit ? 'pit' : c === s.env.start ? 'start' : null);
	const known = (c: number) => [0, 1, 2, 3].some((a) => Q[c * 4 + a] !== 0);
	const shortNum = (v: number) => (Math.abs(v) >= 9.995 ? v.toFixed(0) : Math.abs(v) < 0.005 ? '0' : v.toFixed(Math.abs(v) < 1 ? 2 : 1).replace(/^(-?)0\./, '$1.'));

	/* ---- playback ---- */
	let playing = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;
	function play() {
		if (playing) return stop();
		if (s.t >= nT) s.t = 0;
		playing = true;
		timer = setInterval(() => {
			const r = runOf(s);
			const n = r.transitions.length;
			if (s.t >= n) return stop();
			const ep = episodeOf(r, Math.min(s.t, n - 1));
			if (ep < 2) s.t = Math.min(n, s.t + 2);
			else s.t = r.epStart[Math.min(EPISODES, ep + (ep > 40 ? 3 : 1))];
			if (s.t >= n) stop();
		}, 40);
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

	/* ---- editing the world ---- */
	let svg = $state<SVGSVGElement>();
	let drag = $state<'goal' | 'pit' | 'start' | null>(null);
	function cellAt(e: PointerEvent) {
		if (!svg) return -1;
		const r = svg.getBoundingClientRect();
		const x = Math.floor(((e.clientX - r.left) / r.width) * COLS);
		const y = Math.floor(((e.clientY - r.top) / r.height) * ROWS);
		if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return -1;
		return y * COLS + x;
	}
	function retrain() {
		stop();
		s.t = total(s);
	}
	function down(e: PointerEvent) {
		if (!s.ui.edit) return;
		const c = cellAt(e);
		if (c < 0) return;
		const sp = special(c);
		if (sp) {
			drag = sp;
			svg?.setPointerCapture(e.pointerId);
			return;
		}
		s.env.walls = isWall(c) ? s.env.walls.filter((w) => w !== c) : [...s.env.walls, c];
		retrain();
	}
	function moveP(e: PointerEvent) {
		if (!drag) return;
		const c = cellAt(e);
		if (c < 0 || isWall(c) || special(c)) return;
		s.env[drag] = c;
		if (drag === 'goal') s.did.goalMoved = true;
		retrain();
	}
	function up() {
		drag = null;
	}

	/* ---- chart: episode lengths ---- */
	function drawChart(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const r = run;
		const box = { x: 34, y: 20, w: w - 66, h: h - 38 };
		const m = mapper(box, [0, EPISODES], [0, MAX_STEPS]);
		for (const v of [0, 50, 100]) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, String(v), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		for (const v of [0, 50, 100, 150, 200]) label(ctx, t, String(v), m.x(v), box.y + box.h + 10, { align: 'center', color: t.text3, size: 10 });
		// ε schedule on the right axis
		const me = mapper(box, [0, EPISODES], [0, 1]);
		ctx.strokeStyle = fade(t.text3, 0.8);
		ctx.setLineDash([3, 3]);
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		for (let e = 0; e <= EPISODES; e += 2) {
			const y = me.y(epsilonAt(opts(s), e));
			if (e) ctx.lineTo(m.x(e), y);
			else ctx.moveTo(m.x(e), y);
		}
		ctx.stroke();
		ctx.setLineDash([]);
		label(ctx, t, 'ε', box.x + box.w + 6, me.y(1), { color: t.text3, size: 10 });
		label(ctx, t, '1', box.x + box.w + 18, me.y(1), { color: t.text3, size: 9 });
		label(ctx, t, '0', box.x + box.w + 18, me.y(0), { color: t.text3, size: 9 });
		const col = (o: Outcome) => (o === 'goal' ? t.series[1] : o === 'pit' ? t.series[3] : t.text3);
		const shown = Math.min(EPISODES, episodeNow(s));
		for (let e = 0; e < shown; e++) {
			const len = r.epStart[e + 1] - r.epStart[e];
			dot(ctx, m.x(e + 0.5), m.y(len), 2.3, col(r.outcomes[e]));
		}
		label(ctx, t, L('movesPerEp'), box.x, 4, { color: t.text2, size: 11, weight: 600, base: 'top' });
		const lx = box.x + box.w;
		// right-aligned key, laid out from the right so translated words never overlap
		let kx = lx;
		for (const [key, color] of [['lgGaveUp', t.text3], ['lgPit', t.series[3]], ['lgGoal', t.series[1]]] as const) {
			label(ctx, t, L(key), kx, 10, { color, size: 10, align: 'right' });
			kx -= ctx.measureText(L(key)).width + 12;
		}
	}

	/* ---- readouts ---- */
	const readouts = $derived.by(() => {
		if (s.mode === 'walk')
			return [
				{ label: L('moves'), value: String(s.walk.steps) },
				{ label: L('reward'), value: s.walk.outcome === 'goal' ? '+10' : s.walk.outcome === 'pit' ? '−10' : '0', highlight: !!s.walk.outcome }
			];
		const ep = Math.min(EPISODES, episodeNow(s));
		return [
			{ label: L('episode'), value: `${ep}/${EPISODES}` },
			{ label: 'ε', value: f2(epsilonAt(opts(s), Math.min(EPISODES - 1, ep))) },
			{ label: 'α', value: String(s.alpha) },
			{ label: 'γ', value: String(s.gamma) },
			{ label: 'V(S)', value: f2(maxQ(Q, s.env.start)), highlight: true }
		];
	});

	/* ---- DQN diagram ---- */
	let focus = $state(-1);
	const fcell = $derived(focus >= 0 ? focus : s.env.start);
	const HID = [0, 1, 2, 3, 4];
</script>

<div class="scene">
	<div class="grid-wrap">
		<svg
			bind:this={svg}
			viewBox="-1 -1 {W + 2} {H + 2}"
			class="grid"
			class:editable={s.ui.edit}
			role="img"
			aria-label={L('gridLabel')}
			style="direction: ltr"
			onpointerdown={down}
			onpointermove={moveP}
			onpointerup={up}
			onpointercancel={up}
			onpointerleave={() => (focus = -1)}
		>
			{#each cells as c (c)}
				{@const x = (c % COLS) * CELL}
				{@const y = Math.floor(c / COLS) * CELL}
				{@const sp = special(c)}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<g onpointerenter={() => (focus = c)}>
					<rect {x} {y} width={CELL} height={CELL} class="cell" class:wall={isWall(c)} />
					{#if !isWall(c) && sp !== 'goal' && sp !== 'pit'}
						{#if s.show.values}
							<rect {x} {y} width={CELL} height={CELL} style:fill={vFill(maxQ(Q, c))} />
						{/if}
						{#if s.show.q}
							{#each [0, 1, 2, 3] as a (a)}
								<polygon
									points={tri(c, a)}
									class="tri"
									class:hot={s.show.update && tr && tr.s === c && tr.a === a}
									style:fill={s.show.values ? 'transparent' : qFill(Q[c * 4 + a])}
								/>
							{/each}
						{/if}
						{#if s.show.nums && known(c)}
							{#each [0, 1, 2, 3] as a (a)}
								{@const p = numPos(c, a)}
								<text x={p[0]} y={p[1]} class="num" class:hotnum={s.show.update && tr && tr.s === c && tr.a === a}>{shortNum(Q[c * 4 + a])}</text>
							{/each}
						{/if}
						{#if s.show.arrows && known(c)}
							<g class="arrow" transform="translate({cx(c)} {cy(c)}) rotate({argmaxQ(Q, c) * 90}) scale({s.show.nums ? 0.6 : 1})">
								<path d="M0 9 V-8 M-5.5 -2.5 L0 -8.5 L5.5 -2.5" />
							</g>
						{/if}
					{/if}
					{#if sp === 'goal'}
						<rect x={x + 4} y={y + 4} width={CELL - 8} height={CELL - 8} rx="8" class="goal" class:grab={s.ui.edit} />
						<text x={cx(c)} y={cy(c) + 1} class="big goal-t">+10</text>
					{:else if sp === 'pit'}
						<rect x={x + 4} y={y + 4} width={CELL - 8} height={CELL - 8} rx="8" class="pit" class:grab={s.ui.edit} />
						<text x={cx(c)} y={cy(c) + 1} class="big pit-t">−10</text>
					{:else if sp === 'start'}
						<text x={x + 7} y={y + CELL - 8} class="start-t">S</text>
					{/if}
				</g>
			{/each}
			{#if path && path.cells.length > 1}
				<polyline points={path.cells.map((c) => `${cx(c)},${cy(c)}`).join(' ')} class="path" class:bad={path.outcome !== 'goal'} />
			{/if}
			{#if tr && s.show.update && tr.s !== tr.s2}
				<line x1={cx(tr.s)} y1={cy(tr.s)} x2={cx(tr.s2)} y2={cy(tr.s2)} class="move" />
			{/if}
			<circle r="11" class="agent" style:transform="translate({cx(agent)}px, {cy(agent)}px)" />
		</svg>
	</div>

	<Readouts items={readouts} />

	{#if s.show.update && s.mode === 'learn'}
		<div class="panel bellman">
			{#if tr}
				<div class="brow">
					<span class="ltr">{cellName(s, tr.s)} → <b>{L(ACTIONS[tr.a])} {ARROWS[tr.a]}</b> → {cellName(s, tr.s2)}</span>
					<span class="tag" class:explore={tr.explore}>{tr.explore ? L('explore') : L('exploit')}</span>
				</div>
				<div class="eq">
					{L('target')} = r + γ·max Q(s′) = {tr.r} + {s.gamma}×{f2(tr.maxNext)} = <b>{f2(tr.target)}</b>
				</div>
				<div class="eq">
					Q(s,a) ← {f2(tr.old)} + {s.alpha}×({f2(tr.target)} − {f2(tr.old)}) = <b class:changed={tr.next !== tr.old}>{f2(tr.next)}</b>
					<span class="td">{L('tdError', { v: f2(tr.target - tr.old) })}</span>
				</div>
			{:else}
				<div class="eq muted">{L('noMoves')}</div>
			{/if}
		</div>
	{/if}

	{#if s.show.chart && s.mode === 'learn'}
		<div class="panel chart">
			<Canvas draw={drawChart} aspect={0.28} minHeight={130} maxHeight={170} label={L('chartLabel')} />
		</div>
	{/if}

	{#if s.show.dqn}
		<div class="panel dqn">
			<svg viewBox="0 0 420 176" class="net" role="img" aria-label={L('netLabel')} style="direction: ltr">
				{#each [0, 1] as i (i)}
					{#each HID as j (j)}
						<line x1="70" y1={50 + i * 50} x2="210" y2={15 + j * 30} class="edge" />
					{/each}
				{/each}
				{#each HID as j (j)}
					{#each [0, 1, 2, 3] as k (k)}
						<line x1="210" y1={15 + j * 30} x2="320" y2={20 + k * 37} class="edge" />
					{/each}
				{/each}
				{#each ['x', 'y'] as nm, i (nm)}
					<circle cx="70" cy={50 + i * 50} r="13" class="node in" />
					<text x="70" y={51 + i * 50} class="ntext">{nm === 'x' ? fcell % COLS : Math.floor(fcell / COLS)}</text>
					<text x="44" y={51 + i * 50} class="nlabel end">{nm}</text>
				{/each}
				{#each HID as j (j)}
					<circle cx="210" cy={15 + j * 30} r="9" class="node" />
				{/each}
				{#each [0, 1, 2, 3] as k (k)}
					<circle cx="320" cy={20 + k * 37} r="13" class="node out" style:fill={qFill(Q[fcell * 4 + k])} />
					<text x="320" y={21 + k * 37} class="ntext">{ARROWS[k]}</text>
					<text x="340" y={21 + k * 37} class="nlabel">Q = {f2(Q[fcell * 4 + k])}</text>
				{/each}
				<text x="70" y="168" class="cap">{L('stateCap', { cell: cellName(s, fcell) })}</text>
				<text x="210" y="168" class="cap">{L('hidden')}</text>
			</svg>
			<p class="dnote">{L('dnote1')} <em>{L('dnoteEm')}</em> {L('dnote2')}</p>
			{#if s.show.tableSize}
				<div class="sizes">
					<div><span>{L('thisGrid')}</span><b class="ltr">{L('nNumbers', { a: COLS * ROWS, b: COLS * ROWS * 4 })}</b></div>
					<div><span>{L('atari')}</span><b class="ltr">256<sup>28,224</sup> ≈ 10<sup>67,970</sup> {L('states')}</b></div>
				</div>
			{/if}
		</div>
	{/if}

	{#if Object.values(s.ui).some(Boolean)}
		<div class="controls">
			{#if s.ui.walk}
				<div class="pad" dir="ltr" role="group" aria-label={L('movePad')}>
					<button class="btn btn-sm up" onclick={() => walkTo(s, 0)} disabled={!!s.walk.outcome} aria-label={L('up')}>↑</button>
					<button class="btn btn-sm left" onclick={() => walkTo(s, 3)} disabled={!!s.walk.outcome} aria-label={L('left')}>←</button>
					<button class="btn btn-sm down" onclick={() => walkTo(s, 2)} disabled={!!s.walk.outcome} aria-label={L('down')}>↓</button>
					<button class="btn btn-sm right" onclick={() => walkTo(s, 1)} disabled={!!s.walk.outcome} aria-label={L('right')}>→</button>
				</div>
				<button class="btn btn-sm" onclick={() => resetWalk(s)}>{L('reset')}</button>
			{/if}
			{#if s.ui.step || s.ui.run}
				<div class="buttons">
					{#if s.ui.step}
						<button class="btn btn-sm" onclick={() => (stop(), (s.t = Math.min(nT, s.t + 1)))} disabled={s.t >= nT}>{L('step')}</button>
						<button class="btn btn-sm" onclick={() => (stop(), nextChange(s))} disabled={s.t >= nT}>{L('nextChange')}</button>
						<button class="btn btn-sm" onclick={() => (stop(), finishEpisode(s))} disabled={s.t >= nT}>{L('finishEp')}</button>
					{/if}
					{#if s.ui.run}
						<button class="btn btn-sm btn-primary" onclick={play}>{playing ? L('pause') : s.t >= nT ? L('trainAgain') : L('train')}</button>
						<button class="btn btn-sm" onclick={() => (stop(), trainAll(s))} disabled={s.t >= nT}>{L('skip')}</button>
					{/if}
					<button class="btn btn-sm" onclick={() => (stop(), (s.t = 0))} disabled={s.t === 0}>{L('resetPlain')}</button>
				</div>
			{/if}
			{#if s.ui.alpha}
				<Slider label={L('alpha')} bind:value={s.alpha} min={0.05} max={1} step={0.05} format={(v) => v.toFixed(2)} oninput={retrain} />
			{/if}
			{#if s.ui.gamma}
				<Slider label={L('gamma')} bind:value={s.gamma} min={0.3} max={0.99} step={0.01} format={(v) => v.toFixed(2)} oninput={retrain} />
			{/if}
			{#if s.ui.eps}
				<Slider label={L('eps')} bind:value={s.eps} min={0} max={1} step={0.05} format={(v) => v.toFixed(2)} oninput={retrain} />
			{/if}
			{#if s.ui.edit}
				<p class="hint">{L('hint1')} <b>+10</b>, <b>−10</b> {L('hintOr')} <b>S</b>{L('hint2')}</p>
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
	.grid-wrap {
		display: flex;
		justify-content: center;
	}
	.grid {
		width: 100%;
		max-width: 560px;
		height: auto;
		touch-action: none;
		user-select: none;
	}
	.grid.editable {
		cursor: pointer;
	}
	.cell {
		fill: var(--surface);
		stroke: var(--border-strong);
		stroke-width: 1;
	}
	.cell.wall {
		fill: var(--text-3);
		opacity: 0.55;
	}
	.tri {
		stroke: var(--border);
		stroke-width: 0.6;
		transition: fill 0.2s;
	}
	.tri.hot {
		stroke: var(--acc, var(--accent));
		stroke-width: 2;
	}
	.num {
		font-family: var(--font-mono);
		font-size: 8.5px;
		fill: var(--text-2);
		text-anchor: middle;
		dominant-baseline: middle;
		pointer-events: none;
	}
	.num.hotnum {
		fill: var(--text);
		font-weight: 700;
	}
	.arrow path {
		fill: none;
		stroke: var(--text);
		stroke-width: 2.6;
		stroke-linecap: round;
		stroke-linejoin: round;
		pointer-events: none;
	}
	.goal {
		fill: color-mix(in srgb, var(--viz-2) 28%, var(--surface));
		stroke: var(--viz-2);
		stroke-width: 2;
	}
	.pit {
		fill: color-mix(in srgb, var(--viz-4) 26%, var(--surface));
		stroke: var(--viz-4);
		stroke-width: 2;
	}
	.grab {
		cursor: grab;
	}
	.big {
		font-size: 15px;
		font-weight: 700;
		text-anchor: middle;
		dominant-baseline: central;
		pointer-events: none;
	}
	.goal-t {
		fill: var(--viz-2);
	}
	.pit-t {
		fill: var(--viz-4);
	}
	.start-t {
		font-size: 13px;
		font-weight: 800;
		fill: var(--text-2);
		pointer-events: none;
	}
	.path {
		fill: none;
		stroke: var(--viz-1);
		stroke-width: 3;
		stroke-dasharray: 6 4;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.75;
		pointer-events: none;
	}
	.path.bad {
		stroke: var(--viz-3);
	}
	.move {
		stroke: var(--acc, var(--accent));
		stroke-width: 2.5;
		stroke-dasharray: 3 3;
		pointer-events: none;
	}
	.agent {
		fill: var(--viz-1);
		stroke: var(--viz-bg);
		stroke-width: 3;
		transition: transform 0.12s ease-out;
		pointer-events: none;
	}
	.panel {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 8px 12px;
		min-width: 0;
	}
	.panel.chart {
		padding: 4px;
	}
	.bellman {
		display: grid;
		gap: 4px;
		font-size: 0.8125rem;
		color: var(--text-2);
	}
	.brow {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 6px;
	}
	.brow b {
		color: var(--text);
	}
	.tag {
		font-size: 0.75rem;
		padding: 1px 8px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--viz-1) 12%, transparent);
		color: var(--text);
	}
	.tag.explore {
		background: color-mix(in srgb, var(--viz-3) 18%, transparent);
	}
	.eq {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		overflow-wrap: anywhere;
	}
	.eq b {
		color: var(--text);
	}
	.eq b.changed {
		color: var(--viz-2);
	}
	.td {
		margin-inline-start: 8px;
		color: var(--text-3);
	}
	.muted {
		color: var(--text-3);
	}
	.net {
		width: 100%;
		max-width: 460px;
		display: block;
		margin: 0 auto;
		overflow: visible;
	}
	.edge {
		stroke: var(--border-strong);
		stroke-width: 0.8;
	}
	.node {
		fill: var(--surface-2);
		stroke: var(--text-3);
		stroke-width: 1.2;
	}
	.node.in {
		fill: color-mix(in srgb, var(--viz-1) 15%, var(--surface));
		stroke: var(--viz-1);
	}
	.node.out {
		stroke: var(--text-2);
	}
	.ntext {
		font-size: 11px;
		font-weight: 700;
		fill: var(--text);
		text-anchor: middle;
		dominant-baseline: central;
	}
	.nlabel {
		font-size: 11px;
		fill: var(--text-2);
		dominant-baseline: central;
		font-family: var(--font-mono);
	}
	.nlabel.end {
		text-anchor: end;
	}
	.cap {
		font-size: 10px;
		fill: var(--text-3);
		text-anchor: middle;
	}
	.dnote {
		margin: 4px 0 0;
		font-size: 0.75rem;
		color: var(--text-3);
		text-align: center;
	}
	.sizes {
		display: grid;
		gap: 4px;
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px solid var(--border);
		font-size: 0.8125rem;
	}
	.sizes div {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		flex-wrap: wrap;
		color: var(--text-2);
	}
	.sizes b {
		font-family: var(--font-mono);
		color: var(--text);
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
	.pad {
		display: grid;
		grid-template-columns: repeat(3, 36px);
		grid-template-rows: repeat(2, 30px);
		gap: 4px;
	}
	.pad .btn {
		padding: 0;
		justify-content: center;
	}
	.pad .up {
		grid-column: 2;
		grid-row: 1;
	}
	.pad .left {
		grid-column: 1;
		grid-row: 2;
	}
	.pad .down {
		grid-column: 2;
		grid-row: 2;
	}
	.pad .right {
		grid-column: 3;
		grid-row: 2;
	}
	.hint {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--text-3);
	}
</style>
