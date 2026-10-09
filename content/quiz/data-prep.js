/** Quiz questions: data-prep. See index.js for the question format. */
/** @type {import('./index.js').Question[]} */
export default [
  // ── feature-scaling ───────────────────────────────────────
  {
    id: "prep-scaling-standard-scaler",
    concept: "feature-scaling",
    difficulty: 1,
    q: {
      en: "What does StandardScaler do to each numerical feature?",
      fr: "Que fait StandardScaler à chaque variable numérique ?",
      ar: "ماذا يفعل StandardScaler بكل ميزة رقمية؟"
    },
    options: {
      en: ["Maps it into the range [0, 1]", "Centers it on mean 0 and scales it to standard deviation 1", "Replaces it with its rank", "Divides it by its maximum value"],
      fr: ["La ramène dans l’intervalle [0, 1]", "La centre sur une moyenne de 0 et la réduit à un écart-type de 1", "La remplace par son rang", "La divise par sa valeur maximale"],
      ar: ["يحصرها في المجال [0, 1]", "يمركزها حول متوسط 0 ويجعل انحرافها المعياري 1", "يستبدلها برتبتها", "يقسمها على قيمتها القصوى"]
    },
    answer: 1,
    explain: {
      en: "StandardScaler applies the z-score z = (x − μ) / σ, using the mean and standard deviation learned on the training data. Mapping into [0, 1] is what MinMaxScaler does.",
      fr: "StandardScaler applique le z-score z = (x − μ) / σ, avec la moyenne et l’écart-type appris sur les données d’entraînement. Ramener dans [0, 1], c’est le rôle de MinMaxScaler.",
      ar: "يطبّق StandardScaler الدرجة المعيارية z = (x − μ) / σ باستخدام المتوسط والانحراف المعياري المتعلَّمين من بيانات التدريب. أما الحصر في [0, 1] فهو عمل MinMaxScaler."
    }
  },
  {
    id: "prep-scaling-trees-dont-need-it",
    concept: "feature-scaling",
    difficulty: 1,
    q: {
      en: "Which model does NOT need feature scaling?",
      fr: "Quel modèle n’a PAS besoin de mise à l’échelle des variables ?",
      ar: "أيّ نموذج لا يحتاج إلى توحيد مقاييس الميزات (feature scaling)؟"
    },
    options: {
      en: ["k-Nearest Neighbors", "Support Vector Machine", "Random Forest", "Logistic regression trained with gradient descent"],
      fr: ["k plus proches voisins (k-NN)", "Machine à vecteurs de support (SVM)", "Forêt aléatoire", "Régression logistique entraînée par descente de gradient"],
      ar: ["أقرب k جيران (k-NN)", "آلة متجهات الدعم (SVM)", "الغابة العشوائية (Random Forest)", "الانحدار اللوجستي المدرَّب بالانحدار التدرّجي"]
    },
    answer: 2,
    explain: {
      en: "Trees split on thresholds of one feature at a time, so any monotonic rescaling leaves the splits unchanged. Distance-based models and gradient-trained models, by contrast, are strongly affected by feature magnitudes.",
      fr: "Les arbres coupent sur des seuils d’une seule variable à la fois : toute transformation monotone laisse les coupures inchangées. Les modèles à distance et ceux entraînés par gradient sont, eux, très sensibles à l’ordre de grandeur des variables.",
      ar: "تقسم الأشجار البيانات وفق عتبات على ميزة واحدة في كل مرة، فلا يغيّر أيّ تحويل رتيب للمقياس هذه التقسيمات. أما النماذج القائمة على المسافة أو المدرَّبة بالتدرّج فتتأثر كثيرًا بأحجام الميزات."
    }
  },
  {
    id: "prep-scaling-robust-outliers",
    concept: "feature-scaling",
    difficulty: 2,
    q: {
      en: "A feature has a few huge outliers that would distort the mean and standard deviation. Which scaler is the best fit?",
      fr: "Une variable contient quelques valeurs aberrantes énormes qui fausseraient la moyenne et l’écart-type. Quel scaler convient le mieux ?",
      ar: "تحتوي ميزة على بضع قيم شاذة ضخمة ستشوّه المتوسط والانحراف المعياري. أيّ أداة توحيد هي الأنسب؟"
    },
    options: {
      en: ["MinMaxScaler", "StandardScaler", "No scaler, just drop the column", "RobustScaler"],
      fr: ["MinMaxScaler", "StandardScaler", "Aucun scaler, il suffit de supprimer la colonne", "RobustScaler"],
      ar: ["MinMaxScaler", "StandardScaler", "لا أداة توحيد، يكفي حذف العمود", "RobustScaler"]
    },
    answer: 3,
    explain: {
      en: "RobustScaler centers on the median and divides by the interquartile range, statistics that outliers barely move. MinMaxScaler is the worst choice here: one extreme value squeezes all other points into a tiny range.",
      fr: "RobustScaler centre sur la médiane et divise par l’écart interquartile, des statistiques que les valeurs aberrantes déplacent à peine. MinMaxScaler serait le pire choix : une seule valeur extrême écrase tous les autres points dans un intervalle minuscule.",
      ar: "يمركز RobustScaler حول الوسيط ويقسم على المدى الربيعي، وهي إحصاءات لا تكاد القيم الشاذة تحرّكها. أما MinMaxScaler فهو أسوأ خيار هنا: قيمة متطرفة واحدة تحشر كل النقاط الأخرى في مجال ضيّق جدًا."
    }
  },
  {
    id: "prep-scaling-fit-before-split-leak",
    concept: "feature-scaling",
    difficulty: 3,
    q: {
      en: "A notebook runs X_scaled = StandardScaler().fit_transform(X) and only then calls train_test_split(X_scaled, y). What is the problem?",
      fr: "Un notebook exécute X_scaled = StandardScaler().fit_transform(X), puis seulement train_test_split(X_scaled, y). Quel est le problème ?",
      ar: "يشغّل دفتر ملاحظات X_scaled = StandardScaler().fit_transform(X) ثم يستدعي بعدها train_test_split(X_scaled, y). ما المشكلة؟"
    },
    options: {
      en: ["The test rows influenced the mean and std used for scaling: data leakage", "StandardScaler cannot be used before a split", "The features are scaled twice", "Nothing; scaling never affects evaluation"],
      fr: ["Les lignes de test ont influencé la moyenne et l’écart-type du scaler : fuite de données", "StandardScaler ne peut pas être utilisé avant un découpage", "Les variables sont mises à l’échelle deux fois", "Rien ; la mise à l’échelle n’affecte jamais l’évaluation"],
      ar: ["أثّرت صفوف الاختبار في المتوسط والانحراف المعياري المستخدمين في التوحيد: تسرّب بيانات", "لا يمكن استخدام StandardScaler قبل التقسيم", "تُوحَّد مقاييس الميزات مرتين", "لا مشكلة؛ فالتوحيد لا يؤثر أبدًا في التقييم"]
    },
    answer: 0,
    explain: {
      en: "Fitting on all rows lets statistics of the test set leak into the training features, so the test score is no longer an honest estimate. Split first, then fit the scaler on the training set only, ideally inside a Pipeline.",
      fr: "Ajuster sur toutes les lignes fait fuiter des statistiques du test dans les variables d’entraînement : le score de test n’est plus une estimation honnête. Découpez d’abord, puis ajustez le scaler sur l’entraînement seul, idéalement dans un Pipeline.",
      ar: "الملاءمة على كل الصفوف تسرّب إحصاءات مجموعة الاختبار إلى ميزات التدريب، فلا تعود نتيجة الاختبار تقديرًا نزيهًا. قسّم أولًا ثم لائم أداة التوحيد على مجموعة التدريب وحدها، ويُفضَّل داخل Pipeline."
    }
  },

  // ── encoding-categorical ──────────────────────────────────
  {
    id: "prep-enc-ordinal-feature",
    concept: "encoding-categorical",
    difficulty: 1,
    q: {
      en: "A feature takes the values “low”, “medium” and “high”. Which encoding respects its natural order?",
      fr: "Une variable prend les valeurs « low », « medium » et « high ». Quel encodage respecte son ordre naturel ?",
      ar: "تأخذ ميزة القيم «low» و«medium» و«high». أيّ ترميز يحترم ترتيبها الطبيعي؟"
    },
    options: {
      en: ["One-hot encoding", "Target encoding", "OrdinalEncoder with an explicit order low < medium < high", "Hashing the strings"],
      fr: ["Encodage one-hot", "Encodage par la cible", "OrdinalEncoder avec un ordre explicite low < medium < high", "Hachage des chaînes"],
      ar: ["الترميز الأحادي (one-hot)", "الترميز بالهدف (target encoding)", "OrdinalEncoder مع ترتيب صريح low < medium < high", "تجزئة النصوص (hashing)"]
    },
    answer: 2,
    explain: {
      en: "For truly ordinal categories, mapping to 0, 1, 2 in the right order keeps useful information: medium really is between low and high. One-hot would throw that ordering away.",
      fr: "Pour des catégories réellement ordinales, les coder 0, 1, 2 dans le bon ordre conserve une information utile : medium est vraiment entre low et high. Le one-hot perdrait cet ordre.",
      ar: "في الفئات الترتيبية حقًا، يحفظ تحويلها إلى 0 و1 و2 بالترتيب الصحيح معلومة مفيدة: فـ medium تقع فعلًا بين low وhigh. أما الترميز الأحادي فيُضيّع هذا الترتيب."
    }
  },
  {
    id: "prep-enc-label-encoding-nominal",
    concept: "encoding-categorical",
    difficulty: 2,
    q: {
      en: "Colors are label-encoded as Red = 0, Blue = 1, Green = 2 and fed to a linear regression. What goes wrong?",
      fr: "Des couleurs sont codées Red = 0, Blue = 1, Green = 2 puis données à une régression linéaire. Qu’est-ce qui ne va pas ?",
      ar: "رُمّزت الألوان ترميزًا عدديًا Red = 0 وBlue = 1 وGreen = 2 ثم أُدخلت إلى انحدار خطي. ما الخطأ؟"
    },
    options: {
      en: ["Nothing; integers are the most compact encoding", "The model treats Blue as halfway between Red and Green, an order that does not exist", "Linear regression cannot accept integer features", "The encoding leaks the target"],
      fr: ["Rien ; les entiers sont l’encodage le plus compact", "Le modèle considère Blue comme à mi-chemin entre Red et Green, un ordre qui n’existe pas", "La régression linéaire n’accepte pas de variables entières", "L’encodage fait fuiter la cible"],
      ar: ["لا شيء؛ فالأعداد الصحيحة أكثر الترميزات إيجازًا", "يعامل النموذج Blue كأنه في منتصف المسافة بين Red وGreen، وهو ترتيب غير موجود", "لا يقبل الانحدار الخطي ميزات من أعداد صحيحة", "يسرّب الترميز الهدف"]
    },
    answer: 1,
    explain: {
      en: "A linear model multiplies the code by one weight, so it assumes Green has twice Blue’s effect relative to Red. For unordered (nominal) categories, one-hot encoding makes every category an independent, equidistant dimension.",
      fr: "Un modèle linéaire multiplie le code par un seul poids : il suppose que Green a deux fois l’effet de Blue par rapport à Red. Pour des catégories non ordonnées (nominales), le one-hot fait de chaque catégorie une dimension indépendante et équidistante.",
      ar: "يضرب النموذج الخطي الرمز في وزن واحد، فيفترض أن أثر Green ضعف أثر Blue مقارنةً بـ Red. أما في الفئات غير المرتبة (الاسمية) فيجعل الترميز الأحادي كل فئة بُعدًا مستقلًا ومتساوي البعد عن غيره."
    }
  },
  {
    id: "prep-enc-unknown-category",
    concept: "encoding-categorical",
    difficulty: 2,
    q: {
      en: "In production, a new country code appears that never occurred in the training data. How can a OneHotEncoder avoid crashing?",
      fr: "En production apparaît un code pays jamais vu à l’entraînement. Comment un OneHotEncoder peut-il éviter de planter ?",
      ar: "في بيئة الإنتاج ظهر رمز بلد لم يرد إطلاقًا في بيانات التدريب. كيف يتجنّب OneHotEncoder التعطّل؟"
    },
    options: {
      en: ["Refit the encoder on each incoming request", "Convert the country to an integer with LabelEncoder instead", "Drop every row whose country is unknown at training time", "Create it with handle_unknown=\"ignore\" so unseen values become all zeros"],
      fr: ["Réajuster l’encodeur à chaque requête entrante", "Convertir plutôt le pays en entier avec LabelEncoder", "Supprimer à l’entraînement toutes les lignes au pays inconnu", "Le créer avec handle_unknown=\"ignore\" pour qu’une valeur inconnue donne un vecteur de zéros"],
      ar: ["إعادة ملاءمة أداة الترميز مع كل طلب وارد", "تحويل البلد إلى عدد صحيح بـ LabelEncoder بدلًا من ذلك", "حذف كل صف بلده غير معروف أثناء التدريب", "إنشاؤه مع handle_unknown=\"ignore\" لتتحوّل القيم غير المرئية إلى أصفار كلها"]
    },
    answer: 3,
    explain: {
      en: "By default the encoder raises an error on unseen categories. With handle_unknown=\"ignore\" the new value simply gets no active column, so the model still predicts. Refitting per request would change the columns the model expects.",
      fr: "Par défaut, l’encodeur lève une erreur sur une catégorie inconnue. Avec handle_unknown=\"ignore\", la nouvelle valeur n’active aucune colonne et le modèle prédit quand même. Réajuster à chaque requête changerait les colonnes attendues par le modèle.",
      ar: "افتراضيًا، تُطلق أداة الترميز خطأً عند فئة غير مرئية. ومع handle_unknown=\"ignore\" لا تُفعَّل للقيمة الجديدة أيّ خانة، فيواصل النموذج التنبؤ. أما إعادة الملاءمة مع كل طلب فستغيّر الأعمدة التي يتوقعها النموذج."
    }
  },
  {
    id: "prep-enc-high-cardinality",
    concept: "encoding-categorical",
    difficulty: 3,
    q: {
      en: "A “city” column has 3,000 distinct values and you are training a gradient boosting model. Which encoding is the most sensible?",
      fr: "Une colonne « city » compte 3 000 valeurs distinctes et vous entraînez un modèle de gradient boosting. Quel encodage est le plus judicieux ?",
      ar: "يحتوي عمود «city» على 3,000 قيمة مختلفة، وأنت تدرّب نموذج تعزيز تدرّجي (gradient boosting). أيّ ترميز هو الأكثر منطقية؟"
    },
    options: {
      en: ["One-hot encoding into 3,000 columns", "Target encoding computed out-of-fold (cross-validated)", "Target encoding computed on the full dataset including the test set", "Dropping the column because it is categorical"],
      fr: ["Encodage one-hot en 3 000 colonnes", "Encodage par la cible calculé hors pli (validation croisée)", "Encodage par la cible calculé sur tout le jeu, test compris", "Supprimer la colonne parce qu’elle est catégorielle"],
      ar: ["ترميز أحادي في 3,000 عمود", "ترميز بالهدف يُحسب خارج الطيّة (بالتحقق المتقاطع)", "ترميز بالهدف يُحسب على كامل البيانات بما فيها الاختبار", "حذف العمود لأنه فئوي"]
    },
    answer: 1,
    explain: {
      en: "One-hot would explode into thousands of sparse columns. Target encoding replaces each city with its mean target, but it must be computed out-of-fold; computing it on the rows being predicted leaks their own labels into the feature.",
      fr: "Le one-hot exploserait en milliers de colonnes creuses. L’encodage par la cible remplace chaque ville par la moyenne de la cible, mais il doit être calculé hors pli : le calculer sur les lignes à prédire fait fuiter leurs propres étiquettes dans la variable.",
      ar: "سينفجر الترميز الأحادي إلى آلاف الأعمدة المتناثرة. أما الترميز بالهدف فيستبدل كل مدينة بمتوسط الهدف لديها، لكن يجب حسابه خارج الطيّة؛ فحسابه على الصفوف المراد التنبؤ بها يسرّب تسمياتها نفسها إلى الميزة."
    }
  },

  // ── feature-selection ─────────────────────────────────────
  {
    id: "prep-fs-method-families",
    concept: "feature-selection",
    difficulty: 1,
    q: {
      en: "Recursive Feature Elimination (RFE) repeatedly refits a model and drops the weakest features. Which family of selection methods is it?",
      fr: "L’élimination récursive de variables (RFE) réentraîne un modèle à plusieurs reprises et retire les variables les plus faibles. À quelle famille de méthodes appartient-elle ?",
      ar: "يعيد الحذف التكراري للميزات (RFE) ملاءمة نموذج مرارًا ويحذف أضعف الميزات. إلى أيّ عائلة من طرق الاختيار ينتمي؟"
    },
    options: {
      en: ["Filter method", "Embedded method", "Wrapper method", "Dimensionality extraction"],
      fr: ["Méthode de filtre", "Méthode intégrée (embedded)", "Méthode enveloppe (wrapper)", "Extraction de dimensions"],
      ar: ["طريقة الترشيح (filter)", "طريقة مضمَّنة (embedded)", "طريقة مغلِّفة (wrapper)", "استخلاص الأبعاد"]
    },
    answer: 2,
    explain: {
      en: "Wrapper methods search feature subsets by training and scoring the model many times: accurate but expensive. Filters rank features with a cheap statistic, and embedded methods such as Lasso select during a single training run.",
      fr: "Les méthodes wrapper explorent des sous-ensembles en entraînant et évaluant le modèle de nombreuses fois : précises mais coûteuses. Les filtres classent les variables avec une statistique peu coûteuse, et les méthodes intégrées comme le Lasso sélectionnent pendant un seul entraînement.",
      ar: "تبحث الطرق المغلِّفة في مجموعات الميزات بتدريب النموذج وتقييمه مرات كثيرة: دقيقة لكنها مكلفة. أما طرق الترشيح فترتّب الميزات بإحصاءة رخيصة، والطرق المضمَّنة مثل Lasso تختار أثناء تدريب واحد."
    }
  },
  {
    id: "prep-fs-mutual-information",
    concept: "feature-selection",
    difficulty: 2,
    q: {
      en: "A feature affects the target in a strongly non-linear, U-shaped way. Which filter score is more likely to detect it?",
      fr: "Une variable influence la cible de façon fortement non linéaire, en forme de U. Quel score de filtre a le plus de chances de la détecter ?",
      ar: "تؤثر ميزة في الهدف بشكل غير خطي بقوة، على هيئة حرف U. أيّ مقياس ترشيح أرجح لاكتشافها؟"
    },
    options: {
      en: ["mutual_info_classif (mutual information)", "f_classif (ANOVA F-test)", "Pearson correlation with the target", "The feature’s variance"],
      fr: ["mutual_info_classif (information mutuelle)", "f_classif (test F d’ANOVA)", "Corrélation de Pearson avec la cible", "La variance de la variable"],
      ar: ["mutual_info_classif (المعلومات المتبادلة)", "f_classif (اختبار F لتحليل التباين)", "معامل ارتباط بيرسون مع الهدف", "تباين الميزة"]
    },
    answer: 0,
    explain: {
      en: "Linear scores such as the F-test or Pearson correlation can be near zero for a U-shaped relationship. Mutual information measures any dependence between feature and target and is zero only if they are independent.",
      fr: "Des scores linéaires comme le test F ou la corrélation de Pearson peuvent être proches de zéro pour une relation en U. L’information mutuelle mesure toute dépendance entre variable et cible, et n’est nulle que si elles sont indépendantes.",
      ar: "قد تقترب المقاييس الخطية كاختبار F أو ارتباط بيرسون من الصفر في علاقة على شكل U. أما المعلومات المتبادلة فتقيس أيّ اعتماد بين الميزة والهدف، ولا تساوي صفرًا إلا إذا كانا مستقلين."
    }
  },
  {
    id: "prep-fs-selection-outside-cv",
    concept: "feature-selection",
    difficulty: 3,
    q: {
      en: "On 100 rows of pure random noise with 10,000 features, someone picks the 20 features most correlated with y on the full dataset, then runs 5-fold CV and gets 90% accuracy. Why?",
      fr: "Sur 100 lignes de bruit aléatoire à 10 000 variables, quelqu’un choisit les 20 variables les plus corrélées à y sur tout le jeu, puis lance une validation croisée à 5 plis et obtient 90 % de précision. Pourquoi ?",
      ar: "على 100 صفّ من ضجيج عشوائي بحت بـ10,000 ميزة، اختار أحدهم أكثر 20 ميزة ارتباطًا بـ y على كامل البيانات، ثم أجرى تحققًا متقاطعًا بـ5 طيّات وحصل على دقة 90%. لماذا؟"
    },
    options: {
      en: ["Random noise often contains real signal", "5-fold CV always overestimates accuracy by about 40 points", "The selection used labels of the validation folds, leaking them; selection must run inside each fold", "20 features is too few for a reliable model"],
      fr: ["Le bruit aléatoire contient souvent un vrai signal", "La validation croisée à 5 plis surestime toujours la précision d’environ 40 points", "La sélection a utilisé les étiquettes des plis de validation et les a fait fuiter ; elle doit se faire dans chaque pli", "20 variables, c’est trop peu pour un modèle fiable"],
      ar: ["لأن الضجيج العشوائي يحوي غالبًا إشارة حقيقية", "لأن التحقق المتقاطع بـ5 طيّات يبالغ دائمًا في الدقة بنحو 40 نقطة", "لأن الاختيار استخدم تسميات طيّات التحقق فسرّبها؛ يجب أن يجري الاختيار داخل كل طيّة", "لأن 20 ميزة عدد قليل جدًا لنموذج موثوق"]
    },
    answer: 2,
    explain: {
      en: "With 10,000 random columns, some correlate with y by pure chance, and picking them on all rows uses the validation labels. Put the selector inside a Pipeline so it is refit on the training part of each fold; the score then drops to chance level.",
      fr: "Sur 10 000 colonnes aléatoires, certaines sont corrélées à y par pur hasard, et les choisir sur toutes les lignes utilise les étiquettes de validation. Placez le sélecteur dans un Pipeline pour qu’il soit réajusté sur la partie entraînement de chaque pli : le score retombe au niveau du hasard.",
      ar: "بين 10,000 عمود عشوائي يرتبط بعضها بـ y بمحض الصدفة، واختيارها على كل الصفوف يستخدم تسميات التحقق. ضع أداة الاختيار داخل Pipeline لتُعاد ملاءمتها على جزء التدريب في كل طيّة، فتهبط النتيجة إلى مستوى الصدفة."
    }
  },

  // ── simple-imputer ────────────────────────────────────────
  {
    id: "prep-simp-strategy-categorical",
    concept: "simple-imputer",
    difficulty: 1,
    q: {
      en: "Which SimpleImputer strategy cannot be used on a categorical column of strings such as city names?",
      fr: "Quelle stratégie de SimpleImputer ne peut pas s’appliquer à une colonne catégorielle de chaînes, comme des noms de villes ?",
      ar: "أيّ استراتيجية في SimpleImputer لا يمكن استخدامها على عمود فئوي من النصوص مثل أسماء المدن؟"
    },
    options: {
      en: ["strategy=\"most_frequent\"", "strategy=\"constant\" with fill_value=\"MISSING\"", "strategy=\"mean\""],
      fr: ["strategy=\"most_frequent\"", "strategy=\"constant\" avec fill_value=\"MISSING\"", "strategy=\"mean\""],
      ar: ["strategy=\"most_frequent\"", "strategy=\"constant\" مع fill_value=\"MISSING\"", "strategy=\"mean\""]
    },
    answer: 2,
    explain: {
      en: "You cannot average city names, so mean (and median) only work on numbers. The most frequent value or an explicit constant such as \"MISSING\" both work for strings.",
      fr: "On ne peut pas faire la moyenne de noms de villes : mean (et median) ne marchent que sur des nombres. La valeur la plus fréquente ou une constante explicite comme \"MISSING\" fonctionnent sur des chaînes.",
      ar: "لا يمكن حساب متوسط أسماء المدن، فاستراتيجية mean (وكذلك median) لا تعمل إلا على الأعداد. أما القيمة الأكثر تكرارًا أو ثابت صريح مثل \"MISSING\" فكلاهما يعمل على النصوص."
    }
  },
  {
    id: "prep-simp-median-skewed",
    concept: "simple-imputer",
    difficulty: 2,
    q: {
      en: "An income column is heavily right-skewed with a few billionaires, and 5% of values are missing at random. Which fill value is best?",
      fr: "Une colonne de revenus est très asymétrique à droite avec quelques milliardaires, et 5 % des valeurs manquent au hasard. Quelle valeur de remplacement est la meilleure ?",
      ar: "عمود الدخل ملتوٍ بشدة نحو اليمين بسبب بضعة مليارديرات، و5% من قيمه مفقودة عشوائيًا. ما أفضل قيمة للتعويض؟"
    },
    options: {
      en: ["The median", "The mean", "The maximum", "Zero"],
      fr: ["La médiane", "La moyenne", "Le maximum", "Zéro"],
      ar: ["الوسيط", "المتوسط", "القيمة القصوى", "الصفر"]
    },
    answer: 0,
    explain: {
      en: "A handful of extreme incomes drags the mean far above a typical value, so mean imputation would assign unrealistic incomes. The median stays at a typical value whatever the outliers do.",
      fr: "Quelques revenus extrêmes tirent la moyenne bien au-dessus d’une valeur typique : imputer par la moyenne attribuerait des revenus irréalistes. La médiane reste sur une valeur typique, quelles que soient les valeurs aberrantes.",
      ar: "تجرّ حفنة من الدخول المتطرفة المتوسطَ بعيدًا فوق القيمة النموذجية، فيمنح التعويض بالمتوسط دخولًا غير واقعية. أما الوسيط فيبقى عند قيمة نموذجية مهما فعلت القيم الشاذة."
    }
  },
  {
    id: "prep-simp-variance-shrink",
    concept: "simple-imputer",
    difficulty: 2,
    q: {
      en: "You fill 40% missing values of a feature with its mean. What side effect should you expect?",
      fr: "Vous remplacez 40 % de valeurs manquantes d’une variable par sa moyenne. À quel effet secondaire faut-il s’attendre ?",
      ar: "عوّضت 40% من القيم المفقودة لميزة بمتوسطها. ما الأثر الجانبي المتوقع؟"
    },
    options: {
      en: ["The feature’s variance increases", "Its variance shrinks and its correlations with other features are weakened", "The number of rows decreases", "The feature becomes categorical"],
      fr: ["La variance de la variable augmente", "Sa variance diminue et ses corrélations avec les autres variables s’affaiblissent", "Le nombre de lignes diminue", "La variable devient catégorielle"],
      ar: ["يزداد تباين الميزة", "ينكمش تباينها وتضعف ارتباطاتها بالميزات الأخرى", "ينخفض عدد الصفوف", "تصبح الميزة فئوية"]
    },
    answer: 1,
    explain: {
      en: "Putting the same value in 40% of rows piles them up at the center, shrinking spread and diluting relationships with other columns. Adding a missing-indicator column or using KNN/iterative imputation can preserve more structure.",
      fr: "Mettre la même valeur dans 40 % des lignes les empile au centre : la dispersion diminue et les relations avec les autres colonnes se diluent. Ajouter un indicateur de valeur manquante ou une imputation KNN/itérative préserve mieux la structure.",
      ar: "وضع القيمة نفسها في 40% من الصفوف يكدّسها في المركز، فيقلّ التشتت وتضعف العلاقات مع الأعمدة الأخرى. وإضافة عمود يشير إلى القيم المفقودة أو استخدام التعويض بـ KNN أو التعويض التكراري يحفظ قدرًا أكبر من البنية."
    }
  },

  // ── knn-imputer ───────────────────────────────────────────
  {
    id: "prep-knn-how-it-fills",
    concept: "knn-imputer",
    difficulty: 1,
    q: {
      en: "How does KNNImputer fill a missing value?",
      fr: "Comment KNNImputer remplace-t-il une valeur manquante ?",
      ar: "كيف يعوّض KNNImputer قيمة مفقودة؟"
    },
    options: {
      en: ["With the column mean over all rows", "With the value of the previous row", "With the (weighted) average of that feature in the k most similar rows", "With a value predicted by a neural network"],
      fr: ["Par la moyenne de la colonne sur toutes les lignes", "Par la valeur de la ligne précédente", "Par la moyenne (pondérée) de cette variable sur les k lignes les plus similaires", "Par une valeur prédite par un réseau de neurones"],
      ar: ["بمتوسط العمود على كل الصفوف", "بقيمة الصفّ السابق", "بالمتوسط (الموزون) لتلك الميزة في أكثر k صفوف تشابهًا", "بقيمة تتنبأ بها شبكة عصبية"]
    },
    answer: 2,
    explain: {
      en: "KNNImputer finds the k nearest rows using the features that are present (with the nan_euclidean distance) and averages their values for the missing feature. It exploits relationships between features that a column mean ignores.",
      fr: "KNNImputer trouve les k lignes les plus proches à partir des variables présentes (distance nan_euclidean) et fait la moyenne de leurs valeurs pour la variable manquante. Il exploite les liens entre variables qu’une moyenne de colonne ignore.",
      ar: "يجد KNNImputer أقرب k صفوف باستخدام الميزات المتوفرة (بمسافة nan_euclidean) ويأخذ متوسط قيمها للميزة المفقودة. وهو بذلك يستغل العلاقات بين الميزات التي يتجاهلها متوسط العمود."
    }
  },
  {
    id: "prep-knn-needs-scaling",
    concept: "knn-imputer",
    difficulty: 2,
    q: {
      en: "Why should features be scaled before using KNNImputer?",
      fr: "Pourquoi faut-il mettre les variables à l’échelle avant d’utiliser KNNImputer ?",
      ar: "لماذا يجب توحيد مقاييس الميزات قبل استخدام KNNImputer؟"
    },
    options: {
      en: ["Otherwise large-scale features dominate the distance and decide who the “neighbors” are", "KNNImputer only accepts values between 0 and 1", "Scaling removes the missing values", "Scaling makes the imputer run in linear time"],
      fr: ["Sinon les variables à grande échelle dominent la distance et décident qui sont les « voisins »", "KNNImputer n’accepte que des valeurs entre 0 et 1", "La mise à l’échelle supprime les valeurs manquantes", "La mise à l’échelle rend l’imputation linéaire en temps"],
      ar: ["لأن الميزات ذات المقاييس الكبيرة ستهيمن على المسافة وتحدّد من هم «الجيران»", "لأن KNNImputer لا يقبل إلا القيم بين 0 و1", "لأن التوحيد يزيل القيم المفقودة", "لأن التوحيد يجعل التعويض يعمل في زمن خطي"]
    },
    answer: 0,
    explain: {
      en: "Neighbors are found with a distance, and unscaled distances are dominated by features with big numbers, such as salary over age. Scaling makes each feature contribute fairly to similarity.",
      fr: "Les voisins sont trouvés par une distance, et une distance non mise à l’échelle est dominée par les variables à grands nombres, comme le salaire face à l’âge. La mise à l’échelle fait contribuer chaque variable équitablement à la similarité.",
      ar: "يُعثر على الجيران بواسطة مسافة، والمسافة غير الموحّدة تهيمن عليها الميزات ذات الأعداد الكبيرة، كالراتب مقارنةً بالعمر. والتوحيد يجعل كل ميزة تساهم بإنصاف في التشابه."
    }
  },
  {
    id: "prep-knn-large-dataset-choice",
    concept: "knn-imputer",
    difficulty: 3,
    q: {
      en: "You have 5 million rows, and checks suggest values are missing completely at random (MCAR). Which imputer is the pragmatic choice?",
      fr: "Vous avez 5 millions de lignes, et les vérifications suggèrent que les valeurs manquent de façon complètement aléatoire (MCAR). Quel imputer est le choix pragmatique ?",
      ar: "لديك 5 ملايين صفّ، وتشير الفحوص إلى أن القيم مفقودة عشوائيًا بالكامل (MCAR). أيّ أداة تعويض هي الخيار العملي؟"
    },
    options: {
      en: ["KNNImputer with n_neighbors=50", "KNNImputer with weights=\"distance\"", "Drop every column that has any missing value", "SimpleImputer with mean or median"],
      fr: ["KNNImputer avec n_neighbors=50", "KNNImputer avec weights=\"distance\"", "Supprimer toute colonne ayant au moins une valeur manquante", "SimpleImputer avec la moyenne ou la médiane"],
      ar: ["KNNImputer مع n_neighbors=50", "KNNImputer مع weights=\"distance\"", "حذف كل عمود فيه قيمة مفقودة واحدة على الأقل", "SimpleImputer بالمتوسط أو الوسيط"]
    },
    answer: 3,
    explain: {
      en: "KNNImputer must compare rows with many others, roughly O(n²), which is very slow at millions of rows. When missingness is random, neighbors carry little extra information, so a simple median or mean is fast and adequate.",
      fr: "KNNImputer doit comparer chaque ligne à beaucoup d’autres, environ O(n²), ce qui est très lent sur des millions de lignes. Quand les manques sont aléatoires, les voisins apportent peu d’information en plus : une simple médiane ou moyenne est rapide et suffisante.",
      ar: "يحتاج KNNImputer إلى مقارنة الصفوف بكثير غيرها، بتعقيد O(n²) تقريبًا، وهذا بطيء جدًا مع ملايين الصفوف. وحين يكون الفقد عشوائيًا لا يضيف الجيران معلومات تُذكر، فيكون الوسيط أو المتوسط البسيط سريعًا وكافيًا."
    }
  },

  // ── train-test-split ──────────────────────────────────────
  {
    id: "prep-split-stratify",
    concept: "train-test-split",
    difficulty: 1,
    q: {
      en: "What does stratify=y do in train_test_split?",
      fr: "Que fait stratify=y dans train_test_split ?",
      ar: "ماذا يفعل stratify=y في train_test_split؟"
    },
    options: {
      en: ["Sorts the rows by the target before splitting", "Keeps the class proportions the same in the train and test sets", "Removes the minority class from the test set", "Balances the classes to 50/50"],
      fr: ["Trie les lignes selon la cible avant le découpage", "Conserve les mêmes proportions de classes dans l’entraînement et le test", "Retire la classe minoritaire du jeu de test", "Équilibre les classes à 50/50"],
      ar: ["يرتّب الصفوف حسب الهدف قبل التقسيم", "يحافظ على نسب الفئات نفسها في مجموعتي التدريب والاختبار", "يزيل الفئة الأقلية من مجموعة الاختبار", "يوازن الفئات إلى 50/50"]
    },
    answer: 1,
    explain: {
      en: "Stratification samples each class separately so that, for example, a 5% positive rate stays about 5% in both sets. Without it, a random split can leave very few minority examples in the test set. It does not rebalance the classes.",
      fr: "La stratification échantillonne chaque classe séparément pour que, par exemple, un taux de positifs de 5 % reste d’environ 5 % dans les deux jeux. Sans elle, un découpage aléatoire peut laisser très peu d’exemples minoritaires en test. Elle ne rééquilibre pas les classes.",
      ar: "يأخذ التقسيم الطبقي عيّنات من كل فئة على حدة، فتبقى مثلًا نسبة إيجابيات قدرها 5% قرابة 5% في المجموعتين. ومن دونه قد يترك التقسيم العشوائي أمثلة قليلة جدًا من الفئة الأقلية في الاختبار. وهو لا يعيد موازنة الفئات."
    }
  },
  {
    id: "prep-split-random-state",
    concept: "train-test-split",
    difficulty: 1,
    q: {
      en: "Why set random_state=42 when splitting data?",
      fr: "Pourquoi fixer random_state=42 lors du découpage des données ?",
      ar: "لماذا نضبط random_state=42 عند تقسيم البيانات؟"
    },
    options: {
      en: ["42 gives the most accurate models", "It makes the split reproducible, so experiments can be compared", "It shuffles the data more thoroughly", "It prevents overfitting"],
      fr: ["42 donne les modèles les plus précis", "Il rend le découpage reproductible, pour pouvoir comparer les expériences", "Il mélange les données plus soigneusement", "Il empêche le surapprentissage"],
      ar: ["لأن 42 تعطي أدق النماذج", "لأنه يجعل التقسيم قابلًا لإعادة الإنتاج، فتمكن مقارنة التجارب", "لأنه يخلط البيانات خلطًا أشمل", "لأنه يمنع الإفراط في التخصيص"]
    },
    answer: 1,
    explain: {
      en: "The seed fixes the random shuffle, so everyone who reruns the code gets the same train and test rows. The number itself has no special power; any fixed integer works.",
      fr: "La graine fixe le mélange aléatoire : quiconque relance le code obtient les mêmes lignes d’entraînement et de test. Le nombre lui-même n’a rien de spécial ; tout entier fixe convient.",
      ar: "تثبّت البذرة الخلط العشوائي، فيحصل كل من يعيد تشغيل الشيفرة على صفوف التدريب والاختبار نفسها. ولا قوة خاصة للعدد نفسه؛ فأيّ عدد صحيح ثابت يفي بالغرض."
    }
  },
  {
    id: "prep-split-shuffle-time-series",
    concept: "train-test-split",
    difficulty: 2,
    q: {
      en: "You are splitting daily sales data to evaluate a forecasting model. How should train_test_split be configured?",
      fr: "Vous découpez des ventes quotidiennes pour évaluer un modèle de prévision. Comment configurer train_test_split ?",
      ar: "تقسّم بيانات مبيعات يومية لتقييم نموذج تنبؤ. كيف يجب ضبط train_test_split؟"
    },
    options: {
      en: ["shuffle=True with stratify=y", "shuffle=False on time-sorted data, so the test set is the most recent period", "shuffle=True with a larger test_size", "Use the oldest 20% of days as the test set"],
      fr: ["shuffle=True avec stratify=y", "shuffle=False sur des données triées par date, pour que le test soit la période la plus récente", "shuffle=True avec un test_size plus grand", "Prendre les 20 % de jours les plus anciens comme jeu de test"],
      ar: ["shuffle=True مع stratify=y", "shuffle=False على بيانات مرتبة زمنيًا، لتكون مجموعة الاختبار هي الفترة الأحدث", "shuffle=True مع test_size أكبر", "استخدام أقدم 20% من الأيام مجموعةً للاختبار"]
    },
    answer: 1,
    explain: {
      en: "In production a forecaster predicts the future from the past. Shuffling mixes future days into training, which leaks information and makes the score look far better than real forecasting performance.",
      fr: "En production, un modèle de prévision prédit le futur à partir du passé. Mélanger introduit des jours futurs dans l’entraînement : l’information fuit et le score paraît bien meilleur que la vraie performance de prévision.",
      ar: "في بيئة الإنتاج يتنبأ نموذج التوقّع بالمستقبل انطلاقًا من الماضي. والخلط يُدخل أيامًا مستقبلية في التدريب، فيسرّب المعلومات ويجعل النتيجة تبدو أفضل بكثير من الأداء الفعلي في التنبؤ."
    }
  },
  {
    id: "prep-split-test-set-reuse",
    concept: "train-test-split",
    difficulty: 3,
    q: {
      en: "A team evaluates 40 model variants on the test set and reports the best test score. What is wrong with that number?",
      fr: "Une équipe évalue 40 variantes de modèles sur le jeu de test et rapporte le meilleur score de test. Quel est le problème de ce chiffre ?",
      ar: "قيّم فريقٌ 40 نسخة من النموذج على مجموعة الاختبار وأبلغ عن أفضل نتيجة اختبار. ما العيب في هذا الرقم؟"
    },
    options: {
      en: ["Nothing, as long as the test set was split before training", "It is too pessimistic, because 40 models dilute the score", "It is optimistic: the test set was used for model selection, so it is no longer unseen", "It is only wrong if the variants use different algorithms"],
      fr: ["Rien, tant que le test a été séparé avant l’entraînement", "Il est trop pessimiste, car 40 modèles diluent le score", "Il est optimiste : le test a servi à choisir le modèle, il n’est donc plus « inédit »", "Il n’est faux que si les variantes utilisent des algorithmes différents"],
      ar: ["لا عيب، ما دامت مجموعة الاختبار فُصلت قبل التدريب", "إنه متشائم جدًا لأن 40 نموذجًا تخفّف النتيجة", "إنه متفائل: استُخدمت مجموعة الاختبار في اختيار النموذج، فلم تعد بيانات غير مرئية", "لا يكون خاطئًا إلا إذا استخدمت النسخ خوارزميات مختلفة"]
    },
    answer: 2,
    explain: {
      en: "Picking the best of many on the test set lets chance quirks of that set drive the choice, so the winner’s score is biased upward. Compare variants with a validation set or cross-validation, and touch the test set once at the end.",
      fr: "Choisir le meilleur parmi beaucoup sur le test laisse les particularités fortuites de ce jeu guider le choix : le score du gagnant est biaisé vers le haut. Comparez les variantes sur une validation ou en validation croisée, et n’utilisez le test qu’une fois, à la fin.",
      ar: "اختيار الأفضل من بين كثيرين على مجموعة الاختبار يجعل ميزاتها العرَضية توجّه الاختيار، فتكون نتيجة الفائز منحازة صعودًا. قارن النسخ بمجموعة تحقق أو بالتحقق المتقاطع، ولا تلمس مجموعة الاختبار إلا مرة واحدة في النهاية."
    }
  },

  // ── class-imbalance ───────────────────────────────────────
  {
    id: "prep-imb-class-weight",
    concept: "class-imbalance",
    difficulty: 1,
    q: {
      en: "What does class_weight=\"balanced\" do in a scikit-learn classifier?",
      fr: "Que fait class_weight=\"balanced\" dans un classifieur scikit-learn ?",
      ar: "ماذا يفعل class_weight=\"balanced\" في مصنِّف من scikit-learn؟"
    },
    options: {
      en: ["Duplicates minority rows until the classes are equal", "Deletes majority rows until the classes are equal", "Sets the decision threshold to the minority class rate", "Weights each class’s errors inversely to its frequency, so minority mistakes cost more"],
      fr: ["Duplique les lignes minoritaires jusqu’à égalité des classes", "Supprime des lignes majoritaires jusqu’à égalité des classes", "Fixe le seuil de décision au taux de la classe minoritaire", "Pondère les erreurs de chaque classe à l’inverse de sa fréquence : les erreurs sur la minorité coûtent plus"],
      ar: ["يكرّر صفوف الفئة الأقلية حتى تتساوى الفئات", "يحذف صفوفًا من الفئة الأغلبية حتى تتساوى الفئات", "يضبط عتبة القرار على نسبة الفئة الأقلية", "يزن أخطاء كل فئة بعكس تكرارها، فتصبح أخطاء الفئة الأقلية أعلى كلفة"]
    },
    answer: 3,
    explain: {
      en: "Balanced weights scale each sample’s loss by n / (K · n_c), so a rare class gets a large weight. The data is left untouched; only the training objective changes, which makes it a cheap first fix.",
      fr: "Les poids « balanced » multiplient la perte de chaque exemple par n / (K · n_c) : une classe rare reçoit un poids élevé. Les données restent intactes, seul l’objectif d’entraînement change, d’où un premier correctif peu coûteux.",
      ar: "تضرب الأوزان المتوازنة خسارة كل عيّنة في n / (K · n_c)، فتنال الفئة النادرة وزنًا كبيرًا. وتبقى البيانات كما هي ولا يتغيّر إلا هدف التدريب، ما يجعله حلًّا أوليًا رخيصًا."
    }
  },
  {
    id: "prep-imb-accuracy-trap",
    concept: "class-imbalance",
    difficulty: 2,
    q: {
      en: "In a dataset with 99.5% legitimate and 0.5% fraudulent transactions, a model reaches 99.5% accuracy. What is the most likely explanation?",
      fr: "Dans un jeu avec 99,5 % de transactions légitimes et 0,5 % de fraudes, un modèle atteint 99,5 % d’exactitude. Quelle est l’explication la plus probable ?",
      ar: "في مجموعة بيانات فيها 99.5% معاملات سليمة و0.5% احتيالية، بلغ نموذجٌ دقة 99.5%. ما التفسير الأرجح؟"
    },
    options: {
      en: ["It predicts “legitimate” for everything and catches no fraud", "It is an excellent fraud detector", "It is overfitting the fraud cases", "The test set must be leaking into training"],
      fr: ["Il prédit « légitime » partout et n’attrape aucune fraude", "C’est un excellent détecteur de fraude", "Il surapprend les cas de fraude", "Le jeu de test fuit forcément dans l’entraînement"],
      ar: ["يتنبأ بـ«سليمة» لكل شيء ولا يلتقط أيّ احتيال", "إنه كاشف احتيال ممتاز", "إنه يفرط في التخصيص على حالات الاحتيال", "لا بدّ أن مجموعة الاختبار تتسرّب إلى التدريب"]
    },
    answer: 0,
    explain: {
      en: "Always predicting the majority class already scores 99.5% here, so accuracy says nothing about fraud detection. Look at recall, precision or PR-AUC for the minority class instead.",
      fr: "Prédire toujours la classe majoritaire donne déjà 99,5 % ici : l’exactitude ne dit rien de la détection de fraude. Regardez plutôt le rappel, la précision ou la PR-AUC de la classe minoritaire.",
      ar: "التنبؤ الدائم بالفئة الأغلبية يحقق هنا 99.5% أصلًا، فلا تخبرنا الدقة بشيء عن كشف الاحتيال. انظر بدلًا من ذلك إلى الاستدعاء (recall) والضبط (precision) أو PR-AUC للفئة الأقلية."
    }
  },
  {
    id: "prep-imb-probabilities-distorted",
    concept: "class-imbalance",
    difficulty: 2,
    q: {
      en: "After training with SMOTE or strong class weights, what side effect should you watch for if the business uses the predicted probabilities directly?",
      fr: "Après un entraînement avec SMOTE ou de forts poids de classe, quel effet secondaire surveiller si le métier utilise directement les probabilités prédites ?",
      ar: "بعد التدريب باستخدام SMOTE أو أوزان فئات قوية، ما الأثر الجانبي الذي يجب الانتباه إليه إذا كانت الأعمال تستخدم الاحتمالات المتنبَّأ بها مباشرةً؟"
    },
    options: {
      en: ["The model can no longer output probabilities", "Probabilities become overconfident for the majority class only", "Minority probabilities are inflated, so the model should be recalibrated", "Probabilities become exactly 0 or 1"],
      fr: ["Le modèle ne peut plus produire de probabilités", "Les probabilités deviennent trop confiantes pour la seule classe majoritaire", "Les probabilités de la minorité sont gonflées : il faut recalibrer le modèle", "Les probabilités valent exactement 0 ou 1"],
      ar: ["لن يعود النموذج قادرًا على إخراج احتمالات", "تصبح الاحتمالات مفرطة الثقة للفئة الأغلبية فقط", "تتضخّم احتمالات الفئة الأقلية، فينبغي إعادة معايرة النموذج", "تصبح الاحتمالات 0 أو 1 تمامًا"]
    },
    answer: 2,
    explain: {
      en: "Resampling and reweighting make the model behave as if the minority class were much more common than it really is. Ranking may improve, but a predicted 40% no longer means 40%, so recalibrate when probabilities matter.",
      fr: "Le rééchantillonnage et la repondération font agir le modèle comme si la classe minoritaire était bien plus fréquente qu’en réalité. Le classement peut s’améliorer, mais un 40 % prédit ne signifie plus 40 % : recalibrez si les probabilités comptent.",
      ar: "تجعل إعادة أخذ العيّنات وإعادة الوزن النموذجَ يتصرّف كأن الفئة الأقلية أكثر شيوعًا بكثير مما هي عليه. قد يتحسّن الترتيب، لكن احتمال 40% المتنبَّأ به لم يعد يعني 40%، فأعِد المعايرة حين تكون الاحتمالات مهمة."
    }
  },
  {
    id: "prep-imb-smote-before-split",
    concept: "class-imbalance",
    difficulty: 3,
    q: {
      en: "A team applies SMOTE to the whole dataset, then splits it into train and test. Test recall is excellent but collapses in production. Why?",
      fr: "Une équipe applique SMOTE à tout le jeu de données, puis le découpe en entraînement et test. Le rappel en test est excellent mais s’effondre en production. Pourquoi ?",
      ar: "طبّق فريقٌ SMOTE على كامل البيانات ثم قسّمها إلى تدريب واختبار. جاء الاستدعاء في الاختبار ممتازًا لكنه انهار في الإنتاج. لماذا؟"
    },
    options: {
      en: ["SMOTE only works with neural networks", "Synthetic points built from test rows ended up in training, leaking the test set", "The test set had too few majority rows", "SMOTE always lowers precision in production"],
      fr: ["SMOTE ne fonctionne qu’avec des réseaux de neurones", "Des points synthétiques construits à partir de lignes de test se sont retrouvés à l’entraînement : fuite du jeu de test", "Le jeu de test avait trop peu de lignes majoritaires", "SMOTE fait toujours baisser la précision en production"],
      ar: ["لأن SMOTE لا يعمل إلا مع الشبكات العصبية", "لأن نقاطًا اصطناعية بُنيت من صفوف الاختبار انتهت في التدريب، فتسرّبت مجموعة الاختبار", "لأن مجموعة الاختبار كانت تضم صفوفًا قليلة جدًا من الفئة الأغلبية", "لأن SMOTE يخفّض دائمًا الضبط في الإنتاج"]
    },
    answer: 1,
    explain: {
      en: "SMOTE interpolates between neighboring minority points, so synthetic training samples are near-copies of test samples, and the test set becomes partly “seen”. Resample only the training data, for example with an imblearn Pipeline inside cross-validation.",
      fr: "SMOTE interpole entre points minoritaires voisins : des exemples synthétiques d’entraînement sont presque des copies d’exemples de test, qui deviennent en partie « déjà vus ». Ne rééchantillonnez que l’entraînement, par exemple avec un Pipeline imblearn dans la validation croisée.",
      ar: "يستوفي SMOTE بين نقاط متجاورة من الفئة الأقلية، فتصبح عيّنات تدريب اصطناعية شبه نسخ من عيّنات الاختبار، وتغدو مجموعة الاختبار «مرئية» جزئيًا. أعِد أخذ العيّنات على بيانات التدريب وحدها، مثلًا باستخدام Pipeline من imblearn داخل التحقق المتقاطع."
    }
  },

  // ── cross-validation ──────────────────────────────────────
  {
    id: "prep-cv-kfold-mechanics",
    concept: "cross-validation",
    difficulty: 1,
    q: {
      en: "In 5-fold cross-validation, how many models are trained and how is each fold used?",
      fr: "En validation croisée à 5 plis, combien de modèles sont entraînés et comment chaque pli est-il utilisé ?",
      ar: "في التحقق المتقاطع (cross-validation) بـ5 طيّات، كم نموذجًا يُدرَّب وكيف تُستخدم كل طيّة؟"
    },
    options: {
      en: ["1 model; each fold is a separate test set", "5 models; each fold serves as the validation set exactly once", "5 models; every fold is used only for training", "25 models; each pair of folds is compared"],
      fr: ["1 modèle ; chaque pli est un jeu de test distinct", "5 modèles ; chaque pli sert exactement une fois de jeu de validation", "5 modèles ; chaque pli ne sert qu’à l’entraînement", "25 modèles ; chaque paire de plis est comparée"],
      ar: ["نموذج واحد، وكل طيّة مجموعة اختبار منفصلة", "5 نماذج، وكل طيّة تُستخدم مجموعةَ تحقق مرة واحدة بالضبط", "5 نماذج، وكل طيّة تُستخدم للتدريب فقط", "25 نموذجًا، وتُقارن كل طيّتين معًا"]
    },
    answer: 1,
    explain: {
      en: "Each round trains on 4 folds and validates on the remaining one, rotating until every fold has been held out once. The 5 scores are then averaged, and their spread shows how stable the estimate is.",
      fr: "Chaque tour entraîne sur 4 plis et valide sur le pli restant, en tournant jusqu’à ce que chaque pli ait été mis de côté une fois. Les 5 scores sont ensuite moyennés, et leur dispersion montre la stabilité de l’estimation.",
      ar: "في كل جولة يُدرَّب النموذج على 4 طيّات ويُتحقق منه على الطيّة الباقية، مع التدوير حتى تُحجز كل طيّة مرة واحدة. ثم يؤخذ متوسط النتائج الخمس، ويُظهر تشتتها مدى استقرار التقدير."
    }
  },
  {
    id: "prep-cv-stratified-kfold",
    concept: "cross-validation",
    difficulty: 1,
    q: {
      en: "For a classification problem where the positive class is only 3% of rows, which splitter should you use for cross-validation?",
      fr: "Pour une classification où la classe positive ne représente que 3 % des lignes, quel découpeur utiliser en validation croisée ?",
      ar: "في مسألة تصنيف لا تمثّل فيها الفئة الإيجابية إلا 3% من الصفوف، أيّ أداة تقسيم تستخدم في التحقق المتقاطع؟"
    },
    options: {
      en: ["KFold without shuffling", "StratifiedKFold", "TimeSeriesSplit", "LeaveOneOut"],
      fr: ["KFold sans mélange", "StratifiedKFold", "TimeSeriesSplit", "LeaveOneOut"],
      ar: ["KFold دون خلط", "StratifiedKFold", "TimeSeriesSplit", "LeaveOneOut"]
    },
    answer: 1,
    explain: {
      en: "StratifiedKFold keeps the 3% positive rate in every fold. Plain KFold can produce folds with almost no positives, making some fold scores meaningless and the average unstable.",
      fr: "StratifiedKFold conserve le taux de 3 % de positifs dans chaque pli. Un KFold simple peut produire des plis presque sans positifs, ce qui rend certains scores de pli insignifiants et la moyenne instable.",
      ar: "يحافظ StratifiedKFold على نسبة الإيجابيات 3% في كل طيّة. أما KFold العادي فقد ينتج طيّات تكاد تخلو من الإيجابيات، فتفقد بعض النتائج معناها ويصبح المتوسط غير مستقر."
    }
  },
  {
    id: "prep-cv-reading-mean-std",
    concept: "cross-validation",
    difficulty: 3,
    q: {
      en: "5-fold CV gives model A an AUC of 0.85 ± 0.01 and model B 0.86 ± 0.06. What is the most reasonable conclusion?",
      fr: "En validation croisée à 5 plis, le modèle A obtient une AUC de 0,85 ± 0,01 et le modèle B de 0,86 ± 0,06. Quelle est la conclusion la plus raisonnable ?",
      ar: "أعطى التحقق المتقاطع بـ5 طيّات النموذجَ A قيمة AUC تساوي 0.85 ± 0.01 والنموذج B قيمة 0.86 ± 0.06. ما الاستنتاج الأكثر معقولية؟"
    },
    options: {
      en: ["B is clearly better because its mean is higher", "A has data leakage because its std is so small", "Both models are overfitting", "B is not clearly better: the gap is far smaller than its fold-to-fold spread, and A is more stable"],
      fr: ["B est nettement meilleur car sa moyenne est plus haute", "A a une fuite de données car son écart-type est très faible", "Les deux modèles surapprennent", "B n’est pas nettement meilleur : l’écart est bien plus petit que sa variation d’un pli à l’autre, et A est plus stable"],
      ar: ["النموذج B أفضل بوضوح لأن متوسطه أعلى", "في النموذج A تسرّب بيانات لأن انحرافه المعياري صغير جدًا", "كلا النموذجين يفرط في التخصيص", "B ليس أفضل بوضوح: الفارق أصغر بكثير من تذبذبه بين الطيّات، وA أكثر استقرارًا"]
    },
    answer: 3,
    explain: {
      en: "A 0.01 difference in means is well within B’s ±0.06 variation, so it may be noise. A’s low spread means more predictable performance, which often matters as much as a tiny gain in the mean.",
      fr: "Un écart de 0,01 entre moyennes reste largement dans la variation de ±0,06 de B : ce peut être du bruit. La faible dispersion de A signifie une performance plus prévisible, ce qui compte souvent autant qu’un gain minime en moyenne.",
      ar: "فارق 0.01 بين المتوسطين يقع ضمن تذبذب B البالغ ±0.06، فقد يكون مجرد ضجيج. وتشتت A المنخفض يعني أداءً أسهل توقعًا، وهذا غالبًا لا يقلّ أهمية عن مكسب ضئيل في المتوسط."
    }
  },

  // ── time-series-cv ────────────────────────────────────────
  {
    id: "prep-tscv-why-not-shuffled",
    concept: "time-series-cv",
    difficulty: 1,
    q: {
      en: "Why is shuffled k-fold cross-validation a bad choice for evaluating a forecasting model?",
      fr: "Pourquoi la validation croisée k-fold avec mélange est-elle un mauvais choix pour évaluer un modèle de prévision ?",
      ar: "لماذا يُعدّ التحقق المتقاطع k-fold مع الخلط خيارًا سيئًا لتقييم نموذج تنبؤ بالسلاسل الزمنية؟"
    },
    options: {
      en: ["It trains on future data to predict the past, so scores are too optimistic", "It is too slow for time series", "It cannot handle numeric targets", "It uses too little data for training"],
      fr: ["Il entraîne sur des données futures pour prédire le passé : les scores sont trop optimistes", "Il est trop lent pour les séries temporelles", "Il ne gère pas les cibles numériques", "Il utilise trop peu de données pour l’entraînement"],
      ar: ["لأنه يدرّب على بيانات مستقبلية للتنبؤ بالماضي، فتأتي النتائج متفائلة أكثر من اللازم", "لأنه بطيء جدًا مع السلاسل الزمنية", "لأنه لا يتعامل مع الأهداف الرقمية", "لأنه يستخدم بيانات قليلة جدًا للتدريب"]
    },
    answer: 0,
    explain: {
      en: "With shuffling, the model sees days after the ones it is tested on: look-ahead leakage. Time-series CV always trains on the past and tests on the following period, as in real forecasting.",
      fr: "Avec le mélange, le modèle voit des jours postérieurs à ceux sur lesquels il est testé : c’est une fuite par anticipation (look-ahead). La validation pour séries temporelles entraîne toujours sur le passé et teste sur la période suivante, comme en vraie prévision.",
      ar: "مع الخلط يرى النموذج أيامًا تأتي بعد الأيام التي يُختبر عليها: تسرّب استباقي (look-ahead leakage). أما التحقق المتقاطع للسلاسل الزمنية فيدرّب دائمًا على الماضي ويختبر على الفترة التالية، كما في التنبؤ الحقيقي."
    }
  },
  {
    id: "prep-tscv-gap-for-lags",
    concept: "time-series-cv",
    difficulty: 2,
    q: {
      en: "Your features include 7-day rolling averages of the target. What does setting gap=7 in TimeSeriesSplit achieve?",
      fr: "Vos variables incluent des moyennes glissantes sur 7 jours de la cible. Que permet gap=7 dans TimeSeriesSplit ?",
      ar: "تتضمن ميزاتك متوسطات متحركة للهدف على 7 أيام. ماذا يحقق ضبط gap=7 في TimeSeriesSplit؟"
    },
    options: {
      en: ["It makes each test window exactly 7 days long", "It skips 7 days between train and test, so no rolling window spans both", "It retrains the model every 7 days", "It removes the 7 oldest days from every fold"],
      fr: ["Chaque fenêtre de test dure exactement 7 jours", "Il saute 7 jours entre entraînement et test, pour qu’aucune fenêtre glissante ne chevauche les deux", "Il réentraîne le modèle tous les 7 jours", "Il retire les 7 jours les plus anciens de chaque pli"],
      ar: ["يجعل كل نافذة اختبار بطول 7 أيام بالضبط", "يتخطّى 7 أيام بين التدريب والاختبار، فلا تمتدّ أيّ نافذة متحركة عبر الجهتين", "يعيد تدريب النموذج كل 7 أيام", "يحذف أقدم 7 أيام من كل طيّة"]
    },
    answer: 1,
    explain: {
      en: "Right at the boundary, the last training rows and the first test rows share overlapping windows, so information crosses the split. A gap at least as long as the longest lag or rolling window removes that overlap.",
      fr: "Juste à la frontière, les dernières lignes d’entraînement et les premières lignes de test partagent des fenêtres qui se chevauchent : de l’information traverse la séparation. Un écart au moins aussi long que le plus long décalage ou fenêtre glissante supprime ce chevauchement.",
      ar: "عند الحدّ الفاصل تمامًا تتشارك آخر صفوف التدريب وأول صفوف الاختبار نوافذ متداخلة، فتعبر المعلومات بين الجهتين. وفجوة بطول أطول تأخير أو نافذة متحركة على الأقل تزيل هذا التداخل."
    }
  },
  {
    id: "prep-tscv-sliding-window",
    concept: "time-series-cv",
    difficulty: 2,
    q: {
      en: "When would you set max_train_size in TimeSeriesSplit to use a fixed-length sliding window instead of an expanding one?",
      fr: "Quand fixer max_train_size dans TimeSeriesSplit pour utiliser une fenêtre glissante de longueur fixe plutôt qu’une fenêtre croissante ?",
      ar: "متى تضبط max_train_size في TimeSeriesSplit لاستخدام نافذة منزلقة ثابتة الطول بدل نافذة متّسعة؟"
    },
    options: {
      en: ["When you have very little history", "When the data is i.i.d. with no time order", "When old data is stale because the process has drifted or changed regime", "Whenever the target is binary"],
      fr: ["Quand vous avez très peu d’historique", "Quand les données sont i.i.d. sans ordre temporel", "Quand les anciennes données sont dépassées parce que le phénomène a dérivé ou changé de régime", "Dès que la cible est binaire"],
      ar: ["عندما يكون لديك تاريخ قصير جدًا", "عندما تكون البيانات مستقلة ومتماثلة التوزيع (i.i.d.) بلا ترتيب زمني", "عندما تصبح البيانات القديمة متقادمة لأن الظاهرة انجرفت أو تغيّر نظامها", "كلما كان الهدف ثنائيًا"]
    },
    answer: 2,
    explain: {
      en: "An expanding window keeps all history, which helps when the past still resembles the present. If behavior has shifted, old rows teach outdated patterns, and a sliding window of recent data tracks reality better.",
      fr: "Une fenêtre croissante garde tout l’historique, utile quand le passé ressemble encore au présent. Si les comportements ont changé, les anciennes lignes enseignent des motifs obsolètes, et une fenêtre glissante sur les données récentes colle mieux à la réalité.",
      ar: "تحتفظ النافذة المتّسعة بكامل التاريخ، وهذا مفيد حين يظل الماضي شبيهًا بالحاضر. أما إذا تغيّر السلوك فالصفوف القديمة تعلّم أنماطًا بائدة، والنافذة المنزلقة على البيانات الحديثة تواكب الواقع أفضل."
    }
  },
  {
    id: "prep-tscv-centered-rolling-leak",
    concept: "time-series-cv",
    difficulty: 3,
    q: {
      en: "A forecaster builds a feature with df[\"sales\"].rolling(7, center=True).mean() and validates with TimeSeriesSplit. Scores look great. What is the hidden problem?",
      fr: "Un prévisionniste crée une variable avec df[\"sales\"].rolling(7, center=True).mean() et valide avec TimeSeriesSplit. Les scores sont excellents. Quel est le problème caché ?",
      ar: "أنشأ محلّل تنبؤ ميزة بـ df[\"sales\"].rolling(7, center=True).mean() وتحقق منها بـ TimeSeriesSplit. النتائج ممتازة. ما المشكلة الخفية؟"
    },
    options: {
      en: ["A centered window averages future days, so each row uses information not yet available", "rolling() cannot be used with TimeSeriesSplit", "A 7-day window is too short to be useful", "Nothing; TimeSeriesSplit prevents every kind of leakage"],
      fr: ["Une fenêtre centrée fait la moyenne de jours futurs : chaque ligne utilise une information pas encore disponible", "rolling() est incompatible avec TimeSeriesSplit", "Une fenêtre de 7 jours est trop courte pour être utile", "Rien ; TimeSeriesSplit empêche toute forme de fuite"],
      ar: ["النافذة المتمركزة تحسب متوسطًا يشمل أيامًا مستقبلية، فيستخدم كل صفّ معلومات لم تتوفر بعد", "لا يمكن استخدام rolling() مع TimeSeriesSplit", "نافذة 7 أيام أقصر من أن تكون مفيدة", "لا مشكلة؛ فـ TimeSeriesSplit يمنع كل أنواع التسرّب"]
    },
    answer: 0,
    explain: {
      en: "With center=True, the value for day t includes days t+1 to t+3, which are unknown at prediction time. Splitting correctly does not help if the features themselves look ahead; use trailing windows, shifted so they end before t.",
      fr: "Avec center=True, la valeur du jour t inclut les jours t+1 à t+3, inconnus au moment de prédire. Un découpage correct ne sert à rien si les variables elles-mêmes regardent vers l’avenir : utilisez des fenêtres passées, décalées pour finir avant t.",
      ar: "مع center=True تشمل قيمة اليوم t الأيامَ من t+1 إلى t+3، وهي مجهولة لحظة التنبؤ. ولا ينفع التقسيم الصحيح إذا كانت الميزات نفسها تستشرف المستقبل؛ استخدم نوافذ لا تنظر إلا إلى الماضي، مُزاحة بحيث تنتهي قبل t."
    }
  }
];
