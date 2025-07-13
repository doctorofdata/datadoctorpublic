import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    CardActions,
    Chip,
    Link,
    IconButton,
    Alert,
} from '@mui/material';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ENDPOINTS, USE_AWS_BACKEND } from '../config/api-config';

// Direct API call function for fetch-news endpoint
const fetchNewsFromAPI = async (query) => {
    console.log('[fetchNewsFromAPI] Fetching news for query:', query);
    try {
        const response = await fetch(ENDPOINTS.FETCH_NEWS, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ query })
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch news: ${response.status}`);
        }
        const data = await response.json();
        console.log('[fetchNewsFromAPI] Response data:', data);
        // Format response to match expected structure
        return {
            status: data.status || 'success',
            articles: data.articles || data.results || [],
            message: data.message
        };
    } catch (error) {
        console.error('[fetchNewsFromAPI] Error:', error);
        throw error;
    }
};

const NewsWidget = ({ tickers = [], loading = false, error = null, onNewsFetched }) => {
    const [newsData, setNewsData] = useState([]);
    const [isLoading, setIsLoading] = useState(loading || false);
    const [newsError, setNewsError] = useState(error || null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const ITEMS_PER_PAGE = 5;

    const fetchNews = async (tickerList) => {
        console.log('fetchNews called with:', tickerList);

        if (!tickerList || tickerList.length === 0) {
            console.log('No tickers provided');
            setNewsData([]);
            if (onNewsFetched) onNewsFetched([]);
            return;
        }

        setIsLoading(true);
        setNewsError(null);
        setNewsData([]);
        setCurrentIndex(0);

        try {
            let result;
            if (USE_AWS_BACKEND) {
                result = await fetchNewsFromAPI(tickerList.join(','));
            } else {
                const { callFetchNews } = await import('../hooks/callNews');
                result = await callFetchNews(tickerList.join(','));
            }
            console.log('News API result:', result);

            const articlesArray = Array.isArray(result.articles)
                ? result.articles
                : (Array.isArray(result.results) ? result.results : []);
            setNewsData(articlesArray);
            if (onNewsFetched) onNewsFetched(articlesArray);
            if (result.status === 'success' || result.status === 200) {
                setNewsError(null);
            } else {
                setNewsError(result.message || 'Failed to fetch news');
            }
        } catch (err) {
            console.error('Error fetching news:', err);
            setNewsData([]);
            setNewsError(err.message || 'Failed to fetch news');
            if (onNewsFetched) onNewsFetched([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (tickers && tickers.length > 0) {
            fetchNews(tickers);
        } else {
            setNewsData([]);
            setNewsError(null);
            if (onNewsFetched) onNewsFetched([]);
        }
        // eslint-disable-next-line
    }, [tickers]);

    // Remove ALL useEffect related to articles prop!
    // Remove all references to articles prop in parameters and defaultProps!

    useEffect(() => {
        setIsLoading(loading);
    }, [loading]);

    useEffect(() => {
        setNewsError(error);
    }, [error]);

    const formatDate = (dateString) => {
        if (!dateString) return 'No date';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    const truncateText = (text, maxLength = 120) => {
        if (!text) return 'No description available';
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    };

    const handlePrevious = () => setCurrentIndex(prev => Math.max(0, prev - ITEMS_PER_PAGE));
    const handleNext = () => setCurrentIndex(prev => Math.min(newsData.length - ITEMS_PER_PAGE, prev + ITEMS_PER_PAGE));
    const getCurrentItems = () => newsData.slice(currentIndex, currentIndex + ITEMS_PER_PAGE);
    const canGoPrevious = currentIndex > 0;
    const canGoNext = newsData && currentIndex + ITEMS_PER_PAGE < newsData.length;

    if (!tickers.length) {
        return (
            <Paper sx={{ p: 3, bgcolor: 'background.paper', border: 1, borderColor: 'divider', boxShadow: 'none', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <NewspaperIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Stock News
                    </Typography>
                </Box>
                <Typography color="text.secondary">
                    Analyze stocks above to see related news articles.
                </Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ p: 3, bgcolor: 'background.paper', border: 1, borderColor: 'divider', boxShadow: 'none', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NewspaperIcon sx={{ color: 'primary.main', mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Stock News
                        </Typography>
                        {Array.isArray(newsData) && (
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                                ({newsData.length} articles)
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {tickers.map((ticker, index) => (
                            <Chip key={index} label={ticker} size="small" color="primary" variant="outlined" />
                        ))}
                    </Box>
                </Box>

                {isLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={24} sx={{ mr: 2 }} />
                        <Typography color="text.secondary">
                            Loading news for {tickers.join(', ')}...
                        </Typography>
                    </Box>
                )}

                {!isLoading && newsError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {newsError}
                    </Alert>
                )}

                {!isLoading && !newsError && Array.isArray(newsData) && newsData.length === 0 && (
                    <Alert severity="info">
                        No news articles found for {tickers.join(', ')}.
                    </Alert>
                )}

                {!isLoading && !newsError && Array.isArray(newsData) && newsData.length > 0 && (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Showing {currentIndex + 1}-{Math.min(currentIndex + ITEMS_PER_PAGE, newsData.length)} of {newsData.length}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton onClick={handlePrevious} disabled={!canGoPrevious} size="small">
                                    <ChevronLeftIcon />
                                </IconButton>
                                <IconButton onClick={handleNext} disabled={!canGoNext} size="small">
                                    <ChevronRightIcon />
                                </IconButton>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
                            {getCurrentItems().map((article, index) => (
                                <Card 
                                    key={article.url || article.title || (currentIndex + index)}
                                    sx={{
                                        minWidth: 280,
                                        maxWidth: 320,
                                        height: 240,
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}>
                                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                        <Typography variant="subtitle2" component="h3" gutterBottom sx={{
                                            fontWeight: 600,
                                            lineHeight: 1.3,
                                            mb: 1
                                        }}>
                                            {article.title || 'No title available'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {truncateText(article.text || article.summary || article.description)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(article.publishedDate || article.published_date || article.date)}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ p: 1 }}>
                                        {article.url && (
                                            <Link href={article.url} target="_blank" rel="noopener noreferrer" sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                Read More
                                                <OpenInNewIcon sx={{ ml: 0.5, fontSize: '0.9rem' }} />
                                            </Link>
                                        )}
                                    </CardActions>
                                </Card>
                            ))}
                        </Box>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default NewsWidget;