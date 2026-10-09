/**
 * French and Arabic narration for the MAE lesson (same step order as index.ts).
 */
import type { LessonText } from '../types.ts';
import * as rg from '../_regression/regression.ts';
import { euro } from '../_regression/plot.ts';
import { B, BASE, BIG_MISS, SHARE_AB, SHARE_OUT, START_C, TOP, TOP_TARGET, WORST, pct, signed } from './narration.ts';
import { MODEL, OUT, mean, median, metrics, type ErrState } from './state.ts';

const sorted = (s: ErrState) => s.ys.slice().sort((a, b) => a - b);

const fr: LessonText<ErrState> = {
	title: 'Comment la MAE mesure l’erreur de prédiction',
	steps: [
		{
			title: 'Erreurs absolues',
			body: `Un modèle de loyers entraîné plus tôt prédit \`ŷ = ${MODEL.w}·size + ${MODEL.b}\` (droite verte). Voici **10 appartements qu'il n'a jamais vus**, avec leurs résidus \`y − ŷ\` en rouge.

Certaines erreurs sont trop hautes, d'autres trop basses. Si on en faisait la moyenne telles quelles, elles se compenseraient (le résidu moyen n'est que de ${signed(B.meanRes)}). La solution de la MAE est la plus simple : **supprimer le signe**. Les barres montrent l'**erreur absolue** \`|y − ŷ|\` de chaque appartement : le ${signed(B.r[WORST])} de l'appartement de ${BASE.xs[WORST]} m² devient **€${Math.abs(B.r[WORST])}**.`
		},
		{
			title: 'En faire la moyenne : la MAE',
			body: (s) => {
				const m = metrics(s);
				return `Faites la moyenne des dix erreurs absolues et vous obtenez l'**erreur absolue moyenne** :

\`MAE = (1/n)·Σ|y − ŷ|\` = **${euro(m.mae)}**

C'est la ligne pointillée. Elle se lit exactement comme elle se dit : *en moyenne, le loyer prédit par le modèle se trompe de ${euro(m.mae)}*. Même unité que la cible, pas de carré, rien à défaire.

Chaque appartement contribue **proportionnellement** à son erreur : une erreur de €200 compte deux fois plus qu'une erreur de €100, pas quatre fois.`;
			}
		},
		{
			title: 'Faites apparaître une valeur aberrante',
			body: (s) => {
				const m = metrics(s);
				return `Comparons maintenant avec la [RMSE](concept:rmse-metric), qui met les erreurs au carré avant la moyenne. Avec les loyers d'origine : MAE ${euro(B.mae)}, RMSE ${euro(B.rmse)}.

Actuellement : **MAE ${euro(m.mae)}**, **RMSE ${euro(m.rmse)}**. Éloignez un appartement de la droite et regardez : la MAE augmente d'exactement 1/10 de l'erreur supplémentaire, la RMSE de plus en plus vite.`;
			},
			task: {
				prompt: `Faites glisser un appartement jusqu'à ce que son erreur dépasse **€${BIG_MISS}**.`
			}
		},
		{
			title: 'Qui porte le blâme ?',
			body: `Ici, l'appartement de ${BASE.xs[OUT]} m² se loue **€${SHARE_OUT} de plus** que ce que prévoit le modèle (disons que c'est un penthouse). C'est un appartement sur dix.

La barre du haut montre la part de chaque appartement dans l'erreur **absolue** totale : la part de la valeur aberrante est de **${pct(SHARE_AB)}**.`,
			quiz: {
				question: 'Quelle part de l’erreur au carré totale (sur laquelle repose la RMSE) cet appartement prend-il ?',
				options: ['À peu près la même, moins de la moitié', 'Environ 80 %', '100 % : les erreurs au carré ignorent les autres appartements'],
				explain: (s) => {
					const m = metrics(s);
					return `**${pct(m.outShareSq)}** de l'erreur au carré vient de ce seul appartement, contre ${pct(m.outShareAb)} de l'erreur absolue. C'est pourquoi la RMSE (**${euro(m.rmse)}**) parle surtout de la valeur aberrante, tandis que la MAE (**${euro(m.mae)}**) décrit encore l'appartement typique. La MAE est **robuste** aux valeurs aberrantes : aucun point isolé ne peut prendre le dessus.`;
				}
			}
		},
		{
			title: 'Le modèle le plus simple : un seul nombre',
			body: `Oubliez la surface. Supposons que le « modèle » doive prédire **le même loyer c pour chaque appartement**. Quel c est le meilleur ?

Le penthouse est toujours dans les données : les loyers sont souvent tirés vers le haut par quelques appartements chers. Le graphique ci-dessous trace la MAE et la RMSE pour chaque c possible. La ligne verte correspond à c = ${euro(START_C)}.`,
			quiz: {
				question: 'Quelle constante c donne la MAE la plus basse ?',
				options: ['Le loyer moyen', 'Le loyer médian (la valeur du milieu)', 'Le milieu entre l’appartement le moins cher et le plus cher'],
				explain: (s) => `La **médiane**, ${euro(median(s))}. Imaginez que vous montez c de €1 : chaque appartement *en dessous* de c gagne €1 d'erreur, chaque appartement *au-dessus* en perd €1. Tant qu'il y a plus d'appartements au-dessus, monter c aide. Le point d'équilibre, avec la moitié des appartements de chaque côté, est la médiane. Avec un nombre pair (10), tout c entre les deux loyers du milieu (${euro(sorted(s)[4])} et ${euro(sorted(s)[5])}) fait aussi bien : la courbe de la MAE a un fond plat à cet endroit. L'erreur au carré, elle, équilibre les *tailles* des erreurs de chaque côté, ce qui se produit à la **moyenne**, ${euro(mean(s))}.`
			}
		},
		{
			title: 'Trouver les deux fonds',
			body: (s) => `MAE(c) est faite de segments droits avec un coude au loyer de chaque appartement, car \`|y − c|\` a un angle vif. C'est aussi pour cela que la MAE est peu pratique comme perte d'*entraînement* : sa pente saute au lieu de varier en douceur, et les optimiseurs ont besoin de sous-gradients. RMSE(c) est une cuvette lisse.

c = **${euro(s.c)}** : MAE ${euro(rg.constMae(s.ys, s.c))}, RMSE ${euro(rg.constRmse(s.ys, s.c))}.`,
			task: {
				prompt: 'Faites glisser la ligne verte (ou cliquez sur le graphique) jusqu’au **fond de la courbe MAE**, puis jusqu’au **fond de la courbe RMSE**.'
			}
		},
		{
			title: 'Les valeurs aberrantes tirent la moyenne, pas la médiane',
			body: (s) => `Le penthouse a disparu ; les dix loyers d'origine sont de retour.

Loyer moyen : **${euro(mean(s))}** (au départ ${euro(rg.mean(BASE.ys))}). Loyer médian : **${euro(median(s))}** (au départ ${euro(rg.median(BASE.ys))}).

Augmenter l'appartement le plus cher entraîne la moyenne, et toute la courbe de la RMSE, avec lui. La médiane ne s'intéresse qu'à quels appartements sont au-dessus ou en dessous du milieu, pas de combien. Il en va de même pour des modèles complets : une régression entraînée sur l'erreur absolue (régression médiane) ignore les valeurs aberrantes qui feraient basculer une [régression linéaire](concept:linear-regression) par moindres carrés.`,
			task: {
				prompt: `Faites monter l'appartement le plus cher (${euro(BASE.ys[TOP])}) jusqu'à **${euro(TOP_TARGET)}** ou plus et observez les deux repères.`
			}
		},
		{
			title: 'MAE ou RMSE ?',
			body: `Les deux sont dans l'unité de la cible, les deux sont une « erreur moyenne ». Elles répondent à des questions différentes.`,
			quiz: {
				question: 'Vous prédisez des délais de livraison. Une livraison avec 60 minutes de retard est bien pire pour les clients que six avec 10 minutes de retard. Quelle métrique correspond à cela ?',
				options: ['La MAE : elle traite les deux cas pareil (60 minutes d’erreur chacun)', 'La RMSE : l’unique retard de 60 minutes coûte plus cher', 'L’une ou l’autre : elles classent toujours les modèles de la même façon'],
				explain: `La MAE compte les deux situations comme 60 minutes d'erreur au total. L'erreur au carré compte un retard de 60 minutes comme 3,600 contre 6 × 100 = 600 pour les petits, donc la **RMSE** pénalise la grosse erreur. Utilisez la **MAE** quand chaque unité d'erreur coûte pareil, ou quand les valeurs aberrantes des données ne doivent pas orienter votre évaluation ; utilisez la **RMSE** quand les grosses erreurs sont disproportionnellement graves. Les deux peuvent même classer les modèles différemment, c'est pourquoi on rapporte souvent les deux.`
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué : basculez entre le modèle et une constante, déplacez des appartements, ajoutez la valeur aberrante. Récapitulatif :

1. MAE = moyenne de \`|y − ŷ|\` : « on se trompe de tant en moyenne », dans l'unité de la cible.
2. Chaque erreur compte proportionnellement, donc la MAE est **robuste aux valeurs aberrantes**.
3. La meilleure constante selon la MAE est la **médiane** ; selon l'erreur au carré, c'est la **moyenne**.
4. |x| a un coude en 0, donc la MAE est moins pratique comme perte d'entraînement.
5. MAE ≤ [RMSE](concept:rmse-metric), toujours. Rapportez les deux pour repérer quelques grosses erreurs.

Dans scikit-learn : \`mean_absolute_error(y, y_pred)\` ; \`median_absolute_error\` est encore plus robuste.`
		}
	]
};

const ar: LessonText<ErrState> = {
	title: 'كيف يقيس MAE خطأ التنبؤ',
	steps: [
		{
			title: 'الأخطاء المطلقة',
			body: `نموذج إيجارات دُرّب سابقًا يتنبأ بـ\`ŷ = ${MODEL.w}·size + ${MODEL.b}\` (الخط الأخضر). هذه **10 شقق لم يرها من قبل**، مع بواقيها \`y − ŷ\` باللون الأحمر.

بعض الأخطاء أعلى من اللازم وبعضها أدنى. لو أخذنا متوسطها كما هي لألغى بعضها بعضًا (متوسط البواقي ${signed(B.meanRes)} فقط). الحل الذي يعتمده MAE هو الأبسط: **حذف الإشارة**. تُظهر الأعمدة **الخطأ المطلق** \`|y − ŷ|\` لكل شقة: الباقي ${signed(B.r[WORST])} للشقة ذات ${BASE.xs[WORST]} m² يصبح **€${Math.abs(B.r[WORST])}**.`
		},
		{
			title: 'خذ المتوسط: MAE',
			body: (s) => {
				const m = metrics(s);
				return `خذ متوسط الأخطاء المطلقة العشرة فتحصل على **متوسط الخطأ المطلق** (MAE):

\`MAE = (1/n)·Σ|y − ŷ|\` = **${euro(m.mae)}**

هذا هو الخط المتقطع. ويُقرأ تمامًا كما يُلفظ: *في المتوسط، يخطئ إيجار النموذج بـ${euro(m.mae)}*. بوحدة الهدف نفسها، بلا تربيع، ولا شيء يحتاج إلى عكس.

تساهم كل شقة **بما يتناسب** مع خطئها: خطأ €200 يُحتسب ضعف خطأ €100، لا أربعة أضعافه.`;
			}
		},
		{
			title: 'اسحب قيمة شاذة',
			body: (s) => {
				const m = metrics(s);
				return `قارن الآن مع [RMSE](concept:rmse-metric)، الذي يربّع الأخطاء قبل أخذ المتوسط. مع الإيجارات الأصلية: MAE ${euro(B.mae)}، RMSE ${euro(B.rmse)}.

الآن: **MAE ${euro(m.mae)}**، **RMSE ${euro(m.rmse)}**. ادفع شقة بعيدًا عن الخط وراقب: يزداد MAE بمقدار 1/10 من الخطأ الإضافي بالضبط، بينما يزداد RMSE بسرعة متصاعدة.`;
			},
			task: {
				prompt: `اسحب شقة واحدة حتى يتجاوز خطؤها **€${BIG_MISS}**.`
			}
		},
		{
			title: 'على من يقع اللوم؟',
			body: `هنا تؤجَّر الشقة ذات ${BASE.xs[OUT]} m² بـ**€${SHARE_OUT} أكثر** مما يتوقعه النموذج (لنقل إنها شقة فاخرة على السطح). إنها شقة واحدة من عشر.

يُظهر العمود العلوي حصة كل شقة من مجموع الخطأ **المطلق**: حصة القيمة الشاذة **${pct(SHARE_AB)}**.`,
			quiz: {
				question: 'ما حصة تلك الشقة من مجموع مربعات الخطأ (الذي يُبنى عليه RMSE)؟',
				options: ['الحصة نفسها تقريبًا، أقل من النصف', 'نحو 80%', '100%: مربعات الأخطاء تتجاهل الشقق الأخرى'],
				explain: (s) => {
					const m = metrics(s);
					return `**${pct(m.outShareSq)}** من مربعات الخطأ تأتي من تلك الشقة وحدها، مقابل ${pct(m.outShareAb)} من الخطأ المطلق. لهذا يكون RMSE (**${euro(m.rmse)}**) في معظمه تقريرًا عن القيمة الشاذة، بينما لا يزال MAE (**${euro(m.mae)}**) يصف الشقة المعتادة. MAE **متين** (robust) أمام القيم الشاذة: لا تستطيع نقطة منفردة السيطرة عليه.`;
				}
			}
		},
		{
			title: 'أبسط نموذج: رقم واحد',
			body: `انسَ المساحة. لنفترض أن «النموذج» يجب أن يتنبأ **بالإيجار نفسه c لكل شقة**. ما أفضل قيمة لـc؟

الشقة الفاخرة لا تزال في البيانات: عادةً ما تنحرف الإيجارات بسبب بضع شقق باهظة. يرسم المخطط أدناه MAE وRMSE لكل قيمة ممكنة لـc. الخط الأخضر هو c = ${euro(START_C)}.`,
			quiz: {
				question: 'أي ثابت c يعطي أدنى MAE؟',
				options: ['متوسط الإيجارات', 'وسيط الإيجارات (القيمة الوسطى)', 'منتصف المسافة بين أرخص شقة وأغلاها'],
				explain: (s) => `**الوسيط**، ${euro(median(s))}. تخيّل رفع c بمقدار €1: كل شقة *تحت* c يزيد خطؤها €1، وكل شقة *فوقها* ينقص خطؤها €1. ما دامت الشقق فوقها أكثر، فرفع c يفيد. نقطة التوازن، حيث نصف الشقق على كل جانب، هي الوسيط. مع عدد زوجي (10)، تتعادل أي قيمة c بين الإيجارين الأوسطين (${euro(sorted(s)[4])} و${euro(sorted(s)[5])}): لمنحنى MAE قاع مستوٍ هناك. أما مربع الخطأ فيوازن *أحجام* الأخطاء على كل جانب، وهذا يحدث عند **المتوسط**، ${euro(mean(s))}.`
			}
		},
		{
			title: 'جد القاعين',
			body: (s) => `يتكوّن MAE(c) من قطع مستقيمة مع انكسار عند إيجار كل شقة، لأن \`|y − c|\` له زاوية حادة. ولهذا أيضًا يكون MAE غير مريح كخسارة *تدريب*: ميله يقفز بدل أن يتغير بسلاسة، فتحتاج المُحسِّنات إلى التدرجات الجزئية (sub-gradients). أما RMSE(c) فوعاء أملس.

c = **${euro(s.c)}**: MAE ${euro(rg.constMae(s.ys, s.c))}، RMSE ${euro(rg.constRmse(s.ys, s.c))}.`,
			task: {
				prompt: 'اسحب الخط الأخضر (أو انقر على المخطط) إلى **قاع منحنى MAE**، ثم إلى **قاع منحنى RMSE**.'
			}
		},
		{
			title: 'القيم الشاذة تشد المتوسط لا الوسيط',
			body: (s) => `اختفت الشقة الفاخرة؛ وعادت الإيجارات العشرة الأصلية.

متوسط الإيجار: **${euro(mean(s))}** (كان في البداية ${euro(rg.mean(BASE.ys))}). وسيط الإيجار: **${euro(median(s))}** (كان في البداية ${euro(rg.median(BASE.ys))}).

رفع أغلى شقة يجرّ معه المتوسط ومنحنى RMSE كله. أما الوسيط فلا يهمه إلا أي الشقق فوق المنتصف أو تحته، لا بكم. والأمر نفسه ينطبق على النماذج الكاملة: الانحدار المدرَّب على الخطأ المطلق (انحدار الوسيط) لا يكترث بالقيم الشاذة التي كانت ستُميل [الانحدار الخطي](concept:linear-regression) بالمربعات الصغرى.`,
			task: {
				prompt: `اسحب أغلى شقة (${euro(BASE.ys[TOP])}) إلى **${euro(TOP_TARGET)}** أو أكثر وراقب العلامتين.`
			}
		},
		{
			title: 'MAE أم RMSE؟',
			body: `كلاهما بوحدة الهدف، وكلاهما «متوسط خطأ». لكنهما يجيبان عن سؤالين مختلفين.`,
			quiz: {
				question: 'أنت تتنبأ بأوقات التوصيل. توصيلة واحدة متأخرة 60 دقيقة أسوأ بكثير للعملاء من ست توصيلات متأخرة 10 دقائق. أي مقياس يوافق ذلك؟',
				options: ['MAE: يعامل الحالتين بالتساوي (60 دقيقة خطأ لكل منهما)', 'RMSE: التأخير الوحيد البالغ 60 دقيقة يكلّف أكثر', 'أيهما: فهما يرتّبان النماذج دائمًا بالطريقة نفسها'],
				explain: `يحتسب MAE الحالتين كـ60 دقيقة من الخطأ الإجمالي. أما مربع الخطأ فيحتسب التأخير الواحد البالغ 60 دقيقة كـ3,600 مقابل 6 × 100 = 600 للتأخيرات الصغيرة، لذا يعاقب **RMSE** الخطأ الكبير. استخدم **MAE** حين تكلّف كل وحدة خطأ القدر نفسه، أو حين لا ينبغي للقيم الشاذة في البيانات أن توجّه تقييمك؛ واستخدم **RMSE** حين تكون الأخطاء الكبيرة سيئة بشكل غير متناسب. وقد يرتّب المقياسان النماذج بشكل مختلف، لذا من الشائع عرض كليهما.`
			}
		},
		{
			title: 'دورك: ساحة التجربة',
			body: `كل شيء متاح الآن: بدّل بين النموذج والثابت، اسحب الشقق، أضف القيمة الشاذة. للتلخيص:

1. MAE = متوسط \`|y − ŷ|\`: «نخطئ بهذا القدر في المتوسط»، بوحدة الهدف.
2. يُحتسب كل خطأ بما يتناسب مع حجمه، لذا MAE **متين أمام القيم الشاذة**.
3. أفضل ثابت وفق MAE هو **الوسيط**؛ ووفق مربع الخطأ هو **المتوسط**.
4. للدالة |x| انكسار عند 0، لذا MAE أقل ملاءمة كخسارة تدريب.
5. MAE ≤ [RMSE](concept:rmse-metric) دائمًا. اعرض كليهما لاكتشاف بضعة أخطاء كبيرة.

في scikit-learn: \`mean_absolute_error(y, y_pred)\`؛ و\`median_absolute_error\` أكثر متانة.`
		}
	]
};

export default { fr, ar };
