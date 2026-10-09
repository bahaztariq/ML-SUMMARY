/** Quiz questions: ml-theory. See index.js for the question format. */
/** @type {import('./index.js').Question[]} */
export default [
  // ── bias-variance-tradeoff ────────────────────────────────
  {
    id: "theory-bv-decomposition",
    concept: "bias-variance-tradeoff",
    difficulty: 1,
    q: {
      en: "The expected squared prediction error of a model decomposes into which three parts?",
      fr: "L’erreur de prédiction quadratique attendue d’un modèle se décompose en quelles trois parties ?",
      ar: "إلى أيّ ثلاثة أجزاء يتحلّل الخطأ التربيعي المتوقع لتنبؤات نموذج ما؟"
    },
    options: {
      en: ["Training error + validation error + test error", "Bias² + variance + irreducible noise", "Loss + cost + regularization", "Precision + recall + accuracy"],
      fr: ["Erreur d’entraînement + erreur de validation + erreur de test", "Biais² + variance + bruit irréductible", "Perte + coût + régularisation", "Précision + rappel + exactitude"],
      ar: ["خطأ التدريب + خطأ التحقق + خطأ الاختبار", "مربع الانحياز + التباين + الضجيج غير القابل للاختزال", "الخسارة + التكلفة + التنظيم", "الضبط + الاستدعاء + الدقة"]
    },
    answer: 1,
    explain: {
      en: "E[(y − ŷ)²] = Bias² + Var + σ². Bias comes from wrong assumptions, variance from sensitivity to the particular training sample, and σ² is noise in the data itself.",
      fr: "E[(y − ŷ)²] = Biais² + Var + σ². Le biais vient d’hypothèses erronées, la variance de la sensibilité à l’échantillon d’entraînement particulier, et σ² est le bruit propre aux données.",
      ar: "E[(y − ŷ)²] = Bias² + Var + σ². ينشأ الانحياز (bias) من افتراضات خاطئة، والتباين (variance) من الحساسية لعيّنة التدريب بعينها، أما σ² فهو الضجيج الكامن في البيانات نفسها."
    }
  },
  {
    id: "theory-bv-irreducible-error",
    concept: "bias-variance-tradeoff",
    difficulty: 1,
    q: {
      en: "Which part of the prediction error cannot be reduced by any model, however good?",
      fr: "Quelle part de l’erreur de prédiction ne peut être réduite par aucun modèle, aussi bon soit-il ?",
      ar: "أيّ جزء من خطأ التنبؤ لا يمكن لأيّ نموذج، مهما بلغت جودته، أن يقلّله؟"
    },
    options: {
      en: ["Bias", "Variance", "Irreducible noise σ²", "Optimization error"],
      fr: ["Le biais", "La variance", "Le bruit irréductible σ²", "L’erreur d’optimisation"],
      ar: ["الانحياز", "التباين", "الضجيج غير القابل للاختزال σ²", "خطأ التحسين"]
    },
    answer: 2,
    explain: {
      en: "σ² is randomness in the target that the available features cannot explain, such as measurement noise. Better models can only trade bias against variance; collecting more informative features is the only way to lower the noise floor.",
      fr: "σ² est l’aléa de la cible que les variables disponibles ne peuvent pas expliquer, comme le bruit de mesure. De meilleurs modèles ne font qu’arbitrer entre biais et variance ; seules des variables plus informatives abaissent ce plancher de bruit.",
      ar: "σ² هو العشوائية في الهدف التي لا تفسّرها الميزات المتاحة، كضجيج القياس. والنماذج الأفضل لا تفعل سوى المقايضة بين الانحياز والتباين، وجمع ميزات أغنى بالمعلومات هو السبيل الوحيد لخفض هذا الحدّ الأدنى من الضجيج."
    }
  },
  {
    id: "theory-bv-diagnose-high-bias",
    concept: "bias-variance-tradeoff",
    difficulty: 2,
    q: {
      en: "Training error is high and validation error is about the same. What is the diagnosis and the usual fix?",
      fr: "L’erreur d’entraînement est élevée et l’erreur de validation à peu près identique. Quel est le diagnostic et le remède habituel ?",
      ar: "خطأ التدريب مرتفع وخطأ التحقق مماثل له تقريبًا. ما التشخيص وما العلاج المعتاد؟"
    },
    options: {
      en: ["High variance: add regularization", "High variance: collect more data", "High bias: make the model more expressive or add features", "No problem: the model generalizes perfectly"],
      fr: ["Forte variance : ajouter de la régularisation", "Forte variance : collecter plus de données", "Fort biais : rendre le modèle plus expressif ou ajouter des variables", "Aucun problème : le modèle généralise parfaitement"],
      ar: ["تباين مرتفع: أضف تنظيمًا", "تباين مرتفع: اجمع مزيدًا من البيانات", "انحياز مرتفع: اجعل النموذج أقدر تعبيرًا أو أضف ميزات", "لا مشكلة: النموذج يعمّم بشكل مثالي"]
    },
    answer: 2,
    explain: {
      en: "If the model cannot even fit the training data, it is too rigid (high bias). More data or more regularization will not help; a more flexible model or better features will.",
      fr: "Si le modèle n’arrive même pas à ajuster les données d’entraînement, il est trop rigide (fort biais). Plus de données ou de régularisation n’aideront pas ; un modèle plus souple ou de meilleures variables, si.",
      ar: "إذا عجز النموذج حتى عن ملاءمة بيانات التدريب فهو جامد أكثر من اللازم (انحياز مرتفع). ولن تفيد زيادة البيانات أو التنظيم، بل يفيد نموذج أكثر مرونة أو ميزات أفضل."
    }
  },

  // ── overfitting-underfitting ──────────────────────────────
  {
    id: "theory-fit-overfitting-symptom",
    concept: "overfitting-underfitting",
    difficulty: 1,
    q: {
      en: "A model scores 99% accuracy on training data and 75% on validation data. What is happening?",
      fr: "Un modèle obtient 99 % d’exactitude à l’entraînement et 75 % en validation. Que se passe-t-il ?",
      ar: "حقق نموذج دقة 99% على بيانات التدريب و75% على بيانات التحقق. ما الذي يحدث؟"
    },
    options: {
      en: ["Underfitting", "Overfitting", "A good fit", "Data imbalance in the training set"],
      fr: ["Sous-apprentissage", "Surapprentissage", "Un bon ajustement", "Un déséquilibre des données d’entraînement"],
      ar: ["نقص في التخصيص (underfitting)", "إفراط في التخصيص (overfitting)", "ملاءمة جيدة", "عدم توازن في بيانات التدريب"]
    },
    answer: 1,
    explain: {
      en: "A large gap between training and validation performance means the model memorized training noise instead of the general pattern. Underfitting would show low scores on both.",
      fr: "Un grand écart entre performances d’entraînement et de validation signifie que le modèle a mémorisé le bruit au lieu du schéma général. Le sous-apprentissage donnerait des scores faibles des deux côtés.",
      ar: "الفجوة الكبيرة بين أداء التدريب وأداء التحقق تعني أن النموذج حفظ ضجيج التدريب بدل النمط العام. أما نقص التخصيص فيُظهر نتائج منخفضة في الحالتين."
    }
  },
  {
    id: "theory-fit-underfitting-remedy",
    concept: "overfitting-underfitting",
    difficulty: 2,
    q: {
      en: "Training and validation accuracy are both stuck around 60%. Which change is most likely to help?",
      fr: "Les exactitudes d’entraînement et de validation plafonnent toutes deux vers 60 %. Quel changement a le plus de chances d’aider ?",
      ar: "دقة التدريب ودقة التحقق عالقتان كلتاهما عند نحو 60%. أيّ تغيير أرجح أن يساعد؟"
    },
    options: {
      en: ["Increase the regularization strength", "Add dropout", "Stop training earlier", "Use a more complex model or add informative features"],
      fr: ["Augmenter la force de régularisation", "Ajouter du dropout", "Arrêter l’entraînement plus tôt", "Utiliser un modèle plus complexe ou ajouter des variables informatives"],
      ar: ["زيادة قوة التنظيم", "إضافة الإسقاط (dropout)", "إيقاف التدريب مبكرًا", "استخدام نموذج أعقد أو إضافة ميزات غنية بالمعلومات"]
    },
    answer: 3,
    explain: {
      en: "Low scores on both sets signal underfitting: the model is too simple for the pattern. Regularization, dropout and early stopping all restrict the model further and would make it worse.",
      fr: "Des scores faibles des deux côtés indiquent un sous-apprentissage : le modèle est trop simple pour le schéma. Régularisation, dropout et arrêt précoce restreignent encore le modèle et aggraveraient la situation.",
      ar: "انخفاض النتائج في المجموعتين علامة على نقص التخصيص: النموذج أبسط من النمط. والتنظيم والإسقاط والإيقاف المبكر كلها تقيّد النموذج أكثر فتزيد الوضع سوءًا."
    }
  },
  {
    id: "theory-fit-more-data-helps",
    concept: "overfitting-underfitting",
    difficulty: 1,
    q: {
      en: "Which action typically reduces overfitting?",
      fr: "Quelle action réduit généralement le surapprentissage ?",
      ar: "أيّ إجراء يقلّل عادةً الإفراط في التخصيص؟"
    },
    options: {
      en: ["Collecting more training data", "Adding more layers to the network", "Decreasing the regularization strength", "Training for many more epochs"],
      fr: ["Collecter davantage de données d’entraînement", "Ajouter des couches au réseau", "Diminuer la force de régularisation", "Entraîner beaucoup plus d’époques"],
      ar: ["جمع مزيد من بيانات التدريب", "إضافة طبقات إلى الشبكة", "تقليل قوة التنظيم", "التدريب لعدد أكبر بكثير من الحقب"]
    },
    answer: 0,
    explain: {
      en: "With more examples, noise in any single sample matters less and memorizing becomes harder than learning the real pattern. The other options all increase the model’s freedom to fit noise.",
      fr: "Avec plus d’exemples, le bruit d’un échantillon particulier pèse moins et mémoriser devient plus difficile qu’apprendre le vrai schéma. Les autres options augmentent toutes la liberté du modèle d’ajuster le bruit.",
      ar: "مع ازدياد الأمثلة يقلّ أثر الضجيج في أيّ عيّنة بعينها، ويصبح الحفظ أصعب من تعلّم النمط الحقيقي. أما الخيارات الأخرى فكلها تزيد حرية النموذج في ملاءمة الضجيج."
    }
  },
  {
    id: "theory-fit-learning-curves-early-stop",
    concept: "overfitting-underfitting",
    difficulty: 3,
    q: {
      en: "During training, the training loss keeps falling, but the validation loss reaches its minimum at epoch 12 and then rises steadily. What should you do?",
      fr: "Pendant l’entraînement, la perte d’entraînement continue de baisser, mais la perte de validation atteint son minimum à l’époque 12 puis remonte régulièrement. Que faire ?",
      ar: "أثناء التدريب تستمر خسارة التدريب في الانخفاض، لكن خسارة التحقق تبلغ أدناها عند الحقبة 12 ثم ترتفع باطّراد. ماذا تفعل؟"
    },
    options: {
      en: ["Train longer, because training loss is still improving", "Increase the learning rate after epoch 12", "Keep the weights from around epoch 12 (early stopping)", "Remove the validation set, since it disagrees with training"],
      fr: ["Entraîner plus longtemps, puisque la perte d’entraînement s’améliore encore", "Augmenter le taux d’apprentissage après l’époque 12", "Garder les poids de l’époque 12 environ (arrêt précoce)", "Supprimer la validation, puisqu’elle contredit l’entraînement"],
      ar: ["مواصلة التدريب لأن خسارة التدريب ما زالت تتحسّن", "رفع معدل التعلم بعد الحقبة 12", "الاحتفاظ بالأوزان من نحو الحقبة 12 (الإيقاف المبكر)", "حذف مجموعة التحقق لأنها تخالف التدريب"]
    },
    answer: 2,
    explain: {
      en: "After epoch 12 the model starts fitting noise: it improves on data it has seen and gets worse on new data. Early stopping keeps the checkpoint with the best validation loss.",
      fr: "Après l’époque 12, le modèle commence à ajuster le bruit : il progresse sur les données vues et se dégrade sur les nouvelles. L’arrêt précoce conserve le point de sauvegarde ayant la meilleure perte de validation.",
      ar: "بعد الحقبة 12 يبدأ النموذج بملاءمة الضجيج: يتحسّن على البيانات التي رآها ويسوء على الجديدة. ويحتفظ الإيقاف المبكر (early stopping) بنقطة الحفظ ذات أفضل خسارة تحقق."
    }
  },

  // ── model-interpretability ────────────────────────────────
  {
    id: "theory-interp-permutation-importance",
    concept: "model-interpretability",
    difficulty: 1,
    q: {
      en: "What does permutation importance measure for a feature?",
      fr: "Que mesure l’importance par permutation pour une variable ?",
      ar: "ماذا تقيس أهمية التبديل (permutation importance) لميزة ما؟"
    },
    options: {
      en: ["How often the feature is used in tree splits", "The size of the feature’s coefficient", "The feature’s correlation with the other features", "How much the model’s score drops when that feature’s values are shuffled"],
      fr: ["Combien de fois la variable est utilisée dans les coupures des arbres", "La taille du coefficient de la variable", "La corrélation de la variable avec les autres", "De combien le score du modèle baisse quand on mélange les valeurs de cette variable"],
      ar: ["عدد مرات استخدام الميزة في تقسيمات الأشجار", "حجم معامل الميزة", "ارتباط الميزة بالميزات الأخرى", "مقدار انخفاض نتيجة النموذج حين تُخلط قيم تلك الميزة عشوائيًا"]
    },
    answer: 3,
    explain: {
      en: "Shuffling a column breaks its link with the target while keeping its distribution. If the score drops a lot, the model relied on that feature. Compute it on held-out data to measure real predictive value.",
      fr: "Mélanger une colonne casse son lien avec la cible tout en gardant sa distribution. Si le score chute fortement, le modèle s’appuyait sur cette variable. Calculez-la sur des données mises de côté pour mesurer la vraie valeur prédictive.",
      ar: "خلط عمود يقطع صلته بالهدف مع الإبقاء على توزيعه. فإن هبطت النتيجة كثيرًا فقد كان النموذج يعتمد على تلك الميزة. احسبها على بيانات محجوزة لقياس القيمة التنبؤية الحقيقية."
    }
  },
  {
    id: "theory-interp-shap-additivity",
    concept: "model-interpretability",
    difficulty: 2,
    q: {
      en: "For one customer, the SHAP base value is 0.20 and the feature SHAP values sum to +0.35. What is the model’s output for that customer?",
      fr: "Pour un client, la valeur de base SHAP est 0,20 et les valeurs SHAP des variables totalisent +0,35. Quelle est la sortie du modèle pour ce client ?",
      ar: "لعميل ما، القيمة الأساسية في SHAP هي 0.20 ومجموع قيم SHAP للميزات +0.35. ما مخرَج النموذج لهذا العميل؟"
    },
    options: {
      en: ["0.35", "0.55", "0.15", "0.07"],
      fr: ["0,35", "0,55", "0,15", "0,07"],
      ar: ["0.35", "0.55", "0.15", "0.07"]
    },
    answer: 1,
    explain: {
      en: "SHAP values are additive: base value + Σφⱼ equals the model’s output exactly, here 0.20 + 0.35 = 0.55. Each φⱼ says how much that feature pushed this prediction away from the average.",
      fr: "Les valeurs SHAP sont additives : valeur de base + Σφⱼ égale exactement la sortie du modèle, ici 0,20 + 0,35 = 0,55. Chaque φⱼ indique de combien la variable a éloigné cette prédiction de la moyenne.",
      ar: "قيم SHAP جمعية: القيمة الأساسية + Σφⱼ تساوي مخرَج النموذج تمامًا، وهنا 0.20 + 0.35 = 0.55. وتبيّن كل φⱼ مقدار ما دفعت به الميزة هذا التنبؤ بعيدًا عن المتوسط."
    }
  },
  {
    id: "theory-interp-not-causal",
    concept: "model-interpretability",
    difficulty: 2,
    q: {
      en: "In a model predicting drownings, “ice cream sales” has the highest SHAP importance. What can you conclude?",
      fr: "Dans un modèle prédisant les noyades, « ventes de glaces » a la plus forte importance SHAP. Que peut-on conclure ?",
      ar: "في نموذج يتنبأ بحالات الغرق، حصلت «مبيعات المثلّجات» على أعلى أهمية في SHAP. ماذا يمكنك أن تستنتج؟"
    },
    options: {
      en: ["Banning ice cream would reduce drownings", "The model relies on ice cream sales, which probably proxies for hot weather; it says nothing about cause", "SHAP is broken for this model", "The feature must be leaking the target"],
      fr: ["Interdire les glaces réduirait les noyades", "Le modèle s’appuie sur les ventes de glaces, sans doute un indicateur de chaleur ; cela ne dit rien de la causalité", "SHAP est défaillant pour ce modèle", "La variable fait forcément fuiter la cible"],
      ar: ["حظر المثلّجات سيقلّل حالات الغرق", "يعتمد النموذج على مبيعات المثلّجات، وهي على الأرجح مؤشر على الطقس الحار؛ ولا يدلّ ذلك على السببية", "SHAP معطّل في هذا النموذج", "لا بدّ أن الميزة تسرّب الهدف"]
    },
    answer: 1,
    explain: {
      en: "Explanations describe what the model uses, not how the world works. Ice cream sales and drownings both rise in hot weather, so the feature is predictive without being a cause.",
      fr: "Les explications décrivent ce qu’utilise le modèle, pas le fonctionnement du monde. Les ventes de glaces et les noyades augmentent toutes deux par temps chaud : la variable est prédictive sans être une cause.",
      ar: "تصف التفسيرات ما يستخدمه النموذج لا كيف يعمل العالم. فمبيعات المثلّجات وحالات الغرق ترتفعان معًا في الطقس الحار، فالميزة تنبؤية دون أن تكون سببًا."
    }
  },
  {
    id: "theory-interp-spot-leakage",
    concept: "model-interpretability",
    difficulty: 3,
    q: {
      en: "In a churn model, the most important feature by far is “account_closed_date is not null”. Validation AUC is 0.99. What does this most likely reveal?",
      fr: "Dans un modèle d’attrition, la variable de loin la plus importante est « account_closed_date n’est pas nul ». L’AUC de validation vaut 0,99. Que révèle probablement ce constat ?",
      ar: "في نموذج للتنبؤ بتسرّب العملاء، أهم ميزة بفارق كبير هي «account_closed_date غير فارغ»، وقيمة AUC في التحقق 0.99. ما الذي يكشفه هذا على الأرجح؟"
    },
    options: {
      en: ["Target leakage: the feature is only filled in after a customer has churned", "An excellent model that is ready to deploy", "The model needs more regularization", "SHAP and permutation importance disagree"],
      fr: ["Une fuite de la cible : la variable n’est renseignée qu’après le départ du client", "Un excellent modèle prêt à être déployé", "Le modèle a besoin de plus de régularisation", "SHAP et l’importance par permutation sont en désaccord"],
      ar: ["تسرّب الهدف: هذه الميزة لا تُملأ إلا بعد أن يغادر العميل", "نموذج ممتاز جاهز للنشر", "يحتاج النموذج إلى مزيد من التنظيم", "تتعارض نتائج SHAP مع أهمية التبديل"]
    },
    answer: 0,
    explain: {
      en: "A closing date exists only once the customer has already left, so it encodes the answer. Importance tools are valuable precisely because they expose shortcuts like this before deployment; remove the feature and re-evaluate.",
      fr: "Une date de clôture n’existe qu’une fois le client parti : elle contient la réponse. Les outils d’importance sont précieux justement parce qu’ils révèlent ce genre de raccourci avant le déploiement ; retirez la variable et réévaluez.",
      ar: "تاريخ الإغلاق لا يوجد إلا بعد أن يكون العميل قد غادر فعلًا، فهو يرمّز الإجابة. وتكمن قيمة أدوات الأهمية في أنها تكشف مثل هذه الاختصارات قبل النشر؛ احذف الميزة وأعِد التقييم."
    }
  },

  // ── curse-of-dimensionality ───────────────────────────────
  {
    id: "theory-cod-distance-concentration",
    concept: "curse-of-dimensionality",
    difficulty: 1,
    q: {
      en: "As the number of dimensions grows, what happens to distances between random points?",
      fr: "Quand le nombre de dimensions augmente, qu’arrive-t-il aux distances entre points aléatoires ?",
      ar: "مع ازدياد عدد الأبعاد، ماذا يحدث للمسافات بين نقاط عشوائية؟"
    },
    options: {
      en: ["The nearest point becomes much closer than all others", "Distances all become zero", "The nearest and farthest neighbors end up at almost the same distance", "Distances stop depending on the data"],
      fr: ["Le point le plus proche devient bien plus proche que tous les autres", "Toutes les distances deviennent nulles", "Le plus proche et le plus lointain voisin finissent presque à la même distance", "Les distances ne dépendent plus des données"],
      ar: ["تصبح أقرب نقطة أقرب بكثير من كل النقاط الأخرى", "تصبح كل المسافات صفرًا", "يصبح أقرب جار وأبعد جار على مسافتين متقاربتين جدًا", "تكفّ المسافات عن الاعتماد على البيانات"]
    },
    answer: 2,
    explain: {
      en: "This is distance concentration: (d_max − d_min) / d_min tends to 0 as d grows. When every point is roughly equally far, “nearest neighbor” stops carrying much information.",
      fr: "C’est la concentration des distances : (d_max − d_min) / d_min tend vers 0 quand d augmente. Quand tous les points sont à peu près aussi éloignés, le « plus proche voisin » n’apporte plus grand-chose.",
      ar: "هذه ظاهرة تمركز المسافات: تؤول (d_max − d_min) / d_min إلى 0 مع ازدياد d. وحين تكون كل النقاط على مسافات متقاربة لا يعود «أقرب جار» يحمل معلومات تُذكر."
    }
  },
  {
    id: "theory-cod-samples-needed",
    concept: "curse-of-dimensionality",
    difficulty: 2,
    q: {
      en: "To keep the same density of samples in feature space, how does the required number of samples grow as you add features?",
      fr: "Pour garder la même densité d’échantillons dans l’espace des variables, comment le nombre d’échantillons nécessaire croît-il quand on ajoute des variables ?",
      ar: "للحفاظ على كثافة العيّنات نفسها في فضاء الميزات، كيف يزداد عدد العيّنات المطلوب عند إضافة ميزات؟"
    },
    options: {
      en: ["It stays the same", "Linearly with the number of features", "Exponentially with the number of features", "Logarithmically with the number of features"],
      fr: ["Il reste le même", "Linéairement avec le nombre de variables", "Exponentiellement avec le nombre de variables", "Logarithmiquement avec le nombre de variables"],
      ar: ["يبقى كما هو", "خطيًا مع عدد الميزات", "أُسّيًا مع عدد الميزات", "لوغاريتميًا مع عدد الميزات"]
    },
    answer: 2,
    explain: {
      en: "If each feature is split into k bins, d features create kᵈ cells to fill. With 10 bins, 2 features need about 100 samples for one per cell, but 10 features need 10 billion.",
      fr: "Si chaque variable est découpée en k intervalles, d variables créent kᵈ cases à remplir. Avec 10 intervalles, 2 variables demandent environ 100 échantillons pour un par case, mais 10 variables en demandent 10 milliards.",
      ar: "إذا قُسّمت كل ميزة إلى k مجالات، فإن d ميزات تُنشئ kᵈ خلية يجب ملؤها. ومع 10 مجالات تحتاج ميزتان إلى نحو 100 عيّنة لتكون عيّنة في كل خلية، بينما تحتاج 10 ميزات إلى 10 مليارات."
    }
  },
  {
    id: "theory-cod-which-model-suffers",
    concept: "curse-of-dimensionality",
    difficulty: 2,
    q: {
      en: "Which model is typically hurt the most when many irrelevant raw features are added?",
      fr: "Quel modèle souffre généralement le plus de l’ajout de nombreuses variables brutes non pertinentes ?",
      ar: "أيّ نموذج يتضرّر عادةً أكثر من غيره عند إضافة كثير من الميزات الخام غير ذات الصلة؟"
    },
    options: {
      en: ["L1-regularized logistic regression", "k-Nearest Neighbors", "Ridge regression"],
      fr: ["Régression logistique régularisée L1", "k plus proches voisins (k-NN)", "Régression Ridge"],
      ar: ["الانحدار اللوجستي المنظَّم بـ L1", "أقرب k جيران (k-NN)", "انحدار Ridge"]
    },
    answer: 1,
    explain: {
      en: "k-NN weighs every dimension equally in its distance, so irrelevant features drown out the useful ones and neighbors become meaningless. Regularized linear models can shrink or zero the useless weights.",
      fr: "Le k-NN donne le même poids à chaque dimension dans sa distance : les variables inutiles noient les utiles et les voisins perdent leur sens. Les modèles linéaires régularisés peuvent réduire ou annuler les poids inutiles.",
      ar: "يعطي k-NN كل بُعد الوزن نفسه في حساب المسافة، فتُغرق الميزات غير ذات الصلة الميزاتِ المفيدة ويفقد الجيران معناهم. أما النماذج الخطية المنظَّمة فتستطيع تقليص الأوزان عديمة الفائدة أو تصفيرها."
    }
  },
  {
    id: "theory-cod-genomics-remedy",
    concept: "curse-of-dimensionality",
    difficulty: 3,
    q: {
      en: "You have 200 patients and 5,000 gene-expression features, and a k-NN classifier performs barely above chance. What is the most sensible next step?",
      fr: "Vous avez 200 patients et 5 000 variables d’expression génique, et un classifieur k-NN fait à peine mieux que le hasard. Quelle est l’étape suivante la plus judicieuse ?",
      ar: "لديك 200 مريض و5,000 ميزة للتعبير الجيني، ومصنِّف k-NN لا يكاد يتجاوز مستوى الصدفة. ما الخطوة التالية الأكثر منطقية؟"
    },
    options: {
      en: ["Add more engineered gene features", "Increase k to 199", "Reduce dimensions (selection or PCA) or switch to a regularized linear model", "Remove feature scaling"],
      fr: ["Ajouter davantage de variables géniques construites", "Monter k à 199", "Réduire les dimensions (sélection ou ACP) ou passer à un modèle linéaire régularisé", "Supprimer la mise à l’échelle"],
      ar: ["إضافة مزيد من الميزات الجينية المصمَّمة", "رفع k إلى 199", "تقليل الأبعاد (بالاختيار أو PCA) أو التحوّل إلى نموذج خطي منظَّم", "إلغاء توحيد المقاييس"]
    },
    answer: 2,
    explain: {
      en: "With 25 times more features than samples, the space is hopelessly sparse for distance-based methods. Compressing to the informative directions, or using an L1/L2-regularized linear model, is the standard remedy when p ≫ n.",
      fr: "Avec 25 fois plus de variables que d’échantillons, l’espace est désespérément creux pour les méthodes à distance. Compresser vers les directions informatives, ou utiliser un modèle linéaire régularisé L1/L2, est le remède classique quand p ≫ n.",
      ar: "مع ميزات تفوق العيّنات بخمسة وعشرين ضعفًا يصبح الفضاء متناثرًا على نحو ميؤوس منه للطرق القائمة على المسافة. والضغط نحو الاتجاهات الغنية بالمعلومات، أو استخدام نموذج خطي منظَّم بـ L1/L2، هو العلاج المعتاد حين p ≫ n."
    }
  },

  // ── regularization-l1-l2 ──────────────────────────────────
  {
    id: "theory-reg-l1-sparsity",
    concept: "regularization-l1-l2",
    difficulty: 1,
    q: {
      en: "Which regularization penalty can drive some weights exactly to zero, effectively selecting features?",
      fr: "Quelle pénalité de régularisation peut amener certains poids exactement à zéro, et donc sélectionner des variables ?",
      ar: "أيّ عقوبة تنظيم (regularization) يمكنها دفع بعض الأوزان إلى الصفر تمامًا، فتختار الميزات فعليًا؟"
    },
    options: {
      en: ["L1 (Lasso)", "L2 (Ridge)", "Dropout", "Batch normalization"],
      fr: ["L1 (Lasso)", "L2 (Ridge)", "Dropout", "Normalisation par lots (batch normalization)"],
      ar: ["L1 (Lasso)", "L2 (Ridge)", "الإسقاط (Dropout)", "التطبيع بالدُفعات (batch normalization)"]
    },
    answer: 0,
    explain: {
      en: "The L1 penalty λ·Σ|wⱼ| pushes weak weights all the way to zero, removing those features from the model. L2 shrinks weights toward zero but almost never makes them exactly zero.",
      fr: "La pénalité L1 λ·Σ|wⱼ| pousse les poids faibles jusqu’à zéro, retirant ces variables du modèle. L2 rapproche les poids de zéro mais ne les annule presque jamais exactement.",
      ar: "تدفع عقوبة L1 أي λ·Σ|wⱼ| الأوزان الضعيفة حتى الصفر، فتُخرج تلك الميزات من النموذج. أما L2 فيقلّص الأوزان نحو الصفر لكنه لا يجعلها صفرًا تمامًا إلا نادرًا."
    }
  },
  {
    id: "theory-reg-alpha-underfit",
    concept: "regularization-l1-l2",
    difficulty: 2,
    q: {
      en: "A Ridge model with alpha=100 has poor scores on both training and validation data. What should you try?",
      fr: "Un modèle Ridge avec alpha=100 a de mauvais scores à l’entraînement comme en validation. Que faut-il essayer ?",
      ar: "نموذج Ridge مع alpha=100 يحقق نتائج ضعيفة على بيانات التدريب والتحقق معًا. ماذا ينبغي أن تجرّب؟"
    },
    options: {
      en: ["Increase alpha to 1,000", "Decrease alpha, e.g. search 0.01 to 10 with cross-validation", "Switch to L1 with the same alpha", "Remove half of the training data"],
      fr: ["Monter alpha à 1 000", "Baisser alpha, par ex. chercher entre 0,01 et 10 par validation croisée", "Passer en L1 avec le même alpha", "Retirer la moitié des données d’entraînement"],
      ar: ["رفع alpha إلى 1,000", "خفض alpha، مثلًا بالبحث بين 0.01 و10 بالتحقق المتقاطع", "التحوّل إلى L1 مع قيمة alpha نفسها", "حذف نصف بيانات التدريب"]
    },
    answer: 1,
    explain: {
      en: "Poor training scores mean underfitting, and a very strong penalty is a likely cause because it forces all weights toward zero. Lower alpha, searching on a log scale with cross-validation.",
      fr: "De mauvais scores d’entraînement signalent un sous-apprentissage, et une pénalité très forte en est une cause probable puisqu’elle écrase tous les poids vers zéro. Baissez alpha, en cherchant sur une échelle logarithmique par validation croisée.",
      ar: "النتائج الضعيفة على التدريب تعني نقص التخصيص، والعقوبة القوية جدًا سبب مرجّح لأنها تدفع كل الأوزان نحو الصفر. اخفض alpha مع البحث على مقياس لوغاريتمي بالتحقق المتقاطع."
    }
  },
  {
    id: "theory-reg-elastic-net",
    concept: "regularization-l1-l2",
    difficulty: 2,
    q: {
      en: "Your data has groups of strongly correlated features, and you want both feature selection and stable coefficients. Which penalty fits?",
      fr: "Vos données contiennent des groupes de variables très corrélées, et vous voulez à la fois une sélection de variables et des coefficients stables. Quelle pénalité convient ?",
      ar: "تحتوي بياناتك على مجموعات من الميزات شديدة الارتباط، وتريد اختيار الميزات ومعاملات مستقرة معًا. أيّ عقوبة تناسب ذلك؟"
    },
    options: {
      en: ["Pure L1 (Lasso)", "Pure L2 (Ridge)", "No regularization", "Elastic Net (a mix of L1 and L2)"],
      fr: ["L1 pur (Lasso)", "L2 pur (Ridge)", "Aucune régularisation", "Elastic Net (mélange de L1 et L2)"],
      ar: ["L1 خالص (Lasso)", "L2 خالص (Ridge)", "بلا تنظيم", "Elastic Net (مزيج من L1 وL2)"]
    },
    answer: 3,
    explain: {
      en: "Lasso alone tends to pick one feature from a correlated group somewhat arbitrarily, and Ridge never selects. Elastic Net combines L1 sparsity with L2 stability, so correlated features are kept or dropped together.",
      fr: "Le Lasso seul choisit souvent une variable d’un groupe corrélé de façon un peu arbitraire, et Ridge ne sélectionne jamais. Elastic Net combine la parcimonie de L1 et la stabilité de L2 : les variables corrélées sont gardées ou écartées ensemble.",
      ar: "يميل Lasso وحده إلى اختيار ميزة واحدة من المجموعة المترابطة بشكل شبه اعتباطي، وRidge لا يختار أبدًا. أما Elastic Net فيجمع تناثر L1 واستقرار L2، فتُحفظ الميزات المترابطة أو تُحذف معًا."
    }
  },
  {
    id: "theory-reg-scale-before-penalty",
    concept: "regularization-l1-l2",
    difficulty: 3,
    q: {
      en: "You fit Lasso on unscaled features: income in dollars and age in years. Why is the result unreliable?",
      fr: "Vous ajustez un Lasso sur des variables non mises à l’échelle : le revenu en dollars et l’âge en années. Pourquoi le résultat n’est-il pas fiable ?",
      ar: "لائمت نموذج Lasso على ميزات غير موحّدة المقاييس: الدخل بالدولار والعمر بالسنوات. لماذا تكون النتيجة غير موثوقة؟"
    },
    options: {
      en: ["Lasso cannot handle more than one feature", "The penalty depends on coefficient size, which depends on units, so features are penalized unequally", "Unscaled features make Lasso equivalent to Ridge", "Age would always get a weight of zero"],
      fr: ["Le Lasso ne gère pas plus d’une variable", "La pénalité dépend de la taille des coefficients, qui dépend des unités : les variables sont pénalisées inégalement", "Des variables non mises à l’échelle rendent le Lasso équivalent à Ridge", "L’âge recevrait toujours un poids nul"],
      ar: ["لأن Lasso لا يتعامل مع أكثر من ميزة واحدة", "لأن العقوبة تتوقف على حجم المعاملات، وهذا يتوقف على الوحدات، فتُعاقَب الميزات بشكل غير متكافئ", "لأن الميزات غير الموحّدة تجعل Lasso مكافئًا لـ Ridge", "لأن العمر سيحصل دائمًا على وزن صفر"]
    },
    answer: 1,
    explain: {
      en: "A feature in large units needs only a tiny coefficient, so it is barely penalized, while a small-unit feature needs a big one and gets shrunk hard. Standardizing first makes the penalty treat every feature fairly.",
      fr: "Une variable en grandes unités n’a besoin que d’un coefficient minuscule et est à peine pénalisée, alors qu’une variable en petites unités demande un gros coefficient et est fortement réduite. Standardiser d’abord rend la pénalité équitable pour chaque variable.",
      ar: "الميزة ذات الوحدات الكبيرة لا تحتاج إلا إلى معامل صغير جدًا فلا تكاد تُعاقَب، بينما تحتاج الميزة ذات الوحدات الصغيرة إلى معامل كبير فتُقلَّص بشدة. والتوحيد القياسي أولًا يجعل العقوبة منصفة لكل ميزة."
    }
  },

  // ── hyperparameter-tuning ─────────────────────────────────
  {
    id: "theory-hp-param-vs-hyperparam",
    concept: "hyperparameter-tuning",
    difficulty: 1,
    q: {
      en: "Which of these is a hyperparameter rather than a learned parameter?",
      fr: "Lequel de ces éléments est un hyperparamètre plutôt qu’un paramètre appris ?",
      ar: "أيّ مما يلي معاملٌ فائق (hyperparameter) وليس معاملًا متعلَّمًا؟"
    },
    options: {
      en: ["The coefficients of a linear regression", "The weights of a neural network", "The max_depth of a decision tree", "The split thresholds chosen inside a tree"],
      fr: ["Les coefficients d’une régression linéaire", "Les poids d’un réseau de neurones", "Le max_depth d’un arbre de décision", "Les seuils de coupure choisis dans un arbre"],
      ar: ["معاملات الانحدار الخطي", "أوزان الشبكة العصبية", "max_depth لشجرة القرار", "عتبات التقسيم المختارة داخل الشجرة"]
    },
    answer: 2,
    explain: {
      en: "Hyperparameters are set before training and control how learning happens, like max_depth or the learning rate. Weights, coefficients and split thresholds are learned from the data during fit.",
      fr: "Les hyperparamètres sont fixés avant l’entraînement et contrôlent la façon d’apprendre, comme max_depth ou le taux d’apprentissage. Poids, coefficients et seuils de coupure sont appris à partir des données pendant fit.",
      ar: "تُضبط المعاملات الفائقة قبل التدريب وتتحكم في طريقة التعلّم، مثل max_depth أو معدل التعلم. أما الأوزان والمعاملات وعتبات التقسيم فتُتعلَّم من البيانات أثناء fit."
    }
  },
  {
    id: "theory-hp-random-vs-grid",
    concept: "hyperparameter-tuning",
    difficulty: 2,
    q: {
      en: "You must tune 6 hyperparameters, but only 2 of them really matter, and you have a limited compute budget. Which search is usually more efficient?",
      fr: "Vous devez régler 6 hyperparamètres, dont seulement 2 comptent vraiment, avec un budget de calcul limité. Quelle recherche est généralement plus efficace ?",
      ar: "عليك ضبط 6 معاملات فائقة، اثنان منها فقط مهمّان فعلًا، وميزانية الحوسبة محدودة. أيّ بحث يكون عادةً أكثر كفاءة؟"
    },
    options: {
      en: ["RandomizedSearchCV", "GridSearchCV over every combination", "Manual tuning one value at a time", "Tuning on the test set"],
      fr: ["RandomizedSearchCV", "GridSearchCV sur toutes les combinaisons", "Réglage manuel une valeur à la fois", "Réglage sur le jeu de test"],
      ar: ["RandomizedSearchCV", "GridSearchCV على كل التوليفات", "الضبط اليدوي قيمةً تلو الأخرى", "الضبط على مجموعة الاختبار"]
    },
    answer: 0,
    explain: {
      en: "A grid spends most trials repeating the same few values of the important parameters while varying unimportant ones. Random sampling tries a new value of every parameter in each trial, so it explores the ones that matter far more densely.",
      fr: "Une grille consacre la plupart des essais à répéter les mêmes quelques valeurs des paramètres importants en faisant varier ceux qui ne comptent pas. L’échantillonnage aléatoire essaie une nouvelle valeur de chaque paramètre à chaque essai et explore donc bien plus finement ceux qui comptent.",
      ar: "تنفق الشبكة معظم المحاولات في تكرار القيم القليلة نفسها للمعاملات المهمة مع تغيير غير المهمة. أما أخذ العيّنات العشوائي فيجرّب قيمة جديدة لكل معامل في كل محاولة، فيستكشف المعاملات المهمة بكثافة أكبر بكثير."
    }
  },
  {
    id: "theory-hp-grid-fit-count",
    concept: "hyperparameter-tuning",
    difficulty: 3,
    q: {
      en: "GridSearchCV tries 4 values of max_depth, 5 values of n_estimators and 3 values of learning_rate with cv=5. How many model fits does the search run (ignoring the final refit)?",
      fr: "GridSearchCV essaie 4 valeurs de max_depth, 5 de n_estimators et 3 de learning_rate avec cv=5. Combien d’entraînements la recherche lance-t-elle (hors réentraînement final) ?",
      ar: "يجرّب GridSearchCV أربع قيم لـ max_depth وخمسًا لـ n_estimators وثلاثًا لـ learning_rate مع cv=5. كم عملية ملاءمة يجري البحث (دون احتساب إعادة الملاءمة النهائية)؟"
    },
    options: {
      en: ["12", "60", "75", "300"],
      fr: ["12", "60", "75", "300"],
      ar: ["12", "60", "75", "300"]
    },
    answer: 3,
    explain: {
      en: "The grid has 4 × 5 × 3 = 60 combinations, and each is trained once per fold: 60 × 5 = 300 fits. This multiplicative growth is why large grids become expensive so quickly.",
      fr: "La grille compte 4 × 5 × 3 = 60 combinaisons, chacune entraînée une fois par pli : 60 × 5 = 300 entraînements. Cette croissance multiplicative explique pourquoi les grandes grilles deviennent vite coûteuses.",
      ar: "تضم الشبكة 4 × 5 × 3 = 60 توليفة، تُدرَّب كلٌّ منها مرة في كل طيّة: 60 × 5 = 300 عملية ملاءمة. وهذا النمو التضاعفي هو سبب الكلفة السريعة للشبكات الكبيرة."
    }
  },
  {
    id: "theory-hp-tuning-on-test-set",
    concept: "hyperparameter-tuning",
    difficulty: 2,
    q: {
      en: "Why should hyperparameters be chosen with cross-validation on the training data rather than by checking scores on the test set?",
      fr: "Pourquoi choisir les hyperparamètres par validation croisée sur l’entraînement plutôt qu’en regardant les scores sur le jeu de test ?",
      ar: "لماذا يجب اختيار المعاملات الفائقة بالتحقق المتقاطع على بيانات التدريب بدل النظر في النتائج على مجموعة الاختبار؟"
    },
    options: {
      en: ["Cross-validation is always faster", "The test set is too small to train on", "Test-set scores cannot be computed for tuned models", "Tuning on the test set fits it indirectly, so its score no longer estimates performance on new data"],
      fr: ["La validation croisée est toujours plus rapide", "Le jeu de test est trop petit pour entraîner", "On ne peut pas calculer de score de test pour un modèle réglé", "Régler sur le test l’ajuste indirectement : son score n’estime plus la performance sur de nouvelles données"],
      ar: ["لأن التحقق المتقاطع أسرع دائمًا", "لأن مجموعة الاختبار أصغر من أن يُدرَّب عليها", "لأنه لا يمكن حساب نتائج الاختبار للنماذج المضبوطة", "لأن الضبط على مجموعة الاختبار يلائمها بشكل غير مباشر، فلا تعود نتيجتها تقديرًا للأداء على بيانات جديدة"]
    },
    answer: 3,
    explain: {
      en: "Every time you choose a setting because it scored better on the test set, the test set influences the model. Keep it untouched until the end so that it stays an honest estimate of generalization.",
      fr: "Chaque fois que vous choisissez un réglage parce qu’il a mieux réussi sur le test, ce jeu influence le modèle. Gardez-le intact jusqu’à la fin pour qu’il reste une estimation honnête de la généralisation.",
      ar: "في كل مرة تختار فيها إعدادًا لأنه حقق نتيجة أفضل على مجموعة الاختبار، تؤثر هذه المجموعة في النموذج. أبقِها دون مساس حتى النهاية لتظل تقديرًا نزيهًا للتعميم."
    }
  },

  // ── ensemble-methods ──────────────────────────────────────
  {
    id: "theory-ens-bagging-vs-boosting",
    concept: "ensemble-methods",
    difficulty: 1,
    q: {
      en: "Which statement correctly contrasts bagging and boosting?",
      fr: "Quelle affirmation oppose correctement le bagging et le boosting ?",
      ar: "أيّ عبارة تقارن بشكل صحيح بين التجميع بالإقلاع (bagging) والتعزيز (boosting)؟"
    },
    options: {
      en: ["Bagging trains models sequentially to cut bias; boosting trains them in parallel to cut variance", "Bagging trains models in parallel to cut variance; boosting trains them sequentially to cut bias", "Both train a single model on the full dataset", "Bagging requires neural networks; boosting requires linear models"],
      fr: ["Le bagging entraîne les modèles en séquence pour réduire le biais ; le boosting en parallèle pour réduire la variance", "Le bagging entraîne les modèles en parallèle pour réduire la variance ; le boosting en séquence pour réduire le biais", "Les deux entraînent un seul modèle sur tout le jeu de données", "Le bagging exige des réseaux de neurones ; le boosting des modèles linéaires"],
      ar: ["يدرّب bagging النماذج بالتتابع لتقليل الانحياز، ويدرّبها boosting بالتوازي لتقليل التباين", "يدرّب bagging النماذج بالتوازي لتقليل التباين، ويدرّبها boosting بالتتابع لتقليل الانحياز", "كلاهما يدرّب نموذجًا واحدًا على كامل البيانات", "يتطلب bagging شبكات عصبية، ويتطلب boosting نماذج خطية"]
    },
    answer: 1,
    explain: {
      en: "Bagging, as in Random Forest, averages independent models trained on bootstrap samples, which cancels out their variance. Boosting adds models one after another, each correcting the errors of the current ensemble, which steadily reduces bias.",
      fr: "Le bagging, comme dans la forêt aléatoire, fait la moyenne de modèles indépendants entraînés sur des échantillons bootstrap, ce qui compense leur variance. Le boosting ajoute les modèles l’un après l’autre, chacun corrigeant les erreurs de l’ensemble actuel, ce qui réduit progressivement le biais.",
      ar: "يأخذ bagging، كما في الغابة العشوائية، متوسط نماذج مستقلة دُرّبت على عيّنات bootstrap، فيُلغي تباينها. أما boosting فيضيف النماذج واحدًا تلو الآخر، كلٌّ منها يصحّح أخطاء المجموعة الحالية، فيقلّ الانحياز تدريجيًا."
    }
  },
  {
    id: "theory-ens-correlated-models",
    concept: "ensemble-methods",
    difficulty: 2,
    q: {
      en: "Averaging 10 almost identical models gives nearly no improvement over a single one. Why?",
      fr: "Faire la moyenne de 10 modèles presque identiques n’apporte presque rien par rapport à un seul. Pourquoi ?",
      ar: "أخذ متوسط 10 نماذج شبه متطابقة لا يكاد يحسّن شيئًا مقارنةً بنموذج واحد. لماذا؟"
    },
    options: {
      en: ["Their errors are highly correlated, so averaging cannot cancel them", "Ten models is too few; you need at least 1,000", "Averaging always increases bias", "Ensembles only work for classification"],
      fr: ["Leurs erreurs sont très corrélées : la moyenne ne peut pas les compenser", "Dix modèles, c’est trop peu ; il en faut au moins 1 000", "La moyenne augmente toujours le biais", "Les ensembles ne marchent qu’en classification"],
      ar: ["لأن أخطاءها شديدة الارتباط، فلا يستطيع المتوسط إلغاءها", "لأن عشرة نماذج قليلة جدًا؛ يلزم 1,000 على الأقل", "لأن أخذ المتوسط يزيد الانحياز دائمًا", "لأن المجموعات لا تعمل إلا في التصنيف"]
    },
    answer: 0,
    explain: {
      en: "The variance of an average of B models is ρσ² + (1 − ρ)σ²/B, so when correlation ρ is close to 1 adding models barely helps. That is why Random Forest adds randomness, such as random feature subsets, to make trees disagree.",
      fr: "La variance d’une moyenne de B modèles vaut ρσ² + (1 − ρ)σ²/B : quand la corrélation ρ est proche de 1, ajouter des modèles n’aide presque pas. C’est pourquoi la forêt aléatoire ajoute du hasard, comme des sous-ensembles aléatoires de variables, pour rendre les arbres différents.",
      ar: "تباين متوسط B نموذجًا يساوي ρσ² + (1 − ρ)σ²/B، فحين يقترب الارتباط ρ من 1 لا تكاد إضافة النماذج تفيد. ولهذا تضيف الغابة العشوائية عشوائيةً، كمجموعات جزئية عشوائية من الميزات، لتجعل الأشجار مختلفة."
    }
  },
  {
    id: "theory-ens-n-estimators-overfit",
    concept: "ensemble-methods",
    difficulty: 2,
    q: {
      en: "What happens as you keep increasing n_estimators?",
      fr: "Que se passe-t-il quand on augmente sans cesse n_estimators ?",
      ar: "ماذا يحدث عندما تستمر في زيادة n_estimators؟"
    },
    options: {
      en: ["Both bagging and boosting inevitably overfit", "Neither changes at all after 10 estimators", "Bagging overfits, while boosting keeps improving forever", "Bagging just plateaus, while boosting can overfit, so use early stopping"],
      fr: ["Le bagging comme le boosting surapprennent inévitablement", "Ni l’un ni l’autre ne change après 10 estimateurs", "Le bagging surapprend, tandis que le boosting s’améliore indéfiniment", "Le bagging plafonne simplement, tandis que le boosting peut surapprendre : utilisez l’arrêt précoce"],
      ar: ["يفرط كلٌّ من bagging وboosting في التخصيص حتمًا", "لا يتغيّر أيّ منهما إطلاقًا بعد 10 مقدِّرات", "يفرط bagging في التخصيص بينما يتحسّن boosting إلى ما لا نهاية", "يستقر bagging عند حدّ ما، بينما قد يفرط boosting في التخصيص، فاستخدم الإيقاف المبكر"]
    },
    answer: 3,
    explain: {
      en: "Adding more bagged trees only makes the average more stable, at the cost of compute. Each boosting round fits the remaining errors more closely, so after a point it starts fitting noise; set n_estimators high and stop on a validation set.",
      fr: "Ajouter des arbres en bagging ne fait que stabiliser la moyenne, au prix du calcul. Chaque tour de boosting ajuste de plus près les erreurs restantes et finit par ajuster le bruit : fixez n_estimators haut et arrêtez-vous grâce à une validation.",
      ar: "إضافة مزيد من الأشجار في bagging لا تفعل سوى زيادة استقرار المتوسط على حساب الحوسبة. أما كل جولة في boosting فتلائم الأخطاء المتبقية عن قرب أكثر، فتبدأ بعد حدّ معيّن بملاءمة الضجيج؛ اضبط n_estimators على قيمة عالية وأوقف التدريب بالاعتماد على مجموعة تحقق."
    }
  },
  {
    id: "theory-ens-stacking-out-of-fold",
    concept: "ensemble-methods",
    difficulty: 3,
    q: {
      en: "A stacking meta-model is trained on base-model predictions made on the same rows the base models were trained on. Validation looks great, production is much worse. What is the fix?",
      fr: "Un méta-modèle de stacking est entraîné sur des prédictions des modèles de base faites sur les lignes mêmes qui ont servi à les entraîner. La validation est excellente, la production bien pire. Quel est le correctif ?",
      ar: "دُرِّب نموذج فوقي (meta-model) للتكديس (stacking) على تنبؤات النماذج الأساسية على الصفوف نفسها التي دُرّبت عليها هذه النماذج. يبدو التحقق ممتازًا والإنتاج أسوأ بكثير. ما الحل؟"
    },
    options: {
      en: ["Use a deeper, more complex meta-model", "Train the meta-model on out-of-fold predictions of the base models", "Add more copies of the best base model", "Remove the meta-model and keep only one base model"],
      fr: ["Utiliser un méta-modèle plus profond et plus complexe", "Entraîner le méta-modèle sur les prédictions hors pli des modèles de base", "Ajouter des copies du meilleur modèle de base", "Supprimer le méta-modèle et ne garder qu’un modèle de base"],
      ar: ["استخدام نموذج فوقي أعمق وأعقد", "تدريب النموذج الفوقي على تنبؤات النماذج الأساسية خارج الطيّة (out-of-fold)", "إضافة نسخ إضافية من أفضل نموذج أساسي", "حذف النموذج الفوقي والإبقاء على نموذج أساسي واحد"]
    },
    answer: 1,
    explain: {
      en: "In-sample predictions are overconfident, especially from models that overfit, so the meta-model learns to trust them too much. Out-of-fold predictions mimic how base models behave on unseen data; that is what StackingClassifier does with its cv argument.",
      fr: "Les prédictions sur l’échantillon d’entraînement sont trop confiantes, surtout pour des modèles qui surapprennent : le méta-modèle apprend à trop s’y fier. Les prédictions hors pli imitent le comportement des modèles de base sur des données inédites ; c’est ce que fait StackingClassifier avec son argument cv.",
      ar: "التنبؤات على عيّنة التدريب نفسها مفرطة الثقة، خصوصًا من النماذج التي تفرط في التخصيص، فيتعلّم النموذج الفوقي الثقة بها أكثر من اللازم. أما التنبؤات خارج الطيّة فتحاكي سلوك النماذج الأساسية على بيانات غير مرئية، وهذا ما يفعله StackingClassifier عبر الوسيط cv."
    }
  }
];
