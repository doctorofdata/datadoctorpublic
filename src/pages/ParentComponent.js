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

const ParentComponent = ({ onTickersChange }) => {
    const [data, setData] = useState(null);
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
            if (result.status === 'success') {
                setData(result);
                const tickerArray = tickers.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
                setCurrentTickers(tickerArray);
                setConnectionStatus('connected');
            } else {
                setError(result.message || 'An error occurred');
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
                </Stack>
            )}
        </Box>
    );
};

export default ParentComponent;