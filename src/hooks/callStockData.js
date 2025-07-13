import { ENDPOINTS } from '../config/api-config';

export const callStockData = async (query) => {
  console.log('[callStockData] Calling', ENDPOINTS.STOCK_DATA, 'with query:', query);
  
  try {
    const response = await fetch(ENDPOINTS.STOCK_DATA, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: query }) // Changed from symbols to query to match Lambda
    });
    
    console.log('[callStockData] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('[callStockData] Error response body:', errorText);
      if (response.status === 500) {
        return { 
          status: 'error', 
          message: 'The server encountered an internal error. Please try again later or contact support.',
          details: errorText 
        };
      }
      return { status: 'error', message: `HTTP error! Status: ${response.status}`, details: errorText };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('[callStockData] API error:', error);
    return { status: 'error', message: error.message };
  }
};

export default callStockData;