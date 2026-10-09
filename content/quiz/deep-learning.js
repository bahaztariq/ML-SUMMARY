/** Quiz questions: deep-learning. See index.js for the question format. */
/** @type {import('./index.js').Question[]} */
export default [
  // ── activation-functions ──
  {
    id: "dl-activation-why-nonlinear",
    concept: "activation-functions",
    difficulty: 1,
    q: {
      en: "Why do neural networks need non-linear activation functions in their hidden layers?",
      fr: "Pourquoi les réseaux de neurones ont-ils besoin de fonctions d'activation non linéaires dans leurs couches cachées ?",
      ar: "لماذا تحتاج الشبكات العصبية إلى دوال تنشيط (activation functions) غير خطية في طبقاتها المخفية؟"
    },
    options: {
      en: [
        "Without them, any stack of layers collapses into a single linear transformation",
        "They make matrix multiplications run faster on GPUs",
        "They guarantee that every layer's outputs sum to 1",
        "They reduce the number of weights the network has to learn"
      ],
      fr: [
        "Sans elles, n'importe quel empilement de couches se réduit à une seule transformation linéaire",
        "Elles accélèrent les multiplications matricielles sur GPU",
        "Elles garantissent que les sorties de chaque couche somment à 1",
        "Elles réduisent le nombre de poids que le réseau doit apprendre"
      ],
      ar: [
        "بدونها، تنهار أي مجموعة من الطبقات المتراكبة إلى تحويل خطي واحد",
        "تجعل عمليات ضرب المصفوفات أسرع على وحدات GPU",
        "تضمن أن مجموع مخرجات كل طبقة يساوي 1",
        "تقلل عدد الأوزان التي يجب على الشبكة تعلمها"
      ]
    },
    answer: 0,
    explain: {
      en: "A composition of linear functions is still linear, so without non-linearities a 50-layer network is no more expressive than linear regression. Activations let stacked layers model curved, complex relationships.",
      fr: "Une composition de fonctions linéaires reste linéaire : sans non-linéarités, un réseau de 50 couches n'est pas plus expressif qu'une régression linéaire. Les activations permettent aux couches empilées de modéliser des relations courbes et complexes.",
      ar: "تركيب الدوال الخطية يبقى خطيًا، لذا فإن شبكة من 50 طبقة بدون لاخطية ليست أقوى تعبيرًا من الانحدار الخطي. دوال التنشيط هي ما يسمح للطبقات المتراكبة بنمذجة علاقات منحنية ومعقدة."
    }
  },
  {
    id: "dl-activation-output-multiclass",
    concept: "activation-functions",
    difficulty: 1,
    q: {
      en: "Which output activation fits a classifier that must pick exactly one of 10 mutually exclusive classes?",
      fr: "Quelle activation de sortie convient à un classifieur qui doit choisir exactement une classe parmi 10 classes mutuellement exclusives ?",
      ar: "ما دالة التنشيط المناسبة لطبقة المخرجات في مصنِّف يجب أن يختار فئة واحدة بالضبط من بين 10 فئات متنافية؟"
    },
    options: {
      en: [
        "A Sigmoid on each output",
        "Softmax",
        "ReLU",
        "No activation (linear)"
      ],
      fr: [
        "Une sigmoïde sur chaque sortie",
        "Softmax",
        "ReLU",
        "Aucune activation (linéaire)"
      ],
      ar: [
        "دالة Sigmoid على كل مخرج",
        "Softmax",
        "ReLU",
        "بدون تنشيط (خطي)"
      ]
    },
    answer: 1,
    explain: {
      en: "Softmax turns a row of scores into probabilities that sum to 1, which matches 'exactly one class'. Independent sigmoids suit multi-label problems, and a linear output suits regression.",
      fr: "Softmax transforme une ligne de scores en probabilités qui somment à 1, ce qui correspond à « exactement une classe ». Des sigmoïdes indépendantes conviennent au multi-étiquette, et une sortie linéaire à la régression.",
      ar: "تحوّل Softmax صفًا من الدرجات إلى احتمالات مجموعها 1، وهذا يطابق شرط «فئة واحدة بالضبط». أما دوال Sigmoid المستقلة فتناسب المسائل متعددة التسميات، والمخرج الخطي يناسب الانحدار."
    }
  },
  {
    id: "dl-activation-softmax-before-crossentropy",
    concept: "activation-functions",
    difficulty: 2,
    q: {
      en: "In PyTorch, why should you NOT apply Softmax to the model's outputs before passing them to nn.CrossEntropyLoss?",
      fr: "En PyTorch, pourquoi ne faut-il PAS appliquer Softmax aux sorties du modèle avant de les passer à nn.CrossEntropyLoss ?",
      ar: "في PyTorch، لماذا يجب ألا تطبّق Softmax على مخرجات النموذج قبل تمريرها إلى nn.CrossEntropyLoss؟"
    },
    options: {
      en: [
        "Softmax outputs cannot be stored as floating-point tensors",
        "The loss already applies log-softmax to raw logits, so softmax would be applied twice",
        "Cross-entropy only works with ReLU outputs",
        "Softmax would turn the task into regression"
      ],
      fr: [
        "Les sorties de softmax ne peuvent pas être stockées en tenseurs à virgule flottante",
        "La perte applique déjà un log-softmax aux logits bruts, donc softmax serait appliqué deux fois",
        "L'entropie croisée ne fonctionne qu'avec des sorties ReLU",
        "Softmax transformerait la tâche en régression"
      ],
      ar: [
        "لا يمكن تخزين مخرجات softmax كموترات ذات فاصلة عائمة",
        "دالة الخسارة تطبّق log-softmax على القيم الخام (logits) أصلًا، فيُطبَّق softmax مرتين",
        "الإنتروبيا المتقاطعة لا تعمل إلا مع مخرجات ReLU",
        "سيحوّل softmax المهمة إلى انحدار"
      ]
    },
    answer: 1,
    explain: {
      en: "nn.CrossEntropyLoss expects raw logits and combines log-softmax with negative log-likelihood in a numerically stable way. Adding your own softmax squashes the scores twice, which weakens gradients and slows learning.",
      fr: "nn.CrossEntropyLoss attend des logits bruts et combine log-softmax et log-vraisemblance négative de façon numériquement stable. Ajouter votre propre softmax écrase les scores deux fois, ce qui affaiblit les gradients et ralentit l'apprentissage.",
      ar: "تتوقع nn.CrossEntropyLoss قيمًا خامًا (logits) وتجمع بين log-softmax والسالب اللوغاريتمي للأرجحية بطريقة مستقرة عدديًا. إضافة softmax من عندك تضغط الدرجات مرتين، مما يُضعف التدرجات ويبطئ التعلم."
    }
  },
  {
    id: "dl-activation-deep-sigmoid-vanishing",
    concept: "activation-functions",
    difficulty: 3,
    q: {
      en: "You train a 20-layer feedforward network with Sigmoid in every hidden layer. The weights of the first layers barely change between epochs. What is the most likely cause and fix?",
      fr: "Vous entraînez un réseau feedforward de 20 couches avec une sigmoïde dans chaque couche cachée. Les poids des premières couches ne changent presque pas d'une époque à l'autre. Quelle est la cause la plus probable et la solution ?",
      ar: "تدرّب شبكة أمامية التغذية من 20 طبقة مع Sigmoid في كل طبقة مخفية. أوزان الطبقات الأولى بالكاد تتغير من حقبة إلى أخرى. ما السبب الأرجح وما الحل؟"
    },
    options: {
      en: [
        "The learning rate is too low; multiply it by 100",
        "The output layer lacks a Softmax; add one",
        "There is too little data; collect more examples",
        "Vanishing gradients from saturating sigmoids; switch hidden layers to ReLU or GELU"
      ],
      fr: [
        "Le taux d'apprentissage est trop faible ; le multiplier par 100",
        "La couche de sortie n'a pas de Softmax ; en ajouter un",
        "Il y a trop peu de données ; collecter plus d'exemples",
        "Disparition du gradient due aux sigmoïdes saturées ; passer les couches cachées en ReLU ou GELU"
      ],
      ar: [
        "معدل التعلم منخفض جدًا؛ اضربه في 100",
        "طبقة المخرجات تفتقد إلى Softmax؛ أضفها",
        "البيانات قليلة جدًا؛ اجمع المزيد من الأمثلة",
        "تلاشي التدرج (vanishing gradients) بسبب تشبّع Sigmoid؛ استبدلها بـ ReLU أو GELU في الطبقات المخفية"
      ]
    },
    answer: 3,
    explain: {
      en: "The sigmoid's derivative is at most 0.25, and backpropagation multiplies one such factor per layer, so the gradient reaching early layers shrinks toward zero. ReLU has a derivative of 1 for positive inputs, which keeps gradients alive in deep networks.",
      fr: "La dérivée de la sigmoïde vaut au plus 0,25 et la rétropropagation multiplie un tel facteur par couche : le gradient qui atteint les premières couches tend vers zéro. ReLU a une dérivée de 1 pour les entrées positives, ce qui préserve les gradients dans les réseaux profonds.",
      ar: "مشتقة Sigmoid لا تتجاوز 0.25، والانتشار العكسي يضرب عاملًا كهذا لكل طبقة، فيتقلص التدرج الواصل إلى الطبقات الأولى نحو الصفر. أما ReLU فمشتقتها 1 للمدخلات الموجبة، مما يحافظ على التدرجات في الشبكات العميقة."
    }
  },
  // ── autoencoders ──
  {
    id: "dl-autoencoder-bottleneck",
    concept: "autoencoders",
    difficulty: 1,
    q: {
      en: "What is an autoencoder trained to do?",
      fr: "À quoi un autoencodeur est-il entraîné ?",
      ar: "ما الذي يُدرَّب المُرمِّز التلقائي (autoencoder) على فعله؟"
    },
    options: {
      en: [
        "Predict a human-provided label for each input",
        "Generate text that continues a prompt",
        "Split the data into a fixed number of labeled clusters",
        "Compress its input into a small latent code and reconstruct the input from it"
      ],
      fr: [
        "Prédire une étiquette fournie par un humain pour chaque entrée",
        "Générer un texte qui prolonge un prompt",
        "Répartir les données en un nombre fixe de groupes étiquetés",
        "Compresser son entrée en un petit code latent puis reconstruire l'entrée à partir de ce code"
      ],
      ar: [
        "التنبؤ بتسمية يقدّمها إنسان لكل مُدخل",
        "توليد نص يُكمل موجّهًا (prompt)",
        "تقسيم البيانات إلى عدد ثابت من المجموعات المسمّاة",
        "ضغط مدخلاته في رمز كامن صغير ثم إعادة بناء المدخلات منه"
      ]
    },
    answer: 3,
    explain: {
      en: "An encoder squeezes the input through a narrow bottleneck and a decoder rebuilds it; the training target is the input itself, so no labels are needed. The bottleneck forces the network to keep only the most useful structure.",
      fr: "Un encodeur fait passer l'entrée par un goulot d'étranglement étroit et un décodeur la reconstruit ; la cible est l'entrée elle-même, donc aucune étiquette n'est nécessaire. Le goulot oblige le réseau à ne garder que la structure la plus utile.",
      ar: "يضغط المُرمِّز المدخلات عبر عنق زجاجة ضيق ثم يعيد المفكِّك بناءها؛ والهدف أثناء التدريب هو المدخل نفسه، فلا حاجة إلى تسميات. يجبر عنق الزجاجة الشبكة على الاحتفاظ بالبنية الأكثر فائدة فقط."
    }
  },
  {
    id: "dl-autoencoder-anomaly-detection",
    concept: "autoencoders",
    difficulty: 2,
    q: {
      en: "An autoencoder is trained only on normal machine-sensor readings. Why can it flag faulty readings?",
      fr: "Un autoencodeur est entraîné uniquement sur des relevés de capteurs normaux. Pourquoi peut-il signaler les relevés défectueux ?",
      ar: "دُرِّب مُرمِّز تلقائي على قراءات حسّاسات سليمة فقط. لماذا يستطيع رصد القراءات المعيبة؟"
    },
    options: {
      en: [
        "Its latent code contains an explicit 'faulty' class",
        "It memorizes every faulty pattern that could ever occur",
        "Faulty readings are reconstructed poorly, so their reconstruction error is high",
        "Faulty readings always have more features than normal ones"
      ],
      fr: [
        "Son code latent contient une classe « défectueux » explicite",
        "Il mémorise tous les motifs défectueux possibles",
        "Les relevés défectueux sont mal reconstruits, donc leur erreur de reconstruction est élevée",
        "Les relevés défectueux ont toujours plus de variables que les normaux"
      ],
      ar: [
        "يحتوي رمزه الكامن على فئة «معيب» صريحة",
        "يحفظ كل نمط معيب يمكن أن يحدث",
        "تُعاد بناء القراءات المعيبة بشكل سيئ، فيكون خطأ إعادة البناء لها مرتفعًا",
        "القراءات المعيبة تحتوي دائمًا على ميزات أكثر من السليمة"
      ]
    },
    answer: 2,
    explain: {
      en: "The model only learned to rebuild patterns it saw during training. Inputs unlike that data come out distorted, so a threshold on reconstruction error works as an anomaly score without any labeled faults.",
      fr: "Le modèle a seulement appris à reconstruire les motifs vus à l'entraînement. Les entrées différentes ressortent déformées : un seuil sur l'erreur de reconstruction sert de score d'anomalie sans aucune panne étiquetée.",
      ar: "تعلّم النموذج إعادة بناء الأنماط التي رآها أثناء التدريب فقط. المدخلات المختلفة عنها تخرج مشوّهة، لذا يصلح عتبةٌ على خطأ إعادة البناء كمؤشر للشذوذ دون أي أعطال مسمّاة."
    }
  },
  {
    id: "dl-autoencoder-vae-sampling",
    concept: "autoencoders",
    difficulty: 2,
    q: {
      en: "You want to generate new, varied product images by sampling random points in a latent space. Which model fits better, and why?",
      fr: "Vous voulez générer de nouvelles images de produits variées en échantillonnant des points aléatoires dans un espace latent. Quel modèle convient le mieux, et pourquoi ?",
      ar: "تريد توليد صور منتجات جديدة ومتنوعة بأخذ نقاط عشوائية من فضاء كامن. أي نموذج أنسب، ولماذا؟"
    },
    options: {
      en: [
        "A plain autoencoder, because its latent codes are already arranged as a standard normal distribution",
        "A plain autoencoder, because it has fewer parameters and therefore generalizes better",
        "A variational autoencoder, because its KL term makes the latent space smooth so random points decode to plausible images",
        "Neither: autoencoders can only compress data, never generate it"
      ],
      fr: [
        "Un autoencodeur simple, car ses codes latents suivent déjà une loi normale centrée réduite",
        "Un autoencodeur simple, car il a moins de paramètres et généralise donc mieux",
        "Un autoencodeur variationnel, car son terme KL rend l'espace latent lisse : des points aléatoires se décodent en images plausibles",
        "Aucun des deux : les autoencodeurs ne peuvent que compresser, jamais générer"
      ],
      ar: [
        "المُرمِّز التلقائي العادي، لأن رموزه الكامنة موزعة أصلًا وفق توزيع طبيعي معياري",
        "المُرمِّز التلقائي العادي، لأن معاملاته أقل فيعمّم بشكل أفضل",
        "المُرمِّز التلقائي المتغيّر (VAE)، لأن حد KL يجعل الفضاء الكامن سلسًا فتُفكَّك النقاط العشوائية إلى صور معقولة",
        "لا هذا ولا ذاك: المُرمِّزات التلقائية تضغط البيانات فقط ولا تولّدها أبدًا"
      ]
    },
    answer: 2,
    explain: {
      en: "A plain autoencoder's latent space has gaps, so a random point often decodes to garbage. A VAE encodes each input as a distribution and is pushed toward a standard normal prior, so you can sample from that prior and decode new, coherent images.",
      fr: "L'espace latent d'un autoencodeur simple contient des trous : un point aléatoire se décode souvent en bruit. Un VAE encode chaque entrée comme une distribution poussée vers un a priori normal standard, ce qui permet d'échantillonner cet a priori et de décoder des images nouvelles et cohérentes.",
      ar: "الفضاء الكامن للمُرمِّز العادي فيه فجوات، لذا تُفكَّك نقطة عشوائية غالبًا إلى ضجيج. أما VAE فيرمّز كل مُدخل كتوزيع ويُدفع نحو توزيع مسبق طبيعي معياري، فيمكنك السحب من هذا التوزيع وتفكيك صور جديدة متماسكة."
    }
  },
  // ── cnn ──
  {
    id: "dl-cnn-filters",
    concept: "cnn",
    difficulty: 1,
    q: {
      en: "What does a convolutional layer learn?",
      fr: "Qu'apprend une couche de convolution ?",
      ar: "ماذا تتعلم الطبقة الالتفافية (convolutional layer)؟"
    },
    options: {
      en: [
        "One separate weight for every pixel connected to every neuron",
        "The order in which image pixels should be read as a sequence",
        "Small filters that slide over the image to detect local patterns such as edges and textures",
        "A lookup table mapping each image to its label"
      ],
      fr: [
        "Un poids distinct pour chaque pixel relié à chaque neurone",
        "L'ordre dans lequel lire les pixels comme une séquence",
        "De petits filtres qui glissent sur l'image pour détecter des motifs locaux comme les contours et les textures",
        "Une table de correspondance entre chaque image et son étiquette"
      ],
      ar: [
        "وزنًا منفصلًا لكل بكسل متصل بكل عصبون",
        "الترتيب الذي يجب أن تُقرأ به بكسلات الصورة كسلسلة",
        "مرشّحات صغيرة تنزلق على الصورة لاكتشاف أنماط محلية مثل الحواف والقوام",
        "جدول بحث يربط كل صورة بتسميتها"
      ]
    },
    answer: 2,
    explain: {
      en: "Each filter is a small grid of weights convolved across the whole input, producing a feature map that lights up where its pattern appears. Early layers find edges; deeper layers combine them into textures, parts and objects.",
      fr: "Chaque filtre est une petite grille de poids convoluée sur toute l'entrée ; il produit une carte de caractéristiques qui s'active là où son motif apparaît. Les premières couches trouvent des contours, les plus profondes les combinent en textures, parties et objets.",
      ar: "كل مرشّح شبكة صغيرة من الأوزان تُطبَّق التفافيًا على كامل المدخل، فتنتج خريطة ميزات تضيء حيث يظهر نمطه. الطبقات الأولى تجد الحواف، والأعمق تجمعها في قوام وأجزاء وأجسام."
    }
  },
  {
    id: "dl-cnn-weight-sharing",
    concept: "cnn",
    difficulty: 2,
    q: {
      en: "Why does a CNN need far fewer parameters than a fully connected network on the same 224×224 images?",
      fr: "Pourquoi un CNN a-t-il besoin de bien moins de paramètres qu'un réseau entièrement connecté sur les mêmes images 224×224 ?",
      ar: "لماذا تحتاج شبكة CNN إلى معاملات أقل بكثير من شبكة كاملة الاتصال على صور 224×224 نفسها؟"
    },
    options: {
      en: [
        "CNNs convert images to grayscale before processing them",
        "CNNs skip the bias terms that dense layers use",
        "CNNs only look at the center of each image",
        "The same small filter weights are reused at every position (weight sharing and local connectivity)"
      ],
      fr: [
        "Les CNN convertissent les images en niveaux de gris avant de les traiter",
        "Les CNN n'utilisent pas les biais des couches denses",
        "Les CNN ne regardent que le centre de chaque image",
        "Les mêmes petits filtres sont réutilisés à chaque position (partage des poids et connectivité locale)"
      ],
      ar: [
        "تحوّل شبكات CNN الصور إلى التدرج الرمادي قبل معالجتها",
        "تتخلى شبكات CNN عن حدود الانحياز التي تستخدمها الطبقات الكثيفة",
        "تنظر شبكات CNN إلى مركز كل صورة فقط",
        "تُعاد استخدام أوزان المرشّح الصغير نفسه في كل موضع (مشاركة الأوزان والاتصال المحلي)"
      ]
    },
    answer: 3,
    explain: {
      en: "A 3×3 filter has 9 weights per input channel no matter how large the image is, because it is shared across all positions. A dense layer would need a weight for every pixel-to-neuron pair, i.e. millions of parameters per layer.",
      fr: "Un filtre 3×3 a 9 poids par canal d'entrée quelle que soit la taille de l'image, car il est partagé entre toutes les positions. Une couche dense aurait besoin d'un poids pour chaque paire pixel-neurone, soit des millions de paramètres par couche.",
      ar: "للمرشّح 3×3 تسعة أوزان لكل قناة إدخال مهما كبرت الصورة، لأنه مشترك بين جميع المواضع. أما الطبقة الكثيفة فتحتاج وزنًا لكل زوج بكسل-عصبون، أي ملايين المعاملات في الطبقة الواحدة."
    }
  },
  {
    id: "dl-cnn-tabular-mismatch",
    concept: "cnn",
    difficulty: 2,
    q: {
      en: "A teammate wants to predict customer churn from a table of 40 columns (age, plan, monthly spend…) using a CNN. What is the best advice?",
      fr: "Un collègue veut prédire l'attrition des clients à partir d'un tableau de 40 colonnes (âge, forfait, dépense mensuelle…) avec un CNN. Quel est le meilleur conseil ?",
      ar: "يريد زميلك التنبؤ بتسرّب العملاء من جدول من 40 عمودًا (العمر، الباقة، الإنفاق الشهري…) باستخدام CNN. ما أفضل نصيحة؟"
    },
    options: {
      en: [
        "Reshape the 40 columns into a 5×8 image so the CNN can find edges",
        "Use a deeper CNN, since more layers always help on tabular data",
        "Use a CNN but replace ReLU with Sigmoid for tabular inputs",
        "Start with gradient-boosted trees: columns have no spatial neighborhood for convolutions to exploit"
      ],
      fr: [
        "Réorganiser les 40 colonnes en une image 5×8 pour que le CNN trouve des contours",
        "Utiliser un CNN plus profond, car plus de couches aide toujours sur des données tabulaires",
        "Utiliser un CNN mais remplacer ReLU par une sigmoïde pour les entrées tabulaires",
        "Commencer par des arbres de gradient boosting : les colonnes n'ont aucun voisinage spatial à exploiter par des convolutions"
      ],
      ar: [
        "أعد تشكيل الأعمدة الأربعين إلى صورة 5×8 حتى تجد CNN الحواف",
        "استخدم CNN أعمق، فالطبقات الإضافية تفيد دائمًا مع البيانات الجدولية",
        "استخدم CNN مع استبدال ReLU بـ Sigmoid للمدخلات الجدولية",
        "ابدأ بأشجار التعزيز التدرجي: الأعمدة ليس بينها جوار مكاني تستفيد منه الالتفافات"
      ]
    },
    answer: 3,
    explain: {
      en: "Convolutions assume nearby values are related, which holds for pixels but not for arbitrary column order. On tabular data, tree ensembles such as XGBoost or LightGBM are usually stronger, faster and easier to tune.",
      fr: "Les convolutions supposent que les valeurs voisines sont liées, ce qui vaut pour les pixels mais pas pour un ordre de colonnes arbitraire. Sur des données tabulaires, les ensembles d'arbres comme XGBoost ou LightGBM sont généralement plus performants, plus rapides et plus simples à régler.",
      ar: "تفترض الالتفافات أن القيم المتجاورة مترابطة، وهذا صحيح للبكسلات لا لترتيب أعمدة اعتباطي. على البيانات الجدولية، تكون مجموعات الأشجار مثل XGBoost أو LightGBM عادةً أقوى وأسرع وأسهل ضبطًا."
    }
  },
  // ── dl-optimizers ──
  {
    id: "dl-optim-momentum",
    concept: "dl-optimizers",
    difficulty: 1,
    q: {
      en: "What does momentum add to plain stochastic gradient descent?",
      fr: "Qu'apporte le momentum à la descente de gradient stochastique classique ?",
      ar: "ماذا يضيف الزخم (momentum) إلى الانحدار التدرجي العشوائي العادي؟"
    },
    options: {
      en: [
        "A random restart of the weights whenever the loss stops decreasing",
        "A second network that predicts the optimal learning rate",
        "A running average of past gradients, so updates keep moving in consistent directions and oscillations are damped",
        "Exact second derivatives (the Hessian) at every step"
      ],
      fr: [
        "Une réinitialisation aléatoire des poids dès que la perte cesse de baisser",
        "Un second réseau qui prédit le taux d'apprentissage optimal",
        "Une moyenne glissante des gradients passés : les mises à jour gardent une direction cohérente et les oscillations sont amorties",
        "Les dérivées secondes exactes (la hessienne) à chaque pas"
      ],
      ar: [
        "إعادة تهيئة عشوائية للأوزان كلما توقفت الخسارة عن الانخفاض",
        "شبكة ثانية تتنبأ بمعدل التعلم الأمثل",
        "متوسطًا متحركًا للتدرجات السابقة، فتستمر التحديثات في اتجاهات متسقة وتُخمَد التذبذبات",
        "المشتقات الثانية الدقيقة (مصفوفة هيسه) في كل خطوة"
      ]
    },
    answer: 2,
    explain: {
      en: "Like a ball rolling downhill, momentum accumulates velocity in directions where gradients agree and cancels out zig-zags where they flip sign. This speeds up progress along long, shallow valleys.",
      fr: "Comme une bille qui dévale une pente, le momentum accumule de la vitesse dans les directions où les gradients concordent et annule les zigzags où ils changent de signe. La progression s'accélère dans les vallées longues et peu pentues.",
      ar: "مثل كرة تتدحرج على منحدر، يراكم الزخم سرعةً في الاتجاهات التي تتفق فيها التدرجات ويلغي التعرّج حيث تنقلب إشارتها، مما يسرّع التقدم في الوديان الطويلة الضحلة."
    }
  },
  {
    id: "dl-optim-adam-adaptive",
    concept: "dl-optimizers",
    difficulty: 1,
    q: {
      en: "What is the key difference between Adam and SGD with momentum?",
      fr: "Quelle est la différence essentielle entre Adam et SGD avec momentum ?",
      ar: "ما الفرق الجوهري بين Adam و SGD مع الزخم؟"
    },
    options: {
      en: [
        "Adam computes gradients on the full dataset instead of mini-batches",
        "Adam does not use gradients at all",
        "Adam can only train networks with ReLU activations",
        "Adam also tracks squared gradients to give each parameter its own adaptive step size"
      ],
      fr: [
        "Adam calcule les gradients sur tout le jeu de données au lieu de mini-lots",
        "Adam n'utilise pas du tout les gradients",
        "Adam ne peut entraîner que des réseaux à activations ReLU",
        "Adam suit aussi les gradients au carré pour donner à chaque paramètre son propre pas adaptatif"
      ],
      ar: [
        "يحسب Adam التدرجات على كامل البيانات بدل الدُّفعات الصغيرة",
        "لا يستخدم Adam التدرجات إطلاقًا",
        "لا يستطيع Adam تدريب إلا الشبكات ذات تنشيط ReLU",
        "يتتبع Adam أيضًا مربعات التدرجات ليمنح كل معامل حجم خطوة تكيّفيًا خاصًا به"
      ]
    },
    answer: 3,
    explain: {
      en: "Adam keeps a momentum-like first moment and a running average of squared gradients (second moment), then divides by its square root. Parameters with large, noisy gradients take smaller steps and rarely updated ones take larger steps.",
      fr: "Adam conserve un premier moment de type momentum et une moyenne glissante des gradients au carré (second moment), puis divise par sa racine. Les paramètres aux gradients grands et bruités font de petits pas, ceux rarement mis à jour en font de plus grands.",
      ar: "يحتفظ Adam بعزم أول شبيه بالزخم وبمتوسط متحرك لمربعات التدرجات (العزم الثاني)، ثم يقسم على جذره. فالمعاملات ذات التدرجات الكبيرة والمشوّشة تخطو خطوات أصغر، والنادرة التحديث تخطو خطوات أكبر."
    }
  },
  {
    id: "dl-optim-finetune-nan",
    concept: "dl-optimizers",
    difficulty: 3,
    q: {
      en: "Fine-tuning a pretrained Transformer with AdamW at learning rate 1e-3, the loss jumps to NaN within the first 200 steps. What should you try first?",
      fr: "En affinant un Transformer préentraîné avec AdamW à un taux d'apprentissage de 1e-3, la perte passe à NaN dans les 200 premiers pas. Que faut-il essayer en premier ?",
      ar: "أثناء الضبط الدقيق لنموذج Transformer مُدرَّب مسبقًا باستخدام AdamW بمعدل تعلم 1e-3، تقفز الخسارة إلى NaN خلال أول 200 خطوة. ما أول ما يجب تجربته؟"
    },
    options: {
      en: [
        "Lower the learning rate (e.g. 2e-5) and add a warmup schedule",
        "Switch to plain SGD without momentum",
        "Remove weight decay and double the batch size",
        "Train for more epochs so the loss can recover"
      ],
      fr: [
        "Baisser le taux d'apprentissage (par ex. 2e-5) et ajouter une phase de warmup",
        "Passer à un SGD simple sans momentum",
        "Supprimer la décroissance des poids et doubler la taille de lot",
        "Entraîner plus d'époques pour que la perte se rétablisse"
      ],
      ar: [
        "اخفض معدل التعلم (مثلًا 2e-5) وأضف جدولة إحماء (warmup)",
        "انتقل إلى SGD عادي بدون زخم",
        "أزل تضاؤل الأوزان وضاعف حجم الدفعة",
        "درّب لعدد أكبر من الحقب حتى تتعافى الخسارة"
      ]
    },
    answer: 0,
    explain: {
      en: "Pretrained weights are already good, so large early steps blow them up before Adam's statistics settle. Fine-tuning typically uses learning rates around 1e-5 to 5e-5 with a short warmup that ramps the rate up gradually.",
      fr: "Les poids préentraînés sont déjà bons : de grands pas en début d'entraînement les font exploser avant que les statistiques d'Adam ne se stabilisent. L'affinage utilise généralement des taux de 1e-5 à 5e-5 avec un court warmup qui augmente le taux progressivement.",
      ar: "الأوزان المُدرَّبة مسبقًا جيدة أصلًا، فالخطوات الكبيرة في البداية تفجّرها قبل أن تستقر إحصاءات Adam. يستخدم الضبط الدقيق عادةً معدلات بين 1e-5 و 5e-5 مع إحماء قصير يرفع المعدل تدريجيًا."
    }
  },
  // ── dl-regularization ──
  {
    id: "dl-reg-dropout",
    concept: "dl-regularization",
    difficulty: 1,
    q: {
      en: "What does dropout do during training?",
      fr: "Que fait le dropout pendant l'entraînement ?",
      ar: "ماذا يفعل الإسقاط العشوائي (dropout) أثناء التدريب؟"
    },
    options: {
      en: [
        "Permanently deletes the weakest neurons after each epoch",
        "Randomly zeroes a fraction of activations at each step so the network cannot rely on specific neurons",
        "Removes a random fraction of training examples from the dataset",
        "Lowers the learning rate whenever validation loss rises"
      ],
      fr: [
        "Supprime définitivement les neurones les plus faibles après chaque époque",
        "Met aléatoirement à zéro une fraction des activations à chaque pas pour que le réseau ne dépende pas de neurones précis",
        "Retire une fraction aléatoire des exemples d'entraînement",
        "Baisse le taux d'apprentissage dès que la perte de validation augmente"
      ],
      ar: [
        "يحذف نهائيًا أضعف العصبونات بعد كل حقبة",
        "يصفّر عشوائيًا نسبة من التنشيطات في كل خطوة حتى لا تعتمد الشبكة على عصبونات بعينها",
        "يزيل نسبة عشوائية من أمثلة التدريب من البيانات",
        "يخفض معدل التعلم كلما ارتفعت خسارة التحقق"
      ]
    },
    answer: 1,
    explain: {
      en: "Each step trains a different random sub-network, which discourages fragile co-adaptations and acts like an ensemble. Dropout is turned off at inference time, when all neurons are used.",
      fr: "Chaque pas entraîne un sous-réseau aléatoire différent, ce qui décourage les co-adaptations fragiles et agit comme un ensemble. Le dropout est désactivé à l'inférence, où tous les neurones sont utilisés.",
      ar: "تدرّب كل خطوة شبكة فرعية عشوائية مختلفة، مما يحدّ من التكيّف المشترك الهش ويعمل كمجموعة نماذج. ويُعطَّل الإسقاط العشوائي عند الاستدلال حيث تُستخدم كل العصبونات."
    }
  },
  {
    id: "dl-reg-early-stopping",
    concept: "dl-regularization",
    difficulty: 2,
    q: {
      en: "Training loss keeps falling, but validation loss has been rising since epoch 12. What does early stopping do in this situation?",
      fr: "La perte d'entraînement continue de baisser, mais la perte de validation augmente depuis l'époque 12. Que fait l'arrêt précoce dans cette situation ?",
      ar: "تستمر خسارة التدريب في الانخفاض، لكن خسارة التحقق ترتفع منذ الحقبة 12. ماذا يفعل الإيقاف المبكر (early stopping) في هذه الحالة؟"
    },
    options: {
      en: [
        "Restarts training from scratch with a smaller learning rate",
        "Keeps training until training loss reaches zero",
        "Deletes the validation set so it no longer biases training",
        "Stops training after a patience window and restores the weights from the best validation epoch"
      ],
      fr: [
        "Relance l'entraînement depuis zéro avec un taux d'apprentissage plus faible",
        "Continue jusqu'à ce que la perte d'entraînement atteigne zéro",
        "Supprime le jeu de validation pour qu'il ne biaise plus l'entraînement",
        "Arrête l'entraînement après une période de patience et restaure les poids de la meilleure époque en validation"
      ],
      ar: [
        "يعيد التدريب من البداية بمعدل تعلم أصغر",
        "يواصل التدريب حتى تصل خسارة التدريب إلى الصفر",
        "يحذف مجموعة التحقق حتى لا تنحاز للتدريب",
        "يوقف التدريب بعد فترة صبر ويستعيد أوزان الحقبة الأفضل على بيانات التحقق"
      ]
    },
    answer: 3,
    explain: {
      en: "Rising validation loss with falling training loss is the signature of overfitting. Early stopping treats the number of epochs as a hyperparameter chosen on validation data and keeps the checkpoint that generalized best.",
      fr: "Une perte de validation qui monte pendant que la perte d'entraînement baisse est la signature du surapprentissage. L'arrêt précoce traite le nombre d'époques comme un hyperparamètre choisi sur la validation et garde le point de sauvegarde qui généralisait le mieux.",
      ar: "ارتفاع خسارة التحقق مع انخفاض خسارة التدريب هو علامة الإفراط في التخصيص (overfitting). يعامل الإيقاف المبكر عدد الحقب كمعامل فائق يُختار على بيانات التحقق، ويحتفظ بنقطة الحفظ الأفضل تعميمًا."
    }
  },
  {
    id: "dl-reg-norm-small-batch",
    concept: "dl-regularization",
    difficulty: 2,
    q: {
      en: "Because of GPU memory limits you can only train a Transformer with a batch size of 4, and BatchNorm makes training unstable. What should you use instead?",
      fr: "À cause de la mémoire GPU, vous ne pouvez entraîner un Transformer qu'avec des lots de 4, et BatchNorm rend l'entraînement instable. Que faut-il utiliser à la place ?",
      ar: "بسبب حدود ذاكرة GPU لا يمكنك تدريب Transformer إلا بحجم دفعة 4، و BatchNorm يجعل التدريب غير مستقر. ماذا تستخدم بدلًا منه؟"
    },
    options: {
      en: [
        "A higher dropout rate, which replaces normalization entirely",
        "LayerNorm, which normalizes each example over its own features and does not depend on batch size",
        "BatchNorm with a larger momentum value",
        "No normalization, with Sigmoid activations to keep values bounded"
      ],
      fr: [
        "Un taux de dropout plus élevé, qui remplace totalement la normalisation",
        "LayerNorm, qui normalise chaque exemple sur ses propres caractéristiques et ne dépend pas de la taille de lot",
        "BatchNorm avec un momentum plus grand",
        "Aucune normalisation, avec des sigmoïdes pour borner les valeurs"
      ],
      ar: [
        "معدل dropout أعلى، يغني تمامًا عن التطبيع",
        "LayerNorm، الذي يطبّع كل مثال على ميزاته الخاصة ولا يعتمد على حجم الدفعة",
        "BatchNorm مع قيمة زخم أكبر",
        "بدون تطبيع، مع دوال Sigmoid لإبقاء القيم محدودة"
      ]
    },
    answer: 1,
    explain: {
      en: "BatchNorm estimates mean and variance across the batch, and with 4 examples those estimates are very noisy. LayerNorm computes statistics per example, which is why it is the standard choice in Transformers and RNNs.",
      fr: "BatchNorm estime la moyenne et la variance sur le lot, et avec 4 exemples ces estimations sont très bruitées. LayerNorm calcule les statistiques par exemple, c'est pourquoi c'est le choix standard dans les Transformers et les RNN.",
      ar: "يقدّر BatchNorm المتوسط والتباين عبر الدفعة، ومع 4 أمثلة فقط تكون هذه التقديرات شديدة التشويش. أما LayerNorm فيحسب الإحصاءات لكل مثال على حدة، ولهذا هو الخيار المعتاد في Transformers و RNN."
    }
  },
  // ── embeddings ──
  {
    id: "dl-embedding-definition",
    concept: "embeddings",
    difficulty: 1,
    q: {
      en: "What is an embedding?",
      fr: "Qu'est-ce qu'un embedding ?",
      ar: "ما التضمين (embedding)؟"
    },
    options: {
      en: [
        "A sparse vector with a single 1 marking the item's category",
        "A hash that maps each item to a random integer",
        "A compressed file format for storing model weights",
        "A learned dense vector in which similar items end up close together"
      ],
      fr: [
        "Un vecteur creux avec un seul 1 indiquant la catégorie de l'élément",
        "Un hachage qui associe chaque élément à un entier aléatoire",
        "Un format de fichier compressé pour stocker les poids d'un modèle",
        "Un vecteur dense appris dans lequel les éléments similaires se retrouvent proches"
      ],
      ar: [
        "متجه متناثر فيه 1 واحد يحدد فئة العنصر",
        "دالة تجزئة تربط كل عنصر بعدد صحيح عشوائي",
        "صيغة ملف مضغوطة لتخزين أوزان النموذج",
        "متجه كثيف مُتعلَّم تقترب فيه العناصر المتشابهة من بعضها"
      ]
    },
    answer: 3,
    explain: {
      en: "Embeddings map discrete items such as words, products or users to vectors of a few dozen to a few thousand numbers. Training places related items near each other, so distance in the space reflects similarity.",
      fr: "Les embeddings associent des éléments discrets (mots, produits, utilisateurs) à des vecteurs de quelques dizaines à quelques milliers de nombres. L'entraînement rapproche les éléments liés, si bien que la distance dans l'espace reflète la similarité.",
      ar: "تربط التضمينات عناصر منفصلة كالكلمات والمنتجات والمستخدمين بمتجهات من بضع عشرات إلى بضعة آلاف من الأرقام. ويضع التدريب العناصر المترابطة قرب بعضها، فتعكس المسافة في الفضاء درجة التشابه."
    }
  },
  {
    id: "dl-embedding-vs-onehot",
    concept: "embeddings",
    difficulty: 2,
    q: {
      en: "A neural recommender has a product_id feature with 500,000 distinct values. Why use an embedding rather than one-hot encoding?",
      fr: "Un système de recommandation neuronal a une variable product_id avec 500 000 valeurs distinctes. Pourquoi utiliser un embedding plutôt qu'un encodage one-hot ?",
      ar: "لدى نظام توصية عصبي ميزة product_id بـ 500,000 قيمة مختلفة. لماذا نستخدم التضمين بدل الترميز الأحادي (one-hot)؟"
    },
    options: {
      en: [
        "One-hot creates huge sparse inputs that treat every product as equally different; embeddings are compact and learn similarity",
        "One-hot encoding cannot represent more than 1,000 categories",
        "Embeddings require no training, while one-hot vectors must be learned",
        "Embeddings make the model fully interpretable"
      ],
      fr: [
        "Le one-hot crée d'énormes entrées creuses où tous les produits sont également différents ; les embeddings sont compacts et apprennent la similarité",
        "L'encodage one-hot ne peut pas représenter plus de 1 000 catégories",
        "Les embeddings ne nécessitent aucun entraînement, alors que les vecteurs one-hot doivent être appris",
        "Les embeddings rendent le modèle entièrement interprétable"
      ],
      ar: [
        "يُنتج الترميز الأحادي مدخلات متناثرة ضخمة تعامل كل المنتجات كمختلفة بالقدر نفسه؛ أما التضمينات فمدمجة وتتعلم التشابه",
        "لا يستطيع الترميز الأحادي تمثيل أكثر من 1,000 فئة",
        "لا تحتاج التضمينات إلى تدريب، بينما يجب تعلّم متجهات الترميز الأحادي",
        "تجعل التضمينات النموذج قابلًا للتفسير بالكامل"
      ]
    },
    answer: 0,
    explain: {
      en: "One-hot gives a 500,000-dimensional vector where all products are equidistant. A 64-dimensional embedding is far smaller and lets the model learn that, say, two similar phone cases should behave alike.",
      fr: "Le one-hot donne un vecteur de 500 000 dimensions où tous les produits sont équidistants. Un embedding de 64 dimensions est bien plus petit et permet au modèle d'apprendre que deux coques de téléphone similaires doivent se comporter de la même façon.",
      ar: "يعطي الترميز الأحادي متجهًا من 500,000 بُعد تكون فيه كل المنتجات على المسافة نفسها. أما تضمين من 64 بُعدًا فأصغر بكثير ويتيح للنموذج أن يتعلم مثلًا أن غطاءَي هاتف متشابهين يجب أن يتصرفا بشكل متقارب."
    }
  },
  {
    id: "dl-embedding-semantic-search",
    concept: "embeddings",
    difficulty: 3,
    q: {
      en: "You are building semantic search over 20,000 help-center articles, so that 'can't log in' also finds 'password reset'. How should you rank articles for a query?",
      fr: "Vous construisez une recherche sémantique sur 20 000 articles d'aide, pour que « impossible de me connecter » trouve aussi « réinitialiser le mot de passe ». Comment classer les articles pour une requête ?",
      ar: "تبني بحثًا دلاليًا في 20,000 مقالة مساعدة، بحيث تجد عبارة «لا أستطيع تسجيل الدخول» مقالة «إعادة تعيين كلمة المرور» أيضًا. كيف ترتّب المقالات لاستعلام ما؟"
    },
    options: {
      en: [
        "Count how many exact words the query shares with each article",
        "Embed the query and the articles with the same model and rank by cosine similarity",
        "One-hot encode each article title and sort them alphabetically",
        "Embed only the articles and compare them with the raw query text"
      ],
      fr: [
        "Compter les mots exacts que la requête partage avec chaque article",
        "Encoder la requête et les articles avec le même modèle d'embedding et classer par similarité cosinus",
        "Encoder en one-hot chaque titre d'article et les trier par ordre alphabétique",
        "Encoder seulement les articles et les comparer au texte brut de la requête"
      ],
      ar: [
        "عُدّ الكلمات المطابقة حرفيًا بين الاستعلام وكل مقالة",
        "حوّل الاستعلام والمقالات إلى تضمينات بالنموذج نفسه ورتّب حسب تشابه جيب التمام (cosine similarity)",
        "رمّز عنوان كل مقالة ترميزًا أحاديًا ورتّبها أبجديًا",
        "حوّل المقالات وحدها إلى تضمينات وقارنها بنص الاستعلام الخام"
      ]
    },
    answer: 1,
    explain: {
      en: "Sentence embeddings place texts with similar meaning close together even when they share no words. Query and documents must live in the same vector space, which is why both are encoded with the same model.",
      fr: "Les embeddings de phrases rapprochent les textes de sens similaire même sans mot commun. La requête et les documents doivent vivre dans le même espace vectoriel, d'où l'utilisation du même modèle pour les deux.",
      ar: "تضع تضمينات الجمل النصوص ذات المعنى المتقارب قرب بعضها حتى لو لم تشترك في أي كلمة. ويجب أن يكون الاستعلام والمستندات في فضاء المتجهات نفسه، ولهذا يُرمَّز الاثنان بالنموذج ذاته."
    }
  },
  // ── generative-models ──
  {
    id: "dl-generative-vs-discriminative",
    concept: "generative-models",
    difficulty: 1,
    q: {
      en: "What does a generative model learn that a classifier does not?",
      fr: "Qu'apprend un modèle génératif qu'un classifieur n'apprend pas ?",
      ar: "ما الذي يتعلمه النموذج التوليدي ولا يتعلمه المصنِّف؟"
    },
    options: {
      en: [
        "Only the decision boundary between classes",
        "A fixed set of rules written by domain experts",
        "The single most frequent training example",
        "The distribution of the data itself, so it can produce brand-new realistic samples"
      ],
      fr: [
        "Seulement la frontière de décision entre les classes",
        "Un ensemble fixe de règles écrites par des experts du domaine",
        "L'exemple d'entraînement le plus fréquent",
        "La distribution des données elles-mêmes, ce qui lui permet de produire des échantillons nouveaux et réalistes"
      ],
      ar: [
        "حدود القرار بين الفئات فقط",
        "مجموعة ثابتة من القواعد يكتبها خبراء المجال",
        "مثال التدريب الأكثر تكرارًا فقط",
        "توزيع البيانات نفسها، فيستطيع إنتاج عينات جديدة كليًا وواقعية"
      ]
    },
    answer: 3,
    explain: {
      en: "A classifier models p(label | input) and only needs to separate classes. A generative model captures how the data itself is distributed, which is what lets it sample new images, audio or records.",
      fr: "Un classifieur modélise p(étiquette | entrée) et n'a qu'à séparer les classes. Un modèle génératif capture la distribution des données elles-mêmes, ce qui lui permet d'échantillonner de nouvelles images, sons ou enregistrements.",
      ar: "ينمذج المصنِّف p(التسمية | المدخل) ويكفيه الفصل بين الفئات. أما النموذج التوليدي فيلتقط كيفية توزّع البيانات نفسها، وهذا ما يمكّنه من توليد صور أو أصوات أو سجلات جديدة."
    }
  },
  {
    id: "dl-generative-diffusion",
    concept: "generative-models",
    difficulty: 1,
    q: {
      en: "How does a diffusion model generate an image?",
      fr: "Comment un modèle de diffusion génère-t-il une image ?",
      ar: "كيف يولّد نموذج الانتشار (diffusion model) صورة؟"
    },
    options: {
      en: [
        "A generator and a discriminator vote on each pixel",
        "It copies and blends the closest images from its training set",
        "It starts from pure noise and removes noise step by step with a learned denoising network",
        "It predicts all pixels at once from a single forward pass of a classifier"
      ],
      fr: [
        "Un générateur et un discriminateur votent pour chaque pixel",
        "Il copie et mélange les images les plus proches de son jeu d'entraînement",
        "Il part d'un bruit pur et le retire pas à pas grâce à un réseau débruiteur appris",
        "Il prédit tous les pixels d'un coup en une seule passe d'un classifieur"
      ],
      ar: [
        "يصوّت مولِّد ومميِّز على كل بكسل",
        "ينسخ أقرب الصور من بيانات تدريبه ويمزجها",
        "يبدأ من ضجيج خالص ويزيله خطوة بخطوة بشبكة إزالة ضجيج مُتعلَّمة",
        "يتنبأ بكل البكسلات دفعة واحدة بتمريرة أمامية واحدة لمصنِّف"
      ]
    },
    answer: 2,
    explain: {
      en: "During training, noise is gradually added to real images and a network learns to predict and remove it. At generation time the process runs in reverse, turning random noise into a clean image over many small steps.",
      fr: "À l'entraînement, du bruit est ajouté progressivement à de vraies images et un réseau apprend à le prédire et à le retirer. À la génération, le processus est inversé : un bruit aléatoire devient une image nette en de nombreux petits pas.",
      ar: "أثناء التدريب يُضاف ضجيج تدريجيًا إلى صور حقيقية وتتعلم شبكة التنبؤ به وإزالته. وعند التوليد تُعكس العملية، فيتحول ضجيج عشوائي إلى صورة نظيفة عبر خطوات صغيرة كثيرة."
    }
  },
  {
    id: "dl-generative-gan-mode-collapse",
    concept: "generative-models",
    difficulty: 2,
    q: {
      en: "Your GAN produces sharp faces, but almost every sample looks like the same few people no matter which noise vector you feed in. What is happening?",
      fr: "Votre GAN produit des visages nets, mais presque tous les échantillons ressemblent aux mêmes quelques personnes, quel que soit le vecteur de bruit fourni. Que se passe-t-il ?",
      ar: "تنتج شبكتك التوليدية التنافسية (GAN) وجوهًا واضحة، لكن كل العينات تقريبًا تشبه الأشخاص القلائل أنفسهم أيًا كان متجه الضجيج المُدخل. ما الذي يحدث؟"
    },
    options: {
      en: [
        "Mode collapse: the generator found a few outputs that fool the discriminator and stopped covering the data's variety",
        "Overfitting of the discriminator, which is fixed by adding more noise dimensions",
        "Vanishing gradients in the generator caused by using ReLU",
        "The GAN has converged perfectly and learned the true distribution"
      ],
      fr: [
        "Effondrement de modes : le générateur a trouvé quelques sorties qui trompent le discriminateur et ne couvre plus la variété des données",
        "Un surapprentissage du discriminateur, corrigé en ajoutant des dimensions de bruit",
        "Une disparition du gradient dans le générateur causée par ReLU",
        "Le GAN a parfaitement convergé et appris la vraie distribution"
      ],
      ar: [
        "انهيار الأنماط (mode collapse): وجد المولِّد مخرجات قليلة تخدع المميِّز وتوقّف عن تغطية تنوع البيانات",
        "إفراط المميِّز في التخصيص، ويُعالَج بإضافة أبعاد ضجيج أكثر",
        "تلاشي التدرج في المولِّد بسبب استخدام ReLU",
        "تقاربت الشبكة تمامًا وتعلمت التوزيع الحقيقي"
      ]
    },
    answer: 0,
    explain: {
      en: "In adversarial training, the generator is rewarded only for fooling the discriminator, not for diversity. Collapsing onto a few convincing modes is a classic GAN failure; diffusion models are far less prone to it.",
      fr: "En entraînement antagoniste, le générateur n'est récompensé que s'il trompe le discriminateur, pas pour la diversité. S'effondrer sur quelques modes convaincants est un échec classique des GAN ; les modèles de diffusion y sont bien moins sujets.",
      ar: "في التدريب التنافسي يُكافأ المولِّد فقط على خداع المميِّز لا على التنوع. والانهيار نحو أنماط قليلة مقنعة عطلٌ كلاسيكي في GAN، أما نماذج الانتشار فأقل عرضة له بكثير."
    }
  },
  // ── llms ──
  {
    id: "dl-llm-pretraining-objective",
    concept: "llms",
    difficulty: 1,
    q: {
      en: "What objective is a large language model pretrained on?",
      fr: "Sur quel objectif un grand modèle de langage est-il préentraîné ?",
      ar: "ما الهدف الذي يُدرَّب عليه النموذج اللغوي الكبير (LLM) في مرحلة التدريب المسبق؟"
    },
    options: {
      en: [
        "Classifying documents into a fixed list of topics",
        "Predicting the next token given all previous tokens",
        "Translating every sentence into English",
        "Answering questions from a labeled database"
      ],
      fr: [
        "Classer des documents dans une liste fixe de thèmes",
        "Prédire le token suivant à partir de tous les tokens précédents",
        "Traduire chaque phrase en anglais",
        "Répondre à des questions à partir d'une base étiquetée"
      ],
      ar: [
        "تصنيف المستندات ضمن قائمة ثابتة من المواضيع",
        "التنبؤ بالرمز (token) التالي بمعلومية جميع الرموز السابقة",
        "ترجمة كل جملة إلى الإنجليزية",
        "الإجابة عن أسئلة من قاعدة بيانات مسمّاة"
      ]
    },
    answer: 1,
    explain: {
      en: "Next-token prediction on trillions of words needs no human labels and forces the model to absorb grammar, facts and reasoning patterns. Instruction tuning and preference alignment then turn it into a helpful assistant.",
      fr: "La prédiction du token suivant sur des milliers de milliards de mots ne demande aucune étiquette humaine et oblige le modèle à absorber grammaire, faits et schémas de raisonnement. L'instruction tuning et l'alignement sur les préférences en font ensuite un assistant utile.",
      ar: "لا يحتاج التنبؤ بالرمز التالي على تريليونات الكلمات إلى تسميات بشرية، ويجبر النموذج على استيعاب القواعد والحقائق وأنماط الاستدلال. ثم يحوّله الضبط على التعليمات والمواءمة مع التفضيلات إلى مساعد مفيد."
    }
  },
  {
    id: "dl-llm-hallucination",
    concept: "llms",
    difficulty: 2,
    q: {
      en: "Why can an LLM state a wrong fact with complete confidence?",
      fr: "Pourquoi un LLM peut-il affirmer un fait faux avec une totale assurance ?",
      ar: "لماذا قد يذكر نموذج LLM معلومة خاطئة بثقة تامة؟"
    },
    options: {
      en: [
        "Its database of facts was corrupted during fine-tuning",
        "It deliberately invents facts when the temperature is set to 0",
        "It generates plausible continuations from learned patterns rather than looking facts up in a verified source",
        "It only hallucinates when the prompt is written in a language other than English"
      ],
      fr: [
        "Sa base de faits a été corrompue pendant l'affinage",
        "Il invente volontairement des faits quand la température vaut 0",
        "Il génère des suites plausibles à partir de motifs appris au lieu de vérifier les faits dans une source fiable",
        "Il n'hallucine que si le prompt n'est pas rédigé en anglais"
      ],
      ar: [
        "تلفت قاعدة حقائقه أثناء الضبط الدقيق",
        "يختلق الحقائق عمدًا عندما تكون درجة الحرارة 0",
        "يولّد تكملات معقولة من أنماط مُتعلَّمة بدل البحث عن الحقائق في مصدر موثوق",
        "لا يهلوس إلا إذا كُتب الموجّه بلغة غير الإنجليزية"
      ]
    },
    answer: 2,
    explain: {
      en: "An LLM has no built-in fact database; it predicts likely tokens, and a fluent but false sentence can be highly likely. Grounding answers in retrieved documents (RAG) and asking for citations reduces this.",
      fr: "Un LLM n'a pas de base de faits intégrée : il prédit des tokens probables, et une phrase fluide mais fausse peut être très probable. Ancrer les réponses dans des documents récupérés (RAG) et exiger des citations réduit ce problème.",
      ar: "لا يملك LLM قاعدة حقائق مدمجة؛ إنه يتنبأ بالرموز المرجّحة، وقد تكون جملة سلسة لكنها خاطئة مرجّحة جدًا. تأسيس الإجابات على مستندات مسترجعة (RAG) وطلب الاستشهادات يقلل من ذلك."
    }
  },
  {
    id: "dl-llm-temperature",
    concept: "llms",
    difficulty: 1,
    q: {
      en: "What happens when you lower the sampling temperature of an LLM toward 0?",
      fr: "Que se passe-t-il quand on baisse la température d'échantillonnage d'un LLM vers 0 ?",
      ar: "ماذا يحدث عندما تخفض درجة حرارة أخذ العينات (temperature) لنموذج LLM نحو 0؟"
    },
    options: {
      en: [
        "Outputs become more creative and varied",
        "The model forgets its instruction tuning",
        "Outputs become more deterministic, concentrating on the most likely tokens",
        "The context window grows larger"
      ],
      fr: [
        "Les sorties deviennent plus créatives et variées",
        "Le modèle oublie son instruction tuning",
        "Les sorties deviennent plus déterministes, concentrées sur les tokens les plus probables",
        "La fenêtre de contexte s'agrandit"
      ],
      ar: [
        "تصبح المخرجات أكثر إبداعًا وتنوعًا",
        "ينسى النموذج ضبطه على التعليمات",
        "تصبح المخرجات أكثر حتمية وتتركز على الرموز الأكثر احتمالًا",
        "تتسع نافذة السياق"
      ]
    },
    answer: 2,
    explain: {
      en: "Temperature divides the logits before softmax: low values sharpen the distribution toward the top token, high values flatten it. Use low temperature for extraction or classification and higher values for brainstorming.",
      fr: "La température divise les logits avant softmax : une valeur basse concentre la distribution sur le meilleur token, une valeur haute l'aplatit. Utilisez une température basse pour l'extraction ou la classification, plus haute pour le brainstorming.",
      ar: "تقسم درجة الحرارة القيم الخام قبل softmax: القيم المنخفضة تُحدّد التوزيع نحو الرمز الأعلى، والمرتفعة تسطّحه. استخدم حرارة منخفضة للاستخراج أو التصنيف، وأعلى للعصف الذهني."
    }
  },
  {
    id: "dl-llm-high-volume-classifier",
    concept: "llms",
    difficulty: 3,
    q: {
      en: "You must route 50 million short support tickets per day into 5 categories with under 20 ms latency, and you have 100,000 labeled tickets. What is the most sensible approach?",
      fr: "Vous devez répartir 50 millions de tickets de support courts par jour entre 5 catégories avec moins de 20 ms de latence, et vous disposez de 100 000 tickets étiquetés. Quelle est l'approche la plus raisonnable ?",
      ar: "عليك توجيه 50 مليون تذكرة دعم قصيرة يوميًا إلى 5 فئات بزمن استجابة أقل من 20 ms، ولديك 100,000 تذكرة مسمّاة. ما النهج الأكثر منطقية؟"
    },
    options: {
      en: [
        "Train or fine-tune a small, fast classifier on the labeled tickets",
        "Send every ticket to the largest available LLM with a zero-shot prompt",
        "Build a RAG system over the ticket history for each request",
        "Ask an LLM to write rules, then never retrain"
      ],
      fr: [
        "Entraîner ou affiner un petit classifieur rapide sur les tickets étiquetés",
        "Envoyer chaque ticket au plus grand LLM disponible avec un prompt zero-shot",
        "Construire un système RAG sur l'historique des tickets pour chaque requête",
        "Demander à un LLM d'écrire des règles, puis ne jamais réentraîner"
      ],
      ar: [
        "درّب أو اضبط بدقة مصنِّفًا صغيرًا وسريعًا على التذاكر المسمّاة",
        "أرسل كل تذكرة إلى أكبر LLM متاح بموجّه دون أمثلة (zero-shot)",
        "ابنِ نظام RAG على سجل التذاكر لكل طلب",
        "اطلب من LLM كتابة قواعد ثم لا تُعِد التدريب أبدًا"
      ]
    },
    answer: 0,
    explain: {
      en: "With plenty of labels, a narrow task and strict latency and cost limits, a small dedicated classifier is cheaper and faster than calling a huge LLM 50 million times a day. LLM prompting shines when labels are scarce or the task is open-ended.",
      fr: "Avec beaucoup d'étiquettes, une tâche étroite et des contraintes strictes de latence et de coût, un petit classifieur dédié est moins cher et plus rapide qu'appeler un énorme LLM 50 millions de fois par jour. Le prompting d'un LLM brille quand les étiquettes sont rares ou la tâche ouverte.",
      ar: "مع وفرة التسميات ومهمة محددة وقيود صارمة على الزمن والتكلفة، يكون المصنِّف الصغير المخصص أرخص وأسرع من استدعاء LLM ضخم 50 مليون مرة يوميًا. أما التوجيه عبر LLM فيتألق حين تندر التسميات أو تكون المهمة مفتوحة."
    }
  },
  // ── mlp-neural-network ──
  {
    id: "dl-mlp-neuron-computation",
    concept: "mlp-neural-network",
    difficulty: 1,
    q: {
      en: "What does a single neuron in a hidden layer of an MLP compute?",
      fr: "Que calcule un neurone d'une couche cachée d'un MLP ?",
      ar: "ماذا يحسب عصبون واحد في طبقة مخفية من الشبكة متعددة الطبقات (MLP)؟"
    },
    options: {
      en: [
        "The average of its inputs, with no learnable weights",
        "A weighted sum of its inputs plus a bias, passed through a non-linear activation",
        "The maximum of its inputs over a sliding window",
        "A lookup of its input value in a learned table"
      ],
      fr: [
        "La moyenne de ses entrées, sans poids appris",
        "Une somme pondérée de ses entrées plus un biais, passée dans une activation non linéaire",
        "Le maximum de ses entrées sur une fenêtre glissante",
        "Une recherche de sa valeur d'entrée dans une table apprise"
      ],
      ar: [
        "متوسط مدخلاته بدون أوزان قابلة للتعلم",
        "مجموعًا مرجّحًا لمدخلاته زائد انحياز، يُمرَّر عبر دالة تنشيط غير خطية",
        "القيمة العظمى لمدخلاته عبر نافذة منزلقة",
        "بحثًا عن قيمة مدخله في جدول مُتعلَّم"
      ]
    },
    answer: 1,
    explain: {
      en: "Each neuron computes w·x + b and applies an activation such as ReLU. Stacking many such neurons in fully connected layers lets the network approximate complex non-linear functions.",
      fr: "Chaque neurone calcule w·x + b puis applique une activation comme ReLU. Empiler beaucoup de ces neurones en couches entièrement connectées permet au réseau d'approcher des fonctions non linéaires complexes.",
      ar: "يحسب كل عصبون w·x + b ثم يطبّق دالة تنشيط مثل ReLU. ورصّ كثير من هذه العصبونات في طبقات كاملة الاتصال يتيح للشبكة تقريب دوال غير خطية معقدة."
    }
  },
  {
    id: "dl-mlp-backpropagation",
    concept: "mlp-neural-network",
    difficulty: 1,
    q: {
      en: "What does backpropagation compute?",
      fr: "Que calcule la rétropropagation ?",
      ar: "ماذا يحسب الانتشار العكسي (backpropagation)؟"
    },
    options: {
      en: [
        "The best network architecture for a given dataset",
        "The predictions of the network for a new input",
        "The gradient of the loss with respect to every weight, using the chain rule from the output back to the input",
        "The optimal learning rate for each layer"
      ],
      fr: [
        "La meilleure architecture de réseau pour un jeu de données",
        "Les prédictions du réseau pour une nouvelle entrée",
        "Le gradient de la perte par rapport à chaque poids, via la règle de dérivation en chaîne de la sortie vers l'entrée",
        "Le taux d'apprentissage optimal de chaque couche"
      ],
      ar: [
        "أفضل بنية شبكة لمجموعة بيانات معينة",
        "تنبؤات الشبكة لمُدخل جديد",
        "تدرج الخسارة بالنسبة لكل وزن، باستخدام قاعدة السلسلة من المخرجات رجوعًا إلى المدخلات",
        "معدل التعلم الأمثل لكل طبقة"
      ]
    },
    answer: 2,
    explain: {
      en: "The forward pass produces predictions and a loss; the backward pass reuses intermediate values to compute all gradients efficiently in one sweep. An optimizer such as SGD or Adam then uses those gradients to update the weights.",
      fr: "La passe avant produit les prédictions et la perte ; la passe arrière réutilise les valeurs intermédiaires pour calculer efficacement tous les gradients en un seul balayage. Un optimiseur comme SGD ou Adam utilise ensuite ces gradients pour mettre à jour les poids.",
      ar: "تُنتج التمريرة الأمامية التنبؤات والخسارة، وتعيد التمريرة العكسية استخدام القيم الوسيطة لحساب كل التدرجات بكفاءة في مسح واحد. ثم يستخدم مُحسِّن مثل SGD أو Adam هذه التدرجات لتحديث الأوزان."
    }
  },
  {
    id: "dl-mlp-unscaled-inputs",
    concept: "mlp-neural-network",
    difficulty: 3,
    q: {
      en: "Your MLP's loss barely moves from the first epoch. Inputs include age (18–90) and annual income (0–2,000,000), fed in raw. What is the most likely fix?",
      fr: "La perte de votre MLP bouge à peine dès la première époque. Les entrées incluent l'âge (18–90) et le revenu annuel (0–2 000 000), fournis bruts. Quelle est la correction la plus probable ?",
      ar: "خسارة شبكة MLP لديك بالكاد تتحرك منذ الحقبة الأولى. تشمل المدخلات العمر (18–90) والدخل السنوي (0–2,000,000) بقيمها الخام. ما الإصلاح الأرجح؟"
    },
    options: {
      en: [
        "Add more hidden layers",
        "Standardize the features so they have similar scales",
        "Replace ReLU with Sigmoid",
        "Remove the bias terms"
      ],
      fr: [
        "Ajouter des couches cachées",
        "Standardiser les variables pour qu'elles aient des échelles comparables",
        "Remplacer ReLU par une sigmoïde",
        "Supprimer les biais"
      ],
      ar: [
        "إضافة طبقات مخفية أخرى",
        "توحيد مقاييس الميزات (standardization) لتكون بمقاييس متقاربة",
        "استبدال ReLU بـ Sigmoid",
        "إزالة حدود الانحياز"
      ]
    },
    answer: 1,
    explain: {
      en: "Huge raw values like income dominate the weighted sums, produce enormous gradients for some weights and tiny ones for others, and make a single learning rate unworkable. Neural networks are scale-sensitive, unlike tree models.",
      fr: "Des valeurs brutes énormes comme le revenu dominent les sommes pondérées, produisent des gradients énormes pour certains poids et minuscules pour d'autres, et rendent un taux d'apprentissage unique inutilisable. Les réseaux de neurones sont sensibles à l'échelle, contrairement aux arbres.",
      ar: "القيم الخام الضخمة كالدخل تهيمن على المجاميع المرجّحة، وتنتج تدرجات هائلة لبعض الأوزان وضئيلة لأخرى، فيستحيل العمل بمعدل تعلم واحد. الشبكات العصبية حساسة للمقياس بخلاف نماذج الأشجار."
    }
  },
  // ── rag ──
  {
    id: "dl-rag-definition",
    concept: "rag",
    difficulty: 1,
    q: {
      en: "What does Retrieval-Augmented Generation (RAG) add to an LLM?",
      fr: "Qu'apporte la génération augmentée par récupération (RAG) à un LLM ?",
      ar: "ماذا يضيف التوليد المعزَّز بالاسترجاع (RAG) إلى نموذج LLM؟"
    },
    options: {
      en: [
        "It retrains the model's weights on your documents every night",
        "It lets the model run without a GPU",
        "It increases the number of parameters in the model",
        "It retrieves relevant passages from your documents and inserts them into the prompt"
      ],
      fr: [
        "Il réentraîne les poids du modèle sur vos documents chaque nuit",
        "Il permet de faire tourner le modèle sans GPU",
        "Il augmente le nombre de paramètres du modèle",
        "Il récupère des passages pertinents dans vos documents et les insère dans le prompt"
      ],
      ar: [
        "يعيد تدريب أوزان النموذج على مستنداتك كل ليلة",
        "يتيح تشغيل النموذج بدون GPU",
        "يزيد عدد معاملات النموذج",
        "يسترجع مقاطع ذات صلة من مستنداتك ويدرجها في الموجّه"
      ]
    },
    answer: 3,
    explain: {
      en: "RAG embeds your document chunks, finds those closest to the question, and gives them to the LLM as context. Answers become grounded in current, private sources and can cite them, without changing the model's weights.",
      fr: "Le RAG encode vos fragments de documents, trouve les plus proches de la question et les fournit au LLM comme contexte. Les réponses s'appuient sur des sources actuelles et privées, peuvent les citer, sans modifier les poids du modèle.",
      ar: "يحوّل RAG مقاطع مستنداتك إلى تضمينات، ويجد الأقرب منها إلى السؤال، ويقدّمها إلى LLM كسياق. فتصبح الإجابات مستندة إلى مصادر حديثة وخاصة ويمكنها الاستشهاد بها، دون تغيير أوزان النموذج."
    }
  },
  {
    id: "dl-rag-chunking",
    concept: "rag",
    difficulty: 2,
    q: {
      en: "Why are documents split into chunks before they are embedded in a RAG system?",
      fr: "Pourquoi découpe-t-on les documents en fragments (chunks) avant de les encoder dans un système RAG ?",
      ar: "لماذا تُقسَّم المستندات إلى مقاطع (chunks) قبل تحويلها إلى تضمينات في نظام RAG؟"
    },
    options: {
      en: [
        "Embedding models refuse any text longer than one sentence",
        "Chunking encrypts the documents so the LLM cannot leak them",
        "Small focused passages match questions more precisely and fit in the context window, while one vector per long document blurs its meaning",
        "Chunks let the LLM skip the retrieval step entirely"
      ],
      fr: [
        "Les modèles d'embedding refusent tout texte de plus d'une phrase",
        "Le découpage chiffre les documents pour que le LLM ne puisse pas les divulguer",
        "Des passages courts et ciblés correspondent plus précisément aux questions et tiennent dans la fenêtre de contexte, alors qu'un seul vecteur par long document en brouille le sens",
        "Les fragments permettent au LLM de sauter complètement l'étape de récupération"
      ],
      ar: [
        "نماذج التضمين ترفض أي نص أطول من جملة واحدة",
        "التقسيم يشفّر المستندات حتى لا يسرّبها LLM",
        "المقاطع القصيرة المركّزة تطابق الأسئلة بدقة أكبر وتتسع في نافذة السياق، بينما يطمس متجه واحد لكل مستند طويل معناه",
        "المقاطع تتيح لنموذج LLM تخطي خطوة الاسترجاع تمامًا"
      ]
    },
    answer: 2,
    explain: {
      en: "A single embedding for a 40-page manual averages many topics together, so it matches no specific question well. Chunks of a few hundred tokens, split on headings or paragraphs, give precise retrieval and compact prompts.",
      fr: "Un embedding unique pour un manuel de 40 pages fait la moyenne de nombreux sujets et ne correspond bien à aucune question précise. Des fragments de quelques centaines de tokens, découpés sur les titres ou paragraphes, donnent une récupération précise et des prompts compacts.",
      ar: "التضمين الواحد لدليل من 40 صفحة يمزج مواضيع كثيرة في متوسط واحد، فلا يطابق أي سؤال محدد جيدًا. المقاطع من بضع مئات من الرموز، المقسّمة عند العناوين أو الفقرات، تعطي استرجاعًا دقيقًا وموجّهات مدمجة."
    }
  },
  {
    id: "dl-rag-vs-finetune",
    concept: "rag",
    difficulty: 3,
    q: {
      en: "An internal assistant must answer questions about HR policies that change every month, and every answer must cite its source. Which approach fits best?",
      fr: "Un assistant interne doit répondre à des questions sur des politiques RH qui changent chaque mois, et chaque réponse doit citer sa source. Quelle approche convient le mieux ?",
      ar: "يجب أن يجيب مساعد داخلي عن أسئلة حول سياسات الموارد البشرية التي تتغير كل شهر، ويجب أن تستشهد كل إجابة بمصدرها. أي نهج هو الأنسب؟"
    },
    options: {
      en: [
        "Fine-tune the LLM on the policies once and redeploy it yearly",
        "Rely on the base LLM's pretraining knowledge",
        "RAG over the policy documents, re-indexing them when they change",
        "Train a new language model from scratch on the policies"
      ],
      fr: [
        "Affiner le LLM une fois sur les politiques et le redéployer chaque année",
        "Se fier aux connaissances préentraînées du LLM de base",
        "Un RAG sur les documents de politique, réindexés à chaque changement",
        "Entraîner un nouveau modèle de langage de zéro sur les politiques"
      ],
      ar: [
        "ضبط LLM بدقة على السياسات مرة واحدة وإعادة نشره سنويًا",
        "الاعتماد على معرفة LLM الأساسي من التدريب المسبق",
        "RAG على مستندات السياسات، مع إعادة فهرستها عند تغيّرها",
        "تدريب نموذج لغوي جديد من الصفر على السياسات"
      ]
    },
    answer: 2,
    explain: {
      en: "RAG is the tool for new or changing facts: updating the index is cheap and the retrieved passages provide citations. Fine-tuning is better for teaching a style or skill, and it bakes facts in so they go stale.",
      fr: "Le RAG est l'outil adapté aux faits nouveaux ou changeants : mettre l'index à jour coûte peu et les passages récupérés fournissent les citations. L'affinage convient mieux pour enseigner un style ou une compétence, et il fige les faits qui deviennent obsolètes.",
      ar: "RAG هو الأداة المناسبة للحقائق الجديدة أو المتغيرة: تحديث الفهرس رخيص والمقاطع المسترجعة توفر الاستشهادات. أما الضبط الدقيق فأنسب لتعليم أسلوب أو مهارة، ويثبّت الحقائق في الأوزان فتتقادم."
    }
  },
  {
    id: "dl-rag-diagnose-retrieval",
    concept: "rag",
    difficulty: 3,
    q: {
      en: "Your RAG chatbot gives wrong answers. Inspecting the logs, you see that the passage containing the correct answer is almost never among the retrieved chunks. Where should you focus first?",
      fr: "Votre chatbot RAG donne de mauvaises réponses. Dans les journaux, vous voyez que le passage contenant la bonne réponse ne figure presque jamais parmi les fragments récupérés. Sur quoi vous concentrer d'abord ?",
      ar: "يعطي روبوت المحادثة القائم على RAG إجابات خاطئة. عند فحص السجلات ترى أن المقطع الذي يحتوي الإجابة الصحيحة نادرًا ما يكون بين المقاطع المسترجعة. على ماذا تركّز أولًا؟"
    },
    options: {
      en: [
        "Retrieval: chunking, the embedding model, top-k, hybrid search or re-ranking",
        "Switching to a larger LLM for generation",
        "Lowering the generation temperature to 0",
        "Adding 'answer accurately' to the system prompt"
      ],
      fr: [
        "La récupération : découpage, modèle d'embedding, top-k, recherche hybride ou reclassement",
        "Passer à un LLM plus grand pour la génération",
        "Baisser la température de génération à 0",
        "Ajouter « réponds avec précision » au prompt système"
      ],
      ar: [
        "الاسترجاع: التقسيم، ونموذج التضمين، وقيمة top-k، والبحث الهجين أو إعادة الترتيب",
        "الانتقال إلى LLM أكبر للتوليد",
        "خفض درجة حرارة التوليد إلى 0",
        "إضافة «أجب بدقة» إلى موجّه النظام"
      ]
    },
    answer: 0,
    explain: {
      en: "If the evidence never reaches the prompt, no generator can use it: the bottleneck is retrieval. Measure retrieval recall separately from answer quality and tune chunking, embeddings and ranking before touching the LLM.",
      fr: "Si la preuve n'atteint jamais le prompt, aucun générateur ne peut l'utiliser : le goulot est la récupération. Mesurez le rappel de la récupération séparément de la qualité des réponses et ajustez découpage, embeddings et classement avant de toucher au LLM.",
      ar: "إذا لم يصل الدليل إلى الموجّه أبدًا فلن يستطيع أي مولِّد استخدامه: عنق الزجاجة هو الاسترجاع. قِس استدعاء الاسترجاع منفصلًا عن جودة الإجابات، واضبط التقسيم والتضمينات والترتيب قبل المساس بنموذج LLM."
    }
  },
  // ── rnn-lstm ──
  {
    id: "dl-rnn-hidden-state",
    concept: "rnn-lstm",
    difficulty: 1,
    q: {
      en: "What lets a recurrent neural network use information from earlier steps of a sequence?",
      fr: "Qu'est-ce qui permet à un réseau de neurones récurrent d'utiliser l'information des pas précédents d'une séquence ?",
      ar: "ما الذي يتيح للشبكة العصبية التكرارية (RNN) استخدام معلومات من الخطوات السابقة في السلسلة؟"
    },
    options: {
      en: [
        "A hidden state that is updated at each step and passed on to the next",
        "A separate network trained for each position in the sequence",
        "Sorting the sequence before feeding it in",
        "Self-attention over all positions at once"
      ],
      fr: [
        "Un état caché mis à jour à chaque pas et transmis au suivant",
        "Un réseau distinct entraîné pour chaque position de la séquence",
        "Trier la séquence avant de la fournir au réseau",
        "Une auto-attention sur toutes les positions à la fois"
      ],
      ar: [
        "حالة مخفية تُحدَّث في كل خطوة وتُمرَّر إلى الخطوة التالية",
        "شبكة منفصلة تُدرَّب لكل موضع في السلسلة",
        "ترتيب السلسلة قبل إدخالها",
        "الانتباه الذاتي على جميع المواضع دفعة واحدة"
      ]
    },
    answer: 0,
    explain: {
      en: "At every time step the RNN combines the new input with its previous hidden state using the same weights, so the state acts as a running memory of the sequence so far.",
      fr: "À chaque pas de temps, le RNN combine la nouvelle entrée avec son état caché précédent en utilisant les mêmes poids : l'état sert de mémoire courante de la séquence.",
      ar: "في كل خطوة زمنية تجمع RNN المدخل الجديد مع حالتها المخفية السابقة بالأوزان نفسها، فتعمل الحالة كذاكرة متجددة لما مضى من السلسلة."
    }
  },
  {
    id: "dl-lstm-gates",
    concept: "rnn-lstm",
    difficulty: 2,
    q: {
      en: "Why do LSTMs capture long-range dependencies better than vanilla RNNs?",
      fr: "Pourquoi les LSTM capturent-ils mieux les dépendances à long terme que les RNN simples ?",
      ar: "لماذا تلتقط شبكات LSTM الاعتماديات بعيدة المدى أفضل من RNN البسيطة؟"
    },
    options: {
      en: [
        "They read the sequence backwards, so distant steps become close",
        "They use far more training data than RNNs",
        "They replace the hidden state with a fixed-size lookup table",
        "Gates control a cell state that is updated additively, so gradients can flow across many steps without vanishing"
      ],
      fr: [
        "Ils lisent la séquence à l'envers, ce qui rapproche les pas lointains",
        "Ils utilisent beaucoup plus de données d'entraînement que les RNN",
        "Ils remplacent l'état caché par une table de taille fixe",
        "Des portes contrôlent un état de cellule mis à jour de façon additive : les gradients traversent de nombreux pas sans disparaître"
      ],
      ar: [
        "تقرأ السلسلة بالعكس فتقترب الخطوات البعيدة",
        "تستخدم بيانات تدريب أكثر بكثير من RNN",
        "تستبدل الحالة المخفية بجدول بحث ثابت الحجم",
        "تتحكم البوابات في حالة خلية تُحدَّث بالجمع، فتتدفق التدرجات عبر خطوات كثيرة دون أن تتلاشى"
      ]
    },
    answer: 3,
    explain: {
      en: "In a vanilla RNN the gradient is multiplied by the same weights at every step and shrinks exponentially. The LSTM's forget, input and output gates decide what to keep, and the additive cell-state path gives gradients a highway through time.",
      fr: "Dans un RNN simple, le gradient est multiplié par les mêmes poids à chaque pas et décroît exponentiellement. Les portes d'oubli, d'entrée et de sortie du LSTM décident quoi garder, et le chemin additif de l'état de cellule offre aux gradients une autoroute dans le temps.",
      ar: "في RNN البسيطة يُضرب التدرج بالأوزان نفسها في كل خطوة فيتقلص أُسّيًا. أما بوابات النسيان والإدخال والإخراج في LSTM فتقرر ما يُحتفَظ به، ويمنح مسار حالة الخلية الجمعي التدرجاتِ طريقًا سريعًا عبر الزمن."
    }
  },
  {
    id: "dl-rnn-long-sequence-diagnosis",
    concept: "rnn-lstm",
    difficulty: 3,
    q: {
      en: "A vanilla RNN on 500-step sensor sequences ignores any event that happened more than about 20 steps before the prediction. What is the best change?",
      fr: "Un RNN simple sur des séquences de capteurs de 500 pas ignore tout événement survenu plus d'environ 20 pas avant la prédiction. Quel est le meilleur changement ?",
      ar: "شبكة RNN بسيطة على سلاسل حسّاسات من 500 خطوة تتجاهل أي حدث وقع قبل نحو 20 خطوة من التنبؤ. ما أفضل تغيير؟"
    },
    options: {
      en: [
        "Replace it with an LSTM/GRU (or a Transformer), whose design counters vanishing gradients",
        "Increase the learning rate until the early steps are learned",
        "Shuffle the time steps inside each sequence",
        "Use Sigmoid instead of Tanh in the recurrent cell"
      ],
      fr: [
        "Le remplacer par un LSTM/GRU (ou un Transformer), conçus pour contrer la disparition du gradient",
        "Augmenter le taux d'apprentissage jusqu'à ce que les premiers pas soient appris",
        "Mélanger les pas de temps à l'intérieur de chaque séquence",
        "Utiliser une sigmoïde au lieu de tanh dans la cellule récurrente"
      ],
      ar: [
        "استبدلها بـ LSTM/GRU (أو Transformer)، المصمَّمة لمواجهة تلاشي التدرج",
        "ارفع معدل التعلم حتى تُتعلَّم الخطوات المبكرة",
        "اخلط الخطوات الزمنية داخل كل سلسلة",
        "استخدم Sigmoid بدل Tanh في الخلية التكرارية"
      ]
    },
    answer: 0,
    explain: {
      en: "Short effective memory is the classic symptom of vanishing gradients through time. Gated cells (LSTM, GRU) or attention, which connects distant steps directly, are the standard remedies; shuffling would destroy the temporal order the model needs.",
      fr: "Une mémoire effective courte est le symptôme classique de la disparition du gradient dans le temps. Les cellules à portes (LSTM, GRU) ou l'attention, qui relie directement les pas éloignés, sont les remèdes standard ; mélanger les pas détruirait l'ordre temporel nécessaire.",
      ar: "الذاكرة الفعلية القصيرة عَرَض كلاسيكي لتلاشي التدرج عبر الزمن. والعلاج المعتاد هو الخلايا ذات البوابات (LSTM، GRU) أو آلية الانتباه التي تربط الخطوات البعيدة مباشرة؛ أما خلط الخطوات فيدمّر الترتيب الزمني الذي يحتاجه النموذج."
    }
  },
  // ── transfer-learning ──
  {
    id: "dl-transfer-definition",
    concept: "transfer-learning",
    difficulty: 1,
    q: {
      en: "What is transfer learning?",
      fr: "Qu'est-ce que l'apprentissage par transfert ?",
      ar: "ما التعلم بالنقل (transfer learning)؟"
    },
    options: {
      en: [
        "Copying a dataset from one cloud provider to another",
        "Training two models at the same time and averaging them",
        "Converting a model from PyTorch to TensorFlow",
        "Starting from a model pretrained on a large dataset and adapting it to a new task with less data"
      ],
      fr: [
        "Copier un jeu de données d'un fournisseur cloud à un autre",
        "Entraîner deux modèles en même temps et en faire la moyenne",
        "Convertir un modèle de PyTorch vers TensorFlow",
        "Partir d'un modèle préentraîné sur un grand jeu de données et l'adapter à une nouvelle tâche avec moins de données"
      ],
      ar: [
        "نسخ مجموعة بيانات من مزوّد سحابي إلى آخر",
        "تدريب نموذجين في الوقت نفسه وأخذ متوسطهما",
        "تحويل نموذج من PyTorch إلى TensorFlow",
        "الانطلاق من نموذج مُدرَّب مسبقًا على بيانات ضخمة وتكييفه لمهمة جديدة ببيانات أقل"
      ]
    },
    answer: 3,
    explain: {
      en: "The features learned on millions of images or billions of words (edges, shapes, syntax) are useful for many related tasks. Reusing them lets you reach good accuracy with hundreds or thousands of labels instead of millions.",
      fr: "Les caractéristiques apprises sur des millions d'images ou des milliards de mots (contours, formes, syntaxe) servent à de nombreuses tâches proches. Les réutiliser permet d'obtenir une bonne précision avec des centaines ou des milliers d'étiquettes au lieu de millions.",
      ar: "الميزات المُتعلَّمة من ملايين الصور أو مليارات الكلمات (الحواف، الأشكال، النحو) مفيدة لمهام كثيرة ذات صلة. وإعادة استخدامها تتيح بلوغ دقة جيدة بمئات أو آلاف التسميات بدل الملايين."
    }
  },
  {
    id: "dl-transfer-freeze-layers",
    concept: "transfer-learning",
    difficulty: 2,
    q: {
      en: "With only 500 labeled images, why is it common to freeze the pretrained backbone at first and train only a new classification head?",
      fr: "Avec seulement 500 images étiquetées, pourquoi est-il courant de geler d'abord le réseau préentraîné et de n'entraîner qu'une nouvelle tête de classification ?",
      ar: "مع 500 صورة مسمّاة فقط، لماذا من الشائع تجميد الشبكة الأساسية المُدرَّبة مسبقًا أولًا وتدريب رأس تصنيف جديد فقط؟"
    },
    options: {
      en: [
        "Frozen layers run on the CPU, which is faster",
        "Early layers already hold generic features, and updating millions of weights on so little data would overfit or wreck them",
        "Pretrained weights cannot be changed by backpropagation",
        "The head is the only part that uses activation functions"
      ],
      fr: [
        "Les couches gelées tournent sur le CPU, ce qui est plus rapide",
        "Les premières couches contiennent déjà des caractéristiques génériques, et mettre à jour des millions de poids sur si peu de données provoquerait du surapprentissage ou les abîmerait",
        "La rétropropagation ne peut pas modifier des poids préentraînés",
        "La tête est la seule partie qui utilise des fonctions d'activation"
      ],
      ar: [
        "الطبقات المجمّدة تعمل على CPU وهو أسرع",
        "الطبقات الأولى تحمل ميزات عامة أصلًا، وتحديث ملايين الأوزان على بيانات قليلة كهذه يؤدي إلى الإفراط في التخصيص أو إفسادها",
        "لا يمكن للانتشار العكسي تغيير الأوزان المُدرَّبة مسبقًا",
        "الرأس هو الجزء الوحيد الذي يستخدم دوال التنشيط"
      ]
    },
    answer: 1,
    explain: {
      en: "A randomly initialized head sends large, noisy gradients at first; freezing the backbone protects its features while the head learns. You can then unfreeze top layers and fine-tune with a small learning rate.",
      fr: "Une tête initialisée aléatoirement envoie d'abord des gradients grands et bruités ; geler le réseau de base protège ses caractéristiques pendant que la tête apprend. On peut ensuite dégeler les couches hautes et affiner avec un petit taux d'apprentissage.",
      ar: "يرسل الرأس المُهيَّأ عشوائيًا تدرجات كبيرة ومشوّشة في البداية، وتجميد الشبكة الأساسية يحمي ميزاتها ريثما يتعلم الرأس. ثم يمكنك فك تجميد الطبقات العليا وضبطها بدقة بمعدل تعلم صغير."
    }
  },
  {
    id: "dl-transfer-plant-disease",
    concept: "transfer-learning",
    difficulty: 3,
    q: {
      en: "You have 1,200 labeled leaf photos for a 6-class plant-disease classifier and one GPU for an afternoon. What is the best starting point?",
      fr: "Vous avez 1 200 photos de feuilles étiquetées pour un classifieur de maladies des plantes à 6 classes et un GPU pour un après-midi. Quel est le meilleur point de départ ?",
      ar: "لديك 1,200 صورة أوراق مسمّاة لمصنِّف أمراض نباتات من 6 فئات، ووحدة GPU واحدة لفترة ما بعد الظهر. ما أفضل نقطة انطلاق؟"
    },
    options: {
      en: [
        "Fine-tune an ImageNet-pretrained CNN or ViT with a new 6-class head",
        "Train a deep CNN from random initialization for many epochs",
        "Flatten the pixels and fit a logistic regression",
        "Prompt a text-only LLM with the image file names"
      ],
      fr: [
        "Affiner un CNN ou un ViT préentraîné sur ImageNet avec une nouvelle tête à 6 classes",
        "Entraîner un CNN profond à partir d'une initialisation aléatoire pendant de nombreuses époques",
        "Aplatir les pixels et ajuster une régression logistique",
        "Interroger un LLM textuel avec les noms des fichiers images"
      ],
      ar: [
        "ضبط شبكة CNN أو ViT مُدرَّبة مسبقًا على ImageNet بدقة مع رأس جديد من 6 فئات",
        "تدريب CNN عميقة من تهيئة عشوائية لحقب كثيرة",
        "تسطيح البكسلات وملاءمة انحدار لوجستي",
        "توجيه LLM نصي فقط بأسماء ملفات الصور"
      ]
    },
    answer: 0,
    explain: {
      en: "1,200 images are far too few to learn visual features from scratch, but natural photos are close to ImageNet's domain. Fine-tuning a pretrained backbone typically gives strong accuracy within minutes to hours.",
      fr: "1 200 images sont bien trop peu pour apprendre des caractéristiques visuelles de zéro, mais des photos naturelles sont proches du domaine d'ImageNet. Affiner un réseau préentraîné donne en général une bonne précision en quelques minutes à quelques heures.",
      ar: "1,200 صورة أقل بكثير من أن تكفي لتعلم ميزات بصرية من الصفر، لكن الصور الطبيعية قريبة من مجال ImageNet. والضبط الدقيق لشبكة مُدرَّبة مسبقًا يعطي عادةً دقة عالية خلال دقائق إلى ساعات."
    }
  },
  // ── transformer-architecture ──
  {
    id: "dl-transformer-self-attention",
    concept: "transformer-architecture",
    difficulty: 1,
    q: {
      en: "Which mechanism lets every token in a Transformer layer look directly at every other token?",
      fr: "Quel mécanisme permet à chaque token d'une couche Transformer de regarder directement tous les autres tokens ?",
      ar: "ما الآلية التي تتيح لكل رمز في طبقة Transformer النظر مباشرة إلى كل الرموز الأخرى؟"
    },
    options: {
      en: [
        "Max pooling",
        "A recurrent hidden state",
        "Self-attention",
        "Dropout"
      ],
      fr: [
        "Le max pooling",
        "Un état caché récurrent",
        "L'auto-attention",
        "Le dropout"
      ],
      ar: [
        "التجميع الأقصى (max pooling)",
        "حالة مخفية تكرارية",
        "الانتباه الذاتي (self-attention)",
        "الإسقاط العشوائي (dropout)"
      ]
    },
    answer: 2,
    explain: {
      en: "Self-attention computes queries, keys and values for all tokens and lets each token take a weighted mix of the others' values. Any two positions are connected in a single step, regardless of distance.",
      fr: "L'auto-attention calcule des requêtes, clés et valeurs pour tous les tokens et permet à chacun de prendre un mélange pondéré des valeurs des autres. Deux positions quelconques sont reliées en une seule étape, quelle que soit leur distance.",
      ar: "يحسب الانتباه الذاتي الاستعلامات والمفاتيح والقيم (Q, K, V) لكل الرموز، ويتيح لكل رمز أخذ مزيج مرجّح من قيم الرموز الأخرى. فيرتبط أي موضعين في خطوة واحدة مهما تباعدا."
    }
  },
  {
    id: "dl-transformer-positional-encoding",
    concept: "transformer-architecture",
    difficulty: 2,
    q: {
      en: "Why do Transformers need positional encodings?",
      fr: "Pourquoi les Transformers ont-ils besoin d'encodages positionnels ?",
      ar: "لماذا تحتاج نماذج Transformer إلى الترميزات الموضعية (positional encodings)؟"
    },
    options: {
      en: [
        "They compress the vocabulary to fit in GPU memory",
        "They replace the feed-forward layers",
        "Self-attention by itself ignores token order, so position must be injected explicitly",
        "They prevent the model from attending to padding tokens"
      ],
      fr: [
        "Ils compressent le vocabulaire pour tenir en mémoire GPU",
        "Ils remplacent les couches feed-forward",
        "L'auto-attention seule ignore l'ordre des tokens, il faut donc injecter explicitement la position",
        "Ils empêchent le modèle de prêter attention aux tokens de remplissage"
      ],
      ar: [
        "تضغط المفردات لتتسع في ذاكرة GPU",
        "تحل محل طبقات التغذية الأمامية",
        "الانتباه الذاتي وحده يتجاهل ترتيب الرموز، لذا يجب حقن الموضع صراحةً",
        "تمنع النموذج من الانتباه إلى رموز الحشو"
      ]
    },
    answer: 2,
    explain: {
      en: "Attention treats its input as a set: shuffle the tokens and each one gets the same attention result, just reordered. Adding position information lets the model tell 'dog bites man' from 'man bites dog'.",
      fr: "L'attention traite son entrée comme un ensemble : si l'on mélange les tokens, chacun obtient le même résultat, simplement réordonné. Ajouter l'information de position permet de distinguer « le chien mord l'homme » de « l'homme mord le chien ».",
      ar: "يعامل الانتباه مدخلاته كمجموعة: إذا خلطت الرموز حصل كل منها على النتيجة نفسها بترتيب مختلف فقط. وإضافة معلومات الموضع تتيح للنموذج التمييز بين «عضّ الكلبُ الرجلَ» و«عضّ الرجلُ الكلبَ»."
    }
  },
  {
    id: "dl-transformer-parallel-training",
    concept: "transformer-architecture",
    difficulty: 2,
    q: {
      en: "Why do Transformers train much faster than RNNs on modern GPUs?",
      fr: "Pourquoi les Transformers s'entraînent-ils bien plus vite que les RNN sur les GPU modernes ?",
      ar: "لماذا تتدرب نماذج Transformer أسرع بكثير من RNN على وحدات GPU الحديثة؟"
    },
    options: {
      en: [
        "They have fewer parameters than any RNN",
        "They do not need backpropagation",
        "They only read the first and last token of each sequence",
        "All positions of a sequence are processed in parallel instead of one step after another"
      ],
      fr: [
        "Ils ont moins de paramètres que n'importe quel RNN",
        "Ils n'ont pas besoin de rétropropagation",
        "Ils ne lisent que le premier et le dernier token de chaque séquence",
        "Toutes les positions d'une séquence sont traitées en parallèle au lieu d'un pas après l'autre"
      ],
      ar: [
        "عدد معاملاتها أقل من أي RNN",
        "لا تحتاج إلى الانتشار العكسي",
        "لا تقرأ إلا الرمز الأول والأخير من كل سلسلة",
        "تُعالَج كل مواضع السلسلة بالتوازي بدل خطوة تلو الأخرى"
      ]
    },
    answer: 3,
    explain: {
      en: "An RNN must finish step t before computing step t+1, so it cannot use the GPU's parallelism along the sequence. Attention is a set of large matrix multiplications over all tokens at once, which GPUs execute extremely efficiently.",
      fr: "Un RNN doit terminer le pas t avant de calculer le pas t+1, il ne peut donc pas exploiter le parallélisme du GPU le long de la séquence. L'attention est un ensemble de grandes multiplications matricielles sur tous les tokens à la fois, que les GPU exécutent très efficacement.",
      ar: "يجب على RNN إنهاء الخطوة t قبل حساب الخطوة t+1، فلا تستطيع الاستفادة من توازي GPU على طول السلسلة. أما الانتباه فهو مجموعة ضربات مصفوفات كبيرة على كل الرموز دفعة واحدة، وهو ما تنفذه وحدات GPU بكفاءة عالية جدًا."
    }
  },
  {
    id: "dl-transformer-quadratic-context",
    concept: "transformer-architecture",
    difficulty: 2,
    q: {
      en: "You double a standard Transformer's context length from 4,000 to 8,000 tokens. Roughly how does the size of each attention score matrix change?",
      fr: "Vous doublez la longueur de contexte d'un Transformer standard de 4 000 à 8 000 tokens. Comment évolue approximativement la taille de chaque matrice de scores d'attention ?",
      ar: "تضاعف طول السياق في نموذج Transformer قياسي من 4,000 إلى 8,000 رمز. كيف يتغير تقريبًا حجم كل مصفوفة درجات انتباه؟"
    },
    options: {
      en: [
        "It stays the same",
        "It doubles",
        "It roughly quadruples",
        "It grows eightfold"
      ],
      fr: [
        "Elle reste identique",
        "Elle double",
        "Elle est environ multipliée par 4",
        "Elle est multipliée par 8"
      ],
      ar: [
        "يبقى كما هو",
        "يتضاعف",
        "يتضاعف أربع مرات تقريبًا",
        "يتضاعف ثماني مرات"
      ]
    },
    answer: 2,
    explain: {
      en: "Every token attends to every other token, so the score matrix has n × n entries: going from n to 2n gives 4 times as many. This quadratic cost is why long contexts are expensive and why efficient attention variants exist.",
      fr: "Chaque token prête attention à tous les autres, donc la matrice de scores a n × n entrées : passer de n à 2n en donne 4 fois plus. Ce coût quadratique explique pourquoi les longs contextes coûtent cher et pourquoi il existe des variantes d'attention efficaces.",
      ar: "ينتبه كل رمز إلى كل رمز آخر، فتحوي مصفوفة الدرجات n × n عنصرًا: والانتقال من n إلى 2n يعطي أربعة أضعاف. هذه التكلفة التربيعية هي سبب غلاء السياقات الطويلة وسبب وجود متغيرات انتباه أكثر كفاءة."
    }
  }
];
