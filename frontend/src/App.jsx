import React, { useState, useEffect } from 'react';
import './App.css';
import Chart from './components/Chart';
import AnalysisPanel from './components/AnalysisPanel';
import PriceDisplay from './components/PriceDisplay';

function App() {
  const [selectedCoin, setSelectedCoin] = useState('dogecoin');
  const [timeframe, setTimeframe] = useState(5);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState({});
  const [chartData, setChartData] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [favorites] = useState([
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
    { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'SHIB' },
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  ]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch prices on mount
  useEffect(() => {
    fetchPrices();
    fetchChartData();
    const interval = setInterval(fetchPrices, 60000); // Refresh setiap 1 menit
    return () => clearInterval(interval);
  }, []);

  // Fetch chart data when coin changes
  useEffect(() => {
    fetchChartData();
  }, [selectedCoin]);

  const fetchPrices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/prices`);
      const data = await response.json();
      setPrices(data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chart/${selectedCoin}?days=30`);
      const data = await response.json();
      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coin: selectedCoin,
          timeframe: timeframe,
        }),
      });
      
      const data = await response.json();
      if (data.prediction) {
        setAnalysis(data);
      } else if (data.error) {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error analyzing:', error);
      alert('Error analyzing data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCoin = (coinId) => {
    setSelectedCoin(coinId);
    setSearchInput('');
  };

  const coins = [
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
    { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'SHIB' }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>📊 Crypto Market Analyzer</h1>
        <p>Real-time technical analysis with price predictions</p>
      </header>

      <main className="app-main">
        {/* Sidebar Controls */}
        <aside className="control-panel">
          <section className="control-section">
            <h3>Search Coin</h3>
            <input
              type="text"
              placeholder="e.g., bitcoin, ethereum..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="coin-search-input"
            />
            <p className="search-hint">Favorites:</p>
            <div className="coin-selector">
              {favorites.map(coin => (
                <button
                  key={coin.id}
                  className={`coin-button ${selectedCoin === coin.id ? 'active' : ''}`}
                  onClick={() => handleSelectCoin(coin.id)}
                >
                  <strong>{coin.symbol}</strong>
                  <span>{coin.name}</span>
                </button>
              ))}
            </div>
            {searchInput && (
              <button 
                className="search-button"
                onClick={() => handleSelectCoin(searchInput.toLowerCase().replace(/\s+/g, '-'))}
              >
                🔍 Search: {searchInput}
              </button>
            )}
          </section>

          <section className="control-section">
            <h3>Select Timeframe</h3>
            <div className="timeframe-selector">
              {[5, 10, 15, 30, 60, 240, 1440].map(mins => (
                <button
                  key={mins}
                  className={`timeframe-button ${timeframe === mins ? 'active' : ''}`}
                  onClick={() => setTimeframe(mins)}
                >
                  {mins === 1440 ? '1 day' : mins === 240 ? '4h' : `${mins} min`}
                </button>
              ))}
            </div>
          </section>

          <button 
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : '🔍 Analyze'}
          </button>
        </aside>

        {/* Main Content */}
        <section className="content">
          <PriceDisplay 
            coin={selectedCoin}
            prices={prices}
          />
          
          {chartData && (
            <Chart 
              data={chartData}
              title={`${selectedCoin.toUpperCase()} - 30 Days`}
            />
          )}

          {analysis && (
            <AnalysisPanel 
              analysis={analysis}
              timeframe={timeframe}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
