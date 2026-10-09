/** Quiz questions: models. See index.js for the question format. */
/** @type {import('./index.js').Question[]} */
export default [
  {
    id: "model-linreg-ols-loss",
    concept: "linear-regression",
    difficulty: 1,
    q: {
      en: "What does ordinary least squares (OLS) linear regression minimize?",
      fr: "Que minimise la régression linéaire par moindres carrés ordinaires (MCO) ?",
      ar: "ما الذي يقلّله الانحدار الخطي بطريقة المربعات الصغرى العادية (OLS)؟"
    },
    options: {
      en: ["The sum of absolute residuals", "The hinge loss", "The sum of squared residuals", "The number of misclassified points"],
      fr: ["La somme des valeurs absolues des résidus", "La perte charnière (hinge loss)", "La somme des carrés des résidus", "Le nombre de points mal classés"],
      ar: ["مجموع القيم المطلقة للبواقي", "خسارة المفصلة (hinge loss)", "مجموع مربعات البواقي (residuals)", "عدد النقاط المصنّفة خطأً"]
    },
    answer: 2,
    explain: {
      en: "OLS picks the weights that minimize Σ(y − ŷ)², the squared vertical distances to the line. Squaring makes the problem smooth and gives the closed-form solution w = (XᵀX)⁻¹Xᵀy.",
      fr: "Les MCO choisissent les poids qui minimisent Σ(y − ŷ)², les carrés des écarts verticaux à la droite. Le carré rend le problème lisse et donne la solution analytique w = (XᵀX)⁻¹Xᵀy.",
      ar: "تختار طريقة OLS الأوزان التي تقلّل Σ(y − ŷ)²، أي مربعات المسافات الرأسية إلى الخط. التربيع يجعل المسألة ملساء ويعطي الحل المغلق w = (XᵀX)⁻¹Xᵀy."
    }
  },
  {
    id: "model-linreg-lasso-vs-ridge",
    concept: "linear-regression",
    difficulty: 2,
    q: {
      en: "What is the key practical difference between Lasso (L1) and Ridge (L2) regularization?",
      fr: "Quelle est la principale différence pratique entre la régularisation Lasso (L1) et Ridge (L2) ?",
      ar: "ما الفرق العملي الأساسي بين التنظيم (regularization) من نوع Lasso (L1) ومن نوع Ridge (L2)؟"
    },
    options: {
      en: ["Ridge pushes coefficients exactly to zero, while Lasso only shrinks them", "Lasso can push some coefficients exactly to zero, so it also selects features", "Lasso only works with a single feature", "Ridge removes the intercept from the model"],
      fr: ["Ridge ramène des coefficients exactement à zéro, alors que Lasso ne fait que les réduire", "Lasso peut ramener certains coefficients exactement à zéro, et sélectionne donc des variables", "Lasso ne fonctionne qu'avec une seule variable", "Ridge supprime l'ordonnée à l'origine du modèle"],
      ar: ["يجعل Ridge المعاملات صفرًا تمامًا، بينما يكتفي Lasso بتقليصها", "يمكن لـ Lasso أن يجعل بعض المعاملات صفرًا تمامًا، فيقوم أيضًا باختيار الميزات", "لا يعمل Lasso إلا مع ميزة واحدة", "يحذف Ridge الحد الثابت (intercept) من النموذج"]
    },
    answer: 1,
    explain: {
      en: "The L1 penalty λ‖w‖₁ has corners at zero, so the optimum often sits exactly on them and some weights become 0. The L2 penalty λ‖w‖₂² shrinks all weights smoothly but rarely to exactly zero.",
      fr: "La pénalité L1 λ‖w‖₁ a des « coins » en zéro : l'optimum tombe souvent dessus et certains poids deviennent exactement nuls. La pénalité L2 λ‖w‖₂² réduit tous les poids en douceur, mais rarement jusqu'à zéro.",
      ar: "لعقوبة L1 أي λ‖w‖₁ «زوايا» عند الصفر، لذا يقع الحل الأمثل عليها غالبًا فتصبح بعض الأوزان صفرًا. أما عقوبة L2 أي λ‖w‖₂² فتقلّص كل الأوزان بسلاسة لكن نادرًا ما توصلها إلى الصفر تمامًا."
    }
  },
  {
    id: "model-linreg-multicollinearity",
    concept: "linear-regression",
    difficulty: 2,
    q: {
      en: "Two input features are almost perfectly correlated. What typically happens to the OLS coefficients?",
      fr: "Deux variables d'entrée sont presque parfaitement corrélées. Qu'arrive-t-il en général aux coefficients des MCO ?",
      ar: "ميزتا إدخال مترابطتان ارتباطًا شبه تام. ماذا يحدث عادةً لمعاملات OLS؟"
    },
    options: {
      en: ["They become unstable: small data changes can swing them wildly", "They are both set to exactly zero", "The model's predictions become non-linear", "R² automatically drops to zero"],
      fr: ["Ils deviennent instables : un petit changement des données peut les faire varier énormément", "Ils sont tous deux mis exactement à zéro", "Les prédictions du modèle deviennent non linéaires", "Le R² tombe automatiquement à zéro"],
      ar: ["تصبح غير مستقرة: تغيير صغير في البيانات قد يغيّرها تغييرًا كبيرًا", "يُضبط كلاهما على الصفر تمامًا", "تصبح تنبؤات النموذج غير خطية", "ينخفض R² تلقائيًا إلى الصفر"]
    },
    answer: 0,
    explain: {
      en: "With multicollinearity XᵀX is nearly singular, so the model cannot tell the two features apart and their weights get huge variance. Ridge regularization adds a diagonal term that stabilizes them.",
      fr: "Avec la multicolinéarité, XᵀX est presque singulière : le modèle ne sait pas distinguer les deux variables et leurs poids ont une variance énorme. La régularisation Ridge ajoute un terme diagonal qui les stabilise.",
      ar: "مع التعدد الخطي (multicollinearity) تكون المصفوفة XᵀX شبه منفردة، فلا يستطيع النموذج التمييز بين الميزتين ويصبح تباين أوزانهما كبيرًا جدًا. يضيف تنظيم Ridge حدًا قطريًا يجعلها مستقرة."
    }
  },
  {
    id: "model-linreg-curved-residuals",
    concept: "linear-regression",
    difficulty: 3,
    q: {
      en: "A linear regression's residual plot shows a clear U-shaped pattern against one feature. What is the most sensible fix?",
      fr: "Le graphique des résidus d'une régression linéaire montre une nette forme en U par rapport à une variable. Quelle est la correction la plus sensée ?",
      ar: "يُظهر مخطط البواقي لانحدار خطي نمطًا واضحًا على شكل حرف U مقابل إحدى الميزات. ما الإصلاح الأكثر منطقية؟"
    },
    options: {
      en: ["Increase the regularization strength alpha", "Remove the intercept (fit_intercept=False)", "Collect more rows with the same features", "Add a non-linear term (e.g. the squared feature) or use a non-linear model"],
      fr: ["Augmenter la force de régularisation alpha", "Supprimer l'ordonnée à l'origine (fit_intercept=False)", "Collecter plus de lignes avec les mêmes variables", "Ajouter un terme non linéaire (par ex. la variable au carré) ou utiliser un modèle non linéaire"],
      ar: ["زيادة قوة التنظيم alpha", "حذف الحد الثابت (fit_intercept=False)", "جمع صفوف إضافية بالميزات نفسها", "إضافة حد غير خطي (مثل مربع الميزة) أو استخدام نموذج غير خطي"]
    },
    answer: 3,
    explain: {
      en: "A systematic curve in the residuals means the true relationship is not linear: the model is underfitting. More data or more regularization cannot fix a wrong functional form; a squared term or a non-linear model can.",
      fr: "Une courbe systématique dans les résidus signifie que la vraie relation n'est pas linéaire : le modèle sous-apprend. Plus de données ou plus de régularisation ne corrigent pas une mauvaise forme fonctionnelle ; un terme au carré ou un modèle non linéaire, si.",
      ar: "المنحنى المنتظم في البواقي يعني أن العلاقة الحقيقية ليست خطية، أي أن النموذج يعاني من نقص التخصيص (underfitting). لا تصلح البيانات الإضافية ولا التنظيم الأقوى شكلًا داليًا خاطئًا، بينما يصلحه حد تربيعي أو نموذج غير خطي."
    }
  },
  {
    id: "model-logreg-sigmoid",
    concept: "logistic-regression",
    difficulty: 1,
    q: {
      en: "Which function turns a binary logistic regression's linear score wᵀx + b into a probability?",
      fr: "Quelle fonction transforme le score linéaire wᵀx + b d'une régression logistique binaire en probabilité ?",
      ar: "ما الدالة التي تحوّل الدرجة الخطية wᵀx + b في الانحدار اللوجستي الثنائي إلى احتمال؟"
    },
    options: {
      en: ["ReLU", "The sigmoid", "A step function", "The hyperbolic tangent (tanh)"],
      fr: ["ReLU", "La sigmoïde", "Une fonction échelon", "La tangente hyperbolique (tanh)"],
      ar: ["ReLU", "الدالة السينية (sigmoid)", "دالة الدرجة (step function)", "الظل الزائدي (tanh)"]
    },
    answer: 1,
    explain: {
      en: "σ(z) = 1 / (1 + e^(−z)) squeezes any real score into (0, 1), so it can be read as P(Y=1|x). tanh outputs values in (−1, 1) and a step function gives no probabilities at all.",
      fr: "σ(z) = 1 / (1 + e^(−z)) ramène tout score réel dans (0, 1) : on peut le lire comme P(Y=1|x). tanh renvoie des valeurs dans (−1, 1) et une fonction échelon ne donne aucune probabilité.",
      ar: "الدالة σ(z) = 1 / (1 + e^(−z)) تضغط أي درجة حقيقية في المجال (0, 1)، فيمكن قراءتها على أنها P(Y=1|x). أما tanh فتعطي قيمًا في (−1, 1)، ودالة الدرجة لا تعطي احتمالات أصلًا."
    }
  },
  {
    id: "model-logreg-c-param",
    concept: "logistic-regression",
    difficulty: 1,
    q: {
      en: "In scikit-learn's LogisticRegression, what happens when you decrease C?",
      fr: "Dans LogisticRegression de scikit-learn, que se passe-t-il quand on diminue C ?",
      ar: "في LogisticRegression من scikit-learn، ماذا يحدث عندما تقلّل قيمة C؟"
    },
    options: {
      en: ["Regularization gets stronger and the coefficients shrink", "Regularization gets weaker and the coefficients grow", "The decision threshold moves from 0.5 to C", "The solver runs more iterations"],
      fr: ["La régularisation se renforce et les coefficients diminuent", "La régularisation s'affaiblit et les coefficients augmentent", "Le seuil de décision passe de 0.5 à C", "Le solveur effectue plus d'itérations"],
      ar: ["يصبح التنظيم أقوى وتتقلّص المعاملات", "يصبح التنظيم أضعف وتكبر المعاملات", "تنتقل عتبة القرار من 0.5 إلى C", "يُجري المحلّل (solver) عددًا أكبر من التكرارات"]
    },
    answer: 0,
    explain: {
      en: "C is the inverse of the regularization strength (C = 1/λ). A smaller C means a larger penalty on the weights, a simpler model and less risk of overfitting.",
      fr: "C est l'inverse de la force de régularisation (C = 1/λ). Un C plus petit signifie une pénalité plus forte sur les poids, un modèle plus simple et moins de risque de surapprentissage.",
      ar: "المعامل C هو مقلوب قوة التنظيم (C = 1/λ). كلما صغرت C زادت العقوبة على الأوزان وأصبح النموذج أبسط وقلّ خطر الإفراط في التخصيص (overfitting)."
    }
  },
  {
    id: "model-logreg-odds-ratio",
    concept: "logistic-regression",
    difficulty: 3,
    q: {
      en: "A churn model is a logistic regression with coefficient w = 0.7 on the binary feature has_premium. Holding everything else fixed, how do the odds of churn change when has_premium goes from 0 to 1?",
      fr: "Un modèle d'attrition est une régression logistique avec un coefficient w = 0.7 sur la variable binaire has_premium. Toutes choses égales par ailleurs, comment évoluent les cotes (odds) d'attrition quand has_premium passe de 0 à 1 ?",
      ar: "نموذج لتوقّع مغادرة العملاء (churn) هو انحدار لوجستي بمعامل w = 0.7 للميزة الثنائية has_premium. مع تثبيت كل شيء آخر، كيف تتغير احتمالية الأرجحية (odds) للمغادرة عندما تنتقل has_premium من 0 إلى 1؟"
    },
    options: {
      en: ["They rise by 0.7 percentage points", "The churn probability rises by 70%", "They are multiplied by e^0.7 ≈ 2.01", "They are multiplied by 0.7"],
      fr: ["Elles augmentent de 0.7 point de pourcentage", "La probabilité d'attrition augmente de 70 %", "Elles sont multipliées par e^0.7 ≈ 2.01", "Elles sont multipliées par 0.7"],
      ar: ["تزداد بمقدار 0.7 نقطة مئوية", "يزداد احتمال المغادرة بنسبة 70%", "تُضرب في e^0.7 ≈ 2.01", "تُضرب في 0.7"]
    },
    answer: 2,
    explain: {
      en: "Logistic regression is linear in the log-odds: a +1 change in the feature adds 0.7 to log-odds, which multiplies the odds by e^0.7 ≈ 2.01. The change in probability itself depends on where you start.",
      fr: "La régression logistique est linéaire dans le log des cotes : +1 sur la variable ajoute 0.7 au log-odds, ce qui multiplie les cotes par e^0.7 ≈ 2.01. La variation de probabilité, elle, dépend du point de départ.",
      ar: "الانحدار اللوجستي خطي في لوغاريتم الأرجحية (log-odds): زيادة الميزة بمقدار 1 تضيف 0.7 إلى log-odds، أي تضرب الأرجحية في e^0.7 ≈ 2.01. أما التغير في الاحتمال نفسه فيعتمد على نقطة البداية."
    }
  },
  {
    id: "model-tree-split-criterion",
    concept: "decision-tree",
    difficulty: 1,
    q: {
      en: "Which measure does a CART classification tree typically use to choose its splits?",
      fr: "Quelle mesure un arbre de classification CART utilise-t-il généralement pour choisir ses divisions ?",
      ar: "ما المقياس الذي تستخدمه عادةً شجرة القرار التصنيفية من نوع CART لاختيار تقسيماتها؟"
    },
    options: {
      en: ["Gini impurity (or entropy)", "The silhouette score", "The distance to the nearest centroid", "The size of the regression coefficients"],
      fr: ["L'impureté de Gini (ou l'entropie)", "Le score de silhouette", "La distance au centroïde le plus proche", "La taille des coefficients de régression"],
      ar: ["شوائب جيني (Gini impurity) أو الإنتروبيا", "معامل الصورة الظلية (silhouette)", "المسافة إلى أقرب مركز", "حجم معاملات الانحدار"]
    },
    answer: 0,
    explain: {
      en: "At each node the tree tries features and thresholds and keeps the split that most reduces impurity (Gini or entropy), i.e. maximizes information gain.",
      fr: "À chaque nœud, l'arbre essaie des variables et des seuils et garde la division qui réduit le plus l'impureté (Gini ou entropie), c'est-à-dire qui maximise le gain d'information.",
      ar: "في كل عقدة تجرّب الشجرة ميزات وعتبات مختلفة وتحتفظ بالتقسيم الذي يقلّل الشوائب (Gini أو الإنتروبيا) أكثر من غيره، أي الذي يعظّم كسب المعلومات (information gain)."
    }
  },
  {
    id: "model-tree-gini-calc",
    concept: "decision-tree",
    difficulty: 3,
    q: {
      en: "A node holds 8 samples: 6 of class A and 2 of class B. What is its Gini impurity?",
      fr: "Un nœud contient 8 exemples : 6 de la classe A et 2 de la classe B. Quelle est son impureté de Gini ?",
      ar: "تحتوي عقدة على 8 عيّنات: 6 من الفئة A و2 من الفئة B. ما قيمة شوائب جيني (Gini) فيها؟"
    },
    options: {
      en: ["0.25", "0.375", "0.5", "0.625"],
      fr: ["0.25", "0.375", "0.5", "0.625"],
      ar: ["0.25", "0.375", "0.5", "0.625"]
    },
    answer: 1,
    explain: {
      en: "G = 1 − Σpᵢ² with p_A = 6/8 = 0.75 and p_B = 0.25: G = 1 − (0.5625 + 0.0625) = 0.375. A pure node has G = 0; a 50/50 node has G = 0.5.",
      fr: "G = 1 − Σpᵢ² avec p_A = 6/8 = 0.75 et p_B = 0.25 : G = 1 − (0.5625 + 0.0625) = 0.375. Un nœud pur a G = 0 ; un nœud 50/50 a G = 0.5.",
      ar: "G = 1 − Σpᵢ² حيث p_A = 6/8 = 0.75 وp_B = 0.25، إذن G = 1 − (0.5625 + 0.0625) = 0.375. العقدة النقية لها G = 0، والعقدة المتوازنة 50/50 لها G = 0.5."
    }
  },
  {
    id: "model-tree-overfitting",
    concept: "decision-tree",
    difficulty: 2,
    q: {
      en: "Why does an unrestricted decision tree (no max_depth, no pruning) tend to overfit?",
      fr: "Pourquoi un arbre de décision sans contrainte (pas de max_depth, pas d'élagage) a-t-il tendance à surapprendre ?",
      ar: "لماذا تميل شجرة القرار غير المقيّدة (دون max_depth ودون تقليم) إلى الإفراط في التخصيص (overfitting)؟"
    },
    options: {
      en: ["It can only draw a single straight decision boundary", "It needs scaled features and gets confused without them", "It keeps splitting until leaves are pure, memorizing noise in the training data", "It averages too many models together"],
      fr: ["Il ne peut tracer qu'une seule frontière de décision droite", "Il a besoin de variables mises à l'échelle et se trompe sans elles", "Il continue de diviser jusqu'à des feuilles pures et mémorise le bruit des données d'entraînement", "Il moyenne trop de modèles ensemble"],
      ar: ["لا تستطيع رسم سوى حدّ قرار مستقيم واحد", "تحتاج إلى ميزات مقيّسة وتخطئ بدونها", "تستمر في التقسيم حتى تصبح الأوراق نقية، فتحفظ الضجيج الموجود في بيانات التدريب", "تحسب متوسط عدد كبير جدًا من النماذج"]
    },
    answer: 2,
    explain: {
      en: "A deep tree can carve out a leaf for almost every training point, so training error goes to zero while the rules reflect noise. Limiting max_depth or min_samples_leaf, or pruning, reduces this high variance.",
      fr: "Un arbre profond peut créer une feuille pour presque chaque point d'entraînement : l'erreur d'entraînement tombe à zéro, mais les règles reflètent du bruit. Limiter max_depth ou min_samples_leaf, ou élaguer, réduit cette forte variance.",
      ar: "يمكن للشجرة العميقة أن تخصّص ورقة لكل نقطة تدريب تقريبًا، فيصبح خطأ التدريب صفرًا بينما تعكس القواعد الضجيج. تقييد max_depth أو min_samples_leaf أو التقليم يقلّل هذا التباين العالي."
    }
  },
  {
    id: "model-tree-extrapolation",
    concept: "decision-tree",
    difficulty: 2,
    q: {
      en: "A decision tree regressor was trained on houses priced between $100K and $900K. It is asked about a mansion whose features are far beyond anything in training. What will it predict?",
      fr: "Un arbre de régression a été entraîné sur des maisons valant entre 100 K$ et 900 K$. On l'interroge sur un manoir dont les caractéristiques dépassent largement les données d'entraînement. Que va-t-il prédire ?",
      ar: "دُرّبت شجرة قرار للانحدار على منازل تتراوح أسعارها بين 100 ألف و900 ألف دولار. ثم سُئلت عن قصر تتجاوز ميزاته كثيرًا كل ما في بيانات التدريب. بماذا ستتنبأ؟"
    },
    options: {
      en: ["A price extrapolated above $900K along the trend", "An error, because the input is out of range", "A negative price", "At most roughly the value of one of its leaves, i.e. no more than about $900K"],
      fr: ["Un prix extrapolé au-delà de 900 K$ en suivant la tendance", "Une erreur, car l'entrée est hors plage", "Un prix négatif", "Au plus environ la valeur d'une de ses feuilles, donc pas plus d'environ 900 K$"],
      ar: ["سعرًا مستقرَأً فوق 900 ألف دولار باتباع الاتجاه", "خطأً، لأن المدخل خارج النطاق", "سعرًا سالبًا", "على الأكثر قيمة إحدى أوراقها تقريبًا، أي ليس أكثر من نحو 900 ألف دولار"]
    },
    answer: 3,
    explain: {
      en: "A tree prediction is the average target of the leaf the point lands in, so it is a step function bounded by the training targets. Trees (and forests) cannot extrapolate trends.",
      fr: "La prédiction d'un arbre est la moyenne de la cible dans la feuille atteinte : c'est une fonction en escalier bornée par les cibles d'entraînement. Les arbres (et les forêts) ne savent pas extrapoler une tendance.",
      ar: "تنبؤ الشجرة هو متوسط الهدف في الورقة التي تقع فيها النقطة، فهو دالة درجية محصورة بقيم أهداف التدريب. لا تستطيع الأشجار (ولا الغابات) استقراء الاتجاهات."
    }
  },
  {
    id: "model-rf-randomness",
    concept: "random-forest",
    difficulty: 1,
    q: {
      en: "Which two sources of randomness make the trees of a random forest different from each other?",
      fr: "Quelles sont les deux sources d'aléa qui rendent les arbres d'une forêt aléatoire différents les uns des autres ?",
      ar: "ما مصدرا العشوائية اللذان يجعلان أشجار الغابة العشوائية (random forest) مختلفة عن بعضها؟"
    },
    options: {
      en: ["Random learning rates and random tree depths", "Bootstrap samples of the rows and a random subset of features at each split", "Randomly shuffled labels and random initial weights", "A random loss function per tree and random pruning"],
      fr: ["Des taux d'apprentissage et des profondeurs d'arbre aléatoires", "Des échantillons bootstrap des lignes et un sous-ensemble aléatoire de variables à chaque division", "Des étiquettes mélangées au hasard et des poids initiaux aléatoires", "Une fonction de perte aléatoire par arbre et un élagage aléatoire"],
      ar: ["معدلات تعلّم عشوائية وأعماق أشجار عشوائية", "عيّنات bootstrap من الصفوف ومجموعة فرعية عشوائية من الميزات عند كل تقسيم", "تسميات مخلوطة عشوائيًا وأوزان ابتدائية عشوائية", "دالة خسارة عشوائية لكل شجرة وتقليم عشوائي"]
    },
    answer: 1,
    explain: {
      en: "Each tree sees a bootstrap sample (rows drawn with replacement) and, at every split, only max_features randomly chosen features. Both make the trees less correlated, so averaging them cancels more of their errors.",
      fr: "Chaque arbre voit un échantillon bootstrap (lignes tirées avec remise) et, à chaque division, seulement max_features variables tirées au hasard. Les deux décorrèlent les arbres, si bien que leur moyenne annule davantage d'erreurs.",
      ar: "ترى كل شجرة عيّنة bootstrap (صفوفًا مسحوبة مع الإرجاع)، ولا ترى عند كل تقسيم إلا max_features ميزة مختارة عشوائيًا. كلا الأمرين يقلّل الارتباط بين الأشجار، فيُلغي متوسطها جزءًا أكبر من أخطائها."
    }
  },
  {
    id: "model-rf-more-trees",
    concept: "random-forest",
    difficulty: 2,
    q: {
      en: "Why does increasing n_estimators in a random forest rarely make it overfit?",
      fr: "Pourquoi augmenter n_estimators dans une forêt aléatoire la fait-il rarement surapprendre ?",
      ar: "لماذا نادرًا ما تؤدي زيادة n_estimators في الغابة العشوائية إلى الإفراط في التخصيص؟"
    },
    options: {
      en: ["Each new tree corrects the mistakes of the previous ones", "More trees automatically make each tree shallower", "Extra trees are trained only on the validation set", "Averaging more independent-ish trees only reduces variance; the error levels off instead of rising"],
      fr: ["Chaque nouvel arbre corrige les erreurs des précédents", "Plus d'arbres rend automatiquement chaque arbre moins profond", "Les arbres supplémentaires sont entraînés uniquement sur le jeu de validation", "Moyenner davantage d'arbres peu corrélés ne fait que réduire la variance ; l'erreur se stabilise au lieu d'augmenter"],
      ar: ["كل شجرة جديدة تصحّح أخطاء الأشجار السابقة", "زيادة الأشجار تجعل كل شجرة أقل عمقًا تلقائيًا", "تُدرَّب الأشجار الإضافية على مجموعة التحقق فقط", "حساب متوسط عدد أكبر من الأشجار شبه المستقلة يقلّل التباين فقط، فيستقر الخطأ بدل أن يرتفع"]
    },
    answer: 3,
    explain: {
      en: "Trees in a forest are trained independently and averaged: Var = ρσ² + (1 − ρ)σ²/B, so a larger B only shrinks the second term. Correcting previous mistakes is boosting, which can overfit with too many rounds.",
      fr: "Les arbres d'une forêt sont entraînés indépendamment puis moyennés : Var = ρσ² + (1 − ρ)σ²/B, donc un B plus grand ne fait que réduire le second terme. Corriger les erreurs précédentes, c'est le boosting, qui peut surapprendre avec trop d'itérations.",
      ar: "تُدرَّب أشجار الغابة باستقلال ثم يؤخذ متوسطها: Var = ρσ² + (1 − ρ)σ²/B، فزيادة B لا تفعل سوى تقليص الحد الثاني. أما تصحيح الأخطاء السابقة فهو التعزيز (boosting)، الذي قد يفرط في التخصيص مع كثرة الجولات."
    }
  },
  {
    id: "model-rf-max-features",
    concept: "random-forest",
    difficulty: 2,
    q: {
      en: "What is the main effect of lowering max_features (the number of features tried at each split) in a random forest?",
      fr: "Quel est l'effet principal d'une baisse de max_features (le nombre de variables testées à chaque division) dans une forêt aléatoire ?",
      ar: "ما الأثر الرئيسي لتقليل max_features (عدد الميزات التي تُجرَّب عند كل تقسيم) في الغابة العشوائية؟"
    },
    options: {
      en: ["Trees become more different from each other, which lowers the variance of the average", "The forest builds more trees", "Each tree becomes deeper", "The forest turns into a boosting model"],
      fr: ["Les arbres deviennent plus différents les uns des autres, ce qui réduit la variance de la moyenne", "La forêt construit plus d'arbres", "Chaque arbre devient plus profond", "La forêt se transforme en modèle de boosting"],
      ar: ["تصبح الأشجار أكثر اختلافًا عن بعضها، مما يخفض تباين المتوسط", "تبني الغابة عددًا أكبر من الأشجار", "تصبح كل شجرة أعمق", "تتحول الغابة إلى نموذج تعزيز"]
    },
    answer: 0,
    explain: {
      en: "If every split can use the single strongest feature, all trees look alike (high correlation ρ). Restricting the candidates decorrelates them, so averaging removes more variance, at the cost of slightly weaker individual trees.",
      fr: "Si chaque division peut utiliser la variable la plus forte, tous les arbres se ressemblent (corrélation ρ élevée). Restreindre les candidates les décorrèle : la moyenne retire plus de variance, au prix d'arbres individuels un peu plus faibles.",
      ar: "إذا استطاع كل تقسيم استخدام أقوى ميزة، تتشابه الأشجار كلها (ارتباط ρ مرتفع). تقييد الميزات المرشّحة يقلّل الارتباط بينها، فيزيل المتوسط تباينًا أكبر، مقابل أشجار فردية أضعف قليلًا."
    }
  },
  {
    id: "model-rf-baseline-choice",
    concept: "random-forest",
    difficulty: 2,
    q: {
      en: "You need a strong first classifier on a tabular dataset whose features have very different units (age, income, counts) and you have almost no time for preprocessing or tuning. Which is the best first pick?",
      fr: "Il vous faut un premier classifieur solide sur des données tabulaires dont les variables ont des unités très différentes (âge, revenu, comptages), et vous n'avez presque pas de temps pour le prétraitement ni le réglage. Quel est le meilleur premier choix ?",
      ar: "تحتاج إلى مصنِّف أولي قوي على بيانات جدولية ميزاتها بوحدات مختلفة جدًا (العمر، الدخل، أعداد)، ولا وقت لديك تقريبًا للمعالجة المسبقة أو الضبط. ما أفضل خيار أول؟"
    },
    options: {
      en: ["k-NN on the raw, unscaled features", "An RBF-kernel SVM on the raw features", "A random forest with default settings", "A single unpruned decision tree"],
      fr: ["Un k-NN sur les variables brutes non mises à l'échelle", "Un SVM à noyau RBF sur les variables brutes", "Une forêt aléatoire avec les réglages par défaut", "Un seul arbre de décision non élagué"],
      ar: ["k-NN على الميزات الخام دون تقييس", "SVM بنواة RBF على الميزات الخام", "غابة عشوائية بالإعدادات الافتراضية", "شجرة قرار واحدة دون تقليم"]
    },
    answer: 2,
    explain: {
      en: "Random forests are insensitive to feature scale, handle non-linear interactions and work well with defaults. k-NN and RBF SVMs rely on distances, so unscaled features break them; a single deep tree overfits.",
      fr: "Les forêts aléatoires sont insensibles à l'échelle des variables, gèrent les interactions non linéaires et marchent bien avec les réglages par défaut. k-NN et le SVM RBF reposent sur des distances, que des variables non mises à l'échelle faussent ; un arbre profond seul surapprend.",
      ar: "لا تتأثر الغابات العشوائية بمقياس الميزات، وتتعامل مع التفاعلات غير الخطية، وتعمل جيدًا بالإعدادات الافتراضية. يعتمد k-NN وSVM بنواة RBF على المسافات، فتفسدهما الميزات غير المقيّسة، والشجرة العميقة المنفردة تفرط في التخصيص."
    }
  },
  {
    id: "model-gb-sequential",
    concept: "gradient-boosting",
    difficulty: 1,
    q: {
      en: "How does gradient boosting build its ensemble of trees?",
      fr: "Comment le gradient boosting construit-il son ensemble d'arbres ?",
      ar: "كيف يبني التعزيز التدرّجي (gradient boosting) مجموعته من الأشجار؟"
    },
    options: {
      en: ["In parallel: each tree is trained independently on a bootstrap sample", "By growing one very deep tree and pruning it", "Sequentially: each new shallow tree is fitted to the errors (negative gradients) of the current ensemble", "By clustering the data and fitting one tree per cluster"],
      fr: ["En parallèle : chaque arbre est entraîné indépendamment sur un échantillon bootstrap", "En faisant pousser un seul arbre très profond puis en l'élaguant", "Séquentiellement : chaque nouvel arbre peu profond est ajusté aux erreurs (gradients négatifs) de l'ensemble actuel", "En regroupant les données et en ajustant un arbre par groupe"],
      ar: ["بالتوازي: تُدرَّب كل شجرة باستقلال على عيّنة bootstrap", "بتنمية شجرة واحدة عميقة جدًا ثم تقليمها", "بالتتابع: تُدرَّب كل شجرة ضحلة جديدة على أخطاء المجموعة الحالية (التدرجات السالبة)", "بتجميع البيانات في عناقيد وتدريب شجرة لكل عنقود"]
    },
    answer: 2,
    explain: {
      en: "Boosting adds trees one after another: F_m = F_{m−1} + η·h_m, where h_m fits the pseudo-residuals of the model so far. Independent trees on bootstrap samples describe bagging (random forests).",
      fr: "Le boosting ajoute les arbres l'un après l'autre : F_m = F_{m−1} + η·h_m, où h_m s'ajuste aux pseudo-résidus du modèle courant. Des arbres indépendants sur des échantillons bootstrap, c'est le bagging (forêts aléatoires).",
      ar: "يضيف التعزيز الأشجار واحدة تلو الأخرى: F_m = F_{m−1} + η·h_m، حيث تتعلم h_m البواقي الزائفة (pseudo-residuals) للنموذج الحالي. أما الأشجار المستقلة على عيّنات bootstrap فهي التجميع بالحقيبة (bagging) أي الغابات العشوائية."
    }
  },
  {
    id: "model-gb-learning-rate-trees",
    concept: "gradient-boosting",
    difficulty: 2,
    q: {
      en: "You halve the learning_rate of a gradient boosting model. What usually has to change to reach a similar fit?",
      fr: "Vous divisez par deux le learning_rate d'un modèle de gradient boosting. Que faut-il en général modifier pour obtenir un ajustement similaire ?",
      ar: "خفّضت learning_rate لنموذج تعزيز تدرّجي إلى النصف. ما الذي يجب تغييره عادةً للوصول إلى ملاءمة مماثلة؟"
    },
    options: {
      en: ["Decrease n_estimators", "Increase n_estimators, roughly doubling it", "Set max_depth to a very large value", "Nothing, the learning rate has no effect on the fit"],
      fr: ["Diminuer n_estimators", "Augmenter n_estimators, en le doublant environ", "Fixer max_depth à une très grande valeur", "Rien, le taux d'apprentissage n'a aucun effet sur l'ajustement"],
      ar: ["تقليل n_estimators", "زيادة n_estimators، بمضاعفتها تقريبًا", "ضبط max_depth على قيمة كبيرة جدًا", "لا شيء، فمعدل التعلم لا يؤثر في الملاءمة"]
    },
    answer: 1,
    explain: {
      en: "Each tree's contribution is multiplied by the learning rate, so smaller steps need more of them to cover the same distance. Small learning rates with more trees (plus early stopping) usually generalize better.",
      fr: "La contribution de chaque arbre est multipliée par le taux d'apprentissage : avec des pas plus petits, il en faut davantage pour parcourir la même distance. Un petit taux avec plus d'arbres (et un arrêt précoce) généralise souvent mieux.",
      ar: "تُضرب مساهمة كل شجرة في معدل التعلم، فالخطوات الأصغر تحتاج عددًا أكبر منها لقطع المسافة نفسها. وغالبًا ما يعمّم معدل تعلم صغير مع أشجار أكثر (مع الإيقاف المبكر) بشكل أفضل."
    }
  },
  {
    id: "model-gb-pseudo-residual",
    concept: "gradient-boosting",
    difficulty: 3,
    q: {
      en: "With squared-error loss L = ½(y − F)², a sample has y = 14 and the current ensemble predicts F = 10. What pseudo-residual will the next tree try to fit for this sample?",
      fr: "Avec la perte quadratique L = ½(y − F)², un exemple a y = 14 et l'ensemble actuel prédit F = 10. Quel pseudo-résidu le prochain arbre va-t-il chercher à ajuster pour cet exemple ?",
      ar: "مع خسارة الخطأ التربيعي L = ½(y − F)²، لدينا عيّنة قيمتها y = 14 والمجموعة الحالية تتنبأ بـ F = 10. ما الباقي الزائف الذي ستحاول الشجرة التالية تعلّمه لهذه العيّنة؟"
    },
    options: {
      en: ["4", "−4", "16", "8"],
      fr: ["4", "−4", "16", "8"],
      ar: ["4", "−4", "16", "8"]
    },
    answer: 0,
    explain: {
      en: "The pseudo-residual is the negative gradient: −∂L/∂F = y − F = 14 − 10 = 4. For squared error it is just the ordinary residual, which is why boosting is described as \"fitting the residuals\".",
      fr: "Le pseudo-résidu est le gradient négatif : −∂L/∂F = y − F = 14 − 10 = 4. Pour la perte quadratique, c'est simplement le résidu ordinaire, d'où l'idée que le boosting « ajuste les résidus ».",
      ar: "الباقي الزائف هو التدرج السالب: −∂L/∂F = y − F = 14 − 10 = 4. في حالة الخطأ التربيعي هو الباقي العادي نفسه، ولهذا يوصف التعزيز بأنه «يتعلم البواقي»."
    }
  },
  {
    id: "model-xgb-second-order",
    concept: "xgboost",
    difficulty: 1,
    q: {
      en: "Besides the gradient, what does XGBoost use from the loss function to build each tree?",
      fr: "En plus du gradient, qu'utilise XGBoost de la fonction de perte pour construire chaque arbre ?",
      ar: "إلى جانب التدرج، ماذا يستخدم XGBoost من دالة الخسارة لبناء كل شجرة؟"
    },
    options: {
      en: ["The labels of the test set", "The support vectors", "The silhouette of each leaf", "The second derivative (Hessian)"],
      fr: ["Les étiquettes du jeu de test", "Les vecteurs de support", "La silhouette de chaque feuille", "La dérivée seconde (hessienne)"],
      ar: ["تسميات مجموعة الاختبار", "متجهات الدعم", "الصورة الظلية لكل ورقة", "المشتقة الثانية (Hessian)"]
    },
    answer: 3,
    explain: {
      en: "XGBoost uses a second-order Taylor expansion of the loss with gradients gᵢ and Hessians hᵢ. This gives a closed-form optimal weight for each leaf, w* = −Σg / (Σh + λ), and a precise split-gain formula.",
      fr: "XGBoost utilise un développement de Taylor d'ordre 2 de la perte, avec les gradients gᵢ et les hessiennes hᵢ. On obtient un poids optimal analytique pour chaque feuille, w* = −Σg / (Σh + λ), et une formule précise de gain de division.",
      ar: "يستخدم XGBoost مفكوك تايلور من الرتبة الثانية للخسارة بالتدرجات gᵢ والمشتقات الثانية hᵢ. يعطي ذلك وزنًا أمثل مغلق الصيغة لكل ورقة w* = −Σg / (Σh + λ) وصيغة دقيقة لكسب التقسيم."
    }
  },
  {
    id: "model-xgb-missing-values",
    concept: "xgboost",
    difficulty: 1,
    q: {
      en: "How does XGBoost deal with missing feature values during training?",
      fr: "Comment XGBoost gère-t-il les valeurs manquantes des variables pendant l'entraînement ?",
      ar: "كيف يتعامل XGBoost مع القيم المفقودة في الميزات أثناء التدريب؟"
    },
    options: {
      en: ["It refuses to train until you impute them", "It learns a default branch at each split for rows where the value is missing", "It silently drops every row that has a missing value", "It always replaces them with the column mean"],
      fr: ["Il refuse de s'entraîner tant qu'on ne les a pas imputées", "Il apprend, à chaque division, une branche par défaut pour les lignes dont la valeur manque", "Il supprime silencieusement toute ligne avec une valeur manquante", "Il les remplace toujours par la moyenne de la colonne"],
      ar: ["يرفض التدريب حتى تملأها بالتعويض (imputation)", "يتعلم عند كل تقسيم فرعًا افتراضيًا للصفوف التي تنقصها القيمة", "يحذف بصمت كل صف فيه قيمة مفقودة", "يستبدلها دائمًا بمتوسط العمود"]
    },
    answer: 1,
    explain: {
      en: "Its sparsity-aware split finding tries sending missing values left and right and keeps the direction with the better gain. Missingness can then carry signal instead of being destroyed by imputation.",
      fr: "Sa recherche de divisions adaptée à la parcimonie essaie d'envoyer les valeurs manquantes à gauche puis à droite et garde la direction au meilleur gain. L'absence de valeur peut ainsi porter de l'information au lieu d'être effacée par l'imputation.",
      ar: "تجرّب آلية البحث عن التقسيمات المراعية للتشتت (sparsity-aware) إرسال القيم المفقودة يسارًا ثم يمينًا وتحتفظ بالاتجاه ذي الكسب الأفضل. وهكذا يمكن أن يحمل غياب القيمة معلومة بدل أن يمحوها التعويض."
    }
  },
  {
    id: "model-xgb-early-stopping",
    concept: "xgboost",
    difficulty: 2,
    q: {
      en: "An XGBoost model's training loss keeps falling, but its validation loss bottomed out at round 300 and has risen since. What is the best action?",
      fr: "La perte d'entraînement d'un modèle XGBoost continue de baisser, mais sa perte de validation a atteint son minimum à l'itération 300 et remonte depuis. Quelle est la meilleure action ?",
      ar: "خسارة التدريب لنموذج XGBoost مستمرة في الانخفاض، لكن خسارة التحقق بلغت أدناها عند الجولة 300 ثم أخذت ترتفع. ما أفضل إجراء؟"
    },
    options: {
      en: ["Use early stopping to keep the model from around round 300 (and consider a lower learning rate)", "Train for more rounds until validation loss comes back down", "Increase max_depth so each tree can learn more", "Set reg_lambda to 0 to remove regularization"],
      fr: ["Utiliser l'arrêt précoce pour garder le modèle vers l'itération 300 (et envisager un taux d'apprentissage plus faible)", "Entraîner plus longtemps jusqu'à ce que la perte de validation redescende", "Augmenter max_depth pour que chaque arbre apprenne davantage", "Mettre reg_lambda à 0 pour supprimer la régularisation"],
      ar: ["استخدام الإيقاف المبكر (early stopping) للاحتفاظ بالنموذج عند الجولة 300 تقريبًا (مع التفكير في معدل تعلم أصغر)", "التدريب لجولات أكثر حتى تعود خسارة التحقق إلى الانخفاض", "زيادة max_depth لتتعلم كل شجرة أكثر", "ضبط reg_lambda على 0 لإزالة التنظيم"]
    },
    answer: 0,
    explain: {
      en: "Diverging train and validation curves are the classic sign of overfitting: later trees fit noise. Early stopping keeps the best validation round; deeper trees or less regularization would make it worse.",
      fr: "Des courbes d'entraînement et de validation qui divergent sont le signe classique du surapprentissage : les derniers arbres ajustent du bruit. L'arrêt précoce garde la meilleure itération en validation ; des arbres plus profonds ou moins de régularisation aggraveraient le problème.",
      ar: "تباعد منحنيي التدريب والتحقق هو العلامة الكلاسيكية للإفراط في التخصيص: الأشجار المتأخرة تتعلم الضجيج. يحتفظ الإيقاف المبكر بأفضل جولة على مجموعة التحقق، أما الأشجار الأعمق أو التنظيم الأضعف فسيزيدان المشكلة سوءًا."
    }
  },
  {
    id: "model-lgbm-leaf-wise",
    concept: "lightgbm",
    difficulty: 1,
    q: {
      en: "How does LightGBM grow its trees by default?",
      fr: "Comment LightGBM fait-il pousser ses arbres par défaut ?",
      ar: "كيف ينمّي LightGBM أشجاره افتراضيًا؟"
    },
    options: {
      en: ["Level-wise: it splits every node of a level before going deeper", "Symmetrically: the same split is used across a whole level", "Leaf-wise: it always splits the leaf with the largest loss reduction", "Randomly: it picks a random leaf to split"],
      fr: ["Niveau par niveau : il divise tous les nœuds d'un niveau avant de descendre", "Symétriquement : la même division est utilisée sur tout un niveau", "Feuille par feuille : il divise toujours la feuille qui réduit le plus la perte", "Au hasard : il choisit une feuille aléatoire à diviser"],
      ar: ["مستوًى مستوًى (level-wise): يقسم كل عقد المستوى قبل النزول أعمق", "بشكل متماثل: يُستخدم التقسيم نفسه على مستوى كامل", "ورقةً ورقة (leaf-wise): يقسم دائمًا الورقة التي تحقق أكبر خفض في الخسارة", "عشوائيًا: يختار ورقة عشوائية لتقسيمها"]
    },
    answer: 2,
    explain: {
      en: "Leaf-wise (best-first) growth reaches a lower loss with the same number of leaves, which is fast and accurate on big data but can produce deep, overfitting trees on small data. Symmetric trees are CatBoost's approach.",
      fr: "La croissance feuille par feuille (best-first) atteint une perte plus faible pour un même nombre de feuilles : rapide et précis sur de gros volumes, mais elle peut produire des arbres profonds qui surapprennent sur de petits jeux. Les arbres symétriques, c'est l'approche de CatBoost.",
      ar: "النمو ورقةً ورقة (الأفضل أولًا) يصل إلى خسارة أقل بعدد الأوراق نفسه، وهو سريع ودقيق على البيانات الكبيرة، لكنه قد ينتج أشجارًا عميقة تفرط في التخصيص على البيانات الصغيرة. أما الأشجار المتماثلة فهي نهج CatBoost."
    }
  },
  {
    id: "model-lgbm-histograms",
    concept: "lightgbm",
    difficulty: 2,
    q: {
      en: "What is the main reason LightGBM trains fast on large datasets?",
      fr: "Quelle est la principale raison pour laquelle LightGBM s'entraîne vite sur de grands jeux de données ?",
      ar: "ما السبب الرئيسي لسرعة تدريب LightGBM على مجموعات البيانات الكبيرة؟"
    },
    options: {
      en: ["It buckets features into histograms (~255 bins) and only evaluates bin edges as split points", "It always builds fewer trees than other libraries", "It skips computing gradients", "It trains each tree on a single feature"],
      fr: ["Il regroupe les variables en histogrammes (~255 classes) et n'évalue que les bornes des classes comme seuils", "Il construit toujours moins d'arbres que les autres bibliothèques", "Il ne calcule pas les gradients", "Il entraîne chaque arbre sur une seule variable"],
      ar: ["يجمّع الميزات في مدرّجات تكرارية (~255 فئة) ولا يقيّم إلا حدود الفئات كنقاط تقسيم", "يبني دائمًا أشجارًا أقل من المكتبات الأخرى", "يتخطّى حساب التدرجات", "يدرّب كل شجرة على ميزة واحدة فقط"]
    },
    answer: 0,
    explain: {
      en: "Split search costs O(#bins) instead of O(#rows) per feature, and histograms use little memory. GOSS (sampling small-gradient rows) and EFB (bundling sparse features) speed it up further.",
      fr: "La recherche de division coûte O(#classes) au lieu de O(#lignes) par variable, et les histogrammes consomment peu de mémoire. GOSS (échantillonnage des lignes à petit gradient) et EFB (regroupement des variables creuses) accélèrent encore.",
      ar: "يصبح البحث عن التقسيم بكلفة O(#bins) بدل O(#rows) لكل ميزة، والمدرّجات تستهلك ذاكرة قليلة. ويزيد GOSS (أخذ عيّنات من الصفوف ذات التدرج الصغير) وEFB (حزم الميزات المتناثرة) السرعة أكثر."
    }
  },
  {
    id: "model-lgbm-small-data",
    concept: "lightgbm",
    difficulty: 2,
    q: {
      en: "LightGBM overfits badly on a dataset of 1,500 rows. Which change is most likely to help?",
      fr: "LightGBM surapprend fortement sur un jeu de 1 500 lignes. Quel changement a le plus de chances d'aider ?",
      ar: "يفرط LightGBM في التخصيص بشدة على مجموعة بيانات من 1,500 صف. أي تغيير هو الأرجح أن يساعد؟"
    },
    options: {
      en: ["Raise num_leaves to 1024", "Lower num_leaves and set a max_depth limit (and/or raise min_data_in_leaf)", "Raise the learning_rate", "Set feature_fraction to 1.0 so every tree sees every feature"],
      fr: ["Monter num_leaves à 1024", "Réduire num_leaves et fixer une limite max_depth (et/ou augmenter min_data_in_leaf)", "Augmenter le learning_rate", "Mettre feature_fraction à 1.0 pour que chaque arbre voie toutes les variables"],
      ar: ["رفع num_leaves إلى 1024", "تقليل num_leaves وتحديد max_depth (و/أو رفع min_data_in_leaf)", "رفع learning_rate", "ضبط feature_fraction على 1.0 لترى كل شجرة جميع الميزات"]
    },
    answer: 1,
    explain: {
      en: "Leaf-wise growth with many leaves lets trees become very deep on small data. Fewer leaves, a depth cap and larger minimum leaf sizes constrain complexity; the other options add capacity or remove helpful randomness.",
      fr: "La croissance feuille par feuille avec beaucoup de feuilles rend les arbres très profonds sur peu de données. Moins de feuilles, une profondeur plafonnée et des feuilles plus grandes limitent la complexité ; les autres options ajoutent de la capacité ou retirent de l'aléa.",
      ar: "النمو ورقةً ورقة مع أوراق كثيرة يجعل الأشجار عميقة جدًا على البيانات الصغيرة. تقليل الأوراق وتحديد العمق ورفع الحد الأدنى لحجم الورقة يقيّد التعقيد، أما الخيارات الأخرى فتزيد السعة أو تزيل العشوائية."
    }
  },
  {
    id: "model-catboost-strength",
    concept: "catboost",
    difficulty: 1,
    q: {
      en: "What is CatBoost best known for?",
      fr: "Pour quoi CatBoost est-il surtout connu ?",
      ar: "بماذا يشتهر CatBoost أكثر من غيره؟"
    },
    options: {
      en: ["Being a clustering algorithm for categorical data", "Training convolutional networks on images", "Having no hyperparameters at all", "Handling categorical features natively with ordered target statistics"],
      fr: ["Être un algorithme de clustering pour données catégorielles", "Entraîner des réseaux convolutifs sur des images", "N'avoir aucun hyperparamètre", "Gérer nativement les variables catégorielles grâce aux statistiques de cible ordonnées"],
      ar: ["كونه خوارزمية تجميع للبيانات الفئوية", "تدريب الشبكات الالتفافية على الصور", "عدم امتلاكه أي معاملات فائقة (hyperparameters)", "التعامل الأصلي مع الميزات الفئوية عبر إحصاءات الهدف المرتّبة (ordered target statistics)"]
    },
    answer: 3,
    explain: {
      en: "CatBoost is a gradient boosting library whose signature feature is encoding categories (cities, product codes…) with leak-free target statistics, so you can pass raw categorical columns via cat_features.",
      fr: "CatBoost est une bibliothèque de gradient boosting dont la marque de fabrique est l'encodage des catégories (villes, codes produit…) par des statistiques de cible sans fuite : on peut passer les colonnes catégorielles brutes via cat_features.",
      ar: "CatBoost مكتبة تعزيز تدرّجي ميزتها الأبرز ترميز الفئات (المدن، رموز المنتجات…) بإحصاءات هدف خالية من التسرّب، فيمكنك تمرير الأعمدة الفئوية الخام عبر cat_features."
    }
  },
  {
    id: "model-catboost-ordered-ts",
    concept: "catboost",
    difficulty: 2,
    q: {
      en: "Why does CatBoost encode a row's category using only the rows that come before it in a random permutation?",
      fr: "Pourquoi CatBoost encode-t-il la catégorie d'une ligne en n'utilisant que les lignes qui la précèdent dans une permutation aléatoire ?",
      ar: "لماذا يرمّز CatBoost فئة الصف باستخدام الصفوف التي تسبقه فقط في تبديل عشوائي (permutation)؟"
    },
    options: {
      en: ["To reduce memory usage on GPU", "To fill in missing values", "To prevent target leakage: a row's own label never feeds into its encoding", "To make the trees symmetric"],
      fr: ["Pour réduire la mémoire utilisée sur GPU", "Pour combler les valeurs manquantes", "Pour éviter la fuite de la cible : l'étiquette d'une ligne n'entre jamais dans son propre encodage", "Pour rendre les arbres symétriques"],
      ar: ["لتقليل استهلاك الذاكرة على GPU", "لملء القيم المفقودة", "لمنع تسرّب الهدف (target leakage): لا تدخل تسمية الصف أبدًا في ترميزه", "لجعل الأشجار متماثلة"]
    },
    answer: 2,
    explain: {
      en: "Naive target encoding averages the label over all rows of the category, including the row itself, so the feature \"peeks\" at the answer and the model overfits. Using only earlier rows keeps each encoding honest.",
      fr: "L'encodage de cible naïf moyenne l'étiquette sur toutes les lignes de la catégorie, y compris la ligne elle-même : la variable « voit » la réponse et le modèle surapprend. N'utiliser que les lignes précédentes garde chaque encodage honnête.",
      ar: "الترميز الساذج بالهدف يحسب متوسط التسمية على كل صفوف الفئة بما فيها الصف نفسه، فتطّلع الميزة على الإجابة ويفرط النموذج في التخصيص. استخدام الصفوف السابقة فقط يُبقي كل ترميز نزيهًا."
    }
  },
  {
    id: "model-catboost-scenario",
    concept: "catboost",
    difficulty: 2,
    q: {
      en: "Your tabular dataset has 40 categorical columns, several with thousands of levels (user ids, zip codes), and you want strong results with minimal preprocessing. Which model fits best?",
      fr: "Votre jeu tabulaire compte 40 colonnes catégorielles, dont plusieurs à des milliers de modalités (identifiants utilisateurs, codes postaux), et vous voulez de bons résultats avec un minimum de prétraitement. Quel modèle convient le mieux ?",
      ar: "تحتوي بياناتك الجدولية على 40 عمودًا فئويًا، بعضها بآلاف القيم (معرّفات المستخدمين، الرموز البريدية)، وتريد نتائج قوية بأقل معالجة مسبقة. أي نموذج هو الأنسب؟"
    },
    options: {
      en: ["CatBoost", "k-NN on one-hot encoded columns", "Gaussian naive Bayes", "PCA followed by linear regression"],
      fr: ["CatBoost", "k-NN sur des colonnes encodées en one-hot", "Naive Bayes gaussien", "Une ACP suivie d'une régression linéaire"],
      ar: ["CatBoost", "k-NN على أعمدة مرمّزة بطريقة one-hot", "بايز الساذج الغاوسي (Gaussian naive Bayes)", "PCA متبوعًا بانحدار خطي"]
    },
    answer: 0,
    explain: {
      en: "CatBoost takes raw high-cardinality categories and encodes them without leakage, and it performs well with default settings. One-hot encoding thousands of levels would explode the dimension for k-NN, and the other options do not suit categorical data.",
      fr: "CatBoost accepte directement les catégories à forte cardinalité, les encode sans fuite et donne de bons résultats avec les réglages par défaut. Un one-hot de milliers de modalités ferait exploser la dimension pour k-NN, et les autres options ne conviennent pas aux données catégorielles.",
      ar: "يقبل CatBoost الفئات الخام ذات العدد الكبير من القيم ويرمّزها دون تسرّب، ويؤدي جيدًا بالإعدادات الافتراضية. ترميز one-hot لآلاف القيم سيضخّم الأبعاد بالنسبة لـ k-NN، والخيارات الأخرى لا تناسب البيانات الفئوية."
    }
  },
  {
    id: "model-svm-support-vectors",
    concept: "svm",
    difficulty: 1,
    q: {
      en: "In an SVM, what are the support vectors?",
      fr: "Dans un SVM, que sont les vecteurs de support ?",
      ar: "في آلة متجهات الدعم (SVM)، ما هي متجهات الدعم؟"
    },
    options: {
      en: ["All the training points", "The training points on or inside the margin, which alone define the boundary", "The centers of each class", "The features with the largest weights"],
      fr: ["Tous les points d'entraînement", "Les points d'entraînement sur la marge ou à l'intérieur, qui à eux seuls définissent la frontière", "Les centres de chaque classe", "Les variables aux poids les plus grands"],
      ar: ["جميع نقاط التدريب", "نقاط التدريب الواقعة على الهامش أو داخله، وهي وحدها التي تحدد الحدّ الفاصل", "مراكز كل فئة", "الميزات ذات الأوزان الأكبر"]
    },
    answer: 1,
    explain: {
      en: "The maximum-margin hyperplane depends only on the borderline points that touch or violate the margin. Moving any other point (without crossing the margin) leaves the boundary unchanged.",
      fr: "L'hyperplan à marge maximale ne dépend que des points limites qui touchent ou violent la marge. Déplacer n'importe quel autre point (sans franchir la marge) ne change pas la frontière.",
      ar: "يعتمد المستوي الفائق ذو الهامش الأقصى على النقاط الحدّية التي تلمس الهامش أو تخترقه فقط. تحريك أي نقطة أخرى (دون عبور الهامش) لا يغيّر الحد الفاصل."
    }
  },
  {
    id: "model-svm-c-effect",
    concept: "svm",
    difficulty: 2,
    q: {
      en: "What happens when you increase C in a soft-margin SVM?",
      fr: "Que se passe-t-il quand on augmente C dans un SVM à marge souple ?",
      ar: "ماذا يحدث عند زيادة C في SVM ذي الهامش المرن (soft margin)؟"
    },
    options: {
      en: ["The margin gets wider and the model becomes more regularized", "The kernel switches from RBF to linear", "Nothing changes unless gamma also changes", "Margin violations cost more, so the margin narrows and the model fits the training data more tightly"],
      fr: ["La marge s'élargit et le modèle devient plus régularisé", "Le noyau passe de RBF à linéaire", "Rien ne change tant que gamma ne change pas", "Les violations de marge coûtent plus cher : la marge se resserre et le modèle colle davantage aux données d'entraînement"],
      ar: ["يتّسع الهامش ويصبح النموذج أكثر تنظيمًا", "تتحول النواة من RBF إلى خطية", "لا يتغير شيء ما لم تتغير gamma أيضًا", "تصبح مخالفات الهامش أكثر كلفة، فيضيق الهامش ويلتصق النموذج ببيانات التدريب أكثر"]
    },
    answer: 3,
    explain: {
      en: "C weights the slack penalty against margin width. A large C tolerates few misclassified training points (low bias, higher variance); a small C accepts more violations for a wider, smoother margin.",
      fr: "C pondère la pénalité des écarts face à la largeur de marge. Un grand C tolère peu de points mal classés (biais faible, variance plus forte) ; un petit C accepte plus de violations pour une marge plus large et plus lisse.",
      ar: "يوازن C بين عقوبة المخالفات وعرض الهامش. قيمة C الكبيرة تتسامح مع عدد قليل من نقاط التدريب المصنّفة خطأً (انحياز منخفض وتباين أعلى)، وقيمة C الصغيرة تقبل مخالفات أكثر مقابل هامش أعرض وأكثر سلاسة."
    }
  },
  {
    id: "model-svm-rbf-overfit",
    concept: "svm",
    difficulty: 2,
    q: {
      en: "An RBF-kernel SVM reaches 100% training accuracy but only 62% on the test set. Which change is most likely to help?",
      fr: "Un SVM à noyau RBF atteint 100 % d'exactitude en entraînement mais seulement 62 % sur le jeu de test. Quel changement a le plus de chances d'aider ?",
      ar: "تبلغ آلة SVM بنواة RBF دقة 100% على التدريب لكن 62% فقط على مجموعة الاختبار. أي تغيير هو الأرجح أن يساعد؟"
    },
    options: {
      en: ["Increase gamma", "Increase C", "Decrease gamma (and possibly C)", "Stop scaling the features"],
      fr: ["Augmenter gamma", "Augmenter C", "Diminuer gamma (et éventuellement C)", "Arrêter de mettre les variables à l'échelle"],
      ar: ["زيادة gamma", "زيادة C", "تقليل gamma (وربما C)", "التوقف عن تقييس الميزات"]
    },
    answer: 2,
    explain: {
      en: "A large gamma makes each training point's influence very local, so the boundary wraps around individual points: classic overfitting. A smaller gamma (and smaller C) gives a smoother boundary; tune both with cross-validation.",
      fr: "Un grand gamma rend l'influence de chaque point très locale : la frontière s'enroule autour des points individuels, un surapprentissage typique. Un gamma plus petit (et un C plus petit) donne une frontière plus lisse ; réglez les deux par validation croisée.",
      ar: "قيمة gamma الكبيرة تجعل تأثير كل نقطة تدريب محليًا جدًا، فيلتف الحد الفاصل حول النقاط الفردية، وهذا إفراط في التخصيص نموذجي. قيمة gamma أصغر (وC أصغر) تعطي حدًا أنعم، واضبط الاثنين بالتحقق المتقاطع (cross-validation)."
    }
  },
  {
    id: "model-knn-training",
    concept: "knn",
    difficulty: 1,
    q: {
      en: "What does k-NN actually do during training?",
      fr: "Que fait réellement k-NN pendant l'entraînement ?",
      ar: "ماذا يفعل k-NN فعليًا أثناء التدريب؟"
    },
    options: {
      en: ["It just stores the training data; no parameters are learned", "It runs gradient descent on a loss function", "It builds a tree of if-then rules", "It computes one centroid per class and discards the data"],
      fr: ["Il se contente de stocker les données d'entraînement ; aucun paramètre n'est appris", "Il exécute une descente de gradient sur une fonction de perte", "Il construit un arbre de règles si-alors", "Il calcule un centroïde par classe et jette les données"],
      ar: ["يكتفي بتخزين بيانات التدريب، ولا يتعلم أي معاملات", "ينفّذ الانحدار التدرّجي (gradient descent) على دالة خسارة", "يبني شجرة من قواعد «إذا-فإن»", "يحسب مركزًا لكل فئة ثم يتخلص من البيانات"]
    },
    answer: 0,
    explain: {
      en: "k-NN is a lazy learner: \"training\" is memorizing the dataset, and all the work happens at prediction time, when distances to every stored point are computed. That is why prediction is slow and memory-hungry.",
      fr: "k-NN est un apprenant paresseux : « entraîner », c'est mémoriser le jeu de données, et tout le travail se fait à la prédiction, en calculant les distances à chaque point stocké. D'où des prédictions lentes et gourmandes en mémoire.",
      ar: "k-NN متعلّم كسول (lazy learner): «التدريب» هو حفظ البيانات، ويحدث كل العمل وقت التنبؤ عند حساب المسافات إلى كل نقطة مخزّنة. لهذا يكون التنبؤ بطيئًا ومستهلكًا للذاكرة."
    }
  },
  {
    id: "model-knn-scaling",
    concept: "knn",
    difficulty: 2,
    q: {
      en: "Why should features be scaled before using k-NN?",
      fr: "Pourquoi faut-il mettre les variables à l'échelle avant d'utiliser k-NN ?",
      ar: "لماذا يجب تقييس الميزات قبل استخدام k-NN؟"
    },
    options: {
      en: ["Because k-NN uses gradient descent, which needs scaled inputs", "Because scaling automatically picks the best k", "Otherwise features with large ranges (e.g. income) dominate the distance", "Scaling is not needed for k-NN"],
      fr: ["Parce que k-NN utilise une descente de gradient, qui exige des entrées mises à l'échelle", "Parce que la mise à l'échelle choisit automatiquement le meilleur k", "Sinon les variables à grande amplitude (par ex. le revenu) dominent la distance", "La mise à l'échelle n'est pas nécessaire pour k-NN"],
      ar: ["لأن k-NN يستخدم الانحدار التدرّجي الذي يحتاج مدخلات مقيّسة", "لأن التقييس يختار أفضل k تلقائيًا", "وإلا فإن الميزات ذات المدى الكبير (مثل الدخل) تهيمن على المسافة", "التقييس غير ضروري لـ k-NN"]
    },
    answer: 2,
    explain: {
      en: "Euclidean distance adds squared differences, so a feature measured in tens of thousands swamps one measured in units. Standardizing puts every feature on a comparable scale so each can influence who the neighbors are.",
      fr: "La distance euclidienne additionne les carrés des écarts : une variable en dizaines de milliers écrase une variable en unités. Standardiser met toutes les variables à une échelle comparable, pour que chacune influence le choix des voisins.",
      ar: "تجمع المسافة الإقليدية مربعات الفروق، فالميزة المقاسة بعشرات الآلاف تطغى على ميزة مقاسة بالآحاد. التوحيد القياسي (standardization) يضع كل الميزات على مقياس متقارب لتؤثر كلها في تحديد الجيران."
    }
  },
  {
    id: "model-knn-k1-overfit",
    concept: "knn",
    difficulty: 2,
    q: {
      en: "A k-NN classifier with k = 1 has 100% training accuracy but poor test accuracy. What should you try first?",
      fr: "Un classifieur k-NN avec k = 1 a 100 % d'exactitude en entraînement mais une mauvaise exactitude en test. Que faut-il essayer en premier ?",
      ar: "مصنِّف k-NN بقيمة k = 1 دقته 100% على التدريب لكنها ضعيفة على الاختبار. ما الذي يجب تجربته أولًا؟"
    },
    options: {
      en: ["Keep k = 1 and add more features", "Increase k and choose it by cross-validation", "Train for more epochs", "Switch to weights='distance' while keeping k = 1"],
      fr: ["Garder k = 1 et ajouter des variables", "Augmenter k et le choisir par validation croisée", "Entraîner pendant plus d'époques", "Passer à weights='distance' en gardant k = 1"],
      ar: ["الإبقاء على k = 1 وإضافة ميزات أخرى", "زيادة k واختيارها بالتحقق المتقاطع", "التدريب لعدد أكبر من الحقب (epochs)", "التحول إلى weights='distance' مع الإبقاء على k = 1"]
    },
    answer: 1,
    explain: {
      en: "With k = 1 each training point is its own nearest neighbor, so training accuracy is trivially perfect and the boundary follows every noisy point. A larger k averages over more neighbors and smooths the boundary. k-NN has no epochs to train.",
      fr: "Avec k = 1, chaque point d'entraînement est son propre plus proche voisin : l'exactitude d'entraînement est parfaite par construction et la frontière suit chaque point bruité. Un k plus grand moyenne plus de voisins et lisse la frontière. k-NN n'a pas d'époques.",
      ar: "مع k = 1 تكون كل نقطة تدريب أقرب جار لنفسها، فتكون دقة التدريب مثالية بالضرورة ويتبع الحد الفاصل كل نقطة ضجيج. قيمة k أكبر تأخذ متوسط عدد أكبر من الجيران فتنعّم الحد. وليس في k-NN حقب تدريب أصلًا."
    }
  },
  {
    id: "model-nb-assumption",
    concept: "naive-bayes",
    difficulty: 1,
    q: {
      en: "What is the \"naive\" assumption in naive Bayes?",
      fr: "Quelle est l'hypothèse « naïve » de Naive Bayes ?",
      ar: "ما الافتراض «الساذج» في مصنِّف بايز الساذج (naive Bayes)؟"
    },
    options: {
      en: ["All classes have the same number of samples", "Every feature follows a normal distribution", "Features have been scaled to [0, 1]", "Features are conditionally independent given the class"],
      fr: ["Toutes les classes ont le même nombre d'exemples", "Chaque variable suit une loi normale", "Les variables ont été ramenées dans [0, 1]", "Les variables sont conditionnellement indépendantes sachant la classe"],
      ar: ["لجميع الفئات العدد نفسه من العيّنات", "كل ميزة تتبع توزيعًا طبيعيًا", "جرى تقييس الميزات إلى المجال [0, 1]", "الميزات مستقلة شرطيًا بمعلومية الفئة"]
    },
    answer: 3,
    explain: {
      en: "Naive Bayes assumes P(x₁, …, xₙ | C) = ∏ P(xᵢ | C), so it can multiply one-feature likelihoods. Normality is only assumed by the GaussianNB variant.",
      fr: "Naive Bayes suppose P(x₁, …, xₙ | C) = ∏ P(xᵢ | C) : il peut ainsi multiplier des vraisemblances à une variable. La normalité n'est supposée que par la variante GaussianNB.",
      ar: "يفترض بايز الساذج أن P(x₁, …, xₙ | C) = ∏ P(xᵢ | C)، فيستطيع ضرب احتمالات كل ميزة على حدة. أما افتراض التوزيع الطبيعي فيخص النسخة GaussianNB وحدها."
    }
  },
  {
    id: "model-nb-laplace",
    concept: "naive-bayes",
    difficulty: 2,
    q: {
      en: "Why does MultinomialNB use Laplace smoothing (alpha > 0)?",
      fr: "Pourquoi MultinomialNB utilise-t-il le lissage de Laplace (alpha > 0) ?",
      ar: "لماذا يستخدم MultinomialNB تنعيم لابلاس (alpha > 0)؟"
    },
    options: {
      en: ["A word never seen with a class would get probability 0 and wipe out the whole product", "To scale word counts to unit variance", "To make training run faster", "To make the features truly independent"],
      fr: ["Un mot jamais vu avec une classe aurait une probabilité 0 et annulerait tout le produit", "Pour ramener les comptages de mots à une variance unitaire", "Pour accélérer l'entraînement", "Pour rendre les variables réellement indépendantes"],
      ar: ["الكلمة التي لم تظهر قط مع فئة ما ستأخذ احتمالًا صفريًا فتمحو حاصل الضرب كله", "لتقييس أعداد الكلمات إلى تباين واحدي", "لتسريع التدريب", "لجعل الميزات مستقلة فعلًا"]
    },
    answer: 0,
    explain: {
      en: "Because the class score is a product of per-word probabilities, a single zero makes it 0 regardless of all other evidence. Adding alpha to every count keeps all probabilities strictly positive.",
      fr: "Comme le score d'une classe est un produit de probabilités par mot, un seul zéro le rend nul, quels que soient les autres indices. Ajouter alpha à chaque comptage garde toutes les probabilités strictement positives.",
      ar: "لأن درجة الفئة حاصل ضرب احتمالات الكلمات، يكفي صفر واحد ليجعلها صفرًا مهما كانت بقية الأدلة. إضافة alpha إلى كل عدّ تُبقي جميع الاحتمالات موجبة تمامًا."
    }
  },
  {
    id: "model-nb-posterior-calc",
    concept: "naive-bayes",
    difficulty: 3,
    q: {
      en: "P(spam) = 0.4, P(\"free\" | spam) = 0.5 and P(\"free\" | ham) = 0.1. An email contains \"free\". What is P(spam | \"free\")?",
      fr: "P(spam) = 0.4, P(« free » | spam) = 0.5 et P(« free » | ham) = 0.1. Un e-mail contient « free ». Que vaut P(spam | « free ») ?",
      ar: "لدينا P(spam) = 0.4 وP(\"free\" | spam) = 0.5 وP(\"free\" | ham) = 0.1. رسالة بريد تحتوي على الكلمة \"free\". ما قيمة P(spam | \"free\")؟"
    },
    options: {
      en: ["0.50", "0.20", "≈ 0.77", "≈ 0.83"],
      fr: ["0.50", "0.20", "≈ 0.77", "≈ 0.83"],
      ar: ["0.50", "0.20", "≈ 0.77", "≈ 0.83"]
    },
    answer: 2,
    explain: {
      en: "Bayes: P(spam|free) = 0.4·0.5 / (0.4·0.5 + 0.6·0.1) = 0.20 / 0.26 ≈ 0.77. Forgetting the denominator gives 0.20; ignoring the prior gives 0.5/0.6 ≈ 0.83.",
      fr: "Bayes : P(spam|free) = 0.4·0.5 / (0.4·0.5 + 0.6·0.1) = 0.20 / 0.26 ≈ 0.77. Oublier le dénominateur donne 0.20 ; ignorer l'a priori donne 0.5/0.6 ≈ 0.83.",
      ar: "بحسب بايز: P(spam|free) = 0.4·0.5 / (0.4·0.5 + 0.6·0.1) = 0.20 / 0.26 ≈ 0.77. نسيان المقام يعطي 0.20، وتجاهل الاحتمال القبلي (prior) يعطي 0.5/0.6 ≈ 0.83."
    }
  },
  {
    id: "model-kmeans-objective",
    concept: "kmeans",
    difficulty: 1,
    q: {
      en: "What quantity does K-Means try to minimize?",
      fr: "Quelle quantité K-Means cherche-t-il à minimiser ?",
      ar: "ما الكمية التي تحاول خوارزمية K-Means تقليلها؟"
    },
    options: {
      en: ["The number of clusters", "The within-cluster sum of squared distances to the centroids (inertia)", "The distance between the centroids", "The number of points labeled as noise"],
      fr: ["Le nombre de clusters", "La somme intra-cluster des carrés des distances aux centroïdes (inertie)", "La distance entre les centroïdes", "Le nombre de points étiquetés comme bruit"],
      ar: ["عدد العناقيد", "مجموع مربعات المسافات بين النقاط ومراكز عناقيدها (القصور الذاتي inertia)", "المسافة بين المراكز", "عدد النقاط الموسومة بأنها ضجيج"]
    },
    answer: 1,
    explain: {
      en: "K-Means minimizes WCSS = Σ_j Σ_{x∈S_j} ‖x − μ_j‖² by alternating two steps: assign each point to its nearest centroid, then move each centroid to the mean of its points.",
      fr: "K-Means minimise WCSS = Σ_j Σ_{x∈S_j} ‖x − μ_j‖² en alternant deux étapes : affecter chaque point au centroïde le plus proche, puis déplacer chaque centroïde à la moyenne de ses points.",
      ar: "تقلّل K-Means القيمة WCSS = Σ_j Σ_{x∈S_j} ‖x − μ_j‖² بالتناوب بين خطوتين: إسناد كل نقطة إلى أقرب مركز، ثم نقل كل مركز إلى متوسط نقاطه."
    }
  },
  {
    id: "model-kmeans-rings",
    concept: "kmeans",
    difficulty: 2,
    q: {
      en: "Why does K-Means fail to separate two concentric rings of points?",
      fr: "Pourquoi K-Means échoue-t-il à séparer deux anneaux de points concentriques ?",
      ar: "لماذا تفشل K-Means في فصل حلقتين متحدتي المركز من النقاط؟"
    },
    options: {
      en: ["It needs labeled data to find rings", "It cannot handle more than a few hundred points", "It requires an eps parameter that is hard to set", "Assigning points to the nearest centroid produces convex regions, which cannot follow ring shapes"],
      fr: ["Il lui faut des données étiquetées pour trouver des anneaux", "Il ne gère pas plus de quelques centaines de points", "Il exige un paramètre eps difficile à régler", "Affecter les points au centroïde le plus proche produit des régions convexes, incapables de suivre des anneaux"],
      ar: ["تحتاج إلى بيانات موسومة لاكتشاف الحلقات", "لا تستطيع التعامل مع أكثر من بضع مئات من النقاط", "تتطلب معاملًا eps يصعب ضبطه", "إسناد النقاط إلى أقرب مركز ينتج مناطق محدّبة لا تستطيع اتباع شكل الحلقات"]
    },
    answer: 3,
    explain: {
      en: "Nearest-centroid assignment splits space into Voronoi cells, which are convex, so K-Means favors compact, roughly spherical clusters. Density-based methods such as DBSCAN can follow rings.",
      fr: "L'affectation au centroïde le plus proche découpe l'espace en cellules de Voronoï, qui sont convexes : K-Means favorise des clusters compacts, à peu près sphériques. Les méthodes fondées sur la densité, comme DBSCAN, savent suivre des anneaux.",
      ar: "الإسناد إلى أقرب مركز يقسم الفضاء إلى خلايا فورونوي (Voronoi) المحدّبة، لذا تفضّل K-Means العناقيد المتراصة شبه الكروية. أما الطرق القائمة على الكثافة مثل DBSCAN فتستطيع تتبّع الحلقات."
    }
  },
  {
    id: "model-kmeans-centroid-calc",
    concept: "kmeans",
    difficulty: 3,
    q: {
      en: "After the assignment step, a cluster contains the points (1, 2), (3, 4) and (5, 0). Where does its centroid move?",
      fr: "Après l'étape d'affectation, un cluster contient les points (1, 2), (3, 4) et (5, 0). Où se déplace son centroïde ?",
      ar: "بعد خطوة الإسناد، يحتوي عنقود على النقاط (1, 2) و(3, 4) و(5, 0). إلى أين ينتقل مركزه؟"
    },
    options: {
      en: ["(3, 2)", "(3, 3)", "(9, 6)", "(1, 0)"],
      fr: ["(3, 2)", "(3, 3)", "(9, 6)", "(1, 0)"],
      ar: ["(3, 2)", "(3, 3)", "(9, 6)", "(1, 0)"]
    },
    answer: 0,
    explain: {
      en: "The new centroid is the mean of the members: x = (1 + 3 + 5)/3 = 3 and y = (2 + 4 + 0)/3 = 2. (9, 6) is the sum, not the mean.",
      fr: "Le nouveau centroïde est la moyenne des membres : x = (1 + 3 + 5)/3 = 3 et y = (2 + 4 + 0)/3 = 2. (9, 6) est la somme, pas la moyenne.",
      ar: "المركز الجديد هو متوسط الأعضاء: x = (1 + 3 + 5)/3 = 3 وy = (2 + 4 + 0)/3 = 2. أما (9, 6) فهي المجموع لا المتوسط."
    }
  },
  {
    id: "model-dbscan-params",
    concept: "dbscan",
    difficulty: 1,
    q: {
      en: "Which two hyperparameters define DBSCAN?",
      fr: "Quels sont les deux hyperparamètres qui définissent DBSCAN ?",
      ar: "ما المعاملان الفائقان اللذان يحددان DBSCAN؟"
    },
    options: {
      en: ["n_clusters and init", "C and gamma", "eps and min_samples", "n_components and covariance_type"],
      fr: ["n_clusters et init", "C et gamma", "eps et min_samples", "n_components et covariance_type"],
      ar: ["n_clusters وinit", "C وgamma", "eps وmin_samples", "n_components وcovariance_type"]
    },
    answer: 2,
    explain: {
      en: "eps is the neighborhood radius and min_samples the number of points needed inside it to make a core point. The number of clusters is not a parameter: it follows from the density.",
      fr: "eps est le rayon de voisinage et min_samples le nombre de points nécessaires dans ce rayon pour former un point central. Le nombre de clusters n'est pas un paramètre : il découle de la densité.",
      ar: "eps هو نصف قطر الجوار، وmin_samples عدد النقاط اللازم داخله لتكوين نقطة مركزية (core point). أما عدد العناقيد فليس معاملًا، بل ينتج عن الكثافة."
    }
  },
  {
    id: "model-dbscan-noise-label",
    concept: "dbscan",
    difficulty: 1,
    q: {
      en: "How does scikit-learn's DBSCAN label a point that is neither a core point nor within eps of one?",
      fr: "Comment DBSCAN de scikit-learn étiquette-t-il un point qui n'est ni central ni à moins de eps d'un point central ?",
      ar: "كيف تسِم DBSCAN في scikit-learn نقطة ليست مركزية وليست ضمن مسافة eps من نقطة مركزية؟"
    },
    options: {
      en: ["As noise, with label −1", "As a new cluster of its own", "As a border point of the nearest cluster", "It is assigned to the largest cluster"],
      fr: ["Comme du bruit, avec l'étiquette −1", "Comme un nouveau cluster à lui seul", "Comme un point frontière du cluster le plus proche", "Il est affecté au plus grand cluster"],
      ar: ["ضجيجًا، بالتسمية −1", "عنقودًا جديدًا قائمًا بذاته", "نقطة حدّية لأقرب عنقود", "تُسند إلى أكبر عنقود"]
    },
    answer: 0,
    explain: {
      en: "Points that are not density-reachable from any core point are noise. That built-in outlier labeling (−1) is one of DBSCAN's main advantages over K-Means.",
      fr: "Les points qui ne sont atteignables par densité depuis aucun point central sont du bruit. Cet étiquetage intégré des valeurs aberrantes (−1) est l'un des grands avantages de DBSCAN sur K-Means.",
      ar: "النقاط التي لا يمكن الوصول إليها كثافيًا من أي نقطة مركزية تُعدّ ضجيجًا. هذا الوسم المدمج للقيم الشاذة (−1) من أهم مزايا DBSCAN مقارنة بـ K-Means."
    }
  },
  {
    id: "model-dbscan-varying-density",
    concept: "dbscan",
    difficulty: 2,
    q: {
      en: "Why does DBSCAN struggle when one cluster is very tight and another is very spread out?",
      fr: "Pourquoi DBSCAN a-t-il du mal quand un cluster est très dense et un autre très étalé ?",
      ar: "لماذا تواجه DBSCAN صعوبة عندما يكون أحد العناقيد شديد التراص وآخر متباعدًا جدًا؟"
    },
    options: {
      en: ["It needs the number of clusters k in advance", "A single eps cannot fit both: small eps turns the sparse cluster into noise, large eps merges clusters", "It can only find spherical clusters", "It only works on one-dimensional data"],
      fr: ["Il a besoin du nombre de clusters k à l'avance", "Un seul eps ne convient pas aux deux : un petit eps transforme le cluster étalé en bruit, un grand eps fusionne les clusters", "Il ne trouve que des clusters sphériques", "Il ne fonctionne qu'en une dimension"],
      ar: ["تحتاج إلى عدد العناقيد k مسبقًا", "قيمة eps واحدة لا تناسب الاثنين: eps الصغيرة تحوّل العنقود المتباعد إلى ضجيج، وeps الكبيرة تدمج العناقيد", "لا تجد إلا عناقيد كروية", "لا تعمل إلا على بيانات أحادية البعد"]
    },
    answer: 1,
    explain: {
      en: "DBSCAN uses one global density threshold (eps, min_samples). When densities differ a lot, no single setting captures both clusters; variants like HDBSCAN or OPTICS handle varying density.",
      fr: "DBSCAN utilise un seul seuil de densité global (eps, min_samples). Quand les densités diffèrent beaucoup, aucun réglage unique ne capture les deux clusters ; des variantes comme HDBSCAN ou OPTICS gèrent les densités variables.",
      ar: "تستخدم DBSCAN عتبة كثافة عامة واحدة (eps وmin_samples). عندما تختلف الكثافات كثيرًا لا يلتقط أي ضبط واحد العنقودين معًا، وتتعامل نسخ مثل HDBSCAN وOPTICS مع الكثافة المتغيرة."
    }
  },
  {
    id: "model-dbscan-scenario",
    concept: "dbscan",
    difficulty: 3,
    q: {
      en: "GPS positions of shops form irregular, winding blobs; you do not know how many areas there are, and isolated shops should be flagged as outliers. Which algorithm fits best?",
      fr: "Les positions GPS de commerces forment des amas irréguliers et sinueux ; vous ne savez pas combien de zones il y a, et les commerces isolés doivent être signalés comme aberrants. Quel algorithme convient le mieux ?",
      ar: "تشكّل مواقع GPS للمتاجر كتلًا غير منتظمة ومتعرّجة، ولا تعرف عدد المناطق، ويجب تمييز المتاجر المعزولة كقيم شاذة. أي خوارزمية هي الأنسب؟"
    },
    options: {
      en: ["K-Means", "Gaussian mixture model", "PCA", "DBSCAN"],
      fr: ["K-Means", "Modèle de mélange gaussien", "ACP", "DBSCAN"],
      ar: ["K-Means", "نموذج الخليط الغاوسي (GMM)", "PCA", "DBSCAN"]
    },
    answer: 3,
    explain: {
      en: "DBSCAN finds arbitrarily shaped clusters, infers how many there are from density and labels isolated points as noise. K-Means and GMMs need k and assume convex or Gaussian shapes; PCA is not a clustering method.",
      fr: "DBSCAN trouve des clusters de forme quelconque, déduit leur nombre de la densité et étiquette les points isolés comme bruit. K-Means et les GMM exigent k et supposent des formes convexes ou gaussiennes ; l'ACP n'est pas une méthode de clustering.",
      ar: "تجد DBSCAN عناقيد بأشكال اعتباطية، وتستنتج عددها من الكثافة، وتسِم النقاط المعزولة بأنها ضجيج. أما K-Means وGMM فتحتاجان إلى k وتفترضان أشكالًا محدّبة أو غاوسية، وPCA ليست طريقة تجميع أصلًا."
    }
  },
  {
    id: "model-hclust-dendrogram",
    concept: "hierarchical-clustering",
    difficulty: 1,
    q: {
      en: "What diagram summarizes the result of agglomerative hierarchical clustering?",
      fr: "Quel diagramme résume le résultat d'un clustering hiérarchique ascendant ?",
      ar: "ما المخطط الذي يلخّص نتيجة التجميع الهرمي التكتّلي (agglomerative)؟"
    },
    options: {
      en: ["A ROC curve", "A dendrogram", "A confusion matrix", "A scree plot"],
      fr: ["Une courbe ROC", "Un dendrogramme", "Une matrice de confusion", "Un diagramme des éboulis"],
      ar: ["منحنى ROC", "المخطط الشجري (dendrogram)", "مصفوفة الالتباس", "مخطط الانحدار الصخري (scree plot)"]
    },
    answer: 1,
    explain: {
      en: "The dendrogram records every merge and the distance (height) at which it happened. Cutting it at a chosen height gives a flat clustering, so k can be chosen after fitting.",
      fr: "Le dendrogramme enregistre chaque fusion et la distance (hauteur) à laquelle elle a eu lieu. Le couper à une hauteur donnée fournit un partitionnement : on peut donc choisir k après l'ajustement.",
      ar: "يسجّل المخطط الشجري كل عملية دمج والمسافة (الارتفاع) التي حدثت عندها. قطعه عند ارتفاع معيّن يعطي تجميعًا مسطّحًا، لذا يمكن اختيار k بعد الملاءمة."
    }
  },
  {
    id: "model-hclust-cut",
    concept: "hierarchical-clustering",
    difficulty: 1,
    q: {
      en: "You draw a horizontal line across a dendrogram and it crosses 4 vertical branches. What does this cut give you?",
      fr: "Vous tracez une ligne horizontale sur un dendrogramme et elle coupe 4 branches verticales. Que vous donne cette coupe ?",
      ar: "ترسم خطًا أفقيًا عبر مخطط شجري فيقطع 4 فروع رأسية. ماذا يعطيك هذا القطع؟"
    },
    options: {
      en: ["4 merges", "A distance threshold of 4", "4 clusters", "4 outliers"],
      fr: ["4 fusions", "Un seuil de distance de 4", "4 clusters", "4 valeurs aberrantes"],
      ar: ["4 عمليات دمج", "عتبة مسافة قيمتها 4", "4 عناقيد", "4 قيم شاذة"]
    },
    answer: 2,
    explain: {
      en: "Each branch crossed by the line is a group whose members were merged below that height, so the cut yields 4 clusters. Moving the line up gives fewer, larger clusters.",
      fr: "Chaque branche coupée par la ligne est un groupe dont les membres ont fusionné sous cette hauteur : la coupe donne 4 clusters. Remonter la ligne donne moins de clusters, plus grands.",
      ar: "كل فرع يقطعه الخط مجموعة اندمج أعضاؤها تحت ذلك الارتفاع، فيعطي القطع 4 عناقيد. رفع الخط يعطي عناقيد أقل عددًا وأكبر حجمًا."
    }
  },
  {
    id: "model-hclust-scaling",
    concept: "hierarchical-clustering",
    difficulty: 2,
    q: {
      en: "Why is agglomerative clustering impractical for a dataset of one million points?",
      fr: "Pourquoi le clustering hiérarchique ascendant est-il peu praticable sur un million de points ?",
      ar: "لماذا يصعب تطبيق التجميع الهرمي التكتّلي على مجموعة بيانات من مليون نقطة؟"
    },
    options: {
      en: ["It needs O(n²) memory for pairwise distances, far too much at that size", "It requires k to be chosen before running", "It only works with Manhattan distance", "It gives a different result on every run"],
      fr: ["Il lui faut O(n²) en mémoire pour les distances par paires, bien trop à cette taille", "Il exige de choisir k avant de lancer", "Il ne fonctionne qu'avec la distance de Manhattan", "Il donne un résultat différent à chaque exécution"],
      ar: ["يحتاج إلى ذاكرة O(n²) للمسافات الزوجية، وهذا كثير جدًا عند هذا الحجم", "يتطلب اختيار k قبل التشغيل", "لا يعمل إلا مع مسافة مانهاتن", "يعطي نتيجة مختلفة في كل تشغيل"]
    },
    answer: 0,
    explain: {
      en: "A million points means about 5·10¹¹ pairwise distances, and time grows as O(n² log n) or worse. The method is deterministic and k can be picked afterwards, so the other options are not the issue.",
      fr: "Un million de points, c'est environ 5·10¹¹ distances par paires, et le temps croît en O(n² log n) ou pire. La méthode est déterministe et k peut être choisi après coup : les autres options ne sont pas le problème.",
      ar: "مليون نقطة تعني نحو 5·10¹¹ مسافة زوجية، ويزداد الزمن بمقدار O(n² log n) أو أسوأ. الطريقة حتمية ويمكن اختيار k لاحقًا، فالخيارات الأخرى ليست المشكلة."
    }
  },
  {
    id: "model-hclust-single-linkage",
    concept: "hierarchical-clustering",
    difficulty: 2,
    q: {
      en: "A dendrogram built with single linkage produces one huge, stringy cluster that snakes through the data, plus a few tiny ones. What is going on, and what is a reasonable change?",
      fr: "Un dendrogramme construit avec le lien simple produit un énorme cluster filiforme qui serpente dans les données, plus quelques minuscules. Que se passe-t-il, et quel changement est raisonnable ?",
      ar: "ينتج مخطط شجري مبني بالربط الأحادي (single linkage) عنقودًا ضخمًا خيطيًا يتلوّى عبر البيانات، إضافة إلى بضعة عناقيد صغيرة جدًا. ما الذي يحدث، وما التغيير المعقول؟"
    },
    options: {
      en: ["The data has too few points; add more data", "Single linkage ignores distances; switch the metric to Euclidean", "The dendrogram was cut too low; cut it higher", "Chaining: single linkage merges through nearest points; try Ward or average linkage"],
      fr: ["Les données ont trop peu de points ; en ajouter", "Le lien simple ignore les distances ; passer à la métrique euclidienne", "Le dendrogramme a été coupé trop bas ; le couper plus haut", "L'effet de chaîne : le lien simple fusionne via les points les plus proches ; essayer le lien de Ward ou moyen"],
      ar: ["عدد نقاط البيانات قليل جدًا، فأضف بيانات", "الربط الأحادي يتجاهل المسافات، فبدّل المقياس إلى الإقليدي", "قُطع المخطط في مستوى منخفض جدًا، فاقطعه أعلى", "ظاهرة التسلسل (chaining): يدمج الربط الأحادي عبر أقرب النقاط، فجرّب ربط Ward أو الربط المتوسط"]
    },
    answer: 3,
    explain: {
      en: "Single linkage measures the distance between the two closest members, so a chain of nearby points can link distant groups. Ward and average/complete linkage favor compact clusters; cutting higher would only merge more.",
      fr: "Le lien simple mesure la distance entre les deux membres les plus proches : une chaîne de points voisins peut relier des groupes éloignés. Les liens de Ward, moyen ou complet favorisent des clusters compacts ; couper plus haut ne ferait que fusionner davantage.",
      ar: "يقيس الربط الأحادي المسافة بين أقرب عضوين، فقد تربط سلسلة من النقاط المتجاورة مجموعات متباعدة. أما ربط Ward والربط المتوسط أو الكامل فتفضّل العناقيد المتراصة، والقطع في مستوى أعلى لن يفعل سوى دمج المزيد."
    }
  },
  {
    id: "model-gmm-em",
    concept: "gmm",
    difficulty: 1,
    q: {
      en: "Which algorithm is normally used to fit a Gaussian mixture model?",
      fr: "Quel algorithme utilise-t-on habituellement pour ajuster un modèle de mélange gaussien ?",
      ar: "ما الخوارزمية المستخدمة عادةً لملاءمة نموذج الخليط الغاوسي (GMM)؟"
    },
    options: {
      en: ["Expectation-Maximization (EM)", "Gradient boosting", "Ordinary least squares", "Q-learning"],
      fr: ["L'espérance-maximisation (EM)", "Le gradient boosting", "Les moindres carrés ordinaires", "Le Q-learning"],
      ar: ["خوارزمية التوقع-التعظيم (EM)", "التعزيز التدرّجي", "المربعات الصغرى العادية", "Q-learning"]
    },
    answer: 0,
    explain: {
      en: "EM alternates an E-step (compute each point's responsibility for each component) and an M-step (re-estimate weights, means and covariances from those responsibilities). Each round never decreases the likelihood.",
      fr: "EM alterne une étape E (calculer la responsabilité de chaque composante pour chaque point) et une étape M (réestimer poids, moyennes et covariances à partir de ces responsabilités). Chaque itération ne fait jamais baisser la vraisemblance.",
      ar: "تتناوب EM بين خطوة E (حساب مسؤولية كل مكوّن عن كل نقطة) وخطوة M (إعادة تقدير الأوزان والمتوسطات والتغايرات من هذه المسؤوليات). ولا تُنقص أي دورة الأرجحية (likelihood) أبدًا."
    }
  },
  {
    id: "model-gmm-vs-kmeans",
    concept: "gmm",
    difficulty: 2,
    q: {
      en: "How do a GMM's cluster assignments differ from K-Means?",
      fr: "En quoi les affectations d'un GMM diffèrent-elles de celles de K-Means ?",
      ar: "كيف يختلف إسناد العناقيد في GMM عنه في K-Means؟"
    },
    options: {
      en: ["GMM does not need the number of clusters", "GMM requires labeled training data", "They are soft probabilities, and clusters can be elliptical with different sizes and orientations", "GMM labels low-density points as noise (−1)"],
      fr: ["Le GMM n'a pas besoin du nombre de clusters", "Le GMM exige des données d'entraînement étiquetées", "Ce sont des probabilités (affectation souple), et les clusters peuvent être elliptiques, de tailles et d'orientations différentes", "Le GMM étiquette les points de faible densité comme bruit (−1)"],
      ar: ["لا يحتاج GMM إلى عدد العناقيد", "يتطلب GMM بيانات تدريب موسومة", "هي احتمالات مرنة (soft)، ويمكن أن تكون العناقيد إهليلجية بأحجام واتجاهات مختلفة", "يسِم GMM النقاط منخفضة الكثافة بأنها ضجيج (−1)"]
    },
    answer: 2,
    explain: {
      en: "Each point gets a probability for every component (e.g. 70% / 30%), and each component has its own covariance, so ellipses of any orientation fit. Like K-Means, it still needs n_components.",
      fr: "Chaque point reçoit une probabilité pour chaque composante (par ex. 70 % / 30 %), et chaque composante a sa propre covariance : des ellipses de toute orientation conviennent. Comme K-Means, il faut quand même fixer n_components.",
      ar: "تحصل كل نقطة على احتمال لكل مكوّن (مثل 70% / 30%)، ولكل مكوّن تغايره الخاص، فتناسبه أشكال إهليلجية بأي اتجاه. ومع ذلك يحتاج، مثل K-Means، إلى تحديد n_components."
    }
  },
  {
    id: "model-gmm-choose-k",
    concept: "gmm",
    difficulty: 3,
    q: {
      en: "You want to choose n_components for a GMM. Which approach is sound?",
      fr: "Vous voulez choisir n_components pour un GMM. Quelle approche est correcte ?",
      ar: "تريد اختيار n_components لنموذج GMM. أي طريقة سليمة؟"
    },
    options: {
      en: ["Keep the value with the highest training log-likelihood", "Fit several values and keep the one with the lowest BIC", "Always use 2 components", "Set it equal to the number of features"],
      fr: ["Garder la valeur à la log-vraisemblance d'entraînement la plus élevée", "Ajuster plusieurs valeurs et garder celle au BIC le plus bas", "Toujours utiliser 2 composantes", "La fixer égale au nombre de variables"],
      ar: ["الاحتفاظ بالقيمة ذات أعلى لوغاريتم أرجحية على التدريب", "ملاءمة عدة قيم والاحتفاظ بالقيمة ذات أدنى BIC", "استخدام مكوّنين دائمًا", "جعلها مساوية لعدد الميزات"]
    },
    answer: 1,
    explain: {
      en: "Training likelihood keeps increasing as components are added, so it always favors more. BIC adds a penalty for the number of parameters, balancing fit against complexity.",
      fr: "La vraisemblance d'entraînement augmente toujours quand on ajoute des composantes : elle en favorise toujours davantage. Le BIC ajoute une pénalité sur le nombre de paramètres et équilibre ajustement et complexité.",
      ar: "تزداد الأرجحية على التدريب دائمًا مع إضافة مكوّنات، فهي تفضّل العدد الأكبر دائمًا. أما BIC فيضيف عقوبة على عدد المعاملات، فيوازن بين جودة الملاءمة والتعقيد."
    }
  },
  {
    id: "model-pca-pc1",
    concept: "pca",
    difficulty: 1,
    q: {
      en: "What does the first principal component (PC1) represent?",
      fr: "Que représente la première composante principale (PC1) ?",
      ar: "ماذا يمثّل المكوّن الرئيسي الأول (PC1)؟"
    },
    options: {
      en: ["The original feature with the highest mean", "The feature most correlated with the target", "The center of the largest cluster", "The direction along which the data has the most variance"],
      fr: ["La variable d'origine à la moyenne la plus élevée", "La variable la plus corrélée à la cible", "Le centre du plus grand cluster", "La direction selon laquelle les données ont la plus grande variance"],
      ar: ["الميزة الأصلية ذات أعلى متوسط", "الميزة الأكثر ارتباطًا بالهدف", "مركز أكبر عنقود", "الاتجاه الذي يكون فيه تباين البيانات أكبر ما يمكن"]
    },
    answer: 3,
    explain: {
      en: "PC1 is the eigenvector of the covariance matrix with the largest eigenvalue. PCA is unsupervised, so it never looks at a target, and each PC is a combination of all original features.",
      fr: "PC1 est le vecteur propre de la matrice de covariance associé à la plus grande valeur propre. L'ACP est non supervisée : elle ne regarde jamais la cible, et chaque composante combine toutes les variables d'origine.",
      ar: "PC1 هو المتجه الذاتي لمصفوفة التغاير المقابل لأكبر قيمة ذاتية. تحليل المكونات الرئيسية (PCA) غير خاضع للإشراف، فلا ينظر إلى الهدف أبدًا، وكل مكوّن تركيبة من جميع الميزات الأصلية."
    }
  },
  {
    id: "model-pca-standardize",
    concept: "pca",
    difficulty: 2,
    q: {
      en: "Why do you usually standardize features before PCA?",
      fr: "Pourquoi standardise-t-on généralement les variables avant une ACP ?",
      ar: "لماذا نوحّد مقياس الميزات عادةً قبل تطبيق PCA؟"
    },
    options: {
      en: ["PCA follows variance, so features with large units would dominate the components", "PCA only accepts values between 0 and 1", "Standardizing makes the components non-orthogonal", "Standardizing adds labels that PCA needs"],
      fr: ["L'ACP suit la variance : les variables aux grandes unités domineraient les composantes", "L'ACP n'accepte que des valeurs entre 0 et 1", "Standardiser rend les composantes non orthogonales", "Standardiser ajoute des étiquettes dont l'ACP a besoin"],
      ar: ["لأن PCA تتبع التباين، فالميزات ذات الوحدات الكبيرة ستهيمن على المكوّنات", "لأن PCA لا تقبل إلا قيمًا بين 0 و1", "لأن التوحيد يجعل المكوّنات غير متعامدة", "لأن التوحيد يضيف تسميات تحتاجها PCA"]
    },
    answer: 0,
    explain: {
      en: "A salary in dollars has a variance millions of times larger than an age in years, so PC1 would just be \"salary\". Standardizing gives every feature unit variance so the components reflect correlation structure, not units.",
      fr: "Un salaire en dollars a une variance des millions de fois supérieure à un âge en années : PC1 serait simplement « le salaire ». Standardiser donne à chaque variable une variance unitaire, pour que les composantes reflètent la structure des corrélations et non les unités.",
      ar: "تباين الراتب بالدولار أكبر بملايين المرات من تباين العمر بالسنوات، فسيكون PC1 مجرد «الراتب». يعطي التوحيد كل ميزة تباينًا واحديًا لتعكس المكوّنات بنية الارتباط لا الوحدات."
    }
  },
  {
    id: "model-pca-variance-calc",
    concept: "pca",
    difficulty: 3,
    q: {
      en: "A PCA on 4 standardized features gives eigenvalues 5, 3, 1.5 and 0.5. What fraction of the total variance do the first two components explain?",
      fr: "Une ACP sur 4 variables standardisées donne les valeurs propres 5, 3, 1.5 et 0.5. Quelle part de la variance totale les deux premières composantes expliquent-elles ?",
      ar: "أعطى تطبيق PCA على 4 ميزات موحّدة المقياس القيم الذاتية 5 و3 و1.5 و0.5. ما نسبة التباين الكلي التي يفسّرها المكوّنان الأولان؟"
    },
    options: {
      en: ["50%", "30%", "80%", "95%"],
      fr: ["50 %", "30 %", "80 %", "95 %"],
      ar: ["50%", "30%", "80%", "95%"]
    },
    answer: 2,
    explain: {
      en: "Each eigenvalue is the variance along its component. Total = 5 + 3 + 1.5 + 0.5 = 10, and the first two give (5 + 3)/10 = 0.8 = 80%. 95% would need the first three components.",
      fr: "Chaque valeur propre est la variance le long de sa composante. Total = 5 + 3 + 1.5 + 0.5 = 10, et les deux premières donnent (5 + 3)/10 = 0.8 = 80 %. Il faudrait les trois premières pour 95 %.",
      ar: "كل قيمة ذاتية هي التباين على امتداد مكوّنها. المجموع = 5 + 3 + 1.5 + 0.5 = 10، والمكوّنان الأولان يعطيان (5 + 3)/10 = 0.8 = 80%. أما 95% فتحتاج المكوّنات الثلاثة الأولى."
    }
  },
  {
    id: "model-tsne-purpose",
    concept: "tsne-umap",
    difficulty: 1,
    q: {
      en: "What are t-SNE and UMAP mainly used for?",
      fr: "À quoi servent principalement t-SNE et UMAP ?",
      ar: "فيمَ يُستخدم t-SNE وUMAP أساسًا؟"
    },
    options: {
      en: ["Visualizing high-dimensional data in 2D or 3D", "Scaling features before regression", "Supervised classification", "Imputing missing values"],
      fr: ["Visualiser des données de grande dimension en 2D ou 3D", "Mettre les variables à l'échelle avant une régression", "La classification supervisée", "Imputer des valeurs manquantes"],
      ar: ["تصوير البيانات عالية الأبعاد في بُعدين أو ثلاثة", "تقييس الميزات قبل الانحدار", "التصنيف الخاضع للإشراف", "تعويض القيم المفقودة"]
    },
    answer: 0,
    explain: {
      en: "Both are non-linear dimensionality reduction methods that keep each point near its high-dimensional neighbors, which makes cluster structure visible on a 2D map.",
      fr: "Ce sont deux méthodes non linéaires de réduction de dimension qui gardent chaque point près de ses voisins en grande dimension, ce qui rend la structure en clusters visible sur une carte 2D.",
      ar: "كلاهما طريقة غير خطية لتقليص الأبعاد تُبقي كل نقطة قرب جيرانها في الفضاء عالي الأبعاد، مما يجعل بنية العناقيد مرئية على خريطة ثنائية الأبعاد."
    }
  },
  {
    id: "model-tsne-new-points",
    concept: "tsne-umap",
    difficulty: 2,
    q: {
      en: "Why is classic t-SNE a poor preprocessing step for a production classifier?",
      fr: "Pourquoi le t-SNE classique est-il une mauvaise étape de prétraitement pour un classifieur en production ?",
      ar: "لماذا يُعدّ t-SNE الكلاسيكي خطوة معالجة مسبقة سيئة لمصنِّف في بيئة الإنتاج؟"
    },
    options: {
      en: ["It is a linear method that loses non-linear structure", "It increases the number of dimensions", "It requires the class labels as input", "It has no transform for new points, and its output changes with the seed and hyperparameters"],
      fr: ["C'est une méthode linéaire qui perd la structure non linéaire", "Il augmente le nombre de dimensions", "Il exige les étiquettes de classe en entrée", "Il n'a pas de transform pour de nouveaux points, et sa sortie change avec la graine et les hyperparamètres"],
      ar: ["لأنه طريقة خطية تفقد البنية غير الخطية", "لأنه يزيد عدد الأبعاد", "لأنه يتطلب تسميات الفئات كمدخل", "ليس لديه transform للنقاط الجديدة، ومخرجاته تتغير مع البذرة العشوائية (seed) والمعاملات الفائقة"]
    },
    answer: 3,
    explain: {
      en: "t-SNE optimizes positions for a fixed set of points; embedding a new sample means rerunning it, and coordinates differ between runs. UMAP does offer transform(), but both are mainly visualization tools.",
      fr: "t-SNE optimise des positions pour un ensemble fixe de points : placer un nouvel exemple oblige à tout relancer, et les coordonnées changent d'une exécution à l'autre. UMAP propose bien transform(), mais les deux restent surtout des outils de visualisation.",
      ar: "يحسّن t-SNE مواقع مجموعة ثابتة من النقاط، فإدراج عيّنة جديدة يتطلب إعادة التشغيل، وتختلف الإحداثيات بين تشغيل وآخر. يوفّر UMAP الدالة transform()، لكن كليهما أداة تصوير بالأساس."
    }
  },
  {
    id: "model-tsne-distances",
    concept: "tsne-umap",
    difficulty: 2,
    q: {
      en: "In a t-SNE plot, cluster A sits twice as far from cluster B as from cluster C, and B looks twice as large as C. What can you safely conclude?",
      fr: "Sur un graphique t-SNE, le cluster A est deux fois plus loin du cluster B que du cluster C, et B paraît deux fois plus grand que C. Que peut-on conclure sans risque ?",
      ar: "في مخطط t-SNE، يبعد العنقود A عن العنقود B ضعف بُعده عن العنقود C، ويبدو B ضعف حجم C. ما الذي يمكنك استنتاجه بأمان؟"
    },
    options: {
      en: ["A is twice as different from B as from C", "Very little: distances between clusters and cluster sizes in t-SNE are not reliable", "B contains twice as many points as C", "B has twice the variance of C in the original space"],
      fr: ["A est deux fois plus différent de B que de C", "Pas grand-chose : les distances entre clusters et leurs tailles ne sont pas fiables en t-SNE", "B contient deux fois plus de points que C", "B a deux fois la variance de C dans l'espace d'origine"],
      ar: ["A يختلف عن B ضعف اختلافه عن C", "القليل جدًا: المسافات بين العناقيد وأحجامها في t-SNE ليست موثوقة", "يحتوي B على ضعف عدد نقاط C", "تباين B ضعف تباين C في الفضاء الأصلي"]
    },
    answer: 1,
    explain: {
      en: "t-SNE preserves local neighborhoods, not global geometry: its heavy-tailed similarities push clusters apart by arbitrary amounts and normalize their spread. Check such claims in the original space or with PCA.",
      fr: "t-SNE préserve les voisinages locaux, pas la géométrie globale : ses similarités à queue lourde écartent les clusters de façon arbitraire et uniformisent leur étalement. Vérifiez ce genre d'affirmation dans l'espace d'origine ou avec une ACP.",
      ar: "يحافظ t-SNE على الجوار المحلي لا على الهندسة العامة: تدفع تشابهاته ذات الذيل الثقيل العناقيد بعيدًا بمقادير اعتباطية وتوحّد انتشارها. تحقّق من مثل هذه الاستنتاجات في الفضاء الأصلي أو باستخدام PCA."
    }
  },
  {
    id: "model-iforest-idea",
    concept: "isolation-forest",
    difficulty: 1,
    q: {
      en: "What is the core idea behind Isolation Forest?",
      fr: "Quelle est l'idée centrale de l'Isolation Forest ?",
      ar: "ما الفكرة الأساسية وراء غابة العزل (Isolation Forest)؟"
    },
    options: {
      en: ["Anomalies need more splits to isolate, so they have longer paths", "Anomalies are the points farthest from the K-Means centroids", "Anomalies can be isolated with fewer random splits, so they have shorter paths in the trees", "Anomalies are the points a classifier misclassifies most"],
      fr: ["Les anomalies demandent plus de divisions pour être isolées : leurs chemins sont plus longs", "Les anomalies sont les points les plus éloignés des centroïdes de K-Means", "Les anomalies s'isolent avec moins de divisions aléatoires : leurs chemins dans les arbres sont plus courts", "Les anomalies sont les points qu'un classifieur classe le plus mal"],
      ar: ["تحتاج الحالات الشاذة إلى تقسيمات أكثر لعزلها، فتكون مساراتها أطول", "الحالات الشاذة هي الأبعد عن مراكز K-Means", "يمكن عزل الحالات الشاذة بعدد أقل من التقسيمات العشوائية، فتكون مساراتها في الأشجار أقصر", "الحالات الشاذة هي النقاط التي يخطئ المصنِّف في تصنيفها أكثر"]
    },
    answer: 2,
    explain: {
      en: "Random splits quickly separate rare, extreme points from the crowd, while normal points sit in dense regions that take many splits to isolate. The average path length h(x) becomes the anomaly score.",
      fr: "Des divisions aléatoires séparent vite les points rares et extrêmes de la masse, alors que les points normaux sont dans des zones denses qui demandent beaucoup de divisions. La longueur moyenne du chemin h(x) devient le score d'anomalie.",
      ar: "تفصل التقسيمات العشوائية النقاط النادرة والمتطرفة عن الحشد بسرعة، بينما تقع النقاط العادية في مناطق كثيفة تحتاج إلى تقسيمات كثيرة لعزلها. يصبح متوسط طول المسار h(x) درجة الشذوذ."
    }
  },
  {
    id: "model-iforest-contamination",
    concept: "isolation-forest",
    difficulty: 1,
    q: {
      en: "What does the contamination parameter of IsolationForest control?",
      fr: "Que contrôle le paramètre contamination d'IsolationForest ?",
      ar: "ماذا يتحكم المعامل contamination في IsolationForest؟"
    },
    options: {
      en: ["The expected share of anomalies, which sets the threshold that turns scores into labels", "The number of trees in the forest", "The maximum depth of each tree", "The amount of noise added to the data"],
      fr: ["La proportion attendue d'anomalies, qui fixe le seuil transformant les scores en étiquettes", "Le nombre d'arbres de la forêt", "La profondeur maximale de chaque arbre", "La quantité de bruit ajoutée aux données"],
      ar: ["النسبة المتوقعة للحالات الشاذة، وهي التي تحدد العتبة التي تحوّل الدرجات إلى تسميات", "عدد الأشجار في الغابة", "العمق الأقصى لكل شجرة", "مقدار الضجيج المضاف إلى البيانات"]
    },
    answer: 0,
    explain: {
      en: "The forest produces a continuous score; contamination = 0.01 means \"flag the 1% most anomalous\". It does not change the trees, only where the cut-off is placed, so it needs domain knowledge.",
      fr: "La forêt produit un score continu ; contamination = 0.01 signifie « signaler les 1 % les plus anormaux ». Il ne change pas les arbres, seulement l'emplacement du seuil, d'où le besoin de connaissance métier.",
      ar: "تنتج الغابة درجة متصلة، وcontamination = 0.01 يعني «اوسم أكثر 1% شذوذًا». لا يغيّر الأشجار، بل موضع العتبة فقط، ولذلك يحتاج إلى معرفة بالمجال."
    }
  },
  {
    id: "model-iforest-path-length",
    concept: "isolation-forest",
    difficulty: 2,
    q: {
      en: "In an Isolation Forest, point X needs on average 3 splits to be isolated and point Y needs 11. Which is more likely an anomaly?",
      fr: "Dans une Isolation Forest, le point X demande en moyenne 3 divisions pour être isolé et le point Y en demande 11. Lequel est le plus probablement une anomalie ?",
      ar: "في غابة العزل، تحتاج النقطة X في المتوسط إلى 3 تقسيمات لعزلها، والنقطة Y إلى 11. أيهما أرجح أن تكون حالة شاذة؟"
    },
    options: {
      en: ["Y, because a longer path means it is more unusual", "Neither: path lengths say nothing about anomalies", "You cannot tell without labeled anomalies", "X, because a shorter path gives a score closer to 1"],
      fr: ["Y, car un chemin plus long signifie qu'il est plus inhabituel", "Aucun : la longueur des chemins ne dit rien des anomalies", "Impossible à dire sans anomalies étiquetées", "X, car un chemin plus court donne un score plus proche de 1"],
      ar: ["Y، لأن المسار الأطول يعني أنها أغرب", "لا هذه ولا تلك: طول المسار لا يخبر شيئًا عن الشذوذ", "لا يمكن الجزم دون حالات شاذة موسومة", "X، لأن المسار الأقصر يعطي درجة أقرب إلى 1"]
    },
    answer: 3,
    explain: {
      en: "The score is s = 2^(−E[h(x)]/c(n)): the shorter the average path, the closer s gets to 1. X was singled out quickly, so it lies in a sparse region. The method is unsupervised, so no labels are needed.",
      fr: "Le score vaut s = 2^(−E[h(x)]/c(n)) : plus le chemin moyen est court, plus s s'approche de 1. X a été isolé rapidement, il est donc dans une zone peu dense. La méthode est non supervisée, aucune étiquette n'est nécessaire.",
      ar: "الدرجة هي s = 2^(−E[h(x)]/c(n))، فكلما قصر متوسط المسار اقتربت s من 1. عُزلت X بسرعة، فهي تقع في منطقة قليلة الكثافة. والطريقة غير خاضعة للإشراف، فلا حاجة إلى تسميات."
    }
  },
  {
    id: "model-ts-arima-d",
    concept: "time-series-forecasting",
    difficulty: 1,
    q: {
      en: "In an ARIMA(p, d, q) model, what does d stand for?",
      fr: "Dans un modèle ARIMA(p, d, q), que représente d ?",
      ar: "في نموذج ARIMA(p, d, q)، ماذا يمثّل d؟"
    },
    options: {
      en: ["The number of days in the forecast horizon", "The number of times the series is differenced", "The seasonal period", "The number of past forecast errors used"],
      fr: ["Le nombre de jours de l'horizon de prévision", "Le nombre de différenciations appliquées à la série", "La période saisonnière", "Le nombre d'erreurs de prévision passées utilisées"],
      ar: ["عدد أيام أفق التنبؤ", "عدد مرات تطبيق الفروق (differencing) على السلسلة", "الدورة الموسمية", "عدد أخطاء التنبؤ السابقة المستخدمة"]
    },
    answer: 1,
    explain: {
      en: "ARIMA differences the series d times to make it stationary, then models it with p autoregressive lags and q moving-average error lags. The seasonal period s belongs to SARIMA's seasonal_order.",
      fr: "ARIMA différencie la série d fois pour la rendre stationnaire, puis la modélise avec p retards autorégressifs et q retards d'erreur de moyenne mobile. La période saisonnière s appartient au seasonal_order de SARIMA.",
      ar: "يطبّق ARIMA الفروق على السلسلة d مرة لجعلها مستقرة (stationary)، ثم ينمذجها بـ p تأخيرات انحدار ذاتي وq تأخيرات لأخطاء المتوسط المتحرك. أما الدورة الموسمية s فتنتمي إلى seasonal_order في SARIMA."
    }
  },
  {
    id: "model-ts-prophet-components",
    concept: "time-series-forecasting",
    difficulty: 1,
    q: {
      en: "Prophet models a series as y(t) = g(t) + s(t) + h(t) + ε. What do g, s and h stand for?",
      fr: "Prophet modélise une série comme y(t) = g(t) + s(t) + h(t) + ε. Que représentent g, s et h ?",
      ar: "ينمذج Prophet السلسلة على الشكل y(t) = g(t) + s(t) + h(t) + ε. ماذا تمثّل g وs وh؟"
    },
    options: {
      en: ["Trend, seasonality and holiday effects", "Gradient, slope and Hessian", "Growth rate, standard deviation and horizon", "Global mean, sample size and history length"],
      fr: ["La tendance, la saisonnalité et les effets des jours fériés", "Le gradient, la pente et la hessienne", "Le taux de croissance, l'écart-type et l'horizon", "La moyenne globale, la taille d'échantillon et la longueur de l'historique"],
      ar: ["الاتجاه العام والموسمية وتأثيرات العطل", "التدرج والميل ومصفوفة Hessian", "معدل النمو والانحراف المعياري والأفق", "المتوسط العام وحجم العيّنة وطول السجل التاريخي"]
    },
    answer: 0,
    explain: {
      en: "Prophet is an additive curve-fitting model: a piecewise trend g(t), Fourier-series seasonality s(t) and holiday effects h(t). Each component can be plotted and explained separately.",
      fr: "Prophet est un modèle additif d'ajustement de courbes : une tendance par morceaux g(t), une saisonnalité en séries de Fourier s(t) et des effets de jours fériés h(t). Chaque composante peut être tracée et expliquée séparément.",
      ar: "Prophet نموذج جمعي لملاءمة المنحنيات: اتجاه عام متعدد القطع g(t)، وموسمية بمتسلسلات فورييه s(t)، وتأثيرات العطل h(t). ويمكن رسم كل مكوّن وشرحه على حدة."
    }
  },
  {
    id: "model-ts-random-cv-leak",
    concept: "time-series-forecasting",
    difficulty: 2,
    q: {
      en: "Why is standard shuffled K-fold cross-validation a bad way to evaluate a forecasting model?",
      fr: "Pourquoi la validation croisée K-fold classique avec mélange est-elle une mauvaise façon d'évaluer un modèle de prévision ?",
      ar: "لماذا يُعدّ التحقق المتقاطع K-fold العادي مع الخلط طريقة سيئة لتقييم نموذج تنبؤ؟"
    },
    options: {
      en: ["It is too slow for time series", "It can only be used for classification", "It trains on future points to predict past ones, leaking information and inflating the scores", "It removes the seasonality from the data"],
      fr: ["Il est trop lent pour les séries temporelles", "Il ne s'utilise que pour la classification", "Il entraîne sur des points futurs pour prédire des points passés, ce qui fait fuiter de l'information et gonfle les scores", "Il retire la saisonnalité des données"],
      ar: ["لأنه بطيء جدًا على السلاسل الزمنية", "لأنه لا يُستخدم إلا للتصنيف", "لأنه يدرّب على نقاط مستقبلية للتنبؤ بنقاط ماضية، فيسرّب المعلومات ويضخّم النتائج", "لأنه يزيل الموسمية من البيانات"]
    },
    answer: 2,
    explain: {
      en: "In real use you only ever know the past. Shuffled folds let the model see later observations (and their autocorrelation) when predicting earlier ones. Use time-ordered splits such as an expanding-window TimeSeriesSplit.",
      fr: "En usage réel, on ne connaît que le passé. Des plis mélangés laissent le modèle voir des observations ultérieures (et leur autocorrélation) pour prédire des observations antérieures. Utilisez des découpages chronologiques comme TimeSeriesSplit à fenêtre croissante.",
      ar: "في الاستخدام الفعلي لا تعرف إلا الماضي. الطيّات المخلوطة تسمح للنموذج برؤية ملاحظات لاحقة (وارتباطها الذاتي) عند التنبؤ بملاحظات سابقة. استخدم تقسيمات مرتّبة زمنيًا مثل TimeSeriesSplit بنافذة متوسّعة."
    }
  },
  {
    id: "model-ts-prophet-scenario",
    concept: "time-series-forecasting",
    difficulty: 3,
    q: {
      en: "You need a quick, explainable baseline for daily store sales with weekly and yearly seasonality, holiday spikes and some missing days. Which choice fits best?",
      fr: "Il vous faut une base de référence rapide et explicable pour des ventes quotidiennes de magasin, avec saisonnalités hebdomadaire et annuelle, pics aux jours fériés et quelques jours manquants. Quel choix convient le mieux ?",
      ar: "تحتاج إلى نموذج أساسي سريع وقابل للتفسير لمبيعات متجر يومية ذات موسمية أسبوعية وسنوية وارتفاعات في العطل وبعض الأيام المفقودة. أي خيار هو الأنسب؟"
    },
    options: {
      en: ["A plain non-seasonal ARIMA", "K-Means on the daily values", "A k-NN classifier on the dates", "Prophet with weekly and yearly seasonality plus a holiday calendar"],
      fr: ["Un ARIMA simple sans saisonnalité", "K-Means sur les valeurs quotidiennes", "Un classifieur k-NN sur les dates", "Prophet avec saisonnalités hebdomadaire et annuelle et un calendrier des jours fériés"],
      ar: ["نموذج ARIMA بسيط دون موسمية", "K-Means على القيم اليومية", "مصنِّف k-NN على التواريخ", "Prophet مع موسمية أسبوعية وسنوية وتقويم للعطل"]
    },
    answer: 3,
    explain: {
      en: "Prophet is built for business series: multiple seasonalities, holidays and gaps in the data are handled directly, and its trend/seasonality components are easy to explain. A non-seasonal ARIMA would miss the weekly and yearly cycles.",
      fr: "Prophet est conçu pour les séries métier : saisonnalités multiples, jours fériés et trous dans les données sont gérés directement, et ses composantes tendance/saisonnalité sont faciles à expliquer. Un ARIMA sans saisonnalité raterait les cycles hebdomadaire et annuel.",
      ar: "صُمّم Prophet لسلاسل الأعمال: يتعامل مباشرة مع الموسميات المتعددة والعطل والفجوات في البيانات، ومكوّناته (الاتجاه والموسمية) سهلة الشرح. أما ARIMA دون موسمية فسيفوّت الدورتين الأسبوعية والسنوية."
    }
  },
  {
    id: "model-recsys-collaborative",
    concept: "recommender-systems",
    difficulty: 1,
    q: {
      en: "What does collaborative filtering base its recommendations on?",
      fr: "Sur quoi le filtrage collaboratif fonde-t-il ses recommandations ?",
      ar: "على أي أساس تبني التصفية التعاونية (collaborative filtering) توصياتها؟"
    },
    options: {
      en: ["Past interactions: users with similar behavior tend to like the same items", "Only the item descriptions and metadata", "The global popularity of each item, ignoring the user", "Random sampling of the catalog"],
      fr: ["Les interactions passées : des utilisateurs au comportement similaire aiment souvent les mêmes articles", "Uniquement les descriptions et métadonnées des articles", "La popularité globale de chaque article, sans tenir compte de l'utilisateur", "Un tirage aléatoire dans le catalogue"],
      ar: ["التفاعلات السابقة: المستخدمون ذوو السلوك المتشابه يميلون إلى إعجاب العناصر نفسها", "أوصاف العناصر وبياناتها الوصفية فقط", "الشعبية العامة لكل عنصر دون اعتبار للمستخدم", "سحب عشوائي من الكتالوج"]
    },
    answer: 0,
    explain: {
      en: "Collaborative filtering learns from the user-item interaction matrix (ratings, clicks, purchases). Using item attributes is content-based filtering; hybrid systems combine both.",
      fr: "Le filtrage collaboratif apprend à partir de la matrice d'interactions utilisateur-article (notes, clics, achats). Utiliser les attributs des articles, c'est le filtrage basé sur le contenu ; les systèmes hybrides combinent les deux.",
      ar: "تتعلم التصفية التعاونية من مصفوفة التفاعلات بين المستخدمين والعناصر (تقييمات، نقرات، مشتريات). أما استخدام ميزات العناصر فهو التصفية القائمة على المحتوى، والأنظمة الهجينة تجمع بينهما."
    }
  },
  {
    id: "model-recsys-cold-start",
    concept: "recommender-systems",
    difficulty: 1,
    q: {
      en: "A brand-new product has no ratings yet. Why does a pure matrix-factorization recommender struggle with it?",
      fr: "Un produit tout neuf n'a encore aucune note. Pourquoi un système de recommandation par factorisation matricielle pure a-t-il du mal avec lui ?",
      ar: "منتج جديد تمامًا لم يحصل بعد على أي تقييم. لماذا يواجه نظام توصية يعتمد على تحليل المصفوفات (matrix factorization) وحده صعوبة معه؟"
    },
    options: {
      en: ["The model is too large to update", "With no interactions, its item factors cannot be learned (cold start); content features or popularity are needed", "Regularization deletes new items", "New items always get the highest score"],
      fr: ["Le modèle est trop gros pour être mis à jour", "Sans interactions, ses facteurs latents ne peuvent pas être appris (démarrage à froid) ; il faut des caractéristiques de contenu ou la popularité", "La régularisation supprime les nouveaux articles", "Les nouveaux articles obtiennent toujours le meilleur score"],
      ar: ["لأن النموذج أكبر من أن يُحدَّث", "دون تفاعلات لا يمكن تعلّم عوامله الكامنة، وهذه مشكلة البدء البارد (cold start)، فنحتاج إلى ميزات المحتوى أو الشعبية", "لأن التنظيم يحذف العناصر الجديدة", "لأن العناصر الجديدة تحصل دائمًا على أعلى درجة"]
    },
    answer: 1,
    explain: {
      en: "Matrix factorization learns q_i only from observed ratings of item i. A new item has none, so its embedding is meaningless; hybrid models fall back on metadata or popularity until feedback arrives.",
      fr: "La factorisation matricielle n'apprend q_i qu'à partir des notes observées de l'article i. Un nouvel article n'en a aucune : son embedding n'a pas de sens. Les modèles hybrides s'appuient sur les métadonnées ou la popularité en attendant des retours.",
      ar: "يتعلم تحليل المصفوفات q_i من التقييمات المرصودة للعنصر i فقط. العنصر الجديد لا يملك أيًا منها، فيكون تمثيله (embedding) بلا معنى، وتعتمد النماذج الهجينة على البيانات الوصفية أو الشعبية إلى أن تصل التفاعلات."
    }
  },
  {
    id: "model-recsys-mf-calc",
    concept: "recommender-systems",
    difficulty: 3,
    q: {
      en: "A matrix-factorization model has global mean μ = 3, user bias b_u = 0.2, item bias b_i = −0.5, user factors p_u = (0.5, 1) and item factors q_i = (1, 0.4). What rating r̂_ui = μ + b_u + b_i + p_uᵀq_i does it predict?",
      fr: "Un modèle de factorisation matricielle a une moyenne globale μ = 3, un biais utilisateur b_u = 0.2, un biais article b_i = −0.5, des facteurs utilisateur p_u = (0.5, 1) et des facteurs article q_i = (1, 0.4). Quelle note r̂_ui = μ + b_u + b_i + p_uᵀq_i prédit-il ?",
      ar: "نموذج تحليل مصفوفات له متوسط عام μ = 3، وانحياز مستخدم b_u = 0.2، وانحياز عنصر b_i = −0.5، وعوامل مستخدم p_u = (0.5, 1)، وعوامل عنصر q_i = (1, 0.4). ما التقييم r̂_ui = μ + b_u + b_i + p_uᵀq_i الذي يتنبأ به؟"
    },
    options: {
      en: ["2.7", "4.6", "3.6", "0.9"],
      fr: ["2.7", "4.6", "3.6", "0.9"],
      ar: ["2.7", "4.6", "3.6", "0.9"]
    },
    answer: 2,
    explain: {
      en: "Dot product: 0.5·1 + 1·0.4 = 0.9. Then r̂ = 3 + 0.2 − 0.5 + 0.9 = 3.6. Dropping the dot product gives 2.7; flipping the sign of b_i gives 4.6.",
      fr: "Produit scalaire : 0.5·1 + 1·0.4 = 0.9. Puis r̂ = 3 + 0.2 − 0.5 + 0.9 = 3.6. Oublier le produit scalaire donne 2.7 ; inverser le signe de b_i donne 4.6.",
      ar: "الجداء القياسي: 0.5·1 + 1·0.4 = 0.9. ثم r̂ = 3 + 0.2 − 0.5 + 0.9 = 3.6. إهمال الجداء القياسي يعطي 2.7، وعكس إشارة b_i يعطي 4.6."
    }
  },
  {
    id: "model-qlearning-q-meaning",
    concept: "q-learning",
    difficulty: 1,
    q: {
      en: "In Q-learning, what does Q(s, a) estimate?",
      fr: "En Q-learning, qu'estime Q(s, a) ?",
      ar: "في Q-learning، ماذا تقدّر Q(s, a)؟"
    },
    options: {
      en: ["Only the immediate reward of action a in state s", "The probability of choosing action a in state s", "How many times action a was tried in state s", "The expected discounted future reward of taking action a in state s and acting well afterwards"],
      fr: ["Seulement la récompense immédiate de l'action a dans l'état s", "La probabilité de choisir l'action a dans l'état s", "Le nombre de fois où l'action a a été essayée dans l'état s", "La récompense future actualisée attendue en prenant l'action a dans l'état s puis en agissant au mieux"],
      ar: ["المكافأة الفورية فقط للإجراء a في الحالة s", "احتمال اختيار الإجراء a في الحالة s", "عدد مرات تجربة الإجراء a في الحالة s", "المكافأة المستقبلية المخصومة المتوقعة عند اتخاذ الإجراء a في الحالة s ثم التصرف على النحو الأمثل بعدها"]
    },
    answer: 3,
    explain: {
      en: "Q-values capture long-term return, not just the next reward: r + γ·max Q(s′, a′) folds in the best value reachable afterwards. Acting greedily on Q then gives the learned policy.",
      fr: "Les valeurs Q mesurent le retour à long terme, pas seulement la prochaine récompense : r + γ·max Q(s′, a′) intègre la meilleure valeur atteignable ensuite. Agir de façon gloutonne selon Q donne alors la politique apprise.",
      ar: "تعبّر قيم Q عن العائد على المدى الطويل لا عن المكافأة التالية فقط: فالحد r + γ·max Q(s′, a′) يضمّ أفضل قيمة يمكن بلوغها بعد ذلك. واختيار الإجراء الأعلى قيمةً دائمًا (greedy) يعطي السياسة المتعلَّمة."
    }
  },
  {
    id: "model-qlearning-epsilon",
    concept: "q-learning",
    difficulty: 2,
    q: {
      en: "Why does a Q-learning agent use an ε-greedy policy during training?",
      fr: "Pourquoi un agent de Q-learning utilise-t-il une politique ε-greedy pendant l'entraînement ?",
      ar: "لماذا يستخدم وكيل Q-learning سياسة ε-greedy أثناء التدريب؟"
    },
    options: {
      en: ["To reduce the memory used by the Q-table", "To keep trying non-best actions sometimes, so it can discover better ones instead of locking in early estimates", "To make rewards larger", "To skip the Bellman update on random steps"],
      fr: ["Pour réduire la mémoire utilisée par la table Q", "Pour essayer de temps en temps des actions non optimales et découvrir de meilleures options au lieu de se figer sur les premières estimations", "Pour augmenter les récompenses", "Pour sauter la mise à jour de Bellman lors des pas aléatoires"],
      ar: ["لتقليل الذاكرة التي يستهلكها جدول Q", "ليجرّب أحيانًا إجراءات غير الأفضل، فيكتشف خيارات أفضل بدل التمسك بتقديراته الأولى", "لزيادة المكافآت", "لتخطّي تحديث بلمان (Bellman) في الخطوات العشوائية"]
    },
    answer: 1,
    explain: {
      en: "This is the exploration-exploitation trade-off: with probability ε the agent acts randomly, otherwise it picks the best-known action. ε is usually decayed as estimates become reliable.",
      fr: "C'est le compromis exploration-exploitation : avec une probabilité ε l'agent agit au hasard, sinon il prend la meilleure action connue. On diminue généralement ε à mesure que les estimations deviennent fiables.",
      ar: "هذه هي الموازنة بين الاستكشاف والاستغلال: باحتمال ε يتصرف الوكيل عشوائيًا، وإلا يختار أفضل إجراء معروف. وعادةً ما تُخفَّض ε تدريجيًا كلما أصبحت التقديرات موثوقة."
    }
  },
  {
    id: "model-qlearning-update-calc",
    concept: "q-learning",
    difficulty: 3,
    q: {
      en: "Q(s, a) = 2, α = 0.5, γ = 0.9. The agent receives r = 1 and the best next value is max Q(s′, a′) = 4. What is Q(s, a) after the update Q ← Q + α·[r + γ·max Q(s′, a′) − Q]?",
      fr: "Q(s, a) = 2, α = 0.5, γ = 0.9. L'agent reçoit r = 1 et la meilleure valeur suivante est max Q(s′, a′) = 4. Que vaut Q(s, a) après la mise à jour Q ← Q + α·[r + γ·max Q(s′, a′) − Q] ?",
      ar: "لدينا Q(s, a) = 2 وα = 0.5 وγ = 0.9. يتلقى الوكيل r = 1 وأفضل قيمة تالية هي max Q(s′, a′) = 4. ما قيمة Q(s, a) بعد التحديث Q ← Q + α·[r + γ·max Q(s′, a′) − Q]؟"
    },
    options: {
      en: ["3.3", "4.6", "2.5", "3.8"],
      fr: ["3.3", "4.6", "2.5", "3.8"],
      ar: ["3.3", "4.6", "2.5", "3.8"]
    },
    answer: 0,
    explain: {
      en: "Target = 1 + 0.9·4 = 4.6; TD error = 4.6 − 2 = 2.6; new Q = 2 + 0.5·2.6 = 3.3. 4.6 is the target itself, which you only reach with α = 1.",
      fr: "Cible = 1 + 0.9·4 = 4.6 ; erreur TD = 4.6 − 2 = 2.6 ; nouveau Q = 2 + 0.5·2.6 = 3.3. 4.6 est la cible elle-même, atteinte seulement avec α = 1.",
      ar: "الهدف = 1 + 0.9·4 = 4.6، وخطأ الفرق الزمني (TD error) = 4.6 − 2 = 2.6، وQ الجديدة = 2 + 0.5·2.6 = 3.3. أما 4.6 فهي الهدف نفسه، ولا تُبلغ إلا عندما α = 1."
    }
  }
];
