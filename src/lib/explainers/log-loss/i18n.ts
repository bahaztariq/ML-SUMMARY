/**
 * French and Arabic narration for the log-loss lesson (same step order as index.ts).
 */
import type { LessonText } from '../types.ts';
import { pct, penalty } from '../_classification/metrics.ts';
import { N, OVER, accOf, bestConf, binsOf, lossAt, lossOf, worstShare, type LLState } from './state.ts';

const f2 = (v: number) => v.toFixed(2);
const f3 = (v: number) => v.toFixed(3);

export const fr: LessonText<LLState> = {
	title: 'La log-loss : le prix des erreurs confiantes',
	steps: [
		{
			title: 'Des prévisions, pas seulement des étiquettes',
			body: (s) =>
				`Un modèle météo prévoit la **probabilité de pluie** pour ${2 * N} jours. La ligne du haut contient les ${N} jours où il a réellement plu, celle du bas les ${N} jours secs. Chaque point se place à la probabilité que le modèle a donnée à la pluie.

Annoncez « pluie » dès que la prévision atteint au moins 50% et le modèle a raison **${pct(accOf(s), 0)}** des jours. Mais l’exactitude ne distingue pas un 95% confiant d’un 51% hésitant. La **log-loss** (perte logarithmique, ou entropie croisée binaire) note la probabilité elle-même.`
		},
		{
			title: 'La pénalité : −log(p)',
			body: (s) => `Pour chaque jour, regardez la probabilité que le modèle a donnée à **ce qui s’est réellement produit**, appelons-la *p* : la prévision elle-même un jour de pluie, 1 − prévision un jour sec. La pénalité vaut

\`penalty = −log(p)\` (logarithme népérien)

- p = 1 : pénalité 0, une prévision parfaite et certaine.
- p = 0.5 : pénalité 0.69, un haussement d’épaules.
- p = 0.1 : pénalité 2.30.
- p → 0 : pénalité → ∞.

Votre sonde : p = **${f3(s.p)}** → pénalité **${f2(penalty(s.p))}**.`,
			task: {
				prompt: 'Faites glisser la sonde (ou le curseur) jusqu’à ce que la pénalité dépasse **4**. À quel point le modèle doit-il être sûr de la mauvaise réponse ?'
			}
		},
		{
			title: 'Confiant et dans l’erreur',
			body: `Deux prévisionnistes ont tous deux annoncé de la pluie, et il a fait sec. L’un a dit **60%**, il a donc donné 0.40 à ce qui s’est produit. L’autre a dit **99%**, ne donnant que 0.01 à ce qui s’est produit.`,
			quiz: {
				question: 'De combien la pénalité du prévisionniste à 99% est-elle plus grande ?',
				options: ['Environ 1.6×', 'Environ 5×', 'Environ 50×'],
				explain: `−log(0.01) = **4.61** contre −log(0.40) = **0.92** : cinq fois plus. Le logarithme croît lentement au début, puis sans limite : à p = 0.0001 la pénalité vaut 9.2, et une prévision d’exactement 0 coûterait l’infini. C’est pourquoi les bibliothèques bornent les probabilités à [10⁻¹⁵, 1 − 10⁻¹⁵].`
			}
		},
		{
			title: 'La log-loss est la pénalité moyenne',
			body: (s) => `Notez chaque jour et faites la moyenne :

\`LogLoss = −(1/n) Σ [ yᵢ·log(ŷᵢ) + (1 − yᵢ)·log(1 − ŷᵢ) ]\`

où ŷᵢ est la prévision et yᵢ vaut 1 les jours de pluie. Un seul terme est actif par jour, c’est donc la moyenne de −log(p). Plus c’est bas, mieux c’est ; 0 est parfait.

Chaque jour se trouve maintenant sur la courbe de pénalité et, dans la bande, **les plus gros points coûtent le plus** (rose = prévision du mauvais côté de 50%). Ce modèle : log-loss **${f3(lossOf(s))}**. Les 10 pires jours causent **${pct(worstShare(s), 0)}** du total.`
		},
		{
			title: 'Augmenter la confiance',
			body: (s) => {
				const best = bestConf();
				return `Le curseur de **confiance** multiplie les log-odds de chaque prévision par le même facteur. Au-dessus de ×1, les prévisions sont poussées vers 0% et 100% ; en dessous de ×1, elles sont ramenées vers 50%. Aucune prévision ne franchit jamais 50%, donc **l’exactitude reste à ${pct(accOf(s), 0)}** quoi que vous fassiez.

Confiance **×${s.conf.toFixed(1)}** → log-loss **${f3(lossOf(s))}**.${Math.abs(lossOf(s) - best[1]) < 0.002 ? ` C’est le minimum : les prévisions sont aussi sûres que les données le permettent.` : ''}`;
			},
			task: {
				prompt: 'Trouvez la confiance donnant la **log-loss la plus basse** (utilisez le curseur ou cliquez sur le graphique).'
			}
		},
		{
			title: 'Même exactitude, log-loss différente',
			body: (s) =>
				`Comparez deux modèles qui prennent **exactement les mêmes décisions** (tous deux exacts à ${pct(accOf(s), 0)}). Le modèle A prévoit comme celui-ci (confiance ×1). Le modèle B étire tout ×${OVER} : la plupart de ses prévisions sont sous 10% ou au-dessus de 90%.`,
			quiz: {
				question: 'Quel modèle a la log-loss la plus basse ?',
				options: ['Le modèle A, le mesuré', 'Le modèle B, le confiant', 'Égalité, puisque leur exactitude est la même'],
				explain: () => {
					const a = lossAt(1);
					const b = lossAt(OVER);
					return `Modèle A : **${f3(a)}**. Modèle B : **${f3(b)}**, ${f2(b / a)}× pire. Les réponses *justes* et confiantes de B font gagner un peu chacune, mais ses réponses *fausses* et confiantes coûtent une fortune (regardez les énormes points roses, certains avec des pénalités au-dessus de 10). L’exactitude ne voit pas la différence ; la log-loss, si.`;
				}
			}
		},
		{
			title: 'Calibration : 70% veut-il dire 70% ?',
			body: (s) => {
				const hi = binsOf(s)[9];
				return `Un prévisionniste est **calibré** si, parmi tous les jours où il a annoncé « environ 70% », il pleut environ 70% de ces jours. Le **diagramme de fiabilité** regroupe les prévisions par intervalles et indique à quelle fréquence il a réellement plu dans chacun. Des prévisions calibrées se placent sur la diagonale.

À ×${s.conf.toFixed(1)} : sur les ${hi.n} jours prévus entre 90 et 100%, il a plu **${pct(hi.freq, 0)}** du temps (prévision moyenne ${pct(hi.meanP, 0)}). Les modèles trop confiants s’incurvent **plus à plat** que la diagonale, les timides **plus raide**.

La log-loss récompense la calibration : elle est minimale quand les prévisions correspondent à la réalité.`;
			},
			task: {
				prompt: 'Essayez les préréglages **Trop confiant** et **Timide**, puis revenez à **Calibré**.'
			}
		},
		{
			title: 'À vous : bac à sable (playground)',
			body: `Tout est débloqué. Récapitulatif :

1. La log-loss fait la moyenne de **−log(p)**, où p est la probabilité donnée à ce qui s’est réellement produit.
2. La pénalité est douce près de p = 1 et explose quand p → 0 : **une seule erreur confiante peut dominer** le score.
3. Deux modèles de même exactitude peuvent avoir des log-loss très différentes ; le modèle **calibré** l’emporte.
4. Elle est différentiable, c’est pourquoi la [régression logistique](concept:logistic-regression) et les classifieurs à réseau de neurones sont *entraînés* en la minimisant.

Le [ROC-AUC](concept:roc-auc) ne vérifie que le classement et ignore la calibration ; la log-loss vérifie les deux. Utilisez \`sklearn.metrics.log_loss\` avec des probabilités issues de \`predict_proba\`, jamais avec des étiquettes binaires.`
		}
	]
};

export const ar: LessonText<LLState> = {
	title: 'الخسارة اللوغاريتمية: ثمن الأخطاء الواثقة',
	steps: [
		{
			title: 'توقعات، لا مجرد تسميات',
			body: (s) =>
				`يتوقع نموذج طقس **احتمال هطول المطر** لـ ${2 * N} يوماً. يضم المسار العلوي الأيام الـ ${N} التي أمطرت فعلاً، والمسار السفلي الأيام الـ ${N} الجافة. تقع كل نقطة عند الاحتمال الذي أعطاه النموذج للمطر.

إذا قلنا «مطر» كلما بلغ التوقع 50% على الأقل، يصيب النموذج في **${pct(accOf(s), 0)}** من الأيام. لكن الدقة لا تميّز بين 95% واثقة و51% مترددة. أما **الخسارة اللوغاريتمية (log-loss)** فتقيّم الاحتمال نفسه.`
		},
		{
			title: 'العقوبة: −log(p)',
			body: (s) => `لكل يوم، انظر إلى الاحتمال الذي أعطاه النموذج لـ**ما حدث فعلاً**، ولنسمّه *p*: التوقع نفسه في يوم ممطر، و1 − التوقع في يوم جاف. العقوبة هي

\`penalty = −log(p)\` (اللوغاريتم الطبيعي)

- p = 1: العقوبة 0، توقع مثالي ومؤكد.
- p = 0.5: العقوبة 0.69، أي هزّة كتفين.
- p = 0.1: العقوبة 2.30.
- p → 0: العقوبة → ∞.

مِسبارك: p = **${f3(s.p)}** → العقوبة **${f2(penalty(s.p))}**.`,
			task: {
				prompt: 'اسحب المِسبار (أو المنزلق) حتى تتجاوز العقوبة **4**. إلى أي حد يجب أن يكون النموذج واثقاً من الإجابة الخاطئة؟'
			}
		},
		{
			title: 'واثق ومخطئ',
			body: `توقع متنبئان كلاهما المطر، وبقي الجو جافاً. قال أحدهما **60%**، فأعطى 0.40 لما حدث. وقال الآخر **99%**، فلم يعطِ لما حدث سوى 0.01.`,
			quiz: {
				question: 'كم مرة تكبر عقوبة المتنبئ الذي قال 99%؟',
				options: ['نحو 1.6×', 'نحو 5×', 'نحو 50×'],
				explain: `−log(0.01) = **4.61** مقابل −log(0.40) = **0.92**: أكبر بخمس مرات. يكبر اللوغاريتم ببطء في البداية، ثم بلا حدود: عند p = 0.0001 تبلغ العقوبة 9.2، وتوقع يساوي 0 تماماً سيكلّف ما لا نهاية. لهذا تقصّ المكتبات الاحتمالات ضمن [10⁻¹⁵, 1 − 10⁻¹⁵].`
			}
		},
		{
			title: 'الخسارة اللوغاريتمية هي متوسط العقوبة',
			body: (s) => `قيّم كل يوم ثم خذ المتوسط:

\`LogLoss = −(1/n) Σ [ yᵢ·log(ŷᵢ) + (1 − yᵢ)·log(1 − ŷᵢ) ]\`

حيث ŷᵢ هو التوقع وyᵢ يساوي 1 في الأيام الممطرة. حدّ واحد فقط يكون فعّالاً في كل يوم، لذا فهذا هو متوسط −log(p). كلما انخفضت كان أفضل؛ و0 تعني الكمال.

يقع كل يوم الآن على منحنى العقوبة، وفي الشريط **النقاط الأكبر تكلّف أكثر** (الوردي = توقع في الجانب الخاطئ من 50%). هذا النموذج: الخسارة اللوغاريتمية **${f3(lossOf(s))}**. تتسبب أسوأ 10 أيام في **${pct(worstShare(s), 0)}** من المجموع.`
		},
		{
			title: 'ارفع الثقة',
			body: (s) => {
				const best = bestConf();
				return `يضرب منزلق **الثقة** اللوغاريتمَ الاحتمالي (log-odds) لكل توقع في المعامل نفسه. فوق ×1 تُدفع التوقعات نحو 0% و100%؛ ودون ×1 تُسحب نحو 50%. لا يعبر أي توقع حدّ 50% أبداً، لذا **تبقى الدقة ${pct(accOf(s), 0)}** مهما فعلت.

الثقة **×${s.conf.toFixed(1)}** → الخسارة اللوغاريتمية **${f3(lossOf(s))}**.${Math.abs(lossOf(s) - best[1]) < 0.002 ? ` هذه هي القيمة الدنيا: التوقعات واثقة بقدر ما تسمح به الأدلة.` : ''}`;
			},
			task: {
				prompt: 'جد مستوى الثقة الذي يعطي **أدنى خسارة لوغاريتمية** (استخدم المنزلق أو انقر على المخطط).'
			}
		},
		{
			title: 'الدقة نفسها، خسارة لوغاريتمية مختلفة',
			body: (s) =>
				`قارن بين نموذجين يتخذان **القرارات نفسها تماماً** (دقة كل منهما ${pct(accOf(s), 0)}). النموذج A يتوقع مثل هذا النموذج (الثقة ×1). والنموذج B يمطّ كل شيء ×${OVER}: معظم توقعاته دون 10% أو فوق 90%.`,
			quiz: {
				question: 'أي النموذجين له خسارة لوغاريتمية أدنى؟',
				options: ['النموذج A، المتّزن', 'النموذج B، الواثق', 'يتعادلان، لأن دقتهما متساوية'],
				explain: () => {
					const a = lossAt(1);
					const b = lossAt(OVER);
					return `النموذج A: **${f3(a)}**. النموذج B: **${f3(b)}**، أسوأ بـ ${f2(b / a)}×. إجابات B *الصحيحة* الواثقة توفّر قليلاً لكل منها، لكن إجاباته *الخاطئة* الواثقة تكلّف ثروة (انظر إلى النقاط الوردية الضخمة، بعضها بعقوبات تتجاوز 10). لا ترى الدقة الفرق؛ أما الخسارة اللوغاريتمية فتراه.`;
				}
			}
		},
		{
			title: 'المعايرة: هل 70% تعني 70%؟',
			body: (s) => {
				const hi = binsOf(s)[9];
				return `يكون المتنبئ **معايَراً (calibrated)** إذا أمطرت نحو 70% من كل الأيام التي قال فيها «نحو 70%». يجمع **مخطط الموثوقية (reliability diagram)** التوقعات في فئات ويرسم كم مرة أمطرت فعلاً في كل فئة. تقع التوقعات المعايَرة على القطر.

عند ×${s.conf.toFixed(1)}: من بين ${hi.n} يوماً كان التوقع فيها بين 90 و100%، أمطرت في **${pct(hi.freq, 0)}** منها (متوسط التوقع ${pct(hi.meanP, 0)}). النماذج المفرطة الثقة تنحني **أكثر تسطّحاً** من القطر، والمترددة **أشدّ انحداراً**.

تكافئ الخسارة اللوغاريتمية المعايرة: فهي في أدنى قيمها حين تطابق التوقعات الواقع.`;
			},
			task: {
				prompt: 'جرّب الإعدادين الجاهزين **مفرط الثقة** و**متردد**، ثم عد إلى **معايَر**.'
			}
		},
		{
			title: 'دورك: ساحة التجريب (playground)',
			body: `كل شيء متاح الآن. خلاصة:

1. الخسارة اللوغاريتمية هي متوسط **−log(p)**، حيث p الاحتمال المعطى لما حدث فعلاً.
2. العقوبة لطيفة قرب p = 1 وتنفجر عندما p → 0: **خطأ واثق واحد قد يهيمن** على النتيجة.
3. قد يكون لنموذجين بالدقة نفسها خسارتان لوغاريتميتان مختلفتان جداً؛ والنموذج **المعايَر** هو الفائز.
4. إنها قابلة للاشتقاق، ولهذا يُدرَّب [الانحدار اللوجستي](concept:logistic-regression) ومصنِّفات الشبكات العصبية *بتقليلها*.

يتحقق [ROC-AUC](concept:roc-auc) من الترتيب فقط ويتجاهل المعايرة؛ أما الخسارة اللوغاريتمية فتتحقق من الاثنين. استخدم \`sklearn.metrics.log_loss\` مع احتمالات من \`predict_proba\`، لا مع تسميات ثنائية أبداً.`
		}
	]
};
