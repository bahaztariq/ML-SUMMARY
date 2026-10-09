export default {
  name: "Gradient boosting (GBM et AdaBoost)",
  category: "Ensemble / Boosting",
  task: ["Classification", "Régression"],
  summary: "Construit un modèle puissant en ajoutant séquentiellement des apprenants faibles (généralement des arbres peu profonds), chacun corrigeant les erreurs de l'ensemble construit jusque-là.",
  intuition: "Le putt au golf : votre premier coup envoie la balle à peu près vers le trou. Chaque putt suivant ne vise que la distance restante et vous rapproche un peu plus à chaque fois. AdaBoost procède en repondérant les balles manquées ; le GBM, en visant directement l'erreur restante (le résidu).",
  whenToUse: "Jeux de données tabulaires de taille moyenne, lorsque vous voulez une précision supérieure à celle d'une forêt aléatoire et pouvez vous permettre un peu de réglage. C'est aussi la base conceptuelle pour comprendre XGBoost, LightGBM et CatBoost.",
  whenToAvoid: "Très grands jeux de données (le GBM classique de sklearn est mono-thread et lent — préférez HistGradientBoosting, LightGBM ou XGBoost), étiquettes très bruitées (AdaBoost s'acharne sur les points mal étiquetés), ou lorsque vous avez besoin d'un entraînement entièrement parallèle.",
  parameters: [
    {
      impact: "Nombre d'étapes de boosting successives (arbres).",
      tuningTip: "Contrairement à la forêt aléatoire, trop d'étapes PROVOQUE du surapprentissage. Associez une grande valeur à un arrêt anticipé (n_iter_no_change) sur un jeu de validation."
    },
    {
      impact: "Réduit la contribution de chaque arbre avant son ajout à l'ensemble.",
      tuningTip: "Des valeurs plus faibles (0,01–0,05) généralisent mieux mais exigent proportionnellement plus d'arbres. À régler conjointement avec n_estimators."
    },
    {
      impact: "Profondeur de chaque apprenant faible ; contrôle l'ordre des interactions entre variables capturées.",
      tuningTip: "Restez peu profond (2–6). Une profondeur de 1 (souches) correspond à l'AdaBoost classique et ne capture aucune interaction."
    },
    {
      impact: "Fraction des lignes utilisée pour ajuster chaque arbre (gradient boosting stochastique).",
      tuningTip: "Une valeur de 0,6–0,9 ajoute de l'aléa qui réduit la variance et accélère l'entraînement."
    }
  ],
  math: {
    loss: "Toute perte différentiable (MSE, log-loss, Huber) ; AdaBoost ≈ perte exponentielle",
    explanation: "Chaque étape ajuste un nouvel arbre h_m aux pseudo-résidus r_im — le gradient négatif de la perte par rapport à la prédiction courante. C'est une descente de gradient effectuée dans l'espace des fonctions plutôt que dans l'espace des paramètres. Le taux d'apprentissage η réduit chaque pas afin qu'aucun arbre ne domine."
  },
  pros: [
    "Généralement plus précis que la forêt aléatoire sur les données structurées/tabulaires",
    "Flexible : fonctionne avec n'importe quelle fonction de perte différentiable",
    "Les arbres peu profonds gardent chaque étape simple et interprétable via l'importance des variables",
    "Solide fondement théorique en tant que descente de gradient fonctionnelle"
  ],
  cons: [
    "L'entraînement séquentiel ne peut pas être parallélisé entre les arbres",
    "Plus sensible aux hyperparamètres et plus facile à surajuster que le bagging",
    "AdaBoost est très sensible au bruit d'étiquetage et aux valeurs aberrantes",
    "L'implémentation classique de sklearn est lente sur les grands jeux de données"
  ],
  diagram: `flowchart TD
    A[("Données d'entraînement X, y")] --> B["F0 = référence constante (moyenne / log-odds)"]
    B --> C["Calculer les résidus r = −gradient de la perte"]
    C --> D["Ajuster un arbre peu profond h_m aux résidus"]
    D --> E["Mettre à jour F_m = F_m-1 + η · h_m"]
    E --> F{"La perte de validation s'améliore-t-elle encore ?"}
    F -->|"oui"| C
    F -->|"non"| G(["Modèle final = somme de tous les arbres"])
    G --> H["Prédiction pour un nouveau x"]`
};
