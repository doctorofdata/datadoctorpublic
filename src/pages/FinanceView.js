import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DashboardFrame from 'components/DashboardFrame';
import ParentComponent from './ParentComponent';
import NewsWidget from './NewsWidget';
import AIChat from './AIChat';
import PromptFormatting from './PromptFormatting';
import StockTicker from './StockTicker';
import { ENDPOINTS, USE_AWS_BACKEND } from '../config/api-config';

async function fetchQuotes(tickers) {
    if (USE_AWS_BACKEND) {
        console.log('[fetchQuotes] Using AWS backend for tickers:', tickers);
        try {
            const response = await fetch(ENDPOINTS.TICKER_FEED, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' 
                },
                body: JSON.stringify({ query: tickers.join(',') }) // Changed from 'tickers' to 'query'
            });
            
            console.log('[fetchQuotes] AWS response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch quotes: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('[fetchQuotes] AWS response data:', data);
            return data;
        } catch (error) {
            console.error('[fetchQuotes] AWS error:', error);
            throw error;
        }
    } else {
        console.log('[fetchQuotes] Using local backend for tickers:', tickers);
        const param = encodeURIComponent(tickers.join(','));
        const url = `${ENDPOINTS.LOCAL.QUOTES}?tickers=${param}`;
        
        console.log('[fetchQuotes] Fetching from local URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch quotes');
        }
        
        const data = await response.json();
        console.log('[fetchQuotes] Local response data:', data);
        return data;
    }
}

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#8c7cf0' },
        secondary: { main: '#03a9f4' },
        background: {
            paper: 'rgba(30, 30, 42, 0.7)',
            default: '#0d1117',
        },
        text: {
            primary: '#e6edf3',
            secondary: '#8b949e',
        },
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"'
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundImage: 'none',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
    },
});

const FinanceView = () => {

    const [currentTickers, setCurrentTickers] = useState([]);
    const [response, setResponse] = useState('');
    const [formattedPrompt, setFormattedPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [quotes, setQuotes] = useState([]);
    const [quotesError, setQuotesError] = useState('');

    useEffect(() => {
        if (!currentTickers.length) return;
        
        console.log('Fetching quotes for:', currentTickers);
        fetchQuotes(currentTickers)
            .then(data => {
                console.log('Quote response:', data);
                if (data.status === 'success') {
                    setQuotes(data.results);
                    setQuotesError('');
                } else {
                    setQuotesError(data.message || "Error fetching quotes");
                    console.error('Error in quote data:', data);
                }
            })
            .catch(err => {
                console.error('Error fetching quotes:', err);
                setQuotesError(err.message);
            });
    }, [currentTickers]);

    const handleTickersChange = (tickers) => {
        setCurrentTickers(tickers);
    };

    const handleAskAI = async () => {
    console.log("Submitting prompt:", formattedPrompt);

    setLoading(true);
    setError('');
    setResponse('');
    
    try {
        console.log(`[handleAskAI] Calling ${ENDPOINTS.SEND_MESSAGE}`);
        
        const res = await fetch(ENDPOINTS.SEND_MESSAGE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: formattedPrompt,
                tickers: currentTickers
            })
        });

        if (!res.ok) {
            throw new Error(`API error! Status: ${res.status}`);
        }

        const rawResult = await res.json();
        console.log('[handleAskAI] Raw response:', rawResult);

        // Handle AWS Lambda proxy integration format if needed
        const result = rawResult.body 
            ? (typeof rawResult.body === 'string' ? JSON.parse(rawResult.body) : rawResult.body)
            : rawResult;

        if (result.status === 'success') {
            setResponse(result.response);
            if (result.formattedPrompt) {
                setFormattedPrompt(result.formattedPrompt);
            }
            setExpanded(true);
        } else {
            setError(result.message || "AI call failed");
            setExpanded(true);
        }
    } catch (error) {
        setError('Failed to get AI response. Please try again.');
        setExpanded(true);
        console.error('Error getting AI response:', error);
    } finally {
        setLoading(false);
    }
};

    return (
        <ThemeProvider theme={darkTheme}>
            <DashboardFrame
                header={'Financial Insights Model'}
                page={
                    <Box
                        sx={{
                            width: '100%',
                            p: 2,
                            display: 'flex !important',
                            flexDirection: 'column !important',
                            alignItems: 'stretch',
                            gap: 2,
                        }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <ParentComponent onTickersChange={handleTickersChange} setFormattedPrompt={setFormattedPrompt} />
                            </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <PromptFormatting prompt={formattedPrompt} />
                            </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <AIChat
                                    onAskAI={handleAskAI}
                                    response={response}
                                    loading={loading}
                                    error={error}
                                    expanded={expanded}
                                    setExpanded={setExpanded}
                                />
                            </Grid>
                        </Grid>

                    </Box>
                }
            />
        </ThemeProvider>
    );
};

export default FinanceView;