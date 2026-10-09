/**
 * French and Arabic narration for the LightGBM lesson (same step order as index.ts).
 */
import type { LessonText } from '../types.ts';
import { f2, f3, pct } from '../_ensembles/memo.ts';
import { arLeaves, arRounds } from '../_ensembles/i18n.ts';
import { totalGain } from './lgb.ts';
import {
	BIG_N,
	GOSS_DRAWS,
	MAX_ROUNDS,
	N_TRAIN,
	UNLIMITED,
	bestBinned,
	bestExact,
	binned,
	featName,
	firstTree,
	gossSample,
	leafCurve,
	samplerStats,
	scanOf,
	treeDepth,
	validLoss,
	type LGBState
} from './state.ts';

const TARGET = 0.4;

const picked = (s: LGBState) => {
	const sc = scanOf(s.maxBin, s.feat);
	return s.pickBin >= 0 && s.pickBin < sc.length ? sc[s.pickBin] : null;
};
const depthText = (s: LGBState) => (s.maxDepth >= UNLIMITED ? '−1' : String(s.maxDepth));

export const fr: LessonText<LGBState> = {
	title: 'Ce qui rend LightGBM rapide',
	steps: [
		{
			title: 'Le boosting, conçu pour les grandes données',
			body: `LightGBM exécute la même boucle que toute bibliothèque de [gradient boosting](concept:gradient-boosting) : calculer le gradient et la hessienne de chaque ligne, ajuster un arbre dessus, l’ajouter réduit par le taux d’apprentissage, recommencer.

La partie coûteuse, c’est **la recherche des divisions**. La méthode exacte trie chaque variable et essaie un seuil entre chaque paire de valeurs voisines. Ici, cela fait ${N_TRAIN - 1} candidats par variable et par nœud, ce qui n’est rien. Avec 10 millions de lignes × 200 variables, c’est presque tout le coût de l’entraînement.

La réponse de LightGBM : le **regroupement en histogrammes**, la **croissance feuille par feuille**, **GOSS** (échantillonnage des lignes selon le gradient) et **EFB** (regroupement des variables creuses). Nous allons voir les trois premiers sur ce jeu de données à deux classes.`
		},
		{
			title: 'Regroupement en histogrammes',
			body: (s) => {
				const e = binned(s.maxBin).edges;
				return `Avant l’entraînement, LightGBM répartit chaque variable en au plus \`max_bin\` intervalles (**255** par défaut), avec des bornes placées pour que chaque intervalle contienne à peu près le même nombre de lignes. Dès lors, une division ne peut tomber que sur une **borne d’intervalle**, et chaque ligne est stockée sous forme d’un petit numéro d’intervalle au lieu d’un flottant.

Avec \`max_bin = ${s.maxBin}\` : x₁ a **${e[0].length}** seuils candidats et x₂ **${e[1].length}** (lignes grises), au lieu de ${N_TRAIN - 1} chacune.`;
			},
			quiz: {
				question: 'Avec seulement 16 intervalles par variable, que vaut la meilleure première division par rapport à la recherche exacte ?',
				options: [
					'Beaucoup moins bien : la majeure partie du gain est perdue',
					'Presque aussi bien : à quelques pour cent de la meilleure division exacte',
					'Toujours exactement pareil'
				],
				explain: (s) => {
					const bb = bestBinned(s.maxBin);
					const ex = bestExact();
					return `Meilleure exacte : **${featName(ex.f)} ≤ ${f2(ex.thr)}**, gain ${f2(ex.gain)}. Meilleure sur la grille de ${s.maxBin} intervalles : **${featName(bb.f)} ≤ ${f2(bb.thr)}**, gain ${f2(bb.gain)} (**${pct(bb.gain / ex.gain)}** du gain exact). L’optimum se cale simplement sur la borne la plus proche (ligne en pointillé contre ligne pleine). Le boosting ajoute des centaines d’arbres, donc ces petites pertes par division se diluent, alors que les gains de vitesse et de mémoire sont importants. Moins d’intervalles agissent aussi comme une légère régularisation. Essayez le curseur.`;
				}
			}
		},
		{
			title: 'Des divisions à partir d’histogrammes de gradients',
			body: (s) => {
				const pick = picked(s);
				return `Pour diviser un nœud, LightGBM fait **un seul passage** sur ses lignes et ajoute le gradient et la hessienne de chaque ligne dans son intervalle : c’est un *histogramme de gradients* (barres : la somme de g par intervalle, au-dessus de zéro là où le modèle prédit actuellement trop haut, c’est-à-dire surtout la classe 0). Ensuite, il parcourt les **intervalles**, pas les lignes : G et H à gauche sont des sommes cumulées, donc le gain de chaque borne ne coûte qu’une formule.

Deuxième astuce : l’histogramme d’un enfant est celui du parent moins celui de son frère, donc seul le plus petit enfant est construit à partir des lignes.${pick ? `\n\nBorne choisie **${featName(s.feat)} ≤ ${f2(pick.thr)}** : ${pick.nL} lignes à gauche, ${pick.nR} à droite, gain **${f2(pick.gain)}**.` : ''}`;
			},
			task: {
				prompt: 'Cliquez sur l’histogramme pour essayer des bornes, sur les deux variables. Trouvez la borne au gain le plus élevé.'
			}
		},
		{
			title: 'Croissance feuille par feuille ou niveau par niveau',
			body: (s) => {
				const L = firstTree(s, 'leaf');
				const V = firstTree(s, 'level');
				return `Les deux arbres ont le même budget de **${s.numLeaves} feuilles**. Les numéros indiquent l’ordre des divisions.

- **Niveau par niveau** (le \`grow_policy\` par défaut de XGBoost) : diviser tous les nœuds d’un niveau avant de passer au suivant. Équilibré, profondeur ${treeDepth(V)}.
- **Feuille par feuille** (LightGBM) : toujours diviser la feuille, n’importe où dans l’arbre, dont la meilleure division a le plus grand gain. Déséquilibré, profondeur **${treeDepth(L)}** : il continue d’affiner les régions qui sont encore le plus dans l’erreur.`;
			},
			quiz: {
				question: 'Même nombre de feuilles. Quel arbre réduit le plus la perte d’entraînement ?',
				options: [
					'Niveau par niveau : les arbres équilibrés sont toujours meilleurs',
					'Feuille par feuille : chaque division va là où elle aide le plus',
					'Les deux exactement pareil'
				],
				explain: (s) => {
					const L = firstTree(s, 'leaf');
					const V = firstTree(s, 'level');
					return `Gain total : feuille par feuille **${f2(totalGain(L))}** contre ${f2(totalGain(V))} niveau par niveau. La croissance par niveau dépense des divisions sur des nœuds déjà presque purs ; la croissance par feuille, non. C’est pourquoi LightGBM converge souvent en moins d’arbres. Le revers : avec le même \`num_leaves\`, il fait pousser des arbres **plus profonds** et plus spécifiques, qui peuvent surapprendre.`;
				}
			}
		},
		{
			title: 'num_leaves ou max_depth',
			body: (s) => {
				const v = validLoss(s)[MAX_ROUNDS];
				const c = leafCurve(s);
				return `Dans LightGBM, le principal réglage de complexité est \`num_leaves\` (31 par défaut), pas la profondeur : \`max_depth\` vaut par défaut **−1, sans limite**. Le graphique montre la log-loss de validation après ${MAX_ROUNDS} tours pour chaque \`num_leaves\` sans limite de profondeur : de ${f3(c[0])} avec 2 feuilles jusqu’à ${f3(Math.min(...c))}, puis remontée à ${f3(c[c.length - 1])} quand les arbres commencent à isoler des points bruités.

Garde-fous : garder \`num_leaves\` sous 2^\`max_depth\`, fixer \`max_depth\`, ou augmenter \`min_data_in_leaf\` (20 par défaut). Actuellement : num_leaves ${s.numLeaves}, max_depth ${depthText(s)}, min_data_in_leaf ${s.minData} : log-loss de validation **${f3(v)}**.`;
			},
			task: {
				prompt: `Gardez **num_leaves ≥ 32**, mais utilisez **max_depth** ou **min_data_in_leaf** pour ramener la log-loss de validation à **${TARGET}** ou moins.`
			}
		},
		{
			title: 'GOSS : garder les grands gradients',
			body: (s) => {
				const g = gossSample(s, s.gossDraw);
				const st = samplerStats(s);
				return `Une fois qu’un modèle est correct, la plupart des lignes sont déjà bien prédites : leurs gradients sont minuscules et ne font presque pas bouger les histogrammes. Le **Gradient-based One-Side Sampling** garde la fraction \`top_rate\` (a) des lignes ayant les plus grands |g|, tire au hasard une fraction \`other_rate\` (b) des lignes parmi le reste, et multiplie g et h des lignes tirées par (1 − a)/b pour que les sommes restent sans biais (\`data_sample_strategy="goss"\` dans LightGBM 4).

Voici un jeu de données plus grand (${BIG_N} lignes) après quelques tours. GOSS utilise **${g.rows.length}** lignes (${pct(g.rows.length / BIG_N)}) : ${g.top.length} lignes à grand gradient plus ${g.sampled.length} lignes tirées, pondérées ×${f2(g.amp)}. Sur ${GOSS_DRAWS} tirages, il a retrouvé la division obtenue sur toutes les données **${st.gSame}** fois ; un simple échantillon aléatoire de même taille, seulement ${st.rSame} fois.`;
			},
			task: {
				prompt: 'Appuyez plusieurs fois sur **Nouvel échantillon** et comparez la division GOSS (trait plein) à celle de l’échantillon aléatoire (pointillé).'
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué. Récapitulatif :

1. **Histogrammes** : les variables sont regroupées une seule fois (\`max_bin\`) ; les divisions sont parcourues sur les intervalles, pas sur les lignes.
2. **Croissance feuille par feuille** : diviser d’abord la feuille la plus utile ; la contrôler avec \`num_leaves\`, \`max_depth\`, \`min_data_in_leaf\`.
3. **GOSS** : entraîner chaque arbre sur les lignes à grand gradient plus un échantillon repondéré du reste.
4. **EFB** (non montré) : regrouper en une seule les variables creuses qui ne sont jamais non nulles en même temps.

Ombrage = probabilité prédite. XGBoost propose désormais la même méthode par histogrammes (\`tree_method="hist"\`) et une option feuille par feuille (\`grow_policy="lossguide"\`), donc l’écart est moins grand qu’avant. Pour de nombreuses colonnes catégorielles, voyez [CatBoost](concept:catboost).`
		}
	]
};

export const ar: LessonText<LGBState> = {
	title: 'ما الذي يجعل LightGBM سريعًا',
	steps: [
		{
			title: 'تعزيز مبني للبيانات الضخمة',
			body: `يشغّل LightGBM الحلقة نفسها التي تشغّلها أي مكتبة [تعزيز تدرّجي](concept:gradient-boosting) (gradient boosting): احسب التدرّج والمشتقة الثانية لكل صف، وطابِق عليهما شجرة، وأضِفها مصغّرة بمعدل التعلم، ثم كرّر.

الجزء المكلف هو **إيجاد التقسيمات**. الطريقة الدقيقة ترتّب كل ميزة وتجرّب عتبة بين كل زوج من القيم المتجاورة. هنا يعني ذلك ${N_TRAIN - 1} مرشّحًا لكل ميزة في كل عقدة، وهذا لا شيء. أما مع 10 ملايين صف × 200 ميزة، فهو تقريبًا كامل كلفة التدريب.

جواب LightGBM: **التجميع في مدرّجات تكرارية** (histogram binning)، و**النمو ورقةً بورقة**، و**GOSS** (أخذ عيّنات من الصفوف حسب التدرّج)، و**EFB** (تجميع الميزات المتفرّقة). سنتناول الثلاثة الأولى على هذه البيانات ذات الفئتين.`
		},
		{
			title: 'التجميع في مدرّجات تكرارية',
			body: (s) => {
				const e = binned(s.maxBin).edges;
				return `قبل بدء التدريب، يوزّع LightGBM كل ميزة على \`max_bin\` فئة على الأكثر (افتراضيًا **255**)، مع حدود موضوعة بحيث تضم كل فئة العدد نفسه تقريبًا من الصفوف. ومن ثَمّ لا يمكن للتقسيم أن يقع إلا على **حدّ فئة**، ويُخزَّن كل صف كرقم فئة صغير بدلًا من عدد عشري.

مع \`max_bin = ${s.maxBin}\`: لـx₁ عدد **${e[0].length}** من العتبات المرشّحة ولـx₂ عدد **${e[1].length}** (الخطوط الرمادية)، بدلًا من ${N_TRAIN - 1} لكل منهما.`;
			},
			quiz: {
				question: 'مع 16 فئة فقط لكل ميزة، ما مدى جودة أفضل تقسيم أول مقارنةً بالبحث الدقيق؟',
				options: ['أسوأ بكثير: يضيع معظم الكسب', 'قريب: في حدود بضعة بالمئة من أفضل تقسيم دقيق', 'مطابق تمامًا دائمًا'],
				explain: (s) => {
					const bb = bestBinned(s.maxBin);
					const ex = bestExact();
					return `الأفضل الدقيق: **${featName(ex.f)} ≤ ${f2(ex.thr)}**، الكسب ${f2(ex.gain)}. الأفضل على شبكة الـ${s.maxBin} فئة: **${featName(bb.f)} ≤ ${f2(bb.thr)}**، الكسب ${f2(bb.gain)} (**${pct(bb.gain / ex.gain)}** منه). ينتقل الحل الأمثل ببساطة إلى أقرب حدّ فئة (الخط المتقطّع مقابل المتصل). يضيف التعزيز مئات الأشجار، فتذوب هذه الخسائر الصغيرة في كل تقسيم، بينما يكون التوفير في السرعة والذاكرة كبيرًا. كما أن تقليل الفئات يعمل كتنظيم خفيف. جرّب الشريط.`;
				}
			}
		},
		{
			title: 'تقسيمات من مدرّجات التدرّجات',
			body: (s) => {
				const pick = picked(s);
				return `لتقسيم عقدة، يمرّ LightGBM **مرة واحدة** على صفوفها ويضيف تدرّج كل صف ومشتقته الثانية إلى فئته: هذا هو *مدرّج التدرّجات* (الأعمدة: مجموع g لكل فئة، فوق الصفر حيث يتنبأ النموذج حاليًا بقيمة أعلى من اللازم، أي في الغالب الفئة 0). ثم يمسح **الفئات** لا الصفوف: G وH على اليسار مجاميع تراكمية، فلا يكلّف كسب كل حدّ سوى صيغة واحدة.

حيلة ثانية: مدرّج الابن هو مدرّج الأب ناقص مدرّج أخيه، لذا لا يُبنى من الصفوف إلا الابن الأصغر.${pick ? `\n\nالحدّ المختار **${featName(s.feat)} ≤ ${f2(pick.thr)}**: ${pick.nL} صفًّا على اليسار، و${pick.nR} على اليمين، والكسب **${f2(pick.gain)}**.` : ''}`;
			},
			task: {
				prompt: 'انقر على المدرّج التكراري لتجرّب حدود الفئات، على الميزتين كلتيهما. جِد الحدّ صاحب أعلى كسب.'
			}
		},
		{
			title: 'النمو ورقةً بورقة مقابل مستوًى بمستوى',
			body: (s) => {
				const L = firstTree(s, 'leaf');
				const V = firstTree(s, 'level');
				return `للشجرتين الميزانية نفسها: **${arLeaves(s.numLeaves)}**. تُظهر الأرقام ترتيب التقسيمات.

- **مستوًى بمستوى** (\`grow_policy\` الافتراضي في XGBoost): قسّم كل عقد المستوى قبل الانتقال إلى المستوى التالي. متوازنة، بعمق ${treeDepth(V)}.
- **ورقةً بورقة** (LightGBM): قسّم دائمًا الورقة، أينما كانت في الشجرة، التي يملك أفضل تقسيم لها أكبر كسب. غير متوازنة، بعمق **${treeDepth(L)}**: تواصل تحسين المناطق التي لا تزال الأكثر خطأً.`;
			},
			quiz: {
				question: 'العدد نفسه من الأوراق. أيّ الشجرتين تخفّض خسارة التدريب أكثر؟',
				options: ['مستوًى بمستوى: الأشجار المتوازنة أفضل دائمًا', 'ورقةً بورقة: كل تقسيم يذهب حيث يفيد أكثر', 'كلتاهما متساويتان تمامًا'],
				explain: (s) => {
					const L = firstTree(s, 'leaf');
					const V = firstTree(s, 'level');
					return `الكسب الكلي: ورقةً بورقة **${f2(totalGain(L))}** مقابل ${f2(totalGain(V))} مستوًى بمستوى. النمو حسب المستوى يُنفق تقسيمات على عقد شبه نقية أصلًا؛ أما النمو حسب الورقة فلا. لهذا يتقارب LightGBM غالبًا بأشجار أقل. الوجه الآخر: مع \`num_leaves\` نفسه يُنمّي أشجارًا **أعمق** وأكثر تخصّصًا، وقد تُفرط هذه في التخصيص.`;
				}
			}
		},
		{
			title: 'num_leaves مقابل max_depth',
			body: (s) => {
				const v = validLoss(s)[MAX_ROUNDS];
				const c = leafCurve(s);
				return `في LightGBM، مقبض التعقيد الرئيسي هو \`num_leaves\` (افتراضيًا 31) لا العمق: فقيمة \`max_depth\` الافتراضية **−1، أي بلا حدّ**. يُظهر الرسم البياني log-loss التحقق بعد ${arRounds(MAX_ROUNDS)} لكل قيمة من \`num_leaves\` دون حدّ للعمق: من ${f3(c[0])} عند ورقتين نزولًا إلى ${f3(Math.min(...c))}، ثم صعودًا إلى ${f3(c[c.length - 1])} حين تبدأ الأشجار بعزل نقاط مشوّشة منفردة.

الضوابط: أبقِ \`num_leaves\` أقل من 2^\`max_depth\`، أو حدّد \`max_depth\`، أو ارفع \`min_data_in_leaf\` (افتراضيًا 20). الآن: num_leaves ${s.numLeaves}، max_depth ${depthText(s)}، min_data_in_leaf ${s.minData}: log-loss التحقق **${f3(v)}**.`;
			},
			task: {
				prompt: `أبقِ **num_leaves ≥ 32**، لكن استخدم **max_depth** أو **min_data_in_leaf** لخفض log-loss التحقق إلى **${TARGET}** أو أقل.`
			}
		},
		{
			title: 'GOSS: احتفظ بالتدرّجات الكبيرة',
			body: (s) => {
				const g = gossSample(s, s.gossDraw);
				const st = samplerStats(s);
				return `حين يصبح النموذج جيدًا بما يكفي، تكون معظم الصفوف متنبّأً بها جيدًا: تدرّجاتها ضئيلة ولا تكاد تحرّك أي مدرّج. يحتفظ **Gradient-based One-Side Sampling** بالنسبة \`top_rate\` (a) من الصفوف ذات أكبر |g|، ويسحب عشوائيًا النسبة \`other_rate\` (b) من الصفوف من الباقي، ويضرب g وh للصفوف المسحوبة في (1 − a)/b كي تبقى المجاميع غير منحازة (\`data_sample_strategy="goss"\` في LightGBM 4).

هذه بيانات أكبر (${BIG_N} صف) بعد بضع جولات. يستخدم GOSS **${g.rows.length}** صفًّا (${pct(g.rows.length / BIG_N)}): ${g.top.length} صفًّا ذا تدرّج كبير، إضافة إلى ${g.sampled.length} صفًّا مسحوبًا بوزن ×${f2(g.amp)}. على مدى ${GOSS_DRAWS} سحبة، وجد تقسيم البيانات الكاملة **${st.gSame}** مرة؛ أما عيّنة عشوائية عادية بالحجم نفسه فوجدته ${st.rSame} مرة فقط.`;
			},
			task: {
				prompt: 'اضغط **عيّنة جديدة** بضع مرات، وقارن تقسيم GOSS (خط متصل) بتقسيم العيّنة العشوائية (منقّط).'
			}
		},
		{
			title: 'دورك: ساحة التجريب',
			body: `كل شيء متاح الآن. للتلخيص:

1. **المدرّجات التكرارية**: تُجمَّع الميزات في فئات مرة واحدة (\`max_bin\`)؛ وتُمسح التقسيمات على الفئات لا على الصفوف.
2. **النمو ورقةً بورقة**: قسّم الورقة الأكثر فائدة أولًا؛ وتحكّم فيه بـ\`num_leaves\` و\`max_depth\` و\`min_data_in_leaf\`.
3. **GOSS**: درّب كل شجرة على الصفوف ذات التدرّج الكبير زائد عيّنة مُعاد وزنها من الباقي.
4. **EFB** (غير معروض): اجمع في ميزة واحدة الميزات المتفرّقة التي لا تكون غير صفرية معًا أبدًا.

التظليل = الاحتمال المتوقَّع. يقدّم XGBoost الآن طريقة المدرّجات نفسها (\`tree_method="hist"\`) وخيار النمو ورقةً بورقة (\`grow_policy="lossguide"\`)، لذا صارت الفجوة أصغر مما كانت. وللأعمدة الفئوية الكثيرة، انظر [CatBoost](concept:catboost).`
		}
	]
};

export default { fr, ar };
