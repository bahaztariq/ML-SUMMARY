/** Quiz questions: data-eng. See index.js for the question format. */
/** @type {import('./index.js').Question[]} */
export default [
  // ── airflow ──
  {
    id: "de-airflow-dag",
    concept: "airflow",
    difficulty: 1,
    q: {
      en: "In Apache Airflow, what is a DAG?",
      fr: "Dans Apache Airflow, qu'est-ce qu'un DAG ?",
      ar: "في Apache Airflow، ما هو الـ DAG؟"
    },
    options: {
      en: [
        "A workflow defined in Python as tasks with dependencies and no cycles, run on a schedule",
        "A distributed table format that stores data in columns",
        "A message queue that delivers events to consumers in real time",
        "A SQL model that dbt materializes in the warehouse"
      ],
      fr: [
        "Un workflow défini en Python comme des tâches avec dépendances et sans cycle, exécuté selon une planification",
        "Un format de table distribué qui stocke les données en colonnes",
        "Une file de messages qui livre des événements aux consommateurs en temps réel",
        "Un modèle SQL que dbt matérialise dans l'entrepôt"
      ],
      ar: [
        "سير عمل يُعرَّف بلغة Python كمهام بينها اعتماديات ودون حلقات، ويُشغَّل وفق جدول زمني",
        "صيغة جداول موزعة تخزن البيانات في أعمدة",
        "طابور رسائل يوصل الأحداث إلى المستهلكين لحظيًا",
        "نموذج SQL يجسّده dbt في المستودع"
      ]
    },
    answer: 0,
    explain: {
      en: "DAG stands for Directed Acyclic Graph: tasks are nodes, dependencies are edges, and the absence of cycles guarantees a valid execution order. Airflow's scheduler runs each DAG for its intervals and retries failed tasks.",
      fr: "DAG signifie graphe orienté acyclique : les tâches sont les nœuds, les dépendances les arêtes, et l'absence de cycle garantit un ordre d'exécution valide. Le planificateur d'Airflow exécute chaque DAG pour ses intervalles et relance les tâches en échec.",
      ar: "الـ DAG هو رسم بياني موجّه لا دوري (Directed Acyclic Graph): المهام عُقد، والاعتماديات حواف، وغياب الحلقات يضمن ترتيب تنفيذ صحيحًا. ويشغّل مُجدوِل Airflow كل DAG لفتراته الزمنية ويعيد محاولة المهام الفاشلة."
    }
  },
  {
    id: "de-airflow-idempotent-tasks",
    concept: "airflow",
    difficulty: 2,
    q: {
      en: "Why should every Airflow task be idempotent?",
      fr: "Pourquoi chaque tâche Airflow devrait-elle être idempotente ?",
      ar: "لماذا يجب أن تكون كل مهمة في Airflow متساوية الأثر (idempotent)؟"
    },
    options: {
      en: [
        "Airflow refuses to schedule tasks that write to a database",
        "Retries and backfills re-run tasks, and re-running the same interval must give the same result without duplicates",
        "Idempotent tasks run in parallel on GPUs",
        "It lets the task skip its upstream dependencies"
      ],
      fr: [
        "Airflow refuse de planifier des tâches qui écrivent dans une base de données",
        "Les relances et les backfills réexécutent des tâches, et rejouer le même intervalle doit donner le même résultat sans doublons",
        "Les tâches idempotentes s'exécutent en parallèle sur GPU",
        "Cela permet à la tâche d'ignorer ses dépendances amont"
      ],
      ar: [
        "يرفض Airflow جدولة المهام التي تكتب في قاعدة بيانات",
        "إعادة المحاولة والتعبئة الرجعية (backfill) تعيدان تشغيل المهام، ويجب أن يعطي تشغيل الفترة نفسها مجددًا النتيجة نفسها دون تكرار",
        "المهام متساوية الأثر تعمل بالتوازي على GPU",
        "يتيح ذلك للمهمة تخطي اعتمادياتها السابقة"
      ]
    },
    answer: 1,
    explain: {
      en: "Failures happen, and the fix is usually to re-run. A task that overwrites its date partition (instead of blindly appending) can be retried or backfilled safely, which is what makes pipelines recoverable.",
      fr: "Les échecs arrivent et la solution est généralement de relancer. Une tâche qui écrase sa partition de date (au lieu d'ajouter à l'aveugle) peut être relancée ou rejouée sans risque : c'est ce qui rend les pipelines récupérables.",
      ar: "الأعطال تحدث، والحل عادةً إعادة التشغيل. المهمة التي تستبدل قسم التاريخ الخاص بها (بدل الإلحاق الأعمى) يمكن إعادة محاولتها أو تعبئتها رجعيًا بأمان، وهذا ما يجعل خطوط المعالجة قابلة للاسترداد."
    }
  },
  {
    id: "de-airflow-not-for-realtime",
    concept: "airflow",
    difficulty: 3,
    q: {
      en: "Each card payment must be scored for fraud within 200 ms of arriving. A colleague proposes an Airflow DAG scheduled every minute. What do you recommend?",
      fr: "Chaque paiement par carte doit être évalué pour la fraude dans les 200 ms suivant son arrivée. Un collègue propose un DAG Airflow planifié chaque minute. Que recommandez-vous ?",
      ar: "يجب تقييم كل دفعة بالبطاقة للكشف عن الاحتيال خلال 200 ms من وصولها. يقترح زميل DAG في Airflow مجدولًا كل دقيقة. بماذا تنصح؟"
    },
    options: {
      en: [
        "The Airflow DAG, but scheduled every second instead",
        "An event-driven path (e.g. Kafka plus an online model service); keep Airflow for batch jobs such as retraining",
        "A nightly Airflow DAG that scores the whole day's payments",
        "The Airflow DAG with more workers so each run finishes faster"
      ],
      fr: [
        "Le DAG Airflow, mais planifié chaque seconde",
        "Un chemin piloté par les événements (par ex. Kafka plus un service de modèle en ligne) ; garder Airflow pour les traitements batch comme le réentraînement",
        "Un DAG Airflow nocturne qui évalue tous les paiements de la journée",
        "Le DAG Airflow avec plus de workers pour que chaque exécution finisse plus vite"
      ],
      ar: [
        "DAG في Airflow لكن مجدول كل ثانية",
        "مسار قائم على الأحداث (مثل Kafka مع خدمة نموذج متصلة)؛ واترك Airflow للمهام الدفعية مثل إعادة التدريب",
        "DAG ليلي في Airflow يقيّم دفعات اليوم كله",
        "DAG في Airflow مع عمّال أكثر لتنتهي كل دورة أسرع"
      ]
    },
    answer: 1,
    explain: {
      en: "Airflow orchestrates scheduled batch work; its scheduling overhead is measured in seconds, and a payment cannot wait for the next run. Sub-second decisions need streaming or request-time serving.",
      fr: "Airflow orchestre des traitements batch planifiés ; son surcoût de planification se compte en secondes et un paiement ne peut pas attendre la prochaine exécution. Les décisions en moins d'une seconde exigent du streaming ou un service à la requête.",
      ar: "ينسّق Airflow الأعمال الدفعية المجدولة، وتُقاس كلفة جدولته بالثواني، والدفعة لا يمكنها انتظار الدورة التالية. القرارات في أقل من ثانية تتطلب معالجة تدفقية أو خدمة عند الطلب."
    }
  },
  // ── apache-kafka ──
  {
    id: "de-kafka-commit-log",
    concept: "apache-kafka",
    difficulty: 1,
    q: {
      en: "How does Kafka store the events of a topic?",
      fr: "Comment Kafka stocke-t-il les événements d'un topic ?",
      ar: "كيف يخزّن Kafka أحداث الموضوع (topic)؟"
    },
    options: {
      en: [
        "As rows in a relational table that consumers update in place",
        "As partitioned, append-only logs kept for a retention period, with each consumer tracking its own offset",
        "In memory only, deleting each message as soon as one consumer reads it",
        "As Parquet files partitioned by date"
      ],
      fr: [
        "Comme des lignes d'une table relationnelle que les consommateurs modifient sur place",
        "Sous forme de journaux partitionnés en ajout seul, conservés pendant une durée de rétention, chaque consommateur suivant son propre offset",
        "Uniquement en mémoire, en supprimant chaque message dès qu'un consommateur l'a lu",
        "Comme des fichiers Parquet partitionnés par date"
      ],
      ar: [
        "كصفوف في جدول علائقي يحدّثها المستهلكون في مكانها",
        "كسجلات مقسّمة للإلحاق فقط تُحفَظ لمدة احتفاظ محددة، ويتتبع كل مستهلك موضعه (offset) الخاص",
        "في الذاكرة فقط، مع حذف كل رسالة فور قراءة مستهلك واحد لها",
        "كملفات Parquet مقسّمة حسب التاريخ"
      ]
    },
    answer: 1,
    explain: {
      en: "Reading does not delete data in Kafka: messages stay in the log until retention expires. That is why many independent consumers can read the same topic and why a consumer can replay history by rewinding its offset.",
      fr: "Lire ne supprime pas les données dans Kafka : les messages restent dans le journal jusqu'à expiration de la rétention. C'est pourquoi de nombreux consommateurs indépendants peuvent lire le même topic, et pourquoi un consommateur peut rejouer l'historique en reculant son offset.",
      ar: "القراءة لا تحذف البيانات في Kafka: تبقى الرسائل في السجل حتى تنتهي مدة الاحتفاظ. ولهذا يستطيع مستهلكون مستقلون كثيرون قراءة الموضوع نفسه، ويستطيع المستهلك إعادة تشغيل التاريخ بإرجاع موضعه."
    }
  },
  {
    id: "de-kafka-ordering-key",
    concept: "apache-kafka",
    difficulty: 2,
    q: {
      en: "You need all events of a given user to be processed in order. How do you achieve that with Kafka?",
      fr: "Vous avez besoin que tous les événements d'un utilisateur donné soient traités dans l'ordre. Comment y parvenir avec Kafka ?",
      ar: "تحتاج إلى معالجة كل أحداث مستخدم معيّن بالترتيب. كيف تحقق ذلك مع Kafka؟"
    },
    options: {
      en: [
        "Kafka orders every message across all partitions automatically",
        "Create one topic per user",
        "Use user_id as the message key so all of that user's events land in the same partition",
        "Set the retention period to infinite"
      ],
      fr: [
        "Kafka ordonne automatiquement tous les messages de toutes les partitions",
        "Créer un topic par utilisateur",
        "Utiliser user_id comme clé de message pour que tous les événements de cet utilisateur aillent dans la même partition",
        "Mettre une durée de rétention infinie"
      ],
      ar: [
        "يرتّب Kafka تلقائيًا كل الرسائل عبر جميع الأقسام",
        "أنشئ موضوعًا لكل مستخدم",
        "استخدم user_id كمفتاح للرسالة لتقع كل أحداث ذلك المستخدم في القسم (partition) نفسه",
        "اجعل مدة الاحتفاظ لا نهائية"
      ]
    },
    answer: 2,
    explain: {
      en: "Kafka guarantees order only within a partition. Messages with the same key are hashed to the same partition, so per-key order is preserved while different keys are still processed in parallel.",
      fr: "Kafka ne garantit l'ordre qu'au sein d'une partition. Les messages de même clé sont hachés vers la même partition : l'ordre par clé est préservé tandis que les différentes clés restent traitées en parallèle.",
      ar: "يضمن Kafka الترتيب داخل القسم الواحد فقط. والرسائل ذات المفتاح نفسه تُوجَّه بالتجزئة إلى القسم نفسه، فيُحفَظ الترتيب لكل مفتاح مع بقاء المفاتيح المختلفة تُعالَج بالتوازي."
    }
  },
  {
    id: "de-kafka-consumers-vs-partitions",
    concept: "apache-kafka",
    difficulty: 2,
    q: {
      en: "A topic has 6 partitions. To speed up processing, you scale one consumer group from 6 to 10 consumers. What happens?",
      fr: "Un topic a 6 partitions. Pour accélérer le traitement, vous passez un groupe de consommateurs de 6 à 10 consommateurs. Que se passe-t-il ?",
      ar: "لموضوع ما 6 أقسام. لتسريع المعالجة، توسّع مجموعة مستهلكين واحدة من 6 إلى 10 مستهلكين. ماذا يحدث؟"
    },
    options: {
      en: [
        "Throughput rises by about 67%, since Kafka splits each partition across consumers",
        "Every consumer receives a full copy of every message",
        "Only 6 consumers receive data and 4 sit idle, because a partition is read by at most one consumer in a group",
        "Kafka automatically creates 4 new partitions"
      ],
      fr: [
        "Le débit augmente d'environ 67 %, car Kafka répartit chaque partition entre les consommateurs",
        "Chaque consommateur reçoit une copie complète de chaque message",
        "Seuls 6 consommateurs reçoivent des données et 4 restent inactifs, car une partition est lue par au plus un consommateur du groupe",
        "Kafka crée automatiquement 4 nouvelles partitions"
      ],
      ar: [
        "يرتفع معدل المعالجة بنحو 67% لأن Kafka يوزّع كل قسم على المستهلكين",
        "يستقبل كل مستهلك نسخة كاملة من كل رسالة",
        "6 مستهلكين فقط يستقبلون البيانات ويبقى 4 خاملين، لأن القسم يقرؤه مستهلك واحد على الأكثر في المجموعة",
        "ينشئ Kafka تلقائيًا 4 أقسام جديدة"
      ]
    },
    answer: 2,
    explain: {
      en: "Partitions are the unit of parallelism: within a consumer group each partition is assigned to exactly one consumer. To use 10 consumers you need at least 10 partitions.",
      fr: "Les partitions sont l'unité de parallélisme : dans un groupe, chaque partition est attribuée à un seul consommateur. Pour utiliser 10 consommateurs, il faut au moins 10 partitions.",
      ar: "الأقسام هي وحدة التوازي: داخل مجموعة المستهلكين يُسنَد كل قسم إلى مستهلك واحد بالضبط. ولاستخدام 10 مستهلكين تحتاج إلى 10 أقسام على الأقل."
    }
  },
  // ── apache-spark ──
  {
    id: "de-spark-lazy-evaluation",
    concept: "apache-spark",
    difficulty: 1,
    q: {
      en: "In Spark, filter() and select() return instantly even on terabytes of data. Why?",
      fr: "Dans Spark, filter() et select() répondent instantanément même sur des téraoctets de données. Pourquoi ?",
      ar: "في Spark، تعود الدالتان filter() و select() فورًا حتى على تيرابايتات من البيانات. لماذا؟"
    },
    options: {
      en: [
        "Spark caches every table in memory at startup",
        "Spark samples 1% of the data for transformations",
        "Transformations are lazy: Spark only builds a plan and runs it when an action such as count() or write() is called",
        "These functions run on the driver without touching the data"
      ],
      fr: [
        "Spark met toutes les tables en cache mémoire au démarrage",
        "Spark échantillonne 1 % des données pour les transformations",
        "Les transformations sont paresseuses : Spark construit seulement un plan et l'exécute quand une action comme count() ou write() est appelée",
        "Ces fonctions s'exécutent sur le driver sans toucher aux données"
      ],
      ar: [
        "يخزّن Spark كل الجداول في الذاكرة عند بدء التشغيل",
        "يأخذ Spark عينة 1% من البيانات للتحويلات",
        "التحويلات كسولة (lazy): يبني Spark خطة فقط ولا ينفذها إلا عند استدعاء إجراء مثل count() أو write()",
        "تعمل هذه الدوال على المُشغِّل (driver) دون لمس البيانات"
      ]
    },
    answer: 2,
    explain: {
      en: "Deferring execution lets Spark's optimizer see the whole chain, push filters down, prune columns and plan stages before reading any data. Nothing is computed until an action needs a result.",
      fr: "Différer l'exécution permet à l'optimiseur de Spark de voir toute la chaîne, de pousser les filtres, d'élaguer les colonnes et de planifier les étapes avant de lire la moindre donnée. Rien n'est calculé tant qu'une action n'a pas besoin d'un résultat.",
      ar: "تأجيل التنفيذ يتيح لمُحسِّن Spark رؤية السلسلة كاملة، ودفع المرشّحات إلى المصدر، وحذف الأعمدة غير اللازمة، وتخطيط المراحل قبل قراءة أي بيانات. لا شيء يُحسب حتى يحتاج إجراءٌ إلى نتيجة."
    }
  },
  {
    id: "de-spark-shuffle",
    concept: "apache-spark",
    difficulty: 2,
    q: {
      en: "Why are groupBy and join usually the most expensive steps in a Spark job?",
      fr: "Pourquoi groupBy et join sont-ils généralement les étapes les plus coûteuses d'un job Spark ?",
      ar: "لماذا تكون عمليتا groupBy و join عادةً أغلى خطوات مهمة Spark؟"
    },
    options: {
      en: [
        "They can only run on the driver node",
        "They force Spark to convert DataFrames back to CSV",
        "They disable lazy evaluation for the whole job",
        "They need a shuffle: rows with the same key must be moved across the network to the same executor"
      ],
      fr: [
        "Elles ne peuvent s'exécuter que sur le nœud driver",
        "Elles obligent Spark à reconvertir les DataFrames en CSV",
        "Elles désactivent l'évaluation paresseuse pour tout le job",
        "Elles nécessitent un shuffle : les lignes de même clé doivent être déplacées sur le réseau vers le même exécuteur"
      ],
      ar: [
        "لا يمكن تشغيلهما إلا على عقدة المُشغِّل",
        "تجبران Spark على تحويل DataFrames إلى CSV",
        "تعطّلان التقييم الكسول للمهمة بأكملها",
        "تتطلبان خلطًا (shuffle): يجب نقل الصفوف ذات المفتاح نفسه عبر الشبكة إلى المنفّذ نفسه"
      ]
    },
    answer: 3,
    explain: {
      en: "Narrow transformations like filter work partition by partition, but wide ones need all rows of a key together, so data is written, sent over the network and re-read. Broadcasting a small table or pre-bucketing can avoid that shuffle.",
      fr: "Les transformations étroites comme filter travaillent partition par partition, mais les larges ont besoin de toutes les lignes d'une clé ensemble : les données sont écrites, envoyées sur le réseau et relues. Diffuser une petite table (broadcast) ou pré-bucketer peut éviter ce shuffle.",
      ar: "التحويلات الضيقة مثل filter تعمل قسمًا بقسم، أما الواسعة فتحتاج كل صفوف المفتاح معًا، فتُكتَب البيانات وتُرسَل عبر الشبكة وتُقرأ مجددًا. يمكن تجنب هذا الخلط ببث جدول صغير (broadcast) أو بالتجزئة المسبقة (bucketing)."
    }
  },
  {
    id: "de-spark-small-data",
    concept: "apache-spark",
    difficulty: 2,
    q: {
      en: "An analyst needs to aggregate a 3 GB CSV file once a week on a laptop with 32 GB of RAM. Which tool is the most sensible choice?",
      fr: "Un analyste doit agréger un fichier CSV de 3 Go une fois par semaine sur un portable doté de 32 Go de RAM. Quel outil est le plus raisonnable ?",
      ar: "يحتاج محلل إلى تجميع ملف CSV حجمه 3 GB مرة أسبوعيًا على حاسوب محمول بذاكرة 32 GB. ما الأداة الأكثر منطقية؟"
    },
    options: {
      en: [
        "A 20-node Spark cluster",
        "A single-node engine such as DuckDB or Polars",
        "Kafka Streams",
        "A Hadoop MapReduce job"
      ],
      fr: [
        "Un cluster Spark de 20 nœuds",
        "Un moteur mono-nœud comme DuckDB ou Polars",
        "Kafka Streams",
        "Un job Hadoop MapReduce"
      ],
      ar: [
        "عنقود Spark من 20 عقدة",
        "محرك على عقدة واحدة مثل DuckDB أو Polars",
        "Kafka Streams",
        "مهمة Hadoop MapReduce"
      ]
    },
    answer: 1,
    explain: {
      en: "Data that fits comfortably in one machine's memory does not need distribution; a cluster adds startup time, shuffles and operational cost. Single-node columnar engines are often faster and much simpler at this scale.",
      fr: "Des données qui tiennent largement en mémoire sur une machine n'ont pas besoin d'être distribuées ; un cluster ajoute temps de démarrage, shuffles et coûts d'exploitation. Les moteurs colonnaires mono-nœud sont souvent plus rapides et bien plus simples à cette échelle.",
      ar: "البيانات التي تتسع بسهولة في ذاكرة جهاز واحد لا تحتاج إلى توزيع؛ فالعنقود يضيف زمن إقلاع وعمليات خلط وتكاليف تشغيل. ومحركات الأعمدة على عقدة واحدة غالبًا أسرع وأبسط بكثير عند هذا الحجم."
    }
  },
  // ── batch-vs-stream ──
  {
    id: "de-batch-stream-definition",
    concept: "batch-vs-stream",
    difficulty: 1,
    q: {
      en: "What is the core difference between batch and stream processing?",
      fr: "Quelle est la différence fondamentale entre traitement par lots (batch) et traitement en flux (streaming) ?",
      ar: "ما الفرق الجوهري بين المعالجة الدفعية (batch) والمعالجة التدفقية (streaming)؟"
    },
    options: {
      en: [
        "Batch works only with SQL; streaming works only with Python",
        "Batch processes bounded chunks of data on a schedule; streaming processes unbounded events continuously as they arrive",
        "Batch runs in the cloud; streaming runs on premises",
        "Batch never fails; streaming loses data by design"
      ],
      fr: [
        "Le batch fonctionne seulement en SQL ; le streaming seulement en Python",
        "Le batch traite des blocs de données bornés selon une planification ; le streaming traite en continu des événements non bornés dès leur arrivée",
        "Le batch tourne dans le cloud ; le streaming sur site",
        "Le batch n'échoue jamais ; le streaming perd des données par conception"
      ],
      ar: [
        "تعمل الدفعية بـ SQL فقط، والتدفقية بـ Python فقط",
        "تعالج الدفعية أجزاءً محدودة من البيانات وفق جدول زمني؛ وتعالج التدفقية أحداثًا غير محدودة باستمرار فور وصولها",
        "تعمل الدفعية في السحابة، والتدفقية في مراكز البيانات المحلية",
        "الدفعية لا تفشل أبدًا، والتدفقية تفقد البيانات بطبيعتها"
      ]
    },
    answer: 1,
    explain: {
      en: "Batch trades latency (minutes to hours) for throughput and simplicity; streaming delivers results within seconds but must handle state, late data and continuous operation.",
      fr: "Le batch échange de la latence (minutes à heures) contre du débit et de la simplicité ; le streaming livre des résultats en quelques secondes mais doit gérer l'état, les données tardives et le fonctionnement continu.",
      ar: "تقايض الدفعية زمن الاستجابة (دقائق إلى ساعات) مقابل الإنتاجية والبساطة؛ أما التدفقية فتقدّم النتائج خلال ثوانٍ لكن عليها إدارة الحالة والبيانات المتأخرة والتشغيل المستمر."
    }
  },
  {
    id: "de-batch-stream-watermark",
    concept: "batch-vs-stream",
    difficulty: 2,
    q: {
      en: "In a streaming job that counts clicks per 5-minute window by event time, what is a watermark for?",
      fr: "Dans un job de streaming qui compte les clics par fenêtre de 5 minutes selon l'heure de l'événement, à quoi sert un watermark ?",
      ar: "في مهمة تدفقية تعدّ النقرات لكل نافذة 5 دقائق حسب وقت الحدث، ما فائدة العلامة المائية (watermark)؟"
    },
    options: {
      en: [
        "It encrypts events so they cannot be read in transit",
        "It defines how long to wait for late events before a window is considered complete and its state can be dropped",
        "It marks the newest event so it is processed first",
        "It converts event time into processing time"
      ],
      fr: [
        "Il chiffre les événements pour qu'ils ne soient pas lisibles en transit",
        "Il définit combien de temps attendre les événements en retard avant de considérer une fenêtre comme complète et de libérer son état",
        "Il marque l'événement le plus récent pour qu'il soit traité en premier",
        "Il convertit l'heure de l'événement en heure de traitement"
      ],
      ar: [
        "تشفّر الأحداث حتى لا تُقرأ أثناء النقل",
        "تحدد مدة انتظار الأحداث المتأخرة قبل اعتبار النافذة مكتملة وإمكانية التخلص من حالتها",
        "تعلّم أحدث حدث ليُعالَج أولًا",
        "تحوّل وقت الحدث إلى وقت المعالجة"
      ]
    },
    answer: 1,
    explain: {
      en: "Events from phones or flaky networks can arrive minutes late. A watermark such as 'tolerate 10 minutes of lateness' balances completeness against memory and latency: later events are dropped or handled separately.",
      fr: "Les événements venant de téléphones ou de réseaux instables peuvent arriver avec des minutes de retard. Un watermark comme « tolérer 10 minutes de retard » arbitre entre exhaustivité, mémoire et latence : les événements plus tardifs sont ignorés ou traités à part.",
      ar: "قد تصل أحداث الهواتف أو الشبكات غير المستقرة متأخرة بدقائق. والعلامة المائية مثل «تقبّل تأخرًا حتى 10 دقائق» توازن بين الاكتمال من جهة والذاكرة وزمن الاستجابة من جهة أخرى: فالأحداث الأكثر تأخرًا تُهمَل أو تُعالَج على حدة."
    }
  },
  {
    id: "de-batch-stream-lambda-drawback",
    concept: "batch-vs-stream",
    difficulty: 2,
    q: {
      en: "What is the main drawback of the Lambda architecture that the Kappa architecture tries to remove?",
      fr: "Quel est le principal inconvénient de l'architecture Lambda que l'architecture Kappa cherche à éliminer ?",
      ar: "ما العيب الرئيسي في معمارية Lambda الذي تسعى معمارية Kappa إلى إزالته؟"
    },
    options: {
      en: [
        "It cannot process historical data at all",
        "It only works with a single machine",
        "It stores data exclusively in CSV files",
        "The same logic is written and maintained twice, once in the batch layer and once in the speed layer"
      ],
      fr: [
        "Elle ne peut pas du tout traiter les données historiques",
        "Elle ne fonctionne que sur une seule machine",
        "Elle stocke les données exclusivement en fichiers CSV",
        "La même logique est écrite et maintenue deux fois, dans la couche batch et dans la couche temps réel"
      ],
      ar: [
        "لا تستطيع معالجة البيانات التاريخية إطلاقًا",
        "لا تعمل إلا على جهاز واحد",
        "تخزّن البيانات في ملفات CSV حصرًا",
        "يُكتب المنطق نفسه ويُصان مرتين، مرة في الطبقة الدفعية ومرة في طبقة السرعة"
      ]
    },
    answer: 3,
    explain: {
      en: "Two codebases computing the same metric tend to drift apart and double the maintenance. Kappa keeps a single streaming pipeline and reprocesses history by replaying the event log.",
      fr: "Deux bases de code calculant la même métrique finissent par diverger et doublent la maintenance. Kappa garde un seul pipeline de streaming et retraite l'historique en rejouant le journal d'événements.",
      ar: "قاعدتا شيفرة تحسبان المقياس نفسه تميلان إلى التباعد وتضاعفان الصيانة. أما Kappa فتُبقي خط معالجة تدفقيًا واحدًا وتعيد معالجة التاريخ بإعادة تشغيل سجل الأحداث."
    }
  },
  {
    id: "de-batch-stream-daily-dashboard",
    concept: "batch-vs-stream",
    difficulty: 3,
    q: {
      en: "The marketing team reviews a sales dashboard once each morning. An engineer proposes a Kafka + Flink streaming pipeline to feed it. What is the best advice?",
      fr: "L'équipe marketing consulte un tableau de bord des ventes une fois chaque matin. Un ingénieur propose un pipeline de streaming Kafka + Flink pour l'alimenter. Quel est le meilleur conseil ?",
      ar: "يراجع فريق التسويق لوحة مبيعات مرة كل صباح. يقترح مهندس خط معالجة تدفقيًا بـ Kafka + Flink لتغذيتها. ما أفضل نصيحة؟"
    },
    options: {
      en: [
        "Build the streaming pipeline, since streaming is always more accurate",
        "Use Lambda architecture to get both",
        "Refresh the dashboard every second with direct queries on the production database",
        "Use a scheduled nightly batch job; streaming adds cost and operational burden for no benefit here"
      ],
      fr: [
        "Construire le pipeline de streaming, car le streaming est toujours plus exact",
        "Utiliser une architecture Lambda pour avoir les deux",
        "Rafraîchir le tableau de bord chaque seconde par des requêtes directes sur la base de production",
        "Utiliser un job batch nocturne planifié ; le streaming ajoute coût et charge d'exploitation sans bénéfice ici"
      ],
      ar: [
        "ابنِ خط المعالجة التدفقي لأن التدفقية أدق دائمًا",
        "استخدم معمارية Lambda للحصول على الاثنين",
        "حدّث اللوحة كل ثانية باستعلامات مباشرة على قاعدة بيانات الإنتاج",
        "استخدم مهمة دفعية ليلية مجدولة؛ فالتدفقية تضيف كلفة وعبئًا تشغيليًا دون فائدة هنا"
      ]
    },
    answer: 3,
    explain: {
      en: "Match latency to how the data is actually used. If people look once a day, results that are a few hours old are fine, and batch is cheaper, simpler and easier to backfill.",
      fr: "Adaptez la latence à l'usage réel des données. Si on les consulte une fois par jour, des résultats vieux de quelques heures suffisent, et le batch est moins cher, plus simple et plus facile à rejouer.",
      ar: "طابِق زمن الاستجابة مع طريقة استخدام البيانات فعليًا. إذا كان الناس ينظرون إليها مرة يوميًا فالنتائج التي عمرها بضع ساعات كافية، والمعالجة الدفعية أرخص وأبسط وأسهل في التعبئة الرجعية."
    }
  },
  // ── cdc ──
  {
    id: "de-cdc-definition",
    concept: "cdc",
    difficulty: 1,
    q: {
      en: "What does log-based Change Data Capture (CDC) read to detect changes in a source database?",
      fr: "Que lit la capture de données modifiées (CDC) basée sur les journaux pour détecter les changements d'une base source ?",
      ar: "ماذا يقرأ التقاط تغييرات البيانات (CDC) القائم على السجلات لاكتشاف التغييرات في قاعدة البيانات المصدر؟"
    },
    options: {
      en: [
        "The database's transaction log (e.g. the PostgreSQL WAL or MySQL binlog)",
        "A full SELECT * of every table each hour",
        "The application's web server access logs",
        "Screenshots of the admin dashboard"
      ],
      fr: [
        "Le journal de transactions de la base (par ex. le WAL de PostgreSQL ou le binlog de MySQL)",
        "Un SELECT * complet de chaque table toutes les heures",
        "Les journaux d'accès du serveur web de l'application",
        "Des captures d'écran du tableau de bord d'administration"
      ],
      ar: [
        "سجل المعاملات في قاعدة البيانات (مثل WAL في PostgreSQL أو binlog في MySQL)",
        "استعلام SELECT * كامل لكل جدول كل ساعة",
        "سجلات الوصول لخادم الويب الخاص بالتطبيق",
        "لقطات شاشة للوحة الإدارة"
      ]
    },
    answer: 0,
    explain: {
      en: "Every insert, update and delete is already written to the transaction log for durability. CDC tools like Debezium tail that log and publish each change as an event, typically to Kafka.",
      fr: "Chaque insertion, mise à jour et suppression est déjà écrite dans le journal de transactions pour la durabilité. Les outils CDC comme Debezium suivent ce journal et publient chaque changement comme un événement, généralement dans Kafka.",
      ar: "كل عملية إدراج وتحديث وحذف تُكتب أصلًا في سجل المعاملات لضمان الديمومة. وأدوات CDC مثل Debezium تتابع هذا السجل وتنشر كل تغيير كحدث، عادةً إلى Kafka."
    }
  },
  {
    id: "de-cdc-vs-polling",
    concept: "cdc",
    difficulty: 2,
    q: {
      en: "Compared with polling a table for rows whose updated_at changed, what is a key advantage of log-based CDC?",
      fr: "Par rapport à l'interrogation périodique des lignes dont updated_at a changé, quel est un avantage clé de la CDC basée sur les journaux ?",
      ar: "مقارنةً بالاستعلام الدوري عن الصفوف التي تغيّر فيها updated_at، ما الميزة الأساسية لـ CDC القائم على السجلات؟"
    },
    options: {
      en: [
        "It does not need any access to the source database",
        "It captures deletes and every intermediate change, with little load on the source database",
        "It automatically fixes bad data before sending it",
        "It turns the source database into an OLAP system"
      ],
      fr: [
        "Elle ne nécessite aucun accès à la base source",
        "Elle capture les suppressions et chaque changement intermédiaire, avec peu de charge sur la base source",
        "Elle corrige automatiquement les mauvaises données avant de les envoyer",
        "Elle transforme la base source en système OLAP"
      ],
      ar: [
        "لا يحتاج إلى أي وصول إلى قاعدة البيانات المصدر",
        "يلتقط عمليات الحذف وكل تغيير وسيط، مع عبء ضئيل على قاعدة البيانات المصدر",
        "يصلح البيانات الرديئة تلقائيًا قبل إرسالها",
        "يحوّل قاعدة البيانات المصدر إلى نظام OLAP"
      ]
    },
    answer: 1,
    explain: {
      en: "A deleted row simply disappears, so a timestamp query never sees it, and a row updated twice between polls shows only its last state. Reading the log captures every change in order without running heavy queries on production.",
      fr: "Une ligne supprimée disparaît simplement, donc une requête sur l'horodatage ne la voit jamais, et une ligne modifiée deux fois entre deux interrogations ne montre que son dernier état. Lire le journal capture chaque changement dans l'ordre sans lourdes requêtes en production.",
      ar: "الصف المحذوف يختفي ببساطة فلا يراه استعلام الطابع الزمني أبدًا، والصف المحدَّث مرتين بين استعلامين لا يظهر إلا بحالته الأخيرة. أما قراءة السجل فتلتقط كل تغيير بالترتيب دون استعلامات ثقيلة على الإنتاج."
    }
  },
  {
    id: "de-cdc-freshness-scenario",
    concept: "cdc",
    difficulty: 3,
    q: {
      en: "A nightly full reload of a 2 TB orders table from PostgreSQL takes 5 hours, and analysts now want data no more than 5 minutes old. What should you build?",
      fr: "Le rechargement complet nocturne d'une table de commandes de 2 To depuis PostgreSQL prend 5 heures, et les analystes veulent désormais des données de moins de 5 minutes. Que faut-il construire ?",
      ar: "تستغرق إعادة التحميل الكاملة الليلية لجدول طلبات بحجم 2 TB من PostgreSQL خمس ساعات، ويريد المحللون الآن بيانات لا يتجاوز عمرها 5 دقائق. ماذا يجب أن تبني؟"
    },
    options: {
      en: [
        "Run the full reload every 5 minutes",
        "Give analysts direct query access to the production database",
        "Add more indexes to the orders table",
        "Log-based CDC (e.g. Debezium to Kafka) merged continuously into the warehouse or lakehouse"
      ],
      fr: [
        "Lancer le rechargement complet toutes les 5 minutes",
        "Donner aux analystes un accès direct en requête à la base de production",
        "Ajouter des index à la table des commandes",
        "Une CDC basée sur les journaux (par ex. Debezium vers Kafka) fusionnée en continu dans l'entrepôt ou le lakehouse"
      ],
      ar: [
        "تشغيل إعادة التحميل الكاملة كل 5 دقائق",
        "منح المحللين وصولًا مباشرًا للاستعلام على قاعدة بيانات الإنتاج",
        "إضافة فهارس أكثر إلى جدول الطلبات",
        "CDC قائم على السجلات (مثل Debezium إلى Kafka) يُدمَج باستمرار في المستودع أو منصة lakehouse"
      ]
    },
    answer: 3,
    explain: {
      en: "Only a small fraction of rows changes in 5 minutes, so shipping just those changes is far cheaper than recopying 2 TB. CDC gives near real-time freshness without loading the production database with analytical queries.",
      fr: "Seule une petite fraction des lignes change en 5 minutes : n'envoyer que ces changements coûte bien moins que recopier 2 To. La CDC offre une fraîcheur quasi temps réel sans charger la base de production de requêtes analytiques.",
      ar: "نسبة صغيرة فقط من الصفوف تتغير خلال 5 دقائق، فنقل هذه التغييرات وحدها أرخص بكثير من إعادة نسخ 2 TB. ويوفر CDC حداثة شبه لحظية دون إثقال قاعدة الإنتاج باستعلامات تحليلية."
    }
  },
  // ── data-partitioning ──
  {
    id: "de-partition-pruning",
    concept: "data-partitioning",
    difficulty: 1,
    q: {
      en: "A table is partitioned by event_date. What is partition pruning?",
      fr: "Une table est partitionnée par event_date. Qu'est-ce que l'élagage de partitions (partition pruning) ?",
      ar: "جدول مقسّم حسب event_date. ما المقصود بتقليم الأقسام (partition pruning)؟"
    },
    options: {
      en: [
        "Old partitions are deleted automatically after 30 days",
        "Partitions are merged into one file before each query",
        "Rows are sorted by date inside each file",
        "The query engine skips every partition whose date does not match the query's filter"
      ],
      fr: [
        "Les anciennes partitions sont supprimées automatiquement après 30 jours",
        "Les partitions sont fusionnées en un seul fichier avant chaque requête",
        "Les lignes sont triées par date à l'intérieur de chaque fichier",
        "Le moteur de requêtes ignore toute partition dont la date ne correspond pas au filtre de la requête"
      ],
      ar: [
        "تُحذف الأقسام القديمة تلقائيًا بعد 30 يومًا",
        "تُدمج الأقسام في ملف واحد قبل كل استعلام",
        "تُرتَّب الصفوف حسب التاريخ داخل كل ملف",
        "يتخطى محرك الاستعلام كل قسم لا يطابق تاريخه مرشّح الاستعلام"
      ]
    },
    answer: 3,
    explain: {
      en: "Each partition is a separate folder (e.g. event_date=2025-03-01/), so a query with WHERE event_date = '2025-03-01' reads only that folder instead of the whole table, cutting I/O and cost.",
      fr: "Chaque partition est un dossier distinct (par ex. event_date=2025-03-01/) : une requête avec WHERE event_date = '2025-03-01' ne lit que ce dossier au lieu de toute la table, ce qui réduit les E/S et le coût.",
      ar: "كل قسم مجلد منفصل (مثل event_date=2025-03-01/)، فالاستعلام الذي فيه WHERE event_date = '2025-03-01' يقرأ ذلك المجلد وحده بدل الجدول كله، مما يقلل عمليات الإدخال والإخراج والتكلفة."
    }
  },
  {
    id: "de-partition-high-cardinality",
    concept: "data-partitioning",
    difficulty: 2,
    q: {
      en: "Why is partitioning a large table by user_id (10 million users) usually a bad idea?",
      fr: "Pourquoi partitionner une grande table par user_id (10 millions d'utilisateurs) est-il généralement une mauvaise idée ?",
      ar: "لماذا يُعدّ تقسيم جدول كبير حسب user_id (عشرة ملايين مستخدم) فكرة سيئة عادةً؟"
    },
    options: {
      en: [
        "It creates millions of tiny files and folders, which overwhelms metadata and slows every query",
        "Partition columns must be dates",
        "It makes the table impossible to join",
        "It forces all data into one huge file"
      ],
      fr: [
        "Cela crée des millions de petits fichiers et dossiers, ce qui surcharge les métadonnées et ralentit chaque requête",
        "Les colonnes de partition doivent être des dates",
        "Cela rend la table impossible à joindre",
        "Cela force toutes les données dans un seul énorme fichier"
      ],
      ar: [
        "ينشئ ملايين الملفات والمجلدات الصغيرة، مما يُغرق البيانات الوصفية ويبطئ كل استعلام",
        "يجب أن تكون أعمدة التقسيم تواريخ",
        "يجعل ربط الجدول (join) مستحيلًا",
        "يجبر كل البيانات على ملف ضخم واحد"
      ]
    },
    answer: 0,
    explain: {
      en: "This is the small file problem: listing and opening millions of files costs more than reading the data. Partition on low-cardinality columns that queries filter on (date, region) and use bucketing or clustering for high-cardinality keys.",
      fr: "C'est le problème des petits fichiers : lister et ouvrir des millions de fichiers coûte plus que lire les données. Partitionnez sur des colonnes à faible cardinalité filtrées par les requêtes (date, région) et utilisez le bucketing ou le clustering pour les clés à forte cardinalité.",
      ar: "هذه مشكلة الملفات الصغيرة: سرد ملايين الملفات وفتحها يكلّف أكثر من قراءة البيانات نفسها. قسّم على أعمدة قليلة القيم المميزة تُرشِّح عليها الاستعلامات (التاريخ، المنطقة)، واستخدم التجزئة (bucketing) أو التجميع للمفاتيح كثيرة القيم."
    }
  },
  {
    id: "de-partition-choose-column",
    concept: "data-partitioning",
    difficulty: 3,
    q: {
      en: "A 3 TB clickstream table is queried almost always with a filter on the last 7 days. It has columns event_time, country (40 values), session_id and url. Which partitioning is best?",
      fr: "Une table de clickstream de 3 To est presque toujours interrogée avec un filtre sur les 7 derniers jours. Elle contient event_time, country (40 valeurs), session_id et url. Quel partitionnement est le meilleur ?",
      ar: "جدول تدفق نقرات بحجم 3 TB يُستعلَم عنه دائمًا تقريبًا مع مرشّح على آخر 7 أيام. أعمدته event_time و country (40 قيمة) و session_id و url. ما أفضل تقسيم؟"
    },
    options: {
      en: [
        "Partition by session_id",
        "Partition by url",
        "Partition by a date column derived from event_time",
        "Partition by the exact event_time timestamp"
      ],
      fr: [
        "Partitionner par session_id",
        "Partitionner par url",
        "Partitionner par une colonne de date dérivée de event_time",
        "Partitionner par l'horodatage exact event_time"
      ],
      ar: [
        "التقسيم حسب session_id",
        "التقسيم حسب url",
        "التقسيم حسب عمود تاريخ مشتق من event_time",
        "التقسيم حسب الطابع الزمني الدقيق event_time"
      ]
    },
    answer: 2,
    explain: {
      en: "Partition on what queries filter by, at a granularity that yields reasonably large files. A daily partition lets a 7-day query read about 7 folders; session_id, url or raw timestamps would create millions of tiny partitions.",
      fr: "Partitionnez selon ce que filtrent les requêtes, à une granularité qui donne des fichiers assez gros. Une partition journalière permet à une requête sur 7 jours de lire environ 7 dossiers ; session_id, url ou l'horodatage brut créeraient des millions de minuscules partitions.",
      ar: "قسّم حسب ما ترشّح عليه الاستعلامات، وبدقة تعطي ملفات كبيرة بما يكفي. التقسيم اليومي يتيح لاستعلام الأيام السبعة قراءة نحو 7 مجلدات فقط، بينما يُنشئ session_id أو url أو الطابع الزمني الخام ملايين الأقسام الصغيرة."
    }
  },
  // ── data-quality ──
  {
    id: "de-dq-uniqueness",
    concept: "data-quality",
    difficulty: 1,
    q: {
      en: "The check 'order_id must never appear twice in the orders table' tests which data quality dimension?",
      fr: "Le contrôle « order_id ne doit jamais apparaître deux fois dans la table des commandes » teste quelle dimension de la qualité des données ?",
      ar: "الفحص «يجب ألا يظهر order_id مرتين في جدول الطلبات» يختبر أي بُعد من أبعاد جودة البيانات؟"
    },
    options: {
      en: [
        "Freshness",
        "Completeness",
        "Uniqueness",
        "Validity"
      ],
      fr: [
        "La fraîcheur",
        "La complétude",
        "L'unicité",
        "La validité"
      ],
      ar: [
        "الحداثة",
        "الاكتمال",
        "التفرّد",
        "الصلاحية"
      ]
    },
    answer: 2,
    explain: {
      en: "Uniqueness checks that a key identifies exactly one row; duplicates often come from retried loads or bad joins and silently inflate totals. Freshness is about arrival time, completeness about missing values, validity about allowed formats or ranges.",
      fr: "L'unicité vérifie qu'une clé identifie exactement une ligne ; les doublons viennent souvent de chargements relancés ou de mauvaises jointures et gonflent silencieusement les totaux. La fraîcheur concerne l'heure d'arrivée, la complétude les valeurs manquantes, la validité les formats ou plages autorisés.",
      ar: "يتحقق التفرّد من أن المفتاح يحدد صفًا واحدًا بالضبط؛ والتكرارات تنتج غالبًا عن تحميل أُعيدت محاولته أو ربط خاطئ، وتضخّم المجاميع بصمت. أما الحداثة فتتعلق بوقت الوصول، والاكتمال بالقيم المفقودة، والصلاحية بالصيغ أو النطاقات المسموح بها."
    }
  },
  {
    id: "de-dq-where-to-check",
    concept: "data-quality",
    difficulty: 2,
    q: {
      en: "Where in a pipeline do data quality checks give the most value?",
      fr: "À quel endroit d'un pipeline les contrôles de qualité des données apportent-ils le plus de valeur ?",
      ar: "في أي موضع من خط المعالجة تعطي فحوص جودة البيانات أكبر فائدة؟"
    },
    options: {
      en: [
        "Only inside the BI dashboard, after users have seen the numbers",
        "Only once, when the pipeline is first written",
        "Inside the source application's user interface",
        "At boundaries: after ingestion and before publishing gold tables or training models, so bad data is stopped before consumers see it"
      ],
      fr: [
        "Seulement dans le tableau de bord BI, après que les utilisateurs ont vu les chiffres",
        "Une seule fois, quand le pipeline est écrit",
        "Dans l'interface utilisateur de l'application source",
        "Aux frontières : après l'ingestion et avant de publier les tables gold ou d'entraîner des modèles, pour arrêter les mauvaises données avant les consommateurs"
      ],
      ar: [
        "داخل لوحة ذكاء الأعمال فقط، بعد أن يرى المستخدمون الأرقام",
        "مرة واحدة فقط عند كتابة خط المعالجة",
        "داخل واجهة المستخدم في التطبيق المصدر",
        "عند الحدود: بعد الاستيعاب وقبل نشر الجداول الذهبية أو تدريب النماذج، لإيقاف البيانات الرديئة قبل أن يراها المستهلكون"
      ]
    },
    answer: 3,
    explain: {
      en: "Data changes every run, so checks must run every run. Placing them at handoff points means a broken batch is quarantined before it corrupts dashboards or a model's training set.",
      fr: "Les données changent à chaque exécution, donc les contrôles doivent s'exécuter à chaque fois. Les placer aux points de passage permet de mettre en quarantaine un lot défectueux avant qu'il ne corrompe des tableaux de bord ou un jeu d'entraînement.",
      ar: "البيانات تتغير في كل تشغيل، فيجب أن تعمل الفحوص في كل تشغيل. ووضعها عند نقاط التسليم يعني عزل الدفعة المعطوبة قبل أن تُفسد اللوحات أو بيانات تدريب نموذج."
    }
  },
  {
    id: "de-dq-alert-fatigue",
    concept: "data-quality",
    difficulty: 3,
    q: {
      en: "Your team has 400 data checks that fire dozens of warnings every day, and everyone has learned to ignore them. A real outage went unnoticed last week. What is the best fix?",
      fr: "Votre équipe a 400 contrôles de données qui déclenchent des dizaines d'alertes chaque jour, et tout le monde a appris à les ignorer. Une vraie panne est passée inaperçue la semaine dernière. Quelle est la meilleure correction ?",
      ar: "لدى فريقك 400 فحص بيانات تطلق عشرات التنبيهات يوميًا، وتعلّم الجميع تجاهلها. ومرّ عطل حقيقي دون أن يلاحظه أحد الأسبوع الماضي. ما أفضل إصلاح؟"
    },
    options: {
      en: [
        "Keep fewer, high-value checks, mark critical ones as blocking, and give each alert an owner",
        "Add another 400 checks to catch more problems",
        "Turn all alerts off and rely on users to report issues",
        "Send every warning to the whole company"
      ],
      fr: [
        "Garder moins de contrôles mais à forte valeur, rendre bloquants les critiques et attribuer un responsable à chaque alerte",
        "Ajouter 400 contrôles de plus pour attraper plus de problèmes",
        "Désactiver toutes les alertes et compter sur les utilisateurs pour signaler les problèmes",
        "Envoyer chaque alerte à toute l'entreprise"
      ],
      ar: [
        "الإبقاء على فحوص أقل وعالية القيمة، وجعل الحرجة منها مانعة، وتعيين مسؤول لكل تنبيه",
        "إضافة 400 فحص آخر لالتقاط مشكلات أكثر",
        "إيقاف كل التنبيهات والاعتماد على المستخدمين للإبلاغ عن المشكلات",
        "إرسال كل تنبيه إلى الشركة بأكملها"
      ]
    },
    answer: 0,
    explain: {
      en: "This is alert fatigue: noisy checks train people to ignore all alerts, including real ones. Fewer, meaningful checks with clear severity and ownership make every alert worth acting on.",
      fr: "C'est la fatigue d'alerte : des contrôles bruyants habituent les gens à ignorer toutes les alertes, y compris les vraies. Des contrôles moins nombreux mais pertinents, avec une gravité et un responsable clairs, rendent chaque alerte digne d'action.",
      ar: "هذا هو إرهاق التنبيهات: الفحوص المزعجة تعوّد الناس على تجاهل كل التنبيهات، بما فيها الحقيقية. أما الفحوص الأقل والأكثر معنى، بدرجة خطورة ومسؤول واضحين، فتجعل كل تنبيه جديرًا بالتصرف."
    }
  },
  // ── dbt ──
  {
    id: "de-dbt-role",
    concept: "dbt",
    difficulty: 1,
    q: {
      en: "Which part of an ELT pipeline does dbt handle?",
      fr: "Quelle partie d'un pipeline ELT dbt prend-il en charge ?",
      ar: "أي جزء من خط معالجة ELT يتولاه dbt؟"
    },
    options: {
      en: [
        "The T: transforming data already loaded in the warehouse with version-controlled SQL",
        "The E: extracting data from SaaS APIs",
        "The L: loading files into object storage",
        "Streaming events between microservices"
      ],
      fr: [
        "Le T : transformer les données déjà chargées dans l'entrepôt avec du SQL versionné",
        "Le E : extraire les données des API SaaS",
        "Le L : charger des fichiers dans le stockage objet",
        "Diffuser des événements entre microservices"
      ],
      ar: [
        "حرف T: تحويل البيانات المحمّلة أصلًا في المستودع باستخدام SQL خاضع لإدارة الإصدارات",
        "حرف E: استخراج البيانات من واجهات SaaS البرمجية",
        "حرف L: تحميل الملفات إلى التخزين الكائني",
        "بث الأحداث بين الخدمات المصغّرة"
      ]
    },
    answer: 0,
    explain: {
      en: "dbt compiles SELECT statements into tables and views inside the warehouse and adds tests, documentation and Git workflows. Extraction and loading are left to tools such as Fivetran, Airbyte or CDC.",
      fr: "dbt compile des requêtes SELECT en tables et vues dans l'entrepôt et ajoute tests, documentation et workflows Git. L'extraction et le chargement sont laissés à des outils comme Fivetran, Airbyte ou la CDC.",
      ar: "يحوّل dbt عبارات SELECT إلى جداول وعروض داخل المستودع، ويضيف الاختبارات والتوثيق وسير عمل Git. أما الاستخراج والتحميل فيُتركان لأدوات مثل Fivetran أو Airbyte أو CDC."
    }
  },
  {
    id: "de-dbt-ref",
    concept: "dbt",
    difficulty: 2,
    q: {
      en: "Why write {{ ref('stg_orders') }} in a dbt model instead of hard-coding the table name?",
      fr: "Pourquoi écrire {{ ref('stg_orders') }} dans un modèle dbt plutôt que de coder en dur le nom de la table ?",
      ar: "لماذا نكتب {{ ref('stg_orders') }} في نموذج dbt بدل كتابة اسم الجدول مباشرة؟"
    },
    options: {
      en: [
        "ref makes the query run on the source database instead of the warehouse",
        "ref encrypts the table name for security",
        "dbt uses ref to build the dependency graph, run models in the right order and resolve the correct schema per environment",
        "Hard-coded table names are a SQL syntax error"
      ],
      fr: [
        "ref fait exécuter la requête sur la base source au lieu de l'entrepôt",
        "ref chiffre le nom de la table pour la sécurité",
        "dbt utilise ref pour construire le graphe de dépendances, exécuter les modèles dans le bon ordre et résoudre le bon schéma selon l'environnement",
        "Les noms de table codés en dur sont une erreur de syntaxe SQL"
      ],
      ar: [
        "تجعل ref الاستعلام يعمل على قاعدة البيانات المصدر بدل المستودع",
        "تشفّر ref اسم الجدول لدواعٍ أمنية",
        "يستخدم dbt الدالة ref لبناء رسم الاعتماديات، وتشغيل النماذج بالترتيب الصحيح، وتحديد المخطط (schema) الصحيح لكل بيئة",
        "كتابة أسماء الجداول مباشرة خطأ نحوي في SQL"
      ]
    },
    answer: 2,
    explain: {
      en: "Each ref is an edge in dbt's DAG, so dbt knows stg_orders must be built first and can show lineage. The same code points to a dev schema on your laptop and the production schema in CI.",
      fr: "Chaque ref est une arête du DAG de dbt : dbt sait que stg_orders doit être construit d'abord et peut afficher le lignage. Le même code pointe vers un schéma de dev sur votre portable et vers le schéma de production en CI.",
      ar: "كل ref حافة في رسم dbt الموجّه، فيعرف dbt أن stg_orders يجب بناؤه أولًا ويستطيع عرض النسب (lineage). والشيفرة نفسها تشير إلى مخطط التطوير على حاسوبك وإلى مخطط الإنتاج في CI."
    }
  },
  {
    id: "de-dbt-ingestion-scenario",
    concept: "dbt",
    difficulty: 3,
    q: {
      en: "You need to pull data from the Salesforce API into Snowflake every hour and then build a revenue mart from it. How should the work be split?",
      fr: "Vous devez récupérer chaque heure les données de l'API Salesforce dans Snowflake, puis en construire un mart de revenus. Comment répartir le travail ?",
      ar: "تحتاج إلى سحب البيانات من واجهة Salesforce البرمجية إلى Snowflake كل ساعة ثم بناء مستودع فرعي (mart) للإيرادات منها. كيف يُقسَّم العمل؟"
    },
    options: {
      en: [
        "dbt calls the Salesforce API directly and also builds the mart",
        "An ingestion tool (e.g. Fivetran or Airbyte) loads the raw data; dbt models build and test the mart",
        "dbt loads the data; Fivetran writes the SQL transformations",
        "Load everything with Kafka and skip transformations"
      ],
      fr: [
        "dbt appelle directement l'API Salesforce et construit aussi le mart",
        "Un outil d'ingestion (par ex. Fivetran ou Airbyte) charge les données brutes ; des modèles dbt construisent et testent le mart",
        "dbt charge les données ; Fivetran écrit les transformations SQL",
        "Tout charger avec Kafka et se passer des transformations"
      ],
      ar: [
        "يستدعي dbt واجهة Salesforce مباشرة ويبني الـ mart أيضًا",
        "أداة استيعاب (مثل Fivetran أو Airbyte) تحمّل البيانات الخام، ونماذج dbt تبني الـ mart وتختبره",
        "يحمّل dbt البيانات، ويكتب Fivetran تحويلات SQL",
        "حمّل كل شيء عبر Kafka وتخلَّ عن التحويلات"
      ]
    },
    answer: 1,
    explain: {
      en: "dbt only runs SQL inside the warehouse; it does not extract from APIs. The standard modern stack pairs an EL tool for ingestion with dbt for tested, documented transformations, orchestrated by a scheduler.",
      fr: "dbt n'exécute que du SQL dans l'entrepôt ; il n'extrait pas de données d'API. La pile moderne standard associe un outil EL pour l'ingestion à dbt pour des transformations testées et documentées, orchestrées par un planificateur.",
      ar: "لا يشغّل dbt إلا SQL داخل المستودع، ولا يستخرج البيانات من الواجهات البرمجية. والحزمة الحديثة المعتادة تجمع أداة EL للاستيعاب مع dbt لتحويلات مختبرة وموثقة، بتنسيق من مُجدوِل."
    }
  },
  // ── dimensional-modeling ──
  {
    id: "de-dim-fact-vs-dimension",
    concept: "dimensional-modeling",
    difficulty: 1,
    q: {
      en: "In a star schema for retail sales, which table is the fact table?",
      fr: "Dans un schéma en étoile pour des ventes au détail, quelle table est la table de faits ?",
      ar: "في مخطط نجمي لمبيعات التجزئة، أي جدول هو جدول الحقائق؟"
    },
    options: {
      en: [
        "product: name, brand and category of each product",
        "store: city, region and size of each shop",
        "sales: one row per item sold, with quantity, amount and keys to date, store and product",
        "date: day, month, quarter and holiday flags"
      ],
      fr: [
        "product : nom, marque et catégorie de chaque produit",
        "store : ville, région et taille de chaque magasin",
        "sales : une ligne par article vendu, avec quantité, montant et clés vers date, magasin et produit",
        "date : jour, mois, trimestre et indicateurs de jours fériés"
      ],
      ar: [
        "product: اسم كل منتج وعلامته التجارية وفئته",
        "store: مدينة كل متجر ومنطقته وحجمه",
        "sales: صف لكل سلعة مُباعة، مع الكمية والمبلغ ومفاتيح إلى التاريخ والمتجر والمنتج",
        "date: اليوم والشهر والربع ومؤشرات العطل"
      ]
    },
    answer: 2,
    explain: {
      en: "Fact tables record measurable business events (numbers you sum or average) plus foreign keys. Dimension tables hold the descriptive context you filter and group by, such as product, store and date.",
      fr: "Les tables de faits enregistrent des événements métier mesurables (des nombres qu'on somme ou moyenne) et des clés étrangères. Les tables de dimensions portent le contexte descriptif servant à filtrer et regrouper : produit, magasin, date.",
      ar: "تسجّل جداول الحقائق أحداث العمل القابلة للقياس (أرقام تُجمع أو يؤخذ متوسطها) مع مفاتيح أجنبية. أما جداول الأبعاد فتحمل السياق الوصفي الذي تُرشِّح وتجمّع به، مثل المنتج والمتجر والتاريخ."
    }
  },
  {
    id: "de-dim-star-denormalized",
    concept: "dimensional-modeling",
    difficulty: 2,
    q: {
      en: "Why are dimensions in a star schema usually denormalized (e.g. category stored directly in the product table)?",
      fr: "Pourquoi les dimensions d'un schéma en étoile sont-elles généralement dénormalisées (par ex. la catégorie stockée directement dans la table produit) ?",
      ar: "لماذا تكون الأبعاد في المخطط النجمي عادةً غير مُطبَّعة (مثل تخزين الفئة مباشرة في جدول المنتج)؟"
    },
    options: {
      en: [
        "Denormalization guarantees no data is ever duplicated",
        "It makes single-row updates faster for the application",
        "Warehouses do not support foreign keys",
        "Analytical queries need fewer joins, so they are simpler for BI users and faster on OLAP engines"
      ],
      fr: [
        "La dénormalisation garantit qu'aucune donnée n'est jamais dupliquée",
        "Elle accélère les mises à jour ligne par ligne de l'application",
        "Les entrepôts ne prennent pas en charge les clés étrangères",
        "Les requêtes analytiques ont besoin de moins de jointures : plus simples pour les utilisateurs BI et plus rapides sur les moteurs OLAP"
      ],
      ar: [
        "يضمن عدم التطبيع ألا تتكرر أي بيانات أبدًا",
        "يسرّع تحديثات الصف الواحد في التطبيق",
        "المستودعات لا تدعم المفاتيح الأجنبية",
        "تحتاج الاستعلامات التحليلية إلى عمليات ربط أقل، فتكون أبسط لمستخدمي ذكاء الأعمال وأسرع على محركات OLAP"
      ]
    },
    answer: 3,
    explain: {
      en: "Normalization protects transactional systems from update anomalies, but analytics mostly reads. A flat dimension trades some redundant storage for one-join queries that are easy to write and fast to run.",
      fr: "La normalisation protège les systèmes transactionnels des anomalies de mise à jour, mais l'analytique lit surtout. Une dimension plate échange un peu de stockage redondant contre des requêtes à une seule jointure, simples à écrire et rapides.",
      ar: "يحمي التطبيع الأنظمة المعاملاتية من شذوذ التحديث، لكن التحليلات تقرأ في الغالب. والبُعد المسطّح يقايض بعض التخزين المكرر مقابل استعلامات بعملية ربط واحدة سهلة الكتابة وسريعة التنفيذ."
    }
  },
  {
    id: "de-dim-scd2-scenario",
    concept: "dimensional-modeling",
    difficulty: 3,
    q: {
      en: "A customer moves from Lyon to Casablanca. Revenue reports must still attribute her past purchases to Lyon and new ones to Casablanca. How should the customer dimension handle the change?",
      fr: "Une cliente déménage de Lyon à Casablanca. Les rapports de revenus doivent toujours attribuer ses achats passés à Lyon et les nouveaux à Casablanca. Comment la dimension client doit-elle gérer ce changement ?",
      ar: "انتقلت عميلة من ليون إلى الدار البيضاء. يجب أن تنسب تقارير الإيرادات مشترياتها السابقة إلى ليون والجديدة إلى الدار البيضاء. كيف يجب أن يتعامل بُعد العملاء مع هذا التغيير؟"
    },
    options: {
      en: [
        "SCD Type 2: close the old row and insert a new version with validity dates",
        "SCD Type 1: overwrite the city in place",
        "Delete the customer and create a new customer ID with no link to the old one",
        "Store the city in the fact table only"
      ],
      fr: [
        "SCD de type 2 : clore l'ancienne ligne et insérer une nouvelle version avec des dates de validité",
        "SCD de type 1 : écraser la ville sur place",
        "Supprimer la cliente et créer un nouvel identifiant sans lien avec l'ancien",
        "Stocker la ville uniquement dans la table de faits"
      ],
      ar: [
        "SCD من النوع 2: أغلق الصف القديم وأدرج نسخة جديدة بتواريخ صلاحية",
        "SCD من النوع 1: استبدل المدينة في مكانها",
        "احذف العميلة وأنشئ معرّفًا جديدًا لا صلة له بالقديم",
        "خزّن المدينة في جدول الحقائق فقط"
      ]
    },
    answer: 0,
    explain: {
      en: "Type 2 keeps history: each version has valid_from/valid_to dates and its own surrogate key, and facts join to the version active when they happened. Type 1 would rewrite history and move all past revenue to Casablanca.",
      fr: "Le type 2 conserve l'historique : chaque version a des dates valid_from/valid_to et sa propre clé de substitution, et les faits se joignent à la version active au moment où ils ont eu lieu. Le type 1 réécrirait l'historique et déplacerait tout le revenu passé vers Casablanca.",
      ar: "يحتفظ النوع 2 بالتاريخ: لكل نسخة تاريخا valid_from/valid_to ومفتاح بديل خاص، وتُربط الحقائق بالنسخة السارية وقت حدوثها. أما النوع 1 فسيعيد كتابة التاريخ وينقل كل الإيرادات السابقة إلى الدار البيضاء."
    }
  },
  // ── lakehouse-architecture ──
  {
    id: "de-lakehouse-definition",
    concept: "lakehouse-architecture",
    difficulty: 1,
    q: {
      en: "What does a lakehouse combine?",
      fr: "Que combine un lakehouse ?",
      ar: "ما الذي تجمعه معمارية lakehouse؟"
    },
    options: {
      en: [
        "The cheap, open file storage of a data lake with the ACID transactions and schema enforcement of a warehouse",
        "An OLTP database with a message queue",
        "A feature store with a model registry",
        "A spreadsheet with a BI dashboard"
      ],
      fr: [
        "Le stockage de fichiers ouvert et bon marché d'un data lake avec les transactions ACID et l'application de schéma d'un entrepôt",
        "Une base OLTP avec une file de messages",
        "Un feature store avec un registre de modèles",
        "Un tableur avec un tableau de bord BI"
      ],
      ar: [
        "التخزين الملفي المفتوح والرخيص لبحيرة البيانات مع معاملات ACID وفرض المخطط في المستودع",
        "قاعدة بيانات OLTP مع طابور رسائل",
        "مخزن ميزات مع سجل نماذج",
        "جدول بيانات مع لوحة ذكاء أعمال"
      ]
    },
    answer: 0,
    explain: {
      en: "Open table formats (Delta Lake, Apache Iceberg, Hudi) add a transaction log on top of Parquet files in object storage. BI analysts and data scientists can then query the same single copy of the data.",
      fr: "Les formats de table ouverts (Delta Lake, Apache Iceberg, Hudi) ajoutent un journal de transactions au-dessus de fichiers Parquet en stockage objet. Analystes BI et data scientists peuvent alors interroger la même copie unique des données.",
      ar: "تضيف صيغ الجداول المفتوحة (Delta Lake و Apache Iceberg و Hudi) سجل معاملات فوق ملفات Parquet في التخزين الكائني. فيستطيع محللو ذكاء الأعمال وعلماء البيانات الاستعلام عن النسخة الواحدة نفسها من البيانات."
    }
  },
  {
    id: "de-lakehouse-table-format",
    concept: "lakehouse-architecture",
    difficulty: 1,
    q: {
      en: "What does a table format such as Delta Lake or Iceberg add on top of plain Parquet files?",
      fr: "Qu'apporte un format de table comme Delta Lake ou Iceberg par rapport à de simples fichiers Parquet ?",
      ar: "ماذا تضيف صيغة جداول مثل Delta Lake أو Iceberg فوق ملفات Parquet العادية؟"
    },
    options: {
      en: [
        "A transaction log enabling atomic writes, MERGE/UPDATE/DELETE, schema enforcement and time travel",
        "A faster compression codec that replaces Parquet",
        "A built-in BI dashboard",
        "Automatic conversion of tables to CSV for analysts"
      ],
      fr: [
        "Un journal de transactions permettant écritures atomiques, MERGE/UPDATE/DELETE, contrôle du schéma et voyage dans le temps",
        "Un codec de compression plus rapide qui remplace Parquet",
        "Un tableau de bord BI intégré",
        "La conversion automatique des tables en CSV pour les analystes"
      ],
      ar: [
        "سجل معاملات يتيح الكتابة الذرّية و MERGE/UPDATE/DELETE وفرض المخطط والسفر عبر الزمن (time travel)",
        "خوارزمية ضغط أسرع تحل محل Parquet",
        "لوحة ذكاء أعمال مدمجة",
        "تحويل الجداول تلقائيًا إلى CSV للمحللين"
      ]
    },
    answer: 0,
    explain: {
      en: "Without a log, a crashed job can leave half-written files that readers see, and updating one row means rewriting files by hand. The log records which files make up each table version, so readers always see a consistent snapshot.",
      fr: "Sans journal, un job planté peut laisser des fichiers à moitié écrits visibles par les lecteurs, et modifier une ligne implique de réécrire des fichiers à la main. Le journal enregistre quels fichiers composent chaque version de la table : les lecteurs voient toujours un instantané cohérent.",
      ar: "بدون سجل، قد تترك مهمة متعطلة ملفات مكتوبة جزئيًا يراها القرّاء، ويعني تحديث صف واحد إعادة كتابة الملفات يدويًا. أما السجل فيدوّن الملفات المكوّنة لكل نسخة من الجدول، فيرى القرّاء دائمًا لقطة متسقة."
    }
  },
  {
    id: "de-lakehouse-overkill",
    concept: "lakehouse-architecture",
    difficulty: 2,
    q: {
      en: "A five-person startup has 300 MB of data in PostgreSQL and a few dashboards. The CTO asks whether to build a Delta Lake lakehouse with Spark. What is the best advice?",
      fr: "Une startup de cinq personnes a 300 Mo de données dans PostgreSQL et quelques tableaux de bord. Le CTO demande s'il faut construire un lakehouse Delta Lake avec Spark. Quel est le meilleur conseil ?",
      ar: "لدى شركة ناشئة من خمسة أشخاص 300 MB من البيانات في PostgreSQL وبعض اللوحات. يسأل المدير التقني هل يبني lakehouse بـ Delta Lake و Spark. ما أفضل نصيحة؟"
    },
    options: {
      en: [
        "Yes, every company needs a lakehouse from day one",
        "Not yet: a read replica or a small warehouse/DuckDB covers this; revisit when data and use cases grow",
        "Yes, but also add Kafka streaming for all tables",
        "Move the application backend itself onto the lakehouse"
      ],
      fr: [
        "Oui, toute entreprise a besoin d'un lakehouse dès le premier jour",
        "Pas encore : une réplique en lecture ou un petit entrepôt/DuckDB suffit ; y revenir quand les données et les usages grandiront",
        "Oui, en ajoutant aussi du streaming Kafka pour toutes les tables",
        "Déplacer le backend de l'application lui-même sur le lakehouse"
      ],
      ar: [
        "نعم، كل شركة تحتاج lakehouse من اليوم الأول",
        "ليس بعد: نسخة قراءة متماثلة أو مستودع صغير/DuckDB يكفي؛ وأعد النظر حين تكبر البيانات وحالات الاستخدام",
        "نعم، مع إضافة بث Kafka لكل الجداول أيضًا",
        "انقل الواجهة الخلفية للتطبيق نفسها إلى الـ lakehouse"
      ]
    },
    answer: 1,
    explain: {
      en: "A lakehouse pays off at scale, with many teams and mixed BI and ML workloads. For a few hundred megabytes, the extra infrastructure costs far more in time and money than it returns.",
      fr: "Un lakehouse est rentable à grande échelle, avec de nombreuses équipes et des usages mêlant BI et ML. Pour quelques centaines de mégaoctets, l'infrastructure supplémentaire coûte bien plus en temps et en argent qu'elle ne rapporte.",
      ar: "تؤتي الـ lakehouse ثمارها على نطاق واسع، مع فرق كثيرة وأحمال مختلطة بين ذكاء الأعمال والتعلم الآلي. أما لبضع مئات من الميغابايتات فالبنية الإضافية تكلّف من الوقت والمال أكثر بكثير مما تعطي."
    }
  },
  // ── oltp-vs-olap ──
  {
    id: "de-oltp-olap-identify",
    concept: "oltp-vs-olap",
    difficulty: 1,
    q: {
      en: "Which of these is a typical OLTP workload?",
      fr: "Lequel de ces cas est une charge de travail OLTP typique ?",
      ar: "أي مما يلي يمثّل عبء عمل OLTP نموذجيًا؟"
    },
    options: {
      en: [
        "Computing total revenue per region over the last five years",
        "Inserting one order and decrementing stock when a customer checks out",
        "Building a monthly churn report across all customers",
        "Aggregating a billion clickstream rows for a dashboard"
      ],
      fr: [
        "Calculer le chiffre d'affaires total par région sur les cinq dernières années",
        "Insérer une commande et décrémenter le stock quand un client valide son panier",
        "Construire un rapport mensuel d'attrition sur tous les clients",
        "Agréger un milliard de lignes de clickstream pour un tableau de bord"
      ],
      ar: [
        "حساب إجمالي الإيرادات لكل منطقة خلال السنوات الخمس الأخيرة",
        "إدراج طلب واحد وإنقاص المخزون عندما يُتمّ عميل عملية الشراء",
        "إعداد تقرير شهري عن تسرّب جميع العملاء",
        "تجميع مليار صف من تدفق النقرات للوحة معلومات"
      ]
    },
    answer: 1,
    explain: {
      en: "OLTP systems handle many small, concurrent reads and writes of individual rows with strong consistency. The other options scan and aggregate huge numbers of rows, which is OLAP's job.",
      fr: "Les systèmes OLTP gèrent de nombreuses petites lectures et écritures concurrentes de lignes individuelles, avec une forte cohérence. Les autres options parcourent et agrègent d'énormes volumes de lignes : c'est le rôle de l'OLAP.",
      ar: "تتعامل أنظمة OLTP مع قراءات وكتابات صغيرة ومتزامنة كثيرة لصفوف منفردة مع اتساق قوي. أما الخيارات الأخرى فتمسح عددًا هائلًا من الصفوف وتجمّعها، وهذه مهمة OLAP."
    }
  },
  {
    id: "de-olap-columnar",
    concept: "oltp-vs-olap",
    difficulty: 2,
    q: {
      en: "Why do OLAP engines such as BigQuery, Snowflake or ClickHouse store data by column?",
      fr: "Pourquoi les moteurs OLAP comme BigQuery, Snowflake ou ClickHouse stockent-ils les données par colonne ?",
      ar: "لماذا تخزّن محركات OLAP مثل BigQuery أو Snowflake أو ClickHouse البيانات حسب الأعمدة؟"
    },
    options: {
      en: [
        "Column storage makes single-row inserts faster",
        "Columns are required for foreign keys",
        "It allows each row to have a different schema",
        "Analytical queries read a few columns over many rows, so reading only those columns, well compressed, is much faster"
      ],
      fr: [
        "Le stockage en colonnes accélère les insertions ligne par ligne",
        "Les colonnes sont nécessaires aux clés étrangères",
        "Il permet à chaque ligne d'avoir un schéma différent",
        "Les requêtes analytiques lisent quelques colonnes sur beaucoup de lignes : ne lire que ces colonnes, bien compressées, est bien plus rapide"
      ],
      ar: [
        "التخزين العمودي يسرّع إدراج الصفوف المنفردة",
        "الأعمدة ضرورية للمفاتيح الأجنبية",
        "يتيح لكل صف أن يكون له مخطط مختلف",
        "تقرأ الاستعلامات التحليلية أعمدة قليلة على صفوف كثيرة، فقراءة تلك الأعمدة وحدها مضغوطة جيدًا أسرع بكثير"
      ]
    },
    answer: 3,
    explain: {
      en: "SUM(amount) GROUP BY region touches two columns out of perhaps fifty. Columnar layout skips the rest, and similar values stored together compress very well, reducing I/O even further.",
      fr: "SUM(amount) GROUP BY region touche deux colonnes sur peut-être cinquante. Le stockage en colonnes ignore les autres, et des valeurs similaires rangées ensemble se compressent très bien, ce qui réduit encore les E/S.",
      ar: "الاستعلام SUM(amount) GROUP BY region يمسّ عمودين من بين خمسين ربما. والتخطيط العمودي يتخطى البقية، والقيم المتشابهة المخزّنة معًا تنضغط جيدًا جدًا، فتقل عمليات الإدخال والإخراج أكثر."
    }
  },
  {
    id: "de-oltp-heavy-analytics",
    concept: "oltp-vs-olap",
    difficulty: 3,
    q: {
      en: "An hourly report runs a large GROUP BY over 200 million rows directly on the production PostgreSQL database, and checkout becomes slow while it runs. What is the right fix?",
      fr: "Un rapport horaire exécute un gros GROUP BY sur 200 millions de lignes directement sur la base PostgreSQL de production, et le paiement en ligne ralentit pendant ce temps. Quelle est la bonne correction ?",
      ar: "يشغّل تقرير كل ساعة استعلام GROUP BY ضخمًا على 200 مليون صف مباشرة على قاعدة PostgreSQL الإنتاجية، فيتباطأ إتمام الشراء أثناء تشغيله. ما الإصلاح الصحيح؟"
    },
    options: {
      en: [
        "Run the report more often so each run is smaller",
        "Add more columns to the orders table",
        "Replicate the data (e.g. with CDC or ELT) into an OLAP warehouse and run the report there",
        "Move the checkout application onto the data warehouse"
      ],
      fr: [
        "Exécuter le rapport plus souvent pour que chaque exécution soit plus petite",
        "Ajouter des colonnes à la table des commandes",
        "Répliquer les données (par ex. par CDC ou ELT) dans un entrepôt OLAP et y exécuter le rapport",
        "Déplacer l'application de paiement sur l'entrepôt de données"
      ],
      ar: [
        "شغّل التقرير بوتيرة أعلى حتى تصغر كل دورة",
        "أضف أعمدة إلى جدول الطلبات",
        "انسخ البيانات (عبر CDC أو ELT مثلًا) إلى مستودع OLAP وشغّل التقرير هناك",
        "انقل تطبيق إتمام الشراء إلى مستودع البيانات"
      ]
    },
    answer: 2,
    explain: {
      en: "Big scans compete with the application for CPU, memory and locks on the OLTP system. Separating workloads keeps transactions fast and gives analytics an engine built for scans; a warehouse would in turn be a poor backend for checkout.",
      fr: "Les gros parcours concurrencent l'application pour le CPU, la mémoire et les verrous du système OLTP. Séparer les charges garde les transactions rapides et donne à l'analytique un moteur conçu pour les parcours ; un entrepôt serait à l'inverse un mauvais backend pour le paiement.",
      ar: "المسح الضخم ينافس التطبيق على المعالج والذاكرة والأقفال في نظام OLTP. وفصل الأحمال يُبقي المعاملات سريعة ويمنح التحليلات محركًا مصممًا للمسح؛ وفي المقابل يكون المستودع واجهة خلفية سيئة لإتمام الشراء."
    }
  },
  // ── parquet-format ──
  {
    id: "de-parquet-vs-csv",
    concept: "parquet-format",
    difficulty: 1,
    q: {
      en: "You need 3 columns out of 200 from a 50 GB dataset. Why is Parquet much faster than CSV for this?",
      fr: "Vous avez besoin de 3 colonnes sur 200 d'un jeu de données de 50 Go. Pourquoi Parquet est-il bien plus rapide que CSV pour cela ?",
      ar: "تحتاج 3 أعمدة من أصل 200 من مجموعة بيانات حجمها 50 GB. لماذا يكون Parquet أسرع بكثير من CSV لهذا الغرض؟"
    },
    options: {
      en: [
        "Parquet files are always stored in RAM",
        "CSV cannot store more than 100 columns",
        "Parquet is columnar, so only those 3 columns are read from disk; CSV must parse every full row",
        "Parquet skips rows that contain null values"
      ],
      fr: [
        "Les fichiers Parquet sont toujours stockés en RAM",
        "CSV ne peut pas stocker plus de 100 colonnes",
        "Parquet est colonnaire : seules ces 3 colonnes sont lues sur le disque, alors que CSV oblige à analyser chaque ligne complète",
        "Parquet ignore les lignes contenant des valeurs nulles"
      ],
      ar: [
        "ملفات Parquet مخزّنة دائمًا في الذاكرة RAM",
        "لا يستطيع CSV تخزين أكثر من 100 عمود",
        "Parquet عمودي، فلا تُقرأ من القرص إلا تلك الأعمدة الثلاثة، بينما يتطلب CSV تحليل كل صف كاملًا",
        "يتخطى Parquet الصفوف التي تحتوي قيمًا فارغة"
      ]
    },
    answer: 2,
    explain: {
      en: "Parquet stores each column's values contiguously with type-aware compression, so a reader fetches just the columns it needs. CSV is row-oriented text with no types, so everything must be read and parsed.",
      fr: "Parquet stocke les valeurs de chaque colonne de façon contiguë avec une compression adaptée au type : un lecteur ne récupère que les colonnes nécessaires. CSV est un texte orienté lignes sans types, qu'il faut lire et analyser en entier.",
      ar: "يخزّن Parquet قيم كل عمود متجاورةً مع ضغط يراعي النوع، فيجلب القارئ الأعمدة التي يحتاجها فقط. أما CSV فنص موجّه بالصفوف بلا أنواع، فيجب قراءته وتحليله كله."
    }
  },
  {
    id: "de-parquet-row-group-stats",
    concept: "parquet-format",
    difficulty: 2,
    q: {
      en: "How do the min/max statistics stored in Parquet row groups speed up a query like WHERE amount > 10000?",
      fr: "Comment les statistiques min/max stockées dans les row groups de Parquet accélèrent-elles une requête comme WHERE amount > 10000 ?",
      ar: "كيف تسرّع إحصاءات القيمة الدنيا/العليا المخزّنة في مجموعات الصفوف (row groups) في Parquet استعلامًا مثل WHERE amount > 10000؟"
    },
    options: {
      en: [
        "They sort the whole file by amount before reading",
        "They build a hash index on every column automatically",
        "They cache the query result for next time",
        "The engine skips any row group whose max amount is 10000 or less without reading it (predicate pushdown)"
      ],
      fr: [
        "Elles trient tout le fichier par amount avant la lecture",
        "Elles construisent automatiquement un index de hachage sur chaque colonne",
        "Elles mettent en cache le résultat de la requête pour la prochaine fois",
        "Le moteur ignore sans le lire tout row group dont le max de amount est inférieur ou égal à 10000 (predicate pushdown)"
      ],
      ar: [
        "ترتّب الملف كله حسب amount قبل القراءة",
        "تبني تلقائيًا فهرس تجزئة على كل عمود",
        "تخزّن نتيجة الاستعلام مؤقتًا للمرة القادمة",
        "يتخطى المحرك دون قراءة أي مجموعة صفوف قيمتها العليا لـ amount تساوي 10000 أو أقل (دفع الشرط إلى المصدر - predicate pushdown)"
      ]
    },
    answer: 3,
    explain: {
      en: "Each row group's footer records the min and max of every column. If the range cannot satisfy the filter, the whole chunk is skipped; sorting or clustering data by common filter columns makes this skipping far more effective.",
      fr: "Le pied de chaque row group enregistre le min et le max de chaque colonne. Si la plage ne peut pas satisfaire le filtre, tout le bloc est ignoré ; trier ou regrouper les données selon les colonnes souvent filtrées rend ce saut bien plus efficace.",
      ar: "يسجّل تذييل كل مجموعة صفوف القيمة الدنيا والعليا لكل عمود. فإذا كان النطاق لا يمكن أن يحقق المرشّح تُتخطّى الكتلة كلها؛ وترتيب البيانات أو تجميعها حسب الأعمدة الشائعة في المرشّحات يجعل هذا التخطي أكثر فاعلية بكثير."
    }
  },
  {
    id: "de-parquet-row-updates",
    concept: "parquet-format",
    difficulty: 2,
    q: {
      en: "An app updates individual user balances thousands of times per second. A colleague suggests storing balances in Parquet files on S3. What do you say?",
      fr: "Une application met à jour des soldes d'utilisateurs individuels des milliers de fois par seconde. Un collègue suggère de stocker les soldes dans des fichiers Parquet sur S3. Que répondez-vous ?",
      ar: "تطبيق يحدّث أرصدة المستخدمين منفردةً آلاف المرات في الثانية. يقترح زميل تخزين الأرصدة في ملفات Parquet على S3. بماذا ترد؟"
    },
    options: {
      en: [
        "Good idea, Parquet's compression makes updates fast",
        "Use an OLTP database such as PostgreSQL; Parquet files are immutable and built for large analytical scans",
        "Good idea, as long as each update writes a new CSV file too",
        "Use Parquet but partition it by user_id"
      ],
      fr: [
        "Bonne idée, la compression de Parquet rend les mises à jour rapides",
        "Utiliser une base OLTP comme PostgreSQL ; les fichiers Parquet sont immuables et conçus pour de grands parcours analytiques",
        "Bonne idée, à condition que chaque mise à jour écrive aussi un fichier CSV",
        "Utiliser Parquet mais le partitionner par user_id"
      ],
      ar: [
        "فكرة جيدة، فضغط Parquet يجعل التحديثات سريعة",
        "استخدم قاعدة بيانات OLTP مثل PostgreSQL؛ فملفات Parquet غير قابلة للتعديل ومصممة للمسح التحليلي الواسع",
        "فكرة جيدة، بشرط أن يكتب كل تحديث ملف CSV أيضًا",
        "استخدم Parquet مع تقسيمه حسب user_id"
      ]
    },
    answer: 1,
    explain: {
      en: "Changing one value in a Parquet file means rewriting the file, which is hopeless at thousands of updates per second. Frequent single-row writes belong in an OLTP database; Parquet is for analytics over the resulting history.",
      fr: "Modifier une valeur dans un fichier Parquet implique de réécrire le fichier, ce qui est intenable à des milliers de mises à jour par seconde. Les écritures fréquentes ligne par ligne relèvent d'une base OLTP ; Parquet sert à l'analytique sur l'historique qui en résulte.",
      ar: "تغيير قيمة واحدة في ملف Parquet يعني إعادة كتابة الملف، وهذا مستحيل عمليًا بآلاف التحديثات في الثانية. الكتابات المتكررة لصفوف منفردة مكانها قاعدة OLTP، أما Parquet فللتحليلات على السجل التاريخي الناتج."
    }
  },
  // ── warehouse-vs-lake ──
  {
    id: "de-warehouse-lake-schema",
    concept: "warehouse-vs-lake",
    difficulty: 1,
    q: {
      en: "Which pairing correctly describes how a data warehouse and a data lake handle schemas?",
      fr: "Quelle association décrit correctement la gestion des schémas par un entrepôt de données et un data lake ?",
      ar: "أي اقتران يصف بشكل صحيح تعامل مستودع البيانات وبحيرة البيانات مع المخططات؟"
    },
    options: {
      en: [
        "Warehouse: schema-on-read; lake: schema-on-write",
        "Warehouse: schema-on-write; lake: schema-on-read",
        "Both enforce schema-on-write",
        "Neither has any notion of schema"
      ],
      fr: [
        "Entrepôt : schéma à la lecture ; lake : schéma à l'écriture",
        "Entrepôt : schéma à l'écriture ; lake : schéma à la lecture",
        "Les deux imposent le schéma à l'écriture",
        "Aucun des deux n'a de notion de schéma"
      ],
      ar: [
        "المستودع: المخطط عند القراءة؛ البحيرة: المخطط عند الكتابة",
        "المستودع: المخطط عند الكتابة؛ البحيرة: المخطط عند القراءة",
        "كلاهما يفرض المخطط عند الكتابة",
        "لا يملك أي منهما مفهوم المخطط"
      ]
    },
    answer: 1,
    explain: {
      en: "A warehouse validates and structures data as it is loaded, which gives governed, reliable tables. A lake stores raw files of any shape and applies structure only when someone reads them, which is flexible but easier to misuse.",
      fr: "Un entrepôt valide et structure les données au chargement, ce qui donne des tables gouvernées et fiables. Un lake stocke des fichiers bruts de toute forme et n'applique une structure qu'à la lecture : c'est flexible mais plus facile à mal utiliser.",
      ar: "يتحقق المستودع من البيانات ويهيكلها عند تحميلها، فيعطي جداول محكومة وموثوقة. أما البحيرة فتخزّن ملفات خامًا بأي شكل ولا تطبّق البنية إلا عند القراءة، وهذا مرن لكنه أسهل في سوء الاستخدام."
    }
  },
  {
    id: "de-warehouse-lake-swamp",
    concept: "warehouse-vs-lake",
    difficulty: 2,
    q: {
      en: "What typically turns a data lake into a 'data swamp'?",
      fr: "Qu'est-ce qui transforme généralement un data lake en « marécage de données » (data swamp) ?",
      ar: "ما الذي يحوّل عادةً بحيرة البيانات إلى «مستنقع بيانات» (data swamp)؟"
    },
    options: {
      en: [
        "Storing data in Parquet instead of CSV",
        "Using object storage such as S3",
        "Partitioning tables by date",
        "Dumping files with no catalog, ownership, documentation or quality checks, so nobody can find or trust them"
      ],
      fr: [
        "Stocker les données en Parquet plutôt qu'en CSV",
        "Utiliser un stockage objet comme S3",
        "Partitionner les tables par date",
        "Y déverser des fichiers sans catalogue, propriétaire, documentation ni contrôle qualité, si bien que personne ne peut les trouver ni leur faire confiance"
      ],
      ar: [
        "تخزين البيانات بصيغة Parquet بدل CSV",
        "استخدام تخزين كائني مثل S3",
        "تقسيم الجداول حسب التاريخ",
        "إلقاء الملفات دون فهرس أو مالك أو توثيق أو فحوص جودة، فلا يستطيع أحد إيجادها أو الوثوق بها"
      ]
    },
    answer: 3,
    explain: {
      en: "Cheap storage makes it tempting to keep everything without structure. Without metadata and governance, the same dataset is copied many times, its meaning is lost and the lake stops being useful.",
      fr: "Un stockage bon marché pousse à tout garder sans structure. Sans métadonnées ni gouvernance, un même jeu de données est copié de nombreuses fois, son sens se perd et le lake cesse d'être utile.",
      ar: "التخزين الرخيص يغري بالاحتفاظ بكل شيء دون بنية. ودون بيانات وصفية وحوكمة تُنسخ مجموعة البيانات نفسها مرات كثيرة ويضيع معناها، فتفقد البحيرة فائدتها."
    }
  },
  {
    id: "de-warehouse-lake-choose",
    concept: "warehouse-vs-lake",
    difficulty: 3,
    q: {
      en: "You must keep 80 TB of raw product images and JSON event logs cheaply for future model training. Where should they go?",
      fr: "Vous devez conserver à moindre coût 80 To d'images de produits brutes et de journaux d'événements JSON pour de futurs entraînements de modèles. Où les mettre ?",
      ar: "عليك الاحتفاظ بـ 80 TB من صور المنتجات الخام وسجلات أحداث JSON بتكلفة منخفضة لتدريب النماذج مستقبلًا. أين تضعها؟"
    },
    options: {
      en: [
        "A cloud data warehouse, loading each image as a table row",
        "A data lake on object storage (S3, GCS or ADLS), with a catalog",
        "The production OLTP database",
        "A Kafka topic with infinite retention as the only copy"
      ],
      fr: [
        "Un entrepôt de données cloud, en chargeant chaque image comme une ligne de table",
        "Un data lake sur stockage objet (S3, GCS ou ADLS), avec un catalogue",
        "La base OLTP de production",
        "Un topic Kafka à rétention infinie comme unique copie"
      ],
      ar: [
        "مستودع بيانات سحابي مع تحميل كل صورة كصف في جدول",
        "بحيرة بيانات على تخزين كائني (S3 أو GCS أو ADLS) مع فهرس",
        "قاعدة بيانات OLTP الإنتاجية",
        "موضوع Kafka بمدة احتفاظ لا نهائية كنسخة وحيدة"
      ]
    },
    answer: 1,
    explain: {
      en: "Object storage is the cheapest place for huge volumes of unstructured and semi-structured files, and training frameworks read from it directly. Warehouses charge more per TB and are built for structured SQL tables.",
      fr: "Le stockage objet est l'endroit le moins cher pour d'énormes volumes de fichiers non structurés et semi-structurés, et les frameworks d'entraînement le lisent directement. Les entrepôts coûtent plus cher au To et sont conçus pour des tables SQL structurées.",
      ar: "التخزين الكائني هو الأرخص للأحجام الهائلة من الملفات غير المهيكلة وشبه المهيكلة، وأُطر التدريب تقرأ منه مباشرة. أما المستودعات فتكلفتها لكل تيرابايت أعلى، وهي مصممة لجداول SQL المهيكلة."
    }
  }
];
