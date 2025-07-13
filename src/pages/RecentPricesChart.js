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
    ? num.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    : '-';

// Fix by directly mapping stockData.prices to prices
const RecentPricesChart = ({ stockData, tickers }) => {
  const prices = stockData?.prices || [];

  // If no price data is provided
  if (!Array.isArray(prices) || prices.length === 0) {
    return (
      <Paper sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="body1" color="text.secondary">
          No stock data available to display.
        </Typography>
      </Paper>
    );
  }
  
  // Determine what type of data we have
  const firstItem = prices[0];
  
  // Check if it's stock price data
  const hasStockPriceData = 
    firstItem && 
    ('Close' in firstItem || 'close' in firstItem) && 
    ('ticker' in firstItem || 'symbol' in firstItem || 'Symbol' in firstItem);

  if (!hasStockPriceData) {
    return (
      <Paper sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="body1" color="text.secondary">
          Data format does not match expected stock price data.
        </Typography>
      </Paper>
    );
  }

  // Process stock price data - create a chart for each ticker
  const closeField = 'Close' in firstItem ? 'Close' : 'close';
  const dateField = 'Date' in firstItem ? 'Date' : 'date';
  const tickerField = 'ticker' in firstItem ? 'ticker' : 
                      'symbol' in firstItem ? 'symbol' :
                      'Symbol' in firstItem ? 'Symbol' : 'ticker';
  
  // Group data by ticker
  const pricesByTicker = {};
  prices.forEach(item => {
    const ticker = item[tickerField];
    if (!ticker) return;
    
    if (!pricesByTicker[ticker]) {
      pricesByTicker[ticker] = [];
    }
    pricesByTicker[ticker].push({
      date: item[dateField],
      price: parseFloat(item[closeField])
    });
  });
  
  // Get unique dates across all tickers
  const allDates = new Set();
  Object.values(pricesByTicker).forEach(data => {
    data.forEach(point => allDates.add(point.date));
  });
  
  const sortedDates = Array.from(allDates).sort();
  
  // Create chart datasets for each ticker
  const datasets = Object.entries(pricesByTicker).map(([ticker, data], index) => {
    const dateMap = {};
    data.forEach(point => {
      dateMap[point.date] = point.price;
    });
    
    return {
      label: ticker,
      data: sortedDates.map(date => dateMap[date] || null),
      borderColor: COLORS[index % COLORS.length],
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 0,
      pointHoverRadius: 3
    };
  });
  
  // Format dates for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };
  
  const chartData = {
    labels: sortedDates.map(formatDate),
    datasets: datasets
  };
  
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
          maxTicksLimit: 12
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
        Stock Price History
      </Typography>
      <Box sx={{ height: 400, width: '100%' }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

export default RecentPricesChart;