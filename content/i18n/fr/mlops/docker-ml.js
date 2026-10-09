export default {
  name: "Docker et conteneurs pour le ML",
  category: "Déploiement & mise en service",
  task: ["Déploiement", "Architecture"],
  summary: "Empaqueter un modèle, son code, ses dépendances Python et ses bibliothèques système dans une image de conteneur portable et immuable, qui s’exécute à l’identique sur un portable, un serveur de CI ou un cluster Kubernetes.",
  intuition: "Le conteneur maritime : avant les conteneurs standardisés, chaque cargaison demandait une manutention spécifique dans chaque port. Un conteneur a une forme fixe, si bien que n’importe quel navire, grue ou camion peut le déplacer sans savoir ce qu’il contient. Une image Docker fait de même pour le logiciel : « ça marche sur ma machine » devient « ça marche sur toutes les machines ».",
  whenToUse: "Pour déployer des API de modèles ou des traitements par lots, lancer des entraînements sur le cloud ou Kubernetes, garantir des environnements identiques entre les membres de l’équipe et la CI, et figer les versions de CUDA et des bibliothèques pour les charges GPU.",
  whenToAvoid: "Pour des notebooks purement exploratoires sur votre propre machine, ou sur des plateformes serverless entièrement gérées qui empaquettent le code à votre place (même si beaucoup utilisent des conteneurs en coulisses).",
  requirements: {
    gpuSupport: "Nécessite NVIDIA Container Toolkit + une image de base CUDA"
  },
  parameters: [
    {
      impact: "Détermine l’OS, la version de Python et la taille de l’image ; le travail sur GPU nécessite une base nvidia/cuda ou pytorch.",
      tuningTip: "Préférez les images slim ; évitez le tag « latest » et figez les versions exactes pour la reproductibilité."
    },
    {
      impact: "Docker met les couches en cache ; copier requirements.txt avant le code source évite de réinstaller les paquets à chaque modification du code.",
      tuningTip: "Placez d’abord les étapes qui changent rarement, en dernier celles qui changent souvent."
    },
    {
      impact: "Construit/compile dans une première étape et ne copie que le résultat dans une image d’exécution légère.",
      tuningTip: "Peut faire passer une image de plusieurs Go à quelques centaines de Mo."
    },
    {
      impact: "Intégrer le modèle à l’image garantit l’immuabilité ; le télécharger depuis un registre au démarrage donne des images plus petites et des changements de modèle plus rapides.",
      tuningTip: "Intégrez les petits modèles ; récupérez les gros (LLM de plusieurs Go) depuis un stockage objet au démarrage."
    }
  ],
  math: {
    loss: "Empaquetage immuable en couches",
    explanation: "Une image est un empilement de couches en lecture seule identifiées par le hachage de leur contenu ; les couches identiques sont mises en cache et partagées. Chaque conteneur lancé depuis la même image dispose d’un environnement identique, ce qui élimine la dérive des dépendances entre développement et production."
  },
  pros: [
    "Environnements reproductibles entre portables, CI et production",
    "Isole des versions de dépendances incompatibles d’un projet à l’autre",
    "Unité standard d’orchestration avec Kubernetes, ECS, Cloud Run, etc."
  ],
  cons: [
    "Les images de ML (CUDA, PyTorch) peuvent être très volumineuses et lentes à construire ou à télécharger",
    "L’accès au GPU exige des pilotes supplémentaires sur l’hôte et une configuration du runtime",
    "Ajoute une courbe d’apprentissage (réseau, volumes, registres d’images, analyse de sécurité)"
  ],
  diagram: `flowchart LR
    A["requirements.txt"] --> D["Dockerfile"]
    B["code serve.py"] --> D
    C["model.joblib"] --> D
    D --> E["docker build"]
    E --> F["Image en couches (couches en cache)"]
    F --> G[("Registre d’images")]
    G --> H["Conteneur sur un portable"]
    G --> I["Conteneur de test en CI"]
    G --> J["Pods Kubernetes (répliques)"]
    J --> K["Le même environnement partout"]`
};
