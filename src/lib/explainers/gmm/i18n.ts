/**
 * French and Arabic narration for the GMM lesson (same step order as index.ts).
 */
import type { LessonText } from '../types';
import { nParams } from './gmm';
import { bicOf, currentLL, points, resp, type GmmState } from './state';

const f1 = (v: number) => v.toFixed(1);
const pct = (v: number) => `${Math.round(v * 100)}%`;
const gammaText = (s: GmmState, sep = ', ') => {
	const r = resp(s);
	if (!r || s.selected < 0) return '';
	return r[s.selected].map((g, j) => `γ${j + 1} = ${pct(g)}`).join(sep);
};
const bestK = (s: GmmState) => {
	const b = bicOf(s.dataset);
	return b.indexOf(Math.min(...b)) + 1;
};
const lastLL = (s: GmmState) => (s.ll.length ? f1(s.ll[s.ll.length - 1]) : '—');

export const fr: LessonText<GmmState> = {
	title: 'Comment les mélanges gaussiens regroupent en douceur',
	steps: [
		{
			title: 'Des groupes étirés qui se chevauchent',
			body: (s) => `Voici **${points(s).length} points** répartis en trois groupes : deux bandes diagonales longues et fines, posées côte à côte, et un petit amas rond sur la droite.

Les bandes sont proches l'une de l'autre et allongées. Ce genre de clusters est courant dans les données réelles dès que deux variables sont corrélées, par exemple la taille et le poids.`
		},
		{
			title: 'Ce que fait K-Means ici',
			body: (s) =>
				s.view === 'kmeans'
					? `[K-Means](concept:kmeans) affecte chaque point au **centroïde le plus proche** : ses clusters sont donc toujours des régions plutôt rondes, séparées par des lignes droites. Une longue bande est loin de son propre centre à ses deux extrémités, si bien que ces extrémités sont récupérées par d'autres centroïdes.

Il nous faut un modèle où chaque cluster peut avoir sa propre **forme** : large ou étroite, étirée, inclinée.`
					: `Avant de découvrir une nouvelle méthode, prédisez ce que fait [K-Means](concept:kmeans) avec K = 3 sur ces bandes.`,
			quiz: {
				question: 'Que va faire K-Means avec K = 3 sur ces points ?',
				options: [
					"Trouver les deux bandes et l'amas",
					'Couper à travers les bandes, en mélangeant des morceaux des deux',
					"Fusionner les deux bandes et couper l'amas en deux"
				],
				explain: `K-Means mesure une simple distance à un centre, qui traite toutes les directions de la même façon. Une longue bande ne tient pas dans une seule région ronde : elle est découpée en morceaux partagés avec la bande voisine.`
			}
		},
		{
			title: 'Un cluster vu comme une gaussienne',
			body: (s) => `Un **mélange de gaussiennes** décrit les données comme K « projecteurs » en forme de cloche qui se chevauchent. Chaque composante k possède trois éléments :

- un **poids** π_k : la part des points qu'elle explique (les poids somment à 1),
- une **moyenne** μ_k : son centre (le marqueur),
- une **covariance** Σ_k : sa forme. Les ellipses montrent 1 et 2 écarts-types. Une covariance complète peut être large, étroite, étirée ou inclinée.

La densité est \`p(x) = Σ π_k · N(x | μ_k, Σ_k)\`, ombrée en arrière-plan. On part d'une estimation grossière : ${s.k} composantes rondes placées en des points aléatoires.`
		},
		{
			title: 'Étape E : qui est responsable de chaque point ?',
			body: (s) => `**Étape d'espérance (Expectation).** Pour chaque point, on demande à chaque composante avec quelle probabilité elle l'a produit, en pondérant par π, puis on normalise pour que les réponses somment à 1 :

\`γ_ik = π_k N(x_i | k) / Σ_j π_j N(x_i | j)\`

Ces **responsabilités** sont souples : la couleur de chaque point est un mélange des couleurs des composantes selon γ. ${s.selected >= 0 ? `Point sélectionné : **${gammaText(s)}**.` : ''}`,
			task: {
				prompt: "Cliquez sur un point à la **couleur mélangée** : un point qu'aucune composante ne revendique à plus de 90 %."
			}
		},
		{
			title: 'Étape M : réajuster chaque gaussienne',
			body: (s) => `**Étape de maximisation.** Chaque composante est réajustée sur les points, chaque point ne comptant qu'à hauteur de sa responsabilité γ :

- **π_k** = moyenne des γ pour la composante k,
- **μ_k** = moyenne des points pondérée par γ,
- **Σ_k** = dispersion pondérée par γ autour de cette moyenne.

Les ellipses sautent vers les points dont elles sont responsables et commencent à s'étirer. Log-vraisemblance (la probabilité des données selon le modèle ; plus elle est élevée, mieux c'est) : **${f1(currentLL(s))}**.`
		},
		{
			title: 'On répète : EM fait grimper la vraisemblance',
			body: (s) => `On alterne E et M. Chaque tour ne peut qu'**augmenter** la log-vraisemblance (ou la laisser inchangée), de même que K-Means ne peut que diminuer son inertie : EM finit donc toujours par se stabiliser.

${s.converged ? `**Convergence après ${s.iteration} itérations**, log-vraisemblance ${f1(s.ll[s.ll.length - 1])}. Les ellipses épousent maintenant les deux bandes et l'amas.` : `Itération **${s.iteration}**, log-vraisemblance **${lastLL(s)}**.`}`,
			task: {
				prompt: "Appuyez sur **Lancer** (ou plusieurs fois sur **Étape**) jusqu'à ce que EM converge."
			}
		},
		{
			title: 'Affectations souples ou strictes',
			body: `Après l'ajustement, \`predict()\` donne à chaque point sa composante la plus probable, comme K-Means. Mais un GMM fournit aussi des **probabilités** avec \`predict_proba()\` : un point au cœur d'une bande appartient à ~100 % à cette bande ; un point situé là où des composantes se chevauchent est partagé.

Comme le modèle est une densité complète, \`score_samples()\` indique aussi à quel point un point est *inhabituel*. Les points de très faible densité sont des anomalies.`,
			quiz: {
				question: 'Le point entouré se trouve là où deux composantes ajustées se chevauchent. Que renvoie le GMM pour ce point ?',
				options: [
					'Une seule étiquette, exactement comme K-Means',
					'Une probabilité pour chaque composante, dont la somme vaut 1',
					'Rien : les points situés entre les clusters sont marqués comme du bruit'
				],
				explain: (s) =>
					`Il renvoie une responsabilité pour chaque composante : ici **${gammaText(s)}**. Vous pouvez utiliser ces probabilités directement (par exemple pour signaler les points incertains à vérifier) ou prendre la plus grande comme étiquette stricte.`
			}
		},
		{
			title: 'Combien de composantes ? Le BIC',
			body: (s) => `Ajouter des composantes ajuste toujours les données au moins aussi bien : la vraisemblance seule choisirait donc le plus grand K. Le **critère d'information bayésien** (BIC) ajoute une pénalité pour chaque paramètre :

\`BIC = −2·log L + p·ln n\`, avec ici p = 6K − 1 (2 par moyenne, 3 par covariance, K − 1 poids).

**Plus il est bas, mieux c'est.** K = ${s.k} compte ${nParams(s.k)} paramètres. Le minimum est atteint pour **K = ${bestK(s)}**.`,
			task: {
				prompt: 'Utilisez le curseur K (ou cliquez sur le graphique du BIC) pour choisir le K au BIC le plus bas.'
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est déverrouillé. Récapitulatif :

1. Choisir K (avec le BIC) et initialiser K gaussiennes (scikit-learn utilise K-Means).
2. **Étape E** : les responsabilités γ de chaque point.
3. **Étape M** : réajuster π, μ, Σ comme des moyennes pondérées par γ.
4. Répéter jusqu'à ce que la log-vraisemblance cesse d'augmenter.

Essayez **Nouveau départ** avec K = 3 : EM peut rester bloqué dans de moins bons optima locaux, d'où l'intérêt des redémarrages \`n_init\`. Sur les **Lunes**, les gaussiennes ne peuvent pas suivre les courbes : utilisez plutôt [DBSCAN](concept:dbscan).`
		}
	]
};

export const ar: LessonText<GmmState> = {
	title: 'كيف تُجمِّع خلائط غاوس البيانات تجميعًا مرنًا',
	steps: [
		{
			title: 'مجموعات ممدودة ومتداخلة',
			body: (s) => `إليك **${points(s).length} نقطة** موزّعة على ثلاث مجموعات: شريطان قُطريّان طويلان ورفيعان متجاوران، وكتلة صغيرة مستديرة على اليمين.

الشريطان متقاربان وممدودان. هذا النوع من العناقيد (clusters) شائع في البيانات الحقيقية كلما كانت سمتان مترابطتين، مثل الطول والوزن.`
		},
		{
			title: 'ماذا تفعل K-Means هنا',
			body: (s) =>
				s.view === 'kmeans'
					? `تُسند [K-Means](concept:kmeans) كل نقطة إلى **أقرب مركز (centroid)**، لذا تكون عناقيدها دائمًا مناطق شبه دائرية تفصل بينها خطوط مستقيمة. طرفا الشريط الطويل بعيدان عن مركزه، فتستحوذ عليهما مراكز أخرى.

نحتاج إلى نموذج يستطيع فيه كل عنقود أن يتخذ **شكله** الخاص: عريضًا أو ضيقًا، ممدودًا أو مائلًا.`
					: `قبل التعرّف على طريقة جديدة، توقّع ما ستفعله [K-Means](concept:kmeans) مع K = 3 بهذين الشريطين.`,
			quiz: {
				question: 'ماذا ستفعل K-Means مع K = 3 بهذه النقاط؟',
				options: [
					'ستجد الشريطين والكتلة',
					'ستقطع الشريطين عرضيًا وتخلط أجزاءً من كليهما',
					'ستدمج الشريطين وتقسم الكتلة إلى قسمين'
				],
				explain: `تقيس K-Means مسافة بسيطة إلى مركز، وهي تعامل جميع الاتجاهات بالطريقة نفسها. الشريط الطويل لا يتّسع في منطقة دائرية واحدة، فيُقطَّع إلى أجزاء يتقاسمها مع الشريط المجاور.`
			}
		},
		{
			title: 'العنقود بوصفه توزيعًا غاوسيًا',
			body: (s) => `يصف **خليط غاوس (Gaussian mixture)** البيانات على أنها K «بقعة ضوء» متداخلة على شكل جرس. لكل مكوّن k ثلاثة عناصر:

- **وزن** π_k: نصيب النقاط الذي يفسّره (مجموع الأوزان يساوي 1)،
- **متوسط** μ_k: مركزه (العلامة)،
- **تغاير (covariance)** Σ_k: شكله. تُظهر القطوع الناقصة انحرافًا معياريًا واحدًا وانحرافين. يمكن للتغاير الكامل أن يكون عريضًا أو ضيقًا أو ممدودًا أو مائلًا.

الكثافة هي \`p(x) = Σ π_k · N(x | μ_k, Σ_k)\`، وهي مظلّلة في الخلفية. نبدأ من تخمين تقريبي: ${s.k} مكوّنات دائرية في نقاط عشوائية.`
		},
		{
			title: 'خطوة E: من المسؤول عن كل نقطة؟',
			body: (s) => `**خطوة التوقّع (Expectation).** لكل نقطة، نسأل كل مكوّن عن احتمال أن يكون هو من أنتجها، مرجّحًا بـ π، ثم نُطبّع الإجابات ليصبح مجموعها 1:

\`γ_ik = π_k N(x_i | k) / Σ_j π_j N(x_i | j)\`

هذه **المسؤوليات (responsibilities)** مرنة: لون كل نقطة مزيج من ألوان المكوّنات بحسب γ. ${s.selected >= 0 ? `النقطة المحدّدة: **${gammaText(s, '، ')}**.` : ''}`,
			task: {
				prompt: 'انقر على نقطة ذات **لون ممزوج**: نقطة لا يستحوذ أي مكوّن على أكثر من 90% منها.'
			}
		},
		{
			title: 'خطوة M: إعادة ملاءمة كل توزيع غاوسي',
			body: (s) => `**خطوة التعظيم (Maximisation).** يُعاد ملاءمة كل مكوّن على النقاط، مع احتساب كل نقطة بقدر مسؤوليتها γ فقط:

- **π_k** = متوسط γ للمكوّن k،
- **μ_k** = متوسط النقاط المرجّح بـ γ،
- **Σ_k** = التشتّت المرجّح بـ γ حول ذلك المتوسط.

تقفز القطوع الناقصة نحو النقاط التي هي مسؤولة عنها وتبدأ بالتمدّد. لوغاريتم الأرجحية (log-likelihood)، أي مدى احتمال البيانات وفق النموذج، والأعلى أفضل: **${f1(currentLL(s))}**.`
		},
		{
			title: 'التكرار: EM يرفع الأرجحية',
			body: (s) => `نُناوب بين E وM. لا يمكن لأي جولة إلا أن **ترفع** لوغاريتم الأرجحية (أو تُبقيه كما هو)، تمامًا كما لا يمكن لـ K-Means إلا أن تُخفّض العطالة (inertia)، لذا يستقر EM دائمًا.

${s.converged ? `**بلغ التقارب في التكرار ${s.iteration}**، ولوغاريتم الأرجحية ${f1(s.ll[s.ll.length - 1])}. ترسم القطوع الناقصة الآن الشريطين والكتلة.` : `التكرار **${s.iteration}**، لوغاريتم الأرجحية **${lastLL(s)}**.`}`,
			task: {
				prompt: 'اضغط **تشغيل** (أو **خطوة** مرارًا) حتى يتقارب EM.'
			}
		},
		{
			title: 'التعيين المرن مقابل التعيين الصارم',
			body: `بعد الملاءمة، تعطي \`predict()\` كل نقطة المكوّن الأرجح لها، مثل K-Means. لكن GMM يعطي أيضًا **احتمالات** عبر \`predict_proba()\`: نقطة في عمق شريط تنتمي إليه بنسبة ~100%، أما نقطة في منطقة تداخل المكوّنات فتتوزّع بينها.

ولأن النموذج كثافة كاملة، تخبرك \`score_samples()\` أيضًا بمدى *غرابة* نقطة ما. النقاط ذات الكثافة المنخفضة جدًا شذوذات (anomalies).`,
			quiz: {
				question: 'النقطة المحاطة بحلقة تقع حيث يتداخل مكوّنان مُلاءَمان. ماذا يُرجع GMM لها؟',
				options: [
					'تسمية واحدة، تمامًا كما تفعل K-Means',
					'احتمالًا لكل مكوّن، ومجموع الاحتمالات 1',
					'لا شيء: النقاط الواقعة بين العناقيد تُعلَّم كضجيج'
				],
				explain: (s) =>
					`يُرجع مسؤوليةً لكل مكوّن: هنا **${gammaText(s, '، ')}**. يمكنك استخدام هذه الاحتمالات مباشرة (مثلًا لتمييز النقاط غير المؤكدة ومراجعتها) أو أخذ أكبرها تسميةً صارمة.`
			}
		},
		{
			title: 'كم عدد المكوّنات؟ معيار BIC',
			body: (s) => `إضافة مكوّنات تُلائم البيانات دائمًا بالقدر نفسه على الأقل، لذا ستختار الأرجحية وحدها أكبر K. يضيف **معيار المعلومات البايزي (Bayesian Information Criterion)** عقوبةً على كل معامل:

\`BIC = −2·log L + p·ln n\`، حيث p = 6K − 1 هنا (2 لكل متوسط، و3 لكل تغاير، وK − 1 من الأوزان).

**الأقل أفضل.** عدد المعاملات عند K = ${s.k} هو ${nParams(s.k)}. تقع القيمة الدنيا عند **K = ${bestK(s)}**.`,
			task: {
				prompt: 'استخدم شريط تمرير K (أو انقر على مخطط BIC) لاختيار قيمة K ذات أدنى BIC.'
			}
		},
		{
			title: 'دورك: ساحة التجريب',
			body: `كل شيء متاح الآن. للتلخيص:

1. اختر K (بواسطة BIC) وهيّئ K توزيعات غاوسية (تستخدم scikit-learn خوارزمية K-Means).
2. **خطوة E**: المسؤوليات γ لكل نقطة.
3. **خطوة M**: إعادة ملاءمة π وμ وΣ كمتوسطات مرجّحة بـ γ.
4. كرّر حتى يتوقف لوغاريتم الأرجحية عن الارتفاع.

جرّب **بداية جديدة** مع K = 3: قد يعلق EM في قيم مثلى محلية (local optima) أسوأ، ولهذا تفيد إعادات التشغيل عبر \`n_init\`. على **الأهلّة**، لا تستطيع التوزيعات الغاوسية تتبّع المنحنيات؛ استخدم [DBSCAN](concept:dbscan) هناك.`
		}
	]
};

export default { fr, ar };
