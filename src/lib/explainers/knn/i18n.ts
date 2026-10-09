/**
 * French and Arabic narration for the k-NN lesson (same step order as index.ts).
 */
import type { LessonText } from '../types.ts';
import { N, TEST, TRAIN, bestK, testAcc, trainAcc, voteAt, type KnnState } from './state.ts';

const pct = (v: number) => `${Math.round(v * 100)}%`;
const name = (c: number) => (c ? 'B' : 'A');
const nA = TRAIN.y.filter((c) => c === 0).length;
const voteText = (s: KnnState, weighted: (a: string, b: string) => string, vs: string) => {
	const [a, b] = voteAt(s).votes;
	return s.weights === 'distance' ? weighted(a.toFixed(1), b.toFixed(1)) : `**${a} A** ${vs} **${b} B**`;
};
const voteFr = (s: KnnState) => voteText(s, (a, b) => `votes pondérés A ${a} contre B ${b}`, 'contre');
const voteAr = (s: KnnState) => voteText(s, (a, b) => `أصوات موزونة A ${a} مقابل B ${b}`, 'مقابل');
const METRIC_NAME = {
	fr: { euclidean: 'Euclidienne', manhattan: 'Manhattan', chebyshev: 'Tchebychev' },
	ar: { euclidean: 'إقليدية', manhattan: 'مانهاتن', chebyshev: 'تشيبيشيف' }
} as const;

const fr: LessonText<KnnState> = {
	title: 'Comment les k plus proches voisins classent en demandant autour d’eux',
	steps: [
		{
			title: 'Demander aux voisins',
			body: (s) => {
				const v = voteAt(s);
				return `Voici **${N} points d’entraînement** issus de deux classes. Pour classer un nouveau point (la requête ◆), k-NN fait la chose la plus simple imaginable : il trouve les **k points d’entraînement les plus proches** et les laisse **voter**.

Ici k = ${s.k}. Les traits relient la requête à ses ${s.k} plus proches voisins, et le cercle s’étend jusqu’au plus éloigné d’entre eux. Le vote donne ${voteFr(s)} : la requête est prédite **${name(v.pred)}**.`;
			},
			task: { prompt: 'Faites glisser la requête ◆ jusqu’à ce que sa classe prédite **bascule**.' }
		},
		{
			title: 'k est le seul vrai bouton',
			body: (s) => {
				const v = voteAt(s);
				return `La même requête peut recevoir des réponses différentes selon le nombre de voisins consultés. Avec k = 1, le point le plus proche décide seul. Un k plus grand interroge une plus grande partie du voisinage.

k = **${s.k}** : ${voteFr(s)}${v.tie ? ', une **égalité**' : ''} → **${name(v.pred)}**.`;
			},
			quiz: {
				question: 'Avec deux classes, pourquoi choisit-on généralement un k impair ?',
				options: ['Un k impair rend la prédiction plus rapide', 'Pour que le vote ne puisse jamais finir à égalité', 'Les valeurs paires de k surapprennent'],
				explain: `Avec un k pair, le vote peut se partager à parts égales. Nous avons déplacé la requête à un endroit où k = 4 donne **2 A contre 2 B**. scikit-learn choisit alors la classe qui vient en premier dans l’ordre de ses étiquettes (ici A), ce qui est arbitraire. Un k impair évite cela avec deux classes ; pondérer les votes par la distance est une autre solution.`
			}
		},
		{
			title: 'Pas d’entraînement, juste de la mémoire',
			body: (s) => `Que fait \`fit()\` pour k-NN ? Il **stocke le jeu d’entraînement**, rien de plus. C’est pourquoi on dit que k-NN est un apprenant **paresseux**.

Tout le travail a lieu au moment de la prédiction. Pour chaque requête : calculer la distance aux **${N}** points stockés (les traits pâles), les trier, garder les ${s.k} plus petites. Le coût croît avec le nombre de points stockés × le nombre de variables, pour chaque prédiction. Les gros jeux de données nécessitent des arbres KD ou des index de plus proches voisins approximatifs.`
		},
		{
			title: 'La frontière de décision pour k = 1',
			body: (s) => `Colorions maintenant chaque endroit du plan selon ce que k-NN y prédirait. Avec **k = 1**, chaque point d’entraînement revendique la zone qui lui est la plus proche.

La frontière est déchiquetée, et chaque point mal étiqueté obtient son propre îlot. L’exactitude d’entraînement vaut **${pct(trainAcc(s))}** par construction : chaque point d’entraînement est son propre plus proche voisin. Sur ${TEST.X.length} nouveaux points, l’exactitude est de **${pct(testAcc(s))}**.

C’est un biais faible et une variance élevée : la frontière poursuit le bruit.`
		},
		{
			title: 'Un k plus grand lisse la frontière',
			body: (s) =>
				s.k === N
					? `Maintenant **k = ${N}** : tout le jeu d’entraînement vote pour chaque requête, si bien que chaque requête reçoit la même réponse et qu’il ne reste plus de frontière. Exactitude d’entraînement ${pct(trainAcc(s))}, exactitude sur de nouveaux points **${pct(testAcc(s))}**.`
					: `Avec **k = ${s.k}**, chaque prédiction fait la moyenne sur plus de voisins. Les points bruités isolés sont mis en minorité et la frontière devient plus lisse.

Exactitude d’entraînement ${pct(trainAcc(s))}, exactitude sur de nouveaux points **${pct(testAcc(s))}**.`,
			quiz: {
				question: `Que prédit k-NN avec k = ${N}, c’est-à-dire tous les points d’entraînement ?`,
				options: ['La classe majoritaire partout', 'La même frontière qu’avec k = 1', 'Une frontière rectiligne'],
				explain: (s) =>
					`Chaque requête a désormais les mêmes ${N} voisins : ${nA} A contre ${N - nA} B, donc **A l’emporte partout**. L’exactitude sur de nouveaux points tombe à ${pct(testAcc(s))}, pas mieux que de toujours deviner la classe la plus fréquente. Un k trop grand **sous-apprend**.`
			}
		},
		{
			title: 'Trouver le juste milieu',
			body: (s) => {
				const b = bestK(s);
				return `Le graphique montre l’exactitude d’entraînement et de test pour chaque k. Un petit k surapprend (exactitude d’entraînement élevée, test plus bas) ; un grand k sous-apprend (les deux baissent). C’est le [compromis biais-variance](concept:bias-variance-tradeoff) en un seul curseur.

k = **${s.k}** : entraînement ${pct(trainAcc(s))}, test **${pct(testAcc(s))}**. Le meilleur score de test ici est ${pct(b.acc)} pour k = ${b.k}. Sur de vraies données, on n’a pas les étiquettes de test : on choisit k par [validation croisée](concept:cross-validation).`;
			},
			task: { prompt: 'Déplacez k (curseur ou clic sur le graphique) vers une valeur à **1 point** au plus de la meilleure exactitude de test.' }
		},
		{
			title: 'Que veut dire « le plus proche » ?',
			body: (s) => {
				const f: Record<string, string> = {
					euclidean: '`√(Δx₁² + Δx₂²)` : la distance en ligne droite ; les points à égale distance forment un **cercle**',
					manhattan: '`|Δx₁| + |Δx₂|` : la distance en marchant le long d’une grille ; les points à égale distance forment un **losange**',
					chebyshev: '`max(|Δx₁|, |Δx₂|)` : la plus grande différence isolée ; les points à égale distance forment un **carré**'
				};
				return `« Le plus proche » dépend de la façon de mesurer la distance. La forme autour de la requête montre tous les points situés à la même distance que le k-ième voisin :

**${METRIC_NAME.fr[s.metric]}** : ${f[s.metric]}.

Des métriques différentes peuvent choisir des voisins différents, mais en faible dimension les prédictions sont généralement proches. Ici, l’exactitude de test pour k = ${s.k} est de **${pct(testAcc(s))}**. La distance cosinus est courante pour le texte et les [embeddings](concept:embeddings).`;
			},
			task: { prompt: 'Essayez **Manhattan** et **Tchebychev** et regardez le voisinage changer de forme.' }
		},
		{
			title: 'Pourquoi la mise à l’échelle compte',
			body: (s) => {
				const v = voteAt(s);
				const now =
					s.scaleY === 1
						? `Pour l’instant, les deux variables comptent autant (x₂ × 1).`
						: `x₂ est maintenant multipliée par **${s.scaleY}** avant le calcul de la distance. Le graphique garde les unités d’origine pour qu’on voie encore la forme, d’où le voisinage écrasé : un petit écart vertical coûte désormais autant qu’un grand écart horizontal.`;
				return `k-NN additionne des différences brutes : une variable aux **nombres plus grands compte davantage**. Or les unités sont arbitraires : la même x₂ mesurée en centimètres plutôt qu’en mètres aurait des valeurs 100 fois plus grandes.

${now}

Vote : ${voteFr(s)} → **${name(v.pred)}**. Exactitude sur de nouveaux points **${pct(testAcc(s))}**.`;
			},
			quiz: {
				question: 'Multipliez x₂ par 10 (un changement d’unité). Qu’arrive-t-il aux voisins ?',
				options: [
					'Rien : mêmes points, mêmes voisins',
					'x₂ domine : les voisins sont choisis presque uniquement selon x₂',
					'x₁ domine, car elle est maintenant relativement plus petite'
				],
				explain: (s) =>
					`Les différences verticales sont maintenant 10 fois plus grandes : les points « les plus proches » sont simplement ceux à une hauteur similaire. La frontière se transforme en bandes horizontales et l’exactitude sur de nouveaux points chute de ${pct(testAcc({ ...s, scaleY: 1 }))} à **${pct(testAcc({ ...s, scaleY: 10 }))}**. La solution : [mettre les variables à l’échelle](concept:feature-scaling) (par exemple avec StandardScaler) pour qu’elles aient une dispersion comparable.`
			},
			task: { prompt: 'Après avoir répondu, appuyez sur **Standardiser** pour redonner la même échelle aux deux variables.' }
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué : déplacez la requête, changez k, la métrique, la pondération des votes et l’échelle de x₂.

Récapitulatif :

1. **Entraîner = stocker les données.** La prédiction mesure la distance à chaque point stocké.
2. Les **k plus proches** voisins votent (éventuellement pondérés par 1/distance).
3. Un **petit k** donne une frontière déchiquetée, en surapprentissage ; un **grand k** une frontière lisse qui finit par ignorer les données. Réglez k par validation croisée ; prenez un k impair pour deux classes.
4. **Mettez vos variables à l’échelle** : k-NN utilise des distances brutes.
5. En grande dimension, tous les points sont à peu près aussi éloignés les uns des autres, et « le plus proche » ne veut plus dire grand-chose : c’est le [fléau de la dimension](concept:curse-of-dimensionality).

La même idée de voisinage sert aussi à compléter des valeurs manquantes : voir [l’imputation KNN](concept:knn-imputer).`
		}
	]
};

const ar: LessonText<KnnState> = {
	title: 'كيف يصنّف أقرب k جيران بسؤال من حوله',
	steps: [
		{
			title: 'اسأل الجيران',
			body: (s) => {
				const v = voteAt(s);
				return `إليك **${N} نقطة تدريب** من فئتين. لتصنيف نقطة جديدة (نقطة الاستعلام ◆)، يفعل k-NN (أقرب k جيران) أبسط شيء يمكن تخيله: يجد **أقرب k نقاط تدريب إليها** ويتركها **تصوّت**.

هنا k = ${s.k}. تصل الخطوط بين الاستعلام وأقرب ${s.k} جيران له، وتمتد الدائرة حتى أبعدهم. نتيجة التصويت ${voteAr(s)}، لذا يُتنبأ بأن الاستعلام من **${name(v.pred)}**.`;
			},
			task: { prompt: 'اسحب نقطة الاستعلام ◆ حتى **تنقلب** فئتها المتنبأ بها.' }
		},
		{
			title: 'k هو المقبض الحقيقي الوحيد',
			body: (s) => {
				const v = voteAt(s);
				return `قد يحصل الاستعلام نفسه على إجابات مختلفة حسب عدد الجيران الذين تسألهم. مع k = 1 تقرر أقرب نقطة وحدها. وقيمة k الأكبر تسأل جزءًا أكبر من الجوار.

k = **${s.k}**: ${voteAr(s)}${v.tie ? '، أي **تعادل**' : ''}، والنتيجة **${name(v.pred)}**.`;
			},
			quiz: {
				question: 'مع فئتين، لماذا يختار الناس عادةً قيمة k فردية؟',
				options: ['k الفردية تجعل التنبؤ أسرع', 'حتى لا ينتهي التصويت بالتعادل أبدًا', 'القيم الزوجية لـ k تفرط في التخصيص'],
				explain: `مع k زوجية قد ينقسم التصويت بالتساوي. نقلنا الاستعلام إلى موضع تعطي فيه k = 4 النتيجة **2 A مقابل 2 B**. عندها تختار scikit-learn الفئة التي تأتي أولًا في ترتيب تسمياتها (هنا A)، وهذا اعتباطي. k الفردية تتجنب ذلك مع فئتين؛ ووزن الأصوات حسب المسافة مخرج آخر.`
			}
		},
		{
			title: 'لا تدريب، مجرد ذاكرة',
			body: (s) => `ماذا تفعل \`fit()\` في k-NN؟ إنها **تخزّن مجموعة التدريب** لا أكثر. لهذا يُسمى k-NN متعلمًا **كسولًا** (lazy learner).

كل العمل يحدث وقت التنبؤ. لكل استعلام: احسب المسافة إلى **جميع النقاط المخزنة الـ${N}** (الخطوط الباهتة)، ورتّبها، واحتفظ بأصغر ${s.k}. تنمو التكلفة مع عدد النقاط المخزنة × عدد الميزات، لكل تنبؤ على حدة. تحتاج مجموعات البيانات الكبيرة إلى أشجار KD أو فهارس تقريبية لأقرب الجيران.`
		},
		{
			title: 'حد القرار عند k = 1',
			body: (s) => `لنلوّن الآن كل موضع في المستوى بما سيتنبأ به k-NN هناك. مع **k = 1** تستحوذ كل نقطة تدريب على المنطقة الأقرب إليها.

الحد مسنّن، وكل نقطة ذات تسمية خاطئة تحصل على جزيرتها الخاصة. دقة التدريب **${pct(trainAcc(s))}** بحكم البناء: كل نقطة تدريب هي أقرب جار لنفسها. وعلى ${TEST.X.length} نقطة جديدة تبلغ الدقة **${pct(testAcc(s))}**.

هذا انحياز (bias) منخفض وتباين (variance) مرتفع: الحد يلاحق الضجيج.`
		},
		{
			title: 'k أكبر تنعّم الحد',
			body: (s) =>
				s.k === N
					? `الآن **k = ${N}**: تصوّت مجموعة التدريب كلها على كل استعلام، فيحصل كل استعلام على الإجابة نفسها ولا يبقى أي حد. دقة التدريب ${pct(trainAcc(s))}، والدقة على النقاط الجديدة **${pct(testAcc(s))}**.`
					: `مع **k = ${s.k}** يأخذ كل تنبؤ متوسطًا على عدد أكبر من الجيران. تُغلب النقاط المشوشة المعزولة في التصويت ويصبح الحد أنعم.

دقة التدريب ${pct(trainAcc(s))}، والدقة على النقاط الجديدة **${pct(testAcc(s))}**.`,
			quiz: {
				question: `بماذا يتنبأ k-NN مع k = ${N}، أي كل نقاط التدريب؟`,
				options: ['فئة الأغلبية في كل مكان', 'الحد نفسه الذي عند k = 1', 'حد على شكل خط مستقيم'],
				explain: (s) =>
					`صار لكل استعلام الجيران الـ${N} أنفسهم: ${nA} من A مقابل ${N - nA} من B، لذا **تفوز A في كل مكان**. تنخفض الدقة على النقاط الجديدة إلى ${pct(testAcc(s))}، وهذا ليس أفضل من تخمين الفئة الأكثر شيوعًا دائمًا. قيمة k الكبيرة جدًا تؤدي إلى **نقص التخصيص** (underfitting).`
			}
		},
		{
			title: 'إيجاد النقطة المثلى',
			body: (s) => {
				const b = bestK(s);
				return `يُظهر الرسم دقة التدريب والاختبار لكل قيمة k. القيمة الصغيرة تفرط في التخصيص (دقة تدريب عالية واختبار أقل)، والكبيرة تنقص التخصيص (كلاهما ينخفض). هذه هي [المقايضة بين الانحياز والتباين](concept:bias-variance-tradeoff) في منزلق واحد.

k = **${s.k}**: التدريب ${pct(trainAcc(s))}، والاختبار **${pct(testAcc(s))}**. أفضل نتيجة اختبار هنا ${pct(b.acc)} عند k = ${b.k}. في البيانات الحقيقية لا تملك تسميات الاختبار، لذا تختار k بـ[التحقق المتقاطع](concept:cross-validation).`;
			},
			task: { prompt: 'حرّك k (بالمنزلق أو بالنقر على الرسم) إلى قيمة تبعد **نقطة مئوية واحدة** على الأكثر عن أفضل دقة اختبار.' }
		},
		{
			title: 'ماذا تعني «الأقرب»؟',
			body: (s) => {
				const f: Record<string, string> = {
					euclidean: '`√(Δx₁² + Δx₂²)`: المسافة في خط مستقيم؛ النقاط المتساوية البعد تشكّل **دائرة**',
					manhattan: '`|Δx₁| + |Δx₂|`: المسافة مشيًا على شبكة؛ النقاط المتساوية البعد تشكّل **معيّنًا**',
					chebyshev: '`max(|Δx₁|, |Δx₂|)`: أكبر فرق منفرد؛ النقاط المتساوية البعد تشكّل **مربعًا**'
				};
				return `«الأقرب» يعتمد على طريقة قياس المسافة. يُظهر الشكل حول الاستعلام كل النقاط التي تبعد المسافة نفسها التي يبعدها الجار رقم k:

**${METRIC_NAME.ar[s.metric]}**: ${f[s.metric]}.

قد تختار المقاييس المختلفة جيرانًا مختلفين، لكن التنبؤات في البيانات القليلة الأبعاد متقاربة عادةً. هنا، دقة الاختبار عند k = ${s.k} هي **${pct(testAcc(s))}**. مسافة جيب التمام (cosine) شائعة للنصوص و[التضمينات](concept:embeddings) (embeddings).`;
			},
			task: { prompt: 'جرّب **مانهاتن** و**تشيبيشيف** وراقب الجوار يغيّر شكله.' }
		},
		{
			title: 'لماذا يهم توحيد مقاييس الميزات',
			body: (s) => {
				const v = voteAt(s);
				const now =
					s.scaleY === 1
						? `حاليًا تُحسب الميزتان بالتساوي (x₂ × 1).`
						: `تُضرب x₂ الآن في **${s.scaleY}** قبل قياس المسافة. يحتفظ الرسم بالوحدات الأصلية لتظل ترى الشكل، ولهذا يبدو الجوار مضغوطًا: فجوة رأسية صغيرة تكلّف الآن بقدر فجوة أفقية كبيرة.`;
				return `يجمع k-NN الفروق الخام، لذا فالميزة ذات **الأعداد الأكبر تُحسب أكثر**. والوحدات اعتباطية: x₂ نفسها مقيسةً بالسنتيمتر بدل المتر ستكون أعدادها أكبر بمئة مرة.

${now}

التصويت: ${voteAr(s)}، والنتيجة **${name(v.pred)}**. الدقة على النقاط الجديدة **${pct(testAcc(s))}**.`;
			},
			quiz: {
				question: 'اضرب x₂ في 10 (تغيير في الوحدة). ماذا يحدث للجيران؟',
				options: ['لا شيء: النقاط نفسها والجيران أنفسهم', 'تهيمن x₂: يُختار الجيران تقريبًا حسب x₂ وحدها', 'تهيمن x₁ لأنها صارت أصغر نسبيًا'],
				explain: (s) =>
					`صارت الفروق الرأسية أكبر بعشر مرات، فالنقاط «الأقرب» هي ببساطة تلك التي على ارتفاع مماثل. يتحول الحد إلى أشرطة أفقية وتنخفض الدقة على النقاط الجديدة من ${pct(testAcc({ ...s, scaleY: 1 }))} إلى **${pct(testAcc({ ...s, scaleY: 10 }))}**. الحل هو [توحيد مقاييس الميزات](concept:feature-scaling) (مثلًا بـ StandardScaler) لتكون لكل منها انتشار متقارب.`
			},
			task: { prompt: 'بعد الإجابة، اضغط **توحيد المقياس** لتعيد إلى الميزتين المقياس نفسه.' }
		},
		{
			title: 'دورك: ساحة التجربة',
			body: `كل شيء مفتوح: اسحب الاستعلام، وغيّر k والمقياس ووزن الأصوات ومقياس x₂.

خلاصة:

1. **التدريب = تخزين البيانات.** التنبؤ يقيس المسافة إلى كل نقطة مخزنة.
2. يصوّت **أقرب k** جيران (مع وزن اختياري بـ 1/المسافة).
3. **k الصغيرة** تعطي حدًا مسننًا مفرطًا في التخصيص؛ و**k الكبيرة** حدًا أملس يتجاهل البيانات في النهاية. اضبط k بالتحقق المتقاطع، واستخدم k فردية مع فئتين.
4. **وحّد مقاييس ميزاتك**: k-NN يستخدم المسافات الخام.
5. في الأبعاد الكثيرة تصبح كل نقطة على بعد متساوٍ تقريبًا من كل الأخرى، فتفقد «الأقرب» معناها: إنها [لعنة الأبعاد](concept:curse-of-dimensionality).

فكرة الجوار نفسها تُستخدم أيضًا لملء القيم المفقودة: انظر [الإكمال بـ KNN](concept:knn-imputer).`
		}
	]
};

export default { fr, ar };
