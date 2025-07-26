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
import { ENDPOINTS, USE_AWS_BACKEND } from '../config/api-config';
import VolatilityChart from './volatilityChart';
import SharpeRatioChart from './sharpeRatio';
import RiskMetricsWidget from './RiskMetricsWidget';
import ModelInsightsTab from './ModelInsightsTab';
import { styled } from '@mui/material/styles';

const HeroImageSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '40vh', // Change height as you prefer
  overflow: 'hidden',
  width: '100%',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("/ai5.png")', // <-- Use your image in public folder
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: 'brightness(0.8) contrast(1.2)',
    zIndex: 1,
  },
}));

// Utility Functions for Metrics
function getPriceHistoryFromPriceObjects(pricesArray) {
    const result = {};
    pricesArray.forEach(item => {
        const ticker = item.ticker || item.symbol || item.Symbol;
        if (!ticker) return;
        const price = item.Close ?? item.close ?? item.price;
        if (typeof price !== 'number' || isNaN(price)) return;
        if (!result[ticker]) result[ticker] = [];
        result[ticker].push(price);
    });
    return result;
}
function calculateReturns(prices) {
    if (!prices || prices.length < 2) return [];
    return prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);
}
function calculateVolatility(returns) {
    if (!returns.length) return 0;
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
    return Math.sqrt(variance) * Math.sqrt(252);
}
function calculateSharpeRatio(returns, riskFreeRate = 0.02) {
    if (!returns.length) return 0;
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length * 252;
    const volatility = calculateVolatility(returns);
    return volatility ? (mean - riskFreeRate) / volatility : 0;
}

const MAX_NEWS_PER_TICKER = 8;

function groupAndLimitArticles(articles, maxPerTicker = 8) {
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
    const [stockPrices, setStockPrices] = useState([]);

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

    const handleStockPrices = (prices) => {
        setStockPrices(prices || []);
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
`You are an expert financial assistant being asked to evaluate the user's portfolio: ${currentTickers.join(', ')}
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

    // === Metrics calculation using price objects from ParentComponent ===
    const pricesByTicker = getPriceHistoryFromPriceObjects(stockPrices);
    const metrics = Object.entries(pricesByTicker).map(([ticker, pricesArr]) => {
        if (!pricesArr || pricesArr.length < 2) return null;
        const returns = calculateReturns(pricesArr);
        const volatility = calculateVolatility(returns);
        const sharpe = calculateSharpeRatio(returns);
        return {
            ticker,
            volatility,
            sharpe,
            prices: pricesArr
        };
    }).filter(Boolean);

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
                            <Grid item xs={12}>
                                <HeroImageSection />
                            </Grid>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <ParentComponent 
                                    onTickersChange={handleTickersChange} 
                                    setFormattedPrompt={setFormattedPrompt}
                                    onStockPrices={handleStockPrices}
                                />
                            </Grid>
                            <Grid item xs = {12}>
                                <RiskMetricsWidget metrics = {metrics}/>
                            </Grid>
                            <Grid item xs={12}>
                                <VolatilityChart metrics={metrics} />
                            </Grid>
                            <Grid item xs={12}>
                                <SharpeRatioChart metrics={metrics} />
                            </Grid>
                            <Grid item xs={12}>
                               <ModelInsightsTab
                                    onAskAI={handleAskAI}
                                    response={response}
                                    loading={loading}
                                    error={error}
                                    expanded={expanded}
                                    setExpanded={setExpanded}
                                    prompt={formattedPrompt}
                                    tickers={currentTickers}
                                    onNewsFetched={handleNewsFetched}
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