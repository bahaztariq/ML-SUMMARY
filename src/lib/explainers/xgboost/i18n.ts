/**
 * French and Arabic narration for the XGBoost lesson (same step order as index.ts).
 */
import type { LessonText } from '../types.ts';
import { f2, f3, sgn } from '../_ensembles/memo.ts';
import { arLeaves, arRounds } from '../_ensembles/i18n.ts';
import { FEATURES } from './xgb.ts';
import {
	HISTORY,
	N_TRAIN,
	P,
	bestRound,
	gbmWeight,
	missingRows,
	roundTree,
	sampleOf,
	sampleSplits,
	split,
	totals,
	train,
	validLoss,
	type XGBState
} from './state.ts';
import { leafWeight, leaves } from '../_ensembles/boost.ts';

const TARGET = 0.48;

const positives = () => train().y.filter((v) => v).length;
const pickedRow = (s: XGBState) => {
	const p = P()[s.picked];
	const y = train().y[s.picked];
	return { p, y };
};
const weights = (s: XGBState) => {
	const c = split(s);
	return { c, wl: leafWeight(c.GL, c.HL, s.lambda), wr: leafWeight(c.GR, c.HR, s.lambda) };
};
const bestSampleFeature = (s: XGBState) => {
	const sp = sampleSplits(s);
	const best = sp.reduce<number>((a, c, f) => (c && (a < 0 || c.gain > sp[a]!.gain) ? f : a), -1);
	return best >= 0 ? FEATURES[best] : '—';
};
const regStats = (s: XGBState) => {
	const start = { lr: 0.3, maxDepth: 4, lambda: 0, gamma: 0, subsample: 1 };
	const v0 = validLoss(start);
	const b0 = bestRound(start);
	const v = validLoss(s);
	const b = bestRound(s);
	return { v0, b0, v, b };
};

export const fr: LessonText<XGBState> = {
	title: 'Ce que XGBoost ajoute au gradient boosting',
	steps: [
		{
			title: 'Même recette, mathématiques plus fines',
			body: () => `XGBoost, c’est du [gradient boosting](concept:gradient-boosting) : des arbres ajoutés un par un, chacun corrigeant l’ensemble obtenu jusque-là. Ce qu’il ajoute : un **objectif régularisé**, des **pas du second ordre (Newton)**, l’**échantillonnage des lignes et des colonnes** et une **gestion intégrée des valeurs manquantes**, plus beaucoup d’ingénierie pour la vitesse.

Notre tâche : prédire une étiquette oui/non (carrés = 1, cercles = 0) à partir de \`x₁\`, avec la **log-loss**. ${N_TRAIN} lignes d’entraînement, dont ${positives()} positives. ${missingRows().length} lignes n’ont aucune valeur de \`x₁\` (la bande *manquant* à gauche). La courbe est la probabilité du modèle après ${HISTORY} tours. Nous allons regarder XGBoost construire le tour ${HISTORY + 1}.`
		},
		{
			title: 'Gradients et hessiennes',
			body: (s) => {
				const t = totals();
				let pick = '';
				if (s.picked >= 0) {
					const { p, y } = pickedRow(s);
					pick = `\n\nLigne choisie : étiquette ${y}, p = ${f3(p)}, donc g = ${f3(p)} − ${y} = **${sgn(p - y, 3)}** et h = ${f3(p)}·${f3(1 - p)} = **${f3(p * (1 - p))}**.`;
				}
				return `Pour chaque ligne, XGBoost calcule la dérivée première **et seconde** de la perte par rapport à la prédiction actuelle (en log-odds). Pour la log-loss, elles sont simples :

- gradient \`g = p − y\` : l’écart vertical entre la courbe et l’étiquette (les traits)
- hessienne \`h = p·(1 − p)\` : la courbure de la perte, maximale quand le modèle hésite (p proche de 0.5), faible quand il est sûr de lui (taille du marqueur)

En sommant sur toutes les lignes : G = ${f2(t.G)}, H = ${f2(t.H)}. Un arbre se construit uniquement à partir de ces deux nombres par ligne.${pick}`;
			},
			task: {
				prompt: 'Cliquez sur un point pour voir son g et son h. Comparez un point proche de p ≈ 0.5 avec un point dont le modèle est sûr.'
			}
		},
		{
			title: 'Les poids des feuilles sont des pas de Newton',
			body: (s) => {
				const { c, wl, wr } = weights(s);
				return `Prenons une division candidate, \`x₁ ≤ ${s.thr.toFixed(2)}\`. La sortie de chaque feuille (son **poids**, en log-odds) a une forme explicite :

\`w = −G / (H + λ)\`

où G et H sont les sommes de g et h sur les lignes de la feuille. C’est un **pas de Newton** sur la perte, au lieu du pas de gradient du gradient boosting classique (le pseudo-résidu moyen, −G/n). λ (\`reg_lambda\`, 1 par défaut) est une **pénalité L2** sur les poids des feuilles.

Ici (λ = ${s.lambda}) : à gauche w = −(${f2(c.GL)})/(${f2(c.HL)} + ${s.lambda}) = **${sgn(wl)}**, à droite w = **${sgn(wr)}**. Le GBM classique utiliserait ${sgn(gbmWeight(c.GL, c.nL))} et ${sgn(gbmWeight(c.GR, c.nR))}.`;
			},
			quiz: {
				question: 'Que deviennent les poids des feuilles si l’on fait passer λ de 1 à 10 ?',
				options: [
					'Ils grandissent : une régularisation plus forte donne des pas plus audacieux',
					'Ils se rapprochent de 0, surtout pour les petites feuilles',
					'Rien : λ ne compte que pour le choix des divisions'
				],
				explain: (s) => {
					const c = split(s);
					return `λ s’ajoute à H au dénominateur, donc chaque poids se rapproche de 0 : désormais **${sgn(leafWeight(c.GL, c.HL, 10))}** et **${sgn(leafWeight(c.GR, c.HR, 10))}**. Une feuille avec peu de lignes a un petit H, donc λ domine et la tire le plus fort. C’est exactement ce que l’on veut : une feuille appuyée sur peu de données ne doit pas faire de grandes affirmations. (\`reg_alpha\` ajoute une pénalité L1 qui peut ramener de petits poids exactement à 0.)`;
				}
			}
		},
		{
			title: 'Noter une division : la formule du gain',
			body: (s) => {
				const c = split(s);
				return `En réinjectant les poids optimaux dans la perte, on obtient pour chaque nœud un **score** G²/(H + λ). Le **gain** d’une division mesure de combien les enfants font mieux que le parent :

\`gain = ½ [ G_L²/(H_L+λ) + G_R²/(H_R+λ) − G²/(H+λ) ] − γ\`

Le panneau le calcule en direct pour **x₁ ≤ ${s.thr.toFixed(2)}** : gain = **${f3(c.gain - s.gamma)}**. Le graphique du dessous applique la même formule à chaque seuil ; c’est exactement ainsi que XGBoost cherche (son \`tree_method="hist"\` par défaut n’essaie que les bornes des intervalles d’histogramme, pour aller plus vite).`;
			},
			task: {
				prompt: 'Faites glisser la ligne de division jusqu’à un seuil dont le gain est à moins de 5 % du meilleur.'
			}
		},
		{
			title: 'γ : chaque division doit se rentabiliser',
			body: (s) => {
				const n = leaves(roundTree(s)).length;
				return `γ (\`gamma\` ou \`min_split_loss\`, 0 par défaut) est un prix fixe par feuille. XGBoost fait pousser l’arbre jusqu’à \`max_depth\`, puis **élague de bas en haut** toute division dont le gain ne dépasse pas γ. Une division faible ne survit donc que si une division forte en dessous rend la branche intéressante.

Voici l’arbre complet du tour ${HISTORY + 1} avec \`max_depth = 3\` (bandes en bas, avec le poids de chaque feuille). Avec γ = **${s.gamma.toFixed(2)}**, il garde **${n} feuille${n === 1 ? '' : 's'}**.`;
			},
			task: {
				prompt: 'Augmentez **γ** jusqu’à ce que l’arbre soit élagué en une seule feuille. Ce γ est le gain de la division racine.'
			}
		},
		{
			title: 'Les valeurs manquantes choisissent un côté',
			body: (s) => {
				const miss = missingRows();
				const pos = miss.filter((i) => train().y[i]).length;
				return `XGBoost n’a pas besoin qu’on remplisse les valeurs manquantes. À chaque division, il essaie d’envoyer **toutes** les lignes à valeur manquante à gauche, puis à droite, note les deux avec la formule du gain, et retient la meilleure comme **direction par défaut** du nœud. À la prédiction, les valeurs manquantes la suivent.

Ici, ${miss.length} lignes n’ont pas de x₁, et ${pos} d’entre elles sont positives. La division est placée sur la meilleure division racine, **x₁ ≤ ${s.thr.toFixed(2)}**.`;
			},
			quiz: {
				question: 'Les lignes sans x₁ sont surtout positives. Où XGBoost va-t-il les envoyer à cette division ?',
				options: [
					'Toujours à gauche : les valeurs manquantes sont traitées comme de très petits nombres',
					'Du côté qui donne le gain le plus élevé',
					'Nulle part : les lignes à valeurs manquantes sont supprimées'
				],
				explain: (s) => {
					const c = split(s);
					return `Manquant → gauche donne ${f3(c.gainMissLeft)} ; manquant → droite donne **${f3(c.gainMissRight)}**. La direction par défaut est donc **${c.missLeft ? 'à gauche' : 'à droite'}**, là où se trouvent les autres positifs. Le fait même que la valeur manque s’est révélé informatif, et l’arbre l’a exploité sans aucune imputation.`;
				}
			}
		},
		{
			title: 'Sous-échantillonnage des lignes et des colonnes',
			body: (s) => {
				const { rows, cols } = sampleOf(s);
				return `Deux réglages empruntés aux [forêts aléatoires](concept:random-forest) font que chaque arbre voit un peu moins de choses, si bien que les arbres se ressemblent moins et collent moins au bruit :

- \`subsample\` : chaque arbre s’entraîne sur une fraction aléatoire des lignes (tirées sans remise)
- \`colsample_bytree\` : chaque arbre ne peut utiliser qu’une fraction aléatoire des colonnes (il existe aussi \`colsample_bylevel\` et \`colsample_bynode\`)

Nos données ont en fait trois variables : x₁, un substitut bruité x₂ et du bruit pur x₃. L’arbre ${s.sampleTree + 1} voit **${rows.length}** lignes et peut utiliser **${cols.map((f) => FEATURES[f]).join(', ')}**, donc sa racine se divise sur **${bestSampleFeature(s)}**.`;
			},
			task: {
				prompt: 'Appuyez sur **Échantillon de l’arbre suivant** jusqu’à obtenir un arbre qui n’a pas le droit d’utiliser x₁. Sur quoi se divise-t-il à la place ?'
			}
		},
		{
			title: 'La régularisation contre le surapprentissage',
			body: (s) => {
				const { v0, b0, v, b } = regStats(s);
				return `Voici maintenant le booster complet : ${s.rounds} tours sur x₁. Avec \`max_depth = 4\`, η = 0.3 et aucune régularisation (λ = γ = 0), la log-loss de validation atteint son minimum au tour ${b0} (${f3(v0[b0])}), puis remonte à ${f3(v0[s.rounds])} à mesure que la courbe poursuit le bruit.

λ réduit les poids des feuilles, γ élague les divisions faibles, un \`max_depth\` ou un η plus petit ralentit l’ajustement. Avec l’arrêt précoce (\`early_stopping_rounds\`), on ne garderait en plus que le meilleur tour.

Réglages actuels : log-loss de validation **${f3(v[s.rounds])}** après ${s.rounds} tours (meilleure : ${f3(v[b])} au tour ${b}).`;
			},
			task: {
				prompt: `Avec λ, γ, max_depth ou η (le nombre de tours reste à 100), faites descendre la log-loss de validation au tour 100 à **${TARGET}** ou moins.`
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué. Récapitulatif de ce que XGBoost ajoute au gradient boosting :

1. Des pas du second ordre : le poids de feuille \`w = −G/(H + λ)\` vient des gradients *et* des hessiennes.
2. Un objectif régularisé : λ réduit les poids, γ fixe le prix de chaque feuille, tous deux dans la formule du gain.
3. Le sous-échantillonnage des lignes et des colonnes pour des arbres plus variés.
4. Une direction par défaut apprise pour les valeurs manquantes.

En coulisses, il regroupe aussi les variables en histogrammes et construit les arbres en parallèle. [LightGBM](concept:lightgbm) pousse plus loin l’idée des histogrammes et fait pousser les arbres feuille par feuille ; [CatBoost](concept:catboost) se concentre sur les variables catégorielles. Réglez η, la profondeur et la régularisation ensemble ([optimisation des hyperparamètres](concept:hyperparameter-tuning)), avec un arrêt précoce sur un jeu de validation.`
		}
	]
};

export const ar: LessonText<XGBState> = {
	title: 'ما الذي يضيفه XGBoost إلى التعزيز التدرّجي',
	steps: [
		{
			title: 'الوصفة نفسها، برياضيات أدق',
			body: () => `XGBoost هو [تعزيز تدرّجي](concept:gradient-boosting) (gradient boosting): أشجار تُضاف واحدة تلو الأخرى، كل منها يصحّح المجموعة حتى تلك اللحظة. ما يضيفه هو **دالة هدف منظَّمة** (regularized objective)، و**خطوات من الرتبة الثانية (نيوتن)**، و**أخذ عيّنات من الصفوف والأعمدة**، و**معالجة مدمجة للقيم المفقودة**، إضافة إلى الكثير من الهندسة لأجل السرعة.

مهمتنا: التنبؤ بتسمية نعم/لا (المربعات = 1، الدوائر = 0) انطلاقًا من \`x₁\`، باستخدام **log-loss**. لدينا ${N_TRAIN} صف تدريب، منها ${positives()} موجبة. ليس لـ${missingRows().length} صفًّا أي قيمة لـ\`x₁\` (شريط *المفقودة* على اليسار). المنحنى هو احتمال النموذج بعد ${arRounds(HISTORY)}. سنشاهد XGBoost وهو يبني الجولة ${HISTORY + 1}.`
		},
		{
			title: 'التدرّجات والمشتقات الثانية',
			body: (s) => {
				const t = totals();
				let pick = '';
				if (s.picked >= 0) {
					const { p, y } = pickedRow(s);
					pick = `\n\nالصف المختار: التسمية ${y}، p = ${f3(p)}، إذن g = ${f3(p)} − ${y} = **${sgn(p - y, 3)}** وh = ${f3(p)}·${f3(1 - p)} = **${f3(p * (1 - p))}**.`;
				}
				return `لكل صف، يحسب XGBoost المشتقة الأولى **والثانية** للخسارة بالنسبة للتنبؤ الحالي (بوحدة log-odds). بالنسبة لـlog-loss فهما بسيطتان:

- التدرّج (gradient) \`g = p − y\`: الفجوة العمودية بين المنحنى والتسمية (الخطوط)
- المشتقة الثانية (hessian) \`h = p·(1 − p)\`: انحناء الخسارة، وهو أكبر ما يكون حين يتردد النموذج (p قريب من 0.5) وصغير حين يكون واثقًا (حجم العلامة)

بالجمع على كل الصفوف: G = ${f2(t.G)}، H = ${f2(t.H)}. تُبنى الشجرة من هذين الرقمين لكل صف لا غير.${pick}`;
			},
			task: {
				prompt: 'انقر على نقطة لترى g وh الخاصين بها. قارن نقطة قريبة من p ≈ 0.5 بنقطة يكون النموذج واثقًا منها.'
			}
		},
		{
			title: 'أوزان الأوراق هي خطوات نيوتن',
			body: (s) => {
				const { c, wl, wr } = weights(s);
				return `خذ تقسيمًا مرشّحًا، \`x₁ ≤ ${s.thr.toFixed(2)}\`. لمُخرَج كل ورقة (**وزنها**، بوحدة log-odds) صيغة مغلقة:

\`w = −G / (H + λ)\`

حيث G وH هما مجموعا g وh على صفوف الورقة. هذه **خطوة نيوتن** واحدة على الخسارة، بدلًا من خطوة التدرّج في التعزيز التدرّجي العادي (متوسط البواقي الزائفة، −G/n). وλ (\`reg_lambda\`، افتراضيًا 1) هي **عقوبة L2** على أوزان الأوراق.

الآن (λ = ${s.lambda}): اليسار w = −(${f2(c.GL)})/(${f2(c.HL)} + ${s.lambda}) = **${sgn(wl)}**، واليمين w = **${sgn(wr)}**. أما GBM العادي فكان سيستخدم ${sgn(gbmWeight(c.GL, c.nL))} و${sgn(gbmWeight(c.GR, c.nR))}.`;
			},
			quiz: {
				question: 'ماذا يحدث لأوزان الأوراق إذا رفعنا λ من 1 إلى 10؟',
				options: ['تكبر: تنظيم أقوى يعني خطوات أجرأ', 'تنكمش نحو 0، وأكثرها الأوراق الصغيرة', 'لا شيء: λ مهمة فقط لاختيار التقسيمات'],
				explain: (s) => {
					const c = split(s);
					return `تُضاف λ إلى H في المقام، لذا ينكمش كل وزن نحو 0: الآن **${sgn(leafWeight(c.GL, c.HL, 10))}** و**${sgn(leafWeight(c.GR, c.HR, 10))}**. الورقة ذات الصفوف القليلة لها H صغيرة، فتطغى λ وتسحبها بأكبر قوة. وهذا بالضبط ما نريده: الأوراق المدعومة ببيانات قليلة لا ينبغي أن تقدّم ادعاءات كبيرة. (يضيف \`reg_alpha\` عقوبة L1 قد تدفع الأوزان الصغيرة إلى 0 تمامًا.)`;
				}
			}
		},
		{
			title: 'تقييم التقسيم: صيغة الكسب',
			body: (s) => {
				const c = split(s);
				return `بإعادة تعويض الأوزان المثلى في الخسارة نحصل لكل عقدة على **درجة** G²/(H + λ). و**كسب** (gain) التقسيم هو مقدار تحسّن الأبناء على الأب:

\`gain = ½ [ G_L²/(H_L+λ) + G_R²/(H_R+λ) − G²/(H+λ) ] − γ\`

تحسبه اللوحة مباشرة لـ**x₁ ≤ ${s.thr.toFixed(2)}**: الكسب = **${f3(c.gain - s.gamma)}**. يطبّق الرسم البياني أدناه الصيغة نفسها على كل عتبة، وهذه بالضبط طريقة بحث XGBoost (إعداده الافتراضي \`tree_method="hist"\` لا يجرّب إلا حدود فئات المدرّج التكراري، ليكون أسرع).`;
			},
			task: {
				prompt: 'اسحب خط التقسيم إلى عتبة يكون كسبها ضمن 5% من أفضل كسب.'
			}
		},
		{
			title: 'γ: على كل تقسيم أن يستحق ثمنه',
			body: (s) => {
				const n = leaves(roundTree(s)).length;
				return `γ (\`gamma\` أو \`min_split_loss\`، افتراضيًا 0) ثمن ثابت لكل ورقة. يُنمّي XGBoost الشجرة حتى \`max_depth\`، ثم **يقلّم من الأسفل إلى الأعلى** كل تقسيم لا يتجاوز كسبه γ. لذا لا ينجو التقسيم الضعيف إلا إذا جعل تقسيمٌ قوي تحته الفرعَ جديرًا بالإبقاء.

هذه الشجرة الكاملة للجولة ${HISTORY + 1} مع \`max_depth = 3\` (أشرطة في الأسفل، مع وزن كل ورقة). عند γ = **${s.gamma.toFixed(2)}** تحتفظ بـ**${arLeaves(n)}**.`;
			},
			task: {
				prompt: 'ارفع **γ** حتى تُقلَّم الشجرة إلى ورقة واحدة. قيمة γ تلك هي كسب تقسيم الجذر.'
			}
		},
		{
			title: 'القيم المفقودة تختار جانبًا',
			body: (s) => {
				const miss = missingRows();
				const pos = miss.filter((i) => train().y[i]).length;
				return `لا يحتاج XGBoost إلى ملء القيم المفقودة. عند كل تقسيم يجرّب إرسال **كل** الصفوف ذات القيمة المفقودة إلى اليسار، ثم إلى اليمين، ويقيّم الحالتين بصيغة الكسب، ويحفظ الأفضل بوصفه **الاتجاه الافتراضي** للعقدة. وعند التنبؤ، تتبعه القيم المفقودة.

هنا ليس لـ${miss.length} صفًّا قيمة x₁، و${pos} منها موجبة. التقسيم مضبوط على أفضل تقسيم للجذر، **x₁ ≤ ${s.thr.toFixed(2)}**.`;
			},
			quiz: {
				question: 'الصفوف التي تنقصها x₁ موجبة في معظمها. إلى أين سيرسلها XGBoost عند هذا التقسيم؟',
				options: [
					'إلى اليسار دائمًا: تُعامَل القيم المفقودة كأعداد صغيرة جدًا',
					'إلى الجانب الذي يعطي كسبًا أعلى',
					'إلى لا مكان: تُحذف الصفوف ذات القيم المفقودة'
				],
				explain: (s) => {
					const c = split(s);
					return `المفقودة → اليسار تعطي ${f3(c.gainMissLeft)}؛ والمفقودة → اليمين تعطي **${f3(c.gainMissRight)}**. إذن الاتجاه الافتراضي هو **${c.missLeft ? 'اليسار' : 'اليمين'}**، حيث توجد بقية الموجبات. تبيّن أن كون القيمة مفقودة هو بحد ذاته معلومة مفيدة، واستغلتها الشجرة دون أي تعويض للقيم (imputation).`;
				}
			}
		},
		{
			title: 'أخذ عيّنات من الصفوف والأعمدة',
			body: (s) => {
				const { rows, cols } = sampleOf(s);
				return `مقبضان مستعاران من [الغابات العشوائية](concept:random-forest) يجعلان كل شجرة ترى أقل قليلًا، فتقلّ الأشجار تشابهًا ويقلّ ميلها لمطابقة الضجيج:

- \`subsample\`: تتدرّب كل شجرة على نسبة عشوائية من الصفوف (تُسحب دون إرجاع)
- \`colsample_bytree\`: لا يمكن لكل شجرة استخدام إلا نسبة عشوائية من الأعمدة (وهناك أيضًا \`colsample_bylevel\` و\`colsample_bynode\`)

لبياناتنا في الواقع ثلاث ميزات: x₁، وبديل مشوّش x₂، وضجيج خالص x₃. ترى الشجرة ${s.sampleTree + 1} عدد **${rows.length}** صفًّا ويمكنها استخدام **${cols.map((f) => FEATURES[f]).join('، ')}**، لذا يُقسَّم جذرها على **${bestSampleFeature(s)}**.`;
			},
			task: {
				prompt: 'اضغط **عيّنة الشجرة التالية** حتى تحصل على شجرة لا يُسمح لها باستخدام x₁. على أي ميزة تُقسَّم بدلًا منها؟'
			}
		},
		{
			title: 'التنظيم في مواجهة الإفراط في التخصيص',
			body: (s) => {
				const { v0, b0, v, b } = regStats(s);
				return `والآن المعزِّز كاملًا: ${arRounds(s.rounds)} على x₁. مع \`max_depth = 4\` وη = 0.3 ودون تنظيم (λ = γ = 0)، يبلغ log-loss التحقق أدناه عند الجولة ${b0} (${f3(v0[b0])}) ثم يرتفع إلى ${f3(v0[s.rounds])} بينما يلاحق المنحنى الضجيج.

λ تقلّص أوزان الأوراق، وγ تقلّم التقسيمات الضعيفة، و\`max_depth\` أو η أصغر يُبطئ المطابقة. ومع الإيقاف المبكر (\`early_stopping_rounds\`) ستحتفظ أيضًا بأفضل جولة فقط.

الإعدادات الحالية: log-loss التحقق **${f3(v[s.rounds])}** بعد ${arRounds(s.rounds)} (الأفضل ${f3(v[b])} عند الجولة ${b}).`;
			},
			task: {
				prompt: `باستخدام λ أو γ أو max_depth أو η (تبقى الجولات عند 100)، اخفض log-loss التحقق عند الجولة 100 إلى **${TARGET}** أو أقل.`
			}
		},
		{
			title: 'دورك: ساحة التجريب',
			body: `كل شيء متاح الآن. تلخيص ما يضيفه XGBoost إلى التعزيز التدرّجي:

1. خطوات من الرتبة الثانية: وزن الورقة \`w = −G/(H + λ)\` من التدرّجات *و*المشتقات الثانية.
2. دالة هدف منظَّمة: λ تقلّص الأوزان، وγ تضع ثمنًا لكل ورقة، وكلاهما داخل صيغة الكسب.
3. أخذ عيّنات من الصفوف والأعمدة لأشجار أكثر تنوعًا.
4. اتجاه افتراضي مُتعلَّم للقيم المفقودة.

وفي الخلفية، يجمّع أيضًا الميزات في مدرّجات تكرارية ويبني الأشجار بالتوازي. يدفع [LightGBM](concept:lightgbm) فكرة المدرّجات أبعد ويُنمّي الأشجار ورقةً بورقة؛ ويركّز [CatBoost](concept:catboost) على الميزات الفئوية. اضبط η والعمق والتنظيم معًا ([ضبط المعاملات الفائقة](concept:hyperparameter-tuning) (hyperparameter tuning))، مع إيقاف مبكر على مجموعة تحقق.`
		}
	]
};

export default { fr, ar };
