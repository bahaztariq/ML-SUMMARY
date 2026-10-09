/**
 * French and Arabic narration for the SVM lesson (same step order as index.ts).
 */
import type { LessonText } from '../types.ts';
import { marginWidth } from './svm.ts';
import { CANDIDATES, DATA, fit, lineMargin, roleCounts, testAcc, trainAcc, type SvmState } from './state.ts';

const f3 = (v: number) => v.toFixed(3);
const pct = (v: number) => `${Math.round(v * 100)}%`;
const width = (s: SvmState) => marginWidth(fit(s));
const nsv = (s: SvmState) => fit(s).sv.length;
const at = (s: SvmState, C: number) => fit({ ...s, C } as SvmState);
const margins = () => CANDIDATES.map((l) => f3(lineMargin(l, DATA.separable)));
const TEST_TARGET = 0.95;

const fr: LessonText<SvmState> = {
	title: 'Comment une machine à vecteurs de support trace la rue la plus large',
	steps: [
		{
			title: 'Beaucoup de droites, zéro erreur',
			body: (s) => `Ces ${s.points.length} points, de classe **A** (cercles) et de classe **B** (carrés), peuvent être séparés par une droite. Et même par une infinité de droites.

Les trois droites tracées ici classent correctement tous les points d’entraînement. Un modèle qui ne compte que les erreurs d’entraînement ne peut pas les départager.`,
			quiz: {
				question: 'À quelle droite feriez-vous le plus confiance sur de nouveaux points ?',
				options: ['Droite 1', 'Droite 2', 'Droite 3', 'N’importe laquelle : les trois font zéro erreur d’entraînement'],
				explain: () => {
					const m = margins();
					return `La droite 2 laisse le plus de place : son point le plus proche est à **${m[1]}**, contre ${m[0]} pour la droite 1 et ${m[2]} pour la droite 3. Un nouveau point qui s’écarte un peu du nuage de sa classe a moins de chances de tomber du mauvais côté. Cette place, c’est la **marge**, et un SVM choisit la droite qui la rend aussi grande que possible.`;
				}
			}
		},
		{
			title: 'La rue la plus large',
			body: (s) => `Un SVM cherche la **rue la plus large** qui sépare les classes. La frontière \`f(x) = w·x + b = 0\` passe au milieu. Les deux bords sont là où f(x) = +1 et f(x) = −1.

La largeur de la rue vaut \`2 / ‖w‖\` = **${f3(width(s))}** : l’élargir revient donc à rendre ‖w‖ petit. L’entraînement résout :

\`minimize ½‖w‖²  subject to  yᵢ·f(xᵢ) ≥ 1 for every point\`

(yᵢ = +1 pour B, −1 pour A). Les points cerclés touchent les bords. Ce sont les **vecteurs de support** : seulement **${nsv(s)}** points sur ${s.points.length}.`
		},
		{
			title: 'Seuls les vecteurs de support comptent',
			body: (s) => `La solution est une somme pondérée de points d’entraînement, \`w = Σ αᵢyᵢxᵢ\`, et le poids αᵢ est **nul pour tout point qui n’est pas un vecteur de support**.

On peut donc déplacer n’importe quel autre point n’importe où hors de la rue sans que la frontière bouge. Déplacez un vecteur de support, ou poussez un point dans la rue, et la rue est recalculée autour des nouveaux points les plus proches. Comparez avec la [régression logistique](concept:logistic-regression), où chaque point tire sur la droite.

Vecteurs de support : **${nsv(s)}**, largeur **${f3(width(s))}**.`,
			task: {
				prompt: 'Faites glisser un point **non** cerclé (en le gardant hors de la rue) et constatez que rien ne bouge. Puis faites glisser un vecteur de support **cerclé**.'
			}
		},
		{
			title: 'Chevauchement : la marge souple',
			body: (s) => {
				const r = roleCounts(s);
				return `Les vraies classes se chevauchent : aucune rue ne peut rester vide. La **marge souple** permet à des points d’enfreindre la règle, moyennant un coût. La violation d’un point est sa **perte charnière** (*hinge loss*) :

\`ξᵢ = max(0, 1 − yᵢ·f(xᵢ))\`

Elle vaut 0 hors de la rue, entre 0 et 1 dans la rue, et plus de 1 du mauvais côté (les traits en pointillés la montrent). Le SVM minimise maintenant

\`½‖w‖² + C·Σ ξᵢ\`

Avec C = ${s.C} : **${r.inside}** points dans la rue, **${r.wrong}** du mauvais côté, largeur ${f3(width(s))}. Chaque point en violation devient lui aussi un vecteur de support (anneaux en pointillés) : **${nsv(s)}** au total.`;
			},
			quiz: {
				question: 'Augmentez C de 1 à 100. Qu’arrive-t-il à la rue ?',
				options: [
					'Elle s’élargit et contient plus de points',
					'Elle se rétrécit : chaque violation coûte désormais plus cher',
					'Rien : C ne compte que si les classes ne se chevauchent pas'
				],
				explain: (s) => {
					const a = at(s, 1);
					return `Avec C = 100, chaque unité de violation coûte 100 fois plus : le SVM rétrécit la rue pour en chasser les points. Largeur ${f3(marginWidth(a))} → **${f3(width(s))}**, vecteurs de support ${a.sv.length} → **${nsv(s)}**. Un grand C colle davantage aux données d’entraînement. Un petit C préfère une rue large et calme et tolère les violations : c’est une [régularisation](concept:regularization-l1-l2) plus forte.`;
				}
			}
		},
		{
			title: 'Régler C',
			body: (s) => {
				const r = roleCounts(s);
				return `C est le bouton entre une **rue large avec beaucoup de violations** (petit C, beaucoup de vecteurs de support) et une **rue étroite qui se plie à chaque point** (grand C, peu de vecteurs de support).

C = **${s.C}** : largeur ${f3(width(s))}, ${nsv(s)} vecteurs de support, ${r.inside + r.wrong} violations. Exactitude d’entraînement ${pct(trainAcc(s))}, exactitude sur 200 nouveaux points **${pct(testAcc(s))}**.

Remarquez que l’exactitude d’entraînement n’indique presque pas quel C est le meilleur. On choisit C par [validation croisée](concept:cross-validation).`;
			},
			task: {
				prompt: 'Faites glisser C tout en bas puis tout en haut, et observez la rue et le nombre d’anneaux.'
			}
		},
		{
			title: 'Quand aucune droite ne convient',
			body: (s) => `Ici, la classe B est au milieu et la classe A l’entoure. La meilleure droite n’obtient que **${pct(trainAcc(s))}** de bonnes réponses.

Une solution consiste à **ajouter une variable**. Avec \`x₃ = x₁² + x₂²\` (distance au centre, au carré), les points B ont un petit x₃ et les points A un grand x₃ : un seul seuil sur x₃ les sépare (bande ci-dessous).

En 3D, avec les axes (x₁, x₂, x₃), ce seuil est un plan : un séparateur linéaire. Projeté sur le graphique 2D d’origine, il devient un cercle.`
		},
		{
			title: 'L’astuce du noyau',
			body: (s) => `Inventer des variables à la main ne passe pas à l’échelle. Or le problème d’entraînement du SVM n’utilise les points qu’à travers des **produits scalaires** \`xᵢ·xⱼ\`. Remplacez-les par un **noyau** \`K(xᵢ, xⱼ)\` et vous obtenez un SVM linéaire dans un espace de variables plus riche, sans jamais calculer ces variables.

Le **noyau RBF** \`K(x, x′) = exp(−γ‖x − x′‖²)\` mesure une similarité : 1 pour des points identiques, tombant vers 0 avec la distance. Son espace de variables est de dimension infinie. La fonction de décision devient une somme de bosses centrées sur les vecteurs de support :

\`f(x) = Σ αᵢyᵢ·K(xᵢ, x) + b\`

RBF avec γ = ${s.gamma} : **${pct(trainAcc(s))}** de bonnes réponses avec **${nsv(s)}** vecteurs de support.`
		},
		{
			title: 'γ : jusqu’où porte chaque point',
			body: (s) => `**γ** fixe la largeur de chaque bosse. Avec un petit γ, chaque vecteur de support influence une large zone et la frontière est lisse, presque droite. Avec un grand γ, les bosses sont minuscules et la frontière s’enroule autour de points isolés, îlots compris.

C’est du [surapprentissage](concept:overfitting-underfitting) : parfait sur les points d’entraînement, moins bon sur les nouveaux. Ces lunes sont bruitées, donc les deux classes se mélangent là où elles se rejoignent.

γ = **${s.gamma}**, C = ${s.C} : exactitude d’entraînement **${pct(trainAcc(s))}**, exactitude sur 400 nouveaux points **${pct(testAcc(s))}**, ${nsv(s)} vecteurs de support.`,
			task: {
				prompt: `Poussez γ au maximum et cherchez des îlots. Puis trouvez un γ qui atteint au moins **${pct(TEST_TARGET)}** sur les nouveaux points.`
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué : déplacez des points, changez de noyau et de jeu de données, réglez C et γ.

Récapitulatif :

1. Un SVM choisit la frontière avec la **marge la plus large**, \`2/‖w‖\`.
2. Seuls les **vecteurs de support** la définissent ; tous les autres points ont α = 0.
3. **C** arbitre entre une rue large et les violations de marge (perte charnière).
4. Les **noyaux** donnent des frontières courbes sans calculer de nouvelles variables. Le **γ** du RBF fixe la portée de chaque point : trop grand, il surapprend.
5. [Mettez vos variables à l’échelle](concept:feature-scaling) d’abord, car les marges sont des distances, et réglez C et γ ensemble par [validation croisée](concept:cross-validation).

Le temps d’entraînement croît vite avec le nombre de points, et les SVM ne donnent pas de probabilités par défaut. La [régression logistique](concept:logistic-regression), si.`
		}
	]
};

const ar: LessonText<SvmState> = {
	title: 'كيف ترسم آلة متجهات الدعم أعرض شارع ممكن',
	steps: [
		{
			title: 'خطوط كثيرة، وصفر أخطاء',
			body: (s) => `هذه النقاط الـ${s.points.length}، من الفئة **A** (دوائر) والفئة **B** (مربعات)، يمكن فصلها بخط مستقيم. بل بعدد لا نهائي من الخطوط.

الخطوط الثلاثة المرسومة هنا تصنّف كل نقاط التدريب تصنيفًا صحيحًا. النموذج الذي لا يحسب إلا أخطاء التدريب لا يستطيع التمييز بينها.`,
			quiz: {
				question: 'أي خط تثق به أكثر على نقاط جديدة؟',
				options: ['الخط 1', 'الخط 2', 'الخط 3', 'أيٌّ منها: الثلاثة لا ترتكب أي خطأ في التدريب'],
				explain: () => {
					const m = margins();
					return `يترك الخط 2 أكبر مساحة: أقرب نقطة إليه على بعد **${m[1]}**، مقابل ${m[0]} للخط 1 و${m[2]} للخط 3. النقطة الجديدة التي تبتعد قليلًا عن سحابة فئتها أقل عرضة للوقوع في الجهة الخاطئة. هذه المساحة هي **الهامش** (margin)، وتختار SVM الخط الذي يجعله أكبر ما يمكن.`;
				}
			}
		},
		{
			title: 'أعرض شارع',
			body: (s) => `تبحث آلة متجهات الدعم (SVM) عن **أعرض شارع** يفصل بين الفئتين. يمر الحد \`f(x) = w·x + b = 0\` في منتصفه، والحافتان حيث f(x) = +1 و f(x) = −1.

عرض الشارع هو \`2 / ‖w‖\` = **${f3(width(s))}**، فجعله عريضًا يعني جعل ‖w‖ صغيرًا. يحل التدريب المسألة:

\`minimize ½‖w‖²  subject to  yᵢ·f(xᵢ) ≥ 1 for every point\`

(yᵢ = +1 لـ B و −1 لـ A). النقاط المحاطة بحلقات تلامس الحافتين. هذه هي **متجهات الدعم** (support vectors): **${nsv(s)}** فقط من أصل ${s.points.length} نقطة.`
		},
		{
			title: 'متجهات الدعم وحدها هي المهمة',
			body: (s) => `الحل مجموع موزون لنقاط التدريب، \`w = Σ αᵢyᵢxᵢ\`، والوزن αᵢ **يساوي صفرًا لكل نقطة ليست متجه دعم**.

لذا يمكنك نقل أي نقطة أخرى إلى أي مكان خارج الشارع دون أن يتحرك الحد. حرّك متجه دعم، أو ادفع أي نقطة إلى داخل الشارع، فيُعاد حل الشارع حول أقرب النقاط الجديدة. قارن ذلك بـ[الانحدار اللوجستي](concept:logistic-regression)، حيث تسحب كل نقطة الخط.

متجهات الدعم: **${nsv(s)}**، العرض **${f3(width(s))}**.`,
			task: {
				prompt: 'اسحب نقطة **غير** محاطة بحلقة (وأبقها خارج الشارع) ولاحظ أن شيئًا لا يتحرك. ثم اسحب متجه دعم **محاطًا بحلقة**.'
			}
		},
		{
			title: 'التداخل: الهامش المرن',
			body: (s) => {
				const r = roleCounts(s);
				return `الفئات الحقيقية تتداخل، فلا يمكن لأي شارع أن يبقى فارغًا. يسمح **الهامش المرن** (soft margin) للنقاط بمخالفة القاعدة مقابل ثمن. مخالفة النقطة هي **خسارة المفصلة** (hinge loss):

\`ξᵢ = max(0, 1 − yᵢ·f(xᵢ))\`

تساوي 0 خارج الشارع، وبين 0 و1 داخله، وأكثر من 1 في الجهة الخاطئة (تُظهرها الخطوط المتقطعة). تقلّل SVM الآن

\`½‖w‖² + C·Σ ξᵢ\`

مع C = ${s.C}: **${r.inside}** نقطة داخل الشارع، و**${r.wrong}** في الجهة الخاطئة، والعرض ${f3(width(s))}. كل نقطة مخالفة تصبح متجه دعم أيضًا (حلقات متقطعة): **${nsv(s)}** إجمالًا.`;
			},
			quiz: {
				question: 'ارفع C من 1 إلى 100. ماذا يحدث للشارع؟',
				options: [
					'يتسع ويحتوي نقاطًا أكثر',
					'يضيق: كل مخالفة صارت أغلى',
					'لا شيء: C لا يهم إلا عندما لا تتداخل الفئات'
				],
				explain: (s) => {
					const a = at(s, 1);
					return `مع C = 100 تصبح كل وحدة مخالفة أغلى بمئة مرة، فتضيّق SVM الشارع لتُخرج النقاط منه: العرض ${f3(marginWidth(a))} ← **${f3(width(s))}**، ومتجهات الدعم ${a.sv.length} ← **${nsv(s)}**. قيمة C الكبيرة تلائم بيانات التدريب بقوة أكبر. أما C الصغيرة فتفضّل شارعًا عريضًا هادئًا وتتسامح مع المخالفات، وهذا [تنظيم](concept:regularization-l1-l2) (regularization) أقوى.`;
				}
			}
		},
		{
			title: 'ضبط C',
			body: (s) => {
				const r = roleCounts(s);
				return `C هو المقبض بين **شارع عريض بمخالفات كثيرة** (C صغير، متجهات دعم كثيرة) و**شارع ضيق ينحني لكل نقطة** (C كبير، متجهات دعم قليلة).

C = **${s.C}**: العرض ${f3(width(s))}، و${nsv(s)} متجه دعم، و${r.inside + r.wrong} مخالفة. دقة التدريب ${pct(trainAcc(s))}، والدقة على 200 نقطة جديدة **${pct(testAcc(s))}**.

لاحظ أن دقة التدريب لا تكاد تخبرك أي قيمة لـ C هي الأفضل. تختار C باستخدام [التحقق المتقاطع](concept:cross-validation) (cross-validation).`;
			},
			task: {
				prompt: 'حرّك C إلى أدنى قيمة ثم إلى أعلى قيمة، وراقب الشارع وعدد الحلقات.'
			}
		},
		{
			title: 'عندما لا يكفي أي خط مستقيم',
			body: (s) => `هنا تقع الفئة B في الوسط وتحيط بها الفئة A. أفضل خط مستقيم لا يصيب إلا **${pct(trainAcc(s))}**.

أحد الحلول هو **إضافة ميزة**. مع \`x₃ = x₁² + x₂²\` (مربع المسافة عن المركز)، تكون x₃ صغيرة لنقاط B وكبيرة لنقاط A، فتفصل بينها عتبة واحدة على x₃ (الشريط أدناه).

في ثلاثة أبعاد، بالمحاور (x₁, x₂, x₃)، تكون هذه العتبة مستوى مسطحًا: فاصلًا خطيًا. وعند إسقاطها على الرسم الثنائي الأبعاد الأصلي تصبح دائرة.`
		},
		{
			title: 'حيلة النواة',
			body: (s) => `ابتكار الميزات يدويًا لا يصلح على نطاق واسع. لكن مسألة تدريب SVM لا تستخدم النقاط إلا عبر **الجداءات الداخلية** \`xᵢ·xⱼ\`. استبدلها بـ**نواة** (kernel) \`K(xᵢ, xⱼ)\` فتحصل على SVM خطية في فضاء ميزات أغنى دون أن تحسب تلك الميزات أبدًا.

**نواة RBF** \`K(x, x′) = exp(−γ‖x − x′‖²)\` تقيس التشابه: 1 للنقاط المتطابقة، وتنخفض نحو 0 مع المسافة. فضاء ميزاتها لانهائي الأبعاد. تصبح دالة القرار مجموعًا من النتوءات المتمركزة على متجهات الدعم:

\`f(x) = Σ αᵢyᵢ·K(xᵢ, x) + b\`

RBF مع γ = ${s.gamma}: **${pct(trainAcc(s))}** إجابات صحيحة باستخدام **${nsv(s)}** متجه دعم.`
		},
		{
			title: 'γ: إلى أي مدى تصل كل نقطة',
			body: (s) => `يحدد **γ** عرض كل نتوء. مع γ صغيرة يؤثر كل متجه دعم في منطقة واسعة ويكون الحد أملس، شبه مستقيم. ومع γ كبيرة تصبح النتوءات صغيرة جدًا ويلتف الحد حول نقاط منفردة، بما في ذلك جُزر معزولة.

هذا هو [الإفراط في التخصيص](concept:overfitting-underfitting) (overfitting): أداء مثالي على نقاط التدريب وأسوأ على النقاط الجديدة. هذه الأهلّة مشوشة، لذا تختلط الفئتان حيث تلتقيان.

γ = **${s.gamma}**، C = ${s.C}: دقة التدريب **${pct(trainAcc(s))}**، والدقة على 400 نقطة جديدة **${pct(testAcc(s))}**، و${nsv(s)} متجه دعم.`,
			task: {
				prompt: `ادفع γ إلى أقصى قيمة وابحث عن الجُزر. ثم جد قيمة γ تحقق **${pct(TEST_TARGET)}** على الأقل على النقاط الجديدة.`
			}
		},
		{
			title: 'دورك: ساحة التجربة',
			body: `كل شيء مفتوح: اسحب النقاط، وبدّل النوى ومجموعات البيانات، واضبط C و γ.

خلاصة:

1. تختار SVM الحد ذا **الهامش الأعرض**، \`2/‖w‖\`.
2. **متجهات الدعم** وحدها تحدده؛ كل نقطة أخرى لها α = 0.
3. يوازن **C** بين شارع عريض ومخالفات الهامش (خسارة المفصلة).
4. **النوى** تعطي حدودًا منحنية دون حساب ميزات جديدة. و**γ** في RBF تحدد مدى كل نقطة: القيمة الكبيرة جدًا تفرط في التخصيص.
5. [وحّد مقاييس ميزاتك](concept:feature-scaling) أولًا، لأن الهوامش مسافات، واضبط C و γ معًا بـ[التحقق المتقاطع](concept:cross-validation).

يزداد زمن التدريب بسرعة مع عدد النقاط، ولا تُخرج SVM احتمالات افتراضيًا. أما [الانحدار اللوجستي](concept:logistic-regression) فيفعل.`
		}
	]
};

export default { fr, ar };
