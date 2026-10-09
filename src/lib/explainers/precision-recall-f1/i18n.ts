/**
 * French and Arabic narration for the precision / recall / F1 lesson (same step order as index.ts).
 */
import type { LessonText } from '../types.ts';
import { arithmeticMean, fbeta, harmonicMean, pct, precision, recall } from '../_classification/metrics.ts';
import { N_NEG, N_POS, TARGET_RECALL, bestAtTarget, bestF, countsOf, type PRState } from './state.ts';

const t2 = (v: number) => v.toFixed(2);
const defectRate = Math.round((N_POS / (N_POS + N_NEG)) * 100);

export const fr: LessonText<PRState> = {
	title: 'Précision, rappel et l’équilibre du F1',
	steps: [
		{
			title: 'Deux questions sur un « oui »',
			body: (s) => {
				const c = countsOf(s);
				return `Une caméra sur une chaîne de montage évalue **${N_POS + N_NEG} pièces** ; **${N_POS}** d’entre elles sont réellement défectueuses (ligne du haut). Les pièces dont le score atteint ou dépasse le seuil sont retirées de la chaîne.

Au seuil **${t2(s.thr)}**, le modèle retire **${c.tp + c.fp}** pièces. Deux questions différentes jugent cette décision :

- Parmi les pièces retirées, combien étaient vraiment défectueuses ? C’est la **précision**.
- Parmi les pièces défectueuses, combien en avons-nous retiré ? C’est le **rappel**.`;
			}
		},
		{
			title: 'Précision : peut-on se fier à une alerte ?',
			body: (s) => {
				const c = countsOf(s);
				return `La précision ne regarde que la colonne des **prédits positifs**, les pièces à droite de la ligne :

\`precision = TP / (TP + FP)\` = ${c.tp} / (${c.tp} + ${c.fp}) = **${pct(precision(c))}**

Une précision faible signifie beaucoup de **fausses alertes** : les ouvriers perdent du temps à inspecter de bonnes pièces. La précision ignore les pièces défectueuses qui sont passées entre les mailles.`;
			}
		},
		{
			title: 'Rappel : combien en avez-vous attrapé ?',
			body: (s) => {
				const c = countsOf(s);
				return `Le rappel ne regarde que la ligne des **réellement positifs**, la ligne du haut :

\`recall = TP / (TP + FN)\` = ${c.tp} / (${c.tp} + ${c.fn}) = **${pct(recall(c))}**

Un rappel faible signifie des **cas manqués** : des pièces défectueuses expédiées aux clients. Le rappel ignore combien de bonnes pièces ont été retirées par erreur. On l’appelle aussi *sensibilité* ou *taux de vrais positifs*.`;
			}
		},
		{
			title: 'Le compromis',
			body: (s) => {
				const c = countsOf(s);
				return `Abaisser le seuil retire plus de pièces : le rappel ne peut qu’**augmenter**, mais davantage de bonnes pièces sont aussi retirées, donc la précision **baisse** généralement. Relever le seuil fait l’inverse. Le graphique suit les deux à mesure que le seuil bouge.

Maintenant : précision **${pct(precision(c))}**, rappel **${pct(recall(c))}**. La ligne de la précision est irrégulière : chaque bonne pièce qui franchit la ligne la fait baisser un peu.`;
			},
			task: {
				prompt: 'Faites glisser le seuil aux deux extrémités : **sous 0.10** et **au-dessus de 0.90**. Quelle métrique souffre à chaque extrémité ?'
			}
		},
		{
			title: 'Signaler presque tout',
			body: `Un responsable nerveux déclare : « Ne jamais expédier un défaut. Retirez toute pièce dont le score dépasse 0.02. » Le rappel sera proche de 100%.`,
			quiz: {
				question: 'Qu’arrive-t-il à la précision au seuil 0.02 ?',
				options: [
					'Elle reste élevée, car le modèle est toujours le même',
					`Elle tombe à environ ${defectRate}%, la part des pièces défectueuses`,
					'Elle tombe à 0%',
					'Elle n’est pas définie'
				],
				explain: (s) => {
					const c = countsOf(s);
					return `Retirer presque toutes les pièces attrape les ${c.tp} défectueuses (rappel **${pct(recall(c))}**), mais aussi ${c.fp} bonnes. La précision vaut ${c.tp} / ${c.tp + c.fp} = **${pct(precision(c))}** : à peine mieux que de choisir des pièces au hasard, ce qui donnerait le taux de défauts, ${pct(N_POS / (N_POS + N_NEG))}. Chaque métrique prise seule est facile à tromper.`;
				}
			}
		},
		{
			title: 'Un seul nombre : pourquoi ne pas simplement faire la moyenne ?',
			body: (s) => {
				const c = countsOf(s);
				const p = precision(c);
				const r = recall(c);
				return `Pour classer des modèles, on veut un score unique qui n’est élevé que si les **deux** le sont. Le choix évident, la moyenne (P + R) / 2, échoue à ce test.

Le **F1** utilise à la place la **moyenne harmonique** : \`F1 = 2·P·R / (P + R)\`. Elle est tirée vers la *plus petite* des deux valeurs. Ici : moyenne arithmétique **${pct(arithmeticMean(p, r))}**, F1 **${pct(harmonicMean(p, r))}**.`;
			},
			quiz: {
				question: 'Un modèle paresseux ne retire que la pièce la plus suspecte, et elle est défectueuse : précision 100%, rappel 2.5%. Quel est son F1 ?',
				options: ['Environ 51%, la moyenne', 'Environ 5%', 'Exactement 2.5%', '100%'],
				explain: (s) => {
					const c = countsOf(s);
					const p = precision(c);
					const r = recall(c);
					return `F1 = 2 × ${p.toFixed(2)} × ${r.toFixed(3)} / (${p.toFixed(2)} + ${r.toFixed(3)}) = **${pct(harmonicMean(p, r))}**. La moyenne dirait **${pct(arithmeticMean(p, r))}**, comme si ce modèle était à moitié correct. La moyenne harmonique reste près du score le plus faible (un peu au-dessus), si bien qu’aucune métrique ne peut porter l’autre.`;
				}
			}
		},
		{
			title: 'Le F1 selon le seuil',
			body: (s) => {
				const c = countsOf(s);
				const b = bestF(1);
				const at = fbeta(c, 1);
				return `La ligne verte est le F1 à chaque seuil. Il est faible aux deux extrémités, là où la précision ou le rappel s’effondre, et culmine là où les deux sont équilibrés.

Maintenant : F1 **${pct(at)}** au seuil ${t2(s.thr)}. ${at >= b.f - 0.005 ? `C’est le sommet : **${pct(b.f)}**.` : ''}`;
			},
			task: {
				prompt: 'Trouvez le seuil qui **maximise le F1** (faites glisser la ligne, ou cliquez sur le graphique).'
			}
		},
		{
			title: 'Atteindre un objectif de rappel',
			body: (s) => {
				const c = countsOf(s);
				const r = recall(c);
				const ok = r >= TARGET_RECALL;
				const b = bestAtTarget();
				return `Les vrais projets maximisent rarement le F1. Ils fixent une **exigence** : « attraper au moins ${pct(TARGET_RECALL, 0)} des défauts » (la ligne pointillée), puis veulent la **meilleure précision** qui la respecte encore.

Rappel **${pct(r)}** ${ok ? '✓' : `(sous ${pct(TARGET_RECALL, 0)})`}, précision **${pct(precision(c))}**.${ok && precision(c) >= b.precision - 1e-9 ? ` C’est le meilleur résultat possible ici : abaissez encore le seuil et vous n’ajouterez que des fausses alertes.` : ''}

Réglez cela sur un jeu de validation, jamais sur le jeu de test.`;
			},
			task: {
				prompt: `Atteignez un **rappel ≥ ${pct(TARGET_RECALL, 0)}** avec la **précision la plus haute** possible.`
			}
		},
		{
			title: 'F-bêta : quand une erreur compte plus',
			body: (s) => {
				const b = bestF(s.beta);
				return `Le F1 traite précision et rappel comme également importants. Le **F-bêta** fait compter le rappel **β fois** plus :

\`Fβ = (1 + β²)·P·R / (β²·P + R)\`

β = 2 convient au dépistage, où un cas manqué est pire ; β = 0.5 convient à un filtre anti-spam, où une fausse alerte est pire. Avec β = **${s.beta}**, le meilleur seuil est **${t2(b.thr)}** (Fβ = ${pct(b.f)}).`;
			},
			task: {
				prompt: 'Passez **β** à 2 puis à 0.5. Dans quel sens le meilleur seuil se déplace-t-il à chaque fois ?'
			}
		},
		{
			title: 'À vous : bac à sable (playground)',
			body: `Tout est débloqué. Récapitulatif :

1. **Précision** = TP / (TP + FP) : à quel point une prédiction positive est fiable.
2. **Rappel** = TP / (TP + FN) : combien de vrais positifs vous attrapez.
3. Déplacer le seuil échange l’un contre l’autre ; un meilleur modèle déplace tout le compromis.
4. Le **F1** est leur moyenne harmonique, il n’est donc élevé que si les deux le sont ; le **Fβ** le fait pencher vers le rappel (β > 1) ou la précision (β < 1).

Aucune des deux métriques n’utilise les vrais négatifs. Pour comparer des modèles sur *tous* les seuils, voyez la [courbe PR](concept:pr-curve) et le [ROC-AUC](concept:roc-auc). Le Metrics Lab (dans Outils) calcule tout cela à partir de quatre effectifs quelconques.`
		}
	]
};

export const ar: LessonText<PRState> = {
	title: 'الضبط والاستدعاء وتوازن F1',
	steps: [
		{
			title: 'سؤالان حول «نعم»',
			body: (s) => {
				const c = countsOf(s);
				return `تُقيِّم كاميرا على خط تجميع **${N_POS + N_NEG} قطعة**؛ منها **${N_POS}** معيبة فعلاً (المسار العلوي). تُسحب من الخط القطع التي تساوي درجتها العتبة أو تتجاوزها.

عند العتبة **${t2(s.thr)}** يسحب النموذج **${c.tp + c.fp}** قطعة. يحكم على هذا القرار سؤالان مختلفان:

- من بين القطع التي سحبناها، كم منها كان معيباً حقاً؟ هذا هو **الضبط (precision)**.
- من بين القطع المعيبة، كم منها سحبنا؟ هذا هو **الاستدعاء (recall)**.`;
			}
		},
		{
			title: 'الضبط: هل يمكن الوثوق بالإنذار؟',
			body: (s) => {
				const c = countsOf(s);
				return `لا ينظر الضبط إلا إلى عمود **التنبؤات الإيجابية**، أي القطع الواقعة يمين الخط:

\`precision = TP / (TP + FP)\` = ${c.tp} / (${c.tp} + ${c.fp}) = **${pct(precision(c))}**

الضبط المنخفض يعني كثيراً من **الإنذارات الكاذبة**: يضيّع العمال وقتهم في فحص قطع سليمة. والضبط يتجاهل القطع المعيبة التي أفلتت.`;
			}
		},
		{
			title: 'الاستدعاء: كم حالة التقطت؟',
			body: (s) => {
				const c = countsOf(s);
				return `لا ينظر الاستدعاء إلا إلى صف **الإيجابيات الفعلية**، أي المسار العلوي:

\`recall = TP / (TP + FN)\` = ${c.tp} / (${c.tp} + ${c.fn}) = **${pct(recall(c))}**

الاستدعاء المنخفض يعني **حالات فائتة**: قطعاً معيبة تُشحن إلى الزبائن. والاستدعاء يتجاهل عدد القطع السليمة التي سحبناها خطأً. ويُسمّى أيضاً *الحساسية (sensitivity)* أو *معدل الإيجابيات الصحيحة*.`;
			}
		},
		{
			title: 'المفاضلة',
			body: (s) => {
				const c = countsOf(s);
				return `خفض العتبة يسحب قطعاً أكثر: لا يمكن للاستدعاء إلا أن **يرتفع**، لكن تُسحب معها قطع سليمة أكثر، فـ**ينخفض** الضبط عادةً. ورفع العتبة يفعل العكس. يتتبع المخطط الاثنين مع تحرك العتبة.

الآن: الضبط **${pct(precision(c))}**، الاستدعاء **${pct(recall(c))}**. خط الضبط متعرج: كل قطعة سليمة تعبر الخط تُنزله قليلاً.`;
			},
			task: {
				prompt: 'اسحب العتبة إلى الطرفين: **دون 0.10** و**فوق 0.90**. أي مقياس يتضرر عند كل طرف؟'
			}
		},
		{
			title: 'صنِّف كل شيء تقريباً',
			body: `يقول مدير متوتر: «لا تشحنوا أي قطعة معيبة أبداً. اسحبوا كل قطعة تتجاوز درجتها 0.02». سيقترب الاستدعاء من 100%.`,
			quiz: {
				question: 'ماذا يحدث للضبط عند العتبة 0.02؟',
				options: [
					'يبقى مرتفعاً، لأن النموذج لم يتغير',
					`ينخفض إلى نحو ${defectRate}%، وهي نسبة القطع المعيبة`,
					'ينخفض إلى 0%',
					'يصبح غير معرَّف'
				],
				explain: (s) => {
					const c = countsOf(s);
					return `سحب كل القطع تقريباً يلتقط جميع القطع المعيبة الـ ${c.tp} (الاستدعاء **${pct(recall(c))}**)، لكنه يلتقط أيضاً ${c.fp} قطعة سليمة. الضبط يساوي ${c.tp} / ${c.tp + c.fp} = **${pct(precision(c))}**: أفضل بقليل فقط من اختيار القطع عشوائياً، الذي يعطي معدل العيوب ${pct(N_POS / (N_POS + N_NEG))}. كل مقياس بمفرده سهل التلاعب به.`;
				}
			}
		},
		{
			title: 'رقم واحد: لماذا لا نأخذ المتوسط ببساطة؟',
			body: (s) => {
				const c = countsOf(s);
				const p = precision(c);
				const r = recall(c);
				return `لترتيب النماذج نريد درجة واحدة لا ترتفع إلا إذا ارتفع **كلاهما**. الخيار البديهي، أي المتوسط (P + R) / 2، يفشل في هذا الاختبار.

يستخدم **F1** بدلاً منه **المتوسط التوافقي (harmonic mean)**: \`F1 = 2·P·R / (P + R)\`. وهو يميل نحو *الأصغر* بين القيمتين. هنا: المتوسط الحسابي **${pct(arithmeticMean(p, r))}**، وF1 **${pct(harmonicMean(p, r))}**.`;
			},
			quiz: {
				question: 'نموذج كسول لا يسحب سوى القطعة الأكثر إثارة للشك، وهي معيبة: الضبط 100%، والاستدعاء 2.5%. كم يبلغ F1؟',
				options: ['نحو 51%، أي المتوسط', 'نحو 5%', '2.5% بالضبط', '100%'],
				explain: (s) => {
					const c = countsOf(s);
					const p = precision(c);
					const r = recall(c);
					return `F1 = 2 × ${p.toFixed(2)} × ${r.toFixed(3)} / (${p.toFixed(2)} + ${r.toFixed(3)}) = **${pct(harmonicMean(p, r))}**. أما المتوسط فسيقول **${pct(arithmeticMean(p, r))}**، كأن هذا النموذج مقبول نصفياً. يبقى المتوسط التوافقي قريباً من الدرجة الأضعف (أعلى منها بقليل)، فلا يستطيع أحد المقياسين أن يحمل الآخر.`;
				}
			}
		},
		{
			title: 'F1 عبر العتبات',
			body: (s) => {
				const c = countsOf(s);
				const b = bestF(1);
				const at = fbeta(c, 1);
				return `الخط الأخضر هو F1 عند كل عتبة. يكون منخفضاً عند الطرفين، حيث ينهار الضبط أو الاستدعاء، ويبلغ ذروته حيث يتوازنان.

الآن: F1 **${pct(at)}** عند العتبة ${t2(s.thr)}. ${at >= b.f - 0.005 ? `هذه هي الذروة: **${pct(b.f)}**.` : ''}`;
			},
			task: {
				prompt: 'جد العتبة التي **تُعظِّم F1** (اسحب الخط، أو انقر على المخطط).'
			}
		},
		{
			title: 'بلوغ هدف للاستدعاء',
			body: (s) => {
				const c = countsOf(s);
				const r = recall(c);
				const ok = r >= TARGET_RECALL;
				const b = bestAtTarget();
				return `نادراً ما تسعى المشاريع الحقيقية إلى تعظيم F1. بل تضع **شرطاً**: «التقاط ${pct(TARGET_RECALL, 0)} على الأقل من العيوب» (الخط المتقطع)، ثم تريد **أفضل ضبط** يحقق ذلك الشرط.

الاستدعاء **${pct(r)}** ${ok ? '✓' : `(دون ${pct(TARGET_RECALL, 0)})`}، الضبط **${pct(precision(c))}**.${ok && precision(c) >= b.precision - 1e-9 ? ` هذا أفضل ما يمكن هنا: إن خفضت العتبة أكثر فلن تضيف سوى إنذارات كاذبة.` : ''}

اضبط ذلك على مجموعة تحقق (validation set)، وليس على مجموعة الاختبار أبداً.`;
			},
			task: {
				prompt: `حقّق **استدعاءً ≥ ${pct(TARGET_RECALL, 0)}** مع **أعلى ضبط** ممكن.`
			}
		},
		{
			title: 'F-beta: حين يكون أحد الخطأين أهم',
			body: (s) => {
				const b = bestF(s.beta);
				return `يعامل F1 الضبط والاستدعاء على أنهما متساويان في الأهمية. أما **F-beta** فيجعل للاستدعاء وزناً **أكبر بـ β مرة**:

\`Fβ = (1 + β²)·P·R / (β²·P + R)\`

تناسب β = 2 الفحص الطبي، حيث تفويت حالة أسوأ؛ وتناسب β = 0.5 مرشّح البريد المزعج، حيث الإنذار الكاذب أسوأ. مع β = **${s.beta}** تكون أفضل عتبة **${t2(b.thr)}** (Fβ = ${pct(b.f)}).`;
			},
			task: {
				prompt: 'غيّر **β** إلى 2 ثم إلى 0.5. في أي اتجاه تتحرك أفضل عتبة في كل مرة؟'
			}
		},
		{
			title: 'دورك: ساحة التجريب (playground)',
			body: `كل شيء متاح الآن. خلاصة:

1. **الضبط** = TP / (TP + FP): مدى موثوقية التنبؤ الإيجابي.
2. **الاستدعاء** = TP / (TP + FN): كم من الإيجابيات الحقيقية تلتقط.
3. تحريك العتبة يبادل أحدهما بالآخر؛ والنموذج الأفضل يُزيح المفاضلة بأكملها.
4. **F1** هو متوسطهما التوافقي، فلا يرتفع إلا إذا ارتفع كلاهما؛ و**Fβ** يُميله نحو الاستدعاء (β > 1) أو الضبط (β < 1).

لا يستخدم أي من المقياسين السلبيات الصحيحة. لمقارنة النماذج عبر *جميع* العتبات، راجع [منحنى PR](concept:pr-curve) و[ROC-AUC](concept:roc-auc). ويحسب مختبر المقاييس (Metrics Lab، ضمن الأدوات) كل هذا من أي أربعة أعداد.`
		}
	]
};
