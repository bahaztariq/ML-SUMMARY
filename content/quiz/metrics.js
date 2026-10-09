/** Quiz questions: metrics. See index.js for the question format. */
/** @type {import('./index.js').Question[]} */
export default [
  {
    id: "metric-cm-false-positive",
    concept: "confusion-matrix-concept",
    difficulty: 1,
    q: {
      en: "In a confusion matrix, what is a false positive?",
      fr: "Dans une matrice de confusion, qu'est-ce qu'un faux positif ?",
      ar: "في مصفوفة الالتباس (confusion matrix)، ما هي الإيجابية الكاذبة (false positive)؟"
    },
    options: {
      en: ["The model predicted negative, but the true class is positive", "The model predicted positive, but the true class is negative", "The model predicted positive and the true class is positive", "The model predicted negative and the true class is negative"],
      fr: ["Le modèle a prédit négatif, mais la vraie classe est positive", "Le modèle a prédit positif, mais la vraie classe est négative", "Le modèle a prédit positif et la vraie classe est positive", "Le modèle a prédit négatif et la vraie classe est négative"],
      ar: ["تنبأ النموذج بالسلبي، لكن الفئة الحقيقية إيجابية", "تنبأ النموذج بالإيجابي، لكن الفئة الحقيقية سلبية", "تنبأ النموذج بالإيجابي والفئة الحقيقية إيجابية", "تنبأ النموذج بالسلبي والفئة الحقيقية سلبية"]
    },
    answer: 1,
    explain: {
      en: "\"False\" says the prediction was wrong and \"positive\" says what was predicted. A false positive is a false alarm, also called a Type I error. Predicting negative for a true positive would be a false negative.",
      fr: "« Faux » indique que la prédiction est erronée et « positif » ce qui a été prédit. Un faux positif est une fausse alerte, aussi appelée erreur de type I. Prédire négatif pour un vrai positif serait un faux négatif.",
      ar: "كلمة «كاذبة» تعني أن التنبؤ خاطئ، و«إيجابية» تصف ما تنبأ به النموذج. فالإيجابية الكاذبة إنذار كاذب، ويُسمّى أيضًا خطأ من النوع الأول. أما التنبؤ بالسلبي لحالة إيجابية فعلًا فهو سلبية كاذبة (false negative)."
    }
  },
  {
    id: "metric-cm-screening-fn",
    concept: "confusion-matrix-concept",
    difficulty: 1,
    q: {
      en: "In a cancer-screening model, which cell of the confusion matrix counts sick patients the model sent home as healthy?",
      fr: "Dans un modèle de dépistage du cancer, quelle case de la matrice de confusion compte les patients malades que le modèle a renvoyés chez eux comme sains ?",
      ar: "في نموذج للكشف عن السرطان، أي خانة في مصفوفة الالتباس تعدّ المرضى الذين صنّفهم النموذج أصحّاء فأعادهم إلى منازلهم؟"
    },
    options: {
      en: ["False positives (FP)", "True negatives (TN)", "True positives (TP)", "False negatives (FN)"],
      fr: ["Les faux positifs (FP)", "Les vrais négatifs (TN)", "Les vrais positifs (TP)", "Les faux négatifs (FN)"],
      ar: ["الإيجابيات الكاذبة (FP)", "السلبيات الصحيحة (TN)", "الإيجابيات الصحيحة (TP)", "السلبيات الكاذبة (FN)"]
    },
    answer: 3,
    explain: {
      en: "The truth is positive (sick) but the prediction is negative (healthy): a false negative, or Type II error. In screening this is usually the costliest mistake, which is why recall matters so much there.",
      fr: "La vérité est positive (malade) mais la prédiction négative (sain) : c'est un faux négatif, ou erreur de type II. En dépistage, c'est généralement l'erreur la plus coûteuse, d'où l'importance du rappel.",
      ar: "الحقيقة إيجابية (مريض) لكن التنبؤ سلبي (سليم): هذه سلبية كاذبة أو خطأ من النوع الثاني. وفي الكشف الطبي تكون عادةً أكثر الأخطاء كلفة، ولهذا يهمّ الاستدعاء (recall) كثيرًا هناك."
    }
  },
  {
    id: "metric-cm-accuracy-imbalance",
    concept: "confusion-matrix-concept",
    difficulty: 2,
    q: {
      en: "Only 1% of transactions are fraud. Why can accuracy alone be misleading here?",
      fr: "Seulement 1 % des transactions sont frauduleuses. Pourquoi l'exactitude (accuracy) seule peut-elle être trompeuse ici ?",
      ar: "نسبة الاحتيال 1% فقط من المعاملات. لماذا قد تكون الدقة (accuracy) وحدها مضلِّلة هنا؟"
    },
    options: {
      en: ["A model that always predicts \"not fraud\" scores 99% accuracy while catching no fraud at all", "Accuracy ignores true positives", "Accuracy cannot go above 50% on imbalanced data", "Accuracy can only be computed from probabilities"],
      fr: ["Un modèle qui prédit toujours « pas de fraude » obtient 99 % d'exactitude sans détecter aucune fraude", "L'exactitude ignore les vrais positifs", "L'exactitude ne peut pas dépasser 50 % sur des données déséquilibrées", "L'exactitude ne se calcule qu'à partir de probabilités"],
      ar: ["النموذج الذي يتنبأ دائمًا بـ«ليس احتيالًا» يحقق دقة 99% دون أن يكتشف أي احتيال", "لأن الدقة تتجاهل الإيجابيات الصحيحة", "لأن الدقة لا يمكن أن تتجاوز 50% على البيانات غير المتوازنة", "لأن الدقة لا تُحسب إلا من الاحتمالات"]
    },
    answer: 0,
    explain: {
      en: "Accuracy = (TP + TN) / total is dominated by the huge negative class. The confusion matrix exposes the problem immediately: TP = 0 and every fraud is a false negative.",
      fr: "Exactitude = (TP + TN) / total est dominée par l'énorme classe négative. La matrice de confusion révèle tout de suite le problème : TP = 0 et chaque fraude est un faux négatif.",
      ar: "الدقة = (TP + TN) / المجموع، وتهيمن عليها الفئة السلبية الكبيرة. وتكشف مصفوفة الالتباس المشكلة فورًا: TP = 0 وكل حالة احتيال سلبية كاذبة."
    }
  },
  {
    id: "metric-cm-accuracy-calc",
    concept: "confusion-matrix-concept",
    difficulty: 3,
    q: {
      en: "A classifier gives TP = 40, FP = 10, FN = 20 and TN = 130. What is its accuracy?",
      fr: "Un classifieur donne TP = 40, FP = 10, FN = 20 et TN = 130. Quelle est son exactitude ?",
      ar: "أعطى مصنِّف القيم TP = 40 وFP = 10 وFN = 20 وTN = 130. ما دقته (accuracy)؟"
    },
    options: {
      en: ["0.80", "0.75", "0.85", "0.65"],
      fr: ["0.80", "0.75", "0.85", "0.65"],
      ar: ["0.80", "0.75", "0.85", "0.65"]
    },
    answer: 2,
    explain: {
      en: "Accuracy = (TP + TN) / total = (40 + 130) / (40 + 10 + 20 + 130) = 170 / 200 = 0.85.",
      fr: "Exactitude = (TP + TN) / total = (40 + 130) / (40 + 10 + 20 + 130) = 170 / 200 = 0.85.",
      ar: "الدقة = (TP + TN) / المجموع = (40 + 130) / (40 + 10 + 20 + 130) = 170 / 200 = 0.85."
    }
  },
  {
    id: "metric-prf-recall-formula",
    concept: "precision-recall-f1",
    difficulty: 1,
    q: {
      en: "Which formula defines recall?",
      fr: "Quelle formule définit le rappel ?",
      ar: "ما الصيغة التي تعرّف الاستدعاء (recall)؟"
    },
    options: {
      en: ["TP / (TP + FP)", "TN / (TN + FP)", "TP / (TP + FN)", "(TP + TN) / total"],
      fr: ["TP / (TP + FP)", "TN / (TN + FP)", "TP / (TP + FN)", "(TP + TN) / total"],
      ar: ["TP / (TP + FP)", "TN / (TN + FP)", "TP / (TP + FN)", "(TP + TN) / المجموع"]
    },
    answer: 2,
    explain: {
      en: "Recall is the share of actual positives that were caught. TP / (TP + FP) is precision, TN / (TN + FP) is specificity, and (TP + TN) / total is accuracy.",
      fr: "Le rappel est la part des positifs réels qui ont été détectés. TP / (TP + FP) est la précision, TN / (TN + FP) la spécificité, et (TP + TN) / total l'exactitude.",
      ar: "الاستدعاء هو نسبة الحالات الإيجابية الفعلية التي التُقطت. أما TP / (TP + FP) فهي الضبط (precision)، وTN / (TN + FP) هي النوعية (specificity)، و(TP + TN) / المجموع هي الدقة (accuracy)."
    }
  },
  {
    id: "metric-prf-spam-precision",
    concept: "precision-recall-f1",
    difficulty: 2,
    q: {
      en: "For a spam filter, sending a real email to the spam folder is very costly, while letting some spam through is tolerable. Which metric should you prioritize?",
      fr: "Pour un filtre anti-spam, envoyer un vrai e-mail dans les spams coûte très cher, alors que laisser passer un peu de spam est tolérable. Quelle métrique faut-il privilégier ?",
      ar: "في مرشّح الرسائل المزعجة (spam)، إرسال رسالة حقيقية إلى مجلد الرسائل المزعجة مكلف جدًا، بينما مرور بعض الرسائل المزعجة مقبول. أي مقياس يجب أن تعطيه الأولوية؟"
    },
    options: {
      en: ["Precision", "Recall", "F2-score", "Accuracy"],
      fr: ["La précision", "Le rappel", "Le score F2", "L'exactitude"],
      ar: ["الضبط (precision)", "الاستدعاء (recall)", "مقياس F2", "الدقة (accuracy)"]
    },
    answer: 0,
    explain: {
      en: "\"Spam\" is the positive class, so a real email flagged as spam is a false positive. Precision = TP / (TP + FP) directly punishes false positives; recall and F2 favor catching every spam.",
      fr: "« Spam » est la classe positive : un vrai e-mail marqué comme spam est un faux positif. La précision = TP / (TP + FP) pénalise directement les faux positifs ; le rappel et le F2 favorisent la détection de tous les spams.",
      ar: "الفئة الإيجابية هي «مزعج»، فالرسالة الحقيقية الموسومة كمزعجة إيجابية كاذبة. والضبط = TP / (TP + FP) يعاقب الإيجابيات الكاذبة مباشرة، أما الاستدعاء وF2 فيفضّلان التقاط كل الرسائل المزعجة."
    }
  },
  {
    id: "metric-prf-threshold",
    concept: "precision-recall-f1",
    difficulty: 2,
    q: {
      en: "You raise a classifier's decision threshold from 0.5 to 0.8. What typically happens?",
      fr: "Vous relevez le seuil de décision d'un classifieur de 0.5 à 0.8. Que se passe-t-il en général ?",
      ar: "رفعت عتبة القرار لمصنِّف من 0.5 إلى 0.8. ماذا يحدث عادةً؟"
    },
    options: {
      en: ["Precision and recall both go up", "Precision goes down and recall goes up", "Neither changes, since the model is the same", "Precision goes up and recall goes down"],
      fr: ["La précision et le rappel augmentent tous les deux", "La précision diminue et le rappel augmente", "Aucun ne change, puisque le modèle est le même", "La précision augmente et le rappel diminue"],
      ar: ["يرتفع الضبط والاستدعاء معًا", "ينخفض الضبط ويرتفع الاستدعاء", "لا يتغير أيٌّ منهما لأن النموذج نفسه", "يرتفع الضبط وينخفض الاستدعاء"]
    },
    answer: 3,
    explain: {
      en: "A higher threshold labels fewer samples positive: the ones that remain are more confident (fewer FP, higher precision), but more real positives fall below the cut (more FN, lower recall).",
      fr: "Un seuil plus haut étiquette moins d'exemples comme positifs : ceux qui restent sont plus sûrs (moins de FP, précision plus haute), mais davantage de vrais positifs passent sous le seuil (plus de FN, rappel plus bas).",
      ar: "العتبة الأعلى تسِم عيّنات أقل بأنها إيجابية: الباقية أكثر ثقة (إيجابيات كاذبة أقل وضبط أعلى)، لكن عددًا أكبر من الإيجابيات الحقيقية يقع تحت العتبة (سلبيات كاذبة أكثر واستدعاء أقل)."
    }
  },
  {
    id: "metric-prf-f1-calc",
    concept: "precision-recall-f1",
    difficulty: 3,
    q: {
      en: "A model has TP = 30, FP = 10 and FN = 20. What is its F1-score (rounded)?",
      fr: "Un modèle a TP = 30, FP = 10 et FN = 20. Quel est son score F1 (arrondi) ?",
      ar: "لنموذج القيم TP = 30 وFP = 10 وFN = 20. ما قيمة مقياس F1 لديه (مقرّبة)؟"
    },
    options: {
      en: ["0.68", "0.67", "0.60", "0.75"],
      fr: ["0.68", "0.67", "0.60", "0.75"],
      ar: ["0.68", "0.67", "0.60", "0.75"]
    },
    answer: 1,
    explain: {
      en: "Precision = 30/40 = 0.75 and recall = 30/50 = 0.60. F1 = 2·0.75·0.60 / (0.75 + 0.60) = 0.9 / 1.35 ≈ 0.67. The plain average would be 0.675 ≈ 0.68; the harmonic mean is pulled toward the smaller value.",
      fr: "Précision = 30/40 = 0.75 et rappel = 30/50 = 0.60. F1 = 2·0.75·0.60 / (0.75 + 0.60) = 0.9 / 1.35 ≈ 0.67. La moyenne simple serait 0.675 ≈ 0.68 ; la moyenne harmonique est tirée vers la plus petite valeur.",
      ar: "الضبط = 30/40 = 0.75 والاستدعاء = 30/50 = 0.60. إذن F1 = 2·0.75·0.60 / (0.75 + 0.60) = 0.9 / 1.35 ≈ 0.67. المتوسط الحسابي البسيط سيكون 0.675 ≈ 0.68، أما المتوسط التوافقي فينجذب نحو القيمة الأصغر."
    }
  },
  {
    id: "metric-roc-axes",
    concept: "roc-auc",
    difficulty: 1,
    q: {
      en: "What does a ROC curve plot?",
      fr: "Que trace une courbe ROC ?",
      ar: "ماذا يرسم منحنى ROC؟"
    },
    options: {
      en: ["True positive rate against false positive rate, across all thresholds", "Precision against recall, across all thresholds", "Accuracy against the decision threshold", "Training loss against the number of epochs"],
      fr: ["Le taux de vrais positifs en fonction du taux de faux positifs, pour tous les seuils", "La précision en fonction du rappel, pour tous les seuils", "L'exactitude en fonction du seuil de décision", "La perte d'entraînement en fonction du nombre d'époques"],
      ar: ["معدل الإيجابيات الصحيحة (TPR) مقابل معدل الإيجابيات الكاذبة (FPR) عبر كل العتبات", "الضبط مقابل الاستدعاء عبر كل العتبات", "الدقة مقابل عتبة القرار", "خسارة التدريب مقابل عدد الحقب"]
    },
    answer: 0,
    explain: {
      en: "Each threshold gives one (FPR, TPR) point, with TPR = TP/(TP+FN) and FPR = FP/(FP+TN). Precision against recall is the PR curve.",
      fr: "Chaque seuil donne un point (FPR, TPR), avec TPR = TP/(TP+FN) et FPR = FP/(FP+TN). La précision en fonction du rappel, c'est la courbe PR.",
      ar: "تعطي كل عتبة نقطة (FPR, TPR)، حيث TPR = TP/(TP+FN) وFPR = FP/(FP+TN). أما الضبط مقابل الاستدعاء فهو منحنى PR."
    }
  },
  {
    id: "metric-roc-auc-half",
    concept: "roc-auc",
    difficulty: 1,
    q: {
      en: "What does a ROC-AUC of 0.5 mean?",
      fr: "Que signifie un ROC-AUC de 0.5 ?",
      ar: "ماذا تعني قيمة ROC-AUC تساوي 0.5؟"
    },
    options: {
      en: ["The model is perfect", "The model has exactly 50% accuracy", "The model ranks positives and negatives no better than random guessing", "The model is wrong on every prediction"],
      fr: ["Le modèle est parfait", "Le modèle a exactement 50 % d'exactitude", "Le modèle ne classe pas mieux les positifs et les négatifs qu'un tirage au hasard", "Le modèle se trompe sur chaque prédiction"],
      ar: ["النموذج مثالي", "دقة النموذج 50% بالضبط", "النموذج لا يرتّب الإيجابيات والسلبيات أفضل من التخمين العشوائي", "النموذج يخطئ في كل تنبؤ"]
    },
    answer: 2,
    explain: {
      en: "AUC is a ranking measure: 0.5 is the diagonal of a coin flip, 1.0 is perfect separation. It is not the same as accuracy, which depends on one threshold and on class balance.",
      fr: "L'AUC mesure un classement : 0.5 correspond à la diagonale d'un pile ou face, 1.0 à une séparation parfaite. Ce n'est pas l'exactitude, qui dépend d'un seuil et de l'équilibre des classes.",
      ar: "AUC مقياس للترتيب: 0.5 هي قطر رمي العملة، و1.0 فصل مثالي. وهي ليست الدقة (accuracy) التي تعتمد على عتبة واحدة وعلى توازن الفئات."
    }
  },
  {
    id: "metric-roc-auc-meaning",
    concept: "roc-auc",
    difficulty: 2,
    q: {
      en: "Which interpretation of ROC-AUC = 0.8 is correct?",
      fr: "Quelle interprétation d'un ROC-AUC = 0.8 est correcte ?",
      ar: "أي تفسير لقيمة ROC-AUC = 0.8 صحيح؟"
    },
    options: {
      en: ["The model is right on 80% of predictions", "A random positive gets a higher score than a random negative 80% of the time", "The model catches 80% of positives at threshold 0.5", "The predicted probabilities are 80% calibrated"],
      fr: ["Le modèle a raison sur 80 % des prédictions", "Un positif tiré au hasard obtient un score plus élevé qu'un négatif tiré au hasard dans 80 % des cas", "Le modèle détecte 80 % des positifs au seuil 0.5", "Les probabilités prédites sont calibrées à 80 %"],
      ar: ["النموذج مصيب في 80% من التنبؤات", "يحصل مثال إيجابي عشوائي على درجة أعلى من مثال سلبي عشوائي في 80% من الحالات", "يلتقط النموذج 80% من الإيجابيات عند العتبة 0.5", "الاحتمالات المتنبأ بها معايَرة بنسبة 80%"]
    },
    answer: 1,
    explain: {
      en: "AUC = P(score(positive) > score(negative)). It summarizes ranking over all thresholds, so it says nothing directly about accuracy, recall at 0.5 or calibration.",
      fr: "AUC = P(score(positif) > score(négatif)). Elle résume le classement sur tous les seuils : elle ne dit rien directement de l'exactitude, du rappel à 0.5 ni de la calibration.",
      ar: "AUC = P(score(positive) > score(negative)). فهي تلخّص الترتيب عبر كل العتبات، ولا تخبر مباشرة عن الدقة ولا عن الاستدعاء عند 0.5 ولا عن المعايرة."
    }
  },
  {
    id: "metric-roc-point-calc",
    concept: "roc-auc",
    difficulty: 3,
    q: {
      en: "At one threshold a model has TP = 80, FN = 20, FP = 30 and TN = 270. Which (FPR, TPR) point does this add to the ROC curve?",
      fr: "À un certain seuil, un modèle a TP = 80, FN = 20, FP = 30 et TN = 270. Quel point (FPR, TPR) cela ajoute-t-il à la courbe ROC ?",
      ar: "عند عتبة معيّنة، لنموذج القيم TP = 80 وFN = 20 وFP = 30 وTN = 270. ما النقطة (FPR, TPR) التي يضيفها ذلك إلى منحنى ROC؟"
    },
    options: {
      en: ["(0.80, 0.10)", "(0.27, 0.73)", "(0.11, 0.80)", "(0.10, 0.80)"],
      fr: ["(0.80, 0.10)", "(0.27, 0.73)", "(0.11, 0.80)", "(0.10, 0.80)"],
      ar: ["(0.80, 0.10)", "(0.27, 0.73)", "(0.11, 0.80)", "(0.10, 0.80)"]
    },
    answer: 3,
    explain: {
      en: "TPR = TP/(TP + FN) = 80/100 = 0.80 and FPR = FP/(FP + TN) = 30/300 = 0.10. Dividing FP by TN alone (30/270) gives the wrong 0.11.",
      fr: "TPR = TP/(TP + FN) = 80/100 = 0.80 et FPR = FP/(FP + TN) = 30/300 = 0.10. Diviser FP par TN seul (30/270) donne à tort 0.11.",
      ar: "TPR = TP/(TP + FN) = 80/100 = 0.80 وFPR = FP/(FP + TN) = 30/300 = 0.10. أما قسمة FP على TN وحدها (30/270) فتعطي القيمة الخاطئة 0.11."
    }
  },
  {
    id: "metric-roc-auc-below-half",
    concept: "roc-auc",
    difficulty: 3,
    q: {
      en: "Your new model scores ROC-AUC = 0.2 on the test set. What is the most likely explanation?",
      fr: "Votre nouveau modèle obtient un ROC-AUC = 0.2 sur le jeu de test. Quelle est l'explication la plus probable ?",
      ar: "حصل نموذجك الجديد على ROC-AUC = 0.2 على مجموعة الاختبار. ما التفسير الأرجح؟"
    },
    options: {
      en: ["Its ranking is inverted, e.g. swapped labels or the wrong probability column; flipping the scores would give 0.8", "It is slightly worse than random but basically fine", "AUC below 0.5 is impossible, so the metric is broken", "The test set has too few negatives for AUC to work"],
      fr: ["Son classement est inversé, par ex. étiquettes permutées ou mauvaise colonne de probabilité ; inverser les scores donnerait 0.8", "Il est un peu moins bon que le hasard mais globalement correct", "Une AUC sous 0.5 est impossible, la métrique est donc cassée", "Le jeu de test a trop peu de négatifs pour que l'AUC fonctionne"],
      ar: ["ترتيبه معكوس، مثل تبديل التسميات أو استخدام عمود الاحتمال الخاطئ، وعكس الدرجات سيعطي 0.8", "هو أسوأ قليلًا من العشوائي لكنه مقبول عمومًا", "قيمة AUC تحت 0.5 مستحيلة، فالمقياس معطّل", "مجموعة الاختبار فيها سلبيات قليلة جدًا ليعمل AUC"]
    },
    answer: 0,
    explain: {
      en: "An AUC well below 0.5 means the model systematically scores negatives above positives, which carries real information pointing the wrong way: AUC(−score) = 1 − 0.2 = 0.8. Check the label encoding or which column of predict_proba you used.",
      fr: "Une AUC bien inférieure à 0.5 signifie que le modèle note systématiquement les négatifs au-dessus des positifs : il y a de l'information, mais dans le mauvais sens, AUC(−score) = 1 − 0.2 = 0.8. Vérifiez l'encodage des étiquettes ou la colonne de predict_proba utilisée.",
      ar: "قيمة AUC أدنى بكثير من 0.5 تعني أن النموذج يعطي السلبيات درجات أعلى من الإيجابيات بانتظام، فهناك معلومة حقيقية لكن في الاتجاه المعاكس: AUC(−score) = 1 − 0.2 = 0.8. تحقّق من ترميز التسميات أو من عمود predict_proba الذي استخدمته."
    }
  },
  {
    id: "metric-pr-axes",
    concept: "pr-curve",
    difficulty: 1,
    q: {
      en: "What does a precision-recall (PR) curve show?",
      fr: "Que montre une courbe précision-rappel (PR) ?",
      ar: "ماذا يُظهر منحنى الضبط والاستدعاء (PR curve)؟"
    },
    options: {
      en: ["True positive rate against false positive rate", "Predicted against actual values", "Loss against training epochs", "Precision against recall as the decision threshold varies"],
      fr: ["Le taux de vrais positifs en fonction du taux de faux positifs", "Les valeurs prédites en fonction des valeurs réelles", "La perte en fonction des époques d'entraînement", "La précision en fonction du rappel quand le seuil de décision varie"],
      ar: ["معدل الإيجابيات الصحيحة مقابل معدل الإيجابيات الكاذبة", "القيم المتنبأ بها مقابل القيم الفعلية", "الخسارة مقابل حقب التدريب", "الضبط مقابل الاستدعاء مع تغيّر عتبة القرار"]
    },
    answer: 3,
    explain: {
      en: "Sweeping the threshold gives one (recall, precision) point per setting, and Average Precision summarizes the curve. TPR against FPR is the ROC curve.",
      fr: "Balayer le seuil donne un point (rappel, précision) par réglage, et la précision moyenne (Average Precision) résume la courbe. TPR en fonction de FPR, c'est la courbe ROC.",
      ar: "مسح قيم العتبة يعطي نقطة (استدعاء، ضبط) لكل قيمة، ويلخّص متوسط الضبط (Average Precision) المنحنى. أما TPR مقابل FPR فهو منحنى ROC."
    }
  },
  {
    id: "metric-pr-baseline",
    concept: "pr-curve",
    difficulty: 2,
    q: {
      en: "On a dataset where 2% of samples are positive, what PR-AUC (Average Precision) does a random classifier get?",
      fr: "Sur un jeu où 2 % des exemples sont positifs, quelle PR-AUC (précision moyenne) obtient un classifieur aléatoire ?",
      ar: "على مجموعة بيانات نسبة الإيجابيات فيها 2%، ما قيمة PR-AUC (متوسط الضبط) لمصنِّف عشوائي؟"
    },
    options: {
      en: ["About 0.5", "About 0.02", "Exactly 0", "About 0.98"],
      fr: ["Environ 0.5", "Environ 0.02", "Exactement 0", "Environ 0.98"],
      ar: ["نحو 0.5", "نحو 0.02", "صفر تمامًا", "نحو 0.98"]
    },
    answer: 1,
    explain: {
      en: "A random classifier's precision equals the positive rate at every recall level, so its PR-AUC ≈ prevalence = 0.02. That is why PR-AUC values cannot be compared across datasets with different prevalences, unlike ROC-AUC's fixed 0.5 baseline.",
      fr: "La précision d'un classifieur aléatoire vaut le taux de positifs à tout niveau de rappel : sa PR-AUC ≈ prévalence = 0.02. C'est pourquoi on ne peut pas comparer des PR-AUC entre jeux de prévalences différentes, contrairement à la référence fixe de 0.5 du ROC-AUC.",
      ar: "ضبط المصنِّف العشوائي يساوي نسبة الإيجابيات عند كل مستوى استدعاء، فتكون PR-AUC ≈ نسبة الانتشار = 0.02. لهذا لا تصح مقارنة قيم PR-AUC بين مجموعات بيانات بنسب انتشار مختلفة، بخلاف خط الأساس الثابت 0.5 في ROC-AUC."
    }
  },
  {
    id: "metric-pr-hard-labels",
    concept: "pr-curve",
    difficulty: 2,
    q: {
      en: "Why does passing hard 0/1 predictions instead of scores to precision_recall_curve give an almost useless curve?",
      fr: "Pourquoi passer des prédictions 0/1 au lieu de scores à precision_recall_curve donne-t-il une courbe presque inutile ?",
      ar: "لماذا يعطي تمرير تنبؤات صلبة 0/1 بدل الدرجات إلى precision_recall_curve منحنى عديم الفائدة تقريبًا؟"
    },
    options: {
      en: ["It raises an error because labels must be strings", "Hard labels make precision always equal to 1", "With only two distinct values there is a single threshold, so the curve collapses to one point", "The curve becomes identical to the ROC curve"],
      fr: ["Cela lève une erreur car les étiquettes doivent être des chaînes", "Des étiquettes binaires rendent la précision toujours égale à 1", "Avec seulement deux valeurs distinctes, il n'y a qu'un seuil : la courbe se réduit à un point", "La courbe devient identique à la courbe ROC"],
      ar: ["لأنه يرفع خطأً إذ يجب أن تكون التسميات نصوصًا", "لأن التسميات الصلبة تجعل الضبط مساويًا لـ 1 دائمًا", "مع قيمتين مختلفتين فقط توجد عتبة واحدة، فينهار المنحنى إلى نقطة واحدة", "لأن المنحنى يصبح مطابقًا لمنحنى ROC"]
    },
    answer: 2,
    explain: {
      en: "The curve is built by sweeping a threshold over continuous scores (y_score), e.g. predict_proba(X)[:, 1]. Hard labels contain only one operating point, so there is nothing to sweep.",
      fr: "La courbe se construit en faisant varier un seuil sur des scores continus (y_score), par ex. predict_proba(X)[:, 1]. Des étiquettes binaires ne contiennent qu'un point de fonctionnement : il n'y a rien à balayer.",
      ar: "يُبنى المنحنى بتمرير عتبة على درجات متصلة (y_score) مثل predict_proba(X)[:, 1]. أما التسميات الصلبة فلا تحتوي إلا على نقطة تشغيل واحدة، فلا شيء يمكن مسحه."
    }
  },
  {
    id: "metric-pr-fraud-choice",
    concept: "pr-curve",
    difficulty: 3,
    q: {
      en: "On a fraud dataset with 0.1% fraud, model A has ROC-AUC 0.97 and PR-AUC 0.30; model B has ROC-AUC 0.96 and PR-AUC 0.55. Analysts must investigate every flagged case. Which model should you prefer?",
      fr: "Sur un jeu de fraude avec 0.1 % de fraudes, le modèle A a un ROC-AUC de 0.97 et une PR-AUC de 0.30 ; le modèle B a un ROC-AUC de 0.96 et une PR-AUC de 0.55. Les analystes doivent examiner chaque cas signalé. Quel modèle préférer ?",
      ar: "على بيانات احتيال نسبة الاحتيال فيها 0.1%، للنموذج A قيمة ROC-AUC = 0.97 وPR-AUC = 0.30، وللنموذج B قيمة ROC-AUC = 0.96 وPR-AUC = 0.55. يجب على المحللين فحص كل حالة موسومة. أي نموذج تفضّل؟"
    },
    options: {
      en: ["B: PR-AUC shows its flags are far more often real fraud", "A: it has the higher ROC-AUC", "Either: a 0.01 ROC-AUC gap means they are equivalent", "Neither: only accuracy matters for fraud"],
      fr: ["B : la PR-AUC montre que ses alertes sont bien plus souvent de vraies fraudes", "A : il a le ROC-AUC le plus élevé", "L'un ou l'autre : un écart de 0.01 de ROC-AUC les rend équivalents", "Aucun : seule l'exactitude compte pour la fraude"],
      ar: ["B: تُظهر PR-AUC أن الحالات التي يسِمها احتيال حقيقي في أغلب الأحيان", "A: لأن ROC-AUC لديه أعلى", "أيهما: فرق 0.01 في ROC-AUC يعني أنهما متكافئان", "لا هذا ولا ذاك: الدقة وحدها هي المهمة في الاحتيال"]
    },
    answer: 0,
    explain: {
      en: "With 99.9% negatives, the false positive rate stays tiny even when false alarms swamp the true frauds, so ROC-AUC looks great for both. PR-AUC focuses on precision among flagged cases, which is exactly the analysts' workload.",
      fr: "Avec 99.9 % de négatifs, le taux de faux positifs reste minuscule même quand les fausses alertes submergent les vraies fraudes : le ROC-AUC paraît excellent pour les deux. La PR-AUC se concentre sur la précision parmi les cas signalés, soit exactement la charge des analystes.",
      ar: "مع 99.9% من السلبيات يبقى معدل الإيجابيات الكاذبة ضئيلًا حتى عندما تغمر الإنذارات الكاذبة حالات الاحتيال الحقيقية، فيبدو ROC-AUC ممتازًا للنموذجين. أما PR-AUC فيركّز على الضبط بين الحالات الموسومة، وهو بالضبط عبء عمل المحللين."
    }
  },
  {
    id: "metric-logloss-perfect",
    concept: "log-loss",
    difficulty: 1,
    q: {
      en: "What is the log-loss of a model that assigns probability 1 to the correct class on every sample?",
      fr: "Quelle est la log-loss d'un modèle qui attribue une probabilité de 1 à la bonne classe pour chaque exemple ?",
      ar: "ما قيمة الخسارة اللوغاريتمية (log-loss) لنموذج يعطي احتمال 1 للفئة الصحيحة في كل عيّنة؟"
    },
    options: {
      en: ["1", "0.5", "0", "−∞"],
      fr: ["1", "0.5", "0", "−∞"],
      ar: ["1", "0.5", "0", "−∞"]
    },
    answer: 2,
    explain: {
      en: "Each sample contributes −log(p) for the true class, and −log(1) = 0. Log-loss is never negative; higher values mean worse probabilities.",
      fr: "Chaque exemple contribue −log(p) pour la vraie classe, et −log(1) = 0. La log-loss n'est jamais négative ; plus elle est grande, plus les probabilités sont mauvaises.",
      ar: "تساهم كل عيّنة بالقيمة −log(p) للفئة الحقيقية، و−log(1) = 0. ولا تكون الخسارة اللوغاريتمية سالبة أبدًا، وكلما كبرت كانت الاحتمالات أسوأ."
    }
  },
  {
    id: "metric-logloss-clipping",
    concept: "log-loss",
    difficulty: 1,
    q: {
      en: "Why do log-loss implementations clip predicted probabilities, e.g. to [1e-15, 1 − 1e-15]?",
      fr: "Pourquoi les implémentations de la log-loss bornent-elles les probabilités prédites, par ex. dans [1e-15, 1 − 1e-15] ?",
      ar: "لماذا تقصّ تطبيقات log-loss الاحتمالات المتنبأ بها، مثلًا إلى المجال [1e-15, 1 − 1e-15]؟"
    },
    options: {
      en: ["Because log(0) = −∞: one confident wrong 0/1 prediction would make the loss infinite", "To make the computation faster", "To improve the model's accuracy", "To balance the classes"],
      fr: ["Parce que log(0) = −∞ : une seule prédiction 0/1 fausse et sûre rendrait la perte infinie", "Pour accélérer le calcul", "Pour améliorer l'exactitude du modèle", "Pour équilibrer les classes"],
      ar: ["لأن log(0) = −∞، فتنبؤ واحد خاطئ وواثق بقيمة 0 أو 1 سيجعل الخسارة لا نهائية", "لتسريع الحساب", "لتحسين دقة النموذج", "لموازنة الفئات"]
    },
    answer: 0,
    explain: {
      en: "If the model outputs p = 0 for a sample whose class is 1, the term −log(0) is infinite. Clipping keeps the loss finite while still giving that mistake a very large penalty.",
      fr: "Si le modèle sort p = 0 pour un exemple de classe 1, le terme −log(0) est infini. Le bornage garde la perte finie tout en infligeant une très forte pénalité à cette erreur.",
      ar: "إذا أعطى النموذج p = 0 لعيّنة فئتها 1، يصبح الحد −log(0) لا نهائيًا. يُبقي القصّ الخسارة محدودة مع إعطاء هذا الخطأ عقوبة كبيرة جدًا."
    }
  },
  {
    id: "metric-logloss-confident-wrong",
    concept: "log-loss",
    difficulty: 2,
    q: {
      en: "Two models are both wrong on a negative sample: A predicts P(positive) = 0.55 and B predicts 0.99. How do their log-loss penalties compare?",
      fr: "Deux modèles se trompent sur un exemple négatif : A prédit P(positif) = 0.55 et B prédit 0.99. Comment se comparent leurs pénalités de log-loss ?",
      ar: "نموذجان كلاهما مخطئ في عيّنة سلبية: يتنبأ A بأن P(positive) = 0.55 وB بـ 0.99. كيف تقارَن عقوبتاهما في log-loss؟"
    },
    options: {
      en: ["A is penalized more because it is closer to 0.5", "B is penalized far more: −ln(0.01) ≈ 4.6 versus −ln(0.45) ≈ 0.80", "They are penalized equally since both are wrong", "Neither is penalized; log-loss only counts correct predictions"],
      fr: ["A est plus pénalisé car il est plus proche de 0.5", "B est bien plus pénalisé : −ln(0.01) ≈ 4.6 contre −ln(0.45) ≈ 0.80", "Ils sont pénalisés de la même façon puisque les deux se trompent", "Aucun n'est pénalisé ; la log-loss ne compte que les bonnes prédictions"],
      ar: ["يُعاقَب A أكثر لأنه أقرب إلى 0.5", "يُعاقَب B أكثر بكثير: −ln(0.01) ≈ 4.6 مقابل −ln(0.45) ≈ 0.80", "يُعاقَبان بالقدر نفسه لأن كليهما مخطئ", "لا يُعاقَب أيٌّ منهما، فـ log-loss لا تحسب إلا التنبؤات الصحيحة"]
    },
    answer: 1,
    explain: {
      en: "For a negative sample the loss is −ln(1 − p). The penalty grows without bound as a wrong prediction becomes more confident, which is how log-loss rewards calibrated humility.",
      fr: "Pour un exemple négatif, la perte vaut −ln(1 − p). La pénalité croît sans limite à mesure qu'une prédiction fausse devient plus sûre : c'est ainsi que la log-loss récompense une humilité bien calibrée.",
      ar: "للعيّنة السلبية تكون الخسارة −ln(1 − p). وتزداد العقوبة بلا حدود كلما ازدادت ثقة التنبؤ الخاطئ، وهكذا تكافئ log-loss التواضع المعايَر جيدًا."
    }
  },
  {
    id: "metric-logloss-single-calc",
    concept: "log-loss",
    difficulty: 3,
    q: {
      en: "A sample has true label y = 1 and the model predicts p = 0.8. What is its log-loss contribution (natural log, rounded)?",
      fr: "Un exemple a pour vraie étiquette y = 1 et le modèle prédit p = 0.8. Quelle est sa contribution à la log-loss (logarithme népérien, arrondie) ?",
      ar: "عيّنة تسميتها الحقيقية y = 1 والنموذج يتنبأ بـ p = 0.8. ما مساهمتها في log-loss (باللوغاريتم الطبيعي، مقرّبة)؟"
    },
    options: {
      en: ["0.20", "0.80", "1.61", "0.22"],
      fr: ["0.20", "0.80", "1.61", "0.22"],
      ar: ["0.20", "0.80", "1.61", "0.22"]
    },
    answer: 3,
    explain: {
      en: "With y = 1 only the first term is active: −ln(0.8) ≈ 0.223. 0.20 is just 1 − p, and 1.61 = −ln(0.2) is what you would get if the label were 0.",
      fr: "Avec y = 1, seul le premier terme est actif : −ln(0.8) ≈ 0.223. 0.20 est simplement 1 − p, et 1.61 = −ln(0.2) correspond au cas où l'étiquette serait 0.",
      ar: "مع y = 1 يعمل الحد الأول فقط: −ln(0.8) ≈ 0.223. أما 0.20 فهي مجرد 1 − p، و1.61 = −ln(0.2) هي ما ستحصل عليه لو كانت التسمية 0."
    }
  },
  {
    id: "metric-rmse-units",
    concept: "rmse-metric",
    difficulty: 1,
    q: {
      en: "A house-price model is evaluated with RMSE. In what unit is the RMSE expressed?",
      fr: "Un modèle de prix immobiliers est évalué par la RMSE. Dans quelle unité la RMSE s'exprime-t-elle ?",
      ar: "يُقيَّم نموذج لأسعار المنازل بمقياس RMSE. بأي وحدة يُعبَّر عن RMSE؟"
    },
    options: {
      en: ["Dollars squared", "Dollars, the same unit as the target", "A unitless score between 0 and 1", "A percentage of the mean price"],
      fr: ["En dollars au carré", "En dollars, la même unité que la cible", "Un score sans unité entre 0 et 1", "Un pourcentage du prix moyen"],
      ar: ["بالدولار المربّع", "بالدولار، وهي وحدة الهدف نفسها", "درجة بلا وحدة بين 0 و1", "نسبة مئوية من متوسط السعر"]
    },
    answer: 1,
    explain: {
      en: "MSE is in squared units (dollars²); taking the square root brings RMSE back to the target's unit, so it reads as a typical error size in dollars.",
      fr: "La MSE est en unités au carré (dollars²) ; la racine carrée ramène la RMSE à l'unité de la cible, qui se lit alors comme une taille d'erreur typique en dollars.",
      ar: "يكون MSE بوحدات مربّعة (دولار²)، وأخذ الجذر التربيعي يعيد RMSE إلى وحدة الهدف، فيُقرأ كحجم خطأ نموذجي بالدولار."
    }
  },
  {
    id: "metric-rmse-when",
    concept: "rmse-metric",
    difficulty: 1,
    q: {
      en: "When is RMSE a better evaluation choice than MAE?",
      fr: "Quand la RMSE est-elle un meilleur choix d'évaluation que la MAE ?",
      ar: "متى يكون RMSE خيار تقييم أفضل من MAE؟"
    },
    options: {
      en: ["When the data contains outliers you want to ignore", "When you need a metric that is not differentiable", "When the target is categorical", "When large errors are disproportionately costly and should weigh more"],
      fr: ["Quand les données contiennent des valeurs aberrantes qu'on veut ignorer", "Quand on a besoin d'une métrique non différentiable", "Quand la cible est catégorielle", "Quand les grosses erreurs coûtent disproportionnellement cher et doivent peser plus"],
      ar: ["عندما تحتوي البيانات على قيم شاذة تريد تجاهلها", "عندما تحتاج إلى مقياس غير قابل للاشتقاق", "عندما يكون الهدف فئويًا", "عندما تكون الأخطاء الكبيرة مكلفة بشكل غير متناسب ويجب أن يكون وزنها أكبر"]
    },
    answer: 3,
    explain: {
      en: "Squaring makes an error of 10 count 100 times more than an error of 1, so RMSE strongly prefers models without big misses. If outliers should not dominate, MAE is the better fit.",
      fr: "Le carré fait compter une erreur de 10 cent fois plus qu'une erreur de 1 : la RMSE favorise fortement les modèles sans grosses erreurs. Si les valeurs aberrantes ne doivent pas dominer, la MAE convient mieux.",
      ar: "التربيع يجعل خطأً قيمته 10 يُحتسب أكثر بمئة مرة من خطأ قيمته 1، فيفضّل RMSE بقوة النماذج الخالية من الأخطاء الكبيرة. وإذا كان لا ينبغي للقيم الشاذة أن تهيمن، فإن MAE أنسب."
    }
  },
  {
    id: "metric-rmse-vs-mae-gap",
    concept: "rmse-metric",
    difficulty: 2,
    q: {
      en: "On the same predictions, RMSE is much larger than MAE. What does this suggest?",
      fr: "Sur les mêmes prédictions, la RMSE est bien plus grande que la MAE. Qu'est-ce que cela suggère ?",
      ar: "على التنبؤات نفسها، قيمة RMSE أكبر بكثير من MAE. ماذا يشير ذلك؟"
    },
    options: {
      en: ["A few predictions have very large errors", "All errors have roughly the same size", "The model is nearly perfect", "The target contains negative values"],
      fr: ["Quelques prédictions ont de très grosses erreurs", "Toutes les erreurs ont à peu près la même taille", "Le modèle est presque parfait", "La cible contient des valeurs négatives"],
      ar: ["بعض التنبؤات أخطاؤها كبيرة جدًا", "كل الأخطاء متقاربة الحجم", "النموذج شبه مثالي", "الهدف يحتوي على قيم سالبة"]
    },
    answer: 0,
    explain: {
      en: "RMSE ≥ MAE always, with equality only when every absolute error is the same. A large gap means the squared errors are dominated by a few big misses worth investigating.",
      fr: "On a toujours RMSE ≥ MAE, avec égalité seulement si toutes les erreurs absolues sont identiques. Un grand écart signifie que quelques grosses erreurs dominent les carrés : elles méritent une analyse.",
      ar: "دائمًا RMSE ≥ MAE، ولا يتساويان إلا إذا تساوت كل الأخطاء المطلقة. الفجوة الكبيرة تعني أن بعض الأخطاء الكبيرة تهيمن على المربعات، وتستحق التحقيق."
    }
  },
  {
    id: "metric-rmse-calc",
    concept: "rmse-metric",
    difficulty: 3,
    q: {
      en: "A model's errors (y − ŷ) on four samples are 2, −2, 4 and −4. What is the RMSE?",
      fr: "Les erreurs (y − ŷ) d'un modèle sur quatre exemples sont 2, −2, 4 et −4. Quelle est la RMSE ?",
      ar: "أخطاء نموذج (y − ŷ) على أربع عيّنات هي 2 و−2 و4 و−4. ما قيمة RMSE؟"
    },
    options: {
      en: ["3.00", "10.0", "≈ 3.16", "0"],
      fr: ["3.00", "10.0", "≈ 3.16", "0"],
      ar: ["3.00", "10.0", "≈ 3.16", "0"]
    },
    answer: 2,
    explain: {
      en: "Squares: 4, 4, 16, 16 → mean (MSE) = 40/4 = 10 → RMSE = √10 ≈ 3.16. 3.00 is the MAE, 10 is the MSE, and 0 is the mean signed error.",
      fr: "Carrés : 4, 4, 16, 16 → moyenne (MSE) = 40/4 = 10 → RMSE = √10 ≈ 3.16. 3.00 est la MAE, 10 la MSE, et 0 l'erreur moyenne signée.",
      ar: "المربعات: 4، 4، 16، 16 ← المتوسط (MSE) = 40/4 = 10 ← RMSE = √10 ≈ 3.16. أما 3.00 فهي MAE، و10 هي MSE، و0 هو متوسط الخطأ بإشارته."
    }
  },
  {
    id: "metric-mae-formula",
    concept: "mae-metric",
    difficulty: 1,
    q: {
      en: "How is the mean absolute error (MAE) computed?",
      fr: "Comment calcule-t-on l'erreur absolue moyenne (MAE) ?",
      ar: "كيف يُحسب متوسط الخطأ المطلق (MAE)؟"
    },
    options: {
      en: ["The average of |y − ŷ| over all samples", "The square root of the average of (y − ŷ)²", "The average of (y − ŷ), keeping signs", "1 minus the residual sum of squares over the total sum of squares"],
      fr: ["La moyenne de |y − ŷ| sur tous les exemples", "La racine carrée de la moyenne de (y − ŷ)²", "La moyenne de (y − ŷ), en gardant les signes", "1 moins la somme des carrés des résidus divisée par la somme totale des carrés"],
      ar: ["متوسط |y − ŷ| على جميع العيّنات", "الجذر التربيعي لمتوسط (y − ŷ)²", "متوسط (y − ŷ) مع الإبقاء على الإشارات", "1 ناقص مجموع مربعات البواقي مقسومًا على مجموع المربعات الكلي"]
    },
    answer: 0,
    explain: {
      en: "MAE = (1/n) Σ|yᵢ − ŷᵢ|. The square root of the mean squared error is RMSE, the signed mean lets positive and negative errors cancel out, and 1 − SS_res/SS_tot is R².",
      fr: "MAE = (1/n) Σ|yᵢ − ŷᵢ|. La racine de l'erreur quadratique moyenne est la RMSE, la moyenne signée laisse les erreurs positives et négatives s'annuler, et 1 − SS_res/SS_tot est le R².",
      ar: "MAE = (1/n) Σ|yᵢ − ŷᵢ|. جذر متوسط مربعات الخطأ هو RMSE، والمتوسط بالإشارة يسمح للأخطاء الموجبة والسالبة بأن تلغي بعضها، و1 − SS_res/SS_tot هو R²."
    }
  },
  {
    id: "metric-mae-outliers",
    concept: "mae-metric",
    difficulty: 1,
    q: {
      en: "Your delivery-time data contains a few extreme delays you do not want to dominate model evaluation. Which metric fits best?",
      fr: "Vos données de délais de livraison contiennent quelques retards extrêmes qui ne doivent pas dominer l'évaluation du modèle. Quelle métrique convient le mieux ?",
      ar: "تحتوي بيانات أوقات التوصيل لديك على بعض التأخيرات المتطرفة التي لا تريدها أن تهيمن على تقييم النموذج. أي مقياس هو الأنسب؟"
    },
    options: {
      en: ["RMSE", "MSE", "MAE", "Log-loss"],
      fr: ["La RMSE", "La MSE", "La MAE", "La log-loss"],
      ar: ["RMSE", "MSE", "MAE", "log-loss"]
    },
    answer: 2,
    explain: {
      en: "MAE weights each error in proportion to its size: an error of 100 counts 100, not 10,000 as in MSE. Log-loss is a classification metric.",
      fr: "La MAE pondère chaque erreur proportionnellement à sa taille : une erreur de 100 compte 100, pas 10 000 comme dans la MSE. La log-loss est une métrique de classification.",
      ar: "يزن MAE كل خطأ بما يتناسب مع حجمه: خطأ قيمته 100 يُحتسب 100 لا 10,000 كما في MSE. أما log-loss فمقياس للتصنيف."
    }
  },
  {
    id: "metric-mae-median",
    concept: "mae-metric",
    difficulty: 2,
    q: {
      en: "If a model must predict one constant value for every sample, which constant minimizes the MAE?",
      fr: "Si un modèle doit prédire une seule valeur constante pour tous les exemples, quelle constante minimise la MAE ?",
      ar: "إذا كان على نموذج أن يتنبأ بقيمة ثابتة واحدة لكل العيّنات، فأي قيمة ثابتة تقلّل MAE؟"
    },
    options: {
      en: ["The mean of the targets", "The median of the targets", "The mode of the targets", "The midpoint between the minimum and maximum"],
      fr: ["La moyenne des cibles", "La médiane des cibles", "Le mode des cibles", "Le milieu entre le minimum et le maximum"],
      ar: ["متوسط قيم الهدف", "وسيط قيم الهدف", "منوال قيم الهدف", "منتصف المسافة بين أصغر قيمة وأكبرها"]
    },
    answer: 1,
    explain: {
      en: "The sum of absolute deviations is smallest at the median, whereas squared error is minimized by the mean. This is another way to see why MAE is robust to outliers: the median barely moves when one value explodes.",
      fr: "La somme des écarts absolus est minimale à la médiane, alors que l'erreur quadratique est minimisée par la moyenne. C'est une autre façon de voir la robustesse de la MAE aux valeurs aberrantes : la médiane bouge à peine quand une valeur explose.",
      ar: "مجموع الانحرافات المطلقة يكون أصغر ما يمكن عند الوسيط، بينما يقلّل المتوسطُ الخطأَ التربيعي. وهذه طريقة أخرى لفهم متانة MAE أمام القيم الشاذة: فالوسيط بالكاد يتحرك عندما تنفجر قيمة واحدة."
    }
  },
  {
    id: "metric-mae-calc",
    concept: "mae-metric",
    difficulty: 3,
    q: {
      en: "Actual values are [10, 20, 30, 40] and predictions are [12, 18, 33, 40]. What is the MAE?",
      fr: "Les valeurs réelles sont [10, 20, 30, 40] et les prédictions [12, 18, 33, 40]. Quelle est la MAE ?",
      ar: "القيم الفعلية [10, 20, 30, 40] والتنبؤات [12, 18, 33, 40]. ما قيمة MAE؟"
    },
    options: {
      en: ["−0.75", "2.33", "4.25", "1.75"],
      fr: ["−0.75", "2.33", "4.25", "1.75"],
      ar: ["−0.75", "2.33", "4.25", "1.75"]
    },
    answer: 3,
    explain: {
      en: "Absolute errors: 2, 2, 3, 0 → sum 7 → MAE = 7/4 = 1.75. −0.75 is the signed mean error, 2.33 wrongly divides by 3, and 4.25 is the MSE (4 + 4 + 9 + 0)/4.",
      fr: "Erreurs absolues : 2, 2, 3, 0 → somme 7 → MAE = 7/4 = 1.75. −0.75 est l'erreur moyenne signée, 2.33 divise à tort par 3, et 4.25 est la MSE (4 + 4 + 9 + 0)/4.",
      ar: "الأخطاء المطلقة: 2، 2، 3، 0 ← المجموع 7 ← MAE = 7/4 = 1.75. أما −0.75 فهو متوسط الخطأ بإشارته، و2.33 تقسم خطأً على 3، و4.25 هي MSE أي (4 + 4 + 9 + 0)/4."
    }
  },
  {
    id: "metric-r2-zero",
    concept: "r2-score",
    difficulty: 1,
    q: {
      en: "What does R² = 0 mean for a regression model?",
      fr: "Que signifie R² = 0 pour un modèle de régression ?",
      ar: "ماذا تعني R² = 0 لنموذج انحدار؟"
    },
    options: {
      en: ["Its predictions are perfect", "It makes no errors on 0% of the samples", "It does no better than always predicting the mean of y", "It does worse than predicting the mean of y"],
      fr: ["Ses prédictions sont parfaites", "Il ne fait aucune erreur sur 0 % des exemples", "Il ne fait pas mieux que prédire toujours la moyenne de y", "Il fait pire que prédire la moyenne de y"],
      ar: ["تنبؤاته مثالية", "لا يخطئ في 0% من العيّنات", "لا يؤدي أفضل من التنبؤ الدائم بمتوسط y", "يؤدي أسوأ من التنبؤ بمتوسط y"]
    },
    answer: 2,
    explain: {
      en: "R² = 1 − SS_res/SS_tot, and SS_tot is exactly the error of the constant mean predictor. R² = 0 means SS_res = SS_tot; worse than the mean gives R² < 0.",
      fr: "R² = 1 − SS_res/SS_tot, et SS_tot est exactement l'erreur du prédicteur constant égal à la moyenne. R² = 0 signifie SS_res = SS_tot ; faire pire que la moyenne donne R² < 0.",
      ar: "R² = 1 − SS_res/SS_tot، وSS_tot هو بالضبط خطأ المتنبئ الثابت بالمتوسط. R² = 0 تعني SS_res = SS_tot، والأداء الأسوأ من المتوسط يعطي R² < 0."
    }
  },
  {
    id: "metric-r2-negative",
    concept: "r2-score",
    difficulty: 2,
    q: {
      en: "A model gets R² = −0.3 on the test set. What does this mean?",
      fr: "Un modèle obtient R² = −0.3 sur le jeu de test. Qu'est-ce que cela signifie ?",
      ar: "حصل نموذج على R² = −0.3 على مجموعة الاختبار. ماذا يعني ذلك؟"
    },
    options: {
      en: ["Its predictions are worse than simply predicting the mean of y", "There must be a bug, since R² cannot be negative", "The target is negatively correlated with the features", "The model explains 30% of the variance in the opposite direction"],
      fr: ["Ses prédictions sont pires que de prédire simplement la moyenne de y", "Il y a forcément un bug, car R² ne peut pas être négatif", "La cible est négativement corrélée aux variables", "Le modèle explique 30 % de la variance dans le sens inverse"],
      ar: ["تنبؤاته أسوأ من مجرد التنبؤ بمتوسط y", "لا بد من وجود خلل، لأن R² لا يمكن أن تكون سالبة", "الهدف مرتبط ارتباطًا سالبًا بالميزات", "النموذج يفسّر 30% من التباين في الاتجاه المعاكس"]
    },
    answer: 0,
    explain: {
      en: "On new data, nothing prevents SS_res from exceeding SS_tot, which makes R² negative. It usually signals severe overfitting or a pipeline bug such as misaligned predictions.",
      fr: "Sur de nouvelles données, rien n'empêche SS_res de dépasser SS_tot, ce qui rend R² négatif. C'est souvent le signe d'un fort surapprentissage ou d'un bug de pipeline, par exemple des prédictions mal alignées.",
      ar: "على بيانات جديدة لا شيء يمنع SS_res من تجاوز SS_tot، فتصبح R² سالبة. وعادةً ما يدل ذلك على إفراط شديد في التخصيص أو على خلل في خط المعالجة، مثل تنبؤات غير متطابقة مع صفوفها."
    }
  },
  {
    id: "metric-r2-adjusted",
    concept: "r2-score",
    difficulty: 2,
    q: {
      en: "Why use adjusted R² instead of plain R² to compare models with different numbers of features?",
      fr: "Pourquoi utiliser le R² ajusté plutôt que le R² simple pour comparer des modèles ayant des nombres de variables différents ?",
      ar: "لماذا نستخدم R² المعدَّل (adjusted R²) بدل R² العادي لمقارنة نماذج بأعداد مختلفة من الميزات؟"
    },
    options: {
      en: ["Adjusted R² is faster to compute", "Adjusted R² is bounded between 0 and 100", "Adjusted R² also works for classification", "Plain training R² never decreases when you add a feature, even a useless one"],
      fr: ["Le R² ajusté est plus rapide à calculer", "Le R² ajusté est borné entre 0 et 100", "Le R² ajusté fonctionne aussi pour la classification", "Le R² d'entraînement simple ne baisse jamais quand on ajoute une variable, même inutile"],
      ar: ["لأن R² المعدَّل أسرع حسابًا", "لأن R² المعدَّل محصور بين 0 و100", "لأن R² المعدَّل يصلح للتصنيف أيضًا", "لأن R² العادي على التدريب لا ينخفض أبدًا عند إضافة ميزة، حتى لو كانت عديمة الفائدة"]
    },
    answer: 3,
    explain: {
      en: "Adding a feature can only lower (or keep) the training residuals, so R² creeps up even for pure noise. Adjusted R² penalizes the number of predictors and only rises when a feature helps more than chance.",
      fr: "Ajouter une variable ne peut que réduire (ou garder) les résidus d'entraînement : le R² grimpe même pour du bruit pur. Le R² ajusté pénalise le nombre de prédicteurs et n'augmente que si une variable aide plus que le hasard.",
      ar: "إضافة ميزة لا يمكنها إلا أن تقلّل بواقي التدريب أو تبقيها، فيرتفع R² حتى مع ضجيج خالص. أما R² المعدَّل فيعاقب على عدد المتنبئات ولا يرتفع إلا إذا ساعدت الميزة أكثر من الصدفة."
    }
  },
  {
    id: "metric-r2-calc",
    concept: "r2-score",
    difficulty: 3,
    q: {
      en: "A regression model has SS_res = 20 and SS_tot = 80. What is its R²?",
      fr: "Un modèle de régression a SS_res = 20 et SS_tot = 80. Quel est son R² ?",
      ar: "لنموذج انحدار SS_res = 20 وSS_tot = 80. ما قيمة R² لديه؟"
    },
    options: {
      en: ["0.25", "0.75", "4.0", "−3.0"],
      fr: ["0.25", "0.75", "4.0", "−3.0"],
      ar: ["0.25", "0.75", "4.0", "−3.0"]
    },
    answer: 1,
    explain: {
      en: "R² = 1 − SS_res/SS_tot = 1 − 20/80 = 1 − 0.25 = 0.75: the model explains 75% of the variance. 0.25 is the unexplained share; −3.0 comes from swapping the two sums.",
      fr: "R² = 1 − SS_res/SS_tot = 1 − 20/80 = 1 − 0.25 = 0.75 : le modèle explique 75 % de la variance. 0.25 est la part non expliquée ; −3.0 vient d'une inversion des deux sommes.",
      ar: "R² = 1 − SS_res/SS_tot = 1 − 20/80 = 1 − 0.25 = 0.75، أي أن النموذج يفسّر 75% من التباين. 0.25 هي الحصة غير المفسَّرة، و−3.0 تنتج عن تبديل المجموعين."
    }
  },
  {
    id: "metric-silhouette-range",
    concept: "silhouette-score",
    difficulty: 1,
    q: {
      en: "What is the range of the silhouette score?",
      fr: "Quel est l'intervalle de valeurs du score de silhouette ?",
      ar: "ما مدى قيم معامل الصورة الظلية (silhouette score)؟"
    },
    options: {
      en: ["From 0 to 1", "From 0 to +∞", "From −∞ to 1", "From −1 to +1"],
      fr: ["De 0 à 1", "De 0 à +∞", "De −∞ à 1", "De −1 à +1"],
      ar: ["من 0 إلى 1", "من 0 إلى +∞", "من −∞ إلى 1", "من −1 إلى +1"]
    },
    answer: 3,
    explain: {
      en: "s(i) = (b − a) / max(a, b), which is always between −1 and +1: near +1 means well inside its cluster, near 0 means on a boundary, negative means probably in the wrong cluster. −∞ to 1 is the range of R².",
      fr: "s(i) = (b − a) / max(a, b), toujours entre −1 et +1 : proche de +1, le point est bien dans son cluster ; proche de 0, il est sur une frontière ; négatif, il est probablement dans le mauvais cluster. De −∞ à 1, c'est l'intervalle du R².",
      ar: "s(i) = (b − a) / max(a, b)، وهي دائمًا بين −1 و+1: قربها من +1 يعني أن النقطة في عمق عنقودها، وقربها من 0 يعني أنها على الحدود، والقيمة السالبة تعني أنها غالبًا في العنقود الخطأ. أما المدى من −∞ إلى 1 فهو مدى R²."
    }
  },
  {
    id: "metric-silhouette-negative",
    concept: "silhouette-score",
    difficulty: 1,
    q: {
      en: "A point has a negative silhouette value. What does that tell you?",
      fr: "Un point a une valeur de silhouette négative. Qu'est-ce que cela vous apprend ?",
      ar: "لنقطة قيمة صورة ظلية سالبة. ماذا يخبرك ذلك؟"
    },
    options: {
      en: ["It is an outlier that should be deleted", "It is on average closer to another cluster than to its own, so it is probably misassigned", "It sits exactly at its cluster's center", "Its cluster is the largest one"],
      fr: ["C'est une valeur aberrante à supprimer", "Il est en moyenne plus proche d'un autre cluster que du sien : il est probablement mal affecté", "Il se trouve exactement au centre de son cluster", "Son cluster est le plus grand"],
      ar: ["هي قيمة شاذة يجب حذفها", "هي في المتوسط أقرب إلى عنقود آخر منها إلى عنقودها، فالأرجح أنها أُسندت خطأً", "تقع تمامًا في مركز عنقودها", "عنقودها هو الأكبر"]
    },
    answer: 1,
    explain: {
      en: "Negative s(i) means b(i) < a(i): the mean distance to the nearest other cluster is smaller than to its own members. Many negative points suggest a poor choice of k or of algorithm.",
      fr: "Un s(i) négatif signifie b(i) < a(i) : la distance moyenne au cluster voisin le plus proche est plus petite que celle à ses propres membres. Beaucoup de points négatifs suggèrent un mauvais choix de k ou d'algorithme.",
      ar: "القيمة السالبة لـ s(i) تعني b(i) < a(i): متوسط المسافة إلى أقرب عنقود آخر أصغر من متوسطها إلى أعضاء عنقودها. وكثرة النقاط السالبة تشير إلى سوء اختيار k أو الخوارزمية."
    }
  },
  {
    id: "metric-silhouette-dbscan",
    concept: "silhouette-score",
    difficulty: 2,
    q: {
      en: "DBSCAN correctly separates two interlocking crescent-shaped clusters, yet the silhouette score is low. Why?",
      fr: "DBSCAN sépare correctement deux clusters en croissant imbriqués, et pourtant le score de silhouette est faible. Pourquoi ?",
      ar: "تفصل DBSCAN بشكل صحيح بين عنقودين متداخلين على شكل هلال، ومع ذلك يكون معامل الصورة الظلية منخفضًا. لماذا؟"
    },
    options: {
      en: ["Silhouette favors compact, convex clusters, so it penalizes elongated shapes even when they are right", "DBSCAN always produces wrong clusters", "Silhouette only works when labels are available", "The score must be computed with K-Means only"],
      fr: ["La silhouette favorise les clusters compacts et convexes : elle pénalise les formes allongées même quand elles sont justes", "DBSCAN produit toujours de mauvais clusters", "La silhouette ne fonctionne que si des étiquettes sont disponibles", "Le score doit être calculé uniquement avec K-Means"],
      ar: ["لأن الصورة الظلية تفضّل العناقيد المتراصة المحدّبة، فتعاقب الأشكال المستطيلة حتى عندما تكون صحيحة", "لأن DBSCAN تنتج دائمًا عناقيد خاطئة", "لأن الصورة الظلية لا تعمل إلا بوجود تسميات", "لأن المعامل يجب أن يُحسب مع K-Means فقط"]
    },
    answer: 0,
    explain: {
      en: "Points at the far ends of a crescent are far from their own cluster-mates on average, while the other crescent may be close, so a(i) is large and b(i) small. The clustering is right; the metric's convexity bias is the issue.",
      fr: "Les points aux extrémités d'un croissant sont en moyenne loin de leurs propres voisins de cluster, alors que l'autre croissant peut être proche : a(i) est grand et b(i) petit. Le clustering est juste ; c'est le biais de la métrique pour la convexité qui pose problème.",
      ar: "النقاط عند طرفي الهلال بعيدة في المتوسط عن أعضاء عنقودها، بينما قد يكون الهلال الآخر قريبًا، فتكبر a(i) وتصغر b(i). التجميع صحيح، والمشكلة في انحياز المقياس نحو الأشكال المحدّبة."
    }
  },
  {
    id: "metric-silhouette-calc",
    concept: "silhouette-score",
    difficulty: 3,
    q: {
      en: "For a point, the mean distance to its own cluster is a = 2 and the mean distance to the nearest other cluster is b = 5. What is its silhouette value?",
      fr: "Pour un point, la distance moyenne à son propre cluster est a = 2 et la distance moyenne au cluster voisin le plus proche est b = 5. Quelle est sa valeur de silhouette ?",
      ar: "لنقطة ما، متوسط المسافة إلى عنقودها a = 2 ومتوسط المسافة إلى أقرب عنقود آخر b = 5. ما قيمة الصورة الظلية لها؟"
    },
    options: {
      en: ["−0.6", "1.5", "0.6", "0.4"],
      fr: ["−0.6", "1.5", "0.6", "0.4"],
      ar: ["−0.6", "1.5", "0.6", "0.4"]
    },
    answer: 2,
    explain: {
      en: "s = (b − a) / max(a, b) = (5 − 2) / 5 = 0.6. Dividing by a instead gives 1.5, which is outside the valid range, and a/b = 0.4 is not the formula.",
      fr: "s = (b − a) / max(a, b) = (5 − 2) / 5 = 0.6. Diviser par a donne 1.5, hors de l'intervalle valide, et a/b = 0.4 n'est pas la formule.",
      ar: "s = (b − a) / max(a, b) = (5 − 2) / 5 = 0.6. القسمة على a تعطي 1.5 وهي خارج المدى الصحيح، أما a/b = 0.4 فليست الصيغة."
    }
  },
  {
    id: "metric-silhouette-choose-k",
    concept: "silhouette-score",
    difficulty: 2,
    q: {
      en: "K-Means is run for k = 2 to 6 and the mean silhouette scores are 0.41, 0.58, 0.47, 0.39 and 0.35. Which k does silhouette analysis suggest?",
      fr: "On lance K-Means pour k = 2 à 6 et les scores de silhouette moyens sont 0.41, 0.58, 0.47, 0.39 et 0.35. Quel k l'analyse de silhouette suggère-t-elle ?",
      ar: "شُغّلت K-Means لقيم k من 2 إلى 6، وكانت متوسطات الصورة الظلية 0.41 و0.58 و0.47 و0.39 و0.35. ما قيمة k التي يقترحها تحليل الصورة الظلية؟"
    },
    options: {
      en: ["k = 2", "k = 3", "k = 4", "k = 6"],
      fr: ["k = 2", "k = 3", "k = 4", "k = 6"],
      ar: ["k = 2", "k = 3", "k = 4", "k = 6"]
    },
    answer: 1,
    explain: {
      en: "The scores map to k = 2, 3, 4, 5, 6, and the highest, 0.58, is at k = 3. Unlike inertia, silhouette does not keep improving as k grows, so its maximum is a meaningful choice.",
      fr: "Les scores correspondent à k = 2, 3, 4, 5, 6, et le plus élevé, 0.58, est à k = 3. Contrairement à l'inertie, la silhouette ne s'améliore pas sans fin quand k augmente : son maximum est un choix pertinent.",
      ar: "تقابل الدرجات القيم k = 2 و3 و4 و5 و6، وأعلاها 0.58 عند k = 3. وبخلاف القصور الذاتي (inertia)، لا تتحسن الصورة الظلية باستمرار مع زيادة k، فقيمتها العظمى اختيار ذو معنى."
    }
  }
];
