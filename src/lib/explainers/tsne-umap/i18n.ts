/**
 * French and Arabic narration for the t-SNE & UMAP lesson (same step order as index.ts).
 */
import { fmt } from '#lib/viz/canvas.ts';
import type { LessonText } from '../types.ts';
import { EXAG_ITERS, TSNE_ITERS } from './tsne.ts';
import { effectiveNeighbours, finished, inputRatio, neighbourRow, pcaShare, type TSState } from './state.ts';

const pct = (v: number) => (Number.isFinite(v) ? `${Math.round(v * 100)}%` : '—');

const pctFr = (v: number) => (Number.isFinite(v) ? `${Math.round(v * 100)} %` : '—');

/* ---------------------------------------------------------------- français */

function progressFr(s: TSState) {
	if (s.target === 0) return 'La carte n’est encore qu’un nuage aléatoire. Appuyez sur **Lancer**.';
	if (finished(s)) return `**Terminé :** ${TSNE_ITERS} itérations, KL = **${fmt(s.live.kl, 3)}**. Pour chaque point, ${pctFr(s.live.kept)} de ses 10 plus proches voisins en 3D figurent aussi parmi ses 10 plus proches voisins sur la carte.`;
	if (s.live.iter < EXAG_ITERS) return `Itération **${s.live.iter}** : exagération précoce, KL = ${fmt(s.live.kl, 3)}.`;
	return `Itération **${s.live.iter}**, KL = **${fmt(s.live.kl, 3)}**, en baisse.`;
}

function perplexityNoteFr(p: number) {
	if (p <= 5) return 'Très basse : chaque point ne fait confiance qu’à une poignée de voisins proches, si bien que les clusters se brisent en petits fragments.';
	if (p >= 50) return 'Élevée : chaque voisinage couvre un cluster entier et déborde sur les autres, si bien que les détails internes aux clusters s’aplatissent et que la vue d’ensemble pèse davantage sur la disposition.';
	return 'Une valeur typique (5–50) : les clusters ressortent nettement.';
}

export const fr: LessonText<TSState> = {
	title: 'Comment t-SNE et UMAP dessinent des cartes de voisinage',
	steps: [
		{
			title: 'Des clusters cachés en 3D',
			body: `Chacun de ces 200 points possède trois variables. Les vraies entrées de t-SNE en ont généralement des dizaines à des milliers (embeddings d’images, vecteurs de mots, comptages de gènes). Avec trois, on peut regarder les données brutes et confronter la carte à celles-ci.

L’objectif : dessiner une **carte 2D** où les points voisins dans l’espace d’origine restent voisins sur le papier.

Les couleurs indiquent les vrais groupes. t-SNE ne les voit jamais ; elles ne servent qu’à vérifier son travail.`,
			task: {
				prompt: 'Faites glisser pour faire tourner le nuage et trouvez les cinq clusters. Deux d’entre eux passent facilement inaperçus sous certains angles.'
			}
		},
		{
			title: 'Une ombre linéaire : l’ACP',
			body: `La méthode classique pour passer en 2D est l’[ACP](concept:pca) (analyse en composantes principales) : projeter sur le plan qui conserve le plus de variance. Elle est rapide, donne toujours le même résultat et préserve la géométrie à grande échelle.

Ici, les deux directions de plus grande variance sont pratiquement x₁ et x₂. Les clusters **indigo** et **vert** ne diffèrent que par leur hauteur, x₃.`,
			quiz: {
				question: 'Que deviennent les clusters indigo et vert dans la projection ACP ?',
				options: [
					'Ils restent séparés : l’ACP conserve presque toute la variance',
					'Ils se superposent',
					'Ils disparaissent du graphique'
				],
				explain: () =>
					`L’ACP conserve **${pctFr(pcaShare())}** de la variance et fusionne pourtant deux clusters. L’écart de 1.8 unité le long de x₃ ne représente qu’une petite part de la variance totale, donc la meilleure ombre *plane* l’efface. La variance est une mesure globale : peu lui importe quels voisins se retrouvent mélangés.`
			}
		},
		{
			title: 'Des voisins, pas des distances',
			body: (s) => {
				const r = neighbourRow(s.sel, s.perplexity);
				return `t-SNE commence par demander à chaque point **qui sont ses voisins**. Il centre une gaussienne sur le point i et transforme les distances en probabilités **p(j|i)** : les points proches reçoivent l’essentiel du poids, les points éloignés presque rien. Plus un trait est foncé, plus le poids est grand.

La largeur σᵢ de la gaussienne est réglée séparément pour chaque point afin qu’il ait une **perplexité** fixe, à peu près « le nombre effectif de voisins ». Dans les régions denses, σ rétrécit ; dans les régions clairsemées, il grandit.

Point sélectionné : σ = **${fmt(r.sigma)}**, et **${effectiveNeighbours(s.sel, s.perplexity)}** voisins concentrent 90 % de sa probabilité.`;
			},
			task: {
				prompt: 'Cliquez sur un point d’un cluster **compact**, puis sur un point du large cluster **ambre**. Comparez leurs σ.'
			}
		},
		{
			title: 'Départ aléatoire, puis attirer et repousser',
			body: (s) => `Ensuite, t-SNE place les points au hasard sur une carte 2D et y mesure aussi la similarité, notée **q_ij**. Cette fois, il utilise une courbe en **t de Student** à queue lourde, (1 + d²)⁻¹, pour que des points dissemblables puissent être très éloignés sans grande pénalité. Cela évite que tout s’entasse au centre (le *problème d’encombrement*).

Chaque itération est un pas de [descente de gradient](concept:what-is-gradient-descent) sur **KL(P‖Q)**. Les paires voisines en 3D mais éloignées sur la carte **s’attirent**. Les paires plus proches sur la carte qu’en 3D **se repoussent**. Pendant les ${EXAG_ITERS} premières itérations, les attractions sont multipliées par 12 pour que les clusters s’agglomèrent tôt.

${progressFr(s)}`,
			task: {
				prompt: 'Appuyez sur **Lancer** et regardez les clusters se former.'
			}
		},
		{
			title: 'La perplexité fixe l’échelle',
			body: (s) => `Perplexité = **${s.perplexity}**. ${perplexityNoteFr(s.perplexity)}

Chaque changement recalcule les probabilités de voisinage et relance la carte depuis le même départ aléatoire. ${finished(s) ? `En ce moment, ${pctFr(s.live.kept)} des 10 plus proches voisins de chaque point survivent sur la carte.` : 'Calcul en cours…'}

Il n’existe pas de valeur unique correcte. Essayez-en plusieurs et fiez-vous aux structures qui apparaissent dans toutes. La perplexité doit rester bien inférieure au nombre de points.`,
			task: {
				prompt: 'Essayez une perplexité de **5 ou moins**, puis de **50 ou plus**.'
			}
		},
		{
			title: 'Ne lisez ni les tailles ni les écarts',
			body: (s) => `Une carte terminée à perplexité 30 : cinq clusters nets, avec l’indigo et le vert bien séparés, ce que l’ACP ne parvenait pas à faire.

Il est tentant d’y lire davantage. ${finished(s) ? '' : 'Calcul en cours…'}`,
			quiz: {
				question: 'En 3D, le cluster ambre est environ 4× plus large que le rose. Qu’en est-il sur la carte ?',
				options: ['L’ambre reste environ 4× plus large', 'Ils ont à peu près la même taille', 'L’ambre est coupé en quatre morceaux'],
				explain: (s) =>
					`Comme σ s’adapte à la densité locale, chaque point reçoit à peu près le même nombre de voisins, quelle que soit l’étendue de son cluster : t-SNE dilate les clusters denses et contracte les clusters épars. Rapport des largeurs : **${fmt(inputRatio(), 1)}×** en 3D, **${fmt(s.live.ratio, 1)}×** sur la carte (cercles en pointillés). Les écarts trompent aussi : l’indigo et le vert sont à 1.8 l’un de l’autre en 3D, l’ambre et le cyan à environ 5.3, et pourtant la carte espace les clusters selon sa propre logique. Lisez t-SNE pour savoir **qui est proche de qui**, pas quelle est la taille ni la distance.`
			}
		},
		{
			title: 'Chaque exécution est différente',
			body: (s) => `La fonction de perte de t-SNE a de nombreux minima locaux : un autre départ aléatoire donne donc une autre carte, où les clusters échangent leurs places, tournent ou apparaissent en miroir. Les voisinages restent stables ; la disposition d’ensemble, non. Ceci est l’exécution n° ${s.seed}.

En pratique : fixez \`random_state\` pour des figures reproductibles, utilisez \`init='pca'\` pour des dispositions plus stables, et **n’utilisez pas** les coordonnées comme variables d’un modèle. t-SNE n’a pas de \`transform()\` pour placer de nouveaux points.`,
			task: {
				prompt: 'Appuyez deux ou trois fois sur **Nouveau départ aléatoire** et comparez les cartes.'
			}
		},
		{
			title: 'UMAP : même objectif, plus rapide',
			body: (s) => `UMAP préserve aussi les voisinages, mais les construit autrement :

1. Relier chaque point à ses **k plus proches voisins** (traits gris, n_neighbors = **${s.nNeighbors}**). Chaque arête reçoit un poids flou : 1 pour le voisin le plus proche, décroissant pour les autres.
2. Disposer le graphe par descente de gradient stochastique sur une **entropie croisée** : les arêtes rapprochent leurs extrémités, et quelques non-voisins tirés au hasard sont repoussés (*échantillonnage négatif*).

Seulement k arêtes par point au lieu des n² paires : UMAP passe donc à l’échelle de millions de lignes. Il conserve souvent mieux la disposition globale, et il peut appliquer \`transform()\` à de nouvelles données. \`min_dist\` (0.1 ici) règle à quel point les points peuvent se tasser.`,
			task: {
				prompt: 'Montez **n_neighbors** à 50 ou plus. Le graphe commence à relier les clusters entre eux, si bien que leur placement sur la carte dépend davantage de la structure globale.'
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué. Récapitulatif :

- Les deux méthodes transforment les distances en grande dimension en **similarités de voisinage** et construisent une carte 2D qui les préserve.
- **t-SNE** : p_ij gaussiennes réglées par la perplexité, q_ij de Student sur la carte, descente de gradient sur KL. **UMAP** : graphe k-NN flou, entropie croisée, SGD avec échantillonnage négatif.
- Les **tailles et écarts** des clusters n’ont pas de sens, et le résultat change avec la graine aléatoire.
- Standardisez d’abord les variables et, sur des données très larges, réduisez à ~50 dimensions avec l’ACP. Servez-vous de ces cartes pour explorer ; la sortie d’UMAP peut aussi alimenter un clustering comme [DBSCAN](concept:dbscan).`
		}
	]
};

/* ---------------------------------------------------------------- العربية */

function progressAr(s: TSState) {
	if (s.target === 0) return 'لا تزال الخريطة انتشارًا عشوائيًا للنقاط. اضغط **تشغيل**.';
	if (finished(s)) return `**انتهى** بعد ${TSNE_ITERS} تكرار، KL = **${fmt(s.live.kl, 3)}**. ${pct(s.live.kept)} من أقرب 10 جيران لكل نقطة في الأبعاد الثلاثة هم أيضًا من بين أقرب 10 جيران لها على الخريطة.`;
	if (s.live.iter < EXAG_ITERS) return `التكرار **${s.live.iter}**: مرحلة المبالغة المبكرة (early exaggeration)، KL = ${fmt(s.live.kl, 3)}.`;
	return `التكرار **${s.live.iter}**، وKL = **${fmt(s.live.kl, 3)}** وهي في تناقص.`;
}

function perplexityNoteAr(p: number) {
	if (p <= 5) return 'منخفضة جدًا: لا تثق كل نقطة إلا بحفنة من أقرب جيرانها، فتتشقق العناقيد إلى شظايا صغيرة.';
	if (p >= 50) return 'مرتفعة: يمتد كل جوار على عنقود كامل ويفيض إلى غيره، فتتسطح التفاصيل داخل العناقيد ويزداد تأثير الصورة الكلية في ترتيب الخريطة.';
	return 'قيمة نموذجية (5–50): تظهر العناقيد واضحة.';
}

export const ar: LessonText<TSState> = {
	title: 'كيف يرسم t-SNE وUMAP خرائط الجوار',
	steps: [
		{
			title: 'عناقيد مخفية في ثلاثة أبعاد',
			body: `لكل نقطة من هذه النقاط الـ200 ثلاث ميزات (features). أما المدخلات الحقيقية لـ t-SNE فلها عادةً من العشرات إلى الآلاف (تضمينات الصور، ومتجهات الكلمات، وأعداد الجينات). ثلاث ميزات تتيح لنا النظر إلى البيانات الخام ومقارنة الخريطة بها.

الهدف: رسم **خريطة ثنائية الأبعاد** تبقى فيها النقاط المتجاورة في الفضاء الأصلي متجاورةً على الورق.

تدل الألوان على المجموعات الحقيقية. لا يراها t-SNE أبدًا؛ إنها موجودة فقط لتتحقق أنت من عمله.`,
			task: {
				prompt: 'اسحب لتدوير السحابة وابحث عن العناقيد (clusters) الخمسة كلها. يسهل أن يفوتك اثنان منها من بعض الزوايا.'
			}
		},
		{
			title: 'ظل خطي: تحليل المكونات الرئيسية',
			body: `الطريقة الكلاسيكية للوصول إلى بعدين هي [تحليل المكونات الرئيسية (PCA)](concept:pca): الإسقاط على المستوى المسطح الذي يحتفظ بأكبر قدر من التباين (variance). إنه سريع، ويعطي النتيجة نفسها في كل مرة، ويحافظ على البنية الهندسية واسعة النطاق.

هنا الاتجاهان الأكبر تباينًا هما عمليًا x₁ وx₂. ولا يختلف العنقودان **النيلي** و**الأخضر** إلا في الارتفاع، x₃.`,
			quiz: {
				question: 'ماذا يحدث للعنقودين النيلي والأخضر في صورة PCA؟',
				options: [
					'يبقيان منفصلين: يحتفظ PCA بكل التباين تقريبًا',
					'يقع أحدهما فوق الآخر',
					'يختفيان من الرسم'
				],
				explain: () =>
					`يحتفظ تحليل المكونات الرئيسية (PCA) بـ **${pct(pcaShare())}** من التباين، ومع ذلك يدمج عنقودين. الفجوة البالغة 1.8 وحدة على طول x₃ ليست سوى جزء صغير من التباين الكلي، لذا يتخلص منها أفضل ظل *مسطح*. التباين مقياس شامل: لا يهمه أي الجيران يختلطون.`
			}
		},
		{
			title: 'الجيران لا المسافات',
			body: (s) => {
				const r = neighbourRow(s.sel, s.perplexity);
				return `يبدأ t-SNE بسؤال كل نقطة **من هم جيرانها**. يضع توزيعًا غاوسيًا (Gaussian) مركزه النقطة i ويحوّل المسافات إلى احتمالات **p(j|i)**: تأخذ النقاط القريبة معظم الوزن، ولا تكاد البعيدة تأخذ شيئًا. الخطوط الأغمق تعني وزنًا أكبر.

يُضبط عرض التوزيع σᵢ لكل نقطة على حدة بحيث تكون لها **حيرة (perplexity)** ثابتة، وهي تقريبًا «العدد الفعلي للجيران». في المناطق الكثيفة يصغر σ، وفي المناطق المتناثرة يكبر.

النقطة المحددة: σ = **${fmt(r.sigma)}**، وعدد الجيران الذين يحملون 90% من احتمالها: **${effectiveNeighbours(s.sel, s.perplexity)}**.`;
			},
			task: {
				prompt: 'انقر على نقطة في عنقود **متراص**، ثم على نقطة في العنقود **الكهرماني** الواسع. قارن قيمتي σ لديهما.'
			}
		},
		{
			title: 'بداية عشوائية، ثم جذب ودفع',
			body: (s) => `بعد ذلك يضع t-SNE النقاط عشوائيًا على خريطة ثنائية الأبعاد ويقيس التشابه فيها أيضًا، ويُرمز له بـ **q_ij**. يستخدم هذه المرة منحنى **t لستيودنت (Student-t)** ثقيل الذيل، (1 + d²)⁻¹، بحيث يمكن للنقاط غير المتشابهة أن تتباعد كثيرًا دون عقوبة كبيرة. هذا يمنع تكدّس كل شيء في المنتصف (*مشكلة الازدحام* أو crowding problem).

كل تكرار هو خطوة واحدة من [الانحدار التدرجي (gradient descent)](concept:what-is-gradient-descent) على **KL(P‖Q)**. الأزواج المتجاورة في الأبعاد الثلاثة والمتباعدة على الخريطة **تتجاذب**. والأزواج الأقرب على الخريطة منها في الأبعاد الثلاثة **تتنافر**. خلال التكرارات الـ${EXAG_ITERS} الأولى تُضرب قوى الجذب في 12 كي تتكتل العناقيد مبكرًا.

${progressAr(s)}`,
			task: {
				prompt: 'اضغط **تشغيل** وراقب تشكّل العناقيد.'
			}
		},
		{
			title: 'الحيرة تحدد المقياس',
			body: (s) => `الحيرة (perplexity) = **${s.perplexity}**. ${perplexityNoteAr(s.perplexity)}

كل تغيير يعيد حساب احتمالات الجوار ويعيد تشغيل الخريطة من البداية العشوائية نفسها. ${finished(s) ? `حاليًا يبقى ${pct(s.live.kept)} من أقرب 10 جيران لكل نقطة جيرانًا لها على الخريطة.` : 'جارٍ الحساب…'}

لا توجد قيمة واحدة صحيحة. جرّب عدة قيم وثق بالبنية التي تظهر فيها جميعًا. يجب أن تبقى الحيرة أقل بكثير من عدد النقاط.`,
			task: {
				prompt: 'جرّب حيرةً قيمتها **5 أو أقل**، ثم **50 أو أكثر**.'
			}
		},
		{
			title: 'لا تقرأ الأحجام ولا الفجوات',
			body: (s) => `خريطة مكتملة بحيرة 30: خمسة عناقيد واضحة، مع بقاء النيلي والأخضر منفصلين، وهو ما عجز عنه PCA.

من المغري أن نقرأ في الصورة أكثر من ذلك. ${finished(s) ? '' : 'جارٍ الحساب…'}`,
			quiz: {
				question: 'في الأبعاد الثلاثة، العنقود الكهرماني أعرض من الوردي بنحو 4 مرات. كيف يبدوان على الخريطة؟',
				options: ['يبقى الكهرماني أعرض بنحو 4 مرات', 'يظهران بحجم متقارب تقريبًا', 'ينقسم الكهرماني إلى أربع قطع'],
				explain: (s) =>
					`لأن σ يتكيف مع الكثافة المحلية، تحصل كل نقطة على العدد نفسه تقريبًا من الجيران مهما كان انتشار عنقودها، فيوسّع t-SNE العناقيد الكثيفة ويقلّص المتناثرة. نسبة العرض: **${fmt(inputRatio(), 1)}×** في الأبعاد الثلاثة، و**${fmt(s.live.ratio, 1)}×** على الخريطة (الحلقات المتقطعة). والفجوات مضللة أيضًا: يبعد النيلي عن الأخضر 1.8 في الأبعاد الثلاثة، والكهرماني عن السماوي نحو 5.3، ومع ذلك تباعد الخريطة بين العناقيد وفق منطقها الخاص. اقرأ t-SNE لتعرف **من قريب ممن**، لا مدى الحجم أو البعد.`
			}
		},
		{
			title: 'كل تشغيل مختلف',
			body: (s) => `لدالة الخسارة (loss) في t-SNE قيم صغرى محلية كثيرة، لذا تعطي بداية عشوائية مختلفة خريطة مختلفة: تتبادل العناقيد أماكنها أو تدور أو تنعكس. تبقى الأحياء المجاورة مستقرة؛ أما الترتيب العام فلا. هذا هو التشغيل رقم ${s.seed}.

عمليًا: ثبّت \`random_state\` للحصول على أشكال قابلة للتكرار، واستخدم \`init='pca'\` لترتيبات أكثر ثباتًا، و**لا** تستخدم الإحداثيات ميزاتَ لنموذج. ليس لدى t-SNE دالة \`transform()\` لوضع نقاط جديدة.`,
			task: {
				prompt: 'اضغط **بداية عشوائية جديدة** مرتين أو ثلاثًا وقارن الخرائط.'
			}
		},
		{
			title: 'UMAP: الهدف نفسه، بسرعة أكبر',
			body: (s) => `يحافظ UMAP على الجوار أيضًا، لكنه يبنيه بطريقة مختلفة:

1. يصل كل نقطة بـ **أقرب k جيران** لها (الخطوط الرمادية، n_neighbors = **${s.nNeighbors}**). يحصل كل ضلع على وزن ضبابي (fuzzy): 1 لأقرب جار، ويتناقص للبقية.
2. يرسم المخطط البياني (graph) بالانحدار التدرجي العشوائي (SGD) على **الإنتروبيا المتقاطعة (cross-entropy)**: تجذب الأضلاع طرفيها معًا، وتُدفع بعيدًا بضع نقاط غير مجاورة مختارة عشوائيًا (*أخذ العينات السلبية* أو negative sampling).

لكل نقطة k ضلع فقط بدلًا من كل الأزواج n²، لذا يتوسع إلى ملايين الصفوف. وغالبًا ما يحتفظ بقدر أكبر من الترتيب العام، ويمكنه تطبيق \`transform()\` على بيانات جديدة. يحدد \`min_dist\` (هنا 0.1) مدى التقارب المسموح به بين النقاط.`,
			task: {
				prompt: 'ارفع **n_neighbors** إلى 50 أو أكثر. يبدأ المخطط البياني بربط العناقيد ببعضها، فيصبح موضعها على الخريطة أكثر اعتمادًا على البنية العامة.'
			}
		},
		{
			title: 'دورك: ساحة التجريب',
			body: `كل شيء متاح الآن. للتلخيص:

- تحوّل الطريقتان المسافات في الأبعاد العالية إلى **تشابهات جوار** وترتّبان خريطة ثنائية الأبعاد تحافظ عليها.
- **t-SNE**: احتمالات p_ij غاوسية تضبطها الحيرة (perplexity)، وq_ij بتوزيع t لستيودنت على الخريطة، وانحدار تدرجي على KL. **UMAP**: مخطط k-NN ضبابي، وإنتروبيا متقاطعة (cross-entropy)، وSGD مع أخذ العينات السلبية.
- **أحجام العناقيد والفجوات** بينها لا معنى لها، والنتائج تتغير مع البذرة العشوائية (seed).
- وحّد مقاييس الميزات أولًا، وفي البيانات ذات الأبعاد الكثيرة اختزلها إلى نحو 50 بُعدًا باستخدام PCA. استخدم الخرائط للاستكشاف؛ ويمكن لمخرجات UMAP أيضًا أن تغذي خوارزمية تجميع (clustering) مثل [DBSCAN](concept:dbscan).`
		}
	]
};

export default { fr, ar };
