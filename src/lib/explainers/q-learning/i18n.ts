/**
 * French and Arabic narration for the Q-learning lesson (same step order as index.ts).
 * Action names match the scene's translated labels.
 */
import type { LessonText } from '../types.ts';
import { ARROWS, epsilonAt, maxQ, shortest } from './qlearn.ts';
import {
	COLS,
	DECAY,
	EPISODES,
	EPS_MIN,
	MAX_STEPS,
	ROWS,
	cellName,
	episodeNow,
	f2,
	greedy,
	lastTr,
	opts,
	plainEnv,
	qNow,
	runOf,
	type QState
} from './state.ts';

const ACT_FR = ['haut', 'droite', 'bas', 'gauche'];
const ACT_AR = ['أعلى', 'يمين', 'أسفل', 'يسار'];

function outcomes(s: QState) {
	const run = runOf(s);
	const done = Math.min(EPISODES, episodeNow(s));
	const o = run.outcomes.slice(0, done);
	const goal = o.filter((x) => x === 'goal').length;
	const pit = o.filter((x) => x === 'pit').length;
	return { done, goal, pit, timeout: done - goal - pit };
}

const ep = (s: QState) => Math.min(EPISODES - 1, episodeNow(s));

const fr: LessonText<QState> = {
	title: 'Comment le Q-learning apprend par essais et erreurs',
	steps: [
		{
			title: 'Un agent dans un monde en grille',
			body: (s) => {
				const w = s.walk;
				const status = !w.outcome
					? `Coups joués : **${w.steps}**.`
					: w.outcome === 'goal'
						? `**But atteint en ${w.steps} coups.** Le chemin le plus court en compte ${shortest(plainEnv(s.env), s.env.goal)}.`
						: `**Tombé dans le piège** après ${w.steps} coups : −10. Appuyez sur Réinitialiser et réessayez.`;
				return `En **apprentissage par renforcement**, personne n’étiquette la bonne réponse. Un **agent** agit dans un **environnement** et ne reçoit que des **récompenses**.

Ici, l’agent (le point) part de **S** dans une grille ${COLS}×${ROWS}. À chaque tour, il choisit l’une de 4 actions : haut, droite, bas, gauche. Les murs et les bords le bloquent. Atteindre le **+10** ou tomber dans le piège **−10** met fin à l’*épisode*. Les coups ordinaires rapportent 0.

${status}`;
			},
			task: { prompt: 'Amenez l’agent jusqu’au **+10** avec les boutons fléchés. Imaginez maintenant apprendre cela sans carte, uniquement avec des récompenses.' }
		},
		{
			title: 'La table Q : un score pour chaque coup',
			body: `Le Q-learning tient une table **Q(s, a)** : pour chaque état *s* (case) et chaque action *a*, la récompense future totale qu’il attend s’il joue *a* à cet endroit puis joue bien ensuite.

Chaque case est découpée en 4 triangles, un par action, colorés selon leur valeur Q (vert = bon, rose = mauvais). Cela fait ${COLS * ROWS} cases × 4 actions. Tout commence à **0** : l’agent ne sait encore rien.

Si la table était juste, agir serait facile : dans chaque case, prendre l’action de plus grand Q. Tout le travail consiste à **remplir la table** à partir de l’expérience.`
		},
		{
			title: 'Un coup, une mise à jour de Bellman',
			body: (s) => {
				const tr = lastTr(s);
				const detail = !tr
					? 'Appuyez sur **Pas** pour jouer le premier coup.'
					: `Dernier coup : depuis ${cellName(s, tr.s)}, l’agent a joué **${ACT_FR[tr.a]}** ${ARROWS[tr.a]}, ${tr.explore ? 'un coup au hasard (exploration)' : 'son meilleur coup connu (exploitation)'}, et a atterri en ${cellName(s, tr.s2)} avec la récompense **${tr.r}**.

cible = r + γ·max Q(s′) = ${tr.r} + ${s.gamma} × ${f2(tr.maxNext)} = **${f2(tr.target)}**${tr.done ? ' (épisode terminé : rien ne suit)' : ''}

Q ← ${f2(tr.old)} + ${s.alpha} × (${f2(tr.target)} − ${f2(tr.old)}) = **${f2(tr.next)}**`;
				return `Après chaque coup, l’agent rapproche une entrée d’une **cible** : la récompense qu’il vient d’obtenir plus la valeur actualisée du meilleur coup depuis la case où il a atterri.

Q(s,a) ← Q(s,a) + α·[r + γ·max Q(s′,·) − Q(s,a)]

Le crochet est l’**erreur TD**. Ici α = ${s.alpha} (taux d’apprentissage), γ = ${s.gamma} (actualisation).

${detail}`;
			},
			task: {
				prompt:
					'Appuyez plusieurs fois sur **Pas** : tout étant à 0, la cible vaut 0 aussi, donc rien ne change. Puis appuyez sur **Changement suivant** jusqu’à ce qu’une récompense arrive enfin dans la table.'
			}
		},
		{
			title: 'De nombreux épisodes : la valeur remonte',
			body: (s) => {
				const o = outcomes(s);
				const g = greedy(s);
				return `Chaque épisode est une partie qui part de S jusqu’à ce que l’agent atteigne +10, −10 ou ${MAX_STEPS} coups. La case voisine du but apprend sa valeur en premier. La case d’avant apprend à partir d’*elle* la fois suivante, et ainsi de suite : la valeur se propage **à rebours** depuis la récompense, d’un pas par visite.

Épisodes : **${o.done}** / ${EPISODES} (but ${o.goal}, piège ${o.pit}, abandon ${o.timeout}). Exploration ε = ${f2(epsilonAt(opts(s), ep(s)))}.

${g.outcome === 'goal' ? `Les flèches (meilleure action par case) mènent maintenant de S au but en **${g.cells.length - 1}** coups.` : 'Les flèches (meilleure action par case) n’atteignent pas encore le but.'}`;
			},
			task: { prompt: 'Appuyez sur **Entraîner** et regardez la valeur remonter depuis le but. Laissez les 200 épisodes se dérouler (ou allez à la fin).' }
		},
		{
			title: 'Explorer ou exploiter ? (ε-glouton)',
			body: (s) => {
				const o = outcomes(s);
				return `L’agent a choisi ses coups de façon **ε-gloutonne** : avec la probabilité ε, un coup au hasard (**exploration**), sinon le coup de plus grand Q (**exploitation**). Ici, ε partait de **${s.eps}**${s.eps > EPS_MIN ? ` et a décru jusqu’à ${EPS_MIN} à l’épisode ${DECAY * EPISODES} : beaucoup explorer au début, puis utiliser ce qu’on a appris` : ''}.

Avec ε = ${s.eps} : but atteint dans **${o.goal}** épisodes sur ${o.done}.`;
			},
			quiz: {
				question: 'Et si ε = 0 dès le départ, de sorte que l’agent joue toujours son meilleur coup connu ?',
				options: ['Il apprend le même chemin, seulement plus vite', 'Il trouve le but, mais par un chemin plus long', 'Il ne trouve jamais le but'],
				explain: (s) =>
					`Toutes les valeurs Q partent égales, et \`np.argmax\` départage les égalités en prenant la première action : **haut**. Monter contre le bord supérieur donne une récompense 0 et une cible 0 : la table reste à 0 et l’agent refait la même chose. Cela fait ${EPISODES} épisodes × ${MAX_STEPS} coups, et le but atteint **${outcomes(s).goal}** fois. Sans exploration, l’agent ne peut pas apprendre ce qu’il n’essaie jamais. Essayez le curseur ε : même 0.1 ne suffit souvent pas ici.`
			}
		},
		{
			title: 'Actualisation γ et taux d’apprentissage α',
			body: (s) => {
				const v = maxQ(qNow(s), s.env.start);
				const d = shortest(plainEnv(s.env), s.env.goal);
				return `**γ (actualisation)** indique combien vaut une récompense obtenue un pas plus tard. Le but est à ${d} coups de S, donc la meilleure valeur en S vaut 10 × γ^${d - 1} = **${f2(10 * s.gamma ** (d - 1))}**. La table indique **${f2(v)}**. L’ombrage des cases montre le max de Q par case. Comme les coups ordinaires ne rapportent rien, c’est γ < 1 qui donne plus de valeur aux chemins courts. Un petit γ rend l’agent myope : loin du but, tout ressemble à ~0.

**α (taux d’apprentissage)** est la distance parcourue par chaque mise à jour vers sa cible. Ce monde est déterministe, donc même α = 1 fonctionne. Avec des récompenses aléatoires ou des déplacements glissants, un α plus petit (≈ 0.1) moyenne le bruit au lieu de le poursuivre.`;
			},
			task: { prompt: 'Baissez **γ à 0.5 ou moins** et regardez les valeurs loin du but s’estomper. Puis essayez α pour voir à quelle vitesse les épisodes raccourcissent sur le graphique.' }
		},
		{
			title: 'Changer le monde',
			body: (s) => {
				const g = greedy(s);
				const d = shortest(plainEnv(s.env), s.env.goal);
				const route =
					d < 0
						? '**Le but est inatteignable** depuis S avec cette disposition.'
						: g.outcome === 'goal'
							? `Chemin appris : **${g.cells.length - 1}** coups (le plus court possible : ${d}).`
							: `Le chemin glouton n’atteint pas encore le but (le plus court possible : ${d}). Certaines dispositions demandent plus d’exploration ou d’épisodes.`;
				return `Le Q-learning est **sans modèle** (*model-free*) : l’agent ne voit jamais de carte, seulement des états, des actions et des récompenses. Changez le monde et il réapprend tout simplement (chaque changement réentraîne instantanément les ${EPISODES} épisodes).

${route}`;
			},
			task: { prompt: 'Faites glisser le **+10**, le **−10** ou **S** vers une autre case, ou cliquez sur des cases vides pour ajouter ou retirer des murs.' }
		},
		{
			title: 'Des tables aux Deep Q-Networks',
			body: `Une table demande une ligne par état. Cela marche pour ${COLS * ROWS} cases, mais pas pour les capteurs d’un robot ou un écran de jeu.

Un **DQN** remplace la table par un réseau de neurones ([MLP](concept:mlp-neural-network) ou CNN) : l’état entre, une valeur Q par action sort. Il est entraîné par [descente de gradient](concept:what-is-gradient-descent) sur l’erreur TD au carré (r + γ·max Q⁻(s′,·) − Q(s,a))². Deux astuces le stabilisent :

- **Replay d’expérience** : stocker les transitions et s’entraîner sur des lots aléatoires, pour ne pas apprendre d’affilée des coups consécutifs très corrélés.
- **Réseau cible** Q⁻ : une copie mise à jour lentement qui calcule les cibles, pour que le réseau ne se poursuive pas lui-même.`,
			quiz: {
				question: 'Un agent Atari voit 4 images empilées de 84×84 en niveaux de gris (256 nuances). Combien de lignes faudrait-il à une table Q ?',
				options: ['Environ un million', 'Environ 10¹² (mille milliards)', 'Plus de 10^60 000, une pour chaque écran possible'],
				explain: `Il existe 256^(84·84·4) ≈ **10^67 970** entrées possibles, bien plus que d’atomes dans l’univers (≈ 10^80). Presque chaque écran n’est vu qu’une fois au plus : une table ne pourrait jamais se remplir. Un réseau **généralise** : des écrans similaires donnent des valeurs Q similaires. C’est ainsi que DQN a appris 49 jeux Atari à partir des pixels en 2015.`
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué : avancez mise à jour par mise à jour, entraînez, changez α, γ et ε, et redessinez le monde.

1. **Q(s,a)** = récompense future actualisée attendue de l’action *a* dans l’état *s*.
2. Après chaque coup : Q ← Q + α·(r + γ·max Q(s′) − Q).
3. Exploration **ε-gloutonne**, décroissante au fil du temps.
4. **γ** fixe jusqu’où l’agent regarde devant lui ; **α** la vitesse de ses mises à jour.
5. Grands espaces d’états : un réseau à la place d’une table (**DQN**), avec replay et réseau cible.

Pour des actions continues, on utilise plutôt des méthodes de gradient de politique comme PPO ou SAC.`
		}
	]
};

const ar: LessonText<QState> = {
	title: 'كيف يتعلم Q-learning بالتجربة والخطأ',
	steps: [
		{
			title: 'وكيل في عالم شبكي',
			body: (s) => {
				const w = s.walk;
				const status = !w.outcome
					? `الحركات حتى الآن: **${w.steps}**.`
					: w.outcome === 'goal'
						? `**بلغ الهدف في ${w.steps} حركة.** أقصر طريق يتطلب ${shortest(plainEnv(s.env), s.env.goal)}.`
						: `**سقط في الحفرة** بعد ${w.steps} حركة: −10. اضغط إعادة الضبط وحاول مجددًا.`;
				return `في **التعلم المعزز** (reinforcement learning) لا أحد يضع تسمية للإجابة الصحيحة. يتصرف **وكيل** (agent) في **بيئة** (environment) ولا يتلقى سوى **مكافآت** (rewards).

هنا يبدأ الوكيل (النقطة) من **S** في شبكة ${COLS}×${ROWS}. في كل دور يختار أحد 4 أفعال: أعلى، يمين، أسفل، يسار. الجدران والحواف تمنعه. بلوغ **+10** أو السقوط في الحفرة **−10** ينهي *الحلقة* (episode). والحركات العادية تعطي 0.

${status}`;
			},
			task: { prompt: 'أوصل الوكيل إلى **+10** بأزرار الأسهم. تخيّل الآن أن تتعلم ذلك دون خريطة، بالمكافآت وحدها.' }
		},
		{
			title: 'جدول Q: درجة لكل حركة',
			body: `يحتفظ Q-learning بجدول **Q(s, a)**: لكل حالة *s* (خانة) ولكل فعل *a*، المكافأة المستقبلية الكلية التي يتوقعها إن قام بـ *a* هناك ثم أحسن اللعب بعدها.

كل خانة مقسومة إلى 4 مثلثات، واحد لكل فعل، ملوّنة حسب قيمة Q (الأخضر = جيد، الوردي = سيئ). أي ${COLS * ROWS} خانة × 4 أفعال. كلها تبدأ عند **0**: الوكيل لا يعرف شيئًا بعد.

لو كان الجدول صحيحًا لكان التصرف سهلًا: في كل خانة خذ الفعل ذا أعلى Q. المهمة كلها هي **ملء الجدول** من التجربة.`
		},
		{
			title: 'حركة واحدة، تحديث بلمان واحد',
			body: (s) => {
				const tr = lastTr(s);
				const detail = !tr
					? 'اضغط **خطوة** لتقوم بالحركة الأولى.'
					: `آخر حركة: من ${cellName(s, tr.s)} قام الوكيل بالفعل **${ACT_AR[tr.a]}** ${ARROWS[tr.a]}، ${tr.explore ? 'وهي حركة عشوائية (استكشاف)' : 'وهي أفضل حركة يعرفها (استغلال)'}، فوصل إلى ${cellName(s, tr.s2)} بمكافأة **${tr.r}**.

\`target = r + γ·max Q(s′) = ${tr.r} + ${s.gamma} × ${f2(tr.maxNext)} = ${f2(tr.target)}\`${tr.done ? ' (انتهت الحلقة، فلا شيء بعدها)' : ''}

\`Q ← ${f2(tr.old)} + ${s.alpha} × (${f2(tr.target)} − ${f2(tr.old)}) = ${f2(tr.next)}\``;
				return `بعد كل حركة يقرّب الوكيل مُدخلًا واحدًا نحو **هدف** (target): المكافأة التي حصل عليها للتو مضافًا إليها القيمة المخصومة لأفضل حركة من حيث وصل.

\`Q(s,a) ← Q(s,a) + α·[r + γ·max Q(s′,·) − Q(s,a)]\`

ما بين القوسين هو **خطأ الفرق الزمني** (TD error). هنا α = ${s.alpha} (معدل التعلم)، و γ = ${s.gamma} (معامل الخصم).

${detail}`;
			},
			task: {
				prompt: 'اضغط **خطوة** بضع مرات: بما أن كل شيء عند 0 فالهدف 0 أيضًا، فلا يتغير شيء. ثم اضغط **التغيير التالي** حتى تصل مكافأة أخيرًا إلى الجدول.'
			}
		},
		{
			title: 'حلقات كثيرة: القيمة تتدفق إلى الخلف',
			body: (s) => {
				const o = outcomes(s);
				const g = greedy(s);
				return `كل حلقة جولة تبدأ من S حتى يبلغ الوكيل +10 أو −10 أو ${MAX_STEPS} حركة. الخانة المجاورة للهدف تتعلم قيمتها أولًا. والخانة التي قبلها تتعلم *منها* في المرة التالية، وهكذا: تنتشر القيمة **إلى الخلف** من المكافأة، خطوة واحدة في كل زيارة.

الحلقات: **${o.done}** / ${EPISODES} (الهدف ${o.goal}، الحفرة ${o.pit}، استسلام ${o.timeout}). الاستكشاف ε = ${f2(epsilonAt(opts(s), ep(s)))}.

${g.outcome === 'goal' ? `الأسهم (أفضل فعل في كل خانة) تقود الآن من S إلى الهدف في **${g.cells.length - 1}** حركة.` : 'الأسهم (أفضل فعل في كل خانة) لا تصل إلى الهدف بعد.'}`;
			},
			task: { prompt: 'اضغط **درّب** وراقب القيمة تتدفق إلى الخلف من الهدف. دع الحلقات الـ200 كلها تجري (أو انتقل إلى النهاية).' }
		},
		{
			title: 'استكشاف أم استغلال؟ (ε-الجشعة)',
			body: (s) => {
				const o = outcomes(s);
				return `اختار الوكيل حركاته بطريقة **ε-الجشعة** (ε-greedy): باحتمال ε حركة عشوائية (**استكشاف**)، وإلا فالحركة ذات أعلى Q (**استغلال**). هنا بدأت ε عند **${s.eps}**${s.eps > EPS_MIN ? ` وتناقصت إلى ${EPS_MIN} بحلول الحلقة ${DECAY * EPISODES}: استكشف كثيرًا في البداية، ثم استخدم ما تعلّمته` : ''}.

مع ε = ${s.eps}: بُلغ الهدف في **${o.goal}** من ${o.done} حلقة.`;
			},
			quiz: {
				question: 'ماذا لو كانت ε = 0 منذ البداية، فيقوم الوكيل دائمًا بأفضل حركة يعرفها؟',
				options: ['يتعلم المسار نفسه لكن أسرع', 'يجد الهدف لكن عبر طريق أطول', 'لا يجد الهدف أبدًا'],
				explain: (s) =>
					`تبدأ كل قيم Q متساوية، و\`np.argmax\` يحسم التعادل بأخذ الفعل الأول: **أعلى**. التحرك إلى أعلى نحو الحافة العليا يعطي مكافأة 0 وهدفًا 0، فيبقى الجدول عند 0 ويكرر الوكيل الشيء نفسه. هذه ${EPISODES} حلقة × ${MAX_STEPS} حركة، وبُلغ الهدف **${outcomes(s).goal}** مرة. دون استكشاف لا يستطيع الوكيل تعلّم ما لا يجرّبه أبدًا. جرّب منزلق ε: حتى 0.1 لا تكفي غالبًا هنا.`
			}
		},
		{
			title: 'معامل الخصم γ ومعدل التعلم α',
			body: (s) => {
				const v = maxQ(qNow(s), s.env.start);
				const d = shortest(plainEnv(s.env), s.env.goal);
				return `**γ (معامل الخصم)** يحدد كم تساوي مكافأة تأتي بعد خطوة واحدة. الهدف على بعد ${d} حركة من S، لذا فأفضل قيمة عند S هي 10 × γ^${d - 1} = **${f2(10 * s.gamma ** (d - 1))}**. والجدول فيه **${f2(v)}**. يُظهر تظليل الخانات أكبر قيمة Q في كل خانة. بما أن الحركات العادية بلا مكافأة، فإن γ < 1 هي ما يجعل الطرق الأقصر أثمن. وقيمة γ الصغيرة تجعل الوكيل قصير النظر: بعيدًا عن الهدف يبدو كل شيء نحو 0.

**α (معدل التعلم)** هو مقدار تحرك كل تحديث نحو هدفه. هذا العالم حتمي، لذا تعمل حتى α = 1. أما مع مكافآت عشوائية أو حركات منزلقة، فإن α أصغر (≈ 0.1) يأخذ متوسط الضجيج بدلًا من ملاحقته.`;
			},
			task: { prompt: 'اخفض **γ إلى 0.5 أو أقل** وراقب القيم البعيدة عن الهدف تخبو. ثم جرّب α لترى مدى سرعة قِصر الحلقات في الرسم.' }
		},
		{
			title: 'غيّر العالم',
			body: (s) => {
				const g = greedy(s);
				const d = shortest(plainEnv(s.env), s.env.goal);
				const route =
					d < 0
						? '**لا يمكن بلوغ الهدف** من S في هذا التصميم.'
						: g.outcome === 'goal'
							? `الطريق المتعلَّم: **${g.cells.length - 1}** حركة (أقصر طريق ممكن: ${d}).`
							: `الطريق الجشع لا يصل إلى الهدف بعد (أقصر طريق ممكن: ${d}). بعض التصميمات تحتاج إلى استكشاف أكثر أو حلقات أكثر.`;
				return `Q-learning **خالٍ من النموذج** (model-free): لا يرى الوكيل أي خريطة أبدًا، بل حالات وأفعالًا ومكافآت فقط. غيّر العالم فيتعلم من جديد ببساطة (كل تغيير يعيد تدريب الحلقات الـ${EPISODES} فورًا).

${route}`;
			},
			task: { prompt: 'اسحب **+10** أو **−10** أو **S** إلى خانة أخرى، أو انقر على خانات فارغة لإضافة جدران أو إزالتها.' }
		},
		{
			title: 'من الجداول إلى شبكات Q العميقة',
			body: `يحتاج الجدول إلى صف لكل حالة. هذا يصلح لـ ${COLS * ROWS} خانة، لكنه لا يصلح لمستشعرات روبوت أو لشاشة لعبة.

تستبدل **DQN** (شبكة Q العميقة) الجدول بشبكة عصبية ([MLP](concept:mlp-neural-network) أو CNN): تدخل الحالة، وتخرج قيمة Q لكل فعل. تُدرَّب بـ[الانحدار التدرجي](concept:what-is-gradient-descent) على مربع خطأ الفرق الزمني \`(r + γ·max Q⁻(s′,·) − Q(s,a))²\`. حيلتان تحافظان على استقرارها:

- **إعادة تشغيل التجارب** (experience replay): خزّن الانتقالات ودرّب على دفعات عشوائية، حتى لا تُتعلَّم الحركات المتتالية شديدة الارتباط تباعًا.
- **الشبكة الهدف** Q⁻: نسخة تُحدَّث ببطء تحسب الأهداف، حتى لا تلاحق الشبكة نفسها.`,
			quiz: {
				question: 'وكيل Atari يرى 4 إطارات مكدسة بحجم 84×84 بتدرجات الرمادي (256 درجة). كم صفًا يحتاج جدول Q؟',
				options: ['نحو مليون', 'نحو 10¹² (ألف مليار)', 'أكثر من 10^60,000، صف لكل شاشة ممكنة'],
				explain: `هناك 256^(84·84·4) ≈ **10^67,970** مُدخل ممكن، أي أكثر بكثير من عدد الذرات في الكون (≈ 10^80). تكاد كل شاشة لا تُرى إلا مرة واحدة على الأكثر، فلا يمكن للجدول أن يمتلئ أبدًا. أما الشبكة **فتعمّم**: الشاشات المتشابهة تعطي قيم Q متشابهة. هكذا تعلّمت DQN عام 2015 لعب 49 لعبة Atari انطلاقًا من البكسلات.`
			}
		},
		{
			title: 'دورك: ساحة التجربة',
			body: `كل شيء مفتوح: تقدّم تحديثًا بعد تحديث، ودرّب، وغيّر α و γ و ε، وأعد تصميم العالم.

1. **Q(s,a)** = المكافأة المستقبلية المخصومة المتوقعة للفعل *a* في الحالة *s*.
2. بعد كل حركة: \`Q ← Q + α·(r + γ·max Q(s′) − Q)\`.
3. استكشاف **ε-الجشع**، يتناقص مع الوقت.
4. **γ** تحدد إلى أي مدى ينظر الوكيل إلى الأمام؛ و**α** سرعة تحديثه.
5. فضاءات الحالات الكبيرة: شبكة بدل الجدول (**DQN**)، مع إعادة التشغيل وشبكة هدف.

للأفعال المتصلة تُستخدم بدلًا من ذلك طرق تدرج السياسة مثل PPO أو SAC.`
		}
	]
};

export default { fr, ar };
