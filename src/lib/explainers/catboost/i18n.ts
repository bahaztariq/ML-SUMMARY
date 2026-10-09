/**
 * French and Arabic narration for the CatBoost lesson (same step order as index.ts).
 * City names stay as they are (they are data, shown in the scene too).
 */
import type { LessonText } from '../types.ts';
import { f2, f3, pct } from '../_ensembles/memo.ts';
import { arCount, arLeaves } from '../_ensembles/i18n.ts';
import { catName } from './cat.ts';
import { N_TEST, N_TRAIN, WALK, aucTest, aucTrain, byFreq, cartStats, counts, oblAcc, oblivious, prior, singletons, walkRow, type CatState } from './state.ts';

const featName = (f: number) => (f === 0 ? 'x₁' : 'x₂');
const cityStats = () => {
	const cats = byFreq();
	return { n: cats.length, rare: cats.filter(([, n]) => n <= 2).length };
};
const levelsText = (s: CatState, sep: string) =>
	oblivious(s.depth)
		.levels.map((l) => `${featName(l.f)} ≤ ${f2(l.thr)}`)
		.join(sep);

export const fr: LessonText<CatState> = {
	title: 'Comment CatBoost gère les variables catégorielles',
	steps: [
		{
			title: 'Les catégories ne sont pas des nombres',
			body: () => {
				const { n, rare } = cityStats();
				return `Nous voulons prédire si un client **résilie** (*churn*) à partir de la **ville** où il habite. Les ${N_TRAIN} clients d’entraînement vivent dans **${n} villes différentes** : quelques grandes villes et une longue traîne de petites communes. ${rare} villes n’ont qu’un ou deux clients.

Les arbres se divisent sur des nombres (\`x ≤ t\`), donc une colonne de texte doit d’abord être [encodée](concept:encoding-categorical). La façon de le faire compte beaucoup quand il y a de nombreuses valeurs rares, comme des identifiants d’utilisateur, des codes produit ou des codes postaux.`;
			}
		},
		{
			title: 'One-hot : une colonne par ville',
			body: () => {
				const k = counts().cnt.size;
				return `L’encodage one-hot ajoute une colonne 0/1 par ville : **${k} colonnes**, chaque ligne contient un seul 1, donc ${pct(1 - 1 / k, 1)} de la matrice est faite de zéros (chaque point est un 1).

C’est malcommode pour les arbres. Une division sur une colonne sépare **une ville de toutes les autres**, si bien que regrouper des villes similaires demande de nombreuses divisions, et une colonne pour une commune à un seul client est le moyen idéal de mémoriser ce client. CatBoost n’encode en one-hot que les variables ayant très peu de valeurs distinctes (\`one_hot_max_size\`, petit par défaut). Pour tout le reste, il utilise des *statistiques de la cible*.`;
			}
		},
		{
			title: 'Encodage par la cible : le taux d’attrition d’une ville',
			body: (s) => `Une idée bien plus compacte : remplacer chaque ville par **le taux d’attrition de ses clients** dans les données d’entraînement. Une seule colonne numérique, et des villes similaires reçoivent des nombres similaires. Et les grandes villes diffèrent vraiment : leurs vrais taux d’attrition vont de 18 % à 60 %.

Chaque point est un client d’entraînement, placé selon sa valeur encodée (couloir du haut : parti). On peut mesurer à quel point l’encodage seul sépare les couloirs avec l’[AUC](concept:roc-auc) : 0.5, c’est pile ou face, 1.0, c’est parfait. Sur les données d’entraînement : **${f2(aucTrain(s))}**. Impressionnant pour une seule colonne.`
		},
		{
			title: 'Repérer la fuite',
			body: () => `Regardez le tableau : une commune avec **un seul** client est encodée par l’étiquette de ce client, exactement 0 ou 1. Il y a ${singletons()} clients dans ce cas ici. L’encodage ne décrit pas la ville, il *contient la réponse*.`,
			quiz: {
				question: 'À quel point cet encodage va-t-il séparer les clients qui partent parmi les nouveaux clients ?',
				options: [
					'À peu près aussi bien que sur les données d’entraînement',
					'Bien moins bien, à peine mieux que pile ou face',
					'Mieux, puisqu’il y a plus de données de test'
				],
				explain: (s) =>
					`Sur ${N_TEST} nouveaux clients, il n’obtient que **${f2(aucTest(s))}** (entraînement : ${f2(aucTrain(s))}). Pour un nouveau client, l’encodage d’une petite commune est l’étiquette d’une autre personne, ce qui ne dit rien. C’est une **fuite de la cible** (*target leakage*) : un modèle entraîné sur la colonne qui fuit s’appuierait fortement sur elle, puis décevrait en production.`
			}
		},
		{
			title: 'Le lissage aide, mais la fuite demeure',
			body: (s) => `Une rustine courante consiste à tirer les catégories rares vers le taux d’attrition global p = ${f2(prior())} :

\`encoding = (Σ y + a·p) / (n + a)\`

où n est le nombre de clients de la ville et a la force de l’a priori. Avec a = **${s.prior}** : AUC d’entraînement **${f2(aucTrain(s))}**, AUC de test **${f2(aucTest(s))}**.

Le lissage ramène les petites communes vers p, mais chaque ligne compte toujours **sa propre étiquette** : l’encodage d’un client qui part est toujours poussé vers le haut, et celui d’un client qui reste vers le bas.`,
			task: {
				prompt: 'Poussez la force de l’a priori **a** à 50 ou plus. L’AUC d’entraînement descend-elle jusqu’à l’AUC de test ?'
			}
		},
		{
			title: 'Statistiques de la cible ordonnées',
			body: (s) => {
				if (s.cursor === 0)
					return `La solution de CatBoost : placer les lignes d’entraînement dans un **ordre aléatoire** et encoder chaque ligne en n’utilisant **que les lignes précédentes** de la même ville, plus l’a priori :

\`TS = (Σ_{earlier, same city} y + a·p) / (n_earlier + a)\`

Une ligne ne voit jamais sa propre étiquette, exactement comme un vrai futur client. Appuyez sur **Ligne suivante** pour parcourir les premières lignes de la permutation.`;
				const r = walkRow(s, s.cursor - 1);
				return `Les lignes sont encodées une par une dans un ordre aléatoire, chacune en n’utilisant que les **lignes précédentes de la même ville** (surlignées), plus l’a priori (a = ${s.prior}, p = ${f2(prior())}) :

\`TS = (Σ_{earlier, same city} y + a·p) / (n_earlier + a)\`

Ligne ${s.cursor} (**${catName(r.cat)}**) : ${r.n} client${r.n > 1 ? 's' : ''} précédent${r.n > 1 ? 's' : ''} de cette ville, dont ${r.pos} ${r.pos > 1 ? 'sont partis' : 'est parti'} → (${r.pos} + ${s.prior}·${f2(prior())}) / (${r.n} + ${s.prior}) = **${f3(r.value)}**. Sa propre étiquette (${r.y}) n’a joué aucun rôle.`;
			},
			task: {
				prompt: `Appuyez sur **Ligne suivante** jusqu’à ce que ${WALK} lignes soient encodées. Observez la valeur d’une ville changer à mesure que ses clients apparaissent.`
			}
		},
		{
			title: 'Pas de fuite : l’entraînement ressemble au test',
			body: (s) => `Désormais, chaque ligne d’entraînement est encodée avec des statistiques ordonnées. AUC d’entraînement **${f2(aucTrain(s))}**, AUC de test **${f2(aucTest(s))}** : la colonne d’entraînement est maintenant aussi informative qu’elle le sera réellement, pas plus.

Deux détails font que cela fonctionne en pratique. Les lignes du début de l’ordre ont peu de prédécesseurs, donc leurs encodages sont bruités ; CatBoost utilise **plusieurs permutations aléatoires** pour différents arbres afin de lisser cet effet. À la prédiction, les nouvelles lignes sont encodées avec les statistiques de **tout** le jeu d’entraînement. CatBoost applique la même idée « n’utiliser que les lignes précédentes » aux résidus du boosting eux-mêmes (**ordered boosting**), ce qui évite une fuite similaire, plus subtile.`
		},
		{
			title: 'Arbres symétriques (oblivious)',
			body: (s) => {
				const t = oblivious(s.depth);
				const a = oblAcc(s.depth);
				const cs = cartStats(s.depth);
				return `Les arbres de CatBoost sont aussi inhabituels. Dans un **arbre symétrique (oblivious)**, tous les nœuds d’une même profondeur posent **la même question**. Chaque niveau est une seule coupe sur *tout* le plan, donc les feuilles forment une grille, et l’indice d’une feuille est simplement la suite des réponses oui/non lue comme un nombre binaire.

Profondeur ${s.depth} : ${levelsText(s, ', ')}. ${2 ** s.depth} feuilles à partir de **${t.levels.length} règle${t.levels.length > 1 ? 's' : ''}** (un arbre classique de même profondeur en utilise ici ${cs.rules}). Exactitude de test : symétrique ${pct(a.test)}, classique ${pct(cs.test)}.`;
			},
			quiz: {
				question: 'Un arbre symétrique de profondeur 6 a 64 feuilles. Combien de règles de division différentes stocke-t-il ?',
				options: ['63, une par nœud interne', '6, une par niveau', '64, une par feuille'],
				explain: () =>
					`Seulement **6** : un couple (variable, seuil) par niveau. Cela fait de l’arbre un régularisateur puissant (il ne peut pas isoler un coin bizarre sans couper partout) et rend la prédiction très rapide : 6 comparaisons donnent les 6 bits de l’indice de feuille, sans aucun branchement. C’est l’une des raisons pour lesquelles CatBoost fonctionne bien avec ses réglages par défaut. Le prix à payer : certains motifs demandent un arbre symétrique plus profond qu’un arbre classique.`
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué. Récapitulatif :

1. Le one-hot est coûteux quand il y a beaucoup de catégories ; l’encodage glouton par la cible fait fuir l’étiquette de chaque ligne.
2. Le lissage par un a priori réduit la fuite, mais ne la supprime pas.
3. Les **statistiques de la cible ordonnées** encodent chaque ligne à partir des lignes précédentes uniquement, sur plusieurs permutations aléatoires.
4. Les **arbres symétriques** n’utilisent qu’une division par niveau : rapides, régularisés, en forme de grille.

En code, il suffit de passer les colonnes de texte brutes dans \`cat_features\` et CatBoost fait le reste. Comparez avec [XGBoost](concept:xgboost) et [LightGBM](concept:lightgbm), qui attendent des catégories numériques (ou marquées spécialement).`
		}
	]
};

export const ar: LessonText<CatState> = {
	title: 'كيف يتعامل CatBoost مع الميزات الفئوية',
	steps: [
		{
			title: 'الفئات ليست أرقامًا',
			body: () => {
				const { n, rare } = cityStats();
				return `نريد التنبؤ بما إذا كان العميل **سيغادر** (churn) انطلاقًا من **المدينة** التي يسكنها. يعيش عملاء التدريب الـ${N_TRAIN} في **${n} مدينة مختلفة**: بضع مدن كبرى وذيل طويل من البلدات الصغيرة. ${rare} مدينة ليس فيها سوى عميل أو عميلين.

تُقسَّم الأشجار على أرقام (\`x ≤ t\`)، لذا يجب أولًا [ترميز](concept:encoding-categorical) العمود النصي. وطريقة الترميز مهمة جدًا حين تكثر القيم النادرة، كما في معرّفات المستخدمين أو رموز المنتجات أو الرموز البريدية.`;
			}
		},
		{
			title: 'One-hot: عمود لكل مدينة',
			body: () => {
				const k = counts().cnt.size;
				return `يضيف ترميز one-hot عمودًا من 0/1 لكل مدينة: **${k} عمودًا**، وفي كل صف 1 واحد فقط، لذا فإن ${pct(1 - 1 / k, 1)} من المصفوفة أصفار (كل نقطة تمثل 1).

هذا غير ملائم للأشجار. التقسيم على عمود واحد يفصل **مدينة واحدة عن كل المدن الأخرى**، فيتطلب تجميع المدن المتشابهة تقسيمات كثيرة، والعمود الخاص ببلدة فيها عميل واحد طريقة مثالية لحفظ ذلك العميل. لا يرمّز CatBoost بـone-hot إلا الميزات ذات القيم المختلفة القليلة جدًا (\`one_hot_max_size\`، صغير افتراضيًا). أما لكل ما عداها فيستخدم *إحصاءات الهدف* (target statistics).`;
			}
		},
		{
			title: 'الترميز بالهدف: معدل المغادرة في المدينة',
			body: (s) => `فكرة أكثر إيجازًا بكثير: استبدل كل مدينة بـ**معدل مغادرة عملائها** في بيانات التدريب. عمود رقمي واحد، والمدن المتشابهة تحصل على أرقام متشابهة. والمدن الكبرى تختلف فعلًا: معدلات مغادرتها الحقيقية تتراوح بين 18% و60%.

كل نقطة عميل تدريب، موضوعة عند قيمته المرمّزة (المسار العلوي: غادر). يمكننا قياس مدى فصل الترميز وحده بين المسارين باستخدام [AUC](concept:roc-auc): 0.5 تعني رمي عملة، و1.0 تعني الكمال. على بيانات التدريب: **${f2(aucTrain(s))}**. نتيجة مبهرة لعمود واحد.`
		},
		{
			title: 'اكتشف التسرّب',
			body: () => `انظر إلى الجدول: البلدة التي فيها عميل **واحد** تُرمَّز بتسمية ذلك العميل نفسها، 0 أو 1 بالضبط. لدينا هنا ${singletons()} عميلًا من هذا النوع. الترميز لا يصف المدينة، بل *يحتوي الإجابة*.`,
			quiz: {
				question: 'ما مدى جودة هذا الترميز في فصل المغادرين بين العملاء الجدد؟',
				options: ['تقريبًا بالجودة نفسها على بيانات التدريب', 'أسوأ بكثير، وليس أفضل كثيرًا من رمي عملة', 'أفضل، لأن بيانات الاختبار أكثر'],
				explain: (s) =>
					`على ${N_TEST} عميل جديد لا يحقق سوى **${f2(aucTest(s))}** (التدريب: ${f2(aucTrain(s))}). بالنسبة للعملاء الجدد، ترميز البلدة الصغيرة هو تسمية شخص آخر، وهذا لا يخبر بشيء. هذا هو **تسرّب الهدف** (target leakage): النموذج المدرَّب على العمود المسرِّب سيعتمد عليه كثيرًا ثم يخيّب الآمال في بيئة الإنتاج.`
			}
		},
		{
			title: 'التمليس يساعد، لكن التسرّب يبقى',
			body: (s) => `من الحلول الشائعة سحب الفئات النادرة نحو معدل المغادرة العام p = ${f2(prior())}:

\`encoding = (Σ y + a·p) / (n + a)\`

حيث n عدد عملاء المدينة وa قوة القبلي (prior). مع a = **${s.prior}**: AUC التدريب **${f2(aucTrain(s))}**، وAUC الاختبار **${f2(aucTest(s))}**.

يضغط التمليس البلدات الصغيرة نحو p، لكن كل صف لا يزال يحتسب **تسميته الخاصة**، فيُدفع ترميز المغادر دائمًا إلى الأعلى وترميز الباقي إلى الأسفل.`,
			task: {
				prompt: 'ارفع قوة القبلي **a** إلى 50 أو أكثر. هل ينخفض AUC التدريب إلى مستوى AUC الاختبار؟'
			}
		},
		{
			title: 'إحصاءات الهدف المرتّبة',
			body: (s) => {
				if (s.cursor === 0)
					return `حلّ CatBoost: ضع صفوف التدريب في **ترتيب عشوائي** ورمّز كل صف باستخدام **الصفوف السابقة له فقط** من المدينة نفسها، إضافة إلى القبلي:

\`TS = (Σ_{earlier, same city} y + a·p) / (n_earlier + a)\`

لا يرى الصف تسميته أبدًا، تمامًا كعميل حقيقي في المستقبل. اضغط **الصف التالي** لتمرّ على الصفوف الأولى من التبديلة.`;
				const r = walkRow(s, s.cursor - 1);
				const earlier = arCount(r.n, 'عميل سابق واحد', 'عميلان سابقان', 'عملاء سابقين', 'عميلًا سابقًا');
				return `تُرمَّز الصفوف واحدًا تلو الآخر بترتيب عشوائي، كلٌّ منها باستخدام **الصفوف السابقة من المدينة نفسها** فقط (المظلَّلة)، إضافة إلى القبلي (a = ${s.prior}، p = ${f2(prior())}):

\`TS = (Σ_{earlier, same city} y + a·p) / (n_earlier + a)\`

الصف ${s.cursor} (**${catName(r.cat)}**): ${r.n === 0 ? 'لا يوجد عملاء سابقون' : earlier} من هناك، غادر منهم ${r.pos} → (${r.pos} + ${s.prior}·${f2(prior())}) / (${r.n} + ${s.prior}) = **${f3(r.value)}**. ولم يكن لتسميته الخاصة (${r.y}) أي دور.`;
			},
			task: {
				prompt: `اضغط **الصف التالي** حتى تُرمَّز ${WALK} صفًّا. راقب قيمة المدينة وهي تتغيّر كلما ظهر مزيد من عملائها.`
			}
		},
		{
			title: 'لا تسرّب: التدريب يشبه الاختبار',
			body: (s) => `الآن كل صف تدريب مرمَّز بإحصاءات مرتّبة. AUC التدريب **${f2(aucTrain(s))}**، وAUC الاختبار **${f2(aucTest(s))}**: صار عمود التدريب مفيدًا بالقدر الذي سيكون عليه فعلًا، لا أكثر.

تفصيلان يجعلان هذا يعمل عمليًا. الصفوف المبكرة في الترتيب لها سوابق قليلة، فتكون ترميزاتها مشوّشة؛ لذا يستخدم CatBoost **عدة تبديلات عشوائية** لأشجار مختلفة ليعادل ذلك. وعند التنبؤ تُرمَّز الصفوف الجديدة بإحصاءات من مجموعة التدريب **كاملة**. ويطبّق CatBoost فكرة «استخدم الصفوف السابقة فقط» نفسها على بواقي التعزيز ذاتها (**ordered boosting**)، ما يتجنّب تسرّبًا مشابهًا وأكثر خفاءً.`
		},
		{
			title: 'الأشجار المتماثلة (oblivious)',
			body: (s) => {
				const t = oblivious(s.depth);
				const a = oblAcc(s.depth);
				const cs = cartStats(s.depth);
				return `أشجار CatBoost غير مألوفة أيضًا. في **الشجرة المتماثلة (oblivious)**، تطرح كل العقد في العمق نفسه **السؤال نفسه**. كل مستوى قطع واحد عبر المستوى *كله*، فتشكّل الأوراق شبكة، ورقم الورقة هو ببساطة إجابات نعم/لا مقروءة كعدد ثنائي.

العمق ${s.depth}: ${levelsText(s, '، ')}. ${arLeaves(2 ** s.depth)} من **${arCount(t.levels.length, 'قاعدة واحدة', 'قاعدتين', 'قواعد', 'قاعدة')}** (الشجرة العادية بالعمق نفسه تستخدم هنا ${cs.rules}). دقة الاختبار: المتماثلة ${pct(a.test)}، والعادية ${pct(cs.test)}.`;
			},
			quiz: {
				question: 'شجرة متماثلة بعمق 6 لها 64 ورقة. كم قاعدة تقسيم مختلفة تخزّن؟',
				options: ['63، واحدة لكل عقدة داخلية', '6، واحدة لكل مستوى', '64، واحدة لكل ورقة'],
				explain: () =>
					`**6** فقط: زوج واحد (ميزة، عتبة) لكل مستوى. هذا يجعل الشجرة أداة تنظيم قوية (لا تستطيع عزل زاوية شاذة دون أن تقطع في كل مكان)، ويجعل التنبؤ سريعًا جدًا: 6 مقارنات تعطي البتات الست لرقم الورقة، دون أي تفرّع. هذا أحد أسباب أداء CatBoost الجيد بإعداداته الافتراضية. الثمن: بعض الأنماط تحتاج إلى شجرة متماثلة أعمق من الشجرة العادية.`
			}
		},
		{
			title: 'دورك: ساحة التجريب',
			body: `كل شيء متاح الآن. للتلخيص:

1. ترميز one-hot مُهدِر حين تكثر الفئات؛ والترميز الجشع بالهدف يسرّب تسمية كل صف.
2. التمليس بقيمة قبلية يقلّل التسرّب لكنه لا يزيله.
3. **إحصاءات الهدف المرتّبة** ترمّز كل صف من الصفوف السابقة فقط، عبر عدة تبديلات عشوائية.
4. **الأشجار المتماثلة** تستخدم تقسيمًا واحدًا لكل مستوى: سريعة، ومنظَّمة، وعلى شكل شبكة.

في الشيفرة، يكفي أن تمرّر الأعمدة النصية الخام في \`cat_features\` ويتكفّل CatBoost بالباقي. قارن مع [XGBoost](concept:xgboost) و[LightGBM](concept:lightgbm)، اللذين ينتظران مدخلات فئوية رقمية (أو معلَّمة بطريقة خاصة).`
		}
	]
};

export default { fr, ar };
