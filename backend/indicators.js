// Calculate RSI (Relative Strength Index)
export function calculateRSI(prices, period = 14) {
  if (prices.length < period) return [];

  const rsi = [];
  
  for (let i = period; i < prices.length; i++) {
    const slice = prices.slice(i - period, i);
    let gains = 0;
    let losses = 0;

    for (let j = 1; j < slice.length; j++) {
      const diff = slice[j] - slice[j - 1];
      if (diff > 0) {
        gains += diff;
      } else {
        losses += Math.abs(diff);
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / (avgLoss + 0.0001); // Add small value to avoid division by zero
    const rsiValue = 100 - (100 / (1 + rs));
    rsi.push(rsiValue);
  }

  return rsi;
}

// Calculate MACD (Moving Average Convergence Divergence)
export function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const ema12 = calculateEMA(prices, fastPeriod);
  const ema26 = calculateEMA(prices, slowPeriod);

  const macdLine = [];
  const minLength = Math.min(ema12.length, ema26.length);

  for (let i = 0; i < minLength; i++) {
    macdLine.push(ema12[i] - ema26[i]);
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);

  return {
    macd: macdLine,
    signal: signalLine,
    histogram: macdLine.slice(macdLine.length - signalLine.length).map((m, i) => m - signalLine[i])
  };
}

// Calculate EMA (Exponential Moving Average)
function calculateEMA(prices, period) {
  const ema = [];
  const multiplier = 2 / (period + 1);

  // Calculate SMA for first period
  let sma = prices.slice(0, period).reduce((a, b) => a + b) / period;
  ema.push(sma);

  // Calculate EMA
  for (let i = period; i < prices.length; i++) {
    const emaValue = (prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
    ema.push(emaValue);
  }

  return ema;
}

// Analyze dan buat prediksi berdasarkan indicators
export function analyzePriceMovement(rsi, macd, prices) {
  const currentRSI = rsi[rsi.length - 1];
  const currentMACD = macd.macd[macd.macd.length - 1];
  const currentSignal = macd.signal[macd.signal.length - 1];
  
  let signals = {
    up: 0,
    down: 0
  };

  let reasoning = [];

  // RSI Analysis
  if (currentRSI < 30) {
    signals.up += 2;
    reasoning.push('RSI oversold (< 30) - potential bounce up');
  } else if (currentRSI > 70) {
    signals.down += 2;
    reasoning.push('RSI overbought (> 70) - potential pullback');
  } else if (currentRSI > 50) {
    signals.up += 1;
    reasoning.push('RSI neutral-bullish (50-70)');
  } else {
    signals.down += 1;
    reasoning.push('RSI neutral-bearish (30-50)');
  }

  // MACD Analysis
  if (currentMACD > currentSignal) {
    signals.up += 1.5;
    reasoning.push('MACD above signal line - bullish');
  } else if (currentMACD < currentSignal) {
    signals.down += 1.5;
    reasoning.push('MACD below signal line - bearish');
  }

  // Price trend analysis
  if (prices.length >= 3) {
    const recent = prices.slice(-3);
    if (recent[2] > recent[1] && recent[1] > recent[0]) {
      signals.up += 1;
      reasoning.push('Price trend is upward');
    } else if (recent[2] < recent[1] && recent[1] < recent[0]) {
      signals.down += 1;
      reasoning.push('Price trend is downward');
    }
  }

  const totalSignal = signals.up + signals.down;
  const confidence = Math.round((Math.max(signals.up, signals.down) / totalSignal) * 100);

  return {
    direction: signals.up > signals.down ? 'UP' : 'DOWN',
    confidence: Math.min(confidence, 95), // Cap at 95% confidence
    reasoning: reasoning.join('; ')
  };
}
