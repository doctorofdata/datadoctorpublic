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
import NewsWidget from './NewsWidget';
import { callStockData } from '../hooks/callStockData';
import { callFetchNews } from '../hooks/callNews';
import { ENDPOINTS } from '../config/api-config';

const ParentComponent = ({ onTickersChange, setFormattedPrompt }) => {
    const [data, setData] = useState(null);
    const [chartPrices, setChartPrices] = useState([]);
    const [stockPrices, setStockPrices] = useState([]); // New state for stock prices
    const [tickers, setTickers] = useState('');
    const [currentTickers, setCurrentTickers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('checking');
    const [news, setNews] = useState([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [newsError, setNewsError] = useState(null);
    const [apiDetails, setApiDetails] = useState({});

    // Modified connection check that uses stock-data endpoint and POST method
    const checkConnection = async () => {
        try {
            console.log('Testing connection to AWS backend...');
            
            // Skip ticker-feed and use stock-data endpoint directly
            console.log('Checking connection via stock-data endpoint...');
            try {
                const response = await fetch(ENDPOINTS.STOCK_DATA, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query: 'AAPL' })
                });
                
                console.log('Raw fetch response:', response);
                console.log('Status:', response.status);
                console.log('Status text:', response.statusText);
                
                // Store API details for debugging
                setApiDetails({
                    url: ENDPOINTS.STOCK_DATA,
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries([...response.headers.entries()]),
                    timestamp: new Date().toISOString()
                });
                
                if (response.ok) {
                    setConnectionStatus('connected');
                    console.log('Connection successful!');
                    return;
                } else {
                    setConnectionStatus('disconnected');
                }
            } catch (fetchError) {
                console.error('Direct fetch error:', fetchError);
            }
            
            // Fallback to using the hook
            console.log('Trying alternative connection test via stock data hook...');
            try {
                const stockResult = await callStockData('AAPL');
                console.log('Stock data hook test result:', stockResult);
                
                if (stockResult && (stockResult.status === 'success' || stockResult.statusCode === 200)) {
                    setConnectionStatus('connected');
                    console.log('Connection established through stock-data hook');
                } else {
                    setConnectionStatus('disconnected');
                    console.log('Connection test failed with stock-data hook');
                }
            } catch (hookError) {
                console.error('Stock data hook error:', hookError);
                setConnectionStatus('disconnected');
            }
        } catch (error) {
            console.error('AWS connection check failed:', error);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tickers.trim()) return;

        setLoading(true);
        setError(null);
        setData(null);
        setChartPrices([]);
        setStockPrices([]); // Clear stock prices
        setNews([]);
        setNewsError(null);

        const tickerArray = tickers
            .split(',')
            .map(t => t.trim().toUpperCase())
            .filter(Boolean);

        // 1. Fetch stock data
        try {
            const result = await callStockData(tickers);
            console.log('Stock data result:', result);
            // Debug the entire response structure
            console.log('API Response Keys:', Object.keys(result));
            console.log('Has prices?', !!result.prices, 'Type:', typeof result.prices);
            console.log('Prices is array?', Array.isArray(result.prices));
            console.log('Prices length:', result.prices?.length);

            if (result && (result.status === 'success' || result.statusCode === 200)) {
                // FIXED: Properly check if data is in result.out or result directly
                if (result.out && Array.isArray(result.out)) {
                    // Store the data properly
                    setData(result);  // Set entire result with { status, out: [...] }
                    setChartPrices(result.out);
                    console.log("Set chart data from result.out:", result.out.length, "items");
                    
                    // Store stock prices separately if available
                    if (result.prices && Array.isArray(result.prices)) {
                        setStockPrices(result.prices);
                        console.log("Set stock prices:", result.prices.length, "items");
                    } else {
                        console.warn("No prices array in API response");
                        setStockPrices([]);
                    }
                } else if (result.body) {
                    // Handle nested response in body (fallback)
                    let bodyData = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
                    
                    if (bodyData.out && Array.isArray(bodyData.out)) {
                        setData(bodyData);
                        setChartPrices(bodyData.out);
                        console.log("Set chart data from result.body.out:", bodyData.out.length, "items");
                        
                        // Check for prices in bodyData
                        if (bodyData.prices && Array.isArray(bodyData.prices)) {
                            setStockPrices(bodyData.prices);
                            console.log("Set stock prices from bodyData:", bodyData.prices.length, "items");
                        }
                    } else if (Array.isArray(bodyData)) {
                        setData({ out: bodyData });
                        setChartPrices(bodyData);
                        console.log("Set chart data from array in body:", bodyData.length, "items");
                    } else {
                        console.error("Unexpected data structure in body:", bodyData);
                        setError("Received data in unexpected format");
                        setData(null);
                        setChartPrices([]);
                        setStockPrices([]);
                    }
                } else {
                    console.error("No usable data found in response:", result);
                    setError("No data received from server");
                    setData(null);
                    setChartPrices([]);
                    setStockPrices([]);
                }
                
                setCurrentTickers(tickerArray);
                setConnectionStatus('connected');
            } else {
                setError(result?.message || 'An error occurred');
                setData(null);
                setChartPrices([]);
                setStockPrices([]);
            }
        } catch (error) {
            setError(error.message || 'Failed to fetch data. Please try again.');
            setConnectionStatus('disconnected');
            setData(null);
            setChartPrices([]);
            setStockPrices([]);
        } finally {
            setLoading(false);
        }

        // 2. Fetch news
        if (tickerArray.length) {
            setNewsLoading(true);
            setNewsError(null);
            let newsResult = null;
            try {
                newsResult = await callFetchNews(tickerArray.join(','));
                console.log('News result:', newsResult);
                
                if (
                    newsResult &&
                    (newsResult.status === 'success' || newsResult.statusCode === 200) &&
                    Array.isArray(newsResult.articles)
                ) {
                    setNews(newsResult.articles);
                    setNewsError(null);
                } else if (newsResult && newsResult.status === 'error') {
                    setNews([]);
                    setNewsError(newsResult.message || 'Failed to fetch news.');
                } else {
                    setNews([]);
                    setNewsError('Failed to fetch news.');
                }
            } catch (err) {
                setNews([]);
                setNewsError('Failed to fetch news: ' + (err.message || err));
            } finally {
                setNewsLoading(false);

                // Always update Model Input Preview
                if (setFormattedPrompt) {
                    const articlesArray = (newsResult && Array.isArray(newsResult.articles)) ? newsResult.articles : [];
                    const context =
                        `You are an expert financial assistant being asked to evaluate the user's portfolio: ${tickerArray.join(', ')}.\n` +
                        (articlesArray.length
                            ? "Here is some recent news media to provide context:\n" +
                                articlesArray.map(art =>
                                    `- ${art.title} (${art.symbol || ''}, ${art.publishedDate || art.published_date || art.date || ''}): ${art.text || art.summary || art.description || ''}`
                                ).join('\n')
                            : "No recent news articles available.\n"
                        );
                    setFormattedPrompt(context);
                }
            }
        }
    };

    // Only show NewsWidget if any news request activity is present
    const showNewsWidget = !!(newsLoading || news.length > 0 || newsError || currentTickers.length > 0);

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

                {/* ---- Welcome Panel ---- */}
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
                {/* ---- End Welcome Panel ---- */}

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

            {showNewsWidget && (
                <NewsWidget
                    tickers={currentTickers}
                    articles={news}
                    loading={newsLoading}
                    error={newsError}
                />
            )}
            <Box sx={{ mb: 4 }} /> {/* This adds space after NewsWidget */}
            {/* Inside the return statement, where you render RecentPricesChart */}
            {data && data.out && (
                    <Stack spacing={3}>
                        <DetailedStockDataWidget stockData={data} />
                        <PerformanceChart stockData={data} />
                        <StockTicker tickers={currentTickers} />
                        
                        {/* Pass data every possible way to ensure it works */}
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