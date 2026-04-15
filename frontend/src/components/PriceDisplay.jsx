import React from 'react';

export default function PriceDisplay({ coin, prices }) {
  const getCoinData = () => {
    const coinMap = {
      'dogecoin': 'dogecoin',
      'shiba-inu': 'shiba-inu',
      'bitcoin': 'bitcoin',
      'ethereum': 'ethereum',
    };
    
    const mappedCoin = coinMap[coin] || coin;
    return prices[mappedCoin];
  };

  const coinData = getCoinData();

  if (!coinData) {
    return (
      <div className="price-display">
        <div className="price-card">
          <h2>{coin.replace('-', ' ').toUpperCase()}</h2>
          <div className="price-loading">
            <span>⏳ Fetching price data...</span>
            <p className="text-small">Coin may not be available or API limit reached</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="price-display">
      <div className="price-card">
        <h2>{coin.replace('-', ' ').toUpperCase()}</h2>
        <div className="price-main">
          ${coinData.usd.toFixed(6)}
        </div>
        <div className="price-idr">
          Rp {(coinData.usd * 16100).toLocaleString('id-ID', {maximumFractionDigits: 0})}
        </div>
        <div className="price-info">
          <div className="price-item">
            <span>Market Cap</span>
            <strong>${(coinData.usd_market_cap / 1e9).toFixed(2)}B</strong>
          </div>
          <div className="price-item">
            <span>24h Volume</span>
            <strong>${(coinData.usd_24h_vol / 1e9).toFixed(2)}B</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
