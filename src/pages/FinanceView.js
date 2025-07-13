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

const MAX_NEWS_PER_TICKER = 3;

function groupAndLimitArticles(articles, maxPerTicker = 3) {
    const grouped = {};
    for (const article of articles) {
        let symbol = article.symbol;
        if (!symbol && article.title) {
            const m = article.title.match(/\((\w{1,5})\)/);
            symbol = m ? m[1] : 'UNKNOWN';
        }
        if (!grouped[symbol]) grouped[symbol] = [];
        grouped[symbol].push(article);
    }
    let limited = [];
    for (const arr of Object.values(grouped)) {
        arr.sort((a, b) => new Date(b.publishedDate || b.date) - new Date(a.publishedDate || a.date));
        limited = limited.concat(arr.slice(0, maxPerTicker));
    }
    return limited;
}

async function fetchQuotes(tickers) {
    if (USE_AWS_BACKEND) {
        try {
            const response = await fetch(ENDPOINTS.TICKER_FEED, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' 
                },
                body: JSON.stringify({ query: tickers.join(',') })
            });
            if (!response.ok) throw new Error(`Failed to fetch quotes: ${response.status}`);
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    } else {
        const param = encodeURIComponent(tickers.join(','));
        const url = `${ENDPOINTS.LOCAL.QUOTES}?tickers=${param}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch quotes');
        const data = await response.json();
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
    const [newsArticles, setNewsArticles] = useState([]);

    useEffect(() => {
        if (!currentTickers.length) return;
        fetchQuotes(currentTickers)
            .then(data => {
                if (data.status === 'success') {
                    setQuotes(data.results);
                    setQuotesError('');
                } else {
                    setQuotesError(data.message || "Error fetching quotes");
                }
            })
            .catch(err => {
                setQuotesError(err.message);
            });
    }, [currentTickers]);

    const handleTickersChange = (tickers) => {
        setCurrentTickers(tickers);
    };

    const handleNewsFetched = (articles) => {
        setNewsArticles(articles || []);
    };

    const handleAskAI = async () => {
        const limitedArticles = groupAndLimitArticles(newsArticles, MAX_NEWS_PER_TICKER);
        const contextLines = limitedArticles.map(article =>
            `- ${article.title} (${article.symbol || ''}, ${article.publishedDate || article.date || ''}): ${article.text || ''}`
        );
        const prompt =
`You are an expert financial assistant being asked to evaluate the user's portfolio: ${currentTickers.join(', ')}.
Here is some recent news media to provide context:
${contextLines.join('\n')}
`;
        setFormattedPrompt(prompt);
        setLoading(true);
        setError('');
        setResponse('');
        try {
            const res = await fetch(ENDPOINTS.SEND_MESSAGE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    tickers: currentTickers
                })
            });
            if (!res.ok) throw new Error(`API error! Status: ${res.status}`);
            const rawResult = await res.json();
            const result = rawResult.body 
                ? (typeof rawResult.body === 'string' ? JSON.parse(rawResult.body) : rawResult.body)
                : rawResult;
            if (result.status === 'success') {
                setResponse(result.response);
                if (result.formattedPrompt) setFormattedPrompt(result.formattedPrompt);
                setExpanded(true);
            } else {
                setError(result.message || "AI call failed");
                setExpanded(true);
            }
        } catch (error) {
            setError('Failed to get AI response. Please try again.');
            setExpanded(true);
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
                            <Grid item xs={12}>
                                <NewsWidget tickers={currentTickers} onNewsFetched={handleNewsFetched} />
                            </Grid>
                            <Grid item xs={12}>
                                <AIChat
                                    onAskAI={handleAskAI}
                                    response={response}
                                    loading={loading}
                                    error={error}
                                    expanded={expanded}
                                    setExpanded={setExpanded}
                                />
                                <PromptFormatting prompt={formattedPrompt} />
                            </Grid>
                        </Grid>
                    </Box>
                }
            />
        </ThemeProvider>
    );
};

export default FinanceView;