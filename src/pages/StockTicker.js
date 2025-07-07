import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Card, CardContent } from '@mui/material';

const StockTicker = ({ tickers = [] }) => {
  const [prices, setPrices] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tickers.length) {
      setPrices([]);
      setErrors([]);
      return;
    }
    setLoading(true);
    setPrices([]);
    setErrors([]);
    fetch(`http://localhost:5000/quote?tickers=${tickers.join(',')}`)
      .then(res => res.json())
      .then(data => {
        if (data.status !== 'success') {
          setErrors([data.message || 'Failed to fetch stock data.']);
          setPrices([]);
        } else {
          setErrors(data.results.filter(r => r.error).map(r => `${r.ticker}: ${r.error}`));
          setPrices(data.results.filter(r => !r.error));
        }
      })
      .catch(() => {
        setErrors(['Could not connect to backend.']);
        setPrices([]);
      })
      .finally(() => setLoading(false));
  }, [tickers]);

  if (!tickers.length) {
    return (
      <Box sx={{ p: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography color="text.secondary" align="center">
          Select stocks above to view live ticker data.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 1, mb: 2, textAlign: 'center' }}>
        <CircularProgress size={20} /> Loading ticker...
      </Box>
    );
  }

  if (!prices.length && !errors.length) {
    return (
      <Box sx={{ p: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography color="text.secondary" align="center">
          No price data available for the selected stocks.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      bgcolor: 'background.paper',
      borderRadius: 1,
      mb: 2,
      border: 1,
      borderColor: 'divider',
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
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
        ⏱️ Latest 5-Min Pricing
      </Typography>
      
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          gap: 3,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        {prices.map(ticker => (
          <Card
            key={ticker.ticker}
            variant="outlined"
            sx={{
              minWidth: 120,
              maxWidth: 160,
              textAlign: 'center',
              borderRadius: 2,
              borderColor: ticker.change >= 0 ? 'success.main' : 'error.main',
              boxShadow: '0px 2px 8px 0px rgba(29,235,173,0.07)',
              bgcolor: 'background.default',
              transition: 'transform 0.1s',
              '&:hover': {
                transform: 'scale(1.04)',
                boxShadow: '0px 4px 16px 0px rgba(29,235,173,0.15)',
              },
              p: 0,
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="body2" sx={{ fontWeight: 700, letterSpacing: 1, mb: 0.5 }}>
                {ticker.ticker}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: ticker.change >= 0 ? 'success.main' : 'error.main',
                  fontFamily: "'Montserrat', 'Inter', Arial, sans-serif",
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}
              >
                ${ticker.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: ticker.change >= 0 ? 'success.main' : 'error.main',
                  fontWeight: 500,
                  mt: 0.5,
                  display: 'block'
                }}
              >
                {ticker.change >= 0 ? '+' : '-'}
                {Math.abs(ticker.change).toLocaleString(undefined, { maximumFractionDigits: 2 })} (
                {ticker.percent >= 0 ? '+' : '-'}
                {Math.abs(ticker.percent).toLocaleString(undefined, { maximumFractionDigits: 2 })}%)
              </Typography>
            </CardContent>
          </Card>
        ))}
        {errors.length > 0 && (
          <Box sx={{ ml: 2 }}>
            {errors.map((err, idx) =>
              <Alert key={idx} severity="warning" sx={{ mb: 0.5 }}>{err}</Alert>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StockTicker;