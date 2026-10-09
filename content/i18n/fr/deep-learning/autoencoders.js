export default {
  name: "Autoencodeurs (AE et AE variationnel)",
  category: "Apprentissage de représentations",
  task: ["Clustering", "Prétraitement", "Architecture"],
  summary: "Réseaux de neurones entraînés à compresser leur entrée en un petit code latent puis à la reconstruire, ce qui leur fait apprendre des représentations utiles sans étiquettes.",
  intuition: "L’opérateur télégraphiste : vous devez envoyer une photo détaillée sur une ligne qui ne laisse passer que 32 nombres. L’encodeur apprend quels 32 nombres en capturent l’essentiel, et le décodeur apprend à redessiner la photo à partir d’eux. Si une photo ne peut pas être bien redessinée, c’est probablement qu’elle ne ressemble à rien de ce qui a déjà été vu : une anomalie.",
  whenToUse: "Détection d’anomalies non supervisée (fraude, pièces défectueuses, pannes de capteurs), réduction de dimension non linéaire, débruitage d’images, pré-entraînement de caractéristiques quand les étiquettes sont rares, et comme espace latent derrière les modèles génératifs (VAE, VAE de Stable Diffusion).",
  whenToAvoid: "Quand une méthode linéaire comme l’ACP explique déjà l’essentiel de la variance, sur de petits jeux de données tabulaires (Isolation Forest est plus simple pour les anomalies), ou quand il faut des échantillons générés nets et de haute qualité (les VAE simples produisent des sorties floues).",
  parameters: [
    { impact: "Taille du code compressé ; contrôle la quantité d’information qui doit passer par le goulot.", tuningTip: "Trop grand, le réseau apprend la fonction identité ; trop petit, les reconstructions perdent des détails importants." },
    { impact: "Couches denses pour les données tabulaires, Conv/ConvTranspose pour les images, LSTM pour les séquences.", tuningTip: "Pour commencer, gardez le décodeur symétrique de l’encodeur." },
    { impact: "L’AE débruiteur ajoute du bruit à l’entrée ; l’AE parcimonieux pénalise les activations ; le VAE apprend un espace latent probabiliste.", tuningTip: "Utilisez un VAE pour générer de nouvelles données ; un AE débruiteur pour des caractéristiques robustes." },
    { impact: "Une erreur de reconstruction au-dessus de cette valeur signale une anomalie.", tuningTip: "Entraînez uniquement sur des données normales, puis choisissez le seuil sur un jeu de validation contenant quelques anomalies étiquetées." }
  ],
  math: {
    loss: "MSE de reconstruction (+ divergence KL pour le VAE)",
    explanation: "Le goulot d’étranglement oblige le réseau à ne garder que la structure la plus informative des données. Un autoencodeur linéaire avec une perte MSE apprend le même sous-espace que l’ACP ; des couches non linéaires lui permettent de capturer des variétés courbes. Un VAE encode chaque entrée comme une gaussienne (μ, σ) et le terme KL garde l’espace latent régulier, de sorte que des échantillons aléatoires se décodent en données réalistes."
  },
  pros: [
    "Apprend à partir de données non étiquetées",
    "Capture des structures non linéaires que l’ACP manque",
    "L’erreur de reconstruction est un score d’anomalie naturel",
    "Les espaces latents des VAE permettent la génération et une interpolation fluide"
  ],
  cons: [
    "Peut mémoriser (apprendre l’identité) si le goulot est trop large",
    "Les dimensions latentes sont difficiles à interpréter",
    "La détection d’anomalies par reconstruction peut aussi bien reconstruire certaines anomalies",
    "Les échantillons de VAE sont en général plus flous que ceux des GAN ou de la diffusion"
  ],
  diagram: `flowchart LR
  X["Entrée x (par ex. 30 variables)"] --> E1["Couche d’encodeur 64"]
  E1 --> Z["Goulot z (8 dimensions)"]
  Z --> D1["Couche de décodeur 64"]
  D1 --> XH["Reconstruction x̂"]
  XH --> L["Perte = ‖x − x̂‖²"]
  L -.->|"rétropropagation"| E1
  Z --> U1["Utiliser z : variables compressées / clustering"]
  XH --> R{"Erreur au-dessus du seuil ?"}
  R -->|"oui"| A1["Anomalie"]
  R -->|"non"| A2["Normal"]
  Z -.->|"VAE : tirer z ~ N(μ, σ)"| G["Générer de nouveaux échantillons"]`
};
