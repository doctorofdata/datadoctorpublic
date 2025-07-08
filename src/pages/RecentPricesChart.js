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

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
);

const COLORS = [
  '#1e90ff', '#43e97b', '#8c7cf0', '#ff9800', '#e57373', '#00bcd4', '#ffd600'
];

const formatCurrency = (num) =>
  typeof num === 'number'
    ? num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
    : '-';

const RecentPricesChart = ({ prices, tickers }) => {
  if (
    !Array.isArray(prices) ||
    prices.length === 0 ||
    !Array.isArray(tickers) ||
    tickers.length === 0
  ) {
    return null;
  }

  // Normalize tickers to uppercase for matching
  const inputTickers = tickers.map(t => t.toUpperCase());
  const responseTickers = Array.from(new Set(prices.map(r => (r.ticker || '').toUpperCase())));
  const allDates = Array.from(new Set(prices.map(row => row.Date))).sort();

  // Build a lookup: { [ticker]: { [Date]: Close } }
  const priceMap = {};
  inputTickers.forEach(ticker => {
    priceMap[ticker] = {};
  });
  prices.forEach(row => {
    const tickerKey = (row.ticker || '').toUpperCase();
    if (priceMap[tickerKey]) {
      priceMap[tickerKey][row.Date] = typeof row.Close === 'number' ? row.Close : Number(row.Close);
    }
  });

  const datasets = inputTickers.map((ticker, idx) => ({
    label: ticker,
    data: allDates.map(date => {
      const val = priceMap[ticker][date];
      return typeof val === 'number' && !isNaN(val) ? val : null;
    }),
    borderColor: COLORS[idx % COLORS.length],
    backgroundColor: 'rgba(30,144,255,0.07)',
    borderWidth: 2,
    fill: false,
    tension: 0.15,
    pointRadius: 0,
    pointHoverRadius: 3
  }));

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  const labels = allDates.map(formatDate);

  const hasData = datasets.some(ds => ds.data.some(val => typeof val === 'number'));
  if (!hasData) {
    return (
      <Paper sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="body1" color="text.secondary">
          No price data available for the selected assets.
        </Typography>
      </Paper>
    );
  }

  const chartData = { labels, datasets };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#8b949e',
          font: { size: 13, family: '"Inter", sans-serif' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 42, 0.95)',
        titleColor: '#e6edf3',
        bodyColor: '#e6edf3',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: context =>
            `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.1)', drawBorder: false },
        ticks: {
          color: '#8b949e',
          font: { size: 11, family: '"Inter", sans-serif' },
          maxTicksLimit: 18
        }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.1)', drawBorder: false },
        ticks: {
          color: '#8b949e',
          font: { size: 11, family: '"Inter", sans-serif' },
          callback: value => formatCurrency(value)
        }
      }
    },
    interaction: { intersect: false, mode: 'index' }
  };

  return (
    <Paper sx={{
      mt: 2,
      width: '100%',
      border: 1,
      borderColor: 'divider',
      boxShadow: 'none',
      bgcolor: 'background.paper',
      p: 2
    }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          mb: 2,
          fontWeight: 600,
          color: 'text.primary'
        }}
      >
        Asset Pricing History (18 Months)
      </Typography>
      <Box sx={{ height: 400, width: '100%' }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

export default RecentPricesChart;