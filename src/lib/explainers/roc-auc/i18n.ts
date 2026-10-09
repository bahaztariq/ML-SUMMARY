/**
 * French and Arabic narration for the ROC-AUC lesson (same step order as index.ts).
 */
import type { LessonText } from '../types.ts';
import { pct } from '../_classification/metrics.ts';
import { N_NEG, N_POS, aucOf, ratesOf, wins, type ROCState } from './state.ts';

const t2 = (v: number) => v.toFixed(2);
const a3 = (v: number) => v.toFixed(3);

export const fr: LessonText<ROCState> = {
	title: 'Courbes ROC et AUC',
	steps: [
		{
			title: 'Deux taux, un par ligne',
			body: (s) => {
				const { c, tpr, fpr } = ratesOf(s);
				return `Un modèle évalue **${N_POS + N_NEG} demandes de prêt** : ${N_POS} qui ont ensuite fait défaut (positives, ligne du haut) et ${N_NEG} qui ont été remboursées. Les demandes dont le score atteint ou dépasse le seuil sont signalées.

L’analyse ROC suit deux taux, chacun mesuré **au sein de sa propre ligne** :

- **Taux de vrais positifs** \`TPR = TP / (TP + FN)\` : part des défaillants signalés. ${c.tp} / ${N_POS} = **${pct(tpr)}**. (C’est la même chose que le rappel.)
- **Taux de faux positifs** \`FPR = FP / (FP + TN)\` : part des bons emprunteurs signalés à tort. ${c.fp} / ${N_NEG} = **${pct(fpr)}**.`;
			}
		},
		{
			title: 'Un seuil, un point',
			body: (s) => {
				const { tpr, fpr } = ratesOf(s);
				return `Placez ce couple comme un point : le FPR en abscisse, le TPR en ordonnée. Au seuil **${t2(s.thr)}**, le point se trouve en (${fpr.toFixed(2)}, ${tpr.toFixed(2)}).

Un bon point de fonctionnement est **en haut à gauche** : il attrape beaucoup de positifs tout en dérangeant peu de négatifs.`;
			},
			task: {
				prompt: 'Faites glisser le seuil et regardez le point bouger. Dans quel sens va-t-il quand vous **abaissez** le seuil ?'
			}
		},
		{
			title: 'Balayer le seuil : tracer la courbe',
			body: (s) => {
				const { c } = ratesOf(s);
				return `Balayez maintenant le seuil de 1 jusqu’à 0 en laissant une trace. Chaque fois qu’il dépasse un **défaillant**, la trace monte d’un cran **vers le haut** (TPR + 1/${N_POS}) ; chaque fois qu’il dépasse un **bon emprunteur**, elle avance **vers la droite** (FPR + 1/${N_NEG}).

Cette trace est la **courbe ROC** (*Receiver Operating Characteristic*) : tous les points de fonctionnement que le modèle peut offrir. Dépassés jusqu’ici : ${c.tp} défaillants, ${c.fp} bons emprunteurs.`;
			},
			task: {
				prompt: 'Appuyez sur **▶ Tracer** (ou faites glisser le seuil jusqu’à 0) pour dessiner toute la courbe.'
			}
		},
		{
			title: 'Lire le graphique',
			body: `Toute courbe ROC va de **(0, 0)**, un seuil au-dessus de tous les scores (rien n’est signalé), à **(1, 1)**, un seuil sous tous les scores (tout est signalé).

La **diagonale** en pointillés correspond à un modèle qui devine au hasard : il signale positifs et négatifs au même rythme. Plus la courbe s’incurve vers le **coin supérieur gauche**, mieux le modèle sépare les classes.`,
			quiz: {
				question: 'À quoi ressemble la courbe ROC d’un modèle parfait ?',
				options: [
					'La diagonale de (0, 0) à (1, 1)',
					'Tout droit le long du bord gauche jusqu’à (0, 1), puis le long du haut',
					'Le long du bas jusqu’à (1, 0), puis le long du bord droit',
					'Un seul point en (0.5, 0.5)'
				],
				explain: `Quand chaque positif a un score supérieur à celui de chaque négatif, abaisser le seuil fait passer **tous les positifs d’abord** : la courbe monte tout droit jusqu’à TPR = 1 avant que le FPR ne bouge, puis longe le haut. Un certain seuil donne 100% de TPR pour 0% de FPR.`
			}
		},
		{
			title: 'AUC : l’aire sous la courbe',
			body: (s) => {
				const a = aucOf(s);
				return `Pour résumer toute la courbe en un seul nombre, prenez l’**aire sous la courbe** : l’**AUC**. Un modèle parfait obtient 1.0, le hasard 0.5 (le triangle sous la diagonale).

Ce modèle : **AUC = ${a3(a)}**. Une règle empirique courante : au-dessus de 0.9 excellent, 0.8–0.9 bon, 0.7–0.8 passable, sous 0.7 médiocre. Notez que l’AUC juge le modèle **sur tous les seuils** : elle ne vous dit pas lequel déployer.`;
			}
		},
		{
			title: 'L’AUC est une probabilité de classement',
			body: (s) => {
				const w = wins(s);
				return `L’AUC a une signification étonnamment concrète : prenez un **défaillant au hasard** et un **bon emprunteur au hasard**. L’AUC est la probabilité que le modèle donne au défaillant le **score le plus élevé** (les égalités comptent pour moitié).

Chaque tirage relie la paire dans la bande : en vert si elle est bien classée, en rose sinon. ${s.pairs ? `Jusqu’ici, **${w} paires sur ${s.pairs}** sont bien classées = **${pct(w / s.pairs)}**, contre une AUC de **${pct(aucOf(s))}**.` : 'Tirez quelques paires.'}

Vérifier les ${N_POS} × ${N_NEG} = ${N_POS * N_NEG} paires donne exactement l’AUC (c’est la statistique U de Mann–Whitney, remise à l’échelle).`;
			},
			task: {
				prompt: 'Tirez au moins **500 paires** et regardez l’estimation cumulée se stabiliser sur l’AUC.'
			}
		},
		{
			title: 'La séparabilité détermine l’AUC',
			body: (s) => {
				const a = aucOf(s);
				return `L’AUC ne dépend que du degré de **chevauchement** des deux distributions de scores. Utilisez le curseur de **séparation** : à 0, les scores du modèle ne contiennent aucune information sur la classe, la courbe colle à la diagonale et AUC ≈ 0.5 ; écartez les classes et la courbe s’incurve vers le coin.

Séparation **${s.sep.toFixed(1)} σ** → AUC **${a3(a)}**.`;
			},
			task: {
				prompt: 'Trouvez une séparation avec **AUC ≤ 0.55** (pile ou face) et une avec **AUC ≥ 0.99** (quasi parfait).'
			}
		},
		{
			title: 'Seul le classement compte',
			body: `Trafiquons les scores : remplaçons chaque score par son **cube** (0.8 → 0.51, 0.5 → 0.13). Les probabilités changent beaucoup, et le seuil 0.5 signifie maintenant tout autre chose.`,
			quiz: {
				question: 'Qu’arrive-t-il à la courbe ROC et à l’AUC après avoir élevé chaque score au cube ?',
				options: [
					'L’AUC baisse : les scores sont devenus plus petits',
					'Rien : même courbe, même AUC',
					'L’AUC augmente : les classes semblent plus éloignées'
				],
				explain: (s) =>
					`Élever au cube ne change jamais lequel de deux scores est le plus grand : chaque paire est classée de la même façon et le balayage passe les points dans le même ordre. Courbe identique, AUC toujours égale à **${a3(aucOf(s))}**. Seules les *étiquettes* de seuil le long de la courbe ont bougé. L’AUC ne dit donc rien de la fiabilité des probabilités ; la [log-loss](concept:log-loss), si.`
			}
		},
		{
			title: 'À vous : bac à sable (playground)',
			body: `Tout est débloqué. Récapitulatif :

1. **TPR** = TP / tous les positifs, **FPR** = FP / tous les négatifs. Un seuil donne un point (FPR, TPR).
2. Balayer le seuil trace la **courbe ROC** de (0, 0) à (1, 1).
3. **AUC** = l’aire sous la courbe = la probabilité qu’un positif au hasard soit classé devant un négatif au hasard. 0.5 correspond au hasard, 1.0 à la perfection.
4. L’AUC ne s’intéresse qu’au **classement**, pas aux probabilités calibrées, ni au seuil que vous déployez.

Comme les deux taux sont normalisés au sein de chaque classe, la ROC peut paraître flatteuse quand les positifs sont très rares. La [courbe précision-rappel](concept:pr-curve) le révèle.`
		}
	]
};

export const ar: LessonText<ROCState> = {
	title: 'منحنيات ROC ومساحة AUC',
	steps: [
		{
			title: 'معدلان، واحد لكل مسار',
			body: (s) => {
				const { c, tpr, fpr } = ratesOf(s);
				return `يُقيِّم نموذج **${N_POS + N_NEG} طلب قرض**: ${N_POS} تعثّر أصحابها لاحقاً عن السداد (إيجابية، المسار العلوي) و${N_NEG} سُدِّدت. تُصنَّف الطلبات التي تساوي درجتها العتبة أو تتجاوزها.

يتتبع تحليل ROC معدلين، يُقاس كل منهما **داخل مساره الخاص**:

- **معدل الإيجابيات الصحيحة (true positive rate)** \`TPR = TP / (TP + FN)\`: نسبة المتعثّرين الذين صُنِّفوا. ${c.tp} / ${N_POS} = **${pct(tpr)}**. (وهو نفسه الاستدعاء.)
- **معدل الإيجابيات الخاطئة (false positive rate)** \`FPR = FP / (FP + TN)\`: نسبة المقترضين الجيدين الذين صُنِّفوا خطأً. ${c.fp} / ${N_NEG} = **${pct(fpr)}**.`;
			}
		},
		{
			title: 'عتبة واحدة، نقطة واحدة',
			body: (s) => {
				const { tpr, fpr } = ratesOf(s);
				return `ارسم هذا الزوج كنقطة: FPR على المحور الأفقي، وTPR على المحور العمودي. عند العتبة **${t2(s.thr)}** تقع النقطة عند (${fpr.toFixed(2)}, ${tpr.toFixed(2)}).

نقطة التشغيل الجيدة تكون **في الأعلى وإلى اليسار**: تلتقط كثيراً من الإيجابيات مع إزعاج قليل من السلبيات.`;
			},
			task: {
				prompt: 'اسحب العتبة وراقب النقطة وهي تتحرك. في أي اتجاه تذهب عندما **تخفض** العتبة؟'
			}
		},
		{
			title: 'امسح العتبة: ارسم المنحنى',
			body: (s) => {
				const { c } = ratesOf(s);
				return `امسح الآن العتبة من 1 نزولاً إلى 0 واترك أثراً. في كل مرة تتجاوز فيها **متعثّراً** يصعد الأثر خطوة **إلى الأعلى** (TPR + 1/${N_POS})؛ وفي كل مرة تتجاوز **مقترضاً جيداً** يتقدم خطوة **إلى اليمين** (FPR + 1/${N_NEG}).

هذا الأثر هو **منحنى ROC** (Receiver Operating Characteristic): جميع نقاط التشغيل التي يستطيع النموذج تقديمها. تجاوزنا حتى الآن: ${c.tp} متعثّراً، و${c.fp} مقترضاً جيداً.`;
			},
			task: {
				prompt: 'اضغط **▶ ارسم** (أو اسحب العتبة نزولاً إلى 0) لرسم المنحنى كاملاً.'
			}
		},
		{
			title: 'قراءة المخطط',
			body: `يمتد كل منحنى ROC من **(0, 0)**، أي عتبة فوق كل الدرجات (لا يُصنَّف شيء)، إلى **(1, 1)**، أي عتبة تحت كل الدرجات (يُصنَّف كل شيء).

**القطر** المتقطع يمثل نموذجاً يخمّن عشوائياً: يُصنِّف الإيجابيات والسلبيات بالمعدل نفسه. كلما انحنى المنحنى أكثر نحو **الزاوية العلوية اليسرى**، كان النموذج أفضل في الفصل بين الفئات.`,
			quiz: {
				question: 'كيف يبدو منحنى ROC لنموذج مثالي؟',
				options: [
					'القطر من (0, 0) إلى (1, 1)',
					'صعوداً مستقيماً على الحافة اليسرى حتى (0, 1)، ثم على طول الحافة العليا',
					'على طول الحافة السفلى حتى (1, 0)، ثم صعوداً على الحافة اليمنى',
					'نقطة واحدة عند (0.5, 0.5)'
				],
				explain: `حين تتفوق درجة كل إيجابي على درجة كل سلبي، فإن خفض العتبة يمرّ على **جميع الإيجابيات أولاً**: يصعد المنحنى مستقيماً حتى TPR = 1 قبل أن يتحرك FPR إطلاقاً، ثم يسير على طول الحافة العليا. ثمة عتبة تعطي TPR بنسبة 100% مع FPR بنسبة 0%.`
			}
		},
		{
			title: 'AUC: المساحة تحت المنحنى',
			body: (s) => {
				const a = aucOf(s);
				return `لتلخيص المنحنى كله في رقم واحد، خذ **المساحة تحته**: إنها **AUC** (Area Under the Curve). يحصل النموذج المثالي على 1.0، والتخمين العشوائي على 0.5 (المثلث تحت القطر).

هذا النموذج: **AUC = ${a3(a)}**. قاعدة تقريبية شائعة: فوق 0.9 ممتاز، و0.8–0.9 جيد، و0.7–0.8 مقبول، ودون 0.7 ضعيف. لاحظ أن AUC تحكم على النموذج **عبر جميع العتبات**: فهي لا تخبرك أي عتبة تعتمد عند النشر.`;
			}
		},
		{
			title: 'AUC احتمال ترتيب',
			body: (s) => {
				const w = wins(s);
				return `لـ AUC معنى ملموس على نحو مفاجئ: اختر **متعثّراً عشوائياً** و**مقترضاً جيداً عشوائياً**. AUC هي احتمال أن يعطي النموذج المتعثّر **الدرجة الأعلى** (التعادل يُحسب نصفاً).

كل سحب يربط الزوج في الشريط: بالأخضر إن كان الترتيب صحيحاً، وبالوردي إن لم يكن. ${s.pairs ? `حتى الآن رُتِّب **${w} من ${s.pairs}** زوجاً ترتيباً صحيحاً = **${pct(w / s.pairs)}**، مقابل AUC تساوي **${pct(aucOf(s))}**.` : 'اسحب بعض الأزواج.'}

فحص جميع الأزواج ${N_POS} × ${N_NEG} = ${N_POS * N_NEG} يعطي AUC بالضبط (إنها إحصائية U لمان–ويتني، بعد إعادة القياس).`;
			},
			task: {
				prompt: 'اسحب **500 زوج** على الأقل وراقب التقدير المتراكم وهو يستقر على AUC.'
			}
		},
		{
			title: 'قابلية الفصل تحدد AUC',
			body: (s) => {
				const a = aucOf(s);
				return `لا تعتمد AUC إلا على مدى **تداخل** توزيعي الدرجات. استخدم منزلق **الفصل**: عند 0 لا تحمل درجات النموذج أي معلومة عن الفئة، فيلتصق المنحنى بالقطر وتكون AUC ≈ 0.5؛ باعِد بين الفئات فينحني المنحنى نحو الزاوية.

الفصل **${s.sep.toFixed(1)} σ** → AUC **${a3(a)}**.`;
			},
			task: {
				prompt: 'جد فصلاً يعطي **AUC ≤ 0.55** (رمية عملة) وآخر يعطي **AUC ≥ 0.99** (شبه مثالي).'
			}
		},
		{
			title: 'الترتيب وحده هو المهم',
			body: `لنعبث بالدرجات: نستبدل كل درجة بـ**مكعّبها** (0.8 → 0.51، 0.5 → 0.13). تتغير الاحتمالات كثيراً، وصارت العتبة 0.5 تعني شيئاً مختلفاً تماماً.`,
			quiz: {
				question: 'ماذا يحدث لمنحنى ROC ولـ AUC بعد تكعيب كل درجة؟',
				options: [
					'تنخفض AUC: صارت الدرجات أصغر',
					'لا شيء: المنحنى نفسه، وAUC نفسها',
					'ترتفع AUC: تبدو الفئات أبعد عن بعضها'
				],
				explain: (s) =>
					`التكعيب لا يغيّر أبداً أيّ الدرجتين أكبر، فيُرتَّب كل زوج بالطريقة نفسها ويمرّ المسح على النقاط بالترتيب نفسه: منحنى مطابق، وAUC ما تزال **${a3(aucOf(s))}**. لم يتحرك سوى *تسميات* العتبات على طول المنحنى. إذن لا تقول AUC شيئاً عن مدى موثوقية الاحتمالات؛ أما [الخسارة اللوغاريتمية (log-loss)](concept:log-loss) فتقول.`
			}
		},
		{
			title: 'دورك: ساحة التجريب (playground)',
			body: `كل شيء متاح الآن. خلاصة:

1. **TPR** = TP / كل الإيجابيات، و**FPR** = FP / كل السلبيات. تعطي العتبة الواحدة نقطة واحدة (FPR, TPR).
2. مسح العتبة يرسم **منحنى ROC** من (0, 0) إلى (1, 1).
3. **AUC** = المساحة تحته = احتمال أن يتفوق إيجابي عشوائي على سلبي عشوائي. 0.5 عشوائي، و1.0 مثالي.
4. لا تهتم AUC إلا بـ**الترتيب**، لا بالاحتمالات المعايَرة، ولا بالعتبة التي تعتمدها.

لأن كلا المعدلين مُطبَّع داخل كل فئة، قد يبدو ROC متفائلاً أكثر من اللازم حين تكون الإيجابيات نادرة جداً. و[منحنى الضبط-الاستدعاء](concept:pr-curve) يكشف ذلك.`
		}
	]
};
