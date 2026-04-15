# Crypto Market Analyzer

Aplikasi web untuk analisis real-time market crypto dengan prediksi harga berbasis technical analysis.

## 🎯 Features

✅ **Real-time Crypto Price Chart** - Menampilkan chart harga 30 hari terakhir  
✅ **Technical Indicators** - RSI (Relative Strength Index) dan MACD (Moving Average Convergence Divergence)  
✅ **Price Prediction** - Prediksi harga naik/turun untuk timeframe 5, 10, 15, 30, 60 menit  
✅ **Multiple Coins** - Support untuk Dogecoin, Shiba Inu, dan mudah untuk menambah coin lain  
✅ **Beautiful UI** - Modern dark theme dengan gradient background  
✅ **Responsive Design** - Bekerja optimal di desktop, tablet, dan mobile  

## 📋 Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **Axios** - HTTP client untuk fetch data dari CoinGecko API
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **Chart.js** + **React-ChartJS-2** - Interactive charts
- **CSS3** - Custom styling dengan gradient dan animations

### Data Source
- **CoinGecko API** - Free cryptocurrency price data (no API key required)

## 🚀 Quick Start

### 1. Setup Backend

```bash
cd backend
npm install
npm start
```

Server akan run di `http://localhost:5000`

### 2. Setup Frontend (Terminal baru)

```bash
cd frontend
npm install
npm start
```

App akan terbuka di `http://localhost:3000`

## 📖 Cara Pakai

1. **Pilih Coin** - Klik button Dogecoin atau Shiba Inu
2. **Lihat Chart** - Dashboard menampilkan 30 hari chart terakhir
3. **Pilih Timeframe** - Pilih 5, 10, 15, 30, atau 60 menit
4. **Klik Analyze** - Sistem akan menganalisis dengan technical indicators
5. **Baca Hasil** - Lihat prediksi (UP/DOWN) dengan confidence percentage

## 🔧 API Endpoints

### GET `/api/prices`
Fetch current prices untuk semua coins

Response:
```json
{
  "dogecoin": {
    "usd": 0.123,
    "usd_market_cap": 17500000000,
    "usd_24h_vol": 500000000
  },
  "shiba-inu": { ... }
}
```

### GET `/api/chart/:coin?days=30`
Fetch historical price data untuk chart

Response:
```json
{
  "timestamps": ["2024-03-15T00:00:00Z", ...],
  "prices": [0.1234, 0.1235, ...],
  "rsi": [45.23, 48.12, ...]
}
```

### POST `/api/analyze`
Analyze coin dengan technical indicators

Request:
```json
{
  "coin": "dogecoin",
  "timeframe": 5
}
```

Response:
```json
{
  "coin": "dogecoin",
  "timeframe": 5,
  "rsi": 65.5,
  "macd": 0.0025,
  "signal": 0.0020,
  "currentPrice": 0.1234,
  "prediction": "UP",
  "confidence": 75,
  "reasoning": "RSI neutral-bullish (50-70); MACD above signal line - bullish; ..."
}
```

## 📊 Technical Indicators

### RSI (Relative Strength Index)
- Mengukur strength dari price movement
- Range: 0-100
- **< 30** = Oversold (potential buy signal)
- **> 70** = Overbought (potential sell signal)
- **30-70** = Normal range

### MACD (Moving Average Convergence Divergence)
- Trend-following momentum indicator
- Dihasilkan dari difference antara 12-period dan 26-period EMA
- Dibandingkan dengan signal line (9-period EMA dari MACD)

## ⚙️ Customization

### Menambah Coin Baru

1. Edit `backend/server.js` - Update CoinGecko API call dengan coin ID baru
2. Edit `frontend/src/App.jsx` - Tambah coin ke array `coins`

Contoh CoinGecko coin IDs: `bitcoin`, `ethereum`, `cardano`, `ripple`, dll
(Lihat https://api.coingecko.com/api/v3/coins/list)

### Mengubah Technical Indicators

Edit `backend/indicators.js` untuk:
- Mengubah RSI period (default: 14)
- Mengubah MACD periods (default: 12, 26, 9)
- Menambah indicator baru (misalnya: Bollinger Bands, Stochastic)

## 🐛 Troubleshooting

### CORS Error
- Pastikan backend running di port 5000
- Check file `backend/server.js` - CORS sudah enabled

### API Rate Limit
- CoinGecko API memiliki rate limit untuk free tier
- Jika error, tunggu beberapa menit sebelum retry
- Data di-cache selama 1 menit untuk mengurangi API calls

### Chart tidak muncul
- Pastikan chart data sudah di-fetch (lihat console)
- Check React DevTools untuk state `chartData`

## 📝 License

MIT License - Feel free to use untuk project personal maupun commercial

## 🤝 Support

Untuk pertanyaan atau issue, buat issue baru di repository!

---

**Happy Trading! 🚀 Tapi ingat: Always DYOR (Do Your Own Research)** 📚
