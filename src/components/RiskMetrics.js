import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function calculateReturns(prices) {
  if (!prices || prices.length < 2) return [];
  return prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
}
function std(arr) {
  if (!arr.length) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}
function sharpeRatio(returns, riskFreeRate = 0) {
  if (!returns.length) return 0;
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  const volatility = std(returns);
  return volatility === 0 ? 0 : ((avg - riskFreeRate) / volatility) * Math.sqrt(252);
}
const formatPercent = value => (value * 100).toFixed(2) + '%';

export default function RiskMetricsChart({ prices = [], dates = [] }) {
  if (!prices.length || !dates.length) return null;
  const returns = calculateReturns(prices);
  const volatility = std(returns) * Math.sqrt(252);
  const sharpe = sharpeRatio(returns);

  // Rolling volatility for chart
  const window = 21;
  const rollingVolatility = returns.map((_, i, arr) =>
    i < window ? null : std(arr.slice(i - window, i)) * Math.sqrt(252)
  );

  const chartData = {
    labels: dates.slice(1),
    datasets: [
      {
        label: 'Rolling Volatility (Annualized)',
        data: rollingVolatility,
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255,152,0,0.12)',
        borderWidth: 2,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (ctx) => `${formatPercent(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#8b949e', font: { size: 12 } },
      },
      y: {
        ticks: {
          color: '#8b949e',
          font: { size: 12 },
          callback: (value) => formatPercent(value),
        },
      },
    },
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Risk Metrics
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          <b>Annualized Volatility:</b> {formatPercent(volatility)}
        </Typography>
        <Typography variant="body1">
          <b>Sharpe Ratio:</b> {sharpe.toFixed(2)}
        </Typography>
      </Box>
      <Box sx={{ width: '100%', height: 300 }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
}
