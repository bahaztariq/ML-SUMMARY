/** Quiz questions: fundamentals. See index.js for the question format. */
/** @type {import('./index.js').Question[]} */
export default [
  // ── what-is-ml ──────────────────────────────────────────────
  {
    id: "fund-ml-data-answers-rules",
    concept: "what-is-ml",
    difficulty: 1,
    q: {
      en: "Compared with traditional programming, what does a machine learning algorithm take in and produce?",
      fr: "Par rapport à la programmation classique, que reçoit et que produit un algorithme de Machine Learning ?",
      ar: "مقارنةً بالبرمجة التقليدية، ما الذي تستقبله خوارزمية التعلم الآلي (machine learning) وما الذي تُنتجه؟"
    },
    options: {
      en: ["Data and rules in, answers out", "Data and answers in, rules (a model) out", "Rules and answers in, data out", "Only rules in, data and answers out"],
      fr: ["Des données et des règles en entrée, des réponses en sortie", "Des données et des réponses en entrée, des règles (un modèle) en sortie", "Des règles et des réponses en entrée, des données en sortie", "Seulement des règles en entrée, des données et des réponses en sortie"],
      ar: ["بيانات وقواعد كمدخلات، وإجابات كمخرجات", "بيانات وإجابات كمدخلات، وقواعد (نموذج) كمخرجات", "قواعد وإجابات كمدخلات، وبيانات كمخرجات", "قواعد فقط كمدخلات، وبيانات وإجابات كمخرجات"]
    },
    answer: 1,
    explain: {
      en: "Traditional software applies hand-written rules to data to get answers. Machine learning flips this: from examples of data and their known answers, the algorithm infers the rules, stored as a model's parameters.",
      fr: "Un logiciel classique applique des règles écrites à la main aux données pour obtenir des réponses. Le Machine Learning inverse la démarche : à partir d’exemples de données et de leurs réponses connues, l’algorithme déduit les règles, stockées dans les paramètres du modèle.",
      ar: "البرمجيات التقليدية تطبّق قواعد مكتوبة يدويًا على البيانات للحصول على الإجابات. أما التعلم الآلي فيعكس ذلك: انطلاقًا من أمثلة بيانات وإجاباتها المعروفة، تستنتج الخوارزمية القواعد وتخزّنها في معاملات النموذج."
    }
  },
  {
    id: "fund-ml-when-not-to-use",
    concept: "what-is-ml",
    difficulty: 2,
    q: {
      en: "Which task is the weakest candidate for machine learning?",
      fr: "Quelle tâche se prête le moins au Machine Learning ?",
      ar: "أيّ مهمة هي الأقل ملاءمةً لاستخدام التعلم الآلي؟"
    },
    options: {
      en: ["Flagging spam whose wording changes every week", "Recommending products from millions of past purchases", "Computing sales tax from a fixed legal formula", "Detecting fraud patterns that evolve over time"],
      fr: ["Repérer des spams dont la formulation change chaque semaine", "Recommander des produits à partir de millions d’achats passés", "Calculer une taxe à partir d’une formule légale fixe", "Détecter des schémas de fraude qui évoluent dans le temps"],
      ar: ["رصد الرسائل المزعجة التي تتغيّر صياغتها كل أسبوع", "اقتراح منتجات انطلاقًا من ملايين عمليات الشراء السابقة", "حساب ضريبة المبيعات وفق صيغة قانونية ثابتة", "كشف أنماط احتيال تتطوّر مع الزمن"]
    },
    answer: 2,
    explain: {
      en: "When an exact, static formula already solves the problem, a learned model only adds approximation error. ML pays off when the rules are too complex or change too often to write by hand.",
      fr: "Quand une formule exacte et stable résout déjà le problème, un modèle appris n’ajoute que de l’erreur d’approximation. Le ML est rentable quand les règles sont trop complexes ou changent trop souvent pour être écrites à la main.",
      ar: "عندما تحلّ صيغةٌ دقيقة وثابتة المشكلةَ أصلًا، فإن النموذج المتعلَّم لا يضيف سوى خطأ تقريبي. يكون التعلم الآلي مجديًا حين تكون القواعد أعقد أو أكثر تغيّرًا من أن تُكتب يدويًا."
    }
  },
  {
    id: "fund-ml-garbage-in-garbage-out",
    concept: "what-is-ml",
    difficulty: 2,
    q: {
      en: "A churn model is trained on CRM data where about 30% of the churn labels were entered incorrectly. What is the most likely result?",
      fr: "Un modèle d’attrition (churn) est entraîné sur des données CRM dont environ 30 % des étiquettes sont erronées. Quel est le résultat le plus probable ?",
      ar: "دُرِّب نموذج للتنبؤ بتسرّب العملاء (churn) على بيانات CRM نحو 30% من تسمياتها مُدخلة بشكل خاطئ. ما النتيجة الأرجح؟"
    },
    options: {
      en: ["The model learns the wrong patterns; label errors cap its quality", "The algorithm spots the wrong labels and ignores them automatically", "Accuracy is unaffected as long as the dataset is large enough", "Training gets faster because the noisy labels simplify the problem"],
      fr: ["Le modèle apprend de mauvais schémas ; les erreurs d’étiquetage plafonnent sa qualité", "L’algorithme repère les mauvaises étiquettes et les ignore automatiquement", "La précision n’est pas affectée tant que le jeu de données est assez grand", "L’entraînement est plus rapide car les étiquettes bruitées simplifient le problème"],
      ar: ["يتعلّم النموذج أنماطًا خاطئة، وتحدّ أخطاء التسميات من جودته", "تكتشف الخوارزمية التسميات الخاطئة وتتجاهلها تلقائيًا", "لا تتأثر الدقة ما دامت مجموعة البيانات كبيرة بما يكفي", "يصبح التدريب أسرع لأن التسميات المشوّشة تبسّط المشكلة"]
    },
    answer: 0,
    explain: {
      en: "Garbage in, garbage out: a model can only learn what its training data shows. Systematically wrong labels teach it wrong rules, and no algorithm fixes that on its own.",
      fr: "« Garbage in, garbage out » : un modèle ne peut apprendre que ce que montrent ses données d’entraînement. Des étiquettes fausses lui enseignent de fausses règles, et aucun algorithme ne corrige cela tout seul.",
      ar: "«مدخلات رديئة تعني مخرجات رديئة»: لا يتعلّم النموذج إلا ما تُظهره بيانات تدريبه. والتسميات الخاطئة تعلّمه قواعد خاطئة، ولا توجد خوارزمية تصحّح ذلك من تلقاء نفسها."
    }
  },

  // ── what-is-ai ──────────────────────────────────────────────
  {
    id: "fund-ai-hierarchy",
    concept: "what-is-ai",
    difficulty: 1,
    q: {
      en: "Which statement correctly describes how AI, machine learning (ML) and deep learning (DL) relate?",
      fr: "Quelle affirmation décrit correctement le lien entre IA, Machine Learning (ML) et Deep Learning (DL) ?",
      ar: "أيّ عبارة تصف بشكل صحيح العلاقة بين الذكاء الاصطناعي (AI) والتعلم الآلي (ML) والتعلم العميق (DL)؟"
    },
    options: {
      en: ["ML is a subset of DL, which is a subset of AI", "AI is a subset of ML, which includes DL", "DL is a subset of ML, which is a subset of AI", "AI, ML and DL are separate fields with no overlap"],
      fr: ["Le ML est un sous-ensemble du DL, lui-même inclus dans l’IA", "L’IA est un sous-ensemble du ML, qui inclut le DL", "Le DL est un sous-ensemble du ML, lui-même inclus dans l’IA", "L’IA, le ML et le DL sont des domaines distincts sans recouvrement"],
      ar: ["التعلم الآلي جزء من التعلم العميق، وهذا جزء من الذكاء الاصطناعي", "الذكاء الاصطناعي جزء من التعلم الآلي الذي يشمل التعلم العميق", "التعلم العميق جزء من التعلم الآلي، وهذا جزء من الذكاء الاصطناعي", "الذكاء الاصطناعي والتعلم الآلي والتعلم العميق مجالات منفصلة لا تتداخل"]
    },
    answer: 2,
    explain: {
      en: "AI is the umbrella field. ML is the part of AI that learns from data, and DL is the branch of ML built on multi-layer neural networks: AI ⊃ ML ⊃ DL.",
      fr: "L’IA est le domaine parapluie. Le ML est la partie de l’IA qui apprend à partir de données, et le DL est la branche du ML fondée sur des réseaux de neurones multicouches : IA ⊃ ML ⊃ DL.",
      ar: "الذكاء الاصطناعي هو المجال الأشمل. والتعلم الآلي هو الجزء منه الذي يتعلّم من البيانات، والتعلم العميق فرعٌ من التعلم الآلي يقوم على شبكات عصبية متعددة الطبقات: AI ⊃ ML ⊃ DL."
    }
  },
  {
    id: "fund-ai-narrow-ai",
    concept: "what-is-ai",
    difficulty: 1,
    q: {
      en: "A system detects tumors on X-rays better than radiologists but can do nothing else. What kind of AI is it?",
      fr: "Un système détecte les tumeurs sur des radios mieux que des radiologues, mais ne sait rien faire d’autre. De quel type d’IA s’agit-il ?",
      ar: "نظامٌ يكشف الأورام في صور الأشعة أفضل من أطباء الأشعة، لكنه لا يستطيع فعل أي شيء آخر. ما نوع هذا الذكاء الاصطناعي؟"
    },
    options: {
      en: ["Narrow AI (ANI)", "General AI (AGI)", "Superintelligent AI", "Reinforcement AI"],
      fr: ["IA faible ou étroite (ANI)", "IA générale (AGI)", "IA superintelligente", "IA par renforcement"],
      ar: ["ذكاء اصطناعي ضيّق (ANI)", "ذكاء اصطناعي عام (AGI)", "ذكاء اصطناعي فائق", "ذكاء اصطناعي معزَّز"]
    },
    answer: 0,
    explain: {
      en: "Narrow AI is specialized in a single task, however well it performs it. Every commercial AI system today is narrow; general AI that adapts to any domain like a human remains hypothetical.",
      fr: "Une IA étroite est spécialisée dans une seule tâche, aussi bien qu’elle l’accomplisse. Tous les systèmes d’IA commerciaux actuels sont étroits ; une IA générale capable de s’adapter à tout domaine comme un humain reste hypothétique.",
      ar: "الذكاء الاصطناعي الضيّق متخصّص في مهمة واحدة مهما أتقنها. وكل أنظمة الذكاء الاصطناعي التجارية اليوم ضيّقة، أما الذكاء العام القادر على التكيّف مع أي مجال كالإنسان فما زال افتراضيًا."
    }
  },
  {
    id: "fund-ai-symbolic-rules",
    concept: "what-is-ai",
    difficulty: 2,
    q: {
      en: "An expert system diagnoses car faults with hundreds of hand-written if–then rules and never learns from data. Is it AI?",
      fr: "Un système expert diagnostique les pannes de voiture avec des centaines de règles « si… alors » écrites à la main, sans jamais apprendre de données. Est-ce de l’IA ?",
      ar: "نظام خبير يشخّص أعطال السيارات بمئات القواعد الشرطية (if–then) المكتوبة يدويًا، ولا يتعلّم من البيانات أبدًا. هل يُعدّ ذكاءً اصطناعيًا؟"
    },
    options: {
      en: ["No, only systems that learn from data count as AI", "Yes, it is symbolic AI even though it is not machine learning", "No, it would need a neural network to count as AI", "Yes, because rule systems are a form of deep learning"],
      fr: ["Non, seuls les systèmes qui apprennent de données relèvent de l’IA", "Oui, c’est de l’IA symbolique, même si ce n’est pas du Machine Learning", "Non, il faudrait un réseau de neurones pour parler d’IA", "Oui, car les systèmes à règles sont une forme de Deep Learning"],
      ar: ["لا، فالأنظمة التي تتعلّم من البيانات وحدها تُعدّ ذكاءً اصطناعيًا", "نعم، إنه ذكاء اصطناعي رمزي (symbolic AI) وإن لم يكن تعلمًا آليًا", "لا، يلزمه شبكة عصبية حتى يُعدّ ذكاءً اصطناعيًا", "نعم، لأن أنظمة القواعد شكل من أشكال التعلم العميق"]
    },
    answer: 1,
    explain: {
      en: "AI is the broad umbrella and includes symbolic, rule-based systems. Machine learning is only the part of AI where the rules are learned from data instead of written by people.",
      fr: "L’IA est un domaine large qui inclut les systèmes symboliques à base de règles. Le Machine Learning n’en est que la partie où les règles sont apprises à partir des données au lieu d’être écrites par des humains.",
      ar: "الذكاء الاصطناعي مظلّة واسعة تشمل الأنظمة الرمزية القائمة على القواعد. أما التعلم الآلي فهو الجزء الذي تُتعلَّم فيه القواعد من البيانات بدل أن يكتبها البشر."
    }
  },

  // ── what-is-deep-learning ──────────────────────────────────
  {
    id: "fund-dl-what-deep-means",
    concept: "what-is-deep-learning",
    difficulty: 1,
    q: {
      en: "What does the word “deep” refer to in deep learning?",
      fr: "À quoi renvoie le mot « deep » (profond) dans Deep Learning ?",
      ar: "إلامَ تشير كلمة «العميق» في التعلم العميق (deep learning)؟"
    },
    options: {
      en: ["Very large training datasets", "Training runs that last for days", "Many stacked layers of learned representations", "Models that explain their reasoning in depth"],
      fr: ["Des jeux de données d’entraînement très volumineux", "Des entraînements qui durent plusieurs jours", "De nombreuses couches empilées de représentations apprises", "Des modèles qui expliquent leur raisonnement en profondeur"],
      ar: ["مجموعات بيانات تدريب ضخمة جدًا", "عمليات تدريب تستمر لأيام", "طبقات كثيرة متراكبة من التمثيلات المتعلَّمة", "نماذج تشرح استدلالها بعمق"]
    },
    answer: 2,
    explain: {
      en: "Depth is the number of hidden layers between input and output. Each layer builds on the previous one, from edges to shapes to whole objects, which lets the network learn hierarchical features.",
      fr: "La profondeur est le nombre de couches cachées entre l’entrée et la sortie. Chaque couche s’appuie sur la précédente, des contours aux formes puis aux objets entiers, ce qui permet d’apprendre des caractéristiques hiérarchiques.",
      ar: "العمق هو عدد الطبقات المخفية بين المدخلات والمخرجات. تبني كل طبقة على سابقتها، من الحواف إلى الأشكال ثم إلى الأجسام الكاملة، ما يتيح للشبكة تعلّم ميزات هرمية."
    }
  },
  {
    id: "fund-dl-feature-learning",
    concept: "what-is-deep-learning",
    difficulty: 1,
    q: {
      en: "How does deep learning typically differ from classical ML in the way features are obtained?",
      fr: "En quoi le Deep Learning diffère-t-il généralement du ML classique dans la façon d’obtenir les caractéristiques ?",
      ar: "كيف يختلف التعلم العميق عادةً عن التعلم الآلي الكلاسيكي في طريقة الحصول على الميزات (features)؟"
    },
    options: {
      en: ["DL learns representations from raw data; classical ML relies more on hand-crafted features", "Classical ML learns features automatically; DL needs hand-crafted ones", "DL only works with features chosen by domain experts", "Neither approach uses features; both work on labels only"],
      fr: ["Le DL apprend des représentations à partir des données brutes ; le ML classique dépend davantage de variables construites à la main", "Le ML classique apprend les caractéristiques automatiquement ; le DL a besoin de variables construites à la main", "Le DL ne fonctionne qu’avec des variables choisies par des experts métier", "Aucune des deux approches n’utilise de variables ; elles travaillent uniquement sur les étiquettes"],
      ar: ["يتعلّم التعلم العميق التمثيلات من البيانات الخام، بينما يعتمد التعلم الكلاسيكي أكثر على ميزات مصمَّمة يدويًا", "يتعلّم التعلم الكلاسيكي الميزات تلقائيًا، بينما يحتاج التعلم العميق إلى ميزات مصمَّمة يدويًا", "لا يعمل التعلم العميق إلا بميزات يختارها خبراء المجال", "لا يستخدم أيٌّ منهما ميزات، وكلاهما يعمل على التسميات فقط"]
    },
    answer: 0,
    explain: {
      en: "Deep networks learn their own features end-to-end from pixels, tokens or audio. Classical models such as trees or linear models depend heavily on features that people engineer from domain knowledge.",
      fr: "Les réseaux profonds apprennent leurs propres caractéristiques de bout en bout à partir des pixels, des tokens ou de l’audio. Les modèles classiques (arbres, modèles linéaires) dépendent fortement de variables construites grâce à la connaissance métier.",
      ar: "تتعلّم الشبكات العميقة ميزاتها بنفسها من البداية إلى النهاية انطلاقًا من البكسلات أو الرموز أو الصوت. أما النماذج الكلاسيكية كالأشجار والنماذج الخطية فتعتمد كثيرًا على ميزات يصمّمها البشر من معرفتهم بالمجال."
    }
  },
  {
    id: "fund-dl-why-nonlinear-activation",
    concept: "what-is-deep-learning",
    difficulty: 2,
    q: {
      en: "Why do deep networks need non-linear activation functions such as ReLU between layers?",
      fr: "Pourquoi les réseaux profonds ont-ils besoin de fonctions d’activation non linéaires comme ReLU entre les couches ?",
      ar: "لماذا تحتاج الشبكات العميقة إلى دوال تنشيط غير خطية (activation functions) مثل ReLU بين الطبقات؟"
    },
    options: {
      en: ["They let the network skip computing gradients", "They normalize inputs so no feature scaling is needed", "They reduce the number of weights in each layer", "Without them, stacked linear layers collapse into one linear map"],
      fr: ["Elles permettent au réseau d’éviter le calcul des gradients", "Elles normalisent les entrées, donc plus besoin de mise à l’échelle", "Elles réduisent le nombre de poids de chaque couche", "Sans elles, des couches linéaires empilées se réduisent à une seule transformation linéaire"],
      ar: ["تتيح للشبكة تجنّب حساب التدرّجات", "تُطبّع المدخلات فلا حاجة إلى توحيد مقاييس الميزات", "تقلّل عدد الأوزان في كل طبقة", "من دونها تنهار الطبقات الخطية المتراكبة إلى تحويل خطي واحد"]
    },
    answer: 3,
    explain: {
      en: "A composition of linear transformations is itself linear, so 100 linear layers are no more expressive than one. The non-linearity between layers is what lets depth model curved, complex relationships.",
      fr: "Une composition de transformations linéaires reste linéaire : 100 couches linéaires ne sont pas plus expressives qu’une seule. C’est la non-linéarité entre les couches qui permet à la profondeur de modéliser des relations complexes et courbes.",
      ar: "تركيب تحويلات خطية يبقى خطيًا، فمئة طبقة خطية ليست أقدر تعبيرًا من طبقة واحدة. واللاخطية بين الطبقات هي ما يسمح للعمق بنمذجة علاقات منحنية ومعقّدة."
    }
  },
  {
    id: "fund-dl-small-tabular-choice",
    concept: "what-is-deep-learning",
    difficulty: 3,
    q: {
      en: "You must predict loan default from 5,000 rows of tabular data with 30 columns. What is usually the best first model?",
      fr: "Vous devez prédire le défaut de paiement à partir de 5 000 lignes de données tabulaires à 30 colonnes. Quel est en général le meilleur premier modèle ?",
      ar: "عليك التنبؤ بالتعثّر في سداد القروض انطلاقًا من 5,000 صفّ من البيانات الجدولية بـ30 عمودًا. ما أفضل نموذج تبدأ به عادةً؟"
    },
    options: {
      en: ["A Transformer trained from scratch", "A tree ensemble such as XGBoost or Random Forest", "A 50-layer convolutional network", "A deep network, since it needs no data preparation"],
      fr: ["Un Transformer entraîné de zéro", "Un ensemble d’arbres comme XGBoost ou une forêt aléatoire", "Un réseau convolutif de 50 couches", "Un réseau profond, puisqu’il ne demande aucune préparation des données"],
      ar: ["محوّل (Transformer) يُدرَّب من الصفر", "مجموعة أشجار مثل XGBoost أو الغابة العشوائية (Random Forest)", "شبكة التفافية من 50 طبقة", "شبكة عميقة، لأنها لا تحتاج إلى تحضير البيانات"]
    },
    answer: 1,
    explain: {
      en: "On small tabular datasets, tree ensembles usually beat neural networks with far less compute and tuning. Deep learning is data-hungry and shines on large or unstructured data such as images and text.",
      fr: "Sur de petits jeux de données tabulaires, les ensembles d’arbres battent généralement les réseaux de neurones avec bien moins de calcul et de réglages. Le Deep Learning est gourmand en données et brille sur des données volumineuses ou non structurées (images, texte).",
      ar: "على مجموعات البيانات الجدولية الصغيرة، تتفوّق مجموعات الأشجار عادةً على الشبكات العصبية بحوسبة وضبط أقل بكثير. فالتعلم العميق نهِمٌ للبيانات ويتألق مع البيانات الضخمة أو غير المهيكلة كالصور والنصوص."
    }
  },

  // ── supervised-vs-unsupervised ─────────────────────────────
  {
    id: "fund-paradigm-supervised-needs-labels",
    concept: "supervised-vs-unsupervised",
    difficulty: 1,
    q: {
      en: "What does supervised learning need that unsupervised learning does not?",
      fr: "De quoi l’apprentissage supervisé a-t-il besoin, contrairement à l’apprentissage non supervisé ?",
      ar: "ما الذي يحتاجه التعلم الخاضع للإشراف (supervised learning) ولا يحتاجه التعلم غير الخاضع للإشراف؟"
    },
    options: {
      en: ["A GPU for training", "Only numerical features", "A reward signal from an environment", "A known target label y for each training example"],
      fr: ["Un GPU pour l’entraînement", "Uniquement des variables numériques", "Un signal de récompense venant d’un environnement", "Une étiquette cible y connue pour chaque exemple d’entraînement"],
      ar: ["وحدة معالجة رسومية (GPU) للتدريب", "ميزات رقمية فقط", "إشارة مكافأة صادرة عن بيئة", "تسمية هدف y معروفة لكل مثال تدريب"]
    },
    answer: 3,
    explain: {
      en: "Supervised learning learns a mapping from features X to known labels y and measures its error against them. Unsupervised learning only sees X and looks for structure such as clusters or low-dimensional patterns.",
      fr: "L’apprentissage supervisé apprend une correspondance entre les variables X et des étiquettes y connues, et mesure son erreur par rapport à elles. L’apprentissage non supervisé ne voit que X et cherche une structure (groupes, motifs de faible dimension).",
      ar: "يتعلّم التعلم الخاضع للإشراف ربطًا بين الميزات X والتسميات المعروفة y ويقيس خطأه بالمقارنة معها. أما التعلم غير الخاضع للإشراف فلا يرى إلا X ويبحث فيها عن بنية كالعناقيد أو الأنماط منخفضة الأبعاد."
    }
  },
  {
    id: "fund-paradigm-reinforcement",
    concept: "supervised-vs-unsupervised",
    difficulty: 1,
    q: {
      en: "An agent learns to play a video game by earning points for good moves and losing points for bad ones. Which paradigm is this?",
      fr: "Un agent apprend à jouer à un jeu vidéo en gagnant des points pour les bons coups et en en perdant pour les mauvais. De quel paradigme s’agit-il ?",
      ar: "وكيلٌ يتعلّم لعب لعبة فيديو بكسب نقاط على الحركات الجيدة وخسارتها على الحركات السيئة. ما هذا النموذج من التعلم؟"
    },
    options: {
      en: ["Supervised learning", "Reinforcement learning", "Unsupervised learning", "Transfer learning"],
      fr: ["Apprentissage supervisé", "Apprentissage par renforcement", "Apprentissage non supervisé", "Apprentissage par transfert"],
      ar: ["التعلم الخاضع للإشراف", "التعلم المعزز (reinforcement learning)", "التعلم غير الخاضع للإشراف", "التعلم بالنقل (transfer learning)"]
    },
    answer: 1,
    explain: {
      en: "Reinforcement learning has no labeled answers, only rewards that follow the agent’s actions in an environment. The agent learns a strategy that maximizes total future reward through trial and error.",
      fr: "En apprentissage par renforcement, il n’y a pas de réponses étiquetées, seulement des récompenses qui suivent les actions de l’agent dans un environnement. L’agent apprend par essais et erreurs une stratégie qui maximise la récompense future totale.",
      ar: "في التعلم المعزز لا توجد إجابات مُسمّاة، بل مكافآت تعقب أفعال الوكيل في بيئة ما. ويتعلّم الوكيل بالتجربة والخطأ استراتيجيةً تعظّم مجموع المكافآت المستقبلية."
    }
  },
  {
    id: "fund-paradigm-unlabeled-reviews",
    concept: "supervised-vs-unsupervised",
    difficulty: 2,
    q: {
      en: "You have 2 million product reviews with no labels and want to discover groups of reviews that talk about similar things. Which approach fits?",
      fr: "Vous disposez de 2 millions d’avis produits sans étiquettes et voulez découvrir des groupes d’avis qui parlent de choses similaires. Quelle approche convient ?",
      ar: "لديك مليونا مراجعة منتجات دون تسميات، وتريد اكتشاف مجموعات من المراجعات تتناول مواضيع متشابهة. أيّ نهج يناسب ذلك؟"
    },
    options: {
      en: ["Unsupervised learning, e.g. clustering", "Supervised classification", "Supervised regression", "Reinforcement learning"],
      fr: ["Apprentissage non supervisé, par ex. du clustering", "Classification supervisée", "Régression supervisée", "Apprentissage par renforcement"],
      ar: ["التعلم غير الخاضع للإشراف، كالتجميع العنقودي (clustering)", "التصنيف الخاضع للإشراف", "الانحدار الخاضع للإشراف", "التعلم المعزز"]
    },
    answer: 0,
    explain: {
      en: "With no target labels there is nothing for a supervised model to learn to predict. Unsupervised methods such as clustering find natural groupings in the data itself.",
      fr: "Sans étiquettes cibles, un modèle supervisé n’a rien à apprendre à prédire. Les méthodes non supervisées comme le clustering trouvent des regroupements naturels dans les données elles-mêmes.",
      ar: "في غياب تسميات الهدف لا يوجد ما يتعلّم النموذج الخاضع للإشراف التنبؤ به. أما الطرق غير الخاضعة للإشراف كالتجميع العنقودي فتجد التجمّعات الطبيعية في البيانات نفسها."
    }
  },

  // ── what-is-classification ─────────────────────────────────
  {
    id: "fund-class-which-target",
    concept: "what-is-classification",
    difficulty: 1,
    q: {
      en: "Which of these targets makes the problem a classification task?",
      fr: "Laquelle de ces cibles fait du problème une tâche de classification ?",
      ar: "أيّ هذه الأهداف يجعل المشكلة مهمة تصنيف (classification)؟"
    },
    options: {
      en: ["The sale price of a house in dollars", "Tomorrow’s temperature in degrees", "Whether a loan application is approved or rejected", "The number of minutes until a delivery arrives"],
      fr: ["Le prix de vente d’une maison en dollars", "La température de demain en degrés", "Si une demande de prêt est acceptée ou refusée", "Le nombre de minutes avant l’arrivée d’une livraison"],
      ar: ["سعر بيع منزل بالدولار", "درجة حرارة الغد", "قبول طلب القرض أو رفضه", "عدد الدقائق المتبقية حتى وصول الطلبية"]
    },
    answer: 2,
    explain: {
      en: "Classification predicts one of a fixed set of discrete categories, here approved or rejected. The other targets are continuous quantities, which makes them regression problems.",
      fr: "La classification prédit une catégorie parmi un ensemble fini, ici acceptée ou refusée. Les autres cibles sont des quantités continues, donc des problèmes de régression.",
      ar: "يتنبّأ التصنيف بفئة واحدة من مجموعة محدّدة من الفئات المنفصلة، وهنا: مقبول أو مرفوض. أما الأهداف الأخرى فكمّيات متصلة، ما يجعلها مسائل انحدار."
    }
  },
  {
    id: "fund-class-multilabel",
    concept: "what-is-classification",
    difficulty: 2,
    q: {
      en: "A movie can be tagged “Action” and “Sci-Fi” at the same time. What kind of task is this, and what output layer is typical?",
      fr: "Un film peut être étiqueté « Action » et « Science-fiction » en même temps. Quel type de tâche est-ce, et quelle couche de sortie est habituelle ?",
      ar: "يمكن وسم فيلم بـ«أكشن» و«خيال علمي» في الوقت نفسه. ما نوع هذه المهمة، وما طبقة المخرجات المعتادة لها؟"
    },
    options: {
      en: ["Multiclass, with one softmax over all genres", "Multilabel, with an independent sigmoid per genre", "Binary, with a single 0.5 threshold", "Regression, predicting a genre score"],
      fr: ["Multiclasse, avec un softmax sur tous les genres", "Multilabel, avec une sigmoïde indépendante par genre", "Binaire, avec un seul seuil à 0,5", "Régression, en prédisant un score de genre"],
      ar: ["متعدد الفئات (multiclass) بدالة softmax واحدة على كل الأنواع", "متعدد التسميات (multilabel) بدالة sigmoid مستقلة لكل نوع", "ثنائي بعتبة واحدة عند 0.5", "انحدار يتنبأ بدرجة للنوع"]
    },
    answer: 1,
    explain: {
      en: "When several labels can be true at once, the task is multilabel. A softmax forces the classes to compete and sum to 1, while independent sigmoids let each genre be switched on or off separately.",
      fr: "Quand plusieurs étiquettes peuvent être vraies à la fois, la tâche est multilabel. Un softmax met les classes en concurrence (somme égale à 1), alors que des sigmoïdes indépendantes activent chaque genre séparément.",
      ar: "عندما يمكن أن تصدق عدة تسميات معًا تكون المهمة متعددة التسميات. فدالة softmax تجعل الفئات تتنافس ومجموعها 1، بينما تسمح دوال sigmoid المستقلة بتفعيل كل نوع أو إلغائه على حدة."
    }
  },
  {
    id: "fund-class-threshold-business-cost",
    concept: "what-is-classification",
    difficulty: 3,
    q: {
      en: "A fraud classifier uses the default 0.5 probability threshold. Missing a fraud costs far more than a false alarm. What should you do?",
      fr: "Un classifieur de fraude utilise le seuil de probabilité par défaut de 0,5. Rater une fraude coûte bien plus cher qu’une fausse alerte. Que faire ?",
      ar: "مصنِّف احتيال يستخدم عتبة الاحتمال الافتراضية 0.5. وتفويت حالة احتيال أكثر كلفة بكثير من إنذار كاذب. ماذا ينبغي أن تفعل؟"
    },
    options: {
      en: ["Raise the threshold to 0.9 so alerts are more certain", "Keep 0.5, since it is optimal for every problem", "Lower the threshold, tuned on validation data, to catch more fraud", "Switch to a regression model to avoid thresholds"],
      fr: ["Monter le seuil à 0,9 pour des alertes plus sûres", "Garder 0,5, optimal pour tout problème", "Abaisser le seuil, réglé sur des données de validation, pour attraper plus de fraudes", "Passer à un modèle de régression pour éviter les seuils"],
      ar: ["رفع العتبة إلى 0.9 لتكون الإنذارات أوثق", "الإبقاء على 0.5 لأنها مثلى لكل مشكلة", "خفض العتبة، مع ضبطها على بيانات التحقق، لالتقاط مزيد من حالات الاحتيال", "التحوّل إلى نموذج انحدار لتجنّب العتبات"]
    },
    answer: 2,
    explain: {
      en: "0.5 is only a default. Lowering the threshold flags more transactions as fraud, raising recall at the cost of more false alarms, which is the right trade when misses are expensive. Tune it on validation data, not the test set.",
      fr: "0,5 n’est qu’une valeur par défaut. Abaisser le seuil signale plus de transactions comme frauduleuses : le rappel augmente au prix de plus de fausses alertes, ce qui est le bon compromis quand les oublis coûtent cher. Réglez-le sur la validation, pas sur le test.",
      ar: "القيمة 0.5 مجرد قيمة افتراضية. خفض العتبة يصنّف معاملات أكثر على أنها احتيال، فيرتفع الاستدعاء (recall) على حساب مزيد من الإنذارات الكاذبة، وهذه هي المقايضة الصحيحة حين يكون التفويت مكلفًا. اضبطها على بيانات التحقق لا على مجموعة الاختبار."
    }
  },

  // ── what-is-regression ─────────────────────────────────────
  {
    id: "fund-reg-mae-robust-outliers",
    concept: "what-is-regression",
    difficulty: 2,
    q: {
      en: "Your house-price data contains a few extreme sales that should not dominate the fit. Which loss is more robust to them?",
      fr: "Vos données de prix immobiliers contiennent quelques ventes extrêmes qui ne doivent pas dominer l’ajustement. Quelle perte y est la plus robuste ?",
      ar: "تحتوي بيانات أسعار المنازل لديك على بضع صفقات متطرفة لا ينبغي أن تهيمن على الملاءمة. أيّ دالة خسارة أكثر متانة أمامها؟"
    },
    options: {
      en: ["Mean Squared Error (MSE)", "Mean Absolute Error (MAE)", "Sum of squared errors", "Binary cross-entropy"],
      fr: ["Erreur quadratique moyenne (MSE)", "Erreur absolue moyenne (MAE)", "Somme des erreurs au carré", "Entropie croisée binaire"],
      ar: ["متوسط مربع الخطأ (MSE)", "متوسط الخطأ المطلق (MAE)", "مجموع مربعات الأخطاء", "الإنتروبيا التقاطعية الثنائية"]
    },
    answer: 1,
    explain: {
      en: "Squaring makes a residual of 100 count 10,000 times more than a residual of 1, so MSE lets outliers pull the curve. MAE grows linearly with the error, so extreme points have far less influence.",
      fr: "Avec le carré, un résidu de 100 pèse 10 000 fois plus qu’un résidu de 1 : la MSE laisse les valeurs aberrantes tirer la courbe. La MAE croît linéairement avec l’erreur, donc les points extrêmes pèsent beaucoup moins.",
      ar: "التربيع يجعل بقيّةً قدرها 100 تُحسب أكثر بعشرة آلاف مرة من بقيّة قدرها 1، فيسمح MSE للقيم الشاذة بجرّ المنحنى. أما MAE فينمو خطيًا مع الخطأ، فيكون تأثير النقاط المتطرفة أقل بكثير."
    }
  },
  {
    id: "fund-reg-r2-zero",
    concept: "what-is-regression",
    difficulty: 1,
    q: {
      en: "A regression model scores R² = 0 on the test set. What does that tell you?",
      fr: "Un modèle de régression obtient R² = 0 sur le jeu de test. Qu’est-ce que cela signifie ?",
      ar: "حصل نموذج انحدار على R² = 0 في مجموعة الاختبار. ماذا يعني ذلك؟"
    },
    options: {
      en: ["It makes perfect predictions", "It explains all of the target’s variance", "It does no better than always predicting the mean", "Exactly half of its predictions are correct"],
      fr: ["Il fait des prédictions parfaites", "Il explique toute la variance de la cible", "Il ne fait pas mieux que prédire toujours la moyenne", "Exactement la moitié de ses prédictions sont justes"],
      ar: ["يقدّم تنبؤات مثالية", "يفسّر كامل تباين الهدف", "ليس أفضل من التنبؤ الدائم بالمتوسط", "نصف تنبؤاته بالضبط صحيحة"]
    },
    answer: 2,
    explain: {
      en: "R² is the share of the target’s variance the model explains, measured against a baseline that always predicts the mean. R² = 1 is perfect; R² = 0 means the model adds nothing over that baseline.",
      fr: "Le R² est la part de la variance de la cible expliquée par le modèle, comparée à une référence qui prédit toujours la moyenne. R² = 1 est parfait ; R² = 0 signifie que le modèle n’apporte rien par rapport à cette référence.",
      ar: "يمثّل R² نسبة تباين الهدف التي يفسّرها النموذج مقارنةً بنموذج مرجعي يتنبأ دائمًا بالمتوسط. R² = 1 يعني الكمال، وR² = 0 يعني أن النموذج لا يضيف شيئًا على ذلك المرجع."
    }
  },
  {
    id: "fund-reg-extrapolation",
    concept: "what-is-regression",
    difficulty: 2,
    q: {
      en: "A model trained on houses of 50–300 m² is asked to price a 1,500 m² mansion. What is the main concern?",
      fr: "Un modèle entraîné sur des maisons de 50 à 300 m² doit estimer le prix d’un manoir de 1 500 m². Quel est le principal problème ?",
      ar: "طُلب من نموذج دُرِّب على منازل مساحتها بين 50 و300 م² تقدير سعر قصر مساحته 1,500 م². ما مصدر القلق الرئيسي؟"
    },
    options: {
      en: ["The prediction is an extrapolation far outside the training range", "The classes big and small houses are imbalanced", "The model will refuse to make a prediction", "Regression models cannot output large numbers"],
      fr: ["La prédiction est une extrapolation loin de la plage d’entraînement", "Les classes grandes et petites maisons sont déséquilibrées", "Le modèle refusera de faire une prédiction", "Les modèles de régression ne peuvent pas produire de grands nombres"],
      ar: ["التنبؤ استقراءٌ (extrapolation) بعيد عن نطاق بيانات التدريب", "فئتا المنازل الكبيرة والصغيرة غير متوازنتين", "سيرفض النموذج تقديم تنبؤ", "نماذج الانحدار لا تستطيع إخراج أعداد كبيرة"]
    },
    answer: 0,
    explain: {
      en: "A model only knows the relationship inside the range it was trained on. Far outside it, a linear model blindly extends the trend and a tree model stays flat at its last value; neither is trustworthy.",
      fr: "Un modèle ne connaît la relation qu’à l’intérieur de la plage vue à l’entraînement. Bien au-delà, un modèle linéaire prolonge aveuglément la tendance et un arbre reste bloqué sur sa dernière valeur : aucun n’est fiable.",
      ar: "لا يعرف النموذج العلاقة إلا داخل النطاق الذي دُرِّب عليه. وبعيدًا عنه يمدّ النموذج الخطي الاتجاه بشكل أعمى، ويبقى نموذج الشجرة ثابتًا عند آخر قيمة له، ولا يمكن الوثوق بأيّ منهما."
    }
  },

  // ── what-is-clustering ─────────────────────────────────────
  {
    id: "fund-clust-vs-classification",
    concept: "what-is-clustering",
    difficulty: 1,
    q: {
      en: "What is the key difference between clustering and classification?",
      fr: "Quelle est la différence essentielle entre clustering et classification ?",
      ar: "ما الفرق الجوهري بين التجميع العنقودي (clustering) والتصنيف؟"
    },
    options: {
      en: ["Clustering needs labels; classification does not", "Clustering groups unlabeled data; classification predicts predefined labels", "Clustering predicts numbers; classification predicts groups", "They are the same task under two names"],
      fr: ["Le clustering a besoin d’étiquettes, pas la classification", "Le clustering regroupe des données non étiquetées ; la classification prédit des étiquettes prédéfinies", "Le clustering prédit des nombres ; la classification prédit des groupes", "C’est la même tâche sous deux noms"],
      ar: ["التجميع يحتاج إلى تسميات والتصنيف لا يحتاج", "التجميع يجمّع بيانات غير مُسمّاة، والتصنيف يتنبأ بتسميات محدّدة مسبقًا", "التجميع يتنبأ بأعداد والتصنيف يتنبأ بمجموعات", "إنهما المهمة نفسها باسمين مختلفين"]
    },
    answer: 1,
    explain: {
      en: "Classification is supervised: it learns from examples with known classes. Clustering is unsupervised: nobody defines the groups in advance, the algorithm discovers them from similarity alone.",
      fr: "La classification est supervisée : elle apprend à partir d’exemples dont la classe est connue. Le clustering est non supervisé : personne ne définit les groupes à l’avance, l’algorithme les découvre à partir de la seule similarité.",
      ar: "التصنيف خاضع للإشراف: يتعلّم من أمثلة فئاتها معروفة. أما التجميع فغير خاضع للإشراف: لا أحد يحدّد المجموعات مسبقًا، بل تكتشفها الخوارزمية من التشابه وحده."
    }
  },
  {
    id: "fund-clust-dbscan-shapes",
    concept: "what-is-clustering",
    difficulty: 2,
    q: {
      en: "Your data has irregular, non-round groups plus some noise points, and you don’t know how many groups exist. Which method fits best?",
      fr: "Vos données forment des groupes irréguliers, non sphériques, avec du bruit, et vous ne savez pas combien de groupes il y a. Quelle méthode convient le mieux ?",
      ar: "تحتوي بياناتك على مجموعات غير منتظمة وغير دائرية إضافةً إلى نقاط ضجيج، ولا تعرف عدد المجموعات. أيّ طريقة هي الأنسب؟"
    },
    options: {
      en: ["K-Means", "PCA", "DBSCAN", "Logistic regression"],
      fr: ["K-Means", "ACP (PCA)", "DBSCAN", "Régression logistique"],
      ar: ["K-Means", "تحليل المكونات الرئيسية (PCA)", "DBSCAN", "الانحدار اللوجستي"]
    },
    answer: 2,
    explain: {
      en: "DBSCAN connects dense regions, so it finds clusters of any shape, does not need k in advance and labels sparse points as noise. K-Means assumes round, similar-sized clusters and a fixed k.",
      fr: "DBSCAN relie les régions denses : il trouve des groupes de forme quelconque, n’a pas besoin de k à l’avance et marque les points isolés comme du bruit. K-Means suppose des groupes ronds, de taille similaire, et un k fixé.",
      ar: "تربط DBSCAN المناطق الكثيفة، فتجد عناقيد بأي شكل، ولا تحتاج إلى k مسبقًا، وتصنّف النقاط المتناثرة ضجيجًا. أما K-Means فتفترض عناقيد دائرية متقاربة الحجم وعددًا k ثابتًا."
    }
  },
  {
    id: "fund-clust-unscaled-features",
    concept: "what-is-clustering",
    difficulty: 3,
    q: {
      en: "You run K-Means on customers using [annual spend in dollars (0–200,000), store visits per month (0–30)] without scaling. What happens?",
      fr: "Vous lancez K-Means sur des clients avec [dépense annuelle en dollars (0–200 000), visites par mois (0–30)] sans mise à l’échelle. Que se passe-t-il ?",
      ar: "تشغّل K-Means على العملاء باستخدام [الإنفاق السنوي بالدولار (0–200,000)، عدد الزيارات شهريًا (0–30)] دون توحيد المقاييس. ماذا يحدث؟"
    },
    options: {
      en: ["Visits dominate, because small numbers vary more", "Nothing, because clustering ignores units", "K-Means refuses to run on unscaled data", "Spend dominates the distances, so clusters reflect spend almost alone"],
      fr: ["Les visites dominent, car les petits nombres varient davantage", "Rien, car le clustering ignore les unités", "K-Means refuse de tourner sur des données non mises à l’échelle", "La dépense domine les distances : les groupes reflètent presque uniquement la dépense"],
      ar: ["تهيمن الزيارات لأن الأعداد الصغيرة تتغيّر أكثر", "لا شيء، لأن التجميع يتجاهل الوحدات", "ترفض K-Means العمل على بيانات غير موحّدة المقاييس", "يهيمن الإنفاق على المسافات، فتعكس العناقيد الإنفاقَ وحده تقريبًا"]
    },
    answer: 3,
    explain: {
      en: "Euclidean distance adds up raw differences, so a gap of 50,000 dollars swamps a gap of 20 visits. Standardizing first gives each feature a comparable say in what “similar” means.",
      fr: "La distance euclidienne additionne les écarts bruts : un écart de 50 000 dollars écrase un écart de 20 visites. Standardiser d’abord donne à chaque variable un poids comparable dans la notion de « similarité ».",
      ar: "تجمع المسافة الإقليدية الفروق الخام، ففارق 50,000 دولار يطغى على فارق 20 زيارة. والتوحيد القياسي أولًا يمنح كل ميزة وزنًا متكافئًا في تحديد معنى «التشابه»."
    }
  },

  // ── what-is-dimensionality-reduction ──────────────────────
  {
    id: "fund-dr-pca-interpretability",
    concept: "what-is-dimensionality-reduction",
    difficulty: 1,
    q: {
      en: "What is a main drawback of replacing your features with PCA components?",
      fr: "Quel est un inconvénient majeur du remplacement de vos variables par des composantes de l’ACP (PCA) ?",
      ar: "ما العيب الرئيسي لاستبدال ميزاتك بمكوّنات تحليل المكونات الرئيسية (PCA)؟"
    },
    options: {
      en: ["Components mix the original features, so they lose their business meaning", "PCA always increases the number of features", "PCA requires labeled data", "Components can only be computed for images"],
      fr: ["Les composantes mélangent les variables d’origine et perdent leur sens métier", "L’ACP augmente toujours le nombre de variables", "L’ACP exige des données étiquetées", "Les composantes ne se calculent que sur des images"],
      ar: ["المكوّنات مزيجٌ من الميزات الأصلية، فتفقد معناها العملي", "يزيد PCA دائمًا عدد الميزات", "يتطلب PCA بيانات مُسمّاة", "لا تُحسب المكوّنات إلا للصور"]
    },
    answer: 0,
    explain: {
      en: "Each principal component is a weighted mixture of all original columns, so “component 1” has no unit like dollars or age. That hurts when stakeholders need to understand individual drivers.",
      fr: "Chaque composante principale est un mélange pondéré de toutes les colonnes d’origine : la « composante 1 » n’a pas d’unité comme des dollars ou un âge. C’est gênant quand les décideurs veulent comprendre les facteurs individuels.",
      ar: "كل مكوّن رئيسي مزيجٌ موزون من جميع الأعمدة الأصلية، فـ«المكوّن 1» ليس له وحدة كالدولار أو العمر. وهذا يضرّ حين يحتاج أصحاب القرار إلى فهم كل عامل على حدة."
    }
  },
  {
    id: "fund-dr-selection-vs-extraction",
    concept: "what-is-dimensionality-reduction",
    difficulty: 2,
    q: {
      en: "What is the difference between feature selection and feature extraction such as PCA?",
      fr: "Quelle est la différence entre la sélection de variables et l’extraction de variables comme l’ACP ?",
      ar: "ما الفرق بين اختيار الميزات (feature selection) واستخلاص الميزات (feature extraction) مثل PCA؟"
    },
    options: {
      en: ["Selection builds new axes; extraction keeps original columns", "Both always produce exactly the same columns", "Selection keeps a subset of original columns; extraction builds new combined axes", "Selection only works on images; extraction only on tables"],
      fr: ["La sélection crée de nouveaux axes ; l’extraction garde les colonnes d’origine", "Les deux produisent toujours exactement les mêmes colonnes", "La sélection garde un sous-ensemble des colonnes d’origine ; l’extraction crée de nouveaux axes combinés", "La sélection ne marche que sur des images ; l’extraction que sur des tableaux"],
      ar: ["الاختيار يبني محاور جديدة، والاستخلاص يحتفظ بالأعمدة الأصلية", "كلاهما ينتج دائمًا الأعمدة نفسها تمامًا", "الاختيار يحتفظ بمجموعة جزئية من الأعمدة الأصلية، والاستخلاص يبني محاور جديدة مركّبة", "الاختيار يعمل على الصور فقط، والاستخلاص على الجداول فقط"]
    },
    answer: 2,
    explain: {
      en: "Selection drops weak columns but keeps the survivors unchanged and interpretable. Extraction compresses all columns into new axes, which can keep more information but loses the original meaning.",
      fr: "La sélection supprime les colonnes faibles mais garde les autres intactes et interprétables. L’extraction compresse toutes les colonnes en nouveaux axes, ce qui peut conserver plus d’information mais fait perdre le sens d’origine.",
      ar: "الاختيار يحذف الأعمدة الضعيفة ويُبقي الباقي كما هو وقابلًا للتفسير. أما الاستخلاص فيضغط كل الأعمدة في محاور جديدة، قد تحفظ معلومات أكثر لكنها تفقد المعنى الأصلي."
    }
  },
  {
    id: "fund-dr-visualize-embeddings",
    concept: "what-is-dimensionality-reduction",
    difficulty: 2,
    q: {
      en: "You want a 2D plot of 300-dimensional word embeddings in which similar words stay close together. Which tool is usually preferred?",
      fr: "Vous voulez un graphique 2D d’embeddings de mots en 300 dimensions où les mots similaires restent proches. Quel outil est généralement préféré ?",
      ar: "تريد رسمًا ثنائي الأبعاد لتضمينات كلمات (embeddings) بـ300 بُعد تبقى فيه الكلمات المتشابهة متقاربة. أيّ أداة تُفضَّل عادةً؟"
    },
    options: {
      en: ["StandardScaler", "t-SNE or UMAP", "One-hot encoding", "Linear regression"],
      fr: ["StandardScaler", "t-SNE ou UMAP", "Encodage one-hot", "Régression linéaire"],
      ar: ["StandardScaler", "t-SNE أو UMAP", "الترميز الأحادي (one-hot)", "الانحدار الخطي"]
    },
    answer: 1,
    explain: {
      en: "t-SNE and UMAP are non-linear methods designed to preserve local neighborhoods in 2D or 3D, which is exactly what a similarity map needs. PCA is linear and keeps global variance, so it often blurs local clusters.",
      fr: "t-SNE et UMAP sont des méthodes non linéaires conçues pour préserver les voisinages locaux en 2D ou 3D, exactement ce qu’exige une carte de similarité. L’ACP est linéaire et conserve la variance globale, ce qui brouille souvent les groupes locaux.",
      ar: "t-SNE وUMAP طريقتان غير خطيتين مصمّمتان للحفاظ على الجوار المحلي في بُعدين أو ثلاثة، وهذا بالضبط ما تحتاجه خريطة التشابه. أما PCA فخطي ويحفظ التباين الكلي، فكثيرًا ما يطمس العناقيد المحلية."
    }
  },

  // ── what-is-feature-engineering ───────────────────────────
  {
    id: "fund-fe-ratio-feature",
    concept: "what-is-feature-engineering",
    difficulty: 1,
    q: {
      en: "Creating price_per_sqft = price / square_footage is an example of what?",
      fr: "Créer price_per_sqft = price / square_footage est un exemple de quoi ?",
      ar: "إنشاء price_per_sqft = price / square_footage مثالٌ على ماذا؟"
    },
    options: {
      en: ["Feature scaling", "Missing-value imputation", "Target encoding", "An interaction (ratio) feature"],
      fr: ["Mise à l’échelle des variables", "Imputation des valeurs manquantes", "Encodage par la cible", "Une variable d’interaction (ratio)"],
      ar: ["توحيد مقاييس الميزات", "تعويض القيم المفقودة", "الترميز بالهدف", "ميزة تفاعلية (نسبة)"]
    },
    answer: 3,
    explain: {
      en: "Combining two raw columns into a ratio is classic feature engineering. Ratios often expose the real economic or physical driver of the target, which a model might otherwise struggle to learn.",
      fr: "Combiner deux colonnes brutes en un ratio est un cas classique de feature engineering. Les ratios révèlent souvent le véritable facteur économique ou physique de la cible, que le modèle aurait du mal à apprendre seul.",
      ar: "دمج عمودين خامين في نسبة مثالٌ كلاسيكي على هندسة الميزات (feature engineering). وكثيرًا ما تكشف النسب العامل الاقتصادي أو الفيزيائي الحقيقي وراء الهدف، وهو ما قد يصعب على النموذج تعلّمه وحده."
    }
  },
  {
    id: "fund-fe-datetime-parts",
    concept: "what-is-feature-engineering",
    difficulty: 2,
    q: {
      en: "Why break a raw timestamp into hour, day_of_week and is_weekend before training?",
      fr: "Pourquoi décomposer un horodatage brut en hour, day_of_week et is_weekend avant l’entraînement ?",
      ar: "لماذا نفكّك الطابع الزمني الخام إلى hour وday_of_week وis_weekend قبل التدريب؟"
    },
    options: {
      en: ["To reduce the number of rows in the dataset", "Models can’t easily use a raw timestamp; the parts expose calendar and cyclical patterns", "Because every model requires exactly three date features", "To anonymize the data before training"],
      fr: ["Pour réduire le nombre de lignes du jeu de données", "Un modèle exploite mal un horodatage brut ; ses composantes révèlent les motifs calendaires et cycliques", "Parce que tout modèle exige exactement trois variables de date", "Pour anonymiser les données avant l’entraînement"],
      ar: ["لتقليل عدد صفوف مجموعة البيانات", "يصعب على النماذج استغلال الطابع الزمني الخام، بينما تكشف أجزاؤه الأنماط التقويمية والدورية", "لأن كل نموذج يتطلب ثلاث ميزات زمنية بالضبط", "لإخفاء هوية البيانات قبل التدريب"]
    },
    answer: 1,
    explain: {
      en: "Behavior often depends on the hour, the weekday or the weekend, not on the absolute moment in time. Extracting those parts turns an opaque string or large number into signals the model can actually split or weight on.",
      fr: "Les comportements dépendent souvent de l’heure, du jour de la semaine ou du week-end, pas de l’instant absolu. Extraire ces composantes transforme une chaîne opaque ou un grand nombre en signaux exploitables par le modèle.",
      ar: "كثيرًا ما يتوقف السلوك على الساعة أو يوم الأسبوع أو عطلة نهايته، لا على اللحظة المطلقة. واستخراج هذه الأجزاء يحوّل نصًا مبهمًا أو عددًا كبيرًا إلى إشارات يستطيع النموذج استغلالها."
    }
  },
  {
    id: "fund-fe-future-leakage",
    concept: "what-is-feature-engineering",
    difficulty: 3,
    q: {
      en: "To predict whether a customer churns next month, a teammate adds “number of support calls in the month after the prediction date”. Validation scores jump. What is wrong?",
      fr: "Pour prédire si un client partira le mois prochain, un collègue ajoute « nombre d’appels au support dans le mois suivant la date de prédiction ». Les scores de validation s’envolent. Quel est le problème ?",
      ar: "للتنبؤ بما إذا كان العميل سيغادر الشهر المقبل، أضاف زميلك ميزة «عدد مكالمات الدعم في الشهر الذي يلي تاريخ التنبؤ». فقفزت نتائج التحقق. ما الخطأ؟"
    },
    options: {
      en: ["The feature must be scaled before use", "It leaks future information unavailable at prediction time", "It should be one-hot encoded instead", "Nothing; adding features always helps"],
      fr: ["La variable doit d’abord être mise à l’échelle", "Elle fait fuiter une information future, indisponible au moment de prédire", "Elle devrait plutôt être encodée en one-hot", "Rien, ajouter des variables aide toujours"],
      ar: ["يجب توحيد مقياس الميزة قبل استخدامها", "إنها تسرّب معلومات مستقبلية غير متاحة لحظة التنبؤ", "يجب ترميزها بالترميز الأحادي بدلًا من ذلك", "لا خطأ، فإضافة الميزات تفيد دائمًا"]
    },
    answer: 1,
    explain: {
      en: "This is data leakage: the feature describes events after the moment the prediction is made, so it will not exist in production. It inflates validation scores and the model collapses once deployed.",
      fr: "C’est une fuite de données : la variable décrit des événements postérieurs au moment de la prédiction, elle n’existera donc pas en production. Elle gonfle les scores de validation et le modèle s’effondre une fois déployé.",
      ar: "هذا تسرّب للبيانات (data leakage): الميزة تصف أحداثًا تقع بعد لحظة التنبؤ، فلن تكون متاحة في بيئة الإنتاج. إنها تضخّم نتائج التحقق ثم ينهار النموذج بعد نشره."
    }
  },

  // ── what-is-gradient-descent ──────────────────────────────
  {
    id: "fund-gd-update-rule",
    concept: "what-is-gradient-descent",
    difficulty: 1,
    q: {
      en: "Which formula is the gradient descent update rule (α = learning rate, J = cost)?",
      fr: "Quelle formule est la règle de mise à jour de la descente de gradient (α = taux d’apprentissage, J = coût) ?",
      ar: "أيّ صيغة هي قاعدة التحديث في خوارزمية الانحدار التدرّجي (gradient descent)، حيث α معدل التعلم وJ دالة التكلفة؟"
    },
    options: {
      en: ["θ_new = θ_old + α · ∇J(θ)", "θ_new = θ_old − α · ∇J(θ)", "θ_new = α · θ_old", "θ_new = θ_old − J(θ) / α"],
      fr: ["θ_new = θ_old + α · ∇J(θ)", "θ_new = θ_old − α · ∇J(θ)", "θ_new = α · θ_old", "θ_new = θ_old − J(θ) / α"],
      ar: ["θ_new = θ_old + α · ∇J(θ)", "θ_new = θ_old − α · ∇J(θ)", "θ_new = α · θ_old", "θ_new = θ_old − J(θ) / α"]
    },
    answer: 1,
    explain: {
      en: "The gradient ∇J(θ) points uphill, toward faster-increasing cost. Subtracting it, scaled by the learning rate α, takes a small step downhill toward lower cost.",
      fr: "Le gradient ∇J(θ) pointe vers la montée, là où le coût augmente le plus vite. Le soustraire, multiplié par le taux d’apprentissage α, fait un petit pas vers le bas, vers un coût plus faible.",
      ar: "يشير التدرّج ∇J(θ) إلى أعلى المنحدر، حيث تزداد التكلفة أسرع. وطرحه مضروبًا في معدل التعلم α يعني خطوة صغيرة نحو الأسفل باتجاه تكلفة أقل."
    }
  },
  {
    id: "fund-gd-learning-rate-too-high",
    concept: "what-is-gradient-descent",
    difficulty: 2,
    q: {
      en: "During training the loss bounces up and down and then explodes to infinity after a few steps. What is the most likely cause?",
      fr: "Pendant l’entraînement, la perte oscille puis explose vers l’infini en quelques pas. Quelle est la cause la plus probable ?",
      ar: "أثناء التدريب، تتذبذب الخسارة صعودًا وهبوطًا ثم تنفجر نحو اللانهاية بعد بضع خطوات. ما السبب الأرجح؟"
    },
    options: {
      en: ["The learning rate is too low", "Too many training epochs", "The learning rate is too high", "The dataset has too many rows"],
      fr: ["Le taux d’apprentissage est trop faible", "Trop d’époques d’entraînement", "Le taux d’apprentissage est trop élevé", "Le jeu de données a trop de lignes"],
      ar: ["معدل التعلم منخفض جدًا", "عدد مفرط من حقب التدريب (epochs)", "معدل التعلم (learning rate) مرتفع جدًا", "مجموعة البيانات تحوي صفوفًا كثيرة جدًا"]
    },
    answer: 2,
    explain: {
      en: "With a step that is too large, each update overshoots the minimum and lands higher on the other side, so the loss oscillates and diverges. A learning rate that is too low gives the opposite symptom: very slow but steady progress.",
      fr: "Avec un pas trop grand, chaque mise à jour dépasse le minimum et atterrit plus haut de l’autre côté : la perte oscille et diverge. Un taux trop faible donne le symptôme inverse : une progression très lente mais régulière.",
      ar: "حين تكون الخطوة كبيرة جدًا، يتجاوز كل تحديث النقطة الدنيا ويهبط أعلى في الجهة المقابلة، فتتذبذب الخسارة وتتباعد. أما معدل التعلم المنخفض جدًا فيعطي العَرَض المعاكس: تقدّمًا بطيئًا جدًا لكنه منتظم."
    }
  },
  {
    id: "fund-gd-minibatch-standard",
    concept: "what-is-gradient-descent",
    difficulty: 1,
    q: {
      en: "Which gradient descent variant is the standard for training modern deep networks?",
      fr: "Quelle variante de la descente de gradient est la norme pour entraîner les réseaux profonds modernes ?",
      ar: "أيّ صيغة من صيغ الانحدار التدرّجي هي المعيار في تدريب الشبكات العميقة الحديثة؟"
    },
    options: {
      en: ["Mini-batch SGD (e.g. 32 to 512 samples per step)", "Full-batch gradient descent on all samples per step", "Pure SGD with exactly one sample per step", "Solving the normal equation in closed form"],
      fr: ["SGD par mini-lots (par ex. 32 à 512 exemples par pas)", "Descente de gradient sur tout le jeu de données à chaque pas", "SGD pur avec un seul exemple par pas", "Résoudre l’équation normale de façon analytique"],
      ar: ["SGD بالدُفعات الصغيرة (mini-batch)، مثلًا من 32 إلى 512 عيّنة في كل خطوة", "الانحدار التدرّجي على كامل العيّنات في كل خطوة", "SGD الخالص بعيّنة واحدة في كل خطوة", "حلّ المعادلة الطبيعية بصيغة مغلقة"]
    },
    answer: 0,
    explain: {
      en: "Mini-batches give gradient estimates that are stable enough to converge yet cheap enough to compute often, and they map well onto GPU matrix operations. Full-batch is slow on big data and single-sample SGD is very noisy.",
      fr: "Les mini-lots donnent des estimations du gradient assez stables pour converger et assez peu coûteuses pour être calculées souvent, et ils s’adaptent bien aux opérations matricielles des GPU. Le lot complet est lent sur de gros volumes et le SGD à un exemple est très bruité.",
      ar: "تعطي الدُفعات الصغيرة تقديرات للتدرّج مستقرة بما يكفي للتقارب ورخيصة بما يكفي لحسابها كثيرًا، كما تتلاءم جيدًا مع عمليات المصفوفات على وحدات GPU. أما الدفعة الكاملة فبطيئة على البيانات الضخمة، وSGD بعيّنة واحدة كثير الضجيج."
    }
  },
  {
    id: "fund-gd-why-minus-gradient",
    concept: "what-is-gradient-descent",
    difficulty: 2,
    q: {
      en: "Why does gradient descent move parameters in the direction of the negative gradient?",
      fr: "Pourquoi la descente de gradient déplace-t-elle les paramètres dans la direction opposée au gradient ?",
      ar: "لماذا يحرّك الانحدار التدرّجي المعاملات في اتجاه سالب التدرّج؟"
    },
    options: {
      en: ["Because the gradient is always negative", "To keep the weights from becoming negative", "The gradient points toward the steepest increase in cost, so the opposite lowers it", "To make the learning rate smaller over time"],
      fr: ["Parce que le gradient est toujours négatif", "Pour empêcher les poids de devenir négatifs", "Le gradient pointe vers la plus forte hausse du coût, donc la direction opposée le fait baisser", "Pour diminuer le taux d’apprentissage au fil du temps"],
      ar: ["لأن التدرّج سالب دائمًا", "لمنع الأوزان من أن تصبح سالبة", "لأن التدرّج يشير إلى أشدّ ارتفاع للتكلفة، فالاتجاه المعاكس يخفّضها", "لتصغير معدل التعلم مع مرور الوقت"]
    },
    answer: 2,
    explain: {
      en: "By definition the gradient points in the direction of steepest ascent of the function. Since training wants to minimize the cost, it steps the opposite way, like walking downhill in fog by feeling the slope.",
      fr: "Par définition, le gradient pointe vers la plus forte montée de la fonction. Comme l’entraînement cherche à minimiser le coût, il avance dans le sens opposé, comme on descend une montagne dans le brouillard en sentant la pente.",
      ar: "يشير التدرّج بالتعريف إلى اتجاه أشدّ صعود للدالة. ولأن التدريب يسعى إلى تقليل التكلفة، فإنه يخطو في الاتجاه المعاكس، كمن ينزل جبلًا في الضباب متحسّسًا الانحدار."
    }
  },

  // ── loss-vs-cost-function ─────────────────────────────────
  {
    id: "fund-loss-vs-cost-definition",
    concept: "loss-vs-cost-function",
    difficulty: 1,
    q: {
      en: "What is the usual distinction between a loss function and a cost function?",
      fr: "Quelle est la distinction habituelle entre fonction de perte et fonction de coût ?",
      ar: "ما التمييز المعتاد بين دالة الخسارة (loss function) ودالة التكلفة (cost function)؟"
    },
    options: {
      en: ["Loss is measured on the test set; cost on the training set", "Loss is the error on one sample; cost aggregates losses over the dataset", "Loss is for regression; cost is for classification", "They are unrelated: loss measures speed, cost measures memory"],
      fr: ["La perte se mesure sur le test ; le coût sur l’entraînement", "La perte est l’erreur sur un exemple ; le coût agrège les pertes sur le jeu de données", "La perte sert à la régression ; le coût à la classification", "Elles n’ont aucun lien : la perte mesure la vitesse, le coût la mémoire"],
      ar: ["تُقاس الخسارة على مجموعة الاختبار، والتكلفة على مجموعة التدريب", "الخسارة هي الخطأ على عيّنة واحدة، والتكلفة تجمع الخسائر على كامل البيانات", "الخسارة للانحدار والتكلفة للتصنيف", "لا علاقة بينهما: الخسارة تقيس السرعة والتكلفة تقيس الذاكرة"]
    },
    answer: 1,
    explain: {
      en: "The loss L(ŷᵢ, yᵢ) scores a single prediction. The cost J(θ) averages (or sums) those losses over all training samples, often plus a regularization term, and is what the optimizer minimizes.",
      fr: "La perte L(ŷᵢ, yᵢ) évalue une seule prédiction. Le coût J(θ) fait la moyenne (ou la somme) de ces pertes sur tous les exemples d’entraînement, souvent avec un terme de régularisation, et c’est lui que l’optimiseur minimise.",
      ar: "تقيّم الخسارة L(ŷᵢ, yᵢ) تنبؤًا واحدًا. أما التكلفة J(θ) فهي متوسط (أو مجموع) هذه الخسائر على كل عيّنات التدريب، وغالبًا مع حدّ تنظيم، وهي ما يسعى المُحسِّن إلى تقليله."
    }
  },
  {
    id: "fund-loss-accuracy-not-differentiable",
    concept: "loss-vs-cost-function",
    difficulty: 2,
    q: {
      en: "Why isn’t accuracy used directly as the training loss for gradient-based classifiers?",
      fr: "Pourquoi n’utilise-t-on pas directement l’exactitude (accuracy) comme perte d’entraînement des classifieurs à gradient ?",
      ar: "لماذا لا تُستخدم الدقة (accuracy) مباشرةً دالةَ خسارة لتدريب المصنِّفات القائمة على التدرّج؟"
    },
    options: {
      en: ["It is too slow to compute on large datasets", "It can take values greater than 1", "It is a step function, so its gradient is zero almost everywhere", "Higher accuracy means a worse model"],
      fr: ["Elle est trop lente à calculer sur de gros jeux de données", "Elle peut dépasser 1", "C’est une fonction en escalier : son gradient est nul presque partout", "Une exactitude plus élevée signifie un moins bon modèle"],
      ar: ["لأن حسابها بطيء جدًا على البيانات الضخمة", "لأنها قد تتجاوز القيمة 1", "لأنها دالة سُلّمية، فتدرّجها صفر تقريبًا في كل مكان", "لأن الدقة الأعلى تعني نموذجًا أسوأ"]
    },
    answer: 2,
    explain: {
      en: "Nudging a weight slightly rarely flips any prediction, so accuracy stays flat and its derivative gives no direction to move. Smooth losses such as cross-entropy change continuously with the predicted probabilities.",
      fr: "Modifier légèrement un poids change rarement une prédiction : l’exactitude reste plate et sa dérivée n’indique aucune direction. Des pertes lisses comme l’entropie croisée varient continûment avec les probabilités prédites.",
      ar: "تعديل وزنٍ تعديلًا طفيفًا نادرًا ما يقلب أي تنبؤ، فتبقى الدقة ثابتة ولا تعطي مشتقتها أي اتجاه للحركة. أما دوال الخسارة الملساء كالإنتروبيا التقاطعية فتتغيّر باستمرار مع الاحتمالات المتنبَّأ بها."
    }
  },
  {
    id: "fund-loss-compute-mse-cost",
    concept: "loss-vs-cost-function",
    difficulty: 3,
    q: {
      en: "True values y = [10, 20, 30], predictions ŷ = [12, 18, 35]. What is the mean squared error cost?",
      fr: "Valeurs réelles y = [10, 20, 30], prédictions ŷ = [12, 18, 35]. Quel est le coût en erreur quadratique moyenne ?",
      ar: "القيم الحقيقية y = [10, 20, 30] والتنبؤات ŷ = [12, 18, 35]. ما قيمة تكلفة متوسط مربع الخطأ (MSE)؟"
    },
    options: {
      en: ["3", "9", "11", "33"],
      fr: ["3", "9", "11", "33"],
      ar: ["3", "9", "11", "33"]
    },
    answer: 2,
    explain: {
      en: "The per-sample squared losses are 4, 4 and 25; their mean is 33 / 3 = 11. 33 is the sum (no averaging) and 3 is the mean absolute error.",
      fr: "Les pertes quadratiques par exemple valent 4, 4 et 25 ; leur moyenne est 33 / 3 = 11. 33 est la somme (sans moyenne) et 3 l’erreur absolue moyenne.",
      ar: "الخسائر التربيعية لكل عيّنة هي 4 و4 و25، ومتوسطها 33 / 3 = 11. أما 33 فهو المجموع دون قسمة، و3 هو متوسط الخطأ المطلق."
    }
  },

  // ── linear-algebra ────────────────────────────────────────
  {
    id: "fund-la-matmul-shape",
    concept: "linear-algebra",
    difficulty: 1,
    q: {
      en: "Multiplying a (100 × 5) matrix by a (5 × 3) matrix gives a result of which shape?",
      fr: "Multiplier une matrice (100 × 5) par une matrice (5 × 3) donne un résultat de quelle forme ?",
      ar: "ضرب مصفوفة (100 × 5) في مصفوفة (5 × 3) يعطي ناتجًا بأيّ أبعاد؟"
    },
    options: {
      en: ["(5 × 5)", "(100 × 5)", "(3 × 100)", "(100 × 3)"],
      fr: ["(5 × 5)", "(100 × 5)", "(3 × 100)", "(100 × 3)"],
      ar: ["(5 × 5)", "(100 × 5)", "(3 × 100)", "(100 × 3)"]
    },
    answer: 3,
    explain: {
      en: "(n × d)·(d × k) gives (n × k): the inner dimensions (5) must match and disappear. In ML terms, 100 samples with 5 features become 100 samples with 3 outputs.",
      fr: "(n × d)·(d × k) donne (n × k) : les dimensions internes (5) doivent coïncider et disparaissent. En ML, 100 exemples à 5 variables deviennent 100 exemples à 3 sorties.",
      ar: "(n × d)·(d × k) يعطي (n × k): يجب أن يتطابق البُعدان الداخليان (5) ثم يختفيان. وبلغة التعلم الآلي، تصبح 100 عيّنة بـ5 ميزات 100 عيّنة بـ3 مخرجات."
    }
  },
  {
    id: "fund-la-cosine-vs-dot",
    concept: "linear-algebra",
    difficulty: 2,
    q: {
      en: "When comparing two document embeddings, why use cosine similarity rather than the raw dot product?",
      fr: "Pour comparer deux embeddings de documents, pourquoi utiliser la similarité cosinus plutôt que le produit scalaire brut ?",
      ar: "عند مقارنة تضمينَي مستندين، لماذا نستخدم تشابه جيب التمام (cosine similarity) بدل الجداء النقطي الخام؟"
    },
    options: {
      en: ["Cosine is faster to compute on a GPU", "Cosine ignores vector length, so only the direction (meaning) is compared", "The dot product cannot handle negative numbers", "Cosine always returns values above 1"],
      fr: ["Le cosinus est plus rapide à calculer sur GPU", "Le cosinus ignore la longueur des vecteurs : seule la direction (le sens) est comparée", "Le produit scalaire ne gère pas les nombres négatifs", "Le cosinus renvoie toujours des valeurs supérieures à 1"],
      ar: ["لأن جيب التمام أسرع حسابًا على GPU", "لأن جيب التمام يتجاهل طول المتجه، فلا يُقارَن إلا الاتجاه (المعنى)", "لأن الجداء النقطي لا يتعامل مع الأعداد السالبة", "لأن جيب التمام يعيد دائمًا قيمًا أكبر من 1"]
    },
    answer: 1,
    explain: {
      en: "The dot product grows with vector magnitude, so a long document can look “similar” to everything. Cosine divides by both norms, leaving a score between −1 and 1 that reflects only direction.",
      fr: "Le produit scalaire augmente avec la norme des vecteurs : un long document peut sembler « similaire » à tout. Le cosinus divise par les deux normes et donne un score entre −1 et 1 qui ne reflète que la direction.",
      ar: "يكبر الجداء النقطي مع طول المتجه، فقد يبدو مستند طويل «شبيهًا» بكل شيء. أما جيب التمام فيقسم على المعيارين، ويعطي درجة بين −1 و1 تعكس الاتجاه فقط."
    }
  },
  {
    id: "fund-la-l1-l2-norms",
    concept: "linear-algebra",
    difficulty: 2,
    q: {
      en: "Used as penalties on model weights, how do the L1 and L2 norms behave differently?",
      fr: "Utilisées comme pénalités sur les poids d’un modèle, en quoi les normes L1 et L2 se comportent-elles différemment ?",
      ar: "عند استخدامهما عقوبةً على أوزان النموذج، كيف يختلف سلوك المعيارين L1 وL2؟"
    },
    options: {
      en: ["L1 pushes many weights to exactly zero; L2 keeps weights small and spread out", "L2 pushes many weights to exactly zero; L1 keeps them small and spread out", "Both make every weight exactly zero", "Neither affects the weights; they only rescale the inputs"],
      fr: ["L1 met beaucoup de poids exactement à zéro ; L2 garde des poids petits et répartis", "L2 met beaucoup de poids exactement à zéro ; L1 les garde petits et répartis", "Les deux annulent exactement tous les poids", "Aucune n’agit sur les poids ; elles ne font que remettre les entrées à l’échelle"],
      ar: ["L1 يدفع كثيرًا من الأوزان إلى الصفر تمامًا، وL2 يُبقي الأوزان صغيرة وموزّعة", "L2 يدفع كثيرًا من الأوزان إلى الصفر تمامًا، وL1 يُبقيها صغيرة وموزّعة", "كلاهما يجعل كل الأوزان صفرًا تمامًا", "لا يؤثّر أيّ منهما في الأوزان، بل يعيدان فقط ضبط مقياس المدخلات"]
    },
    answer: 0,
    explain: {
      en: "The L1 norm Σ|wᵢ| has corners on the axes, so the optimum often lands where some weights are exactly zero (sparsity). The L2 norm Σwᵢ² is smooth and shrinks all weights proportionally without zeroing them.",
      fr: "La norme L1 Σ|wᵢ| a des « coins » sur les axes : l’optimum tombe souvent là où certains poids valent exactement zéro (parcimonie). La norme L2 Σwᵢ² est lisse et réduit tous les poids proportionnellement sans les annuler.",
      ar: "للمعيار L1 أي Σ|wᵢ| زوايا على المحاور، فكثيرًا ما تقع النقطة المثلى حيث تكون بعض الأوزان صفرًا تمامًا (التناثر). أما المعيار L2 أي Σwᵢ² فأملس ويقلّص كل الأوزان بنسبة دون أن يصفّرها."
    }
  },

  // ── probability-statistics ────────────────────────────────
  {
    id: "fund-stats-robust-median-iqr",
    concept: "probability-statistics",
    difficulty: 1,
    q: {
      en: "Which pair of statistics is robust to a few extreme outliers?",
      fr: "Quelle paire de statistiques est robuste à quelques valeurs aberrantes extrêmes ?",
      ar: "أيّ زوج من الإحصاءات متين أمام بضع قيم شاذة متطرفة؟"
    },
    options: {
      en: ["Mean and standard deviation", "Minimum and maximum", "Median and interquartile range (IQR)", "Mean and range"],
      fr: ["Moyenne et écart-type", "Minimum et maximum", "Médiane et écart interquartile (IQR)", "Moyenne et étendue"],
      ar: ["المتوسط والانحراف المعياري", "القيمة الدنيا والقيمة القصوى", "الوسيط والمدى الربيعي (IQR)", "المتوسط والمدى"]
    },
    answer: 2,
    explain: {
      en: "The median and IQR depend on the order of values, not their size, so one huge value barely moves them. The mean, standard deviation, min, max and range can all be dragged far by a single outlier.",
      fr: "La médiane et l’IQR dépendent de l’ordre des valeurs, pas de leur taille : une valeur énorme les déplace à peine. La moyenne, l’écart-type, le min, le max et l’étendue peuvent être fortement tirés par une seule valeur aberrante.",
      ar: "يعتمد الوسيط والمدى الربيعي على ترتيب القيم لا على حجمها، فلا تكاد قيمة ضخمة واحدة تحرّكهما. أما المتوسط والانحراف المعياري والقيم الدنيا والقصوى والمدى فقد تجرّها قيمة شاذة واحدة بعيدًا."
    }
  },
  {
    id: "fund-stats-pvalue-meaning",
    concept: "probability-statistics",
    difficulty: 2,
    q: {
      en: "A test comparing model A with model B gives p = 0.03. What does this mean?",
      fr: "Un test comparant le modèle A au modèle B donne p = 0,03. Qu’est-ce que cela signifie ?",
      ar: "أعطى اختبارٌ يقارن النموذج A بالنموذج B القيمة p = 0.03. ماذا يعني ذلك؟"
    },
    options: {
      en: ["There is a 3% chance that the null hypothesis is true", "Model A is better with 97% probability", "If there were no real difference, a result this extreme would happen about 3% of the time", "Model A improves the metric by 3%"],
      fr: ["Il y a 3 % de chances que l’hypothèse nulle soit vraie", "Le modèle A est meilleur avec une probabilité de 97 %", "S’il n’y avait aucune différence réelle, un résultat aussi extrême surviendrait environ 3 % du temps", "Le modèle A améliore la métrique de 3 %"],
      ar: ["احتمال صحة الفرضية الصفرية 3%", "النموذج A أفضل باحتمال 97%", "لو لم يكن هناك فرق حقيقي، لظهرت نتيجة بهذا التطرّف في نحو 3% من الحالات", "النموذج A يحسّن المقياس بنسبة 3%"]
    },
    answer: 2,
    explain: {
      en: "A p-value is computed assuming the null hypothesis (no difference) is true; it is not the probability that the null is true. It also says nothing about how large the effect is, so check effect sizes too.",
      fr: "La p-valeur se calcule en supposant l’hypothèse nulle (aucune différence) vraie ; ce n’est pas la probabilité que l’hypothèse nulle soit vraie. Elle ne dit rien non plus de l’ampleur de l’effet : regardez aussi la taille d’effet.",
      ar: "تُحسب القيمة الاحتمالية (p-value) بافتراض صحة الفرضية الصفرية (لا فرق)، وليست احتمال صحة هذه الفرضية. كما أنها لا تخبرنا بحجم الأثر، لذا يجب النظر في حجم الأثر أيضًا."
    }
  },
  {
    id: "fund-stats-bayes-base-rate",
    concept: "probability-statistics",
    difficulty: 3,
    q: {
      en: "A disease affects 1% of people. A test detects 99% of sick people and has a 5% false-positive rate. Someone tests positive. Roughly how likely are they to be sick?",
      fr: "Une maladie touche 1 % de la population. Un test détecte 99 % des malades et a 5 % de faux positifs. Une personne est testée positive. Quelle est à peu près la probabilité qu’elle soit malade ?",
      ar: "يصيب مرضٌ 1% من الناس. يكشف اختبارٌ 99% من المرضى، ونسبة إيجابياته الكاذبة 5%. جاءت نتيجة شخص إيجابية. ما الاحتمال التقريبي لأن يكون مريضًا؟"
    },
    options: {
      en: ["About 17%", "About 50%", "About 95%", "About 99%"],
      fr: ["Environ 17 %", "Environ 50 %", "Environ 95 %", "Environ 99 %"],
      ar: ["نحو 17%", "نحو 50%", "نحو 95%", "نحو 99%"]
    },
    answer: 0,
    explain: {
      en: "By Bayes’ theorem: 0.99 × 0.01 = 0.0099 true positives versus 0.05 × 0.99 ≈ 0.0495 false positives, so P(sick | positive) ≈ 0.0099 / 0.0594 ≈ 0.17. The low base rate means most positives are false alarms.",
      fr: "Par le théorème de Bayes : 0,99 × 0,01 = 0,0099 vrais positifs contre 0,05 × 0,99 ≈ 0,0495 faux positifs, donc P(malade | positif) ≈ 0,0099 / 0,0594 ≈ 0,17. Le faible taux de base fait que la plupart des positifs sont de fausses alertes.",
      ar: "وفق مبرهنة بايز: 0.99 × 0.01 = 0.0099 إيجابيات صحيحة مقابل 0.05 × 0.99 ≈ 0.0495 إيجابيات كاذبة، إذن P(مريض | إيجابي) ≈ 0.0099 / 0.0594 ≈ 0.17. انخفاض المعدل الأساسي يجعل معظم النتائج الإيجابية إنذارات كاذبة."
    }
  },
  {
    id: "fund-stats-mse-is-gaussian-mle",
    concept: "probability-statistics",
    difficulty: 2,
    q: {
      en: "Minimizing mean squared error in linear regression is equivalent to maximum likelihood estimation under which assumption?",
      fr: "Minimiser l’erreur quadratique moyenne en régression linéaire équivaut au maximum de vraisemblance sous quelle hypothèse ?",
      ar: "تقليل متوسط مربع الخطأ في الانحدار الخطي يكافئ تقدير الإمكان الأعظم (MLE) تحت أيّ افتراض؟"
    },
    options: {
      en: ["The labels follow a Bernoulli distribution", "The noise around the prediction is Gaussian", "The features are uniformly distributed", "The target is a Poisson count"],
      fr: ["Les étiquettes suivent une loi de Bernoulli", "Le bruit autour de la prédiction est gaussien", "Les variables suivent une loi uniforme", "La cible est un comptage de Poisson"],
      ar: ["التسميات تتبع توزيع برنولي", "الضجيج حول التنبؤ يتبع توزيعًا غاوسيًا (طبيعيًا)", "الميزات موزّعة توزيعًا منتظمًا", "الهدف عدٌّ يتبع توزيع بواسون"]
    },
    answer: 1,
    explain: {
      en: "The log-likelihood of Gaussian noise is, up to constants, minus the sum of squared residuals, so maximizing one minimizes the other. Likewise, log-loss is maximum likelihood for Bernoulli labels.",
      fr: "La log-vraisemblance d’un bruit gaussien est, à des constantes près, l’opposé de la somme des résidus au carré : maximiser l’une revient à minimiser l’autre. De même, la log-loss est le maximum de vraisemblance pour des étiquettes de Bernoulli.",
      ar: "لوغاريتم الإمكان لضجيج غاوسي يساوي، بإهمال الثوابت، سالب مجموع مربعات البواقي، فتعظيم أحدهما يعني تقليل الآخر. وبالمثل، فإن خسارة اللوغاريتم (log-loss) هي الإمكان الأعظم لتسميات برنولي."
    }
  },

  // ── ml-workflow ───────────────────────────────────────────
  {
    id: "fund-workflow-baseline-first",
    concept: "ml-workflow",
    difficulty: 1,
    q: {
      en: "Before training any model, what should you establish when framing the problem?",
      fr: "Avant d’entraîner un modèle, que faut-il établir lors du cadrage du problème ?",
      ar: "قبل تدريب أي نموذج، ما الذي ينبغي تحديده عند صياغة المشكلة؟"
    },
    options: {
      en: ["The final hyperparameters of the model", "The deployment server’s hardware", "The number of layers in the network", "The target, the success metric and a simple baseline to beat"],
      fr: ["Les hyperparamètres définitifs du modèle", "Le matériel du serveur de déploiement", "Le nombre de couches du réseau", "La cible, la métrique de succès et une référence simple à battre"],
      ar: ["المعاملات الفائقة النهائية للنموذج", "عتاد خادم النشر", "عدد طبقات الشبكة", "الهدف، ومقياس النجاح، ونموذج مرجعي بسيط يجب التفوّق عليه"]
    },
    answer: 3,
    explain: {
      en: "Framing decides what you predict and how success is measured. A baseline such as “predict the majority class” or “last month’s value” tells you whether a model adds any real value.",
      fr: "Le cadrage décide de ce que l’on prédit et de la façon de mesurer le succès. Une référence comme « prédire la classe majoritaire » ou « la valeur du mois dernier » indique si un modèle apporte une vraie valeur.",
      ar: "تحدّد صياغة المشكلة ما نتنبأ به وكيف نقيس النجاح. ونموذج مرجعي (baseline) مثل «التنبؤ بالفئة الأغلب» أو «قيمة الشهر الماضي» يبيّن ما إذا كان النموذج يضيف قيمة حقيقية."
    }
  },
  {
    id: "fund-workflow-save-pipeline",
    concept: "ml-workflow",
    difficulty: 2,
    q: {
      en: "Why should you serialize the whole scikit-learn Pipeline (preprocessing + model) instead of only the trained model?",
      fr: "Pourquoi sérialiser tout le Pipeline scikit-learn (prétraitement + modèle) plutôt que le seul modèle entraîné ?",
      ar: "لماذا ينبغي حفظ خط المعالجة Pipeline الكامل في scikit-learn (المعالجة المسبقة + النموذج) بدل حفظ النموذج المدرَّب وحده؟"
    },
    options: {
      en: ["The file is smaller than a bare model", "So production applies exactly the same preprocessing as training", "Pipelines train faster than bare models", "Bare models cannot be saved with joblib"],
      fr: ["Le fichier est plus petit qu’un modèle seul", "Pour que la production applique exactement le même prétraitement qu’à l’entraînement", "Les pipelines s’entraînent plus vite que les modèles seuls", "Un modèle seul ne peut pas être sauvegardé avec joblib"],
      ar: ["لأن الملف أصغر من النموذج وحده", "لكي تطبّق بيئة الإنتاج المعالجة المسبقة نفسها تمامًا التي طُبّقت في التدريب", "لأن خطوط المعالجة تتدرّب أسرع من النماذج المجرّدة", "لأن النموذج وحده لا يمكن حفظه بـ joblib"]
    },
    answer: 1,
    explain: {
      en: "A model expects inputs imputed, scaled and encoded with the statistics learned during training. Shipping the full pipeline guarantees those exact transforms run in production, avoiding training/serving skew.",
      fr: "Un modèle attend des entrées imputées, mises à l’échelle et encodées avec les statistiques apprises à l’entraînement. Livrer le pipeline complet garantit que ces mêmes transformations s’exécutent en production, sans décalage entre entraînement et service.",
      ar: "يتوقع النموذج مدخلات عُوّضت قيمها المفقودة ووُحّدت مقاييسها ورُمّزت بالإحصاءات المتعلَّمة أثناء التدريب. وشحن خط المعالجة كاملًا يضمن تنفيذ هذه التحويلات نفسها في الإنتاج، فيتجنّب التباين بين التدريب والتشغيل."
    }
  },
  {
    id: "fund-workflow-leak-free-order",
    concept: "ml-workflow",
    difficulty: 3,
    q: {
      en: "Which order of steps avoids data leakage?",
      fr: "Quel ordre d’étapes évite la fuite de données ?",
      ar: "أيّ ترتيب للخطوات يتجنّب تسرّب البيانات؟"
    },
    options: {
      en: ["Fit scaler on all data → split → train model", "Split → fit scaler on train → transform train and test → train model", "Impute with all-data means → split → train model", "Train model → split → fit scaler on test"],
      fr: ["Ajuster le scaler sur toutes les données → découper → entraîner", "Découper → ajuster le scaler sur l’entraînement → transformer train et test → entraîner", "Imputer avec les moyennes de toutes les données → découper → entraîner", "Entraîner → découper → ajuster le scaler sur le test"],
      ar: ["ملاءمة أداة التوحيد على كل البيانات ← التقسيم ← تدريب النموذج", "التقسيم ← ملاءمة أداة التوحيد على بيانات التدريب ← تحويل التدريب والاختبار ← تدريب النموذج", "التعويض بمتوسطات كل البيانات ← التقسيم ← تدريب النموذج", "تدريب النموذج ← التقسيم ← ملاءمة أداة التوحيد على الاختبار"]
    },
    answer: 1,
    explain: {
      en: "Any statistic learned from the test rows (means, scales, imputation values) lets test information seep into training and inflates scores. Split first, fit every transformer on training data only, then apply it to both sets.",
      fr: "Toute statistique apprise sur les lignes de test (moyennes, échelles, valeurs d’imputation) laisse fuiter de l’information du test vers l’entraînement et gonfle les scores. Découpez d’abord, ajustez chaque transformation sur l’entraînement seul, puis appliquez-la aux deux jeux.",
      ar: "أيّ إحصاءة تُتعلَّم من صفوف الاختبار (متوسطات، مقاييس، قيم تعويض) تسرّب معلومات الاختبار إلى التدريب وتضخّم النتائج. قسّم أولًا، ثم لائم كل محوِّل على بيانات التدريب وحدها، ثم طبّقه على المجموعتين."
    }
  },
  {
    id: "fund-workflow-monitoring-drift",
    concept: "ml-workflow",
    difficulty: 2,
    q: {
      en: "A model performed well at launch, but its accuracy slowly drops over the following months. Which workflow stage was neglected?",
      fr: "Un modèle performant au lancement voit sa précision baisser lentement au fil des mois. Quelle étape du workflow a été négligée ?",
      ar: "أدّى نموذجٌ أداءً جيدًا عند إطلاقه، لكن دقته تتراجع ببطء خلال الأشهر التالية. أيّ مرحلة من سير العمل أُهملت؟"
    },
    options: {
      en: ["Monitoring for drift and retraining on fresh data", "Choosing a random_state for the split", "Writing the problem statement", "One-hot encoding the categorical features"],
      fr: ["La surveillance de la dérive et le réentraînement sur des données récentes", "Le choix d’un random_state pour le découpage", "La rédaction de l’énoncé du problème", "L’encodage one-hot des variables catégorielles"],
      ar: ["مراقبة الانجراف (drift) وإعادة التدريب على بيانات حديثة", "اختيار random_state للتقسيم", "كتابة صياغة المشكلة", "الترميز الأحادي للميزات الفئوية"]
    },
    answer: 0,
    explain: {
      en: "The real world changes after deployment, so the data drifts away from what the model learned. The workflow loops: monitor live performance and input distributions, and retrain when they shift.",
      fr: "Le monde réel évolue après le déploiement et les données s’éloignent de ce que le modèle a appris. Le workflow est une boucle : surveillez les performances et les distributions d’entrée, et réentraînez quand elles changent.",
      ar: "يتغيّر العالم الحقيقي بعد النشر، فتبتعد البيانات عمّا تعلّمه النموذج. وسير العمل حلقة متكررة: راقب الأداء الفعلي وتوزيعات المدخلات، وأعِد التدريب عندما تنزاح."
    }
  },

  // ── what-is-de ────────────────────────────────────────────
  {
    id: "fund-de-main-role",
    concept: "what-is-de",
    difficulty: 1,
    q: {
      en: "What is the main responsibility of data engineering?",
      fr: "Quelle est la responsabilité principale du data engineering ?",
      ar: "ما المسؤولية الرئيسية لهندسة البيانات (data engineering)؟"
    },
    options: {
      en: ["Choosing the best ML algorithm for each problem", "Building reliable pipelines and storage that deliver clean data to analysts and models", "Designing dashboards and slide decks for executives", "Labeling training examples by hand"],
      fr: ["Choisir le meilleur algorithme de ML pour chaque problème", "Construire des pipelines et un stockage fiables qui livrent des données propres aux analystes et aux modèles", "Concevoir des tableaux de bord et des présentations pour la direction", "Étiqueter à la main les exemples d’entraînement"],
      ar: ["اختيار أفضل خوارزمية تعلم آلي لكل مشكلة", "بناء خطوط بيانات ومخازن موثوقة توصل بيانات نظيفة إلى المحلّلين والنماذج", "تصميم لوحات المعلومات والعروض التقديمية للإدارة", "وسم أمثلة التدريب يدويًا"]
    },
    answer: 1,
    explain: {
      en: "Data engineers build the “plumbing”: ingestion, transformation, storage and orchestration. Without clean, timely data, no analyst or model can do good work.",
      fr: "Les data engineers construisent la « plomberie » : ingestion, transformation, stockage et orchestration. Sans données propres et à jour, aucun analyste ni modèle ne peut bien travailler.",
      ar: "يبني مهندسو البيانات «السباكة»: الاستيعاب، والتحويل، والتخزين، والتنسيق. ومن دون بيانات نظيفة وفي وقتها لا يستطيع أيّ محلّل أو نموذج أداء عمل جيد."
    }
  },
  {
    id: "fund-de-idempotency",
    concept: "what-is-de",
    difficulty: 2,
    q: {
      en: "A data pipeline is described as idempotent. What does that guarantee?",
      fr: "Un pipeline de données est dit idempotent. Que cela garantit-il ?",
      ar: "يوصف خط بيانات بأنه متساوي القوى (idempotent). ماذا يضمن ذلك؟"
    },
    options: {
      en: ["It never fails", "It processes data in real time", "Running it twice on the same input gives the same result as running it once", "It automatically deletes duplicate source systems"],
      fr: ["Il n’échoue jamais", "Il traite les données en temps réel", "L’exécuter deux fois sur la même entrée donne le même résultat qu’une seule fois", "Il supprime automatiquement les systèmes sources en double"],
      ar: ["أنه لا يفشل أبدًا", "أنه يعالج البيانات في الزمن الحقيقي", "أن تشغيله مرتين على المدخلات نفسها يعطي النتيجة نفسها كتشغيله مرة واحدة", "أنه يحذف أنظمة المصدر المكرّرة تلقائيًا"]
    },
    answer: 2,
    explain: {
      en: "Pipelines are often retried after failures or re-run for backfills. Idempotency means a rerun does not duplicate rows or corrupt totals, so retries are safe.",
      fr: "Les pipelines sont souvent relancés après une panne ou pour un rattrapage historique. L’idempotence garantit qu’une relance ne duplique pas de lignes et ne fausse pas les totaux : relancer est sans risque.",
      ar: "كثيرًا ما يُعاد تشغيل خطوط البيانات بعد عطل أو لإعادة معالجة بيانات سابقة. ويعني تساوي القوى أن إعادة التشغيل لا تكرّر الصفوف ولا تفسد المجاميع، فتكون الإعادة آمنة."
    }
  },
  {
    id: "fund-de-medallion-layers",
    concept: "what-is-de",
    difficulty: 1,
    q: {
      en: "In a lakehouse organized as Bronze, Silver and Gold layers, what do the layers usually hold?",
      fr: "Dans un lakehouse organisé en couches Bronze, Silver et Gold, que contiennent habituellement ces couches ?",
      ar: "في مستودع lakehouse منظَّم في طبقات Bronze وSilver وGold، ماذا تحتوي هذه الطبقات عادةً؟"
    },
    options: {
      en: ["Raw data, cleaned data, aggregated business-ready data", "Old data, recent data, real-time data", "Free, paid and premium datasets", "Training, validation and test sets"],
      fr: ["Données brutes, données nettoyées, données agrégées prêtes pour le métier", "Données anciennes, récentes, temps réel", "Jeux de données gratuits, payants et premium", "Jeux d’entraînement, de validation et de test"],
      ar: ["بيانات خام، وبيانات منظَّفة، وبيانات مجمّعة جاهزة للأعمال", "بيانات قديمة، وحديثة، وآنية", "مجموعات بيانات مجانية ومدفوعة ومميّزة", "مجموعات التدريب والتحقق والاختبار"]
    },
    answer: 0,
    explain: {
      en: "Bronze keeps raw ingested data, Silver holds cleaned and conformed tables, and Gold holds aggregated, analytics-ready models. Keeping the raw layer lets you rebuild everything downstream if logic changes.",
      fr: "Bronze conserve les données brutes ingérées, Silver les tables nettoyées et harmonisées, Gold les modèles agrégés prêts pour l’analyse. Garder la couche brute permet de tout reconstruire en aval si la logique change.",
      ar: "تحفظ طبقة Bronze البيانات الخام كما استُوعبت، وSilver الجداول المنظَّفة والموحّدة، وGold النماذج المجمّعة الجاهزة للتحليل. والإبقاء على الطبقة الخام يتيح إعادة بناء كل ما بعدها إن تغيّر المنطق."
    }
  },

  // ── etl-vs-elt ────────────────────────────────────────────
  {
    id: "fund-elt-transform-where",
    concept: "etl-vs-elt",
    difficulty: 1,
    q: {
      en: "In an ELT pipeline, where and when does the transformation happen?",
      fr: "Dans un pipeline ELT, où et quand a lieu la transformation ?",
      ar: "في خط بيانات ELT، أين ومتى يحدث التحويل؟"
    },
    options: {
      en: ["On a separate server, before loading", "On the source database, before extraction", "Inside the warehouse, after the raw data is loaded", "On the analyst’s laptop, after the dashboard is built"],
      fr: ["Sur un serveur séparé, avant le chargement", "Sur la base source, avant l’extraction", "Dans l’entrepôt, après le chargement des données brutes", "Sur l’ordinateur de l’analyste, après la création du tableau de bord"],
      ar: ["على خادم منفصل قبل التحميل", "على قاعدة بيانات المصدر قبل الاستخراج", "داخل المستودع بعد تحميل البيانات الخام", "على حاسوب المحلّل بعد بناء لوحة المعلومات"]
    },
    answer: 2,
    explain: {
      en: "ELT means Extract → Load → Transform: raw data lands in the cloud warehouse first and is transformed there with SQL tools such as dbt. ETL transforms on a separate engine before loading.",
      fr: "ELT signifie Extract → Load → Transform : les données brutes arrivent d’abord dans l’entrepôt cloud et y sont transformées en SQL, par exemple avec dbt. L’ETL transforme sur un moteur séparé avant le chargement.",
      ar: "يعني ELT الترتيب استخراج ← تحميل ← تحويل: تصل البيانات الخام أولًا إلى المستودع السحابي وتُحوَّل هناك بأدوات SQL مثل dbt. أما ETL فيحوّل على محرّك منفصل قبل التحميل."
    }
  },
  {
    id: "fund-elt-reprocess-history",
    concept: "etl-vs-elt",
    difficulty: 2,
    q: {
      en: "A business rule changes and the team must recompute three years of metrics. Why is this easier with ELT than with classic ETL?",
      fr: "Une règle métier change et l’équipe doit recalculer trois ans d’indicateurs. Pourquoi est-ce plus simple en ELT qu’en ETL classique ?",
      ar: "تغيّرت قاعدة عمل، وعلى الفريق إعادة حساب مؤشرات ثلاث سنوات. لماذا يكون ذلك أسهل مع ELT منه مع ETL التقليدي؟"
    },
    options: {
      en: ["ELT pipelines never need SQL", "ELT keeps the raw data in the warehouse, so new transforms can be re-run on history", "ELT stores less data, so queries are faster", "ETL deletes the warehouse after every run"],
      fr: ["Les pipelines ELT n’ont jamais besoin de SQL", "L’ELT conserve les données brutes dans l’entrepôt : on peut relancer de nouvelles transformations sur l’historique", "L’ELT stocke moins de données, donc les requêtes sont plus rapides", "L’ETL supprime l’entrepôt après chaque exécution"],
      ar: ["لأن خطوط ELT لا تحتاج إلى SQL أبدًا", "لأن ELT يحتفظ بالبيانات الخام في المستودع، فيمكن إعادة تشغيل تحويلات جديدة على السجل التاريخي", "لأن ELT يخزّن بيانات أقل فتكون الاستعلامات أسرع", "لأن ETL يحذف المستودع بعد كل تشغيل"]
    },
    answer: 1,
    explain: {
      en: "In ETL only the already-transformed output is stored, so the original detail may be gone. ELT loads raw data first and keeps it, so you just rewrite the SQL model and rebuild the history.",
      fr: "En ETL, seul le résultat déjà transformé est stocké : le détail d’origine peut avoir disparu. L’ELT charge et conserve d’abord les données brutes : il suffit de réécrire le modèle SQL et de reconstruire l’historique.",
      ar: "في ETL لا يُخزَّن إلا الناتج المحوَّل مسبقًا، فقد تضيع التفاصيل الأصلية. أما ELT فيحمّل البيانات الخام أولًا ويحتفظ بها، فيكفي إعادة كتابة نموذج SQL وإعادة بناء التاريخ."
    }
  },
  {
    id: "fund-etl-pii-masking",
    concept: "etl-vs-elt",
    difficulty: 3,
    q: {
      en: "A source system contains raw national ID numbers that, by law, must never be stored in the analytics platform. Which design fits?",
      fr: "Un système source contient des numéros d’identité nationaux bruts qui, selon la loi, ne doivent jamais être stockés dans la plateforme analytique. Quelle architecture convient ?",
      ar: "يحتوي نظام مصدر على أرقام هوية وطنية خام يمنع القانون تخزينها في منصة التحليلات إطلاقًا. أيّ تصميم يناسب ذلك؟"
    },
    options: {
      en: ["ELT: load everything raw, then mask it later with SQL", "ETL: mask or drop the IDs in a transform step before loading", "Load the IDs to the warehouse but hide the table from analysts", "Skip transformation entirely and query the source directly"],
      fr: ["ELT : tout charger brut, puis masquer plus tard en SQL", "ETL : masquer ou supprimer les identifiants lors d’une transformation avant le chargement", "Charger les identifiants dans l’entrepôt mais cacher la table aux analystes", "Ne faire aucune transformation et interroger directement la source"],
      ar: ["ELT: تحميل كل شيء خامًا ثم إخفاؤه لاحقًا بـ SQL", "ETL: إخفاء المعرّفات أو حذفها في خطوة تحويل قبل التحميل", "تحميل المعرّفات إلى المستودع مع إخفاء الجدول عن المحلّلين", "الاستغناء عن التحويل والاستعلام من المصدر مباشرةً"]
    },
    answer: 1,
    explain: {
      en: "Any design that loads raw IDs first, even if hidden or masked later, has already stored them. ETL’s transform-before-load step is exactly what lets sensitive data be scrubbed before it reaches storage.",
      fr: "Toute architecture qui charge d’abord les identifiants bruts, même cachés ou masqués ensuite, les a déjà stockés. L’étape de transformation avant chargement de l’ETL est justement ce qui permet d’épurer les données sensibles avant le stockage.",
      ar: "أيّ تصميم يحمّل المعرّفات الخام أولًا، حتى لو أخفاها أو قنّعها لاحقًا، يكون قد خزّنها بالفعل. وخطوة التحويل قبل التحميل في ETL هي بالضبط ما يتيح تنقية البيانات الحساسة قبل وصولها إلى التخزين."
    }
  }
];
