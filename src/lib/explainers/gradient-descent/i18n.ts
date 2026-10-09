/**
 * French and Arabic narration for the gradient-descent lesson (same step order as index.ts).
 */
import { fmt } from '#lib/viz/canvas.ts';
import type { LessonText } from '../types.ts';
import { BUMPY, FIT, STEPS_GOOD, STEPS_SLOW, now, reachedIn } from './narration.ts';
import { BUMPY_START, FIT_MIN, FIT_START, GLOBAL_MIN, LOCAL_MIN, current, info, iterations, problem, type GDState } from './state.ts';

const reachedFr = reachedIn({
	diverged: '**diverge** après {n} pas (perte {loss})',
	reachedOne: 'atteint le minimum en **{k} pas**',
	reachedMany: 'atteint le minimum en **{k} pas**',
	away: 's’**éloigne** du minimum ({n} pas jusqu’ici)',
	notYet: '**n’a pas encore atteint le minimum** après {n} pas'
});

const reachedAr = reachedIn({
	diverged: '**تباعد** بعد {n} خطوة (الخسارة {loss})',
	reachedOne: 'بلغ القيمة الصغرى في **خطوة واحدة**',
	reachedMany: 'بلغ القيمة الصغرى في **{k} خطوات**',
	away: 'يبتعد **عن** القيمة الصغرى ({n} خطوة حتى الآن)',
	notYet: '**لم يبلغ القيمة الصغرى بعد** بعد {n} خطوة'
});

const fr: LessonText<GDState> = {
	title: 'Comment la descente de gradient descend la pente',
	steps: [
		{
			title: 'La perte est un paysage',
			body: (s) => {
				const n = now(s);
				return `On cherche une droite **y = w·x** qui passe par les points de l'encart. Chaque pente **w** rate les points d'une certaine quantité (traits roses), et la moyenne des écarts au carré est la [perte](concept:loss-vs-cost-function) (ici, l'erreur quadratique moyenne).

Essayez chaque w et tracez sa perte : vous obtenez un **paysage**. Entraîner un modèle, c'est trouver le w tout en bas.

Pour l'instant w = **${n.w}** et la perte vaut **${n.loss}**.`;
			},
			task: {
				prompt: 'Faites glisser la bille jusqu’au w de **plus faible perte**. Observez la droite dans l’encart en chemin.'
			}
		},
		{
			title: 'Le gradient est la pente',
			body: (s) => {
				const n = now(s);
				return `Un modèle à des millions de poids ne peut pas essayer toutes les valeurs. Ce qu'il sait calculer à peu de frais (par le calcul différentiel, ou la [rétropropagation](concept:mlp-neural-network) dans un réseau de neurones), c'est le **gradient** ∇L : la pente de la perte à l'endroit où l'on se trouve.

La ligne ambre est la tangente en w = **${n.w}**. Sa pente vaut ∇L = **${n.g}** : augmentez w de 0.1 et la perte varie d'environ ${fmt(n.raw.grad[0] * 0.1)}.

Le signe indique de quel côté ça monte. La valeur indique à quel point c'est raide.`;
			},
			quiz: {
				question: 'Ici la pente est positive : la perte augmente quand w augmente. Dans quel sens faut-il déplacer w pour baisser la perte ?',
				options: ['À droite : augmenter w', 'À gauche : diminuer w', 'Peu importe : la pente ne le dit pas'],
				explain: `La descente va **à l'opposé** du gradient. Une pente positive veut dire *diminuer* w, une pente négative *l'augmenter*. La flèche verte est ce déplacement, **−η·∇L**. Faites glisser la bille de l'autre côté de la vallée et regardez la flèche se retourner.`
			}
		},
		{
			title: 'La règle de mise à jour',
			body: (s) => {
				const n = now(s);
				const k = iterations(s);
				return `La descente de gradient tient en une ligne, répétée :

\`w ← w − η · ∇L(w)\`

**η** (êta) est le **taux d'apprentissage** : la taille du pas par unité de pente. Ici η = **${s.lr}**.

Pas ${k} : w = **${n.w}**, ∇L = **${n.g}**, donc le déplacement vaut −${s.lr} × ${n.g} = **${n.move}**.

Les pas **rétrécissent d'eux-mêmes** à mesure que le terrain s'aplatit. Près du fond la pente est proche de 0, et le déplacement aussi.`;
			},
			task: {
				prompt: 'Appuyez plusieurs fois sur **Pas** jusqu’à ce que la perte soit à moins de 0.01 de son minimum.'
			}
		},
		{
			title: 'Taux d’apprentissage trop petit',
			body: (s) => `Même départ, mais η = **${s.lr}**. Chaque pas est prudent, et chaque pas est minuscule.

Après **${iterations(s)} pas**, on est à w = **${now(s).w}** avec une perte de **${now(s).loss}**. Le minimum vaut ${fmt(FIT.minLoss, 3)} : on en est encore loin. Avec η = 0.25, il fallait **${STEPS_GOOD} pas** pour y arriver ; à ce rythme, il en faut **${STEPS_SLOW}**.

Un taux d'apprentissage trop petit ne casse jamais rien. Il gaspille simplement du calcul, et un entraînement qui devrait durer une heure prend une journée.`
		},
		{
			title: 'Taux d’apprentissage trop grand',
			body: (s) => {
				const f = 1 - 2 * s.lr;
				return `Maintenant η = **${s.lr}**. Le pas est si grand que la bille **dépasse** le fond et atterrit de l'autre côté, puis dépasse à nouveau dans l'autre sens.

Sur cette perte la pente vaut ∇L = 2·(w − ŵ), où ŵ = ${fmt(FIT_MIN)} est la meilleure pente. Une mise à jour multiplie donc la distance à ŵ par **(1 − 2η) = ${fmt(f)}**. Un facteur négatif, c'est un rebond ; sa valeur absolue, ${fmt(Math.abs(f))}, décide si les rebonds s'amortissent.

État actuel : ${reachedFr(s)}, perte **${now(s).loss}**.`;
			},
			quiz: {
				question: 'Que se passe-t-il si on passe η de 0.8 à 1.1 ?',
				options: [
					'Ça rebondit, mais se stabilise encore plus vite',
					'Ça rebondit d’un côté à l’autre à la même hauteur, indéfiniment',
					'Chaque rebond atterrit plus haut que le précédent : la perte explose'
				],
				explain: (s) =>
					`(1 − 2·1.1) = −1.2 : chaque pas dépasse de 20 % de plus que l'écart de départ. Après ${iterations(s)} pas, la perte vaut **${fmt(info(s).loss, 1)}**, contre ${fmt(FIT.loss([FIT_START]), 2)} au départ. C'est la **divergence**. Dans un vrai entraînement, elle se manifeste par une perte qui grimpe, puis se transforme en \`NaN\`.`
			}
		},
		{
			title: 'Trouver le bon réglage',
			body: (s) => `Comme chaque pas multiplie l'erreur par (1 − 2η) :

- η < 0.5 : on s'approche lentement d'un seul côté
- 0.5 < η < 1 : on dépasse et on rebondit, mais on converge quand même
- η > 1 : les rebonds grandissent et ça diverge

En général, la limite est **η < 2 / courbure** : plus la vallée est raide, plus le pas sûr est petit. Les vraies pertes ne sont pas des cuvettes parfaites, donc en pratique on essaie des valeurs sur une échelle logarithmique (0.001, 0.01, 0.1) en surveillant la courbe de perte. Voir [l'optimisation des hyperparamètres](concept:hyperparameter-tuning).

η = **${s.lr.toFixed(2)}** → facteur ${fmt(1 - 2 * s.lr)} → ${reachedFr(s, 20)}.`,
			task: {
				prompt: 'Utilisez le **curseur η** pour atteindre le minimum en **3 pas ou moins**.'
			}
		},
		{
			title: 'Deux vallées : minimum local ou global',
			body: (s) => {
				const local = fmt(BUMPY.loss([LOCAL_MIN]), 2);
				const global = fmt(BUMPY.loss([GLOBAL_MIN]), 2);
				return `Les vraies pertes forment rarement une seule cuvette bien nette. Celle-ci a **deux vallées** : une peu profonde à droite (perte ${local}) et une plus profonde à gauche (perte ${global}), le **minimum global**.

La descente de gradient ne sent que la pente sous ses pieds. Elle n'a pas de carte.

w = **${now(s).w}**, perte **${now(s).loss}**, ∇L = **${now(s).g}**.`;
			},
			quiz: {
				question: `On part de w = ${BUMPY_START} avec η = 0.1. Où la descente de gradient finit-elle ?`,
				options: [
					'Dans la vallée la plus profonde, à gauche : elle trouve la meilleure réponse',
					'Dans la vallée la plus proche et la moins profonde, à droite',
					'Au sommet de la bosse entre les deux'
				],
				explain: (s) =>
					`Elle roule dans le creux le plus proche et s'arrête à w = **${fmt(current(s)[0])}** après ${iterations(s)} pas. Là, la pente vaut 0, donc la mise à jour aussi, et elle ne peut pas savoir qu'une vallée plus profonde existe. C'est un **minimum local**.`
			}
		},
		{
			title: 'Le point de départ compte',
			body: (s) => {
				const end = current(s)[0];
				const where = s.diverged
					? 'diverge'
					: Math.abs(end - GLOBAL_MIN) < 0.01
						? 'finit dans le minimum **global**'
						: Math.abs(end - LOCAL_MIN) < 0.01
							? 'reste coincée dans le minimum **local**'
							: `bouge encore, à w = ${fmt(end)}`;
				return `Désormais la descente est rejouée chaque fois que vous déplacez le départ. Départ = **${fmt(s.start[0])}**, η = **${s.lr.toFixed(2)}** → elle ${where}.

Tout ce qui part à gauche de la bosse en w = 0 roule vers la gauche. Un η plus grand peut parfois *sauter* la bosse (essayez 0.3 depuis 2.2), mais c'est de la chance, pas une stratégie.

En pratique, on utilise des redémarrages aléatoires, le bruit de la SGD par mini-lots et le momentum ([optimiseurs](concept:dl-optimizers)). Dans les grands réseaux de neurones, la plupart des minima locaux se révèlent presque aussi bons que le global ; les plateaux et les points selles posent plus de problèmes.`;
			},
			task: {
				prompt: 'Faites glisser le point de départ pour que la descente de gradient finisse dans le minimum **global**.'
			}
		},
		{
			title: 'Deux poids : zigzag dans une vallée étroite',
			body: (s) => {
				const shape = s.bowl === 'round' ? 'ronde' : 'étirée';
				return `Avec deux poids, la perte est une surface. Vue de dessus, c'est une **carte de niveaux** : chaque anneau correspond à un niveau de perte, comme sur une carte de randonnée. Le gradient est maintenant un vecteur (∂L/∂w₁, ∂L/∂w₂) et pointe toujours **perpendiculairement aux anneaux**.

Cette cuvette est **étirée** : raide en travers de la vallée, douce dans sa longueur. Le gradient pointe surtout *en travers*, donc la descente **zigzague** et avance péniblement le long du fond. Un η plus grand n'aide pas : au-delà de 2/12 ≈ 0.17, la direction raide diverge.

La cause habituelle : des variables à des échelles très différentes (l'âge en années contre le revenu en euros). La [mise à l'échelle des variables](concept:feature-scaling) rend la cuvette ronde.

Actuellement : cuvette **${shape}**, η = **${s.lr.toFixed(2)}** → ${reachedFr(s)}.`;
			},
			task: {
				prompt: 'Passez la cuvette en **Ronde (normalisée)**, puis augmentez η jusqu’à atteindre le minimum en **5 pas ou moins**.'
			}
		},
		{
			title: 'À vous : bac à sable',
			body: (s) => `Tout est débloqué. Récapitulatif :

1. Partir de quelque part et calculer le gradient ∇L, la pente locale.
2. Faire un pas dans le sens opposé : \`w ← w − η·∇L\`.
3. Répéter jusqu'à ce que le gradient soit proche de 0.

**η** est le réglage qui compte : trop petit, c'est lent ; trop grand, ça rebondit ou diverge, et la limite sûre dépend de la raideur de la perte. La descente trouve *un* minimum, pas forcément *le* minimum, et les vallées étroites la font zigzaguer. Momentum et Adam ([optimiseurs](concept:dl-optimizers)) sont conçus précisément pour corriger cela.

${problem(s).dim === 1 ? `w = **${now(s).w}**, perte **${now(s).loss}**` : `perte **${fmt(info(s).loss, 3)}**`}, pas ${iterations(s)}.`
		}
	]
};

const ar: LessonText<GDState> = {
	title: 'كيف ينزل الانحدار التدرجي المنحدر',
	steps: [
		{
			title: 'الخسارة تضاريس',
			body: (s) => {
				const n = now(s);
				return `نريد خطًا **y = w·x** يمر بالنقاط في المخطط الصغير. كل ميل **w** يخطئ النقاط بمقدار ما (الخطوط الوردية)، ومتوسط مربعات هذه الأخطاء هو [الخسارة](concept:loss-vs-cost-function) (loss) (هنا متوسط مربع الخطأ).

جرّب كل قيمة لـw وارسم خسارتها: تحصل على **تضاريس**. تدريب النموذج يعني إيجاد قيمة w في القاع.

الآن w = **${n.w}** والخسارة **${n.loss}**.`;
			},
			task: {
				prompt: 'اسحب الكرة إلى قيمة w ذات **أدنى خسارة**. راقب الخط في المخطط الصغير أثناء ذلك.'
			}
		},
		{
			title: 'التدرج هو الميل',
			body: (s) => {
				const n = now(s);
				return `النموذج ذو ملايين الأوزان لا يستطيع تجربة كل قيمة. ما يمكنه حسابه بتكلفة زهيدة (بالتفاضل، أو بـ[الانتشار العكسي](concept:mlp-neural-network) (backpropagation) في الشبكة العصبية) هو **التدرج** (gradient) ∇L: ميل الخسارة في الموضع الذي نقف فيه.

الخط الكهرماني هو المماس عند w = **${n.w}**. ميله ∇L = **${n.g}**: زِد w بمقدار 0.1 فتتغير الخسارة بنحو ${fmt(n.raw.grad[0] * 0.1)}.

الإشارة تخبرك أي اتجاه هو الصعود، والمقدار يخبرك بمدى الانحدار.`;
			},
			quiz: {
				question: 'الميل هنا موجب: الخسارة ترتفع كلما زاد w. في أي اتجاه يجب أن يتحرك w لخفض الخسارة؟',
				options: ['إلى اليمين: زيادة w', 'إلى اليسار: إنقاص w', 'أي اتجاه: الميل لا يحدد ذلك'],
				explain: `النزول يكون **عكس** التدرج. الميل الموجب يعني *إنقاص* w، والميل السالب يعني *زيادته*. السهم الأخضر هو هذه الحركة، **−η·∇L**. اسحب الكرة إلى الجهة الأخرى من الوادي وراقب السهم ينقلب.`
			}
		},
		{
			title: 'قاعدة التحديث',
			body: (s) => {
				const n = now(s);
				const k = iterations(s);
				return `الانحدار التدرجي سطر واحد يتكرر:

\`w ← w − η · ∇L(w)\`

**η** (إيتا) هو **معدل التعلم** (learning rate): حجم الخطوة لكل وحدة من الميل. هنا η = **${s.lr}**.

الخطوة ${k}: w = **${n.w}**، ∇L = **${n.g}**، إذن الحركة −${s.lr} × ${n.g} = **${n.move}**.

**تصغر الخطوات من تلقاء نفسها** كلما استوت الأرض. قرب القاع يقترب الميل من 0، وكذلك الحركة.`;
			},
			task: {
				prompt: 'اضغط **خطوة** عدة مرات حتى تصبح الخسارة ضمن 0.01 من قيمتها الصغرى.'
			}
		},
		{
			title: 'معدل تعلم صغير جدًا',
			body: (s) => `البداية نفسها، لكن η = **${s.lr}**. كل خطوة حذرة، وكل خطوة صغيرة جدًا.

بعد **${iterations(s)} خطوة** نحن عند w = **${now(s).w}** بخسارة **${now(s).loss}**. القيمة الصغرى ${fmt(FIT.minLoss, 3)}، فما زلنا بعيدين. مع η = 0.25 احتجنا إلى **${STEPS_GOOD} خطوات** للوصول؛ بهذا المعدل نحتاج إلى **${STEPS_SLOW}**.

معدل التعلم الصغير جدًا لا يفسد شيئًا أبدًا، لكنه يهدر الحوسبة فقط: تدريب يُفترض أن يستغرق ساعة يستغرق يومًا.`
		},
		{
			title: 'معدل تعلم كبير جدًا',
			body: (s) => {
				const f = 1 - 2 * s.lr;
				return `الآن η = **${s.lr}**. الخطوة كبيرة إلى حدّ أن الكرة **تتجاوز** القاع وتهبط على الجهة الأخرى، ثم تتجاوزه عائدةً.

على هذه الخسارة الميل ∇L = 2·(w − ŵ)، حيث ŵ = ${fmt(FIT_MIN)} هو أفضل ميل. إذن كل تحديث يضرب المسافة إلى ŵ في **(1 − 2η) = ${fmt(f)}**. المعامل السالب يعني ارتدادًا، وقيمته المطلقة ${fmt(Math.abs(f))} تحدد هل تتناقص الارتدادات.

الحالة الحالية: ${reachedAr(s)}، الخسارة **${now(s).loss}**.`;
			},
			quiz: {
				question: 'ماذا يحدث إذا رفعنا η من 0.8 إلى 1.1؟',
				options: [
					'ترتد، لكنها تستقر بسرعة أكبر',
					'ترتد ذهابًا وإيابًا على الارتفاع نفسه إلى الأبد',
					'كل ارتداد يهبط أعلى من سابقه: الخسارة تنفجر'
				],
				explain: (s) =>
					`(1 − 2·1.1) = −1.2: كل خطوة تتجاوز بنسبة 20% أكثر من الفجوة التي بدأت منها. بعد ${iterations(s)} خطوة أصبحت الخسارة **${fmt(info(s).loss, 1)}** بعد أن كانت ${fmt(FIT.loss([FIT_START]), 2)}. هذا هو **التباعد** (divergence). في تدريب حقيقي يظهر كخسارة تتصاعد ثم تتحول إلى \`NaN\`.`
			}
		},
		{
			title: 'ابحث عن القيمة المثلى',
			body: (s) => `لأن كل خطوة تضرب الخطأ في (1 − 2η):

- η < 0.5: يقترب ببطء من جهة واحدة
- 0.5 < η < 1: يتجاوز ويرتد، لكنه يتقارب مع ذلك
- η > 1: تكبر الارتدادات ويتباعد

عمومًا الحدّ هو **η < 2 / الانحناء**: كلما كان الوادي أشد انحدارًا صغرت الخطوة الآمنة. الخسائر الحقيقية ليست أوعية مثالية، لذا تُجرَّب عمليًا قيم على مقياس لوغاريتمي (0.001، 0.01، 0.1) مع مراقبة منحنى الخسارة. انظر [ضبط المعاملات الفائقة](concept:hyperparameter-tuning).

η = **${s.lr.toFixed(2)}** → المعامل ${fmt(1 - 2 * s.lr)} → ${reachedAr(s, 20)}.`,
			task: {
				prompt: 'استخدم **شريط η** لبلوغ القيمة الصغرى في **3 خطوات أو أقل**.'
			}
		},
		{
			title: 'واديان: محلي وعام',
			body: (s) => {
				const local = fmt(BUMPY.loss([LOCAL_MIN]), 2);
				const global = fmt(BUMPY.loss([GLOBAL_MIN]), 2);
				return `نادرًا ما تكون الخسائر الحقيقية وعاءً واحدًا مرتبًا. هذه لها **واديان**: وادٍ ضحل على اليمين (الخسارة ${local}) وآخر أعمق على اليسار (الخسارة ${global})، وهو **القيمة الصغرى العامة** (global minimum).

الانحدار التدرجي لا يشعر إلا بالميل تحت قدميه، وليست لديه خريطة.

w = **${now(s).w}**، الخسارة **${now(s).loss}**، ∇L = **${now(s).g}**.`;
			},
			quiz: {
				question: `نبدأ عند w = ${BUMPY_START} مع η = 0.1. أين ينتهي الانحدار التدرجي؟`,
				options: [
					'في الوادي الأعمق على اليسار: يجد أفضل إجابة',
					'في الوادي الأقرب والأضحل على اليمين',
					'فوق قمة النتوء بين الواديين'
				],
				explain: (s) =>
					`يتدحرج إلى أقرب منخفض ويتوقف عند w = **${fmt(current(s)[0])}** بعد ${iterations(s)} خطوة. هناك الميل 0، فالتحديث 0 أيضًا، ولا يستطيع أن يعرف أن واديًا أعمق موجود. هذه **قيمة صغرى محلية** (local minimum).`
			}
		},
		{
			title: 'نقطة البداية مهمة',
			body: (s) => {
				const end = current(s)[0];
				const where = s.diverged
					? 'يتباعد'
					: Math.abs(end - GLOBAL_MIN) < 0.01
						? 'ينتهي في القيمة الصغرى **العامة**'
						: Math.abs(end - LOCAL_MIN) < 0.01
							? 'يعلق في القيمة الصغرى **المحلية**'
							: `ما زال يتحرك عند w = ${fmt(end)}`;
				return `الآن يُعاد التشغيل كلما حرّكت نقطة البداية. البداية = **${fmt(s.start[0])}**، η = **${s.lr.toFixed(2)}** → ${where}.

كل ما يبدأ يسار النتوء عند w = 0 يتدحرج إلى اليسار. قد تتمكن قيمة η أكبر أحيانًا من *القفز* فوق النتوء (جرّب 0.3 من 2.2)، لكن هذا حظ لا استراتيجية.

عمليًا تُستخدم إعادات التشغيل العشوائية، وضجيج SGD على دفعات صغيرة، والزخم (momentum) ([المُحسِّنات](concept:dl-optimizers)). في الشبكات العصبية الكبيرة يتبين أن معظم القيم الصغرى المحلية جيدة تقريبًا كالعامة؛ أما الهضاب المستوية ونقاط السرج فتسبب مشكلات أكبر.`;
			},
			task: {
				prompt: 'اسحب نقطة البداية بحيث ينتهي الانحدار التدرجي في القيمة الصغرى **العامة**.'
			}
		},
		{
			title: 'وزنان: تعرّج في وادٍ ضيق',
			body: (s) => {
				const shape = s.bowl === 'round' ? 'دائري' : 'ممدود';
				return `مع وزنين تصبح الخسارة سطحًا. من الأعلى تبدو **خريطة كنتورية**: كل حلقة مستوى واحد من الخسارة، كخريطة المشي الجبلي. التدرج الآن متجه (∂L/∂w₁، ∂L/∂w₂) ويشير دائمًا **عموديًا على الحلقات**.

هذا الوعاء **ممدود**: شديد الانحدار عرضيًا وخفيف على طول الوادي. يشير التدرج غالبًا *عرضيًا*، فيسلك الانحدار التدرجي **مسارًا متعرجًا** ويزحف ببطء على طول القاع. ولا تفيد قيمة η أكبر: فبعد 2/12 ≈ 0.17 يتباعد الاتجاه الحاد.

السبب المعتاد ميزات بمقاييس مختلفة جدًا (العمر بالسنوات مقابل الدخل بالدولارات). [توحيد مقاييس الميزات](concept:feature-scaling) يجعل الوعاء دائريًا.

الآن: وعاء **${shape}**، η = **${s.lr.toFixed(2)}** → ${reachedAr(s)}.`;
			},
			task: {
				prompt: 'بدّل الوعاء إلى **دائري (موحَّد المقياس)**، ثم ارفع η حتى يبلغ القيمة الصغرى في **5 خطوات أو أقل**.'
			}
		},
		{
			title: 'دورك: ساحة التجربة',
			body: (s) => `كل شيء متاح الآن. للتلخيص:

1. ابدأ من أي نقطة واحسب التدرج ∇L، أي الميل المحلي.
2. تحرّك عكسه: \`w ← w − η·∇L\`.
3. كرّر حتى يقترب التدرج من 0.

**η** هو المقبض المهم: الصغير جدًا بطيء، والكبير جدًا يرتد أو يتباعد، والحدّ الآمن يعتمد على شدة انحدار الخسارة. يجد الانحدار التدرجي قيمةً صغرى *ما*، وليس بالضرورة *القيمة* الصغرى، والوديان الضيقة تجعله يتعرج. صُمّم الزخم وAdam ([المُحسِّنات](concept:dl-optimizers)) لإصلاح ذلك تحديدًا.

${problem(s).dim === 1 ? `w = **${now(s).w}**، الخسارة **${now(s).loss}**` : `الخسارة **${fmt(info(s).loss, 3)}**`}، الخطوة ${iterations(s)}.`
		}
	]
};

export default { fr, ar };
