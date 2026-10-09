/**
 * French and Arabic narration for the precision-recall curve lesson (same step order as index.ts).
 */
import type { LessonText } from '../types.ts';
import { fpr, pct, precision, recall } from '../_classification/metrics.ts';
import { N_POS, TARGET_PRECISION, apOf, aucOf, bestAtPrecision, countsOf, nNegOf, prevalenceOf, type PCState } from './state.ts';

const t2 = (v: number) => v.toFixed(2);
const a3 = (v: number) => v.toFixed(3);

export const fr: LessonText<PCState> = {
	title: 'Courbes précision-rappel et précision moyenne',
	steps: [
		{
			title: 'Un seuil, un point',
			body: (s) => {
				const c = countsOf(s);
				return `Un modèle antifraude évalue **${N_POS + nNegOf(s)} transactions par carte** : ${N_POS} frauduleuses (ligne du haut) et ${nNegOf(s)} légitimes. Cela fait ${pct(prevalenceOf(s), 0)} de fraude, bien plus que dans la réalité ; nous la rendrons plus rare plus tard.

Au seuil **${t2(s.thr)}**, le modèle signale ${c.tp + c.fp} transactions : [précision](concept:precision-recall-f1) **${pct(precision(c))}** (alertes qui sont de vraies fraudes), rappel **${pct(recall(c))}** (fraudes attrapées). Le graphique place ce couple comme un point : le rappel en abscisse, la précision en ordonnée.`;
			}
		},
		{
			title: 'Tracer la courbe PR',
			body: (s) => {
				const c = countsOf(s);
				return `Balayez le seuil de 1 jusqu’à 0. La courbe commence **en haut à gauche** : un seuil strict ne signale que les transactions les plus suspectes, qui sont presque toutes frauduleuses. À mesure qu’il se relâche, le rappel grimpe vers 1 et la précision chute, car de plus en plus de transactions légitimes sont signalées.

La ligne est en **dents de scie** : chaque fraude dépassée la pousse vers le haut et la droite, chaque transaction légitime fait chuter la précision. Dépassées jusqu’ici : ${c.tp} fraudes, ${c.fp} légitimes.`;
			},
			task: {
				prompt: 'Appuyez sur **▶ Tracer** (ou faites glisser le seuil jusqu’à 0) pour dessiner toute la courbe.'
			}
		},
		{
			title: 'La référence n’est pas 0.5',
			body: (s) =>
				`Au seuil 0, tout est signalé : le rappel vaut 100% et la précision est égale à la part de fraude, **${pct(prevalenceOf(s), 0)}**. La courbe se termine donc toujours en (1, ${prevalenceOf(s)}). La ligne pointillée marque ce niveau.`,
			quiz: {
				question: 'Un modèle inutile donne à chaque transaction un score aléatoire. Où se situe sa courbe PR ?',
				options: [
					'Sur la diagonale, comme une courbe ROC aléatoire',
					'À plat, à une précision de 0.5',
					'À peu près à plat, au niveau du taux de fraude (20%)',
					'À plat, à une précision de 0'
				],
				explain: (s) =>
					`Des scores aléatoires signalent fraudes et transactions légitimes en proportion, donc à **n’importe quel** seuil environ ${pct(prevalenceOf(s), 0)} des alertes sont des fraudes. La courbe oscille autour de la référence (elle est bruitée du côté strict, où seule une poignée de transactions est signalée), et sa précision moyenne vaut **${a3(apOf(s))}**, à peu près la prévalence. Une courbe ROC aléatoire donne une AUC de 0.5 quel que soit le rapport entre les classes ; une courbe PR aléatoire donne la prévalence. Indiquez toujours l’AP à côté de la prévalence.`
			}
		},
		{
			title: 'Précision moyenne',
			body: (s) => {
				const ap = apOf(s);
				return `Pour résumer la courbe en un seul nombre, additionnez la précision à chaque marche, pondérée par la progression du **rappel** à cette marche :

\`AP = Σₙ (Rₙ − Rₙ₋₁) · Pₙ\`

Chaque barre ombrée est un terme ; ensemble, elles approchent l’aire sous la courbe sans l’interpolation linéaire trop optimiste. Ce modèle : **AP = ${a3(ap)}**, pour une référence de ${a3(prevalenceOf(s))}. La fonction \`average_precision_score\` de scikit-learn calcule exactement cela.`;
			}
		},
		{
			title: 'Choisir un point de fonctionnement',
			body: (s) => {
				const c = countsOf(s);
				const b = bestAtPrecision(s);
				const p = precision(c);
				const ok = p >= TARGET_PRECISION;
				return `La courbe est aussi un menu. Supposons que l’équipe antifraude ne puisse traiter que des alertes **correctes à au moins ${pct(TARGET_PRECISION, 0)}** (la ligne pointillée) et veuille, dans cette limite, attraper le plus de fraudes possible.

Précision **${pct(p)}** ${ok ? '✓' : `(sous ${pct(TARGET_PRECISION, 0)})`}, rappel **${pct(recall(c))}**.${ok && recall(c) >= b.recall ? ' C’est le maximum de fraudes que vous pouvez attraper à cette précision.' : ''}`;
			},
			task: {
				prompt: `Obtenez une **précision ≥ ${pct(TARGET_PRECISION, 0)}** avec le **rappel le plus élevé** possible.`
			}
		},
		{
			title: 'Rendre la fraude rare',
			body: (s) => {
				const c = countsOf(s);
				return `La vraie fraude est bien plus rare. Le curseur **taux de fraude** garde les mêmes ${N_POS} fraudes et le même modèle, et ajoute des transactions légitimes. Observez les deux courbes.

Taux de fraude **${pct(prevalenceOf(s), 0)}** (${nNegOf(s)} légitimes) : ROC AUC **${a3(aucOf(s))}**, AP **${a3(apOf(s))}**. À ce seuil, le modèle déclenche **${c.fp}** fausses alertes.

La courbe ROC bouge à peine : elle divise les fausses alertes par le nombre de négatifs, donc ${c.fp} fausses alertes sur ${nNegOf(s)} ne font qu’un FPR de ${pct(fpr(c))}. La précision divise par le nombre d’*alertes*, elle ressent donc chaque fausse alerte supplémentaire.`;
			},
			task: {
				prompt: 'Faites descendre le **taux de fraude** à **2% ou moins**.'
			}
		},
		{
			title: 'La ROC flatteuse',
			body: (s) =>
				`La fraude ne représente plus que **1%** des ${N_POS + nNegOf(s)} transactions et la ROC AUC vaut toujours **${a3(aucOf(s))}**, un modèle « excellent » selon la règle empirique habituelle. L’équipe fixe le seuil pour attraper **80% des fraudes**.`,
			quiz: {
				question: 'Au seuil qui attrape 80% des fraudes, quelle part environ des transactions signalées sont réellement frauduleuses ?',
				options: ['Environ 95%, comme l’AUC', 'Environ 80%, comme le rappel', 'Bien moins de la moitié'],
				explain: (s) => {
					const c = countsOf(s);
					return `Il attrape ${c.tp} fraudes sur ${N_POS}, mais signale aussi **${c.fp}** transactions légitimes : un FPR de seulement ${pct(fpr(c))}, qui a l’air excellent sur le graphique ROC. La précision vaut ${c.tp} / ${c.tp + c.fp} = **${pct(precision(c))}** : environ ${Math.round((c.tp + c.fp) / Math.max(1, c.tp))} alertes par fraude réelle. L’AP (**${a3(apOf(s))}**) le révèle ; la ROC AUC le cache. Sur des [données très déséquilibrées](concept:class-imbalance), regardez la courbe PR.`;
				}
			}
		},
		{
			title: 'À vous : bac à sable (playground)',
			body: `Tout est débloqué. Récapitulatif :

1. Chaque seuil donne un point (rappel, précision) ; le balayer trace la **courbe PR** du coin supérieur gauche jusqu’à (1, prévalence).
2. Un modèle aléatoire se situe au niveau de la **prévalence**, pas à 0.5. Indiquez l’AP à côté.
3. La **précision moyenne** (AP) = Σ (Rₙ − Rₙ₋₁) · Pₙ résume la courbe.
4. Sur des positifs rares, la ROC reste flatteuse tandis que la PR montre le flot de fausses alertes. Utilisez la PR pour la fraude, la détection d’anomalies ([Isolation Forest](concept:isolation-forest)), les maladies rares et la recherche d’information.

Passez des scores à \`precision_recall_curve\`, jamais des prédictions binaires 0/1 : elles réduisent la courbe à un seul point.`
		}
	]
};

export const ar: LessonText<PCState> = {
	title: 'منحنيات الضبط-الاستدعاء ومتوسط الضبط',
	steps: [
		{
			title: 'عتبة واحدة، نقطة واحدة',
			body: (s) => {
				const c = countsOf(s);
				return `يُقيِّم نموذج لكشف الاحتيال **${N_POS + nNegOf(s)} معاملة بطاقة**: ${N_POS} احتيالية (المسار العلوي) و${nNegOf(s)} مشروعة. أي إن نسبة الاحتيال ${pct(prevalenceOf(s), 0)}، وهي أعلى بكثير من الواقع؛ سنجعله أندر لاحقاً.

عند العتبة **${t2(s.thr)}** يُصنِّف النموذج ${c.tp + c.fp} معاملة: [الضبط (precision)](concept:precision-recall-f1) **${pct(precision(c))}** (الإنذارات التي هي احتيال حقيقي)، والاستدعاء (recall) **${pct(recall(c))}** (الاحتيال الذي التُقط). يرسم المخطط هذا الزوج كنقطة واحدة: الاستدعاء على المحور الأفقي، والضبط على المحور العمودي.`;
			}
		},
		{
			title: 'ارسم منحنى PR',
			body: (s) => {
				const c = countsOf(s);
				return `امسح العتبة من 1 نزولاً إلى 0. يبدأ المنحنى **في أعلى اليسار**: العتبة الصارمة لا تُصنِّف إلا أكثر المعاملات إثارة للشك، وهي كلها تقريباً احتيال. ومع تساهلها يصعد الاستدعاء نحو 1 ويهبط الضبط، لأن معاملات مشروعة أكثر فأكثر تُصنَّف.

الخط **مسنَّن كالمنشار**: كل احتيال يُتجاوز يدفعه قليلاً إلى الأعلى واليمين، وكل معاملة مشروعة تُسقط الضبط. تجاوزنا حتى الآن: ${c.tp} احتيالاً، و${c.fp} معاملة مشروعة.`;
			},
			task: {
				prompt: 'اضغط **▶ ارسم** (أو اسحب العتبة نزولاً إلى 0) لرسم المنحنى كاملاً.'
			}
		},
		{
			title: 'خط الأساس ليس 0.5',
			body: (s) =>
				`عند العتبة 0 يُصنَّف كل شيء: الاستدعاء 100% والضبط يساوي نسبة الاحتيال، **${pct(prevalenceOf(s), 0)}**. لذا ينتهي المنحنى دائماً عند (1, ${prevalenceOf(s)}). يحدد الخط المتقطع هذا المستوى.`,
			quiz: {
				question: 'نموذج عديم الفائدة يعطي كل معاملة درجة عشوائية. أين يقع منحنى PR الخاص به؟',
				options: [
					'على القطر، مثل منحنى ROC عشوائي',
					'مسطّح عند ضبط 0.5',
					'مسطّح تقريباً عند معدل الاحتيال (20%)',
					'مسطّح عند ضبط 0'
				],
				explain: (s) =>
					`الدرجات العشوائية تُصنِّف الاحتيال والمعاملات المشروعة بالتناسب، فعند **أي** عتبة يكون نحو ${pct(prevalenceOf(s), 0)} من الإنذارات احتيالاً. يتذبذب المنحنى حول خط الأساس (ويكون مشوَّشاً عند الطرف الصارم، حيث لا يُصنَّف إلا عدد قليل من المعاملات)، ومتوسط ضبطه **${a3(apOf(s))}**، أي نحو نسبة الانتشار. منحنى ROC العشوائي يعطي AUC تساوي 0.5 مهما كانت نسبة الفئات؛ أما منحنى PR العشوائي فيعطي نسبة الانتشار. اذكر دائماً AP إلى جانب نسبة الانتشار.`
			}
		},
		{
			title: 'متوسط الضبط',
			body: (s) => {
				const ap = apOf(s);
				return `لتلخيص المنحنى في رقم واحد، اجمع الضبط عند كل درجة من درجات السلّم، مرجَّحاً بمقدار ازدياد **الاستدعاء** عندها:

\`AP = Σₙ (Rₙ − Rₙ₋₁) · Pₙ\`

كل عمود مظلَّل حدٌّ واحد؛ ومعاً تقارب المساحة تحت المنحنى دون الاستيفاء الخطي المتفائل. هذا النموذج: **AP = ${a3(ap)}** (متوسط الضبط، average precision)، مقابل خط أساس ${a3(prevalenceOf(s))}. والدالة \`average_precision_score\` في scikit-learn تحسب هذا بالضبط.`;
			}
		},
		{
			title: 'اختر نقطة تشغيل',
			body: (s) => {
				const c = countsOf(s);
				const b = bestAtPrecision(s);
				const p = precision(c);
				const ok = p >= TARGET_PRECISION;
				return `المنحنى أيضاً قائمة خيارات. لنفترض أن فريق مكافحة الاحتيال لا يستطيع التعامل إلا مع إنذارات **صحيحة بنسبة ${pct(TARGET_PRECISION, 0)} على الأقل** (الخط المتقطع)، ويريد ضمن هذا الحد التقاط أكبر قدر ممكن من الاحتيال.

الضبط **${pct(p)}** ${ok ? '✓' : `(دون ${pct(TARGET_PRECISION, 0)})`}، الاستدعاء **${pct(recall(c))}**.${ok && recall(c) >= b.recall ? ' هذا أكبر قدر من الاحتيال يمكنك التقاطه عند هذا الضبط.' : ''}`;
			},
			task: {
				prompt: `حقّق **ضبطاً ≥ ${pct(TARGET_PRECISION, 0)}** مع **أعلى استدعاء** ممكن.`
			}
		},
		{
			title: 'اجعل الاحتيال نادراً',
			body: (s) => {
				const c = countsOf(s);
				return `الاحتيال الحقيقي أندر بكثير. يُبقي منزلق **معدل الاحتيال** على حالات الاحتيال الـ ${N_POS} نفسها وعلى النموذج نفسه، ويضيف معاملات مشروعة. راقب المنحنيين.

معدل الاحتيال **${pct(prevalenceOf(s), 0)}** (${nNegOf(s)} معاملة مشروعة): ROC AUC **${a3(aucOf(s))}**، وAP **${a3(apOf(s))}**. عند هذه العتبة يُطلق النموذج **${c.fp}** إنذاراً كاذباً.

بالكاد يتحرك منحنى ROC: فهو يقسم الإنذارات الكاذبة على عدد السلبيات، لذا فإن ${c.fp} إنذاراً كاذباً من أصل ${nNegOf(s)} لا يمثل سوى FPR قدره ${pct(fpr(c))}. أما الضبط فيقسم على عدد *الإنذارات*، فيشعر بكل إنذار كاذب إضافي.`;
			},
			task: {
				prompt: 'اسحب **معدل الاحتيال** نزولاً إلى **2% أو أقل**.'
			}
		},
		{
			title: 'ROC المتفائل',
			body: (s) =>
				`صار الاحتيال الآن **1%** فقط من ${N_POS + nNegOf(s)} معاملة، وما تزال ROC AUC تساوي **${a3(aucOf(s))}**، أي نموذج «ممتاز» وفق القاعدة التقريبية المعتادة. يضبط الفريق العتبة لالتقاط **80% من الاحتيال**.`,
			quiz: {
				question: 'عند العتبة التي تلتقط 80% من الاحتيال، ما النسبة التقريبية من المعاملات المُصنَّفة التي هي احتيال فعلاً؟',
				options: ['نحو 95%، مثل AUC', 'نحو 80%، مثل الاستدعاء', 'أقل من النصف بكثير'],
				explain: (s) => {
					const c = countsOf(s);
					return `يلتقط ${c.tp} من ${N_POS} حالة احتيال، لكنه يُصنِّف أيضاً **${c.fp}** معاملة مشروعة: FPR قدره ${pct(fpr(c))} فقط، يبدو رائعاً على مخطط ROC. الضبط يساوي ${c.tp} / ${c.tp + c.fp} = **${pct(precision(c))}**: أي نحو ${Math.round((c.tp + c.fp) / Math.max(1, c.tp))} إنذارات لكل احتيال حقيقي. يكشف AP (**${a3(apOf(s))}**) ذلك؛ وتخفيه ROC AUC. مع [البيانات شديدة عدم التوازن](concept:class-imbalance)، انظر إلى منحنى PR.`;
				}
			}
		},
		{
			title: 'دورك: ساحة التجريب (playground)',
			body: `كل شيء متاح الآن. خلاصة:

1. تعطي كل عتبة نقطة (الاستدعاء، الضبط)؛ ومسحها يرسم **منحنى PR** من أعلى اليسار حتى (1، نسبة الانتشار).
2. النموذج العشوائي يقع عند **نسبة الانتشار (prevalence)**، لا عند 0.5. اذكر AP إلى جانبها.
3. **متوسط الضبط** = Σ (Rₙ − Rₙ₋₁) · Pₙ يلخّص المنحنى.
4. مع الإيجابيات النادرة يبقى ROC متفائلاً بينما يُظهر PR سيل الإنذارات الكاذبة. استخدم PR لكشف الاحتيال، وكشف الشذوذ ([Isolation Forest](concept:isolation-forest))، والأمراض النادرة، والبحث.

مرّر الدرجات إلى \`precision_recall_curve\`، لا التنبؤات الثنائية 0/1 أبداً: فهي تختزل المنحنى إلى نقطة واحدة.`
		}
	]
};
