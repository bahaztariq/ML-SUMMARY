/**
 * French and Arabic narration for the random forest lesson (same step order as index.ts).
 */
import type { LessonText } from '../types.ts';
import { pct } from '../_ensembles/memo.ts';
import { arLeaves, arTrees } from '../_ensembles/i18n.ts';
import * as dt from '../decision-tree/tree.ts';
import {
	COMPARE_TREES,
	GALLERY,
	MAX_TREES,
	N_TRAIN,
	bagStats,
	changed,
	correlation,
	disagreement,
	forestAcc,
	meanTreeAcc,
	oobCurve,
	oobVote,
	single,
	singleAcc,
	testCurve,
	train,
	tree,
	treeAcc,
	type RFState
} from './state.ts';

const CLASS = ['A', 'B'];

const galleryRange = (s: RFState) => {
	const accs = Array.from({ length: GALLERY }, (_, t) => treeAcc(s, t));
	return { lo: Math.min(...accs), hi: Math.max(...accs) };
};

export const fr: LessonText<RFState> = {
	title: 'Comment une forêt aléatoire efface le surapprentissage par la moyenne',
	steps: [
		{
			title: 'Un arbre profond, une frontière en dents de scie',
			body: (s) => {
				const a = singleAcc(s);
				const st = dt.stats(single(s));
				return `Ces ${N_TRAIN} points viennent d’une **frontière ondulée** : classe **B** (carrés) sous la courbe, classe **A** (cercles) au-dessus, avec 12 % des étiquettes inversées au hasard.

Un seul [arbre de décision](concept:decision-tree) sans limite de profondeur se divise jusqu’à ce que chaque feuille soit pure : **${st.leaves} feuilles**, profondeur ${st.depth}. Il classe correctement **${pct(a.train)}** des points d’entraînement, mais seulement **${pct(a.test)}** de 600 nouveaux points de test. Les petits îlots autour des points mal étiquetés, c’est l’arbre qui mémorise le bruit. C’est une *variance élevée* : un échantillon légèrement différent donnerait un arbre très différent.`;
			}
		},
		{
			title: 'Bootstrap : chaque arbre a son propre échantillon',
			body: (s) => {
				const b = bagStats(s);
				return `Une forêt aléatoire fait pousser de nombreux arbres, et chacun est entraîné sur un **échantillon bootstrap** : ${N_TRAIN} lignes tirées *avec remise* parmi les ${N_TRAIN} lignes d’entraînement. Certaines lignes sont tirées deux fois ou plus (marqueurs plus gros), d’autres jamais (estompées).

L’arbre **${s.focus + 1}** a vu **${b.unique}** lignes distinctes, dont ${b.twice} plus d’une fois.`;
			},
			quiz: {
				question: `En tirant ${N_TRAIN} lignes avec remise parmi ${N_TRAIN}, combien de lignes chaque arbre ne voit-il jamais, environ ?`,
				options: ['Aucune : chaque ligne est tirée au moins une fois', 'Environ 37 %', 'Environ la moitié'],
				explain: (s) => {
					const b = bagStats(s);
					return `Chaque tirage rate une ligne donnée avec une probabilité (1 − 1/n), donc les n tirages la ratent tous avec une probabilité (1 − 1/n)ⁿ ≈ 1/e ≈ **36,8 %**. L’arbre ${s.focus + 1} n’a jamais vu **${b.out}** lignes (${pct(b.out / b.n)}), désormais cerclées. Ces lignes **hors sac** (*out-of-bag*) serviront plus tard.`;
				}
			}
		},
		{
			title: 'Un sous-ensemble aléatoire de variables à chaque division',
			body: (s) => {
				const t = tree(s, s.focus);
				const st = dt.stats(t);
				return `Deuxième source de hasard : à **chaque division**, l’arbre ne peut chercher que dans un sous-ensemble aléatoire des variables (\`max_features\`). Par défaut, scikit-learn utilise √(nombre de variables) en classification ; avec nos 2 variables, cela fait **une variable, tirée au hasard, par division**. Ainsi, même une division qui serait évidemment meilleure sur x₂ peut devoir se faire sur x₁.

Arbre **${s.focus + 1}** : ${st.leaves} feuilles, profondeur ${st.depth}, exactitude de test **${pct(treeAcc(s, s.focus))}**. Chaque arbre reste profond et surapprend toujours, mais sur son propre échantillon et avec ses propres choix aléatoires.`;
			},
			task: {
				prompt: 'Appuyez sur **Arbre suivant** pour parcourir au moins trois arbres. Leurs frontières sont toutes différentes.'
			}
		},
		{
			title: 'Beaucoup d’arbres, beaucoup d’erreurs différentes',
			body: (s) => {
				const { lo, hi } = galleryRange(s);
				return `Voici les ${GALLERY} premiers arbres côte à côte, chacun dessiné avec les lignes sur lesquelles il a été entraîné. Chaque arbre obtient entre **${pct(lo)}** et **${pct(hi)}** sur le jeu de test. Aucun n’est bon à lui seul.

Mais ils se trompent à *des endroits différents*. Sur **${pct(disagreement(s, GALLERY))}** des points de test, ces ${GALLERY} arbres ne sont pas tous d’accord. Là où un arbre a dessiné un îlot autour d’un point bruité, la plupart des autres ne l’ont pas fait. C’est ce désaccord que le vote exploite.`;
			}
		},
		{
			title: 'Vote à la majorité',
			body: (s) => {
				const b = s.nTrees;
				return `La forêt prédit par **vote à la majorité** : chaque arbre vote pour une classe et la classe qui a le plus de voix l’emporte (scikit-learn fait en réalité la moyenne des probabilités de classe des arbres, ce qui revient presque au même avec des arbres complètement développés). L’ombrage montre la part des arbres qui votent B : forte là où ils sont d’accord, pâle là où ils sont partagés.

Avec **${b} arbre${b > 1 ? 's' : ''}**, la forêt obtient **${pct(forestAcc(s, b))}** sur le jeu de test, alors qu’un arbre seul obtient en moyenne ${pct(meanTreeAcc(s))}. Les îlots que seuls quelques arbres ont dessinés sont mis en minorité, et les marches en dents de scie se fondent en une frontière plus lisse.`;
			},
			task: {
				prompt: 'Faites glisser **n_estimators** jusqu’à au moins **50** arbres et regardez la frontière se lisser.'
			}
		},
		{
			title: 'Ajouter des arbres peut-il faire surapprendre ?',
			body: (s) => {
				const c = testCurve(s, s.curveTo);
				return `Le graphique suit l’exactitude de test à mesure qu’on ajoute des arbres (en pointillé : l’arbre profond seul, ${pct(singleAcc(s).test)}). De 1 à ${s.curveTo} arbres, la forêt est passée de ${pct(c[0])} à **${pct(c[c.length - 1])}**.`;
			},
			quiz: {
				question: `Que se passe-t-il si l’on continue d’ajouter des arbres, jusqu’à ${MAX_TREES} ?`,
				options: [
					'L’exactitude de test continue de grimper vers 100 %',
					'Elle se stabilise : plus d’arbres n’aident plus, mais ne nuisent jamais',
					'Elle se met à baisser : trop d’arbres surapprennent'
				],
				explain: (s) => {
					const c = testCurve(s, MAX_TREES);
					return `De ${pct(c[19])} à 20 arbres à **${pct(c[MAX_TREES - 1])}** à ${MAX_TREES} : la courbe s’aplatit et ne fait qu’osciller. Chaque nouvel arbre est un vote indépendant de plus, donc ajouter des arbres rend seulement la moyenne *plus stable*. Cela ne peut pas créer de nouveau surapprentissage. Le plafond dépend de la qualité des arbres, de leurs différences, et du bruit (12 % d’étiquettes inversées plafonnent ces données à environ 88 %). \`n_estimators\` est donc surtout un compromis vitesse/mémoire.`;
				}
			}
		},
		{
			title: 'Erreur hors sac : un jeu de test gratuit',
			body: (s) => {
				const B = s.nTrees;
				const oob = oobCurve(s, B)[B - 1];
				let pick = '';
				if (s.picked >= 0) {
					const v = oobVote(s, B, s.picked);
					const y = train(s).y[s.picked];
					const verdict =
						v.pred < 0 ? '' : v.pred === y ? ' (correct)' : `, mais son étiquette est ${CLASS[y]} (faux, peut-être une étiquette bruitée)`;
					pick = `\n\nLe point cerclé (classe ${CLASS[y]}) a été laissé de côté par **${v.out} arbres sur ${B}**. Ils votent ${v.a} A / ${v.b} B, donc sa prédiction hors sac est **${v.pred >= 0 ? CLASS[v.pred] : '—'}**${verdict}.`;
				}
				return `Chaque ligne d’entraînement est hors sac pour environ 37 % des arbres. Ne laissez voter **que ces arbres-là** et vous obtenez une prédiction honnête pour une ligne sur laquelle les votants ne se sont jamais entraînés. Faites-le pour chaque ligne et vous avez l’**exactitude hors sac** (\`oob_score=True\` dans scikit-learn), sans mettre de données de côté.

Avec ${B} arbres : exactitude hors sac **${pct(oob)}**, exactitude de test **${pct(forestAcc(s, B))}**. Le graphique montre que les deux courbes se suivent.${pick}`;
			},
			task: {
				prompt: 'Cliquez sur un point d’entraînement pour voir comment votent les arbres qui ne l’ont jamais vu.'
			}
		},
		{
			title: 'Moins de variance qu’un arbre seul',
			body: (s) => {
				const c = changed(s);
				const tail = c
					? `Après le dernier rééchantillonnage, l’arbre seul a changé sa prédiction sur **${pct(c.single)}** de la zone couverte par les données ; la forêt sur seulement **${pct(c.forest)}**.`
					: 'Appuyez sur **Nouvel échantillon d’entraînement** pour tirer un nouveau jeu d’entraînement de la même source.';
				return `La variance, c’est : *à quel point le modèle change-t-il si les données d’entraînement changent ?* À gauche, un arbre profond seul ; à droite, une forêt de ${COMPARE_TREES} arbres, tous deux entraînés sur le même échantillon.

${tail}

Les deux sont faits du même genre d’arbres qui surapprennent. La moyenne annule la part de chaque arbre qui n’est que du bruit, et garde ce qu’ils ont en commun : la vraie frontière. C’est pourquoi une forêt a à peu près le *biais* d’un arbre profond, mais une *variance* bien plus faible (voir le [compromis biais–variance](concept:bias-variance-tradeoff)).`;
			},
			task: {
				prompt: 'Appuyez trois fois sur **Nouvel échantillon d’entraînement**. Quel modèle bouge le plus ?'
			}
		},
		{
			title: 'Pourquoi le hasard compte',
			body: (s) => {
				const rho = correlation(s);
				const B = 100;
				return `Pour B arbres dont les prédictions ont chacune une variance σ² et une corrélation deux à deux ρ, la moyenne a pour variance

\`ρ·σ² + (1 − ρ)·σ²/B\`

Le second terme disparaît quand B grandit, mais pas le premier : **des arbres corrélés ne peuvent pas effacer leurs erreurs par la moyenne**. Le bagging et les variables aléatoires sont là pour faire baisser ρ.

Réglages actuels (bootstrap **${s.bootstrap ? 'activé' : 'désactivé'}**, max_features **${s.maxFeatures === 2 ? 'toutes' : '1'}**) : corrélation entre arbres ρ ≈ **${rho.toFixed(2)}**, arbre moyen **${pct(meanTreeAcc(s))}**, forêt de ${B} **${pct(forestAcc(s, B))}**.`;
			},
			quiz: {
				question: 'Désactivez le bootstrap et laissez chaque division voir toutes les variables. Que devient la forêt ?',
				options: [
					'Une forêt encore meilleure, puisque chaque arbre voit toutes les données',
					'100 copies du même arbre : pas mieux qu’un seul arbre',
					'Un modèle moins profond, qui sous-apprend'
				],
				explain: (s) =>
					`Mêmes données et mêmes choix de variables : chaque arbre fait les **mêmes** divisions gloutonnes. ρ = **${correlation(s).toFixed(2)}**, et la forêt obtient **${pct(forestAcc(s, 100))}**, exactement l’arbre profond seul. Tout le bénéfice vient du fait que les arbres sont *différents*. Essayez les interrupteurs pour voir chaque source de hasard séparément.`
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué. Récapitulatif :

1. Tirer un échantillon bootstrap pour chaque arbre (environ 63 % de lignes distinctes, le reste est hors sac).
2. Faire pousser un arbre profond, en ne cherchant que dans un sous-ensemble aléatoire de variables à chaque division.
3. Prédire par vote à la majorité (ou par la moyenne, en régression).
4. Plus d’arbres ne font jamais surapprendre, ils stabilisent seulement ; le score hors sac estime gratuitement l’exactitude de test.

À essayer : limitez \`max_depth\` et constatez qu’une forêt a moins besoin d’élagage qu’un arbre seul. Mettez \`n_estimators\` à 1 pour retrouver un seul arbre (bootstrapé). Les forêts sont une base solide qui demande peu de réglages ; le [gradient boosting](concept:gradient-boosting) prend l’approche inverse en construisant des arbres peu profonds *les uns après les autres*, chacun corrigeant les erreurs du précédent.`
		}
	]
};

export const ar: LessonText<RFState> = {
	title: 'كيف تُزيل الغابة العشوائية الإفراط في التخصيص بأخذ المتوسط',
	steps: [
		{
			title: 'شجرة عميقة واحدة، وحدود متعرّجة',
			body: (s) => {
				const a = singleAcc(s);
				const st = dt.stats(single(s));
				return `تأتي هذه النقاط الـ${N_TRAIN} من **حدّ متموّج**: الفئة **B** (المربعات) تحت المنحنى، والفئة **A** (الدوائر) فوقه، مع قلب 12% من التسميات عشوائيًا.

[شجرة قرار](concept:decision-tree) واحدة بلا حدّ للعمق تواصل التقسيم حتى تصبح كل ورقة نقية: **${arLeaves(st.leaves)}**، بعمق ${st.depth}. تصيب في **${pct(a.train)}** من نقاط التدريب، لكن في **${pct(a.test)}** فقط من 600 نقطة اختبار جديدة. الجزر الصغيرة حول النقاط الخاطئة التسمية هي الشجرة وهي تحفظ الضجيج. هذا هو *التباين المرتفع* (high variance): عيّنة مختلفة قليلًا ستعطي شجرة مختلفة كثيرًا.`;
			}
		},
		{
			title: 'Bootstrap: لكل شجرة عيّنتها الخاصة',
			body: (s) => {
				const b = bagStats(s);
				return `تُنمّي الغابة العشوائية أشجارًا كثيرة، وتُدرَّب كل واحدة على **عيّنة bootstrap**: ${N_TRAIN} صفًّا تُسحب *مع الإرجاع* من صفوف التدريب الـ${N_TRAIN}. بعض الصفوف يُسحب مرتين أو أكثر (علامات أكبر)، وبعضها لا يُسحب أبدًا (باهتة).

رأت الشجرة **${s.focus + 1}** عدد **${b.unique}** صفًّا مختلفًا، منها ${b.twice} أكثر من مرة.`;
			},
			quiz: {
				question: `عند سحب ${N_TRAIN} صفًّا مع الإرجاع من ${N_TRAIN}، كم صفًّا تقريبًا لا تراه كل شجرة أبدًا؟`,
				options: ['لا شيء: كل صف يُسحب مرة واحدة على الأقل', 'حوالي 37%', 'حوالي النصف'],
				explain: (s) => {
					const b = bagStats(s);
					return `كل سحبة تُخطئ صفًّا معيّنًا باحتمال (1 − 1/n)، لذا تُخطئه السحبات الـn كلها باحتمال (1 − 1/n)ⁿ ≈ 1/e ≈ **36.8%**. الشجرة ${s.focus + 1} لم ترَ **${b.out}** صفًّا (${pct(b.out / b.n)})، وهي الآن محاطة بدوائر. ستفيدنا هذه الصفوف **خارج الكيس** (out-of-bag) لاحقًا.`;
				}
			}
		},
		{
			title: 'مجموعة جزئية عشوائية من الميزات عند كل تقسيم',
			body: (s) => {
				const t = tree(s, s.focus);
				const st = dt.stats(t);
				return `المصدر الثاني للعشوائية: عند **كل تقسيم**، لا يمكن للشجرة البحث إلا في مجموعة جزئية عشوائية من الميزات (\`max_features\`). القيمة الافتراضية في scikit-learn للتصنيف هي √(عدد الميزات)؛ ومع ميزتينا الاثنتين يعني ذلك **ميزة واحدة، تُختار عشوائيًا، لكل تقسيم**. لذا حتى التقسيم الذي يكون أفضل بوضوح على x₂ قد يُجبَر على أن يكون على x₁.

الشجرة **${s.focus + 1}**: ${arLeaves(st.leaves)}، بعمق ${st.depth}، ودقة اختبار **${pct(treeAcc(s, s.focus))}**. كل شجرة لا تزال عميقة ولا تزال تُفرط في التخصيص، لكن على عيّنتها الخاصة وباختياراتها العشوائية الخاصة.`;
			},
			task: {
				prompt: 'اضغط **الشجرة التالية** لتتصفّح ثلاث أشجار على الأقل. حدودها كلها مختلفة.'
			}
		},
		{
			title: 'أشجار كثيرة، وأخطاء مختلفة كثيرة',
			body: (s) => {
				const { lo, hi } = galleryRange(s);
				return `هذه أول ${GALLERY} أشجار جنبًا إلى جنب، كل واحدة مرسومة مع الصفوف التي دُرّبت عليها. تتراوح دقة كل شجرة على مجموعة الاختبار بين **${pct(lo)}** و**${pct(hi)}**. لا واحدة منها جيدة بمفردها.

لكنها تُخطئ في *أماكن مختلفة*. في **${pct(disagreement(s, GALLERY))}** من نقاط الاختبار لا تتفق هذه الأشجار الـ${GALLERY} كلها. حيث رسمت شجرة جزيرة حول نقطة مشوّشة، لم تفعل ذلك معظم الأشجار الأخرى. هذا الاختلاف هو ما يستغله التصويت.`;
			}
		},
		{
			title: 'تصويت الأغلبية',
			body: (s) => {
				const b = s.nTrees;
				return `تتنبأ الغابة عبر **تصويت الأغلبية**: كل شجرة تصوّت لفئة، والفئة صاحبة أكثر الأصوات تفوز (في الواقع يأخذ scikit-learn متوسط احتمالات الفئات من الأشجار، وهو تقريبًا الشيء نفسه مع أشجار مكتملة النمو). يُظهر التظليل نسبة الأشجار التي تصوّت لـB: قوي حيث تتفق، وباهت حيث تنقسم.

مع **${arTrees(b)}** تحقق الغابة **${pct(forestAcc(s, b))}** على مجموعة الاختبار، بينما تحقق الشجرة الواحدة في المتوسط ${pct(meanTreeAcc(s))}. الجزر التي رسمتها أشجار قليلة فقط تُهزم في التصويت، وتذوب الدرجات المتعرّجة في حدّ أكثر نعومة.`;
			},
			task: {
				prompt: 'اسحب **n_estimators** إلى **50** شجرة على الأقل وراقب الحدّ وهو يصبح أنعم.'
			}
		},
		{
			title: 'هل تؤدي إضافة الأشجار إلى الإفراط في التخصيص؟',
			body: (s) => {
				const c = testCurve(s, s.curveTo);
				return `يتتبّع الرسم البياني دقة الاختبار كلما أُضيفت أشجار (المتقطّع: الشجرة العميقة الواحدة، ${pct(singleAcc(s).test)}). من شجرة واحدة إلى ${s.curveTo} شجرة، انتقلت الغابة من ${pct(c[0])} إلى **${pct(c[c.length - 1])}**.`;
			},
			quiz: {
				question: `ماذا يحدث إذا واصلنا إضافة الأشجار حتى ${MAX_TREES}؟`,
				options: [
					'تواصل دقة الاختبار الارتفاع نحو 100%',
					'تستقر: المزيد من الأشجار يتوقف عن المساعدة لكنه لا يضر أبدًا',
					'تبدأ بالانخفاض: كثرة الأشجار تُفرط في التخصيص'
				],
				explain: (s) => {
					const c = testCurve(s, MAX_TREES);
					return `من ${pct(c[19])} عند 20 شجرة إلى **${pct(c[MAX_TREES - 1])}** عند ${MAX_TREES}: يتسطّح المنحنى ويتذبذب فقط. كل شجرة جديدة هي صوت مستقل إضافي، لذا فإضافة الأشجار تجعل المتوسط *أكثر استقرارًا* فحسب، ولا يمكنها إضافة إفراط جديد في التخصيص. السقف تحدده جودة الأشجار ومدى اختلافها، والضجيج (قلب 12% من التسميات يحدّ هذه البيانات عند حوالي 88%). لذا فإن \`n_estimators\` هو في الغالب مقايضة بين السرعة والذاكرة.`;
				}
			}
		},
		{
			title: 'خطأ خارج الكيس: مجموعة اختبار مجانية',
			body: (s) => {
				const B = s.nTrees;
				const oob = oobCurve(s, B)[B - 1];
				let pick = '';
				if (s.picked >= 0) {
					const v = oobVote(s, B, s.picked);
					const y = train(s).y[s.picked];
					const verdict = v.pred < 0 ? '' : v.pred === y ? ' (صحيح)' : `، لكن تسميتها ${CLASS[y]} (خطأ، ربما تسمية مشوّشة)`;
					pick = `\n\nالنقطة المحاطة بدائرة (الفئة ${CLASS[y]}) استُبعدت من **${v.out} من ${B}** شجرة. تصوّت هذه الأشجار ${v.a} A / ${v.b} B، لذا فتنبؤها خارج الكيس هو **${v.pred >= 0 ? CLASS[v.pred] : '—'}**${verdict}.`;
				}
				return `كل صف تدريب يكون خارج الكيس لحوالي 37% من الأشجار. دع **تلك الأشجار فقط** تصوّت عليه، فتحصل على تنبؤ نزيه لصف لم يتدرّب عليه المصوّتون قط. افعل ذلك لكل صف فتحصل على **الدقة خارج الكيس** (\`oob_score=True\` في scikit-learn)، دون حجز أي بيانات.

مع ${arTrees(B)}: الدقة خارج الكيس **${pct(oob)}**، ودقة الاختبار **${pct(forestAcc(s, B))}**. يُظهر الرسم البياني أن المنحنيين يسيران معًا.${pick}`;
			},
			task: {
				prompt: 'انقر على نقطة تدريب لترى كيف تصوّت الأشجار التي لم ترها قط.'
			}
		},
		{
			title: 'تباين أقل من شجرة واحدة',
			body: (s) => {
				const c = changed(s);
				const tail = c
					? `بعد آخر إعادة سحب، غيّرت الشجرة الواحدة تنبؤها على **${pct(c.single)}** من المنطقة التي تغطيها البيانات؛ أما الغابة فعلى **${pct(c.forest)}** فقط.`
					: 'اضغط **عيّنة تدريب جديدة** لسحب مجموعة تدريب جديدة من المصدر نفسه.';
				return `التباين يعني: *كم يتغيّر النموذج إذا تغيّرت بيانات التدريب؟* على اليمين شجرة عميقة واحدة؛ وعلى اليسار غابة من ${COMPARE_TREES} شجرة، وكلاهما مدرّب على العيّنة نفسها.

${tail}

كلاهما مبني من النوع نفسه من الأشجار المفرطة في التخصيص. يُلغي أخذ المتوسط الجزء الذي هو ضجيج في كل شجرة، ويُبقي ما تشترك فيه: الحدّ الحقيقي. لهذا تملك الغابة تقريبًا *انحياز* (bias) شجرة عميقة واحدة لكن *تباينًا* أقل بكثير (انظر [مقايضة الانحياز والتباين](concept:bias-variance-tradeoff)).`;
			},
			task: {
				prompt: 'اضغط **عيّنة تدريب جديدة** ثلاث مرات. أيّ النموذجين يقفز أكثر؟'
			}
		},
		{
			title: 'لماذا تهمّ العشوائية',
			body: (s) => {
				const rho = correlation(s);
				const B = 100;
				return `لعدد B من الأشجار، لتنبؤ كل منها تباين σ² وارتباط ثنائي ρ، يكون تباين المتوسط

\`ρ·σ² + (1 − ρ)·σ²/B\`

يتلاشى الحدّ الثاني كلما كبر B، أما الأول فلا: **الأشجار المترابطة لا تستطيع محو أخطائها بأخذ المتوسط**. وُجد الـbagging والميزات العشوائية لدفع ρ إلى الأسفل.

الإعدادات الحالية (bootstrap **${s.bootstrap ? 'مفعّل' : 'معطّل'}**، max_features **${s.maxFeatures === 2 ? 'الكل' : '1'}**): ارتباط الأشجار ρ ≈ **${rho.toFixed(2)}**، متوسط الشجرة **${pct(meanTreeAcc(s))}**، غابة من ${B} **${pct(forestAcc(s, B))}**.`;
			},
			quiz: {
				question: 'عطّل bootstrap واسمح لكل تقسيم برؤية كل الميزات. ماذا تصبح الغابة؟',
				options: [
					'غابة أفضل، لأن كل شجرة ترى كل البيانات',
					'100 نسخة من الشجرة نفسها: ليست أفضل من شجرة واحدة',
					'نموذجًا أقل عمقًا يعاني من نقص التخصيص'
				],
				explain: (s) =>
					`البيانات نفسها واختيارات الميزات نفسها تعني أن كل شجرة تُجري **التقسيمات الجشعة نفسها**: ρ = **${correlation(s).toFixed(2)}**، وتحقق الغابة **${pct(forestAcc(s, 100))}**، تمامًا كالشجرة العميقة الواحدة. كل الفائدة تأتي من كون الأشجار *مختلفة*. جرّب المفاتيح لترى كل مصدر للعشوائية بمفرده.`
			}
		},
		{
			title: 'دورك: ساحة التجريب',
			body: `كل شيء متاح الآن. للتلخيص:

1. اسحب عيّنة bootstrap لكل شجرة (حوالي 63% صفوف مختلفة، والباقي خارج الكيس).
2. نمِّ شجرة عميقة، مع البحث في مجموعة جزئية عشوائية من الميزات فقط عند كل تقسيم.
3. تنبّأ بتصويت الأغلبية (أو بالمتوسط في الانحدار).
4. المزيد من الأشجار لا يؤدي أبدًا إلى الإفراط في التخصيص، بل يزيد الاستقرار فقط؛ ودرجة خارج الكيس تقدّر دقة الاختبار مجانًا.

جرّب: حدّد \`max_depth\` ولاحظ أن الغابة تحتاج إلى تقليم أقل من الشجرة الواحدة. اضبط \`n_estimators\` على 1 لتعود إلى شجرة واحدة (بعيّنة bootstrap). الغابات خط أساس قوي لا يحتاج إلى ضبط كثير؛ أما [التعزيز التدرّجي](concept:gradient-boosting) (gradient boosting) فيسلك النهج المعاكس، إذ يبني أشجارًا ضحلة *واحدة تلو الأخرى*، كل منها يصحّح أخطاء سابقتها.`
		}
	]
};

export default { fr, ar };
