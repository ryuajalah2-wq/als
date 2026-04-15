import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { calculateRSI, calculateMACD, analyzePriceMovement } from './indicators.js';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Anthropic Claude
const anthropicApiKey = process.env.ANTHROPIC_API_KEY || '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';
let anthropic = null;

try {
  anthropic = new Anthropic({
    apiKey: anthropicApiKey
  });
} catch (error) {
  console.warn('⚠️ Anthropic initialization warning:', error.message);
  console.log('💡 AI analysis will use fallback predictions instead');
}

// Middleware
app.use(cors());
app.use(express.json());

// Cache untuk data crypto
let priceCache = {};
let lastFetchTime = {};
const CACHE_DURATION = 60000; // 1 menit cache

// Default coins to always fetch - hanya 2 untuk avoid rate limit
const DEFAULT_COINS = ['dogecoin', 'shiba-inu'];

// Function fetch price data dari CoinGecko dengan cache
async function fetchCryptoPrices() {
  try {
    // Check cache dulu
    const now = Date.now();
    if (priceCache && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
      return priceCache;
    }

    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${DEFAULT_COINS.join(',')}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`);
    priceCache = response.data;
    lastFetchTime = now;
    return response.data;
  } catch (error) {
    console.error('Error fetching prices:', error.message);
    // Return cached data jika tersedia
    return priceCache || null;
  }
}

// Function fetch historical data untuk technical analysis
async function fetchHistoricalData(coinId, days, interval = 'hourly') {
  try {
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
      {
        params: {
          vs_currency: 'usd',
          days: days,
          interval: 'daily'
        }
      }
    );
    return response.data.prices;
  } catch (error) {
    console.error(`Error fetching historical data for ${coinId}:`, error.message);
    // Use mock data as fallback
    return generateMockHistoricalData(coinId, days);
  }
}

// Generate mock historical data untuk demo
function generateMockHistoricalData(coinId = 'demo', days = 30) {
  const data = [];
  const now = Date.now();
  
  // Different base prices untuk different coins
  const basePrices = {
    'dogecoin': 0.08,
    'shiba-inu': 0.000012,
    'bitcoin': 45000,
    'ethereum': 2500,
  };
  
  let basePrice = basePrices[coinId?.toLowerCase()] || 50000 + Math.random() * 20000;
  
  for (let i = days; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    const volatility = basePrice * 0.03; // 3% volatility
    const price = basePrice * (1 + (Math.random() - 0.5) * 0.06);
    data.push([timestamp, price]);
    basePrice = price;
  }
  
  return data;
}

// Function: Use Anthropic Claude untuk analyze dan predict target price
async function analyzeWithAI(coinSymbol, historicalData, rsi, macd, prediction, currentPrice, timeframe) {
  // If Anthropic not initialized, return smart fallback
  if (!anthropic) {
    return generateSmartFallbackAnalysis(rsi, prediction, currentPrice, timeframe);
  }

  try {
    const prices = historicalData.map(d => typeof d === 'object' ? d[1] : d);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const priceChange = prices[prices.length - 1] - prices[0];
    const changePercent = (priceChange / prices[0] * 100).toFixed(2);
    const volatility = (Math.max(...prices) - Math.min(...prices)) / avgPrice * 100;

    const prompt = `You are a crypto market analyst. Analyze this market data and provide ONLY a JSON response (no markdown, no explanation).

Coin: ${coinSymbol.toUpperCase()}
Current Price: $${currentPrice.toFixed(8)}
Timeframe: ${timeframe} minutes
Price Change: ${changePercent}%
Volatility: ${volatility.toFixed(2)}%
RSI (14): ${rsi.toFixed(2)}
MACD: ${macd.toFixed(6)}
Trend: ${prediction}

Respond with ONLY this JSON structure (no other text):
{
  "analysis": "1-2 sentence market analysis explaining current conditions",
  "reasoning": "2-3 sentences explaining why the price could reach the target price (mention support, resistance, indicators, or market conditions)",
  "targetPrice": ${currentPrice.toFixed(8)},
  "priceRange": {"min": ${currentPrice * 0.95}, "max": ${currentPrice * 1.05}},
  "risk": "Low|Medium|High",
  "recommendation": "Buy|Hold|Sell"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const aiAnalysis = JSON.parse(jsonMatch[0]);
      return {
        analysis: aiAnalysis.analysis || 'Market analysis complete',
        reasoning: aiAnalysis.reasoning || 'Technical indicators suggest potential price movement',
        targetPrice: parseFloat(aiAnalysis.targetPrice) || currentPrice,
        priceRange: { 
          min: parseFloat(aiAnalysis.priceRange?.min) || currentPrice * 0.95, 
          max: parseFloat(aiAnalysis.priceRange?.max) || currentPrice * 1.05 
        },
        risk: aiAnalysis.risk || 'Medium',
        recommendation: aiAnalysis.recommendation || 'Hold'
      };
    }
    
    return generateSmartFallbackAnalysis(rsi, prediction, currentPrice, timeframe);
  } catch (error) {
    console.error('Anthropic Error:', error.message);
    return generateSmartFallbackAnalysis(rsi, prediction, currentPrice, timeframe);
  }
}

// Generate intelligent fallback when AI fails
function generateSmartFallbackAnalysis(rsi, prediction, currentPrice, timeframe) {
  let analysis = '';
  let reasoning = '';
  let recommendation = 'Hold';
  let risk = 'Medium';

  // RSI-based analysis
  if (rsi < 30) {
    analysis = 'Oversold conditions detected - potential recovery. ';
    reasoning = 'At RSI < 30, the asset is heavily oversold, which historically precedes price bounces. Support levels are likely to hold as buyers enter at lower prices.';
    recommendation = 'Buy';
    risk = 'Low';
  } else if (rsi > 70) {
    analysis = 'Overbought conditions detected - watch for pullback. ';
    reasoning = 'At RSI > 70, the asset is overbought and vulnerable to profit-taking. Resistance levels may be tested as the momentum cools.';
    recommendation = 'Sell';
    risk = 'Low';
  } else if (rsi > 50) {
    analysis = 'Bullish momentum building. ';
    reasoning = 'RSI between 50-70 shows strong upward momentum. Price may continue higher as buying pressure remains elevated.';
    recommendation = 'Buy';
    risk = 'Medium';
  } else {
    analysis = 'Consolidation phase - neutral momentum. ';
    reasoning = 'RSI in the neutral range suggests equilibrium between buyers and sellers. A breakout could occur in either direction based on volume.';
    recommendation = 'Hold';
    risk = 'Medium';
  }

  // Adjust based on prediction
  if (prediction === 'UP') {
    const targetMultiplier = timeframe > 240 ? 1.08 : timeframe > 60 ? 1.05 : 1.03;
    const actionReason = timeframe > 240 ? 'longer timeframe suggests sustained uptrend' : 'positive technicals indicate upside potential';
    return {
      analysis: analysis + `Technical indicators suggest upward pressure in ${timeframe}min.`,
      reasoning: reasoning + ` Based on the ${actionReason}, the target is set at ${(targetMultiplier * 100 - 100).toFixed(1)}% above current price.`,
      targetPrice: currentPrice * targetMultiplier,
      priceRange: { 
        min: currentPrice * 0.98, 
        max: currentPrice * (targetMultiplier * 1.1)
      },
      risk: risk,
      recommendation: 'Buy'
    };
  } else {
    const targetMultiplier = timeframe > 240 ? 0.92 : timeframe > 60 ? 0.95 : 0.97;
    const actionReason = timeframe > 240 ? 'longer timeframe shows downtrend weakness' : 'negative signals indicate downside risk';
    return {
      analysis: analysis + `Technical indicators suggest downward pressure in ${timeframe}min.`,
      reasoning: reasoning + ` Based on the ${actionReason}, the target is set at ${(100 - targetMultiplier * 100).toFixed(1)}% below current price.`,
      targetPrice: currentPrice * targetMultiplier,
      priceRange: { 
        min: currentPrice * (targetMultiplier * 0.9), 
        max: currentPrice * 1.02
      },
      risk: risk,
      recommendation: 'Sell'
    };
  }
}

// Endpoint: Get current prices
app.get('/api/prices', async (req, res) => {
  try {
    const prices = await fetchCryptoPrices();
    if (prices) {
      priceCache = prices;
      lastFetchTime = Date.now();
      res.json(prices);
    } else {
      res.status(500).json({ error: 'Failed to fetch prices' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Analyze crypto dengan technical indicators + AI
app.post('/api/analyze', async (req, res) => {
  try {
    const { coin, timeframe } = req.body;
    
    if (!coin || !timeframe) {
      return res.status(400).json({ error: 'coin and timeframe required' });
    }

    // Calculate days needed based on timeframe
    // Longer timeframes need more historical data for better analysis
    let daysNeeded = 30;
    if (timeframe >= 1440) { // 1 day
      daysNeeded = 90;
    } else if (timeframe >= 240) { // 4 hours
      daysNeeded = 60;
    }

    // Fetch historical data
    const historicalData = await fetchHistoricalData(coin, daysNeeded);
    
    if (!historicalData || historicalData.length === 0) {
      return res.status(500).json({ error: `Failed to fetch historical data for coin: ${coin}. Make sure coin name is correct (e.g., bitcoin, ethereum).` });
    }

    // Extract prices
    const prices = historicalData.map(d => typeof d === 'object' ? d[1] : d);

    // Calculate technical indicators
    const rsi = calculateRSI(prices, 14);
    const macd = calculateMACD(prices);

    // Analyze dan buat prediksi
    const prediction = analyzePriceMovement(rsi, macd, prices);
    const currentPrice = prices[prices.length - 1];

    // Get AI analysis dengan target price
    const aiAnalysis = await analyzeWithAI(
      coin,
      historicalData,
      rsi[rsi.length - 1],
      macd.macd[macd.macd.length - 1],
      prediction.direction,
      currentPrice,
      timeframe
    );

    res.json({
      coin,
      timeframe,
      rsi: rsi[rsi.length - 1],
      macd: macd.macd[macd.macd.length - 1],
      signal: macd.signal[macd.signal.length - 1],
      currentPrice: currentPrice,
      prediction: prediction.direction, // 'UP' atau 'DOWN'
      confidence: prediction.confidence, // 0-100
      reasoning: prediction.reasoning,
      // NEW: AI Analysis dengan target price
      aiAnalysis: aiAnalysis,
      targetPrice: aiAnalysis.targetPrice,
      priceRange: aiAnalysis.priceRange,
      risk: aiAnalysis.risk,
      recommendation: aiAnalysis.recommendation
    });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Get chart data
app.get('/api/chart/:coin', async (req, res) => {
  try {
    const { coin } = req.params;
    const days = req.query.days || 30;

    const historicalData = await fetchHistoricalData(coin, days);

    if (!historicalData || historicalData.length === 0) {
      return res.status(500).json({ error: 'Failed to fetch chart data' });
    }

    const prices = historicalData.map(d => d[1]);
    const rsiData = calculateRSI(prices, 14);

    res.json({
      timestamps: historicalData.map(d => new Date(d[0]).toISOString()),
      prices: prices,
      rsi: rsiData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
