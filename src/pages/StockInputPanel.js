import React, { useState } from 'react';
import {
    Stack,
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    Alert,
    CircularProgress,
    Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    TrendingUp as TrendingUpIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import ConnectionStatus from './ConnectionStatus';

const SectionHeader = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    color: theme.palette.text.primary,
    marginBottom: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 8,
        backgroundColor: theme.palette.background.default,
        '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.12)',
        },
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
        },
    },
}));

const StockInputPanel = ({ stockData, setStockData, currentTickers, setCurrentTickers }) => {
    const [tickerInput, setTickerInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [backtestLoading, setBacktestLoading] = useState(false);
    const [backtestResult, setBacktestResult] = useState(null);

    // Handle input change
    const handleInputChange = (event) => {
        setTickerInput(event.target.value);
        setError('');
    };

    // Validate tickers (alphanumeric, 1-5 chars)
    const validateTickers = (tickers) => {
        return tickers.filter(ticker => /^[A-Za-z0-9]{1,5}$/.test(ticker));
    };

    // Fetch stock data from Flask backend
    const fetchStockData = async (endpoint = 'data') => {
        if (!tickerInput.trim()) {
            setError('Please enter at least one stock ticker');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const tickers = tickerInput.split(',').map(t => t.trim().toUpperCase());
            const validTickers = validateTickers(tickers);

            if (validTickers.length === 0) {
                setError('Please enter valid stock tickers (e.g., AAPL, GOOGL, MSFT)');
                setLoading(false);
                return;
            }

            const tickerString = validTickers.join(',');
            const response = await fetch(`http://localhost:5000/${endpoint}?query=${encodeURIComponent(tickerString)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'success') {
                setStockData(Array.isArray(data.data) ? data.data : []);
                setCurrentTickers(validTickers);
                setError('');
            } else {
                setStockData([]);
                setCurrentTickers([]);
                setError(data.message || 'Failed to fetch stock data');
            }
        } catch (err) {
            setError(`Error fetching data: ${err.message}`);
            setStockData([]);
            setCurrentTickers([]);
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch backtest results from Flask backend
    const handleBacktest = async () => {
        if (!currentTickers || currentTickers.length === 0) {
            setError('No tickers available for backtesting. Please fetch stock data first.');
            return;
        }

        setBacktestLoading(true);
        setError('');

        try {
            const tickerString = currentTickers.join(',');
            const response = await fetch(`http://localhost:5000/get_data?query=${encodeURIComponent(tickerString)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === 'success') {
                setBacktestResult(result.out || {});
                setError('');
            } else {
                setBacktestResult(null);
                setError(result.message || 'Backtest failed');
            }
        } catch (err) {
            setBacktestResult(null);
            setError(`Backtest error: ${err.message}`);
            console.error('Backtest error:', err);
        } finally {
            setBacktestLoading(false);
        }
    };

    // Clear all fields and results
    const handleClear = () => {
        setTickerInput('');
        setStockData([]);
        setCurrentTickers([]);
        setError('');
        setBacktestResult(null);
    };

    return (
        <StyledPaper elevation={0}>
            <Stack direction="row" alignItems="center" sx={{ width: '100%' }}>
                <SectionHeader
                    variant="h6"
                    sx={{
                        flexGrow: 1,
                        mb: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0,
                    }}
                >
                    <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                    Stock Data Analysis
                </SectionHeader>
                <Box sx={{ ml: 2, flexShrink: 0 }}>
                    <ConnectionStatus />
                </Box>
            </Stack>
            {/* Input Section */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Box sx={{ flexGrow: 1, minWidth: 300 }}>
                    <StyledTextField
                        fullWidth
                        label="Your Portfolio"
                        placeholder="e.g., AAPL, GOOGL, MSFT, TSLA"
                        value={tickerInput}
                        onChange={handleInputChange}
                        disabled={loading || backtestLoading}
                        helperText="Enter your stock tickers separated by commas"
                    />
                </Box>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                        onClick={() => fetchStockData('out')}
                        disabled={loading || backtestLoading}
                        sx={{ whiteSpace: 'nowrap', minWidth: 120 }}
                    >
                        {loading ? 'Loading...' : 'Fetch Data'}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={backtestLoading ? <CircularProgress size={20} /> : <ShowChartIcon />}
                        onClick={handleBacktest}
                        disabled={loading || backtestLoading || !currentTickers || currentTickers.length === 0}
                        sx={{ whiteSpace: 'nowrap', minWidth: 120 }}
                    >
                        {backtestLoading ? 'Testing...' : 'Execute Backtesting'}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={handleClear}
                        disabled={loading || backtestLoading}
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        Clear
                    </Button>
                </Stack>
            </Box>

            {/* Error Display */}
            {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Backtest Success Message */}
            {backtestResult && (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                    Backtesting completed successfully for {currentTickers.join(', ')}!
                </Alert>
            )}
        </StyledPaper>
    );
};

export default StockInputPanel;