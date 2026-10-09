/**
 * French and Arabic narration for the K-Means lesson (same step order as index.ts).
 */
import { fmt } from '#lib/viz/canvas.ts';
import type { LessonText } from '../types';
import { currentInertia, type KMeansState } from './state';

const fr: LessonText<KMeansState> = {
	title: 'Comment K-Means trouve des clusters',
	steps: [
		{
			title: 'Des points sans étiquettes',
			body: `Voici 280 points, par exemple des clients placés selon leurs *visites par mois* et leur *panier moyen*. Personne ne nous a dit à quel groupe appartient chaque point.

Votre œil repère tout de suite quelques amas. K-Means les trouve en répétant **deux gestes simples**, encore et encore.`
		},
		{
			title: 'Choisir K, poser K centroïdes',
			body: `K-Means a besoin d'une seule chose de votre part au départ : **K**, le nombre de clusters. Ici K = 4.

Il commence par placer K **centroïdes** (les grands marqueurs) sur des points choisis au hasard. Ils ne signifient encore rien : ce sont des suppositions qui vont bouger.`
		},
		{
			title: 'Geste 1 : affecter',
			body: `Chaque point rejoint le **centroïde le plus proche** et prend sa couleur. Les zones ombrées montrent quelle partie du plan appartient à chaque centroïde.

Cette étape ne change que les étiquettes. Les centroïdes restent en place.`,
			task: {
				prompt: 'Faites glisser un centroïde et regardez les points changer de camp pendant qu’il bouge.'
			}
		},
		{
			title: 'Geste 2 : mettre à jour',
			body: (s) => `Chaque centroïde saute à la **position moyenne** des points qui viennent de le rejoindre. Le trait discret montre de combien chacun s'est déplacé.

K-Means évalue un partitionnement par son **inertie** : la somme des distances au carré entre chaque point et son centroïde. Plus elle est basse, plus les clusters sont compacts. L'inertie vaut maintenant **${fmt(currentInertia(s))}**.`
		},
		{
			title: 'Répéter jusqu’à ce que plus rien ne change',
			body: (s) => `On enchaîne : affecter, mettre à jour, affecter, mettre à jour… Chaque geste ne peut que faire baisser l'inertie (ou la laisser identique), donc le processus s'arrête toujours : à un moment, plus aucun point ne change de cluster.

${s.converged ? `**Convergence après ${s.iteration} itérations**, avec une inertie de ${fmt(currentInertia(s))}.` : `Itération **${s.iteration}**, inertie **${fmt(currentInertia(s))}**.`}`,
			task: { prompt: 'Appuyez sur **Lancer** (ou plusieurs fois sur **Pas**) jusqu’à ce que K-Means converge.' }
		},
		{
			title: 'Est-ce toujours la meilleure réponse ?',
			body: `Revenez deux étapes en arrière et regardez où les centroïdes ont démarré : deux d'entre eux sont partis du même amas, et aucun de celui en bas à droite. K-Means s'en est quand même sorti cette fois-ci.`,
			quiz: {
				question: 'K-Means se remet-il toujours d’un aussi mauvais départ ?',
				options: [
					'Oui : l’inertie ne fait que baisser, donc il atteint toujours le meilleur partitionnement',
					'Non : il peut converger vers une réponse nettement moins bonne',
					'Seulement si on le laisse tourner assez d’itérations'
				],
				explain: (s) =>
					`K-Means ne fait que **descendre** depuis son point de départ, il peut donc s'arrêter dans un *minimum local*, et des itérations supplémentaires n'y changent rien une fois que plus rien ne bouge. Ce run est parti autrement : un vrai cluster a été coupé en deux tandis que deux autres ont été fusionnés. L'inertie finale vaut **${fmt(currentInertia(s))}**, environ 3× pire qu'avant.`
			}
		},
		{
			title: 'La parade : k-means++ et plusieurs redémarrages',
			body: `Deux défenses classiques, toutes deux activées par défaut dans scikit-learn :

**k-means++** choisit des centroïdes de départ éloignés les uns des autres : chaque nouveau centroïde est tiré avec une probabilité proportionnelle au carré de sa distance aux centroïdes déjà choisis.

**n_init** exécute tout l'algorithme plusieurs fois depuis des départs différents et garde le run dont l'inertie est la plus basse.`,
			task: {
				prompt: 'Basculez entre **Aléatoire** et **k-means++** et appuyez plusieurs fois sur **Nouveau départ**. Lequel reste bloqué le plus souvent ?'
			}
		},
		{
			title: 'Choisir K : le coude',
			body: (s) => `Et si vous ne connaissez pas K ? L'inertie diminue **toujours** quand K augmente (avec K = 280, chaque point forme son propre cluster et l'inertie vaut 0) : impossible de simplement prendre la plus basse.

À la place, tracez l'inertie en fonction de K et cherchez le **coude** : le point où ajouter un cluster ne rapporte plus grand-chose. K actuel = **${s.k}**.`,
			task: {
				prompt: 'Utilisez le curseur K (ou cliquez sur le graphique du coude) pour placer K au niveau du coude.'
			}
		},
		{
			title: 'Là où K-Means échoue',
			body: `K-Means trace des **frontières droites** à mi-chemin entre les centroïdes : il suppose donc des clusters ronds et de taille comparable.

Sur ces deux lunes imbriquées, il coupe tout droit à travers les deux formes. Pour ce genre de formes, utilisez [DBSCAN](concept:dbscan), qui suit la densité. Pour des amas étirés ou qui se chevauchent, un [mélange gaussien](concept:gmm) fonctionne mieux.`,
			task: {
				prompt: 'Essayez aussi le jeu de données **Inégal** : un grand cluster étalé et trois clusters serrés.'
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué. Récapitulatif :

1. Choisir K et placer K centroïdes de départ (avec k-means++).
2. **Affecter** chaque point à son centroïde le plus proche.
3. **Mettre à jour** chaque centroïde à la moyenne de ses points.
4. Répéter 2–3 jusqu'à ce qu'aucun point ne change de cluster.

Pensez à **mettre vos variables à l'échelle** d'abord. K-Means utilise les distances brutes : une variable mesurée en milliers écrase une variable mesurée en fractions.`
		}
	]
};

const ar: LessonText<KMeansState> = {
	title: 'كيف يجد K-Means العناقيد',
	steps: [
		{
			title: 'نقاط بلا تسميات',
			body: `هذه 280 نقطة، لنقل إنها عملاء موزَّعون حسب *عدد الزيارات في الشهر* و*متوسط قيمة السلة*. لم يخبرنا أحد إلى أي مجموعة تنتمي كل نقطة.

تلاحظ عينك بعض التكتلات فورًا. أما K-Means فيجدها بتكرار **خطوتين بسيطتين** مرة بعد مرة.`
		},
		{
			title: 'اختر K وضع K مراكز',
			body: `يحتاج K-Means منك شيئًا واحدًا في البداية: **K**، أي عدد العناقيد (clusters). هنا K = 4.

يبدأ بوضع K **مراكز** (centroids) (العلامات الكبيرة) على نقاط مختارة عشوائيًا. لا تعني شيئًا بعد، فهي مجرد تخمينات ستتحرك.`
		},
		{
			title: 'الخطوة 1: الإسناد',
			body: `تنضم كل نقطة إلى **أقرب مركز** وتأخذ لونه. تُظهر المناطق المظللة أي جزء من المستوى يتبع كل مركز.

هذه الخطوة تغيّر التسميات فقط، أما المراكز فتبقى في أماكنها.`,
			task: {
				prompt: 'اسحب أحد المراكز وراقب النقاط وهي تنتقل من جهة إلى أخرى أثناء تحركه.'
			}
		},
		{
			title: 'الخطوة 2: التحديث',
			body: (s) => `يقفز كل مركز إلى **الموضع المتوسط** للنقاط التي انضمت إليه للتو. يُظهر الخط الباهت المسافة التي قطعها كل مركز.

يقيّم K-Means التجميع بمقياس **العطالة** (inertia): مجموع مربعات المسافات بين كل نقطة ومركزها. كلما قلّت كانت العناقيد أكثر تراصًّا. العطالة الآن **${fmt(currentInertia(s))}**.`
		},
		{
			title: 'كرّر حتى لا يتغير شيء',
			body: (s) => `الآن: إسناد، تحديث، إسناد، تحديث… كل خطوة لا يمكنها إلا أن تُنقص العطالة (أو تتركها كما هي)، لذلك تتوقف العملية دائمًا: في لحظة ما لن تنتقل أي نقطة إلى عنقود آخر.

${s.converged ? `**تقارب بعد ${s.iteration} تكرارات** بعطالة ${fmt(currentInertia(s))}.` : `التكرار **${s.iteration}**، العطالة **${fmt(currentInertia(s))}**.`}`,
			task: { prompt: 'اضغط **تشغيل** (أو **خطوة** عدة مرات) حتى يتقارب K-Means.' }
		},
		{
			title: 'هل هذه دائمًا أفضل إجابة؟',
			body: `ارجع خطوتين إلى الوراء وانظر من أين انطلقت المراكز: بدأ اثنان منها في التكتل نفسه، ولم يبدأ أي منها في التكتل السفلي الأيمن. ومع ذلك نجح K-Means في ترتيب الأمور هذه المرة.`,
			quiz: {
				question: 'هل يتعافى K-Means دائمًا من بداية سيئة كهذه؟',
				options: [
					'نعم: العطالة تواصل الانخفاض، لذا يصل دائمًا إلى أفضل تجميع',
					'لا: قد يتقارب نحو إجابة أسوأ بوضوح',
					'فقط إذا تركته يعمل لعدد كافٍ من التكرارات'
				],
				explain: (s) =>
					`لا يتحرك K-Means إلا **نزولًا** من نقطة انطلاقه، لذلك قد يستقر في *قيمة صغرى محلية* (local minimum)، ولن تفيد التكرارات الإضافية بعد أن يتوقف كل شيء عن التغير. هذا التشغيل بدأ بشكل مختلف: انقسم عنقود حقيقي إلى اثنين بينما اندمج عنقودان آخران. العطالة النهائية **${fmt(currentInertia(s))}**، أي أسوأ بنحو 3 مرات من قبل.`
			}
		},
		{
			title: 'الحل: k-means++ وعدة إعادات تشغيل',
			body: `دفاعان معياريان، كلاهما مفعَّل افتراضيًا في scikit-learn:

**k-means++** يختار مراكز بداية متباعدة: يُسحب كل مركز جديد باحتمال يتناسب مع مربع بعده عن المراكز المختارة سابقًا.

**n_init** يشغّل الخوارزمية كاملة عدة مرات من بدايات مختلفة ويحتفظ بالتشغيل ذي العطالة الأدنى.`,
			task: {
				prompt: 'بدّل بين **عشوائي** و**k-means++** واضغط **بداية جديدة** عدة مرات. أيهما يعلق أكثر؟'
			}
		},
		{
			title: 'اختيار K: طريقة المرفق',
			body: (s) => `ماذا لو لم تكن تعرف K؟ العطالة تنخفض **دائمًا** كلما زاد K (عند K = 280 تصبح كل نقطة عنقودًا مستقلًا والعطالة 0)، لذا لا يمكنك ببساطة اختيار الأدنى.

بدلًا من ذلك، ارسم العطالة مقابل K وابحث عن **المرفق** (elbow): النقطة التي يتوقف عندها إضافة عنقود جديد عن تقديم فائدة تُذكر. قيمة K الحالية = **${s.k}**.`,
			task: {
				prompt: 'استخدم شريط K (أو انقر على مخطط المرفق) لوضع K عند المرفق.'
			}
		},
		{
			title: 'أين يفشل K-Means',
			body: `يرسم K-Means **حدودًا مستقيمة** في منتصف المسافة بين المراكز، لذا يفترض أن العناقيد كتل مستديرة متقاربة الحجم.

على هذين الهلالين المتشابكين يقطع مستقيمًا عبر الشكلين. لأشكال كهذه استخدم [DBSCAN](concept:dbscan) الذي يتبع الكثافة. وللكتل الممتدة أو المتداخلة يعمل [نموذج الخليط الغاوسي](concept:gmm) بشكل أفضل.`,
			task: {
				prompt: 'جرّب أيضًا مجموعة البيانات **غير متوازنة**: عنقود كبير منتشر وثلاثة عناقيد متراصة.'
			}
		},
		{
			title: 'دورك: ساحة التجربة',
			body: `كل شيء متاح الآن. للتلخيص:

1. اختر K وضع K مراكز بداية (استخدم k-means++).
2. **أسند** كل نقطة إلى أقرب مركز.
3. **حدّث** كل مركز ليصبح متوسط نقاطه.
4. كرّر 2–3 حتى لا تنتقل أي نقطة إلى عنقود آخر.

تذكّر أن **توحّد مقاييس الميزات** (feature scaling) أولًا. يستخدم K-Means المسافات الخام، فميزة تُقاس بالآلاف تطغى على ميزة تُقاس بالكسور.`
		}
	]
};

export default { fr, ar };
