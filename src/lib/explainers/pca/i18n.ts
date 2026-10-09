/**
 * French and Arabic narration for the PCA lesson (same step order as index.ts).
 */
import { fmt } from '#lib/viz/canvas.ts';
import type { LessonText } from '../types';
import { angleOf } from './pca';
import {
	bestShare,
	bodyFit,
	corrFit,
	deg,
	pancakeFit,
	pc1Angle,
	pct,
	projVar,
	reconError,
	screenShare,
	totalVar2,
	type PCAState
} from './state';

const C = () => corrFit().cov;
const covText = () => `[[${fmt(C()[0][0])}, ${fmt(C()[0][1])}], [${fmt(C()[1][0])}, ${fmt(C()[1][1])}]]`;
const lam = (k: number) => fmt(corrFit().values[k]);
const r3 = (k: number) => pct(pancakeFit().ratio[k], 1);

const UNIT_FR = { mm: 'taille en millimètres', m: 'taille en mètres', z: 'les deux variables standardisées' } as const;
const UNIT_AR = { mm: 'الطول بالمليمتر', m: 'الطول بالمتر', z: 'المتغيران كلاهما معياريان' } as const;

export const fr: LessonText<PCAState> = {
	title: 'Comment l’ACP trouve les directions les plus informatives',
	steps: [
		{
			title: 'Deux variables, un nuage',
			body: `Chaque point est un échantillon mesuré sur deux variables, **x₁** et **x₂**. Elles sont corrélées : quand x₁ est grand, x₂ a tendance à l’être aussi, donc le nuage forme une ellipse inclinée.

Les deux colonnes se répètent donc en partie. L’[ACP](concept:what-is-dimensionality-reduction) cherche de **nouveaux axes** alignés sur le nuage, de sorte que l’essentiel de l’information se retrouve sur le premier ou les deux premiers, et que le reste puisse être abandonné.

Le ✕ marque la **moyenne** du nuage.`
		},
		{
			title: 'D’abord, centrer les données',
			body: `L’ACP mesure comment les points se dispersent **autour de leur moyenne** ; la première étape consiste donc à soustraire la moyenne de chaque variable : x₁ − x̄₁ et x₂ − x̄₂.

Le nuage glisse jusqu’à ce que le ✕ se pose sur l’origine. Sa forme et sa dispersion ne changent pas du tout. Seule sa position change.

Toutes les directions que nous allons essayer sont des droites **passant par l’origine** : sans centrage, on mesurerait la distance à (0, 0) au lieu de la dispersion.`
		},
		{
			title: 'Projeter sur une direction',
			body: (s) => `Choisissez une direction passant par l’origine (la droite violette) et faites tomber chaque point perpendiculairement dessus. Chaque point devient **un seul nombre**, sa position le long de la droite : z = x · u. Voilà ce que signifie compresser 2 variables en 1.

La barre épaisse couvre ±2 écarts-types de ces nombres. À **${deg(s.angle)}**, leur variance vaut **${fmt(projVar(s))}**, soit **${pct(projVar(s) / totalVar2())}** de la variance totale (${fmt(totalVar2())}).

Plus on garde de variance, plus les différences entre les points survivent à la compression.`,
			task: {
				prompt: 'Faites tourner la droite (glissez sur le graphique ou utilisez le curseur) jusqu’à ce que les projections soient **les plus étalées possible**.'
			}
		},
		{
			title: 'Le gagnant est un vecteur propre',
			body: (s) => `Le graphique ci-dessous trace la variance pour chaque angle (vous êtes à ${deg(s.angle)}). Elle culmine à **${deg(pc1Angle())}** : cette direction est **PC1**, la première composante principale.

Inutile de la chercher à tâtons. PC1 est le **vecteur propre** principal de la matrice de covariance C = ${covText()}, c’est-à-dire C·v = λ·v. Sa valeur propre **λ₁ = ${lam(0)}** est exactement la variance le long de PC1. Voir [algèbre linéaire](concept:linear-algebra) pour un rappel.`,
			quiz: {
				question: 'PC2 est la direction de plus grande variance restante. Où se trouve-t-elle ?',
				options: ['À 45° de PC1', 'À 90° de PC1 (perpendiculaire)', 'N’importe où : une fois PC1 choisie, PC2 est aléatoire'],
				explain: () =>
					`Les composantes principales sont **orthogonales**. En 2-D, il ne reste qu’un choix, à ${deg(angleOf(corrFit().vectors[1]))}, qui est aussi le point le **plus bas** de la courbe : λ₂ = ${lam(1)}. Ensemble, λ₁ + λ₂ = ${fmt(totalVar2())}, la variance totale, donc PC1 seule explique **${pct(corrFit().ratio[0])}**. Comme les nouveaux axes sont perpendiculaires, les nouvelles variables sont **non corrélées**.`
			}
		},
		{
			title: 'Trois variables : trouver le meilleur angle de caméra',
			body: (s) => `Il y a maintenant trois variables. Ces 210 points forment trois groupes situés près d’un plan incliné.

Une image 2-D de données 3-D est une **ombre** : toute dispersion le long de votre ligne de visée est perdue. En ce moment, **${pct(screenShare(s.view))}** de la variance totale est visible à l’écran.

Trouver l’angle de caméra qui conserve le plus de dispersion, c’est exactement ce que fait l’ACP, en n’importe quelle dimension.`,
			task: {
				prompt: () =>
					`Glissez pour faire tourner le nuage jusqu’à ce qu’au moins **${pct(bestShare() - 0.02)}** de la variance soit visible.`
			}
		},
		{
			title: 'Variance expliquée et éboulis des valeurs propres',
			body: () => `L’ACP calcule cet angle directement : les vecteurs propres de la matrice de covariance 3×3 sont **PC1, PC2, PC3**, tous à angle droit. Vous regardez maintenant le long de PC3.

Le **diagramme des éboulis** (scree plot) montre la part de variance de chaque composante : PC1 ${r3(0)}, PC2 ${r3(1)}, PC3 seulement **${r3(2)}**. Garder deux composantes conserve **${pct(pancakeFit().ratio[0] + pancakeFit().ratio[1], 1)}**.

À droite, la position de chaque point le long de PC1 et PC2 : le nouveau jeu de données à deux variables **Z = X·W₂** que vous transmettriez au modèle suivant. Les trois groupes restent intacts.

En pratique, on garde le plus petit nombre de composantes dont la part cumulée dépasse une cible, par ex. \`PCA(n_components=0.95)\`.`
		},
		{
			title: 'Ce que coûte l’abandon d’une composante',
			body: (s) => `Compresser, c’est jeter des composantes. Pour voir ce qui est perdu, on ramène le code de chaque point en 3-D : **x̂ = moyenne + z₁·PC1 + z₂·PC2**.

${
	s.show.recon && s.k < 3
		? `En gardant **${s.k}** composante${s.k > 1 ? 's' : ''} : les traits roses relient chaque point à sa reconstruction, et leur longueur au carré moyenne est l’**erreur de reconstruction ${fmt(reconError(s.k), 3)}**.`
		: 'Avec les 3 composantes conservées, chaque point est reconstruit parfaitement : erreur 0.'
}`,
			quiz: {
				question: 'On ne garde que PC1 et PC2. Quelle sera l’erreur de reconstruction ?',
				options: [
					'Zéro : deux composantes décrivent exactement chaque point',
					'Exactement la variance le long de PC3 (λ₃)',
					'La moitié de la variance totale'
				],
				explain: () =>
					`Chaque point atterrit sur le plan PC1–PC2, et ce qui est perdu, c’est son décalage le long de PC3. L’erreur vaut **${fmt(reconError(2), 3)} = λ₃**. Si on abandonne aussi PC2, elle passe à λ₂ + λ₃ = **${fmt(reconError(1), 3)}**. Variance expliquée et erreur de reconstruction sont les deux faces d’une même pièce : pour un nombre donné de composantes, l’ACP conserve le plus de variance *et* perd le moins, en erreur quadratique.`
			}
		},
		{
			title: 'Mettez d’abord vos variables à l’échelle',
			body: (s) => {
				const f = bodyFit(s.units);
				return `Les vraies variables ont des unités différentes. Voici 200 adultes, **taille** et **poids**, corrélation ≈ 0.7, tracés sur des axes à échelle égale dans les unités actuelles (${UNIT_FR[s.units]}).

${s.show.pc1 ? `PC1 = **${fmt(f.vectors[0][0])}·taille + ${fmt(f.vectors[0][1])}·poids** et elle explique ${pct(f.ratio[0], 1)} de la variance.` : 'L’ACP ne voit que les nombres, pas ce qu’ils signifient.'}

La solution est la [mise à l’échelle des variables](concept:feature-scaling) : standardiser chaque variable (moyenne 0, écart-type 1) avant l’ACP.`;
			},
			quiz: {
				question: 'La taille est en millimètres (écart-type ≈ 90), le poids en kilogrammes (écart-type ≈ 12). Sans mise à l’échelle, où pointera PC1 ?',
				options: ['Presque exactement le long de la taille', 'Presque exactement le long du poids', 'En diagonale, puisque les deux sont corrélées'],
				explain: () =>
					`L’ACP poursuit la variance brute, et la taille en mm a environ 56× la variance du poids en kg (90² contre 12²). PC1 est simplement la taille. Passez en mètres et PC1 bascule vers le poids, alors que rien n’a changé chez les personnes. Une fois standardisée, PC1 est la diagonale ${fmt(bodyFit('z').vectors[0][0])}·taille + ${fmt(bodyFit('z').vectors[0][1])}·poids : un véritable axe de « corpulence globale ».`
			},
			task: {
				prompt: 'Essayez les trois choix d’unités et regardez PC1 sauter.'
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué. Changez de jeu de données, orientez la droite, faites tourner le nuage 3-D et changez le nombre de composantes conservées. Récapitulatif :

1. **Centrer** chaque variable (et généralement la **standardiser**).
2. Calculer la **matrice de covariance**. Ses vecteurs propres sont les directions principales ; ses valeurs propres sont la variance le long de chacune.
3. Trier par valeur propre et garder les k premières (éboulis, ou une cible comme 95 % cumulés).
4. Projeter : **Z = X·W_k**. L’erreur de reconstruction est égale à la somme des valeurs propres abandonnées.

L’ACP ne trouve que des structures **plates** (linéaires). Pour les variétés courbes et les cartes de clusters, voir [t-SNE & UMAP](concept:tsne-umap) ; pour une version non linéaire apprise, voir les [autoencodeurs](concept:autoencoders).`
		}
	]
};

export const ar: LessonText<PCAState> = {
	title: 'كيف يجد تحليل المكونات الرئيسية الاتجاهات الأكثر إفادة',
	steps: [
		{
			title: 'ميزتان، سحابة واحدة',
			body: `كل نقطة هي عيّنة مقيسة على ميزتين (features)، **x₁** و**x₂**. وهما مترابطتان: حين تكون x₁ كبيرة تميل x₂ إلى أن تكون كبيرة أيضًا، لذا تتخذ السحابة شكل قطع ناقص مائل.

هذا يعني أن العمودين يكرّران بعضهما جزئيًا. يبحث [تحليل المكونات الرئيسية (PCA)](concept:what-is-dimensionality-reduction) عن **محاور جديدة** متوافقة مع السحابة، بحيث يتركّز معظم المعلومات في المحور الأول أو المحورين الأولين، ويمكن الاستغناء عن الباقي.

تشير العلامة ✕ إلى **متوسط** السحابة.`
		},
		{
			title: 'أولًا: توسيط البيانات',
			body: `يقيس PCA مدى انتشار النقاط **حول متوسطها**، لذا فالخطوة الأولى هي طرح متوسط كل ميزة: x₁ − x̄₁ و x₂ − x̄₂.

تنزلق السحابة حتى تستقر العلامة ✕ على نقطة الأصل. لا يتغيّر شكلها ولا انتشارها إطلاقًا، بل موضعها فقط.

كل اتجاه سنجرّبه بعد ذلك هو خط **يمرّ بنقطة الأصل**، فبدون التوسيط (centering) سنقيس البعد عن (0, 0) بدلًا من الانتشار.`
		},
		{
			title: 'الإسقاط على اتجاه',
			body: (s) => `اختر اتجاهًا يمرّ بنقطة الأصل (الخط البنفسجي) وأسقِط كل نقطة عموديًا عليه. تصبح كل نقطة **عددًا واحدًا**، هو موضعها على الخط: z = x · u. هذا ما يعنيه ضغط ميزتين في ميزة واحدة.

يمتد الشريط السميك على ±2 من الانحراف المعياري لهذه الأعداد. عند **${deg(s.angle)}** يبلغ تباينها (variance) **${fmt(projVar(s))}**، أي **${pct(projVar(s) / totalVar2())}** من التباين الكلي (${fmt(totalVar2())}).

كلما احتفظنا بتباين أكبر، نجا مزيد من الفروق بين النقاط من عملية الضغط.`,
			task: {
				prompt: 'أدِر الخط (اسحب على الرسم أو استخدم المنزلق) حتى تصبح الإسقاطات **أكثر انتشارًا ما يمكن**.'
			}
		},
		{
			title: 'الفائز متجه ذاتي',
			body: (s) => `يرسم المخطط أدناه التباين لكل زاوية (أنت عند ${deg(s.angle)}). يبلغ ذروته عند **${deg(pc1Angle())}**: هذا الاتجاه هو **PC1**، المكوّن الرئيسي الأول.

لا حاجة للبحث عنه. فـ PC1 هو **المتجه الذاتي** (eigenvector) الأعلى لمصفوفة التغاير C = ${covText()}، أي C·v = λ·v. وقيمته الذاتية **λ₁ = ${lam(0)}** هي بالضبط التباين على طول PC1. راجع [الجبر الخطي](concept:linear-algebra) للتذكير.`,
			quiz: {
				question: 'PC2 هو اتجاه أكبر تباين متبقٍّ. أين يقع؟',
				options: ['بزاوية 45° مع PC1', 'بزاوية 90° مع PC1 (عمودي عليه)', 'في أي مكان: بعد اختيار PC1 يكون PC2 عشوائيًا'],
				explain: () =>
					`المكونات الرئيسية **متعامدة** (orthogonal). في البعدين لا يبقى سوى خيار واحد، عند ${deg(angleOf(corrFit().vectors[1]))}، وهو أيضًا **أدنى** نقطة في المنحنى: λ₂ = ${lam(1)}. ومعًا λ₁ + λ₂ = ${fmt(totalVar2())}، أي التباين الكلي، لذا يفسّر PC1 وحده **${pct(corrFit().ratio[0])}**. ولأن المحاور الجديدة متعامدة، تكون الميزات الجديدة **غير مترابطة**.`
			}
		},
		{
			title: 'ثلاث ميزات: ابحث عن أفضل زاوية للكاميرا',
			body: (s) => `أصبحت لدينا الآن ثلاث ميزات. تشكّل هذه النقاط الـ 210 ثلاث مجموعات قريبة من مستوى مائل.

الصورة ثنائية الأبعاد لبيانات ثلاثية الأبعاد هي **ظلّ**: كل انتشار على امتداد خط نظرك يضيع. الآن، **${pct(screenShare(s.view))}** من التباين الكلي مرئي على الشاشة.

إيجاد زاوية الكاميرا التي تحتفظ بأكبر قدر من الانتشار هو بالضبط ما يفعله PCA في أي عدد من الأبعاد.`,
			task: {
				prompt: () => `اسحب لتدوير السحابة حتى يصبح **${pct(bestShare() - 0.02)}** على الأقل من التباين مرئيًا.`
			}
		},
		{
			title: 'التباين المفسَّر ومخطط الانحدار',
			body: () => `يحسب PCA تلك الزاوية مباشرة: المتجهات الذاتية لمصفوفة التغاير 3×3 هي **PC1 وPC2 وPC3**، وكلها متعامدة. أنت تنظر الآن على امتداد PC3 مباشرة.

يعرض **مخطط الانحدار** (scree plot) حصة كل مكوّن من التباين: PC1 ‏${r3(0)}، PC2 ‏${r3(1)}، وPC3 ‏**${r3(2)}** فقط. الاحتفاظ بمكوّنين يحفظ **${pct(pancakeFit().ratio[0] + pancakeFit().ratio[1], 1)}**.

على اليمين موضع كل نقطة على طول PC1 وPC2: مجموعة البيانات الجديدة ذات الميزتين **Z = X·W₂** التي ستمرّرها إلى النموذج التالي. تبقى المجموعات الثلاث سليمة.

عمليًا، نحتفظ بأصغر عدد من المكونات تتجاوز حصته التراكمية هدفًا معيّنًا، مثل \`PCA(n_components=0.95)\`.`
		},
		{
			title: 'ثمن التخلّي عن مكوّن',
			body: (s) => `الضغط يعني التخلّص من مكونات. لرؤية ما يضيع، نعيد رمز كل نقطة إلى الفضاء ثلاثي الأبعاد: **x̂ = المتوسط + z₁·PC1 + z₂·PC2**.

${
	s.show.recon && s.k < 3
		? `مع الاحتفاظ بـ **${s.k}** ${s.k > 1 ? 'مكوّنات' : 'مكوّن'}: تربط الخطوط الوردية كل نقطة بإعادة بنائها، ومتوسط مربع أطوالها هو **خطأ إعادة البناء (reconstruction error) ${fmt(reconError(s.k), 3)}**.`
		: 'مع الاحتفاظ بالمكونات الثلاثة كلها، يُعاد بناء كل نقطة بشكل تام: الخطأ 0.'
}`,
			quiz: {
				question: 'احتفظ بـ PC1 وPC2 فقط. كم سيكون خطأ إعادة البناء؟',
				options: ['صفر: مكوّنان يصفان كل نقطة بدقة', 'بالضبط التباين على طول PC3 (λ₃)', 'نصف التباين الكلي'],
				explain: () =>
					`تقع كل نقطة على المستوى PC1–PC2، وما يضيع هو إزاحتها على طول PC3. الخطأ يساوي **${fmt(reconError(2), 3)} = λ₃**. وإذا تخلّيت عن PC2 أيضًا يرتفع إلى λ₂ + λ₃ = **${fmt(reconError(1), 3)}**. التباين المفسَّر (explained variance) وخطأ إعادة البناء وجهان لعملة واحدة: لعدد معيّن من المكونات، يحتفظ PCA بأكبر تباين *ويفقد* أقل خطأ تربيعي.`
			}
		},
		{
			title: 'وحّد مقاييس ميزاتك أولًا',
			body: (s) => {
				const f = bodyFit(s.units);
				return `للميزات الحقيقية وحدات مختلفة. هنا 200 شخص بالغ، **الطول** و**الوزن**، بمعامل ارتباط ≈ 0.7، مرسومة على محاور متساوية المقياس بالوحدات الحالية (${UNIT_AR[s.units]}).

${s.show.pc1 ? `PC1 = **${fmt(f.vectors[0][0])}·الطول + ${fmt(f.vectors[0][1])}·الوزن** ويفسّر ${pct(f.ratio[0], 1)} من التباين.` : 'لا يرى PCA إلا الأعداد، لا معناها.'}

الحل هو [توحيد مقاييس الميزات (feature scaling)](concept:feature-scaling): جعل كل ميزة معيارية بمتوسط 0 وانحراف معياري 1 قبل PCA.`;
			},
			quiz: {
				question: 'الطول بالمليمتر (الانحراف المعياري ≈ 90)، والوزن بالكيلوغرام (الانحراف المعياري ≈ 12). بدون توحيد المقاييس، إلى أين سيشير PC1؟',
				options: ['على امتداد الطول تقريبًا', 'على امتداد الوزن تقريبًا', 'قطريًا، لأن الميزتين مترابطتان'],
				explain: () =>
					`يلاحق PCA التباين الخام، والطول بالمليمتر له تباين أكبر بنحو 56 مرة من تباين الوزن بالكيلوغرام (90² مقابل 12²). فـ PC1 هو ببساطة الطول. انتقل إلى الأمتار فينقلب PC1 نحو الوزن، مع أن شيئًا لم يتغيّر في الأشخاص. وبعد التوحيد المعياري يصبح PC1 القطر ${fmt(bodyFit('z').vectors[0][0])}·الطول + ${fmt(bodyFit('z').vectors[0][1])}·الوزن: محور حقيقي لـ«الحجم الإجمالي».`
			},
			task: {
				prompt: 'جرّب خيارات الوحدات الثلاثة وراقب قفزة PC1.'
			}
		},
		{
			title: 'دورك: ساحة التجربة',
			body: `كل شيء متاح الآن. بدّل مجموعات البيانات، ووجّه الخط، وأدِر السحابة ثلاثية الأبعاد، وغيّر عدد المكونات المحتفَظ بها. للتلخيص:

1. **وسّط** كل ميزة (وغالبًا **اجعلها معيارية** أيضًا).
2. احسب **مصفوفة التغاير** (covariance matrix). متجهاتها الذاتية هي الاتجاهات الرئيسية، وقيمها الذاتية هي التباين على طول كل منها.
3. رتّب حسب القيمة الذاتية واحتفظ بأعلى k (مخطط الانحدار، أو هدف مثل 95% تراكمي).
4. أسقِط: **Z = X·W_k**. خطأ إعادة البناء يساوي مجموع القيم الذاتية المُسقطة.

لا يجد PCA إلا البنى **المسطّحة** (الخطية). للمنوّعات المنحنية وخرائط العناقيد راجع [t-SNE وUMAP](concept:tsne-umap)؛ ولنسخة غير خطية متعلَّمة راجع [المُرمِّزات الذاتية (autoencoders)](concept:autoencoders).`
		}
	]
};

export default { fr, ar };
