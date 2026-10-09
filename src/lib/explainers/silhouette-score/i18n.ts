/**
 * French and Arabic narration for the silhouette-score lesson (same step order as index.ts).
 */
import type { LessonText } from '../types';
import { bestK, labels, nClusters, points, sil, type SilState } from './state';

const f2 = (v: number) => (Number.isFinite(v) ? v.toFixed(2) : '—');
const at = (s: SilState) => {
	const r = sil(s);
	const i = s.selected;
	return { a: r.a[i], b: r.b[i], s: r.s[i], own: labels(s)[i] + 1, nb: r.nearest[i] + 1 };
};
const ownCount = (s: SilState, own: number) => labels(s).filter((l) => l === own - 1).length - 1;

export const fr: LessonText<SilState> = {
	title: 'Comment le score de silhouette note les clusters',
	steps: [
		{
			title: 'Noter un clustering sans les réponses',
			body: (s) => `[K-Means](concept:kmeans) a réparti ces **${points(s).length} points** en **${s.k} clusters**. Est-ce un bon clustering ?

En classification, on comparerait avec les vraies étiquettes. En clustering, il n'y en a généralement pas. Le **score de silhouette** note le résultat à partir des seules distances, en posant une question à chaque point : *suis-je nettement plus proche de mon propre cluster que du meilleur cluster suivant ?*`
		},
		{
			title: 'a(i) : à quelle distance est mon propre cluster ?',
			body: (s) => {
				const v = at(s);
				return `Choisissez un point *i*. **a(i)** est sa distance moyenne à tous les *autres* points de son propre cluster. Elle mesure la **cohésion** : un a(i) petit signifie que le point est bien niché parmi ses voisins de cluster.

Pour le point sélectionné (cluster ${v.own}) : les traits montrent les ${ownCount(s, v.own)} distances, et **a(i) = ${f2(v.a)}**.`;
			},
			task: {
				prompt: 'Cliquez sur quelques points. Où a(i) est-il petit, et où est-il grand ?'
			}
		},
		{
			title: 'b(i) : à quelle distance est le cluster voisin ?',
			body: (s) => {
				const v = at(s);
				return `Mesurez maintenant la distance moyenne de *i* aux points de **chacun des autres clusters** (écrite au centre de chaque cluster). La plus petite est **b(i)** : la distance au cluster *voisin le plus proche*, celui que *i* rejoindrait si son propre cluster n'existait pas.

Elle mesure la **séparation**. Pour le point sélectionné, le cluster voisin le plus proche est le ${v.nb}, donc **b(i) = ${f2(v.b)}** (traits pointillés).`;
			}
		},
		{
			title: 's(i) : un nombre par point',
			body: (s) => {
				const v = at(s);
				return `On combine les deux :

\`s(i) = (b(i) − a(i)) / max(a(i), b(i))\`

Ici : (${f2(v.b)} − ${f2(v.a)}) / ${f2(Math.max(v.a, v.b))} = **${f2(v.s)}**.

- **Proche de +1** : bien plus proche de son propre cluster que de tout autre. Bien placé.
- **Proche de 0** : à peu près aussi proche du cluster voisin. Sur une frontière.
- **Négatif** : plus proche d'un autre cluster que du sien. Probablement mal affecté.`;
			},
			task: {
				prompt: 'Trouvez un point avec **s(i) inférieur à 0.6**. Regardez là où deux clusters se font face.'
			}
		},
		{
			title: 'Un point mal affecté devient négatif',
			body: (s) => {
				const v = at(s);
				return s.override
					? `Le point appartient maintenant au cluster ${v.own}, mais le cluster ${v.nb} est plus proche : a(i) = ${f2(v.a)} est **plus grand** que b(i) = ${f2(v.b)}, donc **s(i) = ${f2(v.s)}**. Une silhouette négative signale un point qui est probablement dans le mauvais cluster.`
					: `Le point entouré a la silhouette la plus basse du jeu de données, **s(i) = ${f2(v.s)}** : il se trouve entre le cluster ${v.own} et le cluster ${v.nb}. Et s'il avait été placé dans le cluster ${v.nb} ?`;
			},
			quiz: {
				question: 'Si l’on déplace ce point dans le cluster voisin, que devient s(i) ?',
				options: ['Il monte vers +1', 'Il reste à peu près le même', 'Il devient négatif'],
				explain: `En réalité, il est un peu plus proche de son cluster d'origine ; après le déplacement, c'est donc son *propre* cluster qui est le plus éloigné : a(i) > b(i), ce qui rend b − a négatif. Les valeurs de silhouette inférieures à 0 permettent de repérer les points mal affectés.`
			}
		},
		{
			title: 'Le diagramme de silhouette',
			body: (s) => {
				const r = sil(s);
				return `Calculez s(i) pour **chaque** point et tracez une barre par point, regroupées par cluster et triées. C'est le **diagramme de silhouette**. La ligne pointillée est la moyenne : le **score de silhouette** du clustering entier, ici **${f2(r.mean)}**.

À surveiller : des clusters dont les barres sont pour la plupart longues et d'épaisseur comparable, et peu de barres sous zéro. Cliquez sur une barre pour retrouver son point.`;
			}
		},
		{
			title: 'Choisir K avec la silhouette moyenne',
			body: (s) => {
				const r = sil(s);
				return `Lancez K-Means pour plusieurs valeurs de K et comparez la silhouette moyenne (graphique de droite). Contrairement à l'inertie, elle ne s'améliore **pas** automatiquement avec plus de clusters : couper un vrai cluster crée deux moitiés proches l'une de l'autre, donc b(i) diminue.

K = **${s.k}** : silhouette moyenne **${f2(r.mean)}**. ${s.k < bestK(s) ? 'Un cluster regroupe en fait deux amas : ses barres sont courtes.' : s.k > bestK(s) ? 'Un vrai amas a été coupé en deux : ces barres s’effondrent vers 0.' : 'C’est le meilleur K : chaque cluster a de longues barres.'}`;
			},
			task: {
				prompt: 'Utilisez le curseur K (ou cliquez sur le graphique) pour trouver le K qui donne la silhouette moyenne la plus élevée.'
			}
		},
		{
			title: 'La silhouette favorise les amas ronds',
			body: (s) =>
				s.mode === 'truth'
					? `Noter les **vraies lunes** donne **${f2(sil(s).mean)}** : moins que le mauvais découpage de K-Means. Les points à l'extrémité d'une lune sont, *en moyenne*, plus proches de l'autre lune que du bout opposé de la leur. Le score suppose des clusters compacts et convexes, il ne peut donc pas récompenser des formes courbes ou en chaîne, comme celles que trouve [DBSCAN](concept:dbscan).`
					: `Sur deux lunes, [K-Means](concept:kmeans) avec K = 2 coupe les deux formes en ligne droite. Son score de silhouette vaut **${f2(sil(s).mean)}**.`,
			quiz: {
				question: 'Notons maintenant le vrai clustering, un cluster par lune. Son score de silhouette sera…',
				options: ['Plus élevé : c’est la bonne réponse', 'Plus bas que le découpage de K-Means', 'Exactement 1'],
				explain: `Le score de silhouette mesure la compacité et la séparation par des distances moyennes, pas la « justesse ». De longs clusters courbes ont un a(i) élevé, si bien que même la bonne réponse peut obtenir un moins bon score qu'une mauvaise réponse bien rangée. Utilisez-le pour comparer des clusterings semblables, en forme d'amas, pas comme une vérité de terrain.`
			}
		},
		{
			title: 'À vous : bac à sable',
			body: (s) => `Tout est débloqué. Récapitulatif :

1. **a(i)** : distance moyenne à mon propre cluster (cohésion).
2. **b(i)** : distance moyenne au cluster voisin le plus proche (séparation).
3. **s(i) = (b − a) / max(a, b)**, de −1 à +1.
4. Moyenne de s(i) sur tous les points = le score de silhouette. Comparez-le selon K.

Actuellement : ${nClusters(s)} clusters, score **${f2(sil(s).mean)}**. Il faut toutes les distances deux à deux (O(n²)) ; sur de gros jeux de données, utilisez donc \`sample_size\` dans scikit-learn. Fonctionne aussi avec les étiquettes du [clustering hiérarchique](concept:hierarchical-clustering) et d'un [GMM](concept:gmm).`
		}
	]
};

export const ar: LessonText<SilState> = {
	title: 'كيف تُقيِّم درجة الظل (silhouette score) العناقيد',
	steps: [
		{
			title: 'تقييم التجميع دون إجابات',
			body: (s) => `قسّمت [K-Means](concept:kmeans) هذه **النقاط الـ ${points(s).length}** إلى **${s.k} عناقيد**. هل هذا تجميع (clustering) جيد؟

في التصنيف (classification) نقارن بالتسميات الحقيقية، أما في التجميع فلا توجد تسميات عادةً. تُقيِّم **درجة الظل (silhouette score)** النتيجة بالاعتماد على المسافات وحدها، إذ تطرح على كل نقطة سؤالًا واحدًا: *هل أنا أقرب بكثير إلى عنقودي من العنقود التالي الأفضل؟*`
		},
		{
			title: 'a(i): ما مدى قرب عنقودي؟',
			body: (s) => {
				const v = at(s);
				return `اختر نقطة *i*. **a(i)** هو متوسط مسافتها إلى جميع النقاط *الأخرى* في عنقودها. وهو يقيس **التماسك (cohesion)**: صِغَر a(i) يعني أن النقطة مستقرة بإحكام بين رفيقاتها في العنقود.

للنقطة المحددة (العنقود ${v.own}): تُظهر الخطوط جميع المسافات الـ ${ownCount(s, v.own)}، و**a(i) = ${f2(v.a)}**.`;
			},
			task: {
				prompt: 'انقر على بعض النقاط. أين يكون a(i) صغيرًا، وأين يكون كبيرًا؟'
			}
		},
		{
			title: 'b(i): ما مدى قرب العنقود التالي الأفضل؟',
			body: (s) => {
				const v = at(s);
				return `قِس الآن متوسط المسافة من *i* إلى نقاط **كل عنقود آخر** (مكتوبًا عند مركز كل عنقود). أصغر هذه القيم هو **b(i)**: المسافة إلى *العنقود المجاور الأقرب*، أي العنقود الذي كانت *i* ستنضم إليه لو لم يكن عنقودها موجودًا.

وهو يقيس **الانفصال (separation)**. بالنسبة للنقطة المحددة، العنقود الآخر الأقرب هو ${v.nb}، لذا **b(i) = ${f2(v.b)}** (الخطوط المتقطعة).`;
			}
		},
		{
			title: 's(i): رقم واحد لكل نقطة',
			body: (s) => {
				const v = at(s);
				return `نجمع بين الاثنين:

\`s(i) = (b(i) − a(i)) / max(a(i), b(i))\`

هنا: (${f2(v.b)} − ${f2(v.a)}) / ${f2(Math.max(v.a, v.b))} = **${f2(v.s)}**.

- **قريب من 1+**: أقرب بكثير إلى عنقودها منها إلى أي عنقود آخر. موضعها جيد.
- **قريب من 0**: قريبة من العنقود المجاور بالقدر نفسه تقريبًا. على حدود بين عنقودين.
- **سالب**: أقرب إلى عنقود آخر منها إلى عنقودها. على الأرجح أُسندت خطأً.`;
			},
			task: {
				prompt: 'جد نقطة قيمة **s(i) فيها أقل من 0.6**. انظر حيث يتقابل عنقودان.'
			}
		},
		{
			title: 'النقطة المُسندة خطأً تصبح سالبة',
			body: (s) => {
				const v = at(s);
				return s.override
					? `تنتمي النقطة الآن إلى العنقود ${v.own}، لكن العنقود ${v.nb} أقرب: a(i) = ${f2(v.a)} **أكبر** من b(i) = ${f2(v.b)}، لذا **s(i) = ${f2(v.s)}**. قيمة الظل السالبة تشير إلى نقطة موجودة على الأرجح في العنقود الخطأ.`
					: `النقطة المُحاطة بحلقة لديها أدنى قيمة ظل في مجموعة البيانات، **s(i) = ${f2(v.s)}**: إنها تقع بين العنقود ${v.own} والعنقود ${v.nb}. ماذا لو وُضعت في العنقود ${v.nb} بدلًا من ذلك؟`;
			},
			quiz: {
				question: 'إذا نُقلت هذه النقطة إلى العنقود المجاور، ماذا يحدث لـ s(i)؟',
				options: ['ترتفع نحو 1+', 'تبقى تقريبًا كما هي', 'تصبح سالبة'],
				explain: `النقطة في الواقع أقرب قليلًا إلى عنقودها الأصلي، لذا بعد النقل يصبح عنقودها *الخاص* هو الأبعد: a(i) > b(i)، مما يجعل b − a سالبًا. قيم الظل الأقل من 0 هي الطريقة التي تكتشف بها النقاط المُسندة خطأً.`
			}
		},
		{
			title: 'مخطط الظل',
			body: (s) => {
				const r = sil(s);
				return `احسب s(i) لـ**كل** نقطة وارسم شريطًا لكل منها، مجمّعة حسب العنقود ومرتّبة. هذا هو **مخطط الظل (silhouette plot)**. الخط المتقطع هو المتوسط: **درجة الظل** للتجميع بأكمله، وهي هنا **${f2(r.mean)}**.

ما الذي تبحث عنه: عناقيد أشرطتها طويلة في معظمها وذات سُمك متقارب، وقليل من الأشرطة تحت الصفر. انقر على شريط لتجد نقطته.`;
			}
		},
		{
			title: 'اختيار K بمتوسط الظل',
			body: (s) => {
				const r = sil(s);
				return `شغّل K-Means لعدة قيم من K وقارن متوسط الظل (المخطط الثاني). على عكس القصور الذاتي (inertia)، **لا** يتحسن تلقائيًا بزيادة عدد العناقيد: تقسيم عنقود حقيقي يُنتج نصفين قريبين من بعضهما، فيتقلص b(i).

K = **${s.k}**: متوسط الظل **${f2(r.mean)}**. ${s.k < bestK(s) ? 'أحد العناقيد هو في الحقيقة كتلتان: أشرطته قصيرة.' : s.k > bestK(s) ? 'قُسِّمت كتلة حقيقية: تلك الأشرطة تنهار نحو 0.' : 'هذا هو أفضل K: كل عنقود أشرطته طويلة.'}`;
			},
			task: {
				prompt: 'استخدم شريط تمرير K (أو انقر على المخطط) لتجد قيمة K ذات أعلى متوسط ظل.'
			}
		},
		{
			title: 'الظل يحابي الكتل المستديرة',
			body: (s) =>
				s.mode === 'truth'
					? `تقييم **الهلالين الحقيقيين** يعطي **${f2(sil(s).mean)}**: أقل من تقسيم K-Means الخاطئ. النقاط عند طرف أحد الهلالين أقرب، *في المتوسط*، إلى الهلال الآخر منها إلى الطرف البعيد من هلالها. تفترض الدرجة عناقيد متراصة ومحدّبة (convex)، لذا لا يمكنها مكافأة الأشكال المنحنية أو المتسلسلة، مثل تلك التي يجدها [DBSCAN](concept:dbscan).`
					: `على هلالين، يقطع [K-Means](concept:kmeans) مع K = 2 الشكلين بخط مستقيم. درجة الظل (silhouette score) له هي **${f2(sil(s).mean)}**.`,
			quiz: {
				question: 'لنقيّم الآن التجميع الحقيقي، عنقود لكل هلال. ستكون درجة الظل له…',
				options: ['أعلى: إنه الإجابة الصحيحة', 'أقل من تقسيم K-Means', '1 تمامًا'],
				explain: `تقيس درجة الظل (silhouette score) التراص والانفصال عبر متوسط المسافات، لا «الصحة». العناقيد الطويلة المنحنية لديها a(i) كبير، لذا حتى الإجابة الصحيحة قد تحصل على درجة أسوأ من إجابة خاطئة مرتّبة. استخدمها لمقارنة تجميعات متشابهة على شكل كتل، لا كحقيقة مرجعية (ground truth).`
			}
		},
		{
			title: 'دورك: ساحة التجريب',
			body: (s) => `كل شيء متاح الآن. للتلخيص:

1. **a(i)**: متوسط المسافة إلى عنقودي (التماسك).
2. **b(i)**: متوسط المسافة إلى أقرب عنقود آخر (الانفصال).
3. **s(i) = (b − a) / max(a, b)**، من 1− إلى 1+.
4. متوسط s(i) على جميع النقاط = درجة الظل (silhouette score). قارنها عبر قيم K.

الحالي: ${nClusters(s)} عناقيد، والدرجة **${f2(sil(s).mean)}**. تتطلب جميع المسافات الزوجية (O(n²))، لذا استخدم \`sample_size\` في scikit-learn مع مجموعات البيانات الكبيرة. تصلح أيضًا لتسميات [التجميع الهرمي](concept:hierarchical-clustering) و[GMM](concept:gmm).`
		}
	]
};

export default { fr, ar };
