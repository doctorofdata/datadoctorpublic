import { ENDPOINTS } from '../config/api-config';

/**
 * Fetch news articles from the backend
 * @param {string} query - Search query for news
 */
export async function fetchNews(query) {
  console.log('[fetchNews] Fetching news for query:', query);
  
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
    return data;
  } catch (error) {
    console.error('[fetchNews] Error:', error);
    throw error;
  }
}

/**
 * Send a message to the AI model with optional context
 * @param {string} message - User message
 * @param {Array} context - Optional context documents
 */
export async function sendMessage(message, context = []) {
  console.log('[sendMessage] Sending message with context');
  
  try {
    const response = await fetch(ENDPOINTS.SEND_MESSAGE, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        prompt: message, 
        context: context 
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`);
    }
    
    const data = await response.json();
    return data.body ? 
      (typeof data.body === 'string' ? JSON.parse(data.body) : data.body) : 
      data;
  } catch (error) {
    console.error('[sendMessage] Error:', error);
    throw error;
  }
}

/**
 * Rerank and embed documents based on a query
 * @param {string} query - The query to compare against documents
 * @param {Array} documents - Array of document texts
 */
export async function rerankEmbed(query, documents) {
  console.log('[rerankEmbed] Processing documents');
  
  try {
    const response = await fetch(ENDPOINTS.RERANK_EMBED, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        query: query,
        documents: documents 
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to rerank/embed: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[rerankEmbed] Error:', error);
    throw error;
  }
}

/**
 * Perform cross-encoding between query and documents
 * @param {string} query - The query to compare against documents
 * @param {Array} documents - Array of document texts
 */
export async function crossEncode(query, documents) {
  console.log('[crossEncode] Processing documents');
  
  try {
    const response = await fetch(ENDPOINTS.CROSS_ENCODE, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        query: query,
        documents: documents 
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to cross-encode: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[crossEncode] Error:', error);
    throw error;
  }
}