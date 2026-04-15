import React from 'react';

export default function AnalysisPanel({ analysis, timeframe }) {
  const isUpward = analysis.prediction === 'UP';
  
  // Konversi USD ke IDR (16,100 IDR per USD)
  const usdToIDR = (usd) => (usd * 16100);
  const formatIDR = (value) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      maximumFractionDigits: 0 
    }).format(value);
  };

  return (
    <div className="analysis-panel">
      <h3>📈 Analysis Result - {timeframe} Minute Prediction</h3>
      
      <div className={`prediction-box ${isUpward ? 'upward' : 'downward'}`}>
        {/* Prediction Header */}
        <div className="prediction-header">
          <span className="prediction-direction">
            {isUpward ? '📈 PRICE UP' : '📉 PRICE DOWN'}
          </span>
          <span className="confidence-badge">
            {analysis.confidence}% Confidence
          </span>
        </div>

        {/* Technical Indicators - Grid Layout */}
        <div className="analysis-grid">
          <div className="analysis-item">
            <span className="analysis-label">RSI (14)</span>
            <span className={`analysis-value ${getRSIStatus(analysis.rsi)}`}>
              {analysis.rsi.toFixed(2)}
            </span>
          </div>
          <div className="analysis-item">
            <span className="analysis-label">MACD</span>
            <span className="analysis-value">{analysis.macd.toFixed(6)}</span>
          </div>
          <div className="analysis-item">
            <span className="analysis-label">Current Price</span>
            <span className="analysis-value">${analysis.currentPrice.toFixed(8)}</span>
          </div>
          <div className="analysis-item">
            <span className="analysis-label">Signal Line</span>
            <span className="analysis-value">{analysis.signal?.toFixed(6) || 'N/A'}</span>
          </div>
        </div>

        {/* Analysis Reasoning */}
        <div className="reasoning">
          <h4>💡 Analysis Reasoning:</h4>
          <p>{analysis.reasoning}</p>
        </div>

        {/* AI Analysis with Target Price */}
        {analysis.aiAnalysis && (
          <div className="ai-analysis">
            <h4>🤖 AI Market Analysis:</h4>
            <p>{analysis.aiAnalysis.analysis}</p>
            
            {/* Target Price Explanation */}
            {analysis.aiAnalysis.reasoning && (
              <div className="target-reasoning">
                <h5>💹 Alasan Target Harga:</h5>
                <p>{analysis.aiAnalysis.reasoning}</p>
              </div>
            )}

            {/* Target Price Grid with IDR Conversion */}
            <div className="target-grid">
              <div className="target-item">
                <span className="target-label">🎯 Target Price</span>
                <div className="price-converter">
                  <span className="target-value">${analysis.targetPrice?.toFixed(8) || 'N/A'}</span>
                  <span className="idr-value">{formatIDR(usdToIDR(analysis.targetPrice))}</span>
                </div>
              </div>
              {analysis.priceRange && (
                <>
                  <div className="target-item">
                    <span className="target-label">Min Price</span>
                    <div className="price-converter">
                      <span className="target-value">${analysis.priceRange.min?.toFixed(8) || 'N/A'}</span>
                      <span className="idr-value">{formatIDR(usdToIDR(analysis.priceRange.min))}</span>
                    </div>
                  </div>
                  <div className="target-item">
                    <span className="target-label">Max Price</span>
                    <div className="price-converter">
                      <span className="target-value">${analysis.priceRange.max?.toFixed(8) || 'N/A'}</span>
                      <span className="idr-value">{formatIDR(usdToIDR(analysis.priceRange.max))}</span>
                    </div>
                  </div>
                </>
              )}
              <div className="target-item">
                <span className="target-label">Risk Level</span>
                <span className={`target-value risk-${analysis.risk?.toLowerCase()}`}>
                  {analysis.risk || 'N/A'}
                </span>
              </div>
              <div className="target-item">
                <span className="target-label">Recommendation</span>
                <span className={`target-value rec-${analysis.recommendation?.toLowerCase()}`}>
                  {analysis.recommendation || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="disclaimer">
          <strong>⚠️ Disclaimer:</strong> This is AI-based technical analysis. 
          Always do your own research and never trade with more than you can afford to lose.
        </div>
      </div>
    </div>
  );
}

function getRSIStatus(rsi) {
  if (rsi < 30) return 'oversold';
  if (rsi > 70) return 'overbought';
  return 'neutral';
}
