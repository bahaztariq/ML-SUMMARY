/**
 * French and Arabic narration for the logistic-regression lesson (same step order as index.ts).
 */
import type { LessonText } from '../types.ts';
import * as lr from './logistic.ts';
import { LR, accuracyOf, confusionOf, converged, data, lossOf, model, worstPoint, type LogState } from './state.ts';

const f2 = (v: number) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);
const sgn = (v: number) => (v < 0 ? `− ${f2(-v)}` : `+ ${f2(v)}`);
const pct = (v: number) => `${Math.round(v * 100)}%`;
const eq = (s: LogState) => `z = ${f2(s.model.w[0])}·x₁ ${sgn(s.model.w[1])}·x₂ ${sgn(s.model.b)}`;
const z = (s: LogState) => lr.score(model(s), s.probe);
const norm = (s: LogState) => Math.hypot(s.model.w[0], s.model.w[1]);
const TARGET = 0.8;

const fr: LessonText<LogState> = {
	title: 'Comment la régression logistique transforme une droite en probabilités',
	steps: [
		{
			title: 'Un score à partir d’une droite',
			body: (s) => `Voici **${data(s).X.length} points** décrits par deux variables, \`x₁\` et \`x₂\`, issus de deux classes : **A** (cercles) et **B** (carrés). On veut un modèle qui dise à quel point un nouveau point a de chances d’être **B**.

La régression logistique commence comme la [régression linéaire](concept:linear-regression) : elle calcule un **score**, somme pondérée des variables :

\`${eq(s)}\`

La droite pleine est l’endroit où **z = 0**. Du côté où pointe la flèche \`w\`, z est positif (penche vers B) ; de l’autre côté il est négatif (penche vers A). La sonde ◆ en (${f2(s.probe[0])}, ${f2(s.probe[1])}) a **z = ${f2(z(s))}**.`,
			task: { prompt: 'Faites glisser la sonde ◆ de l’autre côté de la droite et regardez le signe de **z** s’inverser.' }
		},
		{
			title: 'Écraser le score : la sigmoïde',
			body: (s) => {
				const zz = z(s);
				return `Un score peut valoir n’importe quel nombre, mais une probabilité doit rester entre 0 et 1. La fonction **sigmoïde** se charge de l’écrasement :

\`p = σ(z) = 1 / (1 + e^−z)\`

Un z très positif donne p proche de 1, un z très négatif donne p proche de 0. Le graphique ci-dessous place chaque point d’entraînement sur la courbe selon son score. Les carrés B devraient finir en haut, les cercles A en bas.

La sonde a z = ${f2(zz)}, donc **P(B) = σ(${f2(zz)}) = ${f2(lr.sigmoid(zz))}**.`;
			},
			quiz: {
				question: 'Quelle probabilité reçoit un point situé exactement sur la droite ?',
				options: ['0', '0.5', '1', 'Cela dépend des poids'],
				explain: `Sur la droite z = 0, et σ(0) = 1 / (1 + e⁰) = 1/2, quels que soient les poids. C’est pourquoi cette droite s’appelle la **frontière de décision** : c’est là que le modèle est parfaitement indécis. La sonde est maintenant posée dessus.`
			}
		},
		{
			title: 'Une probabilité pour chaque point du plan',
			body: (s) => `L’ombrage montre maintenant P(B) partout : plus la couleur est forte, plus le modèle est confiant. La droite pleine correspond à **p = 0.5** ; les droites en pointillés à p = 0.1, 0.25, 0.75 et 0.9.

Ce sont toutes des **droites parallèles**. p ne dépend que de z, et z reste constant le long de toute droite parallèle à la frontière. La confiance du modèle augmente donc avec la distance à la frontière, et seulement avec elle.

La sonde est à P(B) = **${f2(lr.sigmoid(z(s)))}**. Avec cette droite, ${pct(accuracyOf(s))} des points d’entraînement tombent du bon côté.`
		},
		{
			title: 'Les poids font tourner, le biais décale',
			body: (s) => `C’est vous l’algorithme d’entraînement. Trois nombres définissent le modèle :

- **w₁, w₂** fixent l’angle de la droite : elle est toujours perpendiculaire à la flèche \`w = (w₁, w₂)\`.
- **b** fait glisser la droite sans la faire tourner.
- La **longueur** ‖w‖ = ${f2(norm(s))} règle la raideur de la sigmoïde. Des poids plus grands resserrent les droites en pointillés : le modèle devient plus confiant.

\`${eq(s)}\`. Exactitude : **${pct(accuracyOf(s))}**.`,
			task: {
				prompt: `Utilisez les curseurs pour placer au moins **${pct(TARGET)}** des points du bon côté.`
			}
		},
		{
			title: 'Noter un ajustement : la log-loss',
			body: (s) => `L’exactitude ne compte que les bonnes et les mauvaises réponses. Pour entraîner, il faut un score qui tienne aussi compte de la **confiance**. La régression logistique utilise la [log-loss](concept:log-loss) : chaque point coûte **−log(probabilité donnée par le modèle à sa vraie classe)**.

\`loss = −[ y·log p + (1 − y)·log(1 − p) ]\`

Un point B avec p = 0.9 coûte 0.11 ; avec p = 0.5, il coûte 0.69. L’objectif d’entraînement est la moyenne sur tous les points. Pour cette droite, elle vaut **${f2(lossOf(s))}**.`,
			quiz: {
				question: 'Un point de classe B reçoit p(B) = 0.02. Par rapport à un point B à p(B) = 0.9, combien ajoute-t-il à la log-loss ?',
				options: ['À peu près autant : chaque point compte une fois', 'Environ 2 fois plus', 'Environ 37 fois plus'],
				explain: (s) => {
					const w = worstPoint(s);
					return `−ln 0.02 ≈ 3.9, alors que −ln 0.9 ≈ 0.105. La log-loss punit très durement les **erreurs commises avec assurance**, et le coût n’a pas de limite quand p → 0. Les anneaux montrent maintenant la perte de chaque point. Le pire point ne reçoit que p = ${f2(w.p)} pour sa vraie classe et coûte **${f2(w.loss)}**, soit ${pct(w.loss / (lossOf(s) * data(s).X.length))} du total à lui seul.`;
				}
			}
		},
		{
			title: 'Entraînement : descente de gradient sur la log-loss',
			body: (s) => {
				const state = converged(s)
					? `**Convergence après ${s.iter} pas** : log-loss ${f2(lossOf(s))}, exactitude ${pct(accuracyOf(s))}.`
					: s.iter
						? `Pas **${s.iter}** : log-loss **${f2(lossOf(s))}**.`
						: `On part d’une mauvaise droite, log-loss **${f2(lossOf(s))}**.`;
				return `La log-loss a un gradient remarquablement simple. Chaque point tire sur les poids selon son **erreur** \`p − y\` :

\`∂L/∂w = mean((p − y)·x)\`, \`∂L/∂b = mean(p − y)\`

La [descente de gradient](concept:what-is-gradient-descent) répète \`w ← w − η·∂L/∂w\` (ici η = ${LR}). La perte est convexe (en forme de bol) : il existe une seule meilleure droite, et la descente la trouve.

${state}`;
			},
			task: {
				prompt: 'Appuyez sur **Lancer** (ou plusieurs fois sur **Pas**) et regardez la droite pivoter jusqu’à sa place pendant que la perte diminue.'
			}
		},
		{
			title: 'Le seuil n’est pas la frontière',
			body: (s) => {
				const c = confusionOf(s);
				return `Le modèle renvoie une probabilité. Pour obtenir une réponse oui/non, on choisit un **seuil** t : on prédit B quand p ≥ t. Cela revient à z ≥ ln(t / (1 − t)) = **${f2(lr.logit(s.threshold))}** : déplacer t fait glisser la droite de décision parallèlement à elle-même. Les **poids ne changent pas** ; seule change la règle qui lit les probabilités.

À t = ${f2(s.threshold)} : **${c.tp}** B détectés, **${c.fn}** B manqués, **${c.fp}** fausses alertes, **${c.tn}** A correctement écartés. C’est ce compromis que mesurent la [précision et le rappel](concept:precision-recall-f1) et la [courbe ROC](concept:roc-auc).`;
			},
			task: {
				prompt: 'Supposons que la classe B soit une maladie : manquer un B coûte cher. Baissez le seuil jusqu’à ce qu’**aucun point B ne soit manqué**. Combien de fausses alertes cela coûte-t-il ?'
			}
		},
		{
			title: 'Régularisation : le bouton C',
			body: (s) => `Jusqu’ici, l’entraînement ne minimisait que la log-loss. Les implémentations réelles ajoutent une pénalité sur les grands poids. scikit-learn minimise

\`C · Σ log-loss + ½‖w‖²\`

**C** est l’*inverse* de la force de [régularisation](concept:regularization-l1-l2) : un petit C signifie une forte pénalité et de petits poids. Un grand C fait davantage confiance aux données ; sur des données parfaitement séparables, C → ∞ laisse les poids croître sans limite.

C = **${s.C}** donne ‖w‖ = **${f2(norm(s))}**, exactitude ${pct(accuracyOf(s))}, log-loss ${f2(lossOf(s))}.`,
			quiz: {
				question: 'Faites passer C de 1 à 0.01. Qu’arrive-t-il au modèle ?',
				options: [
					'La frontière pivote vers un angle très différent',
					'Les prédictions s’aplatissent vers 50 % : les droites en pointillés s’écartent fortement',
					'L’exactitude s’effondre vers 50 %'
				],
				explain: (s) =>
					`À C = 0.01, les poids rétrécissent jusqu’à ‖w‖ = ${f2(norm(s))} : chaque score est proche de 0 et chaque probabilité proche de 0.5. La frontière bouge à peine et l’exactitude reste de ${pct(accuracyOf(s))}, mais les probabilités sont désormais bien trop timides. C contrôle d’abord la **confiance**, et on le règle par [validation croisée](concept:cross-validation).`
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué. Essayez **Lunes** : une droite ne peut pas suivre la courbe. Pour cela, il faut [un SVM à noyau](concept:svm) ou les [k plus proches voisins](concept:knn).

Récapitulatif :

1. Score : \`z = w·x + b\`, une droite là où z = 0.
2. Probabilité : \`p = σ(z)\`, confiante loin de la droite, 50/50 dessus.
3. Entraînement : minimiser la **log-loss** moyenne par descente de gradient. Chaque point tire avec son erreur p − y.
4. Décision : prédire B quand p ≥ t. Le seuil échange des oublis contre des fausses alertes, sans réentraîner.
5. Régularisation : un petit C réduit les poids et aplatit les probabilités.

[Mettez vos variables à l’échelle](concept:feature-scaling) d’abord : la pénalité comme la descente de gradient traitent tous les poids de la même façon.`
		}
	]
};

const ar: LessonText<LogState> = {
	title: 'كيف يحوّل الانحدار اللوجستي خطًا مستقيمًا إلى احتمالات',
	steps: [
		{
			title: 'درجة من خط مستقيم',
			body: (s) => `إليك **${data(s).X.length} نقطة** بميزتين، \`x₁\` و\`x₂\`، من فئتين: **A** (دوائر) و**B** (مربعات). نريد نموذجًا يخبرنا بمدى احتمال أن تكون نقطة جديدة من الفئة **B**.

يبدأ الانحدار اللوجستي (logistic regression) مثل [الانحدار الخطي](concept:linear-regression): يحسب **درجة** (score) هي مجموع موزون للميزات:

\`${eq(s)}\`

الخط المتصل هو حيث **z = 0**. في الجهة التي يشير إليها السهم \`w\` تكون z موجبة (تميل إلى B)، وفي الجهة الأخرى سالبة (تميل إلى A). المسبار ◆ عند (${f2(s.probe[0])}, ${f2(s.probe[1])}) قيمته **z = ${f2(z(s))}**.`,
			task: { prompt: 'اسحب المسبار ◆ عبر الخط وراقب إشارة **z** وهي تنقلب.' }
		},
		{
			title: 'ضغط الدرجة: الدالة السينية',
			body: (s) => {
				const zz = z(s);
				return `يمكن أن تكون الدرجة أي عدد، لكن الاحتمال يجب أن يقع بين 0 و1. تتولى **الدالة السينية** (sigmoid) هذا الضغط:

\`p = σ(z) = 1 / (1 + e^−z)\`

قيمة z موجبة كبيرة تعطي p قريبة من 1، وقيمة سالبة كبيرة تعطي p قريبة من 0. يضع الرسم أدناه كل نقطة تدريب على المنحنى حسب درجتها. يُفترض أن تنتهي مربعات B في الأعلى ودوائر A في الأسفل.

قيمة المسبار z = ${f2(zz)}، إذن **P(B) = σ(${f2(zz)}) = ${f2(lr.sigmoid(zz))}**.`;
			},
			quiz: {
				question: 'ما الاحتمال الذي تحصل عليه نقطة تقع تمامًا على الخط؟',
				options: ['0', '0.5', '1', 'يعتمد على الأوزان'],
				explain: `على الخط z = 0، و σ(0) = 1 / (1 + e⁰) = 1/2 مهما كانت الأوزان. لهذا يسمى هذا الخط **حد القرار** (decision boundary): هنا يكون النموذج مترددًا تمامًا. المسبار الآن موضوع عليه.`
			}
		},
		{
			title: 'احتمال لكل موضع في المستوى',
			body: (s) => `يُظهر التظليل الآن P(B) في كل مكان: كلما اشتد اللون زادت الثقة. الخط المتصل هو **p = 0.5**، والخطوط المتقطعة هي p = 0.1 و0.25 و0.75 و0.9.

كلها **خطوط مستقيمة متوازية**. فـ p تعتمد على z وحدها، وz ثابتة على أي خط موازٍ للحد. لذا تزداد ثقة النموذج مع البعد عن الحد، ومع ذلك فقط.

المسبار عند P(B) = **${f2(lr.sigmoid(z(s)))}**. بهذا الخط تقع ${pct(accuracyOf(s))} من نقاط التدريب في الجهة الصحيحة.`
		},
		{
			title: 'الأوزان تُدير الخط، والانحياز يزيحه',
			body: (s) => `أنت الآن خوارزمية التدريب. ثلاثة أعداد تحدد النموذج:

- **w₁ وw₂** تحددان زاوية الخط: الخط دائمًا عمودي على السهم \`w = (w₁, w₂)\`.
- **b** (الانحياز) يزيح الخط دون أن يديره.
- **طول** المتجه ‖w‖ = ${f2(norm(s))} يحدد مدى انحدار الدالة السينية. الأوزان الأكبر تقرّب الخطوط المتقطعة من بعضها، فيصبح النموذج أكثر ثقة.

\`${eq(s)}\`. الدقة: **${pct(accuracyOf(s))}**.`,
			task: {
				prompt: `استخدم المنزلقات لتضع **${pct(TARGET)}** على الأقل من النقاط في الجهة الصحيحة.`
			}
		},
		{
			title: 'تقييم الملاءمة: الخسارة اللوغاريتمية',
			body: (s) => `الدقة تحسب الصواب والخطأ فقط. للتدريب نحتاج مقياسًا يهتم أيضًا بـ**الثقة**. يستخدم الانحدار اللوجستي [الخسارة اللوغاريتمية](concept:log-loss) (log-loss): كل نقطة تكلّف **−log(الاحتمال الذي أعطاه النموذج لفئتها الحقيقية)**.

\`loss = −[ y·log p + (1 − y)·log(1 − p) ]\`

نقطة B عند p = 0.9 تكلّف 0.11، وعند p = 0.5 تكلّف 0.69. هدف التدريب هو المتوسط على جميع النقاط. لهذا الخط يساوي **${f2(lossOf(s))}**.`,
			quiz: {
				question: 'نقطة من الفئة B حصلت على p(B) = 0.02. مقارنة بنقطة B عند p(B) = 0.9، كم تضيف إلى الخسارة اللوغاريتمية؟',
				options: ['تقريبًا نفس القدر: كل نقطة تُحسب مرة واحدة', 'نحو ضعفين', 'نحو 37 ضعفًا'],
				explain: (s) => {
					const w = worstPoint(s);
					return `−ln 0.02 ≈ 3.9، بينما −ln 0.9 ≈ 0.105. تعاقب الخسارة اللوغاريتمية **الأخطاء الواثقة** بشدة كبيرة، ولا حد أعلى للتكلفة عندما p → 0. تُظهر الحلقات الآن خسارة كل نقطة. أسوأ نقطة لا تحصل إلا على p = ${f2(w.p)} لفئتها الحقيقية وتكلّف **${f2(w.loss)}**، أي ${pct(w.loss / (lossOf(s) * data(s).X.length))} من المجموع وحدها.`;
				}
			}
		},
		{
			title: 'التدريب: الانحدار التدرجي على الخسارة اللوغاريتمية',
			body: (s) => {
				const state = converged(s)
					? `**تقارب بعد ${s.iter} خطوة**: الخسارة ${f2(lossOf(s))}، الدقة ${pct(accuracyOf(s))}.`
					: s.iter
						? `الخطوة **${s.iter}**: الخسارة **${f2(lossOf(s))}**.`
						: `نبدأ من خط سيئ، الخسارة **${f2(lossOf(s))}**.`;
				return `للخسارة اللوغاريتمية تدرّج بسيط على نحو لافت. كل نقطة تسحب الأوزان بمقدار **خطئها** \`p − y\`:

\`∂L/∂w = mean((p − y)·x)\`، \`∂L/∂b = mean(p − y)\`

يكرر [الانحدار التدرجي](concept:what-is-gradient-descent) (gradient descent) الخطوة \`w ← w − η·∂L/∂w\` (هنا η = ${LR}). الخسارة محدّبة (على شكل وعاء)، لذا يوجد خط أفضل واحد ويجده الانحدار.

${state}`;
			},
			task: {
				prompt: 'اضغط **تشغيل** (أو **خطوة** عدة مرات) وراقب الخط يدور إلى موضعه بينما تنخفض الخسارة.'
			}
		},
		{
			title: 'العتبة ليست هي الحد',
			body: (s) => {
				const c = confusionOf(s);
				return `يُخرج النموذج احتمالًا. للحصول على جواب نعم/لا تختار **عتبة** (threshold) t: نتنبأ بـ B عندما p ≥ t. وهذا يكافئ z ≥ ln(t / (1 − t)) = **${f2(lr.logit(s.threshold))}**، فتحريك t يزيح خط القرار موازيًا لنفسه. **الأوزان لا تتغير**؛ تتغير فقط القاعدة التي تقرأ الاحتمالات.

عند t = ${f2(s.threshold)}: **${c.tp}** من B مكتشفة، **${c.fn}** من B فائتة، **${c.fp}** إنذارات كاذبة، **${c.tn}** من A مستبعدة بشكل صحيح. هذه المقايضة هي ما تقيسه [الدقة والاستدعاء](concept:precision-recall-f1) و[منحنى ROC](concept:roc-auc).`;
			},
			task: {
				prompt: 'لنفترض أن الفئة B مرض، فتفويت B مكلف. اخفض العتبة حتى **لا تفوت أي نقطة B**. كم إنذارًا كاذبًا يكلّف ذلك؟'
			}
		},
		{
			title: 'التنظيم: مقبض C',
			body: (s) => `حتى الآن لم يقلّل التدريب إلا الخسارة اللوغاريتمية. التطبيقات الحقيقية تضيف عقوبة على الأوزان الكبيرة. تقلّل scikit-learn المقدار

\`C · Σ log-loss + ½‖w‖²\`

**C** هو *مقلوب* قوة [التنظيم](concept:regularization-l1-l2) (regularization): C صغير يعني عقوبة قوية وأوزانًا صغيرة. C كبير يثق بالبيانات أكثر؛ وعلى بيانات قابلة للفصل تمامًا، يسمح C → ∞ للأوزان بالنمو بلا حد.

C = **${s.C}** يعطي ‖w‖ = **${f2(norm(s))}**، الدقة ${pct(accuracyOf(s))}، الخسارة ${f2(lossOf(s))}.`,
			quiz: {
				question: 'اخفض C من 1 إلى 0.01. ماذا يحدث للنموذج؟',
				options: [
					'يدور الحد إلى زاوية مختلفة تمامًا',
					'تتسطح التنبؤات نحو 50%: تتباعد الخطوط المتقطعة كثيرًا',
					'تنهار الدقة إلى نحو 50%'
				],
				explain: (s) =>
					`عند C = 0.01 تنكمش الأوزان إلى ‖w‖ = ${f2(norm(s))}، فتصبح كل درجة قريبة من 0 وكل احتمال قريبًا من 0.5. بالكاد يتحرك الحد وتبقى الدقة ${pct(accuracyOf(s))}، لكن الاحتمالات أصبحت مترددة أكثر من اللازم. يتحكم C في **الثقة** أولًا، ويُضبط باستخدام [التحقق المتقاطع](concept:cross-validation).`
			}
		},
		{
			title: 'دورك: ساحة التجربة',
			body: `كل شيء مفتوح الآن. جرّب **الأهلّة**: لا يستطيع خط مستقيم أن يتبع المنحنى. لذلك تحتاج إلى [SVM بنواة](concept:svm) أو إلى [k-NN](concept:knn).

خلاصة:

1. الدرجة: \`z = w·x + b\`، وهي خط مستقيم حيث z = 0.
2. الاحتمال: \`p = σ(z)\`، واثق بعيدًا عن الخط، و50/50 عليه.
3. التدريب: تقليل متوسط **الخسارة اللوغاريتمية** بالانحدار التدرجي. كل نقطة تسحب بمقدار خطئها p − y.
4. القرار: نتنبأ بـ B عندما p ≥ t. تقايض العتبة الحالات الفائتة بالإنذارات الكاذبة دون إعادة تدريب.
5. التنظيم: C الصغير يقلّص الأوزان ويسطّح الاحتمالات.

[وحّد مقاييس ميزاتك](concept:feature-scaling) أولًا: فالعقوبة والانحدار التدرجي كلاهما يعاملان كل الأوزان بالطريقة نفسها.`
		}
	]
};

export default { fr, ar };
