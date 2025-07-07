import React, { useState } from 'react';
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

    const handleTickersChange = (tickers) => {
        setCurrentTickers(tickers);
    };

    const handleAskAI = async () => {

        console.log("Submitting prompt:", formattedPrompt);

        setLoading(true);
        setError('');
        setResponse('');
        try {
            const res = await fetch('http://localhost:5000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: formattedPrompt,
                    tickers: currentTickers
                })
            });

            const result = await res.json();

            if (result.status === 'success') {
                setResponse(result.response);
                setFormattedPrompt(result.formattedPrompt);
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
                                <ParentComponent onTickersChange={handleTickersChange} />
                            </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <StockTicker tickers={currentTickers}/>
                            </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <NewsWidget 
                                    tickers={currentTickers}
                                    setFormattedPrompt={setFormattedPrompt}
                                />
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