// Set to true to use AWS backend
export const USE_AWS_BACKEND = true;

// Base URL for all API endpoints
const API_BASE_URL = 'https://xb48gamgjg.execute-api.us-east-1.amazonaws.com/prod/v1';

export const ENDPOINTS = {
  
  // All endpoints now use the same base URL pattern
  STOCK_DATA: `${API_BASE_URL}/stock-data`,
  TICKER_FEED: `${API_BASE_URL}/ticker-feed`,
  FETCH_NEWS: `${API_BASE_URL}/fetch-news`,
  SEND_MESSAGE: `${API_BASE_URL}/send-message`,
  RERANK_EMBED: `${API_BASE_URL}/rerank-embed`,
  CROSS_ENCODE: `${API_BASE_URL}/cross-encode`,
  
  // Local fallbacks for development
  LOCAL: {
    QUOTES: 'http://localhost:5000/quotes',
    DATA: 'http://localhost:5000/data',
    NEWS: 'http://localhost:5000/news'
  }
};