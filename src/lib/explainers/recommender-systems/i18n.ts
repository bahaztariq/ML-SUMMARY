/**
 * French and Arabic narration for the recommender-systems lesson (same step order as index.ts).
 * People and film names stay as they are; genre tags are translated like in the scene.
 */
import type { LessonText } from '../types.ts';
import {
	EPOCHS,
	ITEMS,
	NEIGHBOURS,
	USERS,
	cfPredict,
	contentScore,
	fmt1,
	fmt2,
	mfAt,
	profile,
	ratingsOf,
	sims,
	visible,
	type RecState
} from './state.ts';

const TAGS_FR = ['SF', 'romance', 'action'];
const TAGS_AR = ['خيال علمي', 'رومانسية', 'أكشن'];

function ranked(s: RecState) {
	return sims(s)
		.map((x, v) => ({ v, sim: x.sim }))
		.filter((x) => x.v !== s.user && Number.isFinite(x.sim))
		.sort((a, b) => b.sim - a.sim);
}

function nearestItems(s: RecState, i: number) {
	const m = mfAt(s);
	return m.Q.map((q, j) => ({ j, d: Math.hypot(q[0] - m.Q[i][0], q[1] - m.Q[i][1]) }))
		.filter((x) => x.j !== i)
		.sort((a, b) => a.d - b.d);
}

const filled = (s: RecState) => {
	const r = visible(s);
	return { n: r.flat().filter((v) => v !== null).length, total: r.flat().length };
};

/** Gus's state on the cold-start step: 0 = no rating, 1 = one, 2 = several but CF still blind, 3 = personal. */
const gusStage = (s: RecState) => {
	const n = ratingsOf(visible(s), 6);
	if (n === 0) return { n, k: 0 };
	if (n < 2) return { n, k: 1 };
	return { n, k: sims(s, 6).some((x, v) => v !== 6 && Number.isFinite(x.sim)) ? 3 : 2 };
};

const fr: LessonText<RecState> = {
	title: 'Comment les systèmes de recommandation remplissent les blancs',
	steps: [
		{
			title: 'Une matrice de notes creuse',
			body: (s) => {
				const f = filled(s);
				return `Six personnes ont noté six films de 1 à 5 étoiles. Un **?** signifie qu’elles n’ont pas vu ce film. Ici, **${f.n} cases sur ${f.total}** sont remplies ; sur un vrai site, c’est souvent moins de 1 %.

Le travail d’un système de recommandation est de **prédire les blancs**, puis de montrer à chacun les films non vus ayant la meilleure note prédite.

Observez le motif : Ana, Ben et Eli adorent les trois premiers films (science-fiction), tandis que Cara, Dev et Fay préfèrent *Paris Kiss* et *Love Letters* (romance).`;
			},
			task: { prompt: 'Cliquez sur une case et donnez-lui une autre note (ou effacez-la).' }
		},
		{
			title: 'Qui a des goûts similaires ?',
			body: (s) => {
				const list = ranked(s);
				const summary = !list.length
					? `**${USERS[s.user]}** n’a aucun film noté en commun avec qui que ce soit : aucune similarité ne peut être calculée.`
					: `**${USERS[s.user]}** est le plus en accord avec **${USERS[list[0].v]}** (${fmt2(list[0].sim)}) et le moins avec **${USERS[list[list.length - 1].v]}** (${fmt2(list[list.length - 1].sim)}).`;
				return `Le **filtrage collaboratif** repose sur une idée : *les personnes qui étaient d’accord par le passé le seront encore*.

Pour mesurer l’accord, on retranche d’abord à chaque utilisateur sa propre moyenne : un 3 de quelqu’un qui donne d’habitude des 5 compte comme « bof ». Puis on calcule la **similarité cosinus** sur les films notés par les deux : **+1** signifie les mêmes goûts, **−1** des goûts opposés.

${summary}`;
			},
			task: { prompt: 'Cliquez sur le nom d’un autre utilisateur pour voir avec qui *il* partage ses goûts.' }
		},
		{
			title: 'Prédire un blanc à partir des voisins',
			body: `Pour prédire la note d’Ana pour *Love Letters*, trouvez les **${NEIGHBOURS} utilisateurs qui lui ressemblent le plus et qui l’ont noté** (ses plus proches voisins, comme dans les [k plus proches voisins](concept:knn)).

Puis partez de la moyenne d’Ana et ajoutez l’avis des voisins, pondéré par la similarité :

r̂ = mean(Ana) + Σ sim·(r − mean(neighbour)) / Σ |sim|

Utiliser la note du voisin *par rapport à sa propre moyenne* signifie qu’un 3 donné par un noteur sévère compte comme un net « j’aime ».`,
			quiz: {
				question: 'Ana n’a pas vu Love Letters. Que va prédire le filtrage collaboratif basé sur les utilisateurs ?',
				options: ['Environ 2 ou moins', 'Environ 3', 'Environ 4 ou plus'],
				explain: (s) => {
					const p = cfPredict(s, 0, 4);
					const parts = p.neighbours.map(
						(n) => `${USERS[n.v]} (sim ${fmt2(n.sim)}, a donné ${n.rating}, ${n.dev >= 0 ? '+' : '−'}${fmt2(Math.abs(n.dev))} par rapport à sa moyenne)`
					);
					return `La moyenne d’Ana est de **${fmt2(p.mean)}**. Ses voisins qui l’ont noté : ${parts.join(' et ')}. Tous deux l’ont moins aimé que d’habitude, donc la prédiction est **${fmt1(p.pred)}**. Chaque blanc affiche maintenant sa prédiction CF ; cliquez sur l’un d’eux pour voir le détail.`;
				}
			}
		},
		{
			title: 'Factorisation de matrice : les goûts en quelques nombres',
			body: (s) => {
				const m = mfAt(s);
				return `Comparer chaque paire d’utilisateurs devient lent quand il y en a des millions. La **factorisation de matrice** compresse plutôt : chaque utilisateur reçoit un court vecteur **pᵤ** et chaque film un vecteur **qᵢ** (ici seulement *k* = 2 nombres chacun), plus un biais pour chacun :

r̂ = μ + bᵤ + bᵢ + pᵤ · qᵢ

Le produit scalaire est grand quand les goûts cachés d’un utilisateur s’alignent sur les traits cachés d’un film. Personne n’étiquette ces traits. Ils partent **au hasard**, donc chaque prédiction est proche de la moyenne globale μ = **${fmt2(m.mu)}**. Cliquez sur une case pour voir sa somme.`;
			}
		},
		{
			title: 'Apprendre les facteurs par SGD',
			body: (s) => {
				const m = mfAt(s);
				return `L’entraînement ne parcourt que les notes **observées**. Pour chacune, il calcule l’erreur e = r − r̂ et rapproche un peu les deux vecteurs l’un de l’autre (c’est la [descente de gradient](concept:what-is-gradient-descent), une note à la fois) :

pᵤ ← pᵤ + η·(e·qᵢ − λ·pᵤ)

qᵢ ← qᵢ + η·(e·pᵤ − λ·qᵢ)

λ est une pénalité L2 qui garde les vecteurs petits pour qu’ils ne se contentent pas de mémoriser les quelques notes.

Époque **${m.epoch}** sur ${EPOCHS}, RMSE sur les notes connues **${fmt2(m.rmse)}**. Les blancs ne servent jamais à l’entraînement, et pourtant ils se remplissent.`;
			},
			task: { prompt: 'Appuyez sur **Entraîner** et regardez l’erreur baisser, les blancs se remplir et les films s’organiser sur la carte.' }
		},
		{
			title: 'Lire la carte des films',
			body: (s) => {
				const base = `Avec *k* = 2, le vecteur qᵢ de chaque film est un point sur la carte. Personne n’a parlé de genres au modèle, et pourtant les films **aimés par les mêmes personnes se retrouvent proches**. Les axes eux-mêmes n’ont pas de sens fixe : seules les directions et la proximité comptent.

Les utilisateurs sont aussi des points (carrés) : un utilisateur se place du côté des films qu’il aime, car cela rend pᵤ·qᵢ grand.`;
				if (s.focus < 0) return base;
				const near = nearestItems(s, s.focus);
				return `${base}

Les plus proches de **${ITEMS[s.focus]}** : ${near
					.slice(0, 2)
					.map((x) => `${ITEMS[x.j]} (distance ${fmt2(x.d)})`)
					.join(', ')}. Voilà une liste « parce que vous avez regardé… ».`;
			},
			task: { prompt: 'Cliquez sur un film de la carte pour voir ses plus proches voisins. Où a atterri *Moonlit Orbit* (une romance de science-fiction) ?' }
		},
		{
			title: 'Le problème du démarrage à froid',
			body: (s) => {
				const g = gusStage(s);
				if (g.k === 0)
					return `**Gus** vient de s’inscrire et n’a encore rien noté.

- **CF** : aucun film en commun, donc aucune similarité, aucun voisin et aucune prédiction.
- **MF** : aucune note, donc son vecteur p n’a jamais été entraîné. Le meilleur repli est **μ + bᵢ**, la même liste « les plus populaires » pour chaque nouveau venu (affichée dans sa ligne).

Les films ont le même problème : un film que personne n’a noté ne peut pas être recommandé.`;
				const detail =
					g.k === 3
						? `Les similarités existent maintenant, son vecteur p est entraîné, et sa ligne devient personnelle.`
						: g.k === 2
							? 'Son vecteur p est maintenant entraîné, mais CF n’a toujours aucune similarité : toutes ses notes sont égales, donc par rapport à sa moyenne elles valent toutes 0. Rendez-les différentes.'
							: 'Une seule note ne suffit pas à CF : avec une seule valeur, sa note centrée sur la moyenne vaut 0 et la similarité cosinus n’est pas définie.';
				return `Gus a **${g.n}** note${g.n > 1 ? 's' : ''}. ${detail}

C’est pourquoi les parcours d’inscription vous demandent de choisir quelques favoris, et pourquoi les nouveaux films sont mis en avant grâce à leurs métadonnées.`;
			},
			task: { prompt: 'Donnez **deux** notes à Gus (cliquez sur ses cases) et regardez ses prédictions changer. Basculez entre CF et MF pour comparer.' }
		},
		{
			title: 'Basé sur le contenu ou collaboratif',
			body: (s) => {
				const p = profile(s, s.user);
				return `Le filtrage **basé sur le contenu** ignore les autres utilisateurs. Il décrit chaque film par ses étiquettes et construit un profil de goûts à partir des propres notes de l’utilisateur : chaque étiquette reçoit la somme de (note − sa moyenne) sur les films qui la portent.

Profil de ${USERS[s.user]} : ${TAGS_FR.map((t, j) => `${t} ${fmt2(p[j])}`).join(', ')}. Le score d’un film est le cosinus entre ses étiquettes et ce profil.

Regardez *Moonlit Orbit* : le contenu donne ${fmt2(contentScore(s, s.user, 5))} (ses étiquettes SF et romance s’annulent), alors que CF voit que les personnes ayant les goûts de ${USERS[s.user]} l’ont bien noté.`;
			},
			quiz: {
				question: 'Un nouveau film, Nebula Run (SF, action), sort sans aucune note. Quelle approche peut le recommander à Ana ?',
				options: ['Le filtrage collaboratif', 'L’approche basée sur le contenu', 'Aucune, tant que personne ne l’a noté'],
				explain: (s) =>
					`Ses étiquettes seules donnent un score de contenu de **${fmt2(contentScore(s, 0, 6))}** pour Ana, son meilleur score. CF et MF n’ont rien sur quoi s’appuyer tant que personne ne l’a noté. Chaque approche couvre l’angle mort de l’autre : les systèmes en production sont donc **hybrides** : contenu (ou [embeddings](concept:embeddings) de textes et d’images) pour les nouveaux films, signaux collaboratifs dès que les données arrivent. On les juge ensuite par des [tests A/B](concept:ab-testing-deployment), pas seulement par l’erreur hors ligne.`
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué : modifiez des notes, choisissez des utilisateurs, remplissez les blancs avec les prédictions CF ou MF, réentraînez et changez λ.

1. **CF basé sur les utilisateurs** : utilisateurs similaires (cosinus centré sur la moyenne), moyenne pondérée de leurs écarts.
2. **Factorisation de matrice** : r̂ = μ + bᵤ + bᵢ + pᵤ·qᵢ, entraînée par SGD sur les cases observées avec une pénalité L2.
3. **Démarrage à froid** : les nouveaux utilisateurs et films n’ont aucun signal. Repli sur la popularité ou le contenu.
4. L’approche **basée sur le contenu** utilise les caractéristiques des films ; les **hybrides** combinent les deux.

Les vrais systèmes sont évalués sur des interactions mises de côté et découpées dans le temps, avec des métriques de classement comme Precision@K ou NDCG@K.`
		}
	]
};

const ar: LessonText<RecState> = {
	title: 'كيف تملأ أنظمة التوصية الفراغات',
	steps: [
		{
			title: 'مصفوفة تقييمات متفرقة',
			body: (s) => {
				const f = filled(s);
				return `قيّم ستة أشخاص ستة أفلام من 1 إلى 5 نجوم. علامة **?** تعني أنهم لم يشاهدوا ذلك الفيلم. هنا **${f.n} خانة من ${f.total}** مملوءة؛ وفي موقع حقيقي تكون النسبة غالبًا أقل من 1%.

مهمة نظام التوصية (recommender system) هي **التنبؤ بالفراغات**، ثم عرض الأفلام غير المشاهدة ذات أعلى تقييم متوقع على كل شخص.

لاحظ النمط: Ana وBen وEli يحبون الأفلام الثلاثة الأولى (خيال علمي)، بينما يفضّل Cara وDev وFay فيلمَي *Paris Kiss* و*Love Letters* (رومانسية).`;
			},
			task: { prompt: 'انقر على أي خانة وأعطها تقييمًا مختلفًا (أو امسحه).' }
		},
		{
			title: 'من لديه ذوق مشابه؟',
			body: (s) => {
				const list = ranked(s);
				const summary = !list.length
					? `**${USERS[s.user]}** لا يشترك مع أي أحد في أي فيلم مُقيَّم، لذا لا يمكن حساب أي تشابه.`
					: `**${USERS[s.user]}** أكثر اتفاقًا مع **${USERS[list[0].v]}** (${fmt2(list[0].sim)}) وأقل اتفاقًا مع **${USERS[list[list.length - 1].v]}** (${fmt2(list[list.length - 1].sim)}).`;
				return `تقوم **التصفية التعاونية** (collaborative filtering) على فكرة واحدة: *من اتفقوا في الماضي سيتفقون مجددًا*.

لقياس الاتفاق، نطرح أولًا من كل مستخدم متوسطه الخاص، فتُحسب الدرجة 3 ممن يعطي عادةً 5 على أنها «عادي». ثم نحسب **تشابه جيب التمام** (cosine similarity) على الأفلام التي قيّمها كلاهما: **+1** يعني الذوق نفسه، و**−1** ذوقًا معاكسًا.

${summary}`;
			},
			task: { prompt: 'انقر على اسم مستخدم آخر لترى مع من يتشارك *هو* الذوق.' }
		},
		{
			title: 'التنبؤ بخانة فارغة من الجيران',
			body: `للتنبؤ بتقييم Ana لفيلم *Love Letters*، جد **أكثر ${NEIGHBOURS} مستخدمين شبهًا بها ممن قيّموه** (أقرب جيرانها، كما في [k-NN](concept:knn)).

ثم ابدأ من متوسط Ana وأضف آراء الجيران موزونة بالتشابه:

r̂ = mean(Ana) + Σ sim·(r − mean(neighbour)) / Σ |sim|

استخدام تقييم الجار *نسبةً إلى متوسطه الخاص* يعني أن الدرجة 3 من مقيّم صارم تُحسب إعجابًا قويًا.`,
			quiz: {
				question: 'لم تشاهد Ana فيلم Love Letters. بماذا ستتنبأ التصفية التعاونية القائمة على المستخدمين؟',
				options: ['نحو 2 أو أقل', 'نحو 3', 'نحو 4 أو أكثر'],
				explain: (s) => {
					const p = cfPredict(s, 0, 4);
					const parts = p.neighbours.map(
						(n) => `${USERS[n.v]} (التشابه ${fmt2(n.sim)}، أعطى ${n.rating}، أي ${n.dev >= 0 ? '+' : '−'}${fmt2(Math.abs(n.dev))} مقارنة بمتوسطه)`
					);
					return `متوسط Ana هو **${fmt2(p.mean)}**. جيرانها الذين قيّموه: ${parts.join(' و')}. كلاهما لم يعجبه الفيلم مقارنةً بتقييماته المعتادة، لذا التنبؤ هو **${fmt1(p.pred)}**. كل خانة فارغة تعرض الآن تنبؤ CF الخاص بها؛ انقر على إحداها لترى تفصيله.`;
				}
			}
		},
		{
			title: 'تحليل المصفوفة: الذوق في بضعة أعداد',
			body: (s) => {
				const m = mfAt(s);
				return `مقارنة كل زوج من المستخدمين تصبح بطيئة مع الملايين منهم. أما **تحليل المصفوفة** (matrix factorization) فيضغط البيانات: يحصل كل مستخدم على متجه قصير **pᵤ** وكل فيلم على متجه **qᵢ** (هنا *k* = 2 عددان فقط لكل منهما)، إضافة إلى انحياز لكل منهما:

r̂ = μ + bᵤ + bᵢ + pᵤ · qᵢ

يكون الجداء النقطي كبيرًا عندما تتوافق أذواق المستخدم الخفية مع سمات الفيلم الخفية. لا أحد يسمّي هذه السمات. إنها تبدأ **عشوائية**، فيكون كل تنبؤ قريبًا من المتوسط العام μ = **${fmt2(m.mu)}**. انقر على خانة لترى مجموعها.`;
			}
		},
		{
			title: 'تعلّم العوامل بـ SGD',
			body: (s) => {
				const m = mfAt(s);
				return `يمر التدريب على التقييمات **المرصودة** فقط. لكل منها يحسب الخطأ e = r − r̂ ويقرّب المتجهين أحدهما من الآخر قليلًا (هذا هو [الانحدار التدرجي](concept:what-is-gradient-descent)، تقييمًا واحدًا في كل مرة):

pᵤ ← pᵤ + η·(e·qᵢ − λ·pᵤ)

qᵢ ← qᵢ + η·(e·pᵤ − λ·qᵢ)

λ عقوبة L2 تُبقي المتجهات صغيرة حتى لا تكتفي بحفظ التقييمات القليلة.

الحقبة **${m.epoch}** من ${EPOCHS}، وRMSE على التقييمات المعروفة **${fmt2(m.rmse)}**. لا يُدرَّب النموذج على الفراغات أبدًا، ومع ذلك تمتلئ.`;
			},
			task: { prompt: 'اضغط **درّب** وراقب الخطأ ينخفض، والفراغات تمتلئ، والأفلام تنتظم على الخريطة.' }
		},
		{
			title: 'قراءة خريطة الأفلام',
			body: (s) => {
				const base = `مع *k* = 2 يكون متجه كل فيلم qᵢ نقطة على الخريطة. لم يخبر أحد النموذج بالأنواع، ومع ذلك **تتقارب الأفلام التي يحبها الأشخاص أنفسهم**. المحاور نفسها ليس لها معنى ثابت: المهم هو الاتجاهات والقرب فقط.

المستخدمون نقاط أيضًا (مربعات): يقع المستخدم في جهة الأفلام التي يحبها، لأن ذلك يجعل pᵤ·qᵢ كبيرًا.`;
				if (s.focus < 0) return base;
				const near = nearestItems(s, s.focus);
				return `${base}

الأقرب إلى **${ITEMS[s.focus]}**: ${near
					.slice(0, 2)
					.map((x) => `${ITEMS[x.j]} (المسافة ${fmt2(x.d)})`)
					.join('، ')}. هذه قائمة «لأنك شاهدت…».`;
			},
			task: { prompt: 'انقر على فيلم في الخريطة لترى أقرب جيرانه. أين استقر *Moonlit Orbit* (فيلم خيال علمي رومانسي)؟' }
		},
		{
			title: 'مشكلة البداية الباردة',
			body: (s) => {
				const g = gusStage(s);
				if (g.k === 0)
					return `**Gus** سجّل للتو ولم يقيّم أي شيء.

- **CF**: لا أفلام مشتركة يعني لا تشابه، فلا جيران ولا تنبؤات.
- **MF**: لا تقييمات يعني أن متجهه p لم يُدرَّب أبدًا. أفضل بديل هو **μ + bᵢ**، أي قائمة «الأكثر شعبية» نفسها لكل وافد جديد (معروضة في صفه).

وللأفلام المشكلة نفسها: الفيلم الذي لم يقيّمه أحد لا يمكن التوصية به.`;
				const detail =
					g.k === 3
						? `صار هناك تشابه الآن، ومتجهه p مدرَّب، وصار صفه شخصيًا.`
						: g.k === 2
							? 'متجهه p مدرَّب الآن، لكن CF ما زالت بلا تشابه: كل تقييماته متساوية، فهي كلها 0 نسبةً إلى متوسطه. اجعلها مختلفة.'
							: 'تقييم واحد لا يكفي CF: مع قيمة واحدة يكون تقييمه المركزي 0 ويكون تشابه جيب التمام غير معرّف.';
				return `لدى Gus **${g.n}** ${g.n > 1 ? 'تقييمات' : 'تقييم'}. ${detail}

لهذا تطلب منك صفحات التسجيل اختيار بعض المفضلات، ولهذا يُروَّج للأفلام الجديدة باستخدام بياناتها الوصفية.`;
			},
			task: { prompt: 'أعطِ Gus **تقييمين** (انقر على خاناته) وراقب تنبؤاته تتغير. بدّل بين CF و MF للمقارنة.' }
		},
		{
			title: 'القائم على المحتوى مقابل التعاوني',
			body: (s) => {
				const p = profile(s, s.user);
				return `التصفية **القائمة على المحتوى** (content-based) تتجاهل المستخدمين الآخرين. تصف كل فيلم بوسومه وتبني ملفًا لذوق المستخدم من تقييماته هو: يحصل كل وسم على مجموع (التقييم − متوسطه) على الأفلام التي تحمله.

ملف ${USERS[s.user]}: ${TAGS_AR.map((t, j) => `${t} ${fmt2(p[j])}`).join('، ')}. درجة الفيلم هي جيب التمام بين وسومه وهذا الملف.

لاحظ *Moonlit Orbit*: يعطيه المحتوى ${fmt2(contentScore(s, s.user, 5))} (وسما الخيال العلمي والرومانسية يلغي أحدهما الآخر)، بينما ترى CF أن أصحاب ذوق ${USERS[s.user]} قيّموه تقييمًا عاليًا.`;
			},
			quiz: {
				question: 'صدر فيلم جديد، Nebula Run (خيال علمي، أكشن)، بلا أي تقييم. أي نهج يمكنه التوصية به لـ Ana؟',
				options: ['التصفية التعاونية', 'النهج القائم على المحتوى', 'لا هذا ولا ذاك، حتى يقيّمه أحد'],
				explain: (s) =>
					`وسومه وحدها تعطي درجة محتوى **${fmt2(contentScore(s, 0, 6))}** لـ Ana، وهي أفضل تطابق لها. أما CF و MF فليس لديهما ما تعتمدان عليه حتى يقيّمه الناس. كل نهج يغطي النقطة العمياء للآخر، لذا فأنظمة الإنتاج **هجينة**: المحتوى (أو [التضمينات](concept:embeddings) للنصوص والصور) للأفلام الجديدة، والإشارات التعاونية حين تصل البيانات. ثم يُحكم عليها بـ[اختبارات A/B](concept:ab-testing-deployment)، لا بالخطأ خارج الخط وحده.`
			}
		},
		{
			title: 'دورك: ساحة التجربة',
			body: `كل شيء مفتوح: عدّل التقييمات، واختر المستخدمين، واملأ الفراغات بتنبؤات CF أو MF، وأعد التدريب، وغيّر λ.

1. **CF القائمة على المستخدمين**: مستخدمون متشابهون (جيب تمام مركزي حول المتوسط)، ومتوسط موزون لانحرافاتهم.
2. **تحليل المصفوفة**: r̂ = μ + bᵤ + bᵢ + pᵤ·qᵢ، يُدرَّب بـ SGD على الخانات المرصودة مع عقوبة L2.
3. **البداية الباردة**: المستخدمون والأفلام الجدد بلا إشارة. ارجع إلى الشعبية أو المحتوى.
4. النهج **القائم على المحتوى** يستخدم ميزات الأفلام؛ و**الأنظمة الهجينة** تجمع بين الاثنين.

تُقيَّم الأنظمة الحقيقية على تفاعلات محجوبة مقسّمة زمنيًا، بمقاييس ترتيب مثل Precision@K أو NDCG@K.`
		}
	]
};

export default { fr, ar };
