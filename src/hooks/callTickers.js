import { ENDPOINTS } from '../config/api-config';

export async function callTickers(tickers) {
    try {
        console.log(`[callTickers] Calling ${ENDPOINTS.TICKER_FEED} with tickers:`, tickers);
        
        // Convert comma-separated string to array if needed
        const tickerArray = typeof tickers === 'string' 
            ? tickers.split(',').map(t => t.trim()) 
            : tickers;
            
        const response = await fetch(ENDPOINTS.TICKER_FEED, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json" 
            },
            body: JSON.stringify({ query: tickerArray.join(',') })  // Use "query" parameter instead of "tickers"
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[callTickers] AWS response:', data);
        
        // Handle AWS Lambda proxy integration response format
        let result;
        if (typeof data.body === 'string') {
            try {
                result = JSON.parse(data.body);
            } catch (e) {
                console.error('[callTickers] Failed to parse response body:', e);
                throw new Error('Invalid response from server');
            }
        } else {
            result = data.body || data;
        }
        
        // Transform response to match what StockTicker.js expects
        if (result) {
            // If the response already has a 'results' array, use it
            if (Array.isArray(result.results)) {
                return {
                    status: 'success',
                    results: result.results
                };
            }
            
            // If the response has an 'out' array (like other APIs), transform it
            if (Array.isArray(result.out)) {
                return {
                    status: 'success',
                    results: result.out.map(item => ({
                        ticker: item.ticker || item.symbol,
                        price: item.price || item.Close,
                        change: item.change || 0,
                        percent: item.percent || 0
                    }))
                };
            }
            
            // If the response is itself an array, transform it
            if (Array.isArray(result)) {
                return {
                    status: 'success',
                    results: result.map(item => ({
                        ticker: item.ticker || item.symbol,
                        price: item.price || item.Close,
                        change: item.change || 0,
                        percent: item.percent || 0
                    }))
                };
            }
        }
        
        // If we can't determine a proper response format
        console.error('[callTickers] Unexpected response format:', result);
        return { 
            status: "error", 
            message: "Unexpected response format from server",
            details: result 
        };
    } catch (err) {
        console.error('[callTickers] API error:', err);
        return { status: "error", message: err.message || String(err) };
    }
}