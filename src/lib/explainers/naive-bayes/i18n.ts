/**
 * French and Arabic narration for the naive Bayes lesson (same step order as index.ts).
 * Spam-filter words use the labels from words.ts so the text matches the chips.
 */
import type { LessonText } from '../types.ts';
import { N_HAM, N_SPAM, likelihood, posterior, wordById } from './nb.ts';
import { accuracyOf, activeWords, gnb, pSpam, post, probeB, type NBState } from './state.ts';
import { WORD_LABELS } from './words.ts';

const f2 = (v: number) => v.toFixed(2);
const f3 = (v: number) => v.toFixed(3);
const pct = (v: number, d = 0) => `${(v * 100).toFixed(d)}%`;
const sd = (v: number) => Math.sqrt(v).toFixed(2);
const N = N_SPAM + N_HAM;
const PS = N_SPAM / N;

/** The "free" numbers of step 2. */
const free = () => {
	const w = wordById.get('free')!;
	const ls = w.spam / N_SPAM;
	const lh = w.ham / N_HAM;
	return { w, ls, lh, js: ls * PS, jh: lh * (1 - PS) };
};
const once = (s: NBState) => posterior([wordById.get('free')!], s.alpha).post[0];
const twice = (s: NBState) => posterior([wordById.get('free')!, wordById.get('FREE')!], s.alpha).post[0];

const FW = WORD_LABELS.fr;
const AW = WORD_LABELS.ar;

const fr: LessonText<NBState> = {
	title: 'Comment le Bayes naïf pèse les indices',
	steps: [
		{
			title: 'Avant de lire un mot : l’a priori',
			body: `Construisons un filtre anti-spam. Dans notre jeu d’entraînement de **${N} courriels**, ${N_SPAM} sont des spams et ${N_HAM} des « ham » (courriels normaux). Avant même de regarder un nouveau courriel, la meilleure estimation est l’**a priori** :

\`P(spam) = ${N_SPAM}/${N} = ${f2(PS)}\`

Lire le courriel doit mettre à jour cette croyance. Le **théorème de Bayes** dit comment :

\`P(spam | words) = P(words | spam) · P(spam) / P(words)\`

P(words | spam) est la **vraisemblance** : à quel point ces mots sont typiques des spams. Cela, on peut le compter dans les courriels d’entraînement.`
		},
		{
			title: 'Un mot comme indice',
			body: (s) => {
				const { w, ls, lh, js, jh } = free();
				return `Le courriel contient **« ${FW.free} »**. Ce mot apparaît dans ${w.spam} des ${N_SPAM} spams et dans ${w.ham} des ${N_HAM} hams :

\`P(${FW.free} | spam) = ${f2(ls)}\`, \`P(${FW.free} | ham) = ${f2(lh)}\`

Multipliez chacun par son a priori : spam ${f2(ls)} × ${f2(PS)} = **${f2(js)}**, ham ${f2(lh)} × ${f2(1 - PS)} = **${f2(jh)}**. Diviser par leur somme (c’est P(words)) les ramène à un total de 1 :

\`P(spam | ${FW.free}) = ${f2(js)} / ${f2(js + jh)} = ${f2(js / (js + jh))}\`

Avec les mots actuellement activés, le filtre indique **P(spam) = ${pct(pSpam(s))}**.`;
			},
			task: { prompt: `Activez puis désactivez **${FW.meeting}**. Dans quel sens pousse-t-il la probabilité a posteriori ?` }
		},
		{
			title: 'Plusieurs mots : l’hypothèse naïve',
			body: (s) => {
				const ws = activeWords(s);
				return `Avec plusieurs mots, il faut P(${FW.free}, ${FW.click}, … | spam), la probabilité de voir exactement cette **combinaison**. Estimer chaque combinaison demanderait un nombre astronomique de courriels.

Le Bayes naïf fait une simplification audacieuse : **les mots sont indépendants une fois la classe connue**. La vraisemblance devient alors un simple produit :

\`P(spam | words) ∝ P(spam) · P(w₁ | spam) · P(w₂ | spam) · …\`

C’est la partie « naïve ». C’est rarement vrai (« ${FW.free} » et « ${FW.click} » vont souvent ensemble), mais cela réduit l’entraînement à du comptage : un nombre par mot et par classe.

Mots activés : ${ws.length ? ws.map((w) => `**${FW[w.id] ?? w.label}**`).join(', ') : 'aucun'}. P(spam) = **${pct(pSpam(s), 1)}**.`;
			},
			quiz: {
				question: `On ajoute une variable « ${FW.FREE} » qui n’est autre que « ${FW.free} » en majuscules : elle apparaît exactement dans les mêmes courriels. Un courriel contient les deux. Que fait le Bayes naïf ?`,
				options: ['Il repère le doublon et ne le compte qu’une fois', 'Il compte deux fois le même indice et devient trop confiant', 'Il fait la moyenne des deux vraisemblances'],
				explain: (s) =>
					`L’indépendance signifie que chaque variable est traitée comme un indice **nouveau** : la copie multiplie à nouveau par le même facteur. « ${FW.free} » seul donne ${pct(once(s))}, « ${FW.free} » + « ${FW.FREE} » donne **${pct(twice(s))}**, alors que rien de nouveau n’a été appris. Des variables corrélées rendent le Bayes naïf **trop confiant**. Ses classements sont souvent bons, mais ses probabilités sont mal calibrées.`
			}
		},
		{
			title: 'Les indices s’additionnent en espace logarithmique',
			body: (s) => {
				const p = post(s);
				return `Multiplier des centaines de petites probabilités finit par donner 0 (dépassement inférieur) : les implémentations réelles additionnent plutôt des **logarithmes**. Sous forme de log-cote, chaque mot ajoute une poussée fixe :

\`log-odds = ln(P(spam)/P(ham)) + Σ ln(P(wᵢ | spam) / P(wᵢ | ham))\`

Les barres montrent chaque terme : vers la droite, on pousse vers spam ; vers la gauche, vers ham. L’a priori part de ${f2(p.priorLogOdds)} ; le total vaut **${f2(p.logOdds)}**, soit P(spam) = ${pct(pSpam(s), 1)}.

Additionner des poids par variable fait du Bayes naïf un classifieur **linéaire** en espace logarithmique, proche cousin de la [régression logistique](concept:logistic-regression).`;
			},
			task: { prompt: 'Faites passer le courriel pour un ham : amenez **P(spam) sous 5 %**.' }
		},
		{
			title: 'Un seul zéro efface tout',
			body: `Un nouveau mot : **« ${FW.winner} »**. Il apparaît dans 12 des ${N_SPAM} spams et dans **aucun** des ${N_HAM} hams. En comptant directement :

\`P(${FW.winner} | ham) = 0 / ${N_HAM} = 0\`

Cela ne veut pas dire qu’un ham ne peut jamais dire « ${FW.winner} ». Simplement, on ne l’a pas vu dans 60 courriels.`,
			quiz: {
				question: `Un courriel contient « ${FW.meeting} », « ${FW.report} » et « ${FW.winner} ». Que dit le filtre ?`,
				options: [
					'P(spam) faible : deux mots typiques des hams l’emportent sur un mot typique des spams',
					'P(spam) = 100 % : ce seul zéro efface tous les indices en faveur de ham',
					'Environ 50 % : les indices s’annulent'
				],
				explain: `Le score de ham est un produit dont un facteur vaut 0 : P(ham | words) = 0, quelle que soit la force avec laquelle « ${FW.meeting} » et « ${FW.report} » désignent un ham. En espace logarithmique, ce mot pousse **infiniment** loin. Un seul mot jamais vu décide de tout le courriel.`
			}
		},
		{
			title: 'Le lissage de Laplace',
			body: (s) => {
				const w = wordById.get('winner')!;
				return `La solution : faire comme si chaque compte était un peu plus grand. Le **lissage de Laplace (additif)** ajoute α à chaque compte :

\`P(w | class) = (count + α) / (n_class + 2α)\`

(2α au dénominateur, car un mot peut être présent ou absent.) Avec α = ${s.alpha} : P(${FW.winner} | ham) = (0 + ${s.alpha}) / (${N_HAM} + ${2 * s.alpha}) = **${f3(likelihood(w.ham, N_HAM, s.alpha))}**, petit mais plus nul.

P(spam) pour ce courriel : **${pct(pSpam(s), 1)}**. Le lissage rapproche aussi légèrement chaque vraisemblance de 50 %, ce qui compte surtout pour les mots rares.`;
			},
			task: { prompt: 'Réglez **α = 1** (la valeur par défaut de scikit-learn) et regardez les autres mots retrouver voix au chapitre.' }
		},
		{
			title: 'Variables continues : le Bayes naïf gaussien',
			body: (s) => {
				const m = gnb(s);
				return `Les mots sont des variables oui/non. Pour des nombres, le **NB gaussien** modélise chaque variable dans chaque classe par une **courbe en cloche** avec sa propre moyenne et son propre écart-type. Les courbes le long des bords sont ces cloches ajustées :

- classe A : x₁ ~ moyenne ${f2(m.mean[0][0])}, écart-type ${sd(m.var[0][0])} ; x₂ ~ moyenne ${f2(m.mean[0][1])}, écart-type ${sd(m.var[0][1])}
- classe B : x₁ ~ moyenne ${f2(m.mean[1][0])}, écart-type ${sd(m.var[1][0])} ; x₂ ~ moyenne ${f2(m.mean[1][1])}, écart-type ${sd(m.var[1][1])}

Sous l’hypothèse naïve, la vraisemblance 2D est le produit \`P(x | c) = N(x₁; μ, σ²) · N(x₂; μ, σ²)\`. Ses courbes de niveau (les ellipses) sont toujours **alignées sur les axes**. L’entraînement se résume à 8 moyennes plus les a priori des classes.`;
			}
		},
		{
			title: 'Des cloches à la frontière',
			body: (s) => {
				const pb = probeB(s);
				return `Pour tout point, le théorème de Bayes transforme les deux vraisemblances et les a priori en probabilité a posteriori. L’ombrage montre P(B | x) ; la courbe pleine est l’endroit où les deux classes sont également probables.

La frontière est **courbe** : la classe A est large en x₁ et étroite en x₂, la classe B l’inverse, et des variances inégales donnent une frontière quadratique.

La sonde ◆ a P(B) = **${pct(pb)}**, P(A) = ${pct(1 - pb)}. Exactitude d’entraînement : ${pct(accuracyOf(s))}.`;
			},
			task: { prompt: 'Faites glisser la sonde ◆ vers un endroit où le modèle hésite : **P(B) entre 35 % et 65 %**.' }
		},
		{
			title: 'Quand l’hypothèse naïve fait mal',
			body: `Nouvelles données : dans les deux classes, x₁ et x₂ sont fortement **corrélées**, si bien que chaque nuage forme une traînée diagonale. Les classes sont côte à côte, séparées en travers de la diagonale.`,
			quiz: {
				question: 'À quoi ressembleront les ellipses ajustées par le NB gaussien sur ces données ?',
				options: [
					'Inclinées le long de la diagonale, épousant chaque traînée',
					'Alignées sur les axes : le NB ne peut pas représenter la corrélation',
					'Des cercles parfaits'
				],
				explain: (s) =>
					`Le NB ajuste chaque variable séparément : il ne voit jamais que x₁ et x₂ varient ensemble. Ses ellipses sont alignées sur les axes et bien plus larges que les traînées, et à ses yeux les deux classes se chevauchent fortement. Exactitude : **${pct(accuracyOf(s))}**. Une gaussienne à matrice de covariance complète (frontière en pointillés) obtient ${pct(accuracyOf(s, 'qda'))}. C’est le modèle derrière les [mélanges gaussiens](concept:gmm).`
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué : passez du filtre anti-spam à la vue 2D, activez des mots, changez α, déplacez la sonde.

Récapitulatif :

1. **Théorème de Bayes** : a posteriori ∝ vraisemblance × a priori, puis normalisation pour que la somme fasse 1.
2. **Naïf** : les variables sont supposées indépendantes sachant la classe, donc les vraisemblances se multiplient (les log-vraisemblances s’additionnent).
3. L’entraînement, c’est du **comptage** (ou des moyennes pour le NB gaussien) : très rapide, et cela marche avec peu de données.
4. Un compte nul met son veto à tout. Le **lissage de Laplace** (α = 1) l’évite.
5. Les variables corrélées sont comptées deux fois. Les classements restent utiles, mais les probabilités sont trop confiantes.

Le Bayes naïf est une référence solide et rapide pour le texte. Comparez-le à la [régression logistique](concept:logistic-regression), et évaluez-le avec la [précision et le rappel](concept:precision-recall-f1).`
		}
	]
};

const ar: LessonText<NBState> = {
	title: 'كيف يوازن بايز الساذج بين الأدلة',
	steps: [
		{
			title: 'قبل قراءة أي كلمة: الاحتمال المسبق',
			body: `سنبني مرشحًا للبريد المزعج. في مجموعة التدريب لدينا **${N} رسالة**، منها ${N_SPAM} رسالة مزعجة (spam) و${N_HAM} رسالة سليمة (ham، أي بريد عادي). قبل النظر إلى أي رسالة جديدة، أفضل تخمين هو **الاحتمال المسبق** (prior):

\`P(spam) = ${N_SPAM}/${N} = ${f2(PS)}\`

قراءة الرسالة يجب أن تحدّث هذا الاعتقاد. و**مبرهنة بايز** (Bayes' theorem) تبيّن كيف:

\`P(spam | words) = P(words | spam) · P(spam) / P(words)\`

P(words | spam) هي **الأرجحية** (likelihood): مدى شيوع هذه الكلمات في البريد المزعج. ويمكننا عدّها من رسائل التدريب.`
		},
		{
			title: 'كلمة واحدة كدليل',
			body: (s) => {
				const { w, ls, lh, js, jh } = free();
				return `تحتوي الرسالة على **«${AW.free}»**. تظهر هذه الكلمة في ${w.spam} من أصل ${N_SPAM} رسالة مزعجة، وفي ${w.ham} من أصل ${N_HAM} رسالة سليمة:

\`P(${AW.free} | spam) = ${f2(ls)}\`، \`P(${AW.free} | ham) = ${f2(lh)}\`

اضرب كلًا منهما في احتماله المسبق: المزعج ${f2(ls)} × ${f2(PS)} = **${f2(js)}**، والسليم ${f2(lh)} × ${f2(1 - PS)} = **${f2(jh)}**. القسمة على مجموعهما (وهو P(words)) تجعل مجموعهما 1:

\`P(spam | ${AW.free}) = ${f2(js)} / ${f2(js + jh)} = ${f2(js / (js + jh))}\`

مع الكلمات المفعّلة حاليًا، يقول المرشح **P(spam) = ${pct(pSpam(s))}**.`;
			},
			task: { prompt: `فعّل **${AW.meeting}** ثم ألغِ تفعيلها. في أي اتجاه تدفع الاحتمال اللاحق؟` }
		},
		{
			title: 'كلمات كثيرة: الافتراض الساذج',
			body: (s) => {
				const ws = activeWords(s);
				return `مع عدة كلمات نحتاج إلى P(${AW.free}, ${AW.click}, … | spam)، أي احتمال رؤية هذا **التركيب** بالضبط. تقدير كل تركيب ممكن يتطلب عددًا فلكيًا من الرسائل.

يقوم بايز الساذج (naive Bayes) بتبسيط جريء واحد: **الكلمات مستقلة بمجرد معرفة الفئة**. عندها تصبح الأرجحية مجرد حاصل ضرب:

\`P(spam | words) ∝ P(spam) · P(w₁ | spam) · P(w₂ | spam) · …\`

هذا هو الجزء «الساذج». نادرًا ما يكون صحيحًا (فـ«${AW.free}» و«${AW.click}» تأتيان معًا غالبًا)، لكنه يحوّل التدريب إلى مجرد عدّ: رقم واحد لكل كلمة ولكل فئة.

الكلمات المفعّلة: ${ws.length ? ws.map((w) => `**${AW[w.id] ?? w.label}**`).join('، ') : 'لا شيء'}. P(spam) = **${pct(pSpam(s), 1)}**.`;
			},
			quiz: {
				question: `نضيف ميزة «${AW.FREE}» هي في الحقيقة «${AW.free}» نفسها مكتوبة بشكل آخر، فتظهر في الرسائل نفسها تمامًا. رسالة تحتوي على الاثنتين. ماذا يفعل بايز الساذج؟`,
				options: ['يلاحظ التكرار ويحسبه مرة واحدة', 'يحسب الدليل نفسه مرتين فيصبح مفرط الثقة', 'يأخذ متوسط الأرجحيتين'],
				explain: (s) =>
					`الاستقلال يعني أن كل ميزة تُعامل كدليل **جديد**، فتضرب النسخة العامل نفسه مرة أخرى: «${AW.free}» وحدها تعطي ${pct(once(s))}، و«${AW.free}» + «${AW.FREE}» تعطيان **${pct(twice(s))}**، مع أنه لم يُتعلَّم شيء جديد. الميزات المترابطة تجعل بايز الساذج **مفرط الثقة**. ترتيباته جيدة غالبًا، لكن احتمالاته سيئة المعايرة.`
			}
		},
		{
			title: 'الأدلة تُجمع في الفضاء اللوغاريتمي',
			body: (s) => {
				const p = post(s);
				return `ضرب مئات الاحتمالات الصغيرة يؤول إلى 0 بسبب حدود دقة الحاسوب، لذا تجمع التطبيقات الحقيقية **اللوغاريتمات** بدلًا من ذلك. في صيغة لوغاريتم الأرجحية (log-odds) تضيف كل كلمة دفعة ثابتة:

\`log-odds = ln(P(spam)/P(ham)) + Σ ln(P(wᵢ | spam) / P(wᵢ | ham))\`

تُظهر الأشرطة كل حد: نحو اليمين يدفع نحو المزعج، ونحو اليسار نحو السليم. يبدأ الاحتمال المسبق عند ${f2(p.priorLogOdds)}، والمجموع **${f2(p.logOdds)}**، أي P(spam) = ${pct(pSpam(s), 1)}.

جمع أوزان الميزات يجعل بايز الساذج مصنِّفًا **خطيًا** في الفضاء اللوغاريتمي، وقريبًا من [الانحدار اللوجستي](concept:logistic-regression).`;
			},
			task: { prompt: 'اجعل الرسالة تبدو سليمة: أوصل **P(spam) إلى أقل من 5%**.' }
		},
		{
			title: 'صفر واحد يمحو كل شيء',
			body: `كلمة جديدة: **«${AW.winner}»**. ظهرت في 12 من أصل ${N_SPAM} رسالة مزعجة، ولم تظهر في **أي** من الرسائل السليمة الـ${N_HAM}. فبالعدّ المباشر:

\`P(${AW.winner} | ham) = 0 / ${N_HAM} = 0\`

هذا لا يعني أن الرسالة السليمة لا يمكن أن تقول «${AW.winner}» أبدًا. كل ما في الأمر أننا لم نرها في 60 رسالة.`,
			quiz: {
				question: `رسالة تحتوي على «${AW.meeting}» و«${AW.report}» و«${AW.winner}». ماذا يقول المرشح؟`,
				options: [
					'P(spam) منخفض: كلمتان من البريد السليم تتغلبان على كلمة واحدة من المزعج',
					'P(spam) = 100%: الصفر الوحيد يمحو كل الأدلة لصالح السليم',
					'نحو 50%: الأدلة يلغي بعضها بعضًا'
				],
				explain: `درجة السليم حاصل ضرب، وأحد العوامل يساوي 0، إذن P(ham | words) = 0 مهما أشارت «${AW.meeting}» و«${AW.report}» بقوة إلى السليم. في الفضاء اللوغاريتمي تدفع تلك الكلمة إلى ما **لا نهاية**. كلمة واحدة لم تُرَ من قبل تحسم الرسالة كلها.`
			}
		},
		{
			title: 'تمهيد لابلاس',
			body: (s) => {
				const w = wordById.get('winner')!;
				return `الحل هو أن نتظاهر بأن كل عدد أكبر قليلًا. يضيف **تمهيد لابلاس (الجمعي)** (Laplace smoothing) القيمة α إلى كل عدد:

\`P(w | class) = (count + α) / (n_class + 2α)\`

(2α في المقام لأن الكلمة قد تكون موجودة أو غائبة.) مع α = ${s.alpha}: P(${AW.winner} | ham) = (0 + ${s.alpha}) / (${N_HAM} + ${2 * s.alpha}) = **${f3(likelihood(w.ham, N_HAM, s.alpha))}**، صغيرة لكنها لم تعد صفرًا.

P(spam) لهذه الرسالة: **${pct(pSpam(s), 1)}**. يسحب التمهيد أيضًا كل أرجحية قليلًا نحو 50%، وهذا أهم ما يكون للكلمات النادرة.`;
			},
			task: { prompt: 'اضبط **α = 1** (القيمة الافتراضية في scikit-learn) وراقب الكلمات الأخرى تستعيد كلمتها.' }
		},
		{
			title: 'الميزات المتصلة: بايز الساذج الغاوسي',
			body: (s) => {
				const m = gnb(s);
				return `الكلمات ميزات نعم/لا. أما للأعداد فيمثّل **NB الغاوسي** (Gaussian NB) كل ميزة داخل كل فئة بـ**منحنى جرسي** له متوسطه وانحرافه المعياري. المنحنيات على الحواف هي هذه المنحنيات الجرسية الملائمة:

- الفئة A: x₁ ~ متوسط ${f2(m.mean[0][0])}، انحراف معياري ${sd(m.var[0][0])}؛ x₂ ~ متوسط ${f2(m.mean[0][1])}، انحراف معياري ${sd(m.var[0][1])}
- الفئة B: x₁ ~ متوسط ${f2(m.mean[1][0])}، انحراف معياري ${sd(m.var[1][0])}؛ x₂ ~ متوسط ${f2(m.mean[1][1])}، انحراف معياري ${sd(m.var[1][1])}

تحت الافتراض الساذج تكون الأرجحية الثنائية الأبعاد حاصل الضرب \`P(x | c) = N(x₁; μ, σ²) · N(x₂; μ, σ²)\`. خطوط تساويها (القطوع الناقصة) تكون دائمًا **موازية للمحاور**. التدريب مجرد 8 متوسطات إضافة إلى الاحتمالات المسبقة للفئتين.`;
			}
		},
		{
			title: 'من المنحنيات الجرسية إلى حد القرار',
			body: (s) => {
				const pb = probeB(s);
				return `لأي نقطة، تحوّل مبرهنة بايز الأرجحيتين والاحتمالين المسبقين إلى احتمال لاحق. يُظهر التظليل P(B | x)، والمنحنى المتصل هو حيث تتساوى احتمالات الفئتين.

الحد **منحنٍ**: الفئة A عريضة في x₁ وضيقة في x₂، والفئة B بالعكس، والتباينات غير المتساوية تعطي حدًا تربيعيًا.

المسبار ◆ له P(B) = **${pct(pb)}**، و P(A) = ${pct(1 - pb)}. دقة التدريب: ${pct(accuracyOf(s))}.`;
			},
			task: { prompt: 'اسحب المسبار ◆ إلى موضع يتردد فيه النموذج: **P(B) بين 35% و65%**.' }
		},
		{
			title: 'حين يضر الافتراض الساذج',
			body: `بيانات جديدة: في الفئتين كلتيهما تكون x₁ و x₂ **مترابطتين** بقوة، فتصبح كل سحابة شريطًا قطريًا. تقع الفئتان جنبًا إلى جنب، ويفصل بينهما خط عبر القطر.`,
			quiz: {
				question: 'كيف ستبدو القطوع الناقصة التي يلائمها NB الغاوسي على هذه البيانات؟',
				options: ['مائلة على طول القطر، مطابقة لكل شريط', 'موازية للمحاور: NB لا يستطيع تمثيل الترابط', 'دوائر تامة'],
				explain: (s) =>
					`يلائم NB كل ميزة على حدة، فلا يرى أبدًا أن x₁ و x₂ تتحركان معًا. قطوعه الناقصة موازية للمحاور وأعرض بكثير من الشرائط، والفئتان متداخلتان كثيرًا في نظره. الدقة: **${pct(accuracyOf(s))}**. توزيع غاوسي بمصفوفة تغاير كاملة (الحد المتقطع) يحقق ${pct(accuracyOf(s, 'qda'))}. وهو النموذج الذي تقوم عليه [خلائط التوزيعات الغاوسية](concept:gmm).`
			}
		},
		{
			title: 'دورك: ساحة التجربة',
			body: `كل شيء مفتوح: بدّل بين مرشح البريد المزعج والعرض الثنائي الأبعاد، وفعّل الكلمات، وغيّر α، واسحب المسبار.

خلاصة:

1. **مبرهنة بايز**: اللاحق ∝ الأرجحية × المسبق، ثم التطبيع ليصبح المجموع 1.
2. **ساذج**: يُفترض أن الميزات مستقلة بمعلومية الفئة، فتُضرب الأرجحيات (وتُجمع لوغاريتماتها).
3. التدريب **عدّ** (أو حساب متوسطات في NB الغاوسي): سريع جدًا، ويعمل مع بيانات قليلة.
4. العدد الصفري يُبطل كل شيء. و**تمهيد لابلاس** (α = 1) يمنع ذلك.
5. الميزات المترابطة تُحسب مرتين. تبقى الترتيبات مفيدة، لكن الاحتمالات تخرج مفرطة الثقة.

بايز الساذج خط أساس قوي وسريع للنصوص. قارنه بـ[الانحدار اللوجستي](concept:logistic-regression)، وتحقق منه بـ[الدقة والاستدعاء](concept:precision-recall-f1).`
		}
	]
};

export default { fr, ar };
