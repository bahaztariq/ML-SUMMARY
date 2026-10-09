/**
 * French and Arabic narration for the hierarchical clustering lesson (same step order as index.ts).
 */
import type { LessonText } from '../types';
import { largestGapK } from './hclust';
import { k, n, tree, type HcState } from './state';

const h2 = (v: number) => v.toFixed(2);
const lastH = (s: HcState) => (s.merged ? tree(s)[s.merged - 1].height : 0);

const LINKAGE_FR = {
	single: '**simple** (*single*) : la distance entre leurs deux points les plus *proches*',
	complete: '**complète** (*complete*) : la distance entre leurs deux points les plus *éloignés*',
	average: '**moyenne** (*average*) : la distance moyenne sur toutes les paires de points, un dans chaque cluster (la ligne pointillée relie les centres des clusters)',
	ward: '**Ward** : de combien la variance intra-cluster totale augmenterait si on les fusionnait'
} as const;

const LINKAGE_AR = {
	single: '**الربط الأحادي** (single): المسافة بين أقرب نقطتين *متجاورتين* منهما',
	complete: '**الربط الكامل** (complete): المسافة بين أبعد نقطتين *متباعدتين* منهما',
	average: '**الربط المتوسط** (average): متوسط المسافة على كل أزواج النقاط، نقطة من كل عنقود (الخط المتقطع يصل بين مركزي العنقودين)',
	ward: '**Ward**: مقدار ما سيزداد به إجمالي التباين داخل العناقيد لو دُمجا'
} as const;

export const fr: LessonText<HcState> = {
	title: 'Comment le clustering hiérarchique construit un arbre',
	steps: [
		{
			title: 'Chaque point commence comme son propre cluster',
			body: (s) => `Voici **${n(s)} points**. Le clustering agglomératif (ascendant) démarre avec **${n(s)} clusters** : chaque point seul, affiché en gris.

Puis il répète un seul geste : **fusionner les deux clusters les plus proches**. Après ${n(s) - 1} fusions, tout ne forme plus qu'un seul cluster. L'historique de ces fusions est un arbre, le **dendrogramme**, dessiné sous le graphique. Pour l'instant, ce n'est que ${n(s)} feuilles.`
		},
		{
			title: 'Fusionner les deux clusters les plus proches',
			body: (s) => `La première fusion réunit les deux points les plus proches l'un de l'autre (à ${h2(tree(s)[0].height)} de distance). Ils forment désormais un seul cluster (entouré).

Chaque fusion laisse **un cluster de moins** : il en reste ${k(s)} après ${s.merged} fusion${s.merged === 1 ? '' : 's'}. Les premières fusions réunissent des points presque identiques ; les suivantes réunissent des groupes entiers.`,
			task: {
				prompt: 'Appuyez sur **Fusion suivante** (ou **Lecture**) jusqu’à ce qu’il ne reste que **10 clusters**.'
			}
		},
		{
			title: 'Le dendrogramme enregistre chaque fusion',
			body: (s) => `Chaque fusion dessine un **∩** dans le dendrogramme, qui relie les deux clusters à une **hauteur** égale à la distance à laquelle ils ont fusionné. La dernière fusion est mise en évidence : hauteur **${h2(lastH(s))}**.

Des liens courts signifient des points très semblables. Des liens hauts signifient deux groupes qui étaient éloignés au moment où ils se sont enfin rejoints. Remarquez comme les hauteurs font un bond vers la fin : ces dernières fusions recollent entre eux les vrais groupes.`,
			task: {
				prompt: 'Continuez à fusionner jusqu’à ce que l’arbre soit complet (un seul cluster restant).'
			}
		},
		{
			title: 'Liaison : la distance entre deux groupes',
			body: (s) => `La distance entre deux *points* est claire. Entre deux *clusters*, il faut choisir une règle : la **liaison** (*linkage*). Actuellement, liaison ${LINKAGE_FR[s.linkage]}.

La paire mise en évidence est la dernière fusion, qui réunit les deux derniers clusters à la hauteur **${h2(lastH(s))}**. Chaque liaison construit un arbre différent, et l'échelle des hauteurs change avec elle.`,
			task: {
				prompt: 'Essayez au moins **trois liaisons** et comparez les arbres.'
			}
		},
		{
			title: 'La liaison simple fait des chaînes',
			body: (s) => `Nouvelles données : deux amas reliés par un fin **pont** de points, plus un **point aberrant** isolé en bas. L'arbre est coupé en **2 clusters** avec la liaison **${s.linkage}**.

${s.linkage === 'single' ? `La liaison simple ne regarde que la paire la plus *proche*, si bien que le pont sert de pierres de gué : chaque pas est court, les amas fusionnent tôt, et la dernière fusion est celle du point aberrant. Coupé en 2, on obtient « tout » contre « un point aberrant ». C'est ce qu'on appelle l'**effet de chaîne** (*chaining*).` : `Avec la liaison ${s.linkage}, la coupe sépare l'amas de gauche de l'amas de droite, comme on s'y attend.`}`,
			quiz: {
				question: 'Passez à la liaison simple et coupez en 2 clusters. Qu’obtenez-vous ?',
				options: [
					'L’amas de gauche et l’amas de droite, séparés au milieu du pont',
					'Un énorme cluster qui contient presque tout, et le point aberrant tout seul',
					'Deux clusters de taille exactement égale'
				],
				explain: `La liaison simple fusionne ce qui possède la paire de points la plus proche. Chaque écart le long du pont est court, donc les deux amas fusionnent à travers lui bien avant que le point aberrant ne les rejoigne. La fusion du point aberrant est la plus haute de l'arbre : une coupe en 2 clusters isole donc ce seul point.`
			}
		},
		{
			title: 'La liaison de Ward : la cousine de K-Means',
			body: (s) => `La liaison **Ward** (celle par défaut dans scikit-learn) fusionne la paire de clusters qui augmente le moins la **variance intra-cluster** totale :

\`Δ(A, B) = |A|·|B| / (|A| + |B|) · ‖μ_A − μ_B‖²\`

(le dendrogramme affiche √(2Δ), comme SciPy). La variance intra-cluster totale est exactement ce que [K-Means](concept:kmeans) minimise : Ward préfère donc des clusters compacts et de tailles similaires, et ignore les ponts fins. Avec la liaison ${s.linkage} et K = ${k(s)}, ${s.linkage === 'ward' ? 'les deux amas ressortent comme les deux clusters.' : 'comparez avec Ward.'}`
		},
		{
			title: 'Couper l’arbre pour obtenir des clusters',
			body: (s) => `Le dendrogramme contient *tous* les partitionnements, de ${n(s)} clusters jusqu'à 1. Pour obtenir des étiquettes à plat, on le **coupe** par une ligne horizontale : les fusions sous la ligne sont conservées, celles au-dessus sont annulées. Chaque branche qui traverse la ligne est un cluster.

Hauteur de coupe **${h2(s.cutH)}** → **K = ${k(s)}** clusters. C'est le paramètre \`distance_threshold\` de scikit-learn ; demander \`n_clusters\` place la coupe pour vous.`,
			task: {
				prompt: 'Faites glisser la ligne de coupe pointillée du dendrogramme vers le bas jusqu’à obtenir **5 clusters ou plus**.'
			}
		},
		{
			title: 'Où couper : le plus grand écart',
			body: (s) => `Contrairement à K-Means, on choisit K *après* avoir construit l'arbre, en le lisant. Coupe actuelle : **K = ${k(s)}** à la hauteur ${h2(s.cutH)}.

Vous pouvez aussi évaluer chaque K avec le [score de silhouette](concept:silhouette-score).`,
			quiz: {
				question: 'Où est-il le plus naturel de couper cet arbre ?',
				options: [
					'Juste sous la toute dernière fusion, ce qui donne toujours K = 2',
					'À travers le plus grand intervalle vertical sans aucune fusion',
					'Tout en bas, pour que chaque cluster soit très resserré'
				],
				explain: (s) =>
					`Un long intervalle vertical signifie que les clusters en dessous sont restés séparés sur une large plage de distances : ils sont bien séparés. Ici, le plus grand écart donne **K = ${largestGapK(tree(s), n(s))}**, les trois amas. Couper bas scinde de vrais groupes ; la fusion du sommet n'a rien de particulier.`
			}
		},
		{
			title: 'À vous : bac à sable',
			body: `Tout est débloqué. Récapitulatif :

1. Commencer avec chaque point comme son propre cluster.
2. Fusionner de façon répétée les deux clusters les plus proches, selon votre règle de **liaison**.
3. Les hauteurs de fusion forment le **dendrogramme**.
4. Le **couper** à une hauteur (ou à un K) pour obtenir des clusters à plat.

Le résultat est déterministe et on voit toutes les granularités d'un coup. Les inconvénients : une mémoire en O(n²), des fusions qu'on ne peut jamais défaire, pas de \`predict()\` pour de nouveaux points, et des distances qui exigent des [variables mises à l'échelle](concept:feature-scaling). Pour des données bruitées ou de formes irrégulières, essayez [DBSCAN](concept:dbscan).`
		}
	]
};

export const ar: LessonText<HcState> = {
	title: 'كيف يبني التجميع الهرمي شجرة',
	steps: [
		{
			title: 'كل نقطة تبدأ عنقودًا مستقلًا',
			body: (s) => `إليك **${n(s)} نقطة**. يبدأ التجميع التراكمي (agglomerative) من الأسفل إلى الأعلى بـ **${n(s)} عنقودًا (cluster)**: كل نقطة وحدها، باللون الرمادي.

ثم يكرر خطوة واحدة: **دمج أقرب عنقودين**. بعد ${n(s) - 1} عملية دمج يصبح كل شيء عنقودًا واحدًا. سجل عمليات الدمج هذه شجرة تُسمى **المخطط الشجري (dendrogram)**، وهي مرسومة أسفل الرسم البياني. وهي الآن مجرد ${n(s)} ورقة.`
		},
		{
			title: 'دمج أقرب عنقودين',
			body: (s) => `يجمع أول دمج بين النقطتين الأقرب إحداهما إلى الأخرى (المسافة بينهما ${h2(tree(s)[0].height)}). وهما الآن تشكلان عنقودًا (cluster) واحدًا (محاطًا بإطار).

كل دمج يترك **عنقودًا أقل بواحد**: بقي ${k(s)} بعد ${s.merged} عملية دمج. عمليات الدمج الأولى تجمع نقاطًا شبه متطابقة؛ واللاحقة تجمع مجموعات كاملة.`,
			task: {
				prompt: 'اضغط **الدمج التالي** (أو **تشغيل**) حتى يبقى **10 عناقيد** فقط.'
			}
		},
		{
			title: 'المخطط الشجري يسجل كل دمج',
			body: (s) => `كل دمج يرسم **∩** في المخطط الشجري (dendrogram) يصل العنقودين عند **ارتفاع** يساوي المسافة التي اندمجا عندها. آخر دمج مُبرَز: ارتفاعه **${h2(lastH(s))}**.

الروابط القصيرة تعني نقاطًا متشابهة جدًا. والروابط الطويلة تعني مجموعتين كانتا متباعدتين حين اندمجتا أخيرًا. لاحظ كيف تقفز الارتفاعات قرب النهاية: عمليات الدمج الأخيرة تلصق المجموعات الحقيقية بعضها ببعض.`,
			task: {
				prompt: 'واصل الدمج حتى تكتمل الشجرة (يبقى عنقود واحد).'
			}
		},
		{
			title: 'الربط: المسافة بين مجموعتين',
			body: (s) => `المسافة بين *نقطتين* واضحة. أما بين *عنقودين* فعليك اختيار قاعدة، هي **الربط (linkage)**. القاعدة الحالية: ${LINKAGE_AR[s.linkage]}.

الزوج المُبرَز هو الدمج الأخير، الذي يجمع آخر عنقودين عند الارتفاع **${h2(lastH(s))}**. كل نوع ربط يبني شجرة مختلفة، ويتغير مقياس الارتفاعات معه.`,
			task: {
				prompt: 'جرّب **ثلاثة أنواع ربط** على الأقل وقارن بين الأشجار.'
			}
		},
		{
			title: 'الربط الأحادي يصنع سلاسل',
			body: (s) => `بيانات جديدة: كتلتان يصل بينهما **جسر** رفيع من النقاط، إضافة إلى **قيمة شاذة (outlier)** منفردة في الأسفل. الشجرة مقطوعة إلى **عنقودين** باستخدام الربط **${s.linkage}**.

${s.linkage === 'single' ? `الربط الأحادي (single linkage) لا ينظر إلا إلى الزوج *الأقرب*، فيعمل الجسر كحجارة عبور: كل خطوة قصيرة، فتندمج الكتلتان مبكرًا، ويكون آخر دمج هو انضمام القيمة الشاذة. وعند القطع إلى عنقودين تحصل على «كل شيء» مقابل «قيمة شاذة واحدة». تُسمى هذه الظاهرة **التسلسل (chaining)**.` : `مع الربط ${s.linkage} يفصل القطع الكتلة اليسرى عن الكتلة اليمنى، كما هو متوقع.`}`,
			quiz: {
				question: 'انتقل إلى الربط الأحادي واقطع الشجرة إلى عنقودين. ماذا تحصل؟',
				options: [
					'الكتلة اليسرى والكتلة اليمنى، مفصولتين في منتصف الجسر',
					'عنقود ضخم يضم كل شيء تقريبًا، والقيمة الشاذة وحدها',
					'عنقودان متساويان في الحجم تمامًا'
				],
				explain: `الربط الأحادي (single linkage) يدمج ما يملك أقرب زوج من النقاط. كل فجوة على طول الجسر قصيرة، فتندمج الكتلتان عبره قبل انضمام القيمة الشاذة (outlier) بوقت طويل. دمج القيمة الشاذة هو الأعلى في الشجرة، لذا فإن القطع إلى عنقودين يعزل تلك النقطة وحدها.`
			}
		},
		{
			title: 'ربط Ward: ابن عم K-Means',
			body: (s) => `ربط **Ward** (الخيار الافتراضي في scikit-learn) يدمج زوج العناقيد الذي يزيد إجمالي **التباين داخل العناقيد (within-cluster variance)** بأقل قدر:

\`Δ(A, B) = |A|·|B| / (|A| + |B|) · ‖μ_A − μ_B‖²\`

(المخطط الشجري يرسم √(2Δ)، كما تفعل SciPy). إجمالي التباين داخل العناقيد هو بالضبط ما تقلّله [K-Means](concept:kmeans)، لذا يفضّل Ward عناقيد متراصة متقاربة الحجم ويتجاهل الجسور الرفيعة. مع الربط ${s.linkage} و K = ${k(s)}، ${s.linkage === 'ward' ? 'تظهر الكتلتان على أنهما العنقودان.' : 'قارن هذا مع Ward.'}`
		},
		{
			title: 'اقطع الشجرة لتحصل على العناقيد',
			body: (s) => `يحتوي المخطط الشجري (dendrogram) على *كل* تقسيم ممكن، من ${n(s)} عنقودًا وصولًا إلى عنقود واحد. للحصول على تسميات مسطحة، **اقطعه** بخط أفقي: عمليات الدمج تحت الخط تُبقى، وتلك فوقه تُلغى. كل فرع يعبر الخط عنقود واحد.

ارتفاع القطع **${h2(s.cutH)}** يعطي **K = ${k(s)}** عناقيد. هذا هو \`distance_threshold\` في scikit-learn؛ أما طلب \`n_clusters\` فيضع القطع نيابة عنك.`,
			task: {
				prompt: 'اسحب خط القطع المتقطع في المخطط الشجري إلى الأسفل حتى تحصل على **5 عناقيد أو أكثر**.'
			}
		},
		{
			title: 'أين نقطع: أكبر فجوة',
			body: (s) => `بخلاف K-Means، تختار K *بعد* بناء الشجرة، بقراءتها. القطع الحالي: **K = ${k(s)}** عند الارتفاع ${h2(s.cutH)}.

يمكنك أيضًا تقييم كل قيمة لـ K باستخدام [معامل الظل (silhouette score)](concept:silhouette-score).`,
			quiz: {
				question: 'أين المكان الأنسب لقطع هذه الشجرة؟',
				options: [
					'أسفل الدمج الأعلى مباشرة، وهذا يعطي دائمًا K = 2',
					'عبر أطول امتداد عمودي خالٍ من أي دمج',
					'في الأسفل، كي يكون كل عنقود متراصًا جدًا'
				],
				explain: (s) =>
					`الفجوة العمودية الطويلة تعني أن العناقيد تحتها بقيت منفصلة عبر مدى واسع من المسافات: فهي منفصلة جيدًا. هنا تعطي أطول فجوة **K = ${largestGapK(tree(s), n(s))}**، أي الكتل الثلاث. القطع في الأسفل يقسم مجموعات حقيقية؛ والدمج الأعلى ليس مميزًا في شيء.`
			}
		},
		{
			title: 'دورك: ساحة التجريب',
			body: `كل شيء متاح الآن. للتلخيص:

1. ابدأ بجعل كل نقطة عنقودًا (cluster) مستقلًا.
2. ادمج أقرب عنقودين مرارًا، وفق قاعدة **الربط (linkage)** التي اخترتها.
3. ارتفاعات الدمج تشكّل **المخطط الشجري (dendrogram)**.
4. **اقطعه** عند ارتفاع (أو عند K) لتحصل على عناقيد مسطحة.

النتيجة حتمية وترى كل مستويات التفصيل دفعة واحدة. أما التكاليف: ذاكرة من رتبة O(n²)، وعمليات دمج لا يمكن التراجع عنها أبدًا، ولا توجد \`predict()\` للنقاط الجديدة، والمسافات تتطلب [ميزات مُقيَّسة](concept:feature-scaling). للبيانات المشوشة أو ذات الأشكال غير المنتظمة جرّب [DBSCAN](concept:dbscan).`
		}
	]
};

export default { fr, ar };
