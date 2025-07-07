import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const StockTicker = ({ tickers }) => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tickers || tickers.length === 0) {
      setPrices([]);
      return;
    }
    setLoading(true);
    Promise.all(
      tickers.map(symbol =>
        fetch(`http://localhost:5000/quote?symbol=${symbol}`)
          .then(res => res.json())
          .then(data => {
            // Log the full data for debugging
            // console.log(symbol, data);

            const d = data.chart?.result?.[0];
            if (!d) return null;

            const closes = d.indicators?.quote?.[0]?.close;
            if (!Array.isArray(closes) || closes.length < 2) return null;

            // Find most recent valid prices (sometimes nulls at the end)
            const validPrices = closes
              .map((price, idx) => ({ price, idx }))
              .filter(item => item.price != null);
            if (validPrices.length < 2) return null;

            const price = validPrices[validPrices.length - 1].price;
            const prevIdx = validPrices[validPrices.length - 2].idx;
            const prev = closes[prevIdx];
            if (price == null || prev == null) return null;

            const change = price - prev;
            const percent = prev !== 0 ? (change / prev) * 100 : 0;
            return { symbol, price, change, percent };
          })
          .catch(() => null)
      )
    ).then(res => {
      setPrices(res.filter(Boolean));
      setLoading(false);
    });
  }, [tickers]);

  if (!tickers || tickers.length === 0) {
    return (
      <Box sx={{ p: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography color="text.secondary">
          Select stocks above to view live ticker data.
        </Typography>
      </Box>
    );
  }
  if (loading) return <Box sx={{ p: 1, mb: 2 }}><CircularProgress size={20} /> Loading ticker...</Box>;
  if (!prices.length && !loading) {
    return (
      <Box sx={{ p: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography color="text.secondary">
          No price data available for the selected stocks.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      bgcolor: 'background.paper',
      display: 'flex',
      overflowX: 'auto',
      p: 1,
      borderRadius: 1,
      mb: 2,
      gap: 3,
      border: 1,
      borderColor: 'divider'
    }}>
      {prices.map(ticker => (
        <Box key={ticker.symbol} sx={{ minWidth: 120 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {ticker.symbol}
          </Typography>
          <Typography variant="body1" sx={{ color: ticker.change >= 0 ? 'success.main' : 'error.main' }}>
            ${ticker.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            <span style={{ fontSize: 12 }}>
              {ticker.change >= 0 ? '+' : '-'}{Math.abs(ticker.change).toLocaleString(undefined, { maximumFractionDigits: 2 })} ({ticker.percent >= 0 ? '+' : '-'}{Math.abs(ticker.percent).toLocaleString(undefined, { maximumFractionDigits: 2 })}%)
            </span>
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default StockTicker;