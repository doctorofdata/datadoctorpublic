import { ENDPOINTS, USE_AWS_BACKEND } from '../config/api-config';

// Function for the fetch-news endpoint
export async function fetchNews(query) {
  console.log('[fetchNews] Fetching news for:', query);
  
  try {
    const response = await fetch(ENDPOINTS.FETCH_NEWS, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify({ query })
    });
    
    console.log('[fetchNews] Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[fetchNews] Response data:', data);
    return data;
  } catch (error) {
    console.error('[fetchNews] Error:', error);
    throw error;
  }
}

// Function for the rerank-embed endpoint
export async function rerankEmbed(content) {
  console.log('[rerankEmbed] Processing content');
  
  try {
    const response = await fetch(ENDPOINTS.RERANK_EMBED, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify(content)
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

// Function for the cross-encode endpoint
export async function crossEncode(content) {
  console.log('[crossEncode] Processing content');
  
  try {
    const response = await fetch(ENDPOINTS.CROSS_ENCODE, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify(content)
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

// Improved function for the send-message endpoint
export async function sendAIMessage(prompt, tickers = []) {
  console.log('[sendAIMessage] Sending prompt:', prompt);
  
  try {
    const response = await fetch(ENDPOINTS.SEND_MESSAGE, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify({ prompt, tickers })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle AWS Lambda proxy integration format if present
    return data.body ? 
      (typeof data.body === 'string' ? JSON.parse(data.body) : data.body) : 
      data;
  } catch (error) {
    console.error('[sendAIMessage] Error:', error);
    throw error;
  }
}