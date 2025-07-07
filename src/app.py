# Import libraries
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from datetime import date, datetime
from dateutil.relativedelta import relativedelta
import yfinance as yf
import numpy as np
import google.generativeai as genai
import requests
import json
import xml.etree.ElementTree as ET
import re

def strip_html_tags(text):
    """Remove html tags from a string."""
    if not text:
        return ""
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text)

# Get today's date
today = date.today()
dt = today.strftime('%Y-%m-%d')

# Calculate the date 18 months ago
eighteen_months_ago = today - relativedelta(months = 18)

genai.configure(api_key = 'AIzaSyBmjza8QQUlOhGQI5uvaWW3vN-5kAoaFRk')
gemini = genai.GenerativeModel('gemini-2.5-flash')

# Init app
app = Flask(__name__)

# Configure CORS properly
CORS(app, origins = "*")

# Define stock data endpoint
@app.route('/data', methods = ['GET'])
def get_data():
    query = request.args.get('query', '')
    if not query:
        return jsonify({'status': 'error', 'message': 'No query provided'}), 400

    tickers = [i.strip() for i in query.split(',') if i.strip()]

    if not tickers:
        return jsonify({'status': 'error', 'message': 'No tickers provided'}), 400

    all_ports = []

    try:

        for ticker in tickers:

            data = yf.download(ticker, start = eighteen_months_ago, end=today)
            if data.empty:
                continue

            # Flatten multi-index columns if present
            if isinstance(data.columns, pd.MultiIndex):
                data.columns = [i[0] for i in data.columns]

            # Calculate indicators
            data['short'] = data['Close'].rolling(25).mean()
            data['long'] = data['Close'].rolling(50).mean()
            data = data.dropna(subset=['Close'])

            # Signal logic
            data['signal'] = 0
            data.loc[data.index[25:], 'signal'] = np.where(data['short'][25:] > data['long'][25:], 1.0, 0.0)
            data['positions'] = data['signal'].diff().fillna(0)

            # Portfolio calculations
            positions = 1000 * data['signal']
            holdings = positions * data['Close']
            cash = 10000 - (positions.diff().fillna(0) * data['Close']).cumsum()
            total = cash + holdings
            returns = total.pct_change().fillna(0)

            # Build portfolio DataFrame
            port = pd.DataFrame({
                                'Date': data.index,
                                'ticker': ticker,
                                'holdings': holdings,
                                'cash': cash,
                                'total': total,
                                'returns': returns})

            all_ports.append(port.reset_index(drop = True))

        if not all_ports:

            return jsonify({'status': 'success', 'data': []})

        out = pd.concat(all_ports, ignore_index = True)
        out = out.replace([np.inf, -np.inf], np.nan)
        out = out.where(pd.notnull(out), None)

        performance = out.groupby(out.Date).agg({'holdings': 'sum',
                                                 'cash': 'sum',
                                                 'total': 'sum'}).reset_index()
        
        performance.Date = performance['Date'].apply(lambda x: x.strftime("%Y-%m-%d"))
        performance = performance.to_dict(orient = 'records')
                
        return jsonify({'status': 'success', 'out': performance})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

def fetch_news_for_tickers(tickers):

    """Fetch news for the given tickers and return a list of articles."""
    all_articles = []

    for ticker in tickers:

        url = f"https://news.google.com/rss/search?q={ticker}+stock"
        
        try:

            response = requests.get(url, timeout=10)
            response.raise_for_status()
            root = ET.fromstring(response.content)
            items = root.findall('.//item')

            for item in items[:5]:  
                
                description_raw = item.find('description').text if item.find('description') is not None else ""
                description_clean = strip_html_tags(description_raw)
                all_articles.append({
                                       'title': item.find('title').text if item.find('title') is not None else "",
                                          'text': description_clean,
                                         'publishedDate': item.find('pubDate').text if item.find('pubDate') is not None else "",
                                          'symbol': ticker})

        except Exception as e:

            print(f"Error fetching news for {ticker}: {e}")

    return all_articles

def format_news_context(articles):

    """Format articles into a markdown section for context."""
    if not articles:

        return "No recent news articles available.\n"
    
    context = f"You are an expert financial assistant being asked to evaluate the users portfolio which is comprised of the following assets: {tickers}\nHere is some recent news media to provide context- \n"

    for art in articles:
        
        context += (f"- **[{art['title']}]** ({art['symbol']}, {art['publishedDate']}): {art['text']}\n")

    context += "\nBased on this information, please provide your outlook on the health and prospects of the portfolio."

    return context

@app.route('/news', methods=['GET'])
def get_news():

    query = request.args.get('query', '')
    if not query:
        return jsonify({'status': 'error', 'message': 'No ticker(s) provided'}), 400
    tickers = [i.strip() for i in query.split(',') if i.strip()]
    articles = fetch_news_for_tickers(tickers)
    return jsonify({'status': 'success', 'articles': articles})

@app.route('/ask', methods=['POST'])
def ask_model():

    try:

        data = request.get_json()
        prompt = data.get('prompt', '') if data else ''

        if not prompt:

            return jsonify({'status': 'error', 'message': 'No prompt provided'}), 400

        # Call Gemini with the composed prompt
        response = gemini.generate_content(prompt)
        return jsonify({'status': 'success', 'response': response.text, 'formattedPrompt': prompt})
    
    except Exception as e:

        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/quote', methods=['GET'])
def get_quote():

    symbol = request.args.get('symbol')

    if not symbol:

        return jsonify({'status': 'error', 'message': 'No symbol provided'}), 400
    
    url = f'https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=2d&interval=1d'

    try:

        r = requests.get(url, timeout = 8)

        if r.status_code != 200:

            print(f"[Yahoo Error] Status code: {r.status_code}, Body: {r.text[:500]}")
            return jsonify({'status': 'error', 'message': f'Yahoo returned {r.status_code}', 'body': r.text}), 502
        
        try:

            data = r.json()
        
        except Exception as json_err:
        
            print(f"[JSON Error] Could not decode Yahoo response for {symbol}: {json_err}, Body: {r.text[:500]}")
            return jsonify({'status': 'error', 'message': 'Could not decode Yahoo response'}), 500
        
        if data.get("chart", {}).get("error"):
        
            desc = data["chart"]["error"].get("description", "Unknown error from Yahoo")
            print(f"[Yahoo API Error] {desc}")
            return jsonify({'status': 'error', 'message': desc}), 404
        
        return jsonify(data)
    
    except Exception as e:
    
        print(f"[Server Error] Exception for {symbol}: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
    
# Add a test endpoint
@app.route('/health', methods = ['GET'])
def health():
    return jsonify({'status': 'success', 'message': 'Flask server is running!'})

if __name__ == '__main__':
    app.run(debug = True, host = '0.0.0.0', port = 5000)