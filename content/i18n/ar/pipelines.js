/**
 * Arabic translation of content/pipelines.js, keyed by pipeline id.
 * `source` must keep every Mermaid node id, arrow and link of the English source;
 * only the quoted labels are translated (checked by tools/validate.js).
 */
export default {
  'ml-lifecycle': {
    title: 'دورة حياة التعلم الآلي',
    description: 'من سؤال عمل إلى نموذج مراقَب في بيئة الإنتاج، ثم العودة من جديد عندما تنجرف البيانات.',
    source: `flowchart TB
  subgraph data["1 · البيانات"]
    direction LR
    P(["مشكلة العمل"]) --> D["جمع البيانات واستيعابها"]
    D --> Q["التحقق من جودة البيانات"]
    Q --> F["هندسة الميزات"]
  end
  subgraph model["2 · النمذجة"]
    direction LR
    S["تقسيم تدريب / تحقق / اختبار"] --> T["تدريب النماذج وضبطها"]
    T --> E["التقييم على بيانات محجوزة"]
    E --> R["تسجيل أفضل نموذج"]
    T -.-> X["تسجيل التجارب: تتبع التجارب"]
  end
  subgraph prod["3 · الإنتاج"]
    direction LR
    C["خط CI/CD"] --> Dp["النشر والخدمة"]
    Dp --> AB["طرح A/B أو تدريجي (canary)"]
    AB --> M["مراقبة الانجراف والأداء"]
    M -.->|"اكتُشف انجراف"| RT(["إعادة التدريب: العودة إلى 2 · النمذجة"])
  end
  data --> model
  model --> prod`
  },
  'data-platform': {
    title: 'منصة بيانات حديثة',
    description: 'كيف تتحول الأحداث الخام وتغييرات قواعد البيانات إلى جداول نظيفة للوحات المعلومات وميزات للنماذج.',
    source: `flowchart TB
  subgraph src["المصادر"]
    direction LR
    OLTP[("قاعدة بيانات التطبيق: OLTP")]
    EV["أحداث النقر والتصفح"]
    FILES["ملفات وواجهات API"]
  end
  OLTP --> CD["التقاط تغييرات البيانات (CDC)"]
  CD --> K["مواضيع Kafka"]
  EV --> K
  K --> SS["معالجة التدفقات"]
  subgraph lh["Lakehouse"]
    direction LR
    RAW["Bronze: ملفات Parquet خام"] --> SIL["Silver: منظّفة وموحّدة"]
    SIL --> GOLD["Gold: مخطط نجمي"]
  end
  FILES -->|"استيعاب على دفعات"| RAW
  SS --> RAW
  PT["التقسيم وتنظيم الملفات"] -.-> RAW
  SP["مهام Spark"] -.-> SIL
  DQ["فحوص جودة البيانات"] -.-> SIL
  DBT["نماذج dbt"] -.-> GOLD
  AF["تنسيق Airflow"] -.-> SP
  AF -.-> DBT
  GOLD --> BI["لوحات BI: OLAP"]
  GOLD --> FS["مخزن الميزات (feature store)"]
  FS --> ML["تدريب النماذج وخدمتها"]`
  },
  preprocessing: {
    title: 'معالجة مسبقة دون تسرّب',
    description: 'قسّم البيانات أولًا، ثم درّب كل محوّل على مجموعة التدريب فقط. هذا الترتيب هو ما يمنع تسرّب البيانات (data leakage).',
    source: `flowchart TB
  RAW["جدول خام"] --> SPLIT{"التقسيم أولًا"}
  SPLIT -->|"تدريب"| IMP["تعويض القيم المفقودة"]
  IMP --> ENC["ترميز المتغيرات الفئوية"]
  ENC --> SCL["تحجيم الميزات العددية"]
  SCL --> SEL["اختيار الميزات"]
  SEL --> BAL["إعادة موازنة الفئات: التدريب فقط"]
  BAL --> MOD["تدريب النموذج مع التحقق المتقاطع"]
  SPLIT -->|"اختبار: محفوظ جانبًا"| TEST["التقييم النهائي"]
  MOD -->|"تطبيق التحويلات المدرَّبة"| TEST`
  },
  'training-loop': {
    title: 'حلقة تدريب الشبكة العصبية',
    description: 'ما يحدث مع كل دفعة صغيرة بينما تتعلم الشبكة العميقة، ومتى تتوقف.',
    source: `flowchart TB
  X["دفعة صغيرة من المدخلات"] --> FW["الانتشار الأمامي: مجاميع موزونة"]
  FW --> A["دوال التنشيط"]
  A --> L["حساب الخسارة مقارنة بالعناوين"]
  L --> BP["الانتشار العكسي: التدرجات"]
  BP --> O["خطوة المُحسِّن: SGD / Adam"]
  R["Dropout وBatchNorm وتضاؤل الأوزان"] -.-> FW
  O -->|"الدفعة التالية"| X
  O --> V{"هل ما زالت خسارة التحقق تنخفض؟"}
  V -->|"لا: إيقاف مبكر"| STOP(["الاحتفاظ بأفضل نقطة حفظ"])`
  }
};
