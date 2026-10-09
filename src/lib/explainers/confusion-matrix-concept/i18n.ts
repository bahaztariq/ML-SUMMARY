/**
 * French and Arabic narration for the confusion-matrix lesson (same step order as index.ts).
 */
import type { LessonText } from '../types.ts';
import { accuracy, pct, precision, recall, specificity } from '../_classification/metrics.ts';
import { cheapest, costOf, countsOf, words, type CMState, type Scenario } from './state.ts';

const t2 = (v: number) => v.toFixed(2);

/** What each kind of mistake means, per scenario and language. */
const MEANS: Record<'fr' | 'ar', Record<Scenario, { fp: string; fn: string }>> = {
	fr: {
		medical: {
			fp: 'qu’un patient sain passe un examen complémentaire inutile',
			fn: 'qu’un patient malade est renvoyé chez lui sans traitement'
		},
		spam: {
			fp: 'qu’un vrai e-mail disparaît dans le dossier des indésirables',
			fn: 'qu’un spam arrive dans la boîte de réception'
		}
	},
	ar: {
		medical: {
			fp: 'أن يخضع مريض سليم لفحص متابعة لا داعي له',
			fn: 'أن يُعاد مريض مصاب إلى منزله دون علاج'
		},
		spam: {
			fp: 'أن تختفي رسالة حقيقية في مجلد البريد غير المرغوب فيه',
			fn: 'أن تصل رسالة مزعجة واحدة إلى صندوق الوارد'
		}
	}
};

export const fr: LessonText<CMState> = {
	title: 'Lire une matrice de confusion',
	steps: [
		{
			title: 'Un classifieur produit des scores',
			body: `Voici **120 patients** issus d’un test de dépistage. Chaque point est un patient. La ligne du haut contient les 60 qui sont **réellement malades**, celle du bas les 60 qui sont **sains**.

La position horizontale d’un point est le **score** que le modèle a attribué à ce patient : son estimation de la probabilité qu’il soit malade. La plupart des malades obtiennent un score élevé et la plupart des patients sains un score faible, mais les deux cloches **se chevauchent** : certains patients sains paraissent malades au modèle, et certains malades paraissent sains.

Le modèle ne dit jamais « malade » de lui-même. Transformer les scores en décisions, c’est notre travail.`
		},
		{
			title: 'Un seuil transforme les scores en décisions',
			body: (s) => {
				const c = countsOf(s);
				return `Choisissez un **seuil** : tout patient dont le score l’atteint ou le dépasse est signalé *malade* (prédit positif), tous les autres sont renvoyés chez eux *sains* (prédit négatif).

Au seuil **${t2(s.thr)}**, le modèle signale **${c.tp + c.fp}** patients et en écarte **${c.fn + c.tn}**. Faites glisser la ligne, ou utilisez le curseur, et regardez ces nombres bouger. Le modèle n’a pas changé du tout ; seule la règle de décision a changé.`;
			}
		},
		{
			title: 'Quatre types de résultat',
			body: (s) => {
				const c = countsOf(s);
				return `Croisez chaque décision avec la vérité et chaque patient tombe dans exactement une case parmi quatre. Ce tableau 2×2 est la **matrice de confusion** :

- **Vrai positif (TP)**, ${c.tp} : malade et signalé. Une détection correcte.
- **Faux négatif (FN)**, ${c.fn} : malade mais renvoyé chez lui. Un cas *manqué* (erreur de type II).
- **Faux positif (FP)**, ${c.fp} : sain mais signalé. Une *fausse alerte* (erreur de type I).
- **Vrai négatif (TN)**, ${c.tn} : sain et écarté.

Les lignes donnent la vérité, les colonnes la prédiction. Les points prennent maintenant la couleur de leur case.`;
			}
		},
		{
			title: 'Regardez la matrice se remplir',
			body: (s) => {
				const c = countsOf(s);
				return `Chaque point qui franchit la ligne passe d’une cellule à l’autre au sein de la même **ligne** : un patient malade bascule entre TP et FN, un patient sain entre FP et TN. Les totaux de ligne ne changent jamais (60 malades, 60 sains), seule la répartition de chaque ligne change.

En ce moment : **${c.tp} malades sur 60** détectés, **${c.fp} patients sains sur 60** alarmés.`;
			},
			task: {
				prompt: 'Déplacez le seuil jusqu’à ce qu’**aucun patient malade ne soit manqué** (FN = 0). Combien de fausses alertes cela a-t-il coûté ?'
			}
		},
		{
			title: 'Relever la barre',
			body: (s) => {
				const c = countsOf(s, 0.5);
				return `Retour au seuil 0.50 : le modèle manque **${c.fn}** patients malades et déclenche **${c.fp}** fausses alertes. Supposons que l’hôpital veuille moins d’examens complémentaires inutiles et relève le seuil.`;
			},
			quiz: {
				question: 'Le seuil passe de 0.50 à 0.75. Qu’arrive-t-il aux erreurs ?',
				options: [
					'Les faux positifs diminuent, les faux négatifs augmentent',
					'Les deux types d’erreur diminuent : le test est plus strict',
					'Les faux positifs augmentent, les faux négatifs diminuent',
					'Rien ne change : c’est toujours le même modèle'
				],
				explain: (s) => {
					const a = countsOf(s, 0.5);
					const b = countsOf(s, 0.75);
					return `Un seuil plus strict signale moins de patients. Les fausses alertes passent de **${a.fp} à ${b.fp}**, mais les cas manqués grimpent de **${a.fn} à ${b.fn}**. Quand les scores se chevauchent, tout seuil échange une erreur contre l’autre. Seul un meilleur modèle (moins de chevauchement) réduit les deux.`;
				}
			}
		},
		{
			title: 'Toutes les métriques viennent de quatre cellules',
			body: (s) => {
				const c = countsOf(s);
				return `Les scores habituels ne sont que des rapports entre les cellules :

- **Exactitude** (*accuracy*) = (TP + TN) / total = (${c.tp} + ${c.tn}) / 120 = **${pct(accuracy(c))}**
- **Précision** = TP / (TP + FP) : parmi les patients signalés, combien sont malades ? **${pct(precision(c))}**
- **Rappel** = TP / (TP + FN) : parmi les malades, combien ont été détectés ? **${pct(recall(c))}**
- **Spécificité** = TN / (TN + FP) : parmi les patients sains, combien ont été écartés ? **${pct(specificity(c))}**

Déplacez le seuil et regardez-les tirer dans des directions opposées. [Précision, rappel et F1](concept:precision-recall-f1) ont leur propre leçon, et le Metrics Lab (dans Outils) vous permet de saisir quatre effectifs quelconques.`;
			}
		},
		{
			title: 'Quand l’exactitude ment',
			body: `Les vraies données de dépistage sont rarement équilibrées. Dans ce groupe, seuls **6 patients sur 120** sont malades (5%). Le même modèle au seuil 0.50 les détecte tous les six, au prix de 16 fausses alertes.

Imaginez maintenant un « modèle » paresseux qui ignore les scores et déclare *tout le monde* sain.`,
			quiz: {
				question: 'Quelle exactitude obtient « tout le monde est sain » sur ce groupe ?',
				options: ['5%', '50%', '95%', 'Elle ne peut pas être calculée'],
				explain: (s) => {
					const c = countsOf(s);
					return `Il a raison pour les ${c.tn} patients sains et tort pour les ${c.fn} malades : exactitude **${pct(accuracy(c))}**, rappel **${pct(recall(c))}**. La matrice montre le problème au premier coup d’œil : une cellule TP vide. Voilà pourquoi l’exactitude seule est dangereuse sur des [données déséquilibrées](concept:class-imbalance).`;
				}
			}
		},
		{
			title: 'Les erreurs ont un prix',
			body: (s) => {
				const w = words(s);
				const m = MEANS.fr[s.scenario];
				const c = countsOf(s);
				const best = cheapest(s);
				return `Les erreurs ne se valent pas. En dépistage, un faux positif signifie ${m.fp} ; un faux négatif signifie ${m.fn}. Disons qu’un cas manqué est **${w.costs.fn} fois pire** qu’une fausse alerte.

Coût total = ${w.costs.fp} × FP + ${w.costs.fn} × FN = ${w.costs.fp} × ${c.fp} + ${w.costs.fn} × ${c.fn} = **${costOf(s)}**. La courbe ci-dessous montre le coût à chaque seuil. ${costOf(s) <= best.cost ? '**C’est le coût le plus bas possible.**' : ''}`;
			},
			task: {
				prompt: 'Trouvez le seuil au **coût total le plus bas** (faites glisser la ligne, ou cliquez sur la courbe de coût).'
			}
		},
		{
			title: 'Inverser les coûts : un filtre anti-spam',
			body: (s) => {
				const w = words(s);
				const m = MEANS.fr[s.scenario];
				return `Même idée, autre tâche : le modèle évalue **120 e-mails**, et positif signifie désormais *spam*. Ici, un faux positif signifie ${m.fp}, tandis qu’un faux négatif signifie ${m.fn}. Un vrai e-mail perdu est **${w.costs.fp} fois pire**.

Seuil **${t2(s.thr)}**, coût total **${costOf(s)}**.`;
			},
			quiz: {
				question: 'Par rapport au test de dépistage, où le filtre anti-spam doit-il placer son seuil ?',
				options: [
					'Beaucoup plus bas : signaler davantage d’e-mails comme spam',
					'À peu près au même endroit, vers 0.5',
					'Beaucoup plus haut : ne signaler que les e-mails dont il est très sûr'
				],
				explain: (s) => {
					const best = cheapest(s);
					return `Les faux positifs sont maintenant l’erreur coûteuse, donc le filtre ne doit agir que lorsqu’il est très sûr. Le seuil le moins cher est d’environ **${t2(best.thr)}** (coût ${best.cost}), contre environ **${t2(cheapest({ ...s, scenario: 'medical' }).thr)}** pour le dépistage. Même matrice, mêmes métriques : ce sont les *coûts* qui décident où se placer.`;
				}
			}
		},
		{
			title: 'À vous : bac à sable (playground)',
			body: `Tout est débloqué : changez de scénario, rendez les classes rares, ou rendez le modèle meilleur ou pire avec **qualité du modèle**. Récapitulatif :

1. Un classifieur donne des **scores** ; un **seuil** les transforme en décisions.
2. Chaque exemple tombe dans une cellule : **TP, FN, FP ou TN**. Déplacer le seuil fait passer des exemples d’une cellule à l’autre au sein d’une ligne.
3. L’exactitude, la précision, le rappel et la spécificité sont tous des rapports entre ces quatre effectifs.
4. Choisissez le seuil d’après ce que **coûte** chaque erreur, pas d’après un 0.5 par défaut.

Attention dans le code : la fonction \`confusion_matrix\` de scikit-learn trie les étiquettes, donc la classe négative vient en premier : \`[[TN, FP], [FN, TP]]\`. Pour voir tous les seuils d’un coup, continuez avec les [courbes ROC](concept:roc-auc).`
		}
	]
};

export const ar: LessonText<CMState> = {
	title: 'قراءة مصفوفة الالتباس',
	steps: [
		{
			title: 'المصنِّف يُخرج درجات',
			body: `إليك **120 مريضاً** من اختبار فحص طبي. كل نقطة تمثل مريضاً واحداً. يضم المسار العلوي الـ 60 **المصابين فعلاً**، والمسار السفلي الـ 60 **الأصحاء**.

الموضع الأفقي للنقطة هو **الدرجة (score)** التي أعطاها النموذج لذلك المريض: تقديره لاحتمال أن يكون مصاباً. معظم المرضى يحصلون على درجات عالية ومعظم الأصحاء على درجات منخفضة، لكن المنحنيين الجرسيين **يتداخلان**: بعض الأصحاء يبدون مرضى في نظر النموذج، وبعض المرضى يبدون أصحاء.

النموذج لا يقول «مريض» من تلقاء نفسه. تحويل الدرجات إلى قرارات هو مهمتنا.`
		},
		{
			title: 'العتبة تحوّل الدرجات إلى قرارات',
			body: (s) => {
				const c = countsOf(s);
				return `اختر **عتبة (threshold)**: كل مريض تساوي درجته العتبة أو تتجاوزها يُصنَّف *مريضاً* (تنبؤ إيجابي)، وكل من هو دونها يُعاد إلى منزله *سليماً* (تنبؤ سلبي).

عند العتبة **${t2(s.thr)}** يُصنِّف النموذج **${c.tp + c.fp}** مريضاً على أنهم مصابون ويُبرّئ **${c.fn + c.tn}**. اسحب الخط، أو استخدم المنزلق، وراقب هذه الأعداد وهي تتغير. النموذج لم يتغير إطلاقاً؛ تغيّرت قاعدة القرار فقط.`;
			}
		},
		{
			title: 'أربعة أنواع من النتائج',
			body: (s) => {
				const c = countsOf(s);
				return `قاطِع كل قرار مع الحقيقة، فيقع كل مريض في خانة واحدة بالضبط من أربع خانات. هذا الجدول 2×2 هو **مصفوفة الالتباس (confusion matrix)**:

- **إيجابي صحيح (TP)**، ${c.tp}: مريض وصُنِّف مريضاً. اكتشاف صحيح.
- **سلبي خاطئ (FN)**، ${c.fn}: مريض لكنه أُعيد إلى منزله. حالة *فائتة* (خطأ من النوع الثاني).
- **إيجابي خاطئ (FP)**، ${c.fp}: سليم لكنه صُنِّف مريضاً. *إنذار كاذب* (خطأ من النوع الأول).
- **سلبي صحيح (TN)**، ${c.tn}: سليم وبُرِّئ.

الصفوف تمثل الحقيقة، والأعمدة تمثل التنبؤ. تأخذ النقاط الآن لون خانتها.`;
			}
		},
		{
			title: 'شاهد المصفوفة وهي تمتلئ',
			body: (s) => {
				const c = countsOf(s);
				return `كل نقطة تعبر الخط تنتقل بين خانتين في **الصف** نفسه: المريض المصاب يتنقل بين TP وFN، والسليم بين FP وTN. مجموع كل صف لا يتغير أبداً (60 مريضاً، 60 سليماً)، بل تتغير فقط طريقة تقسيمه.

الآن: اكتُشف **${c.tp} من 60** مريضاً، وأُنذر **${c.fp} من 60** سليماً خطأً.`;
			},
			task: {
				prompt: 'حرّك العتبة حتى **لا يفوتك أي مريض** (FN = 0). كم كلّفك ذلك من الإنذارات الكاذبة؟'
			}
		},
		{
			title: 'ارفع السقف',
			body: (s) => {
				const c = countsOf(s, 0.5);
				return `بالعودة إلى العتبة 0.50، يُفوِّت النموذج **${c.fn}** مرضى ويُطلق **${c.fp}** إنذارات كاذبة. لنفترض أن المستشفى يريد تقليل فحوص المتابعة غير الضرورية فرفع العتبة.`;
			},
			quiz: {
				question: 'ترتفع العتبة من 0.50 إلى 0.75. ماذا يحدث للأخطاء؟',
				options: [
					'تنخفض الإيجابيات الخاطئة وترتفع السلبيات الخاطئة',
					'ينخفض نوعا الخطأ معاً: الاختبار صار أكثر صرامة',
					'ترتفع الإيجابيات الخاطئة وتنخفض السلبيات الخاطئة',
					'لا شيء يتغير: إنه النموذج نفسه'
				],
				explain: (s) => {
					const a = countsOf(s, 0.5);
					const b = countsOf(s, 0.75);
					return `العتبة الأكثر صرامة تُصنِّف عدداً أقل من المرضى. تنخفض الإنذارات الكاذبة من **${a.fp} إلى ${b.fp}**، لكن الحالات الفائتة ترتفع من **${a.fn} إلى ${b.fn}**. حين تتداخل الدرجات، تُبادل أي عتبة خطأً بآخر. وحده نموذج أفضل (بتداخل أقل) يقلّل الاثنين معاً.`;
				}
			}
		},
		{
			title: 'كل المقاييس تأتي من أربع خانات',
			body: (s) => {
				const c = countsOf(s);
				return `المقاييس المعتادة ليست سوى نِسَب بين الخانات:

- **الدقة (accuracy)** = (TP + TN) / الكل = (${c.tp} + ${c.tn}) / 120 = **${pct(accuracy(c))}**
- **الضبط (precision)** = TP / (TP + FP): من بين المُصنَّفين مرضى، كم منهم مريض فعلاً؟ **${pct(precision(c))}**
- **الاستدعاء (recall)** = TP / (TP + FN): من بين المرضى، كم منهم اكتُشف؟ **${pct(recall(c))}**
- **النوعية (specificity)** = TN / (TN + FP): من بين الأصحاء، كم منهم بُرِّئ؟ **${pct(specificity(c))}**

حرّك العتبة وراقبها تتجاذب في اتجاهات مختلفة. لـ[الضبط والاستدعاء وF1](concept:precision-recall-f1) درس خاص بها، ويتيح لك مختبر المقاييس (Metrics Lab، ضمن الأدوات) إدخال أي أربعة أعداد.`;
			}
		},
		{
			title: 'حين تكذب الدقة',
			body: `نادراً ما تكون بيانات الفحص الحقيقية متوازنة. في هذه المجموعة **6 مرضى فقط من 120** مصابون (5%). النموذج نفسه عند العتبة 0.50 يكتشف الستة جميعاً، مقابل 16 إنذاراً كاذباً.

تخيّل الآن «نموذجاً» كسولاً يتجاهل الدرجات ويعلن أن *الجميع* أصحاء.`,
			quiz: {
				question: 'ما الدقة التي يحققها «الجميع أصحاء» على هذه المجموعة؟',
				options: ['5%', '50%', '95%', 'لا يمكن حسابها'],
				explain: (s) => {
					const c = countsOf(s);
					return `إنه محق بشأن جميع الأصحاء الـ ${c.tn} ومخطئ بشأن المرضى الـ ${c.fn}: الدقة **${pct(accuracy(c))}**، والاستدعاء **${pct(recall(c))}**. تكشف المصفوفة المشكلة فوراً: خانة TP فارغة. لهذا السبب الاعتماد على الدقة وحدها خطير مع [البيانات غير المتوازنة](concept:class-imbalance).`;
				}
			}
		},
		{
			title: 'للأخطاء أثمان',
			body: (s) => {
				const w = words(s);
				const m = MEANS.ar[s.scenario];
				const c = countsOf(s);
				const best = cheapest(s);
				return `الأخطاء ليست متساوية في سوئها. في الفحص الطبي، الإيجابي الخاطئ يعني ${m.fp}؛ والسلبي الخاطئ يعني ${m.fn}. لنقل إن تفويت حالة **أسوأ بـ ${w.costs.fn} مرات** من إنذار كاذب.

التكلفة الإجمالية = ${w.costs.fp} × FP + ${w.costs.fn} × FN = ${w.costs.fp} × ${c.fp} + ${w.costs.fn} × ${c.fn} = **${costOf(s)}**. يُظهر المنحنى أدناه التكلفة عند كل عتبة. ${costOf(s) <= best.cost ? '**هذه أقل تكلفة ممكنة.**' : ''}`;
			},
			task: {
				prompt: 'جد العتبة ذات **أقل تكلفة إجمالية** (اسحب الخط، أو انقر على منحنى التكلفة).'
			}
		},
		{
			title: 'اقلب التكاليف: مرشّح البريد المزعج',
			body: (s) => {
				const w = words(s);
				const m = MEANS.ar[s.scenario];
				return `الفكرة نفسها، مهمة مختلفة: يُقيِّم النموذج **120 رسالة بريد إلكتروني**، والإيجابي يعني الآن *بريداً مزعجاً (spam)*. هنا الإيجابي الخاطئ يعني ${m.fp}، بينما السلبي الخاطئ يعني ${m.fn}. ضياع رسالة حقيقية **أسوأ بـ ${w.costs.fp} مرات**.

العتبة **${t2(s.thr)}**، التكلفة الإجمالية **${costOf(s)}**.`;
			},
			quiz: {
				question: 'مقارنةً باختبار الفحص الطبي، أين ينبغي أن يضع مرشّح البريد المزعج عتبته؟',
				options: [
					'أدنى بكثير: يُصنِّف رسائل أكثر على أنها مزعجة',
					'في الموضع نفسه تقريباً، قرب 0.5',
					'أعلى بكثير: لا يُصنِّف إلا الرسائل التي هو واثق منها جداً'
				],
				explain: (s) => {
					const best = cheapest(s);
					return `صار الإيجابي الخاطئ هو الخطأ المكلف، لذا ينبغي ألا يتصرف المرشّح إلا حين يكون واثقاً جداً. أرخص عتبة هي نحو **${t2(best.thr)}** (التكلفة ${best.cost})، مقابل نحو **${t2(cheapest({ ...s, scenario: 'medical' }).thr)}** للفحص الطبي. المصفوفة نفسها، والمقاييس نفسها: *التكاليف* هي التي تحدد أين تقف.`;
				}
			}
		},
		{
			title: 'دورك: ساحة التجريب (playground)',
			body: `كل شيء متاح الآن: بدّل السيناريو، أو اجعل الفئات نادرة، أو اجعل النموذج أفضل أو أسوأ عبر **جودة النموذج**. خلاصة:

1. يعطي المصنِّف **درجات**؛ و**العتبة** تحولها إلى قرارات.
2. يقع كل مثال في خانة واحدة: **TP أو FN أو FP أو TN**. تحريك العتبة ينقل الأمثلة داخل الصف الواحد.
3. الدقة والضبط والاستدعاء والنوعية كلها نِسَب بين هذه الأعداد الأربعة.
4. اختر العتبة بحسب **تكلفة** كل خطأ، لا بحسب قيمة 0.5 الافتراضية.

انتبه في الشيفرة: الدالة \`confusion_matrix\` في scikit-learn ترتّب التسميات، فتأتي الفئة السلبية أولاً: \`[[TN, FP], [FN, TP]]\`. لرؤية جميع العتبات دفعة واحدة، تابع مع [منحنيات ROC](concept:roc-auc).`
		}
	]
};
