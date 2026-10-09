export default {
  name: "Modèles génératifs (GAN et diffusion)",
  category: "IA générative",
  task: ["Vision par ordinateur", "Architecture"],
  summary: "Des modèles qui apprennent la distribution de probabilité des données d’entraînement afin de pouvoir créer des échantillons entièrement nouveaux et réalistes : images, audio ou enregistrements tabulaires synthétiques.",
  intuition: "Le faussaire et le restaurateur : un GAN, c’est un faussaire (le générateur) et un détective d’art (le discriminateur) engagés dans un duel jusqu’à ce que les faux soient impossibles à distinguer des vrais tableaux. Un modèle de diffusion est un restaurateur qui a appris à retirer un tout petit peu de poussière d’un tableau ; en partant d’une neige pure et en nettoyant étape par étape, il fait apparaître une image entièrement nouvelle.",
  whenToUse: "Génération d’images, de vidéo et d’audio (texte vers image), super-résolution et inpainting, augmentation de données pour les classes rares, données synthétiques pour protéger la vie privée, et transfert de style.",
  whenToAvoid: "Tâches de prédiction ordinaires (classification / régression), quand vous n’avez ni gros budget GPU ni grands jeux de données, ou quand le contenu généré pourrait créer des problèmes juridiques, de consentement ou de désinformation que vous ne pouvez pas gérer.",
  parameters: [
    { impact: "Nombre de niveaux de bruit ; plus d’étapes d’échantillonnage donnent une meilleure qualité mais une génération plus lente.", tuningTip: "Utilisez des échantillonneurs rapides (DDIM, DPM-Solver) pour réduire l’inférence à 20–30 étapes." },
    { impact: "Classifier-free guidance : à quel point la sortie suit le prompt textuel.", tuningTip: "5–9 est typique ; des valeurs très élevées sursaturent les images et réduisent la diversité." },
    { impact: "Équilibre entre les vitesses d’entraînement du générateur et du discriminateur.", tuningTip: "Si D gagne trop facilement, G ne reçoit plus de gradient utile : baissez le LR de D ou ajoutez du label smoothing / une normalisation spectrale." },
    { impact: "Taille de l’entrée aléatoire qui sert de graine à chaque nouvel échantillon.", tuningTip: "La diffusion latente (Stable Diffusion) travaille dans l’espace latent compressé d’un autoencodeur, pour gagner en vitesse." }
  ],
  math: {
    loss: "Perte minimax adverse (GAN) / MSE de prédiction du bruit (diffusion)",
    explanation: "Dans un GAN, D maximise sa capacité à distinguer le vrai du faux tandis que G la minimise, ce qui pousse la distribution des sorties de G vers la vraie distribution. En diffusion, un bruit gaussien ε est ajouté à une image réelle x pour produire x_t ; le réseau ε_θ apprend à prédire ce bruit, si bien qu’au moment de la génération il peut débruiter étape par étape un bruit purement aléatoire jusqu’à obtenir un nouvel échantillon."
  },
  pros: [
    "Produit des images, de l’audio et des vidéos d’un réalisme saisissant",
    "Les modèles de diffusion s’entraînent de façon stable et couvrent des modes variés des données",
    "Les GAN génèrent en une seule passe avant, rapide",
    "Utiles pour l’augmentation de données et les données synthétiques respectueuses de la vie privée"
  ],
  cons: [
    "Les GAN souffrent d’un entraînement instable et de l’effondrement de modes (mode collapse)",
    "L’échantillonnage par diffusion est lent (de nombreuses étapes de débruitage)",
    "Besoins énormes en données et en calcul ; difficiles à évaluer (FID, jugement humain)",
    "Risques sérieux : deepfakes, questions de droits d’auteur et de biais"
  ],
  diagram: `flowchart TD
  subgraph gan["GAN"]
    Z["Bruit aléatoire z"] --> G["Générateur"]
    G --> FK["Faux échantillon"]
    RL[("Échantillons réels")] --> D{"Discriminateur : vrai ou faux ?"}
    FK --> D
    D -.->|"retour : améliorer les faux"| G
  end
  subgraph diff["Diffusion"]
    X0["Image réelle x₀"] -->|"ajouter du bruit sur T étapes"| XT["Bruit pur x_T"]
    XT --> NN["Le réseau prédit le bruit ε à l’étape t"]
    NN -->|"retirer le bruit, répéter de T à 0"| OUT["Nouvelle image générée"]
    P["Embedding du prompt textuel"] -.->|"guidage"| NN
  end`
};
