/**
 * French and Arabic narration for the gradient boosting lesson (same step order as index.ts).
 */
import type { LessonText } from '../types.ts';
import { f2, f3, pct } from '../_ensembles/memo.ts';
import { arTrees } from '../_ensembles/i18n.ts';
import * as gb from './gb.ts';
import {
	ADA_ROUNDS,
	DEFAULT_DEPTH,
	DEFAULT_LR,
	MAX_STAGES,
	adaAccuracy,
	adaRounds,
	bestStage,
	booster,
	nextTree,
	residuals,
	stagesTo,
	train,
	trainLoss,
	validLoss,
	type GBState
} from './state.ts';

const meanY = () => booster({ lr: DEFAULT_LR, depth: DEFAULT_DEPTH }).F0;
const biggest = (s: GBState) => residuals(s, s.stage).reduce((a, v) => (Math.abs(v) > Math.abs(a) ? v : a), 0);
const leafList = (s: GBState, sep: string) =>
	gb
		.pieces(nextTree(s, s.stage))
		.map((q) => f2(q.w))
		.join(sep);
const curRound = (s: GBState) => (s.round > 0 ? adaRounds()[s.round - 1] : null);

export const fr: LessonText<GBState> = {
	title: 'Comment le gradient boosting corrige ses propres erreurs',
	steps: [
		{
			title: 'Commencer par une constante',
			body: (s) => `Voici ${train().x.length} mesures bruitées d’une courbe lisse, et nous voulons prédire \`y\` à partir de \`x\`.

Le gradient boosting commence par le modèle le plus terne possible : **une seule constante** pour tout \`x\`. Pour l’erreur quadratique, la meilleure constante est la moyenne, **F₀ = ${f2(meanY())}**. Son erreur d’entraînement (erreur quadratique moyenne) vaut **${f3(trainLoss(s)[0])}**.

Tout ce qui suit consiste à améliorer cette estimation par petits pas.`
		},
		{
			title: 'Les résidus : ce qu’il reste à expliquer',
			body: (s) => `Le **résidu** de chaque point est l’écart entre le modèle et ce point : \`r = y − F(x)\`. Les traits verticaux sur le graphique sont les résidus, et le panneau du bas les représente seuls. Le plus grand vaut ${f2(biggest(s))}.

Pourquoi « gradient » ? Avec la perte quadratique \`L = ½(y − F)²\`, la dérivée par rapport à la prédiction est \`∂L/∂F = −(y − F)\`. Le résidu *est* donc le **gradient négatif** : la direction dans laquelle chaque prédiction doit bouger pour réduire la perte. Pour d’autres pertes (log-loss, Huber), la recette est la même, avec ces *pseudo-résidus* à la place de y − F.`
		},
		{
			title: 'Ajuster un petit arbre sur les résidus',
			body: (s) => {
				const p = gb.pieces(nextTree(s, s.stage));
				return `Ensuite, on ajuste un **arbre de régression peu profond** sur les résidus, pas sur \`y\`. Ici \`max_depth = ${s.depth}\`, il peut donc découper l’axe des x en ${2 ** s.depth} morceaux au plus ; celui-ci en utilise **${p.length}**. Chaque division est choisie pour réduire au maximum l’erreur quadratique des résidus : c’est la version régression de la recherche de Gini de l’[arbre de décision](concept:decision-tree).

L’arbre (marches orange dans le panneau du bas) est une esquisse grossière des zones où le modèle est trop bas (résidus positifs) et trop haut (résidus négatifs).`;
			},
			quiz: {
				question: 'Quelle valeur chaque feuille de cet arbre renvoie-t-elle ?',
				options: ['La moyenne des y des points de la feuille', 'La moyenne des résidus des points de la feuille', 'Le plus grand résidu de la feuille'],
				explain: (s) =>
					`L’arbre a été entraîné sur les résidus, donc chaque feuille prédit le **résidu moyen** de ses points : ${leafList(s, ', ')}. C’est la correction aux moindres carrés pour ce tronçon de x. En général (pour n’importe quelle perte), une feuille renvoie le pas qui minimise la perte sur ses points.`
			}
		},
		{
			title: 'L’ajouter, réduit par le taux d’apprentissage',
			body: (s) => {
				const l = trainLoss(s);
				return `Le nouveau modèle est l’ancien plus l’arbre, réduit par le **taux d’apprentissage** η :

\`F₁(x) = F₀(x) + η · h₁(x)\`  avec η = ${s.lr}

Puis on recommence : nouveaux résidus, nouvel arbre, on l’ajoute. Étape **${s.stage}** : MSE d’entraînement **${f3(l[s.stage])}** (contre ${f3(l[0])} au départ). Chaque arbre ne déplace la courbe que de ${Math.round(s.lr * 100)} % du chemin qu’il propose, si bien qu’aucun arbre ne peut dominer.`;
			},
			task: {
				prompt: 'Ajoutez des arbres jusqu’à ce que l’ensemble compte **20** étapes. Regardez les résidus diminuer.'
			}
		},
		{
			title: 'Taux d’apprentissage × nombre d’arbres',
			body: (s) => {
				const target = 0.3;
				const n = stagesTo(s, target);
				return `η et le nombre d’arbres se compensent. Pour descendre la MSE d’entraînement à ${target} : η = 0.1 demande **${stagesTo({ lr: 0.1, depth: s.depth }, target)}** arbres ; l’η actuel = ${s.lr} en demande **${Number.isFinite(n) ? String(n) : `plus de ${MAX_STAGES}`}**.

La courbe en pointillé sur le graphique correspond à η = 0.1, pour comparaison.`;
			},
			quiz: {
				question: 'Si l’on divise η par deux, de 0.1 à 0.05, combien d’arbres faut-il pour atteindre la même erreur d’entraînement ?',
				options: ['Le même nombre', 'Environ deux fois plus', 'Environ deux fois moins'],
				explain: (s) =>
					`Environ **deux fois plus** : ${stagesTo({ lr: 0.1, depth: s.depth }, 0.3)} → ${stagesTo({ lr: 0.05, depth: s.depth }, 0.3)} arbres pour atteindre une MSE de 0.3. Le pas de chaque arbre est deux fois plus petit. En pratique, un η plus petit avec plus d’arbres généralise souvent un peu mieux, au prix du temps d’entraînement. C’est pourquoi les deux se règlent toujours ensemble.`
			}
		},
		{
			title: 'Trop d’étapes mènent au surapprentissage',
			body: (s) => {
				const v = validLoss(s);
				return `Contrairement à une [forêt aléatoire](concept:random-forest), le boosting **peut** surapprendre en ajoutant des arbres : chaque étape poursuit le résidu restant, et celui-ci finit par n’être que du bruit.

Les points pâles sont **${300} points de validation** sur lesquels le modèle ne s’entraîne jamais. Étape **${s.stage}** : MSE d’entraînement ${f3(trainLoss(s)[s.stage])}, MSE de validation **${f3(v[s.stage])}**.`;
			},
			quiz: {
				question: `Qu’arrive-t-il à l’erreur de validation si l’on continue jusqu’à ${MAX_STAGES} étapes ?`,
				options: [
					'Elle continue de baisser, comme l’erreur d’entraînement',
					'Elle se stabilise et ne bouge plus',
					'Elle remonte, car la courbe commence à suivre le bruit'
				],
				explain: (s) => {
					const v = validLoss(s);
					const b = bestStage(s);
					return `La MSE d’entraînement tend vers ${f3(trainLoss(s)[MAX_STAGES])}, mais la MSE de validation atteint son minimum, **${f3(v[b])}**, vers l’étape ${b}, puis remonte à **${f3(v[MAX_STAGES])}** à l’étape ${MAX_STAGES}. La courbe se plie désormais pour passer par des points bruités isolés : un cas classique de [surapprentissage](concept:overfitting-underfitting).`;
				}
			}
		},
		{
			title: 'Arrêt précoce',
			body: (s) => {
				const v = validLoss(s);
				const b = bestStage(s);
				return `La solution consiste à surveiller l’erreur de validation pendant l’entraînement et à **s’arrêter quand elle ne s’améliore plus**. Dans scikit-learn : \`validation_fraction=0.1, n_iter_no_change=20\` met de côté 10 % des données d’entraînement et s’arrête après 20 étapes sans amélioration. XGBoost, LightGBM et CatBoost appellent cela \`early_stopping_rounds\`.

Meilleure MSE de validation : **${f3(v[b])}** à l’étape **${b}**. Étape actuelle ${s.stage} : ${f3(v[s.stage])}.`;
			},
			task: {
				prompt: 'Faites glisser le curseur **arbres (étapes)** (ou cliquez sur le graphique) jusqu’à l’étape où l’erreur de validation est la plus basse.'
			}
		},
		{
			title: 'AdaBoost : repondérer les erreurs',
			body: (s) => {
				const cur = curRound(s);
				const last = cur
					? `Tour **${s.round}** : l’erreur pondérée de la souche est ε = ${f3(cur.err)}, donc son poids dans le vote est α = ½·ln((1 − ε)/ε) = **${f2(cur.alpha)}**. Le vote combiné classe maintenant correctement **${pct(adaAccuracy(s.round))}** des points.`
					: 'Appuyez sur **Tour suivant** pour ajuster la première souche.';
				return `**AdaBoost**, l’algorithme de boosting d’origine, obtient le même effet « se concentrer sur ce qui est encore faux » autrement. Au lieu d’ajuster des résidus, il entraîne chaque apprenant faible (ici une *souche* à une seule division) sur des **données repondérées** : après chaque tour, les points mal classés deviennent plus lourds (marqueurs plus gros) et les bons plus légers, si bien que la souche suivante se concentre sur les cas difficiles. Le modèle final est un vote pondéré, chaque souche pesant selon sa précision.

${last}

Il se trouve qu’AdaBoost est du gradient boosting avec la *perte exponentielle*, ce qui explique aussi pourquoi les étiquettes bruitées lui nuisent : un point mal étiqueté devient de plus en plus lourd.`;
			},
			task: {
				prompt: `Appuyez sur **Tour suivant** jusqu’à ce que les souches classent tous les points correctement (ou ${ADA_ROUNDS} tours).`
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué. Récapitulatif :

1. Partir d’une constante (la moyenne pour l’erreur quadratique).
2. Calculer les résidus, le gradient négatif de la perte.
3. Ajuster un arbre peu profond sur eux et l’ajouter, réduit par η.
4. Recommencer, et s’arrêter quand l’erreur de validation ne s’améliore plus.

Comparez \`max_depth = 1\` (souches : lent mais lisse) à 4 (rapide mais prompt à surapprendre), ou essayez un grand η. Les bibliothèques modernes reposent exactement sur cette boucle : [XGBoost](concept:xgboost) ajoute la régularisation et des pas du second ordre, [LightGBM](concept:lightgbm) la rend rapide sur de grandes données, et [CatBoost](concept:catboost) gère les variables catégorielles sans fuite.`
		}
	]
};

export const ar: LessonText<GBState> = {
	title: 'كيف يصحّح التعزيز التدرّجي أخطاءه بنفسه',
	steps: [
		{
			title: 'ابدأ بتخمين ثابت',
			body: (s) => `هذه ${train().x.length} قياسًا مشوّشًا لمنحنى أملس، ونريد التنبؤ بـ\`y\` انطلاقًا من \`x\`.

يبدأ التعزيز التدرّجي (gradient boosting) بأبسط نموذج ممكن: **ثابت واحد** لكل قيم \`x\`. بالنسبة لمربع الخطأ، أفضل ثابت هو المتوسط، **F₀ = ${f2(meanY())}**. خطأ تدريبه (متوسط مربع الخطأ) هو **${f3(trainLoss(s)[0])}**.

كل ما يلي يتعلق بتحسين هذا التخمين خطوة صغيرة في كل مرة.`
		},
		{
			title: 'البواقي: ما تبقّى لتفسيره',
			body: (s) => `**الباقي** (residual) لكل نقطة هو مقدار ما أخطأ به النموذج فيها: \`r = y − F(x)\`. الخطوط العمودية على الرسم هي البواقي، واللوحة السفلية تعرضها وحدها. أكبرها يساوي ${f2(biggest(s))}.

لماذا «تدرّجي»؟ مع الخسارة التربيعية \`L = ½(y − F)²\`، تكون المشتقة بالنسبة للتنبؤ \`∂L/∂F = −(y − F)\`. إذن الباقي *هو* **التدرّج السالب** (negative gradient): الاتجاه الذي ينبغي أن يتحرك فيه كل تنبؤ لتقليل الخسارة. مع خسائر أخرى (log-loss، Huber) تبقى الوصفة نفسها، مع استبدال y − F بهذه *البواقي الزائفة* (pseudo-residuals).`
		},
		{
			title: 'طابِق شجرة صغيرة على البواقي',
			body: (s) => {
				const p = gb.pieces(nextTree(s, s.stage));
				return `بعد ذلك، نطابق **شجرة انحدار ضحلة** على البواقي، لا على \`y\`. هنا \`max_depth = ${s.depth}\`، لذا يمكنها تقطيع محور x إلى ${2 ** s.depth} قطع على الأكثر؛ وهذه الشجرة تستخدم **${p.length}**. يُختار كل تقسيم ليُقلّل مربع خطأ البواقي قدر الإمكان، وهو النسخة الانحدارية من بحث Gini في [شجرة القرار](concept:decision-tree).

الشجرة (الدرجات البرتقالية في اللوحة السفلية) رسم تقريبي للأماكن التي يكون فيها النموذج منخفضًا جدًا (بواقٍ موجبة) أو مرتفعًا جدًا (بواقٍ سالبة).`;
			},
			quiz: {
				question: 'ما القيمة التي تُخرجها كل ورقة في هذه الشجرة؟',
				options: ['متوسط y لنقاط الورقة', 'متوسط البواقي لنقاط الورقة', 'أكبر باقٍ في الورقة'],
				explain: (s) =>
					`دُرّبت الشجرة على البواقي، لذا تتنبأ كل ورقة بـ**متوسط البواقي** لنقاطها: ${leafList(s, '، ')}. هذا هو تصحيح المربعات الصغرى لذلك الجزء من x. وعمومًا (لأي خسارة)، تُخرج الورقة الخطوة التي تُقلّل الخسارة على نقاطها.`
			}
		},
		{
			title: 'أضِفها، مصغّرة بمعدل التعلم',
			body: (s) => {
				const l = trainLoss(s);
				return `النموذج الجديد هو القديم زائد الشجرة، مصغّرة بـ**معدل التعلم** (learning rate) η:

\`F₁(x) = F₀(x) + η · h₁(x)\`  مع η = ${s.lr}

ثم نكرّر: بواقٍ جديدة، شجرة جديدة، نضيفها. المرحلة **${s.stage}**: MSE التدريب **${f3(l[s.stage])}** (بعد أن كان ${f3(l[0])}). كل شجرة تحرّك المنحنى ${Math.round(s.lr * 100)}% فقط من المسافة التي تقترحها، فلا تستطيع أي شجرة بمفردها أن تهيمن.`;
			},
			task: {
				prompt: 'أضِف أشجارًا حتى تضم المجموعة **20** مرحلة. راقب البواقي وهي تتقلّص.'
			}
		},
		{
			title: 'معدل التعلم × عدد الأشجار',
			body: (s) => {
				const target = 0.3;
				const n = stagesTo(s, target);
				return `يتبادل η وعدد الأشجار الأدوار. لخفض MSE التدريب إلى ${target}: يحتاج η = 0.1 إلى **${arTrees(stagesTo({ lr: 0.1, depth: s.depth }, target))}**؛ ويحتاج η الحالي = ${s.lr} إلى **${Number.isFinite(n) ? arTrees(n) : `أكثر من ${MAX_STAGES} شجرة`}**.

المنحنى المتقطّع في الرسم البياني هو η = 0.1 للمقارنة.`;
			},
			quiz: {
				question: 'إذا خفّضنا η إلى النصف، من 0.1 إلى 0.05، فكم شجرة نحتاج للوصول إلى خطأ التدريب نفسه؟',
				options: ['العدد نفسه', 'حوالي الضعف', 'حوالي النصف'],
				explain: (s) =>
					`حوالي **الضعف**: ${stagesTo({ lr: 0.1, depth: s.depth }, 0.3)} → ${stagesTo({ lr: 0.05, depth: s.depth }, 0.3)} شجرة للوصول إلى MSE يساوي 0.3. خطوة كل شجرة أصغر بمقدار النصف. عمليًا، غالبًا ما يعمّم η أصغر مع أشجار أكثر بشكل أفضل قليلًا، على حساب وقت التدريب. لهذا يُضبط الاثنان دائمًا معًا.`
			}
		},
		{
			title: 'كثرة المراحل تؤدي إلى الإفراط في التخصيص',
			body: (s) => {
				const v = validLoss(s);
				return `على عكس [الغابة العشوائية](concept:random-forest)، **يمكن** للتعزيز أن يُفرط في التخصيص (overfitting) بإضافة الأشجار: كل مرحلة تلاحق ما تبقّى من البواقي، وفي النهاية لا يتبقّى إلا الضجيج.

النقاط الباهتة هي **${300} نقطة تحقق** لا يتدرّب عليها النموذج أبدًا. المرحلة **${s.stage}**: MSE التدريب ${f3(trainLoss(s)[s.stage])}، وMSE التحقق **${f3(v[s.stage])}**.`;
			},
			quiz: {
				question: `ماذا يحدث لخطأ التحقق إذا واصلنا حتى ${MAX_STAGES} مرحلة؟`,
				options: ['يستمر في الانخفاض، مثل خطأ التدريب', 'يستقر ويبقى ثابتًا', 'يعود للارتفاع لأن المنحنى يبدأ بمطابقة الضجيج'],
				explain: (s) => {
					const v = validLoss(s);
					const b = bestStage(s);
					return `يتجه MSE التدريب نحو ${f3(trainLoss(s)[MAX_STAGES])}، لكن MSE التحقق يبلغ أدناه **${f3(v[b])}** قرب المرحلة ${b}، ثم يرتفع إلى **${f3(v[MAX_STAGES])}** عند المرحلة ${MAX_STAGES}. صار المنحنى ينثني ليمرّ بنقاط مشوّشة منفردة: حالة نموذجية من [الإفراط في التخصيص](concept:overfitting-underfitting).`;
				}
			}
		},
		{
			title: 'الإيقاف المبكر',
			body: (s) => {
				const v = validLoss(s);
				const b = bestStage(s);
				return `الحل هو مراقبة خطأ التحقق أثناء التدريب و**التوقف حين يكفّ عن التحسّن** (early stopping). في scikit-learn: \`validation_fraction=0.1, n_iter_no_change=20\` يحجز 10% من بيانات التدريب ويتوقف بعد 20 مرحلة دون تحسّن. وتسمّيه XGBoost وLightGBM وCatBoost \`early_stopping_rounds\`.

أفضل MSE تحقق: **${f3(v[b])}** عند المرحلة **${b}**. المرحلة الحالية ${s.stage}: ${f3(v[s.stage])}.`;
			},
			task: {
				prompt: 'اسحب شريط **الأشجار (المراحل)** (أو انقر على الرسم البياني) إلى المرحلة التي يكون فيها خطأ التحقق في أدنى مستوى.'
			}
		},
		{
			title: 'AdaBoost: إعادة وزن الأخطاء',
			body: (s) => {
				const cur = curRound(s);
				const last = cur
					? `الجولة **${s.round}**: الخطأ الموزون للجذع ε = ${f3(cur.err)}، لذا فوزنه في التصويت α = ½·ln((1 − ε)/ε) = **${f2(cur.alpha)}**. يصنّف التصويت المجمّع الآن **${pct(adaAccuracy(s.round))}** من النقاط تصنيفًا صحيحًا.`
					: 'اضغط **الجولة التالية** لمطابقة الجذع الأول.';
				return `يحقق **AdaBoost**، خوارزمية التعزيز الأصلية، أثر «التركيز على ما لا يزال خاطئًا» نفسه بطريقة مختلفة. بدلًا من مطابقة البواقي، يدرّب كل متعلّم ضعيف (هنا *جذع قرار* (stump) بتقسيم واحد) على **بيانات مُعاد وزنها**: بعد كل جولة تصبح النقاط المصنّفة خطأً أثقل (علامات أكبر) والصحيحة أخف، فيركّز الجذع التالي على الحالات الصعبة. النموذج النهائي تصويت موزون، يُوزن فيه كل جذع بحسب دقته.

${last}

يتبيّن أن AdaBoost هو تعزيز تدرّجي مع *الخسارة الأسية*، وهذا أيضًا سبب تضرّره من التسميات المشوّشة: النقطة الخاطئة التسمية تزداد ثقلًا باستمرار.`;
			},
			task: {
				prompt: `اضغط **الجولة التالية** حتى تصنّف الجذوع كل النقاط تصنيفًا صحيحًا (أو ${ADA_ROUNDS} جولة).`
			}
		},
		{
			title: 'دورك: ساحة التجريب',
			body: `كل شيء متاح الآن. للتلخيص:

1. ابدأ من ثابت (المتوسط في حالة مربع الخطأ).
2. احسب البواقي، أي التدرّج السالب للخسارة.
3. طابِق عليها شجرة ضحلة وأضِفها مصغّرة بـη.
4. كرّر، وتوقّف حين يكفّ خطأ التحقق عن التحسّن.

جرّب \`max_depth = 1\` (جذوع: بطيء لكنه أملس) مقابل 4 (سريع لكنه يُفرط في التخصيص بسرعة)، أو قيمة كبيرة لـη. تُبنى المكتبات الحديثة على هذه الحلقة بالضبط: [XGBoost](concept:xgboost) يضيف التنظيم (regularization) وخطوات من الرتبة الثانية، و[LightGBM](concept:lightgbm) يجعلها سريعة على البيانات الكبيرة، و[CatBoost](concept:catboost) يتعامل مع الميزات الفئوية بأمان.`
		}
	]
};

export default { fr, ar };
