
import React, { useState } from 'react';
import { Send, TrendingUp, AlertCircle, Plus, X, Loader } from 'lucide-react';

const StockDataProcessor = () => {
  const [tickers, setTickers] = useState(['']);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add new ticker input
  const addTicker = () => {
    setTickers([...tickers, '']);
  };

  // Remove ticker input
  const removeTicker = (index) => {
    if (tickers.length > 1) {
      setTickers(tickers.filter((_, i) => i !== index));
    }
  };

  // Update ticker input
  const updateTicker = (index, value) => {
    const newTickers = [...tickers];
    newTickers[index] = value.toUpperCase();
    setTickers(newTickers);
  };

  // Fetch stock data from Flask backend
  const fetchStockData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Filter out empty tickers
      const validTickers = tickers.filter(ticker => ticker.trim() !== '');
      
      if (validTickers.length === 0) {
        throw new Error('Please add at least one stock ticker');
      }

      // Create query string for Flask backend
      const tickerQuery = validTickers.join(', ');
      const url = `http://localhost:5000/data?query=${encodeURIComponent(tickerQuery)}`;
      
      // Debug logging
      console.log('Attempting to fetch from:', url);
      console.log('Valid tickers:', validTickers);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Success response:', result);
      
      if (result.status === 'success') {
        setStockData(result.data);
      } else {
        throw new Error('Failed to fetch stock data');
      }
      
    } catch (err) {
      console.error('Fetch error:', err);
      
      // More specific error messages
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Unable to connect to Flask server. Make sure it\'s running on http://localhost:5000');
      } else if (err.message.includes('CORS')) {
        setError('CORS error: Flask server needs CORS configuration');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format number to 2 decimal places
  const formatNumber = (num) => {
    return typeof num === 'number' ? num.toFixed(2) : num;
  };

  // Get unique tickers from data
  const getUniqueTickers = () => {
    if (!stockData) return [];
    return [...new Set(stockData.map(item => item.ticker))];
  };

  // Filter data by ticker
  const getDataByTicker = (ticker) => {
    if (!stockData) return [];
    return stockData.filter(item => item.ticker === ticker);
  };

  // Get latest data point for each ticker
  const getLatestData = () => {
    if (!stockData) return [];
    const uniqueTickers = getUniqueTickers();
    return uniqueTickers.map(ticker => {
      const tickerData = getDataByTicker(ticker);
      return tickerData[tickerData.length - 1]; // Get most recent entry
    });
  };

  const renderStockSummary = () => {
    if (!stockData) return null;

    const latestData = getLatestData();

    return (
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Stock Analysis Results</h3>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {latestData.map((data, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-lg text-gray-800">{data.ticker}</h4>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  data.signal === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {data.signal === 1 ? 'BUY' : 'SELL'}
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Close Price:</span>
                  <span className="font-medium">${formatNumber(data.Close)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Volume:</span>
                  <span className="font-medium">{data.Volume?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Short MA (25):</span>
                  <span className="font-medium">${formatNumber(data.short)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Long MA (50):</span>
                  <span className="font-medium">${formatNumber(data.long)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Data Table */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h4 className="font-medium text-gray-700 mb-3">Recent Trading Data</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Ticker</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Close</th>
                  <th className="text-left p-2">Volume</th>
                  <th className="text-left p-2">Short MA</th>
                  <th className="text-left p-2">Long MA</th>
                  <th className="text-left p-2">Signal</th>
                </tr>
              </thead>
              <tbody>
                {stockData.slice(-10).map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{row.ticker}</td>
                    <td className="p-2">{formatDate(row.Date)}</td>
                    <td className="p-2">${formatNumber(row.Close)}</td>
                    <td className="p-2">{row.Volume?.toLocaleString()}</td>
                    <td className="p-2">${formatNumber(row.short)}</td>
                    <td className="p-2">${formatNumber(row.long)}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        row.signal === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {row.signal === 1 ? 'BUY' : 'SELL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Showing last 10 records. Total records: {stockData.length}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <TrendingUp className="h-6 w-6 text-blue-500 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Stock Data Analyzer</h1>
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Enter stock tickers (e.g., AAPL, GOOGL, MSFT) to analyze 18 months of data with moving averages and trading signals.
          </p>
          <button
            onClick={async () => {
              try {
                console.log('Testing connection to Flask server...');
                const response = await fetch('http://localhost:5000/data?query=AAPL');
                console.log('Test response status:', response.status);
                const data = await response.json();
                console.log('Test response data:', data);
                alert('Connection successful! Check console for details.');
              } catch (err) {
                console.error('Connection test failed:', err);
                alert(`Connection failed: ${err.message}`);
              }
            }}
            className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Test Connection
          </button>
        </div>

        {/* Ticker Input Fields */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Stock Tickers</h3>
          <div className="space-y-3">
            {tickers.map((ticker, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Enter ticker symbol (e.g., AAPL)"
                  value={ticker}
                  onChange={(e) => updateTicker(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
                <button
                  onClick={() => removeTicker(index)}
                  disabled={tickers.length === 1}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={addTicker}
            className="mt-3 flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Ticker
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={fetchStockData}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader className="h-5 w-5 mr-2 animate-spin" />
              Fetching Stock Data...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Analyze Stocks
            </>
          )}
        </button>

        {/* Results */}
        {renderStockSummary()}
      </div>
    </div>
  );
};

export default StockDataProcessor;