import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Chart({ data, title }) {
  if (!data || !data.prices) {
    return <div className="chart-container">Loading chart...</div>;
  }

  const prices = data.prices;
  const timestamps = data.timestamps;

  // Create a single smooth line chart
  const chartData = {
    labels: timestamps.map(ts => new Date(ts).toLocaleDateString()),
    datasets: [
      {
        label: 'Price (USD)',
        data: prices,
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#00ff88',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        borderWidth: 2.5,
        spanGaps: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: title,
        font: { size: 16, weight: 'bold' },
        color: '#ffffff'
      },
      legend: {
        display: true,
        labels: {
          color: '#b0b0b0',
          usePointStyle: true,
          padding: 15
        }
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price (USD)',
          color: '#b0b0b0'
        },
        ticks: {
          color: '#b0b0b0'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#b0b0b0'
        },
        ticks: {
          color: '#b0b0b0',
          maxTicksLimit: 8
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <Line data={chartData} options={options} />
    </div>
  );
}
