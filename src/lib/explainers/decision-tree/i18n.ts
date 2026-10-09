/**
 * French and Arabic narration for the decision-tree lesson (same step order as index.ts).
 */
import type { LessonText } from '../types';
import { TARGET, accuracies, fitted, manualScore, pct, rootBest, rootCounts, rootCurve, rootGini, rule, type TreeState } from './state';

const f3 = (v: number) => v.toFixed(3);

const fr: LessonText<TreeState> = {
	title: 'Comment un arbre de décision apprend ses coupures',
	steps: [
		{
			title: 'Trier des points avec des questions oui/non',
			body: (s) => {
				const [a, b] = rootCounts(s);
				return `Voici **${a + b} points d'entraînement** avec deux variables, \`x₁\` et \`x₂\`, et deux classes : **A** (cercles) et **B** (carrés). Environ 1 étiquette sur 10 est volontairement fausse, comme dans des données réelles.

Un arbre de décision classe en posant une suite de **questions oui/non**, chacune portant sur une seule variable. Pour l'instant il n'a rien demandé : un seul **nœud racine** contient les ${a + b} points (${a} A, ${b} B), affiché sous le graphique.`;
			}
		},
		{
			title: 'Une coupure = un seuil sur une variable',
			body: (s) => {
				const sc = manualScore(s);
				return `Chaque question a la forme **« variable ≤ seuil ? »**. Sur le graphique, c'est une droite parallèle à un axe : \`x₁ ≤ t\` est une ligne verticale, \`x₂ ≤ t\` une ligne horizontale. Les points du côté *oui* vont dans l'enfant gauche, les autres dans l'enfant droit.

La coupure **${rule(s.split)}** envoie ${sc.left[0] + sc.left[1]} points à gauche (${sc.left[0]} A, ${sc.left[1]} B) et ${sc.right[0] + sc.right[1]} à droite (${sc.right[0]} A, ${sc.right[1]} B). Le schéma de l'arbre montre les deux enfants qu'elle créerait.`;
			},
			task: {
				prompt: 'Faites glisser sur le graphique pour déplacer la ligne, puis passez à une coupure sur **x₂** (horizontale).'
			}
		},
		{
			title: 'Impureté de Gini : à quel point un nœud est-il mélangé ?',
			body: (s) => {
				const [a, b] = rootCounts(s);
				const n = a + b;
				const sc = manualScore(s);
				return `Pour comparer des coupures, il faut un score qui mesure à quel point un nœud est **mélangé**. CART utilise l'**impureté de Gini** :

\`G = 1 − p_A² − p_B²\`

où \`p_A\`, \`p_B\` sont les proportions de chaque classe dans le nœud. Un nœud pur a G = 0 ; un nœud 50/50 a la pire valeur, G = 0.5. C'est la probabilité que deux points tirés au hasard dans le nœud soient de classes différentes.

Racine : 1 − (${a}/${n})² − (${b}/${n})² = **${f3(rootGini(s))}**. Avec **${rule(s.split)}**, le côté oui a G = **${f3(sc.giniLeft)}** et le côté non G = **${f3(sc.giniRight)}**.`;
			}
		},
		{
			title: 'Noter une coupure',
			body: (s) => {
				const sc = manualScore(s);
				const nL = sc.left[0] + sc.left[1];
				const nR = sc.right[0] + sc.right[1];
				const n = nL + nR;
				return `Une coupure est notée par la **moyenne pondérée** de l'impureté de ses enfants, pondérée par le nombre de points que reçoit chaque enfant :

\`weighted = (n_yes/n)·G_yes + (n_no/n)·G_no\`

La baisse par rapport à l'impureté du parent est le **gain**. Plus le gain est grand, plus la question est utile.

Actuellement : (${nL}/${n})·${f3(sc.giniLeft)} + (${nR}/${n})·${f3(sc.giniRight)} = **${f3(sc.weighted)}**, donc gain = ${f3(rootGini(s))} − ${f3(sc.weighted)} = **${f3(sc.gain)}**.`;
			},
			task: {
				prompt: 'Déplacez la ligne (sur l’un ou l’autre axe) jusqu’à ce que la pastille **gain** s’allume : à moins de 10 % de la meilleure coupure possible.'
			}
		},
		{
			title: 'Recherche gloutonne : essayer tous les seuils',
			body: (s) => {
				const n = rootCurve(s, 0).length + rootCurve(s, 1).length;
				return `L'algorithme fait ce que vous venez de faire, mais de façon exhaustive. Pour chaque variable, il trie les points et essaie un seuil **à mi-chemin entre chaque paire de voisins** : ${n} candidats ici. Seuls ces seuils peuvent changer la répartition des points.

Le graphique trace le Gini pondéré des enfants pour chaque seuil sur la variable actuelle (la courbe pâle correspond à l'autre variable). La ligne pointillée est l'impureté du parent ; l'écart en dessous est le gain.`;
			},
			quiz: {
				question: 'Regardez les deux courbes. Quelle variable la meilleure coupure utilisera-t-elle ?',
				options: ['x₁ (une ligne verticale)', 'x₂ (une ligne horizontale)', 'Les deux donnent exactement le même meilleur score'],
				explain: (s) => {
					const b = rootBest(s);
					return `Le point le plus bas des deux courbes est **${rule(b)}** : Gini pondéré ${f3(b.weighted)}, gain **${f3(b.gain)}**. Elle isole la bande du haut, presque entièrement composée de A. La ligne de coupure y a sauté.`;
				}
			}
		},
		{
			title: 'Puis on recommence de chaque côté',
			body: (s) => {
				const t = fitted(s);
				const a = accuracies(s);
				return `La meilleure coupure devient la racine. Ensuite chaque enfant est traité comme un **nouveau jeu de données, plus petit**, et reçoit sa propre meilleure coupure, trouvée de la même manière, et ainsi de suite en descendant dans l'arbre. C'est pour cela qu'on parle d'algorithme *glouton* : chaque coupure est la meilleure à l'instant présent, sans regarder plus loin.

Une branche cesse de pousser quand un nœud est **pur**, quand aucune coupure n'aide, ou quand une limite comme \`max_depth\` est atteinte. Une feuille prédit sa **classe majoritaire**.

Profondeur **${a.depth}** : ${a.leaves} feuilles${t.split ? `, racine ${rule(t.split)}` : ''}, exactitude d'entraînement **${pct(a.train)}**.`;
			},
			task: { prompt: 'Appuyez sur **Ajouter un niveau** jusqu’à ce que l’arbre ait 3 niveaux de profondeur.' }
		},
		{
			title: 'Les feuilles sont des rectangles',
			body: (s) => {
				const a = accuracies(s);
				return `Chaque coupure divise une boîte en deux le long d'un axe : l'arbre découpe donc le plan en **rectangles alignés sur les axes**, un par feuille. Survolez une feuille dans le schéma (ou une région du graphique) pour voir quelle boîte lui appartient.

Pour vérifier que les boîtes décrivent le *motif* et pas seulement ces 150 points, on évalue l'arbre sur **${500} points de test mis de côté** qu'il n'a jamais vus. À la profondeur ${a.depth} : entraînement **${pct(a.train)}**, test **${pct(a.test)}**. Avec 10 % d'étiquettes inversées, environ 90 % est le mieux qu'un modèle puisse faire ici.`;
			},
			task: { prompt: 'Passez **Points affichés** sur **Test** pour voir les données mises de côté sur les mêmes boîtes.' }
		},
		{
			title: 'Et si on ne s’arrêtait jamais ?',
			body: (s) => {
				const a = accuracies(s);
				return `Rien n'oblige un arbre à s'arrêter à la profondeur 3. Par défaut (\`max_depth=None\` dans scikit-learn), il continue à couper jusqu'à ce que chaque feuille soit pure.

Arbre actuel : profondeur **${a.depth}**, **${a.leaves}** feuilles, entraînement ${pct(a.train)}, test ${pct(a.test)}.`;
			},
			quiz: {
				question: 'Sans limite de profondeur sur ces données bruitées, que se passe-t-il ?',
				options: [
					'Les exactitudes d’entraînement et de test montent toutes deux vers 100 %',
					'L’exactitude d’entraînement atteint 100 %, celle de test se dégrade',
					'L’arbre s’arrête après quelques niveaux car les coupures n’aident plus'
				],
				explain: (s) => {
					const a = accuracies(s);
					const d3 = accuracies(s, 3);
					return `L'arbre pousse jusqu'à la profondeur **${a.depth}** avec **${a.leaves} feuilles** et colle à chaque point d'entraînement : entraînement **${pct(a.train)}**. Mais beaucoup de ces minuscules boîtes n'existent que pour entourer un seul point mal étiqueté, et elles se trompent sur les points de test voisins : le test chute de ${pct(d3.test)} à **${pct(a.test)}**. C'est du [surapprentissage](concept:overfitting-underfitting).`;
				}
			}
		},
		{
			title: 'Le freiner',
			body: (s) => {
				const a = accuracies(s);
				return `Deux freins courants :

- \`max_depth\` : ne jamais poser plus de questions d'affilée que ce nombre.
- \`min_samples_leaf\` : chaque feuille doit garder au moins ce nombre de points d'entraînement, si bien que l'arbre ne peut pas tailler une boîte pour un seul point bruité.

Le graphique montre l'exactitude d'entraînement et de test pour chaque \`max_depth\`. L'entraînement ne fait que monter ; le test atteint un pic puis redescend. Actuellement : profondeur ${a.depth}, ${a.leaves} feuilles, entraînement **${pct(a.train)}**, test **${pct(a.test)}**.`;
			},
			task: {
				prompt: `Utilisez **max_depth** et/ou **min_samples_leaf** pour amener l'exactitude de test à au moins **${pct(TARGET)}**.`
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué. Récapitulatif :

1. Noter chaque coupure alignée sur un axe par le Gini pondéré de ses enfants.
2. Garder la meilleure, couper les données et recommencer de chaque côté.
3. S'arrêter aux feuilles pures ou à une limite (\`max_depth\`, \`min_samples_leaf\`).
4. Chaque feuille prédit sa classe majoritaire, donc les régions sont des rectangles.

Appuyez sur **Nouvel échantillon** sans limite de profondeur : un échantillon légèrement différent donne un arbre très différent. Un arbre profond seul a une **forte variance**. Une [forêt aléatoire](concept:random-forest) corrige cela en moyennant de nombreux arbres, chacun construit sur un rééchantillonnage aléatoire des données. Les arbres n'ont pas besoin de [mise à l'échelle des variables](concept:feature-scaling), puisqu'une coupure ne compare qu'une variable à un seuil.`,
			task: {
				prompt: 'Appuyez plusieurs fois sur **Nouvel échantillon**, d’abord avec `max_depth` = aucune, puis avec 2. Quel arbre change le plus ?'
			}
		}
	]
};

const ar: LessonText<TreeState> = {
	title: 'كيف تتعلم شجرة القرار تقسيماتها',
	steps: [
		{
			title: 'فرز النقاط بأسئلة نعم/لا',
			body: (s) => {
				const [a, b] = rootCounts(s);
				return `هذه **${a + b} نقطة تدريب** بميزتين، \`x₁\` و\`x₂\`، وفئتين: **A** (دوائر) و**B** (مربعات). نحو 1 من كل 10 تسميات خاطئة عمدًا، كما في البيانات الحقيقية.

تصنّف شجرة القرار (decision tree) بطرح سلسلة من **أسئلة نعم/لا**، يتعلق كل منها بميزة واحدة. حتى الآن لم تطرح أي سؤال: **عقدة جذر** (root node) واحدة تضم كل النقاط الـ${a + b} (${a} A، ${b} B)، وهي معروضة أسفل المخطط.`;
			}
		},
		{
			title: 'التقسيم عتبة واحدة على ميزة واحدة',
			body: (s) => {
				const sc = manualScore(s);
				return `كل سؤال على الشكل **«هل الميزة ≤ العتبة؟»**. على المخطط هذا خط مستقيم موازٍ لأحد المحورين: \`x₁ ≤ t\` خط عمودي، و\`x₂ ≤ t\` خط أفقي. النقاط في جهة *نعم* تذهب إلى الابن الأيسر، والباقي إلى الابن الأيمن.

التقسيم **${rule(s.split)}** يرسل ${sc.left[0] + sc.left[1]} نقطة إلى اليسار (${sc.left[0]} A، ${sc.left[1]} B) و${sc.right[0] + sc.right[1]} إلى اليمين (${sc.right[0]} A، ${sc.right[1]} B). يُظهر مخطط الشجرة الابنين اللذين سينشئهما.`;
			},
			task: {
				prompt: 'اسحب على المخطط لتحريك الخط، ثم انتقل إلى تقسيم على **x₂** (خط أفقي).'
			}
		},
		{
			title: 'شوائب جيني: ما مدى اختلاط العقدة؟',
			body: (s) => {
				const [a, b] = rootCounts(s);
				const n = a + b;
				const sc = manualScore(s);
				return `لمقارنة التقسيمات نحتاج إلى مقياس لمدى **اختلاط** العقدة. تستخدم CART **شوائب جيني** (Gini impurity):

\`G = 1 − p_A² − p_B²\`

حيث \`p_A\` و\`p_B\` نسبتا الفئتين في العقدة. العقدة النقية لها G = 0، والعقدة 50/50 لها أسوأ قيمة G = 0.5. إنها احتمال أن تكون نقطتان مسحوبتان عشوائيًا من العقدة من فئتين مختلفتين.

الجذر: 1 − (${a}/${n})² − (${b}/${n})² = **${f3(rootGini(s))}**. مع **${rule(s.split)}** تكون G في جهة نعم = **${f3(sc.giniLeft)}** وفي جهة لا = **${f3(sc.giniRight)}**.`;
			}
		},
		{
			title: 'تقييم التقسيم',
			body: (s) => {
				const sc = manualScore(s);
				const nL = sc.left[0] + sc.left[1];
				const nR = sc.right[0] + sc.right[1];
				const n = nL + nR;
				return `يُقيَّم التقسيم بـ**المتوسط المرجّح** لشوائب ابنيه، مرجّحًا بعدد النقاط التي يحصل عليها كل ابن:

\`weighted = (n_yes/n)·G_yes + (n_no/n)·G_no\`

الانخفاض مقارنةً بشوائب الأب هو **الكسب** (gain). كلما كبر الكسب كان السؤال أنفع.

الآن: (${nL}/${n})·${f3(sc.giniLeft)} + (${nR}/${n})·${f3(sc.giniRight)} = **${f3(sc.weighted)}**، إذن الكسب = ${f3(rootGini(s))} − ${f3(sc.weighted)} = **${f3(sc.gain)}**.`;
			},
			task: {
				prompt: 'حرّك الخط (على أي من المحورين) حتى تضيء شارة **الكسب**: أي ضمن 10% من أفضل تقسيم ممكن.'
			}
		},
		{
			title: 'بحث جشع: تجربة كل العتبات',
			body: (s) => {
				const n = rootCurve(s, 0).length + rootCurve(s, 1).length;
				return `تفعل الخوارزمية ما فعلته للتو، لكن بشكل شامل. لكل ميزة ترتّب النقاط وتجرّب عتبة **في منتصف المسافة بين كل جارين**: ${n} مرشحًا هنا. فقط هذه العتبات يمكنها تغيير توزيع النقاط.

يرسم المخطط شوائب جيني المرجّحة للابنين لكل عتبة على الميزة الحالية (المنحنى الباهت للميزة الأخرى). الخط المتقطع هو شوائب الأب، والفجوة تحته هي الكسب.`;
			},
			quiz: {
				question: 'انظر إلى المنحنيين. أي ميزة سيستخدمها أفضل تقسيم؟',
				options: ['x₁ (خط عمودي)', 'x₂ (خط أفقي)', 'كلاهما يعطي أفضل درجة نفسها تمامًا'],
				explain: (s) => {
					const b = rootBest(s);
					return `أدنى نقطة على المنحنيين هي **${rule(b)}**: جيني مرجّح ${f3(b.weighted)}، كسب **${f3(b.gain)}**. إنه يفصل الشريط العلوي الذي يكاد يكون كله من A. وقد قفز خط التقسيم إلى هناك.`;
				}
			}
		},
		{
			title: 'ثم التكرار على كل جهة',
			body: (s) => {
				const t = fitted(s);
				const a = accuracies(s);
				return `يصبح أفضل تقسيم هو الجذر. ثم يُعامَل كل ابن كـ**مجموعة بيانات جديدة أصغر** ويحصل على أفضل تقسيم خاص به بالطريقة نفسها، وهكذا نزولًا في الشجرة. لهذا تُسمّى *جشعة* (greedy): كل تقسيم هو الأفضل في اللحظة الحالية، دون نظر إلى ما بعده.

تتوقف الفروع عن النمو حين تصبح العقدة **نقية**، أو حين لا يفيد أي تقسيم، أو حين يُبلَغ حدّ مثل \`max_depth\`. تتنبأ الورقة بـ**الفئة الغالبة** فيها.

العمق **${a.depth}**: ${a.leaves} أوراق${t.split ? `، الجذر ${rule(t.split)}` : ''}، دقة التدريب **${pct(a.train)}**.`;
			},
			task: { prompt: 'اضغط **أضف مستوى** حتى يصبح عمق الشجرة 3 مستويات.' }
		},
		{
			title: 'الأوراق مستطيلات',
			body: (s) => {
				const a = accuracies(s);
				return `كل تقسيم يقطع صندوقًا إلى نصفين على امتداد محور واحد، لذا تقسّم الشجرة المستوى إلى **مستطيلات موازية للمحاور**، مستطيل لكل ورقة. مرّر المؤشر فوق ورقة في المخطط (أو فوق منطقة في الرسم) لترى الصندوق الذي يتبعها.

للتحقق من أن الصناديق تصف *النمط* وليس هذه النقاط الـ150 فقط، نقيّم الشجرة على **${500} نقطة اختبار محجوزة** لم ترها من قبل. عند العمق ${a.depth}: التدريب **${pct(a.train)}**، الاختبار **${pct(a.test)}**. مع قلب 10% من التسميات، فإن نحو 90% هو أفضل ما يمكن لأي نموذج تحقيقه هنا.`;
			},
			task: { prompt: 'بدّل **عرض النقاط** إلى **اختبار** لترى البيانات المحجوزة على الصناديق نفسها.' }
		},
		{
			title: 'ماذا لو لم نتوقف أبدًا؟',
			body: (s) => {
				const a = accuracies(s);
				return `لا شيء يجبر الشجرة على التوقف عند العمق 3. افتراضيًا (\`max_depth=None\` في scikit-learn) تستمر في التقسيم حتى تصبح كل ورقة نقية.

الشجرة الحالية: العمق **${a.depth}**، **${a.leaves}** ورقة، التدريب ${pct(a.train)}، الاختبار ${pct(a.test)}.`;
			},
			quiz: {
				question: 'من دون حدّ للعمق على هذه البيانات المشوّشة، ماذا يحدث؟',
				options: [
					'ترتفع دقة التدريب والاختبار كلتاهما نحو 100%',
					'تبلغ دقة التدريب 100% بينما تسوء دقة الاختبار',
					'تتوقف الشجرة بعد بضعة مستويات لأن التقسيمات لم تعد تفيد'
				],
				explain: (s) => {
					const a = accuracies(s);
					const d3 = accuracies(s, 3);
					return `تنمو الشجرة حتى العمق **${a.depth}** بـ**${a.leaves} ورقة** وتطابق كل نقطة تدريب: التدريب **${pct(a.train)}**. لكن كثيرًا من هذه الصناديق الصغيرة لا يوجد إلا ليحيط بنقطة واحدة خاطئة التسمية، فيخطئ في تصنيف نقاط الاختبار المحيطة بها: ينخفض الاختبار من ${pct(d3.test)} إلى **${pct(a.test)}**. هذا هو [الإفراط في التخصيص (overfitting)](concept:overfitting-underfitting).`;
				}
			}
		},
		{
			title: 'كبح الشجرة',
			body: (s) => {
				const a = accuracies(s);
				return `كابحان شائعان:

- \`max_depth\`: لا تطرح أكثر من هذا العدد من الأسئلة المتتالية.
- \`min_samples_leaf\`: يجب أن تحتفظ كل ورقة بهذا العدد على الأقل من نقاط التدريب، فلا تستطيع الشجرة اقتطاع صندوق لنقطة مشوّشة واحدة.

يُظهر المخطط دقة التدريب والاختبار لكل قيمة \`max_depth\`. التدريب لا يفعل إلا الصعود، أما الاختبار فيبلغ ذروة ثم ينخفض. الآن: العمق ${a.depth}، ${a.leaves} ورقة، التدريب **${pct(a.train)}**، الاختبار **${pct(a.test)}**.`;
			},
			task: {
				prompt: `استخدم **max_depth** و/أو **min_samples_leaf** لرفع دقة الاختبار إلى **${pct(TARGET)}** على الأقل.`
			}
		},
		{
			title: 'دورك: ساحة التجربة',
			body: `كل شيء متاح الآن. للتلخيص:

1. قيّم كل تقسيم موازٍ لمحور بشوائب جيني المرجّحة لابنيه.
2. احتفظ بالأفضل، قسّم البيانات، وكرّر على كل جهة.
3. توقف عند الأوراق النقية أو عند حدّ (\`max_depth\`، \`min_samples_leaf\`).
4. تتنبأ كل ورقة بفئتها الغالبة، لذا تكون المناطق مستطيلات.

اضغط **عيّنة تدريب جديدة** من دون حدّ للعمق: عيّنة مختلفة قليلًا تعطي شجرة مختلفة جدًا. الشجرة العميقة المنفردة ذات **تباين عالٍ** (high variance). تعالج [الغابة العشوائية](concept:random-forest) ذلك بأخذ متوسط أشجار كثيرة، تُبنى كل منها على إعادة معاينة عشوائية للبيانات. لا تحتاج الأشجار إلى [توحيد مقاييس الميزات](concept:feature-scaling)، لأن التقسيم يقارن ميزة واحدة بعتبة فقط.`,
			task: {
				prompt: 'اضغط **عيّنة تدريب جديدة** عدة مرات، أولًا مع `max_depth` = بلا حدّ، ثم مع 2. أي شجرة تتغير أكثر؟'
			}
		}
	]
};

export default { fr, ar };
