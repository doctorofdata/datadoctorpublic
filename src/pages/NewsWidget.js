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

const NewsWidget = ({ tickers, setFormattedPrompt }) => {
    const [newsData, setNewsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const ITEMS_PER_PAGE = 5;

    const fetchNews = async (tickerList) => {
        console.log('fetchNews called with:', tickerList);

        if (!tickerList || tickerList.length === 0) {
            console.log('No tickers provided');
            if (setFormattedPrompt) setFormattedPrompt('');
            return;
        }

        setLoading(true);
        setError(null);
        setNewsData(null);
        setCurrentIndex(0);

        try {
            const tickerString = Array.isArray(tickerList) ? tickerList.join(',') : tickerList;
            const url = `http://localhost:5000/news?query=${encodeURIComponent(tickerString)}`;

            console.log('Fetching from URL:', url);

            const response = await fetch(url);
            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('API Result:', result);

            if (result.status === 'success') {
                console.log('Setting news data:', result.articles);
                setNewsData(Array.isArray(result.articles) ? result.articles : []);
                // Set formattedPrompt here after fetching news
                const context =
                    `You are an expert financial assistant being asked to evaluate the user's portfolio which is comprised of the following assets: ${tickerList.join(', ')}.\n` +
                    (result.articles && result.articles.length
                        ? "Here is some recent news media to provide context:\n" +
                          result.articles.map(art =>
                            `- ${art.title} (${art.symbol}, ${art.publishedDate}): ${art.text}`
                          ).join('\n')
                        : "No recent news articles available.\n"
                    )
                if (setFormattedPrompt) setFormattedPrompt(context);
            } else {
                console.log('API error:', result.message);
                setError(result.message || 'API returned error status');
                setNewsData([]); // Ensure it's always an array
                if (setFormattedPrompt) setFormattedPrompt("No recent news articles available.\nUser Question:\n");
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setError(`Failed to fetch news: ${error.message}`);
            setNewsData([]);
            if (setFormattedPrompt) setFormattedPrompt("Error fetching news.\nUser Question:\n");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('NewsWidget useEffect - tickers:', tickers);
        if (tickers && Array.isArray(tickers) && tickers.length > 0) {
            fetchNews(tickers);
        } else {
            setNewsData(null);
            setError(null);
            setCurrentIndex(0);
            if (setFormattedPrompt) setFormattedPrompt('');
        }
        // eslint-disable-next-line
    }, [tickers]);

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

    const handlePrevious = () => {
        setCurrentIndex(prev => Math.max(0, prev - ITEMS_PER_PAGE));
    };

    const handleNext = () => {
        if (newsData) {
            setCurrentIndex(prev => Math.min(newsData.length - ITEMS_PER_PAGE, prev + ITEMS_PER_PAGE));
        }
    };

    const getCurrentItems = () => {
        if (!newsData || !Array.isArray(newsData)) return [];
        return newsData.slice(currentIndex, currentIndex + ITEMS_PER_PAGE);
    };

    const canGoPrevious = currentIndex > 0;
    const canGoNext = newsData && currentIndex + ITEMS_PER_PAGE < newsData.length;

    console.log('Render state:', { tickers, loading, error, newsData: newsData?.length });

    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
        return (
            <Paper sx={{
                p: 3,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                boxShadow: 'none',
                borderRadius: 1
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2
                }}>
                    <NewspaperIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: 'text.primary'
                        }}
                    >
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
            <Paper sx={{
                p: 3,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                boxShadow: 'none',
                borderRadius: 1
            }}>
                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 3
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NewspaperIcon sx={{ color: 'primary.main', mr: 1 }} />
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                color: 'text.primary'
                            }}
                        >
                            Stock News
                        </Typography>
                        {newsData && Array.isArray(newsData) && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ ml: 2 }}
                            >
                                ({newsData.length} articles)
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {tickers.map((ticker, index) => (
                            <Chip
                                key={index}
                                label={ticker}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </Box>

                {/* Loading State */}
                {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={24} sx={{ mr: 2 }} />
                        <Typography color="text.secondary">
                            Loading news for {tickers.join(', ')}...
                        </Typography>
                    </Box>
                )}

                {/* Error State */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Debug Info */}
                <Box sx={{ mb: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                     {/* <Typography variant="caption" color="text.secondary">
                        Debug: tickers={JSON.stringify(tickers)} | loading={loading.toString()} | 
                        error={error || 'none'} | newsData={newsData ? `${newsData.length} items` : 'null'}
                    </Typography> */}
                </Box>

                {/* News Content */}
                {!loading && newsData && (
                    <>
                        {!Array.isArray(newsData) ? (
                            <Alert severity="warning">
                                News data is not in expected format. Type: {typeof newsData}
                            </Alert>
                        ) : newsData.length === 0 ? (
                            <Alert severity="info">
                                No news articles found for {tickers.join(', ')}.
                            </Alert>
                        ) : (
                            <>
                                {/* Navigation */}
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 2
                                }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Showing {currentIndex + 1}-{Math.min(currentIndex + ITEMS_PER_PAGE, newsData.length)} of {newsData.length}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton
                                            onClick={handlePrevious}
                                            disabled={!canGoPrevious}
                                            size="small"
                                        >
                                            <ChevronLeftIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={handleNext}
                                            disabled={!canGoNext}
                                            size="small"
                                        >
                                            <ChevronRightIcon />
                                        </IconButton>
                                    </Box>
                                </Box>

                                {/* News Cards */}
                                <Box sx={{
                                    display: 'flex',
                                    gap: 2,
                                    overflowX: 'auto',
                                    pb: 1
                                }}>
                                    {getCurrentItems().map((article, index) => (
                                        <Card
                                            key={currentIndex + index}
                                            sx={{
                                                minWidth: 280,
                                                maxWidth: 320,
                                                height: 240,
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    component="h3"
                                                    gutterBottom
                                                    sx={{
                                                        fontWeight: 600,
                                                        lineHeight: 1.3,
                                                        mb: 1
                                                    }}
                                                >
                                                    {article.title || 'No title available'}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mb: 2 }}
                                                >
                                                    {truncateText(article.text || article.summary || article.description)}
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {formatDate(article.publishedDate || article.published_date || article.date)}
                                                </Typography>
                                            </CardContent>

                                            <CardActions sx={{ p: 1 }}>
                                                {article.url && (
                                                    <Link
                                                        href={article.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600
                                                        }}
                                                    >
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
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default NewsWidget;