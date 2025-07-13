import { ENDPOINTS } from '../config/api-config';

export async function callFetchNews(query) {
    try {
        console.log(`[callFetchNews] Calling ${ENDPOINTS.FETCH_NEWS} with query:`, query);
        
        const response = await fetch(ENDPOINTS.FETCH_NEWS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[callFetchNews] Raw API response:', data);
        
        // The API is already returning the correct format with articles array
        // No need to look for body property or do additional parsing
        if (data && data.status === 'success' && Array.isArray(data.articles)) {
            return data; // Just return the data directly
        }
        
        // Fallback processing if needed
        if (data && Array.isArray(data.out)) {
            return { status: "success", articles: data.out };
        }
        
        if (Array.isArray(data)) {
            return { status: "success", articles: data };
        }
        
        return data || { status: "error", message: "Invalid API response format" };
    } catch (err) {
        console.error('[callFetchNews] API error:', err);
        return { status: "error", message: err.message || String(err) };
    }
}