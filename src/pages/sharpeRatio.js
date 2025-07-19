import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const COLOR_PALETTE = [
  '#1e90ff', '#43e97b', '#ffd600', '#e57373', '#a259fa', '#ff6f61', '#009688', '#f06292', '#00bcd4', '#ff9800'
];

function getTickerColors(tickers, colorMap) {
  if (colorMap) {
    return tickers.map((ticker, i) => colorMap[ticker] || COLOR_PALETTE[i % COLOR_PALETTE.length]);
  }
  return tickers.map((_, i) => COLOR_PALETTE[i % COLOR_PALETTE.length]);
}

const SharpeRatioChart = ({ metrics, colorMap }) => {
  if (!metrics || metrics.length === 0) return null;

  const labels = metrics.map(m => m.ticker);
  const dataPoints = metrics.map(m => (isFinite(m.sharpe) ? m.sharpe : null));
  const barColors = getTickerColors(labels, colorMap);

  const data = {
    labels,
    datasets: [
      {
        label: "Sharpe Ratio",
        data: dataPoints,
        backgroundColor: barColors,
        borderColor: barColors,
        borderWidth: 1.5,
        borderRadius: 6,
        maxBarThickness: 40,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 42, 0.95)',
        titleColor: '#e6edf3',
        bodyColor: '#e6edf3',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: context => `Sharpe Ratio: ${context.parsed.y?.toFixed(3)}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.1)', drawBorder: false },
        ticks: { color: '#8b949e', font: { size: 12, family: '"Inter", sans-serif' } }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.1)', drawBorder: false },
        ticks: { color: '#8b949e', font: { size: 12, family: '"Inter", sans-serif' } }
      }
    },
    interaction: { intersect: false, mode: 'index' }
  };

  return (
    <Paper sx={{ mt: 2, width: '100%', border: 1, borderColor: 'divider', boxShadow: 'none', bgcolor: 'background.paper', p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
        Sharpe Ratio
      </Typography>
      <Box sx={{ height: 320, width: '100%' }}>
        <Bar data={data} options={options} />
      </Box>
    </Paper>
  );
};

export default SharpeRatioChart;