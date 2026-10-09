/**
 * French and Arabic narration for the linear-regression lesson (same step order as index.ts).
 */
import { fmt } from '#lib/viz/canvas.ts';
import type { LessonText } from '../types.ts';
import * as rg from '../_regression/regression.ts';
import { euro } from '../_regression/plot.ts';
import { CLEAN_FIT, COEF_TARGET, HAND_TARGET, MEAN_X, big, lineEq } from './narration.ts';
import {
	LANDSCAPE_TOL,
	OUTLIER,
	START_LINE,
	best,
	bestMse,
	currentMse,
	fmtAlpha,
	maxCoef,
	mseRatio,
	polyFit,
	polyTrainMse,
	zeros,
	type LRState
} from './state.ts';

const fr: LessonText<LRState> = {
	title: 'Comment la régression linéaire ajuste une droite',
	steps: [
		{
			title: 'Une droite à travers un nuage',
			body: `Chaque point est un appartement : sa **surface** en m² et son **loyer** mensuel en €. Les grands appartements coûtent plus cher, à peu près le long d'une droite.

La régression linéaire prédit justement avec une telle droite :

\`ŷ = w·x + b\`

La **pente** \`w\` est le loyer supplémentaire par m² de plus. L'**ordonnée à l'origine** \`b\` est l'endroit où la droite coupe la surface 0. La droite bleue, \`${lineEq(START_LINE)}\`, est un premier essai, clairement trop plate. Comment mesurer *à quel point* elle se trompe, et trouver la meilleure droite ?`
		},
		{
			title: 'Résidus et MSE',
			body: (s) => `Les segments rouges sont les **résidus** : loyer réel moins loyer prédit, \`y − ŷ\`, pour chaque appartement.

Pour noter la droite entière, on **met au carré** chaque résidu (ainsi les écarts au-dessus et en dessous comptent tous deux, et les gros écarts comptent beaucoup) puis on en fait la **moyenne**. C'est l'**erreur quadratique moyenne** (MSE) :

\`MSE = (1/n)·Σ(y − ŷ)²\`

Actuellement **MSE = ${big(currentMse(s))}** (en €², donc sa racine carrée, la [RMSE](concept:rmse-metric) de **${euro(Math.sqrt(currentMse(s)))}**, est plus facile à lire).`,
			task: {
				prompt: `Faites glisser les deux poignées rondes de la droite jusqu'à ce que la MSE passe sous **${big(HAND_TARGET)}**.`
			}
		},
		{
			title: 'Le paysage de la MSE',
			body: (s) => `Chaque droite n'est qu'une paire de nombres (w, b) : on peut donc dessiner **toutes les droites possibles d'un coup**. Dans le graphique du paysage, chaque endroit est une droite, colorée selon sa MSE : plus la couleur est foncée, plus l'erreur est faible. Le point rose est votre droite actuelle.

Pour une droite, la MSE est une **cuvette** lisse avec un seul fond : il y a donc une seule meilleure droite et aucun piège. La vallée est une longue diagonale inclinée : une pente plus forte avec une ordonnée plus basse s'ajuste presque aussi bien.

${mseRatio(s) < LANDSCAPE_TOL ? `**Près du fond :** MSE ${big(currentMse(s))}, le minimum possible est ${big(bestMse(s))}.` : `La MSE de votre droite est **${fmt((mseRatio(s) - 1) * 100, 0)} %** au-dessus du minimum possible.`}`,
			task: {
				prompt: 'Cliquez ou glissez sur le paysage pour arriver à moins de **10 %** de la MSE minimale. Visez la bande la plus foncée.'
			}
		},
		{
			title: 'Les moindres carrés, résolus exactement',
			body: (s) => {
				const f = best(s);
				return `Inutile de chercher : pour une droite, le fond de la cuvette a une formule. Les **moindres carrés ordinaires** (OLS) annulent la pente de la cuvette et résolvent :

\`w = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²\`, \`b = ȳ − w·x̄\`

Sur ces données, cela donne \`${lineEq(f)}\` : chaque m² supplémentaire ajoute environ **€${fmt(f.w)}** par mois. La meilleure droite passe toujours par le point moyen (x̄ = ${fmt(rg.mean(s.xs), 1)} m², ȳ = ${euro(rg.mean(s.ys))}).

Avec de nombreuses variables, la même idée devient l'équation normale \`w = (XᵀX)⁻¹Xᵀy\`, ou la [descente de gradient](concept:what-is-gradient-descent) quand les données sont énormes. Maintenant, **faites glisser les données** : l'ajustement se recalcule instantanément.`;
			},
			task: {
				prompt: `Faites glisser un seul point pour faire passer la pente sous **€9 par m²**. Essayez d'abord un appartement près du milieu (${fmt(MEAN_X, 0)} m²), puis un à l'une des extrémités.`
			}
		},
		{
			title: 'Une seule ligne erronée',
			body: `Les moindres carrés mettent chaque résidu au carré, donc les plus gros écarts dominent le score. Cela les rend très sensibles aux **valeurs aberrantes**.

Supposons qu'un appartement de plus se glisse dans les données : **${OUTLIER.x} m²** avec un loyer saisi à **€${OUTLIER.y}** au lieu de €1,500.`,
			quiz: {
				question: `C'est 1 ligne sur 31. Qu'arrive-t-il à la pente ajustée (actuellement €${fmt(CLEAN_FIT.w)} par m²) ?`,
				options: [
					'Elle bouge à peine : une ligne ne représente qu’environ 3 % des données',
					'Elle baisse nettement, autour de €8 par m²',
					'Elle devient négative : les grands appartements semblent moins chers'
				],
				explain: (s) => {
					const f = best(s);
					const miss = rg.lineAt(f, OUTLIER.x) - OUTLIER.y;
					return `La pente passe de **€${fmt(CLEAN_FIT.w)}** à **€${fmt(f.w)}** par m² (droite pointillée = avant). Le résidu de la faute de frappe vaut environ ${euro(miss)}, et au carré cela fait **${big(miss ** 2)}**, plus que les 30 autres résidus au carré réunis. Incliner la droite vers lui est le moyen le moins coûteux de réduire le total. Corrigez les lignes erronées, ou utilisez une perte qui croît plus lentement, comme la [MAE](concept:mae-metric) ou la perte de Huber. Activez ou retirez la faute avec le bouton ci-dessous.`;
				}
			}
		},
		{
			title: 'Des courbes : ajouter des variables polynomiales',
			body: (s) => {
				const f = polyFit(s);
				return `Un nouveau jeu de données : 12 échantillons bruités d'une relation courbe. Une droite ne peut pas la suivre.

L'astuce : ajouter **x², x³, …** comme variables supplémentaires. Le modèle \`ŷ = b + w₁x + w₂x² + … + w_d·x^d\` reste une *régression linéaire* : il est linéaire en ses poids, et les moindres carrés le résolvent de la même façon.

Degré **${s.degree}** : MSE d'entraînement **${fmt(polyTrainMse(s, f), 4)}**, plus grand poids **${fmt(maxCoef(f), 1)}**. Les barres ci-dessous montrent chaque poids.`;
			},
			task: {
				prompt: 'Montez le degré à **9**. La courbe colle aux points, mais regardez la taille des poids.'
			}
		},
		{
			title: 'Ridge : un prix sur les gros poids',
			body: (s) => {
				const f = polyFit(s);
				return `D'énormes poids qui se compensent mutuellement sont un signe de [surapprentissage](concept:overfitting-underfitting) : la courbe se plie pour poursuivre le bruit (comparez-la avec la **vraie courbe** en pointillés).

La régression **Ridge** ajoute une pénalité sur la taille des poids :

\`minimize Σ(y − ŷ)² + α·Σwⱼ²\`

Un **α** plus grand tire chaque poids vers zéro. Actuellement α = **${fmtAlpha(s.logAlpha)}**, plus grand |w| = **${fmt(maxCoef(f), 2)}**, MSE d'entraînement = **${fmt(polyTrainMse(s, f), 4)}**. L'erreur d'entraînement monte un peu, mais la courbe se calme. (La pénalité dépend de l'échelle des variables : [mettez vos variables à l'échelle](concept:feature-scaling) d'abord ; ici x est déjà dans [−1, 1].)`;
			},
			task: {
				prompt: `Augmentez α jusqu'à ce que chaque poids soit inférieur à **${COEF_TARGET}** en valeur absolue.`
			}
		},
		{
			title: 'Lasso : certains poids tombent à zéro',
			body: (s) => `Ridge avec α = ${fmtAlpha(s.logAlpha)} garde les ${s.degree} poids, juste plus petits. **Lasso** remplace les carrés de la pénalité par des valeurs absolues :

\`minimize (1/2n)·Σ(y − ŷ)² + α·Σ|wⱼ|\``,
			quiz: {
				question: 'Que fait la pénalité L1 aux 9 poids ?',
				options: [
					'Elle les réduit tous du même facteur, comme Ridge',
					'Elle en met plusieurs exactement à zéro et réduit les autres',
					'Elle les agrandit, puisque |w| est plus petit que w² pour les gros poids'
				],
				explain: (s) => {
					const f = polyFit(s);
					return `Avec Lasso, **${zeros(f)} poids sur ${s.degree}** valent maintenant exactement 0 (affichés « 0 » dans le graphique). La pénalité |w| continue de tirer avec la même force même quand un poids est minuscule : les variables faibles sont donc complètement éteintes, une [sélection de variables](concept:feature-selection) intégrée. La pénalité w² de Ridge s'estompe près de zéro, elle ne fait donc que réduire. Plus de détails dans [régularisation L1 vs L2](concept:regularization-l1-l2). Essayez le curseur α.`;
				}
			}
		},
		{
			title: 'Au-delà des données',
			body: `Retour aux moindres carrés simples au degré 9. Tous les points d'entraînement sont entre x = −0.95 et 0.95, et l'ajustement y semble correct.

Mais un modèle ne connaît que la plage sur laquelle il a été entraîné. Prédire en dehors s'appelle l'**extrapolation**.`,
			quiz: {
				question: 'Que prédit cet ajustement de degré 9 en x = 1.3, juste après les données ? (La vraie courbe donne environ −0.8.)',
				options: ['Quelque chose proche de −0.8 : il suit bien la courbe', 'Une valeur délirante, loin hors du graphique', 'Exactement 0, puisqu’il n’y a pas de données là'],
				explain: (s) => {
					const v = rg.evalPoly(polyFit(s), 1.3);
					const cubic = rg.evalPoly(rg.fitPoly(s.px.slice(), s.py.slice(), 3), 1.3);
					return `Il prédit **${fmt(v, 0)}**. Les hautes puissances comme x⁹ explosent dès que |x| > 1, et rien dans les données d'entraînement ne les retenait. Même un polynôme cubique raisonnable y prédit **${fmt(cubic, 1)}**. Les droites extrapolent plus doucement mais tout aussi aveuglément : notre droite des loyers estimerait sans sourciller un penthouse de 400 m² à ${euro(rg.lineAt(CLEAN_FIT, 400))}. Ne faites confiance à une régression qu'à l'intérieur de la plage de ses données.`;
				}
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué. Récapitulatif :

1. La régression linéaire prédit \`ŷ = w·x + b\` (avec plus de poids pour plus de variables).
2. Elle choisit les poids qui minimisent la **MSE**, la moyenne des résidus au carré. Pour une droite, c'est une cuvette à un seul fond, résolue exactement par les moindres carrés.
3. La mise au carré la rend **sensible aux valeurs aberrantes** : vérifiez vos données.
4. Les variables polynomiales courbent l'ajustement ; **Ridge** réduit les poids, **Lasso** en annule certains, et tous deux luttent contre le surapprentissage.
5. N'**extrapolez** pas loin au-delà des données.

Ensuite : évaluez un ajustement avec la [RMSE](concept:rmse-metric), la [MAE](concept:mae-metric) et le [R²](concept:r2-score).`
		}
	]
};

const ar: LessonText<LRState> = {
	title: 'كيف يلائم الانحدار الخطي خطًا مستقيمًا',
	steps: [
		{
			title: 'خط عبر سحابة',
			body: `كل نقطة شقة: **مساحتها** بالمتر المربع و**إيجارها** الشهري باليورو. الشقق الأكبر أغلى، تقريبًا على امتداد خط مستقيم.

يتنبأ الانحدار الخطي (linear regression) بخط كهذا تمامًا:

\`ŷ = w·x + b\`

**الميل** \`w\` هو الإيجار الإضافي لكل متر مربع إضافي. و**المقطع** (intercept) \`b\` هو حيث يقطع الخط المساحة 0. الخط الأزرق \`${lineEq(START_LINE)}\` تخمين أول، ومن الواضح أنه مسطح أكثر من اللازم. كيف نقيس *مدى* خطئه، ونجد أفضل خط؟`
		},
		{
			title: 'البواقي ومتوسط مربع الخطأ',
			body: (s) => `القطع الحمراء هي **البواقي** (residuals): الإيجار الفعلي ناقص الإيجار المتنبأ به، \`y − ŷ\`، لكل شقة.

لتقييم الخط كله **نربّع** كل باقٍ (فتُحتسب الأخطاء فوق الخط وتحته معًا، وتُحتسب الأخطاء الكبيرة بثقل كبير) ثم نأخذ **متوسطها**. هذا هو **متوسط مربع الخطأ** (MSE):

\`MSE = (1/n)·Σ(y − ŷ)²\`

الآن **MSE = ${big(currentMse(s))}** (بوحدة €²، لذا فجذره التربيعي، أي [RMSE](concept:rmse-metric) البالغ **${euro(Math.sqrt(currentMse(s)))}**، أسهل قراءة).`,
			task: {
				prompt: `اسحب المقبضين الدائريين على الخط حتى ينخفض MSE إلى ما دون **${big(HAND_TARGET)}**.`
			}
		},
		{
			title: 'تضاريس MSE',
			body: (s) => `كل خط مجرد زوج من الأعداد (w, b)، لذا يمكننا رسم **كل الخطوط الممكنة دفعة واحدة**. في مخطط التضاريس كل موضع يمثل خطًا واحدًا، ملوّنًا بحسب MSE الخاص به: كلما كان اللون أغمق كان الخطأ أقل. النقطة الوردية هي خطك الحالي.

بالنسبة للخط المستقيم، MSE **وعاء** أملس بقاع واحد فقط، فهناك خط أفضل وحيد ولا فخاخ. الوادي قطر طويل مائل: ميل أشد مع مقطع أدنى يلائم بشكل جيد تقريبًا بالقدر نفسه.

${mseRatio(s) < LANDSCAPE_TOL ? `**قرب القاع:** MSE ${big(currentMse(s))}، وأدنى قيمة ممكنة ${big(bestMse(s))}.` : `MSE لخطك أعلى بـ**${fmt((mseRatio(s) - 1) * 100, 0)}%** من أدنى قيمة ممكنة.`}`,
			task: {
				prompt: 'انقر أو اسحب على التضاريس لتصل إلى ما دون **10%** فوق أدنى MSE. استهدف الشريط الأغمق لونًا.'
			}
		},
		{
			title: 'المربعات الصغرى: حل دقيق',
			body: (s) => {
				const f = best(s);
				return `لا حاجة إلى البحث: بالنسبة للخط، لقاع الوعاء صيغة. **المربعات الصغرى العادية** (OLS) تجعل ميل الوعاء صفرًا وتحل:

\`w = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²\`، \`b = ȳ − w·x̄\`

على هذه البيانات نحصل على \`${lineEq(f)}\`: كل متر مربع إضافي يضيف نحو **€${fmt(f.w)}** شهريًا. يمر أفضل خط دائمًا بالنقطة المتوسطة (x̄ = ${fmt(rg.mean(s.xs), 1)} m²، ȳ = ${euro(rg.mean(s.ys))}).

مع ميزات كثيرة تصبح الفكرة نفسها المعادلة الطبيعية \`w = (XᵀX)⁻¹Xᵀy\`، أو [الانحدار التدرجي](concept:what-is-gradient-descent) عندما تكون البيانات ضخمة. الآن **اسحب البيانات**: تُعاد الملاءمة فورًا.`;
			},
			task: {
				prompt: `اسحب نقطة واحدة لتخفض الميل إلى ما دون **€9 لكل m²**. جرّب أولًا شقة قرب المنتصف (${fmt(MEAN_X, 0)} m²)، ثم واحدة عند أحد الطرفين.`
			}
		},
		{
			title: 'صف واحد خاطئ',
			body: `تربّع المربعات الصغرى كل باقٍ، فتهيمن الأخطاء الأكبر على الدرجة. وهذا يجعلها شديدة الحساسية لـ**القيم الشاذة** (outliers).

لنفترض أن شقة إضافية تسللت إلى البيانات: **${OUTLIER.x} m²** وإيجارها مُدخل بقيمة **€${OUTLIER.y}** بدلًا من €1,500.`,
			quiz: {
				question: `هذا صف واحد من 31. ماذا يحدث للميل المُلاءَم (حاليًا €${fmt(CLEAN_FIT.w)} لكل m²)؟`,
				options: [
					'بالكاد يتغير: صف واحد لا يمثل سوى نحو 3% من البيانات',
					'ينخفض بشكل ملحوظ، إلى نحو €8 لكل m²',
					'يصبح سالبًا: تبدو الشقق الأكبر أرخص'
				],
				explain: (s) => {
					const f = best(s);
					const miss = rg.lineAt(f, OUTLIER.x) - OUTLIER.y;
					return `ينخفض الميل من **€${fmt(CLEAN_FIT.w)}** إلى **€${fmt(f.w)}** لكل m² (الخط المتقطع = قبل). باقي خطأ الإدخال نحو ${euro(miss)}، ومربعه **${big(miss ** 2)}**، أي أكثر من مجموع مربعات البواقي الثلاثين الأخرى. إمالة الخط نحوه هي أرخص طريقة لتقليل المجموع. أصلح الصفوف الخاطئة، أو استخدم خسارة تنمو ببطء أكبر مثل [MAE](concept:mae-metric) أو Huber. بدّل خطأ الإدخال بالزر أدناه.`;
				}
			}
		},
		{
			title: 'المنحنيات: إضافة ميزات متعددة الحدود',
			body: (s) => {
				const f = polyFit(s);
				return `مجموعة بيانات جديدة: 12 عيّنة مشوّشة من علاقة منحنية. لا يستطيع الخط المستقيم تتبّعها.

الحيلة: إضافة **x²، x³، …** كميزات إضافية. النموذج \`ŷ = b + w₁x + w₂x² + … + w_d·x^d\` يبقى *انحدارًا خطيًا*: فهو خطي في الأوزان، وتحله المربعات الصغرى بالطريقة نفسها.

الدرجة **${s.degree}**: MSE التدريب **${fmt(polyTrainMse(s, f), 4)}**، أكبر وزن **${fmt(maxCoef(f), 1)}**. تُظهر الأعمدة أدناه كل الأوزان.`;
			},
			task: {
				prompt: 'ارفع الدرجة إلى **9**. يلتصق المنحنى بالنقاط، لكن انظر إلى حجم الأوزان.'
			}
		},
		{
			title: 'Ridge: ثمن على الأوزان الكبيرة',
			body: (s) => {
				const f = polyFit(s);
				return `الأوزان الضخمة التي يلغي بعضها بعضًا علامة على [الإفراط في التخصيص (overfitting)](concept:overfitting-underfitting): ينثني المنحنى ليطارد الضجيج (قارنه بـ**المنحنى الحقيقي** المتقطع).

يضيف انحدار **Ridge** عقوبة على حجم الأوزان:

\`minimize Σ(y − ŷ)² + α·Σwⱼ²\`

كلما كبرت **α** سحبت كل الأوزان نحو الصفر. الآن α = **${fmtAlpha(s.logAlpha)}**، أكبر |w| = **${fmt(maxCoef(f), 2)}**، MSE التدريب = **${fmt(polyTrainMse(s, f), 4)}**. يرتفع خطأ التدريب قليلًا، لكن المنحنى يهدأ. (تعتمد العقوبة على مقياس الميزات، لذا [وحّد مقاييس ميزاتك](concept:feature-scaling) أولًا؛ هنا x يقع أصلًا في [−1, 1].)`;
			},
			task: {
				prompt: `ارفع α حتى يصبح كل وزن أصغر من **${COEF_TARGET}** بالقيمة المطلقة.`
			}
		},
		{
			title: 'Lasso: بعض الأوزان تصل إلى الصفر',
			body: (s) => `يحتفظ Ridge عند α = ${fmtAlpha(s.logAlpha)} بالأوزان الـ${s.degree} كلها، لكن أصغر. أما **Lasso** فيستبدل في العقوبة المربعات بالقيم المطلقة:

\`minimize (1/2n)·Σ(y − ŷ)² + α·Σ|wⱼ|\``,
			quiz: {
				question: 'ماذا تفعل عقوبة L1 بالأوزان التسعة؟',
				options: [
					'تقلّصها كلها بالمعامل نفسه، مثل Ridge',
					'تجعل عددًا منها صفرًا تمامًا وتقلّص الباقي',
					'تكبّرها، لأن |w| أصغر من w² للأوزان الكبيرة'
				],
				explain: (s) => {
					const f = polyFit(s);
					return `مع Lasso أصبح **${zeros(f)} من ${s.degree}** أوزان صفرًا تمامًا (تظهر «0» في المخطط). تواصل عقوبة |w| السحب بالقوة نفسها حتى عندما يكون الوزن ضئيلًا، فتُطفأ الميزات الضعيفة كليًا: [اختيار ميزات](concept:feature-selection) (feature selection) مدمج. أما عقوبة w² في Ridge فتتلاشى قرب الصفر، لذا تكتفي بالتقليص. المزيد في [التنظيم L1 مقابل L2](concept:regularization-l1-l2). جرّب شريط α.`;
				}
			}
		},
		{
			title: 'ما بعد البيانات',
			body: `نعود إلى المربعات الصغرى البسيطة عند الدرجة 9. كل نقاط التدريب تقع بين x = −0.95 و0.95، والملاءمة تبدو جيدة هناك.

لكن النموذج لا يعرف إلا المدى الذي دُرّب عليه. التنبؤ خارجه يُسمّى **الاستقراء** (extrapolation).`,
			quiz: {
				question: 'بماذا تتنبأ ملاءمة الدرجة 9 هذه عند x = 1.3، بعد البيانات بقليل؟ (المنحنى الحقيقي يعطي نحو −0.8.)',
				options: ['قيمة قريبة من −0.8: فهي تتبع المنحنى عن قرب', 'قيمة جامحة بعيدة خارج المخطط', 'صفر تمامًا، لعدم وجود بيانات هناك'],
				explain: (s) => {
					const v = rg.evalPoly(polyFit(s), 1.3);
					const cubic = rg.evalPoly(rg.fitPoly(s.px.slice(), s.py.slice(), 3), 1.3);
					return `تتنبأ بـ**${fmt(v, 0)}**. القوى العالية مثل x⁹ تنفجر بمجرد أن يصبح |x| > 1، ولم يكن في بيانات التدريب ما يكبحها. حتى متعددة حدود تكعيبية معقولة تتنبأ هناك بـ**${fmt(cubic, 1)}**. الخطوط المستقيمة تستقرئ بلطف أكبر لكن بالعمى نفسه: سيسعّر خط الإيجار لدينا شقة فاخرة مساحتها 400 m² بـ${euro(rg.lineAt(CLEAN_FIT, 400))} دون تردد. لا تثق بالانحدار إلا داخل مدى بياناته.`;
				}
			}
		},
		{
			title: 'دورك: ساحة التجربة',
			body: `كل شيء متاح الآن. للتلخيص:

1. يتنبأ الانحدار الخطي بـ\`ŷ = w·x + b\` (مع أوزان إضافية لميزات إضافية).
2. يختار الأوزان التي تقلّل **MSE**، أي متوسط مربعات البواقي. للخط المستقيم هذا وعاء بقاع واحد، تحله المربعات الصغرى بدقة.
3. التربيع يجعله **حساسًا للقيم الشاذة**: تحقق من بياناتك.
4. الميزات متعددة الحدود تحني الملاءمة؛ **Ridge** يقلّص الأوزان، و**Lasso** يصفّر بعضها، وكلاهما يحارب الإفراط في التخصيص.
5. لا **تستقرئ** بعيدًا عن البيانات.

التالي: قيّم الملاءمة بـ[RMSE](concept:rmse-metric) و[MAE](concept:mae-metric) و[R²](concept:r2-score).`
		}
	]
};

export default { fr, ar };
