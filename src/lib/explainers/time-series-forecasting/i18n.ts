/**
 * French and Arabic narration for the time-series forecasting lesson (same step order as index.ts).
 */
import type { LessonText } from '../types.ts';
import {
	AR_PHI,
	DIFF_LABEL,
	MA_THETA,
	TRAIN_END,
	WINDOW,
	acfDiff,
	acfOf,
	arFit,
	arForecast,
	backtestOf,
	drift,
	num,
	prophet,
	rollingOf,
	type TSState
} from './state.ts';
import { arMean } from './ts.ts';

type Diff = TSState['diff'];
const diffFr = (d: Diff) => (d === 'none' ? 'y d’origine' : d === 'both' ? 'les deux' : DIFF_LABEL[d]);
const diffAr = (d: Diff) => (d === 'none' ? 'y الأصلية' : d === 'both' ? 'كلاهما' : DIFF_LABEL[d]);
const active = (s: TSState, names: [string, string, string]) =>
	[s.comp.trend && names[0], s.comp.season && names[1], s.comp.noise && names[2]].filter(Boolean);
const SUB = '₁₂₃₄₅₆₇₈₉';
const terms = (s: TSState) =>
	arFit(s.p)
		.phi.map((v, i) => `${num(v)}·xₜ₋${SUB[i]}`)
		.join(' + ');

const fr: LessonText<TSState> = {
	title: 'Comment fonctionne la prévision de séries temporelles',
	steps: [
		{
			title: 'Tendance + saisonnalité + bruit',
			body: (s) => `Dix ans de ventes mensuelles d’un glacier. Contrairement à un tableau de lignes ordinaire, **l’ordre compte** ici : chaque valeur dépend du *moment* où elle s’est produite, et le but est de prédire des valeurs qui ne se sont pas encore produites.

Un premier geste classique consiste à découper la série en trois parties qui s’additionnent :

- **Tendance** : la lente direction de long terme (le glacier se développe).
- **Saisonnalité** : un motif qui se répète tous les 12 mois (pics en été et en décembre).
- **Bruit** : ce qui reste. Ici, il a un peu de mémoire : un bon mois tend à être suivi d’un autre.

Affiché : **${active(s, ['tendance', 'saisonnalité', 'bruit']).join(' + ') || 'rien'}**.`,
			task: { prompt: 'Coupez chaque composante une fois (tendance, saisonnalité et bruit) et regardez à quoi ressemblent les autres seules.' }
		},
		{
			title: 'La série est-elle stationnaire ?',
			body: `Beaucoup de modèles classiques, dont ARIMA, supposent que la série est **stationnaire** : son niveau moyen, sa dispersion et ses corrélations restent les mêmes quel que soit le moment où on la regarde.

C’est important, car un modèle apprend « comment la série se comporte d’habitude ». Si ce comportement habituel ne cesse de changer, ce qu’il a appris de l’année 1 ne s’applique plus à l’année 10.`,
			quiz: {
				question: 'Cette série de ventes est-elle stationnaire ?',
				options: ['Oui : elle répète le même motif annuel', 'Non : son niveau moyen ne cesse de monter', 'Impossible à dire sans test statistique'],
				explain: () => {
					const r = rollingOf('none');
					return `Les barres montrent la moyenne (et ±1 écart-type) sur chaque fenêtre de ${WINDOW} mois. La moyenne passe de **${num(r[0].mean, 1)}** à **${num(r[r.length - 1].mean, 1)}**. Une moyenne qui dérive est le signe le plus net d’une série non stationnaire. Des tests formels comme ADF le confirment, mais le graphique le dit déjà.`;
				}
			}
		},
		{
			title: 'La différenciation supprime la tendance',
			body: (s) => `Au lieu de modéliser le niveau, modélisez la **variation** : y′ₜ = yₜ − yₜ₋₁. Une tendance linéaire devient une constante (la pente), et la série cesse de monter. C’est le **I** (*integrated*, *d* = nombre de différenciations) d’ARIMA.

Une **différence saisonnière** yₜ − yₜ₋₁₂ compare chaque mois au même mois de l’année précédente, ce qui annule le motif annuel.

Affiché : **${diffFr(s.diff)}**${s.diff === 'both' ? ' (différence saisonnière de la différence première)' : ''} : les moyennes sur ${WINDOW} mois dérivent de **${num(drift(s.diff), 1)}** entre la première et la dernière fenêtre.`,
			task: {
				prompt:
					'Trouvez la différenciation qui laisse les moyennes à plat. Essayez d’abord **Décalage 12** seul : la tendance accélère à l’année 7, il reste donc un saut. Puis essayez **Les deux**.'
			}
		},
		{
			title: 'Autocorrélation : la série face à elle-même',
			body: () => {
				const r = acfDiff('none');
				return `L’**autocorrélation** au décalage *k* est la corrélation entre la série et une copie d’elle-même décalée de *k* mois. Les barres montrent les décalages 1 à 24 ; tout ce qui reste dans la bande en pointillés pourrait n’être que du hasard.

Sur les ventes brutes, toutes les barres sont hautes et ne décroissent que lentement (r₁ = **${num(r[1])}**, r₁₂ = **${num(r[12])}**). Cette lente décroissance est la signature d’une **tendance** : deux mois proches dans le temps sont tous deux « tôt » ou tous deux « tard ».`;
			},
			quiz: {
				question: 'Prenez maintenant les différences premières (yₜ − yₜ₋₁) pour supprimer la tendance. Quel décalage ressortira dans l’ACF ?',
				options: ['Décalage 1', 'Décalage 6', 'Décalage 12', 'Aucun : les différences sont du pur bruit'],
				explain: () =>
					`Sans la tendance, le **décalage 12** saute aux yeux (r₁₂ = **${num(acfDiff('lag1')[12])}**) : la variation de ce mois ressemble à celle du même mois l’an dernier. C’est la saison annuelle. Elle indique qu’il faut un modèle saisonnier (SARIMA avec s = 12, ou des variables saisonnières). Changez la différenciation pour comparer.`
			}
		},
		{
			title: 'AR et MA : deux sortes de mémoire',
			body: (s) =>
				s.proc === 'ar'
					? `Deux petites séries stationnaires, chacune construite à partir de chocs aléatoires εₜ.

**AR(2)**, *autorégressif* : aujourd’hui est une somme pondérée des deux dernières valeurs, xₜ = ${AR_PHI[0]}·xₜ₋₁ + ${AR_PHI[1]}·xₜ₋₂ + εₜ. Un choc ne disparaît jamais complètement ; il s’estompe pas à pas. L’ACF **décroît donc progressivement** (r₁ = ${num(acfOf(s)[1])}, r₃ = ${num(acfOf(s)[3])}, r₆ = ${num(acfOf(s)[6])}).`
					: `**MA(1)**, *moyenne mobile* : aujourd’hui est le choc du jour plus une partie du choc de la veille, xₜ = εₜ + ${MA_THETA}·εₜ₋₁. Chaque choc vit exactement deux pas, donc l’ACF **s’annule** après le décalage 1 (r₁ = ${num(acfOf(s)[1])}, r₂ = ${num(acfOf(s)[2])}).

ARIMA(*p*, *d*, *q*) combine les deux sur une série différenciée *d* fois : *p* valeurs passées plus *q* chocs passés. La forme de l’ACF sert à deviner *q*. Un graphique voisin, la PACF, aide à deviner *p*.`,
			task: { prompt: 'Passez à **MA(1)** et regardez les barres de l’ACF tomber à environ zéro après le décalage 1.' }
		},
		{
			title: 'Ajuster un AR(p) sur des données',
			body: (s) => {
				const f = arFit(s.p);
				return `Ajuster un AR(*p*), c’est simplement faire une [régression linéaire](concept:linear-regression) de xₜ sur ses *p* dernières valeurs, résolue par moindres carrés.

Les données viennent de l’AR(2) ci-dessus, mais le modèle ne le sait pas. Avec **p = ${s.p}** :

x̂ₜ = ${num(f.c)} + ${terms(s)}

Erreur de prédiction à un pas σ = **${num(f.sigma, 3)}**. La ligne en pointillés est la prédiction du modèle pour chaque mois, faite à partir des mois précédents.`;
			},
			task: { prompt: 'Changez *p* et trouvez à partir d’où ajouter des décalages ne réduit plus l’erreur (cliquez sur une barre ou utilisez le curseur).' }
		},
		{
			title: 'Prévoir : le cône d’incertitude',
			body: (s) => {
				const fc = arForecast(s.p);
				const h = s.horizon;
				return `Pour prévoir, le modèle prédit le mois suivant, puis **réinjecte cette prédiction** comme si c’était une vraie donnée, et recommence.

Chaque pas ajoute un nouveau choc inconnu, donc les erreurs s’accumulent. Les bandes ombrées sont des **intervalles de prédiction** à 80 % et 95 % : ±${num(1.96 * fc.se[0])} à un mois, ±${num(1.96 * fc.se[h - 1])} à ${h} mois.`;
			},
			quiz: {
				question: 'Prévoyez 30 mois à l’avance avec cet AR(2). Où va la ligne de prévision ?',
				options: ['Elle continue de suivre la dernière direction', 'Elle se stabilise à la moyenne de long terme de la série', 'Elle répète la dernière valeur observée'],
				explain: () => {
					const f = arFit(2);
					const fc = arForecast(2);
					return `Les poids ont une somme inférieure à 1 (${num(f.phi[0])} + ${num(f.phi[1])}) : chaque prédiction est tirée vers la moyenne, et la ligne se stabilise à **${num(arMean(f))}**. Loin devant, le modèle ne sait rien de plus qu’« un mois typique ». La bande cesse aussi de s’élargir : à 30 mois, elle vaut ±${num(1.96 * fc.se[29])}, à peu près la dispersion propre de la série.`;
				}
			}
		},
		{
			title: 'Façon Prophet : additionner des blocs',
			body: (s) => {
				const r = prophet(s.K, s.changepoints);
				return `Prophet traite la prévision comme un **ajustement de courbe** : y(t) = g(t) + s(t) (+ effets des jours fériés).

- **Tendance g(t)** : une droite qui peut s’infléchir en des **points de rupture** ${s.changepoints ? '(activés : les traits montrent l’inflexion à chacun)' : '(désactivés : une seule droite)'}.
- **Saisonnalité s(t)** : une somme de *K* paires sinus/cosinus de période 12 mois. Un *K* plus grand dessine des formes plus nettes, comme le pic de décembre. Actuellement **K = ${s.K}**.

Ajusté sur les ${TRAIN_END / 12} premières années ; les points creux sont les 2 dernières années, cachées à l’ajustement. Erreur sur celles-ci : **MAE ${num(r.mae)}**.`;
			},
			task: {
				prompt: 'Activez les **points de rupture** et augmentez *K* jusqu’à ce que la MAE sur les données mises de côté passe sous 3.5. Remarquez comme la bande s’élargit dès que la tendance peut s’infléchir.'
			}
		},
		{
			title: 'Un backtest sans tricher',
			body: (s) => `Pour savoir comment se comportera un modèle de prévision, testez-le **comme vous l’utiliserez** : entraîné sur le passé, il prédit le futur.

La validation croisée ordinaire à 5 plis mélange les mois. Chaque ligne grise ci-dessous est un jeu d’entraînement et les cases colorées sont ses mois de test. Avec le mélange, beaucoup de mois de test se trouvent *entre* des mois d’entraînement, y compris des mois plus tardifs.

Validation croisée mélangée (même modèle façon Prophet) : **MAE ${num(backtestOf('shuffled').mae)}**.${s.cv === 'walk' ? ` Walk-forward : **MAE ${num(backtestOf('walk').mae)}**.` : ''}`,
			quiz: {
				question: 'Faites maintenant un backtest walk-forward : entraîner sur tout ce qui précède une date, prédire les 12 mois suivants, répéter pour 5 dates. La MAE sera…',
				options: ['À peu près la même', 'Nettement plus élevée', 'Plus basse : le walk-forward s’entraîne sur plus de données'],
				explain: () =>
					`La MAE walk-forward vaut **${num(backtestOf('walk').mae)}** contre **${num(backtestOf('shuffled').mae)}** avec mélange. Le mélange laissait le modèle *interpoler* entre des voisins connus des deux côtés. Le walk-forward doit *extrapoler*, exactement comme en production. Ne mélangez jamais une série temporelle : utilisez une [validation croisée temporelle](concept:time-series-cv) (fenêtres croissantes ou glissantes), et rapportez la [MAE](concept:mae-metric) ou la [RMSE](concept:rmse-metric) par pli.`
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué. Choisissez une vue ci-dessous. Récapitulatif :

1. **Tracer et décomposer** : tendance, saisonnalité, bruit.
2. **Rendre la série stationnaire** pour ARIMA : différencier (*d*), de façon saisonnière si besoin.
3. **Lire l’ACF** pour repérer la saisonnalité et choisir les ordres AR/MA (ou laisser auto_arima chercher).
4. **Prévoir avec des intervalles** : ils s’élargissent avec l’horizon.
5. Les modèles façon Prophet additionnent plutôt une tendance flexible et une saisonnalité de Fourier.
6. **Backtester en walk-forward**, jamais en mélangeant.

Pour de nombreuses séries liées avec des variables supplémentaires, des arbres de gradient boosting sur des variables décalées ([LightGBM](concept:lightgbm)) ou des [LSTM](concept:rnn-lstm) l’emportent souvent.`
		}
	]
};

const ar: LessonText<TSState> = {
	title: 'كيف يعمل التنبؤ بالسلاسل الزمنية',
	steps: [
		{
			title: 'الاتجاه + الموسمية + الضجيج',
			body: (s) => `عشر سنوات من المبيعات الشهرية لمحل مثلجات. على خلاف جدول صفوف عادي، **الترتيب مهم** هنا: كل قيمة تعتمد على *متى* حدثت، والهدف هو التنبؤ بقيم لم تحدث بعد.

خطوة أولى تقليدية هي تقسيم السلسلة إلى ثلاثة أجزاء مجموعها هو السلسلة:

- **الاتجاه** (trend): المسار البطيء طويل الأمد (المحل ينمو).
- **الموسمية** (seasonality): نمط يتكرر كل 12 شهرًا (ذروات في الصيف وفي ديسمبر).
- **الضجيج** (noise): ما يتبقى. وله هنا ذاكرة صغيرة: الشهر الجيد يميل إلى أن يتبعه شهر جيد آخر.

المعروض: **${active(s, ['الاتجاه', 'الموسمية', 'الضجيج']).join(' + ') || 'لا شيء'}**.`,
			task: { prompt: 'أطفئ كل مكوّن مرة واحدة (الاتجاه والموسمية والضجيج) وانظر كيف تبدو المكوّنات الأخرى وحدها.' }
		},
		{
			title: 'هل السلسلة مستقرة؟',
			body: `كثير من النماذج التقليدية، ومنها ARIMA، تفترض أن السلسلة **مستقرة** (stationary): مستواها المتوسط وتشتتها وارتباطاتها تبقى كما هي أينما نظرت.

هذا مهم لأن النموذج يتعلم «كيف تتصرف السلسلة عادةً». فإذا ظل هذا السلوك المعتاد يتغير، فما تعلّمه من السنة الأولى لا ينطبق على السنة العاشرة.`,
			quiz: {
				question: 'هل سلسلة المبيعات هذه مستقرة؟',
				options: ['نعم: إنها تكرر النمط السنوي نفسه', 'لا: مستواها المتوسط يواصل الارتفاع', 'لا يمكن الجزم دون اختبار إحصائي'],
				explain: () => {
					const r = rollingOf('none');
					return `تُظهر الأشرطة المتوسط (و±1 انحراف معياري) على كل نافذة من ${WINDOW} شهرًا. يرتفع المتوسط من **${num(r[0].mean, 1)}** إلى **${num(r[r.length - 1].mean, 1)}**. المتوسط المنجرف أوضح علامة على سلسلة غير مستقرة. الاختبارات الرسمية مثل ADF تؤكد ذلك، لكن الرسم يخبرك به مسبقًا.`;
				}
			}
		},
		{
			title: 'أخذ الفروق يزيل الاتجاه',
			body: (s) => `بدلًا من نمذجة المستوى، نمذج **التغيّر**: y′ₜ = yₜ − yₜ₋₁. يصبح الاتجاه الخطي ثابتًا (الميل)، وتتوقف السلسلة عن الصعود. هذا هو حرف **I** (integrated، و*d* = عدد مرات أخذ الفروق) في ARIMA.

**الفرق الموسمي** yₜ − yₜ₋₁₂ يقارن كل شهر بالشهر نفسه من العام السابق، فيلغي النمط السنوي.

المعروض: **${diffAr(s.diff)}**${s.diff === 'both' ? ' (الفرق الموسمي للفرق الأول)' : ''}: تنجرف متوسطات الـ${WINDOW} شهرًا بمقدار **${num(drift(s.diff), 1)}** من النافذة الأولى إلى الأخيرة.`,
			task: {
				prompt: 'جد طريقة أخذ الفروق التي تترك المتوسطات مستوية. جرّب **إزاحة 12** وحدها أولًا: الاتجاه يتسارع في السنة السابعة فتبقى قفزة. ثم جرّب **كلاهما**.'
			}
		},
		{
			title: 'الارتباط الذاتي: السلسلة مقابل نفسها',
			body: () => {
				const r = acfDiff('none');
				return `**الارتباط الذاتي** (autocorrelation) عند الإزاحة *k* هو الارتباط بين السلسلة ونسخة منها مُزاحة *k* شهرًا. تُظهر الأشرطة الإزاحات من 1 إلى 24؛ وما يقع داخل النطاق المتقطع قد يكون مجرد صدفة.

في المبيعات الخام كل الأشرطة مرتفعة ولا تتلاشى إلا ببطء (r₁ = **${num(r[1])}**، r₁₂ = **${num(r[12])}**). هذا التلاشي البطيء هو بصمة **الاتجاه**: أي شهرين متقاربين زمنيًا يكونان كلاهما «مبكرين» أو كلاهما «متأخرين».`;
			},
			quiz: {
				question: 'خذ الآن الفروق الأولى (yₜ − yₜ₋₁) لإزالة الاتجاه. أي إزاحة ستبرز في ACF؟',
				options: ['الإزاحة 1', 'الإزاحة 6', 'الإزاحة 12', 'لا شيء: الفروق ضجيج خالص'],
				explain: () =>
					`بعد زوال الاتجاه تبرز **الإزاحة 12** (r₁₂ = **${num(acfDiff('lag1')[12])}**): تغيّر هذا الشهر يشبه تغيّر الشهر نفسه قبل عام. هذا هو الموسم السنوي. وهو يخبرك باستخدام نموذج موسمي (SARIMA مع s = 12، أو ميزات موسمية). بدّل طريقة أخذ الفروق للمقارنة.`
			}
		},
		{
			title: 'AR و MA: نوعان من الذاكرة',
			body: (s) =>
				s.proc === 'ar'
					? `سلسلتان مستقرتان صغيرتان، كل منهما مبنية من صدمات عشوائية εₜ.

**AR(2)**، *الانحدار الذاتي* (autoregressive): قيمة اليوم مجموع موزون لآخر قيمتين، xₜ = ${AR_PHI[0]}·xₜ₋₁ + ${AR_PHI[1]}·xₜ₋₂ + εₜ. لا تزول الصدمة تمامًا أبدًا؛ بل تخفت خطوة بعد خطوة. لذا **يتناقص** ACF **تدريجيًا** (r₁ = ${num(acfOf(s)[1])}، r₃ = ${num(acfOf(s)[3])}، r₆ = ${num(acfOf(s)[6])}).`
					: `**MA(1)**، *المتوسط المتحرك* (moving average): قيمة اليوم هي صدمة اليوم مضافًا إليها جزء من صدمة الأمس، xₜ = εₜ + ${MA_THETA}·εₜ₋₁. تعيش كل صدمة خطوتين بالضبط، لذا **ينقطع** ACF بعد الإزاحة 1 (r₁ = ${num(acfOf(s)[1])}، r₂ = ${num(acfOf(s)[2])}).

يجمع ARIMA(*p*, *d*, *q*) الاثنين على سلسلة أُخذت فروقها *d* مرة: *p* قيمة سابقة و*q* صدمة سابقة. شكل ACF هو ما يخمّن به الناس *q*. ورسم قريب منه، PACF، يساعد على تخمين *p*.`,
			task: { prompt: 'انتقل إلى **MA(1)** وراقب أشرطة ACF تنخفض إلى نحو الصفر بعد الإزاحة 1.' }
		},
		{
			title: 'ملاءمة AR(p) من البيانات',
			body: (s) => {
				const f = arFit(s.p);
				return `ملاءمة AR(*p*) ليست سوى [انحدار خطي](concept:linear-regression) لـ xₜ على آخر *p* قيمة منها، يُحل بطريقة المربعات الصغرى.

جاءت البيانات من AR(2) أعلاه، لكن النموذج لا يعرف ذلك. مع **p = ${s.p}**:

x̂ₜ = ${num(f.c)} + ${terms(s)}

خطأ التنبؤ بخطوة واحدة σ = **${num(f.sigma, 3)}**. الخط المتقطع هو تنبؤ النموذج لكل شهر انطلاقًا من الأشهر التي سبقته.`;
			},
			task: { prompt: 'غيّر *p* وجد النقطة التي تتوقف عندها إضافة إزاحات جديدة عن تقليل الخطأ (انقر على شريط أو استخدم المنزلق).' }
		},
		{
			title: 'التنبؤ: مخروط عدم اليقين',
			body: (s) => {
				const fc = arForecast(s.p);
				const h = s.horizon;
				return `للتنبؤ، يتنبأ النموذج بالشهر التالي، ثم **يعيد إدخال هذا التنبؤ** كأنه بيانات حقيقية، ويكرر.

كل خطوة تضيف صدمة مجهولة جديدة، فتتراكم الأخطاء. النطاقات المظللة هي **فترات تنبؤ** (prediction intervals) بنسبة 80% و95%: ±${num(1.96 * fc.se[0])} لشهر واحد للأمام، و±${num(1.96 * fc.se[h - 1])} عند ${h} شهرًا.`;
			},
			quiz: {
				question: 'تنبأ بـ 30 شهرًا للأمام باستخدام AR(2) هذا. إلى أين يذهب خط التنبؤ؟',
				options: ['يواصل اتباع الاتجاه الأخير', 'يستوي عند المتوسط طويل الأمد للسلسلة', 'يكرر آخر قيمة مرصودة'],
				explain: () => {
					const f = arFit(2);
					const fc = arForecast(2);
					return `مجموع الأوزان أقل من 1 (${num(f.phi[0])} + ${num(f.phi[1])})، لذا يُسحب كل تنبؤ نحو المتوسط، فيستوي الخط عند **${num(arMean(f))}**. بعيدًا في المستقبل لا يعرف النموذج شيئًا أكثر من «شهر نموذجي». ويتوقف النطاق أيضًا عن الاتساع: عند 30 شهرًا يبلغ ±${num(1.96 * fc.se[29])}، أي نحو تشتت السلسلة نفسها.`;
				}
			}
		},
		{
			title: 'على طريقة Prophet: اجمع الكتل',
			body: (s) => {
				const r = prophet(s.K, s.changepoints);
				return `يعامل Prophet التنبؤ على أنه **ملاءمة منحنى**: y(t) = g(t) + s(t) (+ آثار العطل).

- **الاتجاه g(t)**: خط يمكن أن ينحني عند **نقاط التغيّر** (changepoints) ${s.changepoints ? '(مفعّلة: تُظهر العلامات مقدار الانحناء عند كل منها)' : '(معطّلة: خط مستقيم واحد)'}.
- **الموسمية s(t)**: مجموع *K* زوجًا من الجيب وجيب التمام بدورة 12 شهرًا. قيمة *K* الأكبر ترسم أشكالًا أحدّ، مثل ذروة ديسمبر. الآن **K = ${s.K}**.

المُلاءمة على أول ${TRAIN_END / 12} سنوات؛ والنقاط المجوفة هي آخر سنتين، محجوبة عن الملاءمة. الخطأ عليها: **MAE ${num(r.mae)}**.`;
			},
			task: {
				prompt: 'فعّل **نقاط التغيّر** وارفع *K* حتى تنخفض MAE على البيانات المحجوبة إلى أقل من 3.5. لاحظ كيف يتسع النطاق حالما يُسمح للاتجاه بالانحناء.'
			}
		},
		{
			title: 'اختبار رجعي دون استراق النظر',
			body: (s) => `لتعرف كيف سيؤدي نموذج التنبؤ، اختبره **بالطريقة التي ستستخدمه بها**: مدرّبًا على الماضي ومتنبئًا بالمستقبل.

التحقق المتقاطع العادي بخمس طيّات يخلط الأشهر. كل صف رمادي أدناه مجموعة تدريب، والخانات الملونة أشهر الاختبار الخاصة بها. مع الخلط تقع أشهر اختبار كثيرة *بين* أشهر التدريب، بما فيها أشهر لاحقة.

التحقق المتقاطع المخلوط (النموذج نفسه على طريقة Prophet): **MAE ${num(backtestOf('shuffled').mae)}**.${s.cv === 'walk' ? ` التقدم الزمني (walk-forward): **MAE ${num(backtestOf('walk').mae)}**.` : ''}`,
			quiz: {
				question: 'أجرِ الآن اختبارًا رجعيًا بالتقدم الزمني: درّب على كل ما يسبق تاريخًا ما، وتنبأ بالأشهر الـ12 التالية، وكرر لخمسة تواريخ. ستكون MAE…',
				options: ['تقريبًا نفسها', 'أعلى بشكل ملحوظ', 'أقل: التقدم الزمني يتدرب على بيانات أكثر'],
				explain: () =>
					`MAE بالتقدم الزمني **${num(backtestOf('walk').mae)}** مقابل **${num(backtestOf('shuffled').mae)}** مع الخلط. سمح الخلط للنموذج بأن *يستكمل* (interpolate) بين جيران معروفين من الجانبين. أما التقدم الزمني فعليه أن *يستقرئ* (extrapolate)، تمامًا كما في الإنتاج. لا تخلط سلسلة زمنية أبدًا: استخدم [التحقق المتقاطع للسلاسل الزمنية](concept:time-series-cv) (نوافذ متوسعة أو منزلقة)، وأبلغ عن [MAE](concept:mae-metric) أو [RMSE](concept:rmse-metric) لكل طية.`
			}
		},
		{
			title: 'دورك: ساحة التجربة',
			body: `كل شيء مفتوح. اختر عرضًا أدناه. خلاصة:

1. **ارسم وفكّك**: الاتجاه، الموسمية، الضجيج.
2. **اجعل السلسلة مستقرة** من أجل ARIMA: خذ الفروق (*d*)، موسميًا إذا لزم.
3. **اقرأ ACF** لرصد الموسمية واختيار رتب AR/MA (أو دع auto_arima يبحث).
4. **تنبأ مع فترات**: تتسع مع الأفق.
5. نماذج طريقة Prophet تجمع بدلًا من ذلك اتجاهًا مرنًا وموسمية فورييه.
6. **اختبر رجعيًا بالتقدم الزمني**، ولا تخلط أبدًا.

مع سلاسل كثيرة مترابطة وميزات إضافية، كثيرًا ما تتفوق أشجار التعزيز التدرجي على ميزات الإزاحة ([LightGBM](concept:lightgbm)) أو شبكات [LSTM](concept:rnn-lstm).`
		}
	]
};

export default { fr, ar };
