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

const ParentComponent = ({ onTickersChange }) => {
    const [data, setData] = useState(null);
    const [chartPrices, setChartPrices] = useState([]);
    const [tickers, setTickers] = useState('');
    const [currentTickers, setCurrentTickers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('checking');

    const checkConnection = async () => {
        try {
            const response = await fetch('http://localhost:5000/health', {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            if (response.ok) {
                setConnectionStatus('connected');
            } else {
                setConnectionStatus('disconnected');
            }
        } catch (error) {
            setConnectionStatus('disconnected');
        }
    };

    useEffect(() => {
        checkConnection();
        const interval = setInterval(checkConnection, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (onTickersChange) {
            onTickersChange(currentTickers);
        }
    }, [currentTickers, onTickersChange]);

    const getConnectionIcon = () => {
        switch (connectionStatus) {
            case 'connected':
                return <WifiIcon sx={{ color: '#4caf50', ml: 1 }} />;
            case 'disconnected':
                return <WifiIcon sx={{ color: '#ff9800', ml: 1 }} />;
            case 'checking':
            default:
                return <WifiIcon sx={{ color: '#ff9800', ml: 1 }} />;
        }
    };

    const getConnectionTooltip = () => {
        switch (connectionStatus) {
            case 'connected':
                return 'Backend Connected';
            case 'disconnected':
                return 'Backend Disconnected';
            case 'checking':
            default:
                return 'Checking Connection...';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tickers.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/data?query=${encodeURIComponent(tickers)}`);
            const result = await response.json();

            const chartRes = await fetch(`http://localhost:5000/charts?query=${encodeURIComponent(tickers)}`);
            const chartJson = await chartRes.json();

            if (result.status === 'success') {
                setData(result);
                const tickerArray = tickers.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
                setCurrentTickers(tickerArray);
                setConnectionStatus('connected');
            } else {
                setError(result.message || 'An error occurred');
            }

            if (chartJson.status === 'success') {
                setChartPrices(Array.isArray(chartJson.prices) ? chartJson.prices : []);
            } else {
                setChartPrices([]);
            }
        } catch (error) {
            setError('Failed to fetch data. Please try again.');
            setConnectionStatus('disconnected');
        } finally {
            setLoading(false);
        }
    };

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
                            cursor: 'pointer'
                        }}
                        title={getConnectionTooltip()}
                    >
                        {getConnectionIcon()}
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
                            Connection status is shown live <WifiIcon sx={{ color: '#8c7cf0', fontSize: 16, verticalAlign: 'middle' }} /> — make sure the backend is connected for live data!
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
                        `}
                    </style>
                </Paper>

                <form onSubmit={handleSubmit}>
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 2,
                        width: '100%'
                    }}>
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
                            disabled={loading || !tickers.trim() || connectionStatus === 'disconnected'}
                            sx={{ 
                                minWidth: '100px',
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze'}
                        </Button>
                    </Box>
                </form>
            </Paper>

            {error && (
                <Paper sx={{ 
                    p: 2, 
                    mb: 3, 
                    bgcolor: '#ffdce0',
                    border: 1,
                    borderColor: '#cb2431',
                    boxShadow: 'none',
                    borderRadius: 1
                }}>
                    <Typography color="error">{error}</Typography>
                </Paper>
            )}

            {data && (
                <Stack spacing={3}>
                    <DetailedStockDataWidget stockData={data} />
                    <PerformanceChart stockData={data} />
                    <StockTicker tickers={currentTickers}/>
                    <RecentPricesChart prices={chartPrices} tickers={currentTickers} />
                </Stack>
            )}
        </Box>
    );
};

export default ParentComponent;