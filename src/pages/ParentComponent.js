import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Paper,
    Typography,
    CircularProgress,
    Stack
} from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import DetailedStockDataWidget from './DetailedStockDataWidget';
import PerformanceChart from './PerformanceChart';
import StockTicker from './StockTicker';
import RecentPricesChart from './RecentPricesChart';
import { callStockData } from '../hooks/callStockData';
import { callFetchNews } from '../hooks/callNews';
import { ENDPOINTS } from '../config/api-config';

const ParentComponent = ({ onTickersChange, setFormattedPrompt, onStockPrices }) => {
    const [data, setData] = useState(null);
    const [chartPrices, setChartPrices] = useState([]);
    const [stockPrices, setStockPrices] = useState([]);
    const [tickers, setTickers] = useState('');
    const [currentTickers, setCurrentTickers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('checking');
    const [news, setNews] = useState([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [newsError, setNewsError] = useState(null);
    const [apiDetails, setApiDetails] = useState({});

    // Connection check, unchanged
    const checkConnection = async () => {
        try {
            console.log('Testing connection to AWS backend...');
            console.log('Checking connection via stock-data endpoint...');
            try {
                const response = await fetch(ENDPOINTS.STOCK_DATA, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query: 'AAPL' })
                });

                setApiDetails({
                    url: ENDPOINTS.STOCK_DATA,
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries([...response.headers.entries()]),
                    timestamp: new Date().toISOString()
                });

                if (response.ok) {
                    setConnectionStatus('connected');
                    return;
                } else {
                    setConnectionStatus('disconnected');
                }
            } catch (fetchError) {
                console.error('Direct fetch error:', fetchError);
            }

            // Fallback to using the hook
            try {
                const stockResult = await callStockData('AAPL');
                if (stockResult && (stockResult.status === 'success' || stockResult.statusCode === 200)) {
                    setConnectionStatus('connected');
                } else {
                    setConnectionStatus('disconnected');
                }
            } catch (hookError) {
                setConnectionStatus('disconnected');
            }
        } catch (error) {
            setApiDetails(prev => ({
                ...prev,
                error: error.toString(),
                timestamp: new Date().toISOString()
            }));
            setConnectionStatus('disconnected');
        }
    };

    useEffect(() => {
        checkConnection();
        const interval = setInterval(checkConnection, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (onTickersChange) {
            onTickersChange(currentTickers);
        }
    }, [currentTickers, onTickersChange]);

    useEffect(() => {
        // Pass price objects up to FinanceView
        if (onStockPrices) {
            onStockPrices(stockPrices || []);
        }
    }, [stockPrices, onStockPrices]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tickers.trim()) return;

        setLoading(true);
        setError(null);
        setData(null);
        setChartPrices([]);
        setStockPrices([]);
        setNews([]);
        setNewsError(null);

        const tickerArray = tickers
            .split(',')
            .map(t => t.trim().toUpperCase())
            .filter(Boolean);

        // 1. Fetch stock data
        try {
            const result = await callStockData(tickers);
            if (result && (result.status === 'success' || result.statusCode === 200)) {
                if (result.out && Array.isArray(result.out)) {
                    setData(result);
                    setChartPrices(result.out);
                    if (result.prices && Array.isArray(result.prices)) {
                        setStockPrices(result.prices);
                        if (onStockPrices) onStockPrices(result.prices); // <-- pass up
                    } else {
                        setStockPrices([]);
                        if (onStockPrices) onStockPrices([]);
                    }
                } else if (result.body) {
                    let bodyData = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
                    if (bodyData.out && Array.isArray(bodyData.out)) {
                        setData(bodyData);
                        setChartPrices(bodyData.out);
                        if (bodyData.prices && Array.isArray(bodyData.prices)) {
                            setStockPrices(bodyData.prices);
                            if (onStockPrices) onStockPrices(bodyData.prices);
                        } else {
                            setStockPrices([]);
                            if (onStockPrices) onStockPrices([]);
                        }
                    } else if (Array.isArray(bodyData)) {
                        setData({ out: bodyData });
                        setChartPrices(bodyData);
                        setStockPrices([]);
                        if (onStockPrices) onStockPrices([]);
                    } else {
                        setError("Received data in unexpected format");
                        setData(null);
                        setChartPrices([]);
                        setStockPrices([]);
                        if (onStockPrices) onStockPrices([]);
                    }
                } else {
                    setError("No data received from server");
                    setData(null);
                    setChartPrices([]);
                    setStockPrices([]);
                    if (onStockPrices) onStockPrices([]);
                }
                setCurrentTickers(tickerArray);
                setConnectionStatus('connected');
            } else {
                setError(result?.message || 'An error occurred');
                setData(null);
                setChartPrices([]);
                setStockPrices([]);
                if (onStockPrices) onStockPrices([]);
            }
        } catch (error) {
            setError(error.message || 'Failed to fetch data. Please try again.');
            setConnectionStatus('disconnected');
            setData(null);
            setChartPrices([]);
            setStockPrices([]);
            if (onStockPrices) onStockPrices([]);
        } finally {
            setLoading(false);
        }

        // 2. Fetch news
        if (tickerArray.length) {
            setNewsLoading(false);
            setNewsError(null);
        }
    }; // <--- Properly close the function here

    return (
        <Box sx={{
            width: '100%',
            p: 0,
            bgcolor: 'background.default'
        }}>
            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: 'none',
                    borderRadius: 1
                }}
            >
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3
                }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: 'text.primary'
                        }}
                    >
                        Stock Portfolio Analysis
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            ml: 1,
                            cursor: 'pointer'
                        }}
                        onClick={() => console.log('API Details:', apiDetails)}
                        title={`AWS Backend ${connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'checking' ? 'Checking...' : 'Disconnected'}\nClick for details`}
                    >
                        <WifiIcon 
                            sx={{ 
                                color: connectionStatus === 'connected' ? '#4caf50' : 
                                      connectionStatus === 'checking' ? '#2196f3' : '#ff9800',
                                animation: connectionStatus === 'checking' ? 'pulse 1.5s infinite' : 'none'
                            }} 
                        />
                    </Box>
                </Box>
                <Paper
                    elevation={0}
                    sx={{
                        mb: 3,
                        p: 2,
                        bgcolor: 'background.default',
                        borderLeft: 4,
                        borderColor: 'primary.main',
                        animation: 'pulse-border 2s infinite',
                        textAlign: 'left'
                    }}
                >
                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                        🚀 Welcome to Your Stock Portfolio Dashboard!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Build, analyze, and visualize your custom stock portfolio in real time.
                    </Typography>
                    <ul style={{
                        color: "#b3b3d7",
                        margin: 0,
                        marginBottom: 4,
                        fontSize: '1rem',
                        paddingLeft: 20
                    }}>
                        <li>
                            <b>Enter one or more stock symbols</b> (e.g., <span style={{ color: "#8c7cf0" }}>AAPL, MSFT, GOOGL</span>) in the box below, separated by commas.
                        </li>
                        <li>
                            Click <b>Analyze</b> to load the latest performance and risk metrics for your selected stocks.
                            <ul>
                                <li>Here we will backtest your portfolio to assess hypothetical returns from the last 18 months of trading</li>
                                <li>To do this, we will use a simple 25 and 50 day short/long trading algorithm to develop signals based on intersections of moving averages</li>
                                <li>Trading is initialized with $10,000 per Investment</li>
                            </ul>
                        </li>
                        <li>
                            View <b>detailed analytics</b> and interactive charts generated just for your portfolio.
                        </li>
                        <li>
                            Connection status is shown live <WifiIcon sx={{ color: '#8c7cf0', fontSize: 16, verticalAlign: 'middle' }} /> — make sure the AWS backend is connected for live data!
                        </li>
                        <li>
                            <span style={{ color: "#00d084", fontWeight: 600 }}>Tip:</span> Try mixing tech, energy, or finance tickers to compare sector performance.
                        </li>
                    </ul>
                    <Typography variant="caption" sx={{ color: 'secondary.main', fontStyle: 'italic' }}>
                        All analysis conducted instantly and securely with no account or signup required!
                    </Typography>
                    <style>
                        {`
                            @keyframes pulse-border {
                                0% { box-shadow: 0 0 0 0 rgba(140, 124, 240, 0.25); }
                                70% { box-shadow: 0 0 0 12px rgba(140, 124, 240, 0.07); }
                                100% { box-shadow: 0 0 0 0 rgba(140, 124, 240, 0.25); }
                            }
                            @keyframes pulse {
                                0% { opacity: 1; }
                                50% { opacity: 0.6; }
                                100% { opacity: 1; }
                            }
                        `}
                    </style>
                </Paper>
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Enter Stock Symbols"
                            value={tickers}
                            onChange={(e) => setTickers(e.target.value)}
                            placeholder="Example: AAPL,MSFT,GOOGL"
                            helperText="Enter stock symbols separated by commas"
                            disabled={loading}
                            sx={{ flexGrow: 1 }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || !tickers.trim()}
                            sx={{ minWidth: '100px', textTransform: 'none', fontWeight: 600 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze'}
                        </Button>
                    </Box>
                </form>
            </Paper>

            {error && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#ffdce0', border: 1, borderColor: '#cb2431', boxShadow: 'none', borderRadius: 1 }}>
                    <Typography color="error">{error}</Typography>
                </Paper>
            )}

            <Box sx={{ mb: 4 }} />
            {data && data.out && (
                <Stack spacing={3}>
                    <DetailedStockDataWidget stockData={data} />
                    <PerformanceChart stockData={data} />
                    <StockTicker tickers={currentTickers} />
                    <RecentPricesChart 
                        prices={data.prices} 
                        stockData={data} 
                        data={data}
                        tickers={currentTickers} 
                    />
                </Stack>
            )}
        </Box>
    );
};

export default ParentComponent;