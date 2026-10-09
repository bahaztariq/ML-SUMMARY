/**
 * French and Arabic narration for the Isolation Forest lesson (same step order as index.ts).
 */
import { fmt } from '#lib/viz/canvas.ts';
import type { LessonText } from '../types';
import { cFactor } from './iforest.ts';
import { CLUMP, LOCAL, LONE, clumpCaught, clumpScore, data, detection, forest, isolated, mean, pathLen, pct, scores, type IFState } from './state.ts';

/** The same state with ψ = 256, for numbers that shouldn't move when the learner changes ψ. */
/** French writes a non-breaking space before %. */
const frPct = (v: number, d = 0) => pct(v, d).replace('%', '\u00a0%');

const at256 = (s: IFState): IFState => ({ ...s, psi: 256 });

export const fr: LessonText<IFState> = {
	title: 'Comment Isolation Forest repère les anomalies',
	steps: [
		{
			title: 'Les anomalies sont rares et différentes',
			body: `Voici ${data('blobs').X.length} points sans étiquettes, par exemple des transactions bancaires placées selon deux variables. La plupart forment deux clusters, et quelques-uns restent à l’écart, seuls.

La plupart des détecteurs d’anomalies modélisent d’abord à quoi ressemble le *normal* (une densité, ou des distances aux voisins) et signalent ce qui ne colle pas. **Isolation Forest** prend le problème à l’envers : les anomalies sont **rares et différentes**, donc **faciles à isoler**.

Pensez au jeu des 20 questions : retrouver une personne ordinaire dans une foule demande beaucoup de questions. Retrouver celle qui porte une combinaison d’astronaute violette en demande une ou deux.`
		},
		{
			title: 'Des coupes aléatoires isolent un point',
			body: (s) => `Un **arbre d’isolation** pose des questions oui/non au hasard :

1. Choisir une variable au hasard (x₁ ou x₂).
2. Choisir une valeur de coupe uniformément entre le min et le max des points encore en jeu.
3. Garder le côté qui contient notre point, et recommencer jusqu’à ce qu’il soit **seul**.

Le nombre de coupes est la **longueur de chemin h(x)** du point : la profondeur de sa feuille dans l’arbre. ${isolated(s) ? `La valeur aberrante était seule après seulement **${pathLen(s)} coupes**.` : `Pour l’instant : **${s.cuts}** coupe${s.cuts > 1 ? 's' : ''}.`}`,
			task: {
				prompt: 'Appuyez sur **Coupe suivante** (ou **Isoler**) jusqu’à ce que la valeur aberrante soit seule dans sa cellule.'
			}
		},
		{
			title: 'Maintenant, un point normal',
			body: (s) =>
				`Même procédure, même type d’arbre aléatoire, mais cette fois pour le point au milieu du cluster de gauche. ${isolated(s) ? `Il a fallu **${pathLen(s)} coupes**.` : s.cuts ? `**${s.cuts}** coupe${s.cuts > 1 ? 's' : ''} pour l’instant.` : ''}`,
			quiz: {
				question: 'La valeur aberrante a demandé 3 coupes. Combien en faudra-t-il au point situé au milieu d’un cluster ?',
				options: [
					'Moins : il a tant de voisins que les coupes tombent sans cesse près de lui',
					'À peu près autant : les coupes sont aléatoires dans les deux cas',
					'Beaucoup plus : ses voisins continuent de partager sa cellule'
				],
				explain: (s) =>
					`Cet arbre a demandé **${pathLen(s)}** coupes. La plupart des coupes aléatoires tombent dans le vide ou ne retirent que quelques voisins : un point au cœur d’un cluster dense n’est séparé qu’une fois sa cellule devenue minuscule. La valeur aberrante est entourée de vide, donc presque n’importe quelle coupe tombant entre elle et les clusters la sépare.`
			}
		},
		{
			title: 'Un seul arbre juge mal',
			body: (s) => `Chaque arbre est aléatoire, donc une longueur de chemin isolée tient en partie du hasard : parfois la première coupe tombe juste à côté du point normal, et parfois la valeur aberrante résiste à quelques coupes.

En faisant la moyenne sur de nombreux arbres, le hasard se compense. Après **${s.history.out.length}** arbre${s.history.out.length > 1 ? 's' : ''} : la valeur aberrante demande en moyenne **${fmt(mean(s.history.out), 1)}** coupes, le point normal **${fmt(mean(s.history.normal), 1)}**.`,
			task: {
				prompt: 'Faites pousser au moins **20 arbres** (avec **+10 arbres**) et regardez les deux moyennes se stabiliser.'
			}
		},
		{
			title: 'De la longueur de chemin au score d’anomalie',
			body: (s) => {
				const f = forest(s);
				const c = cFactor(f.psi);
				return `Une Isolation Forest fait pousser **${s.nTrees} arbres** (n_estimators). Chacun voit un sous-échantillon aléatoire de ψ = min(256, n) = **${f.psi}** lignes (max_samples), et sa profondeur est plafonnée à ⌈log₂ ψ⌉ = ${Math.ceil(Math.log2(f.psi))}, car seuls les chemins courts comptent.

La longueur de chemin moyenne E[h(x)] est divisée par **c(ψ) = ${fmt(c)}**, la longueur de chemin moyenne d’un point quelconque dans un arbre aléatoire de ψ points :

**s(x) = 2^(−E[h(x)] / c(ψ))**

Un score proche de **1** signale une anomalie. Autour de **0.5** ou en dessous, le point est normal. Le fond colore chaque position selon son score.`;
			},
			task: {
				prompt: 'Cliquez sur des points au cœur d’un cluster, au bord d’un cluster et isolés à l’écart. Comparez les scores.'
			}
		},
		{
			title: 'La contamination fixe le seuil',
			body: (s) => {
				const d = detection(s);
				return `La forêt ne fait que **classer** les points. Pour obtenir des étiquettes oui/non, le paramètre \`contamination\` de scikit-learn indique la fraction à signaler : ici les **${frPct(s.contamination, 1)}** de score le plus élevé, avec le contour rose comme seuil.

Les points roses sont les 8 anomalies que nous avons plantées. La forêt n’a jamais vu ces étiquettes ; elles servent seulement à vérifier son travail. Signalés : **${d.flagged}**, dont **${d.caught} sur ${d.planted}** anomalies détectées, avec **${d.falseAlarms}** fausse${d.falseAlarms > 1 ? 's' : ''} alerte${d.falseAlarms > 1 ? 's' : ''}.

En pratique, on ne connaît pas le vrai taux : on fixe la contamination à partir de la connaissance du domaine (par ex. « environ 1 % des transactions sont frauduleuses »), ou on classe par \`score_samples\` et on examine le haut de la liste.`;
			},
			task: {
				prompt: 'Réglez la contamination pour détecter **les 8** anomalies plantées avec **au plus 1** fausse alerte.'
			}
		},
		{
			title: 'Point faible : le masquage',
			body: (s) =>
				`Un autre jeu de données : un cluster normal, deux anomalies isolées et un **amas serré de 25 anomalies** en haut à droite (toutes en rose).${
					s.show.heat
						? `

Avec ψ = **${s.psi}** : le score moyen de l’amas est **${fmt(clumpScore(s))}**, l’anomalie isolée en bas à gauche obtient **${fmt(scores(s)[LONE])}**, et **${clumpCaught(s)} sur ${CLUMP.length}** points de l’amas sont signalés.${s.psi < 256 ? ' Les petits sous-échantillons ont aussi un coût : les scores deviennent plus bruités, et l’anomalie isolée obtient maintenant un score plus bas qu’avec ψ = 256.' : ''}`
						: ''
				}`,
			quiz: {
				question: 'Avec ψ = 256 (chaque arbre voit toutes les données), quel score obtiendra l’amas par rapport à une anomalie isolée ?',
				options: [
					'Plus élevé : elles sont plus nombreuses',
					'Plus bas : elles se protègent mutuellement, donc en isoler une demande beaucoup de coupes',
					'Exactement le même : toutes les anomalies ont le même score'
				],
				explain: (s) =>
					`Les membres de l’amas sont voisins les uns des autres, donc en isoler un demande presque autant de coupes qu’un point normal. Score moyen **${fmt(clumpScore(at256(s)))}** contre **${fmt(scores(at256(s))[LONE])}** pour l’anomalie isolée. C’est ce qu’on appelle le **masquage**. La solution : des sous-échantillons plus petits. Un arbre construit sur 16 lignes ne contient en général qu’un ou deux membres de l’amas, et ceux-ci s’isolent vite.`
			},
			task: {
				prompt: 'Diminuez **max_samples ψ** jusqu’à ce que tout l’amas soit signalé.'
			}
		},
		{
			title: 'Point faible : les anomalies locales',
			body: (s) => {
				const d = detection(s);
				const sc = scores(s);
				return `À gauche, un cluster **dense**. À droite, un cluster **clairsemé**. Les deux points roses se trouvent juste à l’extérieur du cluster dense. *Par rapport à leur voisinage*, ils sont clairement anormaux, mais dans l’absolu ils sont moins isolés que les points du bord du cluster clairsemé.

Isolation Forest juge l’isolement **global**. Leurs scores sont ${LOCAL.map((i) => `**${fmt(sc[i])}**`).join(' et ')}, et avec une contamination de ${frPct(s.contamination)} elle en détecte **${d.caught} sur ${d.planted}**, en signalant plutôt des points du bord du cluster clairsemé.

Remarquez aussi les **bandes en forme de croix** dans le fond : des coupes parallèles aux axes donnent des régions de score rectangulaires. Pour des anomalies relatives à la densité, modélisez la densité avec un [mélange gaussien](concept:gmm) ou utilisez les points de bruit de [DBSCAN](concept:dbscan).`;
			},
			task: {
				prompt: 'Cliquez sur les deux points roses, puis sur un point du bord extérieur du cluster clairsemé. Comparez leurs scores.'
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué. Essayez un seul arbre (n_estimators = 1) pour voir à quel point les scores d’un arbre unique sont grossiers. Récapitulatif :

1. Faire pousser de nombreux **arbres d’isolation** sur de petits sous-échantillons aléatoires (ψ ≈ 256), chacun coupant sur une variable aléatoire à une valeur aléatoire.
2. La **longueur de chemin** h(x) d’un point est le nombre de coupes nécessaires pour l’isoler. Les anomalies ont des chemins courts.
3. **Score** s = 2^(−E[h] / c(ψ)) : proche de 1, c’est une anomalie.
4. La **contamination** transforme le classement en étiquettes.

Il n’y a pas de distances, donc pas de mise à l’échelle des variables, et l’entraînement est rapide et linéaire en n. Attention aux amas d’anomalies (baissez ψ) et aux anomalies locales près de clusters denses. C’est la même idée de coupes aléatoires qu’une [forêt aléatoire](concept:random-forest), mais sans étiquettes.`
		}
	]
};

export const ar: LessonText<IFState> = {
	title: 'كيف تكتشف غابة العزل (Isolation Forest) الشذوذات',
	steps: [
		{
			title: 'الشذوذات قليلة ومختلفة',
			body: `هذه ${data('blobs').X.length} نقطة بلا تسميات، لنقل إنها معاملات بطاقات مصرفية مرسومة وفق سمتين. يقع معظمها في عنقودين (clusters)، وقليل منها يقف وحيدًا بعيدًا عنهما.

تبدأ معظم كواشف الشذوذ (anomaly detection) بنمذجة شكل البيانات *العادية* (كثافة، أو مسافات إلى الجيران) ثم تعلّم كل ما لا يتلاءم معها. أما **غابة العزل (Isolation Forest)** فتقلب الفكرة: الشذوذات **قليلة ومختلفة**، لذا فهي **سهلة العزل**.

تذكّر لعبة العشرين سؤالًا: تمييز شخص عادي وسط حشد يتطلب أسئلة كثيرة، أما تمييز من يرتدي بدلة رائد فضاء بنفسجية فيكفيه سؤال أو اثنان.`
		},
		{
			title: 'القطوع العشوائية تعزل النقطة',
			body: (s) => `تطرح **شجرة العزل (isolation tree)** أسئلة عشوائية بنعم أو لا:

1. اختر سمة عشوائيًا (x₁ أو x₂).
2. اختر قيمة قطع بانتظام بين أصغر وأكبر قيمة للنقاط التي لا تزال في اللعب.
3. احتفظ بالجانب الذي يحتوي نقطتنا، وكرّر حتى تصبح **وحيدة**.

عدد القطوع هو **طول المسار h(x)** للنقطة (path length): عمق ورقتها في الشجرة. ${isolated(s) ? `أصبحت القيمة الشاذة وحيدة بعد **${pathLen(s)} قطوع** فقط.` : `حتى الآن: **${s.cuts}** من القطوع.`}`,
			task: {
				prompt: 'اضغط **القطع التالي** (أو **اعزل**) حتى تصبح القيمة الشاذة وحيدة في خليتها.'
			}
		},
		{
			title: 'والآن نقطة عادية',
			body: (s) =>
				`الإجراء نفسه، ونوع الشجرة العشوائية نفسه، لكن هذه المرة للنقطة الواقعة في وسط العنقود الأيسر. ${isolated(s) ? `استغرق الأمر **${pathLen(s)} قطعًا**.` : s.cuts ? `**${s.cuts}** من القطوع حتى الآن.` : ''}`,
			quiz: {
				question: 'احتاجت القيمة الشاذة إلى 3 قطوع. كم قطعًا ستحتاج النقطة الواقعة في وسط عنقود؟',
				options: [
					'أقل: لها جيران كثيرون، فتقع القطوع قربها باستمرار',
					'تقريبًا العدد نفسه: القطوع عشوائية في الحالتين',
					'أكثر بكثير: جيرانها يظلون يشاركونها خليتها'
				],
				explain: (s) =>
					`احتاجت هذه الشجرة إلى **${pathLen(s)}** قطعًا. تقع معظم القطوع العشوائية في مساحة فارغة أو لا تقتطع إلا بضعة جيران، لذا لا تنفصل النقطة الواقعة داخل عنقود كثيف إلا عندما تصبح خليتها صغيرة جدًا. أما القيمة الشاذة فتقع في مساحة فارغة، فأي قطع تقريبًا يقع بينها وبين العنقودين يفصلها.`
			}
		},
		{
			title: 'شجرة واحدة حَكَم غير موثوق',
			body: (s) => `كل شجرة عشوائية، لذا فطول مسار واحد هو جزئيًا مسألة حظ: أحيانًا يقع القطع الأول بجوار النقطة العادية مباشرة، وأحيانًا تصمد القيمة الشاذة أمام بضعة قطوع.

خذ المتوسط على أشجار كثيرة فيلغي الحظ بعضه بعضًا. بعد **${s.history.out.length}** من الأشجار: متوسط القيمة الشاذة **${fmt(mean(s.history.out), 1)}** قطعًا، ومتوسط النقطة العادية **${fmt(mean(s.history.normal), 1)}**.`,
			task: {
				prompt: 'أنمِ **20 شجرة** على الأقل (استخدم **+10 أشجار**) وراقب استقرار المتوسطين.'
			}
		},
		{
			title: 'من طول المسار إلى درجة الشذوذ',
			body: (s) => {
				const f = forest(s);
				const c = cFactor(f.psi);
				return `تُنمي غابة العزل **${s.nTrees} شجرة** (n_estimators). ترى كل شجرة عينة فرعية عشوائية (subsample) من ψ = min(256, n) = **${f.psi}** صفًا (max_samples)، ويُحدّ عمقها عند ⌈log₂ ψ⌉ = ${Math.ceil(Math.log2(f.psi))}، لأن المسارات القصيرة وحدها هي المهمة.

يُقسَم متوسط طول المسار E[h(x)] على **c(ψ) = ${fmt(c)}**، وهو متوسط طول مسار نقطة عشوائية في شجرة عشوائية من ψ نقطة:

**s(x) = 2^(−E[h(x)] / c(ψ))**

الدرجة القريبة من **1** تعني شذوذًا. وما يقارب **0.5** أو أقل يعني نقطة عادية. تُلوَّن الخلفية في كل موضع بحسب درجته.`;
			},
			task: {
				prompt: 'انقر على نقاط في عمق عنقود، وعلى حافة عنقود، وعلى نقاط بعيدة وحدها. قارن الدرجات.'
			}
		},
		{
			title: 'معامل التلوث يحدد العتبة',
			body: (s) => {
				const d = detection(s);
				return `الغابة **ترتّب** النقاط فقط. للحصول على تسميات بنعم أو لا، يحدد المعامل \`contamination\` في scikit-learn النسبة التي يجب تعليمها: هنا أعلى **${pct(s.contamination, 1)}** بحسب الدرجة، والحدّ الوردي يمثل العتبة.

النقاط الوردية هي الشذوذات الثماني التي زرعناها. لم ترَ الغابة هذه التسميات قط، ونحن نستخدمها فقط للتحقق من عملها. عدد النقاط المعلَّمة **${d.flagged}**: اكتُشف **${d.caught} من ${d.planted}**، مع **${d.falseAlarms}** من الإنذارات الكاذبة.

في الواقع لا تعرف المعدل الحقيقي، لذا تضبط معامل التلوث (contamination) من معرفتك بالمجال (مثلًا «نحو 1% من المعاملات احتيالية»)، أو ترتّب النقاط بحسب \`score_samples\` وتراجع أعلى القائمة.`;
			},
			task: {
				prompt: 'اضبط معامل التلوث بحيث تُكتشف الشذوذات المزروعة **الثمانية كلها** مع إنذار كاذب **واحد على الأكثر**.'
			}
		},
		{
			title: 'نقطة ضعف: الحجب',
			body: (s) =>
				`مجموعة بيانات مختلفة: عنقود عادي واحد، وشذوذان منعزلان، و**تكتل محكم من 25 شذوذًا** في أعلى اليمين (كلها وردية).${
					s.show.heat
						? `

مع ψ = **${s.psi}**: متوسط درجة التكتل **${fmt(clumpScore(s))}**، ودرجة الشذوذ المنعزل في أسفل اليسار **${fmt(scores(s)[LONE])}**، وعُلِّمت **${clumpCaught(s)} من ${CLUMP.length}** نقاط التكتل.${s.psi < 256 ? ' وللعينات الفرعية الصغيرة ثمن أيضًا: تصبح الدرجات أكثر ضجيجًا، وصارت درجة الشذوذ المنعزل أقل مما كانت عليه مع ψ = 256.' : ''}`
						: ''
				}`,
			quiz: {
				question: 'مع ψ = 256 (كل شجرة ترى البيانات كلها)، كيف ستكون درجة التكتل مقارنة بشذوذ منعزل؟',
				options: ['أعلى: لأنها أكثر عددًا', 'أقل: يحمي بعضها بعضًا، فعزل واحدة منها يتطلب قطوعًا كثيرة', 'مطابقة تمامًا: كل الشذوذات تحصل على الدرجة نفسها'],
				explain: (s) =>
					`أعضاء التكتل جيران بعضهم لبعض، لذا يتطلب عزل أحدهم عددًا من القطوع يقارب ما تتطلبه نقطة عادية. متوسط الدرجة **${fmt(clumpScore(at256(s)))}** مقابل **${fmt(scores(at256(s))[LONE])}** للشذوذ المنعزل. تُسمّى هذه الظاهرة **الحجب (masking)**. والحل عينات فرعية أصغر: الشجرة المبنية على 16 صفًا لا تحتوي عادة إلا عضوًا أو اثنين من التكتل، ويسهل عزلهما بسرعة.`
			},
			task: {
				prompt: 'خفّض **max_samples ψ** حتى يُعلَّم التكتل كله.'
			}
		},
		{
			title: 'نقطة ضعف: الشذوذات المحلية',
			body: (s) => {
				const d = detection(s);
				const sc = scores(s);
				return `على اليسار عنقود **كثيف**، وعلى اليمين عنقود **متناثر**. تقع النقطتان الورديتان خارج العنقود الكثيف مباشرة. *بالنسبة إلى جوارهما* هما شاذتان بوضوح، لكنهما بالمقياس المطلق أقل عزلة من نقاط حافة العنقود المتناثر.

تحكم غابة العزل على العزلة **الشاملة**. درجتاهما ${LOCAL.map((i) => `**${fmt(sc[i])}**`).join(' و')}، ومع معامل تلوث ${pct(s.contamination)} تكتشف **${d.caught} من ${d.planted}**، وتعلّم بدلًا منهما نقاطًا على حافة العنقود المتناثر.

لاحظ أيضًا **الأشرطة المتقاطعة** في الخلفية: القطوع الموازية للمحاور تعطي مناطق درجات مستطيلة. للقيم الشاذة نسبةً إلى الكثافة، نمذِج الكثافة بـ[نموذج خليط غاوسي](concept:gmm) أو استخدم نقاط الضجيج في [DBSCAN](concept:dbscan).`;
			},
			task: {
				prompt: 'انقر على النقطتين الورديتين، ثم على نقطة في الحافة الخارجية للعنقود المتناثر. قارن درجاتها.'
			}
		},
		{
			title: 'دورك: ساحة التجربة',
			body: `كل شيء متاح الآن. جرّب شجرة واحدة (n_estimators = 1) لترى كم هي خشنة درجات شجرة واحدة. للتلخيص:

1. أنمِ **أشجار عزل (isolation trees)** كثيرة على عينات فرعية عشوائية صغيرة (ψ ≈ 256)، تقسم كل منها على سمة عشوائية عند قيمة عشوائية.
2. **طول المسار** h(x) لنقطة هو عدد القطوع اللازمة لعزلها. للشذوذات مسارات قصيرة.
3. **الدرجة** s = 2^(−E[h] / c(ψ)): القريبة من 1 تعني شذوذًا.
4. معامل **contamination** يحوّل الترتيب إلى تسميات.

لا توجد مسافات، فلا حاجة إلى توحيد مقاييس السمات (feature scaling)، والتدريب سريع وخطي في n. احذر تكتلات الشذوذات (خفّض ψ) والشذوذات المحلية قرب العناقيد الكثيفة. إنها فكرة التقسيم العشوائي نفسها في [الغابة العشوائية](concept:random-forest)، لكن بلا تسميات.`
		}
	]
};

export default { fr, ar };
