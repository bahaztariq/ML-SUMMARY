/** Quiz questions: mlops. See index.js for the question format. */
/** @type {import('./index.js').Question[]} */
export default [
  // ── ab-testing-deployment ──
  {
    id: "ops-deploy-ab-test",
    concept: "ab-testing-deployment",
    difficulty: 1,
    q: {
      en: "Which release strategy randomly splits users between the old and new model and compares business metrics with a statistical test?",
      fr: "Quelle stratégie de mise en production répartit aléatoirement les utilisateurs entre l'ancien et le nouveau modèle et compare des métriques métier par un test statistique ?",
      ar: "أي استراتيجية إطلاق توزّع المستخدمين عشوائيًا بين النموذج القديم والجديد وتقارن مقاييس الأعمال باختبار إحصائي؟"
    },
    options: {
      en: [
        "Shadow deployment",
        "Canary release",
        "A/B testing",
        "Blue-green switch"
      ],
      fr: [
        "Le déploiement fantôme (shadow)",
        "Le déploiement canari",
        "Le test A/B",
        "La bascule blue-green"
      ],
      ar: [
        "النشر الظلّي (shadow)",
        "الإطلاق الكناري (canary)",
        "اختبار A/B",
        "التبديل الأزرق-الأخضر (blue-green)"
      ]
    },
    answer: 2,
    explain: {
      en: "An A/B test assigns users at random so the only systematic difference between groups is the model, then checks whether the gap in conversion or revenue is statistically significant. Shadow and canary focus on safety rather than measuring business impact.",
      fr: "Un test A/B affecte les utilisateurs au hasard pour que la seule différence systématique entre groupes soit le modèle, puis vérifie si l'écart de conversion ou de revenu est statistiquement significatif. Le shadow et le canari visent la sécurité plutôt que la mesure de l'impact métier.",
      ar: "يوزّع اختبار A/B المستخدمين عشوائيًا بحيث يكون النموذج هو الفرق المنهجي الوحيد بين المجموعتين، ثم يتحقق مما إذا كان الفرق في التحويل أو الإيرادات ذا دلالة إحصائية. أما النشر الظلّي والكناري فيركّزان على الأمان لا على قياس الأثر التجاري."
    }
  },
  {
    id: "ops-deploy-canary-why",
    concept: "ab-testing-deployment",
    difficulty: 2,
    q: {
      en: "Why does a canary release start by sending only about 5% of traffic to the new model?",
      fr: "Pourquoi un déploiement canari commence-t-il par n'envoyer qu'environ 5 % du trafic au nouveau modèle ?",
      ar: "لماذا يبدأ الإطلاق الكناري بإرسال نحو 5% فقط من الحركة إلى النموذج الجديد؟"
    },
    options: {
      en: [
        "To limit the damage if it misbehaves, watching errors, latency and key metrics before ramping up or rolling back",
        "Because 5% is the minimum sample for any statistical test",
        "Because the new model can only handle 5% of the load forever",
        "To train the new model on live traffic before using it"
      ],
      fr: [
        "Pour limiter les dégâts s'il se comporte mal, en surveillant erreurs, latence et métriques clés avant d'augmenter ou de revenir en arrière",
        "Parce que 5 % est l'échantillon minimal de tout test statistique",
        "Parce que le nouveau modèle ne pourra jamais gérer plus de 5 % de la charge",
        "Pour entraîner le nouveau modèle sur le trafic réel avant de l'utiliser"
      ],
      ar: [
        "للحد من الضرر إن أساء التصرف، مع مراقبة الأخطاء وزمن الاستجابة والمقاييس الأساسية قبل التوسيع أو التراجع",
        "لأن 5% هي العينة الدنيا لأي اختبار إحصائي",
        "لأن النموذج الجديد لن يستطيع أبدًا تحمّل أكثر من 5% من الحمل",
        "لتدريب النموذج الجديد على الحركة الحية قبل استخدامه"
      ]
    },
    answer: 0,
    explain: {
      en: "Offline metrics cannot catch every production problem, such as a missing feature or a latency spike. Exposing a small slice first keeps the blast radius small, and traffic is increased step by step only while the metrics stay healthy.",
      fr: "Les métriques hors ligne ne détectent pas tous les problèmes de production, comme une variable manquante ou un pic de latence. Exposer d'abord une petite tranche limite le rayon d'impact, et le trafic n'augmente par paliers que tant que les métriques restent saines.",
      ar: "لا تكشف المقاييس غير المتصلة كل مشكلات الإنتاج، مثل ميزة مفقودة أو قفزة في زمن الاستجابة. وتعريض شريحة صغيرة أولًا يحصر نطاق الضرر، ولا تُزاد الحركة تدريجيًا إلا ما دامت المقاييس سليمة."
    }
  },
  {
    id: "ops-deploy-shadow-scenario",
    concept: "ab-testing-deployment",
    difficulty: 3,
    q: {
      en: "You rewrote a fraud model's feature pipeline and want to check its latency and how often its decisions differ from the current model on real traffic, with zero risk to customers. Which strategy fits?",
      fr: "Vous avez réécrit le pipeline de variables d'un modèle antifraude et voulez vérifier sa latence et la fréquence à laquelle ses décisions diffèrent du modèle actuel sur le trafic réel, sans aucun risque pour les clients. Quelle stratégie convient ?",
      ar: "أعدت كتابة خط معالجة الميزات لنموذج كشف احتيال، وتريد التحقق من زمن استجابته ومن مدى اختلاف قراراته عن النموذج الحالي على الحركة الحقيقية، دون أي خطر على العملاء. أي استراتيجية تناسب؟"
    },
    options: {
      en: [
        "A/B test with 50% of customers on the new model",
        "Canary release to 10% of customers",
        "Replace the old model directly and roll back if complaints arrive",
        "Shadow deployment: mirror live requests to the new model and log its outputs without using them"
      ],
      fr: [
        "Un test A/B avec 50 % des clients sur le nouveau modèle",
        "Un déploiement canari sur 10 % des clients",
        "Remplacer directement l'ancien modèle et revenir en arrière en cas de plaintes",
        "Déploiement fantôme : dupliquer les requêtes réelles vers le nouveau modèle et journaliser ses sorties sans les utiliser"
      ],
      ar: [
        "اختبار A/B مع 50% من العملاء على النموذج الجديد",
        "إطلاق كناري على 10% من العملاء",
        "استبدال النموذج القديم مباشرة والتراجع إذا وصلت شكاوى",
        "النشر الظلّي: نسخ الطلبات الحية إلى النموذج الجديد وتسجيل مخرجاته دون استخدامها"
      ]
    },
    answer: 3,
    explain: {
      en: "In shadow mode the old model still makes every decision, so customers are never affected, while you collect real latency numbers and disagreement rates. Canary and A/B tests both let the new model act on real users.",
      fr: "En mode fantôme, l'ancien modèle prend encore toutes les décisions, donc les clients ne sont jamais affectés, tandis que vous collectez de vraies mesures de latence et de désaccord. Le canari et le test A/B laissent tous deux le nouveau modèle agir sur de vrais utilisateurs.",
      ar: "في الوضع الظلّي يظل النموذج القديم يتخذ كل القرارات فلا يتأثر العملاء أبدًا، بينما تجمع أرقامًا حقيقية لزمن الاستجابة ونسب الاختلاف. أما الكناري واختبار A/B فكلاهما يترك النموذج الجديد يؤثر في مستخدمين حقيقيين."
    }
  },
  // ── docker-ml ──
  {
    id: "ops-docker-why",
    concept: "docker-ml",
    difficulty: 1,
    q: {
      en: "What is the main reason to package a model service in a Docker image?",
      fr: "Quelle est la principale raison d'empaqueter un service de modèle dans une image Docker ?",
      ar: "ما السبب الرئيسي لتغليف خدمة نموذج في صورة Docker؟"
    },
    options: {
      en: [
        "The code, dependencies and system libraries run identically on a laptop, in CI and in production",
        "Docker makes models more accurate",
        "Docker replaces the need for a model registry",
        "Docker automatically retrains models when data changes"
      ],
      fr: [
        "Le code, les dépendances et les bibliothèques système s'exécutent à l'identique sur un portable, en CI et en production",
        "Docker rend les modèles plus précis",
        "Docker remplace le besoin d'un registre de modèles",
        "Docker réentraîne automatiquement les modèles quand les données changent"
      ],
      ar: [
        "تعمل الشيفرة والاعتماديات ومكتبات النظام بشكل مطابق على الحاسوب المحمول وفي CI وفي الإنتاج",
        "يجعل Docker النماذج أكثر دقة",
        "يغني Docker عن الحاجة إلى سجل نماذج",
        "يعيد Docker تدريب النماذج تلقائيًا عند تغيّر البيانات"
      ]
    },
    answer: 0,
    explain: {
      en: "An image is an immutable snapshot of the whole environment, down to Python, CUDA and OS library versions. That removes 'works on my machine' bugs and lets the same artifact move from testing to production.",
      fr: "Une image est un instantané immuable de tout l'environnement, jusqu'aux versions de Python, CUDA et des bibliothèques système. Cela supprime les bugs « ça marche sur ma machine » et permet au même artefact de passer des tests à la production.",
      ar: "الصورة لقطة ثابتة للبيئة بأكملها، حتى إصدارات Python و CUDA ومكتبات النظام. وهذا يزيل أخطاء «يعمل على جهازي» ويتيح للمنتَج نفسه الانتقال من الاختبار إلى الإنتاج."
    }
  },
  {
    id: "ops-docker-layer-cache",
    concept: "docker-ml",
    difficulty: 2,
    q: {
      en: "Why does a good Dockerfile copy requirements.txt and run pip install before copying the rest of the source code?",
      fr: "Pourquoi un bon Dockerfile copie-t-il requirements.txt et lance-t-il pip install avant de copier le reste du code source ?",
      ar: "لماذا ينسخ ملف Dockerfile الجيد الملف requirements.txt ويشغّل pip install قبل نسخ بقية الشيفرة المصدرية؟"
    },
    options: {
      en: [
        "pip cannot run after source files are present",
        "It makes the final image run with GPU support",
        "It encrypts the dependencies inside the image",
        "Docker caches layers, so code-only changes reuse the installed-dependencies layer instead of reinstalling everything"
      ],
      fr: [
        "pip ne peut pas s'exécuter une fois les fichiers sources présents",
        "Cela fait tourner l'image finale avec prise en charge du GPU",
        "Cela chiffre les dépendances dans l'image",
        "Docker met les couches en cache : un changement de code seul réutilise la couche des dépendances installées au lieu de tout réinstaller"
      ],
      ar: [
        "لا يمكن تشغيل pip بعد وجود الملفات المصدرية",
        "يجعل الصورة النهائية تعمل بدعم GPU",
        "يشفّر الاعتماديات داخل الصورة",
        "يخزّن Docker الطبقات مؤقتًا، فالتغييرات في الشيفرة وحدها تعيد استخدام طبقة الاعتماديات المثبّتة بدل إعادة تثبيت كل شيء"
      ]
    },
    answer: 3,
    explain: {
      en: "Each instruction creates a layer that is rebuilt only if it or an earlier layer changed. Dependencies change rarely and code changes often, so putting them in that order turns 10-minute rebuilds into seconds.",
      fr: "Chaque instruction crée une couche reconstruite seulement si elle ou une couche précédente a changé. Les dépendances changent rarement et le code souvent : les placer dans cet ordre transforme des reconstructions de 10 minutes en quelques secondes.",
      ar: "تُنشئ كل تعليمة طبقة لا يُعاد بناؤها إلا إذا تغيّرت هي أو طبقة سابقة. والاعتماديات نادرًا ما تتغير بينما تتغير الشيفرة كثيرًا، فترتيبها هكذا يحوّل إعادة البناء من 10 دقائق إلى ثوانٍ."
    }
  },
  {
    id: "ops-docker-huge-image",
    concept: "docker-ml",
    difficulty: 2,
    q: {
      en: "Your inference image is 9 GB and takes minutes to pull on every new node. It contains compilers, the training dataset and notebook tools. What is the best fix?",
      fr: "Votre image d'inférence fait 9 Go et met des minutes à se télécharger sur chaque nouveau nœud. Elle contient des compilateurs, le jeu d'entraînement et des outils de notebook. Quelle est la meilleure correction ?",
      ar: "صورة الاستدلال لديك حجمها 9 GB وتستغرق دقائق لسحبها على كل عقدة جديدة. وهي تحتوي مترجمات وبيانات التدريب وأدوات الدفاتر (notebooks). ما أفضل إصلاح؟"
    },
    options: {
      en: [
        "Compress the image into a zip file before pushing it",
        "Use a multi-stage build on a slim base image and copy in only the runtime dependencies and model artifact",
        "Add more RAM to each node",
        "Switch from Docker to running notebooks in production"
      ],
      fr: [
        "Compresser l'image dans un fichier zip avant de la pousser",
        "Utiliser un build multi-étapes sur une image de base légère et n'y copier que les dépendances d'exécution et l'artefact du modèle",
        "Ajouter de la RAM à chaque nœud",
        "Abandonner Docker et exécuter des notebooks en production"
      ],
      ar: [
        "اضغط الصورة في ملف zip قبل دفعها",
        "استخدم بناءً متعدد المراحل (multi-stage build) على صورة أساس خفيفة، وانسخ إليها اعتماديات التشغيل وملف النموذج فقط",
        "أضف ذاكرة RAM إلى كل عقدة",
        "تخلَّ عن Docker وشغّل الدفاتر في الإنتاج"
      ]
    },
    answer: 1,
    explain: {
      en: "A multi-stage build compiles and installs in a builder stage, then copies only what serving needs into a small final image. Training data and dev tools do not belong in an inference container; smaller images pull and scale much faster.",
      fr: "Un build multi-étapes compile et installe dans une étape de construction, puis ne copie que le nécessaire au service dans une petite image finale. Les données d'entraînement et les outils de développement n'ont pas leur place dans un conteneur d'inférence ; une image plus petite se télécharge et passe à l'échelle bien plus vite.",
      ar: "يُجري البناء متعدد المراحل الترجمة والتثبيت في مرحلة بناء، ثم ينسخ ما تحتاجه الخدمة فقط إلى صورة نهائية صغيرة. بيانات التدريب وأدوات التطوير لا مكان لها في حاوية الاستدلال، والصور الأصغر تُسحب وتتوسع أسرع بكثير."
    }
  },
  // ── experiment-tracking ──
  {
    id: "ops-tracking-what-to-log",
    concept: "experiment-tracking",
    difficulty: 1,
    q: {
      en: "Which set of information should an experiment tracker such as MLflow record for every training run?",
      fr: "Quel ensemble d'informations un outil de suivi d'expériences comme MLflow doit-il enregistrer pour chaque entraînement ?",
      ar: "ما مجموعة المعلومات التي يجب أن تسجّلها أداة تتبع التجارب مثل MLflow لكل عملية تدريب؟"
    },
    options: {
      en: [
        "Only the final accuracy",
        "Parameters, code version, data version, metrics and artifacts such as the model file",
        "Only the hyperparameters",
        "The training data itself, copied for every run"
      ],
      fr: [
        "Seulement la précision finale",
        "Paramètres, version du code, version des données, métriques et artefacts comme le fichier du modèle",
        "Seulement les hyperparamètres",
        "Les données d'entraînement elles-mêmes, copiées à chaque exécution"
      ],
      ar: [
        "الدقة النهائية فقط",
        "المعاملات وإصدار الشيفرة وإصدار البيانات والمقاييس والمنتجات مثل ملف النموذج",
        "المعاملات الفائقة فقط",
        "بيانات التدريب نفسها منسوخة في كل تشغيل"
      ]
    },
    answer: 1,
    explain: {
      en: "To compare runs and reproduce the winner you need to know exactly what went in (params, commit, data version) and what came out (metrics, model). Logging a data version or hash is enough; copying full datasets per run wastes storage.",
      fr: "Pour comparer les exécutions et reproduire la meilleure, il faut savoir exactement ce qui est entré (paramètres, commit, version des données) et ce qui est sorti (métriques, modèle). Journaliser une version ou une empreinte des données suffit ; copier les jeux complets à chaque fois gaspille du stockage.",
      ar: "لمقارنة التجارب وإعادة إنتاج الأفضل تحتاج إلى معرفة ما دخل بالضبط (المعاملات، الـ commit، إصدار البيانات) وما خرج (المقاييس، النموذج). ويكفي تسجيل إصدار البيانات أو بصمتها؛ أما نسخ البيانات كاملة في كل تشغيل فهدر للتخزين."
    }
  },
  {
    id: "ops-tracking-model-registry",
    concept: "experiment-tracking",
    difficulty: 1,
    q: {
      en: "What does a model registry add on top of experiment tracking?",
      fr: "Qu'apporte un registre de modèles en plus du suivi d'expériences ?",
      ar: "ماذا يضيف سجل النماذج (model registry) فوق تتبع التجارب؟"
    },
    options: {
      en: [
        "Versioned models with stages or aliases (e.g. Staging, Production), linked to the run that produced them, enabling controlled promotion and rollback",
        "Automatic hyperparameter tuning",
        "A faster training algorithm",
        "A dashboard of data warehouse costs"
      ],
      fr: [
        "Des modèles versionnés avec des étapes ou alias (par ex. Staging, Production), liés à l'exécution qui les a produits, pour une promotion et un retour arrière contrôlés",
        "Le réglage automatique des hyperparamètres",
        "Un algorithme d'entraînement plus rapide",
        "Un tableau de bord des coûts de l'entrepôt de données"
      ],
      ar: [
        "نماذج ذات إصدارات ومراحل أو أسماء مستعارة (مثل Staging و Production)، مرتبطة بالتشغيل الذي أنتجها، مما يتيح ترقية وتراجعًا مضبوطين",
        "ضبطًا تلقائيًا للمعاملات الفائقة",
        "خوارزمية تدريب أسرع",
        "لوحة لتكاليف مستودع البيانات"
      ]
    },
    answer: 0,
    explain: {
      en: "Tracking records many experiments; the registry is the curated shelf of models that matter. Serving code loads 'the Production version', so promoting or rolling back is a registry change with a full audit trail.",
      fr: "Le suivi enregistre de nombreuses expériences ; le registre est l'étagère choisie des modèles qui comptent. Le code de service charge « la version Production » : promouvoir ou revenir en arrière devient un changement dans le registre, avec une piste d'audit complète.",
      ar: "يسجّل التتبع تجارب كثيرة، أما السجل فهو الرف المنتقى للنماذج المهمة. وتحمّل شيفرة الخدمة «إصدار الإنتاج»، فتصبح الترقية أو التراجع تغييرًا في السجل مع أثر تدقيق كامل."
    }
  },
  {
    id: "ops-tracking-reproduce",
    concept: "experiment-tracking",
    difficulty: 3,
    q: {
      en: "Two months later you retrain the production model with the exact logged hyperparameters but get noticeably lower accuracy. Only params and metrics were logged. What was most likely missing?",
      fr: "Deux mois plus tard, vous réentraînez le modèle de production avec exactement les hyperparamètres journalisés mais obtenez une précision nettement plus faible. Seuls les paramètres et les métriques étaient journalisés. Qu'est-ce qui manquait le plus probablement ?",
      ar: "بعد شهرين تعيد تدريب نموذج الإنتاج بالمعاملات الفائقة المسجّلة نفسها تمامًا، لكنك تحصل على دقة أقل بوضوح. لم يُسجَّل سوى المعاملات والمقاييس. ما الذي كان مفقودًا على الأرجح؟"
    },
    options: {
      en: [
        "The number of GPUs in the cluster",
        "The data version and code commit (plus seed and environment) used for the original run",
        "The name of the person who ran the experiment",
        "A screenshot of the training loss curve"
      ],
      fr: [
        "Le nombre de GPU du cluster",
        "La version des données et le commit du code (ainsi que la graine et l'environnement) de l'exécution d'origine",
        "Le nom de la personne qui a lancé l'expérience",
        "Une capture d'écran de la courbe de perte"
      ],
      ar: [
        "عدد وحدات GPU في العنقود",
        "إصدار البيانات والـ commit الخاص بالشيفرة (إضافة إلى البذرة العشوائية والبيئة) المستخدمة في التشغيل الأصلي",
        "اسم الشخص الذي أجرى التجربة",
        "لقطة شاشة لمنحنى خسارة التدريب"
      ]
    },
    answer: 1,
    explain: {
      en: "Hyperparameters alone do not define a model: the training data may have changed and the feature code may have been edited. Reproducibility requires recording the data snapshot, code commit, random seed and dependency versions.",
      fr: "Les hyperparamètres seuls ne définissent pas un modèle : les données d'entraînement ont pu changer et le code des variables être modifié. La reproductibilité exige d'enregistrer l'instantané des données, le commit du code, la graine aléatoire et les versions des dépendances.",
      ar: "المعاملات الفائقة وحدها لا تحدد النموذج: فقد تكون بيانات التدريب تغيّرت وشيفرة الميزات عُدّلت. وتتطلب قابلية إعادة الإنتاج تسجيل لقطة البيانات والـ commit والبذرة العشوائية وإصدارات الاعتماديات."
    }
  },
  // ── feature-store ──
  {
    id: "ops-feature-store-online-offline",
    concept: "feature-store",
    difficulty: 1,
    q: {
      en: "In a feature store, what are the offline and online stores used for?",
      fr: "Dans un feature store, à quoi servent les magasins hors ligne et en ligne ?",
      ar: "في مخزن الميزات (feature store)، فيمَ يُستخدم المخزن غير المتصل والمخزن المتصل؟"
    },
    options: {
      en: [
        "Offline: models that are not deployed; online: deployed models",
        "Offline: raw logs; online: dashboards",
        "Offline: backups; online: the only copy used for training",
        "Offline: large historical feature tables for training; online: latest values served with low latency at inference"
      ],
      fr: [
        "Hors ligne : les modèles non déployés ; en ligne : les modèles déployés",
        "Hors ligne : les journaux bruts ; en ligne : les tableaux de bord",
        "Hors ligne : les sauvegardes ; en ligne : la seule copie utilisée pour l'entraînement",
        "Hors ligne : grandes tables historiques de variables pour l'entraînement ; en ligne : dernières valeurs servies à faible latence pour l'inférence"
      ],
      ar: [
        "غير المتصل: النماذج غير المنشورة؛ المتصل: النماذج المنشورة",
        "غير المتصل: السجلات الخام؛ المتصل: اللوحات",
        "غير المتصل: النسخ الاحتياطية؛ المتصل: النسخة الوحيدة المستخدمة للتدريب",
        "غير المتصل: جداول ميزات تاريخية كبيرة للتدريب؛ المتصل: أحدث القيم تُقدَّم بزمن استجابة منخفض عند الاستدلال"
      ]
    },
    answer: 3,
    explain: {
      en: "Training needs feature history over months, typically in a warehouse or lake; serving needs one entity's current values in milliseconds, typically from a key-value store such as Redis. The feature store keeps both fed from the same definitions.",
      fr: "L'entraînement a besoin de l'historique des variables sur des mois, généralement dans un entrepôt ou un lake ; le service a besoin des valeurs actuelles d'une entité en quelques millisecondes, souvent depuis un magasin clé-valeur comme Redis. Le feature store alimente les deux à partir des mêmes définitions.",
      ar: "يحتاج التدريب إلى تاريخ الميزات على مدى أشهر، عادةً في مستودع أو بحيرة؛ وتحتاج الخدمة إلى القيم الحالية لكيان واحد خلال ميلي ثوانٍ، عادةً من مخزن مفتاح-قيمة مثل Redis. ويغذّي مخزن الميزات الاثنين من التعريفات نفسها."
    }
  },
  {
    id: "ops-feature-store-point-in-time",
    concept: "feature-store",
    difficulty: 2,
    q: {
      en: "Why must training sets be built with point-in-time correct joins?",
      fr: "Pourquoi les jeux d'entraînement doivent-ils être construits avec des jointures correctes à un instant donné (point-in-time) ?",
      ar: "لماذا يجب بناء مجموعات التدريب بعمليات ربط صحيحة زمنيًا (point-in-time)؟"
    },
    options: {
      en: [
        "Joins are faster when they use timestamps",
        "Each label must only see feature values as they were at that moment; using later values leaks the future into training",
        "Feature stores cannot store more than one value per entity",
        "It removes the need for a validation set"
      ],
      fr: [
        "Les jointures sont plus rapides quand elles utilisent des horodatages",
        "Chaque étiquette ne doit voir que les valeurs des variables telles qu'elles étaient à ce moment ; utiliser des valeurs ultérieures fait fuir le futur dans l'entraînement",
        "Les feature stores ne peuvent stocker qu'une valeur par entité",
        "Cela supprime le besoin d'un jeu de validation"
      ],
      ar: [
        "عمليات الربط أسرع عندما تستخدم الطوابع الزمنية",
        "يجب ألا يرى كل مثال مسمّى إلا قيم الميزات كما كانت في تلك اللحظة؛ فاستخدام قيم لاحقة يسرّب المستقبل إلى التدريب",
        "لا تستطيع مخازن الميزات تخزين أكثر من قيمة لكل كيان",
        "يلغي الحاجة إلى مجموعة تحقق"
      ]
    },
    answer: 1,
    explain: {
      en: "If a fraud label from March is joined with a 'number of chargebacks' value computed in June, the model learns from information it will never have at prediction time. Offline scores look great and production performance collapses.",
      fr: "Si une étiquette de fraude de mars est jointe à une valeur « nombre de rétrofacturations » calculée en juin, le modèle apprend d'une information qu'il n'aura jamais au moment de prédire. Les scores hors ligne sont excellents et les performances en production s'effondrent.",
      ar: "إذا رُبطت تسمية احتيال من مارس بقيمة «عدد عمليات الاسترداد» المحسوبة في يونيو، يتعلم النموذج من معلومة لن تتوفر له أبدًا وقت التنبؤ. فتبدو النتائج غير المتصلة ممتازة ثم ينهار الأداء في الإنتاج."
    }
  },
  {
    id: "ops-feature-store-skew",
    concept: "feature-store",
    difficulty: 3,
    q: {
      en: "'Average spend over 30 days' is computed in Spark SQL for training but reimplemented in Java by the serving team. Offline AUC is 0.90, yet production performance is far worse. What is the most likely problem and fix?",
      fr: "La « dépense moyenne sur 30 jours » est calculée en Spark SQL pour l'entraînement mais réimplémentée en Java par l'équipe de service. L'AUC hors ligne est de 0,90, mais les performances en production sont bien pires. Quel est le problème le plus probable et la solution ?",
      ar: "تُحسب ميزة «متوسط الإنفاق خلال 30 يومًا» بـ Spark SQL للتدريب، لكن فريق الخدمة أعاد تنفيذها بلغة Java. قيمة AUC غير المتصلة 0.90، ومع ذلك الأداء في الإنتاج أسوأ بكثير. ما المشكلة الأرجح وما الحل؟"
    },
    options: {
      en: [
        "Concept drift; retrain the model every hour",
        "The model is underfitting; add more layers",
        "Training-serving skew; define the feature once (e.g. in a feature store) and use it for both training and serving",
        "The Java service is too slow; add more replicas"
      ],
      fr: [
        "Une dérive de concept ; réentraîner le modèle toutes les heures",
        "Le modèle sous-apprend ; ajouter des couches",
        "Un décalage entraînement-service (training-serving skew) ; définir la variable une seule fois (par ex. dans un feature store) et l'utiliser pour l'entraînement comme pour le service",
        "Le service Java est trop lent ; ajouter des réplicas"
      ],
      ar: [
        "انجراف المفهوم؛ أعد تدريب النموذج كل ساعة",
        "النموذج يعاني نقص التخصيص؛ أضف طبقات",
        "انحراف التدريب عن الخدمة (training-serving skew)؛ عرّف الميزة مرة واحدة (في مخزن ميزات مثلًا) واستخدمها في التدريب والخدمة معًا",
        "خدمة Java بطيئة جدًا؛ أضف نسخًا متماثلة"
      ]
    },
    answer: 2,
    explain: {
      en: "Two implementations of the same feature almost always differ in subtle ways (time zones, null handling, window boundaries), so the model receives different inputs in production than it was trained on. A single shared definition removes the mismatch.",
      fr: "Deux implémentations d'une même variable diffèrent presque toujours subtilement (fuseaux horaires, gestion des nuls, bornes de fenêtre) : le modèle reçoit en production des entrées différentes de celles de l'entraînement. Une définition unique partagée supprime cet écart.",
      ar: "تنفيذان للميزة نفسها يختلفان دائمًا تقريبًا بطرق دقيقة (المناطق الزمنية، معالجة القيم الفارغة، حدود النافذة)، فيتلقى النموذج في الإنتاج مدخلات مختلفة عمّا تدرّب عليه. والتعريف الموحّد المشترك يزيل هذا التباين."
    }
  },
  // ── ml-cicd ──
  {
    id: "ops-cicd-continuous-training",
    concept: "ml-cicd",
    difficulty: 1,
    q: {
      en: "In MLOps, what is Continuous Training (CT)?",
      fr: "En MLOps, qu'est-ce que l'entraînement continu (CT) ?",
      ar: "في MLOps، ما التدريب المستمر (Continuous Training)؟"
    },
    options: {
      en: [
        "Automatically retraining and validating the model when triggered by a schedule, new data or detected drift",
        "Training a model for as long as possible without ever stopping",
        "Running unit tests on every commit",
        "Letting users label data continuously in the UI"
      ],
      fr: [
        "Réentraîner et valider automatiquement le modèle sur déclenchement par une planification, de nouvelles données ou une dérive détectée",
        "Entraîner un modèle le plus longtemps possible sans jamais s'arrêter",
        "Exécuter des tests unitaires à chaque commit",
        "Laisser les utilisateurs étiqueter des données en continu dans l'interface"
      ],
      ar: [
        "إعادة تدريب النموذج والتحقق منه تلقائيًا عند تفعيلٍ بجدول زمني أو بيانات جديدة أو انجراف مكتشَف",
        "تدريب النموذج أطول مدة ممكنة دون توقف أبدًا",
        "تشغيل اختبارات الوحدات عند كل commit",
        "ترك المستخدمين يسمّون البيانات باستمرار في الواجهة"
      ]
    },
    answer: 0,
    explain: {
      en: "CI/CD automates testing and releasing code; ML adds a third loop because models decay as data changes. A CT pipeline retrains, evaluates against the current model and only then hands the candidate to deployment.",
      fr: "La CI/CD automatise le test et la livraison du code ; le ML ajoute une troisième boucle car les modèles se dégradent quand les données changent. Un pipeline CT réentraîne, compare au modèle actuel et ne transmet le candidat au déploiement qu'ensuite.",
      ar: "يؤتمت CI/CD اختبار الشيفرة وإطلاقها، ويضيف التعلم الآلي حلقة ثالثة لأن النماذج تتدهور مع تغيّر البيانات. يعيد خط CT التدريب ويقيّم مقارنةً بالنموذج الحالي، وبعد ذلك فقط يسلّم المرشّح للنشر."
    }
  },
  {
    id: "ops-cicd-ml-tests",
    concept: "ml-cicd",
    difficulty: 1,
    q: {
      en: "Beyond ordinary unit tests, what does a CI pipeline for an ML project typically add?",
      fr: "Au-delà des tests unitaires ordinaires, qu'ajoute typiquement un pipeline CI pour un projet de ML ?",
      ar: "إلى جانب اختبارات الوحدات العادية، ماذا يضيف عادةً خط CI لمشروع تعلم آلي؟"
    },
    options: {
      en: [
        "Data validation (schema, ranges, nulls) and model quality gates comparing the candidate against the production model",
        "A manual sign-off by the CEO for every commit",
        "Training on the test set to maximize the final score",
        "Removing all tests so models deploy faster"
      ],
      fr: [
        "La validation des données (schéma, plages, nuls) et des seuils de qualité comparant le modèle candidat au modèle en production",
        "Une validation manuelle par le PDG pour chaque commit",
        "Un entraînement sur le jeu de test pour maximiser le score final",
        "La suppression de tous les tests pour déployer plus vite"
      ],
      ar: [
        "التحقق من البيانات (المخطط، النطاقات، القيم الفارغة) وبوابات جودة تقارن النموذج المرشّح بنموذج الإنتاج",
        "موافقة يدوية من المدير التنفيذي على كل commit",
        "التدريب على مجموعة الاختبار لتعظيم النتيجة النهائية",
        "حذف كل الاختبارات لينتشر النموذج أسرع"
      ]
    },
    answer: 0,
    explain: {
      en: "In ML, bugs can live in the data and in the trained model, not only in the code. Pipelines therefore check input data and require a new model to match or beat the current one on a fixed holdout before it can ship.",
      fr: "En ML, les bugs peuvent se trouver dans les données et dans le modèle entraîné, pas seulement dans le code. Les pipelines vérifient donc les données d'entrée et exigent qu'un nouveau modèle égale ou dépasse l'actuel sur un jeu de test fixe avant d'être livré.",
      ar: "في التعلم الآلي قد تكمن الأخطاء في البيانات وفي النموذج المُدرَّب، لا في الشيفرة وحدها. لذلك تتحقق خطوط المعالجة من بيانات الإدخال وتشترط أن يعادل النموذج الجديد الحالي أو يتفوق عليه على مجموعة اختبار ثابتة قبل إطلاقه."
    }
  },
  {
    id: "ops-cicd-quality-gate",
    concept: "ml-cicd",
    difficulty: 3,
    q: {
      en: "The weekly retraining pipeline produces a model with AUC 0.81 on the fixed holdout, while the production model scores 0.84 on the same holdout. What should the pipeline do?",
      fr: "Le pipeline de réentraînement hebdomadaire produit un modèle avec une AUC de 0,81 sur le jeu de test fixe, alors que le modèle en production obtient 0,84 sur ce même jeu. Que doit faire le pipeline ?",
      ar: "ينتج خط إعادة التدريب الأسبوعي نموذجًا بقيمة AUC تساوي 0.81 على مجموعة الاختبار الثابتة، بينما يحقق نموذج الإنتاج 0.84 على المجموعة نفسها. ماذا يجب أن يفعل خط المعالجة؟"
    },
    options: {
      en: [
        "Deploy the new model anyway because it was trained on newer data",
        "Deploy both models and let users choose",
        "Delete the production model to force the new one",
        "Block the promotion, keep the current model serving, and alert the team to investigate"
      ],
      fr: [
        "Déployer quand même le nouveau modèle car il a été entraîné sur des données plus récentes",
        "Déployer les deux modèles et laisser les utilisateurs choisir",
        "Supprimer le modèle de production pour imposer le nouveau",
        "Bloquer la promotion, garder le modèle actuel en service et alerter l'équipe pour enquêter"
      ],
      ar: [
        "نشر النموذج الجديد على أي حال لأنه دُرِّب على بيانات أحدث",
        "نشر النموذجين وترك المستخدمين يختارون",
        "حذف نموذج الإنتاج لفرض الجديد",
        "منع الترقية، وإبقاء النموذج الحالي في الخدمة، وتنبيه الفريق للتحقيق"
      ]
    },
    answer: 3,
    explain: {
      en: "An automated gate exists so that worse models never reach users without a human looking. A drop like this often signals a data problem (broken feature, label delay) that should be fixed rather than shipped.",
      fr: "Un seuil automatique existe pour qu'un modèle moins bon n'atteigne jamais les utilisateurs sans examen humain. Une baisse de ce type signale souvent un problème de données (variable cassée, retard d'étiquettes) qu'il faut corriger plutôt que livrer.",
      ar: "وُجدت البوابة الآلية كي لا يصل نموذج أسوأ إلى المستخدمين دون أن يراجعه إنسان. وانخفاض كهذا يشير غالبًا إلى مشكلة في البيانات (ميزة معطوبة، تأخر التسميات) يجب إصلاحها لا إطلاقها."
    }
  },
  // ── ml-lifecycle ──
  {
    id: "ops-lifecycle-definition",
    concept: "ml-lifecycle",
    difficulty: 1,
    q: {
      en: "What is MLOps?",
      fr: "Qu'est-ce que le MLOps ?",
      ar: "ما هو MLOps؟"
    },
    options: {
      en: [
        "A specific deep learning library for GPUs",
        "A type of neural network architecture",
        "A cloud provider's brand of hardware",
        "Applying DevOps practices (automation, versioning, testing, monitoring) to the whole machine learning lifecycle"
      ],
      fr: [
        "Une bibliothèque de deep learning spécifique aux GPU",
        "Un type d'architecture de réseau de neurones",
        "Une marque de matériel d'un fournisseur cloud",
        "L'application des pratiques DevOps (automatisation, versionnage, tests, supervision) à tout le cycle de vie du machine learning"
      ],
      ar: [
        "مكتبة تعلم عميق خاصة بوحدات GPU",
        "نوع من بنى الشبكات العصبية",
        "علامة تجارية لعتاد مزوّد سحابي",
        "تطبيق ممارسات DevOps (الأتمتة، إدارة الإصدارات، الاختبار، المراقبة) على دورة حياة التعلم الآلي بأكملها"
      ]
    },
    answer: 3,
    explain: {
      en: "MLOps is a set of practices, not a single tool. It aims to make building, deploying and improving models reliable and repeatable, from data collection to monitoring in production.",
      fr: "Le MLOps est un ensemble de pratiques, pas un outil unique. Il vise à rendre fiables et reproductibles la construction, le déploiement et l'amélioration des modèles, de la collecte des données à la supervision en production.",
      ar: "MLOps مجموعة ممارسات لا أداة واحدة. وهو يهدف إلى جعل بناء النماذج ونشرها وتحسينها عملية موثوقة وقابلة للتكرار، من جمع البيانات حتى المراقبة في الإنتاج."
    }
  },
  {
    id: "ops-lifecycle-loop",
    concept: "ml-lifecycle",
    difficulty: 2,
    q: {
      en: "Why is the ML lifecycle usually drawn as a loop rather than a straight line ending at deployment?",
      fr: "Pourquoi le cycle de vie du ML est-il généralement représenté comme une boucle plutôt qu'une ligne droite s'arrêtant au déploiement ?",
      ar: "لماذا تُرسم دورة حياة التعلم الآلي عادةً كحلقة لا كخط مستقيم ينتهي عند النشر؟"
    },
    options: {
      en: [
        "Models must be deployed twice to be considered stable",
        "Real-world data keeps changing, so monitoring feeds back into new data collection and retraining",
        "Deployment always fails the first time",
        "Loops are faster to compute than lines"
      ],
      fr: [
        "Les modèles doivent être déployés deux fois pour être considérés comme stables",
        "Les données réelles changent sans cesse : la supervision alimente de nouvelles collectes de données et des réentraînements",
        "Le déploiement échoue toujours la première fois",
        "Les boucles sont plus rapides à calculer que les lignes"
      ],
      ar: [
        "يجب نشر النماذج مرتين لتُعدّ مستقرة",
        "البيانات الواقعية تتغير باستمرار، فتغذّي المراقبةُ جمعَ بيانات جديدة وإعادة التدريب",
        "يفشل النشر دائمًا في المرة الأولى",
        "الحلقات أسرع حسابيًا من الخطوط"
      ]
    },
    answer: 1,
    explain: {
      en: "A model is trained on a snapshot of the past, and the world drifts away from it. Production monitoring reveals new errors and drift, which trigger another round of data work, training, evaluation and deployment.",
      fr: "Un modèle est entraîné sur un instantané du passé, et le monde s'en éloigne. La supervision en production révèle de nouvelles erreurs et des dérives, qui déclenchent un nouveau tour de travail sur les données, d'entraînement, d'évaluation et de déploiement.",
      ar: "يُدرَّب النموذج على لقطة من الماضي، والعالم يبتعد عنها تدريجيًا. وتكشف المراقبة في الإنتاج أخطاء جديدة وانجرافًا، فيُطلق ذلك جولة أخرى من العمل على البيانات والتدريب والتقييم والنشر."
    }
  },
  {
    id: "ops-lifecycle-poc-scenario",
    concept: "ml-lifecycle",
    difficulty: 2,
    q: {
      en: "One data scientist has two weeks to test whether a churn model is even feasible. Which practice is worth adopting from day one?",
      fr: "Une data scientist a deux semaines pour tester si un modèle d'attrition est seulement faisable. Quelle pratique vaut la peine d'être adoptée dès le premier jour ?",
      ar: "لدى عالمة بيانات واحدة أسبوعان لاختبار ما إذا كان نموذج التنبؤ بتسرّب العملاء ممكنًا أصلًا. أي ممارسة تستحق اعتمادها من اليوم الأول؟"
    },
    options: {
      en: [
        "A full feature store and Kubernetes cluster before the first experiment",
        "Automated canary releases to production",
        "No versioning at all, since it is only a prototype",
        "Code in Git plus lightweight experiment logging; add heavier tooling only if the project moves forward"
      ],
      fr: [
        "Un feature store complet et un cluster Kubernetes avant la première expérience",
        "Des déploiements canari automatisés en production",
        "Aucun versionnage, puisque ce n'est qu'un prototype",
        "Le code dans Git et un suivi d'expériences léger ; n'ajouter des outils plus lourds que si le projet avance"
      ],
      ar: [
        "مخزن ميزات كامل وعنقود Kubernetes قبل أول تجربة",
        "إطلاقات كنارية مؤتمتة إلى الإنتاج",
        "بدون أي إدارة إصدارات لأنه مجرد نموذج أولي",
        "الشيفرة في Git مع تسجيل خفيف للتجارب؛ وأضف أدوات أثقل فقط إذا تقدّم المشروع"
      ]
    },
    answer: 3,
    explain: {
      en: "MLOps practices should be adopted incrementally. Version control and run logging cost almost nothing and save the work, while registries, feature stores and CI/CD only pay off once a model is heading for real users.",
      fr: "Les pratiques MLOps s'adoptent progressivement. Le versionnage et la journalisation des exécutions ne coûtent presque rien et préservent le travail, alors que registres, feature stores et CI/CD ne sont rentables qu'une fois le modèle destiné à de vrais utilisateurs.",
      ar: "تُعتمد ممارسات MLOps تدريجيًا. فإدارة الإصدارات وتسجيل التجارب لا تكلّف شيئًا تقريبًا وتحفظ العمل، أما السجلات ومخازن الميزات و CI/CD فلا تؤتي ثمارها إلا حين يتجه النموذج إلى مستخدمين حقيقيين."
    }
  },
  // ── model-data-drift ──
  {
    id: "ops-drift-data-vs-concept",
    concept: "model-data-drift",
    difficulty: 1,
    q: {
      en: "What is the difference between data drift and concept drift?",
      fr: "Quelle est la différence entre dérive des données et dérive de concept ?",
      ar: "ما الفرق بين انجراف البيانات (data drift) وانجراف المفهوم (concept drift)؟"
    },
    options: {
      en: [
        "Data drift: labels change; concept drift: the model code changes",
        "They are two names for the same thing",
        "Data drift only affects images; concept drift only affects text",
        "Data drift: the input distribution changes; concept drift: the relationship between inputs and the target changes"
      ],
      fr: [
        "Dérive des données : les étiquettes changent ; dérive de concept : le code du modèle change",
        "Ce sont deux noms pour la même chose",
        "La dérive des données ne touche que les images ; la dérive de concept que le texte",
        "Dérive des données : la distribution des entrées change ; dérive de concept : la relation entre les entrées et la cible change"
      ],
      ar: [
        "انجراف البيانات: تتغير التسميات؛ انجراف المفهوم: تتغير شيفرة النموذج",
        "هما اسمان لشيء واحد",
        "انجراف البيانات يؤثر في الصور فقط، وانجراف المفهوم في النصوص فقط",
        "انجراف البيانات: يتغير توزيع المدخلات؛ انجراف المفهوم: تتغير العلاقة بين المدخلات والهدف"
      ]
    },
    answer: 3,
    explain: {
      en: "Data drift means P(X) shifts, e.g. more young users after a marketing campaign. Concept drift means P(y | X) shifts, e.g. the same browsing behavior no longer predicts a purchase. Both can degrade a model.",
      fr: "La dérive des données signifie que P(X) change, par ex. plus de jeunes utilisateurs après une campagne marketing. La dérive de concept signifie que P(y | X) change, par ex. le même comportement de navigation ne prédit plus un achat. Les deux peuvent dégrader un modèle.",
      ar: "انجراف البيانات يعني تغيّر P(X)، كزيادة المستخدمين الشباب بعد حملة تسويقية. وانجراف المفهوم يعني تغيّر P(y | X)، كأن يتوقف سلوك التصفح نفسه عن التنبؤ بالشراء. وكلاهما قد يُضعف النموذج."
    }
  },
  {
    id: "ops-drift-psi",
    concept: "model-data-drift",
    difficulty: 2,
    q: {
      en: "The Population Stability Index (PSI) of a key feature, comparing training data with last week's traffic, is 0.35. How should you read this?",
      fr: "L'indice de stabilité de population (PSI) d'une variable clé, comparant les données d'entraînement au trafic de la semaine dernière, vaut 0,35. Comment l'interpréter ?",
      ar: "مؤشر استقرار المجتمع (PSI) لميزة أساسية، عند مقارنة بيانات التدريب بحركة الأسبوع الماضي، يساوي 0.35. كيف تفسّر ذلك؟"
    },
    options: {
      en: [
        "No shift at all",
        "The model's accuracy is exactly 35%",
        "35% of the rows have missing values",
        "Significant drift in that feature's distribution: investigate and consider retraining"
      ],
      fr: [
        "Aucun changement",
        "La précision du modèle est exactement de 35 %",
        "35 % des lignes ont des valeurs manquantes",
        "Une dérive importante de la distribution de cette variable : enquêter et envisager un réentraînement"
      ],
      ar: [
        "لا يوجد أي تغيّر",
        "دقة النموذج 35% بالضبط",
        "35% من الصفوف فيها قيم مفقودة",
        "انجراف كبير في توزيع تلك الميزة: حقّق في الأمر وفكّر في إعادة التدريب"
      ]
    },
    answer: 3,
    explain: {
      en: "A common rule of thumb: PSI below 0.1 means no meaningful shift, 0.1–0.2 a moderate shift, and above 0.2 significant drift. PSI measures distribution change only; it says nothing directly about accuracy.",
      fr: "Règle empirique courante : un PSI inférieur à 0,1 signifie aucun changement notable, entre 0,1 et 0,2 un changement modéré, et au-delà de 0,2 une dérive importante. Le PSI ne mesure que le changement de distribution ; il ne dit rien directement de la précision.",
      ar: "قاعدة تقريبية شائعة: PSI أقل من 0.1 يعني عدم وجود تغيّر يُذكر، وبين 0.1 و 0.2 تغيّرًا معتدلًا، وفوق 0.2 انجرافًا كبيرًا. ويقيس PSI تغيّر التوزيع فقط ولا يخبر مباشرة بشيء عن الدقة."
    }
  },
  {
    id: "ops-drift-delayed-labels",
    concept: "model-data-drift",
    difficulty: 2,
    q: {
      en: "For a loan-default model, true labels only arrive about 12 months after each prediction. How can you monitor the model in the meantime?",
      fr: "Pour un modèle de défaut de crédit, les vraies étiquettes n'arrivent qu'environ 12 mois après chaque prédiction. Comment surveiller le modèle en attendant ?",
      ar: "في نموذج للتنبؤ بتعثر القروض، لا تصل التسميات الحقيقية إلا بعد نحو 12 شهرًا من كل تنبؤ. كيف تراقب النموذج في الأثناء؟"
    },
    options: {
      en: [
        "Track drift in the input features and in the distribution of predicted scores as early warning signals",
        "There is nothing to monitor until labels arrive",
        "Compute accuracy against the model's own predictions",
        "Retrain every day on unlabeled data"
      ],
      fr: [
        "Suivre la dérive des variables d'entrée et de la distribution des scores prédits comme signaux d'alerte précoce",
        "Il n'y a rien à surveiller avant l'arrivée des étiquettes",
        "Calculer la précision par rapport aux propres prédictions du modèle",
        "Réentraîner chaque jour sur des données non étiquetées"
      ],
      ar: [
        "تتبّع الانجراف في ميزات الإدخال وفي توزيع الدرجات المتنبأ بها كإشارات إنذار مبكر",
        "لا شيء يُراقب حتى تصل التسميات",
        "احسب الدقة مقارنةً بتنبؤات النموذج نفسه",
        "أعد التدريب يوميًا على بيانات غير مسمّاة"
      ]
    },
    answer: 0,
    explain: {
      en: "When ground truth is delayed, proxies are the only timely signal: if inputs or the score distribution shift sharply, performance is likely changing too. Once labels arrive, confirm with real metrics.",
      fr: "Quand la vérité terrain arrive tard, les indicateurs indirects sont le seul signal disponible à temps : si les entrées ou la distribution des scores changent fortement, les performances changent probablement aussi. À l'arrivée des étiquettes, on confirme avec les vraies métriques.",
      ar: "حين تتأخر الحقيقة الأرضية تكون المؤشرات البديلة الإشارة الوحيدة في الوقت المناسب: فإذا تغيّرت المدخلات أو توزيع الدرجات بشدة فالأرجح أن الأداء يتغير أيضًا. وعند وصول التسميات تُؤكَّد النتيجة بالمقاييس الحقيقية."
    }
  },
  {
    id: "ops-drift-diagnose-concept",
    concept: "model-data-drift",
    difficulty: 3,
    q: {
      en: "Input feature distributions look stable, but a churn model's precision dropped sharply after a competitor launched a cheaper plan that changed why customers leave. What is happening, and what should you do?",
      fr: "Les distributions des variables d'entrée semblent stables, mais la précision d'un modèle d'attrition a chuté après qu'un concurrent a lancé une offre moins chère qui a changé les raisons de départ des clients. Que se passe-t-il, et que faire ?",
      ar: "تبدو توزيعات ميزات الإدخال مستقرة، لكن دقة نموذج التسرّب هبطت بشدة بعد أن أطلق منافس باقة أرخص غيّرت أسباب مغادرة العملاء. ما الذي يحدث، وماذا تفعل؟"
    },
    options: {
      en: [
        "Concept drift; retrain on recent labeled data and possibly add features that capture the new behavior",
        "Data drift; rescale the input features",
        "A bug in the serving container; rebuild the Docker image",
        "Nothing; precision always fluctuates and will recover by itself"
      ],
      fr: [
        "Une dérive de concept ; réentraîner sur des données étiquetées récentes et éventuellement ajouter des variables qui capturent le nouveau comportement",
        "Une dérive des données ; remettre à l'échelle les variables d'entrée",
        "Un bug dans le conteneur de service ; reconstruire l'image Docker",
        "Rien ; la précision fluctue toujours et se rétablira seule"
      ],
      ar: [
        "انجراف المفهوم؛ أعد التدريب على بيانات حديثة مسمّاة، وربما أضف ميزات تلتقط السلوك الجديد",
        "انجراف البيانات؛ أعد تحجيم ميزات الإدخال",
        "خطأ في حاوية الخدمة؛ أعد بناء صورة Docker",
        "لا شيء؛ الدقة تتذبذب دائمًا وستتعافى وحدها"
      ]
    },
    answer: 0,
    explain: {
      en: "The inputs look the same but now map to different outcomes, which is exactly concept drift; input-only monitors cannot see it. Watching real performance metrics and retraining on fresh labels is the remedy.",
      fr: "Les entrées semblent identiques mais mènent désormais à d'autres résultats : c'est exactement la dérive de concept, invisible pour une surveillance des seules entrées. Suivre les vraies métriques de performance et réentraîner sur des étiquettes récentes est le remède.",
      ar: "تبدو المدخلات كما هي لكنها صارت تؤدي إلى نتائج مختلفة، وهذا بالضبط انجراف المفهوم الذي لا تراه مراقبة المدخلات وحدها. والعلاج هو متابعة مقاييس الأداء الحقيقية وإعادة التدريب على تسميات حديثة."
    }
  },
  // ── model-serving ──
  {
    id: "ops-serving-batch-identify",
    concept: "model-serving",
    difficulty: 1,
    q: {
      en: "A job scores every customer's churn risk each night and writes the results to a table that the CRM reads the next morning. What kind of serving is this?",
      fr: "Un job calcule chaque nuit le risque d'attrition de chaque client et écrit les résultats dans une table que le CRM lit le lendemain matin. De quel type de service s'agit-il ?",
      ar: "مهمة تحسب كل ليلة خطر تسرّب كل عميل وتكتب النتائج في جدول يقرؤه نظام CRM صباح اليوم التالي. ما نوع الخدمة هذا؟"
    },
    options: {
      en: [
        "Batch serving",
        "Online (real-time) serving",
        "Streaming serving",
        "Edge serving"
      ],
      fr: [
        "Service batch",
        "Service en ligne (temps réel)",
        "Service en streaming",
        "Service en périphérie (edge)"
      ],
      ar: [
        "الخدمة الدفعية (batch)",
        "الخدمة المتصلة (لحظية)",
        "الخدمة التدفقية",
        "الخدمة على الأطراف (edge)"
      ]
    },
    answer: 0,
    explain: {
      en: "Predictions are precomputed on a schedule for a known set of entities and simply looked up later. That is batch serving: simple, cheap and robust when nobody needs a fresh prediction within seconds.",
      fr: "Les prédictions sont précalculées selon une planification pour un ensemble connu d'entités, puis simplement consultées. C'est du service batch : simple, peu coûteux et robuste quand personne n'a besoin d'une prédiction fraîche en quelques secondes.",
      ar: "تُحسب التنبؤات مسبقًا وفق جدول زمني لمجموعة معروفة من الكيانات ثم يُبحث عنها لاحقًا. هذه هي الخدمة الدفعية: بسيطة ورخيصة ومتينة حين لا يحتاج أحد إلى تنبؤ حديث خلال ثوانٍ."
    }
  },
  {
    id: "ops-serving-p99-latency",
    concept: "model-serving",
    difficulty: 1,
    q: {
      en: "A model API reports a p99 latency of 120 ms. What does that mean?",
      fr: "Une API de modèle annonce une latence p99 de 120 ms. Qu'est-ce que cela signifie ?",
      ar: "تُبلغ واجهة برمجية لنموذج عن زمن استجابة p99 قدره 120 ms. ماذا يعني ذلك؟"
    },
    options: {
      en: [
        "The average request takes 120 ms",
        "99% of requests complete in 120 ms or less",
        "The API handles 99 requests every 120 ms",
        "1% of requests complete in 120 ms or less"
      ],
      fr: [
        "Une requête prend en moyenne 120 ms",
        "99 % des requêtes se terminent en 120 ms ou moins",
        "L'API traite 99 requêtes toutes les 120 ms",
        "1 % des requêtes se terminent en 120 ms ou moins"
      ],
      ar: [
        "متوسط زمن الطلب 120 ms",
        "99% من الطلبات تكتمل في 120 ms أو أقل",
        "تعالج الواجهة 99 طلبًا كل 120 ms",
        "1% من الطلبات تكتمل في 120 ms أو أقل"
      ]
    },
    answer: 1,
    explain: {
      en: "Percentile latency describes the tail: p99 is the time under which 99% of requests finish. Averages hide slow outliers, so latency targets for online serving are usually set on p95 or p99.",
      fr: "La latence par percentile décrit la queue de distribution : le p99 est le temps sous lequel se terminent 99 % des requêtes. Les moyennes masquent les requêtes lentes, d'où des objectifs de latence généralement fixés sur le p95 ou le p99.",
      ar: "يصف زمن الاستجابة المئيني ذيل التوزيع: p99 هو الزمن الذي تنتهي دونه 99% من الطلبات. والمتوسطات تُخفي الحالات البطيئة الشاذة، لذا تُحدَّد أهداف زمن الاستجابة للخدمة المتصلة عادةً على p95 أو p99."
    }
  },
  {
    id: "ops-serving-online-cost",
    concept: "model-serving",
    difficulty: 2,
    q: {
      en: "Why prefer batch serving when it meets the business need?",
      fr: "Pourquoi préférer le service batch quand il répond au besoin métier ?",
      ar: "لماذا يُفضَّل تقديم الخدمة الدفعية حين تلبي حاجة العمل؟"
    },
    options: {
      en: [
        "Online serving adds latency targets, autoscaling, high availability and on-call duty that batch avoids",
        "Batch predictions are always more accurate than online ones",
        "Online serving cannot use the same model file",
        "Batch serving does not require any infrastructure"
      ],
      fr: [
        "Le service en ligne ajoute objectifs de latence, mise à l'échelle automatique, haute disponibilité et astreintes que le batch évite",
        "Les prédictions batch sont toujours plus précises que les prédictions en ligne",
        "Le service en ligne ne peut pas utiliser le même fichier de modèle",
        "Le service batch ne demande aucune infrastructure"
      ],
      ar: [
        "تضيف الخدمة المتصلة أهدافًا لزمن الاستجابة وتوسعًا تلقائيًا وتوافرًا عاليًا ومناوبات طوارئ تتجنبها الدفعية",
        "تنبؤات الدفعية أدق دائمًا من المتصلة",
        "لا تستطيع الخدمة المتصلة استخدام ملف النموذج نفسه",
        "لا تتطلب الخدمة الدفعية أي بنية تحتية"
      ]
    },
    answer: 0,
    explain: {
      en: "A batch job that fails at 2 a.m. can simply be re-run; an API that goes down blocks users immediately. If predictions can be precomputed, batch gives the same value with much less operational risk.",
      fr: "Un job batch qui échoue à 2 h du matin peut simplement être relancé ; une API en panne bloque immédiatement les utilisateurs. Si les prédictions peuvent être précalculées, le batch apporte la même valeur avec beaucoup moins de risque opérationnel.",
      ar: "المهمة الدفعية التي تفشل في الثانية فجرًا يمكن ببساطة إعادة تشغيلها، أما الواجهة البرمجية المتعطلة فتعطّل المستخدمين فورًا. فإذا أمكن حساب التنبؤات مسبقًا، تعطي الدفعية القيمة نفسها بمخاطر تشغيلية أقل بكثير."
    }
  },
  {
    id: "ops-serving-choose-online",
    concept: "model-serving",
    difficulty: 3,
    q: {
      en: "A model must score each card payment using the amount, merchant and device of that specific transaction before it is approved. Which serving mode is required?",
      fr: "Un modèle doit évaluer chaque paiement par carte à partir du montant, du marchand et de l'appareil de cette transaction précise, avant son approbation. Quel mode de service est nécessaire ?",
      ar: "يجب أن يقيّم نموذج كل دفعة بالبطاقة باستخدام المبلغ والتاجر والجهاز الخاصة بتلك المعاملة تحديدًا قبل الموافقة عليها. أي نمط خدمة مطلوب؟"
    },
    options: {
      en: [
        "A nightly batch job that scores all of yesterday's payments",
        "A weekly batch job that precomputes scores for every possible transaction",
        "Manual review of a monthly report",
        "Online serving through a low-latency API called at payment time"
      ],
      fr: [
        "Un job batch nocturne qui évalue tous les paiements de la veille",
        "Un job batch hebdomadaire qui précalcule les scores de toutes les transactions possibles",
        "Une revue manuelle d'un rapport mensuel",
        "Un service en ligne via une API à faible latence appelée au moment du paiement"
      ],
      ar: [
        "مهمة دفعية ليلية تقيّم كل دفعات الأمس",
        "مهمة دفعية أسبوعية تحسب مسبقًا درجات كل معاملة ممكنة",
        "مراجعة يدوية لتقرير شهري",
        "خدمة متصلة عبر واجهة برمجية منخفضة زمن الاستجابة تُستدعى لحظة الدفع"
      ]
    },
    answer: 3,
    explain: {
      en: "The input only exists at request time, and the space of possible transactions is far too large to precompute. The decision is also needed before approval, so only request-time online serving works.",
      fr: "L'entrée n'existe qu'au moment de la requête, et l'espace des transactions possibles est bien trop vaste pour être précalculé. La décision doit en outre précéder l'approbation : seul un service en ligne à la requête convient.",
      ar: "المدخل لا يوجد إلا لحظة الطلب، وفضاء المعاملات الممكنة أوسع بكثير من أن يُحسب مسبقًا. كما أن القرار مطلوب قبل الموافقة، فلا ينفع إلا الخدمة المتصلة عند الطلب."
    }
  }
];
