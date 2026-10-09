/**
 * French and Arabic narration for the DBSCAN lesson (same step order as index.ts).
 */
import type { LessonText } from '../types';
import { growDone, points, result, type DbscanState } from './state';

const e2 = (v: number) => v.toFixed(2);
const nb = (s: DbscanState) => (s.selected >= 0 ? result(s).nbrs[s.selected].length : 0);

export const fr: LessonText<DbscanState> = {
	title: 'Comment DBSCAN trouve des clusters grâce à la densité',
	steps: [
		{
			title: 'Les clusters sont des endroits peuplés',
			body: (s) => `Voici **${points(s).length} points sans étiquette** : deux groupes courbes imbriqués l'un dans l'autre, plus quelques points isolés éparpillés autour.

[K-Means](concept:kmeans) vous demanderait combien il y a de clusters, puis tracerait des frontières droites entre des amas ronds : il couperait donc chaque lune en deux.

DBSCAN pose une autre question pour chaque point : **est-il dans un endroit peuplé ?** Pensez aux lumières des villes vues de l'espace. Les zones denses de lumières sont des villes, une ferme isolée n'est que du bruit. Un cluster s'étend partout où la foule continue.`
		},
		{
			title: 'Regarder autour de chaque point : le ε-voisinage',
			body: (s) => `DBSCAN a deux réglages. Le premier est un rayon, **ε** (epsilon). Le **ε-voisinage** d'un point est tout ce qui se trouve à une distance d'au plus ε : le cercle tracé sur le graphique.

Le point mis en évidence a **${nb(s)} points** dans son cercle de rayon ε = ${e2(s.eps)}, lui-même compris. Les points au milieu d'une lune ont des cercles bien remplis ; les points isolés en ont de presque vides.`,
			task: {
				prompt: 'Cliquez sur au moins **3 points** : certains à l’intérieur d’une lune, d’autres isolés, loin de tout. Essayez aussi le curseur ε.'
			}
		},
		{
			title: 'Points cœurs : assez entourés',
			body: (s) => {
				const r = result(s);
				return `Le second réglage est **minPts**. Un point est un **point cœur** si son ε-voisinage contient au moins minPts points (lui-même compris, comme le \`min_samples\` de scikit-learn).

Avec ε = ${e2(s.eps)} et minPts = ${s.minPts}, **${r.counts.core} points sur ${r.kind.length}** sont des points cœurs (pleins). Les points cœurs se trouvent dans l'intérieur dense d'un cluster.`;
			},
			task: {
				prompt: 'Montez **minPts** à 8 ou plus et regardez les points cœurs disparaître des parties les plus fines des lunes.'
			}
		},
		{
			title: 'Points frontières et bruit',
			body: (s) => {
				const r = result(s);
				return `Chaque point qui n'est pas un point cœur reçoit l'une de ces deux étiquettes :

- **Frontière** (anneau creux) : pas assez entouré lui-même, mais dans le cercle ε d'au moins un point cœur. Il se trouve au bord d'un cluster.
- **Bruit** (×) : pas un point cœur, et aucun point cœur à proximité. DBSCAN lui donne l'étiquette \`-1\` et ne le met dans aucun cluster.

En ce moment : **${r.counts.core} cœurs, ${r.counts.border} frontières, ${r.counts.noise} bruit**. Cette détection du bruit intégrée explique pourquoi DBSCAN sert aussi à la détection d'anomalies, aux côtés d'[Isolation Forest](concept:isolation-forest).`;
			},
			quiz: {
				question: 'Le point marqué « ? » n’a que 3 points dans son cercle (minPts = 5), mais l’un d’eux est un point cœur. Qu’est-ce que c’est ?',
				options: ['Un point cœur', 'Un point frontière', 'Du bruit'],
				explain: `Ce n'est pas un point cœur (3 < 5), mais il se trouve à moins de ε d'un point cœur : il est donc **atteignable** depuis le cluster et le rejoint comme point **frontière**. Seuls les points sans aucun point cœur à moins de ε sont du bruit.`
			}
		},
		{
			title: 'Faire grandir les clusters de cœur en cœur',
			body: (s) => {
				const r = result(s);
				const done = growDone(s);
				const shown = r.order.slice(0, s.grow);
				const c = shown.length ? shown[shown.length - 1].c + 1 : 0;
				return `Maintenant ε = ${e2(s.eps)}. Pour construire les clusters, DBSCAN prend un point cœur non visité, ouvre un nouveau cluster et y ajoute tout ce qui est dans son cercle. Chaque point **cœur** atteint transmet le cluster à ses propres voisins ; les points **frontières** le rejoignent mais ne le transmettent pas. Quand plus rien de nouveau n'est atteignable, le cluster est complet et DBSCAN passe au point cœur non visité suivant.

Les points reliés de cette façon sont **atteignables par densité** (*density-reachable*). C'est pourquoi un cluster peut prendre n'importe quelle forme : il lui suffit d'être dense tout le long du chemin.

${done ? `**Terminé : ${r.nClusters} clusters**, ${r.counts.noise} points laissés comme bruit.` : `Le cluster **${c || 1}** grandit : ${s.grow} points sur ${r.order.length} réclamés.`}`;
			},
			task: {
				prompt: 'Appuyez quelques fois sur **Étendre** pour suivre un point cœur à la fois, puis sur **Lecture** jusqu’à ce que tous les clusters soient trouvés.'
			}
		},
		{
			title: 'Régler ε',
			body: (s) => {
				const r = result(s);
				return `ε est le réglage qui compte le plus. Trop petit, même les vrais clusters paraissent clairsemés : ils éclatent en fragments et beaucoup de points deviennent du bruit. Trop grand, les cercles franchissent l'écart et des clusters distincts fusionnent en un seul.

ε = **${e2(s.eps)}**, minPts = ${s.minPts} : **${r.nClusters} cluster${r.nClusters > 1 ? 's' : ''}**, ${r.counts.noise} points de bruit.`;
			},
			task: {
				prompt: 'Trouvez un ε qui donne exactement **2 clusters** (un par lune) avec au plus **10** points de bruit. Puis augmentez ε jusqu’à ce qu’ils fusionnent.'
			}
		},
		{
			title: 'Des formes que K-Means ne sait pas suivre',
			body: (s) => `Deux anneaux, l'un dans l'autre. Avec ε = ${e2(s.eps)}, DBSCAN fait le tour de chaque anneau en passant par ses points cœurs et trouve **${result(s).nClusters} clusters**, sans qu'on lui dise combien chercher.

${s.view === 'kmeans' ? `**K-Means avec K = 2** place un centroïde de chaque côté et coupe le plan par une ligne droite : chaque « cluster » est donc une moitié de l'anneau intérieur plus une moitié de l'anneau extérieur.` : `Chaque anneau forme une seule foule connectée, même si son centre est loin de la plupart de ses points.`}`,
			quiz: {
				question: 'Que fera K-Means avec K = 2 sur ces deux anneaux ?',
				options: [
					'Trouver l’anneau intérieur et l’anneau extérieur, comme DBSCAN',
					'Couper les deux anneaux en ligne droite, en les mélangeant',
					'Mettre tous les points dans un seul cluster'
				],
				explain: `K-Means affecte chaque point au **centroïde le plus proche** : ses clusters sont donc toujours séparés par des lignes droites. Les deux centroïdes finissent près du milieu, chacun s'emparant d'un côté du plan. Utilisez le sélecteur pour comparer les deux.`
			}
		},
		{
			title: 'Là où DBSCAN peine : une densité inégale',
			body: (s) => {
				const r = result(s);
				return `Un seul ε doit convenir à tout le jeu de données. Ici, il y a deux clusters **serrés** (en haut à gauche) et un cluster **étalé** (en bas à droite).

ε = ${e2(s.eps)} : **${r.nClusters} clusters**, ${r.counts.noise} points de bruit. ${s.eps < 0.15 ? 'Les clusters serrés sont trouvés, mais une grande partie du cluster étalé est rejetée comme bruit.' : 'Le cluster étalé est trouvé, mais les deux clusters serrés ont fusionné en un seul.'}

Quand les densités varient beaucoup, essayez HDBSCAN (qui fait varier ε automatiquement), les [mélanges gaussiens](concept:gmm) ou le [clustering hiérarchique](concept:hierarchical-clustering).`;
			},
			quiz: {
				question: 'Un ε plus grand peut-il capturer le cluster étalé tout en gardant séparés les deux clusters serrés ?',
				options: [
					'Oui, il existe un ε qui trouve correctement les trois',
					'Non : dès que ε est assez grand pour le cluster clairsemé, les clusters serrés fusionnent',
					'Oui, mais seulement si on augmente aussi minPts'
				],
				explain: `L'écart entre les clusters serrés est *plus petit* que l'espacement à l'intérieur du cluster clairsemé. Tout ε assez large pour relier le cluster clairsemé franchit aussi cet écart : à ε = 0.22, la paire serrée devient un seul cluster. Faites glisser ε vous-même pour vérifier.`
			}
		},
		{
			title: 'Choisir ε : le graphique des k-distances',
			body: (s) => `Une astuce classique : pour chaque point, mesurez la distance à son **${s.minPts - 1}e plus proche voisin** (minPts − 1), puis triez ces distances. C'est la courbe ci-dessous.

Un point est un point cœur exactement quand cette distance est **≤ ε** : la ligne sépare donc les points cœurs (en dessous) des autres. La courbe reste basse à l'intérieur des clusters, puis s'envole pour les points isolés. Placez ε près de ce **coude** : ici, ε = ${e2(s.eps)} donne ${result(s).nClusters} clusters et ${result(s).counts.noise} points de bruit.`,
			task: {
				prompt: 'Cliquez ou faites glisser sur le graphique des k-distances pour placer ε au coude (jusqu’à ce que les lunes forment 2 clusters).'
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué. Récapitulatif :

1. Choisissez **ε** (le rayon) et **minPts** (normalisez d'abord vos variables, car ε est une distance brute).
2. Les points qui ont ≥ minPts voisins à moins de ε sont des **cœurs**.
3. Les clusters grandissent de cœur en cœur ; les points non cœurs qu'ils atteignent sont des **frontières**.
4. Tout le reste est du **bruit** (étiquette \`-1\`).

Pas de K à choisir, n'importe quelle forme, des valeurs aberrantes signalées gratuitement. Le prix : une seule densité globale, et des distances peu fiables en grande dimension. Pour évaluer le résultat sans étiquettes, voyez le [score de silhouette](concept:silhouette-score) (il favorise les clusters ronds : utilisez-le avec prudence ici).`
		}
	]
};

export const ar: LessonText<DbscanState> = {
	title: 'كيف يجد DBSCAN العناقيد اعتمادًا على الكثافة',
	steps: [
		{
			title: 'العناقيد أماكن مزدحمة',
			body: (s) => `أمامك **${points(s).length} نقطة غير موسومة**: مجموعتان منحنيتان متداخلتان، إضافة إلى بعض النقاط الشاردة المتناثرة حولهما.

تحتاج خوارزمية [K-Means](concept:kmeans) إلى أن تخبرها بعدد العناقيد (clusters)، ثم ترسم حدودًا مستقيمة بين كتل مستديرة، فتشطر كل هلال إلى نصفين.

أما DBSCAN فيطرح سؤالًا مختلفًا عن كل نقطة: **هل هي في مكان مزدحم؟** تخيّل أضواء المدن كما تُرى من الفضاء: البقع الكثيفة من الأضواء مدن، والمزرعة المنعزلة مجرد ضوضاء. يمتد العنقود حيثما يستمر الازدحام.`
		},
		{
			title: 'النظر حول كل نقطة: جوار ε',
			body: (s) => `لـ DBSCAN إعدادان. الأول نصف قطر، **ε** (إبسيلون). **جوار ε** (ε-neighbourhood) لنقطة ما هو كل ما يقع على مسافة لا تتجاوز ε منها: الدائرة المرسومة على المخطط.

النقطة المميَّزة لديها **${nb(s)} نقطة** داخل دائرتها التي نصف قطرها ε = ${e2(s.eps)}، بما فيها النقطة نفسها. النقاط في وسط الهلال دوائرها مكتظة، أما النقاط الشاردة فدوائرها شبه فارغة.`,
			task: {
				prompt: 'انقر على **3 نقاط** على الأقل: بعضها داخل هلال، وبعضها شارد بعيد عن كل شيء. جرّب منزلق ε أيضًا.'
			}
		},
		{
			title: 'النقاط المركزية: مزدحمة بما يكفي',
			body: (s) => {
				const r = result(s);
				return `الإعداد الثاني هو **minPts**. تكون النقطة **نقطة مركزية** (core point) إذا احتوى جوار ε الخاص بها على minPts نقطة على الأقل (بما فيها النقطة نفسها، كما في \`min_samples\` في scikit-learn).

مع ε = ${e2(s.eps)} و minPts = ${s.minPts}، هناك **${r.counts.core} من أصل ${r.kind.length}** نقطة مركزية (مملوءة). تقع النقاط المركزية في الداخل الكثيف للعنقود.`;
			},
			task: {
				prompt: 'ارفع **minPts** إلى 8 أو أكثر وراقب اختفاء النقاط المركزية من الأجزاء الأرقّ في الهلالين.'
			}
		},
		{
			title: 'النقاط الحدّية والضوضاء',
			body: (s) => {
				const r = result(s);
				return `كل نقطة غير مركزية تحصل على أحد وسمين:

- **حدّية** (border) (حلقة مفرغة): ليست مزدحمة بذاتها، لكنها داخل دائرة ε لنقطة مركزية واحدة على الأقل. تقع على طرف العنقود.
- **ضوضاء** (noise) (×): ليست مركزية، ولا توجد نقطة مركزية قريبة منها. يعطيها DBSCAN الوسم \`-1\` ويستبعدها من كل العناقيد.

الآن: **${r.counts.core} مركزية، ${r.counts.border} حدّية، ${r.counts.noise} ضوضاء**. اكتشاف الضوضاء المدمج هذا هو سبب استخدام DBSCAN أيضًا في كشف الشذوذ (anomaly detection)، إلى جانب [Isolation Forest](concept:isolation-forest).`;
			},
			quiz: {
				question: 'النقطة المعلَّمة بـ «؟» لديها 3 نقاط فقط داخل دائرتها (minPts = 5)، لكن إحداها نقطة مركزية. ما نوعها؟',
				options: ['نقطة مركزية', 'نقطة حدّية', 'ضوضاء'],
				explain: `ليست مركزية (3 < 5)، لكنها تقع ضمن مسافة ε من نقطة مركزية، لذا فهي **قابلة للوصول** (reachable) من العنقود وتنضم إليه كنقطة **حدّية**. وحدها النقاط التي لا توجد ضمن ε منها أي نقطة مركزية تُعدّ ضوضاء.`
			}
		},
		{
			title: 'تنمية العناقيد عبر النقاط المركزية',
			body: (s) => {
				const r = result(s);
				const done = growDone(s);
				const shown = r.order.slice(0, s.grow);
				const c = shown.length ? shown[shown.length - 1].c + 1 : 0;
				return `الآن ε = ${e2(s.eps)}. لبناء العناقيد يأخذ DBSCAN نقطة مركزية لم تُزَر بعد، ويبدأ عنقودًا جديدًا، ويضيف إليه كل ما في دائرتها. كل نقطة **مركزية** يصل إليها تمرّر العنقود إلى جيرانها؛ أما النقاط **الحدّية** فتنضم إليه لكنها لا تمرّره. وحين لا يبقى شيء جديد يمكن الوصول إليه، يكتمل العنقود وينتقل DBSCAN إلى النقطة المركزية التالية التي لم تُزَر.

النقاط المترابطة بهذه الطريقة **قابلة للوصول كثافيًا** (density-reachable). لهذا يمكن للعنقود أن ينحني بأي شكل: يكفي أن يكون مزدحمًا على طول الطريق.

${done ? `**انتهى: ${r.nClusters} عناقيد**، و ${r.counts.noise} نقطة بقيت ضوضاء.` : `العنقود **${c || 1}** ينمو: ${s.grow} من أصل ${r.order.length} نقطة تم ضمها.`}`;
			},
			task: {
				prompt: 'اضغط **توسيع** بضع مرات لتتبّع نقطة مركزية واحدة في كل مرة، ثم **تشغيل** حتى تُكتشف كل العناقيد.'
			}
		},
		{
			title: 'ضبط ε',
			body: (s) => {
				const r = result(s);
				return `ε هو المقبض الأهم. إذا كان صغيرًا جدًا بدت حتى العناقيد الحقيقية متفرقة: تتفتت إلى أجزاء وتصبح نقاط كثيرة ضوضاء. وإذا كان كبيرًا جدًا امتدت الدوائر عبر الفجوة، فتندمج العناقيد المنفصلة في عنقود واحد.

ε = **${e2(s.eps)}**، minPts = ${s.minPts}: **عدد العناقيد ${r.nClusters}**، و ${r.counts.noise} نقطة ضوضاء.`;
			},
			task: {
				prompt: 'جد قيمة ε تعطي **عنقودين** بالضبط (واحد لكل هلال) مع **10** نقاط ضوضاء على الأكثر. ثم ارفع ε حتى يندمجا.'
			}
		},
		{
			title: 'أشكال لا يستطيع K-Means تتبّعها',
			body: (s) => `حلقتان، إحداهما داخل الأخرى. مع ε = ${e2(s.eps)}، يدور DBSCAN حول كل حلقة عبر نقاطها المركزية ويجد **${result(s).nClusters} عناقيد**، دون أن يُقال له كم عنقودًا يبحث عنه.

${s.view === 'kmeans' ? `**K-Means مع K = 2** يضع مركزًا (centroid) على كل جانب ويقسم المستوى بخط مستقيم، فيكون كل «عنقود» نصف الحلقة الداخلية مع نصف الحلقة الخارجية.` : `كل حلقة حشد واحد متصل، رغم أن مركزها بعيد عن معظم نقاطها.`}`,
			quiz: {
				question: 'ماذا سيفعل K-Means مع K = 2 على هاتين الحلقتين؟',
				options: [
					'يجد الحلقة الداخلية والحلقة الخارجية، تمامًا مثل DBSCAN',
					'يقطع الحلقتين بخط مستقيم، فيخلط بينهما',
					'يضع كل النقاط في عنقود واحد'
				],
				explain: `يُسند K-Means كل نقطة إلى **أقرب مركز** (centroid)، لذا تُفصل عناقيده دائمًا بخطوط مستقيمة. ينتهي المركزان قرب المنتصف، ويستحوذ كل منهما على جانب من المستوى. استخدم زر التبديل للمقارنة بين الطريقتين.`
			}
		},
		{
			title: 'حيث يتعثّر DBSCAN: كثافة غير متساوية',
			body: (s) => {
				const r = result(s);
				return `قيمة ε واحدة يجب أن تناسب مجموعة البيانات كلها. هنا عنقودان **متراصّان** (أعلى اليسار) وعنقود **منتشر** (أسفل اليمين).

ε = ${e2(s.eps)}: **عدد العناقيد ${r.nClusters}**، و ${r.counts.noise} نقطة ضوضاء. ${s.eps < 0.15 ? 'يُكتشف العنقودان المتراصّان، لكن جزءًا كبيرًا من العنقود المنتشر يُعدّ ضوضاء.' : 'يُكتشف العنقود المنتشر، لكن العنقودين المتراصّين اندمجا في عنقود واحد.'}

عندما تتفاوت الكثافات كثيرًا، جرّب HDBSCAN (الذي يغيّر ε تلقائيًا)، أو [نماذج الخليط الغاوسي](concept:gmm) (Gaussian Mixtures)، أو [التجميع الهرمي](concept:hierarchical-clustering) (hierarchical clustering).`;
			},
			quiz: {
				question: 'هل يمكن لقيمة ε أكبر أن تلتقط العنقود المنتشر مع إبقاء العنقودين المتراصّين منفصلين؟',
				options: [
					'نعم، توجد قيمة ε تصيب الثلاثة كلها',
					'لا: حين تصبح ε كبيرة بما يكفي للعنقود المتفرق، يندمج المتراصّان',
					'نعم، لكن فقط إذا رُفعت minPts أيضًا'
				],
				explain: `الفجوة بين العنقودين المتراصّين *أصغر* من التباعد داخل العنقود المتفرق. أي ε واسعة بما يكفي لربط العنقود المتفرق ستعبر تلك الفجوة أيضًا: عند ε = 0.22 يصبح الزوج المتراصّ عنقودًا واحدًا. اسحب ε بنفسك للتحقق.`
			}
		},
		{
			title: 'اختيار ε: مخطط مسافة k',
			body: (s) => `حيلة شائعة: لكل نقطة، قِس المسافة إلى **أقرب جار رقم ${s.minPts - 1}** (minPts − 1)، ثم رتّب هذه المسافات. هذا هو المنحنى أدناه، ويُسمّى مخطط مسافة k (k-distance plot).

تكون النقطة مركزية تمامًا حين تكون مسافتها **≤ ε**، لذا يفصل الخط النقاط المركزية (تحته) عن البقية. يبقى المنحنى منخفضًا داخل العناقيد، ثم يرتفع بحدة للنقاط المتفرقة. ضع ε قرب هذا **المرفق** (elbow): هنا ε = ${e2(s.eps)} تعطي ${result(s).nClusters} عناقيد و ${result(s).counts.noise} نقطة ضوضاء.`,
			task: {
				prompt: 'انقر أو اسحب على مخطط مسافة k لوضع ε عند المرفق (حتى يصبح الهلالان عنقودين).'
			}
		},
		{
			title: 'دورك: ساحة التجريب',
			body: `كل شيء متاح الآن. للتلخيص:

1. اختر **ε** (نصف القطر) و **minPts** (وحّد مقاييس الميزات أولًا، لأن ε مسافة خام).
2. النقاط التي لديها ≥ minPts جارًا ضمن ε هي نقاط **مركزية**.
3. تنمو العناقيد من نقطة مركزية إلى أخرى؛ والنقاط غير المركزية التي تصلها هي نقاط **حدّية**.
4. كل ما عدا ذلك **ضوضاء** (الوسم \`-1\`).

لا حاجة لاختيار K، وأي شكل ممكن، والقيم الشاذة (outliers) تُكشف مجانًا. الثمن: كثافة عامة واحدة، والمسافات تصبح غير موثوقة في الأبعاد العالية. لتقييم النتيجة دون وسوم، راجع [معامل الصورة الظلية](concept:silhouette-score) (silhouette score) (فهو يفضّل العناقيد المستديرة، فاستخدمه بحذر هنا).`
		}
	]
};

export default { fr, ar };
