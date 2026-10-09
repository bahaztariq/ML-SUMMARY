export default {
  name: "Prévision de séries temporelles (ARIMA et Prophet)",
  category: "Séries temporelles",
  task: ["Régression", "Séries temporelles", "Prévision"],
  summary: "Prédit les valeurs futures d'une séquence en modélisant sa tendance, sa saisonnalité et son autocorrélation, à l'aide de modèles statistiques comme ARIMA ou de modèles décomposables comme Prophet.",
  intuition: "L'almanach météo : pour prévoir les ventes de glaces de demain, vous regardez trois choses — la direction à long terme (l'activité progresse), le rythme qui se répète (les week-ends et les étés sont plus chargés) et l'élan de la veille (une série de jours chauds a tendance à se prolonger). ARIMA modélise mathématiquement cet élan ; Prophet additionne tendance + saisonnalité + jours fériés comme des briques de Lego.",
  whenToUse: "Prévision de la demande, des ventes, du trafic, de la charge énergétique, ou de toute métrique observée à intervalles réguliers avec des tendances et des cycles saisonniers nets. ARIMA pour une série unique à peu près stationnaire ; Prophet pour des données métier avec plusieurs saisonnalités, des jours fériés et des jours manquants.",
  whenToAvoid: "Des milliers de séries liées avec de riches covariables (des modèles de ML globaux comme LightGBM avec des variables de retard, ou l'apprentissage profond, l'emportent souvent), des historiques très courts (moins de ~2 cycles saisonniers), ou lorsque les chocs sont dus à des événements extérieurs non observés.",
  requirements: {
    stationarityRequired: "ARIMA : oui (par différenciation) ; Prophet : non"
  },
  parameters: [
    {
      impact: "ARIMA : p = retards autorégressifs, d = nombre de différenciations, q = retards des erreurs de moyenne mobile.",
      tuningTip: "Choisissez d avec un test ADF, p d'après le graphique PACF, q d'après le graphique ACF — ou utilisez auto_arima pour chercher selon l'AIC."
    },
    {
      impact: "SARIMA : termes saisonniers AR / différenciation / MA de période s.",
      tuningTip: "Fixez s à la longueur du cycle (7 pour des données quotidiennes à cycle hebdomadaire, 12 pour des données mensuelles)."
    },
    {
      impact: "Souplesse avec laquelle la tendance peut s'infléchir aux points de rupture.",
      tuningTip: "Augmentez-la (0,1–0,5) si la tendance sous-apprend ; diminuez-la (0,001–0,01) si elle suit le bruit."
    },
    {
      impact: "Indique si les effets saisonniers s'ajoutent à la tendance ou la multiplient.",
      tuningTip: "Utilisez « multiplicative » lorsque l'amplitude saisonnière augmente avec le niveau de la série."
    }
  ],
  math: {
    loss: "Maximum de vraisemblance (ARIMA) / MAP via Stan (Prophet) ; évaluation par MAE, RMSE, MAPE",
    explanation: "ARIMA différencie la série d fois (y′) pour la rendre stationnaire, puis la régresse sur ses p valeurs passées et ses q erreurs de prévision passées. Prophet est un modèle d'ajustement de courbe : une tendance linéaire par morceaux ou logistique g(t), une saisonnalité en séries de Fourier s(t) et des effets de jours fériés h(t) sont additionnés, ce qui rend chaque composante facile à examiner."
  },
  pros: [
    "Modèles de référence solides et interprétables, avec intervalles de confiance fournis d'emblée",
    "Prophet gère facilement les données manquantes, les valeurs aberrantes, les jours fériés et les saisonnalités multiples",
    "ARIMA est statistiquement rigoureux et fonctionne bien sur des séries courtes et propres",
    "Les composantes (tendance, saisonnalité) peuvent être tracées et expliquées aux parties prenantes"
  ],
  cons: [
    "ARIMA exige des tests de stationnarité et un choix soigneux des ordres",
    "Les modèles classiques traitent une série à la fois et peu de variables exogènes",
    "Prophet peut être battu par de simples modèles de référence sur des données non métier",
    "La validation croisée K-fold aléatoire classique fait fuiter le futur — il faut une validation qui respecte le temps"
  ],
  diagram: `flowchart TD
    A[("Série temporelle ordonnée y_t")] --> B["Tracer et décomposer : tendance, saisonnalité, résidu"]
    B --> C{"Quel modèle ?"}
    C -->|"ARIMA"| D["Test ADF, différencier d fois jusqu'à stationnarité"]
    D --> E["Choisir p via la PACF, q via l'ACF (ou auto_arima)"]
    E --> F["Ajuster par maximum de vraisemblance"]
    C -->|"Prophet"| G["Ajuster tendance g(t) + saisonnalité s(t) + jours fériés h(t)"]
    F --> H["Prévoir l'horizon avec intervalles de confiance"]
    G --> H
    H --> I["Évaluer par backtest chronologique (MAE, MAPE)"]
    I --> J(["Prévision en production"])`
};
