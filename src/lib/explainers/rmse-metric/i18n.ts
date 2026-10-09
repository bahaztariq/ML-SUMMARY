/**
 * French and Arabic narration for the RMSE lesson (same step order as index.ts).
 */
import { fmt } from '#lib/viz/canvas.ts';
import type { LessonText } from '../types.ts';
import { euro } from '../_regression/plot.ts';
import { B, BASE, EQUAL, QUIZ_OUT, RATIO_TARGET, WORST, big, signed } from './narration.ts';
import { MODEL, OUT, metrics, type ErrState } from './state.ts';

const fr: LessonText<ErrState> = {
	title: 'Comment la RMSE mesure l’erreur de prédiction',
	steps: [
		{
			title: 'Prédictions et réalité',
			body: `Un modèle de loyers entraîné plus tôt prédit \`ŷ = ${MODEL.w}·size + ${MODEL.b}\` (droite verte). Ici, il rencontre **10 appartements qu'il n'a jamais vus**.

Pour chaque appartement, le **résidu** est le loyer réel moins le loyer prédit, \`y − ŷ\` (segments rouges, et barres en dessous). L'appartement de ${BASE.xs[WORST]} m² se loue ${euro(BASE.ys[WORST])} mais le modèle annonçait ${euro(BASE.ys[WORST] - B.r[WORST])} : un résidu de **${signed(B.r[WORST])}**.

On veut **un seul nombre** qui dise de combien le modèle se trompe en général.`
		},
		{
			title: 'Pourquoi ne pas simplement en faire la moyenne ?',
			body: `L'idée la plus simple : faire la moyenne des dix résidus. Regardez les barres : certaines montent (le modèle a sous-estimé), d'autres descendent (il a surestimé).`,
			quiz: {
				question: `Les résidus vont de ${signed(Math.min(...B.r))} à ${signed(Math.max(...B.r))}. Quelle est leur moyenne ?`,
				options: ['Environ €85 : la taille typique d’une erreur', `Environ ${signed(B.meanRes)} : les hausses et les baisses se compensent`, 'Exactement €0, pour n’importe quel modèle'],
				explain: `Le résidu moyen n'est que de **${signed(B.meanRes)}**, alors que le modèle se trompe souvent de €100 ou plus. Les erreurs positives et négatives **se compensent**. Le résidu moyen renseigne sur le *biais* (prédire trop haut ou trop bas en moyenne), pas sur la taille des erreurs. Il faut d'abord se débarrasser du signe : prendre les valeurs absolues ([MAE](concept:mae-metric)) ou les **mettre au carré** (étape suivante).`
			}
		},
		{
			title: 'Mettre chaque résidu au carré',
			body: (s) => {
				const m = metrics(s);
				return `La mise au carré rend chaque erreur positive, et elle fait **beaucoup plus compter les grosses erreurs** : une erreur de €30 devient 900, mais l'erreur de ${signed(B.r[WORST])} devient **${big(B.r[WORST] ** 2)}**. Sur le nuage de points, l'aire de chaque carré est l'erreur au carré de cet appartement.

La moyenne des carrés est l'**erreur quadratique moyenne** : **MSE = ${big(m.mse)}**. Mais dans quelle unité ? Des euros × euros, des « €² ». Personne ne peut se représenter ${big(m.mse)} euros carrés.`;
			}
		},
		{
			title: 'Retour aux euros : la racine carrée',
			body: (s) => {
				const m = metrics(s);
				return `Prenez la racine carrée de la MSE et vous revenez dans l'unité de la cible :

\`RMSE = √( (1/n)·Σ(y − ŷ)² ) = √${big(m.mse)} ≈ ${euro(m.rmse)}\`

Les prédictions du modèle se trompent donc typiquement d'environ **${euro(m.rmse)}**. La bande ombrée correspond au modèle ± une RMSE : la plupart des appartements tombent dedans.

C'est la même unité que le loyer, donc vous pouvez dire à un interlocuteur « environ ${euro(m.rmse)} par mois » et il comprend ce que cela signifie.`;
			}
		},
		{
			title: 'Les grosses erreurs dominent',
			body: (s) => {
				const m = metrics(s);
				return `À cause de la mise au carré, la RMSE écoute surtout les **plus grosses** erreurs. Pour l'instant, l'appartement avec la plus grosse erreur représente à lui seul **${Math.round(m.topShareSq * 100)} %** de toute l'erreur au carré ; la RMSE vaut **${euro(m.rmse)}**.`;
			},
			task: {
				prompt: `Faites glisser un appartement jusqu'à ce qu'il représente plus des **deux tiers** de l'erreur au carré totale. Regardez son carré grandir.`
			}
		},
		{
			title: 'Une valeur aberrante',
			body: `Retour aux loyers d'origine. Supposons maintenant qu'un appartement (celui de ${BASE.xs[OUT]} m²) soit en fait un penthouse de luxe loué **€${QUIZ_OUT} de plus** que ses voisins. Le modèle, qui ne voit que la surface, ne peut pas le savoir.`,
			quiz: {
				question: `La RMSE vaut ${euro(B.rmse)} maintenant. Seul 1 appartement sur 10 change. Que vaudra la RMSE ?`,
				options: [`Environ ${euro(B.rmse + 15)} : ce n'est qu'un appartement sur dix`, `Environ ${euro(B.rmse + 80)}`, 'Environ €270 : plus du double'],
				explain: (s) => {
					const m = metrics(s);
					return `La RMSE bondit de ${euro(B.rmse)} à **${euro(m.rmse)}**. L'erreur au carré de cet appartement vaut ${big(m.sq[OUT])}, environ **${Math.round(m.outShareSq * 100)} %** du total. En comparaison, la [MAE](concept:mae-metric) (erreur *absolue* moyenne) passe seulement de ${euro(B.mae)} à **${euro(m.mae)}**.`;
				}
			}
		},
		{
			title: 'RMSE ou MAE',
			body: (s) => {
				const m = metrics(s);
				return `Suivez les deux métriques ensemble. On a toujours **RMSE ≥ MAE**, et l'écart est parlant : quand la RMSE est bien plus grande que la MAE, quelques grosses erreurs dominent.

Valeur aberrante +€${s.outlier} : MAE **${euro(m.mae)}**, RMSE **${euro(m.rmse)}**, ratio **${fmt(m.ratio)}**.

Laquelle rapporter ? La RMSE quand une grosse erreur est vraiment pire que plusieurs petites (une erreur de €1,000 fait plus mal que dix de €100). La MAE quand chaque euro d'erreur coûte pareil, ou quand les données contiennent des valeurs aberrantes qu'on ne veut pas voir dominer.`;
			},
			task: {
				prompt: `Déplacez le curseur de la valeur aberrante jusqu'à ce que la RMSE vaille au moins **${RATIO_TARGET}×** la MAE.`
			}
		},
		{
			title: 'Quand sont-elles égales ?',
			body: `La RMSE met au carré, fait la moyenne, puis prend la racine. La MAE fait simplement la moyenne des tailles. Sur des données réelles, la RMSE est plus grande. Peut-elle jamais être exactement égale à la MAE ?`,
			quiz: {
				question: 'Quand la RMSE est-elle exactement égale à la MAE ?',
				options: ['Seulement quand toutes les erreurs sont nulles', 'Chaque fois que toutes les erreurs ont la même taille', 'Jamais : la RMSE est toujours strictement plus grande'],
				explain: (s) => {
					const m = metrics(s);
					return `Si chaque appartement est décalé d'exactement €${EQUAL} (vers le haut ou le bas), tous les carrés sont identiques et les deux métriques donnent **${euro(m.rmse)}** (ratio ${fmt(m.ratio)}). Plus les erreurs sont *inégales*, plus la RMSE dépasse la MAE.`;
				}
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué : déplacez des appartements, ajoutez la valeur aberrante, changez de graphique. Récapitulatif :

1. Résidu = \`y − ŷ\`. Faire la moyenne des résidus laisse les hausses et les baisses se compenser.
2. Les **mettre au carré** (MSE) : toujours positif, les grosses erreurs pèsent plus.
3. **Racine carrée** (RMSE) : retour à l'unité de la cible.
4. RMSE ≥ MAE ; un grand écart signifie que quelques grosses erreurs dominent.
5. La RMSE est ce que minimisent les moindres carrés (comme la [régression linéaire](concept:linear-regression)). Utilisez le [R²](concept:r2-score) pour comparer à une référence qui ne fait rien.

Dans scikit-learn : \`root_mean_squared_error(y, y_pred)\` (ou \`np.sqrt(mean_squared_error(...))\`).`
		}
	]
};

const ar: LessonText<ErrState> = {
	title: 'كيف يقيس RMSE خطأ التنبؤ',
	steps: [
		{
			title: 'التنبؤات مقابل الواقع',
			body: `نموذج إيجارات دُرّب سابقًا يتنبأ بـ\`ŷ = ${MODEL.w}·size + ${MODEL.b}\` (الخط الأخضر). هنا يواجه **10 شقق لم يرها من قبل**.

لكل شقة، **الباقي** (residual) هو الإيجار الفعلي ناقص الإيجار المتنبأ به، \`y − ŷ\` (القطع الحمراء، والأعمدة في الأسفل). الشقة ذات ${BASE.xs[WORST]} m² تؤجَّر بـ${euro(BASE.ys[WORST])} لكن النموذج قال ${euro(BASE.ys[WORST] - B.r[WORST])}: باقٍ قدره **${signed(B.r[WORST])}**.

نريد **رقمًا واحدًا** يخبرنا بمقدار خطأ النموذج المعتاد.`
		},
		{
			title: 'لماذا لا نأخذ متوسطها ببساطة؟',
			body: `أبسط فكرة: نأخذ متوسط البواقي العشرة. انظر إلى الأعمدة: بعضها يتجه لأعلى (النموذج قدّر أقل من اللازم)، وبعضها لأسفل (قدّر أكثر من اللازم).`,
			quiz: {
				question: `تتراوح البواقي بين ${signed(Math.min(...B.r))} و${signed(Math.max(...B.r))}. ما متوسطها؟`,
				options: ['نحو €85: الحجم المعتاد للخطأ', `نحو ${signed(B.meanRes)}: الصعود والهبوط يلغي بعضهما`, 'صفر تمامًا، لأي نموذج'],
				explain: `متوسط البواقي **${signed(B.meanRes)}** فقط، مع أن النموذج يخطئ كثيرًا بـ€100 أو أكثر. الأخطاء الموجبة والسالبة **يلغي بعضها بعضًا**. متوسط البواقي يخبرك عن *الانحياز* (bias) (التقدير الزائد أو الناقص في المتوسط)، لا عن حجم الأخطاء. يجب التخلص من الإشارة أولًا: نأخذ القيم المطلقة ([MAE](concept:mae-metric)) أو **نربّعها** (الخطوة التالية).`
			}
		},
		{
			title: 'ربّع كل باقٍ',
			body: (s) => {
				const m = metrics(s);
				return `التربيع يجعل كل خطأ موجبًا، ويجعل **الأخطاء الكبيرة أثقل وزنًا بكثير**: خطأ €30 يصبح 900، أما خطأ ${signed(B.r[WORST])} فيصبح **${big(B.r[WORST] ** 2)}**. في مخطط الانتشار، مساحة كل مربع هي مربع خطأ تلك الشقة.

متوسط المربعات هو **متوسط مربع الخطأ** (MSE): **MSE = ${big(m.mse)}**. لكن بأي وحدة؟ يورو × يورو، أي «€²». لا أحد يستطيع تخيّل ${big(m.mse)} يورو مربع.`;
			}
		},
		{
			title: 'العودة إلى اليورو: الجذر التربيعي',
			body: (s) => {
				const m = metrics(s);
				return `خذ الجذر التربيعي لـMSE فتعود إلى وحدة الهدف:

\`RMSE = √( (1/n)·Σ(y − ŷ)² ) = √${big(m.mse)} ≈ ${euro(m.rmse)}\`

إذن تخطئ تنبؤات النموذج عادةً بنحو **${euro(m.rmse)}**. النطاق المظلل هو النموذج ± RMSE واحد: معظم الشقق تقع داخله.

إنها وحدة الإيجار نفسها، فيمكنك أن تقول لصاحب القرار «نحو ${euro(m.rmse)} شهريًا» فيفهم المعنى.`;
			}
		},
		{
			title: 'الأخطاء الكبيرة تهيمن',
			body: (s) => {
				const m = metrics(s);
				return `بسبب التربيع، يُصغي RMSE أكثر ما يُصغي إلى **أكبر** الأخطاء. الآن الشقة ذات الخطأ الأكبر وحدها تمثل **${Math.round(m.topShareSq * 100)}%** من مجموع مربعات الخطأ؛ وRMSE يساوي **${euro(m.rmse)}**.`;
			},
			task: {
				prompt: `اسحب شقة واحدة حتى تمثل أكثر من **الثلثين** من مجموع مربعات الخطأ. راقب مربعها يكبر.`
			}
		},
		{
			title: 'قيمة شاذة واحدة',
			body: `نعود إلى الإيجارات الأصلية. لنفترض الآن أن شقة واحدة (ذات ${BASE.xs[OUT]} m²) هي في الحقيقة شقة فاخرة على السطح تؤجَّر بـ**€${QUIZ_OUT} أكثر** من جيرانها. النموذج، الذي لا يرى إلا المساحة، لا يمكنه معرفة ذلك.`,
			quiz: {
				question: `RMSE الآن ${euro(B.rmse)}. شقة واحدة فقط من 10 تتغير. كم سيصبح RMSE؟`,
				options: [`نحو ${euro(B.rmse + 15)}: إنها شقة واحدة من عشر`, `نحو ${euro(B.rmse + 80)}`, 'نحو €270: أكثر من الضعف'],
				explain: (s) => {
					const m = metrics(s);
					return `يقفز RMSE من ${euro(B.rmse)} إلى **${euro(m.rmse)}**. مربع خطأ تلك الشقة ${big(m.sq[OUT])}، أي نحو **${Math.round(m.outShareSq * 100)}%** من المجموع. للمقارنة، لا يرتفع [MAE](concept:mae-metric) (متوسط الخطأ *المطلق*) إلا من ${euro(B.mae)} إلى **${euro(m.mae)}**.`;
				}
			}
		},
		{
			title: 'RMSE مقابل MAE',
			body: (s) => {
				const m = metrics(s);
				return `تابع المقياسين معًا. **RMSE ≥ MAE** دائمًا، والفجوة بينهما تخبرك بشيء: عندما يكون RMSE أكبر بكثير من MAE، فإن قلة من الأخطاء الكبيرة تهيمن.

القيمة الشاذة +€${s.outlier}: MAE **${euro(m.mae)}**، RMSE **${euro(m.rmse)}**، النسبة **${fmt(m.ratio)}**.

أيهما تعرض؟ RMSE حين يكون الخطأ الكبير أسوأ فعلًا من عدة أخطاء صغيرة (خطأ €1,000 يؤلم أكثر من عشرة أخطاء بـ€100). وMAE حين يكلّف كل يورو من الخطأ القدر نفسه، أو حين تحوي البيانات قيمًا شاذة لا تريدها أن تهيمن.`;
			},
			task: {
				prompt: `حرّك شريط القيمة الشاذة حتى يصبح RMSE على الأقل **${RATIO_TARGET}×** قيمة MAE.`
			}
		},
		{
			title: 'متى يتساويان؟',
			body: `RMSE يربّع ثم يأخذ المتوسط ثم الجذر. أما MAE فيأخذ متوسط الأحجام فقط. على البيانات الحقيقية يخرج RMSE أكبر. فهل يمكن أن يساوي MAE تمامًا؟`,
			quiz: {
				question: 'متى يساوي RMSE قيمة MAE تمامًا؟',
				options: ['فقط عندما تكون كل الأخطاء صفرًا', 'كلما كانت كل الأخطاء بالحجم نفسه', 'أبدًا: RMSE دائمًا أكبر تمامًا'],
				explain: (s) => {
					const m = metrics(s);
					return `إذا أخطأ التنبؤ لكل شقة بـ€${EQUAL} بالضبط (صعودًا أو هبوطًا)، تتساوى كل المربعات ويعطي المقياسان **${euro(m.rmse)}** (النسبة ${fmt(m.ratio)}). كلما كانت الأخطاء *أكثر تفاوتًا*، ارتفع RMSE فوق MAE أكثر.`;
				}
			}
		},
		{
			title: 'دورك: ساحة التجربة',
			body: `كل شيء متاح الآن: اسحب الشقق، أضف القيمة الشاذة، بدّل المخططات. للتلخيص:

1. الباقي = \`y − ŷ\`. أخذ متوسط البواقي يجعل الصعود والهبوط يلغي بعضهما.
2. **ربّعها** (MSE): موجبة دائمًا، والأخطاء الكبيرة أثقل وزنًا.
3. **الجذر التربيعي** (RMSE): العودة إلى وحدة الهدف.
4. RMSE ≥ MAE؛ والفجوة الكبيرة تعني أن قلة من الأخطاء الكبيرة تهيمن.
5. RMSE هو ما تقلّله المربعات الصغرى (مثل [الانحدار الخطي](concept:linear-regression)). استخدم [R²](concept:r2-score) للمقارنة مع خط أساس لا يفعل شيئًا.

في scikit-learn: \`root_mean_squared_error(y, y_pred)\` (أو \`np.sqrt(mean_squared_error(...))\`).`
		}
	]
};

export default { fr, ar };
