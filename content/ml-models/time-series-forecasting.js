export default {
  id: "time-series-forecasting",
  name: "Time Series Forecasting (ARIMA & Prophet)",
  track: "ml-models",
  category: "Time Series",
  task: ["Regression", "Time Series", "Forecasting"],
  difficulty: "Intermediate",
  summary: "Predicts future values of a sequence by modeling its trend, seasonality and autocorrelation, using statistical models like ARIMA or decomposable models like Prophet.",
  intuition: "The Weather Almanac: To predict tomorrow's ice cream sales you look at three things — the long-term direction (business is growing), the repeating rhythm (weekends and summers are busier), and yesterday's momentum (a hot streak tends to continue). ARIMA models the momentum mathematically; Prophet adds up trend + seasonality + holidays like Lego blocks.",
  whenToUse: "Demand forecasting, sales, traffic, energy load, or any metric observed at regular intervals with clear trends and seasonal cycles. ARIMA for single, stationary-ish series; Prophet for business data with multiple seasonalities, holidays and missing days.",
  whenToAvoid: "Thousands of related series with rich covariates (global ML models like LightGBM with lag features or deep learning often win), very short histories (under ~2 seasonal cycles), or when shocks are driven by unobserved external events.",
  requirements: {
    scalingRequired: false,
    handlesMissing: true,
    outlierSensitive: true,
    stationarityRequired: "ARIMA: yes (via differencing); Prophet: no"
  },
  parameters: [
    {
      name: "order (p, d, q)",
      type: "tuple",
      default: "(1, 0, 0)",
      impact: "ARIMA: p = autoregressive lags, d = differencing steps, q = moving-average error lags.",
      tuningTip: "Choose d with an ADF test, p from the PACF plot, q from the ACF plot — or use auto_arima to search by AIC."
    },
    {
      name: "seasonal_order (P, D, Q, s)",
      type: "tuple",
      default: "(0, 0, 0, 0)",
      impact: "SARIMA: seasonal AR/differencing/MA terms with period s.",
      tuningTip: "Set s to the cycle length (7 for daily data with weekly cycle, 12 for monthly)."
    },
    {
      name: "changepoint_prior_scale (Prophet)",
      type: "float",
      default: "0.05",
      impact: "Flexibility of the trend to bend at changepoints.",
      tuningTip: "Increase (0.1–0.5) if the trend underfits; decrease (0.001–0.01) if it chases noise."
    },
    {
      name: "seasonality_mode (Prophet)",
      type: "str",
      default: "'additive'",
      impact: "Whether seasonal effects add to or multiply the trend.",
      tuningTip: "Use 'multiplicative' when seasonal swings grow as the series grows."
    }
  ],
  math: {
    formula: "ARIMA: y′_t = c + Σ_{i=1..p} φ_i·y′_{t−i} + Σ_{j=1..q} θ_j·ε_{t−j} + ε_t     Prophet: y(t) = g(t) + s(t) + h(t) + ε_t",
    loss: "Maximum likelihood (ARIMA) / MAP via Stan (Prophet); evaluated with MAE, RMSE, MAPE",
    explanation: "ARIMA differences the series d times (y′) to make it stationary, then regresses it on its own p past values and q past forecast errors. Prophet is a curve-fitting model: a piecewise-linear or logistic trend g(t), Fourier-series seasonality s(t), and holiday effects h(t) are summed, which makes each component easy to inspect."
  },
  pros: [
    "Strong, interpretable baselines with confidence intervals out of the box",
    "Prophet handles missing data, outliers, holidays and multiple seasonalities easily",
    "ARIMA is statistically rigorous and works well on short, clean series",
    "Components (trend, seasonality) can be plotted and explained to stakeholders"
  ],
  cons: [
    "ARIMA requires stationarity checks and careful order selection",
    "Classic models handle one series at a time and few exogenous features",
    "Prophet can be outperformed by simple baselines on non-business data",
    "Standard random K-fold CV leaks the future — needs time-aware validation"
  ],
  prerequisites: ["linear-regression", "time-series-cv"],
  related: ["rnn-lstm", "lightgbm", "mae-metric", "rmse-metric"],
  diagram: `flowchart TD
    A[("Ordered time series y_t")] --> B["Plot and decompose: trend, seasonality, residual"]
    B --> C{"Which model?"}
    C -->|"ARIMA"| D["ADF test, difference d times until stationary"]
    D --> E["Pick p from PACF, q from ACF (or auto_arima)"]
    E --> F["Fit by maximum likelihood"]
    C -->|"Prophet"| G["Fit trend g(t) + seasonality s(t) + holidays h(t)"]
    F --> H["Forecast horizon with confidence intervals"]
    G --> H
    H --> I["Evaluate with time-ordered backtest (MAE, MAPE)"]
    I --> J(["Production forecast"])`,
  codeSnippet: `import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
from prophet import Prophet
from sklearn.metrics import mean_absolute_error

# df: columns ['ds' (date), 'y' (daily sales)]
df = df.sort_values('ds')
train, test = df.iloc[:-30], df.iloc[-30:]   # hold out last 30 days, never shuffle

# --- SARIMA: AR(1), first difference, MA(1), weekly seasonality ---
sarima = SARIMAX(train['y'], order=(1, 1, 1), seasonal_order=(1, 1, 1, 7))
sarima_fit = sarima.fit(disp=False)
sarima_pred = sarima_fit.forecast(steps=30)
print("SARIMA MAE:", mean_absolute_error(test['y'], sarima_pred))

# --- Prophet: trend + weekly/yearly seasonality + holidays ---
m = Prophet(seasonality_mode='multiplicative', changepoint_prior_scale=0.1)
m.add_country_holidays(country_name='US')
m.fit(train)
future = m.make_future_dataframe(periods=30)
forecast = m.predict(future)
prophet_pred = forecast['yhat'].iloc[-30:].values
print("Prophet MAE:", mean_absolute_error(test['y'], prophet_pred))

m.plot_components(forecast)   # inspect trend and seasonality`
};
