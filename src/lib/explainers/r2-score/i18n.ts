/**
 * French and Arabic narration for the R² lesson (same step order as index.ts).
 */
import { fmt } from '#lib/viz/canvas.ts';
import type { LessonText } from '../types.ts';
import { euro } from '../_regression/plot.ts';
import { JUNK, R2_TASK, big, r3 } from './narration.ts';
import { N_TRAIN, SCORES, stats, type R2State } from './state.ts';

const fr: LessonText<R2State> = {
	title: 'Comment le R² compare un modèle à la moyenne',
	steps: [
		{
			title: 'La référence paresseuse',
			body: (s) => `Quatorze appartements : surface et loyer mensuel. Avant de construire un modèle, que pourriez-vous faire de mieux **sans rien savoir de la surface** ?

Prédire le **loyer moyen** pour chaque appartement : ȳ = **${euro(stats(s).ybar)}** (ligne pointillée). C'est un modèle paresseux, mais un étalon utile. Les segments ambre montrent l'écart de chaque appartement à cette moyenne.

Le R² répond à une seule question : *de combien mon modèle fait-il mieux que cette référence ?*`
		},
		{
			title: 'SS_tot : la dispersion totale',
			body: (s) => `Mettez au carré chaque distance à la moyenne (les carrés ambre) et additionnez-les :

\`SS_tot = Σ(y − ȳ)²\` = **${big(stats(s).tot)}**

C'est la **variation totale** des loyers, l'erreur de la référence. Divisez-la par n et vous obtenez la variance de y. C'est ce qu'il y a à expliquer.`
		},
		{
			title: 'SS_res : ce que le modèle laisse',
			body: (s) => {
				const st = stats(s);
				return `Voici maintenant un vrai modèle : une [régression linéaire](concept:linear-regression) par moindres carrés sur la surface (droite bleue). Ses résidus au carré sont les carrés bleus :

\`SS_res = Σ(y − ŷ)²\` = **${big(st.res)}**

Comparez les deux barres. L'erreur restante du modèle vaut ${Math.round((st.res / st.tot) * 100)} % de celle de la référence, donc :

\`R² = 1 − SS_res / SS_tot\` = **${r3(st.r2)}**

Le modèle **explique ${Math.round(st.r2 * 100)} % de la variation** du loyer ; le reste est du bruit ou des choses que la surface ne capture pas.`;
			}
		},
		{
			title: 'Faites glisser la droite',
			body: (s) => {
				const st = stats(s);
				return `Le R² n'est qu'une comparaison de deux aires : le bleu (modèle) contre l'ambre (référence).

- R² = 1 : aucun bleu, un ajustement parfait.
- R² = 0 : autant de bleu que d'ambre, pas mieux que ȳ.

Actuellement : SS_res ${big(st.res)} contre SS_tot ${big(st.tot)}, **R² = ${r3(st.r2)}**.`;
			},
			task: {
				prompt: 'Faites glisser les poignées jusqu’à ce que le R² vaille **0** (entre −0.02 et 0.02). À quoi ressemble une telle droite ?'
			}
		},
		{
			title: 'En dessous de zéro ?',
			body: `R² = 0 signifie « aussi bon que la moyenne ». Le nom évoque un carré, donc il ne peut pas être négatif… ou bien si ?`,
			quiz: {
				question: 'Un modèle peut-il obtenir un R² inférieur à 0 ?',
				options: [
					'Non : 0 est le plancher, c’est la référence',
					'Oui : quand ses prédictions sont pires que de toujours prédire la moyenne',
					'Seulement quand la cible a des valeurs négatives'
				],
				explain: (s) => {
					const st = stats(s);
					return `Cette droite penche dans le mauvais sens. Son aire bleue vaut **${fmt(st.res / st.tot, 1)}×** l'aire ambre, donc R² = 1 − ${fmt(st.res / st.tot, 2)} = **${r3(st.r2)}**. Le « ² » n'est qu'un nom : le R² n'a pas de borne inférieure. Un ajustement par moindres carrés évalué sur ses propres données d'entraînement ne peut pas descendre sous 0 (il pourrait toujours se rabattre sur la droite horizontale), mais sur de **nouvelles données**, ou pour un modèle défaillant, un R² négatif arrive, et c'est un signal d'alarme.`;
				}
			}
		},
		{
			title: 'Même modèle, monde plus bruité',
			body: (s) => {
				const st = stats(s);
				return `Retour à la droite des moindres carrés. Le curseur ajoute davantage de bruit aléatoire aux loyers, tandis que la vraie relation (€10 par m²) reste la même.

Bruit σ = **${euro(s.noise)}** : pente ${fmt(s.line.w)} €/m², **R² = ${r3(st.r2)}**.

La droite trouve toujours à peu près la bonne pente, mais une part plus petite de la dispersion est explicable. Le R² décrit le modèle **et les données ensemble** : un R² « faible » peut correspondre à un bon modèle sur un problème bruité, donc ne comparez des R² que sur le **même jeu de données**.`;
			},
			task: {
				prompt: `Augmentez le bruit jusqu'à ce que le R² passe sous **${R2_TASK}**. La pente change-t-elle beaucoup ?`
			}
		},
		{
			title: 'Ajouter des variables inutiles',
			body: `Nouvelle expérience : ${N_TRAIN} appartements d'entraînement, une régression sur la surface seule. À gauche : loyer prédit contre loyer réel (des points sur la ligne pointillée seraient parfaits). À droite : les scores à mesure qu'on ajoute des variables.

Les « variables » ajoutées sont des **nombres purement aléatoires**, sans aucun lien avec le loyer.`,
			quiz: {
				question: `On ajoute ${JUNK} colonnes de bruit aléatoire et on réajuste. Qu'arrive-t-il au R² d'entraînement ?`,
				options: ['Il baisse : le bruit perturbe le modèle', 'Il reste le même : le bruit est inutile', 'Il augmente'],
				explain: `Le R² d'entraînement passe de **${r3(SCORES[0].r2Train)}** à **${r3(SCORES[JUNK].r2Train)}**. Les moindres carrés pourraient toujours donner un poids 0 à une colonne inutile, donc ajouter une variable ne peut **jamais faire baisser** le R² d'entraînement. Au lieu de cela, le modèle utilise les nombres aléatoires pour poursuivre le bruit de ces ${N_TRAIN} appartements. Sur de nouveaux appartements (ambre), le R² chute de ${r3(SCORES[0].r2Test)} à **${r3(SCORES[JUNK].r2Test)}** : un cas classique de [surapprentissage](concept:overfitting-underfitting).`
			}
		},
		{
			title: 'Le R² ajusté',
			body: (s) => {
				const sc = SCORES[s.k];
				return `Le **R² ajusté** fait payer chaque variable p, pour n échantillons :

\`adj R² = 1 − (1 − R²)·(n − 1)/(n − p − 1)\`

Avec n = ${N_TRAIN}, p = ${sc.p} : R² ${r3(sc.r2Train)} → ajusté **${r3(sc.adjR2)}**. Une nouvelle variable ne le fait monter que si elle améliore l'ajustement plus que le hasard. Mieux encore, évaluez sur des données mises de côté avec une [séparation entraînement/test](concept:train-test-split) ou une [validation croisée](concept:cross-validation).`;
			},
			task: {
				prompt: 'Utilisez le curseur (ou cliquez sur le graphique) pour trouver le nombre de variables inutiles où le **R² ajusté** est le plus élevé.'
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué. Récapitulatif :

1. Référence : prédire la moyenne ȳ. Son erreur est **SS_tot** = Σ(y − ȳ)².
2. L'erreur du modèle est **SS_res** = Σ(y − ŷ)².
3. **R² = 1 − SS_res/SS_tot** : la part de variation expliquée. 1 est parfait, 0 signifie « pas mieux que la moyenne », en dessous de 0 c'est pire.
4. Le R² dépend du bruit des données ; ne le comparez que sur les mêmes données.
5. Des variables supplémentaires font toujours monter le R² d'entraînement ; utilisez le **R² ajusté** ou des données mises de côté.

Le R² n'a pas d'unité : associez-le à une erreur dans l'unité de la cible, comme la [RMSE](concept:rmse-metric) ou la [MAE](concept:mae-metric). Dans scikit-learn : \`r2_score(y, y_pred)\`.`
		}
	]
};

const ar: LessonText<R2State> = {
	title: 'كيف يقارن R² النموذج بالمتوسط',
	steps: [
		{
			title: 'خط الأساس الكسول',
			body: (s) => `أربع عشرة شقة: المساحة والإيجار الشهري. قبل بناء أي نموذج، ما أفضل ما يمكنك فعله **دون معرفة أي شيء عن المساحة**؟

أن تتنبأ بـ**متوسط الإيجار** لكل شقة: ȳ = **${euro(stats(s).ybar)}** (الخط المتقطع). إنه نموذج كسول، لكنه مقياس مرجعي مفيد. تُظهر القطع الكهرمانية بُعد كل شقة عن هذا المتوسط.

سيجيب R² عن سؤال واحد: *بكم يتفوق نموذجي على خط الأساس هذا؟*`
		},
		{
			title: 'SS_tot: التشتت الكلي',
			body: (s) => `ربّع كل مسافة إلى المتوسط (المربعات الكهرمانية) واجمعها:

\`SS_tot = Σ(y − ȳ)²\` = **${big(stats(s).tot)}**

هذا هو **التباين الكلي** في الإيجارات، أي خطأ خط الأساس. اقسمه على n تحصل على تباين y. إنه ما يجب تفسيره.`
		},
		{
			title: 'SS_res: ما يتركه النموذج',
			body: (s) => {
				const st = stats(s);
				return `الآن نموذج حقيقي: [انحدار خطي](concept:linear-regression) بالمربعات الصغرى على المساحة (الخط الأزرق). مربعات بواقيه هي المربعات الزرقاء:

\`SS_res = Σ(y − ŷ)²\` = **${big(st.res)}**

قارن العمودين. الخطأ المتبقي للنموذج يساوي ${Math.round((st.res / st.tot) * 100)}% من خطأ خط الأساس، إذن:

\`R² = 1 − SS_res / SS_tot\` = **${r3(st.r2)}**

النموذج **يفسّر ${Math.round(st.r2 * 100)}% من التباين** في الإيجار؛ والباقي ضجيج أو عوامل لا تلتقطها المساحة.`;
			}
		},
		{
			title: 'اسحب الخط',
			body: (s) => {
				const st = stats(s);
				return `R² ليس إلا مقارنة بين مساحتين: الأزرق (النموذج) مقابل الكهرماني (خط الأساس).

- R² = 1: لا أزرق إطلاقًا، ملاءمة مثالية.
- R² = 0: الأزرق بقدر الكهرماني، ليس أفضل من ȳ.

الآن: SS_res ${big(st.res)} مقابل SS_tot ${big(st.tot)}، **R² = ${r3(st.r2)}**.`;
			},
			task: {
				prompt: 'اسحب المقبضين حتى يصبح R² **0** (بين −0.02 و0.02). كيف يبدو خط كهذا؟'
			}
		},
		{
			title: 'تحت الصفر؟',
			body: `R² = 0 يعني «بجودة المتوسط». الاسم يوحي بمربع، فلا يمكن أن يكون سالبًا… أم يمكن؟`,
			quiz: {
				question: 'هل يمكن أن يحصل نموذج على R² أقل من 0؟',
				options: [
					'لا: 0 هو الحد الأدنى، وهو خط الأساس',
					'نعم: عندما تكون تنبؤاته أسوأ من التنبؤ الدائم بالمتوسط',
					'فقط عندما تكون للهدف قيم سالبة'
				],
				explain: (s) => {
					const st = stats(s);
					return `هذا الخط يميل في الاتجاه الخاطئ. مساحته الزرقاء **${fmt(st.res / st.tot, 1)}×** المساحة الكهرمانية، إذن R² = 1 − ${fmt(st.res / st.tot, 2)} = **${r3(st.r2)}**. الرمز «²» مجرد اسم: لا حدّ أدنى لـR². ملاءمة المربعات الصغرى المقيَّمة على بيانات تدريبها لا يمكن أن تنزل تحت 0 (إذ يمكنها دائمًا الرجوع إلى الخط الأفقي)، لكن على **بيانات جديدة**، أو لنموذج معطوب، يحدث R² سالب وهو إنذار صارخ.`;
				}
			}
		},
		{
			title: 'النموذج نفسه، عالم أكثر ضجيجًا',
			body: (s) => {
				const st = stats(s);
				return `نعود إلى خط المربعات الصغرى. يضيف الشريط مزيدًا من الضجيج العشوائي إلى الإيجارات، بينما تبقى العلاقة الحقيقية (€10 لكل m²) كما هي.

الضجيج σ = **${euro(s.noise)}**: الميل ${fmt(s.line.w)} €/m²، **R² = ${r3(st.r2)}**.

لا يزال الخط يجد الميل الصحيح تقريبًا، لكن حصة أصغر من التشتت قابلة للتفسير. يصف R² النموذج **والبيانات معًا**: قد يكون R² «المنخفض» نموذجًا جيدًا على مسألة مشوّشة، لذا لا تقارن قيم R² إلا على **مجموعة البيانات نفسها**.`;
			},
			task: {
				prompt: `ارفع الضجيج حتى ينخفض R² إلى ما دون **${R2_TASK}**. هل يتغير الميل كثيرًا؟`
			}
		},
		{
			title: 'إضافة ميزات عديمة الفائدة',
			body: `تجربة جديدة: ${N_TRAIN} شقة تدريب، وانحدار على المساحة وحدها. على اليمين: الإيجار المتنبأ به مقابل الفعلي (النقاط على الخط المتقطع تعني الكمال). على اليسار: الدرجات كلما أضفنا ميزات.

«الميزات» التي نضيفها **أرقام عشوائية بحتة**، لا صلة لها بالإيجار إطلاقًا.`,
			quiz: {
				question: `نضيف ${JUNK} أعمدة من الضجيج العشوائي ونعيد الملاءمة. ماذا يحدث لـR² التدريب؟`,
				options: ['ينخفض: الضجيج يربك النموذج', 'يبقى كما هو: الضجيج عديم الفائدة', 'يرتفع'],
				explain: `يرتفع R² التدريب من **${r3(SCORES[0].r2Train)}** إلى **${r3(SCORES[JUNK].r2Train)}**. يمكن للمربعات الصغرى دائمًا إعطاء العمود عديم الفائدة وزنًا 0، لذا فإضافة ميزة **لا يمكن أبدًا أن تخفض** R² التدريب. بدلًا من ذلك يستخدم النموذج الأرقام العشوائية لمطاردة الضجيج في هذه الشقق الـ${N_TRAIN}. على الشقق الجديدة (الكهرماني) ينخفض R² من ${r3(SCORES[0].r2Test)} إلى **${r3(SCORES[JUNK].r2Test)}**: حالة نموذجية من [الإفراط في التخصيص (overfitting)](concept:overfitting-underfitting).`
			}
		},
		{
			title: 'R² المعدَّل',
			body: (s) => {
				const sc = SCORES[s.k];
				return `يفرض **R² المعدَّل** (adjusted R²) رسمًا على كل ميزة p، لعدد n من العينات:

\`adj R² = 1 − (1 − R²)·(n − 1)/(n − p − 1)\`

مع n = ${N_TRAIN}، p = ${sc.p}: R² ${r3(sc.r2Train)} → المعدَّل **${r3(sc.adjR2)}**. لا ترفعه ميزة جديدة إلا إذا حسّنت الملاءمة أكثر مما تفعله الصدفة. والأفضل من ذلك التقييم على بيانات محجوزة عبر [تقسيم التدريب/الاختبار](concept:train-test-split) أو [التحقق المتقاطع](concept:cross-validation).`;
			},
			task: {
				prompt: 'استخدم الشريط (أو انقر على المخطط) لإيجاد عدد الميزات عديمة الفائدة الذي يبلغ عنده **R² المعدَّل** أعلى قيمة.'
			}
		},
		{
			title: 'دورك: ساحة التجربة',
			body: `كل شيء متاح الآن. للتلخيص:

1. خط الأساس: التنبؤ بالمتوسط ȳ. خطؤه هو **SS_tot** = Σ(y − ȳ)².
2. خطأ النموذج هو **SS_res** = Σ(y − ŷ)².
3. **R² = 1 − SS_res/SS_tot**: حصة التباين المفسَّرة. 1 مثالي، و0 يعني «ليس أفضل من المتوسط»، وما دون 0 أسوأ.
4. يعتمد R² على مقدار الضجيج في البيانات؛ فلا تقارنه إلا على البيانات نفسها.
5. الميزات الإضافية ترفع R² التدريب دائمًا؛ استخدم **R² المعدَّل** أو بيانات محجوزة.

لا وحدة لـR²، لذا اقرنه بخطأ بوحدة الهدف مثل [RMSE](concept:rmse-metric) أو [MAE](concept:mae-metric). في scikit-learn: \`r2_score(y, y_pred)\`.`
		}
	]
};

export default { fr, ar };
